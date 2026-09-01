import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, FileText } from 'lucide-react';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Insignia, Nota, SelloProcedencia } from '@leyantilavado/ui';
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
import { ETIQUETA_CATEGORIA, ETIQUETA_RECURRENCIA } from '@/components/contenido/categorias';
import { MODIFICADO_EN, PUBLICADO_DESDE, REVISION_VIGENTE } from '@/content/autores';
import { CONTENIDO_OBLIGACIONES } from '@/content/obligaciones';
import { construirMetadata, jsonLdFAQ, jsonLdMigaDePan } from '@/lib/sitio';

const BASE = '/obligaciones';

/**
 * Sin parámetros dinámicos: los slugs válidos son las obligaciones del corpus legal y no cambian entre
 * despliegues.
 *
 * Sin esto Next acepta CUALQUIER slug, lo renderiza bajo demanda, obtiene la
 * vista de «no encontrado» y la sirve con HTTP 200 — un soft 404. El `noindex`
 * evitaba que se indexara, pero el rastreador gastaba presupuesto creyendo que
 * la página existe. Con `false` el enrutador devuelve un 404 real sin llegar a
 * renderizar.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return datos.OBLIGACIONES.map((o) => ({ slug: o.slug }));
}

function buscar(slug: string) {
  const obligacion = datos.OBLIGACIONES.find((o) => o.slug === slug);
  if (!obligacion) return null;
  const contenido = CONTENIDO_OBLIGACIONES[slug];
  if (!contenido) return null;
  return { obligacion, contenido };
}

// Next 16: `params` es una Promise.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const encontrado = buscar(slug);
  if (!encontrado) {
    return construirMetadata({
      titulo: 'Obligación no encontrada',
      descripcion: 'La obligación solicitada no existe en el catálogo.',
      ruta: `${BASE}/${slug}`,
      noindex: true,
    });
  }
  return construirMetadata({
    titulo: encontrado.contenido.tituloSEO,
    descripcion: encontrado.contenido.descripcionSEO,
    ruta: `${BASE}/${slug}`,
    tipo: 'article',
    publicadoEn: PUBLICADO_DESDE,
    actualizadoEn: MODIFICADO_EN,
  });
}

export default async function PaginaObligacion({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const encontrado = buscar(slug);
  if (!encontrado) notFound();

  const { obligacion, contenido } = encontrado;
  const ruta = `${BASE}/${slug}`;

  const hitos = datos.CALENDARIO.filter((h) => h.obligaciones.includes(slug));
  const pendientes = datos.PENDIENTES_SIN_FECHA.filter((p) =>
    (p.obligaciones as readonly string[]).includes(slug),
  );
  const otras = datos.OBLIGACIONES.filter(
    (o) => o.slug !== slug && o.categoria === obligacion.categoria,
  ).slice(0, 4);

  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Obligaciones', ruta: BASE },
    { nombre: obligacion.titulo, ruta },
  ];

  const indice = [
    { id: 'a-quien-aplica', titulo: 'A quién aplica' },
    { id: 'pasos', titulo: 'Pasos accionables' },
    { id: 'evidencia', titulo: 'La evidencia que espera un auditor' },
    { id: 'errores', titulo: 'Errores comunes' },
    ...(hitos.length > 0 || pendientes.length > 0
      ? [{ id: 'fechas', titulo: 'Fechas que la afectan' }]
      : []),
    { id: 'preguntas', titulo: 'Preguntas frecuentes' },
  ];

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: contenido.tituloSEO,
          descripcion: contenido.descripcionSEO,
          ruta,
          publicadoEn: PUBLICADO_DESDE,
          actualizadoEn: MODIFICADO_EN,
          seccion: 'Obligaciones',
        })}
      />
      <JsonLd datos={jsonLdFAQ(contenido.faq.map((f) => ({ ...f })))} />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo={obligacion.titulo}
        etiquetas={[
          { texto: ETIQUETA_CATEGORIA[obligacion.categoria], tono: 'marino' },
          { texto: obligacion.procedencia.disposicion, tono: 'petroleo' },
          ...(obligacion.recurrencia
            ? ([
                {
                  texto: ETIQUETA_RECURRENCIA[obligacion.recurrencia] ?? obligacion.recurrencia,
                  tono: 'neutro',
                },
              ] as const)
            : []),
        ]}
        entradilla={obligacion.resumen}
        respuestaDirecta={contenido.respuestaDirecta}
      />

      <IndiceContenidos entradas={indice} />

      <Seccion id="a-quien-aplica" titulo="A quién aplica">
        <ListaConVinetas items={contenido.aQuienAplica} />
      </Seccion>

      <Seccion
        id="pasos"
        titulo="Pasos accionables"
        descripcion="La secuencia mínima. Cada paso indica, cuando existe, el documento que lo acredita."
      >
        <ol className="flex flex-col gap-4">
          {obligacion.pasos.map((p, i) => (
            <li
              key={p.id}
              className="flex gap-4 rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <span
                aria-hidden
                className="cifra flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-marino-tenue)] font-semibold text-[var(--color-marino)]"
              >
                {i + 1}
              </span>
              <div>
                <p className="leading-relaxed text-[var(--color-tinta)]">{p.texto}</p>
                {p.evidencia && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-tinta-suave)]">
                    <FileText aria-hidden className="size-4 shrink-0" />
                    Evidencia: {p.evidencia}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Seccion>

      <Seccion
        id="evidencia"
        titulo="La evidencia que espera un auditor"
        descripcion="Cumplir sin poder demostrarlo equivale, en una revisión, a no cumplir."
      >
        <ul className="flex flex-col gap-3">
          {contenido.evidenciaEsperada.map((e) => (
            <li
              key={e}
              className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-4"
            >
              <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-[var(--color-verde)]" />
              <span className="leading-relaxed text-[var(--color-tinta)]">{e}</span>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion
        id="errores"
        titulo="Errores comunes"
        descripcion="Los que aparecen una y otra vez en revisiones y dictámenes."
      >
        <ListaConVinetas items={contenido.erroresComunes} tono="negativo" />

        <Nota tono="riesgo" className="mt-5" titulo="Qué cuesta incumplir">
          <p>
            Incumplir cualquiera de las obligaciones del art. 18 es infracción del art. 53,
            fracción II, sancionada conforme al art. 54.{' '}
            <Link href="/multas">Consulta los rangos y los escenarios de autocorrección</Link>.
          </p>
        </Nota>
      </Seccion>

      {(hitos.length > 0 || pendientes.length > 0) && (
        <Seccion
          id="fechas"
          titulo="Fechas que la afectan"
          descripcion="Tomadas de los transitorios del Acuerdo 115/2026."
        >
          <ul className="flex flex-col gap-4">
            {hitos.map((h) => (
              <li
                key={h.id}
                className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <time dateTime={h.fecha} className="cifra font-semibold">
                    {formatearFechaLarga(h.fecha)}
                    {h.fechaFin ? ` — ${formatearFechaLarga(h.fechaFin)}` : ''}
                  </time>
                  {!h.confirmadoOficialmente && (
                    <Insignia tono="ambar">Fecha estimada, no publicada</Insignia>
                  )}
                </div>
                <p className="mt-1 font-medium">{h.titulo}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {h.descripcion}
                </p>
              </li>
            ))}
            {pendientes.map((p) => (
              <li
                key={p.id}
                className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-ambar)] bg-[var(--color-ambar-tenue)] p-4"
              >
                <Insignia tono="ambar">Sin fecha cierta</Insignia>
                <p className="mt-2 font-medium">{p.titulo}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {p.descripcion}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <Link
              href="/calendario-cumplimiento"
              className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
            >
              Ver el calendario completo con cuenta regresiva
            </Link>
          </p>
        </Seccion>
      )}

      <Seccion id="preguntas" titulo="Preguntas frecuentes">
        <PreguntasFrecuentes preguntas={contenido.faq} id="lista-preguntas" />
      </Seccion>

      <SelloProcedencia
        className="mt-10"
        procedencia={obligacion.procedencia}
        fuentes={datos.FUENTES_POR_ID}
      />

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Del mismo bloque',
            enlaces: otras.map((o) => ({ href: `${BASE}/${o.slug}`, etiqueta: o.titulo })),
          },
          {
            titulo: 'Herramientas',
            enlaces: [
              { href: '/herramientas/cuestionario', etiqueta: '¿Me aplica la ley?' },
              { href: '/herramientas/fecha-limite-aviso', etiqueta: 'Fecha límite de aviso' },
              { href: '/plantillas', etiqueta: 'Plantillas de cumplimiento' },
            ],
          },
          {
            titulo: 'Contenido relacionado',
            enlaces: [
              { href: BASE, etiqueta: 'Todas las obligaciones' },
              { href: '/actividades-vulnerables', etiqueta: 'Actividades vulnerables' },
              { href: '/acuerdo-115-2026', etiqueta: 'Acuerdo 115/2026' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
