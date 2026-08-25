/**
 * Contenido de la landing de la app Android «Ley AntiLavado MX».
 *
 * Todo lo que se afirma aquí está tomado del proyecto de la app —su README y
 * su política de privacidad— y no de suposiciones sobre lo que una app de
 * cumplimiento «debería» hacer. Si una función no está enviada, no se anuncia.
 *
 * Como en la extensión: ninguna cifra legal escrita a mano. La app usa el mismo
 * motor jurídico que este sitio, y ése es justamente el argumento; el valor de
 * la UMA o un umbral concreto se consultan en las páginas que los derivan.
 */

/**
 * Ficha en Google Play.
 *
 * Sin `&pli=1`, que es un parámetro de la sesión de quien copió el enlace y no
 * pertenece a la URL pública. Vaciar esta constante devuelve la página a
 * «próximamente», igual que en la extensión.
 */
export const URL_PLAY =
  'https://play.google.com/store/apps/details?id=org.leyantilavado.mx';

/** Identificador del paquete. Se usa también en `assetlinks.json`. */
export const PAQUETE_ANDROID = 'org.leyantilavado.mx';

export const APP = {
  nombre: 'Ley AntiLavado MX',
  tagline: 'El expediente entero, en el teléfono',
  entradilla:
    'App para Android que usa el mismo motor jurídico de este sitio. Registra tus operaciones, evalúa cada una contra el umbral que le toca por su fecha, y te avisa de lo que vence. Todo se guarda cifrado en tu dispositivo.',
} as const;

/**
 * Lo que la app responde, con el orden que la propia app promete:
 * respuesta → razón → fundamento → fuente.
 */
export const QUE_RESPONDE: readonly string[] = [
  '¿La Ley Antilavado aplica a mi negocio?',
  '¿Esta operación debe identificarse? ¿Debe generar aviso?',
  '¿Puedo aceptar este pago en efectivo?',
  '¿Cómo se acumulan las operaciones en seis meses?',
  '¿Cuál es mi próxima obligación y cuándo vence?',
  '¿Qué artículo y fracción sostienen el resultado?',
];

/**
 * En qué se diferencia de la extensión de Chrome.
 *
 * Existe esta sección porque son dos productos y la pregunta se va a hacer
 * sola. Presentarlos como equivalentes llevaría a alguien a instalar el que no
 * le sirve, que cuesta más que no instalar ninguno.
 */
export const FRENTE_A_LA_EXTENSION = {
  extension:
    'Resuelve una operación suelta mientras trabajas en el navegador. No guarda historial ni lleva seguimiento: respondes, cierras y sigues.',
  app: 'Lleva el expediente en el tiempo: perfiles de negocio, historial de operaciones, acumulación de seis meses, calendario de vencimientos y reportes. Es la herramienta de quien tiene que sostener el cumplimiento, no sólo resolver una duda.',
} as const;

/** Funciones enviadas. Ninguna en desarrollo, ninguna prometida. */
export const FUNCIONES: readonly { titulo: string; detalle: string }[] = [
  {
    titulo: 'El mismo motor jurídico del sitio',
    detalle:
      'No es una segunda interpretación de la ley: es el mismo motor portado. Cada resultado llega con su artículo, su fracción y la fuente oficial de la que sale.',
  },
  {
    titulo: 'Diagnóstico de tu negocio',
    detalle:
      'Determina qué actividades vulnerables realizas y qué obligaciones te genera cada una, en lugar de darte una lista genérica.',
  },
  {
    titulo: 'Registro de operaciones evaluadas',
    detalle:
      'Cada operación se evalúa con la regla vigente en su fecha —no con la de hoy— y queda registrada con el resultado y su fundamento.',
  },
  {
    titulo: 'Acumulación de seis meses',
    detalle:
      'Suma automáticamente las operaciones del mismo cliente en la ventana móvil, que es la regla que evita fraccionar y la que más se pasa por alto.',
  },
  {
    titulo: 'Calendario con avisos',
    detalle:
      'Notificaciones locales de lo que vence. La app no necesita conexión para recordártelo.',
  },
  {
    titulo: 'Reportes en PDF y CSV',
    detalle:
      'Para llevar a tu contador, a una auditoría o a un requerimiento, con el detalle de cómo se llegó a cada conclusión.',
  },
  {
    titulo: 'Auditorías comparables',
    detalle:
      'Cada revisión se contrasta contra la anterior: qué resolviste y qué se cayó desde entonces.',
  },
];

/**
 * Privacidad. Se resume de la política publicada en `/legal/privacidad-app`,
 * que es el documento que Google Play declara.
 */
export const PRIVACIDAD: readonly string[] = [
  'La app no recaba ningún dato personal, no los comparte con nadie y no los vende.',
  'Todo lo que capturas vive en el almacenamiento local de tu teléfono, en una base cifrada con SQLCipher y la llave en el Keystore de Android.',
  'Los campos de cliente están diseñados para no pedirte identidades: se usa un alias o una referencia interna, no el nombre ni el RFC.',
  'Sólo pide dos permisos: notificaciones, para recordarte los vencimientos, y ejecución al reiniciar, para que esos recordatorios sobrevivan a un apagado.',
];

/**
 * Deslinde, transcrito del propio proyecto.
 *
 * Va literal y no parafraseado: es la frase que la app enseña a sus usuarios, y
 * dos versiones distintas de la misma advertencia se leen como que una de las
 * dos se escribió a la ligera.
 */
export const DESLINDE =
  'Ley AntiLavado MX es una herramienta privada e independiente de carácter informativo. No sustituye asesoría legal, fiscal o contable. No es una aplicación del SAT, la UIF, la SHCP ni del Gobierno de México.';
