import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { datos, evaluarOperacion } from '@leyantilavado/rules-engine';
import { formatearMXN } from '@leyantilavado/types';
import { DETALLE_CONCLUSION, Insignia, Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  ListaConVinetas,
  Migas,
  Seccion,
} from '@/components/contenido';
import { jsonLdArticulo } from '@/components/contenido/JsonLd';
import { TarjetaEvaluacion } from '@/components/herramientas/TarjetaEvaluacion';
import { MODIFICADO_EN, PUBLICADO_DESDE, REVISION_VIGENTE } from '@/content/autores';
import {
  ADVERTENCIA_ILUSTRATIVA,
  CASOS_POR_SLUG,
  CASOS_PRACTICOS,
  ETIQUETA_MEDIO_PAGO,
  ETIQUETA_TIPO_CLIENTE,
} from '@/content/casos-practicos';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';

const BASE = '/casos-practicos';

/**
 * Sin parámetros dinámicos: los casos son un catálogo cerrado.
 *
 * Sin esto Next acepta CUALQUIER slug, lo renderiza bajo demanda, obtiene la
 * vista de «no encontrado» y la sirve con HTTP 200 — un soft 404. Con `false`
 * el enrutador devuelve un 404 real sin llegar a renderizar.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return CASOS_PRACTICOS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caso = CASOS_POR_SLUG[slug];
  if (!caso) {
    return construirMetadata({
      titulo: 'Caso no encontrado',
      descripcion: 'El caso práctico solicitado no existe en el catálogo del sitio.',
      ruta: `${BASE}/${slug}`,
      noindex: true,
    });
  }
  return construirMetadata({
    titulo: caso.tituloSEO,
    descripcion: caso.descripcionSEO,
    ruta: `${BASE}/${slug}`,
    tipo: 'article',
    publicadoEn: PUBLICADO_DESDE,
    actualizadoEn: MODIFICADO_EN,
  });
}

const INDICE = [
  { id: 'operacion', titulo: 'La operación, en datos' },
  { id: 'resultado', titulo: 'Qué dice la regla' },
  { id: 'lectura', titulo: 'Cómo leer este caso' },
  { id: 'siguiente', titulo: 'Qué hacer después' },
];

export default async function PaginaCasoPractico({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caso = CASOS_POR_SLUG[slug];
  if (!caso) notFound();

  const { operacion } = caso;
  const ruta = `${BASE}/${slug}`;

  /*
   * El resultado NO está escrito en el contenido: se calcula aquí, con el
   * mismo motor que usan las calculadoras del sitio. Es una función pura de
   * los datos de la operación, sin `Date.now()` de por medio, así que dos
   * builds del mismo código producen exactamente la misma página.
   */
  const resultado = evaluarOperacion(operacion);

  // El subtipo se muestra con su nombre del catálogo, no con el slug crudo.
  const nombreSubtipo = operacion.subtipo
    ? (datos.ACTIVIDADES_POR_SLUG[operacion.actividad]?.subtipos?.find(
        (s) => s.slug === operacion.subtipo,
      )?.nombre ?? operacion.subtipo)
    : undefined;

  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Casos prácticos', ruta: BASE },
    { nombre: caso.titulo, ruta },
  ];

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: caso.tituloSEO,
          descripcion: caso.descripcionSEO,
          ruta,
          publicadoEn: PUBLICADO_DESDE,
          actualizadoEn: MODIFICADO_EN,
          seccion: 'Casos prácticos',
        })}
      />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo={caso.titulo}
        etiquetas={[
          { texto: `Art. 17, fracción ${resultado.fraccion}`, tono: 'marino' },
          { texto: resultado.nombreActividad, tono: 'petroleo' },
          { texto: 'Caso ilustrativo', tono: 'ambar' },
        ]}
        entradilla={caso.contexto}
        /*
         * La respuesta directa la redacta el motor, no el editor: son los
         * textos de `DETALLE_CONCLUSION`, que es donde el producto decide qué
         * tan categórico se puede ser. Escribirla a mano aquí sería la vía más
         * fácil para que una página acabara afirmando más de lo que la
         * evaluación sostiene.
         */
        respuestaDirecta={DETALLE_CONCLUSION[resultado.conclusion]}
      />

      <Nota tono="atencion" titulo="Este caso es inventado">
        <p>{ADVERTENCIA_ILUSTRATIVA}</p>
      </Nota>

      <IndiceContenidos entradas={INDICE} />

      <Seccion
        id="operacion"
        titulo="La operación, en datos"
        descripcion="Lo que se captura es esto y nada más. Todo lo demás lo deduce el motor."
      >
        <Tarjeta>
          <TarjetaCuerpo>
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs text-[var(--color-tinta-tenue)]">Valor de la operación</dt>
                <dd className="cifra mt-1 text-lg font-semibold text-[var(--color-tinta)]">
                  {operacion.montoIndeterminable
                    ? 'No determinable'
                    : formatearMXN(operacion.monto)}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-[var(--color-tinta-tenue)]">Fecha de la operación</dt>
                <dd className="cifra mt-1 text-lg font-semibold text-[var(--color-tinta)]">
                  <time dateTime={operacion.fecha}>{operacion.fecha}</time>
                </dd>
              </div>

              <div>
                <dt className="text-xs text-[var(--color-tinta-tenue)]">Medio de pago</dt>
                <dd className="mt-1 text-lg font-semibold text-[var(--color-tinta)]">
                  {ETIQUETA_MEDIO_PAGO[operacion.medioPago]}
                </dd>
              </div>

              {operacion.montoEfectivo !== undefined && (
                <div>
                  <dt className="text-xs text-[var(--color-tinta-tenue)]">Liquidado en efectivo</dt>
                  <dd className="cifra mt-1 text-lg font-semibold text-[var(--color-tinta)]">
                    {formatearMXN(operacion.montoEfectivo)}
                  </dd>
                </div>
              )}

              {operacion.comision !== undefined && (
                <div>
                  <dt className="text-xs text-[var(--color-tinta-tenue)]">
                    Contraprestación cobrada
                  </dt>
                  <dd className="cifra mt-1 text-lg font-semibold text-[var(--color-tinta)]">
                    {formatearMXN(operacion.comision)}
                  </dd>
                </div>
              )}

              {operacion.tipoCliente && (
                <div>
                  <dt className="text-xs text-[var(--color-tinta-tenue)]">Tipo de cliente</dt>
                  <dd className="mt-1 text-lg font-semibold text-[var(--color-tinta)]">
                    {ETIQUETA_TIPO_CLIENTE[operacion.tipoCliente]}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--color-borde)] pt-4">
              <Insignia tono="marino">Art. 17, fracción {resultado.fraccion}</Insignia>
              {nombreSubtipo && <Insignia tono="petroleo">Supuesto: {nombreSubtipo}</Insignia>}
              {operacion.enRepresentacionDelCliente !== undefined && (
                <Insignia tono="ambar">
                  {operacion.enRepresentacionDelCliente
                    ? 'En nombre y representación del cliente'
                    : 'Sólo asesoría'}
                </Insignia>
              )}
              {operacion.montoIndeterminable && (
                <Insignia tono="ambar">Monto no determinable</Insignia>
              )}
            </div>
          </TarjetaCuerpo>
        </Tarjeta>
      </Seccion>

      <Seccion
        id="resultado"
        titulo="Qué dice la regla"
        descripcion="Calculado con el motor del sitio, con la UMA vigente en la fecha de la operación y la disposición aplicable a la vista."
      >
        <TarjetaEvaluacion resultado={resultado} />
      </Seccion>

      <Seccion
        id="lectura"
        titulo="Cómo leer este caso"
        descripcion="Lo que el motor no puede deducir de los datos y sí cambia la lectura."
      >
        <ListaConVinetas items={caso.notas} />
      </Seccion>

      <Seccion
        id="siguiente"
        titulo="Qué hacer después"
        descripcion="En este orden. La conclusión sin los pasos no sirve de nada."
      >
        <ol className="flex flex-col gap-3">
          {caso.siguientesPasos.map((paso, i) => (
            <li
              key={paso}
              className="flex gap-3 rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <span className="cifra shrink-0 font-semibold text-[var(--color-petroleo-hondo)]">
                {i + 1}.
              </span>
              <span className="leading-relaxed text-[var(--color-tinta-suave)]">{paso}</span>
            </li>
          ))}
        </ol>

        <p className="mt-5 text-sm text-[var(--color-tinta-suave)]">
          Tu operación no es ésta. Corre la tuya en la{' '}
          <Link
            href="/herramientas/calculadora-umbrales"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            calculadora de umbrales
          </Link>{' '}
          y revisa el{' '}
          <Link
            href="/herramientas/fecha-limite-aviso"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            plazo para presentar el aviso
          </Link>
          .
        </p>
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Herramientas',
            enlaces: [
              { href: '/herramientas/calculadora-umbrales', etiqueta: 'Calculadora de umbrales' },
              {
                href: '/herramientas/acumulacion-operaciones',
                etiqueta: 'Acumulación de seis meses',
              },
              { href: '/herramientas/fecha-limite-aviso', etiqueta: 'Fecha límite de aviso' },
              { href: '/herramientas/limites-efectivo', etiqueta: 'Verificador de efectivo' },
            ],
          },
          {
            titulo: 'La regla de fondo',
            enlaces: [
              {
                href: `/actividades-vulnerables/${operacion.actividad}`,
                etiqueta: resultado.nombreActividad,
                descripcion: 'La actividad completa, con todos sus supuestos',
              },
              { href: '/umbrales', etiqueta: 'Tabla completa de umbrales' },
              { href: '/obligaciones', etiqueta: 'Las obligaciones, una por una' },
            ],
          },
          {
            titulo: 'Más casos',
            enlaces: [
              { href: BASE, etiqueta: 'Todos los casos prácticos' },
              { href: '/limites-efectivo', etiqueta: 'Límites de efectivo explicados' },
              { href: '/multas', etiqueta: 'Qué pasa si no cumples' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
