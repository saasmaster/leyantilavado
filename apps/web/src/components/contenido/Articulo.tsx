import Link from 'next/link';
import { ChevronRight, FileCheck2, Info, ScrollText } from 'lucide-react';
import { Insignia, Nota } from '@leyantilavado/ui';
import { AVISO_LEGAL_TEXTO, FIRMA_POR_DEFECTO } from '@/content/autores';
import type { FirmaContenido } from '@/content/tipos';

/* ── Migas de pan ──────────────────────────────────────────────────────────── */

export interface Miga {
  nombre: string;
  ruta: string;
}

export function Migas({ items }: { items: readonly Miga[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--color-tinta-tenue)]">
        {items.map((item, i) => {
          const ultimo = i === items.length - 1;
          return (
            <li key={item.ruta} className="flex items-center gap-1">
              {i > 0 && <ChevronRight aria-hidden className="size-3.5 opacity-60" />}
              {ultimo ? (
                <span aria-current="page" className="text-[var(--color-tinta-suave)]">
                  {item.nombre}
                </span>
              ) : (
                <Link
                  href={item.ruta}
                  className="underline underline-offset-2 hover:text-[var(--color-petroleo-hondo)]"
                >
                  {item.nombre}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Encabezado de artículo ────────────────────────────────────────────────── */

export function CabeceraArticulo({
  titulo,
  entradilla,
  etiquetas,
  respuestaDirecta,
}: {
  titulo: string;
  entradilla?: string;
  etiquetas?: readonly { texto: string; tono?: 'neutro' | 'marino' | 'petroleo' | 'ambar' | 'rojo' | 'verde' }[];
  respuestaDirecta: string;
}) {
  return (
    <header className="mb-10">
      {etiquetas && etiquetas.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {etiquetas.map((e) => (
            <Insignia key={e.texto} tono={e.tono ?? 'neutro'}>
              {e.texto}
            </Insignia>
          ))}
        </div>
      )}

      <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{titulo}</h1>

      {entradilla && (
        <p className="prosa mt-4 text-lg text-[var(--color-tinta-suave)]">{entradilla}</p>
      )}

      <div className="mt-6 rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-petroleo)_30%,transparent)] bg-[var(--color-petroleo-tenue)] p-5">
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[var(--color-petroleo-hondo)]">
          <Info aria-hidden className="size-4" />
          Respuesta directa
        </p>
        <p className="leading-relaxed text-[var(--color-tinta)]">{respuestaDirecta}</p>
      </div>
    </header>
  );
}

/* ── Índice de contenidos ──────────────────────────────────────────────────── */

export interface EntradaIndice {
  id: string;
  titulo: string;
}

export function IndiceContenidos({ entradas }: { entradas: readonly EntradaIndice[] }) {
  if (entradas.length === 0) return null;
  return (
    <nav
      aria-labelledby="indice-titulo"
      className="mb-10 rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-5"
    >
      <p
        id="indice-titulo"
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-tinta)]"
      >
        <ScrollText aria-hidden className="size-4" />
        En esta página
      </p>
      <ol className="grid gap-2 sm:grid-cols-2">
        {entradas.map((e, i) => (
          <li key={e.id} className="text-sm">
            <a
              href={`#${e.id}`}
              className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
            >
              <span className="cifra mr-1.5 text-[var(--color-tinta-tenue)]">{i + 1}.</span>
              {e.titulo}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── Sección con ancla ─────────────────────────────────────────────────────── */

export function Seccion({
  id,
  titulo,
  descripcion,
  children,
}: {
  id: string;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="mt-14 scroll-mt-24">
      <h2 id={`${id}-titulo`} className="text-2xl font-semibold">
        {titulo}
      </h2>
      {descripcion && (
        <p className="prosa mt-2 text-[var(--color-tinta-suave)]">{descripcion}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ── Listas de apoyo ───────────────────────────────────────────────────────── */

export function ListaConVinetas({
  items,
  tono = 'neutro',
}: {
  items: readonly string[];
  tono?: 'neutro' | 'positivo' | 'negativo';
}) {
  const color =
    tono === 'positivo'
      ? 'marker:text-[var(--color-verde)]'
      : tono === 'negativo'
        ? 'marker:text-[var(--color-rojo)]'
        : 'marker:text-[var(--color-petroleo)]';
  return (
    <ul className={`list-disc space-y-2 pl-5 leading-relaxed ${color}`}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

/* ── Firma editorial ───────────────────────────────────────────────────────── */

export function FirmaEditorial({ firma = FIRMA_POR_DEFECTO }: { firma?: FirmaContenido }) {
  return (
    <section
      aria-labelledby="firma-titulo"
      className="mt-14 rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-5"
    >
      <h2 id="firma-titulo" className="flex items-center gap-2 text-base font-semibold">
        <FileCheck2 aria-hidden className="size-4" />
        Quién escribe y cómo se verifica
      </h2>

      <p className="mt-3 text-sm font-medium text-[var(--color-tinta)]">
        {firma.autor.nombre}
        <span className="font-normal text-[var(--color-tinta-tenue)]"> · {firma.autor.rol}</span>
      </p>
      <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">{firma.autor.descripcion}</p>

      {firma.autor.credenciales.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {firma.autor.credenciales.map((c) => (
            <li key={c}>
              <Insignia tono="marino">{c}</Insignia>
            </li>
          ))}
        </ul>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2">
          Metodología editorial
        </summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-tinta-suave)]">
          {firma.autor.metodologia.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </details>

      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-xs text-[var(--color-tinta-tenue)]">
        <div className="flex gap-1.5">
          <dt>Publicado:</dt>
          <dd>
            <time dateTime={firma.publicadoEn}>{firma.publicadoEn}</time>
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Última actualización:</dt>
          <dd>
            <time dateTime={firma.actualizadoEn}>{firma.actualizadoEn}</time>
          </dd>
        </div>
        {firma.revisor && (
          <div className="flex gap-1.5">
            <dt>Revisó:</dt>
            <dd>{firma.revisor.nombre}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}

/* ── Aviso legal ───────────────────────────────────────────────────────────── */

export function AvisoLegal() {
  return (
    <Nota tono="atencion" titulo="Aviso legal" className="mt-8">
      {AVISO_LEGAL_TEXTO.map((t) => (
        <p key={t}>{t}</p>
      ))}
    </Nota>
  );
}

/* ── Enlaces relacionados ──────────────────────────────────────────────────── */

export function EnlacesRelacionados({
  titulo = 'Sigue por aquí',
  grupos,
}: {
  titulo?: string;
  grupos: readonly { titulo: string; enlaces: readonly { etiqueta: string; href: string; descripcion?: string }[] }[];
}) {
  const conEnlaces = grupos.filter((g) => g.enlaces.length > 0);
  if (conEnlaces.length === 0) return null;

  return (
    <section aria-labelledby="relacionados-titulo" className="mt-14">
      <h2 id="relacionados-titulo" className="text-2xl font-semibold">
        {titulo}
      </h2>
      <div className="mt-5 grid gap-6 md:grid-cols-3">
        {conEnlaces.map((g) => (
          <div key={g.titulo}>
            <p className="mb-2 text-sm font-semibold text-[var(--color-tinta)]">{g.titulo}</p>
            <ul className="space-y-2">
              {g.enlaces.map((e) => (
                <li key={e.href + e.etiqueta}>
                  <Link
                    href={e.href}
                    className="text-sm text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                  >
                    {e.etiqueta}
                  </Link>
                  {e.descripcion && (
                    <p className="text-xs text-[var(--color-tinta-tenue)]">{e.descripcion}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
