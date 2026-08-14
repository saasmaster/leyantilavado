import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { convertirUMA, datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { formatearMXN } from '@leyantilavado/types';
import { Insignia, Nota } from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  Migas,
  Seccion,
  UmbralVista,
  describirUmbral,
} from '@/components/contenido';
import { jsonLdArticulo } from '@/components/contenido/JsonLd';
import { REVISION_VIGENTE } from '@/content/autores';
import { INSTRUMENTOS } from '@/content/reforma';
import type { CambioReforma } from '@/content/tipos';
import {
  CAMBIOS_TRANSVERSALES,
  bloquesDeActividad,
  cambiosPropios,
} from '@/content/cambios-por-actividad';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';

const BASE = '/que-cambio';

/**
 * Sin parámetros dinámicos: los slugs válidos son las actividades del corpus
 * legal. Sin esto Next renderiza bajo demanda cualquier slug inventado, obtiene
 * la vista de «no encontrado» y la sirve con HTTP 200 — un soft 404 que gasta
 * presupuesto de rastreo. Con `false` el enrutador devuelve un 404 real.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return datos.ACTIVIDADES.map((a) => ({ actividad: a.slug }));
}

const ACUERDO = INSTRUMENTOS.find((i) => i.clave === 'acuerdo-115-2026');

function buscar(slug: string) {
  return datos.ACTIVIDADES.find((a) => a.slug === slug) ?? null;
}

/**
 * El «antes» es la única cifra del sitio escrita a mano, y sólo existe para los
 * supuestos que la reforma documenta: corresponde a umbrales DEROGADOS y el
 * motor sólo guarda reglas con vigencia abierta. Donde no hay dato, se dice.
 */
function textoAntes(cambio: CambioReforma): string {
  if (cambio.antesTexto) return cambio.antesTexto;
  if (cambio.antesUMA === undefined) return 'No documentado';
  const enPesos = convertirUMA(cambio.antesUMA, REVISION_VIGENTE).equivalentePesos;
  return `${cambio.antesUMA.toLocaleString('es-MX')} UMA · ${formatearMXN(enPesos)}`;
}

/** El «después» se lee del motor, así que no puede desincronizarse de la ley. */
function Despues({ cambio }: { cambio: CambioReforma }) {
  if (cambio.despuesTexto) {
    return <p className="text-sm text-[var(--color-tinta)]">{cambio.despuesTexto}</p>;
  }
  const regla = cambio.reglaId ? datos.UMBRALES.find((u) => u.id === cambio.reglaId) : undefined;
  if (!regla || !cambio.campo) {
    return <Insignia tono="ambar">Requiere revisión editorial</Insignia>;
  }
  return <UmbralVista vista={describirUmbral(regla[cambio.campo], REVISION_VIGENTE)} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ actividad: string }>;
}): Promise<Metadata> {
  const { actividad: slug } = await params;
  const actividad = buscar(slug);
  if (!actividad) {
    return construirMetadata({
      titulo: 'Actividad no encontrada',
      descripcion: 'La actividad vulnerable solicitada no existe en el catálogo.',
      ruta: `${BASE}/${slug}`,
      noindex: true,
    });
  }
  const propios = cambiosPropios(actividad.slug);
  return construirMetadata({
    titulo: `Qué cambió con la reforma para ${actividad.nombreCorto.toLowerCase()}`,
    descripcion:
      propios.length > 0
        ? `Los ${propios.length} cambios de la reforma 2025-2026 que tocan la fracción ${actividad.fraccion}, con su antes, su ahora y su fundamento.`
        : `La fracción ${actividad.fraccion} no tiene cambios de umbral documentados. Qué le aplica de la reforma 2025-2026 y con qué fundamento.`,
    ruta: `${BASE}/${slug}`,
    tipo: 'article',
    publicadoEn: REVISION_VIGENTE,
    actualizadoEn: REVISION_VIGENTE,
  });
}

export default async function PaginaCambiosActividad({
  params,
}: {
  params: Promise<{ actividad: string }>;
}) {
  const { actividad: slug } = await params;
  const actividad = buscar(slug);
  if (!actividad) notFound();

  const ruta = `${BASE}/${slug}`;
  const propios = cambiosPropios(actividad.slug);
  const bloques = bloquesDeActividad(actividad.slug);

  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Qué cambió para mi actividad', ruta: BASE },
    { nombre: actividad.nombreCorto, ruta },
  ];

  const titulo = `Qué cambió para ${actividad.nombreCorto.toLowerCase()}`;
  const descripcion =
    propios.length > 0
      ? `Los cambios de la reforma 2025-2026 atribuibles a la fracción ${actividad.fraccion}, más los que alcanzan a todo sujeto obligado.`
      : `Qué le aplica de la reforma 2025-2026 a la fracción ${actividad.fraccion}, y qué no hemos podido documentar.`;

  const indice = [
    { id: 'tu-fraccion', titulo: 'Cambios de tu fracción' },
    { id: 'para-todos', titulo: 'Cambios que aplican a todos' },
    { id: 'obligaciones-nuevas', titulo: 'Obligaciones nuevas que te tocan' },
  ];

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd
        datos={[
          jsonLdMigaDePan(migas),
          jsonLdArticulo({
            titulo,
            descripcion,
            ruta,
            publicadoEn: REVISION_VIGENTE,
            actualizadoEn: REVISION_VIGENTE,
            seccion: 'Marco normativo',
          }),
        ]}
      />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo={titulo}
        etiquetas={[
          { texto: `Art. 17, fracción ${actividad.fraccion}`, tono: 'marino' },
          propios.length > 0
            ? { texto: `${propios.length} cambios propios`, tono: 'petroleo' as const }
            : { texto: 'Sin cambio de umbral documentado', tono: 'neutro' as const },
          { texto: `${CAMBIOS_TRANSVERSALES.length} cambios para todos`, tono: 'ambar' },
        ]}
        entradilla={descripcion}
        respuestaDirecta={
          propios.length > 0
            ? `La reforma trae ${propios.length === 1 ? 'un cambio atribuible' : `${propios.length} cambios atribuibles`} a ${actividad.nombre} (art. 17, fracción ${actividad.fraccion}), cada uno con su disposición a la vista. Además le aplican los ${CAMBIOS_TRANSVERSALES.length} cambios que obligan a todo sujeto obligado, y el régimen de organización interna del Acuerdo 115/2026.`
            : `No hemos documentado cambios de umbral para ${actividad.nombre} (art. 17, fracción ${actividad.fraccion}). Eso no equivale a que la autoridad haya confirmado que su umbral sigue igual: significa que la reforma no publica un antes comparable para esta fracción. Lo que sí le aplica son los ${CAMBIOS_TRANSVERSALES.length} cambios de todo sujeto obligado y el régimen de organización interna del Acuerdo 115/2026.`
        }
      />

      <IndiceContenidos entradas={indice} />

      {/* ── Cambios de la fracción ───────────────────────────────────────── */}
      <Seccion
        id="tu-fraccion"
        titulo="Cambios de tu fracción"
        descripcion={
          propios.length > 0
            ? 'El «ahora» se lee del motor de reglas; el «antes» viene declarado con su disposición.'
            : undefined
        }
      >
        {propios.length === 0 ? (
          <Nota tono="atencion" titulo="No hemos documentado cambios de umbral para esta actividad">
            <p>
              La reforma de julio de 2025 movió umbrales de fe pública y adicionó fracciones
              nuevas, pero no publica un antes contra el que comparar la fracción{' '}
              {actividad.fraccion}. Nuestro motor de reglas tampoco guarda historial: sus reglas
              arrancan el día en que entró en vigor la reforma, así que no hay de dónde leer el
              umbral anterior.
            </p>
            <p>
              Preferimos decirlo a rellenarlo. Un umbral histórico estimado se vería igual que uno
              verificado y no lo es. Si necesitas medir una operación anterior a la reforma, exige
              revisión profesional con el texto vigente en esa fecha.
            </p>
            <p>
              El umbral que rige hoy sí está publicado y verificado:{' '}
              <Link href={`/actividades-vulnerables/${actividad.slug}`}>
                ver los umbrales vigentes de esta fracción
              </Link>
              .
            </p>
          </Nota>
        ) : (
          <>
            <ul className="flex flex-col gap-5">
              {propios.map(({ cambio, justificacion }) => (
                <li
                  key={cambio.clave}
                  className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[var(--color-tinta)]">{cambio.supuesto}</h3>
                    {cambio.endurece && <Insignia tono="rojo">Endurece la obligación</Insignia>}
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-tinta-tenue)]">
                    {cambio.disposicion}
                  </p>

                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                        Antes
                      </dt>
                      <dd className="cifra mt-1 text-sm text-[var(--color-tinta-tenue)] line-through decoration-[var(--color-borde-fuerte)]">
                        {textoAntes(cambio)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                        Ahora
                      </dt>
                      <dd className="mt-1">
                        <Despues cambio={cambio} />
                      </dd>
                    </div>
                  </dl>

                  {cambio.nota && (
                    <p className="mt-4 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                      {cambio.nota}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-[var(--color-tinta-tenue)]">
                    Por qué te toca: {justificacion}
                  </p>
                </li>
              ))}
            </ul>

            <Nota tono="atencion" className="mt-6" titulo="Sobre la columna «antes»">
              <p>
                Es la única cifra del sitio escrita a mano en lugar de leerse del motor, porque
                corresponde a umbrales <strong>derogados</strong> y el motor sólo guarda reglas con
                vigencia abierta. Sirve para dimensionar el cambio, no para calcular: una operación
                anterior a la reforma exige revisión profesional.
              </p>
              <p>
                La conversión a pesos usa la UMA vigente a la fecha de revisión del corpus, no la
                del año en que regía el umbral anterior.
              </p>
            </Nota>
          </>
        )}
      </Seccion>

      {/* ── Cambios transversales ────────────────────────────────────────── */}
      <Seccion
        id="para-todos"
        titulo="Cambios que aplican a todos"
        descripcion="No dependen de la fracción: obligan a cualquiera que realice una actividad vulnerable."
      >
        <ul className="flex flex-col gap-4">
          {CAMBIOS_TRANSVERSALES.map(({ cambio }) => (
            <li
              key={cambio.clave}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
            >
              <h3 className="font-semibold text-[var(--color-tinta)]">{cambio.supuesto}</h3>
              <p className="mt-1 text-xs text-[var(--color-tinta-tenue)]">{cambio.disposicion}</p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                    Antes
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--color-tinta-suave)]">
                    {cambio.antesTexto ?? 'No documentado'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                    Ahora
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--color-tinta)]">
                    {cambio.despuesTexto ?? 'No documentado'}
                  </dd>
                </div>
              </dl>
              {cambio.nota && (
                <p className="mt-3 text-sm text-[var(--color-tinta-suave)]">{cambio.nota}</p>
              )}
            </li>
          ))}
        </ul>
      </Seccion>

      {/* ── Obligaciones nuevas ──────────────────────────────────────────── */}
      <Seccion
        id="obligaciones-nuevas"
        titulo="Obligaciones nuevas que te tocan"
        descripcion="El Acuerdo 115/2026 no movió umbrales: añadió régimen de organización interna."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {bloques.map(({ bloque, justificacion }) => {
            const obligacion = bloque.obligacionSlug
              ? datos.OBLIGACIONES_POR_SLUG[bloque.obligacionSlug]
              : undefined;
            return (
              <li
                key={bloque.clave}
                className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Insignia tono="marino">{bloque.capitulo}</Insignia>
                  {justificacion && <Insignia tono="ambar">Dirigido a tu sector</Insignia>}
                </div>
                <h3 className="mt-3 font-semibold text-[var(--color-tinta)]">{bloque.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {bloque.queObliga}
                </p>
                {justificacion && (
                  <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">{justificacion}</p>
                )}
                {obligacion && (
                  <p className="mt-3 text-sm">
                    <Link
                      href={`/obligaciones/${obligacion.slug}`}
                      className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                    >
                      {obligacion.titulo}
                    </Link>
                    <span className="mt-1 block text-xs text-[var(--color-tinta-tenue)]">
                      {obligacion.procedencia.disposicion}
                    </span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {ACUERDO && (
          <Nota tono="info" className="mt-6" titulo="Desde cuándo son exigibles">
            <p>
              El Acuerdo se publicó el {formatearFechaLarga(ACUERDO.publicacion)} y entra en vigor
              el {formatearFechaLarga(ACUERDO.entradaEnVigor)}, con plazos escalonados por bloque.
              Las obligaciones que la ley adicionó al art. 18 quedaron diferidas a esos plazos, así
              que la fecha en que te toca cada una no es la misma para todas:{' '}
              <Link href="/calendario-cumplimiento">revísalas en el calendario</Link>.
            </p>
          </Nota>
        )}
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Tu fracción',
            enlaces: [
              {
                href: `/actividades-vulnerables/${actividad.slug}`,
                etiqueta: 'Umbrales vigentes y quién cae',
                descripcion: 'La ficha completa de esta actividad',
              },
              { href: BASE, etiqueta: 'Qué cambió para las demás actividades' },
              { href: '/umbrales', etiqueta: 'Tabla completa de umbrales' },
            ],
          },
          {
            titulo: 'La reforma',
            enlaces: [
              { href: '/reforma-ley-antilavado-2026', etiqueta: 'Los tres instrumentos' },
              { href: '/acuerdo-115-2026', etiqueta: 'Acuerdo 115/2026 en detalle' },
              { href: '/calendario-cumplimiento', etiqueta: 'Calendario de fechas exigibles' },
            ],
          },
          {
            titulo: 'Verificar',
            enlaces: [
              { href: '/herramientas/calculadora-umbrales', etiqueta: 'Calculadora de umbrales' },
              { href: '/obligaciones', etiqueta: 'Catálogo de obligaciones' },
              { href: '/fuentes-oficiales', etiqueta: 'Fuentes oficiales' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
