import { NextResponse } from 'next/server';
import { HORA, procesarSolicitud, respuestaErrorServidor, respuestaFolio } from '@/lib/directorio/api';
import { esquemaReporte } from '@/lib/directorio/esquemas';
import { repositorioDirectorio } from '@/lib/directorio/repositorio';

/**
 * Reporte sobre un perfil.
 *
 * Se puede reportar sin dejar correo: exigir identificación desalienta
 * justamente el reporte que más importa. El límite por IP es lo que contiene
 * el abuso, no un campo obligatorio.
 */
export async function POST(peticion: Request) {
  const procesada = await procesarSolicitud(peticion, esquemaReporte, 'reportar', {
    maximo: 5,
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
    const folio = await repositorioDirectorio.guardarReporte({
      proveedorSlug: d.proveedorSlug,
      motivo: d.motivo,
      detalle: d.detalle,
      ...(d.correo ? { correo: d.correo } : {}),
      creadoEn: new Date().toISOString(),
    });
    return respuestaFolio(folio, 'Recibimos tu reporte. Lo revisa una persona del equipo.');
  } catch {
    return respuestaErrorServidor();
  }
}
