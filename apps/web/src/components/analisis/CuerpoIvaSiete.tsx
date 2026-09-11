import Link from 'next/link';
import { Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { Seccion } from '@/components/contenido';
import {
  CASOS_IVA,
  FRACCION_RETENCION,
  TASA_GENERAL,
  TASA_OPCIONAL,
  excedenteRetencion,
  ivaNormal,
  ivaOpcional,
  pesosExactos,
  porcentaje,
  puntoDeEquilibrio,
} from '@/content/analisis';
import { TABLA, TD, TD_CIFRA, TH } from './estilos';
import { GraficaIvaEquilibrio } from './graficas/GraficaIvaEquilibrio';

/**
 * IVA del 7 %. Todas las cifras de este artículo se calculan con las
 * funciones de `content/analisis`, que tienen su prueba: ni la tabla ni el
 * punto de equilibrio se escribieron a mano.
 */

/** Honorarios de ejemplo para el caso de la retención. */
const HONORARIOS = 100_000;

export function CuerpoIvaSiete() {
  const equilibrio = puntoDeEquilibrio();
  const equilibrioFrontera = puntoDeEquilibrio(8);
  const retenido = (FRACCION_RETENCION * TASA_GENERAL * HONORARIOS) / 100;

  return (
    <>
      <Seccion
        id="que-dice"
        titulo="Qué dice exactamente"
        descripcion="Iniciativa de Ley de Ingresos 2027, artículo 25, fracción XVIII."
      >
        <div className="prosa">
          <p>
            Lo primero que conviene saber es dónde vive: <strong>no es una reforma a la Ley del IVA</strong>,
            sino una facilidad dentro de la Ley de Ingresos. Las leyes de ingresos rigen un solo año, así
            que el esquema tendría que volver a aprobarse cada ejercicio para seguir existiendo. Así lo
            dice la fracción:
          </p>
          <ul>
            <li>Es una <strong>opción</strong>, para personas físicas y morales del RESICO. Nadie está obligado.</li>
            <li>
              Cada mes pagas el <strong>{TASA_OPCIONAL} %</strong> del total de lo que efectivamente
              cobraste por actividades gravadas con IVA. Esos pagos son <strong>definitivos</strong>.
            </li>
            <li>
              <strong>No acreditas nada.</strong> El IVA que te cobraron en compras e importaciones deja
              de restarse. Lo único que puedes restar es el IVA que te hayan retenido en el mes.
            </li>
            <li>
              <strong>Tu factura no cambia:</strong> a tus clientes les sigues trasladando el IVA a la
              tasa que corresponda. Y la diferencia entre lo que trasladas y lo que pagas no se
              considera ingreso para el ISR.
            </li>
            <li>
              En las <strong>importaciones</strong> pagas el IVA normal en aduana. Si en el año importas
              más que el límite del RESICO, dejas la opción al mes siguiente.
            </li>
            <li>
              Las <strong>personas físicas</strong> que opten no estarían obligadas a llevar contabilidad
              por esas operaciones, aunque sí a conservar los comprobantes de lo que cobraron.
            </li>
          </ul>
        </div>
      </Seccion>

      <Seccion id="cuenta" titulo="La cuenta: cuándo te conviene">
        <div className="prosa">
          <p>
            Con la mecánica normal pagas la diferencia entre el IVA que cobras y el que te cobraron. Con
            la opción pagas el {TASA_OPCIONAL} % de lo cobrado, compres lo que compres. La pregunta, por
            tanto, es una sola: <strong>¿cuánto pesan tus compras con IVA frente a tus ventas?</strong>
          </p>
          <p>
            Igualando las dos mecánicas —{TASA_GENERAL} % de ventas menos compras, contra{' '}
            {TASA_OPCIONAL} % de ventas— sale el punto de equilibrio: la opción conviene mientras tus
            compras con IVA sean <strong>menos del {porcentaje(equilibrio)} de tus ventas</strong>, las
            dos medidas sin IVA.
          </p>
        </div>

        <GraficaIvaEquilibrio />

        <TablaEnvoltura etiqueta="Comparación de IVA mensual con la mecánica normal y con la opción del 7 %" className="mt-8">
          <table className={`${TABLA} min-w-[40rem]`}>
            <caption className="sr-only">
              IVA a pagar en un mes con ventas de 100 mil pesos sin IVA, según el peso de las compras
            </caption>
            <thead>
              <tr>
                <th scope="col" className={TH}>Perfil</th>
                <th scope="col" className={`${TH} text-right`}>Compras con IVA (sin IVA)</th>
                <th scope="col" className={`${TH} text-right`}>IVA normal</th>
                <th scope="col" className={`${TH} text-right`}>IVA con la opción</th>
                <th scope="col" className={`${TH} text-right`}>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {CASOS_IVA.map((c) => {
                const normal = ivaNormal(c.ventas, c.compras);
                const opcion = ivaOpcional(c.ventas);
                const dif = normal - opcion;
                return (
                  <tr key={c.perfil}>
                    <td className={TD}>{c.perfil}</td>
                    <td className={TD_CIFRA}>{pesosExactos(c.compras)}</td>
                    <td className={TD_CIFRA}>{pesosExactos(normal)}</td>
                    <td className={TD_CIFRA}>{pesosExactos(opcion)}</td>
                    <td className={TD_CIFRA}>
                      {dif > 0 ? `Ahorras ${pesosExactos(dif)}` : dif < 0 ? `Pagas ${pesosExactos(-dif)} más` : 'Igual'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TablaEnvoltura>
        <p className="mt-2 text-sm text-[var(--color-tinta-tenue)]">
          Ventas de {pesosExactos(CASOS_IVA[0]!.ventas)} al mes, sin IVA, a tasa general del{' '}
          {TASA_GENERAL} %, sin retenciones.
        </p>

        <div className="prosa mt-6">
          <p>
            La regla práctica: <strong>los servicios y los negocios de margen alto ganan; los que revenden
            con margen corto pierden.</strong> Y como la decisión dura todo el año, la cuenta hay que
            hacerla con el año completo, no con un mes bueno.
          </p>
        </div>
      </Seccion>

      <Seccion id="trampas" titulo="Tres casos para mirar dos veces">
        <div className="prosa">
          <h3>1. Si trasladas IVA a una tasa menor al 16 %</h3>
          <p>
            El punto de equilibrio depende de la tasa que cobras. Con el 8 % del estímulo de la región
            fronteriza, la opción sólo conviene si tus compras con IVA son menos del{' '}
            <strong>{porcentaje(equilibrioFrontera)}</strong> de tus ventas: un punto de margen. Para
            casi cualquier negocio con insumos, pagarías de más.
          </p>

          <h3>2. Si vendes a tasa 0 %</h3>
          <p>
            Alimentos, medicinas y otros bienes a tasa 0 % no generan IVA a cargo; con la mecánica
            normal casi siempre tienes saldo a favor. La fracción calcula el {TASA_OPCIONAL} % sobre las
            contraprestaciones «gravadas», y la tasa 0 % es, técnicamente, un acto gravado. La iniciativa
            no aclara si se incluiría. En cualquier lectura, si tus ventas son a tasa 0 %, no hay
            escenario en que optar te convenga.
          </p>

          <h3>3. Si le facturas a personas morales</h3>
          <p>
            Cuando una persona física cobra honorarios o renta a una empresa, ésta le retiene dos
            terceras partes del IVA (Reglamento de la Ley del IVA, art. 3). Sobre{' '}
            {pesosExactos(HONORARIOS)} de honorarios eso es <strong>{pesosExactos(retenido)}</strong>:
            más que los {pesosExactos(ivaOpcional(HONORARIOS))} que pagarías con la opción.
          </p>
        </div>
        <Nota tono="atencion" titulo="Una pregunta que la iniciativa deja abierta" className="mt-4">
          <p>
            La fracción sólo dice que «únicamente disminuirán» lo retenido, y que los pagos son
            definitivos. No dice qué pasa con los {pesosExactos(excedenteRetencion(HONORARIOS))} de
            diferencia de este ejemplo. Hasta que el SAT publique sus reglas, ésa es una pregunta sin
            respuesta, y es justo la situación de muchos profesionistas y arrendadores del RESICO.
          </p>
        </Nota>
      </Seccion>

      <Seccion id="todo-el-ano" titulo="Se decide para todo el año">
        <div className="prosa">
          <ul>
            <li>
              Se presenta un <strong>aviso al SAT dentro de los 30 días siguientes al primer cobro del
              año</strong>, conforme a las reglas que emita.
            </li>
            <li>Se aplica por <strong>meses de calendario completos</strong>.</li>
            <li>
              Una vez ejercida, <strong>no puede cambiarse durante el ejercicio</strong>. Si en marzo tus
              compras suben, no hay vuelta atrás hasta el año siguiente.
            </li>
            <li>Si dejas de tributar en RESICO, la opción termina ese mismo mes.</li>
          </ul>
        </div>
      </Seccion>

      <Seccion id="antilavado" titulo="¿Y la Ley Antilavado?">
        <div className="prosa">
          <p>
            Nada cambia. Es una forma de pagar IVA: no mueve qué operaciones son vulnerables ni sus
            umbrales, y los comprobantes siguen siendo obligatorios —la propia fracción exige conservar
            los de lo cobrado—.
          </p>
          <p>
            Un recordatorio que sí aplica: la opción se calcula sobre lo efectivamente cobrado, y cobrar
            en efectivo no altera la cuenta del IVA, pero sí puede toparse con los{' '}
            <Link href="/limites-efectivo">límites del artículo 32</Link>, que siguen igual.
          </p>
        </div>
      </Seccion>
    </>
  );
}
