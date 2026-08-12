import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoDatosPersonales, AvisoStaffNoEditable } from '@/components/admin/Avisos';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'email', titulo: 'Correo' },
  { clave: 'full_name', titulo: 'Nombre', vacio: 'Sin nombre capturado' },
  { clave: 'is_staff', titulo: 'Personal', formato: 'booleano' },
  { clave: 'staff_role', titulo: 'Rol de personal', formato: 'insignia', vacio: 'No es personal' },
  { clave: 'locale', titulo: 'Idioma' },
  { clave: 'last_seen_at', titulo: 'Última sesión', formato: 'fecha_hora', vacio: 'Nunca' },
  { clave: 'created_at', titulo: 'Alta', formato: 'fecha_hora' },
];

export default function PaginaUsuarios() {
  return (
    <RecursoAdmin
      titulo="Usuarios"
      descripcion="Las cuentas registradas en la plataforma. Los roles dentro de una organización se administran en el área privada de esa organización; aquí sólo se ve quién es personal de LeyAntilavado.org."
      tabla="users"
      columnas={COLUMNAS}
      ordenarPor="created_at"
      entidadRevisiones={null}
      aviso={
        <>
          <AvisoStaffNoEditable />
          <AvisoDatosPersonales que="Esta lista contiene los correos y los nombres de las personas registradas." />
        </>
      }
    />
  );
}
