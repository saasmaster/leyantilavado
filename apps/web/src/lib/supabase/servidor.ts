import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { CLAVE_ANONIMA, URL_SUPABASE, supabaseConfigurado } from './configuracion';

type ClienteServidor = ReturnType<typeof createServerClient>;

/** Forma de las cookies que `@supabase/ssr` pide escribir. */
export interface CookiePorEscribir {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 *
 * Devuelve `null` si faltan las variables de entorno. En un Server Component
 * escribir cookies lanza; por eso el `setAll` se envuelve en try/catch: la
 * renovación real de la sesión la hace el middleware.
 */
export async function clienteServidor(): Promise<ClienteServidor | null> {
  if (!supabaseConfigurado) return null;

  const almacen = await cookies();

  return createServerClient(URL_SUPABASE, CLAVE_ANONIMA, {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(porEscribir: CookiePorEscribir[]) {
        try {
          for (const { name, value, options } of porEscribir) {
            almacen.set(name, value, options);
          }
        } catch {
          // Server Component: no se pueden escribir cookies aquí. El middleware
          // ya refrescó la sesión, así que ignorarlo es correcto.
        }
      },
    },
  });
}
