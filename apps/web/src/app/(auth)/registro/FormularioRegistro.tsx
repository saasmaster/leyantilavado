'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Boton, Campo, Entrada, Nota } from '@leyantilavado/ui';
import { registrar, type EstadoFormulario } from '@/lib/auth/acciones';
import { AYUDA_CONTRASENA, CONTRASENA_MINIMA } from '@/lib/auth/mensajes';

function BotonEnviar() {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" ancho="completo" disabled={pending}>
      {pending ? 'Creando la cuenta…' : 'Crear cuenta'}
    </Boton>
  );
}

export function FormularioRegistro() {
  const [estado, accion] = useActionState<EstadoFormulario | null, FormData>(registrar, null);

  // Cuando el registro se completa la respuesta es la MISMA exista o no la
  // cuenta, así que el formulario se sustituye por el acuse en ambos casos.
  if (estado?.ok && estado.informativo) {
    return (
      <Nota tono="exito" titulo="Revisa tu correo">
        <p>{estado.mensaje}</p>
        <p className="mt-3">
          <Link href="/entrar" className="text-[var(--color-petroleo-hondo)] underline underline-offset-4">
            Volver a entrar
          </Link>
        </p>
      </Nota>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-4" noValidate>
      <Campo id="nombre" etiqueta="Nombre completo" requerido error={estado?.campo === 'nombre' ? estado.mensaje : undefined}>
        <Entrada name="nombre" type="text" autoComplete="name" required />
      </Campo>

      <Campo id="correo" etiqueta="Correo electrónico" requerido error={estado?.campo === 'correo' ? estado.mensaje : undefined}>
        <Entrada name="correo" type="email" autoComplete="email" inputMode="email" required spellCheck={false} />
      </Campo>

      <Campo
        id="contrasena"
        etiqueta="Contraseña"
        ayuda={AYUDA_CONTRASENA}
        requerido
        error={estado?.campo === 'contrasena' ? estado.mensaje : undefined}
      >
        <Entrada
          name="contrasena"
          type="password"
          autoComplete="new-password"
          minLength={CONTRASENA_MINIMA}
          required
        />
      </Campo>

      {estado && !estado.ok && !estado.campo && (
        <Nota tono="riesgo">
          <p>{estado.mensaje}</p>
        </Nota>
      )}

      <BotonEnviar />

      <p className="text-xs text-[var(--color-tinta-tenue)]">
        Al crear la cuenta aceptas los{' '}
        <Link href="/legal/terminos" className="underline underline-offset-2">términos de uso</Link> y el{' '}
        <Link href="/legal/aviso-de-privacidad" className="underline underline-offset-2">aviso de privacidad</Link>.
      </p>
    </form>
  );
}
