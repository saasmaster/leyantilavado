import type { Metadata } from 'next';
import { datos } from '@leyantilavado/rules-engine';
import { URL_PLAY } from '@/content/app';
import { URL_TIENDA } from '@/content/extension';

export const SITIO = {
  nombre: 'LeyAntilavado.org',
  subtitulo: 'Centro independiente de información y herramientas sobre la LFPIORPI',
  descripcion:
    'Consulta la Ley Antilavado en México: actividades vulnerables, umbrales en UMA, obligaciones, límites de efectivo, multas y los cambios vigentes en 2026.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leyantilavado.org',
  locale: 'es_MX',
  /**
   * Indexación por buscadores.
   *
   * El valor por omisión es INDEXABLE, y se apaga con
   * `NEXT_PUBLIC_SITE_INDEXABLE=false`.
   *
   * Antes era al revés —cerrado salvo que alguien lo abriera— pero esa
   * elección resultó frágil en la práctica: la variable se incrusta durante el
   * build, y si el panel de despliegue compila antes de inyectarla, el sitio
   * sale con `Disallow: /` sin que nada falle de forma visible. Ya pasó una vez.
   *
   * El interruptor sigue existiendo para cerrarlo a propósito (por ejemplo en
   * un entorno de pruebas), pero un olvido ahora deja el sitio visible en lugar
   * de invisible, que es el modo de fallar que corresponde a un sitio pensado
   * para ser encontrado.
   */
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE !== 'false',
} as const;

export interface EnlaceNav {
  href: string;
  etiqueta: string;
  descripcion?: string;
}

export const NAVEGACION: { titulo: string; enlaces: EnlaceNav[] }[] = [
  {
    titulo: 'Entender la ley',
    enlaces: [
      { href: '/para', etiqueta: 'Busca tu giro', descripcion: 'Notaría, inmobiliaria, joyería, casa de empeño…' },
      { href: '/actividades-vulnerables', etiqueta: 'Actividades vulnerables', descripcion: 'Las 17 fracciones del art. 17 y a quién alcanzan' },
      { href: '/umbrales', etiqueta: 'Umbrales', descripcion: 'Tabla completa de identificación y aviso' },
      { href: '/obligaciones', etiqueta: 'Obligaciones', descripcion: 'Qué tienes que hacer y con qué evidencia' },
      { href: '/limites-efectivo', etiqueta: 'Límites de efectivo', descripcion: 'Las prohibiciones del art. 32' },
      { href: '/multas', etiqueta: 'Multas y sanciones', descripcion: 'Rangos del art. 54 y autocorrección' },
      { href: '/requerimiento-sat', etiqueta: 'Me llegó un requerimiento', descripcion: 'Los plazos reales y cómo regularizar' },
      { href: '/glosario', etiqueta: 'Glosario', descripcion: 'PLD, EBR, PEP, beneficiario controlador' },
      { href: '/exigibilidad', etiqueta: '¿Ya me es exigible?', descripcion: 'Qué corre hoy y qué llega en 2027 y 2028' },
      { href: '/tramites', etiqueta: 'Trámites del portal', descripcion: 'Alta, baja, modificación y representante' },
      { href: '/guia-aviso', etiqueta: 'Cómo presentar un aviso', descripcion: 'De la plantilla al acuse, paso a paso' },
      { href: '/casos-practicos', etiqueta: 'Casos prácticos', descripcion: 'Operaciones reales resueltas paso a paso' },
      { href: '/que-cambio', etiqueta: 'Qué cambió para ti', descripcion: 'La reforma y el Acuerdo 115/2026, por actividad' },
      { href: '/preguntas-frecuentes', etiqueta: 'Preguntas frecuentes', descripcion: 'Las dudas que más se repiten, con su artículo' },
    ],
  },
  {
    titulo: 'Herramientas',
    enlaces: [
      { href: '/herramientas/consulta-libre', etiqueta: 'Consulta con tus palabras', descripcion: '«Vendí un reloj de 180 mil en efectivo»' },
      { href: '/herramientas/cuestionario', etiqueta: '¿Me aplica la ley?', descripcion: 'Diagnóstico guiado en minutos' },
      { href: '/herramientas/calculadora-umbrales', etiqueta: 'Calculadora de umbrales', descripcion: 'Por actividad y fecha de operación' },
      { href: '/herramientas/calculadora-uma', etiqueta: 'Conversor UMA', descripcion: 'Histórico 2016-2026' },
      { href: '/herramientas/acumulacion-operaciones', etiqueta: 'Acumulación 6 meses', descripcion: 'La regla antifraccionamiento' },
      { href: '/herramientas/limites-efectivo', etiqueta: 'Límites de efectivo', descripcion: 'Verifica antes de cerrar la operación' },
      { href: '/herramientas/calculadora-multas', etiqueta: 'Estimador de multas', descripcion: 'Rangos y escenarios de autocorrección' },
      { href: '/herramientas/fecha-limite-aviso', etiqueta: 'Fecha límite de aviso', descripcion: 'El día 17 y sus trampas' },
      { href: '/herramientas/plan-30-noviembre', etiqueta: 'Plan al 30 de noviembre', descripcion: 'Qué tener listo antes de que entre en vigor' },
      { href: '/herramientas/beneficiario-controlador', etiqueta: 'Beneficiario controlador', descripcion: 'Traza la estructura corporativa' },
      // Ni la app ni la extensión son calculadoras del sitio, pero resuelven lo
      // mismo fuera de él. Van al final del grupo, junto a «Ver todas».
      { href: '/app', etiqueta: 'App para Android', descripcion: 'Lleva el expediente y los vencimientos en el teléfono' },
      { href: '/extension', etiqueta: 'Extensión de Chrome', descripcion: 'Analiza una operación sin salir de donde estás' },
      { href: '/herramientas', etiqueta: 'Ver todas', descripcion: 'Catálogo completo' },
    ],
  },
  {
    titulo: 'Reforma 2026',
    enlaces: [
      { href: '/reforma-ley-antilavado-2026', etiqueta: 'Qué cambió', descripcion: 'De la reforma de 2025 al Acuerdo 115/2026' },
      { href: '/acuerdo-115-2026', etiqueta: 'Acuerdo 115/2026', descripcion: 'Publicado el 7 de agosto de 2026' },
      { href: '/calendario-cumplimiento', etiqueta: 'Calendario 2026-2029', descripcion: 'Fechas exigibles con cuenta regresiva' },
      { href: '/actualizaciones', etiqueta: 'Actualizaciones', descripcion: 'Bitácora de cambios normativos' },
    ],
  },
  {
    titulo: 'Encontrar ayuda',
    enlaces: [
      { href: '/plataforma', etiqueta: 'Plataforma de cumplimiento', descripcion: 'Área privada: clientes, alertas y auditoría' },
      { href: '/directorio', etiqueta: 'Directorio profesional', descripcion: 'Contadores, abogados, auditores y software' },
      { href: '/software-cumplimiento', etiqueta: 'Software de cumplimiento', descripcion: 'Comparativo neutral' },
      { href: '/cursos', etiqueta: 'Cursos y capacitación', descripcion: 'Para el periodo anual obligatorio' },
      { href: '/plantillas', etiqueta: 'Plantillas', descripcion: 'Manual, matriz de riesgos, expedientes' },
    ],
  },
];

export const ENLACES_PIE: { titulo: string; enlaces: EnlaceNav[] }[] = [
  {
    titulo: 'El proyecto',
    enlaces: [
      { href: '/nosotros', etiqueta: 'Quiénes somos' },
      { href: '/metodologia-editorial', etiqueta: 'Metodología editorial' },
      { href: '/fuentes-oficiales', etiqueta: 'Fuentes oficiales' },
      { href: '/contacto', etiqueta: 'Contacto' },
      { href: '/precios', etiqueta: 'Precios' },
    ],
  },
  {
    titulo: 'Legal',
    enlaces: [
      { href: '/legal/aviso-de-privacidad', etiqueta: 'Aviso de privacidad' },
      { href: '/legal/terminos', etiqueta: 'Términos de uso' },
      { href: '/legal/cookies', etiqueta: 'Política de cookies' },
      { href: '/legal/publicidad', etiqueta: 'Divulgación de publicidad' },
    ],
  },
];

/**
 * Imagen de las tarjetas sociales.
 *
 * Se declara aquí y no se deja al convenio de archivos de Next: un
 * `opengraph-image.tsx` sólo cubre el segmento donde vive, así que el de la
 * raíz dejaba a casi todas las páginas sin imagen. Compartir cualquiera de
 * ellas en WhatsApp o LinkedIn producía una tarjeta desnuda, que es la que
 * nadie abre.
 */
export const IMAGEN_SOCIAL = {
  url: `${SITIO.url}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: 'LeyAntilavado.org — centro independiente de información sobre la LFPIORPI',
} as const;

/**
 * Rutas con tarjeta social propia.
 *
 * Cada una tiene su `opengraph-image.tsx`, con su fotografía y su texto.
 *
 * Hace falta enumerarlas porque este archivo escribe `openGraph.images` a mano
 * y **eso tiene prioridad sobre el convenio de archivos**: mientras el valor
 * explícito apuntara siempre a la raíz, poner un `opengraph-image.tsx` en una
 * carpeta no cambiaba nada. Costó descubrirlo porque el archivo se genera y se
 * sirve correctamente en su URL; simplemente nadie la anunciaba.
 *
 * Una ruta nueva sin entrada aquí hereda la tarjeta de la raíz, que es un
 * respaldo digno. Una entrada sin su archivo daría 404 en la imagen, así que
 * las dos cosas se añaden juntas.
 */
const RUTAS_CON_TARJETA_PROPIA: ReadonlySet<string> = new Set([
  '/umbrales',
  '/obligaciones',
  '/multas',
  '/limites-efectivo',
  '/calendario-cumplimiento',
  '/reforma-ley-antilavado-2026',
  '/preguntas-frecuentes',
  '/glosario',
  '/directorio',
  '/herramientas',
]);

function imagenSocialDe(ruta: string, tituloCompleto: string) {
  if (!RUTAS_CON_TARJETA_PROPIA.has(ruta)) return IMAGEN_SOCIAL;
  return {
    url: `${SITIO.url}${ruta}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: tituloCompleto,
  } as const;
}

/**
 * JSON seguro para incrustar dentro de un `<script>`.
 *
 * `JSON.stringify` escapa comillas, pero NO escapa `<`. El analizador de HTML
 * no entiende de JSON: cierra el `<script>` en el primer `</script` que
 * encuentra en el texto, con comillas o sin ellas. Así que un dato que
 * contenga esa secuencia sale del bloque de datos y lo que venga detrás se
 * ejecuta como código.
 *
 * En este sitio eso no era teórico. El alta del directorio publica el perfil
 * de inmediato y sin autenticar, y `nombre` y `biografia` sólo validaban
 * longitud. Bastaba con darse de alta con una biografía que llevara
 * `</script><script>…` para ejecutar código en cada visita a esa ficha. La CSP
 * no lo detiene: `script-src` lleva `'unsafe-inline'` documentado, y el
 * payload corre en el mismo origen que el área privada.
 *
 * También se escapan U+2028 y U+2029: son saltos de línea válidos en JSON e
 * ilegales dentro de un literal de JavaScript.
 */
export function jsonParaScript(datos: unknown): string {
  return JSON.stringify(datos)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Google recorta el título del resultado alrededor de aquí. */
export const LARGO_TITULO = 60;
/** Y la descripción alrededor de aquí. Lo verifica `sitio.test.ts`. */
export const LARGO_DESCRIPCION = 160;

/**
 * Aquí había un `recortar()` que cortaba en el último espacio y añadía «…».
 *
 * Se fue, y con él 31 títulos y 59 descripciones que terminaban en puntos
 * suspensivos. El recorte automático parecía prudente y hacía justo lo
 * contrario de lo que pretendía: un «…» al final delata texto generado, y la
 * frase se cortaba donde estaba lo específico de la página. Google además
 * recorta por su cuenta en el ancho que le convenga, así que recortar antes
 * no evitaba nada: sólo garantizaba que el texto quedara mocho también en
 * Bing, en las tarjetas sociales y en las citas de un asistente.
 *
 * Ahora los textos se escriben completos y de largo correcto en el origen, y
 * `sitio.test.ts` falla el build si alguno se pasa. Un límite que se aplica
 * escribiendo mejor es un límite; uno que se aplica cortando es un parche.
 */

/**
 * Título del resultado de búsqueda.
 *
 * La marca se añade sólo si cabe. Antes se concatenaba siempre, y con un
 * nombre de 17 caracteres eso empujaba 15 de 16 títulos por encima del corte
 * de Google —el más largo llegaba a 92—, de modo que el buscador cortaba
 * justamente el final, que es donde estaba lo específico de la página.
 *
 * Perder la marca no cuesta nada: ya aparece en el dominio, que se muestra
 * encima del título en el resultado.
 */
/**
 * El año de los títulos NO se escribe a mano.
 *
 * Un «2026» literal en 22 títulos es la misma clase de fecha que ya se pudrió
 * una vez en `/herramientas`: correcta el día que se teclea y falsa a partir
 * del 1 de enero. Aquí sale de la UMA vigente más reciente del motor, así que
 * avanza exactamente cuando el corpus incorpora el valor del año siguiente
 * —que es el día en que el título de verdad cambia de significado—.
 *
 * Se sustituye en título y descripción, no sólo en el título, porque la
 * descripción compite por las mismas búsquedas.
 */
const ANIO_VIGENTE = String(datos.UMA_VIGENTE_MAS_RECIENTE.anio);
const conAnio = (texto: string): string => texto.replaceAll('{año}', ANIO_VIGENTE);

function componerTitulo(titulo: string, ruta: string): string {
  // La portada es el término más buscado del sitio y su título era el nombre
  // de la marca seguido de dos siglas. La marca ya sale encima, en el dominio.
  if (ruta === '/') return conAnio('Ley Antilavado México {año}: umbrales y obligaciones');

  const conMarca = `${titulo} | ${SITIO.nombre}`;
  return conMarca.length <= LARGO_TITULO ? conMarca : titulo;
}

/**
 * Metadata por página.
 *
 * `noindex` es el valor por omisión para resultados de herramientas y área
 * privada: nada de lo que un usuario captura debe terminar en un buscador.
 */
export function construirMetadata({
  titulo,
  descripcion,
  ruta,
  noindex,
  publicadoEn,
  actualizadoEn,
  tipo = 'website',
}: {
  titulo: string;
  descripcion: string;
  ruta: string;
  noindex?: boolean;
  publicadoEn?: string;
  actualizadoEn?: string;
  tipo?: 'website' | 'article';
}): Metadata {
  const url = `${SITIO.url}${ruta}`;
  const tituloCompleto = componerTitulo(conAnio(titulo), ruta);
  const descripcionCorta = conAnio(descripcion);
  const indexar = SITIO.indexable && !noindex;

  return {
    title: tituloCompleto,
    description: descripcionCorta,
    alternates: { canonical: url },
    robots: indexar
      ? { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 }
      : // `follow: true` a propósito. `noindex` dice «no me muestres»;
        // `nofollow` diría además «no sigas mis enlaces», y eso corta el
        // descubrimiento de páginas que sí queremos indexadas. Una categoría
        // de directorio vacía no debe aparecer en resultados y sus enlaces
        // internos siguen valiendo.
        { index: false, follow: true },
    openGraph: {
      type: tipo,
      url,
      siteName: SITIO.nombre,
      title: tituloCompleto,
      description: descripcionCorta,
      locale: SITIO.locale,
      images: [imagenSocialDe(ruta, tituloCompleto)],
      ...(publicadoEn ? { publishedTime: publicadoEn } : {}),
      ...(actualizadoEn ? { modifiedTime: actualizadoEn } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: tituloCompleto,
      description: descripcionCorta,
      images: [imagenSocialDe(ruta, tituloCompleto).url],
    },
  };
}

/** Datos estructurados. Sólo se emiten cuando el contenido visible los respalda. */
/** Logotipo cuadrado del sitio. Google lo exige para `Organization.logo`. */
export const LOGO = {
  '@type': 'ImageObject' as const,
  url: `${SITIO.url}/icons/icono-512.png`,
  width: 512,
  height: 512,
};

export function jsonLdOrganizacion() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITIO.url}/#organizacion`,
    name: SITIO.nombre,
    url: SITIO.url,
    logo: LOGO,
    image: LOGO,
    description: SITIO.subtitulo,
    /**
     * `sameAs` sólo con propiedades que este proyecto CONTROLA y que un
     * tercero puede verificar: sus dos publicaciones en tiendas oficiales.
     *
     * Deliberadamente sin perfiles sociales ni entradas de enciclopedia. Este
     * campo afirma «esta organización y esa página son la misma entidad»;
     * apuntarlo a algo que no controlamos, o que no existe, es una afirmación
     * falsa sobre identidad, no una oportunidad de posicionamiento.
     *
     * Las dos fichas son además el vínculo más fuerte disponible: Google ya
     * sabe quién las publicó, y ninguna de las dos se puede falsificar.
     */
    sameAs: [URL_PLAY, URL_TIENDA],
    // Declaración explícita: no somos gobierno.
    disambiguatingDescription:
      'Plataforma privada e independiente. No pertenece ni está afiliada al SAT, la UIF ni a ninguna autoridad gubernamental de México.',
    areaServed: { '@type': 'Country', name: 'México' },
    knowsAbout: [
      'LFPIORPI',
      'Prevención de lavado de dinero',
      'Actividades vulnerables',
      'Unidad de Medida y Actualización',
      'Cumplimiento PLD/FT',
    ],
  };
}

export function jsonLdMigaDePan(items: { nombre: string; ruta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.nombre,
      item: `${SITIO.url}${item.ruta}`,
    })),
  };
}

/**
 * Catálogo enumerado, para páginas que listan cosas.
 *
 * `ItemList` es lo que le dice a un buscador «esto es un catálogo de N cosas y
 * este es su orden», en vez de dejar que lo deduzca de un montón de enlaces.
 * Se usa en `/herramientas` y `/directorio`, que son justo eso.
 *
 * Se emiten sólo `url` y `name` por elemento —no fichas completas— porque
 * describir cada herramienta aquí duplicaría lo que ya declara su propia
 * página, y dos descripciones del mismo objeto acaban divergiendo.
 */
export function jsonLdCatalogo(
  nombre: string,
  descripcion: string,
  elementos: { nombre: string; ruta: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: nombre,
    description: descripcion,
    numberOfItems: elementos.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: elementos.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: e.nombre,
      url: `${SITIO.url}${e.ruta}`,
    })),
  };
}

/**
 * Marcado de una herramienta interactiva del sitio.
 *
 * Las 19 calculadoras son software que se ejecuta en el navegador, no
 * artículos: `WebApplication` es el tipo que lo dice. Importa para GEO más que
 * para el buscador clásico —un modelo que resuelve «¿hay una calculadora de
 * umbrales de la Ley Antilavado?» necesita reconocerlas como herramientas.
 *
 * `price: '0'` es un hecho comprobable, no una promesa: las herramientas no
 * cobran ni piden cuenta. Sin `aggregateRating`: no hay reseñas, y declarar
 * estrellas inexistentes es sanción manual de Google.
 */
export function jsonLdHerramienta(opciones: {
  nombre: string;
  descripcion: string;
  ruta: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opciones.nombre,
    description: opciones.descripcion,
    url: `${SITIO.url}${opciones.ruta}`,
    applicationCategory: 'BusinessApplication',
    // Corre en el navegador: no hay nada que instalar ni sistema operativo que
    // exigir. `browserRequirements` es el campo honesto para eso.
    browserRequirements: 'Requiere JavaScript.',
    operatingSystem: 'Cualquiera con navegador web',
    inLanguage: 'es-MX',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'MXN' },
    publisher: { '@id': `${SITIO.url}/#organizacion` },
  };
}

export function jsonLdFAQ(preguntas: { pregunta: string; respuesta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preguntas.map((p) => ({
      '@type': 'Question',
      name: p.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: p.respuesta },
    })),
  };
}
