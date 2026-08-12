import type { Metadata } from 'next';
import Link from 'next/link';
import { Insignia } from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  JsonLd,
  Migas,
} from '@/components/contenido';
import { jsonLdArticulo, jsonLdConjuntoTerminos } from '@/components/contenido/JsonLd';
import { REVISION_VIGENTE } from '@/content/autores';
import { GLOSARIO_ORDENADO, GLOSARIO_POR_SLUG, INICIALES_GLOSARIO, inicialDe } from '@/content/glosario';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';

const RUTA = '/glosario';

export const metadata: Metadata = construirMetadata({
  titulo: `Glosario de la Ley Antilavado: ${GLOSARIO_ORDENADO.length} términos explicados`,
  descripcion:
    'PLD, EBR, PEP, beneficiario controlador, perfil transaccional y el resto del vocabulario de la LFPIORPI, en español claro y con su disposición.',
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: REVISION_VIGENTE,
  actualizadoEn: REVISION_VIGENTE,
});

export default function PaginaGlosario() {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Glosario', ruta: RUTA },
  ];

  const porInicial = INICIALES_GLOSARIO.map((letra) => ({
    letra,
    terminos: GLOSARIO_ORDENADO.filter((t) => inicialDe(t.termino) === letra),
  }));

  const conMatiz = GLOSARIO_ORDENADO.filter((t) => t.matiz).length;

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: 'Glosario de la Ley Antilavado',
          descripcion: 'Vocabulario de la LFPIORPI explicado en español de México.',
          ruta: RUTA,
          publicadoEn: REVISION_VIGENTE,
          actualizadoEn: REVISION_VIGENTE,
          seccion: 'Glosario',
        })}
      />
      <JsonLd
        datos={jsonLdConjuntoTerminos(
          GLOSARIO_ORDENADO.map((t) => ({
            slug: t.slug,
            termino: t.termino,
            definicion: t.definicion,
          })),
          RUTA,
        )}
      />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo="Glosario de la Ley Antilavado"
        etiquetas={[
          { texto: `${GLOSARIO_ORDENADO.length} términos`, tono: 'marino' },
          { texto: `${conMatiz} con precisión de uso`, tono: 'petroleo' },
          { texto: `Vigente al ${REVISION_VIGENTE}`, tono: 'neutro' },
        ]}
        respuestaDirecta="El vocabulario de esta materia está lleno de siglas y de términos que se usan mal de forma sistemática. Cada entrada de este glosario trae la definición, la disposición donde vive el término y, cuando hace falta, una precisión que corrige el malentendido más común en lugar de repetirlo."
        entradilla="Cada término tiene su propio enlace permanente: puedes citar cualquiera de ellos directamente."
      />

      <nav aria-label="Índice alfabético" className="mb-10">
        <p className="mb-3 text-sm font-semibold">Índice alfabético</p>
        <ul className="flex flex-wrap gap-2">
          {porInicial.map((g) => (
            <li key={g.letra}>
              <a
                href={`#letra-${g.letra}`}
                className="cifra flex size-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-borde-fuerte)] font-semibold text-[var(--color-petroleo-hondo)] hover:bg-[var(--color-marfil-hondo)]"
              >
                {g.letra}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-12">
        {porInicial.map((g) => (
          <section key={g.letra} id={`letra-${g.letra}`} className="scroll-mt-24">
            <h2 className="cifra mb-5 border-b border-[var(--color-borde)] pb-2 text-2xl font-semibold">
              {g.letra}
            </h2>
            <dl className="flex flex-col gap-8">
              {g.terminos.map((t) => (
                <div key={t.slug} id={t.slug} className="scroll-mt-24">
                  <dt className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xl font-semibold text-[var(--color-tinta)]">
                      {t.termino}
                    </span>
                    {t.alterno && (
                      <span className="text-sm text-[var(--color-tinta-tenue)]">{t.alterno}</span>
                    )}
                    <a
                      href={`#${t.slug}`}
                      aria-label={`Enlace permanente a ${t.termino}`}
                      className="text-sm text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                    >
                      #
                    </a>
                  </dt>
                  <dd className="mt-2 flex flex-col gap-3">
                    <p className="prosa leading-relaxed text-[var(--color-tinta-suave)]">
                      {t.definicion}
                    </p>

                    {t.matiz && (
                      <p className="rounded-[var(--radius-card)] border-l-4 border-l-[var(--color-ambar)] bg-[var(--color-ambar-tenue)] p-4 text-sm leading-relaxed">
                        <span className="font-semibold">Precisión: </span>
                        {t.matiz}
                      </p>
                    )}

                    <p className="text-xs text-[var(--color-tinta-tenue)]">{t.disposicion}</p>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {t.relacionados.length > 0 && (
                        <>
                          <span className="text-[var(--color-tinta-tenue)]">Relacionados:</span>
                          {t.relacionados.map((slug) => {
                            const rel = GLOSARIO_POR_SLUG[slug];
                            if (!rel) return null;
                            return (
                              <a
                                key={slug}
                                href={`#${slug}`}
                                className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                              >
                                {rel.termino}
                              </a>
                            );
                          })}
                        </>
                      )}
                      {t.verTambien && (
                        <Link href={t.verTambien.href}>
                          <Insignia tono="petroleo">{t.verTambien.etiqueta}</Insignia>
                        </Link>
                      )}
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Empezar por aquí',
            enlaces: [
              { href: '/actividades-vulnerables', etiqueta: '¿Cuál es mi actividad vulnerable?' },
              { href: '/umbrales', etiqueta: 'Tabla de umbrales' },
              { href: '/obligaciones', etiqueta: 'Qué tengo que hacer' },
            ],
          },
          {
            titulo: 'Herramientas',
            enlaces: [
              { href: '/herramientas/cuestionario', etiqueta: '¿Me aplica la ley?' },
              { href: '/herramientas/calculadora-umbrales', etiqueta: 'Calculadora de umbrales' },
              { href: '/herramientas/beneficiario-controlador', etiqueta: 'Cadena de control' },
            ],
          },
          {
            titulo: 'La reforma',
            enlaces: [
              { href: '/reforma-ley-antilavado-2026', etiqueta: 'Qué cambió' },
              { href: '/acuerdo-115-2026', etiqueta: 'Acuerdo 115/2026' },
              { href: '/calendario-cumplimiento', etiqueta: 'Calendario de fechas' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
