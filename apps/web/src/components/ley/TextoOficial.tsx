import { Scale } from 'lucide-react';
import type { PreceptoOficial } from '@/content/ley';
import { FUENTE_LEY, REFORMA_VIGENTE } from '@/content/ley-texto.generado';

/**
 * El texto vigente, tal cual lo publica la Cámara de Diputados.
 *
 * Se marca visualmente como cita y no como prosa del sitio porque son cosas
 * distintas y el lector tiene derecho a saber cuál está leyendo: lo de dentro
 * de este bloque no lo escribimos nosotros y no podemos mejorarlo.
 *
 * La fracción se separa del cuerpo —el .doc las trae como «I.\tIdentificar…»—
 * para poder alinearlas en columna. Sin eso, un artículo de once fracciones es
 * un muro de texto donde nadie encuentra la fracción que busca.
 */

/** «I.», «IV Bis.», «XII.» al inicio de un párrafo del DOF. */
const FRACCION = /^([IVXL]+(?:\s+Bis|\s+Ter)?)\.\s*\t?\s*/;

export function TextoOficial({ precepto }: { precepto: PreceptoOficial }) {
  const [primero, ...resto] = precepto.parrafos;
  // El primer párrafo abre con «Artículo 18. …»: el número ya está en el H1.
  const encabezado = (primero ?? '').replace(/^Artículo\s+\d+(?:\s+\w+)?\.\s*/, '');

  return (
    <figure className="my-0">
      <blockquote
        cite={FUENTE_LEY}
        className="rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-5 md:p-6"
      >
        {encabezado && <p className="leading-relaxed text-[var(--color-tinta)]">{encabezado}</p>}

        <div className="mt-3 space-y-3">
          {resto.map((parrafo, i) => {
            const m = FRACCION.exec(parrafo);
            if (!m) {
              return (
                <p key={i} className="leading-relaxed text-[var(--color-tinta)]">
                  {parrafo}
                </p>
              );
            }
            return (
              <p key={i} className="flex gap-2 leading-relaxed text-[var(--color-tinta)] sm:gap-3">
                {/* Mínimo, no ancho fijo: en móvil un «IV Bis.» se come la columna del texto. */}
                <span className="cifra min-w-9 shrink-0 font-semibold text-[var(--color-petroleo-hondo)] sm:min-w-14">
                  {m[1]}.
                </span>
                <span>{parrafo.slice(m[0].length)}</span>
              </p>
            );
          })}
        </div>
      </blockquote>

      <figcaption className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-tinta-tenue)]">
        <Scale aria-hidden className="size-3.5" />
        <span>
          Texto vigente del artículo {precepto.id} de la LFPIORPI, con la última reforma publicada
          en el DOF el {REFORMA_VIGENTE.split('-').reverse().join('-')}.
        </span>
        <a
          href={FUENTE_LEY}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-[var(--color-petroleo-hondo)]"
        >
          Ver el documento oficial
        </a>
      </figcaption>
    </figure>
  );
}
