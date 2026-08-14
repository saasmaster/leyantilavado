import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { EditorEstructura } from './EditorEstructura';

export const metadata: Metadata = construirMetadata({
  titulo: 'Beneficiario controlador: editor de estructura corporativa',
  descripcion:
    'Traza la cadena de propiedad, calcula la participación indirecta multiplicando porcentajes, detecta el control por otros medios y señala lo que falta.',
  ruta: '/herramientas/beneficiario-controlador',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="beneficiario-controlador"
      titulo="Beneficiario controlador"
      entradilla="Arma la estructura corporativa, deja que la herramienta multiplique los porcentajes por toda la cadena y descubre quién controla de verdad, incluso cuando el control no viene de las acciones."
      tambienVer={['checklist-expediente', 'clasificacion-clientes']}
      lecturas={[
        { href: '/obligaciones/beneficiario-controlador', etiqueta: 'La obligación completa' },
        { href: '/glosario', etiqueta: 'Glosario: beneficiario controlador y control efectivo' },
        { href: '/calendario-cumplimiento', etiqueta: 'Desde cuándo es exigible' },
      ]}
      introduccion={
        <>
          <p>
            El beneficiario controlador es siempre una <strong>persona física</strong>: la que
            finalmente obtiene el beneficio o ejerce el control de un cliente, aunque figure a tres
            sociedades de distancia. El error típico es detenerse en el primer accionista de la
            escritura y dar por cerrado el expediente cuando ese accionista es otra empresa.
          </p>
          <p>
            Hay dos obligaciones distintas que la gente mezcla.{' '}
            <strong>Como sujeto obligado de la Ley Antilavado</strong>, tienes que identificar al
            beneficiario controlador de tus clientes. <strong>Como sociedad mercantil</strong>, y
            aunque no realices ninguna actividad vulnerable, tienes que obtener y conservar la
            información de tu propio beneficiario controlador por mandato del Código Fiscal de la
            Federación. Son regímenes paralelos con sanciones separadas: las del CFF vienen en pesos
            y se aplican por cada beneficiario respecto del cual se incumple.
          </p>
          <p>
            Esta herramienta resuelve la parte aritmética, que es donde se equivocan los
            expedientes: la propiedad indirecta se multiplica a lo largo de la cadena, y varias
            cadenas hacia la misma persona se suman.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            <strong>Propiedad indirecta.</strong> Se recorre la estructura desde la entidad
            analizada hacia arriba multiplicando los porcentajes de cada eslabón. Quien tiene el 50%
            de una sociedad que a su vez tiene el 40% del cliente controla el{' '}
            <strong>20% efectivo</strong>, no el 50% ni el 40%.
          </p>
          <p>
            <strong>Cadenas múltiples.</strong> Si la misma persona llega por varias vías —10%
            directo más 20% a través de una holding— los porcentajes se suman: 30% efectivo. Cada
            cadena se muestra por separado para que se pueda auditar el cálculo.
          </p>
          <p>
            <strong>Dónde está la línea.</strong> El umbral de capital es el{' '}
            <strong>25%</strong>. La reforma del 16 de julio de 2025 lo bajó desde el 50% anterior,
            y ese cambio de una cifra reabre estructuras que ya se daban por resueltas: una sociedad
            con tres socios al 33% no tenía ningún beneficiario controlador por participación bajo
            la regla vieja y ahora tiene tres. La herramienta muestra el porcentaje con decimales,
            sin redondear, porque en el borde la diferencia decide.
          </p>
          <p>
            <strong>Y si nadie llega al 25%, no te quedas sin beneficiario controlador.</strong> El
            Acuerdo 115/2026 fija un orden de prelación de tres escalones: primero el umbral de
            capital; si nadie lo alcanza, quien ejerce el control por otros medios —dirigir la
            estrategia, imponer decisiones en asamblea, nombrar o remover al administrador—; y si
            ahí tampoco hay nadie, la persona con el cargo de mayor jerarquía administrativa. Por
            eso «mi sociedad no tiene beneficiario controlador» casi nunca es una respuesta válida:
            el tercer escalón existe para que siempre haya un nombre.
          </p>
          <p>
            <strong>No lo confundas con el del SAT.</strong> El Código Fiscal usa 15% y se conserva
            en tus registros; la Ley Antilavado usa 25% y va al expediente del cliente. Son dos
            obligaciones distintas y cumplir una no cumple la otra.
          </p>
          <p>
            <strong>Control por otros medios.</strong> Una participación mínima puede dar control
            real: un pacto de socios, un voto de calidad, la facultad de nombrar o remover al
            administrador. Cuando marcas esa casilla, la señal se arrastra por toda la cadena y la
            persona queda marcada sin importar el porcentaje.
          </p>
          <p>
            <strong>Huecos.</strong> La herramienta revisa que las participaciones de cada entidad
            sumen 100%, que ninguna cadena termine en una sociedad sin dueños capturados y que
            exista al menos una persona física al final. Si algo no cierra, lo dice: un expediente
            con huecos documentados es defendible, uno con huecos silenciosos no.
          </p>
          <p>
            <strong>Ciclos.</strong> Las participaciones recíprocas se detectan y se cortan en lugar
            de calcular indefinidamente. Esos casos requieren análisis jurídico, no aritmética.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Cliente:</strong> Constructora del Norte, S.A. de C.V. Su acta muestra dos
            accionistas.
          </p>
          <ul>
            <li>Grupo Patrimonial, S.A. de C.V. — 70%</li>
            <li>Socio B (persona física) — 30%</li>
          </ul>
          <p>
            Un expediente descuidado anota “Socio B, 30%” y cierra. Al abrir Grupo Patrimonial
            aparece:
          </p>
          <ul>
            <li>Socia A (persona física) — 60%</li>
            <li>Socio B (la misma persona física de antes) — 40%</li>
          </ul>
          <p>Multiplicando:</p>
          <ul>
            <li>
              Socia A: 60% × 70% = <strong>42% efectivo</strong>.
            </li>
            <li>
              Socio B: 30% directo + (40% × 70% = 28%) ={' '}
              <strong>58% efectivo</strong>.
            </li>
          </ul>
          <p>
            El resultado invierte la lectura ingenua: quien parecía el socio menor con 30% es en
            realidad quien controla la mayoría. Y si además existiera un pacto que le da a Socia A
            la facultad de nombrar al administrador, quedaría marcada por control por otros medios
            aunque su porcentaje fuera del 5%.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Por qué no traen ya cargado el porcentaje de control?',
          respuesta:
            'Porque ese umbral es un dato normativo que todavía no está registrado en nuestro corpus legal verificado, y la regla de la casa es no publicar cifras jurídicas sin fuente citada. El cálculo de la cadena sí es nuestro y funciona sin ese dato: te da el porcentaje efectivo de cada persona y tú aplicas el corte que corresponda a tu caso.',
        },
        {
          pregunta: '¿El beneficiario controlador puede ser una empresa?',
          respuesta:
            'No. Siempre es una persona física. Si la cadena se detiene en una sociedad, el expediente está incompleto: hay que seguir subiendo hasta llegar a personas de carne y hueso, o documentar por qué no fue posible.',
        },
        {
          pregunta: '¿Qué cuenta como control por medios distintos a la propiedad?',
          respuesta:
            'Situaciones en las que alguien decide sin tener las acciones: pactos de socios, acciones con voto de calidad, la facultad de nombrar o remover a la mayoría del consejo, o el control efectivo de las decisiones financieras y operativas. La ley mira el control real, no sólo el registro de accionistas.',
        },
        {
          pregunta: '¿Qué hago si el cliente se niega a darme la información?',
          respuesta:
            'Documentarlo. La obligación incluye registrar los casos en que no fue posible determinar al beneficiario controlador y las medidas que tomaste: la solicitud por escrito, la respuesta recibida y la decisión sobre continuar o no la relación. Ese registro es la evidencia que un auditor va a pedir.',
        },
        {
          pregunta: '¿Se guarda la estructura que capturo?',
          respuesta:
            'Sólo si le das a guardar, y en ese caso se escribe en el almacenamiento local de tu propio equipo. Aun así te recomendamos usar etiquetas genéricas en lugar de nombres reales: el archivo exportado o impreso puede terminar en manos que no controlas.',
        },
      ]}
    >
      <EditorEstructura />
    </MarcoHerramienta>
  );
}
