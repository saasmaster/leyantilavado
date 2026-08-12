import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'slug', titulo: 'Identificador' },
  { clave: 'question', titulo: 'Pregunta' },
  { clave: 'topic', titulo: 'Tema', formato: 'insignia', vacio: 'Sin tema' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'sort_order', titulo: 'Orden', formato: 'numero' },
  { clave: 'updated_at', titulo: 'Actualizada', formato: 'fecha_hora' },
];

export default function PaginaFaq() {
  return (
    <RecursoAdmin
      titulo="Preguntas frecuentes"
      descripcion="Las respuestas cortas que alimentan las secciones de preguntas del sitio. Cada una cita sus fuentes igual que un artículo: una respuesta breve sigue siendo una afirmación jurídica."
      tabla="faq_entries"
      columnas={COLUMNAS}
      ordenarPor="sort_order"
      ascendente
    />
  );
}
