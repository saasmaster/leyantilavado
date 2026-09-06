import Link from 'next/link';
import { Calculator, ShieldQuestion } from 'lucide-react';
import { formatearMXN } from '@leyantilavado/types';
import { VERSION_LEGAL, datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Boton } from '@leyantilavado/ui';

/**
 * Portada — bloque 1.
 *
 * ── Sin fotografía, y esta vez por una razón mejor ─────────────────────────
 *
 * Se probó una imagen editorial de escritorio y el encuadre nunca funcionó:
 * con `object-cover` en una caja más apaisada que el original, el recorte se
 * comía el motivo en unas medidas y lo descentraba en otras. Pero el motivo de
 * fondo es otro: una foto de ambiente no dice nada que el titular no diga
 * mejor, y este producto tiene algo que enseñar que ninguna fotografía de banco
 * sustituye.
 *
 * ── Qué hace el panel, y por qué no es un cuadro de mandos ─────────────────
 *
 * La tentación era la plantilla de siempre: número enorme, etiqueta pequeña,
 * tres estadísticas de apoyo y un color de acento. Se descarta, y no por gusto:
 * esa plantilla enseña la CIFRA y esconde lo único que hace fiable a esta
 * cifra, que es de dónde sale y cuándo se comprobó.
 *
 * La lección entera del producto cabe en una frase: un número sin su fecha no
 * sirve. Una operación del 15 de enero de 2026 se mide con la UMA de 2025, no
 * con la de hoy, y quien no lo sabe presenta mal el aviso. Así que el panel se
 * compone como el colofón de una edición jurídica: la cifra y su vigencia son
 * UNA unidad tipográfica, unidas por una regla, no una fila de tabla seguida de
 * otra fila de tabla.
 *
 * Todo sale del motor. Ningún número está escrito aquí.
 */

const UMA = datos.UMA_VIGENTE_MAS_RECIENTE;

/**
 * El hito que de verdad le corre a quien entra hoy.
 *
 * ── Qué había aquí, y por qué se fue ───────────────────────────────────────
 *
 * Un marcador editorial: «20 actividades verificadas · 2 sin publicar» y «41
 * reglas · 1 pendientes». Ya se había reescrito una vez, porque «20 de 22»
 * parecía una contradicción; lo que nunca se preguntó es si esa métrica pinta
 * algo en la portada.
 *
 * No pinta nada. «20» sobre qué, «41» sobre qué: son cuentas internas de la
 * redacción, no información para quien llega. Y el efecto medible era el
 * contrario del buscado: lo primero que leía un visitante nuevo sobre el
 * pliegue era «sin publicar» y «pendientes», de modo que el bloque construido
 * para demostrar rigor terminaba anunciando que el trabajo está a medias.
 *
 * La transparencia no se pierde: vive en /umbrales y en cada ficha de
 * actividad, donde dice QUÉ fracción concreta no tiene cifra publicada y por
 * qué. Ahí es accionable; aquí sólo era defensiva.
 *
 * En su lugar va el dato que le corre a todo el mundo ahora mismo, y sale del
 * calendario ya verificado en vez de escribirse a mano.
 */
const VIGENCIA = datos.CALENDARIO.find((h) => h.id === 'vigencia-general');

/**
 * Lo que el sitio calcula, en cuatro piezas.
 *
 * Era un párrafo de sesenta palabras en el gris más tenue de la paleta —el
 * texto más específico y valioso del pliegue, puesto donde menos se lee—. Los
 * mismos hechos, sin una palabra nueva, en una lista que se recorre de un
 * vistazo.
 */
const LO_QUE_CALCULA = [
  { que: 'Umbrales por actividad', detalle: 'identificación y aviso, fracción por fracción' },
  { que: 'Acumulación de seis meses', detalle: 'la regla antifraccionamiento del art. 17' },
  { que: 'Límites de efectivo', detalle: 'el art. 32, que es prohibición y no umbral' },
  { que: 'Fechas de aviso', detalle: 'el día 17 del mes siguiente, con sus hábiles' },
];

export function Hero() {
  return (
    <section
      aria-labelledby="hero-titulo"
      className="relative isolate overflow-clip border-b border-[var(--color-borde)]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(160deg,var(--color-marfil-hondo)_0%,var(--color-marfil)_45%,var(--color-marino-tenue)_100%)]"
      />

      {/*
       * Pauta reglada, en lugar del círculo desenfocado que había aquí.
       *
       * Aquel borrón de color es el recurso genérico de cualquier landing y no
       * significaba nada. Esto sí: son renglones, el soporte sobre el que se
       * escribe una norma. Van a 32 px —el mismo ritmo vertical del sistema— y
       * se desvanecen con una máscara antes de tocar el texto, así que dan
       * textura sin competir con nada. A 0.5px y en el color del borde, se
       * perciben como papel, no como rejilla de maqueta.
       *
       * Sólo a partir de `lg`. Medido en móvil: ahí el héroe es una columna de
       * texto de borde a borde, los renglones le pasaban POR ENCIMA a la
       * entradilla y dejaban de leerse como soporte para leerse como un fallo
       * de render. Una textura que compite con el texto no es textura.
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden opacity-40 lg:block [background-image:repeating-linear-gradient(to_bottom,var(--color-borde)_0,var(--color-borde)_0.5px,transparent_0.5px,transparent_32px)] [mask-image:linear-gradient(to_bottom,transparent_0,black_22%,black_58%,transparent_100%)]"
      />

      <div className="contenedor-app grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          {/* La pastilla «Marco legal revisado al …» se quitó de aquí porque
              arriba del titular sólo retrasaba la lectura de lo único que la
              portada tiene que decir. La fecha de revisión vive en el panel,
              pegada a la versión del corpus: las dos sólo se entienden juntas. */}
          <h1
            id="hero-titulo"
            className="text-balance text-[2.1rem] font-semibold leading-[1.08] tracking-[-0.032em] text-[var(--color-tinta)] md:text-[3.1rem]"
          >
            Ley Antilavado en México:{' '}
            {/*
             * `block`, no un `span` en línea. En línea, el corte de color caía
             * donde tocara el ajuste de línea —en móvil quedaba «México:
             * descubre» en dos colores dentro del mismo renglón— y eso se lee
             * como un error, no como una decisión. Bloque propio: el color
             * empieza donde empieza la promesa, en cualquier ancho.
             */}
            <span className="block text-[var(--color-petroleo-hondo)]">
              descubre qué te obliga y con qué umbrales
            </span>
          </h1>

          <p className="prosa mt-5 max-w-[46ch] text-[1.15rem] leading-relaxed text-[var(--color-tinta-suave)]">
            Averigua qué te obliga la Ley Antilavado, con la cifra correcta y la fuente a la vista.
          </p>

          {/*
           * La lista sustituye al párrafo denso, y el remate va aparte porque es
           * el hecho que decide si un aviso está bien presentado.
           */}
          <ul className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {LO_QUE_CALCULA.map((item) => (
              <li key={item.que} className="flex gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-[0.55rem] h-px w-3 shrink-0 bg-[var(--color-petroleo)]"
                />
                <span className="text-[0.95rem] leading-snug">
                  <span className="font-medium text-[var(--color-tinta)]">{item.que}</span>
                  <span className="block text-[var(--color-tinta-tenue)]">{item.detalle}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="prosa mt-6 max-w-[52ch] text-[0.98rem] leading-relaxed text-[var(--color-tinta-suave)]">
            Todo se calcula con la UMA vigente{' '}
            <strong className="font-semibold text-[var(--color-tinta)]">
              en la fecha de tu operación
            </strong>
            , no con la de hoy. Y cada conclusión trae su artículo, su fuente oficial y la fecha en
            que la revisamos.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Boton comoHijo variante="accion" tamano="lg">
              <Link href="/herramientas/cuestionario">
                <ShieldQuestion aria-hidden="true" />
                Descubre si te aplica
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

        {/* ── El panel ──────────────────────────────────────────────────────
            Ningún número está escrito aquí: todos salen del motor jurídico. */}
        {/*
         * `section` con nombre accesible, no un `div` suelto.
         *
         * El panel es un bloque de datos autónomo: con `aria-labelledby` se
         * convierte en una región navegable y quien usa lector de pantalla
         * puede saltar a «Datos base del cálculo» en vez de atravesar el héroe
         * entero. Antes era un contenedor anónimo.
         */}
        <section
          aria-labelledby="panel-datos"
          className="tarjeta tarjeta-elevada relative overflow-clip bg-[var(--color-superficie)]"
        >
          {/* Cabecera: esto es una EDICIÓN del corpus, con su número. */}
          <div className="flex items-baseline justify-between gap-4 border-b border-[var(--color-borde)] px-6 py-3.5 md:px-7">
            <p
              id="panel-datos"
              className="text-[0.82rem] font-semibold tracking-[0.01em] text-[var(--color-tinta)]"
            >
              Datos base del cálculo
            </p>
            <p className="cifra text-[0.78rem] text-[var(--color-tinta-tenue)]">
              corpus {VERSION_LEGAL}
            </p>
          </div>

          <div className="px-6 pb-6 pt-6 md:px-7">
            {/*
             * La cifra raíz y su vigencia, como una sola unidad.
             *
             * La regla no es adorno: ata el número a las fechas en las que ese
             * número es cierto. Separarlos en dos filas de tabla es exactamente
             * el error que este sitio existe para corregir.
             */}
            <p className="text-[0.8rem] text-[var(--color-tinta-tenue)]">
              UMA diaria vigente
            </p>
            <p className="cifra mt-1 flex items-baseline gap-2 font-[family-name:var(--font-display)] text-[2.9rem] font-semibold leading-none tracking-[-0.03em] text-[var(--color-tinta)]">
              {formatearMXN(UMA.diariaCentavos)}
              <span className="cifra text-[1rem] font-medium tracking-normal text-[var(--color-tinta-tenue)]">
                {UMA.anio}
              </span>
            </p>
            <div
              aria-hidden="true"
              className="mt-3.5 h-px w-full bg-[linear-gradient(to_right,var(--color-petroleo)_0,var(--color-petroleo)_4.5rem,var(--color-borde)_4.5rem,var(--color-borde)_100%)]"
            />
            {/*
             * `hasta` puede ser nulo: el tipo admite una vigencia abierta, y la
             * habrá el día que el INEGI publique un valor sin fecha de término.
             * Se redacta la frase para ese caso en vez de forzar el tipo, que
             * habría impreso «al null» en la portada.
             */}
            <p className="mt-3 text-[0.85rem] leading-snug text-[var(--color-tinta-suave)]">
              {UMA.vigencia.hasta
                ? `Rige del ${formatearFechaLarga(UMA.vigencia.desde)} al ${formatearFechaLarga(UMA.vigencia.hasta)}.`
                : `Rige desde el ${formatearFechaLarga(UMA.vigencia.desde)}, sin fecha de término publicada.`}{' '}
              Una operación anterior se mide con la UMA de su propio año.
            </p>

            {/*
             * La segunda lectura del panel: qué cambia, y cuándo.
             *
             * Con la UMA arriba, el panel dice el estado de la ley en el tiempo
             * —lo que rige hoy y lo que llega— en vez de puntuarse a sí mismo.
             */}
            {VIGENCIA ? (
              <div className="mt-7 border-t border-[var(--color-borde)] pt-6">
                <p className="text-[0.8rem] text-[var(--color-tinta-tenue)]">Lo siguiente en el calendario</p>
                <p className="mt-1.5 text-[0.98rem] font-medium leading-snug text-[var(--color-tinta)]">
                  {VIGENCIA.titulo}
                </p>
                <p className="cifra mt-1 text-[0.9rem] text-[var(--color-petroleo-hondo)]">
                  {formatearFechaLarga(VIGENCIA.fecha)}
                </p>
                <p className="mt-2.5 text-[0.83rem] leading-relaxed text-[var(--color-tinta-tenue)]">
                  Ese día empieza el marco nuevo, pero no vence todo lo que contiene: los plazos
                  del resto corren escalonados hasta 2029.
                </p>
                <Link
                  href="/exigibilidad"
                  /*
                   * Sin modificador de opacidad sobre el valor arbitrario.
                   *
                   * `decoration-[var(--color-petroleo)]/35` parecía inofensivo y
                   * rompía el color en modo oscuro: medido, el enlace computaba
                   * #0a6f75 —el valor CLARO del token— sobre el panel oscuro,
                   * 2.99:1, por debajo del mínimo de 4.5. Al aplicar el alfa,
                   * Tailwind resuelve la variable contra `:root` y se salta la
                   * redefinición del ámbito oscuro. El subrayado hereda de
                   * `currentColor`, que sí sigue al texto.
                   */
                  className="mt-3 inline-block text-[0.85rem] font-medium text-[var(--color-petroleo)] underline decoration-1 underline-offset-4"
                >
                  Ver qué te es exigible y desde cuándo
                </Link>
              </div>
            ) : null}
          </div>

          {/*
           * Pie del panel: cuándo se miró.
           *
           * Iba en gris de 12 px al final de una lista, y es la promesa entera
           * de este sitio. Aquí abajo, sobre su propio fondo, dice lo que hay
           * que decir: que se comprueba aunque no cambie nada —que es
           * justamente el trabajo que nadie más hace y nadie ve—.
           */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] px-6 py-3.5 md:px-7">
            <p className="text-[0.82rem] text-[var(--color-tinta-suave)]">
              Fuentes revisadas el{' '}
              <span className="font-medium text-[var(--color-tinta)]">
                {formatearFechaLarga(datos.ULTIMA_REVISION)}
              </span>
            </p>
            <p className="text-[0.78rem] text-[var(--color-tinta-tenue)]">
              se comprueban aunque no cambie nada
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
