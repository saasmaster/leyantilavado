const enDesarrollo = process.env.NODE_ENV !== 'production';

/**
 * Content Security Policy.
 *
 * ── Sobre `script-src 'unsafe-inline'` ──────────────────────────────────────
 *
 * Es una decisión consciente, con un costo medido. El intento anterior fue
 * listar el hash SHA-256 del único script propio del sitio (el que aplica el
 * tema antes del primer pintado) y omitir `'unsafe-inline'`. Falló, y por una
 * razón que no se puede rodear con hashes:
 *
 *   Next inyecta sus PROPIOS scripts en línea para hidratar y para transmitir
 *   el payload RSC (`self.__next_f.push(...)`). Su contenido cambia por página
 *   y por build, así que ningún hash fijo los cubre. La suite e2e lo detectó:
 *   45 rutas con la hidratación bloqueada en el build de producción.
 *
 * La alternativa fuerte es un nonce por petición. Pero un nonce distinto en
 * cada respuesta es incompatible con el HTML pre-generado: obligaría a
 * renderizar las 172 páginas de forma dinámica y este sitio de contenido
 * perdería justo lo que lo hace rápido y barato de servir.
 *
 * Se elige conservar la generación estática. La superficie de riesgo real que
 * queda es acotada: el sitio no renderiza HTML de terceros, no tiene contenido
 * generado por usuarios en las páginas públicas, y el resto de la política
 * sigue cerrada (`object-src 'none'`, `base-uri 'self'`, `frame-ancestors
 * 'none'`, `form-action 'self'`, sin destinos externos en `connect-src`).
 *
 * Camino de mejora si algún día se justifica: middleware que genere el nonce,
 * `export const dynamic = 'force-dynamic'` en las rutas que lo necesiten, y
 * dejar estáticas las de contenido puro.
 *
 * `style-src` conserva `'unsafe-inline'` por motivo distinto: React inserta
 * estilos en línea para las animaciones de Framer Motion y para las variables
 * de `next/font`.
 */
/**
 * Turnstile es el ÚNICO origen externo que la CSP permite, y sólo cuando está
 * configurado. Se abre lo mínimo que exige: el script del widget, el iframe
 * donde corre el reto y la llamada de verificación. Nada más, y en particular
 * ningún `connect-src` abierto para analítica de terceros.
 *
 * Si no hay llave, las directivas no se agregan y la CSP queda tan cerrada
 * como estaba: no se abre un agujero para una función que no está en uso.
 */
const conTurnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const CF = 'https://challenges.cloudflare.com';

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${enDesarrollo ? " 'unsafe-eval'" : ''}${conTurnstile ? ` ${CF}` : ''}`,
  "style-src 'self' 'unsafe-inline'",
  // next/font descarga las tipografías en build y las sirve desde el origen.
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  // Sin destinos externos: el sitio no envía datos a terceros.
  `connect-src 'self'${enDesarrollo ? ' ws: wss:' : ''}${conTurnstile ? ` ${CF}` : ''}`,
  ...(conTurnstile ? [`frame-src ${CF}`] : ["frame-src 'none'"]),
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@leyantilavado/rules-engine', '@leyantilavado/types', '@leyantilavado/ui'],
  poweredByHeader: false,

  /**
   * Salida autocontenida SÓLO al empaquetar (`EMPAQUETAR=1`).
   *
   * Los dos despliegues necesitan cosas distintas:
   *
   *   · GitHub → ServerAvatar clona, corre `npm ci && npm run build` y arranca
   *     con `next start`. Ahí `node_modules` ya está en el servidor y la salida
   *     autocontenida sobra; peor aún, `next start` no es el arranque previsto
   *     para ella.
   *   · ZIP por SFTP → no hay `npm install` en el servidor, así que el paquete
   *     tiene que traer su propio `server.js` con las dependencias mínimas.
   *
   * Por eso es condicional y no fija.
   */
  ...(process.env.EMPAQUETAR === '1'
    ? {
        output: 'standalone',
        // El monorepo vive dos niveles arriba: sin esto el rastreo de
        // dependencias se queda en apps/web y el paquete sale incompleto.
        outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
      }
    : {}),
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Aísla el sitio de ventanas abiertas por terceros.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        // Nada de lo que el usuario captura debe terminar en un buscador.
        source: '/:path(panel|admin|entrar|registro|recuperar)/:rest*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        // Las respuestas de la API nunca se cachean en intermediarios.
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
