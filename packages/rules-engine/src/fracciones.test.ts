import { describe, expect, it } from 'vitest';
import { ACTIVIDADES } from './datos/actividades';

/**
 * El artículo 17 enumera 17 fracciones, no 16.
 *
 * Verificado contra el texto vigente publicado por la Cámara de Diputados
 * (última reforma DOF 16-07-2025): I, II, III, IV, V, **V Bis**, VI, VII, VIII,
 * IX, X, XI, XII, XIII, XIV, XV y XVI.
 *
 * La V Bis —recepción de recursos destinados a un Desarrollo Inmobiliario— fue
 * adicionada por ese mismo decreto.
 *
 * Esta prueba existe porque el sitio publicó «16 fracciones» durante meses. El
 * motor siempre tuvo la V Bis bien; lo que fallaba era el conteo, que
 * normalizaba con `fraccion.split(' ')[0]` y así fundía «V Bis» dentro de «V».
 * Un error de una sola palabra, invisible en el dato y visible en la portada,
 * en la cifra más citable de un sitio cuya promesa es la precisión.
 */

/** Recorta incisos y apartados —que no son fracciones aparte— y conserva `Bis`. */
function fraccionDe(etiqueta: string): string {
  return etiqueta.replace(/\s+(?:inciso|Apartado)\s.*$/, '');
}

describe('fracciones del artículo 17', () => {
  const fracciones = new Set(ACTIVIDADES.map((a) => fraccionDe(a.fraccion)));

  it('son 17, e incluyen la V Bis', () => {
    expect(fracciones.size).toBe(17);
    expect(fracciones.has('V Bis')).toBe(true);
    expect(fracciones.has('V')).toBe(true);
  });

  it('cubre I a XVI sin huecos', () => {
    const ROMANOS = [
      'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
      'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI',
    ];
    for (const r of ROMANOS) {
      expect(fracciones.has(r), `falta la fracción ${r}`).toBe(true);
    }
  });

  it('los incisos y apartados NO cuentan como fracción aparte', () => {
    // La II tiene incisos a), b) y c); la XII tiene apartados A a D. Cada una
    // es UNA fracción con varios supuestos, y aplanarlas al revés inflaría la
    // cuenta tanto como fundir la V Bis la reducía.
    expect(fraccionDe('II inciso a)')).toBe('II');
    expect(fraccionDe('XII Apartado D')).toBe('XII');
    expect(fraccionDe('V Bis')).toBe('V Bis');
  });
});
