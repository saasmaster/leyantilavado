import { Insignia } from '@leyantilavado/ui';
import type { EspecificacionUmbral } from '@leyantilavado/types';
import { describirUmbral, formatearUMA, textoComparador, tonoUmbral, type VistaUmbral } from './umbral';

/**
 * Presentación de un umbral.
 *
 * Renderiza los seis casos de `EspecificacionUmbral` sin aplanarlos a un
 * número. "Siempre" no se pinta como una cifra grande, y "sin umbral
 * publicado" se pinta en ámbar, no en gris, porque es un hueco que el lector
 * tiene que ver.
 */
export function UmbralVista({
  vista,
  compacto,
}: {
  vista: VistaUmbral;
  compacto?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {vista.montos.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {vista.montos.map((m) => (
            <li key={`${m.etiqueta ?? 'monto'}-${m.uma}`}>
              {m.etiqueta && (
                <span className="block text-xs text-[var(--color-tinta-tenue)]">{m.etiqueta}</span>
              )}
              <span className="cifra text-lg font-semibold text-[var(--color-tinta)]">
                {formatearUMA(m.uma)}
              </span>
              <span className="cifra ml-2 text-[var(--color-tinta-suave)]">{m.pesos}</span>
              {!compacto && (
                <span className="block text-xs text-[var(--color-tinta-tenue)]">
                  Aplica cuando el monto es {textoComparador(m.comparador)} esa cantidad · UMA{' '}
                  {m.anioUMA}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Insignia tono={tonoUmbral(vista)}>{vista.resumen}</Insignia>
      )}

      {vista.supuestos && (
        <ul className="mt-1 flex flex-col gap-2 border-l-2 border-[var(--color-borde-fuerte)] pl-3">
          {vista.supuestos.map((s) => (
            <li key={s.descripcion}>
              <p className="text-sm text-[var(--color-tinta)]">{s.descripcion}</p>
              <div className="mt-1">
                <UmbralVista vista={s.vista} compacto />
              </div>
            </li>
          ))}
        </ul>
      )}

      {vista.nota && !compacto && (
        <p className="text-sm text-[var(--color-tinta-suave)]">{vista.nota}</p>
      )}
    </div>
  );
}

/** Atajo para renderizar directamente una especificación en una fecha dada. */
export function Umbral({
  spec,
  fecha,
  compacto,
}: {
  spec: EspecificacionUmbral;
  fecha: string;
  compacto?: boolean;
}) {
  return <UmbralVista vista={describirUmbral(spec, fecha)} compacto={compacto} />;
}
