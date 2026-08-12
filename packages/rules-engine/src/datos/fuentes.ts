import type { FuenteOficial } from '@leyantilavado/types';

/**
 * Fuentes oficiales. Toda regla del motor apunta a al menos una de éstas por id.
 * El monitor regulatorio (apps/web/src/app/api/cron/monitor-fuentes) revisa
 * estas URLs y guarda el hash del contenido para detectar cambios.
 */
export const FUENTES: readonly FuenteOficial[] = [
  {
    id: 'lfpiorpi-vigente',
    nombre: 'Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita',
    emisor: 'Cámara de Diputados',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPIORPI.pdf',
    descripcion:
      'Texto vigente de la ley, compilado por la Cámara de Diputados. Incluye la reforma publicada el 16 de julio de 2025.',
    fechaPublicacion: '2025-07-16',
  },
  {
    id: 'dof-reglamento-2026',
    nombre: 'Reforma al Reglamento de la LFPIORPI',
    emisor: 'DOF',
    url: 'https://dof.gob.mx/nota_detalle.php?codigo=5783547&fecha=27/03/2026',
    descripcion:
      'Decreto por el que se reforma el Reglamento de la LFPIORPI, publicado en el Diario Oficial de la Federación.',
    fechaPublicacion: '2026-03-27',
  },
  {
    id: 'dof-acuerdo-115-2026',
    nombre: 'Acuerdo 115/2026',
    emisor: 'DOF',
    url: 'https://dof.gob.mx/nota_detalle.php?codigo=5795797&fecha=07/08/2026',
    descripcion:
      'Acuerdo publicado en el Diario Oficial de la Federación el 7 de agosto de 2026, relacionado con las obligaciones en materia de prevención de lavado de dinero.',
    fechaPublicacion: '2026-08-07',
  },
  {
    id: 'sat-marco-normativo',
    nombre: 'Marco normativo PLD — SAT',
    emisor: 'SAT',
    url: 'https://sppld.sat.gob.mx/pld/interiores/marco.html',
    descripcion:
      'Compilación del marco normativo aplicable a actividades vulnerables publicada por el SAT.',
  },
  {
    id: 'sat-umbrales',
    nombre: 'Tabla de umbrales de identificación y aviso — SAT',
    emisor: 'SAT',
    url: 'https://sppld.sat.gob.mx/pld/interiores/umbrales.html',
    descripcion:
      'Tabla oficial del SAT con los umbrales de identificación y de aviso por actividad vulnerable.',
  },
  {
    id: 'sppld-portal',
    nombre: 'Portal de Prevención de Lavado de Dinero (SPPLD)',
    emisor: 'SAT',
    url: 'https://sppld.sat.gob.mx/',
    descripcion:
      'Portal donde los sujetos obligados se dan de alta, presentan avisos e informes en ceros.',
  },
  {
    id: 'inegi-uma',
    nombre: 'Unidad de Medida y Actualización (UMA) — INEGI',
    emisor: 'INEGI',
    url: 'https://www.inegi.org.mx/temas/uma/',
    descripcion:
      'Valores diario, mensual y anual de la UMA publicados por el INEGI. Entran en vigor el 1 de febrero de cada año.',
  },
];

export const FUENTES_POR_ID: Record<string, FuenteOficial> = Object.fromEntries(
  FUENTES.map((f) => [f.id, f]),
);
