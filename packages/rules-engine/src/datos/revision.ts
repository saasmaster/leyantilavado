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
 * 2026-08-14: se corrigieron dos `disposicion` del catálogo de obligaciones.
 * No cambió ninguna cifra, pero una cita SÍ es un dato del corpus —se imprime
 * bajo el sello de procedencia de cada página de obligación— y su corrección
 * es exactamente el tipo de cambio que esta fecha existe para señalar. Que la
 * revisión del 14 no encontrara instrumento nuevo no impide que ese mismo día
 * se corrigiera un error propio.
 *
 * - `alta-sppld` citaba el art. 18 fr. I (identificación del cliente); el alta
 *   en el Padrón es la fr. IV Bis, adicionada por el DOF 16-07-2025.
 * - `expedientes` citaba la fr. II (actividad u ocupación del cliente en
 *   Relación de negocios); el expediente único lo regula el art. 12 de las
 *   disposiciones de carácter general.
 *
 * Antes: 2026-08-11, última vez que se tocaron cifras.
 *
 * **Esta constante es la del CORPUS, y de ella sale `VERSION_LEGAL`.** No la
 * uses como `ultimaModificacion` de un dataset que no cambió: cada fichero de
 * `datos/` declara la suya, y ésas son las que alimentan el `lastModified` del
 * sitemap. Ponerla en los diez ficheros hace que las 136 URL se anuncien como
 * modificadas porque cambió una cita en uno solo — que es exactamente el ruido
 * que este campo existe para evitar.
 */
export const ULTIMA_MODIFICACION = '2026-08-14';

/**
 * Fecha de modificación de los datasets que NO se han tocado desde el 11.
 *
 * Existe para que la separación anterior sea explícita en cada fichero en vez
 * de un literal suelto que nadie sabe si está vivo o es un resto.
 */
export const SIN_CAMBIOS_DESDE = '2026-08-11';
