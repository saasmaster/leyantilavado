import type { Metadata } from 'next';
import Link from 'next/link';
import { Boton, Nota } from '@leyantilavado/ui';
import { FiltrosDirectorio } from '@/components/directorio/FiltrosDirectorio';
import { ResultadosDirectorio } from '@/components/directorio/ResultadosDirectorio';
import { ETIQUETA_CATEGORIA, FICHAS_CATEGORIA, ORDEN_CATEGORIAS } from '@/lib/directorio/catalogo';
import { buscarProveedores, leerFiltros } from '@/lib/directorio/filtros';
import { repositorioDirectorio } from '@/lib/directorio/repositorio';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';

export const metadata: Metadata = construirMetadata({
  titulo: 'Directorio de profesionales en prevención de lavado de dinero',
  descripcion:
    'Encuentra contadores, abogados, consultores, auditores y software de cumplimiento LFPIORPI por estado, actividad vulnerable y tipo de servicio. Buscador con filtros y verificación explicada.',
  ruta: '/directorio',
});

export default async function PaginaDirectorio({
  searchParams,
}: {
  // Next 16: los parámetros de búsqueda llegan como promesa.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filtros = leerFiltros(params);
  const perfiles = await repositorioDirectorio.listarPerfiles();
  const resultado = buscarProveedores(perfiles, filtros);

  return (
    <div className="contenedor-app flex flex-col gap-10 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLdMigaDePan([
              { nombre: 'Inicio', ruta: '/' },
              { nombre: 'Directorio', ruta: '/directorio' },
            ]),
          ),
        }}
      />

      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold md:text-4xl">Directorio profesional</h1>
        <p className="prosa text-[var(--color-tinta-suave)]">
          Contadores, abogados, consultores, auditores, capacitadores y herramientas que trabajan
          con obligaciones de la Ley Antilavado. Los filtros viven en la dirección de la página:
          puedes guardar o compartir una búsqueda tal cual la dejaste.
        </p>

        <Nota tono="atencion" titulo="Los perfiles que ves hoy son de demostración">
          <p>
            El directorio todavía no está abierto a registros reales. Las fichas publicadas fueron
            creadas por nosotros para probar el buscador: los nombres son ficticios y no
            corresponden a ningún despacho, empresa ni persona. Cada una lleva la etiqueta “Perfil
            de demostración”.
          </p>
          <p>
            Si ofreces servicios de cumplimiento y quieres aparecer cuando abramos,{' '}
            <Link href="/directorio/alta" className="underline underline-offset-4">
              deja tu alta
            </Link>
            : la revisamos a mano antes de publicar nada.
          </p>
        </Nota>

        <Nota tono="info" titulo="Qué significa aparecer aquí">
          <p>
            Estar en el directorio no es un aval nuestro. Comprobamos cosas concretas —el correo,
            la identidad, los documentos que nos presentan— y decimos exactamente cuáles en cada
            perfil. Nunca decimos que alguien está “certificado por LeyAntilavado.org”, porque no
            certificamos a nadie. La decisión de contratar, y la verificación final, son tuyas.
          </p>
        </Nota>
      </header>

      <FiltrosDirectorio filtros={filtros} />

      <ResultadosDirectorio resultado={resultado} filtros={filtros} rutaBase="/directorio" />

      <section aria-labelledby="titulo-categorias" className="flex flex-col gap-4">
        <h2 id="titulo-categorias" className="text-xl font-semibold">
          Buscar por tipo de profesional
        </h2>
        <p className="prosa text-sm text-[var(--color-tinta-suave)]">
          Cada categoría tiene su propia página con qué hace ese perfil dentro del cumplimiento y
          qué preguntarle antes de contratarlo.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ORDEN_CATEGORIAS.map((c) => (
            <li key={c}>
              <Link
                href={`/directorio/${c}`}
                className="block h-full rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4 transition-colors hover:bg-[var(--color-marfil-hondo)]"
              >
                <span className="font-medium text-[var(--color-tinta)]">
                  {ETIQUETA_CATEGORIA[c]}
                </span>
                <span className="mt-1 block text-sm text-[var(--color-tinta-suave)]">
                  {FICHAS_CATEGORIA[c].resumen}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marino-tenue)] p-6">
        <h2 className="text-xl font-semibold">¿Ofreces servicios de cumplimiento?</h2>
        <p className="prosa mt-2 text-sm text-[var(--color-tinta-suave)]">
          El perfil básico es gratuito y no compra posición: el orden de los resultados lo define lo
          que comprobamos, no lo que se paga. Explicamos el proceso de verificación y sus tiempos
          antes de que llenes nada.
        </p>
        <Boton comoHijo className="mt-4" variante="primario">
          <Link href="/directorio/alta">Dar de alta mi perfil</Link>
        </Boton>
      </section>
    </div>
  );
}
