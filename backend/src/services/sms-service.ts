import twilio from 'twilio';
import { logger } from '../utils/logger.js';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';
// WhatsApp sender, e.g. sandbox 'whatsapp:+14155238886' or a prod WA number.
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || '';

let client: ReturnType<typeof twilio> | null = null;

export function isSmsEnabled(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

function getClient() {
  if (!client) {
    if (!isSmsEnabled()) {
      throw new Error('Twilio no está configurado. Define TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_PHONE_NUMBER.');
    }
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return client;
}

/**
 * Send OTP code via SMS (Twilio). Only used for admin users.
 * Phone must include country code (e.g. +525610669353).
 */
export async function sendOtpSms(phone: string, code: string): Promise<boolean> {
  if (!isSmsEnabled()) {
    logger.warn('SMS deshabilitado: Twilio no configurado');
    return false;
  }

  // Ensure phone has + prefix for international format
  const to = phone.startsWith('+') ? phone : `+52${phone}`;

  try {
    const message = await getClient().messages.create({
      body: `SilentEye: Tu código de verificación es ${code}. Válido por 10 minutos.`,
      from: TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(`SMS OTP enviado a ***${phone.slice(-4)} sid=${message.sid}`);
    return true;
  } catch (err) {
    logger.error(`Error enviando SMS a ***${phone.slice(-4)}:`, err);
    return false;
  }
}

export function isWhatsAppEnabled(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM);
}

/** Normalize to E.164; assume Mexico (+52) when no country code is given. */
function toE164(phone: string): string {
  const p = phone.trim();
  if (p.startsWith('+')) return p;
  const digits = p.replace(/\D/g, '');
  return `+52${digits}`;
}

/** Generic SMS. Returns false (never throws) when disabled or on error. */
export async function sendSms(phone: string, body: string): Promise<boolean> {
  if (!isSmsEnabled()) return false;
  try {
    const msg = await getClient().messages.create({ body, from: TWILIO_PHONE_NUMBER, to: toE164(phone) });
    logger.info(`SMS enviado a ***${phone.slice(-4)} sid=${msg.sid}`);
    return true;
  } catch (err) {
    logger.warn(`Error SMS a ***${phone.slice(-4)}:`, err);
    return false;
  }
}

/** WhatsApp message via Twilio. Returns false (never throws) when disabled/error. */
export async function sendWhatsApp(phone: string, body: string): Promise<boolean> {
  if (!isWhatsAppEnabled()) return false;
  try {
    const msg = await getClient().messages.create({ body, from: TWILIO_WHATSAPP_FROM, to: `whatsapp:${toE164(phone)}` });
    logger.info(`WhatsApp enviado a ***${phone.slice(-4)} sid=${msg.sid}`);
    return true;
  } catch (err) {
    logger.warn(`Error WhatsApp a ***${phone.slice(-4)}:`, err);
    return false;
  }
}
