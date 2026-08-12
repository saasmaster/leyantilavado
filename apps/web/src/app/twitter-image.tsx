/**
 * Vista previa para X/Twitter.
 *
 * Es la misma imagen que la de Open Graph, y a propósito. Twitter cae de vuelta
 * a `og:image` cuando no encuentra `twitter:image`, así que este archivo no es
 * estrictamente necesario; existe porque `construirMetadata` declara
 * `twitter.card = 'summary_large_image'` en todas las páginas, y una tarjeta
 * grande sin imagen se degrada a una tarjeta chica y fea. Con el archivo
 * presente, Next emite `twitter:image` explícito y la tarjeta grande se
 * respeta.
 *
 * Re-exportar en vez de duplicar el diseño: si mañana cambia la imagen, cambia
 * en un solo lugar.
 */
export { default, alt, size, contentType } from './opengraph-image';
