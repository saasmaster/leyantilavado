import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoMonitorNoPublica } from '@/components/admin/Avisos';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'created_at', titulo: 'Detectada', formato: 'fecha_hora' },
  { clave: 'kind', titulo: 'Tipo', formato: 'insignia' },
  { clave: 'severity', titulo: 'Gravedad', formato: 'insignia' },
  { clave: 'title', titulo: 'Alerta' },
  { clave: 'detail', titulo: 'Detalle', vacio: 'Sin detalle' },
  { clave: 'entity', titulo: 'Entidad', vacio: 'Sin entidad' },
  { clave: 'entity_id', titulo: 'Registro', vacio: '—' },
  { clave: 'source_id', titulo: 'Fuente', vacio: 'Sin fuente' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'assigned_to', titulo: 'Asignada a', vacio: 'Sin asignar' },
  { clave: 'resolved_at', titulo: 'Resuelta', formato: 'fecha_hora', vacio: 'Abierta' },
];

export default function PaginaAlertasContenido() {
  return (
    <RecursoAdmin
      titulo="Contenido desactualizado"
      descripcion="La bandeja de trabajo editorial: cambios detectados en una fuente oficial, revisiones vencidas, discrepancias entre fuentes y reportes de usuarios."
      tabla="content_alerts"
      columnas={COLUMNAS}
      ordenarPor="created_at"
      incluirEliminados
      entidadRevisiones={null}
      aviso={<AvisoMonitorNoPublica />}
      vacioDescripcion="No hay ninguna alerta registrada. Puede que no haya nada pendiente, o puede que el monitor regulatorio todavía no se haya ejecutado en este entorno: compruébalo en la sección Monitor regulatorio antes de darlo por bueno."
    />
  );
}
