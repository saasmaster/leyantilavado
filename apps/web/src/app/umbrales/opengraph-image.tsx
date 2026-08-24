import { datos } from '@leyantilavado/rules-engine';
import { formatearMXN } from '@leyantilavado/types';
import { tarjetaSocial } from '@/components/og/TarjetaSocial';

export { size, contentType } from '@/components/og/TarjetaSocial';
export const alt = 'Umbrales de identificación y aviso — LeyAntilavado.org';

export default function Imagen() {
  // La cifra sale del motor, no del texto: el 1 de febrero cambia sola.
  const uma = datos.UMA_VIGENTE_MAS_RECIENTE;

  return tarjetaSocial({
    fondo: 'umbrales',
    titulo: 'Umbrales de identificación y aviso',
    apoyo: `UMA ${uma.anio}: ${formatearMXN(uma.diariaCentavos)} diarios. Los dos umbrales de cada actividad vulnerable, en UMA y en pesos, con el artículo del que salen.`,
  });
}
