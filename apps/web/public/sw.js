/**
 * Service worker de LeyAntilavado.org
 *
 * Alcance deliberadamente estrecho: sólo las calculadoras públicas funcionan
 * sin conexión. Nada del área privada, nada de resultados de usuario y nada de
 * peticiones a la API se guarda en caché — cachear datos de cumplimiento de un
 * cliente en el disco del navegador sería un problema de privacidad, no una
 * mejora de rendimiento.
 *
 * La versión va en el nombre de la caché: al cambiarla, `activate` borra todas
 * las anteriores. Es lo que evita el clásico "X is not defined" por un bundle
 * viejo servido desde una caché zombi.
 */

const VERSION = 'v1';
const CACHE_APP = `leyantilavado-app-${VERSION}`;

/** Rutas que deben servir sin conexión. */
const PRECARGA = [
  '/',
  '/offline',
  '/herramientas',
  '/herramientas/calculadora-uma',
  '/herramientas/calculadora-umbrales',
  '/herramientas/limites-efectivo',
  '/herramientas/cuestionario',
];

/** Prefijos que NUNCA se cachean. */
const NUNCA_CACHEAR = ['/api/', '/app/', '/admin/', '/entrar', '/registro', '/recuperar'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_APP).then((cache) =>
      // `reload` evita precargar desde la caché HTTP del navegador.
      cache.addAll(PRECARGA.map((r) => new Request(r, { cache: 'reload' }))).catch(() => {
        // Si alguna ruta no existe todavía, el SW se instala igual en vez de
        // fallar entero y dejar al usuario sin service worker.
      }),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(claves.filter((c) => c !== CACHE_APP).map((c) => caches.delete(c))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;

  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return;
  if (NUNCA_CACHEAR.some((p) => url.pathname.startsWith(p))) return;

  // Navegación: red primero para que el contenido legal siempre esté fresco;
  // la caché es la red de seguridad, no la fuente principal.
  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(CACHE_APP).then((cache) => cache.put(peticion, copia));
          return respuesta;
        })
        .catch(async () => {
          const cacheada = await caches.match(peticion);
          return cacheada ?? (await caches.match('/offline')) ?? Response.error();
        }),
    );
    return;
  }

  // Estáticos con hash en el nombre: caché primero, son inmutables.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    evento.respondWith(
      caches.match(peticion).then(
        (cacheada) =>
          cacheada ??
          fetch(peticion).then((respuesta) => {
            const copia = respuesta.clone();
            caches.open(CACHE_APP).then((cache) => cache.put(peticion, copia));
            return respuesta;
          }),
      ),
    );
  }
});
