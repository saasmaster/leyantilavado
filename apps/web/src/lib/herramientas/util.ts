import { formatearMXN, pesosACentavos, type Centavos } from '@leyantilavado/types';

/**
 * Formatea un entero de centavos que la propia UI calculó (una diferencia, una
 * suma). Evita repartir castings de la marca `Centavos` por los componentes.
 */
export const mxn = (centavos: number): string => formatearMXN(Math.round(centavos) as Centavos);

/* ────────────────────────────────────────────────────────────────────────────
 * Dinero
 * `pesosACentavos` lanza con entradas inválidas — correcto para el motor, pero
 * un formulario no puede reventar mientras el usuario escribe. Aquí se
 * envuelve para devolver `null` en lugar de lanzar.
 * ────────────────────────────────────────────────────────────────────────── */

export function aCentavos(valor: string | number | undefined | null): Centavos | null {
  if (valor === undefined || valor === null || valor === '') return null;
  try {
    return pesosACentavos(valor);
  } catch {
    return null;
  }
}

/** Igual que `aCentavos` pero con 0 como respaldo, para campos opcionales. */
export function aCentavosOCero(valor: string | number | undefined | null): Centavos {
  return aCentavos(valor) ?? (0 as Centavos);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Fechas
 * ────────────────────────────────────────────────────────────────────────── */

export const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export const esFechaValida = (s: string): boolean =>
  RE_FECHA.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());

/* ────────────────────────────────────────────────────────────────────────────
 * CSV
 * Implementación mínima con comillas dobles. No se agrega una dependencia:
 * el formato que exportamos y el que importamos es el mismo.
 * ────────────────────────────────────────────────────────────────────────── */

export function aCSV(encabezados: string[], filas: (string | number)[][]): string {
  const escapar = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [encabezados, ...filas].map((f) => f.map(escapar).join(',')).join('\r\n');
}

/**
 * Parsea CSV respetando comillas dobles y saltos de línea dentro de campo.
 * Detecta `,` o `;` como separador a partir de la primera línea.
 */
export function desdeCSV(texto: string): string[][] {
  const limpio = texto.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const primeraLinea = limpio.split('\n')[0] ?? '';
  const sep =
    (primeraLinea.match(/;/g)?.length ?? 0) > (primeraLinea.match(/,/g)?.length ?? 0) ? ';' : ',';

  const filas: string[][] = [];
  let campo = '';
  let fila: string[] = [];
  let enComillas = false;

  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i]!;
    if (enComillas) {
      if (c === '"') {
        if (limpio[i + 1] === '"') {
          campo += '"';
          i++;
        } else enComillas = false;
      } else campo += c;
      continue;
    }
    if (c === '"') enComillas = true;
    else if (c === sep) {
      fila.push(campo);
      campo = '';
    } else if (c === '\n') {
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
    } else campo += c;
  }
  if (campo !== '' || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((v) => v.trim() !== ''));
}

/* ────────────────────────────────────────────────────────────────────────────
 * Descargas (siempre en el navegador, nunca en un servidor)
 * ────────────────────────────────────────────────────────────────────────── */

export function descargar(nombre: string, contenido: string, tipo: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([contenido], { type: `${tipo};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const descargarCSV = (nombre: string, csv: string) =>
  // El BOM hace que Excel en español abra el archivo en UTF-8 sin romper acentos.
  descargar(nombre, `﻿${csv}`, 'text/csv');

export const descargarJSON = (nombre: string, datos: unknown) =>
  descargar(nombre, JSON.stringify(datos, null, 2), 'application/json');

/* ────────────────────────────────────────────────────────────────────────────
 * Calendario .ics
 * Evento de día completo. `DTSTAMP` recibe la marca de tiempo desde fuera para
 * no llamar al reloj durante un render.
 * ────────────────────────────────────────────────────────────────────────── */

export interface EventoICS {
  uid: string;
  /** YYYY-MM-DD */
  fecha: string;
  titulo: string;
  descripcion: string;
}

export function construirICS(eventos: EventoICS[], marcaTiempo: string): string {
  const sinGuiones = (f: string) => f.replace(/-/g, '');
  const escapar = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const siguienteDia = (f: string) => {
    const d = new Date(`${f}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return sinGuiones(d.toISOString().slice(0, 10));
  };

  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LeyAntilavado.org//Herramientas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const e of eventos) {
    lineas.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}@leyantilavado.org`,
      `DTSTAMP:${marcaTiempo}`,
      `DTSTART;VALUE=DATE:${sinGuiones(e.fecha)}`,
      `DTEND;VALUE=DATE:${siguienteDia(e.fecha)}`,
      `SUMMARY:${escapar(e.titulo)}`,
      `DESCRIPTION:${escapar(e.descripcion)}`,
      'BEGIN:VALARM',
      'TRIGGER:-P3D',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapar(e.titulo)}`,
      'END:VALARM',
      'END:VEVENT',
    );
  }

  lineas.push('END:VCALENDAR');
  // RFC 5545 pide CRLF.
  return lineas.join('\r\n');
}

/** Marca de tiempo iCalendar a partir de un `Date`. Se le pasa el reloj desde fuera. */
export const marcaICS = (d: Date): string => `${d.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;

/* ────────────────────────────────────────────────────────────────────────────
 * Identificadores locales
 * No son criptográficos: sólo distinguen filas en una tabla del navegador.
 * ────────────────────────────────────────────────────────────────────────── */

let contador = 0;
export const nuevoId = (prefijo = 'f'): string => `${prefijo}-${++contador}`;

/* ────────────────────────────────────────────────────────────────────────────
 * Estado en la URL
 *
 * Sólo parámetros no personales (actividad, monto, fecha). Nunca nombres,
 * RFC, correos ni identificadores de cliente. Se escribe con
 * `history.replaceState` desde manejadores de evento: no dispara navegación
 * ni re-render del árbol de servidor.
 * ────────────────────────────────────────────────────────────────────────── */

export function escribirEnURL(parametros: Record<string, string | number | undefined>): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor === undefined || valor === '') url.searchParams.delete(clave);
    else url.searchParams.set(clave, String(valor));
  }
  window.history.replaceState(null, '', url);
}

/** Copia la URL actual. Devuelve `false` si el navegador la bloquea. */
export async function copiarEnlace(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    return false;
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Persistencia local
 * Todo se queda en el navegador. Ninguna herramienta envía las respuestas del
 * usuario a un servidor.
 * ────────────────────────────────────────────────────────────────────────── */

export function guardarLocal(clave: string, valor: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(`leyantilavado:${clave}`, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export function leerLocal<T>(clave: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const crudo = window.localStorage.getItem(`leyantilavado:${clave}`);
    return crudo ? (JSON.parse(crudo) as T) : null;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Porcentajes
 * ────────────────────────────────────────────────────────────────────────── */

export const formatearPorcentaje = (n: number, decimales = 2): string =>
  `${n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: decimales })}%`;
