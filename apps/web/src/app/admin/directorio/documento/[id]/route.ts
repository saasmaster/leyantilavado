import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { leerSesion } from '@/lib/auth/sesion';
import { repositorioDirectorio } from '@/lib/directorio/repositorio';

/* ────────────────────────────────────────────────────────────────────────────
 * Entrega de un documento subido en un alta.
 *
 * Lo que pasa por aquí son identificaciones, cédulas y constancias fiscales de
 * terceros. Cuatro reglas:
 *
 *  1. El permiso se comprueba ANTES de tocar el disco, y se comprueba con
 *     `es_staff` de la base de datos —no con una cookie, no con el rol simulado
 *     por «ver como»—. El layout de /admin no protege esto: un route handler no
 *     ejecuta layouts.
 *  2. El cliente sólo manda un id. La ruta del archivo sale del registro
 *     guardado, así que no hay ninguna cadena del usuario con la que construir
 *     una ruta ni, por tanto, nada que atravesar.
 *  3. Quien no tiene permiso recibe 404, no 403: un 403 ya confirma que existe
 *     un documento con ese id.
 *  4. Se entrega como descarga y con `nosniff`. Un PDF servido en línea desde
 *     el mismo origen que el panel puede ejecutar guion; una descarga no.
 * ────────────────────────────────────────────────────────────────────────── */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function noEncontrado(): Response {
  return new Response('No encontrado', {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

export async function GET(
  _peticion: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const sesion = await leerSesion();
  if (sesion.estado !== 'activa' || !sesion.usuario.esStaff) {
    return noEncontrado();
  }

  const { id } = await params;
  const altas = await repositorioDirectorio.listarAltas();
  const documento = altas
    .flatMap((alta) => alta.documentos ?? [])
    .find((doc) => doc.id === id);

  if (!documento) return noEncontrado();

  let datos: Buffer;
  try {
    datos = await readFile(path.join(process.cwd(), '.data', documento.ruta));
  } catch {
    // El registro existe pero el archivo no: en disco puede haberse perdido.
    return noEncontrado();
  }

  return new Response(new Uint8Array(datos), {
    headers: {
      'content-type': documento.tipo,
      'content-length': String(datos.byteLength),
      'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(documento.nombreOriginal)}`,
      'x-content-type-options': 'nosniff',
      'cache-control': 'private, no-store, max-age=0',
    },
  });
}
