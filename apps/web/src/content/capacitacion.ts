/**
 * Capacitación oficial y gratuita.
 *
 * Todo lo de aquí es del gobierno mexicano y no cuesta nada. Se publica por un
 * motivo concreto: la obligación de capacitación anual arranca en 2027 y ya
 * hay quien vende "cursos oficiales del SAT" o "certificaciones de la UIF"
 * que no existen. El propio portal SPPLD dice que los foros y seminarios en
 * los que participan la UIF o el SAT son totalmente gratuitos.
 *
 * Ninguna entrada es un curso que nosotros impartamos ni que nos pague por
 * aparecer. Son enlaces a la fuente, con lo que hay detrás descrito tal cual.
 */

export interface RecursoOficial {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  organismo: 'SAT' | 'UIF' | 'SAT y UIF';
  formato: 'Portal' | 'Programa presencial y virtual' | 'Documentación' | 'Comunicado';
  gratuito: true;
  /** Qué se puede demostrar con esto ante una revisión, si es que algo. */
  sirveComoEvidencia: string;
}

export const RECURSOS_OFICIALES: readonly RecursoOficial[] = [
  {
    id: 'sppld',
    titulo: 'Portal de Prevención de Lavado de Dinero (SPPLD)',
    descripcion:
      'El sistema donde te das de alta y presentas avisos, y también el repositorio de material de apoyo del SAT: instructivos de llenado, catálogos y archivos XSD, preguntas frecuentes y criterios, recomendaciones técnicas, marco jurídico, glosario, umbrales de identificación y aviso, restricciones de efectivo y metales, entidades colegiadas, visitas de verificación, sanciones administrativas, régimen transitorio y listas GAFI.',
    url: 'https://sppld.sat.gob.mx/',
    organismo: 'SAT',
    formato: 'Portal',
    gratuito: true,
    sirveComoEvidencia:
      'No genera constancia. Es la fuente para preparar tu propio material, no un curso que puedas acreditar.',
  },
  {
    id: 'programa-capacitacion-sat',
    titulo: 'Programa de capacitación especializada del SAT y la UIF',
    descripcion:
      'Programa que opera desde junio de 2025 mediante reuniones virtuales y presenciales con sujetos obligados, coordinadas a través de las asociaciones y colegios de cada sector. Hasta el comunicado de febrero de 2026 había capacitado a colegios de notarios, de corredores públicos y de contadores públicos, y a artistas plásticos, inmobiliarias, juegos con apuestas y comercializadoras de vehículos.',
    url: 'https://www.gob.mx/sat/prensa/capacita-sat-sobre-actividades-vulnerables-y-prevencion-de-lavado-de-dinero-08-2026',
    organismo: 'SAT y UIF',
    formato: 'Programa presencial y virtual',
    gratuito: true,
    sirveComoEvidencia:
      'Depende de la sesión. Si asistes, pide constancia o lista de asistencia sellada: sin documento no puedes acreditarlo después.',
  },
  {
    id: 'minisitio-actividades-vulnerables',
    titulo: 'Minisitio de Actividades Vulnerables del SAT',
    descripcion:
      'Sitio del SAT organizado por sector con derechos y obligaciones de cada actividad vulnerable, alta en el SPPLD y presentación de avisos e informes.',
    url: 'https://www.sat.gob.mx/personas/actividades-vulnerables',
    organismo: 'SAT',
    formato: 'Documentación',
    gratuito: true,
    sirveComoEvidencia:
      'No genera constancia. Sirve para redactar tu manual y tu material interno con la redacción de la autoridad.',
  },
  {
    id: 'infosat',
    titulo: 'INFOSAT — dudas concretas por teléfono o chat',
    descripcion:
      'Línea de atención del SAT para dudas sobre el alta, los avisos y el uso del sistema. Es el canal para preguntas de trámite, no para asesoría sobre si tu caso encuadra en una fracción.',
    url: 'https://www.sat.gob.mx/portal/public/tramites/chat',
    organismo: 'SAT',
    formato: 'Portal',
    gratuito: true,
    sirveComoEvidencia:
      'Ninguna. Lo que te digan por teléfono no vincula a la autoridad ni te protege en una verificación.',
  },
];

/**
 * Lo que la capacitación tiene que producir para servir de algo.
 *
 * La obligación no se cumple asistiendo: se cumple pudiendo demostrar quién
 * asistió, a qué, cuándo y con qué resultado. Un curso que no deja documento
 * es tiempo invertido que no se puede acreditar.
 */
export const EVIDENCIA_EXIGIBLE: readonly { punto: string; porque: string }[] = [
  {
    punto: 'Constancia individual con nombre completo de cada persona',
    porque:
      'La obligación es por persona, no por empresa. Una constancia a nombre de la razón social no demuestra quién se capacitó.',
  },
  {
    punto: 'Temario y número de horas',
    porque:
      'Sin temario no se puede comprobar que el curso cubrió la materia que el puesto de esa persona necesita.',
  },
  {
    punto: 'Fecha de impartición dentro del periodo anual',
    porque:
      'El periodo corre del 1 de enero al 31 de diciembre. Un curso de diciembre no cubre el año siguiente.',
  },
  {
    punto: 'Contra qué texto vigente se preparó el contenido',
    porque:
      'Entre la reforma de julio de 2025 y el Acuerdo 115/2026 cambiaron umbrales y obligaciones. Un curso con material anterior enseña reglas que ya no rigen.',
  },
  {
    punto: 'Evaluación con resultado',
    porque:
      'Sin evaluación puedes demostrar asistencia, pero no aprovechamiento, que es lo que da sentido a la obligación.',
  },
];
