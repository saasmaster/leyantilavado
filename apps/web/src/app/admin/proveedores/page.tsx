import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoPatrocinado, LeyendaVerificacion } from '@/components/admin/Avisos';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'slug', titulo: 'Ruta' },
  { clave: 'name', titulo: 'Proveedor' },
  { clave: 'plan', titulo: 'Plan', formato: 'insignia' },
  { clave: 'verification_level', titulo: 'Verificación', formato: 'insignia' },
  { clave: 'sponsored', titulo: 'Patrocinado', formato: 'booleano' },
  { clave: 'published', titulo: 'Publicado', formato: 'booleano' },
  { clave: 'accepting_clients', titulo: 'Acepta clientes', formato: 'booleano' },
  { clave: 'verified_at', titulo: 'Verificado el', formato: 'fecha_hora', vacio: 'Sin verificar' },
  { clave: 'updated_at', titulo: 'Actualizado', formato: 'fecha_hora' },
];

export default function PaginaProveedores() {
  return (
    <RecursoAdmin
      titulo="Proveedores"
      descripcion="Las fichas del directorio profesional. El plan que paga un proveedor y el nivel de verificación que se le reconoció son dos cosas independientes: pagar no verifica nada."
      tabla="provider_profiles"
      columnas={COLUMNAS}
      ordenarPor="updated_at"
      aviso={<AvisoPatrocinado />}
    >
      <LeyendaVerificacion />
    </RecursoAdmin>
  );
}
