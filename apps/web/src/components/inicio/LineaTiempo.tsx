import Link from 'next/link';
import { CircleHelp } from 'lucide-react';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Insignia } from '@leyantilavado/ui';
import { Seccion } from './comun';

/**
 * Portada — bloque 4. Línea de tiempo 2026-2029.
 *
 * Los hitos con `confirmadoOficialmente: false` se marcan como fecha estimada
 * y se dibujan con borde punteado. El texto del DOF fija esos plazos en meses,
 * no como fecha de calendario: presentarlos como fecha dura sería inventarlos.
 */

const HITOS = [...datos.CALENDARIO].sort((a, b) => a.fecha.localeCompare(b.fecha));

export function LineaTiempo() {
  return (
    <Seccion
      id="calendario"
      etiqueta="Calendario de implementación"
      titulo="De 2026 a 2029, fecha por fecha"
      descripcion="El Acuerdo 115/2026 no entra de golpe: escalona la exigibilidad en varios tramos. Éste es el orden en que te van a alcanzar."
      accion={
        <Link
          href="/calendario-cumplimiento"
          className="text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
        >
          Calendario detallado
        </Link>
      }
      fondo="hondo"
    >
      <ol className="relative flex flex-col gap-6 border-l-2 border-[var(--color-borde-fuerte)] pl-6 md:pl-8">
        {HITOS.map((hito) => (
          <li key={hito.id} className="relative">
            <span
              aria-hidden="true"
              className={
                hito.confirmadoOficialmente
                  ? 'absolute -left-[1.9rem] top-5 size-3 rounded-full bg-[var(--color-petroleo)] ring-4 ring-[var(--color-marfil-hondo)] md:-left-[2.4rem]'
                  : 'absolute -left-[1.9rem] top-5 size-3 rounded-full border-2 border-[var(--color-ambar)] bg-[var(--color-marfil-hondo)] ring-4 ring-[var(--color-marfil-hondo)] md:-left-[2.4rem]'
              }
            />

            <article
              className={
                hito.confirmadoOficialmente
                  ? 'tarjeta p-5 md:p-6'
                  : 'rounded-[var(--radius-card)] border border-dashed border-[var(--color-ambar)] bg-[var(--color-superficie)] p-5 md:p-6'
              }
            >
              <div className="flex flex-wrap items-center gap-3">
                <time
                  dateTime={hito.fecha}
                  className="cifra text-sm font-semibold text-[var(--color-tinta)]"
                >
                  {formatearFechaLarga(hito.fecha)}
                  {hito.fechaFin ? ` — ${formatearFechaLarga(hito.fechaFin)}` : ''}
                </time>
                {hito.confirmadoOficialmente ? (
                  <Insignia tono="verde">Fecha en el texto oficial</Insignia>
                ) : (
                  <Insignia tono="ambar">Fecha estimada</Insignia>
                )}
              </div>

              <h3 className="mt-2 text-lg font-semibold text-[var(--color-tinta)]">
                {hito.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {hito.descripcion}
              </p>

              {hito.obligaciones.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {hito.obligaciones.map((slug) => {
                    const o = datos.OBLIGACIONES_POR_SLUG[slug];
                    return (
                      <li key={slug}>
                        <Insignia tono="neutro">{o ? o.titulo : slug}</Insignia>
                      </li>
                    );
                  })}
                </ul>
              )}

              <p className="mt-4 text-xs text-[var(--color-tinta-tenue)]">
                {hito.procedencia.disposicion} · Última revisión:{' '}
                {formatearFechaLarga(hito.procedencia.ultimaRevision)}
              </p>
            </article>
          </li>
        ))}

        {/* Obligaciones que existen pero todavía no tienen fecha cierta.
            Se muestran con estado vacío honesto en vez de inventarles una. */}
        {datos.PENDIENTES_SIN_FECHA.map((p) => (
          <li key={p.id} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[1.9rem] top-5 size-3 rounded-full border-2 border-[var(--color-borde-fuerte)] bg-[var(--color-marfil-hondo)] ring-4 ring-[var(--color-marfil-hondo)] md:-left-[2.4rem]"
            />
            <article className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-borde-fuerte)] p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-tinta-suave)]">
                  <CircleHelp className="size-4" aria-hidden="true" />
                  Sin fecha cierta
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-[var(--color-tinta)]">{p.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {p.descripcion}
              </p>
              <p className="mt-4 text-xs text-[var(--color-tinta-tenue)]">
                {p.procedencia.disposicion} · Última revisión:{' '}
                {formatearFechaLarga(p.ultimaRevision)}
              </p>
            </article>
          </li>
        ))}
      </ol>
    </Seccion>
  );
}
