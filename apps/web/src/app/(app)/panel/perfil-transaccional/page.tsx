import Link from 'next/link';
import { centavos, formatearMXN, type Centavos } from '@leyantilavado/types';
import {
  datos,
  formatearFechaCorta,
  formatearFechaLarga,
  restarMeses,
} from '@leyantilavado/rules-engine';
import { Boton, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { EstadoConsulta } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { listar } from '@/lib/app/consultas';
import { requerirContexto } from '@/lib/auth/sesion';
import { fechaDeHoy } from '@/lib/app/fecha';

interface FilaOperacion {
  id: string;
  customer_id: string | null;
  operation_date: string;
  amount_cents: number;
  activity_slug: string;
}

interface FilaCliente {
  id: string;
  full_name: string;
  risk_level: string | null;
}

interface Resumen {
  clienteId: string;
  nombre: string;
  riesgo: string | null;
  operaciones: number;
  total: Centavos;
  promedio: Centavos;
  mayor: Centavos;
  primera: string;
  ultima: string;
  operacionesVentana: number;
  totalVentana: Centavos;
  actividades: string[];
}

/**
 * Ventana de referencia. NO se escribe a mano: es la ventana móvil de
 * acumulación del corpus legal cargado. Si no hubiera ninguna, la columna
 * correspondiente se omite en lugar de inventar un plazo.
 */
const VENTANA_MESES: number | null =
  [
    ...new Set(
      datos.UMBRALES_PUBLICADOS.filter((r) => r.acumulacion.aplica).map(
        (r) => r.acumulacion.ventanaMeses,
      ),
    ),
  ].sort((a, b) => a - b)[0] ?? null;

export default async function PaginaPerfilTransaccional() {
  const contexto = await requerirContexto('/panel/perfil-transaccional');
  const org = contexto.organizacion?.organizacionId ?? null;
  const hoy = await fechaDeHoy();
  const desde = VENTANA_MESES === null ? null : restarMeses(hoy, VENTANA_MESES);

  const [operaciones, clientes] = await Promise.all([
    listar<FilaOperacion>('operations', {
      organizacionId: org,
      columnas: 'id,customer_id,operation_date,amount_cents,activity_slug',
      ordenarPor: 'operation_date',
      limite: 1000,
    }),
    listar<FilaCliente>('customers', {
      organizacionId: org,
      columnas: 'id,full_name,risk_level',
      limite: 1000,
    }),
  ]);

  const nombres = new Map(
    clientes.estado === 'ok' ? clientes.filas.map((c) => [c.id, c] as const) : [],
  );

  const porCliente = new Map<string, Resumen>();
  if (operaciones.estado === 'ok') {
    for (const op of operaciones.filas) {
      const clienteId = op.customer_id ?? 'sin-cliente';
      const fecha = op.operation_date.slice(0, 10);
      const monto = Math.round(op.amount_cents);
      const cliente = op.customer_id ? nombres.get(op.customer_id) : undefined;

      const enVentana = desde !== null && fecha >= desde;

      const previo = porCliente.get(clienteId);
      if (!previo) {
        porCliente.set(clienteId, {
          clienteId,
          nombre: cliente?.full_name ?? 'Operaciones sin cliente asociado',
          riesgo: cliente?.risk_level ?? null,
          operaciones: 1,
          total: centavos(monto),
          promedio: centavos(monto),
          mayor: centavos(monto),
          primera: fecha,
          ultima: fecha,
          operacionesVentana: enVentana ? 1 : 0,
          totalVentana: centavos(enVentana ? monto : 0),
          actividades: [op.activity_slug],
        });
        continue;
      }

      previo.operaciones += 1;
      previo.total = centavos(previo.total + monto);
      previo.promedio = centavos(previo.total / previo.operaciones);
      previo.mayor = centavos(Math.max(previo.mayor, monto));
      if (fecha < previo.primera) previo.primera = fecha;
      if (fecha > previo.ultima) previo.ultima = fecha;
      if (enVentana) {
        previo.operacionesVentana += 1;
        previo.totalVentana = centavos(previo.totalVentana + monto);
      }
      if (!previo.actividades.includes(op.activity_slug)) previo.actividades.push(op.activity_slug);
    }
  }

  const resumenes = [...porCliente.values()].sort((a, b) => b.total - a.total);

  return (
    <>
      <EncabezadoSeccion
        titulo="Perfil transaccional"
        descripcion={
          desde
            ? `Comportamiento observado de cada cliente a partir de las operaciones capturadas. Ventana de referencia: del ${formatearFechaLarga(desde)} al ${formatearFechaLarga(hoy)}.`
            : `Comportamiento observado de cada cliente a partir de las operaciones capturadas, al ${formatearFechaLarga(hoy)}.`
        }
      />

      <Nota tono="atencion" titulo="Falta la mitad de la comparación: el perfil esperado">
        <p>
          Un perfil transaccional se vigila comparando lo que el cliente <strong>dijo</strong> que
          iba a operar contra lo que <strong>realmente</strong> operó. Hoy esta plataforma sólo
          tiene la segunda mitad: el modelo de datos no guarda todavía el perfil declarado (monto y
          número de operaciones esperados por periodo, origen de los recursos), así que aquí se
          muestra el comportamiento observado y nada más. No inventamos un rango esperado para
          poder pintar una alerta.
        </p>
      </Nota>

      <Seccion titulo="Comportamiento observado por cliente">
        {operaciones.estado !== 'ok' || resumenes.length === 0 ? (
          <EstadoConsulta
            resultado={operaciones}
            vacioTitulo="Todavía no hay operaciones para construir un perfil"
            vacioDescripcion="En cuanto captures o importes operaciones, aquí verás por cliente cuántas hizo, por cuánto, cuál fue la mayor y cuánto lleva en la ventana de referencia."
            accion={
              contexto.puede('operaciones.importar') ? (
                <Boton comoHijo variante="contorno">
                  <Link href="/panel/operaciones/importar">Importar operaciones</Link>
                </Boton>
              ) : undefined
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            <TablaEnvoltura aria-label="Perfil transaccional observado por cliente">
              <table className="w-full min-w-max border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                    {[
                      'Cliente',
                      'Riesgo',
                      'Operaciones',
                      'Total capturado',
                      'Promedio',
                      'Mayor',
                      VENTANA_MESES === null
                        ? 'Ventana de acumulación'
                        : `Últimos ${VENTANA_MESES} meses`,
                      'Primera',
                      'Última',
                      'Actividades',
                    ].map((t) => (
                      <th
                        key={t}
                        scope="col"
                        className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resumenes.map((r) => (
                    <tr key={r.clienteId} className="border-b border-[var(--color-borde)] last:border-0">
                      <td className="px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {r.clienteId === 'sin-cliente' ? (
                          r.nombre
                        ) : (
                          <Link
                            href={`/panel/clientes/${r.clienteId}`}
                            className="cursor-pointer font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                          >
                            {r.nombre}
                          </Link>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {r.riesgo ?? <span className="text-[var(--color-tinta-tenue)]">Sin clasificar</span>}
                      </td>
                      <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {r.operaciones}
                      </td>
                      <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {formatearMXN(r.total)}
                      </td>
                      <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {formatearMXN(r.promedio)}
                      </td>
                      <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {formatearMXN(r.mayor)}
                      </td>
                      <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {desde === null ? (
                          <span className="text-[var(--color-tinta-tenue)]">Sin ventana cargada</span>
                        ) : (
                          `${r.operacionesVentana} · ${formatearMXN(r.totalVentana)}`
                        )}
                      </td>
                      <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {formatearFechaCorta(r.primera)}
                      </td>
                      <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {formatearFechaCorta(r.ultima)}
                      </td>
                      <td className="px-3 py-2.5 align-top text-xs text-[var(--color-tinta-suave)]">
                        {r.actividades.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TablaEnvoltura>
            <p className="text-xs text-[var(--color-tinta-tenue)]">
              {resumenes.length} {resumenes.length === 1 ? 'cliente' : 'clientes'} con operaciones.
              Los importes se suman en centavos enteros sobre las operaciones que tu rol puede leer:
              si otro usuario ve más filas, verá otros totales.
            </p>
          </div>
        )}
      </Seccion>

      <Nota tono="info" titulo="Una desviación no es un aviso">
        <p>
          Que un cliente opere más de lo habitual no genera por sí solo una obligación de aviso: lo
          que la dispara es el umbral de su actividad, con la acumulación de la ventana móvil. Lo
          que sí exige el enfoque basado en riesgos es <strong>documentar</strong> el seguimiento
          cuando el comportamiento se sale de lo esperado.
        </p>
      </Nota>

      <AvisoNoEsCumplimiento />
    </>
  );
}
