import { tarjetaSocial } from '@/components/og/TarjetaSocial';

export { size, contentType } from '@/components/og/TarjetaSocial';
export const alt = 'Multas y sanciones de la LFPIORPI — LeyAntilavado.org';

export default function Imagen() {
  return tarjetaSocial({
    fondo: 'multas',
    titulo: 'Multas y sanciones de la LFPIORPI',
    apoyo: 'El artículo 53 enumera las infracciones y el 54 fija el costo. Con los rangos y la autocorrección.',
  });
}
