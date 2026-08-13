import { CORTES_RIESGO, ETIQUETAS_FACTOR, PONDERACIONES_BASE } from '@leyantilavado/rules-engine';
import { Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { requerirPermiso } from '@/lib/auth/sesion';
import { fechaDeHoy } from '@/lib/app/fecha';
import { CalculadoraRiesgo } from './CalculadoraRiesgo';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'assessed_on', titulo: 'Evaluado el', formato: 'fecha' },
  { clave: 'scope', titulo: 'Alcance', formato: 'insignia' },
  { clave: 'level', titulo: 'Nivel', formato: 'insignia' },
  { clave: 'raw_score', titulo: 'Puntaje bruto', formato: 'numero' },
  { clave: 'final_score', titulo: 'Puntaje final', formato: 'numero' },
  { clave: 'enhanced_due_diligence', titulo: 'Diligencia reforzada', formato: 'booleano' },
  { clave: 'next_review', titulo: 'Próxima revisión', formato: 'fecha' },
  { clave: 'methodology_version', titulo: 'Metodología' },
];

const FACTORES = Object.entries(PONDERACIONES_BASE) as [keyof typeof ETIQUETAS_FACTOR, number][];

export default async function PaginaRiesgo() {
  const contexto = await requerirPermiso('riesgos.ver', '/panel/riesgo');
  const hoy = await fechaDeHoy();

  return (
    <>
      <EncabezadoSeccion
        titulo="Clasificación de riesgo"
        descripcion="Enfoque basado en riesgos: cada cliente se clasifica ponderando factores y el nivel resultante define la intensidad de la debida diligencia y la frecuencia de revisión."
      />

      <Seccion titulo="Calculadora">
        <CalculadoraRiesgo fecha={hoy} />
      </Seccion>

      <Seccion
        titulo="Metodología precargada"
        descripcion="Pesos y cortes que trae el motor. Son un punto de partida documentado; tu organización puede justificar otros."
      >
        <TablaEnvoltura aria-label="Ponderaciones de la metodología de riesgo">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                {['Factor', 'Ponderación'].map((t) => (
                  <th
                    key={t}
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                  >
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FACTORES.map(([clave, peso]) => (
                <tr key={clave} className="border-b border-[var(--color-borde)] last:border-0">
                  <td className="px-3 py-2.5 text-[var(--color-tinta)]">{ETIQUETAS_FACTOR[clave]}</td>
                  <td className="cifra px-3 py-2.5 text-[var(--color-tinta)]">
                    {(peso * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>
        <p className="text-xs text-[var(--color-tinta-suave)]">
          Cortes del puntaje final: hasta {CORTES_RIESGO.bajo} es riesgo bajo, hasta{' '}
          {CORTES_RIESGO.medio} es riesgo medio, por encima es riesgo alto. La condición de persona
          políticamente expuesta activa la debida diligencia reforzada aunque el puntaje no llegue a
          riesgo alto.
        </p>
      </Seccion>

      <Seccion
        titulo="Clasificaciones registradas"
        descripcion="Evaluaciones guardadas por tu organización, con su puntaje, su nivel y la fecha límite de la siguiente revisión."
      >
        <TablaRecurso
          tabla="risk_assessments"
          columnas={COLUMNAS}
          organizacionId={contexto.organizacion?.organizacionId ?? null}
          ordenarPor="assessed_on"
          vacioTitulo="Todavía no hay clasificaciones registradas"
          vacioDescripcion="La calculadora de arriba funciona sin base de datos, pero para dejar constancia de una clasificación contra un cliente hace falta la base conectada."
        />
      </Seccion>

      <Nota tono="info" titulo="Un puntaje no es una conclusión sobre el cliente">
        <p>
          El nivel de riesgo sirve para decidir cuánta diligencia aplicar y cada cuánto revisar el
          expediente. No afirma que un cliente esté haciendo algo indebido, y un nivel bajo no
          exime de identificar, de integrar el expediente ni de avisar cuando la operación alcanza
          el umbral.
        </p>
      </Nota>

      <AvisoNoEsCumplimiento />
    </>
  );
}
