'use client';

import { useState } from 'react';
import {
  TASA_GENERAL,
  TASA_OPCIONAL,
  ivaNormal,
  porcentaje,
  puntoDeEquilibrio,
} from '@/content/analisis';
import { Figura, FilaGlobo, Globo, Leyenda, izquierdaDelGlobo } from './Figura';
import { useAncho } from './useAncho';

/**
 * IVA a pagar según cuánto pesan las compras: la gráfica del punto de
 * equilibrio.
 *
 * Forma de ÉNFASIS, no categórica: la opción del 7 % es la historia y va en
 * el acento; la mecánica normal es el contexto y va en gris. El ámbar del
 * sitio se descartó a propósito: es su tono de «atención», y un color de
 * estado usado como serie le diría al lector que una de las dos es un aviso.
 *
 * Todas las posiciones salen de `ivaNormal` y `puntoDeEquilibrio`, las mismas
 * funciones —con prueba— que alimentan la tabla del artículo.
 */

const ALTO = 300;
const M = { arriba: 28, derecha: 16, abajo: 48, izquierda: 44 } as const;
const EQ = puntoDeEquilibrio() * 100;
const COLOR_NORMAL = 'var(--grafica-contexto)';
const COLOR_OPCION = 'var(--grafica-acento)';
const TEXTO = { fill: 'var(--color-tinta-suave)', fontSize: 12 } as const;

/** IVA como % de las ventas cuando las compras son `c` % de las ventas. */
const normal = (c: number) => ivaNormal(100, c);
const pct = (v: number) => porcentaje(v / 100);

function veredicto(c: number): string {
  const d = normal(c) - TASA_OPCIONAL;
  if (Math.abs(d) < 1e-9) return 'Cuestan lo mismo';
  return d > 0 ? 'Conviene la opción del 7 %' : 'Conviene la mecánica normal';
}

const FILAS = [0, 25, 50, EQ, 75, 100].map((c) => [
  pct(c),
  pct(normal(c)),
  pct(TASA_OPCIONAL),
  veredicto(c),
]);

export function GraficaIvaEquilibrio() {
  const [ref, ancho] = useAncho();
  const [c, setC] = useState<number | null>(null);

  const anchoPlot = Math.max(ancho - M.izquierda - M.derecha, 1);
  const altoPlot = ALTO - M.arriba - M.abajo;
  const x = (v: number) => M.izquierda + (v / 100) * anchoPlot;
  const y = (v: number) => M.arriba + (1 - v / TASA_GENERAL) * altoPlot;
  /**
   * En un teléfono las frases de zona no caben enteras dentro de su triángulo:
   * medido a 301 px, «Conviene la normal» quedaba atravesada por la línea. Bajo
   * este ancho van en dos renglones, cada uno calculado para caer dentro de su
   * zona, y el eje pierde la marca del 75 % para no amontonarse.
   */
  const estrecho = anchoPlot < 420;

  function desdePuntero(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * ancho;
    setC(Math.round(Math.min(100, Math.max(0, ((px - M.izquierda) / anchoPlot) * 100))));
  }

  function conTeclado(e: React.KeyboardEvent<HTMLDivElement>) {
    const paso = e.shiftKey ? 10 : 1;
    const actual = c ?? Math.round(EQ);
    const siguiente =
      e.key === 'ArrowRight' || e.key === 'ArrowUp'
        ? actual + paso
        : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
          ? actual - paso
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? 100
              : null;
    if (siguiente === null) return;
    e.preventDefault();
    setC(Math.min(100, Math.max(0, siguiente)));
  }

  const lectura =
    c === null
      ? ''
      : `Con compras iguales al ${pct(c)} de tus ventas, la mecánica normal cuesta el ${pct(normal(c))} de tus ventas y la opción el ${pct(TASA_OPCIONAL)}. ${veredicto(c)}.`;

  return (
    <Figura
      titulo="Cuánto IVA pagarías con cada mecánica"
      subtitulo={`La mecánica normal baja a medida que tus compras con IVA pesan más; la opción se queda fija en ${TASA_OPCIONAL} %. Se cruzan cuando tus compras llegan al ${pct(EQ)} de tus ventas.`}
      fuente="Cálculo propio sobre la iniciativa de Ley de Ingresos 2027, art. 25, fr. XVIII, a tasa general del 16 % y sin retenciones."
      tabla={{
        etiqueta: 'IVA a pagar como porcentaje de las ventas, según el peso de las compras',
        columnas: ['Compras (% de las ventas)', 'IVA normal', 'IVA con la opción', 'Qué conviene'],
        filas: FILAS,
      }}
    >
      <Leyenda
        items={[
          { etiqueta: 'Mecánica normal: 16 % menos lo que acreditas', color: COLOR_NORMAL, forma: 'linea' },
          { etiqueta: `Opción: ${TASA_OPCIONAL} % fijo, sin acreditar`, color: COLOR_OPCION, forma: 'linea' },
        ]}
      />
      <p className="mt-3 text-xs text-[var(--color-tinta-tenue)]">IVA a pagar, en % de tus ventas</p>

      <div
        ref={ref}
        role="group"
        tabIndex={0}
        aria-label="Gráfica interactiva. Usa las flechas para mover la guía y leer los valores; con Mayúsculas avanza de 10 en 10."
        onKeyDown={conTeclado}
        onFocus={() => setC((v) => v ?? Math.round(EQ))}
        onBlur={() => setC(null)}
        className="relative mt-1 rounded-[var(--radius-control)] outline-offset-4"
      >
        <svg
          role="img"
          aria-label={`La mecánica normal baja de 16 % a 0 % de las ventas conforme aumentan las compras; la opción se queda en ${TASA_OPCIONAL} %. Se cruzan cuando las compras son el ${pct(EQ)} de las ventas: por debajo conviene la opción, por encima la mecánica normal.`}
          viewBox={`0 0 ${ancho} ${ALTO}`}
          style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'pan-y' }}
          onPointerMove={desdePuntero}
          onPointerLeave={(e) => {
            if (!e.currentTarget.parentElement?.contains(document.activeElement)) setC(null);
          }}
        >
          {/* Rejilla: líneas finas y sólidas, un paso fuera de la superficie. */}
          {[0, 4, 8, 12, 16].map((t) => (
            <g key={t}>
              <line x1={x(0)} x2={x(100)} y1={y(t)} y2={y(t)} stroke="var(--grafica-rejilla)" strokeWidth={1} />
              <text x={M.izquierda - 8} y={y(t)} dy="0.32em" textAnchor="end" className="cifra" style={TEXTO}>
                {t} %
              </text>
            </g>
          ))}
          {[0, 25, ...(estrecho ? [] : [75]), 100].map((t) => (
            // La última etiqueta se ancla al final: centrada, «100 %» se salía
            // del SVG y se recortaba.
            <text key={t} x={x(t)} y={ALTO - M.abajo + 18} textAnchor={t === 100 ? 'end' : 'middle'} className="cifra" style={TEXTO}>
              {t} %
            </text>
          ))}
          <text x={x(50)} y={ALTO - 6} textAnchor="middle" style={{ ...TEXTO, fill: 'var(--color-tinta-tenue)' }}>
            Compras con IVA, en % de tus ventas
          </text>

          {/* Zona donde la opción cuesta menos: un lavado, no un bloque. */}
          <polygon
            points={`${x(0)},${y(TASA_GENERAL)} ${x(EQ)},${y(TASA_OPCIONAL)} ${x(0)},${y(TASA_OPCIONAL)}`}
            fill="var(--grafica-acento)"
            fillOpacity={0.1}
          />

          {/* Guía del punto de equilibrio hasta el eje, con su valor exacto. */}
          <line
            x1={x(EQ)}
            x2={x(EQ)}
            y1={y(TASA_OPCIONAL)}
            y2={y(0)}
            stroke="var(--grafica-cruz)"
            strokeWidth={1}
          />
          <text
            x={x(EQ)}
            y={ALTO - M.abajo + 18}
            textAnchor="middle"
            className="cifra"
            style={{ ...TEXTO, fill: 'var(--color-tinta)', fontWeight: 600 }}
          >
            {pct(EQ)}
          </text>

          <path
            d={`M ${x(0)} ${y(TASA_GENERAL)} L ${x(100)} ${y(0)}`}
            stroke={COLOR_NORMAL}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${x(0)} ${y(TASA_OPCIONAL)} L ${x(100)} ${y(TASA_OPCIONAL)}`}
            stroke={COLOR_OPCION}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />

          {/* Etiquetas directas, pocas y donde no chocan. */}
          <text x={x(1)} y={y(TASA_GENERAL) - 10} style={TEXTO}>
            Normal
          </text>
          <text x={x(100)} y={y(TASA_OPCIONAL) - 8} textAnchor="end" style={TEXTO}>
            Opción {TASA_OPCIONAL} %
          </text>
          {estrecho ? (
            <>
              <text y={y(9.2)} style={{ ...TEXTO, fill: 'var(--color-tinta)' }}>
                <tspan x={x(4)}>Conviene</tspan>
                <tspan x={x(4)} dy="1.2em">la opción</tspan>
              </text>
              <text y={y(5.9)} textAnchor="end" style={{ ...TEXTO, fill: 'var(--color-tinta)' }}>
                <tspan x={x(98)}>Conviene</tspan>
                <tspan x={x(98)} dy="1.2em">la normal</tspan>
              </text>
            </>
          ) : (
            <>
              <text x={x(4)} y={y(7.6)} style={{ ...TEXTO, fill: 'var(--color-tinta)' }}>
                Conviene la opción
              </text>
              <text x={x(98)} y={y(5.6)} textAnchor="end" style={{ ...TEXTO, fill: 'var(--color-tinta)' }}>
                Conviene la normal
              </text>
            </>
          )}

          <circle
            cx={x(EQ)}
            cy={y(TASA_OPCIONAL)}
            r={4.5}
            fill={COLOR_OPCION}
            stroke="var(--grafica-superficie)"
            strokeWidth={2}
          />

          {c !== null && (
            <g>
              <line x1={x(c)} x2={x(c)} y1={y(TASA_GENERAL)} y2={y(0)} stroke="var(--grafica-cruz)" strokeWidth={1} />
              <circle cx={x(c)} cy={y(normal(c))} r={4.5} fill={COLOR_NORMAL} stroke="var(--grafica-superficie)" strokeWidth={2} />
              <circle cx={x(c)} cy={y(TASA_OPCIONAL)} r={4.5} fill={COLOR_OPCION} stroke="var(--grafica-superficie)" strokeWidth={2} />
            </g>
          )}
        </svg>

        {c !== null && (
          <Globo izquierda={izquierdaDelGlobo(x(c), ancho)} arriba={M.arriba}>
            <p className="text-[var(--color-tinta-tenue)]">Compras = {pct(c)} de tus ventas</p>
            <FilaGlobo color={COLOR_NORMAL} valor={pct(normal(c))} etiqueta="mecánica normal" />
            <FilaGlobo color={COLOR_OPCION} valor={pct(TASA_OPCIONAL)} etiqueta="opción" />
            <p className="mt-2 font-semibold text-[var(--color-tinta)]">{veredicto(c)}</p>
          </Globo>
        )}
        <p className="sr-only" aria-live="polite">
          {lectura}
        </p>
      </div>
    </Figura>
  );
}
