'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Microanimación de entrada. 220 ms, desplazamiento de 12 px: suficiente para
 * que la sección se sienta viva y demasiado corto para que estorbe.
 *
 * Con `prefers-reduced-motion` no hay animación en absoluto — no se "reduce",
 * se elimina, que es lo que pide la preferencia.
 */
export function Aparece({
  children,
  retraso = 0,
  className,
}: {
  children: React.ReactNode;
  retraso?: number;
  className?: string;
}) {
  const reducido = useReducedMotion();

  if (reducido) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.22, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
