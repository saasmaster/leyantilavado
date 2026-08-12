'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Mail, RotateCcw } from 'lucide-react';
import {
  AvisoIndependencia,
  Boton,
  Campo,
  Entrada,
  IndicadorConclusion,
  Insignia,
  Nota,
  SelloProcedencia,
  Selector,
  SupuestosYFaltantes,
  TITULO_CONCLUSION,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import type {
  Conclusion,
  MedioPago,
  Operacion,
  RespuestaCuestionario,
  ResultadoEvaluacion,
} from '@leyantilavado/types';
import {
  calcularFechaLimiteAviso,
  datos,
  evaluarOperacion,
  formatearFechaLarga,
  hayUMAPara,
} from '@leyantilavado/rules-engine';
import { TarjetaEvaluacion } from '@/components/herramientas/TarjetaEvaluacion';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { OPCIONES_ACTIVIDAD, nombreActividad, subtiposDe } from '@/lib/herramientas/actividades';
import { aCentavos, esFechaValida } from '@/lib/herramientas/util';

const FUENTES_ENLAZABLES = Object.fromEntries(
  datos.FUENTES.map((f) => [f.id, { nombre: f.nombre, url: f.url }]),
);

/** Severidad para elegir la conclusión global entre varias actividades. */
const SEVERIDAD: Record<Conclusion, number> = {
  aviso_probable: 5,
  requiere_revision_profesional: 4,
  proximo_al_aviso: 3,
  requiere_identificacion: 2,
  informacion_insuficiente: 1,
  sin_obligacion_aparente: 0,
};

const PASOS = [
  { clave: 'persona', titulo: 'Quién realiza la actividad' },
  { clave: 'actividades', titulo: 'Qué haces' },
  { clave: 'detalles', titulo: 'Los actos concretos' },
  { clave: 'operacion', titulo: 'La operación' },
  { clave: 'cliente', titulo: 'El cliente' },
  { clave: 'resultado', titulo: 'Resultado' },
] as const;

type ClavePaso = (typeof PASOS)[number]['clave'];

interface Respuestas {
  tipoPersona: '' | 'persona_fisica' | 'persona_moral' | 'fideicomiso';
  habitual: '' | 'si' | 'no' | 'no-se';
  actividades: string[];
  subtipos: Record<string, string>;
  enRepresentacion: '' | 'si' | 'no';
  montoIndeterminable: '' | 'si' | 'no';
  monto: string;
  fecha: string;
  frecuencia: '' | 'unica' | 'ocasional' | 'mensual' | 'diaria';
  medioPago: MedioPago;
  montoEfectivo: string;
  comision: string;
  repiteCliente: '' | 'si' | 'no' | 'no-se';
  pep: '' | 'si' | 'no' | 'no-se';
  beneficiario: '' | 'si' | 'no' | 'no-se';
}

const SI_NO_NOSE = [
  { valor: 'si', etiqueta: 'Sí' },
  { valor: 'no', etiqueta: 'No' },
  { valor: 'no-se', etiqueta: 'No lo sé todavía' },
];

export function Cuestionario() {
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [paso, setPaso] = React.useState<ClavePaso>('persona');
  const [errores, setErrores] = React.useState<Record<string, string>>({});
  const [correo, setCorreo] = React.useState('');

  const [r, setR] = React.useState<Respuestas>({
    tipoPersona: '',
    habitual: '',
    actividades: [],
    subtipos: {},
    enRepresentacion: '',
    montoIndeterminable: '',
    monto: '',
    fecha: '',
    frecuencia: '',
    medioPago: 'transferencia',
    montoEfectivo: '',
    comision: '',
    repiteCliente: '',
    pep: '',
    beneficiario: '',
  });

  const fechaOperacion = r.fecha || hoy;
  const actualizar = <K extends keyof Respuestas>(clave: K, valor: Respuestas[K]) =>
    setR((prev) => ({ ...prev, [clave]: valor }));

  /* ── Ramificación ──────────────────────────────────────────────────────── */

  const necesitaDetalles = r.actividades.some(
    (a) =>
      subtiposDe(a, fechaOperacion).length > 0 ||
      a === 'servicios-profesionales' ||
      a === 'traslado-custodia-valores',
  );

  const pasosVisibles = PASOS.filter((p) => p.clave !== 'detalles' || necesitaDetalles);
  const indiceActual = pasosVisibles.findIndex((p) => p.clave === paso);

  const validarPaso = (): boolean => {
    const e: Record<string, string> = {};
    if (paso === 'persona') {
      if (!r.tipoPersona) e['tipoPersona'] = 'Elige quién realiza la actividad.';
      if (!r.habitual) e['habitual'] = 'Contesta si la realizas de forma habitual o profesional.';
    }
    if (paso === 'actividades' && r.actividades.length === 0) {
      e['actividades'] = 'Marca al menos una actividad, o termina aquí si ninguna te aplica.';
    }
    if (paso === 'detalles') {
      for (const a of r.actividades) {
        if (subtiposDe(a, fechaOperacion).length > 0 && !r.subtipos[a]) {
          e[`subtipo-${a}`] = 'Elige el supuesto: cada inciso tiene su propia regla.';
        }
      }
    }
    if (paso === 'operacion') {
      if (aCentavos(r.monto) === null) e['monto'] = 'Captura el valor de la operación en pesos.';
      if (!esFechaValida(fechaOperacion)) e['fecha'] = 'Captura una fecha válida.';
      else if (!hayUMAPara(fechaOperacion))
        e['fecha'] = 'No tenemos registrada la UMA de esa fecha, así que no calculamos.';
      if (!r.frecuencia) e['frecuencia'] = 'Elige con qué frecuencia ocurre.';
      if (r.montoEfectivo !== '' && aCentavos(r.montoEfectivo) === null)
        e['montoEfectivo'] = 'Captura un monto en pesos o deja el campo vacío.';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const avanzar = () => {
    if (!validarPaso()) return;
    const siguiente = pasosVisibles[indiceActual + 1];
    if (siguiente) setPaso(siguiente.clave);
  };

  const retroceder = () => {
    const anterior = pasosVisibles[indiceActual - 1];
    if (anterior) setPaso(anterior.clave);
    setErrores({});
  };

  /* ── Evaluación ────────────────────────────────────────────────────────── */

  const evaluaciones = React.useMemo((): ResultadoEvaluacion[] => {
    if (paso !== 'resultado') return [];
    const monto = aCentavos(r.monto);
    if (monto === null || !esFechaValida(fechaOperacion) || !hayUMAPara(fechaOperacion)) return [];

    const efectivo = aCentavos(r.montoEfectivo);
    const comision = aCentavos(r.comision);

    return r.actividades.flatMap((actividad) => {
      const operacion: Operacion = {
        id: `cuestionario-${actividad}`,
        fecha: fechaOperacion,
        actividad: actividad as Operacion['actividad'],
        ...(r.subtipos[actividad] ? { subtipo: r.subtipos[actividad] } : {}),
        monto,
        ...(efectivo !== null && efectivo > 0 ? { montoEfectivo: efectivo } : {}),
        ...(comision !== null ? { comision } : {}),
        medioPago: r.medioPago,
        ...(r.tipoPersona ? { tipoCliente: r.tipoPersona } : {}),
        ...(actividad === 'servicios-profesionales' && r.enRepresentacion !== ''
          ? { enRepresentacionDelCliente: r.enRepresentacion === 'si' }
          : {}),
        ...(actividad === 'traslado-custodia-valores' && r.montoIndeterminable !== ''
          ? { montoIndeterminable: r.montoIndeterminable === 'si' }
          : {}),
      };
      try {
        return [evaluarOperacion(operacion)];
      } catch {
        return [];
      }
    });
  }, [paso, r, fechaOperacion]);

  const conclusionGlobal: Conclusion =
    evaluaciones.length === 0
      ? 'informacion_insuficiente'
      : evaluaciones.reduce<Conclusion>(
          (peor, e) => (SEVERIDAD[e.conclusion] > SEVERIDAD[peor] ? e.conclusion : peor),
          'sin_obligacion_aparente',
        );

  const confianzaGlobal = evaluaciones.some((e) => e.confianza === 'baja')
    ? 'baja'
    : evaluaciones.some((e) => e.confianza === 'media')
      ? 'media'
      : 'alta';

  /* Supuestos y faltantes: los del motor más los propios del cuestionario. */
  const supuestos = React.useMemo(() => {
    const base = new Set(evaluaciones.flatMap((e) => e.supuestos));
    base.add(
      'Se evaluó una sola operación representativa por actividad, con el monto que capturaste.',
    );
    if (r.habitual === 'no' || r.habitual === 'no-se') {
      base.add(
        'Se evaluó como si la actividad fuera habitual o profesional. Si es un acto aislado, varias fracciones podrían no aplicarte.',
      );
    }
    return [...base];
  }, [evaluaciones, r.habitual]);

  const faltantes = React.useMemo(() => {
    const base = new Set(evaluaciones.flatMap((e) => e.informacionFaltante));
    if (r.repiteCliente !== 'no') {
      base.add(
        'El historial completo del cliente en los últimos seis meses: la suma puede disparar el aviso aunque ninguna operación llegue sola.',
      );
    }
    if (r.beneficiario !== 'si') {
      base.add('Quién es la persona física que finalmente controla o se beneficia del cliente.');
    }
    if (r.pep === 'no-se') {
      base.add('Si el cliente, su beneficiario controlador o un familiar cercano es PEP.');
    }
    return [...base];
  }, [evaluaciones, r.repiteCliente, r.beneficiario, r.pep]);

  /** Obligaciones únicas de todas las actividades, más las del cuestionario. */
  const obligaciones = React.useMemo(() => {
    const slugs = new Set(evaluaciones.flatMap((e) => e.obligacionesInmediatas));
    if (r.pep === 'si') slugs.add('personas-politicamente-expuestas');
    if (r.tipoPersona === 'persona_moral' || r.tipoPersona === 'fideicomiso') {
      slugs.add('beneficiario-controlador');
    }
    if (slugs.size > 0) {
      slugs.add('manual-cumplimiento');
      slugs.add('enfoque-basado-riesgos');
    }
    return [...slugs]
      .map((slug) => datos.OBLIGACIONES_POR_SLUG[slug])
      .filter((o): o is NonNullable<typeof o> => Boolean(o));
  }, [evaluaciones, r.pep, r.tipoPersona]);

  const proximasFechas = React.useMemo(() => {
    const delCalendario = datos.CALENDARIO.filter((h) => h.fecha >= hoy)
      .slice(0, 4)
      .map((h) => ({
        fecha: h.fecha,
        titulo: h.titulo,
        confirmada: h.confirmadoOficialmente,
      }));

    const hayAviso = evaluaciones.some((e) => e.conclusion === 'aviso_probable');
    if (hayAviso && esFechaValida(fechaOperacion)) {
      const limite = calcularFechaLimiteAviso(fechaOperacion, hoy);
      return [
        {
          fecha: limite.fechaLimite,
          titulo: `Fecha límite del aviso de las operaciones de ${limite.periodo}`,
          confirmada: true,
        },
        ...delCalendario,
      ];
    }
    return delCalendario;
  }, [evaluaciones, fechaOperacion, hoy]);

  const respuestasParaExportar: RespuestaCuestionario[] = Object.entries(r).map(
    ([preguntaId, valor]) => ({
      preguntaId,
      valor: typeof valor === 'object' ? JSON.stringify(valor) : valor,
    }),
  );

  const cuerpoCorreo = React.useMemo(() => {
    const lineas = [
      `Resultado del diagnóstico de LeyAntilavado.org: ${TITULO_CONCLUSION[conclusionGlobal]}`,
      '',
      `Actividades evaluadas: ${evaluaciones.map((e) => e.nombreActividad).join('; ') || 'ninguna'}`,
      `Fecha de la operación evaluada: ${fechaOperacion}`,
      '',
      'Obligaciones que se activan:',
      ...obligaciones.map((o) => `- ${o.titulo}`),
      '',
      'Este resumen lo generó tu propio navegador. LeyAntilavado.org no lo recibió ni lo guardó.',
    ];
    return lineas.join('\n');
  }, [conclusionGlobal, evaluaciones, fechaOperacion, obligaciones]);

  /* ── Render ────────────────────────────────────────────────────────────── */

  const reiniciar = () => {
    setR({
      tipoPersona: '',
      habitual: '',
      actividades: [],
      subtipos: {},
      enRepresentacion: '',
      montoIndeterminable: '',
      monto: '',
      fecha: '',
      frecuencia: '',
      medioPago: 'transferencia',
      montoEfectivo: '',
      comision: '',
      repiteCliente: '',
      pep: '',
      beneficiario: '',
    });
    setErrores({});
    setCorreo('');
    setPaso('persona');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Progreso */}
      <nav aria-label="Avance del cuestionario" className="no-imprimir">
        <ol className="flex flex-wrap gap-2">
          {pasosVisibles.map((p, i) => {
            const activo = p.clave === paso;
            const completado = i < indiceActual;
            return (
              <li key={p.clave}>
                <span
                  aria-current={activo ? 'step' : undefined}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${
                    activo
                      ? 'bg-[var(--color-marino)] text-white'
                      : completado
                        ? 'bg-[var(--color-verde-tenue)] text-[var(--color-verde)]'
                        : 'bg-[var(--color-marfil-hondo)] text-[var(--color-tinta-tenue)]'
                  }`}
                >
                  <span className="cifra">{i + 1}</span>
                  {p.titulo}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {paso !== 'resultado' && (
        <Tarjeta>
          <TarjetaCuerpo className="flex flex-col gap-6">
            {paso === 'persona' && (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <Campo
                    id="tipoPersona"
                    etiqueta="¿Quién realiza la actividad?"
                    ayuda="Cambia las obligaciones de gobierno interno y de beneficiario controlador."
                    requerido
                    {...(errores['tipoPersona'] ? { error: errores['tipoPersona'] } : {})}
                  >
                    <Selector
                      value={r.tipoPersona}
                      onChange={(e) =>
                        actualizar('tipoPersona', e.target.value as Respuestas['tipoPersona'])
                      }
                    >
                      <option value="">Elige…</option>
                      <option value="persona_fisica">Persona física con actividad empresarial</option>
                      <option value="persona_moral">Persona moral</option>
                      <option value="fideicomiso">Fideicomiso u otra figura</option>
                    </Selector>
                  </Campo>

                  <Campo
                    id="habitual"
                    etiqueta="¿La realizas de forma habitual o profesional?"
                    ayuda="Varias fracciones sólo aplican cuando la actividad es habitual o profesional, no en un acto aislado."
                    requerido
                    {...(errores['habitual'] ? { error: errores['habitual'] } : {})}
                  >
                    <Selector
                      value={r.habitual}
                      onChange={(e) =>
                        actualizar('habitual', e.target.value as Respuestas['habitual'])
                      }
                    >
                      <option value="">Elige…</option>
                      {SI_NO_NOSE.map((o) => (
                        <option key={o.valor} value={o.valor}>
                          {o.etiqueta}
                        </option>
                      ))}
                    </Selector>
                  </Campo>
                </div>

                {(r.tipoPersona === 'persona_moral' || r.tipoPersona === 'fideicomiso') && (
                  <Nota tono="info" titulo="Dos regímenes paralelos">
                    <p>
                      Las sociedades mercantiles y los fideicomisos tienen obligaciones de
                      beneficiario controlador por el Código Fiscal de la Federación{' '}
                      <strong>aunque no realicen ninguna actividad vulnerable</strong>. Es un
                      régimen distinto del de la Ley Antilavado, con sus propias multas.
                    </p>
                  </Nota>
                )}
              </>
            )}

            {paso === 'actividades' && (
              <fieldset>
                <legend className="text-lg font-semibold text-[var(--color-tinta)]">
                  ¿Cuál de estas cosas haces?
                </legend>
                <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
                  Marca todas las que apliquen. Si ninguna te suena, es buena señal, pero léelas con
                  calma: varias alcanzan a negocios que no se consideran a sí mismos “financieros”.
                </p>
                {errores['actividades'] && (
                  <p role="alert" className="mt-2 text-sm font-medium text-[var(--color-rojo)]">
                    {errores['actividades']}
                  </p>
                )}

                <ul className="mt-4 grid gap-2 md:grid-cols-2">
                  {OPCIONES_ACTIVIDAD.map((a) => {
                    const meta = datos.ACTIVIDADES_POR_SLUG[a.slug];
                    const marcada = r.actividades.includes(a.slug);
                    return (
                      <li key={a.slug}>
                        <label className="flex h-full cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-borde)] p-3 transition-colors hover:bg-[var(--color-marfil-hondo)]">
                          <input
                            type="checkbox"
                            className="mt-1 size-5 cursor-pointer"
                            checked={marcada}
                            onChange={() =>
                              actualizar(
                                'actividades',
                                marcada
                                  ? r.actividades.filter((x) => x !== a.slug)
                                  : [...r.actividades, a.slug],
                              )
                            }
                          />
                          <span className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-[var(--color-tinta)]">
                              {a.nombre}
                            </span>
                            <span className="text-xs text-[var(--color-tinta-tenue)]">
                              Fracción {a.fraccion} · {meta?.ejemplosSujetos.slice(0, 2).join(', ')}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            )}

            {paso === 'detalles' && (
              <div className="flex flex-col gap-5">
                <p className="text-[var(--color-tinta-suave)]">
                  Estas actividades no tienen un umbral único: la regla cambia según el acto
                  concreto. Elige el que realizas.
                </p>

                {r.actividades.map((a) => {
                  const subtipos = subtiposDe(a, fechaOperacion);
                  if (subtipos.length === 0) return null;
                  return (
                    <Campo
                      key={a}
                      id={`subtipo-${a}`}
                      etiqueta={nombreActividad(a)}
                      ayuda="Cada inciso tiene su propio umbral, y varios generan aviso sin importar el monto."
                      requerido
                      {...(errores[`subtipo-${a}`] ? { error: errores[`subtipo-${a}`]! } : {})}
                    >
                      <Selector
                        value={r.subtipos[a] ?? ''}
                        onChange={(e) =>
                          actualizar('subtipos', { ...r.subtipos, [a]: e.target.value })
                        }
                      >
                        <option value="">Elige el supuesto…</option>
                        {subtipos.map((s) => (
                          <option key={s.slug} value={s.slug}>
                            {s.nombre}
                          </option>
                        ))}
                      </Selector>
                    </Campo>
                  );
                })}

                {r.actividades.includes('servicios-profesionales') && (
                  <Campo
                    id="enRepresentacion"
                    etiqueta="¿Realizas la operación en nombre y representación del cliente?"
                    ayuda="En la fracción XI el aviso no depende del monto, sino de si tú ejecutas la operación financiera o sólo asesoras."
                    requerido
                  >
                    <Selector
                      value={r.enRepresentacion}
                      onChange={(e) =>
                        actualizar(
                          'enRepresentacion',
                          e.target.value as Respuestas['enRepresentacion'],
                        )
                      }
                    >
                      <option value="">Aún no lo sé</option>
                      <option value="si">Sí, yo ejecuto la operación por cuenta del cliente</option>
                      <option value="no">No, sólo asesoro o preparo documentos</option>
                    </Selector>
                  </Campo>
                )}

                {r.actividades.includes('traslado-custodia-valores') && (
                  <Campo
                    id="montoIndeterminable"
                    etiqueta="¿Se puede determinar el monto trasladado o custodiado?"
                    ayuda="Si no se puede determinar, el aviso procede en todos los casos."
                    requerido
                  >
                    <Selector
                      value={r.montoIndeterminable}
                      onChange={(e) =>
                        actualizar(
                          'montoIndeterminable',
                          e.target.value as Respuestas['montoIndeterminable'],
                        )
                      }
                    >
                      <option value="">Aún no lo sé</option>
                      <option value="no">Sí, el monto es determinable</option>
                      <option value="si">No, el monto no se puede determinar</option>
                    </Selector>
                  </Campo>
                )}
              </div>
            )}

            {paso === 'operacion' && (
              <div className="grid gap-5 md:grid-cols-2">
                <Campo
                  id="monto-cuestionario"
                  etiqueta="Valor de una operación representativa, sin IVA"
                  ayuda="Usa la más grande que sueles hacer: es la que decide si cruzas el umbral."
                  requerido
                  {...(errores['monto'] ? { error: errores['monto'] } : {})}
                >
                  <Entrada
                    inputMode="decimal"
                    className="cifra"
                    placeholder="0.00"
                    value={r.monto}
                    onChange={(e) => actualizar('monto', e.target.value)}
                  />
                </Campo>

                <Campo
                  id="fecha-cuestionario"
                  etiqueta="Fecha de esa operación"
                  ayuda="Define la UMA y la regla aplicables. Si aún no ocurre, deja la fecha de hoy."
                  requerido
                  {...(errores['fecha'] ? { error: errores['fecha'] } : {})}
                >
                  <Entrada
                    type="date"
                    value={r.fecha || hoy}
                    onChange={(e) => actualizar('fecha', e.target.value)}
                  />
                </Campo>

                <Campo
                  id="frecuencia"
                  etiqueta="¿Con qué frecuencia ocurre?"
                  ayuda="Sirve para saber si conviene revisar la acumulación de seis meses."
                  requerido
                  {...(errores['frecuencia'] ? { error: errores['frecuencia'] } : {})}
                >
                  <Selector
                    value={r.frecuencia}
                    onChange={(e) =>
                      actualizar('frecuencia', e.target.value as Respuestas['frecuencia'])
                    }
                  >
                    <option value="">Elige…</option>
                    <option value="unica">Fue una sola vez</option>
                    <option value="ocasional">Algunas veces al año</option>
                    <option value="mensual">Todos los meses</option>
                    <option value="diaria">Varias veces por semana</option>
                  </Selector>
                </Campo>

                <Campo
                  id="medioPago-cuestionario"
                  etiqueta="Medio de pago principal"
                  ayuda="Si hay efectivo de por medio se revisa también el artículo 32."
                >
                  <Selector
                    value={r.medioPago}
                    onChange={(e) => actualizar('medioPago', e.target.value as MedioPago)}
                  >
                    <option value="transferencia">Transferencia</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="cheque">Cheque</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="metales_preciosos">Metales o piedras preciosas</option>
                    <option value="activos_virtuales">Activos virtuales</option>
                    <option value="mixto">Combinación de medios</option>
                    <option value="otro">Otro</option>
                  </Selector>
                </Campo>

                <Campo
                  id="montoEfectivo-cuestionario"
                  etiqueta="Parte liquidada en efectivo o metales, con IVA"
                  ayuda="Déjalo vacío si no recibes efectivo. Recuerda: el artículo 32 se mide CON IVA."
                  {...(errores['montoEfectivo'] ? { error: errores['montoEfectivo'] } : {})}
                >
                  <Entrada
                    inputMode="decimal"
                    className="cifra"
                    placeholder="0.00"
                    value={r.montoEfectivo}
                    onChange={(e) => actualizar('montoEfectivo', e.target.value)}
                  />
                </Campo>

                {r.actividades.includes('activos-virtuales') && (
                  <Campo
                    id="comision-cuestionario"
                    etiqueta="Contraprestación que cobras por el servicio"
                    ayuda="En activos virtuales la comisión dispara el aviso por sí sola, desde 4 UMA."
                  >
                    <Entrada
                      inputMode="decimal"
                      className="cifra"
                      placeholder="0.00"
                      value={r.comision}
                      onChange={(e) => actualizar('comision', e.target.value)}
                    />
                  </Campo>
                )}
              </div>
            )}

            {paso === 'cliente' && (
              <div className="grid gap-5 md:grid-cols-2">
                <Campo
                  id="repiteCliente"
                  etiqueta="¿El mismo cliente repite operaciones contigo?"
                  ayuda="Las operaciones del mismo cliente por el mismo acto se suman en una ventana de seis meses."
                >
                  <Selector
                    value={r.repiteCliente}
                    onChange={(e) =>
                      actualizar('repiteCliente', e.target.value as Respuestas['repiteCliente'])
                    }
                  >
                    <option value="">Elige…</option>
                    {SI_NO_NOSE.map((o) => (
                      <option key={o.valor} value={o.valor}>
                        {o.etiqueta}
                      </option>
                    ))}
                  </Selector>
                </Campo>

                <Campo
                  id="pep"
                  etiqueta="¿Alguno de tus clientes es persona políticamente expuesta?"
                  ayuda="Incluye a sus familiares cercanos y asociados. Activa debida diligencia reforzada."
                >
                  <Selector
                    value={r.pep}
                    onChange={(e) => actualizar('pep', e.target.value as Respuestas['pep'])}
                  >
                    <option value="">Elige…</option>
                    {SI_NO_NOSE.map((o) => (
                      <option key={o.valor} value={o.valor}>
                        {o.etiqueta}
                      </option>
                    ))}
                  </Selector>
                </Campo>

                <Campo
                  id="beneficiario"
                  etiqueta="¿Tienes identificado al beneficiario controlador de tus clientes persona moral?"
                  ayuda="La persona física que finalmente controla o se beneficia, aunque el control sea indirecto."
                  className="md:col-span-2"
                >
                  <Selector
                    value={r.beneficiario}
                    onChange={(e) =>
                      actualizar('beneficiario', e.target.value as Respuestas['beneficiario'])
                    }
                  >
                    <option value="">Elige…</option>
                    {SI_NO_NOSE.map((o) => (
                      <option key={o.valor} value={o.valor}>
                        {o.etiqueta}
                      </option>
                    ))}
                  </Selector>
                </Campo>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-borde)] pt-5">
              <Boton
                type="button"
                variante="contorno"
                onClick={retroceder}
                disabled={indiceActual === 0}
              >
                <ArrowLeft aria-hidden />
                Atrás
              </Boton>
              <Boton type="button" variante="accion" onClick={avanzar}>
                {indiceActual === pasosVisibles.length - 2 ? 'Ver mi resultado' : 'Siguiente'}
                <ArrowRight aria-hidden />
              </Boton>
            </div>
          </TarjetaCuerpo>
        </Tarjeta>
      )}

      {paso === 'resultado' && (
        <section aria-live="polite" className="imprimible flex flex-col gap-8">
          <EncabezadoImpresion titulo="Diagnóstico de aplicabilidad de la Ley Antilavado" />

          <IndicadorConclusion conclusion={conclusionGlobal} confianza={confianzaGlobal}>
            <p className="mt-3 text-sm text-[var(--color-tinta-suave)]">
              {evaluaciones.length === 0
                ? 'No pudimos evaluar ninguna actividad con los datos capturados. Revisa tus respuestas: preferimos no darte un resultado a darte uno que no se sostiene.'
                : `Se evaluaron ${evaluaciones.length} ${evaluaciones.length === 1 ? 'actividad' : 'actividades'}. Abajo está el detalle de cada una.`}
            </p>
          </IndicadorConclusion>

          <SupuestosYFaltantes supuestos={supuestos} informacionFaltante={faltantes} />

          {obligaciones.length > 0 && (
            <section aria-labelledby="obligaciones-cuestionario">
              <h2
                id="obligaciones-cuestionario"
                className="text-xl font-semibold text-[var(--color-tinta)]"
              >
                Obligaciones que se activan
              </h2>
              <ul className="mt-3 grid gap-3 md:grid-cols-2">
                {obligaciones.map((o) => (
                  <li
                    key={o.slug}
                    className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
                  >
                    <Link
                      href={`/obligaciones/${o.slug}`}
                      className="font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                    >
                      {o.titulo}
                    </Link>
                    <p className="mt-1.5 text-sm text-[var(--color-tinta-suave)]">{o.resumen}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {proximasFechas.length > 0 && (
            <section aria-labelledby="fechas-cuestionario">
              <h2 id="fechas-cuestionario" className="text-xl font-semibold text-[var(--color-tinta)]">
                Próximas fechas que te tocan
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {proximasFechas.map((f) => (
                  <li
                    key={`${f.fecha}-${f.titulo}`}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-[var(--radius-control)] border border-[var(--color-borde)] p-3"
                  >
                    <span className="cifra font-medium text-[var(--color-tinta)]">
                      {formatearFechaLarga(f.fecha)}
                    </span>
                    <span className="text-sm text-[var(--color-tinta-suave)]">{f.titulo}</span>
                    {!f.confirmada && (
                      <Insignia tono="ambar">Fecha calculada, no publicada</Insignia>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {evaluaciones.length > 0 && (
            <section aria-labelledby="detalle-cuestionario" className="flex flex-col gap-8">
              <h2
                id="detalle-cuestionario"
                className="text-xl font-semibold text-[var(--color-tinta)]"
              >
                Detalle por actividad
              </h2>
              {evaluaciones.map((e) => (
                <TarjetaEvaluacion key={`${e.actividad}-${e.subtipo ?? ''}`} resultado={e} compacta />
              ))}
            </section>
          )}

          {evaluaciones[0] && (
            <SelloProcedencia
              procedencia={evaluaciones[0].procedencia}
              fuentes={FUENTES_ENLAZABLES}
            />
          )}

          <AccionesResultado
            nombreArchivo="diagnostico-leyantilavado"
            datos={{
              conclusion: conclusionGlobal,
              confianza: confianzaGlobal,
              respuestas: respuestasParaExportar,
              evaluaciones,
            }}
            claveGuardado="cuestionario"
          />

          {/* El correo se pide DESPUÉS del resultado y es opcional. Además, el
              mensaje lo arma tu propio cliente de correo: nada llega a nuestros
              servidores porque no hay ninguno de por medio. */}
          <Tarjeta className="no-imprimir">
            <TarjetaCuerpo className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-[var(--color-tinta)]">
                ¿Quieres llevarte el resumen por correo?
              </h2>
              <p className="text-sm text-[var(--color-tinta-suave)]">
                Opcional, y lo mandas tú. Abrimos tu programa de correo con el resumen ya escrito:
                nosotros no lo recibimos, no lo guardamos y no te vamos a escribir después.
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <Campo
                  id="correo"
                  etiqueta="Tu correo"
                  ayuda="Sólo se usa para prellenar el destinatario en tu propio cliente de correo."
                  className="min-w-64 flex-1"
                >
                  <Entrada
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </Campo>
                <Boton
                  comoHijo
                  variante="contorno"
                  className={correo.includes('@') ? '' : 'pointer-events-none opacity-50'}
                >
                  <a
                    href={`mailto:${encodeURIComponent(correo)}?subject=${encodeURIComponent(
                      'Mi diagnóstico de la Ley Antilavado',
                    )}&body=${encodeURIComponent(cuerpoCorreo)}`}
                    aria-disabled={!correo.includes('@')}
                  >
                    <Mail aria-hidden />
                    Abrir mi correo con el resumen
                  </a>
                </Boton>
              </div>
            </TarjetaCuerpo>
          </Tarjeta>

          <div className="no-imprimir flex flex-wrap items-center gap-3">
            <Boton type="button" variante="fantasma" onClick={reiniciar}>
              <RotateCcw aria-hidden />
              Empezar de nuevo
            </Boton>
            <Boton comoHijo variante="primario">
              <Link href="/directorio">Buscar quien me ayude a implementarlo</Link>
            </Boton>
          </div>

          <AvisoIndependencia />
        </section>
      )}
    </div>
  );
}
