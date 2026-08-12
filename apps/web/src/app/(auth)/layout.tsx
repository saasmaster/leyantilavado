import type { Metadata } from 'next';
import Link from 'next/link';
import { construirMetadata } from '@/lib/sitio';

export const metadata: Metadata = construirMetadata({
  titulo: 'Acceso',
  descripcion: 'Acceso al área privada de cumplimiento de LeyAntilavado.org.',
  ruta: '/entrar',
  noindex: true,
});

export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  return (
    <div className="contenedor-app flex flex-col items-center py-10 md:py-16">
      <div className="w-full max-w-md">
        {children}
        <p className="mt-6 text-center text-xs text-[var(--color-tinta-tenue)]">
          LeyAntilavado.org es una plataforma privada e independiente. No pertenece ni está afiliada
          al SAT, la UIF ni a ninguna autoridad. <Link href="/legal/aviso-de-privacidad" className="underline underline-offset-2">Aviso de privacidad</Link>.
        </p>
      </div>
    </div>
  );
}
