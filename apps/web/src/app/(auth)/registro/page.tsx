import type { Metadata } from 'next';
import Link from 'next/link';
import { Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { FormularioRegistro } from './FormularioRegistro';
import { ConfiguracionPendiente } from '@/components/app/ConfiguracionPendiente';
import { supabaseConfigurado, variablesFaltantes } from '@/lib/supabase/configuracion';
import { construirMetadata } from '@/lib/sitio';

export const metadata: Metadata = construirMetadata({
  titulo: 'Crear cuenta',
  descripcion: 'Crea tu cuenta del área privada de cumplimiento.',
  ruta: '/registro',
  noindex: true,
});

export default function PaginaRegistro() {
  if (!supabaseConfigurado) {
    return <ConfiguracionPendiente faltantes={variablesFaltantes()} />;
  }

  return (
    <Tarjeta>
      <TarjetaCuerpo className="flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-tinta)]">Crear una cuenta</h1>
          <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
            Con tu cuenta puedes guardar resultados de las calculadoras y, si lo necesitas, llevar
            el expediente de cumplimiento de tu organización.
          </p>
        </div>

        <FormularioRegistro />

        <Nota tono="info" titulo="Qué NO te vamos a pedir">
          <p>
            Nunca te pediremos tu e.firma, tu llave privada ni tu contraseña del portal del SAT.
            Esta plataforma no presenta avisos por ti: prepara la información para que tú la cargues
            donde corresponde.
          </p>
        </Nota>

        <p className="border-t border-[var(--color-borde)] pt-4 text-sm text-[var(--color-tinta-suave)]">
          ¿Ya tienes cuenta?{' '}
          <Link href="/entrar" className="text-[var(--color-petroleo-hondo)] underline underline-offset-4">
            Entrar
          </Link>
        </p>
      </TarjetaCuerpo>
    </Tarjeta>
  );
}
