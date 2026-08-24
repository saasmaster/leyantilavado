import { tarjetaSocial } from '@/components/og/TarjetaSocial';

export { size, contentType } from '@/components/og/TarjetaSocial';
export const alt = 'Glosario de la Ley Antilavado — LeyAntilavado.org';

export default function Imagen() {
  return tarjetaSocial({
    fondo: 'glosario',
    titulo: 'Glosario de la Ley Antilavado',
    apoyo: 'PLD, EBR, PEP, beneficiario controlador y el resto del vocabulario, en español claro.',
  });
}
