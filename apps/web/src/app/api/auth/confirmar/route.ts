import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { clienteServidor } from '@/lib/supabase/servidor';
import { destinoSeguro } from '@/lib/supabase/middleware';
import { supabaseConfigurado } from '@/lib/supabase/configuracion';

/**
 * Punto de aterrizaje de los enlaces por correo (confirmación de registro,
 * recuperación de contraseña e invitaciones).
 *
 * El `destino` se sanea con `destinoSeguro`: aceptar una URL absoluta aquí
 * convertiría este endpoint en un redirector abierto, perfecto para mandar a
 * alguien a un clon del sitio justo después de que confirma su correo.
 */
export async function GET(peticion: NextRequest) {
  const params = peticion.nextUrl.searchParams;
  const token_hash = params.get('token_hash');
  const type = params.get('type') as EmailOtpType | null;
  const destino = destinoSeguro(params.get('destino'), '/panel');

  const errorUrl = new URL('/entrar?aviso=enlace_invalido', peticion.url);

  if (!supabaseConfigurado || !token_hash || !type) {
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await clienteServidor();
  if (!supabase) return NextResponse.redirect(errorUrl);

  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) return NextResponse.redirect(errorUrl);

  return NextResponse.redirect(new URL(destino, peticion.url));
}
