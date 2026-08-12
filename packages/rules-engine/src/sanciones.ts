import {
  centavos,
  maximo,
  porcentaje,
  sumar,
  type Advertencia,
  type Centavos,
  type EscenarioSancion,
  type EstimacionSancion,
  type ReglaSancion,
} from '@leyantilavado/types';
import { assertFechaISO, dentroDeVigencia } from './fechas';
import { convertirUMA } from './uma';
import { ESCENARIOS_AUTOCORRECCION, SANCIONES } from './datos/sanciones';
import { VERSION_LEGAL } from './motor';

interface Args {
  /** ids de ReglaSancion que el usuario seleccionó. */
  infracciones: readonly string[];
  fecha: string;
  /** Valor del acto. Necesario para la alternativa porcentual. */
  valorOperacion?: Centavos;
  reglas?: readonly ReglaSancion[];
}

/**
 * Estimador de sanciones.
 *
 * Reglas de honestidad que el producto no negocia:
 *  - Siempre devuelve RANGOS, nunca una cifra única.
 *  - La reducción por autocorrección es un escenario, no un descuento aplicado.
 *  - La alternativa porcentual sólo entra cuando el acto es cuantificable en
 *    dinero; si no hay valor de operación, se dice en vez de asumir cero.
 */
export function estimarSancion({
  infracciones,
  fecha,
  valorOperacion,
  reglas = SANCIONES,
}: Args): EstimacionSancion {
  const f = assertFechaISO(fecha, 'fecha de la infracción');
  const advertencias: Advertencia[] = [];
  const supuestos: string[] = [
    `Los rangos se convirtieron con la UMA vigente en ${f}.`,
    'La autoridad determina el monto exacto dentro del rango considerando la gravedad, la capacidad económica y la reincidencia.',
  ];

  const seleccionadas = reglas.filter(
    (r) => infracciones.includes(r.id) && dentroDeVigencia(f, r.vigencia),
  );

  const escenarios: EscenarioSancion[] = seleccionadas.map((regla) => {
    const min = convertirUMA(regla.minUMA, f);
    const max = convertirUMA(regla.maxUMA, f);

    let rangoPorcentual: { min: Centavos; max: Centavos } | undefined;
    let rangoAplicable = { min: min.equivalentePesos, max: max.equivalentePesos };

    if (regla.alternativaPorcentaje) {
      if (valorOperacion !== undefined && valorOperacion > 0) {
        rangoPorcentual = {
          min: porcentaje(valorOperacion, regla.alternativaPorcentaje.minPct),
          max: porcentaje(valorOperacion, regla.alternativaPorcentaje.maxPct),
        };
        // La ley manda aplicar la cantidad MAYOR entre ambas bases.
        rangoAplicable = {
          min: maximo(min.equivalentePesos, rangoPorcentual.min),
          max: maximo(max.equivalentePesos, rangoPorcentual.max),
        };
      } else {
        advertencias.push({
          clave: 'sin-valor-operacion',
          severidad: 'atencion',
          mensaje:
            `Para "${regla.supuesto}" la ley prevé también una multa del ${regla.alternativaPorcentaje.minPct}% ` +
            `al ${regla.alternativaPorcentaje.maxPct}% del valor del acto, aplicando la cantidad mayor. ` +
            'Sin el valor de la operación sólo se muestra el rango en UMA, que puede quedarse muy corto.',
        });
      }
    }

    return {
      reglaId: regla.id,
      articulo: regla.articulo,
      ...(regla.fraccion ? { fraccion: regla.fraccion } : {}),
      supuesto: regla.supuesto,
      gravedad: regla.gravedad,
      rangoFijo: { min, max },
      ...(rangoPorcentual ? { rangoPorcentual } : {}),
      rangoAplicable,
      explicacion: construirExplicacion(regla, min, max, rangoPorcentual, rangoAplicable),
    };
  });

  const totalMinimo = sumar(...escenarios.map((e) => e.rangoAplicable.min), centavos(0));
  const totalMaximo = sumar(...escenarios.map((e) => e.rangoAplicable.max), centavos(0));

  if (escenarios.some((e) => e.gravedad === 'critica')) {
    advertencias.push({
      clave: 'gravedad-critica',
      severidad: 'riesgo',
      mensaje:
        'Al menos una de las infracciones seleccionadas está en el rango más alto de la ley. ' +
        'Este escenario amerita revisión profesional inmediata.',
    });
  }

  advertencias.push({
    clave: 'no-es-sentencia',
    severidad: 'info',
    mensaje:
      'Esta estimación es orientativa. No determina responsabilidad ni predice la resolución de la autoridad: ' +
      'muestra los rangos que la ley contempla para los supuestos que seleccionaste.',
  });

  return {
    escenarios,
    totalMinimo,
    totalMaximo,
    autocorreccion: ESCENARIOS_AUTOCORRECCION,
    advertencias,
    supuestos,
    procedencia: {
      fuentes: ['lfpiorpi-vigente'],
      disposicion: 'Arts. 53, 54 y 55 LFPIORPI',
      verificacion: 'oficial_verificado',
      ultimaRevision: '2026-08-11',
    },
    versionLegal: VERSION_LEGAL,
  };
}

function construirExplicacion(
  regla: ReglaSancion,
  min: { uma: number; equivalentePesos: Centavos },
  max: { uma: number; equivalentePesos: Centavos },
  rangoPorcentual: { min: Centavos; max: Centavos } | undefined,
  aplicable: { min: Centavos; max: Centavos },
): string {
  const mxn = (c: number) => (c / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  const partes = [
    `El art. ${regla.articulo}${regla.fraccion ? `, fracción ${regla.fraccion},` : ''} prevé una multa de ` +
      `${min.uma.toLocaleString('es-MX')} a ${max.uma.toLocaleString('es-MX')} UMA, es decir de ` +
      `${mxn(min.equivalentePesos)} a ${mxn(max.equivalentePesos)}.`,
  ];

  if (rangoPorcentual) {
    partes.push(
      `Como alternativa, la ley prevé del ${regla.alternativaPorcentaje!.minPct}% al ` +
        `${regla.alternativaPorcentaje!.maxPct}% del valor del acto: de ${mxn(rangoPorcentual.min)} a ` +
        `${mxn(rangoPorcentual.max)}. Se aplica la cantidad mayor, por lo que el rango relevante va de ` +
        `${mxn(aplicable.min)} a ${mxn(aplicable.max)}.`,
    );
  }

  if (regla.notas) partes.push(regla.notas);
  return partes.join(' ');
}

/**
 * Aplica un escenario de autocorrección a un rango.
 * Devuelve el rango resultante SIN afirmar que se obtendrá.
 */
export function aplicarAutocorreccion(
  rango: { min: Centavos; max: Centavos },
  factorReduccion: number,
): { min: Centavos; max: Centavos } {
  const factor = 1 - factorReduccion;
  return {
    min: centavos(Math.round(rango.min * factor)),
    max: centavos(Math.round(rango.max * factor)),
  };
}
