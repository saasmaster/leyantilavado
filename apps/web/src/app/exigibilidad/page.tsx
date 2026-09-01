import type { Metadata } from 'next';
import Link from 'next/link';
import { datos, formatearFechaCorta, formatearFechaLarga } from '@leyantilavado/rules-engine';
import type { FuenteOficial, HitoCalendario, Procedencia } from '@leyantilavado/types';
import { Insignia, Nota, SelloProcedencia, TablaEnvoltura } from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  Migas,
  PreguntasFrecuentes,
  Seccion,
  jsonLdArticulo,
} from '@/components/contenido';
import { MODIFICADO_EN, PUBLICADO_DESDE, REVISION_VIGENTE } from '@/content/autores';
import { construirMetadata, jsonLdFAQ, jsonLdMigaDePan } from '@/lib/sitio';
import { EstadoHoy } from './EstadoHoy';

/* ────────────────────────────────────────────────────────────────────────────
 * ¿Esto ya me es exigible?
 *
 * Todo lo que se ve aquí sale del motor: `datos.CALENDARIO`,
 * `datos.PENDIENTES_SIN_FECHA`, `datos.OBLIGACIONES` y `datos.FUENTES_POR_ID`.
 * No hay una sola fecha escrita a mano en este archivo, ni siquiera la del 30
 * de noviembre: si el DOF corrige un transitorio, la página se mueve sola.
 *
 * La distinción que justifica la página es la de tres estados, que el propio
 * dato ya soporta:
 *
 *   · fecha PUBLICADA en el instrumento           → `confirmadoOficialmente: true`
 *   · fecha CALCULADA a partir de un plazo en meses → `confirmadoOficialmente: false`
 *   · obligación SIN FECHA                        → `PENDIENTES_SIN_FECHA`
 *
 * Y un cuarto caso que sólo aparece al cruzar los datos: obligaciones del
 * catálogo que NINGÚN hito del Acuerdo menciona. Su fundamento es la ley
 * vigente, no un transitorio, así que no esperan a este calendario. Callarlas
 * dejaría a media tabla creyendo que todo empieza en noviembre.
 * ────────────────────────────────────────────────────────────────────────── */

const RUTA = '/exigibilidad';
const TITULO = '¿Esto ya me es exigible? Obligaciones y fechas';
const DESCRIPCION =
  'Una fila por obligación: desde cuándo te la pueden exigir, si esa fecha está publicada o sólo calculada, y el artículo del que sale.';

export const metadata: Metadata = construirMetadata({
  titulo: TITULO,
  descripcion: DESCRIPCION,
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: PUBLICADO_DESDE,
  actualizadoEn: MODIFICADO_EN,
});

/* ── Cruce de datos ──────────────────────────────────────────────────────── */

type Origen = 'ley-vigente' | 'acuerdo' | 'sin-fecha';

interface Fila {
  slug: string;
  titulo: string;
  resumen: string;
  origen: Origen;
  /** ISO de inicio. `null` cuando no hay fecha que mostrar. */
  fecha: string | null;
  fechaFin: string | null;
  /** Lo que se imprime en la columna «Exigible desde». */
  fechaTexto: string;
  /** Sólo tiene sentido cuando `origen === 'acuerdo'`. */
  confirmada: boolean;
  /** De qué hito —o de qué ausencia de hito— sale la fecha. */
  procede: string;
  /** Advertencia editorial del dato, cuando la trae. */
  nota: string | null;
  /** Hitos posteriores que vuelven a tocar la misma obligación. */
  tambien: string[];
  /** Fundamento de la obligación. */
  disposicion: string;
  /** Fundamento de la FECHA, cuando la pone el Acuerdo. Es otra cosa. */
  disposicionFecha: string | null;
  fuentes: readonly FuenteOficial[];
}

const HITOS_ORDENADOS: readonly HitoCalendario[] = [...datos.CALENDARIO].sort((a, b) =>
  a.fecha.localeCompare(b.fecha),
);

/**
 * Primer hito que hace exigible cada obligación.
 *
 * Una obligación puede aparecer en más de un hito —el manual entra en vigor el
 * mismo día que el Acuerdo y vuelve a moverse cuando debe incorporar la
 * metodología de riesgos—. La fecha de la fila es la del PRIMER hito, y los
 * demás se listan aparte: quedarse sólo con el primero haría creer que después
 * ya no cambia nada.
 */
const PRIMER_HITO = new Map<string, HitoCalendario>();
const HITOS_POSTERIORES = new Map<string, HitoCalendario[]>();

for (const hito of HITOS_ORDENADOS) {
  for (const slug of hito.obligaciones) {
    if (PRIMER_HITO.has(slug)) {
      HITOS_POSTERIORES.set(slug, [...(HITOS_POSTERIORES.get(slug) ?? []), hito]);
    } else {
      PRIMER_HITO.set(slug, hito);
    }
  }
}

type Pendiente = (typeof datos.PENDIENTES_SIN_FECHA)[number];

const PENDIENTE_POR_SLUG = new Map<string, Pendiente>(
  datos.PENDIENTES_SIN_FECHA.flatMap((p) =>
    p.obligaciones.map((slug): [string, Pendiente] => [slug, p]),
  ),
);

/**
 * Fuentes de una fila: las de la obligación MÁS las de la fecha.
 *
 * Son distintas a propósito. El fundamento de la obligación vive en la
 * LFPIORPI; el de la fecha, en un transitorio del Acuerdo publicado en el DOF.
 * Enseñar sólo una de las dos deja media fila sin poder comprobarse.
 */
const fuentesDe = (...ps: Procedencia[]): readonly FuenteOficial[] => {
  const ids = [...new Set(ps.flatMap((p) => p.fuentes))];
  return ids.map((id) => datos.FUENTES_POR_ID[id]).filter((f): f is FuenteOficial => f !== undefined);
};

const rango = (h: HitoCalendario): string =>
  h.fechaFin === undefined
    ? formatearFechaLarga(h.fecha)
    : `Del ${formatearFechaLarga(h.fecha)} al ${formatearFechaLarga(h.fechaFin)}`;

const ORDEN: Record<Origen, number> = { 'ley-vigente': 0, acuerdo: 1, 'sin-fecha': 2 };

const FILAS: Fila[] = datos.OBLIGACIONES.map((o): Fila => {
  const base = {
    slug: o.slug,
    titulo: o.titulo,
    resumen: o.resumen,
    disposicion: o.procedencia.disposicion,
    tambien: (HITOS_POSTERIORES.get(o.slug) ?? []).map(
      (h) => `${formatearFechaLarga(h.fecha)}: ${h.titulo}`,
    ),
  };

  const hito = PRIMER_HITO.get(o.slug);
  if (hito !== undefined) {
    return {
      ...base,
      origen: 'acuerdo',
      fecha: hito.fecha,
      fechaFin: hito.fechaFin ?? null,
      fechaTexto: rango(hito),
      confirmada: hito.confirmadoOficialmente,
      procede: hito.titulo,
      nota: hito.confirmadoOficialmente ? null : (hito.procedencia.notaEditorial ?? null),
      disposicionFecha: hito.procedencia.disposicion,
      fuentes: fuentesDe(o.procedencia, hito.procedencia),
    };
  }

  const pendiente = PENDIENTE_POR_SLUG.get(o.slug);
  if (pendiente !== undefined) {
    return {
      ...base,
      origen: 'sin-fecha',
      fecha: null,
      fechaFin: null,
      fechaTexto: 'Sin fecha publicada',
      confirmada: false,
      procede: pendiente.titulo,
      nota: pendiente.descripcion,
      disposicionFecha: pendiente.procedencia.disposicion,
      fuentes: fuentesDe(o.procedencia, pendiente.procedencia),
    };
  }

  return {
    ...base,
    origen: 'ley-vigente',
    fecha: null,
    fechaFin: null,
    fechaTexto: 'No la escalona el Acuerdo 115/2026',
    confirmada: false,
    procede: 'Ninguno: esta obligación no aparece en ningún hito del calendario del Acuerdo.',
    nota: null,
    disposicionFecha: null,
    fuentes: fuentesDe(o.procedencia),
  };
}).sort(
  (a, b) =>
    ORDEN[a.origen] - ORDEN[b.origen] ||
    (a.fecha ?? '').localeCompare(b.fecha ?? '') ||
    a.titulo.localeCompare(b.titulo, 'es-MX'),
);

/** Los hitos que efectivamente vuelven exigible algo. Los demás no son escalones. */
const ESCALONES = HITOS_ORDENADOS.filter((h) => h.obligaciones.length > 0);

const PROCEDENCIA_BASE = HITOS_ORDENADOS[0]?.procedencia;

const YA_CORREN = FILAS.filter((f) => f.origen === 'ley-vigente').length;
const CON_FECHA_PUBLICADA = FILAS.filter((f) => f.origen === 'acuerdo' && f.confirmada).length;
const CON_FECHA_CALCULADA = FILAS.filter((f) => f.origen === 'acuerdo' && !f.confirmada).length;
const SIN_FECHA = FILAS.filter((f) => f.origen === 'sin-fecha').length;

const plural = (n: number, una: string, varias: string) => (n === 1 ? una : varias);

/**
 * La respuesta directa también se compone con las fechas del motor. Escribirla
 * a mano sería el mismo error que la página denuncia, sólo que en prosa.
 */
const RESPUESTA_DIRECTA = [
  'Depende de cuál obligación: no todas empiezan el mismo día.',
  `${YA_CORREN} de las ${FILAS.length} obligaciones del catálogo no las escalona el Acuerdo 115/2026 y ya corren, porque su fundamento es la ley vigente y no un transitorio.`,
  `Las demás entran por escalones: ${ESCALONES.map((h) => formatearFechaCorta(h.fecha)).join(', ')}.`,
  `De esas fechas, ${CON_FECHA_PUBLICADA} ${plural(CON_FECHA_PUBLICADA, 'está publicada', 'están publicadas')} en el instrumento y ${CON_FECHA_CALCULADA} ${plural(CON_FECHA_CALCULADA, 'sale', 'salen')} de convertir un plazo en meses, así que hay que confirmarla antes de usarla como fecha límite.`,
  `${SIN_FECHA} ${plural(SIN_FECHA, 'obligación sigue', 'obligaciones siguen')} sin fecha cierta.`,
].join(' ');

const INDICE = [
  { id: 'escalones', titulo: 'Los escalones, en orden' },
  { id: 'tabla', titulo: 'Obligación por obligación' },
  { id: 'publicada-o-calculada', titulo: 'Fecha publicada frente a fecha calculada' },
  { id: 'preguntas', titulo: 'Preguntas frecuentes' },
];

const FAQ = [
  {
    pregunta: '¿Qué significa que una fecha esté «calculada» y no publicada?',
    respuesta:
      'Que el texto oficial no fijó un día de calendario, sino un plazo en meses contado desde la entrada en vigor. La fecha que ves es la conversión aritmética de ese plazo: sirve para ordenar la línea de tiempo y para planear, pero no es una fecha publicada. Antes de usarla como fecha límite operativa hay que confirmarla contra el transitorio aplicable. Distinguir una cosa de la otra es la razón de ser de esta página.',
  },
  {
    pregunta: '¿Por qué hay obligaciones que no tienen fecha en esta tabla?',
    respuesta:
      'Por dos motivos distintos, y la tabla los separa. Unas no aparecen en ningún hito del Acuerdo porque su fundamento es la ley vigente: no esperan a este calendario, ya corren. Otras sí dependen del Acuerdo, pero su exigibilidad está diferida hasta que la autoridad publique un instrumento que todavía no aparece publicado; a ésas no les ponemos fecha porque sería inventarla.',
  },
  {
    pregunta: 'Si una obligación ya existía antes, ¿qué cambia en la fecha que muestra la tabla?',
    respuesta:
      'La fecha marca desde cuándo son exigibles las reglas nuevas sobre esa obligación, no desde cuándo nació la obligación. Integrar expedientes, por ejemplo, ya se exigía; lo que entra en la fecha del calendario es la forma en que el Acuerdo 115/2026 manda integrarlos. Leer la fecha como si la obligación empezara ese día es el malentendido más frecuente.',
  },
  {
    pregunta: '¿Por qué la columna «estado hoy» aparece un instante después que el resto?',
    respuesta:
      'Porque se calcula en tu navegador contra la fecha real de hoy. Si la calculáramos al construir el sitio, quedaría congelada en la fecha del despliegue y la tabla mentiría durante meses. Las fechas, el fundamento y la fuente sí están en el HTML desde el primer momento y se leen sin JavaScript.',
  },
  {
    pregunta: 'Si todo lo de mi fila ya es exigible, ¿quiere decir que cumplo?',
    respuesta:
      'No. Esta tabla dice desde cuándo te lo pueden exigir, no si lo tienes resuelto. Ninguna herramienta puede certificar cumplimiento desde una pantalla, y este sitio no lo hace: lo más que decimos es qué te tocaría tener y con qué fundamento, para que lo contrastes o se lo lleves a quien te asesora.',
  },
];

const TONO_ORIGEN: Record<Origen, 'verde' | 'petroleo' | 'ambar'> = {
  'ley-vigente': 'verde',
  acuerdo: 'petroleo',
  'sin-fecha': 'ambar',
};

/* ────────────────────────────────────────────────────────────────────────── */

export default function PaginaExigibilidad() {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: '¿Ya me es exigible?', ruta: RUTA },
  ];

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: TITULO,
          descripcion: DESCRIPCION,
          ruta: RUTA,
          publicadoEn: PUBLICADO_DESDE,
          actualizadoEn: MODIFICADO_EN,
          seccion: 'Cumplimiento',
        })}
      />
      <JsonLd datos={jsonLdFAQ(FAQ)} />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo="¿Esto ya me es exigible?"
        etiquetas={[
          { texto: `${FILAS.length} obligaciones`, tono: 'marino' },
          { texto: `${YA_CORREN} ya corren`, tono: 'verde' },
          { texto: `${CON_FECHA_PUBLICADA} con fecha publicada`, tono: 'petroleo' },
          ...(CON_FECHA_CALCULADA > 0
            ? ([{ texto: `${CON_FECHA_CALCULADA} con fecha calculada`, tono: 'ambar' }] as const)
            : []),
          ...(SIN_FECHA > 0
            ? ([{ texto: `${SIN_FECHA} sin fecha`, tono: 'neutro' }] as const)
            : []),
        ]}
        respuestaDirecta={RESPUESTA_DIRECTA}
        entradilla="El Acuerdo 115/2026 no encendió todas las obligaciones el mismo día, y algunas ni siquiera dependen de él. Esta tabla toma cada obligación del catálogo y dice desde cuándo te la pueden exigir, si esa fecha está publicada o sólo calculada, y de qué artículo sale."
      />

      <IndiceContenidos entradas={INDICE} />

      <Nota tono="atencion" titulo="Cómo leer esta tabla antes de usarla">
        <p>
          <strong>La fecha no es la fecha de nacimiento de la obligación.</strong> Varias de estas
          obligaciones ya se exigían: lo que entra en la fecha del calendario son las reglas nuevas
          del Acuerdo sobre ellas. Leerlo al revés —«esto empieza ese día»— es el malentendido más
          caro de esta materia.
        </p>
        <p>
          <strong>Publicada no es lo mismo que calculada.</strong> Cuando el instrumento fija un
          plazo en meses en lugar de un día de calendario, la fecha que ves es una conversión
          aritmética nuestra y va marcada como tal. Sirve para planear; no para tomarla como fecha
          límite sin confirmarla.
        </p>
        <p>
          <strong>Las fechas son nominales.</strong> No las recorremos por sábados, domingos ni días
          inhábiles: hacerlo sin una regla oficial registrada sería inventar derecho. Donde la norma
          habla de «último día hábil», el propio hito lo advierte.
        </p>
      </Nota>

      <Seccion
        id="escalones"
        titulo="Los escalones, en orden"
        descripcion={`Los ${ESCALONES.length} hitos del calendario que efectivamente vuelven exigible algo. Los demás hitos del Acuerdo existen, pero no encienden ninguna obligación del catálogo.`}
      >
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ESCALONES.map((h) => (
            <li
              key={h.id}
              className="tarjeta flex flex-col gap-2 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Insignia tono={h.confirmadoOficialmente ? 'petroleo' : 'ambar'}>
                  {h.confirmadoOficialmente ? 'Fecha publicada' : 'Fecha calculada'}
                </Insignia>
              </div>
              <p className="cifra text-sm font-semibold text-[var(--color-tinta)]">{rango(h)}</p>
              <p className="text-sm leading-snug text-[var(--color-tinta-suave)]">{h.titulo}</p>
              <p className="mt-auto border-t border-[var(--color-borde)] pt-2 text-xs text-[var(--color-tinta-tenue)]">
                {h.obligaciones.length}{' '}
                {plural(h.obligaciones.length, 'obligación', 'obligaciones')} ·{' '}
                {h.procedencia.disposicion}
              </p>
            </li>
          ))}
        </ol>
      </Seccion>

      <Seccion
        id="tabla"
        titulo="Obligación por obligación"
        descripcion="Una fila, una afirmación: qué es, desde cuándo te la pueden exigir, en qué estado está hoy, con qué fundamento y contra qué fuente oficial puedes comprobarlo."
      >
        <TablaEnvoltura etiqueta="Exigibilidad de las obligaciones de la LFPIORPI">
          <table className="w-full min-w-[68rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Fecha de exigibilidad de cada obligación de la LFPIORPI según el Acuerdo 115/2026, con
              el fundamento y la fuente oficial de cada fila.
            </caption>
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Obligación
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Exigible desde
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Estado hoy
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Fundamento
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Fuente oficial
                </th>
              </tr>
            </thead>
            <tbody>
              {FILAS.map((f) => (
                <tr key={f.slug} className="border-t border-[var(--color-borde)] align-top">
                  <th scope="row" className="px-4 py-4 font-normal">
                    <Link
                      href={`/obligaciones/${f.slug}`}
                      className="font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                    >
                      {f.titulo}
                    </Link>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-tinta-suave)]">
                      {f.resumen}
                    </p>
                  </th>

                  <td className="px-4 py-4">
                    <p className="cifra font-medium text-[var(--color-tinta)]">{f.fechaTexto}</p>
                    <p className="mt-1.5">
                      <Insignia tono={TONO_ORIGEN[f.origen]}>
                        {f.origen === 'ley-vigente'
                          ? 'No depende del Acuerdo'
                          : f.origen === 'sin-fecha'
                            ? 'Sin fecha cierta'
                            : f.confirmada
                              ? 'Fecha publicada'
                              : 'Fecha calculada, sin confirmar'}
                      </Insignia>
                    </p>
                    <p className="mt-1.5 text-xs text-[var(--color-tinta-tenue)]">{f.procede}</p>
                    {f.nota !== null && (
                      <p className="mt-1.5 text-xs text-[var(--color-ambar)]">{f.nota}</p>
                    )}
                    {f.tambien.length > 0 && (
                      <div className="mt-2 border-t border-[var(--color-borde)] pt-2">
                        <p className="text-xs font-medium text-[var(--color-tinta)]">
                          Vuelve a moverse:
                        </p>
                        <ul className="mt-1 flex flex-col gap-1 text-xs text-[var(--color-tinta-suave)]">
                          {f.tambien.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {f.origen === 'acuerdo' && f.fecha !== null ? (
                      <EstadoHoy
                        fecha={f.fecha}
                        {...(f.fechaFin !== null ? { fechaFin: f.fechaFin } : {})}
                      />
                    ) : f.origen === 'ley-vigente' ? (
                      <div className="flex flex-col items-start gap-1">
                        <Insignia tono="verde">Ya exigible</Insignia>
                        <span className="text-xs text-[var(--color-tinta-tenue)]">
                          No espera a este calendario.
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1">
                        <Insignia tono="ambar">Sin fecha confirmada</Insignia>
                        <span className="text-xs text-[var(--color-tinta-tenue)]">
                          No le ponemos cuenta regresiva: sería inventarla.
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4 text-xs text-[var(--color-tinta-suave)]">
                    <p>
                      <span className="text-[var(--color-tinta-tenue)]">La obligación: </span>
                      {f.disposicion}
                    </p>
                    {f.disposicionFecha !== null && (
                      <p className="mt-1.5">
                        <span className="text-[var(--color-tinta-tenue)]">La fecha: </span>
                        {f.disposicionFecha}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4 text-xs">
                    {f.fuentes.length === 0 ? (
                      <span className="text-[var(--color-ambar)]">
                        Sin fuente registrada para esta fila.
                      </span>
                    ) : (
                      <ul className="flex flex-col gap-1.5">
                        {f.fuentes.map((fuente) => (
                          <li key={fuente.id}>
                            <a
                              href={fuente.url}
                              rel="noopener noreferrer nofollow"
                              target="_blank"
                              className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                            >
                              {fuente.nombre}
                            </a>
                            <span className="block text-[var(--color-tinta-tenue)]">
                              {fuente.emisor}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>
      </Seccion>

      <Seccion
        id="publicada-o-calculada"
        titulo="Fecha publicada frente a fecha calculada"
        descripcion="Es la distinción que esta página existe para no perder."
      >
        <div className="prosa">
          <p>
            Los artículos transitorios del Acuerdo 115/2026 no hablan siempre igual. A veces fijan un
            día de calendario y a veces un plazo en meses contado desde la entrada en vigor. Convertir
            el segundo caso en una fecha es aritmética trivial, y ahí está la trampa: el resultado se
            ve exactamente igual que una fecha publicada, se copia igual de fácil a un plan de
            proyecto y ya no hay forma de saber cuál era cuál.
          </p>
          <p>
            Por eso el motor guarda ese dato aparte, y por eso cada fila lo dice a la vista. De las{' '}
            {CON_FECHA_PUBLICADA + CON_FECHA_CALCULADA} obligaciones que el Acuerdo escalona,{' '}
            {CON_FECHA_PUBLICADA} tienen fecha publicada y {CON_FECHA_CALCULADA}{' '}
            {plural(CON_FECHA_CALCULADA, 'sale', 'salen')} de un plazo en meses. Las segundas sirven
            para ordenar el trabajo y para saber en qué trimestre cae la carga; no para firmar un
            compromiso con esa fecha ni para calcular un riesgo de sanción.
          </p>
          <p>
            El tercer caso es distinto y no es una variante del segundo: hay obligaciones cuya
            exigibilidad quedó atada a que la autoridad publique un instrumento que todavía no
            aparece publicado. Ahí no hay plazo que convertir. Ponerles una fecha —cualquiera— sería
            fabricarla, así que se quedan sin ella y se dice por qué.
          </p>
          <p>
            Y conviene repetir lo que la tabla ya marca: {YA_CORREN} de las {FILAS.length}{' '}
            obligaciones del catálogo no aparecen en ningún hito. No es un hueco de la tabla, es el
            dato: cuelgan de la ley vigente y corren desde que realizas la actividad vulnerable. Si
            alguien está esperando a noviembre para empezar con ellas, lleva tiempo tarde.
          </p>
        </div>
      </Seccion>

      <Seccion
        id="preguntas"
        titulo="Preguntas frecuentes"
        descripcion="Las dudas que se repiten cuando alguien lee un calendario legal por primera vez."
      >
        <PreguntasFrecuentes preguntas={FAQ} id="lista-preguntas" />
      </Seccion>

      {PROCEDENCIA_BASE !== undefined && (
        <SelloProcedencia
          className="mt-10"
          procedencia={{
            ...PROCEDENCIA_BASE,
            disposicion:
              'Artículos Transitorios del Acuerdo 115/2026 y disposiciones de la LFPIORPI citadas en cada fila',
          }}
          fuentes={datos.FUENTES_POR_ID}
        />
      )}

      <Nota tono="info" titulo="Lo que esta tabla no dice" className="mt-6">
        <p>
          No dice que cumplas. Dice desde cuándo te lo pueden exigir y con qué fundamento, para que
          lo contrastes o se lo lleves a quien te asesora. Tampoco dice que una obligación no te
          aplique: la tabla cubre el catálogo completo, y qué parte te toca depende de tu actividad
          vulnerable y de tus umbrales.
        </p>
      </Nota>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Ver las mismas fechas de otra forma',
            enlaces: [
              {
                href: '/calendario-cumplimiento',
                etiqueta: 'Calendario de cumplimiento',
                descripcion: 'Los hitos en línea de tiempo, con cuenta regresiva y exportación .ics',
              },
              {
                href: '/herramientas/plan-30-noviembre',
                etiqueta: 'Plan hacia el 30 de noviembre',
                descripcion: 'Los mismos hitos filtrados por tu actividad y tu situación de alta',
              },
              {
                href: '/acuerdo-115-2026',
                etiqueta: 'Qué obliga el Acuerdo 115/2026',
                descripcion: 'El instrumento explicado capítulo por capítulo',
              },
            ],
          },
          {
            titulo: 'Ir al detalle de una obligación',
            enlaces: [
              {
                href: '/obligaciones',
                etiqueta: 'Todas las obligaciones',
                descripcion: 'Con los pasos y la evidencia que pide cada una',
              },
              {
                href: '/umbrales',
                etiqueta: 'Umbrales de identificación y aviso',
                descripcion: 'Desde qué monto nace la obligación, por actividad',
              },
              {
                href: '/fuentes-oficiales',
                etiqueta: 'Fuentes oficiales',
                descripcion: 'Los documentos contra los que se contrasta todo el sitio',
              },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
