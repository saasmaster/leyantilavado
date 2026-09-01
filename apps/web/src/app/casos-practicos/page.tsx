import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { datos } from '@leyantilavado/rules-engine';
import { formatearMXN } from '@leyantilavado/types';
import { Insignia, Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { EncabezadoPagina } from '@/components/inicio/comun';
import {
  ADVERTENCIA_ILUSTRATIVA,
  CASOS_PRACTICOS,
  ETIQUETA_MEDIO_PAGO,
  ETIQUETA_TIPO_CLIENTE,
  type CasoPractico,
} from '@/content/casos-practicos';
import { MODIFICADO_EN, PUBLICADO_DESDE, REVISION_VIGENTE } from '@/content/autores';
import { construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';

/* Next sólo admite ciertos exports en un `page.tsx`, así que la ruta se repite
   como constante local en lugar de exportarse desde aquí. */
const RUTA_CASOS = '/casos-practicos';

export const metadata: Metadata = construirMetadata({
  titulo: 'Casos prácticos resueltos de la Ley Antilavado',
  descripcion: `${CASOS_PRACTICOS.length} operaciones de negocios mexicanos resueltas con el motor del sitio: qué umbral activan, si hay que identificar, si hay que avisar y qué conservar.`,
  ruta: RUTA_CASOS,
  tipo: 'article',
  publicadoEn: PUBLICADO_DESDE,
  actualizadoEn: MODIFICADO_EN,
});

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Casos prácticos', ruta: RUTA_CASOS },
];

/**
 * Casos agrupados por actividad, en el orden del catálogo legal.
 *
 * El orden sale de `datos.ACTIVIDADES` y no de un arreglo escrito a mano: si
 * mañana se agrega una fracción, el índice la acomoda donde la ley la pone.
 */
const GRUPOS: readonly { id: string; fraccion: string; nombre: string; casos: CasoPractico[] }[] =
  datos.ACTIVIDADES.map((a) => ({
    // El ancla sale del slug de la actividad y no de la fracción: «XII A» y
    // «II a)» producirían identificadores con espacios y paréntesis.
    id: `actividad-${a.slug}`,
    fraccion: a.fraccion,
    nombre: a.nombre,
    casos: CASOS_PRACTICOS.filter((c) => c.operacion.actividad === a.slug),
  })).filter((g) => g.casos.length > 0);

function TarjetaCaso({ caso }: { caso: CasoPractico }) {
  const { operacion } = caso;
  return (
    <Tarjeta className="h-full">
      <TarjetaCuerpo className="flex h-full flex-col gap-3">
        <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
          <Link
            href={`${RUTA_CASOS}/${caso.slug}`}
            className="underline decoration-transparent underline-offset-4 hover:decoration-[var(--color-petroleo)]"
          >
            {caso.titulo}
          </Link>
        </h3>

        <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">{caso.resumen}</p>

        <dl className="mt-auto grid gap-2 pt-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[var(--color-tinta-tenue)]">Valor de la operación</dt>
            <dd className="cifra font-semibold text-[var(--color-tinta)]">
              {operacion.montoIndeterminable ? 'No determinable' : formatearMXN(operacion.monto)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-tinta-tenue)]">Fecha de la operación</dt>
            <dd className="cifra font-semibold text-[var(--color-tinta)]">
              <time dateTime={operacion.fecha}>{operacion.fecha}</time>
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Insignia tono="petroleo">{ETIQUETA_MEDIO_PAGO[operacion.medioPago]}</Insignia>
          {operacion.tipoCliente && (
            <Insignia tono="neutro">{ETIQUETA_TIPO_CLIENTE[operacion.tipoCliente]}</Insignia>
          )}
        </div>

        <p className="text-sm">
          <Link
            href={`${RUTA_CASOS}/${caso.slug}`}
            className="inline-flex items-center gap-1 text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            Ver el caso resuelto
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        </p>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}

export default function PaginaCasosPracticos() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonParaScript(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Casos prácticos resueltos de la Ley Antilavado"
        subtitulo="Operaciones concretas, resueltas con el mismo motor que las herramientas"
        entradilla={`Si ya sabes que eres sujeto obligado, la teoría te sobra: lo que falta es ver una operación como la tuya resuelta de principio a fin. Aquí hay ${CASOS_PRACTICOS.length} casos repartidos en ${GRUPOS.length} actividades vulnerables. Ninguno trae la conclusión escrita a mano: cada página pasa los datos de la operación por el motor de reglas, así que si cambia un umbral o la UMA, el caso se recalcula solo.`}
        actualizado={REVISION_VIGENTE}
      />

      <div className="contenedor-app py-12 md:py-16">
        <Nota tono="atencion" titulo="Casos ilustrativos, no asesoría">
          <p>{ADVERTENCIA_ILUSTRATIVA}</p>
          <p>
            Para correr tu operación real con tus propias cifras están la{' '}
            <Link href="/herramientas/calculadora-umbrales">calculadora de umbrales</Link>, la{' '}
            <Link href="/herramientas/acumulacion-operaciones">acumulación de seis meses</Link> y el{' '}
            <Link href="/herramientas/limites-efectivo">verificador de efectivo</Link>.
          </p>
        </Nota>

        <nav aria-label="Actividades con caso resuelto" className="mt-10">
          <p className="mb-3 text-sm font-semibold text-[var(--color-tinta)]">En esta página</p>
          <ul className="flex flex-wrap gap-2">
            {GRUPOS.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-borde)] px-3 py-1.5 text-sm text-[var(--color-tinta-suave)] hover:border-[var(--color-petroleo)] hover:text-[var(--color-petroleo-hondo)]"
                >
                  {g.nombre}
                  <span className="cifra text-xs text-[var(--color-tinta-tenue)]">
                    {g.casos.length}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-12 flex flex-col gap-14">
          {GRUPOS.map((grupo) => (
            <section
              key={grupo.id}
              id={grupo.id}
              aria-labelledby={`${grupo.id}-titulo`}
              className="scroll-mt-24"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h2
                  id={`${grupo.id}-titulo`}
                  className="text-2xl font-semibold text-[var(--color-tinta)]"
                >
                  {grupo.nombre}
                </h2>
                <Insignia tono="marino">Art. 17, fracción {grupo.fraccion}</Insignia>
              </div>

              <ul className="mt-5 grid gap-5 md:grid-cols-2">
                {grupo.casos.map((caso) => (
                  <li key={caso.slug}>
                    <TarjetaCaso caso={caso} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section aria-labelledby="como-usar-titulo" className="mt-16">
          <h2 id="como-usar-titulo" className="text-2xl font-semibold text-[var(--color-tinta)]">
            Cómo usar estos casos
          </h2>
          <ul className="prosa mt-4 list-disc space-y-2 pl-5 leading-relaxed text-[var(--color-tinta-suave)]">
            <li>
              Busca el caso que se parezca al tuyo por <strong>tipo de acto</strong>, no por monto.
              El acto decide la fracción; el monto sólo decide el umbral dentro de ella.
            </li>
            <li>
              Fíjate en la fecha. El umbral se convierte a pesos con la UMA vigente el día de la
              operación, y la UMA entra en vigor el 1 de febrero: una operación de enero se mide con
              la del año anterior.
            </li>
            <li>
              Lee los supuestos y lo que falta, no sólo la conclusión. Ninguno de estos casos trae
              el historial del cliente, y la acumulación de seis meses puede cambiar el resultado.
            </li>
            <li>
              Después corre tu operación real en las herramientas. Un caso parecido orienta; sólo el
              cálculo con tus datos concluye.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
