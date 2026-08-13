import Link from 'next/link';
import { datos } from '@leyantilavado/rules-engine';
import { Nota, SelloProcedencia, Tarjeta, TarjetaCuerpo, TarjetaTitulo } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { requerirPermiso } from '@/lib/auth/sesion';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'full_name', titulo: 'Beneficiario' },
  { clave: 'ownership_percent', titulo: 'Participación %', formato: 'numero', vacio: 'Sin porcentaje' },
  { clave: 'control_type', titulo: 'Tipo de control', formato: 'insignia' },
  { clave: 'determination_status', titulo: 'Determinación', formato: 'insignia' },
  { clave: 'determination_note', titulo: 'Nota de determinación', vacio: 'Sin nota' },
  { clave: 'is_pep', titulo: 'PEP', formato: 'booleano' },
  { clave: 'identified_at', titulo: 'Identificado el', formato: 'fecha', vacio: 'Sin fecha' },
];

export default async function PaginaBeneficiarios() {
  const contexto = await requerirPermiso('clientes.ver', '/panel/beneficiarios');
  const obligacion = datos.OBLIGACIONES.find((o) => o.slug === 'beneficiario-controlador');

  return (
    <>
      <EncabezadoSeccion
        titulo="Beneficiarios controladores"
        descripcion="Quién se beneficia de verdad y quién manda de verdad detrás de cada cliente. La lista muestra lo capturado por tu organización, incluidos los casos que quedaron sin determinar."
      />

      <Seccion titulo="Qué es un beneficiario controlador">
        <Tarjeta>
          <TarjetaCuerpo className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-[var(--color-tinta)]">
              Es la persona <strong>física</strong> que finalmente obtiene el beneficio de la
              relación o de la operación, o la que ejerce el control aunque no aparezca en el acta
              ni en la escritura. Una persona moral nunca es el final de la cadena: hay que seguir
              subiendo hasta llegar a personas de carne y hueso. El control puede venir de la
              participación accionaria, pero también de acuerdos de voto, de la facultad de nombrar
              al órgano de administración o de cualquier otro medio.
            </p>
            {obligacion ? (
              <>
                <TarjetaTitulo className="text-base">{obligacion.titulo}</TarjetaTitulo>
                <p className="text-sm text-[var(--color-tinta-suave)]">{obligacion.resumen}</p>
                <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-[var(--color-tinta)]">
                  {obligacion.pasos.map((p) => (
                    <li key={p.id}>
                      {p.texto}
                      {p.evidencia && (
                        <span className="block text-xs text-[var(--color-tinta-tenue)]">
                          Evidencia esperada: {p.evidencia}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
                <SelloProcedencia procedencia={obligacion.procedencia} fuentes={datos.FUENTES_POR_ID} />
              </>
            ) : (
              <Nota tono="riesgo" titulo="Requiere revisión editorial">
                <p>
                  No encontramos la obligación de identificación del beneficiario controlador en el
                  corpus legal cargado. Preferimos decirlo a describirla de memoria.
                </p>
              </Nota>
            )}
          </TarjetaCuerpo>
        </Tarjeta>
      </Seccion>

      <Nota tono="atencion" titulo="Cuando no se puede determinar, hay que documentarlo">
        <p>
          Marcar <code>no_determinado</code> es una respuesta válida sólo si va acompañada de la
          nota que explique el procedimiento que sí se siguió: a quién se le pidió la manifestación
          por escrito, qué documentos se revisaron, hasta dónde llegó la cadena de propiedad y por
          qué se detuvo ahí. Una fila con <code>no_determinado</code> y la nota vacía no es una
          determinación: es un hueco en el expediente, y así se muestra en la tabla.
        </p>
        <p>
          La cadena de propiedad de cada cliente se captura y se consulta en su expediente, dentro
          de{' '}
          <Link
            href="/panel/clientes"
            className="cursor-pointer text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            Clientes y usuarios
          </Link>
          .
        </p>
      </Nota>

      <Seccion titulo="Beneficiarios capturados">
        <TablaRecurso
          tabla="beneficial_owners"
          columnas={COLUMNAS}
          organizacionId={contexto.organizacion?.organizacionId ?? null}
          ordenarPor="full_name"
          ascendente
          vacioTitulo="Todavía no hay beneficiarios controladores capturados"
          vacioDescripcion="Cuando registres uno aparecerá aquí con su porcentaje, el tipo de control y el estado de la determinación. La captura requiere la base de datos conectada."
        />
      </Seccion>

      <AvisoNoEsCumplimiento />
    </>
  );
}
