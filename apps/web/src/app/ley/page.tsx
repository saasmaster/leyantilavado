import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Insignia } from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  JsonLd,
  Migas,
  Seccion,
} from '@/components/contenido';
import { ARTICULOS, CON_PAGINA, LEY_PUBLICADA_EN, PRECEPTOS, REFORMA_VIGENTE, porDivision, sumilla } from '@/content/ley';
import { EQUIPO_EDITORIAL } from '@/content/autores';
import { FUENTE_LEY } from '@/content/ley-texto.generado';
import { SITIO, construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';

const RUTA = '/ley';

export const metadata: Metadata = construirMetadata({
  titulo: 'LFPIORPI artículo por artículo: texto vigente',
  descripcion:
    'Índice de la Ley Antilavado (LFPIORPI) con sus 73 preceptos por capítulo, cuáles tocó la reforma de 2025 y el texto oficial de los artículos clave.',
  ruta: RUTA,
  publicadoEn: LEY_PUBLICADA_EN,
  actualizadoEn: LEY_PUBLICADA_EN,
});

const tocados = PRECEPTOS.filter((p) => p.reformas.includes('16-07-2025')).length;
const fechaReforma = REFORMA_VIGENTE.split('-').reverse().join('-');

export default function PaginaLey() {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'LFPIORPI', ruta: RUTA },
  ];

  return (
    <div className="contenedor-app py-10 md:py-14">
      <JsonLd
        datos={[
          jsonLdMigaDePan(migas),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': `${SITIO.url}${RUTA}`,
            name: 'LFPIORPI artículo por artículo',
            inLanguage: 'es-MX',
            about: {
              '@type': 'Legislation',
              name: 'Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita',
              alternateName: 'LFPIORPI',
              legislationJurisdiction: 'MX',
              url: FUENTE_LEY,
            },
            // Sólo se listan los que tienen página propia: un ItemList que
            // apunta a anclas de esta misma página no describe nada nuevo.
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: ARTICULOS.length,
              itemListElement: ARTICULOS.map((a, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: a.titulo,
                url: `${SITIO.url}${RUTA}/${a.slug}`,
              })),
            },
          },
        ]}
      />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo="LFPIORPI artículo por artículo"
        etiquetas={[{ texto: `Reforma DOF ${fechaReforma}`, tono: 'petroleo' }]}
        respuestaDirecta={`La Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita tiene ${PRECEPTOS.length} preceptos —65 artículos numerados más sus Bis, Ter y Quáter—. La reforma publicada en el DOF el ${fechaReforma} tocó ${tocados} de ellos. Aquí están todos, en el orden de la ley, con el texto oficial de los que más se consultan.`}
        entradilla="Esta es la capa de referencia: qué dice la ley. Para saber qué hacer con ella —si te aplica, cuánto es el umbral, cómo presentar el aviso— están las guías prácticas del sitio, a las que cada artículo te manda."
      />

      <Seccion
        id="clave"
        titulo="Los artículos que más se consultan"
        descripcion="Con su texto vigente, una explicación en español llano y el malentendido que más se repite."
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {ARTICULOS.map((a) => (
            <li key={a.slug}>
              <Link
                href={`${RUTA}/${a.slug}`}
                className="group flex h-full flex-col rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-superficie)] p-4 transition-colors hover:border-[var(--color-petroleo)]"
              >
                <span className="font-semibold text-[var(--color-tinta)] group-hover:text-[var(--color-petroleo-hondo)]">
                  {a.tituloSEO.replace(' LFPIORPI', '')}
                </span>
                <span className="mt-1 text-sm text-[var(--color-tinta-suave)]">{a.confusion.titulo}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-petroleo-hondo)]">
                  Leer el artículo
                  <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion
        id="indice"
        titulo="Índice completo"
        descripcion="Cada renglón muestra las primeras palabras del texto vigente, sin resumir. La etiqueta indica los preceptos que la reforma de 2025 reformó o adicionó."
      >
        <div className="space-y-10">
          {porDivision().map((g) => (
            <section key={g.division} aria-labelledby={`div-${g.division}`}>
              <h3 id={`div-${g.division}`} className="text-lg font-semibold">
                {g.division}
                <span className="font-normal text-[var(--color-tinta-suave)]"> · {g.rubro}</span>
              </h3>
              <ol className="mt-3 divide-y divide-[var(--color-borde)] border-y border-[var(--color-borde)]">
                {g.preceptos.map((p) => {
                  const enlazado = CON_PAGINA.has(p.slug);
                  return (
                    <li key={p.slug} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
                      <span className="cifra w-28 shrink-0 font-semibold">
                        {enlazado ? (
                          <Link
                            href={`${RUTA}/${p.slug}`}
                            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                          >
                            Art. {p.id}
                          </Link>
                        ) : (
                          <span className="text-[var(--color-tinta)]">Art. {p.id}</span>
                        )}
                      </span>
                      <span className="flex-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                        {sumilla(p)}
                      </span>
                      {p.reformas.includes('16-07-2025') && (
                        <span className="shrink-0">
                          <Insignia tono="ambar">Reforma 2025</Insignia>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Aplicar la ley',
            enlaces: [
              { etiqueta: 'Actividades vulnerables', href: '/actividades-vulnerables' },
              { etiqueta: 'Umbrales', href: '/umbrales' },
              { etiqueta: 'Obligaciones', href: '/obligaciones' },
            ],
          },
          {
            titulo: 'La normativa secundaria',
            enlaces: [
              { etiqueta: 'Acuerdo 115/2026', href: '/acuerdo-115-2026', descripcion: 'Las reglas de carácter general' },
              { etiqueta: 'Qué cambió con la reforma', href: '/reforma-ley-antilavado-2026' },
              { etiqueta: 'Fuentes oficiales', href: '/fuentes-oficiales' },
            ],
          },
          {
            titulo: 'Entender los términos',
            enlaces: [
              { etiqueta: 'Glosario', href: '/glosario' },
              { etiqueta: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
            ],
          },
        ]}
      />

      <FirmaEditorial
        firma={{ autor: EQUIPO_EDITORIAL, publicadoEn: LEY_PUBLICADA_EN, actualizadoEn: LEY_PUBLICADA_EN }}
      />
      <AvisoLegal />
    </div>
  );
}
