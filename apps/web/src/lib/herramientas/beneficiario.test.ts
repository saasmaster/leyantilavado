import { describe, expect, it } from 'vitest';
import { analizarEstructura, type Entidad, type Participacion } from './beneficiario';

const e = (id: string, tipo: Entidad['tipo']): Entidad => ({ id, etiqueta: id, tipo });
const p = (
  propietarioId: string,
  participadaId: string,
  porcentaje: number,
  porOtrosMedios = false,
): Participacion => ({
  id: `${propietarioId}->${participadaId}`,
  propietarioId,
  participadaId,
  porcentaje,
  porOtrosMedios,
});

describe('propiedad indirecta', () => {
  it('multiplica los porcentajes a lo largo de la cadena', () => {
    const r = analizarEstructura(
      [e('cliente', 'persona_moral'), e('holding', 'persona_moral'), e('ana', 'persona_fisica')],
      [p('holding', 'cliente', 40), p('ana', 'holding', 50)],
      'cliente',
    );
    // 50% de una sociedad que tiene 40% del cliente = 20% efectivo.
    expect(r.personasFisicas[0]?.etiqueta).toBe('ana');
    expect(r.personasFisicas[0]?.porcentajeEfectivo).toBeCloseTo(20);
  });

  it('suma las cadenas cuando alguien controla por varias vías', () => {
    const r = analizarEstructura(
      [e('cliente', 'persona_moral'), e('holding', 'persona_moral'), e('ana', 'persona_fisica')],
      [p('holding', 'cliente', 40), p('ana', 'holding', 50), p('ana', 'cliente', 10)],
      'cliente',
    );
    // 20% por la holding + 10% directo.
    expect(r.personasFisicas[0]?.porcentajeEfectivo).toBeCloseTo(30);
    expect(r.personasFisicas[0]?.cadenas).toHaveLength(2);
  });

  it('arrastra el control por otros medios por toda la cadena', () => {
    const r = analizarEstructura(
      [e('cliente', 'persona_moral'), e('holding', 'persona_moral'), e('ana', 'persona_fisica')],
      [p('holding', 'cliente', 5, true), p('ana', 'holding', 100)],
      'cliente',
    );
    expect(r.personasFisicas[0]?.controlPorOtrosMedios).toBe(true);
  });

  it('reporta el porcentaje del cliente que nadie explica', () => {
    const r = analizarEstructura(
      [e('cliente', 'persona_moral'), e('ana', 'persona_fisica')],
      [p('ana', 'cliente', 60)],
      'cliente',
    );
    expect(r.sinAtribuir).toBeCloseTo(40);
    expect(r.faltantes.some((f) => f.includes('40.00%'))).toBe(true);
  });

  it('detecta ciclos en lugar de colgarse', () => {
    const r = analizarEstructura(
      [e('cliente', 'persona_moral'), e('a', 'persona_moral'), e('b', 'persona_moral')],
      [p('a', 'cliente', 100), p('b', 'a', 100), p('a', 'b', 100)],
      'cliente',
    );
    expect(r.ciclos.length).toBeGreaterThan(0);
  });

  it('avisa cuando ninguna cadena llega a una persona física', () => {
    const r = analizarEstructura(
      [e('cliente', 'persona_moral'), e('holding', 'persona_moral')],
      [p('holding', 'cliente', 100)],
      'cliente',
    );
    expect(r.personasFisicas).toHaveLength(0);
    expect(r.faltantes.some((f) => f.includes('persona física'))).toBe(true);
  });
});
