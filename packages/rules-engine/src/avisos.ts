import type { Advertencia } from '@leyantilavado/types';
import {
  assertFechaISO,
  caeEnFinDeSemana,
  diferenciaDias,
  fechaLimiteAviso,
  formatearFechaLarga,
  periodoMensual,
  type FechaISO,
} from './fechas';

export interface ResultadoFechaLimite {
  fechaOperacion: FechaISO;
  periodo: string;
  /** Día 17 del mes siguiente. Fecha NOMINAL, sin ajustar por días inhábiles. */
  fechaLimite: FechaISO;
  /** Días restantes respecto a `hoy`. Negativo = vencido. */
  diasRestantes: number;
  estado: 'vencido' | 'hoy' | 'urgente' | 'proximo' | 'holgado';
  advertencias: readonly Advertencia[];
  explicacion: string;
}

/**
 * Fecha límite del aviso mensual: día 17 del mes siguiente al de la operación.
 *
 * `hoy` entra como parámetro a propósito: el motor no llama a `Date.now()`.
 * Además de hacer los tests deterministas, evita el error de eslint
 * `react-hooks/purity` cuando esto se usa dentro de un `useMemo`.
 *
 * La fecha NO se recorre por fines de semana ni días inhábiles: hacerlo sin
 * una regla oficial registrada sería inventar derecho. Se advierte y ya.
 */
export function calcularFechaLimiteAviso(
  fechaOperacion: string,
  hoy: string,
): ResultadoFechaLimite {
  const op = assertFechaISO(fechaOperacion, 'fecha de la operación');
  const ref = assertFechaISO(hoy, 'fecha de referencia');
  const limite = fechaLimiteAviso(op);
  const diasRestantes = diferenciaDias(ref, limite);
  const advertencias: Advertencia[] = [];

  if (caeEnFinDeSemana(limite)) {
    advertencias.push({
      clave: 'limite-en-fin-de-semana',
      severidad: 'atencion',
      mensaje:
        `El día 17 cae en fin de semana (${formatearFechaLarga(limite)}). Mostramos la fecha nominal ` +
        'sin recorrerla: confirma en el calendario oficial de días inhábiles si el plazo se extiende.',
    });
  }

  if (diasRestantes < 0) {
    advertencias.push({
      clave: 'plazo-vencido',
      severidad: 'riesgo',
      mensaje:
        `El plazo venció hace ${Math.abs(diasRestantes)} días. La presentación extemporánea es infracción ` +
        'del art. 53 fracción III. La autocorrección espontánea, antes de que inicien las facultades de ' +
        'verificación, puede evitar o reducir la sanción.',
    });
  } else if (diasRestantes <= 3) {
    advertencias.push({
      clave: 'plazo-urgente',
      severidad: 'riesgo',
      mensaje: `Quedan ${diasRestantes} días para presentar el aviso.`,
    });
  }

  const estado: ResultadoFechaLimite['estado'] =
    diasRestantes < 0 ? 'vencido'
    : diasRestantes === 0 ? 'hoy'
    : diasRestantes <= 3 ? 'urgente'
    : diasRestantes <= 10 ? 'proximo'
    : 'holgado';

  return {
    fechaOperacion: op,
    periodo: periodoMensual(op),
    fechaLimite: limite,
    diasRestantes,
    estado,
    advertencias,
    explicacion:
      `Las operaciones de ${periodoMensual(op)} se reportan a más tardar el ` +
      `${formatearFechaLarga(limite)}: el día 17 del mes siguiente. ` +
      'Si en el periodo no hubo operaciones que alcanzaran el umbral, de todas formas debe presentarse ' +
      'el informe en ceros dentro del mismo plazo.',
  };
}

/** Próximas N fechas límite a partir de una fecha de referencia. */
export function proximasFechasLimite(hoy: string, cantidad = 6): ResultadoFechaLimite[] {
  const ref = assertFechaISO(hoy, 'fecha de referencia');
  const out: ResultadoFechaLimite[] = [];
  const [anio, mes] = ref.split('-').map(Number) as [number, number];

  for (let i = 0; i < cantidad; i++) {
    const m = mes + i;
    const a = anio + Math.floor((m - 1) / 12);
    const mm = String(((m - 1) % 12) + 1).padStart(2, '0');
    out.push(calcularFechaLimiteAviso(`${a}-${mm}-01`, ref));
  }
  return out;
}
