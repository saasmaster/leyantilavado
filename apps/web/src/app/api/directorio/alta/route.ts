import { NextResponse } from 'next/server';
import { HORA, procesarSolicitud, respuestaErrorServidor, respuestaFolio } from '@/lib/directorio/api';
import { MAXIMO_ARCHIVOS, guardarDocumentos } from '@/lib/directorio/documentos';
import { esquemaAlta } from '@/lib/directorio/esquemas';
import { repositorioDirectorio } from '@/lib/directorio/repositorio';

/**
 * Alta de un proveedor en el directorio.
 *
 * El perfil se publica de inmediato y se publica MARCADO como «sin verificar».
 * Ese es el único nivel que puede asignarse solo; cualquier otro exige que una
 * persona haya mirado un documento.
 *
 * Acepta `multipart/form-data` cuando vienen documentos y JSON cuando no, para
 * no romper a quien ya integraba contra la forma anterior. Los archivos se
 * guardan fuera de `public/` y no hay ninguna ruta que los devuelva.
 */
export const runtime = 'nodejs';

/** Techo del cuerpo completo: cinco archivos de 8 MB más el formulario. */
const MAXIMO_CUERPO = 42 * 1024 * 1024;

export async function POST(peticion: Request) {
  const tipo = peticion.headers.get('content-type') ?? '';

  if (tipo.includes('multipart/form-data')) {
    const largo = Number(peticion.headers.get('content-length') ?? 0);
    if (largo > MAXIMO_CUERPO) {
      return NextResponse.json(
        { ok: false, error: 'El envío pesa demasiado. Sube menos documentos o comprímelos.' },
        { status: 413 },
      );
    }
    return altaConDocumentos(peticion);
  }

  return altaSinDocumentos(peticion);
}

/**
 * Camino multipart.
 *
 * Los campos del formulario se reconstruyen en un objeto y se validan con el
 * MISMO esquema que la ruta JSON. Aceptar multipart no puede significar una
 * puerta con menos validación que la otra.
 */
async function altaConDocumentos(peticion: Request): Promise<Response> {
  let formulario: FormData;
  try {
    formulario = await peticion.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No pudimos leer el formulario. Vuelve a enviarlo.' },
      { status: 400 },
    );
  }

  const archivos = formulario
    .getAll('documentos')
    .filter((v): v is File => v instanceof File && v.size > 0);

  if (archivos.length > MAXIMO_ARCHIVOS) {
    return NextResponse.json(
      { ok: false, error: `Puedes subir hasta ${MAXIMO_ARCHIVOS} documentos.` },
      { status: 400 },
    );
  }

  const crudo = formulario.get('datos');
  if (typeof crudo !== 'string') {
    return NextResponse.json(
      { ok: false, error: 'Falta la información del formulario.' },
      { status: 400 },
    );
  }

  // Se delega en la ruta JSON reconstruyendo la petición: así el límite de
  // tasa, Turnstile y el esquema se aplican exactamente igual en ambos caminos.
  const comoJson = new Request(peticion.url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(peticion.headers.get('x-forwarded-for')
        ? { 'x-forwarded-for': peticion.headers.get('x-forwarded-for') as string }
        : {}),
    },
    body: crudo,
  });

  return guardar(comoJson, archivos);
}

async function altaSinDocumentos(peticion: Request): Promise<Response> {
  return guardar(peticion, []);
}

async function guardar(peticion: Request, archivos: readonly File[]): Promise<Response> {
  const procesada = await procesarSolicitud(peticion, esquemaAlta, 'alta', {
    maximo: 3,
    ventanaMs: HORA,
  });
  if (!procesada.ok) return procesada.respuesta;

  const d = procesada.datos;

  try {
    // Los documentos se validan y guardan ANTES de crear el perfil: si alguno
    // es inválido, no queda un perfil publicado apuntando a archivos que nunca
    // llegaron.
    const subida = await guardarDocumentos(archivos, 'alta');
    if (!subida.ok) {
      return NextResponse.json({ ok: false, error: subida.error }, { status: 400 });
    }

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
      ...(subida.documentos.length ? { documentos: subida.documentos } : {}),
      creadoEn: new Date().toISOString(),
    });

    return respuestaFolio(
      folio,
      subida.documentos.length
        ? `Tu perfil ya está publicado y aparece como «Sin verificar». Recibimos ${subida.documentos.length} documento${subida.documentos.length === 1 ? '' : 's'} y los revisamos a mano para subir tu nivel de verificación.`
        : 'Tu perfil ya está publicado y aparece como «Sin verificar». Para subir de nivel necesitamos documentos: puedes enviarlos respondiendo al correo de confirmación.',
    );
  } catch {
    return respuestaErrorServidor();
  }
}
