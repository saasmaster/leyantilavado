'use client';

import * as React from 'react';
import { Download, Upload } from 'lucide-react';
import {
  Boton,
  EstadoVacio,
  Insignia,
  Nota,
  TablaEnvoltura,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import { formatearMXN } from '@leyantilavado/types';
import type { Conclusion, Operacion, ResultadoEvaluacion } from '@leyantilavado/types';
import { evaluarOperacion, hayUMAPara, reglasDeActividad } from '@leyantilavado/rules-engine';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { SLUGS_VALIDOS, nombreActividad } from '@/lib/herramientas/actividades';
import {
  aCentavos,
  aCSV,
  descargarCSV,
  desdeCSV,
  esFechaValida,
} from '@/lib/herramientas/util';

const COLUMNAS = ['fecha', 'actividad', 'subtipo', 'monto', 'monto_efectivo', 'referencia'] as const;

const PLANTILLA = aCSV([...COLUMNAS], [
  ['2026-06-15', 'vehiculos', '', '690000.00', '200000.00', 'FAC-1024'],
  ['2026-06-20', 'metales-joyeria', '', '195000.00', '0', 'FAC-1025'],
  ['2026-07-02', 'fe-publica-notarios', 'inmuebles', '1250000.00', '0', 'ESC-8871'],
]);

interface FilaError {
  linea: number;
  problemas: string[];
  crudo: string[];
}

interface FilaValida {
  linea: number;
  operacion: Operacion;
  referencia: string;
  resultado: ResultadoEvaluacion;
}

const ETIQUETA_CONCLUSION: Record<Conclusion, { texto: string; tono: 'verde' | 'marino' | 'ambar' | 'rojo' | 'neutro' }> = {
  sin_obligacion_aparente: { texto: 'Sin obligación aparente', tono: 'verde' },
  requiere_identificacion: { texto: 'Identificación', tono: 'marino' },
  proximo_al_aviso: { texto: 'Cerca del aviso', tono: 'ambar' },
  aviso_probable: { texto: 'Aviso probable', tono: 'rojo' },
  requiere_revision_profesional: { texto: 'Revisión profesional', tono: 'ambar' },
  informacion_insuficiente: { texto: 'Información insuficiente', tono: 'neutro' },
};

export function Importador() {
  const [errores, setErrores] = React.useState<FilaError[]>([]);
  const [validas, setValidas] = React.useState<FilaValida[]>([]);
  const [procesado, setProcesado] = React.useState(false);
  const entradaArchivo = React.useRef<HTMLInputElement>(null);

  const procesar = async (archivo: File) => {
    const filas = desdeCSV(await archivo.text());
    if (filas.length === 0) {
      setErrores([{ linea: 0, problemas: ['El archivo está vacío.'], crudo: [] }]);
      setValidas([]);
      setProcesado(true);
      return;
    }

    // Se salta el encabezado cuando la primera celda no parece una fecha.
    const hayEncabezado = !esFechaValida((filas[0]?.[0] ?? '').trim());
    const cuerpo = hayEncabezado ? filas.slice(1) : filas;
    const desplazamiento = hayEncabezado ? 2 : 1;

    const nuevosErrores: FilaError[] = [];
    const nuevasValidas: FilaValida[] = [];

    cuerpo.forEach((fila, i) => {
      const linea = i + desplazamiento;
      const [fecha = '', actividad = '', subtipo = '', monto = '', efectivo = '', referencia = ''] =
        fila.map((c) => c.trim());
      const problemas: string[] = [];

      if (!esFechaValida(fecha)) problemas.push(`“${fecha}” no es una fecha AAAA-MM-DD válida.`);
      else if (!hayUMAPara(fecha)) problemas.push(`No hay UMA registrada para ${fecha}.`);

      if (!SLUGS_VALIDOS.has(actividad)) {
        problemas.push(`“${actividad}” no es una clave de actividad conocida.`);
      } else if (esFechaValida(fecha)) {
        const conSubtipo = reglasDeActividad(actividad, fecha).some((r) => r.subtipo !== undefined);
        if (conSubtipo && subtipo === '') {
          problemas.push('Esta actividad exige subtipo: sin él no hay una regla única que aplicar.');
        }
      }

      const montoCentavos = aCentavos(monto);
      if (montoCentavos === null) problemas.push(`“${monto}” no es un monto en pesos.`);

      const efectivoCentavos = efectivo === '' ? null : aCentavos(efectivo);
      if (efectivo !== '' && efectivoCentavos === null) {
        problemas.push(`“${efectivo}” no es un monto en pesos.`);
      }

      if (problemas.length > 0) {
        nuevosErrores.push({ linea, problemas, crudo: fila });
        return;
      }

      const operacion: Operacion = {
        id: `fila-${linea}`,
        fecha,
        actividad: actividad as Operacion['actividad'],
        ...(subtipo ? { subtipo } : {}),
        monto: montoCentavos!,
        ...(efectivoCentavos !== null && efectivoCentavos > 0
          ? { montoEfectivo: efectivoCentavos }
          : {}),
        medioPago: 'otro',
        ...(referencia ? { descripcion: referencia } : {}),
      };

      try {
        nuevasValidas.push({
          linea,
          operacion,
          referencia,
          resultado: evaluarOperacion(operacion),
        });
      } catch (e) {
        nuevosErrores.push({
          linea,
          problemas: [
            e instanceof Error
              ? e.message
              : 'El motor no pudo resolver una regla para esta combinación.',
          ],
          crudo: fila,
        });
      }
    });

    setErrores(nuevosErrores);
    setValidas(nuevasValidas);
    setProcesado(true);
  };

  const resumen = validas.reduce<Record<string, number>>((acc, v) => {
    acc[v.resultado.conclusion] = (acc[v.resultado.conclusion] ?? 0) + 1;
    return acc;
  }, {});

  const csvResultados = aCSV(
    ['linea', 'fecha', 'actividad', 'subtipo', 'monto', 'referencia', 'conclusion', 'confianza'],
    validas.map((v) => [
      v.linea,
      v.operacion.fecha,
      v.operacion.actividad,
      v.operacion.subtipo ?? '',
      (v.operacion.monto / 100).toFixed(2),
      v.referencia,
      v.resultado.conclusion,
      v.resultado.confianza,
    ]),
  );

  return (
    <div className="flex flex-col gap-8">
      <Nota tono="info" titulo="El archivo se lee en tu navegador">
        <p>
          No se sube a ningún servidor. La lectura, la validación y la evaluación ocurren en tu
          equipo, y el resultado se pierde cuando cierras la pestaña salvo que lo descargues. Aun
          así, usa referencias internas en lugar de nombres de clientes: el CSV que exportes viaja.
        </p>
      </Nota>

      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo className="flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-tinta)]">Formato esperado</h2>
            <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
              Seis columnas, separadas por coma o punto y coma. El encabezado es opcional: si la
              primera celda no es una fecha, se ignora esa línea.
            </p>
            <TablaEnvoltura className="mt-3">
              <table className="w-full min-w-[42rem] border-collapse text-sm">
                <caption className="sr-only">Columnas esperadas del archivo CSV</caption>
                <thead className="bg-[var(--color-marfil-hondo)]">
                  <tr>
                    <th scope="col" className="p-3 text-left font-semibold">
                      Columna
                    </th>
                    <th scope="col" className="p-3 text-left font-semibold">
                      Qué va ahí
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['fecha', 'Fecha de la operación en formato AAAA-MM-DD. Define la UMA y la regla.'],
                    ['actividad', 'Clave de la actividad vulnerable, por ejemplo vehiculos o metales-joyeria.'],
                    ['subtipo', 'Clave del inciso. Obligatoria en fe pública, servicios profesionales, comercio exterior y activos virtuales.'],
                    ['monto', 'Valor del acto SIN IVA, en pesos.'],
                    ['monto_efectivo', 'Porción liquidada en efectivo CON IVA. Opcional; déjala en cero si no aplica.'],
                    ['referencia', 'Tu folio interno. Opcional. No pongas nombres de clientes.'],
                  ].map(([col, desc]) => (
                    <tr key={col} className="border-t border-[var(--color-borde)] align-top">
                      <th scope="row" className="cifra p-3 text-left font-medium">
                        {col}
                      </th>
                      <td className="p-3 text-[var(--color-tinta-suave)]">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TablaEnvoltura>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Boton
              type="button"
              variante="accion"
              onClick={() => entradaArchivo.current?.click()}
            >
              <Upload aria-hidden />
              Elegir archivo CSV
            </Boton>
            <input
              ref={entradaArchivo}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label="Archivo CSV con las operaciones a evaluar"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) void procesar(archivo);
                e.target.value = '';
              }}
            />
            <Boton
              type="button"
              variante="contorno"
              onClick={() => descargarCSV('plantilla-operaciones.csv', PLANTILLA)}
            >
              <Download aria-hidden />
              Descargar plantilla de ejemplo
            </Boton>
          </div>
        </TarjetaCuerpo>
      </Tarjeta>

      {procesado && validas.length === 0 && errores.length === 0 && (
        <EstadoVacio
          titulo="No encontramos filas"
          descripcion="El archivo se leyó pero no traía datos. Revisa que tenga al menos una línea con fecha, actividad y monto."
        />
      )}

      {errores.length > 0 && (
        <section aria-labelledby="errores-importacion">
          <h2 id="errores-importacion" className="text-xl font-semibold text-[var(--color-tinta)]">
            {errores.length} fila(s) con problemas
          </h2>
          <p className="mt-1 text-[var(--color-tinta-suave)]">
            No las evaluamos. Corrige el archivo y vuelve a subirlo: preferimos omitirlas a
            adivinar qué querías decir.
          </p>
          <TablaEnvoltura className="mt-3">
            <table className="w-full min-w-[42rem] border-collapse text-sm">
              <caption className="sr-only">Filas rechazadas con el motivo de cada rechazo</caption>
              <thead className="bg-[var(--color-marfil-hondo)]">
                <tr>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Línea
                  </th>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Contenido
                  </th>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Qué está mal
                  </th>
                </tr>
              </thead>
              <tbody>
                {errores.map((e) => (
                  <tr key={e.linea} className="border-t border-[var(--color-borde)] align-top">
                    <td className="cifra p-3">{e.linea}</td>
                    <td className="p-3 text-[var(--color-tinta-tenue)]">
                      {e.crudo.join(' · ') || '—'}
                    </td>
                    <td className="p-3">
                      <ul className="flex list-disc flex-col gap-1 pl-4 text-[var(--color-rojo)]">
                        {e.problemas.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaEnvoltura>
        </section>
      )}

      {validas.length > 0 && (
        <section aria-live="polite" className="imprimible flex flex-col gap-6">
          <EncabezadoImpresion titulo="Evaluación masiva de operaciones" />

          <div>
            <h2 className="text-xl font-semibold text-[var(--color-tinta)]">
              {validas.length} operación(es) evaluadas
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {Object.entries(resumen).map(([conclusion, cuantas]) => {
                const meta = ETIQUETA_CONCLUSION[conclusion as Conclusion];
                return (
                  <li key={conclusion}>
                    <Insignia tono={meta.tono}>
                      {cuantas} · {meta.texto}
                    </Insignia>
                  </li>
                );
              })}
            </ul>
          </div>

          <TablaEnvoltura>
            <table className="w-full min-w-[48rem] border-collapse text-sm">
              <caption className="sr-only">
                Operaciones válidas con su conclusión, confianza y advertencias
              </caption>
              <thead className="bg-[var(--color-marfil-hondo)]">
                <tr>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Línea
                  </th>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Fecha
                  </th>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Actividad
                  </th>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Monto
                  </th>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Conclusión
                  </th>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Señales
                  </th>
                </tr>
              </thead>
              <tbody>
                {validas.map((v) => {
                  const meta = ETIQUETA_CONCLUSION[v.resultado.conclusion];
                  return (
                    <tr key={v.linea} className="border-t border-[var(--color-borde)] align-top">
                      <td className="cifra p-3">{v.linea}</td>
                      <td className="p-3 whitespace-nowrap">{v.operacion.fecha}</td>
                      <td className="p-3">
                        {nombreActividad(v.operacion.actividad)}
                        {v.operacion.subtipo && (
                          <span className="mt-0.5 block text-xs text-[var(--color-tinta-tenue)]">
                            {v.operacion.subtipo}
                          </span>
                        )}
                      </td>
                      <td className="cifra p-3 whitespace-nowrap">
                        {formatearMXN(v.operacion.monto)}
                      </td>
                      <td className="p-3">
                        <Insignia tono={meta.tono}>{meta.texto}</Insignia>
                        <span className="mt-1 block text-xs text-[var(--color-tinta-tenue)]">
                          Confianza {v.resultado.confianza}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--color-tinta-suave)]">
                        {v.resultado.efectivo?.excede && (
                          <Insignia tono="rojo">Rebasa el límite de efectivo</Insignia>
                        )}
                        {v.resultado.advertencias.some((a) => a.clave === 'proximo-al-aviso') && (
                          <Insignia tono="ambar">Cerca del umbral</Insignia>
                        )}
                        {v.resultado.efectivo?.excede === undefined &&
                          v.resultado.advertencias.length === 0 && (
                            <span className="text-[var(--color-tinta-tenue)]">—</span>
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TablaEnvoltura>

          <Nota tono="atencion" titulo="Esta evaluación es operación por operación">
            <p>
              El importador <strong>no acumula</strong>: cada fila se mide por separado. Si tus
              clientes repiten operaciones, la suma en la ventana de seis meses puede disparar avisos
              que aquí no aparecen. Para eso está la herramienta de acumulación, que necesita
              distinguir a qué cliente pertenece cada operación.
            </p>
          </Nota>

          <AccionesResultado
            nombreArchivo="evaluacion-masiva"
            csv={csvResultados}
            datos={{ validas: validas.map((v) => ({ linea: v.linea, resultado: v.resultado })) }}
          />
        </section>
      )}
    </div>
  );
}
