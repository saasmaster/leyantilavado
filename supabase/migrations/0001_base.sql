-- ============================================================================
-- 0001 · Cimientos
--
-- Convenciones de TODO el esquema:
--   · Nombres de tabla y columna en inglés, snake_case. Los VALORES de los
--     enums van en español porque son los mismos literales que usa el contrato
--     de tipos de TypeScript (`RolOrganizacion`, `EstadoEditorial`, …) y
--     traducirlos obligaría a mantener un mapa en los dos lados.
--   · Dinero SIEMPRE en centavos enteros (dominio `centavos`, bigint). Nunca
--     float, nunca numeric con decimales: 0.1 + 0.2 no es 0.3 y una multa se
--     calcula sobre estas cifras.
--   · Fechas jurídicas en `date` (la fecha de la operación decide qué UMA y qué
--     regla aplican). Marcas de tiempo del sistema en `timestamptz`.
--   · Los enums se expresan con CHECK sobre `text`, no con tipos ENUM: añadir
--     un valor a un ENUM en Postgres no se puede revertir dentro de una
--     transacción y complica las migraciones.
--   · Eliminación lógica con `deleted_at`. El borrado físico queda reservado a
--     propietario/administrador.
-- ============================================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ── Dominios ────────────────────────────────────────────────────────────────

-- Importes en centavos. El CHECK vive en el dominio para no repetirlo en las
-- ~20 columnas de dinero del esquema y para que no se pueda olvidar.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'centavos') then
    create domain public.centavos as bigint
      check (value >= 0);
  end if;
end
$$;

-- ── updated_at automático ───────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── Bitácora de auditoría (append-only) ─────────────────────────────────────
--
-- Sin FK a organizations a propósito: si se elimina una organización, su rastro
-- de auditoría tiene que sobrevivir. Un log que se borra en cascada con lo que
-- audita no es un log.
create table if not exists public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  organization_id uuid,
  actor_id      uuid,
  actor_email   text,
  action        text not null check (action in ('insert','update','delete','login','export','approve','restore')),
  entity        text not null,
  entity_id     text,
  summary       text,
  before_data   jsonb,
  after_data    jsonb,
  ip            inet,
  created_at    timestamptz not null default now()
);

create index if not exists audit_logs_organization_id_idx on public.audit_logs (organization_id, created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity, entity_id);
create index if not exists audit_logs_actor_id_idx on public.audit_logs (actor_id);

comment on table public.audit_logs is
  'Bitácora inmutable. No existen políticas de UPDATE ni DELETE para ningún rol: en RLS, lo que no tiene política no se puede hacer.';

-- Escribe en la bitácora desde triggers. SECURITY DEFINER porque la tabla no
-- tiene política de INSERT para nadie: sólo el sistema escribe aquí.
create or replace function public.registrar_bitacora()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org uuid;
  v_id  text;
  v_antes jsonb;
  v_despues jsonb;
begin
  if (tg_op = 'DELETE') then
    v_antes := to_jsonb(old);
    v_despues := null;
    v_id := (to_jsonb(old) ->> 'id');
  elsif (tg_op = 'UPDATE') then
    v_antes := to_jsonb(old);
    v_despues := to_jsonb(new);
    v_id := (to_jsonb(new) ->> 'id');
  else
    v_antes := null;
    v_despues := to_jsonb(new);
    v_id := (to_jsonb(new) ->> 'id');
  end if;

  v_org := nullif(coalesce(v_despues, v_antes) ->> 'organization_id', '')::uuid;

  insert into public.audit_logs (organization_id, actor_id, action, entity, entity_id, before_data, after_data)
  values (v_org, auth.uid(), lower(tg_op), tg_table_name, v_id, v_antes, v_despues);

  return coalesce(new, old);
end;
$$;

comment on function public.registrar_bitacora() is
  'Trigger genérico de bitácora. Se engancha a las tablas cuyo historial se exige y NO depende del código de la aplicación: aunque alguien escriba con psql, queda registrado.';
