import type { Centavos } from '@leyantilavado/types';
import { pesosACentavos } from '@leyantilavado/types';

/* ────────────────────────────────────────────────────────────────────────────
 * Planes.
 *
 * ATENCIÓN EDITORIAL: los importes de abajo son una PROPUESTA comercial, no
 * una lista de precios acordada, y hoy no se cobra ninguno (ver `pagos.ts`).
 * La página los muestra siempre acompañados de esa aclaración. Cuando el
 * precio quede fijado, se borra `PRECIOS_PROPUESTOS` y la nota desaparece
 * sola.
 * ────────────────────────────────────────────────────────────────────────── */

export const PRECIOS_PROPUESTOS = true;

export type ClavePlan =
  | 'usuario-gratuito'
  | 'empresa-basica'
  | 'empresa-profesional'
  | 'despacho'
  | 'perfil-gratuito'
  | 'perfil-profesional'
  | 'perfil-destacado';

export type FamiliaPlan = 'cumplimiento' | 'directorio';

export interface Plan {
  clave: ClavePlan;
  familia: FamiliaPlan;
  nombre: string;
  paraQuien: string;
  resumen: string;
  precioMensual: Centavos;
  /** null = no aplica (planes gratuitos). */
  precioAnual: Centavos | null;
  incluye: readonly string[];
  noIncluye: readonly string[];
  destacado?: boolean;
}

export const PLANES: readonly Plan[] = [
  /* ── Para quien tiene que cumplir ────────────────────────────────────── */
  {
    clave: 'usuario-gratuito',
    familia: 'cumplimiento',
    nombre: 'Usuario gratuito',
    paraQuien: 'Cualquiera que necesite entender si la ley le aplica.',
    resumen:
      'Todo el contenido explicativo y todas las calculadoras, sin cuenta y sin costo. No hay muro de pago sobre la información legal.',
    precioMensual: pesosACentavos(0),
    precioAnual: null,
    incluye: [
      'Todas las calculadoras públicas, sin límite de uso',
      'Fichas de las actividades vulnerables, umbrales y obligaciones',
      'Calendario de cumplimiento y bitácora de cambios normativos',
      'Directorio profesional completo, con contacto directo a proveedores',
      'Aviso por correo cuando cambia la UMA o se publica una reforma',
    ],
    noIncluye: [
      'Guardar tus operaciones o expedientes',
      'Recordatorios personalizados por cliente',
      'Documentos exportables con tu logotipo',
    ],
  },
  {
    clave: 'empresa-basica',
    familia: 'cumplimiento',
    nombre: 'Empresa básica',
    paraQuien: 'Un negocio con una sola actividad vulnerable y volumen bajo.',
    resumen:
      'Área privada para llevar clientes, operaciones y alertas de umbral de un solo negocio, con la bitácora que un auditor te va a pedir.',
    precioMensual: pesosACentavos('499.00'),
    precioAnual: pesosACentavos('4990.00'),
    incluye: [
      'Una actividad vulnerable y hasta 3 personas usuarias',
      'Registro de clientes y operaciones con alerta de acumulación de 6 meses',
      'Expedientes de identificación con recordatorio de documentos faltantes',
      'Calendario de avisos con aviso previo a la fecha límite',
      'Bitácora de quién hizo qué y cuándo',
    ],
    noIncluye: [
      'Varias actividades vulnerables en la misma cuenta',
      'Auditoría interna y papeles de trabajo',
      'Gestión de varias empresas cliente',
    ],
  },
  {
    clave: 'empresa-profesional',
    familia: 'cumplimiento',
    nombre: 'Empresa profesional',
    paraQuien: 'Empresas con varias actividades, sucursales o volumen alto.',
    resumen:
      'Todo lo de Básica más varias actividades, roles diferenciados y el material de soporte de una revisión.',
    precioMensual: pesosACentavos('1499.00'),
    precioAnual: pesosACentavos('14990.00'),
    destacado: true,
    incluye: [
      'Actividades vulnerables ilimitadas y hasta 15 personas usuarias',
      'Roles y permisos por área, incluida una vista de sólo lectura para auditoría',
      'Evaluación de riesgo por cliente con metodología documentada',
      'Expedientes con control de vigencia y conservación por 10 años',
      'Exportación completa de datos y acuses en cualquier momento',
    ],
    noIncluye: [
      'Administración de varias empresas cliente con facturación separada',
      'Marca propia en los documentos entregables',
    ],
  },
  {
    clave: 'despacho',
    familia: 'cumplimiento',
    nombre: 'Despacho',
    paraQuien: 'Contadores, abogados y consultores que llevan varias empresas.',
    resumen:
      'Una consola para administrar la cartera completa: cada cliente con su propio espacio, y un tablero que te dice a quién le vence qué esta semana.',
    precioMensual: pesosACentavos('3900.00'),
    precioAnual: pesosACentavos('39000.00'),
    incluye: [
      'Empresas cliente ilimitadas bajo una sola consola',
      'Tablero de vencimientos y pendientes de toda la cartera',
      'Personas usuarias ilimitadas de tu equipo, con roles por cliente',
      'Documentos exportables con tu marca',
      'Perfil profesional en el directorio incluido, sin costo adicional',
    ],
    noIncluye: [
      'Posición destacada o patrocinada en el directorio',
      'Servicios de consultoría prestados por LeyAntilavado.org: no los ofrecemos',
    ],
  },

  /* ── Para quien ofrece servicios ─────────────────────────────────────── */
  {
    clave: 'perfil-gratuito',
    familia: 'directorio',
    nombre: 'Perfil gratuito de directorio',
    paraQuien: 'Cualquier proveedor que quiera ser encontrado.',
    resumen:
      'Estar en el directorio no cuesta. La ficha básica es gratuita y aparece en las búsquedas con las mismas reglas que las demás.',
    precioMensual: pesosACentavos(0),
    precioAnual: null,
    incluye: [
      'Ficha con descripción, servicios, cobertura e idiomas',
      'Aparición en el buscador y en la página de tu categoría',
      'Formulario de contacto: recibes las solicitudes en tu correo',
      'Verificación de correo e identidad sin costo',
    ],
    noIncluye: [
      'Revisión de documentos profesionales',
      'Logotipo y enlace a tu sitio',
      'Estadísticas de cuánta gente vio tu perfil',
    ],
  },
  {
    clave: 'perfil-profesional',
    familia: 'directorio',
    nombre: 'Perfil profesional',
    paraQuien: 'Despachos que quieren mostrar credenciales revisadas.',
    resumen:
      'Añade logotipo, enlace, credenciales revisadas por nuestro equipo y estadísticas de contacto. No compra posición: el orden del listado no se vende.',
    precioMensual: pesosACentavos('690.00'),
    precioAnual: pesosACentavos('6900.00'),
    destacado: true,
    incluye: [
      'Logotipo, enlace a tu sitio y biografía extendida',
      'Revisión de documentos profesionales y certificaciones externas',
      'Estadísticas de vistas y solicitudes de contacto',
      'Hasta 3 categorías y actividades vulnerables ilimitadas',
    ],
    noIncluye: [
      'Mejor posición en los resultados: el orden lo define la comprobación, no el pago',
      'Bloque patrocinado',
    ],
  },
  {
    clave: 'perfil-destacado',
    familia: 'directorio',
    nombre: 'Perfil destacado',
    paraQuien: 'Proveedores que además quieren comprar visibilidad.',
    resumen:
      'Todo lo del perfil profesional más presencia en el bloque patrocinado. Ese bloque siempre está separado de los resultados y siempre lleva la etiqueta "Patrocinado" visible.',
    precioMensual: pesosACentavos('1890.00'),
    precioAnual: pesosACentavos('18900.00'),
    incluye: [
      'Todo lo del perfil profesional',
      'Presencia en el bloque patrocinado de tu categoría y de tu estado',
      'Etiqueta "Patrocinado" permanente y visible, con explicación al usuario',
      'Reporte mensual de vistas y solicitudes',
    ],
    noIncluye: [
      'Insignias de verificación que no correspondan a lo que efectivamente revisamos',
      'Aparecer sin la etiqueta "Patrocinado": no es negociable, en ningún plan',
      'Retirar de tu perfil los reportes que resulten fundados',
    ],
  },
];

export const PLANES_CUMPLIMIENTO = PLANES.filter((p) => p.familia === 'cumplimiento');
export const PLANES_DIRECTORIO = PLANES.filter((p) => p.familia === 'directorio');

/**
 * Filas de la tabla comparativa. Se escriben a mano y no se derivan de
 * `incluye`: comparar planes exige la misma pregunta para todos, no la lista
 * de argumentos de venta de cada uno.
 */
export interface FilaComparativa {
  criterio: string;
  valores: Record<ClavePlan, string>;
}

export const COMPARATIVA: readonly FilaComparativa[] = [
  {
    criterio: 'Contenido legal y calculadoras',
    valores: {
      'usuario-gratuito': 'Completo',
      'empresa-basica': 'Completo',
      'empresa-profesional': 'Completo',
      despacho: 'Completo',
      'perfil-gratuito': 'Completo',
      'perfil-profesional': 'Completo',
      'perfil-destacado': 'Completo',
    },
  },
  {
    criterio: 'Actividades vulnerables por cuenta',
    valores: {
      'usuario-gratuito': 'No aplica',
      'empresa-basica': '1',
      'empresa-profesional': 'Ilimitadas',
      despacho: 'Ilimitadas',
      'perfil-gratuito': 'No aplica',
      'perfil-profesional': 'No aplica',
      'perfil-destacado': 'No aplica',
    },
  },
  {
    criterio: 'Personas usuarias',
    valores: {
      'usuario-gratuito': '1',
      'empresa-basica': '3',
      'empresa-profesional': '15',
      despacho: 'Ilimitadas',
      'perfil-gratuito': '1',
      'perfil-profesional': '3',
      'perfil-destacado': '5',
    },
  },
  {
    criterio: 'Empresas cliente administradas',
    valores: {
      'usuario-gratuito': 'No',
      'empresa-basica': 'No',
      'empresa-profesional': 'No',
      despacho: 'Ilimitadas',
      'perfil-gratuito': 'No',
      'perfil-profesional': 'No',
      'perfil-destacado': 'No',
    },
  },
  {
    criterio: 'Perfil en el directorio',
    valores: {
      'usuario-gratuito': 'No',
      'empresa-basica': 'No',
      'empresa-profesional': 'No',
      despacho: 'Profesional incluido',
      'perfil-gratuito': 'Básico',
      'perfil-profesional': 'Ampliado',
      'perfil-destacado': 'Ampliado',
    },
  },
  {
    criterio: 'Revisión de documentos profesionales',
    valores: {
      'usuario-gratuito': 'No aplica',
      'empresa-basica': 'No aplica',
      'empresa-profesional': 'No aplica',
      despacho: 'Sí',
      'perfil-gratuito': 'No',
      'perfil-profesional': 'Sí',
      'perfil-destacado': 'Sí',
    },
  },
  {
    criterio: 'Bloque patrocinado, siempre etiquetado',
    valores: {
      'usuario-gratuito': 'No',
      'empresa-basica': 'No',
      'empresa-profesional': 'No',
      despacho: 'No',
      'perfil-gratuito': 'No',
      'perfil-profesional': 'No',
      'perfil-destacado': 'Sí',
    },
  },
  {
    criterio: 'Influencia en el orden de los resultados',
    valores: {
      'usuario-gratuito': 'Ninguna',
      'empresa-basica': 'Ninguna',
      'empresa-profesional': 'Ninguna',
      despacho: 'Ninguna',
      'perfil-gratuito': 'Ninguna',
      'perfil-profesional': 'Ninguna',
      'perfil-destacado': 'Ninguna',
    },
  },
  {
    criterio: 'Exportación de tus datos',
    valores: {
      'usuario-gratuito': 'No aplica',
      'empresa-basica': 'Sí',
      'empresa-profesional': 'Sí',
      despacho: 'Sí',
      'perfil-gratuito': 'Sí',
      'perfil-profesional': 'Sí',
      'perfil-destacado': 'Sí',
    },
  },
];
