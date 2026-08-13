import { Nota } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { requerirPermiso } from '@/lib/auth/sesion';

const COLUMNAS = [
  { clave: 'code', titulo: 'Clave' },
  { clave: 'title', titulo: 'Caso' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'priority', titulo: 'Prioridad', formato: 'insignia' },
  { clave: 'opened_on', titulo: 'Abierto', formato: 'fecha' },
  { clave: 'closed_on', titulo: 'Cerrado', formato: 'fecha', vacio: 'Sigue abierto' },
  { clave: 'summary', titulo: 'Resumen', vacio: 'Sin resumen' },
  { clave: 'conclusion', titulo: 'Conclusión', vacio: 'Sin conclusión registrada' },
] satisfies readonly ColumnaTabla[];

const ESTADOS: readonly { clave: string; texto: string }[] = [
  { clave: 'abierto', texto: 'Se creó el caso y todavía no lo toma nadie.' },
  {
    clave: 'en_investigacion',
    texto: 'Alguien está reuniendo la información y documentando el análisis.',
  },
  {
    clave: 'cerrado_sin_aviso',
    texto:
      'Se concluyó que no procede un aviso. La decisión y su razón quedan registradas: decidir que no procede también es una decisión que hay que poder explicar.',
  },
  {
    clave: 'cerrado_con_aviso',
    texto:
      'Se concluyó que procede un aviso. El aviso se prepara y se exporta desde el registro de avisos; esta plataforma no lo presenta ante la autoridad.',
  },
  {
    clave: 'escalado',
    texto: 'Se pasó a un nivel superior dentro de la organización o a un profesional externo.',
  },
];

export default async function PaginaCasos() {
  const contexto = await requerirPermiso('alertas.ver', '/panel/casos');
  const org = contexto.organizacion?.organizacionId ?? null;

  return (
    <>
      <EncabezadoSeccion
        titulo="Casos de investigación"
        descripcion="Un caso agrupa las alertas y las operaciones de una misma revisión, con su prioridad, su estado y la conclusión a la que se llegó."
      />

      <Nota tono="info" titulo="Para qué sirve un caso">
        <p>
          Una alerta suelta no cuenta la historia completa. El caso es donde se junta lo que se
          revisó, quién lo revisó y qué se concluyó, con fecha. Es el expediente que un auditor va a
          pedir cuando pregunte por qué se decidió lo que se decidió.
        </p>
      </Nota>

      <Seccion
        titulo="Casos registrados"
        descripcion="Ordenados por fecha de apertura, del más reciente al más antiguo."
      >
        <TablaRecurso
          tabla="cases"
          columnas={COLUMNAS}
          organizacionId={org}
          ordenarPor="opened_on"
          vacioTitulo="Todavía no hay casos"
          vacioDescripcion="Los casos se abren a partir de una alerta o de una revisión propia. Cuando abras el primero aparecerá aquí con su clave y su estado."
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

      <AvisoNoEsCumplimiento />
    </>
  );
}
