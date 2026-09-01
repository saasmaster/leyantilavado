import { pesosACentavos, type Procedencia, type ValorUMA } from '@leyantilavado/types';
import { ULTIMA_MODIFICACION, ULTIMA_REVISION } from './revision';

const PROCEDENCIA_UMA = (anio: number, verificado: boolean): Procedencia => ({
  fuentes: ['inegi-uma'],
  disposicion: `Valor de la UMA ${anio} publicado por el INEGI`,
  verificacion: verificado ? 'oficial_verificado' : 'fuente_secundaria',
  ultimaRevision: ULTIMA_REVISION,
  // Este dataset SÍ cambió el 1-sep: diez valores dejaron de publicarse con el
  // aviso de «pendiente de contraste». Declararlo aquí y no en `revision.ts`
  // es lo que impide que las 136 URL se anuncien como modificadas por un
  // cambio que sólo afecta a las que muestran la UMA.
  ultimaModificacion: ULTIMA_MODIFICACION,
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

/**
 * Serie completa, contrastada contra la tabla «Valor de la UMA» del INEGI el
 * 1 de septiembre de 2026: las once cifras coinciden dígito a dígito.
 *
 * Hasta entonces sólo 2026 estaba marcada como verificada y las otras diez
 * salían publicadas con el aviso de «pendiente de contraste oficial». Era
 * honesto, pero también era la mitad de una tabla histórica advirtiendo de sí
 * misma, y bastaba con abrir la página del INEGI para cerrarlo.
 *
 * El aviso se retira porque la comprobación se hizo, no porque estorbara.
 */
export const VALORES_UMA: readonly ValorUMA[] = [
  uma(2016, '73.04', true),
  uma(2017, '75.49', true),
  uma(2018, '80.60', true),
  uma(2019, '84.49', true),
  uma(2020, '86.88', true),
  uma(2021, '89.62', true),
  uma(2022, '96.22', true),
  uma(2023, '103.74', true),
  uma(2024, '108.57', true),
  uma(2025, '113.14', true),
  uma(2026, '117.31', true),
];

/** La UMA más reciente registrada. Útil para tablas "a valor de hoy". */
export const UMA_VIGENTE_MAS_RECIENTE: ValorUMA = VALORES_UMA[VALORES_UMA.length - 1]!;
