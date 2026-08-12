import Link from 'next/link';
import type { Periodicidad } from '@leyantilavado/types';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { SelloProcedencia, TablaEnvoltura } from '@leyantilavado/ui';
import { EspecificacionCelda, FECHA_HOY, MAPA_FUENTES, Seccion } from './comun';

/**
 * Portada — bloque 8. Ocho filas destacadas de la tabla de umbrales.
 *
 * Las ocho están elegidas para cubrir los distintos casos de
 * `EspecificacionUmbral`: umbral simple, "siempre", comparador estricto
 * ("superior a" vs "igual o superior a"), doble disparador de activos
 * virtuales y el caso variable del traslado de valores. Si la UI sólo supiera
 * pintar números, esta tabla mentiría en cuatro de las ocho filas.
 */

const IDS_DESTACADOS = [
  'inmuebles-construccion-intermediacion',
  'vehiculos',
  'metales-joyeria',
  'arrendamiento-inmuebles',
  'prestamos-creditos',
  'donativos',
  'traslado-custodia-valores',
  'activos-virtuales',
] as const;

const FILAS = IDS_DESTACADOS.flatMap((id) => {
  const regla = datos.UMBRALES_PUBLICADOS.find((u) => u.id === id);
  if (!regla) return [];
  const actividad = datos.ACTIVIDADES_POR_SLUG[regla.actividad];
  return actividad ? [{ regla, actividad }] : [];
});

const ETIQUETA_PERIODICIDAD: Record<Periodicidad, string> = {
  operacion: 'Por operación',
  mensual: 'Mensual',
  semestral: 'Semestral',
  anual: 'Anual',
};

const UMA = datos.UMA_VIGENTE_MAS_RECIENTE;

export function TablaUmbrales() {
  return (
    <Seccion
      id="umbrales"
      etiqueta="Umbrales"
      titulo="Ocho umbrales que casi nadie tiene bien"
      descripcion={
        <>
          En UMA y en pesos, convertidos con la UMA vigente al{' '}
          {formatearFechaLarga(FECHA_HOY)}. Ojo con el matiz que cambia el resultado justo en el
          borde: unos umbrales dicen <em>“superior a”</em> y otros <em>“igual o superior a”</em>.
        </>
      }
      accion={
        <Link
          href="/umbrales"
          className="text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
        >
          Tabla completa por fracción
        </Link>
      }
      fondo="hondo"
    >
      <TablaEnvoltura
        aria-label="Umbrales destacados de identificación y aviso"
        className="bg-[var(--color-superficie)]"
      >
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Ocho umbrales destacados de identificación y de aviso, en UMA y en pesos mexicanos.
          </caption>
          <thead>
            <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-tinta)]">
                Actividad
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-tinta)]">
                Umbral de identificación
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-tinta)]">
                Umbral de aviso
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--color-tinta)]">
                Se mide
              </th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map(({ regla, actividad }) => (
              <tr
                key={regla.id}
                className="border-b border-[var(--color-borde)] last:border-b-0 align-top"
              >
                <th scope="row" className="px-4 py-4 font-medium">
                  <Link
                    href={`/actividades-vulnerables/${actividad.slug}`}
                    className="text-[var(--color-tinta)] underline decoration-[var(--color-borde-fuerte)] underline-offset-4 hover:decoration-[var(--color-petroleo)]"
                  >
                    {actividad.nombreCorto}
                  </Link>
                  <span className="mt-0.5 block text-xs font-normal text-[var(--color-tinta-tenue)]">
                    Fracción {actividad.fraccion}
                  </span>
                </th>
                <td className="px-4 py-4">
                  <EspecificacionCelda especificacion={regla.identificacion} compacto />
                </td>
                <td className="px-4 py-4">
                  <EspecificacionCelda especificacion={regla.aviso} />
                </td>
                <td className="px-4 py-4 text-[var(--color-tinta-suave)]">
                  {ETIQUETA_PERIODICIDAD[regla.periodicidad]}
                  {regla.acumulacion.aplica && (
                    <span className="mt-0.5 block text-xs text-[var(--color-tinta-tenue)]">
                      Acumula {regla.acumulacion.ventanaMeses} meses por cliente
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablaEnvoltura>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <SelloProcedencia procedencia={UMA.procedencia} fuentes={MAPA_FUENTES} />
        <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
          La conversión a pesos usa la UMA diaria de {UMA.anio}, vigente desde el{' '}
          {formatearFechaLarga(UMA.vigencia.desde)}. Si tu operación es anterior a esa fecha, la
          cifra correcta es otra: la calculadora aplica la UMA del periodo de tu operación y te
          dice qué año usó. Los umbrales del artículo 17 se miden sin IVA; el límite de efectivo
          del artículo 32, con IVA.
        </p>
      </div>
    </Seccion>
  );
}
