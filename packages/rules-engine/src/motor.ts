import {
  centavos,
  restar,
  type Advertencia,
  type Centavos,
  type Conclusion,
  type ContextoEvaluacion,
  type EspecificacionUmbral,
  type EvaluacionUmbral,
  type NivelConfianza,
  type Operacion,
  type ReglaUmbral,
  type ResultadoEvaluacion,
  type SupuestoVariable,
} from '@leyantilavado/types';
import { assertFechaISO, dentroDeVigencia } from './fechas';
import { convertirUMA } from './uma';
import { ACTIVIDADES_POR_SLUG } from './datos/actividades';
import { UMBRALES } from './datos/umbrales';
import { evaluarAcumulacion } from './acumulacion';
import { evaluarEfectivo } from './efectivo';

export const VERSION_LEGAL = '2026.08.11';

export class ReglaNoEncontradaError extends Error {
  constructor(actividad: string, subtipo: string | undefined, fecha: string) {
    super(
      `No hay una regla de umbral vigente el ${fecha} para la actividad "${actividad}"` +
        (subtipo ? ` (subtipo "${subtipo}")` : '') +
        '. El motor no infiere reglas: registra la regla o corrige la actividad.',
    );
    this.name = 'ReglaNoEncontradaError';
  }
}

/** Umbral de cercanía: a partir del 80% del aviso se avisa "vas cerca". */
const FACTOR_PROXIMIDAD = 0.8;

export function buscarRegla(
  actividad: string,
  subtipo: string | undefined,
  fecha: string,
  reglas: readonly ReglaUmbral[] = UMBRALES,
): ReglaUmbral | undefined {
  const candidatas = reglas.filter(
    (r) =>
      r.actividad === actividad &&
      (subtipo === undefined ? r.subtipo === undefined : r.subtipo === subtipo) &&
      dentroDeVigencia(fecha, r.vigencia),
  );
  // Si la actividad tiene subtipos y no se envió uno, no hay regla única: el
  // llamador debe pedir el subtipo en lugar de recibir un resultado arbitrario.
  return candidatas[0];
}

/** Reglas vigentes de una actividad, para que la UI ofrezca los subtipos. */
export function reglasDeActividad(
  actividad: string,
  fecha: string,
  reglas: readonly ReglaUmbral[] = UMBRALES,
): ReglaUmbral[] {
  return reglas.filter((r) => r.actividad === actividad && dentroDeVigencia(fecha, r.vigencia));
}

/* ────────────────────────────────────────────────────────────────────────── */

interface ContextoEspecificacion {
  monto: Centavos;
  comision: Centavos;
  fecha: string;
  supuestoElegido?: string;
  etiqueta: 'identificación' | 'aviso';
}

/**
 * Resuelve una especificación de umbral contra un monto.
 *
 * Maneja los seis casos de la unión. No hay rama por defecto que "asuma" un
 * número: si el caso no se puede resolver, se dice.
 */
export function evaluarEspecificacion(
  spec: EspecificacionUmbral,
  ctx: ContextoEspecificacion,
): EvaluacionUmbral {
  switch (spec.tipo) {
    case 'siempre':
      return {
        especificacion: spec,
        conversion: null,
        alcanzado: true,
        diferencia: null,
        explicacion:
          spec.nota ??
          `La obligación de ${ctx.etiqueta} se genera sin importar el monto de la operación.`,
      };

    case 'nunca':
      return {
        especificacion: spec,
        conversion: null,
        alcanzado: false,
        diferencia: null,
        explicacion: spec.nota ?? `No existe obligación de ${ctx.etiqueta} en este supuesto.`,
      };

    case 'uma': {
      const conversion = convertirUMA(spec.uma, ctx.fecha);
      const estricto = spec.comparador === 'mayor';
      const alcanzado = estricto
        ? ctx.monto > conversion.equivalentePesos
        : ctx.monto >= conversion.equivalentePesos;
      const comparacion = estricto ? 'superior a' : 'igual o superior a';
      return {
        especificacion: spec,
        conversion,
        alcanzado,
        diferencia: restar(ctx.monto, conversion.equivalentePesos),
        explicacion:
          `El umbral de ${ctx.etiqueta} es de ${spec.uma.toLocaleString('es-MX')} UMA. ` +
          `Con la UMA vigente en ${ctx.fecha} (año ${conversion.anioUMA}), equivale a ` +
          `${(conversion.equivalentePesos / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}. ` +
          `La obligación aplica cuando el monto es ${comparacion} esa cantidad.` +
          (spec.nota ? ` ${spec.nota}` : ''),
      };
    }

    case 'monto_o_comision': {
      const porMonto = convertirUMA(spec.umaMonto, ctx.fecha);
      const porComision = convertirUMA(spec.umaComision, ctx.fecha);
      const alcanzaMonto = ctx.monto >= porMonto.equivalentePesos;
      const alcanzaComision = ctx.comision >= porComision.equivalentePesos;
      const alcanzado = alcanzaMonto || alcanzaComision;
      const disparador = alcanzaMonto
        ? 'el monto de la operación'
        : alcanzaComision
          ? 'la contraprestación cobrada'
          : null;
      return {
        especificacion: spec,
        // Se reporta la conversión del disparador que efectivamente aplicó.
        conversion: alcanzaComision && !alcanzaMonto ? porComision : porMonto,
        alcanzado,
        diferencia: restar(ctx.monto, porMonto.equivalentePesos),
        explicacion:
          `Hay dos disparadores independientes: ${spec.umaMonto} UMA por el monto de la operación ` +
          `y ${spec.umaComision} UMA por la contraprestación cobrada. Basta con que uno se alcance. ` +
          (disparador
            ? `En este caso se alcanzó por ${disparador}.`
            : 'En este caso no se alcanzó ninguno de los dos.'),
      };
    }

    case 'variable': {
      const elegido: SupuestoVariable | undefined = ctx.supuestoElegido
        ? spec.supuestos.find((s) => s.clave === ctx.supuestoElegido)
        : undefined;

      if (!elegido) {
        return {
          especificacion: spec,
          conversion: null,
          alcanzado: false,
          diferencia: null,
          explicacion:
            `La regla de ${ctx.etiqueta} depende del supuesto concreto y falta esa información. ` +
            `Supuestos posibles: ${spec.supuestos.map((s) => s.descripcion).join(' / ')}`,
        };
      }

      // El supuesto elegido ya trae un umbral resuelto (nunca otro 'variable').
      const interna = evaluarEspecificacion(elegido.umbral, ctx);
      return {
        ...interna,
        especificacion: spec,
        explicacion: `${elegido.descripcion} ${interna.explicacion}`,
      };
    }

    case 'requiere_revision':
      return {
        especificacion: spec,
        conversion: null,
        alcanzado: false,
        diferencia: null,
        explicacion:
          `No publicamos un umbral de ${ctx.etiqueta} para este supuesto porque no está confirmado ` +
          `en una fuente oficial. ${spec.nota} Este caso requiere revisión profesional.`,
      };
  }
}

/* ────────────────────────────────────────────────────────────────────────── */

/** Deduce la clave del supuesto variable a partir de los campos de la operación. */
function deducirSupuesto(op: Operacion, spec: EspecificacionUmbral): string | undefined {
  if (op.supuestoVariable) return op.supuestoVariable;
  if (spec.tipo !== 'variable') return undefined;

  if (op.actividad === 'servicios-profesionales' && op.enRepresentacionDelCliente !== undefined) {
    return op.enRepresentacionDelCliente ? 'en-representacion' : 'solo-asesoria';
  }
  if (op.actividad === 'traslado-custodia-valores' && op.montoIndeterminable !== undefined) {
    return op.montoIndeterminable ? 'monto-indeterminable' : 'monto-determinable';
  }
  return undefined;
}

/**
 * Evalúa una operación completa.
 *
 * Nunca devuelve "cumples" ni "no tienes obligaciones". Devuelve una conclusión
 * acotada, la confianza, los supuestos que se dieron por hechos y lo que falta
 * saber. La UI está obligada a mostrar los tres.
 */
export function evaluarOperacion(
  op: Operacion,
  ctx?: ContextoEvaluacion,
  reglas: readonly ReglaUmbral[] = UMBRALES,
): ResultadoEvaluacion {
  const fecha = assertFechaISO(op.fecha, 'fecha de la operación');
  const regla = buscarRegla(op.actividad, op.subtipo, fecha, reglas);
  if (!regla) throw new ReglaNoEncontradaError(op.actividad, op.subtipo, fecha);

  const actividad = ACTIVIDADES_POR_SLUG[op.actividad];
  const advertencias: Advertencia[] = [];
  const supuestos: string[] = [];
  const informacionFaltante: string[] = [];

  const comision = op.comision ?? centavos(0);
  const supuestoIdent = deducirSupuesto(op, regla.identificacion);
  const supuestoAviso = deducirSupuesto(op, regla.aviso);

  const identificacion = evaluarEspecificacion(regla.identificacion, {
    monto: op.monto,
    comision,
    fecha,
    ...(supuestoIdent ? { supuestoElegido: supuestoIdent } : {}),
    etiqueta: 'identificación',
  });

  const aviso = evaluarEspecificacion(regla.aviso, {
    monto: op.monto,
    comision,
    fecha,
    ...(supuestoAviso ? { supuestoElegido: supuestoAviso } : {}),
    etiqueta: 'aviso',
  });

  // ── Información faltante ────────────────────────────────────────────────
  //
  // Se distingue entre dos cosas que no son lo mismo:
  //
  //  · BLOQUEANTE: sin este dato la regla no se puede resolver, y decir
  //    "sin obligación" sería una afirmación sin respaldo.
  //  · SALVEDAD: el cálculo de ESTA operación es válido, pero hay un dato que
  //    podría cambiar el panorama completo (típicamente la acumulación).
  //
  // Mezclarlas hacía que toda calculadora anónima devolviera
  // "información insuficiente", que es ruido, no honestidad.
  const bloqueantes: string[] = [];

  if (regla.aviso.tipo === 'variable' && !supuestoAviso) {
    bloqueantes.push(
      regla.actividad === 'servicios-profesionales'
        ? 'Si realizas la operación en nombre y representación del cliente, o si sólo asesoras.'
        : 'El supuesto concreto que aplica a esta operación.',
    );
  }
  if (regla.aviso.tipo === 'monto_o_comision' && op.comision === undefined) {
    bloqueantes.push(
      'La contraprestación cobrada por el servicio: puede disparar el aviso aunque el monto no lo haga.',
    );
  }
  informacionFaltante.push(...bloqueantes);

  if (!op.clienteId && regla.acumulacion.aplica) {
    informacionFaltante.push(
      'Un identificador del cliente, para acumular sus operaciones en la ventana de seis meses.',
    );
    advertencias.push({
      clave: 'sin-acumulacion',
      severidad: 'info',
      mensaje:
        'Este resultado cubre sólo la operación capturada. Si el mismo cliente hizo otras operaciones del mismo tipo en los últimos seis meses, la suma puede disparar el aviso aunque ninguna llegue por separado.',
    });
  }

  // ── Supuestos aplicados ─────────────────────────────────────────────────
  supuestos.push(
    `Se aplicó la UMA vigente en la fecha de la operación (${fecha}), no la del año en curso.`,
  );
  if (regla.periodicidad === 'mensual') {
    supuestos.push('El monto capturado corresponde al periodo mensual completo, no a un solo pago.');
  }
  if (op.montoConIVA === undefined && (op.montoEfectivo ?? 0) > 0) {
    supuestos.push(
      'Para el límite de efectivo se usó el mismo monto capturado. El art. 32 se mide con IVA incluido: si tu monto es sin IVA, el resultado puede quedar corto.',
    );
  }

  // ── Efectivo (art. 32) ──────────────────────────────────────────────────
  const efectivo =
    op.montoEfectivo !== undefined && op.montoEfectivo > 0
      ? evaluarEfectivo({
          actividad: op.actividad,
          fecha,
          montoEfectivo: op.montoEfectivo,
          valorTotal: op.montoConIVA ?? op.monto,
        })
      : undefined;

  if (efectivo?.excede) {
    advertencias.push({
      clave: 'efectivo-excedido',
      severidad: 'riesgo',
      mensaje:
        'El monto liquidado en efectivo rebasa el límite del art. 32. Es una prohibición: rebasarla es infracción aunque presentes el aviso en tiempo.',
    });
  }

  // ── Acumulación (art. 17, último párrafo) ───────────────────────────────
  const acumulacion =
    regla.acumulacion.aplica && ctx?.historial?.length
      ? evaluarAcumulacion({
          operacionActual: op,
          historial: ctx.historial,
          regla,
        })
      : undefined;

  if (acumulacion?.alcanzado && !aviso.alcanzado) {
    advertencias.push({
      clave: 'aviso-por-acumulacion',
      severidad: 'riesgo',
      mensaje:
        'Esta operación por sí sola no alcanza el umbral, pero sumada a las anteriores del mismo cliente en seis meses sí lo alcanza. Fraccionar pagos no evita la obligación.',
    });
  }

  // ── Conclusión ──────────────────────────────────────────────────────────
  const avisoAlcanzado = aviso.alcanzado || (acumulacion?.alcanzado ?? false);
  const conclusion = derivarConclusion({
    regla,
    identificacionAlcanzada: identificacion.alcanzado,
    avisoAlcanzado,
    aviso,
    bloqueantes,
  });

  const confianza = derivarConfianza(regla, bloqueantes, conclusion, {
    acumulacionDesconocida: !op.clienteId && regla.acumulacion.aplica,
  });

  // ── Proximidad al umbral ────────────────────────────────────────────────
  if (
    !avisoAlcanzado &&
    aviso.conversion &&
    op.monto >= aviso.conversion.equivalentePesos * FACTOR_PROXIMIDAD
  ) {
    advertencias.push({
      clave: 'proximo-al-aviso',
      severidad: 'atencion',
      mensaje:
        'Estás dentro del 20% previo al umbral de aviso. Una operación más con el mismo cliente puede disparar la obligación.',
    });
  }

  if (regla.estado !== 'publicado') {
    advertencias.push({
      clave: 'regla-no-publicada',
      severidad: 'atencion',
      mensaje:
        'Esta regla está marcada como pendiente de revisión editorial porque no pudimos confirmarla en una fuente oficial. Trátala como orientación preliminar.',
    });
  }

  return {
    conclusion,
    confianza,
    actividad: op.actividad,
    ...(op.subtipo ? { subtipo: op.subtipo } : {}),
    fraccion: actividad?.fraccion ?? '—',
    nombreActividad: actividad?.nombre ?? op.actividad,
    identificacion,
    aviso,
    periodicidad: regla.periodicidad,
    ...(efectivo ? { efectivo } : {}),
    ...(acumulacion ? { acumulacion } : {}),
    advertencias,
    supuestos,
    informacionFaltante,
    obligacionesInmediatas: derivarObligaciones(identificacion.alcanzado, avisoAlcanzado),
    procedencia: regla.procedencia,
    versionLegal: VERSION_LEGAL,
  };
}

function derivarConclusion(args: {
  regla: ReglaUmbral;
  identificacionAlcanzada: boolean;
  avisoAlcanzado: boolean;
  aviso: EvaluacionUmbral;
  bloqueantes: string[];
}): Conclusion {
  const { regla, identificacionAlcanzada, avisoAlcanzado, aviso, bloqueantes } = args;

  if (regla.identificacion.tipo === 'requiere_revision' || regla.aviso.tipo === 'requiere_revision') {
    return 'requiere_revision_profesional';
  }
  if (bloqueantes.length > 0 && !avisoAlcanzado) {
    return 'informacion_insuficiente';
  }
  if (avisoAlcanzado) return 'aviso_probable';
  if (identificacionAlcanzada) {
    if (aviso.conversion && aviso.diferencia !== null) {
      const faltante = -aviso.diferencia;
      if (faltante <= aviso.conversion.equivalentePesos * (1 - FACTOR_PROXIMIDAD)) {
        return 'proximo_al_aviso';
      }
    }
    return 'requiere_identificacion';
  }
  return 'sin_obligacion_aparente';
}

function derivarConfianza(
  regla: ReglaUmbral,
  bloqueantes: string[],
  conclusion: Conclusion,
  ctx: { acumulacionDesconocida: boolean },
): NivelConfianza {
  if (conclusion === 'requiere_revision_profesional') return 'baja';
  if (regla.procedencia.verificacion !== 'oficial_verificado') return 'baja';
  if (bloqueantes.length > 1) return 'baja';
  if (bloqueantes.length === 1) return 'media';
  // El resultado de la operación es correcto, pero no vimos el historial del
  // cliente: la acumulación podría cambiar el panorama. Eso no es "alta".
  if (ctx.acumulacionDesconocida) return 'media';
  if (regla.aviso.tipo === 'variable') return 'media';
  return 'alta';
}

function derivarObligaciones(identificacion: boolean, aviso: boolean): string[] {
  const out: string[] = [];
  if (identificacion) {
    out.push('identificacion-cliente', 'expedientes', 'beneficiario-controlador', 'conservacion-diez-anios');
  }
  if (aviso) out.push('avisos');
  if (out.length > 0) out.unshift('alta-sppld', 'representante-cumplimiento');
  return out;
}
