import { describe, expect, it } from 'vitest';
import { pesosACentavos, type Operacion } from '@leyantilavado/types';
import { evaluarOperacion, buscarRegla, ReglaNoEncontradaError } from './motor';
import { convertirUMA, umaVigenteEn, UMANoDisponibleError } from './uma';
import { evaluarEfectivo } from './efectivo';
import { estimarSancion } from './sanciones';
import { calcularFechaLimiteAviso } from './avisos';
import { UMBRALES } from './datos/umbrales';
import { ACTIVIDAD_SLUGS } from '@leyantilavado/types';

const $ = pesosACentavos;
const op = (o: Partial<Operacion> & Pick<Operacion, 'actividad' | 'monto'>): Operacion => ({
  id: 'op-1',
  fecha: '2026-06-15',
  medioPago: 'transferencia',
  ...o,
});

/* ══════════════════════════════════════════════════════════════════════════
 * UMA — el error más común del mercado vive aquí
 * ════════════════════════════════════════════════════════════════════════ */

describe('UMA por fecha', () => {
  it('usa la UMA de 2026 a partir del 1 de febrero de 2026', () => {
    expect(umaVigenteEn('2026-02-01').anio).toBe(2026);
    expect(umaVigenteEn('2026-02-01').diariaCentavos).toBe(11731);
  });

  it('usa la UMA de 2025 para una operación de enero de 2026', () => {
    // El caso que rompe las tablas "2026" publicadas por la competencia.
    const enero = umaVigenteEn('2026-01-15');
    expect(enero.anio).toBe(2025);
    expect(enero.diariaCentavos).toBe(11314);
  });

  it('cambia exactamente el 31 de enero → 1 de febrero', () => {
    expect(umaVigenteEn('2026-01-31').anio).toBe(2025);
    expect(umaVigenteEn('2026-02-01').anio).toBe(2026);
  });

  it('no extrapola: lanza cuando no hay dato registrado', () => {
    expect(() => umaVigenteEn('2015-06-01')).toThrow(UMANoDisponibleError);
    expect(() => umaVigenteEn('2030-06-01')).toThrow(UMANoDisponibleError);
  });

  it('convierte sin error de punto flotante en los múltiplos publicados', () => {
    const casos: [number, string][] = [
      [4, '469.24'],
      [210, '24635.10'],
      [325, '38125.75'],
      [485, '56895.35'],
      [645, '75664.95'],
      [805, '94434.55'],
      [1285, '150743.35'],
      [1605, '188282.55'],
      [2410, '282717.10'],
      [3210, '376565.10'],
      [4000, '469240.00'],
      [4815, '564847.65'],
      [6420, '753130.20'],
      [8000, '938480.00'],
      [8025, '941412.75'],
    ];
    for (const [uma, esperado] of casos) {
      expect(convertirUMA(uma, '2026-06-15').equivalentePesos).toBe($(esperado));
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 * Bordes del umbral — justo debajo, exacto, por encima
 * ════════════════════════════════════════════════════════════════════════ */

describe('Juegos y sorteos (fr. I): 325 / 645 UMA', () => {
  const ident = $('38125.75'); // 325 UMA
  const aviso = $('75664.95'); // 645 UMA

  it('un centavo por debajo del umbral de identificación no obliga', () => {
    const r = evaluarOperacion(op({ actividad: 'juegos-sorteos', monto: (ident - 1) as never }));
    expect(r.identificacion.alcanzado).toBe(false);
    expect(r.conclusion).toBe('sin_obligacion_aparente');
  });

  it('el monto EXACTO del umbral sí obliga a identificar', () => {
    const r = evaluarOperacion(op({ actividad: 'juegos-sorteos', monto: ident }));
    expect(r.identificacion.alcanzado).toBe(true);
    expect(r.aviso.alcanzado).toBe(false);
  });

  it('el monto exacto del umbral de aviso dispara el aviso', () => {
    const r = evaluarOperacion(op({ actividad: 'juegos-sorteos', monto: aviso }));
    expect(r.aviso.alcanzado).toBe(true);
    expect(r.conclusion).toBe('aviso_probable');
  });

  it('un centavo por debajo del aviso no lo dispara', () => {
    const r = evaluarOperacion(op({ actividad: 'juegos-sorteos', monto: (aviso - 1) as never }));
    expect(r.aviso.alcanzado).toBe(false);
  });

  it('por encima del aviso lo dispara', () => {
    const r = evaluarOperacion(op({ actividad: 'juegos-sorteos', monto: $('100000') }));
    expect(r.aviso.alcanzado).toBe(true);
    expect(r.obligacionesInmediatas).toContain('avisos');
  });
});

describe('Comparador estricto vs. inclusivo (arrendamiento, fr. XV)', () => {
  // La ley dice "superior a" 1,605 para identificar y "igual o superior a"
  // 3,210 para avisar. Colapsar ambos a >= produce un falso positivo.
  it('una renta de EXACTAMENTE 1,605 UMA NO obliga a identificar', () => {
    const r = evaluarOperacion(
      op({ actividad: 'arrendamiento-inmuebles', monto: $('188282.55') }),
    );
    expect(r.identificacion.alcanzado).toBe(false);
  });

  it('un centavo más que 1,605 UMA sí obliga a identificar', () => {
    const r = evaluarOperacion(
      op({ actividad: 'arrendamiento-inmuebles', monto: $('188282.56') }),
    );
    expect(r.identificacion.alcanzado).toBe(true);
  });

  it('una renta de EXACTAMENTE 3,210 UMA SÍ obliga a avisar', () => {
    const r = evaluarOperacion(
      op({ actividad: 'arrendamiento-inmuebles', monto: $('376565.10') }),
    );
    expect(r.aviso.alcanzado).toBe(true);
  });

  it('es periodicidad mensual, no por operación', () => {
    const r = evaluarOperacion(op({ actividad: 'arrendamiento-inmuebles', monto: $('400000') }));
    expect(r.periodicidad).toBe('mensual');
    expect(r.supuestos.some((s) => s.includes('mensual'))).toBe(true);
  });
});

describe('Tarjetas de crédito (fr. II-a): periodicidad mensual', () => {
  it('mide sobre el gasto mensual acumulado', () => {
    const r = evaluarOperacion(op({ actividad: 'tarjetas-credito-servicios', monto: $('150743.35') }));
    expect(r.periodicidad).toBe('mensual');
    expect(r.aviso.alcanzado).toBe(true); // 1,285 UMA exactas
  });
});

describe('Identificación obligatoria sin monto', () => {
  it('cheques de viajero: identifica siempre, avisa a partir de 645 UMA', () => {
    const r = evaluarOperacion(op({ actividad: 'cheques-viajero', monto: $('100') }));
    expect(r.identificacion.alcanzado).toBe(true);
    expect(r.identificacion.conversion).toBeNull();
    expect(r.aviso.alcanzado).toBe(false);
    expect(r.conclusion).toBe('requiere_identificacion');
  });

  it('préstamos: identifica siempre aunque el monto sea mínimo', () => {
    const r = evaluarOperacion(op({ actividad: 'prestamos-creditos', monto: $('500') }));
    expect(r.identificacion.alcanzado).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 * Casos que NO son un número
 * ════════════════════════════════════════════════════════════════════════ */

describe('Servicios profesionales (fr. XI): el aviso depende del rol', () => {
  const base = { actividad: 'servicios-profesionales' as const, subtipo: 'compraventa-inmuebles', monto: $('5000000') };

  it('actuando en representación del cliente, procede el aviso sin umbral', () => {
    const r = evaluarOperacion(op({ ...base, enRepresentacionDelCliente: true }));
    expect(r.aviso.alcanzado).toBe(true);
    expect(r.conclusion).toBe('aviso_probable');
  });

  it('sólo asesorando, no procede el aviso pero sí la identificación', () => {
    const r = evaluarOperacion(op({ ...base, enRepresentacionDelCliente: false }));
    expect(r.aviso.alcanzado).toBe(false);
    expect(r.identificacion.alcanzado).toBe(true);
    expect(r.conclusion).toBe('requiere_identificacion');
  });

  it('sin saber el rol, devuelve información insuficiente en vez de adivinar', () => {
    const r = evaluarOperacion(op(base));
    expect(r.informacionFaltante.length).toBeGreaterThan(0);
    expect(r.informacionFaltante[0]).toContain('representación');
    expect(r.confianza).not.toBe('alta');
  });
});

describe('Fe pública: reglas distintas por inciso, no un umbral único', () => {
  it('notarios / inmuebles usa 8,000 UMA', () => {
    const r = evaluarOperacion(
      op({ actividad: 'fe-publica-notarios', subtipo: 'inmuebles', monto: $('938480.00') }),
    );
    expect(r.aviso.alcanzado).toBe(true);
    expect(r.aviso.conversion?.uma).toBe(8000);
  });

  it('notarios / fideicomisos usa 4,000 UMA, no 8,000', () => {
    const r = evaluarOperacion(
      op({ actividad: 'fe-publica-notarios', subtipo: 'fideicomisos', monto: $('500000') }),
    );
    expect(r.aviso.conversion?.uma).toBe(4000);
    expect(r.aviso.alcanzado).toBe(true);
  });

  it('notarios / constitución de personas morales avisa SIEMPRE, sin umbral', () => {
    const r = evaluarOperacion(
      op({ actividad: 'fe-publica-notarios', subtipo: 'constitucion-personas-morales', monto: $('1') }),
    );
    expect(r.aviso.alcanzado).toBe(true);
    expect(r.aviso.conversion).toBeNull();
  });

  it('corredores / avalúos usa 8,025 UMA', () => {
    const r = evaluarOperacion(
      op({ actividad: 'fe-publica-corredores', subtipo: 'avaluos', monto: $('941412.75') }),
    );
    expect(r.aviso.conversion?.uma).toBe(8025);
    expect(r.aviso.alcanzado).toBe(true);
  });

  // Apartado C: la ley enuncia al sujeto obligado y no fija monto.
  it('los apartados sin umbral publicado piden revisión profesional, no inventan cifra', () => {
    const r = evaluarOperacion(
      op({ actividad: 'fe-publica-servidores-publicos', monto: $('1000000') }),
    );
    expect(r.conclusion).toBe('requiere_revision_profesional');
    expect(r.confianza).toBe('baja');
    expect(r.aviso.conversion).toBeNull();
  });

  // El Apartado D remite al A: los umbrales tienen que salir idénticos. Si
  // alguien toca uno solo de los dos, esta prueba lo caza.
  it('el Apartado D hereda los umbrales del Apartado A', () => {
    for (const subtipo of [
      'inmuebles',
      'poderes-irrevocables',
      'constitucion-personas-morales',
      'fideicomisos',
      'mutuo-credito',
    ]) {
      const d = buscarRegla('personas-facilitadoras', subtipo, '2026-06-15');
      const a = buscarRegla('fe-publica-notarios', subtipo, '2026-06-15');
      expect(d, `falta Apartado D ${subtipo}`).toBeTruthy();
      expect(a, `falta Apartado A ${subtipo}`).toBeTruthy();
      // Sólo lo operativo: la nota del Apartado D habla de la remisión y es
      // distinta a propósito.
      const forma = (u: NonNullable<typeof d>['aviso']) =>
        u.tipo === 'uma' ? { tipo: u.tipo, uma: u.uma, comparador: u.comparador } : { tipo: u.tipo };
      expect(forma(d!.aviso)).toEqual(forma(a!.aviso));
    }
  });
});

describe('Activos virtuales (fr. XVI): monto O contraprestación', () => {
  it('dispara por monto de la operación (210 UMA)', () => {
    const r = evaluarOperacion(
      op({ actividad: 'activos-virtuales', monto: $('24635.10'), comision: $('0') }),
    );
    expect(r.aviso.alcanzado).toBe(true);
  });

  it('dispara por contraprestación (4 UMA) aunque el monto sea bajo', () => {
    const r = evaluarOperacion(
      op({ actividad: 'activos-virtuales', monto: $('1000'), comision: $('469.24') }),
    );
    expect(r.aviso.alcanzado).toBe(true);
    expect(r.aviso.explicacion).toContain('contraprestación');
  });

  it('no dispara cuando ninguno de los dos alcanza', () => {
    const r = evaluarOperacion(
      op({ actividad: 'activos-virtuales', monto: $('1000'), comision: $('100') }),
    );
    expect(r.aviso.alcanzado).toBe(false);
  });

  it('sin la comisión, lo pide en lugar de asumir cero en silencio', () => {
    const r = evaluarOperacion(op({ actividad: 'activos-virtuales', monto: $('1000') }));
    expect(r.informacionFaltante.some((x) => x.includes('contraprestación'))).toBe(true);
  });
});

describe('Traslado de valores (fr. X): monto indeterminable', () => {
  it('con monto determinable usa el umbral de 3,210 UMA', () => {
    const r = evaluarOperacion(
      op({ actividad: 'traslado-custodia-valores', monto: $('100000'), montoIndeterminable: false }),
    );
    expect(r.aviso.alcanzado).toBe(false);
  });

  it('si no se puede determinar el monto, procede el aviso siempre', () => {
    const r = evaluarOperacion(
      op({ actividad: 'traslado-custodia-valores', monto: $('100'), montoIndeterminable: true }),
    );
    expect(r.aviso.alcanzado).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 * Acumulación de seis meses
 * ════════════════════════════════════════════════════════════════════════ */

describe('Acumulación antifraccionamiento (art. 17, último párrafo)', () => {
  const cliente = 'cli-1';
  const mk = (id: string, fecha: string, pesos: string): Operacion =>
    op({ id, fecha, actividad: 'juegos-sorteos', monto: $(pesos), clienteId: cliente });

  it('suma operaciones dentro de la ventana y dispara el aviso', () => {
    const actual = mk('op-4', '2026-06-15', '20000');
    const r = evaluarOperacion(actual, {
      fechaReferencia: '2026-06-15',
      historial: [
        mk('op-1', '2026-03-01', '20000'),
        mk('op-2', '2026-04-10', '20000'),
        mk('op-3', '2026-05-20', '20000'),
      ],
    });
    // 80,000 > 75,664.95 (645 UMA) aunque ninguna operación individual llega.
    expect(r.aviso.alcanzado).toBe(false);
    expect(r.acumulacion?.alcanzado).toBe(true);
    expect(r.conclusion).toBe('aviso_probable');
    expect(r.advertencias.some((a) => a.clave === 'aviso-por-acumulacion')).toBe(true);
  });

  it('excluye las operaciones fuera de la ventana de seis meses', () => {
    const actual = mk('op-3', '2026-06-15', '20000');
    const r = evaluarOperacion(actual, {
      fechaReferencia: '2026-06-15',
      historial: [
        mk('op-1', '2025-11-01', '60000'), // > 6 meses atrás: fuera
        mk('op-2', '2026-05-01', '20000'),
      ],
    });
    expect(r.acumulacion?.fueraDeVentana).toBe(1);
    expect(r.acumulacion?.total).toBe($('40000'));
    expect(r.acumulacion?.alcanzado).toBe(false);
  });

  it('el borde de la ventana es inclusivo', () => {
    const actual = mk('op-2', '2026-06-15', '10000');
    const r = evaluarOperacion(actual, {
      fechaReferencia: '2026-06-15',
      historial: [mk('op-1', '2025-12-15', '10000')], // exactamente 6 meses
    });
    expect(r.acumulacion?.fueraDeVentana).toBe(0);
    expect(r.acumulacion?.total).toBe($('20000'));
  });

  it('no acumula operaciones de clientes distintos', () => {
    const actual = mk('op-2', '2026-06-15', '40000');
    const r = evaluarOperacion(actual, {
      fechaReferencia: '2026-06-15',
      historial: [op({ id: 'op-1', fecha: '2026-05-01', actividad: 'juegos-sorteos', monto: $('40000'), clienteId: 'otro' })],
    });
    expect(r.acumulacion?.total).toBe($('40000'));
  });

  it('no acumula actividades distintas del mismo cliente', () => {
    const actual = mk('op-2', '2026-06-15', '40000');
    const r = evaluarOperacion(actual, {
      fechaReferencia: '2026-06-15',
      historial: [op({ id: 'op-1', fecha: '2026-05-01', actividad: 'vehiculos', monto: $('40000'), clienteId: cliente })],
    });
    expect(r.acumulacion?.total).toBe($('40000'));
  });

  it('identifica en qué operación exactamente se disparó el aviso', () => {
    const actual = mk('op-3', '2026-06-15', '40000');
    const r = evaluarOperacion(actual, {
      fechaReferencia: '2026-06-15',
      historial: [mk('op-1', '2026-02-01', '20000'), mk('op-2', '2026-04-01', '20000')],
    });
    expect(r.acumulacion?.fechaDisparo).toBe('2026-06-15');
    expect(r.acumulacion?.operaciones.filter((o) => o.disparaAviso)).toHaveLength(1);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 * Efectivo (art. 32)
 * ════════════════════════════════════════════════════════════════════════ */

describe('Límites de efectivo (art. 32)', () => {
  it('inmuebles: 8,025 UMA', () => {
    const r = evaluarEfectivo({
      actividad: 'inmuebles-construccion-intermediacion',
      fecha: '2026-06-15',
      montoEfectivo: $('1000000'),
      valorTotal: $('5000000'),
    });
    expect(r.aplica).toBe(true);
    expect(r.limite?.uma).toBe(8025);
    expect(r.excede).toBe(true);
  });

  it('el monto EXACTO del límite no lo excede', () => {
    const r = evaluarEfectivo({
      actividad: 'vehiculos',
      fecha: '2026-06-15',
      montoEfectivo: $('376565.10'), // 3,210 UMA exactas
      valorTotal: $('500000'),
    });
    expect(r.excede).toBe(false);
  });

  it('un centavo más sí lo excede', () => {
    const r = evaluarEfectivo({
      actividad: 'vehiculos',
      fecha: '2026-06-15',
      montoEfectivo: $('376565.11'),
      valorTotal: $('500000'),
    });
    expect(r.excede).toBe(true);
  });

  it('siempre advierte que fraccionar no evita la regla', () => {
    const r = evaluarEfectivo({
      actividad: 'vehiculos',
      fecha: '2026-06-15',
      montoEfectivo: $('1000'),
      valorTotal: $('500000'),
    });
    expect(r.advertencias.some((a) => a.clave === 'fraccionamiento')).toBe(true);
  });

  it('cuando la actividad no tiene restricción, lo dice sin inventar un límite', () => {
    const r = evaluarEfectivo({
      actividad: 'donativos',
      fecha: '2026-06-15',
      montoEfectivo: $('9999999'),
      valorTotal: $('9999999'),
    });
    expect(r.aplica).toBe(false);
    expect(r.limite).toBeNull();
    expect(r.excede).toBe(false);
  });

  it('la operación completa marca el riesgo cuando se rebasa el efectivo', () => {
    const r = evaluarOperacion(
      op({ actividad: 'vehiculos', monto: $('900000'), montoEfectivo: $('500000'), medioPago: 'mixto' }),
    );
    expect(r.efectivo?.excede).toBe(true);
    expect(r.advertencias.some((a) => a.clave === 'efectivo-excedido')).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 * Sanciones
 * ════════════════════════════════════════════════════════════════════════ */

describe('Estimador de sanciones', () => {
  it('convierte el rango fijo con la UMA de la fecha', () => {
    const r = estimarSancion({ infracciones: ['art54-I--53-II'], fecha: '2026-06-15' });
    expect(r.escenarios[0]?.rangoFijo.min.equivalentePesos).toBe($('23462.00'));
    expect(r.escenarios[0]?.rangoFijo.max.equivalentePesos).toBe($('234620.00'));
  });

  it('aplica la cantidad MAYOR entre el rango fijo y el porcentaje del valor', () => {
    // 100% de $50,000,000 = $50M supera el máximo de 65,000 UMA ($7,625,150).
    const r = estimarSancion({
      infracciones: ['art54-III--53-VI'],
      fecha: '2026-06-15',
      valorOperacion: $('50000000'),
    });
    const e = r.escenarios[0]!;
    expect(e.rangoPorcentual?.max).toBe($('50000000'));
    expect(e.rangoAplicable.max).toBe($('50000000'));
  });

  it('cuando el porcentaje es menor, gana el rango en UMA', () => {
    const r = estimarSancion({
      infracciones: ['art54-III--53-VI'],
      fecha: '2026-06-15',
      valorOperacion: $('100000'),
    });
    const e = r.escenarios[0]!;
    expect(e.rangoAplicable.max).toBe($('7625150.00')); // 65,000 UMA
  });

  it('sin valor de operación advierte que el rango puede quedarse corto', () => {
    const r = estimarSancion({ infracciones: ['art54-III--53-VI'], fecha: '2026-06-15' });
    expect(r.advertencias.some((a) => a.clave === 'sin-valor-operacion')).toBe(true);
  });

  it('nunca omite la advertencia de que no es una sentencia', () => {
    const r = estimarSancion({ infracciones: ['art54-I--53-I'], fecha: '2026-06-15' });
    expect(r.advertencias.some((a) => a.clave === 'no-es-sentencia')).toBe(true);
  });

  it('presenta la autocorrección como escenario sujeto a requisitos', () => {
    const r = estimarSancion({ infracciones: ['art54-I--53-I'], fecha: '2026-06-15' });
    expect(r.autocorreccion).toHaveLength(2);
    for (const esc of r.autocorreccion) {
      expect(esc.advertencia.length).toBeGreaterThan(0);
      expect(esc.requisitos.length).toBeGreaterThan(0);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 * Fecha límite del aviso
 * ════════════════════════════════════════════════════════════════════════ */

describe('Fecha límite del aviso (día 17 del mes siguiente)', () => {
  it('una operación de junio vence el 17 de julio', () => {
    const r = calcularFechaLimiteAviso('2026-06-15', '2026-06-20');
    expect(r.fechaLimite).toBe('2026-07-17');
  });

  it('diciembre pasa a enero del año siguiente', () => {
    const r = calcularFechaLimiteAviso('2026-12-31', '2026-12-31');
    expect(r.fechaLimite).toBe('2027-01-17');
  });

  it('marca el plazo como vencido y sugiere autocorrección', () => {
    const r = calcularFechaLimiteAviso('2026-01-15', '2026-06-01');
    expect(r.estado).toBe('vencido');
    expect(r.diasRestantes).toBeLessThan(0);
    expect(r.advertencias.some((a) => a.clave === 'plazo-vencido')).toBe(true);
  });

  it('advierte cuando el día 17 cae en fin de semana pero NO mueve la fecha', () => {
    // 17 de enero de 2027 es domingo.
    const r = calcularFechaLimiteAviso('2026-12-05', '2026-12-05');
    expect(r.fechaLimite).toBe('2027-01-17');
    expect(r.advertencias.some((a) => a.clave === 'limite-en-fin-de-semana')).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 * Integridad de los datos semilla
 * ════════════════════════════════════════════════════════════════════════ */

describe('Integridad del corpus de reglas', () => {
  it('toda actividad declarada tiene al menos una regla de umbral', () => {
    for (const slug of ACTIVIDAD_SLUGS) {
      const reglas = UMBRALES.filter((u) => u.actividad === slug);
      expect(reglas.length, `falta regla para ${slug}`).toBeGreaterThan(0);
    }
  });

  it('toda regla tiene procedencia con fuente y disposición', () => {
    for (const r of UMBRALES) {
      expect(r.procedencia.fuentes.length, r.id).toBeGreaterThan(0);
      expect(r.procedencia.disposicion, r.id).toBeTruthy();
      expect(r.procedencia.ultimaRevision, r.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('ninguna regla publicada depende de un dato no verificado', () => {
    for (const r of UMBRALES.filter((x) => x.estado === 'publicado')) {
      expect(r.procedencia.verificacion, r.id).not.toBe('no_verificado');
    }
  });

  it('los ids de regla son únicos', () => {
    const ids = UMBRALES.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lanza cuando se pide una actividad sin regla vigente en esa fecha', () => {
    expect(() =>
      evaluarOperacion(op({ actividad: 'juegos-sorteos', monto: $('1000'), fecha: '2024-01-01' })),
    ).toThrow(ReglaNoEncontradaError);
  });

  it('las actividades con subtipos exigen subtipo para resolver una regla única', () => {
    expect(buscarRegla('fe-publica-notarios', undefined, '2026-06-15')).toBeUndefined();
    expect(buscarRegla('fe-publica-notarios', 'inmuebles', '2026-06-15')).toBeDefined();
  });
});

/* ══════════════════════════════════════════════════════════════════════════
 * Contrato de honestidad del resultado
 * ════════════════════════════════════════════════════════════════════════ */

describe('El motor nunca afirma cumplimiento', () => {
  it('siempre devuelve supuestos y procedencia', () => {
    const r = evaluarOperacion(op({ actividad: 'juegos-sorteos', monto: $('1000') }));
    expect(r.supuestos.length).toBeGreaterThan(0);
    expect(r.procedencia.fuentes.length).toBeGreaterThan(0);
    expect(r.versionLegal).toBeTruthy();
  });

  it('la conclusión más benigna es "sin obligación aparente", nunca "cumples"', () => {
    const r = evaluarOperacion(op({ actividad: 'juegos-sorteos', monto: $('100') }));
    expect(r.conclusion).toBe('sin_obligacion_aparente');
  });

  it('siempre advierte que se usó la UMA de la fecha de la operación', () => {
    const r = evaluarOperacion(op({ actividad: 'juegos-sorteos', monto: $('1000') }));
    expect(r.supuestos.some((s) => s.includes('UMA vigente en la fecha'))).toBe(true);
  });
});
