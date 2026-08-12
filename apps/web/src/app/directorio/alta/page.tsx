import type { Metadata } from 'next';
import Link from 'next/link';
import { ETIQUETA_VERIFICACION, EXPLICACION_VERIFICACION } from '@leyantilavado/types';
import { datos } from '@leyantilavado/rules-engine';
import { Nota } from '@leyantilavado/ui';
import { FormularioAlta } from '@/components/directorio/FormularioAlta';
import {
  ESTADOS_MX,
  ETIQUETA_CATEGORIA,
  ETIQUETA_TAMANO,
  IDIOMAS_DIRECTORIO,
  ORDEN_CATEGORIAS,
  TIPOS_SERVICIO,
} from '@/lib/directorio/catalogo';
import { construirMetadata } from '@/lib/sitio';

export const metadata: Metadata = construirMetadata({
  titulo: 'Dar de alta tu perfil en el directorio',
  descripcion:
    'Regístrate como proveedor de servicios de cumplimiento LFPIORPI. El perfil básico es gratuito, se revisa a mano y el pago nunca mejora tu posición.',
  ruta: '/directorio/alta',
});

const PASOS_VERIFICACION = [
  {
    titulo: '1. Recibimos tu alta',
    plazo: 'Inmediato',
    texto:
      'Tu perfil queda registrado como pendiente. Todavía no aparece en el buscador y nadie puede contactarte a través del directorio.',
  },
  {
    titulo: '2. Verificamos tu correo',
    plazo: 'El mismo día',
    texto:
      'Te enviamos un enlace de confirmación. Con eso comprobamos que controlas el correo del perfil, y nada más que eso.',
  },
  {
    titulo: '3. Revisamos identidad y datos',
    plazo: '3 a 5 días hábiles',
    texto:
      'Comprobamos que la persona o la empresa exista legalmente y que los datos del perfil sean coherentes. Podemos pedirte documentos adicionales por correo.',
  },
  {
    titulo: '4. Revisamos documentos, si los presentas',
    plazo: '5 a 10 días hábiles',
    texto:
      'Cotejamos cédulas, certificaciones y su vigencia contra el emisor cuando la consulta es pública. Los documentos no se publican: sólo los ve moderación.',
  },
  {
    titulo: '5. Publicación',
    plazo: 'Al terminar la revisión',
    texto:
      'Tu perfil aparece con la insignia que corresponda al nivel que efectivamente comprobamos, ni uno más. Puedes pedir la baja cuando quieras.',
  },
];

export default function PaginaAlta() {
  const categorias = ORDEN_CATEGORIAS.map((c) => ({ valor: c, etiqueta: ETIQUETA_CATEGORIA[c] }));
  const actividades = datos.ACTIVIDADES.map((a) => ({
    valor: a.slug,
    etiqueta: a.nombreCorto,
  }));
  const servicios = TIPOS_SERVICIO.map((s) => ({ valor: s.clave, etiqueta: s.etiqueta }));
  const tamanos = (['micro', 'pequena', 'mediana', 'grande'] as const).map((t) => ({
    valor: t,
    etiqueta: ETIQUETA_TAMANO[t],
  }));

  return (
    <div className="contenedor-app flex flex-col gap-10 py-10 md:py-14">
      <header className="flex flex-col gap-4">
        <p className="text-sm text-[var(--color-tinta-tenue)]">
          <Link href="/directorio" className="underline underline-offset-4">
            Directorio
          </Link>{' '}
          / Alta de proveedor
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">Da de alta tu perfil</h1>
        <p className="prosa text-[var(--color-tinta-suave)]">
          El perfil básico es gratuito y no caduca. Lo que se paga son funciones del perfil
          —logotipo, credenciales revisadas, estadísticas— y, si lo quieres, publicidad claramente
          etiquetada. Ninguna de esas cosas mejora tu posición en los resultados: el orden lo define
          lo que comprobamos, no lo que se cobra.
        </p>
      </header>

      <Nota tono="info" titulo="Antes de llenar nada, tres cosas claras">
        <p>
          <strong>Tu perfil se publica de inmediato, marcado como «Sin verificar».</strong> Eso es
          exactamente lo que verá quien lo encuentre: que existes y que todavía no hemos comprobado
          nada de ti. Para subir de ahí hace falta que una persona revise tus documentos, y esa
          revisión la hace
          una persona.
        </p>
        <p>
          <strong>No certificamos a nadie.</strong> Publicamos qué comprobamos de cada perfil, con
          esas palabras exactas. La frase “certificado por LeyAntilavado.org” no existe y no va a
          existir.
        </p>
        <p>
          <strong>No publicamos reseñas.</strong> Tu perfil no va a recibir calificaciones públicas
          ni comentarios sin moderación.
        </p>
      </Nota>

      <section aria-labelledby="proceso" className="flex flex-col gap-4">
        <h2 id="proceso" className="text-2xl font-semibold">
          Cómo es la verificación y cuánto tarda
        </h2>
        <ol className="grid gap-3 md:grid-cols-2">
          {PASOS_VERIFICACION.map((paso) => (
            <li
              key={paso.titulo}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <p className="font-medium text-[var(--color-tinta)]">{paso.titulo}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--color-petroleo-hondo)]">
                {paso.plazo}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {paso.texto}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="niveles" className="flex flex-col gap-4">
        <h2 id="niveles" className="text-2xl font-semibold">
          Qué significa cada insignia
        </h2>
        <dl className="flex flex-col gap-3">
          {(
            [
              'correo_verificado',
              'identidad_verificada',
              'documentacion_revisada',
              'certificacion_externa_revisada',
            ] as const
          ).map((nivel) => (
            <div
              key={nivel}
              className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
            >
              <dt className="font-medium text-[var(--color-tinta)]">
                {ETIQUETA_VERIFICACION[nivel]}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {EXPLICACION_VERIFICACION[nivel]}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="formulario" className="flex flex-col gap-6">
        <h2 id="formulario" className="text-2xl font-semibold">
          Formulario de alta
        </h2>
        <FormularioAlta
          categorias={categorias}
          actividades={actividades}
          servicios={servicios}
          idiomas={IDIOMAS_DIRECTORIO}
          estados={ESTADOS_MX}
          tamanos={tamanos}
        />
      </section>
    </div>
  );
}
