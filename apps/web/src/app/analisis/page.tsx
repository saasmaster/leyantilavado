import type { Metadata } from 'next';
import Link from 'next/link';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Insignia } from '@leyantilavado/ui';
import { JsonLd } from '@/components/contenido';
import { EncabezadoPagina } from '@/components/inicio/comun';
import { EstadoPropuesta } from '@/components/analisis/EstadoPropuesta';
import { ANALISIS, ULTIMO_ANALISIS } from '@/content/analisis';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Análisis', ruta: '/analisis' },
];

export const metadata: Metadata = construirMetadata({
  titulo: 'Análisis: reformas explicadas con el texto oficial',
  descripcion:
    'RESICO, IVA del 7 % y la Ley de Economía Digital, leídos en la iniciativa y no en el titular. Qué proponen, qué sigue igual y qué toca a la Ley Antilavado.',
  ruta: '/analisis',
});

/**
 * Portada de la sección de análisis.
 *
 * Una lista, no una rejilla de tarjetas iguales: son textos para leer, y lo
 * que decide cuál abrir es el título y la fecha, no un recuadro.
 */
export default function PaginaAnalisis() {
  const ordenados = [...ANALISIS].sort((a, b) => b.publicadoEn.localeCompare(a.publicadoEn));

  return (
    <>
      <JsonLd datos={jsonLdMigaDePan(MIGA)} />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Análisis"
        entradilla="Qué proponen las reformas, leído en el texto oficial y no en el titular. Cada análisis cita la iniciativa y el artículo, dice qué está aprobado y qué no, y declara lo que el texto deja sin resolver."
        actualizado={formatearFechaLarga(ULTIMO_ANALISIS)}
      />

      <div className="contenedor-app pb-16">
        <EstadoPropuesta className="mt-2" />
        <ol className="mt-8 flex flex-col divide-y divide-[var(--color-borde)] border-y border-[var(--color-borde)]">
          {ordenados.map((a) => (
            <li key={a.slug} className="py-8">
              <p className="cifra text-sm text-[var(--color-tinta-tenue)]">
                {formatearFechaLarga(a.publicadoEn)}
              </p>
              <h2 className="mt-2 max-w-3xl text-xl font-semibold leading-snug text-[var(--color-tinta)] md:text-2xl">
                <Link
                  href={`/analisis/${a.slug}`}
                  className="underline decoration-[var(--color-borde-fuerte)] decoration-1 underline-offset-[5px] transition-colors hover:decoration-current"
                >
                  {a.titulo}
                </Link>
              </h2>
              <p className="prosa mt-3 max-w-3xl text-[var(--color-tinta-suave)]">{a.descripcionSEO}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {a.etiquetas.map((e) => (
                  <Insignia key={e.texto} tono={e.tono ?? 'neutro'}>
                    {e.texto}
                  </Insignia>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
