import { tarjetaSocial } from '@/components/og/TarjetaSocial';

export { size, contentType } from '@/components/og/TarjetaSocial';
export const alt = 'Calendario de cumplimiento 2026-2029 — LeyAntilavado.org';

export default function Imagen() {
  return tarjetaSocial({
    fondo: 'calendario',
    titulo: 'Calendario de cumplimiento 2026-2029',
    apoyo: 'Qué vence, cuándo y a quién le aplica, con cuenta regresiva a cada fecha.',
  });
}
