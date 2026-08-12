import * as React from 'react';
import type { NivelVerificacion, Procedencia } from '@leyantilavado/types';
import { cn } from './cn';
import { Insignia } from './primitivos';

const ETIQUETA: Record<NivelVerificacion, string> = {
  oficial_verificado: 'Verificado en fuente oficial',
  oficial_no_accesible: 'Fuente oficial no accesible',
  fuente_secundaria: 'Fuente secundaria',
  no_verificado: 'Requiere revisión editorial',
};

const TONO: Record<NivelVerificacion, 'verde' | 'ambar' | 'rojo' | 'neutro'> = {
  oficial_verificado: 'verde',
  oficial_no_accesible: 'ambar',
  fuente_secundaria: 'ambar',
  no_verificado: 'rojo',
};

const EXPLICACION: Record<NivelVerificacion, string> = {
  oficial_verificado:
    'Contrastamos este dato directamente contra el documento publicado por la autoridad.',
  oficial_no_accesible:
    'La fuente oficial no estaba disponible al momento de la revisión. El dato proviene de una reproducción confiable.',
  fuente_secundaria:
    'El dato proviene de una fuente confiable distinta al documento oficial. Aún no se contrasta contra el original.',
  no_verificado:
    'No pudimos confirmar este dato en una fuente oficial. No lo uses para tomar decisiones sin revisión profesional.',
};

/**
 * Sello de procedencia.
 *
 * Va debajo de TODA conclusión legal del sitio. Muestra la disposición, la
 * fecha de última revisión y el nivel de verificación.
 *
 * Es deliberadamente imposible renderizar una conclusión sin decir de dónde
 * salió: si el dato no está verificado, este componente lo dice en rojo en
 * lugar de esconderlo.
 */
export function SelloProcedencia({
  procedencia,
  fuentes,
  compacto,
  className,
}: {
  procedencia: Procedencia;
  /** Mapa id → { nombre, url } para poder enlazar la fuente. */
  fuentes?: Record<string, { nombre: string; url: string }>;
  compacto?: boolean;
  className?: string;
}) {
  const nivel = procedencia.verificacion;

  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-4 text-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Insignia tono={TONO[nivel]}>{ETIQUETA[nivel]}</Insignia>
        <span className="font-medium text-[var(--color-tinta)]">{procedencia.disposicion}</span>
      </div>

      {!compacto && (
        <p className="mt-2 text-[var(--color-tinta-suave)]">{EXPLICACION[nivel]}</p>
      )}

      {procedencia.notaEditorial && !compacto && (
        <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">{procedencia.notaEditorial}</p>
      )}

      {fuentes && procedencia.fuentes.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {procedencia.fuentes.map((id) => {
            const f = fuentes[id];
            if (!f) return null;
            return (
              <li key={id}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                >
                  {f.nombre}
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-xs text-[var(--color-tinta-tenue)]">
        Última revisión: {procedencia.ultimaRevision}
        {procedencia.revisadoPor ? ` · Revisó: ${procedencia.revisadoPor}` : ''}
      </p>
    </div>
  );
}
