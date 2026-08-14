import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { Consulta } from './Consulta';

export const metadata: Metadata = construirMetadata({
  titulo: 'Consulta en lenguaje natural: describe tu operación',
  descripcion:
    'Escribe lo que pasó —«vendí un reloj de 180 mil en efectivo»— y obtén la actividad del artículo 17, el umbral que aplica y la UMA con la que salió el número.',
  ruta: '/herramientas/consulta-libre',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="consulta-libre"
      titulo="Consulta en lenguaje natural"
      entradilla="Describe la operación como se la contarías a alguien —«vendí un reloj de 180 mil en efectivo»— y te digo qué fracción es, qué umbral aplica y con qué UMA salió la cifra."
      tambienVer={['calculadora-umbrales', 'cuestionario', 'acumulacion-operaciones']}
      lecturas={[
        { href: '/umbrales', etiqueta: 'Tabla completa de umbrales por actividad' },
        { href: '/actividades-vulnerables', etiqueta: 'Las actividades del artículo 17' },
        { href: '/obligaciones', etiqueta: 'Qué implica identificar y avisar' },
      ]}
      introduccion={
        <>
          <p>
            Nadie pregunta “¿cuál es el umbral de aviso de la fracción VI?”. La pregunta real es
            “vendí un reloj de 180 mil en efectivo, ¿tengo que reportarlo?”. Esta herramienta acepta
            la pregunta en ese formato: lee la frase, la traduce a actividad, monto, medio de pago y
            fecha, y con eso consulta el mismo motor que alimenta a la calculadora de umbrales.
          </p>
          <p>
            No hay inteligencia artificial detrás. Es un intérprete de reglas: reconoce formas de
            escribir cantidades —“180 mil”, “$180,000.50”, “2.5 millones”, “un millón y medio”—, un
            vocabulario de objetos y oficios que apunta a las fracciones del artículo 17, y las
            palabras con las que se nombra un medio de pago. La misma frase da siempre el mismo
            resultado, y ese resultado se puede auditar.
          </p>
          <p>
            Por eso lo primero que verás no es la respuesta, sino <strong>lo que entendí</strong>:
            monto, actividad, medio y fecha, cada uno con la palabra de la que salió. Todo es
            corregible antes de creerle. Si la frase apunta a dos actividades —“vendí una casa y un
            coche”— no elige una: te muestra las dos y te pregunta.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>La lectura ocurre en cuatro pasos, en este orden:</p>
          <ol>
            <li>
              <strong>Fecha.</strong> Se busca primero, en cualquiera de sus formas
              (“20 de junio de 2026”, 20/06/2026, 2026-06-20), y se recorta de la frase. Si no se
              recortara, el año se leería como un monto de $2,026.00. Cuando la frase no trae fecha
              se usa la de hoy y se dice que fue un supuesto.
            </li>
            <li>
              <strong>Monto.</strong> Se convierte a centavos enteros sin pasar por punto flotante:
              el multiplicador de “mil” o “millones” se aplica corriendo el punto decimal sobre el
              texto, no multiplicando decimales. Una palabra suelta no es una cantidad: en “vendí un
              reloj”, ese “un” es un artículo, no un peso.
            </li>
            <li>
              <strong>Actividad.</strong> Se comparan las palabras de la frase contra un vocabulario
              construido a partir de los nombres, las descripciones y los ejemplos del catálogo de
              actividades vulnerables. Gana la coincidencia más larga: “casa de empeño” es un
              préstamo, no la venta de una casa. Si hay empate, no se resuelve solo.
            </li>
            <li>
              <strong>Medio de pago.</strong> Efectivo, transferencia, cheque o tarjeta. Si aparecen
              dos, la operación se marca como mixta, que es justo lo que es.
            </li>
          </ol>
          <p>
            Con eso se arma la operación y se le entrega al motor, que resuelve la regla vigente en
            esa fecha, la UMA de esa fecha y los dos umbrales. Ningún número legal vive en esta
            herramienta: aquí sólo se lee español. Y el resultado nunca dice “cumples”: dice qué se
            alcanzó, qué se dio por hecho y qué falta saber.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            Frase: <strong>“vendí un reloj de 180 mil en efectivo”</strong>, capturada el 14 de
            agosto de 2026.
          </p>
          <ul>
            <li>
              <strong>Monto:</strong> $180,000.00, leído de “180 mil”. En centavos enteros:
              18,000,000.
            </li>
            <li>
              <strong>Actividad:</strong> metales preciosos, piedras preciosas, joyería y relojes
              —fracción VI—, por la palabra “reloj”.
            </li>
            <li>
              <strong>Medio de pago:</strong> efectivo. Como no se dijo que sólo una parte lo fuera,
              se asume la operación completa y se revisa además el límite del artículo 32.
            </li>
            <li>
              <strong>Fecha:</strong> no venía en la frase, así que se usó la de hoy y se marca como
              supuesto, porque es la que determina la UMA aplicable.
            </li>
          </ul>
          <p>
            A partir de ahí responde el motor, con los umbrales de la fracción VI y la UMA vigente en
            esa fecha exacta. Si el reloj se hubiera vendido en 2024, la respuesta cambiaría: se
            aplicaría la UMA de 2024, no la de hoy.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Esto usa inteligencia artificial?',
          respuesta:
            'No. Es un intérprete de reglas escrito a mano y cubierto con pruebas. No hay llamadas a ningún modelo, la frase no sale de tu navegador y la misma frase produce siempre exactamente el mismo resultado.',
        },
        {
          pregunta: '¿Qué formas de escribir el monto reconoce?',
          respuesta:
            'Cifras con o sin símbolo y separadores («$180,000.50», «180000»), cantidades con multiplicador («180 mil», «2.5 millones», «3 mdp») y cantidades escritas con palabras cuando llevan multiplicador («un millón y medio», «medio millón», «quinientos mil»). No intenta interpretar cantidades compuestas en palabras como «ciento cincuenta mil»: en ese caso te dice que no encontró monto en lugar de leer un número equivocado.',
        },
        {
          pregunta: '¿Por qué a veces me pide elegir la actividad?',
          respuesta:
            'Porque no la reconoció, o porque la frase apunta a más de una. Adivinar sería peor que preguntar: cada fracción tiene su propio umbral, y contestar con la fracción incorrecta da una respuesta que parece segura y no lo es.',
        },
        {
          pregunta: '¿Puedo corregir lo que entendió?',
          respuesta:
            'Sí, y es el uso previsto. Debajo de la lectura están los cuatro campos —actividad, monto, fecha y medio de pago— y cualquier cambio recalcula al instante. Lo que manda es lo que quede en los campos, no la frase original.',
        },
        {
          pregunta: '¿Se guarda mi frase o se va en el enlace que copio?',
          respuesta:
            'No. La frase se queda en la memoria de tu navegador mientras usas la página. El enlace que puedes copiar lleva sólo actividad, inciso, monto, fecha y medio de pago: nunca la frase, porque la gente suele escribir en ella el nombre de su cliente.',
        },
        {
          pregunta: '¿Esto sustituye a un abogado o a un contador?',
          respuesta:
            'No. Es información general y un cálculo reproducible sobre los datos que capturaste. No conoce el resto de tus operaciones ni el detalle del acto, y varias fracciones dependen de circunstancias que una frase no alcanza a describir. Úsalo para saber qué preguntar, no para decidir solo.',
        },
      ]}
    >
      <Consulta />
    </MarcoHerramienta>
  );
}
