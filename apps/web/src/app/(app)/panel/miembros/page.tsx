import { Check, Eye, Minus, ShieldAlert } from 'lucide-react';
import {
  MATRIZ_PERMISOS,
  ROLES_ORGANIZACION,
  type Permiso,
  type RolOrganizacion,
} from '@leyantilavado/types';
import { Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { requerirPermiso } from '@/lib/auth/sesion';

const COLUMNAS = [
  { clave: 'role', titulo: 'Rol', formato: 'insignia' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'invited_email', titulo: 'Correo de invitación', vacio: 'Sin invitación pendiente' },
  { clave: 'user_id', titulo: 'Identificador de la persona' },
  { clave: 'created_at', titulo: 'Alta', formato: 'fecha' },
] satisfies readonly ColumnaTabla[];

const ETIQUETA_ROL: Record<RolOrganizacion, string> = {
  propietario: 'Propietario',
  administrador: 'Administrador',
  analista: 'Analista',
  auditor: 'Auditor',
  consulta: 'Consulta',
};

const DESCRIPCION_ROL: Record<RolOrganizacion, string> = {
  propietario: 'Manda en la organización y es el único que puede repartir su propio nivel.',
  administrador: 'Administra el equipo y las sucursales, y aprueba avisos.',
  analista: 'Captura clientes y operaciones, resuelve alertas y prepara avisos, pero no los aprueba.',
  auditor: 'Lee todo y escribe únicamente en auditorías, hallazgos y remediación.',
  consulta: 'Sólo lee. No escribe en ninguna tabla.',
};

const ETIQUETA_PERMISO: Record<Permiso, string> = {
  'org.editar': 'Editar los datos de la organización',
  'org.miembros': 'Administrar miembros y sucursales',
  'clientes.ver': 'Ver clientes y expedientes',
  'clientes.editar': 'Crear y editar clientes',
  'operaciones.ver': 'Ver operaciones',
  'operaciones.editar': 'Capturar y editar operaciones',
  'operaciones.importar': 'Importar operaciones desde CSV',
  'alertas.ver': 'Ver alertas',
  'alertas.resolver': 'Resolver y descartar alertas',
  'avisos.ver': 'Ver el registro de avisos',
  'avisos.preparar': 'Preparar y mandar avisos a revisión',
  'avisos.aprobar': 'Aprobar y exportar avisos',
  'riesgos.ver': 'Ver la clasificación de riesgo',
  'riesgos.editar': 'Clasificar el riesgo de un cliente',
  'auditoria.ver': 'Ver auditorías, manual y capacitación',
  'auditoria.editar': 'Registrar auditorías y hallazgos',
  'documentos.descargar': 'Descargar documentos y exportaciones',
  'bitacora.ver': 'Ver la bitácora de cambios',
};

const PERMISOS = Object.keys(ETIQUETA_PERMISO) as Permiso[];

export default async function PaginaMiembros() {
  const contexto = await requerirPermiso('org.miembros', '/panel/miembros');
  const org = contexto.organizacion?.organizacionId ?? null;

  return (
    <>
      <EncabezadoSeccion
        titulo="Miembros y roles"
        descripcion="Quién pertenece a la organización, con qué rol, y qué dibuja cada rol en la interfaz."
      />

      <Nota tono="riesgo" titulo="Nadie puede cambiar su propio rol">
        <p>
          <ShieldAlert aria-hidden="true" className="mr-1.5 inline size-4 align-[-3px]" />
          Ni tú, ni quien administra, ni el propietario pueden modificar su propia fila de
          membresía: para cambiar un rol siempre hace falta otra persona. La regla vive en la base
          de datos por partida doble —una política de acceso y un disparador— así que también
          aplica a los scripts que se ejecuten con la clave de servicio.
        </p>
        <p>
          Un administrador tampoco puede crear propietarios: sólo un propietario reparte su propio
          nivel. Y la organización nunca se queda sin al menos un propietario activo.
        </p>
      </Nota>

      <Seccion
        titulo="Miembros de la organización"
        descripcion="Se muestra el identificador interno de cada persona; el cruce con su nombre y correo está pendiente."
      >
        <TablaRecurso
          tabla="organization_members"
          columnas={COLUMNAS}
          organizacionId={org}
          ordenarPor="created_at"
          ascendente
          vacioTitulo="No se pudieron listar los miembros"
          vacioDescripcion="Si tu organización existe, al menos deberías aparecer tú. Que esta lista salga vacía apunta a que la organización activa no es la que crees."
        />
      </Seccion>

      <Seccion
        titulo="Qué hace cada rol"
        descripcion="Cinco roles, sin niveles intermedios. Un rol de más es un permiso que nadie revisa."
      >
        <dl className="flex flex-col gap-3 text-sm">
          {ROLES_ORGANIZACION.map((rol) => (
            <div key={rol}>
              <dt className="font-medium text-[var(--color-tinta)]">{ETIQUETA_ROL[rol]}</dt>
              <dd className="mt-0.5 text-[var(--color-tinta-suave)]">{DESCRIPCION_ROL[rol]}</dd>
            </div>
          ))}
        </dl>
      </Seccion>

      <Seccion
        titulo="Matriz de permisos"
        descripcion="Lo que cada rol ve dibujado en la interfaz."
      >
        <TablaEnvoltura aria-label="Matriz de permisos por rol">
          <table className="w-full min-w-max border-collapse text-sm">
            <caption className="sr-only">
              Permisos que cada uno de los cinco roles tiene asignados en la matriz de presentación.
            </caption>
            <thead>
              <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                <th
                  scope="col"
                  className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                >
                  Permiso
                </th>
                {ROLES_ORGANIZACION.map((rol) => (
                  <th
                    key={rol}
                    scope="col"
                    className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                  >
                    {ETIQUETA_ROL[rol]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISOS.map((permiso) => (
                <tr key={permiso} className="border-b border-[var(--color-borde)] last:border-0">
                  <th
                    scope="row"
                    className="px-3 py-2.5 text-left font-normal text-[var(--color-tinta)]"
                  >
                    {ETIQUETA_PERMISO[permiso]}
                    <span className="ml-2 text-xs text-[var(--color-tinta-tenue)]">
                      <code>{permiso}</code>
                    </span>
                  </th>
                  {ROLES_ORGANIZACION.map((rol) => {
                    const tiene = MATRIZ_PERMISOS[rol].includes(permiso);
                    return (
                      <td key={rol} className="px-3 py-2.5 text-center">
                        {tiene ? (
                          <Check
                            aria-hidden="true"
                            className="inline size-4 text-[var(--color-verde)]"
                          />
                        ) : (
                          <Minus
                            aria-hidden="true"
                            className="inline size-4 text-[var(--color-tinta-tenue)]"
                          />
                        )}
                        <span className="sr-only">{tiene ? 'Sí' : 'No'}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>
      </Seccion>

      <Nota tono="atencion" titulo="Esta matriz es presentación, no seguridad">
        <p>
          La matriz decide qué botones y qué secciones se dibujan. No decide qué se puede leer ni
          qué se puede escribir: eso lo deciden las políticas de la base de datos, que se evalúan en
          Postgres con cada consulta y no se pueden esquivar desde el navegador.
        </p>
        <p>
          Dicho de otra forma: si alguien manipulara la interfaz para hacer aparecer un botón que su
          rol no tiene, la operación se rechazaría igual. Y al revés: que aquí aparezca una palomita
          no garantiza que la base de datos vaya a permitir la escritura en un caso concreto —los
          avisos aprobados y el manual vigente, por ejemplo, tienen condiciones adicionales.
        </p>
      </Nota>

      <Nota tono="info" titulo="«Ver como»: probar la interfaz con menos permisos">
        <p>
          <Eye aria-hidden="true" className="mr-1.5 inline size-4 align-[-3px]" />
          En la barra superior puedes simular un rol con menos permisos que el tuyo para ver la
          aplicación como la ve esa persona. Sólo se ofrecen los roles cuyos permisos son un
          subconjunto de los tuyos: la simulación nunca eleva, sólo rebaja.
        </p>
        <p>
          Y es puramente cosmético. La base de datos te sigue reconociendo con tu rol real durante
          toda la simulación, así que sirve para revisar la interfaz, no para probar la seguridad.
        </p>
      </Nota>
    </>
  );
}
