import Link from 'next/link';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { Seccion } from '@/components/contenido';
import { ENIF, REPATRIACION, pesos, porcentaje } from '@/content/analisis';
import { TABLA, TD, TH } from './estilos';
import { GraficaEnif } from './graficas/GraficaEnif';

/**
 * Ley de Economía Digital. La iniciativa (Anexo G) es un PDF escaneado sin
 * capa de texto: se leyó con reconocimiento óptico y se contrastó artículo por
 * artículo antes de escribir. Las citas entre comillas son literales.
 */

const TITULARES: readonly { dice: string; texto: React.ReactNode }[] = [
  {
    dice: '«Pagos digitales obligatorios»',
    texto: (
      <>
        Art. 11: los proveedores de bienes o servicios <strong>«podrán»</strong> implementar los medios de
        pago digitales. No hay una obligación general.
      </>
    ),
  },
  {
    dice: '«Cobro obligatorio con código QR»',
    texto: (
      <>
        Art. 19, fr. IV: Banco de México y la CNBV emitirán reglas para que las entidades que dan el
        servicio de <strong>terminales punto de venta</strong> permitan cobrar con QR. Obliga a quien
        procesa los pagos, no al comercio.
      </>
    ),
  },
  {
    dice: '«Hacienda podrá limitar el efectivo»',
    texto: (
      <>
        Cierto, pero acotado. Art. 13: sólo en los sectores estratégicos y actividades relevantes que
        Hacienda determine, donde el pago digital <strong>«podrá ser la única forma de pago»</strong>.
      </>
    ),
  },
  {
    dice: '«CURP digital obligatoria en los bancos»',
    texto: (
      <>
        Arts. 5 y 6: se aceptará como mecanismo de confianza para contratar servicios financieros, y la
        persona usa, <strong>«a su elección»</strong>, la CURP Digital o cualquier otra identificación
        oficial.
      </>
    ),
  },
];

export function CuerpoEconomiaDigital() {
  return (
    <>
      <Seccion
        id="titulares"
        titulo="Titulares contra texto"
        descripcion="Lo que se ha publicado de la iniciativa, frente a lo que dice su articulado."
      >
        <TablaEnvoltura etiqueta="Lo que se ha publicado frente a lo que dice la iniciativa">
          <table className={`${TABLA} min-w-[38rem]`}>
            <caption className="sr-only">Afirmaciones de prensa y el artículo de la iniciativa que las respalda o no</caption>
            <thead>
              <tr>
                <th scope="col" className={`${TH} w-[34%]`}>Lo que se lee</th>
                <th scope="col" className={TH}>Lo que dice la iniciativa</th>
              </tr>
            </thead>
            <tbody>
              {TITULARES.map((t) => (
                <tr key={t.dice}>
                  <td className={`${TD} font-medium text-[var(--color-tinta)]`}>{t.dice}</td>
                  <td className={TD}>{t.texto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>
      </Seccion>

      <Seccion id="articulo-13" titulo="El artículo que importa: el 13">
        <div className="prosa">
          <p>
            Todo lo que la iniciativa puede hacer con el efectivo pasa por aquí. La Secretaría de
            Hacienda <strong>determinaría los sectores estratégicos y actividades relevantes</strong> en
            los que la aceptación de pagos digitales podría ser la única forma de pago (art. 13), y las
            autoridades de cada sector fijarían las condiciones y los plazos de una{' '}
            <strong>transición gradual</strong> del efectivo a lo digital (art. 14).
          </p>
          <p>El calendario que proponen los transitorios es corto:</p>
          <ul>
            <li>La ley entraría en vigor <strong>al día siguiente de su publicación</strong> en el DOF.</li>
            <li>Hacienda tendría <strong>15 días hábiles</strong> para determinar los sectores, y podría ampliarlos después.</li>
            <li>
              Las autoridades de cada sector, <strong>otros 15 días hábiles</strong> para emitir sus reglas,
              con mecanismos y plazos de transición.
            </li>
          </ul>
          <p>
            <strong>La iniciativa no nombra ningún sector.</strong> Esa lista sería una determinación de
            Hacienda, no de la ley, y todavía no existe. Quien afirme hoy qué giros quedarán «sin
            efectivo» está adivinando.
          </p>
          <p>
            Hay además una válvula: si una contingencia impide recibir pagos digitales, se permite el pago
            en efectivo o con cheque (art. 15), aunque una contingencia no puede justificar el
            incumplimiento de forma permanente o recurrente (art. 16).
          </p>
        </div>
      </Seccion>

      <Seccion id="no-trae" titulo="Lo que la iniciativa no trae">
        <div className="prosa">
          <ul>
            <li>Una prohibición general del efectivo.</li>
            <li>Un monto a partir del cual no se pueda pagar en efectivo.</li>
            <li>Un régimen de sanciones propio: el articulado no establece multas.</li>
            <li>Ninguna referencia a la Ley Antilavado ni al lavado de dinero.</li>
          </ul>
          <p>
            Y deja explícito que no desplaza a las demás: lo que dispone «no excluye la observancia y
            aplicación de las respectivas leyes especiales» (art. 3).
          </p>
        </div>
      </Seccion>

      <Seccion id="antilavado" titulo="Qué no cambia de la Ley Antilavado">
        <div className="prosa">
          <p>
            El <Link href="/limites-efectivo">artículo 32 de la LFPIORPI</Link> ya prohíbe liquidar en
            efectivo ciertas operaciones por encima de un monto —inmuebles, vehículos, joyería, relojes y
            obras de arte, entre otras—, medido en UMA y con el IVA incluido. La Ley de Economía Digital
            no lo reforma ni lo menciona.
          </p>
          <p>
            Si se aprobara y Hacienda designara un sector, las dos reglas convivirían: el artículo 32
            seguiría fijando su límite, y en ese sector el pago digital podría ser la única vía incluso
            por debajo de él. En la práctica, te obligaría la más estricta de las dos.
          </p>
          <p>
            Y hay algo que no depende de cómo te paguen: <strong>identificar al cliente y presentar aviso</strong>{' '}
            según los <Link href="/umbrales">umbrales del artículo 17</Link>. Una operación pagada por
            transferencia se identifica y se avisa exactamente igual que una pagada en efectivo. Lo
            único que cambia es que el efectivo, además, tiene un techo.
          </p>
        </div>
        <Nota tono="info" titulo="Para comprobar una operación concreta" className="mt-5">
          <p>
            El <Link href="/herramientas/limites-efectivo">verificador de efectivo</Link> dice si un pago
            rebasa el límite del artículo 32 con la UMA de su fecha, y cuánto tendría que ir por otro
            medio.
          </p>
        </Nota>
      </Seccion>

      <Seccion
        id="repatriacion"
        titulo="Otra pieza del paquete: repatriar al 7.5 %"
        descripcion="Iniciativa de Ley de Ingresos 2027, transitorio vigésimo tercero."
      >
        <div className="prosa">
          <p>
            La Ley de Ingresos propone que quien tenga recursos de procedencia lícita mantenidos en el
            extranjero hasta el {formatearFechaLarga(REPATRIACION.mantenidosHasta)} pueda traerlos
            pagando ISR al <strong>{porcentaje(REPATRIACION.tasa)}</strong>, sin deducciones, con estas
            condiciones:
          </p>
          <ul>
            <li>Que regresen a más tardar el {formatearFechaLarga(REPATRIACION.retornarHasta)}.</li>
            <li>
              Que se inviertan en México y permanezcan invertidos al menos{' '}
              {REPATRIACION.aniosInvertidos} años.
            </li>
            <li>Que el impuesto se pague dentro de los {REPATRIACION.diasParaPagar} días naturales siguientes al retorno.</li>
            <li>
              Que el dinero entre por instituciones de crédito o casas de bolsa del país, reguladas por
              la CNBV.
            </li>
          </ul>
          <p>
            El texto limita el beneficio a recursos «de procedencia lícita», pero no crea un
            procedimiento propio para acreditarlo. Por eso pesa la última condición: el dinero entra por
            instituciones financieras que tienen sus propias obligaciones de prevención de lavado, y
            nada en el transitorio las suspende. Pagar el 7.5 % es un trato fiscal, no una constancia de
            origen lícito.
          </p>
        </div>
      </Seccion>

      <Seccion id="cifras" titulo="Las cifras detrás">
        <div className="prosa">
          <p>
            La exposición de motivos se apoya en la Encuesta Nacional de Inclusión Financiera 2024. Entre{' '}
            {ENIF.periodo}, el efectivo como medio de pago más frecuente en compras de{' '}
            {pesos(ENIF.montoCompra)} o menos bajó de{' '}
            <strong>{porcentaje(ENIF.efectivoFrecuente.antes)}</strong> a{' '}
            <strong>{porcentaje(ENIF.efectivoFrecuente.despues)}</strong>, y las transferencias y apps
            pasaron de {porcentaje(ENIF.transferenciasYApps.antes)} a{' '}
            {porcentaje(ENIF.transferenciasYApps.despues)}.
          </p>
          <p>
            La propia iniciativa lo resume en una línea: la brecha no está en la infraestructura, sino en
            la adopción. Casi todos tienen ya una tarjeta o un teléfono con el que pagar; lo que no ha
            cambiado es la costumbre.
          </p>
        </div>
        <GraficaEnif />
      </Seccion>
    </>
  );
}
