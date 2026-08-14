import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, TriangleAlert } from 'lucide-react';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Insignia, Nota } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import {
  ACTUALIZACIONES,
  ETIQUETA_TIPO_ACTUALIZACION,
} from '@/content/actualizaciones';
import type { TipoActualizacion } from '@/content/tipos';
import { REVISION_VIGENTE } from '@/content/autores';
import {
  AvisoLegal,
  CabeceraArticulo,
  FirmaEditorial,
  JsonLd,
  Migas,
  jsonLdArticulo,
} from '@/components/contenido';

const RUTA = '/actualizaciones';
const TITULO = 'Actualizaciones normativas';
const DESCRIPCION =
  'Bitácora de cambios del marco de la Ley Antilavado: reformas, reglas de carácter general y valores de UMA, cada una con su fecha e impacto práctico.';

export const metadata: Metadata = construirMetadata({
  titulo: TITULO,
  descripcion: DESCRIPCION,
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: '2026-08-11',
  actualizadoEn: REVISION_VIGENTE,
});

const TONO: Record<TipoActualizacion, 'marino' | 'petroleo' | 'ambar' | 'rojo' | 'verde' | 'neutro'> =
  {
    ley: 'rojo',
    reglamento: 'ambar',
    reglas: 'ambar',
    uma: 'petroleo',
    criterio: 'marino',
    sitio: 'neutro',
  };

export default function Actualizaciones() {
  return (
    <div className="contenedor-app py-10 md:py-14">
      <JsonLd
        datos={[
          jsonLdMigaDePan([
            { nombre: 'Inicio', ruta: '/' },
            { nombre: TITULO, ruta: RUTA },
          ]),
          jsonLdArticulo({
            titulo: TITULO,
            descripcion: DESCRIPCION,
            ruta: RUTA,
            publicadoEn: '2026-08-11',
            actualizadoEn: REVISION_VIGENTE,
            seccion: 'Marco normativo',
          }),
        ]}
      />

      <Migas
        items={[
          { nombre: 'Inicio', ruta: '/' },
          { nombre: TITULO, ruta: RUTA },
        ]}
      />

      <CabeceraArticulo
        titulo={TITULO}
        etiquetas={[{ texto: `${ACTUALIZACIONES.length} entradas`, tono: 'marino' }]}
        respuestaDirecta="Aquí queda registrado cada cambio normativo que afecta al contenido del sitio, con la fecha del hecho —la publicación en el Diario Oficial, no la de nuestra nota—, qué cambia en la práctica para un sujeto obligado y qué páginas se actualizaron por ese cambio."
        entradilla={DESCRIPCION}
      />

      <Nota tono="info" titulo="Cómo usamos esta bitácora">
        <p>
          Una regla que cambia <strong>nunca se sobreescribe</strong>: se cierra su vigencia y se
          abre otra. Así una operación de 2024 se sigue evaluando con la regla de 2024, que es lo
          que la autoridad revisa. Esta página es la cara visible de ese historial.
        </p>
        <p>
          El monitor regulatorio revisa a diario las URLs de las fuentes oficiales y avisa cuando
          cambian, pero <strong>nunca publica una interpretación por su cuenta</strong>: crea un
          borrador que una persona revisa antes de que aparezca aquí.
        </p>
      </Nota>

      <ol className="mt-10 flex flex-col gap-5">
        {ACTUALIZACIONES.map((e) => {
          const fuente = e.fuenteId ? datos.FUENTES_POR_ID[e.fuenteId] : undefined;
          return (
            <li key={e.id} id={e.id} className="tarjeta scroll-mt-24 p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Insignia tono={TONO[e.tipo]}>{ETIQUETA_TIPO_ACTUALIZACION[e.tipo]}</Insignia>
                <time
                  dateTime={e.fecha}
                  className="cifra text-[0.82rem] text-[var(--color-tinta-tenue)]"
                >
                  {formatearFechaLarga(e.fecha)}
                </time>
              </div>

              <h2 className="mt-3 text-[1.15rem] font-semibold text-[var(--color-tinta)]">
                {e.titulo}
              </h2>
              <p className="mt-2 text-[0.925rem] leading-relaxed text-[var(--color-tinta-suave)]">
                {e.resumen}
              </p>

              {e.impacto.length > 0 && (
                <div className="mt-4">
                  <p className="text-[0.78rem] font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                    Qué cambia en la práctica
                  </p>
                  <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-[0.875rem] text-[var(--color-tinta-suave)]">
                    {e.impacto.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}

              {e.requiereRevision && (
                <div className="mt-4 flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-ambar-tenue)] p-3">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--color-ambar)]" />
                  <p className="text-[0.82rem] leading-relaxed text-[var(--color-tinta-suave)]">
                    <strong className="text-[var(--color-tinta)]">Requiere revisión editorial. </strong>
                    {e.requiereRevision}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--color-borde)] pt-3">
                {fuente && (
                  <a
                    href={fuente.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[0.82rem] font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                  >
                    {fuente.nombre}
                    <ArrowUpRight className="size-3" />
                  </a>
                )}
                {e.paginasAfectadas.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="text-[0.82rem] text-[var(--color-tinta-suave)] underline underline-offset-4 transition-opacity hover:opacity-70"
                  >
                    {p.etiqueta}
                  </Link>
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
