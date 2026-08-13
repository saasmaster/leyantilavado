import { datos } from '@leyantilavado/rules-engine';

/**
 * Cómo se nombran las cifras del corpus. Un solo sitio, para todo el sitio.
 *
 * El problema que resuelve no era que las cifras estuvieran mal —nunca lo
 * estuvieron— sino que cada página las nombraba a su manera. La portada decía
 * «20 de 22», una tarjeta «20 actividades», la página de detalle «22
 * supuestos» y llms.txt «36 reglas». Todo cierto y todo distinto, que en un
 * sitio de información legal se lee como que se contradice a sí mismo.
 *
 * Hay tres niveles y conviene no mezclarlos nunca:
 *
 *   FRACCIÓN   lo que la ley enumera en el artículo 17. Son 16.
 *   SUPUESTO   cada caso operativo distinto. Las fracciones con incisos —los
 *              apartados A, B, C y D de la XII, por ejemplo— se desglosan,
 *              porque tienen umbrales distintos y aplanarlas perdería la
 *              diferencia. Son 22.
 *   VERIFICADO el supuesto cuyo umbral pudimos contrastar contra fuente
 *              oficial. Son 20. Los otros 2 existen en la ley y no tienen
 *              cifra publicada por la autoridad.
 *
 * Los textos se generan del motor, así que si mañana se publica el umbral de
 * un supuesto pendiente, las 40 frases del sitio cambian solas.
 */

export const CIFRAS = {
  fracciones: new Set(datos.ACTIVIDADES.map((a) => a.fraccion.split(' ')[0])).size,
  supuestos: datos.ACTIVIDADES.length,
  supuestosVerificados: datos.ACTIVIDADES_PUBLICABLES.length,
  supuestosPendientes: datos.ACTIVIDADES.length - datos.ACTIVIDADES_PUBLICABLES.length,

  umbrales: datos.UMBRALES.length,
  umbralesVerificados: datos.UMBRALES_PUBLICADOS.length,
  umbralesPendientes: datos.UMBRALES.length - datos.UMBRALES_PUBLICADOS.length,

  efectivo: datos.REGLAS_EFECTIVO.length,
  efectivoConfirmados: datos.REGLAS_EFECTIVO_PUBLICADAS.length,
  efectivoEnDisputa: datos.REGLAS_EFECTIVO.length - datos.REGLAS_EFECTIVO_PUBLICADAS.length,
} as const;

/** «16 fracciones del artículo 17, desglosadas en 22 supuestos operativos» */
export const FRASE_ACTIVIDADES = `${CIFRAS.fracciones} fracciones del artículo 17, desglosadas en ${CIFRAS.supuestos} supuestos operativos`;

/** La versión con el estado de verificación, para donde haya sitio. */
export const FRASE_ACTIVIDADES_LARGA = `${FRASE_ACTIVIDADES}: ${CIFRAS.supuestosVerificados} con umbral verificado y ${CIFRAS.supuestosPendientes} sin cifra publicada`;

/** «38 registros: 36 reglas verificadas y 2 supuestos sin umbral publicado» */
export const FRASE_UMBRALES = `${CIFRAS.umbrales} registros: ${CIFRAS.umbralesVerificados} reglas verificadas y ${CIFRAS.umbralesPendientes} supuestos sin umbral publicado`;

/**
 * «8 supuestos del artículo 32: 7 límites confirmados y 1 con discrepancia»
 *
 * El octavo no es un hueco de investigación: es un supuesto donde las propias
 * fuentes oficiales no coinciden. Decir «7» a secas lo escondía; decir «8» a
 * secas sugería que tenemos ocho cifras. Ninguna de las dos cosas es cierta.
 */
export const FRASE_EFECTIVO = `${CIFRAS.efectivo} supuestos del artículo 32: ${CIFRAS.efectivoConfirmados} límites confirmados y ${CIFRAS.efectivoEnDisputa} supuesto con discrepancia entre fuentes oficiales`;

/** Etiquetas cortas para tarjetas, donde no cabe la frase entera. */
export const ETIQUETA_ACTIVIDADES = `${CIFRAS.supuestos} supuestos · ${CIFRAS.supuestosVerificados} verificados`;
export const ETIQUETA_UMBRALES = `${CIFRAS.umbrales} registros · ${CIFRAS.umbralesVerificados} verificados`;
export const ETIQUETA_EFECTIVO = `${CIFRAS.efectivo} supuestos · ${CIFRAS.efectivoConfirmados} confirmados`;
