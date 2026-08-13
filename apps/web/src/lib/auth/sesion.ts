import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  puede as puedeSegunMatriz,
  type Permiso,
  type RolOrganizacion,
} from '@leyantilavado/types';
import { clienteServidor } from '@/lib/supabase/servidor';
import { RUTA_ENTRAR, supabaseConfigurado, variablesFaltantes } from '@/lib/supabase/configuracion';
import { esRolValido, rolSimuladoValido } from './permisos';

export const COOKIE_ORGANIZACION = 'org_activa';
export const COOKIE_VER_COMO = 'ver_como';

export interface UsuarioApp {
  id: string;
  correo: string;
  nombre: string;
  esStaff: boolean;
  /** Nivel de garantía de la sesión: `aal2` = con segundo factor verificado. */
  nivelAutenticacion: string;
  mfaActivo: boolean;
}

export interface MembresiaOrg {
  organizacionId: string;
  nombre: string;
  rfc: string | null;
  rol: RolOrganizacion;
  estado: string;
}

export type EstadoSesion =
  | { estado: 'sin_configurar'; faltantes: string[] }
  | { estado: 'anonimo' }
  | { estado: 'activa'; usuario: UsuarioApp; organizaciones: MembresiaOrg[] };

/** Lee la sesión sin redirigir. Sirve para el layout y para el sitio público. */
export async function leerSesion(): Promise<EstadoSesion> {
  if (!supabaseConfigurado) {
    return { estado: 'sin_configurar', faltantes: variablesFaltantes() };
  }

  const supabase = await clienteServidor();
  if (!supabase) return { estado: 'sin_configurar', faltantes: variablesFaltantes() };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { estado: 'anonimo' };

  const { data: factores } = await supabase.auth.mfa.listFactors();
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  const { data: perfil } = await supabase
    .from('users')
    .select('full_name, is_staff')
    .eq('id', user.id)
    .maybeSingle();

  const { data: filas } = await supabase
    .from('organization_members')
    .select('role, status, organizations(id, name, rfc)')
    .eq('user_id', user.id)
    .eq('status', 'activo');

  const organizaciones: MembresiaOrg[] = [];
  for (const fila of (filas ?? []) as unknown as {
    role: string;
    status: string;
    organizations: { id: string; name: string; rfc: string | null } | null;
  }[]) {
    if (!fila.organizations || !esRolValido(fila.role)) continue;
    organizaciones.push({
      organizacionId: fila.organizations.id,
      nombre: fila.organizations.name,
      rfc: fila.organizations.rfc,
      rol: fila.role,
      estado: fila.status,
    });
  }

  const perfilTipado = perfil as { full_name: string | null; is_staff: boolean } | null;

  return {
    estado: 'activa',
    usuario: {
      id: user.id,
      correo: user.email ?? '',
      nombre: perfilTipado?.full_name ?? user.email ?? 'Sin nombre',
      esStaff: perfilTipado?.is_staff === true,
      nivelAutenticacion: aal?.currentLevel ?? 'aal1',
      mfaActivo: (factores?.totp ?? []).some((f) => f.status === 'verified'),
    },
    organizaciones,
  };
}

export interface ContextoApp {
  usuario: UsuarioApp;
  organizaciones: MembresiaOrg[];
  organizacion: MembresiaOrg | null;
  /** El rol que la base de datos reconoce. Es el que manda en RLS. */
  rolReal: RolOrganizacion | null;
  /** El rol con el que se dibuja la interfaz ("ver como"). Nunca eleva. */
  rolEfectivo: RolOrganizacion | null;
  verComoActivo: boolean;
  puede: (permiso: Permiso) => boolean;
}

/**
 * Contexto del área privada. Redirige a /entrar si no hay sesión.
 * Lanza `redirect`, así que sólo se llama desde Server Components y acciones.
 */
export async function requerirContexto(destino = '/panel'): Promise<ContextoApp> {
  const sesion = await leerSesion();
  if (sesion.estado !== 'activa') {
    redirect(`${RUTA_ENTRAR}?destino=${encodeURIComponent(destino)}`);
  }

  const almacen = await cookies();
  const idGuardado = almacen.get(COOKIE_ORGANIZACION)?.value;
  const organizacion =
    sesion.organizaciones.find((o) => o.organizacionId === idGuardado) ??
    sesion.organizaciones[0] ??
    null;

  const rolReal = organizacion?.rol ?? null;
  const simulado = almacen.get(COOKIE_VER_COMO)?.value;
  const verComo =
    rolReal && esRolValido(simulado) && rolSimuladoValido(rolReal, simulado) ? simulado : null;
  const rolEfectivo = verComo ?? rolReal;

  return {
    usuario: sesion.usuario,
    organizaciones: sesion.organizaciones,
    organizacion,
    rolReal,
    rolEfectivo,
    verComoActivo: verComo !== null,
    puede: (permiso) => (rolEfectivo ? puedeSegunMatriz(rolEfectivo, permiso) : false),
  };
}

/**
 * Contexto del área privada EXIGIENDO un permiso concreto.
 *
 * `requerirContexto` sólo comprueba que haya sesión. El permiso vivía
 * únicamente en `navegacion.ts`, y allí decide si se DIBUJA el enlace del
 * menú: un menú es presentación, no una frontera. Cualquiera con sesión podía
 * escribir `/panel/exportaciones` en la barra de direcciones y recibir la
 * página completa, con su botón de descarga, aunque su rol no tuviera
 * `documentos.descargar`.
 *
 * RLS seguía filtrando las filas, así que no era una fuga abierta de datos —
 * pero «la base de datos lo tapa» no es una autorización, es una red debajo de
 * una autorización que faltaba. Y en exportaciones la diferencia importa: la
 * página existe para sacar los datos del sistema.
 *
 * ── Se evalúa `rolReal`, no `rolEfectivo` ──────────────────────────────────
 * `rolEfectivo` incluye la simulación de «ver como», que sólo puede bajar de
 * rol. Una frontera de autorización tiene que preguntar qué puede hacer la
 * persona de verdad, no qué está fingiendo ser; si no, la respuesta depende de
 * una cookie que el propio usuario controla.
 */
export async function requerirPermiso(
  permiso: Permiso,
  destino = '/panel',
): Promise<ContextoApp> {
  const contexto = await requerirContexto(destino);
  const autorizado = contexto.rolReal ? puedeSegunMatriz(contexto.rolReal, permiso) : false;

  if (!autorizado) {
    redirect(`/panel?error=sin_permiso&modulo=${encodeURIComponent(permiso)}`);
  }

  return contexto;
}

/** Igual que `requerirContexto` pero además exige ser personal de la plataforma. */
export async function requerirStaff(): Promise<ContextoApp> {
  const contexto = await requerirContexto('/admin');
  if (!contexto.usuario.esStaff) redirect('/panel?error=sin_permiso_admin');
  return contexto;
}
