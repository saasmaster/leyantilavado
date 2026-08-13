import { Lock } from 'lucide-react';
import { Nota } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { requerirPermiso } from '@/lib/auth/sesion';

const COLUMNAS = [
  { clave: 'created_at', titulo: 'Cuándo', formato: 'fecha_hora' },
  { clave: 'action', titulo: 'Acción', formato: 'insignia' },
  { clave: 'entity', titulo: 'Tabla' },
  { clave: 'entity_id', titulo: 'Registro', vacio: 'Sin identificador' },
  { clave: 'actor_id', titulo: 'Quién', vacio: 'Sistema' },
  { clave: 'summary', titulo: 'Resumen', vacio: 'Sin resumen' },
] satisfies readonly ColumnaTabla[];

export default async function PaginaBitacora() {
  const contexto = await requerirPermiso('bitacora.ver', '/panel/bitacora');
  const org = contexto.organizacion?.organizacionId ?? null;

  return (
    <>
      <EncabezadoSeccion
        titulo="Bitácora de cambios"
        descripcion="Qué se creó, se modificó o se borró en las tablas sensibles, quién lo hizo y cuándo."
        etiqueta="Sólo lectura"
      />

      <Nota tono="info" titulo="Es append-only: nadie puede editarla ni borrarla">
        <p>
          <Lock aria-hidden="true" className="mr-1.5 inline size-4 align-[-3px]" />
          La bitácora sólo tiene política de lectura en la base de datos. No existe política de
          UPDATE ni de DELETE para ningún rol, y en las reglas de seguridad de Postgres lo que no
          tiene política no se puede hacer: ni el propietario de la organización, ni quien
          administra, ni esta aplicación pueden alterar una línea ya escrita.
        </p>
        <p>
          Las inserciones tampoco las hace la aplicación: las escriben disparadores dentro de la
          base cada vez que cambia una tabla sensible. Por eso tampoco se puede «olvidar» registrar
          un cambio.
        </p>
        <p>
          La bitácora sobrevive incluso a la organización: no cuelga de ella en cascada, porque un
          registro de auditoría que se borra junto con lo que audita no es un registro de auditoría.
        </p>
      </Nota>

      <Seccion
        titulo="Movimientos registrados"
        descripcion="Ordenados por fecha, del más reciente al más antiguo. La columna «Quién» muestra el identificador interno de la persona usuaria."
      >
        <TablaRecurso
          tabla="audit_logs"
          columnas={COLUMNAS}
          organizacionId={org}
          ordenarPor="created_at"
          /* audit_logs no tiene `deleted_at`: filtrarla rompería la consulta. */
          incluirEliminados
          vacioTitulo="Todavía no hay movimientos"
          vacioDescripcion="La bitácora se llena sola en cuanto empieces a capturar clientes, operaciones o avisos. Que esté vacía significa que aún no ha cambiado nada, no que se haya limpiado."
        />
      </Seccion>

      <Nota tono="atencion" titulo="Lo que ves depende de tu rol">
        <p>
          Esta pantalla no filtra la bitácora: la filtra la base de datos según la organización de
          la que eres miembro activo. Si esperabas ver movimientos de otra organización, el problema
          no es la pantalla.
        </p>
      </Nota>
    </>
  );
}
