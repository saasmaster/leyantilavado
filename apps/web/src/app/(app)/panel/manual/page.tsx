import { Nota } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { requerirPermiso } from '@/lib/auth/sesion';

const COLUMNAS = [
  { clave: 'version', titulo: 'Versión' },
  { clave: 'kind', titulo: 'Documento', formato: 'insignia' },
  { clave: 'title', titulo: 'Título' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'effective_from', titulo: 'Vigente desde', formato: 'fecha', vacio: 'Sin vigencia' },
  { clave: 'effective_to', titulo: 'Vigente hasta', formato: 'fecha', vacio: '—' },
  { clave: 'approved_at', titulo: 'Aprobada', formato: 'fecha_hora', vacio: 'Sin aprobar' },
  { clave: 'approved_by', titulo: 'Aprobó', vacio: 'Nadie todavía' },
  { clave: 'change_reason', titulo: 'Motivo del cambio', vacio: 'Sin motivo registrado' },
  { clave: 'summary', titulo: 'Resumen', vacio: 'Sin resumen' },
] satisfies readonly ColumnaTabla[];

const ESTADOS: readonly { clave: string; texto: string }[] = [
  {
    clave: 'borrador',
    texto: 'Se está redactando. No rige nada todavía y cualquiera con escritura operativa lo edita.',
  },
  {
    clave: 'en_revision',
    texto: 'Está en manos de quien lo revisa antes de subirlo al órgano de gobierno.',
  },
  {
    clave: 'vigente',
    texto:
      'Es la versión que rige hoy. Ponerla vigente exige rol de administración: la base de datos comprueba el permiso sobre la fila resultante, no sobre la intención.',
  },
  {
    clave: 'sustituida',
    texto:
      'Dejó de regir porque otra versión la reemplazó, pero se conserva. Un manual sin historial no permite demostrar qué política estaba vigente el día de una operación concreta.',
  },
];

export default async function PaginaManual() {
  const contexto = await requerirPermiso('auditoria.ver', '/panel/manual');
  const org = contexto.organizacion?.organizacionId ?? null;

  return (
    <>
      <EncabezadoSeccion
        titulo="Versiones del manual"
        descripcion="El manual de políticas y procedimientos, sus versiones anteriores, quién aprobó cada una y por qué cambió."
      />

      <Nota tono="info" titulo="Lo que importa es el historial, no el archivo actual">
        <p>
          Cuando la autoridad o un auditor pregunte por qué una operación de hace dos años se
          trató como se trató, la respuesta está en la versión del manual que regía ese día. Por eso
          las versiones sustituidas no se borran y cada una guarda el motivo de su cambio.
        </p>
      </Nota>

      <Seccion
        titulo="Versiones registradas"
        descripcion="Ordenadas por fecha de creación, de la más reciente a la más antigua."
      >
        <TablaRecurso
          tabla="policy_versions"
          columnas={COLUMNAS}
          organizacionId={org}
          ordenarPor="created_at"
          vacioTitulo="Todavía no hay versiones del manual"
          vacioDescripcion="Registra la versión vigente de tu manual, aunque el documento viva fuera de esta plataforma: lo que se guarda aquí es el control de versiones, no el archivo."
        />
      </Seccion>

      <Seccion titulo="Qué significa cada estado">
        <dl className="flex flex-col gap-3 text-sm">
          {ESTADOS.map((e) => (
            <div key={e.clave}>
              <dt className="font-medium text-[var(--color-tinta)]">
                <code>{e.clave}</code>
              </dt>
              <dd className="mt-0.5 text-[var(--color-tinta-suave)]">{e.texto}</dd>
            </div>
          ))}
        </dl>
      </Seccion>

      <Nota tono="atencion" titulo="Quién aprobó, en identificador">
        <p>
          La columna «Aprobó» muestra el identificador interno de la persona usuaria, no su nombre:
          esta pantalla lee la tabla de versiones sin cruzarla con la de usuarios. Es feo y está
          reportado; preferimos mostrar el dato crudo antes que dejar la columna vacía.
        </p>
      </Nota>

      <AvisoNoEsCumplimiento />
    </>
  );
}
