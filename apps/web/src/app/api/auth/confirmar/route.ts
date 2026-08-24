import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { clienteServidor } from '@/lib/supabase/servidor';
import { destinoSeguro } from '@/lib/supabase/middleware';
import { supabaseConfigurado } from '@/lib/supabase/configuracion';
import { origenDeCabeceras } from '@/lib/auth/origen';

/**
 * Punto de aterrizaje de los enlaces por correo (confirmación de registro,
 * recuperación de contraseña e invitaciones).
 *
 * El `destino` se sanea con `destinoSeguro`: aceptar una URL absoluta aquí
 * convertiría este endpoint en un redirector abierto, perfecto para mandar a
 * alguien a un clon del sitio justo después de que confirma su correo.
 */
/**
 * Tipos de enlace que este endpoint acepta.
 *
 * Antes el parámetro se casteaba con `as EmailOtpType` sin comprobar nada, y un
 * cast de TypeScript no existe en tiempo de ejecución: lo que llegara en la
 * query pasaba tal cual a `verifyOtp`. Eso permite construir un enlace que
 * verifica el token como un tipo distinto del que el correo anunciaba —por
 * ejemplo, colar a alguien por el flujo de «aceptar invitación» cuando creía
 * estar confirmando su correo—. El vector necesita ingeniería social, pero la
 * defensa cuesta cuatro líneas.
 *
 * La lista es cerrada a propósito: si Supabase añade un tipo nuevo, este
 * endpoint lo rechaza hasta que alguien decida conscientemente admitirlo.
 */
const TIPOS_ACEPTADOS = ['signup', 'recovery', 'invite', 'magiclink', 'email_change'] as const;

function tipoValido(valor: string | null): valor is EmailOtpType {
  return valor !== null && (TIPOS_ACEPTADOS as readonly string[]).includes(valor);
}

export async function GET(peticion: NextRequest) {
  const params = peticion.nextUrl.searchParams;
  const token_hash = params.get('token_hash');
  const tipoCrudo = params.get('type');
  const type = tipoValido(tipoCrudo) ? tipoCrudo : null;
  const destino = destinoSeguro(params.get('destino'), '/panel');

  /*
   * El origen público sólo lo conoce el proxy.
   *
   * Ni `peticion.url` ni `peticion.nextUrl` sirven aquí: detrás de nginx la app
   * escucha en 127.0.0.1:5400 y los dos resuelven a ese origen interno.
   * Producción devolvía literalmente `Location: https://localhost:5400/entrar`.
   *
   * El middleware sí acierta, y esa asimetría engaña —invita a creer que
   * `nextUrl` es la fuente buena—. Se probó contra producción y no lo es.
   */
  const base = origenDeCabeceras(peticion.headers);
  const errorUrl = new URL('/entrar?aviso=enlace_invalido', base);

  if (!supabaseConfigurado || !token_hash || !type) {
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await clienteServidor();
  if (!supabase) return NextResponse.redirect(errorUrl);

  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) return NextResponse.redirect(errorUrl);

  return NextResponse.redirect(new URL(destino, base));
}
