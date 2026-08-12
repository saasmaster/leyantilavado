import * as React from 'react';
import Link from 'next/link';
import type {
  CategoriaObligacion,
  EspecificacionUmbral,
  NivelVerificacion,
} from '@leyantilavado/types';
import { formatearMXN } from '@leyantilavado/types';
import { convertirUMA, datos, VERSION_LEGAL } from '@leyantilavado/rules-engine';
import { cn, Insignia } from '@leyantilavado/ui';

/**
 * Fecha de referencia del sitio: el día en que se revisó el corpus legal.
 *
 * Antes esto era `new Date()` al importar el módulo, y en un sitio generado
 * de forma estática eso no es "hoy": es el día en que corrió el build. La
 * página quedaba afirmando "marco legal revisado al 12 de agosto" para
 * siempre, y —peor— dos builds del mismo código convertían UMA con fechas
 * distintas, así que las cifras cambiaban sin que cambiara una línea.
 *
 * `VERSION_LEGAL` sí es un hecho declarado: la fecha en que se revisó el
 * corpus. Derivarla de ahí hace la afirmación cierta y el build reproducible.
 * Cuando se revisa la ley se sube la versión, y esta fecha avanza con ella.
 */
export const REVISION_VIGENTE: string = VERSION_LEGAL.replaceAll('.', '-');

/** Mapa id → { nombre, url } que consume `SelloProcedencia` para enlazar. */
export const MAPA_FUENTES: Record<string, { nombre: string; url: string }> =
  Object.fromEntries(datos.FUENTES.map((f) => [f.id, { nombre: f.nombre, url: f.url }]));

export const ETIQUETA_CATEGORIA_OBLIGACION: Record<CategoriaObligacion, string> = {
  registro: 'Alta y registro',
  identificacion: 'Identificación del cliente',
  expediente: 'Expedientes',
  avisos: 'Avisos e informes',
  riesgos: 'Enfoque basado en riesgos',
  gobierno: 'Gobierno interno',
  capacitacion: 'Capacitación',
  tecnologia: 'Tecnología',
  auditoria: 'Auditoría',
  conservacion: 'Conservación',
};

/**
 * Los cuatro niveles de verificación, explicados para páginas editoriales.
 *
 * Los mismos textos viven dentro de `SelloProcedencia` en `@leyantilavado/ui`,
 * pero ese componente no los exporta. Si algún día se exportan, esta tabla se
 * borra y se importa de ahí: la fuente de verdad debe ser una sola.
 */
export const NIVELES_VERIFICACION: readonly {
  nivel: NivelVerificacion;
  etiqueta: string;
  explicacion: string;
  queHacemos: string;
}[] = [
  {
    nivel: 'oficial_verificado',
    etiqueta: 'Verificado en fuente oficial',
    explicacion:
      'Contrastamos el dato directamente contra el documento publicado por la autoridad.',
    queHacemos: 'Se publica sin restricción, con la disposición y la fecha de revisión a la vista.',
  },
  {
    nivel: 'oficial_no_accesible',
    etiqueta: 'Fuente oficial no accesible',
    explicacion:
      'La fuente oficial no estaba disponible al momento de la revisión. El dato proviene de una reproducción confiable.',
    queHacemos:
      'Se publica con la advertencia visible y entra en la cola de reintento del monitor de fuentes.',
  },
  {
    nivel: 'fuente_secundaria',
    etiqueta: 'Fuente secundaria',
    explicacion:
      'El dato proviene de una fuente confiable distinta al documento oficial y aún no se contrasta contra el original.',
    queHacemos:
      'Se publica marcado, nunca como transcripción legal, y no alimenta ninguna conclusión de riesgo alto.',
  },
  {
    nivel: 'no_verificado',
    etiqueta: 'Requiere revisión editorial',
    explicacion:
      'No pudimos confirmar el dato en una fuente oficial. No debe usarse para tomar decisiones sin revisión profesional.',
    queHacemos:
      'No se publica como cifra. La interfaz muestra el hueco y explica por qué está vacío, en lugar de rellenarlo.',
  },
];

/* ── Envoltura de sección ─────────────────────────────────────────────────── */

export function Seccion({
  id,
  etiqueta,
  titulo,
  descripcion,
  accion,
  fondo,
  className,
  children,
}: {
  id: string;
  etiqueta?: string;
  titulo: string;
  descripcion?: React.ReactNode;
  accion?: React.ReactNode;
  fondo?: 'marfil' | 'hondo';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className={cn(
        'py-14 md:py-20',
        fondo === 'hondo' && 'bg-[var(--color-marfil-hondo)]',
        className,
      )}
    >
      <div className="contenedor-app">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {etiqueta && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-petroleo-hondo)]">
                {etiqueta}
              </p>
            )}
            <h2
              id={`${id}-titulo`}
              className="text-2xl font-semibold text-[var(--color-tinta)] md:text-3xl"
            >
              {titulo}
            </h2>
            {descripcion && (
              <div className="mt-3 text-[0.97rem] leading-relaxed text-[var(--color-tinta-suave)]">
                {descripcion}
              </div>
            )}
          </div>
          {accion && <div className="shrink-0">{accion}</div>}
        </div>

        <div className="mt-8 md:mt-10">{children}</div>
      </div>
    </section>
  );
}

/* ── Encabezado y miga de pan de páginas editoriales ──────────────────────────
   Vive aquí porque es el único módulo compartido de esta tanda. Cuando haya
   más páginas institucionales conviene moverlo a `components/`.
   ─────────────────────────────────────────────────────────────────────────── */

export function EncabezadoPagina({
  miga,
  titulo,
  entradilla,
  actualizado,
}: {
  miga: { nombre: string; ruta: string }[];
  titulo: string;
  entradilla: string;
  actualizado?: string;
}) {
  return (
    <header className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
      <div className="contenedor-app py-10 md:py-14">
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-tinta-tenue)]">
            {miga.map((item, i) => (
              <li key={item.ruta} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {i === miga.length - 1 ? (
                  <span aria-current="page">{item.nombre}</span>
                ) : (
                  <Link href={item.ruta} className="underline underline-offset-2">
                    {item.nombre}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="mt-4 text-3xl font-semibold text-[var(--color-tinta)] md:text-[2.6rem]">
          {titulo}
        </h1>
        <p className="prosa mt-4 text-[1.03rem] text-[var(--color-tinta-suave)]">{entradilla}</p>
        {actualizado && (
          <p className="cifra mt-4 text-xs text-[var(--color-tinta-tenue)]">
            Última actualización: {actualizado}
          </p>
        )}
      </div>
    </header>
  );
}

/* ── Especificación de umbral ─────────────────────────────────────────────────
   La unión `EspecificacionUmbral` tiene SEIS casos y ninguno se puede aplanar
   a un número. Este componente los renderiza todos; el `never` final hace que
   el compilador falle si algún día se agrega un séptimo caso.
   ─────────────────────────────────────────────────────────────────────────── */

export function EspecificacionCelda({
  especificacion,
  fecha = REVISION_VIGENTE,
  compacto,
}: {
  especificacion: EspecificacionUmbral;
  fecha?: string;
  compacto?: boolean;
}) {
  const e = especificacion;

  switch (e.tipo) {
    case 'siempre':
      return <Insignia tono="marino">Siempre, sin importar el monto</Insignia>;

    case 'nunca':
      return <Insignia tono="neutro">No aplica esta obligación</Insignia>;

    case 'uma': {
      const c = convertirUMA(e.uma, fecha);
      const prefijo = e.comparador === 'mayor' ? 'superior a' : 'desde';
      return (
        <div className="flex flex-col gap-0.5">
          <span className="cifra font-semibold text-[var(--color-tinta)]">
            {prefijo} {e.uma.toLocaleString('es-MX')} UMA
          </span>
          <span className="cifra text-sm text-[var(--color-tinta-suave)]">
            {formatearMXN(c.equivalentePesos)}
            <span className="text-[var(--color-tinta-tenue)]"> · UMA {c.anioUMA}</span>
          </span>
        </div>
      );
    }

    case 'monto_o_comision': {
      const monto = convertirUMA(e.umaMonto, fecha);
      const comision = convertirUMA(e.umaComision, fecha);
      return (
        <div className="flex flex-col gap-1.5">
          <span className="cifra text-sm text-[var(--color-tinta)]">
            Operación: <strong>{e.umaMonto.toLocaleString('es-MX')} UMA</strong> ·{' '}
            {formatearMXN(monto.equivalentePesos)}
          </span>
          <span className="cifra text-sm text-[var(--color-tinta)]">
            Contraprestación: <strong>{e.umaComision.toLocaleString('es-MX')} UMA</strong> ·{' '}
            {formatearMXN(comision.equivalentePesos)}
          </span>
          <span className="text-xs text-[var(--color-tinta-tenue)]">
            Basta con que uno de los dos se alcance.
          </span>
        </div>
      );
    }

    case 'variable':
      return (
        <div className="flex flex-col gap-1.5">
          <Insignia tono="ambar">Depende del supuesto</Insignia>
          {!compacto && (
            <ul className="flex flex-col gap-1 text-xs text-[var(--color-tinta-suave)]">
              {e.supuestos.map((s) => (
                <li key={s.clave}>
                  {s.descripcion}{' '}
                  <span className="text-[var(--color-tinta-tenue)]">
                    <EspecificacionResumen especificacion={s.umbral} fecha={fecha} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case 'requiere_revision':
      return (
        <div className="flex flex-col gap-1">
          <Insignia tono="rojo">Requiere revisión editorial</Insignia>
          <span className="text-xs text-[var(--color-tinta-suave)]">{e.nota}</span>
        </div>
      );

    default: {
      const exhaustivo: never = e;
      return <>{String(exhaustivo)}</>;
    }
  }
}

/** Versión en una línea, para listas anidadas dentro de `variable`. */
function EspecificacionResumen({
  especificacion,
  fecha,
}: {
  especificacion: Exclude<EspecificacionUmbral, { tipo: 'variable' }>;
  fecha: string;
}) {
  const e = especificacion;
  if (e.tipo === 'siempre') return <>→ obligación en todos los casos</>;
  if (e.tipo === 'nunca') return <>→ no genera esta obligación</>;
  if (e.tipo === 'requiere_revision') return <>→ requiere revisión editorial</>;
  if (e.tipo === 'uma') {
    const c = convertirUMA(e.uma, fecha);
    return (
      <>
        → {e.uma.toLocaleString('es-MX')} UMA ({formatearMXN(c.equivalentePesos)})
      </>
    );
  }
  const monto = convertirUMA(e.umaMonto, fecha);
  return (
    <>
      → {e.umaMonto.toLocaleString('es-MX')} UMA ({formatearMXN(monto.equivalentePesos)}) o
      contraprestación de {e.umaComision.toLocaleString('es-MX')} UMA
    </>
  );
}
