import { Nota } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { EstadoConsulta } from '@/components/app/TablaRecurso';
import { AvisoEnvioManual, AvisoFormatoOficial } from '@/components/app/Avisos';
import { listar, type Resultado } from '@/lib/app/consultas';
import { requerirPermiso } from '@/lib/auth/sesion';
import { fechaDeHoy } from '@/lib/app/fecha';
import { BotonExportar, type FilaExportable } from './BotonExportar';

/** Tope por exportación. No es un límite legal: es lo que cabe en una descarga cómoda. */
const TOPE_FILAS = 500;

interface Catalogo {
  clave: string;
  titulo: string;
  descripcion: string;
  tabla: string;
  columnas: readonly string[];
  ordenarPor: string;
  /** Las tablas sin `deleted_at` no admiten el filtro de eliminación lógica. */
  sinBorradoLogico?: boolean;
}

const CATALOGO: readonly Catalogo[] = [
  {
    clave: 'clientes',
    titulo: 'Clientes y usuarios',
    descripcion:
      'Datos de identificación de cada cliente registrado, con su nivel de riesgo y el estado de su expediente.',
    tabla: 'customers',
    columnas: [
      'id', 'external_ref', 'person_type', 'full_name', 'legal_name', 'rfc', 'curp',
      'nationality', 'economic_activity', 'email', 'phone', 'state', 'city', 'country',
      'is_pep', 'pep_source', 'risk_level', 'identified_at', 'file_status', 'created_at',
    ],
    ordenarPor: 'created_at',
  },
  {
    clave: 'operaciones',
    titulo: 'Operaciones',
    descripcion:
      'Operaciones capturadas con su importe en centavos, la actividad, el medio de pago y la conclusión que el motor registró al evaluarlas.',
    tabla: 'operations',
    columnas: [
      'id', 'external_ref', 'operation_date', 'activity_slug', 'subtype', 'amount_cents',
      'cash_amount_cents', 'commission_cents', 'payment_method', 'customer_id', 'customer_type',
      'on_behalf_of_customer', 'amount_undeterminable', 'conclusion', 'legal_version',
      'description', 'created_at',
    ],
    ordenarPor: 'operation_date',
  },
  {
    clave: 'avisos',
    titulo: 'Registro de avisos',
    descripcion:
      'Los avisos preparados, su periodo, su fecha límite, su estado y el folio del acuse cuando ya lo cargaste.',
    tabla: 'notice_records',
    columnas: [
      'id', 'period', 'activity_slug', 'reference', 'amount_cents', 'due_date', 'status',
      'prepared_at', 'reviewed_at', 'approved_at', 'exported_at', 'export_format',
      'acknowledgement_ref', 'acknowledgement_at', 'legal_version', 'notes',
    ],
    ordenarPor: 'period',
  },
  {
    clave: 'bitacora',
    titulo: 'Bitácora de cambios',
    descripcion:
      'El registro append-only de qué cambió, quién lo cambió y cuándo. Útil para entregarlo a quien audite.',
    tabla: 'audit_logs',
    columnas: ['id', 'created_at', 'action', 'entity', 'entity_id', 'actor_id', 'actor_email', 'summary'],
    ordenarPor: 'created_at',
    sinBorradoLogico: true,
  },
];

export default async function PaginaExportaciones() {
  const contexto = await requerirPermiso('documentos.descargar', '/panel/exportaciones');
  const org = contexto.organizacion?.organizacionId ?? null;
  const hoy = await fechaDeHoy();

  const resultados = await Promise.all(
    CATALOGO.map((c) =>
      listar<FilaExportable>(c.tabla, {
        columnas: c.columnas.join(','),
        organizacionId: org,
        ordenarPor: c.ordenarPor,
        limite: TOPE_FILAS,
        ...(c.sinBorradoLogico ? { incluirEliminados: true } : {}),
      }),
    ),
  );

  return (
    <>
      <EncabezadoSeccion
        titulo="Exportaciones"
        descripcion="Descarga en CSV o JSON lo que tu organización capturó. La descarga se arma en tu navegador con los datos que ya trajo esta página."
      />

      <AvisoEnvioManual />
      <AvisoFormatoOficial />

      <Nota tono="riesgo" titulo="Aquí no se genera el XML oficial">
        <p>
          Ninguna de estas exportaciones produce el archivo XML que exige el portal SPPLD. El
          esquema vigente cambia por actividad y no lo tenemos documentado ni probado contra la
          especificación oficial, así que no lo generamos: un archivo que parezca oficial y que la
          autoridad rechace es peor que no tener archivo. Lo que descargas son los datos capturados,
          legibles a simple vista, para revisarlos y capturarlos o convertirlos con tu proveedor.
        </p>
      </Nota>

      <Seccion
        titulo="Exportaciones disponibles"
        descripcion={`Cada descarga incluye hasta ${TOPE_FILAS} registros, los más recientes primero. Las filas que ves son las que las políticas de la base de datos dejan leer con tu rol.`}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {CATALOGO.map((catalogo, i) => {
            const resultado = resultados[i] as Resultado<FilaExportable>;
            return (
              <article key={catalogo.clave} className="tarjeta flex flex-col gap-3 p-5">
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-tinta)]">
                    {catalogo.titulo}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {catalogo.descripcion}
                  </p>
                </div>

                {resultado.estado === 'ok' && resultado.filas.length > 0 ? (
                  <>
                    <p className="text-sm text-[var(--color-tinta-suave)]">
                      <span className="cifra font-medium text-[var(--color-tinta)]">
                        {resultado.filas.length}
                      </span>{' '}
                      {resultado.filas.length === 1 ? 'registro listo' : 'registros listos'} ·{' '}
                      {catalogo.columnas.length} columnas
                    </p>
                    <BotonExportar
                      filas={resultado.filas}
                      columnas={catalogo.columnas}
                      nombreBase={`leyantilavado-${catalogo.clave}`}
                      fecha={hoy}
                    />
                  </>
                ) : (
                  <EstadoConsulta
                    resultado={resultado}
                    vacioTitulo="Nada que exportar todavía"
                    vacioDescripcion="No hay registros de este tipo en tu organización. En cuanto captures el primero, el botón de descarga aparece aquí."
                  />
                )}
              </article>
            );
          })}
        </div>
      </Seccion>

      <Nota tono="atencion" titulo="Los importes van en centavos">
        <p>
          Las columnas que terminan en <code>_cents</code> son enteros en centavos: una operación de
          mil pesos se exporta como <code>100000</code>. Se hace así a propósito, para que no haya
          errores de redondeo al pasar los datos de un sistema a otro. Divide entre cien antes de
          leerlos como pesos.
        </p>
      </Nota>

      <Nota tono="info" titulo="Qué sale de tu computadora">
        <p>
          Nada. El archivo se arma en tu navegador con los datos que esta página ya había cargado y
          se guarda en tu disco: no pasa por ningún servidor intermedio ni por un servicio de
          terceros. Como consecuencia, la descarga tampoco queda registrada en la bitácora: ahí sólo
          se anotan los cambios en la base de datos, y una descarga no cambia nada. Si necesitas
          rastrear quién exportó qué, hay que registrarlo desde el servidor; está pendiente.
        </p>
      </Nota>
    </>
  );
}
