-- ============================================================================
-- 0006 · Directorio profesional
--
-- Regla de producto: el nivel máximo de verificación es "documentación
-- revisada". La palabra "certificado por LeyAntilavado.org" no existe en el
-- CHECK de `verification_level` y no debe existir nunca.
-- ============================================================================

create table if not exists public.provider_categories (
  slug        text primary key,
  name        text not null,
  description text not null default '',
  sort_order  int not null default 0
);

create table if not exists public.provider_profiles (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references public.users (id) on delete set null,
  slug          text not null unique,
  name          text not null,
  categories    text[] not null default '{}',
  activities    text[] not null default '{}',
  bio           text not null default '',
  services      text[] not null default '{}',
  industries    text[] not null default '{}',
  languages     text[] not null default array['es'],
  years_experience int check (years_experience is null or years_experience >= 0),
  client_sizes  text[] not null default '{}',
  logo_url      text,
  website       text,
  contact_email text,
  contact_phone text,
  verification_level text not null default 'sin_verificar'
    check (verification_level in ('sin_verificar','correo_verificado','identidad_verificada',
                                  'documentacion_revisada','certificacion_externa_revisada')),
  verified_at   timestamptz,
  verified_by   uuid references public.users (id) on delete set null,
  plan          text not null default 'gratuito' check (plan in ('gratuito','profesional','destacado')),
  -- Si es true, la ficha DEBE llevar la etiqueta "Patrocinado" visible. No es
  -- negociable y por eso vive en la base, no en una hoja de estilos.
  sponsored     boolean not null default false,
  accepting_clients boolean not null default true,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index if not exists provider_profiles_owner_idx on public.provider_profiles (owner_id);
create index if not exists provider_profiles_published_idx on public.provider_profiles (published) where published;
create index if not exists provider_profiles_categorias_idx on public.provider_profiles using gin (categories);
create index if not exists provider_profiles_actividades_idx on public.provider_profiles using gin (activities);

create trigger provider_profiles_set_updated_at before update on public.provider_profiles
  for each row execute function public.set_updated_at();

create table if not exists public.provider_locations (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid not null references public.provider_profiles (id) on delete cascade,
  state         text not null,
  city          text,
  national_coverage boolean not null default false,
  remote        boolean not null default true,
  in_person     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists provider_locations_provider_idx on public.provider_locations (provider_id);
create index if not exists provider_locations_estado_idx on public.provider_locations (state);

-- Documentos probatorios. `document_url` NUNCA es público: sólo lo ve el
-- personal de moderación y el propio proveedor.
create table if not exists public.provider_credentials (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid not null references public.provider_profiles (id) on delete cascade,
  kind          text not null check (kind in ('cedula_profesional','certificacion_uif','colegio','titulo','otro')),
  name          text not null,
  issuer        text not null,
  folio         text,
  valid_until   date,
  document_url  text,
  reviewed_at   date,
  reviewed_by   uuid references public.users (id) on delete set null,
  review_note   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists provider_credentials_provider_idx on public.provider_credentials (provider_id);

create trigger provider_credentials_set_updated_at before update on public.provider_credentials
  for each row execute function public.set_updated_at();

create table if not exists public.verification_requests (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid not null references public.provider_profiles (id) on delete cascade,
  requested_level text not null
    check (requested_level in ('correo_verificado','identidad_verificada',
                               'documentacion_revisada','certificacion_externa_revisada')),
  status        text not null default 'pendiente'
                check (status in ('pendiente','en_revision','aprobada','rechazada')),
  notes         text,
  decided_at    timestamptz,
  decided_by    uuid references public.users (id) on delete set null,
  decision_note text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists verification_requests_status_idx on public.verification_requests (status, created_at desc);

create trigger verification_requests_set_updated_at before update on public.verification_requests
  for each row execute function public.set_updated_at();

-- Datos personales de quien pide contacto: se comparten con el proveedor sólo
-- si `consent` es true, y eso lo captura el formulario público.
create table if not exists public.provider_leads (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid not null references public.provider_profiles (id) on delete cascade,
  name          text not null,
  email         text not null,
  phone         text,
  company       text,
  activity      text,
  message       text not null default '',
  kind          text not null default 'contacto' check (kind in ('contacto','cotizacion','llamada')),
  consent       boolean not null default false,
  status        text not null default 'nuevo' check (status in ('nuevo','contactado','descartado')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  check (consent)
);

create index if not exists provider_leads_provider_idx on public.provider_leads (provider_id, created_at desc);

create trigger provider_leads_set_updated_at before update on public.provider_leads
  for each row execute function public.set_updated_at();

create table if not exists public.sponsorships (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid references public.provider_profiles (id) on delete set null,
  advertiser    text not null,
  placement     text not null check (placement in ('directorio','articulo','herramienta','newsletter','home')),
  target_slug   text,
  starts_on     date not null,
  ends_on       date not null,
  amount_cents  public.centavos not null default 0,
  status        text not null default 'borrador' check (status in ('borrador','activo','pausado','terminado')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create index if not exists sponsorships_vigencia_idx on public.sponsorships (starts_on, ends_on);

create trigger sponsorships_set_updated_at before update on public.sponsorships
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS del directorio
-- ============================================================================

alter table public.provider_categories enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.provider_locations enable row level security;
alter table public.provider_credentials enable row level security;
alter table public.verification_requests enable row level security;
alter table public.provider_leads enable row level security;
alter table public.sponsorships enable row level security;

create policy provider_categories_select on public.provider_categories
  for select to anon, authenticated using (true);
create policy provider_categories_escribir on public.provider_categories
  for all to authenticated using (public.es_staff()) with check (public.es_staff());

create policy provider_profiles_select on public.provider_profiles
  for select to anon, authenticated
  using ((published and deleted_at is null) or owner_id = auth.uid() or public.es_staff());

create policy provider_profiles_insert on public.provider_profiles
  for insert to authenticated
  with check (owner_id = auth.uid() or public.es_staff());

-- El proveedor edita su ficha, pero NO se otorga verificación ni patrocinio a
-- sí mismo: esas columnas las blinda el trigger de abajo.
create policy provider_profiles_update on public.provider_profiles
  for update to authenticated
  using (owner_id = auth.uid() or public.es_staff())
  with check (owner_id = auth.uid() or public.es_staff());

create policy provider_profiles_delete on public.provider_profiles
  for delete to authenticated using (public.es_staff());

create or replace function public.proteger_verificacion_proveedor()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.es_staff() then
    if new.verification_level is distinct from old.verification_level
       or new.sponsored is distinct from old.sponsored
       or new.plan is distinct from old.plan
       or new.verified_at is distinct from old.verified_at
       or new.verified_by is distinct from old.verified_by then
      raise exception 'La verificación, el plan y la etiqueta de patrocinio sólo las cambia el equipo de moderación.'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists provider_profiles_proteger_verificacion on public.provider_profiles;
create trigger provider_profiles_proteger_verificacion
  before update on public.provider_profiles
  for each row execute function public.proteger_verificacion_proveedor();

create policy provider_locations_select on public.provider_locations
  for select to anon, authenticated
  using (exists (select 1 from public.provider_profiles p
                 where p.id = provider_id and (p.published or p.owner_id = auth.uid() or public.es_staff())));
create policy provider_locations_escribir on public.provider_locations
  for all to authenticated
  using (exists (select 1 from public.provider_profiles p
                 where p.id = provider_id and (p.owner_id = auth.uid() or public.es_staff())))
  with check (exists (select 1 from public.provider_profiles p
                      where p.id = provider_id and (p.owner_id = auth.uid() or public.es_staff())));

-- Las credenciales NO son públicas: contienen folios y documentos.
create policy provider_credentials_select on public.provider_credentials
  for select to authenticated
  using (exists (select 1 from public.provider_profiles p
                 where p.id = provider_id and (p.owner_id = auth.uid() or public.es_staff())));
create policy provider_credentials_insert on public.provider_credentials
  for insert to authenticated
  with check (exists (select 1 from public.provider_profiles p
                      where p.id = provider_id and (p.owner_id = auth.uid() or public.es_staff())));
create policy provider_credentials_update on public.provider_credentials
  for update to authenticated
  using (public.es_staff()) with check (public.es_staff());
create policy provider_credentials_delete on public.provider_credentials
  for delete to authenticated using (public.es_staff());

create policy verification_requests_select on public.verification_requests
  for select to authenticated
  using (exists (select 1 from public.provider_profiles p
                 where p.id = provider_id and (p.owner_id = auth.uid() or public.es_staff())));
create policy verification_requests_insert on public.verification_requests
  for insert to authenticated
  with check (status = 'pendiente'
              and exists (select 1 from public.provider_profiles p
                          where p.id = provider_id and p.owner_id = auth.uid()));
create policy verification_requests_update on public.verification_requests
  for update to authenticated using (public.es_staff()) with check (public.es_staff());

-- Los leads los crea cualquiera desde el formulario público, pero NADIE los
-- puede leer salvo el proveedor destinatario y el personal.
create policy provider_leads_insert on public.provider_leads
  for insert to anon, authenticated with check (consent);
create policy provider_leads_select on public.provider_leads
  for select to authenticated
  using (exists (select 1 from public.provider_profiles p
                 where p.id = provider_id and (p.owner_id = auth.uid() or public.es_staff())));
create policy provider_leads_update on public.provider_leads
  for update to authenticated
  using (exists (select 1 from public.provider_profiles p
                 where p.id = provider_id and (p.owner_id = auth.uid() or public.es_staff())))
  with check (exists (select 1 from public.provider_profiles p
                      where p.id = provider_id and (p.owner_id = auth.uid() or public.es_staff())));

create policy sponsorships_select on public.sponsorships
  for select to authenticated
  using (public.es_staff()
         or exists (select 1 from public.provider_profiles p
                    where p.id = provider_id and p.owner_id = auth.uid()));
create policy sponsorships_insert on public.sponsorships
  for insert to authenticated with check (public.es_staff());
create policy sponsorships_update on public.sponsorships
  for update to authenticated using (public.es_staff()) with check (public.es_staff());
create policy sponsorships_delete on public.sponsorships
  for delete to authenticated using (public.es_staff());
