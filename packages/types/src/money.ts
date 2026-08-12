/**
 * Aritmética monetaria — SIEMPRE en centavos enteros.
 *
 * Motivo: la conversión UMA→pesos multiplica un número de UMA (frecuentemente
 * con decimales en reglas especiales) por un valor UMA con 2 decimales. En
 * punto flotante, 645 * 117.31 = 75664.94999999999 y la comparación contra el
 * umbral falla exactamente en el borde, que es el caso que más importa.
 *
 * Regla del paquete: ningún módulo del motor jurídico usa `number` en pesos.
 * Todo entra y sale en `Centavos`.
 */

declare const CentavosBrand: unique symbol;

/** Entero. 1 peso = 100 centavos. Marcado para que no se mezcle con pesos. */
export type Centavos = number & { readonly [CentavosBrand]: true };

export const centavos = (n: number): Centavos => {
  if (!Number.isFinite(n)) throw new RangeError(`Centavos no finito: ${n}`);
  return Math.round(n) as Centavos;
};

export const ZERO: Centavos = centavos(0);

/** Convierte pesos (string o number, con hasta 2 decimales) a centavos exactos. */
export function pesosACentavos(pesos: number | string): Centavos {
  const s = typeof pesos === 'number' ? pesos.toFixed(2) : pesos.trim().replace(/[$,\s]/g, '');
  if (s === '' || !/^-?\d+(\.\d+)?$/.test(s)) {
    throw new RangeError(`Monto en pesos inválido: ${String(pesos)}`);
  }
  const neg = s.startsWith('-');
  const [entero = '0', dec = ''] = (neg ? s.slice(1) : s).split('.');
  // Redondeo bancario no aplica aquí: truncamos a 2 decimales y redondeamos el 3o.
  const decPad = (dec + '00').slice(0, 3);
  const base = BigInt(entero) * 100n + BigInt(decPad.slice(0, 2));
  const tercer = Number(decPad[2] ?? '0');
  const total = base + (tercer >= 5 ? 1n : 0n);
  return centavos(Number(neg ? -total : total));
}

export const sumar = (...xs: Centavos[]): Centavos =>
  centavos(xs.reduce((a, b) => a + b, 0));

export const restar = (a: Centavos, b: Centavos): Centavos => centavos(a - b);

/**
 * Multiplica un valor en centavos por una cantidad que puede traer decimales
 * (p.ej. 2.5 UMA). Se hace en enteros escalando por 1e6 para no perder precisión.
 */
export function multiplicar(base: Centavos, factor: number): Centavos {
  if (!Number.isFinite(factor)) throw new RangeError(`Factor no finito: ${factor}`);
  const escala = 1_000_000;
  const f = BigInt(Math.round(factor * escala));
  const producto = (BigInt(base) * f) / BigInt(escala);
  const resto = (BigInt(base) * f) % BigInt(escala);
  // Redondeo al centavo más cercano.
  const ajuste = resto * 2n >= BigInt(escala) ? 1n : 0n;
  return centavos(Number(producto + ajuste));
}

/** Porcentaje de un monto, p.ej. porcentaje(monto, 10) = 10% del monto. */
export const porcentaje = (base: Centavos, pct: number): Centavos =>
  multiplicar(base, pct / 100);

export const maximo = (a: Centavos, b: Centavos): Centavos => (a >= b ? a : b);
export const minimo = (a: Centavos, b: Centavos): Centavos => (a <= b ? a : b);

/** Formato MXN para UI. No usar para cálculos. */
export function formatearMXN(c: Centavos, opciones?: { sinSimbolo?: boolean }): string {
  const valor = c / 100;
  const s = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
  return opciones?.sinSimbolo ? s.replace(/^\$\s?/, '') : s;
}

/** Formato compacto para tarjetas y tablas densas: $941.4k / $1.17M */
export function formatearMXNCompacto(c: Centavos): string {
  const valor = c / 100;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(valor);
}
