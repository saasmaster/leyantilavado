'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator } from 'lucide-react';
import {
  Boton,
  Campo,
  Entrada,
  Nota,
  Selector,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import type { MedioPago, Operacion, ResultadoEvaluacion } from '@leyantilavado/types';
import { evaluarOperacion, hayUMAPara } from '@leyantilavado/rules-engine';
import { SelectorActividad } from '@/components/herramientas/SelectorActividad';
import { TarjetaEvaluacion } from '@/components/herramientas/TarjetaEvaluacion';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { requiereSubtipo } from '@/lib/herramientas/actividades';
import { aCentavos, escribirEnURL, esFechaValida } from '@/lib/herramientas/util';

const MEDIOS: { valor: MedioPago; etiqueta: string }[] = [
  { valor: 'transferencia', etiqueta: 'Transferencia electrónica' },
  { valor: 'efectivo', etiqueta: 'Efectivo' },
  { valor: 'cheque', etiqueta: 'Cheque' },
  { valor: 'tarjeta', etiqueta: 'Tarjeta' },
  { valor: 'metales_preciosos', etiqueta: 'Metales o piedras preciosas' },
  { valor: 'activos_virtuales', etiqueta: 'Activos virtuales' },
  { valor: 'mixto', etiqueta: 'Combinación de medios' },
  { valor: 'otro', etiqueta: 'Otro' },
];

const esquema = z
  .object({
    actividad: z.string().min(1, 'Elige la actividad vulnerable.'),
    subtipo: z.string(),
    fecha: z
      .string()
      .refine(esFechaValida, 'Captura una fecha válida con el formato día/mes/año.')
      .refine(hayUMAPara, 'No tenemos registrada la UMA de esa fecha, así que no calculamos.'),
    monto: z
      .string()
      .min(1, 'Captura el valor de la operación.')
      .refine((v) => (aCentavos(v) ?? -1) >= 0, 'Captura un monto en pesos, sin letras.'),
    montoEfectivo: z.string(),
    comision: z.string(),
    medioPago: z.string(),
    enRepresentacion: z.string(),
    montoIndeterminable: z.string(),
  })
  .refine((v) => !requiereSubtipo(v.actividad, v.fecha) || v.subtipo !== '', {
    path: ['subtipo'],
    message: 'Esta actividad tiene reglas distintas por inciso: elige cuál aplica.',
  })
  .refine((v) => aCentavos(v.montoEfectivo) !== null || v.montoEfectivo === '', {
    path: ['montoEfectivo'],
    message: 'Captura un monto en pesos o deja el campo vacío.',
  })
  .refine((v) => aCentavos(v.comision) !== null || v.comision === '', {
    path: ['comision'],
    message: 'Captura un monto en pesos o deja el campo vacío.',
  });

type Valores = z.infer<typeof esquema>;

export function Calculadora() {
  const params = useSearchParams();
  // El valor por omisión se resuelve una sola vez, fuera del render, para no
  // violar `react-hooks/purity` con `new Date()`.
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));

  const [resultado, setResultado] = React.useState<ResultadoEvaluacion | null>(null);
  const [errorMotor, setErrorMotor] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: {
      actividad: params.get('actividad') ?? '',
      subtipo: params.get('subtipo') ?? '',
      fecha: params.get('fecha') ?? hoy,
      monto: params.get('monto') ?? '',
      montoEfectivo: '',
      comision: '',
      medioPago: 'transferencia',
      enRepresentacion: '',
      montoIndeterminable: '',
    },
  });

  const actividad = watch('actividad');
  const subtipo = watch('subtipo');
  const fecha = watch('fecha');

  const calcular = (v: Valores) => {
    const monto = aCentavos(v.monto);
    if (monto === null) return;

    const efectivo = aCentavos(v.montoEfectivo);
    const comision = aCentavos(v.comision);

    const operacion: Operacion = {
      id: 'operacion-capturada',
      fecha: v.fecha,
      actividad: v.actividad as Operacion['actividad'],
      ...(v.subtipo ? { subtipo: v.subtipo } : {}),
      monto,
      ...(efectivo !== null ? { montoEfectivo: efectivo } : {}),
      ...(comision !== null ? { comision } : {}),
      medioPago: v.medioPago as MedioPago,
      ...(v.enRepresentacion !== ''
        ? { enRepresentacionDelCliente: v.enRepresentacion === 'si' }
        : {}),
      ...(v.montoIndeterminable !== ''
        ? { montoIndeterminable: v.montoIndeterminable === 'si' }
        : {}),
    };

    try {
      setResultado(evaluarOperacion(operacion));
      setErrorMotor(null);
      // Sólo van a la URL los parámetros del cálculo, jamás datos del cliente.
      escribirEnURL({
        actividad: v.actividad,
        subtipo: v.subtipo || undefined,
        fecha: v.fecha,
        monto: v.monto,
      });
    } catch (e) {
      setResultado(null);
      setErrorMotor(
        e instanceof Error
          ? e.message
          : 'No fue posible resolver una regla para esa combinación de actividad y fecha.',
      );
    }
  };

  const esServiciosProfesionales = actividad === 'servicios-profesionales';
  const esTraslado = actividad === 'traslado-custodia-valores';
  const esActivosVirtuales = actividad === 'activos-virtuales';

  return (
    <div className="flex flex-col gap-8">
      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo>
          <form onSubmit={handleSubmit(calcular)} noValidate className="flex flex-col gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <SelectorActividad
                actividad={actividad}
                subtipo={subtipo}
                fecha={esFechaValida(fecha) ? fecha : hoy}
                onActividad={(s) => setValue('actividad', s, { shouldValidate: false })}
                onSubtipo={(s) => setValue('subtipo', s, { shouldValidate: false })}
                {...(errors.actividad?.message ? { errorActividad: errors.actividad.message } : {})}
                {...(errors.subtipo?.message ? { errorSubtipo: errors.subtipo.message } : {})}
              />

              <Campo
                id="fecha"
                etiqueta="Fecha de la operación"
                ayuda="Determina qué UMA y qué regla se aplican. No es la fecha de hoy: es la del acto."
                requerido
                {...(errors.fecha?.message ? { error: errors.fecha.message } : {})}
              >
                <Entrada type="date" {...register('fecha')} />
              </Campo>

              <Campo
                id="monto"
                etiqueta="Valor de la operación, sin IVA"
                ayuda="Los umbrales del artículo 17 se miden sin IVA. En pesos."
                requerido
                {...(errors.monto?.message ? { error: errors.monto.message } : {})}
              >
                <Entrada
                  inputMode="decimal"
                  placeholder="1250000.00"
                  className="cifra"
                  {...register('monto')}
                />
              </Campo>

              <Campo
                id="medioPago"
                etiqueta="Medio de pago"
                ayuda="No cambia el umbral de aviso, pero sí las advertencias que verás."
              >
                <Selector {...register('medioPago')}>
                  {MEDIOS.map((m) => (
                    <option key={m.valor} value={m.valor}>
                      {m.etiqueta}
                    </option>
                  ))}
                </Selector>
              </Campo>

              <Campo
                id="montoEfectivo"
                etiqueta="Parte liquidada en efectivo o metales, con IVA"
                ayuda="Opcional. Si lo capturas, también se revisa el límite del artículo 32."
                {...(errors.montoEfectivo?.message ? { error: errors.montoEfectivo.message } : {})}
              >
                <Entrada
                  inputMode="decimal"
                  placeholder="0.00"
                  className="cifra"
                  {...register('montoEfectivo')}
                />
              </Campo>

              {esActivosVirtuales && (
                <Campo
                  id="comision"
                  etiqueta="Contraprestación cobrada por el servicio"
                  ayuda="En activos virtuales hay dos disparadores independientes: el monto y la comisión. Basta uno."
                  {...(errors.comision?.message ? { error: errors.comision.message } : {})}
                >
                  <Entrada
                    inputMode="decimal"
                    placeholder="0.00"
                    className="cifra"
                    {...register('comision')}
                  />
                </Campo>
              )}

              {esServiciosProfesionales && (
                <Campo
                  id="enRepresentacion"
                  etiqueta="¿Realizas la operación en nombre y representación del cliente?"
                  ayuda="El aviso de la fracción XI no depende del monto, sino de este rol."
                  requerido
                >
                  <Selector {...register('enRepresentacion')}>
                    <option value="">Aún no lo sé</option>
                    <option value="si">Sí, yo ejecuto la operación financiera</option>
                    <option value="no">No, sólo asesoro o preparo documentos</option>
                  </Selector>
                </Campo>
              )}

              {esTraslado && (
                <Campo
                  id="montoIndeterminable"
                  etiqueta="¿Se puede determinar el monto trasladado o custodiado?"
                  ayuda="Cuando no se puede determinar, el aviso procede en todos los casos."
                  requerido
                >
                  <Selector {...register('montoIndeterminable')}>
                    <option value="">Aún no lo sé</option>
                    <option value="no">Sí, el monto es determinable</option>
                    <option value="si">No, el monto no se puede determinar</option>
                  </Selector>
                </Campo>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Boton type="submit" variante="accion">
                <Calculator aria-hidden />
                Calcular
              </Boton>
              <p className="text-sm text-[var(--color-tinta-tenue)]">
                El cálculo ocurre en tu navegador. Nada se envía a un servidor.
              </p>
            </div>
          </form>
        </TarjetaCuerpo>
      </Tarjeta>

      {errorMotor && (
        <Nota tono="atencion" titulo="No pudimos calcular con esos datos">
          <p>{errorMotor}</p>
        </Nota>
      )}

      {resultado && (
        <section aria-live="polite" aria-labelledby="resultado-umbral">
          <EncabezadoImpresion titulo="Cálculo de umbrales" />
          <h2 id="resultado-umbral" className="sr-only">
            Resultado del cálculo
          </h2>
          <TarjetaEvaluacion resultado={resultado} />
          <AccionesResultado
            nombreArchivo="umbrales-leyantilavado"
            datos={resultado}
            conEnlace
            claveGuardado="calculadora-umbrales"
          />
        </section>
      )}
    </div>
  );
}
