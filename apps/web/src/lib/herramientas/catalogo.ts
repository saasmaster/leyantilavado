import {
  Banknote,
  BookOpenCheck,
  Calculator,
  CalendarClock,
  Route,
  MessageCircleQuestion,
  ClipboardCheck,
  Coins,
  Cpu,
  FileSpreadsheet,
  FolderCheck,
  GitCompareArrows,
  GraduationCap,
  Layers,
  ListChecks,
  Network,
  Scale,
  ShieldAlert,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * Catálogo de herramientas.
 *
 * Fuente única para el índice, para los "relacionados" al pie de cada
 * herramienta y para cualquier enlace interno. Si una herramienta no está
 * aquí, no existe: así no se publican rutas muertas.
 */

export type GrupoHerramienta =
  | 'diagnostico'
  | 'umbrales'
  | 'plazos'
  | 'clientes'
  | 'programa'
  | 'datos';

export interface Herramienta {
  slug: string;
  titulo: string;
  /** Frase corta para tarjetas y menús. */
  resumen: string;
  grupo: GrupoHerramienta;
  icono: LucideIcon;
  /** Se muestra en la tarjeta del índice: qué calcula de verdad. */
  queCalcula: string;
}

export const GRUPOS: { clave: GrupoHerramienta; titulo: string; descripcion: string }[] = [
  {
    clave: 'diagnostico',
    titulo: 'Saber si te aplica',
    descripcion:
      'Empieza aquí si todavía no tienes claro si tu actividad entra en el artículo 17 o qué te tocaría hacer.',
  },
  {
    clave: 'umbrales',
    titulo: 'Umbrales, montos y efectivo',
    descripcion:
      'Cálculo de identificación y aviso con la UMA vigente en la fecha de la operación, acumulación de seis meses y límites del artículo 32.',
  },
  {
    clave: 'plazos',
    titulo: 'Plazos y sanciones',
    descripcion:
      'Cuándo vence el aviso y qué rangos de multa contempla la ley para cada infracción.',
  },
  {
    clave: 'clientes',
    titulo: 'Clientes, riesgo y expedientes',
    descripcion:
      'Enfoque basado en riesgos, clasificación de clientes, beneficiario controlador y armado del expediente.',
  },
  {
    clave: 'programa',
    titulo: 'Programa de cumplimiento',
    descripcion:
      'Plan con fechas, preparación para auditoría, mecanismos automatizados y capacitación anual.',
  },
  {
    clave: 'datos',
    titulo: 'Trabajo con tus datos',
    descripcion: 'Carga masiva de operaciones desde una hoja de cálculo y evaluación en bloque.',
  },
];

export const HERRAMIENTAS: Herramienta[] = [
  {
    slug: 'consulta-libre',
    titulo: 'Consulta en lenguaje natural',
    resumen: 'Descríbelo con tus palabras.',
    grupo: 'diagnostico',
    icono: MessageCircleQuestion,
    queCalcula:
      'Interpreta una frase como «vendí un reloj de 180 mil en efectivo», enseña qué entendió para que lo corrijas, y resuelve el umbral con el motor.',
  },
  {
    slug: 'cuestionario',
    titulo: '¿Me aplica la Ley Antilavado?',
    resumen: 'Diagnóstico guiado que ramifica según tus respuestas.',
    grupo: 'diagnostico',
    icono: ListChecks,
    queCalcula:
      'Detecta las actividades vulnerables que realizas y evalúa cada una con el motor: umbral de identificación, umbral de aviso, efectivo y próximas fechas.',
  },
  {
    slug: 'comparador-obligaciones',
    titulo: 'Comparador de actividades',
    resumen: 'Dos o tres actividades vulnerables lado a lado.',
    grupo: 'diagnostico',
    icono: GitCompareArrows,
    queCalcula:
      'Pone frente a frente los umbrales, la periodicidad, la acumulación y las restricciones de efectivo de las actividades que elijas.',
  },
  {
    slug: 'calculadora-umbrales',
    titulo: 'Calculadora de umbrales',
    resumen: 'Actividad, subtipo, monto y fecha.',
    grupo: 'umbrales',
    icono: Calculator,
    queCalcula:
      'Resuelve si la operación alcanza el umbral de identificación y el de aviso, con la UMA vigente en la fecha capturada.',
  },
  {
    slug: 'calculadora-uma',
    titulo: 'Conversor de UMA',
    resumen: 'UMA a pesos y pesos a UMA, 2016-2026.',
    grupo: 'umbrales',
    icono: Coins,
    queCalcula:
      'Convierte en ambos sentidos con el valor histórico correcto, respetando que la UMA nueva entra en vigor el 1 de febrero.',
  },
  {
    slug: 'acumulacion-operaciones',
    titulo: 'Acumulación de seis meses',
    resumen: 'La regla antifraccionamiento, operación por operación.',
    grupo: 'umbrales',
    icono: Layers,
    queCalcula:
      'Suma las operaciones del mismo cliente dentro de la ventana móvil de seis meses y marca en cuál exactamente se disparó el aviso.',
  },
  {
    slug: 'limites-efectivo',
    titulo: 'Límites de efectivo (art. 32)',
    resumen: 'La prohibición que se mide CON IVA.',
    grupo: 'umbrales',
    icono: Banknote,
    queCalcula:
      'Compara la porción liquidada en efectivo o metales contra el límite de la actividad, usando la base con IVA que exige el artículo 32.',
  },
  {
    slug: 'plan-30-noviembre',
    titulo: 'Plan hacia el 30 de noviembre',
    resumen: 'Tu actividad y tu alta en el SPPLD.',
    grupo: 'plazos',
    icono: Route,
    queCalcula:
      'Arma la línea de tiempo de lo que hay que tener listo antes de que el Acuerdo 115/2026 entre en vigor, con el fundamento de cada hito y la cuenta regresiva.',
  },
  {
    slug: 'fecha-limite-aviso',
    titulo: 'Fecha límite del aviso',
    resumen: 'El día 17 del mes siguiente y sus trampas.',
    grupo: 'plazos',
    icono: CalendarClock,
    queCalcula:
      'Calcula la fecha límite nominal, los días restantes y las próximas seis fechas; exporta recordatorios en .ics.',
  },
  {
    slug: 'calculadora-multas',
    titulo: 'Estimador de multas',
    resumen: 'Rangos del art. 54 y escenarios de autocorrección.',
    grupo: 'plazos',
    icono: Scale,
    queCalcula:
      'Convierte los rangos en UMA a pesos, aplica la regla de la cantidad mayor frente al porcentaje del valor del acto y muestra el art. 55.',
  },
  {
    slug: 'matriz-riesgos',
    titulo: 'Matriz de riesgos',
    resumen: 'Enfoque basado en riesgos con ponderaciones editables.',
    grupo: 'clientes',
    icono: ShieldAlert,
    queCalcula:
      'Pondera los factores de riesgo, resta mitigantes, ubica el nivel resultante y fija la fecha de la próxima revisión.',
  },
  {
    slug: 'clasificacion-clientes',
    titulo: 'Clasificación de clientes',
    resumen: 'Riesgo por cliente, con cartera completa.',
    grupo: 'clientes',
    icono: Users,
    queCalcula:
      'Aplica la misma metodología a varios clientes a la vez y te deja exportar la cartera clasificada.',
  },
  {
    slug: 'beneficiario-controlador',
    titulo: 'Beneficiario controlador',
    resumen: 'Editor de estructura corporativa con propiedad indirecta.',
    grupo: 'clientes',
    icono: Network,
    queCalcula:
      'Multiplica los porcentajes a lo largo de la cadena de propiedad, marca a quien supera el umbral de control y señala lo que falta documentar.',
  },
  {
    slug: 'checklist-expediente',
    titulo: 'Checklist de expediente',
    resumen: 'KYC de persona física, moral y fideicomiso.',
    grupo: 'clientes',
    icono: FolderCheck,
    queCalcula:
      'Arma la lista de documentos según el tipo de cliente y el nivel de riesgo, con el avance y lo que falta.',
  },
  {
    slug: 'plan-cumplimiento',
    titulo: 'Plan de cumplimiento',
    resumen: 'Tus obligaciones con fechas reales.',
    grupo: 'programa',
    icono: BookOpenCheck,
    queCalcula:
      'Cruza tu actividad con el catálogo de obligaciones y el calendario del Acuerdo 115/2026 para armar un plan fechado.',
  },
  {
    slug: 'preparacion-auditoria',
    titulo: 'Preparación para auditoría',
    resumen: 'Autoevaluación con puntaje y brechas.',
    grupo: 'programa',
    icono: ClipboardCheck,
    queCalcula:
      'Evalúa qué evidencia tienes contra la que un auditor pedirá, y ordena las brechas por severidad.',
  },
  {
    slug: 'mecanismos-automatizados',
    titulo: 'Mecanismos automatizados',
    resumen: 'Autoevaluación contra los requisitos técnicos.',
    grupo: 'programa',
    icono: Cpu,
    queCalcula:
      'Revisa punto por punto los requisitos de detección, alertas y trazabilidad exigibles a partir de junio de 2027.',
  },
  {
    slug: 'capacitacion-anual',
    titulo: 'Capacitación anual',
    resumen: 'El periodo anual y su evidencia.',
    grupo: 'programa',
    icono: GraduationCap,
    queCalcula:
      'Controla el avance del periodo anual de capacitación y la evidencia que debe quedar documentada.',
  },
  {
    slug: 'importar-operaciones',
    titulo: 'Importador de operaciones',
    resumen: 'CSV validado fila por fila y evaluado en bloque.',
    grupo: 'datos',
    icono: FileSpreadsheet,
    queCalcula:
      'Valida cada fila, reporta los errores con su número de línea y evalúa las filas válidas con el motor.',
  },
];

export const HERRAMIENTAS_POR_SLUG: Record<string, Herramienta> = Object.fromEntries(
  HERRAMIENTAS.map((h) => [h.slug, h]),
);

export const rutaHerramienta = (slug: string) => `/herramientas/${slug}`;

/** Enlaces sugeridos al pie de una herramienta: las de su mismo grupo, más el índice. */
export function relacionadas(slug: string, extra: string[] = []): Herramienta[] {
  const actual = HERRAMIENTAS_POR_SLUG[slug];
  const mismoGrupo = HERRAMIENTAS.filter(
    (h) => h.slug !== slug && (h.grupo === actual?.grupo || extra.includes(h.slug)),
  );
  return mismoGrupo.slice(0, 4);
}
