'use client';

import * as React from 'react';
import Script from 'next/script';

/**
 * Widget de Cloudflare Turnstile.
 *
 * Si no hay llave pública configurada no renderiza nada y no carga ningún
 * script: el formulario que lo envuelve sigue funcionando igual. Eso permite
 * desplegar el sitio antes de tener las llaves sin dejar formularios muertos.
 *
 * El widget escribe su token en un input oculto llamado `cf-turnstile-response`
 * dentro del formulario que lo contiene, así que el envío lo arrastra solo,
 * tanto con `FormData` como con JSON construido desde el formulario.
 *
 * `data-theme="auto"` deja que Turnstile siga el tema del sistema. No se le
 * pasa el tema de la aplicación a propósito: el nuestro se resuelve en CSS y
 * leerlo desde React reintroduciría el desajuste de hidratación que se eliminó
 * del selector de tema.
 */

declare global {
  interface Window {
    turnstile?: { reset: (contenedor?: HTMLElement) => void };
  }
}

export function Turnstile({ className }: { className?: string }) {
  const llave = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const contenedor = React.useRef<HTMLDivElement>(null);

  if (!llave) return null;

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
      />
      <div
        ref={contenedor}
        className="cf-turnstile"
        data-sitekey={llave}
        data-theme="auto"
        data-language="es"
      />
      <noscript>
        <p className="text-xs text-[var(--color-tinta-tenue)]">
          Esta verificación necesita JavaScript. Si no puedes activarlo, escríbenos por correo y
          atendemos tu solicitud a mano.
        </p>
      </noscript>
    </div>
  );
}

/**
 * Reinicia el widget tras un envío.
 *
 * Un token de Turnstile es de un solo uso. Sin este reinicio, el segundo envío
 * del mismo formulario —el caso normal cuando el primero devolvió un error de
 * validación— falla con un token ya gastado, y el usuario ve un error que no
 * tiene forma de entender ni de resolver salvo recargando.
 */
export function reiniciarTurnstile() {
  if (typeof window !== 'undefined') window.turnstile?.reset();
}
