import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'slug', titulo: 'Ruta' },
  { clave: 'title', titulo: 'Título' },
  { clave: 'section', titulo: 'Sección', formato: 'insignia' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'author_id', titulo: 'Autor', vacio: 'Sin autor' },
  { clave: 'reviewer_id', titulo: 'Revisor', vacio: 'Sin revisor jurídico' },
  { clave: 'reviewed_at', titulo: 'Revisado', formato: 'fecha', vacio: 'Nunca' },
  { clave: 'review_due_at', titulo: 'Revisar antes de', formato: 'fecha', vacio: 'Sin caducidad' },
  { clave: 'legal_version', titulo: 'Versión legal', vacio: 'Sin versión' },
  { clave: 'published_at', titulo: 'Publicado', formato: 'fecha_hora', vacio: 'Sin publicar' },
];

export default function PaginaArticulos() {
  return (
    <RecursoAdmin
      titulo="Artículos"
      descripcion="El contenido editorial del sitio público. Cada artículo guarda contra qué versión legal se escribió y cuándo hay que volver a revisarlo."
      tabla="articles"
      columnas={COLUMNAS}
      ordenarPor="updated_at"
      aviso={
        <Nota tono="atencion" titulo="El contenido jurídico caduca">
          <p>
            La columna <code>review_due_at</code> es lo que evita que una guía escrita contra una
            reforma anterior siga en línea como si fuera vigente. Cuando esa fecha pasa, se levanta
            una alerta en <em>Contenido desactualizado</em>; no se despublica sola, porque decidir
            si un texto sigue siendo correcto es trabajo de una persona.
          </p>
          <p>
            Un artículo con conclusión jurídica y sin revisor asignado no debería estar publicado:
            la firma del revisor es lo que respalda el sello de procedencia que ve el lector.
          </p>
        </Nota>
      }
    />
  );
}
