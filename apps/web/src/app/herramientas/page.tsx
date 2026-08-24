import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { VERSION_LEGAL, datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { construirMetadata, jsonLdCatalogo, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';
import { GRUPOS, HERRAMIENTAS, rutaHerramienta } from '@/lib/herramientas/catalogo';

const ACTUALIZADO = '2026-08-11';

export const metadata: Metadata = construirMetadata({
  titulo: 'Herramientas de la Ley Antilavado',
  descripcion:
    'Calculadoras que sí calculan: umbrales por actividad y fecha, conversor de UMA, acumulación de seis meses, límites de efectivo y fechas de aviso.',
  ruta: '/herramientas',
});

export default function IndiceHerramientas() {
  const total = HERRAMIENTAS.length;
  const umaMasReciente = datos.UMA_VIGENTE_MAS_RECIENTE;

  return (
    <div className="contenedor-app py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonParaScript(
            jsonLdMigaDePan([
              { nombre: 'Inicio', ruta: '/' },
              { nombre: 'Herramientas', ruta: '/herramientas' },
            ]),
          ),
        }}
      />
      {/* El catálogo sale de la misma lista que pinta las tarjetas, así que no
          puede desincronizarse: una herramienta nueva entra en los dos sitios
          a la vez o en ninguno. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonParaScript(
            jsonLdCatalogo(
              'Herramientas de la Ley Antilavado',
              'Calculadoras y diagnósticos que resuelven umbrales, plazos y obligaciones de la LFPIORPI con el artículo y la UMA aplicada a la vista.',
              HERRAMIENTAS.map((h) => ({ nombre: h.titulo, ruta: rutaHerramienta(h.slug) })),
            ),
          ),
        }}
      />

      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-[var(--color-tinta)] md:text-4xl">
          Herramientas de la Ley Antilavado
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-tinta-suave)]">
          {total} herramientas que resuelven el cálculo completo, no una tabla estática con la
          cifra de este año. Cada una usa la UMA vigente en la fecha de tu operación, distingue
          entre “superior a” e “igual o superior a”, y te dice de qué artículo salió el número.
        </p>
        <p className="mt-3 text-sm text-[var(--color-tinta-tenue)]">
          Corpus legal {VERSION_LEGAL} · UMA más reciente registrada: {umaMasReciente.anio} ·
          Revisado el {formatearFechaLarga(ACTUALIZADO)}
        </p>
      </header>

      <Nota tono="info" titulo="Nada de lo que captures sale de tu navegador" className="mt-8">
        <p>
          Todos los cálculos corren del lado del cliente. No mandamos montos, fechas ni datos de
          clientes a ningún servidor, no guardamos resultados y las páginas de resultado no se
          indexan. Si guardas algo, se queda en el almacenamiento local de tu equipo.
        </p>
      </Nota>

      {GRUPOS.map((grupo) => {
        const deEsteGrupo = HERRAMIENTAS.filter((h) => h.grupo === grupo.clave);
        if (deEsteGrupo.length === 0) return null;

        return (
          <section key={grupo.clave} aria-labelledby={`grupo-${grupo.clave}`} className="mt-12">
            <h2
              id={`grupo-${grupo.clave}`}
              className="text-2xl font-semibold text-[var(--color-tinta)]"
            >
              {grupo.titulo}
            </h2>
            <p className="mt-2 max-w-2xl text-[var(--color-tinta-suave)]">{grupo.descripcion}</p>

            <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {deEsteGrupo.map((h) => {
                const Icono = h.icono;
                return (
                  <li key={h.slug}>
                    <Tarjeta className="relative h-full transition-shadow hover:shadow-[var(--shadow-media)]">
                      <TarjetaCuerpo className="flex h-full flex-col">
                        <span
                          aria-hidden
                          className="inline-flex size-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-petroleo-tenue)] text-[var(--color-petroleo-hondo)]"
                        >
                          <Icono className="size-5" />
                        </span>
                        <h3 className="mt-4 text-lg font-semibold text-[var(--color-tinta)]">
                          <Link
                            href={rutaHerramienta(h.slug)}
                            className="after:absolute after:inset-0 focus-visible:outline-none"
                          >
                            {h.titulo}
                          </Link>
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                          {h.queCalcula}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-petroleo-hondo)]">
                          Abrir herramienta
                          <ArrowRight aria-hidden className="size-4" />
                        </span>
                      </TarjetaCuerpo>
                    </Tarjeta>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <section aria-labelledby="por-que" className="prosa mt-16">
        <h2 id="por-que" className="text-2xl font-semibold text-[var(--color-tinta)]">
          Por qué estas calculadoras dan otro resultado
        </h2>
        <p>
          Tres detalles cambian la respuesta y casi ninguna herramienta pública los implementa.
        </p>
        <p>
          <strong>La UMA entra en vigor el 1 de febrero.</strong> Una operación del 15 de enero de
          2026 se mide con la UMA de 2025, no con la de 2026. Las tablas tituladas “umbrales 2026”
          suelen aplicar la cifra nueva a todo el año, y en enero eso mueve el umbral casi cuatro
          por ciento.
        </p>
        <p>
          <strong>El artículo 32 se mide con IVA y el artículo 17 sin IVA.</strong> Son dos bases
          distintas para el mismo contrato. Meter una sola cifra en las dos reglas produce un
          resultado tranquilizador y equivocado justo en el borde.
        </p>
        <p>
          <strong>“Superior a” no es “igual o superior a”.</strong> En arrendamiento, una renta
          mensual de exactamente 1,605 UMA no obliga a identificar; una de exactamente 3,210 UMA sí
          obliga a avisar. Colapsar ambos a un “mayor o igual” inventa una obligación que la ley no
          impone.
        </p>
        <p>
          A eso se suma que muchas actividades no tienen un umbral, sino varios. Un notario tiene
          cinco incisos con reglas distintas y tres de ellos generan aviso sin importar el monto. La
          calculadora te pide el inciso en lugar de promediarlos.
        </p>
      </section>
    </div>
  );
}
