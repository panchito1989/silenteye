/**
 * SilentEye — Plataforma de Seguridad Vehicular
 * Copyright (c) 2026 Christian Fiesco. All rights reserved.
 * PROPRIETARY AND CONFIDENTIAL — See LICENSE file for details.
 *
 * Cobán GPS103 Parser — TK103, TK303, GPS103 y clones con firmware original
 * Protocolo de texto, mensajes separados por ';':
 *   Login:      ##,imei:359586015829802,A;            → servidor responde "LOAD"
 *   Heartbeat:  359586015829802;                      → servidor responde "ON"
 *   Posición:   imei:359586015829802,tracker,0809231929,13554900601,F,112909.397,A,2234.4669,N,11354.3287,E,0.11,;
 *               imei, tipo/alarma, fecha yymmddhhmm, teléfono, F|L, hora UTC hhmmss.sss,
 *               A|V, lat ddmm.mmmm, N|S, lng dddmm.mmmm, E|W, velocidad (nudos), rumbo, ...
 * Normaliza a AVLRecord para el mismo pipeline que Teltonika/Concox/Queclink.
 */

import type { AVLRecord } from './avl-decoder.js';
import { logger } from '../utils/logger.js';

export interface Gps103Parsed {
  imei: string;
  /** 'login' | 'heartbeat' | palabra clave del reporte ('tracker', 'help me', 'speed', ...) */
  messageType: string;
  records: AVLRecord[];
  needsAck: boolean;
  ackResponse: string | null;
  raw: string;
}

/* ── Mapeo de alarmas GPS103 → convención Teltonika (priority / eventIoId) ── */
const IO_IGNITION = 78;
interface AlarmMap { priority: number; eventIoId: number; isPanic?: boolean; ignition?: 0 | 1 }
const ALARM_MAP: Record<string, AlarmMap> = {
  'help me':      { priority: 2, eventIoId: 1, isPanic: true }, // botón SOS
  'speed':        { priority: 1, eventIoId: 22 },               // exceso de velocidad
  'move':         { priority: 1, eventIoId: 251 },              // movimiento sin ACC → remolque/robo
  'stockade':     { priority: 1, eventIoId: 24 },               // geocerca
  'ac alarm':     { priority: 1, eventIoId: 249 },              // corte de alimentación externa
  'sensor alarm': { priority: 1, eventIoId: 2 },                // vibración / golpe
  'shock':        { priority: 1, eventIoId: 2 },
  'door alarm':   { priority: 1, eventIoId: 2 },
  'low battery':  { priority: 1, eventIoId: 0 },
  'acc on':       { priority: 0, eventIoId: 0, ignition: 1 },
  'acc off':      { priority: 0, eventIoId: 0, ignition: 0 },
};

/** ddmm.mmmm + N/S (o dddmm.mmmm + E/W) → grados decimales con signo. NaN si inválido. */
function nmeaToDegrees(value: string, hemisphere: string): number {
  const v = parseFloat(value);
  if (isNaN(v) || value === '') return NaN;
  const deg = Math.floor(v / 100);
  const min = v - deg * 100;
  const out = deg + min / 60;
  const h = (hemisphere || '').toUpperCase();
  return (h === 'S' || h === 'W') ? -out : out;
}

/** Fecha yymmddhhmm[ss] (campo 2) + hora UTC hhmmss.sss (campo 5) → epoch ms. Date.now() si no se puede. */
function parseTime(date: string, time: string): number {
  if (!/^\d{10,12}$/.test(date)) return Date.now();
  const y = 2000 + parseInt(date.substring(0, 2), 10);
  const mon = parseInt(date.substring(2, 4), 10) - 1;
  const d = parseInt(date.substring(4, 6), 10);
  let h = parseInt(date.substring(6, 8), 10);
  let min = parseInt(date.substring(8, 10), 10);
  let sec = date.length >= 12 ? parseInt(date.substring(10, 12), 10) : 0;
  // La hora del bloque GPS es UTC y más precisa; la del campo fecha puede ser local.
  if (/^\d{6}(\.\d+)?$/.test(time)) {
    h = parseInt(time.substring(0, 2), 10);
    min = parseInt(time.substring(2, 4), 10);
    sec = parseInt(time.substring(4, 6), 10);
  }
  const ts = Date.UTC(y, mon, d, h, min, sec);
  return isNaN(ts) ? Date.now() : ts;
}

function normalizeImei(imei: string): string | null {
  if (!/^\d{14,16}$/.test(imei)) return null;
  return (imei.length === 16 && imei.startsWith('0')) ? imei.substring(1) : imei;
}

/** Parsea un mensaje (sin el ';' final). null si no es GPS103. */
function parseSingleMessage(raw: string): Gps103Parsed | null {
  const msg = raw.trim();
  if (!msg) return null;

  // ── Login: ##,imei:XXXXX,A ──
  if (msg.startsWith('##,')) {
    const m = /^##,imei:(\d+),/.exec(msg);
    const imei = m ? normalizeImei(m[1]) : null;
    if (!imei) { logger.debug(`[GPS103] Login con IMEI inválido: ${msg.substring(0, 40)}`); return null; }
    return { imei, messageType: 'login', records: [], needsAck: true, ackResponse: 'LOAD', raw: msg };
  }

  // ── Heartbeat: solo el IMEI ──
  if (/^\d{14,16}$/.test(msg)) {
    const imei = normalizeImei(msg);
    if (!imei) return null;
    return { imei, messageType: 'heartbeat', records: [], needsAck: true, ackResponse: 'ON', raw: msg };
  }

  // ── Reporte: imei:XXXXX,tipo,fecha,tel,F|L,hora,A|V,lat,N|S,lng,E|W,vel,rumbo,... ──
  if (!msg.startsWith('imei:')) return null;
  const f = msg.split(',');
  if (f.length < 5) return null;
  const imei = normalizeImei(f[0].substring(5));
  if (!imei) { logger.debug(`[GPS103] IMEI inválido en reporte: ${f[0]}`); return null; }
  const messageType = (f[1] || '').trim().toLowerCase();

  const base = { imei, messageType, needsAck: false, ackResponse: null, raw: msg };

  // F = fix GPS completo; L = solo celdas (LBS) → sin posición utilizable
  const hasGps = (f[4] || '').toUpperCase() === 'F';
  if (!hasGps || f.length < 11) return { ...base, records: [] };

  const valid = (f[6] || '').toUpperCase() === 'A';
  const latitude = nmeaToDegrees(f[7], f[8]);
  const longitude = nmeaToDegrees(f[9], f[10]);
  if (!valid || isNaN(latitude) || isNaN(longitude) || (latitude === 0 && longitude === 0)) {
    return { ...base, records: [] };
  }

  const knots = parseFloat(f[11] || '');
  const speed = isNaN(knots) ? 0 : Math.round(knots * 1.852);
  const course = parseFloat(f[12] || '');

  const alarm = ALARM_MAP[messageType];
  const io: Record<number, number | bigint> = {};
  if (alarm?.ignition !== undefined) io[IO_IGNITION] = alarm.ignition;

  const record: AVLRecord = {
    timestamp: parseTime(f[2] || '', f[5] || ''),
    priority: alarm?.priority ?? 0,
    latitude,
    longitude,
    altitude: 0,
    angle: isNaN(course) ? 0 : Math.round(course),
    satellites: 0,
    speed,
    io,
    eventIoId: alarm?.eventIoId ?? 0,
    isPanic: alarm?.isPanic === true,
  };
  return { ...base, records: [record] };
}

/**
 * Extrae mensajes GPS103 completos de un buffer de texto (delimitador ';').
 * Devuelve los mensajes parseados y el sobrante incompleto.
 */
export function parseGps103Buffer(buffer: string): { messages: Gps103Parsed[]; remainder: string } {
  const messages: Gps103Parsed[] = [];
  const parts = buffer.split(';');
  const remainder = parts.pop() || '';

  for (const part of parts) {
    if (part.trim().length < 15) continue;
    try {
      const parsed = parseSingleMessage(part);
      if (parsed) messages.push(parsed);
    } catch (err) {
      logger.warn(`[GPS103] Error parseando mensaje: ${part.substring(0, 80)}`, err);
    }
  }
  return { messages, remainder };
}

/**
 * Detecta si una conexión habla GPS103 por sus primeros bytes:
 * login "##,imei:", reporte "imei:" o heartbeat "<15 dígitos>;".
 */
export function isGps103Data(buf: Buffer): boolean {
  if (buf.length < 5) return false;
  const head = buf.subarray(0, Math.min(16, buf.length)).toString('ascii');
  return head.startsWith('##,imei:') || head.startsWith('imei:') || /^\d{15};/.test(head);
}
