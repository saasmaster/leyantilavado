import coreWebVitals from 'eslint-config-next/core-web-vitals';
import next from 'eslint-config-next';

/**
 * Configuración plana nativa.
 *
 * NO se usa `FlatCompat`: con eslint 9.39 revienta con
 * "TypeError: Converting circular structure to JSON" al serializar la config
 * heredada. eslint-config-next 16 ya exporta configs planas, así que el puente
 * de compatibilidad sobra y sólo aporta el crash.
 *
 * Importa: es aquí donde vive `react-hooks/purity`, la regla que detecta
 * `new Date()` durante el render. `tsc` no la ve. Si esta config no corre,
 * ese error llega a producción.
 */
export default [
  ...next,
  ...coreWebVitals,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'e2e/**',
      'public/sw.js',
      'next-env.d.ts',
    ],
  },
];
