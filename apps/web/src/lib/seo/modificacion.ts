import { datos } from '@leyantilavado/rules-engine';

/* ────────────────────────────────────────────────────────────────────────────
 * Una sola respuesta a «cuándo cambió esta página».
 *
 * El sitemap la contestaba por dataset —fino y correcto— y el JSON-LD la
 * contestaba con una constante global. Resultado en producción: /umbrales
 * declaraba `dateModified: 2026-09-01` en su schema y `lastmod: 2026-08-11`
 * en el sitemap. Son dos respuestas distintas a la misma pregunta, sobre la
 * misma URL, emitidas por el mismo sitio. Un buscador que ve eso no elige la
 * buena: deja de creer las dos, y `lastmod` sólo sirve mientras se le cree.
 *
 * Este módulo es ahora el único que lo decide, y del que beben los dos.
 *
 * ── Por qué el respaldo es SIN_CAMBIOS_DESDE y no ULTIMA_MODIFICACION ──────
 *
 * Sería cómodo que toda ruta sin dato propio heredara la última modificación
 * del corpus, pero eso hace que un cambio en un dataset anuncie como
 * modificadas páginas que nadie tocó —incluidas /nosotros o /contacto, que no
 * dependen del corpus—. El respaldo es la fecha base: «esta página no se ha
 * movido desde entonces», que es la verdad hasta que alguien la mueva.
 * ────────────────────────────────────────────────────────────────────────── */

type ConProcedencia = {
  procedencia: { ultimaRevision: string; ultimaModificacion?: string };
};

/** Para el sitemap importa cuándo **cambió** el dato, no cuándo se revisó. */
export function modificadoEn(item: ConProcedencia): string {
  return item.procedencia.ultimaModificacion ?? item.procedencia.ultimaRevision;
}

/** Modificación más reciente de un conjunto de datos del motor. */
export function revisionDe(items: readonly ConProcedencia[]): string {
  let max = '';
  for (const item of items) {
    const f = modificadoEn(item);
    if (f > max) max = f;
  }
  return max || datos.ULTIMA_MODIFICACION;
}

const obligacionesPublicadas = datos.OBLIGACIONES.filter(
  (o) => o.estado === 'publicado' || o.estado === 'revisado',
);

const REV_UMBRALES = revisionDe(datos.UMBRALES_PUBLICADOS);
const REV_ACTIVIDADES = revisionDe(datos.ACTIVIDADES_PUBLICABLES);
const REV_EFECTIVO = revisionDe(datos.REGLAS_EFECTIVO_PUBLICADAS);
const REV_SANCIONES = revisionDe(datos.SANCIONES);
const REV_CALENDARIO = revisionDe(datos.CALENDARIO);
const REV_OBLIGACIONES = revisionDe(obligacionesPublicadas);
/** La UMA se muestra en /umbrales y en su calculadora, no sólo en su tabla. */
const REV_UMA = revisionDe(datos.VALORES_UMA);

/** Rutas cuyo contenido depende de un dataset concreto del motor. */
const POR_RUTA: Record<string, string> = {
  // /umbrales publica la tabla de umbrales Y la serie de la UMA: le toca la
  // más reciente de las dos, porque cualquiera de ellas cambia la página.
  '/umbrales': REV_UMBRALES > REV_UMA ? REV_UMBRALES : REV_UMA,
  '/actividades-vulnerables': REV_ACTIVIDADES,
  '/obligaciones': REV_OBLIGACIONES,
  '/guia-aviso': REV_OBLIGACIONES,
  '/limites-efectivo': REV_EFECTIVO,
  '/multas': REV_SANCIONES,
  '/requerimiento-sat': REV_SANCIONES,
  '/calendario-cumplimiento': REV_CALENDARIO,
  '/exigibilidad': REV_CALENDARIO,
  '/herramientas/calculadora-uma': REV_UMA,
  '/herramientas/calculadora-umbrales': REV_UMBRALES,
  '/herramientas/limites-efectivo': REV_EFECTIVO,
  '/herramientas/calculadora-multas': REV_SANCIONES,
  ...Object.fromEntries(
    datos.ACTIVIDADES.map((a) => [`/actividades-vulnerables/${a.slug}`, modificadoEn(a)]),
  ),
  ...Object.fromEntries(
    obligacionesPublicadas.map((o) => [`/obligaciones/${o.slug}`, modificadoEn(o)]),
  ),
};

/** Cuándo cambió por última vez el contenido de esta ruta. */
export function modificadoDeRuta(ruta: string): string {
  return POR_RUTA[ruta] ?? datos.SIN_CAMBIOS_DESDE;
}
