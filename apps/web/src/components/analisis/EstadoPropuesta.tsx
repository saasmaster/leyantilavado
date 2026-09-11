import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Nota } from '@leyantilavado/ui';
import { CALENDARIO_LEGISLATIVO } from '@/content/analisis';

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
        Lo que se analiza aquí está en iniciativas que el Ejecutivo presentó al Congreso el{' '}
        {formatearFechaLarga(CALENDARIO_LEGISLATIVO.presentacion)}. Pueden aprobarse como están,
        modificarse o no aprobarse, y mientras no se publiquen en el Diario Oficial de la Federación{' '}
        <strong>rige la ley actual</strong>.
      </p>
      <p className="mt-2">
        De lo que aquí se analiza, sólo la Ley de Ingresos tiene plazo legal para votarse: a más tardar
        el {formatearFechaLarga(CALENDARIO_LEGISLATIVO.diputados)} en la Cámara de Diputados y el{' '}
        {formatearFechaLarga(CALENDARIO_LEGISLATIVO.senado)} en el Senado. Cuando se voten, estos
        análisis se actualizarán con lo que quede aprobado.
      </p>
    </Nota>
  );
}
