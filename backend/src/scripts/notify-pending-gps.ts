/**
 * SilentEye — recordatorio a usuarios con vehículo registrado pero SIN GPS
 * conectado (0 posiciones recibidas). Les recuerda que solo falta apuntar
 * su GPS a nuestro servidor, o comprarlo ya configurado con nosotros.
 *
 * SEGURIDAD (para no mandar correos por accidente):
 *   - Dry-run por defecto: solo lista a quién se enviaría, NO envía.
 *   - Para enviar de verdad: NOTIFY_CONFIRM=send
 *   - Allowlist OBLIGATORIA: NOTIFY_EMAILS='a@x.com,b@y.com' — solo esos
 *     correos reciben. Sin allowlist no se envía nada (aunque CONFIRM=send).
 *
 * Uso (en prod, tras deploy):
 *   node dist/scripts/notify-pending-gps.js                      # dry-run: lista pendientes
 *   NOTIFY_EMAILS='a@x.com,b@y.com' NOTIFY_CONFIRM=send \
 *     node dist/scripts/notify-pending-gps.js                    # envía solo a esos
 */
import { pool } from '../db/pool.js';
import { logger } from '../utils/logger.js';
import { sendEmail, isEmailEnabled, escapeHtml } from '../services/email-service.js';

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://silenteye.com.mx';
const WHATSAPP = 'https://wa.me/525610669353?text=' + encodeURIComponent('Hola, quiero conectar mi GPS a SilentEye o comprar uno ya configurado.');
const GPS_HOST = 'gps.silenteye.com.mx';

interface Pending { name: string; email: string; plate: string; }

function buildEmail(name: string, plate: string): { subject: string; html: string } {
  const safeName = escapeHtml(name || 'Hola');
  const safePlate = escapeHtml(plate || '');
  return {
    subject: 'Tu SilentEye está a un paso — solo falta conectar tu GPS 🛰️',
    html: `
      <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#18181b">
        <div style="background:#18181b;color:#fff;padding:22px 24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:19px">SilentEye — casi listo</h1>
        </div>
        <div style="border:1px solid #e4e4e7;border-top:none;padding:24px;border-radius:0 0 12px 12px">
          <p style="font-size:16px;margin:0 0 14px">Hola ${safeName},</p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
            Ya tienes tu cuenta${safePlate ? ` y tu vehículo <strong>${safePlate}</strong>` : ''} en SilentEye. Solo falta
            <strong>un paso</strong> para que tu vehículo quede protegido y rastreado en tiempo real:
            conectar tu GPS.
          </p>
          <div style="background:#f4f4f5;border-radius:10px;padding:16px 18px;margin:0 0 16px">
            <p style="font-size:14px;font-weight:600;margin:0 0 6px">1) ¿Ya tienes GPS?</p>
            <p style="font-size:14px;line-height:1.6;margin:0">
              Apúntalo a nuestro servidor:<br>
              <code style="background:#fff;border:1px solid #e4e4e7;border-radius:6px;padding:2px 8px;font-size:14px">${GPS_HOST}</code>, puerto <strong>5000</strong>.<br>
              Te guiamos paso a paso aquí:
              <a href="${SITE_URL}/setup" style="color:#2563eb;font-weight:600">Configurar mi GPS →</a>
            </p>
          </div>
          <div style="background:#f4f4f5;border-radius:10px;padding:16px 18px;margin:0 0 20px">
            <p style="font-size:14px;font-weight:600;margin:0 0 6px">2) ¿No tienes GPS o prefieres no configurar nada?</p>
            <p style="font-size:14px;line-height:1.6;margin:0">
              Nosotros te lo vendemos <strong>ya configurado y listo para usar</strong>. Escríbenos y te lo dejamos funcionando.
            </p>
          </div>
          <p style="margin:0 0 22px">
            <a href="${WHATSAPP}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:9px">Hablar por WhatsApp</a>
          </p>
          <p style="font-size:13px;color:#71717a;line-height:1.6;margin:0">
            Con tu GPS conectado obtienes rastreo en vivo, botón de pánico y una red de respuesta que difunde tu
            ubicación al instante ante una emergencia. Estamos para ayudarte a dejarlo funcionando.
          </p>
          <p style="font-size:13px;color:#71717a;margin:18px 0 0">— Equipo SilentEye</p>
        </div>
      </div>`,
  };
}

async function main(): Promise<void> {
  const confirm = process.env.NOTIFY_CONFIRM === 'send';
  const allow = (process.env.NOTIFY_EMAILS || '')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

  // Usuarios (no admin) con vehículo registrado pero SIN posiciones GPS.
  const { rows } = await pool.query<Pending>(
    `SELECT DISTINCT ON (u.id) u.name, LOWER(u.email) AS email, v.plate
     FROM users u
     JOIN vehicles v ON (v.driver_id = u.id OR v.owner_id = u.id)
     WHERE u.role <> 'admin'
       AND u.email IS NOT NULL
       AND POSITION('@' IN u.email) > 1
       AND NOT EXISTS (SELECT 1 FROM gps_logs g WHERE g.imei = v.imei)
     ORDER BY u.id, v.created_at`,
  );

  logger.info(`Pendientes de conectar GPS (con correo): ${rows.length}`);
  for (const r of rows) logger.info(`  · ${r.name} <${r.email}> placa=${r.plate}`);

  if (!confirm) {
    logger.info('DRY-RUN (no se envió nada). Para enviar: NOTIFY_EMAILS="..." NOTIFY_CONFIRM=send');
    await pool.end();
    return;
  }
  if (allow.length === 0) {
    logger.error('NOTIFY_CONFIRM=send pero NOTIFY_EMAILS está vacío. Por seguridad no se envía a nadie. Aborta.');
    await pool.end();
    process.exit(1);
    return;
  }
  if (!isEmailEnabled()) {
    logger.error('SMTP no configurado (isEmailEnabled=false). No se puede enviar.');
    await pool.end();
    process.exit(1);
    return;
  }

  const targets = rows.filter((r) => allow.includes(r.email));
  const skipped = allow.filter((e) => !rows.some((r) => r.email === e));
  if (skipped.length) logger.warn(`En allowlist pero NO son usuarios pendientes (se omiten): ${skipped.join(', ')}`);

  let sent = 0;
  for (const r of targets) {
    const { subject, html } = buildEmail(r.name, r.plate);
    const ok = await sendEmail(r.email, subject, html);
    if (ok) { sent++; logger.info(`✓ enviado a ${r.email}`); }
    else logger.warn(`✗ falló envío a ${r.email}`);
  }
  logger.info(`Recordatorios enviados: ${sent}/${targets.length}`);
  await pool.end();
}

main().catch((err) => { logger.error('notify-pending-gps error:', err); process.exit(1); });
