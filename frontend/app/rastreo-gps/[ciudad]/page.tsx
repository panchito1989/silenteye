import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cities, getCityBySlug, getCitiesByState } from '@/lib/cities';
import {
  getStateBySlug,
  getRiskBand,
  getRiskBandColor,
  getRiskBandLabel,
  getNationalRank,
} from '@/lib/risk-zones';
import JsonLd, {
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
  getFaqPageJsonLd,
} from '@/components/JsonLd';

interface Props {
  params: { ciudad: string };
}

export function generateStaticParams() {
  return cities.map((c) => ({ ciudad: c.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const city = getCityBySlug(params.ciudad);
  if (!city) return { title: 'Ciudad no encontrada' };
  // El layout raíz agrega "| SilentEye — Rastreo Satelital GPS México"
  // vía title.template — no incluir la marca aquí.
  const title = `Rastreo GPS en ${city.name} — desde $79 MXN/mes por vehículo`;
  const description = `Rastreo GPS vehicular en ${city.name} para autos, motos, camiones y flotillas: alerta de robo en menos de 3 segundos, sin app y sin contrato. Compatible con GPS Teltonika, Concox, Cobán, Sinotrack y Queclink. Activación el mismo día.`;
  return {
    title,
    description,
    alternates: { canonical: `https://silenteye.com.mx/rastreo-gps/${city.slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `https://silenteye.com.mx/rastreo-gps/${city.slug}`,
    },
  };
}

/** FAQ genéricas adaptadas a la ciudad + las 2 específicas de la ciudad. */
function buildFaq(cityName: string, cityFaq: { q: string; a: string }[]) {
  return [
    {
      q: `¿Cuánto cuesta el rastreo GPS en ${cityName}?`,
      a: `El servicio SilentEye cuesta $99 MXN/mes por vehículo (plan Personal, 1-3 vehículos) o $79 MXN/mes por vehículo (plan Flotillas, 4 o más). Sin contrato ni permanencia. El hardware GPS, si no lo tienes ya, cuesta $350–3,500 MXN una sola vez según el modelo, más un chip SIM con datos (~$50-150 MXN/mes).`,
    },
    {
      q: `¿Necesito que un técnico de SilentEye vaya a ${cityName} a instalar algo?`,
      a: `No. SilentEye es una plataforma web: cualquier instalador local de GPS en ${cityName} (o tú mismo, siguiendo nuestra guía de instalación) conecta el equipo, se apunta el servidor a SilentEye y la unidad aparece en tu panel. No dependes de sucursales ni de visitas técnicas de una central.`,
    },
    ...cityFaq,
    {
      q: `¿SilentEye tiene cobertura en todo ${cityName} y sus alrededores?`,
      a: `Sí. La cobertura depende de la red celular del chip SIM del GPS (Telcel, AT&T o Movistar), no de una "zona de servicio" de SilentEye. Donde tu vehículo tenga señal celular — en la ciudad, en carretera o en cualquier otro estado — lo ves en tiempo real desde el navegador.`,
    },
  ];
}

export default function CiudadPage({ params }: Props) {
  const city = getCityBySlug(params.ciudad);
  if (!city) notFound();

  const state = getStateBySlug(city.stateSlug);
  if (!state) notFound();

  const band = getRiskBand(state.risk_score);
  const rank = getNationalRank(state.code);
  const colors = getRiskBandColor(band);
  const faq = buildFaq(city.name, city.faq);

  // Interlinks: primero ciudades del mismo estado, luego de la misma
  // región, hasta 6 — mantiene el crawl path corto entre landings.
  const sameState = getCitiesByState(city.stateSlug).filter((c) => c.slug !== city.slug);
  const sameRegion = cities.filter(
    (c) => c.region === city.region && c.slug !== city.slug && c.stateSlug !== city.stateSlug,
  );
  const related = [...sameState, ...sameRegion].slice(0, 6);

  const url = `https://silenteye.com.mx/rastreo-gps/${city.slug}`;

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Rastreo GPS vehicular en ${city.name}`,
    serviceType: 'Rastreo GPS y monitoreo vehicular',
    description: `Plataforma de rastreo GPS en tiempo real para autos, motos, camiones y flotillas en ${city.name}, ${state.name}. Alerta de robo en menos de 3 segundos, geocercas, botón de pánico y gestión de flotillas desde el navegador.`,
    provider: {
      '@type': 'Organization',
      name: 'SilentEye',
      url: 'https://silenteye.com.mx',
    },
    areaServed: [
      {
        '@type': 'City',
        name: city.name,
        containedInPlace: {
          '@type': 'State',
          name: state.name,
          containedInPlace: { '@type': 'Country', name: 'México' },
        },
      },
    ],
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: url,
      servicePlatform: 'Web',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Plan Personal',
        price: '99',
        priceCurrency: 'MXN',
        description: `Rastreo GPS en tiempo real para 1-3 vehículos en ${city.name}: $99 MXN/mes por vehículo, sin contrato.`,
        availability: 'https://schema.org/InStock',
        url: 'https://silenteye.com.mx/precios',
      },
      {
        '@type': 'Offer',
        name: 'Plan Flotillas',
        price: '79',
        priceCurrency: 'MXN',
        description: `Rastreo GPS para flotillas de 4+ vehículos en ${city.name}: $79 MXN/mes por vehículo con panel multi-vehículo y reportes.`,
        availability: 'https://schema.org/InStock',
        url: 'https://silenteye.com.mx/cotizar-flota',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={getFaqPageJsonLd(faq)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: 'Inicio', url: 'https://silenteye.com.mx' },
        { name: 'Rastreo GPS por ciudad', url: 'https://silenteye.com.mx/rastreo-gps' },
        { name: city.name, url },
      ])} />
      <JsonLd data={getWebPageJsonLd({
        name: `Rastreo GPS en ${city.name}`,
        description: `Rastreo GPS vehicular en ${city.name}, ${state.name}: autos, motos, camiones y flotillas.`,
        url,
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
            <Link href="/rastreo-gps" className="hidden sm:inline-flex text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              ← Todas las ciudades
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
          <div className="text-[13px] text-zinc-400 mb-4">
            <Link href="/rastreo-gps" className="hover:text-zinc-700 transition-colors">Rastreo GPS por ciudad</Link>
            <span className="mx-2">/</span>
            <span>{city.name}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-6">
            Rastreo GPS en {city.name}
          </h1>
          {/* Párrafo de respuesta directa: qué es, cuánto cuesta, cómo se
              activa — el bloque citable para AI Overviews / ChatGPT. */}
          <p className="text-zinc-600 text-lg leading-relaxed mb-6">
            SilentEye es una plataforma mexicana de rastreo GPS que funciona en {city.name} y en
            todo el país: rastreo en tiempo real desde el navegador (sin app), alerta de robo en
            menos de 3 segundos a tu red cercana, geocercas y botón de pánico. Cuesta desde{' '}
            <strong className="text-zinc-900">$79 MXN/mes por vehículo</strong> (flotillas) o $99
            MXN/mes (1-3 vehículos), sin contrato ni permanencia, y se activa el mismo día con
            cualquier GPS Teltonika, Queclink, Concox, Cobán o Sinotrack — el que ya tengas o uno
            nuevo desde $350 MXN.
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

      {/* Datos rápidos */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900 text-white rounded-2xl p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Población</p>
              <p className="text-lg font-extrabold leading-snug">{city.metroPop}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Riesgo estatal</p>
              <p className="text-lg font-extrabold leading-snug">{state.risk_score}/100</p>
              <Link href={`/zonas-riesgo/${state.slug}`} className="text-[12px] text-zinc-400 underline hover:text-white transition-colors">
                #{rank} de 32 · {state.name}
              </Link>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Alerta de robo</p>
              <p className="text-lg font-extrabold leading-snug">&lt; 3 segundos</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Desde</p>
              <p className="text-lg font-extrabold leading-snug">$79 <span className="text-zinc-400 text-sm font-semibold">MXN/mes</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Contexto local: quién usa GPS aquí */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Contexto local</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-5">
            Quién usa rastreo GPS en {city.name}
          </h2>
          <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">{city.economy}</p>
          <p className="text-zinc-600 text-[15px] leading-relaxed">{city.fleets}</p>
        </div>
      </section>

      {/* Zonas + riesgo estatal */}
      <section className="px-6 py-12 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Corredores y zonas</p>
            <h2 className="text-xl font-extrabold text-zinc-900 mb-4">Dónde conviene vigilar tus unidades</h2>
            <ul className="space-y-2.5">
              {city.zones.map((z) => (
                <li key={z} className="flex items-start gap-2 text-[14px] text-zinc-700">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4.5 8-11a8 8 0 1 0-16 0c0 6.5 8 11 8 11Z"/><circle cx="12" cy="11" r="3"/></svg>
                  {z}
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-zinc-500 mt-4 leading-relaxed">
              Con SilentEye puedes crear una geocerca sobre cualquiera de estas zonas y recibir
              alerta automática de entrada, salida, desvío o parada no programada.
            </p>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Riesgo en {state.name}</p>
            <h2 className="text-xl font-extrabold text-zinc-900 mb-4">El estado en contexto</h2>
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                {getRiskBandLabel(band)} — #{rank} de 32
              </span>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-extrabold text-zinc-900">{state.risk_score}</span>
                <span className="text-zinc-400 text-base pb-1.5">/ 100 índice SESNSP</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full mb-5 overflow-hidden">
                <div className={`h-full ${colors.dot} rounded-full`} style={{ width: `${state.risk_score}%` }} />
              </div>
              <p className="text-[13px] text-zinc-600 leading-relaxed mb-4">
                Carreteras del estado a vigilar: {state.highways.join('; ')}.
              </p>
              <Link href={`/zonas-riesgo/${state.slug}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Ver análisis completo de {state.name}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona la cobertura */}
      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Cobertura</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-5">
            Cómo funciona el rastreo GPS en {city.name}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-zinc-200 rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold mb-4">1</div>
              <h3 className="font-bold text-zinc-900 mb-2 text-[15px]">Tu GPS reporta por red celular</h3>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                El equipo GPS de tu vehículo envía su posición usando el chip SIM (Telcel, AT&T o
                Movistar). Por eso la cobertura en {city.name} — y en cualquier carretera del país —
                es la de la red celular, no una &ldquo;zona de servicio&rdquo;.
              </p>
            </div>
            <div className="border border-zinc-200 rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold mb-4">2</div>
              <h3 className="font-bold text-zinc-900 mb-2 text-[15px]">SilentEye monitorea 24/7</h3>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                La plataforma detecta robo, movimiento no autorizado, corte de corriente, exceso de
                velocidad y salidas de geocerca — y distribuye la alerta en menos de 3 segundos con
                ubicación en vivo.
              </p>
            </div>
            <div className="border border-zinc-200 rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold mb-4">3</div>
              <h3 className="font-bold text-zinc-900 mb-2 text-[15px]">Tú lo ves desde el navegador</h3>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                Sin app y sin instalar software: el panel funciona en cualquier celular o
                computadora. Activación el mismo día apuntando tu GPS al servidor de SilentEye.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="px-6 py-14 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Precios</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6">
            Planes para {city.name} — mismos precios en todo México
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <Link href="/precios" className="block bg-white rounded-xl p-6 border-2 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Personal</span>
              </div>
              <h3 className="text-lg font-extrabold text-zinc-900 mb-1">$99 MXN/mes por vehículo</h3>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                1 a 3 vehículos. Rastreo en tiempo real, alertas de robo, geocercas e historial de 30 días.
              </p>
            </Link>
            <Link href="/cotizar-flota" className="block bg-white rounded-xl p-6 border-2 border-zinc-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Flotillas</span>
              </div>
              <h3 className="text-lg font-extrabold text-zinc-900 mb-1">$79 MXN/mes por vehículo</h3>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                4+ unidades. Panel multi-vehículo, conductores, alertas de velocidad, historial de 90 días y reportes PDF.
              </p>
            </Link>
          </div>
          <p className="text-[13px] text-zinc-500 leading-relaxed">
            Sin contrato ni permanencia. El botón de emergencia <Link href="/sos" className="text-blue-600 font-semibold hover:underline">SOS ciudadano</Link> es
            gratis para cualquier persona en {city.name}, sin GPS y sin registro previo. ¿Vienes de
            otro proveedor? <Link href="/comparar/calculadora" className="text-blue-600 font-semibold hover:underline">Calcula tu ahorro</Link> contra
            Hunter, LoJack o Skyguard.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-14">
        <div className="max-w-3xl mx-auto">
          <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Preguntas frecuentes</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-8">
            Rastreo GPS en {city.name}: lo que más preguntan
          </h2>
          <div className="space-y-6">
            {faq.map((item) => (
              <div key={item.q} className="border-b border-zinc-100 pb-6">
                <h3 className="font-bold text-zinc-900 text-[15px] mb-2">{item.q}</h3>
                <p className="text-[14px] text-zinc-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-14">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-zinc-900 text-white rounded-2xl px-8 py-12 md:px-14 md:py-14 overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative max-w-xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
                Empieza a rastrear tus vehículos en {city.name} hoy
              </h2>
              <p className="text-zinc-400 text-[15px] leading-relaxed mb-8">
                Crea tu cuenta gratis, conecta tu GPS y ve tu primera unidad en el mapa el mismo
                día. Para flotillas, cotiza por WhatsApp y te respondemos en menos de 1 minuto.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 bg-white rounded-lg hover:bg-zinc-100 transition-colors">
                  Comenzar gratis
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
                <Link href="/cotizar-flota" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-white/10 rounded-lg hover:bg-white/15 transition-colors">
                  Cotizar flotilla
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Otras ciudades */}
      {related.length > 0 && (
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Rastreo GPS en otras ciudades</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((o) => (
                <Link
                  key={o.slug}
                  href={`/rastreo-gps/${o.slug}`}
                  className="border border-zinc-200 rounded-lg px-4 py-3 hover:border-blue-500 transition-colors"
                >
                  <span className="text-[13px] font-semibold text-zinc-900 block">Rastreo GPS en {o.name}</span>
                  <span className="text-[11px] text-zinc-400">{o.region}</span>
                </Link>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-[13px]">
              <Link href="/rastreo-gps" className="text-blue-600 font-semibold hover:underline">Ver las {cities.length} ciudades</Link>
              <Link href={`/zonas-riesgo/${state.slug}`} className="text-blue-600 font-semibold hover:underline">Zona de riesgo: {state.name}</Link>
              <Link href="/guia-gps-flotillas-mexico" className="text-blue-600 font-semibold hover:underline">Guía: elegir GPS para flotilla</Link>
            </div>
          </div>
        </section>
      )}

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
            <Link href="/rastreo-gps" className="hover:text-zinc-600">Ciudades</Link>
            <Link href="/zonas-riesgo" className="hover:text-zinc-600">Estados</Link>
            <Link href="/comparar" className="hover:text-zinc-600">Comparar</Link>
            <Link href="/precios" className="hover:text-zinc-600">Precios</Link>
            <span className="text-zinc-300">SilentEye &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
