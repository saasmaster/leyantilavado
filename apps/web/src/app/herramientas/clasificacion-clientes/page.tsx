import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { ClasificacionClientes } from './ClasificacionClientes';

export const metadata: Metadata = construirMetadata({
  titulo: 'Clasificación de clientes por nivel de riesgo',
  descripcion:
    'Clasifica tu cartera en riesgo bajo, medio o alto con preguntas en lenguaje llano, ponderadas por la metodología del enfoque basado en riesgos.',
  ruta: '/herramientas/clasificacion-clientes',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="clasificacion-clientes"
      titulo="Clasificación de clientes"
      entradilla="Ocho preguntas por cliente, en español y sin jerga, que se convierten en un puntaje ponderado, un nivel de riesgo y una fecha de próxima revisión."
      tambienVer={['matriz-riesgos', 'checklist-expediente']}
      lecturas={[
        { href: '/obligaciones/clasificacion-clientes', etiqueta: 'La obligación de clasificar' },
        { href: '/obligaciones/perfil-transaccional', etiqueta: 'Perfil transaccional' },
        {
          href: '/obligaciones/personas-politicamente-expuestas',
          etiqueta: 'Personas políticamente expuestas',
        },
      ]}
      introduccion={
        <>
          <p>
            Cada cliente tiene que quedar clasificado en riesgo bajo, medio o alto, y la
            clasificación tiene que revisarse periódicamente. Suena simple hasta que hay que
            aplicarlo a doscientos clientes con criterio uniforme y dejar rastro de por qué cada uno
            quedó donde quedó.
          </p>
          <p>
            Esta herramienta traduce la metodología a ocho preguntas en lenguaje llano. Contestas
            por cliente y el motor hace la ponderación con los mismos pesos que usa la matriz de
            riesgos. El resultado incluye la justificación de cada factor —la opción que elegiste—,
            que es lo que después se pega en la ficha del expediente.
          </p>
          <p>
            Lo importante no es la etiqueta: es lo que dispara. Un cliente en riesgo alto obliga a
            debida diligencia reforzada, y la condición de persona políticamente expuesta la activa
            aunque el puntaje total no llegue a alto.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            Cada respuesta corresponde a un puntaje de 0 a 100 en su factor. Esa traducción es{' '}
            <strong>nuestra propuesta editorial</strong>, no un dato legal: sirve para clasificar
            rápido y de forma consistente, y está pensada para que la revises contra tu propia
            metodología.
          </p>
          <p>
            Los pesos vienen del motor, los mismos ocho factores de la matriz de riesgos: tipo de
            operación, tipo de cliente, ubicación, canal de entrega, PEP, beneficiario controlador,
            volumen y medio de pago. El puntaje ponderado se normaliza a la escala de 0 a 100 y se
            ubica contra los cortes de la metodología.
          </p>
          <p>
            La próxima revisión se fija a <strong>seis meses</strong>, que es la periodicidad mínima
            que la norma pide para la clasificación de clientes. Un cliente de riesgo alto conviene
            revisarlo antes.
          </p>
          <p>
            El archivo exportado trae la referencia interna, el puntaje, el nivel, si aplica
            diligencia reforzada y la fecha de la siguiente revisión. Nunca lleva nombres reales,
            porque la herramienta te pide referencias, no identidades.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Inmobiliaria con tres clientes muy distintos.</strong>
          </p>
          <ul>
            <li>
              <strong>Cliente 1:</strong> persona física residente, compra un departamento,
              presencial, no PEP verificado, paga por transferencia. Puntaje cercano a{' '}
              <strong>20</strong>: riesgo bajo.
            </li>
            <li>
              <strong>Cliente 2:</strong> persona moral con estructura simple, operación en zona de
              incidencia moderada, contacto remoto, beneficiario controlador identificado
              parcialmente, pago mixto. Puntaje cercano a <strong>50</strong>: riesgo medio.
            </li>
            <li>
              <strong>Cliente 3:</strong> fideicomiso, zona de alto riesgo, relación totalmente
              digital, beneficiario controlador no identificado, efectivo predominante. Puntaje por
              encima de <strong>75</strong>: riesgo alto y{' '}
              <strong>debida diligencia reforzada</strong>.
            </li>
          </ul>
          <p>
            El tercer caso es el interesante: ningún dato aislado lo condena, pero la suma de
            estructura opaca, canal sin contacto, beneficiario desconocido y efectivo dibuja
            exactamente el perfil que la norma quiere que mires dos veces. Y mientras el
            beneficiario controlador siga sin identificarse, ese cliente no puede bajar de nivel por
            más que el resto mejore.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Los puntajes de cada respuesta vienen de la ley?',
          respuesta:
            'No. La ley exige una metodología documentada, no una tabla concreta. Los puntajes son nuestra propuesta editorial para clasificar de forma consistente; los pesos con los que se ponderan sí vienen del motor y son los mismos de la matriz de riesgos.',
        },
        {
          pregunta: '¿Puedo cambiar los pesos desde aquí?',
          respuesta:
            'Desde aquí no, para que la clasificación de toda la cartera sea comparable. Los pesos se ajustan en la matriz de riesgos, que es donde se documenta la metodología de la organización.',
        },
        {
          pregunta: '¿Cada cuándo hay que revisar la clasificación?',
          respuesta:
            'Al menos cada seis meses, y antes si cambian las circunstancias del cliente o si su comportamiento se desvía del perfil transaccional declarado. La herramienta calcula esa fecha desde la fecha de clasificación que capturas.',
        },
        {
          pregunta: '¿Por qué me piden una referencia en lugar del nombre?',
          respuesta:
            'Porque el archivo que exportes o imprimas puede acabar donde no controlas. La herramienta no necesita el nombre para calcular, así que no te lo pedimos: úsalo sólo en tu expediente interno.',
        },
        {
          pregunta: '¿Qué hago con los clientes de riesgo alto?',
          respuesta:
            'Aplicar debida diligencia reforzada: aprobación de un nivel jerárquico superior para iniciar o continuar la relación, verificación del origen de los recursos, monitoreo más frecuente y revisión de la clasificación en plazos más cortos. Todo con evidencia documentada.',
        },
      ]}
    >
      <ClasificacionClientes />
    </MarcoHerramienta>
  );
}
