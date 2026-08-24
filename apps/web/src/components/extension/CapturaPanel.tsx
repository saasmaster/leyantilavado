import Image from 'next/image';

/**
 * Muestra sólo el panel de la app dentro de una tarjeta promocional.
 *
 * Los tres archivos de `store-assets` son piezas de 1280×800 pensadas para la
 * ficha de la tienda: traen su propio titular a la izquierda, el panel a la
 * derecha y la marca abajo. Apilarlas enteras en esta página repetiría el
 * titular —que ya está en el encabezado de cada sección— y la firma «Ley
 * Antilavado MX · Herramienta informativa independiente» tres veces seguidas.
 *
 * En vez de recortar los archivos —que obligaría a mantener dos juegos de
 * imágenes sincronizados— se recorta con CSS: un contenedor con la proporción
 * del panel y la imagen ampliada y desplazada dentro. Si mañana se rehacen las
 * piezas para la tienda, esta página se actualiza sola.
 *
 * Los números salen de medir el panel en las piezas: ocupa aproximadamente
 * x 835→1190 e y 30→770 de un lienzo de 1280×800.
 */

const LIENZO = { ancho: 1280, alto: 800 };
const PANEL = { x: 835, y: 28, ancho: 358, alto: 744 };

const ESCALA = (LIENZO.ancho / PANEL.ancho) * 100;
const DESPLAZAMIENTO_X = (PANEL.x / PANEL.ancho) * 100;
const DESPLAZAMIENTO_Y = (PANEL.y / PANEL.alto) * 100;

export function CapturaPanel({
  src,
  alt,
  prioridad = false,
}: {
  src: string;
  alt: string;
  /** Sólo la primera captura visible debe precargarse. */
  prioridad?: boolean;
}) {
  return (
    <div
      /*
       * Ancho FIJO, no `w-full max-w-*`.
       *
       * Estas capturas viven en columnas de rejilla `auto`, y ahí `w-full` es
       * circular: la columna se dimensiona por su contenido y el contenido pide
       * el 100 % de la columna. El resultado no es que encoja un poco — la
       * primera colapsaba a 2×4 píxeles y desaparecía sin romper el build ni
       * las pruebas. Una medida definida corta la circularidad.
       */
      className="relative mx-auto w-[15rem] shrink-0 overflow-hidden rounded-[1.6rem] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] shadow-[0_18px_40px_-18px_rgb(0_0_0/.25)] sm:w-[17rem]"
      style={{ aspectRatio: `${PANEL.ancho} / ${PANEL.alto}` }}
    >
      <Image
        src={src}
        alt={alt}
        width={LIENZO.ancho}
        height={LIENZO.alto}
        priority={prioridad}
        // `max-w-none` es imprescindible: la hoja base de Tailwind limita las
        // imágenes al ancho del contenedor, y aquí la imagen tiene que ser
        // deliberadamente 3,6 veces más ancha para que el recorte funcione.
        className="absolute max-w-none"
        style={{
          width: `${ESCALA}%`,
          left: `-${DESPLAZAMIENTO_X}%`,
          top: `-${DESPLAZAMIENTO_Y}%`,
        }}
        sizes="17rem"
      />
    </div>
  );
}
