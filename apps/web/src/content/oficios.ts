import { datos } from '@leyantilavado/rules-engine';
import type { ActividadSlug } from '@leyantilavado/types';
import type { PreguntaFrecuente } from './tipos';

/*
 * El año que llevan los títulos, tomado del corpus y no escrito a mano.
 *
 * Buscar «ley antilavado 2026» es intención de actualidad, y un título con año
 * la capta. Pero un año escrito a mano envejece: el 1 de febrero de 2027 las 17
 * páginas seguirían anunciando 2026, y un año viejo en un título es peor señal
 * que no llevarlo. Sale del valor de UMA más reciente registrado —que es
 * justamente el año al que aplican las cifras de estas páginas— así que avanza
 * solo cuando el INEGI publica el siguiente.
 */
const ANIO_VIGENTE = datos.UMA_VIGENTE_MAS_RECIENTE.anio;

/* ────────────────────────────────────────────────────────────────────────────
 * Oficios: la puerta con el nombre que la gente escribe.
 *
 * El sitio tiene una página por fracción del art. 17. Nadie busca «fracción
 * XII»: busca «notario», «casa de empeño», «lote de autos». Este archivo mapea
 * el nombre del gremio a la fracción o fracciones que puede tocar, y nada más.
 *
 * Reglas que este archivo hace cumplir:
 *
 *  · NINGUNA cifra legal vive aquí. Ni un umbral, ni una UMA, ni una multa.
 *    Los montos los lee la página del motor. Si alguien escribe un número en
 *    este archivo, está creando una segunda fuente de la verdad.
 *  · NINGUNA afirmación de que el lector «cumple». La conclusión más benigna
 *    que puede darse es «no parece aplicarte por este supuesto».
 *  · Toda afirmación jurídica lleva su artículo y su fracción en el texto, no
 *    en un comentario.
 *  · Lo que no se puede justificar NO se afirma: se plantea como pregunta que
 *    el lector responde. Para eso existe `alcance: 'segun-el-caso'`.
 *
 * Relación con `/actividades-vulnerables/[slug]`: son páginas distintas y
 * deliberadamente no compiten. La de actividad es la referencia jurídica —
 * término legal, fracción, umbral por supuesto—. Ésta es la puerta coloquial:
 * clasifica al lector en su fracción y lo manda allá. Por eso los títulos de
 * aquí nunca llevan el número de artículo y los de allá siempre lo llevan.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Una fracción que este oficio puede realizar.
 *
 * `alcance` es la diferencia entre lo que se afirma y lo que se pregunta:
 *  · `nucleo`: el oficio realiza el supuesto por definición del propio oficio.
 *    Un notario que protocoliza actos del Apartado A no es un caso particular:
 *    es lo que hace un notario.
 *  · `segun-el-caso`: sólo si el negocio hace además esa otra cosa. Aquí NO
 *    afirmamos que le aplica; describimos el supuesto para que el lector
 *    reconozca si lo realiza.
 */
export interface ActividadDeOficio {
  slug: ActividadSlug;
  alcance: 'nucleo' | 'segun-el-caso';
  /** Por qué este oficio toca esta fracción. Se imprime tal cual en la página. */
  porQue: string;
}

/**
 * Pregunta de «¿me aplica?».
 *
 * Se responde en la cabeza del lector, no en un formulario: la página no
 * guarda respuestas ni concluye por él. `siNo` jamás dice «cumples»; dice qué
 * queda descartado y qué no.
 */
export interface PreguntaAplica {
  pregunta: string;
  siSi: string;
  siNo: string;
}

export interface Oficio {
  slug: string;
  /** H1 y nombre del gremio. Lenguaje coloquial, nunca término legal. */
  titulo: string;
  /** Para migas, tarjetas y enlaces. */
  nombreCorto: string;
  /** Cómo se nombra el mismo gremio en otras partes del país o del mercado. */
  tambienBuscado: readonly string[];
  /** Título del resultado de búsqueda. Máximo 60 caracteres. Sin número de artículo. */
  tituloSEO: string;
  /** Descripción del resultado de búsqueda. Máximo 160 caracteres. */
  descripcionSEO: string;
  /** Una línea para el índice: de qué va, sin adelantar la conclusión. */
  resumen: string;
  /** El párrafo que más gente lee. Dice la fracción y por qué. */
  respuestaDirecta: string;
  /** Primero el núcleo, después lo que depende del caso. */
  actividades: readonly ActividadDeOficio[];
  preguntas: readonly PreguntaAplica[];
  /** Slug del catálogo de herramientas: la que de verdad usa este giro. */
  herramienta: string;
  /** Slug de `casos-practicos`, cuando hay uno de este gremio. */
  caso?: string;
  faq: readonly PreguntaFrecuente[];
}

export const OFICIOS: readonly Oficio[] = [
  /* ── Fe pública ─────────────────────────────────────────────────────────── */
  {
    slug: 'notarias',
    titulo: 'Ley Antilavado para notarías',
    nombreCorto: 'Notarías',
    tambienBuscado: ['notario público', 'notaría pública', 'escribano', 'fedatario público'],
    tituloSEO: `Ley Antilavado para notarías ${ANIO_VIGENTE}: los cinco supuestos`,
    descripcionSEO:
      'Qué actos del protocolo caen en el Apartado A, cuáles generan aviso sin importar el monto y con qué valor se mide cada uno.',
    resumen:
      'Cinco supuestos con regla propia dentro del mismo apartado. La pregunta útil no es si te aplica, sino cuál protocolizaste.',
    respuestaDirecta:
      'Una notaría es sujeto obligado por el artículo 17, fracción XII, Apartado A de la LFPIORPI. No tiene «un umbral»: el Apartado A enumera cinco supuestos y cada uno se mide por separado, unos con umbral en UMA y otros con aviso cualquiera que sea el monto. Por eso la pregunta que resuelve tu caso no es si la ley te alcanza —te alcanza— sino cuál de los cinco supuestos estás protocolizando.',
    actividades: [
      {
        slug: 'fe-publica-notarios',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción XII, Apartado A lista uno por uno los actos otorgados ante notario que son actividad vulnerable: derechos reales sobre inmuebles, poderes irrevocables, constitución y modificación de personas morales, fideicomisos traslativos o de garantía, y mutuos o créditos cuando el acreedor no forma parte del sistema financiero.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿El instrumento que vas a autorizar es uno de los cinco supuestos del Apartado A?',
        siSi: 'El acto entra por el artículo 17, fracción XII, Apartado A. Lo siguiente es identificar cuál de los cinco, porque cada supuesto tiene su propia regla: no todos se miden con la misma vara ni todos dependen del monto.',
        siNo: 'Ese instrumento en concreto no parece caer en el Apartado A. No dice nada del resto de tu protocolo: la clasificación es por acto, no por notaría.',
      },
      {
        pregunta: '¿Con qué valor estás midiendo el acto?',
        siSi: 'En los supuestos con umbral, la fracción XII, Apartado A no manda tomar sin más el precio pactado. Contrasta la base que estás usando contra la que describe la ficha de la fracción antes de concluir que el acto queda por debajo.',
        siNo: 'Si todavía no tienes el valor con el que se mide, no puedes descartar el aviso: un acto se descarta con el valor correcto, no con el que trae la minuta.',
      },
      {
        pregunta: '¿Este cliente ha pasado antes por tu protocolo en los últimos seis meses?',
        siSi: 'Aplica la regla antifraccionamiento del artículo 17, último párrafo: las operaciones del mismo cliente por el mismo tipo de acto se suman dentro de una ventana de seis meses, y el aviso nace en la operación con la que se alcanza el umbral.',
        siNo: 'Entonces el acto se mide solo. Conviene volver a preguntarlo la próxima vez que el mismo cliente regrese, porque la ventana corre hacia atrás.',
      },
    ],
    herramienta: 'calculadora-umbrales',
    caso: 'notaria-compraventa-inmueble-pago-mixto',
    faq: [
      {
        pregunta: '¿Una notaría tiene un solo umbral?',
        respuesta:
          'No. El artículo 17, fracción XII, Apartado A tiene cinco supuestos y cada uno lleva su regla: hay actos con umbral en UMA y actos que generan aviso cualquiera que sea el monto. Una tabla que resuma la notaría en una sola casilla está perdiendo justo la información que decide si hay aviso.',
      },
      {
        pregunta: '¿El aviso lo presenta la notaría o el cliente?',
        respuesta:
          'La obligación es del fedatario que da fe del acto, no de las partes. La fracción XII enumera los actos «otorgados ante» notario, y el sujeto obligado es quien realiza la actividad vulnerable.',
      },
      {
        pregunta: '¿Cambió algo para notarías con la reforma?',
        respuesta:
          'Sí, y de los supuestos del Apartado A es donde más se movió. La ficha de qué cambió para tu fracción trae cada cambio con su antes, su ahora y su disposición, en lugar de un resumen que hay que creer.',
      },
    ],
  },
  {
    slug: 'corredores-publicos',
    titulo: 'Ley Antilavado para corredores públicos',
    nombreCorto: 'Corredores públicos',
    tambienBuscado: ['correduría pública', 'corredor público titulado', 'fedatario mercantil'],
    tituloSEO: `Ley Antilavado para corredores públicos ${ANIO_VIGENTE}`,
    descripcionSEO:
      'Qué actos de la correduría son actividad vulnerable, cuáles avisan sin importar el monto y cuál es el único con umbral en UMA.',
    resumen:
      'Los avalúos se miden por monto; los actos corporativos, fideicomisos y mutuos mercantiles no dependen del monto.',
    respuestaDirecta:
      'Un corredor público es sujeto obligado por el artículo 17, fracción XII, Apartado B de la LFPIORPI. El Apartado B separa los avalúos —que sí tienen umbral en UMA— de los actos corporativos, los fideicomisos y los mutuos mercantiles, donde la obligación no depende del monto del acto. Saber en cuál de los dos grupos cae tu intervención resuelve la mitad de las dudas del gremio.',
    actividades: [
      {
        slug: 'fe-publica-corredores',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción XII, Apartado B lista los actos en los que interviene un corredor público: avalúos, constitución y modificación de sociedades mercantiles, fideicomisos en los que puedan actuar y mutuos o créditos mercantiles cuando el acreedor no forma parte del sistema financiero.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Tu intervención es un avalúo o un acto corporativo?',
        siSi: 'Si es avalúo, el artículo 17, fracción XII, Apartado B lo mide contra un umbral en UMA. Si es acto corporativo, fideicomiso o mutuo mercantil, la obligación no se resuelve mirando el monto.',
        siNo: 'Si tu intervención no es ninguna de las que enumera el Apartado B, ese acto no parece caer ahí. Revisa el resto de tus habilitaciones antes de darlo por cerrado.',
      },
      {
        pregunta: '¿El acreedor del mutuo forma parte del sistema financiero?',
        siSi: 'El Apartado B excluye expresamente ese supuesto: el mutuo mercantil es actividad vulnerable cuando el acreedor NO forma parte del sistema financiero.',
        siNo: 'Entonces el mutuo mercantil queda dentro del artículo 17, fracción XII, Apartado B, y el monto no es lo que decide.',
      },
    ],
    herramienta: 'calculadora-umbrales',
    caso: 'corredor-publico-avaluo-nave-industrial',
    faq: [
      {
        pregunta: '¿Los avalúos de un corredor siempre generan aviso?',
        respuesta:
          'No: el avalúo es el supuesto del Apartado B que sí se mide contra un umbral en UMA. Los que no dependen del monto son los actos corporativos, los fideicomisos y los mutuos mercantiles.',
      },
      {
        pregunta: '¿Un corredor público tiene las mismas reglas que un notario?',
        respuesta:
          'No. Son dos apartados distintos de la misma fracción: el notario está en el Apartado A y el corredor en el Apartado B, con listas de actos y reglas propias. Comparar tu caso con la tabla del notario es el error más frecuente del gremio.',
      },
      {
        pregunta: '¿Entra el fideicomiso en garantía de un crédito bancario?',
        respuesta:
          'El Apartado B exceptúa los fideicomisos constituidos para garantizar crédito a favor del sistema financiero. La excepción es del acto, no del corredor: el resto de tus fideicomisos sigue dentro.',
      },
    ],
  },

  /* ── Inmuebles ──────────────────────────────────────────────────────────── */
  {
    slug: 'inmobiliarias',
    titulo: 'Ley Antilavado para inmobiliarias y asesores',
    nombreCorto: 'Inmobiliarias',
    tambienBuscado: ['bróker inmobiliario', 'asesor inmobiliario', 'agente de bienes raíces', 'bienes raíces'],
    tituloSEO: `Ley Antilavado para inmobiliarias y asesores ${ANIO_VIGENTE}`,
    descripcionSEO:
      'Si intermedias compraventas de inmuebles eres sujeto obligado. Qué te obliga la fracción V, desde cuándo y qué expediente te piden.',
    resumen:
      'La intermediación en la compraventa de inmuebles es actividad vulnerable por sí misma, la cierres o no.',
    respuestaDirecta:
      'Una inmobiliaria o un asesor que intermedia en la transmisión de propiedad de inmuebles realiza la actividad vulnerable del artículo 17, fracción V de la LFPIORPI. Ojo con el matiz que más cuesta caro en este gremio: la fracción V distingue el umbral de identificación del umbral de aviso, y el primero es más bajo. Muchas inmobiliarias creen que están fuera porque no llegan al de aviso, cuando la obligación de integrar expediente ya nació.',
    actividades: [
      {
        slug: 'inmuebles-construccion-intermediacion',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción V nombra la prestación habitual o profesional de servicios de intermediación en la transmisión de la propiedad o constitución de derechos sobre inmuebles, cuando hay operaciones de compraventa a favor de un cliente.',
      },
      {
        slug: 'arrendamiento-inmuebles',
        alcance: 'segun-el-caso',
        porQue:
          'Si además de vender administras rentas por cuenta propia, el artículo 17, fracción XV alcanza la constitución de derechos personales de uso o goce de inmuebles y se mide sobre el valor mensual. Sólo tú sabes si lo que firmas te pone como parte de ese contrato o sólo como intermediario del dueño.',
      },
      {
        slug: 'desarrollo-inmobiliario',
        alcance: 'segun-el-caso',
        porQue:
          'Si recibes recursos destinados a un desarrollo cuya finalidad es su venta o renta —preventas, apartados que entran a tu cuenta, esquemas de coinversión—, el supuesto que te toca es el del artículo 17, fracción V Bis, adicionada en 2025, y es distinto del de intermediación.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Prestas el servicio de forma habitual o profesional?',
        siSi: 'La fracción V exige que la prestación sea habitual o profesional. Si vives de esto, la respuesta es sí aunque cierres pocas operaciones al año.',
        siNo: 'Una operación aislada sobre un inmueble propio no es lo mismo que prestar el servicio. Si es tu caso, esta fracción no parece aplicarte; el acto ante notario sigue teniendo su propia clasificación en la fracción XII.',
      },
      {
        pregunta: '¿Sabes que identificar y avisar son dos umbrales distintos?',
        siSi: 'Bien: en la fracción V el umbral de identificación es el que primero se cruza, y es el que más se pasa por alto. Que una operación no llegue al de aviso no significa que no haya expediente que integrar.',
        siNo: 'Es el punto ciego del gremio. Revisa los dos umbrales de tu fracción antes de dar por descartada una operación.',
      },
      {
        pregunta: '¿El dinero de la operación pasa por tu cuenta?',
        siSi: 'Entonces conviene revisar también la fracción V Bis: recibir recursos destinados a un desarrollo inmobiliario es un supuesto propio, adicionado en 2025, y no se agota con la intermediación.',
        siNo: 'Si sólo acercas comprador y vendedor y el dinero va directo entre ellos, tu supuesto sigue siendo el de intermediación de la fracción V.',
      },
    ],
    herramienta: 'calculadora-umbrales',
    caso: 'inmobiliaria-guadalajara-departamento-preventa',
    faq: [
      {
        pregunta: 'Si la operación se firma ante notario, ¿el aviso ya lo dio él?',
        respuesta:
          'No se traspasa. El notario avisa por su propia actividad vulnerable —la del artículo 17, fracción XII, Apartado A— y la inmobiliaria por la suya, la fracción V. Son dos sujetos obligados distintos sobre la misma operación.',
      },
      {
        pregunta: '¿Un asesor independiente que factura por comisión también entra?',
        respuesta:
          'La fracción V no distingue por tamaño ni por régimen fiscal: mira si la prestación del servicio de intermediación es habitual o profesional. Un asesor que vive de eso realiza la actividad aunque no tenga oficina ni marca.',
      },
      {
        pregunta: '¿Qué pasa si el cliente compra dos departamentos en el mismo trimestre?',
        respuesta:
          'Aplica la regla antifraccionamiento del artículo 17, último párrafo: las operaciones del mismo cliente por el mismo tipo de acto se suman en una ventana de seis meses.',
      },
    ],
  },
  {
    slug: 'constructoras',
    titulo: 'Ley Antilavado para constructoras y desarrolladoras',
    nombreCorto: 'Constructoras',
    tambienBuscado: ['desarrolladora inmobiliaria', 'promotor de vivienda', 'preventa de departamentos'],
    tituloSEO: `Ley Antilavado para constructoras y desarrolladoras ${ANIO_VIGENTE}`,
    descripcionSEO:
      'Construir y vender es la fracción V; recibir recursos para un desarrollo es la V Bis, adicionada en 2025. Cuál te toca y desde cuándo.',
    resumen:
      'Dos fracciones distintas que suelen convivir en la misma empresa: construir y vender, y captar recursos para el desarrollo.',
    respuestaDirecta:
      'Una constructora o desarrolladora puede caer en dos supuestos a la vez y no son intercambiables. El artículo 17, fracción V de la LFPIORPI alcanza la prestación habitual o profesional de servicios de construcción o desarrollo de inmuebles cuando hay compraventa a favor de un cliente. El artículo 17, fracción V Bis —adicionada por el decreto publicado el 16 de julio de 2025— alcanza la recepción de recursos destinados a un desarrollo inmobiliario cuya finalidad sea su venta o renta, que es exactamente lo que hace un esquema de preventa o de coinversión.',
    actividades: [
      {
        slug: 'inmuebles-construccion-intermediacion',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción V nombra la prestación habitual o profesional de servicios de construcción o desarrollo de inmuebles cuando hay operaciones de compraventa a favor de un cliente.',
      },
      {
        slug: 'desarrollo-inmobiliario',
        alcance: 'segun-el-caso',
        porQue:
          'El artículo 17, fracción V Bis alcanza la recepción de recursos destinados a un desarrollo inmobiliario cuya finalidad sea su venta o renta. Si tu esquema capta aportaciones antes de escriturar, revisa este supuesto además del anterior: es el más nuevo de la ley y nombra prácticas que antes no estaban nombradas.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Vendes directamente al público o sólo construyes por contrato para un tercero?',
        siSi: 'Si vendes, la fracción V te alcanza por la parte de compraventa a favor de un cliente.',
        siNo: 'Si eres contratista de obra y el desarrollo es de otro, esa parte no parece encajar en la fracción V por sí sola. Quien vende y quien capta los recursos son los que tienen que revisarse en la fracción V y en la V Bis.',
      },
      {
        pregunta: '¿Recibes aportaciones, apartados o preventas antes de escriturar?',
        siSi: 'Ése es el supuesto de la fracción V Bis: recepción de recursos destinados a un desarrollo inmobiliario. No se resuelve con la ficha de la fracción V.',
        siNo: 'Si el dinero entra hasta la escritura, tu supuesto vive en la fracción V. Vale la pena revisarlo otra vez si cambias el esquema comercial.',
      },
      {
        pregunta: '¿El comprador paga en parcialidades a lo largo de la obra?',
        siSi: 'Entonces mira la regla antifraccionamiento del artículo 17, último párrafo: las operaciones del mismo cliente por el mismo tipo de acto se suman en una ventana de seis meses, y el aviso nace en la parcialidad con la que se alcanza el umbral, no al terminar la obra.',
        siNo: 'Con pago único la medición es más simple, pero el umbral de identificación sigue siendo distinto —y más bajo— que el de aviso.',
      },
    ],
    herramienta: 'acumulacion-operaciones',
    caso: 'inmobiliaria-guadalajara-departamento-preventa',
    faq: [
      {
        pregunta: '¿La fracción V Bis es nueva?',
        respuesta:
          'Sí: se adicionó por decreto publicado en el Diario Oficial el 16 de julio de 2025. Antes, los esquemas de preventa y coinversión no estaban nombrados por su nombre en el artículo 17.',
      },
      {
        pregunta: '¿Puedo caer en las dos fracciones por el mismo proyecto?',
        respuesta:
          'Son supuestos independientes y describen conductas distintas: construir y vender, por un lado; recibir recursos destinados al desarrollo, por otro. Cada uno se mide con su propia regla y no se compensan entre sí.',
      },
      {
        pregunta: '¿Cuenta el terreno que compramos para el desarrollo?',
        respuesta:
          'Esa compraventa se protocoliza ante fedatario y tiene su propia clasificación en el artículo 17, fracción XII. La obligación del fedatario no sustituye a la tuya ni al revés.',
      },
    ],
  },
  {
    slug: 'arrendadores',
    titulo: 'Ley Antilavado si rentas locales, oficinas o naves',
    nombreCorto: 'Arrendadores',
    tambienBuscado: ['arrendamiento de locales', 'renta de oficinas', 'administradora de propiedades', 'naves industriales'],
    tituloSEO: `Ley Antilavado para arrendamiento ${ANIO_VIGENTE}`,
    descripcionSEO:
      'El arrendamiento de inmuebles es actividad vulnerable y su umbral se mide sobre la renta mensual, no sobre el contrato completo.',
    resumen:
      'El umbral se mide sobre el valor mensual, y la identificación arranca antes que el aviso.',
    respuestaDirecta:
      'Quien constituye derechos personales de uso o goce sobre bienes inmuebles realiza la actividad vulnerable del artículo 17, fracción XV de la LFPIORPI. Dos precisiones que deciden casi todos los casos del gremio: el umbral se mide sobre el valor mensual al día en que se realiza el pago, no sobre la suma del contrato, y la identificación y el aviso tienen umbrales distintos con comparadores distintos. Un contrato largo con renta modesta y uno corto con renta alta no se miden igual.',
    actividades: [
      {
        slug: 'arrendamiento-inmuebles',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción XV nombra la constitución de derechos personales de uso o goce de bienes inmuebles, con un umbral que se mide sobre el valor mensual al día en que se realiza el pago o se cumple la obligación.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Estás mirando la renta mensual o el total del contrato?',
        siSi: 'Si estás mirando la mensual, vas bien: la fracción XV mide sobre el valor mensual, no sobre el acumulado del plazo forzoso.',
        siNo: 'Sumar el contrato completo infla el resultado y hace concluir cosas que la fracción XV no dice. Vuelve a medir sobre la mensualidad.',
      },
      {
        pregunta: '¿Rentas de forma habitual o es un inmueble suelto?',
        siSi: 'La fracción XV alcanza a quien constituye estos derechos; un patrimonio en renta administrado con regularidad encaja de lleno.',
        siNo: 'Un arrendamiento aislado y ocasional puede quedar fuera del supuesto. No lo des por hecho sin revisar la ficha de la fracción, y recuerda que el umbral de identificación se cruza antes que el de aviso.',
      },
      {
        pregunta: '¿Tu inquilino es una persona moral que paga por transferencia de otra empresa?',
        siSi: 'Entonces toca preguntar por el beneficiario controlador y documentarlo en el expediente: quién paga y quién usa el inmueble pueden no ser la misma persona.',
        siNo: 'Aun con inquilino persona física, el expediente de identificación se integra cuando se cruza el umbral de identificación de la fracción XV.',
      },
    ],
    herramienta: 'calculadora-umbrales',
    caso: 'arrendamiento-local-comercial-renta-mensual',
    faq: [
      {
        pregunta: '¿Cuenta el depósito en garantía dentro del monto mensual?',
        respuesta:
          'La fracción XV mide el valor mensual del uso o goce al día en que se realiza el pago. El tratamiento de conceptos accesorios conviene revisarlo con la ficha de la fracción y, si tu contrato los mezcla, con revisión profesional: la respuesta cambia según cómo esté redactado el contrato.',
      },
      {
        pregunta: '¿Aplica igual a casa habitación que a local comercial?',
        respuesta:
          'La fracción XV habla de bienes inmuebles sin distinguir el uso. Lo que cambia el resultado es el valor mensual y la habitualidad, no la etiqueta del inmueble.',
      },
      {
        pregunta: 'Si administro rentas de terceros, ¿quién es el sujeto obligado?',
        respuesta:
          'Depende de quién constituye el derecho de uso o goce en el contrato. Si tú firmas como arrendador, el supuesto de la fracción XV es tuyo; si sólo administras por cuenta del propietario, revisa además si estás prestando un servicio profesional de los del artículo 17, fracción XI.',
      },
    ],
  },

  /* ── Comercio de bienes de alto valor ───────────────────────────────────── */
  {
    slug: 'joyerias',
    titulo: 'Ley Antilavado para joyerías y compra-oro',
    nombreCorto: 'Joyerías',
    tambienBuscado: ['compra de oro', 'relojería de lujo', 'compraventa de plata', 'joyero'],
    tituloSEO: `Ley Antilavado para joyerías y compra-oro ${ANIO_VIGENTE}`,
    descripcionSEO:
      'Vender o comprar metales, piedras, joyas y relojes es actividad vulnerable con independencia de la forma de pago. Qué te toca hacer.',
    resumen:
      'La forma de pago no cambia la obligación de avisar, pero el efectivo trae su propia prohibición aparte.',
    respuestaDirecta:
      'La comercialización o intermediación habitual o profesional de metales preciosos, piedras preciosas, joyas o relojes es la actividad vulnerable del artículo 17, fracción VI de la LFPIORPI, y es objeto de aviso con independencia de la forma de pago. Eso separa dos preguntas que en el mostrador se confunden todo el tiempo: si la venta genera aviso —fracción VI— y si el efectivo que recibiste cabe dentro del límite del artículo 32, que es una prohibición distinta y se mide aparte.',
    actividades: [
      {
        slug: 'metales-joyeria',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción VI nombra la comercialización o intermediación habitual o profesional de metales preciosos, piedras preciosas, joyas o relojes, y precisa que es objeto de aviso con independencia de la forma de pago.',
      },
      {
        slug: 'comercio-exterior',
        alcance: 'segun-el-caso',
        porQue:
          'Si importas o exportas la mercancía, el artículo 17, fracción XIV tiene un inciso propio para joyas, relojes, piedras y metales preciosos, y ahí el umbral se mide por el valor individual del bien, no por el pedimento completo. Es un supuesto que se suma al de la fracción VI, no que lo reemplaza.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Compras piezas al público, además de vender?',
        siSi: 'La fracción VI habla de comercialización sin distinguir la dirección de la operación: la compra de oro al público también es comercialización de metales preciosos.',
        siNo: 'Aunque sólo vendas, la fracción VI ya te alcanza. Y si algún día abres la ventanilla de compra, el supuesto no cambia de fracción.',
      },
      {
        pregunta: '¿Estás separando el aviso del límite de efectivo?',
        siSi: 'Correcto: el umbral de aviso vive en el artículo 17, fracción VI y la prohibición de recibir efectivo por encima de cierto límite vive en el artículo 32. Rebasar el límite del 32 es una infracción por sí sola aunque el aviso se haya presentado en tiempo.',
        siNo: 'Es el error más caro del mostrador. Son dos preguntas independientes y se responden por separado; además el límite del artículo 32 se mide con IVA incluido y los umbrales del artículo 17 sin IVA.',
      },
      {
        pregunta: '¿El mismo cliente ha vuelto en los últimos seis meses?',
        siSi: 'Aplica la regla antifraccionamiento del artículo 17, último párrafo: las operaciones del mismo cliente por el mismo tipo de acto se suman en una ventana de seis meses. Sin una base consolidada por cliente, revisar tickets a mano no escala.',
        siNo: 'Entonces la venta se mide sola, pero conviene tener el registro por cliente listo para la próxima.',
      },
    ],
    herramienta: 'limites-efectivo',
    caso: 'joyeria-venta-lote-relojes-mostrador',
    faq: [
      {
        pregunta: 'Si el cliente paga con tarjeta, ¿ya no tengo que avisar?',
        respuesta:
          'La fracción VI es objeto de aviso con independencia de la forma de pago. Pagar con tarjeta cambia la conversación sobre el límite de efectivo del artículo 32, no la del aviso.',
      },
      {
        pregunta: '¿Cuenta la plata y la bisutería fina?',
        respuesta:
          'La fracción VI nombra metales preciosos, piedras preciosas, joyas y relojes. Si tu mercancía no es ninguno de esos, el supuesto no parece alcanzarte; revisa la ficha de la fracción antes de decidirlo por el precio de la pieza.',
      },
      {
        pregunta: '¿Y si vendo en línea o por redes sociales?',
        respuesta:
          'La fracción VI mira la comercialización habitual o profesional, no el canal. Vender por internet no saca la operación del supuesto.',
      },
    ],
  },
  {
    slug: 'galerias-de-arte',
    titulo: 'Ley Antilavado para galerías y casas de subasta',
    nombreCorto: 'Galerías de arte',
    tambienBuscado: ['casa de subastas', 'marchante de arte', 'venta de obra plástica'],
    tituloSEO: `Ley Antilavado para galerías y casas de subasta ${ANIO_VIGENTE}`,
    descripcionSEO:
      'La subasta y comercialización de obras de arte es actividad vulnerable cuando alcanza el monto de la ley. Qué se identifica y qué se avisa.',
    resumen:
      'El supuesto mira la obra y su monto; representar al artista no saca la venta del artículo 17.',
    respuestaDirecta:
      'La subasta o comercialización habitual o profesional de obras de arte es la actividad vulnerable del artículo 17, fracción VII de la LFPIORPI, y opera cuando la operación alcanza el monto previsto por la ley. Para una galería eso significa medir obra por obra y no por exposición, y llevar el expediente del comprador —y del consignante cuando la obra no es tuya— desde el umbral de identificación, que se cruza antes que el de aviso.',
    actividades: [
      {
        slug: 'obras-arte',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción VII nombra la subasta o comercialización habitual o profesional de obras de arte cuando la operación alcanza el monto previsto por la ley.',
      },
      {
        slug: 'comercio-exterior',
        alcance: 'segun-el-caso',
        porQue:
          'Si la obra cruza la frontera, el artículo 17, fracción XIV tiene un inciso propio para obras de arte y el umbral se mide por el valor individual del bien. Es un supuesto adicional al de la fracción VII.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿La obra es tuya o la vendes en consignación?',
        siSi: 'Si es tuya, la comercialización de la fracción VII es directa. Si es en consignación, sigues comercializando: la fracción VII no exige ser propietario.',
        siNo: 'Si sólo prestas el espacio y no intervienes en la venta, revisa la ficha de la fracción antes de concluir; lo que mira el supuesto es quién comercializa o subasta.',
      },
      {
        pregunta: '¿Estás midiendo por obra o por la venta completa a un coleccionista?',
        siSi: 'La medición por obra es el punto de partida, pero si el mismo cliente compra varias piezas conviene revisar la regla antifraccionamiento del artículo 17, último párrafo, que suma operaciones del mismo cliente en una ventana de seis meses.',
        siNo: 'Sumar sin criterio o separar sin criterio llevan al mismo sitio: un resultado que no se puede defender. Mide obra por obra y después revisa la acumulación.',
      },
    ],
    herramienta: 'calculadora-umbrales',
    caso: 'galeria-venta-obra-arte-artista-emergente',
    faq: [
      {
        pregunta: '¿Aplica a arte de artistas emergentes con precios bajos?',
        respuesta:
          'La fracción VII opera cuando la operación alcanza el monto previsto por la ley. Debajo de ese monto no nace la obligación de aviso, lo que no significa que la galería quede fuera del artículo 17: la actividad sigue siendo vulnerable y el umbral de identificación es más bajo que el de aviso.',
      },
      {
        pregunta: '¿Y las ferias de arte?',
        respuesta:
          'El supuesto mira la comercialización o subasta habitual o profesional, no el lugar donde ocurre. Vender en una feria no cambia la fracción.',
      },
      {
        pregunta: '¿Tengo que identificar al artista o sólo al comprador?',
        respuesta:
          'El expediente se integra respecto del cliente de la operación. Cuando la obra viene en consignación, quien te la entrega también participa en la operación: documenta a ambos y guarda el respaldo.',
      },
    ],
  },
  {
    slug: 'agencias-de-autos',
    titulo: 'Ley Antilavado para agencias y lotes de autos',
    nombreCorto: 'Agencias de autos',
    tambienBuscado: ['lote de autos usados', 'distribuidora automotriz', 'venta de seminuevos', 'compraventa de motos'],
    tituloSEO: `Ley Antilavado para agencias y lotes de autos ${ANIO_VIGENTE}`,
    descripcionSEO:
      'Vender vehículos nuevos o usados es actividad vulnerable. Cuándo avisas, qué límite tiene el efectivo del enganche y qué expediente te piden.',
    resumen:
      'Nuevos o usados, terrestres o no: lo que decide es la habitualidad, no el tamaño del lote.',
    respuestaDirecta:
      'La distribución y comercialización de vehículos —nuevos o usados, terrestres, marítimos o aéreos— es la actividad vulnerable del artículo 17, fracción VIII de la LFPIORPI, y sólo lo es cuando se realiza de forma habitual o profesional. Un lote de cinco unidades y una distribuidora de marca están en la misma fracción. Aparte del aviso, el enganche en efectivo tiene su propio límite en el artículo 32, que se mide con IVA incluido y es una prohibición independiente.',
    actividades: [
      {
        slug: 'vehiculos',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción VIII nombra la distribución y comercialización habitual o profesional de todo tipo de vehículos, nuevos o usados, sean terrestres, marítimos o aéreos.',
      },
      {
        slug: 'prestamos-creditos',
        alcance: 'segun-el-caso',
        porQue:
          'Si además financias con recursos propios en lugar de canalizar al cliente a un banco, el ofrecimiento habitual o profesional de crédito por quien no es entidad financiera es el supuesto del artículo 17, fracción IV, y tiene su propia regla.',
      },
      {
        slug: 'comercio-exterior',
        alcance: 'segun-el-caso',
        porQue:
          'Si importas las unidades, el artículo 17, fracción XIV tiene un inciso para vehículos terrestres, aéreos y marítimos, nuevos y usados, cualquiera que sea su valor. Ese supuesto corresponde a quien presta el servicio de comercio exterior.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Vendes de forma habitual o profesional?',
        siSi: 'La fracción VIII te alcanza. No hay piso de tamaño: un lote pequeño realiza la misma actividad vulnerable que una agencia de marca.',
        siNo: 'Vender tu coche particular una vez no es comercialización habitual. Si vendes varias unidades al año con ánimo de lucro, la respuesta se acerca al sí y conviene revisarla en serio.',
      },
      {
        pregunta: '¿Recibes parte del pago en efectivo?',
        siSi: 'Entonces tienes dos preguntas separadas: si la venta genera aviso por la fracción VIII y si el efectivo recibido cabe en el límite del artículo 32. Rebasar el límite es infracción aunque el aviso se haya presentado.',
        siNo: 'Aun así el aviso puede proceder: la fracción VIII se mide por el monto de la operación, no por el medio de pago.',
      },
      {
        pregunta: '¿Quién queda como propietario en la factura?',
        siSi: 'Si el que paga no es el que aparece como propietario, toca preguntar por el beneficiario controlador y dejarlo documentado en el expediente antes de entregar la unidad.',
        siNo: 'Cuando comprador y propietario coinciden, el expediente es más simple, pero se integra igual desde el umbral de identificación.',
      },
    ],
    herramienta: 'limites-efectivo',
    caso: 'agencia-vehiculos-camioneta-seminueva-efectivo',
    faq: [
      {
        pregunta: '¿Los autos usados cuentan igual que los nuevos?',
        respuesta:
          'Sí. La fracción VIII habla de todo tipo de vehículos, nuevos o usados, sin distinguir.',
      },
      {
        pregunta: '¿Y las motocicletas, lanchas o avionetas?',
        respuesta:
          'La fracción VIII nombra vehículos terrestres, marítimos y aéreos. El supuesto no se limita a los automóviles.',
      },
      {
        pregunta: 'Si el cliente paga con crédito de un banco, ¿sigo obligado?',
        respuesta:
          'Sí. La obligación nace de que tú realizas la actividad vulnerable de la fracción VIII. Que el dinero venga de una institución financiera no traslada tu obligación a ella.',
      },
    ],
  },

  {
    slug: 'blindadoras',
    titulo: 'Ley Antilavado para talleres de blindaje',
    nombreCorto: 'Blindaje',
    tambienBuscado: ['blindaje de autos', 'blindaje arquitectónico', 'blindaje de casas', 'nivel de blindaje'],
    tituloSEO: `Ley Antilavado para talleres de blindaje ${ANIO_VIGENTE}`,
    descripcionSEO:
      'Blindar vehículos o inmuebles de forma habitual es actividad vulnerable. Qué se identifica, qué se avisa y qué pasa si importas el material.',
    resumen:
      'El servicio de blindaje tiene su propia fracción; el material balístico importado tiene otra.',
    respuestaDirecta:
      'La prestación habitual o profesional de servicios de blindaje de vehículos terrestres o de bienes inmuebles es la actividad vulnerable del artículo 17, fracción IX de la LFPIORPI. El servicio y el material no van por el mismo camino: si además importas materiales de resistencia balística, ése es un inciso del artículo 17, fracción XIV, que corresponde a quien presta el servicio de comercio exterior y opera cualquiera que sea el valor de los bienes.',
    actividades: [
      {
        slug: 'blindaje',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción IX nombra la prestación habitual o profesional de servicios de blindaje de vehículos terrestres o de bienes inmuebles.',
      },
      {
        slug: 'comercio-exterior',
        alcance: 'segun-el-caso',
        porQue:
          'El artículo 17, fracción XIV incluye un inciso para materiales de resistencia balística destinados al blindaje de vehículos, cualquiera que sea su valor. Ese supuesto es de quien presta el servicio de comercio exterior sobre la mercancía; revisa quién lo hace en tu operación.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Prestas el servicio de blindaje o sólo vendes el vehículo ya blindado?',
        siSi: 'Prestar el servicio de forma habitual o profesional es el supuesto de la fracción IX.',
        siNo: 'Vender un vehículo blindado es comercialización de vehículos, que es el supuesto del artículo 17, fracción VIII, con su propia regla. No son intercambiables.',
      },
      {
        pregunta: '¿Blindas también inmuebles?',
        siSi: 'La fracción IX nombra el blindaje de vehículos terrestres y el de bienes inmuebles en el mismo supuesto: la obra en una casa o en una sucursal entra igual que el auto.',
        siNo: 'Aunque sólo hagas automotriz, la fracción IX ya te alcanza.',
      },
      {
        pregunta: '¿Quién importa el material balístico?',
        siSi: 'Si el servicio de comercio exterior lo prestas tú, revisa el inciso de materiales de resistencia balística del artículo 17, fracción XIV, que opera cualquiera que sea el valor.',
        siNo: 'Si la importación la hace tu proveedor o su agencia aduanal, ese supuesto es de ellos. El tuyo sigue siendo el de la fracción IX.',
      },
    ],
    herramienta: 'calculadora-umbrales',
    faq: [
      {
        pregunta: '¿El blindaje de una casa cuenta igual que el de un auto?',
        respuesta:
          'La fracción IX nombra los dos: vehículos terrestres y bienes inmuebles. El supuesto es el mismo servicio de blindaje.',
      },
      {
        pregunta: 'Si el cliente paga el blindaje en efectivo, ¿qué reviso?',
        respuesta:
          'Dos cosas por separado: si la operación genera aviso por la fracción IX y si el efectivo cabe en el límite del artículo 32, que es una prohibición independiente y se mide con IVA incluido.',
      },
      {
        pregunta: '¿Y si el vehículo es de una empresa de seguridad privada?',
        respuesta:
          'El cliente no cambia la fracción. Lo que cambia con un cliente persona moral es el expediente: hay que documentar además al beneficiario controlador.',
      },
    ],
  },

  /* ── Dinero y crédito ───────────────────────────────────────────────────── */
  {
    slug: 'casas-de-empeno',
    titulo: 'Ley Antilavado para casas de empeño',
    nombreCorto: 'Casas de empeño',
    tambienBuscado: ['montepío', 'prestamista prendario', 'préstamo con garantía'],
    tituloSEO: `Ley Antilavado para casas de empeño ${ANIO_VIGENTE}`,
    descripcionSEO:
      'Prestar con garantía sin ser entidad financiera es la fracción IV. Y si vendes la prenda no rescatada, revisa además la fracción VI.',
    resumen:
      'El préstamo es una fracción; vender la prenda no rescatada puede ser otra distinta.',
    respuestaDirecta:
      'Una casa de empeño realiza la actividad vulnerable del artículo 17, fracción IV de la LFPIORPI: el ofrecimiento habitual o profesional de operaciones de mutuo, garantía, préstamo o crédito, con o sin garantía, por parte de quien no es entidad financiera. Hay un segundo frente que el gremio suele pasar por alto: si además comercializas de forma habitual las prendas no rescatadas —oro, joyas, relojes—, esa venta cae en el supuesto del artículo 17, fracción VI, que tiene su propia regla.',
    actividades: [
      {
        slug: 'prestamos-creditos',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción IV nombra el ofrecimiento habitual o profesional de operaciones de mutuo, garantía, préstamo o crédito, con o sin garantía, por quien no es entidad financiera.',
      },
      {
        slug: 'metales-joyeria',
        alcance: 'segun-el-caso',
        porQue:
          'Si vendes de forma habitual las prendas no rescatadas y son metales preciosos, piedras, joyas o relojes, esa comercialización es la actividad del artículo 17, fracción VI, que es objeto de aviso con independencia de la forma de pago. Sólo tú sabes si esa venta es habitual en tu operación.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Eres entidad financiera regulada?',
        siSi: 'La fracción IV está escrita para quien NO forma parte del sistema financiero. Si estás regulado, tu régimen de prevención es otro y no es el del artículo 17.',
        siNo: 'Entonces el ofrecimiento habitual de préstamo o crédito es la actividad vulnerable de la fracción IV, con o sin garantía prendaria.',
      },
      {
        pregunta: '¿Vendes la prenda cuando el cliente no la rescata?',
        siSi: 'Revisa la fracción VI además de la IV: comercializar joyas, relojes o metales preciosos de forma habitual es una actividad vulnerable por sí misma, y no se agota con el aviso del préstamo.',
        siNo: 'Si devuelves o rematas por otra vía, quédate con la fracción IV. Vale la pena volver a preguntarlo si cambias la política de remate.',
      },
      {
        pregunta: '¿El mismo cliente empeña varias veces al mes?',
        siSi: 'Aplica la regla antifraccionamiento del artículo 17, último párrafo: seis meses de operaciones del mismo cliente por el mismo tipo de acto se suman, y el aviso nace en la operación con la que se cruza el umbral.',
        siNo: 'Aun así conviene tener el histórico por cliente disponible: la ventana corre hacia atrás y no avisa.',
      },
    ],
    herramienta: 'acumulacion-operaciones',
    caso: 'prestamo-particular-firmado-en-enero',
    faq: [
      {
        pregunta: '¿El umbral se mide sobre el préstamo o sobre el avalúo de la prenda?',
        respuesta:
          'La fracción IV mira la operación de mutuo, préstamo o crédito. Revisa la ficha de la fracción para ver cómo se expresa su umbral antes de medir contra el valor de la prenda.',
      },
      {
        pregunta: '¿Los intereses cuentan dentro del monto?',
        respuesta:
          'Es una pregunta de integración de la base, y la respuesta depende de cómo esté documentado tu contrato. La ficha de la fracción trae la disposición aplicable; si tu esquema mezcla capital, intereses y almacenaje, exige revisión profesional en lugar de decidirlo por analogía.',
      },
      {
        pregunta: '¿Un prestamista particular que no tiene sucursal también entra?',
        respuesta:
          'La fracción IV no mira el local ni la marca: mira si el ofrecimiento de préstamo o crédito es habitual o profesional y si quien lo hace no es entidad financiera.',
      },
    ],
  },
  {
    slug: 'plataformas-activos-virtuales',
    titulo: 'Ley Antilavado para plataformas de activos virtuales',
    nombreCorto: 'Activos virtuales',
    tambienBuscado: ['exchange de criptomonedas', 'compraventa de bitcoin', 'cajero de criptomonedas', 'P2P de cripto'],
    tituloSEO: `Ley Antilavado para plataformas de cripto ${ANIO_VIGENTE}`,
    descripcionSEO:
      'El intercambio de activos virtuales tiene dos disparadores independientes: el monto de la operación y la comisión cobrada por el servicio.',
    resumen:
      'Dos disparadores independientes: basta con que uno se alcance para que nazca la obligación.',
    respuestaDirecta:
      'El ofrecimiento habitual y profesional de intercambio de activos virtuales por sujetos distintos de las entidades financieras, a través de plataformas electrónicas, es la actividad vulnerable del artículo 17, fracción XVI de la LFPIORPI. Tiene una particularidad que no comparte ninguna otra fracción: dos disparadores independientes —el monto de la operación y la contraprestación cobrada por el servicio—, y basta con que uno se alcance. La fracción alcanza además operaciones realizadas con personas mexicanas desde otra jurisdicción.',
    actividades: [
      {
        slug: 'activos-virtuales',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción XVI nombra el ofrecimiento habitual y profesional de intercambio de activos virtuales a través de plataformas electrónicas por quien no es entidad financiera, con dos supuestos con regla propia: el monto de la operación y la contraprestación cobrada.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Estás mirando sólo el monto intercambiado?',
        siSi: 'Falta la mitad: la fracción XVI tiene un segundo disparador independiente en la contraprestación cobrada por el servicio. Una operación puede quedar por debajo del umbral de monto y aun así cruzar el de comisión.',
        siNo: 'Bien. Los dos supuestos se evalúan por separado y ninguno absorbe al otro.',
      },
      {
        pregunta: '¿Estás constituido como entidad financiera o como institución de tecnología financiera?',
        siSi: 'La fracción XVI está escrita para sujetos distintos de las entidades financieras. Si estás regulado, tu régimen de prevención es otro.',
        siNo: 'Entonces el supuesto de la fracción XVI es el que te corresponde, incluso si la plataforma opera desde el extranjero: la fracción alcanza operaciones realizadas con personas mexicanas desde otra jurisdicción.',
      },
      {
        pregunta: '¿Tu volumen de operaciones cabe en una revisión manual?',
        siSi: 'Aun así conviene automatizar: la regla antifraccionamiento del artículo 17, último párrafo, obliga a consolidar por cliente en una ventana de seis meses, y eso no se sostiene revisando registros a mano.',
        siNo: 'Es lo habitual en este giro. La evaluación por lote de operaciones existe justo para eso.',
      },
    ],
    herramienta: 'importar-operaciones',
    caso: 'plataforma-activos-virtuales-comision-cobrada',
    faq: [
      {
        pregunta: '¿Aplica a una plataforma constituida en el extranjero?',
        respuesta:
          'La fracción XVI alcanza también las operaciones realizadas con personas mexicanas desde otra jurisdicción. Estar constituido fuera no coloca la operación fuera del supuesto.',
      },
      {
        pregunta: '¿Y el intercambio entre particulares por mensajería?',
        respuesta:
          'El supuesto mira el ofrecimiento habitual y profesional a través de plataformas electrónicas. Un intercambio aislado entre dos particulares no es lo mismo que ofrecer el servicio; si lo ofreces de forma habitual, el canal informal no te saca de la fracción XVI.',
      },
      {
        pregunta: '¿Cuál de los dos disparadores manda?',
        respuesta:
          'Ninguno manda sobre el otro: son independientes y basta con que uno se alcance para que nazca la obligación de la fracción XVI.',
      },
    ],
  },

  /* ── Servicios profesionales ────────────────────────────────────────────── */
  {
    slug: 'contadores',
    titulo: 'Ley Antilavado para contadores y despachos',
    nombreCorto: 'Contadores',
    tambienBuscado: ['despacho contable', 'contador público independiente', 'outsourcing contable'],
    tituloSEO: `Ley Antilavado para contadores y despachos ${ANIO_VIGENTE}`,
    descripcionSEO:
      'El aviso de la fracción XI no depende del monto: depende de si realizas la operación en nombre y representación de tu cliente.',
    resumen:
      'No hay umbral que memorizar: lo que decide es si actúas en nombre y representación del cliente.',
    respuestaDirecta:
      'Un contador independiente puede ser sujeto obligado por el artículo 17, fracción XI de la LFPIORPI, que alcanza la prestación de servicios profesionales de manera independiente, sin relación laboral, cuando se preparan o realizan para un cliente ciertos actos: compraventa de inmuebles, administración de recursos, manejo de cuentas, organización de aportaciones de capital y constitución o administración de personas morales. La clave del gremio es que el aviso no se dispara por un monto: procede cuando el profesional realiza, en nombre y representación del cliente, la operación financiera relacionada con el acto.',
    actividades: [
      {
        slug: 'servicios-profesionales',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción XI enumera cinco supuestos de servicios profesionales independientes, y la contabilidad y consultoría de un despacho toca varios de ellos con frecuencia: administración y manejo de recursos, manejo de cuentas, organización de aportaciones de capital y constitución o administración de personas morales.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Prestas el servicio sin relación laboral con el cliente?',
        siSi: 'La fracción XI exige que el servicio sea independiente y sin relación laboral. Un despacho externo cumple esa condición del supuesto.',
        siNo: 'Un contador de nómina dentro de la empresa no presta un servicio profesional independiente: ese supuesto de la fracción XI no parece alcanzarle. La empresa puede seguir siendo sujeto obligado por su propia actividad.',
      },
      {
        pregunta: '¿Realizas la operación en nombre y representación del cliente, o sólo lo asesoras?',
        siSi: 'Ése es el disparador del aviso en la fracción XI: no un monto, sino actuar en nombre y representación del cliente en la operación financiera relacionada con el acto.',
        siNo: 'Asesorar y opinar no es lo mismo que ejecutar por cuenta del cliente. Si sólo asesoras, ese aviso en concreto no parece proceder; la obligación de identificar cuando el acto entra en la fracción XI se revisa aparte.',
      },
      {
        pregunta: '¿Alguno de los actos que preparas está en la lista de los cinco supuestos?',
        siSi: 'Entonces el acto entra en la fracción XI y hay que revisarlo supuesto por supuesto: cada uno describe una conducta distinta.',
        siNo: 'La contabilidad ordinaria, la declaración anual o una auditoría no aparecen en esos cinco supuestos. Que un servicio quede fuera no saca de la fracción XI a los demás servicios del despacho.',
      },
    ],
    herramienta: 'checklist-expediente',
    caso: 'despacho-contable-constitucion-sociedad-en-representacion',
    faq: [
      {
        pregunta: '¿Un contador tiene que avisar de todos sus clientes?',
        respuesta:
          'No. La fracción XI se activa por acto, no por cartera: hay que mirar si el servicio prestado es uno de los cinco supuestos y si lo realizaste en nombre y representación del cliente.',
      },
      {
        pregunta: '¿Llevar la contabilidad de una empresa me hace sujeto obligado?',
        respuesta:
          'La contabilidad ordinaria no aparece entre los cinco supuestos de la fracción XI. Lo que sí aparece es administrar o manejar recursos y activos del cliente, manejar sus cuentas u organizar aportaciones de capital.',
      },
      {
        pregunta: '¿Y si constituyo la sociedad de un cliente ante notario?',
        respuesta:
          'Si tú realizas la operación en nombre y representación del cliente, el supuesto de la fracción XI es tuyo; el notario responde por el suyo, en la fracción XII, Apartado A. Son dos sujetos obligados sobre el mismo acto.',
      },
    ],
  },
  {
    slug: 'abogados',
    titulo: 'Ley Antilavado para abogados',
    nombreCorto: 'Abogados',
    tambienBuscado: ['despacho jurídico', 'abogado corporativo', 'fiscalista', 'consultor legal'],
    tituloSEO: `Ley Antilavado para abogados ${ANIO_VIGENTE}: cuándo te toca`,
    descripcionSEO:
      'La fracción XI alcanza cinco actos concretos y preserva el secreto profesional. Cuándo nace el aviso y cuándo no, con su fundamento.',
    resumen:
      'Cinco actos concretos, un disparador que no es el monto, y una salvaguarda expresa del secreto profesional.',
    respuestaDirecta:
      'Un abogado puede ser sujeto obligado por el artículo 17, fracción XI de la LFPIORPI cuando presta servicios profesionales de manera independiente y prepara o realiza para un cliente alguno de los cinco actos que la fracción enumera. Dos cosas que el gremio necesita ver juntas: el aviso no depende de un monto, sino de que el profesional realice la operación financiera en nombre y representación del cliente; y la propia ley preserva el secreto profesional y la garantía de defensa, de modo que la obligación no convierte al abogado en informante de todo lo que sabe.',
    actividades: [
      {
        slug: 'servicios-profesionales',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción XI enumera la compraventa de inmuebles o cesión de derechos, la administración y manejo de recursos y activos, el manejo de cuentas bancarias o de valores, la organización de aportaciones de capital y la constitución, escisión, fusión, operación y administración de personas morales o vehículos corporativos, incluido el fideicomiso.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Estás litigando o estás ejecutando una operación por cuenta del cliente?',
        siSi: 'Si ejecutas la operación financiera en nombre y representación del cliente, ése es el disparador del aviso en la fracción XI.',
        siNo: 'La defensa y la representación en juicio están protegidas: la fracción XI preserva el secreto profesional y la garantía de defensa. Ese trabajo no parece caer en el supuesto por sí mismo.',
      },
      {
        pregunta: '¿El acto que preparas es uno de los cinco de la fracción XI?',
        siSi: 'Entonces revisa el supuesto concreto: cada uno describe una conducta distinta y no se resuelven con la misma respuesta.',
        siNo: 'Redactar un contrato o dar una opinión legal fuera de esos cinco actos no encaja en el supuesto. Eso no cierra la puerta a los demás asuntos del despacho.',
      },
      {
        pregunta: '¿Manejas cuentas o recursos de tu cliente?',
        siSi: 'Administrar y manejar recursos, valores o activos del cliente, y manejar sus cuentas bancarias, de ahorro o de valores, son dos de los cinco supuestos de la fracción XI, escritos por separado.',
        siNo: 'Si el dinero nunca pasa por ti ni por tu cuenta, esos dos supuestos no parecen alcanzarte. Los otros tres se revisan igual.',
      },
    ],
    herramienta: 'cuestionario',
    caso: 'despacho-contable-constitucion-sociedad-en-representacion',
    faq: [
      {
        pregunta: '¿El aviso rompe el secreto profesional?',
        respuesta:
          'La propia fracción XI preserva el secreto profesional y la garantía de defensa. El supuesto no está escrito para que el abogado reporte lo que su cliente le confía, sino para los actos en que el profesional realiza la operación financiera en su nombre y representación.',
      },
      {
        pregunta: '¿Un abogado litigante es sujeto obligado?',
        respuesta:
          'El litigio no está entre los cinco actos que enumera la fracción XI. Lo que la fracción mira son operaciones patrimoniales concretas preparadas o realizadas para el cliente.',
      },
      {
        pregunta: '¿Y si constituyo un fideicomiso para un cliente?',
        respuesta:
          'La constitución, operación y administración de personas morales o vehículos corporativos, incluido el fideicomiso, es uno de los cinco supuestos de la fracción XI.',
      },
    ],
  },

  /* ── Tercer sector, aduanas, valores y sorteos ──────────────────────────── */
  {
    slug: 'donatarias',
    titulo: 'Ley Antilavado para donatarias y asociaciones civiles',
    nombreCorto: 'Donatarias',
    tambienBuscado: ['asociación civil', 'fundación', 'institución de asistencia privada', 'ONG'],
    tituloSEO: `Ley Antilavado para donatarias y asociaciones ${ANIO_VIGENTE}`,
    descripcionSEO:
      'Recibir donativos es actividad vulnerable cuando alcanzan el monto de la ley. Qué identificas del donante y qué se acumula.',
    resumen:
      'La obligación mira el donativo recibido, no el objeto social ni la autorización fiscal.',
    respuestaDirecta:
      'La recepción de donativos por asociaciones y sociedades sin fines de lucro es la actividad vulnerable del artículo 17, fracción XIII de la LFPIORPI, cuando alcanzan los montos previstos por la ley. Dos aclaraciones que ahorran discusiones en el patronato: la obligación nace del donativo recibido, no de tener o no autorización como donataria ante el SAT, y varios donativos del mismo donante se miran juntos por la regla antifraccionamiento del artículo 17, último párrafo.',
    actividades: [
      {
        slug: 'donativos',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción XIII nombra la recepción de donativos por parte de asociaciones y sociedades sin fines de lucro cuando alcanzan los montos previstos por la ley.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Recibes donativos de un mismo donante varias veces al año?',
        siSi: 'Aplica la regla antifraccionamiento del artículo 17, último párrafo: las operaciones del mismo cliente por el mismo tipo de acto se suman en una ventana de seis meses. Doce aportaciones mensuales no son doce operaciones sueltas.',
        siNo: 'Entonces cada donativo se mide solo. Conviene llevar el consolidado por donante de todas formas: la ventana corre hacia atrás.',
      },
      {
        pregunta: '¿Sabes quién está detrás del donativo?',
        siSi: 'Bien. Cuando el donante es una persona moral, toca preguntar por el beneficiario controlador y dejarlo documentado.',
        siNo: 'Un donativo anónimo o de origen no identificable es justo lo que el expediente de identificación existe para evitar. No lo registres como resuelto sin el respaldo.',
      },
      {
        pregunta: '¿Recibes donativos en especie o en efectivo?',
        siSi: 'El efectivo tiene además el límite del artículo 32, que es una prohibición independiente del aviso y se mide aparte.',
        siNo: 'Si todo entra por transferencia, sigue vigente la pregunta del aviso: la fracción XIII se mide por el monto recibido.',
      },
    ],
    herramienta: 'acumulacion-operaciones',
    caso: 'asociacion-civil-donativo-anual-empresa',
    faq: [
      {
        pregunta: '¿Aplica aunque no seamos donataria autorizada por el SAT?',
        respuesta:
          'La fracción XIII habla de asociaciones y sociedades sin fines de lucro que reciben donativos. La autorización fiscal para expedir recibos deducibles es otra cosa y no es lo que activa el supuesto.',
      },
      {
        pregunta: '¿Los donativos de una empresa cuentan distinto que los de una persona?',
        respuesta:
          'El supuesto mira el donativo recibido y su monto. Lo que cambia con un donante persona moral es el expediente: hay que documentar además al beneficiario controlador.',
      },
      {
        pregunta: '¿Y las cuotas de los socios?',
        respuesta:
          'Una cuota de membresía y un donativo no son lo mismo, y la diferencia está en el título por el que entra el recurso. Si en tu asociación se mezclan, exige revisión profesional antes de decidir que quedan fuera de la fracción XIII.',
      },
    ],
  },
  {
    slug: 'agentes-aduanales',
    titulo: 'Ley Antilavado para agencias aduanales',
    nombreCorto: 'Agencias aduanales',
    tambienBuscado: ['agente aduanal', 'apoderado aduanal', 'despacho aduanero'],
    tituloSEO: `Ley Antilavado para agencias aduanales ${ANIO_VIGENTE}`,
    descripcionSEO:
      'Seis incisos y no todos se miden igual: cuatro generan aviso cualquiera que sea el valor y dos se miden por el valor individual del bien.',
    resumen:
      'Seis incisos con reglas distintas dentro de la misma fracción, y el umbral no se mide por pedimento.',
    respuestaDirecta:
      'La prestación de servicios de comercio exterior respecto de las mercancías que enumera el artículo 17, fracción XIV de la LFPIORPI es actividad vulnerable. La fracción tiene seis incisos y no se comportan igual: cuatro de ellos generan aviso cualquiera que sea el valor de los bienes, y sólo joyería y obras de arte tienen umbral. Un detalle operativo que decide muchos casos: ese umbral se mide por el valor individual del bien, no por el pedimento completo.',
    actividades: [
      {
        slug: 'comercio-exterior',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción XIV nombra la prestación de servicios de comercio exterior sobre vehículos, máquinas para juego con apuesta y sorteos, equipos y materiales para elaborar tarjetas de pago, joyas y metales preciosos, obras de arte y materiales de resistencia balística.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Sabes en cuál de los seis incisos cae la mercancía del pedimento?',
        siSi: 'Ése es el trabajo real de esta fracción: cuatro incisos generan aviso cualquiera que sea el valor y dos se miden contra un umbral. Clasificar mal el inciso cambia el resultado por completo.',
        siNo: 'Sin el inciso no hay respuesta posible. La fracción XIV no tiene una regla única que se pueda aplicar a todo el despacho.',
      },
      {
        pregunta: '¿Estás midiendo por pedimento o por bien?',
        siSi: 'En los incisos de joyería y obras de arte el umbral se mide por el valor individual del bien. Medir por pedimento completo produce avisos que no proceden y omite los que sí.',
        siNo: 'Revisa la ficha de la fracción antes de cerrar el criterio: es el error más común del gremio y no se nota hasta la revisión.',
      },
    ],
    herramienta: 'calculadora-umbrales',
    faq: [
      {
        pregunta: '¿El aviso lo presenta el agente aduanal o el importador?',
        respuesta:
          'La fracción XIV mira a quien presta el servicio de comercio exterior respecto de esas mercancías. El importador puede tener además su propia actividad vulnerable por otra fracción, y esa es suya.',
      },
      {
        pregunta: '¿Un pedimento de autopartes entra en el inciso de vehículos?',
        respuesta:
          'El inciso habla de vehículos terrestres, aéreos y marítimos, nuevos y usados. Si tu mercancía no es el vehículo, revisa la lista completa de la fracción XIV antes de asumir que entra o que queda fuera.',
      },
      {
        pregunta: '¿Los materiales de blindaje cuentan aunque valgan poco?',
        respuesta:
          'El inciso de materiales de resistencia balística para blindaje de vehículos está entre los que operan cualquiera que sea el valor de los bienes.',
      },
    ],
  },
  {
    slug: 'traslado-de-valores',
    titulo: 'Ley Antilavado para empresas de traslado de valores',
    nombreCorto: 'Traslado de valores',
    tambienBuscado: ['transporte de valores', 'custodia de efectivo', 'empresa de bóveda'],
    tituloSEO: `Ley Antilavado para empresas de traslado de valores ${ANIO_VIGENTE}`,
    descripcionSEO:
      'Cuando el monto trasladado o custodiado no se puede determinar, el aviso procede en todos los casos. Qué te obliga la fracción X.',
    resumen:
      'El supuesto tiene una regla propia para cuando el monto no se puede determinar.',
    respuestaDirecta:
      'La prestación habitual o profesional de servicios de traslado o custodia de dinero o valores es la actividad vulnerable del artículo 17, fracción X de la LFPIORPI. La fracción trae una regla que no tiene ninguna otra: cuando no es posible determinar el monto trasladado o custodiado, el aviso procede en todos los casos. La propia fracción exceptúa al Banco de México y a las instituciones de depósito de valores.',
    actividades: [
      {
        slug: 'traslado-custodia-valores',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción X nombra la prestación habitual o profesional de servicios de traslado o custodia de dinero o valores, con la precisión de que procede el aviso en todos los casos cuando no se puede determinar el monto.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Puedes determinar el monto que trasladas o custodias?',
        siSi: 'Entonces la operación se mide contra el umbral de la fracción X como cualquier otra.',
        siNo: 'La fracción X resuelve ese escenario de forma expresa: cuando no es posible determinar el monto, procede el aviso en todos los casos. No es una zona gris.',
      },
      {
        pregunta: '¿Estás dentro de alguna de las excepciones de la fracción?',
        siSi: 'La fracción X exceptúa al Banco de México y a las instituciones de depósito de valores. Fuera de esas dos, el supuesto opera.',
        siNo: 'Entonces la prestación habitual o profesional del servicio te coloca en el supuesto de la fracción X.',
      },
    ],
    herramienta: 'fecha-limite-aviso',
    caso: 'traslado-valores-monto-no-determinable',
    faq: [
      {
        pregunta: 'Si el cliente no declara el contenido del valija, ¿qué procede?',
        respuesta:
          'Ése es exactamente el supuesto de monto no determinable de la fracción X: procede el aviso en todos los casos. La falta de declaración del cliente no suspende tu obligación.',
      },
      {
        pregunta: '¿La custodia en bóveda cuenta igual que el traslado?',
        respuesta:
          'La fracción X nombra el traslado o la custodia de dinero o valores. Son dos servicios y ambos están en el mismo supuesto.',
      },
      {
        pregunta: '¿El volumen de avisos se puede automatizar?',
        respuesta:
          'Sí, y en este giro es donde más se nota: con avisos que proceden en todos los casos, el cuello de botella deja de ser el criterio y pasa a ser el plazo. La fecha límite del aviso se calcula operación por operación.',
      },
    ],
  },
  {
    slug: 'casinos-y-sorteos',
    titulo: 'Ley Antilavado para casinos, sorteos y apuestas',
    nombreCorto: 'Casinos y sorteos',
    tambienBuscado: ['casino', 'sala de sorteos', 'apuestas en línea', 'rifas y loterías'],
    tituloSEO: `Ley Antilavado para casinos y sorteos ${ANIO_VIGENTE}`,
    descripcionSEO:
      'La venta de boletos o fichas y el pago de premios son actividad vulnerable. Qué identificas del jugador y qué se acumula.',
    resumen:
      'La actividad cubre las dos puntas: lo que el jugador entrega y el premio que se le paga.',
    respuestaDirecta:
      'La venta de boletos, fichas o cualquier comprobante para participar en juegos con apuesta, concursos o sorteos, así como el pago de premios, es la actividad vulnerable del artículo 17, fracción I de la LFPIORPI. Aplica a organismos descentralizados y a quienes operan con permiso de la Secretaría de Gobernación. Cubre las dos puntas de la mesa: lo que entra por la compra de participación y lo que sale por el premio.',
    actividades: [
      {
        slug: 'juegos-sorteos',
        alcance: 'nucleo',
        porQue:
          'El artículo 17, fracción I nombra la venta de boletos, fichas o cualquier comprobante para participar en juegos con apuesta, concursos o sorteos, y también el pago de premios.',
      },
    ],
    preguntas: [
      {
        pregunta: '¿Operas con permiso de la Secretaría de Gobernación?',
        siSi: 'La fracción I nombra expresamente a quienes operan con ese permiso, además de a los organismos descentralizados.',
        siNo: 'Operar sin el permiso no te saca del artículo 17: te suma un problema distinto. La actividad sigue siendo la que describe la fracción I.',
      },
      {
        pregunta: '¿Estás midiendo la compra de participación, el pago del premio, o los dos?',
        siSi: 'Los dos: la fracción I nombra la venta de boletos o fichas y el pago de premios como parte de la misma actividad vulnerable.',
        siNo: 'Mirar sólo la taquilla deja fuera la mitad del supuesto. El pago de premios está nombrado en la propia fracción.',
      },
      {
        pregunta: '¿Sigues al mismo jugador a lo largo del tiempo?',
        siSi: 'Aplica la regla antifraccionamiento del artículo 17, último párrafo: las operaciones del mismo cliente por el mismo tipo de acto se suman en una ventana de seis meses.',
        siNo: 'Sin identificación consolidada del jugador, la acumulación no se puede calcular, y es la regla que más fácil se incumple sin darse cuenta.',
      },
    ],
    herramienta: 'clasificacion-clientes',
    faq: [
      {
        pregunta: '¿Las apuestas en línea entran igual que la sala física?',
        respuesta:
          'La fracción I mira la venta de participación en juegos con apuesta, concursos y sorteos y el pago de premios, no el canal. Una plataforma con permiso vigente realiza la misma actividad vulnerable.',
      },
      {
        pregunta: '¿Un concurso promocional de una marca cuenta?',
        respuesta:
          'La fracción I nombra los concursos y sorteos junto a los juegos con apuesta. Si tu promoción entrega premios y vende o entrega comprobantes de participación, revisa la ficha de la fracción en lugar de asumir que es marketing y ya.',
      },
      {
        pregunta: '¿Se identifica al jugador desde la primera ficha?',
        respuesta:
          'La identificación arranca en el umbral de identificación de la fracción, que es más bajo que el de aviso. Revisa los dos en la ficha: son distintos y se cruzan en momentos distintos.',
      },
    ],
  },
];

export const OFICIOS_POR_SLUG: Record<string, Oficio> = Object.fromEntries(
  OFICIOS.map((o) => [o.slug, o]),
);

/**
 * Índice inverso actividad → oficios, para el enlace recíproco.
 *
 * La ficha de `/actividades-vulnerables/[slug]` es la referencia jurídica y
 * `/para/[oficio]` es la puerta coloquial. Enlazar sólo en un sentido deja la
 * puerta sin señalizar desde la referencia, que es justo la página que ya
 * rankea: quien llega buscando «art. 17 fracción XII» nunca se entera de que
 * existe una entrada escrita en su idioma.
 *
 * Sólo se listan los oficios de alcance `nucleo`. Los de `segun-el-caso` tocan
 * la fracción de forma condicional, y ofrecerlos desde la ficha sugeriría una
 * correspondencia que el propio oficio se cuida de no afirmar.
 */
export const OFICIOS_POR_ACTIVIDAD: Record<string, readonly Oficio[]> = OFICIOS.reduce<
  Record<string, Oficio[]>
>((acc, oficio) => {
  for (const actividad of oficio.actividades) {
    if (actividad.alcance !== 'nucleo') continue;
    (acc[actividad.slug] ??= []).push(oficio);
  }
  return acc;
}, {});
