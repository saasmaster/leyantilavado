import type { Metadata } from 'next';
import Link from 'next/link';
import { convertirUMA, datos } from '@leyantilavado/rules-engine';
import { formatearMXN } from '@leyantilavado/types';
import { Insignia, Nota, SelloProcedencia, TablaEnvoltura } from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  ListaConVinetas,
  Migas,
  PreguntasFrecuentes,
  Seccion,
} from '@/components/contenido';
import { jsonLdArticulo, jsonLdConjuntoDatos } from '@/components/contenido/JsonLd';
import { REVISION_VIGENTE } from '@/content/autores';
import {
  COMPARATIVA_IVA,
  FAQ_EFECTIVO,
  OBLIGACION_FEDATARIOS,
  PUNTOS_CLAVE_EFECTIVO,
} from '@/content/efectivo';
import { construirMetadata, jsonLdFAQ, jsonLdMigaDePan } from '@/lib/sitio';
import { ImagenEditorial } from '@/components/contenido/ImagenEditorial';
import efectivoPesos from '../../../public/img/editorial/efectivo-pesos.webp';

const RUTA = '/limites-efectivo';

/**
 * Las reglas del motor están capturadas en el mismo orden en que el art. 32
 * enumera sus fracciones. La numeración romana es presentación, no un dato
 * legal nuevo: se deriva de la posición para no reescribirla a mano en cada
 * fila y para que agregar una fracción no obligue a renumerar el componente.
 */
const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const;

export const metadata: Metadata = construirMetadata({
  titulo: 'Límites de efectivo del art. 32: los ocho supuestos',
  descripcion:
    'Cuánto efectivo se puede recibir por un inmueble, un vehículo, joyería, arte o una renta, y la diferencia entre medir con IVA (art. 32) y sin IVA.',
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: REVISION_VIGENTE,
  actualizadoEn: REVISION_VIGENTE,
});

const INDICE = [
  { id: 'que-prohibe', titulo: 'Qué prohíbe exactamente el art. 32' },
  { id: 'con-iva', titulo: 'Con IVA o sin IVA: la diferencia clave' },
  { id: 'supuestos', titulo: 'Los ocho supuestos y sus límites' },
  { id: 'consignacion', titulo: 'La discrepancia de la consignación de pago' },
  { id: 'fedatarios', titulo: 'La obligación extra de los fedatarios' },
  { id: 'sancion', titulo: 'Qué cuesta rebasarlo' },
  { id: 'preguntas', titulo: 'Preguntas frecuentes' },
];

export default function PaginaLimitesEfectivo() {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Límites de efectivo', ruta: RUTA },
  ];

  const reglas = datos.REGLAS_EFECTIVO;
  const conDiscrepancia = reglas.filter((r) => r.discrepanciaOficial);
  const sancionEfectivo = datos.SANCIONES.find((s) => s.id === 'art54-III--53-VII');
  const procedencia = reglas[0]?.procedencia;

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: 'Restricciones al uso de efectivo y metales preciosos (art. 32 LFPIORPI)',
          descripcion:
            'Los ocho supuestos del art. 32, sus límites en UMA y en pesos, y la diferencia de base con los umbrales del art. 17.',
          ruta: RUTA,
          publicadoEn: REVISION_VIGENTE,
          actualizadoEn: REVISION_VIGENTE,
          seccion: 'Efectivo',
        })}
      />
      <JsonLd
        datos={jsonLdConjuntoDatos({
          nombre: 'Límites al uso de efectivo del artículo 32 de la LFPIORPI',
          descripcion: `Los ${reglas.length} supuestos del art. 32 con su límite en UMA, su periodicidad y las discrepancias entre fuentes oficiales.`,
          ruta: RUTA,
          actualizadoEn: REVISION_VIGENTE,
        })}
      />
      <JsonLd datos={jsonLdFAQ(FAQ_EFECTIVO.map((f) => ({ ...f })))} />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo="Límites al uso de efectivo y metales preciosos"
        etiquetas={[
          { texto: 'Art. 32 LFPIORPI', tono: 'marino' },
          { texto: `${reglas.length} supuestos`, tono: 'petroleo' },
          { texto: 'Se mide CON IVA', tono: 'rojo' },
        ]}
        respuestaDirecta="El art. 32 no es un umbral de reporte: es una prohibición. Por encima del límite de cada supuesto no se puede liquidar ni aceptar el pago en efectivo, divisas o metales preciosos, aunque el pago se haga por conducto de una entidad financiera. Y se mide con IVA incluido, a diferencia de los umbrales de aviso del art. 17, que se miden sin IVA."
        entradilla="Presentar el aviso no vuelve lícito un pago en efectivo por encima del límite. Son dos controles independientes con dos consecuencias distintas."
      />

      <ImagenEditorial
        imagen={efectivoPesos}
        alt="Billetes de cien y quinientos pesos y varias monedas sobre un plato de cerámica."
        pie="El artículo 32 no pide avisar: prohíbe liquidar en efectivo por encima del límite. Se mide con IVA incluido."
      />

      <IndiceContenidos entradas={INDICE} />

      <Seccion id="que-prohibe" titulo="Qué prohíbe exactamente el art. 32">
        <ListaConVinetas items={PUNTOS_CLAVE_EFECTIVO} />
      </Seccion>

      <Seccion
        id="con-iva"
        titulo={COMPARATIVA_IVA.titulo}
        descripcion="Es el hueco de contenido más grande del mercado y la causa de la mitad de los errores en operaciones grandes."
      >
        <p className="prosa text-[var(--color-tinta-suave)]">{COMPARATIVA_IVA.entrada}</p>

        <TablaEnvoltura etiqueta="Límites de uso de efectivo por operación" className="mt-5">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Comparación entre los umbrales del art. 17 y el límite de efectivo del art. 32.
            </caption>
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Eje de comparación
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Umbrales del art. 17
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Límite del art. 32
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARATIVA_IVA.filas.map((f) => (
                <tr key={f.eje} className="border-t border-[var(--color-borde)] align-top">
                  <th scope="row" className="px-4 py-3 font-medium">
                    {f.eje}
                  </th>
                  <td className="px-4 py-3 text-[var(--color-tinta-suave)]">{f.art17}</td>
                  <td className="px-4 py-3 text-[var(--color-tinta-suave)]">{f.art32}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <Nota tono="riesgo" className="mt-5" titulo="La consecuencia práctica">
          <p>{COMPARATIVA_IVA.cierre}</p>
        </Nota>
      </Seccion>

      <Seccion
        id="supuestos"
        titulo="Los ocho supuestos y sus límites"
        descripcion={`Convertidos a pesos con la UMA vigente al ${REVISION_VIGENTE}. Recuerda que el límite se compara contra el monto pagado en efectivo, no contra el valor total de la operación.`}
      >
        <TablaEnvoltura etiqueta="Equivalencia en pesos de cada límite">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Supuestos del art. 32 con su límite en UMA y su equivalente en pesos.
            </caption>
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                  Fracción
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Supuesto
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Límite
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Actividades relacionadas
                </th>
              </tr>
            </thead>
            <tbody>
              {reglas.map((r, i) => {
                const conversion = convertirUMA(r.limiteUMA, REVISION_VIGENTE);
                return (
                  <tr key={r.id} className="border-t border-[var(--color-borde)] align-top">
                    <th scope="row" className="cifra whitespace-nowrap px-4 py-4 font-medium">
                      {ROMANOS[i] ?? String(i + 1)}
                    </th>
                    <td className="px-4 py-4">
                      <p className="font-medium text-[var(--color-tinta)]">{r.nombre}</p>
                      <p className="mt-1 text-xs text-[var(--color-tinta-suave)]">
                        {r.descripcion}
                      </p>
                      {r.discrepanciaOficial && (
                        <p className="mt-2">
                          <Insignia tono="ambar">Dos fuentes oficiales no coinciden</Insignia>
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {r.discrepanciaOficial ? (
                        <span className="text-sm text-[var(--color-ambar)]">
                          Depende de la versión: ver abajo
                        </span>
                      ) : (
                        <>
                          <span className="cifra block font-semibold">
                            {r.limiteUMA.toLocaleString('es-MX')} UMA
                          </span>
                          <span className="cifra block text-[var(--color-tinta-suave)]">
                            {formatearMXN(conversion.equivalentePesos)}
                          </span>
                          {r.periodicidad === 'mensual' && (
                            <span className="block text-xs text-[var(--color-tinta-tenue)]">
                              al mes
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {r.actividades.length === 0 ? (
                        <span className="text-[var(--color-tinta-tenue)]">
                          Transversal a los supuestos anteriores
                        </span>
                      ) : (
                        <ul className="flex flex-wrap gap-1.5">
                          {r.actividades.map((slug) => {
                            const a = datos.ACTIVIDADES_POR_SLUG[slug];
                            return (
                              <li key={slug}>
                                <Link
                                  href={`/actividades-vulnerables/${slug}`}
                                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                                >
                                  {a?.nombreCorto ?? slug}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TablaEnvoltura>
      </Seccion>

      <Seccion
        id="consignacion"
        titulo="La discrepancia de la consignación de pago"
        descripcion="Dos fuentes oficiales dicen cosas distintas. Mostramos ambas y no elegimos."
      >
        {conDiscrepancia.length === 0 ? (
          <p className="text-[var(--color-tinta-suave)]">
            No hay discrepancias registradas en este momento.
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
            {conDiscrepancia.map((r) => (
              <li
                key={r.id}
                className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-ambar)] bg-[var(--color-ambar-tenue)] p-5"
              >
                <h3 className="font-semibold">{r.nombre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {r.discrepanciaOficial?.descripcion}
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[var(--radius-control)] bg-[var(--color-superficie)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                      Versión del SAT
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">{r.discrepanciaOficial?.segunSAT}</p>
                  </div>
                  <div className="rounded-[var(--radius-control)] bg-[var(--color-superficie)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                      Versión del texto de la ley
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">{r.discrepanciaOficial?.segunLey}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--color-tinta-suave)]">
                  Mientras la autoridad no lo aclare, nuestras herramientas no devuelven un
                  resultado definitivo para este supuesto. Si tu operación cae aquí, lo prudente es
                  medirte contra el límite más estricto y documentar el criterio aplicado.
                </p>
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      <Seccion id="fedatarios" titulo={OBLIGACION_FEDATARIOS.titulo}>
        <p className="prosa text-[var(--color-tinta-suave)]">{OBLIGACION_FEDATARIOS.texto}</p>
        <p className="mt-3 text-sm text-[var(--color-tinta-tenue)]">
          {OBLIGACION_FEDATARIOS.disposicion} · {OBLIGACION_FEDATARIOS.sancion}
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/actividades-vulnerables/fe-publica-notarios"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            Ver el régimen completo de los notarios
          </Link>
        </p>
      </Seccion>

      <Seccion id="sancion" titulo="Qué cuesta rebasarlo">
        {sancionEfectivo ? (
          <div className="rounded-[var(--radius-card)] border-[color-mix(in_srgb,var(--color-rojo)_32%,transparent)] p-5">
            <p className="font-medium">{sancionEfectivo.supuesto}</p>
            <p className="mt-3">
              <span className="cifra text-lg font-semibold">
                {sancionEfectivo.minUMA.toLocaleString('es-MX')} a{' '}
                {sancionEfectivo.maxUMA.toLocaleString('es-MX')} UMA
              </span>
              <span className="cifra ml-2 text-[var(--color-tinta-suave)]">
                {formatearMXN(convertirUMA(sancionEfectivo.minUMA, REVISION_VIGENTE).equivalentePesos)}{' '}
                a{' '}
                {formatearMXN(convertirUMA(sancionEfectivo.maxUMA, REVISION_VIGENTE).equivalentePesos)}
              </span>
            </p>
            {sancionEfectivo.alternativaPorcentaje && (
              <p className="mt-2 text-sm text-[var(--color-tinta-suave)]">
                O del {sancionEfectivo.alternativaPorcentaje.minPct}% al{' '}
                {sancionEfectivo.alternativaPorcentaje.maxPct}% del valor del acto u operación
                cuando sea cuantificable en dinero. Se aplica la cantidad que resulte mayor.
              </p>
            )}
            {sancionEfectivo.notas && (
              <p className="mt-2 text-sm text-[var(--color-tinta-tenue)]">{sancionEfectivo.notas}</p>
            )}
            <p className="mt-3 text-sm">
              <Link
                href="/multas"
                className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
              >
                Ver el régimen sancionador completo y los escenarios de autocorrección
              </Link>
            </p>
          </div>
        ) : (
          <p className="text-[var(--color-tinta-suave)]">
            La regla sancionadora correspondiente requiere revisión editorial.
          </p>
        )}
      </Seccion>

      <Seccion id="preguntas" titulo="Preguntas frecuentes">
        <PreguntasFrecuentes preguntas={FAQ_EFECTIVO} id="lista-preguntas" />
      </Seccion>

      {procedencia && (
        <SelloProcedencia className="mt-10" procedencia={procedencia} fuentes={datos.FUENTES_POR_ID} />
      )}

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Herramientas',
            enlaces: [
              { href: '/herramientas/limites-efectivo', etiqueta: 'Verifica antes de cerrar la operación' },
              { href: '/herramientas/calculadora-umbrales', etiqueta: 'Calculadora de umbrales' },
              { href: '/herramientas/calculadora-multas', etiqueta: 'Estimador de multas' },
            ],
          },
          {
            titulo: 'Contenido relacionado',
            enlaces: [
              { href: '/umbrales', etiqueta: 'Umbrales del art. 17' },
              { href: '/actividades-vulnerables', etiqueta: 'Actividades vulnerables' },
              { href: '/multas', etiqueta: 'Infracciones y multas' },
            ],
          },
          {
            titulo: 'Mantente al día',
            enlaces: [
              { href: '/reforma-ley-antilavado-2026', etiqueta: 'Qué cambió en el art. 32' },
              { href: '/actualizaciones', etiqueta: 'Bitácora de cambios' },
              { href: '/glosario#restriccion-de-efectivo', etiqueta: 'Definición en el glosario' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
