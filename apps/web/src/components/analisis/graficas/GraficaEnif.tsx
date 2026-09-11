'use client';

import { useState } from 'react';
import { ENIF, pesos, porcentaje } from '@/content/analisis';
import { Figura, FilaGlobo, Globo, Leyenda, izquierdaDelGlobo } from './Figura';
import { useAncho } from './useAncho';

/**
 * Antes y después de la ENIF, en un solo eje de 0 a 100 %.
 *
 * Un solo eje a propósito. Con dos escalas —una para el efectivo, otra para
 * las transferencias— el paso de 1.6 % a 4.4 % parecería un salto enorme; en
 * la misma escala se ve lo que es: el efectivo sigue siendo casi todo. Ésa es
 * la frase de la exposición de motivos, y la gráfica tiene que decirla sin
 * exagerarla.
 *
 * Dos tonos de una misma rampa (antes, después), validados como rampa ordinal
 * en claro y en oscuro. Cada fila lleva una sola etiqueta en su lado libre:
 * las dos cifras de las transferencias están a 2.8 puntos, y dos etiquetas
 * ahí chocarían.
 */

const ALTO = 180;
const M = { arriba: 8, derecha: 16, abajo: 44, izquierda: 12 } as const;
const FILA = 62;
const COLOR_ANTES = 'var(--grafica-antes)';
const COLOR_DESPUES = 'var(--grafica-despues)';
const TEXTO = { fill: 'var(--color-tinta-suave)', fontSize: 12 } as const;

const FILAS = [
  { nombre: 'Efectivo', ...ENIF.efectivoFrecuente, lado: 'izquierda' as const },
  { nombre: 'Transferencias y aplicaciones', ...ENIF.transferenciasYApps, lado: 'derecha' as const },
];

type Punto = { fila: number; momento: 'antes' | 'despues' };

export function GraficaEnif() {
  const [ref, ancho] = useAncho();
  const [activo, setActivo] = useState<Punto | null>(null);

  const anchoPlot = Math.max(ancho - M.izquierda - M.derecha, 1);
  const x = (f: number) => M.izquierda + f * anchoPlot;
  const centro = (i: number) => M.arriba + 34 + i * FILA;
  const eje = ALTO - M.abajo;

  const anio = (m: Punto['momento']) => (m === 'antes' ? ENIF.anioAntes : ENIF.anioDespues);
  const valor = (p: Punto) => FILAS[p.fila]![p.momento];
  const lectura = activo ? `${FILAS[activo.fila]!.nombre}, ${anio(activo.momento)}: ${porcentaje(valor(activo))}.` : '';

  return (
    <Figura
      titulo={`Cómo se paga una compra de ${pesos(ENIF.montoCompra)} o menos`}
      subtitulo={`Medio de pago más frecuente, ${ENIF.anioAntes} contra ${ENIF.anioDespues}. El efectivo retrocede cinco puntos y sigue siendo casi todo; las transferencias y apps casi se triplican y siguen siendo pocas.`}
      fuente="Encuesta Nacional de Inclusión Financiera 2024 (INEGI), citada en la exposición de motivos de la iniciativa de Ley de Economía Digital."
      tabla={{
        etiqueta: `Medio de pago más frecuente en compras de ${pesos(ENIF.montoCompra)} o menos, ${ENIF.anioAntes} y ${ENIF.anioDespues}`,
        columnas: ['Medio de pago', String(ENIF.anioAntes), String(ENIF.anioDespues)],
        filas: FILAS.map((f) => [f.nombre, porcentaje(f.antes), porcentaje(f.despues)]),
      }}
    >
      <Leyenda
        items={[
          { etiqueta: String(ENIF.anioAntes), color: COLOR_ANTES, forma: 'punto' },
          { etiqueta: String(ENIF.anioDespues), color: COLOR_DESPUES, forma: 'punto' },
        ]}
      />

      <div ref={ref} className="relative mt-3">
        <svg
          role="img"
          aria-label={`Entre ${ENIF.anioAntes} y ${ENIF.anioDespues}, el efectivo como medio de pago más frecuente pasó de ${porcentaje(ENIF.efectivoFrecuente.antes)} a ${porcentaje(ENIF.efectivoFrecuente.despues)}, y las transferencias y aplicaciones de ${porcentaje(ENIF.transferenciasYApps.antes)} a ${porcentaje(ENIF.transferenciasYApps.despues)}.`}
          viewBox={`0 0 ${ancho} ${ALTO}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={M.arriba} y2={eje} stroke="var(--grafica-rejilla)" strokeWidth={1} />
              <text
                x={x(t)}
                y={eje + 18}
                textAnchor={t === 0 ? 'start' : t === 1 ? 'end' : 'middle'}
                className="cifra"
                style={TEXTO}
              >
                {porcentaje(t)}
              </text>
            </g>
          ))}
          <line x1={x(0)} x2={x(1)} y1={eje} y2={eje} stroke="var(--grafica-rejilla)" strokeWidth={1} />

          {FILAS.map((f, i) => {
            const cy = centro(i);
            const menor = Math.min(f.antes, f.despues);
            const mayor = Math.max(f.antes, f.despues);
            const etiqueta = `${porcentaje(f.despues)} en ${ENIF.anioDespues} · ${porcentaje(f.antes)} en ${ENIF.anioAntes}`;
            return (
              <g key={f.nombre}>
                <text x={M.izquierda} y={cy - 18} style={{ ...TEXTO, fill: 'var(--color-tinta)', fontWeight: 500 }}>
                  {f.nombre}
                </text>
                <line
                  x1={x(menor)}
                  x2={x(mayor)}
                  y1={cy}
                  y2={cy}
                  stroke="var(--grafica-contexto)"
                  strokeOpacity={0.5}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <text
                  x={f.lado === 'izquierda' ? x(menor) - 12 : x(mayor) + 12}
                  y={cy}
                  dy="0.32em"
                  textAnchor={f.lado === 'izquierda' ? 'end' : 'start'}
                  className="cifra"
                  style={TEXTO}
                >
                  {etiqueta}
                </text>
                {(['antes', 'despues'] as const).map((m) => (
                  <g
                    key={m}
                    tabIndex={0}
                    role="img"
                    aria-label={`${f.nombre}, ${anio(m)}: ${porcentaje(f[m])}`}
                    onPointerEnter={() => setActivo({ fila: i, momento: m })}
                    onPointerLeave={() => setActivo(null)}
                    onFocus={() => setActivo({ fila: i, momento: m })}
                    onBlur={() => setActivo(null)}
                    style={{ outline: 'none' }}
                  >
                    {/* Blanco de 24 px: nadie acierta a un punto de 10 px. */}
                    <circle cx={x(f[m])} cy={cy} r={12} fill="transparent" />
                    <circle
                      cx={x(f[m])}
                      cy={cy}
                      r={activo?.fila === i && activo.momento === m ? 6.5 : 5}
                      fill={m === 'antes' ? COLOR_ANTES : COLOR_DESPUES}
                      stroke="var(--grafica-superficie)"
                      strokeWidth={2}
                    />
                  </g>
                ))}
              </g>
            );
          })}
        </svg>

        {activo && (
          <Globo izquierda={izquierdaDelGlobo(x(valor(activo)), ancho)} arriba={centro(activo.fila) + 14}>
            <p className="text-[var(--color-tinta-tenue)]">{FILAS[activo.fila]!.nombre}</p>
            <FilaGlobo
              color={activo.momento === 'antes' ? COLOR_ANTES : COLOR_DESPUES}
              valor={porcentaje(valor(activo))}
              etiqueta={`en ${anio(activo.momento)}`}
            />
          </Globo>
        )}
        <p className="sr-only" aria-live="polite">
          {lectura}
        </p>
      </div>
    </Figura>
  );
}
