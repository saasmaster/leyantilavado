import { randomUUID } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  MINUTO,
  procesarSolicitud,
  respuestaErrorServidor,
  respuestaFolio,
} from '@/lib/directorio/api';

/**
 * Contacto general del sitio.
 *
 * Reutiliza el mismo procesamiento que el directorio: validación con zod,
 * límite por IP y errores por campo. La persistencia va a un JSONL en `.data`,
 * igual que el resto, detrás de una función aislada para cambiarla por Supabase
 * sin tocar esta ruta.
 *
 * Nunca se registra el contenido del mensaje ni el correo en un log.
 */

const MOTIVOS = ['correccion', 'directorio', 'datos-personales', 'prensa', 'otro'] as const;

const Esquema = z.object({
  motivo: z.enum(MOTIVOS, {
    errorMap: () => ({ message: 'Elige el motivo de tu mensaje.' }),
  }),
  nombre: z
    .string({ required_error: 'Escribe tu nombre.' })
    .trim()
    .min(2, 'Escribe tu nombre.')
    .max(120, 'El nombre es demasiado largo.'),
  correo: z
    .string({ required_error: 'Escribe tu correo electrónico.' })
    .trim()
    .min(1, 'Escribe tu correo electrónico.')
    .max(254, 'El correo es demasiado largo.')
    .email('Ese correo no tiene un formato válido. Revísalo e inténtalo de nuevo.'),
  mensaje: z
    .string({ required_error: 'Cuéntanos de qué se trata.' })
    .trim()
    .min(20, 'Danos un poco más de detalle: al menos 20 caracteres.')
    .max(4000, 'El mensaje es demasiado largo. Resume lo esencial.'),
  /**
   * Consentimiento explícito, como `true` literal. Una cadena "false" o un 0
   * no cuentan como permiso.
   */
  consentimiento: z.literal(true, {
    errorMap: () => ({
      message: 'Necesitamos tu permiso para usar tus datos y responderte.',
    }),
  }),
  /**
   * Campo trampa. Es invisible para las personas; si viene lleno, quien envió
   * es un bot. Se responde con éxito fingido para no enseñarle qué lo delató.
   */
  sitio: z.string().max(0).optional(),
});

const DIRECTORIO_DATOS = path.join(process.cwd(), '.data');

async function guardarMensaje(registro: Record<string, unknown>): Promise<void> {
  await mkdir(DIRECTORIO_DATOS, { recursive: true });
  await appendFile(
    path.join(DIRECTORIO_DATOS, 'contacto.jsonl'),
    `${JSON.stringify(registro)}\n`,
    'utf8',
  );
}

export async function POST(peticion: Request) {
  const procesada = await procesarSolicitud(peticion, Esquema, 'contacto', {
    maximo: 5,
    ventanaMs: 10 * MINUTO,
  });
  if (!procesada.ok) return procesada.respuesta;

  const datos = procesada.datos;

  if (datos.sitio) {
    return respuestaFolio('—', 'Recibimos tu mensaje.');
  }

  const folio = `CT-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await guardarMensaje({
      id: randomUUID(),
      folio,
      motivo: datos.motivo,
      nombre: datos.nombre,
      correo: datos.correo,
      mensaje: datos.mensaje,
      consentimiento: datos.consentimiento,
      creadoEn: new Date().toISOString(),
    });
  } catch {
    return respuestaErrorServidor();
  }

  return respuestaFolio(
    folio,
    'Recibimos tu mensaje. Guarda el folio por si quieres darle seguimiento.',
  );
}
