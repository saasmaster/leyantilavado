import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { Comparador } from './Comparador';

export const metadata: Metadata = construirMetadata({
  titulo: 'Comparador de actividades vulnerables',
  descripcion:
    'Pon dos o tres actividades del artículo 17 lado a lado: umbrales de identificación y aviso, acumulación de seis meses y límites de efectivo.',
  ruta: '/herramientas/comparador-obligaciones',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="comparador-obligaciones"
      titulo="Comparador de actividades"
      entradilla="Dos o tres actividades vulnerables frente a frente, con los umbrales ya convertidos a pesos con la UMA de la fecha que elijas."
      tambienVer={['calculadora-umbrales', 'cuestionario']}
      lecturas={[
        { href: '/actividades-vulnerables', etiqueta: 'Las actividades del artículo 17' },
        { href: '/umbrales', etiqueta: 'Tabla completa de umbrales' },
        { href: '/limites-efectivo', etiqueta: 'Límites de efectivo por operación' },
      ]}
      introduccion={
        <>
          <p>
            Muchos negocios caen en más de una fracción del artículo 17 sin darse cuenta. Una
            desarrolladora construye y además recibe recursos en preventa. Un despacho asesora y
            además administra recursos de sus clientes. Una casa de subastas vende obras de arte y
            también joyería. Cada actividad trae su propio umbral, su propia forma de medirse y su
            propio límite de efectivo.
          </p>
          <p>
            Este comparador pone esas reglas una junto a otra para ver dónde están las diferencias
            reales. Los contrastes suelen sorprender: el umbral de aviso de intermediación
            inmobiliaria es más de cinco veces el de metales y joyería; el arrendamiento se mide por
            mes mientras casi todo lo demás se mide por operación; y varios supuestos de fe pública
            generan aviso sin ningún umbral de por medio.
          </p>
          <p>
            También sirve para el caso contrario: confirmar que la parte estructural del programa de
            cumplimiento no cambia. Los umbrales varían; el manual, la metodología de riesgos y los
            expedientes no.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            Se busca la <strong>regla vigente en la fecha de referencia</strong> para cada actividad
            e inciso elegido y se muestran sus campos tal como están registrados en el corpus legal:
            umbral de identificación, umbral de aviso, periodicidad, regla de acumulación y
            disposición de origen.
          </p>
          <p>
            Los umbrales que son un número se convierten a pesos con la UMA vigente en esa fecha. Los
            que <strong>no</strong> son un número se muestran como lo que son: “siempre, sin importar
            el monto”, “depende del supuesto” o “sin umbral publicado”. Nunca se rellena una celda
            con una cifra inventada para que la tabla se vea completa.
          </p>
          <p>
            El comparador también respeta el operador de cada regla. Verás “superior a” en la
            identificación del arrendamiento y “igual o superior a” en el resto, porque esa
            diferencia decide los casos en el borde exacto.
          </p>
          <p>
            En los límites de efectivo se listan <strong>todas</strong> las reglas del artículo 32
            aplicables a la actividad, no sólo la primera, porque algunas actividades tocan más de
            una. Las que están pendientes de aclaración de la autoridad aparecen marcadas.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Metales y joyería frente a intermediación inmobiliaria</strong>, con fecha de
            referencia en 2026:
          </p>
          <ul>
            <li>
              <strong>Identificación.</strong> Joyería: 805 UMA = $94,434.55. Inmobiliaria: siempre,
              sin importar el monto. Una joyería puede vender por $50,000 sin identificar; una
              inmobiliaria no puede intermediar nada sin identificar.
            </li>
            <li>
              <strong>Aviso.</strong> Joyería: 1,605 UMA = $188,282.55. Inmobiliaria: 8,025 UMA =
              $941,412.75. Cinco veces la diferencia.
            </li>
            <li>
              <strong>Efectivo.</strong> Joyería: 3,210 UMA = $376,565.10. Inmuebles: 8,025 UMA =
              $941,412.75.
            </li>
            <li>
              <strong>Acumulación.</strong> Ambas acumulan en ventana móvil de seis meses por
              cliente y actividad.
            </li>
          </ul>
          <p>
            La lectura práctica: la joyería vive en un régimen de umbrales bajos y muchas
            operaciones, donde el riesgo real es la acumulación por cliente. La inmobiliaria vive en
            un régimen de umbral alto y pocas operaciones, donde el riesgo real es que{' '}
            <strong>identifica siempre</strong> y por lo tanto necesita expediente completo en cada
            trato, alcance el umbral de aviso o no.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Por qué algunas celdas no traen una cifra?',
          respuesta:
            'Porque no todos los umbrales son números. Hay supuestos donde la obligación procede siempre, otros donde depende del papel que juegas frente al cliente, y dos apartados donde la autoridad no ha publicado umbral. Poner una cifra ahí sería inventarla.',
        },
        {
          pregunta: '¿Puedo comparar dos incisos de la misma actividad?',
          respuesta:
            'Sí. Elige la misma actividad en dos columnas y un inciso distinto en cada una. Es la mejor forma de ver, por ejemplo, que en notarios los inmuebles tienen umbral de 8,000 UMA mientras la constitución de personas morales genera aviso sin umbral.',
        },
        {
          pregunta: '¿Cambian las obligaciones estructurales según la actividad?',
          respuesta:
            'No. Alta en el padrón, representante encargado del cumplimiento, manual, metodología de riesgos, expedientes, conservación diez años, capacitación y auditoría aplican igual por cualquiera de las fracciones. Lo que cambia son los umbrales, la periodicidad y los límites de efectivo.',
        },
        {
          pregunta: '¿Qué significa que una regla esté marcada como pendiente de revisión?',
          respuesta:
            'Que no pudimos confirmarla en una fuente oficial y por eso no la publicamos como firme. Pasa con los apartados de fe pública sin umbral publicado y con la consignación de pago, donde la tabla del SAT y el texto de la ley no coinciden.',
        },
        {
          pregunta: '¿Puedo compartir la comparación?',
          respuesta:
            'Sí. El enlace lleva las actividades y la fecha de referencia, que no son datos personales. No lleva montos, clientes ni nada que hayas capturado en otras herramientas.',
        },
      ]}
    >
      <Comparador />
    </MarcoHerramienta>
  );
}
