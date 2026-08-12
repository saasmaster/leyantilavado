import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { erroresPorCampo } from './esquemas';
import { ipDeSolicitud, limitarPorIP } from './limite-tasa';
import { tokenDe, verificarTurnstile } from '@/lib/turnstile';

/* ────────────────────────────────────────────────────────────────────────────
 * Plomería común de las rutas del directorio.
 *
 * Un solo lugar donde se valida, se limita por IP y se responde. Si mañana se
 * añade una quinta ruta, hereda las mismas garantías sin copiarlas.
 *
 * Nada de lo que pasa por aquí se escribe en logs: los cuerpos traen nombres,
 * correos y teléfonos.
 * ────────────────────────────────────────────────────────────────────────── */

export interface Limite {
  maximo: number;
  ventanaMs: number;
}

export const MINUTO = 60_000;
export const HORA = 60 * MINUTO;

export type Procesada<T> =
  | { ok: true; datos: T }
  | { ok: false; respuesta: NextResponse };

export async function procesarSolicitud<T>(
  peticion: Request,
  esquema: z.ZodType<T>,
  ruta: string,
  limite: Limite,
): Promise<Procesada<T>> {
  const { permitido, esperaSegundos } = limitarPorIP(
    `${ruta}:${ipDeSolicitud(peticion.headers)}`,
    limite,
  );

  if (!permitido) {
    return {
      ok: false,
      respuesta: NextResponse.json(
        {
          ok: false,
          error: `Demasiados envíos desde esta conexión. Vuelve a intentarlo en ${esperaSegundos} segundos.`,
        },
        { status: 429, headers: { 'retry-after': String(esperaSegundos) } },
      ),
    };
  }

  let cuerpo: unknown;
  try {
    cuerpo = await peticion.json();
  } catch {
    return {
      ok: false,
      respuesta: NextResponse.json(
        { ok: false, error: 'El cuerpo de la solicitud no es JSON válido.' },
        { status: 400 },
      ),
    };
  }

  // Antibot entre el límite de tasa y la validación del esquema. Antes del
  // límite sería regalar una llamada a Cloudflare por cada intento de
  // inundación; después de validar sería hacer el trabajo de parseo antes de
  // saber si hay alguien del otro lado.
  const turnstile = await verificarTurnstile(
    tokenDe(cuerpo),
    ipDeSolicitud(peticion.headers),
  );
  if (!turnstile.ok) {
    return {
      ok: false,
      respuesta: NextResponse.json({ ok: false, error: turnstile.error }, { status: 403 }),
    };
  }

  const resultado = esquema.safeParse(cuerpo);
  if (!resultado.success) {
    return {
      ok: false,
      respuesta: NextResponse.json(
        { ok: false, errores: erroresPorCampo(resultado.error) },
        { status: 400 },
      ),
    };
  }

  return { ok: true, datos: resultado.data };
}

export function respuestaFolio(folio: string, mensaje: string): NextResponse {
  return NextResponse.json({ ok: true, folio, mensaje }, { status: 201 });
}

/** Error genérico. Nunca devuelve el detalle interno ni registra el cuerpo. */
export function respuestaErrorServidor(): NextResponse {
  return NextResponse.json(
    { ok: false, error: 'No pudimos guardar tu envío. Vuelve a intentarlo en un momento.' },
    { status: 500 },
  );
}
