import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { convertirUMA, datos } from '@leyantilavado/rules-engine';
import { formatearMXN, pesosACentavos } from '@leyantilavado/types';
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
import { BandaParalaje } from '@/components/contenido/BandaParalaje';
import bandaMultas from '../../../public/img/bandas/multas.webp';
import { jsonLdArticulo } from '@/components/contenido/JsonLd';
import { REVISION_VIGENTE } from '@/content/autores';
import {
  CONSECUENCIAS_NO_PECUNIARIAS,
  CRITERIOS_GRADUACION,
  FAQ_MULTAS,
  INFRACCIONES_ART_53,
  NOTA_DISCORDANCIA_53_III,
  REGIMEN_CFF,
} from '@/content/multas';
import { construirMetadata, jsonLdFAQ, jsonLdMigaDePan } from '@/lib/sitio';

const RUTA = '/multas';

export const metadata: Metadata = construirMetadata({
  titulo: 'Multas de la Ley Antilavado 2026: arts. 53, 54 y 55',
  descripcion:
    'Infracciones del art. 53 y rangos de multa del art. 54, la diferencia entre presentar tarde y no presentar, y la autocorrección del art. 55.',
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: REVISION_VIGENTE,
  actualizadoEn: REVISION_VIGENTE,
});

const INDICE = [
  { id: 'dos-articulos', titulo: 'Dos artículos que no son lo mismo' },
  { id: 'infracciones', titulo: 'Art. 53: las conductas infractoras' },
  { id: 'rangos', titulo: 'Art. 54: los rangos de multa' },
  { id: 'graduacion', titulo: 'Cómo se gradúa el monto' },
  { id: 'autocorreccion', titulo: 'Art. 55: autocorrección (no el 56)' },
  { id: 'otras-consecuencias', titulo: 'Consecuencias que no son dinero' },
  { id: 'penal', titulo: 'Cuándo hay delito' },
  { id: 'cff', titulo: 'El régimen del CFF, aparte y en pesos' },
  { id: 'preguntas', titulo: 'Preguntas frecuentes' },
];

function RangoEnPesos({ uma }: { uma: number }) {
  return (
    <span className="cifra text-[var(--color-tinta-suave)]">
      {formatearMXN(convertirUMA(uma, REVISION_VIGENTE).equivalentePesos)}
    </span>
  );
}

export default function PaginaMultas() {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Multas y sanciones', ruta: RUTA },
  ];

  const sancionPorId = Object.fromEntries(datos.SANCIONES.map((s) => [s.id, s]));
  const procedencia = datos.SANCIONES[0]?.procedencia;

  return (
    <>
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: 'Infracciones y multas de la LFPIORPI',
          descripcion:
            'Conductas del art. 53, rangos del art. 54, autocorrección del art. 55 y régimen fiscal de beneficiario controlador.',
          ruta: RUTA,
          publicadoEn: REVISION_VIGENTE,
          actualizadoEn: REVISION_VIGENTE,
          seccion: 'Sanciones',
        })}
      />
      <JsonLd datos={jsonLdFAQ(FAQ_MULTAS.map((f) => ({ ...f })))} />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo="Multas y sanciones de la Ley Antilavado"
        etiquetas={[
          { texto: 'Arts. 53 y 54 LFPIORPI', tono: 'marino' },
          { texto: 'Autocorrección: art. 55', tono: 'petroleo' },
          { texto: `Vigente al ${REVISION_VIGENTE}`, tono: 'neutro' },
        ]}
        respuestaDirecta="El art. 53 enumera las conductas que son infracción y el art. 54 fija cuánto cuesta cada grupo de ellas. Son dos artículos distintos y casi todos los resúmenes del mercado los mezclan. La autocorrección, por su parte, vive en el art. 55: el 56 regula la revocación de permisos, que es otra cosa."
        entradilla="Los rangos que ves aquí se leen del motor de reglas y se convierten a pesos con la UMA vigente a la fecha de revisión."
      />


      <IndiceContenidos entradas={INDICE} />

      <Seccion id="dos-articulos" titulo="Dos artículos que no son lo mismo">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border-[color-mix(in_srgb,var(--color-marino)_32%,transparent)] p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
              Artículo 53
            </p>
            <p className="mt-1 text-lg font-semibold">Qué hiciste mal</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
              Lista las conductas infractoras: desde no atender un requerimiento hasta omitir
              avisos o participar en operaciones prohibidas en efectivo.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border-[color-mix(in_srgb,var(--color-rojo)_32%,transparent)] p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
              Artículo 54
            </p>
            <p className="mt-1 text-lg font-semibold">Cuánto cuesta</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
              Fija tres rangos de multa y los asigna a grupos de fracciones del art. 53. Sus
              fracciones no corresponden una a una con las del 53.
            </p>
          </div>
        </div>

        {/* Esta página enumera lo que puede costar una infracción y ahí se
            detenía. Quien llega aquí suele tener un papel del SAT en la mano y
            necesita saber qué hacer, no sólo cuánto duele: sin esta salida, la
            página asusta y deja al lector sin siguiente paso. */}
        <Nota tono="info" className="mt-5" titulo="¿Ya te llegó algo del SAT?">
          <p>
            Si tienes un requerimiento, una carta o una visita en curso, los plazos corren y el
            orden en que actúes cambia el resultado.{' '}
            <Link href="/requerimiento-sat" className="underline underline-offset-4">
              Qué hacer cuando te llega un requerimiento
            </Link>{' '}
            reúne los plazos con su artículo y explica la autocorrección del art. 55.
          </p>
        </Nota>

        <Nota tono="atencion" className="mt-5" titulo="Por qué importa la distinción">
          <p>
            Cuando alguien dice &ldquo;la fracción III son de tanto a tanto&rdquo;, la pregunta
            correcta es: ¿la fracción III de cuál artículo? La fracción III del 53 es la
            extemporaneidad; la fracción III del 54 es el rango más alto del régimen. Confundirlas
            cambia el orden de magnitud del cálculo.
          </p>
        </Nota>
      </Seccion>

      <Seccion
        id="infracciones"
        titulo="Artículo 53: las conductas infractoras"
        descripcion="Cada conducta enlaza con el rango que le corresponde en el art. 54."
      >
        <TablaEnvoltura etiqueta="Sanciones del artículo 54 de la LFPIORPI">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Conductas infractoras del art. 53 y el rango de multa que les corresponde.
            </caption>
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                  Art. 53
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Conducta
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Rango aplicable
                </th>
              </tr>
            </thead>
            <tbody>
              {INFRACCIONES_ART_53.map((inf) => {
                const s = sancionPorId[inf.reglaSancionId];
                return (
                  <tr key={inf.fraccion} className="border-t border-[var(--color-borde)] align-top">
                    <th scope="row" className="cifra whitespace-nowrap px-4 py-4 font-medium">
                      Fr. {inf.fraccion}
                    </th>
                    <td className="px-4 py-4">
                      <p className="leading-relaxed text-[var(--color-tinta)]">{inf.conducta}</p>
                      {inf.nota && (
                        <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">{inf.nota}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {s ? (
                        <>
                          <p>
                            <Insignia
                              tono={
                                s.gravedad === 'critica'
                                  ? 'rojo'
                                  : s.gravedad === 'alta'
                                    ? 'ambar'
                                    : 'marino'
                              }
                            >
                              Art. 54, fr. {s.fraccion}
                            </Insignia>
                          </p>
                          <p className="cifra mt-1 font-semibold">
                            {s.minUMA.toLocaleString('es-MX')} a {s.maxUMA.toLocaleString('es-MX')}{' '}
                            UMA
                          </p>
                          <p className="text-xs">
                            <RangoEnPesos uma={s.minUMA} /> a <RangoEnPesos uma={s.maxUMA} />
                          </p>
                          {s.alternativaPorcentaje && (
                            <p className="mt-1 text-xs text-[var(--color-rojo)]">
                              O del {s.alternativaPorcentaje.minPct}% al{' '}
                              {s.alternativaPorcentaje.maxPct}% del valor del acto, la que resulte
                              mayor.
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-[var(--color-ambar)]">
                          Requiere revisión editorial
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TablaEnvoltura>

        <Nota tono="atencion" className="mt-5" titulo={NOTA_DISCORDANCIA_53_III.titulo}>
          <p>{NOTA_DISCORDANCIA_53_III.texto}</p>
          <p>{NOTA_DISCORDANCIA_53_III.postura}</p>
        </Nota>
      </Seccion>

      <Seccion
        id="rangos"
        titulo="Artículo 54: los rangos de multa"
        descripcion={`Convertidos a pesos con la UMA vigente al ${REVISION_VIGENTE}. Cada 1 de febrero cambian sin que la ley se toque.`}
      >
        <ul className="grid gap-4 md:grid-cols-3">
          {datos.SANCIONES.map((s) => (
            <li
              key={s.id}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
            >
              <Insignia
                tono={s.gravedad === 'critica' ? 'rojo' : s.gravedad === 'alta' ? 'ambar' : 'marino'}
              >
                Art. 54, fr. {s.fraccion}
              </Insignia>
              <p className="cifra mt-3 text-lg font-semibold">
                {s.minUMA.toLocaleString('es-MX')} a {s.maxUMA.toLocaleString('es-MX')} UMA
              </p>
              <p className="text-sm">
                <RangoEnPesos uma={s.minUMA} /> a <RangoEnPesos uma={s.maxUMA} />
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {s.supuesto}
              </p>
              {s.notas && (
                <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">{s.notas}</p>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm">
          <Link
            href="/herramientas/calculadora-multas"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            Estima el rango de tu caso con la calculadora
          </Link>
        </p>
      </Seccion>

      <Seccion id="graduacion" titulo="Cómo se gradúa el monto dentro del rango">
        <ListaConVinetas items={CRITERIOS_GRADUACION} />
      </Seccion>

      <Seccion
        id="autocorreccion"
        titulo="Artículo 55: autocorrección"
        descripcion="No es el 56. El 56 regula la revocación de permisos."
      >
        <ul className="grid gap-5 md:grid-cols-2">
          {datos.ESCENARIOS_AUTOCORRECCION.map((e) => (
            <li
              key={e.clave}
              className="rounded-[var(--radius-card)] border-[color-mix(in_srgb,var(--color-verde)_32%,transparent)] p-5"
            >
              <h3 className="text-lg font-semibold">{e.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {e.descripcion}
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
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion
        id="otras-consecuencias"
        titulo="Consecuencias que no son dinero"
        descripcion="En varias actividades duelen más que la multa."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {CONSECUENCIAS_NO_PECUNIARIAS.map((c) => (
            <li
              key={c.articulo}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
            >
              <Insignia tono="neutro">{c.articulo}</Insignia>
              <p className="mt-2 font-semibold">{c.titulo}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {c.descripcion}
              </p>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion
        id="penal"
        titulo="Cuándo hay delito"
        descripcion="Tipos penales autónomos, distintos de las infracciones administrativas."
      >
        <ul className="flex flex-col gap-4">
          {datos.CONSECUENCIAS_PENALES.map((p) => (
            <li
              key={p.id}
              className="rounded-[var(--radius-card)] border-[color-mix(in_srgb,var(--color-rojo)_32%,transparent)] p-5"
            >
              <Insignia tono="rojo">Art. {p.articulo} LFPIORPI</Insignia>
              <p className="mt-2 leading-relaxed">{p.supuesto}</p>
              <p className="cifra mt-3 font-semibold">
                Prisión de {p.prisionAnios.min} a {p.prisionAnios.max} años
                {p.multaDias
                  ? ` · ${p.multaDias.min} a ${p.multaDias.max} días multa`
                  : ''}
              </p>
              <p className="mt-2 text-sm text-[var(--color-tinta-suave)]">{p.notas}</p>
            </li>
          ))}
        </ul>

        <Nota tono="info" className="mt-5" titulo="Por qué no convertimos días multa a pesos">
          <p>
            El día multa se determina conforme al Código Penal Federal en función de la percepción
            diaria del sentenciado. Convertirlo a una cifra fija en pesos daría una falsa precisión,
            así que preferimos dejarlo en sus términos.
          </p>
        </Nota>
      </Seccion>

      <Seccion id="cff" titulo={REGIMEN_CFF.titulo}>
        <p className="prosa text-[var(--color-tinta-suave)]">{REGIMEN_CFF.entrada}</p>

        <TablaEnvoltura etiqueta="Sanciones por omisiones sobre beneficiario controlador" className="mt-5">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Diferencias entre el régimen de beneficiario controlador de la LFPIORPI y el del
              Código Fiscal de la Federación.
            </caption>
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Eje
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Ley Antilavado
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Código Fiscal
                </th>
              </tr>
            </thead>
            <tbody>
              {REGIMEN_CFF.diferencias.map((d) => (
                <tr key={d.eje} className="border-t border-[var(--color-borde)] align-top">
                  <th scope="row" className="px-4 py-3 font-medium">
                    {d.eje}
                  </th>
                  <td className="px-4 py-3 text-[var(--color-tinta-suave)]">{d.lfpiorpi}</td>
                  <td className="px-4 py-3 text-[var(--color-tinta-suave)]">{d.cff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <h3 className="mt-8 text-xl font-semibold">Multas del Código Fiscal, en pesos</h3>
        <p className="mt-2 text-sm text-[var(--color-tinta-suave)]">
          Estos importes no están expresados en UMA: vienen en pesos y se aplican{' '}
          <strong>por cada beneficiario controlador</strong> respecto del cual se incumple. Se
          actualizan periódicamente, así que conviene verificarlos contra la publicación vigente
          antes de usarlos en un cálculo.
        </p>

        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {datos.SANCIONES_CFF_BENEFICIARIO_CONTROLADOR.map((s) => (
            <li
              key={s.id}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
            >
              <Insignia tono="marino">{s.articulo}</Insignia>
              <p className="cifra mt-3 text-lg font-semibold">
                {formatearMXN(pesosACentavos(s.minPesos))} a{' '}
                {formatearMXN(pesosACentavos(s.maxPesos))}
              </p>
              <p className="text-xs text-[var(--color-tinta-tenue)]">Por cada {s.porCada}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {s.supuesto}
              </p>
            </li>
          ))}
        </ul>

        <Nota tono="riesgo" className="mt-5" titulo="Se acumulan, no se sustituyen">
          <p>{REGIMEN_CFF.cierre}</p>
          <p>
            <Link href="/obligaciones/beneficiario-controlador">
              Ver cómo se identifica al beneficiario controlador
            </Link>
            .
          </p>
        </Nota>
      </Seccion>

      <Seccion id="preguntas" titulo="Preguntas frecuentes">
        <PreguntasFrecuentes preguntas={FAQ_MULTAS} id="lista-preguntas" />
      </Seccion>

      {procedencia && (
        <SelloProcedencia className="mt-10" procedencia={procedencia} fuentes={datos.FUENTES_POR_ID} />
      )}

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
              { href: '/obligaciones', etiqueta: 'Las obligaciones que se sancionan' },
              { href: '/limites-efectivo', etiqueta: 'Límites de efectivo del art. 32' },
              { href: '/umbrales', etiqueta: 'Tabla de umbrales' },
            ],
          },
          {
            titulo: 'Mantente al día',
            enlaces: [
              { href: '/reforma-ley-antilavado-2026', etiqueta: 'Qué cambió en el régimen' },
              { href: '/actualizaciones', etiqueta: 'Bitácora de cambios' },
              { href: '/glosario#multas', etiqueta: 'Definición en el glosario' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>

    {/* Cierra como sus hermanas, y sustituye al mazo que estaba antes: las
        sanciones de la LFPIORPI son administrativas —las impone la autoridad
        fiscal, no un juez— así que un mazo de tribunal sugería un proceso que
        no es el que describe esta página. */}
    <BandaParalaje imagen={bandaMultas} alt="">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold text-white md:text-4xl">
          Antes de suponer el peor escenario, calcúlalo
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-[color-mix(in_srgb,white_86%,transparent)]">
          Los rangos del artículo 54 son amplios y la autocorrección del 55 cambia el resultado.
          Ver la cifra de tu caso concreto, con su artículo, ayuda más que leer un rango.
        </p>
        <Link
          href="/herramientas/calculadora-multas"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-white px-5 font-medium text-[var(--color-marino)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          Estimar la multa de un caso
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </BandaParalaje>
    </>
  );
}
