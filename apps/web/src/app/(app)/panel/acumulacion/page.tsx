import { formatearMXN, multiplicar, type Operacion } from '@leyantilavado/types';
import {
  convertirUMA,
  datos,
  dentroDeVigencia,
  evaluarAcumulacion,
  formatearFechaCorta,
  formatearFechaLarga,
  hayUMAPara,
  restarMeses,
} from '@leyantilavado/rules-engine';
import { Insignia, Nota, TablaEnvoltura, Tarjeta, TarjetaCuerpo, TarjetaTitulo } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { EstadoConsulta } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { listar } from '@/lib/app/consultas';
import { requerirPermiso } from '@/lib/auth/sesion';
import { fechaDeHoy } from '@/lib/app/fecha';

interface FilaRegla {
  id: string;
  threshold_rule_id: string | null;
  applies: boolean;
  window_months: number;
  group_by: string[] | null;
  note: string | null;
  author_id: string | null;
  version: number;
  activated_at: string | null;
  reason: string | null;
  source_ids: string[] | null;
  test_result: unknown;
  is_active: boolean;
}

/**
 * Ejemplo del mecanismo, calculado con el motor.
 *
 * Los importes NO son números escritos a mano: salen del umbral de aviso de la
 * regla elegida, convertido a pesos con la UMA vigente en la fecha de
 * referencia. Se etiqueta como ejemplo porque las dos operaciones son
 * ilustrativas, no datos de la organización.
 */
function construirEjemplo(hoy: string) {
  if (!hayUMAPara(hoy)) return null;

  const regla = datos.UMBRALES_PUBLICADOS.find(
    (r) => r.acumulacion.aplica && r.aviso.tipo === 'uma' && dentroDeVigencia(hoy, r.vigencia),
  );
  if (!regla || regla.aviso.tipo !== 'uma') return null;

  const actividad = datos.ACTIVIDADES.find((a) => a.slug === regla.actividad);
  const umbral = convertirUMA(regla.aviso.uma, hoy);
  // Dos operaciones de 60% del umbral: ninguna lo alcanza sola, juntas sí.
  const monto = multiplicar(umbral.equivalentePesos, 0.6);
  const fechaPrimera = restarMeses(hoy, Math.max(1, regla.acumulacion.ventanaMeses - 2));

  const base = {
    actividad: regla.actividad,
    monto,
    medioPago: 'transferencia' as const,
    clienteId: 'cliente-de-ejemplo',
    ...(regla.subtipo ? { subtipo: regla.subtipo } : {}),
  };
  const primera: Operacion = { id: 'ejemplo-1', fecha: fechaPrimera, ...base };
  const segunda: Operacion = { id: 'ejemplo-2', fecha: hoy, ...base };

  return {
    regla,
    nombreActividad: actividad?.nombreCorto ?? regla.actividad,
    fraccion: actividad?.fraccion ?? '',
    umbral,
    monto,
    resultado: evaluarAcumulacion({
      operacionActual: segunda,
      historial: [primera, segunda],
      regla,
    }),
  };
}

export default async function PaginaAcumulacion() {
  const contexto = await requerirPermiso('operaciones.ver', '/panel/acumulacion');
  const hoy = await fechaDeHoy();
  const ejemplo = construirEjemplo(hoy);

  const reglas = await listar<FilaRegla>('accumulation_rules', {
    organizacionId: contexto.organizacion?.organizacionId ?? null,
    ordenarPor: 'version',
  });

  const ventanas = [
    ...new Set(datos.UMBRALES_PUBLICADOS.filter((r) => r.acumulacion.aplica).map((r) => r.acumulacion.ventanaMeses)),
  ].sort((a, b) => a - b);
  const agrupaciones = [
    ...new Set(datos.UMBRALES_PUBLICADOS.flatMap((r) => (r.acumulacion.aplica ? r.acumulacion.agrupaPor : []))),
  ];

  return (
    <>
      <EncabezadoSeccion
        titulo="Reglas de acumulación"
        descripcion="La regla antifraccionamiento: varias operaciones pequeñas del mismo cliente pueden sumar hasta alcanzar el umbral de aviso. Aquí ves cómo se calcula y qué reglas activó tu organización."
      />

      <Seccion titulo="Cómo funciona la ventana móvil">
        <Tarjeta>
          <TarjetaCuerpo className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-[var(--color-tinta)]">
              La ventana es <strong>móvil</strong>, no un trimestre ni un semestre natural: desde la
              fecha de cada operación se mira hacia atrás{' '}
              {ventanas.length === 1
                ? `${ventanas[0]} meses`
                : `${ventanas.join(' o ')} meses, según la actividad`}
              , tomados del corpus legal cargado. Dos operaciones separadas por más que esa ventana
              no se suman entre sí, aunque caigan en el mismo año.
            </p>
            <p className="text-sm leading-relaxed text-[var(--color-tinta)]">
              La suma se hace agrupando por {agrupaciones.join(' + ')}: dos compras del mismo
              cliente, una de joyería y otra de un vehículo, no se acumulan una con otra.
            </p>
            <p className="text-sm text-[var(--color-tinta-suave)]">
              Hoy es {formatearFechaLarga(hoy)}, así que una operación de hoy arrastra lo ocurrido
              desde el{' '}
              {formatearFechaLarga(restarMeses(hoy, ventanas[0] ?? 6))} para las actividades con
              ventana de {ventanas[0] ?? 6} meses.
            </p>
          </TarjetaCuerpo>
        </Tarjeta>
      </Seccion>

      <Seccion
        titulo="Ejemplo del cálculo"
        descripcion="Dos operaciones inventadas para mostrar el mecanismo. No son datos de tu organización."
      >
        {!ejemplo ? (
          <Nota tono="riesgo" titulo="Requiere revisión editorial">
            <p>
              No pudimos construir el ejemplo: falta el valor de la UMA para la fecha de hoy o no
              hay una regla publicada con umbral de aviso en UMA y acumulación aplicable. Preferimos
              no ilustrarlo con números inventados.
            </p>
          </Nota>
        ) : (
          <Tarjeta>
            <TarjetaCuerpo className="flex flex-col gap-3">
              <TarjetaTitulo className="text-base">
                {ejemplo.fraccion ? `${ejemplo.fraccion} — ` : ''}
                {ejemplo.nombreActividad}
              </TarjetaTitulo>
              <ul className="flex flex-col gap-1.5 text-sm text-[var(--color-tinta)]">
                {ejemplo.resultado.operaciones.map((o) => (
                  <li key={o.operacion.id} className="flex flex-wrap items-baseline gap-2">
                    <span className="cifra text-[var(--color-tinta-suave)]">
                      {formatearFechaCorta(o.operacion.fecha)}
                    </span>
                    <span className="cifra font-medium">{formatearMXN(o.operacion.monto)}</span>
                    <span className="text-[var(--color-tinta-tenue)]">
                      acumulado: <span className="cifra">{formatearMXN(o.acumuladoHasta)}</span>
                    </span>
                    {o.disparaAviso && <Insignia tono="rojo">Aquí se alcanza el umbral</Insignia>}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-relaxed text-[var(--color-tinta)]">
                {ejemplo.resultado.explicacion}
              </p>
              <p className="text-xs text-[var(--color-tinta-tenue)]">
                Umbral de aviso usado: {ejemplo.umbral.uma.toLocaleString('es-MX')} UMA de{' '}
                {ejemplo.umbral.anioUMA} ={' '}
                <span className="cifra">{formatearMXN(ejemplo.umbral.equivalentePesos)}</span>. Cada
                operación del ejemplo vale el 60% de ese umbral, calculado por el motor: ninguna lo
                alcanza sola.
              </p>
            </TarjetaCuerpo>
          </Tarjeta>
        )}
      </Seccion>

      <Seccion
        titulo="Reglas activadas por tu organización"
        descripcion="Un mecanismo automatizado sin trazabilidad no es auditable: cada regla guarda quién la activó, con qué versión, cuándo, por qué, con qué fuentes y con qué resultado de pruebas."
      >
        {reglas.estado !== 'ok' || reglas.filas.length === 0 ? (
          <EstadoConsulta
            resultado={reglas}
            vacioTitulo="Sin reglas de acumulación propias"
            vacioDescripcion="Mientras no registres una regla propia, la acumulación se calcula con la ventana y la agrupación del corpus legal que se explican arriba."
          />
        ) : (
          <TablaEnvoltura aria-label="Reglas de acumulación de la organización">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                  {[
                    'Regla de umbral',
                    'Versión',
                    'Estado',
                    'Ventana',
                    'Agrupa por',
                    'Activada',
                    'Autor',
                    'Motivo',
                    'Fuentes',
                    'Pruebas',
                  ].map((t) => (
                    <th
                      key={t}
                      scope="col"
                      className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reglas.filas.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--color-borde)] last:border-0">
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {r.threshold_rule_id ?? '—'}
                    </td>
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">v{r.version}</td>
                    <td className="px-3 py-2.5 align-top">
                      <Insignia tono={r.is_active && r.applies ? 'verde' : 'neutro'}>
                        {r.is_active ? (r.applies ? 'Activa' : 'Activa sin aplicar') : 'Inactiva'}
                      </Insignia>
                    </td>
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {r.window_months} meses
                    </td>
                    <td className="px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {(r.group_by ?? []).join(' + ') || '—'}
                    </td>
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {r.activated_at ? (
                        formatearFechaCorta(r.activated_at.slice(0, 10))
                      ) : (
                        <span className="text-[var(--color-tinta-tenue)]">Sin activar</span>
                      )}
                    </td>
                    <td className="cifra px-3 py-2.5 align-top text-xs text-[var(--color-tinta-suave)]">
                      {r.author_id ?? <span className="text-[var(--color-rojo)]">Sin autor</span>}
                    </td>
                    <td className="max-w-64 px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {r.reason ?? <span className="text-[var(--color-rojo)]">Sin motivo registrado</span>}
                    </td>
                    <td className="px-3 py-2.5 align-top text-xs text-[var(--color-tinta)]">
                      {(r.source_ids ?? []).length === 0 ? (
                        <span className="text-[var(--color-rojo)]">Sin fuente</span>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {(r.source_ids ?? []).map((id) => {
                            const fuente = datos.FUENTES_POR_ID[id];
                            return (
                              <li key={id}>
                                {fuente ? (
                                  <a
                                    href={fuente.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cursor-pointer text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                                  >
                                    {fuente.nombre}
                                  </a>
                                ) : (
                                  <span className="cifra">{id}</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </td>
                    <td className="max-w-64 px-3 py-2.5 align-top text-xs text-[var(--color-tinta)]">
                      {r.test_result === null || r.test_result === undefined ? (
                        <span className="text-[var(--color-rojo)]">Sin pruebas registradas</span>
                      ) : (
                        <code className="cifra break-all">{JSON.stringify(r.test_result)}</code>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaEnvoltura>
        )}
      </Seccion>

      <Nota tono="info" titulo="Por qué se guarda tanto detalle de cada regla">
        <p>
          Una regla de acumulación decide si una operación dispara o no una obligación de aviso. Si
          alguien pregunta meses después por qué el sistema concluyó lo que concluyó, la respuesta
          tiene que estar en la fila: quién la activó, cuándo, con qué versión, con qué motivo, con
          qué fuentes y con qué pruebas. Las celdas en rojo señalan justo lo que faltaría para
          poder responder esa pregunta.
        </p>
      </Nota>

      <AvisoNoEsCumplimiento />
    </>
  );
}
