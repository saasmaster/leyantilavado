import { tarjetaSocial } from '@/components/og/TarjetaSocial';

export { size, contentType } from '@/components/og/TarjetaSocial';
export const alt = 'Los límites de efectivo del artículo 32 — LeyAntilavado.org';

export default function Imagen() {
  return tarjetaSocial({
    fondo: 'limites-efectivo',
    titulo: 'Los límites de efectivo del artículo 32',
    apoyo: 'No es un umbral de reporte: es una prohibición, y se mide con IVA incluido.',
  });
}
