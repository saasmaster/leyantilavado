import type {
  CategoriaProveedor,
  NivelVerificacionProveedor,
  PlanProveedor,
  TamanoCliente,
} from '@leyantilavado/types';

/* ────────────────────────────────────────────────────────────────────────────
 * Catálogo editorial del directorio.
 *
 * Aquí NO vive ningún dato legal: los umbrales, plazos y sanciones salen del
 * motor. Lo que vive aquí es contenido editorial propio sobre a qué se dedica
 * cada tipo de profesional y cómo elegirlo.
 * ────────────────────────────────────────────────────────────────────────── */

export interface FichaCategoria {
  slug: CategoriaProveedor;
  /** Singular, para "Contactar a un contador". */
  nombre: string;
  /** Plural, para títulos de página. */
  plural: string;
  resumen: string;
  /** Qué hace este perfil en el contexto de prevención de lavado. */
  queHace: readonly string[];
  /** Criterios concretos para elegir, redactados como preguntas al proveedor. */
  comoElegir: readonly { titulo: string; texto: string }[];
  /** Señales que deberían hacerte desconfiar. */
  senalesDeAlerta: readonly string[];
  /** Lo que este perfil NO puede hacer por ti. Evita expectativas falsas. */
  loQueNoHace: string;
}

export const FICHAS_CATEGORIA: Record<CategoriaProveedor, FichaCategoria> = {
  contadores: {
    slug: 'contadores',
    nombre: 'Contador o contadora',
    plural: 'Contadores públicos',
    resumen:
      'Quién lleva la contabilidad del negocio y suele ser la primera persona que detecta que una operación cruzó un umbral.',
    queHace: [
      'El contador es, en la práctica, el punto de contacto más frecuente del sujeto obligado con sus propias cifras. Ve los ingresos, las facturas y los pagos antes que nadie, así que es quien mejor puede detectar que un cliente se acercó a un umbral de identificación o de aviso.',
      'En materia de prevención de lavado su trabajo típico es dar de alta al negocio en el padrón del SAT, montar el control de operaciones que permite medir la acumulación de seis meses, armar los expedientes de identificación y preparar los avisos mensuales para su envío por el portal del SAT.',
      'Ojo con una confusión común: prestar servicios contables puede convertir al propio contador en sujeto obligado por la fracción de servicios profesionales, pero sólo cuando realiza para su cliente actos concretos como manejar sus cuentas, administrar sus recursos u organizar aportaciones de capital. Llevar la contabilidad, por sí solo, no lo detona.',
    ],
    comoElegir: [
      {
        titulo: '¿Ya presentó avisos de mi actividad, no sólo de otras?',
        texto:
          'Los formatos y los campos cambian por actividad vulnerable. Alguien con experiencia en inmobiliarias puede no conocer el catálogo de mercancías de comercio exterior.',
      },
      {
        titulo: '¿Quién presenta el aviso y con la firma de quién?',
        texto:
          'El aviso se presenta con la e.firma del sujeto obligado. Confirma si te van a pedir tu e.firma, cómo la resguardan y qué queda por escrito sobre ese uso.',
      },
      {
        titulo: '¿Cómo mide la acumulación de seis meses?',
        texto:
          'Si la respuesta es "reviso a fin de mes", es una hoja de cálculo con riesgo de omisión. Pide ver el control concreto: por cliente, por tipo de acto y con fecha de cada operación.',
      },
      {
        titulo: '¿Qué pasa si detecta una omisión de años anteriores?',
        texto:
          'Un buen despacho te explica la diferencia entre regularizar por iniciativa propia y esperar a que la autoridad requiera. Uno que evita el tema te está heredando el problema.',
      },
    ],
    senalesDeAlerta: [
      'Te promete que "con esto ya estás en regla" sin haber visto una sola de tus operaciones.',
      'Te cobra por aviso presentado y no te entrega los acuses.',
      'No sabe decirte cuántos años debe conservar tus expedientes.',
    ],
    loQueNoHace:
      'Un contador no sustituye la asesoría legal cuando ya hay un requerimiento, una multa o un procedimiento administrativo en curso.',
  },

  abogados: {
    slug: 'abogados',
    nombre: 'Abogado o abogada',
    plural: 'Abogados',
    resumen:
      'Interpretación de la ley, defensa ante requerimientos y multas, y diseño de la estructura documental que sostiene el cumplimiento.',
    queHace: [
      'El abogado entra donde el texto de la ley admite más de una lectura: si una operación concreta cae o no en una fracción del artículo 17, quién es el cliente en una consignación o en un fideicomiso, o si una estructura societaria genera obligaciones de identificar al beneficiario controlador.',
      'También es quien te representa cuando la autoridad ya actuó: contestación de requerimientos, defensa en el procedimiento sancionador, medios de impugnación contra una multa y análisis de la regularización espontánea.',
      'En el diseño preventivo su trabajo es redactar el manual de políticas, los contratos y las cláusulas de identificación de clientes, y dejar por escrito los criterios con los que la empresa decide.',
    ],
    comoElegir: [
      {
        titulo: '¿Litiga o sólo asesora?',
        texto:
          'Son dos oficios distintos. Si tu problema ya es un procedimiento sancionador, necesitas a quien litigue en materia administrativa, no sólo a quien redacte manuales.',
      },
      {
        titulo: '¿Puede mostrarme criterios escritos previos?',
        texto:
          'Un buen despacho documenta por qué opinó lo que opinó. Ese papel es lo que te protege después: la opinión verbal no existe frente a un auditor.',
      },
      {
        titulo: '¿Cómo cobra: por hora, por proyecto o por igualas?',
        texto:
          'Pide el esquema por escrito y qué incluye. En procedimientos, pregunta específicamente qué pasa con los honorarios si el asunto se alarga.',
      },
      {
        titulo: '¿Tiene conflicto de interés con mi contraparte?',
        texto:
          'En sectores concentrados —notarías, desarrolladores, agencias automotrices— el mismo despacho puede estar del otro lado. Pregúntalo antes de compartir información.',
      },
    ],
    senalesDeAlerta: [
      'Te garantiza un resultado en un procedimiento. Nadie puede garantizarlo.',
      'Ofrece "arreglar" el asunto por vías que no consisten en escritos y pruebas.',
      'No quiere firmar un convenio de confidencialidad.',
    ],
    loQueNoHace:
      'Un abogado no lleva tu operación diaria: no captura tus operaciones ni presenta tus avisos mes a mes.',
  },

  'consultores-pld': {
    slug: 'consultores-pld',
    nombre: 'Consultor o consultora en PLD',
    plural: 'Consultores en prevención de lavado de dinero',
    resumen:
      'Implantación completa del programa de cumplimiento: enfoque basado en riesgos, manual, expedientes, controles y quién hace qué.',
    queHace: [
      'El consultor especializado no viene a resolver un trámite suelto, sino a montar el sistema: la metodología de evaluación de riesgos, el manual de políticas, los formatos de identificación, la matriz de responsables y el calendario de obligaciones.',
      'Su valor real está en traducir la norma a procedimientos que tu gente pueda ejecutar sin ser especialista: qué le pide el mostrador al cliente, qué se escanea, dónde se guarda, quién revisa y en qué momento se escala una operación inusual.',
      'También suele acompañar la designación del responsable de cumplimiento y su alta ante la autoridad, y preparar a la empresa para la primera auditoría.',
    ],
    comoElegir: [
      {
        titulo: '¿Entrega documentos o entrega operación?',
        texto:
          'Un manual guardado en un cajón no es un programa de cumplimiento. Pregunta qué queda funcionando el día que el consultor se va y quién lo opera.',
      },
      {
        titulo: '¿Su metodología de riesgos está escrita y es tuya?',
        texto:
          'Debe quedarte por escrito qué factores mide, con qué pesos y por qué. Si la metodología es una caja negra de su hoja de cálculo, no la puedes defender ante un auditor.',
      },
      {
        titulo: '¿Cuánta gente de tu equipo tiene que participar?',
        texto:
          'Un proyecto que no toca al área comercial ni a caja no va a cambiar nada en la práctica. Pide el plan de involucramiento por área.',
      },
      {
        titulo: '¿Qué pasa con las fechas escalonadas de la reforma?',
        texto:
          'Debe darte un calendario con fechas concretas por obligación, no un "estamos trabajando en ello".',
      },
    ],
    senalesDeAlerta: [
      'Vende el mismo manual a todos los sectores cambiando el nombre en la portada.',
      'Habla de "certificar" tu cumplimiento ante la autoridad. Eso no existe.',
      'No distingue entre lo que ya es exigible y lo que lo será después.',
    ],
    loQueNoHace:
      'Un consultor no asume tu responsabilidad legal: la obligación de identificar, avisar y conservar sigue siendo del sujeto obligado.',
  },

  'auditores-externos': {
    slug: 'auditores-externos',
    nombre: 'Auditor externo',
    plural: 'Auditores externos en materia PLD',
    resumen:
      'Revisión independiente del programa de cumplimiento, hecha por alguien que no lo diseñó ni lo opera.',
    queHace: [
      'La auditoría externa existe para responder una pregunta incómoda: si un tercero revisa tus expedientes, tus avisos y tus controles, ¿aguantan? Su valor depende por completo de su independencia.',
      'El trabajo típico incluye pruebas sobre muestras de expedientes de identificación, cotejo de operaciones contra avisos presentados, revisión de la metodología de riesgos, verificación de la capacitación y un informe con hallazgos y plan de remediación.',
      'La normativa vigente incorpora la figura de la auditoría con requisitos de certificación e independencia. Antes de contratar, verifica en qué ejercicio te resulta exigible: no todas las obligaciones nuevas arrancan el mismo día.',
    ],
    comoElegir: [
      {
        titulo: '¿Es independiente de quien te implantó el programa?',
        texto:
          'Si el mismo despacho te vendió el manual y ahora te audita, el informe vale poco. Es el criterio número uno.',
      },
      {
        titulo: '¿Con qué certificación cuenta y hasta cuándo está vigente?',
        texto:
          'Pide el documento y su fecha de vigencia. Aquí publicamos ese dato cuando el proveedor nos lo presenta, y decimos exactamente qué revisamos.',
      },
      {
        titulo: '¿Cuál es su alcance y su tamaño de muestra?',
        texto:
          'Una auditoría que revisa cinco expedientes de mil no te dice nada. El alcance debe estar en la propuesta, no negociarse al final.',
      },
      {
        titulo: '¿Entrega hallazgos con evidencia?',
        texto:
          'Cada hallazgo debe apuntar a un documento concreto. Un informe de generalidades no sirve para remediar nada.',
      },
    ],
    senalesDeAlerta: [
      'Te ofrece auditar y además corregir lo que encuentre. Eso destruye la independencia.',
      'Te promete un informe "sin observaciones" antes de empezar.',
      'No te deja ver los papeles de trabajo.',
    ],
    loQueNoHace:
      'Un auditor externo no repara los hallazgos que encuentra: eso lo hace la empresa, o un consultor distinto.',
  },

  'auditores-internos': {
    slug: 'auditores-internos',
    nombre: 'Auditor interno',
    plural: 'Auditores internos y áreas de control',
    resumen:
      'Revisión permanente desde adentro: pruebas periódicas, seguimiento de hallazgos y reporte a la dirección.',
    queHace: [
      'El auditor interno vigila el programa de cumplimiento de forma continua, no una vez al año. Corre pruebas de escritorio sobre expedientes, revisa que los avisos hayan salido en tiempo y da seguimiento a los hallazgos hasta cerrarlos.',
      'En empresas medianas suele ser una función compartida, no una persona de tiempo completo. Lo importante es que quien la ejerce no dependa del área que genera las operaciones.',
      'Su producto son papeles: programa anual de trabajo, bitácora de pruebas, reporte de hallazgos con responsable y fecha, y evidencia de que la dirección lo conoció.',
    ],
    comoElegir: [
      {
        titulo: '¿A quién le reporta?',
        texto:
          'Si reporta al mismo directivo cuyas operaciones revisa, la función no es independiente. Debe llegar a la dirección general o al órgano de gobierno.',
      },
      {
        titulo: '¿Tiene programa anual escrito?',
        texto:
          'Sin plan de pruebas y calendario, la auditoría interna es reactiva y no deja evidencia útil.',
      },
      {
        titulo: '¿Sabe operar tu sistema de control de operaciones?',
        texto:
          'Si no puede extraer por sí mismo las operaciones del periodo, va a auditar lo que le entreguen, que no es lo mismo.',
      },
    ],
    senalesDeAlerta: [
      'La misma persona captura las operaciones y las audita.',
      'No hay bitácora: los hallazgos se comentan de palabra.',
    ],
    loQueNoHace:
      'La auditoría interna no sustituye a la externa cuando la norma exige un tercero independiente.',
  },

  capacitadores: {
    slug: 'capacitadores',
    nombre: 'Capacitador o instructor',
    plural: 'Capacitadores y programas de formación',
    resumen:
      'Cursos para el personal, con constancias y evidencia de que la capacitación existió y a quién alcanzó.',
    queHace: [
      'La capacitación es una obligación con evidencia: no basta con que el equipo "sepa", tiene que poder demostrarse quién se capacitó, en qué, cuándo y con qué resultado.',
      'Un buen programa distingue audiencias: el mostrador necesita saber qué pedirle al cliente y cómo, el área contable necesita el detalle de umbrales y acumulación, y la dirección necesita entender el riesgo y las consecuencias.',
      'El entregable relevante no es el diploma, sino el paquete de evidencia: lista de asistencia, contenido impartido, fecha, evaluación y constancia por persona.',
    ],
    comoElegir: [
      {
        titulo: '¿El contenido está fechado y versionado?',
        texto:
          'Un curso que no dice contra qué texto vigente se preparó es un curso que puede estar enseñando reglas derogadas.',
      },
      {
        titulo: '¿Incluye casos de tu actividad?',
        texto:
          'La capacitación genérica no cambia conductas. Pide ejemplos con las operaciones que tu gente ve todos los días.',
      },
      {
        titulo: '¿Qué evidencia entrega y en qué formato?',
        texto:
          'Constancias individuales, lista de asistencia y temario. Eso es lo que un auditor va a pedirte.',
      },
      {
        titulo: '¿Hay evaluación?',
        texto:
          'Sin evaluación no puedes demostrar aprovechamiento, sólo asistencia.',
      },
    ],
    senalesDeAlerta: [
      'Vende constancias sin curso.',
      'Presenta el curso como si "acreditara" a la empresa ante la autoridad.',
      'El temario no ha cambiado desde antes de la última reforma.',
    ],
    loQueNoHace:
      'Un curso no acredita cumplimiento de la empresa: acredita que ciertas personas recibieron formación.',
  },

  'proveedores-kyc': {
    slug: 'proveedores-kyc',
    nombre: 'Proveedor de identificación de clientes',
    plural: 'Proveedores de identificación y KYC',
    resumen:
      'Herramientas para identificar al cliente, validar documentos y armar el expediente sin que se vuelva un archivero de papel.',
    queHace: [
      'Estos proveedores automatizan la parte más repetitiva del expediente: captura de identificación oficial, validación de su vigencia, cotejo biométrico, comprobante de domicilio y firma del cuestionario de conocimiento del cliente.',
      'El beneficio real no es la tecnología, es la trazabilidad: quedan sellos de tiempo, versión del documento y quién lo revisó. Eso es lo que sobrevive a una revisión tres años después.',
      'Antes de contratar, revisa dónde se almacenan los datos personales de tus clientes y qué dice tu propio aviso de privacidad al respecto: al contratar un tercero sigues siendo responsable del tratamiento.',
    ],
    comoElegir: [
      {
        titulo: '¿Dónde viven los datos y por cuánto tiempo?',
        texto:
          'Pide por escrito ubicación del almacenamiento, cifrado y plazo de conservación. Debe cuadrar con el plazo que a ti te exige la norma.',
      },
      {
        titulo: '¿Puedes exportar todo si te vas?',
        texto:
          'Si el expediente sólo existe dentro de su plataforma, el día que cambies de proveedor te quedas sin evidencia.',
      },
      {
        titulo: '¿Cómo maneja los casos que la máquina no resuelve?',
        texto:
          'Ninguna validación automática acierta el 100%. Pregunta qué pasa con el porcentaje que cae a revisión manual y quién la hace.',
      },
    ],
    senalesDeAlerta: [
      'No firma un contrato de tratamiento de datos personales.',
      'No puede decirte su tasa de falsos rechazos.',
      'Cobra por consulta sin techo y sin reporte de consumo.',
    ],
    loQueNoHace:
      'Una herramienta de identificación no decide por ti si aceptas al cliente ni si presentas un aviso.',
  },

  'consulta-pep-listas': {
    slug: 'consulta-pep-listas',
    nombre: 'Proveedor de consulta de listas',
    plural: 'Consulta de PEP y listas restrictivas',
    resumen:
      'Búsqueda de personas políticamente expuestas y de listas de personas bloqueadas o sancionadas, con evidencia de la consulta.',
    queHace: [
      'Estos servicios comparan a tu cliente contra listas de personas políticamente expuestas y contra listas restrictivas nacionales e internacionales, y te devuelven una constancia de que la consulta se hizo en una fecha determinada.',
      'La constancia importa tanto como el resultado. Si no queda registro de que consultaste, para efectos de una revisión es como si no lo hubieras hecho.',
      'La calidad se juega en dos cosas: qué listas cubre y con qué frecuencia se actualizan, y qué tan bien maneja las coincidencias parciales de nombres, que en México son constantes por los apellidos compuestos.',
    ],
    comoElegir: [
      {
        titulo: '¿Qué listas exactamente y con qué fecha de corte?',
        texto:
          'Pide el catálogo de fuentes y la periodicidad de actualización por escrito. "Listas internacionales" no es una respuesta.',
      },
      {
        titulo: '¿Cómo documenta una consulta sin coincidencias?',
        texto:
          'El caso más frecuente es el negativo, y es el que necesitas poder archivar.',
      },
      {
        titulo: '¿Cómo maneja los homónimos?',
        texto:
          'Pregunta por el proceso de descarte y si queda registrado quién lo autorizó.',
      },
      {
        titulo: '¿Hay monitoreo continuo o sólo consulta puntual?',
        texto:
          'Un cliente puede volverse PEP después de que lo diste de alta. Define si necesitas revisión recurrente.',
      },
    ],
    senalesDeAlerta: [
      'Presenta el resultado como una certificación de que la persona "está limpia".',
      'No entrega constancia descargable con fecha y hora.',
      'No documenta qué versión de cada lista consultó.',
    ],
    loQueNoHace:
      'Una consulta de listas no sustituye el análisis de riesgo del cliente ni la decisión de negocio de aceptarlo.',
  },

  'software-cumplimiento': {
    slug: 'software-cumplimiento',
    nombre: 'Software de cumplimiento',
    plural: 'Software de cumplimiento LFPIORPI',
    resumen:
      'Plataformas que concentran clientes, operaciones, alertas y generación de avisos en un solo sistema con bitácora.',
    queHace: [
      'Un sistema de cumplimiento sirve para tres cosas concretas: acumular operaciones por cliente para no perder el umbral, generar el archivo del aviso en el formato que pide la autoridad, y dejar bitácora de quién hizo qué y cuándo.',
      'La normativa vigente empuja hacia mecanismos automatizados con fechas escalonadas de exigibilidad. Eso no significa que cualquier empresa necesite la plataforma más cara: para volúmenes bajos, un control bien llevado puede bastar, siempre que sea auditable.',
      'Publicamos un comparativo neutral con criterios objetivos. No recibimos pago por posición en ese comparativo, y si algún día existiera una relación de afiliación, aparecería declarada en la propia página.',
    ],
    comoElegir: [
      {
        titulo: '¿Cubre tu actividad vulnerable en específico?',
        texto:
          'Los campos del aviso cambian por actividad. Un sistema pensado para inmobiliarias puede no generar el archivo de comercio exterior.',
      },
      {
        titulo: '¿Calcula la acumulación de seis meses solo?',
        texto:
          'Es el punto donde más sistemas se quedan cortos. Pide verlo con datos de prueba, no en la presentación comercial.',
      },
      {
        titulo: '¿Puedes exportar tus datos y tus acuses?',
        texto:
          'La obligación de conservar es tuya y dura años. Si el sistema no exporta, estás rentando tu propia evidencia.',
      },
      {
        titulo: '¿Publica precio?',
        texto:
          'Casi ningún proveedor del sector publica precios. Pide propuesta por escrito con el costo total: implantación, usuarios, consultas de listas y soporte.',
      },
    ],
    senalesDeAlerta: [
      'Promete que el sistema "te deja en cumplimiento" por sí solo.',
      'No permite una prueba con tus propios datos.',
      'El contrato no dice qué pasa con tus datos al terminar.',
    ],
    loQueNoHace:
      'Ningún software presenta avisos por ti sin tu firma electrónica ni asume tu responsabilidad legal.',
  },

  'despachos-multidisciplinarios': {
    slug: 'despachos-multidisciplinarios',
    nombre: 'Despacho multidisciplinario',
    plural: 'Despachos multidisciplinarios',
    resumen:
      'Firmas que combinan contabilidad, derecho y cumplimiento bajo un mismo techo y un solo interlocutor.',
    queHace: [
      'Un despacho multidisciplinario resuelve el problema de coordinación: cuando el contador, el abogado y el consultor son tres proveedores distintos, los huecos aparecen justo entre ellos.',
      'Suelen ofrecer el paquete completo: alta en el padrón, implantación del programa, operación mensual de avisos, capacitación y defensa si llega un requerimiento.',
      'La contrapartida es la independencia: si la misma firma diseña, opera y revisa, no hay revisión independiente. Para la auditoría que exige un tercero, contrata a alguien más.',
    ],
    comoElegir: [
      {
        titulo: '¿Quién es tu interlocutor y quién hace el trabajo?',
        texto:
          'En firmas grandes el socio que te vende no es quien opera. Pide conocer al equipo que va a llevar tu cuenta.',
      },
      {
        titulo: '¿Está separada la función de revisión?',
        texto:
          'Si el mismo equipo implanta y audita, el informe de auditoría no es independiente.',
      },
      {
        titulo: '¿Cómo se factura cada servicio?',
        texto:
          'Pide desglose. El paquete cerrado suele esconder qué pasa cuando aumenta el volumen de operaciones.',
      },
    ],
    senalesDeAlerta: [
      'Ofrece auditarte a ti mismo con el mismo equipo que te implantó el programa.',
      'No tiene claro quién firma cada entregable.',
    ],
    loQueNoHace:
      'Contratar todo con una sola firma no traslada la responsabilidad legal: sigue siendo del sujeto obligado.',
  },
};

export const ORDEN_CATEGORIAS: readonly CategoriaProveedor[] = [
  'consultores-pld',
  'contadores',
  'abogados',
  'despachos-multidisciplinarios',
  'auditores-externos',
  'auditores-internos',
  'capacitadores',
  'software-cumplimiento',
  'proveedores-kyc',
  'consulta-pep-listas',
];

export function esCategoria(valor: string): valor is CategoriaProveedor {
  return valor in FICHAS_CATEGORIA;
}

/* ── Etiquetas cortas para filtros y tarjetas ───────────────────────────── */

export const ETIQUETA_CATEGORIA: Record<CategoriaProveedor, string> = {
  contadores: 'Contadores',
  abogados: 'Abogados',
  'consultores-pld': 'Consultores PLD',
  'auditores-externos': 'Auditoría externa',
  'auditores-internos': 'Auditoría interna',
  capacitadores: 'Capacitación',
  'proveedores-kyc': 'Identificación / KYC',
  'consulta-pep-listas': 'PEP y listas',
  'software-cumplimiento': 'Software',
  'despachos-multidisciplinarios': 'Despachos integrales',
};

export const ETIQUETA_PLAN_PERFIL: Record<PlanProveedor, string> = {
  gratuito: 'Perfil gratuito',
  profesional: 'Perfil profesional',
  destacado: 'Perfil destacado',
};

export const ETIQUETA_TAMANO: Record<TamanoCliente, string> = {
  micro: 'Microempresa',
  pequena: 'Empresa pequeña',
  mediana: 'Empresa mediana',
  grande: 'Empresa grande',
};

/** Orden de mayor a menor comprobación. Define el orden natural de resultados. */
export const PESO_VERIFICACION: Record<NivelVerificacionProveedor, number> = {
  certificacion_externa_revisada: 4,
  documentacion_revisada: 3,
  identidad_verificada: 2,
  correo_verificado: 1,
  sin_verificar: 0,
};

export const TONO_VERIFICACION: Record<
  NivelVerificacionProveedor,
  'neutro' | 'marino' | 'petroleo' | 'verde'
> = {
  sin_verificar: 'neutro',
  correo_verificado: 'neutro',
  identidad_verificada: 'marino',
  documentacion_revisada: 'petroleo',
  certificacion_externa_revisada: 'verde',
};

/* ── Geografía ──────────────────────────────────────────────────────────── */

export const ESTADOS_MX: readonly string[] = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
];

export const IDIOMAS_DIRECTORIO: readonly string[] = [
  'Español',
  'Inglés',
  'Francés',
  'Alemán',
  'Portugués',
  'Japonés',
  'Chino mandarín',
  'Lengua de señas mexicana',
];

/**
 * Tipos de servicio con los que se filtra. Son etiquetas nuestras, no
 * categorías legales: sirven para acotar la búsqueda, no para clasificar
 * obligaciones.
 */
export const TIPOS_SERVICIO = [
  { clave: 'alta-padron', etiqueta: 'Alta en el padrón' },
  { clave: 'manual-politicas', etiqueta: 'Manual de políticas' },
  { clave: 'evaluacion-riesgos', etiqueta: 'Evaluación de riesgos' },
  { clave: 'expedientes', etiqueta: 'Expedientes de identificación' },
  { clave: 'envio-avisos', etiqueta: 'Preparación y envío de avisos' },
  { clave: 'auditoria', etiqueta: 'Auditoría' },
  { clave: 'capacitacion', etiqueta: 'Capacitación' },
  { clave: 'defensa', etiqueta: 'Defensa ante requerimientos y multas' },
  { clave: 'beneficiario-controlador', etiqueta: 'Beneficiario controlador' },
  { clave: 'implementacion-software', etiqueta: 'Implantación de software' },
] as const;

export type ClaveServicio = (typeof TIPOS_SERVICIO)[number]['clave'];

export const ETIQUETA_SERVICIO: Record<string, string> = Object.fromEntries(
  TIPOS_SERVICIO.map((s) => [s.clave, s.etiqueta]),
);
