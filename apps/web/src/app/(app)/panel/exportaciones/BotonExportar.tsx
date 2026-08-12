'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Boton } from '@leyantilavado/ui';

export type FilaExportable = Record<string, unknown>;

function aTexto(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'object') return JSON.stringify(valor);
  return String(valor);
}

/** Comillas dobles duplicadas y campo entrecomillado en cuanto hay separador. */
function celdaCSV(valor: unknown): string {
  const texto = aTexto(valor);
  return /[",\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function construirCSV(filas: readonly FilaExportable[], columnas: readonly string[]): string {
  const lineas = [
    columnas.join(','),
    ...filas.map((fila) => columnas.map((c) => celdaCSV(fila[c])).join(',')),
  ];
  // El BOM evita que Excel en Windows destroce los acentos al abrir el archivo.
  return `\uFEFF${lineas.join('\r\n')}\r\n`;
}

function descargar(contenido: string, tipo: string, nombre: string): void {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

/**
 * Descarga en el navegador los datos que ya trajo el servidor.
 *
 * No hay una petición extra ni un endpoint que genere archivos: las filas
 * llegan como props desde el Server Component, filtradas por las políticas de
 * la base de datos, y aquí sólo se convierten a texto.
 */
export function BotonExportar({
  filas,
  columnas,
  nombreBase,
  fecha,
}: {
  filas: readonly FilaExportable[];
  columnas: readonly string[];
  /** Nombre del archivo sin extensión ni fecha. */
  nombreBase: string;
  /** Fecha del servidor en formato YYYY-MM-DD. El cliente nunca lee el reloj. */
  fecha: string;
}) {
  const [aviso, setAviso] = useState('');

  function exportar(formato: 'csv' | 'json') {
    const nombre = `${nombreBase}-${fecha}.${formato}`;
    if (formato === 'csv') {
      descargar(construirCSV(filas, columnas), 'text/csv;charset=utf-8', nombre);
    } else {
      descargar(JSON.stringify(filas, null, 2), 'application/json;charset=utf-8', nombre);
    }
    setAviso(`Se descargó ${nombre} con ${filas.length} registros.`);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Boton type="button" variante="accion" onClick={() => exportar('csv')}>
          <Download aria-hidden="true" />
          Descargar CSV
        </Boton>
        <Boton type="button" variante="contorno" onClick={() => exportar('json')}>
          <Download aria-hidden="true" />
          Descargar JSON
        </Boton>
      </div>
      <p aria-live="polite" className="min-h-4 text-xs text-[var(--color-tinta-suave)]">
        {aviso}
      </p>
    </div>
  );
}
