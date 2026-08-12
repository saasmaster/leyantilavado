import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { AvisoIndependencia, Insignia, Nota } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { ANEXOS_NUEVOS, BLOQUES_ACUERDO_115, INSTRUMENTOS } from '@/content/reforma';
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

const RUTA = '/acuerdo-115-2026';
const TITULO = 'Acuerdo 115/2026: qué es y qué te obliga a hacer';
const DESCRIPCION =
  'Acuerdo de la SHCP que modifica las Reglas de Carácter General de la LFPIORPI. Publicado el 7 de agosto de 2026 y en vigor el 30 de noviembre.';

export const metadata: Metadata = construirMetadata({
  titulo: TITULO,
  descripcion: DESCRIPCION,
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: '2026-08-11',
  actualizadoEn: '2026-08-11',
});

const ACUERDO = INSTRUMENTOS.find((i) => i.clave.includes('acuerdo') || i.clave.includes('115'));
const FUENTE = datos.FUENTES_POR_ID['dof-acuerdo-115-2026'];
const VIGENCIA = datos.CALENDARIO.find((h) => h.id === 'vigencia-general');

const INDICE = [
  { id: 'que-es', titulo: 'Qué es exactamente' },
  { id: 'que-anade', titulo: `Qué añade: ${BLOQUES_ACUERDO_115.length} bloques` },
  { id: 'anexos', titulo: 'Anexos nuevos' },
  { id: 'cuando', titulo: 'Para cuándo' },
];

export default function Acuerdo115() {
  return (
    <div className="contenedor-app py-10 md:py-14">
      <JsonLd
        datos={[
          jsonLdMigaDePan([
            { nombre: 'Inicio', ruta: '/' },
            { nombre: 'Acuerdo 115/2026', ruta: RUTA },
          ]),
          jsonLdArticulo({
            titulo: TITULO,
            descripcion: DESCRIPCION,
            ruta: RUTA,
            publicadoEn: '2026-08-11',
            actualizadoEn: '2026-08-11',
            seccion: 'Marco normativo',
          }),
        ]}
      />

      <Migas
        items={[
          { nombre: 'Inicio', ruta: '/' },
          { nombre: 'Acuerdo 115/2026', ruta: RUTA },
        ]}
      />

      <CabeceraArticulo
        titulo={TITULO}
        etiquetas={[
          { texto: 'DOF 7 de agosto de 2026', tono: 'marino' },
          { texto: 'En vigor 30 de noviembre de 2026', tono: 'ambar' },
          { texto: 'No cambia umbrales', tono: 'neutro' },
        ]}
        respuestaDirecta="Es un acuerdo de la Secretaría de Hacienda que modifica las Reglas de Carácter General en materia de la LFPIORPI, publicadas originalmente en 2013. No es una ley ni un decreto, y no lo emite el SAT ni la UIF. No crea ni modifica ningún umbral del artículo 17: lo que hace es precisar cómo aplicarlos y añadir obligaciones de organización interna, con fechas escalonadas entre 2026 y 2029."
        entradilla={DESCRIPCION}
      />

      <IndiceContenidos entradas={INDICE} />

      {/* ── Qué es ───────────────────────────────────────────────────────── */}
      <Seccion
        id="que-es"
        titulo="Qué es exactamente"
        descripcion="Media docena de precisiones que evitan los malentendidos más caros."
      >
        <div className="prosa">
          <p>
            Circula como si fuera una ley nueva. No lo es. El Acuerdo 115/2026 es un{' '}
            <strong>acuerdo administrativo de la SHCP</strong> que reforma las Reglas de Carácter
            General de la LFPIORPI. Su jerarquía está por debajo de la ley y del reglamento, y esa
            posición tiene una consecuencia concreta: <strong>no puede crear un umbral</strong> que
            la ley no haya previsto.
          </p>
          <p>
            Por eso los montos del artículo 17 no se movieron con este acuerdo. Los que sí
            cambiaron —el de notarios sobre inmuebles, el de fideicomisos, la constitución de
            personas morales— vienen de la reforma a la <em>Ley</em>, publicada el 16 de julio de
            2025 y en vigor desde el día siguiente.
          </p>
          <p>
            Lo que sí trae el acuerdo es el régimen de organización interna: metodología de enfoque
            basado en riesgos, manual de políticas, clasificación de clientes, perfil transaccional,
            mecanismos automatizados, capacitación anual y auditoría con dictamen. Es la parte que
            exige montar procesos, no sólo recalcular cifras.
          </p>
        </div>

        {ACUERDO && (
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: 'Emisor', v: ACUERDO.emisor },
              { t: 'Publicación', v: formatearFechaLarga(ACUERDO.publicacion) },
              { t: 'Entrada en vigor', v: formatearFechaLarga(ACUERDO.entradaEnVigor) },
              { t: 'Jerarquía', v: ACUERDO.jerarquia },
            ].map((d) => (
              <div key={d.t} className="tarjeta p-4">
                <dt className="text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                  {d.t}
                </dt>
                <dd className="mt-1.5 text-[0.95rem] font-medium text-[var(--color-tinta)]">
                  {d.v}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {FUENTE && (
          <a
            href={FUENTE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
          >
            Leer la publicación completa en el Diario Oficial
            <ArrowUpRight className="size-3.5" />
          </a>
        )}
      </Seccion>

      {/* ── Qué añade ────────────────────────────────────────────────────── */}
      <Seccion
        id="que-anade"
        titulo={`Qué añade: ${BLOQUES_ACUERDO_115.length} bloques de obligaciones`}
        descripcion="Cada bloque enlaza a la obligación con sus pasos y la evidencia que pide."
      >
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {BLOQUES_ACUERDO_115.map((b) => {
            const obligacion = b.obligacionSlug
              ? datos.OBLIGACIONES_POR_SLUG[b.obligacionSlug]
              : undefined;
            return (
              <li key={b.clave} className="tarjeta flex flex-col p-5">
                <Insignia tono="petroleo">{b.capitulo}</Insignia>
                <h3 className="mt-3 text-[1.0625rem] font-semibold text-[var(--color-tinta)]">
                  {b.titulo}
                </h3>
                <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-[var(--color-tinta-suave)]">
                  {b.queObliga}
                </p>
                {obligacion && (
                  <Link
                    href={`/obligaciones/${obligacion.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-[var(--color-petroleo-hondo)]"
                  >
                    Cómo se cumple: {obligacion.titulo}
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Seccion>

      {/* ── Anexos ───────────────────────────────────────────────────────── */}
      <Seccion
        id="anexos"
        titulo="Anexos nuevos"
        descripcion="El acuerdo incorpora anexos con formatos y catálogos."
      >
        <ul className="mt-6 flex flex-col gap-3">
          {ANEXOS_NUEVOS.map((a) => (
            <li key={a.clave} className="tarjeta flex flex-wrap items-baseline gap-x-3 gap-y-1 p-4">
              <span className="cifra font-semibold text-[var(--color-marino)]">{a.clave}</span>
              <span className="text-[0.9rem] text-[var(--color-tinta-suave)]">{a.descripcion}</span>
            </li>
          ))}
        </ul>

        <Nota tono="atencion" titulo="Lo que no reproducimos" className="mt-5">
          <p>
            No publicamos el detalle campo por campo de los anexos. Verificarlo exige contrastar el
            documento completo del DOF, y publicar una transcripción parcial de un formato oficial
            es peor que no publicarla: alguien la usaría para preparar un aviso. Consulta el anexo
            en la fuente antes de llenar cualquier formato.
          </p>
        </Nota>
      </Seccion>

      {/* ── Para cuándo ──────────────────────────────────────────────────── */}
      <Seccion
        id="cuando"
        titulo="Para cuándo"
        descripcion="El acuerdo no exige todo el mismo día."
      >
        {VIGENCIA && (
          <p className="prosa">
            Las reglas entran en vigor el{' '}
            <strong>{formatearFechaLarga(VIGENCIA.fecha)}</strong>. A partir de ahí corren los
            plazos escalonados: lo documental el 1 de marzo de 2027, los mecanismos automatizados
            el 1 de junio de 2027, el ejercicio 2027 como primer periodo de capacitación y el 2028
            como primero de auditoría, con dictamen a más tardar el último día hábil de marzo de
            2029.
          </p>
        )}

        <Nota tono="riesgo" titulo="Los avisos de 24 horas no tienen fecha cierta" className="mt-6">
          <p>
            El acuerdo prevé avisos en 24 horas por operaciones inusuales, que proceden aunque no se
            alcance el umbral e incluso cuando la operación no llegó a celebrarse. Pero su
            exigibilidad corre a partir de <strong>seis meses después</strong> de que la UIF publique
            una Resolución con los formatos oficiales, y esa Resolución no aparece publicada a la
            fecha de nuestra última revisión.
          </p>
          <p>
            Por eso no le ponemos fecha en el calendario. Si ves una fuente que da una fecha
            concreta para esta obligación, verifica que cite la Resolución publicada.
          </p>
        </Nota>

        <Link
          href="/calendario-cumplimiento"
          className="mt-6 inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
        >
          Ver el calendario completo con cuenta regresiva por regla
        </Link>
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Contexto',
            enlaces: [
              {
                etiqueta: 'La reforma 2025-2026 completa',
                href: '/reforma-ley-antilavado-2026',
                descripcion: 'Los tres instrumentos y qué umbrales se movieron',
              },
              { etiqueta: 'Fuentes oficiales', href: '/fuentes-oficiales' },
            ],
          },
          {
            titulo: 'Prepararte',
            enlaces: [
              { etiqueta: 'Metodología de enfoque basado en riesgos', href: '/obligaciones/enfoque-basado-riesgos' },
              { etiqueta: 'Mecanismos automatizados', href: '/obligaciones/mecanismos-automatizados' },
              { etiqueta: 'Auditoría anual', href: '/obligaciones/auditoria-anual' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
      <AvisoIndependencia className="mt-6" />
    </div>
  );
}
