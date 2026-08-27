import { construirLlmsFullTxt } from '@/lib/seo/llms-full';

/**
 * `/llms-full.txt` — el corpus legal completo para modelos.
 *
 * Mismo patrón que `/llms.txt`: una ruta que devuelve texto plano, no un
 * archivo estático en `public/`. La diferencia importa: un archivo estático
 * habría que regenerarlo a mano cada vez que cambie una regla, y el día que
 * alguien lo olvide el archivo se convierte en la fuente desactualizada que
 * los modelos citan durante años.
 */
export const dynamic = 'force-static';

export function GET() {
  return new Response(construirLlmsFullTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
