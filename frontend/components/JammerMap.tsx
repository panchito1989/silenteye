'use client';
/**
 * SilentEye — Plataforma de Seguridad Vehicular
 * Copyright (c) 2026 Christian Fiesco. All rights reserved.
 * PROPRIETARY AND CONFIDENTIAL — See LICENSE file for details.
 *
 * JammerMap — live map of GNSS-jammer hotspots + SAR/jamming fusion.
 * Hotspots come from clustering jamming alerts. Clicking a hotspot lets an
 * admin run the satellite terrain analysis for that spot; the resulting
 * cargo-theft "staging candidates" render as a separate, triageable layer.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useWebSocket } from '@/hooks/useWebSocket';

const MEXICO_CENTER: [number, number] = [23.6345, -102.5528];
const JAMMING_TYPES = new Set(['gnss_jamming', 'jamming']);
const LIVE_TTL_MS = 5 * 60 * 1000;

type Band = 'alto' | 'medio' | 'bajo';
type CandidateStatus = 'new' | 'investigating' | 'confirmed' | 'dismissed';

interface Hotspot {
  cluster_id: number;
  event_count: number;
  lat: number;
  lng: number;
  radius_m: number;
  severity: number;
  band: Band;
  first_seen: string;
  last_seen: string;
}

interface LiveEvent { id: string; lat: number; lng: number; at: number; plate?: string }

interface Candidate {
  id: string;
  latitude: number;
  longitude: number;
  fusion_score: number;
  anomaly_type: 'vegetation_loss' | 'soil_exposure' | 'both';
  anomaly_severity: number;
  area_m2: number | null;
  confidence: 'optical_only' | 'sar_confirmed';
  distance_m: number | null;
  source_sensor: string | null;
  status: CandidateStatus;
}

const BAND_COLOR: Record<Band, string> = { alto: '#dc2626', medio: '#f59e0b', bajo: '#10b981' };
const BAND_LABEL: Record<Band, string> = { alto: 'Alto', medio: 'Medio', bajo: 'Bajo' };
const ANOMALY_LABEL: Record<Candidate['anomaly_type'], string> = {
  soil_exposure: 'Suelo expuesto', vegetation_loss: 'Pérdida de vegetación', both: 'Ambos',
};

function candidateColor(score: number): string {
  return score >= 70 ? '#6d28d9' : score >= 50 ? '#8b5cf6' : '#c4b5fd';
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function JammerMap() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [live, setLive] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzingKey, setAnalyzingKey] = useState<string | null>(null);
  const [analyzeMsg, setAnalyzeMsg] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const fetchHotspots = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }
    setError(null);
    try {
      const res = await fetch(`/api/jammers/hotspots?days=${days}`, { headers: authHeaders() });
      if (res.status === 401 || res.status === 403) { router.replace('/login'); return; }
      if (!res.ok) { setError('No se pudieron cargar los hotspots.'); return; }
      setHotspots(await res.json());
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }, [days, router]);

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch('/api/staging-candidates', { headers: authHeaders() });
      if (res.ok) setCandidates(await res.json());
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => { fetchHotspots(); }, [fetchHotspots]);
  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  useEffect(() => {
    const iv = setInterval(() => {
      setLive((prev) => prev.filter((e) => Date.now() - e.at < LIVE_TTL_MS));
      setTick((n) => n + 1);
    }, 30_000);
    return () => clearInterval(iv);
  }, []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  useWebSocket({
    token,
    enabled: !!token,
    onMessage: useCallback((msg: { type: string; payload: unknown }) => {
      if (msg.type !== 'alert' || !msg.payload) return;
      const a = msg.payload as { id?: string; alertType?: string; latitude?: number; longitude?: number; plate?: string };
      if (!a.id || !a.alertType || !JAMMING_TYPES.has(a.alertType)) return;
      if (typeof a.latitude !== 'number' || typeof a.longitude !== 'number') return;
      setLive((prev) => {
        if (prev.some((e) => e.id === a.id)) return prev;
        return [{ id: a.id!, lat: a.latitude!, lng: a.longitude!, at: Date.now(), plate: a.plate }, ...prev].slice(0, 30);
      });
    }, []),
  });

  const analyzeHotspot = useCallback(async (h: Hotspot) => {
    const key = String(h.cluster_id);
    setAnalyzingKey(key);
    setAnalyzeMsg(null);
    try {
      const res = await fetch('/api/jammers/hotspots/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ lat: h.lat, lng: h.lng, jammer_severity: h.severity, event_date: h.last_seen }),
      });
      if (res.status === 503) {
        setAnalyzeMsg('Análisis satelital no disponible (GEE no configurado).');
        return;
      }
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setAnalyzeMsg(e.error || 'El análisis falló.');
        return;
      }
      const data = await res.json();
      const n = Array.isArray(data.candidates) ? data.candidates.length : 0;
      setAnalyzeMsg(`Análisis completo: ${n} candidato(s). Sensor ${data.metadata?.sourceSensor || '—'}${data.metadata?.sarAvailable ? ' + SAR' : ''}.`);
      await fetchCandidates();
    } catch {
      setAnalyzeMsg('Error de conexión con el análisis.');
    } finally {
      setAnalyzingKey(null);
    }
  }, [fetchCandidates]);

  const triage = useCallback(async (id: string, status: CandidateStatus) => {
    try {
      const res = await fetch(`/api/staging-candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      }
    } catch { /* non-fatal */ }
  }, []);

  const freshLive = live.filter((e) => Date.now() - e.at < LIVE_TTL_MS);
  const visibleCandidates = candidates.filter((c) => c.status !== 'dismissed');

  return (
    <div className="relative w-full h-[560px] rounded-xl overflow-hidden border border-zinc-200">
      <style>{`
        @keyframes jammerPulse { 0% { stroke-opacity: 0.9; stroke-width: 2; } 100% { stroke-opacity: 0; stroke-width: 22; } }
        .jammer-live-pulse { animation: jammerPulse 1.6s ease-out infinite; }
      `}</style>

      <div className="absolute top-3 left-3 z-[500] bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-zinc-200 px-2 py-1.5 flex items-center gap-1 text-[11px]">
        <span className="text-zinc-500 font-medium mr-1">Ventana:</span>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-2 py-0.5 rounded font-semibold transition-colors ${days === d ? 'bg-red-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
          >{d}d</button>
        ))}
      </div>

      {analyzeMsg && (
        <div className="absolute top-14 left-3 z-[500] bg-violet-50 border border-violet-200 text-violet-800 text-[11px] rounded-lg px-3 py-2 max-w-[260px] shadow">
          {analyzeMsg}
          <button onClick={() => setAnalyzeMsg(null)} className="ml-2 text-violet-400 hover:text-violet-700">✕</button>
        </div>
      )}

      <MapContainer center={MEXICO_CENTER} zoom={5} minZoom={4} maxZoom={16} scrollWheelZoom style={{ height: '100%', width: '100%', background: '#f8fafc' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />

        {hotspots.map((h) => (
          <Circle
            key={h.cluster_id}
            center={[h.lat, h.lng]}
            radius={h.radius_m}
            pathOptions={{ color: BAND_COLOR[h.band], fillColor: BAND_COLOR[h.band], fillOpacity: 0.3, weight: 1.5 }}
          >
            <Tooltip direction="top" opacity={0.95} sticky>
              <div style={{ fontFamily: 'system-ui', fontSize: 12 }}>
                <strong>Zona de jammer</strong> — {h.event_count} eventos · Sev. {h.severity}
              </div>
            </Tooltip>
            <Popup>
              <div style={{ fontFamily: 'system-ui', fontSize: 12, minWidth: 190 }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>Zona de jammer ({BAND_LABEL[h.band]})</div>
                <div style={{ color: '#71717a' }}>{h.event_count} eventos · Severidad {h.severity}/100</div>
                <div style={{ color: '#71717a', marginBottom: 6 }}>Último: {fmtDate(h.last_seen)}</div>
                <button
                  onClick={() => analyzeHotspot(h)}
                  disabled={analyzingKey === String(h.cluster_id)}
                  style={{
                    width: '100%', padding: '6px 8px', borderRadius: 6, border: 'none',
                    background: analyzingKey === String(h.cluster_id) ? '#a78bfa' : '#6d28d9',
                    color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 12,
                  }}
                >
                  {analyzingKey === String(h.cluster_id) ? 'Analizando terreno…' : '🛰️ Analizar terreno vía satélite'}
                </button>
              </div>
            </Popup>
          </Circle>
        ))}

        {visibleCandidates.map((c) => (
          <CircleMarker
            key={c.id}
            center={[c.latitude, c.longitude]}
            radius={9}
            pathOptions={{
              color: c.status === 'confirmed' ? '#059669' : candidateColor(c.fusion_score),
              fillColor: candidateColor(c.fusion_score),
              fillOpacity: 0.75, weight: c.status === 'confirmed' ? 3 : 1.5,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'system-ui', fontSize: 12, minWidth: 200 }}>
                <div style={{ fontWeight: 700, color: '#6d28d9' }}>Candidato a bodega</div>
                <div style={{ color: '#71717a' }}>Score de fusión: <strong>{c.fusion_score}/100</strong></div>
                <div style={{ color: '#71717a' }}>{ANOMALY_LABEL[c.anomaly_type]} · Sev. {c.anomaly_severity}</div>
                <div style={{ color: '#71717a' }}>
                  {c.confidence === 'sar_confirmed' ? '✔ Confirmado por SAR' : 'Solo óptico'}
                  {c.area_m2 ? ` · ${Math.round(c.area_m2).toLocaleString('es-MX')} m²` : ''}
                </div>
                <div style={{ color: '#71717a', marginBottom: 6 }}>
                  {c.distance_m != null ? `A ${c.distance_m} m del jammer` : ''} {c.source_sensor ? `· ${c.source_sensor}` : ''}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => triage(c.id, 'investigating')} style={triBtn('#2563eb', c.status === 'investigating')}>Investigar</button>
                  <button onClick={() => triage(c.id, 'confirmed')} style={triBtn('#059669', c.status === 'confirmed')}>Confirmar</button>
                  <button onClick={() => triage(c.id, 'dismissed')} style={triBtn('#71717a', false)}>Descartar</button>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {freshLive.map((e) => (
          <CircleMarker
            key={e.id}
            center={[e.lat, e.lng]}
            radius={7}
            pathOptions={{ className: 'jammer-live-pulse', color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.9, weight: 2 }}
          >
            <Tooltip direction="top" opacity={0.95}>
              <div style={{ fontFamily: 'system-ui', fontSize: 12 }}>
                <strong style={{ color: '#dc2626' }}>Jamming en vivo</strong>
                {e.plate ? <div style={{ color: '#71717a', fontSize: 11 }}>{e.plate}</div> : null}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-zinc-200 px-3 py-2.5 text-[11px] z-[400]">
        <div className="font-bold text-zinc-700 mb-1.5 uppercase tracking-wider text-[10px]">Leyenda</div>
        {(['alto', 'medio', 'bajo'] as Band[]).map((b) => (
          <div key={b} className="flex items-center gap-1.5 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ background: BAND_COLOR[b], opacity: 0.5 }} />
            <span className="text-zinc-600">Jammer {BAND_LABEL[b]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-3 h-3 rounded-full" style={{ background: '#6d28d9' }} />
          <span className="text-zinc-600">Candidato bodega</span>
        </div>
        <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-zinc-600">Jamming en vivo</span>
        </div>
      </div>

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/80 backdrop-blur-sm z-[450]">
          <div className="text-zinc-500 text-sm">Cargando hotspots…</div>
        </div>
      )}
      {error && (
        <div className="absolute top-3 right-3 z-[500] bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-lg px-3 py-2 max-w-[220px]">{error}</div>
      )}
      {!loading && !error && hotspots.length === 0 && freshLive.length === 0 && (
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 border border-zinc-200 text-zinc-500 text-[11px] rounded-lg px-3 py-2 max-w-[240px]">
          Sin zonas de jammer en los últimos {days} días. Aparecerán en cuanto se detecten eventos recurrentes.
        </div>
      )}
    </div>
  );
}

function triBtn(bg: string, active: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '4px 2px', borderRadius: 5, border: active ? `2px solid ${bg}` : '1px solid #e4e4e7',
    background: active ? bg : '#fff', color: active ? '#fff' : bg, fontWeight: 600, cursor: 'pointer', fontSize: 10.5,
  };
}
