import Link from 'next/link';
import { ArrowRight, Calculator, FileCheck2, ShieldQuestion } from 'lucide-react';
import { formatearMXN } from '@leyantilavado/types';
import { VERSION_LEGAL, datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Boton } from '@leyantilavado/ui';
import { FECHA_HOY } from './comun';

/**
 * Portada — bloque 1.
 *
 * La imagen editorial del hero está pendiente: la generación con Higgsfield
 * falló por falta de créditos en el espacio de trabajo. Mientras tanto el
 * fondo es un degradado construido con los tokens del sistema, no una imagen
 * de banco genérica. Cuando exista la fotografía, entra aquí con `next/image`,
 * `priority`, `sizes` y `alt` descriptivo, sin tocar el resto del bloque.
 */

const UMA = datos.UMA_VIGENTE_MAS_RECIENTE;

export function Hero() {
  return (
    <section
      aria-labelledby="hero-titulo"
      className="relative isolate overflow-clip border-b border-[var(--color-borde)]"
    >
      {/* Fondo: degradado sobrio de marfil a marino tenue. Decorativo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,var(--color-marfil-hondo)_0%,var(--color-marfil)_45%,var(--color-marino-tenue)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 -top-32 -z-10 size-[34rem] rounded-full bg-[var(--color-petroleo-tenue)] opacity-60 blur-3xl"
      />

      <div className="contenedor-app grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--color-borde-fuerte)] bg-[var(--color-superficie)] px-3 py-1.5 text-xs font-medium text-[var(--color-tinta-suave)]">
            Marco legal revisado al {formatearFechaLarga(FECHA_HOY)}
          </p>

          <h1
            id="hero-titulo"
            className="mt-5 text-[2.1rem] font-semibold leading-[1.12] text-[var(--color-tinta)] md:text-[3.1rem]"
          >
            Averigua qué te obliga la Ley Antilavado,
            <span className="text-[var(--color-petroleo-hondo)]"> con la cifra correcta</span> y la
            fuente a la vista.
          </h1>

          <p className="prosa mt-5 text-[1.05rem] text-[var(--color-tinta-suave)]">
            Umbrales por actividad, acumulación de seis meses, límites de efectivo y fechas de
            aviso, calculados con la UMA vigente en la fecha de tu operación —no con la de hoy—.
            Cada conclusión trae el artículo, la fuente oficial y la fecha en que la revisamos.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Boton comoHijo variante="accion" tamano="lg">
              <Link href="/herramientas/cuestionario">
                <ShieldQuestion aria-hidden="true" />
                Descubre si te aplica
                <ArrowRight aria-hidden="true" />
              </Link>
            </Boton>
            <Boton comoHijo variante="contorno" tamano="lg">
              <Link href="/herramientas/calculadora-umbrales">
                <Calculator aria-hidden="true" />
                Calcular umbrales
              </Link>
            </Boton>
          </div>

          <p className="mt-4 text-sm text-[var(--color-tinta-tenue)]">
            Gratis, sin registro. Lo que capturas no se publica ni se indexa.
          </p>
        </div>

        {/* Tarjeta de datos duros. Ningún número está escrito aquí: todos
            salen del motor jurídico. */}
        <div className="tarjeta tarjeta-elevada p-6 md:p-7">
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-tinta)]">
            <FileCheck2 className="size-4 text-[var(--color-petroleo)]" aria-hidden="true" />
            Datos base del cálculo
          </p>
          <dl className="mt-5 flex flex-col divide-y divide-[var(--color-borde)]">
            <div className="flex items-baseline justify-between gap-4 pb-3">
              <dt className="text-sm text-[var(--color-tinta-suave)]">UMA diaria {UMA.anio}</dt>
              <dd className="cifra text-lg font-semibold text-[var(--color-tinta)]">
                {formatearMXN(UMA.diariaCentavos)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-sm text-[var(--color-tinta-suave)]">Vigente desde</dt>
              <dd className="cifra text-sm font-medium text-[var(--color-tinta)]">
                {formatearFechaLarga(UMA.vigencia.desde)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-sm text-[var(--color-tinta-suave)]">
                Actividades vulnerables publicadas
              </dt>
              <dd className="cifra text-sm font-medium text-[var(--color-tinta)]">
                {datos.ACTIVIDADES_PUBLICABLES.length} de {datos.ACTIVIDADES.length}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-sm text-[var(--color-tinta-suave)]">Reglas de umbral vigentes</dt>
              <dd className="cifra text-sm font-medium text-[var(--color-tinta)]">
                {datos.UMBRALES_PUBLICADOS.length}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 pt-3">
              <dt className="text-sm text-[var(--color-tinta-suave)]">Versión del corpus legal</dt>
              <dd className="cifra text-sm font-medium text-[var(--color-tinta)]">
                {VERSION_LEGAL}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-[var(--color-tinta-tenue)]">
            La UMA entra en vigor el 1 de febrero de cada año. Una operación de enero se mide con
            la UMA del año anterior: el motor lo resuelve por ti y te dice qué año aplicó.
          </p>
        </div>
      </div>
    </section>
  );
}
