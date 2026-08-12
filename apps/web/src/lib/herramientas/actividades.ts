import type { ActividadSlug } from '@leyantilavado/types';
import { datos, reglasDeActividad } from '@leyantilavado/rules-engine';

/**
 * Puente entre el catálogo de actividades y los selectores de las
 * herramientas.
 *
 * El punto delicado: `buscarRegla` devuelve `undefined` cuando la actividad
 * tiene subtipos y no se envía uno. Notarios, corredores, servicios
 * profesionales, comercio exterior y activos virtuales caen ahí. Por eso el
 * selector de subtipo es obligatorio en esas actividades, y las opciones
 * salen de las reglas vigentes en la fecha capturada, no de una lista fija.
 */

export interface OpcionActividad {
  slug: ActividadSlug;
  nombre: string;
  nombreCorto: string;
  fraccion: string;
}

export const OPCIONES_ACTIVIDAD: OpcionActividad[] = datos.ACTIVIDADES.map((a) => ({
  slug: a.slug,
  nombre: a.nombre,
  nombreCorto: a.nombreCorto,
  fraccion: a.fraccion,
}));

export interface OpcionSubtipo {
  slug: string;
  nombre: string;
  descripcion: string;
}

/** Subtipos con regla vigente en la fecha dada. Vacío = la actividad no los usa. */
export function subtiposDe(actividad: string, fecha: string): OpcionSubtipo[] {
  const reglas = reglasDeActividad(actividad, fecha).filter((r) => r.subtipo !== undefined);
  if (reglas.length === 0) return [];

  const meta = datos.ACTIVIDADES_POR_SLUG[actividad as ActividadSlug]?.subtipos ?? [];
  return reglas.map((r) => {
    const m = meta.find((s) => s.slug === r.subtipo);
    return {
      slug: r.subtipo!,
      nombre: m?.nombre ?? r.subtipo!,
      descripcion: m?.descripcion ?? r.procedencia.disposicion,
    };
  });
}

export const requiereSubtipo = (actividad: string, fecha: string): boolean =>
  subtiposDe(actividad, fecha).length > 0;

/** Nombre legible de una actividad, para tablas y reportes. */
export function nombreActividad(slug: string): string {
  return datos.ACTIVIDADES_POR_SLUG[slug as ActividadSlug]?.nombre ?? slug;
}

export function nombreSubtipo(actividad: string, subtipo: string | undefined): string {
  if (!subtipo) return '—';
  const meta = datos.ACTIVIDADES_POR_SLUG[actividad as ActividadSlug]?.subtipos ?? [];
  return meta.find((s) => s.slug === subtipo)?.nombre ?? subtipo;
}

/** Slugs válidos, para validar una importación sin confiar en el archivo. */
export const SLUGS_VALIDOS: ReadonlySet<string> = new Set(datos.ACTIVIDADES.map((a) => a.slug));
