import { defineConfig } from 'vitest/config';

/**
 * Vitest para las pruebas unitarias de la app web.
 *
 * `include` acota a `*.test.ts` dentro de `src/`, y `exclude` deja fuera
 * `e2e/`. Sin eso, vitest recoge los `*.spec.ts` de Playwright, falla al
 * colectarlos —importan `@playwright/test`, que no corre bajo vitest— y
 * `npm run test` se cae por un motivo que no tiene nada que ver con el código.
 *
 * Los dos arneses conviven a propósito: vitest prueba lógica pura y Playwright
 * prueba el sitio construido. Se distinguen por extensión, no por carpeta.
 */
export default defineConfig({
  resolve: {
    alias: {
      // El alias `@/` lo resuelve Next, no vitest. Sin esto, cualquier módulo
      // probado que importe con `@/` falla al cargar —y falla en el arranque
      // del archivo, así que el suite entero desaparece del recuento sin que
      // nada diga «falló»: sólo salen menos pruebas que antes.
      '@': new URL('./src', import.meta.url).pathname,
      // `server-only` es un centinela que Next resuelve durante el build para
      // romper la compilación si un módulo de servidor acaba en un bundle de
      // cliente. Fuera de Next el paquete no existe, así que sin este alias
      // vitest no puede ni cargar los módulos que lo declaran —que son
      // justamente los que tocan disco y más falta hace probar—.
      'server-only': new URL('./src/pruebas/server-only.ts', import.meta.url).pathname,
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', '.next/**', 'e2e/**'],
  },
});
