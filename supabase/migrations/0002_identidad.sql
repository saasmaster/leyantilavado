-- ============================================================================
-- 0002 · Identidad, organizaciones y sucursales
-- ============================================================================

-- ── users ───────────────────────────────────────────────────────────────────
-- Perfil público del usuario. `auth.users` es de Supabase y no se toca; esta
-- tabla es la que se puede consultar con joins y proteger con RLS.
create table if not exists public.users (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  full_name    text,
  phone        text,
  -- Personal de LeyAntilavado.org: única puerta al panel administrativo.
  -- NUNCA se puede modificar desde la aplicación (ver política más abajo).
  is_staff     boolean not null default false,
  staff_role   text check (staff_role in ('editor','revisor','moderador','administrador')),
  locale       text not null default 'es-MX',
  accepted_terms_at timestamptz,
  last_seen_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index if not exists users_email_idx on public.users (lower(email));
create index if not exists users_is_staff_idx on public.users (is_staff) where is_staff;

create trigger users_set_updated_at before update on public.users
  for each row execute function public.set_updated_at();

-- Alta automática del perfil al registrarse. Sin esto, el primer SELECT tras
-- el registro devolvería vacío y la app tendría que adivinar el nombre.
create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.crear_perfil_usuario();

-- ── organizations ───────────────────────────────────────────────────────────
create table if not exists public.organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (length(trim(name)) > 0),
  legal_name    text,
  rfc           text check (rfc is null or rfc ~ '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$'),
  entity_type   text not null default 'persona_moral'
                check (entity_type in ('persona_fisica','persona_moral','fideicomiso')),
  -- Actividades vulnerables declaradas. Los slugs son los de `ActividadSlug`.
  activities    text[] not null default '{}',
  sat_registration_date date,
  compliance_officer_name  text,
  compliance_officer_email text,
  state         text,
  city          text,
  plan          text not null default 'gratuito' check (plan in ('gratuito','profesional','empresarial')),
  created_by    uuid references public.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index if not exists organizations_created_by_idx on public.organizations (created_by);
create index if not exists organizations_rfc_idx on public.organizations (rfc);

create trigger organizations_set_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();

-- ── organization_members ────────────────────────────────────────────────────
create table if not exists public.organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id         uuid not null references public.users (id) on delete cascade,
  role            text not null check (role in ('propietario','administrador','analista','auditor','consulta')),
  status          text not null default 'activo' check (status in ('invitado','activo','suspendido')),
  invited_by      uuid references public.users (id) on delete set null,
  invited_email   text,
  invitation_token uuid,
  -- Restringe a un analista a las operaciones de ciertas sucursales.
  branch_ids      uuid[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  unique (organization_id, user_id)
);

create index if not exists organization_members_user_id_idx on public.organization_members (user_id);
create index if not exists organization_members_organization_id_idx on public.organization_members (organization_id);
create index if not exists organization_members_role_idx on public.organization_members (organization_id, role);

create trigger organization_members_set_updated_at before update on public.organization_members
  for each row execute function public.set_updated_at();

-- Toda organización conserva al menos un propietario: si se pudiera degradar al
-- último, la organización quedaría sin nadie capaz de administrarla y habría
-- que rescatarla a mano desde la consola.
create or replace function public.proteger_ultimo_propietario()
returns trigger
language plpgsql
as $$
declare
  v_restantes int;
begin
  if (tg_op = 'DELETE' and old.role = 'propietario')
     or (tg_op = 'UPDATE' and old.role = 'propietario'
         and (new.role <> 'propietario' or new.status <> 'activo' or new.deleted_at is not null)) then
    select count(*) into v_restantes
    from public.organization_members m
    where m.organization_id = old.organization_id
      and m.role = 'propietario'
      and m.status = 'activo'
      and m.deleted_at is null
      and m.id <> old.id;

    if v_restantes = 0 then
      raise exception 'La organización debe conservar al menos un propietario activo.'
        using errcode = 'check_violation';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists organization_members_ultimo_propietario on public.organization_members;
create trigger organization_members_ultimo_propietario
  before update or delete on public.organization_members
  for each row execute function public.proteger_ultimo_propietario();

-- Defensa en profundidad contra la autoelevación. La política de RLS ya impide
-- que alguien edite su propia fila de membresía, pero este trigger también
-- corre para el rol de servicio y para cualquier script con psql.
create or replace function public.impedir_autoelevacion()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null
     and new.user_id = auth.uid()
     and (new.role is distinct from old.role or new.status is distinct from old.status) then
    raise exception 'Nadie puede cambiar su propio rol ni su propio estado dentro de una organización.'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

drop trigger if exists organization_members_sin_autoelevacion on public.organization_members;
create trigger organization_members_sin_autoelevacion
  before update on public.organization_members
  for each row execute function public.impedir_autoelevacion();

-- ── branches (sucursales) ───────────────────────────────────────────────────
create table if not exists public.branches (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null check (length(trim(name)) > 0),
  code            text,
  state           text,
  city            text,
  address         text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  unique (organization_id, code)
);

create index if not exists branches_organization_id_idx on public.branches (organization_id);

create trigger branches_set_updated_at before update on public.branches
  for each row execute function public.set_updated_at();
