import { HORA, procesarSolicitud, respuestaErrorServidor, respuestaFolio } from '@/lib/directorio/api';
import { esquemaAlta } from '@/lib/directorio/esquemas';
import { repositorioDirectorio } from '@/lib/directorio/repositorio';

/**
 * Alta de un proveedor en el directorio.
 *
 * Entra SIEMPRE como `publicado: false`, en estado pendiente de moderación. No
 * existe ninguna ruta que publique un perfil sin revisión humana.
 */
export async function POST(peticion: Request) {
  const procesada = await procesarSolicitud(peticion, esquemaAlta, 'alta', {
    maximo: 3,
    ventanaMs: HORA,
  });
  if (!procesada.ok) return procesada.respuesta;

  const d = procesada.datos;

  try {
    const folio = await repositorioDirectorio.guardarAlta({
      nombre: d.nombre,
      correoContacto: d.correoContacto,
      ...(d.telefono ? { telefono: d.telefono } : {}),
      ...(d.sitioWeb ? { sitioWeb: d.sitioWeb } : {}),
      categorias: [...d.categorias],
      actividadesAtendidas: [...d.actividadesAtendidas],
      servicios: [...d.servicios],
      estado: d.estado,
      ...(d.ciudad ? { ciudad: d.ciudad } : {}),
      coberturaNacional: d.coberturaNacional,
      atencionRemota: d.atencionRemota,
      atencionPresencial: d.atencionPresencial,
      idiomas: [...d.idiomas],
      tamanosCliente: [...d.tamanosCliente],
      ...(d.aniosExperiencia !== undefined ? { aniosExperiencia: d.aniosExperiencia } : {}),
      biografia: d.biografia,
      credenciales: d.credenciales,
      ...(d.documentosDescritos ? { documentosDescritos: d.documentosDescritos } : {}),
      consentimiento: d.consentimiento,
      creadoEn: new Date().toISOString(),
    });

    return respuestaFolio(
      folio,
      'Tu alta quedó en la fila de moderación. Nada se publica antes de la revisión.',
    );
  } catch {
    return respuestaErrorServidor();
  }
}
