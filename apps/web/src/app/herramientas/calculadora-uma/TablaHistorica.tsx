import { formatearMXN } from '@leyantilavado/types';
import { datos, derivadosUMA, formatearFechaCorta } from '@leyantilavado/rules-engine';
import { Insignia, SelloProcedencia, TablaEnvoltura } from '@leyantilavado/ui';

const FUENTES_ENLAZABLES = Object.fromEntries(
  datos.FUENTES.map((f) => [f.id, { nombre: f.nombre, url: f.url }]),
);

/**
 * Tabla histórica de la UMA. Se renderiza en el servidor: es contenido
 * editorial indexable, no un resultado de cálculo del usuario.
 */
export function TablaHistorica() {
  const filas = [...datos.VALORES_UMA].sort((a, b) => b.anio - a.anio);

  return (
    <div className="flex flex-col gap-4">
      <TablaEnvoltura etiqueta="Valores históricos de la UMA por año">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <caption className="sr-only">
            Valores diario, mensual y anual de la UMA por año, con su periodo de vigencia
          </caption>
          <thead className="bg-[var(--color-marfil-hondo)]">
            <tr>
              <th scope="col" className="p-3 text-left font-semibold">
                Año
              </th>
              <th scope="col" className="p-3 text-left font-semibold">
                Diaria
              </th>
              <th scope="col" className="p-3 text-left font-semibold">
                Mensual
              </th>
              <th scope="col" className="p-3 text-left font-semibold">
                Anual
              </th>
              <th scope="col" className="p-3 text-left font-semibold">
                Vigencia
              </th>
              <th scope="col" className="p-3 text-left font-semibold">
                Verificación
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((v) => {
              const d = derivadosUMA(v);
              const verificado = v.procedencia.verificacion === 'oficial_verificado';
              return (
                <tr key={v.anio} className="border-t border-[var(--color-borde)]">
                  <th scope="row" className="cifra p-3 text-left font-semibold">
                    {v.anio}
                  </th>
                  <td className="cifra p-3 whitespace-nowrap">{formatearMXN(d.diaria)}</td>
                  <td className="cifra p-3 whitespace-nowrap">{formatearMXN(d.mensual)}</td>
                  <td className="cifra p-3 whitespace-nowrap">{formatearMXN(d.anual)}</td>
                  <td className="p-3 whitespace-nowrap text-[var(--color-tinta-suave)]">
                    {formatearFechaCorta(v.vigencia.desde)} –{' '}
                    {v.vigencia.hasta ? formatearFechaCorta(v.vigencia.hasta) : 'vigente'}
                  </td>
                  <td className="p-3">
                    <Insignia tono={verificado ? 'verde' : 'ambar'}>
                      {verificado ? 'Verificado en fuente oficial' : 'Pendiente de contraste'}
                    </Insignia>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TablaEnvoltura>

      <p className="text-sm text-[var(--color-tinta-suave)]">
        Fíjate en la columna de vigencia: ningún renglón empieza el 1 de enero. Cada valor rige del
        1 de febrero de su año al 31 de enero del siguiente. Ese desfase de un mes es el que rompe
        las tablas tituladas “umbrales del año”.
      </p>

      <SelloProcedencia
        procedencia={datos.UMA_VIGENTE_MAS_RECIENTE.procedencia}
        fuentes={FUENTES_ENLAZABLES}
      />
    </div>
  );
}
