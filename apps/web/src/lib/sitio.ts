import type { Metadata } from 'next';

export const SITIO = {
  nombre: 'LeyAntilavado.org',
  subtitulo: 'Centro independiente de información y herramientas sobre la LFPIORPI',
  descripcion:
    'Calcula umbrales, acumulación de seis meses, límites de efectivo y fechas de aviso de la Ley Antilavado con la UMA vigente en la fecha de tu operación. Herramientas gratuitas con fuente oficial citada.',
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
      { href: '/actividades-vulnerables', etiqueta: 'Actividades vulnerables', descripcion: 'Las 16 fracciones del art. 17 y a quién alcanzan' },
      { href: '/umbrales', etiqueta: 'Umbrales', descripcion: 'Tabla completa de identificación y aviso' },
      { href: '/obligaciones', etiqueta: 'Obligaciones', descripcion: 'Qué tienes que hacer y con qué evidencia' },
      { href: '/limites-efectivo', etiqueta: 'Límites de efectivo', descripcion: 'Las prohibiciones del art. 32' },
      { href: '/multas', etiqueta: 'Multas y sanciones', descripcion: 'Rangos del art. 54 y autocorrección' },
      { href: '/glosario', etiqueta: 'Glosario', descripcion: 'PLD, EBR, PEP, beneficiario controlador' },
      { href: '/preguntas-frecuentes', etiqueta: 'Preguntas frecuentes', descripcion: 'Las dudas que más se repiten, con su artículo' },
    ],
  },
  {
    titulo: 'Herramientas',
    enlaces: [
      { href: '/herramientas/cuestionario', etiqueta: '¿Me aplica la ley?', descripcion: 'Diagnóstico guiado en minutos' },
      { href: '/herramientas/calculadora-umbrales', etiqueta: 'Calculadora de umbrales', descripcion: 'Por actividad y fecha de operación' },
      { href: '/herramientas/calculadora-uma', etiqueta: 'Conversor UMA', descripcion: 'Histórico 2016-2026' },
      { href: '/herramientas/acumulacion-operaciones', etiqueta: 'Acumulación 6 meses', descripcion: 'La regla antifraccionamiento' },
      { href: '/herramientas/limites-efectivo', etiqueta: 'Límites de efectivo', descripcion: 'Verifica antes de cerrar la operación' },
      { href: '/herramientas/calculadora-multas', etiqueta: 'Estimador de multas', descripcion: 'Rangos y escenarios de autocorrección' },
      { href: '/herramientas/fecha-limite-aviso', etiqueta: 'Fecha límite de aviso', descripcion: 'El día 17 y sus trampas' },
      { href: '/herramientas/beneficiario-controlador', etiqueta: 'Beneficiario controlador', descripcion: 'Traza la estructura corporativa' },
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

/** Google recorta el título del resultado alrededor de aquí. */
const LARGO_TITULO = 60;
/** Y la descripción alrededor de aquí. */
const LARGO_DESCRIPCION = 155;

/**
 * Recorta en el último espacio antes del límite y añade puntos suspensivos.
 *
 * Cortar a mitad de palabra se ve peor en el resultado de búsqueda que una
 * frase que termina antes, así que se retrocede al espacio anterior.
 */
function recortar(texto: string, maximo: number): string {
  if (texto.length <= maximo) return texto;
  const cortado = texto.slice(0, maximo - 1);
  const ultimoEspacio = cortado.lastIndexOf(' ');
  return `${(ultimoEspacio > maximo * 0.6 ? cortado.slice(0, ultimoEspacio) : cortado).trimEnd()}…`;
}

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
function componerTitulo(titulo: string, ruta: string): string {
  if (ruta === '/') return `${SITIO.nombre} — Ley Antilavado y LFPIORPI en México`;

  const conMarca = `${titulo} | ${SITIO.nombre}`;
  if (conMarca.length <= LARGO_TITULO) return conMarca;
  return recortar(titulo, LARGO_TITULO);
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
  const tituloCompleto = componerTitulo(titulo, ruta);
  const descripcionCorta = recortar(descripcion, LARGO_DESCRIPCION);
  const indexar = SITIO.indexable && !noindex;

  return {
    title: tituloCompleto,
    description: descripcionCorta,
    alternates: { canonical: url },
    robots: indexar
      ? { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 }
      : { index: false, follow: false },
    openGraph: {
      type: tipo,
      url,
      siteName: SITIO.nombre,
      title: tituloCompleto,
      description: descripcionCorta,
      locale: SITIO.locale,
      ...(publicadoEn ? { publishedTime: publicadoEn } : {}),
      ...(actualizadoEn ? { modifiedTime: actualizadoEn } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: tituloCompleto,
      description: descripcionCorta,
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
