'use client';

import * as React from 'react';
import Image from 'next/image';
import fotoDocumentos from '../../../public/img/documentos.webp';
import Link from 'next/link';
import { CheckCircle2, Mail } from 'lucide-react';
import { Turnstile, reiniciarTurnstile } from '@/components/Turnstile';
import { Boton, Campo, Entrada, Nota, Selector } from '@leyantilavado/ui';

/**
 * Portada — bloque 13. Alta al boletín.
 *
 * El consentimiento es una casilla vacía: no viene premarcada y sin ella el
 * servidor rechaza el alta. La etiqueta de cada campo es visible; el
 * placeholder no es una etiqueta.
 */

export interface OpcionActividad {
  slug: string;
  nombre: string;
}

interface Respuesta {
  ok: boolean;
  mensaje?: string;
  error?: string;
  campos?: Record<string, string>;
}

export function Newsletter({ actividades }: { actividades: readonly OpcionActividad[] }) {
  const [enviando, setEnviando] = React.useState(false);
  const [exito, setExito] = React.useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = React.useState<string | null>(null);
  const [errores, setErrores] = React.useState<Record<string, string>>({});

  async function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datosFormulario = new FormData(formulario);

    setEnviando(true);
    setErrorGeneral(null);
    setErrores({});

    try {
      const respuesta = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'cf-turnstile-response': String(datosFormulario.get('cf-turnstile-response') ?? ''),
          correo: String(datosFormulario.get('correo') ?? ''),
          consentimiento: datosFormulario.get('consentimiento') === 'on',
          actividad: datosFormulario.get('actividad') || undefined,
          origen: 'portada',
        }),
      });

      const cuerpo = (await respuesta.json()) as Respuesta;

      if (cuerpo.ok) {
        setExito(cuerpo.mensaje ?? 'Suscripción registrada.');
        formulario.reset();
      } else {
        setErrores(cuerpo.campos ?? {});
        setErrorGeneral(cuerpo.error ?? 'No pudimos registrar tu suscripción.');
      }
    } catch {
      setErrorGeneral(
        'No hubo conexión con el servidor. Revisa tu red e inténtalo de nuevo.',
      );
    } finally {
      setEnviando(false);
      reiniciarTurnstile();
    }
  }

  return (
    <section
      aria-labelledby="boletin-titulo"
      className="relative isolate overflow-clip border-y border-[var(--color-borde)] bg-[var(--color-marino)] py-14 text-white md:py-20"
    >
      {/* Fotografía decorativa muy atenuada sobre el marino: da profundidad a
          la franja sin comprometer el contraste del texto blanco, que sigue
          apoyándose en el color sólido de fondo. */}
      <Image
        src={fotoDocumentos}
        alt=""
        aria-hidden="true"
        loading="lazy"
        sizes="100vw"
        className="absolute inset-0 -z-10 size-full object-cover opacity-[0.14] mix-blend-luminosity"
      />

      <div className="contenedor-app grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[color-mix(in_srgb,white_72%,transparent)]">
            <Mail className="size-4" aria-hidden="true" />
            Boletín de cambios normativos
          </p>
          <h2 id="boletin-titulo" className="mt-3 text-2xl font-semibold md:text-3xl">
            Te avisamos el día que cambie el número que te importa
          </h2>
          <p className="mt-4 max-w-xl text-[0.97rem] leading-relaxed text-[color-mix(in_srgb,white_82%,transparent)]">
            La UMA cambia cada 1 de febrero y con ella cambian todos los umbrales en pesos. A eso
            se suman las fechas escalonadas del Acuerdo 115/2026. Un correo cuando pasa algo, no
            cuando no pasa nada.
          </p>
          <ul className="mt-5 flex flex-col gap-2 text-sm text-[color-mix(in_srgb,white_82%,transparent)]">
            <li>· Nuevo valor de la UMA y umbrales recalculados.</li>
            <li>· Publicaciones en el DOF que tocan la LFPIORPI.</li>
            <li>· Fechas del calendario que se acercan o que se confirman.</li>
          </ul>
        </div>

        <div className="tarjeta bg-[var(--color-superficie)] p-6 md:p-7">
          {exito ? (
            <div className="flex flex-col items-start gap-3">
              <CheckCircle2
                className="size-8 text-[var(--color-verde)]"
                aria-hidden="true"
              />
              <p role="status" className="text-base font-semibold text-[var(--color-tinta)]">
                {exito}
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                Puedes darte de baja cuando quieras desde cualquiera de los correos, o
                escribiéndonos para ejercer tus derechos ARCO.
              </p>
              <Link
                href="/legal/aviso-de-privacidad"
                className="text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
              >
                Leer el aviso de privacidad
              </Link>
            </div>
          ) : (
            <form onSubmit={alEnviar} noValidate className="flex flex-col gap-5">
              <Campo
                id="boletin-correo"
                etiqueta="Correo electrónico"
                requerido
                ayuda="Sólo lo usamos para enviarte este boletín."
                {...(errores['correo'] ? { error: errores['correo'] } : {})}
              >
                <Entrada
                  name="correo"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  maxLength={254}
                  placeholder="nombre@empresa.mx"
                />
              </Campo>

              <Campo
                id="boletin-actividad"
                etiqueta="Tu actividad vulnerable (opcional)"
                ayuda="Si la eliges, priorizamos lo que afecta a esa fracción."
                {...(errores['actividad'] ? { error: errores['actividad'] } : {})}
              >
                <Selector name="actividad" defaultValue="">
                  <option value="">Prefiero recibir todo</option>
                  {actividades.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.nombre}
                    </option>
                  ))}
                </Selector>
              </Campo>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-start gap-3">
                  <input
                    id="boletin-consentimiento"
                    name="consentimiento"
                    type="checkbox"
                    required
                    aria-describedby={
                      errores['consentimiento'] ? 'boletin-consentimiento-error' : undefined
                    }
                    aria-invalid={errores['consentimiento'] ? true : undefined}
                    className="mt-1 size-5 shrink-0 cursor-pointer accent-[var(--color-petroleo)]"
                  />
                  <label
                    htmlFor="boletin-consentimiento"
                    className="cursor-pointer text-sm leading-relaxed text-[var(--color-tinta-suave)]"
                  >
                    Acepto recibir avisos por correo cuando cambie la normativa o el valor de la
                    UMA, y he leído el{' '}
                    <Link
                      href="/legal/aviso-de-privacidad"
                      className="text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                    >
                      aviso de privacidad
                    </Link>
                    .
                    <span className="ml-1 text-[var(--color-rojo)]" aria-label="obligatorio">
                      *
                    </span>
                  </label>
                </div>
                {errores['consentimiento'] && (
                  <p
                    id="boletin-consentimiento-error"
                    role="alert"
                    className="text-xs font-medium text-[var(--color-rojo)]"
                  >
                    {errores['consentimiento']}
                  </p>
                )}
              </div>

              {errorGeneral && (
                <Nota tono="riesgo">
                  <p>{errorGeneral}</p>
                </Nota>
              )}

              <Turnstile className="my-1" />
              <Boton type="submit" variante="accion" ancho="completo" disabled={enviando}>
                {enviando ? 'Registrando…' : 'Quiero recibir los avisos'}
              </Boton>

              <p className="text-xs leading-relaxed text-[var(--color-tinta-tenue)]">
                No compartimos tu correo con terceros ni lo usamos para publicidad de otros. Puedes
                cancelar la suscripción en cualquier momento.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
