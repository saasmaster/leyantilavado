import Link from 'next/link';
import { ArrowRight, Calculator, FileCheck2, ShieldQuestion } from 'lucide-react';
import { formatearMXN } from '@leyantilavado/types';
import { VERSION_LEGAL, datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Boton } from '@leyantilavado/ui';
import { REVISION_VIGENTE } from './comun';

/**
 * Portada — bloque 1.
 *
 * Sin fotografía. Se probó una imagen editorial de escritorio y el encuadre
 * nunca funcionó: con `object-cover` en una caja más apaisada que el original,
 * el recorte se comía el motivo en unas medidas y lo descentraba en otras, y
 * una foto de ambiente no dice nada que el titular no diga mejor.
 *
 * Lo que sí comunica es la tarjeta de datos: la UMA vigente, cuántas reglas
 * hay cargadas y con qué versión del corpus se calcula. Eso es específico de
 * este producto y ninguna fotografía de banco lo sustituye.
 */

const UMA = datos.UMA_VIGENTE_MAS_RECIENTE;

export function Hero() {
  return (
    <section
      aria-labelledby="hero-titulo"
      className="relative isolate overflow-clip border-b border-[var(--color-borde)]"
    >
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
            Marco legal revisado al {formatearFechaLarga(REVISION_VIGENTE)}
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
            salen del motor jurídico.

            El margen superior negativo se fue con la fotografía: existía para
            que la tarjeta cabalgara sobre la imagen. Sin ella sólo empujaba la
            tarjeta fuera de la línea del titular. */}
        <div className="tarjeta tarjeta-elevada relative bg-[var(--color-superficie)] p-6 md:p-7">
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
