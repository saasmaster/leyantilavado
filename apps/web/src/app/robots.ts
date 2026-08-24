import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/sitio';
import { RASTREADORES_IA, RASTREADORES_IA_BLOQUEADOS } from '@/lib/seo/rastreadores-ia';

/**
 * Rutas que ningún rastreador debe recorrer.
 *
 * La lista anterior nombraba `/app/` y `/resultado/`, que no existen: el área
 * privada vive en el grupo de rutas `(app)` —que no aporta segmento— y se sirve
 * bajo `/panel/`, y los resultados de las herramientas se calculan en el
 * navegador sin URL propia. Bloquear rutas inexistentes no rompe nada, pero da
 * la impresión de que el área privada está cubierta cuando no lo estaba: hasta
 * ahora `/panel/*` y `/actualizar-contrasena` quedaban abiertos.
 *
 * `/offline` es la página de respaldo del service worker: es contenido real,
 * pero indexarla sería ofrecerle a alguien un resultado de búsqueda que dice
 * "no hay conexión".
 */
const RUTAS_PRIVADAS = [
  '/panel/',
  '/admin/',
  '/api/',
  '/entrar',
  '/registro',
  '/recuperar',
  '/actualizar-contrasena',
  '/offline',
];

export default function robots(): MetadataRoute.Robots {
  // Interruptor deliberado para entornos de preparación. Cuando está cerrado,
  // se cierra para todos —incluidos los rastreadores de modelos— porque un
  // borrador citado en una respuesta de IA es igual de malo que uno indexado.
  if (!SITIO.indexable) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: RUTAS_PRIVADAS },

      /**
       * Rastreadores de modelos de lenguaje, con entrada propia.
       *
       * No es redundante con la regla `*`: algunos de estos agentes —
       * `Google-Extended` y `Applebot-Extended`— no son rastreadores sino
       * interruptores de permiso, y si no aparecen con nombre el operador
       * decide por omisión. Escribirlos convierte la decisión en algo
       * explícito y revisable. El porqué de la política está en
       * `lib/seo/rastreadores-ia.ts`.
       */
      ...RASTREADORES_IA.map((r) => ({
        userAgent: r.agente,
        allow: '/',
        disallow: RUTAS_PRIVADAS,
      })),

      ...RASTREADORES_IA_BLOQUEADOS.map((agente) => ({
        userAgent: agente,
        disallow: '/',
      })),
    ],
    sitemap: `${SITIO.url}/sitemap.xml`,
    /*
     * Sin `host`.
     *
     * Google no lee esa directiva —nunca la soportó— y los rastreadores que sí
     * la interpretan esperan sólo el nombre de host, sin `https://`. Es decir:
     * la línea que servíamos no la entendía nadie. Como el dominio canónico ya
     * se declara donde sí se respeta —la etiqueta `canonical` de cada página y
     * la redirección de `www` al apex—, la directiva no aporta y se retira en
     * lugar de dejar una instrucción malformada en un archivo público.
     */
  };
}
