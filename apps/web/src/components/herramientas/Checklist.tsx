'use client';

import * as React from 'react';
import { CircleDashed, CircleSlash, CircleCheck } from 'lucide-react';
import {
  Boton,
  Campo,
  Entrada,
  Insignia,
  Nota,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import { AccionesResultado } from './AccionesResultado';
import { EncabezadoImpresion } from './MarcoHerramienta';
import { aCSV, formatearPorcentaje } from '@/lib/herramientas/util';

export type EstadoItem = 'pendiente' | 'listo' | 'no-aplica';

export interface ItemChecklist {
  id: string;
  texto: string;
  /** Qué documento esperaría ver un auditor. */
  evidencia?: string;
  /** Su ausencia se reporta como brecha crítica. */
  critico?: boolean;
}

export interface SeccionChecklist {
  id: string;
  titulo: string;
  descripcion?: string;
  items: ItemChecklist[];
}

interface Props {
  secciones: SeccionChecklist[];
  claveGuardado: string;
  nombreArchivo: string;
  tituloImpresion: string;
  /** Texto que acompaña al puntaje. */
  etiquetaPuntaje?: string;
  /** Se muestra encima del listado. */
  encabezado?: React.ReactNode;
}

/**
 * Checklist reutilizable.
 *
 * Cuatro herramientas comparten esta mecánica —expediente, auditoría,
 * mecanismos automatizados y capacitación—, así que la lógica vive aquí una
 * vez y cada página aporta su catálogo de puntos.
 *
 * El puntaje excluye lo marcado como "no aplica": un despacho que no maneja
 * fideicomisos no debería salir castigado por no tener esa documentación.
 */
export function Checklist({
  secciones,
  claveGuardado,
  nombreArchivo,
  tituloImpresion,
  etiquetaPuntaje = 'Avance',
  encabezado,
}: Props) {
  const [estados, setEstados] = React.useState<Record<string, EstadoItem>>({});
  const [notas, setNotas] = React.useState<Record<string, string>>({});

  const todos = secciones.flatMap((s) => s.items);
  const estadoDe = (id: string): EstadoItem => estados[id] ?? 'pendiente';

  const aplicables = todos.filter((i) => estadoDe(i.id) !== 'no-aplica');
  const listos = aplicables.filter((i) => estadoDe(i.id) === 'listo');
  const porcentaje = aplicables.length === 0 ? 0 : (listos.length / aplicables.length) * 100;

  const brechasCriticas = todos.filter((i) => i.critico && estadoDe(i.id) === 'pendiente');

  const cambiar = (id: string, estado: EstadoItem) =>
    setEstados((e) => ({ ...e, [id]: e[id] === estado ? 'pendiente' : estado }));

  const csv = aCSV(
    ['seccion', 'punto', 'estado', 'evidencia_esperada', 'nota'],
    secciones.flatMap((s) =>
      s.items.map((i) => [s.titulo, i.texto, estadoDe(i.id), i.evidencia ?? '', notas[i.id] ?? '']),
    ),
  );

  const tonoPuntaje = porcentaje >= 80 ? 'verde' : porcentaje >= 50 ? 'ambar' : 'rojo';

  return (
    <div className="flex flex-col gap-6">
      {encabezado}

      <EncabezadoImpresion titulo={tituloImpresion} />

      <Tarjeta elevada className="imprimible">
        <TarjetaCuerpo className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="cifra text-3xl font-semibold text-[var(--color-tinta)]">
              {formatearPorcentaje(porcentaje, 0)}
            </p>
            <Insignia tono={tonoPuntaje}>{etiquetaPuntaje}</Insignia>
            <span className="text-sm text-[var(--color-tinta-suave)]">
              {listos.length} de {aplicables.length} puntos aplicables
              {todos.length - aplicables.length > 0
                ? ` · ${todos.length - aplicables.length} marcados como no aplicables`
                : ''}
            </span>
          </div>

          <div
            className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-marfil-hondo)]"
            role="img"
            aria-label={`${etiquetaPuntaje}: ${Math.round(porcentaje)} por ciento`}
          >
            <div
              className="h-full rounded-full bg-[var(--color-petroleo)]"
              style={{ width: `${porcentaje}%` }}
            />
          </div>

          <p className="text-sm text-[var(--color-tinta-suave)]">
            El porcentaje mide el avance de tu documentación, no el cumplimiento legal. Tener todo
            marcado no equivale a estar en regla: significa que reuniste lo que esta lista
            contempla.
          </p>
        </TarjetaCuerpo>
      </Tarjeta>

      {brechasCriticas.length > 0 && (
        <Nota tono="riesgo" titulo={`${brechasCriticas.length} punto(s) crítico(s) pendiente(s)`}>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            {brechasCriticas.map((b) => (
              <li key={b.id}>{b.texto}</li>
            ))}
          </ul>
        </Nota>
      )}

      {secciones.map((s) => {
        const itemsSeccion = s.items;
        const listosSeccion = itemsSeccion.filter((i) => estadoDe(i.id) === 'listo').length;
        return (
          <section key={s.id} aria-labelledby={`sec-${s.id}`} className="imprimible">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`sec-${s.id}`} className="text-xl font-semibold text-[var(--color-tinta)]">
                {s.titulo}
              </h2>
              <span className="cifra text-sm text-[var(--color-tinta-tenue)]">
                {listosSeccion}/{itemsSeccion.length}
              </span>
            </div>
            {s.descripcion && (
              <p className="mt-1 max-w-3xl text-sm text-[var(--color-tinta-suave)]">
                {s.descripcion}
              </p>
            )}

            <ul className="mt-4 flex flex-col gap-3">
              {itemsSeccion.map((i) => {
                const estado = estadoDe(i.id);
                return (
                  <li
                    key={i.id}
                    className={`evitar-corte rounded-[var(--radius-card)] border p-4 ${
                      estado === 'listo'
                        ? 'border-[var(--color-verde)] bg-[var(--color-verde-tenue)]'
                        : estado === 'no-aplica'
                          ? 'border-[var(--color-borde)] opacity-60'
                          : i.critico
                            ? 'border-[var(--color-rojo)]'
                            : 'border-[var(--color-borde)]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-64 flex-1">
                        <p className="font-medium text-[var(--color-tinta)]">
                          {i.texto}
                          {i.critico && (
                            <Insignia tono="rojo" className="ml-2 align-middle">
                              Crítico
                            </Insignia>
                          )}
                        </p>
                        {i.evidencia && (
                          <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
                            Evidencia esperada: {i.evidencia}
                          </p>
                        )}
                      </div>

                      <div className="no-imprimir flex gap-2">
                        <Boton
                          type="button"
                          tamano="sm"
                          variante={estado === 'listo' ? 'accion' : 'contorno'}
                          onClick={() => cambiar(i.id, 'listo')}
                          aria-pressed={estado === 'listo'}
                        >
                          <CircleCheck aria-hidden />
                          Listo
                        </Boton>
                        <Boton
                          type="button"
                          tamano="sm"
                          variante={estado === 'no-aplica' ? 'primario' : 'contorno'}
                          onClick={() => cambiar(i.id, 'no-aplica')}
                          aria-pressed={estado === 'no-aplica'}
                        >
                          <CircleSlash aria-hidden />
                          No aplica
                        </Boton>
                      </div>

                      <span className="solo-imprimir">
                        {estado === 'listo'
                          ? '[X] Listo'
                          : estado === 'no-aplica'
                            ? '[—] No aplica'
                            : '[ ] Pendiente'}
                      </span>
                    </div>

                    {estado !== 'no-aplica' && (
                      <Campo
                        id={`nota-${i.id}`}
                        etiqueta="Dónde está o quién lo tiene"
                        className="mt-3 [&>label]:text-xs"
                      >
                        <Entrada
                          placeholder="Carpeta, responsable o folio del documento"
                          value={notas[i.id] ?? ''}
                          onChange={(e) => setNotas((n) => ({ ...n, [i.id]: e.target.value }))}
                        />
                      </Campo>
                    )}

                    {estado === 'pendiente' && (
                      <p className="no-imprimir mt-2 flex items-center gap-1.5 text-xs text-[var(--color-tinta-tenue)]">
                        <CircleDashed aria-hidden className="size-3.5" />
                        Pendiente
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <AccionesResultado
        nombreArchivo={nombreArchivo}
        csv={csv}
        datos={{ estados, notas, porcentaje }}
        claveGuardado={claveGuardado}
      />
    </div>
  );
}
