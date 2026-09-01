import { IMAGEN_SOCIAL, LOGO, SITIO, jsonParaScript } from '@/lib/sitio';
import { EQUIPO_EDITORIAL, REVISION_VIGENTE } from '@/content/autores';

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
      dangerouslySetInnerHTML={{ __html: jsonParaScript(datos) }}
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
    /**
     * `lastReviewed` es el campo de schema.org para «cuándo se comprobó esto»,
     * distinto de `dateModified`, que es «cuándo cambió». Este sitio revisa
     * fuentes sin que cambie nada —y publicarlo es medio producto—, así que
     * necesita los dos campos y no puede colapsarlos en uno.
     */
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITIO.url}${ruta}`,
      lastReviewed: REVISION_VIGENTE,
    },
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

/**
 * `Dataset` completo.
 *
 * Antes declaraba nombre, descripción y fecha, que es el mínimo para validar y
 * el máximo para no servir de nada: un buscador de datasets necesita saber
 * qué mide, de cuándo a cuándo, de qué territorio, con qué licencia y —sobre
 * todo— dónde está el archivo. Sin `distribution` el marcado dice «aquí hay
 * datos» sin decir cómo obtenerlos.
 */
export function jsonLdConjuntoDatos({
  nombre,
  descripcion,
  ruta,
  actualizadoEn,
  publicadoEn,
  version,
  variables,
  cobertura,
  descargas,
}: {
  nombre: string;
  descripcion: string;
  ruta: string;
  actualizadoEn: string;
  publicadoEn?: string;
  version?: string;
  /** Qué mide el conjunto. Lo que un buscador de datos usa para clasificarlo. */
  variables?: readonly string[];
  /** Periodo cubierto en formato ISO 8601, p. ej. `2016/2026`. */
  cobertura?: string;
  descargas?: readonly { url: string; formato: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${SITIO.url}${ruta}#dataset`,
    identifier: `${SITIO.url}${ruta}`,
    name: nombre,
    description: descripcion,
    url: `${SITIO.url}${ruta}`,
    inLanguage: 'es-MX',
    dateModified: actualizadoEn,
    ...(publicadoEn ? { datePublished: publicadoEn } : {}),
    ...(version ? { version } : {}),
    ...(cobertura ? { temporalCoverage: cobertura } : {}),
    /*
     * `Place`, no `Country`, aunque `Country` sea más preciso.
     *
     * En schema.org `Country` desciende de `Place` (Country →
     * AdministrativeArea → Place), así que declararlo era correcto. El
     * validador de `Dataset` de Google no sigue esa herencia: espera `Place` o
     * texto, y con `Country` emitía «Invalid object type for field
     * spatialCoverage» en /umbrales y /limites-efectivo.
     *
     * Es un aviso no crítico —el dato se indexa igual— pero cuesta la
     * elegibilidad para Google Dataset Search, que es justo donde queremos
     * aparecer con los umbrales. Se conserva el país en `addressCountry`, así
     * que no se pierde precisión: sólo se expresa donde el parser sí la lee.
     */
    spatialCoverage: {
      '@type': 'Place',
      name: 'México',
      address: { '@type': 'PostalAddress', addressCountry: 'MX' },
    },
    ...(variables ? { variableMeasured: variables } : {}),
    creator: { '@type': 'Organization', name: SITIO.nombre, url: SITIO.url },
    publisher: { '@type': 'Organization', name: SITIO.nombre, url: SITIO.url },
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by/4.0/deed.es',
    ...(descargas
      ? {
          distribution: descargas.map((d) => ({
            '@type': 'DataDownload',
            encodingFormat: d.formato,
            contentUrl: `${SITIO.url}${d.url}`,
          })),
        }
      : {}),
  };
}

/**
 * `CollectionPage` con su `ItemList`.
 *
 * Regla de la casa aplicada aquí: la lista sólo se emite si hay elementos
 * reales. Un `ItemList` vacío es marcado que promete un catálogo inexistente,
 * y es peor que no declarar nada — le enseña al buscador a desconfiar del
 * resto del marcado del sitio.
 *
 * Nunca se emiten `aggregateRating`, `review` ni `offers` aquí. Este proyecto
 * no puntúa proveedores ni conoce sus precios, y fabricar estrellas para
 * ganar un fragmento enriquecido es exactamente el tipo de cosa que la página
 * de metodología promete no hacer.
 */
export function jsonLdColeccion({
  nombre,
  descripcion,
  ruta,
  elementos,
}: {
  nombre: string;
  descripcion: string;
  ruta: string;
  elementos?: readonly { nombre: string; url?: string; tipo?: string; descripcion?: string }[];
}) {
  const lista = elementos ?? [];
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITIO.url}${ruta}#coleccion`,
    name: nombre,
    description: descripcion,
    url: `${SITIO.url}${ruta}`,
    inLanguage: 'es-MX',
    isPartOf: { '@type': 'WebSite', '@id': `${SITIO.url}/#sitio` },
    ...(lista.length > 0
      ? {
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: lista.length,
            itemListElement: lista.map((e, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': e.tipo ?? 'Thing',
                name: e.nombre,
                ...(e.descripcion ? { description: e.descripcion } : {}),
                ...(e.url ? { url: e.url.startsWith('http') ? e.url : `${SITIO.url}${e.url}` } : {}),
              },
            })),
          },
        }
      : {}),
  };
}
