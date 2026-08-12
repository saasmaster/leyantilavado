import type { Metadata } from 'next';
import Link from 'next/link';
import { EstadoVacio, Nota } from '@leyantilavado/ui';
import { construirMetadata } from '@/lib/sitio';

export const metadata: Metadata = construirMetadata({
  titulo: 'Cursos y capacitación en prevención de lavado de dinero',
  descripcion:
    'Capacitación para el programa anual obligatorio, y qué evidencia debe entregarte cualquier curso para que la formación sea demostrable en una revisión.',
  ruta: '/cursos',
});

/**
 * No hay inventario real todavía. En lugar de inventar tarjetas de cursos que
 * nadie imparte, esta página explica qué va a haber, qué debe exigirle
 * cualquiera a un curso, y por dónde encontrar capacitadores hoy.
 */
export default function PaginaCursos() {
  return (
    <div className="contenedor-app flex flex-col gap-10 py-10 md:py-14">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold md:text-4xl">Cursos y capacitación</h1>
        <p className="prosa text-[var(--color-tinta-suave)]">
          La capacitación del personal es una obligación con evidencia: no basta con que tu equipo
          sepa, tiene que poder demostrarse quién se capacitó, en qué, cuándo y con qué resultado.
        </p>
      </header>

      <EstadoVacio
        titulo="Todavía no hay cursos publicados"
        descripcion="Estamos armando el catálogo. Preferimos no publicar nada antes que llenar la página con cursos que no hemos revisado."
        accion={
          <Link
            href="/contacto"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--color-petroleo)] px-5 text-sm font-medium text-white"
          >
            Avísame cuando abra el catálogo
          </Link>
        }
      />

      <section aria-labelledby="que-habra" className="flex flex-col gap-4">
        <h2 id="que-habra" className="text-2xl font-semibold">
          Qué va a haber aquí
        </h2>
        <ul className="prosa flex flex-col gap-2 text-[var(--color-tinta-suave)]">
          <li>
            Cursos por actividad vulnerable, no un curso genérico: el mostrador de una joyería y la
            recepción de una notaría no necesitan lo mismo.
          </li>
          <li>Cursos por perfil: personal de atención, área contable y dirección.</li>
          <li>
            Ficha con temario, duración, fecha de la última actualización del contenido y contra qué
            texto vigente se preparó.
          </li>
          <li>Qué evidencia entrega cada curso: constancia individual, lista de asistencia, evaluación.</li>
          <li>Precio público. Un curso sin precio publicado no entra al catálogo.</li>
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
