import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Nota } from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  Migas,
  Seccion,
  jsonLdArticulo,
} from '@/components/contenido';
import { TextoOficial } from '@/components/ley/TextoOficial';
import { EQUIPO_EDITORIAL } from '@/content/autores';
import { ARTICULOS, ARTICULO_POR_SLUG, LEY_PUBLICADA_EN, PRECEPTO_POR_SLUG } from '@/content/ley';
import { FUENTE_LEY, REFORMA_VIGENTE } from '@/content/ley-texto.generado';
import { SITIO, construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';

const BASE = '/ley';

/** Un slug fuera del catálogo devuelve 404 real, no un 200 con «no existe». */
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICULOS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = ARTICULO_POR_SLUG[slug];
  if (!a) {
    return construirMetadata({
      titulo: 'Artículo no encontrado',
      descripcion: 'El artículo solicitado no existe en este índice.',
      ruta: `${BASE}/${slug}`,
      noindex: true,
    });
  }
  return construirMetadata({
    titulo: a.tituloSEO,
    descripcion: a.descripcionSEO,
    ruta: `${BASE}/${slug}`,
    tipo: 'article',
    publicadoEn: LEY_PUBLICADA_EN,
    actualizadoEn: LEY_PUBLICADA_EN,
  });
}

export default async function PaginaArticulo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = ARTICULO_POR_SLUG[slug];
  const precepto = PRECEPTO_POR_SLUG[slug];
  if (!a || !precepto) notFound();

  const ruta = `${BASE}/${a.slug}`;
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'LFPIORPI', ruta: BASE },
    { nombre: `Artículo ${precepto.id}`, ruta },
  ];

  const indice = [
    { id: 'texto', titulo: 'Texto vigente' },
    { id: 'significa', titulo: 'Qué dice, en palabras simples' },
    ...(a.cambio2025 ? [{ id: 'cambio', titulo: 'Qué cambió con la reforma de 2025' }] : []),
    { id: 'confusion', titulo: 'El malentendido más común' },
  ];

  return (
    <div className="contenedor-app py-10 md:py-14">
      <JsonLd
        datos={[
          jsonLdMigaDePan(migas),
          jsonLdArticulo({
            titulo: a.titulo,
            descripcion: a.descripcionSEO,
            ruta,
            publicadoEn: LEY_PUBLICADA_EN,
            actualizadoEn: LEY_PUBLICADA_EN,
            seccion: 'LFPIORPI',
          }),
          {
            '@context': 'https://schema.org',
            '@type': 'Legislation',
            '@id': `${SITIO.url}${ruta}#precepto`,
            url: `${SITIO.url}${ruta}`,
            name: `Artículo ${precepto.id} de la LFPIORPI`,
            legislationIdentifier: `LFPIORPI art. ${precepto.id}`,
            legislationJurisdiction: 'MX',
            legislationType: 'Ley Federal',
            inLanguage: 'es-MX',
            isPartOf: {
              '@type': 'Legislation',
              name: 'Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita',
              alternateName: 'LFPIORPI',
              url: FUENTE_LEY,
            },
          },
        ]}
      />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo={a.titulo}
        etiquetas={[
          { texto: precepto.division, tono: 'neutro' },
          ...(precepto.reformas.includes('16-07-2025')
            ? [{ texto: 'Tocado por la reforma de 2025', tono: 'ambar' as const }]
            : []),
        ]}
        respuestaDirecta={a.respuestaDirecta}
        entradilla={`${precepto.division} de la LFPIORPI — ${precepto.rubro}.`}
      />

      <IndiceContenidos entradas={indice} />

      <Seccion
        id="texto"
        titulo="Texto vigente"
        descripcion="Reproducido del documento oficial de la Cámara de Diputados. No lo editamos ni lo resumimos: lo que sigue es la ley."
      >
        <TextoOficial precepto={precepto} />
      </Seccion>

      <Seccion id="significa" titulo="Qué dice, en palabras simples">
        <div className="prosa space-y-4">
          {a.explicacion.map((p) => (
            <p key={p} className="leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </Seccion>

      {a.cambio2025 && (
        <Seccion
          id="cambio"
          titulo="Qué cambió con la reforma de 2025"
          descripcion={`El decreto se publicó en el DOF el ${REFORMA_VIGENTE.split('-').reverse().join('-')} y entró en vigor al día siguiente.`}
        >
          <div className="prosa space-y-4">
            {a.cambio2025.map((p) => (
              <p key={p} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </Seccion>
      )}

      <Seccion id="confusion" titulo="El malentendido más común">
        <Nota tono="atencion" titulo={a.confusion.titulo}>
          <p>{a.confusion.texto}</p>
        </Nota>
      </Seccion>

      <EnlacesRelacionados grupos={a.relacionados} />

      <FirmaEditorial
        firma={{ autor: EQUIPO_EDITORIAL, publicadoEn: LEY_PUBLICADA_EN, actualizadoEn: LEY_PUBLICADA_EN }}
      />
      <AvisoLegal />
    </div>
  );
}
