import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calculator, FileCheck2, ShieldQuestion } from 'lucide-react';
import { formatearMXN } from '@leyantilavado/types';
import { VERSION_LEGAL, datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Boton } from '@leyantilavado/ui';
import { FECHA_HOY } from './comun';
import fotoEscritorio from '../../../public/img/hero-escritorio.webp';

/**
 * Portada — bloque 1.
 *
 * La fotografía es decorativa (`alt=""`), así que un lector de pantalla la
 * salta: describirla sólo interrumpiría el camino al titular, que es lo que
 * de verdad comunica.
 *
 * Se importa el archivo en lugar de pasar una ruta en texto para que Next
 * conozca su tamaño en tiempo de compilación y reserve el espacio: sin eso, la
 * imagen empuja el titular al cargar y se dispara el CLS.
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

        {/* Columna derecha: fotografía editorial con la tarjeta de datos
            montada encima en pantallas grandes.

            La foto va DETRÁS y la tarjeta delante con su propio fondo opaco:
            así el texto nunca se lee sobre la imagen y el contraste no depende
            de qué zona de la fotografía quede debajo. */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-borde)] shadow-[var(--shadow-alta)]">
            <Image
              src={fotoEscritorio}
              alt=""
              aria-hidden="true"
              priority
              fetchPriority="high"
              placeholder="blur"
              sizes="(max-width: 1024px) 100vw, 46vw"
              // El motivo (escritorio, carpeta, lentes) vive en la mitad
              // inferior de la fotografía. Con `object-cover` en una caja más
              // apaisada que el original, el recorte por omisión se queda en la
              // pared: `object-bottom` ancla el encuadre donde está el tema.
              className="aspect-[16/10] w-full object-cover object-bottom"
            />
            {/* Velo cálido que integra la foto con la paleta del sitio. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(200deg,transparent_35%,var(--color-marino)_140%)] opacity-30"
            />
          </div>

        {/* Tarjeta de datos duros. Ningún número está escrito aquí: todos
            salen del motor jurídico. */}
        <div className="tarjeta tarjeta-elevada relative mt-[-3.5rem] ml-0 bg-[var(--color-superficie)] p-6 md:ml-8 md:p-7">
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
      </div>
    </section>
  );
}
