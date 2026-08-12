import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';
import { datos } from '@leyantilavado/rules-engine';
import { Boton, Campo, Entrada, Insignia, Nota } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { EstadoConsulta, TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { listar } from '@/lib/app/consultas';
import { requerirContexto } from '@/lib/auth/sesion';
import { clienteServidor } from '@/lib/supabase/servidor';

const RUTA = '/panel/organizaciones';

const COLUMNAS_SUCURSALES = [
  { clave: 'name', titulo: 'Sucursal' },
  { clave: 'code', titulo: 'Clave', vacio: 'Sin clave' },
  { clave: 'city', titulo: 'Ciudad', vacio: 'Sin ciudad' },
  { clave: 'state', titulo: 'Estado', vacio: 'Sin estado' },
  { clave: 'address', titulo: 'Dirección', vacio: 'Sin dirección' },
  { clave: 'is_active', titulo: 'Activa', formato: 'booleano' },
  { clave: 'created_at', titulo: 'Alta', formato: 'fecha' },
] satisfies readonly ColumnaTabla[];

interface FilaOrganizacion {
  name: string;
  legal_name: string | null;
  rfc: string | null;
  entity_type: string;
  activities: string[] | null;
  sat_registration_date: string | null;
  compliance_officer_name: string | null;
  compliance_officer_email: string | null;
  state: string | null;
  city: string | null;
  plan: string;
}

const ETIQUETA_TIPO: Record<string, string> = {
  persona_fisica: 'Persona física',
  persona_moral: 'Persona moral',
  fideicomiso: 'Fideicomiso',
};

const MENSAJE_ERROR: Record<string, string> = {
  nombre_vacio: 'Escribe el nombre de la sucursal.',
  sin_organizacion: 'Primero necesitas pertenecer a una organización.',
  clave_repetida: 'Ya existe una sucursal con esa clave en esta organización.',
  rechazado:
    'La base de datos rechazó el alta. Crear sucursales exige rol de propietario o de administrador.',
};

/**
 * Alta de sucursal.
 *
 * La acción vuelve a resolver el contexto en el servidor en lugar de confiar en
 * un identificador escondido en el formulario: si la organización activa viaja
 * por el formulario, cualquiera puede cambiarla antes de enviarlo. Aun así, la
 * frontera real es la política de la base de datos, que exige rol de
 * administración para insertar.
 */
async function crearSucursal(datosFormulario: FormData): Promise<void> {
  'use server';

  const contexto = await requerirContexto(RUTA);
  const organizacionId = contexto.organizacion?.organizacionId;
  if (!organizacionId) redirect(`${RUTA}?error=sin_organizacion`);

  const leer = (clave: string): string => {
    const valor = datosFormulario.get(clave);
    return typeof valor === 'string' ? valor.trim() : '';
  };

  const name = leer('nombre');
  if (!name) redirect(`${RUTA}?error=nombre_vacio`);

  const supabase = await clienteServidor();
  if (!supabase) redirect(`${RUTA}?error=rechazado`);

  const { error } = await supabase.from('branches').insert({
    organization_id: organizacionId,
    name,
    code: leer('clave') || null,
    city: leer('ciudad') || null,
    state: leer('estado') || null,
    address: leer('direccion') || null,
  });

  if (error) {
    // 23505 = clave duplicada; el resto lo tratamos como rechazo de permisos.
    redirect(`${RUTA}?error=${error.code === '23505' ? 'clave_repetida' : 'rechazado'}`);
  }

  revalidatePath(RUTA);
  redirect(`${RUTA}?estado=creada`);
}

export default async function PaginaOrganizaciones({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const contexto = await requerirContexto(RUTA);
  const parametros = await searchParams;
  const org = contexto.organizacion?.organizacionId ?? null;

  const codigoError = typeof parametros['error'] === 'string' ? parametros['error'] : '';
  const error = MENSAJE_ERROR[codigoError];
  const creada = parametros['estado'] === 'creada';

  const resultado = org
    ? await listar<FilaOrganizacion>('organizations', {
        columnas:
          'name,legal_name,rfc,entity_type,activities,sat_registration_date,compliance_officer_name,compliance_officer_email,state,city,plan',
        filtros: { id: org },
      })
    : null;

  const organizacion = resultado?.estado === 'ok' ? resultado.filas[0] : undefined;
  const puedeAdministrar = contexto.puede('org.miembros');

  if (!org) {
    return (
      <>
        <EncabezadoSeccion
          titulo="Organizaciones y sucursales"
          descripcion="Todavía no perteneces a ninguna organización."
        />
        <Nota tono="info" titulo="Sin organización activa">
          <p>
            El área privada guarda expedientes, operaciones y avisos por organización. Pide a quien
            administra la tuya que te invite, o crea una desde el alta de la plataforma. Esta
            pantalla no puede crear organizaciones: quien la crea queda como propietario, y ese
            registro se hace en el alta para que quede constancia de quién fue.
          </p>
        </Nota>
      </>
    );
  }

  return (
    <>
      <EncabezadoSeccion
        titulo="Organizaciones y sucursales"
        descripcion="Los datos de la organización activa y las sucursales desde las que operas."
        etiqueta={contexto.organizacion?.nombre}
      />

      {creada && (
        <Nota tono="exito" titulo="Sucursal creada">
          <p>Ya aparece en la lista de abajo y puedes asignarle operaciones y clientes.</p>
        </Nota>
      )}

      <Seccion titulo="Datos de la organización">
        {organizacion ? (
          <div className="tarjeta p-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                { etiqueta: 'Nombre', valor: organizacion.name },
                { etiqueta: 'Razón social', valor: organizacion.legal_name },
                { etiqueta: 'RFC', valor: organizacion.rfc },
                {
                  etiqueta: 'Tipo de persona',
                  valor: ETIQUETA_TIPO[organizacion.entity_type] ?? organizacion.entity_type,
                },
                { etiqueta: 'Alta ante el SAT', valor: organizacion.sat_registration_date },
                {
                  etiqueta: 'Representante de cumplimiento',
                  valor: organizacion.compliance_officer_name,
                },
                {
                  etiqueta: 'Correo del representante',
                  valor: organizacion.compliance_officer_email,
                },
                { etiqueta: 'Estado', valor: organizacion.state },
                { etiqueta: 'Ciudad', valor: organizacion.city },
                { etiqueta: 'Plan', valor: organizacion.plan },
              ].map((dato) => (
                <div key={dato.etiqueta}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                    {dato.etiqueta}
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--color-tinta)]">
                    {dato.valor || (
                      <span className="text-[var(--color-tinta-tenue)]">Sin registrar</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 border-t border-[var(--color-borde)] pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                Actividades vulnerables declaradas
              </p>
              {organizacion.activities && organizacion.activities.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {organizacion.activities.map((slug) => (
                    <li key={slug}>
                      <Insignia tono="marino">
                        {datos.ACTIVIDADES.find((a) => a.slug === slug)?.nombreCorto ?? slug}
                      </Insignia>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
                  Ninguna declarada. Sin actividades declaradas, el motor no puede decirte qué
                  umbrales te aplican.
                </p>
              )}
            </div>
          </div>
        ) : (
          <EstadoConsulta
            resultado={resultado ?? { estado: 'error', mensaje: 'No se pudo resolver la organización activa.' }}
            vacioTitulo="No se encontró la organización"
            vacioDescripcion="La organización activa no devolvió datos. Puede que se haya eliminado o que tu membresía ya no esté activa."
          />
        )}
      </Seccion>

      <Nota tono="info" titulo="Los datos de la organización se editan fuera de esta pantalla">
        <p>
          Esta versión muestra los datos en sólo lectura. Cambiarlos —sobre todo el RFC y las
          actividades declaradas— altera qué reglas se aplican a cada operación, así que la edición
          se hará con su propio registro de cambios en lugar de un formulario suelto. Está
          pendiente.
        </p>
      </Nota>

      <Seccion
        titulo="Sucursales"
        descripcion="Sirven para separar operaciones y para limitar a qué información llega cada analista."
      >
        <TablaRecurso
          tabla="branches"
          columnas={COLUMNAS_SUCURSALES}
          organizacionId={org}
          ordenarPor="created_at"
          vacioTitulo="Todavía no hay sucursales"
          vacioDescripcion="Si operas desde un solo domicilio no necesitas ninguna. Créalas cuando quieras separar operaciones por plaza o restringir el acceso de alguien del equipo."
        />
      </Seccion>

      {puedeAdministrar ? (
        <Seccion
          titulo="Crear sucursal"
          descripcion="Sólo el nombre es obligatorio. Lo demás se puede completar después."
        >
          <form action={crearSucursal} className="tarjeta flex flex-col gap-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                id="nombre"
                etiqueta="Nombre de la sucursal"
                requerido
                error={codigoError === 'nombre_vacio' ? error : undefined}
              >
                <Entrada name="nombre" required maxLength={120} autoComplete="off" />
              </Campo>
              <Campo
                id="clave"
                etiqueta="Clave interna"
                ayuda="Opcional. Tiene que ser distinta a la de las demás sucursales."
                error={codigoError === 'clave_repetida' ? error : undefined}
              >
                <Entrada name="clave" maxLength={40} autoComplete="off" />
              </Campo>
              <Campo id="ciudad" etiqueta="Ciudad">
                <Entrada name="ciudad" maxLength={80} autoComplete="address-level2" />
              </Campo>
              <Campo id="estado" etiqueta="Estado">
                <Entrada name="estado" maxLength={80} autoComplete="address-level1" />
              </Campo>
              <Campo id="direccion" etiqueta="Dirección" className="sm:col-span-2">
                <Entrada name="direccion" maxLength={200} autoComplete="street-address" />
              </Campo>
            </div>

            {codigoError === 'rechazado' && (
              <Nota tono="riesgo" titulo="No se pudo crear la sucursal">
                <p>{MENSAJE_ERROR['rechazado']}</p>
              </Nota>
            )}

            <div>
              <Boton type="submit" variante="accion">
                <Plus aria-hidden="true" />
                Crear sucursal
              </Boton>
            </div>
          </form>
        </Seccion>
      ) : (
        <Nota tono="atencion" titulo="No puedes crear sucursales con tu rol">
          <p>
            <Building2 aria-hidden="true" className="mr-1.5 inline size-4 align-[-3px]" />
            El alta de sucursales está reservada a los roles de propietario y administrador. No te
            mostramos el formulario porque la base de datos rechazaría el alta de todas formas.
          </p>
        </Nota>
      )}
    </>
  );
}
