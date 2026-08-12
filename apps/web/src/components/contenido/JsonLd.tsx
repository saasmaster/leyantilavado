import { SITIO } from '@/lib/sitio';
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
    headline: titulo,
    description: descripcion,
    inLanguage: 'es-MX',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITIO.url}${ruta}` },
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
      name: SITIO.nombre,
      url: SITIO.url,
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
