import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MATRIZ_PERMISOS, type Permiso, type RolOrganizacion } from '@leyantilavado/types';

/* ────────────────────────────────────────────────────────────────────────────
 * La matriz de permisos no es una frontera. Esta prueba sí.
 *
 * `navegacion.ts` declara un permiso por enlace, y ese dato decide si el
 * enlace se DIBUJA en el menú. Durante un tiempo eso fue todo lo que había:
 * escribir `/panel/exportaciones` en la barra de direcciones entregaba la
 * página entera, con su botón de descarga, a un rol sin
 * `documentos.descargar`. RLS seguía filtrando filas, pero «la base de datos
 * lo tapa» no es una autorización.
 *
 * El agujero es fácil de reabrir: basta con añadir una página nueva al menú
 * con su permiso y olvidarse de exigirlo en el componente. Por eso esto se
 * comprueba leyendo el código fuente, no llamando a las funciones: lo que hay
 * que garantizar es que NADIE escriba una página gateada sin frontera, y eso
 * es una propiedad del árbol de archivos.
 * ────────────────────────────────────────────────────────────────────────── */

const RAIZ = process.cwd();
const NAV = readFileSync(path.join(RAIZ, 'src/components/app/navegacion.ts'), 'utf8');

/** Enlaces del panel que declaran permiso, tal como los lee la navegación. */
const GATEADAS = [...NAV.matchAll(/href: '\/panel\/([^']*)'[^}]*permiso: '([^']*)'/g)].map(
  (m) => ({ ruta: m[1] as string, permiso: m[2] as Permiso }),
);

describe('frontera de autorización del panel', () => {
  it('la navegación declara permisos que existen en la matriz', () => {
    expect(GATEADAS.length).toBeGreaterThan(0);
    const conocidos = new Set(Object.values(MATRIZ_PERMISOS).flat());
    for (const { ruta, permiso } of GATEADAS) {
      expect(conocidos.has(permiso), `${ruta} declara «${permiso}», que no existe`).toBe(true);
    }
  });

  it.each(GATEADAS)('/panel/$ruta exige $permiso en el servidor', ({ ruta, permiso }) => {
    const archivo = path.join(RAIZ, 'src/app/(app)/panel', ruta, 'page.tsx');
    const fuente = readFileSync(archivo, 'utf8');

    expect(
      fuente.includes(`requerirPermiso('${permiso}'`),
      `/panel/${ruta} aparece en el menú tras «${permiso}» pero su page.tsx no lo exige. ` +
        'El menú es presentación: sin requerirPermiso, cualquiera con sesión llega por URL.',
    ).toBe(true);
  });

  it('ninguna página gateada se conforma con requerirContexto a secas', () => {
    for (const { ruta } of GATEADAS) {
      const fuente = readFileSync(
        path.join(RAIZ, 'src/app/(app)/panel', ruta, 'page.tsx'),
        'utf8',
      );
      // `requerirContexto` sigue siendo correcto para páginas sin permiso
      // declarado; en una gateada es exactamente el bug que hubo.
      expect(
        /\brequerirContexto\(/.test(fuente),
        `/panel/${ruta} llama a requerirContexto, que sólo comprueba que haya sesión`,
      ).toBe(false);
    }
  });

  it('el rol de menor privilegio no acumula permisos por accidente', () => {
    // Guarda de cordura sobre la matriz: si algún día `consulta` acaba con
    // permisos de escritura o de descarga, esta prueba lo dice antes que un
    // auditor.
    const consulta: readonly Permiso[] = MATRIZ_PERMISOS['consulta' as RolOrganizacion] ?? [];
    const prohibidos = consulta.filter(
      (p) => p.includes('.descargar') || p.includes('.crear') || p.includes('.editar'),
    );
    expect(prohibidos, `«consulta» no debería poder ${prohibidos.join(', ')}`).toEqual([]);
  });
});
