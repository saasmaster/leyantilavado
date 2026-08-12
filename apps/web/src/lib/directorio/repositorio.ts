import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { PerfilProveedor, SolicitudContacto } from '@leyantilavado/types';
import { PERFILES_DEMO } from './perfiles-demo';

/* ────────────────────────────────────────────────────────────────────────────
 * Adaptador de persistencia del directorio.
 *
 * Hoy escribe archivos JSON en `.data/`. Mañana será Supabase. Todo lo que
 * toca disco vive detrás de esta interfaz para que el cambio no obligue a
 * tocar ni una página ni un formulario.
 *
 * Reglas que este módulo hace cumplir:
 *  · Nada de datos personales en logs ni en query strings.
 *  · Un alta o un reclamo entran SIEMPRE con `publicado: false`.
 *  · Sin consentimiento explícito no se guarda una solicitud de contacto.
 * ────────────────────────────────────────────────────────────────────────── */

const DIRECTORIO_DATOS = path.join(process.cwd(), '.data');

// ponytail: lectura+escritura de archivo completo, sin bloqueo. Suficiente para
// el volumen de un formulario público en modo de prueba; con Supabase esto
// desaparece. Si antes de eso el volumen creciera, el arreglo es una cola.
async function leerLista<T>(archivo: string): Promise<T[]> {
  try {
    const crudo = await readFile(path.join(DIRECTORIO_DATOS, archivo), 'utf8');
    const datos: unknown = JSON.parse(crudo);
    return Array.isArray(datos) ? (datos as T[]) : [];
  } catch {
    return [];
  }
}

async function agregar<T>(archivo: string, registro: T): Promise<void> {
  await mkdir(DIRECTORIO_DATOS, { recursive: true });
  const lista = await leerLista<T>(archivo);
  lista.push(registro);
  await writeFile(path.join(DIRECTORIO_DATOS, archivo), JSON.stringify(lista, null, 2), 'utf8');
}

/** Folio corto y legible para que la persona pueda referirlo por correo. */
function folio(prefijo: string, semilla: string): string {
  let h = 0;
  for (const c of semilla) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `${prefijo}-${h.toString(36).toUpperCase().padStart(7, '0').slice(0, 7)}`;
}

/* ── Registros que produce el público ───────────────────────────────────── */

export interface AltaProveedor {
  id: string;
  folio: string;
  nombre: string;
  correoContacto: string;
  telefono?: string;
  sitioWeb?: string;
  categorias: string[];
  actividadesAtendidas: string[];
  estado: string;
  ciudad?: string;
  coberturaNacional: boolean;
  atencionRemota: boolean;
  atencionPresencial: boolean;
  idiomas: string[];
  tamanosCliente: string[];
  aniosExperiencia?: number;
  servicios: string[];
  biografia: string;
  credenciales: string;
  documentosDescritos?: string;
  consentimiento: boolean;
  /** Siempre false al entrar: nada se publica sin moderación. */
  publicado: false;
  estadoModeracion: 'pendiente';
  creadoEn: string;
}

export interface ReclamoPerfil {
  id: string;
  folio: string;
  proveedorSlug: string;
  nombre: string;
  correo: string;
  telefono?: string;
  cargo: string;
  pruebaRelacion: string;
  consentimiento: boolean;
  estadoModeracion: 'pendiente';
  creadoEn: string;
}

export type MotivoReporte =
  | 'informacion_incorrecta'
  | 'no_es_el_titular'
  | 'credencial_falsa'
  | 'practica_enganosa'
  | 'perfil_duplicado'
  | 'otro';

export interface ReportePerfil {
  id: string;
  folio: string;
  proveedorSlug: string;
  motivo: MotivoReporte;
  detalle: string;
  /** Opcional: se puede reportar de forma anónima. */
  correo?: string;
  estadoModeracion: 'pendiente';
  creadoEn: string;
}

export interface RepositorioDirectorio {
  listarPerfiles(): Promise<PerfilProveedor[]>;
  perfilPorSlug(slug: string): Promise<PerfilProveedor | null>;
  guardarSolicitudContacto(solicitud: SolicitudContacto): Promise<string>;
  guardarAlta(alta: Omit<AltaProveedor, 'id' | 'folio' | 'publicado' | 'estadoModeracion'>): Promise<string>;
  guardarReclamo(reclamo: Omit<ReclamoPerfil, 'id' | 'folio' | 'estadoModeracion'>): Promise<string>;
  guardarReporte(reporte: Omit<ReportePerfil, 'id' | 'folio' | 'estadoModeracion'>): Promise<string>;
}

const ARCHIVO_PERFILES = 'directorio-perfiles.json';
const ARCHIVO_SOLICITUDES = 'directorio-solicitudes.json';
const ARCHIVO_ALTAS = 'directorio-altas.json';
const ARCHIVO_RECLAMOS = 'directorio-reclamos.json';
const ARCHIVO_REPORTES = 'directorio-reportes.json';

export const repositorioDirectorio: RepositorioDirectorio = {
  async listarPerfiles() {
    // Los perfiles de demostración y los reales conviven; los reales sólo
    // aparecen cuando moderación los marca `publicado`.
    const guardados = await leerLista<PerfilProveedor>(ARCHIVO_PERFILES);
    return [...PERFILES_DEMO, ...guardados.filter((p) => p.publicado)];
  },

  async perfilPorSlug(slug) {
    const todos = await this.listarPerfiles();
    return todos.find((p) => p.slug === slug) ?? null;
  },

  async guardarSolicitudContacto(solicitud) {
    if (!solicitud.consentimiento) {
      // Frontera dura: sin consentimiento no hay dato que compartir.
      throw new Error('No se puede registrar una solicitud sin consentimiento explícito.');
    }
    await agregar(ARCHIVO_SOLICITUDES, solicitud);
    return folio('SOL', solicitud.id);
  },

  async guardarAlta(alta) {
    const id = crypto.randomUUID();
    const registro: AltaProveedor = {
      ...alta,
      id,
      folio: folio('ALT', id),
      publicado: false,
      estadoModeracion: 'pendiente',
    };
    await agregar(ARCHIVO_ALTAS, registro);
    return registro.folio;
  },

  async guardarReclamo(reclamo) {
    const id = crypto.randomUUID();
    const registro: ReclamoPerfil = {
      ...reclamo,
      id,
      folio: folio('REC', id),
      estadoModeracion: 'pendiente',
    };
    await agregar(ARCHIVO_RECLAMOS, registro);
    return registro.folio;
  },

  async guardarReporte(reporte) {
    const id = crypto.randomUUID();
    const registro: ReportePerfil = {
      ...reporte,
      id,
      folio: folio('REP', id),
      estadoModeracion: 'pendiente',
    };
    await agregar(ARCHIVO_REPORTES, registro);
    return registro.folio;
  },
};

export const ETIQUETA_MOTIVO_REPORTE: Record<MotivoReporte, string> = {
  informacion_incorrecta: 'La información del perfil es incorrecta o está desactualizada',
  no_es_el_titular: 'Quien controla el perfil no es la persona o empresa que dice ser',
  credencial_falsa: 'Una credencial o certificación mostrada parece falsa',
  practica_enganosa: 'Ofrece resultados que la ley no permite garantizar',
  perfil_duplicado: 'Es un perfil duplicado',
  otro: 'Otro motivo',
};
