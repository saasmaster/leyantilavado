'use client';

import * as React from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import {
  Boton,
  Campo,
  Entrada,
  Insignia,
  Nota,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import type { FactorRiesgo, Mitigante, NivelRiesgo } from '@leyantilavado/types';
import {
  CORTES_RIESGO,
  evaluarRiesgo,
  factoresPorDefecto,
  formatearFechaLarga,
} from '@leyantilavado/rules-engine';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { aCSV, esFechaValida, formatearPorcentaje, nuevoId } from '@/lib/herramientas/util';

const TONO_NIVEL: Record<NivelRiesgo, 'verde' | 'ambar' | 'rojo'> = {
  bajo: 'verde',
  medio: 'ambar',
  alto: 'rojo',
};

const ETIQUETA_NIVEL: Record<NivelRiesgo, string> = {
  bajo: 'Riesgo bajo',
  medio: 'Riesgo medio',
  alto: 'Riesgo alto',
};

/**
 * Mitigantes propuestos. NO son un dato legal: la norma exige que cada
 * organización documente su propia metodología, así que la reducción de cada
 * uno es editable y arranca en un valor conservador.
 */
const MITIGANTES_SUGERIDOS: Omit<Mitigante, 'clave'>[] = [
  { etiqueta: 'Debida diligencia reforzada documentada', reduccion: 5 },
  { etiqueta: 'Monitoreo transaccional automatizado con alertas', reduccion: 5 },
  { etiqueta: 'Aprobación de un nivel jerárquico superior para el alta', reduccion: 3 },
  { etiqueta: 'Verificación del origen de los recursos', reduccion: 5 },
  { etiqueta: 'Prohibición de pagos en efectivo en la relación', reduccion: 4 },
];

export function MatrizRiesgos() {
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [fecha, setFecha] = React.useState(hoy);
  const [mesesRevision, setMesesRevision] = React.useState('6');
  const [factores, setFactores] = React.useState<FactorRiesgo[]>(() => factoresPorDefecto());
  const [mitigantes, setMitigantes] = React.useState<Mitigante[]>([]);

  const sumaPonderaciones = factores.reduce((a, f) => a + f.ponderacion, 0);
  const fechaValida = esFechaValida(fecha);
  const meses = Number(mesesRevision);
  const mesesValidos = Number.isInteger(meses) && meses > 0 && meses <= 24;

  const evaluacion = React.useMemo(() => {
    if (!fechaValida || sumaPonderaciones <= 0 || !mesesValidos) return null;
    try {
      return evaluarRiesgo({ factores, mitigantes, fecha, mesesRevision: meses });
    } catch {
      return null;
    }
  }, [factores, mitigantes, fecha, meses, fechaValida, sumaPonderaciones, mesesValidos]);

  const actualizarFactor = (clave: string, cambios: Partial<FactorRiesgo>) =>
    setFactores((f) => f.map((x) => (x.clave === clave ? { ...x, ...cambios } : x)));

  const csv = evaluacion
    ? aCSV(
        ['factor', 'puntaje', 'ponderacion', 'justificacion'],
        factores.map((f) => [f.etiqueta, f.puntaje, f.ponderacion, f.justificacion ?? '']),
      )
    : undefined;

  return (
    <div className="flex flex-col gap-8">
      <Nota tono="info" titulo="Esta metodología es un punto de partida, no la única válida">
        <p>
          La norma no impone una fórmula: exige que <strong>tu organización documente la suya</strong>{' '}
          y la justifique. Los pesos que ves prellenados son una propuesta razonable; cámbialos si tu
          negocio lo amerita y anota por qué en cada factor. Esa justificación es justo lo que un
          auditor va a leer.
        </p>
      </Nota>

      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo className="flex flex-col gap-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Campo
              id="fecha-riesgo"
              etiqueta="Fecha de la evaluación"
              ayuda="Define desde cuándo se cuenta la próxima revisión."
              requerido
              {...(!fechaValida && fecha !== '' ? { error: 'Captura una fecha válida.' } : {})}
            >
              <Entrada type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </Campo>

            <Campo
              id="meses-revision"
              etiqueta="Cada cuántos meses la revisas"
              ayuda="La norma pide revisar la metodología al menos una vez al año y la clasificación de clientes al menos cada seis meses."
              requerido
              {...(!mesesValidos ? { error: 'Captura un número de meses entre 1 y 24.' } : {})}
            >
              <Entrada
                type="number"
                min={1}
                max={24}
                className="cifra"
                value={mesesRevision}
                onChange={(e) => setMesesRevision(e.target.value)}
              />
            </Campo>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[var(--color-tinta)]">
                Factores de riesgo
              </h2>
              <Boton
                type="button"
                variante="fantasma"
                tamano="sm"
                onClick={() => setFactores(factoresPorDefecto())}
              >
                <RotateCcw aria-hidden />
                Restablecer pesos sugeridos
              </Boton>
            </div>

            <p
              className={`mt-1 text-sm ${
                Math.abs(sumaPonderaciones - 1) < 0.001
                  ? 'text-[var(--color-tinta-tenue)]'
                  : 'text-[var(--color-ambar)]'
              }`}
            >
              Los pesos suman {sumaPonderaciones.toFixed(2)}.{' '}
              {Math.abs(sumaPonderaciones - 1) < 0.001
                ? 'Correcto: suman 1.'
                : 'No suman 1, así que el puntaje se normaliza por la suma real para seguir siendo comparable en la escala de 0 a 100.'}
            </p>

            <ul className="mt-4 flex flex-col gap-5">
              {factores.map((f) => (
                <li
                  key={f.clave}
                  className="rounded-[var(--radius-control)] border border-[var(--color-borde)] p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <label
                      htmlFor={`puntaje-${f.clave}`}
                      className="font-medium text-[var(--color-tinta)]"
                    >
                      {f.etiqueta}
                    </label>
                    <span className="cifra text-sm text-[var(--color-tinta-suave)]">
                      {f.puntaje}/100 · peso {formatearPorcentaje(f.ponderacion * 100, 0)}
                    </span>
                  </div>

                  <input
                    id={`puntaje-${f.clave}`}
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={f.puntaje}
                    onChange={(e) =>
                      actualizarFactor(f.clave, { puntaje: Number(e.target.value) })
                    }
                    className="mt-3 h-2 w-full cursor-pointer accent-[var(--color-petroleo)]"
                    aria-describedby={`ayuda-${f.clave}`}
                  />
                  <p id={`ayuda-${f.clave}`} className="mt-1 text-xs text-[var(--color-tinta-tenue)]">
                    0 = riesgo mínimo, 100 = riesgo máximo.
                  </p>

                  <div className="mt-3 grid gap-3 md:grid-cols-[8rem_minmax(0,1fr)]">
                    <Campo id={`peso-${f.clave}`} etiqueta="Peso (0 a 1)">
                      <Entrada
                        type="number"
                        min={0}
                        max={1}
                        step="0.05"
                        className="cifra"
                        value={String(f.ponderacion)}
                        onChange={(e) =>
                          actualizarFactor(f.clave, {
                            ponderacion: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                      />
                    </Campo>
                    <Campo id={`just-${f.clave}`} etiqueta="Justificación del criterio">
                      <Entrada
                        placeholder="Por qué este peso y este puntaje en tu negocio"
                        value={f.justificacion ?? ''}
                        onChange={(e) =>
                          actualizarFactor(f.clave, { justificacion: e.target.value })
                        }
                      />
                    </Campo>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-[var(--color-borde)] pt-6">
            <h2 className="text-lg font-semibold text-[var(--color-tinta)]">Mitigantes</h2>
            <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
              Controles que aplicas y que bajan el puntaje. La reducción de cada uno es tuya:
              ajústala y documenta el criterio.
            </p>

            {mitigantes.length > 0 && (
              <ul className="mt-4 flex flex-col gap-3">
                {mitigantes.map((m) => (
                  <li key={m.clave} className="flex flex-wrap items-end gap-3">
                    <Campo
                      id={`mit-${m.clave}`}
                      etiqueta="Mitigante"
                      className="min-w-64 flex-1"
                    >
                      <Entrada
                        value={m.etiqueta}
                        onChange={(e) =>
                          setMitigantes((lista) =>
                            lista.map((x) =>
                              x.clave === m.clave ? { ...x, etiqueta: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </Campo>
                    <Campo id={`red-${m.clave}`} etiqueta="Puntos que resta" className="w-36">
                      <Entrada
                        type="number"
                        min={0}
                        max={100}
                        className="cifra"
                        value={String(m.reduccion)}
                        onChange={(e) =>
                          setMitigantes((lista) =>
                            lista.map((x) =>
                              x.clave === m.clave
                                ? { ...x, reduccion: Math.max(0, Number(e.target.value) || 0) }
                                : x,
                            ),
                          )
                        }
                      />
                    </Campo>
                    <Boton
                      type="button"
                      variante="fantasma"
                      onClick={() =>
                        setMitigantes((lista) => lista.filter((x) => x.clave !== m.clave))
                      }
                      aria-label={`Quitar ${m.etiqueta}`}
                    >
                      <Trash2 aria-hidden />
                    </Boton>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {MITIGANTES_SUGERIDOS.filter(
                (s) => !mitigantes.some((m) => m.etiqueta === s.etiqueta),
              ).map((s) => (
                <Boton
                  key={s.etiqueta}
                  type="button"
                  variante="contorno"
                  tamano="sm"
                  onClick={() =>
                    setMitigantes((lista) => [...lista, { ...s, clave: nuevoId('mit') }])
                  }
                >
                  <Plus aria-hidden />
                  {s.etiqueta}
                </Boton>
              ))}
            </div>
          </div>
        </TarjetaCuerpo>
      </Tarjeta>

      {evaluacion && (
        <section aria-live="polite" className="imprimible flex flex-col gap-6">
          <EncabezadoImpresion titulo="Matriz de riesgos" />

          <Tarjeta elevada>
            <TarjetaCuerpo className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="cifra text-4xl font-semibold text-[var(--color-tinta)]">
                  {evaluacion.puntajeFinal}
                  <span className="text-xl text-[var(--color-tinta-tenue)]">/100</span>
                </p>
                <Insignia tono={TONO_NIVEL[evaluacion.nivel]}>
                  {ETIQUETA_NIVEL[evaluacion.nivel]}
                </Insignia>
                {evaluacion.requiereDebidaDiligenciaReforzada && (
                  <Insignia tono="rojo">Debida diligencia reforzada</Insignia>
                )}
              </div>

              <div
                className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-marfil-hondo)]"
                role="img"
                aria-label={`Puntaje ${evaluacion.puntajeFinal} de 100, nivel ${evaluacion.nivel}`}
              >
                <div
                  className="h-full rounded-full bg-[var(--color-petroleo)]"
                  style={{ width: `${evaluacion.puntajeFinal}%` }}
                />
              </div>
              <p className="text-xs text-[var(--color-tinta-tenue)]">
                Cortes de la metodología: hasta {CORTES_RIESGO.bajo} bajo, hasta{' '}
                {CORTES_RIESGO.medio} medio, por encima alto.
              </p>

              <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {evaluacion.explicacion}
              </p>

              <p className="text-sm font-medium text-[var(--color-tinta)]">
                Próxima revisión: {formatearFechaLarga(evaluacion.proximaRevision)}
              </p>
            </TarjetaCuerpo>
          </Tarjeta>

          {evaluacion.requiereDebidaDiligenciaReforzada && (
            <Nota tono="atencion" titulo="Qué implica la debida diligencia reforzada">
              <p>
                Aprobación de un nivel jerárquico superior para iniciar o continuar la relación,
                verificación del origen de los recursos, monitoreo más frecuente y revisión de la
                clasificación en plazos más cortos. Todo con evidencia documentada: sin registro, no
                existe.
              </p>
            </Nota>
          )}

          <Nota tono="info" titulo="Documenta la metodología, no sólo el resultado">
            <p>
              El puntaje sin el criterio no le sirve a nadie. Guarda por escrito por qué elegiste
              esos pesos, qué información usaste —la norma pide los últimos doce meses, o
              proyecciones si no hay historial— y quién aprobó la metodología. El archivo que puedes
              exportar aquí abajo incluye las justificaciones que capturaste.
            </p>
          </Nota>

          <AccionesResultado
            nombreArchivo="matriz-riesgos"
            csv={csv}
            datos={{ fecha, factores, mitigantes, evaluacion }}
            claveGuardado="matriz-riesgos"
          />
        </section>
      )}
    </div>
  );
}
