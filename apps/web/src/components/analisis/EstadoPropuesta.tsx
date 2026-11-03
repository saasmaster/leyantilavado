import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Nota } from '@leyantilavado/ui';
import { CALENDARIO_LEGISLATIVO, VOTACIONES } from '@/content/analisis';

/**
 * Aviso de estado de los análisis: todavía no es ley.
 *
 * Va igual, y arriba, en los tres análisis y en la portada de la sección. Los
 * tres hablan de iniciativas, y la forma más común de desinformar sobre una
 * reforma es contarla como si ya estuviera aprobada. Una etiqueta en la
 * cabecera no alcanzaba: se lee de pasada. Este bloque dice qué falta para que
 * sea ley y qué rige mientras tanto.
 *
 * El plazo que se cita es el único que la ley fija: el de la Ley de Ingresos
 * (Ley Federal de Presupuesto y Responsabilidad Hacendaria, art. 42, fr. IV).
 * Las demás iniciativas no tienen fecha obligatoria, y decir lo contrario
 * sería inventarla.
 */
export function EstadoPropuesta({ className = 'mb-10' }: { className?: string }) {
  return (
    <Nota tono="atencion" titulo="Todavía no es ley" className={className}>
      <p>
        Lo que se analiza aquí nació en iniciativas que el Ejecutivo presentó al Congreso el{' '}
        {formatearFechaLarga(CALENDARIO_LEGISLATIVO.presentacion)}. El Congreso ya las votó, pero
        ninguna se había publicado en el Diario Oficial de la Federación, y mientras no se publiquen{' '}
        <strong>rige la ley actual</strong>.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          Ley de Economía Digital: Diputados el {formatearFechaLarga(VOTACIONES.economiaDigital.diputados)}{' '}
          y Senado el {formatearFechaLarga(VOTACIONES.economiaDigital.senado)}; pasó al Ejecutivo.
        </li>
        <li>
          Ley de Ingresos 2027 (donde está el IVA del 7 %): Senado el{' '}
          {formatearFechaLarga(VOTACIONES.leyIngresos.senado)}, sin cambios; pasó al Ejecutivo.
        </li>
        <li>
          Reforma a la LISR (RESICO): Diputados el {formatearFechaLarga(VOTACIONES.lisr.diputados)}; el
          Senado la aprobó el {formatearFechaLarga(VOTACIONES.lisr.senado)} con un cambio ajeno al
          RESICO y volvió a Diputados.
        </li>
      </ul>
      <p className="mt-2">
        Fechas y votos de la prensa; los análisis leen el texto de la iniciativa y se contrastarán con
        el decreto cuando aparezca en el DOF. Ninguna reforma toca la Ley Antilavado.
      </p>
    </Nota>
  );
}
