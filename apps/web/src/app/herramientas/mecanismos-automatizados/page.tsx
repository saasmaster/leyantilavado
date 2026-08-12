import type { Metadata } from 'next';
import { Nota } from '@leyantilavado/ui';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { Checklist } from '@/components/herramientas/Checklist';
import { seccionesMecanismos } from '@/lib/herramientas/checklists';
import { datos } from '@leyantilavado/rules-engine';

export const metadata: Metadata = construirMetadata({
  titulo: 'Autoevaluación de mecanismos automatizados',
  descripcion:
    'Revisa si tu sistema cumple los requisitos de detección de umbrales, acumulación de seis meses, alertas y trazabilidad exigibles bajo el Acuerdo 115/2026.',
  ruta: '/herramientas/mecanismos-automatizados',
});

const HITO = datos.CALENDARIO.find((h) => h.id === 'mecanismos-automatizados-2027');

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="mecanismos-automatizados"
      titulo="Mecanismos automatizados"
      entradilla="Las preguntas concretas que separan un sistema que detecta de una hoja de cálculo con fórmulas. Úsalas para evaluar el tuyo o para exigirle al proveedor."
      actualizadoEn="2026-08-11"
      tambienVer={['preparacion-auditoria', 'importar-operaciones']}
      lecturas={[
        {
          href: '/obligaciones/mecanismos-automatizados',
          etiqueta: 'La obligación de mecanismos automatizados',
        },
        { href: '/software-cumplimiento', etiqueta: 'Comparativo de software' },
        { href: '/calendario-cumplimiento', etiqueta: 'Fecha de exigibilidad' },
      ]}
      introduccion={
        <>
          <p>
            La normativa exige contar con mecanismos automatizados que apoyen la detección de
            umbrales, la acumulación, las alertas y la trazabilidad de las decisiones.
            {HITO ? (
              <>
                {' '}
                La fecha a partir de la cual deben estar operando es el{' '}
                <strong>{formatearFechaLarga(HITO.fecha)}</strong>.
              </>
            ) : null}
          </p>
          <p>
            El problema práctico es que “automatizado” se interpreta muy a la ligera. Una hoja de
            cálculo con una fórmula de suma no detecta la acumulación de seis meses de un cliente,
            no distingue el umbral por inciso de un notario, no sabe que la UMA cambia el 1 de
            febrero y no guarda por qué alguien decidió que una alerta no procedía.
          </p>
          <p>
            Esta autoevaluación es tan útil para revisar tu sistema como para llevársela a un
            proveedor. Las preguntas están escritas para que la respuesta sea demostrable, no
            opinable: “muéstrame la prueba con una operación de enero contra una de febrero” es más
            difícil de esquivar que “¿maneja la UMA correctamente?”.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            La primera sección se <strong>deriva del catálogo de obligaciones</strong> del motor,
            con sus pasos y su evidencia. Es el mínimo que la autoridad va a buscar.
          </p>
          <p>
            Las tres secciones siguientes —detección, acumulación y trazabilidad— son{' '}
            <strong>propuesta editorial</strong>: preguntas de implementación derivadas de los
            errores que vemos con más frecuencia. No las presentamos como texto legal citado porque
            no lo son; son la traducción operativa de lo que la norma exige.
          </p>
          <p>
            Los puntos críticos son los que producen resultados equivocados sin avisar: aplicar la
            UMA del año en curso a operaciones de enero, mezclar la base con IVA con la base sin
            IVA, no acumular en ventana móvil, y cerrar alertas sin dejar registro de la decisión.
            Un sistema que falla en cualquiera de esos cuatro puntos genera reportes que se ven bien
            y están mal.
          </p>
          <p>
            El puntaje mide qué proporción de los puntos aplicables marcaste como resueltos. Lo que
            marques como no aplicable sale del denominador.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Joyería con punto de venta y un tablero en hoja de cálculo.</strong> Al recorrer
            la lista descubre tres cosas:
          </p>
          <ul>
            <li>
              La hoja usa un valor fijo de UMA para todo el año. Las diecisiete operaciones de enero
              se midieron con la UMA equivocada. <strong>Punto crítico pendiente.</strong>
            </li>
            <li>
              La suma por cliente se hace por mes calendario, no en ventana móvil de seis meses. Un
              cliente que compró en marzo, mayo y julio nunca disparó alerta.{' '}
              <strong>Punto crítico pendiente.</strong>
            </li>
            <li>
              Cuando alguien revisa una alerta y concluye que no procede aviso, borra la fila.{' '}
              <strong>Punto crítico pendiente:</strong> no queda rastro de la decisión, que es
              exactamente lo que un verificador quiere ver.
            </li>
          </ul>
          <p>
            El puntaje sale bajo, pero el valor está en el diagnóstico: dos de esos tres problemas
            no producen errores visibles. La hoja seguía dando resultados “correctos” todo el año.
            Sin esta revisión, el error se habría descubierto en la verificación.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Una hoja de cálculo cuenta como mecanismo automatizado?',
          respuesta:
            'Depende de lo que haga. Si detecta umbrales por actividad e inciso, aplica la UMA vigente en la fecha de cada operación, acumula en ventana móvil de seis meses, genera alertas y conserva el historial de cambios de reglas con autor y motivo, puede sostenerse. En la práctica, muy pocas lo hacen.',
        },
        {
          pregunta: '¿Desde cuándo es exigible?',
          respuesta: HITO
            ? `Los mecanismos deben estar operando a partir del ${formatearFechaLarga(HITO.fecha)}, conforme a los artículos transitorios del Acuerdo 115/2026.`
            : 'La fecha exigible depende de los artículos transitorios del Acuerdo 115/2026. Revisa el calendario de cumplimiento.',
        },
        {
          pregunta: '¿Qué es lo que más falla en los sistemas que revisamos?',
          respuesta:
            'Cuatro cosas: usar la UMA del año en curso en las operaciones de enero, mezclar la base con IVA con la base sin IVA, acumular por mes o semestre natural en vez de ventana móvil, y no dejar registro de las alertas que se descartaron. Las cuatro producen números que se ven bien.',
        },
        {
          pregunta: '¿Puedo usar esta lista para evaluar a un proveedor?',
          respuesta:
            'Sí, es uno de sus usos previstos. Cada punto está redactado para que la respuesta se demuestre con una prueba concreta y no con una afirmación. Exporta el CSV y pídele al proveedor que lo conteste por escrito.',
        },
        {
          pregunta: '¿Tener el sistema me exime de las demás obligaciones?',
          respuesta:
            'No. El mecanismo automatizado apoya la detección, pero la responsabilidad de identificar, integrar expedientes, avisar en plazo y conservar diez años sigue siendo del sujeto obligado. Un sistema mal configurado no es una defensa.',
        },
      ]}
    >
      <Checklist
        secciones={seccionesMecanismos()}
        claveGuardado="mecanismos-automatizados"
        nombreArchivo="mecanismos-automatizados"
        tituloImpresion="Autoevaluación de mecanismos automatizados"
        etiquetaPuntaje="Cobertura del sistema"
        encabezado={
          <Nota tono="atencion" titulo="Qué está citado y qué es propuesta nuestra">
            <p>
              La primera sección viene del catálogo de obligaciones con su fuente. Las tres
              siguientes son <strong>propuesta editorial</strong>: la traducción operativa de lo que
              la norma exige, escrita a partir de los errores que más se repiten. Útiles, pero no las
              cites como texto legal.
            </p>
          </Nota>
        }
      />
    </MarcoHerramienta>
  );
}
