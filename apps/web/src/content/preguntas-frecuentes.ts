import { convertirUMA, datos } from '@leyantilavado/rules-engine';
import { formatearMXN } from '@leyantilavado/types';

/**
 * Preguntas frecuentes.
 *
 * Ninguna cifra está escrita a mano: se calculan del motor al construir el
 * módulo. Si mañana cambia la UMA o un umbral, estas respuestas cambian solas
 * en vez de quedarse desactualizadas — que es exactamente el error que tienen
 * los competidores que publican tablas "2026" con la UMA de 2025.
 */

const UMA = datos.UMA_VIGENTE_MAS_RECIENTE;
const FECHA_REF = `${UMA.anio}-06-15`;
const pesos = (uma: number) => formatearMXN(convertirUMA(uma, FECHA_REF).equivalentePesos);

const REGLA = (actividad: string, subtipo?: string) =>
  datos.UMBRALES.find((u) => u.actividad === actividad && u.subtipo === subtipo);

const JUEGOS = REGLA('juegos-sorteos');
const ARRENDAMIENTO = REGLA('arrendamiento-inmuebles');
const NOTARIO_INMUEBLES = REGLA('fe-publica-notarios', 'inmuebles');

const umaDe = (r: typeof JUEGOS, campo: 'identificacion' | 'aviso'): number =>
  r && r[campo].tipo === 'uma' ? r[campo].uma : 0;

export interface PreguntaFrecuente {
  id: string;
  pregunta: string;
  /** Párrafos. El primero debe responder de forma directa. */
  respuesta: string[];
  /** Disposición aplicable, para que la respuesta sea verificable. */
  fundamento?: string;
  /** Herramienta que resuelve el caso concreto. */
  herramienta?: { href: string; etiqueta: string };
  verMas?: { href: string; etiqueta: string };
}

export interface CategoriaFAQ {
  slug: string;
  titulo: string;
  descripcion: string;
  preguntas: PreguntaFrecuente[];
}

export const CATEGORIAS_FAQ: CategoriaFAQ[] = [
  {
    slug: 'me-aplica',
    titulo: '¿Me aplica la ley?',
    descripcion: 'Lo primero que hay que resolver, y donde más se equivoca la gente.',
    preguntas: [
      {
        id: 'no-se-llama-lavado-de-dinero',
        pregunta: '¿En México existe el delito de «lavado de dinero»?',
        respuesta: [
          'Con ese nombre, no. El tipo penal mexicano se llama «operaciones con recursos de procedencia ilícita», y la ley que estás leyendo se llama así por lo mismo: Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita.',
          'No es un detalle de vocabulario. «Lavar dinero» describe un proceso de tres etapas —colocar el recurso, estratificarlo para perder su rastro y darle apariencia lícita— y probar las tres es difícil. El legislador mexicano tipificó algo más acotado y, sobre todo, movió la carga: en lugar de perseguir el proceso completo, obliga a quien realiza ciertas actividades a documentar de dónde viene el dinero con el que le pagan.',
          'De ahí que esta ley sea preventiva y no penal. Tú no estás persiguiendo un delito: estás dejando constancia de que preguntaste, y esa constancia es lo que te protege.',
        ],
        fundamento: 'Denominación oficial de la LFPIORPI y Código Penal Federal',
        verMas: { href: '/glosario', etiqueta: 'Ver el glosario completo' },
      },
      {
        id: 'financieras-y-no-financieras',
        pregunta: '¿Las actividades vulnerables son sólo las que no son bancos?',
        respuesta: [
          'No, y confundirlo hace que gente que sí está obligada crea que no lo está. Hay actividades vulnerables dentro del sistema financiero y fuera de él; lo que cambia es quién las supervisa.',
          'A las entidades financieras —bancos, sofomes, casas de bolsa, casas de cambio— las regula la Comisión Nacional Bancaria y de Valores. A las actividades vulnerables NO financieras, que son las del artículo 17 y de las que trata este sitio, las supervisa la Unidad de Inteligencia Financiera a través del SAT.',
          'Cuando alguien dice «actividades vulnerables» a secas casi siempre se refiere a las no financieras. Si tu negocio es una sofom o una casa de cambio, tu régimen es otro y tus obligaciones no son las que se calculan aquí.',
        ],
        fundamento: 'Art. 17 LFPIORPI y régimen de entidades financieras',
      },
      {
        id: 'como-se-si-aplica',
        pregunta: '¿Cómo sé si mi negocio realiza una actividad vulnerable?',
        respuesta: [
          `La ley no lista giros ni códigos de actividad económica: lista ACTOS. Realizas una actividad vulnerable si haces alguno de los actos de las ${datos.ACTIVIDADES.length} categorías del artículo 17, de forma habitual o profesional, aunque tu giro principal sea otro.`,
          'Ese matiz decide casos completos. Una constructora que además renta bodegas cae en arrendamiento aunque su giro sea la construcción. Un despacho contable que administra recursos de un cliente cae en servicios profesionales aunque su giro sea la contabilidad.',
        ],
        fundamento: 'Art. 17 LFPIORPI',
        herramienta: { href: '/herramientas/cuestionario', etiqueta: 'Responder el cuestionario' },
      },
      {
        id: 'vulnerable-no-es-obligado',
        pregunta: 'Hago una actividad del artículo 17. ¿Ya soy sujeto obligado?',
        respuesta: [
          'No necesariamente, y ésta es la distinción que más confusión causa en toda la materia: realizar una actividad vulnerable y ser sujeto obligado no son lo mismo.',
          'La actividad te pone en el catálogo. Lo que te convierte en sujeto obligado es alcanzar el umbral de identificación de tu fracción. Un lote que vende autos de forma habitual y profesional, pero cuyas unidades nunca llegan al umbral, realiza una actividad vulnerable y no está obligado a inscribirse ni a presentar avisos.',
          'Ahora el detalle que descoloca a todo el mundo: el umbral se mide POR OPERACIÓN, no por mes ni por año. Ese mismo lote que vendió doscientos coches baratos sin obligación alguna se convierte en sujeto obligado el día que vende un solo auto por encima del umbral. Una operación única voltea el estatus.',
          'De ahí que revisar esto una vez y archivarlo no funcione. La pregunta no es «¿a qué me dedico?» sino «¿alguna operación cruzó la línea?», y sólo se responde mirando las operaciones.',
        ],
        fundamento: 'Art. 17 LFPIORPI y umbral de identificación de cada fracción',
        herramienta: {
          href: '/herramientas/calculadora-umbrales',
          etiqueta: 'Ver el umbral de mi actividad',
        },
      },
      {
        id: 'contador-abogado-representacion',
        pregunta: 'Soy contador. ¿Mi despacho es actividad vulnerable?',
        respuesta: [
          'Depende de si actúas EN REPRESENTACIÓN de tu cliente o sólo le prestas un servicio profesional. Ésa es la línea, y no la traza el giro sino el contrato.',
          'No es actividad vulnerable el contador en nómina de la empresa. Tampoco el despacho externo que lleva contabilidad, presenta declaraciones y asesora. Ahí prestas un servicio y el cliente actúa por sí mismo.',
          'Sí lo es cuando empiezas a actuar por él: manejar sus cuentas bancarias o de inversión, usar su token, presentarte en un banco o una casa de bolsa a su nombre, administrar activos suyos, o intervenir en fusiones, escisiones y armado de estructura societaria.',
          'El riesgo real no es equivocarse al firmar el contrato: es el crecimiento del contrato. «Ya que eres nuestro contador, también manéjanos las cuentas» convierte un despacho en sujeto obligado sin que nadie firme nada nuevo ni lo note. Si el alcance de tus servicios cambió en los últimos meses, vuelve a revisar la fracción XI.',
        ],
        fundamento: 'Art. 17, fracción XI, LFPIORPI',
        herramienta: { href: '/herramientas/cuestionario', etiqueta: 'Revisar mi caso' },
      },
      {
        id: 'tengo-cripto-me-aplica',
        pregunta: 'Tengo bitcoin. ¿Eso me hace sujeto obligado?',
        respuesta: [
          'No. Comprar, tener o vender activos virtuales para ti mismo no genera ninguna obligación bajo esta ley. Lo vulnerable es PRESTAR EL SERVICIO a terceros.',
          'Es decir: entra quien ofrece intercambio, custodia o almacenamiento de activos virtuales, quien los comercializa por cuenta de otros, o quien opera la plataforma tecnológica que los mueve. Tu cartera personal no.',
          'Y si prestas el servicio, ojo con esta fracción: sus umbrales son los más bajos de toda la ley, y hay un disparador adicional sobre la contraprestación que cobras, no sólo sobre el monto intercambiado.',
        ],
        fundamento: 'Art. 17, fracción XVI, LFPIORPI',
        verMas: {
          href: '/actividades-vulnerables/activos-virtuales',
          etiqueta: 'Ver la fracción completa',
        },
      },
      {
        id: 'vender-mi-propia-casa',
        pregunta: '¿Vender mi propia casa me convierte en sujeto obligado?',
        respuesta: [
          'No. El artículo 17 exige que el acto se realice de forma habitual o profesional. Vender la casa en la que vives es un acto aislado de tu patrimonio, no una actividad, y no te obliga a darte de alta ni a presentar avisos.',
          'Pero cuidado con la conclusión contraria, que es donde se equivoca casi todo el mundo: el límite de efectivo del artículo 32 no se dirige a los sujetos obligados, sino a la OPERACIÓN. Aunque tú no seas sujeto obligado, esa compraventa no puede liquidarse en efectivo por encima del límite, y el notario no puede autorizar la escritura si se rebasa, porque él sí es sujeto obligado y el artículo 32 también lo alcanza.',
          'Distinto es si compras y vendes inmuebles de forma habitual, o si eres constructora, desarrollador o asesor inmobiliario: ahí sí realizas la actividad de la fracción V.',
        ],
        fundamento: 'Art. 17, fracción V, y art. 32, fracción I, LFPIORPI',
        herramienta: {
          href: '/herramientas/limites-efectivo',
          etiqueta: 'Verificar el límite de efectivo',
        },
        verMas: { href: '/actividades-vulnerables', etiqueta: 'Ver las 16 fracciones' },
      },
      {
        id: 'nunca-rebaso-umbral',
        pregunta: 'Si nunca rebaso el umbral, ¿de todos modos tengo que registrarme?',
        respuesta: [
          'Sí. El alta en el padrón depende de que REALICES la actividad vulnerable, no de que alcances el umbral de aviso.',
          'Los umbrales determinan cuándo identificas al cliente y cuándo presentas aviso. El registro, la designación del representante encargado del cumplimiento y el informe en ceros corren desde que inicias la actividad.',
        ],
        fundamento: 'Art. 18, fracción I LFPIORPI',
        verMas: { href: '/obligaciones/alta-sppld', etiqueta: 'Cómo darse de alta' },
      },
      {
        id: 'persona-fisica',
        pregunta: '¿Aplica a personas físicas o sólo a empresas?',
        respuesta: [
          'Aplica a ambas. La ley habla de "quien realice" la actividad vulnerable, sin distinguir entre persona física y moral.',
          'La diferencia práctica está en la designación del representante encargado del cumplimiento: es obligatoria para personas morales. Una persona física que realiza la actividad responde directamente.',
        ],
        fundamento: 'Arts. 17 y 20 LFPIORPI',
      },
      {
        id: 'rento-un-local',
        pregunta: 'Rento un local o una casa. ¿Me alcanza la ley?',
        respuesta: [
          `Te alcanza si la renta mensual supera ${umaDe(ARRENDAMIENTO, 'identificacion').toLocaleString('es-MX')} UMA, hoy ${pesos(umaDe(ARRENDAMIENTO, 'identificacion'))} al mes, y generas aviso a partir de ${umaDe(ARRENDAMIENTO, 'aviso').toLocaleString('es-MX')} UMA mensuales, hoy ${pesos(umaDe(ARRENDAMIENTO, 'aviso'))}.`,
          'Fíjate en el matiz de redacción: la identificación aplica cuando la renta es "superior a" el umbral, y el aviso cuando es "igual o superior a". Una renta de exactamente el umbral de identificación no obliga; una de exactamente el de aviso sí.',
          'El umbral se mide sobre el valor MENSUAL, no sobre el total del contrato.',
        ],
        fundamento: 'Art. 17, fracción XV LFPIORPI',
        herramienta: {
          href: '/herramientas/calculadora-umbrales',
          etiqueta: 'Calcular con mi renta',
        },
      },
    ],
  },
  {
    slug: 'umbrales',
    titulo: 'Umbrales y cálculo',
    descripcion: 'Cómo se calcula y con qué valor de UMA.',
    preguntas: [
      {
        id: 'diferencia-identificacion-aviso',
        pregunta: '¿Cuál es la diferencia entre el umbral de identificación y el de aviso?',
        respuesta: [
          'Son dos obligaciones distintas con montos distintos. El de identificación te obliga a identificar al cliente e integrar su expediente. El de aviso, más alto, te obliga además a reportar la operación a la autoridad.',
          `En juegos y sorteos, por ejemplo, identificas desde ${umaDe(JUEGOS, 'identificacion').toLocaleString('es-MX')} UMA (${pesos(umaDe(JUEGOS, 'identificacion'))}) y avisas desde ${umaDe(JUEGOS, 'aviso').toLocaleString('es-MX')} UMA (${pesos(umaDe(JUEGOS, 'aviso'))}).`,
          'Hay actividades donde la identificación aplica siempre, sin importar el monto: préstamos, cheques de viajero, traslado de valores, intermediación inmobiliaria y servicios profesionales, entre otras.',
        ],
        fundamento: 'Art. 17 y art. 18, fracción I LFPIORPI',
        verMas: { href: '/umbrales', etiqueta: 'Ver la tabla completa' },
      },
      {
        id: 'que-uma-uso',
        pregunta: '¿Qué valor de UMA uso: el del año de la operación o el actual?',
        respuesta: [
          'El vigente en la FECHA DE LA OPERACIÓN. Es el error más extendido del mercado.',
          `La UMA entra en vigor el 1 de febrero de cada año. Una operación del 15 de enero de ${UMA.anio} se mide con la UMA de ${UMA.anio - 1}, no con la de ${UMA.anio}. Circulan tablas publicadas como "${UMA.anio}" que usan el valor del año anterior en todo el año.`,
          `La UMA diaria de ${UMA.anio} es ${formatearMXN(UMA.diariaCentavos)} y rige desde el 1 de febrero de ${UMA.anio}.`,
        ],
        fundamento: 'Valores publicados por el INEGI',
        herramienta: { href: '/herramientas/calculadora-uma', etiqueta: 'Convertir UMA por fecha' },
      },
      {
        id: 'con-iva-o-sin-iva',
        pregunta: '¿Los umbrales se calculan con IVA o sin IVA?',
        respuesta: [
          'Depende de qué estés midiendo, y esta distinción confunde a casi todo el gremio.',
          'Los umbrales de identificación y aviso del artículo 17 se miden SIN IVA. El límite de uso de efectivo del artículo 32 se mide CON IVA incluido.',
          'La consecuencia práctica: una misma operación puede quedar debajo del umbral de aviso y aun así rebasar el límite de efectivo, porque las bases de comparación son distintas.',
        ],
        fundamento: 'Art. 17 y art. 32 LFPIORPI; Reglamento reformado el 27 de marzo de 2026',
        herramienta: { href: '/herramientas/limites-efectivo', etiqueta: 'Verificar mi operación' },
      },
      {
        id: 'acumulacion-seis-meses',
        pregunta: '¿Qué es la acumulación de seis meses y cómo se cuenta?',
        respuesta: [
          'Es la regla antifraccionamiento: se suman las operaciones del mismo cliente por el mismo tipo de acto dentro de una ventana de seis meses. Si la suma alcanza el umbral, procede el aviso aunque ninguna operación individual llegue.',
          'La ventana es MÓVIL, no un semestre natural. Se mira seis meses hacia atrás desde la fecha de cada operación. Una operación del 3 de enero y otra del 30 de junio sí se acumulan; una del 3 de enero y otra del 2 de julio, ya no.',
          'Sólo se acumulan operaciones del mismo cliente y del mismo tipo de acto. Una compra de joyería y una de vehículo del mismo cliente no se suman entre sí.',
        ],
        fundamento: 'Art. 17, último párrafo LFPIORPI',
        herramienta: {
          href: '/herramientas/acumulacion-operaciones',
          etiqueta: 'Calcular mi acumulación',
        },
      },
      {
        id: 'notarios-un-umbral',
        pregunta: 'Soy notario. ¿Cuál es mi umbral?',
        respuesta: [
          'No tienes uno: tienes cinco reglas distintas según el acto, y tres de ellas no dependen del monto.',
          `Las operaciones sobre inmuebles tienen umbral de ${umaDe(NOTARIO_INMUEBLES, 'aviso').toLocaleString('es-MX')} UMA (${pesos(umaDe(NOTARIO_INMUEBLES, 'aviso'))}) y los fideicomisos de 4,000 UMA. En cambio, los poderes irrevocables, la constitución de personas morales y los mutuos generan aviso SIEMPRE, sin importar el monto.`,
          'La reforma de julio de 2025 endureció varias: el umbral de inmuebles bajó de 16,000 a 8,000 UMA, el de fideicomisos de 8,000 a 4,000, y la constitución de personas morales pasó de tener umbral a generar aviso siempre.',
        ],
        fundamento: 'Art. 17, fracción XII, Apartado A LFPIORPI',
        verMas: {
          href: '/actividades-vulnerables/fe-publica-notarios',
          etiqueta: 'Ver los cinco incisos',
        },
      },
    ],
  },
  {
    slug: 'avisos',
    titulo: 'Avisos y plazos',
    descripcion: 'Cuándo se presenta, qué pasa si se te pasa.',
    preguntas: [
      {
        id: 'sexto-digito-rfc',
        pregunta: '¿El día 17 es igual para todos?',
        respuesta: [
          'No necesariamente, y esta es probablemente la facilidad menos conocida de la materia. La Secretaría de Hacienda publica cada año un calendario de presentación de avisos de actividades vulnerables que asigna días hábiles adicionales según el SEXTO DÍGITO NUMÉRICO de tu RFC.',
          'Dos cosas que conviene no mezclar. Primera: cuando el día 17 cae en día inhábil, la fecha límite se recorre al día hábil inmediato posterior. Eso lo dice el propio calendario oficial y aplica a todos.',
          'Segunda, la facilidad del sexto dígito: no es un plazo que se alarga, es un día que se te asigna. La diferencia importa, porque presentar en un día distinto al que te corresponde puede dejarte fuera del beneficio en lugar de dentro.',
          'Aquí no calculamos tu día por el sexto dígito, y es deliberado: la tabla circula en blogs del sector con versiones que no siempre coinciden, y el calendario es anual. Un dato así no se publica de oído. Descarga el calendario del año en el portal de la Secretaría de Hacienda y confirma el tuyo antes de programar el envío.',
          'Nuestra calculadora te da el día 17 nominal, que es la fecha conservadora: si presentas para entonces, estás dentro con cualquier sexto dígito.',
        ],
        fundamento: 'Art. 23 LFPIORPI y calendario anual de presentación de avisos de la SHCP',
        herramienta: {
          href: '/herramientas/fecha-limite-aviso',
          etiqueta: 'Calcular el día 17 de mi operación',
        },
      },
      {
        id: 'aviso-modificatorio',
        pregunta: 'Me equivoqué en un aviso ya presentado. ¿Lo puedo corregir?',
        respuesta: [
          'Sí, mediante aviso modificatorio, y con dos límites que sorprenden a casi todo el mundo: tienes 30 días naturales contados desde el acuse electrónico, y sólo puedes modificar una vez.',
          'Que sea una sola corrección cambia cómo conviene trabajar. No sirve enviar una versión aproximada pensando en pulirla después: la única bala que tienes se gasta con el primer modificatorio, esté completo o no.',
          'Y el reloj corre desde el acuse, no desde que descubres el error. Un aviso presentado el día 17 y revisado en la junta de cierre del trimestre ya suele estar fuera de plazo para modificarse.',
          'Por eso la revisión útil es la que ocurre antes de enviar, no después. Y por eso conviene guardar el acuse en un sitio donde su fecha se vea, no dentro de un correo.',
        ],
        fundamento: 'Reglas de carácter general en materia de la LFPIORPI',
        herramienta: {
          href: '/herramientas/fecha-limite-aviso',
          etiqueta: 'Ver mis próximas fechas límite',
        },
      },
      {
        id: 'efectivo-por-operacion',
        pregunta: 'Si el pago viene en parcialidades o entre varios copropietarios, ¿se multiplica el tope de efectivo?',
        respuesta: [
          'No. En los dos casos el límite se mide sobre la OPERACIÓN completa, y en los dos casos el error se comete de buena fe creyendo lo contrario.',
          'Parcialidades: si el comprador paga en varias exhibiciones y la suma de lo entregado en efectivo rebasa el tope, ya hay infracción, aunque ninguna exhibición individual lo rebase. Partir el pago no parte el límite.',
          'Copropiedad: si un inmueble tiene cuatro copropietarios, el tope no se multiplica por cuatro. La operación es una y su límite es uno.',
          'Y una precisión que ahorra sustos: el cheque no cuenta como efectivo para esta ley, aunque en la conversación diaria se le llame así. Gira una instrucción a un banco y por tanto deja rastro, que es justo lo que la norma persigue. Transferencia, tarjeta y cheque son medios rastreables; efectivo, metales y billetes no.',
        ],
        fundamento: 'Art. 32 LFPIORPI',
        herramienta: {
          href: '/herramientas/limites-efectivo',
          etiqueta: 'Verificar una operación',
        },
      },
      {
        id: 'legal-no-es-licito',
        pregunta: 'Pago mis impuestos y todo está declarado. ¿Eso me protege?',
        respuesta: [
          'No, y la confusión entre las dos palabras es de las más caras de esta materia: una operación puede ser LEGAL y no ser LÍCITA.',
          'Legal significa que cumpliste la forma: facturaste, declaraste, pagaste el impuesto. Lícito se refiere al origen del recurso. Declarar dinero de procedencia ilícita y pagar impuestos sobre él no lo limpia; lo que hace es dejar constancia fiscal de una operación cuyo origen sigue siendo el problema.',
          'Por eso la obligación de esta ley no se satisface con la contabilidad. Lo que se documenta aquí no es cuánto entró, sino de dónde venía y a nombre de quién.',
          'Dicho al revés, que es como conviene recordarlo: el SAT te pregunta si pagaste; esta ley te pregunta si preguntaste.',
        ],
        fundamento: 'Objeto de la LFPIORPI y art. 400 bis del Código Penal Federal',
      },
      {
        id: 'devolver-en-la-misma-forma',
        pregunta: 'Un cliente canceló y me pide que le devuelva el dinero. ¿Puedo transferírselo?',
        respuesta: [
          'Sólo si te pagó por transferencia. La devolución tiene que hacerse en la MISMA forma de pago y en la MISMA moneda en que recibiste el recurso, y esta regla entró en vigor el 30 de marzo de 2026 con la reforma al Reglamento.',
          'El caso que la explica es el que más se repite: el cliente deposita en efectivo, cancela, y por comodidad o por seguridad se le devuelve por transferencia bancaria. En ese momento un dinero que llegó en efectivo salió del sistema formal convertido en saldo bancario a nombre de alguien —con tu empresa como puente—. Eso es literalmente una etapa de integración, y tu intención no cambia el resultado.',
          'Vale también al revés: si te pagaron por transferencia, no devuelvas en efectivo. Y si te pagaron en dólares, la devolución va en dólares.',
          'Guarda el comprobante de la devolución junto al de la operación original. Sin ese par, en una revisión sólo se ve una entrada de efectivo y una salida bancaria que no se explican entre sí.',
        ],
        fundamento: 'Reglamento de la LFPIORPI, reformado el 27 de marzo de 2026, en vigor el 30 de marzo de 2026',
        verMas: { href: '/reforma-ley-antilavado-2026', etiqueta: 'Ver qué más cambió el Reglamento' },
      },
      {
        id: 'operacion-inusual-sin-umbral',
        pregunta: 'Un cliente opera cada semana por debajo del umbral. ¿Tengo que hacer algo?',
        respuesta: [
          'Sí, y aquí se rompe la idea más extendida sobre esta ley: que si no se rebasa el umbral, no hay nada que hacer. El umbral dispara el aviso por monto; no es lo único que dispara un aviso.',
          'Un cliente que hace operaciones de veinte mil pesos cada ocho días nunca rebasa el umbral y aun así construye un patrón. Fraccionar deliberadamente para quedarse por debajo tiene nombre en el sector —pitufeo— y es exactamente lo que la regla de acumulación de seis meses persigue.',
          'Lo que activa esto no es una cifra sino una comparación: la operación contra el perfil transaccional que le asignaste a ese cliente. Si se sale de su perfil, es inusual, aunque el monto sea pequeño.',
          'Por eso los negocios chicos no están más seguros por ser chicos. Al contrario: en una empresa grande un movimiento raro destaca entre millones, y en una chica un patrón de cantidades modestas puede pasar años sin que nadie lo mire.',
        ],
        fundamento: 'Art. 17 LFPIORPI, regla de acumulación de seis meses, y perfil transaccional',
        herramienta: {
          href: '/herramientas/acumulacion-operaciones',
          etiqueta: 'Revisar la acumulación de un cliente',
        },
      },
      {
        id: 'presentar-un-dia-tarde',
        pregunta: 'Presenté el aviso el día 18. ¿Pasa algo si nadie me dice nada?',
        respuesta: [
          'Sí pasa: ya es extemporáneo. Aquí no funciona el reflejo que traen quienes vienen de materia fiscal, donde presentar antes de que la autoridad te requiera suele resolver el asunto. La ley antilavado no tiene esa figura de espontaneidad general.',
          'Presentar fuera de plazo es en sí una infracción, y sigue siéndolo aunque nadie te haya requerido nada. El plazo simplemente venció.',
          'Lo que sí existe es la autocorrección del artículo 55, y no es lo mismo: exige que cumplas ANTES de que inicien las facultades de verificación y que reconozcas expresamente la falta dentro del plazo aplicable. Puede llevar a que la autoridad se abstenga de sancionar por única ocasión, y después de ese beneficio, a una reducción de hasta el 50%. Ninguna de las dos es automática ni es un derecho.',
        ],
        fundamento: 'Art. 53, fracción IV, y art. 55 LFPIORPI',
        herramienta: {
          href: '/herramientas/fecha-limite-aviso',
          etiqueta: 'Calcular mi fecha límite',
        },
      },
      {
        id: 'cuando-se-presenta',
        pregunta: '¿Cuándo se presentan los avisos y qué pasa si el día 17 cae en fin de semana?',
        respuesta: [
          'A más tardar el día 17 del mes siguiente a aquel en que ocurrió la operación. Las operaciones de junio se reportan a más tardar el 17 de julio.',
          'Sobre los fines de semana: mostramos siempre la fecha nominal y advertimos cuando cae en sábado o domingo. No la recorremos por nuestra cuenta, porque hacerlo sin una regla oficial registrada sería inventar derecho. Confirma en el calendario oficial de días inhábiles.',
        ],
        fundamento: 'Art. 23 LFPIORPI',
        herramienta: {
          href: '/herramientas/fecha-limite-aviso',
          etiqueta: 'Calcular mi fecha límite',
        },
      },
      {
        id: 'informe-en-ceros',
        pregunta: '¿Tengo que presentar informe en ceros si no tuve operaciones?',
        respuesta: [
          'Sí. Si en el periodo no hubo operaciones que alcanzaran el umbral de aviso, de todas formas se presenta el informe en ceros dentro del mismo plazo del día 17.',
          'Novedad del Acuerdo 115/2026: una vez enviado, el informe en ceros ya no se puede modificar ni eliminar. Revísalo antes de mandarlo.',
        ],
        fundamento: 'Art. 25 de las Reglas de Carácter General',
      },
      {
        id: 'se-me-paso-el-plazo',
        pregunta: 'Se me pasó el plazo. ¿Qué hago?',
        respuesta: [
          'Presentar de inmediato, de forma espontánea, antes de que la autoridad inicie sus facultades de verificación. La presentación extemporánea es infracción, pero la ley contempla la autocorrección.',
          'Si cumples espontáneamente y reconoces la infracción en el plazo aplicable, la autoridad puede abstenerse de sancionar por única ocasión. Después de ese beneficio, procede una reducción de hasta el 50%.',
          'Ninguno de los dos es automático: son facultades de la autoridad, no derechos garantizados. El procedimiento exacto está en el art. 55 Bis del Reglamento.',
        ],
        fundamento: 'Art. 55 LFPIORPI y art. 55 Bis del Reglamento',
        herramienta: { href: '/herramientas/calculadora-multas', etiqueta: 'Estimar el rango' },
      },
      {
        id: 'operaciones-24-horas',
        pregunta: '¿Ya tengo que presentar avisos de operaciones inusuales en 24 horas?',
        respuesta: [
          'Todavía no hay una fecha cierta. La obligación existe en la norma y procede incluso cuando no se alcanza el umbral, e incluso cuando la operación no llegó a celebrarse.',
          'Pero su exigibilidad corre a partir de seis meses después de que la UIF publique una Resolución con los formatos oficiales, y esa Resolución no aparece publicada a la fecha de nuestra última revisión.',
          'Por eso no le ponemos cuenta regresiva en el calendario: sería inventar la fecha.',
        ],
        fundamento: 'Arts. 26 Bis, 26 Bis 1, 26 Bis 2 y 27 del Acuerdo 115/2026',
        verMas: { href: '/calendario-cumplimiento', etiqueta: 'Ver el calendario' },
      },
    ],
  },
  {
    slug: 'sanciones',
    titulo: 'Multas y riesgos',
    descripcion: 'Cuánto cuesta incumplir y qué se puede corregir.',
    preguntas: [
      {
        id: 'cuanto-son-las-multas',
        pregunta: '¿De cuánto son las multas?',
        respuesta: [
          `Dependen de la infracción. Las del rango bajo van de 200 a 2,000 UMA (${pesos(200)} a ${pesos(2000)}). Las del rango medio, de 2,000 a 10,000 UMA. Las más graves, de 10,000 a 65,000 UMA (${pesos(10000)} a ${pesos(65000)}).`,
          'En las más graves —omitir avisos o rebasar el límite de efectivo— la ley prevé también del 10% al 100% del valor del acto, y se aplica la cantidad MAYOR entre ambas bases, siempre que el acto sea cuantificable en dinero.',
          'Un detalle que casi todos los resúmenes confunden: el artículo 53 enumera las INFRACCIONES y el 54 las MULTAS. Son artículos distintos.',
        ],
        fundamento: 'Arts. 53 y 54 LFPIORPI',
        herramienta: { href: '/herramientas/calculadora-multas', etiqueta: 'Estimar mi escenario' },
        verMas: { href: '/multas', etiqueta: 'Ver todos los supuestos' },
      },
      {
        id: 'multas-beneficiario-controlador',
        pregunta: '¿Las multas de beneficiario controlador son las mismas?',
        respuesta: [
          'No. Son dos regímenes paralelos que se suelen mezclar.',
          'El de la LFPIORPI aplica a quien realiza actividades vulnerables y sus multas van en UMA. El del Código Fiscal aplica a las sociedades mercantiles en general —aunque NO realicen actividad vulnerable— y sus multas vienen ya en pesos, por CADA beneficiario controlador respecto del cual se incumpla.',
          'Las del CFF llegan a superar los dos millones de pesos por beneficiario controlador.',
        ],
        fundamento: 'Art. 84-N del Código Fiscal de la Federación',
        herramienta: {
          href: '/herramientas/beneficiario-controlador',
          etiqueta: 'Trazar mi estructura',
        },
      },
      {
        id: 'fraccionar-pagos',
        pregunta: '¿Puedo fraccionar los pagos para no rebasar el límite de efectivo?',
        respuesta: [
          'No. La restricción se mide sobre el acto u operación, no sobre cada pago aislado.',
          'Dividir un pago en varias exhibiciones no evita por sí solo la aplicación del límite, y la regla de acumulación de seis meses existe precisamente para detectar el fraccionamiento en los umbrales de aviso.',
          'Rebasar el límite de efectivo es una infracción independiente: se sanciona aunque hayas presentado todos los avisos en tiempo y forma.',
        ],
        fundamento: 'Art. 32 y art. 53, fracción VII LFPIORPI',
      },
      {
        id: 'auditoria-interna-o-externa',
        pregunta: '¿La auditoría anual tiene que hacerla un externo?',
        respuesta: [
          'Depende de tu propio nivel de riesgo, y ése es el matiz que casi nadie menciona al hablar de la obligación de auditoría.',
          'Si tu evaluación de riesgo te sitúa en nivel medio o bajo, la auditoría puede ser interna o externa. Si te sitúa en nivel alto, tiene que hacerla un auditor externo.',
          'La consecuencia es incómoda y conviene verla venir: la metodología de riesgos que tienes que tener lista en marzo de 2027 es la que determina, entre otras cosas, cuánto te va a costar cumplir a partir de 2028. Una clasificación de riesgo alto no es sólo una etiqueta, trae presupuesto detrás.',
          'Eso no es un incentivo para clasificarte bajo. Una clasificación que no corresponde a tu operación es de lo primero que se cae en una revisión, y entonces el problema ya no es el costo de la auditoría.',
        ],
        fundamento: 'Obligación de auditoría anual del Acuerdo 115/2026',
        verMas: { href: '/obligaciones', etiqueta: 'Ver la obligación completa' },
      },
      {
        id: 'capacitacion-por-nivel',
        pregunta: '¿Basta con un curso general para todo el personal?',
        respuesta: [
          'No. La capacitación se exige por nivel jerárquico, y una sesión igual para todos no cumple ese requisito por muchas constancias que genere.',
          'La dirección necesita entender la exposición del negocio y aprobar políticas; el encargado de cumplimiento, el procedimiento completo; y el personal que atiende clientes, cómo se pregunta por el beneficiario controlador sin incomodar y qué hacer cuando alguien se niega a dar un dato.',
          'El área de ventas es la que más importa y la que suele quedarse fuera. Es la primera línea de defensa —ve al cliente antes que nadie— y es también la que tiene más incentivos para saltarse el protocolo, porque su comisión depende de cerrar la operación, no de completar el expediente.',
          'Ese conflicto no se resuelve con un curso: se resuelve reconociéndolo en el manual y midiendo el cumplimiento del expediente igual que se mide la venta.',
        ],
        fundamento: 'Obligación de capacitación por nivel jerárquico',
        verMas: { href: '/cursos', etiqueta: 'Ver la capacitación oficial gratuita' },
      },
      {
        id: 'plazos-visita-verificacion',
        pregunta: 'Me llegó una visita de verificación. ¿Qué plazos tengo?',
        respuesta: [
          'Ésta es la información que más falta hace y que casi nadie publica, porque quien la busca ya tiene el oficio en la mano y necesita días, no teoría.',
          'La verificación puede revisar los CINCO años inmediatos anteriores. Ése es el horizonte de tu conservación documental, y por eso conservar diez años no es exceso: es margen.',
          'Los plazos que se manejan en el procedimiento: para responder un requerimiento, diez días hábiles, prorrogables cinco más. Tras el acta, la autoridad emite oficio de observaciones y se abre un plazo probatorio de cinco días hábiles para pruebas y alegatos. La resolución sancionadora tiene su propio plazo máximo.',
          'Dos cosas prácticas que se deciden en las primeras horas. Primera: el alcance de lo que entregas es el de la actividad vulnerable, no el de toda tu contabilidad. Segunda: cinco días hábiles para armar pruebas es poquísimo si el expediente no estaba ordenado antes, y es de sobra si lo estaba. La visita no se prepara cuando llega.',
          'Verifica los plazos exactos de tu caso en el oficio que te entregaron: es el documento que rige, y las prórrogas dependen de que se pidan en tiempo.',
        ],
        fundamento: 'Art. 34 LFPIORPI, reformado el 17 de julio de 2025, y Ley Federal de Procedimiento Administrativo',
        verMas: { href: '/multas', etiqueta: 'Ver el régimen sancionador' },
      },
      {
        id: 'que-significa-habitual',
        pregunta: '¿Cuántas operaciones son «habituales»?',
        respuesta: [
          'La ley dice «habitual o profesional» y no pone un número, que es exactamente lo que vuelve angustiosa la pregunta para quien vende dos coches al año.',
          'Para la venta de vehículos existe un criterio de la autoridad que se ha divulgado en el sector: más de dos ventas al año, o que la actividad sea preponderante. Con ese rasero, dar de baja activos vendiendo un par de unidades no convierte a una empresa en sujeto obligado por esa fracción.',
          'Ahora la advertencia, que importa tanto como el dato: ese criterio se refiere a vehículos. Extrapolarlo a préstamos, construcción, arte, blindaje o custodia es un riesgo de interpretación, no una conclusión. Cada fracción tiene su lógica y la autoridad no ha publicado un número general.',
          'Lo que sí conviene hacer si estás en el borde: documentar por qué consideras que no hay habitualidad, con fechas y volumen. Una decisión razonada y escrita se defiende; la misma decisión sin papel, no.',
        ],
        fundamento: 'Art. 17 LFPIORPI, encabezado, y criterio de la autoridad para la fracción de vehículos',
        herramienta: { href: '/herramientas/cuestionario', etiqueta: 'Revisar si te aplica' },
      },
      {
        id: 'operacion-intentada',
        pregunta: 'Un cliente intentó una operación y se echó para atrás al pedirle datos. ¿Se avisa?',
        respuesta: [
          'Sí, y es de las cosas que más se pasan por alto: el aviso por sospecha en veinticuatro horas alcanza también a las operaciones INTENTADAS, no sólo a las que se concretaron.',
          'El caso típico es justo ése. Pides identificación o preguntas por el beneficiario controlador, el cliente se incomoda y abandona la operación. Es tentador archivarlo como una venta perdida, pero desde la perspectiva de la ley acabas de observar exactamente la conducta que la norma quiere ver reportada.',
          'Que la operación no se haya concretado no elimina el deber: lo que se reporta es el indicio, no el importe.',
          'Práctica que lo hace posible: registra el intento en el momento, con fecha, lo que se pidió y cómo reaccionó. Veinticuatro horas después nadie recuerda el detalle, y sin detalle no hay aviso que redactar.',
        ],
        fundamento: 'Obligación de aviso en 24 horas por actos u operaciones intentados',
        verMas: { href: '/obligaciones', etiqueta: 'Ver la obligación de aviso' },
      },
      {
        id: 'carcel-por-error-en-aviso',
        pregunta: '¿Puedo ir a la cárcel por un error en un aviso?',
        respuesta: [
          'El riesgo dejó de ser teórico con la reforma de julio de 2025. Antes, el delito de alterar o modificar la información de un aviso exigía dolo: había que hacerlo a propósito. Ahora los delitos de la ley admiten también la comisión culposa, es decir, por descuido.',
          'La propia reforma dejó la salida: cuando hay un error de tipo vencible y se corrige espontáneamente antes de que la autoridad lo detecte, no se sanciona. Eso convierte la revisión de lo ya presentado en una medida de protección personal, no en una tarea administrativa: un nombre mal capturado que nadie volvió a mirar es un riesgo distinto del que era antes de 2025.',
          'Conviene no exagerar en sentido contrario: un error detectado y corregido por ti no es delito, y la vía penal no sustituye al régimen de multas, que sigue siendo el que se aplica en la inmensa mayoría de los casos.',
        ],
        fundamento: 'Título Cuarto, Capítulo II, LFPIORPI, reformado el 16 de julio de 2025',
        verMas: { href: '/multas', etiqueta: 'Ver el régimen sancionador completo' },
      },
      {
        id: 'una-multa-o-varias',
        pregunta: '¿La multa es una por operación o una por cada incumplimiento?',
        respuesta: [
          'Una por cada incumplimiento. Es la diferencia entre una molestia y un problema serio, y casi nadie la tiene presente al estimar su exposición.',
          'En una sola operación mal documentada pueden concurrir varias infracciones distintas: no integrar el expediente, no haber preguntado por el beneficiario controlador, no conservar el comprobante de domicilio y presentar el aviso fuera de plazo. Cada una tiene su propio fundamento en el artículo 53 y su propia multa en el artículo 54.',
          'Por eso el rango mínimo engaña. La multa más baja de la ley parte de 200 UMA, pero lo que determina la cifra final no es el mínimo sino cuántos supuestos se acumulan sobre el mismo expediente.',
        ],
        fundamento: 'Arts. 53 y 54 LFPIORPI',
        herramienta: {
          href: '/herramientas/calculadora-multas',
          etiqueta: 'Estimar el rango de multa',
        },
      },
    ],
  },
  {
    slug: 'reforma',
    titulo: 'La reforma 2025-2026',
    descripcion: 'Qué cambió realmente y para cuándo.',
    preguntas: [
      {
        id: 'es-una-ley-nueva',
        pregunta: '¿Salió una nueva Ley Antilavado?',
        respuesta: [
          'No. El marco vigente son tres instrumentos con fechas distintas, y presentarlo como "ley nueva" es lo que está generando confusión.',
          'La reforma a la LFPIORPI se publicó el 16 de julio de 2025 y entró en vigor al día siguiente. La reforma al Reglamento se publicó el 27 de marzo de 2026. El Acuerdo 115/2026, que modifica las Reglas de Carácter General, se publicó el 7 de agosto de 2026 y entra en vigor el 30 de noviembre de 2026.',
        ],
        fundamento: 'DOF 16-07-2025, DOF 27-03-2026 y DOF 07-08-2026',
        verMas: { href: '/reforma-ley-antilavado-2026', etiqueta: 'Ver qué cambió, punto por punto' },
      },
      {
        id: 'quien-es-beneficiario-controlador',
        pregunta: '¿Quién cuenta como beneficiario controlador después de la reforma?',
        respuesta: [
          'La persona física que se beneficia de la operación o que ejerce el control. La reforma de julio de 2025 bajó el umbral de participación: antes se miraba a quien tuviera el 50% del capital social, ahora basta con MÁS DEL 25%.',
          'Ese cambio de una sola cifra reabre estructuras que ya se consideraban resueltas: una sociedad con tres socios al 33% no tenía ningún beneficiario controlador por participación bajo la regla anterior y ahora tiene tres.',
          'Ojo con el borde exacto: hay fuentes profesionales que redactan el criterio como «más del 25%» y otras como «25% o más». No es lo mismo para una sociedad con cuatro socios al 25% clavado, que es un reparto muy común. Mientras no lo confirmemos contra el texto publicado, aquí no elegimos por ti: si tu estructura cae justo en 25,00%, trátala como si contara y consúltalo con tu asesor.',
          'El porcentaje tampoco es el único camino, y esta es la parte que más se pasa por alto: el Acuerdo 115/2026 añadió un capítulo de beneficiario controlador con un ORDEN DE PRELACIÓN de tres escalones. Primero, quien alcanza el umbral de capital. Si nadie lo alcanza, quien ejerce el control por otros medios —dirigir la estrategia, imponer decisiones en asamblea, nombrar o remover al administrador—. Y si tampoco hay nadie ahí, la persona con el cargo de mayor jerarquía administrativa.',
          'La consecuencia práctica desarma la respuesta más frecuente: «mi sociedad no tiene beneficiario controlador porque nadie llega al umbral» casi nunca es cierta. El tercer escalón existe justamente para que siempre haya un nombre.',
        ],
        fundamento: 'Art. 3, fracción III, LFPIORPI, reformado el 16 de julio de 2025',
        herramienta: {
          href: '/herramientas/beneficiario-controlador',
          etiqueta: 'Trazar la estructura corporativa',
        },
      },
      {
        id: 'bc-cff-vs-lfpiorpi',
        pregunta: '¿El beneficiario controlador del SAT y el de la Ley Antilavado son el mismo?',
        respuesta: [
          'Es la misma figura conceptual pero son DOS regímenes distintos, y no comparten ni el umbral ni el trámite. Confundirlos es el error más caro de esta materia, porque quien cumple uno suele creer que ya cumplió el otro.',
          'El Código Fiscal de la Federación fija su criterio de participación accionaria en 15% y existe desde 2022: la información se conserva en tus propios registros y se entrega cuando el SAT la requiere.',
          'La Ley Antilavado lo fija en 25% y su obligación es otra: identificarlo para el expediente del cliente y —para las sociedades mercantiles— registrarlo en la plataforma de la Secretaría de Economía.',
          'Un socio con el 18% puede ser beneficiario controlador para efectos fiscales y no alcanzar el umbral de la Ley Antilavado por participación. Eso no lo deja fuera: todavía puede entrar por control o por el escalón del administrador de mayor jerarquía.',
        ],
        fundamento: 'Art. 32-B Ter CFF y Acuerdo 115/2026, capítulo de beneficiario controlador',
        herramienta: {
          href: '/herramientas/beneficiario-controlador',
          etiqueta: 'Trazar la estructura',
        },
      },
      {
        id: 'registro-beneficiario-economia',
        pregunta: '¿Tengo que registrar a mi beneficiario controlador ante la Secretaría de Economía?',
        respuesta: [
          'Sí, si eres sociedad mercantil, y aquí está lo que sorprende a la mayoría: esta obligación aplica AUNQUE NO REALICES NINGUNA ACTIVIDAD VULNERABLE. Es independiente del régimen del artículo 17.',
          'La reforma incorporó la obligación de registrar la información del beneficiario controlador en una plataforma electrónica de la Secretaría de Economía, conservar el soporte documental y reportar cualquier modificación relevante.',
          'No se puede cumplir todavía: la plataforma y sus lineamientos están pendientes de publicarse. Lo que sí conviene hacer desde ahora es tener identificado y documentado al beneficiario controlador, porque el día que abra el sistema el plazo correrá sobre información que hay que reunir, no sobre un formulario que se llena en una tarde.',
          'Ojo con no confundirla con la obligación del Código Fiscal de la Federación, que existe desde 2022: ésa se conserva en tus propios registros y se entrega cuando el SAT la requiere. Son dos obligaciones distintas y cumplir una no cumple la otra.',
        ],
        fundamento: 'LFPIORPI reformada el 16 de julio de 2025; lineamientos pendientes de publicación',
        verMas: { href: '/reforma-ley-antilavado-2026', etiqueta: 'Ver qué más cambió' },
      },
      {
        id: 'metodologia-doce-meses',
        pregunta: 'La metodología de riesgos es para marzo de 2027. ¿Puedo dejarla para después?',
        respuesta: [
          'No, y el motivo no está en la fecha sino en el dato: la metodología se construye sobre los DOCE MESES PREVIOS de operaciones. Eso significa que el material con el que la vas a armar son las operaciones que estás haciendo hoy.',
          'Puesto al revés: para llegar al 1 de marzo de 2027 con una metodología sustentada, el periodo que tiene que estar registrado y ordenado empieza alrededor de marzo de 2026. El plazo de entrega es 2027; la ventana de datos ya se está consumiendo.',
          'Quien empiece en enero de 2027 no llega tarde por unas semanas: llega sin historial sobre el que fundamentar los factores de riesgo, y una metodología sin datos detrás es exactamente lo que una auditoría detecta primero.',
          'Lo accionable hoy no es redactar el documento. Es asegurarte de que estás registrando cada operación con lo que después vas a necesitar: cliente, monto, fecha, forma de pago, zona geográfica y canal.',
        ],
        fundamento: 'Artículos Transitorios del Acuerdo 115/2026',
        herramienta: {
          href: '/plantillas/control-de-operaciones.csv',
          etiqueta: 'Descargar la bitácora de operaciones',
        },
      },
      {
        id: 'cada-cuanto-reevaluar-riesgo',
        pregunta: '¿Cada cuánto hay que reevaluar el riesgo de un cliente?',
        respuesta: [
          'Cada seis meses. No es una recomendación de buenas prácticas: la clasificación de riesgo tiene fecha de caducidad, y un expediente con una evaluación de hace dos años equivale a no tener evaluación.',
          'La metodología completa, en cambio, se revisa y actualiza cada doce meses. Son dos ciclos distintos que conviene no mezclar: uno mira al cliente, el otro mira a tu propio negocio y a cómo cambió su exposición.',
          'De ahí que la clasificación tenga que vivir en algo consultable con fechas, no en una hoja suelta: lo que se revisa en una auditoría no es que hayas clasificado, sino cuándo y con qué criterio.',
        ],
        fundamento: 'Acuerdo 115/2026, capítulo de enfoque basado en riesgos',
        herramienta: {
          href: '/herramientas/clasificacion-clientes',
          etiqueta: 'Clasificar la cartera',
        },
      },
      {
        id: 'quien-es-pep',
        pregunta: '¿Quién cuenta como persona políticamente expuesta?',
        respuesta: [
          'Más gente de la que casi todo el mundo supone. No es sólo el funcionario: alcanza también a su cónyuge o concubina y a sus familiares hasta el segundo grado. Un cliente sin cargo público puede ser PEP por parentesco.',
          'Y no deja de serlo el día que deja el puesto: se maneja un periodo de enfriamiento de un año durante el cual el exfuncionario sigue tratándose como de riesgo alto.',
          'Aplica tanto a funcionarios nacionales como extranjeros, lo que importa en plazas con clientela internacional.',
          'Dale la vuelta y verás por qué esto sorprende: si tu cónyuge es funcionario público, el PEP eres tú. Si uno de los socios de tu empresa lo es, la relación con esa empresa hereda el mismo tratamiento. Mucha gente descubre que es PEP cuando un proveedor se lo pregunta.',
          'Ser PEP no es una acusación ni impide operar con esa persona. Lo que activa es debida diligencia reforzada: más documentación, origen de los recursos y, en riesgo alto, aprobación explícita de la dirección antes de aceptar la relación.',
          'Y no se resuelve preguntando de frente y creyendo la respuesta: existe una consulta a la autoridad para confirmarlo, y el sitio ya tiene en su calendario la fecha prevista de disponibilidad del padrón electrónico. Mientras tanto, lo que se documenta es la pregunta y lo que el cliente contestó.',
        ],
        fundamento: 'Acuerdo 115/2026, capítulo de personas políticamente expuestas',
        verMas: { href: '/obligaciones', etiqueta: 'Ver la obligación completa' },
      },
      {
        id: 'para-cuando-cada-cosa',
        pregunta: '¿Para cuándo tengo que tener lista cada obligación?',
        respuesta: [
          'El Acuerdo 115/2026 escalona las fechas. El 30 de noviembre de 2026 entran en vigor las reglas. El 1 de marzo de 2027 deben estar listos la metodología de riesgos, el manual, la clasificación de clientes, los expedientes, el beneficiario controlador y los procedimientos de selección de personal.',
          'El 1 de junio de 2027 deben estar operando los mecanismos automatizados. El ejercicio 2027 completo es el primer periodo anual de capacitación y el 2028 el primero de auditoría, con dictamen a más tardar el último día hábil de marzo de 2029.',
        ],
        fundamento: 'Artículos Transitorios del Acuerdo 115/2026',
        verMas: { href: '/calendario-cumplimiento', etiqueta: 'Ver el calendario con contadores' },
      },
      {
        id: 'que-es-acuerdo-115',
        pregunta: '¿Qué es exactamente el Acuerdo 115/2026?',
        respuesta: [
          'Es un acuerdo de la Secretaría de Hacienda que modifica las Reglas de Carácter General en materia de la LFPIORPI, publicadas originalmente en 2013. No es una ley ni un decreto, y no lo emite el SAT ni la UIF.',
          'Añade once capítulos nuevos y tres anexos, y es el instrumento que introduce el régimen escalonado de metodología de riesgos, manual, mecanismos automatizados, capacitación y auditoría.',
        ],
        fundamento: 'DOF 07-08-2026',
        verMas: { href: '/acuerdo-115-2026', etiqueta: 'Ver el análisis completo' },
      },
    ],
  },
];

export const TOTAL_PREGUNTAS = CATEGORIAS_FAQ.reduce(
  (n, c) => n + c.preguntas.length,
  0,
);
