import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import type { Actividad } from '@leyantilavado/types';
import { Insignia, Nota, Tarjeta, TarjetaCuerpo, TablaEnvoltura } from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  Migas,
  PreguntasFrecuentes,
  Seccion,
  UmbralVista,
  describirUmbral,
} from '@/components/contenido';
import { jsonLdArticulo } from '@/components/contenido/JsonLd';
import { RetratoOficio } from '@/components/contenido/RetratoOficio';
import { MODIFICADO_EN, PUBLICADO_DESDE, REVISION_VIGENTE } from '@/content/autores';
import { CAMBIOS_TRANSVERSALES, cambiosPropios } from '@/content/cambios-por-actividad';
import { CASOS_POR_SLUG } from '@/content/casos-practicos';
import { OFICIOS, OFICIOS_POR_SLUG, type ActividadDeOficio, type Oficio } from '@/content/oficios';
import { HERRAMIENTAS_POR_SLUG, rutaHerramienta } from '@/lib/herramientas/catalogo';
import { construirMetadata, jsonLdFAQ, jsonLdMigaDePan } from '@/lib/sitio';

const BASE = '/para';

/**
 * Sin parámetros dinámicos: los oficios son un catálogo cerrado.
 *
 * Sin esto Next acepta CUALQUIER slug, lo renderiza bajo demanda, obtiene la
 * vista de «no encontrado» y la sirve con HTTP 200 — un soft 404 que gasta
 * presupuesto de rastreo. Con `false` el enrutador devuelve un 404 real sin
 * llegar a renderizar.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return OFICIOS.map((o) => ({ oficio: o.slug }));
}

/** El oficio con sus actividades ya resueltas contra el catálogo del motor. */
function resolver(oficio: Oficio) {
  return oficio.actividades
    .map((entrada) => {
      const actividad = datos.ACTIVIDADES_POR_SLUG[entrada.slug];
      return actividad ? { entrada, actividad } : null;
    })
    .filter((x): x is { entrada: ActividadDeOficio; actividad: Actividad } => x !== null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ oficio: string }>;
}): Promise<Metadata> {
  const { oficio: slug } = await params;
  const oficio = OFICIOS_POR_SLUG[slug];
  if (!oficio) {
    return construirMetadata({
      titulo: 'Oficio no encontrado',
      descripcion: 'El oficio solicitado no existe en el índice del sitio.',
      ruta: `${BASE}/${slug}`,
      noindex: true,
    });
  }
  return construirMetadata({
    titulo: oficio.tituloSEO,
    descripcion: oficio.descripcionSEO,
    ruta: `${BASE}/${slug}`,
    tipo: 'article',
    publicadoEn: PUBLICADO_DESDE,
    actualizadoEn: MODIFICADO_EN,
  });
}

/**
 * Tabla de umbrales de una fracción.
 *
 * Se lee del motor, igual que en `/actividades-vulnerables`. Aquí NO se
 * resume a un solo número aunque la fracción tenga varios supuestos: aplanar
 * es justo lo que hace inservible una tabla de oficio.
 */
function UmbralesDeActividad({ actividad }: { actividad: Actividad }) {
  const reglas = datos.UMBRALES.filter((r) => r.actividad === actividad.slug);

  if (reglas.length === 0) {
    return (
      <Nota tono="atencion" className="mt-4" titulo="La autoridad no ha publicado umbrales para este supuesto">
        <p>
          La ley enuncia este apartado sin fijar una cifra y no hay tabla oficial que la
          respalde. No publicamos un número donde no lo hay:{' '}
          <Link href={`/actividades-vulnerables/${actividad.slug}`}>
            así está documentado en la ficha de la fracción
          </Link>
          .
        </p>
      </Nota>
    );
  }

  const nombreSubtipo = (subtipo: string | undefined) =>
    subtipo ? actividad.subtipos?.find((s) => s.slug === subtipo)?.nombre ?? subtipo : '—';

  return (
    <TablaEnvoltura etiqueta={`Umbrales de ${actividad.nombreCorto}`} className="mt-4">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="sr-only">
          Umbrales de identificación y de aviso de {actividad.nombre}, convertidos a pesos con la
          UMA vigente al {REVISION_VIGENTE}.
        </caption>
        <thead className="bg-[var(--color-marfil-hondo)]">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              {reglas.length > 1 ? 'Supuesto' : 'Disposición'}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Identificación
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Aviso
            </th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
              Se mide
            </th>
          </tr>
        </thead>
        <tbody>
          {reglas.map((r) => (
            <tr key={r.id} className="border-t border-[var(--color-borde)] align-top">
              <th scope="row" className="px-4 py-4 font-medium">
                {reglas.length > 1 ? nombreSubtipo(r.subtipo) : actividad.nombreCorto}
                <span className="mt-1 block text-xs font-normal text-[var(--color-tinta-tenue)]">
                  {r.procedencia.disposicion}
                </span>
                {r.estado !== 'publicado' && (
                  <span className="mt-1 inline-block">
                    <Insignia tono="ambar">Requiere revisión editorial</Insignia>
                  </span>
                )}
              </th>
              <td className="px-4 py-4">
                <UmbralVista vista={describirUmbral(r.identificacion, REVISION_VIGENTE)} compacto />
              </td>
              <td className="px-4 py-4">
                <UmbralVista vista={describirUmbral(r.aviso, REVISION_VIGENTE)} compacto />
              </td>
              <td className="px-4 py-4 text-xs capitalize text-[var(--color-tinta-suave)]">
                {r.periodicidad}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TablaEnvoltura>
  );
}

export default async function PaginaOficio({
  params,
}: {
  params: Promise<{ oficio: string }>;
}) {
  const { oficio: slug } = await params;
  const oficio = OFICIOS_POR_SLUG[slug];
  if (!oficio) notFound();

  const ruta = `${BASE}/${slug}`;
  const resueltas = resolver(oficio);
  const nucleo = resueltas.filter((r) => r.entrada.alcance === 'nucleo');
  const segunElCaso = resueltas.filter((r) => r.entrada.alcance === 'segun-el-caso');
  const herramienta = HERRAMIENTAS_POR_SLUG[oficio.herramienta];
  const caso = oficio.caso ? CASOS_POR_SLUG[oficio.caso] : undefined;

  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Por oficio', ruta: BASE },
    { nombre: oficio.nombreCorto, ruta },
  ];

  const indice = [
    { id: 'me-aplica', titulo: '¿Me aplica?' },
    { id: 'umbrales', titulo: 'Los umbrales de tu giro' },
    { id: 'que-cambio', titulo: 'Qué cambió para ti' },
    { id: 'fechas', titulo: 'Fechas que ya corren' },
    ...(herramienta ? [{ id: 'herramienta', titulo: 'La herramienta que te sirve' }] : []),
    ...(caso ? [{ id: 'caso', titulo: 'Un caso de tu gremio' }] : []),
    { id: 'preguntas', titulo: 'Preguntas del gremio' },
  ];

  const fracciones = nucleo.map(({ actividad }) => actividad.fraccion);

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd
        datos={[
          jsonLdMigaDePan(migas),
          jsonLdArticulo({
            titulo: oficio.tituloSEO,
            descripcion: oficio.descripcionSEO,
            ruta,
            publicadoEn: PUBLICADO_DESDE,
            actualizadoEn: MODIFICADO_EN,
            seccion: 'Por oficio',
          }),
          jsonLdFAQ(oficio.faq.map((f) => ({ pregunta: f.pregunta, respuesta: f.respuesta }))),
        ]}
      />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo={oficio.titulo}
        etiquetas={[
          ...fracciones.map((f) => ({ texto: `Art. 17, fracción ${f}`, tono: 'marino' as const })),
          ...(segunElCaso.length > 0
            ? [
                {
                  texto: `${segunElCaso.length} ${segunElCaso.length === 1 ? 'fracción más según tu caso' : 'fracciones más según tu caso'}`,
                  tono: 'ambar' as const,
                },
              ]
            : []),
        ]}
        entradilla={`También lo buscan como ${oficio.tambienBuscado.join(', ')}.`}
        respuestaDirecta={oficio.respuestaDirecta}
      />

      {/* Después del titular y de la respuesta directa, no antes: quien llega
          aquí viene a saber si le aplica la ley, y eso se responde con texto.
          La foto confirma que está en la página de su giro. */}
      <RetratoOficio slug={slug} />

      <IndiceContenidos entradas={indice} />

      {/* ── Canibalización: aquí se dice qué es cada página ───────────────── */}
      <Nota tono="info" titulo="Esta página es la puerta; la ficha jurídica está al lado">
        <p>
          Ésta es la entrada por oficio: te clasifica en tu fracción con el vocabulario de tu
          gremio y te manda a donde está el detalle. La referencia jurídica —el texto de la
          fracción, quién cae y quién no, la procedencia de cada cifra— vive en la ficha de la
          actividad vulnerable, y es la que hay que citar:{' '}
          {nucleo.map(({ actividad }, i) => (
            <span key={actividad.slug}>
              {i > 0 && ' · '}
              <Link href={`/actividades-vulnerables/${actividad.slug}`}>
                {actividad.nombre} (art. 17, fracción {actividad.fraccion})
              </Link>
            </span>
          ))}
          .
        </p>
      </Nota>

      {/* ── ¿Me aplica? ──────────────────────────────────────────────────── */}
      <Seccion
        id="me-aplica"
        titulo="¿Me aplica?"
        descripcion="Las preguntas que de verdad deciden tu caso, en el orden en que conviene hacérselas."
      >
        <ol className="flex flex-col gap-5">
          {oficio.preguntas.map((p, i) => (
            <li
              key={p.pregunta}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
            >
              <h3 className="font-semibold text-[var(--color-tinta)]">
                <span className="cifra mr-2 text-[var(--color-tinta-tenue)]">{i + 1}.</span>
                {p.pregunta}
              </h3>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                    Si la respuesta es sí
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[var(--color-tinta)]">
                    {p.siSi}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                    Si la respuesta es no
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {p.siNo}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>

        <Nota tono="atencion" className="mt-6" titulo="Ninguna respuesta de aquí dice que cumples">
          <p>
            Estas preguntas clasifican tu operación dentro del artículo 17; no evalúan tu programa
            de cumplimiento ni sustituyen una revisión profesional. La conclusión más benigna que
            puede salir de esta página es que un supuesto <em>no parece aplicarte</em>, y siempre
            respecto del acto concreto que estás mirando, no de todo tu negocio.
          </p>
        </Nota>
      </Seccion>

      {/* ── Umbrales ─────────────────────────────────────────────────────── */}
      <Seccion
        id="umbrales"
        titulo="Los umbrales de tu giro"
        descripcion={`Leídos del motor de reglas y convertidos a pesos con la UMA vigente al ${REVISION_VIGENTE}. No están escritos a mano en esta página.`}
      >
        {nucleo.map(({ entrada, actividad }) => (
          <div key={actividad.slug} className="mb-10">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
                {actividad.nombre}
              </h3>
              <Insignia tono="marino">Art. 17, fracción {actividad.fraccion}</Insignia>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
              {entrada.porQue}
            </p>
            <UmbralesDeActividad actividad={actividad} />
            <p className="mt-3 text-sm">
              <Link
                href={`/actividades-vulnerables/${actividad.slug}`}
                className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
              >
                Ficha jurídica de la fracción {actividad.fraccion}: quién cae, quién no y de dónde
                sale cada cifra
              </Link>
            </p>
          </div>
        ))}

        {segunElCaso.length > 0 && (
          <div className="mt-10 rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-ambar)_38%,transparent)] bg-[var(--color-ambar-tenue)] p-5">
            <h3 className="font-semibold text-[var(--color-tinta)]">
              Otras fracciones que podrías estar tocando
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
              No afirmamos que te apliquen: dependen de qué más hace tu negocio, y eso sólo lo
              sabes tú. Lee el supuesto y decide si describe algo que haces.
            </p>
            <ul className="mt-4 flex flex-col gap-4">
              {segunElCaso.map(({ entrada, actividad }) => (
                <li key={actividad.slug}>
                  <p className="font-medium text-[var(--color-tinta)]">
                    {actividad.nombre}{' '}
                    <span className="font-normal text-[var(--color-tinta-tenue)]">
                      · art. 17, fracción {actividad.fraccion}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {entrada.porQue}
                  </p>
                  <p className="mt-1 text-sm">
                    <Link
                      href={`/actividades-vulnerables/${actividad.slug}`}
                      className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                    >
                      Ver los umbrales y el alcance de esta fracción
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-sm text-[var(--color-tinta-tenue)]">
          Recuerda que la UMA entra en vigor el 1 de febrero: una operación de enero se mide con la
          del año anterior. La{' '}
          <Link href="/umbrales" className="underline underline-offset-2">
            tabla completa
          </Link>{' '}
          recalcula con la UMA de cualquier año registrado.
        </p>
      </Seccion>

      {/* ── Qué cambió ───────────────────────────────────────────────────── */}
      <Seccion
        id="que-cambio"
        titulo="Qué cambió para ti"
        descripcion="La reforma de 2025-2026 y el Acuerdo 115/2026, filtrados por tu fracción."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {resueltas.map(({ actividad }) => {
            const propios = cambiosPropios(actividad.slug);
            return (
              <li
                key={actividad.slug}
                className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Insignia tono="marino">Fracción {actividad.fraccion}</Insignia>
                  {propios.length > 0 ? (
                    <Insignia tono="petroleo">
                      {propios.length === 1 ? '1 cambio propio' : `${propios.length} cambios propios`}
                    </Insignia>
                  ) : (
                    <Insignia tono="neutro">Sin cambio de umbral documentado</Insignia>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-[var(--color-tinta)]">
                  {actividad.nombreCorto}
                </h3>
                <p className="mt-2 text-sm">
                  <Link
                    href={`/que-cambio/${actividad.slug}`}
                    className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                  >
                    Ver el antes y el ahora, con su disposición
                  </Link>
                </p>
              </li>
            );
          })}
        </ul>

        <Nota tono="info" className="mt-6" titulo="Y lo que cambió para todos">
          <p>
            Además de lo de tu fracción hay {CAMBIOS_TRANSVERSALES.length} cambios que obligan a
            cualquiera que realice una actividad vulnerable, y el régimen de organización interna
            del <Link href="/acuerdo-115-2026">Acuerdo 115/2026</Link>, que no movió umbrales pero
            sí añadió obligaciones nuevas con plazos escalonados.
          </p>
        </Nota>
      </Seccion>

      {/* ── Fechas ───────────────────────────────────────────────────────── */}
      <Seccion
        id="fechas"
        titulo="Fechas que ya corren"
        descripcion="Del calendario de implementación. Son nominales: no se recorren por días inhábiles salvo que la norma lo diga."
      >
        <TablaEnvoltura etiqueta="Calendario de implementación">
          <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Fechas del calendario de implementación de la reforma y del Acuerdo 115/2026.
            </caption>
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Qué te toca tener listo
                </th>
              </tr>
            </thead>
            <tbody>
              {datos.CALENDARIO.map((h) => (
                <tr key={h.id} className="border-t border-[var(--color-borde)] align-top">
                  <th scope="row" className="whitespace-nowrap px-4 py-4 text-left font-medium">
                    <time dateTime={h.fecha}>{formatearFechaLarga(h.fecha)}</time>
                    {!h.confirmadoOficialmente && (
                      <span className="mt-1 block">
                        <Insignia tono="ambar">Fecha estimada</Insignia>
                      </span>
                    )}
                  </th>
                  <td className="px-4 py-4">
                    <span className="font-medium text-[var(--color-tinta)]">{h.titulo}</span>
                    <span className="mt-1 block text-xs text-[var(--color-tinta-tenue)]">
                      {h.procedencia.disposicion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <p className="mt-4 text-sm">
          El checklist con estas fechas convertido en tareas está en el{' '}
          <Link
            href="/herramientas/plan-30-noviembre"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            plan hacia el 30 de noviembre
          </Link>
          , y el detalle de cada hito en el{' '}
          <Link
            href="/calendario-cumplimiento"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            calendario de cumplimiento
          </Link>
          .
        </p>
      </Seccion>

      {/* ── Herramienta ──────────────────────────────────────────────────── */}
      {herramienta && (
        <Seccion
          id="herramienta"
          titulo="La herramienta que te sirve"
          descripcion="De las del sitio, la que resuelve el cálculo que más se repite en tu giro."
        >
          <Tarjeta>
            <TarjetaCuerpo>
              <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
                {herramienta.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {herramienta.queCalcula}
              </p>
              <p className="mt-4 text-sm">
                <Link
                  href={rutaHerramienta(herramienta.slug)}
                  className="font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                >
                  Abrir {herramienta.titulo.toLowerCase()}
                </Link>
              </p>
              <p className="mt-3 text-xs text-[var(--color-tinta-tenue)]">
                Todo el cálculo corre en tu navegador. No mandamos montos ni datos de clientes a
                ningún servidor.
              </p>
            </TarjetaCuerpo>
          </Tarjeta>
          <p className="mt-4 text-sm">
            <Link href="/herramientas" className="underline underline-offset-2">
              Las demás herramientas del sitio
            </Link>
          </p>
        </Seccion>
      )}

      {/* ── Caso práctico ────────────────────────────────────────────────── */}
      {caso && (
        <Seccion
          id="caso"
          titulo="Un caso de tu gremio"
          descripcion="Resuelto con el mismo motor que usan las calculadoras, no escrito a mano."
        >
          <Tarjeta>
            <TarjetaCuerpo>
              <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
                <Link
                  href={`/casos-practicos/${caso.slug}`}
                  className="underline decoration-transparent underline-offset-4 hover:decoration-[var(--color-petroleo)]"
                >
                  {caso.titulo}
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {caso.contexto}
              </p>
              <p className="mt-4 text-sm">
                <Link
                  href={`/casos-practicos/${caso.slug}`}
                  className="font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                >
                  Ver cómo se resuelve
                </Link>
              </p>
            </TarjetaCuerpo>
          </Tarjeta>
          <p className="mt-4 text-sm">
            <Link href="/casos-practicos" className="underline underline-offset-2">
              Los demás casos resueltos
            </Link>
          </p>
        </Seccion>
      )}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <Seccion
        id="preguntas"
        titulo="Preguntas del gremio"
        descripcion="Las que se repiten en este giro, no las genéricas de la ley."
      >
        <PreguntasFrecuentes preguntas={oficio.faq} id="lista-preguntas" />
        <p className="mt-4 text-sm">
          <Link href="/preguntas-frecuentes" className="underline underline-offset-2">
            Las dudas que más se repiten en todo el sitio
          </Link>
        </p>
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Tu fracción, en términos legales',
            enlaces: nucleo.map(({ actividad }) => ({
              href: `/actividades-vulnerables/${actividad.slug}`,
              etiqueta: actividad.nombre,
              descripcion: `La referencia jurídica de la fracción ${actividad.fraccion}: texto, alcance y procedencia de cada cifra`,
            })),
          },
          {
            titulo: 'Qué tienes que hacer',
            enlaces: [
              { href: '/obligaciones', etiqueta: 'Catálogo de obligaciones' },
              { href: '/herramientas/plan-30-noviembre', etiqueta: 'Plan hacia el 30 de noviembre' },
              { href: '/multas', etiqueta: 'Qué pasa si no cumples' },
            ],
          },
          {
            titulo: 'Otros oficios',
            enlaces: [
              { href: BASE, etiqueta: 'Todos los oficios', descripcion: 'Encuentra el tuyo por su nombre' },
              { href: '/actividades-vulnerables', etiqueta: 'Las fracciones del artículo 17' },
              { href: '/glosario', etiqueta: 'Glosario de términos' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
