import Image, { type StaticImageData } from 'next/image';

/**
 * Banda a sangre completa con paralaje, para separar bloques largos.
 *
 * ── Por qué el paralaje va en CSS y no en JavaScript ───────────────────────
 *
 * Se resuelve con `animation-timeline: view()`, que el navegador ejecuta en el
 * hilo de composición. Un listener de `scroll` haría lo mismo peor: cada
 * fotograma pasaría por el hilo principal, que en este sitio está ocupado
 * calculando umbrales.
 *
 * `background-attachment: fixed` —el atajo clásico— queda descartado: iOS lo
 * ignora desde hace años y produce justo el defecto que más se nota, una banda
 * que se congela mientras el resto de la página se mueve.
 *
 * El contenedor lleva `overflow-clip` y NO `overflow-hidden`: `hidden` crea un
 * contenedor de scroll y eso **congela** las animaciones guiadas por scroll.
 * Es un fallo silencioso —el diseño se ve correcto, simplemente no se mueve—.
 *
 * Cuando el navegador no soporta `animation-timeline`, la imagen se queda
 * quieta y todo lo demás funciona igual. La regla global de
 * `prefers-reduced-motion` la detiene también para quien lo pida.
 */

export function BandaParalaje({
  imagen,
  alt,
  children,
  altura = 'media',
}: {
  imagen: StaticImageData;
  /**
   * Vacío si la imagen es ambiente y el texto de encima ya lo dice todo:
   * describirla otra vez obliga a un lector de pantalla a oír dos veces lo
   * mismo. Con texto si aporta algo que no está escrito.
   */
  alt: string;
  children: React.ReactNode;
  altura?: 'media' | 'alta';
}) {
  return (
    <section
      className={`banda-paralaje relative isolate flex items-center overflow-clip ${
        altura === 'alta' ? 'min-h-[32rem] md:min-h-[38rem]' : 'min-h-[24rem] md:min-h-[28rem]'
      }`}
    >
      <Image
        src={imagen}
        alt={alt}
        {...(alt === '' ? { 'aria-hidden': true as const } : {})}
        sizes="100vw"
        placeholder="blur"
        className="banda-paralaje__imagen absolute inset-x-0 -top-[12%] -z-20 h-[124%] w-full object-cover"
      />
      {/*
       * Velo de tinta, no un gris.
       *
       * El texto va sobre una fotografía cuyo brillo cambia de una zona a otra,
       * así que el contraste no se puede garantizar sin un velo. Se tiñe con el
       * marino de la marca en vez de negro puro: un velo negro apaga el color
       * de la foto y la deja gris, y la calidez de estas imágenes es justo lo
       * que las hace valer.
       */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-marino)_88%,transparent)_0%,color-mix(in_srgb,var(--color-marino)_74%,transparent)_55%,color-mix(in_srgb,var(--color-marino)_90%,transparent)_100%)]"
      />

      <div className="contenedor-app relative py-16 md:py-20">{children}</div>
    </section>
  );
}
