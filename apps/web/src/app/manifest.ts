import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/sitio';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITIO.nombre} — ${SITIO.subtitulo}`,
    short_name: 'LeyAntilavado',
    description: SITIO.descripcion,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#FBFAF7',
    theme_color: '#0B2545',
    lang: 'es-MX',
    dir: 'ltr',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      { src: '/icons/icono-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icono-mascara-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: '¿Me aplica la ley?',
        short_name: 'Cuestionario',
        url: '/herramientas/cuestionario',
      },
      {
        name: 'Calcular umbrales',
        short_name: 'Umbrales',
        url: '/herramientas/calculadora-umbrales',
      },
      {
        name: 'Convertir UMA',
        short_name: 'UMA',
        url: '/herramientas/calculadora-uma',
      },
    ],
  };
}
