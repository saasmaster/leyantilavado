import type { PreguntaFrecuente } from './tipos';

/**
 * Contenido de /multas.
 *
 * Los rangos NO están aquí: salen de `datos.SANCIONES`. Lo que vive en este
 * archivo es la estructura del régimen, que es justamente lo que casi todos los
 * resúmenes del mercado confunden:
 *
 *   art. 53 → qué hiciste mal (conductas infractoras)
 *   art. 54 → cuánto cuesta (rangos de multa, remitiendo a fracciones del 53)
 *   art. 55 → abstención y reducción por autocorrección
 *   art. 56 → revocación de permisos (NO es la autocorrección)
 */
export interface InfraccionArt53 {
  fraccion: string;
  conducta: string;
  /** id de la regla en `datos.SANCIONES` que fija el rango aplicable. */
  reglaSancionId: string;
  nota?: string;
}

export const INFRACCIONES_ART_53: readonly InfraccionArt53[] = [
  {
    fraccion: 'I',
    conducta:
      'Abstenerse de cumplir los requerimientos que formule la autoridad en términos de la ley.',
    reglaSancionId: 'art54-I--53-I',
  },
  {
    fraccion: 'II',
    conducta:
      'Incumplir cualquiera de las obligaciones del art. 18: identificación, expediente, beneficiario controlador, conservación, padrón, avisos, enfoque de riesgos, manual, capacitación, monitoreo automatizado y auditoría.',
    reglaSancionId: 'art54-I--53-II',
    nota:
      'Es la fracción con el alcance más amplio del régimen: cubre once obligaciones distintas, no sólo las relacionadas con avisos.',
  },
  {
    fraccion: 'III',
    conducta: 'Presentar de forma extemporánea los avisos del art. 17.',
    reglaSancionId: 'art54-I--53-III',
    nota:
      'La ley acota este supuesto a la presentación dentro de los treinta días siguientes a la fecha límite. Pasado ese plazo, el texto remite al tratamiento de la omisión, con una remisión cuya lectura literal es discutible.',
  },
  {
    fraccion: 'IV',
    conducta: 'Presentar los avisos sin reunir los requisitos que exige el art. 24.',
    reglaSancionId: 'art54-I--53-IV',
  },
  {
    fraccion: 'V',
    conducta:
      'Incumplir las obligaciones de los arts. 33, 33 Bis y 33 Ter: identificación de la forma de pago por fedatarios y régimen de beneficiario controlador de sociedades mercantiles.',
    reglaSancionId: 'art54-II--53-V',
  },
  {
    fraccion: 'VI',
    conducta: 'Omitir la presentación de los avisos a que se refiere el art. 17.',
    reglaSancionId: 'art54-III--53-VI',
    nota:
      'Además de la multa, es causa de revocación de permisos en ciertas actividades, de cancelación de patente aduanal y de aviso a la autoridad que supervisa la fe pública.',
  },
  {
    fraccion: 'VII',
    conducta: 'Participar en cualquiera de los actos u operaciones prohibidos por el art. 32.',
    reglaSancionId: 'art54-III--53-VII',
    nota: 'Mismas consecuencias adicionales que la omisión de avisos.',
  },
];

export const CONSECUENCIAS_NO_PECUNIARIAS: readonly {
  articulo: string;
  titulo: string;
  descripcion: string;
}[] = [
  {
    articulo: 'Art. 54 Bis',
    titulo: 'Suspensión temporal de operaciones',
    descripcion:
      'La autoridad puede ordenar la suspensión temporal de actos u operaciones con determinados clientes o usuarios, conforme a los mecanismos de las reglas de carácter general.',
  },
  {
    articulo: 'Art. 56',
    titulo: 'Revocación de permisos o autorizaciones',
    descripcion:
      'Procede en las actividades de juegos y sorteos, blindaje y traslado o custodia de valores, por reincidencia en las infracciones de las fracciones I a IV del art. 53 o por cualquiera de las conductas de las fracciones VI y VII. Este es el artículo 56: no es el de la autocorrección.',
  },
  {
    articulo: 'Art. 57',
    titulo: 'Cancelación de la habilitación del corredor público',
    descripcion:
      'Por reincidencia en las infracciones de las fracciones I a IV del art. 53, una vez firme la resolución.',
  },
  {
    articulo: 'Art. 58',
    titulo: 'Notorias deficiencias de notarios y corredores',
    descripcion:
      'La reincidencia en las fracciones I a V, y la violación de las fracciones VI y VII, se informan a la autoridad que supervisa la fe pública.',
  },
  {
    articulo: 'Art. 59',
    titulo: 'Cancelación de la autorización aduanal',
    descripcion:
      'Aplica a agentes, apoderados y agencias aduanales por reincidencia en las fracciones I a IV o por las conductas de las fracciones VI y VII.',
  },
  {
    articulo: 'Art. 52',
    titulo: 'Las multas son crédito fiscal',
    descripcion:
      'Se cobran mediante el procedimiento administrativo de ejecución, con todo lo que eso implica en materia de embargo y garantía.',
  },
];

export const CRITERIOS_GRADUACION: readonly string[] = [
  'La reincidencia, entendida como cometer la misma infracción dentro de los dos años siguientes a que quede firme la resolución anterior.',
  'Las acciones correctivas aplicadas por quien realiza la actividad vulnerable.',
  'La cuantía del acto u operación, por el principio de proporcionalidad.',
  'La intención con la que se realizó la conducta.',
];

export const NOTA_DISCORDANCIA_53_III = {
  titulo: 'Una remisión del art. 53, fracción III que no cuadra',
  texto:
    'El segundo párrafo de la fracción III señala que, cuando la extemporaneidad excede el plazo previsto, se aplica la sanción prevista para el caso de omisión en el art. 54, fracción II. Sin embargo, la omisión de avisos es la fracción VI del art. 53, sancionada por la fracción III del art. 54, que es un rango mucho más alto. Leída literalmente, la remisión envía a un rango intermedio.',
  postura:
    'No afirmamos cuál de las dos lecturas prevalece: es una probable imprecisión legislativa y su resolución depende del criterio de la autoridad y, en su caso, de los tribunales. Lo que sí conviene es conocer ambas lecturas antes de decidir si presentar un aviso con retraso o acogerse a la autocorrección.',
} as const;

export const REGIMEN_CFF = {
  titulo: 'Beneficiario controlador: el régimen fiscal es otro y viene en pesos',
  entrada:
    'El Código Fiscal de la Federación tiene su propio régimen de beneficiario controlador, distinto del de la Ley Antilavado. Obliga a toda persona moral, fideicomiso o figura jurídica —realice o no una actividad vulnerable— a obtener, conservar y proporcionar al SAT información fidedigna y actualizada de sus beneficiarios controladores.',
  diferencias: [
    {
      eje: 'Quién está obligado',
      lfpiorpi:
        'Quien realiza la actividad vulnerable, respecto de su cliente; y la sociedad mercantil respecto de sí misma en el capítulo específico de la ley.',
      cff: 'Toda persona moral, fideicomiso y figura jurídica, más notarios, corredores y entidades financieras que intervienen.',
    },
    {
      eje: 'Autoridad',
      lfpiorpi: 'Secretaría de Hacienda y UIF, con supervisión operativa del SAT.',
      cff: 'SAT, dentro de sus facultades de comprobación.',
    },
    {
      eje: 'Umbral de control por voto',
      lfpiorpi: 'Más de una cuarta parte del capital social.',
      cff: 'Un porcentaje menor, además del control contingente que la ley fiscal prevé expresamente.',
    },
    {
      eje: 'Cómo se expresa la multa',
      lfpiorpi: 'En veces el valor diario de la UMA.',
      cff: 'En pesos, con importes que se actualizan periódicamente, y por cada beneficiario controlador.',
    },
  ],
  cierre:
    'Una sociedad mercantil que además realiza una actividad vulnerable queda sujeta a ambos regímenes de forma acumulativa, con dos expedientes de beneficiario controlador que no son intercambiables: distinto umbral de control, distinta autoridad, distinto soporte documental y distinto régimen sancionador.',
} as const;

export const FAQ_MULTAS: readonly PreguntaFrecuente[] = [
  {
    pregunta: '¿Cuál es la diferencia entre el artículo 53 y el 54?',
    respuesta:
      'El 53 dice qué conductas son infracción y el 54 dice cuánto cuestan, remitiendo a las fracciones del 53. Confundirlos lleva a citar rangos que no corresponden a la conducta. Cuando alguien te diga "la fracción III es de tanto", pregúntale si habla de la fracción III del 53 o del 54.',
  },
  {
    pregunta: '¿Cuál es la diferencia de multa entre presentar tarde y no presentar?',
    respuesta:
      'Es la brecha más grande del régimen. La extemporaneidad dentro del plazo que fija la ley cae en el rango más bajo; la omisión cae en el rango más alto, con la alternativa porcentual sobre el valor del acto cuando es cuantificable en dinero. Por eso presentar tarde casi siempre es mejor que no presentar.',
  },
  {
    pregunta: '¿Cómo funciona la regla del porcentaje sobre el valor de la operación?',
    respuesta:
      'Sólo opera en la omisión de avisos y en las operaciones prohibidas por el art. 32, y sólo cuando el acto es cuantificable en dinero. En ese caso la autoridad aplica la cantidad mayor entre el rango en UMA y el porcentaje del valor. En operaciones grandes, el porcentaje domina.',
  },
  {
    pregunta: '¿Puedo regularizar avisos de años anteriores y reducir la multa?',
    respuesta:
      'La ley prevé dos escenarios: una abstención total de sancionar, por única ocasión, y una reducción de hasta el cincuenta por ciento cuando ya se usó el primero. Ambos exigen cumplimiento espontáneo antes de que inicien las facultades de verificación y reconocimiento expreso de la falta dentro del plazo aplicable. Ninguno es un derecho automático.',
  },
  {
    pregunta: '¿La autocorrección está en el artículo 55 o en el 56?',
    respuesta:
      'En el 55. El artículo 56 regula la revocación de permisos y autorizaciones, que es cosa distinta. Es una confusión frecuente en resúmenes que circulan en internet.',
  },
  {
    pregunta: '¿El incumplimiento es delito o sólo infracción administrativa?',
    respuesta:
      'Como regla, infracción administrativa. La ley sí contempla delitos, pero para conductas específicas como proporcionar información falsa o alterada para incorporarla a los avisos, o revelar información vinculada a un aviso. Son tipos penales autónomos con requisitos propios.',
  },
  {
    pregunta: '¿Me pueden clausurar o revocar el permiso?',
    respuesta:
      'La ley prevé la revocación de permisos en ciertas actividades, la cancelación de la habilitación del corredor público y la cancelación de autorizaciones aduanales, en supuestos de reincidencia o por omisión de avisos y operaciones prohibidas en efectivo.',
  },
  {
    pregunta: '¿Qué toma en cuenta la autoridad para fijar el monto dentro del rango?',
    respuesta:
      'La reincidencia, las acciones correctivas aplicadas, la cuantía del acto u operación y la intención con la que se realizó la conducta. Documentar las acciones correctivas antes de que llegue la revisión es lo que más mueve la aguja.',
  },
];
