import type { Metadata, Viewport } from 'next';
import { Inter, Inter_Tight, Source_Serif_4 } from 'next/font/google';
import { Encabezado } from '@/components/Encabezado';
import { PieDePagina } from '@/components/PieDePagina';
import { ProveedorTema } from '@/components/ProveedorTema';
import { RegistroSW } from '@/components/RegistroSW';
import { SITIO, construirMetadata, jsonLdOrganizacion } from '@/lib/sitio';

/**
 * Aplica el tema guardado ANTES del primer pintado, para que no haya un
 * destello blanco al cargar en modo oscuro.
 *
 * Vivió un rato en su propio módulo para que `next.config.mjs` calculara su
 * hash SHA-256 y lo permitiera en la CSP. Esa estrategia se descartó —los
 * scripts de hidratación de Next no se pueden cubrir con hashes— así que el
 * módulo perdió su razón de ser y el texto vuelve aquí.
 */
const SCRIPT_TEMA =
  "(function(){try{var t=localStorage.getItem('tema');var o=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='oscuro'||(!t&&o))document.documentElement.classList.add('oscuro');}catch(e){}})();";
import './globals.css';

/**
 * Tres tipografías con tres trabajos distintos.
 *
 * El error de la primera versión fue usar un serif tradicional para los
 * titulares: transmite "despacho con columnas dóricas", no "herramienta que
 * calcula". El serif se conserva, pero sólo donde gana — el cuerpo de los
 * artículos largos.
 */

/** Titulares. Apretada y de altura x grande: el look de producto actual. */
const display = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fuente-display',
  weight: ['500', '600', '700'],
});

/** Interfaz, formularios y cifras. */
const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fuente-sans',
});

/** Cuerpo de artículos largos, donde el serif sí mejora la lectura. */
const lectura = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fuente-lectura',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  ...construirMetadata({
    titulo: SITIO.nombre,
    descripcion: SITIO.descripcion,
    ruta: '/',
  }),
  applicationName: SITIO.nombre,
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBFAF7' },
    { media: '(prefers-color-scheme: dark)', color: '#0A1420' },
  ],
  // No se bloquea el zoom: es requisito de accesibilidad.
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-MX"
      className={`${sans.variable} ${display.variable} ${lectura.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* El tema se aplica ANTES del primer pintado, para que no haya un
            destello blanco al cargar en modo oscuro.

            El texto viene de un módulo compartido porque `next.config.mjs`
            calcula su hash SHA-256 y lo permite explícitamente en la CSP. Si
            se escribiera aquí a mano, el hash dejaría de coincidir y el
            navegador bloquearía el script sin explicación visible. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganizacion()) }}
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a href="#contenido" className="salto-contenido">
          Saltar al contenido principal
        </a>
        <ProveedorTema>
          <Encabezado />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <PieDePagina />
          <RegistroSW />
        </ProveedorTema>
      </body>
    </html>
  );
}
