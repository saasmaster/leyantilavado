import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { CookiePorEscribir } from './servidor';
import {
  CLAVE_ANONIMA,
  PREFIJOS_PROTEGIDOS,
  RUTA_ENTRAR,
  URL_SUPABASE,
  supabaseConfigurado,
} from './configuracion';

function esProtegida(ruta: string): boolean {
  return PREFIJOS_PROTEGIDOS.some((p) => ruta === p || ruta.startsWith(`${p}/`));
}

/**
 * Refresca la sesión en cada navegación y bloquea el área privada.
 *
 * Si Supabase no está configurado NO se redirige a ningún lado: se deja pasar
 * para que el layout del área privada muestre la pantalla honesta de
 * "configuración pendiente". El sitio público nunca se ve afectado.
 */
export async function actualizarSesion(peticion: NextRequest): Promise<NextResponse> {
  let respuesta = NextResponse.next({ request: peticion });

  if (!supabaseConfigurado) return respuesta;

  const supabase = createServerClient(URL_SUPABASE, CLAVE_ANONIMA, {
    cookies: {
      getAll() {
        return peticion.cookies.getAll();
      },
      setAll(porEscribir: CookiePorEscribir[]) {
        for (const { name, value } of porEscribir) {
          peticion.cookies.set(name, value);
        }
        respuesta = NextResponse.next({ request: peticion });
        for (const { name, value, options } of porEscribir) {
          respuesta.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() valida el token contra el servidor de auth. getSession() sólo lee
  // la cookie y por eso no sirve como control de acceso.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ruta = peticion.nextUrl.pathname;

  if (!user && esProtegida(ruta)) {
    const destino = peticion.nextUrl.clone();
    destino.pathname = RUTA_ENTRAR;
    destino.search = '';
    // Se preserva el destino para volver ahí después de entrar. Sólo rutas
    // internas: un `destino` absoluto sería un redirector abierto.
    destino.searchParams.set('destino', `${ruta}${peticion.nextUrl.search}`);
    return NextResponse.redirect(destino);
  }

  return respuesta;
}

// `destinoSeguro` vive en @/lib/auth/permisos (módulo puro y con pruebas). Se
// reexporta aquí porque las páginas de autenticación ya lo importaban de este
// archivo.
export { destinoSeguro } from '@/lib/auth/permisos';
