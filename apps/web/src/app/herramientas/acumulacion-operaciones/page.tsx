import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { Acumulacion } from './Acumulacion';

export const metadata: Metadata = construirMetadata({
  titulo: 'Acumulación de operaciones en seis meses',
  descripcion:
    'Suma las operaciones de un mismo cliente en la ventana móvil de seis meses del artículo 17 y marca en qué operación exacta se disparó el aviso.',
  ruta: '/herramientas/acumulacion-operaciones',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="acumulacion-operaciones"
      titulo="Acumulación de seis meses"
      entradilla="La regla antifraccionamiento en la práctica: captura las operaciones de un mismo cliente y ve en cuál exactamente se cruzó el umbral de aviso."
      actualizadoEn="2026-08-11"
      tambienVer={['calculadora-umbrales', 'importar-operaciones']}
      lecturas={[
        { href: '/umbrales', etiqueta: 'Umbrales por actividad' },
        { href: '/obligaciones/avisos', etiqueta: 'Cómo se presenta un aviso' },
        { href: '/multas', etiqueta: 'Qué cuesta omitir un aviso' },
      ]}
      introduccion={
        <>
          <p>
            El último párrafo del artículo 17 es la parte de la ley que más gente descubre tarde:
            las operaciones de un mismo cliente, por el mismo tipo de acto, realizadas dentro de{' '}
            <strong>seis meses</strong>, se suman para efectos del umbral. Da igual que ninguna
            llegue por separado. Si la suma cruza el umbral de aviso, hay aviso.
          </p>
          <p>
            La consecuencia práctica es incómoda: quien revisa operación por operación y concluye
            “ninguna llega” puede estar omitiendo avisos desde hace meses. Y la omisión de avisos es
            la infracción más cara de la ley, con multa de 10,000 a 65,000 UMA o del 10% al 100% del
            valor del acto, la que resulte mayor.
          </p>
          <p>
            Esta herramienta hace la suma con la semántica correcta: ventana móvil hacia atrás desde
            la fecha de la última operación, agrupada por cliente y por tipo de acto, y marca la
            operación exacta en la que se cruzó el umbral, que es la que define desde qué mes corre
            el plazo.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            <strong>La ventana es móvil, no un semestre natural.</strong> No se mira “enero a
            junio”: se mira seis meses hacia atrás desde la fecha de la operación evaluada. Una
            operación del 3 de enero y otra del 30 de junio del mismo año sí se acumulan; una del 3
            de enero y otra del 2 de julio, no. El borde es inclusivo: exactamente seis meses atrás
            todavía cuenta.
          </p>
          <p>
            <strong>Se agrupa por cliente y por tipo de acto.</strong> Dos operaciones del mismo
            cliente en actividades distintas no se suman. En las actividades que tienen incisos, el
            inciso también forma parte del grupo.
          </p>
          <p>
            <strong>La suma se lleva en orden cronológico</strong> y se compara contra el umbral de
            aviso convertido con la UMA vigente en la fecha de la última operación. La primera
            operación en la que la suma corrida cruza el umbral es la que dispara el aviso, y queda
            marcada en la línea de tiempo.
          </p>
          <p>
            Cuando el umbral de aviso de la actividad no es un monto —porque procede siempre o
            porque depende del supuesto— la acumulación no cambia nada, y la herramienta lo dice en
            lugar de sumar por sumar.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Casino, mismo cliente, cuatro compras de fichas.</strong> El umbral de aviso de
            juegos y sorteos es de <strong>645 UMA</strong>. Con la UMA de 2026 son{' '}
            <strong>$75,664.95</strong>.
          </p>
          <ul>
            <li>1 de marzo de 2026: $20,000. Suma corrida $20,000.</li>
            <li>10 de abril de 2026: $20,000. Suma corrida $40,000.</li>
            <li>20 de mayo de 2026: $20,000. Suma corrida $60,000.</li>
            <li>
              15 de junio de 2026: $20,000. Suma corrida <strong>$80,000</strong>.
            </li>
          </ul>
          <p>
            Ninguna compra individual se acerca al umbral: la más grande es cuatro veces menor. Pero
            la cuarta cruza los $75,664.95 acumulados, así que{' '}
            <strong>el aviso se dispara con la operación del 15 de junio</strong> y vence el{' '}
            <strong>17 de julio de 2026</strong>.
          </p>
          <p>
            Si la primera compra hubiera sido el 1 de noviembre de 2025 en lugar del 1 de marzo,
            quedaría fuera de la ventana de seis meses y la suma sería de $60,000: sin aviso. Ese
            detalle es lo que la línea de tiempo deja ver de un vistazo.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿La ventana de seis meses es el semestre calendario?',
          respuesta:
            'No. Es una ventana móvil que se mide hacia atrás desde la fecha de cada operación. Por eso el mismo conjunto de operaciones puede acumular o no según cuál sea la última y cuándo ocurrió.',
        },
        {
          pregunta: '¿Se suman operaciones de actividades distintas del mismo cliente?',
          respuesta:
            'No. La acumulación agrupa por cliente y por el mismo tipo de acto u operación. Un cliente que te compra un vehículo y además contrata un blindaje genera dos acumulaciones separadas, aunque sea la misma persona.',
        },
        {
          pregunta: '¿Desde cuándo corre el plazo del aviso cuando se dispara por acumulación?',
          respuesta:
            'Desde el mes de la operación con la que se cruzó el umbral, no desde el día en que te diste cuenta. Por eso la herramienta marca esa operación: define el periodo que se reporta y, con él, el día 17 aplicable.',
        },
        {
          pregunta: '¿Puedo cargar mis operaciones desde una hoja de cálculo?',
          respuesta:
            'Sí. El botón de importar acepta un CSV con tres columnas: fecha en formato AAAA-MM-DD, monto y una referencia interna. Las líneas que no cumplan se omiten y se te dice cuáles. El archivo se lee en tu navegador y no se sube a ningún lado.',
        },
        {
          pregunta: '¿Dividir un pago en varias exhibiciones evita el umbral?',
          respuesta:
            'No, y esta regla existe justamente para eso. La ley mira el conjunto de operaciones del cliente en la ventana, no cada recibo por separado. Fraccionar deliberadamente además agrava la posición frente a la autoridad.',
        },
      ]}
    >
      <Acumulacion />
    </MarcoHerramienta>
  );
}
