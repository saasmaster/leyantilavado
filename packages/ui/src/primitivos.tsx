import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

/* ── Tarjeta ─────────────────────────────────────────────────────────────── */

export function Tarjeta({
  className,
  elevada,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { elevada?: boolean }) {
  return <div className={cn('tarjeta', elevada && 'tarjeta-elevada', className)} {...props} />;
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

const nota = cva('rounded-[var(--radius-card)] border-l-4 p-4 text-sm leading-relaxed', {
  variants: {
    tono: {
      info: 'border-l-[var(--color-marino)] bg-[var(--color-marino-tenue)] text-[var(--color-tinta)]',
      atencion: 'border-l-[var(--color-ambar)] bg-[var(--color-ambar-tenue)] text-[var(--color-tinta)]',
      riesgo: 'border-l-[var(--color-rojo)] bg-[var(--color-rojo-tenue)] text-[var(--color-tinta)]',
      exito: 'border-l-[var(--color-verde)] bg-[var(--color-verde-tenue)] text-[var(--color-tinta)]',
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
        {requerido && (
          <span className="ml-1 text-[var(--color-rojo)]" aria-label="obligatorio">
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

export function TablaEnvoltura({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      tabIndex={0}
      role="region"
      className={cn(
        'overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-borde)]',
        className,
      )}
      {...props}
    />
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
