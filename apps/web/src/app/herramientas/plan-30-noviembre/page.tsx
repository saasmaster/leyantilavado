import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { Plan } from './Plan';

export const metadata: Metadata = construirMetadata({
  titulo: 'Plan personalizado hacia el 30 de noviembre de 2026',
  descripcion:
    'Elige tu actividad vulnerable y si ya estás en el padrón, y obtén la línea de tiempo del Acuerdo 115/2026 que te aplica: qué tener listo, para cuándo y con qué fundamento.',
  ruta: '/herramientas/plan-30-noviembre',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="plan-30-noviembre"
      titulo="Plan hacia el 30 de noviembre de 2026"
      entradilla="El Acuerdo 115/2026 entra en vigor el 30 de noviembre y escalona lo demás hasta 2029. Dime tu actividad y si ya estás en el padrón, y te devuelvo los hitos que te tocan, en orden, con lo que hay que tener en cada uno y el artículo del que sale la fecha."
      tambienVer={['plan-cumplimiento', 'preparacion-auditoria', 'mecanismos-automatizados']}
      lecturas={[
        { href: '/acuerdo-115-2026', etiqueta: 'Qué cambia el Acuerdo 115/2026' },
        { href: '/calendario-cumplimiento', etiqueta: 'El calendario completo, sin personalizar' },
        { href: '/obligaciones', etiqueta: 'Las obligaciones, una por una' },
      ]}
      introduccion={
        <>
          <p>
            La pregunta que se hace hoy cualquier sujeto obligado no es qué dice el Acuerdo: es{' '}
            <strong>qué tengo que tener listo y para cuándo</strong>. El texto publicado responde
            eso, pero repartido entre artículos transitorios que hablan de plazos en meses, de
            ejercicios completos y del último día hábil de un mes. Puesto en fila, deja de parecer un
            muro.
          </p>
          <p>
            Esta herramienta arma esa fila. No inventa un plan de proyecto ni te asigna
            responsables: toma los hitos que el propio Acuerdo fija, descarta los que no van con tu
            actividad, y para cada uno te dice qué obligación se vuelve exigible, qué pasos y qué
            evidencia se esperan, y de qué disposición sale la fecha.
          </p>
          <p>
            Conviene decir de entrada lo que no hace, porque es la mitad del valor: no te dice que
            cumplas. Nadie puede decírtelo desde una pantalla. Te dice qué te tocaría preparar, con
            el fundamento a la vista para que lo contrastes o se lo lleves a quien te asesora.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>La lógica es corta a propósito:</p>
          <ol>
            <li>
              Se toman <strong>todos los hitos del calendario</strong> registrados en el motor, con
              su fecha, su descripción y su fundamento. Ninguna fecha está escrita en esta página:
              todas salen del corpus versionado, así que si el DOF corrige un transitorio, la
              herramienta se mueve sola.
            </li>
            <li>
              Se descartan los hitos que están dirigidos a <strong>una actividad concreta</strong> y
              no es la tuya. Conviene ser claro: el Acuerdo casi no escalona por actividad, así que
              este filtro quita poco. Preferimos decirlo a fingir que la personalización es mayor de
              lo que es.
            </li>
            <li>
              Si contestas que <strong>todavía no estás en el padrón</strong>, se antepone un bloque
              sin fecha con el alta y la designación del representante. Van sin fecha a propósito:
              esas obligaciones no esperan al 30 de noviembre, corren desde que realizas la
              actividad, y ponerles un día sería inventarlo.
            </li>
            <li>
              Cada hito se cruza con el <strong>catálogo de obligaciones</strong> para listar qué hay
              que tener: los pasos y la evidencia que un auditor esperaría ver. Cuando un hito no
              tiene obligación asociada en el catálogo, se dice y no se listan entregables.
            </li>
            <li>
              La cuenta regresiva se calcula <strong>en tu navegador</strong>, contra la fecha de
              entrada en vigor que trae el propio calendario, después de que la página carga. Por eso
              aparece un instante más tarde que el resto.
            </li>
          </ol>
          <p>
            Las fechas se muestran <strong>nominales</strong>: no se recorren por sábados, domingos
            ni días inhábiles. Donde la norma habla de último día hábil, el hito lo advierte, porque
            esa fecha depende del calendario oficial del año y hay que confirmarla antes de usarla
            como límite operativo. Y los hitos cuya fecha se obtuvo de un plazo en meses —no de una
            fecha publicada— van marcados como cálculo sin confirmar.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Inmobiliaria que arranca sin alta en el padrón.</strong> Elige su fracción y
            contesta que todavía no está registrada. Esto es lo que ve:
          </p>
          <ul>
            <li>
              <strong>Antes del calendario, sin fecha:</strong> alta en el padrón y acceso al SPPLD,
              y designación del representante encargado del cumplimiento. No cuelgan del Acuerdo:
              cuelgan del artículo 18 y del 20, y ya corren.
            </li>
            <li>
              <strong>30 de noviembre de 2026:</strong> entra en vigor el Acuerdo. Ese día el manual
              de políticas y procedimientos y el enfoque basado en riesgos dejan de ser un proyecto.
            </li>
            <li>
              <strong>Ejercicio 2027 completo:</strong> primer periodo anual de capacitación. No es
              una fecha límite, es una ventana: la evidencia de asistencia y evaluación tiene que
              quedar fechada dentro de ella.
            </li>
            <li>
              <strong>1 de marzo de 2027:</strong> la metodología de riesgos debe estar disponible
              para la autoridad y alimentada con datos del año anterior. Aquí entran también
              clasificación de clientes, expedientes y beneficiario controlador. Es el hito con más
              carga de todo el calendario.
            </li>
            <li>
              <strong>1 de junio de 2027:</strong> los mecanismos automatizados operando —umbrales,
              acumulación, alertas y trazabilidad de las decisiones—, no comprados.
            </li>
            <li>
              <strong>Ejercicio 2028 y marzo de 2029:</strong> primer periodo de auditoría anual y
              entrega del primer dictamen. La herramienta advierte que la fecha del dictamen depende
              del calendario de días inhábiles de ese año.
            </li>
          </ul>
          <p>
            Lectura práctica: lo que parece un plazo largo no lo es. El hito de marzo de 2027 exige
            datos del año anterior, así que la recolección tiene que empezar antes de que el Acuerdo
            entre en vigor, no después.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿En qué se diferencia esto del plan de cumplimiento?',
          respuesta:
            'El plan de cumplimiento arma tu ciclo operativo completo a partir de una fecha de inicio: avisos mensuales, revisiones semestrales, todo mezclado con propuestas nuestras de calendario. Esta herramienta hace lo contrario: se limita a los hitos que el Acuerdo 115/2026 fija por sí mismo, sin agregar ninguna fecha sugerida por nosotros. Si lo que quieres es saber qué pide la norma y cuándo, es esta; si quieres tu agenda de trabajo, es la otra.',
        },
        {
          pregunta: '¿Por qué casi todos los hitos me salen igual sin importar la actividad?',
          respuesta:
            'Porque así está escrito el Acuerdo. Los plazos escalonados se fijan por tipo de obligación —manual, riesgos, mecanismos automatizados, auditoría—, no por fracción del artículo 17. Lo que sí cambia por actividad son los umbrales y las reglas de aviso, y eso se resuelve en la calculadora de umbrales. Preferimos decirlo que simular una personalización que no existe.',
        },
        {
          pregunta: '¿Por qué algunos hitos aparecen marcados como fecha sin confirmar?',
          respuesta:
            'Porque el texto oficial fija esos plazos en meses contados desde la entrada en vigor, no como una fecha de calendario. La fecha que ves es la conversión aritmética de ese plazo y sirve para ordenar la línea de tiempo, pero no es una fecha publicada. Antes de usarla como límite operativo hay que confirmarla contra el transitorio aplicable.',
        },
        {
          pregunta: '¿Y los avisos de operaciones inusuales en 24 horas?',
          respuesta:
            'Aparecen aparte, sin fecha. La obligación existe en la norma, pero su exigibilidad corre a partir de seis meses después de que la UIF publique la resolución con los formatos oficiales, y esa resolución no aparece publicada. No le ponemos cuenta regresiva porque sería inventarla.',
        },
        {
          pregunta: '¿Terminar todos los hitos significa que estoy en cumplimiento?',
          respuesta:
            'No. Esta línea de tiempo cubre lo que el Acuerdo 115/2026 hace exigible y cuándo. Tus obligaciones permanentes —identificar, integrar expedientes, avisar en plazo, presentar informes en ceros, conservar diez años— corren aparte y no dependen de este calendario. Ninguna herramienta puede certificar cumplimiento.',
        },
        {
          pregunta: '¿Se guarda lo que capturo?',
          respuesta:
            'No. Todo se resuelve en tu navegador. El enlace que puedes copiar lleva únicamente la actividad, el inciso y si dijiste que ya estás en el padrón; el botón de guardar escribe en el almacenamiento local de tu propio equipo y no sale de ahí.',
        },
      ]}
    >
      <Plan />
    </MarcoHerramienta>
  );
}
