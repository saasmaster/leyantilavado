import { ANIOS_UMA_DISPONIBLES, VERSION_LEGAL, convertirUMA, datos } from '@leyantilavado/rules-engine';
import { SITIO } from '@/lib/sitio';
import { REVISION_VIGENTE } from '@/content/autores';

/**
 * Datos abiertos: la tabla de umbrales y el histórico de la UMA, en CSV y JSON.
 *
 * Existe por dos motivos que apuntan al mismo sitio.
 *
 * El primero es que un dato que sólo se puede leer en una tabla HTML no se
 * puede reutilizar: quien quiera comprobar nuestras cifras, cruzarlas con las
 * suyas o citarlas en un artículo tiene que teclearlas a mano. Publicarlas en
 * un formato que se abre en cualquier hoja de cálculo elimina esa fricción, y
 * de paso hace que el sitio sea verificable en vez de sólo consultable.
 *
 * El segundo es que un dataset es la clase de recurso que otros enlazan. Nadie
 * enlaza «una página sobre umbrales»; sí se enlaza «la tabla de umbrales
 * 2016-2026 en CSV». La diferencia entre publicar información y publicar un
 * activo es exactamente ésta.
 *
 * Se sirve con licencia explícita y con la versión del corpus impresa dentro
 * del propio archivo: si alguien lo descarga hoy y lo cita en dos años, el
 * archivo mismo dice contra qué se generó.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [
    { archivo: 'umbrales.csv' },
    { archivo: 'umbrales.json' },
    { archivo: 'uma.csv' },
    { archivo: 'uma.json' },
  ];
}

/** Se cita con CC BY 4.0: reutilizable, con atribución. */
export const LICENCIA = 'https://creativecommons.org/licenses/by/4.0/deed.es';

const BOM = '﻿';

function campo(v: string | number | null): string {
  const t = v === null ? '' : String(v);
  return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

const csv = (filas: readonly (readonly (string | number | null)[])[]): string =>
  BOM + filas.map((f) => f.map(campo).join(',')).join('\r\n') + '\r\n';

/** Un umbral puede no ser un número. Se aplana con su tipo a la vista. */
function describir(e: {
  tipo: string;
  uma?: number;
  umaMonto?: number;
  umaComision?: number;
  nota?: string;
}): { tipo: string; uma: number | null; nota: string } {
  if (e.tipo === 'uma') return { tipo: 'uma', uma: e.uma ?? null, nota: e.nota ?? '' };
  if (e.tipo === 'monto_o_comision') {
    return {
      tipo: 'monto_o_comision',
      uma: e.umaMonto ?? null,
      nota: `Contraprestación: ${e.umaComision ?? '—'} UMA. ${e.nota ?? ''}`.trim(),
    };
  }
  return { tipo: e.tipo, uma: null, nota: e.nota ?? '' };
}

function filasUmbrales() {
  const anio = ANIOS_UMA_DISPONIBLES[0] ?? 2026;
  const fecha = `${anio}-06-15`;
  return datos.UMBRALES.map((u) => {
    const ident = describir(u.identificacion as never);
    const aviso = describir(u.aviso as never);
    const pesos = (uma: number | null) =>
      uma === null ? null : convertirUMA(uma, fecha).equivalentePesos / 100;
    return {
      actividad: u.actividad,
      subtipo: u.subtipo ?? '',
      fraccion: datos.ACTIVIDADES.find((a) => a.slug === u.actividad)?.fraccion ?? '',
      identificacion_tipo: ident.tipo,
      identificacion_uma: ident.uma,
      identificacion_mxn: pesos(ident.uma),
      identificacion_nota: ident.nota,
      aviso_tipo: aviso.tipo,
      aviso_uma: aviso.uma,
      aviso_mxn: pesos(aviso.uma),
      aviso_nota: aviso.nota,
      estado: u.estado,
      disposicion: u.procedencia.disposicion,
      verificacion: u.procedencia.verificacion,
      ultima_revision: u.procedencia.ultimaRevision,
      vigente_desde: u.vigencia.desde,
      vigente_hasta: u.vigencia.hasta ?? '',
    };
  });
}

function respuesta(cuerpo: string, tipo: string, archivo: string): Response {
  return new Response(cuerpo, {
    headers: {
      'content-type': tipo,
      'content-disposition': `attachment; filename="${archivo}"`,
      // Descargable pero fuera del índice: el archivo no debe competir en
      // resultados contra la página que lo explica.
      'x-robots-tag': 'noindex',
      'cache-control': 'public, max-age=3600',
      // Se publica para que otros lo usen; sin CORS, un sitio que quiera
      // graficarlo tendría que copiarlo, y ahí se desactualiza.
      'access-control-allow-origin': '*',
      'x-license': LICENCIA,
    },
  });
}

const GENERADORES: Record<string, () => Response> = {
  'umbrales.csv': () => {
    const filas = filasUmbrales();
    const cabecera = Object.keys(filas[0] ?? {});
    return respuesta(
      csv([
        [`# Umbrales de la LFPIORPI · ${SITIO.url}`],
        [`# Corpus ${VERSION_LEGAL} · revisado al ${REVISION_VIGENTE}`],
        [`# Pesos calculados con la UMA de ${ANIOS_UMA_DISPONIBLES[0]}`],
        [`# Licencia CC BY 4.0 — ${LICENCIA}`],
        [''],
        cabecera,
        ...filas.map((f) => Object.values(f) as (string | number | null)[]),
      ]),
      'text/csv; charset=utf-8',
      'umbrales-lfpiorpi.csv',
    );
  },

  'umbrales.json': () =>
    respuesta(
      JSON.stringify(
        {
          fuente: SITIO.url,
          version: VERSION_LEGAL,
          revisadoEn: REVISION_VIGENTE,
          licencia: LICENCIA,
          atribucion: `Datos de ${SITIO.nombre} (${SITIO.url})`,
          umaDeReferencia: ANIOS_UMA_DISPONIBLES[0],
          totalRegistros: datos.UMBRALES.length,
          registrosVerificados: datos.UMBRALES_PUBLICADOS.length,
          umbrales: filasUmbrales(),
        },
        null,
        2,
      ),
      'application/json; charset=utf-8',
      'umbrales-lfpiorpi.json',
    ),

  'uma.csv': () =>
    respuesta(
      csv([
        [`# Valores de la UMA · ${SITIO.url}`],
        [`# Licencia CC BY 4.0 — ${LICENCIA}`],
        [''],
        // Sólo el valor diario: es el único que el corpus tiene verificado
        // contra fuente. Los valores mensual y anual se derivan del diario por
        // convención del INEGI, y publicarlos aquí como si fueran dato de
        // origen los convertiría en una cifra nuestra, no suya.
        ['anio', 'diaria_mxn', 'vigente_desde', 'vigente_hasta'],
        ...datos.VALORES_UMA.map((u) => [
          u.anio,
          u.diariaCentavos / 100,
          u.vigencia.desde,
          u.vigencia.hasta ?? '',
        ]),
      ]),
      'text/csv; charset=utf-8',
      'uma-historico.csv',
    ),

  'uma.json': () =>
    respuesta(
      JSON.stringify(
        {
          fuente: SITIO.url,
          licencia: LICENCIA,
          atribucion: `Datos de ${SITIO.nombre} (${SITIO.url})`,
          nota: 'La UMA entra en vigor el 1 de febrero de cada año. Una operación de enero se mide con la del año anterior.',
          valores: datos.VALORES_UMA.map((u) => ({
            anio: u.anio,
            diariaMXN: u.diariaCentavos / 100,
            vigenciaDesde: u.vigencia.desde,
            vigenciaHasta: u.vigencia.hasta,
          })),
        },
        null,
        2,
      ),
      'application/json; charset=utf-8',
      'uma-historico.json',
    ),
};

export async function GET(
  _p: Request,
  { params }: { params: Promise<{ archivo: string }> },
): Promise<Response> {
  const { archivo } = await params;
  const generar = GENERADORES[archivo];
  if (!generar) {
    return new Response('No encontrado.', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
  return generar();
}
