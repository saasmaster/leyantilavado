import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { FechaLimite } from './FechaLimite';

export const metadata: Metadata = construirMetadata({
  titulo: 'Fecha límite para presentar el aviso',
  descripcion:
    'Calcula el día 17 aplicable a tus operaciones, los días que te quedan y las próximas seis fechas límite. Exporta recordatorios en .ics.',
  ruta: '/herramientas/fecha-limite-aviso',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="fecha-limite-aviso"
      titulo="Fecha límite del aviso"
      entradilla="El día 17 del mes siguiente parece simple hasta que cae en domingo, hasta que la operación es de diciembre, o hasta que descubres que un mes sin operaciones también se reporta."
      actualizadoEn="2026-08-11"
      tambienVer={['calculadora-multas', 'acumulacion-operaciones']}
      lecturas={[
        { href: '/obligaciones/avisos', etiqueta: 'La obligación de presentar avisos' },
        { href: '/obligaciones/informes-en-ceros', etiqueta: 'Informes en ceros' },
        { href: '/multas', etiqueta: 'Qué cuesta presentarlo tarde' },
      ]}
      introduccion={
        <>
          <p>
            Los avisos de operaciones que alcanzan el umbral se presentan{' '}
            <strong>a más tardar el día 17 del mes siguiente</strong> a aquel en que se realizó la
            operación. La cuenta empieza en el mes de la operación, no en el día en que la
            detectaste ni en el que cerraste tu contabilidad.
          </p>
          <p>
            Hay tres detalles que convierten una regla clara en una multa. El primero: cuando el
            aviso se dispara por acumulación, el periodo que se reporta es el de la operación con la
            que se cruzó el umbral, que puede ser de hace meses. El segundo: el 17 no se recorre
            automáticamente si cae en fin de semana; te lo advertimos, pero no movemos la fecha
            porque no existe una regla oficial registrada que lo autorice. El tercero, y el más
            costoso: <strong>si en el periodo no hubo operaciones reportables, igual hay que
            presentar el informe en ceros</strong>.
          </p>
          <p>
            La herramienta calcula la fecha exacta, los días que quedan y las próximas seis, y te
            deja bajarlas como archivo de calendario para que no dependas de acordarte.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            Se toma el mes de la fecha de la operación, se le suma un mes y se fija el día 17. Una
            operación del 3 de junio y otra del 30 de junio vencen el mismo día: el 17 de julio. Una
            operación del 31 de diciembre vence el 17 de enero del año siguiente.
          </p>
          <p>
            Los días restantes se cuentan contra la fecha de referencia que capturas, no contra el
            reloj del servidor. Eso permite revisar hacia atrás —“¿este aviso de marzo ya estaba
            vencido cuando lo presenté en agosto?”— sin trucos.
          </p>
          <p>
            El estado se clasifica así: <strong>vencido</strong> si la fecha ya pasó,{' '}
            <strong>vence hoy</strong>, <strong>urgente</strong> con tres días o menos,{' '}
            <strong>próximo</strong> con diez o menos, y <strong>con margen</strong> en los demás
            casos.
          </p>
          <p>
            El archivo .ics genera un evento de día completo con un recordatorio tres días antes. Se
            construye en tu navegador y no pasa por ningún servidor.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Joyería que vende una pieza el 28 de junio de 2026</strong> por encima del
            umbral de aviso.
          </p>
          <ul>
            <li>
              Periodo que se reporta: <strong>2026-06</strong>.
            </li>
            <li>
              Fecha límite: <strong>17 de julio de 2026</strong>.
            </li>
            <li>
              Si hoy es 20 de junio, quedan 27 días: estado <em>con margen</em>.
            </li>
          </ul>
          <p>
            Ahora el caso incómodo. La misma joyería descubre en noviembre que el aviso de junio
            nunca se presentó. Al capturar la operación del 28 de junio con fecha de referencia de
            noviembre, el resultado marca <strong>vencido hace más de cien días</strong> y aparece
            la advertencia de que la presentación extemporánea es la infracción del artículo 53
            fracción III. Ahí es donde importa saber que la autocorrección espontánea, presentada{' '}
            <em>antes</em> de que la autoridad inicie sus facultades de verificación, puede evitar o
            reducir la sanción.
          </p>
          <p>
            Y el caso que casi nadie prevé: en julio la joyería no vendió nada por encima del
            umbral. Aun así debe presentar el <strong>informe en ceros</strong> a más tardar el 17
            de agosto. No hacerlo cuesta lo mismo que no presentar un aviso con operaciones.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Y si el 17 cae en sábado, domingo o día inhábil?',
          respuesta:
            'Mostramos la fecha nominal y te lo advertimos, pero no la recorremos. Mover un plazo legal sin una regla oficial registrada sería inventar derecho. Confirma el calendario de días inhábiles publicado por la autoridad antes de apurar la presentación.',
        },
        {
          pregunta: '¿Desde cuándo cuenta el plazo si el aviso se disparó por acumulación?',
          respuesta:
            'Desde el mes de la operación con la que la suma cruzó el umbral. Si esa operación fue en marzo y lo detectas en agosto, el aviso corresponde al periodo de marzo y venció el 17 de abril. La calculadora de acumulación marca exactamente esa operación.',
        },
        {
          pregunta: '¿Tengo que reportar un mes en el que no hubo operaciones?',
          respuesta:
            'Sí. Se presenta el informe en ceros dentro del mismo plazo del día 17. La obligación mensual nace del alta en el padrón, no de haber tenido operaciones ese mes.',
        },
        {
          pregunta: '¿Qué pasa si presento el aviso tarde?',
          respuesta:
            'La presentación extemporánea, incompleta o sin los requisitos aplicables es la infracción del artículo 53 fracción III, con multa de 200 a 2,000 UMA. Es mucho menos grave que la omisión total, que va de 10,000 a 65,000 UMA o hasta el 100% del valor del acto.',
        },
        {
          pregunta: '¿El archivo .ics manda mis datos a algún lado?',
          respuesta:
            'No. Se construye en tu navegador con las fechas calculadas y se descarga directo a tu equipo. Contiene el periodo y el recordatorio, nunca datos de tus operaciones ni de tus clientes.',
        },
      ]}
    >
      <FechaLimite />
    </MarcoHerramienta>
  );
}
