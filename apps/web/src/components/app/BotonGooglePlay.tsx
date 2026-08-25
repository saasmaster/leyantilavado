import Image from 'next/image';
import distintivo from '../../../public/img/app/google-play-es.png';

/**
 * Distintivo oficial «Descargar en Google Play».
 *
 * ── Por qué es el archivo de Google y no un botón dibujado ─────────────────
 *
 * Las normas de marca de Google Play exigen usar su artefacto **sin
 * modificarlo**: no se recolorea, no se recorta, no se rehace la tipografía ni
 * se separa el logotipo del texto. Un botón «parecido» hecho a mano infringe la
 * marca y, además, se nota: el triángulo de Play tiene degradados concretos que
 * una reproducción a ojo nunca acierta.
 *
 * Se sirve desde el propio dominio y no desde el CDN de Google porque la CSP
 * del sitio declara `img-src 'self' data: blob:`. Enlazar la imagen remota la
 * bloquearía el navegador, sin aviso visible más que un hueco.
 *
 * El PNG ya trae incorporado el margen libre que la guía obliga a respetar, así
 * que el contenedor no le añade relleno propio ni lo recorta.
 */

/** Proporción del archivo oficial: 646 × 250. */
const ALTO = 56;
const ANCHO = Math.round((646 / 250) * ALTO);

export function BotonGooglePlay({ href }: { href: string }) {
  return (
    <a
      href={href}
      // El distintivo es la etiqueta: el `alt` de la imagen ya dice «Descargar
      // en Google Play», así que un `aria-label` aquí lo repetiría.
      className="inline-flex shrink-0 rounded-[0.6rem] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-[var(--color-petroleo)]"
    >
      <Image
        src={distintivo}
        alt="Descargar en Google Play"
        width={ANCHO}
        height={ALTO}
        // Sin `unoptimized` la recompresión puede tocar los bordes del
        // distintivo; a este tamaño el archivo original ya es pequeño.
        unoptimized
        className="h-14 w-auto"
      />
    </a>
  );
}
