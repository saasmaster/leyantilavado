import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'slug', titulo: 'Ruta' },
  { clave: 'name', titulo: 'Nombre' },
  { clave: 'professional_id', titulo: 'Cédula profesional', vacio: 'Sin cédula capturada' },
  { clave: 'specialty', titulo: 'Especialidad', vacio: 'Sin especialidad' },
  { clave: 'organization', titulo: 'Despacho o institución', vacio: 'Independiente' },
  { clave: 'credential_valid_until', titulo: 'Credencial vigente hasta', formato: 'fecha', vacio: 'Sin vigencia registrada' },
  { clave: 'is_active', titulo: 'Activo', formato: 'booleano' },
];

export default function PaginaRevisores() {
  return (
    <RecursoAdmin
      titulo="Revisores"
      descripcion="Las personas cuya revisión respalda el sello de procedencia que ve el lector. Por eso se guarda la cédula y su vigencia, no sólo el nombre."
      tabla="reviewers"
      columnas={COLUMNAS}
      ordenarPor="created_at"
      aviso={
        <Nota tono="atencion" titulo="Una credencial vencida invalida el respaldo, no el texto">
          <p>
            Si la vigencia de la credencial ya pasó, el contenido que firmó esa persona no se
            vuelve falso, pero deja de estar respaldado: hay que volver a revisarlo o actualizar la
            credencial. Publicar un sello de procedencia con un revisor cuya credencial venció es
            afirmar algo que no se puede sostener.
          </p>
        </Nota>
      }
    />
  );
}
