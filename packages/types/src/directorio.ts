import type { ActividadSlug } from './legal';

/* ────────────────────────────────────────────────────────────────────────────
 * Directorio profesional
 * ────────────────────────────────────────────────────────────────────────── */

export type CategoriaProveedor =
  | 'contadores'
  | 'abogados'
  | 'consultores-pld'
  | 'auditores-externos'
  | 'auditores-internos'
  | 'capacitadores'
  | 'proveedores-kyc'
  | 'consulta-pep-listas'
  | 'software-cumplimiento'
  | 'despachos-multidisciplinarios';

export const CATEGORIAS_PROVEEDOR = [
  'contadores',
  'abogados',
  'consultores-pld',
  'auditores-externos',
  'auditores-internos',
  'capacitadores',
  'proveedores-kyc',
  'consulta-pep-listas',
  'software-cumplimiento',
  'despachos-multidisciplinarios',
] as const satisfies readonly CategoriaProveedor[];

/**
 * Niveles de verificación.
 *
 * Regla del producto: NUNCA se usa la palabra "certificado por
 * LeyAntilavado.org". El nivel más alto que otorgamos es "documentación
 * revisada", y la UI explica literalmente qué se revisó y qué no.
 */
export type NivelVerificacionProveedor =
  | 'sin_verificar'
  | 'correo_verificado'
  | 'identidad_verificada'
  | 'documentacion_revisada'
  | 'certificacion_externa_revisada';

export const ETIQUETA_VERIFICACION: Record<NivelVerificacionProveedor, string> = {
  sin_verificar: 'Sin verificar',
  correo_verificado: 'Correo verificado',
  identidad_verificada: 'Identidad verificada',
  documentacion_revisada: 'Documentación revisada',
  certificacion_externa_revisada: 'Certificación externa revisada',
};

export const EXPLICACION_VERIFICACION: Record<NivelVerificacionProveedor, string> = {
  sin_verificar: 'Este perfil aún no ha pasado por ninguna comprobación.',
  correo_verificado: 'Confirmamos que la persona controla el correo electrónico del perfil. No comprobamos su identidad ni sus credenciales.',
  identidad_verificada: 'Confirmamos la identidad de la persona o la existencia legal de la empresa. No evaluamos la calidad de sus servicios.',
  documentacion_revisada: 'Revisamos que los documentos profesionales presentados existan y correspondan al titular del perfil. No es una certificación ni un aval de LeyAntilavado.org.',
  certificacion_externa_revisada: 'Revisamos una certificación emitida por un tercero (por ejemplo, la certificación de auditor ante la UIF) y su vigencia a la fecha indicada. La certificación es del tercero, no nuestra.',
};

export type PlanProveedor = 'gratuito' | 'profesional' | 'destacado';

export type TamanoCliente = 'micro' | 'pequena' | 'mediana' | 'grande';

export interface UbicacionProveedor {
  estado: string;
  ciudad?: string;
  coberturaNacional: boolean;
  atencionRemota: boolean;
  atencionPresencial: boolean;
}

export interface CredencialProveedor {
  id: string;
  tipo: 'cedula_profesional' | 'certificacion_uif' | 'colegio' | 'titulo' | 'otro';
  nombre: string;
  emisor: string;
  folio?: string;
  vigenteHasta?: string;
  /** Nunca público: sólo lo ve moderación. */
  documentoUrl?: string;
  revisadoEn?: string;
  revisadoPor?: string;
}

export interface PerfilProveedor {
  id: string;
  slug: string;
  nombre: string;
  categorias: readonly CategoriaProveedor[];
  /** Actividades vulnerables que este proveedor atiende. */
  actividadesAtendidas: readonly ActividadSlug[];
  biografia: string;
  servicios: readonly string[];
  industrias: readonly string[];
  ubicaciones: readonly UbicacionProveedor[];
  idiomas: readonly string[];
  aniosExperiencia?: number;
  tamanosCliente: readonly TamanoCliente[];
  logoUrl?: string;
  sitioWeb?: string;
  credenciales: readonly CredencialProveedor[];
  verificacion: NivelVerificacionProveedor;
  plan: PlanProveedor;
  /**
   * Perfil pagado que aparece en posiciones destacadas. La UI DEBE mostrar la
   * etiqueta "Patrocinado" de forma visible; no es negociable.
   */
  patrocinado: boolean;
  aceptaNuevosClientes: boolean;
  publicado: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface SolicitudContacto {
  id: string;
  proveedorId: string;
  nombre: string;
  correo: string;
  telefono?: string;
  empresa?: string;
  actividad?: ActividadSlug;
  mensaje: string;
  tipo: 'contacto' | 'cotizacion' | 'llamada';
  /** Consentimiento explícito para compartir los datos con el proveedor. */
  consentimiento: boolean;
  creadoEn: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Organizaciones (área privada de cumplimiento)
 * ────────────────────────────────────────────────────────────────────────── */

export type RolOrganizacion = 'propietario' | 'administrador' | 'analista' | 'auditor' | 'consulta';

export const ROLES_ORGANIZACION = [
  'propietario',
  'administrador',
  'analista',
  'auditor',
  'consulta',
] as const satisfies readonly RolOrganizacion[];

export type Permiso =
  | 'org.editar'
  | 'org.miembros'
  | 'clientes.ver'
  | 'clientes.editar'
  | 'operaciones.ver'
  | 'operaciones.editar'
  | 'operaciones.importar'
  | 'alertas.ver'
  | 'alertas.resolver'
  | 'avisos.ver'
  | 'avisos.preparar'
  | 'avisos.aprobar'
  | 'riesgos.ver'
  | 'riesgos.editar'
  | 'auditoria.ver'
  | 'auditoria.editar'
  | 'documentos.descargar'
  | 'bitacora.ver';

/**
 * Matriz de presentación. NO es la frontera de seguridad: la frontera real son
 * las políticas RLS en Postgres. Esta matriz decide qué se dibuja; la base
 * decide qué se puede leer.
 */
export const MATRIZ_PERMISOS: Record<RolOrganizacion, readonly Permiso[]> = {
  propietario: [
    'org.editar', 'org.miembros',
    'clientes.ver', 'clientes.editar',
    'operaciones.ver', 'operaciones.editar', 'operaciones.importar',
    'alertas.ver', 'alertas.resolver',
    'avisos.ver', 'avisos.preparar', 'avisos.aprobar',
    'riesgos.ver', 'riesgos.editar',
    'auditoria.ver', 'auditoria.editar',
    'documentos.descargar', 'bitacora.ver',
  ],
  administrador: [
    'org.miembros',
    'clientes.ver', 'clientes.editar',
    'operaciones.ver', 'operaciones.editar', 'operaciones.importar',
    'alertas.ver', 'alertas.resolver',
    'avisos.ver', 'avisos.preparar', 'avisos.aprobar',
    'riesgos.ver', 'riesgos.editar',
    'auditoria.ver', 'auditoria.editar',
    'documentos.descargar', 'bitacora.ver',
  ],
  analista: [
    'clientes.ver', 'clientes.editar',
    'operaciones.ver', 'operaciones.editar', 'operaciones.importar',
    'alertas.ver', 'alertas.resolver',
    'avisos.ver', 'avisos.preparar',
    'riesgos.ver', 'riesgos.editar',
    'documentos.descargar',
  ],
  auditor: [
    'clientes.ver', 'operaciones.ver', 'alertas.ver', 'avisos.ver',
    'riesgos.ver', 'auditoria.ver', 'auditoria.editar',
    'documentos.descargar', 'bitacora.ver',
  ],
  consulta: [
    'clientes.ver', 'operaciones.ver', 'alertas.ver', 'avisos.ver', 'riesgos.ver',
  ],
};

export function puede(rol: RolOrganizacion, permiso: Permiso): boolean {
  return MATRIZ_PERMISOS[rol].includes(permiso);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Riesgo de clientes (enfoque basado en riesgos)
 * ────────────────────────────────────────────────────────────────────────── */

export type NivelRiesgo = 'bajo' | 'medio' | 'alto';

export type FactorRiesgoClave =
  | 'tipo_operacion'
  | 'tipo_cliente'
  | 'ubicacion_geografica'
  | 'canal_entrega'
  | 'pep'
  | 'beneficiario_controlador'
  | 'volumen_transaccional'
  | 'medio_pago';

export interface FactorRiesgo {
  clave: FactorRiesgoClave;
  etiqueta: string;
  /** 0-100. */
  puntaje: number;
  /** Peso relativo dentro de la metodología. Los pesos deben sumar 1. */
  ponderacion: number;
  justificacion?: string;
}

export interface Mitigante {
  clave: string;
  etiqueta: string;
  /** Reducción en puntos sobre el puntaje final. */
  reduccion: number;
}

export interface EvaluacionRiesgo {
  factores: readonly FactorRiesgo[];
  mitigantes: readonly Mitigante[];
  puntajeBruto: number;
  puntajeFinal: number;
  nivel: NivelRiesgo;
  requiereDebidaDiligenciaReforzada: boolean;
  /** ISO date: la metodología exige revisión al menos semestral. */
  proximaRevision: string;
  explicacion: string;
}
