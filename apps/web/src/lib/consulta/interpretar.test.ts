import { describe, expect, it } from 'vitest';
import { escalarDecimal, FRASES_EJEMPLO, interpretar } from './interpretar';

/** Fecha de referencia fija: el intérprete jamás llama al reloj. */
const HOY = '2026-08-14';

const leer = (frase: string) => interpretar(frase, HOY);

describe('interpretar — monto', () => {
  /**
   * El caso que da nombre a la herramienta. Si «180 mil» se leyera como 180
   * pesos, la respuesta sería «no parece aplicarte» en una operación que sí
   * genera aviso: el peor error posible aquí.
   */
  it('lee «180 mil» como 180,000 pesos en centavos enteros', () => {
    expect(leer('vendí un reloj de 180 mil en efectivo').monto).toBe(18_000_000);
  });

  /**
   * El multiplicador se aplica corriendo el punto decimal sobre la cadena. Con
   * flotantes, 2.5 * 1e6 * 100 sigue siendo exacto, pero 1.15 * 1e6 * 100 no:
   * el escalado por cadena vale para todos.
   */
  it('lee «2.5 millones» sin pasar por punto flotante', () => {
    expect(leer('vendí un terreno en 2.5 millones').monto).toBe(250_000_000);
    expect(escalarDecimal('1.15', 6)).toBe('1150000');
    expect(leer('compré una casa en 1.15 millones').monto).toBe(115_000_000);
  });

  it('lee «$180,000.50» con símbolo, separador de miles y centavos', () => {
    expect(leer('cobré $180,000.50 por un avalúo').monto).toBe(18_000_050);
  });

  /** «un millón y medio» es una forma habitual de hablar, y no trae dígitos. */
  it('lee cantidades escritas con palabras', () => {
    expect(leer('presté un millón y medio a un cliente').monto).toBe(150_000_000);
    expect(leer('recibí medio millón de donativo').monto).toBe(50_000_000);
    expect(leer('renta de quinientos mil al mes').monto).toBe(50_000_000);
  });

  /**
   * «un» delante de un sustantivo no es un peso. Sin esta regla, «vendí un
   * reloj» devolvía un monto de $1.00 y la herramienta contestaba con
   * seguridad a una frase que no traía cifra.
   */
  it('no confunde el artículo «un» con la cantidad 1', () => {
    expect(leer('vendí un reloj a un cliente').monto).toBeNull();
  });

  /**
   * El año de la fecha se leía como monto: «el 20 de junio de 2026» daba
   * $2,026.00, y ese monto silencioso no alcanzaba ningún umbral.
   */
  it('no lee el año de la fecha como si fuera dinero', () => {
    const r = leer('vendí una camioneta el 20 de junio de 2026 en 690000');
    expect(r.fecha).toBe('2026-06-20');
    expect(r.fechaEnLaFrase).toBe(true);
    expect(r.monto).toBe(69_000_000);
  });

  /** Entre dos cifras gana la que parece dinero, no la primera que aparece. */
  it('prefiere la cifra con multiplicador sobre el conteo de piezas', () => {
    expect(leer('vendí 2 relojes de 180 mil').monto).toBe(18_000_000);
  });

  it('devuelve null y lo dice cuando la frase no trae monto', () => {
    const r = leer('vendí un reloj en efectivo');
    expect(r.monto).toBeNull();
    expect(r.confianza).toBe('baja');
    expect(r.noEntendido.join(' ')).toMatch(/monto/i);
  });
});

describe('interpretar — medio de pago', () => {
  it('distingue efectivo de transferencia', () => {
    expect(leer('vendí un reloj de 180 mil en efectivo').medioPago).toBe('efectivo');
    expect(leer('vendí un reloj de 180 mil por transferencia').medioPago).toBe('transferencia');
  });

  /**
   * Dos medios en la misma frase es una operación mixta. Quedarse con el
   * primero cambiaría la revisión del límite de efectivo del artículo 32.
   */
  it('marca mixto cuando la frase menciona dos formas de pago', () => {
    expect(leer('me pagaron 500 mil, parte en efectivo y parte por transferencia').medioPago).toBe(
      'mixto',
    );
  });

  it('deja el medio en null cuando no se menciona, en vez de suponer', () => {
    const r = leer('vendí un reloj de 180 mil');
    expect(r.medioPago).toBeNull();
    expect(r.confianza).toBe('media');
  });
});

describe('interpretar — actividad', () => {
  it('lleva reloj y joya a metales y joyería', () => {
    expect(leer('vendí un reloj de 180 mil en efectivo').actividad).toBe('metales-joyeria');
    expect(leer('vendí joyas por 300 mil').actividad).toBe('metales-joyeria');
  });

  it('lleva casa, departamento y terreno a inmobiliaria', () => {
    expect(leer('vendí una casa en 3 millones').actividad).toBe(
      'inmuebles-construccion-intermediacion',
    );
    expect(leer('vendí un departamento en 2 millones').actividad).toBe(
      'inmuebles-construccion-intermediacion',
    );
  });

  it('lleva coche, auto y camioneta a vehículos', () => {
    expect(leer('vendí una camioneta en 690 mil').actividad).toBe('vehiculos');
    expect(leer('vendí un automóvil usado en 400 mil').actividad).toBe('vehiculos');
  });

  it('lleva préstamo y mutuo a préstamos y créditos', () => {
    expect(leer('presté 800 mil con un contrato de mutuo').actividad).toBe('prestamos-creditos');
  });

  /**
   * «casa de empeño» contiene «casa». Sin preferir la clave más larga y
   * consumir el tramo, toda casa de empeño se clasificaba como venta de
   * inmuebles, que es otra fracción y otro umbral.
   */
  it('prefiere la palabra clave más larga que contiene a otra', () => {
    expect(leer('en la casa de empeño presté 200 mil').actividad).toBe('prestamos-creditos');
    expect(leer('en el casino pagué premios por 300 mil').actividad).toBe('juegos-sorteos');
  });

  /**
   * Sin actividad no hay regla que aplicar. Adivinar la primera del catálogo
   * daría una respuesta con apariencia de certeza sobre la fracción incorrecta.
   */
  it('no adivina la actividad: devuelve el catálogo para elegir', () => {
    const r = leer('recibí 180 mil en efectivo');
    expect(r.actividad).toBeNull();
    expect(r.candidatas.length).toBeGreaterThan(5);
    expect(r.confianza).toBe('baja');
    expect(r.noEntendido.join(' ')).toMatch(/actividad/i);
  });

  /**
   * Frase ambigua: dos actividades con el mismo número de indicios. Se
   * devuelven las dos para que el usuario elija, en lugar de quedarse con
   * cualquiera de ellas.
   */
  it('devuelve las candidatas empatadas en una frase ambigua', () => {
    const r = leer('vendí una casa y un coche por 4 millones');
    expect(r.actividad).toBeNull();
    expect(r.candidatas.map((c) => c.slug).sort()).toEqual([
      'inmuebles-construccion-intermediacion',
      'vehiculos',
    ]);
    expect(r.noEntendido.join(' ')).toMatch(/más de una actividad/i);
  });
});

describe('interpretar — trazabilidad', () => {
  /** El usuario tiene que poder auditar la lectura antes de creerle. */
  it('dice siempre en qué se basó', () => {
    const r = leer('vendí un reloj de 180 mil en efectivo');
    const texto = r.entendido.join(' | ');
    expect(texto).toMatch(/180,000\.00/);
    expect(texto).toMatch(/joyer/i);
    expect(texto).toMatch(/efectivo/);
    expect(texto).toContain(HOY);
    expect(r.confianza).toBe('alta');
  });

  /** Sin fecha en la frase se usa la de referencia, y se avisa que es supuesta. */
  it('usa la fecha de referencia cuando la frase no trae fecha', () => {
    const r = leer('vendí un reloj de 180 mil en efectivo');
    expect(r.fecha).toBe(HOY);
    expect(r.fechaEnLaFrase).toBe(false);
  });

  /**
   * Las frases que la herramienta ofrece con un clic tienen que entenderse
   * enteras. Un ejemplo que devuelve «no reconocí la actividad» es la peor
   * primera impresión posible.
   */
  it('entiende todas sus frases de ejemplo', () => {
    for (const frase of FRASES_EJEMPLO) {
      const r = leer(frase);
      expect({ frase, actividad: r.actividad, monto: r.monto }).toEqual({
        frase,
        actividad: expect.any(String),
        monto: expect.any(Number),
      });
    }
  });

  /** Determinista: la misma frase y la misma fecha dan siempre lo mismo. */
  it('es determinista', () => {
    const frase = 'vendí un reloj de 180 mil en efectivo el 03/02/2026';
    expect(leer(frase)).toEqual(leer(frase));
    expect(leer(frase).fecha).toBe('2026-02-03');
  });
});
