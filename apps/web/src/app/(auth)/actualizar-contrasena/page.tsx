import type { Metadata } from 'next';
import Link from 'next/link';
import { Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { FormularioNuevaContrasena } from './FormularioNuevaContrasena';
import { ConfiguracionPendiente } from '@/components/app/ConfiguracionPendiente';
import { supabaseConfigurado, variablesFaltantes } from '@/lib/supabase/configuracion';
import { leerSesion } from '@/lib/auth/sesion';
import { construirMetadata } from '@/lib/sitio';

export const metadata: Metadata = construirMetadata({
  titulo: 'Elegir contraseña nueva',
  descripcion: 'Define una contraseña nueva para tu cuenta.',
  ruta: '/actualizar-contrasena',
  noindex: true,
});

export default async function PaginaActualizarContrasena() {
  if (!supabaseConfigurado) {
    return <ConfiguracionPendiente faltantes={variablesFaltantes()} />;
  }

  const sesion = await leerSesion();

  return (
    <Tarjeta>
      <TarjetaCuerpo className="flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-tinta)]">
            Elegir contraseña nueva
          </h1>
          <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
            Al guardarla se cierran las demás sesiones abiertas con la contraseña anterior.
          </p>
        </div>

        {sesion.estado === 'activa' ? (
          <FormularioNuevaContrasena />
        ) : (
          <Nota tono="atencion" titulo="Este enlace ya no es válido">
            <p>
              El enlace de recuperación caducó o ya se usó. Pide uno nuevo desde{' '}
              <Link href="/recuperar" className="underline underline-offset-2">
                recuperar contraseña
              </Link>
              .
            </p>
          </Nota>
        )}
      </TarjetaCuerpo>
    </Tarjeta>
  );
}
