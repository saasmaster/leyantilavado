import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';
import { TablaComparativaSemilla } from '@/components/admin/TablaComparativaSemilla';
import { SEMILLA_OBLIGACIONES } from '@/components/admin/semillas';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'slug', titulo: 'Identificador' },
  { clave: 'title', titulo: 'Obligación' },
  { clave: 'category', titulo: 'Categoría', formato: 'insignia' },
  { clave: 'recurrence', titulo: 'Recurrencia', formato: 'insignia', vacio: 'Sin recurrencia' },
  { clave: 'due_date', titulo: 'Fecha límite', formato: 'fecha', vacio: 'Sin fecha fija' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'verification', titulo: 'Verificación', formato: 'insignia' },
  { clave: 'sort_order', titulo: 'Orden', formato: 'numero' },
];

export default function PaginaObligaciones() {
  return (
    <RecursoAdmin
      titulo="Obligaciones"
      descripcion="Qué tiene que hacer un sujeto obligado y con qué evidencia lo demuestra. Los pasos de cada obligación alimentan las listas de verificación del área privada."
      tabla="obligations"
      columnas={COLUMNAS}
      ordenarPor="sort_order"
      ascendente
      incluirEliminados
      aviso={
        <Nota tono="info" titulo="Cada paso lleva la evidencia que un auditor esperaría ver">
          <p>
            La columna <code>steps</code> guarda JSON y por eso no aparece arriba; el desglose está
            en la tabla del motor. Un paso sin evidencia asociada es un paso que no sirve en una
            revisión: el objetivo de esta tabla no es enumerar buenas intenciones, sino decir qué
            documento se tiene que poder enseñar.
          </p>
          <p>
            Que una obligación esté aquí no significa que le aplique a todo el mundo: la columna de
            actividades acota a quién alcanza y una lista vacía significa &ldquo;a todas&rdquo;.
          </p>
        </Nota>
      }
    >
      <TablaComparativaSemilla
        tabla="obligations"
        clave="slug"
        titulo="Obligaciones que trae el motor"
        filas={SEMILLA_OBLIGACIONES}
      />
    </RecursoAdmin>
  );
}
