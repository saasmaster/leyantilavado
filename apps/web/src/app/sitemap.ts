import type { MetadataRoute } from 'next';
import { datos } from '@leyantilavado/rules-engine';
import { CATEGORIAS_PROVEEDOR } from '@leyantilavado/types';
import { SITIO } from '@/lib/sitio';

/**
 * Sitemap generado desde el motor de reglas, no escrito a mano.
 *
 * Consecuencia deliberada: si mañana se adiciona una fracción al art. 17, su
 * página aparece en el sitemap sola. Y si una actividad está marcada como no
 * verificada, NO aparece: no se pide indexar contenido que aún no confirmamos.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITIO.url;
  const hoy = new Date().toISOString().slice(0, 10);

  const entrada = (
    ruta: string,
    prioridad: number,
    frecuencia: MetadataRoute.Sitemap[number]['changeFrequency'],
  ) => ({
    url: `${base}${ruta}`,
    lastModified: hoy,
    changeFrequency: frecuencia,
    priority: prioridad,
  });

  const principales = [
    entrada('/', 1.0, 'weekly'),
    entrada('/actividades-vulnerables', 0.9, 'monthly'),
    entrada('/umbrales', 0.95, 'monthly'),
    entrada('/obligaciones', 0.9, 'monthly'),
    entrada('/limites-efectivo', 0.85, 'monthly'),
    entrada('/multas', 0.85, 'monthly'),
    entrada('/calendario-cumplimiento', 0.9, 'weekly'),
    entrada('/reforma-ley-antilavado-2026', 0.95, 'weekly'),
    entrada('/acuerdo-115-2026', 0.9, 'weekly'),
    entrada('/actualizaciones', 0.8, 'weekly'),
    entrada('/glosario', 0.7, 'monthly'),
    entrada('/preguntas-frecuentes', 0.85, 'monthly'),
    entrada('/herramientas', 0.9, 'monthly'),
    entrada('/plataforma', 0.8, 'monthly'),
    entrada('/directorio', 0.85, 'weekly'),
    entrada('/software-cumplimiento', 0.7, 'monthly'),
    entrada('/cursos', 0.6, 'monthly'),
    entrada('/plantillas', 0.6, 'monthly'),
    entrada('/precios', 0.7, 'monthly'),
    entrada('/fuentes-oficiales', 0.7, 'monthly'),
    entrada('/nosotros', 0.5, 'yearly'),
    entrada('/metodologia-editorial', 0.6, 'yearly'),
    entrada('/contacto', 0.5, 'yearly'),
  ];

  const herramientas = [
    'cuestionario',
    'calculadora-umbrales',
    'calculadora-uma',
    'acumulacion-operaciones',
    'limites-efectivo',
    'calculadora-multas',
    'fecha-limite-aviso',
    'beneficiario-controlador',
    'matriz-riesgos',
    'clasificacion-clientes',
    'checklist-expediente',
    'plan-cumplimiento',
    'comparador-obligaciones',
    'preparacion-auditoria',
    'mecanismos-automatizados',
    'capacitacion-anual',
    'importar-operaciones',
  ].map((h) => entrada(`/herramientas/${h}`, 0.85, 'monthly'));

  // Sólo las actividades cuya regla ya pasó verificación editorial.
  const actividades = datos.ACTIVIDADES_PUBLICABLES.map((a) =>
    entrada(`/actividades-vulnerables/${a.slug}`, 0.8, 'monthly'),
  );

  const obligaciones = datos.OBLIGACIONES.filter((o) => o.estado === 'publicado' || o.estado === 'revisado').map(
    (o) => entrada(`/obligaciones/${o.slug}`, 0.75, 'monthly'),
  );

  const categoriasDirectorio = CATEGORIAS_PROVEEDOR.map((c) =>
    entrada(`/directorio/${c}`, 0.7, 'weekly'),
  );

  const legales = [
    '/legal/aviso-de-privacidad',
    '/legal/terminos',
    '/legal/cookies',
    '/legal/publicidad',
  ].map((r) => entrada(r, 0.3, 'yearly'));

  return [
    ...principales,
    ...herramientas,
    ...actividades,
    ...obligaciones,
    ...categoriasDirectorio,
    ...legales,
  ];
}
