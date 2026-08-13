import type { Metadata } from 'next';
import Link from 'next/link';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Nota } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';
import { EncabezadoPagina, REVISION_VIGENTE } from '@/components/inicio/comun';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Privacidad de la aplicación', ruta: '/legal/privacidad-app' },
];

/**
 * Política de privacidad de la app Android `org.leyantilavado.mx`.
 *
 * Va aparte del aviso del sitio a propósito. Son dos tratamientos distintos y
 * casi opuestos: el sitio recaba un correo en un servidor; la app no recaba
 * nada y guarda todo cifrado en el teléfono. Un solo documento que intentara
 * cubrir ambos acabaría diciendo «podemos recabar» sobre las dos cosas, que es
 * exactamente la vaguedad que hace inútiles a estos avisos.
 *
 * Google Play exige que esta URL sea pública y estable, así que la página no
 * está en el menú ni en el pie pero sí en el sitemap: lo contrario la dejaría
 * huérfana y sin forma de comprobarla.
 *
 * Cada afirmación de aquí se verificó contra el código de la app, no contra lo
 * que se pretendía construir. Si el comportamiento cambia, este archivo cambia
 * en el mismo commit.
 */

export const metadata: Metadata = construirMetadata({
  titulo: 'Privacidad de la app Android',
  descripcion:
    'Política de privacidad de la aplicación Android de LeyAntilavado: qué guarda en tu dispositivo, qué sale a la red y qué no recaba. Sin cuenta, sin publicidad y sin analítica.',
  ruta: '/legal/privacidad-app',
});

export default function PrivacidadApp() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonParaScript(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Política de privacidad de la aplicación Android"
        entradilla="Aplica a la app LeyAntilavado para Android, identificada en Google Play como org.leyantilavado.mx. No cubre este sitio web, que tiene su propio aviso de privacidad."
        actualizado={formatearFechaLarga(REVISION_VIGENTE)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <Nota tono="info" titulo="El resumen, sin rodeos">
          <p>
            La app <strong>no te pide una cuenta</strong>, no lleva publicidad y no lleva
            analítica. Todo lo que capturas —negocios, clientes, operaciones y montos— se guarda{' '}
            <strong>cifrado en tu propio dispositivo</strong> y nunca se envía a nosotros ni a
            nadie más. Lo único que viaja por la red es una descarga: las actualizaciones legales
            y los paquetes de reglas que la app trae del servidor.
          </p>
        </Nota>

        <div className="prosa mt-10">
          <h2>1. Quién es el responsable</h2>
          <p>
            La aplicación la desarrolla y publica el equipo que opera{' '}
            <strong>LeyAntilavado.org</strong>, plataforma privada e independiente sin relación
            con el SAT, la UIF ni ninguna dependencia de gobierno.
          </p>
          <p>
            Para cualquier asunto relacionado con esta política puedes escribirnos desde el{' '}
            <Link href="/contacto">formulario de contacto</Link>.
          </p>

          <h2>2. Qué datos se quedan en tu dispositivo</h2>
          <p>
            La app existe para ayudarte a evaluar si una operación actualiza un supuesto de la
            LFPIORPI. Para eso guarda, <strong>únicamente en el almacenamiento local de tu
            teléfono</strong>:
          </p>
          <ul>
            <li>
              <strong>Perfiles de negocio:</strong> nombre, tipo de persona, estado, responsable
              de cumplimiento y si estás dado de alta en el SPPLD.
            </li>
            <li>
              <strong>Actividades vulnerables</strong> que hayas seleccionado para cada negocio.
            </li>
            <li>
              <strong>Referencias de cliente:</strong> un alias y una referencia interna que tú
              eliges, junto con tipo de persona, nivel de riesgo y si se trata de una persona
              políticamente expuesta.
            </li>
            <li>
              <strong>Operaciones:</strong> fecha, montos, forma de pago, referencia interna,
              notas y el resultado de la evaluación.
            </li>
            <li>
              <strong>Tus preferencias:</strong> tema, idioma, bloqueo biométrico y los
              interruptores de consentimiento.
            </li>
          </ul>
          <p>
            Estos datos <strong>no se transmiten a ningún servidor</strong>, ni nuestro ni de
            terceros. No tenemos forma de verlos.
          </p>

          <h3>Los campos de cliente están diseñados para no pedirte identidades</h3>
          <p>
            La app te pide un <strong>alias</strong> y una <strong>referencia interna</strong>, no
            un nombre completo. No hay campo para INE, CURP, RFC ni pasaporte, y no se te va a
            pedir ninguno: la evaluación de umbrales no los necesita.
          </p>
          <p>
            Los campos de notas son texto libre. Si decides escribir ahí un dato personal, ese
            dato se queda en tu dispositivo igual que el resto —pero conviene que sepas que la app
            no puede impedírtelo, y que la responsabilidad sobre lo que captures de tus clientes
            sigue siendo tuya como sujeto obligado.
          </p>

          <h3>Cómo se protege</h3>
          <p>
            La base de datos se cifra con <strong>SQLCipher</strong>, y la llave se guarda en el
            llavero del sistema operativo, no dentro del código de la app. Puedes además exigir
            huella o rostro para volver a la app y ocultar la pantalla en el conmutador de
            aplicaciones.
          </p>
          <p>
            En el caso poco frecuente de un dispositivo que no logre abrir la base cifrada, la app
            te lo dice de forma explícita en su pantalla de privacidad en vez de continuar en
            silencio. Ninguna medida elimina el riesgo por completo, y no vamos a prometerte que
            sí.
          </p>

          <h2>3. Qué sale de tu dispositivo</h2>
          <h3>Actualizaciones legales y paquetes de reglas</h3>
          <p>
            La app consulta nuestro servidor para <strong>descargar</strong> alertas de cambios
            normativos y versiones actualizadas de las reglas. Es una conexión de un solo sentido:
            la app pide contenido y lo recibe. <strong>No envía nada tuyo en esa petición</strong>{' '}
            —ni operaciones, ni montos, ni clientes, ni un identificador del dispositivo—.
          </p>
          <p>
            Como en cualquier conexión a internet, el servidor recibe la dirección IP desde la que
            se hace la petición, que es lo mínimo técnicamente necesario para responder. No la
            usamos para construir un perfil ni la asociamos con nadie.
          </p>
          <p>
            Si la app se instala sin credenciales de servidor configuradas, esta función
            simplemente no existe y la app funciona completa con el paquete de reglas que trae
            incluido.
          </p>

          <h3>Suscripciones, si las activas</h3>
          <p>
            Cuando la app ofrece una suscripción de pago, la compra la procesa{' '}
            <strong>Google Play</strong> y el estado de la suscripción lo administra{' '}
            <strong>RevenueCat</strong>, que actúa como encargado. En ese caso, RevenueCat recibe
            un identificador anónimo generado para la instalación, el estado de tu compra e
            información básica del dispositivo y del país.
          </p>
          <p>
            <strong>La app nunca ve ni almacena los datos de tu tarjeta.</strong> Ese dato lo
            maneja Google Play de principio a fin. Tampoco se envía a RevenueCat nada de lo que
            capturas: ni operaciones, ni montos, ni clientes.
          </p>

          <h3>Reportes de error</h3>
          <p>
            La app incluye un interruptor de «Enviar errores técnicos» que viene{' '}
            <strong>apagado</strong>. A la fecha de esta política{' '}
            <strong>no hay ningún servicio de reporte de fallas integrado</strong>, de modo que
            hoy no sale ningún reporte del dispositivo aunque el interruptor se encienda. Si eso
            cambia, se actualizará esta página antes de que la función se active, y seguirá
            requiriendo que tú lo enciendas.
          </p>

          <h2>4. Qué NO hace la app</h2>
          <ul>
            <li>
              <strong>No te pide una cuenta</strong> ni un correo para funcionar.
            </li>
            <li>
              <strong>No incluye SDK de publicidad</strong> ni comparte datos con anunciantes.
            </li>
            <li>
              <strong>No incluye analítica de uso</strong> de ningún proveedor.
            </li>
            <li>
              <strong>No pide tus credenciales del SAT</strong> ni del SPPLD, y no presenta avisos
              por ti.
            </li>
            <li>
              <strong>No accede a tus contactos, ubicación, cámara, micrófono ni archivos.</strong>
            </li>
            <li>
              <strong>No vende, alquila ni cede datos a terceros.</strong> No hay datos que
              vender: no salen de tu teléfono.
            </li>
          </ul>

          <h2>5. Permisos que solicita y para qué</h2>
          <ul>
            <li>
              <strong>Notificaciones:</strong> para recordarte fechas límite de avisos. Los
              recordatorios se programan y se muestran en tu propio dispositivo.
            </li>
            <li>
              <strong>Ejecución al reiniciar:</strong> únicamente para volver a programar esos
              recordatorios después de que apagues y enciendas el teléfono. Sin este permiso, un
              reinicio los borraría.
            </li>
            <li>
              <strong>Biometría:</strong> para el bloqueo de la app. La verificación la hace
              Android; la app recibe un sí o un no y <strong>nunca tiene acceso a tu huella o a
              tu rostro</strong>.
            </li>
          </ul>

          <h2>6. Tus datos, bajo tu control</h2>
          <p>
            Desde la propia app, en la sección de privacidad, puedes{' '}
            <strong>exportar o eliminar todos tus datos</strong> en cualquier momento.
          </p>
          <p>
            <strong>Desinstalar la app elimina todo de forma definitiva.</strong> No hay copia en
            ningún servidor que puedas pedirnos borrar, porque nunca la hubo. Eso también quiere
            decir que <strong>no podemos recuperar nada por ti</strong>: si la información te
            importa, expórtala antes.
          </p>
          <p>
            Los reportes en PDF y CSV que genera la app se crean en tu dispositivo y sólo se
            comparten con quien tú decidas, cuando tú uses el botón de compartir.
          </p>

          <h2>7. Conservación</h2>
          <p>
            Como los datos viven en tu dispositivo, los conservas tú y por el tiempo que tú
            decidas. Ten presente que la LFPIORPI obliga a los sujetos obligados a conservar
            cierta documentación por diez años; ese plazo es tu obligación legal, no un plazo que
            la app aplique por su cuenta ni que nosotros administremos.
          </p>

          <h2>8. Menores</h2>
          <p>
            La app es una herramienta de cumplimiento dirigida a profesionales y empresas. No está
            dirigida a menores de edad y no recaba datos de ellos de forma consciente.
          </p>

          <h2>9. Marco legal aplicable</h2>
          <p>
            Esta política se emite conforme a la Ley Federal de Protección de Datos Personales en
            Posesión de los Particulares. En la medida en que exista algún tratamiento de datos
            personales por nuestra parte, conservas tus derechos de acceso, rectificación,
            cancelación y oposición, que puedes ejercer por el{' '}
            <Link href="/contacto">formulario de contacto</Link> conforme al procedimiento del{' '}
            <Link href="/legal/aviso-de-privacidad">aviso de privacidad del sitio</Link>.
          </p>

          <h2>10. Cambios a esta política</h2>
          <p>
            Cualquier modificación se publica en esta misma página con su fecha. Si un cambio
            implica que la app empiece a recabar o transmitir algo que hoy no transmite, se
            publicará aquí <strong>antes</strong> de que la versión con ese cambio llegue a Google
            Play.
          </p>
        </div>
      </div>
    </>
  );
}
