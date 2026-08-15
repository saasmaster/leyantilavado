import type { Permiso } from '@leyantilavado/types';

export interface EnlacePanel {
  href: string;
  etiqueta: string;
  /** Permiso mínimo para VER el enlace. La lectura real la decide RLS. */
  permiso?: Permiso;
}

export interface GrupoPanel {
  titulo: string;
  enlaces: readonly EnlacePanel[];
}

export const NAVEGACION_PANEL: readonly GrupoPanel[] = [
  {
    titulo: 'Resumen',
    enlaces: [
      { href: '/panel', etiqueta: 'Panel de control' },
      { href: '/panel/calendario', etiqueta: 'Calendario de obligaciones' },
      { href: '/panel/alertas', etiqueta: 'Alertas', permiso: 'alertas.ver' },
    ],
  },
  {
    titulo: 'Clientes',
    enlaces: [
      { href: '/panel/clientes', etiqueta: 'Clientes y usuarios', permiso: 'clientes.ver' },
      { href: '/panel/beneficiarios', etiqueta: 'Beneficiarios controladores', permiso: 'clientes.ver' },
      { href: '/panel/expedientes', etiqueta: 'Expedientes y documentos', permiso: 'clientes.ver' },
      { href: '/panel/riesgo', etiqueta: 'Clasificación de riesgo', permiso: 'riesgos.ver' },
      { href: '/panel/perfil-transaccional', etiqueta: 'Perfil transaccional', permiso: 'riesgos.ver' },
      { href: '/panel/listas', etiqueta: 'PEP y listas de riesgo', permiso: 'riesgos.ver' },
    ],
  },
  {
    titulo: 'Operación',
    enlaces: [
      { href: '/panel/operaciones', etiqueta: 'Operaciones', permiso: 'operaciones.ver' },
      { href: '/panel/operaciones/importar', etiqueta: 'Importar CSV', permiso: 'operaciones.importar' },
      { href: '/panel/acumulacion', etiqueta: 'Reglas de acumulación', permiso: 'operaciones.ver' },
      { href: '/panel/casos', etiqueta: 'Casos de investigación', permiso: 'alertas.ver' },
      { href: '/panel/avisos', etiqueta: 'Registro de avisos', permiso: 'avisos.ver' },
    ],
  },
  {
    titulo: 'Cumplimiento',
    enlaces: [
      { href: '/panel/manual', etiqueta: 'Versiones del manual', permiso: 'auditoria.ver' },
      { href: '/panel/capacitacion', etiqueta: 'Evidencia de capacitación', permiso: 'auditoria.ver' },
      { href: '/panel/auditorias', etiqueta: 'Auditorías y hallazgos', permiso: 'auditoria.ver' },
      { href: '/panel/bitacora', etiqueta: 'Bitácora de cambios', permiso: 'bitacora.ver' },
      { href: '/panel/exportaciones', etiqueta: 'Exportaciones', permiso: 'documentos.descargar' },
    ],
  },
  {
    titulo: 'Organización',
    enlaces: [
      { href: '/panel/organizaciones', etiqueta: 'Organizaciones y sucursales' },
      { href: '/panel/miembros', etiqueta: 'Miembros y roles', permiso: 'org.miembros' },
      { href: '/panel/seguridad', etiqueta: 'Seguridad de mi cuenta' },
    ],
  },
];

export interface EnlaceAdmin {
  href: string;
  etiqueta: string;
}

export const NAVEGACION_ADMIN: readonly { titulo: string; enlaces: readonly EnlaceAdmin[] }[] = [
  {
    titulo: 'Corpus legal',
    enlaces: [
      { href: '/admin', etiqueta: 'Resumen' },
      { href: '/admin/fuentes', etiqueta: 'Fuentes oficiales' },
      { href: '/admin/versiones-legales', etiqueta: 'Versiones legales' },
      { href: '/admin/uma', etiqueta: 'Valores de la UMA' },
      { href: '/admin/actividades', etiqueta: 'Actividades vulnerables' },
      { href: '/admin/umbrales', etiqueta: 'Umbrales' },
      { href: '/admin/efectivo', etiqueta: 'Restricciones de efectivo' },
      { href: '/admin/sanciones', etiqueta: 'Sanciones' },
      { href: '/admin/obligaciones', etiqueta: 'Obligaciones' },
      { href: '/admin/fechas', etiqueta: 'Fechas del calendario' },
    ],
  },
  {
    titulo: 'Contenido',
    enlaces: [
      { href: '/admin/articulos', etiqueta: 'Artículos' },
      { href: '/admin/autores', etiqueta: 'Autores' },
      { href: '/admin/revisores', etiqueta: 'Revisores' },
      { href: '/admin/faq', etiqueta: 'Preguntas frecuentes' },
      { href: '/admin/glosario', etiqueta: 'Glosario' },
      { href: '/admin/plantillas', etiqueta: 'Plantillas' },
      { href: '/admin/alertas-contenido', etiqueta: 'Contenido desactualizado' },
      { href: '/admin/cambios', etiqueta: 'Registro de cambios' },
    ],
  },
  {
    titulo: 'Directorio y negocio',
    enlaces: [
      { href: '/admin/directorio', etiqueta: 'Altas del directorio' },
      { href: '/admin/proveedores', etiqueta: 'Proveedores' },
      { href: '/admin/verificaciones', etiqueta: 'Solicitudes de verificación' },
      { href: '/admin/patrocinios', etiqueta: 'Patrocinios' },
      { href: '/admin/leads', etiqueta: 'Solicitudes de contacto' },
      { href: '/admin/cursos', etiqueta: 'Cursos' },
    ],
  },
  {
    titulo: 'Plataforma',
    enlaces: [
      { href: '/admin/usuarios', etiqueta: 'Usuarios' },
      { href: '/admin/newsletter', etiqueta: 'Newsletter' },
      { href: '/admin/banderas', etiqueta: 'Banderas de funcionalidad' },
      { href: '/admin/monitor-fuentes', etiqueta: 'Monitor regulatorio' },
    ],
  },
];
