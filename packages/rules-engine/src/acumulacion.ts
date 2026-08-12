import {
  centavos,
  sumar,
  type Centavos,
  type ConversionUMA,
  type Operacion,
  type OperacionAcumulada,
  type ReglaUmbral,
  type ResultadoAcumulacion,
} from '@leyantilavado/types';
import { assertFechaISO, restarMeses } from './fechas';
import { convertirUMA } from './uma';

interface Args {
  operacionActual: Operacion;
  historial: readonly Operacion[];
  regla: ReglaUmbral;
}

/**
 * Acumulación antifraccionamiento (art. 17, último párrafo).
 *
 * Ventana MÓVIL, no trimestre ni semestre natural: se mira hacia atrás seis
 * meses desde la fecha de la operación evaluada. Una operación del 3 de enero
 * y otra del 2 de julio del mismo año NO se acumulan; del 3 de enero y el 30
 * de junio, sí.
 *
 * Se acumula por cliente y por el mismo tipo de acto. Dos compras del mismo
 * cliente, una de joyería y otra de un vehículo, no se suman entre sí.
 */
export function evaluarAcumulacion({
  operacionActual,
  historial,
  regla,
}: Args): ResultadoAcumulacion {
  const hasta = assertFechaISO(operacionActual.fecha, 'fecha de la operación');
  const ventanaMeses = regla.acumulacion.ventanaMeses;
  const desde = restarMeses(hasta, ventanaMeses);

  const mismoGrupo = (o: Operacion): boolean => {
    if (regla.acumulacion.agrupaPor.includes('cliente')) {
      // Sin identificador de cliente no se puede acumular con honestidad.
      if (!operacionActual.clienteId || o.clienteId !== operacionActual.clienteId) return false;
    }
    if (regla.acumulacion.agrupaPor.includes('actividad') && o.actividad !== operacionActual.actividad) {
      return false;
    }
    if (regla.acumulacion.agrupaPor.includes('subtipo') && o.subtipo !== operacionActual.subtipo) {
      return false;
    }
    return true;
  };

  const candidatas = historial.filter(mismoGrupo);
  const enVentana = candidatas.filter((o) => o.fecha >= desde && o.fecha <= hasta);
  const fueraDeVentana = candidatas.length - enVentana.length;

  // La operación evaluada siempre entra, aunque no venga en el historial.
  const yaIncluida = enVentana.some((o) => o.id === operacionActual.id);
  const todas = (yaIncluida ? enVentana : [...enVentana, operacionActual])
    .slice()
    .sort((a, b) => (a.fecha === b.fecha ? a.id.localeCompare(b.id) : a.fecha < b.fecha ? -1 : 1));

  // Umbral de aviso: sólo tiene sentido acumular contra un número.
  const umbralAviso: ConversionUMA | null =
    regla.aviso.tipo === 'uma'
      ? convertirUMA(regla.aviso.uma, hasta)
      : regla.aviso.tipo === 'monto_o_comision'
        ? convertirUMA(regla.aviso.umaMonto, hasta)
        : null;

  const umbralIdent =
    regla.identificacion.tipo === 'uma' ? convertirUMA(regla.identificacion.uma, hasta) : null;

  const estricto = regla.aviso.tipo === 'uma' && regla.aviso.comparador === 'mayor';

  let corrido: Centavos = centavos(0);
  let fechaDisparo: string | null = null;

  const operaciones: OperacionAcumulada[] = todas.map((op) => {
    corrido = sumar(corrido, op.monto);
    const cruza =
      umbralAviso !== null &&
      (estricto ? corrido > umbralAviso.equivalentePesos : corrido >= umbralAviso.equivalentePesos);
    const disparaAviso = cruza && fechaDisparo === null;
    if (disparaAviso) fechaDisparo = op.fecha;

    return {
      operacion: op,
      acumuladoHasta: corrido,
      alcanzaIdentificacionIndividual:
        umbralIdent !== null ? op.monto >= umbralIdent.equivalentePesos : false,
      disparaAviso,
      dentroDeVentana: true,
    };
  });

  const total = corrido;
  const alcanzado = fechaDisparo !== null;

  return {
    aplica: true,
    ventanaMeses,
    ventanaDesde: desde,
    ventanaHasta: hasta,
    total,
    umbralAviso,
    alcanzado,
    fechaDisparo,
    operaciones,
    fueraDeVentana,
    explicacion: construirExplicacion({
      ventanaMeses,
      desde,
      hasta,
      cantidad: operaciones.length,
      total,
      umbralAviso,
      alcanzado,
      fechaDisparo,
      fueraDeVentana,
    }),
  };
}

function construirExplicacion(a: {
  ventanaMeses: number;
  desde: string;
  hasta: string;
  cantidad: number;
  total: Centavos;
  umbralAviso: ConversionUMA | null;
  alcanzado: boolean;
  fechaDisparo: string | null;
  fueraDeVentana: number;
}): string {
  const mxn = (c: number) =>
    (c / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  const partes = [
    `Se sumaron ${a.cantidad} ${a.cantidad === 1 ? 'operación' : 'operaciones'} del mismo cliente ` +
      `por el mismo tipo de acto entre el ${a.desde} y el ${a.hasta} (ventana móvil de ${a.ventanaMeses} meses). ` +
      `Total acumulado: ${mxn(a.total)}.`,
  ];

  if (a.umbralAviso === null) {
    partes.push(
      'El umbral de aviso de esta actividad no es un monto, por lo que la suma no cambia el resultado.',
    );
  } else if (a.alcanzado) {
    partes.push(
      `El acumulado alcanzó el umbral de aviso de ${a.umbralAviso.uma.toLocaleString('es-MX')} UMA ` +
        `(${mxn(a.umbralAviso.equivalentePesos)}) el ${a.fechaDisparo}.`,
    );
  } else {
    const falta = a.umbralAviso.equivalentePesos - a.total;
    partes.push(
      `Faltan ${mxn(falta)} para alcanzar el umbral de aviso de ` +
        `${a.umbralAviso.uma.toLocaleString('es-MX')} UMA.`,
    );
  }

  if (a.fueraDeVentana > 0) {
    partes.push(
      `Se excluyeron ${a.fueraDeVentana} ${a.fueraDeVentana === 1 ? 'operación' : 'operaciones'} ` +
        `por quedar fuera de la ventana de ${a.ventanaMeses} meses.`,
    );
  }

  return partes.join(' ');
}
