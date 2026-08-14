import type { Actividad, Procedencia } from '@leyantilavado/types';
import { ULTIMA_MODIFICACION, ULTIMA_REVISION } from './revision';

const P = (disposicion: string, revisar = false): Procedencia => ({
  fuentes: ['lfpiorpi-vigente', 'sat-umbrales'],
  disposicion,
  verificacion: revisar ? 'no_verificado' : 'oficial_verificado',
  ultimaRevision: ULTIMA_REVISION,
  ultimaModificacion: ULTIMA_MODIFICACION,
  notaEditorial: revisar
    ? 'La ley enuncia este apartado sin fijar umbrales y la tabla del SAT no lo incluye. No debe publicarse un umbral sin confirmación.'
    : 'Contrastado contra la tabla oficial de umbrales del SAT y el texto vigente de la LFPIORPI (última reforma DOF 16-07-2025).',
});

/**
 * Actividades vulnerables del art. 17 LFPIORPI, texto vigente tras la reforma
 * publicada en el DOF el 16 de julio de 2025.
 *
 * Las descripciones son RESÚMENES PROPIOS, no transcripciones del texto legal.
 * El número de fracción vive aquí como dato: la reforma de 2025 adicionó la
 * fracción V Bis y el apartado XII-D, y esa renumeración se absorbe en este
 * archivo sin tocar el motor ni la UI.
 */
export const ACTIVIDADES: readonly Actividad[] = [
  {
    slug: 'juegos-sorteos',
    fraccion: 'I',
    nombre: 'Juegos con apuesta, concursos y sorteos',
    nombreCorto: 'Juegos y sorteos',
    descripcion:
      'Venta de boletos, fichas o cualquier comprobante para participar en juegos con apuesta, concursos o sorteos, así como el pago de premios. Aplica a organismos descentralizados y a quienes operan con permiso de la Secretaría de Gobernación.',
    ejemplosSujetos: [
      'Casinos y salas de sorteo de números',
      'Operadores de loterías y rifas con permiso',
      'Plataformas de apuestas en línea con permiso vigente',
      'Empresas que organizan concursos con premio en efectivo',
    ],
    procedencia: P('Art. 17, fracción I'),
  },
  {
    slug: 'tarjetas-credito-servicios',
    fraccion: 'II inciso a)',
    nombre: 'Emisión o comercialización de tarjetas de crédito o de servicios',
    nombreCorto: 'Tarjetas de crédito y servicios',
    descripcion:
      'Emisión o comercialización habitual o profesional de tarjetas de crédito o de servicios por quien no es una entidad financiera. El umbral se mide sobre el gasto mensual acumulado en la cuenta, no por compra.',
    ejemplosSujetos: [
      'Tiendas departamentales con tarjeta propia',
      'Cadenas con programas de crédito al consumo',
      'Emisores de tarjetas de servicios no bancarias',
    ],
    procedencia: P('Art. 17, fracción II, inciso a)'),
  },
  {
    slug: 'tarjetas-prepagadas',
    fraccion: 'II inciso b)',
    nombre: 'Emisión o comercialización de tarjetas prepagadas',
    nombreCorto: 'Tarjetas prepagadas',
    descripcion:
      'Emisión, comercialización o abono de recursos en tarjetas prepagadas por quien no es entidad financiera. El umbral de identificación y el de aviso coinciden: toda operación que obliga a identificar también obliga a avisar.',
    ejemplosSujetos: [
      'Comercializadores de tarjetas de regalo con valor almacenado',
      'Emisores de tarjetas prepagadas de uso general',
    ],
    procedencia: P('Art. 17, fracción II, inciso b)'),
  },
  {
    slug: 'vales-cupones-monederos',
    fraccion: 'II inciso c)',
    nombre: 'Vales, cupones, monederos electrónicos y certificados',
    nombreCorto: 'Vales y monederos',
    descripcion:
      'Emisión, comercialización o abono de recursos en instrumentos de almacenamiento de valor monetario distintos a las tarjetas: vales, cupones, monederos electrónicos y certificados.',
    ejemplosSujetos: [
      'Emisores de monederos electrónicos de despensa',
      'Empresas de vales de gasolina o restaurante',
      'Operadores de certificados de valor monetario',
    ],
    procedencia: P('Art. 17, fracción II, inciso c)'),
  },
  {
    slug: 'cheques-viajero',
    fraccion: 'III',
    nombre: 'Emisión y comercialización de cheques de viajero',
    nombreCorto: 'Cheques de viajero',
    descripcion:
      'Emisión y comercialización habitual o profesional de cheques de viajero por quien no es entidad financiera. Se identifica siempre, sin importar el monto.',
    ejemplosSujetos: ['Casas de cambio no financieras', 'Agencias de viaje que emiten cheques de viajero'],
    procedencia: P('Art. 17, fracción III'),
  },
  {
    slug: 'prestamos-creditos',
    fraccion: 'IV',
    nombre: 'Préstamos, créditos y mutuos sin ser entidad financiera',
    nombreCorto: 'Préstamos y créditos',
    descripcion:
      'Ofrecimiento habitual o profesional de operaciones de mutuo, garantía, préstamo o crédito, con o sin garantía, por parte de quien no es una entidad financiera.',
    ejemplosSujetos: [
      'Casas de empeño',
      'Financieras y prestamistas no regulados por la CNBV',
      'Empresas que otorgan crédito de forma habitual a terceros',
    ],
    procedencia: P('Art. 17, fracción IV'),
  },
  {
    slug: 'inmuebles-construccion-intermediacion',
    fraccion: 'V',
    nombre: 'Construcción, desarrollo e intermediación inmobiliaria',
    nombreCorto: 'Inmobiliaria',
    descripcion:
      'Prestación habitual o profesional de servicios de construcción o desarrollo de inmuebles, o de intermediación en la transmisión de la propiedad o constitución de derechos sobre inmuebles, cuando hay operaciones de compraventa a favor de un cliente.',
    ejemplosSujetos: [
      'Inmobiliarias y brókers de bienes raíces',
      'Constructoras que venden directamente al público',
      'Plataformas de intermediación inmobiliaria',
    ],
    procedencia: P('Art. 17, fracción V'),
  },
  {
    slug: 'desarrollo-inmobiliario',
    fraccion: 'V Bis',
    nombre: 'Recepción de recursos destinados a desarrollo inmobiliario',
    nombreCorto: 'Desarrollo inmobiliario',
    descripcion:
      'Recepción de recursos destinados a un desarrollo inmobiliario cuya finalidad sea su venta o renta. Es la fracción más nueva de la ley: se adicionó por decreto publicado el 16 de julio de 2025 y alcanza esquemas de preventa y coinversión que antes no estaban nombrados.',
    ejemplosSujetos: [
      'Desarrolladoras que reciben aportaciones para preventa',
      'Vehículos de coinversión inmobiliaria',
      'Promotores que captan recursos de inversionistas para obra',
    ],
    procedencia: P('Art. 17, fracción V Bis (adicionada DOF 16-07-2025)'),
  },
  {
    slug: 'metales-joyeria',
    fraccion: 'VI',
    nombre: 'Metales preciosos, piedras preciosas, joyería y relojes',
    nombreCorto: 'Metales y joyería',
    descripcion:
      'Comercialización o intermediación habitual o profesional de metales preciosos, piedras preciosas, joyas o relojes. Es objeto de aviso con independencia de la forma de pago.',
    ejemplosSujetos: ['Joyerías', 'Compraventa de oro y plata', 'Relojerías de alta gama', 'Casas de subasta de joyas'],
    procedencia: P('Art. 17, fracción VI'),
  },
  {
    slug: 'obras-arte',
    fraccion: 'VII',
    nombre: 'Subasta y comercialización de obras de arte',
    nombreCorto: 'Obras de arte',
    descripcion:
      'Subasta o comercialización habitual o profesional de obras de arte cuando la operación alcanza el monto previsto por la ley.',
    ejemplosSujetos: ['Galerías de arte', 'Casas de subasta', 'Marchantes y agentes de artistas'],
    procedencia: P('Art. 17, fracción VII'),
  },
  {
    slug: 'vehiculos',
    fraccion: 'VIII',
    nombre: 'Comercialización de vehículos terrestres, marítimos y aéreos',
    nombreCorto: 'Vehículos',
    descripcion:
      'Distribución y comercialización de todo tipo de vehículos, nuevos o usados, sean terrestres, marítimos o aéreos. Sólo es actividad vulnerable si se realiza de forma habitual o profesional.',
    ejemplosSujetos: ['Agencias automotrices', 'Lotes de autos usados', 'Vendedores de embarcaciones y aeronaves'],
    procedencia: P('Art. 17, fracción VIII'),
  },
  {
    slug: 'blindaje',
    fraccion: 'IX',
    nombre: 'Blindaje de vehículos e inmuebles',
    nombreCorto: 'Blindaje',
    descripcion:
      'Prestación habitual o profesional de servicios de blindaje de vehículos terrestres o de bienes inmuebles.',
    ejemplosSujetos: ['Talleres de blindaje automotriz', 'Empresas de blindaje arquitectónico'],
    procedencia: P('Art. 17, fracción IX'),
  },
  {
    slug: 'traslado-custodia-valores',
    fraccion: 'X',
    nombre: 'Traslado o custodia de dinero o valores',
    nombreCorto: 'Traslado de valores',
    descripcion:
      'Prestación habitual o profesional de servicios de traslado o custodia de dinero o valores. Cuando no es posible determinar el monto trasladado o custodiado, procede el aviso en todos los casos. Se exceptúa al Banco de México y a las instituciones de depósito de valores.',
    ejemplosSujetos: ['Empresas de transporte de valores', 'Servicios de custodia y bóveda'],
    procedencia: P('Art. 17, fracción X'),
  },
  {
    slug: 'servicios-profesionales',
    fraccion: 'XI',
    nombre: 'Servicios profesionales independientes',
    nombreCorto: 'Servicios profesionales',
    descripcion:
      'Prestación de servicios profesionales de manera independiente, sin relación laboral, cuando se preparan o realizan para un cliente ciertos actos. El aviso no depende de un monto: procede cuando el profesional realiza, en nombre y representación del cliente, la operación financiera relacionada con el acto. La ley preserva el secreto profesional y la garantía de defensa.',
    ejemplosSujetos: [
      'Contadores públicos independientes',
      'Abogados corporativos y fiscalistas',
      'Consultores que administran recursos de terceros',
    ],
    subtipos: [
      { slug: 'compraventa-inmuebles', nombre: 'Compraventa de inmuebles o cesión de derechos', descripcion: 'Preparación o realización de la compraventa de bienes inmuebles o la cesión de derechos sobre éstos.' },
      { slug: 'administracion-recursos', nombre: 'Administración y manejo de recursos y activos', descripcion: 'Administración y manejo de recursos, valores o cualquier otro activo del cliente.' },
      { slug: 'cuentas-bancarias', nombre: 'Manejo de cuentas bancarias, de ahorro o de valores', descripcion: 'Manejo de cuentas bancarias, de ahorro o de valores del cliente.' },
      { slug: 'aportaciones-capital', nombre: 'Organización de aportaciones de capital', descripcion: 'Organización de aportaciones de capital o recursos para la constitución, operación y administración de sociedades mercantiles.' },
      { slug: 'constitucion-personas-morales', nombre: 'Constitución y administración de personas morales', descripcion: 'Constitución, escisión, fusión, operación y administración de personas morales o vehículos corporativos, incluido el fideicomiso y la compraventa de entidades mercantiles.' },
    ],
    procedencia: P('Art. 17, fracción XI'),
  },
  {
    slug: 'fe-publica-notarios',
    fraccion: 'XII Apartado A',
    nombre: 'Fe pública: notarios públicos',
    nombreCorto: 'Notarios',
    descripcion:
      'Actos otorgados ante notario público. Cada inciso tiene su propia regla: unos tienen umbral en UMA y otros generan aviso siempre. La reforma de julio de 2025 endureció varios: el umbral de inmuebles bajó de 16,000 a 8,000 UMA, el de fideicomisos de 8,000 a 4,000, y la constitución de personas morales pasó de tener umbral a generar aviso siempre.',
    ejemplosSujetos: ['Notarías públicas'],
    subtipos: [
      { slug: 'inmuebles', nombre: 'Derechos reales sobre inmuebles', descripcion: 'Transmisión o constitución de derechos reales sobre inmuebles. La base es el valor más alto entre precio pactado, valor catastral, valor comercial o monto garantizado por suerte principal.' },
      { slug: 'poderes-irrevocables', nombre: 'Poderes irrevocables', descripcion: 'Otorgamiento de poderes para actos de administración o dominio con carácter irrevocable.' },
      { slug: 'constitucion-personas-morales', nombre: 'Constitución y modificación de personas morales', descripcion: 'Constitución de personas morales, modificación patrimonial por aumento o disminución de capital, fusión o escisión, y compraventa de acciones y partes sociales.' },
      { slug: 'fideicomisos', nombre: 'Fideicomisos traslativos o de garantía', descripcion: 'Constitución o modificación de fideicomisos traslativos de dominio o de garantía, salvo los constituidos a favor de instituciones del sistema financiero u organismos públicos de vivienda.' },
      { slug: 'mutuo-credito', nombre: 'Mutuos y créditos', descripcion: 'Otorgamiento de contratos de mutuo o crédito, con o sin garantía, cuando el acreedor no forma parte del sistema financiero ni es organismo público de vivienda.' },
    ],
    procedencia: P('Art. 17, fracción XII, Apartado A'),
  },
  {
    slug: 'fe-publica-corredores',
    fraccion: 'XII Apartado B',
    nombre: 'Fe pública: corredores públicos',
    nombreCorto: 'Corredores públicos',
    descripcion:
      'Actos en los que interviene un corredor público. Los avalúos tienen umbral en UMA; los actos corporativos, fideicomisos y mutuos mercantiles generan aviso sin importar el monto.',
    ejemplosSujetos: ['Corredurías públicas'],
    subtipos: [
      { slug: 'avaluos', nombre: 'Avalúos', descripcion: 'Realización de avalúos sobre bienes.' },
      { slug: 'constitucion-sociedades', nombre: 'Constitución y modificación de sociedades mercantiles', descripcion: 'Constitución de personas morales mercantiles, modificación patrimonial, fusión o escisión, y compraventa de acciones y partes sociales.' },
      { slug: 'fideicomisos', nombre: 'Fideicomisos', descripcion: 'Constitución, modificación o cesión de derechos de fideicomisos en los que puedan actuar, salvo los constituidos para garantizar crédito a favor del sistema financiero.' },
      { slug: 'mutuo-mercantil', nombre: 'Mutuos y créditos mercantiles', descripcion: 'Otorgamiento de contratos de mutuo mercantil o créditos mercantiles cuando el acreedor no forma parte del sistema financiero.' },
    ],
    procedencia: P('Art. 17, fracción XII, Apartado B'),
  },
  {
    slug: 'fe-publica-servidores-publicos',
    fraccion: 'XII Apartado C',
    nombre: 'Fe pública: servidores públicos',
    nombreCorto: 'Servidores públicos con fe pública',
    descripcion:
      'Servidores públicos a los que la ley confiere la facultad de dar fe pública en el ejercicio de sus atribuciones. La ley enuncia el apartado sin fijar umbrales propios y la tabla del SAT no lo desglosa.',
    ejemplosSujetos: ['Servidores públicos con facultad de dar fe pública conforme al art. 3, fracción VII, LFPIORPI'],
    procedencia: P('Art. 17, fracción XII, Apartado C', true),
  },
  {
    slug: 'personas-facilitadoras',
    fraccion: 'XII Apartado D',
    nombre: 'Personas facilitadoras públicas y privadas',
    nombreCorto: 'Personas facilitadoras',
    descripcion:
      'Apartado adicionado por la reforma publicada el 16 de julio de 2025. Alcanza a las personas facilitadoras previstas en la Ley General de Mecanismos Alternativos de Solución de Controversias y remite a los supuestos del Apartado A en los términos que la propia ley señala.',
    ejemplosSujetos: [
      'Personas facilitadoras públicas de centros de justicia alternativa',
      'Personas facilitadoras privadas certificadas',
    ],
    procedencia: P('Art. 17, fracción XII, Apartado D (adicionado DOF 16-07-2025)', true),
  },
  {
    slug: 'donativos',
    fraccion: 'XIII',
    nombre: 'Donativos recibidos por asociaciones y sociedades sin fines de lucro',
    nombreCorto: 'Donativos',
    descripcion:
      'Recepción de donativos por parte de asociaciones y sociedades sin fines de lucro, cuando alcanzan los montos previstos por la ley.',
    ejemplosSujetos: ['Asociaciones civiles', 'Fundaciones', 'Instituciones de asistencia privada'],
    procedencia: P('Art. 17, fracción XIII'),
  },
  {
    slug: 'comercio-exterior',
    fraccion: 'XIV',
    nombre: 'Comercio exterior: agentes y apoderados aduanales',
    nombreCorto: 'Comercio exterior',
    descripcion:
      'Prestación de servicios de comercio exterior respecto de mercancías que la ley enumera. Cuatro de los seis incisos generan aviso cualquiera que sea el valor de los bienes; sólo joyería y obras de arte tienen umbral, y se mide por el valor individual del bien, no por el pedimento completo.',
    ejemplosSujetos: ['Agencias aduanales', 'Apoderados aduanales', 'Agentes aduanales'],
    subtipos: [
      { slug: 'vehiculos', nombre: 'Vehículos terrestres, aéreos y marítimos', descripcion: 'Importación o exportación de vehículos, nuevos y usados, cualquiera que sea su valor.' },
      { slug: 'maquinas-juegos', nombre: 'Máquinas para juegos de apuesta y sorteos', descripcion: 'Máquinas para juego con apuesta y sorteos, nuevas y usadas, cualquiera que sea su valor.' },
      { slug: 'equipos-tarjetas-pago', nombre: 'Equipos y materiales para tarjetas de pago', descripcion: 'Equipos y materiales para la elaboración de tarjetas de pago, cualquiera que sea su valor.' },
      { slug: 'joyas-metales', nombre: 'Joyas, relojes, piedras y metales preciosos', descripcion: 'Importación o exportación de joyas, relojes, piedras preciosas y metales preciosos. El umbral se mide por el valor individual del bien.' },
      { slug: 'obras-arte', nombre: 'Obras de arte', descripcion: 'Importación o exportación de obras de arte. El umbral se mide por el valor individual del bien.' },
      { slug: 'material-balistico', nombre: 'Materiales de resistencia balística', descripcion: 'Materiales de resistencia balística para blindaje de vehículos, cualquiera que sea su valor.' },
    ],
    procedencia: P('Art. 17, fracción XIV'),
  },
  {
    slug: 'arrendamiento-inmuebles',
    fraccion: 'XV',
    nombre: 'Arrendamiento y derechos de uso o goce de inmuebles',
    nombreCorto: 'Arrendamiento',
    descripcion:
      'Constitución de derechos personales de uso o goce de bienes inmuebles. El umbral se mide sobre el valor mensual, al día en que se realiza el pago o se cumple la obligación. Ojo al matiz: la identificación aplica cuando la renta es superior a 1,605 UMA, y el aviso cuando es igual o superior a 3,210 UMA.',
    ejemplosSujetos: [
      'Arrendadores de locales comerciales y oficinas',
      'Administradoras de propiedades en renta',
      'Operadores de naves industriales',
      'Propietarios que rentan de forma habitual',
    ],
    procedencia: P('Art. 17, fracción XV'),
  },
  {
    slug: 'activos-virtuales',
    fraccion: 'XVI',
    nombre: 'Intercambio de activos virtuales',
    nombreCorto: 'Activos virtuales',
    descripcion:
      'Ofrecimiento habitual y profesional de intercambio de activos virtuales por sujetos distintos a las entidades financieras, a través de plataformas electrónicas. Alcanza también las operaciones realizadas con ciudadanos mexicanos desde otra jurisdicción. Tiene dos disparadores independientes: el monto de la operación y la contraprestación cobrada por el servicio.',
    ejemplosSujetos: [
      'Plataformas de intercambio de criptoactivos no reguladas como ITF',
      'Operadores de compraventa de activos virtuales',
      'Cajeros de criptomonedas',
    ],
    subtipos: [
      { slug: 'monto-operacion', nombre: 'Monto de la operación', descripcion: 'Monto de la operación de intercambio por cliente o usuario.' },
      { slug: 'contraprestacion', nombre: 'Contraprestación cobrada', descripcion: 'Contraprestación cobrada por el servicio, cualquiera que sea su denominación.' },
    ],
    procedencia: P('Art. 17, fracción XVI'),
  },
];

export const ACTIVIDADES_POR_SLUG = Object.fromEntries(
  ACTIVIDADES.map((a) => [a.slug, a]),
) as Record<Actividad['slug'], Actividad>;

/** Actividades listas para publicarse en el sitio público. */
export const ACTIVIDADES_PUBLICABLES = ACTIVIDADES.filter(
  (a) => a.procedencia.verificacion !== 'no_verificado',
);
