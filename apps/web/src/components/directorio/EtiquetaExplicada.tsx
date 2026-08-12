import * as React from 'react';
import { cn } from '@leyantilavado/ui';

/* ────────────────────────────────────────────────────────────────────────────
 * Etiqueta que se despliega y explica qué significa.
 *
 * Usa `<details>` nativo: funciona sin JavaScript, es accesible por teclado y
 * el lector de pantalla anuncia el estado. Ninguna etiqueta del directorio
 * —verificación o publicidad— aparece sin su explicación a un clic.
 * ────────────────────────────────────────────────────────────────────────── */

const TONOS = {
  neutro: 'bg-[var(--color-marfil-hondo)] text-[var(--color-tinta-suave)]',
  marino: 'bg-[var(--color-marino-tenue)] text-[var(--color-marino)]',
  petroleo: 'bg-[var(--color-petroleo-tenue)] text-[var(--color-petroleo-hondo)]',
  ambar: 'bg-[var(--color-ambar-tenue)] text-[var(--color-ambar)]',
  verde: 'bg-[var(--color-verde-tenue)] text-[var(--color-verde)]',
} as const;

export type TonoEtiqueta = keyof typeof TONOS;

export function EtiquetaExplicada({
  etiqueta,
  titulo,
  explicacion,
  nota,
  tono = 'neutro',
  icono,
  className,
}: {
  etiqueta: string;
  titulo: string;
  explicacion: string;
  /** Segunda línea: lo que la etiqueta NO significa. */
  nota?: string;
  tono?: TonoEtiqueta;
  icono?: React.ReactNode;
  className?: string;
}) {
  return (
    <details className={cn('relative inline-block align-middle', className)}>
      <summary
        className={cn(
          'inline-flex min-h-[1.75rem] cursor-pointer list-none items-center gap-1.5 rounded-full',
          'px-2.5 py-1 text-xs font-medium leading-none',
          'marker:content-none [&::-webkit-details-marker]:hidden',
          TONOS[tono],
        )}
      >
        {icono}
        <span>{etiqueta}</span>
        <span aria-hidden="true" className="opacity-60">
          ?
        </span>
        <span className="sr-only">— ver qué significa</span>
      </summary>
      <div
        className={cn(
          'absolute left-0 top-full z-30 mt-2 w-72 max-w-[min(18rem,80vw)]',
          'rounded-[var(--radius-card)] border border-[var(--color-borde-fuerte)]',
          'bg-[var(--color-superficie)] p-3 text-left shadow-[var(--shadow-alta)]',
        )}
      >
        <p className="text-sm font-semibold text-[var(--color-tinta)]">{titulo}</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
          {explicacion}
        </p>
        {nota && (
          <p className="mt-2 border-t border-[var(--color-borde)] pt-2 text-xs leading-relaxed text-[var(--color-tinta-tenue)]">
            {nota}
          </p>
        )}
      </div>
    </details>
  );
}
