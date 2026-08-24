/**
 * Contenido de la landing de la extensión de Chrome «Ley Antilavado MX».
 *
 * La política de privacidad vive **dentro** de esta página, no en `/legal/`,
 * por decisión de producto: la Chrome Web Store exige una URL de política y
 * `/extension#privacidad` la sirve sin obligar al lector a salir de la página
 * que le explica qué hace la herramienta. Quien llega desde la ficha aterriza
 * en el mismo documento que le vendió la extensión, que es donde tiene sentido
 * leer qué hace con sus datos.
 *
 * Regla que este archivo respeta: ninguna cifra legal escrita a mano. Los
 * umbrales que la extensión calcula salen del motor cuando la página los
 * muestra; aquí sólo se describe *qué* hace, nunca *cuánto*.
 */

/**
 * URL de la ficha en la Chrome Web Store.
 *
 * Vacía a propósito mientras no exista: inventar un enlace de tienda es peor
 * que no ofrecerlo —lleva a un 404 desde la página que promete precisión— así
 * que la interfaz muestra «próximamente» hasta que se rellene.
 */
export const URL_TIENDA = '';

export const EXTENSION = {
  nombre: 'Ley Antilavado MX',
  tagline: 'El cálculo, no sólo el veredicto',
  entradilla:
    'Extensión de Chrome para quienes realizan Actividades Vulnerables. Analiza una operación y te dice si alcanza el umbral de identificación, el de Aviso, si debe acumularse y si hay restricción de efectivo —con el artículo, la UMA aplicada y el equivalente en pesos a la vista.',
} as const;

/** A quién va dirigida. Son los giros del art. 17, en el idioma del gremio. */
export const DESTINATARIOS: readonly string[] = [
  'Inmobiliarias y desarrolladoras',
  'Notarías',
  'Corredores públicos',
  'Agencias aduanales',
  'Joyerías y compra-oro',
  'Galerías y casas de arte',
  'Distribuidores de vehículos',
  'Blindadoras',
  'Donatarias',
  'Arrendadores',
  'Servicios profesionales',
  'Plataformas de activos virtuales',
];

/** Qué resuelve de una operación. */
export const QUE_RESUELVE: readonly { titulo: string; detalle: string }[] = [
  {
    titulo: 'Umbral de identificación',
    detalle: 'Si el importe alcanza el umbral que obliga a identificar al cliente.',
  },
  {
    titulo: 'Umbral de Aviso',
    detalle: 'Si alcanza el umbral que obliga a presentar Aviso, que es otro y casi siempre mayor.',
  },
  {
    titulo: 'Acumulación de seis meses',
    detalle:
      'Si debe sumarse con operaciones previas del mismo cliente, que es la regla que evita fraccionar.',
  },
  {
    titulo: 'Restricción de efectivo',
    detalle: 'Si el pago choca con las prohibiciones del artículo 32, que son un régimen aparte.',
  },
  {
    titulo: 'Expediente',
    detalle: 'Qué información y documentos conviene integrar para esa operación.',
  },
  {
    titulo: 'Fecha límite estimada',
    detalle: 'Cuándo vencería el Aviso, contando desde la fecha de la operación.',
  },
];

/**
 * Lo que la distingue.
 *
 * Redactado como diferencias comprobables, no como adjetivos: cada punto
 * describe algo que el usuario puede verificar en pantalla.
 */
export const DIFERENCIAS: readonly { titulo: string; detalle: string }[] = [
  {
    titulo: 'Enseña el cálculo completo',
    detalle:
      'No un sí o un no. Ves el importe capturado, la UMA aplicable, el equivalente en pesos, el umbral y el comparador exacto que se usó.',
  },
  {
    titulo: 'Usa la regla vigente en la fecha de la operación',
    detalle:
      'No la de hoy. La UMA cambia el 1 de febrero, así que una operación de enero se rige por el valor del año anterior. Es el error más común del sector y aquí no puede ocurrir.',
  },
  {
    titulo: 'Cada resultado cita su fuente',
    detalle:
      'Artículo, fuente oficial, vigencia y fecha de última verificación, debajo de cada conclusión.',
  },
  {
    titulo: 'Cuando no puede concluir, lo dice',
    detalle:
      'No adivina umbrales ni rellena huecos. Si un supuesto no tiene cifra publicada por la autoridad, la extensión lo declara en vez de inventarla.',
  },
];

/** Cómo se usa, en dos caminos. */
export const COMO_SE_USA: readonly { paso: string; detalle: string }[] = [
  {
    paso: 'Selecciona una cantidad en cualquier página',
    detalle:
      'Clic derecho y «Analizar con Ley Antilavado MX». Se abre el panel lateral con el importe ya detectado.',
  },
  {
    paso: 'Completa lo que falte',
    detalle:
      'Actividad, fecha, forma de pago y el alias o folio del cliente. Nada más: no se pide nombre ni RFC.',
  },
  {
    paso: 'Lee el resultado con su fundamento',
    detalle:
      'Cada obligación se evalúa por separado, con su importe, su UMA y su umbral. También puedes capturar una operación desde cero.',
  },
];

/* ── Política de privacidad ────────────────────────────────────────────────
 * Se transcribe del documento de la extensión. Va en la misma página a
 * propósito (ver el comentario de cabecera).
 * ────────────────────────────────────────────────────────────────────────── */

export const PRIVACIDAD_ACTUALIZADA = '2026-08-23';

export const PRIVACIDAD_RESUMEN =
  'Funciona sin cuenta y sin servidores. Todo lo que capturas se queda en tu navegador. La extensión no envía tus datos a ningún lado, ni a nosotros ni a terceros, porque no tiene a dónde enviarlos: no incluye ningún cliente de red.';

export const DATOS_GUARDADOS: readonly { donde: string; que: readonly string[] }[] = [
  {
    donde: 'IndexedDB, dentro de tu perfil de Chrome',
    que: [
      'Operaciones que capturas: importe, moneda, fecha, actividad vulnerable, subtipo, forma de pago, alias o folio del cliente, notas internas y estado interno.',
      'Resultados de análisis y la versión de reglas con que se calcularon.',
      'Recordatorios y el estado del checklist documental.',
      'Una bitácora local mínima —qué tipo de acción ocurrió y cuándo—. No guarda montos ni alias.',
    ],
  },
  {
    donde: '`chrome.storage.local`',
    que: ['Tus preferencias: tema, zona horaria, actividades usadas, recordatorios y la confirmación antes de eliminar.'],
  },
  {
    donde: '`chrome.storage.session` (memoria; se borra al cerrar el navegador)',
    que: ['La cifra que seleccionaste al usar el menú contextual, sólo mientras el panel la recoge.'],
  },
];

export const NO_SE_RECOPILA: readonly { titulo: string; detalle: string }[] = [
  {
    titulo: 'Ninguna analítica',
    detalle: 'No hay telemetría, ni eventos, ni identificadores de usuario.',
  },
  {
    titulo: 'Ningún dato personal identificable de tus clientes',
    detalle:
      'Se pide alias, número de expediente o folio interno. No se pide nombre completo, RFC, CURP, domicilio ni identificación oficial —y la validación rechaza cadenas con forma de RFC o CURP.',
  },
  {
    titulo: 'Ninguna URL ni contenido de las páginas que visitas',
    detalle:
      'Sólo llega el texto que tú seleccionaste y enviaste por el menú contextual, y ni siquiera eso se guarda en la base.',
  },
  {
    titulo: 'Ninguna credencial',
    detalle:
      'No se guardan contraseñas, e.firma, certificados .cer o .key, ni claves del SAT. La extensión no intercepta tráfico del SAT ni modifica sus formularios.',
  },
  {
    titulo: 'Ningún documento',
    detalle: 'El checklist registra el estado de cada requisito, nunca archivos.',
  },
];

export const PERMISOS: readonly { permiso: string; paraQue: string; porQue: string }[] = [
  {
    permiso: 'storage',
    paraQue: 'Guardar tus preferencias y el traspaso efímero del menú contextual.',
    porQue: 'Sin él no hay forma de recordar nada entre aperturas del panel.',
  },
  {
    permiso: 'sidePanel',
    paraQue: 'La interfaz principal es el panel lateral de Chrome.',
    porQue: 'Es el permiso que habilita `side_panel`; lo agrega el propio manifiesto al existir esa pantalla.',
  },
  {
    permiso: 'contextMenus',
    paraQue: 'Agregar «Analizar con Ley Antilavado MX» al clic derecho cuando hay texto seleccionado.',
    porQue: 'Es el mecanismo del flujo principal del producto.',
  },
  {
    permiso: 'activeTab',
    paraQue: 'Abrir el panel en la pestaña donde estás, sólo después de que haces clic en el menú o en el icono.',
    porQue: 'Es la alternativa mínima a pedir acceso permanente a todos los sitios.',
  },
  {
    permiso: 'alarms',
    paraQue: 'Programar los recordatorios de fecha límite.',
    porQue: 'Un service worker de Manifest V3 se suspende; sin `alarms` no hay recordatorios.',
  },
  {
    permiso: 'notifications',
    paraQue: 'Avisarte de un pendiente próximo.',
    porQue: 'Es la única forma de avisar con el panel cerrado.',
  },
];

/**
 * Permisos que NO se piden.
 *
 * Enumerarlos vale más que la lista de los que sí: un permiso ausente es una
 * promesa comprobable —Chrome la enseña al instalar— mientras que «respetamos
 * tu privacidad» no lo es.
 */
export const PERMISOS_NO_PEDIDOS: readonly string[] = [
  '<all_urls>',
  'history',
  'cookies',
  'webRequest',
  'webRequestBlocking',
  'tabs permanente',
  'acceso a páginas del SAT',
  'acceso a sitios bancarios',
  'scripting',
];

export const SEGURIDAD: readonly string[] = [
  'Manifest V3 con Content Security Policy estricta (`script-src \'self\'`).',
  'Todo el código va dentro del paquete: no se carga ni ejecuta código remoto.',
  'Sin `eval`, sin `new Function`, sin HTML sin sanitizar.',
  'Todo respaldo importado se valida con esquemas antes de tocar la base de datos.',
  'El texto que viene de páginas web se sanea —caracteres de control y marcas bidireccionales invisibles— antes de mostrarse.',
];

export const CONTROL_DE_DATOS: readonly { accion: string; detalle: string }[] = [
  {
    accion: 'Exportar',
    detalle:
      'Configuración → Exportar respaldo. Genera un JSON completo o un CSV de operaciones, descargados a tu equipo.',
  },
  {
    accion: 'Importar',
    detalle:
      'Se valida, se te muestra una previsualización y se detectan duplicados. Nunca se sobrescribe sin tu confirmación explícita.',
  },
  {
    accion: 'Borrar todo',
    detalle:
      'Configuración → Borrar todos los datos. Exige confirmación, escribir la palabra BORRAR, y te ofrece exportar un respaldo antes. No se puede deshacer.',
  },
  {
    accion: 'Desinstalar',
    detalle: 'Elimina IndexedDB y `chrome.storage` de tu perfil.',
  },
];
