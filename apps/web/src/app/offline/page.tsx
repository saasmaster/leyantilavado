import Link from 'next/link';
import { Boton, Nota } from '@leyantilavado/ui';
import { construirMetadata } from '@/lib/sitio';

export const metadata = construirMetadata({
  titulo: 'Sin conexión',
  descripcion: 'Las calculadoras públicas siguen funcionando sin conexión a internet.',
  ruta: '/offline',
  noindex: true,
});

const DISPONIBLES = [
  { href: '/herramientas/calculadora-uma', etiqueta: 'Conversor UMA' },
  { href: '/herramientas/calculadora-umbrales', etiqueta: 'Calculadora de umbrales' },
  { href: '/herramientas/limites-efectivo', etiqueta: 'Límites de efectivo' },
  { href: '/herramientas/cuestionario', etiqueta: '¿Me aplica la ley?' },
];

export default function SinConexion() {
  return (
    <div className="contenedor-app flex min-h-[60vh] flex-col justify-center py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold">Estás sin conexión</h1>
        <p className="prosa mt-3 text-[var(--color-tinta-suave)]">
          No pudimos cargar esta página, pero las calculadoras que ya visitaste siguen funcionando:
          el motor de reglas y los valores de la UMA se guardaron en tu dispositivo.
        </p>

        <ul className="mt-6 flex flex-col gap-2">
          {DISPONIBLES.map((h) => (
            <li key={h.href}>
              <Boton comoHijo variante="contorno" ancho="completo" className="justify-start">
                <Link href={h.href}>{h.etiqueta}</Link>
              </Boton>
            </li>
          ))}
        </ul>

        <Nota tono="atencion" titulo="Cuidado con los datos guardados" className="mt-8">
          Sin conexión no podemos comprobar si una regla cambió. Al recuperar internet, vuelve a
          calcular cualquier resultado del que dependa una decisión.
        </Nota>
      </div>
    </div>
  );
}
