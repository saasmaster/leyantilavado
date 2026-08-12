-- ============================================================================
-- 0009 · Plataforma
-- ============================================================================

-- Resultados guardados de las calculadoras públicas. Se guardan porque el
-- usuario lo pide (para volver a ellos o compartirlos con su contador), NUNCA
-- se indexan y NUNCA se muestran a nadie más.
create table if not exists public.saved_tool_results (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  tool            text not null,
  title           text not null default '',
  input           jsonb not null,
  output          jsonb not null,
  legal_version   text,
  computed_at     timestamptz not null default now(),
  -- Enlace para compartir. Nulo por omisión: compartir es una decisión, no el
  -- estado por defecto.
  share_token     uuid unique,
  share_expires_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists saved_tool_results_user_idx on public.saved_tool_results (user_id, created_at desc);
create index if not exists saved_tool_results_organization_idx on public.saved_tool_results (organization_id);

create trigger saved_tool_results_set_updated_at before update on public.saved_tool_results
  for each row execute function public.set_updated_at();

create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  kind            text not null check (kind in ('alerta','vencimiento','asignacion','sistema','contenido')),
  title           text not null,
  body            text not null default '',
  url             text,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_sin_leer_idx on public.notifications (user_id) where read_at is null;

create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text,
  activities    text[] not null default '{}',
  -- Doble opt-in: mientras `confirmed_at` sea nulo, no se le envía nada.
  confirm_token uuid not null default gen_random_uuid(),
  confirmed_at  timestamptz,
  unsubscribed_at timestamptz,
  source        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists newsletter_subscribers_confirmados_idx
  on public.newsletter_subscribers (confirmed_at) where unsubscribed_at is null;

create trigger newsletter_subscribers_set_updated_at before update on public.newsletter_subscribers
  for each row execute function public.set_updated_at();

create table if not exists public.feature_flags (
  key           text primary key,
  description   text not null default '',
  enabled       boolean not null default false,
  -- Habilitación parcial: por organización o por porcentaje.
  organization_ids uuid[] not null default '{}',
  rollout_percent int not null default 0 check (rollout_percent between 0 and 100),
  updated_by    uuid references public.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger feature_flags_set_updated_at before update on public.feature_flags
  for each row execute function public.set_updated_at();

-- Historial del monitor regulatorio: una fila por comprobación de cada fuente.
create table if not exists public.source_checks (
  id            uuid primary key default gen_random_uuid(),
  source_id     text not null references public.legal_sources (id) on delete cascade,
  checked_at    timestamptz not null default now(),
  http_status   int,
  content_hash  text,
  changed       boolean not null default false,
  error         text,
  duration_ms   int
);

create index if not exists source_checks_source_idx on public.source_checks (source_id, checked_at desc);

-- ============================================================================
-- RLS de plataforma
-- ============================================================================

alter table public.saved_tool_results enable row level security;
alter table public.notifications enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.feature_flags enable row level security;
alter table public.source_checks enable row level security;

create policy saved_tool_results_select on public.saved_tool_results
  for select to authenticated
  using (user_id = auth.uid()
         or (organization_id is not null and public.es_miembro_de(organization_id)));
create policy saved_tool_results_insert on public.saved_tool_results
  for insert to authenticated with check (user_id = auth.uid());
create policy saved_tool_results_update on public.saved_tool_results
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy saved_tool_results_delete on public.saved_tool_results
  for delete to authenticated using (user_id = auth.uid());

create policy notifications_select on public.notifications
  for select to authenticated using (user_id = auth.uid());
-- Marcar como leída es la única escritura permitida al destinatario. Crear
-- notificaciones es cosa del servidor (rol de servicio), no del navegador: sin
-- política de INSERT, nadie puede fabricarle notificaciones a otra persona.
create policy notifications_update on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_delete on public.notifications
  for delete to authenticated using (user_id = auth.uid());

-- Suscribirse es público; la lista de suscriptores NO se puede leer desde el
-- navegador bajo ninguna circunstancia salvo por el personal.
create policy newsletter_subscribers_insert on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);
create policy newsletter_subscribers_select on public.newsletter_subscribers
  for select to authenticated using (public.es_staff());
create policy newsletter_subscribers_update on public.newsletter_subscribers
  for update to authenticated using (public.es_staff()) with check (public.es_staff());
create policy newsletter_subscribers_delete on public.newsletter_subscribers
  for delete to authenticated using (public.es_staff());

-- Las banderas se leen desde el sitio público para decidir qué se muestra.
create policy feature_flags_select on public.feature_flags
  for select to anon, authenticated using (true);
create policy feature_flags_insert on public.feature_flags
  for insert to authenticated with check (public.es_staff());
create policy feature_flags_update on public.feature_flags
  for update to authenticated using (public.es_staff()) with check (public.es_staff());
create policy feature_flags_delete on public.feature_flags
  for delete to authenticated using (public.es_staff());

-- El historial del monitor lo escribe la tarea programada con la clave de
-- servicio (que no pasa por RLS). Desde el navegador sólo se lee, y sólo staff.
create policy source_checks_select on public.source_checks
  for select to authenticated using (public.es_staff());
