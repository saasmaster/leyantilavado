import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { formatearMXN } from '@leyantilavado/types';
import { Insignia, Nota, TablaEnvoltura, Tarjeta } from '@leyantilavado/ui';
import { enModoPrueba, obtenerProveedorPagos } from '@/lib/directorio/pagos';
import {
  COMPARATIVA,
  PLANES,
  PLANES_CUMPLIMIENTO,
  PLANES_DIRECTORIO,
  PRECIOS_PROPUESTOS,
  type Plan,
} from '@/lib/directorio/planes';
import { construirMetadata } from '@/lib/sitio';

export const metadata: Metadata = construirMetadata({
  titulo: 'Precios',
  descripcion:
    'Los siete planes: contenido y calculadoras gratis para siempre, área privada para empresas y despachos, y perfiles de directorio para proveedores.',
  ruta: '/precios',
});

function TarjetaPlan({ plan }: { plan: Plan }) {
  const gratis = plan.precioMensual === 0;

  return (
    <Tarjeta
      elevada={plan.destacado}
      className={plan.destacado ? 'border-[var(--color-petroleo)]' : undefined}
    >
      <div className="flex h-full flex-col gap-4 p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-[var(--color-tinta)]">{plan.nombre}</h3>
            {plan.destacado && <Insignia tono="petroleo">El más completo</Insignia>}
          </div>
          <p className="mt-1 text-sm text-[var(--color-tinta-tenue)]">{plan.paraQuien}</p>
        </div>

        <p className="cifra text-2xl font-semibold text-[var(--color-tinta)]">
          {gratis ? (
            'Gratis'
          ) : (
            <>
              {formatearMXN(plan.precioMensual)}
              <span className="text-sm font-normal text-[var(--color-tinta-tenue)]"> / mes</span>
            </>
          )}
        </p>
        {plan.precioAnual !== null && (
          <p className="-mt-3 text-xs text-[var(--color-tinta-tenue)]">
            o {formatearMXN(plan.precioAnual)} al año (dos meses menos)
          </p>
        )}

        <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">{plan.resumen}</p>

        <ul className="flex flex-col gap-2 text-sm text-[var(--color-tinta-suave)]">
          {plan.incluye.map((i) => (
            <li key={i} className="flex items-start gap-2">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--color-verde)]" />
              {i}
            </li>
          ))}
          {plan.noIncluye.map((i) => (
            <li key={i} className="flex items-start gap-2 text-[var(--color-tinta-tenue)]">
              <Minus aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {i}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-2">
          {gratis ? (
            <Link
              href={plan.familia === 'directorio' ? '/directorio/alta' : '/herramientas'}
              className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--color-marino)] px-5 text-sm font-medium text-white"
            >
              {plan.familia === 'directorio' ? 'Dar de alta mi perfil' : 'Empezar sin cuenta'}
            </Link>
          ) : (
            <p className="text-sm text-[var(--color-tinta-tenue)]">
              Todavía no se puede contratar: el cobro no está habilitado.{' '}
              <Link href="/contacto" className="underline underline-offset-4">
                Avísanos que te interesa
              </Link>{' '}
              y te escribimos cuando abra.
            </p>
          )}
        </div>
      </div>
    </Tarjeta>
  );
}

export default function PaginaPrecios() {
  const pagos = obtenerProveedorPagos();
  const prueba = enModoPrueba();

  return (
    <div className="contenedor-app flex flex-col gap-10 py-10 md:py-14">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold md:text-4xl">Precios</h1>
        <p className="prosa text-[var(--color-tinta-suave)]">
          El contenido legal y todas las calculadoras son gratuitos y lo van a seguir siendo: nadie
          debería pagar por saber si una ley le aplica. Lo que se cobra es el trabajo de guardar,
          organizar y recordar — y, del otro lado, las funciones de un perfil profesional en el
          directorio.
        </p>
      </header>

      {prueba && (
        <Nota tono="atencion" titulo="Modo de prueba: hoy no se cobra nada">
          <p>{pagos.avisoUI}</p>
          <p>
            No hay pasarela de pago conectada, no se piden datos de tarjeta y ningún botón de esta
            página inicia un cargo. Cuando eso cambie, esta nota desaparece.
          </p>
        </Nota>
      )}

      {PRECIOS_PROPUESTOS && (
        <Nota tono="info" titulo="Los importes son una propuesta">
          Las cantidades de abajo son la propuesta comercial con la que estamos trabajando, no una
          lista de precios cerrada. Si cambian antes de abrir el cobro, se actualizan aquí y se
          avisa a quien haya registrado interés.
        </Nota>
      )}

      <section aria-labelledby="planes-cumplimiento" className="flex flex-col gap-5">
        <div>
          <h2 id="planes-cumplimiento" className="text-2xl font-semibold">
            Para quien tiene que cumplir
          </h2>
          <p className="prosa mt-2 text-sm text-[var(--color-tinta-suave)]">
            Sujetos obligados y quienes los asesoran. La diferencia entre planes es cuánta
            operación guardas y cuánta gente la toca, nunca el acceso a la información legal.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLANES_CUMPLIMIENTO.map((p) => (
            <TarjetaPlan key={p.clave} plan={p} />
          ))}
        </div>
      </section>

      <section aria-labelledby="planes-directorio" className="flex flex-col gap-5">
        <div>
          <h2 id="planes-directorio" className="text-2xl font-semibold">
            Para quien ofrece servicios
          </h2>
          <p className="prosa mt-2 text-sm text-[var(--color-tinta-suave)]">
            Perfiles del directorio. Ninguno compra posición en los resultados. El único plan que
            compra visibilidad es el destacado, y lo hace en un bloque separado que siempre lleva la
            etiqueta “Patrocinado”.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANES_DIRECTORIO.map((p) => (
            <TarjetaPlan key={p.clave} plan={p} />
          ))}
        </div>
      </section>

      <section aria-labelledby="comparativa" className="flex flex-col gap-4">
        <h2 id="comparativa" className="text-2xl font-semibold">
          Comparativa completa
        </h2>
        <TablaEnvoltura etiqueta="Comparativa de planes">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <caption className="sr-only">
              Comparación de los siete planes de LeyAntilavado.org por criterio.
            </caption>
            <thead>
              <tr className="bg-[var(--color-marfil-hondo)] text-left">
                <th scope="col" className="p-3 font-semibold">
                  Criterio
                </th>
                {PLANES.map((p) => (
                  <th key={p.clave} scope="col" className="p-3 font-semibold">
                    {p.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARATIVA.map((fila) => (
                <tr key={fila.criterio} className="border-t border-[var(--color-borde)]">
                  <th scope="row" className="p-3 text-left font-medium text-[var(--color-tinta)]">
                    {fila.criterio}
                  </th>
                  {PLANES.map((p) => (
                    <td key={p.clave} className="p-3 text-[var(--color-tinta-suave)]">
                      {fila.valores[p.clave]}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-[var(--color-borde)]">
                <th scope="row" className="p-3 text-left font-medium text-[var(--color-tinta)]">
                  Precio mensual propuesto
                </th>
                {PLANES.map((p) => (
                  <td key={p.clave} className="cifra p-3 text-[var(--color-tinta-suave)]">
                    {p.precioMensual === 0 ? 'Gratis' : formatearMXN(p.precioMensual)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </TablaEnvoltura>
      </section>

      <section aria-labelledby="que-no-vendemos" className="flex flex-col gap-3">
        <h2 id="que-no-vendemos" className="text-2xl font-semibold">
          Lo que no se vende, en ningún plan
        </h2>
        <ul className="prosa flex flex-col gap-2 text-sm text-[var(--color-tinta-suave)]">
          <li>Mejor posición en los resultados del directorio.</li>
          <li>Insignias de verificación que no correspondan a lo que efectivamente revisamos.</li>
          <li>Aparecer como patrocinado sin la etiqueta “Patrocinado”.</li>
          <li>Menciones en el contenido editorial ni en el comparativo de software.</li>
          <li>Retirar un reporte fundado sobre un perfil.</li>
        </ul>
      </section>
    </div>
  );
}
