import type { CategoriaObligacion, Obligacion, Procedencia } from '@leyantilavado/types';
import { ULTIMA_MODIFICACION, ULTIMA_REVISION } from './revision';

const P = (disposicion: string, fuentes: string[] = ['lfpiorpi-vigente']): Procedencia => ({
  fuentes,
  disposicion,
  verificacion: 'fuente_secundaria',
  ultimaRevision: ULTIMA_REVISION,
  ultimaModificacion: ULTIMA_MODIFICACION,
  notaEditorial: 'Pendiente de contraste literal contra el texto vigente y el Acuerdo 115/2026.',
});

interface Def {
  slug: string;
  titulo: string;
  resumen: string;
  categoria: CategoriaObligacion;
  pasos: { texto: string; evidencia?: string }[];
  recurrencia?: Obligacion['recurrencia'];
  disposicion: string;
  fuentes?: string[];
}

const DEFS: Def[] = [
  {
    slug: 'alta-sppld',
    titulo: 'Alta y registro en el portal SPPLD',
    resumen:
      'Quien realiza una actividad vulnerable debe darse de alta en el padrón del SAT y habilitar su acceso al portal SPPLD para poder presentar avisos.',
    categoria: 'registro',
    recurrencia: 'unica',
    disposicion: 'Art. 18, fracción I',
    fuentes: ['lfpiorpi-vigente', 'sppld-portal'],
    pasos: [
      { texto: 'Contar con e.firma vigente de la persona física o moral.', evidencia: 'Constancia de e.firma' },
      { texto: 'Ingresar al portal SPPLD y seleccionar el alta en actividades vulnerables.' },
      { texto: 'Registrar cada actividad vulnerable que se realiza y su fecha de inicio.', evidencia: 'Acuse de alta' },
      { texto: 'Designar y registrar al representante encargado del cumplimiento.', evidencia: 'Acuse de designación' },
      { texto: 'Resguardar el acuse de alta y los datos de acceso.', evidencia: 'Acuse en PDF' },
    ],
  },
  {
    slug: 'representante-cumplimiento',
    titulo: 'Designación del representante encargado del cumplimiento',
    resumen:
      'Las personas morales deben designar ante la autoridad a un representante encargado del cumplimiento, con facultades suficientes y datos actualizados.',
    categoria: 'gobierno',
    recurrencia: 'unica',
    disposicion: 'Art. 20',
    pasos: [
      { texto: 'Elegir a una persona con nivel jerárquico y facultades suficientes.' },
      { texto: 'Formalizar la designación en el órgano de gobierno.', evidencia: 'Acta de designación' },
      { texto: 'Registrar la designación en el portal del SAT.', evidencia: 'Acuse de registro' },
      { texto: 'Actualizar el registro cuando cambie la persona designada.' },
    ],
  },
  {
    slug: 'identificacion-cliente',
    titulo: 'Identificación del cliente o usuario',
    resumen:
      'Antes o al momento de realizar el acto, hay que identificar de forma directa al cliente o usuario y verificar su identidad con documentos válidos.',
    categoria: 'identificacion',
    disposicion: 'Art. 18, fracción I',
    pasos: [
      { texto: 'Recabar los datos generales de la persona física o moral.', evidencia: 'Formato de identificación' },
      { texto: 'Verificar la identidad con identificación oficial vigente.', evidencia: 'Copia de identificación' },
      { texto: 'Solicitar por escrito si actúa por cuenta propia o de un tercero.', evidencia: 'Manifestación firmada' },
      { texto: 'Documentar la actividad u ocupación y el origen de los recursos.' },
    ],
  },
  {
    slug: 'expedientes',
    titulo: 'Integración y actualización de expedientes',
    resumen:
      'Cada cliente identificado requiere un expediente único de identificación, actualizado y disponible para la autoridad.',
    categoria: 'expediente',
    recurrencia: 'semestral',
    disposicion: 'Art. 18, fracción II',
    pasos: [
      { texto: 'Crear el expediente único al identificar al cliente.' },
      { texto: 'Incorporar la documentación soporte de cada operación.' },
      { texto: 'Revisar y actualizar los datos cuando cambien las circunstancias del cliente.' },
      { texto: 'Documentar la fecha y responsable de cada actualización.', evidencia: 'Bitácora de expediente' },
    ],
  },
  {
    slug: 'beneficiario-controlador',
    titulo: 'Identificación del beneficiario controlador',
    resumen:
      'Hay que preguntar y documentar quién es la persona física que finalmente se beneficia o controla al cliente, incluso cuando el control es indirecto.',
    categoria: 'identificacion',
    disposicion: 'Art. 18, fracción III',
    pasos: [
      { texto: 'Solicitar por escrito la manifestación del cliente sobre su beneficiario controlador.', evidencia: 'Manifestación firmada' },
      { texto: 'Reconstruir la cadena de propiedad hasta llegar a personas físicas.', evidencia: 'Organigrama corporativo' },
      { texto: 'Evaluar el control por medios distintos a la propiedad accionaria.' },
      { texto: 'Documentar los casos en que no fue posible determinarlo y las medidas tomadas.' },
    ],
  },
  {
    slug: 'conservacion-diez-anios',
    titulo: 'Conservación de información por diez años',
    resumen:
      'La información, documentación y soportes de las operaciones y de la identificación deben conservarse por diez años.',
    categoria: 'conservacion',
    disposicion: 'Art. 18, fracción IV',
    pasos: [
      { texto: 'Definir el repositorio y el formato de conservación.' },
      { texto: 'Garantizar respaldo y recuperación de la información.', evidencia: 'Política de respaldo' },
      { texto: 'Controlar accesos y registrar consultas.', evidencia: 'Bitácora de accesos' },
      { texto: 'Documentar el criterio de cómputo del plazo de diez años.' },
    ],
  },
  {
    slug: 'avisos',
    titulo: 'Presentación de avisos a más tardar el día 17',
    resumen:
      'Los avisos por operaciones que alcanzan el umbral se presentan a más tardar el día 17 del mes siguiente a aquel en que ocurrió la operación.',
    categoria: 'avisos',
    recurrencia: 'mensual',
    disposicion: 'Art. 23',
    fuentes: ['lfpiorpi-vigente', 'sppld-portal'],
    pasos: [
      { texto: 'Identificar las operaciones del mes que alcanzan el umbral de aviso.' },
      { texto: 'Preparar el archivo con el formato oficial vigente.' },
      { texto: 'Revisar y aprobar internamente antes de enviar.', evidencia: 'Registro de aprobación' },
      { texto: 'Enviar por el portal SPPLD y resguardar el acuse.', evidencia: 'Acuse de recepción' },
    ],
  },
  {
    slug: 'informes-en-ceros',
    titulo: 'Informes en ceros',
    resumen:
      'Cuando en el periodo no hubo operaciones que alcanzaran el umbral de aviso, de todas formas debe presentarse el informe correspondiente.',
    categoria: 'avisos',
    recurrencia: 'mensual',
    disposicion: 'Art. 23',
    fuentes: ['lfpiorpi-vigente', 'sppld-portal'],
    pasos: [
      { texto: 'Confirmar que en el periodo no hubo operaciones que alcanzaran el umbral.' },
      { texto: 'Presentar el informe en ceros dentro del mismo plazo del día 17.' },
      { texto: 'Resguardar el acuse.', evidencia: 'Acuse de recepción' },
    ],
  },
  {
    slug: 'operaciones-inusuales',
    titulo: 'Avisos de operaciones inusuales en 24 horas',
    resumen:
      'Cuando se detecta una operación inusual o preocupante, el aviso corre en un plazo mucho más corto que el ordinario. Incluye supuestos de operaciones intentadas.',
    categoria: 'avisos',
    disposicion: 'Art. 17 y disposiciones de carácter general',
    pasos: [
      { texto: 'Documentar la alerta y el análisis que la originó.', evidencia: 'Expediente del caso' },
      { texto: 'Escalar al representante encargado del cumplimiento.' },
      { texto: 'Presentar el aviso dentro del plazo de 24 horas cuando proceda.', evidencia: 'Acuse' },
      { texto: 'Registrar la decisión aunque se concluya que no procede el aviso.' },
    ],
  },
  {
    slug: 'enfoque-basado-riesgos',
    titulo: 'Metodología de enfoque basado en riesgos',
    resumen:
      'Se debe contar con una metodología documentada que evalúe los riesgos del negocio y clasifique a los clientes en función de ellos.',
    categoria: 'riesgos',
    recurrencia: 'anual',
    disposicion: 'Reglamento y disposiciones de carácter general',
    fuentes: ['lfpiorpi-vigente', 'dof-reglamento-2026', 'dof-acuerdo-115-2026'],
    pasos: [
      { texto: 'Identificar factores de riesgo: operación, cliente, geografía y canal de entrega.' },
      { texto: 'Asignar ponderaciones y documentar el criterio.', evidencia: 'Documento de metodología' },
      { texto: 'Definir mitigantes y su efecto en el puntaje.' },
      { texto: 'Usar información de los últimos doce meses o proyecciones si no hay historial.' },
      { texto: 'Revisar al menos una vez al año o cuando surjan nuevos riesgos.', evidencia: 'Acta de revisión' },
    ],
  },
  {
    slug: 'clasificacion-clientes',
    titulo: 'Clasificación de clientes por nivel de riesgo',
    resumen:
      'Cada cliente debe quedar clasificado en riesgo bajo, medio o alto, y la clasificación debe revisarse periódicamente.',
    categoria: 'riesgos',
    recurrencia: 'semestral',
    disposicion: 'Reglamento y disposiciones de carácter general',
    pasos: [
      { texto: 'Aplicar la metodología a cada cliente al darlo de alta.' },
      { texto: 'Registrar el nivel resultante y su justificación.', evidencia: 'Ficha de riesgo' },
      { texto: 'Aplicar debida diligencia reforzada a los de riesgo alto.' },
      { texto: 'Revisar la clasificación al menos cada seis meses.', evidencia: 'Bitácora de revisión' },
    ],
  },
  {
    slug: 'perfil-transaccional',
    titulo: 'Perfil transaccional y su revisión semestral',
    resumen:
      'Hay que construir un perfil esperado de operación para cada cliente y compararlo contra su comportamiento real de forma periódica.',
    categoria: 'riesgos',
    recurrencia: 'semestral',
    disposicion: 'Disposiciones de carácter general',
    pasos: [
      { texto: 'Definir el perfil esperado con base en la actividad declarada del cliente.' },
      { texto: 'Comparar el comportamiento real contra el perfil.' },
      { texto: 'Documentar y analizar las desviaciones relevantes.', evidencia: 'Reporte de desviaciones' },
      { texto: 'Actualizar el perfil al menos cada seis meses.' },
    ],
  },
  {
    slug: 'personas-politicamente-expuestas',
    titulo: 'Personas políticamente expuestas (PEP)',
    resumen:
      'Se debe identificar si el cliente, su beneficiario controlador o sus familiares cercanos son PEP y aplicar medidas reforzadas cuando así sea.',
    categoria: 'riesgos',
    disposicion: 'Disposiciones de carácter general',
    pasos: [
      { texto: 'Consultar al cliente y verificar contra fuentes de PEP.' },
      { texto: 'Extender la revisión a familiares y asociados cercanos.' },
      { texto: 'Obtener aprobación de un nivel jerárquico superior para iniciar o continuar la relación.', evidencia: 'Aprobación documentada' },
      { texto: 'Aplicar monitoreo reforzado y revisión más frecuente.' },
    ],
  },
  {
    slug: 'manual-cumplimiento',
    titulo: 'Manual de políticas y procedimientos internos',
    resumen:
      'El manual documenta cómo la organización cumple: identificación, expedientes, avisos, riesgos, capacitación, auditoría y conservación.',
    categoria: 'gobierno',
    recurrencia: 'anual',
    disposicion: 'Reglamento y disposiciones de carácter general',
    pasos: [
      { texto: 'Redactar las políticas de identificación, expediente y conservación.' },
      { texto: 'Documentar los criterios de detección y escalamiento de operaciones inusuales.' },
      { texto: 'Aprobar el manual en el órgano de gobierno.', evidencia: 'Acta de aprobación' },
      { texto: 'Versionar el manual y conservar las versiones anteriores.', evidencia: 'Control de versiones' },
    ],
  },
  {
    slug: 'mecanismos-automatizados',
    titulo: 'Mecanismos automatizados',
    resumen:
      'La normativa exige contar con sistemas que apoyen la detección de umbrales, la acumulación, las alertas y la trazabilidad de las decisiones.',
    categoria: 'tecnologia',
    disposicion: 'Reglamento y disposiciones de carácter general',
    fuentes: ['lfpiorpi-vigente', 'dof-reglamento-2026', 'dof-acuerdo-115-2026'],
    pasos: [
      { texto: 'Concentrar las operaciones en una base única y consultable.' },
      { texto: 'Configurar reglas de umbral y acumulación por actividad.' },
      { texto: 'Generar alertas y dejar registro de su resolución.', evidencia: 'Bitácora de alertas' },
      { texto: 'Conservar el historial de cambios de reglas con autor, fecha y motivo.', evidencia: 'Control de versiones de reglas' },
    ],
  },
  {
    slug: 'capacitacion',
    titulo: 'Capacitación anual del personal',
    resumen:
      'El personal involucrado debe recibir capacitación al menos una vez al año, con evidencia de asistencia y evaluación.',
    categoria: 'capacitacion',
    recurrencia: 'anual',
    disposicion: 'Reglamento y disposiciones de carácter general',
    pasos: [
      { texto: 'Definir el programa anual y el personal alcanzado.' },
      { texto: 'Impartir la capacitación y registrar asistencia.', evidencia: 'Lista de asistencia' },
      { texto: 'Evaluar la comprensión de los participantes.', evidencia: 'Resultados de evaluación' },
      { texto: 'Conservar constancias por el plazo aplicable.', evidencia: 'Constancias' },
    ],
  },
  {
    slug: 'investigacion-personal',
    titulo: 'Selección e investigación de personal',
    resumen:
      'Debe existir un procedimiento documentado para investigar los antecedentes del personal que participa en las funciones de cumplimiento.',
    categoria: 'gobierno',
    disposicion: 'Reglamento y disposiciones de carácter general',
    pasos: [
      { texto: 'Definir el alcance de la investigación por puesto.' },
      { texto: 'Documentar la verificación de antecedentes y referencias.', evidencia: 'Expediente de personal' },
      { texto: 'Registrar la decisión de contratación y sus fundamentos.' },
    ],
  },
  {
    slug: 'auditoria-anual',
    titulo: 'Auditoría anual de cumplimiento',
    resumen:
      'El programa de cumplimiento debe someterse a una auditoría con periodicidad anual, que genera hallazgos y un plan de remediación.',
    categoria: 'auditoria',
    recurrencia: 'anual',
    disposicion: 'Reglamento y disposiciones de carácter general',
    fuentes: ['lfpiorpi-vigente', 'dof-reglamento-2026', 'dof-acuerdo-115-2026'],
    pasos: [
      { texto: 'Seleccionar al auditor y verificar que cumpla los requisitos aplicables.' },
      { texto: 'Definir el alcance y el plan de trabajo.', evidencia: 'Carta de alcance' },
      { texto: 'Documentar hallazgos con su severidad.', evidencia: 'Informe de auditoría' },
      { texto: 'Establecer plan de remediación con responsables y fechas.', evidencia: 'Plan de remediación' },
      { texto: 'Dar seguimiento al cierre de cada hallazgo.' },
    ],
  },
  {
    slug: 'dictamen',
    titulo: 'Dictamen y seguimiento de observaciones',
    resumen:
      'El resultado de la auditoría se formaliza en un dictamen que se presenta ante la autoridad en el plazo aplicable.',
    categoria: 'auditoria',
    recurrencia: 'anual',
    disposicion: 'Disposiciones de carácter general',
    pasos: [
      { texto: 'Integrar el dictamen con base en el informe de auditoría.' },
      { texto: 'Aprobarlo en el órgano de gobierno.', evidencia: 'Acta de aprobación' },
      { texto: 'Presentarlo en el plazo aplicable y resguardar el acuse.', evidencia: 'Acuse' },
      { texto: 'Dar seguimiento a las observaciones hasta su cierre.' },
    ],
  },
];

export const OBLIGACIONES: readonly Obligacion[] = DEFS.map((d) => ({
  slug: d.slug,
  titulo: d.titulo,
  resumen: d.resumen,
  categoria: d.categoria,
  actividades: [],
  pasos: d.pasos.map((p, i) => ({
    id: `${d.slug}-${i + 1}`,
    texto: p.texto,
    ...(p.evidencia ? { evidencia: p.evidencia } : {}),
  })),
  ...(d.recurrencia ? { recurrencia: d.recurrencia } : {}),
  procedencia: P(d.disposicion, d.fuentes),
  estado: 'revisado' as const,
}));

export const OBLIGACIONES_POR_SLUG = Object.fromEntries(
  OBLIGACIONES.map((o) => [o.slug, o]),
);
