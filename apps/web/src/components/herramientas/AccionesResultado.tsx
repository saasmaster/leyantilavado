'use client';

import * as React from 'react';
import { Check, Download, Link2, Printer, Save } from 'lucide-react';
import { Boton } from '@leyantilavado/ui';
import { copiarEnlace, descargarCSV, descargarJSON, guardarLocal } from '@/lib/herramientas/util';

interface Props {
  /** Nombre base del archivo, sin extensión. */
  nombreArchivo: string;
  /** Datos del resultado para el JSON. */
  datos?: unknown;
  /** CSV ya construido, cuando la herramienta tiene filas que exportar. */
  csv?: string;
  /** Muestra el botón de copiar enlace: sólo si el estado vive en la URL. */
  conEnlace?: boolean;
  /** Clave de guardado local. Si se omite, no se ofrece guardar. */
  claveGuardado?: string;
  /** Lo que se guarda. Por omisión, `datos`. */
  datosGuardado?: unknown;
}

/**
 * Acciones sobre un resultado.
 *
 * El PDF sale por `window.print()` contra la hoja `@media print`, sin traer
 * una librería de 400 kB al cliente para algo que el navegador ya hace.
 * `generarPDF` queda como punto de enganche para un generador real
 * (encabezado con folio, marca de agua) cuando haga falta.
 */
export function AccionesResultado({
  nombreArchivo,
  datos,
  csv,
  conEnlace,
  claveGuardado,
  datosGuardado,
}: Props) {
  const [aviso, setAviso] = React.useState<string | null>(null);

  const anunciar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(null), 4000);
  };

  const generarPDF = () => {
    // ponytail: se usa la impresión del navegador; si más adelante hace falta
    // folio, marca de agua o firma, este es el punto donde entra el generador.
    window.print();
  };

  return (
    <div className="no-imprimir mt-6 flex flex-wrap items-center gap-2">
      <Boton variante="contorno" tamano="sm" type="button" onClick={generarPDF}>
        <Printer aria-hidden />
        Imprimir o guardar en PDF
      </Boton>

      {datos !== undefined && (
        <Boton
          variante="contorno"
          tamano="sm"
          type="button"
          onClick={() => {
            descargarJSON(`${nombreArchivo}.json`, datos);
            anunciar('Archivo JSON descargado.');
          }}
        >
          <Download aria-hidden />
          Descargar JSON
        </Boton>
      )}

      {csv !== undefined && (
        <Boton
          variante="contorno"
          tamano="sm"
          type="button"
          onClick={() => {
            descargarCSV(`${nombreArchivo}.csv`, csv);
            anunciar('Archivo CSV descargado.');
          }}
        >
          <Download aria-hidden />
          Descargar CSV
        </Boton>
      )}

      {conEnlace && (
        <Boton
          variante="contorno"
          tamano="sm"
          type="button"
          onClick={() => {
            void copiarEnlace().then((ok) =>
              anunciar(
                ok
                  ? 'Enlace copiado. Lleva los datos del formulario, no datos personales.'
                  : 'Tu navegador no permitió copiar. Copia la barra de direcciones a mano.',
              ),
            );
          }}
        >
          <Link2 aria-hidden />
          Copiar enlace
        </Boton>
      )}

      {claveGuardado && (
        <Boton
          variante="contorno"
          tamano="sm"
          type="button"
          onClick={() => {
            const ok = guardarLocal(claveGuardado, datosGuardado ?? datos);
            anunciar(
              ok
                ? 'Guardado en este navegador. No sale de tu equipo y se pierde si borras los datos del sitio.'
                : 'No se pudo guardar: tu navegador tiene bloqueado el almacenamiento local.',
            );
          }}
        >
          <Save aria-hidden />
          Guardar en este navegador
        </Boton>
      )}

      <p role="status" aria-live="polite" className="text-sm text-[var(--color-tinta-suave)]">
        {aviso && (
          <span className="inline-flex items-center gap-1.5">
            <Check aria-hidden className="size-4 text-[var(--color-verde)]" />
            {aviso}
          </span>
        )}
      </p>
    </div>
  );
}
