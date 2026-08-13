import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatearFechaCorta } from '@leyantilavado/rules-engine';
import { Insignia, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { EncabezadoSeccion } from '@/components/app/Contenedor';
import { EstadoConsulta } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { listar } from '@/lib/app/consultas';
import { requerirPermiso } from '@/lib/auth/sesion';

interface FilaCliente {
  id: string;
  full_name: string;
  person_type: string;
  rfc: string | null;
  risk_level: string | null;
  file_status: string;
  identified_at: string | null;
  is_pep: boolean;
}

const TIPOS_PERSONA = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'persona_fisica', etiqueta: 'Persona física' },
  { valor: 'persona_moral', etiqueta: 'Persona moral' },
  { valor: 'fideicomiso', etiqueta: 'Fideicomiso' },
] as const;

const ETIQUETA_TIPO: Record<string, string> = {
  persona_fisica: 'Persona física',
  persona_moral: 'Persona moral',
  fideicomiso: 'Fideicomiso',
};

const ETIQUETA_EXPEDIENTE: Record<string, string> = {
  incompleto: 'Incompleto',
  completo: 'Completo',
  en_revision: 'En revisión',
  observado: 'Observado',
};

const TONO_EXPEDIENTE: Record<string, 'neutro' | 'ambar' | 'verde' | 'rojo'> = {
  incompleto: 'ambar',
  completo: 'verde',
  en_revision: 'neutro',
  observado: 'rojo',
};

const TONO_RIESGO: Record<string, 'verde' | 'ambar' | 'rojo'> = {
  bajo: 'verde',
  medio: 'ambar',
  alto: 'rojo',
};

export default async function PaginaClientes({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const contexto = await requerirPermiso('clientes.ver', '/panel/clientes');
  const { tipo } = await searchParams;
  const filtroTipo = TIPOS_PERSONA.some((t) => t.valor === tipo && t.valor !== '') ? tipo : undefined;

  const resultado = await listar<FilaCliente>('customers', {
    organizacionId: contexto.organizacion?.organizacionId ?? null,
    columnas: 'id,full_name,person_type,rfc,risk_level,file_status,identified_at,is_pep',
    ordenarPor: 'full_name',
    ascendente: true,
    ...(filtroTipo ? { filtros: { person_type: filtroTipo } } : {}),
  });

  return (
    <>
      <EncabezadoSeccion
        titulo="Clientes y usuarios"
        descripcion="Personas y entidades con las que tu organización realizó actos u operaciones. Esta pantalla muestra lo que capturaste; no evalúa si el expediente es suficiente."
      />

      <nav aria-label="Filtrar por tipo de persona" className="flex flex-wrap gap-2">
        {TIPOS_PERSONA.map((t) => {
          const activo = (filtroTipo ?? '') === t.valor;
          return (
            <Link
              key={t.valor || 'todos'}
              href={t.valor ? `/panel/clientes?tipo=${t.valor}` : '/panel/clientes'}
              aria-current={activo ? 'page' : undefined}
              className={
                activo
                  ? 'inline-flex h-11 cursor-pointer items-center rounded-[var(--radius-control)] border border-[var(--color-marino)] bg-[var(--color-marino-tenue)] px-4 text-sm font-medium text-[var(--color-marino)]'
                  : 'inline-flex h-11 cursor-pointer items-center rounded-[var(--radius-control)] border border-[var(--color-borde-fuerte)] px-4 text-sm text-[var(--color-tinta-suave)] hover:border-[var(--color-tinta-tenue)] hover:text-[var(--color-tinta)]'
              }
            >
              {t.etiqueta}
            </Link>
          );
        })}
      </nav>

      {resultado.estado !== 'ok' || resultado.filas.length === 0 ? (
        <EstadoConsulta
          resultado={resultado}
          vacioTitulo={filtroTipo ? 'Ningún cliente con ese tipo de persona' : 'Todavía no hay clientes capturados'}
          vacioDescripcion={
            filtroTipo
              ? 'Quita el filtro para ver el resto del padrón, o captura el expediente que falta.'
              : 'Cuando captures un cliente aparecerá aquí con su expediente, su nivel de riesgo y su fecha de identificación. La captura de clientes se hace con la base de datos conectada.'
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          <TablaEnvoltura aria-label="Clientes y usuarios">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                  {['Nombre', 'Tipo de persona', 'RFC', 'Riesgo', 'Expediente', 'Identificado el', 'PEP'].map(
                    (t) => (
                      <th
                        key={t}
                        scope="col"
                        className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                      >
                        {t}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {resultado.filas.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--color-borde)] last:border-0">
                    <td className="px-3 py-2.5 align-top">
                      <Link
                        href={`/panel/clientes/${c.id}`}
                        className="inline-flex cursor-pointer items-center gap-1 font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                      >
                        {c.full_name}
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {ETIQUETA_TIPO[c.person_type] ?? c.person_type}
                    </td>
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {c.rfc ?? <span className="text-[var(--color-tinta-tenue)]">Sin RFC</span>}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      {c.risk_level ? (
                        <Insignia tono={TONO_RIESGO[c.risk_level] ?? 'neutro'}>{c.risk_level}</Insignia>
                      ) : (
                        <span className="text-[var(--color-tinta-tenue)]">Sin clasificar</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <Insignia tono={TONO_EXPEDIENTE[c.file_status] ?? 'neutro'}>
                        {ETIQUETA_EXPEDIENTE[c.file_status] ?? c.file_status}
                      </Insignia>
                    </td>
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {c.identified_at ? (
                        formatearFechaCorta(c.identified_at.slice(0, 10))
                      ) : (
                        <span className="text-[var(--color-tinta-tenue)]">Sin fecha</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      {c.is_pep ? (
                        <Insignia tono="ambar">Marcado como PEP</Insignia>
                      ) : (
                        <span className="text-[var(--color-tinta-tenue)]">No marcado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaEnvoltura>
          <p className="text-xs text-[var(--color-tinta-tenue)]">
            {resultado.filas.length} {resultado.filas.length === 1 ? 'cliente' : 'clientes'}. Lo que
            ves depende de tu rol: las políticas de la base de datos filtran las filas antes de que
            lleguen a esta pantalla.
          </p>
        </div>
      )}

      <Nota tono="info" titulo="Qué significa “PEP: no marcado”">
        <p>
          Significa que nadie de tu organización marcó a esa persona como políticamente expuesta en
          esta plataforma. No significa que se haya consultado un padrón oficial: la verificación
          contra listas usa un adaptador local y está explicada en{' '}
          <Link
            href="/panel/listas"
            className="cursor-pointer text-[var(--color-petroleo-hondo)] underline underline-offset-2"
          >
            PEP y listas de riesgo
          </Link>
          .
        </p>
      </Nota>

      <AvisoNoEsCumplimiento />
    </>
  );
}
