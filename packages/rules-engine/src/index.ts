/**
 * Motor jurídico versionado de LeyAntilavado.org
 *
 * Reglas de la casa:
 *  1. Ningún número legal vive en un componente de UI. Todo sale de `./datos`.
 *  2. Todo cálculo monetario es aritmética entera en centavos.
 *  3. Toda evaluación recibe la FECHA DE LA OPERACIÓN y resuelve la UMA y la
 *     regla vigentes en esa fecha, nunca las de hoy.
 *  4. Ninguna función llama a `Date.now()`. La fecha actual entra como
 *     parámetro para que el motor sea puro y determinista.
 *  5. El motor jamás concluye "cumples" o "no tienes obligaciones": devuelve
 *     una conclusión acotada, la confianza, los supuestos y lo que falta.
 */

export * from './fechas';
export * from './uma';
export * from './motor';
export * from './acumulacion';
export * from './efectivo';
export * from './sanciones';
export * from './avisos';
export * from './riesgo';
export * as datos from './datos/index';
