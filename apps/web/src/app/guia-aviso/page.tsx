import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ExternalLink, FileWarning, Quote } from 'lucide-react';
import { datos } from '@leyantilavado/rules-engine';
import { Insignia, Nota, SelloProcedencia, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
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
import { jsonLdArticulo } from '@/components/contenido/JsonLd';
import { REVISION_VIGENTE } from '@/content/autores';
import {
  CANALES_ALTERNOS,
  CAUSAS_ERROR,
  FAQ_GUIA,
  FUENTES_GUIA,
  FUENTES_GUIA_POR_ID,
  GUIA_AVISO,
  HUECOS_DECLARADOS,
  LIMITES_MODIFICATORIO,
  LITERAL_EXENTOS,
  NOTA_EXENTOS,
  PASOS_FLUJO,
  PASOS_MODIFICATORIO,
  QUE_DICE_LA_AUTORIDAD_SOBRE_ERRORES,
  REQUISITOS,
  VIAS,
  type PasoGuia,
} from '@/content/guia-aviso';
import { SITIO, construirMetadata, jsonLdFAQ, jsonLdMigaDePan } from '@/lib/sitio';

const RUTA = '/guia-aviso';

/* Las cifras legales salen del motor, nunca de este archivo. */
const OB_AVISOS = datos.OBLIGACIONES_POR_SLUG['avisos'];
const OB_CEROS = datos.OBLIGACIONES_POR_SLUG['informes-en-ceros'];
const OB_24H = datos.OBLIGACIONES_POR_SLUG['operaciones-inusuales'];
const PENDIENTE_24H = datos.PENDIENTES_SIN_FECHA.find((p) => p.id === 'avisos-24h');

export const metadata: Metadata = construirMetadata({
  titulo: GUIA_AVISO.tituloSEO,
  descripcion: GUIA_AVISO.descripcionSEO,
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: REVISION_VIGENTE,
  actualizadoEn: REVISION_VIGENTE,
});

/**
 * `HowTo` para el flujo de presentación.
 *
 * Se emite porque la página muestra los pasos a la vista, en orden y
 * numerados, que es la condición de la casa para declarar datos estructurados.
 * Cada `HowToStep` corresponde a un paso visible con su propio ancla.
 */
function jsonLdComoPresentar() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${SITIO.url}${RUTA}#howto`,
    name: 'Cómo presentar un aviso de actividad vulnerable en el SPPLD',
    description: GUIA_AVISO.descripcionSEO,
    inLanguage: 'es-MX',
    totalTime: 'PT30M',
    tool: [
      { '@type': 'HowToTool', name: 'e.firma vigente' },
      { '@type': 'HowToTool', name: 'Microsoft Excel 2007 o posterior' },
      { '@type': 'HowToTool', name: 'Plantilla oficial .xlsm del SPPLD' },
    ],
    step: PASOS_FLUJO.map((p, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: p.titulo,
      text: p.detalle.join(' '),
      url: `${SITIO.url}${RUTA}#paso-${p.id}`,
    })),
  };
}

/* ── Bloques ─────────────────────────────────────────────────────────────── */

function Literal({ texto, fuenteId }: { texto: string; fuenteId: string }) {
  const fuente = FUENTES_GUIA_POR_ID[fuenteId];
  return (
    <figure className="mt-3 rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-4">
      <blockquote className="flex gap-2 text-sm leading-relaxed text-[var(--color-tinta)]">
        <Quote aria-hidden className="mt-0.5 size-4 shrink-0 text-[var(--color-tinta-tenue)]" />
        <p>«{texto}»</p>
      </blockquote>
      {fuente && (
        <figcaption className="mt-2 pl-6 text-xs text-[var(--color-tinta-tenue)]">
          {fuente.emisor} —{' '}
          <a
            href={fuente.url}
            rel="noopener noreferrer"
            target="_blank"
            className="underline underline-offset-2"
          >
            {fuente.nombre}
          </a>
          . Consultado el {fuente.consultadaEl}.
        </figcaption>
      )}
    </figure>
  );
}

function ListaPasos({ pasos, prefijo }: { pasos: readonly PasoGuia[]; prefijo: string }) {
  return (
    <ol className="flex flex-col gap-4">
      {pasos.map((p, i) => (
        <li
          key={p.id}
          id={`${prefijo}-${p.id}`}
          className="flex scroll-mt-24 gap-4 rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
        >
          <span
            aria-hidden
            className="cifra flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-marino-tenue)] font-semibold text-[var(--color-marino)]"
          >
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="font-medium leading-relaxed text-[var(--color-tinta)]">{p.titulo}</p>
            {p.detalle.map((d) => (
              <p key={d} className="mt-2 leading-relaxed text-[var(--color-tinta-suave)]">
                {d}
              </p>
            ))}
            {p.literal && <Literal texto={p.literal} fuenteId={p.fuenteId} />}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── Página ──────────────────────────────────────────────────────────────── */

export default function PaginaGuiaAviso() {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Guía de presentación de avisos', ruta: RUTA },
  ];

  const indice = [
    { id: 'antes-de-empezar', titulo: 'Antes de empezar' },
    { id: 'dos-vias', titulo: 'Las dos vías oficiales' },
    { id: 'flujo', titulo: 'El flujo completo, paso a paso' },
    { id: 'errores', titulo: 'Errores de validación del XML' },
    { id: 'informe-ceros', titulo: 'Informe en ceros y operaciones exentas' },
    { id: 'veinticuatro-horas', titulo: 'El aviso de 24 horas' },
    { id: 'correccion', titulo: 'Corregir y presentar fuera de plazo' },
    { id: 'otras-vias', titulo: 'Cuando el canal es otro' },
    { id: 'fuentes', titulo: 'Fuentes consultadas' },
    { id: 'preguntas', titulo: 'Preguntas frecuentes' },
  ];

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: GUIA_AVISO.tituloSEO,
          descripcion: GUIA_AVISO.descripcionSEO,
          ruta: RUTA,
          publicadoEn: REVISION_VIGENTE,
          actualizadoEn: REVISION_VIGENTE,
          seccion: 'Avisos',
        })}
      />
      <JsonLd datos={jsonLdComoPresentar()} />
      <JsonLd datos={jsonLdFAQ(FAQ_GUIA.map((f) => ({ ...f })))} />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo="Cómo se presenta un aviso, de verdad"
        etiquetas={[
          { texto: 'Procedimiento', tono: 'marino' },
          { texto: OB_AVISOS?.procedencia.disposicion ?? 'LFPIORPI', tono: 'petroleo' },
          { texto: 'Con literales del instructivo del SAT', tono: 'neutro' },
        ]}
        entradilla="Plantilla oficial, macros, XML, carga y acuse. Todo lo que esta página afirma sobre el trámite está transcrito del instructivo del SAT o del propio portal, con la liga y la fecha en que lo consultamos. Lo que la autoridad no publica, lo decimos."
        respuestaDirecta={GUIA_AVISO.respuestaDirecta}
      />

      <IndiceContenidos entradas={indice} />

      <Nota tono="info" titulo="Qué encontrarás aquí y qué no">
        <p>
          Esta guía cubre el <strong>cómo</strong>. El <strong>cuándo</strong> —el plazo del día 17,
          la acumulación, la fecha límite de una operación concreta— vive en{' '}
          <Link href="/obligaciones/avisos">la obligación de presentar avisos</Link> y en la{' '}
          <Link href="/herramientas/fecha-limite-aviso">calculadora de fecha límite</Link>.
        </p>
        <p>
          No reproducimos capturas de pantalla del sistema ni nombres de campos de la plantilla que
          no aparezcan en un documento oficial publicado. La plantilla se descarga desde tu propia
          sesión y su contenido cambia cuando cambian los formatos oficiales.
        </p>
      </Nota>

      <Seccion
        id="antes-de-empezar"
        titulo="Antes de empezar"
        descripcion="Cuatro condiciones que, si faltan, hacen perder la tarde justo el día 16."
      >
        <ListaPasos pasos={REQUISITOS} prefijo="req" />
      </Seccion>

      <Seccion
        id="dos-vias"
        titulo="Las dos vías oficiales"
        descripcion="El portal admite capturar en pantalla o subir un archivo. Son dos caminos distintos hacia el mismo acuse."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {VIAS.map((v) => (
            <Tarjeta key={v.id}>
              <TarjetaCuerpo>
                <p className="font-semibold text-[var(--color-tinta)]">«{v.titulo}»</p>
                <p className="mt-2 leading-relaxed text-[var(--color-tinta-suave)]">
                  {v.descripcion}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-tinta)]">
                  <strong>Cuándo conviene:</strong> {v.cuandoConviene}
                </p>
                <Literal texto={v.literal} fuenteId={v.fuenteId} />
              </TarjetaCuerpo>
            </Tarjeta>
          ))}
        </div>
        <p className="mt-5 text-sm text-[var(--color-tinta-suave)]">
          El resto de esta guía describe la segunda vía, que es la que produce un archivo revisable.
          Si tus operaciones ya están en una hoja de cálculo, la{' '}
          <Link
            href="/herramientas/importar-operaciones"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            herramienta de importación de operaciones
          </Link>{' '}
          te ayuda a ordenarlas y a detectar cuáles alcanzan el umbral antes de capturar nada.
        </p>
      </Seccion>

      <Seccion
        id="flujo"
        titulo="El flujo completo, paso a paso"
        descripcion="Nueve pasos. Los literales entre comillas son transcripción del instructivo oficial del SAT, incluidos los nombres exactos de los botones."
      >
        <ListaPasos pasos={PASOS_FLUJO} prefijo="paso" />

        <Nota tono="atencion" className="mt-6" titulo="Cargar no es enviar, y enviar no es acuse">
          <p>
            Son tres momentos distintos y el trámite sólo está completo en el tercero. Más de una
            multa por omisión empieza con un archivo cargado que nadie llegó a enviar.
          </p>
        </Nota>
      </Seccion>

      <Seccion
        id="errores"
        titulo="Errores de validación del XML"
        descripcion="Lo primero, y lo más importante de esta sección: no existe un catálogo oficial de códigos de error publicado."
      >
        <Nota tono="riesgo" titulo="Aquí no vas a encontrar una lista de códigos">
          <p>
            Porque no la hay. Ni el instructivo del SAT ni el sitio público del portal publican los
            mensajes de error con su significado. Lo único que la autoridad dice sobre el tema es
            esto:
          </p>
        </Nota>
        <Literal
          texto={QUE_DICE_LA_AUTORIDAD_SOBRE_ERRORES.literal}
          fuenteId={QUE_DICE_LA_AUTORIDAD_SOBRE_ERRORES.fuenteId}
        />
        <p className="prosa mt-5 leading-relaxed text-[var(--color-tinta-suave)]">
          Lo que sí podemos documentar son las causas que la propia autoridad menciona, cada una con
          su literal. Si tu error no encaja en ninguna, esa es información útil: significa que estás
          ante algo que no está documentado y que conviene consultar al SAT, no adivinar.
        </p>

        <ul className="mt-5 flex flex-col gap-4">
          {CAUSAS_ERROR.map((c) => {
            const fuente = FUENTES_GUIA_POR_ID[c.fuenteId];
            return (
              <li
                key={c.id}
                className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
              >
                <p className="flex items-start gap-2 font-medium text-[var(--color-tinta)]">
                  <FileWarning
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-[var(--color-ambar)]"
                  />
                  {c.sintoma}
                </p>
                <p className="mt-2 leading-relaxed text-[var(--color-tinta-suave)]">
                  <strong className="text-[var(--color-tinta)]">Causa documentada:</strong>{' '}
                  {c.causa}
                </p>
                <p className="mt-2 leading-relaxed text-[var(--color-tinta-suave)]">
                  <strong className="text-[var(--color-tinta)]">Qué hacer:</strong> {c.queHacer}
                </p>
                {fuente && (
                  <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">
                    Fuente:{' '}
                    <a
                      href={fuente.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="underline underline-offset-2"
                    >
                      {fuente.nombre}
                    </a>
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <h3 className="mt-10 text-lg font-semibold text-[var(--color-tinta)]">
          Lo que no está publicado
        </h3>
        <p className="prosa mt-2 text-[var(--color-tinta-suave)]">
          Cinco huecos reales del trámite. Los declaramos en lugar de rellenarlos.
        </p>
        <ul className="mt-4 flex flex-col gap-4">
          {HUECOS_DECLARADOS.map((h) => (
            <li
              key={h.id}
              className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-ambar)] bg-[var(--color-ambar-tenue)] p-4"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-[var(--color-ambar)]" />
                <p className="font-medium text-[var(--color-tinta)]">{h.titulo}</p>
              </div>
              <p className="mt-2 leading-relaxed text-[var(--color-tinta-suave)]">
                {h.queNoEstaPublicado}
              </p>
              <p className="mt-2 leading-relaxed text-[var(--color-tinta)]">
                <strong>Mientras tanto:</strong> {h.queHacerMientrasTanto}
              </p>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion
        id="informe-ceros"
        titulo="Informe en ceros y operaciones exentas"
        descripcion="Dos documentos que se parecen, se confunden y no son lo mismo."
      >
        {OB_CEROS && (
          <Tarjeta>
            <TarjetaCuerpo>
              <div className="flex flex-wrap items-center gap-2">
                <Insignia tono="marino">{OB_CEROS.procedencia.disposicion}</Insignia>
                <p className="font-semibold text-[var(--color-tinta)]">{OB_CEROS.titulo}</p>
              </div>
              <p className="mt-2 leading-relaxed text-[var(--color-tinta-suave)]">
                {OB_CEROS.resumen}
              </p>
              <p className="mt-3 text-sm">
                <Link
                  href="/obligaciones/informes-en-ceros"
                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                >
                  Ver la obligación completa, con su evidencia y sus errores comunes
                </Link>
              </p>
            </TarjetaCuerpo>
          </Tarjeta>
        )}

        <Nota tono="riesgo" className="mt-5" titulo="Un mes sin operaciones también se informa">
          <p>
            La obligación mensual nace del alta en el padrón, no de haber tenido operaciones: el
            art. 12, último párrafo del Reglamento obliga a seguir presentando avisos o informes
            mientras no se tramite la baja. Omitirlo es de las causas más frecuentes de sanción.{' '}
            <Link href="/multas">Consulta los rangos</Link>.
          </p>
          <p>
            Y una vez enviado no se corrige: el art. 25 de las reglas de carácter general, con el
            párrafo adicionado en 2026, lo declara no modificable ni eliminable. Revísalo antes de
            mandarlo, porque después no hay vuelta.
          </p>
        </Nota>

        <h3 className="mt-10 text-lg font-semibold text-[var(--color-tinta)]">
          {NOTA_EXENTOS.titulo}
        </h3>
        {NOTA_EXENTOS.parrafos.map((p) => (
          <p key={p} className="prosa mt-2 leading-relaxed text-[var(--color-tinta-suave)]">
            {p}
          </p>
        ))}
        <Literal texto={LITERAL_EXENTOS} fuenteId="inst-excel" />
        <p className="mt-3 text-xs text-[var(--color-tinta-tenue)]">
          Fundamento citado por el instructivo: {NOTA_EXENTOS.disposicion}.
        </p>
      </Seccion>

      <Seccion
        id="veinticuatro-horas"
        titulo="El aviso de 24 horas"
        descripcion="Existe en la norma. Su envío depende de una Resolución que no aparece publicada."
      >
        {OB_24H && (
          <p className="prosa leading-relaxed text-[var(--color-tinta-suave)]">{OB_24H.resumen}</p>
        )}

        {PENDIENTE_24H && (
          <div className="mt-5 rounded-[var(--radius-card)] border border-dashed border-[var(--color-ambar)] bg-[var(--color-ambar-tenue)] p-4">
            <Insignia tono="ambar">Sin fecha cierta</Insignia>
            <p className="mt-2 font-medium text-[var(--color-tinta)]">{PENDIENTE_24H.titulo}</p>
            <p className="mt-1 leading-relaxed text-[var(--color-tinta-suave)]">
              {PENDIENTE_24H.descripcion}
            </p>
            <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">
              {PENDIENTE_24H.procedencia.disposicion}
            </p>
          </div>
        )}

        <p className="prosa mt-5 leading-relaxed text-[var(--color-tinta-suave)]">
          En términos de esta guía, la consecuencia es concreta: la plantilla oficial que hoy se
          descarga del portal responde a los formatos publicados en 2013 y reformados en 2014, que
          no identifican ese tipo de aviso. Mientras la Resolución no se publique, no hay archivo
          que generar ni sección donde cargarlo.
        </p>
        <p className="prosa mt-2 leading-relaxed text-[var(--color-tinta-suave)]">
          Lo que sí debe existir desde hoy es el procedimiento interno: quién detecta, a quién
          escala, en cuánto tiempo y dónde queda registrada la decisión —incluida la de{' '}
          <em>no</em> avisar—.{' '}
          <Link
            href="/obligaciones/operaciones-inusuales"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            Ver la obligación y su evidencia esperada
          </Link>
          .
        </p>
      </Seccion>

      <Seccion
        id="correccion"
        titulo="Corregir y presentar fuera de plazo"
        descripcion="Dos situaciones distintas que se confunden: el aviso equivocado y el aviso tardío."
      >
        <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
          Aviso modificatorio: corregir uno ya presentado
        </h3>
        <p className="prosa mt-2 leading-relaxed text-[var(--color-tinta-suave)]">
          El SAT publica un instructivo propio para esto. El procedimiento gira alrededor del folio
          del aviso original.
        </p>
        <div className="mt-4">
          <ListaPasos pasos={PASOS_MODIFICATORIO} prefijo="mod" />
        </div>

        <ul className="mt-5 flex flex-col gap-4">
          {LIMITES_MODIFICATORIO.map((l) => (
            <li
              key={l.id}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <p className="leading-relaxed text-[var(--color-tinta)]">{l.texto}</p>
              <Literal texto={l.literal} fuenteId={l.fuenteId} />
            </li>
          ))}
        </ul>

        <Nota tono="atencion" className="mt-6" titulo="El plazo para modificar no está en el instructivo">
          <p>
            El instructivo describe el procedimiento pero no menciona ni plazo ni número de
            correcciones permitidas. Ese límite proviene de las reglas de carácter general.{' '}
            <Link href="/preguntas-frecuentes#aviso-modificatorio">
              Lo tratamos aparte, con lo que sabemos y lo que no
            </Link>
            . Trabaja como si sólo tuvieras una corrección y poco tiempo: es la lectura prudente.
          </p>
        </Nota>

        <h3 className="mt-10 text-lg font-semibold text-[var(--color-tinta)]">
          Aviso extemporáneo: presentar después de la fecha límite
        </h3>
        <ListaConVinetas
          items={[
            'No hay una opción, casilla ni sección distinta: se presenta por la misma vía y con el periodo que le correspondía, no con el mes en curso.',
            'Ningún instructivo oficial describe un flujo extemporáneo. Hay instructivos del aviso modificatorio y de la baja de actividad; de éste, no.',
            'Lo que cambia es la consecuencia jurídica, no la pantalla: la presentación extemporánea es una infracción distinta de la omisión, con su propio rango de sanción.',
            'Presentar tarde de forma espontánea, antes de que la autoridad inicie sus facultades de verificación, es lo que abre la puerta a la autocorrección. Esperar a que te requieran la cierra.',
          ]}
        />
        <p className="mt-4 text-sm">
          <Link
            href="/multas"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            Ver los rangos de sanción y los escenarios de autocorrección
          </Link>{' '}
          ·{' '}
          <Link
            href="/herramientas/fecha-limite-aviso"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            Calcular si un aviso ya estaba vencido
          </Link>
        </p>
      </Seccion>

      <Seccion
        id="otras-vias"
        titulo="Cuando el canal es otro"
        descripcion="Dos actividades no presentan por donde presentan las demás, y hay una vía opcional abierta a todos. Cambia el canal, no la obligación."
      >
        <ul className="flex flex-col gap-5">
          {CANALES_ALTERNOS.map((c) => (
            <li key={c.id}>
              <Tarjeta>
                <TarjetaCuerpo>
                  <div className="flex flex-wrap items-center gap-2">
                    <Insignia tono="petroleo">{c.disposicion}</Insignia>
                  </div>
                  <p className="mt-2 font-semibold text-[var(--color-tinta)]">{c.titulo}</p>
                  <p className="mt-2 leading-relaxed text-[var(--color-tinta-suave)]">
                    <strong className="text-[var(--color-tinta)]">A quién alcanza:</strong> {c.quien}
                  </p>
                  <blockquote className="mt-3 border-l-2 border-[var(--color-borde-fuerte)] pl-3 text-sm leading-relaxed text-[var(--color-tinta)]">
                    {c.cita}
                  </blockquote>
                  {c.nota && (
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                      {c.nota}
                    </p>
                  )}
                </TarjetaCuerpo>
              </Tarjeta>
            </li>
          ))}
        </ul>

        <Nota tono="info" className="mt-6" titulo="El informe en ceros alcanza también a esas vías">
          <p>
            Presentar por el sistema del pedimento o por los medios fiscales no exime del informe
            mensual cuando no hubo operaciones objeto de aviso. La obligación de informar nace del
            alta en el padrón.
          </p>
        </Nota>
      </Seccion>

      <Seccion
        id="fuentes"
        titulo="Fuentes consultadas"
        descripcion="Cada afirmación procedimental de esta página sale de uno de estos documentos. Descárgalos y contrástalos: para eso están las ligas."
      >
        <ul className="flex flex-col gap-3">
          {FUENTES_GUIA.map((f) => (
            <li
              key={f.id}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <a
                href={f.url}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-start gap-1.5 font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
              >
                {f.nombre}
                <ExternalLink aria-hidden className="mt-1 size-3.5 shrink-0" />
              </a>
              <p className="mt-1 text-sm text-[var(--color-tinta-tenue)]">
                {f.emisor} · consultada el{' '}
                <time dateTime={f.consultadaEl}>{f.consultadaEl}</time>
              </p>
              {f.nota && (
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {f.nota}
                </p>
              )}
            </li>
          ))}
        </ul>

        <Nota tono="atencion" className="mt-6" titulo="Las ligas de la autoridad se mueven">
          <p>
            El instructivo de Excel circula en dos direcciones distintas con contenido casi idéntico,
            y el portal las enlaza de forma inconsistente. Si una liga deja de funcionar, entra al{' '}
            <a
              href="https://sppld.sat.gob.mx/pld/interiores/sppld.html"
              rel="noopener noreferrer"
              target="_blank"
              className="underline underline-offset-2"
            >
              Sistema del Portal en Internet
            </a>{' '}
            y busca el instructivo desde ahí, no desde una copia guardada.
          </p>
        </Nota>
      </Seccion>

      <Seccion id="preguntas" titulo="Preguntas frecuentes">
        <PreguntasFrecuentes preguntas={FAQ_GUIA} id="lista-preguntas" />
      </Seccion>

      {OB_AVISOS && (
        <SelloProcedencia
          className="mt-10"
          procedencia={OB_AVISOS.procedencia}
          fuentes={datos.FUENTES_POR_ID}
        />
      )}

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Herramientas',
            enlaces: [
              {
                href: '/herramientas/fecha-limite-aviso',
                etiqueta: 'Fecha límite del aviso',
                descripcion: 'El día 17 de una operación concreta y los días que quedan',
              },
              {
                href: '/herramientas/importar-operaciones',
                etiqueta: 'Importar operaciones',
                descripcion: 'Ordenar el mes y ver cuáles alcanzan el umbral antes de capturar',
              },
              {
                href: '/herramientas/acumulacion-operaciones',
                etiqueta: 'Acumulación de seis meses',
                descripcion: 'Detectar el aviso que se dispara por suma',
              },
            ],
          },
          {
            titulo: 'Obligaciones relacionadas',
            enlaces: [
              { href: '/obligaciones/avisos', etiqueta: 'Presentación de avisos' },
              { href: '/obligaciones/informes-en-ceros', etiqueta: 'Informes en ceros' },
              { href: '/obligaciones/operaciones-inusuales', etiqueta: 'Aviso de 24 horas' },
              { href: '/obligaciones/alta-sppld', etiqueta: 'Alta y registro en el SPPLD' },
            ],
          },
          {
            titulo: 'Contenido relacionado',
            enlaces: [
              { href: '/multas', etiqueta: 'Qué cuesta presentar tarde o no presentar' },
              { href: '/fuentes-oficiales', etiqueta: 'Todas las fuentes oficiales' },
              { href: '/preguntas-frecuentes', etiqueta: 'Preguntas frecuentes' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
