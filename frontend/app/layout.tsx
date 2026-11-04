import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';
import WhatsAppButton from '@/components/WhatsAppButton';
import { LocaleProvider } from '@/contexts/LocaleContext';
import MetadataUpdater from '@/components/MetadataUpdater';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

const SITE_URL = 'https://silenteye.com.mx';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Rastreo Satelital GPS para Camiones y Flotillas | SilentEye',
    template: '%s | SilentEye',
  },
  description:
    'Plataforma de rastreo satelital y GPS para camiones, trailers y flotillas en México. Alerta de robo en 3 segundos a conductores cercanos: sin central, sin llamada, sin espera. Compatible con Teltonika, Queclink, Concox, Cobán y Sinotrack. Desde $79 MXN/mes por vehículo.',
  authors: [{ name: 'SilentEye', url: SITE_URL }],
  creator: 'SilentEye',
  publisher: 'SilentEye',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    alternateLocale: 'en_US',
    url: SITE_URL,
    siteName: 'SilentEye',
    title: 'SilentEye — Rastreo Satelital y GPS para Camiones, Trailers y Flotillas | México',
    description:
      'Rastreo satelital y GPS para camiones, trailers y flotillas. Alerta de robo en 3 segundos a conductores cercanos. Sin central, sin llamada. Desde $79 MXN/mes. México.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'SilentEye — Alerta de robo vehicular en 3 segundos a conductores cercanos',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SilentEye — Rastreo Satelital GPS para Camiones y Flotillas | México',
    description:
      'Rastreo satelital de camiones, trailers y flotillas. Alerta a la red en 3 segundos: sin central, sin llamada. Plataforma compatible con Teltonika, Queclink, Concox, Cobán y Sinotrack.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: SITE_URL,
    languages: { 'es-MX': SITE_URL, 'en-US': SITE_URL },
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192' }],
  },
  manifest: '/manifest.json',
  category: 'technology',
  verification: {
    google: 'BlJAbtY9k43s6l9ZPdXtog1eLX9iupG-s1fpC6-vRAc',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body className="bg-white text-zinc-900 antialiased" style={{ minHeight: '100vh', margin: 0 }}>
        <LocaleProvider>
          <MetadataUpdater />
          {children}
          <CookieConsent />
          <WhatsAppButton />
        </LocaleProvider>
      </body>
    </html>
  );
}
