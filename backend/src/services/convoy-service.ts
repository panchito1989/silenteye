/**
 * SilentEye — Virtual convoy service.
 *
 * Two trucks are convoy candidates when their planned routes run through the
 * same corridor, in the same direction, departing around the same time — the
 * "safety in numbers" heuristic for cargo transport. When one convoy member
 * raises a panic alert, we relay it to the others so they can react.
 *
 * All geometry lives in trailer_routes (path LineString + origin/destination);
 * matching is pure PostGIS, no external routing engine.
 */
import { pool } from '../db/pool.js';
import { logger } from '../utils/logger.js';
import { broadcastAlert } from './websocket.js';
import type { StoredAlert } from './alert-service.js';

const DEFAULT_CORRIDOR_M = 3000;      // how close the two paths must come
const DEFAULT_WINDOW_S = 6 * 3600;    // departure within 6 h
const MAX_BEARING_DELTA = 45;         // degrees — same general direction
const MIN_SCORE = 40;                 // below this it isn't a real convoy match
const OD_SCALE_M = 40_000;            // origins/destinations "close" within ~40 km

export interface ConvoyCandidate {
  route_id: string;
  trailer_id: string;
  plate: string | null;
  name: string | null;
  status: string;
  planned_departure: string | null;
  score: number;                      // 0-100
  path_min_dist_m: number;
  origin_dist_m: number;
  dest_dist_m: number;
  bearing_delta: number;
  departure_delta_s: number | null;
}

export interface RouteRiskZone {
  id: string;
  name: string;
  category: string;
  risk_score: number;
}

export interface ConvoyResult {
  reference_route_id: string;
  candidates: ConvoyCandidate[];
  route_risk: { zones: RouteRiskZone[]; max_score: number };
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function bearingDelta(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

/** Find convoy candidates + risk exposure for one route. */
export async function findConvoyCandidates(
  routeId: string,
  corridorM = DEFAULT_CORRIDOR_M,
  windowS = DEFAULT_WINDOW_S,
): Promise<ConvoyResult> {
  const { rows } = await pool.query(
    `WITH ref AS (
       SELECT id, trailer_id, path, planned_departure,
              ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326) AS o,
              ST_SetSRID(ST_MakePoint(destination_lng, destination_lat), 4326) AS d
       FROM trailer_routes WHERE id = $1
     )
     SELECT r.id AS route_id, r.trailer_id, r.name, r.status, r.planned_departure, v.plate,
            ST_Distance(r.path::geography, ref.path::geography) AS path_min_dist_m,
            ST_Distance(ST_SetSRID(ST_MakePoint(r.origin_lng, r.origin_lat), 4326)::geography, ref.o::geography) AS origin_dist_m,
            ST_Distance(ST_SetSRID(ST_MakePoint(r.destination_lng, r.destination_lat), 4326)::geography, ref.d::geography) AS dest_dist_m,
            degrees(ST_Azimuth(ref.o, ref.d)) AS ref_bearing,
            degrees(ST_Azimuth(
              ST_SetSRID(ST_MakePoint(r.origin_lng, r.origin_lat), 4326),
              ST_SetSRID(ST_MakePoint(r.destination_lng, r.destination_lat), 4326))) AS cand_bearing,
            EXTRACT(EPOCH FROM (r.planned_departure - ref.planned_departure)) AS dep_delta_s
     FROM trailer_routes r
     JOIN ref ON TRUE
     JOIN vehicles v ON v.id = r.trailer_id
     WHERE r.id <> ref.id
       AND r.trailer_id <> ref.trailer_id
       AND r.status IN ('planned', 'in_progress')
       AND r.path IS NOT NULL AND ref.path IS NOT NULL
       AND ST_DWithin(r.path::geography, ref.path::geography, $2)
     LIMIT 100`,
    [routeId, corridorM],
  );

  const candidates: ConvoyCandidate[] = [];
  for (const r of rows) {
    const bDelta = bearingDelta(Number(r.ref_bearing), Number(r.cand_bearing));
    if (bDelta > MAX_BEARING_DELTA) continue;

    const depDelta = r.dep_delta_s == null ? null : Number(r.dep_delta_s);
    if (depDelta != null && Math.abs(depDelta) > windowS) continue;

    const pathScore = clamp01(1 - Number(r.path_min_dist_m) / corridorM);
    const originF = clamp01(1 - Number(r.origin_dist_m) / OD_SCALE_M);
    const destF = clamp01(1 - Number(r.dest_dist_m) / OD_SCALE_M);
    const odScore = (originF + destF) / 2;
    const bearingScore = clamp01(1 - bDelta / MAX_BEARING_DELTA);
    const timeScore = depDelta == null ? 0.5 : clamp01(1 - Math.abs(depDelta) / windowS);

    const score = Math.round(100 * (0.35 * pathScore + 0.30 * odScore + 0.20 * bearingScore + 0.15 * timeScore));
    if (score < MIN_SCORE) continue;

    candidates.push({
      route_id: r.route_id,
      trailer_id: r.trailer_id,
      plate: r.plate,
      name: r.name,
      status: r.status,
      planned_departure: r.planned_departure,
      score,
      path_min_dist_m: Math.round(Number(r.path_min_dist_m)),
      origin_dist_m: Math.round(Number(r.origin_dist_m)),
      dest_dist_m: Math.round(Number(r.dest_dist_m)),
      bearing_delta: Math.round(bDelta),
      departure_delta_s: depDelta == null ? null : Math.round(depDelta),
    });
  }
  candidates.sort((a, b) => b.score - a.score);

  const riskRes = await pool.query(
    `SELECT z.id, z.name, z.category, z.risk_score
     FROM risk_zones z
     JOIN trailer_routes r ON r.id = $1
     WHERE r.path IS NOT NULL AND ST_Intersects(z.zone, r.path)
       AND (z.active_until IS NULL OR z.active_until > NOW()) AND z.active_from <= NOW()
     ORDER BY z.risk_score DESC`,
    [routeId],
  );
  const zones: RouteRiskZone[] = riskRes.rows.map((z: RouteRiskZone) => ({
    id: z.id, name: z.name, category: z.category, risk_score: z.risk_score,
  }));

  return {
    reference_route_id: routeId,
    candidates,
    route_risk: { zones, max_score: zones[0]?.risk_score ?? 0 },
  };
}

/**
 * Relay a panic alert to the alerting vehicle's convoy peers. Best-effort:
 * never throws. Only fires when the vehicle is mid-trip (in_progress route).
 */
export async function relayPanicToConvoy(alert: StoredAlert): Promise<void> {
  try {
    if (!alert.vehicleId) return;
    const active = await pool.query(
      `SELECT id FROM trailer_routes
       WHERE trailer_id = $1 AND status = 'in_progress'
       ORDER BY planned_departure DESC NULLS LAST LIMIT 1`,
      [alert.vehicleId],
    );
    const routeId = active.rows[0]?.id;
    if (!routeId) return;

    const { candidates } = await findConvoyCandidates(routeId);
    if (candidates.length === 0) return;

    const peerVehicleIds = candidates.map((c) => c.trailer_id);
    const users = await pool.query(
      `SELECT DISTINCT u.id FROM users u
       WHERE u.is_active AND (
         u.id IN (SELECT driver_id FROM vehicles WHERE id = ANY($1) AND driver_id IS NOT NULL)
         OR u.id IN (SELECT fleet_owner_id FROM trailers WHERE vehicle_id = ANY($1) AND fleet_owner_id IS NOT NULL)
       )`,
      [peerVehicleIds],
    );
    const userIds = users.rows.map((r: { id: string }) => r.id);
    if (userIds.length === 0) return;

    broadcastAlert(alert, userIds);
    logger.info(`[CONVOY] panic relayed from vehicle ${alert.vehicleId} to ${userIds.length} convoy peer user(s)`);
  } catch (err) {
    logger.warn('convoy panic relay failed:', err);
  }
}
