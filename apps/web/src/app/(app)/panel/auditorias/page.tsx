import { Nota } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { requerirContexto } from '@/lib/auth/sesion';

const COLUMNAS_AUDITORIAS = [
  { clave: 'title', titulo: 'Auditoría' },
  { clave: 'kind', titulo: 'Tipo', formato: 'insignia' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'auditor_name', titulo: 'Auditor', vacio: 'Sin asignar' },
  { clave: 'auditor_credential', titulo: 'Credencial', vacio: 'Sin registrar' },
  { clave: 'period_from', titulo: 'Periodo desde', formato: 'fecha' },
  { clave: 'period_to', titulo: 'Periodo hasta', formato: 'fecha' },
  { clave: 'finished_on', titulo: 'Terminada', formato: 'fecha', vacio: 'En proceso' },
  { clave: 'conclusion', titulo: 'Conclusión', vacio: 'Sin conclusión' },
] satisfies readonly ColumnaTabla[];

const COLUMNAS_HALLAZGOS = [
  { clave: 'detected_on', titulo: 'Detectado', formato: 'fecha' },
  { clave: 'code', titulo: 'Clave', vacio: 'Sin clave' },
  { clave: 'title', titulo: 'Hallazgo' },
  { clave: 'severity', titulo: 'Severidad', formato: 'insignia' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'obligation_slug', titulo: 'Obligación', vacio: 'Sin vincular' },
  { clave: 'evidence', titulo: 'Evidencia', vacio: 'Sin evidencia' },
  { clave: 'closed_on', titulo: 'Cerrado', formato: 'fecha', vacio: 'Abierto' },
] satisfies readonly ColumnaTabla[];

const COLUMNAS_ACCIONES = [
  { clave: 'due_date', titulo: 'Compromiso', formato: 'fecha', vacio: 'Sin fecha' },
  { clave: 'action', titulo: 'Acción' },
  { clave: 'owner_name', titulo: 'Responsable', vacio: 'Sin responsable' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'completed_on', titulo: 'Completada', formato: 'fecha', vacio: 'Pendiente' },
  { clave: 'notes', titulo: 'Notas', vacio: '—' },
] satisfies readonly ColumnaTabla[];

export default async function PaginaAuditorias() {
  const contexto = await requerirContexto('/panel/auditorias');
  const org = contexto.organizacion?.organizacionId ?? null;

  return (
    <>
      <EncabezadoSeccion
        titulo="Auditorías y hallazgos"
        descripcion="Las auditorías del programa de cumplimiento, los hallazgos que produjeron y las acciones con las que se remedian."
      />

      <Nota tono="info" titulo="Ésta es la única puerta de escritura del rol «auditor»">
        <p>
          Quien tiene rol de auditor no puede tocar ningún dato operativo: no crea clientes, no
          captura operaciones, no prepara avisos. Estas tres tablas son lo único que escribe —junto
          con el propietario y quien administra, que también pueden registrarlas—. Esa separación es
          lo que hace que un hallazgo signifique algo: quien audita no puede modificar lo auditado.
        </p>
        <p>
          La separación no la impone esta pantalla, la imponen las políticas de la base de datos.
          Aunque la interfaz mostrara un botón de más, la escritura se rechazaría en Postgres.
        </p>
      </Nota>

      <Seccion
        titulo="Auditorías"
        descripcion="Cada auditoría define su alcance, su periodo y quién la realizó."
      >
        <TablaRecurso
          tabla="audits"
          columnas={COLUMNAS_AUDITORIAS}
          organizacionId={org}
          ordenarPor="created_at"
          vacioTitulo="Todavía no hay auditorías registradas"
          vacioDescripcion="Cuando se planee la primera auditoría del programa, se registra aquí con su alcance y su periodo antes de empezar."
        />
      </Seccion>

      <Seccion
        titulo="Hallazgos"
        descripcion="Lo que la auditoría encontró, con su severidad y el estado de su atención."
      >
        <TablaRecurso
          tabla="audit_findings"
          columnas={COLUMNAS_HALLAZGOS}
          organizacionId={org}
          ordenarPor="detected_on"
          vacioTitulo="Sin hallazgos registrados"
          vacioDescripcion="Los hallazgos cuelgan de una auditoría. Que no haya hallazgos registrados no significa que no existan: significa que nadie los ha capturado."
        />
      </Seccion>

      <Seccion
        titulo="Acciones de remediación"
        descripcion="Qué se va a hacer con cada hallazgo, quién responde y para cuándo."
      >
        <TablaRecurso
          tabla="remediation_actions"
          columnas={COLUMNAS_ACCIONES}
          organizacionId={org}
          ordenarPor="due_date"
          ascendente
          vacioTitulo="Sin acciones de remediación"
          vacioDescripcion="Un hallazgo sin acción, responsable y fecha se queda en un comentario. Aquí es donde deja de serlo."
        />
      </Seccion>

      <AvisoNoEsCumplimiento />
    </>
  );
}
