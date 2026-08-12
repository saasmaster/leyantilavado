'use client';

import { Campo, Selector } from '@leyantilavado/ui';
import { OPCIONES_ACTIVIDAD, subtiposDe } from '@/lib/herramientas/actividades';

interface Props {
  actividad: string;
  subtipo: string;
  fecha: string;
  onActividad: (slug: string) => void;
  onSubtipo: (slug: string) => void;
  errorActividad?: string;
  errorSubtipo?: string;
  idPrefijo?: string;
}

/**
 * Selector de actividad + subtipo.
 *
 * Cuando la actividad tiene subtipos, el segundo campo es obligatorio: sin él
 * el motor no puede resolver una regla única y devolvería `undefined`. Se
 * prefiere pedirlo antes que elegir un inciso al azar.
 */
export function SelectorActividad({
  actividad,
  subtipo,
  fecha,
  onActividad,
  onSubtipo,
  errorActividad,
  errorSubtipo,
  idPrefijo = 'act',
}: Props) {
  const subtipos = subtiposDe(actividad, fecha);
  const elegido = subtipos.find((s) => s.slug === subtipo);

  return (
    <>
      <Campo
        id={`${idPrefijo}-actividad`}
        etiqueta="Actividad vulnerable"
        ayuda="La fracción del artículo 17 bajo la que realizas la operación."
        requerido
        {...(errorActividad ? { error: errorActividad } : {})}
      >
        <Selector
          value={actividad}
          onChange={(e) => {
            onActividad(e.target.value);
            // Al cambiar de actividad el subtipo anterior deja de existir.
            onSubtipo('');
          }}
        >
          <option value="">Elige una actividad…</option>
          {OPCIONES_ACTIVIDAD.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.fraccion} — {a.nombre}
            </option>
          ))}
        </Selector>
      </Campo>

      {subtipos.length > 0 && (
        <Campo
          id={`${idPrefijo}-subtipo`}
          etiqueta="Supuesto o inciso"
          ayuda="Esta actividad no tiene un umbral único: cada inciso tiene su propia regla."
          requerido
          {...(errorSubtipo ? { error: errorSubtipo } : {})}
        >
          <Selector value={subtipo} onChange={(e) => onSubtipo(e.target.value)}>
            <option value="">Elige el supuesto…</option>
            {subtipos.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.nombre}
              </option>
            ))}
          </Selector>
        </Campo>
      )}

      {elegido && (
        <p className="text-sm text-[var(--color-tinta-suave)] md:col-span-2">
          {elegido.descripcion}
        </p>
      )}
    </>
  );
}
