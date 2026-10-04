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
 * 4-oct-2026: HAY cambios. La UIF publicó en el DOF del 24 de septiembre de
 * 2026 las dos resoluciones de formatos que el sitio daba por pendientes, y
 * con ellas el aviso de 24 horas deja de estar «sin fecha cierta»:
 *
 * - **Resolución de formatos de Avisos e Informes** (DOF 24-09-2026, código
 *   5799445). Transitorios leídos en el propio DOF: en vigor el 1 de junio de
 *   2027 (Primero); desde ese día los avisos e informes se envían con los
 *   formatos nuevos (Segundo); los modificatorios de avisos enviados con el
 *   formato anterior pueden seguir usándolo hasta el 30 de junio de 2027
 *   (Tercero) y el 1 de julio dejan de estar disponibles (Cuarto); y, para
 *   efectos del quinto transitorio del Acuerdo 115/2026, la Resolución entra
 *   en vigor el 1 de diciembre de 2026, «por lo que a partir del primero de
 *   junio de dos mil veintisiete» los avisos de los arts. 26 Bis, 26 Bis 1,
 *   26 Bis 2 y 27 de las Reglas se presentan con los formatos nuevos (Quinto).
 * - **Resolución del formato de alta y registro** (DOF 24-09-2026, código
 *   5799444). En vigor el 1 de febrero de 2027; para las personas
 *   facilitadoras, el 1 de junio de 2027. Quien se dio de alta antes del 1 de
 *   febrero como agencia aduanal, como quien despacha sin agente, o actuando
 *   por medio de fideicomiso u otra figura jurídica, debe darse de baja y de
 *   alta de nuevo identificando el carácter con que actúa (Tercero).
 * - **Portal del SAT.** Tres páginas y la tabla de umbrales cambiaron de
 *   hash. Se compararon byte a byte contra copias archivadas que reproducen la
 *   línea base: lo único nuevo es la entrada de menú «Facilitadores» y un
 *   comentario HTML. La tabla de umbrales NO cambió.
 * - **Página nueva «Facilitadores»** y su guía (act_fac.pdf): fija el aviso
 *   de inmuebles en 8 000 UMA —la cifra que el motor ya tomaba por remisión al
 *   Apartado A— y sólo contempla derechos reales sobre inmuebles. La ley
 *   remite al Apartado A completo. Se publican las dos lecturas.
 * - **Texto vigente.** LFPIORPI.doc reproduce su sha-256 del 12-sep
 *   (49f53d224796a121): reforma DOF 16-07-2025. Reglamento 27-03-2026, LFPA
 *   14-11-2025 y LFPCA 09-06-2026, sin cambios.
 * - **Los cuatro instructivos en PDF y el aplicativo.** Mismo sha-256.
 * - **Paquete Económico 2027.** Sigue siendo iniciativa: Diputados tiene
 *   hasta el 20 de octubre. Los análisis no cambian.
 *
 * Cambia el calendario y cambian notas publicadas: `ULTIMA_MODIFICACION` sube.
 *
 * Antes: 2026-09-11, sin cambios en el corpus. Lo nuevo es el Paquete Económico
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
export const ULTIMA_REVISION = '2026-10-04';

/**
 * Fecha en que cambió por última vez algún dato del corpus.
 *
 * 2026-10-04: el calendario gana cuatro fechas tomadas de las dos
 * resoluciones del DOF del 24-09-2026, y el aviso de 24 horas pasa de
 * «pendiente sin fecha» a hito con fecha (1 de junio de 2027). Las notas de
 * los cinco supuestos de personas facilitadoras cambian para recoger la guía
 * del SAT. Ningún umbral cambia de valor.
 *
 * Los datasets que no se tocaron conservan su propia fecha: sólo
 * `calendario.ts`, los supuestos del Apartado D en `umbrales.ts` y la ficha de
 * personas facilitadoras en `actividades.ts` llevan ésta.
 *
 * Antes: 2026-09-01 (serie de la UMA verificada). Antes, 2026-08-24: dos supuestos que se publicaban SIN respuesta pasaron a tenerla,
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
export const ULTIMA_MODIFICACION = '2026-10-04';

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
