import { datos } from '@leyantilavado/rules-engine';

/**
 * Plantillas descargables.
 *
 * Ninguna se escribe a mano: se generan del corpus legal en el momento de la
 * descarga. Una plantilla estática de cumplimiento envejece peor que casi
 * cualquier otro documento —entre la reforma de julio de 2025 y el Acuerdo
 * 115/2026 cambiaron umbrales, plazos y obligaciones enteras—, y la que
 * circula por correo entre despachos suele traer artículos derogados.
 *
 * Todas son CSV o Markdown a propósito. Un .docx o un .xlsx obligan a tener
 * el programa que los abre y esconden el contenido detrás de un formato
 * binario; un CSV se abre en Excel, en Google Sheets y en Numbers, y se puede
 * leer con los ojos si hace falta.
 *
 * Lo que estas plantillas NO son: un manual listo para firmar. Ninguna
 * plantilla puede saber qué hace tu negocio, y esa parte es justamente la que
 * revisa un auditor.
 */

export type FormatoPlantilla = 'csv' | 'md';

export interface Plantilla {
  /** Nombre del archivo en la URL y en la descarga. */
  archivo: string;
  titulo: string;
  descripcion: string;
  formato: FormatoPlantilla;
  /** Obligación del corpus que la sustenta, si aplica. */
  fundamento: string;
  /** Lo que hay que cambiar sí o sí antes de usarla. Nunca vacío. */
  adaptar: readonly string[];
  /** Cuántas filas o secciones trae, calculado del motor. */
  filas: number;
}

const obligacionesPorCategoria = (cats: readonly string[]) =>
  datos.OBLIGACIONES.filter((o) => cats.includes(o.categoria));

const pasosDe = (cats: readonly string[]) =>
  obligacionesPorCategoria(cats).reduce((n, o) => n + o.pasos.length, 0);

export const PLANTILLAS: readonly Plantilla[] = [
  {
    archivo: 'control-de-cumplimiento.csv',
    titulo: 'Control de cumplimiento completo',
    descripcion:
      'Todas las obligaciones del régimen, cada una desglosada en sus pasos, con la evidencia que hay que conservar y el artículo que la sustenta. Una fila por paso, con columnas para responsable, fecha de cumplimiento y ubicación del soporte.',
    formato: 'csv',
    fundamento: 'Catálogo completo de obligaciones de la LFPIORPI y del Acuerdo 115/2026',
    adaptar: [
      'Borra las obligaciones que no te apliquen: el archivo trae el catálogo completo, no el de tu actividad.',
      'Asigna un responsable con nombre a cada fila. «El área contable» no es un responsable.',
      'La columna de ubicación del soporte tiene que apuntar a un lugar real, no a «carpeta compartida».',
    ],
    filas: datos.OBLIGACIONES.reduce((n, o) => n + o.pasos.length, 0),
  },
  {
    archivo: 'expediente-de-identificacion.csv',
    titulo: 'Expediente único de identificación',
    descripcion:
      'Lista de verificación del expediente por cliente, derivada de las obligaciones de identificación y expediente. Incluye las columnas de beneficiario controlador y de persona políticamente expuesta, que son las que más se olvidan.',
    formato: 'csv',
    fundamento: 'Obligaciones de identificación y expediente del corpus',
    adaptar: [
      'Añade las filas de debida diligencia reforzada si el cliente resultó de riesgo alto.',
      'Para persona moral y fideicomiso hacen falta documentos que no trae la versión de persona física.',
      'La fecha de actualización no es la de alta: el expediente se refresca durante la relación de negocios.',
    ],
    filas: pasosDe(['identificacion', 'expediente']),
  },
  {
    archivo: 'control-de-operaciones.csv',
    titulo: 'Control de operaciones y acumulación',
    descripcion:
      'Bitácora de operaciones con las columnas que hacen falta para decidir si nace el aviso: fecha, cliente, monto, forma de pago, umbral aplicable y acumulado móvil de seis meses. Es el insumo del aviso, no el aviso.',
    formato: 'csv',
    fundamento: 'Art. 17 LFPIORPI y regla de acumulación de seis meses',
    adaptar: [
      'El umbral depende de tu actividad y de la fecha de cada operación, no de la de hoy.',
      'La acumulación es una ventana móvil de seis meses hacia atrás desde cada operación, no un semestre de calendario.',
      'Si recibes efectivo, añade la comprobación del límite del artículo 32, que se mide con IVA incluido.',
    ],
    filas: 12,
  },
  {
    archivo: 'registro-de-capacitacion.csv',
    titulo: 'Registro anual de capacitación',
    descripcion:
      'Control por persona del programa anual: quién se capacitó, en qué, cuándo, con qué resultado y dónde está la constancia. El primer periodo obligatorio corre del 1 de enero al 31 de diciembre de 2027.',
    formato: 'csv',
    fundamento: 'Obligación de capacitación anual y Acuerdo 115/2026',
    adaptar: [
      'Una fila por persona, no por sesión: la obligación es individual.',
      'Incluye al órgano de administración y a la dirección, no sólo al personal de mostrador.',
      'La columna de evaluación es la que separa demostrar aprovechamiento de demostrar asistencia.',
    ],
    filas: 8,
  },
  {
    archivo: 'matriz-de-riesgos.csv',
    titulo: 'Matriz de riesgos',
    descripcion:
      'Estructura de la metodología de enfoque basado en riesgos: factores, peso, nivel evaluado, mitigantes aplicados y nivel residual, con la fecha de la próxima revisión.',
    formato: 'csv',
    fundamento: 'Metodología de enfoque basado en riesgos del Acuerdo 115/2026',
    adaptar: [
      'Los pesos son un punto de partida, no una recomendación: tienen que reflejar tu negocio y estar justificados por escrito.',
      'Añade los factores geográficos de las plazas donde realmente operas.',
      'Un riesgo residual alto exige medidas documentadas, no sólo la etiqueta.',
    ],
    filas: 10,
  },
  {
    archivo: 'manual-de-politicas.md',
    titulo: 'Índice del manual de políticas',
    descripcion:
      'Estructura del manual con las secciones que exige el régimen y, en cada una, qué debe contener y qué error se comete con más frecuencia. Es un índice comentado para que escribas el tuyo, no un manual para firmar.',
    formato: 'md',
    fundamento: 'Contenido mínimo del manual según el corpus de obligaciones',
    adaptar: [
      'Es un esqueleto: cada sección está vacía a propósito, porque su contenido depende de lo que hace tu negocio.',
      'Un manual copiado se detecta en la primera pregunta de la auditoría, que suele ser sobre un procedimiento concreto.',
      'Tiene que aprobarlo el órgano de administración y quedar constancia de la fecha.',
    ],
    filas: obligacionesPorCategoria(['gobierno', 'riesgos', 'identificacion', 'expediente', 'avisos'])
      .length,
  },
];

export const PLANTILLA_POR_ARCHIVO = new Map(PLANTILLAS.map((p) => [p.archivo, p]));
