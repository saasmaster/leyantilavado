-- ============================================================================
-- 0008 · RLS del núcleo de cumplimiento
--
-- Un solo principio: una fila con `organization_id` sólo la ve quien es miembro
-- activo de ESA organización. Todo lo demás son matices de escritura.
--
-- Políticas SEPARADAS por operación en lugar de una `FOR ALL`. Con `FOR ALL`,
-- la expresión USING se reutiliza como WITH CHECK y es imposible decir "lees
-- todo pero sólo escribes algo": el auditor y el rol de consulta dejarían de
-- ser distinguibles del analista.
-- ============================================================================

do $$
declare
  t text;
begin
  -- Tablas operativas: lee todo miembro, escribe propietario/administrador/
  -- analista, borra físicamente sólo administración.
  foreach t in array array[
    'customers','beneficial_owners','ownership_relations','operations',
    'operation_accumulations','risk_assessments','risk_factors','alerts',
    'cases','documents','training_records'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format($f$
      create policy %1$I_select on public.%1$I
        for select to authenticated
        using (public.es_miembro_de(organization_id))
    $f$, t);

    execute format($f$
      create policy %1$I_insert on public.%1$I
        for insert to authenticated
        with check (public.puede_escribir_operativo(organization_id))
    $f$, t);

    execute format($f$
      create policy %1$I_update on public.%1$I
        for update to authenticated
        using (public.puede_escribir_operativo(organization_id))
        with check (public.puede_escribir_operativo(organization_id))
    $f$, t);

    -- El borrado físico es la excepción: la aplicación marca `deleted_at` y la
    -- fila sigue ahí para el auditor. Purgar de verdad es cosa de propietario o
    -- administrador.
    execute format($f$
      create policy %1$I_delete on public.%1$I
        for delete to authenticated
        using (public.puede_administrar(organization_id))
    $f$, t);
  end loop;

  -- Tablas de auditoría: las lee todo miembro, pero el rol `auditor` —que no
  -- puede tocar ningún dato operativo— SÍ escribe aquí. Es la única puerta de
  -- escritura que tiene.
  foreach t in array array['audits','audit_findings','remediation_actions']
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format($f$
      create policy %1$I_select on public.%1$I
        for select to authenticated
        using (public.es_miembro_de(organization_id))
    $f$, t);

    execute format($f$
      create policy %1$I_insert on public.%1$I
        for insert to authenticated
        with check (public.puede_auditar(organization_id))
    $f$, t);

    execute format($f$
      create policy %1$I_update on public.%1$I
        for update to authenticated
        using (public.puede_auditar(organization_id))
        with check (public.puede_auditar(organization_id))
    $f$, t);

    execute format($f$
      create policy %1$I_delete on public.%1$I
        for delete to authenticated
        using (public.puede_administrar(organization_id))
    $f$, t);
  end loop;
end
$$;

-- ── notice_records ──────────────────────────────────────────────────────────
-- El analista prepara y manda a revisión. Aprobar y exportar exige rol de
-- administración: la comprobación va en el WITH CHECK, que mira la fila
-- RESULTANTE, así que no hay forma de dejar una fila aprobada sin el permiso.
alter table public.notice_records enable row level security;

create policy notice_records_select on public.notice_records
  for select to authenticated
  using (public.es_miembro_de(organization_id));

create policy notice_records_insert on public.notice_records
  for insert to authenticated
  with check (
    public.puede_escribir_operativo(organization_id)
    and (status in ('borrador','en_revision') or public.puede_aprobar_avisos(organization_id))
  );

create policy notice_records_update on public.notice_records
  for update to authenticated
  using (public.puede_escribir_operativo(organization_id))
  with check (
    public.puede_escribir_operativo(organization_id)
    and (status in ('borrador','en_revision','no_procede')
         or public.puede_aprobar_avisos(organization_id))
  );

create policy notice_records_delete on public.notice_records
  for delete to authenticated
  using (public.puede_administrar(organization_id));

-- ── policy_versions ─────────────────────────────────────────────────────────
-- Cualquiera con escritura operativa redacta un borrador del manual; ponerlo
-- "vigente" es un acto de gobierno y lo firma administración.
alter table public.policy_versions enable row level security;

create policy policy_versions_select on public.policy_versions
  for select to authenticated
  using (public.es_miembro_de(organization_id));

create policy policy_versions_insert on public.policy_versions
  for insert to authenticated
  with check (
    public.puede_escribir_operativo(organization_id)
    and (status <> 'vigente' or public.puede_administrar(organization_id))
  );

create policy policy_versions_update on public.policy_versions
  for update to authenticated
  using (public.puede_escribir_operativo(organization_id))
  with check (
    public.puede_escribir_operativo(organization_id)
    and (status <> 'vigente' or public.puede_administrar(organization_id))
  );

create policy policy_versions_delete on public.policy_versions
  for delete to authenticated
  using (public.puede_administrar(organization_id));

-- ── Coherencia entre la fila y su organización ──────────────────────────────
-- RLS comprueba `organization_id`, pero nada impediría colgar un cliente de la
-- organización A de un expediente de la organización B si las dos son mías.
-- Este trigger cierra ese hueco de contaminación cruzada.
create or replace function public.verificar_organizacion_coherente()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org uuid;
begin
  if new.customer_id is not null then
    select organization_id into v_org from public.customers where id = new.customer_id;
    if v_org is distinct from new.organization_id then
      raise exception 'El cliente pertenece a otra organización.' using errcode = 'foreign_key_violation';
    end if;
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'beneficial_owners','ownership_relations','operations','operation_accumulations',
    'risk_assessments','alerts','cases','documents','notice_records'
  ]
  loop
    execute format($f$
      create trigger %1$I_organizacion_coherente
        before insert or update on public.%1$I
        for each row execute function public.verificar_organizacion_coherente()
    $f$, t);
  end loop;
end
$$;

-- ── Bitácora de las tablas sensibles ────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array[
    'customers','beneficial_owners','operations','risk_assessments','alerts',
    'cases','documents','notice_records','audits','audit_findings',
    'remediation_actions','policy_versions','training_records'
  ]
  loop
    execute format($f$
      create trigger %1$I_bitacora
        after insert or update or delete on public.%1$I
        for each row execute function public.registrar_bitacora()
    $f$, t);
  end loop;
end
$$;
