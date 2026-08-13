import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { VERSION_LEGAL, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Insignia, Nota, Tarjeta } from '@leyantilavado/ui';
import { PLANTILLAS } from '@/content/plantillas';
import { REVISION_VIGENTE } from '@/components/inicio/comun';
import { construirMetadata } from '@/lib/sitio';
import { JsonLd, jsonLdColeccion } from '@/components/contenido/JsonLd';

export const metadata: Metadata = construirMetadata({
  titulo: 'Plantillas de cumplimiento LFPIORPI',
  descripcion:
    'Manual de políticas, matriz de riesgos, expedientes de identificación y control de operaciones, con lo que tienes que ajustar en cada uno.',
  ruta: '/plantillas',
  tipo: 'article',
  publicadoEn: REVISION_VIGENTE,
  actualizadoEn: REVISION_VIGENTE,
});

/**
 * Las plantillas no son archivos guardados: se generan del corpus legal en el
 * momento de la descarga.
 *
 * Ese detalle es el argumento entero de la página. Una plantilla de
 * cumplimiento es de los documentos que peor envejecen —entre la reforma de
 * julio de 2025 y el Acuerdo 115/2026 cambiaron umbrales, plazos y
 * obligaciones enteras— y la que circula por correo entre despachos suele
 * citar artículos que ya no dicen eso.
 *
 * Por eso cada archivo trae impresa arriba la versión del corpus con la que se
 * generó: para que dentro de un año se sepa si hay que volver por otro.
 */
export default function PaginaPlantillas() {
  return (
    <div className="contenedor-app flex flex-col gap-10 py-10 md:py-14">
      <JsonLd
        datos={jsonLdColeccion({
          nombre: 'Plantillas de cumplimiento LFPIORPI',
          descripcion:
            'Documentos base para el programa de cumplimiento, generados del corpus legal en el momento de la descarga.',
          ruta: '/plantillas',
          elementos: PLANTILLAS.map((p) => ({
            nombre: p.titulo,
            descripcion: p.descripcion,
            url: `/plantillas/${p.archivo}`,
            tipo: 'DigitalDocument',
          })),
        })}
      />

      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold md:text-4xl">Plantillas de cumplimiento LFPIORPI</h1>
        <p className="prosa text-[var(--color-tinta-suave)]">
          Documentos base para armar tu programa de cumplimiento. No están guardados como archivos:
          se generan al momento a partir del corpus legal, así que traen los pasos y los artículos
          vigentes el día que los descargas, no los del día que alguien los escribió.
        </p>
        <p className="cifra text-sm text-[var(--color-tinta-tenue)]">
          Generadas contra la versión {VERSION_LEGAL} del corpus · revisada al{' '}
          {formatearFechaLarga(REVISION_VIGENTE)}
        </p>
      </header>

      <Nota tono="atencion" titulo="Ninguna plantilla te pone en regla">
        <p>
          Lo que se revisa en una auditoría no es el formato, es el procedimiento: qué hace{' '}
          <strong>tu</strong> negocio, quién lo hace y con qué evidencia. Un manual descargado y
          firmado sin adaptar se detecta en la primera pregunta, que casi siempre es sobre un caso
          concreto de tu operación.
        </p>
        <p>
          Por eso cada plantilla dice, en su propia ficha, qué hay que cambiarle sí o sí antes de
          usarla. Esa lista no es un formalismo: es la parte que no podemos hacer por ti.
        </p>
      </Nota>

      <section aria-labelledby="catalogo" className="flex flex-col gap-5">
        <h2 id="catalogo" className="sr-only">
          Catálogo de plantillas
        </h2>
        <ul className="grid gap-5 lg:grid-cols-2">
          {PLANTILLAS.map((p) => {
            const Icono = p.formato === 'csv' ? FileSpreadsheet : FileText;
            return (
              <li key={p.archivo}>
                <Tarjeta className="flex h-full flex-col gap-4 p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <Icono
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-[var(--color-petroleo)]"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
                        {p.titulo}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Insignia tono="neutro">{p.formato.toUpperCase()}</Insignia>
                        <Insignia tono="marino">
                          {p.filas} {p.formato === 'md' ? 'secciones' : 'filas'}
                        </Insignia>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {p.descripcion}
                  </p>

                  <div className="rounded-[var(--radius-control)] bg-[var(--color-marfil-hondo)] p-4">
                    <p className="text-sm font-semibold text-[var(--color-tinta)]">
                      Qué tienes que adaptar
                    </p>
                    <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                      {p.adaptar.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-xs text-[var(--color-tinta-tenue)]">
                    Fundamento: {p.fundamento}
                  </p>

                  <a
                    href={`/plantillas/${p.archivo}`}
                    download={p.archivo}
                    className="relleno-accion mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] px-6 text-[0.925rem] font-medium text-white shadow-[var(--shadow-suave)] transition-[box-shadow,filter] duration-200 hover:brightness-110 hover:shadow-[var(--shadow-media)]"
                  >
                    <Download aria-hidden="true" className="size-[1.05em]" />
                    Descargar {p.archivo}
                  </a>
                </Tarjeta>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="por-que-csv" className="flex flex-col gap-3">
        <h2 id="por-que-csv" className="text-2xl font-semibold">
          Por qué CSV y no Word o Excel
        </h2>
        <p className="prosa text-[var(--color-tinta-suave)]">
          Un .docx o un .xlsx obligan a tener el programa que los abre y esconden el contenido
          detrás de un formato binario. Un CSV se abre igual en Excel, en Google Sheets y en
          Numbers, se puede leer con los ojos si hace falta, y se puede versionar. El manual va en
          Markdown por lo mismo: es texto, y el día que tu abogado lo revise podrá ver exactamente
          qué cambió.
        </p>
        <p className="prosa text-[var(--color-tinta-suave)]">
          Si prefieres no llenar hojas de cálculo a mano, las{' '}
          <Link href="/herramientas" className="underline underline-offset-4">
            herramientas
          </Link>{' '}
          hacen el mismo trabajo y calculan los umbrales por ti.
        </p>
      </section>
    </div>
  );
}
