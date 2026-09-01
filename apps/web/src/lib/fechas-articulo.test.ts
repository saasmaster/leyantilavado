import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/* ────────────────────────────────────────────────────────────────────────────
 * `datePublished` y `dateModified` NO se alimentan con la fecha de revisión.
 *
 * Son tres preguntas distintas y este sitio necesita las tres separadas:
 *
 *   datePublished  cuándo se publicó la página        → PUBLICADO_DESDE
 *   dateModified   cuándo cambió su contenido         → MODIFICADO_EN
 *   lastReviewed   cuándo se comprobaron las fuentes  → REVISION_VIGENTE
 *
 * Estaban colapsadas en la tercera, en 85 sitios. Las consecuencias eran dos y
 * ninguna visible: el schema de /umbrales declaraba `dateModified` tres
 * semanas por delante de su propio `lastmod` —dos respuestas distintas a la
 * misma pregunta, y un buscador que ve eso deja de creer las dos—, y cada
 * pasada editorial empujaba el `datePublished` de las 165 páginas hacia
 * adelante, borrando la antigüedad que cuesta meses ganar y pareciéndose
 * demasiado a manipular fechas.
 * ────────────────────────────────────────────────────────────────────────── */

const PROHIBIDO = /\b(publicadoEn|actualizadoEn):\s*REVISION_VIGENTE\b/g;

function archivosFuente(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) return archivosFuente(ruta);
    return /\.tsx?$/.test(e.name) && !/\.test\./.test(e.name) ? [ruta] : [];
  });
}

describe('fechas de artículo', () => {
  it('ninguna página usa la fecha de revisión como fecha de publicación o cambio', () => {
    const raiz = join(import.meta.dirname, '..');
    const infracciones: string[] = [];

    for (const archivo of archivosFuente(raiz)) {
      const texto = readFileSync(archivo, 'utf8');
      for (const [coincidencia, campo] of texto.matchAll(PROHIBIDO)) {
        const linea = texto.slice(0, texto.indexOf(coincidencia)).split('\n').length;
        infracciones.push(
          `${archivo.slice(raiz.length + 1)}:${linea} — ${campo} debe ser ` +
            `${campo === 'publicadoEn' ? 'PUBLICADO_DESDE' : 'MODIFICADO_EN'}, no REVISION_VIGENTE. ` +
            'La fecha de revisión viaja en `lastReviewed`.',
        );
      }
    }

    expect(infracciones, infracciones.join('\n')).toEqual([]);
  });
});
