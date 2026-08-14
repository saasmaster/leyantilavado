'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquareText } from 'lucide-react';
import {
  AreaTexto,
  Boton,
  Campo,
  Entrada,
  Insignia,
  Nota,
  Selector,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import type { MedioPago, NivelConfianza, Operacion, ResultadoEvaluacion } from '@leyantilavado/types';
import { evaluarOperacion, hayUMAPara } from '@leyantilavado/rules-engine';
import { SelectorActividad } from '@/components/herramientas/SelectorActividad';
import { TarjetaEvaluacion } from '@/components/herramientas/TarjetaEvaluacion';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { requiereSubtipo } from '@/lib/herramientas/actividades';
import { aCentavos, escribirEnURL, esFechaValida } from '@/lib/herramientas/util';
import {
  ETIQUETA_MEDIO,
  FRASES_EJEMPLO,
  interpretar,
  type Interpretacion,
} from '@/lib/consulta/interpretar';

const MEDIOS: MedioPago[] = [
  'transferencia',
  'efectivo',
  'cheque',
  'tarjeta',
  'metales_preciosos',
  'activos_virtuales',
  'mixto',
  'otro',
];

const TONO_CONFIANZA: Record<NivelConfianza, 'verde' | 'ambar' | 'rojo'> = {
  alta: 'verde',
  media: 'ambar',
  baja: 'rojo',
};

interface Campos {
  actividad: string;
  subtipo: string;
  /** En pesos, como texto. Se convierte a centavos al evaluar. */
  monto: string;
  fecha: string;
  medio: string;
}

/** Centavos → texto editable en pesos, sin notación de moneda. */
const aPesos = (centavos: number): string => (centavos / 100).toFixed(2);

export function Consulta() {
  const params = useSearchParams();
  // Igual que en el resto de las herramientas: el reloj se lee una sola vez,
  // en el inicializador perezoso, nunca durante el render.
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));

  const [frase, setFrase] = React.useState('');
  const [interpretacion, setInterpretacion] = React.useState<Interpretacion | null>(null);
  const [campos, setCamposEstado] = React.useState<Campos>(() => ({
    actividad: params.get('actividad') ?? '',
    subtipo: params.get('subtipo') ?? '',
    monto: params.get('monto') ?? '',
    fecha: params.get('fecha') ?? hoy,
    medio: params.get('medio') ?? '',
  }));

  /**
   * Toda corrección pasa por aquí para que la URL siga al estado. A la URL van
   * sólo los campos del cálculo: la frase NO se copia al enlace, porque puede
   * llevar el nombre de un cliente.
   */
  const setCampos = (parcial: Partial<Campos>) => {
    const siguiente = { ...campos, ...parcial };
    setCamposEstado(siguiente);
    escribirEnURL({
      actividad: siguiente.actividad,
      subtipo: siguiente.subtipo,
      monto: siguiente.monto,
      fecha: siguiente.fecha,
      medio: siguiente.medio,
    });
  };

  const consultar = (texto: string) => {
    const leida = interpretar(texto, hoy);
    setFrase(texto);
    setInterpretacion(leida);
    setCampos({
      actividad: leida.actividad ?? '',
      // La actividad cambió: el inciso anterior ya no aplica.
      subtipo: '',
      monto: leida.monto === null ? '' : aPesos(leida.monto),
      fecha: leida.fecha,
      medio: leida.medioPago ?? '',
    });
  };

  // El cálculo es una función pura de los campos: no hace falta un efecto ni
  // un botón aparte, y cualquier corrección vuelve a evaluar al instante.
  const evaluacion = React.useMemo((): { resultado: ResultadoEvaluacion } | { error: string } | null => {
    const monto = aCentavos(campos.monto);
    if (!campos.actividad || monto === null) return null;
    if (!esFechaValida(campos.fecha)) return { error: 'La fecha no es válida.' };
    if (!hayUMAPara(campos.fecha)) {
      return { error: 'No tenemos registrada la UMA de esa fecha, así que no calculamos.' };
    }
    if (requiereSubtipo(campos.actividad, campos.fecha) && !campos.subtipo) {
      return {
        error:
          'Esta actividad tiene una regla distinta por inciso. Elige cuál aplica: elegirlo por ti sería adivinar.',
      };
    }

    const operacion: Operacion = {
      id: 'consulta-libre',
      fecha: campos.fecha,
      actividad: campos.actividad as Operacion['actividad'],
      ...(campos.subtipo ? { subtipo: campos.subtipo } : {}),
      monto,
      // Si la frase dice "en efectivo", todo el monto se liquidó en efectivo y
      // procede revisar además el límite del artículo 32.
      ...(campos.medio === 'efectivo' ? { montoEfectivo: monto } : {}),
      medioPago: (campos.medio || 'otro') as MedioPago,
    };

    try {
      return { resultado: evaluarOperacion(operacion) };
    } catch (e) {
      return {
        error:
          e instanceof Error
            ? e.message
            : 'No fue posible resolver una regla para esa combinación de actividad y fecha.',
      };
    }
  }, [campos.actividad, campos.subtipo, campos.monto, campos.fecha, campos.medio]);

  return (
    <div className="flex flex-col gap-8">
      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              consultar(frase);
            }}
            noValidate
            className="flex flex-col gap-5"
          >
            <Campo
              id="frase"
              etiqueta="Cuéntame la operación con tus palabras"
              ayuda="Por ejemplo: «vendí un reloj de 180 mil en efectivo». No escribas nombres ni datos de tu cliente: no hacen falta."
              requerido
            >
              <AreaTexto
                rows={3}
                value={frase}
                onChange={(e) => setFrase(e.target.value)}
                placeholder="Vendí un reloj de 180 mil en efectivo"
              />
            </Campo>

            <div className="flex flex-wrap items-center gap-3">
              <Boton type="submit" variante="accion">
                <MessageSquareText aria-hidden />
                Interpretar
              </Boton>
              <p className="text-sm text-[var(--color-tinta-tenue)]">
                Sin inteligencia artificial: son reglas de lectura y el cálculo corre en tu
                navegador.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--color-tinta-tenue)]">Prueba con:</span>
              {FRASES_EJEMPLO.map((ejemplo) => (
                <Boton
                  key={ejemplo}
                  type="button"
                  variante="contorno"
                  tamano="sm"
                  onClick={() => consultar(ejemplo)}
                >
                  {ejemplo}
                </Boton>
              ))}
            </div>
          </form>
        </TarjetaCuerpo>
      </Tarjeta>

      {interpretacion && (
        <Tarjeta className="no-imprimir">
          <TarjetaCuerpo>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-[var(--color-tinta)]">Esto entendí</h2>
                <Insignia tono={TONO_CONFIANZA[interpretacion.confianza]}>
                  Lectura de confianza {interpretacion.confianza}
                </Insignia>
              </div>

              <ul className="flex flex-col gap-1 text-sm text-[var(--color-tinta-suave)]">
                {interpretacion.entendido.map((linea) => (
                  <li key={linea}>{linea}</li>
                ))}
              </ul>

              {interpretacion.noEntendido.length > 0 && (
                <Nota tono="atencion" titulo="Esto no lo entendí">
                  <ul className="ml-4 list-disc">
                    {interpretacion.noEntendido.map((linea) => (
                      <li key={linea}>{linea}</li>
                    ))}
                  </ul>
                </Nota>
              )}

              {/* Empate entre dos actividades: se ofrecen las dos, no se elige por el usuario. */}
              {interpretacion.candidatas.length > 0 && interpretacion.candidatas.length <= 4 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[var(--color-tinta-tenue)]">¿Cuál de éstas?</span>
                  {interpretacion.candidatas.map((c) => (
                    <Boton
                      key={c.slug}
                      type="button"
                      variante="contorno"
                      tamano="sm"
                      onClick={() => setCampos({ actividad: c.slug, subtipo: '' })}
                    >
                      {c.fraccion} — {c.nombreCorto}
                    </Boton>
                  ))}
                </div>
              )}

              <p className="text-sm text-[var(--color-tinta-tenue)]">
                Corrige lo que haga falta: manda lo que quede en estos campos, no la frase.
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <SelectorActividad
                  actividad={campos.actividad}
                  subtipo={campos.subtipo}
                  fecha={esFechaValida(campos.fecha) ? campos.fecha : hoy}
                  onActividad={(s) => setCampos({ actividad: s })}
                  onSubtipo={(s) => setCampos({ subtipo: s })}
                />

                <Campo
                  id="monto"
                  etiqueta="Valor de la operación, sin IVA"
                  ayuda="Los umbrales del artículo 17 se miden sin IVA. En pesos."
                  requerido
                >
                  <Entrada
                    inputMode="decimal"
                    className="cifra"
                    value={campos.monto}
                    onChange={(e) => setCampos({ monto: e.target.value })}
                  />
                </Campo>

                <Campo
                  id="fecha"
                  etiqueta="Fecha de la operación"
                  ayuda="Determina qué UMA y qué regla se aplican. Es la fecha del acto, no la de hoy."
                  requerido
                >
                  <Entrada
                    type="date"
                    value={campos.fecha}
                    onChange={(e) => setCampos({ fecha: e.target.value })}
                  />
                </Campo>

                <Campo
                  id="medio"
                  etiqueta="Medio de pago"
                  ayuda="No cambia el umbral de aviso. Si es efectivo, se revisa además el límite del artículo 32."
                >
                  <Selector
                    value={campos.medio}
                    onChange={(e) => setCampos({ medio: e.target.value })}
                  >
                    <option value="">No lo sé</option>
                    {MEDIOS.map((m) => (
                      <option key={m} value={m}>
                        {ETIQUETA_MEDIO[m]}
                      </option>
                    ))}
                  </Selector>
                </Campo>
              </div>

              {campos.medio === 'efectivo' && (
                <Nota tono="info">
                  <p>
                    Como dijiste “efectivo”, se dio por hecho que la operación completa se liquidó
                    así y se revisó el límite del artículo 32 con esa cifra. Si sólo una parte fue en
                    efectivo, cambia el medio de pago a “combinación de medios” y usa la calculadora
                    de umbrales, que pide las dos cantidades por separado.
                  </p>
                </Nota>
              )}
            </div>
          </TarjetaCuerpo>
        </Tarjeta>
      )}

      {evaluacion && 'error' in evaluacion && (
        <Nota tono="atencion" titulo="No pudimos calcular con esos datos">
          <p>{evaluacion.error}</p>
        </Nota>
      )}

      {evaluacion && 'resultado' in evaluacion && (
        <section aria-live="polite" aria-labelledby="resultado-consulta">
          <EncabezadoImpresion titulo="Consulta en lenguaje natural" />
          <h2 id="resultado-consulta" className="sr-only">
            Resultado de la consulta
          </h2>
          <TarjetaEvaluacion resultado={evaluacion.resultado} />
          <AccionesResultado
            nombreArchivo="consulta-leyantilavado"
            datos={evaluacion.resultado}
            conEnlace
            claveGuardado="consulta-libre"
          />
        </section>
      )}
    </div>
  );
}
