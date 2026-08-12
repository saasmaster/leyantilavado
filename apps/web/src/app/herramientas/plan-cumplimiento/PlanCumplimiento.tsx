'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarPlus } from 'lucide-react';
import {
  Boton,
  Campo,
  Entrada,
  EstadoVacio,
  Insignia,
  Nota,
  TablaEnvoltura,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import type { Obligacion } from '@leyantilavado/types';
import {
  datos,
  formatearFechaCorta,
  formatearFechaLarga,
  proximasFechasLimite,
  sumarMeses,
} from '@leyantilavado/rules-engine';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { SelectorActividad } from '@/components/herramientas/SelectorActividad';
import { nombreActividad } from '@/lib/herramientas/actividades';
import { aCSV, construirICS, descargar, esFechaValida, marcaICS } from '@/lib/herramientas/util';

type Origen = 'oficial' | 'propuesta';

interface Hito {
  id: string;
  fecha: string;
  titulo: string;
  detalle: string;
  origen: Origen;
  bloque: string;
  enlace?: string;
}

/**
 * Distancia en meses que proponemos para arrancar cada obligación recurrente
 * cuando la norma no fija una fecha calendario. Es una sugerencia operativa,
 * no un plazo legal, y así se etiqueta en la tabla.
 */
const MESES_SUGERIDOS: Record<NonNullable<Obligacion['recurrencia']>, number> = {
  unica: 1,
  mensual: 1,
  semestral: 6,
  anual: 12,
};

export function PlanCumplimiento() {
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [ahora] = React.useState(() => marcaICS(new Date()));
  const [actividad, setActividad] = React.useState('');
  const [subtipo, setSubtipo] = React.useState('');
  const [inicio, setInicio] = React.useState(hoy);

  const inicioValido = esFechaValida(inicio);

  const hitos = React.useMemo((): Hito[] => {
    if (!inicioValido) return [];
    const lista: Hito[] = [];

    /* 1. Arranque: lo que se hace una sola vez, cuanto antes. */
    for (const o of datos.OBLIGACIONES.filter((x) => x.recurrencia === 'unica')) {
      lista.push({
        id: `unica-${o.slug}`,
        fecha: sumarMeses(inicio, MESES_SUGERIDOS.unica),
        titulo: o.titulo,
        detalle: o.resumen,
        origen: 'propuesta',
        bloque: 'Arranque',
        enlace: `/obligaciones/${o.slug}`,
      });
    }

    /* 2. Ciclo mensual de avisos: la fecha sí es legal. */
    for (const f of proximasFechasLimite(inicio, 6)) {
      lista.push({
        id: `aviso-${f.periodo}`,
        fecha: f.fechaLimite,
        titulo: `Aviso o informe en ceros del periodo ${f.periodo}`,
        detalle:
          'Día 17 del mes siguiente. Si no hubo operaciones que alcanzaran el umbral, igual se presenta el informe en ceros.',
        origen: 'oficial',
        bloque: 'Ciclo mensual',
        enlace: '/obligaciones/avisos',
      });
    }

    /* 3. Obligaciones recurrentes distintas del aviso mensual. */
    for (const o of datos.OBLIGACIONES) {
      if (!o.recurrencia || o.recurrencia === 'unica' || o.categoria === 'avisos') continue;
      lista.push({
        id: `rec-${o.slug}`,
        fecha: sumarMeses(inicio, MESES_SUGERIDOS[o.recurrencia]),
        titulo: `${o.titulo} (${o.recurrencia})`,
        detalle: o.resumen,
        origen: 'propuesta',
        bloque: 'Ciclo recurrente',
        enlace: `/obligaciones/${o.slug}`,
      });
    }

    /* 4. Calendario del Acuerdo 115/2026: fechas publicadas. */
    for (const h of datos.CALENDARIO) {
      if (h.fecha < inicio) continue;
      lista.push({
        id: `cal-${h.id}`,
        fecha: h.fecha,
        titulo: h.titulo,
        detalle: h.descripcion,
        origen: h.confirmadoOficialmente ? 'oficial' : 'propuesta',
        bloque: 'Calendario normativo',
      });
    }

    return lista.sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
  }, [inicio, inicioValido]);

  const csv = aCSV(
    ['fecha', 'bloque', 'titulo', 'origen_de_la_fecha', 'detalle'],
    hitos.map((h) => [
      h.fecha,
      h.bloque,
      h.titulo,
      h.origen === 'oficial' ? 'publicada' : 'propuesta operativa',
      h.detalle,
    ]),
  );

  const descargarICS = () =>
    descargar(
      'plan-cumplimiento.ics',
      construirICS(
        hitos.map((h) => ({
          uid: h.id,
          fecha: h.fecha,
          titulo: h.titulo,
          descripcion: `${h.detalle} (${h.origen === 'oficial' ? 'fecha publicada' : 'fecha propuesta por LeyAntilavado.org, no oficial'})`,
        })),
        ahora,
      ),
      'text/calendar',
    );

  const bloques = [...new Set(hitos.map((h) => h.bloque))];

  return (
    <div className="flex flex-col gap-8">
      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo className="grid gap-5 md:grid-cols-2">
          <SelectorActividad
            actividad={actividad}
            subtipo={subtipo}
            fecha={inicioValido ? inicio : hoy}
            onActividad={setActividad}
            onSubtipo={setSubtipo}
            idPrefijo="plan"
          />

          <Campo
            id="inicio-plan"
            etiqueta="Fecha de inicio del programa"
            ayuda="La de tu alta en el padrón, o la de hoy si vas empezando."
            requerido
            {...(!inicioValido && inicio !== '' ? { error: 'Captura una fecha válida.' } : {})}
          >
            <Entrada type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </Campo>
        </TarjetaCuerpo>
      </Tarjeta>

      {hitos.length === 0 ? (
        <EstadoVacio
          titulo="Captura una fecha de inicio"
          descripcion="El plan se arma a partir de esa fecha. Elegir la actividad es opcional: las obligaciones estructurales son las mismas para todas, y sirve para saber a cuál pertenece tu ciclo de avisos."
        />
      ) : (
        <section aria-live="polite" className="imprimible flex flex-col gap-6">
          <EncabezadoImpresion titulo="Plan de cumplimiento" />

          {actividad && (
            <p className="text-[var(--color-tinta-suave)]">
              Plan para <strong>{nombreActividad(actividad)}</strong>, con inicio el{' '}
              {formatearFechaLarga(inicio)}.
            </p>
          )}

          <Nota tono="atencion" titulo="Distingue las fechas publicadas de nuestras propuestas">
            <p>
              Las fechas del <strong>calendario normativo</strong> y las del{' '}
              <strong>ciclo mensual de avisos</strong> salen de la norma. Las de arranque y ciclo
              recurrente son <strong>propuestas operativas nuestras</strong>: la ley dice que esas
              obligaciones existen y con qué periodicidad, no en qué día del calendario te toca
              hacerlas. Cada renglón lo indica.
            </p>
          </Nota>

          <div className="no-imprimir">
            <Boton type="button" variante="contorno" tamano="sm" onClick={descargarICS}>
              <CalendarPlus aria-hidden />
              Descargar el plan completo en .ics
            </Boton>
          </div>

          {bloques.map((bloque) => (
            <section key={bloque} aria-labelledby={`bloque-${bloque}`}>
              <h2
                id={`bloque-${bloque}`}
                className="text-xl font-semibold text-[var(--color-tinta)]"
              >
                {bloque}
              </h2>
              <TablaEnvoltura className="mt-3">
                <table className="w-full min-w-[42rem] border-collapse text-sm">
                  <caption className="sr-only">
                    Hitos del bloque {bloque} con su fecha y el origen de la fecha
                  </caption>
                  <thead className="bg-[var(--color-marfil-hondo)]">
                    <tr>
                      <th scope="col" className="p-3 text-left font-semibold">
                        Fecha
                      </th>
                      <th scope="col" className="p-3 text-left font-semibold">
                        Qué toca
                      </th>
                      <th scope="col" className="p-3 text-left font-semibold">
                        Origen de la fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {hitos
                      .filter((h) => h.bloque === bloque)
                      .map((h) => (
                        <tr key={h.id} className="border-t border-[var(--color-borde)] align-top">
                          <td className="cifra p-3 whitespace-nowrap">
                            {formatearFechaCorta(h.fecha)}
                          </td>
                          <td className="p-3">
                            <p className="font-medium text-[var(--color-tinta)]">
                              {h.enlace ? (
                                <Link
                                  href={h.enlace}
                                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                                >
                                  {h.titulo}
                                </Link>
                              ) : (
                                h.titulo
                              )}
                            </p>
                            <p className="mt-1 text-[var(--color-tinta-suave)]">{h.detalle}</p>
                          </td>
                          <td className="p-3">
                            <Insignia tono={h.origen === 'oficial' ? 'verde' : 'ambar'}>
                              {h.origen === 'oficial' ? 'Publicada' : 'Propuesta nuestra'}
                            </Insignia>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </TablaEnvoltura>
            </section>
          ))}

          <AccionesResultado
            nombreArchivo="plan-cumplimiento"
            csv={csv}
            datos={{ actividad, subtipo: subtipo || null, inicio, hitos }}
            claveGuardado="plan-cumplimiento"
          />
        </section>
      )}
    </div>
  );
}
