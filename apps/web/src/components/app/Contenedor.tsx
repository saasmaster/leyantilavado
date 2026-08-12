import type { ReactNode } from 'react';
import { Insignia } from '@leyantilavado/ui';

export function EncabezadoSeccion({
  titulo,
  descripcion,
  acciones,
  etiqueta,
}: {
  titulo: string;
  descripcion: string;
  acciones?: ReactNode;
  etiqueta?: string;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-[var(--color-borde)] pb-5 md:flex-row md:items-start md:justify-between">
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-[var(--color-tinta)]">{titulo}</h1>
          {etiqueta && <Insignia tono="marino">{etiqueta}</Insignia>}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
          {descripcion}
        </p>
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div>}
    </header>
  );
}

export function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo?: string;
  descripcion?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      {titulo && (
        <div>
          <h2 className="text-base font-semibold text-[var(--color-tinta)]">{titulo}</h2>
          {descripcion && (
            <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">{descripcion}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function RejillaTarjetas({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function TarjetaMetrica({
  etiqueta,
  valor,
  detalle,
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
}) {
  return (
    <div className="tarjeta p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
        {etiqueta}
      </p>
      <p className="cifra mt-1.5 text-2xl font-semibold text-[var(--color-tinta)]">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-[var(--color-tinta-suave)]">{detalle}</p>}
    </div>
  );
}
