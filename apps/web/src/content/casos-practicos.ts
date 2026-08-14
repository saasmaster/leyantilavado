import {
  pesosACentavos,
  type MedioPago,
  type Operacion,
  type TipoCliente,
} from '@leyantilavado/types';

/* ────────────────────────────────────────────────────────────────────────────
 * Casos prácticos resueltos.
 *
 * Un caso NO guarda su resultado. Guarda los datos de la operación —qué se
 * vendió, en cuánto, cuándo, cómo se pagó— y la página los pasa por
 * `evaluarOperacion`, el mismo motor que usan las calculadoras. Si mañana la
 * autoridad mueve un umbral o cambia la UMA, los doce casos se recalculan
 * solos; si un caso dejara de tener sentido, el resultado lo delataría en
 * pantalla en lugar de quedarse mintiendo en una página.
 *
 * Reglas que este archivo hace cumplir (las mismas de `./tipos.ts`):
 *
 *  · NINGUNA cifra legal vive aquí. No hay umbrales, ni UMA, ni multas. Lo
 *    único numérico son los MONTOS DE LOS CASOS, que son cifras de negocio
 *    inventadas para ilustrar, no datos normativos.
 *  · El dinero es aritmética entera en centavos. Los montos se escriben en
 *    pesos como cadena y `pesosACentavos` los convierte con BigInt: nunca hay
 *    un flotante de por medio.
 *  · Las fechas son ISO fijas. Determinan qué UMA y qué regla aplican, y hacen
 *    que dos builds del mismo código produzcan exactamente la misma página.
 *  · Los hechos son inventados. Ninguna operación, empresa o persona de estas
 *    doce existe; son casos de escuela para enseñar cómo se aplica la regla.
 * ────────────────────────────────────────────────────────────────────────── */

export interface CasoPractico {
  slug: string;
  /** H1 de la página del caso. */
  titulo: string;
  /** Título del resultado de búsqueda. Máximo 60 caracteres. */
  tituloSEO: string;
  /** Descripción del resultado de búsqueda. Máximo 160 caracteres. */
  descripcionSEO: string;
  /** Una línea para el índice: de qué va el caso, sin adelantar la conclusión. */
  resumen: string;
  /** Quién es y qué pasó. Dos o tres frases, nombres genéricos, sin cifras legales. */
  contexto: string;
  /**
   * La operación tal como entra al motor.
   *
   * La actividad, el subtipo, el medio de pago y el tipo de cliente viven aquí
   * y no duplicados en el caso: `Operacion` ya es el contrato del motor, así
   * que no hay dos copias del mismo dato que puedan separarse.
   */
  operacion: Operacion;
  /** Lecturas del caso que el motor no puede derivar de los datos. */
  notas: readonly string[];
  /** Qué hacer después de leer la conclusión, en orden. */
  siguientesPasos: readonly string[];
}

/** Etiquetas de presentación. No son datos normativos: son cómo se lee un enum. */
export const ETIQUETA_MEDIO_PAGO: Record<MedioPago, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia electrónica',
  cheque: 'Cheque',
  tarjeta: 'Tarjeta',
  metales_preciosos: 'Metales preciosos',
  activos_virtuales: 'Activos virtuales',
  mixto: 'Pago mixto',
  otro: 'Otro medio',
};

export const ETIQUETA_TIPO_CLIENTE: Record<TipoCliente, string> = {
  persona_fisica: 'Persona física',
  persona_moral: 'Persona moral',
  fideicomiso: 'Fideicomiso',
  desconocido: 'Sin determinar',
};

/**
 * Advertencia que acompaña a todos los casos.
 *
 * No es un formalismo: la diferencia entre «así se aplica la regla» y «esto es
 * lo que te toca hacer» es exactamente la diferencia entre este sitio y un
 * despacho, y conviene que el lector la vea antes que la conclusión.
 */
export const ADVERTENCIA_ILUSTRATIVA =
  'Los hechos de este caso son inventados. Sirven para enseñar cómo se aplica la regla a una operación concreta, no para resolver la tuya: dos operaciones que se parecen en el monto pueden separarse por el subtipo, por la fecha o por el historial del cliente.';

export const CASOS_PRACTICOS: readonly CasoPractico[] = [
  /* ── Fedatarios ─────────────────────────────────────────────────────────── */
  {
    slug: 'notaria-compraventa-inmueble-pago-mixto',
    titulo: 'Notaría: compraventa de una casa con pago mixto',
    tituloSEO: 'Caso: compraventa ante notario con pago mixto',
    descripcionSEO:
      'Una notaría protocoliza la compraventa de una casa que se paga parte en transferencia y parte en efectivo. Qué se identifica, qué se avisa y qué se conserva.',
    resumen:
      'Compraventa de casa habitación protocolizada ante notario, liquidada en parte por transferencia y en parte en efectivo.',
    contexto:
      'Una notaría del Estado de México protocoliza la compraventa de una casa habitación entre dos particulares. El comprador liquida la mayor parte por transferencia desde su cuenta y entrega el resto en efectivo el día de la firma. El vendedor pide que la escritura salga el mismo día.',
    operacion: {
      id: 'notaria-compraventa-inmueble-pago-mixto',
      fecha: '2026-03-05',
      actividad: 'fe-publica-notarios',
      subtipo: 'inmuebles',
      monto: pesosACentavos('2500000'),
      montoEfectivo: pesosACentavos('300000'),
      medioPago: 'mixto',
      tipoCliente: 'persona_fisica',
      descripcion: 'Compraventa de casa habitación protocolizada ante notario.',
    },
    notas: [
      'La base del umbral notarial no es siempre el precio pactado: se toma el valor más alto entre el precio, el catastral, el comercial y el monto garantizado por suerte principal. Si el catastral fuera mayor que lo pactado, se mide con ése.',
      'El aviso y el límite de efectivo son dos preguntas distintas y se responden por separado. Aquí la operación sí genera aviso y el efectivo entregado sí cabe dentro del límite: son dos resultados independientes, no uno solo.',
      'El límite de efectivo del art. 32 se mide con IVA incluido; los umbrales de aviso del art. 17, sin IVA. Como el caso captura un solo monto, el motor lo advierte en los supuestos.',
    ],
    siguientesPasos: [
      'Integrar el expediente de identificación de comprador y vendedor antes de la firma, no después.',
      'Preguntar por el beneficiario controlador cuando alguna de las partes actúe por cuenta de otra persona.',
      'Presentar el aviso dentro del plazo del art. 17 y guardar el acuse: el acuse es la prueba, la captura no.',
      'Conservar el expediente por el plazo de conservación de la ley, contado desde la fecha de la operación.',
    ],
  },
  {
    slug: 'corredor-publico-avaluo-nave-industrial',
    titulo: 'Corredor público: avalúo de una nave industrial',
    tituloSEO: 'Caso: avalúo de corredor público sobre una nave',
    descripcionSEO:
      'Un corredor público emite el avalúo de una nave industrial. El caso muestra el supuesto en que identificación y aviso comparten exactamente el mismo umbral.',
    resumen:
      'Avalúo de una nave industrial emitido por corredor público, donde identificación y aviso comparten umbral.',
    contexto:
      'Un corredor público en Monterrey emite el avalúo de una nave industrial que una empresa quiere dar en garantía de un crédito. El cliente es la propia empresa propietaria del inmueble y paga por transferencia.',
    operacion: {
      id: 'corredor-publico-avaluo-nave-industrial',
      fecha: '2026-04-23',
      actividad: 'fe-publica-corredores',
      subtipo: 'avaluos',
      monto: pesosACentavos('1250000'),
      medioPago: 'transferencia',
      tipoCliente: 'persona_moral',
      descripcion: 'Avalúo de nave industrial emitido por corredor público.',
    },
    notas: [
      'Aquí el umbral de identificar y el de avisar son el mismo, así que se cruzan a la vez. En la mayoría de las actividades no es así: primero se identifica y sólo más arriba se avisa.',
      'Lo que se mide es el valor del bien avaluado, no los honorarios del corredor.',
      'El apartado de corredores tiene cuatro supuestos con reglas propias. El avalúo es sólo uno; constituir sociedades, fideicomisos y mutuos mercantiles se miden aparte.',
    ],
    siguientesPasos: [
      'Identificar a la persona moral y a quien la representa, y dejar constancia del acto que acredita esa representación.',
      'Determinar quién es el beneficiario controlador de la empresa: en persona moral es la parte que más se omite.',
      'Presentar el aviso en plazo con el valor que arrojó el avalúo, no con el honorario cobrado.',
    ],
  },

  /* ── Inmobiliario ───────────────────────────────────────────────────────── */
  {
    slug: 'inmobiliaria-guadalajara-departamento-preventa',
    titulo: 'Inmobiliaria: departamento en preventa en Guadalajara',
    tituloSEO: 'Caso: preventa de departamento en Guadalajara',
    descripcionSEO:
      'Una inmobiliaria intermedia la preventa de un departamento. El caso muestra por qué se identifica siempre aunque el aviso todavía no se dispare.',
    resumen:
      'Intermediación de la preventa de un departamento: identificación obligada desde el primer peso, aviso todavía no.',
    contexto:
      'Una inmobiliaria en Guadalajara intermedia la preventa de un departamento de dos recámaras en un desarrollo de la zona poniente. El comprador es un particular que paga el enganche por transferencia y contrata crédito bancario para el resto.',
    operacion: {
      id: 'inmobiliaria-guadalajara-departamento-preventa',
      fecha: '2026-04-18',
      actividad: 'inmuebles-construccion-intermediacion',
      monto: pesosACentavos('780000'),
      medioPago: 'transferencia',
      tipoCliente: 'persona_fisica',
      descripcion: 'Intermediación en la preventa de un departamento.',
    },
    notas: [
      'La intermediación inmobiliaria obliga a identificar al cliente sin importar el monto. El umbral sólo decide si además hay que presentar aviso; no decide si hay expediente.',
      'Lo que se mide es el valor del inmueble intermediado, no la comisión de la inmobiliaria.',
      'El caso queda por debajo del umbral de aviso, pero cerca. Una segunda operación del mismo comprador en seis meses puede cruzarlo por acumulación.',
    ],
    siguientesPasos: [
      'Integrar el expediente del comprador desde el primer contacto: aquí la identificación no depende del monto.',
      'Registrar la operación en la bitácora del cliente para que la acumulación de seis meses se pueda calcular después.',
      'Volver a evaluar si el precio final sube respecto del pactado en preventa.',
    ],
  },
  {
    slug: 'arrendamiento-local-comercial-renta-mensual',
    titulo: 'Arrendamiento: renta mensual de un local comercial',
    tituloSEO: 'Caso: renta mensual de un local comercial',
    descripcionSEO:
      'Una arrendadora cobra la renta mensual de un local comercial. El caso muestra por qué el arrendamiento se mide por mes y no por contrato.',
    resumen:
      'Renta mensual de un local comercial: el umbral se mide al mes, no sobre el total del contrato.',
    contexto:
      'Una empresa arrendadora en Puebla renta un local comercial a una cadena de tiendas. El contrato es a tres años y la renta se paga por transferencia el primer día hábil de cada mes.',
    operacion: {
      id: 'arrendamiento-local-comercial-renta-mensual',
      fecha: '2026-03-31',
      actividad: 'arrendamiento-inmuebles',
      monto: pesosACentavos('195000'),
      medioPago: 'transferencia',
      tipoCliente: 'persona_moral',
      descripcion: 'Renta mensual de un local comercial bajo contrato a tres años.',
    },
    notas: [
      'El monto capturado es la renta de UN mes, no el valor de los tres años de contrato. Multiplicar el contrato completo es el error más frecuente en esta fracción y dispara avisos que no proceden.',
      'El umbral de identificación de arrendamiento se lee «superior a»: una renta que caiga exactamente en la cifra del umbral no lo alcanza. El de aviso se lee «igual o superior a» y sí lo alcanzaría. La diferencia de una palabra cambia el resultado.',
      'Si la renta se ajusta por inflación a mitad del contrato, el mes del ajuste vuelve a medirse: el resultado de marzo no vale para siempre.',
    ],
    siguientesPasos: [
      'Integrar el expediente del arrendatario y de quien firma por él.',
      'Reevaluar el mes en que se aplique el incremento de renta pactado.',
      'Verificar aparte el límite de efectivo si algún mes se cobrara en billetes: la renta en efectivo tiene su propia prohibición.',
    ],
  },

  /* ── Bienes ─────────────────────────────────────────────────────────────── */
  {
    slug: 'joyeria-venta-lote-relojes-mostrador',
    titulo: 'Joyería: venta de relojes en mostrador',
    tituloSEO: 'Caso: venta de relojes de alta gama en joyería',
    descripcionSEO:
      'Una joyería vende dos relojes de alta gama con pago en tarjeta. El caso muestra cuándo hay que identificar al cliente sin que todavía haya aviso.',
    resumen:
      'Venta de dos relojes de alta gama pagados con tarjeta: se identifica al cliente, todavía no hay aviso.',
    contexto:
      'Una joyería en el centro de Querétaro vende dos relojes de alta gama a un cliente que ya había comprado ahí el año pasado. Paga con tarjeta de crédito en una sola exhibición y pide factura a nombre propio.',
    operacion: {
      id: 'joyeria-venta-lote-relojes-mostrador',
      fecha: '2026-05-22',
      actividad: 'metales-joyeria',
      monto: pesosACentavos('120000'),
      medioPago: 'tarjeta',
      tipoCliente: 'persona_fisica',
      descripcion: 'Venta de dos relojes de alta gama en mostrador.',
    },
    notas: [
      'Que el pago sea con tarjeta no saca la operación de la fracción: esta actividad es objeto de aviso con independencia de la forma de pago. La tarjeta sólo evita el problema del límite de efectivo, que es otra cosa.',
      'El cliente ya compró antes en la joyería. Si aquella compra cae dentro de la ventana de seis meses, las dos se suman y la conclusión puede cambiar: el motor no la ve porque el caso no trae historial.',
      'Vender dos relojes en dos tickets el mismo día no parte la operación en dos. Fraccionar un mismo acto no evita la obligación.',
    ],
    siguientesPasos: [
      'Integrar el expediente del cliente ahora, aunque no haya aviso: la identificación ya se activó.',
      'Buscar en la bitácora las compras del mismo cliente en los seis meses previos y sumarlas.',
      'Reevaluar la conclusión con esa suma antes de dar el caso por cerrado.',
    ],
  },
  {
    slug: 'agencia-vehiculos-camioneta-seminueva-efectivo',
    titulo: 'Agencia de autos: camioneta seminueva con enganche en efectivo',
    tituloSEO: 'Caso: venta de camioneta con enganche en efectivo',
    descripcionSEO:
      'Una agencia vende una camioneta seminueva y recibe un enganche fuerte en efectivo. El caso muestra la prohibición del art. 32, que es distinta del aviso.',
    resumen:
      'Venta de camioneta seminueva con una parte importante liquidada en efectivo: aviso y prohibición se responden por separado.',
    contexto:
      'Una agencia de autos seminuevos en Culiacán vende una camioneta a un particular. El cliente entrega una parte importante del precio en efectivo el día de la entrega y el resto con un cheque de caja.',
    operacion: {
      id: 'agencia-vehiculos-camioneta-seminueva-efectivo',
      fecha: '2026-06-09',
      actividad: 'vehiculos',
      monto: pesosACentavos('690000'),
      montoEfectivo: pesosACentavos('400000'),
      medioPago: 'mixto',
      tipoCliente: 'persona_fisica',
      descripcion: 'Venta de camioneta seminueva con enganche en efectivo.',
    },
    notas: [
      'Este es el caso que más confunde: la operación NO alcanza el umbral de aviso y aun así hay un problema serio, porque el efectivo rebasa el límite del art. 32. Rebasarlo es una infracción por sí sola, aunque el aviso no proceda y aunque todo lo demás esté en orden.',
      'El límite de efectivo es una prohibición, no un umbral de reporte. No se «reporta y ya»: la operación no debió liquidarse así.',
      'La venta de vehículos sólo es actividad vulnerable cuando la comercialización es habitual o profesional. Un particular que vende su propia camioneta no queda dentro.',
    ],
    siguientesPasos: [
      'Reestructurar el pago para que la parte en efectivo quede dentro del límite: transferencia, cheque nominativo o tarjeta.',
      'Identificar al cliente e integrar el expediente: el umbral de identificación sí se cruzó.',
      'Dejar constancia en la bitácora del monto liquidado en efectivo, no sólo del precio total.',
      'Revisar la política interna de caja: si esta operación pasó, es probable que pasen otras.',
    ],
  },
  {
    slug: 'galeria-venta-obra-arte-artista-emergente',
    titulo: 'Galería: venta de una obra de artista emergente',
    tituloSEO: 'Caso: venta de obra de arte por debajo del umbral',
    descripcionSEO:
      'Una galería vende una pieza de un artista emergente. El caso muestra qué significa exactamente que una operación quede por debajo de todos los umbrales.',
    resumen:
      'Venta de una pieza por debajo de todos los umbrales: qué significa —y qué no— que la regla no se active.',
    contexto:
      'Una galería en la Ciudad de México vende una pieza de un artista emergente a un coleccionista particular durante una exposición. El pago se hace por transferencia el mismo día, contra factura.',
    operacion: {
      id: 'galeria-venta-obra-arte-artista-emergente',
      fecha: '2026-05-30',
      actividad: 'obras-arte',
      monto: pesosACentavos('210000'),
      medioPago: 'transferencia',
      tipoCliente: 'persona_fisica',
      descripcion: 'Venta de una obra de arte a un coleccionista particular.',
    },
    notas: [
      'Este caso está aquí precisamente porque no dispara nada. El motor no dice «cumples» ni «estás libre»: dice que con estos datos no se ve una obligación, que es una afirmación mucho más chica.',
      'La afirmación cubre esta operación y nada más. Si el mismo coleccionista compró otras piezas en los seis meses previos, la suma puede cruzar el umbral y la conclusión cambia.',
      'Que no haya aviso no elimina las obligaciones de la galería como sujeto obligado: el alta, el representante de cumplimiento y la política de identificación no dependen de esta venta.',
    ],
    siguientesPasos: [
      'Registrar la venta en la bitácora del cliente aunque no genere obligación: sin ese registro la acumulación no se puede calcular después.',
      'Revisar si el mismo coleccionista tiene compras previas dentro de la ventana de seis meses.',
      'Conservar el resultado con su fecha: si la UMA cambia, la misma cifra puede leerse distinto el año que viene.',
    ],
  },

  /* ── Servicios financieros y profesionales ──────────────────────────────── */
  {
    slug: 'prestamo-particular-firmado-en-enero',
    titulo: 'Préstamo entre particulares firmado en enero',
    tituloSEO: 'Caso: préstamo de enero y la UMA del año anterior',
    descripcionSEO:
      'Un préstamo firmado en enero se mide con la UMA del año anterior, no con la del año en curso. El caso muestra cuándo esa diferencia cambia el resultado.',
    resumen:
      'Préstamo firmado en enero: la UMA que aplica es la del año anterior, y aquí eso decide el resultado.',
    contexto:
      'Una empresa que otorga préstamos con garantía firma un mutuo con una persona moral el 22 de enero. Los recursos se dispersan por transferencia el mismo día y el pagaré queda garantizado con un bien mueble.',
    operacion: {
      id: 'prestamo-particular-firmado-en-enero',
      fecha: '2026-01-22',
      actividad: 'prestamos-creditos',
      monto: pesosACentavos('185000'),
      medioPago: 'transferencia',
      tipoCliente: 'persona_moral',
      descripcion: 'Mutuo con garantía otorgado a una persona moral.',
    },
    notas: [
      'La UMA entra en vigor el 1 de febrero. Una operación de enero se mide con la del año anterior, que es más baja, y por eso el umbral en pesos también es más bajo en enero.',
      'Esa diferencia no es teórica en este caso: la misma cifra firmada unas semanas después, ya con la UMA nueva, no alcanzaría el umbral de aviso. El resultado cambia por la fecha, no por el monto.',
      'El mutuo, el préstamo, el crédito y la garantía obligan a identificar al cliente sin importar el monto. El umbral sólo decide el aviso.',
    ],
    siguientesPasos: [
      'Verificar la fecha del acto antes de calcular: la del contrato, no la del día en que se captura.',
      'Identificar al acreditado y determinar su beneficiario controlador por tratarse de persona moral.',
      'Presentar el aviso en plazo y conservar el acuse junto con el contrato y el comprobante de dispersión.',
    ],
  },
  {
    slug: 'despacho-contable-constitucion-sociedad-en-representacion',
    titulo: 'Despacho contable: constituir una sociedad por cuenta del cliente',
    tituloSEO: 'Caso: constituir una sociedad por cuenta del cliente',
    descripcionSEO:
      'Un despacho constituye una sociedad y además realiza la operación financiera por cuenta del cliente. Aquí el aviso no depende del monto sino del rol.',
    resumen:
      'Constitución de sociedad en la que el despacho, además de asesorar, opera por cuenta del cliente.',
    contexto:
      'Un despacho contable en León constituye una sociedad para un cliente que radica en el extranjero. Además de preparar la documentación, el despacho abre la cuenta bancaria y realiza la aportación inicial de capital en nombre y representación del cliente.',
    operacion: {
      id: 'despacho-contable-constitucion-sociedad-en-representacion',
      fecha: '2026-02-11',
      actividad: 'servicios-profesionales',
      subtipo: 'constitucion-personas-morales',
      monto: pesosACentavos('1200000'),
      medioPago: 'transferencia',
      tipoCliente: 'persona_moral',
      enRepresentacionDelCliente: true,
      descripcion: 'Constitución de sociedad con aportación de capital hecha por el despacho.',
    },
    notas: [
      'El aviso de servicios profesionales no tiene umbral en pesos: depende de si el profesional realiza la operación en nombre y representación del cliente, o si sólo asesora. El monto de este caso no es lo que decide el resultado.',
      'Si el mismo despacho se hubiera limitado a opinar y a preparar documentos, sin mover el dinero, el aviso no procedería por este supuesto —pero seguiría obligado a identificar al cliente y a integrar expediente.',
      'La ley preserva el secreto profesional y la garantía de defensa del cliente. El aviso no obliga a entregar la estrategia jurídica.',
    ],
    siguientesPasos: [
      'Documentar por escrito en qué carácter actúa el despacho: es el dato que decide la obligación y el que revisará la autoridad.',
      'Identificar a los socios y determinar el beneficiario controlador de la sociedad que se constituye.',
      'Presentar el aviso en plazo por el supuesto de representación, no por el monto.',
    ],
  },
  {
    slug: 'plataforma-activos-virtuales-comision-cobrada',
    titulo: 'Activos virtuales: la comisión que dispara el aviso',
    tituloSEO: 'Caso: activos virtuales y la comisión que obliga',
    descripcionSEO:
      'Una plataforma de intercambio cobra comisión por una operación pequeña. El caso muestra los dos disparadores independientes de esta fracción.',
    resumen:
      'Intercambio de activos virtuales con monto pequeño y comisión alta: dos disparadores, basta con uno.',
    contexto:
      'Una plataforma mexicana de intercambio de activos virtuales procesa una operación de compra para un cliente recurrente. El monto intercambiado es modesto, pero la plataforma cobra una comisión de servicio elevada por tratarse de una orden urgente fuera de horario.',
    operacion: {
      id: 'plataforma-activos-virtuales-comision-cobrada',
      fecha: '2026-07-03',
      actividad: 'activos-virtuales',
      monto: pesosACentavos('18000'),
      comision: pesosACentavos('620'),
      medioPago: 'activos_virtuales',
      tipoCliente: 'persona_fisica',
      descripcion: 'Intercambio de activos virtuales con comisión de servicio.',
    },
    notas: [
      'Esta fracción tiene dos disparadores independientes: el monto de la operación y la contraprestación cobrada por el servicio. Basta con que uno se alcance, y aquí el que se alcanza es el segundo.',
      'Quien sólo vigila el monto de las operaciones deja fuera de radar toda una categoría de avisos. La comisión suele ser el disparador que nadie mide.',
      'La fracción alcanza también operaciones realizadas con personas mexicanas desde otra jurisdicción: la plataforma no queda fuera por estar constituida en el extranjero.',
    ],
    siguientesPasos: [
      'Instrumentar la medición de la comisión cobrada en el sistema, no sólo la del monto intercambiado.',
      'Identificar al cliente: en esta fracción la identificación aplica desde la primera operación.',
      'Presentar el aviso en plazo indicando cuál de los dos disparadores se alcanzó.',
    ],
  },
  {
    slug: 'traslado-valores-monto-no-determinable',
    titulo: 'Traslado de valores cuando el monto no se puede determinar',
    tituloSEO: 'Caso: traslado de valores de monto indeterminable',
    descripcionSEO:
      'Una empresa de traslado custodia valores cuyo monto no puede determinarse. El caso muestra el supuesto en que la obligación no depende de una cifra.',
    resumen:
      'Custodia de valores sellados cuyo monto no puede determinarse: la obligación no depende de la cifra.',
    contexto:
      'Una empresa de traslado y custodia de valores recoge y resguarda contenedores sellados de un cliente corporativo. El contrato prohíbe abrirlos y el cliente no declara su contenido, así que la empresa no puede determinar el valor de lo que custodia.',
    operacion: {
      id: 'traslado-valores-monto-no-determinable',
      fecha: '2026-08-07',
      actividad: 'traslado-custodia-valores',
      monto: pesosACentavos('0'),
      medioPago: 'otro',
      tipoCliente: 'persona_moral',
      montoIndeterminable: true,
      descripcion: 'Custodia de contenedores sellados de contenido y valor no declarados.',
    },
    notas: [
      'La fracción tiene dos supuestos: uno con umbral, cuando el monto puede determinarse, y otro que obliga siempre, cuando no. Este caso cae en el segundo, y por eso el resultado no depende de ninguna cifra.',
      'No declarar el contenido no es una vía de escape: es justamente el supuesto que la ley cierra obligando a avisar en todos los casos.',
      'Se exceptúan el Banco de México y las instituciones de depósito de valores. Una empresa privada de custodia no entra en esa excepción.',
    ],
    siguientesPasos: [
      'Identificar al cliente corporativo y determinar su beneficiario controlador.',
      'Dejar asentado en el expediente por qué el monto no pudo determinarse: es el hecho que sostiene el supuesto aplicado.',
      'Presentar el aviso en plazo sin esperar a conocer el valor de lo custodiado.',
    ],
  },
  {
    slug: 'asociacion-civil-donativo-anual-empresa',
    titulo: 'Asociación civil: donativo anual de una empresa',
    tituloSEO: 'Caso: donativo anual recibido por una asociación',
    descripcionSEO:
      'Una asociación civil recibe el donativo anual de una empresa. El caso muestra qué le toca hacer a quien recibe, no a quien dona.',
    resumen:
      'Donativo anual recibido de una empresa: las obligaciones son de quien recibe, no de quien dona.',
    contexto:
      'Una asociación civil dedicada a becas escolares recibe el donativo anual de una empresa constructora con la que trabaja desde hace años. El depósito llega por transferencia y la asociación expide el recibo deducible.',
    operacion: {
      id: 'asociacion-civil-donativo-anual-empresa',
      fecha: '2026-09-14',
      actividad: 'donativos',
      monto: pesosACentavos('420000'),
      medioPago: 'transferencia',
      tipoCliente: 'persona_moral',
      descripcion: 'Donativo anual recibido de una empresa donante.',
    },
    notas: [
      'La actividad vulnerable es recibir el donativo, no darlo. Las obligaciones recaen en la asociación; la empresa donante no adquiere ninguna por este acto.',
      'Ser donataria autorizada y expedir recibos deducibles no sustituye nada de esto: son dos regímenes distintos, uno fiscal y otro de prevención.',
      'Que el donante sea de confianza y de años no cambia el cálculo. La regla se aplica por monto y por tipo de acto, no por la relación con la contraparte.',
    ],
    siguientesPasos: [
      'Integrar el expediente del donante como persona moral, con su acta y su representación.',
      'Determinar el beneficiario controlador de la empresa donante.',
      'Presentar el aviso en plazo y sumar los donativos previos del mismo donante dentro de la ventana de seis meses.',
    ],
  },
];

export const CASOS_POR_SLUG: Record<string, CasoPractico> = Object.fromEntries(
  CASOS_PRACTICOS.map((c) => [c.slug, c]),
);
