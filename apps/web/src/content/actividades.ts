import type { ActividadSlug } from '@leyantilavado/types';
import type { ContenidoActividad } from './tipos';

/**
 * Contenido editorial por actividad vulnerable.
 *
 * Lo que NO está aquí: umbrales, límites y conversiones a pesos. Esos salen de
 * `datos.UMBRALES` y de `convertirUMA` al renderizar la página. Los únicos
 * números de este archivo son los montos de los ejemplos, que son cifras de
 * negocio elegidas para ilustrar el borde de cada regla.
 */
const CONTENIDOS: readonly ContenidoActividad[] = [
  /* ── I. Juegos con apuesta, concursos y sorteos ──────────────────────────── */
  {
    slug: 'juegos-sorteos',
    tituloSEO: 'Juegos con apuesta, concursos y sorteos: umbrales y obligaciones (art. 17-I)',
    descripcionSEO:
      'Cuándo un casino, una lotería o un sorteo promocional queda dentro de la Ley Antilavado, qué umbral aplica a la venta de boletos y al pago de premios, y cómo se acumulan las jugadas de un mismo cliente.',
    respuestaDirecta:
      'Si vendes boletos, fichas o cualquier comprobante para participar en un juego con apuesta, concurso o sorteo, o si pagas premios, realizas la actividad vulnerable de la fracción I. La obligación se mide sobre cada operación y también sobre series de transacciones que en apariencia están vinculadas entre sí, de modo que un jugador que cambia fichas varias veces al día no queda fuera por partirlas.',
    alcanza: [
      'Casinos y salas de sorteo de números con permiso de la Secretaría de Gobernación',
      'Operadores de lotería, rifas y sorteos con permiso vigente',
      'Plataformas de apuestas en línea que operan bajo un permiso mexicano',
      'Empresas que organizan concursos con premio en efectivo o en especie de valor alto',
      'Ferias y palenques que operan juegos con apuesta bajo permiso',
    ],
    noAlcanza: [
      'Un sorteo interno entre empleados sin venta de boletos ni apuesta: no hay operación con un cliente.',
      'Una dinámica en redes sociales que regala un producto de bajo valor sin costo de participación: no hay adquisición de boleto ni apuesta.',
      'El proveedor de software del casino: presta un servicio tecnológico, no vende participación ni paga premios.',
    ],
    puntosClave: [
      'El umbral se mira dos veces: al vender la participación y al entregar o pagar el premio. Son dos momentos distintos de la misma actividad.',
      'La ley habla de "serie de transacciones vinculadas entre sí en apariencia": cuatro cambios de fichas del mismo jugador en la misma noche no son cuatro operaciones independientes.',
      'El premio en especie se valúa para efectos del umbral. Un automóvil entregado como premio no queda fuera por no ser dinero.',
      'El pago de premios en efectivo tiene, además, un límite propio en el art. 32 que es independiente del umbral de aviso.',
      'Identificar en el piso de juego sin frenar la operación exige un procedimiento previo, no improvisación en caja.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'avisos', 'mecanismos-automatizados'],
    ejemplo: {
      titulo: 'Premio pagado a un ganador',
      contexto:
        'Una sala de sorteos paga un premio en efectivo a un ganador en septiembre de 2026. El área de caja quiere saber si basta con identificarlo o si además hay que presentar aviso.',
      montoPesos: '80000',
      fechaOperacion: '2026-09-15',
      efectivoPesos: '80000',
      notas: [
        'El mismo acto se mide contra dos reglas distintas: el umbral de aviso del art. 17 y el límite de efectivo del art. 32, que no son la misma cifra ni tienen la misma consecuencia.',
        'Si este ganador cobró otros premios en los seis meses anteriores, la suma puede disparar el aviso aunque un premio aislado no llegue.',
      ],
    },
    faq: [
      {
        pregunta: '¿Un sorteo promocional de mi marca me convierte en sujeto obligado?',
        respuesta:
          'Depende de si hay apuesta o adquisición de participación. La fracción I alcanza los juegos con apuesta, concursos y sorteos en los términos de la Ley Federal de Juegos y Sorteos, que es la que exige el permiso. Si tu dinámica requiere permiso de la Secretaría de Gobernación, revisa esta fracción con un especialista antes de lanzarla.',
      },
      {
        pregunta: '¿El premio en especie cuenta para el umbral y con qué valor?',
        respuesta:
          'Sí cuenta. La obligación se mide sobre el valor del premio, no sobre su forma. Documenta el criterio de valuación —factura, avalúo o precio de lista— y consérvalo en el expediente: es lo primero que pide un verificador cuando el premio no fue en dinero.',
      },
      {
        pregunta: '¿Tengo que identificar a todos los apostadores?',
        respuesta:
          'No a todos: la identificación nace al alcanzar el umbral de identificación de la fracción, que es más bajo que el de aviso. Lo que sí conviene es tener el procedimiento listo, porque el jugador que lo alcanza suele hacerlo en el momento menos oportuno.',
      },
      {
        pregunta: '¿Cómo cuento las operaciones de un jugador frecuente?',
        respuesta:
          'Por dos vías que se suman. La propia fracción I habla de series de transacciones vinculadas en apariencia, y además aplica la regla general de acumulación de seis meses del último párrafo del art. 17. Ambas requieren una base consolidada por cliente, no una revisión manual de tickets.',
      },
      {
        pregunta: '¿Puedo pagar un premio grande en efectivo?',
        respuesta:
          'No por encima del límite de la fracción IV del art. 32, que aplica tanto a la compra de boletos como a la entrega o pago de premios. Rebasarlo es infracción por sí sola, aunque hayas presentado el aviso correctamente y en tiempo.',
      },
    ],
  },

  /* ── II a). Tarjetas de crédito y de servicios ───────────────────────────── */
  {
    slug: 'tarjetas-credito-servicios',
    tituloSEO: 'Tarjetas de crédito y de servicios no bancarias: umbral mensual (art. 17-II a)',
    descripcionSEO:
      'Quién emite tarjetas de crédito o de servicios sin ser entidad financiera, por qué el umbral se mide sobre el gasto mensual acumulado y no por compra, y qué obligaciones genera.',
    respuestaDirecta:
      'Emitir o comercializar tarjetas de crédito o de servicios de forma habitual o profesional, sin ser entidad financiera, es actividad vulnerable. El dato que cambia todo en esta fracción es que el umbral no se mide por compra: se mide sobre el gasto mensual acumulado en la cuenta de la tarjeta.',
    alcanza: [
      'Tiendas departamentales con tarjeta propia de crédito al consumo',
      'Cadenas de autoservicio que emiten su propia tarjeta de servicios',
      'Empresas que emiten tarjetas de servicio para flotillas o consumo corporativo',
      'Emisores no bancarios de tarjetas de crédito en esquemas de marca compartida',
    ],
    noAlcanza: [
      'Bancos y otras entidades financieras reguladas: reportan por su propio régimen, no por esta fracción.',
      'Quien únicamente acepta tarjetas como medio de pago en su comercio: no emite ni comercializa el instrumento.',
      'El procesador de pagos que sólo enruta transacciones sin emitir la tarjeta ni administrar la cuenta.',
    ],
    puntosClave: [
      'El umbral es mensual y acumulado por cuenta: se suma todo el consumo del mes, no se mira compra por compra.',
      'Las reglas fijan que, para esta modalidad, la fecha del acto u operación es el último día del mes del consumo.',
      'Los umbrales de identificación y de aviso son distintos entre sí, y ambos se miden sobre el mismo gasto mensual.',
      'El titular de la tarjeta no siempre es quien realmente la usa: hay que preguntar por el beneficiario controlador cuando el titular es persona moral.',
      'Las tarjetas prepagadas y los monederos electrónicos tienen su propio inciso y su propio umbral: no se mezclan con este.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'avisos', 'mecanismos-automatizados'],
    ejemplo: {
      titulo: 'Tarjeta de servicios corporativa con consumo alto',
      contexto:
        'Una cadena emite una tarjeta de servicios a una empresa cliente. En el mes de octubre de 2026 el consumo acumulado en esa cuenta llega a la cifra siguiente.',
      montoPesos: '160000',
      fechaOperacion: '2026-10-31',
      notas: [
        'El monto capturado es el consumo del mes completo, no una compra: esta fracción se mide así por disposición expresa.',
        'La fecha de la operación es el último día del mes del consumo, lo que determina desde cuándo corre el plazo para presentar el aviso.',
      ],
    },
    faq: [
      {
        pregunta: '¿El umbral es por tarjeta o por cliente?',
        respuesta:
          'Se mide sobre el gasto mensual acumulado en la cuenta de la tarjeta. Si un mismo cliente tiene varias cuentas, además opera la regla de acumulación de seis meses del art. 17, que suma por cliente y tipo de acto.',
      },
      {
        pregunta: '¿Cuenta el saldo o el monto gastado?',
        respuesta:
          'El consumo mensual acumulado en la cuenta. El saldo insoluto de un crédito no es la base de medición de esta fracción.',
      },
      {
        pregunta: '¿Una fintech que emite tarjetas debe registrarse en el SPPLD?',
        respuesta:
          'Si emite o comercializa el instrumento de forma habitual o profesional y no es una entidad financiera regulada con su propio régimen PLD, sí. La clave está en cómo esté constituida y autorizada, no en cómo se describa comercialmente.',
      },
      {
        pregunta: '¿Qué hago si el pago de la tarjeta se hizo en efectivo?',
        respuesta:
          'La forma de pago no cambia el umbral de aviso de esta fracción, pero sí es un factor de riesgo que debe pesar en la clasificación del cliente y en el monitoreo del perfil transaccional.',
      },
      {
        pregunta: '¿Presento un aviso por cada compra del mes?',
        respuesta:
          'No. En esta modalidad el acto u operación es el consumo mensual acumulado, de modo que corresponde un aviso por el periodo, no uno por transacción.',
      },
    ],
  },

  /* ── II b). Tarjetas prepagadas ──────────────────────────────────────────── */
  {
    slug: 'tarjetas-prepagadas',
    tituloSEO: 'Tarjetas prepagadas: identificación y aviso con el mismo umbral (art. 17-II b)',
    descripcionSEO:
      'Emisión, comercialización y abono de recursos en tarjetas prepagadas fuera del sistema financiero. Por qué aquí identificar y avisar se disparan con la misma cifra.',
    respuestaDirecta:
      'La emisión, comercialización o abono de recursos en tarjetas prepagadas por quien no es entidad financiera es actividad vulnerable, y se mide por operación. Su particularidad es que el umbral de identificación y el de aviso coinciden: en esta fracción, toda operación que te obliga a identificar te obliga también a reportar.',
    alcanza: [
      'Comercializadores de tarjetas de regalo con valor monetario almacenado',
      'Emisores no bancarios de tarjetas prepagadas de uso general',
      'Cadenas que venden y recargan tarjetas de saldo abierto',
      'Distribuidores que abonan recursos a tarjetas prepagadas de terceros',
    ],
    noAlcanza: [
      'Una tarjeta que sólo sirve para canjear un producto específico del propio emisor y no admite recargas ni conversión a dinero: no funciona como instrumento de valor monetario.',
      'Instituciones de fondos de pago electrónico reguladas, que cumplen bajo su propio régimen.',
      'El comercio que acepta la tarjeta como pago sin participar en su emisión, venta o recarga.',
    ],
    puntosClave: [
      'Identificación y aviso comparten umbral: no existe la franja intermedia de "identifico pero no aviso" que sí hay en otras fracciones.',
      'La medición es por operación de comercialización o abono, no por saldo acumulado.',
      'La recarga en efectivo es el punto de mayor riesgo del sector y debe estar contemplada en el manual.',
      'La acumulación de seis meses aplica: varias recargas menores del mismo cliente pueden disparar el aviso.',
      'Los vales, cupones y monederos electrónicos van en el inciso siguiente, aunque en la práctica se vendan en el mismo mostrador.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'avisos', 'clasificacion-clientes'],
    ejemplo: {
      titulo: 'Recarga de una tarjeta prepagada',
      contexto:
        'Un cliente recarga una tarjeta prepagada de uso general en una sola operación, en marzo de 2026.',
      montoPesos: '80000',
      fechaOperacion: '2026-03-10',
      notas: [
        'Como identificación y aviso comparten umbral, alcanzar uno significa alcanzar el otro: no hay margen para "sólo identificar".',
        'Si el mismo cliente recargó cantidades menores en los meses previos, hay que revisar la ventana de seis meses antes de concluir.',
      ],
    },
    faq: [
      {
        pregunta: '¿Por qué identificar y avisar tienen el mismo umbral aquí?',
        respuesta:
          'Porque así lo fija el art. 17 para este inciso. Es una decisión del legislador que refleja el riesgo del instrumento: una prepagada con saldo alto es dinero portátil y anónimo si nadie identifica a quien la carga.',
      },
      {
        pregunta: '¿Una tarjeta de regalo de mi tienda entra aquí?',
        respuesta:
          'Si almacena valor monetario, puede recargarse o se usa como medio de pago general, se comporta como instrumento de valor almacenado y hay que analizarla bajo esta fracción o la del inciso c). Si sólo canjea un producto concreto y no admite recarga, el análisis cambia.',
      },
      {
        pregunta: '¿Cuenta el saldo de la tarjeta o el monto de la recarga?',
        respuesta:
          'La operación: la comercialización o el abono de recursos. El saldo acumulado no es la base de medición, aunque sí es información útil para el perfil transaccional del cliente.',
      },
      {
        pregunta: '¿Y si el cliente recarga en varias exhibiciones?',
        respuesta:
          'Aplica la regla de acumulación de seis meses del último párrafo del art. 17. Partir la recarga no evita la obligación; sí la retrasa hasta la operación con la que se alcanza el umbral, y ahí es cuando debe presentarse el aviso.',
      },
      {
        pregunta: '¿Debo identificar aunque la recarga sea con transferencia?',
        respuesta:
          'Sí. El medio de pago no modifica el umbral de identificación ni el de aviso de esta fracción; sólo cambia el análisis de riesgo y, en su caso, la aplicación del art. 32 cuando hay efectivo de por medio.',
      },
    ],
  },

  /* ── II c). Vales, cupones y monederos ───────────────────────────────────── */
  {
    slug: 'vales-cupones-monederos',
    tituloSEO: 'Vales, cupones y monederos electrónicos: cuándo generan aviso (art. 17-II c)',
    descripcionSEO:
      'Los instrumentos de almacenamiento de valor monetario distintos de las tarjetas —vales de despensa, cupones y monederos electrónicos— también son actividad vulnerable. Qué se mide y con qué umbral.',
    respuestaDirecta:
      'Emitir, comercializar o abonar recursos en vales, cupones, monederos electrónicos o certificados —lo que la ley llama instrumentos de almacenamiento de valor monetario— es actividad vulnerable, se mide por operación y comparte umbral entre identificación y aviso.',
    alcanza: [
      'Emisores de monederos electrónicos de despensa',
      'Empresas de vales de gasolina, restaurante o servicios',
      'Comercializadores de certificados con valor monetario',
      'Plataformas que venden cupones canjeables por saldo',
    ],
    noAlcanza: [
      'Un cupón de descuento que sólo reduce el precio y no almacena valor canjeable por dinero o por bienes indeterminados.',
      'Los puntos de un programa de lealtad que no son transferibles ni convertibles a efectivo.',
      'El patrón que compra vales para su plantilla: es cliente del emisor, no emisor él mismo.',
    ],
    puntosClave: [
      'Esta modalidad se pierde de vista con frecuencia porque el instrumento no se llama "tarjeta", pero la ley la nombra expresamente.',
      'La medición es por operación de emisión, comercialización o abono.',
      'Los umbrales de identificación y aviso coinciden, igual que en las prepagadas.',
      'Cuando el cliente es una empresa, hay que identificar también a su beneficiario controlador.',
      'El volumen del sector hace que la acumulación por cliente sea el control crítico: sin base consolidada es imposible cumplir.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'beneficiario-controlador', 'avisos', 'mecanismos-automatizados'],
    ejemplo: {
      titulo: 'Venta de monederos electrónicos a una empresa',
      contexto:
        'Una emisora vende monederos electrónicos de despensa a una empresa cliente en una sola operación, en junio de 2026.',
      montoPesos: '120000',
      fechaOperacion: '2026-06-05',
      notas: [
        'El cliente es la persona moral que compra los monederos, no cada empleado que los recibe.',
        'Al ser el cliente una persona moral, el expediente debe incluir la identificación de su beneficiario controlador.',
      ],
    },
    faq: [
      {
        pregunta: '¿Los vales de despensa son instrumento de valor monetario?',
        respuesta:
          'Si almacenan valor y se canjean por bienes o servicios ante terceros, encajan en la descripción del inciso c). El nombre comercial del producto no decide: decide su función económica.',
      },
      {
        pregunta: '¿Quién es mi cliente, la empresa o el empleado?',
        respuesta:
          'La empresa que contrata y paga la emisión. El empleado que usa el monedero es usuario final del instrumento, pero el acto u operación que mides es la venta a la persona moral.',
      },
      {
        pregunta: '¿Un cupón de descuento genera obligaciones?',
        respuesta:
          'No por sí solo, si únicamente rebaja el precio de una compra concreta y no almacena valor canjeable. La línea está en si el instrumento funciona como dinero acotado o como una simple promoción.',
      },
      {
        pregunta: '¿Se acumulan las compras del mismo cliente empresarial?',
        respuesta:
          'Sí, con la ventana de seis meses del art. 17. En un cliente corporativo recurrente lo normal es que la suma cruce el umbral aunque cada pedido mensual quede por debajo.',
      },
      {
        pregunta: '¿Presento informe en ceros si un mes no vendí nada?',
        respuesta:
          'Sí, mientras estés dado de alta en el padrón por esta actividad. La ausencia de operaciones no suspende la obligación de informar; sólo la baja del padrón lo hace.',
      },
    ],
  },

  /* ── III. Cheques de viajero ─────────────────────────────────────────────── */
  {
    slug: 'cheques-viajero',
    tituloSEO: 'Cheques de viajero: identificación desde el primer peso (art. 17-III)',
    descripcionSEO:
      'Emisión y comercialización de cheques de viajero fuera del sistema financiero. Por qué la identificación no tiene umbral y qué conviene revisar en casas de cambio y agencias de viajes.',
    respuestaDirecta:
      'Emitir o comercializar cheques de viajero de forma habitual o profesional, sin ser entidad financiera, es actividad vulnerable. Aquí la identificación no tiene umbral: se identifica a quien los adquiere sin importar el monto, y el aviso nace sólo cuando la operación alcanza la cifra de la fracción.',
    alcanza: [
      'Casas de cambio no financieras que comercializan cheques de viajero',
      'Agencias de viajes que emiten o venden cheques de viajero a sus clientes',
      'Operadores turísticos que ofrecen el instrumento como servicio complementario',
    ],
    noAlcanza: [
      'Instituciones de crédito y otras entidades financieras, que cumplen bajo su propio régimen.',
      'El comercio que acepta un cheque de viajero como pago: no lo emite ni lo comercializa.',
      'Quien compra cheques de viajero para su propio viaje: es cliente, no sujeto obligado.',
    ],
    puntosClave: [
      'La identificación es siempre: no existe un monto por debajo del cual puedas prescindir del expediente.',
      'El aviso sí tiene umbral y se mide por operación de emisión o comercialización.',
      'Es una fracción de volumen bajo pero de obligación viva: quien está dado de alta debe presentar informe en ceros los meses sin operación.',
      'La conservación de la información corre por diez años desde la operación, igual que en el resto de las actividades.',
      'La acumulación de seis meses aplica y suele ser el único camino al aviso en un sector de tickets pequeños.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'informes-en-ceros', 'conservacion-diez-anios'],
    ejemplo: {
      titulo: 'Venta de cheques de viajero en una sola operación',
      contexto:
        'Una casa de cambio vende cheques de viajero a un cliente en agosto de 2026 por el importe siguiente.',
      montoPesos: '80000',
      fechaOperacion: '2026-08-20',
      notas: [
        'Aunque el monto no llegara al umbral de aviso, el expediente de identificación sería obligatorio de todas formas: en esta fracción identificar no depende del monto.',
        'Si el cliente compró cheques en operaciones previas dentro de la ventana de seis meses, revisa la acumulación antes de concluir.',
      ],
    },
    faq: [
      {
        pregunta: '¿Siguen existiendo los cheques de viajero en México?',
        respuesta:
          'Su uso cayó mucho frente a las tarjetas y los pagos digitales, pero la fracción sigue vigente. Mientras la actividad se realice de forma habitual o profesional, las obligaciones se aplican con independencia del volumen del mercado.',
      },
      {
        pregunta: '¿Por qué identifico desde el primer peso?',
        respuesta:
          'Porque el art. 17 no fija umbral de identificación para esta fracción. La ley trata el instrumento como equivalente cercano al efectivo, y por eso exige conocer a quien lo adquiere en todos los casos.',
      },
      {
        pregunta: '¿Una agencia de viajes es sujeto obligado por esto?',
        respuesta:
          'Lo es si emite o comercializa cheques de viajero de forma habitual o profesional. Vender paquetes turísticos no la convierte en sujeto obligado por esta fracción; comercializar el instrumento, sí.',
      },
      {
        pregunta: '¿Aplica a cheques emitidos en el extranjero?',
        respuesta:
          'Lo que se analiza es tu actividad en México: si tú los comercializas aquí de forma habitual, la obligación es tuya con independencia de quién los haya emitido. Documenta el origen del instrumento en el expediente.',
      },
      {
        pregunta: '¿Debo presentar informe en ceros si este mes no vendí ninguno?',
        respuesta:
          'Sí, mientras sigas dado de alta por esta actividad. Si dejaste de realizarla, tramita la baja del padrón: hasta que la presentes, la obligación de informar continúa.',
      },
    ],
  },

  /* ── IV. Préstamos y créditos ────────────────────────────────────────────── */
  {
    slug: 'prestamos-creditos',
    tituloSEO: 'Préstamos y créditos sin ser entidad financiera: umbrales y obligaciones (art. 17-IV)',
    descripcionSEO:
      'Prestamistas privados, casas de empeño, factoraje y crédito entre empresas. Qué significa "habitual o profesional", desde cuándo hay que identificar y cuándo nace el aviso.',
    respuestaDirecta:
      'Ofrecer de forma habitual o profesional operaciones de mutuo, garantía, préstamo o crédito, con o sin garantía, sin ser entidad financiera, es actividad vulnerable. La identificación procede siempre, sin umbral, y el aviso nace cuando la operación alcanza la cifra de la fracción.',
    alcanza: [
      'Casas de empeño',
      'Prestamistas y financieras no reguladas por la CNBV',
      'Empresas de factoraje y descuento de facturas fuera del sistema financiero',
      'Sociedades que otorgan crédito de forma habitual a terceros como parte de su operación',
      'Plataformas de préstamos entre particulares que actúan como acreditantes',
    ],
    noAlcanza: [
      'Un préstamo aislado a un familiar o a un socio: falta el carácter habitual o profesional que la ley exige.',
      'Bancos, sofipos y otras entidades financieras reguladas, que reportan bajo su propio régimen.',
      'El deudor que recibe el crédito: la obligación es de quien lo otorga.',
    ],
    puntosClave: [
      '"Habitual o profesional" es el filtro de entrada: repetición, oferta al público y ánimo de lucro pesan más que la forma jurídica del contrato.',
      'La identificación no espera al umbral: procede en toda operación de crédito.',
      'La garantía inmobiliaria cruza con la fracción V y, si el contrato se otorga ante notario, también con la fracción XII.',
      'El origen de los recursos del prestamista importa tanto como el destino: es el sector donde la autoridad más pregunta por ello.',
      'La acumulación de seis meses aplica por cliente: tres créditos medianos al mismo deudor pueden disparar el aviso.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'avisos', 'perfil-transaccional'],
    ejemplo: {
      titulo: 'Crédito simple otorgado por una financiera no regulada',
      contexto:
        'Una empresa que otorga crédito de forma habitual formaliza un préstamo con un cliente en abril de 2026.',
      montoPesos: '200000',
      fechaOperacion: '2026-04-08',
      notas: [
        'El acto u operación es el otorgamiento del crédito, no cada pago que el deudor haga después.',
        'Si el mismo cliente recibió otros créditos en la ventana de seis meses, la suma se mide contra el umbral de aviso.',
      ],
    },
    faq: [
      {
        pregunta: '¿Prestarle dinero a un amigo me hace sujeto obligado?',
        respuesta:
          'No, si el préstamo es aislado y no ofreces crédito al público. La fracción exige que el ofrecimiento sea habitual o profesional. Ahora bien, si prestas de forma recurrente y con ánimo de lucro, la respuesta cambia aunque no tengas una empresa formal.',
      },
      {
        pregunta: '¿Qué significa exactamente "habitual o profesional"?',
        respuesta:
          'La ley no lo define con un número de operaciones. Se valora en conjunto: repetición, oferta al público, cobro de intereses, estructura para operar y si la actividad forma parte de tu giro. Documenta tu propio análisis: es lo que te pedirán explicar.',
      },
      {
        pregunta: '¿Una SOFOM regulada presenta avisos en el SPPLD?',
        respuesta:
          'Las entidades financieras cumplen bajo su régimen sectorial, no por esta fracción. La duda práctica aparece con las sofomes no reguladas: revisa tu figura y tu autorización antes de decidir, porque el régimen aplicable depende de eso.',
      },
      {
        pregunta: '¿El factoraje entra en esta fracción?',
        respuesta:
          'El factoraje y el descuento de documentos se analizan aquí cuando quien los realiza no es entidad financiera y la operación equivale a un financiamiento habitual o profesional. La denominación del contrato no exime del análisis.',
      },
      {
        pregunta: '¿Aviso por el crédito o por cada pago recibido?',
        respuesta:
          'Por el otorgamiento del crédito, que es el acto u operación. Los pagos posteriores no son operaciones nuevas para efectos del aviso, aunque sí alimentan el perfil transaccional del cliente.',
      },
    ],
  },

  /* ── V. Inmobiliaria ─────────────────────────────────────────────────────── */
  {
    slug: 'inmuebles-construccion-intermediacion',
    tituloSEO: 'Inmobiliarias y desarrollo de inmuebles: identificación siempre (art. 17-V)',
    descripcionSEO:
      'Constructoras, inmobiliarias y brókers: por qué hay que identificar desde el primer peso, cuándo nace el aviso, quién reporta frente al notario y cuánto efectivo puede recibirse.',
    respuestaDirecta:
      'Prestar de forma habitual o profesional servicios de construcción o desarrollo de inmuebles, o intermediar en la transmisión de propiedad o en la constitución de derechos sobre ellos, es actividad vulnerable. La identificación procede siempre, sin umbral, y el aviso nace en la cifra más alta de toda la ley junto con el desarrollo inmobiliario.',
    alcanza: [
      'Inmobiliarias y brókers de bienes raíces que intermedian compraventas',
      'Constructoras que venden directamente al público las unidades que edifican',
      'Comercializadoras de vivienda y de producto industrial o comercial',
      'Plataformas digitales que intermedian operaciones de compraventa, no sólo publicidad',
      'Asesores que participan en el cierre de la operación a favor de un cliente',
    ],
    noAlcanza: [
      'El portal que sólo publica anuncios y cobra por publicidad, sin participar en la operación ni cobrar comisión por el cierre.',
      'Quien vende su propia casa una vez: no hay habitualidad ni profesionalidad.',
      'El arrendamiento de inmuebles, que es otra fracción distinta con umbrales propios.',
      'La constructora que sólo ejecuta obra por contrato para un tercero sin participar en la venta, cuyo análisis debe hacerse caso por caso.',
    ],
    puntosClave: [
      'Identificar desde el primer peso es la obligación que más se incumple en el sector: muchas inmobiliarias sólo miran el umbral de aviso.',
      'Que el notario presente su aviso no libera a la inmobiliaria: son dos sujetos obligados distintos con dos obligaciones distintas sobre el mismo inmueble.',
      'El límite de efectivo para inmuebles es el más alto del art. 32 y se mide con IVA incluido, a diferencia del umbral de aviso.',
      'La cesión de derechos de preventa y la permuta requieren definir con qué valor se miden: documenta el criterio.',
      'La acumulación de seis meses puede disparar el aviso cuando un mismo cliente compra dos unidades por separado.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'beneficiario-controlador', 'avisos'],
    ejemplo: {
      titulo: 'Venta de una casa con parte del precio en efectivo',
      contexto:
        'Una inmobiliaria intermedia la venta de una casa en mayo de 2026. El comprador propone liquidar una parte en efectivo.',
      montoPesos: '2400000',
      fechaOperacion: '2026-05-12',
      efectivoPesos: '1000000',
      notas: [
        'Son dos reglas independientes: el umbral de aviso del art. 17 y la prohibición del art. 32. Presentar el aviso no vuelve lícito el pago en efectivo por encima del límite.',
        'El aviso de la inmobiliaria no sustituye al del notario, y el del notario no sustituye al de la inmobiliaria.',
      ],
    },
    faq: [
      {
        pregunta: '¿Quién presenta el aviso, la inmobiliaria o el notario?',
        respuesta:
          'Los dos, cada uno por su propia fracción y con sus propios umbrales. La inmobiliaria reporta por la fracción V si alcanza su umbral; el notario reporta por la fracción XII conforme a las reglas de su apartado. Son obligaciones autónomas.',
      },
      {
        pregunta: '¿Cuánto efectivo puedo recibir por una casa?',
        respuesta:
          'Hasta el límite de la fracción I del art. 32, medido con IVA incluido. Es una prohibición, no un umbral de reporte: aceptar el pago por encima de ese límite es infracción por sí sola.',
      },
      {
        pregunta: '¿Se reporta una cesión de derechos de preventa?',
        respuesta:
          'La fracción alcanza la intermediación en la transmisión de propiedad y en la constitución de derechos sobre inmuebles, de modo que la cesión de derechos entra en el análisis. Define y documenta sobre qué valor la mides.',
      },
      {
        pregunta: '¿Aplica si sólo intermedio y no soy el dueño?',
        respuesta:
          'Sí. La intermediación habitual o profesional es justamente el supuesto central de esta fracción. No ser propietario del inmueble no te saca del catálogo.',
      },
      {
        pregunta: '¿Y si el comprador paga con crédito hipotecario?',
        respuesta:
          'El umbral se mide sobre el valor de la operación, no sobre el enganche ni sobre la parte financiada. Que el banco aporte los recursos no reduce el monto del acto que estás intermediando.',
      },
    ],
  },

  /* ── V Bis. Desarrollo inmobiliario ──────────────────────────────────────── */
  {
    slug: 'desarrollo-inmobiliario',
    tituloSEO: 'Desarrollo inmobiliario: la fracción V Bis adicionada en 2025',
    descripcionSEO:
      'Qué es la recepción de recursos destinados a un desarrollo inmobiliario, en qué se distingue de la fracción V, a quién alcanza y qué obligaciones trae desde el 17 de julio de 2025.',
    respuestaDirecta:
      'La fracción V Bis es la más nueva del catálogo: se adicionó por la reforma publicada el 16 de julio de 2025 y alcanza la recepción de recursos destinados a un desarrollo inmobiliario cuya finalidad sea su venta o renta. Lo que se mide no es la venta de una unidad, sino la captación de recursos para el proyecto.',
    alcanza: [
      'Desarrolladoras que reciben aportaciones de compradores en preventa',
      'Vehículos de coinversión inmobiliaria que captan recursos de inversionistas',
      'Promotores que reúnen capital para ejecutar obra destinada a venta o renta',
      'Fideicomisos de desarrollo que reciben aportaciones para el proyecto',
    ],
    noAlcanza: [
      'La venta ya escriturada de una unidad terminada, que se analiza por la fracción V y, en su caso, por la XII.',
      'Un crédito bancario para la obra: los recursos vienen de una entidad financiera con su propio régimen, aunque el análisis del acreditado sigue siendo suyo.',
      'La autoconstrucción de una vivienda propia sin destino de venta ni renta.',
    ],
    puntosClave: [
      'La diferencia con la fracción V está en el momento: V mira la comercialización del inmueble; V Bis mira la entrada de recursos al desarrollo.',
      'Un mismo proyecto puede activar ambas fracciones en etapas distintas, con dos altas de actividad y dos flujos de aviso.',
      'Las reglas fijan que la fecha del acto u operación es aquella en que se recibió y destinó la última aportación del mes calendario.',
      'Cuando los recursos se aplican al mismo desarrollo, las reglas admiten un aviso mensual en lugar de uno por aportación.',
      'Si el vehículo es un fideicomiso, hay que subir por la cadena de control hasta la persona física que califica como beneficiario controlador.',
    ],
    obligacionesDestacadas: ['alta-sppld', 'identificacion-cliente', 'beneficiario-controlador', 'avisos'],
    ejemplo: {
      titulo: 'Aportación de un inversionista al proyecto',
      contexto:
        'Una desarrolladora recibe la aportación de un inversionista destinada al desarrollo de un conjunto habitacional, en julio de 2026.',
      montoPesos: '3000000',
      fechaOperacion: '2026-07-31',
      notas: [
        'La fecha usada es la del cierre del mes calendario, conforme a la regla de determinación del acto u operación para esta fracción.',
        'Al ser el aportante una persona moral o un vehículo de inversión, el expediente exige identificar a su beneficiario controlador.',
      ],
    },
    faq: [
      {
        pregunta: '¿En qué se diferencia de la fracción V?',
        respuesta:
          'La fracción V mira la construcción, el desarrollo y la intermediación en la transmisión de propiedad. La V Bis mira específicamente la recepción de recursos destinados al desarrollo. Un mismo proyecto puede caer en las dos, en momentos distintos del ciclo.',
      },
      {
        pregunta: '¿Desde cuándo estoy obligado por esta fracción?',
        respuesta:
          'Desde el 17 de julio de 2025, fecha de entrada en vigor de la reforma que la adicionó. Las obligaciones desarrolladas por las reglas de 2026 —metodología de riesgos, manual, clasificación de clientes— tienen su propio calendario escalonado.',
      },
      {
        pregunta: '¿Los inversionistas del proyecto son mis clientes para el aviso?',
        respuesta:
          'Son las personas de quienes recibes los recursos, y por lo tanto de quienes integras expediente. Si aportan a través de una sociedad o un fideicomiso, la identificación no termina ahí: hay que llegar a la persona física que controla.',
      },
      {
        pregunta: '¿El fideicomiso de desarrollo se registra por separado?',
        respuesta:
          'Quien actúa por medio de fideicomisos u otras figuras jurídicas también realiza actividades vulnerables, y las reglas de 2026 crearon un régimen específico de alta y registro para ellos. Revisa la estructura antes de asumir que basta con el alta de la desarrolladora.',
      },
      {
        pregunta: '¿La preventa sobre planos genera aviso antes de escriturar?',
        respuesta:
          'La recepción de recursos es el acto relevante en esta fracción, de modo que la obligación puede nacer mucho antes de la escritura. Es el cambio de mentalidad más grande que trajo la V Bis para el sector.',
      },
    ],
  },

  /* ── VI. Metales y joyería ───────────────────────────────────────────────── */
  {
    slug: 'metales-joyeria',
    tituloSEO: 'Joyerías, relojerías y compraventa de oro: umbrales (art. 17-VI)',
    descripcionSEO:
      'Metales preciosos, piedras preciosas, joyas y relojes. Umbral de identificación y de aviso, por qué el aviso procede con cualquier forma de pago y cuánto efectivo puede recibirse.',
    respuestaDirecta:
      'Comercializar o intermediar de forma habitual o profesional metales preciosos, piedras preciosas, joyas o relojes es actividad vulnerable. Su rasgo distintivo: la operación es objeto de aviso con independencia de la forma de pago, de modo que cobrar con transferencia o tarjeta no elimina la obligación.',
    alcanza: [
      'Joyerías y relojerías de alta gama',
      'Negocios de compraventa de oro y plata al público',
      'Casas de subasta que rematan joyas y relojes',
      'Vendedores habituales por redes sociales o comercio electrónico',
      'Intermediarios que colocan piezas de terceros a cambio de comisión',
    ],
    noAlcanza: [
      'La venta ocasional de una joya personal: falta el carácter habitual o profesional.',
      'La bisutería y las piezas sin metal ni piedra preciosa, que no encajan en la descripción legal.',
      'Las operaciones en que interviene el Banco de México, expresamente exceptuadas.',
    ],
    puntosClave: [
      'El aviso procede con independencia de la forma de pago: es la fracción donde más se cree, erróneamente, que pagar con tarjeta exime.',
      'La compra de oro al público —el flujo inverso— también es comercialización y está dentro.',
      'El límite de efectivo del art. 32 aplica por pieza o por lote, lo que impide partir una venta en piezas para quedar debajo.',
      'El cliente recurrente de tickets medianos es el caso típico de acumulación de seis meses.',
      'Identificar en mostrador sin arruinar la venta exige un procedimiento breve y ensayado, no improvisar frente al cliente.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'avisos', 'clasificacion-clientes'],
    ejemplo: {
      titulo: 'Venta de un reloj de alta gama',
      contexto:
        'Una relojería vende una pieza en febrero de 2026 y el cliente paga la mitad en efectivo.',
      montoPesos: '200000',
      fechaOperacion: '2026-02-18',
      efectivoPesos: '100000',
      notas: [
        'La forma de pago no modifica el umbral de aviso de esta fracción, pero sí activa el análisis del art. 32 sobre la parte liquidada en efectivo.',
        'El límite de efectivo se mide por pieza o por lote: dividir la venta en dos tickets no cambia el resultado.',
      ],
    },
    faq: [
      {
        pregunta: '¿Comprar oro al público también se reporta?',
        respuesta:
          'Sí. La fracción habla de comercialización e intermediación, y comprar para revender es comercializar. El expediente se integra respecto de quien te vende el metal, que es tu cliente en esa operación.',
      },
      {
        pregunta: '¿Los relojes de lujo cuentan como joyería?',
        respuesta:
          'La fracción menciona expresamente los relojes, además de las joyas, los metales y las piedras preciosas. No hace falta que la pieza lleve metal precioso para quedar dentro de la mención de relojes.',
      },
      {
        pregunta: '¿Cuánto efectivo puedo recibir por una joya?',
        respuesta:
          'Hasta el límite de la fracción III del art. 32, que se mide por pieza o por lote y con IVA incluido. Por encima de esa cifra, aceptar el pago en efectivo o en metales es infracción con independencia del aviso.',
      },
      {
        pregunta: '¿Vender por Instagram cambia algo?',
        respuesta:
          'No cambia las obligaciones, cambia la dificultad de cumplirlas. El canal digital no crea una excepción, y sí complica la identificación: necesitas un procedimiento remoto documentado para integrar el expediente.',
      },
      {
        pregunta: '¿Debo identificar si el cliente paga con tarjeta?',
        respuesta:
          'Sí. En esta fracción el aviso procede con independencia de la forma de pago, y la identificación depende del monto de la operación, no del medio con que se liquide.',
      },
    ],
  },

  /* ── VII. Obras de arte ──────────────────────────────────────────────────── */
  {
    slug: 'obras-arte',
    tituloSEO: 'Galerías, subastas y comercialización de obras de arte (art. 17-VII)',
    descripcionSEO:
      'Cuándo una galería, una casa de subasta o un marchante queda dentro de la Ley Antilavado, cómo se valúa la obra, quién es el cliente en una consignación y qué pasa con el arte digital.',
    respuestaDirecta:
      'Subastar o comercializar obras de arte de forma habitual o profesional es actividad vulnerable cuando la operación alcanza los montos de la fracción. Es un sector con precios poco estandarizados, y por eso el criterio de valuación que uses debe quedar documentado en el expediente.',
    alcanza: [
      'Galerías de arte que venden por cuenta propia o de terceros',
      'Casas de subasta',
      'Marchantes y agentes que colocan obra de artistas',
      'Ferias y plataformas que cierran ventas, no sólo exhiben',
    ],
    noAlcanza: [
      'El artista que vende su propia obra de manera ocasional y sin estructura comercial.',
      'El museo que exhibe sin comercializar.',
      'El servicio de embalaje, transporte o restauración, que no es comercialización de la obra.',
    ],
    puntosClave: [
      'En una consignación conviven dos personas: quien entrega la obra y quien la compra. Define desde el manual a quién identificas y por qué.',
      'La valuación es el punto débil del sector: sin criterio documentado, el umbral se vuelve discutible frente a la autoridad.',
      'La puja anónima no exime de identificar al adjudicatario cuando la operación alcanza el umbral.',
      'El arte digital tokenizado puede caer en la fracción de activos virtuales en lugar de esta: analiza la operación, no la etiqueta del producto.',
      'El traslado internacional de obra cruza con la fracción de comercio exterior, que tiene su propio umbral por valor individual.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'avisos', 'beneficiario-controlador'],
    ejemplo: {
      titulo: 'Venta de una pieza en galería',
      contexto:
        'Una galería vende una escultura a un coleccionista en noviembre de 2026.',
      montoPesos: '600000',
      fechaOperacion: '2026-11-04',
      notas: [
        'El cliente para efectos del aviso es el comprador de la obra; la relación con el consignante se documenta por separado.',
        'Si la obra sale del país, revisa además la fracción de comercio exterior, que mide por valor individual del bien.',
      ],
    },
    faq: [
      {
        pregunta: '¿Un NFT es obra de arte o activo virtual?',
        respuesta:
          'Depende de qué estés operando. Si intercambias el token en una plataforma que administras, el análisis va por la fracción de activos virtuales, cuyos umbrales son mucho más bajos. Si vendes una pieza física y el token sólo la acredita, el análisis va por esta fracción.',
      },
      {
        pregunta: '¿Quién es el cliente en una consignación?',
        respuesta:
          'Para el aviso por la venta, el comprador. Eso no significa que el consignante quede fuera del expediente: es la contraparte de tu contrato y su documentación forma parte del soporte de la operación.',
      },
      {
        pregunta: '¿Cómo determino el valor si no hay avalúo?',
        respuesta:
          'Usa el precio efectivamente pactado y consérvalo documentado. Cuando existan avalúo, comparables o precio de martillo, deja constancia del criterio elegido: lo que la autoridad revisa es que el criterio sea consistente, no que sea perfecto.',
      },
      {
        pregunta: '¿Puedo mantener el anonimato del pujador?',
        respuesta:
          'Frente al público, sí; frente a tu expediente, no. Alcanzado el umbral de identificación, la casa de subasta debe conocer y verificar la identidad del adjudicatario y, si es persona moral, la de su beneficiario controlador.',
      },
      {
        pregunta: '¿Aplica al arte popular o a la artesanía de alto valor?',
        respuesta:
          'La ley habla de obras de arte sin dar una lista cerrada. Cuando la pieza se comercializa como obra por su valor artístico y no como producto de consumo, lo prudente es analizarla dentro de esta fracción y documentar el razonamiento.',
      },
    ],
  },

  /* ── VIII. Vehículos ─────────────────────────────────────────────────────── */
  {
    slug: 'vehiculos',
    tituloSEO: 'Agencias y lotes de autos: umbrales de la fracción VIII',
    descripcionSEO:
      'Distribución y comercialización de vehículos terrestres, marítimos y aéreos, nuevos o usados. Umbral de identificación, umbral de aviso, permuta y límite de efectivo.',
    respuestaDirecta:
      'Distribuir o comercializar vehículos de cualquier tipo —terrestres, marítimos o aéreos, nuevos o usados— es actividad vulnerable sólo cuando se hace de forma habitual o profesional. Es la fracción donde más se confunden dos cifras parecidas: el umbral de identificación del art. 17 y el límite de efectivo del art. 32.',
    alcanza: [
      'Agencias automotrices de autos nuevos',
      'Lotes y comercializadoras de seminuevos',
      'Distribuidores de motocicletas',
      'Vendedores de embarcaciones y aeronaves',
      'Comercializadoras que operan por redes sociales de forma habitual',
    ],
    noAlcanza: [
      'La venta del auto particular una vez al año: no hay habitualidad ni profesionalidad.',
      'El taller mecánico o de hojalatería, que no comercializa el vehículo.',
      'La arrendadora que sólo renta unidades sin venderlas, cuyo análisis va por otra vía.',
    ],
    puntosClave: [
      'El umbral se mide sobre el valor de la operación completa, no sobre el enganche ni sobre la parte financiada.',
      'La permuta —el auto a cuenta— forma parte del precio y debe considerarse al medir el umbral.',
      'El límite de efectivo de vehículos y el umbral de identificación son cifras distintas que se parecen: confundirlas produce errores en ambos sentidos.',
      'Los umbrales del art. 17 se miden sin IVA y el límite del art. 32 con IVA: la misma venta se compara contra dos bases distintas.',
      'Los vehículos importados cruzan con la fracción de comercio exterior, que genera aviso cualquiera que sea su valor.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'avisos', 'conservacion-diez-anios'],
    ejemplo: {
      titulo: 'Venta de una camioneta con enganche en efectivo',
      contexto:
        'Una agencia vende una camioneta en enero de 2026 y el cliente entrega el enganche en efectivo. Ojo con la fecha: en enero todavía rige la UMA del año anterior.',
      montoPesos: '800000',
      fechaOperacion: '2026-01-20',
      efectivoPesos: '400000',
      notas: [
        'La operación es de enero, así que se mide con la UMA vigente ese día, que es la del año anterior. La UMA nueva entra en vigor hasta el 1 de febrero.',
        'El valor que se compara contra el umbral es el de la operación completa, no el del enganche.',
      ],
    },
    faq: [
      {
        pregunta: '¿El umbral se calcula con IVA o sin IVA?',
        respuesta:
          'Los umbrales de identificación y aviso del art. 17 se miden sin IVA. El límite de efectivo del art. 32, en cambio, se mide con IVA incluido. Una misma venta puede quedar por debajo de un umbral y por encima del otro.',
      },
      {
        pregunta: '¿La permuta cuenta, cuando el cliente deja su auto a cuenta?',
        respuesta:
          'Sí. El valor de la unidad recibida a cuenta forma parte del precio de la operación. Medir sólo la diferencia en dinero subestima el monto y produce avisos omitidos.',
      },
      {
        pregunta: '¿Cuánto efectivo puedo recibir por un auto?',
        respuesta:
          'Hasta el límite de la fracción II del art. 32, con IVA incluido. Por encima de esa cifra la operación en efectivo está prohibida, aunque presentes el aviso.',
      },
      {
        pregunta: '¿Las motos, las lanchas y las avionetas entran?',
        respuesta:
          'La fracción habla de todo tipo de vehículos, terrestres, marítimos y aéreos, nuevos o usados. Entran mientras la comercialización sea habitual o profesional.',
      },
      {
        pregunta: '¿Si el cliente financia con el banco, sobre qué monto aviso?',
        respuesta:
          'Sobre el valor de la operación de compraventa. Que el pago provenga de un crédito no reduce el monto del acto que celebraste con tu cliente.',
      },
    ],
  },

  /* ── IX. Blindaje ────────────────────────────────────────────────────────── */
  {
    slug: 'blindaje',
    tituloSEO: 'Servicios de blindaje de vehículos e inmuebles (art. 17-IX)',
    descripcionSEO:
      'Talleres de blindaje automotriz y empresas de blindaje arquitectónico: umbrales, cruce con la fracción de vehículos y límite de efectivo aplicable.',
    respuestaDirecta:
      'Prestar de forma habitual o profesional servicios de blindaje de vehículos terrestres o de bienes inmuebles es actividad vulnerable. El monto que se mide es el del servicio de blindaje, no el del vehículo o inmueble sobre el que se aplica.',
    alcanza: [
      'Talleres de blindaje automotriz',
      'Empresas de blindaje arquitectónico de residencias y oficinas',
      'Proveedores que realizan reblindaje o actualización de nivel',
      'Integradores que contratan el blindaje a nombre del cliente final',
    ],
    noAlcanza: [
      'La venta de cristal o lámina de seguridad como material, sin prestar el servicio de blindaje.',
      'La instalación de sistemas de alarma o videovigilancia, que no es blindaje.',
      'La venta del vehículo ya blindado, que se analiza por la fracción de vehículos.',
    ],
    puntosClave: [
      'Es un nicho pequeño con tickets altos: casi todas las operaciones relevantes cruzan al menos el umbral de identificación.',
      'Blindar un auto y venderlo blindado son dos actos distintos que pueden activar dos fracciones distintas.',
      'La importación del material balístico es actividad vulnerable por la fracción de comercio exterior, cualquiera que sea su valor.',
      'Quien firma el contrato no siempre es el usuario final del vehículo: identificar al beneficiario real es especialmente relevante aquí.',
      'El mantenimiento y el reblindaje son servicios nuevos y se miden por sí mismos; además, se acumulan en la ventana de seis meses.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'beneficiario-controlador', 'avisos', 'expedientes'],
    ejemplo: {
      titulo: 'Blindaje integral de una unidad',
      contexto:
        'Una empresa de blindaje contrata con un cliente el blindaje completo de una camioneta en septiembre de 2026.',
      montoPesos: '700000',
      fechaOperacion: '2026-09-02',
      notas: [
        'El monto medido es el del servicio contratado, no el valor del vehículo blindado.',
        'Si quien contrata es una persona moral, hay que identificar a su beneficiario controlador aunque el usuario del vehículo sea otra persona.',
      ],
    },
    faq: [
      {
        pregunta: '¿El blindaje de una casa cuenta?',
        respuesta:
          'Sí. La fracción incluye expresamente el blindaje de bienes inmuebles, además del de vehículos terrestres.',
      },
      {
        pregunta: '¿El mantenimiento del blindaje genera aviso?',
        respuesta:
          'Es un servicio de blindaje y se mide por sí mismo contra el umbral. Además, se suma a los demás servicios prestados al mismo cliente dentro de la ventana de seis meses.',
      },
      {
        pregunta: '¿Si vendo el auto ya blindado, reporto por vehículos o por blindaje?',
        respuesta:
          'Por la fracción que corresponda a cada acto. La venta del vehículo se analiza por la fracción VIII; el servicio de blindaje, por la IX. Si realizas ambos, puedes tener dos actividades vulnerables dadas de alta.',
      },
      {
        pregunta: '¿Debo identificar a la empresa o al usuario final del vehículo?',
        respuesta:
          'Tu cliente es quien contrata, y de él integras expediente. Si es persona moral, la identificación se extiende a su beneficiario controlador, que es donde suele aparecer el usuario real.',
      },
      {
        pregunta: '¿Cuánto efectivo puedo recibir por un blindaje?',
        respuesta:
          'Hasta el límite de la fracción V del art. 32, medido con IVA incluido. Es una prohibición independiente del aviso.',
      },
    ],
  },

  /* ── X. Traslado y custodia de valores ───────────────────────────────────── */
  {
    slug: 'traslado-custodia-valores',
    tituloSEO: 'Traslado y custodia de dinero o valores (art. 17-X)',
    descripcionSEO:
      'Empresas de transporte de valores y servicios de custodia: identificación sin umbral, umbral de aviso y la regla que obliga a avisar siempre cuando el monto no puede determinarse.',
    respuestaDirecta:
      'Prestar de forma habitual o profesional servicios de traslado o custodia de dinero o valores es actividad vulnerable, con identificación sin umbral. Tiene una regla propia que no existe en ninguna otra fracción: cuando no es posible determinar el monto trasladado o custodiado, el aviso procede en todos los casos.',
    alcanza: [
      'Empresas de transporte de valores',
      'Servicios de custodia y resguardo en bóveda',
      'Operadores de recolección de efectivo en comercios',
      'Prestadores de cajas de seguridad fuera del sistema financiero',
    ],
    noAlcanza: [
      'El Banco de México y las instituciones de depósito de valores, exceptuados expresamente.',
      'La mudanza o paquetería que traslada bienes que no son dinero ni valores.',
      'El comercio que traslada su propia recaudación con personal propio: no presta el servicio a un tercero.',
    ],
    puntosClave: [
      'La identificación no depende del monto: se integra expediente de todo cliente del servicio.',
      'Si el monto no puede determinarse, el aviso procede siempre; no es una excusa para omitirlo, es un supuesto de aviso automático.',
      'Definir quién es el cliente —el comercio origen o el destinatario de los fondos— debe quedar resuelto en el manual, no operación por operación.',
      'Un contrato marco de recolección recurrente genera operaciones repetidas: la acumulación de seis meses se cruza casi siempre.',
      'La custodia en bóveda se mide por el valor custodiado, con el mismo problema práctico de determinación del monto.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'avisos', 'mecanismos-automatizados', 'expedientes'],
    ejemplo: {
      titulo: 'Traslado de valores con monto determinable',
      contexto:
        'Una empresa de transporte de valores traslada una remesa para un cliente comercial en octubre de 2026, con monto perfectamente determinado.',
      montoPesos: '500000',
      fechaOperacion: '2026-10-14',
      montoIndeterminable: false,
      notas: [
        'Si el monto no pudiera determinarse, el resultado cambiaría por completo: el aviso procedería en todos los casos, sin importar el valor.',
        'En un contrato de recolección recurrente, cada servicio suma dentro de la ventana de seis meses del mismo cliente.',
      ],
    },
    faq: [
      {
        pregunta: '¿Por qué identifico sin umbral?',
        respuesta:
          'Porque el art. 17 no fija umbral de identificación para esta fracción. La ley considera que quien confía dinero o valores a un tercero debe estar identificado desde el primer servicio.',
      },
      {
        pregunta: '¿El cliente es el comercio o el banco destino?',
        respuesta:
          'Es quien contrata el servicio contigo. Deja el criterio escrito en el manual, porque en cadenas de recolección con varios participantes es donde más se equivocan los avisos.',
      },
      {
        pregunta: '¿La custodia en bóveda genera aviso?',
        respuesta:
          'La fracción cubre traslado y custodia. Si el valor custodiado alcanza el umbral, procede el aviso; y si no puede determinarse, procede en todos los casos.',
      },
      {
        pregunta: '¿Cómo reporto un contrato de servicio recurrente?',
        respuesta:
          'Los avisos se presentan por acto u operación. Un contrato marco no es un aviso único: cada servicio prestado se mide, y la acumulación por cliente exige una base consolidada.',
      },
      {
        pregunta: '¿Qué significa que el monto sea indeterminable?',
        respuesta:
          'Que por la naturaleza del servicio no puedes conocer el valor de lo trasladado o custodiado —por ejemplo, un contenedor sellado por el cliente—. En ese supuesto la ley resuelve la duda a favor del reporte: se avisa en todos los casos.',
      },
    ],
  },

  /* ── XI. Servicios profesionales ─────────────────────────────────────────── */
  {
    slug: 'servicios-profesionales',
    tituloSEO: 'Contadores y abogados: cuándo son sujetos obligados (art. 17-XI)',
    descripcionSEO:
      'Servicios profesionales independientes: los cinco incisos del catálogo, la diferencia entre asesorar y actuar en nombre del cliente, y por qué el secreto profesional no exime del aviso.',
    respuestaDirecta:
      'Un contador o un abogado independiente es sujeto obligado sólo cuando prepara o realiza para su cliente alguno de los cinco actos que enumera la fracción XI. La identificación procede siempre que participes en esos actos; el aviso no depende de un monto, sino de un hecho: que realices la operación financiera en nombre y representación del cliente.',
    alcanza: [
      'Contadores públicos independientes que administran recursos de clientes',
      'Abogados corporativos que constituyen sociedades a nombre de sus clientes',
      'Despachos que manejan cuentas bancarias de terceros bajo mandato',
      'Asesores que organizan aportaciones de capital para constituir sociedades',
      'Consultores que administran fideicomisos o vehículos corporativos de clientes',
    ],
    noAlcanza: [
      'Llevar la contabilidad o presentar declaraciones: no está en el catálogo de los cinco incisos.',
      'Opinar, dictaminar o redactar un contrato sin ejecutar la operación en nombre del cliente.',
      'El abogado litigante que representa en juicio: la defensa no es ninguno de los actos listados.',
      'El empleado en nómina de la empresa: la fracción exige que el servicio se preste de manera independiente, sin relación laboral.',
    ],
    puntosClave: [
      'Los cinco incisos son un catálogo cerrado: compraventa de inmuebles, administración de recursos, manejo de cuentas, organización de aportaciones de capital y constitución o administración de personas morales y fideicomisos.',
      'La línea entre asesorar y representar decide el aviso. Asesorar mantiene la identificación; representar activa el aviso.',
      'No hay umbral monetario: constituir una sociedad de capital pequeño en nombre del cliente puede generar aviso igual que una operación grande.',
      'La ley preserva el secreto profesional y la garantía de defensa, pero eso no convierte el aviso en optativo.',
      'En un despacho con varios socios hay que definir quién se da de alta y quién presenta los avisos, y dejarlo asentado.',
    ],
    obligacionesDestacadas: ['alta-sppld', 'identificacion-cliente', 'expedientes', 'avisos'],
    ejemplo: {
      titulo: 'Constitución de una sociedad en nombre del cliente',
      contexto:
        'Un despacho constituye una sociedad mercantil por instrucción y en representación de su cliente, y realiza la aportación del capital social, en junio de 2026.',
      montoPesos: '50000',
      fechaOperacion: '2026-06-18',
      subtipo: 'constitucion-personas-morales',
      enRepresentacion: true,
      notas: [
        'El monto es pequeño a propósito: en esta fracción el aviso no depende de la cifra, sino de que el profesional haya realizado la operación financiera en nombre del cliente.',
        'Si el despacho sólo hubiera asesorado sin ejecutar la operación, el resultado sería distinto: seguiría habiendo identificación y expediente, pero no aviso por este supuesto.',
      ],
    },
    faq: [
      {
        pregunta: '¿Llevar la contabilidad me hace sujeto obligado?',
        respuesta:
          'No por sí solo. La contabilidad y el cumplimiento fiscal no están en los cinco incisos de la fracción XI. Lo que sí entra es administrar recursos del cliente, manejar sus cuentas o constituir y administrar sociedades a su nombre.',
      },
      {
        pregunta: '¿Qué significa "en nombre y representación"?',
        respuesta:
          'Que tú ejecutas la operación financiera por instrucción del cliente, con mandato o poder, y no simplemente le explicas cómo hacerla. Es el hecho que dispara el aviso en esta fracción.',
      },
      {
        pregunta: '¿El secreto profesional me exime del aviso?',
        respuesta:
          'No. La ley ordena presentar el aviso con respeto al secreto profesional y a la garantía de defensa, no en lugar de ellos. Presentar un aviso conforme a la ley no transgrede el secreto legal ni profesional.',
      },
      {
        pregunta: '¿Constituir una sociedad de capital mínimo se reporta?',
        respuesta:
          'Si realizaste la operación en nombre y representación del cliente, el aviso procede sin umbral monetario. El monto del capital no es el criterio.',
      },
      {
        pregunta: '¿Se registra el despacho o cada socio?',
        respuesta:
          'Depende de quién presta el servicio y bajo qué figura. Si el despacho es persona moral y contrata con el cliente, es él quien se registra y designa representante encargado del cumplimiento. Si cada socio contrata en lo personal, la obligación es individual.',
      },
    ],
  },

  /* ── XII A. Notarios ─────────────────────────────────────────────────────── */
  {
    slug: 'fe-publica-notarios',
    tituloSEO: 'Notarios públicos: umbral por inciso tras la reforma de 2025 (art. 17-XII A)',
    descripcionSEO:
      'Los cinco incisos del apartado A desglosados: inmuebles, poderes irrevocables, constitución de sociedades, fideicomisos y mutuos. Qué bajó de umbral y qué pasó a generar aviso siempre.',
    respuestaDirecta:
      'Un notario no tiene "un umbral": tiene cinco incisos con reglas distintas. Tres de ellos generan aviso sin importar el monto y dos tienen umbral en UMA. La reforma de julio de 2025 endureció el apartado: bajó el umbral de inmuebles y el de fideicomisos, y convirtió la constitución de personas morales en un supuesto de aviso permanente.',
    alcanza: [
      'Notarías públicas de todas las entidades federativas',
      'Actos protocolizados ante notario que encajen en cualquiera de los cinco incisos',
    ],
    noAlcanza: [
      'Actos notariales que no están en el catálogo del apartado A, como una ratificación de firmas ajena a los supuestos listados.',
      'Las garantías constituidas a favor de instituciones del sistema financiero o de organismos públicos de vivienda, en los incisos donde la ley las exceptúa.',
      'Los corredores públicos, que tienen su propio apartado B con reglas diferentes.',
    ],
    puntosClave: [
      'Cada inciso tiene su regla: aplanarlos a un solo número es el error más común de los resúmenes en línea.',
      'En inmuebles la base no es el precio pactado sin más, sino el más alto entre precio pactado, valor catastral, valor comercial y monto garantizado por suerte principal.',
      'La constitución de personas morales pasó de tener umbral a generar aviso siempre: es el cambio con mayor impacto en volumen de avisos.',
      'El aviso del notario no libera a la inmobiliaria ni al desarrollador, que reportan por sus propias fracciones.',
      'Los fedatarios tienen además una obligación propia de identificar la forma de pago en operaciones de valor alto, con su propia sanción.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'beneficiario-controlador', 'avisos', 'conservacion-diez-anios'],
    ejemplo: {
      titulo: 'Escritura de compraventa de un inmueble',
      contexto:
        'Un notario autoriza la escritura de compraventa de una casa en marzo de 2026. El valor más alto entre precio pactado, catastral y comercial es el siguiente.',
      montoPesos: '2400000',
      fechaOperacion: '2026-03-20',
      subtipo: 'inmuebles',
      notas: [
        'La base de comparación es el valor más alto de los cuatro que enumera el inciso, no necesariamente el precio de la escritura.',
        'El mismo instrumento puede activar otras obligaciones del notario, como identificar la forma de pago conforme al art. 33.',
      ],
    },
    faq: [
      {
        pregunta: '¿Qué actos notariales generan aviso siempre?',
        respuesta:
          'Los poderes de administración o dominio otorgados con carácter irrevocable, la constitución y modificación de personas morales con sus operaciones sobre acciones y partes sociales, y los mutuos o créditos en los que el acreedor no forma parte del sistema financiero ni es organismo público de vivienda.',
      },
      {
        pregunta: '¿Sobre qué valor se mide el aviso de inmuebles?',
        respuesta:
          'Sobre el más alto entre el precio pactado, el valor catastral, el valor comercial y el monto garantizado por suerte principal. Tomar sólo el precio de la escritura subestima la base y produce avisos omitidos.',
      },
      {
        pregunta: '¿El aviso del notario libera a la inmobiliaria?',
        respuesta:
          'No. Son sujetos obligados distintos, con fracciones distintas y umbrales distintos sobre la misma operación. Cada uno responde por su propio aviso.',
      },
      {
        pregunta: '¿Qué cambió para los notarios con la reforma de 2025?',
        respuesta:
          'Bajó el umbral del inciso de inmuebles y el de fideicomisos, y la constitución de personas morales dejó de tener umbral para generar aviso en todos los casos. En conjunto, más actos quedan dentro y más operaciones generan reporte.',
      },
      {
        pregunta: '¿Puedo presentar el aviso de inmuebles por la vía fiscal?',
        respuesta:
          'La ley admite que el aviso del inciso de inmuebles se cumpla por los medios que establecen las disposiciones fiscales federales para declaraciones y avisos, siempre que contenga la información que exige el art. 24.',
      },
    ],
  },

  /* ── XII B. Corredores ───────────────────────────────────────────────────── */
  {
    slug: 'fe-publica-corredores',
    tituloSEO: 'Corredores públicos: avalúos, sociedades, fideicomisos y mutuos (art. 17-XII B)',
    descripcionSEO:
      'El apartado B desglosado inciso por inciso: cuál tiene umbral en UMA y cuáles generan aviso sin importar el monto, con las excepciones que fija la ley.',
    respuestaDirecta:
      'El apartado B tiene cuatro incisos y sólo uno de ellos —los avalúos— se mide contra un umbral en UMA. Los otros tres, relativos a sociedades mercantiles, fideicomisos y mutuos mercantiles, generan aviso sin importar el monto de la operación.',
    alcanza: [
      'Corredurías públicas habilitadas',
      'Avalúos sobre bienes realizados por corredor público',
      'Actos corporativos mercantiles formalizados ante corredor',
    ],
    noAlcanza: [
      'Los fideicomisos constituidos para garantizar crédito a favor de instituciones del sistema financiero, exceptuados por la ley.',
      'Los mutuos mercantiles en los que el acreedor sí forma parte del sistema financiero.',
      'Los actos de fe pública notarial, que van por el apartado A.',
    ],
    puntosClave: [
      'El avalúo es el único inciso con umbral, y comparte cifra entre identificación y aviso.',
      'Los actos corporativos generan aviso siempre: no hay operación pequeña que quede fuera.',
      'El corredor y el notario pueden intervenir en actos parecidos con reglas distintas: el apartado aplicable depende de quién autoriza el acto.',
      'La reincidencia en infracciones tiene una consecuencia propia para el corredor: la cancelación definitiva de su habilitación.',
      'La identificación del beneficiario controlador es especialmente exigente en los actos societarios y de fideicomiso.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'beneficiario-controlador', 'avisos', 'expedientes'],
    ejemplo: {
      titulo: 'Avalúo sobre un inmueble industrial',
      contexto:
        'Un corredor público realiza un avalúo sobre una nave industrial en agosto de 2026, por el valor siguiente.',
      montoPesos: '1200000',
      fechaOperacion: '2026-08-05',
      subtipo: 'avaluos',
      notas: [
        'En este inciso el umbral de identificación y el de aviso coinciden: alcanzar uno significa alcanzar el otro.',
        'Los demás incisos del apartado B no se miden contra una cifra: generan aviso en todos los casos.',
      ],
    },
    faq: [
      {
        pregunta: '¿Los corredores tienen los mismos umbrales que los notarios?',
        respuesta:
          'No. Son apartados distintos con incisos distintos. El apartado B tiene un solo inciso con umbral —los avalúos— mientras que en el apartado A conviven incisos con umbral y sin él.',
      },
      {
        pregunta: '¿Un avalúo pequeño genera obligaciones?',
        respuesta:
          'Por debajo del umbral no nace la obligación de aviso ni la de identificación por ese inciso, pero sí conviene revisar la acumulación de seis meses si el mismo cliente encarga avalúos con frecuencia.',
      },
      {
        pregunta: '¿Constituir una sociedad ante corredor genera aviso?',
        respuesta:
          'Sí, sin umbral. El inciso relativo a constitución de personas morales mercantiles, modificación patrimonial, fusión, escisión y compraventa de acciones y partes sociales genera aviso en todos los casos.',
      },
      {
        pregunta: '¿Qué fideicomisos quedan fuera?',
        respuesta:
          'Los constituidos para garantizar un crédito a favor de instituciones del sistema financiero. Fuera de esa excepción, la constitución, modificación o cesión de derechos de fideicomiso genera aviso.',
      },
      {
        pregunta: '¿Qué pasa si acumulo infracciones?',
        respuesta:
          'Además de la multa, la ley prevé consecuencias específicas para los fedatarios: la cancelación definitiva de la habilitación del corredor público en caso de reincidencia, y el aviso a la autoridad que supervisa la fe pública.',
      },
    ],
  },

  /* ── XII C. Servidores públicos con fe pública ───────────────────────────── */
  {
    slug: 'fe-publica-servidores-publicos',
    tituloSEO: 'Servidores públicos con fe pública: el apartado C sin umbrales publicados',
    descripcionSEO:
      'La ley enuncia el apartado C del art. 17 fracción XII, pero la autoridad no ha publicado umbrales para él. Qué sí se sabe, qué no, y por qué no publicamos cifras.',
    respuestaDirecta:
      'El apartado C alcanza a los servidores públicos a quienes la ley confiere la facultad de dar fe pública. La ley enuncia el apartado, pero no fija umbrales propios y la tabla oficial de umbrales del SAT no lo desglosa. Por eso esta página existe y explica el supuesto, pero no publica ninguna cifra: inventarla sería peor que decir que falta.',
    alcanza: [
      'Servidores públicos con facultad de dar fe pública en el ejercicio de sus atribuciones, en los términos del art. 3, fracción VII de la ley',
    ],
    noAlcanza: [
      'Los notarios públicos, que tienen su propio apartado A con reglas detalladas.',
      'Los corredores públicos, que van por el apartado B.',
      'Las personas facilitadoras públicas y privadas, incorporadas en el apartado D.',
    ],
    puntosClave: [
      'El apartado existe en el texto de la ley: no es una omisión nuestra, es una regla sin desarrollo publicado.',
      'La tabla oficial de umbrales del SAT no incluye una fila para este apartado.',
      'Mientras no haya cifra oficial, cualquier tabla de terceros que publique un umbral para el apartado C está extrapolando.',
      'La reforma al Reglamento de 2026 agrupó a notarios, corredores, servidores públicos con fe pública y personas facilitadoras bajo la noción de personas depositarias de fe pública.',
      'Si tu función encaja en este supuesto, la ruta prudente es consultar directamente a la autoridad antes de asumir un umbral prestado de otro apartado.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'conservacion-diez-anios'],
    sinUmbralPublicado:
      'La autoridad no ha publicado umbrales de identificación ni de aviso para este apartado. No mostramos cifras tomadas de otro apartado ni de fuentes secundarias: cuando exista una publicación oficial, esta página se actualiza y el cambio queda registrado en la bitácora de actualizaciones.',
    faq: [
      {
        pregunta: '¿Entonces este apartado no genera obligaciones?',
        respuesta:
          'No es eso lo que decimos. El apartado está en la ley y quien encaje en él debe analizar su situación. Lo que falta es el desarrollo con umbrales concretos, y sin él no podemos decirte a partir de qué cifra identificar o avisar.',
      },
      {
        pregunta: '¿Puedo usar los umbrales de notarios por analogía?',
        respuesta:
          'No lo recomendamos. La ley remite expresamente a los supuestos del apartado A sólo en el apartado D, no en el C. Aplicar por analogía un umbral que la norma no dispuso es una decisión jurídica que debe tomar un profesional sobre tu caso, no una tabla de internet.',
      },
      {
        pregunta: '¿Qué hago mientras tanto?',
        respuesta:
          'Documenta tu análisis, conserva la información de los actos que autorizas y sigue el resto de las obligaciones generales que sí son claras: identificación, expediente y conservación. Deja constancia escrita del criterio que aplicaste y de la fecha.',
      },
      {
        pregunta: '¿Cómo sabré si la autoridad publica los umbrales?',
        respuesta:
          'Publicamos cada cambio normativo en la bitácora de actualizaciones con la fecha del Diario Oficial y las páginas afectadas. Cuando el dato exista en fuente oficial, esta página dejará de decir que falta.',
      },
      {
        pregunta: '¿Por qué otras páginas sí publican una cifra aquí?',
        respuesta:
          'Porque la toman de otro apartado o de una fuente secundaria. Nuestro criterio editorial es no publicar una cifra legal sin fuente oficial que la respalde, aunque eso signifique una tabla con un hueco visible.',
      },
    ],
  },

  /* ── XII D. Personas facilitadoras ───────────────────────────────────────── */
  {
    slug: 'personas-facilitadoras',
    tituloSEO: 'Personas facilitadoras públicas y privadas: el apartado D adicionado en 2025',
    descripcionSEO:
      'La reforma de julio de 2025 incorporó a las personas facilitadoras de la Ley General de Mecanismos Alternativos de Solución de Controversias. Qué dice la ley y qué falta por publicar.',
    respuestaDirecta:
      'El apartado D se adicionó por la reforma publicada el 16 de julio de 2025 y alcanza a las personas facilitadoras públicas y privadas previstas en la Ley General de Mecanismos Alternativos de Solución de Controversias. La ley remite a los supuestos del apartado A "en los términos que se señalan", pero la tabla oficial de umbrales no desglosa este apartado, así que no publicamos cifras propias.',
    alcanza: [
      'Personas facilitadoras públicas adscritas a centros de justicia alternativa',
      'Personas facilitadoras privadas certificadas conforme a la Ley General de Mecanismos Alternativos de Solución de Controversias',
    ],
    noAlcanza: [
      'Los mediadores que no tienen la calidad de persona facilitadora en los términos de esa ley general.',
      'Los notarios y corredores, que van por sus propios apartados.',
      'El abogado que asesora a una parte en el procedimiento, cuyo análisis va por la fracción XI si encaja en su catálogo.',
    ],
    puntosClave: [
      'Es un apartado nuevo: antes de la reforma de 2025 estas personas no figuraban en el catálogo del art. 17.',
      'La remisión al apartado A es expresa, pero la propia ley la condiciona a "los términos que se señalan", lo que exige un desarrollo que aún no vemos publicado.',
      'La reforma al Reglamento de 2026 las incorporó a la definición de personas depositarias de fe pública.',
      'Los convenios que resultan de un mecanismo alternativo pueden documentar actos que sí están en el apartado A, como transmisiones de derechos sobre inmuebles.',
      'Mientras no haya umbral oficial, lo defendible es documentar el análisis y conservar la información de cada asunto.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'conservacion-diez-anios'],
    sinUmbralPublicado:
      'La remisión al apartado A existe en el texto de la ley, pero la autoridad no ha publicado los umbrales concretos que aplican a este apartado. En lugar de copiar las cifras de notarios, dejamos el hueco visible y lo señalamos.',
    faq: [
      {
        pregunta: '¿Una persona facilitadora es sujeto obligado desde 2025?',
        respuesta:
          'El apartado que la incorpora está en vigor desde el 17 de julio de 2025. Lo que falta es el desarrollo de los umbrales aplicables, que la ley remite a los supuestos del apartado A en los términos que ella misma señala.',
      },
      {
        pregunta: '¿Entonces aplico los umbrales de los notarios?',
        respuesta:
          'La remisión al apartado A apunta en esa dirección, pero no la confirmamos como dato verificado porque la tabla oficial no lo desglosa. Es exactamente el tipo de decisión que debe tomar un profesional sobre tu caso, con constancia escrita del criterio.',
      },
      {
        pregunta: '¿Qué actos de un mecanismo alternativo podrían quedar dentro?',
        respuesta:
          'Aquellos que coinciden con los supuestos del apartado A: transmisión o constitución de derechos reales sobre inmuebles, poderes irrevocables, actos societarios, fideicomisos y mutuos con acreedor fuera del sistema financiero.',
      },
      {
        pregunta: '¿Debo darme de alta en el padrón?',
        respuesta:
          'El alta corresponde a quien realiza una actividad vulnerable. Si tu función encaja en el apartado D, esa es la pregunta central y conviene resolverla con asesoría, dejando constancia del análisis y de su fecha.',
      },
      {
        pregunta: '¿Actualizarán esta página cuando haya umbrales?',
        respuesta:
          'Sí. El cambio aparecerá en la bitácora de actualizaciones con la fecha de publicación oficial, y esta página dejará de mostrar el aviso de dato pendiente.',
      },
    ],
  },

  /* ── XIII. Donativos ─────────────────────────────────────────────────────── */
  {
    slug: 'donativos',
    tituloSEO: 'Donativos a asociaciones y sociedades sin fines de lucro (art. 17-XIII)',
    descripcionSEO:
      'Asociaciones civiles, fundaciones e instituciones de asistencia privada: umbrales de identificación y aviso por donativo, donante anónimo, donativos en especie y del extranjero.',
    respuestaDirecta:
      'Recibir donativos siendo asociación o sociedad sin fines de lucro es actividad vulnerable cuando el donativo alcanza los montos de la fracción. El sujeto obligado es la organización que recibe, no el donante, y el monto que se mide es el del donativo.',
    alcanza: [
      'Asociaciones civiles que reciben donativos del público',
      'Fundaciones empresariales y familiares',
      'Instituciones de asistencia privada',
      'Organizaciones que recaudan por plataformas digitales',
    ],
    noAlcanza: [
      'El donante que aporta: la obligación es de quien recibe.',
      'La cuota de recuperación por un servicio prestado, que no es donativo.',
      'La sociedad mercantil con fin de lucro que recibe una aportación, cuyo análisis va por otra vía.',
    ],
    puntosClave: [
      'El sector no lucrativo está bajo vigilancia internacional reforzada, y las reglas de 2026 le dedicaron un capítulo propio de medidas proporcionales.',
      'El donativo en especie cuenta y hay que valuarlo con criterio documentado.',
      'El donante recurrente de montos medianos activa la acumulación de seis meses casi sin excepción.',
      'Cuando el donante es persona moral, el expediente incluye a su beneficiario controlador.',
      'Ser donataria autorizada para efectos fiscales no sustituye ninguna de estas obligaciones: son regímenes distintos.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'beneficiario-controlador', 'avisos', 'expedientes'],
    ejemplo: {
      titulo: 'Donativo recibido de una empresa',
      contexto:
        'Una asociación civil recibe un donativo de una empresa en octubre de 2026.',
      montoPesos: '400000',
      fechaOperacion: '2026-10-09',
      notas: [
        'El acto medido es el donativo recibido, con independencia del destino que la organización le dé después.',
        'Si el mismo donante aporta cada mes, revisa la acumulación de seis meses: es el escenario más común del sector.',
      ],
    },
    faq: [
      {
        pregunta: '¿Puedo aceptar un donativo anónimo?',
        respuesta:
          'Por debajo del umbral de identificación no nace la obligación de integrar expediente por esa operación. Alcanzado el umbral, no puedes: si el donante se niega a proporcionar la información, la ley ordena abstenerse de realizar la operación.',
      },
      {
        pregunta: '¿El donativo en especie cuenta y con qué valor?',
        respuesta:
          'Cuenta. Documenta el criterio de valuación —factura, avalúo o valor de mercado comparable— y consérvalo. Lo que se revisa es la consistencia del criterio, no que exista un avalúo formal en todos los casos.',
      },
      {
        pregunta: '¿Los donativos del extranjero tienen reglas distintas?',
        respuesta:
          'El umbral es el mismo, pero el riesgo no: la jurisdicción de origen es un factor que debe pesar en la clasificación del donante y puede activar debida diligencia reforzada.',
      },
      {
        pregunta: '¿Una A.C. sin donataria autorizada también está obligada?',
        respuesta:
          'Sí. La fracción habla de asociaciones y sociedades sin fines de lucro que reciben donativos, sin condicionar la obligación a la autorización fiscal para expedir recibos deducibles.',
      },
      {
        pregunta: '¿El crowdfunding genera avisos?',
        respuesta:
          'Cada donativo recibido se mide contra el umbral y se acumula por donante. La dificultad práctica es identificar al aportante cuando la plataforma intermedia: resuélvelo en el manual antes de lanzar la campaña.',
      },
    ],
  },

  /* ── XIV. Comercio exterior ──────────────────────────────────────────────── */
  {
    slug: 'comercio-exterior',
    tituloSEO: 'Agentes y agencias aduanales: catálogo de mercancías (art. 17-XIV)',
    descripcionSEO:
      'Comercio exterior como actividad vulnerable: qué mercancías detonan la obligación, cuáles generan aviso cualquiera que sea su valor y cuáles se miden por valor individual del bien.',
    respuestaDirecta:
      'El comercio exterior no es actividad vulnerable en general: lo es respecto de un catálogo cerrado de seis tipos de mercancía. Cuatro de ellos generan aviso cualquiera que sea el valor de los bienes, y sólo dos —joyería y obras de arte— tienen umbral, que además se mide por el valor individual del bien y no por el pedimento completo.',
    alcanza: [
      'Agentes aduanales y apoderados aduanales',
      'Agencias aduanales constituidas como persona moral',
      'Despachos promovidos por personas físicas y morales sin intervención de agente aduanal',
    ],
    noAlcanza: [
      'La importación de mercancías que no están en el catálogo, por alta que sea su valor: maquinaria industrial, insumos o materias primas.',
      'El importador que sólo importa para su propio consumo y no presta servicios de comercio exterior a terceros.',
      'El transportista internacional, que no promueve el despacho.',
    ],
    puntosClave: [
      'El catálogo manda: vehículos, máquinas de juego, equipos y materiales para tarjetas de pago, joyería y metales, obras de arte y materiales de resistencia balística.',
      'Cuatro de los seis incisos generan aviso cualquiera que sea el valor: no hay operación pequeña que quede fuera.',
      'En joyería y obras de arte el umbral se mide por valor individual del bien, lo que evita diluir una pieza cara en un pedimento grande.',
      'La misma mercancía puede activar otra fracción para otro sujeto: el importador de vehículos que además los comercializa cae en la fracción VIII.',
      'Definir quién es el cliente —importador o consignatario— debe estar resuelto en el manual antes del primer despacho.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'avisos', 'expedientes', 'conservacion-diez-anios'],
    ejemplo: {
      titulo: 'Importación de una pieza de joyería',
      contexto:
        'Una agencia aduanal promueve el despacho de una pieza de joyería con el valor individual siguiente, en septiembre de 2026.',
      montoPesos: '60000',
      fechaOperacion: '2026-09-08',
      subtipo: 'joyas-metales',
      notas: [
        'El umbral se compara contra el valor individual del bien, no contra el valor total del pedimento.',
        'Si en el mismo embarque vinieran vehículos o materiales balísticos, esos incisos generarían aviso sin importar su valor.',
      ],
    },
    faq: [
      {
        pregunta: '¿Un importador debe registrarse en el padrón?',
        respuesta:
          'No por el solo hecho de importar. La fracción alcanza a quien presta el servicio de comercio exterior —agente, apoderado o agencia aduanal— y al despacho promovido sin su intervención. Si tú promueves tu propio despacho de mercancías del catálogo, revisa tu situación con cuidado.',
      },
      {
        pregunta: '¿Qué mercancías detonan la obligación?',
        respuesta:
          'Vehículos terrestres, aéreos y marítimos; máquinas para juegos de apuesta y sorteos; equipos y materiales para elaborar tarjetas de pago; joyas, relojes, piedras y metales preciosos; obras de arte; y materiales de resistencia balística para blindaje. Fuera de ese catálogo, la fracción no aplica.',
      },
      {
        pregunta: '¿El aviso lo presenta el agente o la agencia?',
        respuesta:
          'Quien realiza la actividad vulnerable y está dado de alta por ella. Si operas como agencia aduanal persona moral, es la agencia la que se registra y designa representante encargado del cumplimiento.',
      },
      {
        pregunta: '¿El umbral es por pedimento o por bien?',
        respuesta:
          'En joyería y obras de arte, por valor individual del bien. Es una regla pensada precisamente para que una pieza cara no se diluya dentro de un pedimento con muchos artículos.',
      },
      {
        pregunta: '¿Se acumulan las operaciones del mismo importador?',
        respuesta:
          'La regla general de acumulación de seis meses del art. 17 aplica a todas las fracciones. En los incisos que generan aviso siempre, la acumulación no cambia el resultado porque el aviso ya procede desde la primera operación.',
      },
    ],
  },

  /* ── XV. Arrendamiento ───────────────────────────────────────────────────── */
  {
    slug: 'arrendamiento-inmuebles',
    tituloSEO: 'Arrendamiento de inmuebles: el umbral es mensual (art. 17-XV)',
    descripcionSEO:
      'Rentar locales, oficinas, bodegas o vivienda: por qué el umbral se mide sobre la renta mensual y no sobre el contrato, y el matiz de "superior a" frente a "igual o superior a".',
    respuestaDirecta:
      'Constituir derechos personales de uso o goce sobre bienes inmuebles —rentar— es actividad vulnerable, y el umbral se mide sobre el valor mensual, no sobre el contrato completo. Tiene además un matiz que casi nadie implementa: la identificación aplica cuando la renta es superior a la cifra de la ley, mientras que el aviso aplica cuando es igual o superior a la suya.',
    alcanza: [
      'Arrendadores de locales comerciales, oficinas y naves industriales',
      'Administradoras de propiedades en renta',
      'Personas físicas que rentan inmuebles de forma habitual',
      'Subarrendadores que ceden el uso a terceros',
    ],
    noAlcanza: [
      'El inquilino: la obligación es de quien otorga el uso o goce.',
      'La renta de bienes muebles, que no está en esta fracción.',
      'El servicio de hospedaje con servicios asociados, cuyo tratamiento debe analizarse antes de asumir que es arrendamiento.',
    ],
    puntosClave: [
      'El umbral es mensual: un contrato anual grande no se mide sumando los doce meses, sino mirando la renta de cada mes.',
      'El matiz "superior a" frente a "igual o superior a" decide el resultado justo en el borde, y es la razón por la que nuestras herramientas guardan el comparador y no sólo el número.',
      'Un contrato que alcanza el umbral de aviso genera obligación mes con mes mientras dure, no una sola vez al firmar.',
      'El depósito en garantía no es renta: define en el manual cómo lo tratas y sé consistente.',
      'Cuando el arrendatario es persona moral, el expediente incluye a su beneficiario controlador.',
    ],
    obligacionesDestacadas: ['identificacion-cliente', 'expedientes', 'avisos', 'informes-en-ceros'],
    ejemplo: {
      titulo: 'Renta mensual de un piso de oficinas',
      contexto:
        'Un arrendador otorga en renta un piso de oficinas a una empresa. La renta mensual pactada es la siguiente, y el pago de octubre de 2026 se cumple en la fecha indicada.',
      montoPesos: '400000',
      fechaOperacion: '2026-10-01',
      notas: [
        'El monto capturado es la renta de un mes, no el valor total del contrato: así lo mide esta fracción.',
        'Mientras el contrato siga vigente con esa renta, la obligación se repite cada mes en que se realice el pago o se cumpla la obligación.',
      ],
    },
    faq: [
      {
        pregunta: '¿El umbral es por mes o por contrato?',
        respuesta:
          'Por mes. La ley mide el valor mensual, al día en que se realiza el pago o se cumple la obligación. Sumar los doce meses de un contrato para compararlo contra el umbral es un error frecuente que infla el resultado.',
      },
      {
        pregunta: '¿Rentar en plataformas de estancia corta me obliga?',
        respuesta:
          'Depende de si lo que ofreces es arrendamiento o un servicio de hospedaje con servicios asociados, y de si la renta mensual alcanza el umbral. En estancias cortas de bajo importe, lo habitual es que no se llegue; documenta tu análisis de todos modos.',
      },
      {
        pregunta: '¿El depósito en garantía cuenta para el umbral?',
        respuesta:
          'No es renta: es una garantía que normalmente se devuelve. Deja el criterio escrito en tu manual y aplícalo de forma consistente, porque un tratamiento cambiante es lo que llama la atención de un verificador.',
      },
      {
        pregunta: '¿Si rento tres locales pequeños, se suman?',
        respuesta:
          'Cada contrato se mide por su renta mensual. La suma aparece por otra vía: la acumulación de seis meses del art. 17, que agrupa las operaciones del mismo cliente por el mismo tipo de acto.',
      },
      {
        pregunta: '¿Presento aviso cada mes mientras dure el contrato?',
        respuesta:
          'Si la renta mensual alcanza el umbral de aviso, sí: la obligación es mensual porque así se mide la operación en esta fracción.',
      },
    ],
  },

  /* ── XVI. Activos virtuales ──────────────────────────────────────────────── */
  {
    slug: 'activos-virtuales',
    tituloSEO: 'Activos virtuales: los umbrales más bajos de la ley (art. 17-XVI)',
    descripcionSEO:
      'Intercambio de activos virtuales fuera del sistema financiero: dos disparadores independientes —monto de la operación y contraprestación cobrada—, alcance extraterritorial y obligaciones reforzadas.',
    respuestaDirecta:
      'Ofrecer de forma habitual y profesional el intercambio de activos virtuales, sin ser entidad financiera, es actividad vulnerable con los umbrales más bajos de toda la ley. Tiene dos disparadores independientes: el monto de la operación por cliente y la contraprestación cobrada por el servicio. Basta con que uno se alcance para que proceda el aviso.',
    alcanza: [
      'Plataformas de intercambio de criptoactivos no reguladas como instituciones de tecnología financiera',
      'Mesas de compraventa directa que operan de forma habitual',
      'Proveedores de custodia o almacenamiento de activos virtuales por cuenta de clientes',
      'Cajeros de criptomonedas',
      'Plataformas extranjeras que operan con personas mexicanas desde otra jurisdicción',
    ],
    noAlcanza: [
      'Quien compra o vende criptoactivos para sí mismo: no ofrece el servicio a terceros.',
      'Las instituciones de tecnología financiera autorizadas, que cumplen bajo su propio régimen.',
      'La moneda de curso legal, las divisas y los activos denominados en ellas, que la ley excluye del concepto de activo virtual.',
    ],
    puntosClave: [
      'Dos disparadores independientes: uno por el monto de la operación y otro por la contraprestación cobrada, sin importar cómo la llames.',
      'La identificación procede siempre, sin umbral: toda operación exige expediente.',
      'El alcance es extraterritorial: alcanza operaciones realizadas con personas mexicanas desde otra jurisdicción.',
      'Hay obligación adicional de conservar información precisa del originante, del receptor y, en su caso, del beneficiario controlador.',
      'Las reglas de 2026 precisaron el contenido del aviso: dirección de billetera, tipo de activo, monto en activo virtual y su equivalente en moneda nacional, fecha, hora y comisión cobrada.',
    ],
    obligacionesDestacadas: ['alta-sppld', 'identificacion-cliente', 'avisos', 'mecanismos-automatizados'],
    ejemplo: {
      titulo: 'Operación de intercambio con comisión',
      contexto:
        'Una plataforma ejecuta una operación de compraventa para un cliente en septiembre de 2026 y cobra una comisión por el servicio.',
      montoPesos: '25000',
      comisionPesos: '350',
      fechaOperacion: '2026-09-19',
      notas: [
        'Los dos disparadores se evalúan por separado: puede alcanzarse el del monto sin alcanzar el de la comisión, y viceversa.',
        'Las reglas prevén que, cuando una misma operación cae en ambos supuestos, se presenta un solo aviso.',
      ],
    },
    faq: [
      {
        pregunta: '¿Comprar cripto para mí me hace sujeto obligado?',
        respuesta:
          'No. La fracción alcanza a quien ofrece el servicio de intercambio de forma habitual y profesional a través de plataformas que administra u opera. Operar por cuenta propia no es prestar el servicio.',
      },
      {
        pregunta: '¿Una plataforma extranjera con clientes mexicanos está obligada?',
        respuesta:
          'La reforma de 2025 incluyó expresamente las operaciones realizadas con ciudadanos mexicanos desde otra jurisdicción. Ese alcance extraterritorial es uno de los cambios más relevantes de la fracción.',
      },
      {
        pregunta: '¿Un NFT es activo virtual u obra de arte?',
        respuesta:
          'Depende de la operación. Si intercambias el token en tu plataforma, el análisis va por esta fracción con sus umbrales bajos. Si vendes una obra física y el token sólo la acredita, el análisis va por la fracción de obras de arte.',
      },
      {
        pregunta: '¿Cómo identifico al titular de una billetera?',
        respuesta:
          'Con el mismo estándar que en cualquier otra actividad: documentos oficiales, verificación y expediente. La dirección de la billetera es un dato del aviso, no un sustituto de la identificación de la persona.',
      },
      {
        pregunta: '¿Se acumula la comisión con la regla de seis meses?',
        respuesta:
          'Las reglas de 2026 precisaron que la contraprestación se determina por transacción individual y no se acumula. El monto de la operación, en cambio, sí queda dentro de la lógica general de acumulación.',
      },
    ],
  },
];

export const CONTENIDO_ACTIVIDADES: Record<ActividadSlug, ContenidoActividad> =
  Object.fromEntries(CONTENIDOS.map((c) => [c.slug, c])) as Record<
    ActividadSlug,
    ContenidoActividad
  >;

export { CONTENIDOS as LISTA_CONTENIDO_ACTIVIDADES };
