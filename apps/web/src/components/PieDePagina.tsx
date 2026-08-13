import Link from 'next/link';
import { AvisoIndependencia } from '@leyantilavado/ui';
import { ENLACES_PIE, NAVEGACION, SITIO } from '@/lib/sitio';

// Se resuelve al importar el módulo, no en cada render: `new Date()` durante
// el render dispara la regla `react-hooks/purity` de eslint, que tsc no ve y
// sólo aparece en `next build`.
const ANIO_ACTUAL = new Date().getFullYear();

/**
 * `mt-12` en móvil y `mt-24` a partir de tablet.
 *
 * La sección que precede al pie ya trae su propio relleno inferior, así que
 * los dos márgenes se apilaban: 220px sin nada dibujado justo antes del pie.
 * En escritorio eso es aire; en una pantalla de 839px es un cuarto de la vista
 * en blanco después de una sección que ya parece un cierre, y se lee como que
 * la página se acabó o falló algo.
 *
 * El borde superior ya separa el pie del contenido; el margen sólo tiene que
 * dar respiro, no abrir un vacío.
 */
export function PieDePagina() {
  return (
    <footer className="mt-12 border-t border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] md:mt-24">
      <div className="contenedor-app py-12">
        {/* El aviso de independencia va arriba del todo, no escondido en la
            letra chica: es la promesa central del proyecto. */}
        <AvisoIndependencia className="mb-10 bg-[var(--color-superficie)]" />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-tinta)]">
              LeyAntilavado<span className="text-[var(--color-petroleo)]">.org</span>
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-tinta-suave)]">
              {SITIO.subtitulo}. Herramientas gratuitas, fuente oficial citada y fecha de última
              revisión en cada conclusión.
            </p>
            <Link
              href="/fuentes-oficiales"
              className="mt-4 inline-block text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
            >
              Ver las fuentes que usamos
            </Link>
          </div>

          {NAVEGACION.map((grupo) => (
            <nav key={grupo.titulo} aria-label={grupo.titulo}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                {grupo.titulo}
              </p>
              <ul className="flex flex-col gap-0.5 sm:gap-2">
                {grupo.enlaces.map((e) => (
                  <li key={e.href}>
                    <Link
                      href={e.href}
                      className="inline-flex min-h-11 items-center text-sm text-[var(--color-tinta-suave)] transition-colors duration-150 hover:text-[var(--color-tinta)] sm:min-h-0 sm:py-1"
                    >
                      {e.etiqueta}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-[var(--color-borde)] pt-8 sm:flex-row sm:justify-between">
          {ENLACES_PIE.map((grupo) => (
            <nav key={grupo.titulo} aria-label={grupo.titulo}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                {grupo.titulo}
              </p>
              <ul className="flex flex-wrap gap-x-5 gap-y-0.5 sm:gap-y-2">
                {grupo.enlaces.map((e) => (
                  <li key={e.href}>
                    <Link
                      href={e.href}
                      className="inline-flex min-h-11 items-center text-sm text-[var(--color-tinta-suave)] transition-colors duration-150 hover:text-[var(--color-tinta)] sm:min-h-0 sm:py-1"
                    >
                      {e.etiqueta}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-8 text-xs text-[var(--color-tinta-tenue)]">
          © {ANIO_ACTUAL} {SITIO.nombre}. Los nombres SAT, UIF y SHCP se usan
          únicamente para identificar a las autoridades a las que se refiere la normativa citada.
        </p>
      </div>
    </footer>
  );
}
