/**
 * Genera `supabase/seed.sql` a partir de `packages/rules-engine/src/datos`.
 *
 * Por qué un generador y no un SQL escrito a mano: los datos legales ya viven
 * en el motor, que es la fuente de verdad y tiene pruebas. Transcribirlos a
 * mano a SQL crearía una segunda copia que se desincroniza al primer cambio de
 * la UMA, y una UMA desincronizada calcula mal todos los umbrales.
 *
 * Uso (desde la raíz del repo):
 *   npx esbuild supabase/scripts/generar-seed.ts --bundle --platform=node \
 *     --format=esm --outfile=.seed.mjs && node .seed.mjs && rm .seed.mjs
 *
 * o simplemente:  node supabase/scripts/generar-seed.mjs   (ver README)
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { datos, VERSION_LEGAL } from '@leyantilavado/rules-engine';
import { CATEGORIAS_PROVEEDOR } from '@leyantilavado/types';

/* ── Escapado ────────────────────────────────────────────────────────────── */

const txt = (v: string | null | undefined): string =>
  v === null || v === undefined ? 'null' : `'${v.replace(/'/g, "''")}'`;

const arr = (v: readonly string[] | undefined): string =>
  !v || v.length === 0 ? `'{}'` : `array[${v.map((x) => txt(x)).join(',')}]::text[]`;

const json = (v: unknown): string =>
  v === undefined || v === null ? 'null' : `${txt(JSON.stringify(v))}::jsonb`;

const fecha = (v: string | null | undefined): string => (v ? `'${v}'::date` : 'null');
const num = (v: number | null | undefined): string =>
  v === null || v === undefined ? 'null' : String(v);

/** Genera `insert ... on conflict (pk) do update set ...` idempotente. */
function upsert(
  tabla: string,
  pk: string[],
  columnas: string[],
  filas: string[][],
): string {
  if (filas.length === 0) return `-- ${tabla}: sin datos semilla\n`;
  const set = columnas
    .filter((c) => !pk.includes(c))
    .map((c) => `  ${c} = excluded.${c}`)
    .join(',\n');
  return (
    `insert into public.${tabla} (${columnas.join(', ')}) values\n` +
    filas.map((f) => `  (${f.join(', ')})`).join(',\n') +
    `\non conflict (${pk.join(', ')}) do update set\n${set};\n`
  );
}

/* ── Bloques ─────────────────────────────────────────────────────────────── */

const bloques: string[] = [];

bloques.push(`-- ============================================================================
-- seed.sql — GENERADO AUTOMÁTICAMENTE. No lo edites a mano.
--
-- Fuente: packages/rules-engine/src/datos/*.ts
-- Regenerar: ver la sección "Regenerar seed.sql" de supabase/README.md
-- Versión del corpus legal: ${VERSION_LEGAL}
--
-- Es idempotente: se puede correr las veces que haga falta. Cada ejecución
-- deja rastro en content_revisions gracias a los triggers de la migración 0010,
-- que es exactamente lo que se quiere: sembrar también es un cambio.
-- ============================================================================

-- El motivo del cambio viaja en una variable de sesión y lo recoge el trigger
-- de versionado.
select set_config('app.motivo_cambio', 'Carga de datos semilla desde el motor jurídico ${VERSION_LEGAL}', false);
`);

/* legal_versions */
bloques.push(
  upsert(
    'legal_versions',
    ['version'],
    ['version', 'published_at', 'valid_from', 'valid_to', 'description', 'is_current'],
    [
      [
        txt(VERSION_LEGAL),
        fecha('2026-08-11'),
        fecha('2026-08-11'),
        'null',
        txt('Corpus legal compilado por LeyAntilavado.org: LFPIORPI vigente, reforma de julio de 2025, Reglamento reformado en marzo de 2026 y Acuerdo 115/2026.'),
        'true',
      ],
    ],
  ),
);

/* legal_sources */
bloques.push(
  upsert(
    'legal_sources',
    ['id'],
    // `content_hash`, `http_status` y `last_checked_at` NO se siembran: son
    // estado del monitor regulatorio y volver a sembrarlos borraría la última
    // huella conocida, haciendo que el siguiente barrido reportara "cambió"
    // en todas las fuentes.
    ['id', 'name', 'issuer', 'url', 'description', 'published_at', 'last_review_at'],
    datos.FUENTES.map((f) => [
      txt(f.id),
      txt(f.nombre),
      txt(f.emisor),
      txt(f.url),
      txt(f.descripcion),
      fecha(f.fechaPublicacion),
      fecha(f.ultimaRevision),
    ]),
  ),
);

/* uma_values */
bloques.push(
  upsert(
    'uma_values',
    ['year'],
    ['year', 'daily_cents', 'valid_from', 'valid_to', 'source_ids', 'provision', 'verification', 'last_review_at', 'editorial_note', 'status'],
    datos.VALORES_UMA.map((u) => [
      num(u.anio),
      num(u.diariaCentavos),
      fecha(u.vigencia.desde),
      fecha(u.vigencia.hasta ?? `${u.anio + 1}-01-31`),
      arr(u.procedencia.fuentes),
      txt(u.procedencia.disposicion),
      txt(u.procedencia.verificacion),
      fecha(u.procedencia.ultimaRevision),
      txt(u.procedencia.notaEditorial ?? null),
      txt('publicado'),
    ]),
  ),
);

/* vulnerable_activities */
bloques.push(
  upsert(
    'vulnerable_activities',
    ['slug'],
    ['slug', 'fraction', 'name', 'short_name', 'description', 'subject_examples', 'source_ids', 'provision', 'verification', 'last_review_at', 'editorial_note', 'status', 'sort_order'],
    datos.ACTIVIDADES.map((a, i) => [
      txt(a.slug),
      txt(a.fraccion),
      txt(a.nombre),
      txt(a.nombreCorto),
      txt(a.descripcion),
      arr(a.ejemplosSujetos),
      arr(a.procedencia.fuentes),
      txt(a.procedencia.disposicion),
      txt(a.procedencia.verificacion),
      fecha(a.procedencia.ultimaRevision),
      txt(a.procedencia.notaEditorial ?? null),
      txt('publicado'),
      num(i),
    ]),
  ),
);

/* activity_subtypes */
const subtipos = datos.ACTIVIDADES.flatMap((a) =>
  (a.subtipos ?? []).map((s) => [txt(a.slug), txt(s.slug), txt(s.nombre), txt(s.descripcion)]),
);
bloques.push(
  upsert('activity_subtypes', ['activity_slug', 'slug'], ['activity_slug', 'slug', 'name', 'description'], subtipos),
);

/* threshold_rules */
bloques.push(
  upsert(
    'threshold_rules',
    ['id'],
    ['id', 'activity_slug', 'subtype', 'identification_spec', 'notice_spec', 'periodicity', 'valid_from', 'valid_to', 'source_ids', 'provision', 'verification', 'last_review_at', 'reviewed_by', 'editorial_note', 'status'],
    datos.UMBRALES.map((r) => [
      txt(r.id),
      txt(r.actividad),
      txt(r.subtipo ?? null),
      json(r.identificacion),
      json(r.aviso),
      txt(r.periodicidad),
      fecha(r.vigencia.desde),
      fecha(r.vigencia.hasta),
      arr(r.procedencia.fuentes),
      txt(r.procedencia.disposicion),
      txt(r.procedencia.verificacion),
      fecha(r.procedencia.ultimaRevision),
      txt(r.procedencia.revisadoPor ?? null),
      txt(r.procedencia.notaEditorial ?? null),
      txt(r.estado),
    ]),
  ),
);

/* accumulation_rules (las del corpus, sin organización) */
const acumulacion = datos.UMBRALES.filter((r) => r.acumulacion.aplica).map((r) => [
  txt(r.id),
  'null',
  'true',
  num(r.acumulacion.ventanaMeses),
  arr(r.acumulacion.agrupaPor),
  txt(r.acumulacion.nota ?? 'Regla del corpus legal: ventana móvil de acumulación por cliente.'),
  arr(r.procedencia.fuentes),
]);
bloques.push(`-- Reglas de acumulación del corpus (organization_id nulo = aplican a todas).
insert into public.accumulation_rules (threshold_rule_id, organization_id, applies, window_months, group_by, note, source_ids)
${acumulacion.length === 0 ? 'select null, null, null, null, null, null, null where false;' : `values\n${acumulacion.map((f) => `  (${f.join(', ')})`).join(',\n')}\non conflict do nothing;`}
`);

/* cash_restriction_rules */
bloques.push(
  upsert(
    'cash_restriction_rules',
    ['id'],
    ['id', 'slug', 'name', 'description', 'activities', 'limit_uma', 'periodicity', 'discrepancy', 'valid_from', 'valid_to', 'source_ids', 'provision', 'verification', 'last_review_at', 'editorial_note', 'status'],
    datos.REGLAS_EFECTIVO.map((r) => [
      txt(r.id),
      txt(r.slug),
      txt(r.nombre),
      txt(r.descripcion),
      arr(r.actividades),
      num(r.limiteUMA),
      txt(r.periodicidad),
      json(r.discrepanciaOficial),
      fecha(r.vigencia.desde),
      fecha(r.vigencia.hasta),
      arr(r.procedencia.fuentes),
      txt(r.procedencia.disposicion),
      txt(r.procedencia.verificacion),
      fecha(r.procedencia.ultimaRevision),
      txt(r.procedencia.notaEditorial ?? null),
      txt(r.estado),
    ]),
  ),
);

/* sanctions */
bloques.push(
  upsert(
    'sanctions',
    ['id'],
    ['id', 'article', 'fraction', 'scenario', 'min_uma', 'max_uma', 'min_percent', 'max_percent', 'severity', 'notes', 'valid_from', 'valid_to', 'source_ids', 'provision', 'verification', 'last_review_at', 'editorial_note', 'status'],
    datos.SANCIONES.map((s) => [
      txt(s.id),
      txt(s.articulo),
      txt(s.fraccion ?? null),
      txt(s.supuesto),
      num(s.minUMA),
      num(s.maxUMA),
      num(s.alternativaPorcentaje?.minPct),
      num(s.alternativaPorcentaje?.maxPct),
      txt(s.gravedad),
      txt(s.notas ?? null),
      fecha(s.vigencia.desde),
      fecha(s.vigencia.hasta),
      arr(s.procedencia.fuentes),
      txt(s.procedencia.disposicion),
      txt(s.procedencia.verificacion),
      fecha(s.procedencia.ultimaRevision),
      txt(s.procedencia.notaEditorial ?? null),
      txt(s.estado),
    ]),
  ),
);

/* obligations */
bloques.push(
  upsert(
    'obligations',
    ['slug'],
    ['slug', 'title', 'summary', 'category', 'activities', 'steps', 'due_date', 'recurrence', 'source_ids', 'provision', 'verification', 'last_review_at', 'editorial_note', 'status', 'sort_order'],
    datos.OBLIGACIONES.map((o, i) => [
      txt(o.slug),
      txt(o.titulo),
      txt(o.resumen),
      txt(o.categoria),
      arr(o.actividades),
      json(o.pasos),
      fecha(o.fechaLimite),
      txt(o.recurrencia ?? null),
      arr(o.procedencia.fuentes),
      txt(o.procedencia.disposicion),
      txt(o.procedencia.verificacion),
      fecha(o.procedencia.ultimaRevision),
      txt(o.procedencia.notaEditorial ?? null),
      txt(o.estado),
      num(i),
    ]),
  ),
);

/* deadlines */
bloques.push(
  upsert(
    'deadlines',
    ['id'],
    ['id', 'due_date', 'end_date', 'title', 'description', 'obligations', 'officially_confirmed', 'source_ids', 'provision', 'verification', 'last_review_at', 'editorial_note', 'status'],
    datos.CALENDARIO.map((h) => [
      txt(h.id),
      fecha(h.fecha),
      fecha(h.fechaFin),
      txt(h.titulo),
      txt(h.descripcion),
      arr(h.obligaciones),
      String(h.confirmadoOficialmente),
      arr(h.procedencia.fuentes),
      txt(h.procedencia.disposicion),
      txt(h.procedencia.verificacion),
      fecha(h.procedencia.ultimaRevision),
      txt(h.procedencia.notaEditorial ?? null),
      txt(h.estado),
    ]),
  ),
);

/* provider_categories */
const NOMBRE_CATEGORIA: Record<string, string> = {
  contadores: 'Contadores públicos',
  abogados: 'Abogados',
  'consultores-pld': 'Consultores en PLD',
  'auditores-externos': 'Auditores externos',
  'auditores-internos': 'Auditores internos',
  capacitadores: 'Capacitadores',
  'proveedores-kyc': 'Proveedores de KYC',
  'consulta-pep-listas': 'Consulta de PEP y listas',
  'software-cumplimiento': 'Software de cumplimiento',
  'despachos-multidisciplinarios': 'Despachos multidisciplinarios',
};

bloques.push(
  upsert(
    'provider_categories',
    ['slug'],
    ['slug', 'name', 'description', 'sort_order'],
    CATEGORIAS_PROVEEDOR.map((c, i) => [
      txt(c),
      txt(NOMBRE_CATEGORIA[c] ?? c),
      txt(''),
      num(i),
    ]),
  ),
);

/* Banderas de funcionalidad */
bloques.push(`insert into public.feature_flags (key, description, enabled) values
  ('directorio_publico', 'Muestra el directorio profesional en el sitio público.', false),
  ('tienda_plantillas', 'Habilita la descarga de plantillas de pago.', false),
  ('area_privada', 'Habilita el registro abierto en el área privada de cumplimiento.', false),
  ('monitor_regulatorio', 'Ejecuta el monitor de fuentes oficiales por tarea programada.', true)
on conflict (key) do nothing;
`);

bloques.push(`select set_config('app.motivo_cambio', '', false);\n`);

// Se escribe relativo al directorio de trabajo (la raíz del repo) y no a
// `import.meta.dirname`, porque el script se ejecuta empaquetado por esbuild
// desde una ruta temporal.
const destino = process.argv[2] ?? resolve(process.cwd(), 'supabase', 'seed.sql');
writeFileSync(destino, bloques.join('\n'), 'utf8');
process.stdout.write(`seed.sql generado en ${destino}\n`);
