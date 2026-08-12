import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';
import { TablaComparativaSemilla } from '@/components/admin/TablaComparativaSemilla';
import { SEMILLA_EFECTIVO } from '@/components/admin/semillas';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'id', titulo: 'Identificador' },
  { clave: 'slug', titulo: 'Slug' },
  { clave: 'name', titulo: 'Supuesto' },
  { clave: 'limit_uma', titulo: 'Límite en UMA', formato: 'numero' },
  { clave: 'periodicity', titulo: 'Periodicidad', formato: 'insignia' },
  { clave: 'valid_from', titulo: 'Vigente desde', formato: 'fecha' },
  { clave: 'valid_to', titulo: 'Vigente hasta', formato: 'fecha', vacio: 'Indefinido' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'verification', titulo: 'Verificación', formato: 'insignia' },
];

export default function PaginaEfectivo() {
  return (
    <RecursoAdmin
      titulo="Restricciones de efectivo"
      descripcion="Los límites del artículo 32 de la LFPIORPI. No son umbrales de aviso: son prohibiciones, y rebasarlas es infracción aunque se hayan presentado todos los avisos en tiempo y forma."
      tabla="cash_restriction_rules"
      columnas={COLUMNAS}
      ordenarPor="slug"
      ascendente
      incluirEliminados
      aviso={
        <Nota tono="riesgo" titulo="Esta tabla es de prohibiciones, no de avisos">
          <p>
            Confundir el artículo 32 con el 17 es el error más caro de este tema. Un pago que rebasa
            el límite de efectivo <strong>no se arregla presentando el aviso</strong>: la operación
            no se podía liquidar así.
          </p>
          <p>
            Diferencia que casi nadie implementa: para el artículo 32 la base de comparación incluye
            el IVA, mientras que los umbrales de aviso del artículo 17 se miden sin IVA. El motor
            recibe las dos bases por separado y aquí no se mezclan.
          </p>
          <p>
            Cuando dos fuentes oficiales publican cifras distintas para el mismo supuesto, la
            columna <code>discrepancy</code> guarda ambas y la regla se queda en borrador. No se
            elige una en silencio.
          </p>
        </Nota>
      }
    >
      <TablaComparativaSemilla
        tabla="cash_restriction_rules"
        clave="id"
        titulo="Restricciones que trae el motor"
        filas={SEMILLA_EFECTIVO}
      />
    </RecursoAdmin>
  );
}
