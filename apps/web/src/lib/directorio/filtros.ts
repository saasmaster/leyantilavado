import type {
  ActividadSlug,
  CategoriaProveedor,
  NivelVerificacionProveedor,
  PerfilProveedor,
  PlanProveedor,
  TamanoCliente,
} from '@leyantilavado/types';
import { ACTIVIDAD_SLUGS } from '@leyantilavado/types';
import { esCategoria, PESO_VERIFICACION } from './catalogo';

/* ────────────────────────────────────────────────────────────────────────────
 * Filtros del directorio.
 *
 * Viven en la URL para que un resultado sea compartible e indexable. Nada de
 * estado de filtro en memoria del cliente: `?estado=Jalisco&actividad=vehiculos`
 * es la única fuente de verdad.
 * ────────────────────────────────────────────────────────────────────────── */

export const POR_PAGINA = 8;

export type Modalidad = 'presencial' | 'remota';

export interface FiltrosDirectorio {
  q: string;
  categoria: CategoriaProveedor | null;
  estado: string | null;
  ciudad: string | null;
  soloNacional: boolean;
  modalidad: Modalidad | null;
  actividad: ActividadSlug | null;
  servicio: string | null;
  idioma: string | null;
  tamano: TamanoCliente | null;
  experienciaMinima: number | null;
  verificacion: NivelVerificacionProveedor | null;
  soloDisponibles: boolean;
  plan: PlanProveedor | null;
  pagina: number;
}

export const FILTROS_VACIOS: FiltrosDirectorio = {
  q: '',
  categoria: null,
  estado: null,
  ciudad: null,
  soloNacional: false,
  modalidad: null,
  actividad: null,
  servicio: null,
  idioma: null,
  tamano: null,
  experienciaMinima: null,
  verificacion: null,
  soloDisponibles: false,
  plan: null,
  pagina: 1,
};

export type ParametrosBusqueda = Record<string, string | string[] | undefined>;

function primero(valor: string | string[] | undefined): string | null {
  const v = Array.isArray(valor) ? valor[0] : valor;
  const limpio = v?.trim();
  return limpio ? limpio : null;
}

function unoDe<T extends string>(
  valor: string | string[] | undefined,
  permitidos: readonly T[],
): T | null {
  const v = primero(valor);
  return v && (permitidos as readonly string[]).includes(v) ? (v as T) : null;
}

const NIVELES: readonly NivelVerificacionProveedor[] = [
  'sin_verificar',
  'correo_verificado',
  'identidad_verificada',
  'documentacion_revisada',
  'certificacion_externa_revisada',
];
const PLANES: readonly PlanProveedor[] = ['gratuito', 'profesional', 'destacado'];
const TAMANOS: readonly TamanoCliente[] = ['micro', 'pequena', 'mediana', 'grande'];
const MODALIDADES: readonly Modalidad[] = ['presencial', 'remota'];

/** Lee los filtros de la URL. Todo valor desconocido se descarta en silencio. */
export function leerFiltros(params: ParametrosBusqueda): FiltrosDirectorio {
  const categoriaCruda = primero(params['categoria']);
  const paginaCruda = Number.parseInt(primero(params['pagina']) ?? '', 10);
  const experienciaCruda = Number.parseInt(primero(params['experiencia']) ?? '', 10);

  return {
    q: (primero(params['q']) ?? '').slice(0, 80),
    categoria: categoriaCruda && esCategoria(categoriaCruda) ? categoriaCruda : null,
    estado: primero(params['estado']),
    ciudad: primero(params['ciudad']),
    soloNacional: primero(params['cobertura']) === 'nacional',
    modalidad: unoDe(params['modalidad'], MODALIDADES),
    actividad: unoDe(params['actividad'], ACTIVIDAD_SLUGS),
    servicio: primero(params['servicio']),
    idioma: primero(params['idioma']),
    tamano: unoDe(params['tamano'], TAMANOS),
    experienciaMinima:
      Number.isFinite(experienciaCruda) && experienciaCruda > 0 ? experienciaCruda : null,
    verificacion: unoDe(params['verificacion'], NIVELES),
    soloDisponibles: primero(params['disponibilidad']) === 'abiertos',
    plan: unoDe(params['plan'], PLANES),
    pagina: Number.isFinite(paginaCruda) && paginaCruda > 1 ? paginaCruda : 1,
  };
}

/** Reconstruye el query string. Omite lo que está en su valor por omisión. */
export function escribirFiltros(f: FiltrosDirectorio): string {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.categoria) p.set('categoria', f.categoria);
  if (f.estado) p.set('estado', f.estado);
  if (f.ciudad) p.set('ciudad', f.ciudad);
  if (f.soloNacional) p.set('cobertura', 'nacional');
  if (f.modalidad) p.set('modalidad', f.modalidad);
  if (f.actividad) p.set('actividad', f.actividad);
  if (f.servicio) p.set('servicio', f.servicio);
  if (f.idioma) p.set('idioma', f.idioma);
  if (f.tamano) p.set('tamano', f.tamano);
  if (f.experienciaMinima) p.set('experiencia', String(f.experienciaMinima));
  if (f.verificacion) p.set('verificacion', f.verificacion);
  if (f.soloDisponibles) p.set('disponibilidad', 'abiertos');
  if (f.plan) p.set('plan', f.plan);
  if (f.pagina > 1) p.set('pagina', String(f.pagina));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function hayFiltrosActivos(f: FiltrosDirectorio): boolean {
  return escribirFiltros({ ...f, pagina: 1 }) !== '';
}

function normalizar(texto: string): string {
  return texto
    .toLocaleLowerCase('es-MX')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function coincideTexto(perfil: PerfilProveedor, consulta: string): boolean {
  const q = normalizar(consulta);
  if (!q) return true;
  const heno = normalizar(
    [
      perfil.nombre,
      perfil.biografia,
      ...perfil.industrias,
      ...perfil.ubicaciones.map((u) => `${u.estado} ${u.ciudad ?? ''}`),
    ].join(' '),
  );
  // Todas las palabras deben aparecer: buscar "auditor jalisco" no debe traer
  // a todos los auditores del país.
  return q.split(/\s+/).every((palabra) => heno.includes(palabra));
}

export function aplicarFiltros(
  perfiles: readonly PerfilProveedor[],
  f: FiltrosDirectorio,
): PerfilProveedor[] {
  return perfiles.filter((p) => {
    if (!p.publicado) return false;
    if (f.categoria && !p.categorias.includes(f.categoria)) return false;
    if (f.actividad && !p.actividadesAtendidas.includes(f.actividad)) return false;
    if (f.servicio && !p.servicios.includes(f.servicio)) return false;
    if (f.idioma && !p.idiomas.includes(f.idioma)) return false;
    if (f.tamano && !p.tamanosCliente.includes(f.tamano)) return false;
    if (f.verificacion && p.verificacion !== f.verificacion) return false;
    if (f.plan && p.plan !== f.plan) return false;
    if (f.soloDisponibles && !p.aceptaNuevosClientes) return false;
    if (f.experienciaMinima && (p.aniosExperiencia ?? 0) < f.experienciaMinima) return false;
    if (f.soloNacional && !p.ubicaciones.some((u) => u.coberturaNacional)) return false;

    if (f.modalidad === 'presencial' && !p.ubicaciones.some((u) => u.atencionPresencial)) {
      return false;
    }
    if (f.modalidad === 'remota' && !p.ubicaciones.some((u) => u.atencionRemota)) return false;

    // Un proveedor con cobertura nacional atiende cualquier estado.
    if (f.estado) {
      const alcanza = p.ubicaciones.some((u) => u.coberturaNacional || u.estado === f.estado);
      if (!alcanza) return false;
    }
    if (f.ciudad) {
      const ciudad = normalizar(f.ciudad);
      const alcanza = p.ubicaciones.some(
        (u) => u.coberturaNacional || (u.ciudad ? normalizar(u.ciudad).includes(ciudad) : false),
      );
      if (!alcanza) return false;
    }

    return coincideTexto(p, f.q);
  });
}

/**
 * Orden natural del listado: primero la comprobación, luego la experiencia,
 * luego el nombre. El plan NO influye — los perfiles pagados se muestran en un
 * bloque aparte con su etiqueta, nunca infiltrados en este orden.
 */
export function ordenNatural(a: PerfilProveedor, b: PerfilProveedor): number {
  const dv = PESO_VERIFICACION[b.verificacion] - PESO_VERIFICACION[a.verificacion];
  if (dv !== 0) return dv;
  const de = (b.aniosExperiencia ?? 0) - (a.aniosExperiencia ?? 0);
  if (de !== 0) return de;
  return a.nombre.localeCompare(b.nombre, 'es-MX');
}

export interface ResultadoBusqueda {
  patrocinados: PerfilProveedor[];
  resultados: PerfilProveedor[];
  total: number;
  totalPatrocinados: number;
  pagina: number;
  totalPaginas: number;
}

export function buscarProveedores(
  perfiles: readonly PerfilProveedor[],
  f: FiltrosDirectorio,
): ResultadoBusqueda {
  const coincidencias = aplicarFiltros(perfiles, f).sort(ordenNatural);
  // Separación editorial: la publicidad va en su propio bloque, con etiqueta.
  const patrocinados = coincidencias.filter((p) => p.patrocinado);
  const organicos = coincidencias.filter((p) => !p.patrocinado);

  const totalPaginas = Math.max(1, Math.ceil(organicos.length / POR_PAGINA));
  const pagina = Math.min(f.pagina, totalPaginas);
  const inicio = (pagina - 1) * POR_PAGINA;

  return {
    // Los patrocinados sólo encabezan la primera página.
    patrocinados: pagina === 1 ? patrocinados : [],
    resultados: organicos.slice(inicio, inicio + POR_PAGINA),
    total: organicos.length,
    totalPatrocinados: patrocinados.length,
    pagina,
    totalPaginas,
  };
}
