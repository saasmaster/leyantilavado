'use client';

import * as React from 'react';
import { AreaTexto, Boton, Campo, Entrada, Nota, Selector } from '@leyantilavado/ui';

/**
 * Formulario de contacto general.
 *
 * Todo lo que se captura viaja a `/api/contacto` y se guarda con folio; nada
 * se publica ni se indexa. El consentimiento va sin marcar y es obligatorio:
 * usar los datos de alguien para responderle sigue siendo usar sus datos.
 */

const MOTIVOS = [
  { valor: 'correccion', etiqueta: 'Corregir un dato o una cifra del sitio' },
  { valor: 'directorio', etiqueta: 'Algo sobre el directorio profesional' },
  { valor: 'datos-personales', etiqueta: 'Ejercer mis derechos ARCO' },
  { valor: 'prensa', etiqueta: 'Prensa o colaboración' },
  { valor: 'otro', etiqueta: 'Otro asunto' },
] as const;

interface Respuesta {
  ok: boolean;
  folio?: string;
  mensaje?: string;
  error?: string;
  campos?: Record<string, string>;
}

export function FormularioContacto({ motivoInicial }: { motivoInicial?: string }) {
  const [enviando, setEnviando] = React.useState(false);
  const [exito, setExito] = React.useState<{ mensaje: string; folio?: string } | null>(null);
  const [errores, setErrores] = React.useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = React.useState<string | null>(null);

  const motivoPorDefecto = MOTIVOS.some((m) => m.valor === motivoInicial)
    ? motivoInicial
    : 'correccion';

  async function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);

    setEnviando(true);
    setErrorGeneral(null);
    setErrores({});

    try {
      const respuesta = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivo: String(datos.get('motivo') ?? ''),
          nombre: String(datos.get('nombre') ?? ''),
          correo: String(datos.get('correo') ?? ''),
          mensaje: String(datos.get('mensaje') ?? ''),
          consentimiento: datos.get('consentimiento') === 'on',
          sitio: String(datos.get('sitio') ?? ''),
        }),
      });

      const cuerpo = (await respuesta.json()) as Respuesta;

      if (cuerpo.ok) {
        setExito({
          mensaje: cuerpo.mensaje ?? 'Recibimos tu mensaje.',
          ...(cuerpo.folio && cuerpo.folio !== '—' ? { folio: cuerpo.folio } : {}),
        });
        formulario.reset();
      } else {
        setErrores(cuerpo.campos ?? {});
        setErrorGeneral(cuerpo.error ?? 'No pudimos enviar tu mensaje.');
      }
    } catch {
      setErrorGeneral('No hubo conexión con el servidor. Revisa tu red e inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  if (exito) {
    return (
      <Nota tono="exito" titulo="Mensaje enviado">
        <p>{exito.mensaje}</p>
        {exito.folio && (
          <p className="cifra mt-2 text-base font-semibold">Folio: {exito.folio}</p>
        )}
        <Boton
          variante="contorno"
          tamano="sm"
          className="mt-4"
          onClick={() => setExito(null)}
        >
          Enviar otro mensaje
        </Boton>
      </Nota>
    );
  }

  return (
    <form onSubmit={alEnviar} noValidate className="flex flex-col gap-5">
      {errorGeneral && (
        <Nota tono="riesgo" titulo="No pudimos enviarlo">
          <p>{errorGeneral}</p>
        </Nota>
      )}

      <Campo id="motivo" etiqueta="Motivo" requerido {...(errores['motivo'] ? { error: errores['motivo'] } : {})}>
        <Selector name="motivo" defaultValue={motivoPorDefecto} required>
          {MOTIVOS.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.etiqueta}
            </option>
          ))}
        </Selector>
      </Campo>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="nombre" etiqueta="Nombre" requerido {...(errores['nombre'] ? { error: errores['nombre'] } : {})}>
          <Entrada name="nombre" autoComplete="name" required maxLength={120} />
        </Campo>

        <Campo
          id="correo"
          etiqueta="Correo electrónico"
          ayuda="Sólo lo usamos para responderte."
          requerido
          {...(errores['correo'] ? { error: errores['correo'] } : {})}
        >
          <Entrada name="correo" type="email" autoComplete="email" required maxLength={254} />
        </Campo>
      </div>

      <Campo
        id="mensaje"
        etiqueta="Mensaje"
        ayuda="Si reportas un dato equivocado, incluye la fuente oficial que lo contradice: así lo corregimos el mismo día."
        requerido
        {...(errores['mensaje'] ? { error: errores['mensaje'] } : {})}
      >
        <AreaTexto name="mensaje" required minLength={20} maxLength={4000} rows={6} />
      </Campo>

      {/* Trampa para bots. Invisible y fuera del orden de tabulación; una
          persona con lector de pantalla tampoco lo encuentra por el
          aria-hidden. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="sitio">No llenar</label>
        <input id="sitio" name="sitio" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--color-tinta-suave)]">
          <input
            type="checkbox"
            name="consentimiento"
            required
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--color-petroleo)]"
          />
          <span>
            Acepto que usen mi nombre y mi correo para responder este mensaje, conforme al aviso de
            privacidad. <span className="text-[var(--color-rojo)]">*</span>
          </span>
        </label>
        {errores['consentimiento'] && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-[var(--color-rojo)]">
            {errores['consentimiento']}
          </p>
        )}
      </div>

      <Boton type="submit" variante="accion" tamano="lg" disabled={enviando} className="self-start">
        {enviando ? 'Enviando…' : 'Enviar mensaje'}
      </Boton>
    </form>
  );
}
