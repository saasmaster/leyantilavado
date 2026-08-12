import type { Metadata } from 'next';
import { Nota } from '@leyantilavado/ui';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { Checklist } from '@/components/herramientas/Checklist';
import { seccionesAuditoria } from '@/lib/herramientas/checklists';

export const metadata: Metadata = construirMetadata({
  titulo: 'Preparación para la auditoría de cumplimiento',
  descripcion:
    'Autoevaluación contra el catálogo completo de obligaciones de la Ley Antilavado, con la evidencia esperada de cada paso, puntaje de preparación y brechas críticas destacadas.',
  ruta: '/herramientas/preparacion-auditoria',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="preparacion-auditoria"
      titulo="Preparación para auditoría"
      entradilla="Recorre el catálogo completo de obligaciones con la evidencia que se espera de cada una y mide qué tan lejos estás de poder enseñarlo todo."
      actualizadoEn="2026-08-11"
      tambienVer={['plan-cumplimiento', 'mecanismos-automatizados']}
      lecturas={[
        { href: '/obligaciones/auditoria-anual', etiqueta: 'La auditoría anual' },
        { href: '/obligaciones/dictamen', etiqueta: 'El dictamen y sus plazos' },
        { href: '/calendario-cumplimiento', etiqueta: 'Cuándo empieza el primer periodo' },
      ]}
      introduccion={
        <>
          <p>
            El programa de cumplimiento debe someterse a una auditoría anual. Puede ser interna
            cuando el riesgo de la organización es bajo o medio, y es obligatoriamente externa
            cuando es alto. El primer periodo sujeto a auditoría es el ejercicio{' '}
            <strong>2028</strong> completo, y el primer dictamen se entrega en marzo de 2029. Suena
            lejos hasta que recuerdas que se audita lo que hiciste durante todo el año, no lo que
            armaste en diciembre.
          </p>
          <p>
            La diferencia entre pasar bien o mal una auditoría casi nunca es haber hecho las cosas:
            es <strong>poder demostrarlo</strong>. Por eso esta lista no pregunta “¿capacitas a tu
            personal?” sino “¿tienes lista de asistencia y resultados de evaluación?”. Cada punto
            trae la evidencia que un auditor va a pedir.
          </p>
          <p>
            El recorrido completo son varias decenas de puntos agrupados por categoría. Marca lo que
            ya tienes, descarta lo que no te aplica y anota dónde está cada cosa: el archivo que
            exportes al final es, literalmente, el índice de tu carpeta de auditoría.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            La lista se <strong>genera desde el catálogo de obligaciones</strong> del motor. Cada
            obligación aporta sus pasos y la evidencia registrada para cada uno, y se agrupan por
            categoría: registro, identificación, expedientes, avisos, riesgos, gobierno,
            capacitación, tecnología, auditoría y conservación. Nada está escrito a mano en esta
            página, así que si el corpus legal cambia, la lista cambia con él.
          </p>
          <p>
            El puntaje es el porcentaje de puntos <strong>aplicables</strong> que marcaste como
            listos. Lo que declares “no aplica” sale del denominador, para que una figura que no te
            corresponde no te penalice.
          </p>
          <p>
            Los puntos de las categorías de registro, identificación, expedientes y avisos se marcan
            como <strong>críticos</strong>: son las obligaciones cuyo incumplimiento tiene sanción
            directa y expresa en la ley. Cuando quedan pendientes se listan aparte, arriba de todo.
          </p>
          <p>
            El porcentaje mide <strong>documentación reunida</strong>, no cumplimiento legal. Llegar
            al cien por ciento significa que juntaste lo que esta lista contempla, no que estás en
            regla: eso sólo lo puede decir una revisión profesional de tu caso.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Casa de empeño con tres sucursales, primera autoevaluación.</strong> Al recorrer
            la lista encuentra:
          </p>
          <ul>
            <li>
              <strong>Registro:</strong> alta en el padrón y acuse resguardado. Cuatro de cinco
              puntos listos.
            </li>
            <li>
              <strong>Identificación y expedientes:</strong> tiene formatos, pero no la
              manifestación escrita sobre actuar por cuenta propia ni la bitácora de actualización.{' '}
              <strong>Dos brechas críticas.</strong>
            </li>
            <li>
              <strong>Avisos:</strong> presenta puntualmente, pero no tiene registro de aprobación
              interna previa al envío. Un punto pendiente.
            </li>
            <li>
              <strong>Riesgos:</strong> no existe metodología documentada. Toda la categoría
              pendiente.
            </li>
            <li>
              <strong>Auditoría:</strong> nada todavía, lo cual es esperable en 2026.
            </li>
          </ul>
          <p>
            El puntaje sale alrededor del <strong>45%</strong>. Lo útil no es el número sino el
            orden: primero las dos brechas críticas de expedientes, que se resuelven con un formato y
            una bitácora en cuestión de días, y luego la metodología de riesgos, que es la que exige
            más trabajo y tiene fecha exigible en marzo de 2027.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿La auditoría tiene que ser externa?',
          respuesta:
            'Depende del nivel de riesgo de la organización. Puede ser interna cuando el riesgo es bajo o medio, y es obligatoriamente externa cuando es alto. Esa es una razón más para tener la matriz de riesgos documentada.',
        },
        {
          pregunta: '¿Cuándo es el primer periodo auditable?',
          respuesta:
            'El ejercicio 2028 completo, con entrega del primer dictamen a más tardar el último día hábil de marzo de 2029. La norma habla de “último día hábil”, así que la fecha exacta depende del calendario oficial de días inhábiles de ese año.',
        },
        {
          pregunta: '¿Un puntaje alto significa que voy a pasar la auditoría?',
          respuesta:
            'No. El puntaje mide qué tanta documentación reuniste de la que esta lista contempla. Un auditor evalúa además la calidad de esa documentación y la coherencia entre lo que dice tu manual y lo que hace tu operación diaria.',
        },
        {
          pregunta: '¿Puedo usar esto como plan de trabajo?',
          respuesta:
            'Sí, y es su mejor uso. Exporta el CSV con el estado y las notas de dónde está cada documento: eso te sirve de índice de la carpeta y de lista de pendientes con responsable. Para fechas, la herramienta de plan de cumplimiento cruza tus obligaciones con el calendario.',
        },
        {
          pregunta: '¿Qué pasa con los hallazgos de la auditoría?',
          respuesta:
            'Se documentan con su severidad y se establece un plan de remediación con responsables y fechas, al que hay que dar seguimiento hasta el cierre de cada hallazgo. El dictamen recoge el resultado y se presenta ante la autoridad en el plazo aplicable.',
        },
      ]}
    >
      <Checklist
        secciones={seccionesAuditoria()}
        claveGuardado="preparacion-auditoria"
        nombreArchivo="preparacion-auditoria"
        tituloImpresion="Autoevaluación de preparación para auditoría"
        etiquetaPuntaje="Preparación"
        encabezado={
          <Nota tono="info" titulo="Marca “no aplica” sin culpa">
            <p>
              Varias obligaciones dependen de la figura jurídica o del tipo de actividad. Si una no
              te corresponde, márcala como no aplicable: sale del denominador y el puntaje refleja tu
              situación real en lugar de castigarte por algo que no te toca.
            </p>
          </Nota>
        }
      />
    </MarcoHerramienta>
  );
}
