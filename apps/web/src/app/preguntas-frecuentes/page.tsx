import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Wrench } from 'lucide-react';
import { AvisoIndependencia, Insignia } from '@leyantilavado/ui';
import { construirMetadata, jsonLdFAQ, jsonLdMigaDePan } from '@/lib/sitio';
import { EncabezadoPagina } from '@/components/inicio/comun';
import { CATEGORIAS_FAQ, TOTAL_PREGUNTAS } from '@/content/preguntas-frecuentes';

export const metadata: Metadata = construirMetadata({
  titulo: 'Preguntas frecuentes sobre la Ley Antilavado',
  descripcion:
    'Las dudas que más se repiten sobre la LFPIORPI: si te aplica, umbrales, UMA por fecha, acumulación, avisos del día 17, multas y la reforma 2026.',
  ruta: '/preguntas-frecuentes',
});

const JSON_LD = [
  jsonLdMigaDePan([
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Preguntas frecuentes', ruta: '/preguntas-frecuentes' },
  ]),
  // FAQPage se emite con el MISMO texto que está visible en la página.
  // Marcar contenido que el usuario no puede ver es exactamente lo que
  // Google sanciona.
  jsonLdFAQ(
    CATEGORIAS_FAQ.flatMap((c) =>
      c.preguntas.map((p) => ({ pregunta: p.pregunta, respuesta: p.respuesta.join(' ') })),
    ),
  ),
];

export default function PreguntasFrecuentes() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <EncabezadoPagina
        miga={[
          { nombre: 'Inicio', ruta: '/' },
          { nombre: 'Preguntas frecuentes', ruta: '/preguntas-frecuentes' },
        ]}
        titulo="Las dudas que más se repiten, con el artículo a la vista"
        entradilla={`${TOTAL_PREGUNTAS} respuestas directas sobre la Ley Antilavado. Cada una cita la disposición aplicable para que puedas verificarla, y enlaza la herramienta que resuelve tu caso concreto en lugar de dejarte con la teoría.`}
      />

      <div className="contenedor-app pb-20">
        <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
          {/* ── Índice lateral ─────────────────────────────────────────── */}
          <nav aria-label="Índice de categorías" className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow mb-3">En esta página</p>
            <ul className="flex flex-col gap-1">
              {CATEGORIAS_FAQ.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`#${c.slug}`}
                    className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] px-3 py-2 text-[0.875rem] text-[var(--color-tinta-suave)] transition-colors duration-150 hover:bg-[var(--color-marfil-hondo)] hover:text-[var(--color-tinta)]"
                  >
                    {c.titulo}
                    <span className="cifra text-[0.72rem] text-[var(--color-tinta-tenue)]">
                      {c.preguntas.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Contenido ──────────────────────────────────────────────── */}
          <div className="flex flex-col gap-14">
            {CATEGORIAS_FAQ.map((categoria) => (
              <section key={categoria.slug} id={categoria.slug} className="scroll-mt-24">
                <h2 className="text-(length:--text-seccion)">{categoria.titulo}</h2>
                <p className="mt-2 text-[var(--color-tinta-suave)]">{categoria.descripcion}</p>

                <div className="mt-6 flex flex-col gap-3">
                  {categoria.preguntas.map((p) => (
                    <details
                      key={p.id}
                      id={p.id}
                      className="tarjeta group scroll-mt-24 overflow-hidden"
                    >
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 text-[1rem] font-semibold text-[var(--color-tinta)] [&::-webkit-details-marker]:hidden">
                        {p.pregunta}
                        <span
                          aria-hidden="true"
                          className="mt-1 grid size-5 shrink-0 place-items-center rounded-full border border-[var(--color-borde-fuerte)] text-[var(--color-tinta-tenue)] transition-transform duration-200 group-open:rotate-45"
                        >
                          <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
                            <path
                              d="M6 1v10M1 6h10"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                      </summary>

                      <div className="border-t border-[var(--color-borde)] px-5 pt-4 pb-5">
                        {p.respuesta.map((parrafo, i) => (
                          <p
                            key={i}
                            className="text-[0.925rem] leading-relaxed text-[var(--color-tinta-suave)] [&+&]:mt-3"
                          >
                            {parrafo}
                          </p>
                        ))}

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {p.fundamento && (
                            <Insignia tono="marino">{p.fundamento}</Insignia>
                          )}
                          {p.herramienta && (
                            <Link
                              href={p.herramienta.href}
                              className="inline-flex items-center gap-1.5 rounded-[var(--radius-pastilla)] bg-[var(--color-petroleo-tenue)] px-3 py-1 text-[0.78rem] font-medium text-[var(--color-petroleo-hondo)] transition-opacity duration-150 hover:opacity-80"
                            >
                              <Wrench className="size-3" />
                              {p.herramienta.etiqueta}
                            </Link>
                          )}
                          {p.verMas && (
                            <Link
                              href={p.verMas.href}
                              className="inline-flex items-center gap-1 text-[0.78rem] font-medium text-[var(--color-tinta-suave)] underline underline-offset-4 transition-opacity duration-150 hover:opacity-70"
                            >
                              {p.verMas.etiqueta}
                              <ArrowUpRight className="size-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <AvisoIndependencia />
          </div>
        </div>
      </div>
    </>
  );
}
