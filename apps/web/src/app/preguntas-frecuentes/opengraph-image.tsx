import { tarjetaSocial } from '@/components/og/TarjetaSocial';

export { size, contentType } from '@/components/og/TarjetaSocial';
export const alt = 'Preguntas frecuentes de la Ley Antilavado — LeyAntilavado.org';

export default function Imagen() {
  return tarjetaSocial({
    fondo: 'faq',
    titulo: 'Preguntas frecuentes de la Ley Antilavado',
    apoyo: 'Las dudas que más se repiten, respondidas con su artículo y su fuente oficial.',
  });
}
