import Link from 'next/link';
import { CalendarClock, CircleAlert, ListChecks } from 'lucide-react';
import type { Obligacion } from '@leyantilavado/types';
import { datos, formatearFechaLarga, proximasFechasLimite } from '@leyantilavado/rules-engine';
import {
  Boton,
  Insignia,
  Nota,
  SelloProcedencia,
  Tarjeta,
  TarjetaCuerpo,
  TarjetaTitulo,
} from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { ETIQUETA_CATEGORIA_OBLIGACION, MAPA_FUENTES } from '@/components/inicio/comun';
import { requerirContexto } from '@/lib/auth/sesion';
import { fechaDeHoy } from '@/lib/app/fecha';

const ETIQUETA_RECURRENCIA: Record<NonNullable<Obligacion['recurrencia']>, string> = {
  unica: 'Una sola vez',
  mensual: 'Cada mes',
  semestral: 'Cada seis meses',
  anual: 'Cada año',
};

const TONO_PLAZO = {
  vencido: 'rojo',
  hoy: 'rojo',
  urgente: 'ambar',
  proximo: 'ambar',
  holgado: 'neutro',
} as const;

export default async function PaginaCalendario() {
  await requerirContexto('/panel/calendario');
  const hoy = await fechaDeHoy();

  const proximas = proximasFechasLimite(hoy, 6);
  const hitos = [...datos.CALENDARIO].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const obligaciones = datos.OBLIGACIONES;

  return (
    <>
      <EncabezadoSeccion
        titulo="Calendario de obligaciones"
        descripcion={`Fechas del corpus legal cargado y plazos de aviso calculados al ${formatearFechaLarga(hoy)}. Ningún dato de esta pantalla se escribe a mano: todo sale del motor jurídico.`}
      />

      <Nota tono="info" titulo="Fechas nominales, sin recorrer por días inhábiles">
        <p>
          Las fechas se muestran tal como salen de la norma. No se recorren por fines de semana ni
          por días inhábiles, porque hacerlo sin una regla oficial registrada sería inventar
          derecho. Cuando un plazo cae en fin de semana, el motor lo advierte y te toca confirmarlo
          contra el calendario oficial.
        </p>
      </Nota>

      <Seccion
        titulo="Próximos plazos de aviso"
        descripcion="Calculados por el motor a partir de la fecha de la operación. La explicación de cada plazo viene del motor, no de esta pantalla."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {proximas.map((plazo) => (
            <Tarjeta key={plazo.fechaLimite}>
              <TarjetaCuerpo className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <TarjetaTitulo className="text-base">
                    <CalendarClock aria-hidden="true" className="mr-2 inline size-4 align-[-2px]" />
                    Operaciones de {plazo.periodo}
                  </TarjetaTitulo>
                  <Insignia tono={TONO_PLAZO[plazo.estado]}>
                    {plazo.diasRestantes < 0
                      ? `Vencido hace ${Math.abs(plazo.diasRestantes)} días`
                      : plazo.diasRestantes === 0
                        ? 'Vence hoy'
                        : `Faltan ${plazo.diasRestantes} días`}
                  </Insignia>
                </div>
                <p className="cifra text-sm font-medium text-[var(--color-tinta)]">
                  {formatearFechaLarga(plazo.fechaLimite)}
                </p>
                <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {plazo.explicacion}
                </p>
                {plazo.advertencias.map((a) => (
                  <p
                    key={a.clave}
                    className="rounded-[var(--radius-control)] bg-[var(--color-ambar-tenue)] px-3 py-2 text-xs text-[var(--color-tinta)]"
                  >
                    <CircleAlert
                      aria-hidden="true"
                      className="mr-1.5 inline size-3.5 align-[-2px] text-[var(--color-ambar)]"
                    />
                    {a.mensaje}
                  </p>
                ))}
              </TarjetaCuerpo>
            </Tarjeta>
          ))}
        </div>
        <p className="text-sm text-[var(--color-tinta-suave)]">
          Preparar y exportar el contenido de cada aviso se hace en el{' '}
          <Link
            href="/panel/avisos"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            registro de avisos
          </Link>
          .
        </p>
      </Seccion>

      <Seccion
        titulo="Hitos del calendario normativo"
        descripcion="Fechas de implementación tomadas de los artículos transitorios. Cada una lleva su sello de procedencia."
      >
        <ol className="flex flex-col gap-4">
          {hitos.map((hito) => (
            <li key={hito.id} className="tarjeta p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-[var(--color-tinta)]">{hito.titulo}</h3>
                <p className="cifra text-sm text-[var(--color-tinta-suave)]">
                  {formatearFechaLarga(hito.fecha)}
                  {hito.fechaFin ? ` — ${formatearFechaLarga(hito.fechaFin)}` : ''}
                </p>
              </div>

              {!hito.confirmadoOficialmente && (
                <p className="mt-2">
                  <Insignia tono="ambar">
                    <CircleAlert aria-hidden="true" className="size-3.5" />
                    Fecha no confirmada oficialmente
                  </Insignia>
                </p>
              )}

              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {hito.descripcion}
              </p>

              {hito.obligaciones.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {hito.obligaciones.map((slug) => (
                    <li key={slug}>
                      <Insignia tono="marino">
                        {datos.OBLIGACIONES_POR_SLUG[slug]?.titulo ?? slug}
                      </Insignia>
                    </li>
                  ))}
                </ul>
              )}

              <SelloProcedencia
                className="mt-4"
                procedencia={hito.procedencia}
                fuentes={MAPA_FUENTES}
              />
            </li>
          ))}
        </ol>
      </Seccion>

      {datos.PENDIENTES_SIN_FECHA.length > 0 && (
        <Seccion
          titulo="Obligaciones previstas sin fecha cierta"
          descripcion="Existen en la norma, pero su exigibilidad depende de un acto que todavía no se publica. No les inventamos una fecha."
        >
          <ul className="flex flex-col gap-4">
            {datos.PENDIENTES_SIN_FECHA.map((p) => (
              <li key={p.id} className="tarjeta p-5">
                <h3 className="text-base font-semibold text-[var(--color-tinta)]">{p.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {p.descripcion}
                </p>
                <SelloProcedencia
                  className="mt-4"
                  procedencia={p.procedencia}
                  fuentes={MAPA_FUENTES}
                />
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      <Seccion
        titulo="Obligaciones del corpus legal cargado"
        descripcion="Cada una con su periodicidad y sus pasos. La periodicidad sale del motor; esta pantalla no la escribe."
      >
        <ul className="flex flex-col gap-4">
          {obligaciones.map((o) => (
            <li key={o.slug} className="tarjeta p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-[var(--color-tinta)]">{o.titulo}</h3>
                <Insignia tono="neutro">{ETIQUETA_CATEGORIA_OBLIGACION[o.categoria]}</Insignia>
                {o.recurrencia && (
                  <Insignia tono="petroleo">{ETIQUETA_RECURRENCIA[o.recurrencia]}</Insignia>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {o.resumen}
              </p>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-[var(--color-petroleo-hondo)]">
                  <ListChecks aria-hidden="true" className="mr-1.5 inline size-4 align-[-3px]" />
                  Ver los {o.pasos.length} pasos y la evidencia esperada
                </summary>
                <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-sm text-[var(--color-tinta-suave)]">
                  {o.pasos.map((paso) => (
                    <li key={paso.id}>
                      {paso.texto}
                      {paso.evidencia && (
                        <span className="ml-1 text-xs text-[var(--color-tinta-tenue)]">
                          (evidencia: {paso.evidencia})
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </details>
              <SelloProcedencia
                className="mt-4"
                procedencia={o.procedencia}
                fuentes={MAPA_FUENTES}
                compacto
              />
            </li>
          ))}
        </ul>
      </Seccion>

      <Nota tono="atencion" titulo="Este calendario no dice que estés al corriente">
        <p>
          Muestra las fechas del corpus legal cargado, no el estado de tu organización frente a
          ellas. Cruzar cada hito con lo que tú hiciste es trabajo de tu responsable de
          cumplimiento.
        </p>
        <p className="mt-3">
          <Boton comoHijo variante="contorno" tamano="sm">
            <Link href="/panel/manual">Ver las versiones del manual</Link>
          </Boton>
        </p>
      </Nota>
    </>
  );
}
