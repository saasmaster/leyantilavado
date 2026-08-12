import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { convertirUMA, datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { formatearMXN } from '@leyantilavado/types';
import { AvisoIndependencia, Insignia, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { CAMBIOS_ANTES_DESPUES, INSTRUMENTOS } from '@/content/reforma';
import { REVISION_VIGENTE } from '@/components/inicio/comun';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  Migas,
  Seccion,
  jsonLdArticulo,
  describirUmbral,
  textoPlanoUmbral,
} from '@/components/contenido';

const RUTA = '/reforma-ley-antilavado-2026';
const TITULO = 'Reforma a la Ley Antilavado 2025-2026: qué cambió';
const DESCRIPCION =
  'No salió una ley nueva: son tres instrumentos con fechas distintas. La reforma de julio de 2025, la del Reglamento de marzo de 2026 y el Acuerdo 115.';

export const metadata: Metadata = construirMetadata({
  titulo: TITULO,
  descripcion: DESCRIPCION,
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: '2026-08-11',
  actualizadoEn: '2026-08-11',
});

/**
 * El "después" de cada cambio se LEE DEL MOTOR, no se escribe a mano.
 *
 * Así la tabla no puede desincronizarse de la ley vigente: si mañana se corrige
 * un umbral en los datos semilla, esta tabla lo refleja sola.
 *
 * El "antes" sí es literal, y es la única excepción del proyecto a la regla de
 * no escribir cifras legales en el código: corresponde a un umbral DEROGADO, y
 * el motor sólo guarda reglas con vigencia abierta. No hay de dónde leerlo.
 */
function resolverDespues(cambio: (typeof CAMBIOS_ANTES_DESPUES)[number]): string {
  if (cambio.despuesTexto) return cambio.despuesTexto;
  if (!cambio.reglaId || !cambio.campo) return 'Requiere revisión editorial';

  const regla = datos.UMBRALES.find((u) => u.id === cambio.reglaId);
  if (!regla) return 'Requiere revisión editorial';

  // `describirUmbral` resuelve los seis casos de la unión discriminada
  // (siempre / nunca / uma / monto_o_comision / variable / requiere_revision)
  // y ya trae la conversión a pesos con la UMA de la fecha.
  const vista = describirUmbral(regla[cambio.campo], REVISION_VIGENTE);
  return textoPlanoUmbral(vista, 'uma');
}

function resolverAntes(cambio: (typeof CAMBIOS_ANTES_DESPUES)[number]): string {
  if (cambio.antesTexto) return cambio.antesTexto;
  if (cambio.antesUMA === undefined) return '—';
  const enPesos = convertirUMA(cambio.antesUMA, REVISION_VIGENTE).equivalentePesos;
  return `${cambio.antesUMA.toLocaleString('es-MX')} UMA · ${formatearMXN(enPesos)}`;
}

const ENDURECIDOS = CAMBIOS_ANTES_DESPUES.filter((c) => c.endurece).length;

const INDICE = [
  { id: 'tres-instrumentos', titulo: 'Son tres instrumentos, no una ley nueva' },
  { id: 'antes-despues', titulo: `Qué cambió: ${CAMBIOS_ANTES_DESPUES.length} cambios concretos` },
  { id: 'que-hacer', titulo: 'Qué hacer con esto' },
];

export default function Reforma() {
  return (
    <div className="contenedor-app py-10 md:py-14">
      <JsonLd
        datos={[
          jsonLdMigaDePan([
            { nombre: 'Inicio', ruta: '/' },
            { nombre: 'La reforma 2025-2026', ruta: RUTA },
          ]),
          jsonLdArticulo({
            titulo: TITULO,
            descripcion: DESCRIPCION,
            ruta: RUTA,
            publicadoEn: '2026-08-11',
            actualizadoEn: '2026-08-11',
            seccion: 'Marco normativo',
          }),
        ]}
      />

      <Migas
        items={[
          { nombre: 'Inicio', ruta: '/' },
          { nombre: 'La reforma 2025-2026', ruta: RUTA },
        ]}
      />

      <CabeceraArticulo
        titulo={TITULO}
        etiquetas={[
          { texto: '3 instrumentos', tono: 'marino' },
          { texto: `${CAMBIOS_ANTES_DESPUES.length} cambios`, tono: 'petroleo' },
          { texto: `${ENDURECIDOS} endurecen la obligación`, tono: 'ambar' },
        ]}
        respuestaDirecta="No hay una Ley Antilavado nueva. Lo que hay son tres instrumentos con jerarquías y fechas distintas: la reforma a la LFPIORPI publicada el 16 de julio de 2025, la reforma al Reglamento del 27 de marzo de 2026 y el Acuerdo 115/2026, que modifica las Reglas de Carácter General y entra en vigor el 30 de noviembre de 2026. Sólo el primero cambió umbrales."
        entradilla={DESCRIPCION}
      />

      <IndiceContenidos entradas={INDICE} />

      {/* ── Los tres instrumentos ────────────────────────────────────────── */}
      <Seccion
        id="tres-instrumentos"
        titulo="Son tres instrumentos, no una ley nueva"
        descripcion="Confundirlos lleva a buscar umbrales nuevos donde no los hay, y a ignorar las obligaciones que sí llegaron."
      >
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {INSTRUMENTOS.map((i) => {
            const fuente = datos.FUENTES_POR_ID[i.fuenteId];
            return (
              <article key={i.clave} className="tarjeta flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <Insignia tono={i.puedeCambiarUmbrales ? 'rojo' : 'neutro'}>
                    {i.puedeCambiarUmbrales ? 'Puede cambiar umbrales' : 'No cambia umbrales'}
                  </Insignia>
                </div>
                <h3 className="mt-3 text-[1.0625rem] font-semibold text-[var(--color-tinta)]">
                  {i.nombre}
                </h3>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--color-tinta-suave)]">
                  {i.queEs}
                </p>
                <dl className="mt-4 flex flex-col gap-2 border-t border-[var(--color-borde)] pt-3 text-[0.82rem]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-tinta-tenue)]">Emisor</dt>
                    <dd className="text-right font-medium">{i.emisor}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-tinta-tenue)]">Publicación</dt>
                    <dd className="cifra text-right">{formatearFechaLarga(i.publicacion)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-tinta-tenue)]">Entrada en vigor</dt>
                    <dd className="cifra text-right font-medium text-[var(--color-tinta)]">
                      {formatearFechaLarga(i.entradaEnVigor)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-tinta-tenue)]">Jerarquía</dt>
                    <dd className="text-right">{i.jerarquia}</dd>
                  </div>
                </dl>
                {fuente && (
                  <a
                    href={fuente.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[0.8rem] font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                  >
                    Ver la publicación oficial
                  </a>
                )}
              </article>
            );
          })}
        </div>

        <Nota tono="info" titulo="Por qué importa la jerarquía" className="mt-6">
          <p>
            Un acuerdo administrativo no puede crear un umbral que la ley no previó. Por eso el
            Acuerdo 115/2026 <strong>no cambió ninguna cifra del artículo 17</strong>: lo que hizo
            fue precisar cómo aplicarlas y añadir obligaciones de organización interna. Los umbrales
            que sí se movieron vienen de la reforma a la Ley, en vigor desde julio de 2025.
          </p>
        </Nota>
      </Seccion>

      {/* ── Antes y después ──────────────────────────────────────────────── */}
      <Seccion
        id="antes-despues"
        titulo={`Qué cambió: ${CAMBIOS_ANTES_DESPUES.length} cambios concretos`}
        descripcion="La columna «después» se lee del motor de reglas, así que no puede desincronizarse de la ley vigente."
      >
        <TablaEnvoltura className="mt-6">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <caption className="sr-only">
              Comparación de los umbrales y supuestos antes y después de la reforma
            </caption>
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Supuesto</th>
                <th scope="col" className="px-4 py-3 font-semibold">Antes</th>
                <th scope="col" className="px-4 py-3 font-semibold">Ahora</th>
                <th scope="col" className="px-4 py-3 font-semibold">Disposición</th>
              </tr>
            </thead>
            <tbody>
              {CAMBIOS_ANTES_DESPUES.map((c) => (
                <tr key={c.clave} className="border-t border-[var(--color-borde)] align-top">
                  <th scope="row" className="px-4 py-3 font-medium text-[var(--color-tinta)]">
                    <span className="flex items-start gap-2">
                      {c.endurece && (
                        <TrendingUp
                          className="mt-0.5 size-3.5 shrink-0 text-[var(--color-rojo)]"
                          aria-label="Endurece la obligación"
                        />
                      )}
                      <span>
                        {c.supuesto}
                        {c.nota && (
                          <span className="mt-1 block text-[0.78rem] font-normal text-[var(--color-tinta-tenue)]">
                            {c.nota}
                          </span>
                        )}
                      </span>
                    </span>
                  </th>
                  <td className="cifra px-4 py-3 text-[var(--color-tinta-tenue)] line-through decoration-[var(--color-borde-fuerte)]">
                    {resolverAntes(c)}
                  </td>
                  <td className="cifra px-4 py-3 font-medium text-[var(--color-tinta)]">
                    {resolverDespues(c)}
                  </td>
                  <td className="px-4 py-3 text-[0.82rem] text-[var(--color-tinta-suave)]">
                    {c.disposicion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <Nota tono="atencion" titulo="Sobre la columna «antes»" className="mt-5">
          <p>
            Es la única cifra del sitio escrita a mano en lugar de leerse del motor. El motivo:
            corresponde a umbrales <strong>derogados</strong>, y el motor sólo guarda reglas con
            vigencia abierta, así que no hay de dónde leerlos. Sirven para dimensionar el cambio,
            no para calcular: una operación anterior a la reforma exige revisión profesional.
          </p>
        </Nota>
      </Seccion>

      {/* ── Qué hacer ────────────────────────────────────────────────────── */}
      <Seccion
        id="que-hacer"
        titulo="Qué hacer con esto"
        descripcion="Tres acciones concretas, en orden."
      >
        <ol className="mt-6 flex flex-col gap-4">
          {[
            {
              titulo: 'Verifica si algún umbral tuyo se movió',
              detalle:
                'Si eres notario o corredor, tres de tus supuestos cambiaron y dos dejaron de tener umbral. Recalcula las operaciones del periodo en curso con la regla vigente.',
              href: '/herramientas/calculadora-umbrales',
              cta: 'Calcular con la regla vigente',
            },
            {
              titulo: 'Ubica tus fechas en el calendario escalonado',
              detalle:
                'El Acuerdo 115/2026 no exige todo el mismo día. Saber qué te toca el 1 de marzo de 2027 y qué el 1 de junio cambia el orden en que conviene trabajar.',
              href: '/calendario-cumplimiento',
              cta: 'Ver el calendario con contadores',
            },
            {
              titulo: 'Revisa si la fracción V Bis te alcanza',
              detalle:
                'Es la fracción más nueva de la ley y la menos conocida: alcanza a quien recibe recursos destinados a un desarrollo inmobiliario, incluidas preventas y coinversiones que antes no estaban nombradas.',
              href: '/actividades-vulnerables/desarrollo-inmobiliario',
              cta: 'Ver la fracción V Bis',
            },
          ].map((paso, i) => (
            <li key={paso.titulo} className="tarjeta flex gap-4 p-5">
              <span className="cifra grid size-8 shrink-0 place-items-center rounded-full bg-[var(--color-marino-tenue)] text-[0.85rem] font-semibold text-[var(--color-marino)]">
                {i + 1}
              </span>
              <div>
                <h3 className="text-[1rem] font-semibold text-[var(--color-tinta)]">
                  {paso.titulo}
                </h3>
                <p className="mt-1.5 text-[0.875rem] leading-relaxed text-[var(--color-tinta-suave)]">
                  {paso.detalle}
                </p>
                <Link
                  href={paso.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-[var(--color-petroleo-hondo)]"
                >
                  {paso.cta}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Profundizar',
            enlaces: [
              {
                etiqueta: 'Acuerdo 115/2026 en detalle',
                href: '/acuerdo-115-2026',
                descripcion: 'Los capítulos nuevos y qué obliga cada uno',
              },
              {
                etiqueta: 'Tabla completa de umbrales',
                href: '/umbrales',
                descripcion: 'Las 36 reglas vigentes, convertibles por año',
              },
              { etiqueta: 'Fuentes oficiales', href: '/fuentes-oficiales' },
            ],
          },
          {
            titulo: 'Mantenerte al día',
            enlaces: [
              {
                etiqueta: 'Bitácora de actualizaciones',
                href: '/actualizaciones',
                descripcion: 'Cada cambio normativo con su fecha y su impacto',
              },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
      <AvisoIndependencia className="mt-6" />
    </div>
  );
}
