/**
 * Las dos fechas del corpus, que no son la misma pregunta.
 *
 * Estaban colapsadas en un único `ultimaRevision` repetido a mano en diez
 * sitios, y eso producía una contradicción visible: la portada mostraba
 * «Última revisión: 2026-08-11» junto a páginas que decían «14 de agosto».
 * Ninguna de las dos mentía —eran respuestas a preguntas distintas— pero
 * puestas una al lado de la otra el lector sólo ve una incoherencia, y en un
 * sitio cuya promesa es la trazabilidad eso cuesta más que la información que
 * aporta.
 *
 * - `ULTIMA_REVISION` — **cuándo miramos las fuentes.** Es lo que se enseña al
 *   lector: «esto se comprobó tal día». Sube cada vez que alguien revisa, aunque
 *   no cambie nada; de hecho su valor está justamente en eso, en decir «lo
 *   miramos el jueves y sigue igual».
 *
 * - `ULTIMA_MODIFICACION` — **cuándo cambió el dato.** Alimenta el `lastModified`
 *   del sitemap y nada más. NO sube en una revisión que no encontró cambios:
 *   anunciar 97 URL como modificadas cuando no se tocó una cifra es la clase de
 *   señal que un buscador deja de creer, y entonces deja de creerla también el
 *   día que una reforma sí mueva una tabla, que es el día que importa.
 *
 * Regla al actualizar: `ULTIMA_REVISION` sube en cada pasada editorial;
 * `ULTIMA_MODIFICACION` sólo cuando de verdad cambia un número, un artículo o
 * una vigencia en `./`.
 */

/** Fecha de la última pasada editorial sobre las fuentes oficiales. */
export const ULTIMA_REVISION = '2026-08-14';

/**
 * Fecha en que cambió por última vez algún dato del corpus.
 *
 * 2026-08-11: última vez que se tocaron cifras. La revisión del 14 de agosto
 * confirmó que no hay instrumento nuevo desde el Acuerdo 115/2026 (DOF
 * 7-ago-2026, en vigor el 30-nov-2026), así que los datos siguen siendo los
 * mismos y esta fecha no se mueve.
 */
export const ULTIMA_MODIFICACION = '2026-08-11';
