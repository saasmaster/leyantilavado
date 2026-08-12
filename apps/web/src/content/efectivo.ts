import type { PreguntaFrecuente } from './tipos';

/**
 * Contenido de /limites-efectivo.
 *
 * El hueco de contenido más grande del mercado: casi nadie explica que el
 * límite del art. 32 y los umbrales del art. 17 no se miden sobre la misma
 * base. Aquí eso es el bloque central, no una nota al pie.
 */
export const COMPARATIVA_IVA = {
  titulo: 'Con IVA o sin IVA: la diferencia que cambia el resultado',
  entrada:
    'Los umbrales de identificación y de aviso del art. 17 se miden sobre el valor del acto u operación sin IVA. El límite al uso de efectivo del art. 32 se mide sobre el monto que efectivamente se paga, con IVA y accesorios incluidos. Es la misma venta comparada contra dos bases distintas, y por eso una operación puede quedar por debajo de un umbral y por encima del otro.',
  filas: [
    {
      eje: 'Qué es',
      art17: 'Un umbral de reporte: a partir de esa cifra hay que identificar o avisar.',
      art32: 'Una prohibición: por encima de esa cifra no se puede pagar ni aceptar el pago en efectivo o metales.',
    },
    {
      eje: 'Base de comparación',
      art17: 'Valor del acto u operación, sin IVA.',
      art32: 'Monto liquidado, con IVA y accesorios incluidos.',
    },
    {
      eje: 'Qué se mide',
      art17: 'El valor total de la operación, sea cual sea la forma de pago.',
      art32: 'Sólo la porción liquidada en efectivo, divisas o metales preciosos.',
    },
    {
      eje: 'Consecuencia de rebasarlo',
      art17: 'Nace la obligación de identificar o de presentar aviso.',
      art32: 'Se configura una infracción, con independencia de que el aviso se haya presentado.',
    },
    {
      eje: 'Quién responde',
      art17: 'Quien realiza la actividad vulnerable.',
      art32: 'Tanto quien paga como quien acepta el pago.',
    },
    {
      eje: 'Rango de multa',
      art17: 'Depende de la conducta concreta del art. 53.',
      art32: 'El rango más alto de la ley, con alternativa porcentual sobre el valor del acto.',
    },
  ],
  cierre:
    'Consecuencia práctica: presentar el aviso no vuelve lícito un pago en efectivo por encima del límite, y respetar el límite de efectivo no exime de presentar el aviso. Son dos controles independientes que se cumplen por separado.',
} as const;

export const PUNTOS_CLAVE_EFECTIVO: readonly string[] = [
  'La prohibición alcanza a quien paga y a quien acepta el pago, y opera aunque el efectivo se entregue por conducto de una entidad financiera.',
  'La reforma de 2025 incorporó los metales preciosos como medio de pago prohibido, además de las monedas, billetes y divisas.',
  'El reglamento aclara que la prohibición aplica tanto al pago de un acto individual, en una o varias exhibiciones, como al de un conjunto de actos cuando una sola persona aporta los recursos.',
  'En caso de cancelación o devolución, los recursos deben regresarse en la misma forma de pago y en la misma moneda.',
  'Los medios de pago distintos del efectivo y los metales siguen siendo válidos sin límite por esta vía.',
  'Los fedatarios tienen una obligación adicional: identificar la forma de pago en operaciones de valor alto y anexar el comprobante correspondiente.',
];

export const FAQ_EFECTIVO: readonly PreguntaFrecuente[] = [
  {
    pregunta: '¿El límite de efectivo incluye IVA?',
    respuesta:
      'Sí. El límite del art. 32 se mide sobre lo que efectivamente se liquida, con IVA y accesorios incluidos. Los umbrales de identificación y aviso del art. 17, en cambio, se miden sobre el valor del acto sin IVA. Comparar ambos contra la misma cifra es el error más frecuente del mercado.',
  },
  {
    pregunta: '¿Puedo cobrar una parte en efectivo y el resto con transferencia?',
    respuesta:
      'Sí, siempre que la porción liquidada en efectivo o en metales se mantenga por debajo del límite de la fracción aplicable. Lo que la ley prohíbe es liquidar en efectivo por encima del límite, no combinar medios de pago.',
  },
  {
    pregunta: '¿Y si el cliente insiste en pagar todo en efectivo?',
    respuesta:
      'No puedes aceptarlo por encima del límite. La prohibición alcanza a quien acepta el pago, no sólo a quien lo hace, y la infracción se configura aunque hayas presentado el aviso de la operación en tiempo y forma.',
  },
  {
    pregunta: '¿Dividir la operación en varios pagos resuelve el problema?',
    respuesta:
      'No. El reglamento precisa que la prohibición aplica al pago de un acto individual aunque se haga en varias exhibiciones, y al de un conjunto de actos cuando una sola persona aporta los recursos.',
  },
  {
    pregunta: '¿Recibir dólares en efectivo tiene reglas distintas?',
    respuesta:
      'No para este artículo: la prohibición menciona expresamente las divisas junto con la moneda nacional. La conversión a moneda nacional para comparar contra el límite debe quedar documentada con el tipo de cambio aplicado.',
  },
  {
    pregunta: '¿Los metales preciosos cuentan como medio de pago prohibido?',
    respuesta:
      'Sí, desde la reforma de 2025. Pagar con oro o con otro metal precioso por encima del límite recibe el mismo tratamiento que pagar con billetes.',
  },
  {
    pregunta: '¿Qué pasa si el pago se hace por consignación judicial?',
    respuesta:
      'La reforma de 2025 adicionó una fracción específica para la consignación de pago. Ahí hay una discrepancia entre lo que publica la tabla del SAT y lo que dice el texto de la ley, y por eso mostramos ambas versiones en lugar de elegir una.',
  },
  {
    pregunta: '¿Cuál es la multa por rebasar el límite?',
    respuesta:
      'Participar en operaciones prohibidas por el art. 32 está en el rango más alto del régimen sancionador, con una alternativa porcentual sobre el valor del acto cuando es cuantificable en dinero, y se aplica la cantidad que resulte mayor.',
  },
];

/** Obligación propia de los fedatarios respecto de la forma de pago. */
export const OBLIGACION_FEDATARIOS = {
  titulo: 'Los fedatarios tienen una obligación adicional',
  texto:
    'Las personas depositarias de fe pública deben identificar la forma de pago de las obligaciones cuando la operación alcanza el valor que fija el art. 33. Por debajo de ese valor, y cuando el acto ya fue pagado total o parcialmente antes de la firma, basta la declaración del cliente bajo protesta de decir verdad. En los demás casos, los actos de las fracciones II a VII del art. 32 se formalizan con el documento donde conste la operación, previa identificación de quienes intervienen y, en su caso, del beneficiario controlador, especificando la forma de pago y anexando el comprobante.',
  disposicion: 'Art. 33 LFPIORPI y art. 45 de su Reglamento',
  sancion:
    'Incumplirla es infracción del art. 53, fracción V, sancionada con el rango del art. 54, fracción II.',
} as const;
