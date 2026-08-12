import type { Metadata } from 'next';
import Link from 'next/link';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { AvisoIndependencia, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { EncabezadoPagina, FECHA_HOY } from '@/components/inicio/comun';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Política de cookies', ruta: '/legal/cookies' },
];

export const metadata: Metadata = construirMetadata({
  titulo: 'Política de cookies',
  descripcion:
    'Qué guarda LeyAntilavado.org en tu navegador, para qué sirve y cómo borrarlo. Hoy no usamos cookies de publicidad ni de seguimiento entre sitios.',
  ruta: '/legal/cookies',
});

const ALMACENAMIENTO = [
  {
    nombre: 'tema',
    tipo: 'Almacenamiento local',
    finalidad:
      'Recuerda si elegiste modo claro u oscuro, para que la página no parpadee en blanco al cargar.',
    duracion: 'Hasta que la borres',
    viaja: 'No sale de tu navegador',
  },
];

export default function Cookies() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Política de cookies y almacenamiento local"
        entradilla="Resumen honesto: hoy el sitio no instala cookies de publicidad, no te sigue entre sitios y no vende tu comportamiento. Lo único que guarda es tu preferencia de tema."
        actualizado={formatearFechaLarga(FECHA_HOY)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <div className="prosa">
          <h2>1. Qué guardamos hoy</h2>
          <p>
            El sitio público funciona sin cookies. Lo único que se escribe en tu navegador es una
            entrada de almacenamiento local con tu preferencia de tema, y esa entrada{' '}
            <strong>nunca se envía a nuestros servidores</strong>: se lee en tu propio equipo
            antes de pintar la página para evitar el destello blanco al cargar en modo oscuro.
          </p>
        </div>

        <TablaEnvoltura className="mt-6 bg-[var(--color-superficie)]">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Elementos que el sitio guarda en tu navegador, su finalidad y su duración.
            </caption>
            <thead>
              <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Tipo
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Para qué sirve
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Duración
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  ¿Sale de tu equipo?
                </th>
              </tr>
            </thead>
            <tbody>
              {ALMACENAMIENTO.map((item) => (
                <tr key={item.nombre} className="border-b border-[var(--color-borde)] last:border-b-0">
                  <th scope="row" className="cifra px-4 py-4 font-medium text-[var(--color-tinta)]">
                    {item.nombre}
                  </th>
                  <td className="px-4 py-4 text-[var(--color-tinta-suave)]">{item.tipo}</td>
                  <td className="px-4 py-4 text-[var(--color-tinta-suave)]">{item.finalidad}</td>
                  <td className="px-4 py-4 text-[var(--color-tinta-suave)]">{item.duracion}</td>
                  <td className="px-4 py-4 text-[var(--color-tinta-suave)]">{item.viaja}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <div className="prosa mt-12">
          <h2>2. Qué no usamos</h2>
          <ul>
            <li>Cookies de publicidad comportamental o de remarketing.</li>
            <li>Identificadores de seguimiento entre sitios ni píxeles de redes sociales.</li>
            <li>Venta o cesión de tu comportamiento de navegación a terceros.</li>
          </ul>
          <p>
            Las tipografías se sirven desde nuestro propio dominio, no desde un servidor externo,
            de modo que cargar una página no comunica tu visita a un tercero.
          </p>

          <h2>3. Área privada y medición</h2>
          <p>
            El área privada de cumplimiento requiere iniciar sesión, y para eso sí necesitará
            cookies estrictamente necesarias de autenticación. Esas cookies no se instalan
            mientras navegas la parte pública.
          </p>
          <p>
            Si en el futuro incorporamos medición de audiencia, será con una herramienta que no
            construya perfiles individuales, se declarará en esta tabla antes de activarse y, si
            la ley lo exige, se pedirá tu consentimiento previo. No vamos a activarlo en silencio.
          </p>

          <h2>4. Cómo borrar lo que se haya guardado</h2>
          <p>
            Puedes borrar el almacenamiento local desde la configuración de privacidad de tu
            navegador —normalmente en “Borrar datos de navegación” o “Datos de sitios”—. Al
            hacerlo, el sitio simplemente volverá a seguir la preferencia de tema de tu sistema
            operativo. Nada más se pierde: no hay sesión ni historial que dependa de eso.
          </p>

          <h2>5. Relación con el aviso de privacidad</h2>
          <p>
            Esta política complementa el{' '}
            <Link href="/legal/aviso-de-privacidad">aviso de privacidad</Link>, donde se explica
            qué datos personales tratamos y cómo ejercer tus derechos ARCO.
          </p>
        </div>

        <Nota tono="atencion" titulo="Pendiente" className="mt-10">
          <p>
            <strong>[PENDIENTE: proveedor de alojamiento y sus registros de servidor]</strong>. Todo
            servidor web guarda registros técnicos de acceso —dirección IP, fecha, recurso
            solicitado— por razones de seguridad y operación. En cuanto quede definido el
            proveedor, publicaremos aquí qué guarda y por cuánto tiempo.
          </p>
        </Nota>

        <AvisoIndependencia className="mt-8" />
      </div>
    </>
  );
}
