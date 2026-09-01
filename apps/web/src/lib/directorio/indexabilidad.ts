import { CATEGORIAS_PROVEEDOR } from '@leyantilavado/types';
import { repositorioDirectorio } from './repositorio';

/* ────────────────────────────────────────────────────────────────────────────
 * Una sola regla decide si una categoría del directorio se indexa.
 *
 * Antes la decisión vivía SÓLO en `generateMetadata`, y el sitemap listaba las
 * diez categorías sin preguntar. Resultado en producción: diez URL pedían ser
 * rastreadas desde el sitemap y respondían `noindex` al llegar. Es una señal
 * contradictoria —«indéxame» / «no me indexes»— y el que la emite pierde
 * credibilidad en el resto del archivo.
 *
 * No se resuelve quitándolas del sitemap a mano: volverían a divergir en cuanto
 * alguien cambie el umbral. Se resuelve con este predicado, que es el único
 * sitio donde vive la regla, y del que beben las dos partes.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Perfiles reales que necesita una categoría para pedir indexación.
 *
 * Un directorio vacío es una página de baja calidad y la clase de página que
 * un buscador aprende a no volver a mostrar. `follow` se mantiene siempre: los
 * enlaces internos y el contenido editorial de la ficha sí valen.
 */
export const MINIMO_PARA_INDEXAR = 3;

/** Categorías con oferta suficiente para indexarse hoy. */
export async function categoriasIndexables(): Promise<Set<string>> {
  const perfiles = await repositorioDirectorio.listarPerfiles();
  const cuenta = new Map<string, number>();
  for (const p of perfiles) {
    for (const c of p.categorias) cuenta.set(c, (cuenta.get(c) ?? 0) + 1);
  }
  return new Set(
    CATEGORIAS_PROVEEDOR.filter((c) => (cuenta.get(c) ?? 0) >= MINIMO_PARA_INDEXAR),
  );
}
