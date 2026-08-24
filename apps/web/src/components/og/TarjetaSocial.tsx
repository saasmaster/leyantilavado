import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { SITIO } from '@/lib/sitio';

/**
 * Tarjeta de vista previa con fotografía de fondo, para redes y mensajería.
 *
 * ── Por qué el texto se dibuja aquí y no viene en la imagen ────────────────
 *
 * Es la misma regla que gobierna el resto del sitio: una cifra dentro de un
 * JPEG no se puede verificar ni se actualiza sola. La UMA cambia cada 1 de
 * febrero; si el número estuviera pintado en la foto, la tarjeta de `/umbrales`
 * seguiría enseñando el valor viejo y nadie se enteraría. Aquí el texto se
 * compone al construir el sitio, con lo que diga el motor ese día.
 *
 * Por eso las fotografías de fondo se piden sin una sola letra.
 *
 * ── Por qué las imágenes viven fuera de `public/` ─────────────────────────
 *
 * Sólo se leen durante la compilación. Ponerlas en `public/` las publicaría en
 * una URL propia sin que nada las use, y son 640 KB que ningún visitante
 * necesita descargar.
 *
 * ── Por qué JPEG y no el WebP original ────────────────────────────────────
 *
 * El renderizador de `ImageResponse` no comparte el soporte de formatos del
 * navegador. Los originales de 2560 px se recortan a 1200×630 —la medida que
 * esperan WhatsApp, LinkedIn y X— y se convierten a JPEG en el mismo paso.
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MARINO = '#0a1f3c';
const PETROLEO_VIVO = '#0e9089';
const MARFIL = '#fcfcfa';
const TINTA_TENUE = '#c2cedb';

/** Lee la foto del disco y la incrusta; Satori no resuelve rutas relativas. */
function fondoIncrustado(nombre: string): string {
  const archivo = path.join(process.cwd(), 'src', 'imagenes-og', `${nombre}.jpg`);
  return `data:image/jpeg;base64,${readFileSync(archivo).toString('base64')}`;
}

export function tarjetaSocial({
  fondo,
  titulo,
  apoyo,
}: {
  /** Nombre del archivo en `src/imagenes-og`, sin extensión. */
  fondo: string;
  titulo: string;
  /** Una línea. Aquí es donde entran las cifras que da el motor. */
  apoyo: string;
}) {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
        <img
          src={fondoIncrustado(fondo)}
          width={1200}
          height={630}
          style={{ position: 'absolute', inset: 0, objectFit: 'cover' }}
        />
        {/*
         * Velo teñido de marino, no negro.
         *
         * El texto va sobre una fotografía cuyo brillo cambia de un punto a
         * otro, así que sin velo el contraste no se puede garantizar. Se tiñe
         * con el marino de la marca porque un velo negro apaga el color de la
         * foto y la deja gris, y la calidez es lo que hace que valga la pena.
         *
         * Más denso a la izquierda, que es donde cae el texto, y más
         * transparente a la derecha para que la fotografía se siga viendo.
         */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            /*
             * Medidas explícitas, no `inset: 0`.
             *
             * El motor de `ImageResponse` no calcula el tamaño de un elemento
             * vacío a partir de `inset`: lo deja en cero, y un degradado sobre
             * un rectángulo de cero por cero no pinta nada. La imagen de arriba
             * sí aparece porque lleva `width` y `height` propios.
             *
             * El fallo no da error: la tarjeta se genera igual, sólo que con el
             * texto blanco directamente sobre la fotografía. Sobre un fondo
             * claro queda ilegible, y sólo se ve abriendo la imagen.
             *
             * `rgba()` en vez de `#0a1f3cf5` por el mismo motivo de cautela: el
             * hex de ocho dígitos no está garantizado en este renderizador.
             */
            width: size.width,
            height: size.height,
            display: 'flex',
            backgroundImage:
              'linear-gradient(100deg, rgba(10,31,60,0.96) 0%, rgba(10,31,60,0.90) 48%, rgba(10,31,60,0.66) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '68px 76px',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 14, height: 52, backgroundColor: PETROLEO_VIVO, borderRadius: 3 }} />
            <div
              style={{
                display: 'flex',
                color: MARFIL,
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
            >
              {SITIO.nombre}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                display: 'flex',
                color: MARFIL,
                fontSize: 60,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: -1.5,
                maxWidth: 880,
              }}
            >
              {titulo}
            </div>
            <div
              style={{
                display: 'flex',
                color: TINTA_TENUE,
                fontSize: 27,
                lineHeight: 1.35,
                maxWidth: 820,
              }}
            >
              {apoyo}
            </div>
          </div>

          <div
            style={{ display: 'flex', alignItems: 'center', gap: 16, color: TINTA_TENUE, fontSize: 22 }}
          >
            <div style={{ display: 'flex' }}>{SITIO.url.replace(/^https?:\/\//, '')}</div>
            <div style={{ width: 5, height: 5, backgroundColor: PETROLEO_VIVO, borderRadius: 5 }} />
            <div style={{ display: 'flex' }}>Proyecto independiente · No es una autoridad</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
