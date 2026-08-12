import { createClient } from '@supabase/supabase-js';
import { URL_SUPABASE } from './configuracion';

const CLAVE_SERVICIO = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

/**
 * Cliente con clave de servicio. SALTA TODAS LAS POLÍTICAS RLS.
 *
 * Uso permitido: tareas programadas del servidor (monitor regulatorio) y
 * escrituras del sistema que no tienen un usuario detrás. NUNCA se importa
 * desde un componente marcado con `'use client'`: la clave llegaría al
 * navegador. Sólo se lee de `process.env` sin prefijo `NEXT_PUBLIC_`, así que
 * en cliente saldría vacía, pero el import sigue estando prohibido.
 */
export function clienteAdministrador() {
  if (!URL_SUPABASE || !CLAVE_SERVICIO) return null;
  return createClient(URL_SUPABASE, CLAVE_SERVICIO, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const servicioConfigurado: boolean = Boolean(URL_SUPABASE && CLAVE_SERVICIO);
