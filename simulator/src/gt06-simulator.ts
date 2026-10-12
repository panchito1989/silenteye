#!/usr/bin/env node
/**
 * Simulador GPS Concox/GT06 (GT06N, WeTrack2 y clones).
 * Manda login (0x01), una posición (0x12) y una alarma SOS (0x16) por TCP.
 * Uso:  TCP_HOST=... IMEI=... LAT=... LNG=... npm run gt06
 *       npm run gt06 -- --validate   (solo arma los paquetes y los pasa por el parser del backend, sin red)
 * Variables: TCP_HOST, TCP_PORT, IMEI, LAT, LNG, SOS (0 para no mandar la alarma)
 */

import net from 'net';

const HOST = process.env.TCP_HOST || 'localhost';
const PORT = parseInt(process.env.TCP_PORT || '5000', 10);
const IMEI = process.env.IMEI || '356307042441013';
const LAT = parseFloat(process.env.LAT || '19.4326');
const LNG = parseFloat(process.env.LNG || '-99.1332');
const SEND_SOS = process.env.SOS !== '0';
const VALIDATE_ONLY = process.argv.includes('--validate');

/* ── CRC-ITU (misma tabla que el parser del backend) ── */
const CRC_TBL: number[] = [];
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? (c >> 1) ^ 0x8408 : c >> 1;
  CRC_TBL[i] = c;
}
function crcItu(buf: Buffer, start: number, end: number): number {
  let crc = 0xFFFF;
  for (let i = start; i < end; i++) crc = (crc >> 8) ^ CRC_TBL[(crc ^ buf[i]) & 0xFF];
  return crc ^ 0xFFFF;
}

let serial = 1;

/** Arma un paquete corto 78 78 L proto data serial crc 0D 0A */
function buildPacket(proto: number, data: Buffer): Buffer {
  const L = 1 + data.length + 2 + 2;
  const pkt = Buffer.alloc(2 + 1 + L + 2);
  pkt[0] = 0x78; pkt[1] = 0x78; pkt[2] = L; pkt[3] = proto;
  data.copy(pkt, 4);
  const serialOff = 4 + data.length;
  pkt.writeUInt16BE(serial++, serialOff);
  pkt.writeUInt16BE(crcItu(pkt, 2, serialOff + 2), serialOff + 2);
  pkt[serialOff + 4] = 0x0D; pkt[serialOff + 5] = 0x0A;
  return pkt;
}

function bcdImei(imei: string): Buffer {
  const digits = imei.padStart(16, '0');
  const out = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) out[i] = (parseInt(digits[i * 2], 10) << 4) | parseInt(digits[i * 2 + 1], 10);
  return out;
}

/** Bloque GPS de 18 bytes: fecha(6) sat(1) lat(4) lng(4) vel(1) rumbo/estado(2) */
function gpsBlock(lat: number, lng: number, speed: number, course: number): Buffer {
  const b = Buffer.alloc(18);
  const d = new Date();
  b[0] = d.getUTCFullYear() - 2000; b[1] = d.getUTCMonth() + 1; b[2] = d.getUTCDate();
  b[3] = d.getUTCHours(); b[4] = d.getUTCMinutes(); b[5] = d.getUTCSeconds();
  b[6] = 0xC0 | 8; // nibble bajo = satélites
  b.writeUInt32BE(Math.round(Math.abs(lat) * 1800000), 7);
  b.writeUInt32BE(Math.round(Math.abs(lng) * 1800000), 11);
  b[15] = speed;
  let status = 0x1000 | (course & 0x03FF); // bit 12 = posicionado
  if (lat >= 0) status |= 0x0400;          // bit 10 = norte
  if (lng < 0) status |= 0x0800;           // bit 11 = oeste
  b.writeUInt16BE(status, 16);
  return b;
}

/** LBS: MCC(2) MNC(1) LAC(2) CellID(3) — Telcel 334/020 */
const LBS = Buffer.from([0x01, 0x4E, 0x14, 0x12, 0x34, 0x01, 0x02, 0x03]);

export function buildLogin(): Buffer { return buildPacket(0x01, bcdImei(IMEI)); }
export function buildLocation(lat: number, lng: number): Buffer {
  return buildPacket(0x12, Buffer.concat([gpsBlock(lat, lng, 22, 90), LBS]));
}
export function buildSos(lat: number, lng: number): Buffer {
  // GPS(18) + LBS con byte de longitud(9) + info terminal(1) voltaje(1) GSM(1) alarma(1) idioma(1) = 32 bytes → L=0x25
  const lbs9 = Buffer.concat([Buffer.from([0x09]), LBS]);
  const status = Buffer.from([0x45, 0x05, 0x04, 0x01, 0x02]); // alarma 0x01 = SOS, idioma 0x02 = inglés
  return buildPacket(0x16, Buffer.concat([gpsBlock(lat, lng, 0, 90), lbs9, status]));
}
export function buildHeartbeat(): Buffer { return buildPacket(0x13, Buffer.from([0x45, 0x05, 0x04, 0x00, 0x01])); }

async function validate(): Promise<void> {
  // Pasa los paquetes por el parser real del backend (sin red) para comprobar formato y CRC.
  const { parseConcoxPacket, extractConcoxPackets } = await import('../../backend/src/gps/concox-parser.ts');
  const all = Buffer.concat([buildLogin(), buildLocation(LAT, LNG), buildSos(LAT, LNG), buildHeartbeat()]);
  const { packets, remainder } = extractConcoxPackets(all);
  console.log(`paquetes extraídos: ${packets.length}, sobrante: ${remainder.length} bytes`);
  for (const p of packets) {
    const r = parseConcoxPacket(p);
    if (!r) { console.log(`  ✗ proto=0x${p[3].toString(16)} RECHAZADO (CRC)`); process.exitCode = 1; continue; }
    const rec = r.records[0];
    console.log(`  ✓ proto=0x${r.protocolNumber.toString(16)} imei=${r.imei ?? '-'} ack=${r.needsAck}` +
      (rec ? ` lat=${rec.latitude.toFixed(5)} lng=${rec.longitude.toFixed(5)} speed=${rec.speed} sat=${rec.satellites} priority=${rec.priority} isPanic=${rec.isPanic} alarm=${r.alarmName ?? '-'}` : ''));
  }
}

function send(): void {
  const socket = net.createConnection({ host: HOST, port: PORT }, () => {
    console.log(`Conectado a ${HOST}:${PORT} | IMEI=${IMEI}`);
    socket.write(buildLogin());
    console.log(`${new Date().toISOString()} login enviado`);
  });
  let step = 0;
  socket.on('data', (data: Buffer) => {
    console.log(`${new Date().toISOString()} ACK recibido: ${data.toString('hex')}`);
    if (step === 0) {
      step = 1;
      socket.write(buildLocation(LAT, LNG));
      console.log(`${new Date().toISOString()} posición enviada lat=${LAT} lng=${LNG}`);
      setTimeout(() => {
        if (!SEND_SOS) { socket.end(); return; }
        socket.write(buildSos(LAT + 0.0003, LNG - 0.0002));
        console.log(`${new Date().toISOString()} ALARMA SOS enviada`);
        setTimeout(() => socket.end(), 2500);
      }, 2000);
    }
  });
  socket.on('error', (err) => { console.error('Error:', err.message); process.exitCode = 1; });
  socket.on('close', () => { console.log('Conexión cerrada'); });
}

if (VALIDATE_ONLY) validate(); else send();
