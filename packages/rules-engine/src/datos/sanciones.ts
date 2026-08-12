import type {
  ConsecuenciaPenal,
  EscenarioAutocorreccion,
  Procedencia,
  ReglaSancion,
} from '@leyantilavado/types';

const P = (disposicion: string, fuentes = ['lfpiorpi-vigente']): Procedencia => ({
  fuentes,
  disposicion,
  verificacion: 'oficial_verificado',
  ultimaRevision: '2026-08-11',
  notaEditorial:
    'Contrastado contra el texto de la LFPIORPI publicado por la Cámara de Diputados (DOF 16-07-2025).',
});

/**
 * Estructura real de la ley, que casi todos los resúmenes del mercado
 * confunden:
 *
 *   Art. 53 → enumera las INFRACCIONES (qué hiciste mal).
 *   Art. 54 → enumera las MULTAS (cuánto cuesta), remitiendo a fracciones del 53.
 *
 * Por eso cada regla guarda ambos: `articulo: '54'` con la multa, y en
 * `supuesto` la conducta del 53 que la detona.
 */
export const SANCIONES: readonly ReglaSancion[] = [
  {
    id: 'art54-I--53-I',
    articulo: '54',
    fraccion: 'I',
    supuesto:
      'No cumplir con los requerimientos que formule la autoridad competente (art. 53, fracción I).',
    minUMA: 200,
    maxUMA: 2000,
    gravedad: 'media',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P('Art. 54, fracción I, en relación con el art. 53, fracción I'),
    estado: 'publicado',
  },
  {
    id: 'art54-I--53-II',
    articulo: '54',
    fraccion: 'I',
    supuesto:
      'No cumplir con las obligaciones de identificar al cliente o usuario, integrar el expediente o conservar la información (art. 53, fracción II).',
    minUMA: 200,
    maxUMA: 2000,
    gravedad: 'alta',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P('Art. 54, fracción I, en relación con el art. 53, fracción II'),
    estado: 'publicado',
  },
  {
    id: 'art54-I--53-III',
    articulo: '54',
    fraccion: 'I',
    supuesto:
      'Presentar los avisos de forma extemporánea, incompleta o sin cumplir los requisitos aplicables (art. 53, fracción III).',
    minUMA: 200,
    maxUMA: 2000,
    gravedad: 'alta',
    notas:
      'El texto vigente remite la extemporaneidad mayor a 30 días a la fracción II del art. 54. Existe una posible imprecisión legislativa en esa remisión: el caso concreto requiere análisis jurídico.',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P('Art. 54, fracción I, en relación con el art. 53, fracción III'),
    estado: 'publicado',
  },
  {
    id: 'art54-I--53-IV',
    articulo: '54',
    fraccion: 'I',
    supuesto: 'Incumplir cualquiera de las demás obligaciones de la ley (art. 53, fracción IV).',
    minUMA: 200,
    maxUMA: 2000,
    gravedad: 'media',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P('Art. 54, fracción I, en relación con el art. 53, fracción IV'),
    estado: 'publicado',
  },
  {
    id: 'art54-II--53-V',
    articulo: '54',
    fraccion: 'II',
    supuesto:
      'Incumplir las obligaciones previstas en los arts. 33, 33 Bis y 33 Ter, relativas al uso de la información y al régimen del representante encargado del cumplimiento (art. 53, fracción V).',
    minUMA: 2000,
    maxUMA: 10000,
    gravedad: 'alta',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P('Art. 54, fracción II, en relación con el art. 53, fracción V'),
    estado: 'publicado',
  },
  {
    id: 'art54-III--53-VI',
    articulo: '54',
    fraccion: 'III',
    supuesto: 'Omitir la presentación de los avisos (art. 53, fracción VI).',
    minUMA: 10000,
    maxUMA: 65000,
    alternativaPorcentaje: { minPct: 10, maxPct: 100 },
    gravedad: 'critica',
    notas:
      'Se aplica la cantidad que resulte MAYOR entre el rango en UMA y el porcentaje del valor del acto. El porcentaje sólo procede cuando el acto u operación es cuantificable en dinero; si no lo es, queda únicamente el rango en UMA.',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P('Art. 54, fracción III, en relación con el art. 53, fracción VI'),
    estado: 'publicado',
  },
  {
    id: 'art54-III--53-VII',
    articulo: '54',
    fraccion: 'III',
    supuesto:
      'Realizar operaciones liquidadas en efectivo o metales por encima de los límites del art. 32 (art. 53, fracción VII).',
    minUMA: 10000,
    maxUMA: 65000,
    alternativaPorcentaje: { minPct: 10, maxPct: 100 },
    gravedad: 'critica',
    notas:
      'Se aplica la cantidad que resulte MAYOR entre el rango en UMA y el porcentaje del valor del acto, cuando éste sea cuantificable en dinero.',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P('Art. 54, fracción III, en relación con el art. 53, fracción VII'),
    estado: 'publicado',
  },
];

/**
 * Autocorrección: art. 55 de la ley (NO el 56 — ése regula la revocación del
 * permiso). El procedimiento operativo está en el art. 55 Bis del Reglamento.
 */
export const ESCENARIOS_AUTOCORRECCION: readonly EscenarioAutocorreccion[] = [
  {
    clave: 'abstencion-unica-ocasion',
    titulo: 'Abstención de sanción por única ocasión',
    descripcion:
      'La autoridad puede abstenerse de sancionar, por única ocasión, cuando el sujeto obligado cumple espontáneamente antes de que inicien las facultades de verificación y reconoce expresamente la infracción dentro del plazo aplicable.',
    factorReduccion: 0,
    requisitos: [
      'Que el cumplimiento sea espontáneo y anterior al inicio de las facultades de verificación de la autoridad.',
      'Reconocimiento expreso de la infracción dentro del plazo inicial del procedimiento (5 días, conforme al art. 68 de la Ley Federal de Procedimiento Administrativo).',
      'Presentar escrito libre ante el SAT señalando la totalidad de las faltas, con la operación y el periodo de que se trate, bajo protesta de decir verdad y con la documentación soporte (art. 55 Bis del Reglamento).',
      'Que no se haya aplicado antes este beneficio: opera por única ocasión.',
    ],
    advertencia:
      'La abstención es una facultad de la autoridad, no un derecho del sujeto obligado. Este escenario es orientativo y no garantiza el resultado.',
  },
  {
    clave: 'reduccion-50',
    titulo: 'Reducción de hasta 50% de la multa',
    descripcion:
      'Cuando ya no procede la abstención, la ley contempla una reducción de hasta el 50% de la multa si el sujeto obligado reconoce la infracción y se autocorrige dentro del plazo aplicable.',
    factorReduccion: 0.5,
    requisitos: [
      'Reconocimiento expreso de la infracción dentro del plazo del art. 72 de la Ley Federal de Procedimiento Administrativo.',
      'Autocorrección efectiva y acreditada de la totalidad de la conducta.',
      'Seguir el procedimiento del art. 55 Bis del Reglamento.',
    ],
    advertencia:
      'El 50% es un máximo posible. El porcentaje concreto lo determina la autoridad y depende del caso; requiere revisión profesional.',
  },
];

export const CONSECUENCIAS_PENALES: readonly ConsecuenciaPenal[] = [
  {
    id: 'penal-informacion-falsa',
    articulo: '62',
    supuesto:
      'Proporcionar de manera dolosa información, documentación, datos o imágenes falsos, alterados o ilegibles a la autoridad, o presentarlos incompletos.',
    prisionAnios: { min: 2, max: 8 },
    multaDias: { min: 500, max: 2000 },
    notas:
      'La multa se expresa en días multa, cuyo valor se determina conforme al Código Penal Federal. Es un tipo penal independiente de las multas administrativas y su configuración depende del caso concreto: requiere análisis de un abogado penalista.',
    procedencia: {
      fuentes: ['lfpiorpi-vigente'],
      disposicion: 'Art. 62 LFPIORPI',
      verificacion: 'oficial_verificado',
      ultimaRevision: '2026-08-11',
      notaEditorial:
        'El valor del día multa (art. 29 del Código Penal Federal) no se ha contrastado directamente: el estimador no convierte días multa a pesos.',
    },
    estado: 'revisado',
  },
];

/**
 * Beneficiario controlador: régimen FISCAL, distinto del PLD.
 *
 * Las multas del CFF vienen ya en pesos (no en UMA) y se aplican POR CADA
 * beneficiario controlador respecto del cual se incumple. No se mezclan con
 * las multas de la LFPIORPI: son dos regímenes paralelos.
 */
export const SANCIONES_CFF_BENEFICIARIO_CONTROLADOR = [
  {
    id: 'cff-84n-a',
    articulo: 'CFF 84-N',
    supuesto:
      'No obtener, no conservar o no presentar la información del beneficiario controlador, o no presentarla mediante los medios oficiales.',
    minPesos: 1_686_750,
    maxPesos: 2_249_000,
    porCada: 'beneficiario controlador',
  },
  {
    id: 'cff-84n-b',
    articulo: 'CFF 84-N',
    supuesto:
      'No mantener actualizada la información del beneficiario controlador.',
    minPesos: 899_600,
    maxPesos: 1_124_500,
    porCada: 'beneficiario controlador',
  },
  {
    id: 'cff-84n-c',
    articulo: 'CFF 84-N',
    supuesto:
      'Presentar la información del beneficiario controlador de forma incompleta, inexacta, con errores o en forma distinta a la señalada.',
    minPesos: 562_250,
    maxPesos: 899_600,
    porCada: 'beneficiario controlador',
  },
] as const;
