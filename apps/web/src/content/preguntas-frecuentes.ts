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
          'Ese cambio de una sola cifra reabre estructuras que ya se consideraban resueltas. Una sociedad con cuatro socios al 25% no tenía beneficiario controlador por participación bajo la regla anterior y sigue sin tenerlo por ese camino —25% no es más de 25%—, pero una con tres socios al 33% ahora tiene tres, donde antes no tenía ninguno.',
          'El porcentaje no es el único camino: quien ejerce el control por otros medios —acuerdos de voto, derecho a nombrar al administrador, control de hecho— es beneficiario controlador aunque no aparezca en el capital.',
        ],
        fundamento: 'Art. 3, fracción III, LFPIORPI, reformado el 16 de julio de 2025',
        herramienta: {
          href: '/herramientas/beneficiario-controlador',
          etiqueta: 'Trazar la estructura corporativa',
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
