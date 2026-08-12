-- ============================================================================
-- 0010 · Versionado del corpus legal y del contenido editorial
--
-- REGLA DURA DEL PRODUCTO: jamás se sobreescribe una regla histórica en
-- silencio. Esto NO se confía al código de la aplicación —una consulta desde la
-- consola de Supabase, un script de migración o un cliente distinto se lo
-- saltarían— sino a triggers de Postgres.
--
-- El motivo del cambio viaja en la variable de sesión `app.motivo_cambio`:
--   select set_config('app.motivo_cambio', 'Acuerdo 115/2026, art. 3', true);
--   update threshold_rules set ... ;
-- Si no se manda, queda constancia de que no se dio motivo. Se registra igual:
-- un cambio sin justificar documentado es mejor que un cambio invisible.
-- ============================================================================

create or replace function public.versionar_contenido()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id        text;
  v_antes     jsonb;
  v_despues   jsonb;
  v_revision  int;
  v_campos    text[];
  v_motivo    text;
begin
  v_antes   := to_jsonb(old);
  v_despues := to_jsonb(new);

  -- La clave primaria de estas tablas es `id` (text o uuid) o `slug`/`year`.
  v_id := coalesce(
    v_despues ->> 'id',
    v_despues ->> 'slug',
    v_despues ->> 'year',
    v_despues ->> 'version'
  );

  -- Campos que cambiaron de verdad. Un UPDATE que no cambia nada (muy común
  -- cuando un formulario reenvía el mismo contenido) no genera una revisión
  -- falsa que ensucie el historial.
  select coalesce(array_agg(clave order by clave), '{}')
    into v_campos
  from (
    select key as clave
    from jsonb_each(v_despues)
    where key not in ('updated_at')
      and (v_antes -> key) is distinct from (v_despues -> key)
  ) cambios;

  if array_length(v_campos, 1) is null then
    return new;
  end if;

  select coalesce(max(revision), 0) + 1
    into v_revision
  from public.content_revisions
  where entity = tg_table_name and entity_id = v_id;

  v_motivo := nullif(current_setting('app.motivo_cambio', true), '');

  insert into public.content_revisions
    (entity, entity_id, revision, before_data, after_data, changed_fields, author_id, reason,
     source_ids, legal_version)
  values (
    tg_table_name,
    v_id,
    v_revision,
    v_antes,
    v_despues,
    v_campos,
    auth.uid(),
    coalesce(v_motivo, 'Sin motivo declarado por quien hizo el cambio.'),
    coalesce(
      (select array_agg(x) from jsonb_array_elements_text(coalesce(v_despues -> 'source_ids', '[]'::jsonb)) as t(x)),
      '{}'
    ),
    v_despues ->> 'legal_version'
  );

  return new;
end;
$$;

comment on function public.versionar_contenido() is
  'Guarda la versión ANTERIOR de una regla legal o contenido editorial antes de sobreescribirla, con autor, fecha, campos modificados y motivo.';

-- Alta: también deja constancia de la revisión 1, para que el historial empiece
-- en el nacimiento de la regla y no en su primer cambio.
create or replace function public.versionar_alta_contenido()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_despues jsonb := to_jsonb(new);
  v_id text;
begin
  v_id := coalesce(v_despues ->> 'id', v_despues ->> 'slug', v_despues ->> 'year', v_despues ->> 'version');

  insert into public.content_revisions
    (entity, entity_id, revision, before_data, after_data, changed_fields, author_id, reason, legal_version)
  values (
    tg_table_name, v_id, 1, null, v_despues, array['*'], auth.uid(),
    coalesce(nullif(current_setting('app.motivo_cambio', true), ''), 'Alta inicial del registro.'),
    v_despues ->> 'legal_version'
  )
  on conflict (entity, entity_id, revision) do nothing;

  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    -- Corpus legal: cada una de estas filas puede acabar citada en una
    -- resolución. Su historial no es opcional.
    'legal_sources','uma_values','vulnerable_activities','threshold_rules',
    'cash_restriction_rules','sanctions','obligations','deadlines','legal_versions',
    -- Contenido editorial con efecto jurídico.
    'articles','faq_entries','glossary_terms','changelog_entries'
  ]
  loop
    execute format($f$
      create trigger %1$I_versionar
        after update on public.%1$I
        for each row execute function public.versionar_contenido()
    $f$, t);

    execute format($f$
      create trigger %1$I_versionar_alta
        after insert on public.%1$I
        for each row execute function public.versionar_alta_contenido()
    $f$, t);
  end loop;
end
$$;

-- Los cambios en el corpus legal también van a la bitácora general, que es la
-- que puede leer un auditor externo sin acceso al panel editorial.
do $$
declare
  t text;
begin
  foreach t in array array[
    'legal_sources','uma_values','vulnerable_activities','threshold_rules',
    'cash_restriction_rules','sanctions','obligations','deadlines','accumulation_rules',
    'provider_profiles','provider_credentials','feature_flags'
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
