-- ============================================================================
-- 0004 · Corpus legal
--
-- Estas tablas son el espejo persistente de `packages/rules-engine/src/datos`.
-- El motor sigue siendo la fuente de verdad en tiempo de ejecución (es puro y
-- versionado); la base guarda el historial editorial: quién cambió una regla,
-- cuándo, por qué y contra qué fuente.
--
-- REGLA DURA: ninguna regla histórica se sobreescribe en silencio. Lo garantiza
-- el trigger `versionar_contenido` de la migración 0010, no la aplicación.
-- ============================================================================

-- ── legal_sources ───────────────────────────────────────────────────────────
create table if not exists public.legal_sources (
  id            text primary key,
  name          text not null,
  issuer        text not null check (issuer in ('DOF','SAT','SHCP','UIF','INEGI','Cámara de Diputados','Otro')),
  url           text not null,
  description   text not null default '',
  published_at  date,
  -- Monitor regulatorio: última comprobación, estado HTTP y huella SHA-256.
  content_hash  text,
  http_status   int,
  last_checked_at timestamptz,
  last_change_at  timestamptz,
  last_review_at  date,
  monitor_enabled boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create trigger legal_sources_set_updated_at before update on public.legal_sources
  for each row execute function public.set_updated_at();

-- ── legal_versions ──────────────────────────────────────────────────────────
create table if not exists public.legal_versions (
  id             uuid primary key default gen_random_uuid(),
  version        text not null unique,
  published_at   date not null,
  valid_from     date not null,
  valid_to       date,
  description    text not null default '',
  is_current     boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (valid_to is null or valid_to >= valid_from)
);

create unique index if not exists legal_versions_una_vigente
  on public.legal_versions (is_current) where is_current;

create trigger legal_versions_set_updated_at before update on public.legal_versions
  for each row execute function public.set_updated_at();

-- ── uma_values ──────────────────────────────────────────────────────────────
-- La UMA entra en vigor el 1 de febrero. Una operación del 15 de enero de 2026
-- se mide con la UMA de 2025: por eso se guarda la vigencia, no sólo el año.
create table if not exists public.uma_values (
  year            int primary key check (year between 2016 and 2100),
  daily_cents     public.centavos not null,
  valid_from      date not null,
  valid_to        date not null,
  source_ids      text[] not null default '{}',
  provision       text not null default '',
  verification    text not null default 'no_verificado'
                  check (verification in ('oficial_verificado','oficial_no_accesible','fuente_secundaria','no_verificado')),
  last_review_at  date,
  editorial_note  text,
  status          text not null default 'borrador'
                  check (status in ('borrador','revisado','publicado','sustituido')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (valid_to >= valid_from)
);

create trigger uma_values_set_updated_at before update on public.uma_values
  for each row execute function public.set_updated_at();

-- ── vulnerable_activities ───────────────────────────────────────────────────
create table if not exists public.vulnerable_activities (
  slug            text primary key,
  fraction        text not null,
  name            text not null,
  short_name      text not null,
  description     text not null default '',
  subject_examples text[] not null default '{}',
  source_ids      text[] not null default '{}',
  provision       text not null default '',
  verification    text not null default 'no_verificado'
                  check (verification in ('oficial_verificado','oficial_no_accesible','fuente_secundaria','no_verificado')),
  last_review_at  date,
  editorial_note  text,
  status          text not null default 'borrador'
                  check (status in ('borrador','revisado','publicado','sustituido')),
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger vulnerable_activities_set_updated_at before update on public.vulnerable_activities
  for each row execute function public.set_updated_at();

-- ── activity_subtypes ───────────────────────────────────────────────────────
create table if not exists public.activity_subtypes (
  id            uuid primary key default gen_random_uuid(),
  activity_slug text not null references public.vulnerable_activities (slug) on delete cascade,
  slug          text not null,
  name          text not null,
  description   text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (activity_slug, slug)
);

create index if not exists activity_subtypes_activity_idx on public.activity_subtypes (activity_slug);

create trigger activity_subtypes_set_updated_at before update on public.activity_subtypes
  for each row execute function public.set_updated_at();

-- ── threshold_rules ─────────────────────────────────────────────────────────
-- `identification_spec` y `notice_spec` guardan el JSON de `EspecificacionUmbral`
-- tal cual: es una unión discriminada de seis casos (siempre / nunca / uma /
-- monto_o_comision / variable / requiere_revision) y aplanarla a un número
-- perdería justo los casos que no son números, que son los del notario.
create table if not exists public.threshold_rules (
  id                  text primary key,
  activity_slug       text not null references public.vulnerable_activities (slug) on delete cascade,
  subtype             text,
  identification_spec jsonb not null,
  notice_spec         jsonb not null,
  periodicity         text not null check (periodicity in ('operacion','mensual','semestral','anual')),
  accumulation_rule_id uuid,
  valid_from          date not null,
  valid_to            date,
  source_ids          text[] not null default '{}',
  provision           text not null default '',
  verification        text not null default 'no_verificado'
                      check (verification in ('oficial_verificado','oficial_no_accesible','fuente_secundaria','no_verificado')),
  last_review_at      date,
  reviewed_by         text,
  editorial_note      text,
  status              text not null default 'borrador'
                      check (status in ('borrador','revisado','publicado','sustituido')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (identification_spec ? 'tipo'),
  check (notice_spec ? 'tipo'),
  check (valid_to is null or valid_to >= valid_from)
);

create index if not exists threshold_rules_activity_idx on public.threshold_rules (activity_slug);
create index if not exists threshold_rules_vigencia_idx on public.threshold_rules (valid_from, valid_to);
create index if not exists threshold_rules_status_idx on public.threshold_rules (status);

create trigger threshold_rules_set_updated_at before update on public.threshold_rules
  for each row execute function public.set_updated_at();

-- ── accumulation_rules ──────────────────────────────────────────────────────
-- La regla antifraccionamiento: seis meses móviles, agrupando por cliente y
-- tipo de acto.
create table if not exists public.accumulation_rules (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  threshold_rule_id text references public.threshold_rules (id) on delete cascade,
  applies         boolean not null default true,
  window_months   int not null default 6 check (window_months between 1 and 60),
  group_by        text[] not null default array['cliente','actividad'],
  note            text,
  -- Mecanismo automatizado: quién lo activó, con qué versión y por qué.
  author_id       uuid references public.users (id) on delete set null,
  version         int not null default 1,
  activated_at    timestamptz,
  reason          text,
  source_ids      text[] not null default '{}',
  test_result     jsonb,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists accumulation_rules_organization_idx on public.accumulation_rules (organization_id);
create index if not exists accumulation_rules_threshold_idx on public.accumulation_rules (threshold_rule_id);

-- Una sola regla de corpus (sin organización) por umbral: hace idempotente la
-- carga de `seed.sql`, que si no duplicaría filas en cada ejecución.
create unique index if not exists accumulation_rules_corpus_unica
  on public.accumulation_rules (threshold_rule_id) where organization_id is null;

create trigger accumulation_rules_set_updated_at before update on public.accumulation_rules
  for each row execute function public.set_updated_at();

-- ── cash_restriction_rules (art. 32) ────────────────────────────────────────
create table if not exists public.cash_restriction_rules (
  id            text primary key,
  slug          text not null unique,
  name          text not null,
  description   text not null default '',
  activities    text[] not null default '{}',
  limit_uma     numeric(12,2) not null check (limit_uma >= 0),
  periodicity   text not null check (periodicity in ('operacion','mensual','semestral','anual')),
  -- Cuando dos fuentes oficiales publican cifras distintas NO se elige una en
  -- silencio: se guardan las dos y la regla se queda en borrador.
  discrepancy   jsonb,
  valid_from    date not null,
  valid_to      date,
  source_ids    text[] not null default '{}',
  provision     text not null default '',
  verification  text not null default 'no_verificado'
                check (verification in ('oficial_verificado','oficial_no_accesible','fuente_secundaria','no_verificado')),
  last_review_at date,
  editorial_note text,
  status        text not null default 'borrador'
                check (status in ('borrador','revisado','publicado','sustituido')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (valid_to is null or valid_to >= valid_from)
);

create trigger cash_restriction_rules_set_updated_at before update on public.cash_restriction_rules
  for each row execute function public.set_updated_at();

-- ── sanctions ───────────────────────────────────────────────────────────────
create table if not exists public.sanctions (
  id              text primary key,
  article         text not null,
  fraction        text,
  scenario        text not null,
  min_uma         numeric(14,2) not null check (min_uma >= 0),
  max_uma         numeric(14,2) not null check (max_uma >= 0),
  min_percent     numeric(6,3) check (min_percent >= 0),
  max_percent     numeric(6,3) check (max_percent >= 0),
  severity        text not null check (severity in ('baja','media','alta','critica')),
  notes           text,
  valid_from      date not null,
  valid_to        date,
  source_ids      text[] not null default '{}',
  provision       text not null default '',
  verification    text not null default 'no_verificado'
                  check (verification in ('oficial_verificado','oficial_no_accesible','fuente_secundaria','no_verificado')),
  last_review_at  date,
  editorial_note  text,
  status          text not null default 'borrador'
                  check (status in ('borrador','revisado','publicado','sustituido')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (max_uma >= min_uma)
);

create index if not exists sanctions_article_idx on public.sanctions (article);

create trigger sanctions_set_updated_at before update on public.sanctions
  for each row execute function public.set_updated_at();

-- ── obligations ─────────────────────────────────────────────────────────────
create table if not exists public.obligations (
  slug          text primary key,
  title         text not null,
  summary       text not null default '',
  category      text not null check (category in
                ('registro','identificacion','expediente','avisos','riesgos','gobierno',
                 'capacitacion','tecnologia','auditoria','conservacion')),
  activities    text[] not null default '{}',
  steps         jsonb not null default '[]'::jsonb,
  due_date      date,
  recurrence    text check (recurrence in ('unica','mensual','semestral','anual')),
  source_ids    text[] not null default '{}',
  provision     text not null default '',
  verification  text not null default 'no_verificado'
                check (verification in ('oficial_verificado','oficial_no_accesible','fuente_secundaria','no_verificado')),
  last_review_at date,
  editorial_note text,
  status        text not null default 'borrador'
                check (status in ('borrador','revisado','publicado','sustituido')),
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists obligations_category_idx on public.obligations (category);

create trigger obligations_set_updated_at before update on public.obligations
  for each row execute function public.set_updated_at();

-- ── deadlines (calendario normativo) ────────────────────────────────────────
create table if not exists public.deadlines (
  id            text primary key,
  due_date      date not null,
  end_date      date,
  title         text not null,
  description   text not null default '',
  obligations   text[] not null default '{}',
  -- Una fecha sin confirmación oficial se marca y la interfaz lo dice. Nunca se
  -- presenta como exigible lo que todavía no lo es.
  officially_confirmed boolean not null default false,
  source_ids    text[] not null default '{}',
  provision     text not null default '',
  verification  text not null default 'no_verificado'
                check (verification in ('oficial_verificado','oficial_no_accesible','fuente_secundaria','no_verificado')),
  last_review_at date,
  editorial_note text,
  status        text not null default 'borrador'
                check (status in ('borrador','revisado','publicado','sustituido')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (end_date is null or end_date >= due_date)
);

create index if not exists deadlines_due_date_idx on public.deadlines (due_date);

create trigger deadlines_set_updated_at before update on public.deadlines
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS del corpus legal
--
-- Lectura pública SÓLO de lo publicado (incluye `anon`: estas tablas alimentan
-- páginas del sitio abierto). Escritura, exclusiva del personal editorial.
-- ============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'legal_sources','legal_versions','uma_values','vulnerable_activities',
    'activity_subtypes','threshold_rules','cash_restriction_rules','sanctions',
    'obligations','deadlines'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);

    -- Las tablas sin columna `status` (legal_versions, activity_subtypes) se
    -- publican completas; el resto filtra por estado editorial.
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name = 'status'
    ) then
      execute format($f$
        create policy %1$I_select on public.%1$I
          for select to anon, authenticated
          using (status = 'publicado' or public.es_staff())
      $f$, t);
    else
      execute format($f$
        create policy %1$I_select on public.%1$I
          for select to anon, authenticated using (true)
      $f$, t);
    end if;

    execute format($f$
      create policy %1$I_insert on public.%1$I
        for insert to authenticated with check (public.es_staff())
    $f$, t);

    execute format($f$
      create policy %1$I_update on public.%1$I
        for update to authenticated using (public.es_staff()) with check (public.es_staff())
    $f$, t);

    -- Sin política de DELETE: una regla jurídica histórica no se borra, se
    -- sustituye (status = 'sustituido'). Es la única forma de poder responder
    -- "¿qué decía la regla el día de esta operación?".
  end loop;
end
$$;

-- accumulation_rules es la excepción: pertenece a una organización.
alter table public.accumulation_rules enable row level security;

create policy accumulation_rules_select on public.accumulation_rules
  for select to authenticated
  using (organization_id is null or public.es_miembro_de(organization_id));

create policy accumulation_rules_insert on public.accumulation_rules
  for insert to authenticated
  with check (organization_id is not null and public.puede_administrar(organization_id));

create policy accumulation_rules_update on public.accumulation_rules
  for update to authenticated
  using (organization_id is not null and public.puede_administrar(organization_id))
  with check (organization_id is not null and public.puede_administrar(organization_id));

create policy accumulation_rules_delete on public.accumulation_rules
  for delete to authenticated
  using (organization_id is not null and public.es_propietario(organization_id));
