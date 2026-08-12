import { VERSION_LEGAL, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Nota } from '@leyantilavado/ui';
import {
  EncabezadoSeccion,
  RejillaTarjetas,
  Seccion,
  TarjetaMetrica,
} from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { contar } from '@/lib/app/consultas';
import { fechaDeHoy } from '@/lib/app/fecha';
import { requerirStaff } from '@/lib/auth/sesion';

const COLUMNAS_ALERTA: readonly ColumnaTabla[] = [
  { clave: 'created_at', titulo: 'Detectada', formato: 'fecha_hora' },
  { clave: 'severity', titulo: 'Gravedad', formato: 'insignia' },
  { clave: 'kind', titulo: 'Tipo', formato: 'insignia' },
  { clave: 'title', titulo: 'Alerta' },
  { clave: 'entity', titulo: 'Entidad', vacio: 'Sin entidad' },
  { clave: 'entity_id', titulo: 'Registro', vacio: '—' },
  { clave: 'assigned_to', titulo: 'Asignada a', vacio: 'Sin asignar' },
];

const COLUMNAS_REVISION: readonly ColumnaTabla[] = [
  { clave: 'created_at', titulo: 'Fecha', formato: 'fecha_hora' },
  { clave: 'entity', titulo: 'Tabla' },
  { clave: 'entity_id', titulo: 'Registro' },
  { clave: 'revision', titulo: 'Versión', formato: 'numero' },
  { clave: 'reason', titulo: 'Motivo', vacio: 'Sin motivo capturado' },
  { clave: 'author_id', titulo: 'Autor', vacio: 'Sin autor (cambio desde la consola)' },
];

function valor(resultado: Awaited<ReturnType<typeof contar>>): string {
  return resultado.estado === 'ok' ? String(resultado.filas[0] ?? 0) : 'Sin datos';
}

export default async function PaginaAdmin() {
  const contexto = await requerirStaff();
  const hoy = await fechaDeHoy();

  const [alertas, articulos, fuentes, umbrales, proveedores, verificaciones, solicitudes, suscriptores] =
    await Promise.all([
      contar('content_alerts', { filtros: { status: 'abierta' }, incluirEliminados: true }),
      contar('articles', { filtros: { status: 'publicado' } }),
      contar('legal_sources'),
      contar('threshold_rules', { incluirEliminados: true }),
      contar('provider_profiles', { filtros: { published: true } }),
      contar('verification_requests', { filtros: { status: 'pendiente' }, incluirEliminados: true }),
      contar('provider_leads', { filtros: { status: 'nuevo' } }),
      contar('newsletter_subscribers', { incluirEliminados: true }),
    ]);

  return (
    <>
      <EncabezadoSeccion
        titulo="Panel administrativo"
        descripcion={`Hola, ${contexto.usuario.nombre}. Estado del corpus, del contenido y del directorio al ${formatearFechaLarga(hoy)}. El motor jurídico que responde en producción es la versión ${VERSION_LEGAL}.`}
        etiqueta="Sólo personal"
      />

      <Nota tono="info" titulo="Qué es este panel y qué no">
        <p>
          Aquí se administra el <strong>historial editorial</strong>: qué fuentes se vigilan, qué se
          publicó, quién revisó qué y cuándo. Lo que calculan las herramientas públicas sale del
          motor <code>@leyantilavado/rules-engine</code>, que viaja con el despliegue; cambiar una
          fila de estas tablas no cambia un resultado.
        </p>
        <p>
          Todas las secciones son de <strong>lectura</strong>. La edición se hace con las
          herramientas de la base de datos para que cada cambio pase por los triggers de versionado
          y de auditoría, que es lo que permite responder después &ldquo;¿qué decía la regla el día
          de esta operación?&rdquo;.
        </p>
      </Nota>

      <RejillaTarjetas>
        <TarjetaMetrica
          etiqueta="Alertas de contenido abiertas"
          valor={valor(alertas)}
          detalle="Pendientes de revisión humana"
        />
        <TarjetaMetrica
          etiqueta="Solicitudes de verificación"
          valor={valor(verificaciones)}
          detalle="En estado pendiente"
        />
        <TarjetaMetrica
          etiqueta="Solicitudes de contacto nuevas"
          valor={valor(solicitudes)}
          detalle="Leads del directorio sin atender"
        />
        <TarjetaMetrica
          etiqueta="Artículos publicados"
          valor={valor(articulos)}
          detalle="Visibles en el sitio público"
        />
        <TarjetaMetrica
          etiqueta="Fuentes oficiales"
          valor={valor(fuentes)}
          detalle="Registradas para el monitor"
        />
        <TarjetaMetrica
          etiqueta="Reglas de umbral"
          valor={valor(umbrales)}
          detalle="Filas en threshold_rules"
        />
        <TarjetaMetrica
          etiqueta="Proveedores publicados"
          valor={valor(proveedores)}
          detalle="Fichas visibles en el directorio"
        />
        <TarjetaMetrica
          etiqueta="Suscriptores del boletín"
          valor={valor(suscriptores)}
          detalle="Incluye no confirmados y bajas"
        />
      </RejillaTarjetas>

      <Seccion
        titulo="Alertas de contenido abiertas"
        descripcion="Las levanta el monitor regulatorio y el vencimiento de la fecha de revisión de un artículo. Ninguna se resuelve sola: cada una es trabajo para una persona."
      >
        <TablaRecurso
          tabla="content_alerts"
          columnas={COLUMNAS_ALERTA}
          filtros={{ status: 'abierta' }}
          ordenarPor="created_at"
          incluirEliminados
          limite={25}
          vacioTitulo="Sin alertas abiertas"
          vacioDescripcion="No hay filas en content_alerts con estado abierta. Si el monitor regulatorio todavía no se ha ejecutado en este entorno, eso no significa que las fuentes no hayan cambiado: compruébalo en la sección Monitor regulatorio."
        />
      </Seccion>

      <Seccion
        titulo="Últimas versiones guardadas"
        descripcion="Cada fila es la versión anterior de un registro, guardada por un trigger de Postgres antes de sobrescribirla. La aplicación no puede escribir ni borrar aquí."
      >
        <TablaRecurso
          tabla="content_revisions"
          columnas={COLUMNAS_REVISION}
          ordenarPor="created_at"
          incluirEliminados
          limite={25}
          vacioTitulo="Sin versiones registradas"
          vacioDescripcion="content_revisions está vacía. O nadie ha modificado todavía una regla o un contenido, o el trigger de versionado no está aplicado en este entorno. Esta pantalla no puede distinguir los dos casos: verifícalo en supabase/migrations."
        />
      </Seccion>
    </>
  );
}
