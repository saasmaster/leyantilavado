'use client';

import * as React from 'react';
import { AVISO_LEGAL_TEXTO } from '@/content/autores';
import { SITIO } from '@/lib/sitio';

/**
 * Encabezado que sólo existe en el papel.
 *
 * La hoja de impresión oculta cabecera y pie —correcto, son navegación— pero
 * el efecto colateral era que la hoja salía anónima: un resultado con cifras y
 * ninguna indicación de quién lo produjo, cuándo, ni de qué consulta salió.
 *
 * Eso importa porque la LFPIORPI obliga a conservar documentación cinco y diez
 * años, y quien usa estas herramientas suele imprimir el resultado para
 * meterlo en el expediente. Una hoja sin origen no sirve como respaldo de
 * nada: dentro de dos años nadie podrá decir de dónde salió ese número ni con
 * qué valor de UMA se calculó.
 *
 * Lleva tres cosas y ninguna más:
 *
 *  - **De dónde salió**, con la URL completa. Como el estado de estas
 *    herramientas vive en la URL, esa dirección reproduce la misma consulta:
 *    el papel deja de ser una captura y pasa a ser verificable.
 *  - **Cuándo se generó.** La fecha del cálculo ya la lleva el resultado; ésta
 *    es la de la impresión, que es la que fecha el documento del expediente.
 *  - **El aviso legal.** El mismo que en pantalla. Un documento archivado que
 *    no diga que no es asesoría jurídica acaba leyéndose como si lo fuera.
 */
export function SelloImpresion({ titulo }: { titulo: string }) {
  /*
   * Fecha y URL se calculan DESPUÉS de montar, nunca durante el render.
   *
   * El primer intento usaba `useState(() => new Date())`, que evita la regla
   * `react-hooks/purity` pero no el problema de fondo: el servidor renderiza
   * una hora y el cliente otra, y React lo reporta como desajuste de
   * hidratación. Lo cazaron 30 pruebas de «carga sin errores de consola» a la
   * vez, que es exactamente para lo que están.
   *
   * Dejarlo vacío en el servidor no cuesta nada: este bloque no se ve en
   * pantalla, y para cuando alguien pulsa imprimir hace rato que hidrató.
   */
  const [sello, setSello] = React.useState<{ fecha: string; url: string } | null>(null);

  React.useEffect(() => {
    setSello({
      fecha: new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' }),
      url: window.location.href,
    });
  }, []);

  return (
    <div className="solo-imprimir" aria-hidden="true">
      <div style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <p style={{ fontSize: '13pt', fontWeight: 700, margin: 0 }}>{titulo}</p>
        <p style={{ fontSize: '10pt', margin: '0.15rem 0 0' }}>
          {SITIO.nombre}
          {sello ? ` · Documento generado el ${sello.fecha}` : ''}
        </p>
        {sello && (
          <p style={{ fontSize: '8.5pt', margin: '0.15rem 0 0', wordBreak: 'break-all' }}>
            Consulta reproducible en: {sello.url}
          </p>
        )}
      </div>

      <div
        style={{
          borderTop: '1px solid #999',
          marginTop: '1.25rem',
          paddingTop: '0.5rem',
          fontSize: '8.5pt',
          lineHeight: 1.45,
        }}
      >
        {AVISO_LEGAL_TEXTO.map((linea) => (
          <p key={linea} style={{ margin: '0 0 0.35rem' }}>
            {linea}
          </p>
        ))}
      </div>
    </div>
  );
}
