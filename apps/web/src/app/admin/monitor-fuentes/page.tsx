import { Nota } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoMonitorNoPublica } from '@/components/admin/Avisos';

const COLUMNAS_FUENTE: readonly ColumnaTabla[] = [
  { clave: 'id', titulo: 'Fuente' },
  { clave: 'name', titulo: 'Documento' },
  { clave: 'issuer', titulo: 'Emisor', formato: 'insignia' },
  { clave: 'monitor_enabled', titulo: 'Monitor activo', formato: 'booleano' },
  { clave: 'last_checked_at', titulo: 'Última comprobación', formato: 'fecha_hora', vacio: 'Nunca se ha comprobado' },
  { clave: 'http_status', titulo: 'Estado HTTP', formato: 'numero', vacio: 'Sin respuesta' },
  { clave: 'content_hash', titulo: 'Huella del contenido', vacio: 'Sin huella' },
  { clave: 'last_change_at', titulo: 'Último cambio detectado', formato: 'fecha_hora', vacio: 'Ninguno' },
  { clave: 'last_review_at', titulo: 'Última revisión humana', formato: 'fecha', vacio: 'Nunca' },
];

const COLUMNAS_COMPROBACION: readonly ColumnaTabla[] = [
  { clave: 'checked_at', titulo: 'Comprobada', formato: 'fecha_hora' },
  { clave: 'source_id', titulo: 'Fuente' },
  { clave: 'http_status', titulo: 'Estado HTTP', formato: 'numero', vacio: 'Sin respuesta' },
  { clave: 'changed', titulo: 'Cambió', formato: 'booleano' },
  { clave: 'content_hash', titulo: 'Huella', vacio: 'Sin huella' },
  { clave: 'duration_ms', titulo: 'Duración (ms)', formato: 'numero', vacio: '—' },
  { clave: 'error', titulo: 'Error', vacio: 'Sin error' },
];

const COLUMNAS_ALERTA: readonly ColumnaTabla[] = [
  { clave: 'created_at', titulo: 'Detectada', formato: 'fecha_hora' },
  { clave: 'severity', titulo: 'Gravedad', formato: 'insignia' },
  { clave: 'source_id', titulo: 'Fuente', vacio: 'Sin fuente' },
  { clave: 'title', titulo: 'Alerta' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'assigned_to', titulo: 'Asignada a', vacio: 'Sin asignar' },
];

export default function PaginaMonitorFuentes() {
  return (
    <>
      <EncabezadoSeccion
        titulo="Monitor regulatorio"
        descripcion="Estado de la vigilancia automática de las fuentes oficiales: cuándo se comprobó cada una, qué respondió y si su contenido cambió desde la última vez."
        etiqueta="Sólo personal"
      />

      <AvisoMonitorNoPublica />

      <Seccion
        titulo="Estado de cada fuente"
        descripcion="Una fila por documento vigilado. Una fuente con el monitor apagado no se comprueba: su fecha de última comprobación se quedará congelada y eso no significa que no haya cambiado."
      >
        <TablaRecurso
          tabla="legal_sources"
          columnas={COLUMNAS_FUENTE}
          ordenarPor="last_checked_at"
          vacioTitulo="No hay fuentes registradas"
          vacioDescripcion="La tabla legal_sources está vacía, así que no hay nada que vigilar. Mientras siga así, el monitor no puede detectar ninguna reforma: el catálogo de fuentes es su única entrada."
        />
      </Seccion>

      <Seccion
        titulo="Historial de comprobaciones"
        descripcion="Una fila por cada intento del monitor. Sirve para distinguir “la fuente no ha cambiado” de “la tarea lleva días fallando”, que desde la pantalla anterior se ven casi igual."
      >
        <TablaRecurso
          tabla="source_checks"
          columnas={COLUMNAS_COMPROBACION}
          ordenarPor="checked_at"
          incluirEliminados
          limite={100}
          vacioTitulo="El monitor todavía no se ha ejecutado"
          vacioDescripcion="No hay ninguna comprobación registrada en source_checks. Nadie está vigilando las fuentes en este entorno: revisa que la tarea programada esté configurada antes de confiar en que un cambio normativo se detectaría."
        />
      </Seccion>

      <Seccion
        titulo="Alertas abiertas por cambio de fuente"
        descripcion="Lo que el monitor produce cuando detecta un cambio: trabajo para una persona, nunca una publicación automática."
      >
        <TablaRecurso
          tabla="content_alerts"
          columnas={COLUMNAS_ALERTA}
          filtros={{ kind: 'fuente_cambio', status: 'abierta' }}
          ordenarPor="created_at"
          incluirEliminados
          vacioTitulo="Sin alertas de cambio de fuente"
          vacioDescripcion="Ninguna fuente oficial ha cambiado desde la última comprobación, o el monitor no se ha ejecutado. Las dos cosas se ven igual desde aquí: mira el historial de comprobaciones de arriba para saber cuál es."
        />
      </Seccion>

      <Nota tono="info" titulo="Qué significa una huella distinta">
        <p>
          La huella es un SHA-256 del contenido descargado. Que cambie sólo prueba que los bytes de
          la página son distintos: puede ser una reforma publicada, o puede ser una fecha de
          consulta, un banner o un cambio de plantilla del portal. Interpretarlo es trabajo
          editorial con la fuente a la vista, y el resultado se registra como una versión nueva de
          la regla, con su motivo.
        </p>
      </Nota>
    </>
  );
}
