/**
 * SilentEye — alta masiva de una flota (fleet_owner + N vehículos).
 *
 * Pensado para dar de alta clientes comerciales como Pacma: crea (o
 * actualiza) al dueño de flota y registra todos sus GPS de una sola vez.
 * Registrar el IMEI ANTES de reconfigurar el GPS es obligatorio: la
 * whitelist del servidor TCP rechaza cualquier IMEI que no exista en la
 * tabla `vehicles` (los tres protocolos — Teltonika, Concox/GT06 y
 * Queclink — cierran la conexión de un IMEI no registrado).
 *
 * Entrada:
 *   - Datos del dueño: constantes OWNER abajo (o variables de entorno
 *     FLEET_OWNER_NAME / _PHONE / _EMAIL / _PLAN).
 *   - Lista de vehículos: CSV en scripts/data/pacma-fleet.csv con encabezado
 *     `plate,imei,name` (una fila por unidad; el IMEI son 15 dígitos).
 *   - Contraseña del dueño (opcional): env FLEET_OWNER_PASSWORD. Si no se
 *     da, el usuario queda sin contraseña y Christian la fija luego en
 *     "Mi perfil" o el admin la asigna; el login también puede ser por OTP.
 *
 * Idempotente: el dueño se hace upsert por teléfono; cada vehículo por
 * IMEI. Re-correrlo con la lista actualizada no duplica nada.
 *
 * Uso:
 *   npm run onboard:fleet                 # usa el CSV por defecto
 *   FLEET_CSV=otra.csv npm run onboard:fleet
 *   FLEET_OWNER_PASSWORD='...' npm run onboard:fleet
 *
 * Requiere: migración 013_fleet_owner.sql (owner_id) y 017_user_plan.sql (plan).
 */
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db/pool.js';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Datos del dueño de flota (edítalos o pásalos por env) ──────────────
const OWNER = {
  name: process.env.FLEET_OWNER_NAME || 'Pacma — Lenny',
  phone: process.env.FLEET_OWNER_PHONE || '+525610669353', // reemplazar por el real de Lenny
  email: process.env.FLEET_OWNER_EMAIL || 'lenny@pacma.mx',
  plan: process.env.FLEET_OWNER_PLAN || 'flotillas', // 'flotillas' = hasta 999 unidades
};

interface FleetRow { plate: string; imei: string; name: string; }

/** Parser CSV mínimo: encabezado plate,imei,name; ignora vacíos y comentarios (#). */
function parseCsv(text: string): FleetRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  if (lines.length === 0) return [];
  const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
  const iPlate = header.indexOf('plate');
  const iImei = header.indexOf('imei');
  const iName = header.indexOf('name');
  if (iPlate < 0 || iImei < 0) {
    throw new Error('El CSV debe tener encabezado con columnas "plate" e "imei" (y opcional "name").');
  }
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    return {
      plate: cols[iPlate] || '',
      imei: cols[iImei] || '',
      name: (iName >= 0 ? cols[iName] : '') || '',
    };
  });
}

async function onboard(): Promise<void> {
  const csvPath = process.env.FLEET_CSV
    ? (process.env.FLEET_CSV.includes('/') || process.env.FLEET_CSV.includes('\\')
        ? process.env.FLEET_CSV
        : join(__dirname, 'data', process.env.FLEET_CSV))
    : join(__dirname, 'data', 'pacma-fleet.csv');

  let rows: FleetRow[];
  try {
    rows = parseCsv(readFileSync(csvPath, 'utf-8'));
  } catch (err) {
    logger.error(`No pude leer/parsear el CSV en ${csvPath}: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
    return;
  }

  // Validación previa (no toca la DB si algo está mal formado).
  const valid: FleetRow[] = [];
  const problems: string[] = [];
  const seenImei = new Set<string>();
  const seenPlate = new Set<string>();
  for (const r of rows) {
    if (!/^\d{15}$/.test(r.imei)) { problems.push(`IMEI inválido (deben ser 15 dígitos): "${r.imei}" (placa ${r.plate || '—'})`); continue; }
    if (!r.plate) { problems.push(`Falta placa para IMEI ${r.imei}`); continue; }
    if (seenImei.has(r.imei)) { problems.push(`IMEI duplicado en el CSV: ${r.imei}`); continue; }
    if (seenPlate.has(r.plate)) { problems.push(`Placa duplicada en el CSV: ${r.plate}`); continue; }
    seenImei.add(r.imei); seenPlate.add(r.plate);
    valid.push(r);
  }

  if (problems.length) {
    logger.warn(`Filas con problemas (${problems.length}) — se omiten:`);
    for (const p of problems) logger.warn(`  · ${p}`);
  }
  if (valid.length === 0) {
    logger.error('No hay filas válidas para dar de alta. Revisa el CSV.');
    process.exit(1);
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Upsert del dueño de flota (por teléfono) ──
    const pwd = process.env.FLEET_OWNER_PASSWORD;
    const passwordHash = pwd && pwd.length >= 8 ? await bcrypt.hash(pwd, 12) : null;
    const ownerRes = await client.query(
      `INSERT INTO users (phone, name, role, email, plan, password_hash)
       VALUES ($1, $2, 'fleet_owner', $3, $4, $5)
       ON CONFLICT (phone) DO UPDATE SET
         name = EXCLUDED.name,
         role = 'fleet_owner',
         email = EXCLUDED.email,
         plan = EXCLUDED.plan,
         password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
         updated_at = NOW()
       RETURNING id`,
      [OWNER.phone, OWNER.name, OWNER.email, OWNER.plan, passwordHash],
    );
    const ownerId = ownerRes.rows[0].id as string;
    logger.info(`Dueño de flota listo: ${OWNER.name} (${OWNER.phone}) plan=${OWNER.plan} id=${ownerId}`);

    // ── Upsert de vehículos (por IMEI), asignados a este dueño ──
    let inserted = 0, updated = 0;
    const failed: string[] = [];
    for (const r of valid) {
      try {
        const res = await client.query(
          `INSERT INTO vehicles (plate, name, imei, owner_id)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (imei) DO UPDATE SET
             plate = EXCLUDED.plate,
             name = COALESCE(NULLIF(EXCLUDED.name, ''), vehicles.name),
             owner_id = EXCLUDED.owner_id
           RETURNING (xmax = 0) AS is_insert`,
          [r.plate, r.name, r.imei, ownerId],
        );
        if (res.rows[0].is_insert) inserted++; else updated++;
      } catch (err) {
        // Causa típica: la placa ya existe en OTRO IMEI (placa es única).
        failed.push(`${r.plate} / ${r.imei}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    if (failed.length) {
      logger.warn(`Vehículos que fallaron (${failed.length}):`);
      for (const f of failed) logger.warn(`  · ${f}`);
      // Si algo falló, no dejamos a medias: revertimos para que Christian
      // corrija el CSV y vuelva a correr sobre un estado limpio.
      await client.query('ROLLBACK');
      logger.error('Se revirtió TODO por los errores de arriba. Corrige el CSV y vuelve a correr.');
      process.exit(1);
      return;
    }

    await client.query('COMMIT');
    logger.info(`✓ Alta completa: ${inserted} nuevos, ${updated} actualizados (total ${valid.length}) para ${OWNER.name}.`);
    logger.info('Los IMEIs ya están en la whitelist: los GPS pueden reconfigurarse a gps.silenteye.com.mx:5000.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    logger.error('Error en el alta de flota (se revirtió):', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

onboard();
