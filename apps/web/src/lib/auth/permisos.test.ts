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
});
