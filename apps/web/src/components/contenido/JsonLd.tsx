import { SITIO, LOGO } from '@/lib/sitio';
import { EQUIPO_EDITORIAL } from '@/content/autores';

/**
 * Datos estructurados.
 *
 * Regla de la casa: sólo se emite lo que el contenido visible respalda. Un
 * FAQPage sin las preguntas a la vista, o un Article sin autor y fecha
 * mostrados en la página, es marcado que promete algo que la página no cumple.
 */
export function JsonLd({ datos }: { datos: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}
    />
  );
}

export function jsonLdArticulo({
  titulo,
  descripcion,
  ruta,
  publicadoEn,
  actualizadoEn,
  seccion,
}: {
  titulo: string;
  descripcion: string;
  ruta: string;
  publicadoEn: string;
  actualizadoEn: string;
  seccion?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITIO.url}${ruta}#articulo`,
    headline: titulo,
    description: descripcion,
    inLanguage: 'es-MX',
    /**
     * `image` es REQUISITO de Google para los resultados enriquecidos de
     * artículo. Sin él, la página no es elegible por mucho que el resto del
     * marcado esté impecable — y este sitio lo estuvo sin serlo.
     *
     * Se apunta a la imagen Open Graph generada por ruta, que ya existe en
     * `/opengraph-image` y hereda el título de cada página: así cada artículo
     * declara una imagen propia y real, no un logotipo repetido 93 veces.
     */
    image: {
      '@type': 'ImageObject',
      url: `${SITIO.url}${ruta === '/' ? '' : ruta}/opengraph-image`,
      width: 1200,
      height: 630,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITIO.url}${ruta}` },
    isPartOf: { '@type': 'WebSite', '@id': `${SITIO.url}/#sitio` },
    datePublished: publicadoEn,
    dateModified: actualizadoEn,
    ...(seccion ? { articleSection: seccion } : {}),
    author: {
      '@type': 'Organization',
      name: EQUIPO_EDITORIAL.nombre,
      url: `${SITIO.url}${EQUIPO_EDITORIAL.url ?? '/'}`,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITIO.url}/#organizacion`,
      name: SITIO.nombre,
      url: SITIO.url,
      logo: LOGO,
    },
  };
}

export function jsonLdConjuntoTerminos(
  terminos: readonly { slug: string; termino: string; definicion: string }[],
  ruta: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Glosario de la Ley Antilavado (LFPIORPI)',
    url: `${SITIO.url}${ruta}`,
    inLanguage: 'es-MX',
    hasDefinedTerm: terminos.map((t) => ({
      '@type': 'DefinedTerm',
      '@id': `${SITIO.url}${ruta}#${t.slug}`,
      name: t.termino,
      description: t.definicion,
    })),
  };
}

export function jsonLdConjuntoDatos({
  nombre,
  descripcion,
  ruta,
  actualizadoEn,
}: {
  nombre: string;
  descripcion: string;
  ruta: string;
  actualizadoEn: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: nombre,
    description: descripcion,
    url: `${SITIO.url}${ruta}`,
    inLanguage: 'es-MX',
    dateModified: actualizadoEn,
    creator: { '@type': 'Organization', name: SITIO.nombre, url: SITIO.url },
    isAccessibleForFree: true,
  };
}
