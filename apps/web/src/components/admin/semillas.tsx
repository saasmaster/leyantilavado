import type { EspecificacionUmbral, Periodicidad } from '@leyantilavado/types';
import { formatearMXN } from '@leyantilavado/types';
import { datos, formatearFechaCorta } from '@leyantilavado/rules-engine';
import type { FilaSemilla } from './TablaComparativaSemilla';

/**
 * Adaptadores de los datos semilla del motor a la tabla comparativa.
 *
 * Viven en un solo archivo para que ninguna página del panel tenga que hablar
 * la lengua del motor: cada `page.tsx` importa una constante ya lista. Ningún
 * número legal se escribe aquí — todos salen de `datos.*`.
 */

const NUMERO = new Intl.NumberFormat('es-MX');

const ETIQUETA_PERIODICIDAD: Record<Periodicidad, string> = {
  operacion: 'por operación',
  mensual: 'acumulado mensual',
  semestral: 'acumulado semestral',
  anual: 'acumulado anual',
};

/**
 * Los seis casos de `EspecificacionUmbral`, cada uno con su texto.
 *
 * Aplanar esto a un número es el error clásico del dominio: un notario no tiene
 * "un umbral", tiene varios incisos y tres de ellos no llevan monto.
 */
export function describirUmbral(especificacion: EspecificacionUmbral): string {
  switch (especificacion.tipo) {
    case 'siempre':
      return `Siempre, sin importar el monto${especificacion.nota ? `. ${especificacion.nota}` : ''}`;
    case 'nunca':
      return `No existe esta obligación para esta actividad${especificacion.nota ? `. ${especificacion.nota}` : ''}`;
    case 'uma': {
      const comparador =
        especificacion.comparador === 'mayor' ? 'superior a' : 'igual o superior a';
      return `${comparador} ${NUMERO.format(especificacion.uma)} UMA`;
    }
    case 'monto_o_comision':
      return `${NUMERO.format(especificacion.umaMonto)} UMA por monto de la operación, o ${NUMERO.format(especificacion.umaComision)} UMA por la contraprestación cobrada`;
    case 'variable':
      return `Depende del acto (${especificacion.supuestos.length} supuestos): ${especificacion.supuestos
        .map((s) => `${s.descripcion} → ${describirUmbral(s.umbral)}`)
        .join(' · ')}`;
    case 'requiere_revision':
      return `Requiere revisión editorial: ${especificacion.nota}`;
  }
}

export const SEMILLA_FUENTES: readonly FilaSemilla[] = datos.FUENTES.map((f) => ({
  id: f.id,
  nombre: f.nombre,
  detalle: `${f.emisor}${f.fechaPublicacion ? ` · publicada el ${formatearFechaCorta(f.fechaPublicacion)}` : ''} · ${f.url}`,
  disposicion: f.descripcion,
}));

export const SEMILLA_UMA: readonly FilaSemilla[] = datos.VALORES_UMA.map((v) => ({
  id: String(v.anio),
  nombre: `UMA ${v.anio}`,
  detalle: `${formatearMXN(v.diariaCentavos)} diarios, vigente del ${formatearFechaCorta(v.vigencia.desde)} al ${v.vigencia.hasta ? formatearFechaCorta(v.vigencia.hasta) : 'indefinido'}`,
  disposicion: v.procedencia.disposicion,
  verificacion: v.procedencia.verificacion,
}));

export const SEMILLA_ACTIVIDADES: readonly FilaSemilla[] = datos.ACTIVIDADES.map((a) => ({
  id: a.slug,
  nombre: `Fracción ${a.fraccion} — ${a.nombreCorto}`,
  detalle: a.subtipos?.length
    ? `${a.descripcion} Subtipos con regla propia: ${a.subtipos.map((s) => s.nombre).join(', ')}.`
    : a.descripcion,
  disposicion: a.procedencia.disposicion,
  verificacion: a.procedencia.verificacion,
}));

export const SEMILLA_UMBRALES: readonly FilaSemilla[] = datos.UMBRALES.map((u) => ({
  id: u.id,
  nombre: u.subtipo ? `${u.actividad} · ${u.subtipo}` : u.actividad,
  detalle: `Identificación: ${describirUmbral(u.identificacion)}. Aviso: ${describirUmbral(u.aviso)} (${ETIQUETA_PERIODICIDAD[u.periodicidad]}).${
    u.acumulacion.aplica
      ? ` Acumula ${u.acumulacion.ventanaMeses} meses por ${u.acumulacion.agrupaPor.join(' + ')}.`
      : ' Sin acumulación.'
  }`,
  disposicion: u.procedencia.disposicion,
  verificacion: u.procedencia.verificacion,
  estado: u.estado,
}));

export const SEMILLA_EFECTIVO: readonly FilaSemilla[] = datos.REGLAS_EFECTIVO.map((r) => ({
  id: r.id,
  nombre: r.nombre,
  detalle: `Prohibido liquidar en efectivo o metales por encima de ${NUMERO.format(r.limiteUMA)} UMA (${ETIQUETA_PERIODICIDAD[r.periodicidad]}).${
    r.discrepanciaOficial
      ? ` Discrepancia oficial sin resolver — según el SAT: ${r.discrepanciaOficial.segunSAT}; según la ley: ${r.discrepanciaOficial.segunLey}.`
      : ''
  }`,
  disposicion: r.procedencia.disposicion,
  verificacion: r.procedencia.verificacion,
  estado: r.estado,
}));

export const SEMILLA_SANCIONES: readonly FilaSemilla[] = datos.SANCIONES.map((s) => ({
  id: s.id,
  nombre: `${s.articulo}${s.fraccion ? ` fracción ${s.fraccion}` : ''} — ${s.supuesto}`,
  detalle: `De ${NUMERO.format(s.minUMA)} a ${NUMERO.format(s.maxUMA)} UMA${
    s.alternativaPorcentaje
      ? `, o del ${s.alternativaPorcentaje.minPct}% al ${s.alternativaPorcentaje.maxPct}% del valor de la operación (se aplica la cantidad mayor)`
      : ''
  }. Gravedad ${s.gravedad}.${s.notas ? ` ${s.notas}` : ''}`,
  disposicion: s.procedencia.disposicion,
  verificacion: s.procedencia.verificacion,
  estado: s.estado,
}));

export const SEMILLA_OBLIGACIONES: readonly FilaSemilla[] = datos.OBLIGACIONES.map((o) => ({
  id: o.slug,
  nombre: o.titulo,
  detalle: `${o.resumen} Categoría: ${o.categoria}. ${o.pasos.length} pasos con evidencia.${
    o.recurrencia ? ` Recurrencia ${o.recurrencia}.` : ''
  }${o.fechaLimite ? ` Fecha límite ${formatearFechaCorta(o.fechaLimite)}.` : ''}`,
  disposicion: o.procedencia.disposicion,
  verificacion: o.procedencia.verificacion,
  estado: o.estado,
}));

export const SEMILLA_FECHAS: readonly FilaSemilla[] = datos.CALENDARIO.map((h) => ({
  id: h.id,
  nombre: h.titulo,
  detalle: `${formatearFechaCorta(h.fecha)}${h.fechaFin ? ` al ${formatearFechaCorta(h.fechaFin)}` : ''} · ${
    h.confirmadoOficialmente
      ? 'Fecha confirmada en fuente oficial'
      : 'FECHA NO CONFIRMADA OFICIALMENTE: no se presenta como exigible'
  }. ${h.descripcion}`,
  disposicion: h.procedencia.disposicion,
  verificacion: h.procedencia.verificacion,
  estado: h.estado,
}));

/** Hitos previstos en la norma que todavía NO tienen fecha cierta. */
export const SEMILLA_PENDIENTES: readonly FilaSemilla[] = datos.PENDIENTES_SIN_FECHA.map((p) => ({
  id: p.id,
  nombre: p.titulo,
  detalle: p.descripcion,
  disposicion: p.procedencia.disposicion,
  verificacion: p.procedencia.verificacion,
}));
