import { DatabaseZap } from 'lucide-react';
import { Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';

/**
 * Pantalla honesta para cuando falta conectar Supabase.
 *
 * No es un placeholder ni un "próximamente": dice exactamente qué falta, dónde
 * se pone y qué funciona mientras tanto. El sitio público sigue operando.
 */
export function ConfiguracionPendiente({ faltantes }: { faltantes: string[] }) {
  return (
    <div className="contenedor-app py-10">
      <Tarjeta>
        <TarjetaCuerpo className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <DatabaseZap
              className="mt-0.5 size-6 shrink-0 text-[var(--color-ambar)]"
              aria-hidden="true"
            />
            <div>
              <h1 className="text-xl font-semibold text-[var(--color-tinta)]">
                El área privada todavía no está conectada
              </h1>
              <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
                Esta parte del sitio guarda expedientes, operaciones y avisos, así que necesita una
                base de datos. Las herramientas públicas y todo el contenido siguen funcionando sin
                ella.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[var(--color-tinta)]">
              {faltantes.length === 1 ? 'Falta esta variable' : 'Faltan estas variables'}
            </h2>
            <ul className="mt-2 flex flex-col gap-1">
              {faltantes.map((v) => (
                <li
                  key={v}
                  className="rounded-[var(--radius-control)] bg-[var(--color-marfil-hondo)] px-3 py-2 font-mono text-xs text-[var(--color-tinta)]"
                >
                  {v}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm text-[var(--color-tinta-suave)]">
            <h2 className="mb-2 text-sm font-semibold text-[var(--color-tinta)]">Cómo conectarla</h2>
            <ol className="flex list-decimal flex-col gap-1.5 pl-5">
              <li>
                Crea un proyecto en Supabase y copia <code>Project URL</code> y{' '}
                <code>anon public key</code>.
              </li>
              <li>
                Copia <code>.env.example</code> a <code>.env.local</code> y pega ahí los valores.
              </li>
              <li>
                Aplica las migraciones de <code>supabase/migrations</code> con{' '}
                <code>supabase db push</code>. Las instrucciones completas están en{' '}
                <code>supabase/README.md</code>.
              </li>
              <li>Reinicia el servidor de desarrollo.</li>
            </ol>
          </div>

          <Nota tono="info" titulo="Por qué no se rompe el sitio">
            <p>
              La app detecta la ausencia de configuración en lugar de asumirla. Ninguna página
              pública depende de la base de datos, así que el contenido y las calculadoras se
              construyen y se sirven igual.
            </p>
          </Nota>
        </TarjetaCuerpo>
      </Tarjeta>
    </div>
  );
}
