import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { convertirUMA, datos } from '@leyantilavado/rules-engine';
import { formatearMXN, type ActividadSlug } from '@leyantilavado/types';
import { Insignia, Nota, SelloProcedencia, TablaEnvoltura } from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EjemploResueltoBloque,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  ListaConVinetas,
  Migas,
  PreguntasFrecuentes,
  Seccion,
  UmbralVista,
  describirUmbral,
} from '@/components/contenido';
import { jsonLdArticulo } from '@/components/contenido/JsonLd';
import { REVISION_VIGENTE } from '@/content/autores';
import { CONTENIDO_ACTIVIDADES } from '@/content/actividades';
import { construirMetadata, jsonLdFAQ, jsonLdMigaDePan } from '@/lib/sitio';

const BASE = '/actividades-vulnerables';

/**
 * Sin parámetros dinámicos: los slugs válidos son las actividades del corpus legal y no cambian entre
 * despliegues.
 *
 * Sin esto Next acepta CUALQUIER slug, lo renderiza bajo demanda, obtiene la
 * vista de «no encontrado» y la sirve con HTTP 200 — un soft 404. El `noindex`
 * evitaba que se indexara, pero el rastreador gastaba presupuesto creyendo que
 * la página existe. Con `false` el enrutador devuelve un 404 real sin llegar a
 * renderizar.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return datos.ACTIVIDADES.map((a) => ({ slug: a.slug }));
}

function buscar(slug: string) {
  const actividad = datos.ACTIVIDADES.find((a) => a.slug === slug);
  if (!actividad) return null;
  const contenido = CONTENIDO_ACTIVIDADES[actividad.slug];
  if (!contenido) return null;
  return { actividad, contenido };
}

// Next 16: `params` llega como Promise y hay que esperarla.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const encontrado = buscar(slug);
  if (!encontrado) {
    return construirMetadata({
      titulo: 'Actividad no encontrada',
      descripcion: 'La actividad vulnerable solicitada no existe en el catálogo.',
      ruta: `${BASE}/${slug}`,
      noindex: true,
    });
  }
  return construirMetadata({
    titulo: encontrado.contenido.tituloSEO,
    descripcion: encontrado.contenido.descripcionSEO,
    ruta: `${BASE}/${slug}`,
    tipo: 'article',
    publicadoEn: REVISION_VIGENTE,
    actualizadoEn: REVISION_VIGENTE,
  });
}

export default async function PaginaActividad({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const encontrado = buscar(slug);
  if (!encontrado) notFound();

  const { actividad, contenido } = encontrado;
  const ruta = `${BASE}/${slug}`;
  const reglas = datos.UMBRALES.filter((r) => r.actividad === actividad.slug);
  const reglasEfectivo = datos.REGLAS_EFECTIVO.filter((r) =>
    r.actividades.includes(actividad.slug as ActividadSlug),
  );
  const obligaciones = contenido.obligacionesDestacadas
    .map((s) => datos.OBLIGACIONES_POR_SLUG[s])
    .filter((o) => o !== undefined);
  const acumulacion = reglas.find((r) => r.acumulacion.aplica)?.acumulacion;
  const pendiente = Boolean(contenido.sinUmbralPublicado);

  const nombreSubtipo = (subtipo: string | undefined) =>
    subtipo ? actividad.subtipos?.find((s) => s.slug === subtipo)?.nombre ?? subtipo : '—';

  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Actividades vulnerables', ruta: BASE },
    { nombre: actividad.nombreCorto, ruta },
  ];

  const indice = [
    { id: 'a-quien-alcanza', titulo: 'Quién cae y quién no' },
    { id: 'umbrales', titulo: pendiente ? 'Umbrales: qué falta publicar' : 'Umbrales de identificación y aviso' },
    ...(acumulacion ? [{ id: 'acumulacion', titulo: 'Regla de acumulación' }] : []),
    ...(reglasEfectivo.length > 0 ? [{ id: 'efectivo', titulo: 'Límite de uso de efectivo' }] : []),
    { id: 'obligaciones', titulo: 'Obligaciones que genera' },
    ...(contenido.ejemplo ? [{ id: 'ejemplo', titulo: 'Ejemplo práctico resuelto' }] : []),
    { id: 'preguntas', titulo: 'Preguntas frecuentes' },
  ];

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: contenido.tituloSEO,
          descripcion: contenido.descripcionSEO,
          ruta,
          publicadoEn: REVISION_VIGENTE,
          actualizadoEn: REVISION_VIGENTE,
          seccion: 'Actividades vulnerables',
        })}
      />
      <JsonLd
        datos={jsonLdFAQ(
          contenido.faq.map((f) => ({ pregunta: f.pregunta, respuesta: f.respuesta })),
        )}
      />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo={actividad.nombre}
        etiquetas={[
          { texto: `Art. 17, fracción ${actividad.fraccion}`, tono: 'marino' },
          ...(reglas.length > 1
            ? ([{ texto: `${reglas.length} supuestos con regla propia`, tono: 'petroleo' }] as const)
            : []),
          ...(pendiente ? ([{ texto: 'Sin umbral publicado', tono: 'ambar' }] as const) : []),
        ]}
        entradilla={actividad.descripcion}
        respuestaDirecta={contenido.respuestaDirecta}
      />

      <IndiceContenidos entradas={indice} />

      <Seccion
        id="a-quien-alcanza"
        titulo="Quién cae y quién no"
        descripcion="La pregunta que trae casi todo el que llega a esta página."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border-[color-mix(in_srgb,var(--color-rojo)_32%,transparent)] p-5">
            <h3 className="mb-3 font-semibold text-[var(--color-tinta)]">Sí queda dentro</h3>
            <ListaConVinetas items={contenido.alcanza} tono="negativo" />
          </div>
          <div className="rounded-[var(--radius-card)] border-[color-mix(in_srgb,var(--color-verde)_32%,transparent)] p-5">
            <h3 className="mb-3 font-semibold text-[var(--color-tinta)]">No queda dentro</h3>
            <ListaConVinetas items={contenido.noAlcanza} tono="positivo" />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 font-semibold">Lo que hay que mirar para no equivocarse</h3>
          <ListaConVinetas items={contenido.puntosClave} />
        </div>
      </Seccion>

      <Seccion
        id="umbrales"
        titulo={pendiente ? 'Umbrales: qué falta publicar' : 'Umbrales de identificación y aviso'}
        descripcion={
          pendiente
            ? undefined
            : reglas.length > 1
              ? 'Cada supuesto se mide por separado. Aplanarlos a un solo número es el error más común del mercado.'
              : `Convertidos a pesos con la UMA vigente al ${REVISION_VIGENTE}.`
        }
      >
        {pendiente && (
          <Nota tono="atencion" titulo="La autoridad no ha publicado umbrales para este apartado">
            <p>{contenido.sinUmbralPublicado}</p>
          </Nota>
        )}

        <TablaEnvoltura etiqueta="Umbrales de esta actividad vulnerable" className="mt-5">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Umbrales de identificación y de aviso de {actividad.nombre}.
            </caption>
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {reglas.length > 1 ? 'Supuesto' : 'Disposición'}
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
              {reglas.map((r) => (
                <tr key={r.id} className="border-t border-[var(--color-borde)] align-top">
                  <th scope="row" className="px-4 py-4 font-medium">
                    {reglas.length > 1 ? nombreSubtipo(r.subtipo) : actividad.nombreCorto}
                    <span className="mt-1 block text-xs font-normal text-[var(--color-tinta-tenue)]">
                      {r.procedencia.disposicion}
                    </span>
                    {r.estado !== 'publicado' && (
                      <span className="mt-1 inline-block">
                        <Insignia tono="ambar">Requiere revisión editorial</Insignia>
                      </span>
                    )}
                  </th>
                  <td className="px-4 py-4">
                    <UmbralVista vista={describirUmbral(r.identificacion, REVISION_VIGENTE)} compacto />
                  </td>
                  <td className="px-4 py-4">
                    <UmbralVista vista={describirUmbral(r.aviso, REVISION_VIGENTE)} compacto />
                  </td>
                  <td className="px-4 py-4 text-xs capitalize text-[var(--color-tinta-suave)]">
                    {r.periodicidad}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <p className="mt-3 text-sm text-[var(--color-tinta-tenue)]">
          ¿Necesitas otro año? La{' '}
          <Link href="/umbrales" className="underline underline-offset-2">
            tabla completa
          </Link>{' '}
          recalcula todo con la UMA de cualquier año registrado. Recuerda que la UMA entra en vigor
          el 1 de febrero: una operación de enero se mide con la del año anterior.
        </p>

        {reglas[0] && (
          <SelloProcedencia
            className="mt-6"
            procedencia={reglas[0].procedencia}
            fuentes={datos.FUENTES_POR_ID}
          />
        )}
      </Seccion>

      {acumulacion && (
        <Seccion
          id="acumulacion"
          titulo="Regla de acumulación"
          descripcion="El mecanismo antifraccionamiento del último párrafo del art. 17."
        >
          <div className="prosa text-[var(--color-tinta-suave)]">
            <p>{acumulacion.nota}</p>
            <p>
              La ventana es de {acumulacion.ventanaMeses} meses y agrupa por{' '}
              {acumulacion.agrupaPor.join(', ')}. Si la suma alcanza el umbral de aviso, la
              obligación nace en la operación con la que se cruza, sin esperar a que termine el
              periodo.
            </p>
            <p>
              <Link href="/herramientas/acumulacion-operaciones">
                Calcula la acumulación de un cliente
              </Link>
              .
            </p>
          </div>
        </Seccion>
      )}

      {reglasEfectivo.length > 0 && (
        <Seccion
          id="efectivo"
          titulo="Límite de uso de efectivo"
          descripcion="Una prohibición del art. 32, no un umbral de reporte. Se mide con IVA incluido."
        >
          <ul className="flex flex-col gap-4">
            {reglasEfectivo.map((r) => {
              const conversion = convertirUMA(r.limiteUMA, REVISION_VIGENTE);
              return (
                <li
                  key={r.id}
                  className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{r.nombre}</h3>
                    {r.estado !== 'publicado' && (
                      <Insignia tono="ambar">Discrepancia entre fuentes oficiales</Insignia>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-tinta-suave)]">{r.descripcion}</p>
                  <p className="mt-3">
                    <span className="cifra text-lg font-semibold">
                      {r.limiteUMA.toLocaleString('es-MX')} UMA
                    </span>
                    <span className="cifra ml-2 text-[var(--color-tinta-suave)]">
                      {formatearMXN(conversion.equivalentePesos)}
                    </span>
                    {r.periodicidad === 'mensual' && (
                      <span className="ml-2 text-sm text-[var(--color-tinta-tenue)]">al mes</span>
                    )}
                  </p>
                  {r.discrepanciaOficial && (
                    <Nota tono="atencion" className="mt-3" titulo="Dos fuentes oficiales no coinciden">
                      <p>{r.discrepanciaOficial.descripcion}</p>
                      <p>
                        <strong>Según el SAT:</strong> {r.discrepanciaOficial.segunSAT}
                      </p>
                      <p>
                        <strong>Según la ley:</strong> {r.discrepanciaOficial.segunLey}
                      </p>
                    </Nota>
                  )}
                </li>
              );
            })}
          </ul>

          <Nota tono="riesgo" className="mt-5" titulo="No lo confundas con el umbral de aviso">
            <p>
              Rebasar el límite de efectivo es una infracción por sí sola, aunque hayas presentado
              el aviso en tiempo y forma. Además, el límite del art. 32 se mide con IVA incluido y
              los umbrales del art. 17 sin IVA:{' '}
              <Link href="/limites-efectivo">aquí está la diferencia explicada</Link>.
            </p>
          </Nota>
        </Seccion>
      )}

      <Seccion
        id="obligaciones"
        titulo="Obligaciones que genera"
        descripcion="Las que más pesan en esta actividad. El catálogo completo aplica igual."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {obligaciones.map((o) => (
            <li
              key={o.slug}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
            >
              <h3 className="font-semibold">
                <Link
                  href={`/obligaciones/${o.slug}`}
                  className="underline decoration-transparent underline-offset-4 hover:decoration-[var(--color-petroleo)]"
                >
                  {o.titulo}
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {o.resumen}
              </p>
              <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">
                {o.procedencia.disposicion}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/obligaciones" className="text-[var(--color-petroleo-hondo)] underline underline-offset-2">
            Ver las {datos.OBLIGACIONES.length} obligaciones con sus pasos y su evidencia
          </Link>
        </p>
      </Seccion>

      {contenido.ejemplo && (
        <Seccion
          id="ejemplo"
          titulo="Ejemplo práctico resuelto"
          descripcion="Calculado con el mismo motor que usan las herramientas del sitio, no escrito a mano."
        >
          <EjemploResueltoBloque ejemplo={contenido.ejemplo} actividad={actividad.slug} />
        </Seccion>
      )}

      <Seccion id="preguntas" titulo="Preguntas frecuentes">
        <PreguntasFrecuentes preguntas={contenido.faq} id="lista-preguntas" />
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Herramientas',
            enlaces: [
              { href: '/herramientas/calculadora-umbrales', etiqueta: 'Calculadora de umbrales' },
              { href: '/herramientas/acumulacion-operaciones', etiqueta: 'Acumulación de seis meses' },
              { href: '/herramientas/fecha-limite-aviso', etiqueta: 'Fecha límite de aviso' },
              ...(reglasEfectivo.length > 0
                ? [{ href: '/herramientas/limites-efectivo', etiqueta: 'Verificador de efectivo' }]
                : []),
            ],
          },
          {
            titulo: 'Contenido relacionado',
            enlaces: [
              { href: BASE, etiqueta: 'Todas las actividades vulnerables' },
              { href: '/umbrales', etiqueta: 'Tabla completa de umbrales' },
              { href: '/multas', etiqueta: 'Qué pasa si no cumples' },
              { href: '/glosario', etiqueta: 'Glosario de términos' },
            ],
          },
          {
            titulo: 'La reforma',
            enlaces: [
              { href: '/reforma-ley-antilavado-2026', etiqueta: 'Qué cambió en 2025 y 2026' },
              { href: '/calendario-cumplimiento', etiqueta: 'Fechas exigibles' },
              { href: '/actualizaciones', etiqueta: 'Bitácora de cambios' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
