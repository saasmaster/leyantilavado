import { pesosACentavos, type Procedencia, type ValorUMA } from '@leyantilavado/types';

const PROCEDENCIA_UMA = (anio: number, verificado: boolean): Procedencia => ({
  fuentes: ['inegi-uma'],
  disposicion: `Valor de la UMA ${anio} publicado por el INEGI`,
  verificacion: verificado ? 'oficial_verificado' : 'fuente_secundaria',
  ultimaRevision: '2026-08-11',
  notaEditorial: verificado
    ? undefined
    : 'Valor histórico pendiente de contraste directo contra el comunicado del INEGI del año correspondiente.',
});

/**
 * La UMA entra en vigor el 1 de febrero de cada año.
 *
 * Consecuencia crítica: una operación del 15 de enero de 2026 se mide con la
 * UMA de 2025, no con la de 2026. El motor NUNCA asume la UMA de hoy.
 */
function uma(anio: number, diaria: string, verificado = false): ValorUMA {
  return {
    anio,
    diariaCentavos: pesosACentavos(diaria),
    vigencia: {
      desde: `${anio}-02-01`,
      hasta: `${anio + 1}-01-31`,
    },
    procedencia: PROCEDENCIA_UMA(anio, verificado),
  };
}

export const VALORES_UMA: readonly ValorUMA[] = [
  uma(2016, '73.04'),
  uma(2017, '75.49'),
  uma(2018, '80.60'),
  uma(2019, '84.49'),
  uma(2020, '86.88'),
  uma(2021, '89.62'),
  uma(2022, '96.22'),
  uma(2023, '103.74'),
  uma(2024, '108.57'),
  uma(2025, '113.14'),
  uma(2026, '117.31', true),
];

/** La UMA más reciente registrada. Útil para tablas "a valor de hoy". */
export const UMA_VIGENTE_MAS_RECIENTE: ValorUMA = VALORES_UMA[VALORES_UMA.length - 1]!;
