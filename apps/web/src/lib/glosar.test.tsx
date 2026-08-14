import { describe, expect, it } from 'vitest';
import * as React from 'react';
import { contarGlosas, glosar } from './glosar';

/** Texto plano de lo que `glosar` devuelve, para poder afirmar sobre el resultado. */
function plano(nodo: React.ReactNode): string {
  if (typeof nodo === 'string') return nodo;
  if (Array.isArray(nodo)) return nodo.map(plano).join('');
  if (React.isValidElement(nodo)) {
    return plano((nodo.props as { children?: React.ReactNode }).children);
  }
  return '';
}

/** Los términos enlazados, en orden de aparición. */
function enlazados(nodo: React.ReactNode): { texto: string; href: string }[] {
  const nodos = Array.isArray(nodo) ? nodo : [nodo];
  return nodos.filter(React.isValidElement).map((n) => {
    const props = n.props as { children?: React.ReactNode; href?: string };
    return { texto: plano(props.children), href: String(props.href) };
  });
}

describe('glosar', () => {
  it('no altera el texto, sólo lo envuelve', () => {
    const texto =
      'El sujeto obligado debe presentar el aviso a la UIF dentro del plazo que marca la ley.';
    expect(plano(glosar(texto))).toBe(texto);
  });

  it('enlaza un acrónimo al glosario', () => {
    const enlaces = enlazados(glosar('El aviso se presenta ante la UIF.'));
    expect(enlaces).toContainEqual({ texto: 'UIF', href: '/glosario#uif' });
  });

  /**
   * El caso que convierte esta utilidad en ruido si se hace mal: un término
   * repetido siete veces, enlazado siete veces, deja el párrafo ilegible.
   */
  it('enlaza sólo el primer uso de cada término', () => {
    const texto = 'La UIF publica. La UIF revisa. La UIF sanciona.';
    const enlaces = enlazados(glosar(texto));
    expect(enlaces.filter((e) => e.href === '/glosario#uif')).toHaveLength(1);
    expect(plano(glosar(texto))).toBe(texto);
  });

  /**
   * Sin fronteras de palabra, «FT» enlaza dentro de «SOFTWARE» y «PEP» dentro
   * de «PEPSI». Con acrónimos de dos y tres letras esto no es hipotético.
   */
  it('no enlaza dentro de otra palabra', () => {
    expect(contarGlosas('Compramos SOFTWARE y PEPSI para la oficina.')).toBe(0);
  });

  /** «beneficiario controlador» debe ganarle a cualquier término más corto. */
  it('prefiere el término más largo cuando uno contiene al otro', () => {
    const enlaces = enlazados(glosar('Hay que identificar al beneficiario controlador.'));
    expect(enlaces).toHaveLength(1);
    expect(enlaces[0]!.texto.toLowerCase()).toBe('beneficiario controlador');
  });

  it('respeta las mayúsculas del autor', () => {
    const texto = 'Beneficiario controlador es quien se lleva el provecho.';
    expect(plano(glosar(texto))).toBe(texto);
  });

  /**
   * En la página del glosario, enlazar un término a sí mismo es absurdo.
   *
   * La frase de prueba dice «se presenta ante la UIF» y no «el aviso va a la
   * UIF» porque «aviso» también está en el glosario: con esa frase la prueba
   * contaba dos enlaces y parecía que la exclusión no funcionaba, cuando lo
   * que fallaba era la frase.
   */
  it('excluye los términos que se le indiquen', () => {
    expect(contarGlosas('Se presenta ante la UIF.', { excluir: ['uif'] })).toBe(0);
    expect(contarGlosas('Se presenta ante la UIF.')).toBe(1);
  });

  it('devuelve el texto intacto cuando no hay nada que enlazar', () => {
    const texto = 'Una frase corriente sin vocabulario técnico.';
    expect(glosar(texto)).toBe(texto);
  });
});
