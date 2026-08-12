import type { NextRequest } from 'next/server';
import { actualizarSesion } from '@/lib/supabase/middleware';

export async function middleware(peticion: NextRequest) {
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
