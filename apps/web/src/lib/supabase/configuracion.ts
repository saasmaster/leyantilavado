/**
 * Detección de configuración de Supabase.
 *
 * El sitio público TIENE que compilar y correr sin Supabase. Por eso nada de
 * este módulo lanza una excepción cuando faltan las variables: se expone una
 * bandera y el resto de la app decide qué hacer con ella (el área privada
 * muestra "configuración pendiente"; el sitio público ni se entera).
 */

export const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const CLAVE_ANONIMA = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** true sólo si hay URL y clave pública. No comprueba que sean válidas. */
export const supabaseConfigurado: boolean = Boolean(URL_SUPABASE && CLAVE_ANONIMA);

/** Variables que faltan, para listarlas en la pantalla de configuración. */
export function variablesFaltantes(): string[] {
  const faltan: string[] = [];
  if (!URL_SUPABASE) faltan.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!CLAVE_ANONIMA) faltan.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return faltan;
}

/** Rutas del área privada y del panel administrativo. */
export const RUTA_ENTRAR = '/entrar';
export const RUTA_PANEL = '/panel';
export const RUTA_ADMIN = '/admin';
export const PREFIJOS_PROTEGIDOS = [RUTA_PANEL, RUTA_ADMIN] as const;
