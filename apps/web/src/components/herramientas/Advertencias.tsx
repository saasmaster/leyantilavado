import type { Advertencia } from '@leyantilavado/types';
import { Nota } from '@leyantilavado/ui';

const TITULO: Record<Advertencia['severidad'], string> = {
  info: 'Ten en cuenta',
  atencion: 'Atención',
  riesgo: 'Riesgo',
};

const TONO: Record<Advertencia['severidad'], 'info' | 'atencion' | 'riesgo'> = {
  info: 'info',
  atencion: 'atencion',
  riesgo: 'riesgo',
};

/**
 * Advertencias del motor.
 *
 * Se muestran TODAS y en orden de severidad: la herramienta no puede decidir
 * cuál esconder. Las de riesgo van primero porque son las que cambian una
 * decisión.
 */
export function Advertencias({
  advertencias,
  className,
}: {
  advertencias: readonly Advertencia[];
  className?: string;
}) {
  if (advertencias.length === 0) return null;

  const orden: Record<Advertencia['severidad'], number> = { riesgo: 0, atencion: 1, info: 2 };
  const ordenadas = [...advertencias].sort((a, b) => orden[a.severidad] - orden[b.severidad]);

  return (
    <div className={className}>
      <ul className="flex flex-col gap-3">
        {ordenadas.map((a) => (
          <li key={a.clave}>
            <Nota tono={TONO[a.severidad]} titulo={TITULO[a.severidad]}>
              <p>{a.mensaje}</p>
            </Nota>
          </li>
        ))}
      </ul>
    </div>
  );
}
