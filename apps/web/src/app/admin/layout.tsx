import type { Metadata } from 'next';
import { BarraLateral, type GrupoVisible } from '@/components/app/BarraLateral';
import { BarraSuperior } from '@/components/app/BarraSuperior';
import { NAVEGACION_ADMIN } from '@/components/app/navegacion';
import { requerirStaff } from '@/lib/auth/sesion';
import { construirMetadata } from '@/lib/sitio';

/** El panel administrativo nunca se indexa. */
export const metadata: Metadata = construirMetadata({
  titulo: 'Panel administrativo',
  descripcion: 'Corpus legal, contenido editorial, directorio y plataforma de LeyAntilavado.org.',
  ruta: '/admin',
  noindex: true,
});

const GRUPOS: GrupoVisible[] = NAVEGACION_ADMIN.map((grupo) => ({
  titulo: grupo.titulo,
  enlaces: grupo.enlaces.map(({ href, etiqueta }) => ({ href, etiqueta })),
}));

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  // Redirige si no hay sesión y expulsa a /panel si la cuenta no es de personal.
  // La puerta real es RLS: `es_staff()` filtra las filas aunque alguien llegue aquí.
  const contexto = await requerirStaff();

  return (
    <div className="flex min-h-full flex-col">
      <BarraSuperior contexto={contexto} />
      <div className="contenedor-app flex flex-1 flex-col gap-6 py-6 lg:flex-row lg:gap-8">
        <aside className="lg:w-64 lg:shrink-0">
          <BarraLateral grupos={GRUPOS} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
