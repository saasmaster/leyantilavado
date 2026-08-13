import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

/**
 * «Fuentes principales de esta guía».
 *
 * Va en los hubs —portada, actividades vulnerables, preguntas frecuentes—,
 * que son las páginas que resumen mucho y no citaban ninguna fuente directa.
 * Las páginas de detalle sí lo hacían: cada cifra lleva su sello de
 * procedencia. Pero un hub que remite a `/fuentes-oficiales` obliga a un salto
 * más para comprobar nada, y quien quiere verificar rara vez da ese salto.
 *
 * La fuente tiene que estar cerca de lo que respalda. Ése es todo el
 * argumento.
 *
 * Sin `nofollow`: enlazar al DOF y al SAT es el respaldo editorial que este
 * proyecto quiere dar, no algo de lo que desmarcarse.
 */

interface Fuente {
  nombre: string;
  detalle: string;
  url: string;
}

const FUENTES: readonly Fuente[] = [
  {
    nombre: 'LFPIORPI vigente',
    detalle: 'Texto de la ley en la Cámara de Diputados',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPIORPI.pdf',
  },
  {
    nombre: 'Reforma de julio de 2025',
    detalle: 'Decreto publicado en el DOF el 16 de julio de 2025',
    url: 'https://www.dof.gob.mx/',
  },
  {
    nombre: 'Reglamento reformado',
    detalle: 'Compilado del reglamento con la reforma del 27 de marzo de 2026',
    url: 'https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/CompiladoRLFPIORPI160813y270326.pdf',
  },
  {
    nombre: 'Portal de Prevención de Lavado de Dinero',
    detalle: 'SPPLD del SAT: alta, avisos, instructivos y catálogos',
    url: 'https://sppld.sat.gob.mx/',
  },
  {
    nombre: 'Actividades vulnerables en el SAT',
    detalle: 'Minisitio con obligaciones por sector',
    url: 'https://www.sat.gob.mx/personas/actividades-vulnerables',
  },
  {
    nombre: 'Valor de la UMA',
    detalle: 'Serie histórica publicada por el INEGI',
    url: 'https://www.inegi.org.mx/temas/uma/',
  },
];

export function FuentesPrincipales({ className }: { className?: string }) {
  return (
    <section aria-labelledby="fuentes-principales" className={className}>
      <h2
        id="fuentes-principales"
        className="text-xl font-semibold text-[var(--color-tinta)] md:text-2xl"
      >
        Fuentes principales de esta guía
      </h2>
      <p className="prosa mt-2 text-[var(--color-tinta-suave)]">
        Los documentos oficiales de los que sale lo que se publica aquí. Cada cifra concreta lleva
        además su propia fuente y su fecha de revisión en la página donde aparece.
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {FUENTES.map((f) => (
          <li key={f.url}>
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 flex-col justify-center rounded-[var(--radius-control)] border border-[var(--color-borde)] px-4 py-3 transition-colors duration-150 hover:bg-[var(--color-marfil-hondo)]"
            >
              <span className="flex items-center gap-1.5 font-medium text-[var(--color-petroleo-hondo)]">
                {f.nombre}
                <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
              </span>
              <span className="mt-0.5 text-sm leading-snug text-[var(--color-tinta-tenue)]">
                {f.detalle}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-[var(--color-tinta-tenue)]">
        El listado completo, con el estado de cada fuente y cuándo la revisamos, está en{' '}
        <Link href="/fuentes-oficiales" className="underline underline-offset-4">
          fuentes oficiales
        </Link>
        .
      </p>
    </section>
  );
}
