import {
  formatearMXN,
  pesosACentavos,
  type ActividadSlug,
  type Centavos,
  type MedioPago,
  type NivelConfianza,
} from '@leyantilavado/types';
import { datos } from '@leyantilavado/rules-engine';

/**
 * Intérprete de consultas en lenguaje natural.
 *
 * No hay modelo de lenguaje detrás: son reglas léxicas deterministas sobre
 * español de México. La misma frase produce siempre el mismo resultado, y el
 * resultado dice en qué se basó para que el usuario pueda corregirlo.
 *
 * Tres reglas que no se rompen:
 *  1. Ningún número legal vive aquí. El intérprete sólo lee la frase; los
 *     umbrales los pone el motor.
 *  2. El dinero sale en centavos enteros, sin pasar por punto flotante.
 *  3. Nunca se llama al reloj. La fecha de referencia entra como parámetro.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Resultado
 * ────────────────────────────────────────────────────────────────────────── */

export interface ActividadCandidata {
  slug: ActividadSlug;
  nombre: string;
  nombreCorto: string;
  fraccion: string;
}

export interface Interpretacion {
  /** La frase tal cual la escribió el usuario. */
  frase: string;
  monto: Centavos | null;
  /** El trozo de texto del que salió el monto: "180 mil". */
  montoTexto: string | null;
  medioPago: MedioPago | null;
  /** null cuando no hay una sola actividad clara. Nunca se adivina. */
  actividad: ActividadSlug | null;
  /** Fecha ISO que se usará para evaluar. */
  fecha: string;
  /** true si la fecha salió de la frase; false si es la de referencia. */
  fechaEnLaFrase: boolean;
  /**
   * Actividades entre las que hay que elegir. Trae las empatadas cuando la
   * frase apunta a varias, y el catálogo completo cuando no apunta a ninguna.
   */
  candidatas: readonly ActividadCandidata[];
  confianza: NivelConfianza;
  /** Lo que se entendió, en palabras. La UI está obligada a mostrarlo. */
  entendido: readonly string[];
  /** Lo que no se entendió y hay que capturar a mano. */
  noEntendido: readonly string[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Normalización
 * ────────────────────────────────────────────────────────────────────────── */

/** Minúsculas y sin acentos: "Joyería" y "joyeria" son la misma palabra. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const esLetraODigito = (c: string | undefined): boolean => c !== undefined && /[a-z0-9]/.test(c);

/* ────────────────────────────────────────────────────────────────────────────
 * Fecha
 * ────────────────────────────────────────────────────────────────────────── */

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const dosDigitos = (n: number): string => String(n).padStart(2, '0');

/** Verifica que el día exista en ese mes: el 31 de febrero no es una fecha. */
function armarFecha(anio: number, mes: number, dia: number): string | null {
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  if (d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
  return `${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}`;
}

interface Hallazgo<T> {
  valor: T;
  inicio: number;
  fin: number;
}

/** Fecha explícita: ISO, dd/mm/aaaa o "20 de junio de 2026". */
function detectarFecha(texto: string): Hallazgo<string> | null {
  const iso = /\b(\d{4})-(\d{2})-(\d{2})\b/.exec(texto);
  if (iso) {
    const f = armarFecha(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    if (f) return { valor: f, inicio: iso.index, fin: iso.index + iso[0].length };
  }

  const barras = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/.exec(texto);
  if (barras) {
    const f = armarFecha(Number(barras[3]), Number(barras[2]), Number(barras[1]));
    if (f) return { valor: f, inicio: barras.index, fin: barras.index + barras[0].length };
  }

  const larga = new RegExp(`\\b(\\d{1,2})\\s+de\\s+(${MESES.join('|')})\\s+(?:de[l]?\\s+)?(\\d{4})\\b`).exec(
    texto,
  );
  if (larga) {
    const f = armarFecha(Number(larga[3]), MESES.indexOf(larga[2] ?? '') + 1, Number(larga[1]));
    if (f) return { valor: f, inicio: larga.index, fin: larga.index + larga[0].length };
  }

  return null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Monto
 *
 * Se evita el punto flotante por completo: el multiplicador ("mil",
 * "millones") se aplica corriendo el punto decimal sobre la cadena, y la
 * cadena resultante entra a `pesosACentavos`, que es aritmética entera.
 * ────────────────────────────────────────────────────────────────────────── */

/** Palabras que valen un número. Sólo cuentan si traen multiplicador detrás. */
const PALABRAS_NUMERO: Record<string, string> = {
  medio: '0.5',
  media: '0.5',
  un: '1',
  uno: '1',
  una: '1',
  dos: '2',
  tres: '3',
  cuatro: '4',
  cinco: '5',
  seis: '6',
  siete: '7',
  ocho: '8',
  nueve: '9',
  diez: '10',
  quince: '15',
  veinte: '20',
  treinta: '30',
  cuarenta: '40',
  cincuenta: '50',
  cien: '100',
  ciento: '100',
  doscientos: '200',
  trescientos: '300',
  cuatrocientos: '400',
  quinientos: '500',
  seiscientos: '600',
  setecientos: '700',
  ochocientos: '800',
  novecientos: '900',
};

const MULTIPLICADORES: Record<string, number> = {
  mil: 3,
  millon: 6,
  millones: 6,
  mdp: 6,
};

/** Corre el punto decimal `ceros` posiciones a la derecha, sin flotantes. */
export function escalarDecimal(numero: string, ceros: number): string {
  const [entero = '0', decimal = ''] = numero.split('.');
  if (ceros === 0) return decimal ? `${entero}.${decimal}` : entero;
  if (decimal.length <= ceros) return entero + decimal + '0'.repeat(ceros - decimal.length);
  return `${entero}${decimal.slice(0, ceros)}.${decimal.slice(ceros)}`;
}

// Las palabras van de mayor a menor longitud para que "ciento" gane a "cien".
const PALABRAS_ORDENADAS = Object.keys(PALABRAS_NUMERO).sort((a, b) => b.length - a.length);

const RE_MONTO = new RegExp(
  '(\\$\\s*)?' +
    // 180,000.50 | 180000 | 2.5 | quinientos
    `\\b(\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?|${PALABRAS_ORDENADAS.join('|')})\\b` +
    '\\s*(millones|millon|mil|mdp)?' +
    '(\\s+y\\s+medio)?',
  'g',
);

interface CandidatoMonto {
  centavos: Centavos;
  texto: string;
  peso: number;
}

function leerMonto(texto: string): Hallazgo<CandidatoMonto> | null {
  const candidatos: Hallazgo<CandidatoMonto>[] = [];

  for (const m of texto.matchAll(RE_MONTO)) {
    const simbolo = m[1];
    const base = m[2] ?? '';
    const multiplicador = m[3];
    const yMedio = m[4] !== undefined;
    const inicio = m.index;
    const fin = inicio + m[0].length;

    const esPalabra = base in PALABRAS_NUMERO;
    // "un reloj" no es un monto de un peso: una palabra sólo cuenta como
    // número cuando trae "mil" o "millones" detrás.
    if (esPalabra && !multiplicador) continue;

    const crudo = esPalabra ? (PALABRAS_NUMERO[base] as string) : base.replace(/,/g, '');
    const ceros = multiplicador ? (MULTIPLICADORES[multiplicador] as number) : 0;

    // Un año suelto no es dinero: "vendí en 2026" no son 2,026 pesos.
    const pareceAnio =
      !simbolo && !multiplicador && /^\d{4}$/.test(crudo) && Number(crudo) >= 1900 && Number(crudo) <= 2100;
    if (pareceAnio) continue;

    let centavos = pesosACentavos(escalarDecimal(crudo, ceros));
    if (yMedio) {
      centavos = (centavos + pesosACentavos(escalarDecimal('0.5', ceros))) as Centavos;
    }

    const siguiente = texto.slice(fin, fin + 12);
    const conMoneda = simbolo !== undefined || /^\s*(pesos|mxn|mn\b)/.test(siguiente);
    candidatos.push({
      valor: {
        centavos,
        texto: texto.slice(inicio, fin).trim(),
        peso: conMoneda || multiplicador ? 2 : 1,
      },
      inicio,
      fin,
    });
  }

  if (candidatos.length === 0) return null;
  // Gana el que más parece dinero; entre iguales, el mayor: en "2 relojes de
  // 180 mil" el monto es 180 mil, no 2.
  return candidatos.sort(
    (a, b) => b.valor.peso - a.valor.peso || b.valor.centavos - a.valor.centavos,
  )[0] as Hallazgo<CandidatoMonto>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Medio de pago
 * ────────────────────────────────────────────────────────────────────────── */

const MEDIOS: { medio: MedioPago; claves: string[] }[] = [
  { medio: 'efectivo', claves: ['efectivo', 'en billetes', 'cash'] },
  {
    medio: 'transferencia',
    claves: ['transferencia', 'transferencias', 'transferido', 'transfirio', 'spei', 'deposito bancario'],
  },
  { medio: 'cheque', claves: ['cheque', 'cheques'] },
  { medio: 'tarjeta', claves: ['tarjeta de credito', 'tarjeta de debito', 'con tarjeta', 'terminal bancaria'] },
];

function detectarMedio(texto: string): MedioPago | null {
  if (/\bmixto\b|\bparte en efectivo\b|\bmitad en efectivo\b/.test(texto)) return 'mixto';

  const encontrados = MEDIOS.filter((m) => m.claves.some((c) => contiene(texto, c))).map((m) => m.medio);
  if (encontrados.length === 0) return null;
  // Dos formas de pago en la misma frase es exactamente lo que la ley llama
  // operación mixta; elegir una de las dos sería inventar.
  if (encontrados.length > 1) return 'mixto';
  return encontrados[0] as MedioPago;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Actividad
 *
 * El diccionario sale de leer el catálogo real: nombres, descripciones y
 * `ejemplosSujetos` de `datos.ACTIVIDADES`. Es vocabulario de la calle
 * apuntando al slug del catálogo, no una segunda fuente de derecho: aquí no
 * hay un solo umbral ni una sola fracción escrita a mano.
 *
 * Las dos actividades sin umbral confirmado (servidores públicos con fe
 * pública y personas facilitadoras) no tienen palabras clave a propósito: no
 * se enruta a nadie hacia una regla que no podemos publicar.
 * ────────────────────────────────────────────────────────────────────────── */

const SINONIMOS: Partial<Record<ActividadSlug, string[]>> = {
  'juegos-sorteos': [
    'casino',
    'casa de apuestas',
    'apuesta',
    'apuestas',
    'sorteo',
    'rifa',
    'loteria',
    'boleto',
    'concurso con premio',
    'pago de premio',
    'maquina tragamonedas',
  ],
  'tarjetas-credito-servicios': [
    'emision de tarjetas',
    'tarjeta departamental',
    'tarjeta de la tienda',
    'tarjeta de servicios',
    'credito al consumo',
  ],
  'tarjetas-prepagadas': ['tarjeta prepagada', 'prepagada', 'tarjeta de regalo', 'gift card', 'valor almacenado'],
  'vales-cupones-monederos': ['vale', 'vales', 'cupon', 'monedero electronico', 'monedero', 'vales de despensa'],
  'cheques-viajero': ['cheque de viajero', 'cheques de viajero'],
  'prestamos-creditos': [
    'prestamo',
    'preste',
    'mutuo',
    'casa de empeno',
    'empeno',
    'financiamiento',
    'credito que otorgue',
    'presto dinero',
  ],
  'inmuebles-construccion-intermediacion': [
    'casa',
    'departamento',
    'terreno',
    'inmueble',
    'bienes raices',
    'inmobiliaria',
    'propiedad',
    'local comercial',
    'bodega',
    'construccion',
    'constructora',
    'intermediacion inmobiliaria',
  ],
  'desarrollo-inmobiliario': [
    'preventa',
    'desarrollo inmobiliario',
    'coinversion',
    'aportacion para obra',
    'aportaciones de inversionistas',
  ],
  'metales-joyeria': [
    'joya',
    'joyeria',
    'reloj',
    'oro',
    'plata',
    'platino',
    'diamante',
    'piedra preciosa',
    'piedras preciosas',
    'lingote',
    'metal precioso',
    'metales preciosos',
  ],
  'obras-arte': ['obra de arte', 'obras de arte', 'cuadro', 'pintura', 'escultura', 'galeria', 'subasta de arte'],
  vehiculos: [
    'coche',
    'carro',
    'auto',
    'automovil',
    'vehiculo',
    'camioneta',
    'motocicleta',
    'moto',
    'camion',
    'agencia automotriz',
    'lote de autos',
    'lancha',
    'yate',
    'embarcacion',
    'avioneta',
    'aeronave',
  ],
  blindaje: ['blindaje', 'blindado', 'blindar', 'blindada'],
  'traslado-custodia-valores': [
    'traslado de valores',
    'transporte de valores',
    'custodia de valores',
    'custodia de dinero',
    'boveda',
  ],
  'servicios-profesionales': [
    'contador',
    'abogado',
    'despacho contable',
    'fiscalista',
    'consultor',
    'a nombre del cliente',
    'en representacion del cliente',
  ],
  'fe-publica-notarios': ['notario', 'notaria', 'escritura', 'escrituracion', 'protocolizar', 'fe publica'],
  'fe-publica-corredores': ['corredor publico', 'correduria', 'avaluo'],
  donativos: ['donativo', 'donacion', 'asociacion civil', 'fundacion', 'donante'],
  'comercio-exterior': [
    'agente aduanal',
    'apoderado aduanal',
    'aduana',
    'pedimento',
    'importacion',
    'exportacion',
    'importe mercancia',
  ],
  'arrendamiento-inmuebles': [
    'renta',
    'rento',
    'rente',
    'rentar',
    'arrendamiento',
    'arrendador',
    'arriendo',
    'inquilino',
    'alquiler',
  ],
  'activos-virtuales': [
    'bitcoin',
    'criptomoneda',
    'cripto',
    'activo virtual',
    'activos virtuales',
    'usdt',
    'exchange',
    'ethereum',
  ],
};

interface EntradaSinonimo {
  slug: ActividadSlug;
  clave: string;
}

// De más larga a más corta para que "casa de empeño" gane a "casa" y "casa de
// apuestas" no acabe clasificada como venta de inmuebles.
const ENTRADAS: EntradaSinonimo[] = Object.entries(SINONIMOS)
  .flatMap(([slug, claves]) => (claves ?? []).map((clave) => ({ slug: slug as ActividadSlug, clave })))
  .sort((a, b) => b.clave.length - a.clave.length);

/** ¿Aparece `clave` como palabra completa (admitiendo plural) en `texto`? */
function contiene(texto: string, clave: string): boolean {
  return posicionesDe(texto, clave, []).length > 0;
}

/** Posiciones de `clave` que no pisan un tramo ya consumido por otra clave. */
function posicionesDe(texto: string, clave: string, ocupados: [number, number][]): [number, number][] {
  const salida: [number, number][] = [];
  let desde = 0;
  for (;;) {
    const i = texto.indexOf(clave, desde);
    if (i === -1) break;
    desde = i + clave.length;
    let fin = desde;
    // Plural: "relojes", "casas", "joyas".
    if (texto.startsWith('es', fin)) fin += 2;
    else if (texto.startsWith('s', fin)) fin += 1;
    if (esLetraODigito(texto[i - 1]) || esLetraODigito(texto[fin])) continue;
    if (ocupados.some(([a, b]) => i < b && fin > a)) continue;
    salida.push([i, fin]);
  }
  return salida;
}

const CANDIDATA = (slug: ActividadSlug): ActividadCandidata => {
  const a = datos.ACTIVIDADES_POR_SLUG[slug];
  return { slug, nombre: a.nombre, nombreCorto: a.nombreCorto, fraccion: a.fraccion };
};

const TODAS_CANDIDATAS: readonly ActividadCandidata[] = datos.ACTIVIDADES_PUBLICABLES.map((a) =>
  CANDIDATA(a.slug),
);

interface ResultadoActividad {
  slug: ActividadSlug | null;
  candidatas: readonly ActividadCandidata[];
  /** Las palabras de la frase que llevaron a esa actividad. */
  pistas: string[];
}

function detectarActividad(texto: string): ResultadoActividad {
  const ocupados: [number, number][] = [];
  const golpes = new Map<ActividadSlug, string[]>();

  for (const { slug, clave } of ENTRADAS) {
    const posiciones = posicionesDe(texto, clave, ocupados);
    if (posiciones.length === 0) continue;
    ocupados.push(...posiciones);
    golpes.set(slug, [...(golpes.get(slug) ?? []), clave]);
  }

  if (golpes.size === 0) return { slug: null, candidatas: TODAS_CANDIDATAS, pistas: [] };

  const ordenados = [...golpes.entries()].sort((a, b) => b[1].length - a[1].length);
  const mejor = ordenados[0] as [ActividadSlug, string[]];
  const empatados = ordenados.filter(([, claves]) => claves.length === mejor[1].length);

  // Empate = la frase apunta a dos actividades distintas. Preguntar es mejor
  // que acertar por casualidad: un "vendí una casa y un coche" no se resuelve
  // eligiendo la primera.
  if (empatados.length > 1) {
    return {
      slug: null,
      candidatas: empatados.map(([slug]) => CANDIDATA(slug)),
      pistas: empatados.flatMap(([, claves]) => claves),
    };
  }

  return { slug: mejor[0], candidatas: [CANDIDATA(mejor[0])], pistas: mejor[1] };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Intérprete
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Lee una frase y devuelve lo entendido, lo no entendido y la confianza.
 *
 * `fechaReferencia` es la fecha ISO que se usa cuando la frase no trae una.
 * Entra como parámetro para que la función sea pura: la misma frase con la
 * misma fecha da siempre el mismo resultado.
 */
export function interpretar(frase: string, fechaReferencia: string): Interpretacion {
  const texto = normalizar(frase);

  const fechaHallada = detectarFecha(texto);
  // Se recorta la fecha antes de buscar dinero para que el año no se lea como
  // monto en "el 20 de junio de 2026".
  const sinFecha = fechaHallada
    ? texto.slice(0, fechaHallada.inicio) + ' '.repeat(fechaHallada.fin - fechaHallada.inicio) + texto.slice(fechaHallada.fin)
    : texto;

  const monto = leerMonto(sinFecha);
  const medioPago = detectarMedio(texto);
  const actividad = detectarActividad(texto);

  const entendido: string[] = [];
  const noEntendido: string[] = [];

  if (monto) {
    entendido.push(`Monto: ${formatearMXN(monto.valor.centavos)} (leí «${monto.valor.texto}»)`);
  } else {
    noEntendido.push('No encontré un monto. Escríbelo con cifras («180,000») o con palabras («180 mil»).');
  }

  if (actividad.slug) {
    const c = CANDIDATA(actividad.slug);
    entendido.push(
      `Actividad: ${c.nombre} (fracción ${c.fraccion}), por «${actividad.pistas.join('», «')}»`,
    );
  } else if (actividad.candidatas.length > 1 && actividad.pistas.length > 0) {
    noEntendido.push(
      `La frase apunta a más de una actividad («${actividad.pistas.join('», «')}»). Elige cuál aplica.`,
    );
  } else {
    noEntendido.push('No reconocí la actividad vulnerable. Elígela de la lista.');
  }

  if (medioPago) {
    entendido.push(`Medio de pago: ${ETIQUETA_MEDIO[medioPago]}`);
  } else {
    noEntendido.push(
      'No dijiste cómo se pagó. No cambia el umbral de aviso, pero sí la revisión del límite de efectivo del artículo 32.',
    );
  }

  const fecha = fechaHallada?.valor ?? fechaReferencia;
  entendido.push(
    fechaHallada
      ? `Fecha de la operación: ${fecha}, tomada de la frase`
      : `Fecha de la operación: ${fecha}. La frase no traía fecha, así que se usó ésa; cámbiala si el acto fue otro día, porque determina la UMA y la regla vigentes.`,
  );

  return {
    frase,
    monto: monto?.valor.centavos ?? null,
    montoTexto: monto?.valor.texto ?? null,
    medioPago,
    actividad: actividad.slug,
    fecha,
    fechaEnLaFrase: fechaHallada !== null,
    candidatas: actividad.slug ? [] : actividad.candidatas,
    confianza: derivarConfianza(actividad.slug !== null, monto !== null, medioPago !== null),
    entendido,
    noEntendido,
  };
}

/**
 * Frases de ejemplo que ofrece la herramienta.
 *
 * Viven aquí y no en el componente porque la prueba las verifica: un ejemplo
 * que el intérprete no entiende es la peor primera impresión posible.
 */
export const FRASES_EJEMPLO = [
  'Vendí un reloj de 180 mil en efectivo',
  'Vendí una camioneta en 690 mil por transferencia',
  'Renté un local en 60 mil al mes',
  'Presté un millón y medio con un contrato de mutuo',
] as const;

export const ETIQUETA_MEDIO: Record<MedioPago, string> = {
  efectivo: 'efectivo',
  transferencia: 'transferencia electrónica',
  cheque: 'cheque',
  tarjeta: 'tarjeta',
  metales_preciosos: 'metales o piedras preciosas',
  activos_virtuales: 'activos virtuales',
  mixto: 'combinación de medios',
  otro: 'otro',
};

/**
 * Confianza de la LECTURA de la frase, no del resultado jurídico: ésa la pone
 * el motor aparte. Sin actividad o sin monto no hay nada que evaluar.
 */
function derivarConfianza(hayActividad: boolean, hayMonto: boolean, hayMedio: boolean): NivelConfianza {
  if (!hayActividad || !hayMonto) return 'baja';
  return hayMedio ? 'alta' : 'media';
}
