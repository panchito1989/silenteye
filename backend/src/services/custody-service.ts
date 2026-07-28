/**
 * SilentEye — Chain of custody service.
 *
 * Maintains a tamper-evident, hash-linked ledger (`custody_chain`) of evidence
 * events. Each append is serialized with a transaction-scoped Postgres advisory
 * lock so concurrent writers produce one strict, unbroken order. Hashing is done
 * here in Node (SHA-256) — no database crypto extension required.
 *
 * The seal binds: entity_type, entity_id, action, actor, incident, content_hash
 * and the previous row's chain_hash, plus the exact created_at. `details` is
 * intentionally excluded from the seal (display-only annotation).
 */
import crypto from 'crypto';
import { pool } from '../db/pool.js';
import { logger } from '../utils/logger.js';

// Arbitrary constant key for pg_advisory_xact_lock — shared by every appender so
// they serialize against each other (and only each other).
const CHAIN_LOCK_KEY = 4281989;

export function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

export interface CustodyEntry {
  entityType: string;
  entityId?: string | null;
  action: string;
  actorId?: string | null;
  actorRole?: string | null;
  incidentId?: string | null;
  contentHash?: string | null;
  details?: Record<string, unknown>;
}

/** Canonical, order-sensitive string that gets hashed into chain_hash. */
function canonical(e: CustodyEntry, prevHash: string | null, createdAtIso: string): string {
  return [
    e.entityType,
    e.entityId ?? '',
    e.action,
    e.actorId ?? '',
    e.actorRole ?? '',
    e.incidentId ?? '',
    e.contentHash ?? '',
    prevHash ?? '',
    createdAtIso,
  ].join('|');
}

/**
 * Append one entry. Best-effort: returns null on failure and never throws, so
 * an instrumentation call can't break the request it decorates.
 */
export async function appendCustody(entry: CustodyEntry): Promise<{ seq: number; chainHash: string } | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [CHAIN_LOCK_KEY]);
    const prev = await client.query('SELECT chain_hash FROM custody_chain ORDER BY seq DESC LIMIT 1');
    const prevHash: string | null = prev.rows[0]?.chain_hash ?? null;
    const createdAtIso = new Date().toISOString();
    const chainHash = sha256Hex(canonical(entry, prevHash, createdAtIso));
    const ins = await client.query(
      `INSERT INTO custody_chain
         (entity_type, entity_id, action, actor_id, actor_role, incident_id, content_hash, prev_hash, chain_hash, details, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING seq`,
      [
        entry.entityType.slice(0, 32),
        entry.entityId != null ? String(entry.entityId).slice(0, 256) : null,
        entry.action.slice(0, 48),
        entry.actorId ?? null,
        entry.actorRole?.slice(0, 24) ?? null,
        entry.incidentId ?? null,
        entry.contentHash ?? null,
        prevHash,
        chainHash,
        entry.details ? JSON.stringify(entry.details) : null,
        createdAtIso,
      ],
    );
    await client.query('COMMIT');
    return { seq: Number(ins.rows[0].seq), chainHash };
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* ignore */ }
    logger.warn('custody append failed:', err);
    return null;
  } finally {
    client.release();
  }
}

export interface VerifyResult {
  ok: boolean;
  total: number;          // rows in the whole chain
  incidentCount?: number; // rows for the filtered incident, if any
  brokenAtSeq: number | null;
  reason?: string;
  head: string | null;    // latest chain_hash (the current seal)
}

/**
 * Recompute the entire chain and confirm every link. Integrity is global —
 * we always validate the full chain — but the caller may pass an incidentId to
 * also get that incident's event count. `head` is the latest seal hash.
 */
export async function verifyChain(incidentId?: string): Promise<VerifyResult> {
  const { rows } = await pool.query(
    `SELECT seq, entity_type, entity_id, action, actor_id, actor_role, incident_id,
            content_hash, prev_hash, chain_hash, created_at
     FROM custody_chain ORDER BY seq ASC`,
  );
  let prevHash: string | null = null;
  for (const r of rows) {
    const createdAtIso = new Date(r.created_at).toISOString();
    const entry: CustodyEntry = {
      entityType: r.entity_type,
      entityId: r.entity_id,
      action: r.action,
      actorId: r.actor_id,
      actorRole: r.actor_role,
      incidentId: r.incident_id,
      contentHash: r.content_hash,
    };
    const expected = sha256Hex(canonical(entry, prevHash, createdAtIso));
    if (r.prev_hash !== prevHash) {
      return { ok: false, total: rows.length, brokenAtSeq: Number(r.seq), reason: 'prev_hash roto', head: null };
    }
    if (r.chain_hash !== expected) {
      return { ok: false, total: rows.length, brokenAtSeq: Number(r.seq), reason: 'chain_hash no coincide', head: null };
    }
    prevHash = r.chain_hash;
  }
  const incidentCount = incidentId
    ? rows.filter((r: { incident_id: string | null }) => r.incident_id === incidentId).length
    : undefined;
  return { ok: true, total: rows.length, incidentCount, brokenAtSeq: null, head: prevHash };
}
