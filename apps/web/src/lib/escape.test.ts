import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { jsonParaScript } from './sitio';

/* ────────────────────────────────────────────────────────────────────────────
 * Escape de JSON dentro de <script>.
 *
 * Esto no es una prueba de formato: es la que impide un XSS almacenado.
 *
 * El alta del directorio publica el perfil de inmediato, sin autenticar, y
 * `nombre` y `biografia` sólo validaban longitud. Como `JSON.stringify` no
 * escapa `<`, una biografía con `</script><script>…` salía del bloque de datos
 * estructurados y se ejecutaba en cada visita a esa ficha. La CSP no lo
 * detenía —`script-src` lleva `'unsafe-inline'` documentado— y el código corría
 * en el mismo origen que el área privada, con acceso a la sesión de quien
 * mirara el perfil.
 *
 * La última prueba recorre el árbol de archivos porque el agujero se reabre
 * escribiendo `JSON.stringify` en un `dangerouslySetInnerHTML` nuevo, y eso no
 * lo detecta ninguna prueba de comportamiento.
 * ────────────────────────────────────────────────────────────────────────── */

describe('jsonParaScript', () => {
  it('neutraliza el cierre de etiqueta, que es el vector real', () => {
    const salida = jsonParaScript({ bio: 'Despacho</script><script>alert(1)</script>' });
    expect(salida).not.toContain('</script');
    expect(salida).toContain('\\u003c');
  });

  it('lo neutraliza también sin la barra y con mayúsculas', () => {
    // El analizador de HTML no distingue mayúsculas y no necesita `/`.
    for (const carga of ['<SCRIPT>', '</SCRIPT >', '<!--', '<img src=x onerror=1>']) {
      expect(jsonParaScript({ v: carga })).not.toContain('<');
    }
  });

  it('escapa los separadores de línea que rompen un literal de JavaScript', () => {
    // U+2028 y U+2029 son JSON válido e ilegales dentro de un literal JS.
    const salida = jsonParaScript({ v: 'a b c' });
    expect(salida).not.toContain(' ');
    expect(salida).not.toContain(' ');
  });

  it('el resultado sigue siendo JSON válido y equivalente', () => {
    // El escape no puede cambiar el dato: un buscador tiene que leer lo mismo.
    const original = {
      nombre: 'Despacho <Norte> & Asociados',
      nota: 'Comparación: 5 < 10 y "comillas"',
      lista: ['a', 'b'],
      anidado: { profundo: true, n: 1.5 },
    };
    expect(JSON.parse(jsonParaScript(original))).toEqual(original);
  });

  it('no rompe con acentos ni emoji', () => {
    const v = { v: 'identificación · beneficiario 🇲🇽' };
    expect(JSON.parse(jsonParaScript(v))).toEqual(v);
  });

  it('ningún JSON-LD del sitio usa JSON.stringify sin escapar', () => {
    const raiz = path.join(process.cwd(), 'src');
    const pendientes: string[] = [];

    const recorrer = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
          recorrer(p);
          continue;
        }
        // Se excluyen las pruebas: este mismo archivo contiene el patrón
        // dentro de su expresión regular y se delataría a sí mismo.
        if (!/\.tsx?$/.test(e.name) || /\.test\.tsx?$/.test(e.name)) continue;
        const fuente = readFileSync(p, 'utf8');
        // `__html: JSON.stringify(` es exactamente la forma del bug.
        if (/__html:\s*JSON\.stringify\(/.test(fuente)) {
          pendientes.push(path.relative(raiz, p));
        }
      }
    };
    recorrer(raiz);

    expect(
      pendientes,
      `Estos archivos incrustan JSON sin escapar en un <script>. Usa jsonParaScript: ${pendientes.join(', ')}`,
    ).toEqual([]);
  });
});
