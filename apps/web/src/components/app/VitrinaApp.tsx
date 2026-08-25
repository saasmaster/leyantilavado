import Image, { type StaticImageData } from 'next/image';

/**
 * Vitrina de la app: banda oscura con el teléfono y la descarga.
 *
 * ── Por qué una banda oscura en un sitio claro ─────────────────────────────
 *
 * Las capturas de la app son de tema oscuro. Sobre el marfil del sitio flotan
 * como recortes pegados; sobre el marino de la marca se integran, y de paso la
 * banda hace lo que hace la vitrina de una tienda: separar el producto del
 * resto de la página sin sacarlo del mundo visual.
 *
 * No es un degradado decorativo: el color es el mismo `--color-marino` que ya
 * usan la portada y el pie, y el resplandor detrás del teléfono existe para
 * despegarlo del fondo, no para adornar.
 */

export function VitrinaApp({
  captura,
  alt,
  children,
}: {
  captura: StaticImageData;
  alt: string;
  /** Titular, texto y botón de descarga. */
  children: React.ReactNode;
}) {
  return (
    <section className="relative isolate mt-10 overflow-clip rounded-[var(--radius-card)] bg-[var(--color-marino)]">
      {/*
       * Resplandor detrás del teléfono.
       *
       * Va con `radial-gradient` y no con una sombra de color: una sombra
       * teñida sin desplazamiento es un halo pegado al borde, que es
       * decoración. Esto es luz de fondo, que es lo que separa un objeto de su
       * superficie.
       */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_78%_45%,color-mix(in_srgb,var(--color-petroleo-vivo)_28%,transparent)_0%,transparent_70%)]"
      />

      <div className="grid items-center gap-10 px-6 py-12 md:px-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
        <div>{children}</div>

        {/*
         * Ancho fijo, nunca `w-full` en una columna `auto` de rejilla: esa
         * combinación es circular y ya colapsó una captura a dos píxeles en la
         * landing de la extensión.
         */}
        {/*
         * SIN animación de entrada, a propósito.
         *
         * Este teléfono está sobre el pliegue. Con `animation-timeline: view()`
         * un elemento ya visible al cargar aparece a mitad de su recorrido:
         * medido, se quedaba en opacidad 0,68 —descolorido y en apariencia
         * roto— hasta que el visitante hiciera scroll. Lo que ya se ve empieza
         * visible; la entrada es para lo que llega después.
         */}
        <div className="mx-auto w-[14rem] sm:w-[16rem] lg:mx-0 lg:w-full">
          <div
            className="overflow-clip rounded-[1.75rem] border border-[color-mix(in_srgb,white_16%,transparent)] shadow-[0_36px_80px_-32px_rgb(0_0_0/.7)]"
            style={{ aspectRatio: '1080 / 2400' }}
          >
            <Image
              src={captura}
              alt={alt}
              priority
              placeholder="blur"
              sizes="(min-width: 1024px) 16rem, (min-width: 640px) 16rem, 14rem"
              className="size-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
