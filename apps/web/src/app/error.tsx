'use client';

import * as React from 'react';
import Link from 'next/link';
import { Boton, Nota } from '@leyantilavado/ui';

/**
 * Frontera de error de la aplicación.
 *
 * Dos decisiones que importan en un sitio que publica cifras legales:
 *
 *  1. **No se muestra `error.message`.** Un mensaje de servidor puede filtrar
 *     rutas internas o fragmentos de consulta. Lo único que se enseña es
 *     `error.digest`, el identificador que Next genera para cruzarlo con la
 *     bitácora del servidor: sirve para reportarlo y no dice nada de más.
 *
 *  2. **Se advierte explícitamente sobre el cálculo interrumpido.** Si una
 *     herramienta falla a media conversión, lo peligroso no es la pantalla
 *     rota: es que alguien se quede con la cifra que alcanzó a ver.
 */

export default function ErrorDeRuta({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('[leyantilavado] error de ruta:', error);
  }, [error]);

  return (
    <div className="contenedor-app flex min-h-[62vh] flex-col justify-center py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold text-[var(--color-tinta)] md:text-4xl">
          Algo falló al cargar esta página
        </h1>
        <p className="prosa mt-4 text-[1.03rem] text-[var(--color-tinta-suave)]">
          El fallo es nuestro, no de lo que capturaste. Vuelve a intentarlo: la mayoría de estos
          errores son momentáneos y se resuelven al reintentar.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Boton variante="accion" onClick={reset}>
            Reintentar
          </Boton>
          <Boton comoHijo variante="contorno">
            <Link href="/">Ir al inicio</Link>
          </Boton>
          <Boton comoHijo variante="fantasma">
            <Link href="/contacto">Reportar el problema</Link>
          </Boton>
        </div>

        <Nota tono="atencion" titulo="Si estabas usando una calculadora" className="mt-8">
          No des por buena ninguna cifra que hayas alcanzado a ver antes del error: el cálculo
          pudo quedar a medias. Vuelve a correrlo completo antes de tomar cualquier decisión.
        </Nota>

        {error.digest && (
          <p className="cifra mt-6 text-xs text-[var(--color-tinta-tenue)]">
            Referencia para reportarlo: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
