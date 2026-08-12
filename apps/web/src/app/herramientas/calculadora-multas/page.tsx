import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { EstimadorMultas } from './EstimadorMultas';
import { ConsecuenciasPenales } from './ConsecuenciasPenales';

export const metadata: Metadata = construirMetadata({
  titulo: 'Estimador de multas de la Ley Antilavado',
  descripcion:
    'Calcula los rangos de multa del artículo 54 en pesos, con la regla de la cantidad mayor, y los escenarios de autocorrección del artículo 55.',
  ruta: '/herramientas/calculadora-multas',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="calculadora-multas"
      titulo="Estimador de multas"
      entradilla="Los rangos que la ley contempla para cada infracción, convertidos a pesos con la UMA de la fecha, más los escenarios de autocorrección y sus requisitos reales."
      actualizadoEn="2026-08-11"
      tambienVer={['fecha-limite-aviso', 'preparacion-auditoria']}
      lecturas={[
        { href: '/multas', etiqueta: 'Multas y sanciones explicadas' },
        { href: '/obligaciones/avisos', etiqueta: 'Cómo evitar la infracción más cara' },
        { href: '/calendario-cumplimiento', etiqueta: 'Calendario de exigibilidad' },
      ]}
      introduccion={
        <>
          <p>
            Casi todos los resúmenes del mercado confunden la estructura de la ley. El{' '}
            <strong>artículo 53 enumera las infracciones</strong> —qué hiciste mal— y el{' '}
            <strong>artículo 54 enumera las multas</strong> —cuánto cuesta—, remitiendo a las
            fracciones del 53. Por eso aquí cada renglón dice ambas cosas: la conducta y el rango
            que le corresponde.
          </p>
          <p>
            Esta herramienta no predice lo que te van a cobrar y nunca muestra una cifra única. La
            autoridad determina el monto dentro del rango considerando la gravedad, la capacidad
            económica y la reincidencia. Lo que sí puedes saber de antemano es el intervalo, y en
            dos infracciones ese intervalo se dispara: cuando el acto es cuantificable en dinero, la
            ley manda aplicar <strong>la cantidad que resulte mayor</strong> entre el rango en UMA y
            un porcentaje del valor de la operación.
          </p>
          <p>
            También encontrarás los escenarios de autocorrección del artículo 55, con sus requisitos
            completos, y un módulo aparte sobre consecuencias penales que{' '}
            <strong>no se suman a la multa</strong> porque pertenecen a otro régimen.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            <strong>Rango en UMA.</strong> Cada infracción trae un mínimo y un máximo en UMA. Se
            convierten a pesos con el valor vigente en la fecha de la infracción, no en la fecha de
            hoy ni en la de la notificación.
          </p>
          <p>
            <strong>Alternativa porcentual.</strong> Dos infracciones —omitir avisos y rebasar el
            límite de efectivo— prevén además una multa del 10% al 100% del valor del acto. Sólo
            procede cuando el acto es cuantificable en dinero. Si no capturas el valor de la
            operación, la herramienta muestra únicamente el rango en UMA y te advierte que puede
            quedarse muy corto.
          </p>
          <p>
            <strong>La cantidad mayor.</strong> Cuando existen ambas bases, se compara mínimo contra
            mínimo y máximo contra máximo, y se toma el mayor de cada par. En una operación de cinco
            millones el porcentaje suele ganar por mucho; en una de cien mil, gana el rango en UMA.
          </p>
          <p>
            <strong>Suma de infracciones.</strong> Si marcas varias, los rangos se suman. Es la
            lectura más conservadora: la autoridad puede sancionar varias conductas en el mismo
            procedimiento.
          </p>
          <p>
            <strong>Autocorrección.</strong> Los escenarios del artículo 55 se aplican sobre el
            rango total sólo para ilustrar el orden de magnitud. La abstención de sanción es una
            facultad de la autoridad, no un derecho: por eso se presenta con sus requisitos y una
            advertencia, nunca como un descuento ya obtenido.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Inmobiliaria que omitió el aviso de una venta de $8,000,000.</strong> Fecha de
            la infracción: <strong>15 de junio de 2026</strong>.
          </p>
          <ul>
            <li>
              Omitir avisos es el artículo 54 fracción III, en relación con el 53 fracción VI:{' '}
              <strong>de 10,000 a 65,000 UMA</strong>.
            </li>
            <li>
              Convertido con la UMA de 2026: de <strong>$1,173,100</strong> a{' '}
              <strong>$7,625,150</strong>.
            </li>
            <li>
              Alternativa porcentual: del 10% al 100% de $8,000,000, es decir de{' '}
              <strong>$800,000</strong> a <strong>$8,000,000</strong>.
            </li>
            <li>
              Se aplica la cantidad mayor de cada extremo: el mínimo relevante es $1,173,100 —gana el
              rango en UMA— y el máximo relevante es <strong>$8,000,000</strong> —gana el
              porcentaje—.
            </li>
          </ul>
          <p>
            Es decir, el rango real va de $1.17 a $8 millones por{' '}
            <strong>un solo aviso omitido</strong>. Si la misma inmobiliaria omitió doce avisos del
            año, el cálculo se repite por cada uno.
          </p>
          <p>
            Con autocorrección espontánea antes de que inicien las facultades de verificación, y
            cumpliendo todos los requisitos del artículo 55 Bis del Reglamento, la autoridad{' '}
            <em>puede</em> abstenerse de sancionar por única ocasión. “Puede” es la palabra clave:
            no es un derecho que se reclama.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Por qué no me dan una cifra exacta?',
          respuesta:
            'Porque la ley no la fija. Establece un rango y la autoridad determina el monto dentro de él según la gravedad de la conducta, la capacidad económica del infractor y si hay reincidencia. Cualquier herramienta que te dé un número único está inventando.',
        },
        {
          pregunta: '¿Qué es la regla de “la cantidad mayor”?',
          respuesta:
            'Para omitir avisos y para rebasar el límite de efectivo, la ley prevé dos bases: un rango en UMA y un porcentaje del valor del acto, del 10% al 100%. Cuando el acto es cuantificable en dinero se aplica la que resulte mayor. En operaciones grandes eso multiplica la multa varias veces respecto del rango en UMA.',
        },
        {
          pregunta: '¿La autocorrección garantiza que no me multen?',
          respuesta:
            'No. El artículo 55 permite a la autoridad abstenerse de sancionar por única ocasión si el cumplimiento fue espontáneo, anterior al inicio de sus facultades de verificación, y se reconoce expresamente la infracción en el plazo aplicable. Es una facultad discrecional sujeta a requisitos, y opera una sola vez.',
        },
        {
          pregunta: '¿Las consecuencias penales se suman a la multa?',
          respuesta:
            'No, y por eso están en un módulo aparte. Las multas administrativas las impone el SAT; el delito del artículo 62 lo persigue la Fiscalía y lo resuelve un juez, con otro estándar de prueba. Son procedimientos independientes que pueden coexistir, pero no se suman en una sola cifra.',
        },
        {
          pregunta: '¿Con qué UMA se convierte la multa?',
          respuesta:
            'Con la vigente en la fecha de la infracción, que es la que captura la herramienta. Ten presente que la UMA cambia el 1 de febrero de cada año, así que una infracción de enero se mide con la del año anterior.',
        },
      ]}
    >
      <div className="flex flex-col gap-12">
        <EstimadorMultas />
        <ConsecuenciasPenales />
      </div>
    </MarcoHerramienta>
  );
}
