import Link from 'next/link';
import { EstadoVacio, Nota } from '@leyantilavado/ui';
import { escribirFiltros, type FiltrosDirectorio, type ResultadoBusqueda } from '@/lib/directorio/filtros';
import { TarjetaProveedor } from './TarjetaProveedor';

/* ────────────────────────────────────────────────────────────────────────────
 * Lista de resultados.
 *
 * La separación editorial es estructural, no un detalle de estilo: los
 * perfiles pagados van en su propia sección, con encabezado propio y etiqueta
 * en cada tarjeta. Nunca se mezclan con el orden natural.
 * ────────────────────────────────────────────────────────────────────────── */

export function ResultadosDirectorio({
  resultado,
  filtros,
  rutaBase,
}: {
  resultado: ResultadoBusqueda;
  filtros: FiltrosDirectorio;
  rutaBase: string;
}) {
  const { patrocinados, resultados, total, pagina, totalPaginas } = resultado;

  // «Sin resultados» significa dos cosas distintas y el texto tiene que
  // distinguirlas: filtraste demasiado, o la categoría está vacía. Ofrecer
  // «quitar filtros» cuando no hay ninguno puesto es una salida a ninguna parte.
  const hayFiltros = escribirFiltros({ ...filtros, pagina: 1 }) !== '';

  return (
    <div className="flex flex-col gap-8">
      {patrocinados.length > 0 && (
        <section aria-labelledby="titulo-patrocinados">
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2
              id="titulo-patrocinados"
              className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ambar)]"
            >
              Publicidad
            </h2>
            <p className="text-sm text-[var(--color-tinta-tenue)]">
              Estos proveedores pagan por aparecer en este bloque. Su posición no depende de la
              verificación ni de la calidad de su trabajo.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {patrocinados.map((p) => (
              <TarjetaProveedor key={p.id} perfil={p} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="titulo-resultados">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="titulo-resultados" className="text-lg font-semibold text-[var(--color-tinta)]">
            {total === 0
              ? 'Sin resultados'
              : `${total} ${total === 1 ? 'proveedor' : 'proveedores'}`}
          </h2>
          {totalPaginas > 1 && (
            <p className="text-sm text-[var(--color-tinta-tenue)]">
              Página {pagina} de {totalPaginas}
            </p>
          )}
        </div>

        {total === 0 ? (
          <EstadoVacio
            titulo={
              hayFiltros ? 'Ningún perfil coincide con esos filtros' : 'Todavía no hay perfiles aquí'
            }
            descripcion={
              hayFiltros
                ? 'Prueba a quitar filtros, ampliar la cobertura a todo el país o buscar por una categoría cercana.'
                : 'El directorio sólo publica perfiles reales, y cada alta se revisa a mano antes de aparecer. Todavía no hay ninguno aprobado.'
            }
            accion={
              hayFiltros ? (
              <Link
                href={rutaBase}
                className="text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
              >
                Quitar todos los filtros
              </Link>
              ) : (
                <Link
                  href="/directorio/alta"
                  className="text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                >
                  Dar de alta un perfil
                </Link>
              )
            }
          />
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              {resultados.map((p) => (
                <TarjetaProveedor key={p.id} perfil={p} />
              ))}
            </div>

            {totalPaginas > 1 && (
              <nav aria-label="Paginación" className="mt-6 flex items-center justify-between gap-3">
                {pagina > 1 ? (
                  <Link
                    href={`${rutaBase}${escribirFiltros({ ...filtros, pagina: pagina - 1 })}`}
                    className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--color-borde-fuerte)] px-4 text-sm font-medium"
                    rel="prev"
                  >
                    Anterior
                  </Link>
                ) : (
                  <span />
                )}
                {pagina < totalPaginas ? (
                  <Link
                    href={`${rutaBase}${escribirFiltros({ ...filtros, pagina: pagina + 1 })}`}
                    className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--color-borde-fuerte)] px-4 text-sm font-medium"
                    rel="next"
                  >
                    Siguiente
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        )}
      </section>

      <Nota tono="info" titulo="Cómo se ordenan estos resultados">
        <p>
          Primero aparecen los perfiles con más comprobaciones hechas por nosotros, después los de
          más experiencia declarada y al final por orden alfabético. El plan contratado no mejora
          la posición de nadie.
        </p>
      </Nota>
    </div>
  );
}
