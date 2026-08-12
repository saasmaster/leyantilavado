/* ────────────────────────────────────────────────────────────────────────────
 * Comparativo de software de cumplimiento LFPIORPI.
 *
 * Regla editorial de esta página: sólo se publica lo que revisamos nosotros.
 * En la revisión de escritorio del 11 de agosto de 2026 el único dato que
 * pudimos verificar en todos los proveedores fue si publican precio (ninguno
 * lo hace). Todo lo demás queda marcado como pendiente de comprobación, con
 * una fila que dice exactamente eso, en lugar de rellenarse con lo que dice
 * cada folleto comercial.
 *
 * Ningún proveedor paga por aparecer aquí ni por su posición, y hoy no existe
 * ninguna relación de afiliación. Si alguna vez la hubiera, se declara en la
 * página antes de la tabla, no en una nota al pie.
 * ────────────────────────────────────────────────────────────────────────── */

export const FECHA_REVISION_SOFTWARE = '2026-08-11';
export const HAY_RELACION_AFILIADOS = false;

export type ValorCriterio = 'si' | 'no' | 'parcial' | 'sin_verificar';

export const ETIQUETA_VALOR: Record<ValorCriterio, string> = {
  si: 'Sí',
  no: 'No',
  parcial: 'Parcial',
  sin_verificar: 'Sin comprobar',
};

export interface CriterioComparacion {
  clave: string;
  nombre: string;
  /** Por qué este criterio importa para decidir, en una frase. */
  porQueImporta: string;
  /** Cómo lo comprobamos: sin método verificable, el criterio no se publica. */
  comoLoComprobamos: string;
}

export const CRITERIOS: readonly CriterioComparacion[] = [
  {
    clave: 'precio-publico',
    nombre: 'Publica precio en su sitio',
    porQueImporta:
      'Sin precio público no puedes comparar sin entrar a un proceso comercial, y el costo real aparece cuando ya invertiste tiempo.',
    comoLoComprobamos:
      'Revisión directa del sitio público del proveedor, buscando una página de precios accesible sin formulario.',
  },
  {
    clave: 'mecanismos-automatizados',
    nombre: 'Mecanismos automatizados de alerta',
    porQueImporta:
      'La normativa vigente empuja hacia sistemas que detecten solos las operaciones que ameritan revisión, con fechas escalonadas de exigibilidad.',
    comoLoComprobamos:
      'Prueba con datos ficticios en una cuenta de evaluación, verificando que la alerta se dispara sin intervención humana.',
  },
  {
    clave: 'acumulacion',
    nombre: 'Calcula la acumulación por cliente',
    porQueImporta:
      'Es el punto donde más sistemas fallan: sumar las operaciones del mismo cliente dentro de la ventana que marca la ley, por tipo de acto.',
    comoLoComprobamos:
      'Carga de un juego de operaciones de prueba en el borde del umbral y cotejo del resultado contra nuestro propio motor de cálculo.',
  },
  {
    clave: 'pep-listas',
    nombre: 'Consulta de PEP y listas restrictivas',
    porQueImporta:
      'Si el sistema no la incluye, la consulta se contrata aparte y hay que integrarla, con costo por consulta.',
    comoLoComprobamos:
      'Verificación de que la consulta se hace dentro del producto y de que entrega constancia descargable, incluidas las consultas sin coincidencia.',
  },
  {
    clave: 'generacion-avisos',
    nombre: 'Genera el archivo del aviso',
    porQueImporta:
      'Es la diferencia entre un sistema que te ordena la información y uno que te resuelve el trámite mensual.',
    comoLoComprobamos:
      'Generación del archivo para al menos dos actividades vulnerables distintas y validación de su estructura.',
  },
  {
    clave: 'bitacora',
    nombre: 'Bitácora de auditoría',
    porQueImporta:
      'Quién capturó, quién modificó y cuándo. Sin bitácora, una revisión no puede confirmar que el expediente no se armó después del hecho.',
    comoLoComprobamos:
      'Inspección del registro de eventos y comprobación de que no se puede editar ni borrar desde la interfaz.',
  },
  {
    clave: 'exportacion',
    nombre: 'Exportación completa de datos y acuses',
    porQueImporta:
      'La obligación de conservar es tuya y dura años. Si no puedes exportar, estás rentando tu propia evidencia.',
    comoLoComprobamos:
      'Solicitud de exportación completa y verificación de que incluye documentos y acuses, no sólo tablas.',
  },
  {
    clave: 'cobertura-actividades',
    nombre: 'Cobertura de actividades vulnerables',
    porQueImporta:
      'Los campos del aviso cambian por actividad: un sistema puede cubrir muy bien una fracción e ignorar otra.',
    comoLoComprobamos:
      'Lista de actividades soportadas confirmada por el proveedor por escrito y contrastada con el producto.',
  },
];

export interface ProveedorSoftware {
  clave: string;
  nombre: string;
  sitio: string;
  /** Lo que sí pudimos observar por nuestra cuenta, sin intermediarios. */
  observacion: string;
  criterios: Record<string, ValorCriterio>;
}

/**
 * Estado inicial honesto: se publican los proveedores que aparecen de forma
 * consistente en los resultados de búsqueda del sector, con el único criterio
 * que verificamos por observación directa. El resto se llena conforme cada
 * proveedor nos dé acceso a una cuenta de evaluación.
 */
export const PROVEEDORES_SOFTWARE: readonly ProveedorSoftware[] = [
  {
    clave: 'armor-aml',
    nombre: 'ArmorAML',
    sitio: 'https://armor-aml.com',
    observacion:
      'Sitio comercial con páginas por actividad vulnerable. El acceso al producto pasa por una solicitud de demostración.',
    criterios: { 'precio-publico': 'no' },
  },
  {
    clave: 'aldda',
    nombre: 'ALDDA',
    sitio: 'https://aldda.mx',
    observacion:
      'Presencia larga en el sector y publicaciones anuales sobre umbrales. El producto no es accesible sin contacto comercial.',
    criterios: { 'precio-publico': 'no' },
  },
  {
    clave: 'kyc-systems',
    nombre: 'KYC Systems',
    sitio: 'https://kyc-systems.com',
    observacion:
      'El sitio con más contenido editorial del sector. El producto se presenta mediante demostración agendada.',
    criterios: { 'precio-publico': 'no' },
  },
  {
    clave: 'jaak',
    nombre: 'JAAK',
    sitio: 'https://jaak.ai',
    observacion:
      'Publica un simulador de cumplimiento accesible al público, lo que permite ver parte del comportamiento del producto antes de contratar.',
    criterios: { 'precio-publico': 'no' },
  },
  {
    clave: 'zero-clm',
    nombre: 'Zero CLM',
    sitio: 'https://zeroclm.com',
    observacion: 'Plataforma de cumplimiento con acceso mediante solicitud de demostración.',
    criterios: { 'precio-publico': 'no' },
  },
];

export function valorDe(proveedor: ProveedorSoftware, criterio: string): ValorCriterio {
  return proveedor.criterios[criterio] ?? 'sin_verificar';
}

/** Preguntas que conviene hacerle a cualquier proveedor antes de firmar. */
export const PREGUNTAS_AL_PROVEEDOR: readonly string[] = [
  '¿Cuál es el costo total del primer año: implantación, personas usuarias, consultas de listas y soporte?',
  '¿Puedo probar el sistema con mis propios datos antes de contratar?',
  '¿Qué actividades vulnerables cubre el generador del archivo de aviso?',
  '¿Cómo calcula la acumulación por cliente y puedo verlo con un caso en el borde del umbral?',
  '¿Dónde se almacenan los datos de mis clientes y bajo qué contrato de tratamiento?',
  '¿Qué pasa con mis datos y mis acuses el día que termine el contrato?',
  '¿La bitácora se puede editar o borrar desde la interfaz?',
  '¿Con qué frecuencia se actualizan las listas restrictivas y cuáles incluye?',
];
