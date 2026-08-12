import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoDatosPersonales } from '@/components/admin/Avisos';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'created_at', titulo: 'Recibida', formato: 'fecha_hora' },
  { clave: 'provider_id', titulo: 'Proveedor destinatario' },
  { clave: 'name', titulo: 'Nombre' },
  { clave: 'email', titulo: 'Correo' },
  { clave: 'phone', titulo: 'Teléfono', vacio: 'Sin teléfono' },
  { clave: 'company', titulo: 'Empresa', vacio: 'Sin empresa' },
  { clave: 'activity', titulo: 'Actividad', vacio: 'Sin especificar' },
  { clave: 'kind', titulo: 'Tipo', formato: 'insignia' },
  { clave: 'consent', titulo: 'Consintió', formato: 'booleano' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
];

export default function PaginaLeads() {
  return (
    <RecursoAdmin
      titulo="Solicitudes de contacto"
      descripcion="Personas que pidieron que un proveedor del directorio las contacte. Sólo se guardan con consentimiento explícito: la base rechaza una fila sin él."
      tabla="provider_leads"
      columnas={COLUMNAS}
      ordenarPor="created_at"
      entidadRevisiones={null}
      aviso={
        <AvisoDatosPersonales que="Esta lista contiene nombres, correos y teléfonos de personas que llenaron un formulario público." />
      }
    />
  );
}
