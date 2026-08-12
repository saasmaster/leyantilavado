import { Nota } from '@leyantilavado/ui';
import { Seccion } from '@/components/app/Contenedor';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';
import { TablaComparativaSemilla } from '@/components/admin/TablaComparativaSemilla';
import { SEMILLA_FECHAS, SEMILLA_PENDIENTES } from '@/components/admin/semillas';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'id', titulo: 'Identificador' },
  { clave: 'due_date', titulo: 'Fecha', formato: 'fecha' },
  { clave: 'end_date', titulo: 'Fin del periodo', formato: 'fecha', vacio: 'No es un periodo' },
  { clave: 'title', titulo: 'Hito' },
  { clave: 'officially_confirmed', titulo: 'Confirmada oficialmente', formato: 'booleano' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'verification', titulo: 'Verificación', formato: 'insignia' },
];

export default function PaginaFechas() {
  return (
    <RecursoAdmin
      titulo="Fechas del calendario"
      descripcion="Los hitos normativos con fecha cierta. Alimentan el calendario público y las cuentas regresivas, así que una fecha mal capturada aquí se convierte en una alarma falsa en la pantalla de mucha gente."
      tabla="deadlines"
      columnas={COLUMNAS}
      ordenarPor="due_date"
      ascendente
      incluirEliminados
      aviso={
        <Nota tono="atencion" titulo="Una fecha sin confirmar no se presenta como exigible">
          <p>
            Cuando <code>officially_confirmed</code> es falso, la fecha viene de un cálculo o de una
            fuente secundaria y el sitio la muestra marcada como no confirmada. No la pases a
            confirmada sin tener a la vista la publicación oficial que la fija.
          </p>
          <p>
            Las fechas tampoco se ajustan por días inhábiles: se guarda la fecha nominal, porque
            mover un vencimiento sin una regla oficial que lo autorice es inventar plazo.
          </p>
        </Nota>
      }
    >
      <TablaComparativaSemilla
        tabla="deadlines"
        clave="id"
        titulo="Hitos que trae el motor"
        filas={SEMILLA_FECHAS}
      />

      <Seccion
        titulo="Obligaciones previstas que todavía no tienen fecha cierta"
        descripcion="Están en la norma pero su exigibilidad depende de una publicación que aún no existe. No se les inventa una fecha para que el calendario se vea completo."
      >
        <ul className="flex flex-col gap-3">
          {SEMILLA_PENDIENTES.map((pendiente) => (
            <li key={pendiente.id} className="tarjeta p-4">
              <p className="font-medium text-[var(--color-tinta)]">{pendiente.nombre}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                {pendiente.detalle}
              </p>
              {pendiente.disposicion && (
                <p className="mt-2 text-xs text-[var(--color-tinta-tenue)]">
                  {pendiente.disposicion}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Seccion>
    </RecursoAdmin>
  );
}
