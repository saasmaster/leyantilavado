import { describe, expect, it } from 'vitest';
import { pesosACentavos, type Operacion } from '@leyantilavado/types';
import { evaluarAcumulacion } from './acumulacion';
import { buscarRegla } from './motor';

const $ = pesosACentavos;

const op = (o: Partial<Operacion> & Pick<Operacion, 'actividad' | 'monto'>): Operacion => ({
  id: 'op-1',
  fecha: '2026-06-15',
  medioPago: 'transferencia',
  clienteId: 'c1',
  ...o,
});

/**
 * Umbral variable: el monto contra el que se compara depende del supuesto, así
 * que sumar operaciones de supuestos distintos produce una conclusión que no
 * corresponde a ninguna de las dos reglas.
 *
 * Esta prueba es el espejo de la de la app Flutter. Si alguien quita la
 * agrupación por supuesto en cualquiera de los dos motores, el sitio y la app
 * empiezan a dar respuestas distintas para los mismos hechos.
 */
describe('acumulación con umbral variable agrupa por supuesto', () => {
  const regla = buscarRegla('traslado-custodia-valores', undefined, '2026-06-15')!;

  it('la regla existe y su aviso es un umbral variable', () => {
    expect(regla).toBeTruthy();
    expect(regla.aviso.tipo).toBe('variable');
  });

  it('no suma un traslado indeterminable con uno determinable', () => {
    const actual = op({
      id: 'determinable',
      actividad: 'traslado-custodia-valores',
      monto: $('1000000'),
      montoIndeterminable: false,
    });
    const otroSupuesto = op({
      id: 'indeterminable',
      actividad: 'traslado-custodia-valores',
      fecha: '2026-05-01',
      monto: $('9000000'),
      montoIndeterminable: true,
    });

    const r = evaluarAcumulacion({
      operacionActual: actual,
      historial: [otroSupuesto],
      regla,
    });

    // Sólo debe haber considerado la operación evaluada.
    expect(r.operaciones).toHaveLength(1);
    expect(r.operaciones[0]!.operacion.id).toBe('determinable');
    expect(r.total).toBe(actual.monto);
  });

  it('sí suma dos traslados del mismo supuesto', () => {
    const actual = op({
      id: 'a',
      actividad: 'traslado-custodia-valores',
      monto: $('1000000'),
      montoIndeterminable: false,
    });
    const mismo = op({
      id: 'b',
      actividad: 'traslado-custodia-valores',
      fecha: '2026-05-01',
      monto: $('500000'),
      montoIndeterminable: false,
    });

    const r = evaluarAcumulacion({ operacionActual: actual, historial: [mismo], regla });
    expect(r.operaciones).toHaveLength(2);
    expect(r.total).toBe($('1500000'));
  });
});
