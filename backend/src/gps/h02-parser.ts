/**
 * SilentEye — Plataforma de Seguridad Vehicular
 * Copyright (c) 2026 Christian Fiesco. All rights reserved.
 * PROPRIETARY AND CONFIDENTIAL — See LICENSE file for details.
 *
 * H02 Parser — Sinotrack ST-901 / ST-906 y otros GPS chinos con protocolo H02 (texto)
 * Mensajes "*HQ,...#" (algunos firmwares usan "*TH,"):
 *   *HQ,355488020119695,V1,050316,A,2212.8745,N,11346.6574,E,0.00,0,230917,FFFFFBFF,460,0,10342,2436#
 *    0   1 (ID/IMEI)      2  3 hora  4  5 lat     6  7 lng      8  9 vel 10 rumbo 11 fecha 12 status ...
 *   hora hhmmss UTC · fecha ddmmyy · velocidad en nudos · status = 32 bits en hex, bit en 0 = activo
 * El botón SOS llega en el status (bit 1 o bit 18 en 0). No requiere ACK.
 * Normaliza a AVLRecord para el mismo pipeline que Teltonika/Concox/Queclink.
 */

import type { AVLRecord } from './avl-decoder.js';
import { logger } from '../utils/logger.js';

export interface H02Parsed {
  imei: string;
  /** Comando del mensaje: 'V1' (posición), 'LINK'/'XT' (heartbeat), 'NBR'/'V3' (LBS), ... */
  messageType: string;
  records: AVLRecord[];
  needsAck: boolean;
  ackResponse: string | null;
  raw: string;
}

const IO_IGNITION = 78;

/* Bits del status (en 0 = activo). Mismo decode que Traccar para H02. */
const STATUS_BIT_VIBRATION = 0;
const STATUS_BIT_SOS_A     = 1;
const STATUS_BIT_OVERSPEED = 2;
const STATUS_BIT_IGNITION  = 10;   // en 1 = ACC encendido
const STATUS_BIT_SOS_B     = 18;
const STATUS_BIT_POWER_CUT = 19;

function bitClear(status: number, bit: number): boolean {
  return ((status >>> bit) & 1) === 0;
}

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

/** hora hhmmss (UTC) + fecha ddmmyy → epoch ms. Date.now() si no se puede. */
function parseTime(time: string, date: string): number {
  if (!/^\d{6}$/.test(time) || !/^\d{6}$/.test(date)) return Date.now();
  const d = parseInt(date.substring(0, 2), 10);
  const mon = parseInt(date.substring(2, 4), 10) - 1;
  const y = 2000 + parseInt(date.substring(4, 6), 10);
  const h = parseInt(time.substring(0, 2), 10);
  const min = parseInt(time.substring(2, 4), 10);
  const sec = parseInt(time.substring(4, 6), 10);
  const ts = Date.UTC(y, mon, d, h, min, sec);
  return isNaN(ts) ? Date.now() : ts;
}

function normalizeImei(id: string): string | null {
  if (!/^\d{10,16}$/.test(id)) return null;
  if (id.length === 16 && id.startsWith('0')) return id.substring(1);
  if (id.length !== 15) {
    // Algunos H02 reportan un ID corto en vez del IMEI. La whitelist de la
    // plataforma es por IMEI de 15 dígitos, así que ese equipo será rechazado.
    logger.debug(`[H02] ID de ${id.length} dígitos (no es IMEI de 15): ${id}`);
  }
  return id;
}

/** Parsea un mensaje (sin el '#' final). null si no es H02. */
function parseSingleMessage(raw: string): H02Parsed | null {
  const msg = raw.trim();
  if (!msg.startsWith('*HQ,') && !msg.startsWith('*TH,')) return null;
  const f = msg.split(',');
  if (f.length < 3) return null;

  const imei = normalizeImei(f[1]);
  if (!imei) { logger.debug(`[H02] ID inválido: ${msg.substring(0, 40)}`); return null; }
  const messageType = (f[2] || '').toUpperCase();
  const base = { imei, messageType, needsAck: false, ackResponse: null, raw: msg };

  // Solo los mensajes con bloque GPS completo producen posición
  if (f.length < 12) return { ...base, records: [] };
  const valid = (f[4] || '').toUpperCase() === 'A';
  const latitude = nmeaToDegrees(f[5], f[6]);
  const longitude = nmeaToDegrees(f[7], f[8]);
  if (!valid || isNaN(latitude) || isNaN(longitude) || (latitude === 0 && longitude === 0)) {
    return { ...base, records: [] };
  }

  const knots = parseFloat(f[9] || '');
  const speed = isNaN(knots) ? 0 : Math.round(knots * 1.852);
  const course = parseFloat(f[10] || '');

  const statusHex = (f[12] || '').trim();
  const status = /^[0-9a-fA-F]{8}$/.test(statusHex) ? parseInt(statusHex, 16) : null;

  let priority = 0;
  let eventIoId = 0;
  let isPanic = false;
  const io: Record<number, number | bigint> = {};
  if (status !== null) {
    io[IO_IGNITION] = bitClear(status, STATUS_BIT_IGNITION) ? 0 : 1;
    if (bitClear(status, STATUS_BIT_SOS_A) || bitClear(status, STATUS_BIT_SOS_B)) {
      priority = 2; eventIoId = 1; isPanic = true;
    } else if (bitClear(status, STATUS_BIT_OVERSPEED)) {
      priority = 1; eventIoId = 22;
    } else if (bitClear(status, STATUS_BIT_POWER_CUT)) {
      priority = 1; eventIoId = 249;
    } else if (bitClear(status, STATUS_BIT_VIBRATION)) {
      priority = 1; eventIoId = 2;
    }
  }

  const record: AVLRecord = {
    timestamp: parseTime(f[3] || '', f[11] || ''),
    priority,
    latitude,
    longitude,
    altitude: 0,
    angle: isNaN(course) ? 0 : Math.round(course),
    satellites: 0,
    speed,
    io,
    eventIoId,
    isPanic,
  };
  return { ...base, records: [record] };
}

/**
 * Extrae mensajes H02 completos de un buffer de texto (delimitador '#').
 * Devuelve los mensajes parseados y el sobrante incompleto.
 */
export function parseH02Buffer(buffer: string): { messages: H02Parsed[]; remainder: string } {
  const messages: H02Parsed[] = [];
  const parts = buffer.split('#');
  const remainder = parts.pop() || '';

  for (const part of parts) {
    if (part.trim().length < 8) continue;
    try {
      const parsed = parseSingleMessage(part);
      if (parsed) messages.push(parsed);
    } catch (err) {
      logger.warn(`[H02] Error parseando mensaje: ${part.substring(0, 80)}`, err);
    }
  }
  return { messages, remainder };
}

/** Detecta si una conexión habla H02 por sus primeros bytes ("*HQ," o "*TH,"). */
export function isH02Data(buf: Buffer): boolean {
  if (buf.length < 4) return false;
  const head = buf.subarray(0, 4).toString('ascii');
  return head === '*HQ,' || head === '*TH,';
}
