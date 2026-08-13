import { defineConfig, devices } from '@playwright/test';

const PUERTO = 5400;

/**
 * `E2E_BASE` apunta la suite a un sitio ya servido; sin ella, a localhost.
 *
 * Existe porque este proyecto se despliega a mano: ServerAvatar hace `git pull`
 * pero no compila, así que cada publicación termina en un `npm run build` por
 * SSH. Un contrato que sólo sabe probar `localhost` verifica justamente la
 * máquina donde el fallo no ocurre. Con esto, comprobar producción tras
 * desplegar es:
 *
 *     E2E_BASE=https://leyantilavado.org npx playwright test
 *
 * Cuando se fija, no se levanta servidor: el sitio ya está en pie y arrancar
 * uno local haría que Playwright probara ése por error.
 */
const EXTERNA = process.env['E2E_BASE'];
const BASE = EXTERNA ?? `http://127.0.0.1:${PUERTO}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 2 : 4,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 7_000 },

  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
  },

  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'movil', use: { ...devices['Pixel 7'] } },
  ],

  ...(EXTERNA
    ? {}
    : {
        webServer: {
          // Se prueba contra el build de producción: es donde aparecen los
          // errores que `next dev` esconde (prerender, purity de hooks, RSC).
          command: 'npm run build && npm run start',
          url: BASE,
          reuseExistingServer: !process.env['CI'],
          timeout: 300_000,
        },
      }),
});
