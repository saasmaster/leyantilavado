import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';
import { TablaComparativaSemilla } from '@/components/admin/TablaComparativaSemilla';
import { SEMILLA_ACTIVIDADES } from '@/components/admin/semillas';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'slug', titulo: 'Identificador' },
  { clave: 'fraction', titulo: 'Fracción' },
  { clave: 'short_name', titulo: 'Nombre corto' },
  { clave: 'name', titulo: 'Nombre completo' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'verification', titulo: 'Verificación', formato: 'insignia' },
  { clave: 'last_review_at', titulo: 'Última revisión', formato: 'fecha', vacio: 'Nunca' },
  { clave: 'sort_order', titulo: 'Orden', formato: 'numero' },
];

export default function PaginaActividades() {
  return (
    <RecursoAdmin
      titulo="Actividades vulnerables"
      descripcion="Los supuestos del artículo 17 de la LFPIORPI. El identificador es nuestro y es estable: si una reforma renumera las fracciones, cambia el dato de la columna “Fracción” y no se rompe ningún enlace ni ninguna regla."
      tabla="vulnerable_activities"
      columnas={COLUMNAS}
      ordenarPor="sort_order"
      ascendente
      incluirEliminados
      aviso={
        <Nota tono="info" titulo="Las descripciones son resúmenes, no transcripciones">
          <p>
            El texto que se publica en el sitio es un resumen propio redactado para que se entienda,
            no una copia del texto legal. Quien revise una actividad tiene que contrastarla contra
            la fuente citada, no contra el resumen anterior.
          </p>
        </Nota>
      }
    >
      <TablaComparativaSemilla
        tabla="vulnerable_activities"
        clave="slug"
        titulo="Actividades que trae el motor"
        filas={SEMILLA_ACTIVIDADES}
      />
    </RecursoAdmin>
  );
}
