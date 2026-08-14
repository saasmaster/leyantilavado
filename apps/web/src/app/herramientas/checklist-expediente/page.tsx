import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { ChecklistExpediente } from './ChecklistExpediente';

export const metadata: Metadata = construirMetadata({
  titulo: 'Checklist de expediente de identificación (KYC)',
  descripcion:
    'Verificación del expediente único de identificación para persona física, moral y fideicomiso, con la evidencia que un auditor espera de cada punto.',
  ruta: '/herramientas/checklist-expediente',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="checklist-expediente"
      titulo="Checklist de expediente"
      entradilla="El expediente único de identificación, punto por punto y por tipo de cliente, con la evidencia que se espera de cada uno y el avance de lo que ya tienes."
      tambienVer={['beneficiario-controlador', 'clasificacion-clientes']}
      lecturas={[
        { href: '/obligaciones/expedientes', etiqueta: 'La obligación de integrar expedientes' },
        { href: '/obligaciones/identificacion-cliente', etiqueta: 'Identificación del cliente' },
        { href: '/plantillas', etiqueta: 'Plantillas de expediente' },
      ]}
      introduccion={
        <>
          <p>
            El expediente único de identificación es lo primero que pide un verificador y lo último
            que la mayoría termina de armar. No basta con tener copia de una credencial: la
            obligación incluye verificar la identidad, documentar la actividad u ocupación, obtener
            por escrito si el cliente actúa por cuenta propia o de un tercero, identificar al
            beneficiario controlador y mantener todo actualizado y disponible.
          </p>
          <p>
            La lista cambia según con quién estés tratando. Una persona física necesita
            identificación, CURP y comprobante de domicilio; una persona moral necesita además acta
            constitutiva, poder del representante y la cadena de propiedad completa; un fideicomiso
            necesita el contrato y la identificación de todas las partes.
          </p>
          <p>
            Aquí eliges el tipo de cliente y marcas lo que ya tienes. El avance excluye lo que
            marques como no aplicable, y los puntos críticos pendientes se listan aparte, porque son
            los que convierten una revisión rutinaria en una observación.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            La primera sección se <strong>deriva del catálogo de obligaciones</strong> del motor:
            cada paso con su evidencia esperada, citada desde la disposición correspondiente. Si el
            corpus legal cambia, la lista cambia sola.
          </p>
          <p>
            Las secciones de documentos por tipo de cliente son{' '}
            <strong>propuesta editorial</strong>. La enumeración literal por tipo de persona está en
            el Reglamento y en las Disposiciones de Carácter General, que todavía no forman parte de
            nuestro corpus verificado, así que no las presentamos como texto legal citado sino como
            lo que un expediente suele integrar. Lo decimos en la página en lugar de disimularlo.
          </p>
          <p>
            El avance se calcula sobre los puntos <strong>aplicables</strong>: lo que marcas como “no
            aplica” sale del denominador. Un despacho que no atiende fideicomisos no debería salir
            castigado por no tener esa documentación.
          </p>
          <p>
            Los puntos marcados como críticos son aquellos cuya ausencia deja el expediente sin
            sustento: la identificación oficial, la manifestación sobre actuar por cuenta propia, el
            poder del representante y el beneficiario controlador.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Agencia automotriz que vende a una empresa constructora.</strong> Selecciona{' '}
            <em>persona moral</em>. El expediente tiene:
          </p>
          <ul>
            <li>Acta constitutiva — listo.</li>
            <li>Constancia de situación fiscal — listo.</li>
            <li>Comprobante de domicilio — listo.</li>
            <li>Poder e identificación del representante — listo.</li>
            <li>
              Estructura accionaria hasta personas físicas —{' '}
              <strong>pendiente y marcado como crítico</strong>.
            </li>
            <li>
              Manifestación del beneficiario controlador —{' '}
              <strong>pendiente y marcado como crítico</strong>.
            </li>
          </ul>
          <p>
            El avance sale en torno al <strong>70%</strong>, que a primera vista suena bien. Pero los
            dos puntos que faltan son justo los críticos, y aparecen destacados arriba de la lista.
            Un expediente con acta y poder pero sin beneficiario controlador es exactamente el que
            genera observación en una visita de verificación.
          </p>
          <p>
            Si además el cliente hubiera quedado en riesgo alto, al marcar la casilla se agregan
            cuatro puntos más de debida diligencia reforzada y el avance vuelve a bajar. Eso es
            correcto: el estándar aplicable subió.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Esta lista es la que exige literalmente la ley?',
          respuesta:
            'La primera sección sí: se deriva del catálogo de obligaciones con su fuente citada. Las secciones de documentos por tipo de cliente son propuesta editorial, porque la enumeración literal vive en el Reglamento y en las Disposiciones de Carácter General y aún no están en nuestro corpus verificado. Contrástalas antes de darlas por definitivas.',
        },
        {
          pregunta: '¿Cada cuándo hay que actualizar el expediente?',
          respuesta:
            'Cuando cambien las circunstancias del cliente, y con revisión periódica documentada. Lo que un auditor mira no es sólo el documento sino la bitácora: fecha de cada actualización y quién la hizo.',
        },
        {
          pregunta: '¿Cuánto tiempo hay que conservarlo?',
          respuesta:
            'Diez años. Y no basta con guardarlo: hay que poder recuperarlo, controlar quién accede y registrar las consultas. Conviene documentar desde cuándo se cuenta el plazo en cada caso.',
        },
        {
          pregunta: '¿Qué pasa si el cliente no me da un documento?',
          respuesta:
            'Se documenta la solicitud, la negativa y la decisión que tomaste al respecto. Un hueco registrado con su análisis es una posición defendible; un hueco silencioso, no.',
        },
        {
          pregunta: '¿Se guarda lo que marco?',
          respuesta:
            'Sólo si usas el botón de guardar, y en ese caso queda en el almacenamiento local de tu propio navegador. Nada se envía a un servidor. Puedes exportar la lista en CSV para pegarla a tu expediente interno.',
        },
      ]}
    >
      <ChecklistExpediente />
    </MarcoHerramienta>
  );
}
