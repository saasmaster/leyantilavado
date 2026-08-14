import type { Metadata } from 'next';
import { Nota } from '@leyantilavado/ui';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { Checklist } from '@/components/herramientas/Checklist';
import { seccionesCapacitacion } from '@/lib/herramientas/checklists';

export const metadata: Metadata = construirMetadata({
  titulo: 'Checklist de capacitación anual en PLD',
  descripcion:
    'Controla el periodo anual de capacitación: alcance del personal, temario, asistencia, evaluación y constancias, con la evidencia que pide la norma.',
  ruta: '/herramientas/capacitacion-anual',
});

const HITO = datos.CALENDARIO.find((h) => h.id === 'capacitacion-2027');

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="capacitacion-anual"
      titulo="Capacitación anual"
      entradilla="La capacitación se acredita con evidencia, no con buena voluntad. Esta lista cubre el periodo completo: a quién alcanza, qué se impartió, quién asistió y quién entendió."
      tambienVer={['preparacion-auditoria', 'plan-cumplimiento']}
      lecturas={[
        { href: '/obligaciones/capacitacion', etiqueta: 'La obligación de capacitar' },
        { href: '/cursos', etiqueta: 'Cursos y capacitación disponibles' },
        { href: '/calendario-cumplimiento', etiqueta: 'El primer periodo anual' },
      ]}
      introduccion={
        <>
          <p>
            El personal involucrado en las funciones de cumplimiento debe recibir capacitación al
            menos una vez al año, con evidencia de asistencia y de evaluación.
            {HITO ? (
              <>
                {' '}
                El primer periodo anual bajo las nuevas reglas es{' '}
                <strong>
                  {formatearFechaLarga(HITO.fecha)}
                  {HITO.fechaFin ? ` al ${formatearFechaLarga(HITO.fechaFin)}` : ''}
                </strong>
                : el ejercicio completo, no una sesión suelta en diciembre.
              </>
            ) : null}
          </p>
          <p>
            En una verificación la pregunta nunca es “¿capacitaron?”. Es “enséñeme la lista de
            asistencia, el temario, los resultados de la evaluación y la constancia de quien entró en
            julio”. Esa última parte es la que más se cae: el personal de nuevo ingreso.
          </p>
          <p>
            Esta lista separa lo que pide la norma de lo que un auditor espera encontrar en el
            temario, y controla la evidencia del periodo pieza por pieza.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            La primera sección se <strong>deriva del catálogo de obligaciones</strong> del motor,
            con la evidencia registrada para cada paso.
          </p>
          <p>
            La sección de contenido del programa es <strong>propuesta editorial</strong>: la norma no
            publica un temario obligatorio, así que no inventamos uno con apariencia legal. Lo que
            listamos son los temas que un auditor razonablemente espera en una capacitación de PLD
            que sirva para el puesto: el marco aplicable a tu actividad concreta, tus umbrales con
            ejemplos numéricos, los límites de efectivo, la detección y escalamiento de operaciones
            inusuales y el armado del expediente.
          </p>
          <p>
            La sección de evidencia marca como críticos los cuatro puntos que efectivamente se piden
            en una revisión: el alcance definido del personal, la asistencia verificable, la
            evaluación de comprensión y las constancias resguardadas.
          </p>
          <p>
            El puntaje refleja el avance sobre los puntos aplicables. Lo que marques como no
            aplicable —por ejemplo, una remediación que no hizo falta— sale del denominador.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Inmobiliaria con doce empleados.</strong> En marzo dio una sesión de dos horas a
            todo el equipo comercial. Al recorrer la lista:
          </p>
          <ul>
            <li>Temario definido y material del curso — listo.</li>
            <li>Lista de asistencia firmada de la sesión de marzo — listo.</li>
            <li>
              Evaluación de comprensión — <strong>pendiente, crítico</strong>. Se dio la charla pero
              nadie contestó nada.
            </li>
            <li>
              Personal de nuevo ingreso — <strong>pendiente, crítico</strong>. Entraron dos
              vendedores en agosto y no se les capacitó.
            </li>
            <li>Constancias emitidas — pendiente.</li>
          </ul>
          <p>
            El avance ronda el <strong>40%</strong>. Y el diagnóstico es incómodo pero útil: la
            capacitación existió, pero <em>como evidencia</em> apenas cuenta. Con una evaluación
            escrita de diez preguntas, las constancias y una sesión de inducción para los dos
            vendedores nuevos, la misma inmobiliaria pasa del 40 al 100% en una tarde de trabajo
            administrativo.
          </p>
          <p>
            Ese es el patrón que más se repite: no falta la capacitación, falta el papel que la
            acredita.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Cada cuándo hay que capacitar?',
          respuesta:
            'Al menos una vez al año. El periodo se cuenta por ejercicio completo, así que la evidencia de asistencia y de evaluación debe quedar documentada dentro de ese año, no acumularse para el siguiente.',
        },
        {
          pregunta: '¿A quién alcanza la obligación?',
          respuesta:
            'Al personal involucrado en las funciones de cumplimiento. Conviene definir por escrito qué puestos quedan alcanzados y por qué: esa matriz es lo primero que se pide, y es donde suele olvidarse el personal de nuevo ingreso.',
        },
        {
          pregunta: '¿Sirve un curso en línea de un tercero?',
          respuesta:
            'Sí, siempre que puedas acreditar asistencia, evaluación y constancia, y que el contenido corresponda a tu actividad vulnerable concreta. Un curso genérico de PLD sin relación con tus umbrales es más difícil de defender.',
        },
        {
          pregunta: '¿Qué pasa si alguien no aprueba la evaluación?',
          respuesta:
            'Se reprograma y se documenta la reprogramación. Una evaluación reprobada con seguimiento registrado es evidencia de que el control funciona; una evaluación reprobada sin seguimiento es un hallazgo.',
        },
        {
          pregunta: '¿Cuánto tiempo se conservan las constancias?',
          respuesta:
            'Por el plazo aplicable a la conservación de la información del programa de cumplimiento. En la práctica conviene alinearlas al plazo de diez años del resto de la documentación para no llevar dos criterios distintos.',
        },
      ]}
    >
      <Checklist
        secciones={seccionesCapacitacion()}
        claveGuardado="capacitacion-anual"
        nombreArchivo="capacitacion-anual"
        tituloImpresion="Checklist del periodo anual de capacitación"
        etiquetaPuntaje="Evidencia del periodo"
        encabezado={
          <Nota tono="info" titulo="El temario es sugerencia, la evidencia no">
            <p>
              La norma no publica una lista de temas obligatorios, así que la sección de contenido es
              propuesta editorial. La sección de evidencia sí recoge lo que se pide en una revisión:
              alcance definido, asistencia verificable, evaluación de comprensión y constancias
              resguardadas.
            </p>
          </Nota>
        }
      />
    </MarcoHerramienta>
  );
}
