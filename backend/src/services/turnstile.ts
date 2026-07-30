/**
 * SilentEye — Cloudflare Turnstile verification.
 *
 * Anti-bot check for anonymous, abuse-prone endpoints (OTP request, login).
 * Fully optional: if TURNSTILE_SECRET_KEY is absent, verifyTurnstile() returns
 * true and nothing is blocked — so the code can ship before the key is set.
 * Once the secret is configured it fails CLOSED (a missing/invalid token is
 * rejected), which is why the frontend must always send a token when the
 * public site key is present.
 */
import { logger } from '../utils/logger.js';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function isTurnstileEnabled(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}

export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;                       // not configured → skip
  if (!token || typeof token !== 'string') return false;
  try {
    const form = new URLSearchParams();
    form.append('secret', secret);
    form.append('response', token);
    if (ip) form.append('remoteip', ip);
    const r = await fetch(VERIFY_URL, { method: 'POST', body: form });
    const data = (await r.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (data.success !== true) {
      logger.warn(`[turnstile] rechazado, error-codes=${JSON.stringify(data['error-codes'] || [])}`);
    }
    return data.success === true;
  } catch (err) {
    logger.warn('turnstile verify failed:', err);
    return false;                                 // fail closed when enabled
  }
}
