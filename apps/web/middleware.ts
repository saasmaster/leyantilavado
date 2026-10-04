import { NextResponse, type NextRequest } from 'next/server';
import { actualizarSesion } from '@/lib/supabase/middleware';
import { REDIRECCIONES_QUE_CAMBIO } from '@/content/redirecciones';

/**
 * Las URL retiradas se redirigen aquí y no en `next.config.mjs` porque la lista
 * se deriva del corpus en TypeScript, y la config es JavaScript: no puede
 * importarla. Escribir los 18 slugs a mano en la config crearía una segunda
 * fuente de verdad que se desincroniza en la primera reforma.
 */
export async function middleware(peticion: NextRequest) {
  const destino = REDIRECCIONES_QUE_CAMBIO.get(peticion.nextUrl.pathname);
  if (destino) {
    const url = peticion.nextUrl.clone();
    url.pathname = destino;
    // 301 y no 308: el enlace entrante que importa viene de un buscador, y 301
    // es la señal que esos entienden como «mueve el valor a esta otra URL».
    return NextResponse.redirect(url, 301);
  }
  return actualizarSesion(peticion);
}

export const config = {
  matcher: [
    /*
     * Todo menos archivos estáticos e imágenes. El middleware corre también en
     * el sitio público porque ahí es donde se refresca la cookie de sesión que
     * mantiene viva la sesión del área privada.
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)',
  ],
};
