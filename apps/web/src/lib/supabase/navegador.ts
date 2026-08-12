'use client';

import { createBrowserClient } from '@supabase/ssr';
import { CLAVE_ANONIMA, URL_SUPABASE, supabaseConfigurado } from './configuracion';

type ClienteNavegador = ReturnType<typeof createBrowserClient>;

let cliente: ClienteNavegador | null = null;

/**
 * Cliente de Supabase para el navegador. Devuelve `null` cuando faltan las
 * variables de entorno: quien lo use debe manejar ese caso, nunca reventar.
 */
export function clienteNavegador(): ClienteNavegador | null {
  if (!supabaseConfigurado) return null;
  cliente ??= createBrowserClient(URL_SUPABASE, CLAVE_ANONIMA);
  return cliente;
}
