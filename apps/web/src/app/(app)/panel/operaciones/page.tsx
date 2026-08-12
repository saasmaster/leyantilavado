import Link from 'next/link';
import { Upload } from 'lucide-react';
import type { Conclusion } from '@leyantilavado/types';
import { Boton, Nota, TITULO_CONCLUSION } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { requerirContexto } from '@/lib/auth/sesion';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'operation_date', titulo: 'Fecha', formato: 'fecha' },
  { clave: 'activity_slug', titulo: 'Actividad', formato: 'insignia' },
  { clave: 'subtype', titulo: 'Subtipo', vacio: 'Sin subtipo' },
  { clave: 'amount_cents', titulo: 'Monto', formato: 'dinero' },
  { clave: 'cash_amount_cents', titulo: 'En efectivo', formato: 'dinero', vacio: 'Sin efectivo' },
  { clave: 'payment_method', titulo: 'Medio de pago', formato: 'insignia' },
  { clave: 'conclusion', titulo: 'Conclusión guardada', formato: 'insignia', vacio: 'Sin evaluar' },
  { clave: 'legal_version', titulo: 'Versión legal', vacio: 'Sin registrar' },
];

const CONCLUSIONES = Object.entries(TITULO_CONCLUSION) as [Conclusion, string][];

export default async function PaginaOperaciones() {
  const contexto = await requerirContexto('/panel/operaciones');

  return (
    <>
      <EncabezadoSeccion
        titulo="Operaciones"
        descripcion="Actos u operaciones capturados por tu organización, con el importe tal como se registró y la conclusión que el motor calculó en el momento de la captura."
        acciones={
          contexto.puede('operaciones.importar') ? (
            <Boton comoHijo variante="accion">
              <Link href="/panel/operaciones/importar">
                <Upload aria-hidden="true" />
                Importar CSV
              </Link>
            </Boton>
          ) : undefined
        }
      />

      <TablaRecurso
        tabla="operations"
        columnas={COLUMNAS}
        organizacionId={contexto.organizacion?.organizacionId ?? null}
        ordenarPor="operation_date"
        vacioTitulo="Todavía no hay operaciones capturadas"
        vacioDescripcion="Puedes capturarlas una por una o importar un CSV. La revisión previa del CSV funciona sin base de datos; guardar las filas requiere la base conectada."
        accionVacio={
          contexto.puede('operaciones.importar') ? (
            <Boton comoHijo variante="contorno">
              <Link href="/panel/operaciones/importar">Revisar un CSV de operaciones</Link>
            </Boton>
          ) : undefined
        }
        pie={
          <details className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-3 text-sm">
            <summary className="cursor-pointer font-medium text-[var(--color-tinta)]">
              Qué significa cada conclusión guardada
            </summary>
            <dl className="mt-3 flex flex-col gap-2">
              {CONCLUSIONES.map(([clave, titulo]) => (
                <div key={clave}>
                  <dt className="cifra text-xs text-[var(--color-tinta-tenue)]">{clave}</dt>
                  <dd className="text-sm text-[var(--color-tinta)]">{titulo}</dd>
                </div>
              ))}
            </dl>
          </details>
        }
      />

      <Seccion>
        <Nota tono="info" titulo="La conclusión guardada es una foto, no un veredicto vigente">
          <p>
            Cada operación guarda la conclusión que el motor calculó con la regla y la UMA vigentes
            en <strong>la fecha de la operación</strong>, junto con la versión del corpus legal
            usada. Por eso dos operaciones idénticas de años distintos pueden tener conclusiones
            distintas, y por eso no recalculamos el historial en silencio cuando cambia la ley.
          </p>
          <p>
            El importe se guarda en centavos enteros y aquí se muestra formateado en pesos. Ninguna
            cifra de esta tabla se redondea para caber.
          </p>
        </Nota>
      </Seccion>

      <AvisoNoEsCumplimiento />
    </>
  );
}
