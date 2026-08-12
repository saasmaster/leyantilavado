import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { Conversor } from './Conversor';
import { TablaHistorica } from './TablaHistorica';

export const metadata: Metadata = construirMetadata({
  titulo: 'Conversor de UMA a pesos, 2016 a 2026',
  descripcion:
    'Convierte UMA a pesos con el valor vigente en la fecha exacta de tu operación. Tabla histórica 2016-2026 y la regla del 1 de febrero de cada año.',
  ruta: '/herramientas/calculadora-uma',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="calculadora-uma"
      titulo="Conversor de UMA"
      entradilla="Convierte en los dos sentidos con el valor correcto para la fecha de tu operación, no con el del año en curso. Incluye la tabla histórica completa de 2016 a 2026."
      actualizadoEn="2026-08-11"
      tambienVer={['calculadora-umbrales', 'calculadora-multas']}
      lecturas={[
        { href: '/umbrales', etiqueta: 'Tabla de umbrales por actividad' },
        { href: '/glosario', etiqueta: 'Glosario: qué es la UMA y por qué se usa' },
        { href: '/multas', etiqueta: 'Multas expresadas en UMA' },
      ]}
      introduccion={
        <>
          <p>
            La Unidad de Medida y Actualización sustituyó al salario mínimo como referencia para
            multas, umbrales y obligaciones. Toda la Ley Antilavado está escrita en UMA: los
            umbrales del artículo 17, los límites de efectivo del artículo 32 y los rangos de multa
            del artículo 54. Sin convertir a pesos, ninguno de esos números te sirve para decidir.
          </p>
          <p>
            Hay un detalle que casi todas las tablas publicadas ignoran y que cambia el resultado
            durante un mes entero cada año: <strong>la UMA nueva entra en vigor el 1 de febrero</strong>
            , no el 1 de enero. El INEGI publica el valor en enero, pero rige a partir de febrero.
            Una operación del 20 de enero de 2026 se mide con los $113.14 de 2025, no con los
            $117.31 de 2026. Sobre un umbral de 8,025 UMA la diferencia son más de treinta y tres mil
            pesos.
          </p>
          <p>
            Por eso este conversor pide la fecha de la operación y no el año. Si no tenemos
            registrado el valor de esa fecha, te lo dice: preferimos no responder a extrapolar una
            cifra que después alguien use para decidir si presenta un aviso.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            <strong>De UMA a pesos:</strong> se localiza el valor diario vigente en la fecha
            capturada y se multiplica. La multiplicación se hace en aritmética entera de centavos,
            no con decimales de punto flotante, porque 645 × 117.31 en coma flotante da
            75,664.9499999… y una comparación contra el umbral fallaría exactamente en el borde,
            que es donde importa.
          </p>
          <p>
            <strong>De pesos a UMA:</strong> se divide el monto entre el valor diario de esa misma
            fecha. Sirve para leer una multa al revés: si te notificaron una sanción, ver a cuántas
            UMA equivale te dice en qué punto del rango legal cayó.
          </p>
          <p>
            <strong>Mensual y anual:</strong> se derivan como lo hace el INEGI. La mensual es la
            diaria multiplicada por 30.4, y la anual es esa mensual por doce. Aparecen en normas
            distintas a la Ley Antilavado, por eso se muestran junto a la diaria.
          </p>
          <p>
            La vigencia de cada valor va del 1 de febrero de su año al 31 de enero del siguiente. La
            tabla histórica de abajo lo muestra en la columna de vigencia.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Dos operaciones idénticas con veinte días de diferencia.</strong> Una joyería
            vende una pieza en <strong>$190,000</strong>. El umbral de aviso de metales y joyería es
            de <strong>1,605 UMA</strong>.
          </p>
          <ul>
            <li>
              Venta del <strong>20 de enero de 2026</strong>: aplica la UMA de 2025, $113.14.
              Umbral = 1,605 × 113.14 = <strong>$181,589.70</strong>. Los $190,000 lo superan:{' '}
              <strong>hay aviso</strong>.
            </li>
            <li>
              Venta del <strong>20 de febrero de 2026</strong>: aplica la UMA de 2026, $117.31.
              Umbral = 1,605 × 117.31 = <strong>$188,282.55</strong>. Los $190,000 también lo
              superan: hay aviso, pero por un margen mucho más estrecho.
            </li>
          </ul>
          <p>
            Ahora al revés, con una venta de <strong>$185,000</strong>: en enero genera aviso y en
            febrero no. Es exactamente el mismo contrato, el mismo cliente y la misma pieza. Quien
            use una tabla “2026” para las operaciones de enero va a reportar de menos, y quien use
            la de 2025 en febrero va a reportar de más.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Por qué la UMA de 2026 no aplica en enero de 2026?',
          respuesta:
            'Porque el valor publicado por el INEGI entra en vigor el 1 de febrero de cada año. Durante enero sigue rigiendo el valor del año anterior. Es la razón por la que esta herramienta pide la fecha de la operación en lugar del año.',
        },
        {
          pregunta: '¿Qué diferencia hay entre UMA diaria, mensual y anual?',
          respuesta:
            'La diaria es el valor base publicado. La mensual se calcula como la diaria por 30.4 y la anual como esa mensual por doce. La Ley Antilavado usa la diaria en todos sus umbrales y multas; la mensual y la anual aparecen en otras normas, por ejemplo en materia de seguridad social.',
        },
        {
          pregunta: '¿Hasta qué año llega la tabla?',
          respuesta:
            'Tenemos registrados los valores desde 2016, el primer año de la UMA, hasta 2026. Si capturas una fecha anterior a 2016 o posterior al periodo registrado, la herramienta lo dice en lugar de estimar un valor.',
        },
        {
          pregunta: '¿Puedo usar el conversor para calcular una multa?',
          respuesta:
            'Sí, pero el estimador de multas hace más: además de convertir el rango en UMA, aplica la regla de la cantidad mayor frente al porcentaje del valor del acto, que es donde las cifras se disparan.',
        },
        {
          pregunta: '¿La UMA sube cada año?',
          respuesta:
            'Se actualiza conforme a la inflación observada del año anterior, así que en la práctica ha subido cada año desde 2016. Eso significa que un umbral en UMA se traduce en más pesos cada febrero, y que una operación que hace dos años generaba aviso hoy podría no generarlo con el mismo importe nominal.',
        },
      ]}
    >
      <div className="flex flex-col gap-10">
        <Conversor />
        <section aria-labelledby="tabla-uma">
          <h2
            id="tabla-uma"
            className="text-2xl font-semibold text-[var(--color-tinta)] font-[family-name:var(--font-display)]"
          >
            Tabla histórica de la UMA, 2016 a 2026
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--color-tinta-suave)]">
            Valores publicados por el INEGI, con el periodo exacto en que rige cada uno.
          </p>
          <div className="mt-4">
            <TablaHistorica />
          </div>
        </section>
      </div>
    </MarcoHerramienta>
  );
}
