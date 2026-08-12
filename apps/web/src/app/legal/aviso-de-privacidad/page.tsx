import type { Metadata } from 'next';
import Link from 'next/link';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { AvisoIndependencia, Nota } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { EncabezadoPagina, REVISION_VIGENTE } from '@/components/inicio/comun';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Aviso de privacidad', ruta: '/legal/aviso-de-privacidad' },
];

export const metadata: Metadata = construirMetadata({
  titulo: 'Aviso de privacidad',
  descripcion:
    'Aviso de privacidad integral de LeyAntilavado.org: qué datos personales tratamos, para qué, con quién los compartimos y cómo ejercer tus derechos ARCO.',
  ruta: '/legal/aviso-de-privacidad',
});

export default function AvisoDePrivacidad() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Aviso de privacidad integral"
        entradilla="Este aviso se emite conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su reglamento. Describe qué datos tratamos, con qué finalidad y cómo puedes ejercer tus derechos."
        actualizado={formatearFechaLarga(REVISION_VIGENTE)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <Nota tono="info" titulo="Qué tan lejos llega este tratamiento">
          <p>
            Este sitio recaba muy pocos datos personales: el correo del boletín y lo que escribes
            en el formulario de contacto. Nada más. Los resultados de las calculadoras y del
            cuestionario se procesan en tu navegador y no se envían a ningún servidor.
          </p>
        </Nota>

        <div className="prosa mt-10">
          <h2>1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de tus datos personales es el equipo que opera{' '}
            <strong>LeyAntilavado.org</strong>, plataforma privada e independiente.
          </p>
          <p>
            El canal para cualquier asunto relacionado con tus datos personales —incluido el
            ejercicio de tus derechos de acceso, rectificación, cancelación y oposición— es el{' '}
            <Link href="/contacto">formulario de contacto</Link>, eligiendo el motivo «Ejercer mis
            derechos ARCO». Cada solicitud recibe un folio con el que puedes darle seguimiento.
          </p>

          <h2>2. Datos personales que tratamos</h2>
          <p>Sólo tratamos los datos que tú nos proporcionas de forma directa:</p>
          <ul>
            <li>
              <strong>Correo electrónico</strong>, cuando te suscribes al boletín de cambios
              normativos.
            </li>
            <li>
              <strong>Actividad vulnerable de interés</strong>, si eliges indicarla al
              suscribirte. Es opcional.
            </li>
            <li>
              <strong>Datos de contacto y credenciales profesionales</strong>, únicamente si
              solicitas un perfil en el directorio profesional.
            </li>
          </ul>
          <p>
            <strong>No tratamos datos personales sensibles</strong> ni datos financieros o
            patrimoniales a través de este sitio.
          </p>

          <h3>Lo que capturas en las herramientas</h3>
          <p>
            Los montos, fechas y respuestas que escribes en las calculadoras y en el cuestionario
            se procesan para devolverte un resultado y <strong>no se asocian a tu identidad</strong>.
            Las páginas de resultados llevan la instrucción de no indexación, de modo que nada de
            lo que capturas puede aparecer en un buscador.
          </p>

          <h2>3. Finalidades del tratamiento</h2>
          <p>
            <strong>Finalidades primarias</strong>, necesarias para la relación que solicitas:
          </p>
          <ul>
            <li>Enviarte el boletín de cambios normativos al que te suscribiste.</li>
            <li>Atender tus solicitudes de corrección, contacto o alta en el directorio.</li>
            <li>
              Publicar y mantener tu perfil profesional, si lo solicitaste, con el nivel de
              verificación que corresponda.
            </li>
          </ul>
          <p>
            <strong>Finalidades secundarias</strong>, que no son necesarias y a las que puedes
            oponerte sin que ello afecte lo anterior:
          </p>
          <ul>
            <li>Medir de forma agregada qué contenidos y herramientas resultan más útiles.</li>
            <li>
              Invitarte a nuevas funciones del sitio o del área privada de cumplimiento.
            </li>
          </ul>
          <p>
            Para oponerte a las finalidades secundarias basta con que nos lo digas por el mismo
            medio por el que te suscribiste.
          </p>

          <h2>4. Fundamento y consentimiento</h2>
          <p>
            El tratamiento del correo electrónico se realiza con tu <strong>consentimiento
            expreso</strong>: la casilla del formulario no viene marcada y sin marcarla el envío
            se rechaza. Conservamos el texto exacto del consentimiento que aceptaste y la fecha en
            que lo hiciste.
          </p>

          <h2>5. Transferencias</h2>
          <p>
            <strong>No vendemos, alquilamos ni cedemos tus datos personales a terceros con fines
            comerciales.</strong>
          </p>
          <p>
            Sí utilizamos proveedores que actúan como encargados y que tratan los datos por
            nuestra cuenta y bajo nuestras instrucciones —alojamiento del sitio, base de datos y,
            en su momento, envío de correo—. Un encargado no es un tercero receptor: no puede usar
            los datos para fines propios.
          </p>
          <p>
            Sólo se realizarán transferencias sin tu consentimiento en los casos previstos por la
            ley, por ejemplo cuando sean requeridas por autoridad competente en ejercicio de sus
            atribuciones.
          </p>
          <p>
            Si solicitas un perfil en el directorio, los datos que decidas hacer públicos en ese
            perfil serán, por definición, visibles para cualquier persona que visite el sitio.
          </p>

          <h2>6. Derechos ARCO</h2>
          <p>Tienes derecho a:</p>
          <ul>
            <li>
              <strong>Acceso:</strong> saber qué datos tuyos tenemos y para qué los usamos.
            </li>
            <li>
              <strong>Rectificación:</strong> corregirlos cuando sean inexactos o estén
              incompletos.
            </li>
            <li>
              <strong>Cancelación:</strong> pedir que los eliminemos cuando consideres que no se
              requieren para las finalidades señaladas.
            </li>
            <li>
              <strong>Oposición:</strong> oponerte al tratamiento para fines determinados.
            </li>
          </ul>
          <p>
            También puedes <strong>revocar tu consentimiento</strong> en cualquier momento. En el
            caso del boletín, cada correo incluye un enlace de baja y la baja surte efecto sin que
            tengas que dar explicaciones.
          </p>

          <h3>Cómo ejercerlos</h3>
          <p>
            Envía tu solicitud desde el <Link href="/contacto">formulario de contacto</Link>,
            eligiendo el motivo «Ejercer mis derechos ARCO», e incluye:
          </p>
          <ol>
            <li>Tu nombre y un medio para comunicarte la respuesta.</li>
            <li>
              Un documento que acredite tu identidad, o la personalidad de tu representante.
            </li>
            <li>La descripción clara de los datos y del derecho que deseas ejercer.</li>
            <li>Cualquier elemento que ayude a localizar los datos.</li>
          </ol>
          <p>
            Responderemos en los plazos previstos por la ley aplicable. Si la respuesta no te
            satisface, puedes presentar una inconformidad ante la autoridad garante en materia de
            protección de datos personales que resulte competente conforme al régimen vigente en
            México.
          </p>

          <h2>7. Conservación</h2>
          <p>
            El correo del boletín se conserva mientras dure tu suscripción y hasta doce meses
            después de la baja, únicamente para acreditar que la solicitaste y que se atendió. Los datos de un perfil del
            directorio se conservan mientras el perfil esté publicado.
          </p>
          <p>
            Los plazos de conservación de diez años que menciona este sitio corresponden a las
            obligaciones de la LFPIORPI para los sujetos obligados. <strong>No aplican a tus
            datos como visitante</strong>: son dos cosas distintas y conviene no confundirlas.
          </p>

          <h2>8. Seguridad</h2>
          <p>
            Aplicamos medidas administrativas, técnicas y físicas razonables para proteger los
            datos frente a pérdida, uso indebido o acceso no autorizado. El sitio se sirve
            íntegramente sobre conexión cifrada. Ninguna medida elimina el riesgo por completo, y
            no vamos a prometerte que sí.
          </p>

          <h2>9. Cookies y tecnologías similares</h2>
          <p>
            El detalle está en la <Link href="/legal/cookies">política de cookies</Link>. En
            resumen: el sitio funciona sin cookies de seguimiento publicitario y guarda tu
            preferencia de tema claro u oscuro en el almacenamiento local de tu navegador, que no
            viaja a nuestros servidores.
          </p>

          <h2>10. Cambios a este aviso</h2>
          <p>
            Cualquier modificación se publicará en esta misma página con su fecha. Si el cambio
            afecta de forma sustancial las finalidades del tratamiento, te lo comunicaremos por el
            medio de contacto que nos hayas proporcionado.
          </p>
        </div>

        <AvisoIndependencia className="mt-10" />
      </div>
    </>
  );
}
