import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Insignia, Nota, Tarjeta } from '@leyantilavado/ui';
import { CURSOS_DE_PAGO, EVIDENCIA_EXIGIBLE, RECURSOS_OFICIALES } from '@/content/capacitacion';
import { construirMetadata } from '@/lib/sitio';
import { JsonLd, jsonLdColeccion } from '@/components/contenido/JsonLd';

export const metadata: Metadata = construirMetadata({
  titulo: 'Cursos y capacitación en prevención de lavado de dinero',
  descripcion:
    'Capacitación para el programa anual obligatorio, y qué evidencia debe entregarte cualquier curso para que la formación sea demostrable en una revisión.',
  ruta: '/cursos',
});

/**
 * No vendemos cursos ni listamos los de nadie a cambio de nada. Lo que sí hay
 * es capacitación oficial gratuita que casi nadie sabe que existe, y ése es el
 * contenido de esta página.
 *
 * El orden importa: primero lo gratuito y oficial, después qué exigirle a
 * cualquier curso de paga. Al revés sería un catálogo con coartada.
 */
export default function PaginaCursos() {
  return (
    <div className="contenedor-app flex flex-col gap-10 py-10 md:py-14">
      <JsonLd
        datos={jsonLdColeccion({
          nombre: 'Cursos de prevención de lavado de dinero y LFPIORPI',
          descripcion:
            'Capacitación oficial gratuita del SAT y la UIF, y cursos de paga con la evidencia que entrega cada uno.',
          ruta: '/cursos',
          elementos: [
            ...RECURSOS_OFICIALES.map((r) => ({
              nombre: r.titulo,
              descripcion: r.descripcion,
              url: r.url,
              tipo: 'LearningResource',
            })),
            // `Course` sólo para programas reales con datos comprobados en la
            // fuente. Los recursos oficiales no son cursos con temario y no se
            // marcan como tales.
            ...CURSOS_DE_PAGO.map((c) => ({
              nombre: `${c.titulo} — ${c.institucion}`,
              descripcion: c.modalidad,
              url: c.url,
              tipo: 'Course',
            })),
          ],
        })}
      />

      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold md:text-4xl">
          Cursos de prevención de lavado de dinero y LFPIORPI
        </h1>
        <p className="prosa text-[var(--color-tinta-suave)]">
          La capacitación del personal es una obligación con evidencia: no basta con que tu equipo
          sepa, tiene que poder demostrarse quién se capacitó, en qué, cuándo y con qué resultado.
        </p>
      </header>

      <Nota tono="atencion" titulo="La capacitación de la UIF y del SAT no se cobra">
        <p>
          El portal SPPLD lo dice con todas sus letras: los foros, seminarios y convenciones en los
          que participan la Unidad de Inteligencia Financiera o el SAT son{' '}
          <strong>totalmente gratuitos</strong>. Si alguien te vende un “curso oficial del SAT”, una
          “certificación de la UIF” o un “registro obligatorio de capacitador”, no existe tal cosa.
        </p>
        <p>
          Tampoco hay ninguna autoridad que “acredite” a tu empresa por haber tomado un curso. La
          capacitación es una obligación tuya y la evidencia se queda contigo.
        </p>
      </Nota>

      <section aria-labelledby="oficial" className="flex flex-col gap-5">
        <div>
          <h2 id="oficial" className="text-2xl font-semibold">
            Capacitación y material oficial, gratis
          </h2>
          <p className="prosa mt-2 text-[var(--color-tinta-suave)]">
            Todo esto es del gobierno mexicano y no cuesta nada. Decimos también qué{' '}
            <strong>no</strong> sirve como evidencia, porque es la parte que suele descubrirse tarde.
          </p>
        </div>

        <ul className="grid gap-4 lg:grid-cols-2">
          {RECURSOS_OFICIALES.map((r) => (
            <li key={r.id}>
              <Tarjeta className="flex h-full flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Insignia tono="verde">Gratuito</Insignia>
                  <Insignia tono="neutro">{r.organismo}</Insignia>
                  <Insignia tono="marino">{r.formato}</Insignia>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-tinta)]">{r.titulo}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {r.descripcion}
                </p>
                <p className="mt-auto border-t border-[var(--color-borde)] pt-3 text-sm text-[var(--color-tinta-suave)]">
                  <strong className="text-[var(--color-tinta)]">Como evidencia:</strong>{' '}
                  {r.sirveComoEvidencia}
                </p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                >
                  Abrir en el sitio oficial
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              </Tarjeta>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="de-pago" className="flex flex-col gap-5">
        <div>
          <h2 id="de-pago" className="text-2xl font-semibold">
            Cursos de paga
          </h2>
          <p className="prosa mt-2 text-[var(--color-tinta-suave)]">
            Nadie entra aquí por pagarnos: no vendemos posiciones ni aceptamos patrocinio en esta
            sección. Entra lo que se puede describir con datos publicados por la propia
            institución, y decimos qué <strong>no</strong> publica.
          </p>
        </div>

        <ul className="flex flex-col gap-5">
          {CURSOS_DE_PAGO.map((c) => (
            <li key={c.id}>
              <Tarjeta className="flex flex-col gap-4 p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-[var(--color-tinta)]">{c.titulo}</h3>
                    <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">{c.institucion}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Insignia tono="neutro">{c.horas} horas</Insignia>
                    <Insignia tono="marino">
                      {c.precioMXN.toLocaleString('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                        maximumFractionDigits: 0,
                      })}
                    </Insignia>
                  </div>
                </div>

                <p className="text-sm text-[var(--color-tinta-suave)]">{c.modalidad}</p>

                <div>
                  <p className="text-sm font-semibold text-[var(--color-tinta)]">Temario</p>
                  <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {c.temario.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>

                <Nota tono="atencion" titulo="Qué te deja como evidencia">
                  <p>
                    {c.evidencia ?? 'La institución no publica qué documento entrega.'}
                    {c.notaEvidencia ? ` ${c.notaEvidencia}` : ''}
                  </p>
                </Nota>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-tinta)]">Dirigido a</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                      {c.dirigidoA}
                    </p>
                    {c.requisitos && (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-tenue)]">
                        {c.requisitos}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-tinta)]">
                      Lo que no publica
                    </p>
                    <ul className="mt-1 flex list-disc flex-col gap-1 pl-4 text-sm leading-relaxed text-[var(--color-tinta-tenue)]">
                      {c.sinPublicar.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="cifra text-sm text-[var(--color-tinta-suave)]">
                  Próximas fechas: {c.proximasFechas.map((d) => formatearFechaLarga(d)).join(' · ')}
                </p>

                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                >
                  Ver el programa en el sitio de la institución
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              </Tarjeta>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="evidencia" className="flex flex-col gap-4">
        <div>
          <h2 id="evidencia" className="text-2xl font-semibold">
            Qué tiene que dejarte por escrito
          </h2>
          <p className="prosa mt-2 text-[var(--color-tinta-suave)]">
            La obligación no se cumple asistiendo, se cumple pudiendo demostrarlo. Un curso que no
            deja documento es tiempo que después no vas a poder acreditar.
          </p>
        </div>
        <ul className="flex flex-col divide-y divide-[var(--color-borde)]">
          {EVIDENCIA_EXIGIBLE.map((e) => (
            <li key={e.punto} className="py-3.5">
              <p className="font-medium text-[var(--color-tinta)]">{e.punto}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {e.porque}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="que-exigir" className="flex flex-col gap-4">
        <h2 id="que-exigir" className="text-2xl font-semibold">
          Qué exigirle a cualquier curso, lo tomes donde lo tomes
        </h2>
        <ul className="prosa flex flex-col gap-2 text-[var(--color-tinta-suave)]">
          <li>
            <strong>Contenido fechado.</strong> Si no dice contra qué texto vigente se preparó,
            puede estar enseñando reglas que ya cambiaron.
          </li>
          <li>
            <strong>Casos de tu actividad.</strong> La capacitación genérica no cambia conductas.
          </li>
          <li>
            <strong>Evidencia completa.</strong> Constancia por persona, lista de asistencia,
            temario y evaluación. Eso es lo que va a pedirte un auditor.
          </li>
          <li>
            <strong>Nadie te “acredita” ante la autoridad.</strong> Un curso acredita que ciertas
            personas recibieron formación, no que la empresa esté en regla.
          </li>
        </ul>
      </section>

      <Nota tono="info" titulo="Mientras tanto">
        Puedes encontrar capacitadores en el{' '}
        <Link href="/directorio/capacitadores" className="underline underline-offset-4">
          directorio profesional
        </Link>
        . Ahí explicamos qué comprobamos de cada perfil y qué preguntarle antes de contratar.
      </Nota>
    </div>
  );
}
