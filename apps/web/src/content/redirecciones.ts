import { ACTIVIDADES_SIN_PAGINA } from './cambios-por-actividad';

/* ────────────────────────────────────────────────────────────────────────────
 * URL retiradas y a dónde van.
 *
 * `/que-cambio/<slug>` tenía una página por cada una de las 22 actividades, y
 * 18 de ellas repetían el mismo artículo: su único contenido propio eran los
 * dos cambios del art. 32, idénticos en todas. Medido sobre el HTML servido,
 * la familia compartía el 69 % del texto y 18 páginas tenían menos del 5 % de
 * contenido exclusivo.
 *
 * Se retiran con 301 al índice, que ya enumera los cambios de cada actividad,
 * en lugar de borrarlas con 404: estaban indexadas, y un 404 tira la señal que
 * ya tenían en vez de moverla a la página que sí responde.
 * ────────────────────────────────────────────────────────────────────────── */

export const REDIRECCIONES_QUE_CAMBIO: ReadonlyMap<string, string> = new Map(
  ACTIVIDADES_SIN_PAGINA.map((a) => [`/que-cambio/${a.slug}`, '/que-cambio'] as const),
);
