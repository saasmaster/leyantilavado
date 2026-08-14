import type { PreguntaFrecuente } from '@/content/tipos';
import { glosar } from '@/lib/glosar';

/**
 * Bloque de preguntas frecuentes.
 *
 * Se renderiza siempre visible y sin JavaScript: el contenido va dentro de
 * `<details>` nativo, que es accesible por teclado, se puede buscar con Ctrl+F
 * en navegadores modernos y no depende de hidratación. El marcado FAQPage sólo
 * se emite en páginas que muestran este bloque.
 */
export function PreguntasFrecuentes({
  preguntas,
  id = 'preguntas',
}: {
  preguntas: readonly PreguntaFrecuente[];
  id?: string;
}) {
  if (preguntas.length === 0) return null;

  return (
    <div id={id} className="divide-y divide-[var(--color-borde)] rounded-[var(--radius-card)] border border-[var(--color-borde)]">
      {preguntas.map((p) => (
        <details key={p.pregunta} className="group">
          <summary className="flex cursor-pointer items-start gap-3 p-4 text-left font-medium text-[var(--color-tinta)] hover:bg-[var(--color-marfil-hondo)]">
            <span className="mt-0.5 text-[var(--color-petroleo)] transition-transform group-open:rotate-90">
              ›
            </span>
            {p.pregunta}
          </summary>
          {/* Se glosa la respuesta visible, nunca el dato que alimenta el
              JSON-LD: `FAQPage` exige texto plano en `acceptedAnswer`, y ese
              marcado se construye aparte a partir de `p.respuesta` sin tocar.
              Enlazar aquí no puede contaminar allí porque son dos lecturas
              distintas de la misma cadena. */}
          <div className="px-4 pb-4 pl-10 leading-relaxed text-[var(--color-tinta-suave)]">
            {glosar(p.respuesta)}
          </div>
        </details>
      ))}
    </div>
  );
}
