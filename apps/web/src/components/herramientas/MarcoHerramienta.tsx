import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { AvisoIndependencia, Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { jsonLdFAQ, jsonLdHerramienta, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';
import { relacionadas, rutaHerramienta } from '@/lib/herramientas/catalogo';
import { EstilosImpresion } from './EstilosImpresion';
import { SelloImpresion } from './SelloImpresion';
import { REVISION_VIGENTE } from '@/content/autores';

export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

interface Props {
  slug: string;
  /** Píxeles que reserva el esqueleto mientras la herramienta suspende. */
  altoReservado?: number;
  titulo: string;
  /** Una o dos frases bajo el título. Se indexa: escríbela para humanos. */
  entradilla: string;
  /** ISO date de la última revisión editorial del contenido de la página. */
  /** Se omite salvo excepción: por omisión, la revisión vigente del corpus. */
  actualizadoEn?: string;
  /** Explicación original: qué resuelve y por qué importa. */
  introduccion: React.ReactNode;
  /** La lógica o fórmula, explicada en palabras. */
  comoCalcula: React.ReactNode;
  /** Ejemplo resuelto con cifras. */
  ejemplo: React.ReactNode;
  faq: PreguntaFrecuente[];
  /** Slugs de otras herramientas a destacar además de las del mismo grupo. */
  tambienVer?: string[];
  /** Enlaces a contenido editorial relacionado. */
  lecturas?: { href: string; etiqueta: string }[];
  /** La herramienta en sí. Va arriba: el usuario vino a calcular. */
  children: React.ReactNode;
}

/**
 * Altura reservada mientras la herramienta suspende, en píxeles.
 *
 * El `fallback` medía 256px fijos para todas, y las herramientas reales van de
 * 463px (cuestionario) a 4307px (matriz de riesgos) en móvil. Cuando el
 * contenido llegaba, todo lo que hay debajo saltaba: en la calculadora de
 * umbrales eso producía un CLS de 0,0687, el único desplazamiento medible de
 * todo el sitio.
 *
 * Los valores salen de medir cada herramienta en producción a 375px, no de
 * estimarlos. Quedan cortos en escritorio, donde las columnas comprimen la
 * altura, pero CLS se puntúa en móvil y ahí es donde el ajuste cuenta.
 */
export function MarcoHerramienta({
  altoReservado = 700,
  slug,
  titulo,
  entradilla,
  actualizadoEn = REVISION_VIGENTE,
  introduccion,
  comoCalcula,
  ejemplo,
  faq,
  tambienVer = [],
  lecturas = [],
  children,
}: Props) {
  const otras = relacionadas(slug, tambienVer);

  return (
    <div className="contenedor-app py-10 md:py-14">
      <EstilosImpresion />
      {/* Sólo aparece en el papel: identifica el documento y su consulta. */}
      <SelloImpresion titulo={titulo} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonParaScript(
            jsonLdMigaDePan([
              { nombre: 'Inicio', ruta: '/' },
              { nombre: 'Herramientas', ruta: '/herramientas' },
              { nombre: titulo, ruta: rutaHerramienta(slug) },
            ]),
          ),
        }}
      />
      {/* Una calculadora no es un artículo. Declararla como `WebApplication`
          es lo que permite que un modelo la reconozca como herramienta al
          resolver «¿existe una calculadora de umbrales de la Ley Antilavado?».
          Va aquí y no en cada página para que las 19 lo hereden sin repetirlo. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonParaScript(
            jsonLdHerramienta({
              nombre: titulo,
              descripcion: entradilla,
              ruta: rutaHerramienta(slug),
            }),
          ),
        }}
      />
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonParaScript(jsonLdFAQ(faq)) }}
        />
      )}

      <nav aria-label="Ruta de navegación" className="no-imprimir mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--color-tinta-tenue)]">
          <li>
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
          </li>
          <ChevronRight aria-hidden className="size-3.5" />
          <li>
            <Link href="/herramientas" className="hover:underline">
              Herramientas
            </Link>
          </li>
          <ChevronRight aria-hidden className="size-3.5" />
          <li aria-current="page" className="text-[var(--color-tinta-suave)]">
            {titulo}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-[var(--color-tinta)] md:text-4xl">{titulo}</h1>
        <p className="mt-3 text-lg leading-relaxed text-[var(--color-tinta-suave)]">{entradilla}</p>
        <p className="mt-3 text-sm text-[var(--color-tinta-tenue)]">
          Contenido revisado el {formatearFechaLarga(actualizadoEn)}. Todo el cálculo ocurre en tu
          navegador: lo que capturas no se envía a ningún servidor ni se indexa.
        </p>
      </header>

      {/* Suspense: las herramientas leen su estado inicial de la URL con
          `useSearchParams`, que en Next exige un límite de suspensión para no
          arrastrar toda la página a renderizado dinámico. */}
      <div className="mt-8">
        <React.Suspense
          fallback={
            <div
              className="animate-pulse rounded-[var(--radius-card)] bg-[var(--color-marfil-hondo)]"
              style={{ minHeight: `${altoReservado}px` }}
              aria-label="Cargando la herramienta"
            />
          }
        >
          {children}
        </React.Suspense>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="no-imprimir">
          <section aria-labelledby="que-resuelve" className="prosa">
            <h2 id="que-resuelve" className="text-2xl font-semibold text-[var(--color-tinta)]">
              Qué resuelve esta herramienta
            </h2>
            {introduccion}
          </section>

          <section aria-labelledby="como-calcula" className="prosa mt-10">
            <h2 id="como-calcula" className="text-2xl font-semibold text-[var(--color-tinta)]">
              Cómo se calcula
            </h2>
            {comoCalcula}
          </section>

          <section aria-labelledby="ejemplo" className="mt-10">
            <h2
              id="ejemplo"
              className="text-2xl font-semibold text-[var(--color-tinta)] font-[family-name:var(--font-display)]"
            >
              Ejemplo resuelto
            </h2>
            <Tarjeta className="mt-4">
              <TarjetaCuerpo className="prosa max-w-none">{ejemplo}</TarjetaCuerpo>
            </Tarjeta>
          </section>

          {faq.length > 0 && (
            <section aria-labelledby="faq" className="mt-10">
              <h2
                id="faq"
                className="text-2xl font-semibold text-[var(--color-tinta)] font-[family-name:var(--font-display)]"
              >
                Preguntas frecuentes
              </h2>
              <dl className="mt-4 flex flex-col gap-4">
                {faq.map((f) => (
                  <div
                    key={f.pregunta}
                    className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
                  >
                    <dt className="font-semibold text-[var(--color-tinta)]">{f.pregunta}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                      {f.respuesta}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <aside className="no-imprimir flex flex-col gap-6">
          {otras.length > 0 && (
            <nav aria-labelledby="otras-herramientas">
              <h2
                id="otras-herramientas"
                className="text-sm font-semibold tracking-wide text-[var(--color-tinta)] uppercase"
              >
                Otras herramientas
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {otras.map((h) => (
                  <li key={h.slug}>
                    <Link
                      href={rutaHerramienta(h.slug)}
                      className="flex flex-col rounded-[var(--radius-control)] border border-[var(--color-borde)] p-3 transition-colors hover:bg-[var(--color-marfil-hondo)]"
                    >
                      <span className="text-sm font-medium text-[var(--color-tinta)]">
                        {h.titulo}
                      </span>
                      <span className="mt-0.5 text-xs text-[var(--color-tinta-tenue)]">
                        {h.resumen}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {lecturas.length > 0 && (
            <nav aria-labelledby="para-leer">
              <h2
                id="para-leer"
                className="text-sm font-semibold tracking-wide text-[var(--color-tinta)] uppercase"
              >
                Para entender el fondo
              </h2>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                {lecturas.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                    >
                      {l.etiqueta}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <Nota tono="info" titulo="¿Prefieres que alguien lo revise contigo?">
            <p>
              El resultado de una herramienta orienta, no sustituye a un profesional. En el
              directorio hay contadores, abogados y auditores que trabajan estos temas.
            </p>
            <Link
              href="/directorio"
              className="mt-3 inline-flex items-center gap-1.5 font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
            >
              Ver el directorio
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Nota>

          <AvisoIndependencia compacto />
        </aside>
      </div>
    </div>
  );
}

/** Encabezado que sólo aparece en el PDF impreso. */
export function EncabezadoImpresion({ titulo }: { titulo: string }) {
  return (
    <div className="solo-imprimir mb-4 border-b border-black pb-2">
      <p className="text-sm font-semibold">{titulo} — LeyAntilavado.org</p>
      <p className="text-xs">
        Documento generado en el navegador del usuario. Orientativo: no sustituye asesoría
        profesional ni constituye constancia de cumplimiento.
      </p>
    </div>
  );
}
