import { GraduationCap } from 'lucide-react';
import type { Obligacion } from '@leyantilavado/types';
import { datos } from '@leyantilavado/rules-engine';
import { Insignia, Nota, SelloProcedencia } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { MAPA_FUENTES } from '@/components/inicio/comun';
import { requerirContexto } from '@/lib/auth/sesion';

const COLUMNAS = [
  { clave: 'completed_on', titulo: 'Fecha', formato: 'fecha' },
  { clave: 'person_name', titulo: 'Persona' },
  { clave: 'person_email', titulo: 'Correo', vacio: 'Sin correo' },
  { clave: 'course_name', titulo: 'Curso' },
  { clave: 'provider', titulo: 'Impartido por', vacio: 'Sin registrar' },
  { clave: 'hours', titulo: 'Horas', formato: 'numero' },
  { clave: 'valid_until', titulo: 'Vigente hasta', formato: 'fecha', vacio: 'Sin vigencia' },
  { clave: 'notes', titulo: 'Notas', vacio: '—' },
] satisfies readonly ColumnaTabla[];

/** Sólo da nombre en español a la periodicidad; el valor sale del motor. */
const ETIQUETA_RECURRENCIA: Record<NonNullable<Obligacion['recurrencia']>, string> = {
  unica: 'una sola vez',
  mensual: 'cada mes',
  semestral: 'cada seis meses',
  anual: 'cada año',
};

export default async function PaginaCapacitacion() {
  const contexto = await requerirContexto('/panel/capacitacion');
  const org = contexto.organizacion?.organizacionId ?? null;
  const obligacion = datos.OBLIGACIONES_POR_SLUG['capacitacion'];

  return (
    <>
      <EncabezadoSeccion
        titulo="Evidencia de capacitación"
        descripcion="Registro de quién se capacitó, en qué, cuándo y con qué constancia. Es la evidencia que un auditor pide primero porque es la más fácil de comprobar."
      />

      {obligacion ? (
        <Seccion titulo="Qué exige la obligación cargada">
          <div className="tarjeta p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-[var(--color-tinta)]">
                <GraduationCap aria-hidden="true" className="mr-2 inline size-4 align-[-3px]" />
                {obligacion.titulo}
              </h3>
              {obligacion.recurrencia && (
                <Insignia tono="petroleo">
                  Se repite {ETIQUETA_RECURRENCIA[obligacion.recurrencia]}
                </Insignia>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
              {obligacion.resumen}
            </p>
            <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-sm text-[var(--color-tinta-suave)]">
              {obligacion.pasos.map((paso) => (
                <li key={paso.id}>
                  {paso.texto}
                  {paso.evidencia && (
                    <span className="ml-1 text-xs text-[var(--color-tinta-tenue)]">
                      (evidencia: {paso.evidencia})
                    </span>
                  )}
                </li>
              ))}
            </ol>
            <SelloProcedencia
              className="mt-4"
              procedencia={obligacion.procedencia}
              fuentes={MAPA_FUENTES}
            />
          </div>
        </Seccion>
      ) : (
        <Nota tono="riesgo" titulo="Requiere revisión editorial">
          <p>
            La obligación de capacitación no está en el corpus legal cargado en esta versión, así
            que esta pantalla no puede decirte con qué periodicidad se repite. No la inventamos:
            repórtalo para que se cargue en los datos del motor.
          </p>
        </Nota>
      )}

      <Nota tono="atencion" titulo="El recordatorio no sustituye al programa">
        <p>
          La periodicidad que ves arriba sale del motor jurídico, no de esta pantalla. Cumplir con
          ella exige un programa con alcance definido, asistencia registrada y evaluación: una
          constancia suelta por persona no acredita el programa completo.
        </p>
      </Nota>

      <Seccion
        titulo="Capacitaciones registradas"
        descripcion="Ordenadas por fecha de conclusión, de la más reciente a la más antigua."
      >
        <TablaRecurso
          tabla="training_records"
          columnas={COLUMNAS}
          organizacionId={org}
          ordenarPor="completed_on"
          vacioTitulo="Todavía no hay capacitaciones registradas"
          vacioDescripcion="Cada vez que alguien de tu equipo termine un curso, registra aquí la fecha, el curso y la constancia. Sin registro no hay evidencia que mostrar."
        />
      </Seccion>

      <AvisoNoEsCumplimiento />
    </>
  );
}
