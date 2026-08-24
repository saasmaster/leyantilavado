import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Insignia, Nota, Tarjeta, TarjetaCuerpo, TablaEnvoltura } from '@leyantilavado/ui';
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
  ART_55,
  CONSULTA_FUENTES,
  CUANDO_ABOGADO,
  DOCUMENTOS,
  ESCRITO_RECONOCIMIENTO,
  ESPONTANEIDAD,
  FAQ_REQUERIMIENTO,
  FUENTES_CONSULTADAS,
  MEDIOS_DEFENSA,
  NO_RESPONDER,
  PASOS_REGULARIZACION,
  PLAZOS,
  PLAZOS_A_FAVOR,
  QUE_NO_HACER,
  SIN_CONFIRMAR,
  type PlazoCitado,
} from '@/content/requerimiento';
import { construirMetadata, jsonLdFAQ, jsonLdMigaDePan } from '@/lib/sitio';

const RUTA = '/requerimiento-sat';

export const metadata: Metadata = construirMetadata({
  titulo: 'Requerimiento del SAT por actividad vulnerable: qué hacer',
  descripcion:
    'Carta invitación, requerimiento y visita no son lo mismo. Plazos con su artículo, la autocorrección del art. 55 y los medios de defensa.',
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: REVISION_VIGENTE,
  actualizadoEn: REVISION_VIGENTE,
});

const INDICE = [
  { id: 'primero', titulo: 'Antes de nada: tres cosas' },
  { id: 'tres-papeles', titulo: 'Los tres papeles que no son lo mismo' },
  { id: 'el-reloj', titulo: 'El reloj: plazos con su artículo' },
  { id: 'no-responder', titulo: 'Qué pasa si dejas pasar el plazo' },
  { id: 'articulo-55', titulo: 'Art. 55: abstención y reducción' },
  { id: 'espontaneidad', titulo: 'La espontaneidad no se repone' },
  { id: 'orden', titulo: 'En qué orden regularizar' },
  { id: 'defensa', titulo: 'Medios de defensa y sus plazos' },
  { id: 'que-no-hacer', titulo: 'Qué no hacer' },
  { id: 'sin-confirmar', titulo: 'Lo que no pudimos confirmar' },
  { id: 'preguntas', titulo: 'Preguntas frecuentes' },
  { id: 'fuentes', titulo: 'Fuentes consultadas' },
];

const TONO_INSIGNIA = {
  neutro: 'neutro',
  ambar: 'ambar',
  rojo: 'rojo',
} as const;

function TablaPlazos({ filas, etiqueta }: { filas: readonly PlazoCitado[]; etiqueta: string }) {
  return (
    <TablaEnvoltura etiqueta={etiqueta}>
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="sr-only">{etiqueta}</caption>
        <thead className="bg-[var(--color-marfil-hondo)]">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Momento
            </th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
              Plazo
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Fundamento
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.momento} className="border-t border-[var(--color-borde)] align-top">
              <th scope="row" className="px-4 py-4 font-medium">
                {f.momento}
              </th>
              <td className="cifra whitespace-nowrap px-4 py-4 font-semibold">{f.plazo}</td>
              <td className="px-4 py-4 text-[var(--color-tinta-suave)]">
                <p>{f.fundamento}</p>
                {f.nota && (
                  <p className="mt-1 text-xs text-[var(--color-tinta-tenue)]">{f.nota}</p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TablaEnvoltura>
  );
}

export default function PaginaRequerimiento() {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Requerimiento del SAT', ruta: RUTA },
  ];

  // La conducta y su rango salen del motor. Aquí sólo se nombra la regla y se
  // enlaza a la calculadora: las cifras viven en un solo lugar.
  const sancionRequerimiento = datos.SANCIONES.find((s) => s.id === 'art54-I--53-I');
  const escenarios = datos.ESCENARIOS_AUTOCORRECCION;

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: 'Requerimiento, carta invitación y visita de verificación del SAT',
          descripcion:
            'Cómo se diferencian, qué plazos corren en cada caso, cómo funciona la autocorrección del art. 55 de la LFPIORPI y qué medios de defensa existen.',
          ruta: RUTA,
          publicadoEn: REVISION_VIGENTE,
          actualizadoEn: REVISION_VIGENTE,
          seccion: 'Sanciones',
        })}
      />
      <JsonLd datos={jsonLdFAQ(FAQ_REQUERIMIENTO.map((f) => ({ ...f })))} />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo="Te llegó algo del SAT por una actividad vulnerable"
        etiquetas={[
          { texto: 'Arts. 34 a 36 y 55 LFPIORPI', tono: 'marino' },
          { texto: 'Arts. 8, 9 y 55 Bis del Reglamento', tono: 'petroleo' },
          { texto: `Vigente al ${REVISION_VIGENTE}`, tono: 'neutro' },
        ]}
        respuestaDirecta="Lo primero no es contestar: es identificar qué te llegó. Una carta invitación, un requerimiento de información y el inicio de una visita de verificación tienen plazos distintos, consecuencias distintas y —esto es lo que casi nadie dice— dejan la autocorrección del art. 55 en estados distintos. Después de eso, el orden importa: primero el plazo que corre, luego la regularización, y sólo al final el escrito de reconocimiento."
        entradilla="Esta página ordena lo que sigue y cita el artículo de cada plazo. No sustituye a un abogado: si ya hay un oficio con fecha de notificación, esa consulta es la primera tarea de la lista, no la última."
      />

      <IndiceContenidos entradas={INDICE} />

      <Seccion id="primero" titulo="Antes de nada: tres cosas">
        <ol className="grid gap-4 md:grid-cols-3">
          <li className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5">
            <p className="cifra text-sm font-semibold text-[var(--color-tinta-tenue)]">1</p>
            <p className="mt-1 font-semibold">Anota la fecha de notificación</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
              Todos los plazos de esta página se cuentan desde ahí, no desde el día que abriste el
              sobre ni desde la fecha impresa en el oficio. Guarda la constancia.
            </p>
          </li>
          <li className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5">
            <p className="cifra text-sm font-semibold text-[var(--color-tinta-tenue)]">2</p>
            <p className="mt-1 font-semibold">Lee qué artículos cita el oficio</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
              El fundamento que invoca la autoridad te dice de cuál de los tres documentos se
              trata, y por lo tanto qué plazo corre.
            </p>
          </li>
          <li className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5">
            <p className="cifra text-sm font-semibold text-[var(--color-tinta-tenue)]">3</p>
            <p className="mt-1 font-semibold">No decidas hoy la estrategia</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
              Decide hoy qué información vas a reunir. La estrategia —regularizar, impugnar o
              ambas— se decide con quien vea el expediente completo.
            </p>
          </li>
        </ol>
      </Seccion>

      <Seccion
        id="tres-papeles"
        titulo="Los tres papeles que no son lo mismo"
        descripcion="Se parecen en el sobre y se distinguen en el fundamento. La reacción correcta cambia en cada uno."
      >
        <ul className="flex flex-col gap-5">
          {DOCUMENTOS.map((d) => (
            <li key={d.clave}>
              <Tarjeta>
                <TarjetaCuerpo>
                  <Insignia tono={TONO_INSIGNIA[d.tono]}>{d.etiqueta}</Insignia>
                  <h3 className="mt-3 text-xl font-semibold">{d.titulo}</h3>
                  <p className="mt-2 leading-relaxed text-[var(--color-tinta-suave)]">{d.queEs}</p>

                  <dl className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                        Dónde está en la norma
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                        {d.fundamento}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                        Qué corresponde hacer
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                        {d.reaccion}
                      </dd>
                    </div>
                  </dl>

                  <Nota tono={d.tono === 'neutro' ? 'info' : 'atencion'} className="mt-4">
                    <p>{d.advertencia}</p>
                  </Nota>
                </TarjetaCuerpo>
              </Tarjeta>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion
        id="el-reloj"
        titulo="El reloj: plazos con su artículo"
        descripcion="Los plazos fijados en días de la Ley Federal de Procedimiento Administrativo excluyen los inhábiles por disposición de su art. 28. Los del Reglamento ya dicen «hábiles» en su texto."
      >
        <TablaPlazos filas={PLAZOS} etiqueta="Plazos que corren en tu contra, con su fundamento" />

        <h3 className="mt-10 text-xl font-semibold">Plazos que corren a tu favor</h3>
        <p className="mt-2 text-sm text-[var(--color-tinta-suave)]">
          Son límites a la autoridad. No los invoques por tu cuenta sin verificar cómo se computan
          en tu caso: de eso depende que sirvan o que no.
        </p>
        <div className="mt-4">
          <TablaPlazos
            filas={PLAZOS_A_FAVOR}
            etiqueta="Límites temporales a las facultades de la autoridad"
          />
        </div>

        <Nota tono="info" className="mt-5" titulo="Un plazo que aquí no verás">
          <p>
            No publicamos un término para responder una carta invitación. Ninguna de las tres
            disposiciones que rigen la materia lo fija, y una cifra sin artículo detrás no sirve
            para decidir. Está explicado más abajo, en{' '}
            <a href="#sin-confirmar" className="underline underline-offset-2">
              lo que no pudimos confirmar
            </a>
            .
          </p>
        </Nota>
      </Seccion>

      <Seccion id="no-responder" titulo={NO_RESPONDER.titulo}>
        <p className="prosa text-[var(--color-tinta-suave)]">{NO_RESPONDER.entrada}</p>

        <div className="mt-5">
          <ListaConVinetas items={NO_RESPONDER.puntos} tono="negativo" />
        </div>

        {sancionRequerimiento && (
          <Tarjeta className="mt-6">
            <TarjetaCuerpo>
              <Insignia tono="rojo">
                Art. 54, fr. {sancionRequerimiento.fraccion} LFPIORPI
              </Insignia>
              <p className="mt-2 leading-relaxed">{sancionRequerimiento.supuesto}</p>
              <p className="mt-3 text-sm">
                <Link
                  href="/herramientas/calculadora-multas"
                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                >
                  Consulta el rango aplicable en la calculadora de multas
                </Link>
              </p>
            </TarjetaCuerpo>
          </Tarjeta>
        )}

        {/* Sólo una nota de la página lleva `tono="riesgo"`, y es la de la
            espontaneidad. `riesgo` marca el bloque con `role="alert"`: tres de
            ellas en la misma página se anuncian una tras otra al cargar y
            dejan de significar nada. */}
        <Nota tono="atencion" className="mt-6" titulo="Por qué el silencio sale caro">
          <p>{NO_RESPONDER.cierre}</p>
        </Nota>
      </Seccion>

      <Seccion
        id="articulo-55"
        titulo="Artículo 55: abstención por única ocasión y reducción"
        descripcion="Dos beneficios distintos. Ninguno de los dos es automático."
      >
        <p className="prosa text-[var(--color-tinta-suave)]">{ART_55.entrada}</p>

        <ul className="mt-5 grid gap-5 md:grid-cols-2">
          {escenarios.map((e) => (
            <li key={e.clave}>
              <Tarjeta className="h-full">
                <TarjetaCuerpo>
                  <Insignia tono={e.factorReduccion === 0 ? 'verde' : 'marino'}>
                    {e.factorReduccion === 0
                      ? 'Art. 55, primer párrafo'
                      : 'Art. 55, segundo párrafo'}
                  </Insignia>
                  <h3 className="mt-3 text-lg font-semibold">{e.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {e.factorReduccion === 0
                      ? ART_55.literalPrimerParrafo
                      : ART_55.literalSegundoParrafo}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                    Requisitos
                  </p>
                  <ul className="mt-1 list-disc space-y-1.5 pl-5 text-sm text-[var(--color-tinta-suave)]">
                    {e.requisitos.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  <Nota tono="atencion" className="mt-4">
                    <p>{e.advertencia}</p>
                  </Nota>
                </TarjetaCuerpo>
              </Tarjeta>
            </li>
          ))}
        </ul>

        <Nota tono="info" className="mt-5" titulo="No es el artículo 56">
          <p>{ART_55.ojo}</p>
        </Nota>

        <h3 className="mt-10 text-xl font-semibold">{ESCRITO_RECONOCIMIENTO.titulo}</h3>
        <p className="mt-2 text-sm text-[var(--color-tinta-suave)]">
          {ESCRITO_RECONOCIMIENTO.fundamento}
        </p>
        <ol className="mt-4 flex flex-col gap-3">
          {ESCRITO_RECONOCIMIENTO.requisitos.map((r, i) => (
            <li
              key={r}
              className="flex gap-3 rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <span className="cifra shrink-0 font-semibold text-[var(--color-tinta-tenue)]">
                {String.fromCharCode(97 + i)})
              </span>
              <span className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">{r}</span>
            </li>
          ))}
        </ol>
        <Nota tono="atencion" className="mt-5" titulo="La palabra que decide">
          <p>{ESCRITO_RECONOCIMIENTO.advertencia}</p>
        </Nota>
      </Seccion>

      <Seccion id="espontaneidad" titulo={ESPONTANEIDAD.titulo}>
        <Nota tono="riesgo" titulo="Esto casi nadie lo publica, y cambia la decisión">
          {ESPONTANEIDAD.parrafos.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Nota>

        <h3 className="mt-8 text-xl font-semibold">
          Aun así, presentar el aviso atrasado casi siempre conviene
        </h3>
        <div className="mt-3">
          <ListaConVinetas items={ESPONTANEIDAD.peroSiSirve} tono="positivo" />
        </div>
        <p className="mt-4 text-sm">
          <Link
            href="/multas"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            Ver la diferencia entre presentar tarde y no presentar
          </Link>
        </p>
      </Seccion>

      <Seccion
        id="orden"
        titulo="En qué orden regularizar"
        descripcion="La ley no publica un orden. Este lo imponen la mecánica del portal y la exigencia de «totalidad» del art. 55 Bis del Reglamento."
      >
        <ol className="flex flex-col gap-4">
          {PASOS_REGULARIZACION.map((p) => (
            <li key={p.orden}>
              <Tarjeta>
                <TarjetaCuerpo className="flex gap-4">
                  <span className="cifra shrink-0 text-2xl font-semibold text-[var(--color-tinta-tenue)]">
                    {p.orden}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{p.titulo}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                      {p.detalle}
                    </p>
                    <p className="mt-2">
                      <Insignia tono="petroleo">{p.fundamento}</Insignia>
                    </p>
                  </div>
                </TarjetaCuerpo>
              </Tarjeta>
            </li>
          ))}
        </ol>

        <Nota tono="atencion" className="mt-5" titulo="Ordenar no es lo mismo que apresurar">
          <p>
            Los pasos 2 y 3 son los que más tardan, y son justamente los que el escrito del paso 4
            debe acreditar. Empezar por el escrito para «ganar tiempo» produce lo contrario: una
            falta reconocida por escrito y un requisito sin cumplir.
          </p>
        </Nota>
      </Seccion>

      <Seccion
        id="defensa"
        titulo="Medios de defensa y sus plazos"
        descripcion="El art. 61 de la ley abre dos caminos contra una sanción administrativa impuesta conforme a la LFPIORPI."
      >
        <ul className="grid gap-5 md:grid-cols-2">
          {MEDIOS_DEFENSA.map((m) => (
            <li key={m.clave}>
              <Tarjeta className="h-full">
                <TarjetaCuerpo>
                  <h3 className="text-lg font-semibold">{m.titulo}</h3>
                  <p className="cifra mt-2 text-lg font-semibold text-[var(--color-rojo)]">
                    {m.plazo}
                  </p>
                  <p className="text-xs text-[var(--color-tinta-tenue)]">{m.fundamento}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {m.descripcion}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                    Ante quién
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {m.ante}
                  </p>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[var(--color-tinta-suave)]">
                    {m.consideraciones.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </TarjetaCuerpo>
              </Tarjeta>
            </li>
          ))}
        </ul>

        <h3 className="mt-10 text-xl font-semibold">Cuándo conviene abogado</h3>
        <p className="mt-2 text-sm text-[var(--color-tinta-suave)]">
          En un caso real, siempre. Estos supuestos son los que no admiten esperar.
        </p>
        <div className="mt-4">
          <ListaConVinetas items={CUANDO_ABOGADO} />
        </div>

        <p className="mt-5 text-sm">
          <Link
            href="/directorio"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            Directorio de abogados y contadores especializados
          </Link>
        </p>
      </Seccion>

      <Seccion id="que-no-hacer" titulo="Qué no hacer">
        <ul className="grid gap-4 md:grid-cols-2">
          {QUE_NO_HACER.map((q) => (
            <li
              key={q.titulo}
              className="rounded-[var(--radius-card)] border-[color-mix(in_srgb,var(--color-rojo)_32%,transparent)] border p-5"
            >
              <p className="font-semibold">{q.titulo}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {q.porque}
              </p>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion
        id="sin-confirmar"
        titulo="Lo que no pudimos confirmar en fuente oficial"
        descripcion="Publicar esto vale más que rellenar el hueco con una cifra que circula por internet."
      >
        <ul className="flex flex-col gap-4">
          {SIN_CONFIRMAR.map((s) => (
            <li key={s.tema}>
              <Tarjeta>
                <TarjetaCuerpo>
                  <Insignia tono="ambar">Sin confirmar</Insignia>
                  <h3 className="mt-2 text-lg font-semibold">{s.tema}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {s.porque}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                    Dónde confirmarlo
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {s.dondeBuscar}
                  </p>
                </TarjetaCuerpo>
              </Tarjeta>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion id="preguntas" titulo="Preguntas frecuentes">
        <PreguntasFrecuentes preguntas={FAQ_REQUERIMIENTO} id="lista-preguntas" />
      </Seccion>

      <Seccion
        id="fuentes"
        titulo="Fuentes consultadas"
        descripcion={`Textos oficiales leídos íntegros para redactar esta página, consultados el ${formatearFechaLarga(CONSULTA_FUENTES)}.`}
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {FUENTES_CONSULTADAS.map((f) => (
            <li key={f.url}>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 flex-col justify-center rounded-[var(--radius-control)] border border-[var(--color-borde)] px-4 py-3 transition-colors duration-150 hover:bg-[var(--color-marfil-hondo)]"
              >
                <span className="flex items-center gap-1.5 font-medium text-[var(--color-petroleo-hondo)]">
                  {f.nombre}
                  <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
                </span>
                <span className="mt-0.5 text-sm leading-snug text-[var(--color-tinta-tenue)]">
                  {f.detalle}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm text-[var(--color-tinta-tenue)]">
          El listado completo, con el estado de cada fuente y cuándo la revisamos, está en{' '}
          <Link href="/fuentes-oficiales" className="underline underline-offset-4">
            fuentes oficiales
          </Link>
          .
        </p>
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Herramientas',
            enlaces: [
              { href: '/herramientas/calculadora-multas', etiqueta: 'Estimador de multas' },
              { href: '/herramientas/fecha-limite-aviso', etiqueta: 'Fecha límite de aviso' },
              { href: '/herramientas/cuestionario', etiqueta: '¿Me aplica la ley?' },
            ],
          },
          {
            titulo: 'Contenido relacionado',
            enlaces: [
              { href: '/multas', etiqueta: 'Multas y sanciones: arts. 53, 54 y 55' },
              { href: '/obligaciones', etiqueta: 'Las obligaciones que se verifican' },
              { href: '/plantillas', etiqueta: 'Plantillas de cumplimiento' },
            ],
          },
          {
            titulo: 'Encontrar ayuda',
            enlaces: [
              { href: '/directorio', etiqueta: 'Directorio profesional' },
              { href: '/fuentes-oficiales', etiqueta: 'Fuentes oficiales' },
              { href: '/metodologia-editorial', etiqueta: 'Cómo verificamos esto' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
