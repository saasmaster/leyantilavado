/**
 * Cálculo de propiedad indirecta para el análisis de beneficiario controlador.
 *
 * No hay reglas legales aquí dentro, sólo aritmética de cadenas de propiedad:
 * el porcentaje de control se aplica fuera, porque el umbral aplicable es un
 * dato normativo que el corpus del motor todavía no publica.
 */

export type TipoEntidad = 'persona_fisica' | 'persona_moral' | 'fideicomiso';

export interface Entidad {
  id: string;
  etiqueta: string;
  tipo: TipoEntidad;
}

export interface Participacion {
  id: string;
  /** Quién posee (entidad propietaria). */
  propietarioId: string;
  /** Qué posee (entidad participada). */
  participadaId: string;
  /** 0-100. */
  porcentaje: number;
  /** Control por medios distintos a la propiedad accionaria. */
  porOtrosMedios: boolean;
  nota?: string;
}

export interface CadenaControl {
  /** Ids del propietario final hasta la entidad raíz. */
  ruta: string[];
  /** Producto de los porcentajes de la cadena, en porcentaje 0-100. */
  porcentaje: number;
  incluyeOtrosMedios: boolean;
}

export interface ResultadoBeneficiario {
  entidadId: string;
  etiqueta: string;
  tipo: TipoEntidad;
  /** Suma de todas las cadenas que llegan a la raíz. */
  porcentajeEfectivo: number;
  cadenas: CadenaControl[];
  /** Alguna de sus cadenas incluye control por otros medios. */
  controlPorOtrosMedios: boolean;
}

export interface AnalisisEstructura {
  /** Personas físicas ordenadas por participación efectiva descendente. */
  personasFisicas: ResultadoBeneficiario[];
  /** Personas morales o fideicomisos intermedios con participación relevante. */
  intermedias: ResultadoBeneficiario[];
  /** Huecos que impiden concluir. Se muestran siempre. */
  faltantes: string[];
  /** Porcentaje de la raíz que no está explicado por ninguna participación. */
  sinAtribuir: number;
  /** Ciclos detectados en la estructura: rompen el cálculo. */
  ciclos: string[];
}

const PRECISION = 1e-6;

/**
 * Recorre hacia arriba desde la entidad raíz acumulando el producto de los
 * porcentajes. Un dueño con 50% de una sociedad que a su vez tiene 40% de la
 * raíz controla el 20% efectivo.
 */
export function analizarEstructura(
  entidades: Entidad[],
  participaciones: Participacion[],
  raizId: string,
): AnalisisEstructura {
  const porId = new Map(entidades.map((e) => [e.id, e]));
  const acumulado = new Map<string, CadenaControl[]>();
  const ciclos: string[] = [];

  const recorrer = (
    participadaId: string,
    factor: number,
    ruta: string[],
    conOtrosMedios: boolean,
  ): void => {
    const dueños = participaciones.filter((p) => p.participadaId === participadaId);
    for (const p of dueños) {
      if (ruta.includes(p.propietarioId)) {
        const etiqueta = porId.get(p.propietarioId)?.etiqueta ?? p.propietarioId;
        if (!ciclos.includes(etiqueta)) ciclos.push(etiqueta);
        continue;
      }

      const nuevoFactor = (factor * p.porcentaje) / 100;
      const nuevaRuta = [p.propietarioId, ...ruta];
      const otros = conOtrosMedios || p.porOtrosMedios;

      const previas = acumulado.get(p.propietarioId) ?? [];
      previas.push({
        ruta: nuevaRuta,
        porcentaje: nuevoFactor,
        incluyeOtrosMedios: otros,
      });
      acumulado.set(p.propietarioId, previas);

      recorrer(p.propietarioId, nuevoFactor, nuevaRuta, otros);
    }
  };

  recorrer(raizId, 100, [raizId], false);

  const construir = (id: string): ResultadoBeneficiario | null => {
    const entidad = porId.get(id);
    const cadenas = acumulado.get(id);
    if (!entidad || !cadenas) return null;
    return {
      entidadId: id,
      etiqueta: entidad.etiqueta,
      tipo: entidad.tipo,
      porcentajeEfectivo: cadenas.reduce((a, c) => a + c.porcentaje, 0),
      cadenas: [...cadenas].sort((a, b) => b.porcentaje - a.porcentaje),
      controlPorOtrosMedios: cadenas.some((c) => c.incluyeOtrosMedios),
    };
  };

  const resultados = [...acumulado.keys()]
    .map(construir)
    .filter((x): x is ResultadoBeneficiario => x !== null)
    .sort((a, b) => b.porcentajeEfectivo - a.porcentajeEfectivo);

  /* ── Huecos ───────────────────────────────────────────────────────────── */

  const faltantes: string[] = [];

  const sumaDirecta = participaciones
    .filter((p) => p.participadaId === raizId)
    .reduce((a, p) => a + p.porcentaje, 0);
  const sinAtribuir = Math.max(0, 100 - sumaDirecta);

  if (sinAtribuir > PRECISION) {
    faltantes.push(
      `Falta identificar a los dueños del ${sinAtribuir.toFixed(2)}% de la entidad analizada. Mientras no se cierre el 100%, la estructura está incompleta.`,
    );
  }
  if (sumaDirecta > 100 + PRECISION) {
    faltantes.push(
      `Las participaciones directas suman ${sumaDirecta.toFixed(2)}%, más del 100%. Revisa las cifras capturadas.`,
    );
  }

  for (const e of entidades) {
    if (e.id === raizId) continue;
    if (e.tipo === 'persona_fisica') continue;
    const dueños = participaciones.filter((p) => p.participadaId === e.id);
    if (dueños.length === 0) {
      faltantes.push(
        `“${e.etiqueta}” es una entidad no física y no tiene dueños capturados: la cadena se corta ahí sin llegar a una persona física.`,
      );
      continue;
    }
    const suma = dueños.reduce((a, p) => a + p.porcentaje, 0);
    if (Math.abs(suma - 100) > PRECISION) {
      faltantes.push(
        `Las participaciones en “${e.etiqueta}” suman ${suma.toFixed(2)}% en lugar de 100%.`,
      );
    }
  }

  if (resultados.filter((x) => x.tipo === 'persona_fisica').length === 0) {
    faltantes.push(
      'Ninguna cadena de propiedad termina en una persona física. El beneficiario controlador siempre es una persona física: si no aparece, falta información o hay que documentar por qué no fue posible determinarlo.',
    );
  }

  return {
    personasFisicas: resultados.filter((x) => x.tipo === 'persona_fisica'),
    intermedias: resultados.filter((x) => x.tipo !== 'persona_fisica'),
    faltantes,
    sinAtribuir,
    ciclos,
  };
}
