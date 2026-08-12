import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'slug', titulo: 'Ruta' },
  { clave: 'term', titulo: 'Término' },
  { clave: 'acronym', titulo: 'Siglas', vacio: 'Sin siglas' },
  { clave: 'short_definition', titulo: 'Definición corta' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'updated_at', titulo: 'Actualizado', formato: 'fecha_hora' },
];

export default function PaginaGlosario() {
  return (
    <RecursoAdmin
      titulo="Glosario"
      descripcion="Los términos del vocabulario de prevención de lavado de dinero, explicados sin jerga. La definición corta es la que aparece en los tooltips del resto del sitio, así que tiene que sostenerse sola."
      tabla="glossary_terms"
      columnas={COLUMNAS}
      ordenarPor="term"
      ascendente
    />
  );
}
