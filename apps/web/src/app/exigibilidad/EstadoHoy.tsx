'use client';

import * as React from 'react';
import { diferenciaDias } from '@leyantilavado/rules-engine';
import { Insignia } from '@leyantilavado/ui';

/* ────────────────────────────────────────────────────────────────────────────
 * «Hoy» sin romper la hidratación ni congelarse en la fecha del build
 *
 * Esta página existe para responder «¿esto ya me es exigible?», así que su
 * única columna volátil depende del reloj. En este proyecto eso tiene tres
 * trampas conocidas, y las tres se esquivan con el mismo patrón que ya usan
 * `CuentaRegresivaReglas` y la herramienta `plan-30-noviembre`:
 *
 *  1. `new Date()` durante el render dispara la regla `react-hooks/purity` de
 *     eslint, que `tsc` no ve y sólo aparece en `next build`.
 *  2. Servidor y cliente calcularían instantes distintos y la hidratación
 *     fallaría.
 *  3. En un sitio estático, «hoy» al construir es la fecha del despliegue y se
 *     quedaría congelada ahí para siempre. Es el error que más caro sale en una
 *     tabla de exigibilidad: diría «faltan 100 días» durante meses.
 *
 * Por eso el reloj se lee con `useSyncExternalStore` y `getServerSnapshot`
 * devuelve `null`: el HTML del servidor y el del primer render del cliente son
 * idénticos —y muestran la fecha, que es el dato duro—, y la cuenta aparece al
 * hidratar. Sin JavaScript, la tabla sigue completa: fechas, fundamento y
 * fuente están en el HTML.
 *
 * ponytail: el valor se cachea a nivel de módulo y no se refresca solo — la
 * granularidad es de días y una pestaña abierta durante la medianoche muestra
 * el día anterior hasta que se recarga. Si algún día importa, se suscribe un
 * intervalo como en `CuentaRegresivaReglas`.
 * ────────────────────────────────────────────────────────────────────────── */

let hoyEnCache: string | null = null;
const sinSuscripcion = () => () => {};
const leerHoy = (): string => (hoyEnCache ??= new Date().toISOString().slice(0, 10));
const enElServidor = (): null => null;

export function EstadoHoy({ fecha, fechaFin }: { fecha: string; fechaFin?: string }) {
  const hoy = React.useSyncExternalStore(sinSuscripcion, leerHoy, enElServidor);

  if (hoy === null) {
    return (
      <span className="text-xs text-[var(--color-tinta-tenue)]">
        Se calcula en tu navegador contra la fecha de hoy.
      </span>
    );
  }

  const dias = diferenciaDias(hoy, fecha);

  if (dias <= 0) {
    const dentroDelPeriodo = fechaFin !== undefined && hoy <= fechaFin;
    return (
      <div className="flex flex-col items-start gap-1">
        <Insignia tono="verde">Ya exigible</Insignia>
        {fechaFin !== undefined && (
          <span className="text-xs text-[var(--color-tinta-tenue)]">
            {dentroDelPeriodo ? 'El periodo está corriendo.' : 'El periodo ya cerró.'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Insignia tono={dias <= 30 ? 'rojo' : dias <= 180 ? 'ambar' : 'marino'}>
        Faltan {dias.toLocaleString('es-MX')} días
      </Insignia>
      <span className="text-xs text-[var(--color-tinta-tenue)]">Todavía no es exigible.</span>
    </div>
  );
}
