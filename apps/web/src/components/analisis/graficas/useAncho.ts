'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Ancho real del contenedor, para dibujar el SVG en píxeles 1:1.
 *
 * ── Por qué no basta con un `viewBox` fijo ─────────────────────────────────
 *
 * Un SVG de 640 unidades escalado a un teléfono de 343 px encoge TODO por
 * igual, texto incluido: una etiqueta de 12 px acaba en 6.4 px, ilegible. Aquí
 * el `viewBox` se iguala al ancho medido, así que las etiquetas conservan su
 * tamaño y es la geometría la que se adapta.
 *
 * El valor inicial es el mismo en servidor y cliente —640— para que la
 * hidratación no difiera; el observador lo corrige en cuanto el componente
 * se monta. Mientras tanto el SVG escala con su `viewBox` y nunca desborda.
 */
export function useAncho(inicial = 640) {
  const ref = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(inicial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) => {
      if (entrada) setAncho(Math.max(1, Math.round(entrada.contentRect.width)));
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return [ref, ancho] as const;
}
