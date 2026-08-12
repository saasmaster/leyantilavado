import { Insignia, Nota } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { AvisoEfirma } from '@/components/app/Avisos';
import { requerirContexto } from '@/lib/auth/sesion';
import { clienteServidor } from '@/lib/supabase/servidor';
import { AltaMFA, type FactorMFA } from './AltaMFA';

/**
 * Los factores se leen aquí y no en `leerSesion` porque el cliente necesita el
 * identificador de cada uno para poder retirarlo, y el contexto de la sesión
 * sólo expone un booleano.
 */
async function factoresVerificados(): Promise<FactorMFA[]> {
  const supabase = await clienteServidor();
  if (!supabase) return [];
  const { data } = await supabase.auth.mfa.listFactors();
  return (data?.totp ?? [])
    .filter((factor) => factor.status === 'verified')
    .map((factor) => ({
      id: factor.id,
      nombre: factor.friendly_name || 'Aplicación de autenticación',
    }));
}

export default async function PaginaSeguridad() {
  const contexto = await requerirContexto('/panel/seguridad');
  const factores = await factoresVerificados();
  const conSegundoFactor = factores.length > 0;
  const sesionConSegundoFactor = contexto.usuario.nivelAutenticacion === 'aal2';

  return (
    <>
      <EncabezadoSeccion
        titulo="Seguridad de mi cuenta"
        descripcion="El estado de tu segundo factor de autenticación y de la sesión con la que estás navegando ahora mismo."
      />

      <Seccion titulo="Estado actual">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="tarjeta p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
              Segundo factor
            </p>
            <p className="mt-2">
              <Insignia tono={conSegundoFactor ? 'verde' : 'ambar'}>
                {conSegundoFactor ? 'Activo' : 'Sin activar'}
              </Insignia>
            </p>
            <p className="mt-2 text-sm text-[var(--color-tinta-suave)]">
              {conSegundoFactor
                ? 'Tu cuenta pide un código temporal además de la contraseña.'
                : 'Tu cuenta se protege sólo con la contraseña. Con acceso a expedientes de clientes y operaciones, eso es poco.'}
            </p>
          </div>

          <div className="tarjeta p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
              Esta sesión
            </p>
            <p className="mt-2">
              <Insignia tono={sesionConSegundoFactor ? 'verde' : 'neutro'}>
                {contexto.usuario.nivelAutenticacion}
              </Insignia>
            </p>
            <p className="mt-2 text-sm text-[var(--color-tinta-suave)]">
              {sesionConSegundoFactor
                ? 'Verificaste el segundo factor al entrar, así que esta sesión tiene el nivel de garantía más alto.'
                : 'Esta sesión se abrió sólo con contraseña. Es el nivel básico de garantía.'}
            </p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-tinta-suave)]">
          Tu cuenta: <span className="font-medium text-[var(--color-tinta)]">{contexto.usuario.correo}</span>
          {contexto.rolReal && contexto.organizacion
            ? ` · ${contexto.organizacion.nombre}`
            : ''}
        </p>
      </Seccion>

      <Seccion
        titulo="Segundo factor de autenticación"
        descripcion="Un código temporal de seis dígitos que genera una aplicación en tu teléfono."
      >
        <AltaMFA factores={factores} />
      </Seccion>

      <AvisoEfirma />

      <Nota tono="info" titulo="Qué no controla esta pantalla">
        <p>
          Cambiar la contraseña se hace desde el correo de recuperación, no desde aquí: así el
          cambio siempre pasa por una dirección que ya controlas. Y cerrar sesión en otros
          dispositivos todavía no está disponible; está pendiente.
        </p>
        <p>
          Activar el segundo factor protege tu cuenta, no la de tu equipo. Cada persona lo activa
          por su cuenta y nadie puede hacerlo por otra.
        </p>
      </Nota>
    </>
  );
}
