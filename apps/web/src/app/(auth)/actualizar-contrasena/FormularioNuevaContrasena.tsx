'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Boton, Campo, Entrada, Nota } from '@leyantilavado/ui';
import { actualizarContrasena, type EstadoFormulario } from '@/lib/auth/acciones';
import { AYUDA_CONTRASENA, CONTRASENA_MINIMA } from '@/lib/auth/mensajes';

function BotonEnviar() {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" ancho="completo" disabled={pending}>
      {pending ? 'Guardando…' : 'Guardar contraseña'}
    </Boton>
  );
}

export function FormularioNuevaContrasena() {
  const [estado, accion] = useActionState<EstadoFormulario | null, FormData>(
    actualizarContrasena,
    null,
  );

  return (
    <form action={accion} className="flex flex-col gap-4" noValidate>
      <Campo
        id="contrasena"
        etiqueta="Contraseña nueva"
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

      <Campo id="confirmacion" etiqueta="Repite la contraseña" requerido>
        <Entrada
          name="confirmacion"
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
    </form>
  );
}
