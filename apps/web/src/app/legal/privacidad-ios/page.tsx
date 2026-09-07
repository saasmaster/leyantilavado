import type { Metadata } from 'next';
import Link from 'next/link';
import { Nota } from '@leyantilavado/ui';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';
import { EncabezadoPagina } from '@/components/inicio/comun';
import { REVISION_VIGENTE } from '@/content/autores';
import { PAQUETE } from '@/content/ios';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Legal', ruta: '/legal/aviso-de-privacidad' },
  { nombre: 'Privacidad de la app de iPhone', ruta: '/legal/privacidad-ios' },
];

/**
 * Política de privacidad de la app de iOS.
 *
 * ── Por qué es una página aparte y no la misma de Android ──────────────────
 *
 * Es la misma app y la mayoría de las afirmaciones son idénticas, pero App
 * Store Connect pide UNA URL de política y Apple la abre a mano al revisar. Una
 * política que habla de Google Play en un iPhone es motivo de rechazo, y ya
 * costó una tirada: los dos enlaces legales del muro de pago apuntaban a rutas
 * que no existen.
 *
 * Además hay tres cosas que sólo pasan en iOS y que una política honesta tiene
 * que nombrar: la biometría del sistema, la compra por App Store y la
 * restauración de compras. Ninguna existe en la versión de Android.
 *
 * Lo que NO se hace es duplicar el texto y dejar que diverja en silencio, que
 * es el fallo que este proyecto ya cometió entre el sitio y la app. Cuando una
 * afirmación es común, se redacta igual a propósito.
 */

export const metadata: Metadata = construirMetadata({
  titulo: 'Privacidad de Ley AntiLavado MX para iPhone',
  descripcion:
    'Política de privacidad de la app de iOS Ley AntiLavado MX: no recaba datos, no los comparte y no abre conexiones de red. Todo se guarda cifrado en tu iPhone o iPad.',
  ruta: '/legal/privacidad-ios',
});

export default function PrivacidadIOS() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonParaScript(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Política de privacidad de Ley AntiLavado MX para iPhone"
        entradilla={`Aplica a la aplicación de iOS «Ley AntiLavado MX», identificada en el App Store como ${PAQUETE}. No cubre este sitio web, que tiene su propio aviso de privacidad, ni la versión de Android, que tiene la suya.`}
        actualizado={formatearFechaLarga(REVISION_VIGENTE)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <Nota tono="info" titulo="El resumen, sin rodeos">
          <p>
            <strong>
              La aplicación no recaba ningún dato personal, no los comparte con nadie y no envía
              información fuera de tu dispositivo.
            </strong>
          </p>
          <p>
            No te pide una cuenta, ni un correo, ni un teléfono. No lleva publicidad ni analítica.
            Todo lo que capturas —negocios, clientes, operaciones y montos— se guarda cifrado en tu
            propio iPhone o iPad y sólo tú tienes acceso. Nosotros no podemos verlo.
          </p>
        </Nota>

        <div className="prosa mt-10">
          <h2>1. Quién es el responsable</h2>
          <p>
            La aplicación la desarrolla y publica el equipo que opera{' '}
            <strong>LeyAntilavado.org</strong>, plataforma privada e independiente sin relación con
            el SAT, la UIF ni ninguna dependencia de gobierno.
          </p>
          <p>
            Para cualquier asunto relacionado con esta política, escríbenos desde el{' '}
            <Link href="/contacto">formulario de contacto</Link>.
          </p>

          <h2>2. Datos que recabamos: ninguno</h2>
          <p>
            No recabamos, no recibimos y no almacenamos ningún dato de las personas que usan la
            aplicación. En concreto, la app <strong>no recaba</strong>:
          </p>
          <ul>
            <li>Nombre, correo electrónico, teléfono ni dirección.</li>
            <li>
              Identificadores del dispositivo, del anunciante ni de la instalación. La app no usa
              el <em>Identifier for Advertisers</em> y por tanto nunca te muestra la solicitud de
              seguimiento entre apps.
            </li>
            <li>Ubicación, contactos, cámara, micrófono, archivos ni calendario.</li>
            <li>Datos financieros, de pago o de tarjetas.</li>
            <li>Datos de uso, estadísticas de navegación o de interacción.</li>
          </ul>
          <p>
            Como no recabamos datos, <strong>tampoco los compartimos, vendemos ni transferimos a
            terceros.</strong> No hay nada que compartir. En las etiquetas de privacidad del App
            Store esto corresponde a <em>«Datos no recopilados»</em>.
          </p>

          <h2>3. Lo que se guarda en tu dispositivo</h2>
          <p>
            La app existe para ayudarte a evaluar si una operación actualiza un supuesto de la
            LFPIORPI. Para eso guarda información{' '}
            <strong>únicamente en el almacenamiento local de tu dispositivo</strong>:
          </p>
          <ul>
            <li>
              <strong>Perfiles de negocio:</strong> nombre, tipo de persona y actividades
              vulnerables que seleccionaste.
            </li>
            <li>
              <strong>Clientes y operaciones:</strong> lo que tú captures para poder acumular y
              evaluar montos.
            </li>
            <li>
              <strong>Obligaciones y recordatorios:</strong> las fechas que la app calcula a partir
              de tus operaciones.
            </li>
            <li>
              <strong>Preferencias:</strong> tema, idioma y ajustes de la propia app.
            </li>
          </ul>
          <p>
            Esa base de datos va <strong>cifrada</strong>. Y la app comprueba que el cifrado esté
            realmente activo antes de abrirla: si no lo está, se niega a continuar en vez de seguir
            funcionando y llamarse «cifrada». Es una distinción que importa, porque el motor de
            base de datos ignora en silencio las instrucciones de cifrado que no reconoce, de modo
            que sin esa comprobación la palabra podría ser falsa sin que nadie lo notara.
          </p>
          <p>
            Nada de esto viaja a ningún servidor nuestro, entre otras cosas porque{' '}
            <strong>no existe un servidor nuestro donde pudiera estar</strong>.
          </p>

          <h2>4. Permisos y funciones del sistema que usa</h2>
          <ul>
            <li>
              <strong>Face ID o Touch ID (opcional).</strong> Si activas el bloqueo, la app le pide
              a iOS que confirme que eres tú antes de abrir el expediente. La app{' '}
              <strong>no recibe ni guarda</strong> tu rostro ni tu huella: esos datos nunca salen
              del hardware seguro de Apple y la app sólo obtiene un sí o un no.
            </li>
            <li>
              <strong>Notificaciones (opcional).</strong> Se programan{' '}
              <strong>en el propio dispositivo</strong> a partir de las fechas que tú capturaste. No
              hay notificaciones remotas: no existe un servidor que pudiera enviarlas, y la app no
              registra un token de notificaciones push.
            </li>
            <li>
              <strong>Compartir.</strong> Sólo se activa cuando tú exportas algo, y el destino lo
              eliges tú en la hoja del sistema.
            </li>
          </ul>
          <p>
            La app no pide ubicación, contactos, cámara, micrófono, fotos ni calendario, y no
            aparecerá pidiéndotelos.
          </p>

          <h2>5. Compras dentro de la app</h2>
          <p>
            La app incluye una versión <strong>PRO</strong> de <strong>pago único</strong>: no es
            una suscripción y no se renueva automáticamente. La compra la procesa{' '}
            <strong>Apple</strong> con tu Apple ID.
          </p>
          <p>
            Nosotros <strong>no vemos ni recibimos</strong> tus datos de pago. La app no conoce tu
            tarjeta, tu correo de Apple ID ni tu identidad; sólo consulta al sistema si esta
            instalación tiene la compra activa.
          </p>
          <p>
            La restauración de compras <strong>sólo se ejecuta cuando tú la pides</strong> desde el
            botón correspondiente, porque consulta a Apple y puede pedirte tu contraseña. La app no
            la lanza al arrancar ni al volver del segundo plano.
          </p>
          <p>
            El tratamiento que Apple da a los datos de la transacción se rige por la política de
            privacidad de Apple, no por ésta.
          </p>

          <h2>6. Actualización de las reglas jurídicas</h2>
          <p>
            La app trae las reglas de la LFPIORPI incluidas en el propio binario y funciona sin
            conexión. Puede descargar un paquete normativo actualizado{' '}
            <strong>sólo si tú lo pides y sólo si diste tu consentimiento</strong> en los ajustes.
            Esa descarga pide reglas y no envía nada tuyo: no lleva tus operaciones, tus clientes ni
            un identificador de tu instalación.
          </p>

          <h2>7. Lo que la app nunca hace</h2>
          <ul>
            <li>
              <strong>No te pide tus credenciales del SAT</strong> ni tu e.firma, y no puede
              presentar avisos por ti. El envío lo haces tú en el portal oficial.
            </li>
            <li>No emite constancias ni dictámenes de cumplimiento.</li>
            <li>No lleva analítica, ni SDK de publicidad, ni rastreadores de terceros.</li>
          </ul>

          <h2>8. Cómo exportar o eliminar tus datos</h2>
          <p>
            Como todo vive en tu dispositivo, el control es tuyo y no hace falta pedirnos nada:
          </p>
          <ul>
            <li>
              <strong>Exportar:</strong> la app genera un CSV de tus operaciones y un respaldo
              cifrado con una frase que eliges tú. Si pierdes esa frase,{' '}
              <strong>el respaldo no se puede recuperar</strong> — tampoco por nosotros.
            </li>
            <li>
              <strong>Eliminar:</strong> borrar la app de tu dispositivo elimina su base de datos.
              No queda una copia en ningún otro sitio.
            </li>
          </ul>
          <p>
            Si tienes activada la copia de seguridad de iCloud, ten en cuenta que el respaldo del
            dispositivo puede incluir los datos de la app. Eso lo gestiona Apple bajo tu cuenta y
            sus condiciones; se puede excluir desde los ajustes de iCloud del sistema.
          </p>

          <h2>9. Conservación</h2>
          <p>
            No conservamos nada, porque no recibimos nada. Tus datos permanecen en tu dispositivo
            el tiempo que tú decidas.
          </p>
          <p>
            Ojo con no confundirlo: la LFPIORPI te obliga a <strong>ti</strong> a conservar tus
            expedientes por al menos diez años. Esa obligación es tuya y no la cubre esta app: si
            borras la app, borras tu registro.
          </p>

          <h2>10. Menores</h2>
          <p>
            La app es una herramienta profesional dirigida a personas que realizan actividades
            vulnerables. No está dirigida a menores de edad y no recaba datos de nadie, incluidos
            ellos.
          </p>

          <h2>11. Marco legal aplicable</h2>
          <p>
            Esta política se rige por la Ley Federal de Protección de Datos Personales en Posesión
            de los Particulares. Al no recabarse datos personales, no hay tratamiento sobre el cual
            ejercer derechos de acceso, rectificación, cancelación u oposición frente a nosotros.
            Si tienes cualquier duda, puedes escribirnos desde el{' '}
            <Link href="/contacto">formulario de contacto</Link>.
          </p>

          <h2>12. Cambios a esta política</h2>
          <p>
            Si cambia, se publica aquí con su fecha. Los cambios que afecten al tratamiento de datos
            se anunciarán además dentro de la propia app antes de aplicarse.
          </p>
        </div>

        <Nota tono="atencion" titulo="Esta política no cubre el sitio web" className="mt-10">
          <p>
            Para el tratamiento de datos de <strong>leyantilavado.org</strong>, consulta el{' '}
            <Link href="/legal/aviso-de-privacidad">aviso de privacidad del sitio</Link>. Para la
            versión de Android, su{' '}
            <Link href="/legal/privacidad-app">política propia</Link>.
          </p>
        </Nota>
      </div>
    </>
  );
}
