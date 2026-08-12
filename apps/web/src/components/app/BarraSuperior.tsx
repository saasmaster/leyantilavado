import { LogOut, ShieldAlert } from 'lucide-react';
import { Boton, Insignia } from '@leyantilavado/ui';
import { cambiarOrganizacion, cambiarVerComo, salir } from '@/lib/auth/acciones';
import { ETIQUETA_ROL, rolesSimulables } from '@/lib/auth/permisos';
import type { ContextoApp } from '@/lib/auth/sesion';

export function BarraSuperior({ contexto }: { contexto: ContextoApp }) {
  const { organizacion, organizaciones, rolReal, rolEfectivo, verComoActivo } = contexto;
  const simulables = rolReal ? rolesSimulables(rolReal) : [];

  return (
    <div className="flex flex-col gap-2 border-b border-[var(--color-borde)] bg-[var(--color-superficie)] px-4 py-2.5 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {organizaciones.length > 1 ? (
          <form action={cambiarOrganizacion} className="flex items-center gap-2">
            <label htmlFor="organizacionId" className="text-xs font-medium text-[var(--color-tinta-suave)]">
              Organización
            </label>
            <select
              id="organizacionId"
              name="organizacionId"
              defaultValue={organizacion?.organizacionId ?? ''}
              className="h-11 cursor-pointer rounded-[var(--radius-control)] border border-[var(--color-borde-fuerte)] bg-[var(--color-superficie)] px-2 text-sm text-[var(--color-tinta)]"
            >
              {organizaciones.map((o) => (
                <option key={o.organizacionId} value={o.organizacionId}>
                  {o.nombre}
                </option>
              ))}
            </select>
            <Boton type="submit" variante="contorno" tamano="sm">
              Cambiar
            </Boton>
          </form>
        ) : (
          <span className="text-sm font-medium text-[var(--color-tinta)]">
            {organizacion?.nombre ?? 'Sin organización'}
          </span>
        )}
        {rolEfectivo && (
          <Insignia tono={verComoActivo ? 'ambar' : 'marino'}>
            {verComoActivo ? `Viendo como ${ETIQUETA_ROL[rolEfectivo]}` : ETIQUETA_ROL[rolEfectivo]}
          </Insignia>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {simulables.length > 0 && (
          <form action={cambiarVerComo} className="flex items-center gap-2">
            <label htmlFor="rol" className="text-xs font-medium text-[var(--color-tinta-suave)]">
              Ver como
            </label>
            <select
              id="rol"
              name="rol"
              defaultValue={verComoActivo ? (rolEfectivo ?? '') : ''}
              className="h-11 cursor-pointer rounded-[var(--radius-control)] border border-[var(--color-borde-fuerte)] bg-[var(--color-superficie)] px-2 text-sm text-[var(--color-tinta)]"
            >
              <option value="">Mi rol real</option>
              {simulables.map((r) => (
                <option key={r} value={r}>
                  {ETIQUETA_ROL[r]}
                </option>
              ))}
            </select>
            <Boton type="submit" variante="contorno" tamano="sm">
              Aplicar
            </Boton>
          </form>
        )}
        <form action={salir}>
          <Boton type="submit" variante="fantasma" tamano="sm">
            <LogOut aria-hidden="true" />
            Salir
          </Boton>
        </form>
      </div>

      {verComoActivo && (
        <p className="flex w-full items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-ambar-tenue)] px-3 py-2 text-xs text-[var(--color-tinta)]">
          <ShieldAlert aria-hidden="true" className="size-4 shrink-0 text-[var(--color-ambar)]" />
          Estás simulando un rol con menos permisos. Sólo cambia lo que se dibuja: la base de datos
          te sigue reconociendo como {rolReal ? ETIQUETA_ROL[rolReal] : 'tu rol real'} y las
          políticas RLS no se relajan.
        </p>
      )}
    </div>
  );
}
