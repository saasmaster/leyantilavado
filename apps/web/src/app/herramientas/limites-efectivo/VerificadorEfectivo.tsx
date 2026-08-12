'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Banknote } from 'lucide-react';
import {
  Boton,
  Campo,
  Entrada,
  Insignia,
  Nota,
  SelloProcedencia,
  Selector,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import { formatearMXN, type ActividadSlug } from '@leyantilavado/types';
import { datos, evaluarEfectivo, hayUMAPara } from '@leyantilavado/rules-engine';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { Advertencias } from '@/components/herramientas/Advertencias';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { aCentavos, escribirEnURL, esFechaValida, mxn } from '@/lib/herramientas/util';

const FUENTES_ENLAZABLES = Object.fromEntries(
  datos.FUENTES.map((f) => [f.id, { nombre: f.nombre, url: f.url }]),
);

const esquema = z
  .object({
    reglaId: z.string().min(1, 'Elige el tipo de operación.'),
    fecha: z
      .string()
      .refine(esFechaValida, 'Captura una fecha válida.')
      .refine(hayUMAPara, 'No tenemos registrada la UMA de esa fecha, así que no calculamos.'),
    valorConIVA: z
      .string()
      .min(1, 'Captura el valor total del acto con IVA incluido.')
      .refine((v) => (aCentavos(v) ?? -1) >= 0, 'Captura un monto en pesos.'),
    valorSinIVA: z
      .string()
      .refine((v) => v === '' || (aCentavos(v) ?? -1) >= 0, 'Captura un monto en pesos.'),
    montoEfectivo: z
      .string()
      .min(1, 'Captura cuánto se liquida en efectivo o metales.')
      .refine((v) => (aCentavos(v) ?? -1) >= 0, 'Captura un monto en pesos.'),
    otrosMedios: z
      .string()
      .refine((v) => v === '' || (aCentavos(v) ?? -1) >= 0, 'Captura un monto en pesos.'),
    pagosParciales: z.boolean(),
    monedaExtranjera: z.boolean(),
    periodoCompleto: z.boolean(),
  })
  .refine(
    (v) => {
      const total = aCentavos(v.valorConIVA);
      const efectivo = aCentavos(v.montoEfectivo);
      return total === null || efectivo === null || efectivo <= total;
    },
    {
      path: ['montoEfectivo'],
      message: 'El efectivo no puede ser mayor que el valor total del acto.',
    },
  );

type Valores = z.infer<typeof esquema>;

export function VerificadorEfectivo() {
  const params = useSearchParams();
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [enviado, setEnviado] = React.useState<Valores | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: {
      reglaId: params.get('regla') ?? '',
      fecha: params.get('fecha') ?? hoy,
      valorConIVA: params.get('total') ?? '',
      valorSinIVA: '',
      montoEfectivo: params.get('efectivo') ?? '',
      otrosMedios: '',
      pagosParciales: false,
      monedaExtranjera: false,
      periodoCompleto: true,
    },
  });

  const reglaId = watch('reglaId');
  const reglaElegida = datos.REGLAS_EFECTIVO.find((r) => r.id === reglaId);

  const resultado = React.useMemo(() => {
    if (!enviado) return null;
    const regla = datos.REGLAS_EFECTIVO.find((r) => r.id === enviado.reglaId);
    const efectivo = aCentavos(enviado.montoEfectivo);
    const total = aCentavos(enviado.valorConIVA);
    if (!regla || efectivo === null || total === null) return null;

    // `reglaId` manda: el parámetro de actividad sólo se usa cuando no se envía
    // una regla concreta, y aquí el usuario ya eligió el tipo de operación.
    const actividadDeRespaldo = (regla.actividades[0] ?? 'juegos-sorteos') as ActividadSlug;

    return {
      regla,
      evaluacion: evaluarEfectivo({
        actividad: actividadDeRespaldo,
        fecha: enviado.fecha,
        montoEfectivo: efectivo,
        valorTotal: total,
        reglaId: regla.id,
      }),
    };
  }, [enviado]);

  const sumaMedios = (() => {
    if (!enviado) return null;
    const efectivo = aCentavos(enviado.montoEfectivo);
    const otros = aCentavos(enviado.otrosMedios);
    const total = aCentavos(enviado.valorConIVA);
    if (efectivo === null || otros === null || total === null) return null;
    return { suma: efectivo + otros, total, cuadra: Math.abs(efectivo + otros - total) < 100 };
  })();

  return (
    <div className="flex flex-col gap-8">
      <Nota
        tono="atencion"
        titulo="El artículo 32 se mide CON IVA; los umbrales del artículo 17, SIN IVA"
      >
        <p>
          Son dos bases distintas para el mismo contrato y es el error más frecuente al revisar una
          operación mixta. El límite de efectivo se compara contra el{' '}
          <strong>valor total del acto con IVA incluido</strong>. El umbral que decide si hay aviso
          se compara contra el <strong>valor sin IVA</strong>. Usar una sola cifra para las dos
          reglas te deja corto justo en el borde, que es donde importa.
        </p>
      </Nota>

      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo>
          <form
            onSubmit={handleSubmit((v) => {
              setEnviado(v);
              escribirEnURL({
                regla: v.reglaId,
                fecha: v.fecha,
                total: v.valorConIVA,
                efectivo: v.montoEfectivo,
              });
            })}
            noValidate
            className="flex flex-col gap-5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Campo
                id="reglaId"
                etiqueta="Tipo de operación"
                ayuda="El artículo 32 no tiene un límite único: cada tipo de acto tiene el suyo."
                requerido
                {...(errors.reglaId?.message ? { error: errors.reglaId.message } : {})}
              >
                <Selector {...register('reglaId')}>
                  <option value="">Elige el tipo de operación…</option>
                  {datos.REGLAS_EFECTIVO.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </Selector>
              </Campo>

              <Campo
                id="fecha-efectivo"
                etiqueta="Fecha del pago"
                ayuda="El límite se mide al día en que se paga o se cumple la obligación."
                requerido
                {...(errors.fecha?.message ? { error: errors.fecha.message } : {})}
              >
                <Entrada type="date" {...register('fecha')} />
              </Campo>

              <Campo
                id="valorConIVA"
                etiqueta="Valor total del acto, CON IVA"
                ayuda="Base del artículo 32. Si tu precio de lista es sin IVA, multiplícalo por 1.16."
                requerido
                {...(errors.valorConIVA?.message ? { error: errors.valorConIVA.message } : {})}
              >
                <Entrada
                  inputMode="decimal"
                  className="cifra"
                  placeholder="0.00"
                  {...register('valorConIVA')}
                />
              </Campo>

              <Campo
                id="valorSinIVA"
                etiqueta="Valor del acto, SIN IVA"
                ayuda="Base del artículo 17. Opcional aquí, pero es la que decide si hay aviso."
                {...(errors.valorSinIVA?.message ? { error: errors.valorSinIVA.message } : {})}
              >
                <Entrada
                  inputMode="decimal"
                  className="cifra"
                  placeholder="0.00"
                  {...register('valorSinIVA')}
                />
              </Campo>

              <Campo
                id="montoEfectivo-32"
                etiqueta="Monto liquidado en efectivo o metales, con IVA"
                ayuda="Incluye billetes, monedas, metales preciosos y piedras preciosas."
                requerido
                {...(errors.montoEfectivo?.message ? { error: errors.montoEfectivo.message } : {})}
              >
                <Entrada
                  inputMode="decimal"
                  className="cifra"
                  placeholder="0.00"
                  {...register('montoEfectivo')}
                />
              </Campo>

              <Campo
                id="otrosMedios"
                etiqueta="Monto por otros medios de pago"
                ayuda="Transferencia, cheque o tarjeta. Sirve para cuadrar la operación."
                {...(errors.otrosMedios?.message ? { error: errors.otrosMedios.message } : {})}
              >
                <Entrada
                  inputMode="decimal"
                  className="cifra"
                  placeholder="0.00"
                  {...register('otrosMedios')}
                />
              </Campo>
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-medium text-[var(--color-tinta)]">
                Condiciones de la operación
              </legend>

              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 cursor-pointer"
                  {...register('pagosParciales')}
                />
                <span className="text-[var(--color-tinta-suave)]">
                  El pago se hace en varias exhibiciones o pagos parciales.
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 cursor-pointer"
                  {...register('monedaExtranjera')}
                />
                <span className="text-[var(--color-tinta-suave)]">
                  Parte del efectivo se entrega en moneda extranjera.
                </span>
              </label>

              {reglaElegida?.periodicidad === 'mensual' && (
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-5 cursor-pointer"
                    {...register('periodoCompleto')}
                  />
                  <span className="text-[var(--color-tinta-suave)]">
                    El monto capturado corresponde a un mes completo. Este límite es mensual, no por
                    pago.
                  </span>
                </label>
              )}
            </fieldset>

            <div className="flex flex-wrap items-center gap-3">
              <Boton type="submit" variante="accion">
                <Banknote aria-hidden />
                Verificar el límite
              </Boton>
              <p className="text-sm text-[var(--color-tinta-tenue)]">
                Se calcula en tu navegador. Nada se envía a un servidor.
              </p>
            </div>
          </form>
        </TarjetaCuerpo>
      </Tarjeta>

      {resultado && enviado && (
        <section aria-live="polite" className="imprimible flex flex-col gap-6">
          <EncabezadoImpresion titulo="Verificación del límite de efectivo (art. 32)" />

          <Tarjeta elevada>
            <TarjetaCuerpo className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Insignia tono={resultado.evaluacion.excede ? 'rojo' : 'verde'}>
                  {resultado.evaluacion.excede
                    ? 'Rebasa el límite del artículo 32'
                    : 'Dentro del límite del artículo 32'}
                </Insignia>
                {resultado.regla.estado !== 'publicado' && (
                  <Insignia tono="ambar">Regla pendiente de revisión editorial</Insignia>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-[var(--color-tinta-tenue)]">Límite aplicable</p>
                  <p className="cifra mt-1 text-xl font-semibold text-[var(--color-tinta)]">
                    {resultado.evaluacion.limite
                      ? formatearMXN(resultado.evaluacion.limite.equivalentePesos)
                      : '—'}
                  </p>
                  <p className="text-xs text-[var(--color-tinta-tenue)]">
                    {resultado.regla.limiteUMA.toLocaleString('es-MX')} UMA
                    {resultado.regla.periodicidad === 'mensual' ? ' mensuales' : ' por operación'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-tinta-tenue)]">En efectivo o metales</p>
                  <p className="cifra mt-1 text-xl font-semibold text-[var(--color-tinta)]">
                    {formatearMXN(resultado.evaluacion.montoEfectivo)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-tinta-tenue)]">
                    {resultado.evaluacion.excede ? 'Exceso' : 'Margen disponible'}
                  </p>
                  <p
                    className={`cifra mt-1 text-xl font-semibold ${
                      resultado.evaluacion.excede
                        ? 'text-[var(--color-rojo)]'
                        : 'text-[var(--color-verde)]'
                    }`}
                  >
                    {resultado.evaluacion.diferencia !== null
                      ? mxn(Math.abs(resultado.evaluacion.diferencia))
                      : '—'}
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {resultado.evaluacion.explicacion}
              </p>
            </TarjetaCuerpo>
          </Tarjeta>

          {resultado.regla.discrepanciaOficial && (
            <Nota tono="atencion" titulo="Dos fuentes oficiales dicen cosas distintas">
              <p>{resultado.regla.discrepanciaOficial.descripcion}</p>
              <p>
                <strong>Según el SAT:</strong> {resultado.regla.discrepanciaOficial.segunSAT}
              </p>
              <p>
                <strong>Según el texto de la ley:</strong>{' '}
                {resultado.regla.discrepanciaOficial.segunLey}
              </p>
              <p>
                Mientras la autoridad no lo aclare, no publicamos un resultado definitivo para este
                supuesto. Trátalo como orientación y consúltalo con un profesional.
              </p>
            </Nota>
          )}

          <Nota tono="riesgo" titulo="Fraccionar el pago no evita la regla">
            <p>
              La restricción se mide sobre el <strong>acto u operación</strong>, no sobre cada
              recibo. Partir el precio en cinco entregas de efectivo por debajo del límite no lo
              respeta: lo incumple cinco veces documentadas.
              {enviado.pagosParciales
                ? ' Marcaste que el pago se hace en varias exhibiciones: suma todas las que correspondan al mismo acto antes de compararlas contra el límite.'
                : ''}
            </p>
            <p>
              Y ojo con la naturaleza de la norma: el artículo 32 es una{' '}
              <strong>prohibición</strong>, no un umbral de reporte. Rebasarlo es infracción aunque
              el aviso se haya presentado en tiempo y forma.
            </p>
          </Nota>

          {enviado.monedaExtranjera && (
            <Nota tono="atencion" titulo="Efectivo en moneda extranjera">
              <p>
                Convierte los billetes extranjeros a pesos con el tipo de cambio del día en que se
                realiza el pago y suma ese importe al efectivo en pesos antes de comparar contra el
                límite. La herramienta no aplica tipos de cambio: no publicamos una cifra que no
                podamos respaldar con una fuente oficial diaria.
              </p>
            </Nota>
          )}

          {sumaMedios && !sumaMedios.cuadra && enviado.otrosMedios !== '' && (
            <Nota tono="atencion" titulo="Las cifras no cuadran">
              <p>
                Efectivo más otros medios suman {mxn(sumaMedios.suma)}, y el valor total del acto
                que capturaste es {formatearMXN(sumaMedios.total)}. Revisa las cifras antes de tomar
                una decisión con este resultado.
              </p>
            </Nota>
          )}

          <Nota tono="info" titulo="Y el umbral de aviso, ¿cómo va?">
            <p>
              El límite de efectivo y el umbral de aviso son reglas independientes. Puedes estar
              dentro del límite de efectivo y aun así tener que presentar aviso, o al revés. Para
              esa segunda pregunta usa el valor <strong>sin IVA</strong>
              {enviado.valorSinIVA
                ? `, que en tu caso es ${formatearMXN(aCentavos(enviado.valorSinIVA)!)}`
                : ''}
              .
            </p>
            <Link
              href={{
                pathname: '/herramientas/calculadora-umbrales',
                query: {
                  fecha: enviado.fecha,
                  ...(enviado.valorSinIVA ? { monto: enviado.valorSinIVA } : {}),
                },
              }}
              className="mt-2 inline-block font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
            >
              Calcular el umbral de aviso con esa base
            </Link>
          </Nota>

          <Advertencias advertencias={resultado.evaluacion.advertencias} />

          <SelloProcedencia
            procedencia={resultado.regla.procedencia}
            fuentes={FUENTES_ENLAZABLES}
          />

          <AccionesResultado
            nombreArchivo="limite-efectivo-art32"
            datos={{
              reglaId: resultado.regla.id,
              fecha: enviado.fecha,
              limiteUMA: resultado.regla.limiteUMA,
              evaluacion: resultado.evaluacion,
            }}
            conEnlace
          />
        </section>
      )}
    </div>
  );
}
