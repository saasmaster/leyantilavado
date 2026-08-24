import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ExternalLink, MousePointerClick, ShieldCheck, X } from 'lucide-react';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Insignia, Nota, Tarjeta, TarjetaCuerpo, TablaEnvoltura } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';
import { EncabezadoPagina } from '@/components/inicio/comun';
import { AVISO_LEGAL_TEXTO } from '@/content/autores';
import {
  COMO_SE_USA,
  CONTROL_DE_DATOS,
  DATOS_GUARDADOS,
  DESTINATARIOS,
  DIFERENCIAS,
  EXTENSION,
  NO_SE_RECOPILA,
  PERMISOS,
  PERMISOS_NO_PEDIDOS,
  PRIVACIDAD_ACTUALIZADA,
  PRIVACIDAD_RESUMEN,
  QUE_RESUELVE,
  SEGURIDAD,
  URL_TIENDA,
} from '@/content/extension';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Extensión de Chrome', ruta: '/extension' },
];

/**
 * Landing de la extensión de Chrome, con su política de privacidad dentro.
 *
 * No está en el menú por decisión de producto. Sí en el sitemap: la Chrome Web
 * Store exige una URL de política pública y estable, y una página sin un solo
 * enlace entrante queda huérfana —imposible de comprobar por quien revisa la
 * ficha—. El ancla `#privacidad` es la que se declara en la tienda.
 *
 * La política va aquí y no en `/legal/` a propósito: quien llega desde la
 * ficha aterriza en el mismo documento que le explica qué hace la herramienta,
 * que es donde tiene sentido leer qué hace con sus datos.
 */

export const metadata: Metadata = construirMetadata({
  titulo: 'Ley Antilavado MX: la extensión de Chrome',
  descripcion:
    'Analiza una operación y obtén umbral de identificación, de Aviso, acumulación y restricción de efectivo, con el artículo y la UMA aplicada a la vista. Sin cuenta y sin servidores.',
  ruta: '/extension',
});

/** Fila de sí/no con icono, para las listas de privacidad. */
function Marca({ si, children }: { si: boolean; children: React.ReactNode }) {
  const Icono = si ? Check : X;
  return (
    <li className="flex items-start gap-2.5">
      <Icono
        aria-hidden
        className={`mt-0.5 size-4 shrink-0 ${si ? 'text-[var(--color-verde)]' : 'text-[var(--color-rojo)]'}`}
      />
      <span>{children}</span>
    </li>
  );
}

export default function PaginaExtension() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonParaScript(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo={`${EXTENSION.nombre}: ${EXTENSION.tagline}`}
        subtitulo="Extensión de Chrome para Actividades Vulnerables"
        entradilla={EXTENSION.entradilla}
        actualizado={formatearFechaLarga(PRIVACIDAD_ACTUALIZADA)}
      />

      <div className="contenedor-app py-12 md:py-16">
        {/* ── Instalación ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {URL_TIENDA ? (
            <a
              href={URL_TIENDA}
              className="relleno-accion inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-5 py-3 font-medium text-white"
            >
              Instalar desde Chrome Web Store
              <ExternalLink aria-hidden className="size-4" />
            </a>
          ) : (
            /* Sin URL de tienda no se ofrece un botón que lleve a ninguna
               parte: un enlace roto desde la página que promete precisión
               cuesta más que la ausencia del botón. */
            <Insignia tono="ambar">Próximamente en la Chrome Web Store</Insignia>
          )}
          <a href="#privacidad" className="text-sm underline underline-offset-4">
            Ver la política de privacidad
          </a>
        </div>

        {/* ── Para quién ───────────────────────────────────────────────── */}
        <section aria-labelledby="para-quien" className="mt-14">
          <h2 id="para-quien" className="text-2xl font-semibold">
            Para quién es
          </h2>
          <p className="prosa mt-2">
            Para quienes realizan Actividades Vulnerables conforme a la LFPIORPI. Si no sabes si es
            tu caso, el sitio tiene un{' '}
            <Link href="/herramientas/cuestionario">cuestionario que lo resuelve</Link> y una{' '}
            <Link href="/para">entrada por giro</Link>.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {DESTINATARIOS.map((d) => (
              <li key={d}>
                <Insignia tono="neutro">{d}</Insignia>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Qué resuelve ─────────────────────────────────────────────── */}
        <section aria-labelledby="que-resuelve" className="mt-14">
          <h2 id="que-resuelve" className="text-2xl font-semibold">
            Qué resuelve de una operación
          </h2>
          <p className="prosa mt-2">
            Cada obligación se evalúa por separado, con su propio importe, su UMA aplicable y su
            umbral. No se colapsan en una sola respuesta porque no son la misma pregunta.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUE_RESUELVE.map((q) => (
              <Tarjeta key={q.titulo}>
                <TarjetaCuerpo>
                  <p className="font-semibold text-[var(--color-tinta)]">{q.titulo}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {q.detalle}
                  </p>
                </TarjetaCuerpo>
              </Tarjeta>
            ))}
          </div>
        </section>

        {/* ── Cómo se usa ──────────────────────────────────────────────── */}
        <section aria-labelledby="como-se-usa" className="mt-14">
          <h2 id="como-se-usa" className="flex items-center gap-2 text-2xl font-semibold">
            <MousePointerClick aria-hidden className="size-5 text-[var(--color-petroleo)]" />
            Cómo se usa
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {COMO_SE_USA.map((p, i) => (
              <li key={p.paso}>
                <Tarjeta className="h-full">
                  <TarjetaCuerpo>
                    <span className="cifra text-sm text-[var(--color-tinta-tenue)]">{i + 1}</span>
                    <p className="mt-1 font-semibold text-[var(--color-tinta)]">{p.paso}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                      {p.detalle}
                    </p>
                  </TarjetaCuerpo>
                </Tarjeta>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Qué la distingue ─────────────────────────────────────────── */}
        <section aria-labelledby="diferencias" className="mt-14">
          <h2 id="diferencias" className="text-2xl font-semibold">
            Qué la hace distinta
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {DIFERENCIAS.map((d) => (
              <Tarjeta key={d.titulo}>
                <TarjetaCuerpo>
                  <p className="font-semibold text-[var(--color-tinta)]">{d.titulo}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {d.detalle}
                  </p>
                </TarjetaCuerpo>
              </Tarjeta>
            ))}
          </div>
        </section>

        {/* ── Política de privacidad ───────────────────────────────────── */}
        <section aria-labelledby="privacidad" className="mt-16 scroll-mt-24" id="privacidad">
          <h2 id="privacidad-titulo" className="flex items-center gap-2 text-2xl font-semibold">
            <ShieldCheck aria-hidden className="size-5 text-[var(--color-petroleo)]" />
            Política de privacidad
          </h2>
          <p className="mt-1 text-sm text-[var(--color-tinta-tenue)]">
            Última actualización: {formatearFechaLarga(PRIVACIDAD_ACTUALIZADA)}
          </p>

          <Nota tono="info" className="mt-5" titulo="El resumen, sin rodeos">
            <p>{PRIVACIDAD_RESUMEN}</p>
          </Nota>

          <h3 className="mt-10 text-xl font-semibold">Qué se guarda, y dónde</h3>
          <div className="mt-4 flex flex-col gap-4">
            {DATOS_GUARDADOS.map((g) => (
              <Tarjeta key={g.donde}>
                <TarjetaCuerpo>
                  <p className="font-semibold text-[var(--color-tinta)]">{g.donde}</p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {g.que.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </TarjetaCuerpo>
              </Tarjeta>
            ))}
          </div>

          <h3 className="mt-10 text-xl font-semibold">Qué NO se recopila</h3>
          <ul className="mt-4 space-y-3 text-[var(--color-tinta-suave)]">
            {NO_SE_RECOPILA.map((n) => (
              <Marca key={n.titulo} si={false}>
                <strong className="text-[var(--color-tinta)]">{n.titulo}.</strong> {n.detalle}
              </Marca>
            ))}
          </ul>

          <h3 className="mt-10 text-xl font-semibold">Permisos y por qué</h3>
          <TablaEnvoltura etiqueta="Permisos que solicita la extensión" className="mt-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--color-marfil-hondo)] text-left">
                  <th scope="col" className="p-3 font-semibold">Permiso</th>
                  <th scope="col" className="p-3 font-semibold">Para qué</th>
                  <th scope="col" className="p-3 font-semibold">Por qué no se puede evitar</th>
                </tr>
              </thead>
              <tbody>
                {PERMISOS.map((p) => (
                  <tr key={p.permiso} className="border-t border-[var(--color-borde)] align-top">
                    <td className="p-3">
                      <code className="text-[var(--color-petroleo-hondo)]">{p.permiso}</code>
                    </td>
                    <td className="p-3 leading-relaxed text-[var(--color-tinta-suave)]">{p.paraQue}</td>
                    <td className="p-3 leading-relaxed text-[var(--color-tinta-suave)]">{p.porQue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaEnvoltura>

          <h3 className="mt-10 text-xl font-semibold">Permisos que NO pide, a propósito</h3>
          <p className="prosa mt-2">
            Enumerarlos vale más que la lista de los que sí: un permiso ausente es una promesa
            comprobable —Chrome te la enseña al instalar— y «respetamos tu privacidad» no lo es.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {PERMISOS_NO_PEDIDOS.map((p) => (
              <li key={p}>
                <Insignia tono="rojo">{p}</Insignia>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
            No hay content script permanente: la extensión <strong>no lee las páginas que
            visitas</strong>. El único texto que recibe es el que seleccionas y envías tú.
          </p>

          <h3 className="mt-10 text-xl font-semibold">Seguridad</h3>
          <ul className="mt-4 space-y-2.5 text-[var(--color-tinta-suave)]">
            {SEGURIDAD.map((s) => (
              <Marca key={s} si>
                {s}
              </Marca>
            ))}
          </ul>

          <h3 className="mt-10 text-xl font-semibold">Tus datos, bajo tu control</h3>
          <div className="mt-4 flex flex-col gap-3">
            {CONTROL_DE_DATOS.map((c) => (
              <div
                key={c.accion}
                className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
              >
                <p className="font-semibold text-[var(--color-tinta)]">{c.accion}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {c.detalle}
                </p>
              </div>
            ))}
          </div>

          <h3 className="mt-10 text-xl font-semibold">Cambios y contacto</h3>
          <p className="prosa mt-2">
            Cualquier cambio se publica en esta misma página y en la ficha de la Chrome Web Store,
            con su fecha. Para cualquier asunto relacionado con esta política, escríbenos desde el{' '}
            <Link href="/contacto">formulario de contacto</Link>.
          </p>
        </section>

        {/* ── Aviso legal ──────────────────────────────────────────────── */}
        <Nota tono="atencion" className="mt-14" titulo="Importante">
          <p>
            {EXTENSION.nombre} es una herramienta informativa y de apoyo operativo. Los resultados
            dependen de la información capturada y de la versión indicada de las reglas, y no
            sustituyen una revisión jurídica, contable o de cumplimiento.
          </p>
          {AVISO_LEGAL_TEXTO.slice(1).map((linea) => (
            <p key={linea}>{linea}</p>
          ))}
        </Nota>
      </div>
    </>
  );
}
