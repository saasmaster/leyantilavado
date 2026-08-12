import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { FormularioEntrar } from './FormularioEntrar';
import { ConfiguracionPendiente } from '@/components/app/ConfiguracionPendiente';
import { supabaseConfigurado, variablesFaltantes } from '@/lib/supabase/configuracion';
import { destinoSeguro } from '@/lib/supabase/middleware';
import { leerSesion } from '@/lib/auth/sesion';
import { construirMetadata } from '@/lib/sitio';

export const metadata: Metadata = construirMetadata({
  titulo: 'Entrar',
  descripcion: 'Accede al área privada de cumplimiento.',
  ruta: '/entrar',
  noindex: true,
});

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string; aviso?: string }>;
}) {
  const { destino, aviso } = await searchParams;

  if (!supabaseConfigurado) {
    return <ConfiguracionPendiente faltantes={variablesFaltantes()} />;
  }

  const sesion = await leerSesion();
  if (sesion.estado === 'activa') redirect(destinoSeguro(destino, '/panel'));

  return (
    <Tarjeta>
      <TarjetaCuerpo className="flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-tinta)]">Entrar</h1>
          <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
            El área privada guarda expedientes de tus clientes y sus operaciones. Sólo tú y las
            personas que invites a tu organización pueden verlos.
          </p>
        </div>

        {aviso === 'sesion_expirada' && (
          <Nota tono="atencion">
            <p>Tu sesión expiró. Vuelve a entrar para continuar.</p>
          </Nota>
        )}

        <FormularioEntrar destino={destinoSeguro(destino, '/panel')} />

        <div className="flex flex-col gap-1.5 border-t border-[var(--color-borde)] pt-4 text-sm">
          <Link href="/recuperar" className="text-[var(--color-petroleo-hondo)] underline underline-offset-4">
            Olvidé mi contraseña
          </Link>
          <p className="text-[var(--color-tinta-suave)]">
            ¿Todavía no tienes cuenta?{' '}
            <Link href="/registro" className="text-[var(--color-petroleo-hondo)] underline underline-offset-4">
              Crear una cuenta
            </Link>
          </p>
        </div>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}
