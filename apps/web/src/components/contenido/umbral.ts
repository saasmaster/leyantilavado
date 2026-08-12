import { convertirUMA } from '@leyantilavado/rules-engine';
import { formatearMXN, type Comparador, type EspecificacionUmbral } from '@leyantilavado/types';

/**
 * Traducción de una `EspecificacionUmbral` a algo que se puede pintar.
 *
 * Vive aparte de los componentes porque lo usan tanto el servidor (páginas de
 * actividad) como el cliente (tabla interactiva de /umbrales), y porque es
 * lógica pura que conviene poder probar sin renderizar nada.
 *
 * Maneja los seis casos de la unión. No hay rama por defecto: si mañana se
 * agrega un séptimo caso, TypeScript rompe aquí y no en producción.
 */
export interface MontoUmbral {
  /** "Por el monto de la operación", "Por la contraprestación", etc. */
  etiqueta?: string;
  uma: number;
  /** Ya formateado en MXN con la UMA de la fecha pedida. */
  pesos: string;
  comparador: Comparador;
  /** Año de la UMA aplicada. Se muestra para que nadie confunda el ejercicio. */
  anioUMA: number;
}

export interface VistaUmbral {
  clase: EspecificacionUmbral['tipo'];
  /** Texto corto para celdas y tarjetas cuando no hay número que mostrar. */
  resumen: string;
  montos: MontoUmbral[];
  supuestos?: { descripcion: string; vista: VistaUmbral }[];
  nota?: string;
  /** true cuando la regla no puede publicarse como cifra firme. */
  requiereRevision: boolean;
}

/** Fecha representativa de un año de UMA. La UMA entra en vigor el 1 de febrero. */
export const fechaDeAnioUMA = (anio: number): string => `${anio}-06-30`;

export const formatearUMA = (n: number): string =>
  `${n.toLocaleString('es-MX')} UMA`;

export const textoComparador = (c: Comparador): string =>
  c === 'mayor' ? 'superior a' : 'igual o superior a';

function monto(
  uma: number,
  fecha: string,
  comparador: Comparador,
  etiqueta?: string,
): MontoUmbral {
  const conversion = convertirUMA(uma, fecha);
  return {
    ...(etiqueta ? { etiqueta } : {}),
    uma,
    pesos: formatearMXN(conversion.equivalentePesos),
    comparador,
    anioUMA: conversion.anioUMA,
  };
}

export function describirUmbral(spec: EspecificacionUmbral, fecha: string): VistaUmbral {
  switch (spec.tipo) {
    case 'siempre':
      return {
        clase: 'siempre',
        resumen: 'Siempre',
        montos: [],
        ...(spec.nota ? { nota: spec.nota } : {}),
        requiereRevision: false,
      };

    case 'nunca':
      return {
        clase: 'nunca',
        resumen: 'No aplica',
        montos: [],
        ...(spec.nota ? { nota: spec.nota } : {}),
        requiereRevision: false,
      };

    case 'uma':
      return {
        clase: 'uma',
        resumen: formatearUMA(spec.uma),
        montos: [monto(spec.uma, fecha, spec.comparador ?? 'mayor_o_igual')],
        ...(spec.nota ? { nota: spec.nota } : {}),
        requiereRevision: false,
      };

    case 'monto_o_comision':
      return {
        clase: 'monto_o_comision',
        resumen: 'Dos disparadores',
        montos: [
          monto(spec.umaMonto, fecha, 'mayor_o_igual', 'Por el monto de la operación'),
          monto(spec.umaComision, fecha, 'mayor_o_igual', 'Por la contraprestación cobrada'),
        ],
        ...(spec.nota ? { nota: spec.nota } : {}),
        requiereRevision: false,
      };

    case 'variable':
      return {
        clase: 'variable',
        resumen: 'Depende del supuesto',
        montos: [],
        supuestos: spec.supuestos.map((s) => ({
          descripcion: s.descripcion,
          vista: describirUmbral(s.umbral, fecha),
        })),
        ...(spec.nota ? { nota: spec.nota } : {}),
        requiereRevision: false,
      };

    case 'requiere_revision':
      return {
        clase: 'requiere_revision',
        resumen: 'Sin umbral publicado',
        montos: [],
        nota: spec.nota,
        requiereRevision: true,
      };
  }
}

/** Tono semántico para insignias y celdas. */
export function tonoUmbral(
  vista: VistaUmbral,
): 'neutro' | 'marino' | 'petroleo' | 'ambar' | 'rojo' | 'verde' {
  switch (vista.clase) {
    case 'siempre':
      return 'rojo';
    case 'nunca':
      return 'verde';
    case 'uma':
      return 'marino';
    case 'monto_o_comision':
      return 'petroleo';
    case 'variable':
      return 'ambar';
    case 'requiere_revision':
      return 'ambar';
  }
}

/** Texto plano de una vista, para atributos title y para datos estructurados. */
export function textoPlanoUmbral(vista: VistaUmbral, unidad: 'uma' | 'pesos'): string {
  if (vista.montos.length === 0) return vista.resumen;
  return vista.montos
    .map((m) => {
      const valor = unidad === 'uma' ? formatearUMA(m.uma) : m.pesos;
      return m.etiqueta ? `${m.etiqueta}: ${valor}` : valor;
    })
    .join(' · ');
}
