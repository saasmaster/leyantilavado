import type { ReactNode } from 'react';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoRegistroCambios, TABLAS_VERSIONADAS } from './Avisos';

/**
 * Página genérica del panel administrativo.
 *
 * Las ~26 secciones del panel son la misma pantalla con distinta tabla: cabecera,
 * listado honesto de lo que hay en la base, historial de versiones y el aviso de
 * que ese historial lo escribe Postgres y no esta aplicación. Repetir ese bloque
 * en cada archivo era la vía rápida para que una sección se olvidara del aviso.
 */
export function RecursoAdmin({
  titulo,
  descripcion,
  tabla,
  columnas,
  ordenarPor,
  ascendente,
  filtros,
  /**
   * `true` para tablas que NO tienen columna `deleted_at`. Sin esto la consulta
   * filtra por una columna inexistente y falla. La mayoría del corpus legal no
   * tiene borrado lógico a propósito: una regla histórica se sustituye, no se
   * borra.
   */
  incluirEliminados,
  limite,
  aviso,
  /** Entidad con la que el trigger de versionado marca las filas. `null` oculta el historial. */
  entidadRevisiones,
  vacioDescripcion,
  children,
}: {
  titulo: string;
  descripcion: string;
  tabla: string;
  columnas: readonly ColumnaTabla[];
  ordenarPor?: string;
  ascendente?: boolean;
  filtros?: Record<string, string | number | boolean | null>;
  incluirEliminados?: boolean;
  limite?: number;
  aviso?: ReactNode;
  entidadRevisiones?: string | null;
  vacioDescripcion?: string;
  children?: ReactNode;
}) {
  const entidad = entidadRevisiones ?? tabla;
  // Sólo se ofrece historial donde de verdad hay trigger: una sección vacía en
  // una tabla sin versionar se leería como "nadie la ha tocado", que es falso.
  const conHistorial = entidadRevisiones !== null && TABLAS_VERSIONADAS.has(entidad);

  return (
    <>
      <EncabezadoSeccion titulo={titulo} descripcion={descripcion} etiqueta="Panel editorial" />

      {aviso}

      <Seccion
        titulo={`Contenido de ${tabla}`}
        descripcion="Lo que hay en la base de datos, tal cual. Esta pantalla nunca completa una fila que no exista."
      >
        <TablaRecurso
          tabla={tabla}
          columnas={columnas}
          ordenarPor={ordenarPor}
          ascendente={ascendente}
          filtros={filtros}
          incluirEliminados={incluirEliminados}
          limite={limite}
          vacioTitulo={`La tabla ${tabla} está vacía`}
          vacioDescripcion={
            vacioDescripcion ??
            `No hay ni una fila en ${tabla}. Falta sembrarla o cargar el contenido editorial; ` +
              'el panel no inventa registros de ejemplo para que la pantalla se vea llena.'
          }
        />
      </Seccion>

      {children}

      {conHistorial && <HistorialRevisiones entidad={entidad} />}

      <AvisoRegistroCambios tabla={tabla} />
    </>
  );
}

const COLUMNAS_REVISION: readonly ColumnaTabla[] = [
  { clave: 'created_at', titulo: 'Fecha', formato: 'fecha_hora' },
  { clave: 'entity_id', titulo: 'Registro' },
  { clave: 'revision', titulo: 'Versión', formato: 'numero' },
  { clave: 'changed_fields', titulo: 'Campos modificados', vacio: 'Sin detalle' },
  { clave: 'reason', titulo: 'Motivo', vacio: 'Sin motivo capturado' },
  { clave: 'author_id', titulo: 'Autor', vacio: 'Sin autor (cambio desde la consola)' },
  { clave: 'legal_version', titulo: 'Versión legal', vacio: '—' },
];

/**
 * Historial de una tabla. No promete que el versionado ocurrió: muestra lo que
 * el trigger dejó escrito y explica los dos motivos por los que puede estar
 * vacío, que esta pantalla no puede distinguir.
 */
export function HistorialRevisiones({ entidad }: { entidad: string }) {
  return (
    <Seccion
      titulo="Historial de versiones"
      descripcion={`Cada fila es la versión anterior de un registro de ${entidad}, con su autor, su fecha y su motivo. Es un registro de sólo lectura: ni el panel ni un editor pueden borrarlo.`}
    >
      <TablaRecurso
        tabla="content_revisions"
        columnas={COLUMNAS_REVISION}
        filtros={{ entity: entidad }}
        ordenarPor="created_at"
        incluirEliminados
        limite={50}
        vacioTitulo="Sin versiones registradas"
        vacioDescripcion={`No hay filas en content_revisions con entity = "${entidad}". Puede ser que nadie haya modificado esta tabla, o que el trigger de versionado no esté aplicado en este entorno. Esta pantalla no puede distinguir los dos casos y no lo va a fingir: compruébalo en supabase/migrations antes de darlo por bueno.`}
      />
    </Seccion>
  );
}
