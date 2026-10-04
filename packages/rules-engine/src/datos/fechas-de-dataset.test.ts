import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/* ────────────────────────────────────────────────────────────────────────────
 * La fecha de un dataset es la de SU último cambio, no la del corpus.
 *
 * `ULTIMA_MODIFICACION` sube cuando cambia cualquier dato. Un dataset que la
 * usa como fecha propia se anuncia como modificado cada vez que cambia OTRO:
 * así salieron el conversor de UMA y las 19 fichas de obligaciones con fecha
 * del 4-oct-2026 por un cambio que fue del calendario. En el sitemap eso es
 * decirle a un buscador que cambió una página que nadie tocó.
 * ────────────────────────────────────────────────────────────────────────── */

describe('fechas de modificación por dataset', () => {
  it('ningún dataset usa la constante del corpus como fecha propia', () => {
    const dir = import.meta.dirname;
    const infractores = readdirSync(dir)
      .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && f !== 'revision.ts')
      .filter((f) => /ultimaModificacion:\s*ULTIMA_MODIFICACION\b/.test(readFileSync(join(dir, f), 'utf8')));
    expect(infractores, 'usa un literal con la fecha del último cambio de ESE fichero').toEqual([]);
  });
});
