'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { KeyRound, ShieldCheck, ShieldOff } from 'lucide-react';
import { Boton, Campo, Entrada, Nota } from '@leyantilavado/ui';
import {
  confirmarAltaMFA,
  iniciarAltaMFA,
  retirarMFA,
  type EstadoAltaMFA,
  type EstadoFormulario,
} from '@/lib/auth/acciones';

export interface FactorMFA {
  id: string;
  nombre: string;
}

function BotonEnviar({ etiqueta, pendiente }: { etiqueta: string; pendiente: string }) {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" variante="accion" disabled={pending}>
      {pending ? pendiente : etiqueta}
    </Boton>
  );
}

/** Texto largo que hay que poder copiar sin que rompa el ancho de la tarjeta. */
function Copiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
        {etiqueta}
      </p>
      <code className="block break-all rounded-[var(--radius-control)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-3 text-sm text-[var(--color-tinta)] select-all">
        {valor}
      </code>
    </div>
  );
}

/**
 * Alta y baja del segundo factor (TOTP).
 *
 * El secreto y el URI `otpauth://` se muestran como texto seleccionable en
 * lugar de como código QR: no hay ninguna librería de QR instalada en el
 * proyecto y añadir una dependencia para pintar un cuadrito, cuando cualquier
 * aplicación de autenticación acepta la clave escrita, no vale la pena.
 */
export function AltaMFA({ factores }: { factores: readonly FactorMFA[] }) {
  const [alta, setAlta] = useState<EstadoAltaMFA | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [confirmacion, accionConfirmar] = useActionState<EstadoFormulario | null, FormData>(
    confirmarAltaMFA,
    null,
  );

  async function comenzar() {
    setIniciando(true);
    setAlta(await iniciarAltaMFA());
    setIniciando(false);
  }

  if (factores.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        <Nota tono="exito" titulo="Tienes un segundo factor activo">
          <p>
            <ShieldCheck aria-hidden="true" className="mr-1.5 inline size-4 align-[-3px]" />
            Al entrar se te pedirá el código de seis dígitos de tu aplicación de autenticación,
            además de tu contraseña.
          </p>
        </Nota>

        <ul className="flex flex-col gap-3">
          {factores.map((factor) => (
            <li key={factor.id} className="tarjeta flex flex-wrap items-center gap-3 p-4">
              <span className="flex-1 text-sm text-[var(--color-tinta)]">
                <KeyRound aria-hidden="true" className="mr-2 inline size-4 align-[-3px]" />
                {factor.nombre}
              </span>
              <form action={retirarMFA}>
                <input type="hidden" name="factorId" value={factor.id} />
                <Boton type="submit" variante="peligro" tamano="sm">
                  <ShieldOff aria-hidden="true" />
                  Retirar este factor
                </Boton>
              </form>
            </li>
          ))}
        </ul>

        <Nota tono="atencion" titulo="Retirarlo baja el nivel de tu cuenta">
          <p>
            Si lo retiras, tu cuenta vuelve a protegerse sólo con la contraseña y el retiro se hace
            de inmediato, sin confirmación adicional. Vuelve a darlo de alta en cuanto puedas.
          </p>
        </Nota>
      </div>
    );
  }

  if (!alta?.ok || !alta.uri || !alta.secreto || !alta.factorId) {
    return (
      <div className="flex flex-col gap-3">
        {alta && !alta.ok && (
          <Nota tono="riesgo" titulo="No se pudo iniciar el alta">
            <p>{alta.mensaje}</p>
          </Nota>
        )}
        <div>
          <Boton type="button" variante="accion" onClick={comenzar} disabled={iniciando}>
            <KeyRound aria-hidden="true" />
            {iniciando ? 'Generando la clave…' : 'Activar el segundo factor'}
          </Boton>
        </div>
        <p className="text-sm text-[var(--color-tinta-suave)]">
          Necesitas una aplicación de autenticación en tu teléfono. Al pulsar el botón se genera una
          clave que tendrás que copiar en ella.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Nota tono="info" titulo="Copia la clave en tu aplicación de autenticación">
        <p>
          Registra la clave en tu aplicación —a mano o pegando la dirección <code>otpauth://</code>—
          y después escribe abajo el código de seis dígitos que te muestre. Hasta que no confirmes
          ese código, el segundo factor no queda activo.
        </p>
      </Nota>

      <div className="tarjeta flex flex-col gap-4 p-5">
        <Copiable etiqueta="Clave (secreto TOTP)" valor={alta.secreto} />
        <Copiable etiqueta="Dirección otpauth://" valor={alta.uri} />

        <form action={accionConfirmar} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="factorId" value={alta.factorId} />
          <Campo
            id="codigo"
            etiqueta="Código de seis dígitos"
            requerido
            ayuda="El que muestra tu aplicación en este momento. Cambia cada pocos segundos."
            error={confirmacion && !confirmacion.ok ? confirmacion.mensaje : undefined}
          >
            <Entrada
              name="codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              spellCheck={false}
            />
          </Campo>

          {confirmacion?.ok && (
            <Nota tono="exito">
              <p>{confirmacion.mensaje}</p>
            </Nota>
          )}

          <div>
            <BotonEnviar etiqueta="Confirmar y activar" pendiente="Verificando…" />
          </div>
        </form>
      </div>

      <Nota tono="atencion" titulo="Guarda la clave en un lugar seguro">
        <p>
          Si pierdes el teléfono y no tienes la clave guardada, no vas a poder entrar por tu cuenta.
          Esta plataforma no genera códigos de recuperación todavía; está pendiente.
        </p>
      </Nota>
    </div>
  );
}
