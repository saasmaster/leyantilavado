import { Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS_BITACORA: readonly ColumnaTabla[] = [
  { clave: 'happened_on', titulo: 'Ocurrió el', formato: 'fecha' },
  { clave: 'title', titulo: 'Cambio' },
  { clave: 'kind', titulo: 'Tipo', formato: 'insignia' },
  { clave: 'summary', titulo: 'Resumen' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'author_id', titulo: 'Autor', vacio: 'Sin autor' },
];

const COLUMNAS_REVISION: readonly ColumnaTabla[] = [
  { clave: 'created_at', titulo: 'Fecha', formato: 'fecha_hora' },
  { clave: 'entity', titulo: 'Tabla' },
  { clave: 'entity_id', titulo: 'Registro' },
  { clave: 'revision', titulo: 'Versión', formato: 'numero' },
  { clave: 'changed_fields', titulo: 'Campos modificados', vacio: 'Sin detalle' },
  { clave: 'reason', titulo: 'Motivo', vacio: 'Sin motivo capturado' },
  { clave: 'author_id', titulo: 'Autor', vacio: 'Sin autor (cambio desde la consola)' },
  { clave: 'legal_version', titulo: 'Versión legal', vacio: '—' },
];

export default function PaginaCambios() {
  return (
    <RecursoAdmin
      titulo="Registro de cambios"
      descripcion="Dos registros distintos: la bitácora pública que se publica en el sitio y el historial técnico de versiones que escribe la base de datos. El primero se redacta; el segundo no se puede editar."
      tabla="changelog_entries"
      columnas={COLUMNAS_BITACORA}
      ordenarPor="happened_on"
      entidadRevisiones="changelog_entries"
      vacioDescripcion="No hay entradas en la bitácora pública. La página de actualizaciones del sitio se queda vacía mientras esto siga así: no se rellena con texto de relleno."
    >
      <Seccion
        titulo="Historial completo de versiones"
        descripcion="Todas las tablas, no sólo la bitácora. Cada fila es la versión anterior de un registro, guardada por un trigger de Postgres antes de sobrescribirla, con su autor, su fecha y su motivo."
      >
        <TablaRecurso
          tabla="content_revisions"
          columnas={COLUMNAS_REVISION}
          ordenarPor="created_at"
          incluirEliminados
          limite={200}
          vacioTitulo="Sin versiones registradas"
          vacioDescripcion="content_revisions está vacía. O nadie ha modificado todavía una regla o un contenido, o el trigger de versionado no está aplicado en este entorno. Esta pantalla no puede distinguir los dos casos: verifícalo en supabase/migrations."
        />
      </Seccion>
    </RecursoAdmin>
  );
}
