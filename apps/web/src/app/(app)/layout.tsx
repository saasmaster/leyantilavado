import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BarraLateral, type GrupoVisible } from '@/components/app/BarraLateral';
import { BarraSuperior } from '@/components/app/BarraSuperior';
import { ConfiguracionPendiente } from '@/components/app/ConfiguracionPendiente';
import { NAVEGACION_PANEL } from '@/components/app/navegacion';
import { leerSesion, requerirContexto } from '@/lib/auth/sesion';
import { construirMetadata } from '@/lib/sitio';

/** Todo el área privada va con noindex. Lo que un usuario captura no se indexa. */
export const metadata: Metadata = construirMetadata({
  titulo: 'Área privada',
  descripcion: 'Panel de cumplimiento de LeyAntilavado.org.',
  ruta: '/panel',
  noindex: true,
});

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const sesion = await leerSesion();

  if (sesion.estado === 'sin_configurar') {
    return <ConfiguracionPendiente faltantes={sesion.faltantes} />;
  }
  if (sesion.estado === 'anonimo') {
    redirect('/entrar?destino=%2Fpanel');
  }

  const contexto = await requerirContexto();

  const grupos: GrupoVisible[] = NAVEGACION_PANEL.map((grupo) => ({
    titulo: grupo.titulo,
    enlaces: grupo.enlaces
      .filter((e) => !e.permiso || contexto.puede(e.permiso))
      .map(({ href, etiqueta }) => ({ href, etiqueta })),
  })).filter((g) => g.enlaces.length > 0);

  return (
    <div className="flex min-h-full flex-col">
      <BarraSuperior contexto={contexto} />
      <div className="contenedor-app flex flex-1 flex-col gap-6 py-6 lg:flex-row lg:gap-8">
        <aside className="lg:w-60 lg:shrink-0">
          <BarraLateral grupos={grupos} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
