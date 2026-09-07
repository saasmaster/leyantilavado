import { APP_ID_IOS, RUTAS_ENLACE_UNIVERSAL } from '@/content/ios';

/**
 * `apple-app-site-association` — Universal Links de la app de iOS.
 *
 * ── Por qué es una ruta y no un archivo en `public/` ───────────────────────
 *
 * Apple exige este archivo **sin extensión** y servido como
 * `application/json`. Un archivo estático sin extensión no lleva tipo MIME
 * fiable, y si sale como `text/plain` o `application/octet-stream` iOS lo
 * descarta. Una ruta lo fija explícitamente y deja de depender del servidor.
 *
 * ── Por qué importa que exista ─────────────────────────────────────────────
 *
 * Con `applinks` en los entitlements, iOS descarga este archivo al instalar y
 * comprueba que el sitio autoriza a esa app. Si no está —y **no lo estaba: daba
 * 404**— la verificación falla EN SILENCIO: los enlaces a leyantilavado.org/app
 * abren Safari en vez de la app, sin error en el teléfono ni en el sitio. Es
 * exactamente el mismo fallo mudo que ya tuvo `assetlinks.json` en Android.
 *
 * Apple no sigue redirecciones aquí, así que la ruta responde directamente.
 */
export const dynamic = 'force-static';

export function GET() {
  const documento = {
    applinks: {
      details: [{ appID: APP_ID_IOS, paths: RUTAS_ENLACE_UNIVERSAL }],
    },
  };

  return new Response(JSON.stringify(documento, null, 2), {
    headers: {
      'content-type': 'application/json',
      // Se cachea, pero no tanto como para que corregir una huella tarde días
      // en llegar a los teléfonos.
      'cache-control': 'public, max-age=3600',
    },
  });
}
