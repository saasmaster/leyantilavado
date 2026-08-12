'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Boton, Campo, Entrada, Nota } from '@leyantilavado/ui';
import { recuperar, type EstadoFormulario } from '@/lib/auth/acciones';

function BotonEnviar() {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" ancho="completo" disabled={pending}>
      {pending ? 'Enviando…' : 'Enviar instrucciones'}
    </Boton>
  );
}

export function FormularioRecuperar() {
  const [estado, accion] = useActionState<EstadoFormulario | null, FormData>(recuperar, null);

  // La respuesta es SIEMPRE la misma, exista o no la cuenta. Si dijéramos
  // "ese correo no está registrado", cualquiera podría ir probando correos
  // hasta armar la lista de clientes de la plataforma.
  if (estado?.ok) {
    return (
      <Nota tono="exito" titulo="Listo">
        <p>{estado.mensaje}</p>
      </Nota>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-4" noValidate>
      <Campo id="correo" etiqueta="Correo electrónico" requerido>
        <Entrada name="correo" type="email" autoComplete="email" inputMode="email" required spellCheck={false} />
      </Campo>

      {estado && !estado.ok && (
        <Nota tono="riesgo">
          <p>{estado.mensaje}</p>
        </Nota>
      )}

      <BotonEnviar />
    </form>
  );
}
