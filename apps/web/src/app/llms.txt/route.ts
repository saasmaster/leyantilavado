import { construirLlmsTxt } from '@/lib/seo/llms';

/**
 * `/llms.txt` — la portada del sitio escrita para un modelo de lenguaje.
 *
 * Se genera en el build, igual que el sitemap: el contenido depende sólo del
 * motor de reglas y de los datos editoriales, así que no hay razón para
 * calcularlo en cada petición.
 *
 * Ojo con el nombre de la carpeta: en el enrutador de Next el segmento se
 * llama literalmente `llms.txt`, con punto. Así el archivo queda en la raíz
 * —que es donde los rastreadores lo buscan— sin reescrituras en nginx.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  return new Response(construirLlmsTxt(), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
