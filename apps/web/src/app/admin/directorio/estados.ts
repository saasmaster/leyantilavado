import {
  ETIQUETA_VERIFICACION,
  type NivelVerificacionProveedor,
} from '@leyantilavado/types';
import type {
  DecisionModeracion,
  EstadoModeracionAlta,
} from '@/lib/directorio/repositorio';

/* ────────────────────────────────────────────────────────────────────────────
 * Vocabulario de la consola de moderación.
 *
 * Vive aparte de las páginas y de `acciones.ts` porque un módulo `'use server'`
 * sólo puede exportar funciones asíncronas: cualquier constante compartida
 * tiene que estar fuera.
 * ────────────────────────────────────────────────────────────────────────── */

export const ETIQUETA_ESTADO: Record<EstadoModeracionAlta, string> = {
  pendiente: 'Pendiente',
  revisado: 'Aprobada',
  rechazado: 'Rechazada',
  correccion_solicitada: 'Corrección pedida',
};

export const TONO_ESTADO: Record<
  EstadoModeracionAlta,
  'neutro' | 'marino' | 'ambar' | 'rojo' | 'verde'
> = {
  pendiente: 'ambar',
  revisado: 'verde',
  rechazado: 'rojo',
  correccion_solicitada: 'marino',
};

export const ETIQUETA_DECISION: Record<DecisionModeracion, string> = {
  aprobada: 'Aprobó',
  rechazada: 'Rechazó',
  correccion_solicitada: 'Pidió corrección',
};

/**
 * Niveles que puede fijar una aprobación.
 *
 * `sin_verificar` no está: es el nivel con el que nace el perfil solo, y no
 * hace falta una decisión humana para dejarlo donde ya estaba. La lista es la
 * misma que acepta `verification_requests.requested_level` en el esquema.
 */
export const NIVELES_APROBABLES: readonly NivelVerificacionProveedor[] = [
  'correo_verificado',
  'identidad_verificada',
  'documentacion_revisada',
  'certificacion_externa_revisada',
];

export function esNivelAprobable(valor: unknown): valor is NivelVerificacionProveedor {
  return (
    typeof valor === 'string' &&
    (NIVELES_APROBABLES as readonly string[]).includes(valor)
  );
}

/** Qué revisó moderación para conceder cada nivel. Nunca «lo certificamos». */
export const QUE_SIGNIFICA_NIVEL: Record<NivelVerificacionProveedor, string> = {
  sin_verificar: 'Nadie ha comprobado nada todavía.',
  correo_verificado: 'Contestó desde el correo del perfil.',
  identidad_verificada: 'Existe la persona o la empresa que dice ser.',
  documentacion_revisada: 'Los documentos que subió existen y son suyos.',
  certificacion_externa_revisada:
    'Un tercero lo certificó y esa certificación sigue vigente. La certificación es del tercero.',
};

export const ETIQUETA_NIVEL = ETIQUETA_VERIFICACION;

/** `2026-08-14T18:03:11.000Z` → `2026-08-14 18:03`. Sin tocar el reloj. */
export function fechaHora(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ');
}

/**
 * Días que lleva esperando una solicitud.
 *
 * `hoy` entra como parámetro (`YYYY-MM-DD`, de `fechaDeHoy()`): nada aquí llama
 * al reloj, que además de la regla `react-hooks/purity` es lo que evita que el
 * servidor y el navegador calculen números distintos.
 */
export function diasEspera(creadoEn: string, hoy: string): number {
  const inicio = Date.parse(creadoEn);
  const fin = Date.parse(`${hoy}T23:59:59Z`);
  if (Number.isNaN(inicio) || Number.isNaN(fin)) return 0;
  return Math.max(0, Math.floor((fin - inicio) / 86_400_000));
}
