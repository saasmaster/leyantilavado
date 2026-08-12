import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'slug', titulo: 'Ruta' },
  { clave: 'title', titulo: 'Curso' },
  { clave: 'provider', titulo: 'Imparte' },
  { clave: 'modality', titulo: 'Modalidad', formato: 'insignia' },
  { clave: 'hours', titulo: 'Horas', formato: 'numero', vacio: 'Sin duración' },
  { clave: 'price_cents', titulo: 'Precio', formato: 'dinero', vacio: 'Sin precio' },
  { clave: 'issues_certificate', titulo: 'Emite constancia', formato: 'booleano' },
  { clave: 'url', titulo: 'Enlace', vacio: 'Sin enlace' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
];

export default function PaginaCursos() {
  return (
    <RecursoAdmin
      titulo="Cursos"
      descripcion="El catálogo de capacitación que se lista en el sitio, para el periodo de capacitación anual que exige la ley."
      tabla="courses"
      columnas={COLUMNAS}
      ordenarPor="updated_at"
      aviso={
        <Nota tono="atencion" titulo="La constancia la emite quien imparte el curso">
          <p>
            LeyAntilavado.org no imparte capacitación, no certifica a ningún instructor y no emite
            constancias. La columna <code>issues_certificate</code> describe lo que ofrece el
            proveedor del curso, no un aval de esta plataforma. Listar un curso aquí no es
            recomendarlo.
          </p>
          <p>
            Si un curso se lista como parte de un patrocinio, tiene que verse etiquetado como tal en
            el sitio público, igual que cualquier otro espacio pagado.
          </p>
        </Nota>
      }
    />
  );
}
