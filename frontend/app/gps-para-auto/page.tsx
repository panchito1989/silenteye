import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd, {
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
  getFaqPageJsonLd,
} from '@/components/JsonLd';

/**
 * Landing comercial para auto particular.
 *
 * Cierra el hueco de embudo detectado en Search Console (oct-2026): el
 * grueso del tráfico orgánico llega con queries de "gps para auto" al
 * blog, pero no existía página de producto para ese segmento — la home
 * pesa hacia flotillas/camiones. Todos los posts del blog enlazan aquí.
 */

const WHATSAPP_NUMBER = '525610669353';
const WHATSAPP_TEXT = encodeURIComponent(
  'Hola, quiero proteger mi auto con GPS. ¿Me ayudan a empezar?'
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_TEXT}`;

export const metadata: Metadata = {
  title: 'GPS para auto en México — rastreo en tiempo real desde $99/mes',
  description:
    'Protege tu auto con rastreo GPS en tiempo real y alerta de robo en menos de 3 segundos. $99 MXN/mes por vehículo, sin contrato y sin app. Compatible con Cobán, Sinotrack y Teltonika desde $350 MXN. Activación el mismo día.',
  alternates: { canonical: 'https://silenteye.com.mx/gps-para-auto' },
  openGraph: {
    type: 'website',
    title: 'GPS para auto en México — rastreo en tiempo real desde $99/mes',
    description:
      'Rastreo GPS para tu auto con alerta de robo en menos de 3 segundos. Sin contrato, sin app. Desde $99 MXN/mes.',
    url: 'https://silenteye.com.mx/gps-para-auto',
  },
};

const faq = [
  {
    q: '¿Cuánto cuesta proteger mi auto con GPS?',
    a: 'El servicio SilentEye cuesta $99 MXN/mes por vehículo (hasta 3 autos), sin contrato ni permanencia. Aparte, una sola vez, el GPS: desde $350-700 MXN un Cobán TK103 o Sinotrack ST-901. Y el chip SIM con datos del GPS: $50-150 MXN/mes. El botón de emergencia SOS desde tu celular es gratis para siempre.',
  },
  {
    q: '¿Necesito instalar una app?',
    a: 'No. SilentEye funciona desde el navegador de cualquier celular o computadora. Entras a tu cuenta y ves tu auto en el mapa en tiempo real, con historial de recorridos de 30 días.',
  },
  {
    q: '¿Quién instala el GPS en mi auto?',
    a: 'Cualquier instalador de autoestéreos o alarmas de tu ciudad lo conecta en menos de una hora (cuesta $300-800 MXN), o tú mismo siguiendo nuestra guía paso a paso: son 2 cables a la batería. Después se apunta el GPS al servidor de SilentEye con un SMS y tu auto aparece en el mapa.',
  },
  {
    q: '¿Qué pasa si me roban el auto?',
    a: 'SilentEye detecta el movimiento no autorizado o el corte de corriente y dispara la alerta en menos de 3 segundos con la ubicación en vivo — a ti y a tu red de confianza en un radio de 2 km. La mayoría de los autos robados se recupera (o se pierde) en los primeros minutos: la velocidad de la alerta es la diferencia.',
  },
  {
    q: '¿Sirve el GPS que ya tengo instalado?',
    a: 'Si es Cobán, Sinotrack, Concox, Queclink o Teltonika, sí: solo se reapunta al servidor de SilentEye (un SMS) y no compras hardware nuevo. Si vienes de otro servicio con renta de $200-400 MXN, bajas a $99 MXN/mes conservando tu equipo.',
  },
  {
    q: '¿Funciona en mi ciudad?',
    a: 'Sí. La cobertura es la de la red celular del chip del GPS (Telcel, AT&T o Movistar), no una zona de servicio: funciona en los 32 estados, en ciudad y en carretera. Tenemos páginas con el contexto de riesgo de 33 ciudades en silenteye.com.mx/rastreo-gps.',
  },
];

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Rastreo GPS para autos particulares',
  serviceType: 'Rastreo GPS vehicular para autos',
  description:
    'Rastreo GPS en tiempo real para autos particulares en México: alerta de robo en menos de 3 segundos, geocercas, botón de pánico e historial de recorridos. Sin app y sin contrato.',
  provider: {
    '@type': 'Organization',
    name: 'SilentEye',
    url: 'https://silenteye.com.mx',
  },
  areaServed: { '@type': 'Country', name: 'México' },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://silenteye.com.mx/gps-para-auto',
    servicePlatform: 'Web',
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Plan Personal',
      price: '99',
      priceCurrency: 'MXN',
      description:
        'Rastreo GPS en tiempo real para 1-3 autos: $99 MXN/mes por vehículo. Alertas de robo, geocercas, historial 30 días. Sin contrato.',
      availability: 'https://schema.org/InStock',
      url: 'https://silenteye.com.mx/precios',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '99',
        priceCurrency: 'MXN',
        unitText: 'vehículo/mes',
      },
    },
    {
      '@type': 'Offer',
      name: 'SOS Ciudadano',
      price: '0',
      priceCurrency: 'MXN',
      description: 'Botón de emergencia gratuito desde el navegador. Sin GPS, sin app, sin tarjeta.',
      availability: 'https://schema.org/InStock',
      url: 'https://silenteye.com.mx/sos',
    },
  ],
};

const gpsOptions = [
  {
    name: 'Cobán TK103',
    tag: 'El más popular',
    price: '$400–700 MXN',
    desc: 'El rastreador más vendido de México. Instalación sencilla a la batería, botón SOS y alerta de corte de corriente.',
    ideal: 'Autos particulares, presupuesto ajustado',
  },
  {
    name: 'Sinotrack ST-901',
    tag: 'El más discreto',
    price: '$350–600 MXN',
    desc: 'Ultracompacto: cabe en la palma de la mano y se oculta en cualquier rincón del auto. Alerta de vibración.',
    ideal: 'Instalación oculta, motos y autos chicos',
  },
  {
    name: 'Teltonika FMB920',
    tag: 'Grado industrial',
    price: '$1,500–2,500 MXN',
    desc: 'Fabricado en Lituania, el estándar profesional. Máxima precisión, acelerómetro y botón de pánico físico.',
    ideal: 'Quien quiere la máxima confiabilidad',
  },
];

export default function GpsParaAutoPage() {
  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={getFaqPageJsonLd(faq)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: 'Inicio', url: 'https://silenteye.com.mx' },
        { name: 'GPS para auto', url: 'https://silenteye.com.mx/gps-para-auto' },
      ])} />
      <JsonLd data={getWebPageJsonLd({
        name: 'GPS para auto en México',
        description: 'Rastreo GPS para autos particulares con alerta de robo en menos de 3 segundos.',
        url: 'https://silenteye.com.mx/gps-para-auto',
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
            <Link href="/precios" className="hidden sm:inline-flex text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Precios</Link>
            <Link href="/login" className="px-4 py-1.5 text-[13px] font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
              Comenzar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 pt-12 pb-10 md:pt-20 md:pb-14">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-5 bg-blue-50 text-blue-700 ring-1 ring-blue-200">
            Para autos particulares
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-6">
            GPS para tu auto: rastreo en tiempo real y alerta de robo en 3 segundos
          </h1>
          {/* Respuesta directa citable: qué, cuánto, cómo. */}
          <p className="text-zinc-600 text-lg leading-relaxed mb-6">
            Protege tu auto por <strong className="text-zinc-900">$99 MXN al mes</strong>, sin
            contrato y sin app: compras un GPS compatible una sola vez (desde $350 MXN), lo
            conectas a SilentEye y ves tu auto en el mapa desde el navegador. Si alguien lo mueve
            sin tu permiso o corta la corriente, la alerta te llega en menos de 3 segundos con la
            ubicación en vivo — a ti y a tu red de confianza en 2 km a la redonda.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              Escríbenos por WhatsApp
            </a>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
              Crear cuenta gratis
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Datos rápidos */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900 text-white rounded-2xl p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Servicio</p>
              <p className="text-lg font-extrabold leading-snug">$99 <span className="text-zinc-400 text-sm font-semibold">MXN/mes</span></p>
              <p className="text-[12px] text-zinc-500">por auto, sin contrato</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">GPS desde</p>
              <p className="text-lg font-extrabold leading-snug">$350 <span className="text-zinc-400 text-sm font-semibold">MXN</span></p>
              <p className="text-[12px] text-zinc-500">una sola vez</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Alerta de robo</p>
              <p className="text-lg font-extrabold leading-snug">&lt; 3 segundos</p>
              <p className="text-[12px] text-zinc-500">con ubicación en vivo</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Botón SOS</p>
              <p className="text-lg font-extrabold leading-snug">Gratis</p>
              <p className="text-[12px] text-zinc-500">desde tu celular, sin GPS</p>
            </div>
          </div>
        </div>
      </section>

      {/* Elige tu GPS */}
      <section className="px-6 py-12 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Paso 1 · El equipo</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-3">
            Elige tu GPS (o usa el que ya tienes)
          </h2>
          <p className="text-zinc-600 text-[15px] leading-relaxed mb-8 max-w-2xl">
            SilentEye es compatible con los GPS más vendidos de México. Se compran una sola vez en
            Mercado Libre o con cualquier distribuidor — nosotros no te amarramos a un hardware.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {gpsOptions.map((gps) => (
              <div key={gps.name} className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-2">{gps.tag}</span>
                <h3 className="text-lg font-extrabold text-zinc-900 mb-1">{gps.name}</h3>
                <p className="text-zinc-500 text-[14px] font-semibold mb-3">{gps.price}</p>
                <p className="text-[13px] text-zinc-600 leading-relaxed mb-3 flex-1">{gps.desc}</p>
                <p className="text-[12px] text-zinc-400"><span className="font-semibold text-zinc-500">Ideal para:</span> {gps.ideal}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-zinc-500 mt-6">
            ¿Quieres el detalle completo? Lee la{' '}
            <Link href="/blog/mejor-gps-para-auto-mexico" className="text-blue-600 font-semibold hover:underline">
              comparativa de los 3 mejores GPS para auto en México
            </Link>.
          </p>
        </div>
      </section>

      {/* Cómo se activa */}
      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Paso 2 · La activación</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-8">
            De la caja al mapa el mismo día
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-zinc-200 rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold mb-4">1</div>
              <h3 className="font-bold text-zinc-900 mb-2 text-[15px]">Instala el GPS</h3>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                Cualquier instalador de alarmas lo conecta en menos de 1 hora ($300-800 MXN), o tú
                mismo con nuestra <Link href="/blog/como-instalar-gps-en-auto" className="text-blue-600 font-semibold hover:underline">guía de instalación</Link>:
                son 2 cables a la batería y un chip SIM con datos.
              </p>
            </div>
            <div className="border border-zinc-200 rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold mb-4">2</div>
              <h3 className="font-bold text-zinc-900 mb-2 text-[15px]">Apúntalo a SilentEye</h3>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                Un SMS al GPS con la dirección del servidor y listo. Te damos el comando exacto
                para tu modelo (Cobán, Sinotrack, Concox, Queclink o Teltonika) al crear tu cuenta.
              </p>
            </div>
            <div className="border border-zinc-200 rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold mb-4">3</div>
              <h3 className="font-bold text-zinc-900 mb-2 text-[15px]">Vigila desde el navegador</h3>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                Tu auto en el mapa en tiempo real, geocercas (casa, trabajo, escuela), alertas de
                movimiento y corte de corriente, e historial de 30 días. Sin app que instalar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Qué te avisa */}
      <section className="px-6 py-14 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Lo que detecta</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-8">
            Tu auto te avisa antes de que sea tarde
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
            {[
              ['Movimiento no autorizado', 'Tu auto se mueve sin que tú lo esperes — grúa, empujón o encendido ajeno — y la alerta sale al instante.'],
              ['Corte de corriente', 'Lo primero que hace un ladrón es desconectar la batería: el GPS lo reporta antes de apagarse.'],
              ['Salida de geocerca', 'Dibuja una zona (tu casa, la oficina, la colonia) y entérate en cuanto el auto la cruza.'],
              ['Botón de pánico', 'Desde el GPS o desde tu celular: tu red de confianza en 2 km recibe tu ubicación en vivo en menos de 3 segundos.'],
              ['Exceso de velocidad', '¿Prestas el auto? Define un límite y recibe alerta cuando alguien lo pasa.'],
              ['Historial de recorridos', '30 días de trayectos guardados: a dónde fue, cuándo y a qué velocidad.'],
            ].map(([t, d]) => (
              <div key={t} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 5 5L20 7"/></svg>
                <div>
                  <h3 className="font-bold text-zinc-900 text-[14px]">{t}</h3>
                  <p className="text-[13px] text-zinc-600 leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precio */}
      <section className="px-6 py-14">
        <div className="max-w-3xl mx-auto">
          <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Precio</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6">
            Un plan simple, sin letras chiquitas
          </h2>
          <div className="bg-white rounded-xl p-8 border-2 border-blue-500 mb-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">Plan Personal</span>
                <h3 className="text-2xl font-extrabold text-zinc-900">$99 MXN/mes por auto</h3>
              </div>
              <span className="text-[12px] text-zinc-500 font-medium">Hasta 3 vehículos · Sin contrato</span>
            </div>
            <p className="text-[14px] text-zinc-600 leading-relaxed mb-5">
              Rastreo en tiempo real, todas las alertas (robo, corte de corriente, geocercas,
              velocidad), botón de pánico e historial de 30 días. Cancelas cuando quieras, sin
              penalización.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
                Comenzar gratis
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                Preguntar por WhatsApp
              </a>
            </div>
          </div>
          <p className="text-[13px] text-zinc-500 leading-relaxed">
            El botón <Link href="/sos" className="text-blue-600 font-semibold hover:underline">SOS ciudadano</Link> es
            gratis para siempre, sin GPS. ¿Tienes 4 autos o más? Te conviene el plan Flotillas a
            $79 MXN/mes por vehículo — <Link href="/cotizar-flota" className="text-blue-600 font-semibold hover:underline">cotiza aquí</Link>.
            ¿Vienes de Hunter o LoJack? <Link href="/comparar/calculadora" className="text-blue-600 font-semibold hover:underline">Calcula tu ahorro</Link>.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-14 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase mb-3">Preguntas frecuentes</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-8">
            GPS para auto: lo que más preguntan
          </h2>
          <div className="space-y-6">
            {faq.map((item) => (
              <div key={item.q} className="border-b border-zinc-200 pb-6">
                <h3 className="font-bold text-zinc-900 text-[15px] mb-2">{item.q}</h3>
                <p className="text-[14px] text-zinc-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guías */}
      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Guías para dueños de auto</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ['/blog/mejor-gps-para-auto-mexico', 'Mejor GPS para auto en México: Top 3 desde $350 MXN'],
              ['/blog/como-instalar-gps-en-auto', 'Cómo instalar un GPS en tu auto paso a paso'],
              ['/blog/como-rastrear-auto-robado-gps', 'Cómo rastrear un auto robado con GPS'],
              ['/blog/gps-tracker-sin-renta-mensual-mexico', 'GPS sin renta mensual: la verdad sobre los costos'],
              ['/blog/apn-gps-tracker-telcel-att-movistar', 'APN para GPS: configurar Telcel, AT&T y Movistar'],
              ['/rastreo-gps', 'Rastreo GPS en tu ciudad: riesgo y contexto local'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="border border-zinc-200 rounded-lg px-4 py-3 hover:border-blue-500 transition-colors text-[13px] font-semibold text-zinc-900">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-zinc-900 text-white rounded-2xl px-8 py-12 md:px-14 md:py-14 overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative max-w-xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
                Hoy duermes más tranquilo
              </h2>
              <p className="text-zinc-400 text-[15px] leading-relaxed mb-8">
                Crea tu cuenta gratis, conecta tu GPS y ve tu auto en el mapa hoy mismo. Si tienes
                dudas del equipo o la instalación, escríbenos por WhatsApp y te guiamos.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-900 bg-white rounded-lg hover:bg-zinc-100 transition-colors">
                  Comenzar gratis
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                  WhatsApp
                </a>
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
            <Link href="/precios" className="hover:text-zinc-600">Precios</Link>
            <Link href="/rastreo-gps" className="hover:text-zinc-600">Ciudades</Link>
            <Link href="/comparar" className="hover:text-zinc-600">Comparar</Link>
            <Link href="/blog" className="hover:text-zinc-600">Blog</Link>
            <span className="text-zinc-300">SilentEye &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
