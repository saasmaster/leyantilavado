import {
  multiplicar,
  type Centavos,
  type ConversionUMA,
  type ValorUMA,
} from '@leyantilavado/types';
import { anioDe, assertFechaISO, dentroDeVigencia, type FechaISO } from './fechas';
import { VALORES_UMA } from './datos/uma';

export class UMANoDisponibleError extends Error {
  constructor(public readonly fecha: string) {
    super(
      `No hay un valor de UMA registrado para la fecha ${fecha}. ` +
        `El motor no extrapola: registra la UMA de ese periodo antes de calcular.`,
    );
    this.name = 'UMANoDisponibleError';
  }
}

/**
 * Devuelve la UMA vigente en una fecha concreta.
 *
 * El caso que más se equivoca en el mercado: una operación del 15 de enero de
 * 2026 se mide con la UMA de 2025 ($113.14), NO con la de 2026 ($117.31),
 * porque la nueva sólo entra en vigor el 1 de febrero. Varias tablas
 * publicadas "2026" tienen este error.
 *
 * Nunca extrapola. Si no hay dato, lanza — es preferible a devolver una cifra
 * inventada que luego alguien usa para decidir si presenta un aviso.
 */
export function umaVigenteEn(fecha: string, valores: readonly ValorUMA[] = VALORES_UMA): ValorUMA {
  const f = assertFechaISO(fecha, 'fecha de la operación');
  const encontrado = valores.find((v) => dentroDeVigencia(f, v.vigencia));
  if (!encontrado) throw new UMANoDisponibleError(f);
  return encontrado;
}

/** ¿Tenemos UMA para esta fecha? Útil para validar formularios sin lanzar. */
export function hayUMAPara(fecha: string, valores: readonly ValorUMA[] = VALORES_UMA): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  return valores.some((v) => dentroDeVigencia(fecha as FechaISO, v.vigencia));
}

/**
 * Convierte N UMA a pesos usando la UMA vigente en la fecha dada.
 * Aritmética entera en centavos: 645 UMA × $117.31 = $75,664.95 exacto.
 */
export function convertirUMA(
  uma: number,
  fecha: string,
  valores: readonly ValorUMA[] = VALORES_UMA,
): ConversionUMA {
  const valor = umaVigenteEn(fecha, valores);
  return {
    uma,
    umaDiaria: valor.diariaCentavos,
    equivalentePesos: multiplicar(valor.diariaCentavos, uma),
    anioUMA: valor.anio,
  };
}

/** Cuántas UMA representa un monto en la fecha dada. Para la calculadora inversa. */
export function pesosAUMA(
  monto: Centavos,
  fecha: string,
  valores: readonly ValorUMA[] = VALORES_UMA,
): number {
  const valor = umaVigenteEn(fecha, valores);
  return monto / valor.diariaCentavos;
}

/** UMA mensual y anual derivadas de la diaria, como las publica el INEGI. */
export function derivadosUMA(valor: ValorUMA): {
  diaria: Centavos;
  mensual: Centavos;
  anual: Centavos;
} {
  // El orden de las operaciones importa: el INEGI **redondea la mensual
  // primero** y luego la multiplica por 12. Calcular `diaria × 364.8` da 5
  // centavos de más en 2026, y esa diferencia se propaga a cada umbral.
  const mensual = multiplicar(valor.diariaCentavos, 30.4);
  return {
    diaria: valor.diariaCentavos,
    mensual,
    anual: multiplicar(mensual, 12),
  };
}

/** Años con UMA registrada, del más reciente al más antiguo. */
export const ANIOS_UMA_DISPONIBLES: readonly number[] = [...VALORES_UMA]
  .map((v) => v.anio)
  .sort((a, b) => b - a);

export { anioDe };
