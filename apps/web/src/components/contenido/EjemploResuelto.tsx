import Link from 'next/link';
import { evaluarOperacion } from '@leyantilavado/rules-engine';
import { formatearMXN, pesosACentavos, type ActividadSlug, type Operacion } from '@leyantilavado/types';
import { IndicadorConclusion, Insignia, Nota, SupuestosYFaltantes } from '@leyantilavado/ui';
import type { EjemploResuelto as DatosEjemplo } from '@/content/tipos';

/**
 * Ejemplo práctico resuelto.
 *
 * No trae el resultado escrito: trae los datos del caso y llama al mismo motor
 * que usan las calculadoras. Si un umbral cambia, el ejemplo cambia con él, y
 * si el ejemplo dejara de tener sentido, el resultado lo delataría de
 * inmediato en lugar de quedarse mintiendo en una página.
 */
export function EjemploResueltoBloque({
  ejemplo,
  actividad,
}: {
  ejemplo: DatosEjemplo;
  actividad: ActividadSlug;
}) {
  const operacion: Operacion = {
    id: `ejemplo-${actividad}`,
    fecha: ejemplo.fechaOperacion,
    actividad,
    ...(ejemplo.subtipo ? { subtipo: ejemplo.subtipo } : {}),
    monto: pesosACentavos(ejemplo.montoPesos),
    ...(ejemplo.efectivoPesos ? { montoEfectivo: pesosACentavos(ejemplo.efectivoPesos) } : {}),
    ...(ejemplo.comisionPesos ? { comision: pesosACentavos(ejemplo.comisionPesos) } : {}),
    ...(ejemplo.enRepresentacion !== undefined
      ? { enRepresentacionDelCliente: ejemplo.enRepresentacion }
      : {}),
    ...(ejemplo.montoIndeterminable !== undefined
      ? { montoIndeterminable: ejemplo.montoIndeterminable }
      : {}),
    medioPago: ejemplo.efectivoPesos ? 'mixto' : 'transferencia',
  };

  const resultado = evaluarOperacion(operacion);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-5">
        <p className="font-semibold text-[var(--color-tinta)]">{ejemplo.titulo}</p>
        <p className="mt-2 leading-relaxed text-[var(--color-tinta-suave)]">{ejemplo.contexto}</p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-[var(--color-tinta-tenue)]">Valor de la operación</dt>
            <dd className="cifra text-lg font-semibold">
              {formatearMXN(pesosACentavos(ejemplo.montoPesos))}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-tinta-tenue)]">Fecha de la operación</dt>
            <dd className="cifra text-lg font-semibold">{ejemplo.fechaOperacion}</dd>
          </div>
          {ejemplo.efectivoPesos && (
            <div>
              <dt className="text-xs text-[var(--color-tinta-tenue)]">Liquidado en efectivo</dt>
              <dd className="cifra text-lg font-semibold">
                {formatearMXN(pesosACentavos(ejemplo.efectivoPesos))}
              </dd>
            </div>
          )}
          {ejemplo.comisionPesos && (
            <div>
              <dt className="text-xs text-[var(--color-tinta-tenue)]">Contraprestación cobrada</dt>
              <dd className="cifra text-lg font-semibold">
                {formatearMXN(pesosACentavos(ejemplo.comisionPesos))}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <IndicadorConclusion conclusion={resultado.conclusion} confianza={resultado.confianza} />

      <SupuestosYFaltantes
        supuestos={resultado.supuestos}
        informacionFaltante={resultado.informacionFaltante}
      />

      <dl className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4">
          <dt className="mb-1 flex items-center gap-2 text-sm font-semibold">
            Identificación
            <Insignia tono={resultado.identificacion.alcanzado ? 'rojo' : 'verde'}>
              {resultado.identificacion.alcanzado ? 'Se alcanza' : 'No se alcanza'}
            </Insignia>
          </dt>
          <dd className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
            {resultado.identificacion.explicacion}
          </dd>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4">
          <dt className="mb-1 flex items-center gap-2 text-sm font-semibold">
            Aviso
            <Insignia tono={resultado.aviso.alcanzado ? 'rojo' : 'verde'}>
              {resultado.aviso.alcanzado ? 'Se alcanza' : 'No se alcanza'}
            </Insignia>
          </dt>
          <dd className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
            {resultado.aviso.explicacion}
          </dd>
        </div>
      </dl>

      {resultado.efectivo && (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4">
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
            Límite de efectivo (art. 32)
            <Insignia tono={resultado.efectivo.excede ? 'rojo' : 'verde'}>
              {resultado.efectivo.excede ? 'Se rebasa' : 'Dentro del límite'}
            </Insignia>
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
            {resultado.efectivo.explicacion}
          </p>
        </div>
      )}

      {resultado.advertencias.length > 0 && (
        <ul className="flex flex-col gap-3">
          {resultado.advertencias.map((a) => (
            <li key={a.clave}>
              <Nota tono={a.severidad === 'riesgo' ? 'riesgo' : a.severidad === 'atencion' ? 'atencion' : 'info'}>
                <p>{a.mensaje}</p>
              </Nota>
            </li>
          ))}
        </ul>
      )}

      {ejemplo.notas.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Cómo leer este ejemplo</p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
            {ejemplo.notas.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="text-[var(--color-tinta-tenue)]">Corre tu propio caso:</span>
        <Link
          href="/herramientas/calculadora-umbrales"
          className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
        >
          Calculadora de umbrales
        </Link>
        <span aria-hidden className="text-[var(--color-borde-fuerte)]">·</span>
        <Link
          href="/herramientas/acumulacion-operaciones"
          className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
        >
          Acumulación de seis meses
        </Link>
        <span aria-hidden className="text-[var(--color-borde-fuerte)]">·</span>
        <Link
          href="/herramientas/limites-efectivo"
          className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
        >
          Límites de efectivo
        </Link>
      </div>

      <p className="text-xs text-[var(--color-tinta-tenue)]">
        Ejemplo calculado con la versión {resultado.versionLegal} del corpus legal y la UMA vigente
        en la fecha de la operación. Las cifras del caso son ilustrativas.
      </p>
    </div>
  );
}
