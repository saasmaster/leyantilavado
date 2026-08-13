import { NextResponse } from 'next/server';
import { ipDeSolicitud } from '@/lib/directorio/limite-tasa';
import { tokenDe, verificarTurnstile } from '@/lib/turnstile';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { ACTIVIDAD_SLUGS } from '@leyantilavado/types';

/**
 * Alta al boletín de cambios normativos.
 *
 * Reglas de este endpoint:
 *  1. El correo NUNCA se escribe en un log, ni en el mensaje de error, ni en
 *     la respuesta. Es un dato personal y el aviso de privacidad promete que
 *     sólo se usa para enviar el boletín.
 *  2. El consentimiento es explícito: una casilla que llega en `false` es un
 *     rechazo, no un descuido que podamos "asumir".
 *  3. Los errores dicen qué corregir. "Solicitud inválida" no le sirve a nadie.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ── Validación ───────────────────────────────────────────────────────────── */

const TEXTO_CONSENTIMIENTO =
  'Acepto recibir avisos por correo cuando cambie la normativa o el valor de la UMA, y he leído el aviso de privacidad.';

const Esquema = z.object({
  correo: z
    .string({ required_error: 'Escribe tu correo electrónico.' })
    .trim()
    .min(1, 'Escribe tu correo electrónico.')
    .max(254, 'El correo es demasiado largo.')
    .email('Ese correo no tiene un formato válido. Revísalo e inténtalo de nuevo.'),
  consentimiento: z.literal(true, {
    errorMap: () => ({
      message:
        'Necesitamos tu consentimiento expreso para escribirte. Marca la casilla si quieres suscribirte.',
    }),
  }),
  actividad: z.enum(ACTIVIDAD_SLUGS).optional(),
  /** De qué página vino el alta. Sirve para medir, no identifica a nadie. */
  origen: z.string().trim().max(120).optional(),
});

export interface Suscriptor {
  correo: string;
  actividad?: string;
  origen?: string;
  consentimiento: true;
  textoConsentimiento: string;
  creadoEn: string;
}

/* ── Límite de tasa en memoria ────────────────────────────────────────────────
   Ventana deslizante por IP. Vive en el proceso: con varias instancias cada
   una lleva su propia cuenta, lo cual basta para frenar un formulario abierto
   al público en esta fase.
   ponytail: contador en memoria; mover a Redis o a Supabase cuando haya más
   de una instancia y el abuso lo justifique.
   ─────────────────────────────────────────────────────────────────────────── */

const VENTANA_MS = 10 * 60 * 1000;
const MAX_POR_VENTANA = 5;

const intentos = new Map<string, number[]>();

function excedeLimite(ip: string, ahora: number): boolean {
  const previos = (intentos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);

  if (previos.length >= MAX_POR_VENTANA) {
    intentos.set(ip, previos);
    return true;
  }

  previos.push(ahora);
  intentos.set(ip, previos);

  // Poda perezosa: sin esto el Map crece sin límite en un proceso longevo.
  if (intentos.size > 5_000) {
    for (const [clave, marcas] of intentos) {
      if (marcas.every((t) => ahora - t >= VENTANA_MS)) intentos.delete(clave);
    }
  }

  return false;
}

/* ── Persistencia ─────────────────────────────────────────────────────────────
   TODO(supabase): sustituir el cuerpo de `guardarSuscriptor` por un insert en
   la tabla `newsletter_suscriptores` con RLS (sólo `service_role` escribe) y
   un índice único sobre el correo normalizado. La firma no cambia, así que el
   resto del endpoint no se toca.
   ─────────────────────────────────────────────────────────────────────────── */

const ARCHIVO = path.join(process.cwd(), '.data', 'newsletter.json');

/** Serializa los escritos: dos altas simultáneas no pueden pisarse el archivo. */
let cola: Promise<unknown> = Promise.resolve();

async function guardarSuscriptor(suscriptor: Suscriptor): Promise<'creado' | 'ya_existia'> {
  const tarea = cola.then(async (): Promise<'creado' | 'ya_existia'> => {
    await mkdir(path.dirname(ARCHIVO), { recursive: true });

    let actuales: Suscriptor[] = [];
    try {
      const crudo = await readFile(ARCHIVO, 'utf8');
      const analizado: unknown = JSON.parse(crudo);
      if (Array.isArray(analizado)) actuales = analizado as Suscriptor[];
    } catch (error) {
      const codigo = (error as NodeJS.ErrnoException).code;
      // Archivo inexistente = primera alta. Cualquier otra cosa sí es un fallo.
      if (codigo !== 'ENOENT') throw error;
    }

    if (actuales.some((s) => s.correo === suscriptor.correo)) return 'ya_existia';

    actuales.push(suscriptor);
    await writeFile(ARCHIVO, `${JSON.stringify(actuales, null, 2)}\n`, 'utf8');
    return 'creado';
  });

  cola = tarea.catch(() => undefined);
  return tarea;
}

/* ── Handler ──────────────────────────────────────────────────────────────── */

export async function POST(request: Request) {
  const ahora = Date.now();

  if (excedeLimite(ipDeSolicitud(request.headers), ahora)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Demasiados intentos desde esta conexión. Espera unos minutos y vuelve a probar.',
      },
      { status: 429, headers: { 'Retry-After': String(VENTANA_MS / 1000) } },
    );
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No pudimos leer el formulario. Vuelve a enviarlo.' },
      { status: 400 },
    );
  }

  // Misma posición que en el resto de formularios: después del límite de tasa
  // y antes de validar el esquema.
  const turnstile = await verificarTurnstile(tokenDe(cuerpo), ipDeSolicitud(request.headers));
  if (!turnstile.ok) {
    return NextResponse.json({ ok: false, error: turnstile.error }, { status: 403 });
  }

  const analizado = Esquema.safeParse(cuerpo);
  if (!analizado.success) {
    const campos: Record<string, string> = {};
    for (const problema of analizado.error.issues) {
      const campo = String(problema.path[0] ?? 'formulario');
      campos[campo] ??= problema.message;
    }
    return NextResponse.json(
      { ok: false, error: 'Revisa los datos marcados.', campos },
      { status: 400 },
    );
  }

  const { correo, consentimiento, actividad, origen } = analizado.data;

  const suscriptor: Suscriptor = {
    correo: correo.toLowerCase(),
    ...(actividad ? { actividad } : {}),
    ...(origen ? { origen } : {}),
    consentimiento,
    textoConsentimiento: TEXTO_CONSENTIMIENTO,
    creadoEn: new Date(ahora).toISOString(),
  };

  try {
    const resultado = await guardarSuscriptor(suscriptor);
    return NextResponse.json({
      ok: true,
      estado: resultado,
      mensaje:
        resultado === 'creado'
          ? 'Listo. Te escribiremos cuando cambie la normativa o el valor de la UMA.'
          : 'Ese correo ya estaba suscrito. No hicimos ningún cambio.',
    });
  } catch {
    // Deliberadamente sin `console.error(correo)`: el correo no entra a un log.
    return NextResponse.json(
      {
        ok: false,
        error: 'No pudimos guardar tu suscripción en este momento. Inténtalo de nuevo más tarde.',
      },
      { status: 500 },
    );
  }
}
