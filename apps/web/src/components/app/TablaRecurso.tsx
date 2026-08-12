import type { ReactNode } from 'react';
import { formatearMXN, type Centavos } from '@leyantilavado/types';
import { formatearFechaCorta } from '@leyantilavado/rules-engine';
import { EstadoVacio, Insignia, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { listar, type OpcionesListado, type Resultado } from '@/lib/app/consultas';

export type FormatoCelda = 'texto' | 'fecha' | 'fecha_hora' | 'dinero' | 'insignia' | 'booleano' | 'numero';

export interface ColumnaTabla {
  clave: string;
  titulo: string;
  formato?: FormatoCelda;
  /** Texto que se muestra cuando la celda viene vacía. */
  vacio?: string;
}

type Fila = Record<string, unknown>;

function formatear(valor: unknown, formato: FormatoCelda | undefined, vacio: string): ReactNode {
  if (valor === null || valor === undefined || valor === '') return <span className="text-[var(--color-tinta-tenue)]">{vacio}</span>;

  switch (formato) {
    case 'dinero':
      return <span className="cifra">{formatearMXN(Number(valor) as Centavos)}</span>;
    case 'numero':
      return <span className="cifra">{new Intl.NumberFormat('es-MX').format(Number(valor))}</span>;
    case 'fecha':
      return <span className="cifra">{formatearFechaCorta(String(valor).slice(0, 10))}</span>;
    case 'fecha_hora':
      return <span className="cifra">{String(valor).slice(0, 16).replace('T', ' ')}</span>;
    case 'booleano':
      return <Insignia tono={valor ? 'verde' : 'neutro'}>{valor ? 'Sí' : 'No'}</Insignia>;
    case 'insignia':
      return <Insignia tono="neutro">{String(valor)}</Insignia>;
    default:
      return String(valor);
  }
}

/** Dibuja los tres estados no felices sin inventar datos. */
export function EstadoConsulta({
  resultado,
  vacioTitulo,
  vacioDescripcion,
  accion,
}: {
  resultado: Resultado<unknown>;
  vacioTitulo: string;
  vacioDescripcion: string;
  accion?: ReactNode;
}) {
  if (resultado.estado === 'sin_configurar') {
    return (
      <Nota tono="atencion" titulo="Sin base de datos conectada">
        <p>
          Esta sección lee de Supabase y todavía no está configurado en este entorno. Faltan:{' '}
          {resultado.faltantes.join(', ')}. Las instrucciones están en <code>supabase/README.md</code>.
        </p>
      </Nota>
    );
  }
  if (resultado.estado === 'error') {
    return (
      <Nota tono="riesgo" titulo="No se pudo leer la información">
        <p>{resultado.mensaje}</p>
      </Nota>
    );
  }
  return <EstadoVacio titulo={vacioTitulo} descripcion={vacioDescripcion} accion={accion} />;
}

/**
 * Tabla genérica sobre una tabla de Postgres.
 *
 * Un solo componente para las decenas de listados del área privada y del panel
 * administrativo: la alternativa era repetir el mismo bloque de consulta,
 * estados vacíos y accesibilidad en cada página.
 */
export async function TablaRecurso({
  tabla,
  columnas,
  seleccion,
  vacioTitulo,
  vacioDescripcion,
  accionVacio,
  pie,
  ...opciones
}: Omit<OpcionesListado, 'columnas'> & {
  tabla: string;
  columnas: readonly ColumnaTabla[];
  /** `select` de PostgREST. Por omisión, las claves de `columnas`. */
  seleccion?: string;
  vacioTitulo: string;
  vacioDescripcion: string;
  accionVacio?: ReactNode;
  pie?: ReactNode;
}) {
  const resultado = await listar<Fila>(tabla, {
    ...opciones,
    columnas: seleccion ?? columnas.map((c) => c.clave).join(','),
  });

  if (resultado.estado !== 'ok' || resultado.filas.length === 0) {
    return (
      <EstadoConsulta
        resultado={resultado}
        vacioTitulo={vacioTitulo}
        vacioDescripcion={vacioDescripcion}
        accion={accionVacio}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <TablaEnvoltura aria-label={vacioTitulo}>
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
              {columnas.map((c) => (
                <th
                  key={c.clave}
                  scope="col"
                  className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                >
                  {c.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resultado.filas.map((fila, i) => (
              <tr
                key={String(fila['id'] ?? i)}
                className="border-b border-[var(--color-borde)] last:border-0"
              >
                {columnas.map((c) => (
                  <td key={c.clave} className="px-3 py-2.5 align-top text-[var(--color-tinta)]">
                    {formatear(fila[c.clave], c.formato, c.vacio ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TablaEnvoltura>
      {pie}
      <p className="text-xs text-[var(--color-tinta-tenue)]">
        {resultado.filas.length} {resultado.filas.length === 1 ? 'registro' : 'registros'}. Lo que
        ves depende de tu rol: las políticas de la base de datos filtran las filas antes de que
        lleguen a esta pantalla.
      </p>
    </div>
  );
}
