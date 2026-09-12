import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARTICULOS, CON_PAGINA, PRECEPTOS, PRECEPTO_POR_SLUG, sumilla } from './ley';

/* ────────────────────────────────────────────────────────────────────────────
 * Contrato de la capa /ley.
 *
 * Tres cosas que un error silencioso rompería sin que el build se queje:
 * que el texto oficial esté completo, que cada página editorial tenga su
 * precepto, y que ningún enlace mande a una ruta inexistente —que es como se
 * pierde un lector y como un rastreador anota un 404 contra el sitio—.
 * ────────────────────────────────────────────────────────────────────────── */

const APP = join(import.meta.dirname, '..', 'app');

/** ¿Existe una página para esta ruta? Resuelve segmentos `[slug]` contra sus catálogos. */
function rutaExiste(href: string): boolean {
  const limpia = href.split('#')[0]!.replace(/\/$/, '');
  if (limpia.startsWith('/ley/')) return CON_PAGINA.has(limpia.slice(5));
  const segmentos = limpia.split('/').filter(Boolean);
  let dir = APP;
  for (const seg of segmentos) {
    if (existsSync(join(dir, seg))) {
      dir = join(dir, seg);
      continue;
    }
    // Segmento dinámico: basta con que el directorio tenga un `[algo]`.
    const dinamico = readdirSync(dir).find((d) => /^\[[^.]+\]$/.test(d));
    if (!dinamico) return false;
    dir = join(dir, dinamico);
  }
  return existsSync(join(dir, 'page.tsx'));
}

describe('texto oficial extraído', () => {
  it('contiene la ley completa: 65 artículos numerados más sus Bis, Ter y Quáter', () => {
    expect(PRECEPTOS.length).toBe(73);
    const numerados = new Set(PRECEPTOS.map((p) => p.numero));
    for (let n = 1; n <= 65; n++) expect(numerados.has(n), `falta el artículo ${n}`).toBe(true);
  });

  it('ningún precepto arrastra encabezados de capítulo ni notas de reforma del DOF', () => {
    for (const p of PRECEPTOS) {
      for (const t of p.parrafos) {
        expect(t, `art. ${p.id}`).not.toMatch(/^(Capítulo|Sección|Título)\s+[IVX]/);
        expect(t, `art. ${p.id}`).not.toMatch(/(reformad|adicionad|derogad)[oa]s?\s+DOF\s+\d{2}-/);
      }
    }
  });

  it('cada precepto abre con su propio encabezado', () => {
    for (const p of PRECEPTOS) expect(p.parrafos[0]).toMatch(new RegExp(`^Artículo ${p.id}\\.`));
  });

  it('la sumilla quita el número y no deja el encabezado', () => {
    for (const p of PRECEPTOS) expect(sumilla(p)).not.toMatch(/^Artículo/);
  });
});

describe('páginas editoriales', () => {
  it.each(ARTICULOS.map((a) => [a.slug, a] as const))('%s tiene su precepto oficial', (slug) => {
    expect(PRECEPTO_POR_SLUG[slug], `no existe ${slug} en el texto extraído`).toBeDefined();
  });

  it.each(ARTICULOS.map((a) => [a.slug, a] as const))(
    '%s sólo declara cambio de 2025 si el DOF registra la reforma',
    (slug, a) => {
      if (a.cambio2025) expect(PRECEPTO_POR_SLUG[slug]!.reformas).toContain('16-07-2025');
    },
  );

  it.each(ARTICULOS.map((a) => [a.slug, a] as const))('%s no enlaza a rutas inexistentes', (_, a) => {
    const rotos = a.relacionados
      .flatMap((g) => g.enlaces)
      .map((e) => e.href)
      .filter((h) => !rutaExiste(h));
    expect(rotos).toEqual([]);
  });
});

describe('definiciones legales del glosario', () => {
  it('cada término que cita el art. 3 resuelve a texto vigente de esa fracción', async () => {
    const { GLOSARIO } = await import('./glosario');
    const { definicionLegal } = await import('./ley');
    const citados = GLOSARIO.filter((t) => t.fraccionArt3);
    expect(citados.length).toBe(9);
    for (const t of citados) {
      const texto = definicionLegal(t.fraccionArt3!);
      expect(texto.length, `${t.slug} → fr. ${t.fraccionArt3}`).toBeGreaterThan(0);
      expect(texto[0]).toMatch(new RegExp(`^${t.fraccionArt3!.replace(' ', '\\s+')}\\.`));
    }
  });

  it('la fracción III arrastra sus incisos y se detiene en la siguiente fracción', async () => {
    const { definicionLegal } = await import('./ley');
    const bc = definicionLegal('III');
    expect(bc.length).toBeGreaterThan(1);
    expect(bc.some((p) => /^III Bis\./.test(p))).toBe(false);
  });
});
