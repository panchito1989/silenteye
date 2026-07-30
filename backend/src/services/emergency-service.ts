/**
 * SilentEye — Emergency-contact notifications.
 *
 * When a user is in danger (panic / SOS / crash) — and again when they are
 * safe — this notifies the people they registered as emergency contacts, with
 * their name, a live-location map link and the time.
 *
 * Channel: email today (SMTP). SMS / WhatsApp drop in at the marked spot below
 * once a provider (e.g. Twilio) is configured — the contact list already
 * carries phone + notify_sms for that.
 */
import { pool } from '../db/pool.js';
import { logger } from '../utils/logger.js';
import { sendEmail, isEmailEnabled, escapeHtml } from './email-service.js';
import { isSmsEnabled, isWhatsAppEnabled, sendSms, sendWhatsApp } from './sms-service.js';

export type EmergencyPhase = 'triggered' | 'resolved';

export interface EmergencyNotifyParams {
  driverUserId: string | null | undefined;
  latitude?: number | null;
  longitude?: number | null;
  phase: EmergencyPhase;
}

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://silenteye.com.mx';

function buildEmail(phase: EmergencyPhase, personName: string, contactName: string, mapUrl: string | null, time: string) {
  const safePerson = escapeHtml(personName);
  const safeContact = escapeHtml(contactName || '');
  const locationBlock = mapUrl
    ? `<p style="margin:16px 0"><a href="${mapUrl}" style="background:#dc2626;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;display:inline-block">📍 Ver ubicación en el mapa</a></p>`
    : '';

  if (phase === 'triggered') {
    return {
      subject: `🚨 ALERTA de emergencia — ${personName}`,
      html: `
        <div style="font-family:system-ui,Arial,sans-serif;max-width:520px;margin:0 auto;color:#18181b">
          <div style="background:#dc2626;color:#fff;padding:20px;border-radius:12px 12px 0 0">
            <h1 style="margin:0;font-size:20px">🚨 Alerta de emergencia</h1>
          </div>
          <div style="border:1px solid #e4e4e7;border-top:none;padding:20px;border-radius:0 0 12px 12px">
            <p style="font-size:16px">Hola ${safeContact},</p>
            <p style="font-size:16px"><strong>${safePerson}</strong> activó una <strong>alerta de emergencia</strong> en SilentEye.</p>
            <p style="color:#71717a">Hora: ${time}</p>
            ${locationBlock}
            <p style="color:#71717a;font-size:13px;margin-top:20px">Te llega este aviso porque ${safePerson} te registró como contacto de emergencia. Si crees que corre peligro, contáctalo y, de ser necesario, llama al 911.</p>
          </div>
        </div>`,
    };
  }
  return {
    subject: `✅ ${personName} está a salvo — emergencia resuelta`,
    html: `
      <div style="font-family:system-ui,Arial,sans-serif;max-width:520px;margin:0 auto;color:#18181b">
        <div style="background:#047857;color:#fff;padding:20px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:20px">✅ Situación resuelta</h1>
        </div>
        <div style="border:1px solid #e4e4e7;border-top:none;padding:20px;border-radius:0 0 12px 12px">
          <p style="font-size:16px">Hola ${safeContact},</p>
          <p style="font-size:16px">La alerta de emergencia de <strong>${safePerson}</strong> fue marcada como <strong>resuelta</strong>. Está a salvo.</p>
          <p style="color:#71717a">Hora: ${time}</p>
          <p style="color:#71717a;font-size:13px;margin-top:20px">Aviso de seguimiento de SilentEye.</p>
        </div>
      </div>`,
  };
}

/** Short plain-text message for SMS / WhatsApp. */
function buildText(phase: EmergencyPhase, personName: string, mapUrl: string | null, time: string): string {
  if (phase === 'triggered') {
    return `🚨 SilentEye: ${personName} activó una alerta de emergencia.${mapUrl ? ` Ubicación: ${mapUrl}` : ''} Hora: ${time}. Si crees que corre peligro, contáctalo o llama al 911.`;
  }
  return `✅ SilentEye: ${personName} está a salvo, la emergencia fue resuelta. Hora: ${time}.`;
}

/**
 * Notify a user's emergency contacts. Best-effort: never throws, never blocks
 * the caller (messages are fired async).
 */
export async function notifyEmergencyContacts(p: EmergencyNotifyParams): Promise<void> {
  try {
    if (!p.driverUserId) return;

    const contactsRes = await pool.query(
      `SELECT ec.name, ec.email, ec.phone, ec.notify_email, ec.notify_sms, u.name AS person_name
       FROM emergency_contacts ec
       JOIN users u ON u.id = ec.user_id
       WHERE ec.user_id = $1`,
      [p.driverUserId],
    );
    if (contactsRes.rows.length === 0) return;

    const personName = contactsRes.rows[0].person_name || 'Tu familiar';
    const mapUrl = p.latitude != null && p.longitude != null
      ? `https://www.google.com/maps?q=${p.latitude},${p.longitude}`
      : `${SITE_URL}`;
    const time = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

    let sent = 0;
    for (const c of contactsRes.rows) {
      // ── Email channel (active) ──
      if (c.notify_email && c.email && isEmailEnabled()) {
        const { subject, html } = buildEmail(p.phase, personName, c.name, mapUrl, time);
        sendEmail(c.email, subject, html).catch((e) => logger.warn('[EMERGENCY] email failed:', e));
        sent++;
      }
      // ── SMS / WhatsApp channel ──
      if (c.notify_sms && c.phone && (isWhatsAppEnabled() || isSmsEnabled())) {
        const text = buildText(p.phase, personName, mapUrl, time);
        if (isWhatsAppEnabled()) { sendWhatsApp(c.phone, text).catch((e) => logger.warn('[EMERGENCY] whatsapp failed:', e)); sent++; }
        if (isSmsEnabled()) { sendSms(c.phone, text).catch((e) => logger.warn('[EMERGENCY] sms failed:', e)); sent++; }
      }
    }
    logger.info(`[EMERGENCY] ${p.phase}: notified ${sent} contact(s) for user ${p.driverUserId}`);
  } catch (err) {
    logger.warn('[EMERGENCY] notifyEmergencyContacts failed:', err);
  }
}
