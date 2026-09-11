import { TablaEnvoltura } from '@leyantilavado/ui';
import { TABLA, TD, TD_CIFRA, TH } from '../estilos';

/**
 * Armazón común de las gráficas de los análisis.
 *
 * Cada gráfica trae tres cosas además del dibujo, y ninguna es opcional:
 *
 * - **Leyenda**, siempre que haya dos series o más: la identidad nunca
 *   depende sólo del color.
 * - **Tabla gemela** con los mismos datos. La gráfica explica; la tabla es la
 *   versión que funciona sin ver la gráfica, con lector de pantalla o impresa.
 * - **Fuente**, porque en este sitio ningún número va sin su origen.
 *
 * Los colores salen de las variables `--grafica-*` de `globals.css`, que
 * están validadas en claro y en oscuro con la herramienta de visualización.
 */

export interface TablaGemela {
  etiqueta: string;
  columnas: readonly string[];
  filas: readonly (readonly string[])[];
}

export function Figura({
  titulo,
  subtitulo,
  fuente,
  tabla,
  children,
}: {
  titulo: string;
  subtitulo: string;
  fuente: string;
  tabla: TablaGemela;
  children: React.ReactNode;
}) {
  return (
    <figure className="grafica mt-8 rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4 md:p-6">
      <figcaption>
        <p className="font-semibold text-[var(--color-tinta)]">{titulo}</p>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--color-tinta-suave)]">{subtitulo}</p>
      </figcaption>

      <div className="mt-4">{children}</div>

      <p className="mt-3 text-xs text-[var(--color-tinta-tenue)]">{fuente}</p>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-medium text-[var(--color-petroleo-hondo)]">
          Ver los datos en tabla
        </summary>
        <TablaEnvoltura etiqueta={tabla.etiqueta} className="mt-3">
          <table className={`${TABLA} min-w-[30rem]`}>
            <caption className="sr-only">{tabla.etiqueta}</caption>
            <thead>
              <tr>
                {tabla.columnas.map((c, i) => (
                  <th key={c} scope="col" className={i === 0 ? TH : `${TH} text-right`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabla.filas.map((fila) => (
                <tr key={fila[0]}>
                  {fila.map((v, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" className={`${TD} font-medium text-[var(--color-tinta)]`}>
                        {v}
                      </th>
                    ) : (
                      <td key={i} className={TD_CIFRA}>
                        {v}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>
      </details>
    </figure>
  );
}

/** La clave imita a la marca: trazo para líneas, punto para puntos. */
export function Leyenda({
  items,
}: {
  items: readonly { etiqueta: string; color: string; forma: 'linea' | 'punto' }[];
}) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[var(--color-tinta-suave)]" aria-label="Leyenda">
      {items.map((it) => (
        <li key={it.etiqueta} className="flex items-center gap-2">
          <span
            aria-hidden
            className={it.forma === 'linea' ? 'h-0.5 w-4 shrink-0 rounded-full' : 'size-2.5 shrink-0 rounded-full'}
            style={{ background: it.color }}
          />
          {it.etiqueta}
        </li>
      ))}
    </ul>
  );
}

/** Ancho del globo en píxeles: `w-52`. Se usa para que nunca salga del contenedor. */
export const ANCHO_GLOBO = 208;

/**
 * Posición horizontal del globo: a la derecha de la guía si cabe, si no a la
 * izquierda, y nunca fuera del contenedor.
 */
export function izquierdaDelGlobo(px: number, ancho: number): number {
  const derecha = px + 12;
  const pos = derecha + ANCHO_GLOBO > ancho ? px - 12 - ANCHO_GLOBO : derecha;
  return Math.max(0, pos);
}

/**
 * Globo de lectura. Es `aria-hidden` porque su contenido se anuncia por la
 * región viva de cada gráfica: el globo es la versión visual, no la única.
 */
export function Globo({
  izquierda,
  arriba,
  children,
}: {
  izquierda: number;
  arriba: number;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-10 w-52 rounded-[var(--radius-control)] border border-[var(--color-borde)] bg-[var(--color-superficie)] p-3 text-xs leading-snug shadow-[0_10px_28px_-14px_rgb(10_31_60/.4)]"
      style={{ left: izquierda, top: arriba }}
    >
      {children}
    </div>
  );
}

/** Fila del globo: el valor manda, el nombre acompaña; clave de trazo, no de caja. */
export function FilaGlobo({ color, valor, etiqueta }: { color: string; valor: string; etiqueta: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-2">
      <span aria-hidden className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: color }} />
      <strong className="cifra text-[var(--color-tinta)]">{valor}</strong>
      <span className="text-[var(--color-tinta-tenue)]">{etiqueta}</span>
    </p>
  );
}
