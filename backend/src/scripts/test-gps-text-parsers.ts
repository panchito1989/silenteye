/**
 * SilentEye — Plataforma de Seguridad Vehicular
 * Copyright (c) 2026 Christian Fiesco. All rights reserved.
 * PROPRIETARY AND CONFIDENTIAL — See LICENSE file for details.
 *
 * Prueba de los parsers de texto Cobán (GPS103) y Sinotrack (H02).
 * No necesita DB. Ejecutar:
 *   node ../node_modules/tsx/dist/cli.mjs src/scripts/test-gps-text-parsers.ts   (desde backend/)
 */

import assert from 'node:assert/strict';
import { isGps103Data, parseGps103Buffer } from '../gps/gps103-parser.js';
import { isH02Data, parseH02Buffer } from '../gps/h02-parser.js';

let passed = 0;
let failed = 0;
function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}\n      ${(err as Error).message}`);
  }
}
function close(a: number, b: number, eps = 0.0005): void {
  assert.ok(Math.abs(a - b) < eps, `esperado ≈${b}, obtenido ${a}`);
}

console.log('\nCobán / GPS103');

test('login → ACK LOAD, sin registros', () => {
  const { messages, remainder } = parseGps103Buffer('##,imei:359586015829802,A;');
  assert.equal(remainder, '');
  assert.equal(messages.length, 1);
  assert.equal(messages[0].imei, '359586015829802');
  assert.equal(messages[0].messageType, 'login');
  assert.equal(messages[0].needsAck, true);
  assert.equal(messages[0].ackResponse, 'LOAD');
  assert.equal(messages[0].records.length, 0);
});

test('heartbeat (solo IMEI) → ACK ON', () => {
  const { messages } = parseGps103Buffer('359586015829802;');
  assert.equal(messages.length, 1);
  assert.equal(messages[0].messageType, 'heartbeat');
  assert.equal(messages[0].ackResponse, 'ON');
});

test('posición periódica (tracker) → lat/lng/hora correctas, sin pánico', () => {
  const { messages } = parseGps103Buffer('imei:359586015829802,tracker,0809231929,13554900601,F,112909.397,A,2234.4669,N,11354.3287,E,0.11,;');
  assert.equal(messages.length, 1);
  const m = messages[0];
  assert.equal(m.messageType, 'tracker');
  assert.equal(m.needsAck, false);
  assert.equal(m.records.length, 1);
  const r = m.records[0];
  close(r.latitude, 22.574448);
  close(r.longitude, 113.905478);
  assert.equal(r.timestamp, Date.UTC(2008, 8, 23, 11, 29, 9));
  assert.equal(r.speed, 0);
  assert.equal(r.priority, 0);
  assert.equal(r.isPanic, false);
});

test('"help me" → pánico (priority 2, eventIoId 1)', () => {
  const { messages } = parseGps103Buffer('imei:865328021041730,help me,1303152242,,F,142240.000,A,2251.2765,N,11407.3129,E,0.00,0,;');
  const r = messages[0].records[0];
  assert.equal(messages[0].messageType, 'help me');
  assert.equal(r.isPanic, true);
  assert.equal(r.priority, 2);
  assert.equal(r.eventIoId, 1);
  assert.equal(r.timestamp, Date.UTC(2013, 2, 15, 14, 22, 40));
});

test('México: N + W → longitud negativa; nudos → km/h', () => {
  const { messages } = parseGps103Buffer('imei:359586015829802,tracker,2610111200,,F,120000.000,A,1925.1234,N,09908.5678,W,10.00,180,;');
  const r = messages[0].records[0];
  close(r.latitude, 19.41872);
  close(r.longitude, -99.14280);
  assert.equal(r.speed, 19); // 10 nudos = 18.52 km/h
  assert.equal(r.angle, 180);
});

test('reporte LBS (L, sin GPS) → sin registros', () => {
  const { messages } = parseGps103Buffer('imei:359586015829802,tracker,1303152242,,L,,,2B7A,,2EA1,,,,;');
  assert.equal(messages.length, 1);
  assert.equal(messages[0].records.length, 0);
});

test('alarmas: speed → overspeed (22), acc on → io[78]=1, ac alarm → unplug (249)', () => {
  const { messages } = parseGps103Buffer(
    'imei:359586015829802,speed,1303152242,,F,142240.000,A,2251.2765,N,11407.3129,E,45.00,0,;' +
    'imei:359586015829802,acc on,1303152242,,F,142240.000,A,2251.2765,N,11407.3129,E,0.00,0,;' +
    'imei:359586015829802,ac alarm,1303152242,,F,142240.000,A,2251.2765,N,11407.3129,E,0.00,0,;'
  );
  assert.equal(messages.length, 3);
  assert.equal(messages[0].records[0].eventIoId, 22);
  assert.equal(messages[0].records[0].priority, 1);
  assert.equal(messages[1].records[0].io[78], 1);
  assert.equal(messages[2].records[0].eventIoId, 249);
});

test('buffer con mensaje incompleto → remainder', () => {
  const { messages, remainder } = parseGps103Buffer('##,imei:359586015829802,A;imei:359586015829802,trac');
  assert.equal(messages.length, 1);
  assert.equal(remainder, 'imei:359586015829802,trac');
});

test('detección por primeros bytes', () => {
  assert.equal(isGps103Data(Buffer.from('##,imei:359586015829802,A;')), true);
  assert.equal(isGps103Data(Buffer.from('imei:359586015829802,tracker,')), true);
  assert.equal(isGps103Data(Buffer.from('359586015829802;')), true);
  assert.equal(isGps103Data(Buffer.from([0x00, 0x0f, 0x33, 0x35])), false); // Teltonika
  assert.equal(isGps103Data(Buffer.from('*HQ,355488020119695,V1,')), false);
  assert.equal(isGps103Data(Buffer.from('+RESP:GTFRI,')), false);
});

console.log('\nSinotrack / H02');

test('V1 con fix → lat/lng/hora, ignición apagada (bit 10)', () => {
  const { messages, remainder } = parseH02Buffer('*HQ,355488020119695,V1,050316,A,2212.8745,N,11346.6574,E,0.00,0,230917,FFFFFBFF,460,0,10342,2436#');
  assert.equal(remainder, '');
  assert.equal(messages.length, 1);
  const m = messages[0];
  assert.equal(m.imei, '355488020119695');
  assert.equal(m.messageType, 'V1');
  assert.equal(m.records.length, 1);
  const r = m.records[0];
  close(r.latitude, 22.214575);
  close(r.longitude, 113.777623);
  assert.equal(r.timestamp, Date.UTC(2017, 8, 23, 5, 3, 16));
  assert.equal(r.isPanic, false);
  assert.equal(r.priority, 0);
  assert.equal(r.io[78], 0);
});

test('SOS por bit 1 del status (FFFFFFFD) → pánico', () => {
  const { messages } = parseH02Buffer('*HQ,355488020119695,V1,050316,A,2212.8745,N,11346.6574,E,0.00,0,230917,FFFFFFFD#');
  const r = messages[0].records[0];
  assert.equal(r.isPanic, true);
  assert.equal(r.priority, 2);
  assert.equal(r.eventIoId, 1);
});

test('SOS por bit 18 del status (FFFBFFFF) → pánico', () => {
  const { messages } = parseH02Buffer('*HQ,355488020119695,V1,050316,A,2212.8745,N,11346.6574,E,0.00,0,230917,FFFBFFFF#');
  assert.equal(messages[0].records[0].isPanic, true);
});

test('sin fix (V) → sin registros', () => {
  const { messages } = parseH02Buffer('*HQ,353588020068342,V1,000000,V,0.0000,0,0.0000,0,0.00,0.00,000000,ffffffff,000000,000000,000000,000000#');
  assert.equal(messages.length, 1);
  assert.equal(messages[0].records.length, 0);
});

test('México: W → longitud negativa; nudos → km/h; status en minúsculas', () => {
  const { messages } = parseH02Buffer('*HQ,355488020119695,V1,120000,A,1925.1234,N,09908.5678,W,5.40,180,111026,ffffffff#');
  const r = messages[0].records[0];
  close(r.latitude, 19.41872);
  close(r.longitude, -99.14280);
  assert.equal(r.speed, 10); // 5.4 nudos = 10.0 km/h
  assert.equal(r.angle, 180);
  assert.equal(r.timestamp, Date.UTC(2026, 9, 11, 12, 0, 0));
  assert.equal(r.io[78], 1);
});

test('mensaje sin posición (LINK/XT) → sin registros, sin ACK', () => {
  const { messages } = parseH02Buffer('*HQ,355488020119695,LINK,050316,30,100,3,0,230917#');
  assert.equal(messages.length, 1);
  assert.equal(messages[0].records.length, 0);
  assert.equal(messages[0].needsAck, false);
});

test('buffer con dos mensajes y uno incompleto', () => {
  const { messages, remainder } = parseH02Buffer(
    '*HQ,355488020119695,V1,050316,A,2212.8745,N,11346.6574,E,0.00,0,230917,FFFFFBFF#' +
    '*HQ,355488020119695,V1,050346,A,2212.8800,N,11346.6600,E,1.00,0,230917,FFFFFBFF#' +
    '*HQ,355488020119695,V1,0504'
  );
  assert.equal(messages.length, 2);
  assert.equal(remainder, '*HQ,355488020119695,V1,0504');
});

test('detección por primeros bytes', () => {
  assert.equal(isH02Data(Buffer.from('*HQ,355488020119695,V1,')), true);
  assert.equal(isH02Data(Buffer.from('*TH,355488020119695,V1,')), true);
  assert.equal(isH02Data(Buffer.from('imei:359586015829802,')), false);
  assert.equal(isH02Data(Buffer.from([0x00, 0x0f, 0x33])), false);
});

console.log(`\n${passed}/${passed + failed} pruebas OK${failed ? ` — ${failed} FALLARON` : ''}\n`);
process.exit(failed ? 1 : 0);
