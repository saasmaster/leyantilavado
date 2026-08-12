import { NextResponse } from 'next/server';
import { HORA, procesarSolicitud, respuestaErrorServidor, respuestaFolio } from '@/lib/directorio/api';
import { esquemaReclamo } from '@/lib/directorio/esquemas';
import { repositorioDirectorio } from '@/lib/directorio/repositorio';

/**
 * Reclamo de un perfil por parte de su titular.
 *
 * Sólo registra la petición: el control del perfil no cambia de manos aquí. La
 * verificación la hace una persona, fuera de esta ruta.
 */
export async function POST(peticion: Request) {
  const procesada = await procesarSolicitud(peticion, esquemaReclamo, 'reclamar', {
    maximo: 3,
    ventanaMs: HORA,
  });
  if (!procesada.ok) return procesada.respuesta;

  const d = procesada.datos;
  const proveedor = await repositorioDirectorio.perfilPorSlug(d.proveedorSlug);
  if (!proveedor) {
    return NextResponse.json(
      { ok: false, error: 'Ese perfil ya no existe en el directorio.' },
      { status: 404 },
    );
  }

  try {
    const folio = await repositorioDirectorio.guardarReclamo({
      proveedorSlug: d.proveedorSlug,
      nombre: d.nombre,
      correo: d.correo,
      ...(d.telefono ? { telefono: d.telefono } : {}),
      cargo: d.cargo,
      pruebaRelacion: d.pruebaRelacion,
      consentimiento: d.consentimiento,
      creadoEn: new Date().toISOString(),
    });
    return respuestaFolio(folio, 'Recibimos tu reclamo. Te contactamos para verificarlo.');
  } catch {
    return respuestaErrorServidor();
  }
}
