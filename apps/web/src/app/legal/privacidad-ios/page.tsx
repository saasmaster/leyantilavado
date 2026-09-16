import type { Metadata } from 'next';
import Link from 'next/link';
import { Nota } from '@leyantilavado/ui';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';
import { EncabezadoPagina } from '@/components/inicio/comun';
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
 * La 1.0 de iOS (16 sep 2026) es gratuita y más corta que la de Android: no
 * vende nada, no tiene bloqueo biométrico, no exporta y no enlaza al sitio.
 * Esta política describe ESA app; si PRO vuelve a iOS, hay que regresar las
 * secciones de compras, biometría y exportación.
 *
 * Lo que NO se hace es duplicar el texto y dejar que diverja en silencio, que
 * es el fallo que este proyecto ya cometió entre el sitio y la app. Cuando una
 * afirmación es común, se redacta igual a propósito.
 */

/**
 * Cuándo cambió ESTE documento. No es REVISION_VIGENTE: esa fecha se mueve con
 * cada pasada al corpus legal, y moverla aquí le diría a quien lee que su
 * política de privacidad cambió cuando no cambió nada.
 */
const PRIVACIDAD_ACTUALIZADA = '2026-09-16';

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
        actualizado={formatearFechaLarga(PRIVACIDAD_ACTUALIZADA)}
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
            Es gratuita, no tiene compras dentro de la app y no se conecta a internet. No te pide
            una cuenta, ni un correo, ni un teléfono. No lleva publicidad ni analítica.
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
              <strong>Perfiles de negocio:</strong> nombre, tipo de persona, estado, las actividades
              vulnerables que seleccionaste y, si los capturas, el responsable de cumplimiento y tu
              fecha de alta en el portal del SAT.
            </li>
            <li>
              <strong>Clientes y operaciones:</strong> lo que tú captures para poder acumular y
              evaluar montos. A los clientes la app los registra con un <strong>alias</strong> que
              eliges tú, más su nivel de riesgo y si son persona políticamente expuesta; no pide su
              nombre legal, RFC ni identificación.
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
            Esa base de datos va <strong>cifrada</strong>, y la app comprueba al abrirla que el
            cifrado esté realmente activo en vez de darlo por hecho. Si en algún dispositivo no lo
            estuviera, la app sigue funcionando pero <strong>te lo dice</strong> en Más →
            Privacidad y seguridad, para que decidas si continúas. No te muestra «cifrada» sobre una
            base que no lo está.
          </p>
          <p>
            Nada de esto viaja a ningún servidor nuestro, entre otras cosas porque{' '}
            <strong>no existe un servidor nuestro donde pudiera estar</strong>.
          </p>

          <h2>4. Permisos y funciones del sistema que usa</h2>
          <ul>
            <li>
              <strong>Notificaciones (opcional).</strong> Se programan{' '}
              <strong>en el propio dispositivo</strong> a partir de las fechas que tú capturaste. No
              hay notificaciones remotas: no existe un servidor que pudiera enviarlas, y la app no
              registra un token de notificaciones push. El aviso muestra el nombre del plazo y los
              días que faltan; lo que se ve con el teléfono bloqueado depende de tus ajustes de
              notificaciones de iOS.
            </li>
            <li>
              <strong>Llavero de iOS.</strong> Ahí se guarda la llave que cifra la base de datos,
              marcada para <strong>este dispositivo únicamente</strong>: no se sincroniza con el
              Llavero de iCloud ni viaja en los respaldos.
            </li>
            <li>
              <strong>Enlaces externos.</strong> La app sólo abre fuentes oficiales de gobierno —la
              Cámara de Diputados (texto de la ley), el Diario Oficial de la Federación, el INEGI,
              el portal SPPLD del SAT y la página de la UIF en gob.mx—, en el navegador y
              únicamente cuando tú tocas el enlace. Al abrirlos, esos sitios reciben lo que recibe
              cualquier visita, bajo sus propias políticas.
            </li>
          </ul>
          <p>
            La app no pide ubicación, contactos, cámara, micrófono, fotos ni calendario, y no
            aparecerá pidiéndotelos.
          </p>

          <h2>5. Compras dentro de la app: no hay</h2>
          <p>
            La app es <strong>gratuita</strong>. No incluye compras dentro de la app, suscripciones
            ni funciones bloqueadas, y no se conecta con el sistema de pagos de Apple. No
            procesamos pagos ni recibimos datos de pago de ningún tipo.
          </p>

          <h2>6. Conexiones de red: ninguna</h2>
          <p>
            Esta versión <strong>no se conecta a internet</strong>. Las reglas de la LFPIORPI y los
            valores de la UMA vienen incluidos en la propia app y funcionan sin conexión. Cuando
            cambian, llegan con una actualización normal de la app en el App Store.
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

          <h2>8. Cómo eliminar tus datos</h2>
          <p>
            Como todo vive en tu dispositivo, el control es tuyo y no hace falta pedirnos nada:
          </p>
          <ul>
            <li>
              <strong>Desde la app:</strong> Más → Respaldo y datos → «Eliminar todos mis datos»
              cancela los recordatorios programados, borra todo lo que la app guarda —negocios,
              clientes, operaciones, calendario, auditorías y ajustes— y destruye la llave de
              cifrado.
            </li>
            <li>
              <strong>Borrando la app:</strong> eliminar la app de tu dispositivo elimina su base de
              datos. No queda una copia en ningún otro sitio.
            </li>
          </ul>
          <p>
            <strong>Sobre la copia de seguridad de iCloud:</strong> si la tienes activada, el
            respaldo del dispositivo puede incluir el archivo de la base de datos, pero va cifrado
            y <strong>la llave no viaja con él</strong>, porque está marcada para este dispositivo
            únicamente. Ese archivo no se puede abrir en otro iPhone o iPad, ni por Apple ni por
            nosotros. Si prefieres que ni siquiera se copie, puedes excluir la app en Ajustes →
            tu nombre → iCloud → Administrar almacenamiento → Respaldos.
          </p>

          <h2>9. Conservación</h2>
          <p>
            No conservamos nada, porque no recibimos nada. Tus datos permanecen en tu dispositivo
            el tiempo que tú decidas.
          </p>
          <p>
            Ojo con no confundirlo: la LFPIORPI te obliga a <strong>ti</strong> a conservar la
            información y documentación de tus operaciones por al menos diez años (artículo 18,
            fracción IV). Esa obligación es tuya y no la cubre esta app: si borras la app o cambias
            de dispositivo, tu registro no te acompaña, porque la llave se queda en el dispositivo
            anterior. Conserva tu expediente por otros medios.
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
            Si cambia, se publica aquí con su fecha. Si una versión futura de la app llegara a
            tratar datos de otra forma —por ejemplo, conectándose a internet—, esta política se
            actualizará antes de que esa versión se publique en el App Store.
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
