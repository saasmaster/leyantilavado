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
 * 11-sep-2026: sin cambios en el corpus. Lo nuevo es el Paquete Económico
 * 2027, y se leyó entero antes de afirmar que no nos toca:
 *
 * - **Paquete Económico 2027** (Gaceta Parlamentaria, 8-sep-2026, anexos A a
 *   N). Ninguna iniciativa reforma la LFPIORPI. La que más se le acerca, la
 *   Ley de Economía Digital (Anexo G), no la menciona, no fija montos de
 *   efectivo y deja a salvo las leyes especiales en su art. 3. Se analiza en
 *   /analisis/ley-economia-digital-efectivo.
 * - **Texto vigente.** La LFPIORPI sigue en su reforma del 16-07-2025.
 * - **Tabla de umbrales del SAT.** Idéntica (95 205 bytes).
 * - **Los ocho documentos del portal.** Reproducen su sha-256 de la línea
 *   base del 1-sep.
 * - **Resolución de formatos de la UIF.** Sigue sin publicarse: los avisos de
 *   24 horas siguen sin fecha cierta.
 * - **LFPA y LFPCA.** 14-11-2025 y 09-06-2026, sin cambios.
 *
 * Ninguna cifra publicada cambia, y `ULTIMA_MODIFICACION` no sube.
 *
 * Antes: 2026-09-05.
 */
export const ULTIMA_REVISION = '2026-09-11';

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
export const ULTIMA_MODIFICACION = '2026-09-01';

/*
 * 2026-09-01: la serie histórica de la UMA 2016–2025 pasó de
 * `fuente_secundaria` a `oficial_verificado`. Las cifras NO cambiaron —se
 * contrastaron una a una contra la tabla «Valor de la UMA» del INEGI y
 * coinciden dígito a dígito—, pero sí cambió lo que la página publica: diez
 * filas dejaron de llevar el aviso «pendiente de contraste oficial».
 *
 * Sube porque cambió el contenido publicado, no porque se revisara: una
 * revisión sin cambios no mueve esta fecha, y las dos anteriores no la
 * movieron. Sólo `uma.ts` la referencia, así que el sitemap anuncia como
 * modificadas las páginas con UMA y no el sitio entero.
 *
 * Antes: 2026-08-24.
 */

/**
 * Fecha de modificación de los datasets que NO se han tocado desde el 11.
 *
 * Existe para que la separación anterior sea explícita en cada fichero en vez
 * de un literal suelto que nadie sabe si está vivo o es un resto.
 */
export const SIN_CAMBIOS_DESDE = '2026-08-11';
