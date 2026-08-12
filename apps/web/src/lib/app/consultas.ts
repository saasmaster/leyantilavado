import { clienteServidor } from '@/lib/supabase/servidor';
import { supabaseConfigurado, variablesFaltantes } from '@/lib/supabase/configuracion';

/**
 * Punto único de lectura del área privada y del panel administrativo.
 *
 * Devuelve un estado explícito en lugar de lanzar: una organización recién
 * creada sin datos, una base sin configurar y un error de red son tres cosas
 * distintas y la interfaz tiene que poder decir cuál pasó. Ningún componente
 * inventa filas de ejemplo.
 *
 * El aislamiento por organización lo impone RLS en Postgres. El filtro por
 * `organizationId` que se manda aquí es una conveniencia de consulta, no la
 * frontera de seguridad.
 */
export type Resultado<T> =
  | { estado: 'sin_configurar'; faltantes: string[] }
  | { estado: 'error'; mensaje: string }
  | { estado: 'ok'; filas: T[] };

export interface OpcionesListado {
  columnas?: string;
  ordenarPor?: string;
  ascendente?: boolean;
  limite?: number;
  organizacionId?: string | null;
  /** Igualdades simples. `null` compara con IS NULL. */
  filtros?: Record<string, string | number | boolean | null>;
  /** Excluye filas con eliminación lógica. Por omisión, sí. */
  incluirEliminados?: boolean;
}

export async function listar<T>(
  tabla: string,
  opciones: OpcionesListado = {},
): Promise<Resultado<T>> {
  if (!supabaseConfigurado) {
    return { estado: 'sin_configurar', faltantes: variablesFaltantes() };
  }
  const supabase = await clienteServidor();
  if (!supabase) return { estado: 'sin_configurar', faltantes: variablesFaltantes() };

  async function ejecutar(filtrarEliminados: boolean) {
    let consulta = supabase!.from(tabla).select(opciones.columnas ?? '*');

    if (opciones.organizacionId) {
      consulta = consulta.eq('organization_id', opciones.organizacionId);
    }
    for (const [columna, valor] of Object.entries(opciones.filtros ?? {})) {
      consulta = valor === null ? consulta.is(columna, null) : consulta.eq(columna, valor);
    }
    if (filtrarEliminados) {
      consulta = consulta.is('deleted_at', null);
    }
    if (opciones.ordenarPor) {
      consulta = consulta.order(opciones.ordenarPor, { ascending: opciones.ascendente ?? false });
    }
    return consulta.limit(opciones.limite ?? 200);
  }

  let { data, error } = await ejecutar(!opciones.incluirEliminados);

  // 42703 = columna inexistente. Muchas tablas del corpus legal no tienen
  // eliminación lógica a propósito (una regla histórica se sustituye, nunca se
  // borra), así que el filtro por `deleted_at` no aplica. Se reintenta sin él
  // en lugar de obligar a cada una de las ~40 pantallas a acordarse de la
  // bandera: olvidarla producía una pantalla de error por un detalle interno.
  if (error?.code === '42703' && error.message.includes('deleted_at')) {
    ({ data, error } = await ejecutar(false));
  }

  if (error) {
    // 42P01 = la tabla no existe: las migraciones no se han aplicado.
    if (error.code === '42P01') {
      return {
        estado: 'error',
        mensaje:
          'La tabla no existe todavía en la base de datos. Aplica las migraciones de supabase/migrations.',
      };
    }
    return { estado: 'error', mensaje: error.message };
  }

  return { estado: 'ok', filas: (data ?? []) as T[] };
}

/** Cuenta filas sin traerlas. Útil para las tarjetas del panel de control. */
export async function contar(
  tabla: string,
  opciones: Pick<OpcionesListado, 'organizacionId' | 'filtros' | 'incluirEliminados'> = {},
): Promise<Resultado<number>> {
  if (!supabaseConfigurado) {
    return { estado: 'sin_configurar', faltantes: variablesFaltantes() };
  }
  const supabase = await clienteServidor();
  if (!supabase) return { estado: 'sin_configurar', faltantes: variablesFaltantes() };

  async function ejecutar(filtrarEliminados: boolean) {
    // `*` y no `id`: varias tablas del corpus legal tienen la clave primaria en
    // `slug`, `year` o `key`. Con `head: true` no viaja ninguna fila, así que
    // pedir todas las columnas no cuesta nada.
    let consulta = supabase!.from(tabla).select('*', { count: 'exact', head: true });
    if (opciones.organizacionId) consulta = consulta.eq('organization_id', opciones.organizacionId);
    for (const [columna, valor] of Object.entries(opciones.filtros ?? {})) {
      consulta = valor === null ? consulta.is(columna, null) : consulta.eq(columna, valor);
    }
    if (filtrarEliminados) consulta = consulta.is('deleted_at', null);
    return consulta;
  }

  let { count, error } = await ejecutar(!opciones.incluirEliminados);
  if (error?.code === '42703' && error.message.includes('deleted_at')) {
    ({ count, error } = await ejecutar(false));
  }

  if (error) return { estado: 'error', mensaje: error.message };
  return { estado: 'ok', filas: [count ?? 0] };
}
