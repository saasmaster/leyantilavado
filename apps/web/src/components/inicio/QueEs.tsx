import Link from 'next/link';
import { datos } from '@leyantilavado/rules-engine';

/**
 * «¿Qué es la Ley Antilavado en México?»
 *
 * Bloque de respuesta directa para la consulta principal del sitio. Va justo
 * después del hero por dos motivos que apuntan al mismo sitio: es lo primero
 * que pregunta quien llega sin saber nada, y es el formato que un asistente
 * puede citar entero sin recortarlo.
 *
 * De ahí que sea un solo párrafo autocontenido, con el nombre oficial, los
 * tres artículos que estructuran todo el régimen y ninguna referencia
 * deíctica: nada de «como vimos arriba» ni «esta ley», que fuera de contexto
 * no significan nada.
 *
 * Los enlaces son de texto normal y descriptivo, no un carrusel de tarjetas:
 * desde aquí salen los cinco caminos del sitio, y conviene que un rastreador
 * los vea como lo que son.
 */

const TOTAL_ACTIVIDADES = datos.ACTIVIDADES.length;

export function QueEs() {
  return (
    <section
      aria-labelledby="que-es-titulo"
      className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]"
    >
      <div className="contenedor-app py-14 md:py-16">
        <div className="max-w-3xl">
          <h2
            id="que-es-titulo"
            className="text-2xl font-semibold text-[var(--color-tinta)] md:text-3xl"
          >
            ¿Qué es la Ley Antilavado en México?
          </h2>

          <p className="prosa mt-4 text-[1.05rem] leading-relaxed text-[var(--color-tinta-suave)]">
            La Ley Antilavado, cuyo nombre oficial es{' '}
            <strong className="font-medium text-[var(--color-tinta)]">
              Ley Federal para la Prevención e Identificación de Operaciones con Recursos de
              Procedencia Ilícita (LFPIORPI)
            </strong>
            , establece qué actividades económicas deben identificar a sus clientes, acumular
            operaciones, presentar avisos al SAT y respetar límites al uso de efectivo. Su artículo
            17 define las {TOTAL_ACTIVIDADES} actividades vulnerables, el artículo 18 las
            obligaciones de quien las realiza y el artículo 32 las restricciones al pago en
            efectivo.
          </p>

          <p className="prosa mt-4 text-[1.05rem] leading-relaxed text-[var(--color-tinta-suave)]">
            No basta con estar en un giro determinado: la ley enumera{' '}
            <em>actos</em>, y quedas dentro si realizas alguno de forma habitual o profesional,
            aunque tu actividad principal sea otra.
          </p>

          <nav aria-label="Temas principales" className="mt-7">
            <ul className="flex flex-col gap-2.5 text-[1.02rem]">
              <li>
                <Link
                  href="/actividades-vulnerables"
                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                >
                  Qué actividades vulnerables define el artículo 17
                </Link>
              </li>
              <li>
                <Link
                  href="/obligaciones"
                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                >
                  Qué obligaciones impone el artículo 18 y con qué evidencia se demuestran
                </Link>
              </li>
              <li>
                <Link
                  href="/umbrales"
                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                >
                  Desde qué monto hay que identificar al cliente y desde cuál presentar aviso
                </Link>
              </li>
              <li>
                <Link
                  href="/limites-efectivo"
                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                >
                  Cuánto efectivo permite recibir el artículo 32 en cada operación
                </Link>
              </li>
              <li>
                <Link
                  href="/reforma-ley-antilavado-2026"
                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                >
                  Qué cambió con la reforma de 2025 y el Acuerdo 115/2026
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
