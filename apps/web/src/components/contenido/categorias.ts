import type { CategoriaObligacion } from '@leyantilavado/types';

/** Etiquetas legibles de las categorías de obligación. Viven fuera de las páginas
 *  porque un archivo `page.tsx` sólo debe exportar lo que Next espera. */
export const ETIQUETA_CATEGORIA: Record<CategoriaObligacion, string> = {
  registro: 'Alta y registro',
  identificacion: 'Identificación del cliente',
  expediente: 'Expedientes',
  avisos: 'Avisos e informes',
  riesgos: 'Gestión de riesgos',
  gobierno: 'Gobierno interno',
  capacitacion: 'Capacitación',
  tecnologia: 'Tecnología',
  auditoria: 'Auditoría',
  conservacion: 'Conservación',
};

export const ORDEN_CATEGORIAS: readonly CategoriaObligacion[] = [
  'registro',
  'gobierno',
  'identificacion',
  'expediente',
  'riesgos',
  'avisos',
  'tecnologia',
  'capacitacion',
  'auditoria',
  'conservacion',
];

export const ETIQUETA_RECURRENCIA: Record<string, string> = {
  unica: 'Una sola vez',
  mensual: 'Mensual',
  semestral: 'Semestral',
  anual: 'Anual',
};
