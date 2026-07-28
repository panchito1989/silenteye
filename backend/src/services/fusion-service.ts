/**
 * SilentEye — SAR + jamming fusion service.
 *
 * Correlates jammer hotspots (recurring GNSS-jamming locations, the tell of
 * cargo-theft operations) with fresh terrain anomalies from satellite imagery
 * (bare soil / vegetation loss) to surface candidate unloading yards ("bodegas
 * de descargo"). This is the world-first bit: nobody fuses fleet jamming
 * telemetry with Sentinel SAR/optical change detection.
 *
 * The score is a heuristic, not a verdict. Output = investigative leads.
 */
import { analyzeTerrainChange, isGeeReady, type SensitivityLevel, type TerrainAnomaly } from './gee-service.js';
import { logger } from '../utils/logger.js';

export interface StagingCandidate {
  latitude: number;
  longitude: number;
  fusionScore: number;      // 0-100
  anomalyType: TerrainAnomaly['type'];
  anomalySeverity: number;
  areaM2: number;
  confidence: TerrainAnomaly['confidence'];
  ndviChange: number;
  bsiChange: number;
  vvChange?: number;
  vhChange?: number;
  distanceM: number;        // from the hotspot centroid
  sourceSensor: string;
}

export interface FusionParams {
  lat: number;
  lng: number;
  radiusKm: number;
  eventDate: string;        // ISO — the jamming pivot date
  jammerSeverity: number;   // 0-100, from the hotspot
  sensitivity?: SensitivityLevel;
}

export interface FusionResult {
  candidates: StagingCandidate[];
  metadata: {
    sourceSensor: string;
    sarAvailable: boolean;
    anomaliesFound: number;
    kept: number;
  };
}

const EARTH_R = 6_371_000;
function haversineM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(s)));
}

// Only keep candidates scoring at least this — below it the signal is too weak
// to be worth an investigator's time.
const MIN_FUSION_SCORE = 30;

/**
 * Fuse one hotspot with its terrain anomalies. Score reflects: anomaly
 * strength, whether it is bare soil (staging yards are), proximity to the
 * hotspot, SAR confirmation, and how strong the jamming activity was.
 */
function scoreAnomaly(a: TerrainAnomaly, p: FusionParams): { score: number; distanceM: number } {
  const distanceM = haversineM(p.lat, p.lng, a.latitude, a.longitude);
  const radiusM = p.radiusKm * 1000;

  // Bare soil is the strongest tell (a cleared unloading lot); pure vegetation
  // loss is weaker on its own.
  const typeW = a.type === 'soil_exposure' ? 1 : a.type === 'both' ? 0.9 : 0.6;

  // 1 at the hotspot centre, decaying to 0 at the search edge.
  const proximity = Math.max(0, Math.min(1, 1 - distanceM / radiusM));

  let score = a.severity * typeW * (0.5 + 0.5 * proximity);
  if (a.confidence === 'sar_confirmed') score += 15; // SAR sees through clouds — strong corroboration
  score *= 0.6 + 0.4 * (Math.max(0, Math.min(100, p.jammerSeverity)) / 100);

  return { score: Math.round(Math.max(0, Math.min(100, score))), distanceM };
}

export async function findStagingCandidates(p: FusionParams): Promise<FusionResult> {
  if (!isGeeReady()) {
    throw new Error('GEE_NOT_INITIALIZED');
  }
  const result = await analyzeTerrainChange(
    p.lat,
    p.lng,
    p.radiusKm,
    p.eventDate,
    undefined,
    p.sensitivity ?? 'normal',
  );

  const candidates: StagingCandidate[] = [];
  for (const a of result.anomalies) {
    const { score, distanceM } = scoreAnomaly(a, p);
    if (score < MIN_FUSION_SCORE) continue;
    candidates.push({
      latitude: a.latitude,
      longitude: a.longitude,
      fusionScore: score,
      anomalyType: a.type,
      anomalySeverity: a.severity,
      areaM2: a.areaM2,
      confidence: a.confidence,
      ndviChange: a.ndviChange,
      bsiChange: a.bsiChange,
      vvChange: a.vvChange,
      vhChange: a.vhChange,
      distanceM: Math.round(distanceM),
      sourceSensor: result.metadata.sourceSensorDisplay,
    });
  }
  candidates.sort((x, y) => y.fusionScore - x.fusionScore);

  logger.info(
    `[FUSION] hotspot(${p.lat.toFixed(4)},${p.lng.toFixed(4)}) → ${result.anomalies.length} anomalies, ${candidates.length} candidates (sensor=${result.metadata.sourceSensorDisplay}, sar=${result.metadata.sarAvailable})`,
  );

  return {
    candidates,
    metadata: {
      sourceSensor: result.metadata.sourceSensorDisplay,
      sarAvailable: result.metadata.sarAvailable,
      anomaliesFound: result.anomalies.length,
      kept: candidates.length,
    },
  };
}
