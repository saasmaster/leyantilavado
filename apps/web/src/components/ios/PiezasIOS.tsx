import Image, { type StaticImageData } from 'next/image';

/**
 * Piezas visuales de la landing de iOS.
 *
 * ── Por qué no se reutilizan las de Android ────────────────────────────────
 *
 * `VitrinaApp` monta las capturas sobre una banda marino oscura, y esa
 * decisión no es estética: las capturas de Android son de tema oscuro y sobre
 * el marfil del sitio flotaban como recortes pegados.
 *
 * Las de iOS son de tema CLARO, con el fondo lavanda del sistema. Sobre marino
 * se recortarían igual de mal, sólo que al revés. Aquí la banda es clara —el
 * `marino-tenue` de la paleta, que es exactamente el vecino del gris azulado
 * de iOS— y la profundidad la da la sombra del teléfono, no el contraste del
 * fondo.
 *
 * ── La proporción, medida y no supuesta ────────────────────────────────────
 *
 * 1080×2347, que es la de los archivos reales. Copiar el 1080/2400 de Android
 * habría recortado 53 px de cada captura: en la de la calculadora eso se come
 * justo la fila del umbral, que es lo único que esa imagen tiene que enseñar.
 */

const PROPORCION = '1080 / 2347';

/** Marco del dispositivo. Sin dibujar un iPhone: la pantalla es el sujeto. */
function Marco({
  imagen,
  alt,
  prioridad = false,
  sizes,
}: {
  imagen: StaticImageData;
  alt: string;
  prioridad?: boolean;
  sizes: string;
}) {
  return (
    <div
      className="overflow-clip rounded-[2rem] border border-[var(--color-borde-fuerte)] shadow-[0_30px_64px_-28px_rgb(10_31_60/.42)]"
      style={{ aspectRatio: PROPORCION }}
    >
      <Image
        src={imagen}
        alt={alt}
        priority={prioridad}
        placeholder="blur"
        sizes={sizes}
        className="size-full object-cover"
      />
    </div>
  );
}

/** Vitrina sobre el pliegue: el teléfono manda y la descarga vive a su lado. */
export function VitrinaIOS({
  captura,
  alt,
  children,
}: {
  captura: StaticImageData;
  alt: string;
  /** Titular, texto y llamada a la acción. */
  children: React.ReactNode;
}) {
  return (
    <section className="relative isolate mt-10 overflow-clip rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marino-tenue)]">
      {/*
       * Resplandor detrás del teléfono, no un degradado decorativo: existe
       * para despegar el objeto de su superficie, que es lo que hace la luz de
       * fondo en un escaparate.
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(58%_68%_at_78%_42%,color-mix(in_srgb,white_78%,transparent)_0%,transparent_72%)]"
      />

      <div className="grid items-center gap-10 px-6 py-12 md:px-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
        <div>{children}</div>

        {/*
         * Ancho fijo, nunca `w-full` en una columna `auto` de rejilla: esa
         * combinación es circular y ya colapsó una captura a dos píxeles en la
         * landing de la extensión.
         *
         * Y sin animación de entrada: este teléfono está sobre el pliegue, y
         * con `animation-timeline: view()` un elemento ya visible al cargar
         * aparece a mitad de su recorrido —medido, en opacidad 0,68— hasta que
         * el visitante hace scroll.
         */}
        <div className="mx-auto w-[14rem] sm:w-[16rem] lg:mx-0 lg:w-full">
          <Marco
            imagen={captura}
            alt={alt}
            prioridad
            sizes="(min-width: 1024px) 16rem, (min-width: 640px) 16rem, 14rem"
          />
        </div>
      </div>
    </section>
  );
}

/** Captura con su pie. Sin pie, una captura es decoración. */
export function CapturaIOS({
  imagen,
  alt,
  pie,
  className = '',
}: {
  imagen: StaticImageData;
  alt: string;
  pie: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={`flex w-[15rem] flex-col sm:w-[16rem] ${className}`}>
      <Marco imagen={imagen} alt={alt} sizes="(min-width: 640px) 16rem, 15rem" />
      <figcaption className="mt-3 text-sm leading-relaxed text-[var(--color-tinta-tenue)]">
        {pie}
      </figcaption>
    </figure>
  );
}
