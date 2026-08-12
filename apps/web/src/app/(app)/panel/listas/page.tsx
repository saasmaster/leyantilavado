import Link from 'next/link';
import { Search } from 'lucide-react';
import { formatearFechaCorta } from '@leyantilavado/rules-engine';
import {
  Boton,
  Campo,
  Entrada,
  Insignia,
  Nota,
  TablaEnvoltura,
  Tarjeta,
  TarjetaCuerpo,
  TarjetaTitulo,
} from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { EstadoConsulta } from '@/components/app/TablaRecurso';
import { AvisoAdaptadorLocal, AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { requerirContexto } from '@/lib/auth/sesion';
import { ETIQUETA_ORIGEN_PEP, proveedorPEPLocal } from '@/lib/app/pep';

export default async function PaginaListas({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const contexto = await requerirContexto('/panel/listas');
  const { q } = await searchParams;
  const consulta = (q ?? '').trim();

  const resultado = await proveedorPEPLocal.buscar(
    consulta,
    contexto.organizacion?.organizacionId ?? null,
  );

  return (
    <>
      <EncabezadoSeccion
        titulo="PEP y listas de riesgo"
        descripcion="Búsqueda de personas políticamente expuestas con el proveedor conectado. Hoy el único proveedor es local y sólo alcanza a tus propios clientes."
        etiqueta={proveedorPEPLocal.esLocal ? 'Adaptador local' : undefined}
      />

      <AvisoAdaptadorLocal />

      <Seccion titulo="Proveedor conectado">
        <Tarjeta>
          <TarjetaCuerpo className="flex flex-col gap-2">
            <TarjetaTitulo className="text-base">{proveedorPEPLocal.nombre}</TarjetaTitulo>
            <p className="text-sm text-[var(--color-tinta-suave)]">{proveedorPEPLocal.descripcion}</p>
            <p className="text-sm text-[var(--color-tinta)]">
              Listas oficiales cubiertas:{' '}
              {proveedorPEPLocal.listasCubiertas.length === 0 ? (
                <strong className="text-[var(--color-rojo)]">ninguna</strong>
              ) : (
                proveedorPEPLocal.listasCubiertas.join(', ')
              )}
              .
            </p>
            <p className="text-xs text-[var(--color-tinta-tenue)]">
              Alcance de la consulta: la tabla de clientes de tu propia organización, filtrada por
              las políticas de la base de datos. Ningún dato sale de esta plataforma al buscar.
            </p>
          </TarjetaCuerpo>
        </Tarjeta>
      </Seccion>

      <Seccion
        titulo="Buscar por nombre"
        descripcion="Sin texto, la búsqueda devuelve únicamente a las personas que tu organización ya marcó como PEP."
      >
        <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Campo
            id="q"
            etiqueta="Nombre de la persona"
            ayuda="Se compara sin distinguir mayúsculas ni acentos, contra el nombre capturado del cliente."
            className="w-full sm:max-w-md"
          >
            <Entrada name="q" type="search" defaultValue={consulta} autoComplete="off" />
          </Campo>
          <Boton type="submit" variante="accion">
            <Search aria-hidden="true" />
            Buscar
          </Boton>
        </form>
      </Seccion>

      <Seccion titulo={consulta === '' ? 'Personas marcadas como PEP' : `Coincidencias para “${consulta}”`}>
        {resultado.estado !== 'ok' || resultado.filas.length === 0 ? (
          <EstadoConsulta
            resultado={resultado}
            vacioTitulo={
              consulta === ''
                ? 'Nadie está marcado como PEP en tu padrón'
                : 'Sin coincidencias en tu propio padrón'
            }
            vacioDescripcion={
              consulta === ''
                ? 'Cuando marques a un cliente como persona políticamente expuesta aparecerá aquí, con la fecha de revisión y el origen del dato.'
                : 'Que no aparezca aquí no significa que la persona no esté en una lista oficial: este adaptador sólo mira a tus propios clientes. Para saberlo de verdad necesitas contratar un proveedor de listas.'
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            <TablaEnvoltura aria-label="Resultados de la búsqueda de PEP">
              <table className="w-full min-w-max border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                    {['Persona', 'Marca de PEP', 'Detalle', 'Revisado el', 'Origen del dato'].map((t) => (
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
                  {resultado.filas.map((c) => (
                    <tr key={c.id} className="border-b border-[var(--color-borde)] last:border-0">
                      <td className="px-3 py-2.5 align-top">
                        <Link
                          href={`/panel/clientes/${c.id}`}
                          className="cursor-pointer font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                        >
                          {c.nombre}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <Insignia tono={c.marcadoPEP ? 'ambar' : 'neutro'}>
                          {c.marcadoPEP ? 'Marcada como PEP' : 'No marcada'}
                        </Insignia>
                      </td>
                      <td className="max-w-md px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {c.detalle ?? <span className="text-[var(--color-tinta-tenue)]">Sin detalle</span>}
                      </td>
                      <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {c.revisadoEn ? (
                          formatearFechaCorta(c.revisadoEn.slice(0, 10))
                        ) : (
                          <span className="text-[var(--color-tinta-tenue)]">Sin revisar</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-top text-[var(--color-tinta)]">
                        {ETIQUETA_ORIGEN_PEP[c.origen] ?? c.origen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TablaEnvoltura>
            <p className="text-xs text-[var(--color-tinta-tenue)]">
              {resultado.filas.length}{' '}
              {resultado.filas.length === 1 ? 'coincidencia' : 'coincidencias'} dentro de tu propio
              padrón de clientes.
            </p>
          </div>
        )}
      </Seccion>

      <Nota tono="info" titulo="Cómo se conecta un proveedor real">
        <p>
          La interfaz <code>ProveedorPEP</code> declara tres cosas que la pantalla está obligada a
          mostrar: el nombre del proveedor, si es local y qué listas cubre. Conectar un proveedor
          externo consiste en escribir una segunda implementación de esa interfaz y sustituirla
          aquí; ninguna otra pantalla cambia. Mientras eso no pase, la interfaz se sigue
          describiendo como lo que es.
        </p>
      </Nota>

      <AvisoNoEsCumplimiento />
    </>
  );
}
