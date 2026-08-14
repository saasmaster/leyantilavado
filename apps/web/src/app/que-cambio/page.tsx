import type { Metadata } from 'next';
import Link from 'next/link';
import { datos } from '@leyantilavado/rules-engine';
import { Insignia, Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
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
import { jsonLdArticulo } from '@/components/contenido/JsonLd';
import { REVISION_VIGENTE } from '@/content/autores';
import { CAMBIOS_ANTES_DESPUES } from '@/content/reforma';
import {
  ACTIVIDADES_CON_CAMBIO_PROPIO,
  ACTIVIDADES_SIN_CAMBIO_PROPIO,
  CAMBIOS_TRANSVERSALES,
  CLAVES_DESCONOCIDAS,
  CLAVES_SIN_ALCANCE,
  cambiosPropios,
} from '@/content/cambios-por-actividad';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';

const RUTA = '/que-cambio';
const TITULO = 'Qué cambió para mi actividad con la reforma';
const DESCRIPCION =
  'Los cambios documentados de la reforma 2025-2026, repartidos por actividad vulnerable: cuáles tocan tu fracción y cuáles alcanzan a todos.';

export const metadata: Metadata = construirMetadata({
  titulo: TITULO,
  descripcion: DESCRIPCION,
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: REVISION_VIGENTE,
  actualizadoEn: REVISION_VIGENTE,
});

const MIGAS = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Qué cambió para mi actividad', ruta: RUTA },
];

const INDICE = [
  { id: 'como-leerlo', titulo: 'Cómo leer esta página' },
  { id: 'con-cambios', titulo: 'Actividades con cambio propio documentado' },
  { id: 'sin-cambios', titulo: 'Actividades sin cambio propio documentado' },
  { id: 'para-todos', titulo: 'Lo que cambió para todos' },
];

export default function PaginaQueCambio() {
  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd
        datos={[
          jsonLdMigaDePan(MIGAS),
          jsonLdArticulo({
            titulo: TITULO,
            descripcion: DESCRIPCION,
            ruta: RUTA,
            publicadoEn: REVISION_VIGENTE,
            actualizadoEn: REVISION_VIGENTE,
            seccion: 'Marco normativo',
          }),
        ]}
      />

      <Migas items={MIGAS} />

      <CabeceraArticulo
        titulo={TITULO}
        etiquetas={[
          { texto: `${datos.ACTIVIDADES.length} actividades`, tono: 'marino' },
          { texto: `${ACTIVIDADES_CON_CAMBIO_PROPIO.length} con cambio propio`, tono: 'petroleo' },
          { texto: `${CAMBIOS_TRANSVERSALES.length} cambios para todos`, tono: 'ambar' },
        ]}
        entradilla={DESCRIPCION}
        respuestaDirecta={`De las ${datos.ACTIVIDADES.length} actividades vulnerables del art. 17, ${ACTIVIDADES_CON_CAMBIO_PROPIO.length} tienen al menos un cambio de la reforma atribuible a su propia fracción y ${ACTIVIDADES_SIN_CAMBIO_PROPIO.length} no tienen ninguno documentado. Eso no significa que a esas ${ACTIVIDADES_SIN_CAMBIO_PROPIO.length} no les haya cambiado nada: los ${CAMBIOS_TRANSVERSALES.length} cambios que alcanzan a todo sujeto obligado —conservación, aviso por sospecha, obligaciones nuevas y supervisión— les aplican igual.`}
      />

      <IndiceContenidos entradas={INDICE} />

      <Seccion
        id="como-leerlo"
        titulo="Cómo leer esta página"
        descripcion="Qué podemos comparar y qué no, dicho antes de que lo preguntes."
      >
        <div className="prosa text-[var(--color-tinta-suave)]">
          <p>
            Comparar un antes con un después exige tener las dos cifras. El motor de reglas de este
            sitio guarda sólo la vigente: sus {datos.UMBRALES.length} reglas arrancan el día en que
            entró en vigor la reforma a la ley y ninguna conserva la versión anterior. Por eso el
            «antes» no se calcula, se declara: existe únicamente para los{' '}
            {CAMBIOS_ANTES_DESPUES.length} cambios que la reforma documenta con su disposición.
          </p>
          <p>
            Donde no hay cambio documentado esta página lo dice con esas palabras. No estimamos un
            umbral histórico ni lo deducimos del contexto: en un sitio cuya promesa es que cada
            cifra tiene fuente, un número inventado valdría menos que un hueco declarado.
          </p>
        </div>

        <Nota tono="atencion" className="mt-5" titulo="Dos formas distintas de «no cambió»">
          <p>
            <strong>No hemos documentado cambios</strong> significa que la reforma no trae una fila
            comparable para esa fracción, no que la autoridad haya confirmado que el umbral sigue
            igual. Son cosas distintas y sólo podemos afirmar la primera.
          </p>
        </Nota>

        {(CLAVES_SIN_ALCANCE.length > 0 || CLAVES_DESCONOCIDAS.length > 0) && (
          <Nota tono="riesgo" className="mt-5" titulo="Cambios sin repartir">
            {CLAVES_SIN_ALCANCE.length > 0 && (
              <p>
                Hay cambios documentados que aún no atribuimos a ninguna actividad:{' '}
                {CLAVES_SIN_ALCANCE.join(', ')}. Aparecen aquí en lugar de quedar ocultos.
              </p>
            )}
            {CLAVES_DESCONOCIDAS.length > 0 && (
              <p>
                Hay reparto que apunta a un cambio inexistente: {CLAVES_DESCONOCIDAS.join(', ')}.
                Es una errata editorial pendiente de corregir.
              </p>
            )}
          </Nota>
        )}
      </Seccion>

      <Seccion
        id="con-cambios"
        titulo={`Actividades con cambio propio documentado (${ACTIVIDADES_CON_CAMBIO_PROPIO.length})`}
        descripcion="La reforma trae, para estas fracciones, al menos un antes contra el que comparar."
      >
        <ul className="grid gap-5 md:grid-cols-2">
          {ACTIVIDADES_CON_CAMBIO_PROPIO.map((a) => {
            const propios = cambiosPropios(a.slug);
            return (
              <li key={a.slug}>
                <Tarjeta className="h-full">
                  <TarjetaCuerpo className="flex h-full flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Insignia tono="marino">Fracción {a.fraccion}</Insignia>
                      <Insignia tono="petroleo">
                        {propios.length === 1 ? '1 cambio propio' : `${propios.length} cambios propios`}
                      </Insignia>
                    </div>

                    <h3 className="text-lg font-semibold">
                      <Link
                        href={`${RUTA}/${a.slug}`}
                        className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-[var(--color-petroleo)]"
                      >
                        {a.nombre}
                      </Link>
                    </h3>

                    <ul className="flex flex-col gap-2 text-sm text-[var(--color-tinta-suave)]">
                      {propios.map(({ cambio }) => (
                        <li key={cambio.clave}>
                          {cambio.supuesto}
                          <span className="mt-0.5 block text-xs text-[var(--color-tinta-tenue)]">
                            {cambio.disposicion}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <p className="mt-auto pt-1">
                      <Link
                        href={`${RUTA}/${a.slug}`}
                        className="text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                      >
                        Ver qué cambió para {a.nombreCorto.toLowerCase()}
                      </Link>
                    </p>
                  </TarjetaCuerpo>
                </Tarjeta>
              </li>
            );
          })}
        </ul>
      </Seccion>

      <Seccion
        id="sin-cambios"
        titulo={`Actividades sin cambio propio documentado (${ACTIVIDADES_SIN_CAMBIO_PROPIO.length})`}
        descripcion="Les aplican los cambios transversales, pero su fracción no tiene un antes registrado."
      >
        <ul className="grid gap-4 md:grid-cols-3">
          {ACTIVIDADES_SIN_CAMBIO_PROPIO.map((a) => (
            <li key={a.slug}>
              <Tarjeta className="h-full">
                <TarjetaCuerpo className="flex h-full flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Insignia tono="marino">Fracción {a.fraccion}</Insignia>
                    <Insignia tono="neutro">Sin cambio de umbral documentado</Insignia>
                  </div>
                  <h3 className="text-base font-semibold">
                    <Link
                      href={`${RUTA}/${a.slug}`}
                      className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-[var(--color-petroleo)]"
                    >
                      {a.nombre}
                    </Link>
                  </h3>
                  <p className="mt-auto text-sm text-[var(--color-tinta-suave)]">
                    Le aplican los {CAMBIOS_TRANSVERSALES.length} cambios de todo sujeto obligado.
                  </p>
                </TarjetaCuerpo>
              </Tarjeta>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion
        id="para-todos"
        titulo={`Lo que cambió para todos (${CAMBIOS_TRANSVERSALES.length})`}
        descripcion="No dependen de la fracción: obligan a cualquiera que realice una actividad vulnerable."
      >
        <ul className="flex flex-col gap-4">
          {CAMBIOS_TRANSVERSALES.map(({ cambio, justificacion }) => (
            <li
              key={cambio.clave}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
            >
              <h3 className="font-semibold text-[var(--color-tinta)]">{cambio.supuesto}</h3>
              <p className="mt-1 text-xs text-[var(--color-tinta-tenue)]">{cambio.disposicion}</p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                    Antes
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--color-tinta-suave)]">
                    {cambio.antesTexto ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                    Ahora
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--color-tinta)]">
                    {cambio.despuesTexto ?? '—'}
                  </dd>
                </div>
              </dl>
              {cambio.nota && (
                <p className="mt-3 text-sm text-[var(--color-tinta-suave)]">{cambio.nota}</p>
              )}
              <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">
                Por qué alcanza a todos: {justificacion}
              </p>
            </li>
          ))}
        </ul>
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'La reforma',
            enlaces: [
              {
                href: '/reforma-ley-antilavado-2026',
                etiqueta: 'Los tres instrumentos y la tabla completa',
                descripcion: 'Ley, Reglamento y Acuerdo, con sus fechas',
              },
              { href: '/acuerdo-115-2026', etiqueta: 'Acuerdo 115/2026 en detalle' },
              { href: '/calendario-cumplimiento', etiqueta: 'Calendario de fechas exigibles' },
            ],
          },
          {
            titulo: 'Tu fracción',
            enlaces: [
              { href: '/actividades-vulnerables', etiqueta: 'Catálogo de actividades vulnerables' },
              { href: '/umbrales', etiqueta: 'Tabla completa de umbrales' },
              { href: '/limites-efectivo', etiqueta: 'Límites de efectivo del art. 32' },
            ],
          },
          {
            titulo: 'Verificar',
            enlaces: [
              { href: '/herramientas/calculadora-umbrales', etiqueta: 'Calculadora de umbrales' },
              { href: '/fuentes-oficiales', etiqueta: 'Fuentes oficiales' },
              { href: '/actualizaciones', etiqueta: 'Bitácora de actualizaciones' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
