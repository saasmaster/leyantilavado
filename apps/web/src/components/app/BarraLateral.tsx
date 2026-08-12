'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@leyantilavado/ui';

export interface EnlaceVisible {
  href: string;
  etiqueta: string;
}

export interface GrupoVisible {
  titulo: string;
  enlaces: EnlaceVisible[];
}

/**
 * Navegación del área privada. Los grupos ya vienen filtrados por permiso desde
 * el servidor: aquí no se decide nada de seguridad, sólo qué está resaltado.
 */
export function BarraLateral({ grupos }: { grupos: GrupoVisible[] }) {
  const ruta = usePathname();

  return (
    <nav aria-label="Secciones del área privada" className="flex flex-col gap-5">
      {grupos.map((grupo) => (
        <div key={grupo.titulo}>
          <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
            {grupo.titulo}
          </p>
          <ul className="flex flex-col gap-0.5">
            {grupo.enlaces.map((enlace) => {
              const activo = ruta === enlace.href;
              return (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    aria-current={activo ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center rounded-[var(--radius-control)] px-3 text-sm transition-colors',
                      activo
                        ? 'bg-[var(--color-marino-tenue)] font-medium text-[var(--color-marino)]'
                        : 'text-[var(--color-tinta-suave)] hover:bg-[var(--color-marfil-hondo)] hover:text-[var(--color-tinta)]',
                    )}
                  >
                    {enlace.etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
