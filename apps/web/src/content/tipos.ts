import type { ActividadSlug } from '@leyantilavado/types';

/* ────────────────────────────────────────────────────────────────────────────
 * Contrato del contenido editorial.
 *
 * Todo el contenido del sitio es TypeScript plano, no MDX. La razón es simple:
 * si una obligación cambia de slug o una actividad desaparece del catálogo,
 * `tsc` lo detecta antes de que una página quede enlazando al vacío. Un MDX
 * no da esa garantía.
 *
 * Regla dura que este archivo hace cumplir: NINGÚN campo de este contenido
 * guarda una cifra legal (umbrales, límites, multas). Las cifras salen del
 * motor. Lo único numérico que aquí se admite son los montos de los EJEMPLOS,
 * que son cifras de negocio inventadas para ilustrar, no datos normativos.
 * ────────────────────────────────────────────────────────────────────────── */

export interface Autor {
  id: string;
  nombre: string;
  rol: string;
  /**
   * Credenciales verificables (cédula, certificación, colegio). Vacío mientras
   * el contenido lo firme el equipo y no una persona con nombre: preferimos un
   * arreglo vacío honesto a una credencial inventada.
   */
  credenciales: readonly string[];
  descripcion: string;
  /** Cómo se produce y se revisa el contenido. Se muestra en la firma. */
  metodologia: readonly string[];
  url?: string;
}

export interface FirmaContenido {
  autor: Autor;
  revisor?: Autor;
  /** ISO date */
  publicadoEn: string;
  /** ISO date */
  actualizadoEn: string;
}

export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

/**
 * Ejemplo práctico.
 *
 * Guarda sólo los datos del CASO (qué se vendió, en cuánto, cuándo). El
 * resultado —umbral aplicable, conversión a pesos, conclusión— lo calcula el
 * motor al renderizar. Así el ejemplo nunca se desincroniza de la ley.
 */
export interface EjemploResuelto {
  titulo: string;
  contexto: string;
  /** Monto del acto en pesos. Cifra de negocio, no dato legal. */
  montoPesos: string;
  /** ISO date. Determina la UMA y la regla aplicables. */
  fechaOperacion: string;
  subtipo?: string;
  /** Porción liquidada en efectivo, para ilustrar el art. 32. */
  efectivoPesos?: string;
  /** Contraprestación cobrada (activos virtuales). */
  comisionPesos?: string;
  /** Fracción XI: si el profesional actúa en representación del cliente. */
  enRepresentacion?: boolean;
  /** Fracción X: si el monto trasladado o custodiado puede determinarse. */
  montoIndeterminable?: boolean;
  /** Lecturas del caso que el motor no puede derivar solo. */
  notas: readonly string[];
}

export interface ContenidoActividad {
  slug: ActividadSlug;
  /** Título de la etiqueta <title>. Único por página. */
  tituloSEO: string;
  descripcionSEO: string;
  /** Respuesta directa, arriba del pliegue. Dos o tres frases, sin rodeos. */
  respuestaDirecta: string;
  /** Negocios mexicanos concretos que sí caen. */
  alcanza: readonly string[];
  /** Casos parecidos que NO caen aquí, con el porqué. */
  noAlcanza: readonly string[];
  /** Lo que hay que mirar para no equivocarse en esta fracción. */
  puntosClave: readonly string[];
  /** Obligaciones (slugs de datos.OBLIGACIONES) que más pesan aquí. */
  obligacionesDestacadas: readonly string[];
  ejemplo?: EjemploResuelto;
  faq: readonly PreguntaFrecuente[];
  /** Texto para actividades cuyo umbral la autoridad no ha publicado. */
  sinUmbralPublicado?: string;
}

export interface ContenidoObligacion {
  slug: string;
  tituloSEO: string;
  descripcionSEO: string;
  respuestaDirecta: string;
  /** A quién le aplica y desde cuándo. */
  aQuienAplica: readonly string[];
  /** Errores que un verificador encuentra una y otra vez. */
  erroresComunes: readonly string[];
  /** Qué revisa un auditor y qué documento espera ver. */
  evidenciaEsperada: readonly string[];
  faq: readonly PreguntaFrecuente[];
}

export interface TerminoGlosario {
  slug: string;
  termino: string;
  /** Siglas o forma larga, cuando existe. */
  alterno?: string;
  definicion: string;
  /** Precisión que evita el malentendido más común del término. */
  matiz?: string;
  /** Disposición o documento donde vive el término. */
  disposicion: string;
  relacionados: readonly string[];
  /** Ruta interna donde el término se explica a fondo. */
  verTambien?: { etiqueta: string; href: string };
}

export type TipoActualizacion =
  | 'ley'
  | 'reglamento'
  | 'reglas'
  | 'uma'
  | 'criterio'
  | 'sitio';

export interface EntradaActualizacion {
  id: string;
  /** ISO date del hecho normativo (publicación en el DOF), no de la nota. */
  fecha: string;
  tipo: TipoActualizacion;
  titulo: string;
  resumen: string;
  /** Qué cambia en la práctica para un sujeto obligado. */
  impacto: readonly string[];
  /** Id de FUENTES del motor, para enlazar la fuente oficial. */
  fuenteId?: string;
  /** Rutas del sitio que este cambio modificó. */
  paginasAfectadas: readonly { etiqueta: string; href: string }[];
  /** Cuando el hecho aún no tiene fuente primaria confirmada. */
  requiereRevision?: string;
}

/**
 * Cambio antes/después de la reforma.
 *
 * El "después" se toma del motor (`reglaId` + `campo`) para que la tabla nunca
 * se desincronice de la ley vigente. El "antes" es la única excepción a la
 * regla de no escribir cifras legales a mano: corresponde a un umbral DEROGADO
 * y el motor sólo guarda reglas con vigencia abierta, así que no hay de dónde
 * leerlo. Se marca como dato histórico y lleva su propia disposición.
 */
export interface CambioReforma {
  clave: string;
  supuesto: string;
  /** id de una regla de `datos.UMBRALES`. De ahí sale el "después". */
  reglaId?: string;
  campo?: 'identificacion' | 'aviso';
  /** Umbral anterior en UMA. Dato histórico derogado. */
  antesUMA?: number;
  /** Cuando el régimen anterior no era un número. */
  antesTexto?: string;
  /** Respaldo cuando el cambio no corresponde a una regla de umbral. */
  despuesTexto?: string;
  disposicion: string;
  /** Marca los cambios que endurecen la obligación. */
  endurece: boolean;
  nota?: string;
}
