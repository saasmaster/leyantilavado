/**
 * Clases compartidas por las tablas de los análisis.
 *
 * Van en un solo sitio porque son tres artículos con cuatro tablas, y una
 * celda que se ve distinta en cada una se lee como un descuido.
 */
export const TABLA = 'w-full border-collapse text-left text-sm';
export const TH =
  'border-b border-[var(--color-borde-fuerte)] px-3 py-2.5 text-left align-bottom font-semibold text-[var(--color-tinta)]';
export const TD = 'border-b border-[var(--color-borde)] px-3 py-2.5 align-top text-[var(--color-tinta-suave)]';
/** Celda numérica: cifras tabulares y alineadas a la derecha. */
export const TD_CIFRA = `${TD} cifra text-right text-[var(--color-tinta)]`;
