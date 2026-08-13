import { Nota } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { requerirPermiso } from '@/lib/auth/sesion';

const COLUMNAS = [
  { clave: 'created_at', titulo: 'Detectada', formato: 'fecha_hora' },
  { clave: 'title', titulo: 'Alerta' },
  { clave: 'kind', titulo: 'Tipo', formato: 'insignia' },
  { clave: 'severity', titulo: 'Severidad', formato: 'insignia' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'rule_id', titulo: 'Regla', vacio: 'Sin regla registrada' },
  { clave: 'rule_version', titulo: 'Versión de la regla', formato: 'numero' },
  { clave: 'detail', titulo: 'Detalle', vacio: 'Sin detalle' },
] satisfies readonly ColumnaTabla[];

export default async function PaginaAlertas() {
  const contexto = await requerirPermiso('alertas.ver', '/panel/alertas');
  const org = contexto.organizacion?.organizacionId ?? null;

  return (
    <>
      <EncabezadoSeccion
        titulo="Alertas"
        descripcion="Señales que generaron las reglas del motor sobre lo que tu organización capturó. Una alerta abre una revisión; no la cierra."
      />

      <Nota tono="info" titulo="Una alerta es un indicio, no una conclusión jurídica">
        <p>
          Que aparezca una alerta no significa que haya una operación ilícita, ni que proceda un
          aviso. Significa que una regla del motor encontró una coincidencia con lo capturado y que
          alguien tiene que revisarla. Quien decide si procede un aviso es tu responsable de
          cumplimiento, con el expediente completo a la vista.
        </p>
        <p>
          Al revés también aplica: que no haya alertas no quiere decir que no haya obligaciones. El
          motor sólo ve lo que se registró en esta plataforma.
        </p>
      </Nota>

      <Nota tono="atencion" titulo="De qué regla salió cada alerta">
        <p>
          Cada fila guarda el identificador de la regla (<code>rule_id</code>) y la versión con la
          que se evaluó (<code>rule_version</code>). Sin ese par no se puede reconstruir meses
          después por qué el sistema levantó la alerta, y un mecanismo automatizado que no se puede
          explicar no es auditable. Si una alerta aparece sin regla, se capturó a mano.
        </p>
      </Nota>

      <Seccion
        titulo="Alertas registradas"
        descripcion="Ordenadas por fecha de detección, de la más reciente a la más antigua."
      >
        <TablaRecurso
          tabla="alerts"
          columnas={COLUMNAS}
          organizacionId={org}
          ordenarPor="created_at"
          vacioTitulo="Todavía no hay alertas"
          vacioDescripcion="Las alertas se generan al evaluar las operaciones y los expedientes que captures. Sin operaciones capturadas no hay nada que evaluar."
        />
      </Seccion>

      <AvisoNoEsCumplimiento />
    </>
  );
}
