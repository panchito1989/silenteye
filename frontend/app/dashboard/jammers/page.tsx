'use client';
/**
 * SilentEye — Plataforma de Seguridad Vehicular
 * Copyright (c) 2026 Christian Fiesco. All rights reserved.
 * PROPRIETARY AND CONFIDENTIAL — See LICENSE file for details.
 *
 * Mapa de zonas de jammer — inteligencia de robo a transporte.
 */

import Link from 'next/link';
import JammerMapClient from '@/components/JammerMapClient';

export default function JammersPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-700">
            ← Volver al panel
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">Zonas de jammer</h1>
          <p className="mt-1 text-sm text-zinc-500 max-w-2xl">
            Puntos donde se detectan de forma recurrente bloqueadores de señal GNSS (event 66/246),
            el paso previo típico en el robo a carga. Las zonas se agrupan por cercanía y frecuencia;
            los eventos nuevos aparecen en vivo.
          </p>
        </div>
        <JammerMapClient />
      </div>
    </main>
  );
}
