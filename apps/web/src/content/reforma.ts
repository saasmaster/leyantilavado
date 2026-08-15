import type { CambioReforma } from './tipos';

/**
 * Los tres instrumentos de la reforma 2025-2026.
 *
 * Presentarlos como "la nueva Ley Antilavado" es el error de encuadre más común
 * del mercado. La LFPIORPI sigue siendo la de 2012: lo que cambió son una
 * reforma a la ley, una reforma a su reglamento y un acuerdo que modifica las
 * reglas de carácter general, cada uno con su propia fecha de vigencia.
 */
export interface InstrumentoReforma {
  clave: string;
  nombre: string;
  queEs: string;
  emisor: string;
  publicacion: string;
  entradaEnVigor: string;
  jerarquia: string;
  fuenteId: string;
  puedeCambiarUmbrales: boolean;
}

export const INSTRUMENTOS: readonly InstrumentoReforma[] = [
  {
    clave: 'ley-2025',
    nombre: 'Reforma a la LFPIORPI',
    queEs:
      'Decreto que reforma, adiciona y deroga diversas disposiciones de la ley. Es el único de los tres que puede tocar el art. 17, y de hecho lo hizo: adicionó la fracción V Bis y el apartado XII-D y modificó umbrales de fe pública.',
    emisor: 'Congreso de la Unión',
    publicacion: '2025-07-16',
    entradaEnVigor: '2025-07-17',
    jerarquia: 'Ley',
    fuenteId: 'lfpiorpi-vigente',
    puedeCambiarUmbrales: true,
  },
  {
    clave: 'reglamento-2026',
    nombre: 'Reforma al Reglamento de la LFPIORPI',
    queEs:
      'Decreto del Ejecutivo federal que reforma el reglamento. No toca umbrales del art. 17, pero sí reglas operativas de peso: acumulación, conservación, aviso de veinticuatro horas aunque la operación no se celebre, plazos de requerimiento y el procedimiento de autocorrección.',
    emisor: 'Presidencia de la República',
    publicacion: '2026-03-27',
    entradaEnVigor: '2026-03-28',
    jerarquia: 'Reglamento',
    fuenteId: 'dof-reglamento-2026',
    puedeCambiarUmbrales: false,
  },
  {
    clave: 'acuerdo-115-2026',
    nombre: 'Acuerdo 115/2026',
    queEs:
      'Acuerdo del Secretario de Hacienda que modifica las Reglas de Carácter General publicadas en 2013. Es donde vive el detalle operativo del nuevo régimen: metodología de riesgos, clasificación de clientes, beneficiario controlador, manual, capacitación, mecanismos automatizados y auditoría.',
    emisor: 'Secretaría de Hacienda y Crédito Público',
    publicacion: '2026-08-07',
    entradaEnVigor: '2026-11-30',
    jerarquia: 'Reglas de carácter general',
    fuenteId: 'dof-acuerdo-115-2026',
    puedeCambiarUmbrales: false,
  },
];

/**
 * Tabla antes/después.
 *
 * El "después" se lee del motor por `reglaId`. El "antes" corresponde a
 * umbrales derogados que el motor no guarda, y por eso se declara aquí con su
 * disposición.
 */
export const CAMBIOS_ANTES_DESPUES: readonly CambioReforma[] = [
  {
    clave: 'notarios-inmuebles',
    supuesto: 'Notarios: transmisión o constitución de derechos reales sobre inmuebles',
    reglaId: 'fe-publica-notarios--inmuebles',
    campo: 'aviso',
    antesUMA: 16000,
    disposicion: 'Art. 17, fracción XII, Apartado A, inciso a)',
    endurece: true,
    nota:
      'El umbral se redujo a la mitad, de modo que operaciones que antes no se reportaban ahora sí generan aviso. La base sigue siendo el valor más alto entre precio pactado, catastral, comercial y monto garantizado.',
  },
  {
    clave: 'notarios-fideicomisos',
    supuesto: 'Notarios: constitución o modificación de fideicomisos traslativos o de garantía',
    reglaId: 'fe-publica-notarios--fideicomisos',
    campo: 'aviso',
    // El texto anterior decía «ocho mil veinticinco», no ocho mil. Estaba
    // redondeado, y en una tabla que existe para comparar cifras el redondeo
    // es el único error que no se puede permitir.
    antesUMA: 8025,
    disposicion: 'Art. 17, fracción XII, Apartado A, inciso d)',
    endurece: true,
    nota:
      'Doble cambio: el umbral bajó a la mitad y el objeto se amplió. Antes el supuesto sólo alcanzaba fideicomisos sobre inmuebles; hoy no se limita a ellos. Se mantienen las excepciones para los constituidos a favor de instituciones del sistema financiero u organismos públicos de vivienda.',
  },
  {
    clave: 'notarios-sociedades',
    supuesto: 'Notarios: constitución de personas morales y operaciones sobre acciones o partes sociales',
    reglaId: 'fe-publica-notarios--constitucion-personas-morales',
    campo: 'aviso',
    // «Ocho mil veinticinco» en el texto anterior. Ver nota en el inciso d).
    antesUMA: 8025,
    disposicion: 'Art. 17, fracción XII, Apartado A, inciso c)',
    endurece: true,
    nota:
      'Es el cambio con mayor efecto en volumen: el umbral desapareció y el aviso procede en todos los casos, sin importar el capital de la sociedad.',
  },
  {
    clave: 'desarrollo-inmobiliario',
    supuesto: 'Desarrollo inmobiliario: recepción de recursos destinados al proyecto',
    reglaId: 'desarrollo-inmobiliario',
    campo: 'aviso',
    antesTexto: 'No existía como actividad vulnerable',
    disposicion: 'Art. 17, fracción V Bis (adicionada)',
    endurece: true,
    nota:
      'Fracción nueva. Alcanza la captación de recursos para un desarrollo destinado a venta o renta, un momento anterior al de la comercialización de la fracción V.',
  },
  {
    clave: 'facilitadoras',
    supuesto: 'Personas facilitadoras públicas y privadas',
    antesTexto: 'No figuraban en el catálogo del art. 17',
    despuesTexto:
      'Apartado XII-D adicionado, con remisión a los supuestos del apartado A en los términos que la ley señala. La autoridad aún no publica umbrales propios.',
    disposicion: 'Art. 17, fracción XII, Apartado D (adicionado)',
    endurece: true,
  },
  {
    clave: 'efectivo-metales',
    supuesto: 'Medios de pago prohibidos por encima del límite del art. 32',
    antesTexto: 'Monedas y billetes en moneda nacional y divisas',
    despuesTexto:
      'Se agregan los metales preciosos como medio de pago prohibido, y se aclara que la prohibición aplica aunque el pago en efectivo se realice por conducto de una entidad financiera.',
    disposicion: 'Art. 32, párrafo primero',
    endurece: true,
  },
  {
    clave: 'efectivo-consignacion',
    supuesto: 'Consignación de pago',
    antesTexto: 'No estaba prevista como supuesto del art. 32',
    despuesTexto:
      'Se adiciona como fracción VIII, con la particularidad de que la ley remite al umbral de la fracción con la que se relaciona la consignación, mientras que la tabla del SAT publica una cifra fija.',
    disposicion: 'Art. 32, fracción VIII (adicionada)',
    endurece: true,
    nota: 'Es el punto donde dos fuentes oficiales no coinciden. Lo mostramos como discrepancia, no lo resolvemos.',
  },
  {
    clave: 'obligaciones-nuevas',
    supuesto: 'Catálogo de obligaciones del art. 18',
    antesTexto: 'Seis obligaciones centradas en identificar, conservar y avisar',
    despuesTexto:
      'Se adicionan cinco obligaciones de gobierno del riesgo: enfoque basado en riesgos, manual de políticas internas, selección de personal y capacitación, mecanismos automatizados y auditoría anual.',
    disposicion: 'Art. 18, fracciones VII a XI (adicionadas)',
    endurece: true,
    nota: 'Su exigibilidad quedó diferida a los plazos de las reglas de carácter general.',
  },
  {
    clave: 'conservacion',
    supuesto: 'Plazo de conservación de la información',
    antesTexto: 'Cinco años desde la realización de la actividad vulnerable',
    despuesTexto:
      'Diez años, con la misma regla de cómputo y con interrupción cuando hay recurso o juicio.',
    disposicion: 'Art. 18, fracción IV, y art. 20 del Reglamento',
    endurece: true,
  },
  {
    clave: 'aviso-24h',
    supuesto: 'Aviso por sospecha, hechos o indicios',
    antesTexto: 'Previsto de forma general, sin regla expresa sobre operaciones no celebradas',
    despuesTexto:
      'Se desdobla en tres supuestos con plazo de veinticuatro horas y se aclara que procede aunque no se alcance el umbral y aunque la operación nunca se haya celebrado.',
    disposicion: 'Art. 18, fracción VI; art. 7 Bis del Reglamento; arts. 26 Bis a 27 de las Reglas',
    endurece: true,
    nota: 'Su envío está diferido hasta que se publiquen los formatos oficiales que lo identifiquen.',
  },
  {
    clave: 'supervision-sat',
    supuesto: 'Facultades de supervisión y sanción',
    antesTexto: 'Procedimiento sancionador ordinario en todos los casos',
    despuesTexto:
      'Se incorpora la supervisión expresa de la Secretaría, y el Reglamento prevé plazos cortos para atender requerimientos y para sancionar su desatención.',
    disposicion: 'Art. 22 Bis de la ley y arts. 8 y 9 del Reglamento',
    endurece: true,
  },
  /*
   * Cambios de ALCANCE: misma cifra, obligación distinta.
   *
   * Existen porque la reforma casi no movió números —sólo cuatro supuestos
   * cambiaron de umbral— pero sí movió a quién y a qué alcanza cada fracción.
   * Sin estas entradas, quien compare sólo cifras concluye «sin cambios» justo
   * donde más cambió su obligación: es el caso de la joyería, que pasó de
   * reportar sólo efectivo a reportar cualquier forma de pago con el mismo
   * 1,605 UMA de siempre.
   *
   * Todos salen de `research/umbrales-antes-de-la-reforma.md`, contrastado
   * contra el texto original de la LFPIORPI (DOF 17-10-2012).
   */
  {
    clave: 'joyeria-efectivo',
    supuesto: 'Joyería y metales preciosos: el aviso deja de depender del efectivo',
    antesTexto:
      'Aviso sólo cuando la operación se hacía EN EFECTIVO por 1,605 veces el salario mínimo o más. Quien cobraba por transferencia, tarjeta o cheque no daba aviso por ningún monto.',
    despuesTexto:
      'Aviso cuando el monto del acto u operación alcanza 1,605 UMA, sea cual sea la forma de pago.',
    disposicion: 'Art. 17, fracción VI',
    endurece: true,
    nota:
      'La cifra es idéntica y la obligación es otra: para este sector es el cambio más importante de la reforma. Un comparador que sólo mire números lo reportaría como «sin cambios».',
  },
  {
    clave: 'tarjetas-filtro',
    supuesto: 'Tarjetas e instrumentos de almacenamiento: desaparece el filtro de entrada',
    antesTexto:
      'La fracción sólo aplicaba «siempre y cuando» el emisor mantuviera relación de negocios con el adquirente, los instrumentos permitieran transferencia de fondos, o su comercialización fuera ocasional.',
    despuesTexto:
      'El filtro se suprimió: la actividad es vulnerable por sí misma. Se reestructuró en tres incisos y se añadió el «abono de recursos» como hecho generador.',
    disposicion: 'Art. 17, fracción II',
    endurece: true,
    nota:
      'Antes un emisor podía quedar fuera si no cumplía ninguna de las tres condiciones. Ya no.',
  },
  {
    clave: 'inmobiliarias-cuenta-propia',
    supuesto: 'Inmobiliarias: se suprime el requisito de actuar por cuenta de clientes',
    antesTexto:
      'Alcanzaba la «prestación de servicios» de construcción, desarrollo o intermediación «por cuenta o a favor de clientes de quienes presten dichos servicios».',
    despuesTexto:
      'Alcanza la «realización de actividades» de construcción, desarrollo e intermediación, sin exigir que se actúe por cuenta ajena.',
    disposicion: 'Art. 17, fracción V',
    endurece: true,
    nota:
      'El desarrollador que vende por cuenta propia queda dentro, cuando antes había argumento para sostener que no. El umbral de aviso no se movió.',
  },
  {
    clave: 'traslado-monto-indeterminado',
    supuesto: 'Traslado de valores: aviso cuando el monto no puede determinarse',
    antesTexto: 'El aviso procedía al alcanzar 3,210 UMA. Sin regla para el monto indeterminable.',
    despuesTexto:
      'Se añade un inciso b): si no es posible determinar el monto, se presenta aviso en todos los casos.',
    disposicion: 'Art. 17, fracción X, inciso b) (adicionado)',
    endurece: true,
    nota: 'Cierra la vía de no reportar alegando monto indeterminado.',
  },
  {
    clave: 'corredores-fideicomisos-salvedad',
    supuesto: 'Corredores públicos: se estrecha el supuesto de fideicomisos',
    antesTexto: 'Todo fideicomiso celebrado ante corredor era objeto de aviso, sin salvedad.',
    despuesTexto:
      'Se exceptúan los constituidos para garantizar algún crédito a favor de instituciones que integran el sistema financiero.',
    disposicion: 'Art. 17, fracción XII, Apartado B, inciso c)',
    endurece: false,
    nota:
      'Es de los pocos cambios que reducen el alcance en lugar de ampliarlo.',
  },
  {
    clave: 'comercio-exterior-sujetos',
    supuesto: 'Comercio exterior: se amplían los sujetos obligados',
    antesTexto: 'Sólo el agente o apoderado aduanal.',
    despuesTexto:
      'Se añaden la agencia aduanal y el despacho que las personas físicas y morales promuevan sin intervención de agente o agencia aduanal.',
    disposicion: 'Art. 17, fracción XIV',
    endurece: true,
    nota:
      'Quien despacha por cuenta propia pasa a realizar actividad vulnerable, sin que cambie ningún umbral.',
  },
  {
    clave: 'beneficiario-controlador-25',
    supuesto: 'Beneficiario controlador: el umbral de control baja de 50 % a 25 %',
    antesTexto: 'Se consideraba beneficiario controlador a quien tuviera más del cincuenta por ciento del capital social.',
    despuesTexto: 'Se considera a quien tenga más del veinticinco por ciento del capital social.',
    disposicion: 'Art. 3, fracción III, inciso b), subinciso ii)',
    endurece: true,
    nota:
      'El porcentaje se redujo a la mitad, así que estructuras que antes no tenían beneficiario controlador identificable ahora sí lo tienen. Ojo: el porcentaje es uno de tres criterios alternativos —también cuenta imponer decisiones en asamblea o dirigir de hecho la administración—, de modo que alguien con 0 % puede serlo. Resolverlo sólo con un porcentaje produce falsos negativos.',
  },
];

/** Bloques del Acuerdo 115/2026 que crean obligación nueva. */
export interface BloqueAcuerdo {
  clave: string;
  capitulo: string;
  titulo: string;
  queObliga: string;
  obligacionSlug?: string;
}

export const BLOQUES_ACUERDO_115: readonly BloqueAcuerdo[] = [
  {
    clave: 'ii-ter',
    capitulo: 'Capítulo II Ter',
    titulo: 'Alta y registro de quienes actúan por fideicomisos y otras figuras',
    queObliga:
      'Enviar la información de los integrantes de la figura por archivo generado con la herramienta del portal, con reglas propias para corregir datos y para la asociación en participación.',
    obligacionSlug: 'alta-sppld',
  },
  {
    clave: 'ii-quater',
    capitulo: 'Capítulo II Quáter',
    titulo: 'Enfoque basado en riesgos',
    queObliga:
      'Diseñar e implementar una metodología escrita de evaluación de riesgos, con método de medición, mitigantes identificados y revisión periódica.',
    obligacionSlug: 'enfoque-basado-riesgos',
  },
  {
    clave: 'iii-bis',
    capitulo: 'Capítulo III Bis',
    titulo: 'Clasificación del grado de riesgo del cliente',
    queObliga:
      'Clasificar a cada cliente en al menos tres grados, reevaluarlo periódicamente y aplicar riesgo alto obligatorio en los supuestos que la norma señala.',
    obligacionSlug: 'clasificacion-clientes',
  },
  {
    clave: 'iii-ter',
    capitulo: 'Capítulo III Ter',
    titulo: 'Conocimiento del cliente y perfil transaccional',
    queObliga:
      'Documentar la política de conocimiento del cliente, determinar el perfil transaccional, cargarlo al sistema de alertas y aplicar debida diligencia reforzada al riesgo alto.',
    obligacionSlug: 'perfil-transaccional',
  },
  {
    clave: 'iii-quater',
    capitulo: 'Capítulo III Quáter',
    titulo: 'Lista de personas políticamente expuestas',
    queObliga:
      'Determinar la condición de PEP del cliente y sus allegados, con la consulta prevista ante la autoridad y aprobación directiva cuando además hay riesgo alto.',
    obligacionSlug: 'personas-politicamente-expuestas',
  },
  {
    clave: 'iii-quinquies',
    capitulo: 'Capítulo III Quinquies',
    titulo: 'Beneficiario controlador',
    queObliga:
      'Aplicar un orden de prelación para identificar a la persona física que controla, subir por la cadena en fideicomisos y documentar el procedimiento.',
    obligacionSlug: 'beneficiario-controlador',
  },
  {
    clave: 'x',
    capitulo: 'Capítulo X',
    titulo: 'Manual de políticas internas',
    queObliga:
      'Tener manual dentro de los noventa días naturales del alta, con contenido mínimo obligatorio y políticas centralizadas en grupos empresariales.',
    obligacionSlug: 'manual-cumplimiento',
  },
  {
    clave: 'xi',
    capitulo: 'Capítulo XI',
    titulo: 'Mecanismos de prevención para el sector no lucrativo',
    queObliga:
      'Régimen específico de medidas proporcionales para asociaciones y sociedades sin fines de lucro, que aplica aunque no realicen una actividad vulnerable.',
    obligacionSlug: 'enfoque-basado-riesgos',
  },
  {
    clave: 'xii',
    capitulo: 'Capítulo XII',
    titulo: 'Capacitación y selección de personal',
    queObliga:
      'Programa anual con contenido mínimo, evaluación y constancias, y procedimientos de selección con declaración firmada del personal.',
    obligacionSlug: 'capacitacion',
  },
  {
    clave: 'xiii',
    capitulo: 'Capítulo XIII',
    titulo: 'Mecanismos automatizados',
    queObliga:
      'Contar con mecanismos que conserven el expediente, consoliden operaciones por cliente, ejecuten el modelo de riesgo, generen alertas y monitoreen el uso de efectivo.',
    obligacionSlug: 'mecanismos-automatizados',
  },
  {
    clave: 'xiv',
    capitulo: 'Capítulo XIV',
    titulo: 'Auditoría',
    queObliga:
      'Someter el cumplimiento a revisión anual, con dictamen estructurado, escala de cinco resultados y seguimiento de hallazgos del año anterior.',
    obligacionSlug: 'auditoria-anual',
  },
];

/** Anexos que el Acuerdo adiciona. */
export const ANEXOS_NUEVOS: readonly { clave: string; descripcion: string }[] = [
  {
    clave: 'Anexo 2 Bis',
    descripcion:
      'Información de integrantes de fideicomisos y otras figuras jurídicas para el alta y registro.',
  },
  {
    clave: 'Anexo 2 Ter',
    descripcion:
      'Complemento del anterior para la carga de información por archivo generado desde el portal.',
  },
  {
    clave: 'Anexo 10',
    descripcion:
      'Formato con el que las autoridades y organismos cargan la información de personas políticamente expuestas.',
  },
];
