'use client';

import { useState } from 'react';
import { RESICO, pesos, porcentaje, tasaDeTabla, tasaResico } from '@/content/analisis';
import { Figura, FilaGlobo, Globo, Leyenda, izquierdaDelGlobo } from './Figura';
import { useAncho } from './useAncho';

/**
 * La escalera de tasas del RESICO para personas físicas, y lo único que la
 * propuesta le cambia: el último escalón llega más lejos.
 *
 * Énfasis otra vez: la tabla vigente es contexto (gris) y el tramo propuesto
 * es la historia (acento). Leer la gráfica debería bastar para entender la
 * frase clave del análisis: las tasas no suben ni bajan; se mueve el tope.
 *
 * La tasa en cada punto la da `tasaResico`, con prueba. Ojo con lo que esa
 * escalera significa: en el RESICO la tasa del tramo se aplica a TODO el
 * ingreso, no sólo al excedente. No es una tarifa marginal.
 */

const ALTO = 280;
const M = { arriba: 28, derecha: 20, abajo: 48, izquierda: 44 } as const;
const X_MAX = 5_400_000;
const Y_MAX = 0.03;
const PASO = 50_000;
const HOY = RESICO.fisicas.limiteVigente;
const PROPUESTA = RESICO.fisicas.limitePropuesto;
const TOPE = RESICO.tablaAnual[RESICO.tablaAnual.length - 1]!.tasa;
const COLOR_HOY = 'var(--grafica-contexto)';
const COLOR_PROPUESTA = 'var(--grafica-acento)';
const TEXTO = { fill: 'var(--color-tinta-suave)', fontSize: 12 } as const;

const leer = (t: number | null) => (t === null ? 'fuera del RESICO' : tasaDeTabla(t));

const FILAS: readonly (readonly string[])[] = [
  ...RESICO.tablaAnual.map((t) => [`Hasta ${pesos(t.hasta)}`, tasaDeTabla(t.tasa), tasaDeTabla(t.tasa)]),
  [`De ${pesos(HOY)} a ${pesos(PROPUESTA)}`, 'Fuera del RESICO', tasaDeTabla(TOPE)],
  [`Más de ${pesos(PROPUESTA)}`, 'Fuera del RESICO', 'Fuera del RESICO'],
];

export function GraficaEscaleraResico() {
  const [ref, ancho] = useAncho();
  const [ingreso, setIngreso] = useState<number | null>(null);

  const anchoPlot = Math.max(ancho - M.izquierda - M.derecha, 1);
  const altoPlot = ALTO - M.arriba - M.abajo;
  const x = (v: number) => M.izquierda + (v / X_MAX) * anchoPlot;
  const y = (v: number) => M.arriba + (1 - v / Y_MAX) * altoPlot;

  let escalera = `M ${x(0)} ${y(RESICO.tablaAnual[0]!.tasa)}`;
  RESICO.tablaAnual.forEach((t, i) => {
    escalera += ` L ${x(t.hasta)} ${y(t.tasa)}`;
    const siguiente = RESICO.tablaAnual[i + 1];
    if (siguiente) escalera += ` L ${x(t.hasta)} ${y(siguiente.tasa)}`;
  });

  function desdePuntero(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * ancho;
    const v = ((px - M.izquierda) / anchoPlot) * X_MAX;
    setIngreso(Math.min(X_MAX, Math.max(0, Math.round(v / PASO) * PASO)));
  }

  function conTeclado(e: React.KeyboardEvent<HTMLDivElement>) {
    const paso = e.shiftKey ? PASO * 10 : PASO;
    const actual = ingreso ?? HOY;
    const siguiente =
      e.key === 'ArrowRight' || e.key === 'ArrowUp'
        ? actual + paso
        : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
          ? actual - paso
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? X_MAX
              : null;
    if (siguiente === null) return;
    e.preventDefault();
    setIngreso(Math.min(X_MAX, Math.max(0, siguiente)));
  }

  const tasaHoy = ingreso === null ? null : tasaResico(ingreso, HOY);
  const tasaProp = ingreso === null ? null : tasaResico(ingreso, PROPUESTA);
  const lectura =
    ingreso === null
      ? ''
      : `Con ingresos de ${pesos(ingreso)} al año: hoy, ${leer(tasaHoy)}; con la propuesta, ${leer(tasaProp)}.`;

  const descripcion = `Tasas del RESICO para personas físicas: ${RESICO.tablaAnual
    .map((t) => `${tasaDeTabla(t.tasa)} hasta ${pesos(t.hasta)}`)
    .join(', ')}. La propuesta alarga el tramo de ${tasaDeTabla(TOPE)} hasta ${pesos(PROPUESTA)} sin cambiar ninguna tasa.`;

  return (
    <Figura
      titulo="Las tasas no cambian: se mueve el tope"
      subtitulo={`La escalera vigente termina en ${pesos(HOY)}. La propuesta estira su último escalón, el de ${tasaDeTabla(TOPE)}, hasta ${pesos(PROPUESTA)}. La tasa de tu tramo se aplica a todo tu ingreso, no sólo al excedente.`}
      fuente="LISR vigente, art. 113-F, y la iniciativa que reforma la LISR (Gaceta Parlamentaria, 8 de septiembre de 2026, Anexo E)."
      tabla={{
        etiqueta: 'Tasa del RESICO para personas físicas según ingresos anuales, hoy y con la propuesta',
        columnas: ['Ingresos cobrados en el año', 'Tasa hoy', 'Tasa con la propuesta'],
        filas: FILAS,
      }}
    >
      <Leyenda
        items={[
          { etiqueta: `Tabla vigente, hasta ${pesos(HOY)}`, color: COLOR_HOY, forma: 'linea' },
          { etiqueta: `Propuesta 2027, hasta ${pesos(PROPUESTA)}`, color: COLOR_PROPUESTA, forma: 'linea' },
        ]}
      />
      <p className="mt-3 text-xs text-[var(--color-tinta-tenue)]">Tasa sobre todo lo cobrado</p>

      <div
        ref={ref}
        role="group"
        tabIndex={0}
        aria-label="Gráfica interactiva. Usa las flechas para recorrer los ingresos de 50 mil en 50 mil pesos; con Mayúsculas, de 500 mil en 500 mil."
        onKeyDown={conTeclado}
        onFocus={() => setIngreso((v) => v ?? HOY)}
        onBlur={() => setIngreso(null)}
        className="relative mt-1 rounded-[var(--radius-control)] outline-offset-4"
      >
        <svg
          role="img"
          aria-label={descripcion}
          viewBox={`0 0 ${ancho} ${ALTO}`}
          style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'pan-y' }}
          onPointerMove={desdePuntero}
          onPointerLeave={(e) => {
            if (!e.currentTarget.parentElement?.contains(document.activeElement)) setIngreso(null);
          }}
        >
          {[0, 0.01, 0.02, 0.03].map((t) => (
            <g key={t}>
              <line x1={x(0)} x2={x(X_MAX)} y1={y(t)} y2={y(t)} stroke="var(--grafica-rejilla)" strokeWidth={1} />
              <text x={M.izquierda - 8} y={y(t)} dy="0.32em" textAnchor="end" className="cifra" style={TEXTO}>
                {porcentaje(t)}
              </text>
            </g>
          ))}
          {[0, 1, 2, 3, 4, 5].map((m) => (
            <text key={m} x={x(m * 1_000_000)} y={ALTO - M.abajo + 18} textAnchor="middle" className="cifra" style={TEXTO}>
              {m}
            </text>
          ))}
          <text x={x(X_MAX / 2)} y={ALTO - 6} textAnchor="middle" style={{ ...TEXTO, fill: 'var(--color-tinta-tenue)' }}>
            Ingresos cobrados en el año, millones de pesos
          </text>

          <path d={escalera} stroke={COLOR_HOY} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" fill="none" />
          <path
            d={`M ${x(HOY)} ${y(TOPE)} L ${x(PROPUESTA)} ${y(TOPE)}`}
            stroke={COLOR_PROPUESTA}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />

          <circle cx={x(HOY)} cy={y(TOPE)} r={4.5} fill={COLOR_HOY} stroke="var(--grafica-superficie)" strokeWidth={2} />
          <circle cx={x(PROPUESTA)} cy={y(TOPE)} r={4.5} fill={COLOR_PROPUESTA} stroke="var(--grafica-superficie)" strokeWidth={2} />
          {/*
           * «Hoy» va DEBAJO de la línea y «Propuesta» encima. Las dos encima
           * chocaban en móvil: a 301 px los dos puntos quedan a 66 px, menos
           * que lo que ocupan juntas. Debajo del tope hay hueco a cualquier
           * ancho, porque el escalón del 2 % termina en 2.5 millones.
           */}
          <text x={x(HOY)} y={y(TOPE) + 20} textAnchor="middle" style={{ ...TEXTO, fill: 'var(--color-tinta)' }}>
            Hoy
          </text>
          <text x={x(PROPUESTA)} y={y(TOPE) - 12} textAnchor="end" style={{ ...TEXTO, fill: 'var(--color-tinta)' }}>
            Propuesta
          </text>

          {ingreso !== null && (
            <g>
              <line x1={x(ingreso)} x2={x(ingreso)} y1={y(Y_MAX)} y2={y(0)} stroke="var(--grafica-cruz)" strokeWidth={1} />
              {tasaProp !== null && (
                <circle
                  cx={x(ingreso)}
                  cy={y(tasaProp)}
                  r={4.5}
                  fill={tasaHoy === null ? COLOR_PROPUESTA : COLOR_HOY}
                  stroke="var(--grafica-superficie)"
                  strokeWidth={2}
                />
              )}
            </g>
          )}
        </svg>

        {ingreso !== null && (
          <Globo izquierda={izquierdaDelGlobo(x(ingreso), ancho)} arriba={M.arriba}>
            <p className="text-[var(--color-tinta-tenue)]">{pesos(ingreso)} al año</p>
            <FilaGlobo color={COLOR_HOY} valor={leer(tasaHoy)} etiqueta="hoy" />
            <FilaGlobo color={COLOR_PROPUESTA} valor={leer(tasaProp)} etiqueta="con la propuesta" />
          </Globo>
        )}
        <p className="sr-only" aria-live="polite">
          {lectura}
        </p>
      </div>
    </Figura>
  );
}
