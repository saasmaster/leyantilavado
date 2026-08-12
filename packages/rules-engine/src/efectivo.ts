import {
  restar,
  type ActividadSlug,
  type Advertencia,
  type Centavos,
  type EvaluacionEfectivo,
  type ReglaEfectivo,
} from '@leyantilavado/types';
import { assertFechaISO, dentroDeVigencia } from './fechas';
import { convertirUMA } from './uma';
import { REGLAS_EFECTIVO } from './datos/efectivo';

interface Args {
  actividad: ActividadSlug;
  fecha: string;
  montoEfectivo: Centavos;
  /** Valor total del acto. Para el art. 32 se mide CON IVA. */
  valorTotal: Centavos;
  /** Fuerza una regla concreta cuando la actividad toca varias. */
  reglaId?: string;
}

export function buscarReglaEfectivo(
  actividad: ActividadSlug,
  fecha: string,
  reglas: readonly ReglaEfectivo[] = REGLAS_EFECTIVO,
): ReglaEfectivo | undefined {
  return reglas.find(
    (r) => r.actividades.includes(actividad) && dentroDeVigencia(fecha, r.vigencia),
  );
}

/** Reglas de efectivo aplicables, para que la UI deje elegir cuando hay varias. */
export function reglasEfectivoAplicables(
  actividad: ActividadSlug,
  fecha: string,
  reglas: readonly ReglaEfectivo[] = REGLAS_EFECTIVO,
): ReglaEfectivo[] {
  return reglas.filter(
    (r) => r.actividades.includes(actividad) && dentroDeVigencia(fecha, r.vigencia),
  );
}

/**
 * Verifica el límite de liquidación en efectivo o metales (art. 32 LFPIORPI).
 *
 * Es una PROHIBICIÓN, no un umbral de reporte: rebasarla es la infracción del
 * art. 53 fracción VII, sancionada por el art. 54 fracción III, aunque el
 * aviso se haya presentado en tiempo y forma.
 */
export function evaluarEfectivo({
  actividad,
  fecha,
  montoEfectivo,
  valorTotal,
  reglaId,
}: Args): EvaluacionEfectivo {
  const f = assertFechaISO(fecha, 'fecha de la operación');
  const regla = reglaId
    ? REGLAS_EFECTIVO.find((r) => r.id === reglaId)
    : buscarReglaEfectivo(actividad, f);

  if (!regla) {
    return {
      aplica: false,
      limite: null,
      montoEfectivo,
      excede: false,
      diferencia: null,
      periodicidad: 'operacion',
      explicacion:
        'El art. 32 no contempla una restricción de efectivo específica para esta actividad. ' +
        'Eso no elimina las demás obligaciones ni las restricciones de otras leyes, como el límite de deducibilidad fiscal.',
      advertencias: [],
    };
  }

  const limite = convertirUMA(regla.limiteUMA, f);
  const excede = montoEfectivo > limite.equivalentePesos;
  const advertencias: Advertencia[] = [];

  if (regla.discrepanciaOficial) {
    advertencias.push({
      clave: 'discrepancia-oficial',
      severidad: 'atencion',
      mensaje: `${regla.discrepanciaOficial.descripcion} ${regla.discrepanciaOficial.segunSAT} ${regla.discrepanciaOficial.segunLey}`,
    });
  }

  if (excede) {
    advertencias.push({
      clave: 'limite-excedido',
      severidad: 'riesgo',
      mensaje:
        'El monto en efectivo rebasa el límite. La sanción por este supuesto va de 10,000 a 65,000 UMA, ' +
        'o del 10% al 100% del valor del acto cuando sea cuantificable, aplicando la cantidad mayor.',
    });
  }

  // Fraccionar no evita la regla: la ley mira el acto, no cada recibo.
  advertencias.push({
    clave: 'fraccionamiento',
    severidad: 'info',
    mensaje:
      'Dividir el pago en varias exhibiciones no evita por sí solo la aplicación del límite: la restricción se mide sobre el acto u operación, no sobre cada pago aislado.',
  });

  if (montoEfectivo > valorTotal) {
    advertencias.push({
      clave: 'efectivo-mayor-que-total',
      severidad: 'atencion',
      mensaje: 'El monto en efectivo capturado es mayor que el valor total del acto. Revisa las cifras.',
    });
  }

  const mxn = (c: number) => (c / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  const diferencia = restar(montoEfectivo, limite.equivalentePesos);

  return {
    aplica: true,
    reglaId: regla.id,
    nombreRegla: regla.nombre,
    limite,
    montoEfectivo,
    excede,
    diferencia,
    periodicidad: regla.periodicidad,
    explicacion:
      `El límite para "${regla.nombre}" es de ${regla.limiteUMA.toLocaleString('es-MX')} UMA` +
      `${regla.periodicidad === 'mensual' ? ' mensuales' : ''}, equivalente a ${mxn(limite.equivalentePesos)} ` +
      `con la UMA vigente en ${f}. ` +
      (excede
        ? `Los ${mxn(montoEfectivo)} en efectivo lo rebasan por ${mxn(diferencia)}.`
        : `Los ${mxn(montoEfectivo)} en efectivo quedan ${mxn(-diferencia)} por debajo del límite.`) +
      ' Para el art. 32 la base de comparación incluye el IVA.',
    advertencias,
  };
}
