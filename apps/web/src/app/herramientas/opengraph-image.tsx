import { tarjetaSocial } from '@/components/og/TarjetaSocial';

export { size, contentType } from '@/components/og/TarjetaSocial';
export const alt = 'Calculadoras de la Ley Antilavado — LeyAntilavado.org';

export default function Imagen() {
  return tarjetaSocial({
    fondo: 'herramientas',
    titulo: 'Calculadoras de la Ley Antilavado',
    apoyo: 'Umbrales, UMA, acumulación, efectivo, multas y plazos. Gratis y sin cuenta.',
  });
}
