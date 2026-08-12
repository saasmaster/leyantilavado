import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoMotorEsLaFuente } from '@/components/admin/Avisos';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'version', titulo: 'Versión' },
  { clave: 'published_at', titulo: 'Publicada', formato: 'fecha' },
  { clave: 'valid_from', titulo: 'Vigente desde', formato: 'fecha' },
  { clave: 'valid_to', titulo: 'Vigente hasta', formato: 'fecha', vacio: 'Indefinido' },
  { clave: 'is_current', titulo: 'Vigente', formato: 'booleano' },
  { clave: 'description', titulo: 'Descripción', vacio: 'Sin descripción' },
];

export default function PaginaVersionesLegales() {
  return (
    <RecursoAdmin
      titulo="Versiones legales"
      descripcion="Cada corte del corpus jurídico con su ventana de vigencia. Sirve para responder qué decía la regla el día de una operación concreta, que es la única pregunta que importa cuando llega una revisión de la autoridad."
      tabla="legal_versions"
      columnas={COLUMNAS}
      ordenarPor="valid_from"
      incluirEliminados
      aviso={<AvisoMotorEsLaFuente />}
      vacioDescripcion="No hay ninguna versión legal registrada. Mientras la tabla esté vacía, el único punto de referencia es la versión del motor que aparece arriba, y no queda constancia en la base de cuándo se hizo cada corte."
    />
  );
}
