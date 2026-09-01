import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { formatearMXN } from '@leyantilavado/types';
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
import { BandaParalaje } from '@/components/contenido/BandaParalaje';
import umaPizarron from '../../public/img/editorial/uma-pizarron.webp';

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
  motivo: `Fundamento: ${p.procedencia.disposicion}. Última revisión: ${formatearFechaLarga(p.ultimaRevision)}.`,
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
  const umaMasReciente = datos.UMA_VIGENTE_MAS_RECIENTE;
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

      {/*
        * El único momento a sangre de la portada.
        *
        * Va aquí y no arriba: el hero ya tiene su imagen, y dos bandas grandes
        * seguidas se anulan. Aparece después de las fechas que vencen, cuando
        * el lector ya entendió que hay plazos, para explicarle la unidad con la
        * que se miden.
        *
        * La cifra sale del motor. Escribirla a mano en la portada sería el
        * error que este sitio le señala a todos los demás: el 1 de febrero
        * quedaría vieja y nadie se enteraría.
        */}
      <BandaParalaje imagen={umaPizarron} alt="">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Todo se mide en UMA, y la UMA cambia cada 1 de febrero
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[color-mix(in_srgb,white_86%,transparent)]">
            Los umbrales de la Ley Antilavado no están en pesos: están en veces la Unidad de Medida
            y Actualización. Una operación del 15 de enero se mide con la UMA del año anterior, no
            con la del año en curso. Es el error más repetido de las tablas que circulan cada enero.
          </p>
          <p className="mt-5 text-[color-mix(in_srgb,white_78%,transparent)]">
            UMA diaria más reciente registrada:{' '}
            <strong className="cifra font-semibold text-white">
              {formatearMXN(umaMasReciente.diariaCentavos)}
            </strong>{' '}
            ({umaMasReciente.anio}).
          </p>
          <Link
            href="/herramientas/calculadora-uma"
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-white px-5 font-medium text-[var(--color-marino)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            Convertir UMA a pesos por fecha
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </BandaParalaje>

      <div className="contenedor-app">
        <FuentesPrincipales className="seccion border-t border-[var(--color-borde)] pt-12" />
      </div>

      <MapaDelSitio />

      <Newsletter actividades={ACTIVIDADES_BOLETIN} />
    </>
  );
}
