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
 * Longitud máxima aceptada para un destino interno.
 *
 * Ninguna ruta real del sitio se acerca a esto. El tope existe para que un
 * `?destino=` de kilobytes no acabe en los registros del servidor.
 */
const LARGO_MAXIMO_DESTINO = 2048;

/**
 * Sanea el parámetro `destino` de los redirectos de autenticación.
 *
 * Sólo se aceptan rutas internas. Aceptar una URL absoluta convertiría
 * /entrar en un redirector abierto: bastaría mandar a alguien a
 * `/entrar?destino=https://sitio-falso.mx` para llevarlo a un clon del panel
 * justo después de que teclea su contraseña. `//host` también se rechaza
 * porque el navegador lo interpreta como protocolo relativo.
 *
 * ── Por qué se normaliza antes de validar ──────────────────────────────────
 *
 * Validar la cadena cruda no basta, y esta función lo hizo durante meses.
 * El estándar de URL obliga a **eliminar** tabuladores, saltos de línea y
 * retornos de carro del texto ANTES de interpretarlo. Así que `/⁠\n/evil.com`
 * empieza con un solo `/` y pasaba las tres comprobaciones de abajo, pero
 * `new URL()` y el navegador lo leen como `//evil.com`: protocolo relativo,
 * es decir, redirector abierto hacia un dominio ajeno.
 *
 * Comprobado: `new URL('/\n/evil.com', 'https://leyantilavado.org')` devuelve
 * `https://evil.com/`. Lo mismo con `\t` y con `\r`.
 *
 * La lección general es que **hay que validar la cadena que se va a usar, no
 * la que llegó**. Por eso se normaliza primero y se devuelve el valor ya
 * normalizado: lo que sale de aquí es exactamente lo que verá `new URL()`.
 */
export function destinoSeguro(valor: string | null | undefined, porOmision: string): string {
  if (!valor) return porOmision;
  if (valor.length > LARGO_MAXIMO_DESTINO) return porOmision;

  // Las mismas transformaciones que hará el analizador de URL: quitar
  // tabuladores y saltos de línea en cualquier posición, y recortar los
  // controles C0 y espacios de los extremos.
  const normalizado = valor.replace(/[\t\n\r]/g, '').replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '');

  if (!normalizado.startsWith('/')) return porOmision;
  if (normalizado.startsWith('//') || normalizado.startsWith('/\\')) return porOmision;
  return normalizado;
}
