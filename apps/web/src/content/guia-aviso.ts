/* ────────────────────────────────────────────────────────────────────────────
 * Guía de presentación de avisos: plantilla → XML → carga → acuse.
 *
 * Regla que manda sobre este archivo: NINGÚN paso, nombre de botón, campo,
 * sección del portal ni mensaje de error se escribe de memoria. Cada uno lleva
 * `fuenteId` apuntando a un documento de `FUENTES_GUIA`, y los literales del
 * instructivo oficial se transcriben tal cual en `literal`.
 *
 * Lo que la fuente oficial no dice NO se rellena: se declara en
 * `HUECOS_DECLARADOS`, que la página imprime. Un hueco declarado vale más que
 * un código de error inventado.
 *
 * Ninguna cifra legal vive aquí: los plazos y umbrales salen del motor. Las
 * únicas cifras de este archivo son técnicas del aplicativo (2 MB de tamaño
 * máximo del XML, Excel 2007) y vienen citadas del instructivo del SAT.
 * ────────────────────────────────────────────────────────────────────────── */

export interface FuenteGuia {
  id: string;
  nombre: string;
  emisor: string;
  url: string;
  /** ISO date en que se descargó y se leyó el documento. */
  consultadaEl: string;
  nota?: string;
}

export interface PasoGuia {
  id: string;
  titulo: string;
  detalle: readonly string[];
  /** Transcripción textual del instructivo oficial, cuando la hay. */
  literal?: string;
  fuenteId: string;
}

export interface CausaErrorValidacion {
  id: string;
  /** Lo que ve el usuario. */
  sintoma: string;
  /** Lo que la fuente oficial dice que lo causa. */
  causa: string;
  queHacer: string;
  fuenteId: string;
}

export interface HuecoDeclarado {
  id: string;
  titulo: string;
  queNoEstaPublicado: string;
  queHacerMientrasTanto: string;
}

export interface CanalAlterno {
  id: string;
  titulo: string;
  quien: string;
  cita: string;
  disposicion: string;
  nota?: string;
}

export interface NotaLegalGuia {
  id: string;
  titulo: string;
  parrafos: readonly string[];
  disposicion: string;
  /** Marca el dato que debería vivir en el motor y todavía no vive ahí. */
  deberiaSubirAlMotor?: string;
}

export interface PreguntaGuia {
  pregunta: string;
  respuesta: string;
}

/* ── Fuentes ─────────────────────────────────────────────────────────────── */

/**
 * Línea base de integridad, tomada el 1-sep-2026.
 *
 * El monitor regulatorio (`api/cron/monitor-fuentes`) vigila las siete fuentes
 * de `datos.FUENTES` por hash, pero NO estos ocho documentos: son la guía
 * operativa del portal, no el corpus legal, y se quedaron fuera. Sin una línea
 * base, `consultadaEl` sólo puede afirmar «alguien lo abrió ese día» — nunca
 * «sigue diciendo lo mismo».
 *
 * Estos son los sha-256 (12 primeros caracteres) y el tamaño en bytes con que
 * se descargaron. La próxima pasada que los reproduzca puede mover
 * `consultadaEl` sabiendo lo que afirma; la que encuentre uno distinto tiene
 * que volver a leer ESE documento antes de tocar su fecha.
 *
 *   inst_excel.pdf          f862df43e2c2   7 658 971
 *   inst_excel2.pdf         be6ee60d3680   6 552 296
 *   inst_modificatorio.pdf  c5d1c86f5546   1 581 465
 *   inst_baja.pdf           35b3941213e0   1 567 486
 *   sppld.html              131122f9caa4      26 304
 *   tecnica.html            54cda020b107      24 261
 *   preguntas.html          880a3e5fb397     303 971
 *   sppld/ (aplicativo)     e19a65848288         481
 *
 * Las dos páginas HTML del SAT llevan marco de gob.mx: un cambio de hash puede
 * ser el pie de página del portal y no el contenido. Cambió el hash, se lee el
 * documento; no se deduce nada del número solo.
 */
export const FUENTES_GUIA: readonly FuenteGuia[] = [
  {
    id: 'inst-excel',
    nombre: 'Instructivo Excel — cómo generar el archivo XML de Avisos',
    emisor: 'SHCP / SAT — Portal de Prevención de Lavado de Dinero',
    url: 'https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/inst_excel.pdf',
    consultadaEl: '2026-09-01',
    nota:
      'Once pasos ilustrados con capturas de pantalla. Es el documento que el portal enlaza desde la sección «Sistema del Portal en Internet [SPPLD]».',
  },
  {
    id: 'inst-excel2',
    nombre: 'Instructivo Excel (variante inst_excel2.pdf)',
    emisor: 'SHCP / SAT — Portal de Prevención de Lavado de Dinero',
    url: 'https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/inst_excel2.pdf',
    consultadaEl: '2026-09-01',
    nota:
      'Mismo contenido que inst_excel.pdf salvo por una línea: esta variante NO incluye la advertencia del tamaño máximo de 2 MB del XML. Si trabajas con una copia descargada hace tiempo, revisa cuál de las dos tienes.',
  },
  {
    id: 'inst-modificatorio',
    nombre: '¿Cómo presentar un Aviso Modificatorio?',
    emisor: 'SHCP / SAT — Portal de Prevención de Lavado de Dinero',
    url: 'https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/inst_modificatorio.pdf',
    consultadaEl: '2026-09-01',
  },
  {
    id: 'inst-baja',
    nombre: '¿Cómo dar de Baja una Actividad Vulnerable?',
    emisor: 'SHCP / SAT — Portal de Prevención de Lavado de Dinero',
    url: 'https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/inst_baja.pdf',
    consultadaEl: '2026-09-01',
  },
  {
    id: 'sppld-sistema',
    nombre: 'Sistema del Portal en Internet [SPPLD]',
    emisor: 'SAT',
    url: 'https://sppld.sat.gob.mx/pld/interiores/sppld.html',
    consultadaEl: '2026-09-01',
    nota:
      'Describe las dos vías de presentación —captura en línea y envío masivo— y los requisitos de navegador.',
  },
  {
    id: 'sppld-tecnica',
    nombre: 'Recomendaciones técnicas del portal',
    emisor: 'SAT',
    url: 'https://sppld.sat.gob.mx/pld/interiores/tecnica.html',
    consultadaEl: '2026-09-01',
  },
  {
    id: 'sppld-preguntas',
    nombre: 'Preguntas frecuentes y criterios',
    emisor: 'SAT',
    url: 'https://sppld.sat.gob.mx/pld/interiores/preguntas.html',
    consultadaEl: '2026-09-01',
    nota:
      'La propia página advierte que sus respuestas «tienen carácter orientativo e informativo y en ningún caso constituyen un acto de autoridad o una interpretación».',
  },
  {
    id: 'sppld-acceso',
    nombre: 'Acceso al Sistema del Portal en Internet [SPPLD]',
    emisor: 'SAT',
    url: 'https://sppld.sat.gob.mx/sppld/',
    consultadaEl: '2026-09-01',
    nota: 'Aplicativo autenticado. Las plantillas .xlsm se descargan desde dentro, no desde el sitio público.',
  },
];

export const FUENTES_GUIA_POR_ID: Record<string, FuenteGuia> = Object.fromEntries(
  FUENTES_GUIA.map((f) => [f.id, f]),
);

/* ── Antes de empezar ────────────────────────────────────────────────────── */

export const REQUISITOS: readonly PasoGuia[] = [
  {
    id: 'alta',
    titulo: 'Estar dado de alta en el padrón, con RFC y e.firma vigente',
    detalle: [
      'El trámite de alta y registro se presenta ante el SAT por el Portal de Prevención de Lavado de Dinero.',
      'Sin alta no hay sesión, y sin sesión no hay dónde cargar el archivo: el aviso no se manda por correo ni por escrito libre.',
    ],
    literal:
      'Estar inscritos en el Registro Federal de Contribuyentes. Firma Electrónica Avanzada vigente. Asimismo, se deberá de cumplir con los requisitos previstos en el Artículo 4 de las Reglas de Carácter General a que se refiere la Ley.',
    fuenteId: 'sppld-preguntas',
  },
  {
    id: 'navegador',
    titulo: 'Entrar con Firefox o Chrome actualizados',
    detalle: [
      'El portal lo dice por escrito y conviene tomárselo en serio: es la causa más aburrida de que un envío se quede a medias.',
      'No hace falta bajar la seguridad del navegador; el propio portal recomienda dejar la configuración por defecto.',
    ],
    literal:
      'Firefox y Google Chrome en sus ultimas versiones. IE y Edge no son navegadores recomendados.',
    fuenteId: 'sppld-sistema',
  },
  {
    id: 'excel',
    titulo: 'Tener Microsoft Excel 2007 o posterior',
    detalle: [
      'La plantilla es un archivo .xlsm: un libro de Excel con macros. Sin ellas no se genera el XML.',
      'El instructivo no menciona compatibilidad con LibreOffice, Numbers ni con Excel en el navegador. No lo afirmamos ni lo negamos: no está documentado.',
    ],
    literal:
      'Verifica que tu computadora tenga instalado Microsoft Excel 2007 o posterior. Puedes localizarlo dentro de la paquetería Microsoft Office.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'horario',
    titulo: 'El sistema opera todo el año, pero el plazo no se estira',
    detalle: [
      'El portal funciona las 24 horas los 365 días del año. Eso facilita presentar de madrugada; no mueve la fecha límite ni un día.',
      'El SAT es explícito en que este portal es el único medio para reportar avisos de operaciones e informes en ceros.',
    ],
    literal:
      'Recuerda que el único medio para reportar Avisos de operaciones e Informes en cero es a través del Sistema del Portal de Prevención de Lavado de Dinero [SPPLD] en internet.',
    fuenteId: 'sppld-sistema',
  },
];

/* ── Las dos vías ────────────────────────────────────────────────────────── */

export const VIAS = [
  {
    id: 'captura',
    titulo: 'Captura de avisos',
    descripcion:
      'Se capturan los avisos uno a uno, en línea, dentro del sistema. No se genera ningún archivo: los datos se escriben en la pantalla del portal.',
    cuandoConviene:
      'Cuando son pocas operaciones al mes y nadie más las revisa antes de enviarlas.',
    literal:
      'Esta opción deberá ser usada para capturar los Avisos en línea dentro del Sistema del Portal de Prevención de Lavado de Dinero [SPPLD] y se realiza a través de la opción "Captura de avisos".',
    fuenteId: 'sppld-sistema',
  },
  {
    id: 'masivo',
    titulo: 'Envío masivo de Avisos',
    descripcion:
      'Se llena la plantilla descargable de Excel, se genera un archivo XML y ese archivo se sube al portal.',
    cuandoConviene:
      'Cuando hay volumen, cuando la información sale de otro sistema, o cuando alguien tiene que revisar y aprobar antes del envío: el XML es un documento revisable y archivable, la captura en pantalla no.',
    literal:
      'Esta opción deberá ser usada si deseas reportar a través de las plantillas descargables en Excel, generar un archivo "XML" y enviarlo con ayuda de la opción "Envío masivo de Avisos" dentro del Sistema del Portal de Prevención de Lavado de Dinero [SPPLD].',
    fuenteId: 'sppld-sistema',
  },
] as const;

/* ── El flujo completo ───────────────────────────────────────────────────── */

export const PASOS_FLUJO: readonly PasoGuia[] = [
  {
    id: 'descargar',
    titulo: 'Descargar la plantilla desde el menú «Actividades Vulnerables»',
    detalle: [
      'La plantilla vive dentro del sistema autenticado, no en una página pública que puedas guardar en favoritos. Hay que entrar con RFC y e.firma para llegar a ella.',
      'En Fe Pública y en Servicios Profesionales no hay una sola plantilla: primero se elige la actividad concreta en el listado que aparece en pantalla.',
    ],
    literal:
      'Descarga la plantilla en tu computadora. Podrás localizarla en el menú Actividades Vulnerables. En el caso de Fe Pública y Servicios Profesionales tendrás que seleccionar la actividad en el listado que se muestra en la pantalla.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'habilitar',
    titulo: 'Abrir el .xlsm y habilitar el contenido',
    detalle: [
      'Excel bloquea las macros de un archivo descargado de internet y muestra una barra amarilla de advertencia. Ahí está el punto donde más gente se atora sin saberlo: la plantilla se ve, se llena, y el botón que genera el XML no responde.',
      'El instructivo nombra la opción exacta: «Habilitar contenido». No hay que tocar ninguna otra configuración de seguridad ni ejecutar nada más.',
    ],
    literal:
      'Abre el archivo (.xlsm) y comprueba que estén habilitados todos los contenidos. Si deseas activarlos busca la opción Habilitar contenido y selecciónala.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'llenar',
    titulo: 'Llenar la plantilla conforme a la Resolución de formatos oficiales',
    detalle: [
      'La plantilla no es el formato: es la herramienta que captura el formato. El contenido obligatorio lo fija la Resolución por la que se expiden los formatos oficiales de los Avisos e Informes, publicada en el DOF el 30 de agosto de 2013 y reformada el 24 de julio de 2014.',
      'El propio instructivo liga el llenado con la validación posterior: los datos obligatorios que se dejan vacíos son la causa de error que la autoridad menciona por su nombre.',
    ],
    literal:
      'Recuerda que es importante capturar los datos obligatorios, esto evitará errores en la validación y generación de los archivos XML.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'generar',
    titulo: 'Pulsar «Validar datos- Generar archivo»',
    detalle: [
      'Ese es el nombre del botón tal como aparece en el instructivo, con su espaciado y todo. Hace las dos cosas de una vez: valida y, si pasa, escribe el XML.',
      'El archivo se guarda con el nombre que tú decidas. El instructivo pide que sea único, y tiene razón práctica: dos meses después, «aviso.xml» y «aviso (1).xml» son indistinguibles frente a un auditor.',
      'Sugerencia nuestra, no del instructivo: nombra el archivo con RFC, periodo y actividad, y guárdalo junto a su acuse.',
    ],
    literal:
      'Al terminar de capturar los datos da click en el botón Validar datos- Generar archivo. de esta forma se generará un archivo XML que podrás guardar con el nombre que gustes, procura darle uno que sea único para evitar confusiones.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'extension',
    titulo: 'Comprobar que el archivo termine en .xml',
    detalle: [
      'Suena a detalle menor y el instructivo le dedica un paso entero, lo que dice bastante sobre la frecuencia con que ocurre.',
      'Si la extensión no es .xml, hay que renombrarlo a mano antes de subirlo.',
    ],
    literal:
      'Verifica que tu archivo termine con la extensión .xml. Es importante para que pueda ser enviado correctamente, si no es así, renómbralo.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'tamano',
    titulo: 'Revisar que el XML no pase de 2 MB',
    detalle: [
      'Es el único límite técnico que el instructivo publica, y lo publica en mayúsculas.',
      'Un mes con muchas operaciones puede rebasarlo. El instructivo no dice qué hacer entonces; lo que sí se desprende es que el archivo no se enviará tal cual.',
    ],
    literal: 'IMPORTANTE: EL TAMAÑO MÁXIMO PERMITIDO DE UN XML ES DE 2 MB.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'cargar',
    titulo: 'Iniciar sesión y cargar el archivo en «Envío masivo de avisos»',
    detalle: [
      'La sección tiene ese nombre exacto dentro del sistema. Es donde se sube el XML ya generado.',
    ],
    literal:
      'Busca el archivo y cárgalo en el portal. Ingresa al Sistema del Portal en Internet, inicia sesión y carga tu archivo en la sección Envío masivo de avisos.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'enviar',
    titulo: 'Pulsar «Enviar archivo»',
    detalle: [
      'Cargar no es enviar. Son dos acciones distintas y el trámite termina en la segunda.',
    ],
    literal: 'Presiona Enviar archivo para finalizar el proceso.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'acuse',
    titulo: 'Esperar unos minutos y descargar el acuse en «Ver Acuses»',
    detalle: [
      'El acuse no aparece al instante: el instructivo habla de unos minutos.',
      'Para verlo hay que capturar un rango de fechas. El portal advierte que sin rango la pantalla no muestra nada, lo que se confunde fácilmente con «no se presentó».',
      'El acuse es la única prueba de la presentación. Guárdalo en PDF junto al XML enviado, no dentro de un correo.',
    ],
    literal:
      'Después de unos minutos podrás consultar el Acuse en la sección Ver Acuses. Cuando requiera ver sus acuses dentro del "Sistema del Portal en Internet SPPLD" coloque un rango de fechas para poder visualizarlos, de lo contrario no se mostrarán.',
    fuenteId: 'inst-excel',
  },
];

/* ── Errores de validación ───────────────────────────────────────────────── */

/**
 * Sobre esta sección.
 *
 * La consulta desesperada —«¿qué significa este error?»— no tiene respuesta
 * oficial publicada: el SAT no publica catálogo de códigos ni de mensajes. Lo
 * único que dice el instructivo es que se abre una ventana que detalla dónde y
 * cómo resolverlo.
 *
 * Así que aquí NO hay códigos de error. Hay causas documentadas: cada una sale
 * de una línea del instructivo o del portal, con su literal. Inventar un
 * catálogo sería exactamente el daño que este sitio existe para no hacer.
 */
export const QUE_DICE_LA_AUTORIDAD_SOBRE_ERRORES = {
  literal:
    'En caso de que se presente algún error durante la validación se notificará con una ventana detallando dónde y cómo resolverlo.',
  fuenteId: 'inst-excel',
} as const;

export const CAUSAS_ERROR: readonly CausaErrorValidacion[] = [
  {
    id: 'macros',
    sintoma: 'El botón de validar y generar no hace nada, o no aparece.',
    causa:
      'El contenido de la plantilla no está habilitado. Es un archivo .xlsm y sus macros vienen bloqueadas por Excel al descargarlo.',
    queHacer:
      'Cerrar el archivo, volver a abrirlo y usar la opción «Habilitar contenido» antes de capturar nada. Si ya capturaste, revisa que el contenido siga habilitado antes de generar.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'obligatorios',
    sintoma: 'La validación se detiene y señala una celda o un bloque de la plantilla.',
    causa:
      'Faltan datos obligatorios. Es la única causa de error de validación que el instructivo nombra expresamente.',
    queHacer:
      'Ir a la celda que la ventana indica y completarla. El instructivo dice que la ventana detalla dónde y cómo resolverlo: léela entera antes de tocar la plantilla, es la información más específica que el sistema da.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'formato-oficial',
    sintoma:
      'Los datos parecen completos y la validación sigue rechazándolos, o el portal rechaza un XML que Excel sí generó.',
    causa:
      'El contenido no corresponde al formato oficial vigente. El formato lo fija la Resolución publicada en el DOF el 30 de agosto de 2013 y reformada el 24 de julio de 2014, no la costumbre de la empresa.',
    queHacer:
      'Volver a descargar la plantilla desde el portal —no reutilizar la del año pasado— y contrastar los catálogos de la plantilla nueva contra los datos que estás capturando.',
    fuenteId: 'sppld-preguntas',
  },
  {
    id: 'extension',
    sintoma: 'El portal no acepta el archivo al intentar cargarlo.',
    causa:
      'El archivo no termina en .xml. El instructivo le dedica un paso propio, lo que sugiere que pasa a menudo.',
    queHacer: 'Renombrar el archivo para que termine en .xml y volver a cargarlo.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'tamano',
    sintoma: 'Un archivo grande no se envía.',
    causa: 'El XML supera el tamaño máximo permitido de 2 MB.',
    queHacer:
      'Reducir el número de avisos por archivo. El instructivo publica el límite pero no describe un procedimiento de partición; si tu mes no cabe, esa es una consulta para el SAT antes de la fecha límite, no el día 17.',
    fuenteId: 'inst-excel',
  },
  {
    id: 'navegador',
    sintoma: 'La carga se queda a medias, la pantalla no avanza o no aparece el acuse.',
    causa:
      'Navegador no recomendado o sesión con contenido en caché. El portal recomienda Firefox y Chrome actualizados y desaconseja Internet Explorer y Edge.',
    queHacer:
      'Cambiar de navegador y actualizar la página con F5, que es la recomendación literal del portal. Después, confirmar en «Ver Acuses» con un rango de fechas si el envío entró o no: puede haber entrado aunque la pantalla se haya quedado.',
    fuenteId: 'sppld-tecnica',
  },
];

/* ── Huecos declarados ───────────────────────────────────────────────────── */

export const HUECOS_DECLARADOS: readonly HuecoDeclarado[] = [
  {
    id: 'catalogo-errores',
    titulo: 'No existe un catálogo público de mensajes ni de códigos de error',
    queNoEstaPublicado:
      'Ni el instructivo del SAT ni el sitio público del SPPLD publican la lista de errores de validación con su significado. El instructivo se limita a decir que se abre una ventana que detalla dónde y cómo resolverlo.',
    queHacerMientrasTanto:
      'Captura de pantalla del mensaje completo y consulta al SAT por Mi Portal antes de la fecha límite. Si alguien te ofrece un «catálogo de errores del SPPLD», pídele la fuente oficial: no la va a tener.',
  },
  {
    id: 'esquema-xml',
    titulo: 'Los esquemas del XML no están publicados en el sitio público',
    queNoEstaPublicado:
      'Las plantillas .xlsm y sus estructuras viven dentro del aplicativo autenticado. En el sitio público del portal no hay XSD, ni diccionario de campos, ni ejemplos de XML válidos que podamos citar.',
    queHacerMientrasTanto:
      'Genera el XML siempre con la plantilla oficial descargada de tu sesión. Construirlo a mano o con un generador de terceros es apostar contra un esquema que no puedes leer.',
  },
  {
    id: 'aviso-extemporaneo',
    titulo: 'No hay un flujo separado para el aviso extemporáneo',
    queNoEstaPublicado:
      'Ningún instructivo oficial describe una opción, casilla o sección distinta para presentar fuera de plazo. Existen instructivos para el aviso modificatorio y para la baja; no para el extemporáneo.',
    queHacerMientrasTanto:
      'Se presenta por la misma vía y con el periodo que le correspondía, no con el mes en curso. Lo que cambia es la consecuencia jurídica, no la pantalla.',
  },
  {
    id: 'plazo-modificatorio',
    titulo: 'El plazo para modificar no está en el instructivo',
    queNoEstaPublicado:
      'El instructivo del aviso modificatorio explica el procedimiento —folio, estatus aceptado— pero no menciona plazo ni número de correcciones permitidas. Ese límite proviene de las reglas de carácter general y en nuestra ficha todavía no lleva cita de artículo verificada.',
    queHacerMientrasTanto:
      'Trata la corrección como algo urgente y única: revisa antes de enviar, no después. Y confirma el plazo aplicable contra las reglas vigentes antes de apoyarte en él.',
  },
  {
    id: 'resolucion-formatos-24h',
    titulo: 'La Resolución de formatos que activa el aviso de 24 horas no aparece publicada',
    queNoEstaPublicado:
      'El aviso de veinticuatro horas existe en la norma, pero su envío está diferido hasta seis meses después de que entre en vigor la Resolución que actualice los formatos oficiales identificándolo expresamente. Esa Resolución no aparece publicada a la fecha de nuestra última revisión.',
    queHacerMientrasTanto:
      'Ten el procedimiento interno de detección, escalamiento y decisión funcionando: lo diferido es el envío por el formato oficial, no el deber de vigilar. Y desconfía de cualquier fecha concreta que veas circular.',
  },
];

/* ── Informe en ceros y exentos ──────────────────────────────────────────── */

export const NOTA_EXENTOS: NotaLegalGuia = {
  id: 'exentos-27-bis',
  titulo: 'El informe por operaciones exentas se llena con la plantilla de avisos',
  parrafos: [
    'Es la instrucción menos intuitiva de todo el instructivo y viene textual: cuando el informe se presenta porque los actos u operaciones están exentos de aviso en términos del artículo 27 Bis de las reglas de carácter general, no se usa la plantilla de informes, sino la de avisos con operaciones.',
    'Y se llena casi vacía: sólo RFC, periodo, y la marca de exento, que se indica colocando el número 1.',
    'No lo confundas con el informe en ceros. El informe en ceros dice «este mes no hubo nada que reportar»; éste dice «este mes hubo operaciones, y están exentas».',
  ],
  disposicion: 'Art. 27 Bis de las reglas de carácter general (vía instructivo del SAT)',
  deberiaSubirAlMotor:
    'El supuesto del art. 27 Bis y el informe del art. 25 Bis no están en `datos.OBLIGACIONES`; hoy sólo existe la obligación `informes-en-ceros`.',
};

export const LITERAL_EXENTOS =
  'En caso de que el Informe se presente porque los actos u operaciones están exentos de presentar avisos en términos del artículo 27 Bis de las reglas de carácter general a que se refiere la LFPIORPI, se deberá utilizar la plantilla Excel de Avisos con Operaciones y llenar únicamente los campos correspondientes al RFC, periodo e indicar que se trata de un exento colocando el número 1.';

/* ── Corrección ──────────────────────────────────────────────────────────── */

export const PASOS_MODIFICATORIO: readonly PasoGuia[] = [
  {
    id: 'ver-acuses',
    titulo: 'Entrar a la sesión y abrir «Ver Acuses»',
    detalle: ['Es la misma sección donde se descarga el acuse de un envío normal.'],
    literal: 'Ingrese a su sesión y presione Ver Acuses.',
    fuenteId: 'inst-modificatorio',
  },
  {
    id: 'rango',
    titulo: 'Capturar un rango de fechas para encontrar el aviso',
    detalle: [
      'Sin rango no se muestra nada. Si no recuerdas cuándo se envió, empieza por un rango amplio.',
    ],
    literal: 'Ingrese un rango de fechas para encontrar el Aviso que se quiere modificar.',
    fuenteId: 'inst-modificatorio',
  },
  {
    id: 'detalle',
    titulo: 'Abrir «Ver Detalle» y localizar el «Folio Aviso»',
    detalle: [
      'La pantalla muestra un PDF con la información del aviso. De ahí sale el folio.',
    ],
    literal:
      'Se desplegará una tabla con la información del Aviso correspondiente, presione Ver Detalle. La pantalla le mostrará un archivo PDF. Copie el Folio Aviso e ingréselo en el campo solicitado.',
    fuenteId: 'inst-modificatorio',
  },
  {
    id: 'capturar',
    titulo: 'Capturar y enviar el aviso como siempre, con el folio del original',
    detalle: [
      'El modificatorio no es un formulario distinto: es el mismo aviso, referido al folio del que corrige.',
    ],
    literal: 'Capture y mande su aviso como normalmente lo hace.',
    fuenteId: 'inst-modificatorio',
  },
];

export const LIMITES_MODIFICATORIO = [
  {
    id: 'aceptado',
    texto:
      'Sólo se puede modificar un aviso que aparezca en el acuse con estatus ACEPTADO. Si el original fue rechazado, no hay nada que modificar: hay que presentarlo.',
    literal:
      'El Aviso Modificatorio sólo se podrá presentar cuando el Aviso que se quiere modificar fue ACEPTADO, es decir aparezca en el Acuse con estatus ACEPTADO.',
    fuenteId: 'inst-modificatorio',
  },
  {
    id: 'ceros',
    texto:
      'Los informes en ceros no se pueden modificar. El instructivo lo dice en una nota de dos líneas, y las reglas de 2026 lo elevaron a texto normativo: una vez enviado, ni se modifica ni se elimina.',
    literal: 'Los INFORMES EN CERO no se pueden modificar.',
    fuenteId: 'inst-modificatorio',
  },
] as const;

/* ── Otros canales ───────────────────────────────────────────────────────── */

export const CANALES_ALTERNOS: readonly CanalAlterno[] = [
  {
    id: 'comercio-exterior',
    titulo: 'Comercio exterior: por el sistema del pedimento',
    quien:
      'Quienes realizan la actividad vulnerable de la fracción XIV del art. 17 —agentes y agencias aduanales, y quienes prestan servicios de comercio exterior en los supuestos de esa fracción—.',
    cita:
      '«Quienes realicen la Actividad Vulnerable referida en la fracción XIV del artículo 17 de la Ley, darán cumplimiento a la obligación de presentación de Avisos mediante el sistema electrónico por el cual se transmita la información del pedimento al SAT».',
    disposicion: 'Art. 16 del Reglamento de la LFPIORPI, reformado el 27 de marzo de 2026',
    nota:
      'No es una plantilla distinta: es otro sistema. Nada de lo que dice esta guía sobre el .xlsm y el envío masivo aplica a esa vía.',
  },
  {
    id: 'notarios',
    titulo: 'Notarios: por los medios de las disposiciones fiscales federales',
    quien:
      'Notarios públicos, y sólo respecto de los avisos del inciso a) del Apartado A de la fracción XII del art. 17.',
    cita:
      '«Las y los notarios públicos podrán cumplir las obligaciones de presentar los Avisos que señala el inciso a) del Apartado A de la fracción XII del artículo 17 de la Ley, únicamente cuando sean presentados a través de los medios que establezcan las disposiciones fiscales federales».',
    disposicion: 'Art. 24, último párrafo, de la LFPIORPI',
    nota:
      'Es una facilidad, no una sustitución general: alcanza a ese inciso, no a todos los avisos del notario. El resto sigue por el SPPLD.',
  },
  {
    id: 'entidad-colegiada',
    titulo: 'Entidad colegiada: presentar por conducto de un tercero autorizado',
    quien:
      'Cualquiera que realice actividades vulnerables, incluidas quienes actúan por medio de fideicomisos, si opta por hacerlo.',
    cita:
      'La ley abre la posibilidad de presentar los avisos por conducto de una entidad colegiada que cumpla los requisitos que la propia ley fija.',
    disposicion: 'Art. 26 de la LFPIORPI',
    nota:
      'Cambia quién oprime el botón, no de quién es la obligación ni la responsabilidad por lo que se informa.',
  },
];

/* ── Preguntas ───────────────────────────────────────────────────────────── */

export const FAQ_GUIA: readonly PreguntaGuia[] = [
  {
    pregunta: '¿Puedo generar el XML sin usar la plantilla de Excel?',
    respuesta:
      'No con información que podamos respaldar. Los esquemas del XML no están publicados en el sitio público del portal: la plantilla .xlsm que se descarga desde tu sesión es la única forma documentada de producir un archivo con la estructura que el sistema espera. La otra vía oficial es capturar los avisos en línea, sin archivo.',
  },
  {
    pregunta: 'Habilité las macros y el botón sigue sin generar nada. ¿Qué reviso?',
    respuesta:
      'Que el archivo sea realmente el .xlsm descargado del portal y no una copia guardada como .xlsx, que pierde las macros. Después, que estén capturados todos los datos obligatorios: el instructivo apunta ahí como causa de los errores de validación y generación.',
  },
  {
    pregunta: '¿Qué significa exactamente el error que me muestra la ventana de validación?',
    respuesta:
      'No hay catálogo oficial de errores publicado, así que cualquiera que te dé una lista de códigos con su traducción se la está inventando. Lo que sí dice el SAT es que la ventana detalla dónde y cómo resolverlo: ese texto es la información más precisa disponible. Guárdalo en captura de pantalla y consúltalo con el SAT si no lo resuelves.',
  },
  {
    pregunta: 'Mi XML pasa de 2 MB. ¿Lo puedo partir en varios archivos?',
    respuesta:
      'El instructivo publica el límite de 2 MB pero no describe un procedimiento de partición, así que no vamos a afirmar que sí ni que no. Lo prudente es reducir el número de avisos por archivo y confirmar el criterio con el SAT antes de la fecha límite, no el día del vencimiento.',
  },
  {
    pregunta: 'Envié el archivo y no veo el acuse. ¿Se perdió?',
    respuesta:
      'Primero, el acuse tarda unos minutos según el propio instructivo. Segundo, en «Ver Acuses» hay que capturar un rango de fechas: sin rango la pantalla aparece vacía aunque el envío haya entrado. Revisa eso antes de volver a enviar, porque un envío duplicado se corrige peor que un acuse que tardó.',
  },
  {
    pregunta: '¿El acuse hay que conservarlo?',
    respuesta:
      'Sí, y con el mismo plazo largo que el resto del acervo: el art. 20 de las reglas de carácter general manda conservar las copias de los avisos e informes, su documentación soporte y los acuses. En una verificación, el acuse es lo que prueba que presentaste; el XML sólo prueba que lo preparaste.',
  },
  {
    pregunta: 'Presenté un informe en ceros y luego encontré una operación reportable. ¿Lo corrijo?',
    respuesta:
      'No se corrige: el informe en ceros no se modifica ni se elimina una vez enviado. Lo que procede es presentar el aviso de esa operación. Que hayas informado en ceros no cubre una operación que sí alcanzaba el umbral.',
  },
  {
    pregunta: '¿Hay una casilla para marcar que el aviso va tarde?',
    respuesta:
      'No, y buscarla hace perder tiempo. No existe instructivo oficial de un flujo extemporáneo: se presenta por la misma vía, con el periodo que le correspondía. La diferencia está en la consecuencia jurídica, no en la pantalla.',
  },
];

export const GUIA_AVISO = {
  tituloSEO: 'Cómo presentar un aviso: plantilla, XML, carga y acuse',
  descripcionSEO:
    'El trámite paso a paso con los literales del instructivo del SAT: plantilla .xlsm, macros, generar el XML, envío masivo, acuse y errores de validación.',
  respuestaDirecta:
    'Se descarga la plantilla .xlsm desde el menú Actividades Vulnerables del SPPLD, se habilita el contenido para que corran las macros, se captura conforme a los formatos oficiales, se pulsa «Validar datos- Generar archivo» para producir el XML —máximo 2 MB—, se carga en «Envío masivo de avisos», se pulsa «Enviar archivo» y unos minutos después se descarga el acuse en «Ver Acuses». La alternativa oficial es capturar los avisos en línea, sin archivo.',
} as const;
