import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { datos } from '@leyantilavado/rules-engine';

/* ────────────────────────────────────────────────────────────────────────────
 * Ninguna fecha de revisión se escribe a mano.
 *
 * El fallo que esta prueba existe para impedir ya ocurrió: `/herramientas`
 * llevaba `const ACTUALIZADO = '2026-08-11'` y anunció «Revisado el 11 de
 * agosto» durante tres semanas, mientras el corpus se revisaba de nuevo y todas
 * las demás páginas avanzaban. Nadie lo vio porque no rompe nada: compila,
 * pasa los tipos, y la página se ve perfecta. Sólo miente.
 *
 * Una fecha copiada a mano es correcta exactamente el día que se escribe. La
 * regla es derivarla de `ULTIMA_REVISION`, que es el único sitio donde una
 * pasada editorial la mueve.
 *
 * EXCEPCIONES, y por qué cada una es legítima: son fechas que responden a otra
 * pregunta y NO deben moverse con la revisión del corpus.
 * ────────────────────────────────────────────────────────────────────────── */

const EXCEPCIONES = new Map([
  // Afirma que el DOCUMENTO cambió, no que alguien lo miró. Moverla con cada
  // pasada le diría al usuario que su política de privacidad se modificó.
  ['PRIVACIDAD_ACTUALIZADA', 'fecha de cambio del documento, no de revisión'],
  // Es la revisión de escritorio de los PROVEEDORES de software, un trabajo
  // distinto del contraste del corpus legal. Sube cuando se vuelvan a mirar.
  ['FECHA_REVISION_SOFTWARE', 'revisión de proveedores, no del corpus'],
]);

/** Nombres que prometen «esto se revisó tal día». */
const SOSPECHOSOS = /\b(?:const|let)\s+([A-Z_]*(?:ACTUALIZAD|REVISAD|REVISION|CONSULTAD)[A-Z_]*)\s*=\s*'(\d{4}-\d{2}-\d{2})'/g;

function archivosFuente(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) return archivosFuente(ruta);
    return /\.tsx?$/.test(e.name) && !/\.test\./.test(e.name) ? [ruta] : [];
  });
}

describe('fechas de revisión declaradas', () => {
  it('ninguna página fija su fecha de revisión a mano', () => {
    const raiz = join(import.meta.dirname, '..');
    const infracciones: string[] = [];

    for (const archivo of archivosFuente(raiz)) {
      const texto = readFileSync(archivo, 'utf8');
      for (const [, nombre, fecha] of texto.matchAll(SOSPECHOSOS)) {
        if (EXCEPCIONES.has(nombre!)) continue;
        infracciones.push(
          `${archivo.slice(raiz.length + 1)}: ${nombre} = '${fecha}' — derívala de ULTIMA_REVISION, o añádela a EXCEPCIONES explicando a qué pregunta responde.`,
        );
      }
    }

    expect(infracciones, infracciones.join('\n')).toEqual([]);
  });

  it('las excepciones no se adelantan a la revisión del corpus', () => {
    // Una excepción con fecha POSTERIOR a la última revisión significa que se
    // afirmó algo sobre un día en que nadie miró las fuentes.
    for (const [, motivo] of EXCEPCIONES) expect(motivo).toBeTruthy();
    expect(datos.ULTIMA_REVISION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
