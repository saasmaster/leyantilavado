'use client';

import { useMemo, useState } from 'react';
import { ANIOS_UMA_DISPONIBLES, convertirUMA } from '@leyantilavado/rules-engine';
import { ETIQUETA_PERIODICIDAD, formatearMXN, type Actividad, type ReglaUmbral } from '@leyantilavado/types';
import { Campo, Entrada, Insignia, Selector, TablaEnvoltura } from '@leyantilavado/ui';
import { describirUmbral, fechaDeAnioUMA, formatearUMA, tonoUmbral, type VistaUmbral } from './umbral';

/**
 * Tabla viva de umbrales.
 *
 * Es la página más citable del sitio, así que hace tres cosas que las tablas
 * estáticas del mercado no hacen: recalcula todo con la UMA del año elegido
 * (no con la del año en curso), conserva el comparador de cada regla y muestra
 * los supuestos de las reglas que no son un número.
 *
 * El año por omisión sale del catálogo de UMA registradas, no de la fecha del
 * navegador: así el render del servidor y el del cliente coinciden siempre.
 */
const ANIO_POR_DEFECTO = ANIOS_UMA_DISPONIBLES[0] ?? 2026;

type Unidad = 'uma' | 'pesos';

function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function CeldaUmbral({ vista, unidad }: { vista: VistaUmbral; unidad: Unidad }) {
  if (vista.montos.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <Insignia tono={tonoUmbral(vista)}>{vista.resumen}</Insignia>
        {vista.supuestos && (
          <ul className="flex flex-col gap-1.5 text-xs text-[var(--color-tinta-suave)]">
            {vista.supuestos.map((s) => (
              <li key={s.descripcion} className="flex flex-col gap-0.5">
                <span>{s.descripcion}</span>
                <span className="cifra font-medium text-[var(--color-tinta)]">
                  {s.vista.montos.length > 0
                    ? unidad === 'uma'
                      ? formatearUMA(s.vista.montos[0]!.uma)
                      : s.vista.montos[0]!.pesos
                    : s.vista.resumen}
                </span>
              </li>
            ))}
          </ul>
        )}
        {vista.requiereRevision && vista.nota && (
          <span className="text-xs text-[var(--color-ambar)]">{vista.nota}</span>
        )}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {vista.montos.map((m) => (
        <li key={`${m.etiqueta ?? 'monto'}-${m.uma}`}>
          {m.etiqueta && (
            <span className="block text-xs text-[var(--color-tinta-tenue)]">{m.etiqueta}</span>
          )}
          <span className="cifra font-semibold text-[var(--color-tinta)]">
            {unidad === 'uma' ? formatearUMA(m.uma) : m.pesos}
          </span>
          {m.comparador === 'mayor' && (
            <span className="block text-xs text-[var(--color-ambar)]">
              La ley dice &ldquo;superior a&rdquo;: el monto exacto no alcanza el umbral.
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function TablaUmbrales({
  reglas,
  actividades,
}: {
  reglas: readonly ReglaUmbral[];
  actividades: readonly Actividad[];
}) {
  const [anio, setAnio] = useState<number>(ANIO_POR_DEFECTO);
  const [unidad, setUnidad] = useState<Unidad>('uma');
  const [actividadFiltro, setActividadFiltro] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');

  const porSlug = useMemo(
    () => Object.fromEntries(actividades.map((a) => [a.slug, a])),
    [actividades],
  );

  const fecha = fechaDeAnioUMA(anio);
  const umaDiaria = useMemo(() => convertirUMA(1, fecha), [fecha]);

  const filas = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return reglas
      .map((r) => {
        const actividad = porSlug[r.actividad];
        const subtipo = r.subtipo
          ? actividad?.subtipos?.find((s) => s.slug === r.subtipo)
          : undefined;
        return {
          regla: r,
          fraccion: actividad?.fraccion ?? '—',
          nombreActividad: actividad?.nombre ?? r.actividad,
          nombreCorto: actividad?.nombreCorto ?? r.actividad,
          nombreSubtipo: subtipo?.nombre,
          identificacion: describirUmbral(r.identificacion, fecha),
          aviso: describirUmbral(r.aviso, fecha),
        };
      })
      .filter((f) => (actividadFiltro === 'todas' ? true : f.regla.actividad === actividadFiltro))
      .filter((f) => {
        if (q === '') return true;
        const heno = normalizar(
          [f.fraccion, f.nombreActividad, f.nombreSubtipo ?? '', f.regla.procedencia.disposicion].join(' '),
        );
        return heno.includes(q);
      });
  }, [reglas, porSlug, fecha, actividadFiltro, busqueda]);

  const actividadesOrdenadas = useMemo(
    () => [...actividades].sort((a, b) => a.nombreCorto.localeCompare(b.nombreCorto, 'es-MX')),
    [actividades],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Campo id="filtro-anio" etiqueta="Año de la UMA" ayuda="Recalcula toda la tabla">
          <Selector value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
            {ANIOS_UMA_DISPONIBLES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Selector>
        </Campo>

        <Campo id="filtro-unidad" etiqueta="Mostrar en" ayuda="UMA o su equivalente en pesos">
          <Selector value={unidad} onChange={(e) => setUnidad(e.target.value as Unidad)}>
            <option value="uma">UMA</option>
            <option value="pesos">Pesos</option>
          </Selector>
        </Campo>

        <Campo id="filtro-actividad" etiqueta="Actividad" ayuda="Filtra por fracción del art. 17">
          <Selector value={actividadFiltro} onChange={(e) => setActividadFiltro(e.target.value)}>
            <option value="todas">Todas las actividades</option>
            {actividadesOrdenadas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.fraccion} · {a.nombreCorto}
              </option>
            ))}
          </Selector>
        </Campo>

        <Campo id="filtro-busqueda" etiqueta="Buscar" ayuda="Por nombre, fracción o disposición">
          <Entrada
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="notarios, fideicomiso, XVI…"
          />
        </Campo>
      </div>

      <p className="text-sm text-[var(--color-tinta-suave)]" role="status">
        {filas.length} de {reglas.length} reglas · UMA diaria de {anio}:{' '}
        <span className="cifra font-medium">{formatearMXN(umaDiaria.equivalentePesos)}</span>. La
        UMA de cada año entra en vigor el 1 de febrero: una operación de enero se mide con la del
        año anterior.
      </p>

      <TablaEnvoltura etiqueta="Umbrales de identificación y aviso">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Umbrales de identificación y de aviso por actividad vulnerable, expresados en {unidad === 'uma' ? 'UMA' : 'pesos'} con el valor de {anio}.
          </caption>
          <thead className="bg-[var(--color-marfil-hondo)]">
            <tr>
              <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                Fracción
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Actividad o supuesto
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Identificación
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Aviso
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                Se mide
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr
                key={f.regla.id}
                className="border-t border-[var(--color-borde)] align-top"
              >
                <th scope="row" className="cifra whitespace-nowrap px-4 py-4 font-medium">
                  {f.fraccion}
                </th>
                <td className="px-4 py-4">
                  <p className="font-medium text-[var(--color-tinta)]">{f.nombreActividad}</p>
                  {f.nombreSubtipo && (
                    <p className="text-xs text-[var(--color-tinta-suave)]">{f.nombreSubtipo}</p>
                  )}
                  <p className="mt-1 text-xs text-[var(--color-tinta-tenue)]">
                    {f.regla.procedencia.disposicion}
                  </p>
                  {f.regla.estado !== 'publicado' && (
                    <p className="mt-1">
                      <Insignia tono="ambar">Requiere revisión editorial</Insignia>
                    </p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <CeldaUmbral vista={f.identificacion} unidad={unidad} />
                </td>
                <td className="px-4 py-4">
                  <CeldaUmbral vista={f.aviso} unidad={unidad} />
                </td>
                <td className="px-4 py-4 text-xs text-[var(--color-tinta-suave)]">
                  <p>{ETIQUETA_PERIODICIDAD[f.regla.periodicidad]}</p>
                  {f.regla.acumulacion.aplica && (
                    <p className="mt-1">
                      Se acumula en {f.regla.acumulacion.ventanaMeses} meses
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablaEnvoltura>

      {filas.length === 0 && (
        <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-borde-fuerte)] p-6 text-center text-sm text-[var(--color-tinta-suave)]">
          Ninguna regla coincide con el filtro. Prueba con otro término o quita el filtro de
          actividad.
        </p>
      )}
    </div>
  );
}
