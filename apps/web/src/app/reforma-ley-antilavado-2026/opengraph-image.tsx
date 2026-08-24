import { tarjetaSocial } from '@/components/og/TarjetaSocial';

export { size, contentType } from '@/components/og/TarjetaSocial';
export const alt = 'Qué cambió con la reforma de 2026 — LeyAntilavado.org';

export default function Imagen() {
  return tarjetaSocial({
    fondo: 'reforma',
    titulo: 'Qué cambió con la reforma de 2026',
    apoyo: 'De la reforma de 2025 al Acuerdo 115/2026, cambio por cambio y actividad por actividad.',
  });
}
