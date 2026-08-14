import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { MatrizRiesgos } from './MatrizRiesgos';

export const metadata: Metadata = construirMetadata({
  titulo: 'Matriz de riesgos con enfoque basado en riesgos',
  descripcion:
    'Pondera los factores de riesgo de tu negocio, aplica mitigantes y obtén el nivel resultante con la fecha de la próxima revisión. Pesos editables.',
  ruta: '/herramientas/matriz-riesgos',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="matriz-riesgos"
      titulo="Matriz de riesgos"
      entradilla="El enfoque basado en riesgos deja de ser una frase cuando le pones pesos, puntajes y una justificación por factor. Aquí lo armas y te lo llevas documentado."
      tambienVer={['clasificacion-clientes', 'preparacion-auditoria']}
      lecturas={[
        { href: '/obligaciones/enfoque-basado-riesgos', etiqueta: 'La obligación de metodología' },
        { href: '/calendario-cumplimiento', etiqueta: 'Desde cuándo es exigible' },
        { href: '/plantillas', etiqueta: 'Plantillas de manual y metodología' },
      ]}
      introduccion={
        <>
          <p>
            El enfoque basado en riesgos no pide que clasifiques a tus clientes “con criterio”: pide
            una <strong>metodología documentada</strong> que puedas enseñar. Qué factores
            consideras, cuánto pesa cada uno, con qué información los alimentas, qué controles
            reducen el riesgo y cada cuándo lo revisas.
          </p>
          <p>
            Esta herramienta arma esa metodología con ocho factores de partida —tipo de operación,
            tipo de cliente, geografía, canal de entrega, PEP, beneficiario controlador, volumen
            transaccional y medio de pago— y te deja mover todo: los puntajes, los pesos y los
            mitigantes.
          </p>
          <p>
            Un detalle que conviene entender antes de mover el primer control: la condición de
            persona políticamente expuesta <strong>activa la debida diligencia reforzada por sí
            sola</strong>, aunque el puntaje total no llegue a riesgo alto. No es un factor más que
            se promedia con los demás.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            <strong>Puntaje bruto.</strong> Cada factor tiene un puntaje de 0 a 100 y un peso. Se
            multiplica puntaje por peso, se suman todos y se divide entre la suma real de los pesos.
            Esa normalización permite que una metodología parcial —donde decidiste ignorar dos
            factores— siga produciendo un número comparable en la misma escala.
          </p>
          <p>
            <strong>Mitigantes.</strong> Cada control aplicado resta puntos directos al puntaje
            bruto. El resultado se acota entre 0 y 100: los mitigantes no pueden dejarte en
            negativo, ni un factor extremo puede pasarse de 100.
          </p>
          <p>
            <strong>Nivel.</strong> Se ubica el puntaje final contra los cortes de la metodología.
            Los cortes vienen del motor, no están escritos en esta página, para que si la
            metodología cambia lo haga en un solo lugar.
          </p>
          <p>
            <strong>Debida diligencia reforzada.</strong> Se activa cuando el nivel es alto{' '}
            <em>o</em> cuando el factor PEP tiene un puntaje relevante, aunque el total quede en
            medio.
          </p>
          <p>
            <strong>Próxima revisión.</strong> Se suma el número de meses que elijas a la fecha de
            la evaluación, respetando el fin de mes: 31 de enero más un mes es 28 o 29 de febrero,
            no 3 de marzo.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Casa de empeño con sucursales en zona fronteriza.</strong> Arranca con los pesos
            sugeridos y ajusta puntajes:
          </p>
          <ul>
            <li>Tipo de operación (peso 0.20): 70 — préstamos con garantía en efectivo.</li>
            <li>Tipo de cliente (0.15): 60 — público general, alta rotación.</li>
            <li>Ubicación geográfica (0.15): 80 — zona identificada como de mayor riesgo.</li>
            <li>Canal de entrega (0.15): 30 — presencial en sucursal.</li>
            <li>PEP (0.15): 10 — no es su mercado.</li>
            <li>Beneficiario controlador (0.10): 20 — clientes persona física.</li>
            <li>Volumen transaccional (0.05): 60.</li>
            <li>Medio de pago (0.05): 90 — efectivo predominante.</li>
          </ul>
          <p>
            El puntaje ponderado ronda <strong>54/100</strong>: riesgo medio. Al agregar dos
            mitigantes —monitoreo automatizado con alertas y verificación del origen de los
            recursos, cinco puntos cada uno— baja a <strong>44/100</strong>, todavía medio pero con
            margen frente al corte superior.
          </p>
          <p>
            Si el mismo negocio marcara el factor PEP en 60 porque atiende a funcionarios locales,
            el puntaje subiría poco pero se activaría la{' '}
            <strong>debida diligencia reforzada</strong> aunque el nivel siguiera siendo medio. Ese
            es el comportamiento correcto y el que casi ninguna matriz de hoja de cálculo tiene.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Los pesos que traen prellenados son los que exige la ley?',
          respuesta:
            'No. La norma no fija pesos: exige que cada organización documente y justifique su propia metodología. Los que ves son una propuesta editorial razonable y están pensados para que los muevas.',
        },
        {
          pregunta: '¿Qué pasa si mis pesos no suman 1?',
          respuesta:
            'El puntaje se normaliza por la suma real, así que sigue siendo comparable en la escala de 0 a 100. Aun así conviene que sumen 1: es más fácil de explicar en una auditoría.',
        },
        {
          pregunta: '¿Cada cuándo hay que revisar la metodología?',
          respuesta:
            'Al menos una vez al año, o antes si surgen nuevos riesgos. La clasificación de cada cliente se revisa con mayor frecuencia, al menos cada seis meses, y esa es la razón del campo de meses.',
        },
        {
          pregunta: '¿Por qué el PEP activa la diligencia reforzada aunque el puntaje sea medio?',
          respuesta:
            'Porque la condición de persona políticamente expuesta no es un factor que se diluya en un promedio: dispara medidas propias como la aprobación de un nivel jerárquico superior y el monitoreo reforzado. Promediarlo con los demás factores lo escondería.',
        },
        {
          pregunta: '¿El resultado sirve como documento de metodología?',
          respuesta:
            'Es un buen punto de partida: incluye factores, pesos, puntajes, mitigantes y tus justificaciones. Falta lo que sólo tú puedes poner: la aprobación del órgano de gobierno, la descripción de las fuentes de información y el control de versiones del documento.',
        },
      ]}
    >
      <MatrizRiesgos />
    </MarcoHerramienta>
  );
}
