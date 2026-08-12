'use client';

import * as React from 'react';
import { Send } from 'lucide-react';
import { AreaTexto, Boton, Campo, Entrada, Nota, Selector } from '@leyantilavado/ui';

/* ────────────────────────────────────────────────────────────────────────────
 * Contacto con un proveedor.
 *
 * El consentimiento es una casilla vacía y obligatoria: sin marcarla, el
 * servidor rechaza la solicitud. Nunca se premarca, y el texto dice
 * exactamente qué se comparte y con quién.
 * ────────────────────────────────────────────────────────────────────────── */

type Tipo = 'contacto' | 'cotizacion' | 'llamada';

const TITULOS: Record<Tipo, string> = {
  contacto: 'Enviar un mensaje',
  cotizacion: 'Pedir una cotización',
  llamada: 'Solicitar una llamada',
};

const AYUDA_MENSAJE: Record<Tipo, string> = {
  contacto: 'Cuéntale qué necesitas. No incluyas datos de tus clientes ni documentos aquí.',
  cotizacion:
    'Describe el alcance: actividad, número de operaciones al mes y si ya estás dado de alta en el padrón.',
  llamada: 'Indica en qué horario te conviene y en qué zona horaria estás.',
};

interface Props {
  proveedorSlug: string;
  proveedorNombre: string;
  esDemo: boolean;
  actividades: readonly { slug: string; nombreCorto: string }[];
}

export function FormularioContacto({
  proveedorSlug,
  proveedorNombre,
  esDemo,
  actividades,
}: Props) {
  const [tipo, setTipo] = React.useState<Tipo>('contacto');
  const [enviando, setEnviando] = React.useState(false);
  const [errores, setErrores] = React.useState<Record<string, string>>({});
  const [folio, setFolio] = React.useState<string | null>(null);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setEnviando(true);
    setErrores({});

    try {
      const respuesta = await fetch('/api/directorio/contacto', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          proveedorSlug,
          tipo,
          nombre: datos.get('nombre'),
          correo: datos.get('correo'),
          telefono: datos.get('telefono') || undefined,
          empresa: datos.get('empresa') || undefined,
          actividad: datos.get('actividad') || undefined,
          mensaje: datos.get('mensaje'),
          consentimiento: datos.get('consentimiento') === 'si',
        }),
      });
      const cuerpo: unknown = await respuesta.json();
      const resultado = cuerpo as { ok?: boolean; folio?: string; errores?: Record<string, string>; error?: string };

      if (resultado.ok && resultado.folio) {
        setFolio(resultado.folio);
      } else {
        setErrores(resultado.errores ?? { formulario: resultado.error ?? 'No se pudo enviar.' });
      }
    } catch {
      setErrores({ formulario: 'No hay conexión con el servidor. Vuelve a intentarlo.' });
    } finally {
      setEnviando(false);
    }
  }

  if (folio) {
    return (
      <Nota tono="exito" titulo="Solicitud registrada">
        <p>
          Tu folio es <strong>{folio}</strong>. Guárdalo por si necesitas darle seguimiento o
          pedirnos que borremos tus datos.
        </p>
        <p>
          Compartimos tu nombre, tu correo y tu mensaje con {proveedorNombre}. No compartimos nada
          más, y no cedemos tus datos a terceros.
        </p>
      </Nota>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      {esDemo && (
        <Nota tono="atencion" titulo="Este perfil es de demostración">
          Puedes probar el formulario: la solicitud se registra para nuestras pruebas, pero no la
          recibe nadie porque este proveedor no existe. No escribas datos reales de tus clientes.
        </Nota>
      )}

      <Campo id="tipo" etiqueta="¿Qué quieres hacer?">
        <Selector
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.currentTarget.value as Tipo)}
        >
          <option value="contacto">{TITULOS.contacto}</option>
          <option value="cotizacion">{TITULOS.cotizacion}</option>
          <option value="llamada">{TITULOS.llamada}</option>
        </Selector>
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="nombre" etiqueta="Tu nombre" requerido {...(errores['nombre'] ? { error: errores['nombre'] } : {})}>
          <Entrada name="nombre" autoComplete="name" required maxLength={120} />
        </Campo>
        <Campo id="correo" etiqueta="Tu correo" requerido {...(errores['correo'] ? { error: errores['correo'] } : {})}>
          <Entrada name="correo" type="email" autoComplete="email" required maxLength={160} />
        </Campo>
        <Campo
          id="telefono"
          etiqueta="Teléfono"
          ayuda="Opcional. Sólo si prefieres que te llamen."
          {...(errores['telefono'] ? { error: errores['telefono'] } : {})}
        >
          <Entrada name="telefono" type="tel" autoComplete="tel" maxLength={20} />
        </Campo>
        <Campo id="empresa" etiqueta="Empresa" ayuda="Opcional.">
          <Entrada name="empresa" autoComplete="organization" maxLength={160} />
        </Campo>
      </div>

      <Campo
        id="actividad"
        etiqueta="Actividad vulnerable que te ocupa"
        ayuda="Opcional. Ayuda a que la respuesta sea concreta."
      >
        <Selector name="actividad" defaultValue="">
          <option value="">No la tengo clara todavía</option>
          {actividades.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.nombreCorto}
            </option>
          ))}
        </Selector>
      </Campo>

      <Campo
        id="mensaje"
        etiqueta="Mensaje"
        requerido
        ayuda={AYUDA_MENSAJE[tipo]}
        {...(errores['mensaje'] ? { error: errores['mensaje'] } : {})}
      >
        <AreaTexto name="mensaje" required minLength={20} maxLength={2000} />
      </Campo>

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
            Autorizo que LeyAntilavado.org comparta mi nombre, mi correo{' '}
            {`—y mi teléfono si lo escribí— `}y el texto de mi mensaje con {proveedorNombre} para
            que me responda. Entiendo que puedo pedir que borren mis datos escribiendo al correo
            del aviso de privacidad.
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
        <Boton type="submit" variante="accion" disabled={enviando}>
          <Send aria-hidden="true" />
          {enviando ? 'Enviando…' : TITULOS[tipo]}
        </Boton>
      </div>

      <p className="text-xs leading-relaxed text-[var(--color-tinta-tenue)]">
        LeyAntilavado.org no participa en la relación contractual entre tú y el proveedor, no cobra
        comisión por el contacto y no responde por el servicio que contrates.
      </p>
    </form>
  );
}
