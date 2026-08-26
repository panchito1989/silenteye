/**
 * Ciudades para landings comerciales /rastreo-gps/[ciudad].
 *
 * Complementa lib/risk-zones.ts (estados, ángulo informativo de riesgo)
 * con el ángulo comercial por ciudad: "rastreo GPS en Monterrey",
 * "gps para flotillas Guadalajara", etc.
 *
 * Datos:
 * - metroPop: población aproximada (INEGI, Censo 2020; "ZM" = zona
 *   metropolitana). Cifras redondeadas, son contexto, no estadística.
 * - economy / fleets: perfil económico y tipo de flotas que operan en
 *   la ciudad (hechos públicos y verificables).
 * - zones: vialidades, corredores y zonas industriales/logísticas
 *   reales de la ciudad (hecho público).
 * - faq: 2 preguntas específicas de la ciudad. El contenido único por
 *   ciudad es lo que evita que estas páginas sean "doorway pages".
 * - stateSlug enlaza con stateRisk (lib/risk-zones.ts) para heredar
 *   índice de riesgo SESNSP, ranking y carreteras del estado.
 */

export type Region =
  | 'Noroeste'
  | 'Norte'
  | 'Noreste'
  | 'Bajío y Occidente'
  | 'Centro'
  | 'Golfo y Sureste'
  | 'Sur';

export interface CityFaq {
  q: string;
  a: string;
}

export interface CityInfo {
  name: string;
  slug: string;
  stateSlug: string;
  region: Region;
  metroPop: string;
  economy: string;
  fleets: string;
  zones: string[];
  faq: CityFaq[];
}

export const cities: CityInfo[] = [
  // ── Centro ──
  {
    name: 'Ciudad de México',
    slug: 'cdmx',
    stateSlug: 'ciudad-de-mexico',
    region: 'Centro',
    metroPop: '21.8 millones (ZM del Valle de México)',
    economy:
      'La Ciudad de México concentra el mercado urbano más grande del país: corporativos, comercio, última milla y la Central de Abasto — el mercado mayorista más grande de América. Todo lo que se vende en el centro del país pasa en algún momento por sus vialidades.',
    fleets:
      'Aquí operan flotas de reparto de última milla, mensajería, camionetas de valor, taxis y autos de plataforma, además de miles de autos particulares que entran y salen por las autopistas a Querétaro, Puebla, Toluca y Pachuca. El robo a repartidores y de vehículos estacionados es el riesgo cotidiano.',
    zones: [
      'Anillo Periférico y Circuito Interior',
      'Central de Abasto (Iztapalapa)',
      'Zona industrial Vallejo (Azcapotzalco)',
      'Calzada Ignacio Zaragoza (salida a Puebla)',
      'Autopista México–Querétaro (salida norte)',
      'Eje Central y corredores del Centro Histórico',
    ],
    faq: [
      {
        q: '¿El GPS funciona en segundos pisos, túneles y estacionamientos subterráneos de CDMX?',
        a: 'En segundos pisos y vialidades abiertas la señal GPS es normal. En túneles y sótanos el GPS puede perder satélites unos segundos, pero el equipo guarda la última posición válida y la plataforma la muestra; al salir, el rastreo se recupera solo. Para flotillas de reparto esto no afecta la operación diaria.',
      },
      {
        q: '¿Sirve contra el robo a repartidores y de mercancía en CDMX?',
        a: 'Sí. Además del rastreo en vivo, SilentEye envía la alerta de pánico o movimiento no autorizado en menos de 3 segundos a tu red (supervisores, otros conductores y voluntarios en un radio de 2 km), con la ubicación en tiempo real para coordinar la respuesta mientras el evento sigue ocurriendo.',
      },
    ],
  },
  {
    name: 'Ecatepec',
    slug: 'ecatepec',
    stateSlug: 'estado-de-mexico',
    region: 'Centro',
    metroPop: '1.6 millones (municipio)',
    economy:
      'Ecatepec es el municipio más poblado del Estado de México y una de las zonas con más robo de vehículo del país según cifras del SESNSP. Es paso obligado del comercio que entra y sale del norte del Valle de México por la Vía Morelos y la carretera federal México–Pachuca.',
    fleets:
      'Predominan autos particulares, transporte de personal, camionetas de reparto y unidades de carga ligera que se mueven entre bodegas de Xalostoc, Santa Clara y Cerro Gordo. Es exactamente el perfil de vehículo que más se roba en México, por eso el GPS con alerta inmediata aquí no es lujo: es requisito.',
    zones: [
      'Vía Morelos (corredor industrial Xalostoc–Santa Clara)',
      'Avenida Central / Carlos Hank González',
      'Carretera federal México–Pachuca (R-1)',
      'Circuito Exterior Mexiquense',
      'Av. José López Portillo (límite con Coacalco y Tultitlán)',
    ],
    faq: [
      {
        q: '¿Vale la pena un GPS en Ecatepec si mi auto ya tiene seguro?',
        a: 'Sí, y muchas aseguradoras lo exigen o dan descuento por tenerlo. El seguro repone la unidad meses después; el GPS con alerta en menos de 3 segundos aumenta la probabilidad de recuperarla en los primeros minutos, que es cuando la mayoría de los vehículos robados todavía se puede ubicar.',
      },
      {
        q: '¿Qué GPS conviene para un auto o camioneta en Ecatepec?',
        a: 'Para auto particular, un Cobán TK103 o Sinotrack ST-901 (~$400–500 MXN una sola vez) con el plan Personal de $99 MXN/mes. Para camionetas de reparto, un Concox GT06N o Teltonika FMB920 con corte de corriente remoto y geocercas por zona de trabajo.',
      },
    ],
  },
  {
    name: 'Toluca',
    slug: 'toluca',
    stateSlug: 'estado-de-mexico',
    region: 'Centro',
    metroPop: '2.4 millones (ZM)',
    economy:
      'Toluca y el corredor Toluca–Lerma concentran plantas automotrices, alimentos y bebidas, farmacéuticas y el aeropuerto internacional AIT, uno de los principales hubs de carga aérea del país. Es la segunda concentración industrial del Valle de México.',
    fleets:
      'Operan flotas de transporte de personal para parques industriales, camiones de distribución hacia CDMX y el Bajío, y unidades de carga que cruzan por la México–Toluca, una autopista con robo de transporte documentado. Las empresas del corredor suelen exigir GPS a sus transportistas.',
    zones: [
      'Corredor industrial Toluca–Lerma',
      'Paseo Tollocan',
      'Autopista México–Toluca (La Marquesa)',
      'Aeropuerto Internacional de Toluca (AIT)',
      'Boulevard Aeropuerto y Parque Industrial Toluca 2000',
    ],
    faq: [
      {
        q: '¿SilentEye sirve para transporte de personal en los parques industriales de Toluca y Lerma?',
        a: 'Sí. Con el plan Flotillas asignas conductores por unidad, configuras geocercas por planta y por ruta, recibes alertas de exceso de velocidad y generas reportes PDF por turno. Todo desde el navegador, sin instalar software en la empresa.',
      },
      {
        q: '¿Qué pasa si asaltan una unidad en la México–Toluca?',
        a: 'El conductor presiona el botón de pánico (físico en el GPS o desde su celular) y en menos de 3 segundos los supervisores y la red cercana reciben la alerta con ubicación en vivo, para dar aviso inmediato a las autoridades con datos precisos en lugar de una descripción vaga.',
      },
    ],
  },
  {
    name: 'Puebla',
    slug: 'puebla',
    stateSlug: 'puebla',
    region: 'Centro',
    metroPop: '3.2 millones (ZM Puebla–Tlaxcala)',
    economy:
      'Puebla es el cuarto mercado urbano de México y un cluster automotriz mayor: las plantas de Volkswagen y Audi (San José Chiapa) mueven miles de autopartes y unidades terminadas al día. A eso se suman textiles, alimentos y el comercio del centro-sur del país.',
    fleets:
      'Circulan madrinas (nodrizas de autos), camiones de autopartes justo a tiempo, flotas de reparto urbano y transporte de personal. La autopista México–Puebla y el tramo hacia Orizaba están entre los corredores con más robo de transporte de carga del país, según reportes públicos de la ANERPV.',
    zones: [
      'Autopista México–Puebla (tramos Río Frío y Texmelucan)',
      'Periférico Ecológico',
      'Parque industrial FINSA y Puebla 2000',
      'Corredor Puebla–Orizaba (150D)',
      'Arco Norte (entronque a Tlaxcala e Hidalgo)',
    ],
    faq: [
      {
        q: '¿Cómo protege SilentEye a un camión en la México–Puebla?',
        a: 'Con geocercas de ruta, alerta automática de desvío, botón de pánico físico para el operador (DIN1 en Teltonika FMC130) y alerta de corte de corriente. Si algo pasa, la alerta llega en menos de 3 segundos con la ubicación exacta del kilómetro, no "en algún punto de la autopista".',
      },
      {
        q: '¿Funciona para los talleres y flotillas del Periférico Ecológico?',
        a: 'Sí. El plan Flotillas ($79 MXN/mes por vehículo desde 4 unidades) da panel multi-vehículo, conductores asignados e historial de 90 días. Cualquier GPS Concox, Cobán, Sinotrack, Queclink o Teltonika que ya tengan instalado se conecta sin cambiar hardware.',
      },
    ],
  },
  {
    name: 'Cuernavaca',
    slug: 'cuernavaca',
    stateSlug: 'morelos',
    region: 'Centro',
    metroPop: '1.0 millones (ZM)',
    economy:
      'Cuernavaca combina el corredor industrial CIVAC (con la planta de Nissan) con una economía de servicios y fin de semana: cada viernes bajan miles de vehículos de CDMX por la Autopista del Sol. Morelos aparece de forma recurrente entre los estados con mayor tasa de robo de vehículo.',
    fleets:
      'Hay flotas de autopartes y distribución en CIVAC y Jiutepec, reparto urbano, y muchos autos particulares "de fin de semana" que pasan días solos en casas de descanso — un blanco clásico que el GPS con alerta de movimiento no autorizado resuelve bien.',
    zones: [
      'CIVAC (Ciudad Industrial del Valle de Cuernavaca)',
      'Autopista del Sol (México–Cuernavaca–Acapulco)',
      'Boulevard Cuauhnáhuac (Cuernavaca–Jiutepec)',
      'Paso Exprés / Libramiento de Cuernavaca',
    ],
    faq: [
      {
        q: 'Tengo casa de descanso en Morelos, ¿me avisa si mueven mi auto entre semana?',
        a: 'Sí. Activas la alerta de movimiento no autorizado o una geocerca alrededor de tu casa y, si el vehículo se mueve sin que tú lo esperes, recibes la alerta al instante con ubicación en vivo desde cualquier navegador, estés en Cuernavaca o en CDMX.',
      },
      {
        q: '¿Qué plan conviene para una flotilla pequeña en CIVAC?',
        a: 'Desde 4 unidades, el plan Flotillas a $79 MXN/mes por vehículo: panel único, geocercas por planta y cliente, alertas de velocidad y reportes PDF. Con menos de 4 unidades, el plan Personal a $99 MXN/mes por vehículo cubre hasta 3.',
      },
    ],
  },
  {
    name: 'Pachuca',
    slug: 'pachuca',
    stateSlug: 'hidalgo',
    region: 'Centro',
    metroPop: '600 mil (ZM)',
    economy:
      'Pachuca es la puerta logística del norte del Valle de México: la plataforma logística de Hidalgo (PLATAH) y el entronque del Arco Norte con la México–Pachuca han atraído centros de distribución que surten a CDMX sin entrar a la ciudad.',
    fleets:
      'Predominan camiones de distribución que bajan a CDMX y Ecatepec, flotas de materiales de construcción y reparto regional hacia Tulancingo y Ciudad Sahagún. El tramo México–Pachuca y el Arco Norte concentran el riesgo de robo de carga de la zona.',
    zones: [
      'Carretera México–Pachuca (85D)',
      'Arco Norte (entronques Sahagún y Tizayuca)',
      'PLATAH y corredor Tizayuca–Villa de Tezontepec',
      'Boulevard Felipe Ángeles',
    ],
    faq: [
      {
        q: '¿Conviene GPS si mi ruta diaria es Pachuca–CDMX?',
        a: 'Es de las rutas donde más se justifica: alta densidad de robo de vehículo y de carga en el tramo Ecatepec–Tizayuca. Con SilentEye tienes rastreo en vivo, alerta de desvío de ruta y botón de pánico con respuesta en menos de 3 segundos.',
      },
      {
        q: '¿Puedo monitorear desde Pachuca una flotilla que reparte en todo Hidalgo?',
        a: 'Sí. La cobertura depende de la señal celular del chip del GPS (Telcel, AT&T o Movistar), no de una "zona de servicio". Donde tu unidad tenga señal — Tulancingo, Tula, Huejutla o la Sierra — la ves en tu panel.',
      },
    ],
  },

  // ── Bajío y Occidente ──
  {
    name: 'Guadalajara',
    slug: 'guadalajara',
    stateSlug: 'jalisco',
    region: 'Bajío y Occidente',
    metroPop: '5.3 millones (ZM)',
    economy:
      'Guadalajara es la capital económica del occidente: electrónica y semiconductores en El Salto y Zapopan (el "Silicon Valley mexicano"), agroindustria y tequila hacia los Altos, y el segundo mercado de consumo del país. Jalisco está año con año entre los estados con más robo de vehículo en términos absolutos.',
    fleets:
      'Operan flotas de distribución regional (occidente y Pacífico), transporte de electrónica de alto valor, reparto urbano y miles de motos de última milla — la moto es el vehículo más robado de México y en la ZMG abundan.',
    zones: [
      'Anillo Periférico (Manuel Gómez Morín)',
      'Corredor industrial El Salto / Carretera a Chapala (aeropuerto)',
      'Avenida López Mateos (salida a Colima)',
      'Carretera libre a Zapotlanejo (salida a México)',
      'Zona industrial de Guadalajara (Lázaro Cárdenas)',
      'Periférico Norte (Zapopan–Tonalá)',
    ],
    faq: [
      {
        q: '¿Qué GPS conviene para una moto de reparto en Guadalajara?',
        a: 'Un Sinotrack ST-901 o Concox WeTrack2: son compactos, se ocultan bien y aguantan intemperie. Con SilentEye detectas vibración, movimiento no autorizado y encendido fuera de horario, con alerta al instante. El plan Personal cuesta $99 MXN/mes por unidad.',
      },
      {
        q: '¿Pueden las empresas de electrónica de El Salto exigirme GPS como transportista?',
        a: 'Es práctica común: los embarcadores de alto valor piden rastreo en vivo, geocercas de ruta y botón de pánico. Con SilentEye cumples ese requisito con tu propio GPS (Teltonika, Queclink, Concox, Cobán o Sinotrack) a $79 MXN/mes por unidad en plan Flotillas, sin contrato anual.',
      },
    ],
  },
  {
    name: 'León',
    slug: 'leon',
    stateSlug: 'guanajuato',
    region: 'Bajío y Occidente',
    metroPop: '1.9 millones (ZM)',
    economy:
      'León es la capital cuero-calzado de México y el mayor mercado del Bajío. A 20 minutos está el Puerto Interior de Silao — uno de los recintos logísticos más importantes del país — y el cluster automotriz de Guanajuato (GM Silao, pieles, autopartes). El estado de Guanajuato está entre los primeros lugares nacionales de robo de vehículo.',
    fleets:
      'Circulan camiones de piel y calzado, unidades de autopartes hacia Silao, reparto urbano intenso y transporte de personal a parques industriales. El corredor León–Silao–Irapuato es de los tramos más vigilados por las propias empresas.',
    zones: [
      'Boulevard Adolfo López Mateos',
      'Carretera 45 León–Silao (Puerto Interior)',
      'Boulevard Aeropuerto (BJX)',
      'Zona Piel y centro de distribución mayorista',
      'Libramiento Norte de León',
    ],
    faq: [
      {
        q: '¿Sirve SilentEye para el corredor León–Silao–Irapuato?',
        a: 'Sí, y es de los tramos donde más lo recomendamos por el nivel de robo de vehículo en Guanajuato. Geocercas de ruta sobre la 45, alerta de desvío, botón de pánico físico y alerta a la red cercana en menos de 3 segundos.',
      },
      {
        q: 'Tengo 6 camionetas repartiendo calzado, ¿cuánto me cuesta?',
        a: 'Plan Flotillas: 6 × $79 = $474 MXN/mes con panel multi-vehículo, conductores, alertas de velocidad e historial de 90 días. Si tus camionetas ya traen GPS Concox, Cobán, Sinotrack, Queclink o Teltonika, no compras hardware: solo se apunta el servidor a SilentEye.',
      },
    ],
  },
  {
    name: 'Celaya',
    slug: 'celaya',
    stateSlug: 'guanajuato',
    region: 'Bajío y Occidente',
    metroPop: '730 mil (ZM)',
    economy:
      'Celaya es nodo ferroviario y carretero del Bajío, sede de la planta de Honda y de un cinturón agroindustrial fuerte. También es, según cifras públicas del SESNSP, una de las zonas urbanas con mayor incidencia de robo de vehículo del país, junto con el corredor Apaseo–Villagrán.',
    fleets:
      'Operan autopartes justo a tiempo, transporte agrícola, distribución regional y transporte de personal. En esta zona muchas empresas ya no preguntan si poner GPS, sino cuál — la diferencia la hace la velocidad de la alerta.',
    zones: [
      'Corredor Celaya–Apaseo el Grande–Querétaro (45D)',
      'Carretera Celaya–Villagrán–Irapuato (45 libre)',
      'Eje Nororiente / Libramiento ferroviario',
      'Parques industriales Amistad y Ferropuerto',
    ],
    faq: [
      {
        q: '¿Por qué se insiste tanto en GPS con botón de pánico en Celaya?',
        a: 'Porque el corredor industrial de Guanajuato concentra robo de vehículo con violencia, donde el conductor sí alcanza a pedir ayuda si el botón está a la mano. SilentEye distribuye esa alerta en menos de 3 segundos a supervisores y red cercana con ubicación en vivo.',
      },
      {
        q: '¿Qué equipo recomiendan para tractocamión en el Bajío?',
        a: 'Teltonika FMC130 con botón de pánico físico (entrada DIN1) y respaldo de batería interna, o Queclink GV500. Ambos son grado industrial, aguantan vibración de carretera y se conectan a SilentEye sin intermediarios.',
      },
    ],
  },
  {
    name: 'Querétaro',
    slug: 'queretaro',
    stateSlug: 'queretaro',
    region: 'Bajío y Occidente',
    metroPop: '1.6 millones (ZM)',
    economy:
      'Querétaro es el cruce logístico del país: por la 57 pasa buena parte del comercio México–Laredo, y la ciudad suma cluster aeroespacial, centros de datos y manufactura avanzada. Su seguridad relativa contrasta con los tramos carreteros que la rodean hacia Guanajuato y San Luis Potosí.',
    fleets:
      'Aquí tienen base flotas nacionales de transporte, unidades aeroespaciales y de autopartes, y reparto de consumo hacia el Bajío y el Valle de México. El riesgo típico no es la ciudad, sino los tramos 57 (San Juan del Río–Palmillas) y 45 hacia Celaya.',
    zones: [
      'Carretera 57 México–Querétaro (tramo San Juan del Río)',
      'Parque Aeroespacial Querétaro (aeropuerto AIQ)',
      'Parques industriales El Marqués y Bernardo Quintana',
      'Libramiento Noreste / Paseo de la República (5 de Febrero)',
      'Carretera 45 Querétaro–Celaya',
    ],
    faq: [
      {
        q: 'Mi flota sale de Querétaro a todo el país, ¿me cubre una sola plataforma?',
        a: 'Sí. SilentEye tiene cobertura nacional porque depende de la red celular del chip del GPS, no de una zona de servicio. Tus unidades se ven en el mismo panel estén en la 57, en Monterrey o en Mérida, con historial de 90 días en plan Flotillas.',
      },
      {
        q: '¿Se integra con lo que ya piden las aseguradoras de transporte?',
        a: 'SilentEye cubre lo que la mayoría exige para carga: rastreo en vivo 24/7, botón de pánico, alerta de desvío y reporte PDF del incidente para el ajustador. Revisa nuestra guía de GPS para flotillas donde explicamos los requisitos típicos de aseguradoras.',
      },
    ],
  },
  {
    name: 'Aguascalientes',
    slug: 'aguascalientes',
    stateSlug: 'aguascalientes',
    region: 'Bajío y Occidente',
    metroPop: '1.1 millones (ZM)',
    economy:
      'Aguascalientes vive del cluster Nissan (dos plantas) y su cadena de proveedores, más textil y TI. Es de los estados con menor robo de vehículo del país, así que el GPS aquí se usa más para operación y control de flota que para emergencias.',
    fleets:
      'Transporte de personal a plantas, autopartes justo a tiempo, reparto urbano y flotas comerciales. El caso de uso dominante: saber dónde está cada unidad, controlar velocidad y horarios, y tener evidencia PDF ante clientes.',
    zones: [
      'Carretera 45 Norte (corredor a Zacatecas)',
      'Carretera 45 Sur (corredor a León)',
      'Parque Industrial de Logística Automotriz (PILA)',
      'Anillo Vial (Segundo y Tercer Anillo)',
    ],
    faq: [
      {
        q: 'Si Aguascalientes es seguro, ¿para qué GPS?',
        a: 'Para operar: geocercas de planta y cliente, alertas de velocidad y salidas fuera de horario, historial de recorridos y reportes por conductor. Y porque tus unidades no se quedan en el estado: en cuanto toman la 45 hacia León o la 57, entran a zonas de riesgo alto.',
      },
      {
        q: '¿Cuánto cuesta para una flotilla de transporte de personal?',
        a: '$79 MXN/mes por vehículo desde 4 unidades, sin contrato. El hardware compatible (Concox GT06N, Sinotrack ST-901, Teltonika FMB920) cuesta $350–1,500 MXN por unidad una sola vez, según el nivel que necesites.',
      },
    ],
  },
  {
    name: 'San Luis Potosí',
    slug: 'san-luis-potosi',
    stateSlug: 'san-luis-potosi',
    region: 'Bajío y Occidente',
    metroPop: '1.3 millones (ZM)',
    economy:
      'San Luis Potosí está en el cruce de la 57 (México–Laredo) con la 70 y la 80: es plataforma logística natural del centro-norte, con plantas de BMW y General Motors, y una zona industrial de las más grandes del Bajío extendido.',
    fleets:
      'Flotas de autopartes y unidades terminadas, transporte de personal, y carga de paso que cruza el estado rumbo a Monterrey o al puerto de Tampico. Los tramos 57 hacia Matehuala y la Rioverde–Valles concentran el riesgo carretero.',
    zones: [
      'Carretera 57 (tramos a Querétaro y a Matehuala)',
      'Zona Industrial de SLP (Eje 140)',
      'Parque Logistik I y II (Villa de Reyes, planta BMW)',
      'Periférico y distribuidor Juárez',
    ],
    faq: [
      {
        q: '¿Cubre la ruta SLP–Tampico por la Valles?',
        a: 'Sí, con la salvedad de cualquier GPS: en cañones de la Sierra puede haber tramos cortos sin señal celular; el equipo guarda las posiciones y las envía al recuperar señal, así que el historial queda completo.',
      },
      {
        q: '¿Qué GPS aguanta el uso rudo de carga en la 57?',
        a: 'Teltonika FMC130 o Queclink GV500: grado industrial, botón de pánico físico, respaldo de batería y detección de corte de corriente. Con SilentEye, la alerta de pánico llega en menos de 3 segundos a tu base.',
      },
    ],
  },
  {
    name: 'Morelia',
    slug: 'morelia',
    stateSlug: 'michoacan',
    region: 'Bajío y Occidente',
    metroPop: '990 mil (ZM)',
    economy:
      'Morelia es el centro comercial y de servicios de Michoacán, la puerta del corredor agroalimentario más exportador del país (aguacate, berries) y del eje al puerto de Lázaro Cárdenas por la Siglo XXI.',
    fleets:
      'Camiones refrigerados de aguacate y berries hacia empacadoras y frontera, carga de paso al puerto, reparto urbano y flotas de servicios. El transporte agrícola de alto valor es blanco conocido de robo en carretera en la región.',
    zones: [
      'Autopista Siglo XXI (Morelia–Lázaro Cárdenas)',
      'Carretera Morelia–Salamanca (43)',
      'Libramiento de Morelia',
      'Corredor Uruapan–Cuatro Caminos (ruta del aguacate)',
    ],
    faq: [
      {
        q: '¿Cómo protege SilentEye un camión refrigerado de aguacate?',
        a: 'Rastreo en vivo con geocerca de ruta (huerta–empacadora–autopista), alerta inmediata de desvío o parada no programada, botón de pánico para el operador y alerta en menos de 3 segundos a tu base con ubicación exacta para coordinar con autoridades.',
      },
      {
        q: '¿Funciona en zonas rurales de Michoacán?',
        a: 'Funciona donde el chip del GPS tenga señal celular (Telcel suele ser la de mayor cobertura rural). En huertas sin señal, el GPS almacena posiciones y las sube al reconectar: el recorrido completo queda en tu historial.',
      },
    ],
  },

  // ── Noreste ──
  {
    name: 'Monterrey',
    slug: 'monterrey',
    stateSlug: 'nuevo-leon',
    region: 'Noreste',
    metroPop: '5.3 millones (ZM)',
    economy:
      'Monterrey es la capital industrial de México: acero, cemento, electrodomésticos, bebidas y la base de los grandes transportistas del país. Su economía vive del cruce a Estados Unidos por Nuevo Laredo y Colombia — el corredor de carga más valioso de América Latina.',
    fleets:
      'Aquí están las flotas de tractocamiones más grandes del país, transfer a frontera, transporte de personal a parques de Apodaca y Santa Catarina, y reparto urbano intenso. La autopista a Nuevo Laredo es de los tramos más monitoreados de México, y aun así el robo de carga existe.',
    zones: [
      'Autopista Monterrey–Nuevo Laredo (85D, "la Nacional")',
      'Carretera a Laredo libre (85) y periférico de Apodaca',
      'Av. Miguel Alemán y corredor aeropuerto (MTY)',
      'Parques industriales de Apodaca, Guadalupe y Santa Catarina',
      'Carretera a Saltillo (40) y Av. Constitución',
      'Puente Colombia (Anáhuac)',
    ],
    faq: [
      {
        q: '¿Sirve para transfer Monterrey–Nuevo Laredo–Colombia?',
        a: 'Es el caso de uso ideal: geocerca de ruta sobre la 85D, alerta de desvío y de parada no programada, botón de pánico físico para el operador y visibilidad en vivo para tu cliente embarcador. Si la unidad cruza a EE. UU., sigue reportando siempre que el chip tenga roaming de datos.',
      },
      {
        q: 'Ya tengo GPS en mis tractos con otro proveedor, ¿tengo que cambiar equipos?',
        a: 'Si son Teltonika, Queclink, Concox, Cobán o Sinotrack, no: se reapunta el servidor del equipo a SilentEye y listo. Pasas de pagar rentas de $250–450 MXN por unidad a $79 MXN/mes en plan Flotillas, sin contrato anual.',
      },
    ],
  },
  {
    name: 'Saltillo',
    slug: 'saltillo',
    stateSlug: 'coahuila',
    region: 'Noreste',
    metroPop: '1.0 millones (ZM)',
    economy:
      'Saltillo–Ramos Arizpe es el "Detroit de México": plantas de General Motors y Stellantis, cientos de proveedores de autopartes y una vocación exportadora total hacia Texas por la 57.',
    fleets:
      'Madrinas de autos, autopartes justo a tiempo, transporte de personal a Ramos Arizpe y Derramadero, y carga de paso entre el Bajío y la frontera. Un paro por robo aquí detiene líneas de producción: por eso el estándar es GPS con alerta inmediata.',
    zones: [
      'Carretera 57 Saltillo–Monclova–Piedras Negras',
      'Carretera Saltillo–Monterrey (40D)',
      'Parques industriales de Ramos Arizpe',
      'Corredor Derramadero (planta Stellantis)',
    ],
    faq: [
      {
        q: '¿Qué exige la industria automotriz de Saltillo a sus transportistas en GPS?',
        a: 'Lo típico: rastreo en vivo, geocercas de ruta y de planta, alertas de desvío y evidencia del recorrido. SilentEye lo cubre con panel web (sin instalar software), historial de 90 días y reportes PDF por unidad o incidente.',
      },
      {
        q: '¿A cuánto sale monitorear 10 unidades de autopartes?',
        a: '10 × $79 = $790 MXN/mes, sin contrato ni permanencia. Si tus unidades ya traen GPS compatible, no hay inversión de hardware; si no, un Teltonika FMB920 por unidad ronda $1,200–1,500 MXN una sola vez.',
      },
    ],
  },
  {
    name: 'Torreón',
    slug: 'torreon',
    stateSlug: 'coahuila',
    region: 'Noreste',
    metroPop: '1.4 millones (ZM de La Laguna)',
    economy:
      'La Laguna (Torreón–Gómez Palacio–Lerdo) es la cuenca lechera más grande del país (Lala) y un nodo de metalurgia, autopartes y algodón histórico. Su posición a mitad de la 40 la vuelve escala obligada entre Mazatlán, Durango, Saltillo y Monterrey.',
    fleets:
      'Pipas y camiones refrigerados de leche con rutas diarias fijas, carga de metalurgia, y transporte de paso por la 40 y la 49. Las rutas lecheras — misma hora, mismo camino — son las que más se benefician de geocercas y alertas de desvío.',
    zones: [
      'Carretera 40 (Torreón–Saltillo y Torreón–Durango)',
      'Carretera 49 (a Zacatecas)',
      'Periférico Raúl López Sánchez',
      'Zona industrial de Gómez Palacio (Dgo.)',
    ],
    faq: [
      {
        q: '¿Cómo ayuda el GPS en rutas lecheras con horarios fijos?',
        a: 'Configuras la ruta y el horario como geocerca: si la unidad se desvía, se detiene de más o sale fuera de horario, la alerta llega sola. No necesitas estar viendo el mapa: SilentEye te avisa cuando algo se sale del patrón.',
      },
      {
        q: '¿La plataforma distingue Torreón (Coahuila) de Gómez Palacio (Durango)?',
        a: 'Sí, el mapa es continuo y las geocercas son tuyas: puedes tener una por cada planta o cliente en ambos lados del río Nazas. La cobertura es la de la red celular, que en toda la zona metropolitana es completa.',
      },
    ],
  },
  {
    name: 'Nuevo Laredo',
    slug: 'nuevo-laredo',
    stateSlug: 'tamaulipas',
    region: 'Noreste',
    metroPop: '425 mil',
    economy:
      'Nuevo Laredo es el puerto terrestre más importante de América: por el Puente III (Comercio Mundial) cruza más comercio México–EE. UU. que por ningún otro punto. Toda la ciudad vive del transfer, las maniobras de patio y la logística aduanal.',
    fleets:
      'Transfers que cruzan el puente decenas de veces al día, patios de cajas y tractos esperando módulo, y carga nacional que llega por la 85. El robo y el "préstamo" no autorizado de unidades en patios es un problema conocido que el GPS con geocercas resuelve.',
    zones: [
      'Puente III Comercio Mundial y World Trade',
      'Carretera 85 / Anáhuac (a Monterrey y Colombia)',
      'Libramiento Mex II y corredor de patios fiscales',
      'Aduana y recintos fiscalizados',
    ],
    faq: [
      {
        q: '¿El GPS sigue reportando cuando mi transfer cruza a Laredo, Texas?',
        a: 'Sí, si el chip SIM tiene roaming de datos (Telcel y AT&T lo ofrecen en la franja fronteriza). La plataforma no distingue frontera: la unidad sigue en tu mapa en vivo del lado americano.',
      },
      {
        q: '¿Cómo controlo que mis tractos no salgan del patio fuera de horario?',
        a: 'Geocerca sobre el patio + alerta de salida fuera de horario. Si una unidad cruza el límite sin autorización, el sistema alerta al instante a los supervisores con la ubicación en vivo. Es el anti-"préstamo" de unidades más simple que existe.',
      },
    ],
  },
  {
    name: 'Reynosa',
    slug: 'reynosa',
    stateSlug: 'tamaulipas',
    region: 'Noreste',
    metroPop: '700 mil',
    economy:
      'Reynosa es la ciudad más poblada de Tamaulipas y un cluster de maquiladora fuerte (electrónica, médico, arneses), pegado al cruce de Pharr — la puerta número uno de productos frescos hacia EE. UU.',
    fleets:
      'Cajas refrigeradas de aguacate y fresco que suben a Pharr, transporte de personal de maquiladora a toda hora, y transfer local. El transporte de personal nocturno es el caso de uso de seguridad más sensible de la ciudad.',
    zones: [
      'Puente Pharr–Reynosa y corredor de exportación fresca',
      'Carretera Reynosa–Matamoros (2)',
      'Carretera Reynosa–Monterrey (40)',
      'Parques industriales Villa Florida, Del Norte y Colonial',
    ],
    faq: [
      {
        q: '¿Sirve para transporte de personal de maquiladora en turnos de noche?',
        a: 'Es de los usos más valiosos: ruta como geocerca, alerta si la unidad se detiene donde no debe o se desvía, botón de pánico del operador y visibilidad en vivo para el coordinador de seguridad de la planta. Todo con alerta en menos de 3 segundos.',
      },
      {
        q: '¿Qué pasa con la señal en la carretera Reynosa–Monterrey?',
        a: 'La 40 tiene cobertura celular casi continua; en los huecos cortos el GPS guarda posiciones y las envía al reconectar, así que el historial del viaje queda completo y las alertas pendientes se disparan al recuperar señal.',
      },
    ],
  },
  {
    name: 'Tampico',
    slug: 'tampico',
    stateSlug: 'tamaulipas',
    region: 'Noreste',
    metroPop: '930 mil (ZM del sur de Tamaulipas)',
    economy:
      'Tampico–Madero–Altamira combinan puerto comercial (Altamira, uno de los de mayor crecimiento del Golfo), refinación en Madero y servicios petroleros. La zona conecta la Huasteca con el corredor industrial del Golfo.',
    fleets:
      'Pipas y unidades de servicios petroleros, drayage del puerto de Altamira, carga de químicos y flotas urbanas. El manejo de materiales peligrosos hace que el monitoreo de velocidad y paradas sea requisito normativo y de aseguradora.',
    zones: [
      'Puerto industrial de Altamira y su corredor',
      'Carretera Tampico–Ciudad Victoria (70/85)',
      'Carretera Tampico–Valles (70)',
      'Bulevar Adolfo López Mateos (Tampico–Madero)',
    ],
    faq: [
      {
        q: '¿Sirve para pipas y materiales peligrosos?',
        a: 'Sí: alertas de exceso de velocidad configurables por unidad, geocercas de ruta autorizada, historial de 90 días y reportes PDF que sirven como evidencia ante aseguradora o cliente. El botón de pánico físico es compatible con Teltonika FMC130.',
      },
      {
        q: '¿Cubre los patios del puerto de Altamira?',
        a: 'Sí, la zona portuaria tiene cobertura celular completa. Puedes poner geocerca por patio o terminal y recibir alerta de entrada/salida de cada unidad, útil para medir tiempos de maniobra reales.',
      },
    ],
  },

  // ── Norte ──
  {
    name: 'Chihuahua',
    slug: 'chihuahua',
    stateSlug: 'chihuahua',
    region: 'Norte',
    metroPop: '990 mil (ZM)',
    economy:
      'La capital de Chihuahua combina aeroespacial y maquiladora con la mayor ganadería exportadora del país y agroindustria (nuez, manzana en la región). Es el eslabón central del corredor 45 entre Delicias, Cuauhtémoc y Ciudad Juárez.',
    fleets:
      'Camiones de ganado y agro hacia la frontera, autopartes y aeroespacial, y flotas de servicios en una ciudad extensa. Las distancias largas del estado hacen del GPS la única forma realista de supervisar rutas.',
    zones: [
      'Carretera 45 (Chihuahua–Delicias y Chihuahua–Juárez)',
      'Carretera 16 (a Cuauhtémoc y la Sierra)',
      'Periférico de la Juventud y R. Almada',
      'Parques industriales Las Américas y Complejo Industrial Chihuahua',
    ],
    faq: [
      {
        q: '¿Funciona en la Sierra Tarahumara y zonas rurales del estado?',
        a: 'Funciona donde haya señal celular; en la Sierra hay tramos sin cobertura donde el GPS almacena posiciones y las sube al reconectar. Para operaciones 100% serranas se necesitaría GPS satelital (otro tipo de hardware); para rutas de ciudad y carretera federal, la cobertura es continua.',
      },
      {
        q: '¿Qué plan conviene para una ganadera con 5 camiones?',
        a: 'Flotillas: 5 × $79 = $395 MXN/mes con geocercas por rancho y báscula, alertas de desvío y historial de 90 días. Hardware recomendado: Teltonika FMB920 o Concox GT06N con corte de corriente.',
      },
    ],
  },
  {
    name: 'Ciudad Juárez',
    slug: 'ciudad-juarez',
    stateSlug: 'chihuahua',
    region: 'Norte',
    metroPop: '1.5 millones',
    economy:
      'Ciudad Juárez es la capital mundial de la maquiladora: cientos de plantas de electrónica, médico y automotriz operando 24/7 frente a El Paso, con tres puentes de carga (Zaragoza, Córdova, Santa Teresa a un lado).',
    fleets:
      'Transporte de personal en turnos continuos (el mayor parque de la ciudad), transfer de cruce, y last-mile industrial entre plantas y centros de distribución. La seguridad del transporte de personal nocturno es prioridad número uno.',
    zones: [
      'Puente Zaragoza–Ysleta y corredor Independencia',
      'Boulevard Juan Pablo II (aeropuerto y parques)',
      'Avenida Tecnológico y Panamericana (45)',
      'Parques industriales Bermúdez, Río Bravo y Omega',
    ],
    faq: [
      {
        q: '¿Cómo aseguro las rutas de transporte de personal en Juárez?',
        a: 'Cada ruta se configura como geocerca con horario; el sistema alerta por desvío, parada no programada o exceso de velocidad, y el operador tiene botón de pánico. Los coordinadores ven todas las unidades en vivo desde el navegador, sin instalar nada.',
      },
      {
        q: '¿Reporta del lado de El Paso si el transfer cruza?',
        a: 'Sí, con chip SIM con roaming de datos (común en la franja fronteriza con Telcel o AT&T). La unidad sigue visible en tu panel sin configuración extra.',
      },
    ],
  },

  // ── Noroeste ──
  {
    name: 'Tijuana',
    slug: 'tijuana',
    stateSlug: 'baja-california',
    region: 'Noroeste',
    metroPop: '2.2 millones (ZM)',
    economy:
      'Tijuana es la frontera más cruzada del mundo (San Ysidro) y un cluster de dispositivos médicos, electrónica y aeroespacial en Otay. Baja California aparece consistentemente entre los estados con mayor robo de vehículo del país.',
    fleets:
      'Transfer de Otay, transporte de personal de maquiladora, reparto urbano en una mancha extendida hasta Rosarito y Tecate, y muchísimo auto particular — el segmento más golpeado por el robo en la ciudad.',
    zones: [
      'Mesa de Otay (garita de carga y parques industriales)',
      'Vía Rápida y Zona Río',
      'Boulevard 2000 (Tijuana–Rosarito)',
      'Corredor Tijuana–Tecate (2D)',
      'La Presa / El Florido (zona industrial este)',
    ],
    faq: [
      {
        q: '¿Qué tan grave es el robo de autos en Tijuana y qué hace SilentEye al respecto?',
        a: 'Baja California está entre los primeros lugares nacionales de robo de vehículo (índice SESNSP 75/100 del estado). SilentEye detecta encendido o movimiento no autorizado y corte de corriente, y manda la alerta en menos de 3 segundos con ubicación en vivo — los primeros minutos deciden si un auto se recupera.',
      },
      {
        q: '¿Funciona si mi auto cruza a San Diego?',
        a: 'Sí, siempre que el chip del GPS tenga roaming de datos (planes fronterizos de Telcel/AT&T lo incluyen). Verás la unidad en tu mapa igual que en Tijuana.',
      },
    ],
  },
  {
    name: 'Mexicali',
    slug: 'mexicali',
    stateSlug: 'baja-california',
    region: 'Noroeste',
    metroPop: '1.0 millones',
    economy:
      'Mexicali es capital de Baja California, valle agrícola de exportación (hortalizas de invierno) y base de maquiladora de electrónica y aeroespacial, con cruce de carga por Calexico East.',
    fleets:
      'Camiones refrigerados del valle agrícola, transporte de personal de maquila, y flotas urbanas que operan a 45–50 °C en verano — condición que exige hardware GPS bien instalado y con respaldo de batería.',
    zones: [
      'Garita Mexicali II (Calexico East) y recinto fiscalizado',
      'Carretera 5 (a San Felipe) y 2 (a Tijuana/San Luis R.C.)',
      'Valle agrícola de Mexicali (Ejido Nuevo León, Guadalupe Victoria)',
      'Boulevard Lázaro Cárdenas y zona industrial PIMSA',
    ],
    faq: [
      {
        q: '¿El calor extremo de Mexicali afecta al GPS?',
        a: 'Los equipos que recomendamos (Teltonika, Queclink, Concox) operan de -40 a +85 °C, muy por encima del verano cachanilla. Lo importante es instalarlo lejos del toldo y con el cableado protegido; cualquier instalador de la red de socios lo hace en una hora.',
      },
      {
        q: '¿Sirve para las cuadrillas y camiones del valle agrícola?',
        a: 'Sí: geocercas por campo y empaque, control de velocidad en caminos de terracería, historial de recorridos por unidad y reportes PDF por temporada. Plan Flotillas a $79 MXN/mes por vehículo.',
      },
    ],
  },
  {
    name: 'Hermosillo',
    slug: 'hermosillo',
    stateSlug: 'sonora',
    region: 'Noroeste',
    metroPop: '940 mil',
    economy:
      'Hermosillo combina la planta de estampado y ensamble de Ford con agroindustria de exportación (uva, nuez, hortalizas) y su papel de capital logística de Sonora sobre la carretera 15.',
    fleets:
      'Madrinas y autopartes de Ford, camiones refrigerados agrícolas hacia Nogales, y flotas de servicios urbanos. La 15 Hermosillo–Nogales es la aorta exportadora del noroeste.',
    zones: [
      'Carretera 15 (tramos a Nogales y a Guaymas)',
      'Parque Industrial Dynatech y corredor Ford',
      'Boulevard Solidaridad y Periférico',
      'Costa de Hermosillo (zona agrícola)',
    ],
    faq: [
      {
        q: '¿Cubre la ruta Hermosillo–Nogales para exportación agrícola?',
        a: 'Sí, la 15 tiene cobertura celular prácticamente continua. Configuras la ruta como geocerca, recibes alerta por desvío o parada no programada y tu cliente puede ver el embarque en vivo si le compartes acceso.',
      },
      {
        q: '¿Qué GPS conviene para pickups de campo en la Costa de Hermosillo?',
        a: 'Concox GT06N o Teltonika FMB920: aguantan polvo, vibración y calor. Con geocercas por campo agrícola detectas uso fuera de zona u horario — el clásico desvío de unidades de trabajo en fin de semana.',
      },
    ],
  },
  {
    name: 'Culiacán',
    slug: 'culiacan',
    stateSlug: 'sinaloa',
    region: 'Noroeste',
    metroPop: '1.0 millones',
    economy:
      'Culiacán es la capital agrícola de México: los valles de Culiacán y Navolato surten de hortalizas a todo el país y a EE. UU. en invierno. La logística refrigerada es la industria local por excelencia.',
    fleets:
      'Miles de cajas refrigeradas suben cada temporada por la 15 hacia Nogales y Tijuana; a eso se suman camiones de insumos agrícolas, flotas urbanas y autos particulares en un estado con riesgo vial y de seguridad conocido.',
    zones: [
      'Carretera 15 / Autopista Benito Juárez (a Los Mochis y a Mazatlán)',
      'Valle de Culiacán y carretera a Navolato',
      'Mercado de Abastos y corredor Aeropuerto',
      'Libramiento Benito Juárez (Recursos)',
    ],
    faq: [
      {
        q: '¿Cómo ayuda el GPS en temporada alta de exportación de hortaliza?',
        a: 'Visibilidad en vivo de cada caja para ti y tu comprador, alertas de desvío y de temperatura de parada (paradas no programadas largas = riesgo de cadena de frío), y evidencia PDF del recorrido por embarque. A $79 MXN/mes por unidad, se paga solo con un solo incidente evitado.',
      },
      {
        q: '¿Qué pasa si una unidad pierde señal en la sierra o en contingencias?',
        a: 'El GPS almacena las posiciones sin señal y las sube al reconectar: el recorrido queda completo. Las alertas configuradas se disparan en cuanto la unidad vuelve a tener cobertura.',
      },
    ],
  },
  {
    name: 'Mazatlán',
    slug: 'mazatlan',
    stateSlug: 'sinaloa',
    region: 'Noroeste',
    metroPop: '500 mil',
    economy:
      'Mazatlán es puerto comercial y turístico, punta del supercorredor Mazatlán–Durango–Matamoros (la 40D y el puente Baluarte) que conecta el Pacífico con Texas, además de flota atunera y turismo en crecimiento.',
    fleets:
      'Drayage del puerto, carga que cruza la 40D hacia Durango y el norte, transporte turístico (pulmonías, aurigas, vans de tour) y reparto urbano de temporada alta.',
    zones: [
      'Autopista 40D Mazatlán–Durango (puente Baluarte)',
      'Puerto de Mazatlán y parque Alfredo Bonfil',
      'Avenida Rafael Buelna y Zona Dorada',
      'Carretera 15 (a Culiacán y a Tepic)',
    ],
    faq: [
      {
        q: '¿Hay señal en la 40D y sus túneles rumbo a Durango?',
        a: 'La autopista tiene cobertura en la mayor parte del trazo; dentro de túneles largos (hay más de 60) el GPS guarda posiciones y las sube al salir. Las alertas de desvío siguen funcionando porque se evalúan sobre la ruta completa.',
      },
      {
        q: '¿Sirve para vans turísticas y transporte de hotel?',
        a: 'Sí: los huéspedes llegan a tiempo porque tú ves cada van en vivo, con alertas de velocidad (imagen del hotel = manejo seguro) y geocercas por aeropuerto, hotel y tour. Plan Flotillas desde 4 unidades a $79 MXN/mes cada una.',
      },
    ],
  },

  // ── Golfo y Sureste ──
  {
    name: 'Veracruz',
    slug: 'veracruz',
    stateSlug: 'veracruz',
    region: 'Golfo y Sureste',
    metroPop: '940 mil (ZM)',
    economy:
      'El puerto de Veracruz es el mayor del Golfo de México y la principal puerta de exportación automotriz del país. Su ampliación multiplicó el movimiento de contenedores, autos y granel hacia el centro por la 150D.',
    fleets:
      'Drayage portuario, madrinas de autos, tolvas de granel y carga general sobre la Veracruz–Córdoba–Puebla, un corredor con robo de transporte documentado (el tramo Cuitláhuac–La Tinaja es referencia nacional).',
    zones: [
      'Recinto portuario y ZAL de Veracruz',
      'Autopista 150D (tramos La Tinaja–Córdoba–Orizaba)',
      'Carretera 140 (a Xalapa) y 180 (costera)',
      'Corredor industrial Bruno Pagliai / Ciudad Industrial',
    ],
    faq: [
      {
        q: '¿Por qué todos los transportistas del puerto hablan del tramo La Tinaja–Orizaba?',
        a: 'Porque concentra robo de carga con violencia desde hace años, según reportes públicos de transportistas y aseguradoras. Si tu ruta lo cruza, el estándar mínimo es GPS con botón de pánico físico, geocerca de ruta y alerta de parada no programada — exactamente lo que SilentEye activa por $79 MXN/mes por unidad.',
      },
      {
        q: '¿Puedo darle visibilidad del embarque a mi cliente sin darle mi cuenta?',
        a: 'Sí, puedes crear usuarios con acceso limitado para que tu cliente vea solo las unidades de su embarque en vivo, sin tocar el resto de tu flota ni la configuración.',
      },
    ],
  },
  {
    name: 'Villahermosa',
    slug: 'villahermosa',
    stateSlug: 'tabasco',
    region: 'Golfo y Sureste',
    metroPop: '830 mil (ZM)',
    economy:
      'Villahermosa es la capital energética del sureste: servicios petroleros alrededor de los activos de Pemex y la refinería Olmeca (Dos Bocas), más comercio regional para Tabasco y el norte de Chiapas. Tabasco registra índices de robo de vehículo altos para el sureste.',
    fleets:
      'Pipas, plataformas y unidades de servicios petroleros con contratos que exigen GPS; reparto regional hacia Cárdenas y Comalcalco; y flota urbana en una ciudad de tráfico denso.',
    zones: [
      'Corredor Villahermosa–Dos Bocas (Paraíso)',
      'Carretera 180 (a Cárdenas y a Frontera)',
      'Carretera 186 (a Escárcega / península)',
      'Periférico Carlos Pellicer y Av. Universidad',
    ],
    faq: [
      {
        q: '¿Cumple con lo que piden los contratos de servicios petroleros?',
        a: 'Los contratos suelen pedir monitoreo 24/7, historial y botón de pánico. SilentEye da rastreo en vivo, historial de 90 días (plan Flotillas), botón de pánico físico compatible y reportes PDF por unidad o incidente para tus entregables.',
      },
      {
        q: '¿La lluvia intensa de Tabasco afecta el rastreo?',
        a: 'No de forma práctica: la señal celular y GPS funcionan con lluvia. Recomendamos instalación con conectores sellados y el equipo dentro de cabina, que es la práctica estándar de los instaladores de la región.',
      },
    ],
  },
  {
    name: 'Tuxtla Gutiérrez',
    slug: 'tuxtla-gutierrez',
    stateSlug: 'chiapas',
    region: 'Golfo y Sureste',
    metroPop: '850 mil (ZM)',
    economy:
      'Tuxtla es el centro comercial y de servicios de Chiapas, distribuidor natural hacia San Cristóbal, la costa (Tapachula) y la frontera con Guatemala — rutas largas, de montaña y con tramos de baja cobertura.',
    fleets:
      'Distribución de consumo a todo el estado, flotas de gobierno y servicios, y transporte hacia la frontera de Ciudad Hidalgo. Chiapas es de los estados con menor robo de vehículo, así que el GPS aquí es sobre todo herramienta de operación.',
    zones: [
      'Carretera 190 (a San Cristóbal y Comitán)',
      'Autopista Tuxtla–San Cristóbal',
      'Carretera 200 (costa, a Tonalá y Tapachula)',
      'Libramientos Norte y Sur',
    ],
    faq: [
      {
        q: '¿Qué cobertura hay en las carreteras de montaña de Chiapas?',
        a: 'Las carreteras troncales (190, 200, autopista) tienen cobertura celular en la mayor parte; en cañadas hay huecos donde el GPS guarda posiciones y las envía al reconectar. El historial del viaje siempre queda completo.',
      },
      {
        q: '¿Para qué usar GPS si Chiapas tiene poco robo de autos?',
        a: 'Para operar mejor: rutas largas sin supervisión se prestan a desvíos y uso personal de unidades. Geocercas, alertas de horario y reportes de recorrido convierten cada unidad en una unidad auditada — por $79–99 MXN/mes.',
      },
    ],
  },
  {
    name: 'Mérida',
    slug: 'merida',
    stateSlug: 'yucatan',
    region: 'Golfo y Sureste',
    metroPop: '1.3 millones (ZM)',
    economy:
      'Mérida es la ciudad grande más segura de México y el hub de distribución de toda la península: lo que se consume en Yucatán, Campeche y buena parte de Quintana Roo se cruza por aquí, con el puerto de Progreso y un boom inmobiliario e industrial.',
    fleets:
      'Flotas de distribución peninsular (la ruta Mérida–Cancún es de las más transitadas del sureste), reparto urbano, flotas de construcción y unidades de servicios turísticos. Aquí el GPS se vende por control de operación y por exigencia de clientes, más que por robo.',
    zones: [
      'Anillo Periférico de Mérida',
      'Carretera Mérida–Cancún (180D)',
      'Carretera Mérida–Progreso (puerto)',
      'Parque industrial Hunucmá y zona Umán',
    ],
    faq: [
      {
        q: 'Si Mérida es tan segura, ¿qué me da el GPS?',
        a: 'Control operativo: dónde está cada unidad, quién la trae, a qué velocidad, si salió de su zona u horario, y reportes PDF por unidad. Y en cuanto tus unidades toman la 180 hacia Cancún o salen de la península, la misma plataforma las sigue sin cambiar nada.',
      },
      {
        q: '¿Atienden flotillas grandes en Yucatán y Quintana Roo?',
        a: 'Sí, el plan Flotillas escala de 4 a cientos de unidades con panel único, conductores asignados y facturación simple ($79 MXN/mes por vehículo; tarifa anual preferente para flotas de 50+). La península es una de nuestras zonas con más actividad.',
      },
    ],
  },
  {
    name: 'Cancún',
    slug: 'cancun',
    stateSlug: 'quintana-roo',
    region: 'Golfo y Sureste',
    metroPop: '930 mil (Benito Juárez)',
    economy:
      'Cancún es la capital turística de América Latina: aeropuerto número uno de pasajeros internacionales del país y una economía completa de transporte — transfers, tours, renta de autos, taxis y logística hotelera a lo largo de la 307 hasta Tulum.',
    fleets:
      'Vans y sprinters de transfer aeropuerto–hotel, flotas de tour a Riviera Maya, autos de renta (el segmento con más pérdidas por uso indebido), reparto a hoteles y construcción. El activo rueda 16 horas al día: el GPS es control de negocio puro.',
    zones: [
      'Carretera 307 (Cancún–Playa del Carmen–Tulum)',
      'Zona Hotelera (Blvd. Kukulcán)',
      'Aeropuerto Internacional de Cancún y Blvd. Colosio',
      'Avenida López Portillo y zona de transferencia urbana',
    ],
    faq: [
      {
        q: '¿Cómo controlo mi flota de renta de autos en Cancún?',
        a: 'Geocerca peninsular (alerta si el auto sale de la zona pactada), alertas de velocidad, historial de recorridos por contrato y recuperación inmediata si no devuelven la unidad: ves su ubicación en vivo y la alerta llega en menos de 3 segundos si marcas el evento.',
      },
      {
        q: '¿Sirve para transfers con estándar de servicio de hotel 5 estrellas?',
        a: 'Sí: los coordinadores ven cada van en vivo para prometer tiempos reales, las alertas de velocidad cuidan la experiencia del huésped y el historial resuelve disputas de "no llegó" con evidencia. Plan Flotillas $79 MXN/mes por unidad.',
      },
    ],
  },
  {
    name: 'Oaxaca',
    slug: 'oaxaca',
    stateSlug: 'oaxaca',
    region: 'Sur',
    metroPop: '710 mil (ZM)',
    economy:
      'La ciudad de Oaxaca vive del turismo, el comercio regional y la agroindustria del mezcal; y el estado gana peso logístico con el Corredor Interoceánico (Salina Cruz–Coatzacoalcos) que promete mover carga entre océanos.',
    fleets:
      'Distribución de consumo a Valles Centrales y la Sierra, transporte turístico, unidades mezcaleras hacia envasadoras, y carga que baja al Istmo. Rutas de montaña largas donde la visibilidad remota vale oro.',
    zones: [
      'Carretera 190 (a Istmo) y 175 (a Puerto Escondido)',
      'Autopista Oaxaca–Cuacnopalan (135D, a Puebla)',
      'Periférico y Símbolos Patrios',
      'Corredor Tlacolula–Mitla (ruta del mezcal)',
    ],
    faq: [
      {
        q: '¿Hay cobertura en la Sierra de Oaxaca y rumbo a la costa?',
        a: 'En autopista y carreteras troncales sí; en tramos serranos de la 175 y caminos rurales hay huecos donde el GPS guarda posiciones y las sube al volver la señal. El recorrido completo siempre queda en el historial.',
      },
      {
        q: '¿Sirve para camionetas turísticas a Hierve el Agua o Monte Albán?',
        a: 'Sí: geocercas por punto turístico, tiempos de recorrido reales, alertas de velocidad y ubicación en vivo para el coordinador. El plan Flotillas aplica desde 4 unidades a $79 MXN/mes cada una.',
      },
    ],
  },
  {
    name: 'Acapulco',
    slug: 'acapulco',
    stateSlug: 'guerrero',
    region: 'Sur',
    metroPop: '780 mil',
    economy:
      'Acapulco sigue siendo el puerto y destino de playa del centro del país, en reconstrucción acelerada de su planta turística. La Autopista del Sol lo conecta con CDMX y concentra el flujo de fin de semana y de carga de suministro.',
    fleets:
      'Transporte turístico y de personal hotelero, reparto de suministro que baja por la Autopista del Sol, flotas de construcción de la reconstrucción, y carga costera por la 200.',
    zones: [
      'Autopista del Sol (95D, tramo Chilpancingo–Acapulco)',
      'Costera Miguel Alemán y Zona Diamante',
      'Carretera 200 (Costa Grande y Costa Chica)',
      'Bulevar Vicente Guerrero (acceso norte)',
    ],
    faq: [
      {
        q: '¿Es seguro mandar unidades de suministro a Acapulco?',
        a: 'La Autopista del Sol tiene vigilancia reforzada pero Guerrero mantiene focos de riesgo; el estándar es viajar con GPS con botón de pánico y geocerca de ruta. SilentEye agrega la alerta a red cercana en menos de 3 segundos con ubicación exacta.',
      },
      {
        q: '¿Sirve para las flotas de construcción de la reconstrucción?',
        a: 'Sí: control de maquinaria y camiones por geocerca de obra, alertas de uso fuera de horario, historial por unidad y reportes PDF para el residente de obra. Compatible con GPS de bajo costo (Cobán, Sinotrack) instalados en volteos y camionetas.',
      },
    ],
  },
];

export function getCityBySlug(slug: string): CityInfo | undefined {
  return cities.find((c) => c.slug === slug);
}

export function getCitiesByState(stateSlug: string): CityInfo[] {
  return cities.filter((c) => c.stateSlug === stateSlug);
}

/** Orden fijo de regiones para el hub /rastreo-gps. */
export const regionOrder: Region[] = [
  'Centro',
  'Bajío y Occidente',
  'Noreste',
  'Norte',
  'Noroeste',
  'Golfo y Sureste',
  'Sur',
];

export function getCitiesByRegion(region: Region): CityInfo[] {
  return cities.filter((c) => c.region === region);
}
