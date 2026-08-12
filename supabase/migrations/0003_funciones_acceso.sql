-- ============================================================================
-- 0003 · Funciones de acceso y RLS de identidad
--
-- ESTA es la frontera de seguridad del producto. `MATRIZ_PERMISOS` en
-- TypeScript decide qué botón se dibuja; lo que se puede leer y escribir se
-- decide aquí y no se puede rodear desde el navegador, porque el cliente habla
-- con PostgREST usando el JWT del usuario.
--
-- Todas las funciones son SECURITY DEFINER y STABLE:
--   · SECURITY DEFINER evita la recursión infinita (una política sobre
--     organization_members que consultara organization_members se llamaría a sí
--     misma) y permite leer la membresía aunque el usuario no tenga permiso
--     directo sobre esa fila.
--   · STABLE permite a Postgres evaluarlas UNA vez por consulta en lugar de una
--     vez por fila. Con una subconsulta repetida en cada política, un listado de
--     10 000 operaciones haría 10 000 comprobaciones de membresía.
--   · `set search_path` fija el esquema: sin eso, un esquema malicioso en el
--     search_path del llamante podría secuestrar la función.
-- ============================================================================

create or replace function public.rol_en(org uuid)
returns text
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select m.role
  from public.organization_members m
  where m.organization_id = org
    and m.user_id = auth.uid()
    and m.status = 'activo'
    and m.deleted_at is null
  limit 1;
$$;

create or replace function public.es_miembro_de(org uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select public.rol_en(org) is not null;
$$;

create or replace function public.tiene_rol(org uuid, roles text[])
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select public.rol_en(org) = any (roles);
$$;

-- Puede tocar la configuración de la organización y a sus miembros.
create or replace function public.puede_administrar(org uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select public.tiene_rol(org, array['propietario','administrador']);
$$;

create or replace function public.es_propietario(org uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select public.rol_en(org) = 'propietario';
$$;

-- Escritura sobre datos operativos: clientes, operaciones, alertas, riesgo.
-- `auditor` NO está aquí: audita, no opera. `consulta` tampoco: sólo mira.
create or replace function public.puede_escribir_operativo(org uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select public.tiene_rol(org, array['propietario','administrador','analista']);
$$;

-- Escritura sobre auditorías, hallazgos y planes de remediación. Aquí SÍ está
-- `auditor`: es el único lugar donde ese rol escribe.
create or replace function public.puede_auditar(org uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select public.tiene_rol(org, array['propietario','administrador','auditor']);
$$;

-- Aprobación de avisos. El analista prepara; sólo administración aprueba.
create or replace function public.puede_aprobar_avisos(org uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select public.tiene_rol(org, array['propietario','administrador']);
$$;

-- Personal de LeyAntilavado.org (panel administrativo y corpus legal).
create or replace function public.es_staff()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_staff and u.deleted_at is null
  );
$$;

-- ── Quien crea una organización queda como propietario ──────────────────────
create or replace function public.crear_membresia_propietario()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.organization_members (organization_id, user_id, role, status)
  values (new.id, coalesce(new.created_by, auth.uid()), 'propietario', 'activo')
  on conflict (organization_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists organizations_alta_propietario on public.organizations;
create trigger organizations_alta_propietario
  after insert on public.organizations
  for each row execute function public.crear_membresia_propietario();

-- ── Nadie se hace staff a sí mismo ──────────────────────────────────────────
create or replace function public.impedir_autopromocion_staff()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and new.id = auth.uid()
     and (new.is_staff is distinct from old.is_staff
          or new.staff_role is distinct from old.staff_role) then
    raise exception 'El acceso al panel administrativo no se puede otorgar desde la aplicación.'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

drop trigger if exists users_sin_autopromocion on public.users;
create trigger users_sin_autopromocion
  before update on public.users
  for each row execute function public.impedir_autopromocion_staff();

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.branches enable row level security;
alter table public.audit_logs enable row level security;

-- ── users ───────────────────────────────────────────────────────────────────
-- Se ve el propio perfil y el de los compañeros de organización (para mostrar
-- "creado por" sin exponer el directorio completo de usuarios de la plataforma).
create policy users_select on public.users
  for select to authenticated
  using (
    id = auth.uid()
    or public.es_staff()
    or exists (
      select 1
      from public.organization_members yo
      join public.organization_members otro
        on otro.organization_id = yo.organization_id
      where yo.user_id = auth.uid()
        and yo.status = 'activo'
        and otro.user_id = users.id
    )
  );

create policy users_update_propio on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
-- `is_staff` y `staff_role` los blinda el trigger users_sin_autopromocion:
-- RLS no puede comparar el valor viejo con el nuevo dentro de un WITH CHECK.

create policy users_update_staff on public.users
  for update to authenticated
  using (public.es_staff())
  with check (public.es_staff());

-- Sin política de INSERT: los perfiles los crea el trigger sobre auth.users.
-- Sin política de DELETE: se borra la cuenta en auth.users y cae en cascada.

-- ── organizations ───────────────────────────────────────────────────────────
create policy organizations_select on public.organizations
  for select to authenticated
  using (public.es_miembro_de(id) or public.es_staff());

create policy organizations_insert on public.organizations
  for insert to authenticated
  with check (created_by = auth.uid());

create policy organizations_update on public.organizations
  for update to authenticated
  using (public.puede_administrar(id))
  with check (public.puede_administrar(id));

-- El borrado físico de una organización arrastra en cascada todos sus
-- expedientes. Sólo el propietario, y la app usa `deleted_at` antes de llegar
-- aquí.
create policy organizations_delete on public.organizations
  for delete to authenticated
  using (public.es_propietario(id));

-- ── organization_members ────────────────────────────────────────────────────
create policy organization_members_select on public.organization_members
  for select to authenticated
  using (user_id = auth.uid() or public.es_miembro_de(organization_id) or public.es_staff());

create policy organization_members_insert on public.organization_members
  for insert to authenticated
  with check (
    public.puede_administrar(organization_id)
    -- Un administrador no puede crear propietarios: sólo un propietario reparte
    -- su propio nivel.
    and (role <> 'propietario' or public.es_propietario(organization_id))
  );

-- EL AGUJERO QUE ESTO CIERRA: sin `user_id <> auth.uid()`, cualquier
-- administrador podría ejecutar
--   update organization_members set role='propietario' where user_id = auth.uid()
-- y ascender solo. Con la exclusión, para cambiar un rol siempre hace falta
-- otra persona. El trigger `impedir_autoelevacion` repite la comprobación por
-- si alguien escribe con la clave de servicio.
create policy organization_members_update on public.organization_members
  for update to authenticated
  using (
    public.puede_administrar(organization_id)
    and user_id <> auth.uid()
    and (role <> 'propietario' or public.es_propietario(organization_id))
  )
  with check (
    public.puede_administrar(organization_id)
    and user_id <> auth.uid()
    and (role <> 'propietario' or public.es_propietario(organization_id))
  );

-- Salir de una organización por voluntad propia sí está permitido; ascenderse,
-- no. El trigger `proteger_ultimo_propietario` evita que el último propietario
-- deje la organización huérfana.
create policy organization_members_delete_propio on public.organization_members
  for delete to authenticated
  using (user_id = auth.uid());

create policy organization_members_delete on public.organization_members
  for delete to authenticated
  using (public.puede_administrar(organization_id) and user_id <> auth.uid());

-- ── branches ────────────────────────────────────────────────────────────────
create policy branches_select on public.branches
  for select to authenticated
  using (public.es_miembro_de(organization_id));

create policy branches_insert on public.branches
  for insert to authenticated
  with check (public.puede_administrar(organization_id));

create policy branches_update on public.branches
  for update to authenticated
  using (public.puede_administrar(organization_id))
  with check (public.puede_administrar(organization_id));

create policy branches_delete on public.branches
  for delete to authenticated
  using (public.puede_administrar(organization_id));

-- ── audit_logs ──────────────────────────────────────────────────────────────
-- Append-only: SÓLO existe política de SELECT. En RLS, la operación sin
-- política está prohibida, así que no hay forma de que un UPDATE o un DELETE
-- prospere ni siquiera para el propietario. Las inserciones las hace el trigger
-- `registrar_bitacora`, que es SECURITY DEFINER y no pasa por RLS.
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (
    public.es_staff()
    or (organization_id is not null
        and public.tiene_rol(organization_id, array['propietario','administrador','auditor']))
  );

-- Bitácora de las tablas de identidad.
create trigger organizations_bitacora
  after insert or update or delete on public.organizations
  for each row execute function public.registrar_bitacora();

create trigger organization_members_bitacora
  after insert or update or delete on public.organization_members
  for each row execute function public.registrar_bitacora();

create trigger branches_bitacora
  after insert or update or delete on public.branches
  for each row execute function public.registrar_bitacora();
