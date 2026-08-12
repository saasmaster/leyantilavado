-- ============================================================================
-- 0005 · Contenido editorial
-- ============================================================================

create table if not exists public.authors (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.users (id) on delete set null,
  slug         text not null unique,
  name         text not null,
  headline     text,
  bio          text not null default '',
  credentials  text[] not null default '{}',
  photo_url    text,
  links        jsonb not null default '{}'::jsonb,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create trigger authors_set_updated_at before update on public.authors
  for each row execute function public.set_updated_at();

-- Revisor jurídico. Su firma es lo que respalda el sello de procedencia; por
-- eso se guarda la cédula y su vigencia, no sólo el nombre.
create table if not exists public.reviewers (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.users (id) on delete set null,
  slug              text not null unique,
  name              text not null,
  professional_id   text,
  specialty         text,
  organization      text,
  credential_valid_until date,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create trigger reviewers_set_updated_at before update on public.reviewers
  for each row execute function public.set_updated_at();

create table if not exists public.articles (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  excerpt        text not null default '',
  body           text not null default '',
  section        text not null default 'guia'
                 check (section in ('guia','actualizacion','analisis','faq','caso','herramienta')),
  activities     text[] not null default '{}',
  author_id      uuid references public.authors (id) on delete set null,
  reviewer_id    uuid references public.reviewers (id) on delete set null,
  reviewed_at    date,
  source_ids     text[] not null default '{}',
  provision      text,
  status         text not null default 'borrador'
                 check (status in ('borrador','revisado','publicado','sustituido')),
  published_at   timestamptz,
  -- Contenido jurídico con caducidad: el monitor regulatorio y el panel
  -- administrativo levantan alerta cuando esta fecha pasa.
  review_due_at  date,
  legal_version  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create index if not exists articles_status_idx on public.articles (status, published_at desc);
create index if not exists articles_author_idx on public.articles (author_id);
create index if not exists articles_review_due_idx on public.articles (review_due_at);

create trigger articles_set_updated_at before update on public.articles
  for each row execute function public.set_updated_at();

-- ── content_revisions ───────────────────────────────────────────────────────
-- Historial de TODO cambio con relevancia jurídica o editorial. Lo escriben
-- triggers (migración 0010), no la aplicación: así también queda registrado un
-- UPDATE hecho desde la consola de Supabase.
create table if not exists public.content_revisions (
  id            uuid primary key default gen_random_uuid(),
  entity        text not null,
  entity_id     text not null,
  revision      int not null,
  before_data   jsonb,
  after_data    jsonb not null,
  changed_fields text[] not null default '{}',
  author_id     uuid references public.users (id) on delete set null,
  reason        text,
  source_ids    text[] not null default '{}',
  legal_version text,
  created_at    timestamptz not null default now(),
  unique (entity, entity_id, revision)
);

create index if not exists content_revisions_entity_idx on public.content_revisions (entity, entity_id, revision desc);
create index if not exists content_revisions_author_idx on public.content_revisions (author_id);

comment on table public.content_revisions is
  'Append-only igual que audit_logs: guarda la versión anterior de cada regla legal o contenido antes de sobreescribirla.';

-- ── Contenido auxiliar del panel administrativo ─────────────────────────────

create table if not exists public.faq_entries (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  question    text not null,
  answer      text not null,
  topic       text,
  activities  text[] not null default '{}',
  source_ids  text[] not null default '{}',
  status      text not null default 'borrador'
              check (status in ('borrador','revisado','publicado','sustituido')),
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create trigger faq_entries_set_updated_at before update on public.faq_entries
  for each row execute function public.set_updated_at();

create table if not exists public.glossary_terms (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  term         text not null,
  short_definition text not null,
  definition   text not null default '',
  acronym      text,
  source_ids   text[] not null default '{}',
  status       text not null default 'borrador'
               check (status in ('borrador','revisado','publicado','sustituido')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create trigger glossary_terms_set_updated_at before update on public.glossary_terms
  for each row execute function public.set_updated_at();

create table if not exists public.templates (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text not null default '',
  kind         text not null check (kind in ('manual','matriz_riesgos','expediente','politica','checklist','carta','otro')),
  format       text not null default 'docx' check (format in ('docx','xlsx','pdf','csv','md')),
  file_url     text,
  activities   text[] not null default '{}',
  requires_account boolean not null default false,
  status       text not null default 'borrador'
               check (status in ('borrador','revisado','publicado','sustituido')),
  downloads    int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create trigger templates_set_updated_at before update on public.templates
  for each row execute function public.set_updated_at();

create table if not exists public.courses (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  provider      text not null,
  provider_id   uuid,
  modality      text not null default 'en_linea' check (modality in ('en_linea','presencial','mixta')),
  hours         numeric(5,1) check (hours is null or hours >= 0),
  price_cents   public.centavos,
  url           text,
  description   text not null default '',
  -- La constancia la emite el proveedor del curso, no LeyAntilavado.org.
  issues_certificate boolean not null default false,
  status        text not null default 'borrador'
                check (status in ('borrador','revisado','publicado','sustituido')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create trigger courses_set_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

-- Alertas de contenido desactualizado: las levanta el monitor regulatorio y el
-- vencimiento de `review_due_at`. Nunca publican una interpretación por su
-- cuenta: crean trabajo para una persona.
create table if not exists public.content_alerts (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('fuente_cambio','revision_vencida','discrepancia','reporte_usuario')),
  severity     text not null default 'media' check (severity in ('baja','media','alta')),
  entity       text,
  entity_id    text,
  source_id    text references public.legal_sources (id) on delete set null,
  title        text not null,
  detail       text not null default '',
  evidence     jsonb,
  status       text not null default 'abierta' check (status in ('abierta','en_revision','resuelta','descartada')),
  assigned_to  uuid references public.users (id) on delete set null,
  resolved_at  timestamptz,
  resolution   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists content_alerts_status_idx on public.content_alerts (status, created_at desc);

create trigger content_alerts_set_updated_at before update on public.content_alerts
  for each row execute function public.set_updated_at();

-- Bitácora pública de cambios normativos (la página /actualizaciones).
create table if not exists public.changelog_entries (
  id            uuid primary key default gen_random_uuid(),
  happened_on   date not null,
  title         text not null,
  summary       text not null,
  kind          text not null default 'normativo'
                check (kind in ('normativo','editorial','producto','correccion')),
  entities      text[] not null default '{}',
  source_ids    text[] not null default '{}',
  author_id     uuid references public.users (id) on delete set null,
  status        text not null default 'borrador'
                check (status in ('borrador','revisado','publicado','sustituido')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index if not exists changelog_entries_fecha_idx on public.changelog_entries (happened_on desc);

create trigger changelog_entries_set_updated_at before update on public.changelog_entries
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS editorial
-- ============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'articles','faq_entries','glossary_terms','templates','courses','changelog_entries'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format($f$
      create policy %1$I_select on public.%1$I
        for select to anon, authenticated
        using ((status = 'publicado' and deleted_at is null) or public.es_staff())
    $f$, t);
    execute format($f$
      create policy %1$I_insert on public.%1$I
        for insert to authenticated with check (public.es_staff())
    $f$, t);
    execute format($f$
      create policy %1$I_update on public.%1$I
        for update to authenticated using (public.es_staff()) with check (public.es_staff())
    $f$, t);
    execute format($f$
      create policy %1$I_delete on public.%1$I
        for delete to authenticated using (public.es_staff())
    $f$, t);
  end loop;
end
$$;

alter table public.authors enable row level security;
alter table public.reviewers enable row level security;
alter table public.content_alerts enable row level security;
alter table public.content_revisions enable row level security;

create policy authors_select on public.authors
  for select to anon, authenticated
  using ((is_active and deleted_at is null) or public.es_staff());
create policy authors_insert on public.authors
  for insert to authenticated with check (public.es_staff());
create policy authors_update on public.authors
  for update to authenticated using (public.es_staff()) with check (public.es_staff());
create policy authors_delete on public.authors
  for delete to authenticated using (public.es_staff());

create policy reviewers_select on public.reviewers
  for select to anon, authenticated
  using ((is_active and deleted_at is null) or public.es_staff());
create policy reviewers_insert on public.reviewers
  for insert to authenticated with check (public.es_staff());
create policy reviewers_update on public.reviewers
  for update to authenticated using (public.es_staff()) with check (public.es_staff());
create policy reviewers_delete on public.reviewers
  for delete to authenticated using (public.es_staff());

-- Las alertas de contenido son trabajo interno: nunca públicas.
create policy content_alerts_select on public.content_alerts
  for select to authenticated using (public.es_staff());
create policy content_alerts_insert on public.content_alerts
  for insert to authenticated with check (public.es_staff());
create policy content_alerts_update on public.content_alerts
  for update to authenticated using (public.es_staff()) with check (public.es_staff());

-- content_revisions: SÓLO lectura, y sólo para el personal editorial. Sin
-- políticas de INSERT/UPDATE/DELETE: las escribe el trigger versionar_contenido.
create policy content_revisions_select on public.content_revisions
  for select to authenticated using (public.es_staff());
