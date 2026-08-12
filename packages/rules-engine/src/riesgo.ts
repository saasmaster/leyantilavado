import type {
  EvaluacionRiesgo,
  FactorRiesgo,
  FactorRiesgoClave,
  Mitigante,
  NivelRiesgo,
} from '@leyantilavado/types';
import { sumarMeses, assertFechaISO } from './fechas';

/**
 * Metodología de enfoque basado en riesgos.
 *
 * Los pesos son un punto de partida documentado, no la única metodología
 * válida: la norma exige que cada organización justifique la suya. Por eso
 * `evaluarRiesgo` acepta factores y ponderaciones a la medida, y el panel de
 * administración guarda quién los cambió y por qué.
 */
export const PONDERACIONES_BASE: Record<FactorRiesgoClave, number> = {
  tipo_operacion: 0.2,
  tipo_cliente: 0.15,
  ubicacion_geografica: 0.15,
  canal_entrega: 0.15,
  pep: 0.15,
  beneficiario_controlador: 0.1,
  volumen_transaccional: 0.05,
  medio_pago: 0.05,
};

export const ETIQUETAS_FACTOR: Record<FactorRiesgoClave, string> = {
  tipo_operacion: 'Tipo de operación',
  tipo_cliente: 'Tipo de cliente o usuario',
  ubicacion_geografica: 'Ubicación geográfica',
  canal_entrega: 'Canal de entrega',
  pep: 'Persona políticamente expuesta',
  beneficiario_controlador: 'Beneficiario controlador identificado',
  volumen_transaccional: 'Volumen transaccional',
  medio_pago: 'Medio de pago',
};

/** Umbrales de corte del puntaje final (0-100). */
export const CORTES_RIESGO = { bajo: 33, medio: 66 } as const;

interface Args {
  factores: readonly FactorRiesgo[];
  mitigantes?: readonly Mitigante[];
  /** Fecha de la evaluación. Entra como parámetro: el motor no usa el reloj. */
  fecha: string;
  /** La norma exige revisar al menos cada seis meses. */
  mesesRevision?: number;
}

export function evaluarRiesgo({
  factores,
  mitigantes = [],
  fecha,
  mesesRevision = 6,
}: Args): EvaluacionRiesgo {
  const f = assertFechaISO(fecha, 'fecha de la evaluación');

  const sumaPonderaciones = factores.reduce((a, x) => a + x.ponderacion, 0);
  if (sumaPonderaciones <= 0) {
    throw new RangeError('Las ponderaciones de los factores de riesgo deben sumar más de cero.');
  }

  // Se normaliza por la suma real para que una metodología parcial siga
  // produciendo un puntaje comparable en la escala 0-100.
  const puntajeBruto = Math.round(
    factores.reduce((a, x) => a + x.puntaje * x.ponderacion, 0) / sumaPonderaciones,
  );

  const reduccion = mitigantes.reduce((a, m) => a + m.reduccion, 0);
  const puntajeFinal = Math.max(0, Math.min(100, puntajeBruto - reduccion));

  const nivel: NivelRiesgo =
    puntajeFinal <= CORTES_RIESGO.bajo ? 'bajo'
    : puntajeFinal <= CORTES_RIESGO.medio ? 'medio'
    : 'alto';

  const hayPEP = factores.some((x) => x.clave === 'pep' && x.puntaje >= 50);
  const requiereDDR = nivel === 'alto' || hayPEP;

  return {
    factores,
    mitigantes,
    puntajeBruto,
    puntajeFinal,
    nivel,
    requiereDebidaDiligenciaReforzada: requiereDDR,
    proximaRevision: sumarMeses(f, mesesRevision),
    explicacion:
      `El puntaje ponderado de los ${factores.length} factores es ${puntajeBruto}/100. ` +
      (reduccion > 0
        ? `Los ${mitigantes.length} mitigantes aplicados restan ${reduccion} puntos, dejando ${puntajeFinal}/100. `
        : '') +
      `Eso lo clasifica en riesgo ${nivel}. ` +
      (requiereDDR
        ? hayPEP && nivel !== 'alto'
          ? 'Aunque el puntaje no llega a riesgo alto, la condición de persona políticamente expuesta activa la debida diligencia reforzada.'
          : 'Corresponde aplicar debida diligencia reforzada.'
        : 'No se activa la debida diligencia reforzada por puntaje.') +
      ` La siguiente revisión debe hacerse a más tardar el ${sumarMeses(f, mesesRevision)}.`,
  };
}

/** Factores por omisión con puntaje neutro, para prellenar el formulario. */
export function factoresPorDefecto(): FactorRiesgo[] {
  return (Object.keys(PONDERACIONES_BASE) as FactorRiesgoClave[]).map((clave) => ({
    clave,
    etiqueta: ETIQUETAS_FACTOR[clave],
    puntaje: 30,
    ponderacion: PONDERACIONES_BASE[clave],
  }));
}
