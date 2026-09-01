import Link from 'next/link';
import { ArrowRight, Calculator, FileCheck2, ShieldQuestion } from 'lucide-react';
import { formatearMXN } from '@leyantilavado/types';
import { VERSION_LEGAL, datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Boton } from '@leyantilavado/ui';

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

/**
 * Lo que falta, contado y explicado.
 *
 * «20 de 22» y «36 reglas» invitaban a leer una contradicción donde había un
 * hecho: hay supuestos que la ley enuncia y para los que la autoridad todavía
 * no ha publicado umbral. Decir «verificado» y «sin publicar» por separado
 * cuenta lo mismo sin que parezca que el sitio se desmiente a sí mismo.
 */
const PENDIENTES_ACTIVIDADES = datos.ACTIVIDADES.length - datos.ACTIVIDADES_PUBLICABLES.length;
const PENDIENTES_UMBRALES = datos.UMBRALES.length - datos.UMBRALES_PUBLICADOS.length;

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
          {/* La pastilla con «Marco legal revisado al …» se quitó de aquí
              porque arriba del titular sólo retrasaba la lectura de lo único
              que la portada tiene que decir.

              Al quitarla, la fecha de revisión desapareció de la portada
              ENTERA —este comentario llegó a afirmar que seguía «en la tarjeta
              de datos» cuando ya no estaba—, y la tarjeta se quedó terminando
              en la versión del corpus, que numera el último cambio de DATO y
              por tanto se queda quieta en una revisión sin cambios. Leída
              sola, esa fecha parece un sitio desatendido. Pasó dos veces, la
              segunda con el dueño del sitio.

              Por eso la revisión vuelve abajo, en la tarjeta, pegada a la
              versión: las dos fechas sólo se entienden juntas. */}
          <h1
            id="hero-titulo"
            className="text-[2.1rem] font-semibold leading-[1.12] text-[var(--color-tinta)] md:text-[3.1rem]"
          >
            Ley Antilavado en México:{' '}
            <span className="text-[var(--color-petroleo-hondo)]">
              descubre qué te obliga y con qué umbrales
            </span>
          </h1>

          <p className="prosa mt-4 text-[1.15rem] font-medium text-[var(--color-tinta)]">
            Averigua qué te obliga la Ley Antilavado, con la cifra correcta y la fuente a la vista.
          </p>

          <p className="prosa mt-4 text-[1.05rem] text-[var(--color-tinta-suave)]">
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
                Actividades con umbral verificado
              </dt>
              <dd className="cifra text-sm font-medium text-[var(--color-tinta)]">
                {datos.ACTIVIDADES_PUBLICABLES.length}
                <span className="font-normal text-[var(--color-tinta-tenue)]">
                  {' '}
                  · {PENDIENTES_ACTIVIDADES} sin publicar
                </span>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-sm text-[var(--color-tinta-suave)]">
                Reglas de umbral verificadas
              </dt>
              <dd className="cifra text-sm font-medium text-[var(--color-tinta)]">
                {datos.UMBRALES_PUBLICADOS.length}
                <span className="font-normal text-[var(--color-tinta-tenue)]">
                  {' '}
                  · {PENDIENTES_UMBRALES} pendientes
                </span>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              {/* «Último cambio de dato» no es adorno: sin él, esta fecha
                  convive con la de revisión —posterior— y se lee como un
                  descuido. Fue la primera pregunta de quien lo vio, las dos
                  veces. */}
              <dt className="text-sm text-[var(--color-tinta-suave)]">
                Versión del corpus legal
                <span className="block text-xs text-[var(--color-tinta-tenue)]">
                  Numerada por el último cambio de dato
                </span>
              </dt>
              <dd className="cifra text-sm font-medium text-[var(--color-tinta)]">
                {VERSION_LEGAL}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 pt-3">
              {/* La fila que responde la pregunta que deja la anterior: «vale,
                  el dato no cambió, ¿pero cuándo lo miraste?». Va la última a
                  propósito, para que la tarjeta cierre con la fecha más
                  reciente y no con la más vieja. */}
              <dt className="text-sm text-[var(--color-tinta-suave)]">
                Última revisión de fuentes
                <span className="block text-xs text-[var(--color-tinta-tenue)]">
                  Se comprueban aunque no cambie nada
                </span>
              </dt>
              <dd className="cifra text-sm font-medium text-[var(--color-tinta)]">
                {formatearFechaLarga(datos.ULTIMA_REVISION)}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-[var(--color-tinta-tenue)]">
            Lo pendiente no es un hueco nuestro: son supuestos que la ley enuncia y para los que
            la autoridad todavía no publica una cifra. Se listan igual, diciendo que no la tienen,
            en lugar de rellenarlos con una estimación.
          </p>
        </div>
      </div>
    </section>
  );
}
