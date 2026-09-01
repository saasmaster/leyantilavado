import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { datos } from '@leyantilavado/rules-engine';
import { Insignia, Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { ETIQUETA_CATEGORIA, ETIQUETA_RECURRENCIA, ORDEN_CATEGORIAS } from '@/components/contenido/categorias';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  Migas,
  Seccion,
} from '@/components/contenido';
import { ImagenEditorial } from '@/components/contenido/ImagenEditorial';
import diagIdentificacionAviso from '../../../public/img/diagramas/identificacion-vs-aviso.webp';
import { jsonLdArticulo } from '@/components/contenido/JsonLd';
import { MODIFICADO_EN, PUBLICADO_DESDE, REVISION_VIGENTE } from '@/content/autores';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { BandaParalaje } from '@/components/contenido/BandaParalaje';
import bandaObligaciones from '../../../public/img/bandas/obligaciones.webp';

const RUTA = '/obligaciones';

export const metadata: Metadata = construirMetadata({
  titulo: `Las ${datos.OBLIGACIONES.length} obligaciones de la Ley Antilavado, con su evidencia`,
  descripcion:
    'Catálogo de obligaciones de una actividad vulnerable: alta, identificación, expedientes, avisos, riesgos, manual, capacitación y auditoría.',
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: PUBLICADO_DESDE,
  actualizadoEn: MODIFICADO_EN,
});

const INDICE = [
  { id: 'de-donde-salen', titulo: 'De dónde salen estas obligaciones' },
  { id: 'catalogo', titulo: 'Catálogo por bloque' },
  { id: 'orden', titulo: 'En qué orden atacarlas' },
];

export default function PaginaObligaciones() {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Obligaciones', ruta: RUTA },
  ];

  const porCategoria = ORDEN_CATEGORIAS.map((c) => ({
    categoria: c,
    obligaciones: datos.OBLIGACIONES.filter((o) => o.categoria === c),
  })).filter((g) => g.obligaciones.length > 0);

  return (
    <>
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: 'Obligaciones de quien realiza una actividad vulnerable',
          descripcion: 'Catálogo de obligaciones con pasos accionables y evidencia esperada.',
          ruta: RUTA,
          publicadoEn: PUBLICADO_DESDE,
          actualizadoEn: MODIFICADO_EN,
          seccion: 'Obligaciones',
        })}
      />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo="Obligaciones: qué tienes que hacer y con qué lo demuestras"
        etiquetas={[
          { texto: `${datos.OBLIGACIONES.length} obligaciones`, tono: 'marino' },
          { texto: 'Art. 18 LFPIORPI', tono: 'petroleo' },
          { texto: `Vigente al ${REVISION_VIGENTE}`, tono: 'neutro' },
        ]}
        respuestaDirecta="Ser sujeto obligado no se agota en presentar avisos. El art. 18 de la ley enumera once obligaciones, y la reforma de 2025 sumó cinco nuevas de gobierno del riesgo que las reglas de 2026 desarrollaron en detalle. Cada página de este catálogo trae los pasos accionables y, sobre todo, la evidencia que un auditor espera encontrar."
        entradilla="Cumplir sin poder demostrarlo equivale a no cumplir: en una verificación lo que se revisa son documentos, acuses y bitácoras."
      />

      <IndiceContenidos entradas={INDICE} />

      <ImagenEditorial
        imagen={diagIdentificacionAviso}
        alt="Dos columnas comparadas. Identificar al cliente: desde el umbral más bajo, integrar expediente y conservar diez años. Presentar aviso: además de identificar, reportar la operación y hacerlo dentro de los plazos. Una flecha indica que el segundo exige el primero."
        proporcion="diagrama"
        pie="Identificar y avisar no son la misma obligación ni se activan al mismo monto. El umbral de identificación siempre es igual o menor que el de aviso, así que toda operación que obliga a avisar obliga también a identificar —nunca al revés—."
      />

      <Seccion
        id="de-donde-salen"
        titulo="De dónde salen estas obligaciones"
        descripcion="Tres niveles normativos que hay que leer juntos."
      >
        <div className="prosa text-[var(--color-tinta-suave)]">
          <p>
            El art. 18 de la ley fija el catálogo. El Reglamento lo desarrolla con reglas
            operativas —plazos, conservación, procedimientos— y las Reglas de Carácter General
            bajan al detalle: qué contiene el manual, cómo se clasifica el riesgo, qué funciones
            mínimas debe tener un mecanismo automatizado, cómo se estructura un dictamen.
          </p>
          <p>
            Las cinco obligaciones adicionadas en 2025 —enfoque basado en riesgos, manual,
            selección de personal y capacitación, mecanismos automatizados y auditoría anual— no
            fueron exigibles desde el primer día: su calendario lo fijan los transitorios del
            Acuerdo 115/2026, que puedes consultar en el{' '}
            <Link href="/calendario-cumplimiento">calendario de cumplimiento</Link>.
          </p>
        </div>

        <Nota tono="info" className="mt-5" titulo="Incumplir cualquiera de ellas es infracción">
          <p>
            El art. 53, fracción II de la ley sanciona el incumplimiento de{' '}
            <em>cualquiera</em> de las obligaciones del art. 18, no sólo de las que tienen que ver
            con avisos. <Link href="/multas">Aquí están los rangos aplicables</Link>.
          </p>
        </Nota>
      </Seccion>

      <Seccion
        id="catalogo"
        titulo="Catálogo por bloque"
        descripcion="Agrupadas por el tipo de trabajo que exigen, no por el orden de la ley."
      >
        <div className="flex flex-col gap-10">
          {porCategoria.map((g) => (
            <div key={g.categoria}>
              <h3 className="mb-4 flex items-center gap-3 text-xl font-semibold">
                {ETIQUETA_CATEGORIA[g.categoria]}
                <Insignia tono="neutro">{g.obligaciones.length}</Insignia>
              </h3>
              <ul className="grid gap-4 md:grid-cols-2">
                {g.obligaciones.map((o) => (
                  <li key={o.slug}>
                    <Tarjeta className="h-full">
                      <TarjetaCuerpo className="flex h-full flex-col gap-3">
                        <h4 className="text-lg font-semibold">
                          <Link
                            href={`${RUTA}/${o.slug}`}
                            className="underline decoration-transparent underline-offset-4 hover:decoration-[var(--color-petroleo)]"
                          >
                            {o.titulo}
                          </Link>
                        </h4>
                        <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                          {o.resumen}
                        </p>
                        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-[var(--color-tinta-tenue)]">
                          <Insignia tono="marino">{o.procedencia.disposicion}</Insignia>
                          {o.recurrencia && (
                            <Insignia tono="neutro">
                              {ETIQUETA_RECURRENCIA[o.recurrencia] ?? o.recurrencia}
                            </Insignia>
                          )}
                          <span>{o.pasos.length} pasos</span>
                        </div>
                      </TarjetaCuerpo>
                    </Tarjeta>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion
        id="orden"
        titulo="En qué orden atacarlas"
        descripcion="Una secuencia que evita rehacer trabajo."
      >
        <ol className="list-decimal space-y-3 pl-5 leading-relaxed text-[var(--color-tinta-suave)] marker:font-semibold marker:text-[var(--color-petroleo)]">
          <li>
            <Link href={`${RUTA}/alta-sppld`}>Alta y registro</Link>: sin padrón no puedes
            presentar nada, y la obligación de informar empieza a correr desde el registro.
          </li>
          <li>
            <Link href={`${RUTA}/representante-cumplimiento`}>Representante encargado del cumplimiento</Link>{' '}
            si eres persona moral: define quién responde antes de definir cómo.
          </li>
          <li>
            <Link href={`${RUTA}/identificacion-cliente`}>Identificación</Link> y{' '}
            <Link href={`${RUTA}/expedientes`}>expedientes</Link>: es lo primero que se revisa en
            una visita y lo que más tiempo toma construir hacia atrás.
          </li>
          <li>
            <Link href={`${RUTA}/avisos`}>Avisos</Link> e{' '}
            <Link href={`${RUTA}/informes-en-ceros`}>informes en ceros</Link>: la obligación
            mensual que no admite pausas.
          </li>
          <li>
            <Link href={`${RUTA}/enfoque-basado-riesgos`}>Metodología de riesgos</Link> y{' '}
            <Link href={`${RUTA}/manual-cumplimiento`}>manual</Link>: el manual depende de la
            metodología, así que ese es el orden.
          </li>
          <li>
            <Link href={`${RUTA}/clasificacion-clientes`}>Clasificación de clientes</Link>,{' '}
            <Link href={`${RUTA}/perfil-transaccional`}>perfil transaccional</Link> y{' '}
            <Link href={`${RUTA}/mecanismos-automatizados`}>mecanismos automatizados</Link>: los
            tres se implementan juntos o ninguno funciona.
          </li>
          <li>
            <Link href={`${RUTA}/capacitacion`}>Capacitación</Link> y{' '}
            <Link href={`${RUTA}/auditoria-anual`}>auditoría</Link>: cierran el ciclo y son las de
            calendario más lejano, pero la evidencia se construye durante todo el año.
          </li>
        </ol>
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Herramientas',
            enlaces: [
              { href: '/herramientas/cuestionario', etiqueta: '¿Me aplica la ley?' },
              { href: '/herramientas/fecha-limite-aviso', etiqueta: 'Fecha límite de aviso' },
              { href: '/plantillas', etiqueta: 'Plantillas de manual y matriz' },
            ],
          },
          {
            titulo: 'Contenido relacionado',
            enlaces: [
              { href: '/actividades-vulnerables', etiqueta: 'Actividades vulnerables' },
              { href: '/umbrales', etiqueta: 'Tabla de umbrales' },
              { href: '/multas', etiqueta: 'Infracciones y multas' },
            ],
          },
          {
            titulo: 'La reforma',
            enlaces: [
              { href: '/acuerdo-115-2026', etiqueta: 'Acuerdo 115/2026' },
              { href: '/calendario-cumplimiento', etiqueta: 'Calendario de fechas' },
              { href: '/reforma-ley-antilavado-2026', etiqueta: 'Qué cambió' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>

    {/* A sangre y fuera del contenedor: es el cierre de la página, no una
        sección más. Lleva al siguiente paso en vez de terminar en seco. */}
    <BandaParalaje imagen={bandaObligaciones} alt="Un archivador de fuelle abierto, con separadores de colores, sobre una mesa de madera.">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold text-white md:text-4xl">Cada obligación tiene su artículo, su plazo y su prueba</h2>
        <p className="mt-5 text-lg leading-relaxed text-[color-mix(in_srgb,white_86%,transparent)]">
          No basta con saber que hay que identificar al cliente: importa desde qué monto, con qué documentos, en cuánto tiempo y qué hay que poder enseñar si llega un requerimiento.
        </p>
        <Link
          href="/herramientas/comparador-obligaciones"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-white px-5 font-medium text-[var(--color-marino)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          Comparar dos actividades lado a lado
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </BandaParalaje>
    </>
  );
}
