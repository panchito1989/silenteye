/**
 * SilentEye — prueba E2E de la alerta de "nuevo registro".
 * Crea un usuario de prueba (dispara notifyAdminNewUser → correo al admin),
 * espera a que salga el correo, y BORRA el usuario de prueba. Idempotente y
 * autolimpiante: no deja basura en la base.
 *
 * Uso (prod, tras deploy):  node dist/scripts/test-admin-alert.js
 */
import { pool } from '../db/pool.js';
import { logger } from '../utils/logger.js';
import { findOrCreateUser } from '../api/auth.js';

const TEST_PHONE = '+520000000777';

async function main(): Promise<void> {
  // Limpia cualquier resto de una corrida anterior.
  await pool.query('DELETE FROM users WHERE phone = $1', [TEST_PHONE]);

  logger.info('[TEST] creando usuario de prueba (dispara alerta al admin)…');
  const u = await findOrCreateUser(TEST_PHONE, 'PRUEBA — alerta (se borra sola)', 'citizen', 'prueba-alerta@silenteye.test');
  logger.info(`[TEST] usuario creado id=${u.id} — esperando envío del correo de alerta…`);

  // notifyAdminNewUser es fire-and-forget; darle tiempo a completar el SMTP.
  await new Promise((r) => setTimeout(r, 8000));

  const del = await pool.query('DELETE FROM users WHERE phone = $1', [TEST_PHONE]);
  logger.info(`[TEST] usuario de prueba borrado (filas=${del.rowCount}). Fin.`);
  await pool.end();
  process.exit(0);
}

main().catch((err) => { logger.error('[TEST] error:', err); process.exit(1); });
