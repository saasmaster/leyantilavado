'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { formatearMXN } from '@leyantilavado/types';
import type { ActividadSlug, EspecificacionUmbral, ReglaUmbral } from '@leyantilavado/types';
import {
  buscarRegla,
  convertirUMA,
  datos,
  hayUMAPara,
  reglasEfectivoAplicables,
} from '@leyantilavado/rules-engine';
import {
  Campo,
  Entrada,
  EstadoVacio,
  Insignia,
  Nota,
  Selector,
  TablaEnvoltura,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import { AccionesResultado } from '@/components/herramientas/AccionesResultado';
import { EncabezadoImpresion } from '@/components/herramientas/MarcoHerramienta';
import { SelectorActividad } from '@/components/herramientas/SelectorActividad';
import { nombreActividad, nombreSubtipo } from '@/lib/herramientas/actividades';
import { aCSV, escribirEnURL, esFechaValida } from '@/lib/herramientas/util';

interface Columna {
  actividad: string;
  subtipo: string;
}

const COLUMNAS_VACIAS: Columna[] = [
  { actividad: '', subtipo: '' },
  { actividad: '', subtipo: '' },
  { actividad: '', subtipo: '' },
];

/** Texto honesto de un umbral: los seis casos de la unión, sin inventar cifras. */
function describirUmbral(spec: EspecificacionUmbral, fecha: string): string {
  switch (spec.tipo) {
    case 'siempre':
      return 'Siempre, sin importar el monto';
    case 'nunca':
      return 'No aplica en este supuesto';
    case 'requiere_revision':
      return 'Sin umbral publicado: requiere revisión editorial';
    case 'variable':
      return `Depende del supuesto: ${spec.supuestos.map((s) => s.descripcion).join(' / ')}`;
    case 'monto_o_comision': {
      const monto = convertirUMA(spec.umaMonto, fecha);
      const comision = convertirUMA(spec.umaComision, fecha);
      return `${spec.umaMonto.toLocaleString('es-MX')} UMA por monto (${formatearMXN(
        monto.equivalentePesos,
      )}) o ${spec.umaComision.toLocaleString('es-MX')} UMA por contraprestación (${formatearMXN(
        comision.equivalentePesos,
      )})`;
    }
    case 'uma': {
      const c = convertirUMA(spec.uma, fecha);
      const comparador = spec.comparador === 'mayor' ? 'superior a' : 'igual o superior a';
      return `${comparador} ${spec.uma.toLocaleString('es-MX')} UMA (${formatearMXN(c.equivalentePesos)})`;
    }
  }
}

const ETIQUETA_PERIODICIDAD: Record<ReglaUmbral['periodicidad'], string> = {
  operacion: 'Por operación',
  mensual: 'Mensual acumulado',
  semestral: 'Semestral',
  anual: 'Anual',
};

export function Comparador() {
  const params = useSearchParams();
  const [hoy] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [fecha, setFecha] = React.useState(params.get('fecha') ?? hoy);
  const [columnas, setColumnas] = React.useState<Columna[]>(() => {
    const desdeURL = (params.get('actividades') ?? '').split(',').filter(Boolean);
    return COLUMNAS_VACIAS.map((c, i) => ({ ...c, actividad: desdeURL[i] ?? '' }));
  });

  const fechaValida = esFechaValida(fecha) && hayUMAPara(fecha);
  const fechaCalculo = fechaValida ? fecha : hoy;

  const actualizarColumna = (i: number, cambios: Partial<Columna>) =>
    setColumnas((c) => c.map((x, j) => (j === i ? { ...x, ...cambios } : x)));

  const seleccionadas = columnas
    .map((c, i) => ({ ...c, indice: i }))
    .filter((c) => c.actividad !== '')
    .map((c) => ({
      ...c,
      regla: buscarRegla(c.actividad, c.subtipo || undefined, fechaCalculo),
      efectivo: reglasEfectivoAplicables(
        c.actividad as Parameters<typeof reglasEfectivoAplicables>[0],
        fechaCalculo,
      ),
      meta: datos.ACTIVIDADES_POR_SLUG[c.actividad as ActividadSlug],
    }));

  const listas = seleccionadas.filter((s) => s.regla !== undefined);

  const csv = aCSV(
    ['actividad', 'inciso', 'fraccion', 'identificacion', 'aviso', 'periodicidad', 'acumulacion', 'limite_efectivo'],
    listas.map((s) => [
      nombreActividad(s.actividad),
      s.subtipo ? nombreSubtipo(s.actividad, s.subtipo) : '',
      s.meta?.fraccion ?? '',
      describirUmbral(s.regla!.identificacion, fechaCalculo),
      describirUmbral(s.regla!.aviso, fechaCalculo),
      ETIQUETA_PERIODICIDAD[s.regla!.periodicidad],
      s.regla!.acumulacion.aplica ? `${s.regla!.acumulacion.ventanaMeses} meses` : 'No acumula',
      s.efectivo.map((r) => `${r.nombre}: ${r.limiteUMA} UMA`).join(' | ') || 'Sin restricción específica',
    ]),
  );

  const FILAS: { etiqueta: string; valor: (s: (typeof listas)[number]) => React.ReactNode }[] = [
    {
      etiqueta: 'Fracción del art. 17',
      valor: (s) => s.meta?.fraccion ?? '—',
    },
    {
      etiqueta: 'A quién alcanza',
      valor: (s) => (
        <ul className="flex list-disc flex-col gap-1 pl-4">
          {(s.meta?.ejemplosSujetos ?? []).slice(0, 3).map((e: string) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ),
    },
    {
      etiqueta: 'Umbral de identificación',
      valor: (s) => describirUmbral(s.regla!.identificacion, fechaCalculo),
    },
    {
      etiqueta: 'Umbral de aviso',
      valor: (s) => describirUmbral(s.regla!.aviso, fechaCalculo),
    },
    {
      etiqueta: 'Cómo se mide',
      valor: (s) => ETIQUETA_PERIODICIDAD[s.regla!.periodicidad],
    },
    {
      etiqueta: 'Acumulación',
      valor: (s) =>
        s.regla!.acumulacion.aplica
          ? `Ventana móvil de ${s.regla!.acumulacion.ventanaMeses} meses, agrupando por ${s.regla!.acumulacion.agrupaPor.join(' y ')}`
          : 'No acumula: la obligación no depende del monto',
    },
    {
      etiqueta: 'Límite de efectivo (art. 32)',
      valor: (s) =>
        s.efectivo.length === 0 ? (
          'Sin restricción específica en el art. 32'
        ) : (
          <ul className="flex flex-col gap-1">
            {s.efectivo.map((r) => (
              <li key={r.id}>
                {r.nombre}: {r.limiteUMA.toLocaleString('es-MX')} UMA (
                {formatearMXN(convertirUMA(r.limiteUMA, fechaCalculo).equivalentePesos)})
                {r.periodicidad === 'mensual' ? ' mensuales' : ''}
                {r.estado !== 'publicado' && (
                  <Insignia tono="ambar" className="ml-1.5">
                    Pendiente de aclaración
                  </Insignia>
                )}
              </li>
            ))}
          </ul>
        ),
    },
    {
      etiqueta: 'Estado editorial',
      valor: (s) =>
        s.regla!.estado === 'publicado' ? (
          <Insignia tono="verde">Publicado</Insignia>
        ) : (
          <Insignia tono="rojo">Requiere revisión editorial</Insignia>
        ),
    },
    {
      etiqueta: 'Disposición',
      valor: (s) => s.regla!.procedencia.disposicion,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo className="flex flex-col gap-6">
          <Campo
            id="fecha-comparador"
            etiqueta="Fecha de referencia"
            ayuda="Define qué reglas están vigentes y con qué UMA se convierten los umbrales."
            requerido
            className="max-w-xs"
            {...(!fechaValida && fecha !== ''
              ? {
                  error: esFechaValida(fecha)
                    ? 'No tenemos registrada la UMA de esa fecha.'
                    : 'Captura una fecha válida.',
                }
              : {})}
          >
            <Entrada
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              onBlur={() =>
                escribirEnURL({
                  fecha,
                  actividades: columnas.map((c) => c.actividad).filter(Boolean).join(','),
                })
              }
            />
          </Campo>

          <div className="grid gap-6 lg:grid-cols-3">
            {columnas.map((c, i) => (
              <fieldset key={i} className="flex flex-col gap-4">
                <legend className="text-sm font-semibold text-[var(--color-tinta)]">
                  Actividad {i + 1}
                  {i === 2 ? ' (opcional)' : ''}
                </legend>
                <SelectorActividad
                  actividad={c.actividad}
                  subtipo={c.subtipo}
                  fecha={fechaCalculo}
                  onActividad={(slug) => actualizarColumna(i, { actividad: slug })}
                  onSubtipo={(slug) => actualizarColumna(i, { subtipo: slug })}
                  idPrefijo={`comp${i}`}
                />
              </fieldset>
            ))}
          </div>
        </TarjetaCuerpo>
      </Tarjeta>

      {seleccionadas.some((s) => s.regla === undefined) && (
        <Nota tono="atencion" titulo="Falta elegir el inciso">
          <p>
            Una de las actividades que elegiste tiene reglas distintas por inciso y todavía no
            seleccionaste cuál. Sin eso no hay una regla única que comparar.
          </p>
        </Nota>
      )}

      {listas.length < 2 ? (
        <EstadoVacio
          titulo="Elige al menos dos actividades"
          descripcion="El comparador necesita dos columnas para tener algo que contrastar. La tercera es opcional."
        />
      ) : (
        <section aria-live="polite" className="imprimible flex flex-col gap-6">
          <EncabezadoImpresion titulo="Comparativo de actividades vulnerables" />

          <TablaEnvoltura>
            <table className="w-full min-w-[46rem] border-collapse text-sm">
              <caption className="sr-only">
                Comparativo de umbrales, periodicidad, acumulación y límites de efectivo entre las
                actividades elegidas
              </caption>
              <thead className="bg-[var(--color-marfil-hondo)]">
                <tr>
                  <th scope="col" className="p-3 text-left font-semibold">
                    Concepto
                  </th>
                  {listas.map((s) => (
                    <th
                      key={`${s.actividad}-${s.subtipo}`}
                      scope="col"
                      className="p-3 text-left font-semibold"
                    >
                      {nombreActividad(s.actividad)}
                      {s.subtipo && (
                        <span className="mt-1 block text-xs font-normal text-[var(--color-tinta-tenue)]">
                          {nombreSubtipo(s.actividad, s.subtipo)}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FILAS.map((fila) => (
                  <tr
                    key={fila.etiqueta}
                    className="border-t border-[var(--color-borde)] align-top"
                  >
                    <th scope="row" className="p-3 text-left font-medium whitespace-nowrap">
                      {fila.etiqueta}
                    </th>
                    {listas.map((s) => (
                      <td
                        key={`${s.actividad}-${s.subtipo}-${fila.etiqueta}`}
                        className="p-3 text-[var(--color-tinta-suave)]"
                      >
                        {fila.valor(s)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaEnvoltura>

          <Nota tono="info" titulo="Las obligaciones de fondo son las mismas">
            <p>
              Lo que cambia entre actividades son los umbrales, la periodicidad y los límites de
              efectivo. El resto del programa —alta en el padrón, representante encargado del
              cumplimiento, manual, metodología de riesgos, expedientes, conservación diez años,
              capacitación y auditoría— aplica igual sin importar por cuál de las fracciones
              entraste.
            </p>
          </Nota>

          <AccionesResultado
            nombreArchivo="comparativo-actividades"
            csv={csv}
            datos={{ fecha: fechaCalculo, comparativo: listas.map((s) => s.regla) }}
            conEnlace
          />
        </section>
      )}
    </div>
  );
}
