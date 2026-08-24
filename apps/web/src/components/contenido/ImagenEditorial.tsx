import Image, { type StaticImageData } from 'next/image';

/**
 * Fotografía dentro del flujo de lectura, con pie opcional.
 *
 * El sitio es de lectura, no de escaparate: la imagen acompaña al texto y no
 * lo interrumpe. De ahí el ancho contenido y no a sangre, y de ahí que el pie
 * sea el mismo tamaño que las notas al margen del resto del sitio.
 *
 * Va en `<figure>` y no en un `<div>` con un `<p>` debajo: cuando existe un
 * pie, `figcaption` es lo que ata visualmente el texto a su imagen para quien
 * usa un lector de pantalla. Sin pie, la imagen se marca decorativa.
 */

export function ImagenEditorial({
  imagen,
  alt,
  pie,
  prioridad = false,
  proporcion = 'panoramica',
  className = '',
}: {
  imagen: StaticImageData;
  /** Vacío sólo si el pie ya describe la imagen o si es puro ambiente. */
  alt: string;
  pie?: React.ReactNode;
  /** `true` sólo si la imagen entra en el primer pantallazo de la ruta. */
  prioridad?: boolean;
  proporcion?: 'panoramica' | 'cuadrada';
  className?: string;
}) {
  return (
    <figure className={`my-10 ${className}`}>
      <div
        className={`relative overflow-clip rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] shadow-[0_18px_44px_-24px_rgb(10_31_60/.38)] ${
          proporcion === 'cuadrada' ? 'aspect-square sm:aspect-[4/3]' : 'aspect-[16/9]'
        }`}
      >
        <Image
          src={imagen}
          alt={alt}
          {...(alt === '' ? { 'aria-hidden': true as const } : {})}
          priority={prioridad}
          placeholder="blur"
          sizes="(min-width: 1024px) 46rem, 100vw"
          className="size-full object-cover"
        />
      </div>
      {pie ? (
        <figcaption className="mt-3 text-sm leading-relaxed text-[var(--color-tinta-tenue)]">
          {pie}
        </figcaption>
      ) : null}
    </figure>
  );
}
