/**
 * Análisis: reformas propuestas, leídas en su texto oficial.
 *
 * ── Por qué existe esta sección, y su regla ────────────────────────────────
 *
 * Cuando se anuncia una reforma circulan cien resúmenes y casi ninguno cita el
 * artículo. Al preparar estos tres, dos fuentes secundarias se contradecían
 * entre sí —una ubicaba el RESICO en artículos que no existen en la ley
 * vigente; otra negaba el IVA del 7 % que los Criterios de Hacienda sí
 * anuncian— y la prensa vendía como «pagos digitales obligatorios» una
 * iniciativa cuyo artículo 11 dice «podrán».
 *
 * La regla, entonces, es la del resto del sitio: cada afirmación sale del
 * documento oficial y se cita por artículo; lo que es propuesta se dice que es
 * propuesta; y lo que el texto no resuelve se declara como pregunta abierta en
 * vez de rellenarse con una suposición.
 *
 * Las cifras fiscales viven aquí, una sola vez, con su fuente. No son del
 * corpus de la LFPIORPI —son de otra ley— y por eso no están en el motor.
 */

export interface Fuente {
  nombre: string;
  url: string;
  /** Qué parte del documento sostiene el análisis. */
  detalle: string;
}

export interface Analisis {
  slug: string;
  /** El H1: puede ser largo. */
  titulo: string;
  /** El del buscador: ≤ 60 caracteres, lo verifica `sitio.test.ts`. */
  tituloSEO: string;
  /** ≤ 160 caracteres. */
  descripcionSEO: string;
  publicadoEn: string;
  etiquetas: readonly {
    texto: string;
    tono?: 'neutro' | 'marino' | 'petroleo' | 'ambar' | 'rojo' | 'verde';
  }[];
  respuestaDirecta: string;
  entradilla: string;
  /** Los `id` tienen que coincidir con las `Seccion` del cuerpo. */
  indice: readonly { id: string; titulo: string }[];
  fuentes: readonly Fuente[];
  relacionados: readonly {
    titulo: string;
    enlaces: readonly { etiqueta: string; href: string; descripcion?: string }[];
  }[];
}

/* ── Fechas del proceso legislativo ───────────────────────────────────────── */

/**
 * Presentación: Gaceta Parlamentaria del 8 de septiembre de 2026.
 * Plazos de aprobación: Ley Federal de Presupuesto y Responsabilidad
 * Hacendaria, art. 42, fr. IV. Vigencia propuesta: artículo único transitorio
 * de la iniciativa que reforma la LISR.
 */
export const CALENDARIO_LEGISLATIVO = {
  presentacion: '2026-09-08',
  diputados: '2026-10-20',
  senado: '2026-10-31',
  vigorPropuesto: '2027-01-01',
} as const;

/* ── RESICO: vigente y propuesto ──────────────────────────────────────────── */

/**
 * Vigente: LISR, arts. 113-E, 113-F, 113-J y 206.
 * Propuesto: iniciativa que reforma la LISR (Gaceta, 8-sep-2026, Anexo E).
 *
 * Las tasas NO cambian: la exposición de motivos dice que la propuesta sólo
 * lleva a 5,000,000 el monto máximo al que aplica la tasa del 2.50 %.
 */
export const RESICO = {
  fisicas: { limiteVigente: 3_500_000, limitePropuesto: 5_000_000 },
  morales: { limiteVigente: 35_000_000, limitePropuesto: 50_000_000 },
  sectorPrimario: { vigente: 900_000, propuesta: 1_000_000 },
  /** Art. 113-J: la persona moral que paga retiene este porcentaje. */
  retencionMorales: 0.0125,
  /** Exposición de motivos de la iniciativa (Anexo E). */
  contribuyentes: 4_400_000,
  /** Exposición de motivos: de 206 mil empresas que sí pagan ISR, el 70 %… */
  empresasQuePaganIsr: 206_000,
  proporcionQuePagaMenos: 0.7,
  /** Tabla anual del art. 113-F vigente. */
  tablaAnual: [
    { hasta: 300_000, tasa: 0.01 },
    { hasta: 600_000, tasa: 0.011 },
    { hasta: 1_000_000, tasa: 0.015 },
    { hasta: 2_500_000, tasa: 0.02 },
    { hasta: 3_500_000, tasa: 0.025 },
  ],
  /** Art. 209, apartado A — muestra del «DICE / DEBE DECIR» de la iniciativa. */
  deduccionInversiones: [
    { concepto: 'Cargos diferidos', vigente: 0.05, propuesta: 0.1 },
    { concepto: 'Erogaciones en periodos preoperativos', vigente: 0.1, propuesta: 0.2 },
    { concepto: 'Regalías y asistencia técnica', vigente: 0.15, propuesta: 0.3 },
  ],
} as const;

/**
 * Tasa del RESICO para personas físicas según el ingreso anual.
 *
 * `null` significa fuera del régimen: con el límite vigente, cualquier
 * ingreso por encima de 3.5 millones; con el propuesto, por encima de 5. Entre
 * los dos, la propuesta aplica la tasa del último tramo, porque lo único que
 * hace es estirarlo. La tasa del tramo se aplica a TODO el ingreso.
 */
export function tasaResico(ingreso: number, limite: number): number | null {
  if (ingreso > limite) return null;
  for (const t of RESICO.tablaAnual) if (ingreso <= t.hasta) return t.tasa;
  return RESICO.tablaAnual[RESICO.tablaAnual.length - 1]!.tasa;
}

/* ── IVA opcional del 7 % (LIF 2027, art. 25, fr. XVIII) ──────────────────── */

/** Tasa de la opción. */
export const TASA_OPCIONAL = 7;
/** Tasa general del IVA (LIVA, art. 1o.). */
export const TASA_GENERAL = 16;
/**
 * Fracción del IVA que retiene una persona moral a una física por honorarios,
 * comisión o uso o goce de bienes (RLIVA, art. 3, fr. I).
 */
export const FRACCION_RETENCION = 2 / 3;

/**
 * Proporción compras / ventas (ambas sin IVA) en la que las dos mecánicas
 * cuestan lo mismo. Por debajo, la opción del 7 % es más barata.
 *
 *   tasa × (ventas − compras) = 7 × ventas   ⇒   compras / ventas = (tasa − 7) / tasa
 *
 * Con 16 % da 9/16 = 0.5625. Con 8 % da 1/8 = 0.125.
 */
export function puntoDeEquilibrio(tasa: number = TASA_GENERAL): number {
  return (tasa - TASA_OPCIONAL) / tasa;
}

/** IVA a cargo con la mecánica normal: trasladado menos acreditable. */
export function ivaNormal(ventas: number, compras: number, tasa: number = TASA_GENERAL): number {
  // Se multiplica antes de dividir para no arrastrar decimales binarios:
  // 0.16 × 90,000 da 14,400.000000000002; 16 × 90,000 / 100 da 14,400.
  return (tasa * (ventas - compras)) / 100;
}

/** IVA a cargo con la opción: 7 % de lo cobrado, sin acreditar nada. */
export function ivaOpcional(ventas: number): number {
  return (TASA_OPCIONAL * ventas) / 100;
}

/**
 * Cuánto excede lo retenido por una persona moral al 7 % que se pagaría con
 * la opción. Positivo significa que la retención ya supera el impuesto, y la
 * fracción XVIII no dice qué pasa con esa diferencia.
 */
export function excedenteRetencion(honorarios: number, tasa: number = TASA_GENERAL): number {
  return (FRACCION_RETENCION * tasa * honorarios) / 100 - ivaOpcional(honorarios);
}

/** Casos de la tabla del análisis. Ventas y compras mensuales, sin IVA. */
export const CASOS_IVA: readonly { perfil: string; ventas: number; compras: number }[] = [
  { perfil: 'Servicios con pocos insumos', ventas: 100_000, compras: 10_000 },
  { perfil: 'Servicio con insumos', ventas: 100_000, compras: 30_000 },
  { perfil: 'Punto de equilibrio', ventas: 100_000, compras: 100_000 * puntoDeEquilibrio() },
  { perfil: 'Reventa con margen corto', ventas: 100_000, compras: 70_000 },
];

/* ── Ley de Economía Digital (Anexo G) y repatriación (LIF, transitorio 23) ─ */

/** Encuesta Nacional de Inclusión Financiera 2024, citada en la exposición de motivos. */
export const ENIF = {
  efectivoFrecuente: { antes: 0.901, despues: 0.852 },
  transferenciasYApps: { antes: 0.016, despues: 0.044 },
  periodo: '2021 a 2024',
  anioAntes: 2021,
  anioDespues: 2024,
  montoCompra: 500,
} as const;

export const REPATRIACION = {
  tasa: 0.075,
  mantenidosHasta: '2026-09-08',
  retornarHasta: '2027-12-31',
  aniosInvertidos: 3,
  diasParaPagar: 15,
} as const;

/* ── Formato ──────────────────────────────────────────────────────────────── */

const MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});
const MXN_EXACTO = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const PCT = new Intl.NumberFormat('es-MX', { style: 'percent', maximumFractionDigits: 2 });
const PCT_TABLA = new Intl.NumberFormat('es-MX', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const pesos = (n: number) => MXN.format(n);
export const pesosExactos = (n: number) => MXN_EXACTO.format(n);
/**
 * `Intl` en es-MX escribe «30%» pegado; el resto del sitio escribe «7 %», con
 * espacio. Se normaliza a espacio de NO separación: además de coincidir, impide
 * que el número y su signo acaben en renglones distintos.
 */
const conEspacio = (s: string) => s.replace(/\s?%/, '\u00a0%');
export const porcentaje = (fraccion: number) => conEspacio(PCT.format(fraccion));
/** Con dos decimales fijos, como vienen en la tabla de la ley. */
export const tasaDeTabla = (fraccion: number) => conEspacio(PCT_TABLA.format(fraccion));
export const millones = (n: number) => `${(n / 1_000_000).toLocaleString('es-MX')} millones`;

/* ── Fuentes ──────────────────────────────────────────────────────────────── */

const GACETA = 'https://gaceta.diputados.gob.mx/PDF/66/2026/sep/20260908';

const F = {
  indiceGaceta: {
    nombre: 'Gaceta Parlamentaria, 8 de septiembre de 2026 — índice del Paquete Económico 2027',
    url: 'https://gaceta.diputados.gob.mx/Gaceta/66/2026/sep/20260908.html',
    detalle: 'Lista de las iniciativas presentadas, anexos A a N. Ninguna reforma la LFPIORPI.',
  },
  lisr2027: {
    nombre: 'Iniciativa que reforma la Ley del Impuesto sobre la Renta (Anexo E)',
    url: `${GACETA}-E.pdf`,
    detalle:
      'Límites de 5 y 50 millones, reingreso, régimen opcional para morales, art. 209 y vigencia del 1 de enero de 2027.',
  },
  lif2027: {
    nombre: 'Iniciativa de Ley de Ingresos de la Federación 2027 (Anexo A)',
    url: `${GACETA}-A.pdf`,
    detalle: 'Art. 25, fracción XVIII (IVA del 7 %) y transitorio vigésimo tercero (repatriación).',
  },
  cgpe2027: {
    nombre: 'Criterios Generales de Política Económica 2027 (Anexo C)',
    url: `${GACETA}-C.pdf`,
    detalle: 'Resumen oficial de las medidas para micro y pequeñas empresas.',
  },
  economiaDigital: {
    nombre: 'Iniciativa que expide la Ley de Economía Digital para Pagos Digitales y Electrónicos (Anexo G)',
    url: `${GACETA}-G.pdf`,
    detalle: 'Arts. 1 a 22 y transitorios. El PDF es escaneado: se leyó con reconocimiento de texto.',
  },
  lisr: {
    nombre: 'Ley del Impuesto sobre la Renta, texto vigente (Cámara de Diputados)',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf',
    detalle: 'Arts. 113-E a 113-J (personas físicas) y 206 a 215 (personas morales).',
  },
  liva: {
    nombre: 'Ley del Impuesto al Valor Agregado, texto vigente',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LIVA.pdf',
    detalle: 'Art. 1o. (el IVA no forma parte del valor) y art. 1o.-A (quién retiene).',
  },
  rliva: {
    nombre: 'Reglamento de la Ley del IVA',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LIVA_250914.pdf',
    detalle: 'Art. 3, fracción I: retención de dos terceras partes del IVA.',
  },
  lfprh: {
    nombre: 'Ley Federal de Presupuesto y Responsabilidad Hacendaria',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPRH.pdf',
    detalle: 'Art. 42, fr. IV: la Ley de Ingresos se aprueba a más tardar el 20 y el 31 de octubre.',
  },
  lfpiorpi: {
    nombre: 'Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPIORPI.pdf',
    detalle: 'Arts. 17 (actividades vulnerables) y 32 (límites de efectivo). Última reforma DOF 16-07-2025.',
  },
} satisfies Record<string, Fuente>;

/* ── Los análisis ─────────────────────────────────────────────────────────── */

const PUBLICADO = '2026-09-11';

const INICIATIVA = { texto: 'Iniciativa: todavía no es ley', tono: 'ambar' } as const;
const GACETA_8 = { texto: 'Gaceta Parlamentaria, 8 sep 2026', tono: 'marino' } as const;

export const ANALISIS: readonly Analisis[] = [
  {
    slug: 'resico-2027-paquete-economico',
    titulo: 'RESICO 2027: qué propone el Paquete Económico, con la ley en la mano',
    tituloSEO: 'RESICO 2027: los cambios que propone Hacienda',
    descripcionSEO:
      'Límite de 5 millones para personas físicas y 50 para morales, reingreso y régimen opcional. Qué dice la iniciativa, qué sigue igual y cuándo aplicaría.',
    publicadoEn: PUBLICADO,
    etiquetas: [INICIATIVA, GACETA_8, { texto: 'Vigor propuesto: 1 ene 2027', tono: 'neutro' }],
    respuestaDirecta:
      'Todavía es una propuesta. La iniciativa presentada el 8 de septiembre de 2026 sube el límite del RESICO de 3.5 a 5 millones de pesos para personas físicas y de 35 a 50 millones para personas morales, vuelve opcional el régimen para las morales, permite regresar a quien lo perdió por incumplir y deja las tasas igual, de 1 % a 2.5 %. Si el Congreso la aprueba, aplicaría desde el 1 de enero de 2027. No cambia nada de la Ley Antilavado.',
    entradilla:
      'Qué es el Régimen Simplificado de Confianza hoy, qué cambiaría con la reforma presentada al Congreso y qué no se mueve, citado artículo por artículo.',
    indice: [
      { id: 'estado', titulo: 'Primero: todavía es una propuesta' },
      { id: 'hoy', titulo: 'Cómo funciona el RESICO hoy' },
      { id: 'cambios', titulo: 'Qué cambiaría' },
      { id: 'igual', titulo: 'Lo que sigue igual' },
      { id: 'por-que', titulo: 'Por qué lo propone Hacienda' },
      { id: 'antilavado', titulo: 'Y la Ley Antilavado' },
    ],
    fuentes: [F.lisr2027, F.lisr, F.cgpe2027, F.lfprh, F.lfpiorpi, F.indiceGaceta],
    relacionados: [
      {
        titulo: 'Del mismo paquete',
        enlaces: [
          { etiqueta: 'El IVA del 7 % para RESICO', href: '/analisis/iva-7-por-ciento-resico' },
          { etiqueta: 'Ley de Economía Digital y efectivo', href: '/analisis/ley-economia-digital-efectivo' },
        ],
      },
      {
        titulo: 'Si además haces actividad vulnerable',
        enlaces: [
          { etiqueta: 'Descubre si la Ley Antilavado te aplica', href: '/herramientas/cuestionario' },
          { etiqueta: 'Arrendamiento: fracción XV', href: '/actividades-vulnerables/arrendamiento-inmuebles' },
        ],
      },
      {
        titulo: 'Efectivo',
        enlaces: [{ etiqueta: 'Límites de efectivo del art. 32', href: '/limites-efectivo' }],
      },
    ],
  },
  {
    slug: 'iva-7-por-ciento-resico',
    titulo: 'IVA del 7 % para RESICO: cómo funcionaría y cuándo te conviene, con la cuenta hecha',
    tituloSEO: 'IVA del 7 % para RESICO: cuándo conviene y cuándo no',
    descripcionSEO:
      'Propuesta de la Ley de Ingresos 2027: pagar IVA al 7 % sin acreditar. Conviene si tus compras con IVA son menos del 56.25 % de tus ventas.',
    publicadoEn: PUBLICADO,
    etiquetas: [INICIATIVA, { texto: 'LIF 2027, art. 25, fr. XVIII', tono: 'marino' }, { texto: 'Opcional y anual', tono: 'neutro' }],
    respuestaDirecta:
      'Es una opción que viene en la iniciativa de Ley de Ingresos 2027, no en la Ley del IVA: quien tribute en RESICO podría pagar cada mes el 7 % de lo que efectivamente cobró, en lugar de restar el IVA de sus compras. A tus clientes les sigues cobrando el IVA normal. Te conviene si tus compras con IVA pesan menos del 56.25 % de tus ventas; si pesan más, pagarías de más. Una vez elegida, no se cambia en el año. Todavía no es ley.',
    entradilla:
      'La mecánica exacta de la fracción XVIII, la cuenta para saber si te conviene y tres situaciones en las que la respuesta no es la que parece.',
    indice: [
      { id: 'que-dice', titulo: 'Qué dice exactamente' },
      { id: 'cuenta', titulo: 'La cuenta: cuándo te conviene' },
      { id: 'trampas', titulo: 'Tres casos para mirar dos veces' },
      { id: 'todo-el-ano', titulo: 'Se decide para todo el año' },
      { id: 'antilavado', titulo: '¿Y la Ley Antilavado?' },
    ],
    fuentes: [F.lif2027, F.cgpe2027, F.liva, F.rliva, F.lfprh, F.indiceGaceta],
    relacionados: [
      {
        titulo: 'Del mismo paquete',
        enlaces: [
          { etiqueta: 'RESICO 2027: qué propone', href: '/analisis/resico-2027-paquete-economico' },
          { etiqueta: 'Ley de Economía Digital y efectivo', href: '/analisis/ley-economia-digital-efectivo' },
        ],
      },
      {
        titulo: 'Efectivo',
        enlaces: [
          { etiqueta: 'Límites de efectivo del art. 32', href: '/limites-efectivo' },
          { etiqueta: 'Verificador de efectivo', href: '/herramientas/limites-efectivo' },
        ],
      },
      {
        titulo: 'Si además haces actividad vulnerable',
        enlaces: [{ etiqueta: 'Descubre si la Ley Antilavado te aplica', href: '/herramientas/cuestionario' }],
      },
    ],
  },
  {
    slug: 'ley-economia-digital-efectivo',
    titulo: 'Ley de Economía Digital: qué propone de verdad sobre el efectivo, y qué no cambia de la Ley Antilavado',
    tituloSEO: 'Ley de Economía Digital: lo que dice sobre el efectivo',
    descripcionSEO:
      'No prohíbe el efectivo: deja a Hacienda fijar sectores donde el pago digital sea la única vía. Y no toca los límites de la Ley Antilavado.',
    publicadoEn: PUBLICADO,
    etiquetas: [INICIATIVA, GACETA_8, { texto: 'No reforma la LFPIORPI', tono: 'verde' }],
    respuestaDirecta:
      'No prohíbe el efectivo en general ni fija un monto. La iniciativa dice que los negocios «podrán» aceptar pagos digitales y faculta a Hacienda para determinar sectores estratégicos y actividades relevantes en los que el pago digital podrá ser la única forma de pago; no nombra ninguno. No menciona la Ley Antilavado: los límites de efectivo del artículo 32 y las obligaciones de identificar y avisar siguen exactamente igual.',
    entradilla:
      'Lo que la iniciativa dice artículo por artículo, frente a lo que se ha publicado de ella, y cómo convive con las reglas de efectivo que ya existen.',
    indice: [
      { id: 'titulares', titulo: 'Titulares contra texto' },
      { id: 'articulo-13', titulo: 'El artículo que importa: el 13' },
      { id: 'no-trae', titulo: 'Lo que la iniciativa no trae' },
      { id: 'antilavado', titulo: 'Qué no cambia de la Ley Antilavado' },
      { id: 'repatriacion', titulo: 'Otra pieza del paquete: repatriar al 7.5 %' },
      { id: 'cifras', titulo: 'Las cifras detrás' },
    ],
    fuentes: [F.economiaDigital, F.lif2027, F.lfpiorpi, F.lfprh, F.indiceGaceta],
    relacionados: [
      {
        titulo: 'Efectivo',
        enlaces: [
          { etiqueta: 'Límites de efectivo del art. 32', href: '/limites-efectivo' },
          { etiqueta: 'Verificador de efectivo', href: '/herramientas/limites-efectivo' },
        ],
      },
      {
        titulo: 'Del mismo paquete',
        enlaces: [
          { etiqueta: 'RESICO 2027: qué propone', href: '/analisis/resico-2027-paquete-economico' },
          { etiqueta: 'El IVA del 7 % para RESICO', href: '/analisis/iva-7-por-ciento-resico' },
        ],
      },
      {
        titulo: 'Obligaciones que no dependen del medio de pago',
        enlaces: [
          { etiqueta: 'Umbrales de identificación y aviso', href: '/umbrales' },
          { etiqueta: 'Calculadora de umbrales', href: '/herramientas/calculadora-umbrales' },
        ],
      },
    ],
  },
];

export const ANALISIS_POR_SLUG: Readonly<Record<string, Analisis>> = Object.fromEntries(
  ANALISIS.map((a) => [a.slug, a]),
);

/** Fecha del análisis más reciente: la de la portada de la sección. */
export const ULTIMO_ANALISIS = ANALISIS.reduce(
  (max, a) => (a.publicadoEn > max ? a.publicadoEn : max),
  '',
);
