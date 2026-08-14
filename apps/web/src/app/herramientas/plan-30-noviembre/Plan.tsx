'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarPlus } from 'lucide-react';
import {
  Boton,
  Campo,
  EstadoVacio,
  Insignia,
  Nota,
  Selector,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import type { Obligacion } from '@leyantilavado/types';
import {
  datos,
  diferenciaDias,
  formatearFechaCorta,
  formatearFechaLarga,
} from '@leyantilavado/rules-engine';
import { useSearchParams } from 'next/navigation';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { SelectorActividad } from '@/components/herramientas/SelectorActividad';
import {
  nombreActividad,
  nombreSubtipo,
  requiereSubtipo,
} from '@/lib/herramientas/actividades';
import { aCSV, construirICS, descargar, escribirEnURL, marcaICS } from '@/lib/herramientas/util';

/**
 * Hito del que cuelga la cuenta regresiva: la entrada en vigor del Acuerdo.
 *
 * Se busca por id y no se escribe la fecha aquí. Si el DOF corrige el
 * transitorio, la herramienta se mueve sola con el motor.
 */
const ID_VIGENCIA = 'vigencia-general';

/**
 * Hitos que NO aplican a toda actividad vulnerable.
 *
 * `HitoCalendario` no tiene un campo que ate un hito a una actividad, así que
 * el único caso que existe hoy —la actualización de proveedores de servicios
 * de activos virtuales— se ata aquí por id. En cuanto el motor exponga ese
 * campo, este mapa se borra y el filtro sale del dato.
 */
const HITOS_ACOTADOS: Record<string, readonly string[]> = {
  'psav-actualizacion': ['activos-virtuales'],
};

/**
 * Lo que hay que tener resuelto ANTES de que corra cualquier plazo, cuando el
 * usuario todavía no está en el padrón. No llevan fecha: la obligación de
 * darse de alta no espera al 30 de noviembre, corre desde que se realiza la
 * actividad. Ponerles una fecha sería inventarla.
 */
const PREVIOS_SIN_ALTA = ['alta-sppld', 'representante-cumplimiento'];

/* ────────────────────────────────────────────────────────────────────────────
 * Fecha de hoy sin romper la hidratación
 *
 * El reloj es una fuente externa, así que se lee con `useSyncExternalStore` y
 * no con `useState` + `useEffect`: ese par dispara la regla
 * `react-hooks/set-state-in-effect`, y `new Date()` durante el render dispara
 * `react-hooks/purity`. En el servidor devuelve `null`, así que el HTML del
 * servidor y el del primer render del cliente coinciden exactamente y la
 * cuenta regresiva aparece al montar.
 *
 * ponytail: el valor se cachea a nivel de módulo y nunca se refresca — la
 * granularidad es de días y una pestaña abierta durante la medianoche muestra
 * el día anterior hasta que se recarga. Si algún día importa, se suscribe un
 * intervalo como en `CuentaRegresivaReglas`.
 * ────────────────────────────────────────────────────────────────────────── */

let hoyEnCache: string | null = null;
const sinSuscripcion = () => () => {};
const leerHoy = (): string => (hoyEnCache ??= new Date().toISOString().slice(0, 10));
const enElServidor = (): null => null;

function useHoy(): string | null {
  return React.useSyncExternalStore(sinSuscripcion, leerHoy, enElServidor);
}

/* ────────────────────────────────────────────────────────────────────────── */

const obligacionesDe = (slugs: readonly string[]): Obligacion[] =>
  slugs
    .map((s) => datos.OBLIGACIONES_POR_SLUG[s])
    .filter((o): o is Obligacion => o !== undefined);

function tonoPorDias(dias: number): 'verde' | 'rojo' | 'ambar' | 'marino' {
  if (dias <= 0) return 'verde';
  if (dias <= 30) return 'rojo';
  if (dias <= 180) return 'ambar';
  return 'marino';
}

export function Plan() {
  const params = useSearchParams();
  const hoy = useHoy();

  const [actividad, setActividad] = React.useState(params.get('actividad') ?? '');
  const [subtipo, setSubtipo] = React.useState(params.get('subtipo') ?? '');
  const [alta, setAlta] = React.useState(params.get('alta') ?? '');
  const [ahora] = React.useState(() => marcaICS(new Date()));

  const vigencia = datos.CALENDARIO.find((h) => h.id === ID_VIGENCIA);

  // El inciso no mueve ninguna fecha del Acuerdo, pero sí decide qué regla de
  // umbral te aplica: se pide para que el resultado impreso diga bajo qué
  // supuesto se armó, no porque el calendario cambie.
  const faltaSubtipo = actividad !== '' && requiereSubtipo(actividad, vigencia?.fecha ?? '') && subtipo === '';
  const listo = actividad !== '' && alta !== '' && !faltaSubtipo;

  const hitos = React.useMemo(
    () =>
      datos.CALENDARIO.filter((h) => {
        const acotado = HITOS_ACOTADOS[h.id];
        return acotado === undefined || acotado.includes(actividad);
      }).sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [actividad],
  );

  const previos = alta === 'no' ? obligacionesDe(PREVIOS_SIN_ALTA) : [];

  const actualizar = (cambio: { actividad?: string; subtipo?: string; alta?: string }) => {
    if (cambio.actividad !== undefined) setActividad(cambio.actividad);
    if (cambio.subtipo !== undefined) setSubtipo(cambio.subtipo);
    if (cambio.alta !== undefined) setAlta(cambio.alta);
    // A la URL sólo va lo que se capturó en este formulario. Nunca hay datos
    // de un cliente que puedan viajar en un enlace compartido.
    escribirEnURL({
      actividad: cambio.actividad ?? actividad,
      subtipo: cambio.subtipo ?? (cambio.actividad !== undefined ? '' : subtipo),
      alta: cambio.alta ?? alta,
    });
  };

  const csv = aCSV(
    ['fecha', 'fecha_fin', 'hito', 'que_tener', 'fundamento', 'fecha_confirmada'],
    [
      ...previos.map((o) => [
        '',
        '',
        o.titulo,
        o.resumen,
        o.procedencia.disposicion,
        'sin fecha: la obligación ya corre',
      ]),
      ...hitos.map((h) => [
        h.fecha,
        h.fechaFin ?? '',
        h.titulo,
        obligacionesDe(h.obligaciones)
          .map((o) => o.titulo)
          .join(' · '),
        h.procedencia.disposicion,
        h.confirmadoOficialmente ? 'publicada' : 'calculada a partir de un plazo en meses',
      ]),
      ...datos.PENDIENTES_SIN_FECHA.map((p) => [
        '',
        '',
        p.titulo,
        p.descripcion,
        p.procedencia.disposicion,
        'sin fecha cierta',
      ]),
    ],
  );

  const descargarICS = () =>
    descargar(
      'plan-30-noviembre.ics',
      construirICS(
        hitos.map((h) => ({
          uid: `plan30-${h.id}`,
          fecha: h.fecha,
          titulo: h.titulo,
          descripcion: `${h.descripcion} — Fundamento: ${h.procedencia.disposicion}.${
            h.confirmadoOficialmente
              ? ''
              : ' Fecha calculada a partir de un plazo en meses: confírmala antes de usarla como fecha límite.'
          }`,
        })),
        ahora,
      ),
      'text/calendar',
    );

  return (
    <div className="flex flex-col gap-8">
      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo className="grid gap-5 md:grid-cols-2">
          <SelectorActividad
            actividad={actividad}
            subtipo={subtipo}
            fecha={vigencia?.fecha ?? ''}
            onActividad={(s) => actualizar({ actividad: s, subtipo: '' })}
            onSubtipo={(s) => actualizar({ subtipo: s })}
            idPrefijo="plan30"
            {...(faltaSubtipo
              ? { errorSubtipo: 'Elige el supuesto para que el plan diga bajo cuál se armó.' }
              : {})}
          />

          <Campo
            id="alta-sppld"
            etiqueta="¿Ya estás dado de alta en el padrón y con acceso al SPPLD?"
            ayuda="Si todavía no, hay cosas que no esperan al calendario del Acuerdo."
            requerido
          >
            <Selector value={alta} onChange={(e) => actualizar({ alta: e.target.value })}>
              <option value="">Elige una respuesta…</option>
              <option value="si">Sí, ya tengo alta y acceso</option>
              <option value="no">Todavía no</option>
            </Selector>
          </Campo>
        </TarjetaCuerpo>
      </Tarjeta>

      {!listo ? (
        <EstadoVacio
          titulo="Elige tu actividad y dinos si ya estás en el padrón"
          descripcion="Con eso se arma la línea de tiempo. La mayoría de los hitos del Acuerdo aplican a toda actividad vulnerable; la actividad sirve para descartar los que no te tocan y para que el documento impreso diga de quién es el plan."
        />
      ) : (
        <section aria-live="polite" className="imprimible flex flex-col gap-6">
          <EncabezadoImpresion titulo="Plan hacia el 30 de noviembre de 2026" />

          <p className="text-[var(--color-tinta-suave)]">
            Plan para <strong>{nombreActividad(actividad)}</strong>
            {subtipo !== '' && <> · {nombreSubtipo(actividad, subtipo)}</>}.{' '}
            {alta === 'no'
              ? 'Todavía sin alta en el padrón.'
              : 'Con alta en el padrón y acceso al SPPLD.'}
          </p>

          {vigencia && <CuentaRegresiva fecha={vigencia.fecha} titulo={vigencia.titulo} hoy={hoy} />}

          <Nota tono="atencion" titulo="Qué se personaliza aquí y qué no">
            <p>
              El Acuerdo 115/2026 no escalona sus plazos por actividad: casi todos los hitos aplican
              igual a las {datos.ACTIVIDADES.length} fracciones del artículo 17. Lo que sí cambia es
              lo que se descarta —los hitos dirigidos a una actividad concreta— y el punto de
              partida, según ya estés o no en el padrón.
            </p>
            {subtipo !== '' && (
              <p>
                El inciso que elegiste tampoco mueve ninguna de estas fechas: mueve tus umbrales de
                identificación y de aviso. Eso se resuelve en la{' '}
                <Link
                  href="/herramientas/calculadora-umbrales"
                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                >
                  calculadora de umbrales
                </Link>
                .
              </p>
            )}
          </Nota>

          {previos.length > 0 && (
            <section aria-labelledby="previos">
              <h2 id="previos" className="text-xl font-semibold text-[var(--color-tinta)]">
                Antes de mirar el calendario
              </h2>
              <p className="mt-1.5 text-sm text-[var(--color-tinta-suave)]">
                Estas obligaciones no tienen fecha en el Acuerdo porque no dependen de él: corren
                desde que realizas la actividad vulnerable. Sin ellas resueltas, el resto del plan no
                tiene dónde apoyarse.
              </p>
              <ol className="mt-4 flex flex-col gap-4">
                {previos.map((o) => (
                  <li key={o.slug}>
                    <TarjetaObligacion obligacion={o} />
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section aria-labelledby="linea-tiempo">
            <h2 id="linea-tiempo" className="text-xl font-semibold text-[var(--color-tinta)]">
              Tu línea de tiempo, hito por hito
            </h2>

            <div className="no-imprimir mt-3">
              <Boton type="button" variante="contorno" tamano="sm" onClick={descargarICS}>
                <CalendarPlus aria-hidden />
                Descargar los hitos en .ics
              </Boton>
            </div>

            <ol className="mt-5 flex flex-col gap-5 border-l-2 border-[var(--color-borde)] pl-5">
              {hitos.map((h) => {
                const dias = hoy === null ? null : diferenciaDias(hoy, h.fecha);
                const obligaciones = obligacionesDe(h.obligaciones);

                return (
                  <li key={h.id} className="relative">
                    <span
                      aria-hidden
                      className="absolute top-6 -left-[1.6rem] size-3 rounded-full border-2 border-[var(--color-superficie)] bg-[var(--color-petroleo)]"
                    />
                    <Tarjeta>
                      <TarjetaCuerpo className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {dias !== null && (
                            <Insignia tono={tonoPorDias(dias)}>
                              {dias <= 0
                                ? 'Ya es exigible'
                                : `Faltan ${dias.toLocaleString('es-MX')} días`}
                            </Insignia>
                          )}
                          <Insignia tono={h.confirmadoOficialmente ? 'petroleo' : 'ambar'}>
                            {h.confirmadoOficialmente
                              ? 'Fecha publicada'
                              : 'Fecha calculada, sin confirmar'}
                          </Insignia>
                        </div>

                        <div>
                          <p className="cifra text-sm text-[var(--color-tinta-tenue)]">
                            {formatearFechaLarga(h.fecha)}
                            {h.fechaFin !== undefined && <> — {formatearFechaLarga(h.fechaFin)}</>}
                          </p>
                          <h3 className="mt-0.5 text-lg font-semibold text-[var(--color-tinta)]">
                            {h.titulo}
                          </h3>
                        </div>

                        <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                          {h.descripcion}
                        </p>

                        {obligaciones.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--color-tinta)]">
                              Qué tienes que tener para esa fecha
                            </h4>
                            <ul className="mt-2 flex flex-col gap-2">
                              {obligaciones.map((o) => (
                                <li key={o.slug}>
                                  <TarjetaObligacion obligacion={o} compacta />
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-sm text-[var(--color-tinta-tenue)]">
                            No tenemos ninguna obligación del catálogo asociada a este hito, así que
                            no listamos entregables: sería inventarlos.
                          </p>
                        )}

                        <p className="border-t border-[var(--color-borde)] pt-3 text-xs text-[var(--color-tinta-tenue)]">
                          Fundamento de la fecha: {h.procedencia.disposicion}.{' '}
                          {h.procedencia.notaEditorial}
                        </p>
                      </TarjetaCuerpo>
                    </Tarjeta>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="sin-fecha">
            <h2 id="sin-fecha" className="text-xl font-semibold text-[var(--color-tinta)]">
              Te toca, pero todavía no hay fecha
            </h2>
            <ol className="mt-4 flex flex-col gap-4">
              {datos.PENDIENTES_SIN_FECHA.map((p) => (
                <li key={p.id}>
                  <Tarjeta className="border-dashed">
                    <TarjetaCuerpo className="flex flex-col gap-2">
                      <Insignia tono="neutro">Sin fecha cierta</Insignia>
                      <h3 className="text-lg font-semibold text-[var(--color-tinta)]">{p.titulo}</h3>
                      <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                        {p.descripcion}
                      </p>
                      <ul className="flex flex-col gap-2">
                        {obligacionesDe(p.obligaciones).map((o) => (
                          <li key={o.slug}>
                            <TarjetaObligacion obligacion={o} compacta />
                          </li>
                        ))}
                      </ul>
                      <p className="border-t border-[var(--color-borde)] pt-3 text-xs text-[var(--color-tinta-tenue)]">
                        Fundamento: {p.procedencia.disposicion}.
                      </p>
                    </TarjetaCuerpo>
                  </Tarjeta>
                </li>
              ))}
            </ol>
          </section>

          <Nota tono="info" titulo="Lo que este plan no dice">
            <p>
              No dice que cumplas. Dice qué tendrías que tener listo y para cuándo, con el fundamento
              a la vista para que lo contrastes. Las fechas se muestran nominales: no las recorremos
              por fines de semana ni por días inhábiles, salvo donde la propia norma habla de día
              hábil, y ahí lo decimos en el hito.
            </p>
          </Nota>

          <AccionesResultado
            nombreArchivo="plan-30-noviembre"
            csv={csv}
            datos={{
              actividad,
              subtipo: subtipo || null,
              altaSPPLD: alta === 'si',
              hitos: hitos.map((h) => ({
                id: h.id,
                fecha: h.fecha,
                fechaFin: h.fechaFin ?? null,
                titulo: h.titulo,
                confirmadoOficialmente: h.confirmadoOficialmente,
                fundamento: h.procedencia.disposicion,
                obligaciones: h.obligaciones,
              })),
            }}
            conEnlace
            claveGuardado="plan-30-noviembre"
          />
        </section>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function CuentaRegresiva({
  fecha,
  titulo,
  hoy,
}: {
  fecha: string;
  titulo: string;
  hoy: string | null;
}) {
  const dias = hoy === null ? null : diferenciaDias(hoy, fecha);

  return (
    <Tarjeta elevada>
      <TarjetaCuerpo className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <div>
          {/* Antes de montar no hay reloj: se muestra la fecha, que es el dato
              duro, y la cuenta aparece en cuanto el navegador la calcula. */}
          {dias === null ? (
            <p className="text-2xl font-semibold text-[var(--color-tinta)]">
              {formatearFechaCorta(fecha)}
            </p>
          ) : dias > 0 ? (
            <p className="text-[var(--color-tinta)]">
              <span className="cifra text-4xl leading-none font-semibold tabular-nums text-[var(--color-petroleo-hondo)]">
                {dias.toLocaleString('es-MX')}
              </span>{' '}
              <span className="text-lg">{dias === 1 ? 'día' : 'días'}</span>
            </p>
          ) : (
            <p className="text-2xl font-semibold text-[var(--color-verde)]">Ya entró en vigor</p>
          )}
        </div>
        <p className="text-sm text-[var(--color-tinta-suave)]">
          {dias !== null && dias > 0 ? 'para el ' : ''}
          {formatearFechaLarga(fecha)} — {titulo}.
        </p>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}

/**
 * Una obligación con sus pasos y su fundamento.
 *
 * Los pasos van dentro de un `<details>` nativo: con nueve hitos y hasta seis
 * obligaciones cada uno, desplegarlo todo convierte el plan en un muro. El
 * elemento nativo ya es accesible y se imprime abierto cuando el usuario lo
 * dejó abierto, sin traer un acordeón de librería.
 */
function TarjetaObligacion({
  obligacion,
  compacta,
}: {
  obligacion: Obligacion;
  compacta?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--color-borde)] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/obligaciones/${obligacion.slug}`}
          className={`font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2 ${
            compacta ? 'text-sm' : ''
          }`}
        >
          {obligacion.titulo}
        </Link>
        {obligacion.recurrencia !== undefined && (
          <Insignia tono="neutro">{obligacion.recurrencia}</Insignia>
        )}
      </div>

      <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
        {obligacion.resumen}
      </p>

      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-tinta)]">
          Ver los {obligacion.pasos.length} pasos y la evidencia
        </summary>
        <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-sm text-[var(--color-tinta-suave)]">
          {obligacion.pasos.map((p) => (
            <li key={p.id}>
              {p.texto}
              {p.evidencia !== undefined && (
                <span className="text-[var(--color-tinta-tenue)]"> — Evidencia: {p.evidencia}.</span>
              )}
            </li>
          ))}
        </ol>
      </details>

      <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">
        Fundamento: {obligacion.procedencia.disposicion}.
      </p>
    </div>
  );
}
