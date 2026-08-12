import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { VerificadorEfectivo } from './VerificadorEfectivo';

export const metadata: Metadata = construirMetadata({
  titulo: 'Verificador de límites de efectivo (artículo 32)',
  descripcion:
    'Comprueba si una operación rebasa el límite de efectivo del artículo 32 de la Ley Antilavado. Distingue la base con IVA del artículo 32 de la base sin IVA de los umbrales de aviso.',
  ruta: '/herramientas/limites-efectivo',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="limites-efectivo"
      titulo="Límites de efectivo del artículo 32"
      entradilla="Verifica antes de cerrar la operación. El artículo 32 es una prohibición, no un umbral de reporte: rebasarlo es infracción aunque presentes el aviso puntualmente."
      actualizadoEn="2026-08-11"
      tambienVer={['calculadora-umbrales', 'calculadora-multas']}
      lecturas={[
        { href: '/limites-efectivo', etiqueta: 'Tabla completa de límites del artículo 32' },
        { href: '/multas', etiqueta: 'Sanción por rebasar el límite de efectivo' },
        { href: '/umbrales', etiqueta: 'Umbrales de aviso del artículo 17' },
      ]}
      introduccion={
        <>
          <p>
            El artículo 32 prohíbe liquidar en efectivo, metales preciosos o piedras preciosas por
            encima de ciertos montos en determinados actos: inmuebles, vehículos, joyería y obras de
            arte, boletos de juegos con apuesta, blindaje, acciones y partes sociales,
            arrendamiento. Los límites van de 3,210 a 8,025 UMA según el tipo de operación.
          </p>
          <p>
            La diferencia con el resto de la ley es de naturaleza, no de grado. Los umbrales del
            artículo 17 te dicen <em>qué reportar</em>. El artículo 32 te dice{' '}
            <em>qué no puedes hacer</em>. Aceptar un pago en efectivo por encima del límite es la
            infracción del artículo 53 fracción VII y se sanciona con 10,000 a 65,000 UMA, o del 10%
            al 100% del valor del acto, la cantidad que resulte mayor. Presentar el aviso en tiempo
            no lo remedia.
          </p>
          <p>
            Y hay un detalle técnico que decide casos en el borde:{' '}
            <strong>el artículo 32 se mide con IVA incluido</strong>, mientras que los umbrales de
            aviso del artículo 17 se miden sin IVA. Por eso esta herramienta pide las dos bases por
            separado en lugar de suponer que son la misma cifra.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            Se localiza la regla del artículo 32 correspondiente al{' '}
            <strong>tipo de operación</strong> que elegiste, con su límite en UMA. Ese límite se
            convierte a pesos con la UMA vigente <strong>el día del pago</strong>, no la de hoy ni la
            de la firma del contrato: la ley se refiere al día en que se realiza el pago o se cumple
            la obligación.
          </p>
          <p>
            El monto liquidado en efectivo se compara contra ese límite. La comparación es estricta:
            un pago de exactamente 3,210 UMA no rebasa el límite; un centavo más, sí.
          </p>
          <p>
            El arrendamiento tiene periodicidad <strong>mensual</strong>: el límite no se mide por
            recibo sino por mes. Si un inquilino paga la renta en dos partes dentro del mismo mes,
            ambas suman contra el mismo límite.
          </p>
          <p>
            Para la consignación de pago, añadida por la reforma de julio de 2025, la tabla del SAT
            y el texto de la ley publican reglas distintas. No elegimos una en silencio: mostramos
            las dos y marcamos la regla como pendiente de aclaración de la autoridad.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Venta de un departamento.</strong> Precio pactado{' '}
            <strong>$1,200,000</strong> más IVA, pago el <strong>10 de septiembre de 2026</strong>.
            El comprador propone entregar <strong>$900,000 en efectivo</strong> y el resto por
            transferencia.
          </p>
          <ul>
            <li>
              Límite del artículo 32 para inmuebles: <strong>8,025 UMA</strong>.
            </li>
            <li>
              UMA vigente ese día: <strong>$117.31</strong>. Límite = 8,025 × 117.31 ={' '}
              <strong>$941,412.75</strong>.
            </li>
            <li>
              Los $900,000 en efectivo quedan <strong>$41,412.75 por debajo</strong> del límite. La
              operación es viable en cuanto al artículo 32.
            </li>
          </ul>
          <p>
            Ahora cambia un dato: el mismo comprador quiere entregar <strong>$1,000,000</strong> en
            efectivo. Ahora rebasa el límite por <strong>$58,587.25</strong> y la operación es
            infracción. Si el vendedor intentara arreglarlo aceptando dos entregas de $500,000 en
            días distintos, seguiría siendo infracción: el límite se mide sobre el acto, no sobre
            cada entrega.
          </p>
          <p>
            En paralelo, el umbral de aviso de intermediación inmobiliaria es de 8,025 UMA medido{' '}
            <strong>sin IVA</strong>. Los $1,200,000 sin IVA superan los $941,412.75, así que además
            hay que presentar aviso. Son dos conclusiones distintas de la misma operación.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Por qué el artículo 32 se mide con IVA y el 17 sin IVA?',
          respuesta:
            'Porque son reglas con propósitos distintos. El artículo 32 limita cuánto dinero físico puede moverse en un acto y toma el valor total de lo que efectivamente se paga, IVA incluido. Los umbrales del artículo 17 miden el valor del acto como base de reporte, sin el impuesto. La consecuencia práctica es que una misma operación puede rebasar una regla y no la otra.',
        },
        {
          pregunta: '¿Fraccionar el pago en varias entregas evita el límite?',
          respuesta:
            'No. El límite se mide sobre el acto u operación, no sobre cada pago. Repartir el efectivo en varias exhibiciones no lo respeta, y hacerlo con la intención de esquivar la regla agrava la posición frente a la autoridad.',
        },
        {
          pregunta: '¿Qué pasa si el efectivo viene en dólares?',
          respuesta:
            'Se convierte a pesos con el tipo de cambio del día del pago y se suma al efectivo en pesos antes de comparar contra el límite. La herramienta no aplica tipos de cambio porque no publicamos cifras que no podamos respaldar con una fuente oficial diaria.',
        },
        {
          pregunta: '¿Los metales preciosos cuentan como efectivo?',
          respuesta:
            'Sí. El artículo 32 habla de liquidar en efectivo, metales preciosos o piedras preciosas. Pagar el enganche de un coche con monedas de oro entra en la misma restricción que pagarlo en billetes.',
        },
        {
          pregunta: '¿Mi actividad no aparece en la lista, entonces no tengo límite?',
          respuesta:
            'Significa que el artículo 32 no prevé una restricción específica para ese acto. No elimina las demás obligaciones de la Ley Antilavado ni los límites de otras leyes, como el tope de deducibilidad fiscal de los pagos en efectivo.',
        },
      ]}
    >
      <VerificadorEfectivo />
    </MarcoHerramienta>
  );
}
