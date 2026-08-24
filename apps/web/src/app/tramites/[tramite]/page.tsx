import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, CheckCircle2, ExternalLink, FileText } from 'lucide-react';
import { datos } from '@leyantilavado/rules-engine';
import {
  Insignia,
  Nota,
  SelloProcedencia,
  Tarjeta,
  TarjetaCuerpo,
  TablaEnvoltura,
} from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  ListaConVinetas,
  Migas,
  PreguntasFrecuentes,
  Seccion,
} from '@/components/contenido';
import { jsonLdArticulo } from '@/components/contenido/JsonLd';
import { REVISION_VIGENTE } from '@/content/autores';
import { ETIQUETA_BLOQUE, TRAMITES, TRAMITES_POR_SLUG, type Tramite } from '@/content/tramites';
import { SITIO, construirMetadata, jsonLdFAQ, jsonLdMigaDePan } from '@/lib/sitio';

const BASE = '/tramites';

/**
 * Sin parámetros dinámicos: los trámites del padrón son cinco y son los que
 * el SAT publica. Sin esto, Next acepta CUALQUIER slug, renderiza la vista de
 * «no encontrado» y la sirve con HTTP 200 — un soft 404 que ya nos costó una
 * vez presupuesto de rastreo en /obligaciones.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return TRAMITES.map((t) => ({ tramite: t.slug }));
}

/**
 * `HowTo` de schema.org.
 *
 * Vive aquí y no en `lib/sitio.ts` porque es el único sitio del proyecto que
 * lo emite. Sólo se genera cuando los pasos están a la vista en la página:
 * marcado que promete lo que la página no enseña es marcado que Google acaba
 * ignorando, y nosotros acabamos defendiendo.
 */
function jsonLdComoHacerlo(tramite: Tramite, ruta: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${SITIO.url}${ruta}#como-hacerlo`,
    name: tramite.titulo,
    description: tramite.respuestaDirecta,
    inLanguage: 'es-MX',
    totalTime: undefined,
    // El trámite es gratuito en las dos fichas del SAT que lo publican, pero
    // sólo lo afirmamos donde la ficha lo dice, así que no se emite `estimatedCost`.
    supply: tramite.requisitos.map((r) => ({
      '@type': 'HowToSupply',
      name: r,
    })),
    step: tramite.pasos.map((p, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: p.texto,
      text: p.detalle ? `${p.texto} ${p.detalle}` : p.texto,
      url: `${SITIO.url}${ruta}#paso-${i + 1}`,
    })),
  };
}

// Next 16: `params` es una Promise.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tramite: string }>;
}): Promise<Metadata> {
  const { tramite: slug } = await params;
  const tramite = TRAMITES_POR_SLUG[slug];
  if (!tramite) {
    return construirMetadata({
      titulo: 'Trámite no encontrado',
      descripcion: 'El trámite solicitado no existe en este hub.',
      ruta: `${BASE}/${slug}`,
      noindex: true,
    });
  }
  return construirMetadata({
    titulo: tramite.tituloSEO,
    descripcion: tramite.descripcionSEO,
    ruta: `${BASE}/${slug}`,
    tipo: 'article',
    publicadoEn: REVISION_VIGENTE,
    actualizadoEn: REVISION_VIGENTE,
  });
}

export default async function PaginaTramite({ params }: { params: Promise<{ tramite: string }> }) {
  const { tramite: slug } = await params;
  const tramite = TRAMITES_POR_SLUG[slug];
  if (!tramite) notFound();

  const ruta = `${BASE}/${slug}`;
  const relacionados = tramite.relacionados
    .map((s) => TRAMITES_POR_SLUG[s])
    .filter((t): t is Tramite => Boolean(t));

  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Trámites del portal SPPLD', ruta: BASE },
    { nombre: tramite.titulo, ruta },
  ];

  const indice = [
    { id: 'requisitos', titulo: 'Qué necesitas antes de empezar' },
    { id: 'pasos', titulo: 'Los pasos, con su disposición' },
    { id: 'plazos', titulo: 'Plazos' },
    { id: 'huecos', titulo: 'Lo que el SAT no publica' },
    { id: 'errores', titulo: 'Errores comunes' },
    { id: 'fundamento', titulo: 'Fundamento legal' },
    { id: 'preguntas', titulo: 'Preguntas frecuentes' },
    { id: 'fuentes', titulo: 'Fuentes consultadas' },
  ];

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: tramite.tituloSEO,
          descripcion: tramite.descripcionSEO,
          ruta,
          publicadoEn: REVISION_VIGENTE,
          actualizadoEn: REVISION_VIGENTE,
          seccion: 'Trámites',
        })}
      />
      <JsonLd datos={jsonLdComoHacerlo(tramite, ruta)} />
      <JsonLd datos={jsonLdFAQ(tramite.faq.map((f) => ({ ...f })))} />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo={tramite.titulo}
        etiquetas={[
          { texto: ETIQUETA_BLOQUE[tramite.bloque], tono: 'marino' },
          { texto: 'Portal SPPLD del SAT', tono: 'petroleo' },
          {
            texto: `Fuentes consultadas el ${REVISION_VIGENTE}`,
            tono: 'neutro',
          },
        ]}
        entradilla={tramite.entradilla}
        respuestaDirecta={tramite.respuestaDirecta}
      />

      <IndiceContenidos entradas={indice} />

      <Seccion
        id="requisitos"
        titulo="Qué necesitas antes de empezar"
        descripcion="Quién lo presenta, cuándo y con qué en la mano."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Tarjeta className="h-full">
            <TarjetaCuerpo className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                Quién lo presenta
              </h3>
              <p className="leading-relaxed text-[var(--color-tinta)]">{tramite.quienLoPresenta}</p>
            </TarjetaCuerpo>
          </Tarjeta>
          <Tarjeta className="h-full">
            <TarjetaCuerpo className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                Cuándo se presenta
              </h3>
              <p className="leading-relaxed text-[var(--color-tinta)]">
                {tramite.cuandoSePresenta}
              </p>
              <p className="mt-auto pt-2">
                <Insignia tono="petroleo">{tramite.cuandoDisposicion}</Insignia>
              </p>
            </TarjetaCuerpo>
          </Tarjeta>
        </div>

        <h3 className="mt-8 mb-3 text-lg font-semibold">Requisitos</h3>
        <ul className="flex flex-col gap-3">
          {tramite.requisitos.map((r) => (
            <li
              key={r}
              className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-4"
            >
              <CheckCircle2
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-[var(--color-verde)]"
              />
              <span className="leading-relaxed text-[var(--color-tinta)]">{r}</span>
            </li>
          ))}
        </ul>

        {tramite.documentoQueObtienes && (
          <Nota tono="info" className="mt-5" titulo="Documento que obtienes">
            <p>
              {tramite.documentoQueObtienes}. Descárgalo y archívalo: es lo único que acredita la
              fecha y el folio del trámite ante una revisión.
            </p>
          </Nota>
        )}
      </Seccion>

      <Seccion
        id="pasos"
        titulo="Los pasos, con su disposición"
        descripcion="Cada paso indica de qué texto oficial sale. Ninguno se dedujo del sentido común."
      >
        <ol className="flex flex-col gap-4">
          {tramite.pasos.map((p, i) => (
            <li
              key={p.texto}
              id={`paso-${i + 1}`}
              className="flex scroll-mt-24 gap-4 rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <span
                aria-hidden
                className="cifra flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-marino-tenue)] font-semibold text-[var(--color-marino)]"
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-2">
                <p className="font-medium leading-relaxed text-[var(--color-tinta)]">{p.texto}</p>
                {p.detalle && (
                  <p className="leading-relaxed text-[var(--color-tinta-suave)]">{p.detalle}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-tinta-suave)]">
                  <Insignia tono="petroleo">{p.disposicion}</Insignia>
                  {p.evidencia && (
                    <span className="flex items-center gap-1.5">
                      <FileText aria-hidden className="size-4 shrink-0" />
                      Evidencia: {p.evidencia}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Seccion>

      <Seccion
        id="plazos"
        titulo="Plazos"
        descripcion="En días hábiles salvo que se diga otra cosa, y contados como los cuenta la norma."
      >
        <TablaEnvoltura etiqueta={`Plazos de ${tramite.titulo}`}>
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-marfil-hondo)] text-left">
              <tr>
                <th scope="col" className="p-3 font-semibold">
                  Plazo
                </th>
                <th scope="col" className="p-3 font-semibold">
                  Cuánto
                </th>
                <th scope="col" className="p-3 font-semibold">
                  Desde cuándo
                </th>
                <th scope="col" className="p-3 font-semibold">
                  Disposición
                </th>
              </tr>
            </thead>
            <tbody>
              {tramite.plazos.map((p) => (
                <tr key={p.clave} className="border-t border-[var(--color-borde)] align-top">
                  <th scope="row" className="p-3 text-left font-medium text-[var(--color-tinta)]">
                    {p.etiqueta}
                    {p.nota && (
                      <span className="mt-1 block font-normal text-[var(--color-tinta-suave)]">
                        {p.nota}
                      </span>
                    )}
                  </th>
                  <td className="p-3 font-medium text-[var(--color-tinta)]">{p.valor}</td>
                  <td className="p-3 text-[var(--color-tinta-suave)]">{p.cuentaDesde}</td>
                  <td className="p-3 text-[var(--color-tinta-suave)]">{p.disposicion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <Nota tono="atencion" className="mt-5" titulo="De dónde salen estas cifras">
          <p>
            Los plazos de los trámites del padrón todavía no viven en el motor de reglas de este
            sitio, que hoy modela umbrales, UMA, efectivo y sanciones. Por eso cada uno aparece con
            su disposición a la vista y su fuente al pie, y ninguno se escribió dentro de un
            componente. Cuando suban al motor, esta tabla los leerá de ahí sin cambiar de aspecto.
          </p>
        </Nota>
      </Seccion>

      <Seccion
        id="huecos"
        titulo="Lo que el SAT no publica"
        descripcion="Preferimos decirte dónde se acaba la fuente oficial a rellenarlo por nuestra cuenta."
      >
        <ul className="flex flex-col gap-4">
          {tramite.huecos.map((h) => (
            <li
              key={h.titulo}
              className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-ambar)] bg-[var(--color-ambar-tenue)] p-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-[var(--color-ambar)]"
                />
                <div>
                  <p className="font-semibold text-[var(--color-tinta)]">{h.titulo}</p>
                  <p className="mt-1 leading-relaxed text-[var(--color-tinta-suave)]">
                    {h.descripcion}
                  </p>
                  <p className="mt-2 leading-relaxed text-[var(--color-tinta)]">
                    <strong className="font-semibold">Mientras tanto:</strong> {h.queHacerMientras}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion
        id="errores"
        titulo="Errores comunes"
        descripcion="Los que aparecen una y otra vez en revisiones y en consultas."
      >
        <ListaConVinetas items={tramite.erroresComunes} tono="negativo" />

        <Nota tono="riesgo" className="mt-5" titulo="Qué cuesta incumplir">
          <p>
            El alta, la modificación y la baja del Padrón son la fracción IV Bis del art. 18, y el
            art. 53, fracción II sanciona el incumplimiento de <em>cualquiera</em> de las
            obligaciones de ese artículo, conforme al art. 54.{' '}
            <Link href="/multas">Consulta los rangos y los escenarios de autocorrección</Link>.
          </p>
        </Nota>
      </Seccion>

      <Seccion
        id="fundamento"
        titulo="Fundamento legal"
        descripcion="El texto del que sale cada obligación de esta página."
      >
        <dl className="flex flex-col gap-4">
          {tramite.fundamento.map((f) => (
            <div
              key={f.disposicion}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <dt className="font-semibold text-[var(--color-tinta)]">{f.disposicion}</dt>
              <dd className="mt-1 leading-relaxed text-[var(--color-tinta-suave)]">{f.texto}</dd>
            </div>
          ))}
        </dl>
      </Seccion>

      <Seccion id="preguntas" titulo="Preguntas frecuentes">
        <PreguntasFrecuentes preguntas={tramite.faq} id="lista-preguntas" />
      </Seccion>

      <Seccion
        id="fuentes"
        titulo="Fuentes consultadas"
        descripcion={`Todas se revisaron el ${REVISION_VIGENTE}. Si una fuente no se pudo abrir en su servidor, se dice.`}
      >
        <ul className="flex flex-col gap-4">
          {tramite.fuentes.map((f) => (
            <li
              key={f.url}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <a
                href={f.url}
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="flex items-start gap-2 font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
              >
                <ExternalLink aria-hidden className="mt-1 size-4 shrink-0" />
                <span>
                  {f.etiqueta}
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </span>
              </a>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {f.respalda}
              </p>
              <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">
                Consultada el <time dateTime={f.consultadaEl}>{f.consultadaEl}</time>.
              </p>
              {f.advertencia && (
                <Nota tono="atencion" className="mt-3">
                  <p>{f.advertencia}</p>
                </Nota>
              )}
            </li>
          ))}
        </ul>
      </Seccion>

      <SelloProcedencia
        className="mt-10"
        procedencia={tramite.procedencia}
        fuentes={datos.FUENTES_POR_ID}
      />

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Otros trámites del padrón',
            enlaces: relacionados.map((t) => ({
              href: `${BASE}/${t.slug}`,
              etiqueta: t.titulo,
            })),
          },
          {
            titulo: 'Herramientas',
            enlaces: [
              {
                href: '/herramientas/fecha-limite-aviso',
                etiqueta: 'Fecha límite de aviso',
              },
              {
                href: '/herramientas/plan-30-noviembre',
                etiqueta: 'Plan al 30 de noviembre',
              },
              {
                href: '/herramientas/cuestionario',
                etiqueta: '¿Me aplica la ley?',
              },
            ],
          },
          {
            titulo: 'Contenido relacionado',
            enlaces: [
              {
                href: '/obligaciones/alta-sppld',
                etiqueta: 'La obligación de alta y registro',
              },
              { href: '/obligaciones', etiqueta: 'Todas las obligaciones' },
              { href: '/fuentes-oficiales', etiqueta: 'Fuentes oficiales' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
