import { describe, expect, it } from 'vitest';
import { MATRIZ_PERMISOS, ROLES_ORGANIZACION } from '@leyantilavado/types';
import { destinoSeguro, rolSimuladoValido, rolesSimulables } from './permisos';

describe('ver como', () => {
  it('nunca permite simular un rol con más permisos que el real', () => {
    for (const real of ROLES_ORGANIZACION) {
      for (const simulado of rolesSimulables(real)) {
        const extra = MATRIZ_PERMISOS[simulado].filter(
          (p) => !MATRIZ_PERMISOS[real].includes(p),
        );
        expect(extra, `${real} no debería poder simular ${simulado}`).toEqual([]);
      }
    }
  });

  it('un rol de consulta no puede simular a nadie', () => {
    expect(rolesSimulables('consulta')).toEqual([]);
  });

  it('un analista no puede simular a un propietario', () => {
    expect(rolSimuladoValido('analista', 'propietario')).toBe(false);
  });

  it('un propietario puede simular a un rol de consulta', () => {
    expect(rolSimuladoValido('propietario', 'consulta')).toBe(true);
  });

  it('nadie se simula a sí mismo', () => {
    for (const rol of ROLES_ORGANIZACION) {
      expect(rolSimuladoValido(rol, rol)).toBe(false);
    }
  });
});

describe('destinoSeguro', () => {
  it('acepta rutas internas', () => {
    expect(destinoSeguro('/panel/clientes', '/panel')).toBe('/panel/clientes');
    expect(destinoSeguro('/panel?filtro=alto', '/panel')).toBe('/panel?filtro=alto');
  });

  it('rechaza cualquier destino externo', () => {
    for (const malicioso of [
      'https://sitio-falso.mx/panel',
      '//sitio-falso.mx',
      '/\\sitio-falso.mx',
      'javascript:alert(1)',
      '',
      null,
      undefined,
    ]) {
      expect(destinoSeguro(malicioso, '/panel')).toBe('/panel');
    }
  });

  /**
   * Regresión de un redirector abierto real.
   *
   * El estándar de URL manda eliminar tabuladores y saltos de línea antes de
   * interpretar el texto, así que `/\n/sitio-falso.mx` empieza con un solo `/`
   * —pasaba las comprobaciones— pero el navegador lo lee como `//sitio-falso.mx`.
   *
   * La prueba no se conforma con mirar la cadena: resuelve el resultado con
   * `new URL` igual que hace el endpoint, porque el fallo estaba justo en la
   * distancia entre lo que se validaba y lo que se usaba.
   */
  it('rechaza los destinos que el analizador de URL convierte en protocolo relativo', () => {
    const base = 'https://leyantilavado.org/api/auth/confirmar';

    for (const malicioso of [
      '/\n/sitio-falso.mx',
      '/\t/sitio-falso.mx',
      '/\r/sitio-falso.mx',
      '/\n\t/sitio-falso.mx',
      '  //sitio-falso.mx',
      '\n//sitio-falso.mx',
    ]) {
      const salida = destinoSeguro(malicioso, '/panel');
      const resuelto = new URL(salida, base);
      expect(resuelto.origin, `${JSON.stringify(malicioso)} se escapó del sitio`).toBe(
        'https://leyantilavado.org',
      );
    }
  });

  it('no acepta destinos absurdamente largos', () => {
    expect(destinoSeguro(`/panel?x=${'a'.repeat(4000)}`, '/panel')).toBe('/panel');
  });
});
