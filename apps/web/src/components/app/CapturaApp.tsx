import Image, { type StaticImageData } from 'next/image';

/**
 * Captura de pantalla del teléfono, dentro de un marco sobrio.
 *
 * ── Por qué no hay un dibujo de teléfono alrededor ─────────────────────────
 *
 * La tentación es enmarcar la captura en un iPhone o un Pixel ilustrado. Se
 * descarta por dos razones: la app es de Android y dibujar un teléfono concreto
 * sugiere un modelo que nadie prometió, y sobre todo porque el marco compite
 * con lo único que importa aquí, que es lo que la pantalla dice. Un borde
 * redondeado del propio sistema de diseño lee como dispositivo sin disfrazarse
 * de uno.
 *
 * La proporción se fija a 1080×2400 —la real de los archivos— para que el
 * hueco esté reservado antes de que la imagen cargue y nada salte.
 */

const PROPORCION = '1080 / 2400';

export function CapturaApp({
  imagen,
  alt,
  pie,
  prioridad = false,
  className = '',
}: {
  imagen: StaticImageData;
  alt: string;
  /** Qué demuestra esta pantalla. Sin pie, la captura es decoración. */
  pie?: React.ReactNode;
  prioridad?: boolean;
  className?: string;
}) {
  return (
    <figure className={`flex flex-col ${className}`}>
      <div
        className="relative overflow-clip rounded-[1.75rem] border border-[var(--color-borde-fuerte)] bg-[var(--color-marino)] shadow-[0_26px_60px_-30px_rgb(10_31_60/.55)]"
        style={{ aspectRatio: PROPORCION }}
      >
        <Image
          src={imagen}
          alt={alt}
          priority={prioridad}
          placeholder="blur"
          sizes="(min-width: 1024px) 18rem, (min-width: 640px) 40vw, 70vw"
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
