import { NextResponse } from 'next/server';
import type { SolicitudContacto } from '@leyantilavado/types';
import { MINUTO, procesarSolicitud, respuestaErrorServidor, respuestaFolio } from '@/lib/directorio/api';
import { esquemaContacto } from '@/lib/directorio/esquemas';
import { repositorioDirectorio } from '@/lib/directorio/repositorio';

/**
 * Solicitud de contacto, cotización o llamada hacia un proveedor.
 *
 * El consentimiento ya viene validado como `true` literal por el esquema, y el
 * repositorio vuelve a exigirlo antes de escribir: dos puertas, porque compartir
 * los datos de una persona con un tercero sin permiso no admite un descuido.
 */
export async function POST(peticion: Request) {
  const procesada = await procesarSolicitud(peticion, esquemaContacto, 'contacto', {
    maximo: 5,
    ventanaMs: 10 * MINUTO,
  });
  if (!procesada.ok) return procesada.respuesta;

  const datos = procesada.datos;
  const proveedor = await repositorioDirectorio.perfilPorSlug(datos.proveedorSlug);
  if (!proveedor) {
    return NextResponse.json(
      { ok: false, error: 'Ese perfil ya no existe en el directorio.' },
      { status: 404 },
    );
  }

  const solicitud: SolicitudContacto = {
    id: crypto.randomUUID(),
    proveedorId: proveedor.id,
    nombre: datos.nombre,
    correo: datos.correo,
    ...(datos.telefono ? { telefono: datos.telefono } : {}),
    ...(datos.empresa ? { empresa: datos.empresa } : {}),
    ...(datos.actividad ? { actividad: datos.actividad } : {}),
    mensaje: datos.mensaje,
    tipo: datos.tipo,
    consentimiento: datos.consentimiento,
    creadoEn: new Date().toISOString(),
  };

  try {
    const folio = await repositorioDirectorio.guardarSolicitudContacto(solicitud);
    return respuestaFolio(
      folio,
      'Compartimos tu mensaje con el proveedor. Guarda el folio por si quieres darle seguimiento.',
    );
  } catch {
    return respuestaErrorServidor();
  }
}
