'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarClock, CircleHelp, CheckCircle2, TriangleAlert } from 'lucide-react';
import { Insignia, cn } from '@leyantilavado/ui';

/* ────────────────────────────────────────────────────────────────────────────
 * Datos de entrada
 *
 * El componente recibe estructuras planas y serializables. NO recibe objetos
 * del motor: pasar clases o funciones de un server component a un client
 * component revienta con un 500 en Next 16.
 * ────────────────────────────────────────────────────────────────────────── */

export interface ReglaConFecha {
  id: string;
  fecha: string;
  fechaLarga: string;
  titulo: string;
  descripcion: string;
  confirmadoOficialmente: boolean;
  /** Etiquetas de las obligaciones que activa. */
  obligaciones: readonly string[];
}

export interface ReglaSinFecha {
  id: string;
  titulo: string;
  descripcion: string;
  motivo: string;
}

interface Props {
  reglas: readonly ReglaConFecha[];
  sinFecha?: readonly ReglaSinFecha[];
  /**
   * Instante de referencia en ISO, calculado por el servidor.
   *
   * Va como prop y no como `Date.now()` interno por dos razones: el primer
   * render del cliente tiene que producir exactamente el mismo HTML que el del
   * servidor (si no, error de hidratación), y `Date.now()` durante el render
   * viola la regla `react-hooks/purity` de eslint, que `tsc` no detecta y sólo
   * aparece en `next build`.
   */
  ahoraISO: string;
  titulo?: string;
  descripcion?: string;
  /** Muestra sólo las N reglas pendientes más próximas. Para la portada. */
  limite?: number;
  /** Enlace a la vista completa cuando se recorta con `limite`. */
  verTodoHref?: string;
  className?: string;
}

/* ────────────────────────────────────────────────────────────────────────── */

interface Restante {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  vencido: boolean;
  totalMs: number;
}

/** Las fechas legales corren a medianoche hora del centro de México (UTC-6). */
const DESPLAZAMIENTO_MX = '-06:00';

/* ────────────────────────────────────────────────────────────────────────────
 * Reloj compartido
 *
 * El reloj es una fuente externa mutable, así que se suscribe con
 * `useSyncExternalStore` en lugar de `useState` + `useEffect`.
 *
 * Dos razones concretas, ninguna teórica:
 *
 *  1. `setState` síncrono dentro de un efecto dispara renders en cascada y la
 *     regla `react-hooks/set-state-in-effect` lo marca como error.
 *  2. `getServerSnapshot` deja que el primer render del cliente use el MISMO
 *     valor que el del servidor, así que la hidratación coincide exactamente.
 *
 * El valor va en caché a nivel de módulo: si `getSnapshot` devolviera
 * `Date.now()` fresco en cada llamada, React vería un cambio en cada render y
 * entraría en bucle infinito.
 */
let relojEnCache = 0;
const suscriptores = new Set<() => void>();
let intervaloReloj: ReturnType<typeof setInterval> | null = null;

function suscribirAlReloj(alCambiar: () => void): () => void {
  suscriptores.add(alCambiar);
  if (intervaloReloj === null) {
    intervaloReloj = setInterval(() => {
      relojEnCache = Date.now();
      suscriptores.forEach((fn) => fn());
    }, 1000);
  }
  return () => {
    suscriptores.delete(alCambiar);
    if (suscriptores.size === 0 && intervaloReloj !== null) {
      clearInterval(intervaloReloj);
      intervaloReloj = null;
    }
  };
}

/** Devuelve siempre la MISMA referencia hasta que el intervalo la actualiza. */
function leerReloj(): number {
  if (relojEnCache === 0) relojEnCache = Date.now();
  return relojEnCache;
}

function calcularRestante(fechaObjetivo: string, ahoraMs: number): Restante {
  const objetivo = new Date(`${fechaObjetivo}T00:00:00${DESPLAZAMIENTO_MX}`).getTime();
  const delta = objetivo - ahoraMs;

  if (delta <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, vencido: true, totalMs: delta };
  }

  const segundosTotales = Math.floor(delta / 1000);
  return {
    dias: Math.floor(segundosTotales / 86_400),
    horas: Math.floor((segundosTotales % 86_400) / 3_600),
    minutos: Math.floor((segundosTotales % 3_600) / 60),
    segundos: segundosTotales % 60,
    vencido: false,
    totalMs: delta,
  };
}

/** Urgencia por proximidad. Tiñe la tarjeta sin necesidad de leerla. */
function urgencia(r: Restante): 'vigente' | 'inminente' | 'cercano' | 'lejano' {
  if (r.vencido) return 'vigente';
  if (r.dias <= 30) return 'inminente';
  if (r.dias <= 180) return 'cercano';
  return 'lejano';
}

const ESTILO: Record<
  ReturnType<typeof urgencia>,
  { borde: string; fondo: string; acento: string; etiqueta: string }
> = {
  vigente: {
    borde: 'border-[var(--color-verde)]/35',
    fondo: 'bg-[var(--color-verde-tenue)]',
    acento: 'text-[var(--color-verde)]',
    etiqueta: 'Ya en vigor',
  },
  inminente: {
    borde: 'border-[var(--color-rojo)]/35',
    fondo: 'bg-[var(--color-rojo-tenue)]',
    acento: 'text-[var(--color-rojo)]',
    etiqueta: 'Menos de 30 días',
  },
  cercano: {
    borde: 'border-[var(--color-ambar)]/35',
    fondo: 'bg-[var(--color-ambar-tenue)]',
    acento: 'text-[var(--color-ambar)]',
    etiqueta: 'Menos de 6 meses',
  },
  lejano: {
    borde: 'border-[var(--color-borde)]',
    fondo: 'bg-[var(--color-superficie)]/60',
    acento: 'text-[var(--color-marino)]',
    etiqueta: 'Con margen',
  },
};

/* ────────────────────────────────────────────────────────────────────────── */

export function CuentaRegresivaReglas({
  reglas,
  sinFecha = [],
  ahoraISO,
  titulo = 'Cuánto falta para cada regla',
  descripcion = 'Cada obligación del calendario 2026-2029 con su cuenta regresiva en vivo. Las fechas son nominales: no las recorremos por días inhábiles sin una regla oficial que lo respalde.',
  limite,
  verTodoHref,
  className,
}: Props) {
  // En el servidor y durante la hidratación se usa la marca de tiempo que llegó
  // como prop; a partir de ahí, el reloj real del navegador cada segundo.
  const leerDelServidor = React.useCallback(() => new Date(ahoraISO).getTime(), [ahoraISO]);
  const ahoraMs = React.useSyncExternalStore(suscribirAlReloj, leerReloj, leerDelServidor);

  const ordenadas = React.useMemo(() => {
    const porFecha = [...reglas].sort((a, b) => a.fecha.localeCompare(b.fecha));
    if (limite === undefined) return porFecha;
    // En la vista recortada interesan las que faltan, no las que ya vencieron.
    const pendientes = porFecha.filter((r) => !calcularRestante(r.fecha, ahoraMs).vencido);
    return (pendientes.length > 0 ? pendientes : porFecha).slice(0, limite);
  }, [reglas, limite, ahoraMs]);

  return (
    <section className={cn('contenedor-app seccion', className)} aria-labelledby="titulo-regresiva">
      <div className="max-w-2xl">
        <h2
          id="titulo-regresiva"
          className="flex items-center gap-2.5 text-(length:--text-titulo)"
        >
          <CalendarClock
            aria-hidden="true"
            className="size-[0.8em] shrink-0 text-[var(--color-petroleo)]"
          />
          {titulo}
        </h2>
        <p className="mt-3 text-[var(--color-tinta-suave)]">{descripcion}</p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordenadas.map((regla, i) => (
          <TarjetaRegla key={regla.id} regla={regla} ahoraMs={ahoraMs} indice={i} />
        ))}
      </ul>

      {verTodoHref && (
        <a
          href={verTodoHref}
          className="mt-7 inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
        >
          Ver el calendario completo, fecha por fecha
        </a>
      )}

      {sinFecha.length > 0 && (
        <div className="mt-10">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-tinta)]">
            <CircleHelp className="size-4 text-[var(--color-tinta-tenue)]" />
            Obligaciones sin fecha cierta
          </h3>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--color-tinta-suave)]">
            Estas obligaciones existen en la norma pero su exigibilidad todavía no tiene una fecha
            publicada. No les ponemos cuenta regresiva porque sería inventarla.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {sinFecha.map((r) => (
              <li
                key={r.id}
                className="tarjeta border-dashed p-4"
              >
                <div className="flex items-start gap-2.5">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--color-ambar)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-tinta)]">{r.titulo}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                      {r.descripcion}
                    </p>
                    <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">{r.motivo}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function TarjetaRegla({
  regla,
  ahoraMs,
  indice,
}: {
  regla: ReglaConFecha;
  ahoraMs: number;
  indice: number;
}) {
  const reducido = useReducedMotion();
  const restante = calcularRestante(regla.fecha, ahoraMs);
  const nivel = urgencia(restante);
  const estilo = ESTILO[nivel];

  return (
    <motion.li
      initial={reducido ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: Math.min(indice * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'tarjeta tarjeta-interactiva flex flex-col p-5',
        estilo.borde,
        nivel !== 'lejano' && estilo.fondo,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Insignia
          tono={
            nivel === 'vigente' ? 'verde'
            : nivel === 'inminente' ? 'rojo'
            : nivel === 'cercano' ? 'ambar'
            : 'marino'
          }
        >
          {nivel === 'vigente' && <CheckCircle2 className="size-3" />}
          {estilo.etiqueta}
        </Insignia>

        {!regla.confirmadoOficialmente && (
          <span
            className="text-[0.68rem] font-medium text-[var(--color-tinta-tenue)]"
            title="El texto oficial fija un plazo en meses, no una fecha calendario. Esta fecha es un cálculo orientativo."
          >
            fecha estimada
          </span>
        )}
      </div>

      <h3 className="mt-3 text-base leading-snug font-semibold text-[var(--color-tinta)]">
        {regla.titulo}
      </h3>

      <p className="mt-1.5 text-sm text-[var(--color-tinta-tenue)]">{regla.fechaLarga}</p>

      <div className="mt-4 flex-1">
        {restante.vencido ? (
          <p className={cn('text-sm font-medium', estilo.acento)}>
            Esta regla ya es exigible.
          </p>
        ) : (
          <Reloj restante={restante} acento={estilo.acento} />
        )}
      </div>

      {regla.obligaciones.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-[var(--color-borde)] pt-3">
          {regla.obligaciones.slice(0, 3).map((o) => (
            <li
              key={o}
              className="rounded-[var(--radius-pastilla)] bg-[var(--color-marfil-hondo)] px-2 py-0.5 text-[0.7rem] text-[var(--color-tinta-suave)]"
            >
              {o}
            </li>
          ))}
          {regla.obligaciones.length > 3 && (
            <li className="px-1 py-0.5 text-[0.7rem] text-[var(--color-tinta-tenue)]">
              +{regla.obligaciones.length - 3}
            </li>
          )}
        </ul>
      )}
    </motion.li>
  );
}

/**
 * Reloj de cuatro segmentos.
 *
 * `aria-label` lleva el tiempo completo en prosa y el detalle visual va con
 * `aria-hidden`: un lector de pantalla que anunciara "1 4 2 : 0 6 : 3 3 : 1 2"
 * cada segundo sería inservible. `role="timer"` con `aria-live="off"` evita
 * que se relea en cada tick.
 */
function Reloj({ restante, acento }: { restante: Restante; acento: string }) {
  const segmentos = [
    { valor: restante.dias, etiqueta: restante.dias === 1 ? 'día' : 'días' },
    { valor: restante.horas, etiqueta: 'h' },
    { valor: restante.minutos, etiqueta: 'min' },
    { valor: restante.segundos, etiqueta: 's' },
  ];

  const enProsa =
    `Faltan ${restante.dias} días, ${restante.horas} horas y ${restante.minutos} minutos.`;

  return (
    <div role="timer" aria-live="off" aria-label={enProsa}>
      <div className="flex items-baseline gap-2" aria-hidden="true">
        {segmentos.map((s, i) => (
          <React.Fragment key={s.etiqueta}>
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  'cifra text-2xl leading-none font-semibold tabular-nums',
                  i === 0 ? acento : 'text-[var(--color-tinta)]',
                )}
              >
                {i === 0 ? s.valor : String(s.valor).padStart(2, '0')}
              </span>
              <span className="text-[0.7rem] text-[var(--color-tinta-tenue)]">{s.etiqueta}</span>
            </div>
            {i < segmentos.length - 1 && (
              <span className="text-[var(--color-borde-fuerte)]">·</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
