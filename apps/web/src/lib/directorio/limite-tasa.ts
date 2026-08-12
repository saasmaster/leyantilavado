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
export function ipDeSolicitud(cabeceras: Headers): string {
  const reenviada = cabeceras.get('x-forwarded-for');
  if (reenviada) return reenviada.split(',')[0]?.trim() || 'desconocida';
  return cabeceras.get('x-real-ip')?.trim() || 'desconocida';
}
