'use client';

import { useState } from 'react';
import { Download, FileWarning } from 'lucide-react';
import { formatearMXN } from '@leyantilavado/types';
import { AreaTexto, Boton, Campo, Insignia, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { descargarCSV } from '@/lib/herramientas/util';
import {
  COLUMNAS_OPERACION,
  plantillaOperacionesCSV,
  revisarCSVOperaciones,
} from '@/lib/app/csv';

/**
 * Revisión de un CSV de operaciones, completa en el navegador.
 *
 * El archivo no se envía a ningún servidor: se lee con `File.text()` en el
 * manejador del evento y se valida en memoria. Por eso tampoco hay botón de
 * guardar — escribir las filas necesita la base conectada, y un botón que no
 * escribe sería un botón muerto.
 */
export function FormularioImportacion({ fechaEjemplo }: { fechaEjemplo: string }) {
  const [texto, setTexto] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | undefined>(undefined);

  // `revisarCSVOperaciones` es pura: se puede calcular durante el render.
  const revision = texto.trim() === '' ? null : revisarCSVOperaciones(texto);
  const filasVisibles = revision?.filas.slice(0, 50) ?? [];

  async function alElegirArchivo(archivo: File | undefined) {
    if (!archivo) return;
    setErrorArchivo(undefined);
    try {
      const contenido = await archivo.text();
      setTexto(contenido);
      setNombreArchivo(archivo.name);
    } catch {
      setErrorArchivo('No pudimos leer el archivo. Vuelve a elegirlo o pega el contenido abajo.');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Boton
          type="button"
          variante="contorno"
          onClick={() =>
            descargarCSV('plantilla-operaciones.csv', plantillaOperacionesCSV(fechaEjemplo))
          }
        >
          <Download aria-hidden="true" />
          Descargar plantilla CSV
        </Boton>
        <p className="text-sm text-[var(--color-tinta-suave)]">
          Trae el encabezado y una fila de ejemplo con la fecha de hoy.
        </p>
      </div>

      <Campo
        id="archivo-csv"
        etiqueta="Archivo CSV"
        ayuda="Se lee en tu navegador. No se sube a ningún servidor."
        {...(errorArchivo ? { error: errorArchivo } : {})}
      >
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => void alElegirArchivo(e.target.files?.[0])}
          className="h-11 w-full cursor-pointer rounded-[var(--radius-control)] border border-[var(--color-borde-fuerte)] bg-[var(--color-superficie)] px-3 py-2 text-sm text-[var(--color-tinta)] file:mr-3 file:cursor-pointer file:rounded-[var(--radius-control)] file:border-0 file:bg-[var(--color-marfil-hondo)] file:px-3 file:py-1.5 file:text-sm file:text-[var(--color-tinta)]"
        />
      </Campo>

      <Campo
        id="pegar-csv"
        etiqueta="O pega aquí el contenido del CSV"
        ayuda="Útil cuando exportas desde una hoja de cálculo y prefieres copiar y pegar."
      >
        <AreaTexto
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setNombreArchivo(null);
          }}
          rows={6}
          spellCheck={false}
          className="cifra text-xs"
        />
      </Campo>

      {revision === null ? (
        <Nota tono="info" titulo="Sin archivo todavía">
          <p>
            Elige un archivo o pega su contenido para ver la revisión fila por fila. Nada se guarda
            en este paso.
          </p>
        </Nota>
      ) : revision.filas.length === 0 ? (
        <Nota tono="riesgo" titulo="El archivo no trae filas de datos">
          <p>
            Leímos el encabezado pero no encontramos ninguna fila debajo. Revisa que hayas exportado
            el rango completo de la hoja.
          </p>
        </Nota>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="tarjeta p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                Filas capturables
              </p>
              <p className="cifra mt-1.5 text-2xl font-semibold text-[var(--color-tinta)]">
                {revision.validas}
              </p>
            </div>
            <div className="tarjeta p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                Filas con problema
              </p>
              <p className="cifra mt-1.5 text-2xl font-semibold text-[var(--color-tinta)]">
                {revision.conError}
              </p>
            </div>
            <div className="tarjeta p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                Suma de las filas capturables
              </p>
              <p className="cifra mt-1.5 text-2xl font-semibold text-[var(--color-tinta)]">
                {formatearMXN(revision.totalCentavos)}
              </p>
            </div>
          </div>

          {revision.columnasFaltantes.length > 0 && (
            <Nota tono="riesgo" titulo="Faltan columnas obligatorias">
              <p>
                El archivo no trae: <code>{revision.columnasFaltantes.join(', ')}</code>. Sin ellas
                ninguna fila se puede capturar.
              </p>
            </Nota>
          )}

          {revision.columnasDesconocidas.length > 0 && (
            <Nota tono="atencion" titulo="Columnas que no reconocemos">
              <p>
                Se ignorarían al capturar: <code>{revision.columnasDesconocidas.join(', ')}</code>.
                Si alguna trae información que sí necesitas, renómbrala con el nombre exacto de la
                tabla de formato.
              </p>
            </Nota>
          )}

          <TablaEnvoltura aria-label="Vista previa del archivo CSV">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                  >
                    Línea
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                  >
                    Estado
                  </th>
                  {COLUMNAS_OPERACION.map((c) => (
                    <th
                      key={c.clave}
                      scope="col"
                      className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                    >
                      {c.clave}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filasVisibles.map((f) => (
                  <tr key={f.linea} className="border-b border-[var(--color-borde)] last:border-0">
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta-suave)]">
                      {f.linea}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      {f.errores.length === 0 ? (
                        <Insignia tono="verde">Capturable</Insignia>
                      ) : (
                        <>
                          <Insignia tono="rojo">
                            <FileWarning aria-hidden="true" className="size-3.5" />
                            {f.errores.length}{' '}
                            {f.errores.length === 1 ? 'problema' : 'problemas'}
                          </Insignia>
                          <ul className="mt-1 flex flex-col gap-1">
                            {f.errores.map((e) => (
                              <li
                                key={`${f.linea}-${e.columna}`}
                                className="text-xs text-[var(--color-rojo)]"
                              >
                                <span className="cifra font-medium">{e.columna}</span>: {e.mensaje}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </td>
                    {COLUMNAS_OPERACION.map((c) => (
                      <td
                        key={c.clave}
                        className="max-w-56 truncate px-3 py-2.5 align-top text-[var(--color-tinta)]"
                      >
                        {f.valores[c.clave] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaEnvoltura>

          <p className="text-xs text-[var(--color-tinta-tenue)]">
            {nombreArchivo ? `Archivo: ${nombreArchivo}. ` : ''}
            Mostrando {filasVisibles.length} de {revision.filas.length} filas. La revisión corre
            sobre el archivo completo aunque la vista previa se recorte.
          </p>

          <Nota tono="atencion" titulo="Qué falta para que esto capture de verdad">
            <p>
              Con la base de datos conectada, las {revision.validas} filas capturables se
              insertarían en la tabla de operaciones con un identificador de lote, y cada una se
              evaluaría con la regla y la UMA vigentes en su propia fecha. Hoy la pantalla se
              detiene aquí, y lo decimos en lugar de simular que guardó.
            </p>
          </Nota>
        </>
      )}
    </div>
  );
}
