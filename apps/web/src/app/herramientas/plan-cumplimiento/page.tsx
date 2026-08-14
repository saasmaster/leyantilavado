import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { PlanCumplimiento } from './PlanCumplimiento';

export const metadata: Metadata = construirMetadata({
  titulo: 'Plan de cumplimiento con fechas',
  descripcion:
    'Genera un plan fechado desde tu actividad y fecha de inicio: arranque, ciclo mensual de avisos y calendario del Acuerdo 115/2026. Exporta .ics y CSV.',
  ruta: '/herramientas/plan-cumplimiento',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="plan-cumplimiento"
      titulo="Plan de cumplimiento"
      entradilla="Convierte el catálogo de obligaciones en una lista con fechas, separando con claridad las que publica la norma de las que proponemos nosotros."
      tambienVer={['preparacion-auditoria', 'capacitacion-anual']}
      lecturas={[
        { href: '/obligaciones', etiqueta: 'Catálogo completo de obligaciones' },
        { href: '/calendario-cumplimiento', etiqueta: 'Calendario 2026-2029' },
        { href: '/acuerdo-115-2026', etiqueta: 'Qué introdujo el Acuerdo 115/2026' },
      ]}
      introduccion={
        <>
          <p>
            Una lista de obligaciones sin fechas no se ejecuta. Este generador toma el catálogo
            completo, le pone calendario y lo ordena cronológicamente para que puedas repartir
            responsables en lugar de mirar veinte tareas simultáneas.
          </p>
          <p>
            El plan sale en cuatro bloques. <strong>Arranque</strong>: lo que se hace una sola vez y
            debería estar antes de la primera operación. <strong>Ciclo mensual</strong>: las
            próximas seis fechas del día 17, incluyendo los meses sin operaciones, porque el informe
            en ceros también se presenta. <strong>Ciclo recurrente</strong>: lo semestral y lo anual.
            Y <strong>calendario normativo</strong>: las fechas escalonadas del Acuerdo 115/2026 que
            corren de 2026 a 2029.
          </p>
          <p>
            Cada renglón dice de dónde viene su fecha. Es la parte que más nos importa: mezclar una
            fecha publicada en el Diario Oficial con una sugerencia de gestión sería cómodo para la
            tabla y peligroso para ti.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            <strong>Arranque.</strong> Se toman las obligaciones marcadas como de recurrencia única
            en el corpus y se les propone una fecha objetivo a un mes de tu fecha de inicio. Es una{' '}
            <strong>propuesta operativa</strong>: la ley dice que hay que darse de alta y designar
            representante, no en qué día concreto.
          </p>
          <p>
            <strong>Ciclo mensual.</strong> Aquí la fecha sí es legal: el día 17 del mes siguiente
            al de las operaciones. Se calculan las próximas seis a partir de tu fecha de inicio, con
            la nota de que un mes sin operaciones reportables también se reporta.
          </p>
          <p>
            <strong>Ciclo recurrente.</strong> Cada obligación semestral o anual se proyecta a su
            periodicidad contada desde la fecha de inicio, respetando el fin de mes. También son
            propuestas: la norma fija la periodicidad, no el día.
          </p>
          <p>
            <strong>Calendario normativo.</strong> Se filtran los hitos del Acuerdo 115/2026
            posteriores a tu fecha de inicio. Los que el texto oficial fija como fecha calendario
            aparecen como publicados; los que sólo dan un plazo en meses aparecen como cálculo
            nuestro, porque eso es lo que son.
          </p>
          <p>
            El archivo .ics genera un evento de día completo por hito, con recordatorio tres días
            antes, y arrastra en la descripción si la fecha es publicada o propuesta.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Arrendador de locales comerciales que se da de alta el 1 de septiembre de
            2026.</strong> El plan que sale:
          </p>
          <ul>
            <li>
              <strong>1 de octubre de 2026</strong> (propuesta): alta en el portal SPPLD con e.firma
              y designación del representante encargado del cumplimiento.
            </li>
            <li>
              <strong>17 de octubre de 2026</strong> (publicada): aviso o informe en ceros del
              periodo 2026-09. Y así el 17 de cada mes.
            </li>
            <li>
              <strong>30 de noviembre de 2026</strong> (publicada): entra en vigor el Acuerdo
              115/2026.
            </li>
            <li>
              <strong>1 de marzo de 2027</strong> (propuesta): primera revisión semestral de
              expedientes, perfil transaccional y clasificación de clientes.
            </li>
            <li>
              <strong>1 de marzo de 2027</strong> (publicada): metodología de riesgos disponible
              para la autoridad, manual actualizado y reglas de clasificación y beneficiario
              controlador exigibles.
            </li>
            <li>
              <strong>1 de junio de 2027</strong> (publicada): mecanismos automatizados en
              operación.
            </li>
            <li>
              <strong>Ejercicio 2028</strong> (publicada): primer periodo sujeto a auditoría anual,
              con dictamen en marzo de 2029.
            </li>
          </ul>
          <p>
            La coincidencia del 1 de marzo de 2027 no es casual y conviene verla: ese día se juntan
            una fecha exigible y una revisión interna que conviene tener lista antes. Un plan que
            mezcla ambos tipos de fecha no deja ver esa diferencia.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Las fechas de arranque son plazos legales?',
          respuesta:
            'No, y por eso están marcadas como propuesta nuestra. La ley establece que esas obligaciones existen, no en qué día del calendario las cumples. Ajústalas a tu operación: lo importante es que estén antes de tu primera operación reportable.',
        },
        {
          pregunta: '¿Por qué aparecen avisos en meses en los que no voy a operar?',
          respuesta:
            'Porque el informe en ceros se presenta igual. La obligación mensual nace del alta en el padrón, no de haber tenido operaciones. Es una de las causas más frecuentes de multa por extemporaneidad.',
        },
        {
          pregunta: '¿Qué pasa con las fechas del calendario que no están confirmadas?',
          respuesta:
            'Aparecen marcadas. Varios transitorios del Acuerdo 115/2026 fijan plazos en meses en lugar de fechas calendario, así que la fecha que ves es un cálculo nuestro y debe confirmarse contra el transitorio aplicable antes de usarla como plazo operativo.',
        },
        {
          pregunta: '¿El plan cambia según mi actividad?',
          respuesta:
            'Las obligaciones estructurales son las mismas para todas las actividades vulnerables. Lo que cambia son los umbrales que vigilas y, con ellos, cuántos avisos acabas presentando. Por eso la actividad es opcional en este generador.',
        },
        {
          pregunta: '¿Puedo meterlo a mi calendario?',
          respuesta:
            'Sí. El botón de .ics genera un archivo con todos los hitos y un recordatorio tres días antes de cada uno. Se construye en tu navegador y no pasa por ningún servidor.',
        },
      ]}
    >
      <PlanCumplimiento />
    </MarcoHerramienta>
  );
}
