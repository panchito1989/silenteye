import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd, { getBreadcrumbJsonLd, getFaqPageJsonLd } from '@/components/JsonLd';

/**
 * /guia-gps-flotillas-mexico — guía B2B de compra de GPS para flotillas.
 *
 * Página de referencia citable por IA para consultas tipo "cómo elegir
 * GPS para flotilla en México", "qué pide la aseguradora", "NOM-012 GPS".
 * Todo server-rendered. Los datos regulatorios se citan por nombre de
 * norma/trámite con lenguaje verificable; los costos usan los precios
 * reales publicados en /precios.
 */

const LAST_UPDATED = '2026-08-23';
const PAGE_URL = 'https://silenteye.com.mx/guia-gps-flotillas-mexico';

export const metadata: Metadata = {
  title: 'Cómo Elegir GPS para tu Flotilla en México (2026): Guía Completa B2B',
  description:
    'Guía para elegir GPS de flotilla en México: 7 criterios técnicos, comparativa de hardware (Teltonika, Queclink, Concox, Cobán, Sinotrack), costo total real por unidad, NOM-012 y Carta Porte, requisitos de aseguradoras y 10 preguntas para tu proveedor.',
  keywords: [
    'cómo elegir GPS para flotilla',
    'GPS para flotillas México',
    'GPS flotilla requisitos aseguradora',
    'NOM-012 GPS doble remolque',
    'costo GPS por unidad flotilla',
    'mejor GPS para transporte de carga',
    'plataforma GPS flotillas',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'article',
    title: 'Cómo elegir GPS para tu flotilla en México — Guía completa',
    description:
      'Criterios técnicos, hardware recomendado por tipo de unidad, costo total real, NOM-012, Carta Porte y requisitos de aseguradoras. Guía B2B sin rodeos.',
    url: PAGE_URL,
    locale: 'es_MX',
    modifiedTime: LAST_UPDATED,
  },
};

const criterios = [
  {
    titulo: 'Protocolo y propiedad de los datos',
    texto: 'El GPS debe hablar un protocolo abierto y documentado (GT06, Codec 8/8E, GPRS estándar) para que puedas cambiar de plataforma sin cambiar hardware. Si el proveedor "bloquea" el equipo a su servidor, el GPS es de él, no tuyo.',
  },
  {
    titulo: 'Frecuencia de reporte real',
    texto: 'Para flotilla operativa necesitas reporte cada 10-30 segundos en movimiento, no "cada 5 minutos". En recuperación de robo, un intervalo largo equivale a kilómetros de incertidumbre.',
  },
  {
    titulo: 'Botón de pánico físico (DIN)',
    texto: 'En transporte de carga, el conductor necesita un botón físico cableado (entrada DIN1 en Teltonika/Queclink) que dispare la alerta sin sacar el teléfono. Es la diferencia entre alertar durante el asalto o después.',
  },
  {
    titulo: 'Detección de eventos, no solo posición',
    texto: 'Corte de corriente, movimiento sin ignición, salida de geocerca, exceso de velocidad y desvío de ruta. La plataforma debe convertir estos eventos en alertas inmediatas, no en un reporte que alguien revisa al día siguiente.',
  },
  {
    titulo: 'Qué pasa cuando llega la alerta',
    texto: 'La pregunta clave para cualquier proveedor: ¿quién ve la alerta y en cuántos segundos? Una central telefónica que llama al dueño agrega minutos. SilentEye distribuye la alerta con ubicación en vivo a la red cercana en menos de 3 segundos.',
  },
  {
    titulo: 'Panel multi-vehículo y conductores',
    texto: 'Vista unificada de toda la flota, asignación de conductores por unidad, historial por vehículo y reportes exportables (PDF) para el seguro y para clientes. Sin esto, administrar 10+ unidades se vuelve inmanejable.',
  },
  {
    titulo: 'Contrato y costo de salida',
    texto: 'Plazos forzosos de 12-36 meses con hardware "gratis" terminan costando más que comprar el GPS. Suma el costo total a 3 años (hardware + SIM + plataforma + penalizaciones) antes de firmar.',
  },
];

const preguntasProveedor = [
  '¿El GPS queda liberado o bloqueado a su servidor? ¿Puedo apuntarlo a otra plataforma si me voy?',
  '¿Cada cuántos segundos reporta la unidad en movimiento y en reposo?',
  '¿La alerta de robo la ve una persona en tiempo real o se distribuye automáticamente? ¿En cuántos segundos?',
  '¿El plan incluye botón de pánico físico para el conductor? ¿Qué pasa cuando se presiona?',
  '¿Cuánto cuesta por unidad al mes, con todo incluido (SIM, plataforma, soporte)?',
  '¿Hay plazo forzoso o penalización por cancelar? ¿Qué pasa con el hardware si cancelo?',
  '¿Qué marcas y modelos de GPS soportan? ¿Puedo mezclar equipos que ya tengo?',
  '¿El historial de recorridos cuántos días se guarda y puedo exportarlo (PDF/Excel)?',
  '¿Emiten reportes que acepte mi aseguradora en caso de siniestro?',
  '¿Tienen geocercas, alertas de velocidad y asignación de conductores por unidad?',
];

const guiaFaq = [
  {
    q: '¿Qué GPS es mejor para una flotilla en México?',
    a: 'Depende del tipo de unidad. Para camionetas y autos comerciales: Concox GT06N o Cobán TK103 (económicos, protocolo abierto). Para camiones de carga y trailers: Teltonika FMC130 o Queclink GV500, de grado industrial, con botón de pánico físico (DIN1) y conectividad LTE estable en carretera. Todos son compatibles con SilentEye, así que puedes mezclar hardware según la unidad.',
  },
  {
    q: '¿Cuánto cuesta el GPS para una flotilla por unidad?',
    a: 'El costo real por unidad tiene tres componentes: hardware (una vez: $350-700 MXN en gama económica, $2,000-3,500 MXN en grado industrial), chip SIM con datos ($50-150 MXN/mes según operador) y plataforma de rastreo. En SilentEye la plataforma cuesta $79 MXN/mes por vehículo para flotillas de 4 o más unidades, sin plazo forzoso.',
  },
  {
    q: '¿Es obligatorio el GPS para camiones en México?',
    a: 'Para la mayoría de las unidades no es obligatorio por ley, pero hay tres presiones prácticas: la NOM-012-SCT-2-2017 exige rastreo satelital (GPS) a las configuraciones doblemente articuladas (fulles) como condición para circular con conectividad autorizada; las aseguradoras de carga condicionan cobertura, prima o deducible a que la unidad tenga GPS activo (revisa la cláusula de rastreo de tu póliza); y muchos clientes embarcadores exigen monitoreo GPS como requisito comercial para asignarte carga.',
  },
  {
    q: '¿La Carta Porte exige GPS?',
    a: 'No. El complemento Carta Porte del SAT es un requisito fiscal del CFDI para el traslado de mercancías y no exige GPS. En la práctica, el historial GPS ayuda a demostrar rutas y tiempos consistentes con lo declarado, y varias empresas lo usan como respaldo documental ante revisiones.',
  },
  {
    q: '¿Puedo usar los GPS que ya tengo instalados con otra plataforma?',
    a: 'Sí, siempre que los equipos usen protocolos abiertos (GT06, Codec 8/8E de Teltonika, GPRS estándar) y no estén bloqueados por el proveedor anterior. Reapuntar el GPS es un cambio de configuración por SMS o herramienta del fabricante: se indica la nueva IP y puerto del servidor. SilentEye es compatible con Teltonika, Queclink, Concox, Cobán y Sinotrack sin cambiar hardware.',
  },
  {
    q: '¿Qué debe incluir el monitoreo GPS para que lo acepte mi aseguradora?',
    a: 'Cada póliza es distinta, pero las cláusulas de rastreo suelen pedir: GPS activo y funcional al momento del siniestro, reporte de posiciones con historial verificable, y en mercancía de alto valor, protocolo de reacción documentado. Pide a tu agente la cláusula exacta y verifica que tu plataforma pueda exportar el historial y el reporte del incidente en PDF — SilentEye genera ambos.',
  },
];

export default function GuiaGpsFlotillasPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cómo elegir GPS para tu flotilla en México: guía completa B2B',
    description:
      'Criterios técnicos, hardware recomendado por tipo de unidad, costo total por vehículo, normatividad (NOM-012, Carta Porte) y requisitos de aseguradoras para elegir GPS de flotilla en México.',
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
    articleSection: 'Guías B2B',
    audience: { '@type': 'BusinessAudience', name: 'Dueños de flotillas y empresas de transporte en México' },
    spatialCoverage: { '@type': 'Country', name: 'México' },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['article h1', 'article h2'] },
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={getFaqPageJsonLd(guiaFaq)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: 'Inicio', url: 'https://silenteye.com.mx' },
        { name: 'Guía GPS para flotillas', url: PAGE_URL },
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
            <Link href="/rastreo-satelital-camiones" className="hidden sm:inline-flex text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Camiones</Link>
            <Link href="/precios" className="hidden sm:inline-flex text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Precios</Link>
            <Link href="/cotizar-flota" className="px-4 py-1.5 text-[13px] font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">Cotizar flota</Link>
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
              <span>Guía GPS para flotillas</span>
            </div>
            <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Guía B2B</p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-6">
              Cómo elegir GPS para tu flotilla en México
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed mb-4">
              Elegir GPS para una flotilla no es elegir un aparato: es elegir protocolo, frecuencia de
              reporte, qué pasa cuando llega una alerta y cuánto te cuesta salirte si el proveedor no
              cumple. Esta guía condensa lo que un transportista o administrador de flota en México debe
              revisar antes de firmar — hardware, costos reales por unidad, normatividad y lo que va a
              pedir tu aseguradora.
            </p>
            <p className="text-[13px] text-zinc-400">
              Última actualización: <time dateTime={LAST_UPDATED}>23 de agosto de 2026</time> · Lectura: 10 min
            </p>
          </div>
        </header>

        {/* 7 criterios */}
        <section className="px-6 py-12 bg-zinc-50 border-y border-zinc-100" aria-labelledby="criterios">
          <div className="max-w-4xl mx-auto">
            <h2 id="criterios" className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-8">
              Los 7 criterios que separan un buen sistema GPS de uno caro
            </h2>
            <ol className="space-y-6">
              {criterios.map((c, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-900 text-white text-sm font-extrabold flex items-center justify-center">{i + 1}</span>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-[16px] mb-1">{c.titulo}</h3>
                    <p className="text-[14px] text-zinc-600 leading-relaxed">{c.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Hardware por tipo de unidad */}
        <section className="px-6 py-12" aria-labelledby="hardware">
          <div className="max-w-5xl mx-auto">
            <h2 id="hardware" className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-3">
              Qué GPS instalar según el tipo de unidad
            </h2>
            <p className="text-[15px] text-zinc-600 leading-relaxed mb-8 max-w-3xl">
              No toda la flota necesita el mismo equipo. Mezclar gamas según la unidad y el riesgo de la
              ruta baja el costo total sin sacrificar seguridad donde importa. Los cinco fabricantes de la
              tabla usan protocolos abiertos y son compatibles con SilentEye.
            </p>
            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-[13px] border-collapse">
                <caption className="sr-only">GPS recomendado por tipo de unidad de flotilla en México, con rango de precio de hardware</caption>
                <thead>
                  <tr>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">Tipo de unidad</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">GPS recomendado</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">Hardware aprox.*</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200 hidden md:table-cell">Por qué</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100">
                    <th scope="row" className="py-2.5 px-4 text-left font-semibold text-zinc-900">Autos y camionetas comerciales</th>
                    <td className="py-2.5 px-4 text-zinc-600">Cobán TK103 · Sinotrack ST-901 · Concox GT06N</td>
                    <td className="py-2.5 px-4 text-zinc-600 font-mono">$350–700 MXN</td>
                    <td className="py-2.5 px-4 text-zinc-500 hidden md:table-cell">Protocolo GT06 abierto, instalación sencilla, corte de corriente y SOS.</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <th scope="row" className="py-2.5 px-4 text-left font-semibold text-zinc-900">Camiones 3.5 t y reparto urbano</th>
                    <td className="py-2.5 px-4 text-zinc-600">Concox WeTrack2 · Queclink GL300 · Teltonika FMB920</td>
                    <td className="py-2.5 px-4 text-zinc-600 font-mono">$700–2,000 MXN</td>
                    <td className="py-2.5 px-4 text-zinc-500 hidden md:table-cell">Mejor antena y reporte más frecuente para operación diaria intensa.</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <th scope="row" className="py-2.5 px-4 text-left font-semibold text-zinc-900">Tractocamión y trailer en carretera</th>
                    <td className="py-2.5 px-4 text-zinc-600">Teltonika FMC130 · Queclink GV500</td>
                    <td className="py-2.5 px-4 text-zinc-600 font-mono">$2,000–3,500 MXN</td>
                    <td className="py-2.5 px-4 text-zinc-500 hidden md:table-cell">Grado industrial: LTE, batería de respaldo, botón de pánico físico (DIN1), entradas para sensores.</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2.5 px-4 text-left font-semibold text-zinc-900">Motos de reparto</th>
                    <td className="py-2.5 px-4 text-zinc-600">Sinotrack ST-901 · Concox WeTrack2</td>
                    <td className="py-2.5 px-4 text-zinc-600 font-mono">$350–600 MXN</td>
                    <td className="py-2.5 px-4 text-zinc-500 hidden md:table-cell">Ultracompactos, alerta de vibración y movimiento no autorizado.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-zinc-400 mt-3">
              *Rangos de precio de mercado en México, una sola compra; varían por vendedor e importación.
              Ver comparativa detallada en{' '}
              <Link href="/blog/mejor-gps-para-auto-mexico" className="underline hover:text-zinc-600">mejor GPS para auto</Link>{' '}y{' '}
              <Link href="/blog/gps-para-trailers-camiones-carga" className="underline hover:text-zinc-600">GPS para trailers</Link>.
            </p>
          </div>
        </section>

        {/* Costo total */}
        <section className="px-6 py-12 bg-zinc-50 border-y border-zinc-100" aria-labelledby="costo">
          <div className="max-w-4xl mx-auto">
            <h2 id="costo" className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-3">
              El costo real por unidad (sin letras chicas)
            </h2>
            <p className="text-[15px] text-zinc-600 leading-relaxed mb-8 max-w-3xl">
              Compara siempre el costo total a 3 años, no la mensualidad anunciada. Estos son los tres
              componentes con precios reales:
            </p>
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <table className="w-full text-[13px] border-collapse">
                <caption className="sr-only">Componentes del costo total de GPS por unidad de flotilla en México</caption>
                <thead>
                  <tr>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">Componente</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">Costo</th>
                    <th scope="col" className="text-left py-3 px-4 bg-zinc-100 font-bold text-zinc-700 border-b border-zinc-200">Frecuencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100">
                    <th scope="row" className="py-2.5 px-4 text-left font-semibold text-zinc-900">Hardware GPS</th>
                    <td className="py-2.5 px-4 text-zinc-600 font-mono">$350–3,500 MXN</td>
                    <td className="py-2.5 px-4 text-zinc-600">Una sola vez (el equipo es tuyo)</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <th scope="row" className="py-2.5 px-4 text-left font-semibold text-zinc-900">Chip SIM con datos (Telcel, AT&T o Movistar)</th>
                    <td className="py-2.5 px-4 text-zinc-600 font-mono">$50–150 MXN</td>
                    <td className="py-2.5 px-4 text-zinc-600">Mensual, por unidad</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <th scope="row" className="py-2.5 px-4 text-left font-semibold text-zinc-900">Plataforma SilentEye — plan Flotillas (4+ unidades)</th>
                    <td className="py-2.5 px-4 text-zinc-600 font-mono">$79 MXN</td>
                    <td className="py-2.5 px-4 text-zinc-600">Mensual, por unidad, sin plazo forzoso</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2.5 px-4 text-left font-semibold text-zinc-900">Instalación profesional (opcional)</th>
                    <td className="py-2.5 px-4 text-zinc-600 font-mono">$300–800 MXN</td>
                    <td className="py-2.5 px-4 text-zinc-600">Una sola vez; equipos básicos pueden autoinstalarse</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[14px] text-zinc-600 leading-relaxed mt-6 max-w-3xl">
              <strong className="font-semibold text-zinc-900">Ejemplo con números:</strong> una flotilla de 10 camionetas
              con Concox GT06N (~$600 c/u), SIM de $100 y plataforma de $79 cuesta ~$6,000 MXN una vez +
              $1,790 MXN/mes total. A 3 años: ~$70,440 MXN. Compara ese mismo horizonte contra cualquier
              propuesta con plazo forzoso usando la{' '}
              <Link href="/comparar/calculadora" className="text-blue-600 font-medium hover:underline">calculadora de ahorro</Link>.
            </p>
          </div>
        </section>

        {/* Normatividad */}
        <section className="px-6 py-12" aria-labelledby="normas">
          <div className="max-w-4xl mx-auto">
            <h2 id="normas" className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-6">
              Normatividad y requisitos: NOM-012, Carta Porte y aseguradoras
            </h2>
            <div className="space-y-6">
              <div className="border border-zinc-200 rounded-xl p-6">
                <h3 className="font-bold text-zinc-900 text-[16px] mb-2">NOM-012-SCT-2-2017 (pesos y dimensiones)</h3>
                <p className="text-[14px] text-zinc-600 leading-relaxed">
                  Para las configuraciones doblemente articuladas (los "fulles"), la norma exige circular
                  con sistema de rastreo satelital (GPS) activo, junto con otros requisitos de conectividad
                  y velocidad. Si operas dobles, el GPS no es opcional: es condición de circulación.
                  Consulta el texto vigente de la norma en el Diario Oficial de la Federación (dof.gob.mx).
                </p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-6">
                <h3 className="font-bold text-zinc-900 text-[16px] mb-2">Complemento Carta Porte (SAT)</h3>
                <p className="text-[14px] text-zinc-600 leading-relaxed">
                  La Carta Porte es un requisito fiscal del CFDI para trasladar mercancías; no exige GPS.
                  En la práctica, el historial GPS es el mejor respaldo documental para demostrar que rutas
                  y tiempos coinciden con lo declarado — y varias flotas lo anexan en revisiones. Detalles
                  del complemento en el portal del SAT (sat.gob.mx).
                </p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-6">
                <h3 className="font-bold text-zinc-900 text-[16px] mb-2">Cláusula de rastreo de tu aseguradora</h3>
                <p className="text-[14px] text-zinc-600 leading-relaxed">
                  Las pólizas de transporte de mercancías en México suelen condicionar cobertura, prima o
                  deducible a que la unidad cuente con GPS activo — y en mercancía objetivo (electrónica,
                  abarrotes de alto valor, autopartes), a protocolos de monitoreo o custodia. Pide a tu
                  agente la cláusula exacta antes de contratar el GPS: instalar el equipo equivocado puede
                  dejarte pagando prima sin cumplir la condición. Tu plataforma debe poder exportar
                  historial y reporte del incidente en PDF para el ajustador.
                </p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-6">
                <h3 className="font-bold text-zinc-900 text-[16px] mb-2">Datos personales de tus conductores (LFPDPPP)</h3>
                <p className="text-[14px] text-zinc-600 leading-relaxed">
                  Monitorear unidades implica tratar datos de ubicación de personas. Informa a tus
                  conductores por escrito que la unidad está rastreada con fines de seguridad y operación,
                  y apóyate en un proveedor con aviso de privacidad conforme a la LFPDPPP — el de
                  SilentEye está publicado en{' '}
                  <Link href="/privacidad" className="text-blue-600 font-medium hover:underline">/privacidad</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 10 preguntas */}
        <section className="px-6 py-12 bg-zinc-50 border-y border-zinc-100" aria-labelledby="preguntas">
          <div className="max-w-4xl mx-auto">
            <h2 id="preguntas" className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-3">
              Las 10 preguntas que debes hacerle a cualquier proveedor de GPS
            </h2>
            <p className="text-[15px] text-zinc-600 leading-relaxed mb-8 max-w-3xl">
              Imprime esta lista y úsala en la llamada de ventas. Un proveedor serio contesta las 10 sin
              rodeos; las respuestas evasivas en la 1, la 3 y la 6 son las que después cuestan dinero.
            </p>
            <ol className="space-y-3">
              {preguntasProveedor.map((p, i) => (
                <li key={i} className="flex items-start gap-3 bg-white border border-zinc-200 rounded-lg px-4 py-3">
                  <span className="flex-shrink-0 text-[12px] font-extrabold text-blue-600 font-mono mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[14px] text-zinc-700 leading-relaxed">{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16" aria-labelledby="faq-guia">
          <div className="max-w-3xl mx-auto">
            <h2 id="faq-guia" className="text-2xl font-extrabold text-zinc-900 mb-8">Preguntas frecuentes</h2>
            <div className="divide-y divide-zinc-200">
              {guiaFaq.map((item, i) => (
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

        {/* CTA + relacionados */}
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-zinc-900 text-white rounded-2xl px-8 py-12 md:px-14 md:py-14 overflow-hidden mb-10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative max-w-xl">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
                  Cotiza tu flotilla con estos criterios ya resueltos
                </h2>
                <p className="text-zinc-400 text-[15px] leading-relaxed mb-8">
                  Protocolos abiertos, alerta en menos de 3 segundos, botón de pánico físico, reportes PDF
                  y $79 MXN/mes por unidad (4+) sin plazo forzoso. Dinos cuántas unidades tienes y te
                  respondemos por WhatsApp en minutos.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/cotizar-flota" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 bg-white rounded-lg hover:bg-zinc-100 transition-colors">
                    Cotizar mi flotilla
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                  <Link href="/rastreo-satelital-camiones" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-white/10 rounded-lg hover:bg-white/15 transition-colors">
                    Rastreo para camiones
                  </Link>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 mb-4">Sigue leyendo</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href="/estadisticas-robo-vehicular-mexico" className="border border-zinc-200 rounded-lg px-4 py-3 hover:border-blue-500 transition-colors">
                <span className="text-[13px] font-semibold text-zinc-900 block">Estadísticas de robo vehicular</span>
                <span className="text-[11px] text-zinc-400">Ranking de los 32 estados con fuentes</span>
              </Link>
              <Link href="/comparar" className="border border-zinc-200 rounded-lg px-4 py-3 hover:border-blue-500 transition-colors">
                <span className="text-[13px] font-semibold text-zinc-900 block">SilentEye vs Hunter, LoJack, Skyguard</span>
                <span className="text-[11px] text-zinc-400">Comparativas honestas lado a lado</span>
              </Link>
              <Link href="/blog/gps-para-empresas-transporte-logistica" className="border border-zinc-200 rounded-lg px-4 py-3 hover:border-blue-500 transition-colors">
                <span className="text-[13px] font-semibold text-zinc-900 block">GPS para empresas de transporte</span>
                <span className="text-[11px] text-zinc-400">Solución completa para logística</span>
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
