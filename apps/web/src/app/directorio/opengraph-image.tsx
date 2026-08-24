import { tarjetaSocial } from '@/components/og/TarjetaSocial';

export { size, contentType } from '@/components/og/TarjetaSocial';
export const alt = 'Directorio de profesionales en cumplimiento — LeyAntilavado.org';

export default function Imagen() {
  return tarjetaSocial({
    fondo: 'directorio',
    titulo: 'Directorio de profesionales en cumplimiento',
    apoyo: 'Contadores, abogados, auditores y software. No certificamos a nadie y lo decimos.',
  });
}
