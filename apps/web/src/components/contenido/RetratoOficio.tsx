import Image, { type StaticImageData } from 'next/image';

import agenciasDeAutos from '../../../public/img/oficios/agencias-de-autos.webp';
import arrendadores from '../../../public/img/oficios/arrendadores.webp';
import casasDeEmpeno from '../../../public/img/oficios/casas-de-empeno.webp';
import constructoras from '../../../public/img/oficios/constructoras.webp';
import donatarias from '../../../public/img/oficios/donatarias.webp';
import galeriasDeArte from '../../../public/img/oficios/galerias-de-arte.webp';
import inmobiliarias from '../../../public/img/oficios/inmobiliarias.webp';
import joyerias from '../../../public/img/oficios/joyerias.webp';
import plataformasActivosVirtuales from '../../../public/img/oficios/plataformas-activos-virtuales.webp';

/**
 * Fotografía de cabecera de las páginas `/para/[oficio]`.
 *
 * ── Por qué cada oficio tiene la suya ──────────────────────────────────────
 *
 * Las 17 landings comparten estructura y buena parte del vocabulario legal,
 * que es exactamente el perfil de un grupo de páginas que un buscador puede
 * leer como variaciones de la misma. Una imagen distinta por oficio es la
 * señal más barata de que cada una trata de un negocio distinto, y de paso le
 * dice al lector «esto va de lo tuyo» antes de que empiece a leer.
 *
 * ── Por qué un mapa explícito y no una ruta construida ─────────────────────
 *
 * Sería más corto hacer `/img/oficios/${slug}.webp`. Sería también silencioso:
 * un oficio sin foto pediría un archivo inexistente y la página mostraría un
 * hueco roto. Con importaciones estáticas, un archivo que falte **rompe el
 * build**, y un oficio sin entrada aquí simplemente no lleva foto —el
 * encabezado se ve igual de bien sin ella—.
 *
 * Faltan ocho oficios por fotografiar; están en la lista de material
 * pendiente. Hasta entonces, esas páginas van sin imagen a propósito.
 *
 * Notarías se descartó ya integrada: la foto propuesta mostraba, legible, un
 * sello de «NOTARY PUBLIC · STATE OF CALIFORNIA · COUNTY OF LOS ANGELES» con
 * el águila federal estadounidense. Ilustrar la fe pública mexicana con un
 * sello de California es el tipo de detalle que un notario detecta de un
 * vistazo, en la página que más le importa a ese gremio. Mejor sin foto.
 */

const FOTOS: Record<string, { imagen: StaticImageData; alt: string }> = {
  inmobiliarias: {
    imagen: inmobiliarias,
    alt: 'Maquetas de casas alineadas sobre una mesa larga junto a una ventana.',
  },
  constructoras: {
    imagen: constructoras,
    alt: 'Maqueta de una grúa de obra junto a planos enrollados sobre un escritorio.',
  },
  arrendadores: {
    imagen: arrendadores,
    alt: 'Llave antigua sobre un sobre cerrado, encima de una cómoda.',
  },
  joyerias: {
    imagen: joyerias,
    alt: 'Anillo con piedra verde sobre un paño de lino claro.',
  },
  'galerias-de-arte': {
    imagen: galeriasDeArte,
    alt: 'Cuadro enmarcado colgado en una pared clara junto a una ventana.',
  },
  'agencias-de-autos': {
    imagen: agenciasDeAutos,
    alt: 'Juego de llaves sobre el cofre de un automóvil azul.',
  },
  'casas-de-empeno': {
    imagen: casasDeEmpeno,
    alt: 'Una mano sostiene un reloj de pulsera con carátula verde.',
  },
  donatarias: {
    imagen: donatarias,
    alt: 'Unas manos entregan monedas a otras manos abiertas.',
  },
  'plataformas-activos-virtuales': {
    imagen: plataformasActivosVirtuales,
    alt: 'Cubos de madera numerados y encadenados sobre una repisa.',
  },
};

export function RetratoOficio({ slug }: { slug: string }) {
  const foto = FOTOS[slug];
  if (!foto) return null;

  return (
    <div className="relative mt-8 overflow-clip rounded-[var(--radius-card)] border border-[var(--color-borde)] shadow-[0_20px_50px_-28px_rgb(10_31_60/.42)]">
      <Image
        src={foto.imagen}
        alt={foto.alt}
        priority
        placeholder="blur"
        sizes="(min-width: 1024px) 62rem, 100vw"
        // 21:9 en escritorio y 16:9 en móvil: una banda ancha acompaña sin
        // empujar el contenido fuera del primer pantallazo, pero en un teléfono
        // esa misma proporción deja una franja demasiado estrecha para leerse.
        className="aspect-[16/9] w-full object-cover md:aspect-[21/9]"
      />
    </div>
  );
}
