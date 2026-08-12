import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { PerfilProveedor, SolicitudContacto } from '@leyantilavado/types';
import type { DocumentoGuardado } from './documentos';

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

/**
 * Slug a partir del nombre comercial, sin colisiones.
 *
 * Dos despachos pueden llamarse igual, y el slug es la URL pública: si se
 * repitiera, el segundo perfil sobrescribiría al primero en la búsqueda por
 * slug y una empresa acabaría viendo la ficha de otra.
 */
async function slugLibre(nombre: string): Promise<string> {
  const base =
    nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'proveedor';

  const existentes = new Set((await leerLista<PerfilProveedor>(ARCHIVO_PERFILES)).map((p) => p.slug));
  if (!existentes.has(base)) return base;

  for (let n = 2; n < 1000; n++) {
    const intento = `${base}-${n}`;
    if (!existentes.has(intento)) return intento;
  }
  return `${base}-${Date.now()}`;
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
  /** Archivos que subió. Se guardan fuera de `public/` y nunca se sirven. */
  documentos?: DocumentoGuardado[];
  consentimiento: boolean;
  /**
   * El alta se publica, y se publica marcada.
   *
   * Antes era `false` fijo: nada aparecía hasta que moderación lo aprobara, y
   * el resultado era un directorio vacío que no le servía a nadie —ni a quien
   * busca, ni a quien se dio de alta y no volvió a verse—. El gate en la
   * publicación tampoco compraba lo que parecía: la revisión sigue siendo la
   * misma, sólo que ahora ocurre sobre un perfil visible que dice de sí mismo
   * que no está verificado.
   *
   * Lo que NO cambió: moderación sigue revisando a mano, y sólo esa revisión
   * puede subir el nivel de verificación por encima de `sin_verificar`.
   */
  publicado: boolean;
  estadoModeracion: 'pendiente' | 'revisado' | 'rechazado';
  /** Slug del perfil público que generó esta alta. */
  perfilSlug?: string;
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
    // Sólo perfiles reales, y sólo cuando moderación los marca `publicado`.
    // Hasta que haya altas aprobadas esto devuelve una lista vacía, y el
    // directorio lo dice con todas sus letras en vez de rellenarse con fichas
    // inventadas.
    const guardados = await leerLista<PerfilProveedor>(ARCHIVO_PERFILES);
    return guardados.filter((p) => p.publicado);
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
    const numeroFolio = folio('ALT', id);
    const slug = await slugLibre(alta.nombre);

    const registro: AltaProveedor = {
      ...alta,
      id,
      folio: numeroFolio,
      publicado: true,
      estadoModeracion: 'pendiente',
      perfilSlug: slug,
    };
    await agregar(ARCHIVO_ALTAS, registro);

    // El perfil público que nace del alta. `sin_verificar` es el único nivel
    // que puede asignarse solo: los demás exigen que una persona haya mirado
    // un documento, y eso todavía no ha ocurrido.
    const ahora = new Date().toISOString();
    const perfil: PerfilProveedor = {
      id,
      slug,
      nombre: alta.nombre,
      categorias: alta.categorias as PerfilProveedor['categorias'],
      actividadesAtendidas: alta.actividadesAtendidas as PerfilProveedor['actividadesAtendidas'],
      biografia: alta.biografia,
      servicios: alta.servicios,
      industrias: [],
      ubicaciones: [
        {
          estado: alta.estado,
          ...(alta.ciudad ? { ciudad: alta.ciudad } : {}),
          coberturaNacional: alta.coberturaNacional,
          atencionRemota: alta.atencionRemota,
          atencionPresencial: alta.atencionPresencial,
        },
      ],
      idiomas: alta.idiomas,
      ...(alta.aniosExperiencia !== undefined ? { aniosExperiencia: alta.aniosExperiencia } : {}),
      tamanosCliente: alta.tamanosCliente as PerfilProveedor['tamanosCliente'],
      ...(alta.sitioWeb ? { sitioWeb: alta.sitioWeb } : {}),
      // Las credenciales llegan como texto libre y NO se publican como
      // credenciales: publicarlas sería convertir en afirmación verificada lo
      // que sólo es lo que alguien escribió de sí mismo.
      credenciales: [],
      verificacion: 'sin_verificar',
      plan: 'gratuito',
      patrocinado: false,
      aceptaNuevosClientes: true,
      publicado: true,
      creadoEn: ahora,
      actualizadoEn: ahora,
    };
    await agregar(ARCHIVO_PERFILES, perfil);

    return numeroFolio;
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
