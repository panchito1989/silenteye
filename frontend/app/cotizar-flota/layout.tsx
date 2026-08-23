import type { Metadata } from 'next';

// /cotizar-flota es un client component ('use client'), así que su
// metadata vive aquí — mismo patrón que /login y /sos. Sin este layout
// la página no tenía title único, description ni canonical.
export const metadata: Metadata = {
  title: 'Cotizar GPS para Flotilla en México — Respuesta en 1 Minuto | SilentEye',
  description:
    'Cotiza rastreo GPS para tu flotilla en México: trailers, camiones de carga, camionetas y unidades mixtas. Desde $79 MXN/mes por vehículo (4+ unidades), sin contrato de permanencia. Cobertura nacional en los 32 estados. Respuesta por WhatsApp en menos de 1 minuto.',
  keywords: [
    'cotizar gps para flotilla',
    'cotizar rastreo satelital camiones',
    'gps para flotillas precio',
    'rastreo gps flotillas México',
    'cotización gps transporte de carga',
  ],
  alternates: { canonical: 'https://silenteye.com.mx/cotizar-flota' },
  openGraph: {
    type: 'website',
    title: 'Cotizar GPS para Flotilla — SilentEye México',
    description:
      'Rastreo GPS para flotillas desde $79 MXN/mes por vehículo. Cotiza en 1 minuto por WhatsApp. Cobertura nacional.',
    url: 'https://silenteye.com.mx/cotizar-flota',
    locale: 'es_MX',
  },
};

export default function CotizarFlotaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
