import type { Autor, FirmaContenido } from './tipos';
import { datos } from '@leyantilavado/rules-engine';

/**
 * Sistema de autoría.
 *
 * **El contenido lo firma el equipo editorial, y ésa es la postura, no una
 * etapa intermedia.** Inventar un autor con credenciales que no se pueden
 * acreditar sería peor que firmar colectivamente, y firmar colectivamente
 * mientras se declara el método de trabajo es una posición honesta y completa.
 *
 * El tipo `Autor` admite persona con nombre y credenciales, y `revisor` existe
 * en la firma de las páginas. Están ahí porque el modelo de datos lo permite,
 * no porque falte llenarlos: si algún día se decide nombrar a alguien, se
 * agrega aquí sin tocar ninguna página.
 */
export const EQUIPO_EDITORIAL: Autor = {
  id: 'equipo-editorial',
  nombre: 'Equipo editorial de LeyAntilavado.org',
  rol: 'Investigación normativa y redacción',
  credenciales: [],
  descripcion:
    'Equipo que investiga, redacta y mantiene el contenido de LeyAntilavado.org. No somos un despacho ni una autoridad: somos un proyecto editorial independiente que explica la LFPIORPI en español claro y cita siempre la disposición de la que sale cada afirmación.',
  metodologia: [
    'Cada cifra legal del sitio sale del motor de reglas, no de un texto escrito a mano. Si la ley cambia, cambia el dato en un solo lugar y con él todas las páginas.',
    'Cada afirmación jurídica lleva artículo y fracción. Si una afirmación no puede anclarse a una disposición, no se publica.',
    'Contrastamos contra fuente primaria: el texto vigente publicado por la Cámara de Diputados, el Diario Oficial de la Federación, el portal SPPLD del SAT y los comunicados del INEGI para la UMA.',
    'Cuando dos fuentes oficiales se contradicen, mostramos ambas y decimos que la autoridad no lo ha aclarado. No elegimos una en silencio.',
    'Cuando un dato no pudo verificarse, la página lo dice con el sello de procedencia en rojo en lugar de esconderlo.',
    'No emitimos constancias, dictámenes ni opiniones jurídicas, y nada de lo publicado sustituye la asesoría de un profesional sobre un caso concreto.',
  ],
  url: '/metodologia-editorial',
};

export const AUTORES: readonly Autor[] = [EQUIPO_EDITORIAL];

export const AUTORES_POR_ID: Record<string, Autor> = Object.fromEntries(
  AUTORES.map((a) => [a.id, a]),
);

/**
 * Fecha de la última pasada editorial: cuándo alguien miró las fuentes.
 *
 * **Se reexporta del motor a propósito, no se escribe aquí.** Durante un rato
 * fueron dos constantes independientes y el resultado se vio en la portada: un
 * sello decía «Última revisión: 2026-08-11» a dos dedos de un pie que decía
 * «14 de agosto». Ninguna mentía —eran respuestas a preguntas distintas— pero
 * juntas sólo se leen como una incoherencia, y en un sitio cuya promesa es la
 * trazabilidad eso cuesta más de lo que aporta.
 *
 * Ahora hay una sola fecha de revisión en todo el proyecto, y la que alimenta
 * el `lastModified` del sitemap es otra —`ULTIMA_MODIFICACION`—, que sólo se
 * mueve cuando un dato cambia de verdad.
 *
 * **No es sólo una etiqueta.** Se le pasa a `convertirUMA()` y a
 * `describirUmbral()`, así que decide qué versión de regla y qué valor de UMA
 * se aplican. Moverla puede cambiar cifras publicadas, y por eso no se sube
 * «porque hoy es otro día»: se sube cuando alguien revisó las fuentes, y se
 * comprueba que ninguna cifra se movió con el cambio.
 *
 * Revisión del 14-ago-2026: sin instrumento nuevo desde el Acuerdo 115/2026
 * (DOF 7-ago-2026, en vigor el 30-nov-2026). El marco sigue siendo los mismos
 * tres instrumentos, ninguna `vigencia.desde` cae entre el 11 y el 14 de
 * agosto, y la UMA se actualiza en febrero. Las 430 cifras de /umbrales,
 * /multas, /limites-efectivo, /reforma-ley-antilavado-2026 y la calculadora de
 * UMA se compararon antes y después: idénticas.
 */
export const REVISION_VIGENTE = datos.ULTIMA_REVISION;

/**
 * Fecha real de publicación del sitio: su primer despliegue público.
 *
 * Es un hecho fijo, no una variable editorial. Aquí estaba `REVISION_VIGENTE`,
 * de modo que cada pasada de fuentes movía el `datePublished` de las 165
 * páginas hacia adelante: el sitio afirmaba haberse publicado el día que se
 * revisó. Además de falso, es contraproducente —le dice al buscador que todo
 * el contenido nació ayer, borrando la antigüedad que cuesta meses ganar— y se
 * parece demasiado a manipular fechas.
 */
export const PUBLICADO_DESDE = '2026-08-12';

/**
 * «Cuándo cambió el contenido», para las páginas que declaran sus fechas a
 * mano en vez de usar `FIRMA_POR_DEFECTO`.
 *
 * Existe porque arreglar sólo la firma por omisión dejó el fallo vivo en 85
 * sitios: cada página que escribía `actualizadoEn: MODIFICADO_EN` seguía
 * afirmando que su contenido cambió el día en que se revisaron las fuentes.
 * `fechas-articulo.test.ts` impide que vuelva a colarse.
 */
export const MODIFICADO_EN = datos.ULTIMA_MODIFICACION;

export const FIRMA_POR_DEFECTO: FirmaContenido = {
  autor: EQUIPO_EDITORIAL,
  publicadoEn: PUBLICADO_DESDE,
  /**
   * `dateModified` responde «cuándo cambió el contenido», que es la MISMA
   * pregunta que responde el `lastmod` del sitemap. Alimentarla con la fecha
   * de revisión las hacía contradecirse: el schema de /umbrales declaraba
   * 2026-09-01 mientras su lastmod decía 2026-08-11, y un buscador que ve dos
   * respuestas distintas a la misma pregunta deja de creer las dos.
   *
   * La fecha de revisión no desaparece: viaja en `lastReviewed`, que es el
   * campo de schema.org que de verdad significa «esto se comprobó tal día».
   */
  actualizadoEn: datos.ULTIMA_MODIFICACION,
};

/** Aviso legal que acompaña a toda página de contenido. */
export const AVISO_LEGAL_TEXTO = [
  'Esta página es información general sobre la LFPIORPI, no asesoría jurídica ni fiscal para un caso concreto. Aplicar una regla a tu operación exige revisar hechos que aquí no conocemos.',
  'LeyAntilavado.org es un proyecto privado e independiente. No pertenece ni está afiliado al SAT, a la UIF, a la SHCP ni a ninguna autoridad del gobierno de México, y no emite constancias ni certificaciones de cumplimiento.',
  'Antes de decidir sobre una operación real, verifica la disposición citada en su fuente oficial y consulta a un profesional.',
] as const;
