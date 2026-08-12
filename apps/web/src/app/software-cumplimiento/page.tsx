import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Insignia, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import {
  CRITERIOS,
  ETIQUETA_VALOR,
  FECHA_REVISION_SOFTWARE,
  HAY_RELACION_AFILIADOS,
  PREGUNTAS_AL_PROVEEDOR,
  PROVEEDORES_SOFTWARE,
  valorDe,
  type ValorCriterio,
} from '@/lib/directorio/software';
import { construirMetadata } from '@/lib/sitio';

export const metadata: Metadata = construirMetadata({
  titulo: 'Comparativo de software de cumplimiento LFPIORPI',
  descripcion:
    'Comparativo independiente de plataformas de cumplimiento: criterios objetivos, método de comprobación abierto y qué preguntar antes de firmar.',
  ruta: '/software-cumplimiento',
});

/** Divulgación de afiliados. Va antes de la tabla, nunca al pie. */
const TEXTO_AFILIADOS = HAY_RELACION_AFILIADOS
  ? 'Declaración de afiliados: recibimos una comisión si contratas a través de alguno de los enlaces marcados.'
  : 'Declaración de afiliados: hoy no tenemos ninguna relación de afiliación ni comisión con estos proveedores. Si algún día la hubiera, aparecería aquí, antes de la tabla.';

const TONO_VALOR: Record<ValorCriterio, 'verde' | 'rojo' | 'ambar' | 'neutro'> = {
  si: 'verde',
  no: 'rojo',
  parcial: 'ambar',
  sin_verificar: 'neutro',
};

export default function PaginaSoftware() {
  return (
    <div className="contenedor-app flex flex-col gap-10 py-10 md:py-14">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold md:text-4xl">
          Software de cumplimiento LFPIORPI: comparativo independiente
        </h1>
        <p className="prosa text-[var(--color-tinta-suave)]">
          Todo el que compara software de cumplimiento en México se topa con lo mismo: páginas de
          producto sin precio y un formulario de demostración. Esta página existe para lo contrario:
          criterios fijos, iguales para todos, y una regla sencilla — sólo publicamos lo que
          comprobamos nosotros.
        </p>
      </header>

      <Nota tono="info" titulo="Cómo leer esta tabla">
        <p>
          En la revisión del {FECHA_REVISION_SOFTWARE} sólo pudimos comprobar por observación
          directa un criterio en todos los proveedores: si publican precio. El resto aparece como{' '}
          <strong>“sin comprobar”</strong>, y ahí se va a quedar hasta que probemos el producto con
          datos propios. Preferimos una tabla con huecos honestos a una tabla llena de lo que dice
          cada folleto.
        </p>
        <p>
          {TEXTO_AFILIADOS} La aparición y el orden en esta tabla no se venden: los
          proveedores están en orden alfabético por clave interna y ninguno pagó por estar aquí.
        </p>
      </Nota>

      <section aria-labelledby="criterios" className="flex flex-col gap-4">
        <h2 id="criterios" className="text-2xl font-semibold">
          Los criterios y cómo los comprobamos
        </h2>
        <p className="prosa text-sm text-[var(--color-tinta-suave)]">
          Un criterio sin método de comprobación es una opinión. Por eso cada uno lleva escrito qué
          prueba tendría que pasar un producto para que le pongamos “Sí”.
        </p>
        <dl className="grid gap-3 md:grid-cols-2">
          {CRITERIOS.map((c) => (
            <div
              key={c.clave}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <dt className="font-medium text-[var(--color-tinta)]">{c.nombre}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {c.porQueImporta}
              </dd>
              <dd className="mt-2 text-xs leading-relaxed text-[var(--color-tinta-tenue)]">
                <strong>Cómo lo comprobamos:</strong> {c.comoLoComprobamos}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="tabla" className="flex flex-col gap-4">
        <h2 id="tabla" className="text-2xl font-semibold">
          Comparativo
        </h2>
        <TablaEnvoltura aria-label="Comparativo de software de cumplimiento">
          <table className="w-full min-w-[56rem] border-collapse text-sm">
            <caption className="sr-only">
              Proveedores de software de cumplimiento LFPIORPI y estado de comprobación de cada
              criterio.
            </caption>
            <thead>
              <tr className="bg-[var(--color-marfil-hondo)] text-left">
                <th scope="col" className="p-3 font-semibold">
                  Criterio
                </th>
                {PROVEEDORES_SOFTWARE.map((p) => (
                  <th key={p.clave} scope="col" className="p-3 font-semibold">
                    {p.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CRITERIOS.map((c) => (
                <tr key={c.clave} className="border-t border-[var(--color-borde)]">
                  <th scope="row" className="p-3 text-left font-medium text-[var(--color-tinta)]">
                    {c.nombre}
                  </th>
                  {PROVEEDORES_SOFTWARE.map((p) => {
                    const valor = valorDe(p, c.clave);
                    return (
                      <td key={p.clave} className="p-3">
                        <Insignia tono={TONO_VALOR[valor]}>{ETIQUETA_VALOR[valor]}</Insignia>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>
      </section>

      <section aria-labelledby="fichas" className="flex flex-col gap-4">
        <h2 id="fichas" className="text-2xl font-semibold">
          Qué observamos de cada uno
        </h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {PROVEEDORES_SOFTWARE.map((p) => (
            <li
              key={p.clave}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <p className="font-medium text-[var(--color-tinta)]">{p.nombre}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {p.observacion}
              </p>
              <a
                href={p.sitio}
                target="_blank"
                rel="nofollow noopener external"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--color-petroleo-hondo)] underline underline-offset-4"
              >
                Sitio del proveedor
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-[var(--color-tinta-tenue)]">
          ¿Eres proveedor y quieres que probemos tu producto? Dinos por{' '}
          <Link href="/contacto" className="underline underline-offset-4">
            contacto
          </Link>{' '}
          y te pedimos una cuenta de evaluación. La prueba es gratuita para ti y el resultado se
          publica tal cual salga.
        </p>
      </section>

      <section aria-labelledby="preguntas" className="flex flex-col gap-4">
        <h2 id="preguntas" className="text-2xl font-semibold">
          Qué preguntarle a cualquier proveedor antes de firmar
        </h2>
        <ol className="prosa flex list-decimal flex-col gap-2 pl-5 text-sm text-[var(--color-tinta-suave)]">
          {PREGUNTAS_AL_PROVEEDOR.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </section>

      <Nota tono="atencion" titulo="Software no es cumplimiento">
        Ninguna plataforma presenta avisos por ti sin tu firma electrónica, ninguna asume tu
        responsabilidad legal y ninguna te deja “en regla” por el hecho de estar contratada. La
        herramienta ordena la evidencia; las decisiones y la obligación siguen siendo del sujeto
        obligado.
      </Nota>

      <p className="text-sm text-[var(--color-tinta-tenue)]">
        ¿Buscas quién implante el sistema, no el sistema?{' '}
        <Link href="/directorio/software-cumplimiento" className="underline underline-offset-4">
          Consulta el directorio de proveedores de software
        </Link>
        .
      </p>
    </div>
  );
}
