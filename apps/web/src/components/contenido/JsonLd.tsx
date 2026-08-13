import { IMAGEN_SOCIAL, LOGO, SITIO } from '@/lib/sitio';
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
     * Apunta a `IMAGEN_SOCIAL`, que es la del sitio y existe de verdad.
     *
     * Aquí había una imagen por ruta —`${ruta}/opengraph-image`— con la buena
     * intención de que cada artículo tuviera la suya. El problema es que esa
     * URL sólo existe donde hay un `opengraph-image.tsx`, y sólo lo hay en la
     * raíz: `/umbrales/opengraph-image` devolvía 404 en producción. El JSON-LD
     * afirmaba tener imagen y apuntaba a nada, en todas las páginas menos la
     * portada.
     *
     * Una imagen del sitio que carga vale más que una imagen por página que no
     * existe. Cuando alguna ruta quiera la suya, basta con añadir su
     * `opengraph-image.tsx` y pasarla por parámetro.
     */
    image: { '@type': 'ImageObject', ...IMAGEN_SOCIAL },
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
