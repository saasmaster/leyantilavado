'use client';

import { useEffect } from 'react';

/**
 * Registro del service worker.
 *
 * Sólo en producción. En desarrollo hace lo contrario: DESREGISTRA cualquier
 * service worker y borra las cachés.
 *
 * El motivo es un error real y difícil de diagnosticar: un SW registrado en
 * dev sigue sirviendo bundles viejos después de recompilar, y la app falla con
 * "X is not defined" aunque el build esté impecable. Se pierde una tarde
 * buscando un bug que no existe.
 */
export function RegistroSW() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registros) => {
        registros.forEach((r) => void r.unregister());
      });
      if ('caches' in window) {
        caches.keys().then((claves) => claves.forEach((c) => void caches.delete(c)));
      }
      return;
    }

    const alCargar = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Un SW que no registra no rompe la app: sólo se pierde el modo offline.
      });
    };

    if (document.readyState === 'complete') alCargar();
    else window.addEventListener('load', alCargar, { once: true });

    return () => window.removeEventListener('load', alCargar);
  }, []);

  return null;
}
