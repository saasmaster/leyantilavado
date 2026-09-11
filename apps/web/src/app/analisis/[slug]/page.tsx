import type { ComponentType } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
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
import { CuerpoEconomiaDigital } from '@/components/analisis/CuerpoEconomiaDigital';
import { CuerpoIvaSiete } from '@/components/analisis/CuerpoIvaSiete';
import { CuerpoResico2027 } from '@/components/analisis/CuerpoResico2027';
import { ANALISIS, ANALISIS_POR_SLUG } from '@/content/analisis';
import { EQUIPO_EDITORIAL } from '@/content/autores';
import { EstadoPropuesta } from '@/components/analisis/EstadoPropuesta';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';

const BASE = '/analisis';

/**
 * El cuerpo de cada análisis es un componente propio: son textos largos con
 * tablas calculadas, y meterlos en un campo de datos los volvería ilegibles
 * para quien los edite. El registro (`content/analisis`) guarda lo que sí es
 * dato: títulos, fechas, fuentes y el índice.
 */
const CUERPOS: Readonly<Record<string, ComponentType>> = {
  'resico-2027-paquete-economico': CuerpoResico2027,
  'iva-7-por-ciento-resico': CuerpoIvaSiete,
  'ley-economia-digital-efectivo': CuerpoEconomiaDigital,
};

/** Un slug que no existe devuelve un 404 real, no un «no encontrado» con 200. */
export const dynamicParams = false;

export function generateStaticParams() {
  return ANALISIS.map((a) => ({ slug: a.slug }));
}

// Next 16: `params` es una Promise.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = ANALISIS_POR_SLUG[slug];
  if (!a) {
    return construirMetadata({
      titulo: 'Análisis no encontrado',
      descripcion: 'El análisis solicitado no existe.',
      ruta: `${BASE}/${slug}`,
      noindex: true,
    });
  }
  return construirMetadata({
    titulo: a.tituloSEO,
    descripcion: a.descripcionSEO,
    ruta: `${BASE}/${slug}`,
    tipo: 'article',
    publicadoEn: a.publicadoEn,
    actualizadoEn: a.publicadoEn,
  });
}

export default async function PaginaAnalisis({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = ANALISIS_POR_SLUG[slug];
  const Cuerpo = CUERPOS[slug];
  if (!a || !Cuerpo) notFound();

  const ruta = `${BASE}/${a.slug}`;
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Análisis', ruta: BASE },
    { nombre: a.tituloSEO, ruta },
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
            publicadoEn: a.publicadoEn,
            actualizadoEn: a.publicadoEn,
            seccion: 'Análisis',
          }),
        ]}
      />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo={a.titulo}
        etiquetas={a.etiquetas}
        respuestaDirecta={a.respuestaDirecta}
        entradilla={a.entradilla}
      />

      <EstadoPropuesta />

      <IndiceContenidos entradas={[...a.indice, { id: 'fuentes', titulo: 'Fuentes' }]} />

      <Cuerpo />

      <Seccion
        id="fuentes"
        titulo="Fuentes"
        descripcion="Los documentos oficiales de los que sale cada afirmación de este análisis."
      >
        <ul className="flex flex-col divide-y divide-[var(--color-borde)]">
          {a.fuentes.map((f) => (
            <li key={f.url} className="py-3.5">
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1.5 font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
              >
                {f.nombre}
                <ArrowUpRight aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              </a>
              <p className="mt-1 text-sm text-[var(--color-tinta-tenue)]">{f.detalle}</p>
            </li>
          ))}
        </ul>
      </Seccion>

      <EnlacesRelacionados grupos={a.relacionados} />

      <FirmaEditorial
        firma={{ autor: EQUIPO_EDITORIAL, publicadoEn: a.publicadoEn, actualizadoEn: a.publicadoEn }}
      />
      <AvisoLegal />
    </div>
  );
}
