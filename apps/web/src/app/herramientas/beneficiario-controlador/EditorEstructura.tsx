'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Boton,
  Campo,
  Entrada,
  EstadoVacio,
  Insignia,
  Nota,
  Selector,
  TablaEnvoltura,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import { datos } from '@leyantilavado/rules-engine';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import {
  analizarEstructura,
  type Entidad,
  type Participacion,
  type TipoEntidad,
} from '@/lib/herramientas/beneficiario';
import { aCSV, formatearPorcentaje, nuevoId } from '@/lib/herramientas/util';

const RAIZ = 'raiz';

const ETIQUETA_TIPO: Record<TipoEntidad, string> = {
  persona_fisica: 'Persona física',
  persona_moral: 'Persona moral',
  fideicomiso: 'Fideicomiso u otra figura',
};

const ENTIDADES_INICIALES: Entidad[] = [
  { id: RAIZ, etiqueta: 'Cliente analizado', tipo: 'persona_moral' },
];

export function EditorEstructura() {
  const [entidades, setEntidades] = React.useState<Entidad[]>(ENTIDADES_INICIALES);
  const [participaciones, setParticipaciones] = React.useState<Participacion[]>([]);
  const [umbral, setUmbral] = React.useState('');

  const umbralNumero = Number(umbral);
  const umbralValido = umbral !== '' && Number.isFinite(umbralNumero) && umbralNumero > 0;

  const analisis = React.useMemo(
    () => analizarEstructura(entidades, participaciones, RAIZ),
    [entidades, participaciones],
  );

  const agregarEntidad = (tipo: TipoEntidad) =>
    setEntidades((e) => [
      ...e,
      {
        id: nuevoId('ent'),
        etiqueta: tipo === 'persona_fisica' ? `Persona ${e.length}` : `Sociedad ${e.length}`,
        tipo,
      },
    ]);

  const eliminarEntidad = (id: string) => {
    if (id === RAIZ) return;
    setEntidades((e) => e.filter((x) => x.id !== id));
    setParticipaciones((p) =>
      p.filter((x) => x.propietarioId !== id && x.participadaId !== id),
    );
  };

  const agregarParticipacion = () =>
    setParticipaciones((p) => [
      ...p,
      {
        id: nuevoId('part'),
        propietarioId: entidades[1]?.id ?? '',
        participadaId: RAIZ,
        porcentaje: 0,
        porOtrosMedios: false,
      },
    ]);

  const actualizarParticipacion = (id: string, cambios: Partial<Participacion>) =>
    setParticipaciones((p) => p.map((x) => (x.id === id ? { ...x, ...cambios } : x)));

  const csv = aCSV(
    ['beneficiario', 'tipo', 'porcentaje_efectivo', 'control_por_otros_medios', 'cadenas'],
    [...analisis.personasFisicas, ...analisis.intermedias].map((b) => [
      b.etiqueta,
      ETIQUETA_TIPO[b.tipo],
      b.porcentajeEfectivo.toFixed(4),
      b.controlPorOtrosMedios ? 'sí' : 'no',
      b.cadenas
        .map((c) =>
          c.ruta
            .map((id) => entidades.find((e) => e.id === id)?.etiqueta ?? id)
            .join(' → '),
        )
        .join(' | '),
    ]),
  );

  const supera = (pct: number) => umbralValido && pct >= umbralNumero;

  return (
    <div className="flex flex-col gap-8">
      <Nota tono="atencion" titulo="Son dos regímenes paralelos, no uno">
        <p>
          Toda <strong>sociedad mercantil y todo fideicomiso</strong> debe obtener, conservar y
          mantener actualizada la información de su beneficiario controlador por mandato del{' '}
          <strong>Código Fiscal de la Federación</strong>, aunque no realice ninguna actividad
          vulnerable ni tenga nada que ver con la Ley Antilavado. Y quien sí realiza una actividad
          vulnerable debe además identificar al beneficiario controlador{' '}
          <strong>de sus clientes</strong>. Son obligaciones distintas, con sanciones distintas, y
          se cumplen por separado.
        </p>
      </Nota>

      <section aria-labelledby="multas-cff">
        <h2 id="multas-cff" className="text-lg font-semibold text-[var(--color-tinta)]">
          Sanciones del régimen fiscal
        </h2>
        <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
          Estas multas vienen en pesos, no en UMA, y se aplican <strong>por cada</strong>{' '}
          beneficiario controlador respecto del cual se incumple.
        </p>
        <TablaEnvoltura className="mt-3">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <caption className="sr-only">
              Multas del Código Fiscal de la Federación en materia de beneficiario controlador
            </caption>
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="p-3 text-left font-semibold">
                  Supuesto
                </th>
                <th scope="col" className="p-3 text-left font-semibold">
                  Multa
                </th>
              </tr>
            </thead>
            <tbody>
              {datos.SANCIONES_CFF_BENEFICIARIO_CONTROLADOR.map((s) => (
                <tr key={s.id} className="border-t border-[var(--color-borde)] align-top">
                  <th scope="row" className="p-3 text-left font-normal">
                    {s.supuesto}
                    <span className="mt-1 block text-xs text-[var(--color-tinta-tenue)]">
                      {s.articulo}
                    </span>
                  </th>
                  <td className="cifra p-3 whitespace-nowrap">
                    ${s.minPesos.toLocaleString('es-MX')} – ${s.maxPesos.toLocaleString('es-MX')}
                    <span className="mt-1 block text-xs text-[var(--color-tinta-tenue)]">
                      por cada {s.porCada}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>
      </section>

      {/* ── Editor ─────────────────────────────────────────────────────── */}

      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-tinta)]">
              Entidades de la estructura
            </h2>
            <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
              Usa etiquetas genéricas —“Socio A”, “Holding 1”— en vez de nombres reales. Nada sale
              de tu navegador, pero un expediente impreso sí puede acabar en el escritorio
              equivocado.
            </p>

            <ul className="mt-4 flex flex-col gap-3">
              {entidades.map((ent) => (
                <li key={ent.id} className="flex flex-wrap items-end gap-3">
                  <Campo
                    id={`ent-nombre-${ent.id}`}
                    etiqueta={ent.id === RAIZ ? 'Entidad analizada' : 'Etiqueta'}
                    className="min-w-56 flex-1"
                  >
                    <Entrada
                      value={ent.etiqueta}
                      onChange={(e) =>
                        setEntidades((lista) =>
                          lista.map((x) =>
                            x.id === ent.id ? { ...x, etiqueta: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </Campo>
                  <Campo id={`ent-tipo-${ent.id}`} etiqueta="Tipo" className="min-w-52">
                    <Selector
                      value={ent.tipo}
                      onChange={(e) =>
                        setEntidades((lista) =>
                          lista.map((x) =>
                            x.id === ent.id ? { ...x, tipo: e.target.value as TipoEntidad } : x,
                          ),
                        )
                      }
                    >
                      {(Object.keys(ETIQUETA_TIPO) as TipoEntidad[]).map((t) => (
                        <option key={t} value={t}>
                          {ETIQUETA_TIPO[t]}
                        </option>
                      ))}
                    </Selector>
                  </Campo>
                  <Boton
                    type="button"
                    variante="fantasma"
                    onClick={() => eliminarEntidad(ent.id)}
                    disabled={ent.id === RAIZ}
                    aria-label={`Eliminar ${ent.etiqueta}`}
                  >
                    <Trash2 aria-hidden />
                  </Boton>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap gap-2">
              <Boton
                type="button"
                variante="contorno"
                tamano="sm"
                onClick={() => agregarEntidad('persona_fisica')}
              >
                <Plus aria-hidden />
                Agregar persona física
              </Boton>
              <Boton
                type="button"
                variante="contorno"
                tamano="sm"
                onClick={() => agregarEntidad('persona_moral')}
              >
                <Plus aria-hidden />
                Agregar sociedad
              </Boton>
              <Boton
                type="button"
                variante="contorno"
                tamano="sm"
                onClick={() => agregarEntidad('fideicomiso')}
              >
                <Plus aria-hidden />
                Agregar fideicomiso
              </Boton>
            </div>
          </div>

          <div className="border-t border-[var(--color-borde)] pt-6">
            <h2 className="text-lg font-semibold text-[var(--color-tinta)]">
              Relaciones de propiedad
            </h2>
            <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
              Quién posee qué, y en qué porcentaje. Marca la casilla cuando el control venga de algo
              distinto a las acciones: un pacto de socios, un voto de calidad, la facultad de
              nombrar al administrador.
            </p>

            {participaciones.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--color-tinta-tenue)]">
                Todavía no hay relaciones capturadas.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {participaciones.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-end gap-3 rounded-[var(--radius-control)] border border-[var(--color-borde)] p-3"
                  >
                    <Campo
                      id={`prop-${p.id}`}
                      etiqueta="Propietario"
                      className="min-w-48 flex-1"
                    >
                      <Selector
                        value={p.propietarioId}
                        onChange={(e) =>
                          actualizarParticipacion(p.id, { propietarioId: e.target.value })
                        }
                      >
                        <option value="">Elige…</option>
                        {entidades
                          .filter((e) => e.id !== p.participadaId)
                          .map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.etiqueta}
                            </option>
                          ))}
                      </Selector>
                    </Campo>

                    <Campo id={`part-${p.id}`} etiqueta="Participa en" className="min-w-48 flex-1">
                      <Selector
                        value={p.participadaId}
                        onChange={(e) =>
                          actualizarParticipacion(p.id, { participadaId: e.target.value })
                        }
                      >
                        {entidades
                          .filter((e) => e.tipo !== 'persona_fisica' && e.id !== p.propietarioId)
                          .map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.etiqueta}
                            </option>
                          ))}
                      </Selector>
                    </Campo>

                    <Campo id={`pct-${p.id}`} etiqueta="Porcentaje" className="w-32">
                      <Entrada
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        className="cifra"
                        value={String(p.porcentaje)}
                        onChange={(e) =>
                          actualizarParticipacion(p.id, {
                            porcentaje: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </Campo>

                    <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm">
                      <input
                        type="checkbox"
                        className="size-5 cursor-pointer"
                        checked={p.porOtrosMedios}
                        onChange={(e) =>
                          actualizarParticipacion(p.id, { porOtrosMedios: e.target.checked })
                        }
                      />
                      <span className="text-[var(--color-tinta-suave)]">Control por otros medios</span>
                    </label>

                    <Boton
                      type="button"
                      variante="fantasma"
                      onClick={() =>
                        setParticipaciones((lista) => lista.filter((x) => x.id !== p.id))
                      }
                      aria-label="Eliminar esta relación"
                    >
                      <Trash2 aria-hidden />
                    </Boton>
                  </li>
                ))}
              </ul>
            )}

            <Boton
              type="button"
              variante="contorno"
              tamano="sm"
              className="mt-3"
              disabled={entidades.length < 2}
              onClick={agregarParticipacion}
            >
              <Plus aria-hidden />
              Agregar relación
            </Boton>
          </div>

          <div className="border-t border-[var(--color-borde)] pt-6">
            <Campo
              id="umbral"
              etiqueta="Porcentaje a partir del cual consideras que hay control"
              ayuda="Captúralo tú, con base en la disposición aplicable a tu caso. No lo prellenamos: ver la nota de abajo."
              className="max-w-sm"
            >
              <Entrada
                type="number"
                min={0}
                max={100}
                step="0.01"
                className="cifra"
                placeholder="Ej. 25"
                value={umbral}
                onChange={(e) => setUmbral(e.target.value)}
              />
            </Campo>

            <Nota tono="atencion" titulo="Requiere revisión editorial" className="mt-3">
              <p>
                El porcentaje que activa la calidad de beneficiario controlador{' '}
                <strong>no está registrado en nuestro corpus legal verificado</strong>, así que no
                lo prellenamos. Prefiero que lo captures tú, con la disposición que aplique a tu
                caso a la vista, antes de que la herramienta te dé un número que no podemos
                respaldar con una fuente citada. El cálculo de la cadena de propiedad sí es nuestro
                y funciona sin ese dato: te muestra el porcentaje efectivo de cada persona y tú
                aplicas el corte.
              </p>
            </Nota>
          </div>
        </TarjetaCuerpo>
      </Tarjeta>

      {/* ── Resultado ──────────────────────────────────────────────────── */}

      {participaciones.length === 0 ? (
        <EstadoVacio
          titulo="Sin relaciones capturadas"
          descripcion="Agrega al menos una persona o sociedad y una relación de propiedad hacia la entidad analizada para ver la cadena de control."
        />
      ) : (
        <section aria-live="polite" className="imprimible flex flex-col gap-6">
          <EncabezadoImpresion titulo="Análisis de beneficiario controlador" />

          <div>
            <h2 className="text-xl font-semibold text-[var(--color-tinta)]">
              Personas físicas al final de la cadena
            </h2>
            {analisis.personasFisicas.length === 0 ? (
              <p className="mt-2 text-[var(--color-tinta-suave)]">
                Ninguna cadena llega todavía a una persona física.
              </p>
            ) : (
              <TablaEnvoltura className="mt-3">
                <table className="w-full min-w-[40rem] border-collapse text-sm">
                  <caption className="sr-only">
                    Personas físicas con su participación efectiva y las cadenas por las que la
                    obtienen
                  </caption>
                  <thead className="bg-[var(--color-marfil-hondo)]">
                    <tr>
                      <th scope="col" className="p-3 text-left font-semibold">
                        Persona
                      </th>
                      <th scope="col" className="p-3 text-left font-semibold">
                        Participación efectiva
                      </th>
                      <th scope="col" className="p-3 text-left font-semibold">
                        Cómo llega
                      </th>
                      <th scope="col" className="p-3 text-left font-semibold">
                        Señal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analisis.personasFisicas.map((b) => (
                      <tr
                        key={b.entidadId}
                        className={
                          supera(b.porcentajeEfectivo) || b.controlPorOtrosMedios
                            ? 'border-t-2 border-[var(--color-ambar)] bg-[var(--color-ambar-tenue)] align-top'
                            : 'border-t border-[var(--color-borde)] align-top'
                        }
                      >
                        <th scope="row" className="p-3 text-left font-medium">
                          {b.etiqueta}
                        </th>
                        <td className="cifra p-3 font-semibold whitespace-nowrap">
                          {formatearPorcentaje(b.porcentajeEfectivo)}
                        </td>
                        <td className="p-3 text-[var(--color-tinta-suave)]">
                          <ul className="flex flex-col gap-1">
                            {b.cadenas.map((c) => (
                              <li key={c.ruta.join('>')}>
                                {c.ruta
                                  .map(
                                    (id) =>
                                      entidades.find((e) => e.id === id)?.etiqueta ?? id,
                                  )
                                  .join(' → ')}{' '}
                                <span className="cifra">({formatearPorcentaje(c.porcentaje)})</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1.5">
                            {supera(b.porcentajeEfectivo) && (
                              <Insignia tono="ambar">Supera tu umbral</Insignia>
                            )}
                            {b.controlPorOtrosMedios && (
                              <Insignia tono="rojo">Control por otros medios</Insignia>
                            )}
                            {!supera(b.porcentajeEfectivo) && !b.controlPorOtrosMedios && (
                              <span className="text-[var(--color-tinta-tenue)]">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TablaEnvoltura>
            )}
          </div>

          {analisis.intermedias.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
                Entidades intermedias
              </h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--color-tinta-suave)]">
                {analisis.intermedias.map((b) => (
                  <li key={b.entidadId}>
                    <span className="font-medium text-[var(--color-tinta)]">{b.etiqueta}</span> —{' '}
                    <span className="cifra">{formatearPorcentaje(b.porcentajeEfectivo)}</span>{' '}
                    efectivo sobre la entidad analizada
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analisis.ciclos.length > 0 && (
            <Nota tono="riesgo" titulo="Hay participaciones circulares">
              <p>
                Detectamos un ciclo en la estructura ({analisis.ciclos.join(', ')}). Las cadenas que
                pasan por ahí se cortan para no calcular indefinidamente, así que los porcentajes
                pueden quedar incompletos. Las participaciones recíprocas requieren análisis
                jurídico, no aritmética.
              </p>
            </Nota>
          )}

          {analisis.faltantes.length > 0 && (
            <Nota tono="atencion" titulo="Qué falta para poder concluir">
              <ul className="flex list-disc flex-col gap-1.5 pl-5">
                {analisis.faltantes.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p>
                La norma también pide documentar los casos en que{' '}
                <strong>no fue posible determinar</strong> al beneficiario controlador y las medidas
                que tomaste al respecto. Un hueco documentado es una posición defendible; un hueco
                silencioso, no.
              </p>
            </Nota>
          )}

          {!umbralValido && (
            <Nota tono="info">
              <p>
                Captura el porcentaje de control arriba para que la tabla marque quién lo supera.
                Sin ese dato mostramos los porcentajes efectivos, que es la parte que sí podemos
                calcular con certeza.
              </p>
            </Nota>
          )}

          <AccionesResultado
            nombreArchivo="beneficiario-controlador"
            csv={csv}
            datos={{ entidades, participaciones, umbral: umbralValido ? umbralNumero : null, analisis }}
            claveGuardado="beneficiario-controlador"
          />
        </section>
      )}
    </div>
  );
}
