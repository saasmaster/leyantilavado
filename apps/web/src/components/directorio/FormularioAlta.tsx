'use client';

import * as React from 'react';
import { Send } from 'lucide-react';
import { Turnstile, reiniciarTurnstile } from '@/components/Turnstile';
import { AreaTexto, Boton, Campo, Entrada, Nota, Selector } from '@leyantilavado/ui';

/* ────────────────────────────────────────────────────────────────────────────
 * Alta de proveedor.
 *
 * Nada de lo que se envía aquí se publica solo: entra como pendiente de
 * moderación y una persona lo revisa. El formulario lo dice antes de que
 * alguien empiece a escribir, no después de enviar.
 * ────────────────────────────────────────────────────────────────────────── */

export interface OpcionSimple {
  valor: string;
  etiqueta: string;
}

interface Props {
  categorias: readonly OpcionSimple[];
  actividades: readonly OpcionSimple[];
  servicios: readonly OpcionSimple[];
  idiomas: readonly string[];
  estados: readonly string[];
  tamanos: readonly OpcionSimple[];
}

function GrupoCasillas({
  nombre,
  leyenda,
  ayuda,
  opciones,
  error,
  columnas = 2,
}: {
  nombre: string;
  leyenda: string;
  ayuda?: string;
  opciones: readonly OpcionSimple[];
  error?: string;
  columnas?: 1 | 2 | 3;
}) {
  const clases = columnas === 3 ? 'sm:grid-cols-3' : columnas === 2 ? 'sm:grid-cols-2' : '';
  return (
    <fieldset>
      <legend className="text-sm font-medium text-[var(--color-tinta)]">{leyenda}</legend>
      {ayuda && <p className="mt-1 text-xs text-[var(--color-tinta-tenue)]">{ayuda}</p>}
      <div className={`mt-2 grid gap-x-4 gap-y-1 ${clases}`}>
        {opciones.map((o) => (
          <label
            key={o.valor}
            className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--color-tinta-suave)]"
          >
            <input
              type="checkbox"
              name={nombre}
              value={o.valor}
              className="size-4 shrink-0 cursor-pointer accent-[var(--color-petroleo)]"
            />
            {o.etiqueta}
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-[var(--color-rojo)]">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function FormularioAlta({
  categorias,
  actividades,
  servicios,
  idiomas,
  estados,
  tamanos,
}: Props) {
  const [enviando, setEnviando] = React.useState(false);
  const [errores, setErrores] = React.useState<Record<string, string>>({});
  const [folio, setFolio] = React.useState<string | null>(null);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const d = new FormData(evento.currentTarget);
    const experiencia = d.get('aniosExperiencia');

    setEnviando(true);
    setErrores({});
    try {
      const respuesta = await fetch('/api/directorio/alta', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          'cf-turnstile-response': String(d.get('cf-turnstile-response') ?? ''),
          nombre: d.get('nombre'),
          correoContacto: d.get('correoContacto'),
          telefono: d.get('telefono') || undefined,
          sitioWeb: d.get('sitioWeb') || undefined,
          categorias: d.getAll('categorias'),
          actividadesAtendidas: d.getAll('actividadesAtendidas'),
          servicios: d.getAll('servicios'),
          estado: d.get('estado'),
          ciudad: d.get('ciudad') || undefined,
          coberturaNacional: d.get('coberturaNacional') === 'si',
          atencionRemota: d.get('atencionRemota') === 'si',
          atencionPresencial: d.get('atencionPresencial') === 'si',
          idiomas: d.getAll('idiomas'),
          tamanosCliente: d.getAll('tamanosCliente'),
          aniosExperiencia: experiencia ? Number(experiencia) : undefined,
          biografia: d.get('biografia'),
          credenciales: d.get('credenciales'),
          documentosDescritos: d.get('documentosDescritos') || undefined,
          consentimiento: d.get('consentimiento') === 'si',
        }),
      });
      const json = (await respuesta.json()) as {
        ok?: boolean;
        folio?: string;
        errores?: Record<string, string>;
        error?: string;
      };
      if (json.ok && json.folio) setFolio(json.folio);
      else setErrores(json.errores ?? { formulario: json.error ?? 'No se pudo enviar el alta.' });
    } catch {
      setErrores({ formulario: 'No hay conexión con el servidor. Vuelve a intentarlo.' });
    } finally {
      setEnviando(false);
      reiniciarTurnstile();
    }
  }

  if (folio) {
    return (
      <Nota tono="exito" titulo="Alta registrada, pendiente de revisión">
        <p>
          Tu folio es <strong>{folio}</strong>. Tu perfil todavía no está publicado: entró a la
          fila de moderación.
        </p>
        <p>
          Te escribiremos al correo que registraste para pedirte los documentos y confirmar los
          datos. Nada se publica antes de esa revisión.
        </p>
      </Nota>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[var(--color-tinta)]">1. Quién eres</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            id="alta-nombre"
            etiqueta="Nombre del despacho, empresa o profesional"
            requerido
            {...(errores['nombre'] ? { error: errores['nombre'] } : {})}
          >
            <Entrada name="nombre" required maxLength={160} />
          </Campo>
          <Campo
            id="alta-correo"
            etiqueta="Correo de contacto"
            requerido
            ayuda="A este correo llegan las solicitudes y la verificación."
            {...(errores['correoContacto'] ? { error: errores['correoContacto'] } : {})}
          >
            <Entrada name="correoContacto" type="email" required maxLength={160} />
          </Campo>
          <Campo id="alta-telefono" etiqueta="Teléfono" ayuda="Opcional." {...(errores['telefono'] ? { error: errores['telefono'] } : {})}>
            <Entrada name="telefono" type="tel" maxLength={20} />
          </Campo>
          <Campo
            id="alta-sitio"
            etiqueta="Sitio web"
            ayuda="Opcional. Incluye https://"
            {...(errores['sitioWeb'] ? { error: errores['sitioWeb'] } : {})}
          >
            <Entrada name="sitioWeb" type="url" maxLength={200} />
          </Campo>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[var(--color-tinta)]">2. Qué haces</h2>
        <GrupoCasillas
          nombre="categorias"
          leyenda="Categorías (máximo 4)"
          ayuda="Elige sólo aquellas en las que realmente trabajas. Un perfil que dice hacer todo no genera confianza."
          opciones={categorias}
          {...(errores['categorias'] ? { error: errores['categorias'] } : {})}
        />
        <GrupoCasillas
          nombre="servicios"
          leyenda="Servicios que prestas"
          opciones={servicios}
          {...(errores['servicios'] ? { error: errores['servicios'] } : {})}
        />
        <GrupoCasillas
          nombre="actividadesAtendidas"
          leyenda="Actividades vulnerables que atiendes"
          ayuda="Marca aquellas en las que tienes experiencia concreta."
          opciones={actividades}
          columnas={3}
          {...(errores['actividadesAtendidas'] ? { error: errores['actividadesAtendidas'] } : {})}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[var(--color-tinta)]">3. Dónde y cómo atiendes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="alta-estado" etiqueta="Estado principal" requerido {...(errores['estado'] ? { error: errores['estado'] } : {})}>
            <Selector name="estado" required defaultValue="">
              <option value="" disabled>
                Elige un estado
              </option>
              {estados.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo id="alta-ciudad" etiqueta="Ciudad">
            <Entrada name="ciudad" maxLength={120} />
          </Campo>
          <Campo
            id="alta-experiencia"
            etiqueta="Años de experiencia en cumplimiento"
            ayuda="Se publica como dato declarado por ti, no verificado."
            {...(errores['aniosExperiencia'] ? { error: errores['aniosExperiencia'] } : {})}
          >
            <Entrada name="aniosExperiencia" type="number" min={0} max={70} />
          </Campo>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-[var(--color-tinta)]">Cobertura</legend>
          <div className="mt-2 grid gap-x-4 sm:grid-cols-3">
            {[
              ['coberturaNacional', 'Atiendo en todo el país'],
              ['atencionRemota', 'Atiendo en línea'],
              ['atencionPresencial', 'Atiendo presencialmente'],
            ].map(([nombre, etiqueta]) => (
              <label
                key={nombre}
                className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--color-tinta-suave)]"
              >
                <input
                  type="checkbox"
                  name={nombre}
                  value="si"
                  className="size-4 shrink-0 cursor-pointer accent-[var(--color-petroleo)]"
                />
                {etiqueta}
              </label>
            ))}
          </div>
        </fieldset>

        <GrupoCasillas
          nombre="idiomas"
          leyenda="Idiomas en los que atiendes"
          opciones={idiomas.map((i) => ({ valor: i, etiqueta: i }))}
          columnas={3}
          {...(errores['idiomas'] ? { error: errores['idiomas'] } : {})}
        />
        <GrupoCasillas
          nombre="tamanosCliente"
          leyenda="Tamaño de cliente que atiendes"
          opciones={tamanos}
          columnas={2}
          {...(errores['tamanosCliente'] ? { error: errores['tamanosCliente'] } : {})}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[var(--color-tinta)]">
          4. Descripción y credenciales
        </h2>
        <Campo
          id="alta-bio"
          etiqueta="Descripción del despacho o del servicio"
          requerido
          ayuda="Entre 80 y 1200 caracteres. Escribe qué haces y para quién, sin promesas de resultado."
          {...(errores['biografia'] ? { error: errores['biografia'] } : {})}
        >
          <AreaTexto name="biografia" required minLength={80} maxLength={1200} />
        </Campo>
        <Campo
          id="alta-credenciales"
          etiqueta="Credenciales que quieres que revisemos"
          requerido
          ayuda="Cédula profesional, certificaciones, colegios. Escribe tipo, emisor, folio y vigencia de cada una."
          {...(errores['credenciales'] ? { error: errores['credenciales'] } : {})}
        >
          <AreaTexto name="credenciales" required minLength={20} maxLength={1200} />
        </Campo>
        <Campo
          id="alta-documentos"
          etiqueta="Documentos que puedes presentar"
          ayuda="No los subas aquí: describe cuáles tienes y te los pedimos por correo, cifrados y sólo para la revisión."
        >
          <AreaTexto name="documentosDescritos" maxLength={1000} />
        </Campo>
      </section>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-borde-fuerte)] p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--color-tinta)]">
          <input
            type="checkbox"
            name="consentimiento"
            value="si"
            required
            className="mt-1 size-4 shrink-0 cursor-pointer accent-[var(--color-petroleo)]"
          />
          <span>
            Autorizo que se publiquen los datos de este perfil en el directorio y que se revisen
            los documentos que envíe para verificarlo. Entiendo que la revisión no es una
            certificación de LeyAntilavado.org y que puedo pedir la baja del perfil cuando quiera.
          </span>
        </label>
        {errores['consentimiento'] && (
          <p role="alert" className="mt-2 text-xs font-medium text-[var(--color-rojo)]">
            {errores['consentimiento']}
          </p>
        )}
      </div>

      {errores['formulario'] && (
        <Nota tono="riesgo" titulo="No se pudo enviar">
          {errores['formulario']}
        </Nota>
      )}

      <div>
        <Turnstile className="my-1" />
        <Boton type="submit" variante="accion" tamano="lg" disabled={enviando}>
          <Send aria-hidden="true" />
          {enviando ? 'Enviando…' : 'Enviar mi alta a revisión'}
        </Boton>
      </div>
    </form>
  );
}
