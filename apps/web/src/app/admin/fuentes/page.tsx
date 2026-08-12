import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoMotorEsLaFuente } from '@/components/admin/Avisos';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';
import { TablaComparativaSemilla } from '@/components/admin/TablaComparativaSemilla';
import { SEMILLA_FUENTES } from '@/components/admin/semillas';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'id', titulo: 'Identificador' },
  { clave: 'name', titulo: 'Fuente' },
  { clave: 'issuer', titulo: 'Emisor', formato: 'insignia' },
  { clave: 'url', titulo: 'URL' },
  { clave: 'published_at', titulo: 'Publicada', formato: 'fecha', vacio: 'Sin fecha' },
  { clave: 'last_review_at', titulo: 'Última revisión', formato: 'fecha', vacio: 'Nunca' },
  { clave: 'last_checked_at', titulo: 'Última comprobación', formato: 'fecha_hora', vacio: 'Nunca' },
  { clave: 'monitor_enabled', titulo: 'Monitor activo', formato: 'booleano' },
];

export default function PaginaFuentes() {
  return (
    <RecursoAdmin
      titulo="Fuentes oficiales"
      descripcion="El catálogo de documentos contra los que se contrasta cada regla. Toda conclusión legal del sitio apunta por identificador a una de estas fuentes; si una fuente no está aquí, no se puede citar."
      tabla="legal_sources"
      columnas={COLUMNAS}
      ordenarPor="published_at"
      aviso={<AvisoMotorEsLaFuente />}
    >
      <TablaComparativaSemilla
        tabla="legal_sources"
        clave="id"
        titulo="Fuentes que trae el motor"
        filas={SEMILLA_FUENTES}
      />
    </RecursoAdmin>
  );
}
