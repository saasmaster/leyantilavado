import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { LeyendaVerificacion } from '@/components/admin/Avisos';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'created_at', titulo: 'Solicitada', formato: 'fecha_hora' },
  { clave: 'provider_id', titulo: 'Proveedor' },
  { clave: 'requested_level', titulo: 'Nivel solicitado', formato: 'insignia' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'notes', titulo: 'Notas del solicitante', vacio: 'Sin notas' },
  { clave: 'decided_at', titulo: 'Resuelta', formato: 'fecha_hora', vacio: 'Pendiente' },
  { clave: 'decided_by', titulo: 'Resolvió', vacio: '—' },
  { clave: 'decision_note', titulo: 'Motivo de la decisión', vacio: 'Sin motivo capturado' },
];

export default function PaginaVerificaciones() {
  return (
    <RecursoAdmin
      titulo="Solicitudes de verificación"
      descripcion="La cola de moderación del directorio. Un proveedor puede pedir un nivel; sólo el equipo puede otorgarlo, y un trigger de Postgres impide que se lo conceda a sí mismo aunque edite su ficha."
      tabla="verification_requests"
      columnas={COLUMNAS}
      ordenarPor="created_at"
      incluirEliminados
      entidadRevisiones={null}
      aviso={
        <Nota tono="riesgo" titulo="Revisar documentos no es certificar a nadie">
          <p>
            Aprobar una solicitud significa que alguien miró los documentos y comprobó que existen y
            corresponden al titular. No significa que sus servicios sean buenos, ni que el sitio
            responda por su trabajo. Escribe el motivo de la decisión: es lo único que permite
            explicar después por qué se aprobó o se rechazó.
          </p>
          <p>
            Los documentos probatorios no se muestran aquí: viven en <code>provider_credentials</code>{' '}
            y su política de acceso los limita al proveedor y al equipo de moderación.
          </p>
        </Nota>
      }
    >
      <LeyendaVerificacion />
    </RecursoAdmin>
  );
}
