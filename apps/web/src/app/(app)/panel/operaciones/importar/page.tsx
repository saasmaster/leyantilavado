import Link from 'next/link';
import { datos } from '@leyantilavado/rules-engine';
import { Boton, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { requerirContexto } from '@/lib/auth/sesion';
import { fechaDeHoy } from '@/lib/app/fecha';
import { COLUMNAS_OPERACION } from '@/lib/app/csv';
import { FormularioImportacion } from './FormularioImportacion';

export default async function PaginaImportar() {
  const contexto = await requerirContexto('/panel/operaciones/importar');
  const hoy = await fechaDeHoy();

  if (!contexto.puede('operaciones.importar')) {
    return (
      <>
        <EncabezadoSeccion
          titulo="Importar operaciones"
          descripcion="Carga masiva de operaciones desde un archivo CSV."
        />
        <Nota tono="atencion" titulo="Tu rol no incluye la importación de operaciones">
          <p>
            Con el rol {contexto.rolEfectivo ?? 'actual'} puedes consultar las operaciones, pero no
            importarlas. Pídele a quien administra la organización que te cambie el rol o que haga
            la importación.
          </p>
          <p className="mt-3">
            <Boton comoHijo variante="contorno">
              <Link href="/panel/operaciones">Ver las operaciones capturadas</Link>
            </Boton>
          </p>
        </Nota>
      </>
    );
  }

  return (
    <>
      <EncabezadoSeccion
        titulo="Importar operaciones"
        descripcion="Revisa un archivo CSV antes de capturarlo: la validación corre completa en tu navegador y no envía el archivo a ningún lado."
      />

      <Nota tono="atencion" titulo="Esta pantalla todavía no escribe en la base de datos">
        <p>
          Lo que hace hoy es <strong>revisar</strong> el archivo: separa las filas capturables de
          las que tienen un problema y te dice exactamente cuál es el problema de cada una. El paso
          de guardar las filas requiere la base de datos conectada, y por eso no verás un botón de
          guardar: preferimos no ponerlo a que no haga nada.
        </p>
      </Nota>

      <Seccion
        titulo="Formato esperado"
        descripcion="Una fila por operación. El encabezado es obligatorio y el orden de las columnas no importa: se emparejan por nombre."
      >
        <TablaEnvoltura aria-label="Columnas del archivo CSV">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                {['Columna', '¿Obligatoria?', 'Qué va ahí'].map((t) => (
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
              {COLUMNAS_OPERACION.map((c) => (
                <tr key={c.clave} className="border-b border-[var(--color-borde)] last:border-0">
                  <td className="cifra px-3 py-2.5 align-top font-medium text-[var(--color-tinta)]">
                    {c.clave}
                  </td>
                  <td className="px-3 py-2.5 align-top text-[var(--color-tinta-suave)]">
                    {c.requerido ? 'Sí' : 'No'}
                  </td>
                  <td className="max-w-md px-3 py-2.5 align-top text-[var(--color-tinta)]">
                    {c.ayuda}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>
      </Seccion>

      <Seccion
        titulo="Identificadores de actividad válidos"
        descripcion="La columna «actividad» debe traer uno de estos valores, tal cual."
      >
        <TablaEnvoltura aria-label="Identificadores de actividad vulnerable">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                {['Valor', 'Fracción', 'Actividad'].map((t) => (
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
              {datos.ACTIVIDADES.map((a) => (
                <tr key={a.slug} className="border-b border-[var(--color-borde)] last:border-0">
                  <td className="cifra px-3 py-2.5 align-top font-medium text-[var(--color-tinta)]">
                    {a.slug}
                  </td>
                  <td className="px-3 py-2.5 align-top text-[var(--color-tinta-suave)]">{a.fraccion}</td>
                  <td className="px-3 py-2.5 align-top text-[var(--color-tinta)]">{a.nombreCorto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>
      </Seccion>

      <Seccion titulo="Revisar tu archivo">
        <FormularioImportacion fechaEjemplo={hoy} />
      </Seccion>

      <AvisoNoEsCumplimiento />
    </>
  );
}
