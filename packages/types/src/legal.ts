import type { Centavos } from './money';

/* ────────────────────────────────────────────────────────────────────────────
 * Procedencia y estado editorial
 * Toda regla jurídica del sistema arrastra de dónde salió y quién la revisó.
 * Nada llega a producción sin `estado: 'publicado'`.
 * ────────────────────────────────────────────────────────────────────────── */

export type EstadoEditorial = 'borrador' | 'revisado' | 'publicado' | 'sustituido';

/** Confianza en el dato. `no_verificado` nunca se publica sin revisión humana. */
export type NivelVerificacion =
  | 'oficial_verificado'
  | 'oficial_no_accesible'
  | 'fuente_secundaria'
  | 'no_verificado';

export interface FuenteOficial {
  id: string;
  nombre: string;
  emisor: 'DOF' | 'SAT' | 'SHCP' | 'UIF' | 'INEGI' | 'Cámara de Diputados' | 'Otro';
  url: string;
  /** ISO date. Publicación en el DOF o fecha del documento. */
  fechaPublicacion?: string;
  descripcion: string;
  /** Huella del contenido para el monitor regulatorio. */
  hash?: string;
  ultimaRevision?: string;
}

export interface Procedencia {
  /** ids de FuenteOficial */
  fuentes: string[];
  /** "Art. 17, fracción VII" */
  disposicion: string;
  verificacion: NivelVerificacion;
  /** ISO date */
  ultimaRevision: string;
  revisadoPor?: string;
  notaEditorial?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Vigencia temporal
 * Ninguna regla es "la actual": toda regla vale dentro de una ventana. La
 * evaluación siempre recibe la fecha de la operación y busca la regla vigente
 * en ESA fecha, no la de hoy.
 * ────────────────────────────────────────────────────────────────────────── */

export interface Vigencia {
  /** ISO date inclusivo */
  desde: string;
  /** ISO date inclusivo. `null` = vigente indefinidamente. */
  hasta: string | null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * UMA
 * ────────────────────────────────────────────────────────────────────────── */

export interface ValorUMA {
  anio: number;
  /** UMA diaria en centavos. 117.31 → 11731 */
  diariaCentavos: Centavos;
  vigencia: Vigencia;
  procedencia: Procedencia;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Actividades vulnerables (art. 17 LFPIORPI)
 *
 * El slug es NUESTRO identificador estable. El número de fracción vive en los
 * datos, no en el tipo: si una reforma renumera fracciones, cambian los datos
 * semilla y no el código.
 * ────────────────────────────────────────────────────────────────────────── */

export type ActividadSlug =
  | 'juegos-sorteos'
  | 'tarjetas-credito-servicios'
  | 'tarjetas-prepagadas'
  | 'vales-cupones-monederos'
  | 'cheques-viajero'
  | 'prestamos-creditos'
  | 'inmuebles-construccion-intermediacion'
  | 'desarrollo-inmobiliario'
  | 'metales-joyeria'
  | 'obras-arte'
  | 'vehiculos'
  | 'blindaje'
  | 'traslado-custodia-valores'
  | 'servicios-profesionales'
  | 'fe-publica-notarios'
  | 'fe-publica-corredores'
  | 'fe-publica-servidores-publicos'
  | 'personas-facilitadoras'
  | 'donativos'
  | 'comercio-exterior'
  | 'arrendamiento-inmuebles'
  | 'activos-virtuales';

export const ACTIVIDAD_SLUGS = [
  'juegos-sorteos',
  'tarjetas-credito-servicios',
  'tarjetas-prepagadas',
  'vales-cupones-monederos',
  'cheques-viajero',
  'prestamos-creditos',
  'inmuebles-construccion-intermediacion',
  'desarrollo-inmobiliario',
  'metales-joyeria',
  'obras-arte',
  'vehiculos',
  'blindaje',
  'traslado-custodia-valores',
  'servicios-profesionales',
  'fe-publica-notarios',
  'fe-publica-corredores',
  'fe-publica-servidores-publicos',
  'personas-facilitadoras',
  'donativos',
  'comercio-exterior',
  'arrendamiento-inmuebles',
  'activos-virtuales',
] as const satisfies readonly ActividadSlug[];

export interface Actividad {
  slug: ActividadSlug;
  /** "VII", "V Bis", "XI" — dato, no tipo. */
  fraccion: string;
  nombre: string;
  nombreCorto: string;
  /** Resumen propio, NO transcripción de la ley. */
  descripcion: string;
  /** Ejemplos concretos de quién cae aquí. */
  ejemplosSujetos: string[];
  /** Subtipos con reglas propias (comercio exterior, fe pública, etc.). */
  subtipos?: SubtipoActividad[];
  procedencia: Procedencia;
}

export interface SubtipoActividad {
  slug: string;
  nombre: string;
  descripcion: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Umbrales
 *
 * ESTE es el tipo que evita el error más común del dominio: aplanar todo a un
 * número. "Siempre", "variable" y "por operación o comisión" NO son números y
 * no deben fingir serlo. La unión discriminada obliga a la UI a renderizar
 * cada caso de forma honesta.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Cómo se compara el monto contra el umbral.
 *
 * No es un detalle cosmético: el art. 17 fracción XV dice "superior a" para
 * identificación y "igual o superior a" para aviso. Una renta de exactamente
 * 1,605 UMA NO obliga a identificar; una de exactamente 3,210 UMA SÍ obliga a
 * avisar. Colapsar ambos a `>=` produce un falso positivo justo en el borde,
 * que es donde el usuario más necesita certeza.
 */
export type Comparador = 'mayor' | 'mayor_o_igual';

export type EspecificacionUmbral =
  /** Obligación que se dispara sin importar el monto. */
  | { readonly tipo: 'siempre'; readonly nota?: string }
  /** No existe esta obligación para esta actividad. */
  | { readonly tipo: 'nunca'; readonly nota?: string }
  /** Umbral simple: N UMA. Por omisión se compara con `mayor_o_igual`. */
  | {
      readonly tipo: 'uma';
      readonly uma: number;
      readonly comparador?: Comparador;
      readonly nota?: string;
    }
  /** Se dispara por monto O por contraprestación cobrada (activos virtuales). */
  | {
      readonly tipo: 'monto_o_comision';
      readonly umaMonto: number;
      readonly umaComision: number;
      readonly nota?: string;
    }
  /**
   * La regla depende del acto exacto y no se puede reducir a un número.
   * La UI DEBE mostrar los supuestos y recomendar revisión profesional.
   */
  | {
      readonly tipo: 'variable';
      readonly supuestos: readonly SupuestoVariable[];
      readonly nota?: string;
    }
  /** Reservado: dato conocido pero pendiente de verificación editorial. */
  | { readonly tipo: 'requiere_revision'; readonly nota: string };

export interface SupuestoVariable {
  clave: string;
  descripcion: string;
  /** Umbral del supuesto concreto, ya resuelto. Nunca 'variable' anidado. */
  umbral: Exclude<EspecificacionUmbral, { tipo: 'variable' }>;
}

export type Periodicidad = 'operacion' | 'mensual' | 'semestral' | 'anual';

/**
 * Cómo se nombra cada periodicidad de cara a una persona.
 *
 * Vive junto al enum a propósito. Tres vistas pintaban el valor crudo con
 * `capitalize`, y como los identificadores de código no llevan tilde, en la
 * tabla de umbrales aparecía «Operacion» en decenas de filas. Un `Record`
 * exhaustivo obliga además a nombrar cualquier periodicidad que se añada.
 */
export const ETIQUETA_PERIODICIDAD: Record<Periodicidad, string> = {
  operacion: 'Por operación',
  mensual: 'Mensual',
  semestral: 'Semestral',
  anual: 'Anual',
};

/** Cómo se acumulan operaciones del mismo cliente para alcanzar el aviso. */
export interface ReglaAcumulacion {
  aplica: boolean;
  /** Ventana móvil en meses. La ley usa 6 meses en el caso general. */
  ventanaMeses: number;
  /** Se acumula por cliente + mismo tipo de acto u operación. */
  agrupaPor: readonly ('cliente' | 'actividad' | 'subtipo')[];
  nota?: string;
}

export interface ReglaUmbral {
  id: string;
  actividad: ActividadSlug;
  subtipo?: string;
  identificacion: EspecificacionUmbral;
  aviso: EspecificacionUmbral;
  periodicidad: Periodicidad;
  acumulacion: ReglaAcumulacion;
  vigencia: Vigencia;
  procedencia: Procedencia;
  estado: EstadoEditorial;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Restricciones de efectivo (art. 32 LFPIORPI)
 * ────────────────────────────────────────────────────────────────────────── */

export interface ReglaEfectivo {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  /** Actividades relacionadas, para enlazar desde sus páginas. */
  actividades: readonly ActividadSlug[];
  /** Límite máximo liquidable en efectivo/metales, en UMA. */
  limiteUMA: number;
  periodicidad: Periodicidad;
  /**
   * Cuando dos fuentes oficiales publican cifras distintas para el mismo
   * supuesto. No se resuelve en silencio eligiendo una: se muestran ambas y
   * se marca la regla como borrador hasta que la autoridad aclare.
   */
  discrepanciaOficial?: {
    descripcion: string;
    segunSAT: string;
    segunLey: string;
  };
  vigencia: Vigencia;
  procedencia: Procedencia;
  estado: EstadoEditorial;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Sanciones (arts. 53-56 LFPIORPI)
 * ────────────────────────────────────────────────────────────────────────── */

export interface ReglaSancion {
  id: string;
  articulo: string;
  fraccion?: string;
  supuesto: string;
  /** Rango en UMA. */
  minUMA: number;
  maxUMA: number;
  /**
   * Alternativa porcentual sobre el valor de la operación. Cuando existe, la
   * ley manda aplicar la cantidad MAYOR entre el rango fijo y el porcentaje.
   */
  alternativaPorcentaje?: { minPct: number; maxPct: number };
  gravedad: 'baja' | 'media' | 'alta' | 'critica';
  notas?: string;
  vigencia: Vigencia;
  procedencia: Procedencia;
  estado: EstadoEditorial;
}

export interface ConsecuenciaPenal {
  id: string;
  articulo: string;
  supuesto: string;
  prisionAnios: { min: number; max: number };
  multaDias?: { min: number; max: number };
  notas: string;
  procedencia: Procedencia;
  estado: EstadoEditorial;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Obligaciones y calendario
 * ────────────────────────────────────────────────────────────────────────── */

export type CategoriaObligacion =
  | 'registro'
  | 'identificacion'
  | 'expediente'
  | 'avisos'
  | 'riesgos'
  | 'gobierno'
  | 'capacitacion'
  | 'tecnologia'
  | 'auditoria'
  | 'conservacion';

export interface Obligacion {
  slug: string;
  titulo: string;
  resumen: string;
  categoria: CategoriaObligacion;
  /** Vacío = aplica a todas las actividades vulnerables. */
  actividades: readonly ActividadSlug[];
  /** Pasos accionables — alimentan checklists en la app privada. */
  pasos: readonly PasoObligacion[];
  fechaLimite?: string;
  recurrencia?: 'unica' | 'mensual' | 'semestral' | 'anual';
  procedencia: Procedencia;
  estado: EstadoEditorial;
}

export interface PasoObligacion {
  id: string;
  texto: string;
  /** Evidencia que un auditor esperaría ver. */
  evidencia?: string;
}

export interface HitoCalendario {
  id: string;
  /** ISO date nominal. NO se ajusta por días inhábiles sin regla oficial. */
  fecha: string;
  /** Rango cuando el hito es un periodo (p.ej. "enero a diciembre 2027"). */
  fechaFin?: string;
  titulo: string;
  descripcion: string;
  obligaciones: readonly string[];
  /** Cuando la fecha aún no está confirmada en fuente oficial. */
  confirmadoOficialmente: boolean;
  procedencia: Procedencia;
  estado: EstadoEditorial;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Versión del corpus legal
 * ────────────────────────────────────────────────────────────────────────── */

export interface VersionLegal {
  id: string;
  version: string;
  publicadaEn: string;
  vigencia: Vigencia;
  descripcion: string;
  fuentes: readonly FuenteOficial[];
  umas: readonly ValorUMA[];
  actividades: readonly Actividad[];
  umbrales: readonly ReglaUmbral[];
  efectivo: readonly ReglaEfectivo[];
  sanciones: readonly ReglaSancion[];
  penales: readonly ConsecuenciaPenal[];
  obligaciones: readonly Obligacion[];
  calendario: readonly HitoCalendario[];
}
