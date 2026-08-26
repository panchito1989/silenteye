import type { Metadata } from 'next';
import Link from 'next/link';
import { cities, regionOrder, getCitiesByRegion } from '@/lib/cities';
import { getStateBySlug, getRiskBand, getRiskBandColor } from '@/lib/risk-zones';
import JsonLd, { getBreadcrumbJsonLd, getWebPageJsonLd, getFaqPageJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Rastreo GPS en México por ciudad — cobertura en toda la república',
  description:
    'Rastreo GPS vehicular con cobertura nacional: CDMX, Guadalajara, Monterrey, Puebla, Tijuana, Mérida, Cancún y toda la república. Alerta de robo en menos de 3 segundos, desde $79 MXN/mes por vehículo, sin app y sin contrato.',
  alternates: { canonical: 'https://silenteye.com.mx/rastreo-gps' },
  openGraph: {
    type: 'website',
    title: 'Rastreo GPS en México por ciudad — cobertura en toda la república',
    description:
      'Rastreo GPS para autos, motos, camiones y flotillas en cualquier ciudad de México. Alerta de robo en menos de 3 segundos, desde $79 MXN/mes.',
    url: 'https://silenteye.com.mx/rastreo-gps',
  },
};

const hubFaq = [
  {
    q: '¿SilentEye tiene cobertura en mi ciudad?',
    a: 'Sí. SilentEye funciona en cualquier ciudad y carretera de México porque el GPS de tu vehículo reporta por la red celular de su chip SIM (Telcel, AT&T o Movistar), no por una "zona de servicio". Si en tu ciudad hay señal de celular, hay rastreo — en los 32 estados.',
  },
  {
    q: '¿El precio cambia según la ciudad?',
    a: 'No. El precio es el mismo en toda la república: $99 MXN/mes por vehículo (plan Personal, 1-3 vehículos) o $79 MXN/mes por vehículo (plan Flotillas, 4+), sin contrato ni permanencia. No hay cargos por "cobertura extendida" ni por operar en varias ciudades.',
  },
  {
    q: '¿Necesito una sucursal o un técnico de SilentEye en mi ciudad?',
    a: 'No. La plataforma es 100% web y cualquier instalador local de GPS puede dejar tu equipo reportando a SilentEye en una visita (o tú mismo, con nuestra guía de instalación). Por eso podemos atender flotas en Tijuana, Mérida o cualquier punto del país el mismo día.',
  },
  {
    q: '¿Qué pasa si mi vehículo viaja entre ciudades o estados?',
    a: 'Nada especial: lo sigues viendo en el mismo mapa. Una unidad puede salir de Monterrey, cruzar San Luis Potosí y llegar a CDMX y su recorrido completo queda en el historial, con las mismas alertas de desvío, velocidad y pánico durante todo el trayecto.',
  },
];

export default function RastreoGpsHub() {
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Rastreo GPS por ciudad en México',
    description: 'Ciudades de México con páginas de cobertura de rastreo GPS vehicular SilentEye.',
    numberOfItems: cities.length,
    itemListElement: cities.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `Rastreo GPS en ${c.name}`,
      url: `https://silenteye.com.mx/rastreo-gps/${c.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={getFaqPageJsonLd(hubFaq)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: 'Inicio', url: 'https://silenteye.com.mx' },
        { name: 'Rastreo GPS por ciudad', url: 'https://silenteye.com.mx/rastreo-gps' },
      ])} />
      <JsonLd data={getWebPageJsonLd({
        name: 'Rastreo GPS en México por ciudad',
        description: 'Cobertura de rastreo GPS vehicular en toda la república mexicana.',
        url: 'https://silenteye.com.mx/rastreo-gps',
      })} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span className="text-lg font-bold tracking-tight">SilentEye</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/zonas-riesgo" className="hidden sm:inline-flex text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Riesgo por estado
            </Link>
            <Link href="/login" className="px-4 py-1.5 text-[13px] font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
              Comenzar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 pt-12 pb-10 md:pt-20 md:pb-14">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-6">
            Rastreo GPS en México: cobertura en toda la república
          </h1>
          <p className="text-zinc-600 text-lg leading-relaxed mb-4">
            SilentEye rastrea autos, motos, camiones, trailers y flotillas en{' '}
            <strong className="text-zinc-900">los 32 estados de México</strong>. La cobertura no
            depende de sucursales ni de una &ldquo;zona de servicio&rdquo;: tu GPS reporta por la red
            celular de su chip SIM (Telcel, AT&T o Movistar), así que donde hay señal de celular hay
            rastreo en tiempo real — en la ciudad, en carretera y en cualquier estado.
          </p>
          <p className="text-zinc-600 text-[15px] leading-relaxed mb-8">
            El precio es el mismo en todo el país: desde{' '}
            <strong className="text-zinc-900">$79 MXN/mes por vehículo</strong> en flotillas (4+) o
            $99 MXN/mes de 1 a 3 vehículos, sin contrato. Elige tu ciudad para ver el contexto
            local: quién usa GPS ahí, qué corredores conviene vigilar y qué equipo recomendamos.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
              Comenzar gratis
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <Link href="/cotizar-flota" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors">
              Cotizar flotilla
            </Link>
          </div>
        </div>
      </header>

      {/* Ciudades por región */}
      <section className="px-6 py-12 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Ciudades</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-8">
            Elige tu ciudad
          </h2>
          <div className="space-y-10">
            {regionOrder.map((region) => {
              const regionCities = getCitiesByRegion(region);
              if (regionCities.length === 0) return null;
              return (
                <div key={region}>
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-zinc-500 mb-4">{region}</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {regionCities.map((c) => {
                      const state = getStateBySlug(c.stateSlug);
                      const band = state ? getRiskBand(state.risk_score) : 'bajo';
                      const colors = getRiskBandColor(band);
                      return (
                        <Link
                          key={c.slug}
                          href={`/rastreo-gps/${c.slug}`}
                          className="bg-white border border-zinc-200 rounded-lg px-4 py-3.5 hover:border-blue-500 transition-colors flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="text-[14px] font-semibold text-zinc-900 block">{c.name}</span>
                            <span className="text-[11px] text-zinc-400">{state?.name}</span>
                          </div>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} title={`Riesgo estatal: ${state?.risk_score}/100`} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[13px] text-zinc-500 mt-8 leading-relaxed">
            ¿Tu ciudad no aparece? SilentEye funciona igual: la lista crece, pero la cobertura ya es
            nacional. <Link href="/cotizar-flota" className="text-blue-600 font-semibold hover:underline">Cotiza aquí</Link>{' '}
            o revisa el <Link href="/zonas-riesgo" className="text-blue-600 font-semibold hover:underline">análisis de riesgo de tu estado</Link>.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-14">
        <div className="max-w-3xl mx-auto">
          <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Preguntas frecuentes</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-8">
            Cobertura nacional: lo que más preguntan
          </h2>
          <div className="space-y-6">
            {hubFaq.map((item) => (
              <div key={item.q} className="border-b border-zinc-100 pb-6">
                <h3 className="font-bold text-zinc-900 text-[15px] mb-2">{item.q}</h3>
                <p className="text-[14px] text-zinc-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-zinc-900 text-white rounded-2xl px-8 py-12 md:px-14 md:py-14 overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative max-w-xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
                Una plataforma, toda la república
              </h2>
              <p className="text-zinc-400 text-[15px] leading-relaxed mb-8">
                Da de alta unidades en varias ciudades y velas todas en el mismo panel. Sin
                sucursales, sin contratos, sin app: solo tu GPS y el navegador.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 bg-white rounded-lg hover:bg-zinc-100 transition-colors">
                  Comenzar gratis
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
                <Link href="/comparar" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-white/10 rounded-lg hover:bg-white/15 transition-colors">
                  Comparar vs Hunter y LoJack
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span className="text-sm font-bold">SilentEye</span>
          </Link>
          <div className="flex items-center gap-4 text-[12px] text-zinc-400">
            <Link href="/zonas-riesgo" className="hover:text-zinc-600">Estados</Link>
            <Link href="/comparar" className="hover:text-zinc-600">Comparar</Link>
            <Link href="/precios" className="hover:text-zinc-600">Precios</Link>
            <Link href="/blog" className="hover:text-zinc-600">Blog</Link>
            <span className="text-zinc-300">SilentEye &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
