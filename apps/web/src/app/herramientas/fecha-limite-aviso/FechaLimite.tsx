'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarPlus } from 'lucide-react';
import {
  Boton,
  Campo,
  Entrada,
  Insignia,
  Nota,
  SelloProcedencia,
  TablaEnvoltura,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import {
  calcularFechaLimiteAviso,
  datos,
  formatearFechaCorta,
  formatearFechaLarga,
  proximasFechasLimite,
} from '@leyantilavado/rules-engine';
import type { ResultadoFechaLimite } from '@leyantilavado/rules-engine';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { Advertencias } from '@/components/herramientas/Advertencias';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { construirICS, descargar, esFechaValida, marcaICS } from '@/lib/herramientas/util';

const FUENTES_ENLAZABLES = Object.fromEntries(
  datos.FUENTES.map((f) => [f.id, { nombre: f.nombre, url: f.url }]),
);

const PROCEDENCIA_AVISOS = datos.OBLIGACIONES_POR_SLUG['avisos']!.procedencia;

const ETIQUETA_ESTADO: Record<
  ResultadoFechaLimite['estado'],
  { texto: string; tono: 'verde' | 'marino' | 'ambar' | 'rojo' }
> = {
  vencido: { texto: 'Plazo vencido', tono: 'rojo' },
  hoy: { texto: 'Vence hoy', tono: 'rojo' },
  urgente: { texto: 'Urgente', tono: 'rojo' },
  proximo: { texto: 'Próximo', tono: 'ambar' },
  holgado: { texto: 'Con margen', tono: 'verde' },
};

export function FechaLimite() {
  const params = useSearchParams();
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [ahora] = React.useState(() => marcaICS(new Date()));

  const [fechaOperacion, setFechaOperacion] = React.useState(params.get('fecha') ?? hoy);
  const [fechaReferencia, setFechaReferencia] = React.useState(hoy);

  const valida = esFechaValida(fechaOperacion) && esFechaValida(fechaReferencia);

  const resultado = React.useMemo(
    () => (valida ? calcularFechaLimiteAviso(fechaOperacion, fechaReferencia) : null),
    [valida, fechaOperacion, fechaReferencia],
  );

  const proximas = React.useMemo(
    () => (esFechaValida(fechaReferencia) ? proximasFechasLimite(fechaReferencia, 6) : []),
    [fechaReferencia],
  );

  const descargarCalendario = (lista: ResultadoFechaLimite[], nombre: string) => {
    const ics = construirICS(
      lista.map((r) => ({
        uid: `aviso-${r.periodo}`,
        fecha: r.fechaLimite,
        titulo: `Aviso LFPIORPI del periodo ${r.periodo}`,
        descripcion:
          `Fecha límite para presentar el aviso de las operaciones de ${r.periodo} en el portal SPPLD. ` +
          'Si no hubo operaciones que alcanzaran el umbral, presenta el informe en ceros dentro del mismo plazo. ' +
          'Fecha nominal: confirma el calendario oficial de días inhábiles.',
      })),
      ahora,
    );
    descargar(`${nombre}.ics`, ics, 'text/calendar');
  };

  return (
    <div className="flex flex-col gap-8">
      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo>
          <div className="grid gap-5 md:grid-cols-2">
            <Campo
              id="fecha-operacion"
              etiqueta="Fecha de la operación"
              ayuda="El plazo se cuenta desde el mes en que ocurrió la operación, no desde que te enteraste."
              requerido
              {...(!esFechaValida(fechaOperacion) && fechaOperacion !== ''
                ? { error: 'Captura una fecha válida.' }
                : {})}
            >
              <Entrada
                type="date"
                value={fechaOperacion}
                onChange={(e) => setFechaOperacion(e.target.value)}
              />
            </Campo>

            <Campo
              id="fecha-referencia"
              etiqueta="Fecha desde la que cuentas"
              ayuda="Normalmente hoy. Cámbiala si estás revisando una fecha pasada."
              requerido
              {...(!esFechaValida(fechaReferencia) && fechaReferencia !== ''
                ? { error: 'Captura una fecha válida.' }
                : {})}
            >
              <Entrada
                type="date"
                value={fechaReferencia}
                onChange={(e) => setFechaReferencia(e.target.value)}
              />
            </Campo>
          </div>
        </TarjetaCuerpo>
      </Tarjeta>

      {resultado && (
        <section aria-live="polite" className="imprimible flex flex-col gap-6">
          <EncabezadoImpresion titulo="Fecha límite del aviso" />

          <Tarjeta elevada>
            <TarjetaCuerpo className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Insignia tono={ETIQUETA_ESTADO[resultado.estado].tono}>
                  {ETIQUETA_ESTADO[resultado.estado].texto}
                </Insignia>
                <span className="text-sm text-[var(--color-tinta-suave)]">
                  Periodo que se reporta: {resultado.periodo}
                </span>
              </div>

              <p className="text-3xl font-semibold text-[var(--color-tinta)]">
                {formatearFechaLarga(resultado.fechaLimite)}
              </p>

              <p className="cifra text-[var(--color-tinta-suave)]">
                {resultado.diasRestantes < 0
                  ? `Vencido hace ${Math.abs(resultado.diasRestantes)} días`
                  : resultado.diasRestantes === 0
                    ? 'Vence hoy'
                    : `Faltan ${resultado.diasRestantes} días`}
              </p>

              <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {resultado.explicacion}
              </p>

              <div className="no-imprimir">
                <Boton
                  type="button"
                  variante="contorno"
                  tamano="sm"
                  onClick={() => descargarCalendario([resultado], `aviso-${resultado.periodo}`)}
                >
                  <CalendarPlus aria-hidden />
                  Agregar al calendario (.ics)
                </Boton>
              </div>
            </TarjetaCuerpo>
          </Tarjeta>

          <Advertencias advertencias={resultado.advertencias} />

          <Nota tono="info" titulo="Si no hubo operaciones que alcanzaran el umbral, igual reportas">
            <p>
              Es el punto que más multas extemporáneas genera. Cuando en el periodo no hubo ninguna
              operación que llegara al umbral de aviso, el sujeto obligado{' '}
              <strong>debe presentar el informe en ceros</strong> dentro del mismo plazo del día 17.
              No presentarlo es la misma infracción que no presentar un aviso con operaciones.
            </p>
            <p>
              Dicho de otro modo: darse de alta en el padrón crea una obligación mensual permanente.
              Un mes sin ventas no es un mes sin reporte.
            </p>
          </Nota>

          <SelloProcedencia procedencia={PROCEDENCIA_AVISOS} fuentes={FUENTES_ENLAZABLES} />

          <AccionesResultado
            nombreArchivo={`fecha-limite-${resultado.periodo}`}
            datos={resultado}
            conEnlace
          />
        </section>
      )}

      <section aria-labelledby="proximas" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="proximas"
              className="text-2xl font-semibold text-[var(--color-tinta)] font-[family-name:var(--font-display)]"
            >
              Próximas seis fechas límite
            </h2>
            <p className="mt-1 text-[var(--color-tinta-suave)]">
              Calculadas desde la fecha de referencia que capturaste arriba.
            </p>
          </div>
          <Boton
            type="button"
            variante="contorno"
            tamano="sm"
            className="no-imprimir"
            onClick={() => descargarCalendario(proximas, 'avisos-lfpiorpi')}
          >
            <CalendarPlus aria-hidden />
            Descargar las seis en .ics
          </Boton>
        </div>

        <TablaEnvoltura>
          <table className="w-full min-w-[38rem] border-collapse text-sm">
            <caption className="sr-only">
              Próximas seis fechas límite de aviso con su periodo y días restantes
            </caption>
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="p-3 text-left font-semibold">
                  Periodo de operaciones
                </th>
                <th scope="col" className="p-3 text-left font-semibold">
                  Fecha límite
                </th>
                <th scope="col" className="p-3 text-left font-semibold">
                  Días restantes
                </th>
                <th scope="col" className="p-3 text-left font-semibold">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {proximas.map((p) => (
                <tr key={p.periodo} className="border-t border-[var(--color-borde)]">
                  <th scope="row" className="p-3 text-left font-medium">
                    {p.periodo}
                  </th>
                  <td className="p-3 whitespace-nowrap">{formatearFechaCorta(p.fechaLimite)}</td>
                  <td className="cifra p-3 whitespace-nowrap">{p.diasRestantes}</td>
                  <td className="p-3">
                    <Insignia tono={ETIQUETA_ESTADO[p.estado].tono}>
                      {ETIQUETA_ESTADO[p.estado].texto}
                    </Insignia>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <p className="text-sm text-[var(--color-tinta-tenue)]">
          Las fechas se muestran <strong>nominales</strong>: no las recorremos cuando el día 17 cae
          en fin de semana o en día inhábil. Hacerlo sin una regla oficial registrada sería inventar
          derecho. Confirma el calendario de días inhábiles antes de apurar un plazo.
        </p>
      </section>
    </div>
  );
}
