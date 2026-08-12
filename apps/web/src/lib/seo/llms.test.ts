import { describe, expect, it } from 'vitest';
import { datos } from '@leyantilavado/rules-engine';
import { SITIO } from '../sitio';
import { construirLlmsTxt } from './llms';

const texto = construirLlmsTxt();

describe('llms.txt', () => {
  it('respeta la forma que esperan los lectores de llmstxt.org', () => {
    const lineas = texto.split('\n');
    expect(lineas[0]).toBe(`# ${SITIO.nombre}`);
    // El resumen de una línea va como cita, después del H1.
    expect(lineas.some((l) => l.startsWith('> '))).toBe(true);
    expect(texto.endsWith('\n')).toBe(true);
    expect(texto).not.toMatch(/\n{3}/); // sin huecos dobles
  });

  it('publica sólo URL absolutas', () => {
    const rutas = [...texto.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]!);
    expect(rutas.length).toBeGreaterThan(20);
    for (const ruta of rutas) expect(ruta).toMatch(/^https?:\/\//);
  });

  it('cuenta sobre el motor, no sobre texto escrito a mano', () => {
    // Si alguien agrega una fracción al art. 17, esta prueba lo obliga a
    // aparecer en llms.txt sin editar el texto.
    for (const a of datos.ACTIVIDADES_PUBLICABLES) {
      expect(texto).toContain(`${SITIO.url}/actividades-vulnerables/${a.slug}`);
    }
    // Y las no publicables NO deben asomarse.
    const noPublicables = datos.ACTIVIDADES.filter(
      (a) => !datos.ACTIVIDADES_PUBLICABLES.some((p) => p.slug === a.slug),
    );
    for (const a of noPublicables) {
      expect(texto).not.toContain(`/actividades-vulnerables/${a.slug})`);
    }
    expect(texto).toContain(String(datos.UMBRALES_PUBLICADOS.length));
    expect(texto).toContain(String(datos.CALENDARIO.length));
  });

  it('nunca afirma cumplimiento (regla 3 del contrato)', () => {
    // Aparecen sólo dentro de la sección que promete que NO se dicen.
    const prohibidas = /\b(cumples|estás en regla|no tienes obligaciones)\b/gi;
    const apariciones = [...texto.matchAll(prohibidas)];
    const seccionNegativa = texto.slice(texto.indexOf('## Qué NO vas a encontrar aquí'));
    for (const m of apariciones) {
      expect(seccionNegativa).toContain(m[0]);
    }
  });

  it('declara la independencia del proyecto', () => {
    expect(texto).toMatch(/no pertenece ni está\s+afiliad/i);
    expect(texto).toContain('## Fuentes primarias que citamos');
    expect(texto).toContain('## Cómo citarnos');
  });
});
