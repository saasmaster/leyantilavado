import type { Metadata } from 'next';
import Link from 'next/link';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { AvisoIndependencia, Insignia, Nota } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { EncabezadoPagina, REVISION_VIGENTE } from '@/components/inicio/comun';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Divulgación de publicidad', ruta: '/legal/publicidad' },
];

export const metadata: Metadata = construirMetadata({
  titulo: 'Divulgación de publicidad',
  descripcion:
    'Cómo se financia LeyAntilavado.org, qué contenido puede ser pagado, cómo se etiqueta y qué no se puede comprar en este sitio.',
  ruta: '/legal/publicidad',
});

export default function Publicidad() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Divulgación de publicidad y conflictos de interés"
        entradilla="Un sitio que compara proveedores y a la vez cobra por aparecer tiene un conflicto de interés evidente. La única respuesta decente es decir exactamente dónde está la línea."
        actualizado={formatearFechaLarga(REVISION_VIGENTE)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <div className="prosa">
          <h2>1. De dónde sale el dinero</h2>
          <p>Hay dos fuentes de ingreso previstas, y ninguna es publicidad display:</p>
          <ul>
            <li>
              <strong>Suscripción al área privada de cumplimiento.</strong> Es la fuente
              principal. La pagan los propios sujetos obligados por usar el software.
            </li>
            <li>
              <strong>Perfiles destacados en el directorio profesional.</strong> Un profesional o
              un proveedor de software puede pagar por mayor visibilidad dentro del directorio.
            </li>
          </ul>

          <h2>2. Lo que se compra y lo que no</h2>
          <p>
            <strong>Se puede comprar:</strong> posición destacada dentro del directorio, un perfil
            más extenso y la posibilidad de recibir solicitudes de contacto.
          </p>
          <p>
            <strong>No se puede comprar, en ninguna circunstancia:</strong>
          </p>
          <ul>
            <li>Un nivel de verificación. Se gana con documentos revisados o no se tiene.</li>
            <li>
              La posición en una comparativa de software, ni la omisión de una desventaja real.
            </li>
            <li>
              El contenido editorial, el resultado de una herramienta o la interpretación de una
              norma.
            </li>
            <li>La eliminación de una crítica fundamentada o de una corrección publicada.</li>
          </ul>

          <h2>3. Cómo lo vas a reconocer</h2>
          <p>
            Todo perfil o contenido pagado lleva la etiqueta <strong>“Patrocinado”</strong>{' '}
            visible junto al nombre, en la vista de listado y en la de detalle. No aparece en letra
            chica al final de la página, y no depende del plan contratado.
          </p>
        </div>

        <div className="tarjeta mt-6 flex flex-wrap items-center gap-4 p-5">
          <Insignia tono="ambar">Patrocinado</Insignia>
          <p className="text-sm text-[var(--color-tinta-suave)]">
            Así se ve la etiqueta. Si un perfil no la tiene, no pagó por su posición.
          </p>
        </div>

        <div className="prosa mt-12">
          <h2>4. Verificación y dinero son cosas separadas</h2>
          <p>
            El nivel de verificación de un perfil —desde “correo verificado” hasta “documentación
            revisada”— depende únicamente de qué comprobamos, y cada nivel explica textualmente su
            alcance. Un perfil patrocinado sin credenciales revisadas se muestra como patrocinado{' '}
            <em>y</em> sin verificar: las dos cosas al mismo tiempo, sin que una tape a la otra.
          </p>
          <p>
            El nivel más alto que otorgamos es “documentación revisada”. <strong>No existe ni
            existirá un sello de “certificado por LeyAntilavado.org”</strong>: no somos autoridad
            certificadora.
          </p>

          <h2>5. Comparativas de software</h2>
          <p>
            Cuando publiquemos comparativas de software de cumplimiento, el criterio será el mismo
            para todos los productos evaluados, incluido el nuestro. Si el área privada de este
            proyecto aparece en una comparativa, se identificará como producto propio en la misma
            fila, y no ocupará el primer lugar por serlo.
          </p>

          <h2>6. Enlaces de afiliación</h2>
          <p>
            Hoy <strong>no usamos enlaces de afiliación</strong>. Si algún día los usáramos, se
            marcarían individualmente en el punto del texto donde aparezcan, no sólo en esta
            página.
          </p>
          <p>
            Los enlaces a documentos oficiales y a fuentes de terceros llevan siempre el atributo
            que indica a los buscadores que no transferimos autoridad: son referencias, no
            respaldos ni intercambios.
          </p>

          <h2>7. Reportar un incumplimiento de estas reglas</h2>
          <p>
            Si encuentras contenido pagado sin etiquetar, o crees que una recomendación está
            sesgada por un pago, dínoslo. Es el tipo de error que corregimos rápido y en público.
          </p>
          <p>
            Los canales están en la página de <Link href="/contacto">contacto</Link>, y la forma en
            que procesamos correcciones está en la{' '}
            <Link href="/metodologia-editorial">metodología editorial</Link>.
          </p>
        </div>

        <Nota tono="info" titulo="Hoy no hay publicidad activa" className="mt-10">
          <p>
            No hay perfiles patrocinados ni acuerdos comerciales vigentes en el sitio. Cuando los
            haya, esta política se actualizará con las tarifas y los criterios de las comparativas
            antes de que aparezca el primer espacio pagado, no después.
          </p>
        </Nota>

        <AvisoIndependencia className="mt-8" />
      </div>
    </>
  );
}
