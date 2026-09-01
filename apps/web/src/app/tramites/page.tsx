import type { Metadata } from 'next';
import Link from 'next/link';
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
import { MODIFICADO_EN, PUBLICADO_DESDE, REVISION_VIGENTE } from '@/content/autores';
import {
  ETIQUETA_BLOQUE,
  ORDEN_BLOQUES,
  PLAZOS_PENDIENTES_DE_MOTOR,
  TRAMITES,
} from '@/content/tramites';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';

const RUTA = '/tramites';

export const metadata: Metadata = construirMetadata({
  titulo: 'Trámites del portal SPPLD del SAT, paso a paso',
  descripcion:
    'Alta, baja, modificación de datos y designación del representante en el Padrón de Actividades Vulnerables: requisitos, plazos y lo que el SAT no publica.',
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: PUBLICADO_DESDE,
  actualizadoEn: MODIFICADO_EN,
});

const INDICE = [
  { id: 'antes-de-entrar', titulo: 'Antes de entrar al portal' },
  { id: 'catalogo', titulo: 'Los trámites' },
  { id: 'plazos', titulo: 'Todos los plazos en una tabla' },
  { id: 'metodo', titulo: 'Cómo se escribió esta sección' },
];

export default function PaginaTramites() {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Trámites del portal SPPLD', ruta: RUTA },
  ];

  const porBloque = ORDEN_BLOQUES.map((b) => ({
    bloque: b,
    tramites: TRAMITES.filter((t) => t.bloque === b),
  })).filter((g) => g.tramites.length > 0);

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: 'Trámites del Padrón de Actividades Vulnerables',
          descripcion:
            'Guía operativa de los trámites del portal SPPLD: alta, modificación, baja, representante de cumplimiento y problemas de acceso.',
          ruta: RUTA,
          publicadoEn: PUBLICADO_DESDE,
          actualizadoEn: MODIFICADO_EN,
          seccion: 'Trámites',
        })}
      />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo="Trámites del portal SPPLD: alta, cambios, baja y qué hacer si no puedes entrar"
        etiquetas={[
          { texto: `${TRAMITES.length} trámites`, tono: 'marino' },
          { texto: 'Art. 18, fracción IV Bis LFPIORPI', tono: 'petroleo' },
          {
            texto: `Fuentes consultadas el ${REVISION_VIGENTE}`,
            tono: 'neutro',
          },
        ]}
        respuestaDirecta="Todo lo que se hace en el Padrón de Actividades Vulnerables pasa por el mismo sitio —https://sppld.sat.gob.mx/sppld/— y exige lo mismo: RFC y e.firma vigente. La reforma de 2025 agrupó las tres actuaciones en una sola fracción del art. 18: alta y registro, modificación y baja. Aquí está cada una con sus requisitos, sus plazos, su fundamento y, cuando la fuente oficial se acaba, con el hueco declarado en lugar de rellenado."
        entradilla="Esta sección está escrita para quien ya tiene la pantalla del SAT abierta, no para quien todavía está decidiendo si la ley le aplica."
      />

      <IndiceContenidos entradas={INDICE} />

      <Seccion
        id="antes-de-entrar"
        titulo="Antes de entrar al portal"
        descripcion="Tres cosas que se repiten en los cinco trámites."
      >
        <div className="prosa text-[var(--color-tinta-suave)]">
          <p>
            <strong className="text-[var(--color-tinta)]">Uno.</strong> El art. 12 del Reglamento
            exige dos requisitos y sólo dos para operar en el padrón: estar inscrito en el Registro
            Federal de Contribuyentes y contar con el certificado vigente de la e.firma. Las fichas
            de trámite del SAT repiten exactamente esos dos, ni uno más.
          </p>
          <p>
            <strong className="text-[var(--color-tinta)]">Dos.</strong> Si eres persona moral,
            fideicomiso u otra figura jurídica, el art. 4 de las Reglas de Carácter General te
            obliga a firmar con la e.firma asociada a tu propio RFC y te prohíbe expresamente usar
            la de tu representante legal. Es el rechazo más común del portal.
          </p>
          <p>
            <strong className="text-[var(--color-tinta)]">Tres.</strong> Modificar y dar de baja son
            el mismo trámite en las Reglas: el de actualización del art. 7, que corre en seis días
            hábiles. Por eso el portal entrega el mismo acuse —«Registro de actividades vulnerables.
            Actualización»— cuando cambias un dato y cuando cierras una actividad.
          </p>
        </div>

        <Nota tono="info" className="mt-5" titulo="Esto es el trámite, no la obligación">
          <p>
            Aquí explicamos cómo se hace. Para qué te obliga la ley, desde cuándo y con qué
            evidencia se acredita, ve a{' '}
            <Link href="/obligaciones/alta-sppld">la obligación de alta y registro</Link> y al{' '}
            <Link href="/obligaciones">catálogo de obligaciones</Link>.
          </p>
        </Nota>
      </Seccion>

      <Seccion
        id="catalogo"
        titulo="Los trámites"
        descripcion="Agrupados por el momento en el que te encuentras, no por el orden de las Reglas."
      >
        <div className="flex flex-col gap-10">
          {porBloque.map((g) => (
            <div key={g.bloque}>
              <h3 className="mb-4 flex items-center gap-3 text-xl font-semibold">
                {ETIQUETA_BLOQUE[g.bloque]}
                <Insignia tono="neutro">{g.tramites.length}</Insignia>
              </h3>
              <ul className="grid gap-4 md:grid-cols-2">
                {g.tramites.map((t) => (
                  <li key={t.slug}>
                    <Tarjeta className="h-full">
                      <TarjetaCuerpo className="flex h-full flex-col gap-3">
                        <h4 className="text-lg font-semibold">
                          <Link
                            href={`${RUTA}/${t.slug}`}
                            className="underline decoration-transparent underline-offset-4 hover:decoration-[var(--color-petroleo)]"
                          >
                            {t.titulo}
                          </Link>
                        </h4>
                        <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                          {t.resumen}
                        </p>
                        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-[var(--color-tinta-tenue)]">
                          <Insignia tono="marino">{t.pasos.length} pasos</Insignia>
                          {t.huecos.length > 0 && (
                            <Insignia tono="ambar">
                              {t.huecos.length}{' '}
                              {t.huecos.length === 1 ? 'hueco declarado' : 'huecos declarados'}
                            </Insignia>
                          )}
                          <span>{t.fuentes.length} fuentes</span>
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
        id="plazos"
        titulo="Todos los plazos en una tabla"
        descripcion="Los del padrón, que son distintos del día 17 del aviso mensual."
      >
        <ul className="flex flex-col gap-3">
          {PLAZOS_PENDIENTES_DE_MOTOR.map((p) => (
            <li
              key={p.clave}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-medium text-[var(--color-tinta)]">{p.etiqueta}</span>
                <span className="cifra font-semibold text-[var(--color-petroleo-hondo)]">
                  {p.valor}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                Se cuenta desde: {p.cuentaDesde}
              </p>
              <p className="mt-2">
                <Insignia tono="petroleo">{p.disposicion}</Insignia>
              </p>
            </li>
          ))}
        </ul>

        <Nota tono="atencion" className="mt-5" titulo="Estos plazos aún no están en el motor">
          <p>
            Las cifras legales de este sitio salen del motor de reglas, que hoy modela umbrales,
            UMA, límites de efectivo y sanciones. Los plazos de los trámites del padrón todavía no
            viven ahí: se guardan en el contenido con su disposición y su fuente a la vista, y
            deberían subir al motor. Ninguno está escrito dentro de un componente.
          </p>
        </Nota>

        <p className="mt-4 text-sm">
          <Link
            href="/herramientas/fecha-limite-aviso"
            className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            Para el plazo del aviso mensual, usa la calculadora de fecha límite
          </Link>
        </p>
      </Seccion>

      <Seccion
        id="metodo"
        titulo="Cómo se escribió esta sección"
        descripcion="Porque de un trámite fiscal es fácil escribir cualquier cosa que suene plausible."
      >
        <div className="prosa text-[var(--color-tinta-suave)]">
          <p>
            Cada paso de estas páginas sale de un texto publicado: la LFPIORPI vigente, el
            Reglamento compilado con la reforma del 27 de marzo de 2026, las Reglas de Carácter
            General, la Resolución que expide el formato oficial de alta y registro —con sus Anexos
            «A» y «B»— y las fichas de trámite 85869 y 42254 del SAT. Cada paso lleva su disposición
            impresa al lado, y cada página termina con la lista de fuentes y su fecha de consulta.
          </p>
          <p>
            Lo que la autoridad no publica no se rellena. No verás aquí nombres de menú del portal,
            secuencias de pantallas ni códigos de error: el SAT no los publica, y cada página dice
            en su apartado «Lo que el SAT no publica» exactamente dónde se acaba la fuente oficial y
            qué hacer mientras tanto. Un hueco declarado se puede verificar; una instrucción
            inventada sobre un trámite fiscal hace daño real.
          </p>
          <p>
            Tampoco escondemos las limitaciones de la consulta: el servidor del SAT rechaza las
            consultas automatizadas de este sitio, así que las dos fichas de trámite se leyeron en
            copias archivadas, y así se dice en cada página. Verifica la ficha en el portal del SAT
            antes de actuar.
          </p>
          <p>
            Puedes revisar el método completo en{' '}
            <Link href="/metodologia-editorial">nuestra metodología editorial</Link> y el catálogo
            de fuentes primarias en <Link href="/fuentes-oficiales">fuentes oficiales</Link>.
          </p>
        </div>
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Empezar por aquí',
            enlaces: [
              { href: `${RUTA}/alta-y-registro`, etiqueta: 'Alta y registro' },
              {
                href: `${RUTA}/problemas-de-acceso`,
                etiqueta: 'No puedo entrar al portal',
              },
              { href: `${RUTA}/baja-del-padron`, etiqueta: 'Baja del padrón' },
            ],
          },
          {
            titulo: 'Herramientas',
            enlaces: [
              {
                href: '/herramientas/cuestionario',
                etiqueta: '¿Me aplica la ley?',
              },
              {
                href: '/herramientas/fecha-limite-aviso',
                etiqueta: 'Fecha límite de aviso',
              },
              {
                href: '/herramientas/plan-30-noviembre',
                etiqueta: 'Plan al 30 de noviembre',
              },
            ],
          },
          {
            titulo: 'Contenido relacionado',
            enlaces: [
              { href: '/obligaciones', etiqueta: 'Todas las obligaciones' },
              {
                href: '/actividades-vulnerables',
                etiqueta: 'Actividades vulnerables',
              },
              {
                href: '/calendario-cumplimiento',
                etiqueta: 'Calendario de cumplimiento',
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
