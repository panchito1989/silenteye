'use client';
/**
 * SilentEye — Plataforma de Seguridad Vehicular
 * Copyright (c) 2026 Christian Fiesco. All rights reserved.
 * PROPRIETARY AND CONFIDENTIAL — See LICENSE file for details.
 *
 * JammerMap — live map of GNSS-jammer hotspots. Hotspots come from
 * spatial-temporal clustering of jamming alerts (GET /api/jammers/hotspots);
 * fresh jamming events arrive in real time over the WebSocket and drop a
 * pulsing marker that fades after a few minutes.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useWebSocket } from '@/hooks/useWebSocket';

const MEXICO_CENTER: [number, number] = [23.6345, -102.5528];
const JAMMING_TYPES = new Set(['gnss_jamming', 'jamming']);
const LIVE_TTL_MS = 5 * 60 * 1000; // fresh markers linger 5 min

type Band = 'alto' | 'medio' | 'bajo';

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

interface LiveEvent {
  id: string;
  lat: number;
  lng: number;
  at: number;
  plate?: string;
}

const BAND_COLOR: Record<Band, string> = { alto: '#dc2626', medio: '#f59e0b', bajo: '#10b981' };
const BAND_LABEL: Record<Band, string> = { alto: 'Alto', medio: 'Medio', bajo: 'Bajo' };

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function JammerMap() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [live, setLive] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0); // forces re-render to expire live markers

  const fetchHotspots = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/jammers/hotspots?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        router.replace('/login');
        return;
      }
      if (!res.ok) {
        setError('No se pudieron cargar los hotspots de jammers.');
        return;
      }
      setHotspots(await res.json());
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }, [days, router]);

  useEffect(() => {
    fetchHotspots();
  }, [fetchHotspots]);

  // Expire stale live markers on a timer.
  useEffect(() => {
    const iv = setInterval(() => {
      setLive((prev) => prev.filter((e) => Date.now() - e.at < LIVE_TTL_MS));
      setTick((n) => n + 1);
    }, 30_000);
    return () => clearInterval(iv);
  }, []);

  // Real-time jamming events via WebSocket.
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

  const freshLive = live.filter((e) => Date.now() - e.at < LIVE_TTL_MS);

  return (
    <div className="relative w-full h-[560px] rounded-xl overflow-hidden border border-zinc-200">
      {/* pulse animation for live markers */}
      <style>{`
        @keyframes jammerPulse { 0% { stroke-opacity: 0.9; stroke-width: 2; } 100% { stroke-opacity: 0; stroke-width: 22; } }
        .jammer-live-pulse { animation: jammerPulse 1.6s ease-out infinite; }
      `}</style>

      {/* days selector */}
      <div className="absolute top-3 left-3 z-[500] bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-zinc-200 px-2 py-1.5 flex items-center gap-1 text-[11px]">
        <span className="text-zinc-500 font-medium mr-1">Ventana:</span>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-2 py-0.5 rounded font-semibold transition-colors ${days === d ? 'bg-red-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
          >
            {d}d
          </button>
        ))}
      </div>

      <MapContainer
        center={MEXICO_CENTER}
        zoom={5}
        minZoom={4}
        maxZoom={16}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
      >
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
              <div style={{ fontFamily: 'system-ui', fontSize: 12, lineHeight: 1.4 }}>
                <div style={{ fontWeight: 700, color: '#18181b' }}>Zona de jammer</div>
                <div style={{ color: '#71717a', fontSize: 11 }}>
                  {h.event_count} eventos · Severidad {h.severity}/100 ({BAND_LABEL[h.band]})
                </div>
                <div style={{ color: '#71717a', fontSize: 11 }}>Último: {fmtDate(h.last_seen)}</div>
              </div>
            </Tooltip>
          </Circle>
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

      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-zinc-200 px-3 py-2.5 text-[11px] z-[400]">
        <div className="font-bold text-zinc-700 mb-1.5 uppercase tracking-wider text-[10px]">Zonas de jammer</div>
        {(['alto', 'medio', 'bajo'] as Band[]).map((b) => (
          <div key={b} className="flex items-center gap-1.5 mb-1 last:mb-0">
            <span className="w-3 h-3 rounded-full" style={{ background: BAND_COLOR[b], opacity: 0.5 }} />
            <span className="text-zinc-600">
              {BAND_LABEL[b]} {b === 'alto' ? '(≥70)' : b === 'medio' ? '(40-69)' : '(<40)'}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-zinc-100">
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
        <div className="absolute top-3 right-3 z-[500] bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-lg px-3 py-2 max-w-[220px]">
          {error}
        </div>
      )}
      {!loading && !error && hotspots.length === 0 && freshLive.length === 0 && (
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 border border-zinc-200 text-zinc-500 text-[11px] rounded-lg px-3 py-2 max-w-[240px]">
          Sin zonas de jammer en los últimos {days} días. Aparecerán aquí en cuanto se detecten eventos recurrentes.
        </div>
      )}
    </div>
  );
}
