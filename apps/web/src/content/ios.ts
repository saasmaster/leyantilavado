/**
 * Contenido de la landing de iOS de «Ley AntiLavado MX».
 *
 * Todo lo que se afirma aquí sale del proyecto real de la app —su README, sus
 * entitlements y su política— y no de suposiciones sobre lo que una app de
 * cumplimiento «debería» hacer. Si una función no está enviada, no se anuncia.
 *
 * Ninguna cifra legal escrita a mano: la app usa el mismo motor jurídico que
 * este sitio, y ése es justamente el argumento.
 */

/**
 * Ficha en el App Store.
 *
 * **Vacía a propósito.** La app está compilada, probada y con las capturas
 * hechas, pero NO está publicada. Mientras esta constante esté vacía la página
 * dice «próximamente» en vez de ofrecer una descarga que no existe, igual que
 * hicieron la extensión y la de Android antes de salir.
 *
 * Al publicarla, aquí va la URL de la ficha —y sólo eso: sin `?l=es` ni
 * parámetros de campaña, que pertenecen a quien comparte el enlace y no a la
 * dirección pública.
 */
export const URL_APP_STORE = '';

/** Identificador del paquete. El mismo que en Android: es la misma app. */
export const PAQUETE = 'org.leyantilavado.mx';

/**
 * `appID` de los Universal Links: `TeamID.bundleId`.
 *
 * El Team ID sale de la cuenta de desarrollador. Si algún día cambia —por
 * ejemplo al pasar de inscripción individual a una razón social— hay que
 * cambiarlo aquí, y los enlaces de los teléfonos ya instalados NO se corrigen
 * solos: se revalida al reinstalar.
 */
export const APP_ID_IOS = 'FW2LY5P532.org.leyantilavado.mx';

/**
 * Rutas que abren la app en vez del navegador.
 *
 * Coincide con el `pathPrefix="/app"` de Android a propósito: un solo espacio
 * de enlaces profundos para las dos plataformas. Por eso ESTA página vive en
 * `/ios` y no en `/app/ios` — si colgara de ahí, un iPhone con la app instalada
 * abriría la app en lugar de mostrar la página que invita a instalarla.
 */
export const RUTAS_ENLACE_UNIVERSAL: readonly string[] = ['/app/*'];

export const IOS = {
  nombre: 'Ley AntiLavado MX',
  tagline: 'El mismo motor jurídico, en tu iPhone',
  entradilla:
    'App para iPhone y iPad que registra tus operaciones, evalúa cada una contra el umbral que le toca por su fecha y te avisa de lo que vence. Todo se guarda cifrado en el dispositivo, sin cuenta y sin servidores.',
} as const;

/** Requisitos reales del binario, no los de una plantilla de tienda. */
export const REQUISITOS: readonly { que: string; valor: string }[] = [
  { que: 'Sistema', valor: 'iOS 15 o posterior' },
  { que: 'Dispositivos', valor: 'iPhone y iPad, vertical y horizontal' },
  { que: 'Idioma', valor: 'Español de México' },
  { que: 'Conexión', valor: 'No necesita: funciona sin red' },
];

/**
 * Lo que la app responde, en el orden que ella misma promete:
 * respuesta → razón → fundamento → fuente. Nunca un sí o un no a secas.
 */
export const QUE_RESPONDE: readonly string[] = [
  '¿La Ley Antilavado aplica a mi negocio?',
  '¿Esta operación debe identificarse? ¿Debe generar aviso?',
  '¿Puedo aceptar este pago en efectivo, y hasta cuánto?',
  '¿Se acumula con lo que este cliente ya me compró?',
  '¿Qué se me vence, y cuándo exactamente?',
  '¿De qué artículo sale esta respuesta?',
];

/**
 * Diferencias reales frente a la de Android.
 *
 * No es una lista de marketing: son las tres cosas que sólo existen en iOS y
 * que alguien que ya usa la de Android querría saber antes de cambiar.
 */
export const FRENTE_A_ANDROID: readonly { titulo: string; detalle: string }[] = [
  {
    titulo: 'Es la misma app, no un port',
    detalle:
      'Un solo proyecto y un solo motor jurídico. Se descartó reescribirla en Swift justamente para que iOS y Android no le contesten cosas distintas al mismo contador cuando cambie la UMA.',
  },
  {
    titulo: 'Bloqueo con Face ID o Touch ID',
    detalle:
      'El expediente queda detrás de la biometría del sistema. La app no guarda tu huella ni tu rostro: sólo le pregunta a iOS si eres tú.',
  },
  {
    titulo: 'Compra única, no suscripción',
    detalle:
      'PRO se compra una vez con tu Apple ID y se restaura en tus dispositivos. No hay renovación automática ni cobro recurrente.',
  },
];

/** Lo que hace, contado por lo que resuelve y no por la pantalla que tiene. */
export const FUNCIONES: readonly { titulo: string; detalle: string }[] = [
  {
    titulo: 'Evalúa la operación con la UMA de su fecha',
    detalle:
      'Una operación de enero se mide con la UMA del año anterior, no con la de hoy. La app aplica la que corresponde y enseña cuál usó, con el artículo del que sale el umbral.',
  },
  {
    titulo: 'Acumula seis meses hacia atrás',
    detalle:
      'La regla antifraccionamiento del art. 17 suma las operaciones del mismo cliente por el mismo tipo de acto. Es una ventana móvil desde la fecha que elijas, no el semestre natural — la confusión más cara de esta ley.',
  },
  {
    titulo: 'Verifica el efectivo del art. 32',
    detalle:
      'Ese artículo no es un umbral de reporte: es una prohibición, y se mide con IVA incluido. La app dice hasta cuánto puedes liquidar en efectivo y cuánto tiene que ir por otro medio.',
  },
  {
    titulo: 'Te avisa de lo que vence',
    detalle:
      'El calendario separa lo urgente de lo que tiene tiempo, con el artículo de cada obligación. Las notificaciones son locales: no salen del teléfono.',
  },
  {
    titulo: 'Exporta tu expediente',
    detalle:
      'CSV de operaciones y respaldo cifrado con frase propia, para que lo que capturaste sea tuyo y puedas llevártelo.',
  },
];

/**
 * Privacidad, en las afirmaciones que el código sostiene.
 *
 * Cada línea es comprobable en el binario. La del cifrado es literal: la app
 * exige `PRAGMA cipher_version` al abrir la base, porque SQLite ignora en
 * silencio los PRAGMA que no conoce y sin esa comprobación la palabra
 * «cifrada» podía ser falsa sin que nadie lo notara.
 */
export const PRIVACIDAD: readonly string[] = [
  'No hay cuenta. No pide correo, teléfono ni registro para funcionar.',
  'No hay servidor propio. Lo que capturas no se sube a ningún lado; no existe un backend donde pudiera estar.',
  'La base de datos va cifrada en el dispositivo, y la app se niega a abrirla si el cifrado no está activo de verdad.',
  'No lleva analítica, ni rastreadores, ni identificadores de publicidad.',
  'Nunca pide tus credenciales del SAT ni presenta avisos por ti: el envío lo haces tú en el portal oficial.',
  'Las notificaciones se programan en el teléfono. No hay notificaciones push desde un servidor.',
];

export const DESLINDE =
  'Ley AntiLavado MX es una herramienta de apoyo de un proyecto privado e independiente. No pertenece ni está afiliada al SAT, a la UIF ni a ninguna autoridad, no presenta avisos por ti y no sustituye la asesoría de un profesional sobre un caso concreto.';
