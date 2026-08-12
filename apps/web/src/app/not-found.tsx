import Link from 'next/link';
import { Calculator, FileSearch, ShieldQuestion, Users } from 'lucide-react';
import { Boton } from '@leyantilavado/ui';
import { construirMetadata } from '@/lib/sitio';

/**
 * 404.
 *
 * Sin este archivo, Next sirve su página por defecto: fondo blanco, tipografía
 * del sistema, sin encabezado ni navegación. Quien llega desde un enlace roto
 * —o desde un resultado de búsqueda que apuntaba a una URL que ya cambió—
 * aterriza en algo que no parece este sitio y se va.
 *
 * El contenido no es un "lo sentimos": son las cuatro entradas que cubren la
 * mayoría de las llegadas por buscador. Un 404 útil es el que resuelve la
 * intención con la que venías.
 */

export const metadata = construirMetadata({
  titulo: 'Página no encontrada',
  descripcion: 'La dirección que abriste no existe en LeyAntilavado.org.',
  ruta: '/404',
  noindex: true,
});

const SALIDAS = [
  {
    href: '/herramientas/cuestionario',
    icono: ShieldQuestion,
    titulo: '¿Me aplica la Ley Antilavado?',
    detalle: 'Doce preguntas sobre lo que haces, sin registro.',
  },
  {
    href: '/herramientas/calculadora-umbrales',
    icono: Calculator,
    titulo: 'Calculadora de umbrales',
    detalle: 'La cifra de identificación y de aviso de tu actividad.',
  },
  {
    href: '/actividades-vulnerables',
    icono: FileSearch,
    titulo: 'Actividades vulnerables',
    detalle: 'Las del artículo 17, una por una, con su fracción.',
  },
  {
    href: '/directorio',
    icono: Users,
    titulo: 'Directorio profesional',
    detalle: 'Quién puede ayudarte, y qué le comprobamos a cada quien.',
  },
];

export default function NoEncontrada() {
  return (
    <div className="contenedor-app flex min-h-[62vh] flex-col justify-center py-16">
      <div className="max-w-3xl">
        <p className="cifra text-sm font-medium text-[var(--color-tinta-tenue)]">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--color-tinta)] md:text-4xl">
          Esta dirección no existe
        </h1>
        <p className="prosa mt-4 text-[1.03rem] text-[var(--color-tinta-suave)]">
          Puede que el enlace esté mal escrito, que la página haya cambiado de dirección al
          reorganizar el sitio, o que nunca haya existido. No perdimos nada: todo el contenido
          sigue publicado, sólo hay que llegar por otra puerta.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {SALIDAS.map(({ href, icono: Icono, titulo, detalle }) => (
            <li key={href}>
              <Link
                href={href}
                className="tarjeta flex h-full gap-3 p-4 transition-colors duration-200 hover:bg-[var(--color-marfil-hondo)]"
              >
                <Icono
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-[var(--color-petroleo)]"
                />
                <span className="flex flex-col gap-1">
                  <span className="font-medium text-[var(--color-tinta)]">{titulo}</span>
                  <span className="text-sm leading-snug text-[var(--color-tinta-tenue)]">
                    {detalle}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Boton comoHijo variante="contorno">
            <Link href="/">Ir al inicio</Link>
          </Boton>
          <Boton comoHijo variante="fantasma">
            <Link href="/contacto">Avisarnos del enlace roto</Link>
          </Boton>
        </div>
      </div>
    </div>
  );
}
