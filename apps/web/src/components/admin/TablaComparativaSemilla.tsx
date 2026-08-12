import type { EstadoEditorial, NivelVerificacion } from '@leyantilavado/types';
import { Insignia, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { Seccion } from '@/components/app/Contenedor';
import { listar } from '@/lib/app/consultas';

export interface FilaSemilla {
  /** Identificador estable del dato en el motor (id o slug). */
  id: string;
  nombre: string;
  /** Ya viene formateado desde `datos.*`. Ningún número se escribe aquí. */
  detalle: string;
  disposicion?: string;
  verificacion?: NivelVerificacion;
  estado?: EstadoEditorial;
}

const ETIQUETA_NIVEL: Record<NivelVerificacion, string> = {
  oficial_verificado: 'Fuente oficial verificada',
  oficial_no_accesible: 'Oficial no accesible',
  fuente_secundaria: 'Fuente secundaria',
  no_verificado: 'Sin verificar',
};

const TONO_NIVEL: Record<NivelVerificacion, 'verde' | 'ambar' | 'rojo'> = {
  oficial_verificado: 'verde',
  oficial_no_accesible: 'ambar',
  fuente_secundaria: 'ambar',
  no_verificado: 'rojo',
};

const ETIQUETA_ESTADO: Record<EstadoEditorial, string> = {
  borrador: 'Borrador',
  revisado: 'Revisado',
  publicado: 'Publicado',
  sustituido: 'Sustituido',
};

/**
 * Compara lo que hay en la base con lo que trae el motor.
 *
 * Dos motivos para que exista: primero, la base puede estar sin sembrar y la
 * pantalla tiene que decirlo en lugar de mostrar un listado vacío que parece
 * "no hay reglas"; segundo, quien edita necesita ver contra qué está comparando,
 * porque lo que calculan las herramientas es el motor, no la fila de Postgres.
 *
 * Compara CANTIDADES, no contenido campo por campo. Una diferencia de número es
 * una señal segura de desincronía; que coincidan no prueba que digan lo mismo, y
 * el texto de abajo lo dice así.
 */
export async function TablaComparativaSemilla({
  tabla,
  clave,
  titulo,
  filas,
}: {
  tabla: string;
  /** Nombre de la columna llave: varias tablas del corpus no tienen `id`. */
  clave: string;
  titulo: string;
  filas: readonly FilaSemilla[];
}) {
  const resultado = await listar<Record<string, unknown>>(tabla, {
    columnas: clave,
    incluirEliminados: true,
    limite: 1000,
  });

  const enBase = resultado.estado === 'ok' ? resultado.filas.length : null;

  return (
    <Seccion
      titulo={titulo}
      descripcion={`Estas ${filas.length} entradas son las que el motor usa hoy para calcular. Vienen del código (@leyantilavado/rules-engine), viajan con el despliegue y no dependen de que la base esté conectada.`}
    >
      <ComparacionCantidad
        tabla={tabla}
        enMotor={filas.length}
        enBase={enBase}
        detalleError={resultado.estado === 'error' ? resultado.mensaje : null}
        faltantes={resultado.estado === 'sin_configurar' ? resultado.faltantes : null}
      />

      <TablaEnvoltura aria-label={titulo}>
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
              {['Identificador', 'Nombre', 'Lo que dice el motor', 'Disposición', 'Procedencia'].map(
                (encabezado) => (
                  <th
                    key={encabezado}
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                  >
                    {encabezado}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila.id} className="border-b border-[var(--color-borde)] last:border-0">
                <td className="px-3 py-2.5 align-top">
                  <code className="text-xs text-[var(--color-tinta-suave)]">{fila.id}</code>
                </td>
                <td className="px-3 py-2.5 align-top text-[var(--color-tinta)]">{fila.nombre}</td>
                <td className="max-w-md px-3 py-2.5 align-top text-[var(--color-tinta)]">
                  {fila.detalle}
                </td>
                <td className="px-3 py-2.5 align-top text-[var(--color-tinta-suave)]">
                  {fila.disposicion ?? '—'}
                </td>
                <td className="px-3 py-2.5 align-top">
                  <span className="flex flex-wrap gap-1.5">
                    {fila.verificacion && (
                      <Insignia tono={TONO_NIVEL[fila.verificacion]}>
                        {ETIQUETA_NIVEL[fila.verificacion]}
                      </Insignia>
                    )}
                    {fila.estado && (
                      <Insignia tono={fila.estado === 'publicado' ? 'marino' : 'neutro'}>
                        {ETIQUETA_ESTADO[fila.estado]}
                      </Insignia>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablaEnvoltura>
    </Seccion>
  );
}

function ComparacionCantidad({
  tabla,
  enMotor,
  enBase,
  detalleError,
  faltantes,
}: {
  tabla: string;
  enMotor: number;
  enBase: number | null;
  detalleError: string | null;
  faltantes: string[] | null;
}) {
  if (faltantes) {
    return (
      <Nota tono="atencion" titulo="Sin base de datos conectada">
        <p>
          No se pudo leer <code>{tabla}</code> porque Supabase no está configurado en este entorno
          (faltan {faltantes.join(', ')}). Aun así esta sección sirve: lo que ves abajo son las{' '}
          {enMotor} entradas del motor, que es lo que realmente responde en las herramientas.
        </p>
      </Nota>
    );
  }

  if (detalleError !== null) {
    return (
      <Nota tono="riesgo" titulo="No se pudo leer la tabla">
        <p>
          {detalleError} Lo de abajo sigue siendo válido: son las {enMotor} entradas del motor, que
          no dependen de la base.
        </p>
      </Nota>
    );
  }

  if (enBase === 0) {
    return (
      <Nota tono="atencion" titulo="La base todavía no está sembrada">
        <p>
          <code>{tabla}</code> tiene 0 filas y el motor trae {enMotor}. El sitio funciona igual —
          las herramientas calculan con el motor — pero mientras la tabla esté vacía no hay dónde
          registrar quién cambió una regla ni por qué, que es justo para lo que existe.
        </p>
      </Nota>
    );
  }

  if (enBase !== null && enBase !== enMotor) {
    return (
      <Nota tono="atencion" titulo="La base y el motor no tienen el mismo número de entradas">
        <p>
          <code>{tabla}</code> tiene {enBase} filas y el motor trae {enMotor}. Alguien sembró una
          versión distinta o el corpus cambió sin actualizar la otra parte. Revísalo antes de tomar
          esta tabla como historial fiable.
        </p>
      </Nota>
    );
  }

  return (
    <Nota tono="info" titulo="La base y el motor coinciden en número de entradas">
      <p>
        <code>{tabla}</code> tiene {enBase} filas y el motor trae {enMotor}. Coincidir en cantidad
        no prueba que digan lo mismo: esta comparación cuenta registros, no compara campo por
        campo. Para eso está el historial de versiones.
      </p>
    </Nota>
  );
}
