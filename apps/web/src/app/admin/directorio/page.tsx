import Link from 'next/link';
import { EstadoVacio, Insignia, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import {
  EncabezadoSeccion,
  RejillaTarjetas,
  Seccion,
  TarjetaMetrica,
} from '@/components/app/Contenedor';
import { fechaDeHoy } from '@/lib/app/fecha';
import { requerirStaff } from '@/lib/auth/sesion';
import { ETIQUETA_CATEGORIA, esCategoria } from '@/lib/directorio/catalogo';
import { repositorioDirectorio, type AltaProveedor } from '@/lib/directorio/repositorio';
import { ETIQUETA_ESTADO, TONO_ESTADO, diasEspera, fechaHora } from './estados';

/* ────────────────────────────────────────────────────────────────────────────
 * Bandeja de altas del directorio.
 *
 * El formulario público de `/directorio/alta` escribe en `.data` desde hace
 * tiempo y hasta ahora nadie leía ese buzón. Esta pantalla lo abre.
 *
 * No exporta `metadata`: hereda la del layout de /admin, que ya lleva
 * `noindex`. Declarar una aquí la sustituiría y abriría el panel a los
 * buscadores sin que nada avisara.
 * ────────────────────────────────────────────────────────────────────────── */

const PENDIENTES = new Set(['pendiente', 'correccion_solicitada']);

function categorias(alta: AltaProveedor): string {
  const etiquetas = alta.categorias.map((c) => (esCategoria(c) ? ETIQUETA_CATEGORIA[c] : c));
  return etiquetas.length > 0 ? etiquetas.join(', ') : 'Sin categoría';
}

function TablaAltas({
  altas,
  hoy,
  etiqueta,
}: {
  altas: readonly AltaProveedor[];
  hoy: string;
  etiqueta: string;
}) {
  return (
    <TablaEnvoltura etiqueta={etiqueta}>
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
            {['Recibida', 'Espera', 'Folio', 'Nombre', 'Categorías', 'Estado', 'Documentos', ''].map(
              (titulo, i) => (
                <th
                  key={titulo || `col-${i}`}
                  scope="col"
                  className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                >
                  {titulo}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {altas.map((alta) => {
            const documentos = alta.documentos?.length ?? 0;
            const dias = diasEspera(alta.creadoEn, hoy);
            return (
              <tr key={alta.id} className="border-b border-[var(--color-borde)] last:border-0">
                <td className="px-3 py-2.5 align-top">
                  <span className="cifra">{fechaHora(alta.creadoEn)}</span>
                </td>
                <td className="px-3 py-2.5 align-top">
                  <span className="cifra">{dias === 0 ? 'Hoy' : `${dias} d`}</span>
                </td>
                <td className="px-3 py-2.5 align-top">
                  <span className="cifra">{alta.folio}</span>
                </td>
                <td className="px-3 py-2.5 align-top font-medium text-[var(--color-tinta)]">
                  {alta.nombre}
                </td>
                <td className="px-3 py-2.5 align-top text-[var(--color-tinta-suave)]">
                  {categorias(alta)}
                </td>
                <td className="px-3 py-2.5 align-top">
                  <Insignia tono={TONO_ESTADO[alta.estadoModeracion]}>
                    {ETIQUETA_ESTADO[alta.estadoModeracion]}
                  </Insignia>
                </td>
                <td className="px-3 py-2.5 align-top">
                  {documentos > 0 ? (
                    <Insignia tono="marino">
                      {documentos} {documentos === 1 ? 'archivo' : 'archivos'}
                    </Insignia>
                  ) : (
                    <span className="text-[var(--color-tinta-tenue)]">Sin documentos</span>
                  )}
                </td>
                <td className="px-3 py-2.5 align-top">
                  <Link
                    href={`/admin/directorio/solicitud/${alta.id}`}
                    className="cursor-pointer font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                  >
                    Revisar
                    <span className="sr-only"> la solicitud de {alta.nombre}</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TablaEnvoltura>
  );
}

export default async function PaginaAltasDirectorio() {
  // Frontera de verdad: sin sesión de personal esta página no se dibuja.
  await requerirStaff();

  const hoy = await fechaDeHoy();
  const altas = await repositorioDirectorio.listarAltas();

  // Antigüedad primero: la solicitud que más lleva esperando es la que peor
  // está, y es la que tiene que aparecer arriba.
  const pendientes = altas
    .filter((a) => PENDIENTES.has(a.estadoModeracion))
    .sort((a, b) => a.creadoEn.localeCompare(b.creadoEn));

  const resueltas = altas
    .filter((a) => !PENDIENTES.has(a.estadoModeracion))
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));

  const conDocumentos = pendientes.filter((a) => (a.documentos?.length ?? 0) > 0).length;
  const masVieja = pendientes[0];

  return (
    <>
      <EncabezadoSeccion
        titulo="Altas del directorio"
        descripcion="Las solicitudes que llegan por el formulario público de /directorio/alta. Cada una es trabajo de una persona: nada aquí se resuelve solo."
        etiqueta="Sólo personal"
      />

      <Nota tono="atencion" titulo="Qué significa aprobar aquí">
        <p>
          El perfil ya está publicado desde que se envió el formulario, marcado como{' '}
          <strong>«Sin verificar»</strong>. Aprobar no lo publica: le fija el nivel de verificación
          que corresponde a lo que revisaste, y ese nivel dice literalmente qué comprobaste y qué
          no.
        </p>
        <p>
          LeyAntilavado.org <strong>no certifica ni avala a ningún proveedor</strong>. El nivel más
          alto que puedes otorgar es &ldquo;Certificación externa revisada&rdquo;, y esa
          certificación es del tercero que la emitió, no nuestra.
        </p>
        <p>
          Rechazar despublica la ficha y deja constancia del motivo. No borra la solicitud ni el
          perfil: en este sistema nada se elimina.
        </p>
      </Nota>

      <RejillaTarjetas>
        <TarjetaMetrica
          etiqueta="Por revisar"
          valor={String(pendientes.length)}
          detalle="Pendientes y con corrección pedida"
        />
        <TarjetaMetrica
          etiqueta="Con documentos"
          valor={String(conDocumentos)}
          detalle="De las pendientes, cuántas subieron archivos"
        />
        <TarjetaMetrica
          etiqueta="Espera más larga"
          valor={masVieja ? `${diasEspera(masVieja.creadoEn, hoy)} d` : '—'}
          detalle={masVieja ? `Folio ${masVieja.folio}` : 'Nada esperando'}
        />
        <TarjetaMetrica
          etiqueta="Con decisión"
          valor={String(resueltas.length)}
          detalle="Aprobadas o rechazadas"
        />
      </RejillaTarjetas>

      <Seccion
        titulo="Por revisar"
        descripcion="Ordenadas por antigüedad: arriba la que lleva más tiempo esperando."
      >
        {pendientes.length > 0 ? (
          <TablaAltas altas={pendientes} hoy={hoy} etiqueta="Solicitudes por revisar" />
        ) : (
          <EstadoVacio
            titulo="No hay solicitudes por revisar"
            descripcion="Ninguna alta está pendiente. Si esperabas alguna, comprueba que el formulario de /directorio/alta esté escribiendo en .data en este entorno: esta pantalla no inventa filas para verse llena."
          />
        )}
      </Seccion>

      <Seccion
        titulo="Con decisión tomada"
        descripcion="El historial completo. Una solicitud rechazada sigue aquí con su motivo y su autor."
      >
        {resueltas.length > 0 ? (
          <TablaAltas altas={resueltas} hoy={hoy} etiqueta="Solicitudes ya resueltas" />
        ) : (
          <EstadoVacio
            titulo="Todavía no se ha decidido ninguna"
            descripcion="Cuando apruebes, rechaces o pidas una corrección, la solicitud aparecerá aquí con quién decidió y cuándo."
          />
        )}
      </Seccion>
    </>
  );
}
