import { centavos, type Centavos, type MedioPago, type TipoCliente } from '@leyantilavado/types';
import { datos } from '@leyantilavado/rules-engine';
import { aCSV, aCentavos, desdeCSV, esFechaValida } from '@/lib/herramientas/util';
import { subtiposDe } from '@/lib/herramientas/actividades';

/**
 * Formato CSV de importación de operaciones.
 *
 * El parseo y la serialización genéricos ya viven en `lib/herramientas/util`
 * (`desdeCSV` / `aCSV`); aquí sólo está lo que es propio de la importación:
 * qué columnas se esperan y qué hace que una fila sea capturable.
 *
 * Ningún número legal vive en este archivo. Los umbrales los resuelve
 * `@leyantilavado/rules-engine` cuando la operación ya está guardada; esta
 * revisión sólo comprueba que la fila se pueda capturar sin adivinar nada.
 */
export { aCSV, desdeCSV };

export const MEDIOS_PAGO = [
  'efectivo',
  'transferencia',
  'cheque',
  'tarjeta',
  'metales_preciosos',
  'activos_virtuales',
  'mixto',
  'otro',
] as const satisfies readonly MedioPago[];

export const TIPOS_CLIENTE = [
  'persona_fisica',
  'persona_moral',
  'fideicomiso',
  'desconocido',
] as const satisfies readonly TipoCliente[];

export interface ColumnaCSV {
  clave: string;
  titulo: string;
  requerido: boolean;
  ayuda: string;
  ejemplo: string;
}

export const COLUMNAS_OPERACION: readonly ColumnaCSV[] = [
  {
    clave: 'fecha',
    titulo: 'fecha',
    requerido: true,
    ayuda: 'Fecha del acto u operación, en formato AAAA-MM-DD. Determina qué UMA y qué regla aplican.',
    ejemplo: '',
  },
  {
    clave: 'actividad',
    titulo: 'actividad',
    requerido: true,
    ayuda: 'Identificador de la actividad vulnerable. Usa exactamente uno de los valores de la lista de abajo.',
    ejemplo: 'vehiculos',
  },
  {
    clave: 'subtipo',
    titulo: 'subtipo',
    requerido: false,
    ayuda: 'Obligatorio sólo en las actividades que tienen incisos con regla propia (notarios, corredores, servicios profesionales, comercio exterior, activos virtuales).',
    ejemplo: '',
  },
  {
    clave: 'monto',
    titulo: 'monto',
    requerido: true,
    ayuda: 'Valor total del acto en pesos, con punto decimal y sin símbolo ni comas. Se guarda en centavos enteros.',
    ejemplo: '250000.00',
  },
  {
    clave: 'monto_efectivo',
    titulo: 'monto_efectivo',
    requerido: false,
    ayuda: 'Porción liquidada en efectivo o metales. Déjalo vacío si no hubo efectivo.',
    ejemplo: '0.00',
  },
  {
    clave: 'comision',
    titulo: 'comision',
    requerido: false,
    ayuda: 'Contraprestación o comisión cobrada. Relevante en activos virtuales.',
    ejemplo: '',
  },
  {
    clave: 'medio_pago',
    titulo: 'medio_pago',
    requerido: false,
    ayuda: `Uno de: ${MEDIOS_PAGO.join(', ')}. Si lo dejas vacío se captura como "otro".`,
    ejemplo: 'transferencia',
  },
  {
    clave: 'tipo_cliente',
    titulo: 'tipo_cliente',
    requerido: false,
    ayuda: `Uno de: ${TIPOS_CLIENTE.join(', ')}.`,
    ejemplo: 'persona_fisica',
  },
  {
    clave: 'referencia_cliente',
    titulo: 'referencia_cliente',
    requerido: false,
    ayuda: 'Tu identificador interno del cliente. Sirve para acumular operaciones del mismo cliente en la ventana móvil.',
    ejemplo: 'CLI-0001',
  },
  {
    clave: 'referencia_externa',
    titulo: 'referencia_externa',
    requerido: false,
    ayuda: 'Folio, contrato o factura con el que identificas la operación en tu sistema.',
    ejemplo: 'FAC-2026-0001',
  },
  {
    clave: 'descripcion',
    titulo: 'descripcion',
    requerido: false,
    ayuda: 'Descripción breve del acto. Se guarda tal cual.',
    ejemplo: '',
  },
];

const CLAVES = COLUMNAS_OPERACION.map((c) => c.clave);

/** Plantilla con una fila de ejemplo. La fecha entra como parámetro: sin reloj. */
export function plantillaOperacionesCSV(fechaEjemplo: string): string {
  return aCSV(
    CLAVES,
    [COLUMNAS_OPERACION.map((c) => (c.clave === 'fecha' ? fechaEjemplo : c.ejemplo))],
  );
}

const normalizar = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');

export interface ErrorCelda {
  columna: string;
  mensaje: string;
}

export interface FilaOperacionCSV {
  /** Línea dentro del archivo, contando el encabezado como 1. */
  linea: number;
  valores: Record<string, string>;
  errores: readonly ErrorCelda[];
  /** Monto en centavos enteros. `null` cuando no se pudo leer. */
  montoCentavos: Centavos | null;
}

export interface RevisionCSV {
  filas: readonly FilaOperacionCSV[];
  /** Encabezados requeridos que el archivo no trae. */
  columnasFaltantes: readonly string[];
  /** Encabezados que no reconocemos: se ignorarían al capturar. */
  columnasDesconocidas: readonly string[];
  validas: number;
  conError: number;
  /** Suma de las filas sin error, en centavos enteros. */
  totalCentavos: Centavos;
}

const REVISION_VACIA: RevisionCSV = {
  filas: [],
  columnasFaltantes: [],
  columnasDesconocidas: [],
  validas: 0,
  conError: 0,
  totalCentavos: centavos(0),
};

/**
 * Revisa un CSV de operaciones sin escribir nada.
 *
 * Devuelve los errores fila por fila en lugar de rechazar el archivo completo:
 * quien importa 300 operaciones necesita saber cuáles cuatro están mal, no que
 * "el archivo es inválido".
 */
export function revisarCSVOperaciones(texto: string): RevisionCSV {
  const filas = desdeCSV(texto);
  const encabezados = filas[0];
  if (!encabezados || filas.length < 2) return REVISION_VACIA;

  const claves = encabezados.map(normalizar);
  const columnasFaltantes = COLUMNAS_OPERACION.filter(
    (c) => c.requerido && !claves.includes(c.clave),
  ).map((c) => c.clave);
  const columnasDesconocidas = claves.filter((c) => c !== '' && !CLAVES.includes(c));

  const revisadas: FilaOperacionCSV[] = filas.slice(1).map((fila, i) => {
    const valores: Record<string, string> = {};
    claves.forEach((clave, columna) => {
      if (clave) valores[clave] = (fila[columna] ?? '').trim();
    });
    return { linea: i + 2, valores, ...validarFila(valores) };
  });

  let total = 0;
  let validas = 0;
  for (const f of revisadas) {
    if (f.errores.length > 0) continue;
    validas += 1;
    total += f.montoCentavos ?? 0;
  }

  return {
    filas: revisadas,
    columnasFaltantes,
    columnasDesconocidas,
    validas,
    conError: revisadas.length - validas,
    totalCentavos: centavos(total),
  };
}

function validarFila(v: Record<string, string>): {
  errores: ErrorCelda[];
  montoCentavos: Centavos | null;
} {
  const errores: ErrorCelda[] = [];
  const error = (columna: string, mensaje: string) => errores.push({ columna, mensaje });

  const fecha = v['fecha'] ?? '';
  if (fecha === '') error('fecha', 'Falta la fecha de la operación.');
  else if (!esFechaValida(fecha)) error('fecha', 'La fecha debe ir en formato AAAA-MM-DD.');

  const actividad = v['actividad'] ?? '';
  const meta = datos.ACTIVIDADES.find((a) => a.slug === actividad);
  if (actividad === '') error('actividad', 'Falta la actividad vulnerable.');
  else if (!meta) error('actividad', `No reconocemos la actividad "${actividad}".`);

  // Los subtipos se resuelven en la fecha de la operación: una actividad puede
  // ganar o perder incisos con una reforma.
  if (meta && esFechaValida(fecha)) {
    const subtipos = subtiposDe(actividad, fecha);
    const subtipo = v['subtipo'] ?? '';
    if (subtipos.length > 0 && subtipo === '') {
      error(
        'subtipo',
        `Esta actividad tiene incisos con regla propia: indica uno de ${subtipos.map((s) => s.slug).join(', ')}.`,
      );
    } else if (subtipo !== '' && !subtipos.some((s) => s.slug === subtipo)) {
      error('subtipo', `El subtipo "${subtipo}" no existe para esta actividad en esa fecha.`);
    }
  }

  const monto = aCentavos(v['monto'] ?? '');
  if ((v['monto'] ?? '') === '') error('monto', 'Falta el monto de la operación.');
  else if (monto === null) error('monto', 'El monto debe ser un número en pesos, sin comas ni símbolo.');
  else if (monto < 0) error('monto', 'El monto no puede ser negativo.');

  const efectivoCrudo = v['monto_efectivo'] ?? '';
  const efectivo = aCentavos(efectivoCrudo);
  if (efectivoCrudo !== '' && efectivo === null) {
    error('monto_efectivo', 'El monto en efectivo debe ser un número en pesos.');
  } else if (efectivo !== null && monto !== null && efectivo > monto) {
    error('monto_efectivo', 'La porción en efectivo no puede ser mayor que el monto total.');
  }

  const comisionCruda = v['comision'] ?? '';
  if (comisionCruda !== '' && aCentavos(comisionCruda) === null) {
    error('comision', 'La comisión debe ser un número en pesos.');
  }

  const medio = v['medio_pago'] ?? '';
  if (medio !== '' && !(MEDIOS_PAGO as readonly string[]).includes(medio)) {
    error('medio_pago', `Valor no permitido. Usa uno de: ${MEDIOS_PAGO.join(', ')}.`);
  }

  const tipo = v['tipo_cliente'] ?? '';
  if (tipo !== '' && !(TIPOS_CLIENTE as readonly string[]).includes(tipo)) {
    error('tipo_cliente', `Valor no permitido. Usa uno de: ${TIPOS_CLIENTE.join(', ')}.`);
  }

  return { errores, montoCentavos: monto };
}
