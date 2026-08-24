import { SITIO } from '@/lib/sitio';

/**
 * Origen público del sitio, deducido de las cabeceras de la petición.
 *
 * ── Por qué no basta con `peticion.url` ni con `peticion.nextUrl` ───────────
 *
 * Detrás de nginx, la app escucha en `127.0.0.1:5400` y **ambos** resuelven a
 * ese origen interno. Producción devolvía literalmente
 * `Location: https://localhost:5400/entrar?...`.
 *
 * El middleware sí acierta, y esa asimetría despista: invita a pensar que
 * `nextUrl` es la fuente correcta. Se probó en producción y no lo es —en un
 * route handler devuelve el mismo origen interno—. La única fuente fiable
 * detrás de un proxy es lo que el proxy declara en las cabeceras.
 *
 * El respaldo es `SITIO.url` y nunca `localhost`: estas URL acaban en la
 * cabecera `Location` y, peor, dentro de correos de confirmación y de
 * recuperación. Un enlace a `localhost` en un correo ya enviado no se puede
 * corregir. Cuando el respaldo va a la bandeja de alguien, tiene que ser la
 * dirección real del sitio.
 */
export function origenDeCabeceras(cabeceras: Headers): string {
  const host = cabeceras.get('x-forwarded-host') ?? cabeceras.get('host');
  if (!host) return SITIO.url;

  // En desarrollo se entra por http://localhost:5400 y no hay proxy que
  // declare el protocolo; fuera de ahí, se asume https.
  const protocolo =
    cabeceras.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return `${protocolo}://${host}`;
}
