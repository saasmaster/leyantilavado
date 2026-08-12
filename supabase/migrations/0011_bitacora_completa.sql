-- ============================================================================
-- 0011 · Cerrar los huecos de la bitácora
--
-- Tras las migraciones 0003, 0008 y 0010 quedaban ocho tablas sin ningún
-- historial. Dos de ellas importan de verdad:
--
--   · `users`, donde vive `is_staff`. Un cambio ahí otorga acceso al panel
--     administrativo y hasta ahora no dejaba rastro en ninguna parte.
--   · `provider_credentials` y `verification_requests`, donde se decide qué
--     insignia de verificación lleva un perfil público.
--
-- Una decisión de moderación sin autor ni fecha no se puede defender cuando
-- alguien pregunta por qué su perfil se quedó sin verificar.
-- ============================================================================

-- Variante que registra el CAMBIO pero no copia el contenido de la fila.
--
-- Se usa en tablas con datos personales de terceros (los formularios de
-- contacto del directorio y los suscriptores del boletín): duplicar esos datos
-- en `audit_logs` —que es append-only y nadie puede borrar— haría imposible
-- atender una solicitud de supresión de datos personales. Queda constancia de
-- que hubo un cambio, quién lo hizo y sobre qué fila, sin volver a guardar los
-- datos.
create or replace function public.registrar_bitacora_sin_datos()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_fila jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.audit_logs (organization_id, actor_id, action, entity, entity_id, summary)
  values (
    nullif(v_fila ->> 'organization_id', '')::uuid,
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    coalesce(v_fila ->> 'id', v_fila ->> 'slug', v_fila ->> 'key'),
    'Cambio registrado sin copiar el contenido: la fila tiene datos personales de un tercero.'
  );
  return coalesce(new, old);
end;
$$;

-- Tablas cuyo contenido sí se conserva completo en la bitácora.
do $$
declare
  t text;
begin
  foreach t in array array[
    'users','authors','reviewers','templates','courses',
    'sponsorships','verification_requests'
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

-- Tablas con datos personales de terceros: se registra el hecho, no el dato.
do $$
declare
  t text;
begin
  foreach t in array array['provider_leads','newsletter_subscribers']
  loop
    execute format($f$
      create trigger %1$I_bitacora
        after insert or update or delete on public.%1$I
        for each row execute function public.registrar_bitacora_sin_datos()
    $f$, t);
  end loop;
end
$$;

-- Historial editorial completo para los perfiles del directorio: quién cambió
-- el nivel de verificación, cuándo y por qué. `provider_profiles` ya iba a
-- `audit_logs` desde 0010; esto añade el detalle campo a campo.
create trigger provider_profiles_versionar
  after update on public.provider_profiles
  for each row execute function public.versionar_contenido();

create trigger provider_credentials_versionar
  after update on public.provider_credentials
  for each row execute function public.versionar_contenido();
