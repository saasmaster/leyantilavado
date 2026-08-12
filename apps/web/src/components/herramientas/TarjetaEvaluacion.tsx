import Link from 'next/link';
import { formatearMXN } from '@leyantilavado/types';
import type { EvaluacionUmbral, ResultadoEvaluacion } from '@leyantilavado/types';
import { datos } from '@leyantilavado/rules-engine';
import {
  IndicadorConclusion,
  Insignia,
  Nota,
  SelloProcedencia,
  SupuestosYFaltantes,
  TablaEnvoltura,
} from '@leyantilavado/ui';
import { Advertencias } from './Advertencias';

const FUENTES_ENLAZABLES = Object.fromEntries(
  datos.FUENTES.map((f) => [f.id, { nombre: f.nombre, url: f.url }]),
);

const ETIQUETA_PERIODICIDAD: Record<ResultadoEvaluacion['periodicidad'], string> = {
  operacion: 'Por operación',
  mensual: 'Mensual acumulado',
  semestral: 'Semestral',
  anual: 'Anual',
};

/**
 * Fila de un umbral.
 *
 * Maneja los seis casos de `EspecificacionUmbral`. Cuando la especificación no
 * es un número (`siempre`, `nunca`, `variable`, `requiere_revision`) NO se
 * inventa una cifra: se muestra la etiqueta correspondiente y la explicación
 * que trae el motor.
 */
function FilaUmbral({ etiqueta, valor }: { etiqueta: string; valor: EvaluacionUmbral }) {
  const spec = valor.especificacion;

  const cifra = (() => {
    switch (spec.tipo) {
      case 'siempre':
        return 'Sin umbral: aplica siempre';
      case 'nunca':
        return 'No aplica en este supuesto';
      case 'requiere_revision':
        return 'Requiere revisión editorial';
      case 'variable':
        return valor.conversion
          ? `${valor.conversion.uma.toLocaleString('es-MX')} UMA`
          : 'Depende del supuesto';
      case 'uma':
      case 'monto_o_comision':
        return valor.conversion
          ? `${valor.conversion.uma.toLocaleString('es-MX')} UMA`
          : 'Sin conversión';
    }
  })();

  return (
    <tr className="border-t border-[var(--color-borde)] align-top">
      <th scope="row" className="p-3 text-left font-medium text-[var(--color-tinta)]">
        {etiqueta}
      </th>
      <td className="cifra p-3 whitespace-nowrap text-[var(--color-tinta)]">{cifra}</td>
      <td className="cifra p-3 whitespace-nowrap text-[var(--color-tinta)]">
        {valor.conversion ? formatearMXN(valor.conversion.equivalentePesos) : '—'}
      </td>
      <td className="p-3">
        <Insignia tono={valor.alcanzado ? 'rojo' : 'verde'}>
          {valor.alcanzado ? 'Alcanzado' : 'No alcanzado'}
        </Insignia>
      </td>
      <td className="p-3 text-sm text-[var(--color-tinta-suave)]">{valor.explicacion}</td>
    </tr>
  );
}

export function TarjetaEvaluacion({
  resultado,
  compacta,
}: {
  resultado: ResultadoEvaluacion;
  compacta?: boolean;
}) {
  const { identificacion, aviso, efectivo, acumulacion } = resultado;

  return (
    <div className="imprimible flex flex-col gap-5">
      <IndicadorConclusion conclusion={resultado.conclusion} confianza={resultado.confianza}>
        <p className="mt-3 text-sm text-[var(--color-tinta-suave)]">
          <span className="font-medium text-[var(--color-tinta)]">
            {resultado.nombreActividad}
          </span>{' '}
          · Art. 17, fracción {resultado.fraccion}
          {resultado.subtipo ? ` · subtipo “${resultado.subtipo}”` : ''} ·{' '}
          {ETIQUETA_PERIODICIDAD[resultado.periodicidad]}
        </p>
      </IndicadorConclusion>

      <TablaEnvoltura>
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <caption className="sr-only">
            Umbrales de identificación y de aviso aplicables a la operación capturada
          </caption>
          <thead className="bg-[var(--color-marfil-hondo)]">
            <tr>
              <th scope="col" className="p-3 text-left font-semibold">
                Obligación
              </th>
              <th scope="col" className="p-3 text-left font-semibold">
                Umbral
              </th>
              <th scope="col" className="p-3 text-left font-semibold">
                Equivalente en pesos
              </th>
              <th scope="col" className="p-3 text-left font-semibold">
                Estado
              </th>
              <th scope="col" className="p-3 text-left font-semibold">
                Por qué
              </th>
            </tr>
          </thead>
          <tbody>
            <FilaUmbral etiqueta="Identificar al cliente" valor={identificacion} />
            <FilaUmbral etiqueta="Presentar aviso" valor={aviso} />
          </tbody>
        </table>
      </TablaEnvoltura>

      {efectivo && (
        <Nota tono={efectivo.excede ? 'riesgo' : 'info'} titulo="Límite de efectivo (art. 32)">
          <p>{efectivo.explicacion}</p>
          {efectivo.limite && (
            <p className="cifra mt-2 text-sm">
              Límite: {efectivo.limite.uma.toLocaleString('es-MX')} UMA ={' '}
              {formatearMXN(efectivo.limite.equivalentePesos)} · En efectivo:{' '}
              {formatearMXN(efectivo.montoEfectivo)}
            </p>
          )}
        </Nota>
      )}

      {acumulacion && (
        <Nota
          tono={acumulacion.alcanzado ? 'riesgo' : 'info'}
          titulo="Acumulación de seis meses"
        >
          <p>{acumulacion.explicacion}</p>
        </Nota>
      )}

      <Advertencias advertencias={resultado.advertencias} />

      {resultado.obligacionesInmediatas.length > 0 && (
        <section className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4">
          <h4 className="text-sm font-semibold text-[var(--color-tinta)]">
            Obligaciones que se activan con este resultado
          </h4>
          <ul className="mt-2 flex flex-col gap-2">
            {resultado.obligacionesInmediatas.map((slug) => {
              const o = datos.OBLIGACIONES_POR_SLUG[slug];
              return (
                <li key={slug} className="text-sm text-[var(--color-tinta-suave)]">
                  <Link
                    href={`/obligaciones/${slug}`}
                    className="font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                  >
                    {o?.titulo ?? slug}
                  </Link>
                  {o?.resumen ? <span> — {o.resumen}</span> : null}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!compacta && (
        <SupuestosYFaltantes
          supuestos={resultado.supuestos}
          informacionFaltante={resultado.informacionFaltante}
        />
      )}

      <SelloProcedencia procedencia={resultado.procedencia} fuentes={FUENTES_ENLAZABLES} />

      <p className="text-xs text-[var(--color-tinta-tenue)]">
        Versión del corpus legal usada: {resultado.versionLegal}.
      </p>
    </div>
  );
}
