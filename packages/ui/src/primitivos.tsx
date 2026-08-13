import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

/* ── Tarjeta ─────────────────────────────────────────────────────────────── */

export function Tarjeta({
  className,
  elevada,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { elevada?: boolean }) {
  // El anillo de foco lo lleva la tarjeta, no el enlace.
  //
  // El patrón de «enlace estirado» —un `<a>` con `after:absolute inset-0` que
  // cubre toda la tarjeta— obliga a quitarle el `outline` al enlace, porque
  // dibujaría el anillo alrededor de un elemento de 0×0. Quitarlo es correcto;
  // lo que faltaba era devolvérselo al contenedor. Sin esto, 18 tarjetas de
  // /herramientas se recorrían con el teclado sin que nada se moviera en
  // pantalla.
  return (
    <div
      className={cn(
        'tarjeta',
        'has-[a:focus-visible]:outline has-[a:focus-visible]:outline-[2.5px]',
        'has-[a:focus-visible]:outline-[var(--color-anillo)] has-[a:focus-visible]:outline-offset-2',
        elevada && 'tarjeta-elevada',
        className,
      )}
      {...props}
    />
  );
}

export function TarjetaEncabezado({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 md:p-6 pb-0 md:pb-0', className)} {...props} />;
}

export function TarjetaCuerpo({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 md:p-6', className)} {...props} />;
}

export function TarjetaTitulo({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-[var(--color-tinta)]', className)} {...props} />;
}

/* ── Insignia ────────────────────────────────────────────────────────────── */

const insignia = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none',
  {
    variants: {
      tono: {
        neutro: 'bg-[var(--color-marfil-hondo)] text-[var(--color-tinta-suave)]',
        marino: 'bg-[var(--color-marino-tenue)] text-[var(--color-marino)]',
        petroleo: 'bg-[var(--color-petroleo-tenue)] text-[var(--color-petroleo-hondo)]',
        ambar: 'bg-[var(--color-ambar-tenue)] text-[var(--color-ambar)]',
        rojo: 'bg-[var(--color-rojo-tenue)] text-[var(--color-rojo)]',
        verde: 'bg-[var(--color-verde-tenue)] text-[var(--color-verde)]',
      },
    },
    defaultVariants: { tono: 'neutro' },
  },
);

export function Insignia({
  className,
  tono,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof insignia>) {
  return <span className={cn(insignia({ tono }), className)} {...props} />;
}

/* ── Nota / callout ──────────────────────────────────────────────────────── */

/**
 * El tono se lee por el fondo teñido y por un contorno completo de 1px del
 * mismo color, no por una franja gruesa a la izquierda.
 *
 * La franja de 4px era ruido: sumada a las decenas de notas que hay en el
 * sitio, llenaba las páginas de barras de colores compitiendo entre sí, y el
 * peso visual del aviso no guardaba ninguna relación con su gravedad. Un
 * contorno completo delimita el bloque igual de bien, se distingue igual por
 * color, y deja que el texto sea lo que pesa.
 */
const nota = cva('rounded-[var(--radius-card)] border p-4 text-sm leading-relaxed', {
  variants: {
    tono: {
      info: 'border-[color-mix(in_srgb,var(--color-marino)_28%,transparent)] bg-[var(--color-marino-tenue)] text-[var(--color-tinta)]',
      atencion:
        'border-[color-mix(in_srgb,var(--color-ambar)_38%,transparent)] bg-[var(--color-ambar-tenue)] text-[var(--color-tinta)]',
      riesgo:
        'border-[color-mix(in_srgb,var(--color-rojo)_32%,transparent)] bg-[var(--color-rojo-tenue)] text-[var(--color-tinta)]',
      exito:
        'border-[color-mix(in_srgb,var(--color-verde)_32%,transparent)] bg-[var(--color-verde-tenue)] text-[var(--color-tinta)]',
    },
  },
  defaultVariants: { tono: 'info' },
});

export function Nota({
  className,
  tono,
  titulo,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof nota> & { titulo?: string }) {
  return (
    <div
      role={tono === 'riesgo' ? 'alert' : undefined}
      className={cn(nota({ tono }), className)}
      {...props}
    >
      {titulo && <p className="mb-1 font-semibold">{titulo}</p>}
      <div className="[&_p+p]:mt-2">{children}</div>
    </div>
  );
}

/* ── Campo de formulario ─────────────────────────────────────────────────────
   La etiqueta es SIEMPRE visible: el placeholder no es una etiqueta. El error
   se muestra junto al campo, no en un resumen al inicio del formulario.
   ─────────────────────────────────────────────────────────────────────────── */

export interface CampoProps {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  requerido?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Campo({ id, etiqueta, ayuda, error, requerido, children, className }: CampoProps) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-tinta)]">
        {etiqueta}
        {/* El asterisco es convención visual y nada más: `aria-label` sobre un
            <span> sin rol no produce nombre accesible —lo ignoran casi todos
            los lectores de pantalla—, así que antes esto no anunciaba nada.
            Lo que sí funciona es marcar el control con `aria-required`, abajo:
            así la obligatoriedad se oye al enfocar el campo, que es cuando
            hace falta saberla. */}
        {requerido && (
          <span className="ml-1 text-[var(--color-rojo)]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {ayuda && (
        <p id={idAyuda} className="text-xs text-[var(--color-tinta-tenue)]">
          {ayuda}
        </p>
      )}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id,
            'aria-describedby': [idAyuda, idError].filter(Boolean).join(' ') || undefined,
            'aria-invalid': error ? true : undefined,
            'aria-required': requerido ? true : undefined,
          })
        : children}
      {error && (
        <p id={idError} role="alert" className="text-xs font-medium text-[var(--color-rojo)]">
          {error}
        </p>
      )}
    </div>
  );
}

const controlBase =
  'h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-borde-fuerte)] ' +
  'bg-[var(--color-superficie)] px-3 text-[var(--color-tinta)] ' +
  'placeholder:text-[var(--color-tinta-tenue)] ' +
  'transition-[border-color,box-shadow] duration-150 ' +
  'aria-[invalid=true]:border-[var(--color-rojo)]';

export const Entrada = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(controlBase, className)} {...props} />
  ),
);
Entrada.displayName = 'Entrada';

export const Selector = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(controlBase, 'cursor-pointer pr-8', className)} {...props} />
));
Selector.displayName = 'Selector';

export const AreaTexto = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(controlBase, 'h-auto min-h-24 resize-y py-2.5 leading-relaxed', className)}
    {...props}
  />
));
AreaTexto.displayName = 'AreaTexto';

/* ── Tabla con scroll propio ─────────────────────────────────────────────────
   El contenedor scrollea, nunca el body de la página.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Contenedor con desplazamiento horizontal para tablas anchas.
 *
 * `tabIndex={0}` es lo que permite recorrer una tabla ancha con el teclado:
 * sin él, quien no usa ratón no puede ver las columnas que quedan fuera.
 *
 * `role="region"` sólo se aplica cuando hay nombre. Una región anónima es peor
 * que ninguna: el lector de pantalla anuncia "región" y se calla, y además
 * ensucia la lista de puntos de referencia de la página con entradas
 * indistinguibles. Sin nombre queda como lo que es —un contenedor que se
 * desplaza—, que sigue siendo enfocable y no miente sobre su estructura.
 */
export function TablaEnvoltura({
  className,
  etiqueta,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { etiqueta?: string }) {
  // La máscara de degradado en el borde derecho es la señal de que hay más
  // tabla. Sin ella, en móvil la tabla de umbrales se corta limpiamente en el
  // borde y parece terminada: las columnas de identificación y aviso —el
  // contenido entero de la página— quedan fuera de pantalla sin ningún indicio
  // de que existan. El usuario concluye que el sitio no trae las cifras.
  //
  // Se hace con `mask-image` y no con un pseudoelemento porque la máscara
  // desaparece sola al llegar al final del scroll, sin JavaScript que escuche
  // el evento.
  return (
    <div className="relative">
      <div
        tabIndex={0}
        {...(etiqueta ? { role: 'region', 'aria-label': etiqueta } : {})}
        className={cn(
          'overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-borde)]',
          'tabla-con-scroll',
          className,
        )}
        {...props}
      />
      <p className="mt-2 text-sm text-[var(--color-tinta-tenue)] md:hidden" aria-hidden="true">
        Desliza la tabla para ver todas las columnas →
      </p>
    </div>
  );
}

/* ── Estado vacío ────────────────────────────────────────────────────────── */

export function EstadoVacio({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-borde-fuerte)] px-6 py-12 text-center">
      <p className="font-medium text-[var(--color-tinta)]">{titulo}</p>
      <p className="max-w-md text-sm text-[var(--color-tinta-suave)]">{descripcion}</p>
      {accion}
    </div>
  );
}
