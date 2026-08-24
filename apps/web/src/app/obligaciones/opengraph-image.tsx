import { tarjetaSocial } from '@/components/og/TarjetaSocial';

export { size, contentType } from '@/components/og/TarjetaSocial';
export const alt = 'Las obligaciones de la Ley Antilavado — LeyAntilavado.org';

export default function Imagen() {
  return tarjetaSocial({
    fondo: 'obligaciones',
    titulo: 'Las obligaciones de la Ley Antilavado',
    apoyo: 'Qué tienes que hacer, desde cuándo, con qué evidencia y qué artículo lo exige.',
  });
}
