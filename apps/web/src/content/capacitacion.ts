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

/* ────────────────────────────────────────────────────────────────────────────
 * Cursos de paga.
 *
 * Aquí no entra nadie por pagarnos: no vendemos posiciones ni aceptamos
 * patrocinio en esta sección. Entra lo que podemos describir con datos
 * publicados por la propia institución, y se dice qué NO publica.
 *
 * El campo que decide es `evidencia`. La obligación de capacitación se cumple
 * pudiendo demostrar quién se formó, en qué y con qué resultado; un curso
 * excelente que no deja documento nominativo no cierra esa obligación. Es el
 * dato que menos se publica y el que más falta hace, así que cuando no está,
 * se dice que no está en lugar de suponerlo.
 * ────────────────────────────────────────────────────────────────────────── */

export interface CursoDePago {
  id: string;
  titulo: string;
  institucion: string;
  modalidad: string;
  horas: number;
  precioMXN: number;
  /** Qué documento entrega. `null` = la institución no lo publica. */
  evidencia: string | null;
  /** Advertencia sobre la evidencia, cuando hay algo que matizar. */
  notaEvidencia?: string;
  dirigidoA: string;
  requisitos?: string;
  proximasFechas: readonly string[];
  temario: readonly string[];
  url: string;
  /** Lo que la institución no publica. Se muestra tal cual. */
  sinPublicar: readonly string[];
}

export const CURSOS_DE_PAGO: readonly CursoDePago[] = [
  {
    id: 'tec-monterrey-antilavado',
    titulo: 'Ley Anti Lavado de Dinero y Manejo de Efectivo',
    institucion: 'Tecnológico de Monterrey — Educación Continua',
    modalidad: 'Aula virtual en vivo, con horario fijo (17:00–21:00 o 09:00–13:00, hora de México)',
    horas: 40,
    precioMXN: 31200,
    evidencia: 'Insignia digital verificable en Credly',
    notaEvidencia:
      'El criterio publicado para obtenerla es «concluir satisfactoriamente todos los módulos». La insignia es nominativa y verificable en línea, pero Credly no precisa que corresponda a esta edición virtual de 40 horas —el Tec ofrece también un taller y un seminario con el mismo nombre—. No hay ninguna fuente publicada que confirme constancia o diploma nominativo, ni el porcentaje de asistencia para acreditar. Si lo vas a usar como evidencia ante una revisión, confírmalo por escrito con la institución antes de inscribirte.',
    dirigidoA:
      'Servidores públicos y profesionales de derecho, administración, finanzas y contaduría; encargados de aplicar la ley dentro de la institución; contadores, notarios, corredores y agentes aduanales.',
    requisitos: 'Licenciatura terminada (la propia institución la enuncia como requisito en su temario y como preferencia en el resumen).',
    proximasFechas: ['2026-09-11', '2027-01-08'],
    temario: [
      'Antecedentes internacionales y marco legal en México: GAFI, Basilea, modelo FATCA, código penal, y la ley con su reglamento y reglas de carácter general.',
      'Actividades vulnerables: umbrales para identificar y para avisar, reglas para determinarlos, y sectores de alto riesgo con casos prácticos.',
      'Operaciones inusuales y tipologías: prestanombres, empresa fachada, dispersor, operatividad incongruente; clasificación de clientes y personas políticamente expuestas.',
      'Reglas de carácter general y procedimientos: manuales, expedientes, visitas de verificación, alta y envío de avisos paso a paso, infracciones y delitos.',
      'Controles de confianza del personal: el empleado como adversario interno, esquemas de verificación y fases desde el reclutamiento hasta el retiro.',
    ],
    url: 'https://educacioncontinua.tec.mx/programas/ley-anti-lavado-de-dinero-y-manejo-de-efectivo-virtual',
    sinPublicar: [
      'Constancia o diploma nominativo, y porcentaje de asistencia para acreditar',
      'Número exacto de sesiones por módulo',
      'Nombre de los instructores de cada módulo',
      'Monto de los descuentos que anuncia',
    ],
  },
];
