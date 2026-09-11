import { describe, expect, it } from 'vitest';
import {
  ANALISIS,
  CASOS_IVA,
  RESICO,
  excedenteRetencion,
  ivaNormal,
  ivaOpcional,
  puntoDeEquilibrio,
  tasaResico,
} from './analisis';

/* ────────────────────────────────────────────────────────────────────────────
 * Las cuentas de los análisis se prueban, no se confían.
 *
 * El artículo del IVA del 7 % publica un punto de equilibrio y una tabla. Un
 * error ahí no rompe el build ni se ve raro en pantalla: sólo le dice a un
 * contribuyente que le conviene algo que no le conviene, y lo decide para todo
 * el año. Por eso las cifras salen de funciones y las funciones tienen prueba.
 * ────────────────────────────────────────────────────────────────────────── */

describe('IVA opcional del 7 %', () => {
  it('el punto de equilibrio a tasa general es 9/16', () => {
    expect(puntoDeEquilibrio(16)).toBe(0.5625);
  });

  it('con el 8 % fronterizo, el equilibrio baja a 1/8', () => {
    expect(puntoDeEquilibrio(8)).toBe(0.125);
  });

  it('en el punto de equilibrio las dos mecánicas cuestan lo mismo', () => {
    expect(ivaNormal(100_000, 100_000 * puntoDeEquilibrio())).toBe(ivaOpcional(100_000));
  });

  it('calcula sin arrastrar decimales binarios', () => {
    // 0.16 × 90,000 da 14,400.000000000002 en coma flotante.
    expect(ivaNormal(100_000, 10_000)).toBe(14_400);
    expect(ivaNormal(100_000, 70_000)).toBe(4_800);
    expect(ivaOpcional(100_000)).toBe(7_000);
  });

  it('la tabla del artículo tiene un caso a cada lado del equilibrio', () => {
    const difs = CASOS_IVA.map((c) => ivaNormal(c.ventas, c.compras) - ivaOpcional(c.ventas));
    expect(difs.some((d) => d > 0), 'ningún caso donde la opción convenga').toBe(true);
    expect(difs.some((d) => d < 0), 'ningún caso donde la opción cueste más').toBe(true);
    expect(difs).toContain(0);
  });

  it('la retención de 2/3 del IVA supera al 7 % en honorarios cobrados a una moral', () => {
    // 2/3 × 16 % = 10.67 % del valor, contra 7 %: el excedente es 11/300 del valor.
    expect(excedenteRetencion(100_000)).toBeCloseTo(3_666.6667, 3);
  });
});

describe('RESICO: datos del análisis', () => {
  it('el último tramo de la tabla anual coincide con el límite vigente', () => {
    const ultimo = RESICO.tablaAnual[RESICO.tablaAnual.length - 1]!;
    expect(ultimo.hasta).toBe(RESICO.fisicas.limiteVigente);
  });

  it('los tramos y las tasas crecen', () => {
    for (let i = 1; i < RESICO.tablaAnual.length; i++) {
      expect(RESICO.tablaAnual[i]!.hasta).toBeGreaterThan(RESICO.tablaAnual[i - 1]!.hasta);
      expect(RESICO.tablaAnual[i]!.tasa).toBeGreaterThan(RESICO.tablaAnual[i - 1]!.tasa);
    }
  });

  it('la propuesta amplía los límites, no los reduce', () => {
    expect(RESICO.fisicas.limitePropuesto).toBeGreaterThan(RESICO.fisicas.limiteVigente);
    expect(RESICO.morales.limitePropuesto).toBeGreaterThan(RESICO.morales.limiteVigente);
  });
});

describe('RESICO: la escalera de la gráfica', () => {
  const HOY = RESICO.fisicas.limiteVigente;
  const PROPUESTA = RESICO.fisicas.limitePropuesto;

  it('el tope de cada tramo pertenece a ese tramo («hasta»)', () => {
    expect(tasaResico(300_000, HOY)).toBe(0.01);
    expect(tasaResico(300_001, HOY)).toBe(0.011);
    expect(tasaResico(HOY, HOY)).toBe(0.025);
  });

  it('por encima del límite vigente hoy se sale del régimen', () => {
    expect(tasaResico(HOY + 1, HOY)).toBeNull();
  });

  it('la propuesta aplica el último tramo entre los dos límites, y nada más allá', () => {
    expect(tasaResico(4_200_000, PROPUESTA)).toBe(0.025);
    expect(tasaResico(PROPUESTA, PROPUESTA)).toBe(0.025);
    expect(tasaResico(PROPUESTA + 1, PROPUESTA)).toBeNull();
  });

  it('por debajo del límite vigente, hoy y la propuesta dan lo mismo', () => {
    for (let i = 0; i <= HOY; i += 50_000) expect(tasaResico(i, PROPUESTA)).toBe(tasaResico(i, HOY));
  });
});

describe('registro de análisis', () => {
  it('los slugs son únicos', () => {
    const slugs = ANALISIS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(ANALISIS)('$slug: fecha ISO, índice sin ids repetidos y fuentes enlazadas', (a) => {
    expect(a.publicadoEn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const ids = a.indice.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    // «fuentes» lo añade la página: si un cuerpo lo usara también, habría dos anclas iguales.
    expect(ids).not.toContain('fuentes');
    expect(a.fuentes.length).toBeGreaterThan(0);
    for (const f of a.fuentes) expect(f.url).toMatch(/^https:\/\//);
  });

  it.each(ANALISIS)('$slug: se declara como propuesta, no como ley vigente', (a) => {
    // Los tres analizan iniciativas. Si alguno perdiera la etiqueta, la página
    // se leería como si el cambio ya estuviera aprobado.
    expect(a.etiquetas.some((e) => /iniciativa/i.test(e.texto))).toBe(true);
  });
});
