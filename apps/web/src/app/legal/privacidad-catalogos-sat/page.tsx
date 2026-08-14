import type { Metadata } from 'next';
import Link from 'next/link';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Nota } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';
import { EncabezadoPagina, REVISION_VIGENTE } from '@/components/inicio/comun';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Privacidad de Catálogos SAT', ruta: '/legal/privacidad-catalogos-sat' },
];

const ID_EXTENSION = 'dlegndmjhgfcdakhnligknamoenncjjn';

/**
 * Política de privacidad de la extensión «Buscador de Catálogos SAT».
 *
 * Escrita contra el código, no contra la ficha. Eso corrigió dos cosas que la
 * versión anterior —`SAT Catalog/politica-privacidad/index.html`, nunca
 * publicada— decía mal:
 *
 *  1. Declaraba `clipboardWrite` y `activeTab`, que la versión en preparación
 *     ya no solicita, y callaba el permiso de host opcional que sí pide.
 *  2. Un comentario del manifiesto afirma que `tabs` «da el id de la pestaña
 *     activa sin exponer su URL». El código sí lee `tab.url`, en
 *     `isRestricted()`, para no intentar inyectar en páginas que Chrome
 *     protege. Es un uso local y efímero, pero decir que no ocurre sería falso
 *     y es justo el tipo de afirmación que una revisión comprueba.
 *
 * Los dos `fetch()` del código resuelven contra `chrome-extension://<id>/data/`
 * —el propio paquete—, así que la extensión no hace ninguna petición de red.
 * Eso es lo que sostiene el «no recolecta datos» declarado en la Web Store, y
 * esta página no puede contradecirlo sin costar la ficha.
 */

export const metadata: Metadata = construirMetadata({
  titulo: 'Privacidad de la extensión Catálogos SAT',
  descripcion:
    'Política de privacidad de la extensión de Chrome «Buscador de Catálogos SAT»: funciona sin conexión, no recoge datos y no envía nada fuera de tu navegador.',
  ruta: '/legal/privacidad-catalogos-sat',
});

export default function PrivacidadCatalogosSAT() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonParaScript(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Política de privacidad de «Buscador de Catálogos SAT»"
        entradilla={`Aplica a la extensión de Google Chrome «Buscador de Catálogos SAT», identificada en la Chrome Web Store con el ID ${ID_EXTENSION}. No cubre este sitio web, que tiene su propio aviso de privacidad.`}
        actualizado={formatearFechaLarga(REVISION_VIGENTE)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <Nota tono="info" titulo="El resumen, sin rodeos">
          <p>
            <strong>La extensión no recoge datos, no los comparte y no hace ninguna petición de
            red.</strong> Funciona completa sin conexión.
          </p>
          <p>
            Los catálogos del SAT vienen dentro del propio paquete de la extensión. Tus favoritos,
            búsquedas recientes y preferencias se guardan en el almacenamiento de tu navegador y
            nunca salen de tu equipo. No hay cuenta, ni publicidad, ni analítica.
          </p>
        </Nota>

        <div className="prosa mt-10">
          <h2>1. Quién publica la extensión</h2>
          <p>
            La extensión la publica <strong>Veeme Media</strong> en la Chrome Web Store. Esta
            página está alojada en LeyAntilavado.org, que actúa únicamente como sede pública y
            estable de este documento.
          </p>
          <p>
            Para cualquier asunto relacionado con esta política puedes escribirnos desde el{' '}
            <Link href="/contacto">formulario de contacto</Link>.
          </p>

          <h2>2. Datos que recogemos: ninguno</h2>
          <p>
            No recogemos, no recibimos y no almacenamos ningún dato de las personas que usan la
            extensión. En concreto, <strong>no recoge</strong>:
          </p>
          <ul>
            <li>Datos de identificación, contacto, salud, financieros ni de autenticación.</li>
            <li>Ubicación, historial de navegación ni contenido de las páginas que visitas.</li>
            <li>Identificadores del navegador, del dispositivo o de publicidad.</li>
            <li>Estadísticas de uso, eventos ni datos de diagnóstico.</li>
          </ul>
          <p>
            Como no recogemos datos, <strong>tampoco los vendemos, compartimos ni transferimos a
            terceros</strong>. No hay nada que compartir.
          </p>

          <h2>3. Qué se guarda en tu navegador</h2>
          <p>
            Todo lo que la extensión guarda vive <strong>en tu propio navegador</strong>, en el
            almacenamiento local que Chrome le asigna:
          </p>
          <ul>
            <li>
              <strong>Favoritos:</strong> las claves que marcas para tenerlas a mano.
            </li>
            <li>
              <strong>Búsquedas recientes:</strong> los últimos términos que consultaste, para
              poder repetirlos.
            </li>
            <li>
              <strong>Preferencias de interfaz:</strong> por ejemplo el tema o el catálogo que
              abres por omisión.
            </li>
            <li>
              <strong>El catálogo de Producto/Servicio</strong>, si decides importarlo. Ocupa unos
              9 MB y por eso se guarda en la base de datos local del navegador.
            </li>
          </ul>
          <p>
            Nada de esto se sincroniza ni se envía a ningún servidor. No tenemos forma de verlo.
          </p>

          <h2>4. Permisos que solicita y para qué</h2>
          <ul>
            <li>
              <strong>Almacenamiento y almacenamiento sin límite:</strong> guardar favoritos,
              recientes, preferencias y el catálogo importado. El límite normal de Chrome no
              alcanza para un catálogo de 9 MB.
            </li>
            <li>
              <strong>Panel lateral:</strong> mostrar la extensión junto a la página en la que
              estás trabajando, en lugar de en una ventana emergente que se cierra sola.
            </li>
            <li>
              <strong>Pestañas:</strong> saber cuál es la pestaña activa cuando pulsas «Insertar».
            </li>
            <li>
              <strong>Scripting:</strong> escribir la clave que elegiste en el campo enfocado de
              esa pestaña. Se ejecuta <strong>sólo</strong> cuando pulsas «Insertar».
            </li>
            <li>
              <strong>Permiso de acceso a sitios (opcional):</strong> no se pide al instalar. La
              extensión lo solicita la primera vez que usas «Insertar», y si lo rechazas sigue
              funcionando: la clave se copia al portapapeles.
            </li>
          </ul>

          <h3>Qué ocurre exactamente al pulsar «Insertar»</h3>
          <p>
            Es la única función que toca la página en la que estás, así que conviene describirla
            con precisión:
          </p>
          <ol>
            <li>
              La extensión <strong>lee la dirección de la pestaña activa</strong> para comprobar
              que no es una página que Chrome protege —sus propias pantallas o la Chrome Web
              Store—, donde la inserción no es posible. Esa dirección se usa para esa comprobación
              y nada más: no se guarda ni se envía.
            </li>
            <li>
              Escribe <strong>únicamente la clave que seleccionaste</strong> en el campo que tengas
              enfocado.
            </li>
            <li>
              <strong>No lee el contenido de la página</strong>, ni sus formularios, ni lo que hay
              escrito en otros campos.
            </li>
          </ol>

          <h2>5. Cómo se actualizan los catálogos</h2>
          <p>
            Los catálogos vienen empaquetados con la extensión y se actualizan cuando actualizas la
            extensión desde la Chrome Web Store. Si necesitas una versión más reciente antes de
            eso, puedes importarla tú: <strong>descargas el archivo del portal del SAT y lo abres
            desde tu equipo</strong>. La extensión no lo descarga por su cuenta, porque no realiza
            peticiones de red.
          </p>

          <h2>6. Cómo eliminar tus datos</h2>
          <p>
            <strong>Desinstalar la extensión elimina todo lo que guardó</strong> —favoritos,
            recientes, preferencias y el catálogo importado— de forma definitiva. No hay copia en
            ningún servidor que puedas pedirnos borrar, porque nunca la hubo.
          </p>
          <p>
            También puedes borrar las búsquedas recientes desde la propia extensión sin desinstalar
            nada.
          </p>

          <h2>7. Menores</h2>
          <p>
            Es una herramienta de consulta de catálogos fiscales dirigida a contribuyentes y
            profesionales. No está dirigida a menores de edad y no recoge datos de ellos —ni de
            nadie— de forma consciente ni inconsciente.
          </p>

          <h2>8. Marco legal aplicable</h2>
          <p>
            Esta política se emite conforme a la Ley Federal de Protección de Datos Personales en
            Posesión de los Particulares. Dado que la extensión no recoge datos personales, no
            existe tratamiento por nuestra parte sobre el cual ejercer derechos de acceso,
            rectificación, cancelación u oposición: el control sobre la información lo tienes
            íntegramente tú, en tu navegador.
          </p>
          <p>
            Si interactúas con este sitio web aplica su{' '}
            <Link href="/legal/aviso-de-privacidad">aviso de privacidad</Link>, que es un documento
            distinto y sí describe un tratamiento.
          </p>

          <h2>9. Cambios a esta política</h2>
          <p>
            Cualquier modificación se publica en esta misma página con su fecha. Si un cambio
            implica que la extensión empiece a recoger o transmitir algo que hoy no transmite, se
            publicará aquí <strong>antes</strong> de que la versión con ese cambio llegue a la
            Chrome Web Store.
          </p>
        </div>
      </div>
    </>
  );
}
