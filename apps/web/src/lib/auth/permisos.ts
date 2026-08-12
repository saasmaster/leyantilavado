import {
  MATRIZ_PERMISOS,
  ROLES_ORGANIZACION,
  type RolOrganizacion,
} from '@leyantilavado/types';

/**
 * Lógica pura de "ver como". Vive aparte de `sesion.ts` porque ese módulo
 * importa `next/headers` y no se puede probar fuera de una petición.
 *
 * "Ver como" es SÓLO presentación: sirve para que quien administra compruebe
 * qué ve un analista. Aun así se restringe a roles con un subconjunto estricto
 * de permisos, porque una simulación que amplíe permisos en la interfaz
 * produce botones que fallan contra RLS y hace creer que el sistema está roto.
 */
export function rolSimuladoValido(real: RolOrganizacion, simulado: RolOrganizacion): boolean {
  if (real === simulado) return false;
  const permisosReales = MATRIZ_PERMISOS[real];
  return MATRIZ_PERMISOS[simulado].every((p) => permisosReales.includes(p));
}

/** Roles que un rol real puede simular. */
export function rolesSimulables(real: RolOrganizacion): RolOrganizacion[] {
  return ROLES_ORGANIZACION.filter((r) => rolSimuladoValido(real, r));
}

export function esRolValido(valor: unknown): valor is RolOrganizacion {
  return typeof valor === 'string' && (ROLES_ORGANIZACION as readonly string[]).includes(valor);
}

export const ETIQUETA_ROL: Record<RolOrganizacion, string> = {
  propietario: 'Propietario',
  administrador: 'Administrador',
  analista: 'Analista',
  auditor: 'Auditor',
  consulta: 'Consulta',
};

/**
 * Sanea el parámetro `destino` de los redirectos de autenticación.
 *
 * Sólo se aceptan rutas internas. Aceptar una URL absoluta convertiría
 * /entrar en un redirector abierto: bastaría mandar a alguien a
 * `/entrar?destino=https://sitio-falso.mx` para llevarlo a un clon del panel
 * justo después de que teclea su contraseña. `//host` también se rechaza
 * porque el navegador lo interpreta como protocolo relativo.
 */
export function destinoSeguro(valor: string | null | undefined, porOmision: string): string {
  if (!valor) return porOmision;
  if (!valor.startsWith('/')) return porOmision;
  if (valor.startsWith('//') || valor.startsWith('/\\')) return porOmision;
  return valor;
}
