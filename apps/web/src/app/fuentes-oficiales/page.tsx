import type { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';
import type { NivelVerificacion, Procedencia } from '@leyantilavado/types';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { AvisoIndependencia, Insignia, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { EncabezadoPagina, FECHA_HOY, NIVELES_VERIFICACION } from '@/components/inicio/comun';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Fuentes oficiales', ruta: '/fuentes-oficiales' },
];

export const metadata: Metadata = construirMetadata({
  titulo: 'Fuentes oficiales',
  descripcion:
    'Las fuentes oficiales que sostienen cada cifra publicada sobre la LFPIORPI: qué usamos de cada una, cuándo la revisamos y en qué estado está.',
  ruta: '/fuentes-oficiales',
});

/* ── Uso real de cada fuente ──────────────────────────────────────────────────
   No se declara a mano: se cuenta recorriendo las reglas del motor. Si una
   fuente deja de usarse, esta página lo refleja sola.
   ─────────────────────────────────────────────────────────────────────────── */

interface Uso {
  reglas: number;
  ultimaRevision: string | null;
  niveles: Set<NivelVerificacion>;
}

const COLECCIONES: { etiqueta: string; procedencias: Procedencia[] }[] = [
  { etiqueta: 'Valores de la UMA', procedencias: datos.VALORES_UMA.map((v) => v.procedencia) },
  { etiqueta: 'Actividades vulnerables', procedencias: datos.ACTIVIDADES.map((a) => a.procedencia) },
  { etiqueta: 'Reglas de umbral', procedencias: datos.UMBRALES.map((u) => u.procedencia) },
  { etiqueta: 'Límites de efectivo', procedencias: datos.REGLAS_EFECTIVO.map((r) => r.procedencia) },
  { etiqueta: 'Sanciones', procedencias: datos.SANCIONES.map((s) => s.procedencia) },
  { etiqueta: 'Obligaciones', procedencias: datos.OBLIGACIONES.map((o) => o.procedencia) },
  { etiqueta: 'Calendario', procedencias: datos.CALENDARIO.map((h) => h.procedencia) },
];

const USO: Record<string, Uso> = {};

for (const coleccion of COLECCIONES) {
  for (const p of coleccion.procedencias) {
    for (const id of p.fuentes) {
      const actual = (USO[id] ??= { reglas: 0, ultimaRevision: null, niveles: new Set() });
      actual.reglas += 1;
      actual.niveles.add(p.verificacion);
      if (actual.ultimaRevision === null || p.ultimaRevision > actual.ultimaRevision) {
        actual.ultimaRevision = p.ultimaRevision;
      }
    }
  }
}

/** Para qué sirve cada fuente, en lenguaje llano. */
const PARA_QUE: Record<string, string> = {
  'lfpiorpi-vigente':
    'El catálogo de actividades vulnerables del artículo 17, los umbrales de identificación y aviso, el comparador exacto de cada fracción y los rangos de sanción.',
  'dof-reglamento-2026':
    'La ventana de acumulación, la conservación de la información, el aviso que procede aunque la operación no se celebre y el tratamiento del IVA en el límite de efectivo.',
  'dof-acuerdo-115-2026':
    'Todo el calendario de implementación 2026-2029 y las obligaciones de metodología de riesgos, manual, capacitación, mecanismos automatizados y auditoría.',
  'sat-marco-normativo':
    'Contraste del marco aplicable y de los criterios que la autoridad publica para actividades vulnerables.',
  'sat-umbrales':
    'Contraste fracción por fracción de la tabla de umbrales contra lo que dice el texto de la ley. Es la fuente que detecta discrepancias.',
  'sppld-portal':
    'Los pasos operativos del alta, la presentación de avisos y el informe en ceros que aparecen en las fichas de obligaciones.',
  'inegi-uma':
    'El valor diario de la UMA de cada año y su fecha de entrada en vigor, que es lo que convierte todos los umbrales a pesos.',
};

const TONO_NIVEL = {
  oficial_verificado: 'verde',
  oficial_no_accesible: 'ambar',
  fuente_secundaria: 'ambar',
  no_verificado: 'rojo',
} as const;

function estadoDe(uso: Uso | undefined): { tono: 'verde' | 'ambar' | 'rojo' | 'neutro'; texto: string } {
  if (!uso || uso.reglas === 0) {
    return { tono: 'neutro', texto: 'Declarada, sin reglas asociadas' };
  }
  if (uso.niveles.has('no_verificado')) {
    return { tono: 'rojo', texto: 'En uso, con datos pendientes de revisión' };
  }
  if (uso.niveles.has('fuente_secundaria') || uso.niveles.has('oficial_no_accesible')) {
    return { tono: 'ambar', texto: 'En uso, con contraste parcial' };
  }
  return { tono: 'verde', texto: 'En uso, contrastada' };
}

export default function FuentesOficialesPagina() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo={`Las ${datos.FUENTES.length} fuentes de las que sale todo`}
        entradilla="Cada regla del motor jurídico apunta por identificador a una de estas fuentes. Si una fuente cambia, cambia la regla; si una fuente no está aquí, ese dato no se publica."
        actualizado={formatearFechaLarga(FECHA_HOY)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <TablaEnvoltura
          aria-label="Fuentes oficiales, uso, última revisión y estado"
          className="bg-[var(--color-superficie)]"
        >
          <table className="w-full min-w-[60rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Fuentes oficiales consultadas, qué se usa de cada una, cuántas reglas la citan,
              cuándo se revisó por última vez y en qué estado está.
            </caption>
            <thead>
              <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Fuente
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Qué usamos de ella
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Reglas que la citan
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Última revisión
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {datos.FUENTES.map((fuente) => {
                const uso = USO[fuente.id];
                const estado = estadoDe(uso);
                const revision = uso?.ultimaRevision ?? fuente.ultimaRevision ?? null;

                return (
                  <tr
                    key={fuente.id}
                    className="border-b border-[var(--color-borde)] align-top last:border-b-0"
                  >
                    <th scope="row" className="px-4 py-4 font-medium">
                      <span className="block text-[var(--color-tinta)]">{fuente.nombre}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        <Insignia tono="marino">{fuente.emisor}</Insignia>
                        {fuente.fechaPublicacion && (
                          <span className="cifra text-xs font-normal text-[var(--color-tinta-tenue)]">
                            {formatearFechaLarga(fuente.fechaPublicacion)}
                          </span>
                        )}
                      </span>
                      <a
                        href={fuente.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-normal text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                      >
                        Abrir documento
                        <ExternalLink className="size-3" aria-hidden="true" />
                        <span className="sr-only">(se abre en una pestaña nueva)</span>
                      </a>
                    </th>

                    <td className="px-4 py-4 text-[var(--color-tinta-suave)]">
                      {PARA_QUE[fuente.id] ?? fuente.descripcion}
                    </td>

                    <td className="cifra px-4 py-4 text-[var(--color-tinta)]">
                      {uso?.reglas ?? 0}
                    </td>

                    <td className="cifra px-4 py-4 text-[var(--color-tinta-suave)]">
                      {revision ? formatearFechaLarga(revision) : 'Sin registro'}
                    </td>

                    <td className="px-4 py-4">
                      <Insignia tono={estado.tono}>{estado.texto}</Insignia>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TablaEnvoltura>

        <div className="prosa mt-12">
          <h2>Cómo verificamos: los cuatro niveles</h2>
          <p>
            El estado de la tabla de arriba se calcula a partir del nivel de verificación de cada
            regla que cita la fuente. Los niveles son cuatro y no son intercambiables.
          </p>
        </div>

        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {NIVELES_VERIFICACION.map((n) => (
            <li key={n.nivel} className="tarjeta p-5">
              <Insignia tono={TONO_NIVEL[n.nivel]}>{n.etiqueta}</Insignia>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {n.explicacion}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-tenue)]">
                {n.queHacemos}
              </p>
            </li>
          ))}
        </ol>

        <div className="prosa mt-12">
          <h2>Qué hacemos cuando dos fuentes oficiales se contradicen</h2>
          <p>
            No elegimos una en silencio. El modelo de datos tiene un campo específico para la
            discrepancia: se muestran ambas cifras, se dice cuál corresponde a cada fuente y la
            regla queda en estado borrador hasta que la autoridad aclare. Publicar una y esconder
            la otra le daría al usuario una falsa certeza justo donde no la hay.
          </p>

          <h2>Monitoreo de cambios</h2>
          <p>
            Cada fuente tiene un campo de huella del contenido pensado para detectar cuándo el
            documento publicado cambia. El monitor automático todavía no está en operación: hoy la
            revisión es manual y su fecha es la que aparece en la columna correspondiente.
          </p>
        </div>

        <Nota tono="atencion" titulo="Lo que falta en este bloque" className="mt-10">
          <p>
            <strong>[PENDIENTE: puesta en marcha del monitor automático de fuentes]</strong> y{' '}
            <strong>[PENDIENTE: registro de la huella de contenido de cada documento]</strong>.
            Mientras no existan, una fuente puede cambiar sin que lo detectemos el mismo día.
          </p>
        </Nota>

        <AvisoIndependencia className="mt-8" />
      </div>
    </>
  );
}
