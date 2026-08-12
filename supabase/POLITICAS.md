# Políticas RLS: qué protege cada una

**La matriz de permisos de TypeScript no es una frontera de seguridad.**
`MATRIZ_PERMISOS` en `packages/types/src/directorio.ts` decide qué botón se
dibuja. Cualquiera puede abrir la consola del navegador y llamar a PostgREST
directamente con su propio JWT, saltándose por completo la interfaz. Lo único
que decide qué se puede leer y escribir son las políticas de este documento.

Regla de lectura: **en RLS, lo que no tiene política está prohibido.** Cuando
abajo se dice "sin política de UPDATE", significa que ese `UPDATE` falla para
todo el mundo, incluido el propietario de la organización.

---

## Las funciones de acceso

Definidas en `0003_funciones_acceso.sql`. Todas son `SECURITY DEFINER` y
`STABLE`, con `set search_path = public, pg_temp`.

| Función | Devuelve true para |
|---|---|
| `rol_en(org)` | el rol del usuario en esa organización, o `null` |
| `es_miembro_de(org)` | cualquier miembro activo |
| `puede_administrar(org)` | propietario, administrador |
| `es_propietario(org)` | propietario |
| `puede_escribir_operativo(org)` | propietario, administrador, analista |
| `puede_auditar(org)` | propietario, administrador, **auditor** |
| `puede_aprobar_avisos(org)` | propietario, administrador |
| `es_staff()` | personal de LeyAntilavado.org (`users.is_staff`) |

### Por qué `SECURITY DEFINER` y no una subconsulta

**Agujero que cierra: recursión infinita.** Una política sobre
`organization_members` que consultara `organization_members` se llamaría a sí
misma. `SECURITY DEFINER` ejecuta la función como su dueño y no dispara RLS.

**Agujero que cierra: rendimiento que se convierte en denegación de servicio.**
`STABLE` permite a Postgres evaluar la función una vez por consulta en lugar de
una vez por fila. Con la subconsulta repetida en cada política, listar 10 000
operaciones haría 10 000 comprobaciones de membresía.

**Agujero que cierra: secuestro del `search_path`.** Sin `set search_path`, un
esquema controlado por el atacante y colocado antes de `public` podría
suplantar `organization_members` y hacer que `es_miembro_de` devolviera `true`
siempre.

---

## Identidad

### `users`

| Operación | Política |
|---|---|
| SELECT | el propio perfil, los compañeros de organización, o staff |
| INSERT | **ninguna** — el perfil lo crea el trigger `on_auth_user_created` |
| UPDATE | el propio perfil, o staff |
| DELETE | **ninguna** — se borra la cuenta en `auth.users` y cae en cascada |

**Agujero que cierra el SELECT acotado:** sin él, `select * from users` desde el
navegador devolvería el directorio completo de correos de la plataforma. Con él,
sólo se ven las personas con las que se comparte organización.

**Agujero que cierra el trigger `users_sin_autopromocion`:** un usuario podía
ejecutar `update users set is_staff = true where id = auth.uid()` y entrar al
panel administrativo, porque la política de UPDATE del propio perfil lo permite.
RLS **no puede** comparar el valor viejo con el nuevo dentro de un `WITH CHECK`
—sólo ve la fila resultante—, así que la única forma de blindar esas columnas es
un trigger `BEFORE UPDATE`.

### `organizations`

SELECT para miembros y staff · INSERT para cualquier autenticado (con
`created_by = auth.uid()`) · UPDATE para `puede_administrar` · DELETE sólo para
el propietario.

**Agujero que cierra `created_by = auth.uid()` en el INSERT:** sin eso, alguien
podría crear una organización a nombre de otra persona; el trigger
`organizations_alta_propietario` la haría propietaria de una organización que no
pidió.

### `organization_members` — la más importante

```sql
create policy organization_members_update on public.organization_members
  for update to authenticated
  using (
    public.puede_administrar(organization_id)
    and user_id <> auth.uid()
    and (role <> 'propietario' or public.es_propietario(organization_id))
  )
  with check ( ...lo mismo... );
```

**Agujero que cierra `user_id <> auth.uid()`: la autoelevación.** Sin esa
condición, cualquier administrador podría ejecutar

```sql
update organization_members set role = 'propietario' where user_id = auth.uid();
```

y ascenderse solo. Con la exclusión, **cambiar un rol siempre requiere a otra
persona**. Es la misma razón por la que nadie firma su propio cheque.

**Agujero que cierra `role <> 'propietario' or es_propietario(...)`:** un
administrador podía nombrar propietario a un cómplice —o a sí mismo por
interpósita persona— y recuperar por la puerta de atrás el nivel que la
condición anterior le niega.

**Agujero que cierra el trigger `impedir_autoelevacion`:** la política sólo
aplica al rol `authenticated`. Un script con la clave de servicio o una
migración descuidada se la saltaría. El trigger corre siempre.

**Agujero que cierra el trigger `proteger_ultimo_propietario`:** degradar o
eliminar al último propietario dejaba la organización sin nadie capaz de
administrarla, recuperable sólo a mano desde la consola.

**Por qué existe `organization_members_delete_propio`:** salir de una
organización por voluntad propia es legítimo; ascenderse no lo es. Son dos cosas
distintas y por eso son dos políticas distintas.

### `audit_logs` — append-only

**Sólo existe política de SELECT** (staff, o propietario/administrador/auditor
de la organización). No hay política de INSERT, UPDATE ni DELETE.

**Agujero que cierra:** una bitácora que el auditado puede editar no sirve de
nada. Sin políticas de escritura, ni siquiera el propietario puede alterar o
borrar un registro desde la aplicación. Las inserciones las hace el trigger
`registrar_bitacora`, que es `SECURITY DEFINER` y no pasa por RLS.

**Por qué `audit_logs.organization_id` no tiene clave foránea:** si la tuviera
con `on delete cascade`, borrar la organización borraría su propia auditoría. Un
log que se borra en cascada con lo que audita no es un log.

---

## Núcleo de cumplimiento (`0008`)

Patrón para `customers`, `beneficial_owners`, `ownership_relations`,
`operations`, `operation_accumulations`, `risk_assessments`, `risk_factors`,
`alerts`, `cases`, `documents`, `training_records`:

| Operación | Quién |
|---|---|
| SELECT | `es_miembro_de(organization_id)` |
| INSERT | `puede_escribir_operativo(organization_id)` |
| UPDATE | `puede_escribir_operativo(organization_id)` |
| DELETE | `puede_administrar(organization_id)` |

**Agujero que cierra el aislamiento por `organization_id`:** es *el* riesgo de
cualquier producto multiempresa. Sin él, cambiar un identificador en la URL —o
simplemente pedir la tabla entera a PostgREST— entregaría los expedientes de los
clientes de otro despacho. Aquí no se filtra en la consulta de la aplicación (que
se puede modificar desde el navegador), sino en la base.

**Agujero que cierran las políticas separadas por operación:** con una sola
`FOR ALL`, la expresión `USING` se reutiliza como `WITH CHECK` y resulta
imposible expresar "lees todo pero escribes nada". Los roles `auditor` y
`consulta` dejarían de distinguirse del `analista`.

**Cómo queda cada rol:**

- `consulta` — no aparece en ninguna función de escritura: **no escribe nada**,
  en ninguna tabla.
- `auditor` — sólo lee los datos operativos, y escribe **exclusivamente** en
  `audits`, `audit_findings` y `remediation_actions`. Es la única puerta de
  escritura que tiene.
- `analista` — opera, pero no aprueba avisos, no toca la configuración de la
  organización ni a los miembros, y no puede borrar físicamente nada.

**Agujero que cierra el DELETE restringido a administración:** el borrado lógico
(`deleted_at`) conserva la fila para el auditor. Si el analista pudiera hacer
`delete`, la evidencia de una operación incómoda desaparecería sin rastro. La
recuperación es un `update` que pone `deleted_at = null`, y como todo `update`
queda en la bitácora.

### `notice_records` (avisos)

```sql
with check (
  public.puede_escribir_operativo(organization_id)
  and (status in ('borrador','en_revision','no_procede')
       or public.puede_aprobar_avisos(organization_id))
)
```

**Agujero que cierra:** el analista prepara el aviso, pero no se lo aprueba a sí
mismo. `WITH CHECK` mira la fila **resultante**, así que no hay forma de dejar
una fila en `aprobado` o `exportado` sin el rol de administración —ni siquiera
en dos pasos.

**Por qué no existe el estado `enviado`:** LeyAntilavado.org no presenta avisos
ante el SAT ni ante la UIF. No hay integración oficial que lo permita. El CHECK
de la columna hace imposible representar un envío que no ocurre.

### `policy_versions` (manual de cumplimiento)

Redactar un borrador es escritura operativa; ponerlo `vigente` es un acto de
gobierno y lo exige `puede_administrar`, comprobado en el `WITH CHECK`.

### Trigger `verificar_organizacion_coherente`

**Agujero que cierra: la contaminación cruzada entre organizaciones propias.**
RLS comprueba `organization_id` fila a fila, pero nada impedía colgar un cliente
de la organización A de una operación de la organización B si el usuario es
miembro de las dos. El trigger verifica que el `customer_id` referenciado
pertenezca a la misma organización que la fila.

---

## Corpus legal (`0004`) y contenido editorial (`0005`)

| Operación | Quién |
|---|---|
| SELECT | `anon` y `authenticated`, **sólo `status = 'publicado'`**; staff ve todo |
| INSERT / UPDATE | `es_staff()` |
| DELETE | **ninguna** en el corpus legal |

**Agujero que cierra el filtro por `status`:** estas tablas alimentan páginas
públicas. Sin el filtro, un borrador con una cifra sin verificar sería legible
—y citable— por cualquiera antes de pasar revisión editorial.

**Agujero que cierra la ausencia de DELETE:** una regla histórica borrada hace
imposible explicar por qué una operación de 2024 se evaluó como se evaluó. Se
sustituye (`status = 'sustituido'`, `valid_to`), nunca se borra.

**Agujero que cierran los triggers de `0010`:** un `update` directo sobre
`threshold_rules` sobreescribiría la regla anterior sin dejar rastro.
`versionar_contenido` guarda la versión previa completa en `content_revisions`
con autor, fecha, campos modificados y motivo, **antes** de que el cambio quede
firme. No depende del código de la aplicación: también cubre los cambios hechos
desde el editor SQL de Supabase.

`content_revisions` tiene **sólo política de SELECT**, igual que `audit_logs`:
el historial de revisiones no se puede reescribir.

---

## Directorio (`0006`)

**Agujero que cierra el trigger `proteger_verificacion_proveedor`:** el
proveedor edita su propia ficha —eso está bien— pero podía ejecutar

```sql
update provider_profiles set verification_level = 'documentacion_revisada'
where owner_id = auth.uid();
```

y colgarse una insignia de verificación que nadie revisó. El trigger bloquea
`verification_level`, `sponsored`, `plan`, `verified_at` y `verified_by` para
todo el que no sea staff. Vale también para `sponsored`: la etiqueta
"Patrocinado" es obligatoria y no puede quitársela quien paga.

**`provider_credentials` no es pública:** contiene folios y URLs de documentos.
Sólo la ve el titular del perfil y el equipo de moderación, aunque el perfil sí
sea público.

**`provider_leads`:** INSERT abierto (el formulario público), pero SELECT
únicamente para el proveedor destinatario y para staff. Además, la columna
`consent` lleva `CHECK (consent)`: **no se puede guardar un lead sin
consentimiento explícito**, ni por error de la aplicación.

---

## Plataforma (`0009`)

**`newsletter_subscribers`:** INSERT abierto, SELECT sólo para staff.

*Agujero que cierra:* con SELECT abierto, la lista completa de correos de
suscriptores sería descargable por cualquiera. Es exactamente el incidente que
sufren la mitad de los sitios con newsletter.

**`notifications`:** SELECT y UPDATE sólo del destinatario, y **sin política de
INSERT**. Nadie puede fabricarle notificaciones a otra persona desde el
navegador; las crea el servidor con la clave de servicio.

**`saved_tool_results`:** propias del usuario o de su organización. `share_token`
es nulo por omisión: compartir es una decisión, no el estado por defecto.

**`source_checks`:** sólo lectura para staff. Las escribe la tarea programada.

---

## Cómo verificar que RLS de verdad aísla

No basta con leer las políticas. Estas comprobaciones se corren contra la base
—en local con `supabase db reset`— antes de dar por buena cualquier migración.

**1. Ninguna tabla con datos de organización se quedó sin RLS.**

```sql
select c.relname
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
join information_schema.columns col
  on col.table_name = c.relname and col.column_name = 'organization_id'
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
-- Debe devolver CERO filas.
```

**2. Ninguna tabla con RLS se quedó sin políticas** (con RLS activo y sin
políticas, la tabla queda ilegible para todos, que es un fallo silencioso
igual de malo):

```sql
select c.relname
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
  and not exists (select 1 from pg_policy p where p.polrelid = c.oid);
```

**3. Aislamiento real entre dos organizaciones.** Con dos usuarios de prueba
en organizaciones distintas:

```sql
set local role authenticated;
set local request.jwt.claims = '{"sub":"<uuid-del-usuario-A>","role":"authenticated"}';
select count(*) from customers;  -- sólo los de la organización de A
```

**4. La autoelevación falla.** Como administrador de una organización:

```sql
update organization_members set role = 'propietario' where user_id = auth.uid();
-- 0 filas afectadas (la política) o excepción (el trigger).
```

**5. La bitácora es inmutable.**

```sql
update audit_logs set summary = 'otra cosa' where true;  -- 0 filas
delete from audit_logs where true;                        -- 0 filas
```

**6. El auditor no escribe datos operativos.** Con un usuario de rol `auditor`:

```sql
insert into customers (organization_id, person_type, full_name)
values ('<org>', 'persona_fisica', 'Prueba');
-- new row violates row-level security policy
insert into audit_findings (organization_id, audit_id, title)
values ('<org>', '<auditoria>', 'Hallazgo');
-- OK
```
