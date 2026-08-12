import type { Centavos } from './money';
import type {
  ActividadSlug,
  EspecificacionUmbral,
  Periodicidad,
  Procedencia,
} from './legal';

/* ────────────────────────────────────────────────────────────────────────────
 * Entrada de evaluación
 * ────────────────────────────────────────────────────────────────────────── */

export type MedioPago =
  | 'efectivo'
  | 'transferencia'
  | 'cheque'
  | 'tarjeta'
  | 'metales_preciosos'
  | 'activos_virtuales'
  | 'mixto'
  | 'otro';

export type TipoCliente = 'persona_fisica' | 'persona_moral' | 'fideicomiso' | 'desconocido';

export interface Operacion {
  id: string;
  /** ISO date (YYYY-MM-DD). Determina qué UMA y qué regla aplican. */
  fecha: string;
  actividad: ActividadSlug;
  subtipo?: string;
  /** Valor total del acto u operación. */
  monto: Centavos;
  /** Porción liquidada en efectivo o metales, para el art. 32. */
  montoEfectivo?: Centavos;
  /** Comisión cobrada — relevante en activos virtuales. */
  comision?: Centavos;
  medioPago: MedioPago;
  /** Identificador del cliente para acumular. Puede ser anónimo/hasheado. */
  clienteId?: string;
  tipoCliente?: TipoCliente;
  /** Fracción XI: si el profesional actúa en nombre o representación del cliente. */
  enRepresentacionDelCliente?: boolean;
  /**
   * Fracción X: cuando no puede determinarse el monto trasladado o custodiado,
   * el aviso procede siempre.
   */
  montoIndeterminable?: boolean;
  /**
   * Clave del supuesto elegido cuando el umbral es de tipo `variable`. Si no
   * se envía, el motor intenta deducirla de los campos anteriores y, si no
   * puede, devuelve `informacion_insuficiente` en lugar de adivinar.
   */
  supuestoVariable?: string;
  /**
   * Monto con IVA incluido. El art. 32 (efectivo) se mide CON IVA, mientras
   * que los umbrales de aviso del art. 17 se miden SIN IVA. Si no se envía,
   * el motor usa `monto` y lo advierte.
   */
  montoConIVA?: Centavos;
  descripcion?: string;
}

export interface ContextoEvaluacion {
  /** Fecha de referencia para elegir la versión legal vigente. */
  fechaReferencia: string;
  /** Operaciones previas del mismo cliente, para acumulación. */
  historial?: readonly Operacion[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Resultado
 *
 * Regla del producto: el motor NUNCA emite "cumples" / "no tienes obligaciones".
 * Emite una conclusión acotada + supuestos + lo que falta + la fuente.
 * ────────────────────────────────────────────────────────────────────────── */

export type Conclusion =
  | 'sin_obligacion_aparente'
  | 'requiere_identificacion'
  | 'proximo_al_aviso'
  | 'aviso_probable'
  | 'requiere_revision_profesional'
  | 'informacion_insuficiente';

export type NivelConfianza = 'alta' | 'media' | 'baja';

export interface Advertencia {
  clave: string;
  severidad: 'info' | 'atencion' | 'riesgo';
  mensaje: string;
}

export interface ConversionUMA {
  uma: number;
  /** UMA diaria vigente en la fecha de la operación. */
  umaDiaria: Centavos;
  /** uma × umaDiaria, en centavos exactos. */
  equivalentePesos: Centavos;
  /** Año de la UMA aplicada — la UI lo muestra para evitar confusión. */
  anioUMA: number;
}

export interface EvaluacionUmbral {
  especificacion: EspecificacionUmbral;
  /** null cuando la especificación no es un número (siempre/variable). */
  conversion: ConversionUMA | null;
  alcanzado: boolean;
  /** Cuánto falta para alcanzarlo. null si no aplica. */
  diferencia: Centavos | null;
  explicacion: string;
}

export interface ResultadoEvaluacion {
  conclusion: Conclusion;
  confianza: NivelConfianza;
  actividad: ActividadSlug;
  subtipo?: string;
  fraccion: string;
  nombreActividad: string;
  identificacion: EvaluacionUmbral;
  aviso: EvaluacionUmbral;
  periodicidad: Periodicidad;
  /** Resultado del art. 32 cuando hay efectivo en la operación. */
  efectivo?: EvaluacionEfectivo;
  acumulacion?: ResultadoAcumulacion;
  advertencias: readonly Advertencia[];
  /** Lo que el motor dio por hecho. Se muestra siempre. */
  supuestos: readonly string[];
  /** Datos que cambiarían el resultado si se conocieran. */
  informacionFaltante: readonly string[];
  obligacionesInmediatas: readonly string[];
  procedencia: Procedencia;
  /** Versión del corpus legal usada. Va en el PDF y en el resultado guardado. */
  versionLegal: string;
  /** ISO datetime en que se calculó. Lo inyecta quien llama, no el motor. */
  calculadoEn?: string;
}

export interface EvaluacionEfectivo {
  aplica: boolean;
  reglaId?: string;
  nombreRegla?: string;
  limite: ConversionUMA | null;
  montoEfectivo: Centavos;
  excede: boolean;
  /** Positivo = cuánto se pasa del límite. Negativo = margen disponible. */
  diferencia: Centavos | null;
  periodicidad: Periodicidad;
  explicacion: string;
  advertencias: readonly Advertencia[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Acumulación (ventana móvil de 6 meses)
 * ────────────────────────────────────────────────────────────────────────── */

export interface OperacionAcumulada {
  operacion: Operacion;
  /** Suma corrida hasta esta operación, inclusive. */
  acumuladoHasta: Centavos;
  /** Esta operación por sí sola alcanza el umbral de identificación. */
  alcanzaIdentificacionIndividual: boolean;
  /** El aviso se disparó exactamente en esta operación. */
  disparaAviso: boolean;
  dentroDeVentana: boolean;
}

export interface ResultadoAcumulacion {
  aplica: boolean;
  ventanaMeses: number;
  ventanaDesde: string;
  ventanaHasta: string;
  total: Centavos;
  umbralAviso: ConversionUMA | null;
  alcanzado: boolean;
  /** Fecha en que la suma cruzó el umbral. null si no se cruzó. */
  fechaDisparo: string | null;
  operaciones: readonly OperacionAcumulada[];
  /** Operaciones del historial que quedaron fuera de la ventana. */
  fueraDeVentana: number;
  explicacion: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Estimación de sanciones
 * ────────────────────────────────────────────────────────────────────────── */

export interface EscenarioSancion {
  reglaId: string;
  articulo: string;
  fraccion?: string;
  supuesto: string;
  gravedad: 'baja' | 'media' | 'alta' | 'critica';
  rangoFijo: { min: ConversionUMA; max: ConversionUMA };
  rangoPorcentual?: { min: Centavos; max: Centavos };
  /** El mayor entre fijo y porcentual, cuando la ley lo manda. */
  rangoAplicable: { min: Centavos; max: Centavos };
  explicacion: string;
}

export interface EstimacionSancion {
  escenarios: readonly EscenarioSancion[];
  totalMinimo: Centavos;
  totalMaximo: Centavos;
  /** Escenarios de autocorrección, siempre presentados como sujetos a requisitos. */
  autocorreccion: readonly EscenarioAutocorreccion[];
  advertencias: readonly Advertencia[];
  supuestos: readonly string[];
  procedencia: Procedencia;
  versionLegal: string;
}

export interface EscenarioAutocorreccion {
  clave: string;
  titulo: string;
  descripcion: string;
  /** 0 = posible ausencia de sanción; 0.5 = reducción de hasta 50%. */
  factorReduccion: number;
  requisitos: readonly string[];
  /** Nunca se promete: es un escenario, no un derecho adquirido. */
  advertencia: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Cuestionario de aplicabilidad
 * ────────────────────────────────────────────────────────────────────────── */

export interface RespuestaCuestionario {
  preguntaId: string;
  valor: string | number | boolean | string[] | null;
}

export interface ResultadoCuestionario {
  conclusion: Conclusion;
  confianza: NivelConfianza;
  actividadesDetectadas: readonly ActividadSlug[];
  evaluaciones: readonly ResultadoEvaluacion[];
  obligacionesInmediatas: readonly string[];
  proximasFechas: readonly { fecha: string; titulo: string }[];
  supuestos: readonly string[];
  informacionFaltante: readonly string[];
  advertencias: readonly Advertencia[];
  versionLegal: string;
  respuestas: readonly RespuestaCuestionario[];
}
