import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from './cn';

const boton = cva(
  // Base. Tres detalles que separan un botón actual de uno de 2015:
  //  · la transición incluye `transform`, y el hover sube 1px — se siente físico
  //  · `active:` baja el botón, cerrando el ciclo de respuesta táctil
  //  · las transiciones duran 200ms: menos se siente brusco, más se siente lento
  'group relative inline-flex items-center justify-center gap-2 ' +
    'rounded-[var(--radius-control)] font-medium whitespace-nowrap ' +
    'cursor-pointer select-none isolate ' +
    'transition-[background-color,border-color,color,box-shadow,transform,opacity] ' +
    'duration-200 ease-[var(--ease-suave)] ' +
    'hover:-translate-y-px active:translate-y-0 active:scale-[0.985] ' +
    // El estado deshabilitado baja opacidad Y desatura, en vez de bajar sólo
    // la opacidad: al 45% el texto del botón de contorno caía a ~2.4:1 sobre
    // el fondo, por debajo del mínimo legible.
    'disabled:pointer-events-none disabled:opacity-60 disabled:saturate-50 ' +
    'disabled:hover:translate-y-0 ' +
    '[&_svg]:size-[1.05em] [&_svg]:shrink-0',
  {
    variants: {
      variante: {
        primario:
          'bg-[var(--color-marino)] text-white shadow-[var(--shadow-suave)] ' +
          'hover:bg-[var(--color-marino-claro)] hover:shadow-[var(--shadow-media)] ' +
          'oscuro:text-[var(--color-marfil-hondo)]',
        accion:
          // `relleno-accion` es una clase real de globals.css, no una utilidad
          // arbitraria: Tailwind v4 descarta en silencio los valores con comas
          // dentro de una función, y el botón quedaba invisible.
          'relleno-accion text-white shadow-[var(--shadow-suave)] ' +
          'hover:shadow-[var(--shadow-media)] hover:brightness-110 ' +
          'oscuro:text-[#062024]',
        contorno:
          'border border-[var(--color-borde-fuerte)] text-[var(--color-tinta)] ' +
          'bg-[color-mix(in_srgb,var(--color-superficie)_70%,transparent)] backdrop-blur-sm ' +
          'hover:bg-[var(--color-superficie)] hover:border-[var(--color-tinta-tenue)] ' +
          'hover:shadow-[var(--shadow-suave)]',
        fantasma:
          'text-[var(--color-tinta-suave)] hover:bg-[var(--color-marfil-hondo)] ' +
          'hover:text-[var(--color-tinta)]',
        enlace:
          'px-0 text-[var(--color-petroleo-hondo)] underline underline-offset-4 ' +
          'decoration-[1.5px] hover:decoration-2 hover:-translate-y-0',
        peligro: 'bg-[var(--color-rojo)] text-white hover:brightness-110',
      },
      tamano: {
        // Todos ≥44px de alto, sin excepción.
        //
        // `sm` medía 36px con el argumento de que sólo se usa en barras densas
        // de escritorio. El argumento no se sostiene: una laptop con pantalla
        // táctil, un convertible o un puntero motorizado usan ese mismo botón,
        // y 36px falla el objetivo mínimo de WCAG 2.5.5. La densidad se
        // consigue con el padding horizontal y el tamaño de letra, no
        // encogiendo el área que hay que acertar.
        //
        // El padding horizontal subió en los tres: con un icono, el texto y el
        // hueco entre ambos, 20px dejaban las letras pegadas al borde.
        sm: 'h-11 px-4 text-[0.85rem]',
        md: 'h-11 px-6 text-[0.925rem]',
        lg: 'h-[3.25rem] px-8 text-[1rem]',
      },
      ancho: {
        auto: '',
        completo: 'w-full',
      },
    },
    defaultVariants: { variante: 'primario', tamano: 'md', ancho: 'auto' },
  },
);

export interface BotonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof boton> {
  /** Renderiza el hijo directo en lugar de un <button> — para envolver <Link>. */
  comoHijo?: boolean;
}

export const Boton = React.forwardRef<HTMLButtonElement, BotonProps>(
  ({ className, variante, tamano, ancho, comoHijo, children, ...props }, ref) => {
    const clases = cn(boton({ variante, tamano, ancho }), className);

    if (comoHijo && React.isValidElement(children)) {
      const hijo = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(hijo, { className: cn(clases, hijo.props.className) });
    }

    return (
      <button ref={ref} className={clases} {...props}>
        {children}
      </button>
    );
  },
);
Boton.displayName = 'Boton';

export { boton as variantesBoton };
