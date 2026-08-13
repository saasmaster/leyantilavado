import type { Metadata } from 'next';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { SITIO, construirMetadata, jsonParaScript } from '@/lib/sitio';
import {
  CuentaRegresivaReglas,
  type ReglaConFecha,
  type ReglaSinFecha,
} from '@/components/CuentaRegresivaReglas';
import { Hero } from '@/components/inicio/Hero';
import { MapaDelSitio } from '@/components/inicio/MapaDelSitio';
import { QueEs } from '@/components/inicio/QueEs';
import { FuentesPrincipales } from '@/components/contenido/FuentesPrincipales';
import { Newsletter } from '@/components/inicio/Newsletter';

export const metadata: Metadata = construirMetadata({
  titulo: SITIO.nombre,
  descripcion: SITIO.descripcion,
  ruta: '/',
});

/**
 * Portada.
 *
 * Es un PUNTO DE ENTRADA, no un catálogo. Cada tema tiene su propia página con
 * el detalle completo; aquí sólo va lo que sirve de un vistazo: qué es esto,
 * cuánto falta para lo siguiente y a dónde ir.
 *
 * El contenido de las antiguas secciones inline vive ahora en:
 *   /reforma-ley-antilavado-2026 · /calendario-cumplimiento · /actividades-vulnerables
 *   /herramientas · /obligaciones · /umbrales · /directorio · /plataforma
 *   /fuentes-oficiales · /metodologia-editorial · /preguntas-frecuentes
 */

/** Datos planos y serializables: no se cruzan objetos del motor al cliente. */
const REGLAS: ReglaConFecha[] = datos.CALENDARIO.map((h) => ({
  id: h.id,
  fecha: h.fecha,
  fechaLarga: formatearFechaLarga(h.fecha),
  titulo: h.titulo,
  descripcion: h.descripcion,
  confirmadoOficialmente: h.confirmadoOficialmente,
  obligaciones: h.obligaciones.map(
    (slug) => datos.OBLIGACIONES_POR_SLUG[slug]?.titulo ?? slug,
  ),
}));

const SIN_FECHA: ReglaSinFecha[] = datos.PENDIENTES_SIN_FECHA.map((p) => ({
  id: p.id,
  titulo: p.titulo,
  descripcion: p.descripcion,
  motivo: `Fundamento: ${p.procedencia.disposicion}. Última revisión: ${p.ultimaRevision}.`,
}));

const ACTIVIDADES_BOLETIN = datos.ACTIVIDADES_PUBLICABLES.map((a) => ({
  slug: a.slug,
  nombre: `${a.nombreCorto} (fracción ${a.fraccion})`,
}));

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITIO.url}/#sitio`,
  name: SITIO.nombre,
  alternateName: 'Ley Antilavado México',
  url: SITIO.url,
  description: SITIO.descripcion,
  inLanguage: 'es-MX',
};

export default function Inicio() {
  // La hora se resuelve en el servidor y viaja como prop, para que el primer
  // render del cliente produzca exactamente el mismo HTML.
  const ahoraISO = new Date().toISOString();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonParaScript(JSON_LD) }}
      />

      <Hero />
      <QueEs />

      <CuentaRegresivaReglas
        reglas={REGLAS}
        sinFecha={SIN_FECHA}
        ahoraISO={ahoraISO}
        limite={3}
        verTodoHref="/calendario-cumplimiento"
        titulo="Lo siguiente que vence"
        descripcion="Las tres reglas más próximas del calendario 2026-2029. Las fechas son nominales: no las recorremos por días inhábiles sin una regla oficial que lo respalde."
      />

      <div className="contenedor-app">
        <FuentesPrincipales className="seccion border-t border-[var(--color-borde)] pt-12" />
      </div>

      <MapaDelSitio />

      <Newsletter actividades={ACTIVIDADES_BOLETIN} />
    </>
  );
}
