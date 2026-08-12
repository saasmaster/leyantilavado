import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';
import { TablaComparativaSemilla } from '@/components/admin/TablaComparativaSemilla';
import { SEMILLA_UMA } from '@/components/admin/semillas';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'year', titulo: 'Año', formato: 'numero' },
  { clave: 'daily_cents', titulo: 'UMA diaria', formato: 'dinero' },
  { clave: 'valid_from', titulo: 'Vigente desde', formato: 'fecha' },
  { clave: 'valid_to', titulo: 'Vigente hasta', formato: 'fecha' },
  { clave: 'verification', titulo: 'Verificación', formato: 'insignia' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'last_review_at', titulo: 'Última revisión', formato: 'fecha', vacio: 'Nunca' },
  { clave: 'editorial_note', titulo: 'Nota editorial', vacio: 'Sin nota' },
];

export default function PaginaUMA() {
  return (
    <RecursoAdmin
      titulo="Valores de la UMA"
      descripcion="El valor diario de la Unidad de Medida y Actualización con su ventana de vigencia. Todos los umbrales de la ley se expresan en UMA, así que un valor equivocado aquí desplaza todos los cálculos del sitio."
      tabla="uma_values"
      columnas={COLUMNAS}
      ordenarPor="year"
      incluirEliminados
      aviso={
        <Nota tono="atencion" titulo="La vigencia importa más que el año">
          <p>
            Cada valor guarda su propia ventana porque la UMA no entra en vigor el 1 de enero: una
            operación de las primeras semanas del año se mide con el valor del año anterior. Por eso
            la tabla guarda <code>valid_from</code> y <code>valid_to</code> y no sólo el año, y por
            eso el motor resuelve la UMA con la fecha de la operación, nunca con la de hoy.
          </p>
          <p>
            Un valor con verificación distinta de <code>oficial_verificado</code> no se contrastó
            directamente contra el comunicado del INEGI del año que corresponde. No lo publiques
            como si lo estuviera.
          </p>
        </Nota>
      }
    >
      <TablaComparativaSemilla
        tabla="uma_values"
        clave="year"
        titulo="Valores que trae el motor"
        filas={SEMILLA_UMA}
      />
    </RecursoAdmin>
  );
}
