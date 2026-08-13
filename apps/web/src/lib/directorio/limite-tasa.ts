/* ────────────────────────────────────────────────────────────────────────────
 * Límite de tasa en memoria, por IP.
 *
 * ponytail: un Map en el proceso. Se reinicia con el servidor y no se comparte
 * entre instancias — techo conocido y aceptable mientras corre una sola. Al
 * pasar a varias instancias, el reemplazo natural es Redis o el rate limit del
 * borde (Cloudflare), no una versión más lista de esto.
 *
 * La IP se guarda como clave efímera de conteo. No se escribe en disco, no se
 * registra en logs y no se asocia a ningún dato personal.
 * ────────────────────────────────────────────────────────────────────────── */

const ventanas = new Map<string, number[]>();

export interface ResultadoLimite {
  permitido: boolean;
  /** Segundos que faltan para poder reintentar. */
  esperaSegundos: number;
}

export function limitarPorIP(
  clave: string,
  { maximo, ventanaMs }: { maximo: number; ventanaMs: number },
  ahoraMs: number = Date.now(),
): ResultadoLimite {
  const previas = ventanas.get(clave) ?? [];
  const vigentes = previas.filter((t) => ahoraMs - t < ventanaMs);

  if (vigentes.length >= maximo) {
    const masAntigua = vigentes[0] ?? ahoraMs;
    ventanas.set(clave, vigentes);
    return {
      permitido: false,
      esperaSegundos: Math.max(1, Math.ceil((ventanaMs - (ahoraMs - masAntigua)) / 1000)),
    };
  }

  vigentes.push(ahoraMs);
  ventanas.set(clave, vigentes);

  // Barrido perezoso: sin esto el Map crece sin límite con IPs de una sola visita.
  if (ventanas.size > 5000) {
    for (const [k, marcas] of ventanas) {
      if (marcas.every((t) => ahoraMs - t >= ventanaMs)) ventanas.delete(k);
    }
  }

  return { permitido: true, esperaSegundos: 0 };
}

/**
 * IP del solicitante. Detrás de proxy llega en `x-forwarded-for`; el primer
 * elemento es el cliente. Nunca se registra en logs ni se persiste.
 */
/**
 * IP del cliente para el límite de tasa.
 *
 * NO se toma el primer elemento de `X-Forwarded-For`. Los proxies AÑADEN la IP
 * real al final de esa cabecera; el primer elemento es literalmente lo que
 * mandó el cliente. Bastaba con enviar una IP distinta en cada petición para
 * caer siempre en un cubo nuevo y no alcanzar nunca el límite —lo que dejaba
 * la puerta pública que escribe en disco sin ningún techo efectivo—.
 *
 * `cf-connecting-ip` y `x-real-ip` las escribe el proxy y el cliente no las
 * puede falsear. Si no hay ninguna, se agrupa todo bajo una clave común: es
 * restrictivo de más, y ése es el lado correcto por el que equivocarse en un
 * control antiabuso.
 */
export function ipDeSolicitud(cabeceras: Headers): string {
  const deProxy = cabeceras.get('cf-connecting-ip') ?? cabeceras.get('x-real-ip');
  if (deProxy?.trim()) return deProxy.trim();
  return cabeceras.get('x-real-ip')?.trim() || 'desconocida';
}
