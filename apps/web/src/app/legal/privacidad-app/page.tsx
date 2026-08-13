import type { Metadata } from 'next';
import Link from 'next/link';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Nota } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';
import { EncabezadoPagina, REVISION_VIGENTE } from '@/components/inicio/comun';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Privacidad de la app', ruta: '/legal/privacidad-app' },
];

/**
 * Política de privacidad de «Ley AntiLavado MX» (`org.leyantilavado.mx`).
 *
 * Describe **la versión que se publica**, no el código que existe en el
 * repositorio. La diferencia no es un matiz: el AAB se compila con
 * `flutter build appbundle --release`, sin un solo `--dart-define`, así que
 * `Env.haySupabase` y `Env.hayRevenueCat` son falsos y `crearPasarela()`
 * devuelve `PasarelaMock`. La app que llega al teléfono no abre una conexión
 * de red en ningún momento.
 *
 * Un borrador anterior describía la descarga de alertas y el cobro por
 * RevenueCat como si estuvieran activos. Habría contradicho el «sin
 * recopilación» declarado en Data safety, y Play contrasta ese formulario
 * contra esta página: la contradicción se castiga con rechazo de la ficha.
 *
 * Por eso las funciones que existen pero están apagadas se declaran en su
 * propia sección, con el compromiso de actualizar esta página **antes** de que
 * una versión con ellas encendidas llegue a Play. Si cambia el comando de
 * compilación, cambia este archivo en el mismo commit.
 *
 * Va fuera del menú y del pie por decisión de producto, pero sí en el sitemap:
 * Play exige una URL pública y estable, y una página sin enlaces entrantes es
 * imposible de comprobar para quien revisa la ficha.
 */

export const metadata: Metadata = construirMetadata({
  titulo: 'Privacidad de la app Ley AntiLavado MX',
  descripcion:
    'Política de privacidad de la app Android Ley AntiLavado MX: no recaba datos, no los comparte y no abre conexiones de red. Todo se guarda cifrado en tu dispositivo.',
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
        titulo="Política de privacidad de Ley AntiLavado MX"
        entradilla="Aplica a la aplicación Android «Ley AntiLavado MX», identificada en Google Play como org.leyantilavado.mx. No cubre este sitio web, que tiene su propio aviso de privacidad."
        actualizado={formatearFechaLarga(REVISION_VIGENTE)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <Nota tono="info" titulo="El resumen, sin rodeos">
          <p>
            <strong>La aplicación no recaba ningún dato personal, no los comparte con nadie y no
            envía información fuera de tu dispositivo.</strong>
          </p>
          <p>
            No te pide una cuenta, ni un correo, ni un teléfono. No lleva publicidad ni analítica.
            Todo lo que capturas —negocios, clientes, operaciones y montos— se guarda cifrado en
            tu propio teléfono y sólo tú tienes acceso. Nosotros no podemos verlo.
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
            <li>Identificadores del dispositivo, del anunciante ni de la instalación.</li>
            <li>Ubicación, contactos, cámara, micrófono, archivos ni calendario.</li>
            <li>Datos financieros, de pago o de tarjetas.</li>
            <li>Datos de uso, estadísticas de navegación o de interacción.</li>
          </ul>
          <p>
            Como no recabamos datos, <strong>tampoco los compartimos, vendemos ni transferimos a
            terceros.</strong> No hay nada que compartir.
          </p>

          <h2>3. Lo que se guarda en tu dispositivo</h2>
          <p>
            La app existe para ayudarte a evaluar si una operación actualiza un supuesto de la
            LFPIORPI. Para eso guarda información{' '}
            <strong>únicamente en el almacenamiento local de tu teléfono</strong>:
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
              <strong>Tus preferencias:</strong> tema, idioma y bloqueo biométrico.
            </li>
          </ul>
          <p>
            Esta información <strong>nunca sale del dispositivo</strong>. No viaja a nuestros
            servidores ni a los de nadie más, porque la app no realiza conexiones de red.
          </p>

          <h3>Los campos de cliente están diseñados para no pedirte identidades</h3>
          <p>
            La app te pide un <strong>alias</strong> y una <strong>referencia interna</strong>, no
            un nombre completo. No hay campo para INE, CURP, RFC ni pasaporte, y no se te va a
            pedir ninguno: evaluar un umbral no los necesita.
          </p>
          <p>
            Los campos de notas son texto libre. Si decides escribir ahí un dato personal de un
            cliente, se queda en tu dispositivo igual que el resto —pero conviene que sepas que la
            app no puede impedírtelo, y que la responsabilidad sobre lo que captures de tus
            clientes sigue siendo tuya como sujeto obligado.
          </p>

          <h3>Cómo se protege</h3>
          <p>
            La base de datos se cifra con <strong>SQLCipher</strong>, y la llave se guarda en el
            llavero del sistema operativo, no dentro del código de la app. Puedes además exigir
            huella o rostro para volver a la app, y ocultar la pantalla en el conmutador de
            aplicaciones.
          </p>
          <p>
            Si algún dispositivo no lograra abrir la base cifrada, la app te lo dice de forma
            explícita en su pantalla de privacidad en vez de continuar en silencio. Ninguna medida
            elimina el riesgo por completo, y no vamos a prometerte que sí.
          </p>

          <h2>4. Permisos que solicita y para qué</h2>
          <ul>
            <li>
              <strong>Notificaciones:</strong> para recordarte fechas límite de avisos. Los
              recordatorios se calculan, se programan y se muestran en tu propio dispositivo.
            </li>
            <li>
              <strong>Ejecución al reiniciar:</strong> únicamente para volver a programar esos
              recordatorios después de que apagues y enciendas el teléfono. Sin este permiso, un
              reinicio los borraría.
            </li>
            <li>
              <strong>Biometría:</strong> para el bloqueo de la app. La verificación la hace
              Android; la app recibe un sí o un no y <strong>nunca tiene acceso a tu huella ni a
              tu rostro</strong>.
            </li>
          </ul>
          <p>
            La app <strong>no solicita permiso de internet para transmitir tus datos</strong>, y
            no accede a ubicación, contactos, cámara, micrófono ni a tus archivos.
          </p>

          <h2>5. Cómo exportar o eliminar tus datos</h2>
          <p>Desde la propia aplicación, en cualquier momento:</p>
          <ol>
            <li>
              Abre <strong>Más</strong>.
            </li>
            <li>
              Entra a <strong>Respaldo y datos</strong>.
            </li>
            <li>
              Elige <strong>Exportar</strong> para llevarte una copia, o{' '}
              <strong>Eliminar todos mis datos</strong> para borrarlo todo.
            </li>
          </ol>
          <p>
            <strong>Desinstalar la app también elimina todo de forma definitiva.</strong> No hay
            copia en ningún servidor que puedas pedirnos borrar, porque nunca la hubo. Eso también
            significa que <strong>no podemos recuperar nada por ti</strong>: si la información te
            importa, expórtala antes.
          </p>
          <p>
            Los reportes en PDF y CSV que genera la app se crean en tu dispositivo y sólo se
            comparten con quien tú decidas, cuando tú uses el botón de compartir.
          </p>

          <h2>6. Conservación</h2>
          <p>
            Como los datos viven en tu dispositivo, los conservas tú y por el tiempo que tú
            decidas. Ten presente que la LFPIORPI obliga a los sujetos obligados a conservar
            cierta documentación por diez años; ese plazo es tu obligación legal, no un plazo que
            la app aplique por su cuenta ni que nosotros administremos.
          </p>

          <h2>7. Funciones previstas que hoy están apagadas</h2>
          <p>
            El código de la app contempla tres funciones que{' '}
            <strong>no están activas en la versión publicada</strong> y que, por tanto, hoy no
            tratan ningún dato. Las declaramos aquí para que sepas qué puede cambiar y bajo qué
            condiciones:
          </p>
          <ul>
            <li>
              <strong>Descarga de actualizaciones legales.</strong> Traería del servidor alertas
              de cambios normativos y versiones nuevas de las reglas. Sería una descarga: la app
              pide contenido y lo recibe, sin enviar nada tuyo.
            </li>
            <li>
              <strong>Suscripciones de pago.</strong> El cobro lo procesaría Google Play, que
              nunca comparte con nosotros los datos de tu tarjeta.
            </li>
            <li>
              <strong>Reportes de error.</strong> La app muestra un interruptor de «Enviar errores
              técnicos» que viene apagado. Hoy no hay ningún servicio de reporte de fallas
              integrado, de modo que no sale ningún reporte del dispositivo aunque se encienda.
            </li>
          </ul>
          <p>
            <strong>Nos comprometemos a actualizar esta página y la declaración de seguridad de
            los datos de Google Play antes de que una versión con cualquiera de estas funciones
            activas llegue a la tienda</strong>, no después. Las que impliquen tratar datos
            seguirán requiriendo que tú las enciendas.
          </p>

          <h2>8. Menores</h2>
          <p>
            La app es una herramienta de cumplimiento normativo dirigida a profesionales y
            empresas, clasificada para mayores de 18 años. No está dirigida a menores de edad y no
            recaba datos de ellos —ni de nadie— de forma consciente ni inconsciente.
          </p>

          <h2>9. Marco legal aplicable</h2>
          <p>
            Esta política se emite conforme a la Ley Federal de Protección de Datos Personales en
            Posesión de los Particulares. Dado que la aplicación no recaba datos personales, no
            existe tratamiento por nuestra parte sobre el cual ejercer derechos de acceso,
            rectificación, cancelación u oposición: el control sobre la información lo tienes
            íntegramente tú, en tu dispositivo.
          </p>
          <p>
            Si interactúas con este sitio web —por ejemplo, al suscribirte al boletín— aplica el{' '}
            <Link href="/legal/aviso-de-privacidad">aviso de privacidad del sitio</Link>, que es un
            documento distinto y sí describe un tratamiento.
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
