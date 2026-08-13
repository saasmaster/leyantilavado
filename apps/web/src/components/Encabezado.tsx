'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, ChevronRight, Menu, Moon, Sun, X } from 'lucide-react';
import { Boton, cn } from '@leyantilavado/ui';
import { NAVEGACION } from '@/lib/sitio';
import { useTema } from './ProveedorTema';

export function Encabezado() {
  const [abierto, setAbierto] = React.useState(false);
  const [menuActivo, setMenuActivo] = React.useState<string | null>(null);
  const [desplazado, setDesplazado] = React.useState(false);
  // El portal necesita `document`, que no existe en el servidor. Se monta tras
  // la hidratación; el menú sólo puede abrirse con un clic, así que nunca hay
  // un instante en que haga falta antes.
  const [montado, setMontado] = React.useState(false);
  React.useEffect(() => setMontado(true), []);
  const { alternar } = useTema();
  const reducido = useReducedMotion();

  // El encabezado sólo gana borde y sombra cuando la página se desplaza. En el
  // tope se funde con el fondo, que es lo que lo hace ver ligero.
  React.useEffect(() => {
    const alDesplazar = () => setDesplazado(window.scrollY > 8);
    alDesplazar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    return () => window.removeEventListener('scroll', alDesplazar);
  }, []);

  React.useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setAbierto(false);
      setMenuActivo(null);
    };
    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, []);

  // Bloquea el scroll del fondo mientras el menú móvil está abierto.
  React.useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [abierto]);

  return (
    <header
      className={cn(
        'top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300',
        // Con el menú abierto se bloquea el scroll del cuerpo, y un `sticky`
        // sin contexto de desplazamiento se va con la página: el encabezado
        // desaparecía y con él la X de cerrar. `fixed` lo ancla mientras dura.
        abierto ? 'fixed inset-x-0' : 'sticky',
        'border-b',
        desplazado
          ? 'border-[var(--color-borde)] bg-[color-mix(in_srgb,var(--color-marfil)_78%,transparent)] shadow-[var(--shadow-suave)] backdrop-blur-xl backdrop-saturate-150'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="contenedor-app flex h-[4.25rem] items-center justify-between gap-4">
        {/* `min-w-0` y no `shrink-0`: con el lema visible en móvil este bloque
            se ensanchaba y empujaba los controles de la derecha hasta
            solaparlos —el botón de tema quedaba encima del de menú y se
            tocaba el equivocado—. La marca cede espacio; los controles no. */}
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5"
          onClick={() => setAbierto(false)}
        >
          <LogoMarca />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-[family-name:var(--font-display)] text-[1.0625rem] font-semibold tracking-[-0.02em] text-[var(--color-tinta)]">
              LeyAntilavado
              <span className="text-[var(--color-petroleo)]">.org</span>
            </span>
            <span className="mt-0.5 truncate text-[0.75rem] leading-tight tracking-[0.01em] text-[var(--color-tinta-suave)]">
              Centro independiente sobre la LFPIORPI
            </span>
          </span>
        </Link>

        {/* ── Navegación de escritorio ─────────────────────────────────── */}
        <nav aria-label="Principal" className="hidden lg:flex lg:items-center lg:gap-0.5">
          {NAVEGACION.map((grupo) => {
            const activo = menuActivo === grupo.titulo;
            return (
              <div
                key={grupo.titulo}
                className="relative"
                onMouseEnter={() => setMenuActivo(grupo.titulo)}
                onMouseLeave={() => setMenuActivo(null)}
              >
                <button
                  type="button"
                  aria-expanded={activo}
                  aria-haspopup="true"
                  onClick={() => setMenuActivo((a) => (a === grupo.titulo ? null : grupo.titulo))}
                  className={cn(
                    'relative flex h-11 cursor-pointer items-center gap-1 rounded-[var(--radius-pastilla)] px-4',
                    'text-[0.875rem] font-medium transition-colors duration-200',
                    activo
                      ? 'text-[var(--color-tinta)]'
                      : 'text-[var(--color-tinta-suave)] hover:text-[var(--color-tinta)]',
                  )}
                >
                  {/* Pastilla compartida: se desliza entre elementos con layoutId
                      en vez de aparecer y desaparecer. */}
                  {activo && (
                    <motion.span
                      layoutId="pastilla-nav"
                      className="absolute inset-0 -z-10 rounded-[var(--radius-pastilla)] bg-[var(--color-marfil-hondo)]"
                      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                    />
                  )}
                  {grupo.titulo}
                  <ChevronDown
                    className={cn(
                      'size-3.5 transition-transform duration-200',
                      activo && 'rotate-180',
                    )}
                  />
                </button>

                <AnimatePresence>
                  {activo && (
                    <motion.div
                      /* La ENTRADA no anima opacidad: el menú aparece opaco
                         desde el primer fotograma y sólo se desliza. Con un
                         desvanecido, durante esos ~180 ms el panel es
                         translúcido y el texto de la página se lee entre las
                         letras del menú — que es justo el defecto que se
                         reportó. La salida sí desvanece: ahí ya no hay nada
                         que leer y el desvanecido evita el corte seco. */
                      initial={reducido ? false : { y: -8, scale: 0.97 }}
                      animate={{ y: 0, scale: 1, opacity: 1 }}
                      exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-full w-[21rem] origin-top pt-2"
                    >
                      <ul className="superficie-flotante overflow-hidden p-2">
                        {grupo.enlaces.map((enlace) => (
                          <li key={enlace.href}>
                            <Link
                              href={enlace.href}
                              onClick={() => setMenuActivo(null)}
                              className="group/e flex items-start gap-3 rounded-[var(--radius-control)] px-3 py-2.5 transition-colors duration-150 hover:bg-[var(--color-marfil-hondo)]"
                            >
                              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="text-[0.9rem] font-medium text-[var(--color-tinta)]">
                                  {enlace.etiqueta}
                                </span>
                                {enlace.descripcion && (
                                  <span className="text-[0.8rem] leading-snug text-[var(--color-tinta-tenue)]">
                                    {enlace.descripcion}
                                  </span>
                                )}
                              </span>
                              {/* La flecha aparece al apuntar y se desplaza un
                                  pelo: indica destino sin ocupar sitio cuando
                                  no hace falta. */}
                              <ChevronRight
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 -translate-x-1 text-[var(--color-tinta-tenue)] opacity-0 transition-[opacity,transform] duration-200 group-hover/e:translate-x-0 group-hover/e:opacity-100"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* El ícono lo decide CSS, no React: el script anti-parpadeo ya cambió
              el DOM antes de que React hidrate, así que ramificar el render con
              el tema rompería la hidratación. La etiqueta accesible describe la
              acción, que es la misma en ambos sentidos. */}
          <button
            type="button"
            onClick={alternar}
            aria-label="Cambiar entre modo claro y modo oscuro"
            className="grid size-11 cursor-pointer place-items-center rounded-[var(--radius-control)] text-[var(--color-tinta-suave)] transition-colors duration-200 hover:bg-[var(--color-marfil-hondo)] hover:text-[var(--color-tinta)]"
          >
            <Moon className="size-[1.15rem] oscuro:hidden" />
            <Sun className="hidden size-[1.15rem] oscuro:block" />
          </button>

          <Boton comoHijo variante="accion" tamano="sm" className="hidden md:inline-flex">
            <Link href="/herramientas/cuestionario">Descubre si te aplica</Link>
          </Boton>

          <button
            type="button"
            onClick={() => setAbierto((a) => !a)}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            className="grid size-11 cursor-pointer place-items-center rounded-[var(--radius-control)] text-[var(--color-tinta)] transition-colors duration-200 hover:bg-[var(--color-marfil-hondo)] lg:hidden"
          >
            {abierto ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* ── Navegación móvil ─────────────────────────────────────────────
          Capa FIJA, no una expansión del encabezado.
          
          Antes el menú crecía dentro del `<header sticky>`. Con los cuatro
          grupos abiertos el encabezado pasaba a medir 841px en una ventana de
          839px, y un elemento `sticky` más alto que el viewport deja de
          pegarse: es lo que dice la especificación, no un fallo del navegador.
          Resultado: si abrías el menú a mitad de página, se iba hacia arriba
          con el scroll y había que subir del todo para verlo.
          
          Con `fixed` el menú ocupa la pantalla desde debajo del encabezado y
          se queda donde está, se haya desplazado la página o no. */}
      {montado &&
        createPortal(
          <AnimatePresence>
            {abierto && (
              <>
                {/* Telón: da a dónde tocar para cerrar sin buscar la X, que es lo
                    que hace la mano en un teléfono. */}
                <motion.button
                  type="button"
                  aria-label="Cerrar menú"
                  onClick={() => setAbierto(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 top-[4.25rem] z-40 bg-[color-mix(in_srgb,var(--color-tinta)_28%,transparent)] lg:hidden"
                />
                <motion.nav
                  id="menu-movil"
                  aria-label="Principal móvil"
                  /* La entrada NO anima opacidad, igual que el desplegable
                     de escritorio: durante el desvanecido el panel es
                     translúcido y se lee la página entre las líneas del menú.
                     Aparece opaco y sólo se desliza. La salida sí desvanece,
                     que ahí ya no hay nada que leer. */
                  initial={reducido ? false : { y: -10 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-x-0 top-[4.25rem] z-50 max-h-[calc(100dvh-4.25rem)] overflow-y-auto overscroll-contain border-t border-[var(--color-borde)] bg-[var(--color-marfil)] shadow-[0_16px_40px_-12px_rgb(0_0_0/0.25)] lg:hidden"
                >
                  <div className="contenedor-app flex flex-col gap-7 py-6">
                    {/* El CTA arriba, no al final.
                        Estaba a 1.439px dentro del panel: había que recorrer los
                        cuatro grupos de navegación para llegar a la acción
                        principal del sitio. */}
                    <Boton comoHijo variante="accion" ancho="completo" tamano="lg">
                      <Link href="/herramientas/cuestionario" onClick={() => setAbierto(false)}>
                        Descubre si te aplica
                      </Link>
                    </Boton>
                  {NAVEGACION.map((grupo) => (
                    <div key={grupo.titulo}>
                      <p className="eyebrow mb-2.5">{grupo.titulo}</p>
                      <ul className="flex flex-col">
                        {grupo.enlaces.map((enlace) => (
                          <li key={enlace.href}>
                            <Link
                              href={enlace.href}
                              onClick={() => setAbierto(false)}
                              className="flex min-h-11 items-center rounded-[var(--radius-control)] px-3 text-[0.95rem] text-[var(--color-tinta)] transition-colors duration-150 hover:bg-[var(--color-marfil-hondo)]"
                            >
                              {enlace.etiqueta}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  </div>
                </motion.nav>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </header>
  );
}

/**
 * Marca. Deliberadamente abstracta: un escudo nacional o un águila darían la
 * impresión de sitio oficial, que es justo lo que este proyecto NO debe hacer.
 */
function LogoMarca() {
  return (
    <span className="relleno-marca relative grid size-9 place-items-center overflow-hidden rounded-[0.7rem] shadow-[var(--shadow-suave)] transition-transform duration-300 ease-[var(--ease-suave)] group-hover:scale-[1.06]">
      <svg viewBox="0 0 24 24" className="size-[1.15rem]" aria-hidden="true">
        <path
          d="M12 3.2l6 2.7v5c0 3.8-2.5 7.1-6 8.3-3.5-1.2-6-4.5-6-8.3v-5l6-2.7z"
          fill="none"
          stroke="rgb(255 255 255 / 0.55)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9.4 12.2l1.9 2 3.3-3.9"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
