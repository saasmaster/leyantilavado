import { AlertTriangle } from 'lucide-react';
import { datos } from '@leyantilavado/rules-engine';
import { Nota, SelloProcedencia, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';

const FUENTES_ENLAZABLES = Object.fromEntries(
  datos.FUENTES.map((f) => [f.id, { nombre: f.nombre, url: f.url }]),
);

/**
 * Módulo informativo, deliberadamente separado del estimador.
 *
 * Las consecuencias penales no son "multas más grandes": son otro régimen, con
 * otro procedimiento, otra autoridad y otro estándar de prueba. Mezclarlas con
 * el rango administrativo produciría una cifra sin sentido, así que ni se suman
 * ni se estiman: se explican.
 */
export function ConsecuenciasPenales() {
  return (
    <section aria-labelledby="penales" className="flex flex-col gap-4">
      <div>
        <h2
          id="penales"
          className="flex items-center gap-2 text-2xl font-semibold text-[var(--color-tinta)] font-[family-name:var(--font-display)]"
        >
          <AlertTriangle aria-hidden className="size-6 text-[var(--color-rojo)]" />
          Consecuencias penales: otro régimen, no una multa mayor
        </h2>
        <p className="mt-2 max-w-2xl text-[var(--color-tinta-suave)]">
          Lo anterior son sanciones <strong>administrativas</strong>, que impone el SAT en un
          procedimiento administrativo. Lo de esta sección es materia <strong>penal</strong>: la
          investiga la Fiscalía, la resuelve un juez y no se suma a la multa. El estimador no la
          calcula a propósito.
        </p>
      </div>

      {datos.CONSECUENCIAS_PENALES.map((c) => (
        <Tarjeta key={c.id} className="evitar-corte border-l-4 border-l-[var(--color-rojo)]">
          <TarjetaCuerpo className="flex flex-col gap-3">
            <h3 className="font-semibold text-[var(--color-tinta)]">Artículo {c.articulo}</h3>
            <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">{c.supuesto}</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--color-tinta-tenue)]">Prisión</dt>
                <dd className="cifra mt-1 font-semibold text-[var(--color-tinta)]">
                  de {c.prisionAnios.min} a {c.prisionAnios.max} años
                </dd>
              </div>
              {c.multaDias && (
                <div>
                  <dt className="text-xs text-[var(--color-tinta-tenue)]">Multa</dt>
                  <dd className="cifra mt-1 font-semibold text-[var(--color-tinta)]">
                    de {c.multaDias.min.toLocaleString('es-MX')} a{' '}
                    {c.multaDias.max.toLocaleString('es-MX')} días multa
                  </dd>
                </div>
              )}
            </dl>
            <Nota tono="atencion">
              <p>{c.notas}</p>
            </Nota>
          </TarjetaCuerpo>
        </Tarjeta>
      ))}

      <Nota tono="info" titulo="Por qué no convertimos los días multa a pesos">
        <p>
          El valor del día multa se determina conforme al Código Penal Federal y depende del ingreso
          diario de la persona sentenciada. No es un número que podamos calcular desde aquí, así que
          no lo publicamos: preferimos decir que no lo sabemos antes que dar una cifra que no
          podamos respaldar.
        </p>
      </Nota>

      <SelloProcedencia
        procedencia={datos.CONSECUENCIAS_PENALES[0]!.procedencia}
        fuentes={FUENTES_ENLAZABLES}
      />
    </section>
  );
}
