import type { Metadata } from 'next';
import Link from 'next/link';
import {
  stateRisk,
  getRiskBand,
  getRiskBandColor,
  getRiskBandLabel,
} from '@/lib/risk-zones';
import JsonLd, { getBreadcrumbJsonLd, getFaqPageJsonLd } from '@/components/JsonLd';

/**
 * /estadisticas-robo-vehicular-mexico — página de referencia nacional
 * pensada para ser citable por motores de IA (ChatGPT, Perplexity,
 * Gemini, AI Overviews) y por prensa/blogs.
 *
 * Reglas de datos:
 * - El ranking por estado usa el mismo índice SESNSP-derivado que
 *   lib/risk-zones.ts y el backend (dataset CNSP/38/15, corte
 *   2026-03-31). Es una estimación propia construida sobre datos
 *   públicos y así se declara en la sección de metodología.
 * - Las cifras nacionales son rangos redondeados de reportes públicos
 *   (SESNSP, AMIS, OCRA, ANERPV) con enlace a la fuente. Nada de
 *   precisión falsa: siempre "más de", "cerca de" o "alrededor de".
 */

const LAST_UPDATED = '2026-08-23';
const PAGE_URL = 'https://silenteye.com.mx/estadisticas-robo-vehicular-mexico';

export const metadata: Metadata = {
  title: 'Robo de Vehículos en México 2026: Estadísticas y Ranking por Estado',
  description:
    'Estadísticas de robo de vehículos y carga en México 2026: ranking de riesgo de los 32 estados (índice basado en datos SESNSP), cifras nacionales de AMIS y OCRA, corredores críticos de robo al autotransporte según ANERPV, y cómo prevenirlo con GPS.',
  keywords: [
    'robo de vehículos en México',
    'estadísticas robo de autos México 2026',
    'estados con más robo de autos',
    'robo de carga en México',
    'robo al autotransporte ANERPV',
    'índice de robo vehicular por estado',
    'recuperación de vehículos robados',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'article',
    title: 'Robo de vehículos en México 2026 — Estadísticas y ranking por estado',
    description:
      'Ranking de riesgo de robo vehicular de los 32 estados de México, cifras nacionales con fuentes (SESNSP, AMIS, ANERPV) y corredores críticos de robo de carga.',
    url: PAGE_URL,
    locale: 'es_MX',
    modifiedTime: LAST_UPDATED,
  },
};

// ── Fuentes oficiales citadas ──
const fuentes = [
  {
    nombre: 'SESNSP — Incidencia delictiva del fuero común',
    url: 'https://www.gob.mx/sesnsp/acciones-y-programas/incidencia-delictiva-87005',
    nota: 'Carpetas de investigación por robo de vehículo automotor, publicadas mensualmente por el Secretariado Ejecutivo del Sistema Nacional de Seguridad Pública.',
  },
  {
    nombre: 'AMIS — Asociación Mexicana de Instituciones de Seguros',
    url: 'https://amis.com.mx',
    nota: 'Reportes semestrales y anuales de robo y recuperación de vehículos asegurados.',
  },
  {
    nombre: 'OCRA — Oficina Coordinadora de Riesgos Asegurados',
    url: 'https://ocra.com.mx',
    nota: 'Estadísticas de robo y recuperación de unidades aseguradas, por estado y por modelo.',
  },
  {
    nombre: 'ANERPV — Asociación Nacional de Empresas de Rastreo y Protección Vehicular',
    url: 'https://anerpv.com.mx',
    nota: 'Observatorio mensual de robo al autotransporte de carga con distribución por entidad y por corredor.',
  },
];

// ── Corredores de robo al autotransporte (exposición según índice
// estatal + reportes públicos ANERPV; clasificación propia) ──
const corredores = [
  {
    corredor: 'Autopista México–Puebla / Puebla–Orizaba (150D)',
    estados: 'Edomex, Puebla, Tlaxcala, Veracruz',
    exposicion: 'Muy alta',
    nota: 'El tramo más citado en reportes de robo a transporte de carga; concentra cruces urbanos de alto riesgo como San Martín Texmelucan.',
  },
  {
    corredor: 'Arco Norte',
    estados: 'Edomex, Hidalgo, Tlaxcala, Puebla',
    exposicion: 'Muy alta',
    nota: 'Libramiento de carga del Valle de México; alta densidad de tractocamiones y asaltos nocturnos.',
  },
  {
    corredor: 'Autopista México–Querétaro (57D)',
    estados: 'CDMX, Edomex, Hidalgo, Querétaro',
    exposicion: 'Alta',
    nota: 'Principal salida de carga al Bajío y al norte; incidentes concentrados en el tramo mexiquense.',
  },
  {
    corredor: 'Corredor del Bajío (45)',
    estados: 'Querétaro, Guanajuato, Jalisco',
    exposicion: 'Alta',
    nota: 'Zona industrial y logística; Guanajuato es de los estados con mayor índice del país.',
  },
  {
    corredor: 'México–Veracruz (140 / 145) y Golfo (180)',
    estados: 'Puebla, Veracruz, Tabasco',
    exposicion: 'Alta',
    nota: 'Rutas de puerto: carga contenerizada y agroindustrial con robo recurrente.',
  },
  {
    corredor: 'Occidente (15 / 54, Guadalajara–Manzanillo)',
    estados: 'Jalisco, Colima, Michoacán',
    exposicion: 'Media-alta',
    nota: 'Conexión al puerto de Manzanillo; el riesgo se concentra en la zona metropolitana de Guadalajara.',
  },
];

const statsFaq = [
  {
    q: '¿Cuál es el estado con más robo de vehículos en México?',
    a: 'De acuerdo con el índice de riesgo de SilentEye (construido sobre datos públicos del SESNSP), el Estado de México encabeza el ranking nacional con 95/100 puntos, seguido de Jalisco (85), Guanajuato (80), Puebla (80) y Baja California (75). La zona metropolitana del Valle de México (Edomex + CDMX) concentra la mayor cantidad absoluta de robos de vehículo del país.',
  },
  {
    q: '¿Cuántos vehículos se roban al día en México?',
    a: 'En promedio se denuncian más de 200 robos de vehículo automotor al día en México, según las carpetas de investigación que publica mensualmente el SESNSP. La cifra real es mayor: solo alrededor de 3 de cada 10 vehículos en circulación están asegurados según AMIS, y el robo de vehículos no asegurados se denuncia menos.',
  },
  {
    q: '¿Qué porcentaje de los autos robados se recupera?',
    a: 'Históricamente se recuperan alrededor de 4 de cada 10 vehículos asegurados robados, de acuerdo con los reportes de AMIS y OCRA. La probabilidad de recuperación cae drásticamente con el paso de las horas: la mayoría de las unidades recuperadas se localizan en los primeros días, y un GPS con alerta inmediata eleva de forma importante esa probabilidad.',
  },
  {
    q: '¿Dónde se roba más carga y camiones en México?',
    a: 'El robo al autotransporte de carga se concentra de forma persistente en el corredor del centro del país: Estado de México, Puebla, Tlaxcala, Veracruz, Guanajuato y Michoacán, de acuerdo con los reportes mensuales de la ANERPV. Los tramos más citados son la autopista México–Puebla (150D), el Arco Norte y la México–Querétaro (57D).',
  },
  {
    q: '¿Qué vehículos se roban más en México?',
    a: 'Las listas de AMIS y OCRA muestran de forma consistente que los vehículos de trabajo de alto volumen encabezan el robo asegurado: pickups como la Nissan NP300, sedanes como Versa y Aveo, y motocicletas — el segmento que más ha crecido en robo en los últimos años. En carga, los tractocamiones y remolques con mercancía de reventa rápida (abarrotes, electrónica, autopartes) son el objetivo principal.',
  },
  {
    q: '¿Cómo se puede prevenir el robo de un vehículo o de carga?',
    a: 'Las medidas con mejor relación costo-beneficio son: GPS oculto con alerta automática de movimiento no autorizado y corte de corriente, geocercas de zona segura, botón de pánico físico para el conductor en transporte de carga, rutas y horarios variables en corredores de alta exposición, y una plataforma que distribuya la alerta en segundos — no una central telefónica. SilentEye alerta a la red cercana en menos de 3 segundos desde $79 MXN/mes por vehículo.',
  },
];

export default function EstadisticasRoboPage() {
  const sorted = [...stateRisk].sort((a, b) => b.risk_score - a.risk_score);
  const altoCount = stateRisk.filter((s) => getRiskBand(s.risk_score) === 'alto').length;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Robo de vehículos en México 2026: estadísticas y ranking de riesgo por estado',
    description:
      'Ranking de riesgo de robo vehicular de los 32 estados de México basado en datos SESNSP, cifras nacionales de AMIS/OCRA y corredores críticos de robo al autotransporte según ANERPV.',
    url: PAGE_URL,
    datePublished: '2026-08-23',
    dateModified: LAST_UPDATED,
    inLanguage: 'es-MX',
    author: { '@type': 'Organization', name: 'SilentEye', url: 'https://silenteye.com.mx' },
    publisher: {
      '@type': 'Organization',
      name: 'SilentEye',
      url: 'https://silenteye.com.mx',
      logo: { '@type': 'ImageObject', url: 'https://silenteye.com.mx/icon-512.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
    spatialCoverage: { '@type': 'Country', name: 'México' },
    citation: fuentes.map((f) => ({ '@type': 'CreativeWork', name: f.nombre, url: f.url })),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', 'article h2'],
    },
  };

  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Índice SilentEye de riesgo de robo vehicular por estado (México)',
    description:
      'Índice 0-100 de riesgo de robo vehicular para las 32 entidades federativas de México, construido a partir del dataset público de unidades robadas del SESNSP (CNSP/38/15). Incluye banda de riesgo, ciudades principales y carreteras críticas por estado.',
    url: PAGE_URL,
    creator: { '@type': 'Organization', name: 'SilentEye', url: 'https://silenteye.com.mx' },
    dateModified: LAST_UPDATED,
    inLanguage: 'es-MX',
    spatialCoverage: { '@type': 'Country', name: 'México' },
    license: 'https://silenteye.com.mx/terminos',
    isBasedOn: 'https://www.gob.mx/sesnsp/acciones-y-programas/incidencia-delictiva-87005',
    keywords: ['robo de vehículos', 'México', 'SESNSP', 'riesgo por estado', 'robo de carga'],
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={datasetJsonLd} />
      <JsonLd data={getFaqPageJsonLd(statsFaq)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: 'Inicio', url: 'https://silenteye.com.mx' },
        { name: 'Estadísticas de robo vehicular', url: PAGE_URL },
      ])} />

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
            <Link href="/zonas-riesgo" className="hidden sm:inline-flex text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Zonas de riesgo</Link>
            <Link href="/precios" className="hidden sm:inline-flex text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Precios</Link>
            <Link href="/login" className="px-4 py-1.5 text-[13px] font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">Comenzar gratis</Link>
          </div>
        </div>
      </nav>

      <article>
        {/* Header */}
        <header className="px-6 pt-12 pb-8 md:pt-20 md:pb-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-[13px] text-zinc-400 mb-4">
              <Link href="/" className="hover:text-zinc-700 transition-colors">Inicio</Link>
              <span className="mx-2">/</span>
              <span>Estadísticas de robo vehicular</span>
            </div>
            <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Datos con fuentes públicas</p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-6">
              Robo de vehículos en México: estadísticas y ranking de riesgo por estado
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed mb-4">
              Esta página concentra, en un solo lugar y con fuentes verificables, el panorama del robo de
              vehículos y de carga en México: cuántas unidades se roban, dónde, qué se recupera y qué
              corredores concentran el robo al autotransporte. El ranking por estado usa el índice de
              SilentEye construido sobre el dataset público de unidades robadas del{' '}
              <a href="https://www.gob.mx/sesnsp/acciones-y-programas/incidencia-delictiva-87005" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">SESNSP</a>.
            </p>
            <p className="text-[13px] text-zinc-400">
              Última actualización: <time dateTime={LAST_UPDATED}>23 de agosto de 2026</time> · Lectura: 9 min ·
              Puedes citar esta página enlazando a silenteye.com.mx
            </p>
          </div>
        </header>

        {/* Cifras clave */}
        <section className="px-6 pb-12" aria-labelledby="cifras-clave">
          <div className="max-w-4xl mx-auto">
            <h2 id="cifras-clave" className="sr-only">Cifras clave del robo vehicular en México</h2>
            <div className="bg-zinc-900 text-white rounded-2xl p-8 md:p-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <p className="text-4xl font-extrabold mb-1">+200</p>
                <p className="text-[13px] text-zinc-400 leading-relaxed">robos de vehículo denunciados al día en promedio (SESNSP)</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold mb-1">4 de 10</p>
                <p className="text-[13px] text-zinc-400 leading-relaxed">vehículos asegurados robados se recuperan, aprox. (AMIS/OCRA)</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold mb-1">{altoCount}</p>
                <p className="text-[13px] text-zinc-400 leading-relaxed">estados en banda de riesgo alto (índice ≥ 70/100)</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold mb-1">6</p>
                <p className="text-[13px] text-zinc-400 leading-relaxed">estados concentran el robo al autotransporte de carga (ANERPV)</p>
              </div>
            </div>
            <p className="text-[12px] text-zinc-400 mt-3 leading-relaxed">
              Cifras redondeadas a partir de los reportes públicos citados en la sección de fuentes. El
              índice por estado es una estimación propia de SilentEye; consulta la metodología al final.
            </p>
          </div>
        </section>

        {/* Panorama nacional */}
        <section className="px-6 py-12" aria-labelledby="panorama">
          <div className="max-w-4xl mx-auto">
            <h2 id="panorama" className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-6">
              Panorama nacional del robo de vehículos
            </h2>
            <div className="space-y-4 text-[15px] text-zinc-600 leading-relaxed">
              <p>
                El robo de vehículo automotor es uno de los delitos patrimoniales más frecuentes de México.
                Las carpetas de investigación del{' '}
                <a href="https://www.gob.mx/sesnsp/acciones-y-programas/incidencia-delictiva-87005" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">SESNSP</a>{' '}
                registran en promedio <strong className="font-semibold text-zinc-900">más de 200 robos de vehículo al día</strong> a
                nivel nacional. La cifra real es mayor: según{' '}
                <a href="https://amis.com.mx" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">AMIS</a>,
                solo alrededor de 3 de cada 10 vehículos en circulación cuentan con seguro, y el robo de
                unidades no aseguradas se denuncia con menor frecuencia.
              </p>
              <p>
                En vehículos asegurados, la tendencia de largo plazo es a la baja desde el pico histórico:
                AMIS reportó <strong className="font-semibold text-zinc-900">más de 90 mil unidades aseguradas robadas</strong> en
                su corte anual 2017–2018 (el peor registro), contra{' '}
                <strong className="font-semibold text-zinc-900">cerca de 56 mil</strong> en el corte 2023–2024 — una mejora
                real, pero todavía más de 150 unidades aseguradas robadas al día. La recuperación se ha
                mantenido <strong className="font-semibold text-zinc-900">alrededor de 4 de cada 10 unidades</strong> según
                AMIS y{' '}
                <a href="https://ocra.com.mx" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">OCRA</a>.
              </p>
              <p>
                La geografía importa más que el promedio: la zona metropolitana del Valle de México
                (Estado de México + CDMX), Jalisco, Guanajuato, Puebla y Baja California concentran de
                forma persistente la mayor parte del robo de vehículos del país, mientras que la península
                de Yucatán y estados como Aguascalientes o Baja California Sur registran una fracción del
                riesgo. Por eso el ranking por estado — abajo — es la forma correcta de leer el problema.
              </p>
            </div>
          </div>
        </section>

        {/* Tabla ranking 32 estados */}
        <section className="px-6 py-12 bg-zinc-50 border-y border-zinc-100" aria-labelledby="ranking">
          <div className="max-w-5xl mx-auto">
            <h2 id="ranking" className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-3">
              Ranking de riesgo de robo vehicular: los 32 estados
            </h2>
            <p className="text-[15px] text-zinc-600 leading-relaxed mb-8 max-w-3xl">
              Índice 0–100 construido sobre el dataset público de unidades robadas del SESNSP (corte
              marzo 2026). A mayor índice, mayor riesgo relativo. Cada estado enlaza a su análisis
              detallado con ciudades, carreteras críticas y GPS recomendado.
            </p>
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <table className="w-full text-[13px] border-collapse">
                <caption className="sr-only">
                  Ranking de riesgo de robo vehicular por estado en México, índice 0 a 100 basado en datos SESNSP
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">#</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">Estado</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">Índice /100</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">Banda</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200 hidden md:table-cell">Ciudades principales</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s, i) => {
                    const band = getRiskBand(s.risk_score);
                    const colors = getRiskBandColor(band);
                    return (
                      <tr key={s.slug} className="border-b border-zinc-100 last:border-b-0">
                        <td className="py-2.5 px-4 text-zinc-400 font-mono">{i + 1}</td>
                        <th scope="row" className="py-2.5 px-4 text-left font-semibold">
                          <Link href={`/zonas-riesgo/${s.slug}`} className="text-zinc-900 hover:text-blue-600 transition-colors">
                            {s.name}
                          </Link>
                        </th>
                        <td className="py-2.5 px-4 font-mono text-zinc-700">{s.risk_score}</td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${colors.bg} ${colors.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            {getRiskBandLabel(band)}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-zinc-500 hidden md:table-cell">{s.principalCities.slice(0, 3).join(', ')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-zinc-400 mt-3">
              Fuente: índice SilentEye sobre dataset SESNSP CNSP/38/15 (unidades robadas, corte 2026-03-31).
              Ver <a href="#metodologia" className="underline hover:text-zinc-600">metodología</a>.
            </p>
          </div>
        </section>

        {/* Robo de carga */}
        <section className="px-6 py-12" aria-labelledby="carga">
          <div className="max-w-5xl mx-auto">
            <h2 id="carga" className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-6">
              Robo al autotransporte de carga: los corredores críticos
            </h2>
            <div className="space-y-4 text-[15px] text-zinc-600 leading-relaxed mb-8 max-w-3xl">
              <p>
                El robo de carga tiene su propia geografía, distinta a la del robo de autos particulares.
                Los reportes mensuales de la{' '}
                <a href="https://anerpv.com.mx" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">ANERPV</a>{' '}
                muestran una concentración persistente en el corredor del centro del país:{' '}
                <strong className="font-semibold text-zinc-900">Estado de México, Puebla, Tlaxcala, Veracruz, Guanajuato y Michoacán</strong>{' '}
                suman de forma recurrente la gran mayoría de los eventos contra el autotransporte. La
                mayoría ocurre con la unidad en movimiento o en paradas no seguras, y de noche.
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-[13px] border-collapse">
                <caption className="sr-only">Corredores carreteros con mayor exposición a robo de carga en México</caption>
                <thead>
                  <tr>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">Corredor</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">Estados</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">Exposición</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200 hidden md:table-cell">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {corredores.map((c) => (
                    <tr key={c.corredor} className="border-b border-zinc-100 last:border-b-0">
                      <th scope="row" className="py-2.5 px-4 text-left font-semibold text-zinc-900">{c.corredor}</th>
                      <td className="py-2.5 px-4 text-zinc-600">{c.estados}</td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${c.exposicion === 'Muy alta' ? 'bg-red-50 text-red-700' : c.exposicion === 'Alta' ? 'bg-amber-50 text-amber-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {c.exposicion}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-zinc-500 hidden md:table-cell">{c.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-zinc-400 mt-3 max-w-3xl">
              Clasificación de exposición: estimación propia de SilentEye combinando el índice estatal
              SESNSP con la distribución por entidad de los reportes públicos de ANERPV. Para rutas y
              recomendaciones por estado, consulta{' '}
              <Link href="/zonas-riesgo" className="underline hover:text-zinc-600">zonas de riesgo</Link>.
            </p>
          </div>
        </section>

        {/* Qué se roba más + recuperación */}
        <section className="px-6 py-12 bg-zinc-50 border-y border-zinc-100" aria-labelledby="perfil">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
            <div>
              <h2 id="perfil" className="text-xl font-extrabold text-zinc-900 mb-4">¿Qué vehículos se roban más?</h2>
              <ul className="space-y-3 text-[14px] text-zinc-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span><strong className="font-semibold text-zinc-900">Pickups de trabajo</strong> (p. ej. Nissan NP300) encabezan consistentemente las listas de AMIS/OCRA de unidades aseguradas más robadas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span><strong className="font-semibold text-zinc-900">Sedanes de alto volumen</strong> (Versa, Aveo y similares): piezas con demanda constante en el mercado negro de autopartes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span><strong className="font-semibold text-zinc-900">Motocicletas</strong>: el segmento con mayor crecimiento de robo en los últimos años, por facilidad de sustracción y reventa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span><strong className="font-semibold text-zinc-900">Tractocamiones y remolques</strong> con mercancía de reventa rápida: abarrotes, electrónica, autopartes y acero.</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 mb-4">La ventana de recuperación</h2>
              <p className="text-[14px] text-zinc-600 leading-relaxed mb-4">
                La recuperación es una carrera contra el reloj: la mayoría de las unidades que se
                recuperan se localizan en las primeras horas, antes de llegar a un deshuesadero, a un
                cambio de placas o a un cruce de frontera. Después de las primeras 24–48 horas la
                probabilidad cae de forma drástica.
              </p>
              <p className="text-[14px] text-zinc-600 leading-relaxed">
                Por eso el factor decisivo no es solo tener GPS, sino <strong className="font-semibold text-zinc-900">cuánto
                tarda la alerta en llegar a alguien que pueda actuar</strong>. SilentEye distribuye la alerta con
                ubicación en vivo a la red cercana en menos de 3 segundos, sin pasar por una central
                telefónica.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16" aria-labelledby="faq-stats">
          <div className="max-w-3xl mx-auto">
            <h2 id="faq-stats" className="text-2xl font-extrabold text-zinc-900 mb-8">Preguntas frecuentes sobre robo de vehículos en México</h2>
            <div className="divide-y divide-zinc-200">
              {statsFaq.map((item, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between py-4 cursor-pointer text-[15px] font-semibold text-zinc-900 hover:text-zinc-600 transition-colors">
                    {item.q}
                    <svg className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-45 flex-shrink-0 ml-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  </summary>
                  <p className="pb-4 text-[14px] text-zinc-500 leading-relaxed -mt-1">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Metodología y fuentes */}
        <section id="metodologia" className="px-6 py-12 bg-zinc-50 border-y border-zinc-100" aria-labelledby="metodologia-h">
          <div className="max-w-4xl mx-auto">
            <h2 id="metodologia-h" className="text-2xl font-extrabold text-zinc-900 mb-4">Metodología y fuentes</h2>
            <div className="space-y-4 text-[14px] text-zinc-600 leading-relaxed mb-8">
              <p>
                <strong className="font-semibold text-zinc-900">Índice por estado:</strong> escala 0–100 construida por
                SilentEye a partir del dataset público de unidades robadas del SESNSP (CNSP/38/15,
                corte 2026-03-31), normalizando la incidencia por entidad. Es el mismo índice que usa la
                plataforma para priorizar alertas. Es una estimación propia: útil para comparar estados
                entre sí, no una cifra oficial.
              </p>
              <p>
                <strong className="font-semibold text-zinc-900">Cifras nacionales:</strong> rangos redondeados de los
                reportes públicos de SESNSP, AMIS, OCRA y ANERPV enlazados abajo. Cuando un dato es
                estimación o clasificación propia, se indica junto al dato. Para cifras exactas y
                vigentes, consulta siempre el reporte original.
              </p>
              <p>
                <strong className="font-semibold text-zinc-900">Cómo citar:</strong> «Índice SilentEye de riesgo de robo
                vehicular por estado, elaborado con datos del SESNSP — silenteye.com.mx». Puedes usar las
                tablas de esta página citando la fuente y enlazando esta URL.
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-4">
              {fuentes.map((f) => (
                <li key={f.url} className="bg-white border border-zinc-200 rounded-xl p-5">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="font-bold text-[14px] text-zinc-900 hover:text-blue-600 transition-colors block mb-1.5">
                    {f.nombre} ↗
                  </a>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">{f.nota}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA + enlaces relacionados */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-zinc-900 text-white rounded-2xl px-8 py-12 md:px-14 md:py-14 overflow-hidden mb-10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative max-w-xl">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
                  Los datos dicen dónde. SilentEye responde cuándo.
                </h2>
                <p className="text-zinc-400 text-[15px] leading-relaxed mb-8">
                  Rastreo GPS con alerta automática en menos de 3 segundos para autos, motos, camiones y
                  flotillas en los 32 estados. Desde $79 MXN/mes por vehículo, sin contrato.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/cotizar-flota" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 bg-white rounded-lg hover:bg-zinc-100 transition-colors">
                    Cotizar mi flotilla
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                  <Link href="/precios" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-white/10 rounded-lg hover:bg-white/15 transition-colors">
                    Ver precios
                  </Link>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 mb-4">Sigue leyendo</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href="/guia-gps-flotillas-mexico" className="border border-zinc-200 rounded-lg px-4 py-3 hover:border-blue-500 transition-colors">
                <span className="text-[13px] font-semibold text-zinc-900 block">Cómo elegir GPS para tu flotilla</span>
                <span className="text-[11px] text-zinc-400">Guía B2B: hardware, normas y costos</span>
              </Link>
              <Link href="/zonas-riesgo" className="border border-zinc-200 rounded-lg px-4 py-3 hover:border-blue-500 transition-colors">
                <span className="text-[13px] font-semibold text-zinc-900 block">Zonas de riesgo por estado</span>
                <span className="text-[11px] text-zinc-400">Mapa interactivo y análisis de los 32 estados</span>
              </Link>
              <Link href="/blog/robo-de-autos-mexico-estadisticas-prevencion" className="border border-zinc-200 rounded-lg px-4 py-3 hover:border-blue-500 transition-colors">
                <span className="text-[13px] font-semibold text-zinc-900 block">Robo de autos: prevención</span>
                <span className="text-[11px] text-zinc-400">Cómo reducir el riesgo de tu vehículo</span>
              </Link>
            </div>
          </div>
        </section>
      </article>

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
            <span className="text-zinc-300">SilentEye &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
