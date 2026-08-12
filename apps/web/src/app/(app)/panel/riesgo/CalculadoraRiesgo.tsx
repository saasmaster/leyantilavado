'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { FactorRiesgo } from '@leyantilavado/types';
import { evaluarRiesgo, factoresPorDefecto, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Boton, Insignia, Nota, Tarjeta, TarjetaCuerpo, TarjetaTitulo } from '@leyantilavado/ui';

const TONO: Record<string, 'verde' | 'ambar' | 'rojo'> = {
  bajo: 'verde',
  medio: 'ambar',
  alto: 'rojo',
};

/**
 * Calculadora de clasificación de riesgo.
 *
 * Los factores, sus ponderaciones y los cortes de nivel viven en
 * `@leyantilavado/rules-engine`; aquí sólo se mueven los puntajes. La fecha de
 * la evaluación llega como prop desde el servidor: este componente nunca
 * consulta el reloj (regla `react-hooks/purity`).
 */
export function CalculadoraRiesgo({ fecha }: { fecha: string }) {
  const [factores, setFactores] = useState<FactorRiesgo[]>(() => factoresPorDefecto());

  const evaluacion = evaluarRiesgo({ factores, fecha });

  const cambiar = (clave: string, puntaje: number) =>
    setFactores((previos) =>
      previos.map((f) => (f.clave === clave ? { ...f, puntaje } : f)),
    );

  return (
    <Tarjeta>
      <TarjetaCuerpo className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <TarjetaTitulo className="text-base">
            Puntaje por factor · evaluación al {formatearFechaLarga(fecha)}
          </TarjetaTitulo>
          <Boton
            type="button"
            variante="contorno"
            tamano="sm"
            onClick={() => setFactores(factoresPorDefecto())}
          >
            <RotateCcw aria-hidden="true" />
            Restablecer
          </Boton>
        </div>

        <div className="flex flex-col gap-4">
          {factores.map((f) => {
            const id = `factor-${f.clave}`;
            return (
              <div key={f.clave} className="flex flex-col gap-1.5">
                <label htmlFor={id} className="text-sm font-medium text-[var(--color-tinta)]">
                  {f.etiqueta}
                </label>
                <p className="text-xs text-[var(--color-tinta-tenue)]">
                  Ponderación de la metodología: {(f.ponderacion * 100).toFixed(0)}% · 0 = riesgo
                  mínimo, 100 = riesgo máximo
                </p>
                <div className="flex items-center gap-3">
                  <input
                    id={id}
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={f.puntaje}
                    onChange={(e) => cambiar(f.clave, Number(e.target.value))}
                    className="h-11 w-full cursor-pointer accent-[var(--color-petroleo-vivo)]"
                  />
                  <output
                    htmlFor={id}
                    className="cifra w-12 shrink-0 text-right text-sm font-medium text-[var(--color-tinta)]"
                  >
                    {f.puntaje}
                  </output>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Insignia tono={TONO[evaluacion.nivel] ?? 'neutro'}>
              Riesgo {evaluacion.nivel}
            </Insignia>
            <span className="cifra text-2xl font-semibold text-[var(--color-tinta)]">
              {evaluacion.puntajeFinal}/100
            </span>
            {evaluacion.requiereDebidaDiligenciaReforzada && (
              <Insignia tono="rojo">Debida diligencia reforzada</Insignia>
            )}
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-tinta)]">
            {evaluacion.explicacion}
          </p>
          <p className="text-sm text-[var(--color-tinta-suave)]">
            Próxima revisión sugerida: {formatearFechaLarga(evaluacion.proximaRevision)}
          </p>
        </div>

        <Nota tono="atencion" titulo="Este resultado no se guarda todavía">
          <p>
            El cálculo corre completo en tu navegador. Registrar la clasificación contra un cliente,
            con sus factores y su justificación, requiere la base de datos conectada; por eso no hay
            un botón de guardar que no guarde nada.
          </p>
          <p>
            La metodología precargada es un punto de partida documentado, no la única válida: la
            norma exige que cada organización justifique la suya y la revise periódicamente.
          </p>
        </Nota>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}
