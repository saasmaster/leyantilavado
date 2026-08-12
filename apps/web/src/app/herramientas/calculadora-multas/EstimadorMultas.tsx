'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Gavel } from 'lucide-react';
import {
  Boton,
  Campo,
  Entrada,
  EstadoVacio,
  Insignia,
  Nota,
  SelloProcedencia,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import { formatearMXN } from '@leyantilavado/types';
import type { ReglaSancion } from '@leyantilavado/types';
import {
  aplicarAutocorreccion,
  datos,
  estimarSancion,
  hayUMAPara,
} from '@leyantilavado/rules-engine';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { Advertencias } from '@/components/herramientas/Advertencias';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { aCentavos, esFechaValida, escribirEnURL } from '@/lib/herramientas/util';

const FUENTES_ENLAZABLES = Object.fromEntries(
  datos.FUENTES.map((f) => [f.id, { nombre: f.nombre, url: f.url }]),
);

const TONO_GRAVEDAD: Record<ReglaSancion['gravedad'], 'neutro' | 'ambar' | 'rojo'> = {
  baja: 'neutro',
  media: 'ambar',
  alta: 'ambar',
  critica: 'rojo',
};

const ETIQUETA_GRAVEDAD: Record<ReglaSancion['gravedad'], string> = {
  baja: 'Gravedad baja',
  media: 'Gravedad media',
  alta: 'Gravedad alta',
  critica: 'El rango más alto de la ley',
};

export function EstimadorMultas() {
  const params = useSearchParams();
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));

  const [seleccionadas, setSeleccionadas] = React.useState<string[]>(() => {
    const inicial = params.get('infracciones');
    if (!inicial) return [];
    const validos = new Set(datos.SANCIONES.map((s) => s.id));
    return inicial.split(',').filter((id) => validos.has(id));
  });
  const [fecha, setFecha] = React.useState(params.get('fecha') ?? hoy);
  const [valorOperacion, setValorOperacion] = React.useState(params.get('valor') ?? '');
  const [calculado, setCalculado] = React.useState(false);

  const fechaValida = esFechaValida(fecha) && hayUMAPara(fecha);
  const valorValido = valorOperacion === '' || aCentavos(valorOperacion) !== null;

  const alternar = (id: string) =>
    setSeleccionadas((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const estimacion = React.useMemo(() => {
    if (!calculado || !fechaValida || seleccionadas.length === 0 || !valorValido) return null;
    const valor = aCentavos(valorOperacion);
    return estimarSancion({
      infracciones: seleccionadas,
      fecha,
      ...(valor !== null && valor > 0 ? { valorOperacion: valor } : {}),
    });
  }, [calculado, fechaValida, seleccionadas, valorOperacion, valorValido, fecha]);

  return (
    <div className="flex flex-col gap-8">
      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo className="flex flex-col gap-6">
          <fieldset>
            <legend className="text-lg font-semibold text-[var(--color-tinta)]">
              ¿Qué infracciones estás evaluando?
            </legend>
            <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
              Puedes marcar varias: la autoridad puede sancionar más de una conducta en el mismo
              procedimiento.
            </p>

            <ul className="mt-4 flex flex-col gap-3">
              {datos.SANCIONES.map((s) => (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-borde)] p-3 transition-colors hover:bg-[var(--color-marfil-hondo)]">
                    <input
                      type="checkbox"
                      className="mt-1 size-5 cursor-pointer"
                      checked={seleccionadas.includes(s.id)}
                      onChange={() => alternar(s.id)}
                    />
                    <span className="flex flex-col gap-1.5">
                      <span className="text-sm text-[var(--color-tinta)]">{s.supuesto}</span>
                      <span className="flex flex-wrap items-center gap-2">
                        <Insignia tono={TONO_GRAVEDAD[s.gravedad]}>
                          {ETIQUETA_GRAVEDAD[s.gravedad]}
                        </Insignia>
                        <span className="cifra text-xs text-[var(--color-tinta-tenue)]">
                          Art. {s.articulo}
                          {s.fraccion ? `, fr. ${s.fraccion}` : ''} ·{' '}
                          {s.minUMA.toLocaleString('es-MX')} a {s.maxUMA.toLocaleString('es-MX')} UMA
                          {s.alternativaPorcentaje
                            ? ` · o ${s.alternativaPorcentaje.minPct}%–${s.alternativaPorcentaje.maxPct}% del valor del acto`
                            : ''}
                        </span>
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <div className="grid gap-5 md:grid-cols-2">
            <Campo
              id="fecha-multa"
              etiqueta="Fecha de la infracción"
              ayuda="Define con qué valor de UMA se convierten los rangos."
              requerido
              {...(!fechaValida && fecha !== ''
                ? {
                    error: esFechaValida(fecha)
                      ? 'No tenemos registrada la UMA de esa fecha.'
                      : 'Captura una fecha válida.',
                  }
                : {})}
            >
              <Entrada type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </Campo>

            <Campo
              id="valor-operacion"
              etiqueta="Valor de la operación involucrada"
              ayuda="Opcional, pero sin él dos de las infracciones muestran un rango que puede quedarse muy corto."
              {...(!valorValido ? { error: 'Captura un monto en pesos.' } : {})}
            >
              <Entrada
                inputMode="decimal"
                className="cifra"
                placeholder="0.00"
                value={valorOperacion}
                onChange={(e) => setValorOperacion(e.target.value)}
              />
            </Campo>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Boton
              type="button"
              variante="accion"
              disabled={seleccionadas.length === 0 || !fechaValida || !valorValido}
              onClick={() => {
                setCalculado(true);
                escribirEnURL({
                  infracciones: seleccionadas.join(','),
                  fecha,
                  valor: valorOperacion || undefined,
                });
              }}
            >
              <Gavel aria-hidden />
              Estimar el rango
            </Boton>
            <p className="text-sm text-[var(--color-tinta-tenue)]">
              Nunca verás una cifra única: la ley fija rangos y la autoridad decide dentro de ellos.
            </p>
          </div>
        </TarjetaCuerpo>
      </Tarjeta>

      {calculado && !estimacion && (
        <EstadoVacio
          titulo="Faltan datos para estimar"
          descripcion="Marca al menos una infracción y captura una fecha con UMA registrada."
        />
      )}

      {estimacion && (
        <section aria-live="polite" className="imprimible flex flex-col gap-6">
          <EncabezadoImpresion titulo="Estimación de sanciones administrativas" />

          <Tarjeta elevada>
            <TarjetaCuerpo className="flex flex-col gap-3">
              <p className="text-sm text-[var(--color-tinta-suave)]">
                Rango total sumando las {estimacion.escenarios.length} infracciones marcadas
              </p>
              <p className="cifra text-3xl font-semibold text-[var(--color-tinta)]">
                {formatearMXN(estimacion.totalMinimo)} – {formatearMXN(estimacion.totalMaximo)}
              </p>
              <p className="text-sm text-[var(--color-tinta-suave)]">
                No es una predicción de lo que te van a cobrar. Es el intervalo que la ley contempla
                para los supuestos que marcaste, convertido con la UMA de la fecha capturada.
              </p>
            </TarjetaCuerpo>
          </Tarjeta>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
              Desglose por infracción
            </h3>
            {estimacion.escenarios.map((e) => (
              <Tarjeta key={e.reglaId} className="evitar-corte">
                <TarjetaCuerpo className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="max-w-2xl font-medium text-[var(--color-tinta)]">{e.supuesto}</p>
                    <Insignia tono={TONO_GRAVEDAD[e.gravedad]}>
                      {ETIQUETA_GRAVEDAD[e.gravedad]}
                    </Insignia>
                  </div>

                  <dl className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-[var(--color-tinta-tenue)]">Rango en UMA</dt>
                      <dd className="cifra mt-1 text-sm font-medium text-[var(--color-tinta)]">
                        {formatearMXN(e.rangoFijo.min.equivalentePesos)} –{' '}
                        {formatearMXN(e.rangoFijo.max.equivalentePesos)}
                      </dd>
                      <dd className="text-xs text-[var(--color-tinta-tenue)]">
                        {e.rangoFijo.min.uma.toLocaleString('es-MX')} a{' '}
                        {e.rangoFijo.max.uma.toLocaleString('es-MX')} UMA
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-tinta-tenue)]">
                        Porcentaje del valor del acto
                      </dt>
                      <dd className="cifra mt-1 text-sm font-medium text-[var(--color-tinta)]">
                        {e.rangoPorcentual
                          ? `${formatearMXN(e.rangoPorcentual.min)} – ${formatearMXN(e.rangoPorcentual.max)}`
                          : 'No aplica o falta el valor'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-tinta-tenue)]">
                        Rango que la ley manda aplicar
                      </dt>
                      <dd className="cifra mt-1 text-sm font-semibold text-[var(--color-rojo)]">
                        {formatearMXN(e.rangoAplicable.min)} – {formatearMXN(e.rangoAplicable.max)}
                      </dd>
                    </div>
                  </dl>

                  <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {e.explicacion}
                  </p>
                </TarjetaCuerpo>
              </Tarjeta>
            ))}
          </div>

          <Advertencias advertencias={estimacion.advertencias} />

          <section aria-labelledby="autocorreccion" className="flex flex-col gap-4">
            <div>
              <h3 id="autocorreccion" className="text-lg font-semibold text-[var(--color-tinta)]">
                Escenarios de autocorrección (art. 55)
              </h3>
              <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
                No son descuentos automáticos ni derechos adquiridos: son facultades de la autoridad
                sujetas a requisitos. Se muestran para que sepas que existen y qué exigen.
              </p>
            </div>

            {estimacion.autocorreccion.map((esc) => {
              const reducido = aplicarAutocorreccion(
                { min: estimacion.totalMinimo, max: estimacion.totalMaximo },
                esc.factorReduccion,
              );
              return (
                <Tarjeta key={esc.clave} className="evitar-corte">
                  <TarjetaCuerpo className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-[var(--color-tinta)]">{esc.titulo}</h4>
                      <Insignia tono="ambar">
                        {esc.factorReduccion === 0
                          ? 'Posible ausencia de sanción'
                          : `Reducción de hasta ${Math.round(esc.factorReduccion * 100)}%`}
                      </Insignia>
                    </div>

                    <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                      {esc.descripcion}
                    </p>

                    <p className="cifra text-sm text-[var(--color-tinta)]">
                      Rango en ese escenario: {formatearMXN(reducido.min)} –{' '}
                      {formatearMXN(reducido.max)}
                    </p>

                    <div>
                      <p className="text-sm font-medium text-[var(--color-tinta)]">
                        Requisitos que exige
                      </p>
                      <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-5 text-sm text-[var(--color-tinta-suave)]">
                        {esc.requisitos.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <Nota tono="atencion">
                      <p>{esc.advertencia}</p>
                    </Nota>
                  </TarjetaCuerpo>
                </Tarjeta>
              );
            })}
          </section>

          <SelloProcedencia procedencia={estimacion.procedencia} fuentes={FUENTES_ENLAZABLES} />

          <AccionesResultado
            nombreArchivo="estimacion-multas"
            datos={estimacion}
            conEnlace
            claveGuardado="calculadora-multas"
          />
        </section>
      )}
    </div>
  );
}
