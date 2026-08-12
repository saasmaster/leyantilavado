import 'server-only';

/**
 * Verificación de Cloudflare Turnstile.
 *
 * Turnstile va en lugar de un captcha visual porque este sitio se usa desde el
 * mostrador de una joyería y desde la recepción de una notaría, muchas veces
 * con prisa: obligar a señalar semáforos en fotos borrosas costaría más altas
 * legítimas de las que evitaría de spam.
 *
 * ── Cómo se comporta cuando no hay llaves ──────────────────────────────────
 *
 * Si las variables no están configuradas, la verificación se salta y los
 * formularios siguen funcionando. Es deliberado: el sitio se publicó antes de
 * que existieran las llaves, y un despliegue sin ellas no debe dejar el
 * formulario de contacto muerto, que es la única vía para reportar un error en
 * un dato legal.
 *
 * El riesgo de esa decisión es que alguien crea que hay protección donde no la
 * hay, así que `estaConfigurado()` existe para que el arranque pueda decirlo,
 * y en producción se registra una advertencia una sola vez.
 *
 * Para activarlo:
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY=...   (pública, viaja al navegador)
 *   TURNSTILE_SECRET_KEY=...             (secreta, sólo servidor)
 */

const PUNTO_VERIFICACION = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function estaConfigurado(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

let yaAdvertido = false;

export interface ResultadoTurnstile {
  ok: boolean;
  /** Mensaje para el usuario. Nunca expone los códigos de Cloudflare. */
  error?: string;
}

/**
 * @param token  Valor de `cf-turnstile-response` que envía el widget.
 * @param ip     IP del cliente, si el llamador la tiene. Mejora la precisión.
 */
export async function verificarTurnstile(
  token: string | undefined,
  ip?: string | undefined,
): Promise<ResultadoTurnstile> {
  const secreto = process.env.TURNSTILE_SECRET_KEY;

  if (!secreto) {
    if (!yaAdvertido && process.env.NODE_ENV === 'production') {
      yaAdvertido = true;
      console.warn(
        '[turnstile] TURNSTILE_SECRET_KEY no está configurada: los formularios se aceptan sin verificación antibot.',
      );
    }
    return { ok: true };
  }

  if (!token) {
    return { ok: false, error: 'No se completó la verificación. Recarga la página e inténtalo otra vez.' };
  }

  const cuerpo = new URLSearchParams({ secret: secreto, response: token });
  if (ip) cuerpo.set('remoteip', ip);

  try {
    // Un formulario que se queda colgado esperando a Cloudflare es peor que
    // uno sin captcha: el usuario reintenta y duplica el envío.
    const respuesta = await fetch(PUNTO_VERIFICACION, {
      method: 'POST',
      body: cuerpo,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });

    const datos = (await respuesta.json()) as { success?: boolean };
    return datos.success
      ? { ok: true }
      : {
          ok: false,
          error: 'No pudimos verificar que seas una persona. Recarga la página e inténtalo otra vez.',
        };
  } catch {
    // Cloudflare caído o red lenta. Se deja pasar a propósito: perder un
    // reporte de un error en un dato legal cuesta más que colar un envío
    // automatizado, que además todavía tiene que pasar el límite de tasa.
    console.warn('[turnstile] la verificación no respondió; se acepta el envío');
    return { ok: true };
  }
}

/** Extrae el token del cuerpo de un formulario o de un JSON. */
export function tokenDe(cuerpo: unknown): string | undefined {
  if (cuerpo instanceof FormData) {
    const v = cuerpo.get('cf-turnstile-response');
    return typeof v === 'string' ? v : undefined;
  }
  if (cuerpo && typeof cuerpo === 'object') {
    const v = (cuerpo as Record<string, unknown>)['cf-turnstile-response'];
    return typeof v === 'string' ? v : undefined;
  }
  return undefined;
}
