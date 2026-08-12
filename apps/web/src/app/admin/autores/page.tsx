import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'slug', titulo: 'Ruta' },
  { clave: 'name', titulo: 'Nombre' },
  { clave: 'headline', titulo: 'Titular', vacio: 'Sin titular' },
  { clave: 'user_id', titulo: 'Cuenta ligada', vacio: 'Sin cuenta' },
  { clave: 'is_active', titulo: 'Activo', formato: 'booleano' },
  { clave: 'created_at', titulo: 'Alta', formato: 'fecha_hora' },
];

export default function PaginaAutores() {
  return (
    <RecursoAdmin
      titulo="Autores"
      descripcion="Quién firma el contenido. Un artículo sin autor identificable es un artículo del que nadie responde, y en materia legal eso vale menos que no publicarlo."
      tabla="authors"
      columnas={COLUMNAS}
      ordenarPor="created_at"
    />
  );
}
