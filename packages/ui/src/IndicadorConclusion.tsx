import * as React from 'react';
import type { Conclusion, NivelConfianza } from '@leyantilavado/types';
import { cn } from './cn';
import { Insignia } from './primitivos';

/**
 * Presentación de la conclusión del motor.
 *
 * Los textos viven aquí y NO en cada página, para que ninguna herramienta
 * pueda inventar un mensaje más categórico que el que el producto permite.
 * No existe una variante "cumples" ni "estás en regla": la conclusión más
 * benigna es "no parece aplicarte con la información proporcionada".
 */

export const TITULO_CONCLUSION: Record<Conclusion, string> = {
  sin_obligacion_aparente: 'No parece aplicarte con la información proporcionada',
  requiere_identificacion: 'Te aplica identificación, pero no se observa umbral de aviso',
  proximo_al_aviso: 'Estás cerca del umbral de aviso',
  aviso_probable: 'Existe una posible obligación de presentar aviso',
  requiere_revision_profesional: 'Este caso requiere revisión profesional',
  informacion_insuficiente: 'Falta información para dar un resultado',
};

export const DETALLE_CONCLUSION: Record<Conclusion, string> = {
  sin_obligacion_aparente:
    'Con los datos que capturaste no se alcanza ningún umbral. Esto no equivale a una constancia de cumplimiento: otras operaciones, otro periodo u otra actividad pueden cambiar el resultado.',
  requiere_identificacion:
    'Debes identificar al cliente, integrar su expediente y conservarlo, aunque esta operación no genere aviso por sí sola.',
  proximo_al_aviso:
    'La operación quedó dentro del último tramo antes del umbral. Una operación más con el mismo cliente puede disparar la obligación de avisar.',
  aviso_probable:
    'La operación alcanza el umbral de aviso. Verifica la fecha límite y prepara el aviso con la documentación soporte.',
  requiere_revision_profesional:
    'La regla aplicable depende de supuestos que no podemos resolver de forma automática con la información disponible. Consulta a un profesional antes de decidir.',
  informacion_insuficiente:
    'Falta un dato indispensable para resolver la regla. Complétalo y vuelve a calcular: preferimos decirlo a darte un resultado que no se sostiene.',
};

const TONO: Record<Conclusion, 'verde' | 'marino' | 'ambar' | 'rojo' | 'neutro'> = {
  sin_obligacion_aparente: 'verde',
  requiere_identificacion: 'marino',
  proximo_al_aviso: 'ambar',
  aviso_probable: 'rojo',
  requiere_revision_profesional: 'ambar',
  informacion_insuficiente: 'neutro',
};

/**
 * El tono de la conclusión se lee por el fondo y por un contorno completo del
 * mismo color, no por una franja de 4px a la izquierda.
 *
 * Aquí importa más que en otros sitios: este componente es el que da el
 * resultado de una calculadora, y una barra gruesa de color rojo o verde
 * empuja a leer el color antes que el texto. La conclusión de esta
 * herramienta nunca es un semáforo —siempre viene con matices y con la
 * disposición aplicable— y el diseño no debería sugerir lo contrario.
 */
const FONDO: Record<Conclusion, string> = {
  sin_obligacion_aparente:
    'border-[color-mix(in_srgb,var(--color-verde)_32%,transparent)] bg-[var(--color-verde-tenue)]',
  requiere_identificacion:
    'border-[color-mix(in_srgb,var(--color-marino)_30%,transparent)] bg-[var(--color-marino-tenue)]',
  proximo_al_aviso:
    'border-[color-mix(in_srgb,var(--color-ambar)_38%,transparent)] bg-[var(--color-ambar-tenue)]',
  aviso_probable:
    'border-[color-mix(in_srgb,var(--color-rojo)_32%,transparent)] bg-[var(--color-rojo-tenue)]',
  requiere_revision_profesional:
    'border-[color-mix(in_srgb,var(--color-ambar)_38%,transparent)] bg-[var(--color-ambar-tenue)]',
  informacion_insuficiente: 'border-[var(--color-borde-fuerte)] bg-[var(--color-marfil-hondo)]',
};

export const ETIQUETA_CONFIANZA: Record<NivelConfianza, string> = {
  alta: 'Confianza alta',
  media: 'Confianza media',
  baja: 'Confianza baja',
};

export function IndicadorConclusion({
  conclusion,
  confianza,
  className,
  children,
}: {
  conclusion: Conclusion;
  confianza: NivelConfianza;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border p-5',
        FONDO[conclusion],
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
          {TITULO_CONCLUSION[conclusion]}
        </h3>
        <Insignia tono={confianza === 'alta' ? 'verde' : confianza === 'media' ? 'ambar' : 'rojo'}>
          {ETIQUETA_CONFIANZA[confianza]}
        </Insignia>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
        {DETALLE_CONCLUSION[conclusion]}
      </p>
      {children}
    </div>
  );
}

/**
 * Bloque de supuestos e información faltante.
 * Es obligatorio junto a cualquier resultado: el usuario tiene que poder ver
 * qué dimos por hecho y qué no sabemos.
 */
export function SupuestosYFaltantes({
  supuestos,
  informacionFaltante,
  className,
}: {
  supuestos: readonly string[];
  informacionFaltante: readonly string[];
  className?: string;
}) {
  if (supuestos.length === 0 && informacionFaltante.length === 0) return null;

  return (
    <div className={cn('grid gap-4 md:grid-cols-2', className)}>
      {supuestos.length > 0 && (
        <section className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4">
          <h4 className="text-sm font-semibold text-[var(--color-tinta)]">Qué dimos por hecho</h4>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm text-[var(--color-tinta-suave)]">
            {supuestos.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      )}
      {informacionFaltante.length > 0 && (
        <section className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4">
          <h4 className="text-sm font-semibold text-[var(--color-tinta)]">
            Qué falta saber para afinar el resultado
          </h4>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm text-[var(--color-tinta-suave)]">
            {informacionFaltante.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * Aviso de independencia. Aparece en el pie de TODAS las páginas y en cada
 * resultado de herramienta. El texto es único y vive aquí para que no se
 * pueda suavizar página por página.
 */
export const TEXTO_INDEPENDENCIA =
  'LeyAntilavado.org es una plataforma privada e independiente. No pertenece ni está afiliada al SAT, la UIF, la Secretaría de Hacienda ni a ninguna autoridad gubernamental. La información y los resultados de las herramientas son orientativos y no sustituyen asesoría jurídica, fiscal o de cumplimiento profesional.';

export function AvisoIndependencia({
  className,
  compacto,
}: {
  className?: string;
  compacto?: boolean;
}) {
  return (
    <aside
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-4',
        className,
      )}
    >
      <p
        className={cn(
          'text-[var(--color-tinta-suave)]',
          compacto ? 'text-xs leading-relaxed' : 'text-sm leading-relaxed',
        )}
      >
        {TEXTO_INDEPENDENCIA}
      </p>
    </aside>
  );
}
