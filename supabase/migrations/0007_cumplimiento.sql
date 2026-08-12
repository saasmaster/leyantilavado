-- ============================================================================
-- 0007 · Núcleo de cumplimiento (datos de la organización)
--
-- Todas las tablas de esta migración llevan `organization_id` y quedan aisladas
-- por RLS en la migración 0008. Ninguna excepción.
-- ============================================================================

-- ── customers ───────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  branch_id       uuid references public.branches (id) on delete set null,
  external_ref    text,
  person_type     text not null check (person_type in ('persona_fisica','persona_moral','fideicomiso')),
  full_name       text not null check (length(trim(full_name)) > 0),
  legal_name      text,
  rfc             text,
  curp            text,
  -- Extranjeros sin RFC: la ley pide otro identificador fiscal y su país.
  foreign_tax_id  text,
  nationality     text,
  birth_date      date,
  incorporation_date date,
  economic_activity text,
  occupation      text,
  email           text,
  phone           text,
  address         text,
  state           text,
  city            text,
  postal_code     text,
  country         text not null default 'MX',
  -- Persona políticamente expuesta. El valor lo captura una persona o lo
  -- propone el adaptador local de listas; nunca una consulta externa que no
  -- existe.
  is_pep          boolean not null default false,
  pep_detail      text,
  pep_checked_at  date,
  pep_source      text not null default 'adaptador_local'
                  check (pep_source in ('adaptador_local','captura_manual','proveedor_externo')),
  risk_level      text check (risk_level in ('bajo','medio','alto')),
  risk_reviewed_at date,
  next_risk_review date,
  identified_at   date,
  file_status     text not null default 'incompleto'
                  check (file_status in ('incompleto','completo','en_revision','observado')),
  notes           text,
  created_by      uuid references public.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists customers_organization_idx on public.customers (organization_id);
create index if not exists customers_branch_idx on public.customers (branch_id);
create index if not exists customers_rfc_idx on public.customers (organization_id, rfc);
create index if not exists customers_nombre_idx on public.customers using gin (full_name gin_trgm_ops);
create index if not exists customers_riesgo_idx on public.customers (organization_id, risk_level);
create index if not exists customers_pep_idx on public.customers (organization_id) where is_pep;

create trigger customers_set_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

-- ── beneficial_owners ───────────────────────────────────────────────────────
create table if not exists public.beneficial_owners (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_id     uuid not null references public.customers (id) on delete cascade,
  full_name       text not null,
  rfc             text,
  curp            text,
  nationality     text,
  birth_date      date,
  -- Porcentaje efectivo de participación, ya consolidado por la cadena.
  ownership_percent numeric(6,3) check (ownership_percent between 0 and 100),
  control_type    text not null default 'participacion'
                  check (control_type in ('participacion','control_efectivo','beneficio_economico','ultima_instancia','otro')),
  control_detail  text,
  is_pep          boolean not null default false,
  -- Cuando no se pudo determinar al beneficiario, la ley exige documentar el
  -- procedimiento seguido. Vale decir "no se determinó" con la evidencia; no
  -- vale dejarlo vacío.
  determination_status text not null default 'pendiente'
                  check (determination_status in ('pendiente','identificado','no_determinado')),
  determination_note text,
  identified_at   date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists beneficial_owners_customer_idx on public.beneficial_owners (customer_id);
create index if not exists beneficial_owners_organization_idx on public.beneficial_owners (organization_id);

create trigger beneficial_owners_set_updated_at before update on public.beneficial_owners
  for each row execute function public.set_updated_at();

-- ── ownership_relations (cadena de propiedad) ───────────────────────────────
create table if not exists public.ownership_relations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_id     uuid not null references public.customers (id) on delete cascade,
  parent_kind     text not null check (parent_kind in ('cliente','entidad','persona')),
  parent_ref      uuid,
  parent_name     text not null,
  child_kind      text not null check (child_kind in ('entidad','persona')),
  child_ref       uuid,
  child_name      text not null,
  percent         numeric(6,3) not null check (percent between 0 and 100),
  relation        text not null default 'accionista'
                  check (relation in ('accionista','socio','fideicomitente','fideicomisario','administrador','apoderado','otro')),
  depth           int not null default 1 check (depth >= 1),
  note            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists ownership_relations_customer_idx on public.ownership_relations (customer_id);
create index if not exists ownership_relations_organization_idx on public.ownership_relations (organization_id);

create trigger ownership_relations_set_updated_at before update on public.ownership_relations
  for each row execute function public.set_updated_at();

-- ── operations ──────────────────────────────────────────────────────────────
-- Espejo del tipo `Operacion` del contrato. Los importes son centavos enteros:
-- una operación de 75,664.95 pesos se guarda como 7566495.
create table if not exists public.operations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  branch_id       uuid references public.branches (id) on delete set null,
  customer_id     uuid references public.customers (id) on delete set null,
  external_ref    text,
  operation_date  date not null,
  activity_slug   text not null,
  subtype         text,
  amount_cents    public.centavos not null,
  cash_amount_cents public.centavos,
  commission_cents  public.centavos,
  amount_with_vat_cents public.centavos,
  payment_method  text not null default 'otro'
                  check (payment_method in ('efectivo','transferencia','cheque','tarjeta',
                                            'metales_preciosos','activos_virtuales','mixto','otro')),
  customer_type   text check (customer_type in ('persona_fisica','persona_moral','fideicomiso','desconocido')),
  on_behalf_of_customer boolean not null default false,
  amount_undeterminable boolean not null default false,
  variable_case   text,
  description     text,
  -- Resultado de `evaluarOperacion` en el momento de la captura, con la versión
  -- del corpus legal usada. Se guarda para poder explicar meses después por qué
  -- el sistema concluyó lo que concluyó.
  evaluation      jsonb,
  legal_version   text,
  evaluated_at    timestamptz,
  conclusion      text check (conclusion in ('sin_obligacion_aparente','requiere_identificacion',
                                             'proximo_al_aviso','aviso_probable',
                                             'requiere_revision_profesional','informacion_insuficiente')),
  notice_id       uuid,
  imported_batch  uuid,
  created_by      uuid references public.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists operations_organization_fecha_idx on public.operations (organization_id, operation_date desc);
create index if not exists operations_customer_idx on public.operations (customer_id, operation_date desc);
create index if not exists operations_branch_idx on public.operations (branch_id);
create index if not exists operations_activity_idx on public.operations (organization_id, activity_slug);
create index if not exists operations_conclusion_idx on public.operations (organization_id, conclusion);
create index if not exists operations_lote_idx on public.operations (imported_batch);

create trigger operations_set_updated_at before update on public.operations
  for each row execute function public.set_updated_at();

-- ── operation_accumulations ─────────────────────────────────────────────────
-- Resultado de la ventana móvil de seis meses. Se materializa porque es la
-- prueba de por qué se disparó (o no) un aviso en una fecha concreta.
create table if not exists public.operation_accumulations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_id     uuid not null references public.customers (id) on delete cascade,
  activity_slug   text not null,
  subtype         text,
  window_from     date not null,
  window_to       date not null,
  window_months   int not null default 6,
  total_cents     public.centavos not null default 0,
  threshold_cents public.centavos,
  reached         boolean not null default false,
  triggered_on    date,
  operation_ids   uuid[] not null default '{}',
  detail          jsonb,
  computed_at     timestamptz not null default now(),
  legal_version   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  check (window_to >= window_from)
);

create index if not exists operation_accumulations_customer_idx on public.operation_accumulations (customer_id, window_to desc);
create index if not exists operation_accumulations_organization_idx on public.operation_accumulations (organization_id);

create trigger operation_accumulations_set_updated_at before update on public.operation_accumulations
  for each row execute function public.set_updated_at();

-- ── risk_assessments / risk_factors ─────────────────────────────────────────
create table if not exists public.risk_assessments (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_id     uuid references public.customers (id) on delete cascade,
  scope           text not null default 'cliente' check (scope in ('cliente','producto','institucional')),
  assessed_on     date not null,
  raw_score       int not null check (raw_score between 0 and 100),
  final_score     int not null check (final_score between 0 and 100),
  level           text not null check (level in ('bajo','medio','alto')),
  enhanced_due_diligence boolean not null default false,
  next_review     date not null,
  methodology_version text not null default '1',
  explanation     text not null default '',
  mitigants       jsonb not null default '[]'::jsonb,
  assessed_by     uuid references public.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists risk_assessments_customer_idx on public.risk_assessments (customer_id, assessed_on desc);
create index if not exists risk_assessments_organization_idx on public.risk_assessments (organization_id, level);
create index if not exists risk_assessments_revision_idx on public.risk_assessments (organization_id, next_review);

create trigger risk_assessments_set_updated_at before update on public.risk_assessments
  for each row execute function public.set_updated_at();

create table if not exists public.risk_factors (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  assessment_id   uuid not null references public.risk_assessments (id) on delete cascade,
  key             text not null check (key in ('tipo_operacion','tipo_cliente','ubicacion_geografica',
                                               'canal_entrega','pep','beneficiario_controlador',
                                               'volumen_transaccional','medio_pago')),
  label           text not null,
  score           int not null check (score between 0 and 100),
  weight          numeric(5,4) not null check (weight >= 0 and weight <= 1),
  rationale       text,
  created_at      timestamptz not null default now()
);

create index if not exists risk_factors_assessment_idx on public.risk_factors (assessment_id);
create index if not exists risk_factors_organization_idx on public.risk_factors (organization_id);

-- ── alerts ──────────────────────────────────────────────────────────────────
create table if not exists public.alerts (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_id     uuid references public.customers (id) on delete set null,
  operation_id    uuid references public.operations (id) on delete set null,
  kind            text not null check (kind in ('umbral_aviso','umbral_identificacion','acumulacion',
                                                'limite_efectivo','pep','lista_riesgo','perfil_transaccional',
                                                'expediente_incompleto','revision_riesgo','otro')),
  severity        text not null default 'media' check (severity in ('baja','media','alta','critica')),
  title           text not null,
  detail          text not null default '',
  evidence        jsonb,
  -- Qué regla la generó, con qué versión y por qué. Un mecanismo automatizado
  -- sin trazabilidad no es auditable.
  rule_id         text,
  rule_version    int,
  status          text not null default 'abierta'
                  check (status in ('abierta','en_revision','resuelta','descartada')),
  assigned_to     uuid references public.users (id) on delete set null,
  resolved_at     timestamptz,
  resolved_by     uuid references public.users (id) on delete set null,
  resolution      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists alerts_organization_status_idx on public.alerts (organization_id, status, created_at desc);
create index if not exists alerts_customer_idx on public.alerts (customer_id);
create index if not exists alerts_operation_idx on public.alerts (operation_id);

create trigger alerts_set_updated_at before update on public.alerts
  for each row execute function public.set_updated_at();

-- ── cases ───────────────────────────────────────────────────────────────────
create table if not exists public.cases (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  code            text not null,
  title           text not null,
  summary         text not null default '',
  customer_id     uuid references public.customers (id) on delete set null,
  alert_ids       uuid[] not null default '{}',
  operation_ids   uuid[] not null default '{}',
  status          text not null default 'abierto'
                  check (status in ('abierto','en_investigacion','cerrado_sin_aviso','cerrado_con_aviso','escalado')),
  priority        text not null default 'media' check (priority in ('baja','media','alta')),
  opened_on       date not null default current_date,
  closed_on       date,
  conclusion      text,
  assigned_to     uuid references public.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  unique (organization_id, code)
);

create index if not exists cases_organization_status_idx on public.cases (organization_id, status);
create index if not exists cases_customer_idx on public.cases (customer_id);

create trigger cases_set_updated_at before update on public.cases
  for each row execute function public.set_updated_at();

-- ── documents ───────────────────────────────────────────────────────────────
-- Sólo metadatos: el archivo vive en Supabase Storage y su acceso se controla
-- con políticas del bucket. Aquí NUNCA se guarda contenido de e.firma.
create table if not exists public.documents (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_id     uuid references public.customers (id) on delete cascade,
  case_id         uuid references public.cases (id) on delete set null,
  operation_id    uuid references public.operations (id) on delete set null,
  kind            text not null check (kind in ('identificacion','comprobante_domicilio','constancia_fiscal',
                                                'acta_constitutiva','poder','contrato','factura',
                                                'estructura_accionaria','evidencia_capacitacion',
                                                'acuse_aviso','manual','otro')),
  title           text not null,
  storage_path    text,
  mime_type       text,
  size_bytes      bigint check (size_bytes is null or size_bytes >= 0),
  issued_on       date,
  expires_on      date,
  -- Conservación: DIEZ años (art. 18, fracción IV LFPIORPI), no cinco.
  --
  -- El comentario anterior decía cinco años y contradecía al corpus legal
  -- (`obligaciones.conservacion-diez-anios`). Un plazo mal documentado aquí se
  -- convierte en documentación borrada antes de tiempo, que es justo lo que la
  -- autoridad sanciona en una verificación.
  --
  -- La columna NO se calcula sola a propósito: el cómputo del plazo depende de
  -- cuándo se considera concluida la operación, y esa decisión es del sujeto
  -- obligado, no nuestra. La app la propone y la persona la confirma.
  retain_until    date,
  uploaded_by     uuid references public.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists documents_customer_idx on public.documents (customer_id);
create index if not exists documents_organization_idx on public.documents (organization_id, kind);
create index if not exists documents_retencion_idx on public.documents (organization_id, retain_until);

create trigger documents_set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

-- ── notice_records (avisos) ─────────────────────────────────────────────────
-- NO EXISTE el estado "enviado": LeyAntilavado.org no presenta avisos ante el
-- SAT ni ante la UIF, y no hay integración oficial que lo permita. El flujo
-- termina en `exportado`, y `acknowledged` sólo se marca cuando la persona
-- usuaria sube el acuse que le devolvió el portal SPPLD.
create table if not exists public.notice_records (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  period          text not null check (period ~ '^[0-9]{4}-[0-9]{2}$'),
  activity_slug   text not null,
  reference       text,
  operation_ids   uuid[] not null default '{}',
  customer_id     uuid references public.customers (id) on delete set null,
  amount_cents    public.centavos,
  due_date        date not null,
  status          text not null default 'borrador'
                  check (status in ('borrador','en_revision','aprobado','exportado','con_acuse','no_procede')),
  prepared_by     uuid references public.users (id) on delete set null,
  prepared_at     timestamptz,
  reviewed_by     uuid references public.users (id) on delete set null,
  reviewed_at     timestamptz,
  approved_by     uuid references public.users (id) on delete set null,
  approved_at     timestamptz,
  exported_at     timestamptz,
  export_format   text check (export_format in ('csv','json')),
  -- Acuse que devuelve el portal oficial. Lo carga la persona usuaria.
  acknowledgement_ref text,
  acknowledgement_at  date,
  acknowledgement_document_id uuid references public.documents (id) on delete set null,
  payload         jsonb,
  legal_version   text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists notice_records_organization_idx on public.notice_records (organization_id, period desc);
create index if not exists notice_records_status_idx on public.notice_records (organization_id, status);
create index if not exists notice_records_vencimiento_idx on public.notice_records (organization_id, due_date);

create trigger notice_records_set_updated_at before update on public.notice_records
  for each row execute function public.set_updated_at();

comment on column public.notice_records.status is
  'borrador → en_revision → aprobado → exportado → con_acuse. No hay estado "enviado": el envío al portal SPPLD lo hace la persona usuaria.';

-- ── training_records ────────────────────────────────────────────────────────
create table if not exists public.training_records (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  person_name     text not null,
  person_email    text,
  member_id       uuid references public.organization_members (id) on delete set null,
  course_name     text not null,
  provider        text,
  course_id       uuid references public.courses (id) on delete set null,
  hours           numeric(5,1) check (hours is null or hours >= 0),
  completed_on    date not null,
  valid_until     date,
  certificate_document_id uuid references public.documents (id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists training_records_organization_idx on public.training_records (organization_id, completed_on desc);

create trigger training_records_set_updated_at before update on public.training_records
  for each row execute function public.set_updated_at();

-- ── audits / audit_findings / remediation_actions ───────────────────────────
create table if not exists public.audits (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title           text not null,
  scope           text not null default '',
  kind            text not null default 'interna' check (kind in ('interna','externa','autoevaluacion')),
  auditor_name    text,
  auditor_credential text,
  period_from     date,
  period_to       date,
  started_on      date,
  finished_on     date,
  status          text not null default 'planeada'
                  check (status in ('planeada','en_curso','cerrada','cancelada')),
  conclusion      text,
  report_document_id uuid references public.documents (id) on delete set null,
  created_by      uuid references public.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  check (period_to is null or period_from is null or period_to >= period_from)
);

create index if not exists audits_organization_idx on public.audits (organization_id, status);

create trigger audits_set_updated_at before update on public.audits
  for each row execute function public.set_updated_at();

create table if not exists public.audit_findings (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  audit_id        uuid not null references public.audits (id) on delete cascade,
  code            text,
  title           text not null,
  detail          text not null default '',
  severity        text not null default 'media' check (severity in ('baja','media','alta','critica')),
  obligation_slug text,
  evidence        text,
  status          text not null default 'abierto'
                  check (status in ('abierto','en_remediacion','cerrado','aceptado')),
  detected_on     date not null default current_date,
  closed_on       date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists audit_findings_audit_idx on public.audit_findings (audit_id);
create index if not exists audit_findings_organization_idx on public.audit_findings (organization_id, status);

create trigger audit_findings_set_updated_at before update on public.audit_findings
  for each row execute function public.set_updated_at();

create table if not exists public.remediation_actions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  finding_id      uuid not null references public.audit_findings (id) on delete cascade,
  action          text not null,
  owner_name      text,
  owner_user_id   uuid references public.users (id) on delete set null,
  due_date        date,
  status          text not null default 'pendiente'
                  check (status in ('pendiente','en_curso','completada','vencida','cancelada')),
  completed_on    date,
  evidence_document_id uuid references public.documents (id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists remediation_actions_finding_idx on public.remediation_actions (finding_id);
create index if not exists remediation_actions_organization_idx on public.remediation_actions (organization_id, status, due_date);

create trigger remediation_actions_set_updated_at before update on public.remediation_actions
  for each row execute function public.set_updated_at();

-- ── policy_versions (manual de cumplimiento) ────────────────────────────────
create table if not exists public.policy_versions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  kind            text not null default 'manual'
                  check (kind in ('manual','politica_conocimiento_cliente','matriz_riesgos','codigo_conducta','otro')),
  version         text not null,
  title           text not null,
  summary         text not null default '',
  body            text,
  document_id     uuid references public.documents (id) on delete set null,
  status          text not null default 'borrador'
                  check (status in ('borrador','en_revision','vigente','sustituida')),
  effective_from  date,
  effective_to    date,
  approved_by     uuid references public.users (id) on delete set null,
  approved_at     timestamptz,
  change_reason   text,
  supersedes_id   uuid references public.policy_versions (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  unique (organization_id, kind, version)
);

create index if not exists policy_versions_organization_idx on public.policy_versions (organization_id, kind, status);

create trigger policy_versions_set_updated_at before update on public.policy_versions
  for each row execute function public.set_updated_at();

-- La FK de operations → notice_records se añade aquí porque notice_records se
-- crea después.
alter table public.operations
  drop constraint if exists operations_notice_id_fkey;
alter table public.operations
  add constraint operations_notice_id_fkey
  foreign key (notice_id) references public.notice_records (id) on delete set null;

create index if not exists operations_notice_idx on public.operations (notice_id);
