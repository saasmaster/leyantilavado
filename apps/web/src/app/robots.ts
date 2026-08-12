import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/sitio';

export default function robots(): MetadataRoute.Robots {
  // Mientras el contenido no esté revisado, el sitio no se indexa. Se abre con
  // NEXT_PUBLIC_SITE_INDEXABLE=true, de forma deliberada y no por descuido.
  if (!SITIO.indexable) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Nada de lo que el usuario captura o guarda debe llegar a un buscador.
        disallow: ['/app/', '/admin/', '/api/', '/resultado/', '/entrar', '/registro', '/recuperar'],
      },
    ],
    sitemap: `${SITIO.url}/sitemap.xml`,
    host: SITIO.url,
  };
}
