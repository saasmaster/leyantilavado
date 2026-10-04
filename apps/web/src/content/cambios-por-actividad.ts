import { datos } from '@leyantilavado/rules-engine';
import type { ActividadSlug } from '@leyantilavado/types';
import { BLOQUES_ACUERDO_115, CAMBIOS_ANTES_DESPUES, type BloqueAcuerdo } from './reforma';
import type { CambioReforma } from './tipos';

/* ────────────────────────────────────────────────────────────────────────────
 * A qué actividad le tocó cada cambio de la reforma.
 *
 * Este archivo NO documenta cambios: sólo reparte los que ya están documentados
 * en `./reforma.ts`. La distinción importa porque el motor no guarda historial:
 * los 22 supuestos de `UMBRALES` comparten `vigencia.desde: 2025-07-17` y
 * ninguno tiene un "antes". Fuera de las filas de `CAMBIOS_ANTES_DESPUES` no
 * existe el dato anterior, y este proyecto prefiere decir que falta antes que
 * deducirlo.
 *
 * Regla de reparto: un cambio se atribuye a una actividad sólo cuando el propio
 * texto del cambio y la disposición que cita lo sostienen. Cada entrada lleva
 * esa justificación escrita y se muestra en la página.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Actividades que el motor relaciona con alguna regla del art. 32.
 *
 * Se deriva de `REGLAS_EFECTIVO` en lugar de escribirse a mano porque los dos
 * cambios del art. 32 —metales preciosos como medio de pago prohibido y la
 * consignación— alcanzan al conjunto entero de supuestos de ese artículo, no a
 * una fracción concreta del 17.
 */
export const ACTIVIDADES_CON_LIMITE_EFECTIVO: readonly ActividadSlug[] = [
  ...new Set(datos.REGLAS_EFECTIVO.flatMap((r) => r.actividades)),
];

export interface AlcanceCambio {
  /** Clave de una fila de `CAMBIOS_ANTES_DESPUES`. */
  clave: string;
  /** `'todas'` cuando la disposición obliga a todo sujeto obligado. */
  actividades: readonly ActividadSlug[] | 'todas';
  /** Por qué ese alcance se sostiene leyendo el cambio y su disposición. */
  justificacion: string;
}

const ALCANCES: readonly AlcanceCambio[] = [
  {
    clave: 'notarios-inmuebles',
    actividades: ['fe-publica-notarios'],
    justificacion:
      'El cambio cita el art. 17, fracción XII, Apartado A, inciso a), que es un supuesto exclusivo del notario público.',
  },
  {
    clave: 'notarios-fideicomisos',
    actividades: ['fe-publica-notarios'],
    justificacion:
      'El cambio cita el art. 17, fracción XII, Apartado A, inciso d), inciso propio del Apartado A y por tanto sólo del notario.',
  },
  {
    clave: 'notarios-sociedades',
    actividades: ['fe-publica-notarios'],
    justificacion:
      'El cambio cita el art. 17, fracción XII, Apartado A, inciso c). El corredor público tiene su propio inciso equivalente en el Apartado B, y para ese apartado la reforma no documenta ningún antes.',
  },
  {
    clave: 'desarrollo-inmobiliario',
    actividades: ['desarrollo-inmobiliario'],
    justificacion:
      'La fracción V Bis adicionada es, ella misma, la actividad: antes de la reforma este supuesto no existía en el catálogo del art. 17.',
  },
  {
    clave: 'facilitadoras',
    actividades: ['personas-facilitadoras'],
    justificacion:
      'El Apartado D adicionado al art. 17, fracción XII, crea la actividad de las personas facilitadoras. No hay otra fracción a la que atribuirlo.',
  },
  {
    clave: 'efectivo-metales',
    actividades: ACTIVIDADES_CON_LIMITE_EFECTIVO,
    justificacion:
      'El cambio es al primer párrafo del art. 32, que encabeza todos los supuestos de la prohibición y no distingue entre ellos. Se atribuye a las actividades que el motor ya relaciona con una regla de efectivo.',
  },
  {
    clave: 'efectivo-consignacion',
    actividades: ACTIVIDADES_CON_LIMITE_EFECTIVO,
    justificacion:
      'La fracción VIII adicionada remite al umbral de la fracción con la que se relaciona la consignación, de modo que alcanza a los mismos supuestos que ya tienen límite de efectivo. El motor guarda esta regla con la lista de actividades vacía y marcada como discrepancia entre fuentes, así que aquí se muestra como cambio y no como límite calculable.',
  },
  {
    clave: 'obligaciones-nuevas',
    actividades: 'todas',
    justificacion:
      'El art. 18 enumera las obligaciones de quien realiza cualquier actividad vulnerable del art. 17, sin distinguir fracción.',
  },
  {
    clave: 'conservacion',
    actividades: 'todas',
    justificacion:
      'El plazo del art. 18, fracción IV, aplica a la información y documentación de toda actividad vulnerable.',
  },
  {
    clave: 'aviso-24h',
    actividades: 'todas',
    justificacion:
      'El art. 18, fracción VI, obliga a avisar por sospecha, hechos o indicios en cualquier actividad vulnerable, y el cambio precisa que procede aunque no se alcance el umbral.',
  },
  {
    clave: 'supervision-sat',
    actividades: 'todas',
    justificacion:
      'El art. 22 Bis regula la facultad de supervisión sobre los sujetos obligados en general, no sobre una fracción.',
  },
];

const POR_CLAVE = new Map(CAMBIOS_ANTES_DESPUES.map((c) => [c.clave, c]));

export interface CambioAtribuido {
  cambio: CambioReforma;
  justificacion: string;
}

/** Devolver siempre la misma referencia evita re-renders por identidad nueva. */
const NINGUNO: readonly CambioAtribuido[] = [];

const PROPIOS = new Map<ActividadSlug, CambioAtribuido[]>();
const TRANSVERSALES: CambioAtribuido[] = [];

for (const alcance of ALCANCES) {
  const cambio = POR_CLAVE.get(alcance.clave);
  if (!cambio) continue; // se reporta en CLAVES_DESCONOCIDAS
  const atribuido: CambioAtribuido = { cambio, justificacion: alcance.justificacion };
  if (alcance.actividades === 'todas') {
    TRANSVERSALES.push(atribuido);
    continue;
  }
  for (const slug of alcance.actividades) {
    const lista = PROPIOS.get(slug);
    if (lista) lista.push(atribuido);
    else PROPIOS.set(slug, [atribuido]);
  }
}

/** Cambios que alcanzan a todo sujeto obligado, sea cual sea su fracción. */
export const CAMBIOS_TRANSVERSALES: readonly CambioAtribuido[] = TRANSVERSALES;

/** Cambios atribuibles a esta actividad en concreto. Vacío es una respuesta válida. */
export function cambiosPropios(slug: ActividadSlug): readonly CambioAtribuido[] {
  return PROPIOS.get(slug) ?? NINGUNO;
}

export const ACTIVIDADES_CON_CAMBIO_PROPIO = datos.ACTIVIDADES.filter(
  (a) => cambiosPropios(a.slug).length > 0,
);

export const ACTIVIDADES_SIN_CAMBIO_PROPIO = datos.ACTIVIDADES.filter(
  (a) => cambiosPropios(a.slug).length === 0,
);

/**
 * Cambios documentados que no pudimos atribuir a ninguna actividad.
 *
 * Se exporta para que la página lo diga en voz alta en lugar de que el hueco
 * pase inadvertido. Hoy está vacío; si alguien añade una fila a `reforma.ts`
 * sin repartirla, aparecerá sola en el índice.
 */
export const CLAVES_SIN_ALCANCE: readonly string[] = CAMBIOS_ANTES_DESPUES.filter(
  (c) => !ALCANCES.some((a) => a.clave === c.clave),
).map((c) => c.clave);

/** Reparto que apunta a una clave inexistente: erratas de este archivo. */
export const CLAVES_DESCONOCIDAS: readonly string[] = ALCANCES.filter(
  (a) => !POR_CLAVE.has(a.clave),
).map((a) => a.clave);

/* ── Obligaciones nuevas del Acuerdo 115/2026 ─────────────────────────────── */

/**
 * Bloques del Acuerdo con destinatario acotado.
 *
 * Todos los demás capítulos obligan a cualquier sujeto obligado, así que
 * enumerar aquí sólo las excepciones evita mantener una lista de 22×11.
 */
const BLOQUES_ACOTADOS: Record<string, { actividades: readonly ActividadSlug[]; justificacion: string }> = {
  xi: {
    actividades: ['donativos'],
    justificacion:
      'El Capítulo XI se dirige por su propio texto a las asociaciones y sociedades sin fines de lucro, que en el catálogo del art. 17 son la fracción XIII. El capítulo aclara además que aplica aunque no realicen una actividad vulnerable, de modo que su alcance real es más amplio que esta fracción.',
  },
};

export interface BloqueAtribuido {
  bloque: BloqueAcuerdo;
  /** Presente sólo cuando el capítulo se dirige a un sector concreto. */
  justificacion?: string;
}

export function bloquesDeActividad(slug: ActividadSlug): readonly BloqueAtribuido[] {
  return BLOQUES_ACUERDO_115.flatMap((bloque) => {
    const acotado = BLOQUES_ACOTADOS[bloque.clave];
    if (!acotado) return [{ bloque }];
    if (!acotado.actividades.includes(slug)) return [];
    return [{ bloque, justificacion: acotado.justificacion }];
  });
}

/* ── Qué actividad merece página propia ───────────────────────────────────── */

/**
 * Cuántas actividades comparte cada cambio atribuido.
 *
 * Los dos cambios del art. 32 —metales preciosos y consignación— se reparten a
 * las once actividades con regla de efectivo, con el MISMO texto en todas. Una
 * página por actividad cuyo único contenido propio es ese par no dice nada que
 * no digan las otras diez: medido sobre el HTML servido, las 22 páginas de
 * `/que-cambio/` compartían el 69 % de su texto —92 % el peor par— y 18 de
 * ellas tenían menos del 5 % de contenido que no estuviera en las otras 21.
 *
 * Esa forma —muchas URL generadas que repiten un mismo artículo— es la que la
 * política de spam de Google llama «scaled content abuse» (revisada el 28 de
 * agosto de 2026): «muchas páginas generadas con el propósito principal de
 * manipular el posicionamiento y no de ayudar a quien las lee». El método de
 * redacción no es lo que la define; el resultado sí.
 */
const ACTIVIDADES_POR_CLAVE = new Map<string, number>();
for (const alcance of ALCANCES) {
  if (alcance.actividades === 'todas') continue;
  ACTIVIDADES_POR_CLAVE.set(alcance.clave, alcance.actividades.length);
}

/**
 * Un cambio distingue a una actividad cuando alcanza a pocas.
 *
 * El umbral se compara contra el total del catálogo en vez de ser un número
 * suelto: lo que importa no es «tres», es que el cambio NO sea de reparto
 * amplio. Si mañana una reforma reparte un cambio a dos actividades, las
 * distingue; si lo reparte a la mitad del catálogo, no.
 */
const REPARTO_AMPLIO = datos.ACTIVIDADES.length / 4;

/** ¿Este cambio es de reparto estrecho, o lo comparten muchas actividades? */
export const distingue = (clave: string): boolean =>
  (ACTIVIDADES_POR_CLAVE.get(clave) ?? 0) <= REPARTO_AMPLIO;

/**
 * ¿Esta actividad tiene algo que sólo se puede contar en su propia página?
 *
 * Dos vías: un cambio de la reforma de reparto estrecho, o un capítulo del
 * Acuerdo 115/2026 dirigido a su sector. Las demás se explican enteras en el
 * índice, que ya enumera sus cambios y los transversales.
 */
export function merecePaginaPropia(slug: ActividadSlug): boolean {
  if (cambiosPropios(slug).some(({ cambio }) => distingue(cambio.clave))) return true;
  return Object.values(BLOQUES_ACOTADOS).some((b) => b.actividades.includes(slug));
}

/** Actividades con página propia en `/que-cambio/<slug>`. */
export const ACTIVIDADES_CON_PAGINA = datos.ACTIVIDADES.filter((a) => merecePaginaPropia(a.slug));

/**
 * Actividades que se explican dentro del índice.
 *
 * Sus URL anteriores no desaparecen: `next.config.mjs` las redirige con 301 al
 * índice, porque estaban indexadas y un 404 tira la señal en lugar de moverla.
 */
export const ACTIVIDADES_SIN_PAGINA = datos.ACTIVIDADES.filter((a) => !merecePaginaPropia(a.slug));
