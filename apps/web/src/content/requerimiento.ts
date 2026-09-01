import type { PreguntaFrecuente } from './tipos';

/**
 * Contenido de /requerimiento-sat.
 *
 * Es la página más delicada del sitio: quien la lee tiene un oficio en la mano
 * y va a decidir con esto. Por eso aquí no hay un solo plazo sin su artículo,
 * y lo que no pudo confirmarse en fuente oficial vive en `SIN_CONFIRMAR` en
 * lugar de publicarse redondeado.
 *
 * Los rangos de multa NO están aquí: viven en `datos.SANCIONES` y se consultan
 * desde `/herramientas/calculadora-multas`. Esta página enlaza, no repite.
 *
 * Textos oficiales leídos para redactarla (ver `FUENTES_CONSULTADAS`):
 *   LFPIORPI, última reforma DOF 16-07-2025.
 *   Reglamento de la LFPIORPI, última reforma DOF 27-03-2026.
 *   Ley Federal de Procedimiento Administrativo, última reforma DOF 14-11-2025.
 *   Ley Federal de Procedimiento Contencioso Administrativo, última reforma DOF 09-06-2026.
 *   Acuerdo 115/2026 (reglas de carácter general), DOF 07-08-2026.
 */

/**
 * Fecha en que se leyeron los textos oficiales citados en esta página.
 *
 * 1-sep-2026: las cinco fichas de reformas vueltas a comprobar, y las cinco
 * siguen dando la misma última reforma que cuando se redactó la página. No es
 * un detalle menor: los plazos de esta página salen de la LFPA y la LFPCA, no
 * de la LFPIORPI, y son las dos que más se reforman sin que nadie lo anuncie.
 */
export const CONSULTA_FUENTES = '2026-09-01';

/* ── Los tres papeles que no son lo mismo ─────────────────────────────────── */

export interface DocumentoRecibido {
  clave: string;
  titulo: string;
  etiqueta: string;
  tono: 'neutro' | 'ambar' | 'rojo';
  queEs: string;
  fundamento: string;
  reaccion: string;
  advertencia: string;
}

export const DOCUMENTOS: readonly DocumentoRecibido[] = [
  {
    clave: 'carta',
    titulo: 'Carta de orientación o carta invitación',
    etiqueta: 'No es una figura de la ley',
    tono: 'neutro',
    queEs:
      'Un oficio que invita a regularizarse: normalmente a darse de alta en el padrón o a presentar avisos que la autoridad no ve. No abre un expediente sancionador ni te impone todavía una multa.',
    fundamento:
      'Las palabras «carta invitación» no aparecen en la LFPIORPI, ni en su Reglamento, ni en el Acuerdo 115/2026. Es una práctica administrativa, no un acto regulado con nombre propio.',
    reaccion:
      'Es el momento más valioso de los tres. El art. 55 de la ley ata sus beneficios al cumplimiento espontáneo «previo al inicio de las facultades de verificación», y el art. 34 llama facultades de verificación a la visita y al requerimiento de información. Una carta no es ninguna de las dos.',
    advertencia:
      'El plazo que la carta menciona sale de la carta, no de la ley: ningún artículo de la LFPIORPI ni de su Reglamento fija un término para responderla. Lee el oficio, anota su fecha de notificación y verifica el plazo ahí mismo.',
  },
  {
    clave: 'requerimiento',
    titulo: 'Requerimiento de información',
    etiqueta: 'Ya es facultad de verificación',
    tono: 'ambar',
    queEs:
      'La autoridad te pide, por escrito y fuera de una visita, información, documentación, datos e imágenes soporte de tus operaciones, avisos e informes.',
    fundamento:
      'Arts. 25 y 34 LFPIORPI; art. 8 del Reglamento. El art. 34 lo enuncia junto a la visita como la vía para comprobar el cumplimiento, dentro del Capítulo V «De las Visitas de Verificación».',
    reaccion:
      'Contestar completo y a tiempo, y entregar sólo lo que el art. 34, segundo párrafo, exige: la información con que cuentes que esté directamente relacionada con las actividades vulnerables que realizas.',
    advertencia:
      'Leído junto al art. 34, un requerimiento ya es ejercicio de las facultades de verificación. Si esa lectura es la correcta, la espontaneidad del art. 55 ya no está disponible para lo que el requerimiento abarca. No lo damos por resuelto: consúltalo con un abogado antes de decidir tu estrategia.',
  },
  {
    clave: 'visita',
    titulo: 'Visita de verificación',
    etiqueta: 'Procedimiento con acta',
    tono: 'rojo',
    queEs:
      'Personal del SAT acude al domicilio que registraste al darte de alta y levanta un acta de verificación de lo que encuentra.',
    fundamento:
      'Capítulo V de la LFPIORPI (arts. 34 a 37); art. 5, fr. III del Reglamento. El art. 18, fr. V de la ley te obliga a dar facilidades para la visita.',
    reaccion:
      'Estar presente o dejar a alguien facultado, revisar el acta antes de firmarla y hacer constar en ella lo que no sea exacto. Si no alcanzas a decirlo en la diligencia, el art. 68 LFPA te da cinco días hábiles para hacerlo por escrito.',
    advertencia:
      'La verificación sólo puede abarcar actos u operaciones de los cinco años inmediatos anteriores a la fecha de inicio de la visita (art. 36 LFPIORPI). Un periodo más viejo que eso está fuera de su alcance.',
  },
];

/* ── El reloj ─────────────────────────────────────────────────────────────── */

export interface PlazoCitado {
  momento: string;
  plazo: string;
  fundamento: string;
  nota?: string;
}

/**
 * Todos los plazos de esta tabla se leyeron en el texto oficial.
 *
 * Los de la LFPA se cuentan en días hábiles porque su art. 28 excluye los
 * inhábiles de los plazos fijados en días. Los del Reglamento ya dicen
 * «hábiles» en su propio texto.
 */
export const PLAZOS: readonly PlazoCitado[] = [
  {
    momento: 'Responder un requerimiento de información',
    plazo: '10 días hábiles',
    fundamento: 'Art. 8, primer párrafo, del Reglamento de la LFPIORPI',
    nota: 'Se cuentan a partir del día siguiente a aquel en que recibes el requerimiento.',
  },
  {
    momento: 'Pedir prórroga para responderlo',
    plazo: 'Hasta 5 días hábiles más',
    fundamento: 'Art. 8, segundo párrafo, del Reglamento',
    nota: 'La solicitud debe presentarse dentro del plazo original de diez días. Pedida después, el propio texto la deja fuera.',
  },
  {
    momento: 'Desvirtuar los hechos u omisiones del oficio de observaciones',
    plazo: '5 días hábiles',
    fundamento: 'Art. 9, primer párrafo, del Reglamento',
    nota: 'Si dejas pasar este plazo probatorio sin documentación que los desvirtúe, el mismo artículo tiene por consentidos los hechos u omisiones.',
  },
  {
    momento: 'Formular observaciones y ofrecer pruebas tras un acta de verificación',
    plazo: '5 días',
    fundamento: 'Art. 68 LFPA, aplicable de forma supletoria por el art. 35 LFPIORPI',
    nota: 'El art. 55 Bis del Reglamento identifica este término como el «plazo inicial del procedimiento de verificación» del art. 55, primer párrafo, de la ley.',
  },
  {
    momento: 'Exponer lo que a tu derecho convenga en el procedimiento sancionador',
    plazo: '15 días',
    fundamento: 'Art. 72 LFPA',
    nota: 'El art. 55 Bis del Reglamento identifica este periodo como el «plazo inicial del procedimiento sancionador» del art. 55, segundo párrafo, de la ley.',
  },
  {
    momento: 'Manifestarte sobre información que otras autoridades aportaron a tu expediente',
    plazo: '10 días hábiles',
    fundamento: 'Art. 10 Bis, tercer párrafo, del Reglamento',
  },
  {
    momento: 'Interponer el recurso de revisión ante la propia autoridad',
    plazo: '15 días',
    fundamento: 'Art. 61 LFPIORPI, que remite a la LFPA; plazo del art. 85 LFPA',
    nota: 'Se cuentan desde el día siguiente a aquel en que surtió efectos la notificación de la resolución que recurres.',
  },
  {
    momento: 'Demandar la nulidad ante el Tribunal Federal de Justicia Administrativa',
    plazo: '30 días',
    fundamento: 'Art. 61 LFPIORPI; art. 13, fr. I, inciso a) de la LFPCA',
    nota: 'Contados desde que surtió efectos la notificación de la resolución impugnada.',
  },
];

/** Plazos que corren a favor de quien recibe el oficio, no en su contra. */
export const PLAZOS_A_FAVOR: readonly PlazoCitado[] = [
  {
    momento: 'Alcance máximo hacia atrás de una verificación',
    plazo: '5 años',
    fundamento: 'Art. 36 LFPIORPI',
    nota: 'Contados hacia atrás desde la fecha de inicio de la visita.',
  },
  {
    momento: 'Prescripción de la facultad de la autoridad para imponer sanciones',
    plazo: '5 años',
    fundamento: 'Art. 79 LFPA',
    nota: 'Corren de forma continua desde el día en que se cometió la infracción, o desde que cesó si fue continua.',
  },
  {
    momento: 'Caducidad de un procedimiento iniciado de oficio',
    plazo: '30 días',
    fundamento: 'Art. 60, tercer párrafo, LFPA',
    nota: 'Contados a partir de que expira el plazo para dictar resolución. Se declara a solicitud de parte o de oficio.',
  },
];

/* ── Qué pasa si no respondes ─────────────────────────────────────────────── */

export const NO_RESPONDER = {
  titulo: 'Qué pasa si dejas pasar el plazo',
  entrada:
    'El art. 8, tercer párrafo, del Reglamento describe una consecuencia que conviene leer despacio, porque no es la que la mayoría espera.',
  puntos: [
    'Si el requerimiento no se atiende —o se atiende sin entregar lo pedido en los términos requeridos—, el SAT impone las sanciones que correspondan en un plazo que no excederá de diez días hábiles.',
    'Ese mismo párrafo dice que lo hace «sin implementar el procedimiento sancionador» de la Ley Federal de Procedimiento Administrativo. Es decir: sin los quince días del art. 72 LFPA para exponer lo que a tu derecho convenga.',
    'Abstenerse de cumplir un requerimiento es, además, la fracción I del art. 53 de la ley, con el rango de multa que le asigna el art. 54.',
    'Si la autoridad no te localiza en el domicilio que registraste al darte de alta, el art. 5, fr. III del Reglamento la habilita para verificar o requerir en el domicilio que tengas registrado ante el RFC.',
  ],
  cierre:
    'Dicho de otro modo: el silencio no compra tiempo, lo quita. El camino largo —contestar aunque sea de forma incompleta y explicar por qué— conserva las etapas que el camino corto elimina.',
} as const;

/* ── Artículo 55 ──────────────────────────────────────────────────────────── */

export const ART_55 = {
  entrada:
    'El art. 55 de la LFPIORPI prevé dos beneficios distintos y no intercambiables. Los dos exigen lo mismo en la parte que más pesa: que el cumplimiento sea espontáneo y anterior al inicio de las facultades de verificación.',
  literalPrimerParrafo:
    'El primer párrafo obliga a la Secretaría a abstenerse de sancionar, por única ocasión, el total de las infracciones, siempre y cuando se cumpla de manera espontánea y previa al inicio de las facultades de verificación con las obligaciones respectivas y se reconozca expresamente la falta dentro del plazo inicial del procedimiento de verificación.',
  literalSegundoParrafo:
    'El segundo párrafo aplica cuando ese beneficio ya se ejerció: entonces la Secretaría reduce hasta en un cincuenta por ciento el monto de las multas de las infracciones que se regularicen de manera espontánea y previa al inicio de las facultades de verificación, siempre que se reconozca expresamente la falta dentro del plazo inicial del procedimiento sancionador.',
  ojo:
    'El art. 55 vive en el Capítulo VII de la ley. El art. 56, con el que se le confunde a menudo, regula la revocación de permisos y autorizaciones: es otra cosa.',
} as const;

/** El escrito de reconocimiento expreso, tal como lo pide el Reglamento. */
export const ESCRITO_RECONOCIMIENTO = {
  titulo: 'El escrito de reconocimiento expreso, requisito por requisito',
  fundamento: 'Art. 55 Bis del Reglamento de la LFPIORPI (adicionado el 27 de marzo de 2026)',
  requisitos: [
    'Escrito libre ante el SAT, firmado por quien realiza la actividad vulnerable o por su representante legal, adjuntando la documentación que acredite esa personalidad.',
    'En el escrito, especificar de forma clara y precisa la totalidad de las faltas en que se incurrió, detallando la operación y el periodo en que se debió haber dado cumplimiento.',
    'Manifestar, bajo protesta de decir verdad, que la totalidad de las faltas detalladas han sido corregidas o subsanadas.',
    'Anexar la documentación que acredite el cumplimiento de la totalidad de las obligaciones objeto de infracción.',
  ],
  advertencia:
    'La palabra que decide es «totalidad», y aparece dos veces. Un escrito que reconoce parte de las faltas o que se presenta antes de haberlas corregido todas no reúne lo que el artículo pide.',
} as const;

/* ── La advertencia sobre la espontaneidad ────────────────────────────────── */

export const ESPONTANEIDAD = {
  titulo: 'Presentar avisos después de que empezó la verificación no recupera la espontaneidad',
  parrafos: [
    'El art. 55 no dice «que se corrija antes de la multa»: dice «de manera espontánea y previa al inicio de las facultades de verificación». Es una condición de tiempo, y el tiempo no se repone.',
    'El art. 34 de la ley enuncia esas facultades: comprobar el cumplimiento mediante la práctica de visitas de verificación o requerimientos de información. Ambos están en el Capítulo V, titulado «De las Visitas de Verificación».',
    'Leídos juntos, el oficio que ya tienes en la mano —si es un requerimiento o el inicio de una visita— marca el punto a partir del cual, para lo que ese acto abarca, el cumplimiento deja de ser previo. No hemos encontrado criterio de la autoridad ni tesis que lo resuelva expresamente, así que lo publicamos como lo que es: la lectura literal de dos artículos, no una conclusión cerrada.',
  ],
  peroSiSirve: [
    'Presentar el aviso atrasado sigue conviniendo casi siempre, por otra razón: la extemporaneidad es la fracción III del art. 53 y la omisión es la fracción VI, y no comparten rango de multa.',
    'Las acciones correctivas que apliques son uno de los elementos que el art. 60, fr. I de la ley obliga a tomar en cuenta al graduar la sanción dentro del rango.',
    'Regularizar antes de que llegue la resolución no borra la infracción, pero cambia el expediente sobre el que la autoridad decide.',
  ],
} as const;

/* ── El orden de regularizar ──────────────────────────────────────────────── */

export interface PasoRegularizacion {
  orden: number;
  titulo: string;
  detalle: string;
  fundamento: string;
}

/**
 * La ley no publica un orden. Este lo imponen dos cosas verificables: la
 * mecánica del portal (sin alta no hay dónde presentar el aviso) y la
 * exigencia de «totalidad» del art. 55 Bis del Reglamento.
 */
export const PASOS_REGULARIZACION: readonly PasoRegularizacion[] = [
  {
    orden: 1,
    titulo: 'Alta y registro en el padrón',
    detalle:
      'Sin alta no hay dónde presentar un aviso: el portal exige estar registrado. Para tramitarla necesitas estar inscrito en el RFC y contar con certificado vigente de e.firma.',
    fundamento: 'Art. 18, fr. IV Bis LFPIORPI; art. 12 del Reglamento',
  },
  {
    orden: 2,
    titulo: 'Avisos atrasados, uno por operación',
    detalle:
      'Cada acto u operación que alcanzó el umbral genera su propio aviso, con el contenido mínimo que exige la ley. Antes de enviarlos conviene tener la lista completa de periodos y operaciones, porque esa lista es la que después va en el escrito de reconocimiento.',
    fundamento: 'Arts. 17, 23 y 24 LFPIORPI',
  },
  {
    orden: 3,
    titulo: 'Expedientes de identificación y lo demás del art. 18',
    detalle:
      'Identificación del cliente, expediente, beneficiario controlador, conservación, manual, capacitación y el resto de las once obligaciones. Es la parte que más tarda y la que un verificador revisa con más calma.',
    fundamento: 'Art. 18 LFPIORPI',
  },
  {
    orden: 4,
    titulo: 'Escrito de reconocimiento expreso',
    detalle:
      'Va al final, no al principio: el art. 55 Bis pide manifestar bajo protesta de decir verdad que la totalidad de las faltas ya fue corregida, y anexar la documentación que lo acredite. Presentarlo antes de haber corregido deja la manifestación sin respaldo.',
    fundamento: 'Art. 55 Bis del Reglamento',
  },
];

/* ── Medios de defensa ────────────────────────────────────────────────────── */

export interface MedioDefensa {
  clave: string;
  titulo: string;
  ante: string;
  plazo: string;
  fundamento: string;
  descripcion: string;
  consideraciones: readonly string[];
}

export const MEDIOS_DEFENSA: readonly MedioDefensa[] = [
  {
    clave: 'revision',
    titulo: 'Recurso de revisión',
    ante: 'La propia autoridad. Se presenta ante quien emitió el acto y lo resuelve su superior jerárquico.',
    plazo: '15 días',
    fundamento: 'Art. 61 LFPIORPI; arts. 83, 85 y 86 LFPA; art. 59 del Reglamento',
    descripcion:
      'Es la vía administrativa. El art. 91 LFPA permite a la autoridad que resuelve confirmar el acto, declararlo nulo o revocarlo total o parcialmente, o modificarlo.',
    consideraciones: [
      'El art. 83 LFPA lo plantea como una opción: «podrán interponer el recurso de revisión o, cuando proceda, intentar la vía jurisdiccional que corresponda». No es un paso obligatorio antes del tribunal.',
      'El art. 59 del Reglamento remite al Reglamento Interior del SAT para saber qué unidad administrativa tiene el carácter de superior jerárquico en tu caso.',
    ],
  },
  {
    clave: 'nulidad',
    titulo: 'Juicio contencioso administrativo (juicio de nulidad)',
    ante: 'Tribunal Federal de Justicia Administrativa, en vía tradicional ante la Sala Regional competente o en línea.',
    plazo: '30 días',
    fundamento: 'Art. 61 LFPIORPI; art. 13, fr. I de la LFPCA',
    descripcion:
      'Es la vía jurisdiccional. Se demanda la nulidad de la resolución ante un tribunal que no depende de la autoridad que la dictó.',
    consideraciones: [
      'El art. 13 LFPCA obliga a elegir vía —tradicional o en línea— al presentar la demanda, y una vez elegida no se puede cambiar.',
      'Si primero agotas el recurso de revisión y lo pierdes, lo que se impugna después es la resolución del recurso, con su propio plazo contado desde su notificación.',
    ],
  },
];

export const CUANDO_ABOGADO: readonly string[] = [
  'Siempre que ya exista una resolución que imponga multa: el plazo para impugnarla es de días y no se suspende porque estés juntando documentos.',
  'Cuando la conducta sea omisión de avisos u operación prohibida en efectivo: son las fracciones VI y VII del art. 53, las únicas donde el art. 54, fr. III permite calcular la multa como porcentaje del valor del acto cuando es cuantificable en dinero.',
  'Cuando la extemporaneidad de un aviso pase de treinta días, porque la remisión del art. 53, fr. III al art. 54, fr. II es de lectura discutible y el rango cambia según cuál lectura prevalezca.',
  'Antes de firmar cualquier escrito de reconocimiento expreso: el art. 55 Bis exige manifestar bajo protesta de decir verdad, y una manifestación de ese tipo se hace una vez.',
  'Cuando la actividad sea de las que el art. 56 puede costar el permiso —juegos y sorteos, blindaje, traslado o custodia de valores—, o cuando esté en juego una patente aduanal (art. 59) o la habilitación de corredor público (art. 57).',
  'Cuando aparezca cualquier señalamiento sobre información falsa, alterada o ilegible: eso ya no es infracción administrativa, es el tipo penal del art. 62.',
];

/* ── Qué no hacer ─────────────────────────────────────────────────────────── */

export const QUE_NO_HACER: readonly { titulo: string; porque: string }[] = [
  {
    titulo: 'No lo ignores esperando que se olvide',
    porque:
      'El art. 8, tercer párrafo, del Reglamento permite sancionar la falta de respuesta sin implementar el procedimiento sancionador de la LFPA. No responder no aplaza nada: adelanta la multa y te salta las etapas de defensa.',
  },
  {
    titulo: 'No entregues más de lo que se te pide',
    porque:
      'El art. 34, segundo párrafo, de la ley acota lo que debes proporcionar: exclusivamente la información, datos, imágenes y documentación soporte con que cuentes que esté directamente relacionada con las actividades vulnerables que realizas.',
  },
  {
    titulo: 'No inventes ni maquilles documentos para llenar un hueco',
    porque:
      'Proporcionar información, documentación, datos o imágenes falsos, alterarlos, o incorporarlos ilegibles de modo que impidan conocer su contenido es el delito del art. 62 de la ley, no una infracción administrativa.',
  },
  {
    titulo: 'No firmes un acta de verificación con la que no estés de acuerdo sin dejar constancia',
    porque:
      'El art. 68 LFPA te permite formular observaciones y ofrecer pruebas en el acto de la diligencia, o por escrito dentro de los cinco días siguientes. Es la ventana donde tu versión entra al expediente.',
  },
  {
    titulo: 'No presentes el escrito de reconocimiento antes de haber corregido todo',
    porque:
      'El art. 55 Bis del Reglamento pide manifestar bajo protesta de decir verdad que la totalidad de las faltas fue corregida y anexar la documentación que lo acredite. Reconocer sin haber corregido deja la falta admitida y el requisito incumplido.',
  },
  {
    titulo: 'No dejes correr el plazo de impugnación mientras negocias',
    porque:
      'Son quince días para el recurso de revisión (art. 85 LFPA) y treinta para el juicio de nulidad (art. 13, fr. I LFPCA). Ninguna gestión informal los suspende.',
  },
  {
    titulo: 'No tomes esta página como el análisis de tu caso',
    porque:
      'Aquí no conocemos tus fechas de notificación, tu actividad, tus periodos ni tus operaciones, y de esos hechos depende todo lo anterior.',
  },
];

/* ── Lo que no pudimos confirmar ──────────────────────────────────────────── */

export const SIN_CONFIRMAR: readonly { tema: string; porque: string; dondeBuscar: string }[] = [
  {
    tema: 'El plazo para responder una carta invitación o de orientación',
    porque:
      'Ni la LFPIORPI, ni su Reglamento, ni el Acuerdo 115/2026 contienen la figura. Circulan cifras en publicaciones profesionales, pero no salen de una disposición que podamos citar.',
    dondeBuscar:
      'En el propio oficio: la carta indica el término y la fecha desde la que corre. Confírmalo ahí y, si el oficio cita un fundamento, léelo antes de decidir.',
  },
  {
    tema: 'Los requisitos adicionales para obtener los beneficios del art. 55',
    porque:
      'El art. 55 Bis del Reglamento cierra diciendo que, para obtener alguno de los beneficios, quien realice la actividad vulnerable deberá cumplir con lo previsto en las reglas de carácter general. Al leer el Acuerdo 115/2026 no encontramos ninguna regla que desarrolle ese punto: la única mención a subsanar «de manera espontánea» está en su art. 50 y se refiere a los hallazgos del dictamen de auditoría, que es otro supuesto.',
    dondeBuscar:
      'Vigila el DOF por si se publica una regla posterior, y confirma el estado de esa remisión con la disposición aplicable antes de basar una estrategia en ella.',
  },
  {
    tema: 'Si un requerimiento cierra la puerta de la espontaneidad, y desde qué día exactamente',
    porque:
      'La ley no define «inicio de las facultades de verificación» con una fecha. Lo que sí dice el art. 34 es que esas facultades se ejercen mediante visitas o requerimientos. El resto es interpretación, y no hemos hallado criterio de la autoridad que la fije.',
    dondeBuscar:
      'Es exactamente la pregunta que hay que llevarle a un abogado con el oficio y su constancia de notificación en la mano.',
  },
  {
    tema: 'Los requisitos de garantía y suspensión del cobro mientras impugnas',
    porque:
      'El art. 52 de la ley convierte la multa en crédito fiscal y la sujeta al procedimiento administrativo de ejecución, pero los requisitos para suspenderlo o garantizarlo viven en disposiciones fiscales que esta página no analiza.',
    dondeBuscar:
      'Con tu abogado, junto con la decisión de qué vía de impugnación tomar: son dos decisiones que se toman a la vez.',
  },
];

/* ── Fuentes ──────────────────────────────────────────────────────────────── */

export interface FuenteConsultada {
  nombre: string;
  detalle: string;
  url: string;
}

export const FUENTES_CONSULTADAS: readonly FuenteConsultada[] = [
  {
    nombre: 'LFPIORPI',
    detalle: 'Texto vigente, última reforma DOF 16-07-2025. Arts. 18, 25, 34 a 37, 52 a 61.',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPIORPI.pdf',
  },
  {
    nombre: 'Reglamento de la LFPIORPI',
    detalle: 'Texto vigente, última reforma DOF 27-03-2026. Arts. 5, 8, 9, 10 Bis, 12, 55, 55 Bis y 59.',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LFPIORPI.pdf',
  },
  {
    nombre: 'Ley Federal de Procedimiento Administrativo',
    detalle: 'Texto vigente, última reforma DOF 14-11-2025. Arts. 28, 60, 68, 72, 79, 83, 85, 86 y 91.',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPA.pdf',
  },
  {
    nombre: 'Ley Federal de Procedimiento Contencioso Administrativo',
    detalle: 'Texto vigente, última reforma DOF 09-06-2026. Art. 13.',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPCA.pdf',
  },
  {
    nombre: 'Acuerdo 115/2026',
    detalle: 'Reglas de carácter general, DOF 07-08-2026. Revisado en busca de reglas sobre el art. 55.',
    url: 'https://dof.gob.mx/nota_detalle.php?codigo=5795797&fecha=07/08/2026',
  },
  {
    nombre: 'Portal de Prevención de Lavado de Dinero (SPPLD)',
    detalle: 'SAT: alta y registro en el padrón, presentación de avisos e informes.',
    url: 'https://sppld.sat.gob.mx/',
  },
];

/* ── Preguntas frecuentes ─────────────────────────────────────────────────── */

export const FAQ_REQUERIMIENTO: readonly PreguntaFrecuente[] = [
  {
    pregunta: '¿Cuántos días tengo para contestar un requerimiento de información del SAT?',
    respuesta:
      'Diez días hábiles contados a partir del día siguiente a aquel en que lo recibes, conforme al art. 8, primer párrafo, del Reglamento de la LFPIORPI. El mismo artículo permite pedir una prórroga de hasta cinco días hábiles más, siempre que la solicitud se presente dentro del plazo original de diez días.',
  },
  {
    pregunta: '¿Una carta invitación es lo mismo que un requerimiento?',
    respuesta:
      'No. El requerimiento está previsto en los arts. 25 y 34 de la ley y en el art. 8 del Reglamento, con plazo propio. La carta invitación no aparece en la ley, en su Reglamento ni en el Acuerdo 115/2026: es una práctica administrativa, y el plazo que menciona sale del propio oficio. La consecuencia práctica es distinta en cada caso, así que lo primero es identificar cuál de los dos tienes en la mano.',
  },
  {
    pregunta: '¿Qué pasa si no contesto el requerimiento?',
    respuesta:
      'El art. 8, tercer párrafo, del Reglamento prevé que el SAT imponga las sanciones que correspondan en un plazo que no excederá de diez días hábiles, y dice expresamente que lo hace sin implementar el procedimiento sancionador de la Ley Federal de Procedimiento Administrativo. Además, abstenerse de cumplir un requerimiento es la infracción de la fracción I del art. 53 de la ley.',
  },
  {
    pregunta: '¿Si presento los avisos atrasados después del requerimiento me libro de la multa?',
    respuesta:
      'La ley no lo plantea así. El art. 55 condiciona sus beneficios a que el cumplimiento sea espontáneo y previo al inicio de las facultades de verificación, y el art. 34 llama facultades de verificación a las visitas y a los requerimientos de información. Presentar el aviso tarde sigue conviniendo por otra vía —la extemporaneidad y la omisión no comparten rango en el art. 54, y el art. 60 obliga a considerar las acciones correctivas al graduar la multa—, pero no es lo mismo que acogerse al art. 55.',
  },
  {
    pregunta: '¿Qué es exactamente el «plazo inicial» que menciona el artículo 55?',
    respuesta:
      'El art. 55 Bis del Reglamento lo define en dos partes: para el primer párrafo del art. 55, el plazo inicial del procedimiento de verificación es el término de cinco días del art. 68 de la LFPA; para el segundo párrafo, el plazo inicial del procedimiento sancionador es el periodo del art. 72 de la LFPA, que es de quince días.',
  },
  {
    pregunta: '¿La abstención del artículo 55 es un derecho que puedo exigir?',
    respuesta:
      'El primer párrafo del art. 55 está redactado como un deber de la Secretaría de abstenerse cuando se cumplen las condiciones, pero acreditar que se cumplieron —cumplimiento espontáneo, previo al inicio de las facultades de verificación y reconocimiento expreso en tiempo y forma— es carga de quien lo invoca, y el art. 55 Bis del Reglamento remite además a las reglas de carácter general. Ningún resultado está garantizado y un caso real necesita abogado.',
  },
  {
    pregunta: '¿Tengo que agotar el recurso de revisión antes de ir al tribunal?',
    respuesta:
      'No. El art. 83 de la LFPA lo plantea como opción: los afectados podrán interponer el recurso de revisión o, cuando proceda, intentar la vía jurisdiccional que corresponda. El art. 61 de la LFPIORPI recoge las dos vías. Cuál conviene depende del caso, y esa elección se toma con abogado porque los plazos corren en paralelo.',
  },
  {
    pregunta: '¿Hasta qué tan atrás puede revisarme la autoridad?',
    respuesta:
      'El art. 36 de la ley limita las verificaciones a los actos u operaciones considerados actividades vulnerables realizados dentro de los cinco años inmediatos anteriores a la fecha de inicio de la visita. Por separado, el art. 79 de la LFPA fija en cinco años la prescripción de la facultad para imponer sanciones administrativas, contados desde que se cometió la infracción o desde que cesó si fue continua.',
  },
];
