import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { datos } from '@leyantilavado/rules-engine';
import { ACTIVIDADES_CON_PAGINA, ACTIVIDADES_SIN_PAGINA } from './cambios-por-actividad';
import { REDIRECCIONES_QUE_CAMBIO } from './redirecciones';

/* ────────────────────────────────────────────────────────────────────────────
 * Retirar una URL son tres cosas a la vez: dejar de generarla, sacarla del
 * sitemap y redirigirla. Hacer dos de las tres deja un 404 indexado o un
 * sitemap que pide rastrear algo que ya no existe, y ninguna de las dos falla
 * el build. Esta prueba las ata.
 * ────────────────────────────────────────────────────────────────────────── */

const RETIRADAS = ACTIVIDADES_SIN_PAGINA.map((a) => `/que-cambio/${a.slug}`);

function archivosFuente(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) return archivosFuente(ruta);
    return /\.tsx?$/.test(e.name) && !/\.test\./.test(e.name) ? [ruta] : [];
  });
}

describe('URL retiradas de /que-cambio', () => {
  it('cada actividad está en exactamente una de las dos listas', () => {
    expect(ACTIVIDADES_CON_PAGINA.length + ACTIVIDADES_SIN_PAGINA.length).toBe(
      datos.ACTIVIDADES.length,
    );
    const con = new Set(ACTIVIDADES_CON_PAGINA.map((a) => a.slug));
    expect(ACTIVIDADES_SIN_PAGINA.some((a) => con.has(a.slug))).toBe(false);
  });

  it('toda URL retirada tiene su redirección', () => {
    for (const ruta of RETIRADAS) expect(REDIRECCIONES_QUE_CAMBIO.get(ruta)).toBe('/que-cambio');
    expect(REDIRECCIONES_QUE_CAMBIO.size).toBe(RETIRADAS.length);
  });

  it('ningún destino de redirección está a su vez redirigido', () => {
    for (const destino of REDIRECCIONES_QUE_CAMBIO.values()) {
      expect(REDIRECCIONES_QUE_CAMBIO.has(destino)).toBe(false);
    }
  });

  it('ningún archivo del sitio enlaza a una URL retirada', () => {
    const raiz = join(import.meta.dirname, '..');
    const infracciones: string[] = [];
    for (const archivo of archivosFuente(raiz)) {
      if (archivo.endsWith(join('content', 'redirecciones.ts'))) continue;
      const texto = readFileSync(archivo, 'utf8');
      for (const ruta of RETIRADAS) {
        if (texto.includes(`"${ruta}"`) || texto.includes(`'${ruta}'`)) {
          infracciones.push(`${archivo.slice(raiz.length + 1)} enlaza a ${ruta}`);
        }
      }
    }
    expect(infracciones, infracciones.join('\n')).toEqual([]);
  });
});
