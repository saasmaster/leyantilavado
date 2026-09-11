import Link from 'next/link';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { Seccion } from '@/components/contenido';
import {
  CALENDARIO_LEGISLATIVO,
  RESICO,
  millones,
  pesos,
  porcentaje,
  tasaDeTabla,
} from '@/content/analisis';
import { TABLA, TD, TD_CIFRA, TH } from './estilos';
import { GraficaEscaleraResico } from './graficas/GraficaEscaleraResico';

/**
 * RESICO 2027. Cada cifra sale de `RESICO` en `content/analisis`, que cita su
 * artículo; aquí no se escribe ningún número a mano.
 */
export function CuerpoResico2027() {
  const pf = RESICO.fisicas;
  const pm = RESICO.morales;

  return (
    <>
      <Seccion id="estado" titulo="Primero: todavía es una propuesta">
        <div className="prosa">
          <p>
            El {formatearFechaLarga(CALENDARIO_LEGISLATIVO.presentacion)} el Ejecutivo entregó a la
            Cámara de Diputados el Paquete Económico 2027. Los cambios al RESICO vienen en la{' '}
            <strong>iniciativa que reforma la Ley del Impuesto sobre la Renta</strong> (Anexo E de la
            Gaceta Parlamentaria de ese día). El IVA del 7 % que también se ha anunciado viene en otro
            documento, la iniciativa de Ley de Ingresos, y tiene{' '}
            <Link href="/analisis/iva-7-por-ciento-resico">su propio análisis</Link>.
          </p>
          <p>
            Una iniciativa no obliga a nadie. El Congreso puede aprobarla tal cual, modificarla o
            rechazarla. El calendario lo fija la Ley Federal de Presupuesto y Responsabilidad
            Hacendaria (art. 42): la Ley de Ingresos se aprueba en Diputados a más tardar el{' '}
            {formatearFechaLarga(CALENDARIO_LEGISLATIVO.diputados)} y en el Senado a más tardar el{' '}
            {formatearFechaLarga(CALENDARIO_LEGISLATIVO.senado)}. La reforma a la LISR propone entrar
            en vigor el {formatearFechaLarga(CALENDARIO_LEGISLATIVO.vigorPropuesto)}.
          </p>
        </div>
        <Nota tono="atencion" titulo="Mientras no se publique en el DOF, rige la ley actual" className="mt-5">
          <p>
            Si hoy rebasas los {millones(pf.limiteVigente)} o perdiste el régimen, las reglas vigentes
            te siguen aplicando. Nada de lo que sigue cambia tus pagos de 2026.
          </p>
        </Nota>
      </Seccion>

      <Seccion
        id="hoy"
        titulo="Cómo funciona el RESICO hoy"
        descripcion="Para personas físicas, artículos 113-E a 113-J de la LISR; para morales, 206 a 215."
      >
        <div className="prosa">
          <h3>Personas físicas</h3>
          <ul>
            <li>
              <strong>Quién puede optar:</strong> quien realice únicamente actividades empresariales,
              profesionales u otorgue el uso o goce temporal de bienes —es decir, rente—, con ingresos
              del año anterior de hasta {millones(pf.limiteVigente)} de pesos.
            </li>
            <li>
              <strong>Cómo paga:</strong> una tasa sobre sus ingresos efectivamente cobrados, sin IVA y{' '}
              <strong>sin deducir ningún gasto</strong>. Es la diferencia con los demás regímenes: se
              paga poco, pero sobre todo lo cobrado.
            </li>
            <li>
              <strong>Retención:</strong> cuando le cobra a una persona moral, ésta le retiene el{' '}
              {porcentaje(RESICO.retencionMorales)} como pago mensual (art. 113-J).
            </li>
          </ul>
        </div>

        <TablaEnvoltura etiqueta="Tabla anual del RESICO para personas físicas, art. 113-F vigente" className="mt-5">
          <table className={`${TABLA} min-w-[26rem]`}>
            <caption className="sr-only">Tasas del RESICO para personas físicas según ingresos anuales</caption>
            <thead>
              <tr>
                <th scope="col" className={TH}>
                  Ingresos anuales cobrados, sin IVA
                </th>
                <th scope="col" className={`${TH} text-right`}>
                  Tasa
                </th>
              </tr>
            </thead>
            <tbody>
              {RESICO.tablaAnual.map((t) => (
                <tr key={t.hasta}>
                  <td className={TD}>Hasta {pesos(t.hasta)}</td>
                  <td className={TD_CIFRA}>{tasaDeTabla(t.tasa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <div className="prosa mt-6">
          <p>
            <strong>Quién no puede</strong> (art. 113-E): quien sea socio, accionista o integrante de
            personas morales o parte relacionada; los residentes en el extranjero con establecimiento
            permanente en México; quien tenga ingresos sujetos a regímenes fiscales preferentes; y
            quien perciba los ingresos asimilados a salarios de las fracciones III a VI del artículo
            94.
          </p>
          <p>
            <strong>Cómo se pierde:</strong> al rebasar el límite en cualquier momento del año, al
            incumplir alguna obligación del artículo 113-G o al omitir tres o más pagos mensuales en un
            año (art. 113-I). Y hoy hay dos salidas distintas:{' '}
            <strong>quien lo perdió por rebasar el límite</strong> puede volver cuando sus ingresos del
            año anterior vuelvan a quedar por debajo y esté al corriente;{' '}
            <strong>quien lo perdió por incumplir</strong>, según el texto vigente, «en ningún caso»
            puede volver.
          </p>

          <h3>Personas morales</h3>
          <p>
            Para ellas el régimen hoy es <strong>obligatorio</strong>: el artículo 206 dice que
            «deberán» tributar ahí las personas morales constituidas únicamente por personas físicas
            con ingresos de hasta {millones(pm.limiteVigente)} en el año anterior. A diferencia de las
            personas físicas, sí deducen: pagan sobre lo efectivamente cobrado menos lo efectivamente
            pagado.
          </p>
        </div>
      </Seccion>

      <Seccion
        id="cambios"
        titulo="Qué cambiaría"
        descripcion="Lo que dice el cuadro «dice / debe decir» de la iniciativa."
      >
        <TablaEnvoltura etiqueta="Cambios propuestos al RESICO frente al texto vigente">
          <table className={`${TABLA} min-w-[40rem]`}>
            <caption className="sr-only">Comparación entre el RESICO vigente y la propuesta para 2027</caption>
            <thead>
              <tr>
                <th scope="col" className={TH}>Qué</th>
                <th scope="col" className={TH}>Hoy</th>
                <th scope="col" className={TH}>Propuesta 2027</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>Límite, personas físicas (art. 113-E)</td>
                <td className={TD_CIFRA}>{millones(pf.limiteVigente)}</td>
                <td className={TD_CIFRA}>{millones(pf.limitePropuesto)}</td>
              </tr>
              <tr>
                <td className={TD}>Si lo perdiste por incumplir (personas físicas)</td>
                <td className={TD}>No puedes volver nunca</td>
                <td className={TD}>
                  Puedes volver el año siguiente si te pones al corriente y no pasas de{' '}
                  {millones(pf.limitePropuesto)}
                </td>
              </tr>
              <tr>
                <td className={TD}>Límite, personas morales (art. 206)</td>
                <td className={TD_CIFRA}>{millones(pm.limiteVigente)}</td>
                <td className={TD_CIFRA}>{millones(pm.limitePropuesto)}</td>
              </tr>
              <tr>
                <td className={TD}>Personas morales: ¿obligatorio?</td>
                <td className={TD}>Sí</td>
                <td className={TD}>No: opcional</td>
              </tr>
              <tr>
                <td className={TD}>Personas morales que salieron del régimen</td>
                <td className={TD}>Pasan al régimen general</td>
                <td className={TD}>
                  Pueden volver si no pasan de {millones(pm.limitePropuesto)}, están al corriente y
                  cumplen los requisitos (nuevo párrafo cuarto del art. 206)
                </td>
              </tr>
              {RESICO.deduccionInversiones.map((d) => (
                <tr key={d.concepto}>
                  <td className={TD}>Deducción de inversiones, morales: {d.concepto.toLowerCase()} (art. 209)</td>
                  <td className={TD_CIFRA}>{porcentaje(d.vigente)}</td>
                  <td className={TD_CIFRA}>{porcentaje(d.propuesta)}</td>
                </tr>
              ))}
              <tr>
                <td className={TD}>Exención del sector primario, personas físicas</td>
                <td className={TD_CIFRA}>{pesos(RESICO.sectorPrimario.vigente)}</td>
                <td className={TD_CIFRA}>{pesos(RESICO.sectorPrimario.propuesta)}</td>
              </tr>
              <tr>
                <td className={TD}>IVA</td>
                <td className={TD}>Mecánica normal</td>
                <td className={TD}>
                  Opción de pagar el 7 % de lo cobrado, sin acreditar —{' '}
                  <Link href="/analisis/iva-7-por-ciento-resico" className="underline underline-offset-2">
                    viene en la Ley de Ingresos
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </TablaEnvoltura>

        <div className="prosa mt-6">
          <p>
            Tres precisiones de la propia iniciativa que casi ningún resumen incluye:
          </p>
          <ul>
            <li>
              <strong>Ampliar el límite no obliga a nadie a entrar ni a salir.</strong> Sólo se puede
              optar cuando los ingresos del año anterior ya quedaron dentro del límite.
            </li>
            <li>
              <strong>La persona moral que decida salir</strong> pasaría al régimen general desde el año
              siguiente, calculando su coeficiente de utilidad con la mecánica del artículo 214, para no
              acumular dos veces el mismo ingreso.
            </li>
            <li>
              <strong>Las inversiones hechas hasta el 31 de diciembre de 2026</strong> conservarían los
              porcentajes de deducción vigentes cuando se hicieron. Los porcentajes nuevos serían para
              lo que se invierta desde 2027.
            </li>
          </ul>
        </div>
      </Seccion>

      <Seccion id="igual" titulo="Lo que sigue igual">
        <div className="prosa">
          <ul>
            <li>
              <strong>Las tasas.</strong> De 1 % a 2.5 %. La propuesta sólo estira el último tramo, el
              del 2.5 %, hasta los {millones(pf.limitePropuesto)}: quien factura entre{' '}
              {millones(pf.limiteVigente)} y {millones(pf.limitePropuesto)} pagaría ese mismo 2.5 %.
            </li>
            <li>
              <strong>La base de las personas físicas:</strong> ingresos efectivamente cobrados, sin
              deducciones.
            </li>
            <li>
              <strong>La retención del {porcentaje(RESICO.retencionMorales)}</strong> cuando le cobras a
              una persona moral: la iniciativa no toca el artículo 113-J.
            </li>
            <li>
              <strong>Quién no puede entrar.</strong> La iniciativa no toca la lista de exclusiones del
              artículo 113-E.
            </li>
          </ul>
        </div>
        <GraficaEscaleraResico />
      </Seccion>

      <Seccion id="por-que" titulo="Por qué lo propone Hacienda">
        <div className="prosa">
          <p>
            Según la exposición de motivos, hoy tributan en el RESICO{' '}
            <strong>{millones(RESICO.contribuyentes)} de contribuyentes</strong>. Y la iniciativa usa el
            régimen como vara de medir: de las {(RESICO.empresasQuePaganIsr / 1000).toLocaleString('es-MX')}{' '}
            mil empresas que sí pagaron ISR, el {porcentaje(RESICO.proporcionQuePagaMenos)} pagó, en
            proporción a sus ingresos, menos que una persona física del RESICO con ingresos de 2.5 a 3.5
            millones, cuya tasa es de 2.5 %.
          </p>
          <p>
            El mismo paquete que amplía el RESICO endurece deducciones y pérdidas fiscales para el resto
            de las empresas. La lógica es explícita: premiar lo simple y cerrar lo que se usa para no
            pagar.
          </p>
        </div>
      </Seccion>

      <Seccion id="antilavado" titulo="Y la Ley Antilavado">
        <div className="prosa">
          <p>
            El RESICO es un régimen del impuesto sobre la renta. <strong>No toca la Ley Antilavado</strong>,
            y ninguna de las iniciativas del paquete la reforma. Son dos preguntas distintas que se
            contestan por separado:
          </p>
          <ul>
            <li>
              <strong>El RESICO pregunta cuánto cobraste en el año</strong>, para saber cómo pagas ISR.
            </li>
            <li>
              <strong>La LFPIORPI pregunta qué operación hiciste, con quién y por cuánto</strong>, para
              saber si tienes que identificar al cliente o presentar aviso. Sus umbrales se miden en UMA
              por operación, o acumulados en seis meses; nunca por ingreso anual.
            </li>
          </ul>
          <p>
            Una joyería o una agencia de autos en RESICO sigue siendo actividad vulnerable. Quien renta
            inmuebles en RESICO sigue en la{' '}
            <Link href="/actividades-vulnerables/arrendamiento-inmuebles">fracción XV del artículo 17</Link>.
            Y los <Link href="/limites-efectivo">límites de efectivo del artículo 32</Link> son una
            prohibición que aplica con independencia del régimen fiscal.
          </p>
          <p>
            Si no sabes si tu actividad es vulnerable,{' '}
            <Link href="/herramientas/cuestionario">el cuestionario</Link> lo resuelve en dos minutos.
          </p>
        </div>
      </Seccion>
    </>
  );
}
