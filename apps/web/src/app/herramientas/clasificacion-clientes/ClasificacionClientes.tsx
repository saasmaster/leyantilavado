'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Boton,
  Campo,
  Entrada,
  EstadoVacio,
  Insignia,
  Nota,
  Selector,
  TablaEnvoltura,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import type { FactorRiesgoClave, NivelRiesgo } from '@leyantilavado/types';
import {
  CORTES_RIESGO,
  ETIQUETAS_FACTOR,
  PONDERACIONES_BASE,
  evaluarRiesgo,
  formatearFechaCorta,
} from '@leyantilavado/rules-engine';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { aCSV, esFechaValida, nuevoId } from '@/lib/herramientas/util';

const TONO_NIVEL: Record<NivelRiesgo, 'verde' | 'ambar' | 'rojo'> = {
  bajo: 'verde',
  medio: 'ambar',
  alto: 'rojo',
};

/**
 * Traducción de respuestas en lenguaje llano a puntajes de 0 a 100.
 *
 * NO es un dato legal: es la metodología editorial que proponemos para que la
 * clasificación sea rápida y consistente entre clientes. Cada organización
 * puede —y debe— justificar la suya; la matriz de riesgos permite ajustar los
 * pesos que aquí se usan tal como vienen del motor.
 */
const OPCIONES: Record<
  FactorRiesgoClave,
  { pregunta: string; opciones: { valor: string; etiqueta: string; puntaje: number }[] }
> = {
  tipo_operacion: {
    pregunta: 'Complejidad de la operación',
    opciones: [
      { valor: 'simple', etiqueta: 'Simple y recurrente', puntaje: 20 },
      { valor: 'media', etiqueta: 'Con partes o estructuras adicionales', puntaje: 55 },
      { valor: 'compleja', etiqueta: 'Compleja o sin justificación económica clara', puntaje: 90 },
    ],
  },
  tipo_cliente: {
    pregunta: 'Tipo de cliente',
    opciones: [
      { valor: 'fisica', etiqueta: 'Persona física residente', puntaje: 20 },
      { valor: 'moral', etiqueta: 'Persona moral con estructura simple', puntaje: 45 },
      { valor: 'vehiculo', etiqueta: 'Fideicomiso o vehículo corporativo', puntaje: 75 },
      { valor: 'extranjero', etiqueta: 'No residente o estructura en el extranjero', puntaje: 85 },
    ],
  },
  ubicacion_geografica: {
    pregunta: 'Ubicación del cliente y de la operación',
    opciones: [
      { valor: 'baja', etiqueta: 'Zona sin señales de riesgo particular', puntaje: 20 },
      { valor: 'media', etiqueta: 'Zona con incidencia moderada', puntaje: 50 },
      { valor: 'alta', etiqueta: 'Zona identificada como de alto riesgo', puntaje: 85 },
    ],
  },
  canal_entrega: {
    pregunta: 'Canal por el que se relacionan',
    opciones: [
      { valor: 'presencial', etiqueta: 'Presencial con identificación directa', puntaje: 20 },
      { valor: 'remoto', etiqueta: 'Remoto con verificación reforzada', puntaje: 50 },
      { valor: 'digital', etiqueta: 'Totalmente digital sin contacto', puntaje: 80 },
    ],
  },
  pep: {
    pregunta: '¿Es persona políticamente expuesta?',
    opciones: [
      { valor: 'no', etiqueta: 'No, y se verificó', puntaje: 5 },
      { valor: 'no-verificado', etiqueta: 'No se ha verificado', puntaje: 45 },
      { valor: 'cercano', etiqueta: 'Familiar o asociado cercano de una PEP', puntaje: 70 },
      { valor: 'si', etiqueta: 'Sí, es PEP', puntaje: 95 },
    ],
  },
  beneficiario_controlador: {
    pregunta: 'Beneficiario controlador',
    opciones: [
      { valor: 'identificado', etiqueta: 'Identificado y documentado', puntaje: 10 },
      { valor: 'parcial', etiqueta: 'Identificado parcialmente', puntaje: 55 },
      { valor: 'no', etiqueta: 'No identificado', puntaje: 90 },
    ],
  },
  volumen_transaccional: {
    pregunta: 'Volumen frente a su perfil declarado',
    opciones: [
      { valor: 'congruente', etiqueta: 'Congruente con lo declarado', puntaje: 20 },
      { valor: 'variable', etiqueta: 'Variable, con picos ocasionales', puntaje: 55 },
      { valor: 'desviado', etiqueta: 'Muy por encima de su perfil', puntaje: 90 },
    ],
  },
  medio_pago: {
    pregunta: 'Medio de pago habitual',
    opciones: [
      { valor: 'bancario', etiqueta: 'Transferencia o cheque, trazable', puntaje: 10 },
      { valor: 'mixto', etiqueta: 'Combinación con algo de efectivo', puntaje: 50 },
      { valor: 'efectivo', etiqueta: 'Efectivo o activos virtuales predominantes', puntaje: 85 },
    ],
  },
};

const CLAVES = Object.keys(OPCIONES) as FactorRiesgoClave[];

interface Cliente {
  id: string;
  referencia: string;
  respuestas: Record<FactorRiesgoClave, string>;
}

const respuestasPorDefecto = (): Record<FactorRiesgoClave, string> =>
  Object.fromEntries(CLAVES.map((c) => [c, OPCIONES[c].opciones[0]!.valor])) as Record<
    FactorRiesgoClave,
    string
  >;

const clienteNuevo = (n: number): Cliente => ({
  id: nuevoId('cli'),
  referencia: `Cliente ${n}`,
  respuestas: respuestasPorDefecto(),
});

export function ClasificacionClientes() {
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [fecha, setFecha] = React.useState(hoy);
  const [clientes, setClientes] = React.useState<Cliente[]>(() => [clienteNuevo(1)]);
  const [abierto, setAbierto] = React.useState<string | null>(null);

  const fechaValida = esFechaValida(fecha);

  const evaluaciones = React.useMemo(() => {
    if (!fechaValida) return [];
    return clientes.map((c) => {
      const factores = CLAVES.map((clave) => {
        const opcion =
          OPCIONES[clave].opciones.find((o) => o.valor === c.respuestas[clave]) ??
          OPCIONES[clave].opciones[0]!;
        return {
          clave,
          etiqueta: ETIQUETAS_FACTOR[clave],
          puntaje: opcion.puntaje,
          ponderacion: PONDERACIONES_BASE[clave],
          justificacion: opcion.etiqueta,
        };
      });
      return { cliente: c, evaluacion: evaluarRiesgo({ factores, fecha, mesesRevision: 6 }) };
    });
  }, [clientes, fecha, fechaValida]);

  const csv = aCSV(
    ['referencia', 'puntaje', 'nivel', 'diligencia_reforzada', 'proxima_revision'],
    evaluaciones.map((e) => [
      e.cliente.referencia,
      e.evaluacion.puntajeFinal,
      e.evaluacion.nivel,
      e.evaluacion.requiereDebidaDiligenciaReforzada ? 'sí' : 'no',
      e.evaluacion.proximaRevision,
    ]),
  );

  const resumen = evaluaciones.reduce<Record<NivelRiesgo, number>>(
    (acc, e) => ({ ...acc, [e.evaluacion.nivel]: acc[e.evaluacion.nivel] + 1 }),
    { bajo: 0, medio: 0, alto: 0 },
  );

  return (
    <div className="flex flex-col gap-8">
      <Nota tono="info" titulo="La traducción a puntajes es nuestra propuesta, no la ley">
        <p>
          Las respuestas en lenguaje llano se traducen a puntajes de 0 a 100 y se ponderan con los
          pesos del motor. Es una metodología editorial pensada para clasificar rápido y de forma
          consistente. Si tu organización usa otros criterios, ajústalos en la{' '}
          <strong>matriz de riesgos</strong> y documenta el porqué: eso es lo que la norma exige.
        </p>
      </Nota>

      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo className="flex flex-col gap-6">
          <Campo
            id="fecha-clasificacion"
            etiqueta="Fecha de la clasificación"
            ayuda="Desde aquí se cuentan los seis meses hasta la próxima revisión."
            requerido
            className="max-w-xs"
            {...(!fechaValida && fecha !== '' ? { error: 'Captura una fecha válida.' } : {})}
          >
            <Entrada type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Campo>

          <div>
            <h2 className="text-lg font-semibold text-[var(--color-tinta)]">Cartera</h2>
            <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
              Usa una referencia interna, no el nombre del cliente. Todo se queda en tu navegador,
              pero un archivo exportado viaja.
            </p>

            <ul className="mt-4 flex flex-col gap-3">
              {clientes.map((c, i) => (
                <li
                  key={c.id}
                  className="rounded-[var(--radius-control)] border border-[var(--color-borde)] p-3"
                >
                  <div className="flex flex-wrap items-end gap-3">
                    <Campo
                      id={`ref-${c.id}`}
                      etiqueta={`Referencia del cliente ${i + 1}`}
                      className="min-w-56 flex-1"
                    >
                      <Entrada
                        value={c.referencia}
                        onChange={(e) =>
                          setClientes((lista) =>
                            lista.map((x) =>
                              x.id === c.id ? { ...x, referencia: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </Campo>
                    <Boton
                      type="button"
                      variante="contorno"
                      tamano="sm"
                      onClick={() => setAbierto((a) => (a === c.id ? null : c.id))}
                      aria-expanded={abierto === c.id}
                      aria-controls={`panel-${c.id}`}
                    >
                      {abierto === c.id ? 'Ocultar respuestas' : 'Responder factores'}
                    </Boton>
                    <Boton
                      type="button"
                      variante="fantasma"
                      onClick={() =>
                        setClientes((lista) =>
                          lista.length === 1 ? lista : lista.filter((x) => x.id !== c.id),
                        )
                      }
                      disabled={clientes.length === 1}
                      aria-label={`Eliminar ${c.referencia}`}
                    >
                      <Trash2 aria-hidden />
                    </Boton>
                  </div>

                  {abierto === c.id && (
                    <div id={`panel-${c.id}`} className="mt-4 grid gap-4 md:grid-cols-2">
                      {CLAVES.map((clave) => (
                        <Campo
                          key={clave}
                          id={`${c.id}-${clave}`}
                          etiqueta={OPCIONES[clave].pregunta}
                        >
                          <Selector
                            value={c.respuestas[clave]}
                            onChange={(e) =>
                              setClientes((lista) =>
                                lista.map((x) =>
                                  x.id === c.id
                                    ? {
                                        ...x,
                                        respuestas: { ...x.respuestas, [clave]: e.target.value },
                                      }
                                    : x,
                                ),
                              )
                            }
                          >
                            {OPCIONES[clave].opciones.map((o) => (
                              <option key={o.valor} value={o.valor}>
                                {o.etiqueta}
                              </option>
                            ))}
                          </Selector>
                        </Campo>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <Boton
              type="button"
              variante="contorno"
              tamano="sm"
              className="mt-3"
              onClick={() => setClientes((lista) => [...lista, clienteNuevo(lista.length + 1)])}
            >
              <Plus aria-hidden />
              Agregar cliente
            </Boton>
          </div>
        </TarjetaCuerpo>
      </Tarjeta>

      {evaluaciones.length === 0 ? (
        <EstadoVacio
          titulo="Sin clasificaciones"
          descripcion="Captura una fecha válida y al menos un cliente para ver la clasificación."
        />
      ) : (
        <section aria-live="polite" className="imprimible flex flex-col gap-6">
          <EncabezadoImpresion titulo="Clasificación de clientes por nivel de riesgo" />

          <div className="grid gap-3 sm:grid-cols-3">
            {(['bajo', 'medio', 'alto'] as NivelRiesgo[]).map((n) => (
              <div
                key={n}
                className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
              >
                <p className="text-xs text-[var(--color-tinta-tenue)]">Riesgo {n}</p>
                <p className="cifra mt-1 text-2xl font-semibold text-[var(--color-tinta)]">
                  {resumen[n]}
                </p>
              </div>
            ))}
          </div>

          <TablaEnvoltura>
            <table className="w-full min-w-[44rem] border-collapse text-sm">
              <caption className="sr-only">
                Clientes con su puntaje, nivel de riesgo y fecha de próxima revisión
              </caption>
              <thead className="bg-[var(--color-marfil-hondo)]">
                <tr>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Referencia
                  </th>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Puntaje
                  </th>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Nivel
                  </th>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Diligencia reforzada
                  </th>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Próxima revisión
                  </th>
                </tr>
              </thead>
              <tbody>
                {evaluaciones.map(({ cliente, evaluacion }) => (
                  <tr key={cliente.id} className="border-t border-[var(--color-borde)]">
                    <th scope="row" className="p-3 text-left font-medium">
                      {cliente.referencia}
                    </th>
                    <td className="cifra p-3">{evaluacion.puntajeFinal}/100</td>
                    <td className="p-3">
                      <Insignia tono={TONO_NIVEL[evaluacion.nivel]}>{evaluacion.nivel}</Insignia>
                    </td>
                    <td className="p-3">
                      {evaluacion.requiereDebidaDiligenciaReforzada ? (
                        <Insignia tono="rojo">Sí</Insignia>
                      ) : (
                        <span className="text-[var(--color-tinta-tenue)]">No</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {formatearFechaCorta(evaluacion.proximaRevision)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaEnvoltura>

          <p className="text-sm text-[var(--color-tinta-tenue)]">
            Cortes de la metodología: hasta {CORTES_RIESGO.bajo} bajo, hasta {CORTES_RIESGO.medio}{' '}
            medio, por encima alto. La revisión se fija a seis meses, que es la periodicidad mínima
            que pide la norma para la clasificación de clientes.
          </p>

          <Nota tono="atencion" titulo="Clasificar no es el final, es el disparador">
            <p>
              Un cliente en riesgo alto exige debida diligencia reforzada: aprobación de un nivel
              jerárquico superior, verificación del origen de los recursos y monitoreo más
              frecuente. Y cada clasificación debe quedar registrada con su justificación, no sólo
              con la etiqueta.
            </p>
          </Nota>

          <AccionesResultado
            nombreArchivo="clasificacion-clientes"
            csv={csv}
            datos={{ fecha, evaluaciones }}
            claveGuardado="clasificacion-clientes"
          />
        </section>
      )}
    </div>
  );
}
