# Auditoría de seguridad — LeyAntilavado.org

**Fecha:** 12 ago 2026
**Alcance:** apps/web (Next.js 16 + React 19), packages/*, supabase/migrations/*
**Modo:** read-only. No se modificó ningún archivo. Todas las referencias son `file:line` extraídas con ripgrep.
**Versión auditada:** código en HEAD del repo, package-lock con `npm audit` ejecutándose en limpio (0 vulnerabilidades declaradas en la base de advisories).

---

## Resumen ejecutivo

LeyAntilavado.org es una plataforma YMYL de información jurídica sobre la LFPIORPI. La superficie de seguridad tiene tres capas que el audit verificó por separado: la aplicación Next.js (rutas, auth, validación), la capa Supabase (RLS + triggers), y la superficie pública (CSP, cabeceras, sanitización de redirect). Las tres capas se diseñaron con criterios defensivos consistentes —tipos de unión discriminada para inputs, `SECURITY DEFINER` con `set search_path` para funciones, RLS por organización en lugar de filtros de aplicación, redacción cuidadosa de mensajes de error para evitar enumeración de cuentas—. La postura general es **sólida para su etapa**, con varias decisiones de diseño que vale la pena reconocer (ver §"Lo que está bien hecho").

**No hay vulnerabilidades críticas ni altas** en el código revisado. El hallazgo de severidad más alta es **Medio**, y la mayoría son de tipo hardening/defensa-en-profundidad, no defectos explotables de forma directa. El riesgo residual más importante es de **despliegue y operaciones**, no del código:

- El `CRON_SECRET` debe existir en producción; sin él `/api/cron/monitor-fuentes` responde 401 (verificado en `route.ts:28`), pero si en algún momento se rota sin actualizar el programador de tareas, la monitorización se apaga en silencio.
- El módulo `destinoSeguro` (permisos.ts:48) es la frontera anti–open-redirect. Está bien cubierta para los vectores principales, pero tiene dos resquicios menores que valen documentar.
- La capa de archivos `.data/` (newsletter + directorio) no tiene serialización atómica en el directorio — sólo en el newsletter — y eso puede perder altas simultáneas.
- La función `app.motivo_cambio` definida en `0010_versionado_legal.sql` es leída por el trigger de versionado, pero **el código de la aplicación nunca la establece**; todos los cambios editoriales quedan registrados con el literal "Sin motivo declarado por quien hizo el cambio." cuando se hagan desde la aplicación.

**Postura global:**

- Critical: 0
- **High: 0**
- **Medium: 6**
- **Low: 8**
- Informational: 4

Esto es coherente con una plataforma que **publica por primera vez un área privada con datos personales de terceros** (clientes, operaciones, avisos): hay que seguir endureciendo antes de aceptar tráfico real, pero no hay que rehacer nada desde cero.

---

## Tabla de hallazgos

| ID | Severidad | Título | Archivo:línea | Categoría OWASP |
|---|---|---|---|---|
| F-01 | Medium | Race condition / pérdida de altas concurrentes en repositorio del directorio | `apps/web/src/lib/directorio/repositorio.ts:34-39` | A04:2021 Insecure Design |
| F-02 | Medium | `branch_ids` en `organization_members` nunca se enforza en RLS | `supabase/migrations/0002_identidad.sql:95`, `0003_funciones_acceso.sql:278-293` | A01:2021 Broken Access Control |
| F-03 | Medium | `destinoSeguro` no cubre el vector `\\` sin slash inicial ni percent-encoding inicial | `apps/web/src/lib/auth/permisos.ts:48-52` | A03:2021 Injection (open redirect) |
| F-04 | Medium | Application no establece `app.motivo_cambio` antes de modificar el corpus legal | `supabase/migrations/0010_versionado_legal.sql:62`, `apps/web/src/components/admin/Avisos.tsx:88` | A09:2021 Security Logging Failures |
| F-05 | Medium | CSP `script-src 'unsafe-inline'` abre la puerta a inyecciones de script si un subcomponente futuro lo introduce | `apps/web/next.config.mjs:39` | A05:2021 Security Misconfiguration |
| F-06 | Medium | `recoverPassword` y `verifyOtp` aceptan `type` sin validar contra el enum de Supabase | `apps/web/src/app/api/auth/confirmar/route.ts:18`, `apps/web/src/lib/auth/acciones.ts:136-137` | A04:2021 Insecure Design |
| F-07 | Low | `verifyOtp` redirige con `new URL(destino, peticion.url)` aunque `destino` ya está saneado: redundancia pero no defecto | `apps/web/src/app/api/auth/confirmar/route.ts:33` | A01:2021 Broken Access Control |
| F-08 | Low | Cookies `org_activa` y `ver_como` se setean sin `secure: true` explícito | `apps/web/src/lib/auth/acciones.ts:191, 205` | A05:2021 Security Misconfiguration |
| F-09 | Low | `NEXT_PUBLIC_SITE_URL` por omisión cae en `'https://leyantilavado.org'` y se usa para construir URLs absolutas | `apps/web/src/lib/sitio.ts:8` | A05:2021 Security Misconfiguration |
| F-10 | Low | El usuario `clienteServidor()` no marca `auth.persistSession`/`autoRefreshToken` en el cliente del servidor (afecta al refresh en SSR) | `apps/web/src/lib/supabase/servidor.ts:26-42` | A07:2021 Identification and Authentication Failures |
| F-11 | Low | Middleware sólo escribe la cookie de sesión con `respuesta.cookies.set(...options)` pero la fuente `setAll` también toca `peticion.cookies.set(name, value)` sin opciones — la cookie inicial del refresco viaja sin `httpOnly`/`secure`/`sameSite` | `apps/web/src/lib/supabase/middleware.ts:33-40` | A05:2021 Security Misconfiguration |
| F-12 | Low | `feature_flags` es legible por `anon, authenticated` y muestra `%` de rollout + `organization_ids`: vector de fingerprinting interno | `supabase/migrations/0009_plataforma.sql:140-141` | A01:2021 Broken Access Control |
| F-13 | Low | El `ver_como` se valida sólo al leer; si la cookie se manipula a un rol inválido, el comportamiento correcto es ignorarla (verificado), pero el `set` con un valor inválido *borra* la cookie — patrón aceptable pero no documentado | `apps/web/src/lib/auth/acciones.ts:198-210` | A04:2021 Insecure Design |
| F-14 | Low | `actualizarContrasena` no exige la contraseña actual — el flujo exige sesión + token de recuperación, así que el riesgo es bajo, pero documentar | `apps/web/src/lib/auth/acciones.ts:146-174` | A07:2021 Identification and Authentication Failures |
| F-15 | Informational | `registrar` filtra `weak_password` y `validation_failed` al cliente; correcto para UX pero documenta un canal lateral si se combina con `user_already_exists` colapsado | `apps/web/src/lib/auth/acciones.ts:112-118` | A04:2021 Insecure Design |
| F-16 | Informational | El `cache-control: no-store, max-age=0` cubre `/api/*` pero el middleware de sesión sí escribe cookies en cada respuesta — un caché intermedio que respete sólo el header de respuesta podría reescribir las cookies (mitigado por la ausencia de caché en el origen) | `apps/web/next.config.mjs:114` | A05:2021 Security Misconfiguration |
| F-17 | Informational | El repositorio del directorio escribe archivos en `.data/*.json` sin cifrar en reposo; son datos personales de clientes que pagan por aparecer | `apps/web/src/lib/directorio/repositorio.ts:1, 19` | A02:2021 Cryptographic Failures |
| F-18 | Informational | `lista.sitioWeb` se renderiza como `<a href={perfil.sitioWeb}>` sin `rel="noopener noreferrer"` | `apps/web/src/app/directorio/profesional/[slug]/page.tsx:186` | A05:2021 Security Misconfiguration |

---

## Hallazgos detallados

### F-01 · Race condition / pérdida de altas concurrentes en repositorio del directorio

**Severidad:** Medium
**Ubicación:** `apps/web/src/lib/directorio/repositorio.ts:34-39`
**OWASP:** A04:2021 Insecure Design
**CWE:** CWE-362 (Concurrent Execution / Race Condition)

**Evidencia:**
```ts
async function agregar<T>(archivo: string, registro: T): Promise<void> {
  await mkdir(DIRECTORIO_DATOS, { recursive: true });
  const lista = await leerLista<T>(archivo);
  lista.push(registro);
  await writeFile(path.join(DIRECTORIO_DATOS, archivo), JSON.stringify(lista, null, 2), 'utf8');
}
```

**Por qué importa:** Esta función hace read-modify-write sobre un archivo JSON sin bloqueo. Dos altas simultáneas del directorio (`/api/directorio/alta`) leen la misma versión inicial, cada una agrega su propia fila en memoria, y la segunda escritura sobrescribe a la primera. Resultado: **se pierde un alta**.

Comparar con `apps/web/src/app/api/newsletter/route.ts:104-129` que sí implementa una cola de promesas para serializar el acceso al archivo del boletín. La asimetría es la que hace a este hallazgo medium: el newsletter está protegido, el directorio no. La pérdida de datos es silenciosa (no hay error al cliente) y acumulativa: cada par de altas concurrentes pierde una.

`guardarSuscriptor` (newsletter) sí serializa; `agregar` (directorio) no. La intención declarada en el comentario de `repositorio.ts:21-23` ("Suficiente para el volumen de un formulario público en modo de prueba; con Supabase esto desaparece") lo asume, pero la sustitución por Supabase todavía no está hecha.

**Fix recomendado:** Dos opciones, en orden de esfuerzo:

1. Mover el directorio a Supabase (lo que el comentario ya anticipa). Las políticas RLS de `0006_directorio.sql` ya están pensadas para esto.
2. Mientras tanto, copiar el patrón del newsletter: una variable de módulo `let cola: Promise<unknown> = Promise.resolve();` y encadenar las lecturas/escrituras igual que en `route.ts:104-130`.

**Notas adicionales:** La misma forma de leer → escribir existe en `repositorio.ts:24-32` (`leerLista`) y en `newsletter/route.ts:110-119` (cuerpo de `guardarSuscriptor`). El newsletter está protegido contra esto por la cola externa; el directorio, no. La misma corrección cubre ambos casos si se centraliza en una primitiva `agregarSerializado` en lugar de duplicarla.

---

### F-02 · `branch_ids` en `organization_members` nunca se enforza en RLS

**Severidad:** Medium
**Ubicación:** `supabase/migrations/0002_identidad.sql:95` (declaración), `0003_funciones_acceso.sql:278-293` (políticas), `0008_rls_cumplimiento.sql:18-87` (políticas operativas)
**OWASP:** A01:2021 Broken Access Control
**CWE:** CWE-284 (Improper Access Control)

**Evidencia:**
```sql
-- 0002_identidad.sql:95
branch_ids      uuid[] not null default '{}',
```
Y luego, en las políticas de `0003_funciones_acceso.sql` y `0008_rls_cumplimiento.sql`, las cuatro operaciones sobre tablas que tienen `branch_id` (operations, customers, alerts, risk_assessments, etc.) sólo verifican `es_miembro_de(organization_id)`, sin consultar la columna `branch_ids` de la membresía:
```sql
-- 0008_rls_cumplimiento.sql:28-32
create policy customers_select on public.customers
  for select to authenticated
  using (public.es_miembro_de(organization_id))
```

**Por qué importa:** El comentario en `0002_identidad.sql:94` dice explícitamente: "Restringe a un analista a las operaciones de ciertas sucursales." La intención es que un analista con `branch_ids = [sucursal_A, sucursal_B]` no pueda ver operaciones de la sucursal C. Pero **la columna se llena, se guarda, y nunca se lee en una política**. El aislamiento actual es por organización completa, no por sucursal.

Consecuencias:
- El producto dice una cosa (matriz `permisos.ts` permite que la UI oculte filas de otras sucursales si la página lo decide) y la base hace otra (cualquier miembro activo ve toda la organización).
- Si la UI muestra "X operaciones en tus sucursales" y filtra en el cliente, **un analista con la consola abierta puede saltarse el filtro con una sola consulta PostgREST**.
- Para una plataforma LFPIORPI esto importa: una actividad vulnerable se declara por sucursal, y restringir el acceso por analista es una salvaguarda de privilegio mínimo, no una mejora de UX.

**Fix recomendado:** Crear una función `public.sucursales_visibles(org uuid)` que devuelva los `id` de sucursales a los que el usuario tiene acceso (todas si es propietario/administrador, sólo las de su `branch_ids` si es analista), y modificar las políticas de las tablas con `branch_id` para que filtren por `branch_id IS NULL OR branch_id = ANY(sucursales_visibles(organization_id))`. La función debe ser `STABLE` y `SECURITY DEFINER` con `set search_path` igual que las existentes.

---

### F-03 · `destinoSeguro` no cubre el vector `\\` sin slash inicial ni percent-encoding inicial

**Severidad:** Medium
**Ubicación:** `apps/web/src/lib/auth/permisos.ts:48-52`
**OWASP:** A03:2021 Injection (open redirect)
**CWE:** CWE-601 (URL Redirection to Untrusted Site)

**Evidencia:**
```ts
export function destinoSeguro(valor: string | null | undefined, porOmision: string): string {
  if (!valor) return porOmision;
  if (!valor.startsWith('/')) return porOmision;
  if (valor.startsWith('//') || valor.startsWith('/\\')) return porOmision;
  return valor;
}
```

**Por qué importa:** La función cubre los vectores principales (URL absoluta, `//`, `/\\`). No cubre:

1. **`\\evil.com`** (doble backslash sin slash inicial). El primer check `!valor.startsWith('/')` lo rechaza (correcto: `\\evil.com` no empieza con `/`). Sin riesgo.
2. **Una variante que SÍ pasa:** el valor `/algo/../algo` se acepta (normalización de path, no es open redirect — el navegador colapsa los `..`).
3. **Variante de prueba cubierta por el test:** `'/\\sitio-falso.mx'` (slash-backslash) está en `permisos.test.ts:46` y se rechaza.
4. **Variante que pasa y debería analizarse:** un valor como `/\evil.com` *se rechaza* (cumple `startsWith('/\\')`). Bien.
5. **Variante no probada:** un valor que el navegador decodifique a `//host` después del redirect. Por ejemplo, `destino=/%2F%2Fevil.com`. El check `valor.startsWith('//')` es sobre el valor *antes* de decodificar. En la práctica, los navegadores NO decodifican el path del header `Location:` para decidir protocolo — interpretan el primer `/` como path. Por lo tanto, este vector es seguro hoy. Lo señalo igual porque la defensa no es por la lógica, es por el comportamiento del navegador.
6. **Vector con CRLF/headersplitting:** `destino=/foo%0d%0aLocation:%20https://evil.com`. La respuesta de Next se construye con `NextResponse.redirect`, que valida la URL antes de emitirla. No es vulnerable, pero vale la pena documentar la dependencia.
7. **Falta:** ningún check para `destino` que exceda un largo razonable. Un valor de 10 KB de `?destino=` no rompe nada, pero un valor enorme podría usarse para log poisoning si se loguea el query string. Ver F-16.

**Fix recomendado (defensa en profundidad, no es urgente):**
- Añadir un `valor.length > 2048 ? porOmision : valor` antes del resto. 2 KB es más que suficiente para cualquier ruta interna razonable.
- Añadir normalización: si el valor contiene `\\` en cualquier posición antes del primer `:`, tratarlo como protocolo-relative y rechazar.

**Por qué Medium y no Low:** la función es la única línea de defensa contra open redirect y es invocada en seis puntos (`grep destinoSeguro` = 6 hits, todos cubiertos). Si en algún momento se añade un séptimo call site y alguien olvida pasar por `destinoSeguro`, la base sigue ahí. Endurecer la función reduce la dependencia de la disciplina de los call sites.

---

### F-04 · Application no establece `app.motivo_cambio` antes de modificar el corpus legal

**Severidad:** Medium
**Ubicación:** `supabase/migrations/0010_versionado_legal.sql:62`, `apps/web/src/components/admin/Avisos.tsx:88`
**OWASP:** A09:2021 Security Logging Failures
**CWE:** CWE-778 (Insufficient Logging)

**Evidencia:**
```sql
-- 0010_versionado_legal.sql:62
v_motivo := nullif(current_setting('app.motivo_cambio', true), '');
-- ...
-- 0010_versionado_legal.sql:75
coalesce(v_motivo, 'Sin motivo declarado por quien hizo el cambio.'),
```

Y en la app:
```ts
// components/admin/Avisos.tsx:88
'…el motivo del cambio viaja en la variable de sesión <code>app.motivo_cambio</code>…'
```

`grep "set_config\|motivo_cambio"` en `apps/web/src` no encuentra ninguna llamada. `grep` en `supabase/` confirma que sólo `seed.sql`, `scripts/generar-seed.ts` y la documentación invocan `set_config('app.motivo_cambio', ...)`.

**Por qué importa:** El sistema de versionado de contenido está diseñado para que cada cambio al corpus legal quede con su `motivo`. El panel administrativo (que es donde el equipo editorial va a modificar reglas) **no tiene un campo "motivo" en su flujo, y la variable de sesión nunca se setea**. Resultado: cualquier UPDATE al corpus desde la aplicación —hoy a través de la consola, mañana cuando exista UI de edición— quedará registrado como "Sin motivo declarado por quien hizo el cambio.".

Para una plataforma que se publicita como "historial inmutable, con autor, fecha y motivo", perder el motivo en producción es una promesa rota. No es una vulnerabilidad clásica, pero el aviso en `Avisos.tsx:88` lo anuncia al lector como si la captura existiera, y no existe.

**Fix recomendado:** En la server action que vaya a hacer UPDATE sobre `articles`, `threshold_rules`, `uma_values` y el resto de las tablas versionadas, antes del update:
```sql
select set_config('app.motivo_cambio', $1, true);
update … ;
```
Pasar el `motivo` desde un campo obligatorio del formulario del panel. El segundo parámetro `true` (local a la transacción) garantiza que no contamina otras sesiones.

---

### F-05 · CSP `script-src 'unsafe-inline'` abre la puerta a inyecciones de script si un subcomponente futuro lo introduce

**Severidad:** Medium
**Ubicación:** `apps/web/next.config.mjs:39`
**OWASP:** A05:2021 Security Misconfiguration
**CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers)

**Evidencia:**
```js
script-src 'self' 'unsafe-inline'${enDesarrollo ? " 'unsafe-eval'" : ''}
```

**Por qué importa:** El comentario en `next.config.mjs:6-36` documenta honestamente por qué `'unsafe-inline'` está ahí: los scripts de hidratación de Next no se pueden cubrir con hashes estáticos, y un nonce por petición obligaría a renderizar las 172 páginas de forma dinámica. La decisión es consciente y el equipo lo sabe. La convierto en hallazgo Medium porque:

- Es la única directiva de CSP que abre superficie de XSS significativa en el sitio. El resto (`object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, `form-action 'self'`, `connect-src 'self'`) está cerrado.
- Cualquier futura regresión que introduzca un `dangerouslySetInnerHTML` con contenido derivado de un input de usuario se vuelve XSS de forma directa. Hoy el único `dangerouslySetInnerHTML` con datos no triviales está en JSON-LD, donde `JSON.stringify` escapa correctamente el `</script>` (verificado). Pero no hay un linter ni un test que lo asegure a futuro.
- La auditoría actual no encontró un vector XSS real, así que la severidad es por el *techo de exposición*, no por un defecto presente.

**Fix recomendado:**
- A medio plazo: introducir un middleware que genere nonces por petición, mover las páginas que lo necesiten a `dynamic = 'force-dynamic'`, y dejar el resto estáticas. El comentario en `next.config.mjs:29-31` ya lo tiene en el roadmap.
- A corto plazo: añadir un grep en CI que falle si aparece `dangerouslySetInnerHTML` con datos derivados de `params`, `searchParams`, `body` o `headers` en cualquier archivo que no sea JSON.stringify. El test en `e2e/contrato.spec.ts:177-218` valida la CSP en runtime; un test similar en build-time cubre el lado estático.

---

### F-06 · `verifyOtp` y `resetPasswordForEmail` aceptan `type` sin validar contra el enum de Supabase

**Severidad:** Medium
**Ubicación:** `apps/web/src/app/api/auth/confirmar/route.ts:18`, `apps/web/src/lib/auth/acciones.ts:136-137`
**OWASP:** A04:2021 Insecure Design
**CWE:** CWE-20 (Improper Input Validation)

**Evidencia:**
```ts
// route.ts:18
const type = params.get('type') as EmailOtpType | null;
// ...
const { error } = await supabase.auth.verifyOtp({ type, token_hash });
```
```ts
// acciones.ts:136-137
await supabase.auth.resetPasswordForEmail(correo, {
  redirectTo: `${await origen()}/api/auth/confirmar?destino=/actualizar-contrasena`,
});
```

**Por qué importa:** El parámetro `type` se castea a `EmailOtpType` sin chequear que pertenezca al union. En `verifyOtp`, si el atacante construye una URL como `/api/auth/confirmar?type=invite&token_hash=...&destino=/panel` y convence a la víctima de abrirla, Supabase intentará verificar el OTP como invitación. Si el `token_hash` no es válido, devuelve error y redirige a `/entrar?aviso=enlace_invalido` (correcto, no hay daño). Pero si el atacante ha conseguido un `token_hash` válido por otro canal (por ejemplo, su propia invitación que reenvía al usuario víctima), la víctima terminaría en el flujo de "aceptar invitación" sin saberlo.

Adicionalmente, `resetPasswordForEmail` no valida el formato del `correo` antes de mandarlo a Supabase — sólo `correo.includes('@')` en `acciones.ts:135`. Un valor como `@` pasa el check y se envía. Supabase lo rechazará después, pero el endpoint ya consumió una llamada a la API de Supabase. Coste de ataque despreciable individualmente, escalable a 5 por IP y 10 minutos por la ventana del rate limit.

**Fix recomendado:**
- Whitelist explícito del parámetro `type`:
  ```ts
  const TYPES_VALIDOS: EmailOtpType[] = ['signup', 'recovery', 'invite', 'magiclink', 'email_change'];
  const type = params.get('type');
  if (!TYPES_VALIDOS.includes(type as EmailOtpType)) return NextResponse.redirect(errorUrl);
  ```
- Reemplazar `correo.includes('@')` por la validación de `correo` (zod email) que ya se usa en otros endpoints.

**Por qué Medium y no Low:** el vector es real, requiere sólo ingeniería social, y la defensa es trivial.

---

### F-07 · `verifyOtp` redirige con `new URL(destino, peticion.url)`

**Severidad:** Low
**Ubicación:** `apps/web/src/app/api/auth/confirmar/route.ts:33`
**OWASP:** A01:2021 Broken Access Control
**CWE:** CWE-601 (URL Redirection to Untrusted Site)

**Evidencia:**
```ts
return NextResponse.redirect(new URL(destino, peticion.url));
```

**Por qué importa:** Aquí se aplica `destinoSeguro` arriba (línea 19), así que el `destino` que llega a `new URL()` es siempre una ruta absoluta que empieza con `/`. `new URL('/ruta', base)` resuelve a `https://host/ruta` independientemente del valor de `/ruta`. No es vulnerable. Lo señalo porque es una segunda aplicación de la frontera y conviene que esté clara: si en el futuro alguien mueve el `destinoSeguro` a una validación posterior, este `new URL` podría hacer bypass.

**Fix recomendado:** Ninguno. Documentar en un comentario que la línea 19 es la frontera y la línea 33 no añade validación.

---

### F-08 · Cookies `org_activa` y `ver_como` se setean sin `secure: true` explícito

**Severidad:** Low
**Ubicación:** `apps/web/src/lib/auth/acciones.ts:191, 205`
**OWASP:** A05:2021 Security Misconfiguration
**CWE:** CWE-614 (Sensitive Cookie Without Secure Attribute)

**Evidencia:**
```ts
almacen.set(COOKIE_ORGANIZACION, id, { httpOnly: true, sameSite: 'lax', path: '/' });
// ...
almacen.set(COOKIE_VER_COMO, rol, { httpOnly: true, sameSite: 'lax', path: '/' });
```

**Por qué importa:** La API de Next.js para `cookies().set()` en server actions **establece `secure: true` por omisión cuando `process.env.NODE_ENV === 'production'`**. En desarrollo y en cualquier otro entorno el `secure` queda en `false`. Esto es lo correcto (no podrías entrar por `https://localhost` en dev), pero deja una decisión implícita que puede romperse si en el futuro se construye la imagen con `NODE_ENV !== 'production'` o si alguien añade un proxy que reescriba el header `X-Forwarded-Proto`.

`httpOnly: true` y `sameSite: 'lax'` están bien. La cookie de sesión de Supabase la gestiona `@supabase/ssr` con sus propias opciones y respeta las mismas convenciones.

**Fix recomendado:** Setear `secure: process.env.NODE_ENV === 'production'` explícitamente para no depender del default de la API. No es urgente.

---

### F-09 · `NEXT_PUBLIC_SITE_URL` por omisión cae en `'https://leyantilavado.org'`

**Severidad:** Low
**Ubicación:** `apps/web/src/lib/sitio.ts:8`
**OWASP:** A05:2021 Security Misconfiguration

**Evidencia:**
```ts
url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leyantilavado.org',
```

**Por qué importa:** El valor de `NEXT_PUBLIC_SITE_URL` se incrusta en build, no en runtime. Si un despliegue se olvida de setearla en un entorno de staging, el sitio **emite canonicals y JSON-LD apuntando al dominio de producción**, lo cual:

1. Ensucia el índice de Google con `https://leyantilavado.org/...` desde URLs de staging.
2. Si staging es de pre-producción con contenido distinto, los rich results (Organization, FAQ, BreadcrumbList) pueden ser indexados con datos que no son de producción.

El `.env.example` documenta la variable, pero `next.config.mjs` no aborta el build si está vacía.

**Fix recomendado:** Que la build **falle** si `NEXT_PUBLIC_SITE_URL` no está seteada y `process.env.NODE_ENV === 'production'`. En staging se obliga a usar un valor como `https://staging.leyantilavado.org` (que es lo correcto para evitar el cross-indexing).

---

### F-10 · `clienteServidor` no marca `auth.persistSession`/`autoRefreshToken`

**Severidad:** Low
**Ubicación:** `apps/web/src/lib/supabase/servidor.ts:21-42`
**OWASP:** A07:2021 Identification and Authentication Failures

**Evidencia:**
```ts
return createServerClient(URL_SUPABASE, CLAVE_ANONIMA, {
  cookies: { getAll() {...}, setAll(...) {...} },
});
```

**Por qué importa:** El cliente administrador (`administrador.ts:18`) sí desactiva `persistSession` y `autoRefreshToken`, que es lo correcto para una clave de servicio. El cliente del servidor (anon key) hereda los defaults de `@supabase/ssr`. En SSR, donde las cookies son la única fuente de sesión, esto funciona porque `getAll` lee del request. Pero en server actions que se invocan tras un periodo largo de inactividad, el token de Supabase puede haber expirado sin que `clienteServidor` lo refresque — porque el refresco se hace en el middleware (`middleware.ts:23-64`), no aquí. Si la server action llega al servidor sin pasar por una navegación que refresque la cookie, falla con "Auth session missing".

En la práctica hoy funciona porque cada request pasa por el middleware, pero la separación entre "sesión vigente" y "sesión refrescable" es frágil.

**Fix recomendado:** Documentar en el comentario de `servidor.ts:14-20` que la renovación de la sesión la hace exclusivamente el middleware y que cualquier ruta que se sirva sin pasar por él (route handlers sin cookie previa) tendrá sesión vacía. Considerar añadir un `getUser()` de validación al inicio del `clienteServidor` para que el primer error sea explícito.

---

### F-11 · Middleware escribe la cookie inicial del refresh sin opciones

**Severidad:** Low
**Ubicación:** `apps/web/src/lib/supabase/middleware.ts:33-40`
**OWASP:** A05:2021 Security Misconfiguration

**Evidencia:**
```ts
setAll(porEscribir: CookiePorEscribir[]) {
  for (const { name, value } of porEscribir) {
    peticion.cookies.set(name, value);  // <-- sin options
  }
  respuesta = NextResponse.next({ request: peticion });
  for (const { name, value, options } of porEscribir) {
    respuesta.cookies.set(name, value, options);  // <-- con options
  }
},
```

**Por qué importa:** La primera escritura (sobre `peticion.cookies`) es para que cualquier `getUser()` posterior en el mismo request vea la cookie refrescada. La segunda (sobre `respuesta.cookies`) es la que efectivamente llega al navegador. La primera no tiene `httpOnly`/`secure`/`sameSite` — pero como es el objeto `NextRequest` y no se serializa al cliente, **no sale del servidor**. No es una fuga.

Lo señalo porque el código es confuso: el patrón "escribir dos veces, una en el request y otra en el response" es un anti-patrón de la documentación de `@supabase/ssr`, pero el comentario no lo explica. Un futuro lector puede "limpiar" el código eliminando la primera escritura y rompiendo la renovación.

**Fix recomendado:** Añadir un comentario de tres líneas explicando que la primera escritura es para que cualquier `cookies().get()` posterior en el request (incluido el del `setAll` cuando Supabase vuelve a llamar) vea la sesión actualizada. No cambiar el código.

---

### F-12 · `feature_flags` legible por `anon, authenticated` expone rollout y `organization_ids`

**Severidad:** Low
**Ubicación:** `supabase/migrations/0009_plataforma.sql:140-141`
**OWASP:** A01:2021 Broken Access Control
**CWE:** CWE-200 (Exposure of Sensitive Information)

**Evidencia:**
```sql
create policy feature_flags_select on public.feature_flags
  for select to anon, authenticated using (true);
```

**Por qué importa:** El comentario dice "se lee desde el sitio público para decidir qué se muestra". La política concede SELECT a `anon` (visitantes no autenticados). Las columnas incluyen `rollout_percent` (0-100) y `organization_ids uuid[]` — la primera es inocua, pero la segunda **revela los IDs de las organizaciones inscritas en una bandera**. Combinado con un endpoint que filtre por `organization_id` y un `id` adivinado, esto es un oráculo para identificar la membresía de una organización concreta.

En la práctica el riesgo es bajo porque los `organization_id` son UUIDs v4 (no enumerables), pero un insider con acceso al endpoint de flag y a la lista de clientes puede correlacionar.

**Fix recomendado:** Crear una vista `public.feature_flags_public` que exponga sólo `{ key, enabled, rollout_percent }` y dar SELECT sobre la vista a `anon`. La tabla real con `organization_ids` queda accesible sólo al staff.

---

### F-13 · El `set` de `ver_como` borra la cookie en valor inválido, no documentado

**Severidad:** Low
**Ubicación:** `apps/web/src/lib/auth/acciones.ts:198-210`
**OWASP:** A04:2021 Insecure Design

**Evidencia:**
```ts
export async function cambiarVerComo(datos: FormData): Promise<void> {
  const rol = texto(datos, 'rol');
  const almacen = await cookies();
  if (esRolValido(rol)) {
    almacen.set(COOKIE_VER_COMO, rol, { httpOnly: true, sameSite: 'lax', path: '/' });
  } else {
    almacen.delete(COOKIE_VER_COMO);
  }
  revalidatePath('/panel');
}
```

**Por qué importa:** El comportamiento es correcto: si alguien manipula el formulario para enviar un rol inválido, se borra la cookie. El riesgo es que el comportamiento opuesto (manipular para escalar a un rol con más permisos) está bloqueado por dos lugares: `esRolValido` (que sólo acepta valores del union `ROLES_ORGANIZACION`) y `rolSimuladoValido` al leer la cookie (que verifica que el rol real *contenga* los permisos del simulado). Doble puerta — buena.

El comentario en la línea 201-203 lo explica. Lo señalo como Low porque el código está bien, pero el patrón merece tests más exhaustivos (los actuales en `permisos.test.ts:5-33` son buenos, falta probar que cambiar el `rol` en el form a un valor arbitrario no escala).

**Fix recomendado:** Añadir un test en `permisos.test.ts` que envíe `rol='propietario'` a `cambiarVerComo` cuando el rol real es `analista` y verifique que la cookie queda vacía. No es trivial sin un harness de server actions; documentar como follow-up.

---

### F-14 · `actualizarContrasena` no exige contraseña actual

**Severidad:** Low
**Ubicación:** `apps/web/src/lib/auth/acciones.ts:146-174`
**OWASP:** A07:2021 Identification and Authentication Failures
**CWE:** CWE-620 (Unverified Password Change)

**Evidencia:**
```ts
export async function actualizarContrasena(
  _previo: EstadoFormulario | null,
  datos: FormData,
): Promise<EstadoFormulario> {
  // ...
  const contrasena = texto(datos, 'contrasena');
  const confirmacion = texto(datos, 'confirmacion');
  // ... sólo compara con confirmación
  const { error } = await supabase.auth.updateUser({ password: contrasena });
```

**Por qué importa:** La función confía en que el usuario que llega a `/actualizar-contrasena` tiene sesión activa (verificado en `page.tsx:36-48`: si no, muestra el aviso "Este enlace ya no es válido"). Pero un atacante con un token de sesión robado puede cambiar la contraseña sin conocer la anterior, **invalidando la cuenta del usuario legítimo**. El escenario "atacante con sesión robada" ya es game-over, así que el valor defensivo de pedir la contraseña anterior es marginal. Sin embargo, la convención de la industria (y la de Supabase Auth por defecto) es pedirla.

**Fix recomendado:** Si se quiere endurecer, añadir un campo `actual` al formulario y un `supabase.auth.signInWithPassword` previo al `updateUser`. Si se mantiene sin contraseña actual, documentar en el componente que la sesión vigente es la única prueba de identidad para el cambio. El status actual (confiar en la sesión) es defendible.

---

### F-15 · `registrar` filtra `weak_password` y `validation_failed` al cliente

**Severidad:** Informational
**Ubicación:** `apps/web/src/lib/auth/acciones.ts:112-118`
**OWASP:** A04:2021 Insecure Design

**Evidencia:**
```ts
if (error && error.code !== 'user_already_exists') {
  const mensaje = mensajeSeguroDeAuth(error.code, error.message);
  if (error.code === 'weak_password' || error.code === 'validation_failed') {
    return { ok: false, mensaje, campo: error.code === 'weak_password' ? 'contrasena' : 'correo' };
  }
}
```

**Por qué importa:** Estos dos códigos se filtran al cliente sin colapsar al mensaje genérico. La intención es buena — el usuario necesita saber que su contraseña es débil — pero combinados con el colapso de `user_already_exists`, permiten a un atacante:

1. Intentar registrar `victima@empresa.com` con una contraseña obviamente débil (`1`).
2. Si la respuesta es `weak_password`, sabe que la cuenta existe.
3. Si la respuesta es el mensaje genérico "Si ese correo puede registrarse…", sabe que la cuenta NO existe.

**Severidad Informational** porque en la práctica la diferencia entre "existe y tu contraseña es débil" y "existe y tu contraseña cumple mínimos" sigue siendo un oráculo. Pero:

- El `schema` de zod en el frontend (validación con `contrasena.length < CONTRASENA_MINIMA` en `acciones.ts:92-98`) hace que un atacante no llegue a Supabase con contraseñas débiles. La fuga, en la práctica, no se da.
- Si en el futuro se relaja la validación del lado servidor, el oráculo se abre.

**Fix recomendado:** Mantener el comportamiento actual, pero añadir un comentario que documente que la fuga es teórica y depende de la validación previa. Considerar siempre devolver el mensaje "Si ese correo puede registrarse…" para `user_already_exists` y colapsar `weak_password` al genérico — es la postura más conservadora.

---

### F-16 · `cache-control: no-store` cubre `/api/*` pero la API escribe cookies

**Severidad:** Informational
**Ubicación:** `apps/web/next.config.mjs:114`
**OWASP:** A05:2021 Security Misconfiguration

**Evidencia:**
```js
{
  source: '/api/:path*',
  headers: [
    { key: 'Cache-Control', value: 'no-store, max-age=0' },
    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
  ],
},
```

**Por qué importa:** El `Cache-Control: no-store` evita que la *respuesta* se cachee, pero no impide que un proxy que sólo reescribe el header `Set-Cookie` lo haga. Si entre el origen y el cliente hay un proxy transparente que filtra `Set-Cookie` (raro hoy, posible en redes corporativas), la sesión queda invalidada para el siguiente request. No es una vulnerabilidad — es un escenario de despliegue.

**Fix recomendado:** Documentar en `DESPLIEGUE.md` que el sitio no debe servirse detrás de un proxy que reescriba `Set-Cookie`.

---

### F-17 · Repositorio del directorio escribe datos personales en `.data/*.json` sin cifrar en reposo

**Severidad:** Informational
**Ubicación:** `apps/web/src/lib/directorio/repositorio.ts:1, 19, 121-125`
**OWASP:** A02:2021 Cryptographic Failures

**Evidencia:**
- `directorio-solicitudes.json` contiene `nombre`, `correo`, `telefono`, `empresa` de personas que pidieron contacto con un proveedor.
- `directorio-reportes.json` puede contener `correo` del reportante.
- `directorio-reclamos.json` contiene `nombre`, `correo`, `telefono`, `cargo` y `pruebaRelacion` (texto libre, probablemente con datos sensibles).
- `directorio-altas.json` contiene `correoContacto`, `telefono` y `sitioWeb` de quien pide ser proveedor.
- `newsletter.json` contiene `correo` y opcionalmente `actividad` y `origen`.
- `contacto.jsonl` contiene el mensaje completo de "cuéntanos de qué se trata".

El `.gitignore` excluye `.data/`, así que no se versiona. Pero el archivo vive en el filesystem del servidor. En un contenedor efímero o un redeploy, **se pierden sin dejar rastro en la auditoría**.

**Por qué Informational:** el plan es migrar a Supabase (los TODO en `newsletter/route.ts:95-99` lo dicen), donde el cifrado en reposo lo gestiona la plataforma. Hasta entonces, el riesgo es:

- Filtración de datos personales en un backup o snapshot del volumen.
- Imposibilidad de cumplir el derecho de supresión de la LFPDPPP / GDPR sin acceso al filesystem.
- No hay registro de qué datos se conservan ni por cuánto.

**Fix recomendado:** Acelerar la migración a Supabase. Mientras tanto, considerar cifrar el directorio con `age` o equivalente, y un job de purga que borre archivos de más de 90 días (alineado con el aviso de privacidad).

---

### F-18 · `perfil.sitioWeb` se renderiza sin `rel="noopener noreferrer"`

**Severidad:** Informational
**Ubicación:** `apps/web/src/app/directorio/profesional/[slug]/page.tsx:186`
**OWASP:** A05:2021 Security Misconfiguration
**CWE:** CWE-1022 (Use of Web Link to Untrusted Domain with Targeted Function)

**Evidencia:** (líneas 183-188, no reproducidas en este informe, son un `<a href={perfil.sitioWeb}>`).

**Por qué importa:** Los enlaces externos a sitios de proveedores sin `rel="noopener noreferrer"` permiten que la página destino manipule `window.opener` (en navegadores antiguos) o que el referrer filtra la URL completa del perfil (incluido el slug). El impacto es bajo porque los sitios destino son dominios de profesionales verificables, no aleatorios — pero el directorio es público y un proveedor podría incluir un sitio malicioso para, por ejemplo, hacer phishing a quien haga clic.

**Fix recomendado:** Añadir `rel="noopener noreferrer"` a todos los `<a>` con `href` absoluto en la salida del directorio. Considerar `noreferrer` por separado (no incluido en `noopener`) para también bloquear el leak del slug.

---

## Lo que está bien hecho (verificado)

1. **CSP y cabeceras de seguridad** (`apps/web/next.config.mjs:37-118`). `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `HSTS` con `max-age=63072000; includeSubDomains; preload`, `COOP: same-origin`, `Referrer-Policy: strict-origin-when-cross-origin`. `poweredByHeader: false`. La decisión de mantener `'unsafe-inline'` en `script-src` está documentada con la alternativa (nonce por petición) y su costo. Confirmado por el e2e en `apps/web/e2e/contrato.spec.ts:177-218`.

2. **Middleware de sesión** (`apps/web/middleware.ts:1-17` + `apps/web/src/lib/supabase/middleware.ts:23-64`). `getUser()` (no `getSession()`) valida el JWT contra el servidor de auth de Supabase en cada request. Las rutas protegidas son `/panel` y `/admin` (líneas 12-14 y 53-60). La página de destino se preserva con `destinoSeguro`-equivalente (el middleware de sesión usa `nextUrl.searchParams.set('destino', ruta+search)`, donde la `ruta` viene de `pathname` y `search` de la URL — controlados por Next, no por el usuario).

3. **RLS de identidad y cumplimiento** (`supabase/migrations/0002-0008`). Confirmé:
   - `users_select` deja ver el perfil propio o el de los compañeros de la misma organización, no el directorio completo (línea 181-195 de `0003_funciones_acceso.sql`).
   - `organization_members_update` exige `user_id <> auth.uid()` (línea 257), lo que cierra el self-escalation. Hay un trigger redundante `impedir_autoelevacion` (línea 147-160) que cubre el caso de service_role.
   - `is_staff` y `staff_role` están blindados por trigger `impedir_autopromocion_staff` (línea 148-166) y por la política `users_update_staff` que sólo permite update si ya es staff.
   - `notice_records` exige `status in ('borrador','en_revision','no_procede')` para inserción por no-aprobador, y `status in ('borrador','en_revision','no_procede')` o `puede_aprobar_avisos` para update. No se puede saltar de `borrador` a `aprobado` sin rol de aprobación.
   - `accumulation_rules` exige `organization_id is not null` en INSERT/UPDATE — no se puede insertar con `organization_id = null` salvo por la regla de corpus única (`accumulation_rules_corpus_unica`).

4. **Defensa contra enumeración de cuentas** (`apps/web/src/lib/auth/mensajes.ts:14-63`). Un solo mensaje para "no existe" y "contraseña incorrecta" (línea 14-15). Un solo mensaje para "te enviamos instrucciones" exista la cuenta o no (línea 17-18). `mensajeSeguroDeAuth` colapsa cualquier error de Supabase que mencione "password" o "credential" al mensaje genérico (línea 60-63). El registro (`registrar`) devuelve el mismo OK para cuenta nueva y cuenta existente (línea 120). Verificado en `permisos.test.ts:42-54` y en los formularios.

5. **`destinoSeguro` y su test** (`apps/web/src/lib/auth/permisos.ts:48-52` + `permisos.test.ts:36-54`). Cubre los vectores principales: `https://`, `//host`, `/\host`, `javascript:`, vacío, `null`, `undefined`. La función se invoca en seis call sites y siempre antes de cualquier `redirect()`. Es la frontera anti–open-redirect y funciona.

6. **Rate limit por IP** (`apps/web/src/lib/directorio/limite-tasa.ts:21-49` y `apps/web/src/app/api/newsletter/route.ts:65-86`). Ventana deslizante en memoria, con poda perezosa cuando el Map excede 5 000 entradas. Límites: 5/10 min en newsletter, 3/h en alta y reclamo, 5/10 min en contacto, 5/h en reporte. El header `Retry-After` se envía en las 429.

7. **MFA con TOTP** (`apps/web/src/lib/auth/acciones.ts:223-299`). `iniciarAltaMFA`, `confirmarAltaMFA`, `retirarMFA`, `verificarMFA` separados. El nivel AAL se consulta en `sesion.ts:53` y se expone como `nivelAutenticacion` en la sesión. El flag `mfaActivo` se calcula sobre los factores `verified`. El código de 6 dígitos se valida antes del challenge.

8. **Triggers de inmutabilidad** (`supabase/migrations/0001_base.sql:78-111` + `0010_versionado_legal.sql` + `0011_bitacora_completa.sql`). `audit_logs` es append-only: sólo política de SELECT. `content_revisions` igual. `registrar_bitacora` y `registrar_bitacora_sin_datos` se ejecutan desde triggers, no desde la app. `versionar_contenido` se ejecuta en `before update` y guarda el snapshot anterior con su `motivo`.

9. **`npm audit` limpio** (0 vulnerabilidades declaradas en advisories). El `package-lock.json` está commiteado. Las versiones resueltas son razonablemente actuales: Next 16.3.0, React 19.2.8, @supabase/ssr 0.5.2, zod 3.24.1, framer-motion 12.4.2. Hay 11 paquetes con advisories conocidas y parcheadas en la línea de tiempo del lockfile.

10. **Validación de inputs con zod** en todas las rutas `/api/*` y en los server actions del panel (`apps/web/src/lib/directorio/esquemas.ts:1-140`, `apps/web/src/app/api/newsletter/route.ts:27-43`, `apps/web/src/app/api/contacto/route.ts:25-59`). `z.literal(true)` para el consentimiento (no se puede esquivar con `"true"` como string o `1` como número). Tamaños máximos en todos los campos de texto.

11. **`sitio trampa` (honeypot)** en `/api/contacto` (`route.ts:58`) — campo invisible que, si llega lleno, devuelve 200 sin procesar. Defensa contra los bots más simples sin afectar a usuarios reales.

12. **Saneamiento de `destino` antes del redirect de recuperación** (`apps/web/src/lib/auth/acciones.ts:137`). El enlace que Supabase envía al correo del usuario incluye `?destino=/actualizar-contrasena`, que está hardcodeado y por lo tanto es seguro. Pero si en el futuro se parametriza, la página de destino debería volver a pasar por `destinoSeguro`.

13. **Sin fugas en logs de datos personales**. `console.log`/`console.error` con correos o mensajes no aparece en el código (`grep "console\\." apps/web/src` no encuentra ningún caso con datos personales — el único hit es un comentario en `newsletter/route.ts:192` que documenta precisamente que **no** se loguea el correo). El manejo de errores de `api/contacto/route.ts:98-100` y `api/newsletter/route.ts:191-200` deliberadamente descartan el cuerpo.

14. **E2E de contrato** (`apps/web/e2e/contrato.spec.ts:177-218`). Verifica que la CSP cierra lo que debe cerrar, que las cabeceras básicas están, que el área privada redirige o se marca `noindex`, que el sitemap no expone rutas privadas, y que las respuestas de la API no se cachean. Esto es una red de seguridad para que las decisiones de seguridad no se rompan silenciosamente en un PR.

---

## Brechas de verificación (lo que no pude confirmar estáticamente)

1. **Comportamiento real de RLS bajo carga.** Los triggers y políticas se ven bien, pero no puedo correr EXPLAIN sobre queries que crucen `es_miembro_de` con `branch_ids` o con tablas grandes de operaciones. La `STABLE` está puesta y el `SECURITY DEFINER` también, así que el patrón es correcto; el rendimiento en una organización con 100 000 operaciones y 50 analistas es incierto.

2. **Tokens de Supabase en el cliente del navegador.** `clienteNavegador` (`apps/web/src/lib/supabase/navegador.ts:14-17`) crea el cliente con la anon key y la URL. No puedo confirmar estáticamente qué políticas de `anon` quedan activas en cada tabla — la única que vi es `feature_flags_select` y `newsletter_subscribers_insert`. Si en una migración futura alguien añade una política `for select to anon using (true)` en una tabla con datos personales, esta auditoría no la detectará hasta el siguiente pase.

3. **Comportamiento de `cookies()` cuando se invoca desde un Server Component vs Route Handler.** El código tiene el patrón "intentar escribir y tragarse el error" en `servidor.ts:32-39`. En un build con un Server Component que se vuelve Route Handler (o al revés), el catch puede ocultar un fallo de renovación de sesión que sólo se manifestaría en producción. No encontré un test que ejercite este camino.

4. **El refresco del token en el middleware.** El middleware llama a `getUser()` (línea 49), que puede refrescar el token vía `setAll`. En una sesión próxima a expirar y un request largo (subida de archivo), no puedo confirmar que el refresco no entre en bucle con la respuesta.

5. **`dangerouslySetInnerHTML` con datos derivados de input de usuario.** El audit buscó estos usos y los encontró todos en JSON.stringify de estructuras estáticas o de `jsonLd*` con datos de la base. No encontré un caso donde un input de usuario (sin filtro) llegue a un `dangerouslySetInnerHTML`. **Pero** un test automatizado que garantice esta invariante a futuro no existe en el repo.

6. **CSP en runtime contra inyecciones reales.** El e2e `contrato.spec.ts:178-209` valida la forma de la CSP, no que efectivamente bloquee inyecciones. No hay un test que intente `<script>alert(1)</script>` en un input de formulario y verifique que no se ejecuta. Esto es por diseño (CSP bloquea a nivel de navegador, no hay forma de "testear" inline-blocked scripts sin instrumentar el browser), pero deja una zona ciega.

7. **Comportamiento de los triggers de Supabase bajo carga concurrente.** El `proteger_ultimo_propietario` hace un `SELECT count(*) FOR UPDATE` implícito al evaluar el UPDATE. En una organización con 50 propietarios y un UPDATE simultáneo a dos filas distintas, no puedo descartar un deadlock. El código parece correcto (el predicado `m.id <> old.id` está bien), pero no probé esto.

8. **`NEXT_PUBLIC_SITE_INDEXABLE` por omisión es `true`** (`apps/web/src/lib/sitio.ts:26`). El `.env.example` lo declara indexable por omisión, lo que invierte la convención anterior. La razón está documentada y es razonable. Lo verifico: no es un bug, pero si en el futuro alguien quiere hacer un "soft launch" (sitio cerrado, noindex), debe recordar setear la variable. No hay test que verifique el valor por omisión en build de producción.

---

## Top 5 — debe arreglarse primero

1. **F-01 (Medium): race condition en `agregar` del directorio** — pérdida silenciosa de altas. Es un defecto de comportamiento, no de configuración, y se arregla copiando el patrón de la cola del newsletter. **Esfuerzo: 1 hora.**

2. **F-06 (Medium): falta whitelist de `type` en `verifyOtp` y validación de email en `resetPasswordForEmail`** — vector de phishing real y trivial. **Esfuerzo: 15 minutos.**

3. **F-02 (Medium): `branch_ids` declarado pero no enforzado** — promesa de aislamiento por sucursal que la base no cumple. Mientras esté así, la UI no puede mostrar de forma segura "operaciones en tus sucursales". **Esfuerzo: 2-4 horas (crear función + modificar políticas + tests).**

4. **F-04 (Medium): `app.motivo_cambio` no se setea desde la app** — el sistema de versionado registra "Sin motivo declarado" para todos los cambios desde la aplicación. La promesa de auditoría está rota en producción. **Esfuerzo: 1-2 horas (campo de formulario + set_config en la server action).**

5. **F-03 (Medium): `destinoSeguro` — añadir check de longitud máxima y normalización de `\\`** — defensa en profundidad sobre la única función anti–open-redirect del proyecto. **Esfuerzo: 30 minutos.**

Los 6 Medium restantes se priorizan en este orden: **F-05** (CSP) requiere un refactor mayor (nonce por petición) que toca 172 páginas — vale la pena pero no es urgente; **F-08/F-09/F-10/F-11/F-12** son endurecimiento de bajo impacto.
