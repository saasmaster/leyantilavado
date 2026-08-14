import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { Calculadora } from './Calculadora';

export const metadata: Metadata = construirMetadata({
  titulo: 'Calculadora de umbrales de identificación y aviso',
  descripcion:
    'Captura actividad, monto y fecha, y obtén si se alcanza el umbral de identificación y el de aviso con la UMA vigente en esa fecha exacta.',
  ruta: '/herramientas/calculadora-umbrales',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="calculadora-umbrales"
      titulo="Calculadora de umbrales"
      entradilla="Dime la actividad, el inciso, el monto y la fecha, y te digo si hay que identificar al cliente, si hay que presentar aviso, y con qué valor de UMA salió cada número."
      tambienVer={['acumulacion-operaciones', 'fecha-limite-aviso']}
      lecturas={[
        { href: '/umbrales', etiqueta: 'Tabla completa de umbrales por actividad' },
        { href: '/actividades-vulnerables', etiqueta: 'Las actividades del artículo 17' },
        { href: '/obligaciones', etiqueta: 'Qué implica identificar y avisar' },
      ]}
      introduccion={
        <>
          <p>
            El artículo 17 de la LFPIORPI no tiene un umbral: tiene dos por cada actividad, y en
            varias fracciones tiene uno distinto por inciso. El de{' '}
            <strong>identificación</strong> obliga a conocer al cliente e integrar su expediente. El
            de <strong>aviso</strong> obliga además a reportar la operación al SAT antes del día 17
            del mes siguiente. Son escalones separados: es normal caer en el primero y no en el
            segundo.
          </p>
          <p>
            Esta calculadora resuelve la pregunta concreta —“con este monto y esta fecha, ¿qué me
            toca?”— en lugar de dejarte una tabla para interpretar. Cuando la actividad tiene
            incisos, te los pide: un notario no tiene un umbral, tiene cinco reglas distintas y tres
            de ellas generan aviso sin importar el monto.
          </p>
          <p>
            También distingue entre lo que sí es un número y lo que no. Hay supuestos donde la
            obligación existe siempre, otros donde depende del papel que juegas frente al cliente y
            dos apartados donde la autoridad no ha publicado umbral. En esos casos la herramienta lo
            dice en vez de inventar una cifra.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>La secuencia es siempre la misma:</p>
          <ol>
            <li>
              Con la <strong>fecha de la operación</strong> se busca la regla vigente ese día. No la
              regla de hoy: si capturas una operación de 2025, se aplica lo que regía en 2025.
            </li>
            <li>
              Con esa misma fecha se busca el <strong>valor de la UMA vigente</strong>. La UMA entra
              en vigor el 1 de febrero de cada año, así que una operación de enero de 2026 se mide
              con la UMA de 2025.
            </li>
            <li>
              El umbral en UMA se convierte a pesos en aritmética entera de centavos. 645 UMA ×
              $117.31 da $75,664.95 exactos; con números decimales de punto flotante daría
              $75,664.9499… y la comparación fallaría justo en el borde.
            </li>
            <li>
              Se compara tu monto contra el umbral con el operador que dice la ley:{' '}
              <em>igual o superior a</em> en la mayoría de los casos, <em>superior a</em> en la
              identificación del arrendamiento.
            </li>
            <li>
              Si capturaste una parte en efectivo, se evalúa además el límite del artículo 32, que
              es una prohibición independiente y se mide con IVA incluido.
            </li>
          </ol>
          <p>
            El resultado nunca dice “cumples”. Dice qué se alcanzó, qué se dio por hecho y qué falta
            saber para afinarlo.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Agencia automotriz, venta de una camioneta usada.</strong> Fecha del contrato:{' '}
            <strong>20 de junio de 2026</strong>. Precio sin IVA: <strong>$690,000.00</strong>. El
            cliente entrega $200,000 en efectivo y el resto por transferencia.
          </p>
          <ul>
            <li>
              Vehículos es la fracción VIII. Identificación: <strong>3,210 UMA</strong>. Aviso:{' '}
              <strong>6,420 UMA</strong>.
            </li>
            <li>
              UMA vigente el 20 de junio de 2026: <strong>$117.31</strong> diarios.
            </li>
            <li>
              Umbral de identificación: 3,210 × 117.31 = <strong>$376,565.10</strong>. Los $690,000
              lo superan, así que <strong>hay que identificar al cliente</strong> e integrar su
              expediente.
            </li>
            <li>
              Umbral de aviso: 6,420 × 117.31 = <strong>$753,130.20</strong>. Los $690,000 quedan{' '}
              <strong>$63,130.20 por debajo</strong>: esta venta por sí sola no genera aviso, pero
              está dentro del último tramo y la herramienta lo marca.
            </li>
            <li>
              Efectivo: el límite del artículo 32 para vehículos es de 3,210 UMA ={' '}
              <strong>$376,565.10</strong>. Los $200,000 en efectivo caben. Si el cliente hubiera
              querido pagar $400,000 en efectivo, la operación sería infracción aunque el aviso se
              presentara puntualmente.
            </li>
          </ul>
          <p>
            Conclusión práctica: expediente sí, aviso todavía no, y ojo si el mismo cliente compra
            otro vehículo en los siguientes seis meses, porque las dos ventas se suman.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿El monto va con IVA o sin IVA?',
          respuesta:
            'Los umbrales del artículo 17 se miden sobre el valor del acto sin IVA. El límite de efectivo del artículo 32 es la excepción: ese se mide con IVA incluido. Por eso la calculadora pide las dos cifras por separado en lugar de suponer una.',
        },
        {
          pregunta: '¿Por qué me pide el inciso si ya elegí la actividad?',
          respuesta:
            'Porque en fe pública, servicios profesionales, comercio exterior y activos virtuales la ley fija una regla por inciso, no una por fracción. En notarios, por ejemplo, los inmuebles tienen umbral de 8,000 UMA, los fideicomisos 4,000, y la constitución de personas morales genera aviso sin umbral. Elegir por ti sería adivinar.',
        },
        {
          pregunta: '¿Qué pasa si mi operación es de un año anterior?',
          respuesta:
            'Se calcula con la UMA y con la regla vigentes en esa fecha. Tenemos registrados los valores de UMA desde 2016. Si capturas una fecha para la que no hay dato o para la que no había regla registrada, la herramienta te lo dice en lugar de extrapolar.',
        },
        {
          pregunta: '¿No alcanzar el umbral significa que no tengo obligaciones?',
          respuesta:
            'No. Significa que esa operación, con esos datos, no alcanza ningún umbral. Quien realiza una actividad vulnerable tiene obligaciones permanentes —alta en el padrón, manual, metodología de riesgos, informes en ceros— aunque en un mes no haya ninguna operación reportable.',
        },
        {
          pregunta: '¿Se guarda lo que capturo?',
          respuesta:
            'No. El cálculo corre completo en tu navegador y no se envía nada a ningún servidor. El botón de guardar escribe en el almacenamiento local de tu propio equipo, y el enlace que puedes copiar sólo lleva actividad, inciso, monto y fecha: nunca datos de tu cliente.',
        },
      ]}
    >
      <Calculadora />
    </MarcoHerramienta>
  );
}
