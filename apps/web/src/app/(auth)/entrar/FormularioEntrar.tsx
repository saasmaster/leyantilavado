'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Boton, Campo, Entrada, Nota } from '@leyantilavado/ui';
import { entrar, type EstadoFormulario } from '@/lib/auth/acciones';

function BotonEnviar({ etiqueta }: { etiqueta: string }) {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" ancho="completo" disabled={pending}>
      {pending ? 'Verificando…' : etiqueta}
    </Boton>
  );
}

export function FormularioEntrar({ destino }: { destino: string }) {
  const [estado, accion] = useActionState<EstadoFormulario | null, FormData>(entrar, null);

  return (
    <form action={accion} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="destino" value={destino} />

      <Campo id="correo" etiqueta="Correo electrónico" requerido>
        <Entrada
          name="correo"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          spellCheck={false}
        />
      </Campo>

      <Campo id="contrasena" etiqueta="Contraseña" requerido>
        <Entrada name="contrasena" type="password" autoComplete="current-password" required />
      </Campo>

      {estado && !estado.ok && (
        <Nota tono="riesgo">
          {/* Un solo mensaje para "no existe" y para "contraseña incorrecta":
              distinguirlos convertiría este formulario en un buscador de
              cuentas registradas. */}
          <p>{estado.mensaje}</p>
        </Nota>
      )}

      <BotonEnviar etiqueta="Entrar" />
    </form>
  );
}
