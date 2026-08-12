'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { Boton, Campo, Selector } from '@leyantilavado/ui';
import {
  CuentaRegresivaReglas,
  type ReglaConFecha,
  type ReglaSinFecha,
} from '@/components/CuentaRegresivaReglas';

/**
 * Controles del calendario de cumplimiento.
 *
 * La cuenta regresiva NO se implementa aquí: la hace `CuentaRegresivaReglas`,
 * que ya resuelve el reloj compartido con `useSyncExternalStore` y la
 * hidratación con la marca de tiempo del servidor. Este componente sólo aporta
 * lo que esa vista no tiene: filtro por obligación y exportación a .ics.
 *
 * El bloque de pendientes sin fecha se pasa tal cual y deliberadamente no lleva
 * contador: su exigibilidad depende de una resolución que aún no se publica, y
 * ponerle reloj sería inventarle una fecha.
 */
export interface HitoVista {
  id: string;
  fecha: string;
  fechaFin?: string;
  fechaLarga: string;
  titulo: string;
  descripcion: string;
  confirmadoOficialmente: boolean;
  obligacionSlugs: readonly string[];
  obligacionTitulos: readonly string[];
}

export interface PendienteVista {
  id: string;
  titulo: string;
  descripcion: string;
  motivo: string;
  obligacionSlugs: readonly string[];
}

function aFechaICS(fecha: string): string {
  return fecha.replace(/-/g, '');
}

function sumarUnDia(fecha: string): string {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function escaparICS(texto: string): string {
  return texto
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function construirICS(hitos: readonly HitoVista[]): string {
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LeyAntilavado.org//Calendario de cumplimiento//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Cumplimiento LFPIORPI',
  ];

  for (const h of hitos) {
    const fin = sumarUnDia(h.fechaFin ?? h.fecha);
    const sufijo = h.confirmadoOficialmente
      ? ''
      : ' [Fecha estimada a partir de un plazo en meses; el texto oficial no publica una fecha calendario.]';
    lineas.push(
      'BEGIN:VEVENT',
      `UID:${h.id}@leyantilavado.org`,
      `DTSTART;VALUE=DATE:${aFechaICS(h.fecha)}`,
      `DTEND;VALUE=DATE:${aFechaICS(fin)}`,
      `SUMMARY:${escaparICS(h.titulo)}`,
      `DESCRIPTION:${escaparICS(h.descripcion + sufijo)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }

  lineas.push('END:VCALENDAR');
  // El estándar exige CRLF entre líneas.
  return lineas.join('\r\n');
}

function descargarICS(hitos: readonly HitoVista[]) {
  const blob = new Blob([construirICS(hitos)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cumplimiento-lfpiorpi.ics';
  a.click();
  URL.revokeObjectURL(url);
}

export function CalendarioCumplimiento({
  hitos,
  pendientes,
  obligaciones,
  ahoraISO,
}: {
  hitos: readonly HitoVista[];
  pendientes: readonly PendienteVista[];
  obligaciones: readonly { slug: string; titulo: string }[];
  ahoraISO: string;
}) {
  const [filtro, setFiltro] = useState('todas');

  const hitosVisibles = useMemo(
    () => (filtro === 'todas' ? hitos : hitos.filter((h) => h.obligacionSlugs.includes(filtro))),
    [hitos, filtro],
  );

  const pendientesVisibles = useMemo(
    () =>
      filtro === 'todas'
        ? pendientes
        : pendientes.filter((p) => p.obligacionSlugs.includes(filtro)),
    [pendientes, filtro],
  );

  const reglas: ReglaConFecha[] = useMemo(
    () =>
      hitosVisibles.map((h) => ({
        id: h.id,
        fecha: h.fecha,
        fechaLarga: h.fechaFin ? `${h.fechaLarga} · periodo anual` : h.fechaLarga,
        titulo: h.titulo,
        descripcion: h.descripcion,
        confirmadoOficialmente: h.confirmadoOficialmente,
        obligaciones: h.obligacionTitulos,
      })),
    [hitosVisibles],
  );

  const sinFecha: ReglaSinFecha[] = useMemo(
    () =>
      pendientesVisibles.map((p) => ({
        id: p.id,
        titulo: p.titulo,
        descripcion: p.descripcion,
        motivo: p.motivo,
      })),
    [pendientesVisibles],
  );

  return (
    <>
      <div className="contenedor-app">
        <div className="flex flex-wrap items-end gap-4 rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-5">
          <Campo
            id="filtro-obligacion"
            etiqueta="Filtrar por obligación"
            ayuda="Muestra sólo las fechas ligadas a una obligación"
            className="min-w-64 flex-1"
          >
            <Selector value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="todas">Todas las obligaciones</option>
              {obligaciones.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.titulo}
                </option>
              ))}
            </Selector>
          </Campo>

          <Boton
            type="button"
            variante="contorno"
            onClick={() => descargarICS(hitosVisibles)}
            disabled={hitosVisibles.length === 0}
          >
            <Download aria-hidden />
            Descargar .ics
          </Boton>

          <p className="w-full text-sm text-[var(--color-tinta-tenue)]" role="status">
            {hitosVisibles.length} de {hitos.length} fechas
            {pendientesVisibles.length > 0
              ? ` · ${pendientesVisibles.length} obligación sin fecha cierta`
              : ''}
            . El archivo .ics se genera en tu navegador: no enviamos nada a ningún servidor.
          </p>
        </div>
      </div>

      {reglas.length > 0 ? (
        <CuentaRegresivaReglas
          reglas={reglas}
          sinFecha={sinFecha}
          ahoraISO={ahoraISO}
          titulo="Cuánto falta para cada regla"
          descripcion="Todas las fechas exigibles del calendario 2026-2029, con cuenta regresiva en vivo. Las fechas son nominales: no las recorremos por días inhábiles sin una regla oficial que lo respalde."
        />
      ) : (
        <div className="contenedor-app py-10">
          <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-borde-fuerte)] p-6 text-center text-sm text-[var(--color-tinta-suave)]">
            Esa obligación no tiene fechas con día cierto en el calendario. Revisa abajo los
            pendientes sin fecha.
          </p>
        </div>
      )}
    </>
  );
}
