import type { MetadataRoute } from 'next';
import { datos } from '@leyantilavado/rules-engine';
import { CATEGORIAS_PROVEEDOR } from '@leyantilavado/types';
import { REVISION_VIGENTE } from '@/content/autores';
import { SITIO } from '@/lib/sitio';

/**
 * Sitemap generado desde el motor de reglas, no escrito a mano.
 *
 * Consecuencia deliberada: si mañana se adiciona una fracción al art. 17, su
 * página aparece en el sitemap sola. Y si una actividad está marcada como no
 * verificada, NO aparece: no se pide indexar contenido que aún no confirmamos.
 *
 * `lastModified` sale de la procedencia del dato, no de la fecha del build.
 * Antes era `new Date()` para las 93 URL, lo que hacía que cada despliegue
 * anunciara el sitio entero como modificado hoy. Un buscador que ve eso dos o
 * tres veces deja de creerle al campo —y entonces deja de creerle también el
 * día que una reforma sí cambia una tabla, que es justo el día que importa.
 * Ahora la fecha de `/umbrales` es la de la última revisión de sus reglas de
 * umbral, y la de cada actividad es la suya.
 */

/**
 * Para el sitemap importa cuándo **cambió** el dato, no cuándo se revisó.
 *
 * Son campos distintos justamente por esto: una pasada editorial que confirma
 * que nada cambió no debe anunciar 97 URL como modificadas. `ultimaRevision`
 * queda como respaldo para datos que aún no declaran su fecha de modificación.
 */
type ConProcedencia = {
  procedencia: { ultimaRevision: string; ultimaModificacion?: string };
};

function modificadoEn(item: ConProcedencia): string {
  return item.procedencia.ultimaModificacion ?? item.procedencia.ultimaRevision;
}

/**
 * Revisión más reciente de un conjunto de datos del motor.
 *
 * Las fechas son ISO `YYYY-MM-DD`, así que comparar cadenas basta y evita
 * construir objetos `Date` sólo para ordenarlas.
 */
function revisionDe(items: readonly ConProcedencia[]): string {
  let max = '';
  for (const item of items) {
    const f = modificadoEn(item);
    if (f > max) max = f;
  }
  return max || REVISION_VIGENTE;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITIO.url;

  const entrada = (
    ruta: string,
    prioridad: number,
    frecuencia: MetadataRoute.Sitemap[number]['changeFrequency'],
    modificado: string = REVISION_VIGENTE,
  ) => ({
    url: `${base}${ruta}`,
    lastModified: modificado,
    changeFrequency: frecuencia,
    priority: prioridad,
  });

  const revUmbrales = revisionDe(datos.UMBRALES_PUBLICADOS);
  const revActividades = revisionDe(datos.ACTIVIDADES_PUBLICABLES);
  const revEfectivo = revisionDe(datos.REGLAS_EFECTIVO_PUBLICADAS);
  const revSanciones = revisionDe(datos.SANCIONES);
  const revCalendario = revisionDe(datos.CALENDARIO);

  const obligacionesPublicadas = datos.OBLIGACIONES.filter(
    (o) => o.estado === 'publicado' || o.estado === 'revisado',
  );
  const revObligaciones = revisionDe(obligacionesPublicadas);

  const principales = [
    entrada('/', 1.0, 'weekly'),
    entrada('/actividades-vulnerables', 0.9, 'monthly', revActividades),
    entrada('/umbrales', 0.95, 'monthly', revUmbrales),
    entrada('/obligaciones', 0.9, 'monthly', revObligaciones),
    entrada('/limites-efectivo', 0.85, 'monthly', revEfectivo),
    entrada('/multas', 0.85, 'monthly', revSanciones),
    entrada('/calendario-cumplimiento', 0.9, 'weekly', revCalendario),
    entrada('/reforma-ley-antilavado-2026', 0.95, 'weekly'),
    entrada('/acuerdo-115-2026', 0.9, 'weekly'),
    entrada('/actualizaciones', 0.8, 'weekly'),
    entrada('/glosario', 0.7, 'monthly'),
    entrada('/preguntas-frecuentes', 0.85, 'monthly'),
    entrada('/herramientas', 0.9, 'monthly'),
    entrada('/plataforma', 0.8, 'monthly'),
    entrada('/directorio', 0.85, 'weekly'),
    entrada('/directorio/alta', 0.4, 'monthly'),
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
  const actividades = datos.ACTIVIDADES.map((a) =>
    entrada(`/actividades-vulnerables/${a.slug}`, 0.8, 'monthly', modificadoEn(a)),
  );

  const obligaciones = obligacionesPublicadas.map((o) =>
    entrada(`/obligaciones/${o.slug}`, 0.75, 'monthly', modificadoEn(o)),
  );

  const categoriasDirectorio = CATEGORIAS_PROVEEDOR.map((c) =>
    entrada(`/directorio/${c}`, 0.7, 'weekly'),
  );

  const legales = [
    '/legal/aviso-de-privacidad',
    '/legal/terminos',
    '/legal/cookies',
    '/legal/publicidad',
    // La política de la app Android no está en el menú ni en el pie, por
    // decisión de producto. Va aquí de todos modos: Google Play exige una URL
    // pública y estable, y una página sin un solo enlace entrante queda
    // huérfana —imposible de encontrar y de comprobar por quien revisa la
    // ficha—.
    '/legal/privacidad-app',
    // Misma razón para la extensión de Chrome: la Web Store exige una URL
    // pública y estable, y sin un enlace entrante la página es incomprobable.
    '/legal/privacidad-catalogos-sat',
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
