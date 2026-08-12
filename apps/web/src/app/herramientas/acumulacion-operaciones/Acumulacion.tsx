'use client';

import * as React from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import {
  Boton,
  Campo,
  Entrada,
  EstadoVacio,
  IndicadorConclusion,
  Insignia,
  Nota,
  SelloProcedencia,
  SupuestosYFaltantes,
  Tarjeta,
  TarjetaCuerpo,
  TablaEnvoltura,
} from '@leyantilavado/ui';
import { formatearMXN, type Operacion, type ResultadoEvaluacion } from '@leyantilavado/types';
import {
  buscarRegla,
  datos,
  evaluarAcumulacion,
  evaluarOperacion,
  formatearFechaCorta,
  formatearFechaLarga,
  hayUMAPara,
} from '@leyantilavado/rules-engine';
import { SelectorActividad } from '@/components/herramientas/SelectorActividad';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { Advertencias } from '@/components/herramientas/Advertencias';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { requiereSubtipo } from '@/lib/herramientas/actividades';
import {
  aCentavos,
  aCSV,
  desdeCSV,
  esFechaValida,
  nuevoId,
} from '@/lib/herramientas/util';

const FUENTES_ENLAZABLES = Object.fromEntries(
  datos.FUENTES.map((f) => [f.id, { nombre: f.nombre, url: f.url }]),
);

/** Todas las filas son del mismo cliente: es la premisa de la herramienta. */
const CLIENTE = 'cliente-unico';

interface Fila {
  id: string;
  fecha: string;
  monto: string;
  descripcion: string;
}

/**
 * Los cinco estados que la herramienta puede mostrar. Se derivan de la
 * conclusión del motor: la herramienta no inventa categorías propias.
 */
type EstadoAcumulacion =
  | 'sin-obligacion'
  | 'identificacion'
  | 'proximo'
  | 'aviso'
  | 'revision';

const ETIQUETA_ESTADO: Record<
  EstadoAcumulacion,
  { texto: string; tono: 'verde' | 'marino' | 'ambar' | 'rojo' | 'neutro' }
> = {
  'sin-obligacion': { texto: 'Sin obligación aparente', tono: 'verde' },
  identificacion: { texto: 'Requiere identificación', tono: 'marino' },
  proximo: { texto: 'Próximo al aviso', tono: 'ambar' },
  aviso: { texto: 'Aviso alcanzado', tono: 'rojo' },
  revision: { texto: 'Requiere revisión', tono: 'neutro' },
};

const filaVacia = (fecha: string): Fila => ({
  id: nuevoId('op'),
  fecha,
  monto: '',
  descripcion: '',
});

export function Acumulacion() {
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [actividad, setActividad] = React.useState('');
  const [subtipo, setSubtipo] = React.useState('');
  const [filas, setFilas] = React.useState<Fila[]>(() => [filaVacia('')]);
  const [errorImportacion, setErrorImportacion] = React.useState<string | null>(null);

  const entradaArchivo = React.useRef<HTMLInputElement>(null);

  const actualizar = (id: string, campo: keyof Omit<Fila, 'id'>, valor: string) =>
    setFilas((f) => f.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)));

  const eliminar = (id: string) =>
    setFilas((f) => (f.length === 1 ? [filaVacia('')] : f.filter((x) => x.id !== id)));

  const agregar = () => setFilas((f) => [...f, filaVacia('')]);

  const importar = async (archivo: File) => {
    const texto = await archivo.text();
    const filasCSV = desdeCSV(texto);
    if (filasCSV.length === 0) {
      setErrorImportacion('El archivo está vacío.');
      return;
    }
    // Se salta el encabezado si la primera celda no parece una fecha.
    const cuerpo = esFechaValida((filasCSV[0]?.[0] ?? '').trim()) ? filasCSV : filasCSV.slice(1);
    const nuevas: Fila[] = [];
    const problemas: string[] = [];

    cuerpo.forEach((f, i) => {
      const fecha = (f[0] ?? '').trim();
      const monto = (f[1] ?? '').trim();
      const descripcion = (f[2] ?? '').trim();
      const linea = i + (cuerpo === filasCSV ? 1 : 2);
      if (!esFechaValida(fecha)) {
        problemas.push(`Línea ${linea}: “${fecha}” no es una fecha con formato AAAA-MM-DD.`);
        return;
      }
      if (aCentavos(monto) === null) {
        problemas.push(`Línea ${linea}: “${monto}” no es un monto en pesos.`);
        return;
      }
      nuevas.push({ id: nuevoId('op'), fecha, monto, descripcion });
    });

    setFilas(nuevas.length > 0 ? nuevas : [filaVacia('')]);
    setErrorImportacion(
      problemas.length > 0
        ? `Se importaron ${nuevas.length} operaciones. ${problemas.length} línea(s) se omitieron: ${problemas.slice(0, 5).join(' ')}`
        : null,
    );
  };

  /* ── Cálculo ──────────────────────────────────────────────────────────── */

  const analisis = React.useMemo(() => {
    if (!actividad) return null;
    if (requiereSubtipo(actividad, hoy) && !subtipo) return null;

    const operaciones: Operacion[] = filas
      .filter((f) => esFechaValida(f.fecha) && hayUMAPara(f.fecha) && aCentavos(f.monto) !== null)
      .map((f) => ({
        id: f.id,
        fecha: f.fecha,
        actividad: actividad as Operacion['actividad'],
        ...(subtipo ? { subtipo } : {}),
        monto: aCentavos(f.monto)!,
        medioPago: 'otro' as const,
        clienteId: CLIENTE,
        ...(f.descripcion ? { descripcion: f.descripcion } : {}),
      }))
      .sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));

    if (operaciones.length === 0) return null;

    const ultima = operaciones[operaciones.length - 1]!;
    const previas = operaciones.slice(0, -1);
    const regla = buscarRegla(actividad, subtipo || undefined, ultima.fecha);
    if (!regla) return null;

    let evaluacion: ResultadoEvaluacion | null = null;
    try {
      evaluacion = evaluarOperacion(ultima, {
        fechaReferencia: ultima.fecha,
        historial: previas,
      });
    } catch {
      evaluacion = null;
    }

    const acumulacion = regla.acumulacion.aplica
      ? evaluarAcumulacion({ operacionActual: ultima, historial: previas, regla })
      : null;

    return { operaciones, regla, evaluacion, acumulacion, ultima };
  }, [actividad, subtipo, filas, hoy]);

  const csv = React.useMemo(
    () =>
      aCSV(
        ['fecha', 'monto', 'descripcion'],
        filas.map((f) => [f.fecha, f.monto, f.descripcion]),
      ),
    [filas],
  );

  const estado: EstadoAcumulacion | null = (() => {
    if (!analisis?.evaluacion) return null;
    const c = analisis.evaluacion.conclusion;
    if (c === 'aviso_probable' || (analisis.acumulacion?.alcanzado ?? false)) return 'aviso';
    if (c === 'proximo_al_aviso') return 'proximo';
    if (c === 'requiere_identificacion') return 'identificacion';
    if (c === 'requiere_revision_profesional' || c === 'informacion_insuficiente') return 'revision';
    return 'sin-obligacion';
  })();

  return (
    <div className="flex flex-col gap-8">
      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo className="flex flex-col gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <SelectorActividad
              actividad={actividad}
              subtipo={subtipo}
              fecha={hoy}
              onActividad={setActividad}
              onSubtipo={setSubtipo}
              idPrefijo="acum"
            />
          </div>

          <Nota tono="info">
            <p>
              Captura aquí las operaciones <strong>de un mismo cliente</strong> y del mismo tipo de
              acto. La ley suma sólo esa combinación: dos compras del mismo cliente, una de joyería
              y otra de un vehículo, no se acumulan entre sí. No escribas nombres ni datos
              personales: la columna de descripción es para tu referencia interna y se queda en tu
              navegador.
            </p>
          </Nota>

          <div>
            <h2 className="text-lg font-semibold text-[var(--color-tinta)]">
              Operaciones del cliente
            </h2>
            <TablaEnvoltura className="mt-3">
              <table className="w-full min-w-[38rem] border-collapse text-sm">
                <caption className="sr-only">
                  Operaciones capturadas, editables: fecha, monto y descripción
                </caption>
                <thead className="bg-[var(--color-marfil-hondo)]">
                  <tr>
                    <th scope="col" className="p-3 text-left font-semibold">
                      Fecha
                    </th>
                    <th scope="col" className="p-3 text-left font-semibold">
                      Monto sin IVA
                    </th>
                    <th scope="col" className="p-3 text-left font-semibold">
                      Referencia interna
                    </th>
                    <th scope="col" className="p-3 text-left font-semibold">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f, i) => {
                    const fechaMal = f.fecha !== '' && !esFechaValida(f.fecha);
                    const sinUMA = !fechaMal && f.fecha !== '' && !hayUMAPara(f.fecha);
                    const montoMal = f.monto !== '' && aCentavos(f.monto) === null;
                    return (
                      <tr key={f.id} className="border-t border-[var(--color-borde)] align-top">
                        <td className="p-2">
                          <Campo
                            id={`fecha-${f.id}`}
                            etiqueta={`Fecha de la operación ${i + 1}`}
                            className="[&>label]:sr-only"
                            {...(fechaMal
                              ? { error: 'Fecha inválida.' }
                              : sinUMA
                                ? { error: 'No hay UMA registrada para esa fecha.' }
                                : {})}
                          >
                            <Entrada
                              type="date"
                              value={f.fecha}
                              onChange={(e) => actualizar(f.id, 'fecha', e.target.value)}
                            />
                          </Campo>
                        </td>
                        <td className="p-2">
                          <Campo
                            id={`monto-${f.id}`}
                            etiqueta={`Monto de la operación ${i + 1}`}
                            className="[&>label]:sr-only"
                            {...(montoMal ? { error: 'Captura un monto en pesos.' } : {})}
                          >
                            <Entrada
                              inputMode="decimal"
                              className="cifra"
                              placeholder="0.00"
                              value={f.monto}
                              onChange={(e) => actualizar(f.id, 'monto', e.target.value)}
                            />
                          </Campo>
                        </td>
                        <td className="p-2">
                          <Campo
                            id={`desc-${f.id}`}
                            etiqueta={`Referencia de la operación ${i + 1}`}
                            className="[&>label]:sr-only"
                          >
                            <Entrada
                              placeholder="Folio o factura"
                              value={f.descripcion}
                              onChange={(e) => actualizar(f.id, 'descripcion', e.target.value)}
                            />
                          </Campo>
                        </td>
                        <td className="p-2">
                          <Boton
                            type="button"
                            variante="fantasma"
                            tamano="sm"
                            onClick={() => eliminar(f.id)}
                            aria-label={`Eliminar la operación ${i + 1}`}
                          >
                            <Trash2 aria-hidden />
                          </Boton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TablaEnvoltura>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Boton type="button" variante="contorno" tamano="sm" onClick={agregar}>
              <Plus aria-hidden />
              Agregar operación
            </Boton>
            <Boton
              type="button"
              variante="contorno"
              tamano="sm"
              onClick={() => entradaArchivo.current?.click()}
            >
              <Upload aria-hidden />
              Importar CSV
            </Boton>
            <input
              ref={entradaArchivo}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label="Archivo CSV con las operaciones"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) void importar(archivo);
                e.target.value = '';
              }}
            />
            <span className="text-sm text-[var(--color-tinta-tenue)]">
              Columnas esperadas: fecha (AAAA-MM-DD), monto, referencia.
            </span>
          </div>

          {errorImportacion && (
            <Nota tono="atencion" titulo="Revisa el archivo">
              <p>{errorImportacion}</p>
            </Nota>
          )}
        </TarjetaCuerpo>
      </Tarjeta>

      {!analisis && (
        <EstadoVacio
          titulo="Faltan datos para acumular"
          descripcion="Elige la actividad (y el inciso, si lo tiene) y captura al menos una operación con fecha y monto válidos. Nada se calcula hasta entonces: preferimos un resultado vacío a uno inventado."
        />
      )}

      {analisis && (
        <section aria-live="polite" className="imprimible flex flex-col gap-6">
          <EncabezadoImpresion titulo="Acumulación de operaciones en seis meses" />

          {estado && (
            <div className="flex flex-wrap items-center gap-3">
              <Insignia tono={ETIQUETA_ESTADO[estado].tono}>
                {ETIQUETA_ESTADO[estado].texto}
              </Insignia>
              <span className="text-sm text-[var(--color-tinta-suave)]">
                {analisis.operaciones.length} operaciones capturadas · última el{' '}
                {formatearFechaLarga(analisis.ultima.fecha)}
              </span>
            </div>
          )}

          {!analisis.regla.acumulacion.aplica && (
            <Nota tono="info" titulo="Este supuesto no acumula">
              <p>
                {analisis.regla.acumulacion.nota ??
                  'La obligación de este supuesto se genera con independencia del monto, así que sumar las operaciones no cambia el resultado.'}
              </p>
            </Nota>
          )}

          {analisis.acumulacion && (
            <>
              <Tarjeta elevada>
                <TarjetaCuerpo className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-[var(--color-tinta-tenue)]">Acumulado en ventana</p>
                      <p className="cifra mt-1 text-2xl font-semibold text-[var(--color-tinta)]">
                        {formatearMXN(analisis.acumulacion.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-tinta-tenue)]">Umbral de aviso</p>
                      <p className="cifra mt-1 text-2xl font-semibold text-[var(--color-tinta)]">
                        {analisis.acumulacion.umbralAviso
                          ? formatearMXN(analisis.acumulacion.umbralAviso.equivalentePesos)
                          : 'No es un monto'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-tinta-tenue)]">Ventana considerada</p>
                      <p className="mt-1 text-sm font-medium text-[var(--color-tinta)]">
                        {formatearFechaCorta(analisis.acumulacion.ventanaDesde)} —{' '}
                        {formatearFechaCorta(analisis.acumulacion.ventanaHasta)}
                      </p>
                      <p className="text-xs text-[var(--color-tinta-tenue)]">
                        Ventana móvil de {analisis.acumulacion.ventanaMeses} meses
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {analisis.acumulacion.explicacion}
                  </p>
                </TarjetaCuerpo>
              </Tarjeta>

              <div>
                <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
                  Línea de tiempo
                </h3>
                <TablaEnvoltura className="mt-3">
                  <table className="w-full min-w-[42rem] border-collapse text-sm">
                    <caption className="sr-only">
                      Operaciones ordenadas por fecha con la suma corrida y la operación en que se
                      disparó el aviso
                    </caption>
                    <thead className="bg-[var(--color-marfil-hondo)]">
                      <tr>
                        <th scope="col" className="p-3 text-left font-semibold">
                          Fecha
                        </th>
                        <th scope="col" className="p-3 text-left font-semibold">
                          Referencia
                        </th>
                        <th scope="col" className="p-3 text-left font-semibold">
                          Monto
                        </th>
                        <th scope="col" className="p-3 text-left font-semibold">
                          Suma corrida
                        </th>
                        <th scope="col" className="p-3 text-left font-semibold">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analisis.acumulacion.operaciones.map((o) => (
                        <tr
                          key={o.operacion.id}
                          className={
                            o.disparaAviso
                              ? 'border-t-2 border-[var(--color-rojo)] bg-[var(--color-rojo-tenue)]'
                              : 'border-t border-[var(--color-borde)]'
                          }
                        >
                          <td className="p-3 whitespace-nowrap">
                            {formatearFechaCorta(o.operacion.fecha)}
                          </td>
                          <td className="p-3 text-[var(--color-tinta-suave)]">
                            {o.operacion.descripcion || '—'}
                          </td>
                          <td className="cifra p-3 whitespace-nowrap">
                            {formatearMXN(o.operacion.monto)}
                          </td>
                          <td className="cifra p-3 font-medium whitespace-nowrap">
                            {formatearMXN(o.acumuladoHasta)}
                          </td>
                          <td className="p-3">
                            {o.disparaAviso ? (
                              <Insignia tono="rojo">Aquí se disparó el aviso</Insignia>
                            ) : o.alcanzaIdentificacionIndividual ? (
                              <Insignia tono="marino">Identificación por sí sola</Insignia>
                            ) : (
                              <span className="text-[var(--color-tinta-tenue)]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TablaEnvoltura>

                {analisis.acumulacion.fechaDisparo && (
                  <p className="mt-3 text-sm text-[var(--color-tinta-suave)]">
                    El aviso se disparó con la operación del{' '}
                    <strong>{formatearFechaLarga(analisis.acumulacion.fechaDisparo)}</strong>. El
                    plazo para presentarlo corre desde el mes de esa operación, no desde hoy.
                  </p>
                )}

                {analisis.acumulacion.fueraDeVentana > 0 && (
                  <p className="mt-2 text-sm text-[var(--color-tinta-tenue)]">
                    {analisis.acumulacion.fueraDeVentana} operación(es) quedaron fuera de la ventana
                    de seis meses y no se sumaron.
                  </p>
                )}
              </div>
            </>
          )}

          {analisis.evaluacion && (
            <>
              <IndicadorConclusion
                conclusion={analisis.evaluacion.conclusion}
                confianza={analisis.evaluacion.confianza}
              />
              <Advertencias advertencias={analisis.evaluacion.advertencias} />
              <SupuestosYFaltantes
                supuestos={analisis.evaluacion.supuestos}
                informacionFaltante={analisis.evaluacion.informacionFaltante}
              />
            </>
          )}

          <SelloProcedencia
            procedencia={analisis.regla.procedencia}
            fuentes={FUENTES_ENLAZABLES}
          />

          <AccionesResultado
            nombreArchivo="acumulacion-seis-meses"
            csv={csv}
            datos={{
              actividad,
              subtipo: subtipo || null,
              acumulacion: analisis.acumulacion,
              conclusion: analisis.evaluacion?.conclusion ?? null,
            }}
            claveGuardado="acumulacion-operaciones"
          />
        </section>
      )}
    </div>
  );
}
