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

/**
 * Fecha de la última pasada editorial sobre las fuentes oficiales.
 *
 * 1-sep-2026: sin cambios. Lo que se comprobó, y contra qué:
 *
 * - **Texto vigente.** La ficha de reformas de la Cámara de Diputados sigue
 *   dando el 16-07-2025 como última reforma de la LFPIORPI. No hay decreto
 *   posterior, así que el texto sobre el que descansa todo el corpus no se ha
 *   movido.
 * - **Instrumentos.** Ninguno nuevo desde el Acuerdo 115/2026 (DOF 7-ago-2026,
 *   en vigor el 30-nov-2026). El marco siguen siendo los mismos tres.
 * - **Tabla de umbrales del SAT.** Comparados los conjuntos COMPLETOS de
 *   valores en UMA, el nuestro y el suyo: coinciden exactamente —4, 210, 325,
 *   485, 645, 805, 1,285, 1,605, 2,410, 3,210, 4,000, 4,815, 6,420, 8,000 y
 *   8,025—, ninguno de más ni de menos. La UMA 2026 que publica el SAT
 *   (117.31 diarios) es la que usa el motor.
 * - **Resolución de formatos de la UIF.** Sigue sin aparecer publicada. Es la
 *   única pieza capaz de convertir un pendiente en un plazo cierto —los avisos
 *   de 24 horas—, y por eso se vuelve a mirar en cada pasada. Mientras no
 *   exista, `PENDIENTES_SIN_FECHA` sigue siendo la respuesta honesta.
 *
 * Ninguna `vigencia.desde` cae entre el 24-ago y el 1-sep, y la UMA se
 * actualiza en febrero. Ninguna cifra publicada cambia con esta fecha, y por
 * eso `ULTIMA_MODIFICACION` NO sube: véase la regla al principio del fichero.
 *
 * Antes: 2026-08-23.
 */
export const ULTIMA_REVISION = '2026-09-01';

/**
 * Fecha en que cambió por última vez algún dato del corpus.
 *
 * 2026-08-24: dos supuestos que se publicaban SIN respuesta pasaron a tenerla,
 * contrastados contra el texto vigente (DOF 16-07-2025). Los dos cambian lo que
 * devuelven las herramientas, que es exactamente lo que esta fecha existe para
 * señalar:
 *
 * - Art. 32, fr. VIII (consignación de pago): estaba en `borrador` mostrando
 *   las dos lecturas oficiales sin elegir. Ahora aplica la más estricta,
 *   3,210 UMA, y sigue informando la discrepancia. El art. 32 es una
 *   prohibición: por debajo del límite menor se cumple con ambas lecturas.
 * - Art. 17, fr. XII, Apartado D (personas facilitadoras): estaba sin umbral.
 *   El apartado remite al Apartado A «en los términos que se señalan», así que
 *   toma los umbrales de notarios, citando la remisión.
 *
 * El Apartado C sigue sin umbral publicado y así se declara.
 *
 * Antes: 2026-08-14, cuando se corrigieron dos `disposicion` del catálogo de
 * obligaciones. Antes de eso, 2026-08-11.
 *
 * **Esta constante es la del CORPUS, y de ella sale `VERSION_LEGAL`.** No la
 * uses como `ultimaModificacion` de un dataset que no cambió: cada fichero de
 * `datos/` declara la suya, y ésas son las que alimentan el `lastModified` del
 * sitemap. Ponerla en los diez ficheros hace que las 136 URL se anuncien como
 * modificadas porque cambió una cita en uno solo — que es exactamente el ruido
 * que este campo existe para evitar.
 */
export const ULTIMA_MODIFICACION = '2026-08-24';

/**
 * Fecha de modificación de los datasets que NO se han tocado desde el 11.
 *
 * Existe para que la separación anterior sea explícita en cada fichero en vez
 * de un literal suelto que nadie sabe si está vivo o es un resto.
 */
export const SIN_CAMBIOS_DESDE = '2026-08-11';
