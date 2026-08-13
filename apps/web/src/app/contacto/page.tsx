import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, BookOpenCheck, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Boton } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';
import { EncabezadoPagina, REVISION_VIGENTE } from '@/components/inicio/comun';
import { FormularioContacto } from '@/components/FormularioContacto';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Contacto', ruta: '/contacto' },
];

export const metadata: Metadata = construirMetadata({
  titulo: 'Contacto',
  descripcion:
    'Cómo reportar un error en una cifra, solicitar tu perfil en el directorio profesional o ejercer tus derechos ARCO ante LeyAntilavado.org.',
  ruta: '/contacto',
});

const MOTIVOS = [
  {
    icono: AlertTriangle,
    titulo: 'Reportar una cifra equivocada',
    texto:
      'Es el mensaje que más nos sirve. Dinos qué página, qué cifra y contra qué fuente oficial la contrastaste. Si tienes razón, corregimos el dato, actualizamos la fecha de revisión de la regla y lo dejamos anotado en la bitácora de actualizaciones.',
    enlace: { href: '/metodologia-editorial', texto: 'Cómo procesamos una corrección' },
  },
  {
    icono: UserPlus,
    titulo: 'Aparecer en el directorio profesional',
    texto:
      'Mándanos tu nombre o razón social, las actividades vulnerables que atiendes, tu estado y las credenciales que quieras que revisemos. Ningún perfil se publica sin al menos una comprobación, y la comprobación que se hizo queda visible junto al nombre.',
    enlace: { href: '/directorio', texto: 'Ver cómo funciona el directorio' },
  },
  {
    icono: ShieldCheck,
    titulo: 'Ejercer tus derechos ARCO',
    texto:
      'Si nos diste tu correo para el boletín, puedes pedir acceso, rectificación, cancelación u oposición sobre ese dato. Necesitamos que acredites tu identidad y que nos digas con claridad qué derecho ejerces.',
    enlace: { href: '/legal/aviso-de-privacidad', texto: 'Leer el aviso de privacidad' },
  },
  {
    icono: BookOpenCheck,
    titulo: 'Prensa, colaboración editorial o datos',
    texto:
      'Si eres medio, colegio profesional o autoridad y quieres citar, corregir o aportar una fuente primaria, escríbenos: la trazabilidad mejora cuando alguien nos revisa.',
  },
];

export default function Contacto() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonParaScript(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Contacto"
        entradilla="No damos asesoría jurídica ni resolvemos casos concretos por correo: para eso está el directorio profesional. Sí atendemos correcciones, altas al directorio y derechos ARCO."
        actualizado={formatearFechaLarga(REVISION_VIGENTE)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <section aria-labelledby="formulario-contacto" className="tarjeta p-6 md:p-8">
          <h2
            id="formulario-contacto"
            className="text-xl font-semibold text-[var(--color-tinta)]"
          >
            Escríbenos
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-tinta-suave)]">
            Cada mensaje recibe un folio para que puedas darle seguimiento. Lo que escribas no se
            publica ni se indexa.
          </p>
          <div className="mt-6 max-w-2xl">
            <FormularioContacto />
          </div>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {MOTIVOS.map(({ icono: Icono, titulo, texto, ...resto }) => (
            <section key={titulo} className="tarjeta flex flex-col p-6">
              <span
                aria-hidden="true"
                className="grid size-11 place-items-center rounded-[var(--radius-control)] bg-[var(--color-petroleo-tenue)] text-[var(--color-petroleo-hondo)]"
              >
                <Icono className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-[var(--color-tinta)]">{titulo}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {texto}
              </p>
              {'enlace' in resto && resto.enlace && (
                <Link
                  href={resto.enlace.href}
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                >
                  {resto.enlace.texto}
                </Link>
              )}
            </section>
          ))}
        </div>

        <section
          aria-labelledby="contacto-boletin"
          className="tarjeta mt-8 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2
              id="contacto-boletin"
              className="flex items-center gap-2 text-lg font-semibold text-[var(--color-tinta)]"
            >
              <Mail className="size-5 text-[var(--color-petroleo)]" aria-hidden="true" />
              El canal que sí está activo
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-tinta-suave)]">
              El boletín de cambios normativos ya funciona: te avisa cuando cambia el valor de la
              UMA o cuando se publica algo en el DOF que toca la LFPIORPI. Se da de alta con
              consentimiento expreso y se cancela cuando quieras.
            </p>
          </div>
          <Boton comoHijo variante="accion">
            <Link href="/#boletin-titulo">Ir al boletín</Link>
          </Boton>
        </section>

        <div className="prosa mt-12">
          <h2>Lo que no podemos hacer</h2>
          <ul>
            <li>
              Decirte si cumples o no. Ninguna herramienta ni ningún correo nuestro emite esa
              conclusión.
            </li>
            <li>
              Revisar tu expediente, tu manual o tus avisos. Eso es trabajo profesional y tiene
              responsabilidad detrás.
            </li>
            <li>
              Intervenir ante el SAT o la UIF. No somos autoridad ni tenemos relación con ellas.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
