'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeftRight } from 'lucide-react';
import { Boton, Campo, Entrada, Insignia, Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { formatearMXN } from '@leyantilavado/types';
import {
  convertirUMA,
  derivadosUMA,
  formatearFechaLarga,
  hayUMAPara,
  pesosAUMA,
  umaVigenteEn,
} from '@leyantilavado/rules-engine';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { aCentavos, escribirEnURL, esFechaValida } from '@/lib/herramientas/util';

type Direccion = 'uma-a-pesos' | 'pesos-a-uma';

export function Conversor() {
  const params = useSearchParams();
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));

  const [direccion, setDireccion] = React.useState<Direccion>(
    params.get('dir') === 'pesos-a-uma' ? 'pesos-a-uma' : 'uma-a-pesos',
  );
  const [cantidad, setCantidad] = React.useState(params.get('cantidad') ?? '645');
  const [fecha, setFecha] = React.useState(params.get('fecha') ?? hoy);

  const fechaValida = esFechaValida(fecha) && hayUMAPara(fecha);
  const numero = Number(cantidad.replace(/[,$\s]/g, ''));
  const cantidadValida = cantidad.trim() !== '' && Number.isFinite(numero) && numero >= 0;

  const calculo = React.useMemo(() => {
    if (!fechaValida || !cantidadValida) return null;
    const valor = umaVigenteEn(fecha);
    const derivados = derivadosUMA(valor);

    if (direccion === 'uma-a-pesos') {
      const conversion = convertirUMA(numero, fecha);
      return { valor, derivados, conversion, uma: numero, pesos: conversion.equivalentePesos };
    }

    const centavos = aCentavos(cantidad);
    if (centavos === null) return null;
    const uma = pesosAUMA(centavos, fecha);
    return { valor, derivados, conversion: null, uma, pesos: centavos };
  }, [direccion, numero, cantidad, fecha, fechaValida, cantidadValida]);

  const alternar = () => {
    setDireccion((d) => (d === 'uma-a-pesos' ? 'pesos-a-uma' : 'uma-a-pesos'));
    setCantidad('');
  };

  const guardarEnURL = () =>
    escribirEnURL({ dir: direccion, cantidad, fecha });

  return (
    <div className="flex flex-col gap-6">
      <Nota tono="atencion" titulo="El error más caro del mercado: la UMA cambia el 1 de febrero">
        <p>
          El valor nuevo de la UMA no entra en vigor el 1 de enero, sino el{' '}
          <strong>1 de febrero</strong>. Una operación del 15 de enero de 2026 se mide con la UMA de{' '}
          <strong>2025</strong>, no con la de 2026. Por eso la herramienta te pide la fecha exacta de
          la operación y no el año: es lo que cambia el resultado en enero de cada año.
        </p>
      </Nota>

      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo>
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-end">
            <Campo
              id="cantidad"
              etiqueta={direccion === 'uma-a-pesos' ? 'Cantidad en UMA' : 'Cantidad en pesos'}
              ayuda={
                direccion === 'uma-a-pesos'
                  ? 'Por ejemplo, 645 UMA es el umbral de aviso de juegos y sorteos.'
                  : 'Captura el monto en pesos para ver a cuántas UMA equivale.'
              }
              requerido
              {...(cantidad.trim() !== '' && !cantidadValida
                ? { error: 'Captura una cantidad numérica.' }
                : {})}
            >
              <Entrada
                inputMode="decimal"
                className="cifra"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                onBlur={guardarEnURL}
                placeholder={direccion === 'uma-a-pesos' ? '645' : '75664.95'}
              />
            </Campo>

            <div className="pb-1">
              <Boton
                type="button"
                variante="contorno"
                onClick={alternar}
                aria-label="Invertir el sentido de la conversión"
              >
                <ArrowLeftRight aria-hidden />
                Invertir
              </Boton>
            </div>

            <Campo
              id="fecha-uma"
              etiqueta="Fecha de la operación"
              ayuda="Define qué valor de UMA aplica. No es la fecha de hoy: es la del acto."
              requerido
              {...(!fechaValida && fecha !== ''
                ? {
                    error: esFechaValida(fecha)
                      ? 'No tenemos registrada la UMA de esa fecha. No extrapolamos valores.'
                      : 'Captura una fecha válida.',
                  }
                : {})}
            >
              <Entrada
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                onBlur={guardarEnURL}
              />
            </Campo>
          </div>
        </TarjetaCuerpo>
      </Tarjeta>

      {calculo && (
        <section aria-live="polite" className="imprimible">
          <Tarjeta elevada>
            <TarjetaCuerpo className="flex flex-col gap-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="cifra text-3xl font-semibold text-[var(--color-tinta)]">
                  {direccion === 'uma-a-pesos'
                    ? formatearMXN(calculo.pesos)
                    : `${calculo.uma.toLocaleString('es-MX', { maximumFractionDigits: 4 })} UMA`}
                </p>
                <Insignia tono="marino">UMA del año {calculo.valor.anio}</Insignia>
              </div>

              <p className="text-[var(--color-tinta-suave)]">
                {direccion === 'uma-a-pesos' ? (
                  <>
                    {calculo.uma.toLocaleString('es-MX')} UMA ×{' '}
                    {formatearMXN(calculo.valor.diariaCentavos)} ={' '}
                    <strong>{formatearMXN(calculo.pesos)}</strong>
                  </>
                ) : (
                  <>
                    {formatearMXN(calculo.pesos)} ÷ {formatearMXN(calculo.valor.diariaCentavos)} ={' '}
                    <strong>
                      {calculo.uma.toLocaleString('es-MX', { maximumFractionDigits: 4 })} UMA
                    </strong>
                  </>
                )}
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { etiqueta: 'UMA diaria', valor: calculo.derivados.diaria },
                  { etiqueta: 'UMA mensual', valor: calculo.derivados.mensual },
                  { etiqueta: 'UMA anual', valor: calculo.derivados.anual },
                ].map((d) => (
                  <div
                    key={d.etiqueta}
                    className="rounded-[var(--radius-control)] border border-[var(--color-borde)] p-3"
                  >
                    <p className="text-xs text-[var(--color-tinta-tenue)]">{d.etiqueta}</p>
                    <p className="cifra mt-1 font-semibold text-[var(--color-tinta)]">
                      {formatearMXN(d.valor)}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-[var(--color-tinta-suave)]">
                La UMA de {calculo.valor.anio} rige del{' '}
                {formatearFechaLarga(calculo.valor.vigencia.desde)} al{' '}
                {calculo.valor.vigencia.hasta
                  ? formatearFechaLarga(calculo.valor.vigencia.hasta)
                  : 'día de hoy'}
                . La mensual y la anual se derivan como lo hace el INEGI: diaria × 30.4, y esa
                mensual × 12.
              </p>
            </TarjetaCuerpo>
          </Tarjeta>

          <AccionesResultado
            nombreArchivo="conversion-uma"
            datos={{
              direccion,
              fecha,
              anioUMA: calculo.valor.anio,
              umaDiariaCentavos: calculo.valor.diariaCentavos,
              uma: calculo.uma,
              pesosCentavos: calculo.pesos,
            }}
            conEnlace
          />
        </section>
      )}
    </div>
  );
}
