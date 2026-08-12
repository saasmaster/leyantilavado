import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { MAXIMO_ARCHIVOS, MAXIMO_BYTES, type TIPOS_ACEPTADOS } from './documentos-limites';

export { EXTENSIONES_VISIBLES, MAXIMO_ARCHIVOS, TIPOS_ACEPTADOS } from './documentos-limites';

/**
 * Almacenamiento de los documentos que sube un proveedor al darse de alta.
 *
 * Lo que se sube aquí son cédulas profesionales, títulos y certificaciones:
 * documentos de identidad de una persona real. Tres reglas que no se negocian.
 *
 * ── 1. Nunca se sirven ──────────────────────────────────────────────────────
 * Se guardan FUERA de `public/`, en `.data/documentos/`, y no existe ninguna
 * ruta que los devuelva. Moderación los abre desde el servidor. Si algún día
 * hace falta verlos desde la aplicación, tendrá que ser tras autenticación y
 * con un enlace firmado y caduco, nunca con una URL adivinable.
 *
 * ── 2. El nombre lo pone el servidor ────────────────────────────────────────
 * El nombre original del archivo se guarda como dato, pero jamás se usa para
 * construir una ruta. `../../etc/passwd.pdf` es un nombre de archivo válido, y
 * concatenarlo a un directorio es como se escribe una travesía de rutas.
 *
 * ── 3. Se mira el contenido, no la extensión ────────────────────────────────
 * El `Content-Type` que manda el navegador es un dato del cliente y se puede
 * inventar. Se comprueban los primeros bytes del archivo, que es lo que de
 * verdad determina qué es.
 */

const DIRECTORIO_DOCUMENTOS = path.join(process.cwd(), '.data', 'documentos');

/**
 * Firmas de los formatos aceptados.
 *
 * PDF empieza por «%PDF-», JPEG por FF D8 FF y PNG por su firma de 8 bytes.
 * Un ejecutable renombrado a .pdf no pasa esta comprobación.
 */
const FIRMAS: readonly { tipo: (typeof TIPOS_ACEPTADOS)[number]; bytes: readonly number[] }[] = [
  { tipo: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
  { tipo: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { tipo: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

const EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

export interface DocumentoGuardado {
  id: string;
  /** Nombre que le puso quien lo subió. Se muestra a moderación, nunca se usa como ruta. */
  nombreOriginal: string;
  tipo: string;
  bytes: number;
  /** Ruta relativa dentro de `.data`. Nunca es una URL. */
  ruta: string;
  subidoEn: string;
}

export type ResultadoDocumentos =
  | { ok: true; documentos: DocumentoGuardado[] }
  | { ok: false; error: string };

/** Detecta el tipo real leyendo la cabecera del archivo. */
function tipoReal(datos: Uint8Array): string | null {
  for (const f of FIRMAS) {
    if (f.bytes.every((b, i) => datos[i] === b)) return f.tipo;
  }
  return null;
}

/** Limpia el nombre para mostrarlo sin riesgo de inyectar marcado ni rutas. */
function nombreSeguro(nombre: string): string {
  return nombre
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[/\\]/g, '_')
    .slice(0, 120)
    .trim();
}

export async function guardarDocumentos(
  archivos: readonly File[],
  folio: string,
): Promise<ResultadoDocumentos> {
  if (archivos.length === 0) return { ok: true, documentos: [] };

  if (archivos.length > MAXIMO_ARCHIVOS) {
    return {
      ok: false,
      error: `Puedes subir hasta ${MAXIMO_ARCHIVOS} documentos. Envía el resto por correo si hacen falta.`,
    };
  }

  const guardados: DocumentoGuardado[] = [];
  await mkdir(DIRECTORIO_DOCUMENTOS, { recursive: true });

  for (const archivo of archivos) {
    if (archivo.size === 0) continue;

    if (archivo.size > MAXIMO_BYTES) {
      return {
        ok: false,
        error: `«${nombreSeguro(archivo.name)}» pesa más de 8 MB. Comprímelo o súbelo en menor resolución.`,
      };
    }

    const datos = new Uint8Array(await archivo.arrayBuffer());
    const tipo = tipoReal(datos);

    if (!tipo) {
      return {
        ok: false,
        error: `«${nombreSeguro(archivo.name)}» no es un PDF, JPG ni PNG. Comprobamos el contenido del archivo, no su extensión.`,
      };
    }

    // El nombre lo compone el servidor. El del usuario sólo se conserva como
    // dato para que moderación sepa qué le mandaron.
    const id = randomUUID();
    const relativa = path.join('documentos', `${folio}-${id}.${EXTENSION[tipo]}`);
    await writeFile(path.join(process.cwd(), '.data', relativa), datos);

    guardados.push({
      id,
      nombreOriginal: nombreSeguro(archivo.name),
      tipo,
      bytes: archivo.size,
      ruta: relativa,
      subidoEn: new Date().toISOString(),
    });
  }

  return { ok: true, documentos: guardados };
}
