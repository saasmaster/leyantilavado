import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { datos } from '@leyantilavado/rules-engine';
import { Insignia, Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { EncabezadoPagina } from '@/components/inicio/comun';
import { MODIFICADO_EN, PUBLICADO_DESDE, REVISION_VIGENTE } from '@/content/autores';
import { OFICIOS, type Oficio } from '@/content/oficios';
import { construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';

const RUTA = '/para';

export const metadata: Metadata = construirMetadata({
  titulo: 'Ley Antilavado por oficio: encuentra el tuyo',
  descripcion: `${OFICIOS.length} oficios con su fracción del artículo 17, sus umbrales y lo que cambió: notarías, inmobiliarias, joyerías, casas de empeño, despachos y más.`,
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: PUBLICADO_DESDE,
  actualizadoEn: MODIFICADO_EN,
});

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Por oficio', ruta: RUTA },
];

/**
 * Fracciones que toca un oficio como núcleo de su actividad.
 *
 * Se leen del motor a partir del slug: el nombre y el número de fracción no se
 * repiten en el contenido del oficio, para que una renumeración de la ley se
 * absorba en un solo archivo.
 */
function fraccionesNucleo(oficio: Oficio) {
  return oficio.actividades
    .filter((a) => a.alcance === 'nucleo')
    .map((a) => datos.ACTIVIDADES_POR_SLUG[a.slug])
    .filter((a) => a !== undefined);
}

function TarjetaOficio({ oficio }: { oficio: Oficio }) {
  const fracciones = fraccionesNucleo(oficio);
  const extras = oficio.actividades.filter((a) => a.alcance === 'segun-el-caso').length;

  return (
    <Tarjeta className="h-full">
      <TarjetaCuerpo className="flex h-full flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {fracciones.map((a) => (
            <Insignia key={a.slug} tono="marino">
              Fracción {a.fraccion}
            </Insignia>
          ))}
          {extras > 0 && <Insignia tono="ambar">+{extras} según tu caso</Insignia>}
        </div>

        <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
          <Link
            href={`${RUTA}/${oficio.slug}`}
            className="underline decoration-transparent underline-offset-4 hover:decoration-[var(--color-petroleo)]"
          >
            {oficio.titulo}
          </Link>
        </h3>

        <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">{oficio.resumen}</p>

        <p className="text-xs text-[var(--color-tinta-tenue)]">
          También: {oficio.tambienBuscado.join(' · ')}
        </p>

        <p className="mt-auto pt-2 text-sm">
          <Link
            href={`${RUTA}/${oficio.slug}`}
            className="inline-flex items-center gap-1 font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            Ver qué te toca
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        </p>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}

export default function PaginaOficios() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonParaScript(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Ley Antilavado por oficio"
        subtitulo="La misma ley, entrando por el nombre de tu giro"
        entradilla={`La ley se organiza por fracciones del artículo 17 y nadie busca «fracción XII»: busca notaría, joyería, casa de empeño o lote de autos. Estas ${OFICIOS.length} páginas hacen la traducción en un solo paso —te dicen qué fracción te toca, qué umbrales tiene, qué cambió y qué herramienta usar— y después te dejan en la ficha jurídica, que es donde está el detalle y la procedencia de cada cifra.`}
        actualizado={REVISION_VIGENTE}
      />

      <div className="contenedor-app py-12 md:py-16">
        <Nota tono="info" titulo="Qué es esta sección y qué no">
          <p>
            Es una puerta de entrada, no una segunda fuente. Ningún número de estas páginas está
            escrito a mano: los umbrales se leen del motor de reglas, los mismos que alimentan las
            calculadoras y las{' '}
            <Link href="/actividades-vulnerables">fichas de actividad vulnerable</Link>. Cuando
            necesites citar algo —ante un cliente, un auditor o la autoridad— la referencia es la
            ficha de la fracción, con su texto y su procedencia.
          </p>
          <p>
            Un oficio puede tocar más de una fracción, y varias fracciones se reparten entre
            oficios distintos. Por eso cada página dice cuál supuesto es núcleo del giro y cuál
            depende de qué más hagas: lo segundo se plantea como pregunta, no como afirmación.
          </p>
        </Nota>

        <section aria-labelledby="lista-oficios" className="mt-12">
          <h2 id="lista-oficios" className="text-2xl font-semibold text-[var(--color-tinta)]">
            Encuentra tu oficio
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--color-tinta-suave)]">
            Si el tuyo no está, entra por el{' '}
            <Link href="/herramientas/cuestionario" className="underline underline-offset-2">
              diagnóstico guiado
            </Link>{' '}
            o por el{' '}
            <Link href="/actividades-vulnerables" className="underline underline-offset-2">
              catálogo de las {datos.ACTIVIDADES.length} actividades vulnerables
            </Link>
            .
          </p>

          <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {OFICIOS.map((o) => (
              <li key={o.slug}>
                <TarjetaOficio oficio={o} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="no-esta" className="mt-14">
          <h2 id="no-esta" className="text-2xl font-semibold text-[var(--color-tinta)]">
            Si tu giro no aparece
          </h2>
          <div className="prosa mt-3 text-[var(--color-tinta-suave)]">
            <p>
              No publicamos una página de oficio donde no podemos justificar que ese gremio
              realiza una actividad vulnerable concreta. Hay fracciones del artículo 17 que no
              tienen detrás un oficio con nombre propio —emisores de vales y monederos, tarjetas
              prepagadas, cheques de viajero— y otras que la ley enuncia sin que la autoridad haya
              publicado umbrales, como los apartados C y D de la fracción XII. En esos casos la
              página que sirve es la de la fracción, no una inventada por gremio.
            </p>
            <p>
              Que tu oficio no esté en esta lista no significa que la ley no te alcance: significa
              que la clasificación se decide mirando la actividad que realizas, no el letrero del
              negocio. El{' '}
              <Link href="/herramientas/cuestionario">diagnóstico guiado</Link> recorre las
              fracciones contigo y evalúa cada una con el motor.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
