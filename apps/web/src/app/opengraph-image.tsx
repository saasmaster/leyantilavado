import { ImageResponse } from 'next/og';
import { SITIO } from '@/lib/sitio';

/**
 * Imagen de vista previa para redes y mensajería.
 *
 * Vive en la raíz de `app/` a propósito: el convenio de archivos de Next hace
 * que las rutas hijas la hereden, así que una sola imagen cubre las 93 URL
 * públicas sin tocar ninguna página. Cuando alguna merezca la suya, basta con
 * poner otro `opengraph-image` en su carpeta y ésta deja de aplicar ahí.
 *
 * Sin tipografía descargada: `ImageResponse` tendría que ir a buscarla por red
 * durante el build, y una imagen de vista previa no es motivo suficiente para
 * meter una descarga en la ruta crítica de compilación.
 *
 * Los colores están escritos como hex y no como `var(--color-…)` porque esto no
 * se pinta en un navegador: Satori resuelve el estilo por su cuenta y no tiene
 * la hoja de estilos del sitio. Son los mismos valores de `globals.css`.
 */

export const alt = `${SITIO.nombre} — ${SITIO.subtitulo}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MARINO = '#0a1f3c';
const MARINO_CLARO = '#14355e';
const PETROLEO_VIVO = '#0e9089';
const MARFIL = '#fcfcfa';
const TINTA_TENUE = '#a5b5c4';

export default function Imagen() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: MARINO,
          // Degradado sutil para que la tarjeta no se lea como un rectángulo plano.
          backgroundImage: `linear-gradient(135deg, ${MARINO} 0%, ${MARINO_CLARO} 100%)`,
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 14, height: 56, backgroundColor: PETROLEO_VIVO, borderRadius: 3 }} />
          <div style={{ display: 'flex', color: MARFIL, fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>
            {SITIO.nombre}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              color: MARFIL,
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: -1.5,
              maxWidth: 940,
            }}
          >
            Qué te obliga la Ley Antilavado, con la cifra correcta a la fecha de tu operación
          </div>
          <div style={{ display: 'flex', color: TINTA_TENUE, fontSize: 27, lineHeight: 1.35, maxWidth: 900 }}>
            Umbrales, límites de efectivo, plazos de aviso y multas de la LFPIORPI. Cada cifra con su
            artículo y su fuente oficial.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: TINTA_TENUE, fontSize: 23 }}>
          <div style={{ display: 'flex' }}>{SITIO.url.replace(/^https?:\/\//, '')}</div>
          <div style={{ width: 5, height: 5, backgroundColor: PETROLEO_VIVO, borderRadius: 5 }} />
          <div style={{ display: 'flex' }}>Proyecto independiente · No es una autoridad</div>
        </div>
      </div>
    ),
    size,
  );
}
