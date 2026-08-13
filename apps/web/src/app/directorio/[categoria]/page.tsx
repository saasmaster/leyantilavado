import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import { CATEGORIAS_PROVEEDOR } from '@leyantilavado/types';
import { Nota } from '@leyantilavado/ui';
import { FiltrosDirectorio } from '@/components/directorio/FiltrosDirectorio';
import { ResultadosDirectorio } from '@/components/directorio/ResultadosDirectorio';
import { esCategoria, FICHAS_CATEGORIA } from '@/lib/directorio/catalogo';
import { buscarProveedores, leerFiltros } from '@/lib/directorio/filtros';
import { repositorioDirectorio } from '@/lib/directorio/repositorio';
import { construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';

/**
 * Perfiles reales que necesita una categoría para competir como directorio.
 *
 * Por debajo de esto la página se sirve igual —su contenido editorial es
 * útil— pero con `noindex, follow`: aparecer en resultados como directorio y
 * enseñar «Sin resultados» le enseña al buscador que esta URL no cumple lo que
 * promete.
 */
const MINIMO_PARA_INDEXAR = 3;

export function generateStaticParams() {
  return CATEGORIAS_PROVEEDOR.map((categoria) => ({ categoria }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  // `notFound()`, no unos metadatos de «no encontrada». Devolver metadatos
  // válidos hace que la ruta se resuelva con éxito y la respuesta salga con
  // HTTP 200 aunque el cuerpo diga que no existe. Esta ruta es dinámica —lee
  // filtros de la URL y perfiles de disco— así que `dynamicParams` no la
  // ataja: el corte tiene que estar aquí.
  if (!esCategoria(categoria)) notFound();

  const ficha = FICHAS_CATEGORIA[categoria];

  // Una categoría sin perfiles se indexa como «directorio de proveedores» y
  // entrega «Sin resultados»: la peor coincidencia posible con esa intención,
  // y la clase de página que Google aprende a no volver a mostrar.
  //
  // El contenido editorial de la ficha sí vale —qué hace este tipo de
  // proveedor, qué preguntarle— pero no compite como directorio hasta que haya
  // oferta real. `follow` se mantiene: los enlaces internos siguen valiendo.
  const perfiles = (await repositorioDirectorio.listarPerfiles()).filter((p) =>
    p.categorias.includes(categoria),
  );

  return construirMetadata({
    titulo: `${ficha.plural} en prevención de lavado de dinero`,
    descripcion: ficha.resumen,
    ruta: `/directorio/${categoria}`,
    ...(perfiles.length < MINIMO_PARA_INDEXAR ? { noindex: true } : {}),
  });
}

export default async function PaginaCategoria({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { categoria } = await params;
  if (!esCategoria(categoria)) notFound();

  const ficha = FICHAS_CATEGORIA[categoria];
  const parametros = await searchParams;
  // La categoría de la URL manda sobre cualquier filtro que venga en el query.
  const filtros = { ...leerFiltros(parametros), categoria };
  const perfiles = await repositorioDirectorio.listarPerfiles();
  const resultado = buscarProveedores(perfiles, filtros);

  return (
    <div className="contenedor-app flex flex-col gap-10 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonParaScript(
            jsonLdMigaDePan([
              { nombre: 'Inicio', ruta: '/' },
              { nombre: 'Directorio', ruta: '/directorio' },
              { nombre: ficha.plural, ruta: `/directorio/${categoria}` },
            ]),
          ),
        }}
      />

      <header className="flex flex-col gap-4">
        <p className="text-sm text-[var(--color-tinta-tenue)]">
          <Link href="/directorio" className="underline underline-offset-4">
            Directorio
          </Link>{' '}
          / {ficha.plural}
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">{ficha.plural}</h1>
        <p className="prosa text-[var(--color-tinta-suave)]">{ficha.resumen}</p>
      </header>

      <section className="prosa" aria-labelledby="que-hace">
        <h2 id="que-hace" className="text-2xl font-semibold">
          Qué hace este perfil en materia de prevención de lavado
        </h2>
        {ficha.queHace.map((parrafo, i) => (
          <p key={i} className="text-[var(--color-tinta-suave)]">
            {parrafo}
          </p>
        ))}
      </section>

      <section aria-labelledby="como-elegir" className="flex flex-col gap-4">
        <h2 id="como-elegir" className="text-2xl font-semibold">
          Cómo elegir: cuatro preguntas antes de firmar
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {ficha.comoElegir.map((item) => (
            <li
              key={item.titulo}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <p className="flex items-start gap-2 font-medium text-[var(--color-tinta)]">
                <HelpCircle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[var(--color-petroleo)]"
                />
                {item.titulo}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {item.texto}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section
          aria-labelledby="alertas"
          className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
        >
          <h2 id="alertas" className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle aria-hidden="true" className="size-4 text-[var(--color-ambar)]" />
            Señales para desconfiar
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-[var(--color-tinta-suave)]">
            {ficha.senalesDeAlerta.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-ambar)]" />
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="limites"
          className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-5"
        >
          <h2 id="limites" className="flex items-center gap-2 text-lg font-semibold">
            <CheckCircle2 aria-hidden="true" className="size-4 text-[var(--color-petroleo)]" />
            Lo que este perfil no hace
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
            {ficha.loQueNoHace}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
            Contratar a alguien no traslada tu responsabilidad legal: la obligación de identificar,
            avisar y conservar sigue siendo del sujeto obligado.
          </p>
        </section>
      </div>

      <FiltrosDirectorio filtros={filtros} />

      <ResultadosDirectorio
        resultado={resultado}
        filtros={filtros}
        rutaBase={`/directorio/${categoria}`}
      />
    </div>
  );
}
