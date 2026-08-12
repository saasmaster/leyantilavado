/**
 * Fechas en formato ISO `YYYY-MM-DD`, siempre en UTC.
 *
 * Dos decisiones deliberadas:
 *
 * 1. Las comparaciones de rango se hacen sobre el STRING, no sobre objetos
 *    Date. `'2026-01-15' >= '2026-02-01'` es falso y correcto, sin zonas
 *    horarias de por medio. Un servidor en UTC y un navegador en Mazatlán
 *    tienen que dar el mismo resultado legal.
 *
 * 2. Ninguna función aquí llama a `Date.now()`. La fecha "de hoy" siempre
 *    entra como parámetro. Así el motor es puro y los tests son
 *    deterministas — y de paso evita el error de eslint `react-hooks/purity`
 *    cuando estas funciones se usan dentro de un `useMemo`.
 */

export type FechaISO = string;

const RE_ISO = /^\d{4}-\d{2}-\d{2}$/;

export function esFechaISO(s: string): s is FechaISO {
  if (!RE_ISO.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function assertFechaISO(s: string, campo = 'fecha'): FechaISO {
  if (!esFechaISO(s)) {
    throw new RangeError(`${campo} debe ser una fecha ISO válida (YYYY-MM-DD): recibí "${s}"`);
  }
  return s;
}

const aUTC = (s: FechaISO): Date => new Date(`${s}T00:00:00Z`);
const aISO = (d: Date): FechaISO => d.toISOString().slice(0, 10) as FechaISO;

/** ¿`fecha` cae dentro de [desde, hasta]? `hasta: null` = abierto. */
export function dentroDeVigencia(
  fecha: FechaISO,
  vigencia: { desde: FechaISO; hasta: FechaISO | null },
): boolean {
  if (fecha < vigencia.desde) return false;
  if (vigencia.hasta !== null && fecha > vigencia.hasta) return false;
  return true;
}

/**
 * Suma meses respetando el fin de mes: 31 de enero + 1 mes = 28/29 de febrero,
 * no 3 de marzo. Es la semántica que espera un plazo legal.
 */
export function sumarMeses(fecha: FechaISO, meses: number): FechaISO {
  const d = aUTC(fecha);
  const dia = d.getUTCDate();
  const objetivo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + meses, 1));
  const ultimoDia = new Date(
    Date.UTC(objetivo.getUTCFullYear(), objetivo.getUTCMonth() + 1, 0),
  ).getUTCDate();
  objetivo.setUTCDate(Math.min(dia, ultimoDia));
  return aISO(objetivo);
}

export function restarMeses(fecha: FechaISO, meses: number): FechaISO {
  return sumarMeses(fecha, -meses);
}

export function sumarDias(fecha: FechaISO, dias: number): FechaISO {
  const d = aUTC(fecha);
  d.setUTCDate(d.getUTCDate() + dias);
  return aISO(d);
}

export function diferenciaDias(a: FechaISO, b: FechaISO): number {
  return Math.round((aUTC(b).getTime() - aUTC(a).getTime()) / 86_400_000);
}

/** Año calendario de la fecha. Se usa para elegir la UMA. */
export const anioDe = (fecha: FechaISO): number => Number(fecha.slice(0, 4));

/** `YYYY-MM` — clave de agrupación para umbrales mensuales. */
export const periodoMensual = (fecha: FechaISO): string => fecha.slice(0, 7);

/**
 * Fecha límite del aviso: día 17 del mes siguiente al de la operación.
 *
 * Se devuelve la fecha NOMINAL. No se recorre por fines de semana ni días
 * inhábiles: hacerlo sin una regla oficial registrada sería inventar derecho.
 * Quien consuma esto debe mostrar la advertencia correspondiente.
 */
export function fechaLimiteAviso(fechaOperacion: FechaISO): FechaISO {
  const siguiente = sumarMeses(`${periodoMensual(fechaOperacion)}-01`, 1);
  return `${siguiente.slice(0, 7)}-17`;
}

/** ¿La fecha nominal cae en sábado o domingo? Sólo para advertir, no para mover. */
export function caeEnFinDeSemana(fecha: FechaISO): boolean {
  const dia = aUTC(fecha).getUTCDay();
  return dia === 0 || dia === 6;
}

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "30 de noviembre de 2026". Determinista: no depende del locale del runtime. */
export function formatearFechaLarga(fecha: FechaISO): string {
  const [a, m, d] = fecha.split('-');
  const mes = MESES_ES[Number(m) - 1] ?? m;
  return `${Number(d)} de ${mes} de ${a}`;
}

/** "30 nov 2026" — para tablas y tarjetas densas. */
export function formatearFechaCorta(fecha: FechaISO): string {
  const [a, m, d] = fecha.split('-');
  const mes = (MESES_ES[Number(m) - 1] ?? m ?? '').slice(0, 3);
  return `${Number(d)} ${mes} ${a}`;
}
