import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { Cuestionario } from './Cuestionario';

export const metadata: Metadata = construirMetadata({
  titulo: '¿Me aplica la Ley Antilavado? Cuestionario guiado',
  descripcion:
    'Diagnóstico paso a paso: detecta si realizas una actividad vulnerable del artículo 17 y te dice qué obligaciones se activan y con qué fechas.',
  ruta: '/herramientas/cuestionario',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="cuestionario"
      titulo="¿Me aplica la Ley Antilavado?"
      entradilla="Un diagnóstico que ramifica según lo que contestas y termina con números concretos, no con un “consulta a un especialista”. Se resuelve completo en tu navegador."
      actualizadoEn="2026-08-11"
      tambienVer={['calculadora-umbrales', 'plan-cumplimiento']}
      lecturas={[
        { href: '/actividades-vulnerables', etiqueta: 'Las 16 fracciones del artículo 17' },
        { href: '/obligaciones', etiqueta: 'Todas las obligaciones, con su evidencia' },
        { href: '/calendario-cumplimiento', etiqueta: 'Calendario 2026-2029' },
      ]}
      introduccion={
        <>
          <p>
            La pregunta “¿me aplica?” casi nunca se responde con un sí o un no. Depende de qué actos
            realizas, de si los realizas de forma habitual o profesional, del papel que juegas frente
            al cliente, del monto, de la fecha y de si el mismo cliente repite. Este cuestionario
            recorre esas ramas en orden y llega a un resultado calculado, no a una etiqueta.
          </p>
          <p>
            La sorpresa más común es descubrir que la ley alcanza negocios que no se consideran
            financieros: una agencia de autos, una constructora que vende directo, un arrendador de
            locales, una asociación civil que recibe donativos, un despacho contable que administra
            recursos de sus clientes, una casa de empeño. Y desde la reforma de julio de 2025,
            también quien recibe recursos para un desarrollo inmobiliario en preventa.
          </p>
          <p>
            Al final verás qué se activa, con qué fechas, y qué información te falta para estar
            seguro. Lo que no verás es un “ya cumples”: eso no lo puede decir una herramienta.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            El cuestionario no tiene un puntaje ni una tabla de equivalencias. Convierte tus
            respuestas en una <strong>operación por cada actividad que marcaste</strong> y la manda
            al mismo motor que usan las demás calculadoras del sitio.
          </p>
          <p>
            Cada evaluación resuelve el umbral de identificación y el de aviso con la UMA vigente en
            la fecha capturada, revisa el límite de efectivo del artículo 32 si dijiste que recibes
            efectivo, y devuelve una conclusión con su nivel de confianza.
          </p>
          <p>
            Cuando marcas varias actividades, la conclusión global es{' '}
            <strong>la más severa</strong> de todas: si una sola genera aviso probable, ese es el
            titular. El detalle de cada actividad se muestra abajo por separado.
          </p>
          <p>
            Las preguntas sobre PEP, beneficiario controlador y repetición con el mismo cliente no
            cambian los umbrales, pero sí agregan obligaciones y aparecen en la lista de “qué falta
            saber”. Preferimos decirte que hay un hueco a esconderlo bajo una conclusión más limpia.
          </p>
          <p>
            <strong>Nada de esto sale de tu navegador.</strong> No hay una llamada de red en todo el
            proceso. El correo se pide al final, es opcional y sólo sirve para que tu propio
            programa de correo arme el mensaje: nosotros no lo recibimos.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Despacho contable, persona moral, cinco socios.</strong> Marca dos actividades:
            servicios profesionales independientes (fracción XI) y, por un cliente en particular,
            intermediación inmobiliaria (fracción V). Operación representativa:{' '}
            <strong>$2,800,000</strong> el <strong>10 de mayo de 2026</strong>, cobrada por
            transferencia.
          </p>
          <ul>
            <li>
              En servicios profesionales elige el inciso de{' '}
              <em>administración y manejo de recursos</em> y contesta que{' '}
              <strong>sí ejecuta la operación</strong> en representación del cliente. Resultado:{' '}
              <strong>aviso sin umbral monetario</strong>. Da igual el monto.
            </li>
            <li>
              En intermediación inmobiliaria el umbral de aviso es de 8,025 UMA ={' '}
              <strong>$941,412.75</strong>. Los $2,800,000 lo superan: <strong>aviso</strong>{' '}
              también por esta vía.
            </li>
            <li>
              Conclusión global: <strong>aviso probable</strong>. Fecha límite: 17 de junio de 2026.
            </li>
            <li>
              Obligaciones que se activan: alta en el padrón, representante encargado del
              cumplimiento, identificación, expedientes, beneficiario controlador, conservación diez
              años, avisos, manual y metodología de riesgos.
            </li>
          </ul>
          <p>
            Si el mismo despacho hubiera contestado que <strong>sólo asesora</strong> y no ejecuta,
            la fracción XI no generaría aviso —pero sí identificación y expediente—, y la conclusión
            global vendría entonces sólo de la parte inmobiliaria.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Se guardan mis respuestas?',
          respuesta:
            'No. Todo el cuestionario corre en tu navegador y no hay ninguna llamada a un servidor. Si usas el botón de guardar, se escribe en el almacenamiento local de tu propio equipo y se borra cuando limpias los datos del sitio.',
        },
        {
          pregunta: '¿Por qué me piden el correo hasta el final y de forma opcional?',
          respuesta:
            'Porque el resultado es tuyo, no un cebo para conseguir tu contacto. El correo sólo sirve para que tu propio programa de correo arme un mensaje con el resumen. Nosotros no lo recibimos ni te vamos a escribir.',
        },
        {
          pregunta: '¿Qué pasa si no estoy seguro de si mi actividad es habitual o profesional?',
          respuesta:
            'Contesta que no lo sabes. El cuestionario evalúa el caso como si lo fuera, que es el escenario más exigente, y lo deja anotado entre los supuestos para que sepas exactamente qué se dio por hecho.',
        },
        {
          pregunta: '¿Marcar varias actividades multiplica mis obligaciones?',
          respuesta:
            'Las obligaciones estructurales —alta, manual, riesgos, expedientes— son las mismas. Lo que se multiplica son los umbrales que tienes que vigilar y los avisos que puedes llegar a presentar, porque cada actividad tiene su propia regla y su propia acumulación.',
        },
        {
          pregunta: '¿El resultado sirve como constancia ante el SAT?',
          respuesta:
            'No, y ninguna herramienta puede darte eso. El resultado es una orientación calculada con fuentes citadas. La constancia de cumplimiento no existe como documento; lo que existe son tus acuses, tus expedientes y tu evidencia.',
        },
      ]}
    >
      <Cuestionario />
    </MarcoHerramienta>
  );
}
