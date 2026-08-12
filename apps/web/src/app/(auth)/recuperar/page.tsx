import type { Metadata } from 'next';
import Link from 'next/link';
import { Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { FormularioRecuperar } from './FormularioRecuperar';
import { ConfiguracionPendiente } from '@/components/app/ConfiguracionPendiente';
import { supabaseConfigurado, variablesFaltantes } from '@/lib/supabase/configuracion';
import { construirMetadata } from '@/lib/sitio';

export const metadata: Metadata = construirMetadata({
  titulo: 'Recuperar contraseña',
  descripcion: 'Restablece la contraseña de tu cuenta.',
  ruta: '/recuperar',
  noindex: true,
});

export default function PaginaRecuperar() {
  if (!supabaseConfigurado) {
    return <ConfiguracionPendiente faltantes={variablesFaltantes()} />;
  }

  return (
    <Tarjeta>
      <TarjetaCuerpo className="flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-tinta)]">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
            Escribe tu correo y te enviaremos un enlace para elegir una contraseña nueva. El enlace
            caduca en una hora.
          </p>
        </div>

        <FormularioRecuperar />

        <p className="border-t border-[var(--color-borde)] pt-4 text-sm">
          <Link href="/entrar" className="text-[var(--color-petroleo-hondo)] underline underline-offset-4">
            Volver a entrar
          </Link>
        </p>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}
