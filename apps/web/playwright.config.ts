import { defineConfig, devices } from '@playwright/test';

const PUERTO = 5400;
const BASE = `http://127.0.0.1:${PUERTO}`;

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

  webServer: {
    // Se prueba contra el build de producción: es donde aparecen los errores
    // que `next dev` esconde (prerender, purity de hooks, RSC).
    command: 'npm run build && npm run start',
    url: BASE,
    reuseExistingServer: !process.env['CI'],
    timeout: 300_000,
  },
});
