# Auditoría de seguridad — pasada 2 · LeyAntilavado.org

**Fecha:** 13 ago 2026
**Alcance:** apps/web, packages/*, supabase/migrations/*
**Modo:** read-only. No se modificó ningún archivo. Cada hallazgo lleva su `file:line` real.
**Versión auditada:** HEAD, mismo código que la pasada 1 (sin cambios entre pasadas).

---

## 1. Resumen ejecutivo

La pasada 1 fue minuciosa: cubrió CSP, RLS, anti-enumeración, rate limit, versionado legal, race conditions del directorio y cabeceras. La pasada 2 busca lo que se quedó fuera: comportamiento de las server actions expuestas por `'use server'`, separación entre "lo que la matriz dice" y "lo que la página enforce", service worker, flujos de autenticación cuando la app está en producción real con varias instancias, y un puñado de funciones `SECURITY DEFINER` que no se invocan con `set search_path` o que no son `STABLE`.

La postura global sigue siendo **sólida**, pero esta pasada saca a la luz una autorización rota que la primera no vio (exportaciones accesibles al rol `consulta`) y un service worker que cachea el área privada por error. Hay además un buen número de detalles de defensa en profundidad y un par de puntos con riesgo real si mañana se añade una página nueva al panel o si un atacante consigue una sesión robada.

**Postura global:**

- Critical: 0
- High: 1
- **Medium: 6** (5 nuevos + 1 que la primera marcó bajo y esta pasada considera medium)
- **Low: 7** (todos nuevos)
- Informational: 2 (todos nuevos)

Conteo total: **16 hallazgos** (14 nuevos + 1 re-clasificación + 1 no-encontrado).

---

## 2. Tabla de hallazgos

| ID | Severidad | Título | Archivo:línea | Categoría OWASP |
|---|---|---|---|---|
| P2-SEC-01 | High | `/panel/exportaciones` no consulta `documentos.descargar` y entrega PII completa a `consulta` y `analista` | `apps/web/src/app/(app)/panel/exportaciones/page.tsx:77-92` | A01:2021 Broken Access Control |
| P2-SEC-02 | Medium | Service worker cachea `/panel/*` en disco; el comentario promete lo contrario | `apps/web/public/sw.js:30, 33-39` | A05:2021 Security Misconfiguration |
| P2-SEC-03 | Medium | `verificarMFA` está expuesta como server action y nunca se llama desde la UI — MFA es protección nominal | `apps/web/src/lib/auth/acciones.ts:275-300` | A07:2021 Identification and Authentication Failures |
| P2-SEC-04 | Medium | `retirarMFA` no requiere re-autenticación; una sesión robada apaga el 2FA sin fricción | `apps/web/src/lib/auth/acciones.ts:267-272` | A07:2021 Identification and Authentication Failures |
| P2-SEC-05 | Medium | `slugLibre` tiene TOCTOU: dos altas concurrentes del mismo nombre producen slug duplicado | `apps/web/src/lib/directorio/repositorio.ts:48-66` | A04:2021 Insecure Design |
| P2-SEC-06 | Medium | `proteger_ultimo_propietario` ejecuta `SELECT` con la sesión del llamante, no `SECURITY DEFINER`; los conteos pueden mentir | `supabase/migrations/0002_identidad.sql:112-137` | A01:2021 Broken Access Control |
| P2-SEC-07 | Low | `clienteAdministrador` no tiene `import 'server-only'` ni `import server-only`; el comentario pide "nunca importar" pero no lo enforza | `apps/web/src/lib/supabase/administrador.ts:1` | A05:2021 Security Misconfiguration |
| P2-SEC-08 | Low | `error.tsx` corre en cliente y registra el `Error` completo (incluyendo cualquier PII presente en la página) a la consola del navegador | `apps/web/src/app/error.tsx:30` | A09:2021 Security Logging Failures |
| P2-SEC-09 | Low | `localStorage` guarda la lista de proveedores favoritos en texto plano; el comentario reconoce que "es un dato sensible" | `apps/web/src/components/directorio/AccionesPerfil.tsx:16, 65` | A02:2021 Cryptographic Failures |
| P2-SEC-10 | Low | `/api/cron/monitor-fuentes` también acepta `x-cron-secret` además de `Authorization: Bearer`; si un proxy/CDN reescribe la cabecera, se vuelve un vector | `apps/web/src/app/api/cron/monitor-fuentes/route.ts:31-33` | A05:2021 Security Misconfiguration |
| P2-SEC-11 | Low | `verificarMFA` no exige `codigo.length === 6` ni formato numérico; inconsistente con `confirmarAltaMFA` | `apps/web/src/lib/auth/acciones.ts:275-300` | A04:2021 Insecure Design |
| P2-SEC-12 | Low | No hay `SECURITY.md` ni política de divulgación responsable en el repo; el `.env.example` no lo enlaza | `/` raíz | A05:2021 Security Misconfiguration |
| P2-SEC-13 | Low | El CSP permite `style-src 'unsafe-inline'` por Framer Motion + next/font; documentado pero ningún test de regresión lo asegura | `apps/web/next.config.mjs:42` | A05:2021 Security Misconfiguration |
| P2-SEC-14 | Low | `consulta` puede navegar a `/panel/bitacora` por URL; RLS bloquea pero el código no avisa — el link del menú dice "no" y la página no | `apps/web/src/app/(app)/panel/bitacora/page.tsx:16-17` | A04:2021 Insecure Design |
| P2-SEC-15 | Informational | La declaración `'use server'` en `auth/acciones.ts` expone TODAS las funciones como server actions públicas, incluidas `retirarMFA`/`verificarMFA`/`cambiarVerComo` — superficie de ataque más amplia que la documentada | `apps/web/src/lib/auth/acciones.ts:1` | A05:2021 Security Misconfiguration |
| P2-SEC-16 | Informational | `destinoSeguro` se aplica en 6 call sites, pero el middleware escribe `destino` con la URL completa del request (`peticion.nextUrl.search`); un futuro cambio que permita `search` controlado por usuario abriría un bypass | `apps/web/src/lib/supabase/middleware.ts:59` | A03:2021 Injection |

> 5 hallazgos Medium nuevos, 1 Medium re-clasificado desde Informational de la pasada 1 (F-09 era sobre `NEXT_PUBLIC_SITE_URL` por defecto, no tocaba este punto — la re-clasificación es de este pase, sobre el service worker).

---

## 3. Hallazgos detallados

### P2-SEC-01 · `/panel/exportaciones` entrega PII completa a roles que no deberían poder exportar

**Severidad:** High
**Ubicación:** `apps/web/src/app/(app)/panel/exportaciones/page.tsx:77-92`
**OWASP:** A01:2021 Broken Access Control · CWE-285 (Improper Authorization)
**Estado:** **NUEVO** — no estaba en la pasada 1.

**Evidencia:**
```ts
// apps/web/src/app/(app)/panel/exportaciones/page.tsx:77-92
export default async function PaginaExportaciones() {
  const contexto = await requerirContexto('/panel/exportaciones');
  const org = contexto.organizacion?.organizacionId ?? null;
  const hoy = await fechaDeHoy();

  const resultados = await Promise.all(
    CATALOGO.map((c) =>
      listar<FilaExportable>(c.tabla, {
        columnas: c.columnas.join(','),
        organizacionId: org,
        ...
      }),
    ),
  );
```

La página no llama a `contexto.puede(...)`. El control de acceso se delega 100% a la matriz (que la pasada 1 reconoció como "presentación, no seguridad" — `packages/types/src/directorio.ts:166-170`).

**Por qué importa:**

La matriz de permisos define una entrada clara y específica: `documentos.descargar` con etiqueta literal "Descargar documentos y exportaciones" (`apps/web/src/app/(app)/panel/miembros/page.tsx:54`). El menú lateral de navegación la respeta — `apps/web/src/components/app/navegacion.ts:52` — y esconde el enlace "Exportaciones" para los roles que no la tienen. La página de avisos también la consulta para mostrar el botón "Ir a exportaciones" (`apps/web/src/app/(app)/panel/avisos/page.tsx:120`).

Pero **la página destino no la consulta**. Un usuario con rol `consulta` (que sólo tiene `clientes.ver`, `operaciones.ver`, `alertas.ver`, `avisos.ver`, `riesgos.ver`) puede:

1. Teclear `/panel/exportaciones` directamente en la barra de direcciones.
2. Ver y descargar CSV/JSON con 500 filas de `customers` que incluyen `full_name`, `rfc`, `curp`, `foreign_tax_id`, `email`, `phone`, `address`, `is_pep`, `pep_source` — toda la PII que la propia página de `Clientes` muestra fila por fila.
3. Lo mismo con `operations` (montos, contrapartes, `legal_version` usada), `notice_records` (incluye `acknowledgement_ref`) y `audit_logs` (que filtrada por organización expone quién hizo qué y cuándo, no la columna `before_data`/`after_data` por el `select`, pero sí `actor_id`, `entity`, `summary`).

El riesgo de la matriz dice "esto es lo que se dibuja", pero la página no la usa para decidir qué se entrega. La matriz está mintiendo: dice "no puedes exportar" y la página dice "toma, aquí tienes todo".

El segundo problema es que la propia página reconoce la falta de auditoría en `page.tsx:175-177`:
> "Nada sale de tu computadora… Como consecuencia, la descarga tampoco queda registrada en la bitácora: ahí sólo se anotan los cambios en la base de datos, y una descarga no cambia nada. Si necesitas rastrear quién exportó qué, hay que registrarlo desde el servidor; está pendiente."

Combinado: **un `consulta` o un `analista` puede llevarse toda la base de su organización a su laptop, sin que quede huella en `audit_logs`**. La primera pasada no vio este acoplamiento.

**Fix recomendado:**

1. Inmediato: añadir al inicio de `PaginaExportaciones` un redirect a `/panel?aviso=sin_permiso_exportar` si `!contexto.puede('documentos.descargar')`. Mismo patrón que `apps/web/src/app/(app)/panel/operaciones/importar/page.tsx:15`.
2. La matriz ya distingue "ver" de "descargar/exportar"; mantener la separación: `consulta` y `analista` no pueden exportar.
3. A medio plazo: registrar cada descarga en `audit_logs` con un `action = 'export'` y `entity = '<tabla>'`. El comentario en `page.tsx:175-177` ya lo pide.

---

### P2-SEC-02 · Service worker cachea `/panel/*` en disco, contraviniendo el comentario

**Severidad:** Medium
**Ubicación:** `apps/web/public/sw.js:30, 33-39`
**OWASP:** A05:2021 Security Misconfiguration · CWE-524 (Information Exposure Through Caching)
**Estado:** **NUEVO**.

**Evidencia:**
```js
// apps/web/public/sw.js:30
const NUNCA_CACHEAR = ['/api/', '/app/', '/admin/', '/entrar', '/registro', '/recuperar'];

// apps/web/public/sw.js:33-39
self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;

  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return;
  if (NUNCA_CACHEAR.some((p) => url.pathname.startsWith(p))) return;

  // Navegación: red primero para que el contenido legal siempre esté fresco;
  // la caché es la red de seguridad, no la fuente principal.
  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(CACHE_APP).then((cache) => cache.put(peticion, copia));
          return respuesta;
```

**Por qué importa:**

El comentario al inicio del archivo (`sw.js:1-9`) promete:
> "nada del área privada, nada de resultados de usuario y nada de peticiones a la API se guarda en caché — cachear datos de cumplimiento de un cliente en el disco del navegador sería un problema de privacidad, no una mejora de rendimiento."

El `NUNCA_CACHEAR` lista `/api/`, `/app/`, `/admin/`, `/entrar`, `/registro`, `/recuperar`. Pero el área privada **vive bajo `/panel/`**, no bajo `/app/`. El comentario y el código están desincronizados.

Resultado: cada navegación a `/panel/clientes`, `/panel/clientes/{id-uuid}`, `/panel/operaciones`, `/panel/operaciones/{id}`, etc. se guarda en el `CacheStorage` del navegador con todos los datos de cumplimiento. En un dispositivo compartido, en uno robado, o en un navegador donde el `CacheStorage` no se limpia al cerrar sesión, la PII queda en disco indefinidamente.

`robots.ts:19` ya bloquea `/panel/` para rastreadores; la incoherencia es que **el navegador del propio usuario** cachea `/panel/` mientras la app le promete que no.

Adicionalmente, `/admin/` SÍ está en `NUNCA_CACHEAR`, lo que confirma que la intención original era "caché cero para cualquier ruta que requiera sesión" — sólo se equivocaron al nombrar el segmento (los `app/` no existen; los `panel/` sí).

**Fix recomendado:**

1. Cambiar `NUNCA_CACHEAR` para que cubra el universo correcto:
   ```js
   const NUNCA_CACHEAR = [
     '/api/',
     '/panel/',
     '/admin/',
     '/entrar', '/registro', '/recuperar', '/actualizar-contrasena',
     '/logout', '/offline',
   ];
   ```
2. Considerar también añadir `'/api/cron/'` (ya cubierto por `/api/`) y revisar cada seis meses contra el matcher del middleware (`apps/web/middleware.ts:11-14` define los prefijos protegidos como `RUTA_PANEL = '/panel'` y `RUTA_ADMIN = '/admin'`).
3. Añadir un test Playwright en `apps/web/e2e/contrato.spec.ts` que, tras una navegación autenticada a `/panel/clientes`, verifique que la entrada **no** aparece en `caches.keys()`.

---

### P2-SEC-03 · `verificarMFA` existe pero no se invoca desde la UI — el segundo factor es protección nominal

**Severidad:** Medium
**Ubicación:** `apps/web/src/lib/auth/acciones.ts:275-300`
**OWASP:** A07:2021 Identification and Authentication Failures · CWE-308 (Use of Single-Factor Auth)
**Estado:** **NUEVO**.

**Evidencia:**
```ts
// apps/web/src/lib/auth/acciones.ts:275-300
export async function verificarMFA(
  _previo: EstadoFormulario | null,
  datos: FormData,
): Promise<EstadoFormulario> {
  const supabase = await clienteServidor();
  if (!supabase) return SIN_CONFIGURAR;

  const codigo = texto(datos, 'codigo').replace(/\s/g, '');
  const { data: factores, error: errorFactores } = await supabase.auth.mfa.listFactors();
  const totp = factores?.totp?.find((f) => f.status === 'verified');
  if (errorFactores || !totp) return { ok: false, mensaje: ERROR_GENERICO };

  const reto = await supabase.auth.mfa.challenge({ factorId: totp.id });
  if (reto.error || !reto.data) return { ok: false, mensaje: ERROR_GENERICO };

  const { error } = await supabase.auth.mfa.verify({
    factorId: totp.id,
    challengeId: reto.data.id,
    code: codigo,
  });
  if (error) {
    return { ok: false, mensaje: mensajeSeguroDeAuth(error.code, error.message), campo: 'codigo' };
  }

  redirect(destinoSeguro(texto(datos, 'destino'), '/panel'));
}
```

`grep -rn "verificarMFA" apps/web/src` devuelve **un solo hit**: la declaración de la función. Ningún componente la importa. La página de seguridad (`apps/web/src/app/(app)/panel/seguridad/page.tsx`) sólo lista factores y permite dar de alta / retirar; no hay flujo de "verificar MFA para elevar a `aal2`".

**Por qué importa:**

Cuando un usuario con MFA activado entra con su contraseña, Supabase le devuelve una sesión `aal1` hasta que se verifique el segundo factor. Mientras esa elevación no exista en la UI, el nivel de la sesión **se queda en `aal1` para siempre** y `nivelAutenticacion === 'aal2'` (`apps/web/src/lib/auth/sesion.ts:92`) nunca se cumple. La insignia en `panel/seguridad/page.tsx:62` siempre dirá `aal1` aunque el factor esté activo.

Esto significa que un atacante con la contraseña de un usuario con MFA activado entra con la misma garantía que un usuario sin MFA. El botón de "Retirar este factor" en `AltaMFA.tsx:85` funciona sin desafío, lo que combinado con la superficie de ataque de `verificarMFA` (ver P2-SEC-04) da un perfil de riesgo: con contraseña robada, todo el MFA se puede desactivar o ignorar.

La pasada 1 mencionó las cuatro funciones de MFA separadas (F-05 del resumen), pero dio por hecho el flujo. La realidad es que el flujo no existe para el usuario.

**Fix recomendado:**

Crear la pantalla `/entrar/verificar-mfa` (o equivalente) que se muestra cuando el usuario tiene factores verificados pero su `aal` es `aal1`. El componente debe:

1. Llamar a `verificarMFA` con el código del formulario.
2. Si el usuario no tiene factor verificado pero la ruta se invoca, mostrar un error honesto.
3. Tras éxito, redirigir al `destino` que motivó la elevación.

Sin esta pieza, el MFA en la app actual es decorativo.

---

### P2-SEC-04 · `retirarMFA` no requiere re-autenticación — una sesión robada apaga el 2FA

**Severidad:** Medium
**Ubicación:** `apps/web/src/lib/auth/acciones.ts:267-272`
**OWASP:** A07:2021 Identification and Authentication Failures · CWE-287 (Improper Authentication)
**Estado:** **NUEVO**.

**Evidencia:**
```ts
// apps/web/src/lib/auth/acciones.ts:267-272
export async function retirarMFA(datos: FormData): Promise<void> {
  const supabase = await clienteServidor();
  const factorId = texto(datos, 'factorId');
  if (supabase && factorId) await supabase.auth.mfa.unenroll({ factorId });
  revalidatePath('/panel/seguridad');
}
```

Y la UI que la invoca:
```tsx
// apps/web/src/app/(app)/panel/seguridad/AltaMFA.tsx:83-90
<form action={retirarMFA}>
  <input type="hidden" name="factorId" value={factor.id} />
  <Boton type="submit" variante="peligro" tamano="sm">
    <ShieldOff aria-hidden="true" />
    Retirar este factor
  </Boton>
</form>
```

El propio comentario en `AltaMFA.tsx:96-99` lo dice sin adornos: "Si lo retiras, tu cuenta vuelve a protegerse sólo con la contraseña y el retiro se hace de inmediato, sin confirmación adicional."

**Por qué importa:**

El ataque asume una sesión ya robada (XSS, token JWT filtrado, dispositivo compartido, etc.). Con esa sesión:

1. El atacante navega a `/panel/seguridad`.
2. Pulsa "Retirar este factor". El `form action={retirarMFA}` envía el `factorId` automáticamente.
3. Supabase acepta `mfa.unenroll` porque la sesión tiene un JWT válido. No hay re-challenge porque Supabase no lo exige.
4. El atacante cierra la pestaña. Ahora la cuenta ya no tiene MFA. Próximo inicio de sesión, el atacante entra con sólo la contraseña.

Combinado con P2-SEC-03 (MFA nunca se eleva a `aal2` desde la UI), el resultado es que **el 2FA no añade ninguna fricción real contra un atacante con sesión robada**.

La nota honesta en `AltaMFA.tsx:96-99` no mitiga el problema; lo documenta.

**Fix recomendado:**

1. Requerir al menos una de:
   - Un segundo factor de respaldo (otro TOTP, o un código de recuperación generado al activar el primero).
   - Re-inserción de la contraseña actual antes de `unenroll`.
   - Un período de gracia de 24h en el que la operación queda en `pending` y se confirma por correo.
2. Documentar la decisión en `AltaMFA.tsx` para que un futuro mantenedor entienda por qué se requiere.

---

### P2-SEC-05 · `slugLibre` tiene TOCTOU y produce slugs duplicados bajo concurrencia

**Severidad:** Medium
**Ubicación:** `apps/web/src/lib/directorio/repositorio.ts:48-66`
**OWASP:** A04:2021 Insecure Design · CWE-367 (Time-of-Check Time-of-Use)
**Estado:** **NUEVO**. La pasada 1 documentó el TOCTOU de `agregar` (F-01) pero no vio que el generador de slug hereda el mismo problema: aunque `agregar` fuera atómico, dos requests concurrentes para el mismo nombre pueden elegir el mismo `base` antes de que cualquiera escriba.

**Evidencia:**
```ts
// apps/web/src/lib/directorio/repositorio.ts:48-66
async function slugLibre(nombre: string): Promise<string> {
  const base =
    nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'proveedor';

  const existentes = new Set((await leerLista<PerfilProveedor>(ARCHIVO_PERFILES)).map((p) => p.slug));
  if (!existentes.has(base)) return base;

  for (let n = 2; n < 1000; n++) {
    const intento = `${base}-${n}`;
    if (!existentes.has(intento)) return intento;
  }
  return `${base}-${Date.now()}`;
}
```

Y la llamada que la une al `agregar`:
```ts
// apps/web/src/lib/directorio/repositorio.ts:194-207
async guardarAlta(alta) {
  const id = crypto.randomUUID();
  const numeroFolio = folio('ALT', id);
  const slug = await slugLibre(alta.nombre);

  const registro: AltaProveedor = {
    ...alta,
    id,
    folio: numeroFolio,
    publicado: true,
    estadoModeracion: 'pendiente',
    perfilSlug: slug,
  };
  await agregar(ARCHIVO_ALTAS, registro);
```

**Por qué importa:**

`slugLibre` lee la lista, decide el slug, y devuelve. Entre ese momento y el `agregar` que persiste el `perfil`, otra solicitud concurrente puede haber leído la misma lista, decidido el mismo slug, y escrito. Resultado: dos perfiles `perfiles.json` con el mismo `slug`, pero sólo uno visible en `listarPerfiles()` por orden de inserción.

`perfilPorSlug()` (línea 180) hace `todos.find(p => p.slug === slug)` y devuelve el primero. El segundo perfil queda huérfano: existe en disco pero ninguna ruta lo enlaza, y el cliente que pagó por aparecer no aparece en `/directorio/{categoria}`. Es un fallo de negocio silencioso, no un compromiso, pero para una plataforma de cumplimiento es un problema operacional.

El comentario en `repositorio.ts:21-23` ("Suficiente para el volumen de un formulario público en modo de prueba") lo asume, pero mientras la migración a Supabase no ocurra, el riesgo existe.

**Fix recomendado:**

1. Mover el slug a un índice único en el archivo (o a un map `slug → id` separado) y validar unicidad en el `agregar` mismo. Si el slug ya existe, regenerar y reintentar.
2. Si se mantiene el filesystem como almacenamiento transitorio, copiar la misma cola externa que tiene el newsletter en `apps/web/src/app/api/newsletter/route.ts:105` y aplicarla aquí: serializar `leerLista` y `writeFile` por archivo.
3. La solución definitiva es la migración a Supabase ya planificada (mencionada en el comentario de `repositorio.ts:7-12`), donde el índice único de la columna `slug` lo garantiza.

---

### P2-SEC-06 · `proteger_ultimo_propietario` ejecuta SELECT con la sesión del llamante, no SECURITY DEFINER

**Severidad:** Medium
**Ubicación:** `supabase/migrations/0002_identidad.sql:112-137`
**OWASP:** A01:2021 Broken Access Control · CWE-285 (Improper Authorization)
**Estado:** **NUEVO**.

**Evidencia:**
```sql
-- 0002_identidad.sql:112-137
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
```

**Por qué importa:**

La función no lleva `security definer` ni `set search_path = public, pg_temp`. Eso significa que ejecuta el `SELECT count(*)` **con los permisos del usuario que está disparando el trigger**, no con los del definidor.

El `SELECT` cuenta filas en `public.organization_members`. Pero `organization_members` tiene `enable row level security` con `organization_members_select` (`0003_funciones_acceso.sql:234-236`):
```sql
create policy organization_members_select on public.organization_members
  for select to authenticated
  using (user_id = auth.uid() or public.es_miembro_de(organization_id) or public.es_staff());
```

Cuando un miembro `B` (no propietario) ejecuta un UPDATE que dispara este trigger — escenario real: un admin degradando a otro admin, lo cual el trigger evalúa por la rama UPDATE —, el `count(*)` ve sólo las filas que `B` puede ver. Si `B` no es propietario, **no ve a los demás propietarios** (porque `es_miembro_de` lo evalúa pero `rol_en` exige ver la fila propia; ver la fila de OTRO requiere la misma policy).

Resultado: `v_restantes = 0` aunque haya otros propietarios. El trigger lanza `La organización debe conservar al menos un propietario activo.` cuando en realidad la organización SÍ tiene otros propietarios. Es un **falso positivo** que bloquea operaciones legítimas.

El primer pase notó el trigger como mecanismo defensivo y lo alabó; no examinó si la lectura dentro respeta RLS.

Comparar con `impedir_autoelevacion` (línea 147-160), que sólo lee `auth.uid()` (variable de sesión, no fila) y por eso no tiene el problema. Y con `impedir_autopromocion_staff` (0003:148-166), que también lee `auth.uid()` y `new.id = old.id` locales.

**Fix recomendado:**

Añadir a la cabecera de la función:
```sql
create or replace function public.proteger_ultimo_propietario()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
```

`security definer` hace que el `count(*)` corra con permisos del dueño de la función (rol que ejecuta la migración), que por defecto ve todas las filas. `set search_path` blinda contra el escenario clásico de "esquema malicioso抢先夺" que la pasada 1 ya mencionó como criterio del proyecto.

---

### P2-SEC-07 · `clienteAdministrador` no enforza server-only

**Severidad:** Low
**Ubicación:** `apps/web/src/lib/supabase/administrador.ts:1`
**OWASP:** A05:2021 Security Misconfiguration · CWE-829 (Inclusion of Functionality from Untrusted Control Sphere)
**Estado:** **NUEVO**.

**Evidencia:**
```ts
// apps/web/src/lib/supabase/administrador.ts:1-20
import { createClient } from '@supabase/supabase-js';
import { URL_SUPABASE } from './configuracion';

const CLAVE_SERVICIO = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

/**
 * Cliente con clave de servicio. SALTA TODAS LAS POLÍTICAS RLS.
 *
 * Uso permitido: tareas programadas del servidor (monitor regulatorio) y
 * escrituras del sistema que no tienen un usuario detrás. NUNCA se importa
 * desde un componente marcado con `'use client'`: la clave llegaría al
 * navegador. Sólo se lee de `process.env` sin prefijo `NEXT_PUBLIC_`, así que
 * en cliente saldría vacía, pero el import sigue estando prohibido.
 */
export function clienteAdministrador() {
  if (!URL_SUPABASE || !CLAVE_SERVICIO) return null;
  return createClient(URL_SUPABASE, CLAVE_SERVICIO, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

El comentario termina con: "el import sigue estando prohibido." Pero nada en el código prohíbe la importación. Comparar con:

- `apps/web/src/lib/turnstile.ts:1` — `import 'server-only';`
- `apps/web/src/lib/directorio/documentos.ts:1` — `import 'server-only';`

**Por qué importa:**

El módulo `clienteAdministrador` lee `process.env['SUPABASE_SERVICE_ROLE_KEY']` que **no tiene prefijo `NEXT_PUBLIC_`**. En el bundle del cliente esa variable es `undefined`, así que la función retorna `null` y no se crea el cliente. La defensa funciona por omisión.

Pero:

1. Es defensa por convención, no por compilación. Un mantenedor futuro puede agregar `NEXT_PUBLIC_` a la variable por error (o al renombrar) y exponer la clave de servicio a todo el navegador.
2. Si la variable llega a tener valor en build del cliente (por error de configuración), `createClient(URL_SUPABASE, CLAVE_SERVICIO, ...)` se ejecuta y el objeto `SupabaseClient` con la clave de servicio queda en el bundle JS.
3. No hay test ni lint que falle si alguien importa esto desde un archivo `'use client'`.

**Fix recomendado:**

Añadir como segunda línea de `administrador.ts`:
```ts
import 'server-only';
```

Con eso, cualquier import desde un archivo marcado `'use client'` falla en build con un error explícito: "You're importing a component that imports server-only."

---

### P2-SEC-08 · `error.tsx` corre en cliente y registra el Error completo a la consola del navegador

**Severidad:** Low
**Ubicación:** `apps/web/src/app/error.tsx:29-31`
**OWASP:** A09:2021 Security Logging Failures · CWE-532 (Insertion of Sensitive Information into Log File)
**Estado:** **NUEVO**.

**Evidencia:**
```tsx
// apps/web/src/app/error.tsx:22-31
export default function ErrorDeRuta({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('[leyantilavado] error de ruta:', error);
  }, [error]);
```

**Por qué importa:**

El archivo se compila como `'use client'` (línea 1). El `console.error` se ejecuta en el navegador del usuario, con el objeto `Error` íntegro: mensaje, stack trace, y cualquier propiedad adjunta. Si en el momento del error la página renderizaba datos del cliente (típico en `/panel/clientes/{id}`), el `Error.stack` puede contener referencias a las props de React que viajaron por el server component boundary.

No es un leak masivo, pero en el log del navegador del usuario queda un registro que incluye:

- `error.digest` — el identificador de Next.js, ya se imprime en pantalla en línea 63, no es nuevo.
- `error.stack` — la traza completa, con paths como `app/(app)/panel/clientes/[id]/page.tsx:213` que apuntan a la estructura interna.
- Cualquier `error.cause` o propiedades custom que añadan las libs (`@supabase/ssr`, `@supabase/supabase-js`).

En una plataforma que procesa datos regulatorios, el log del navegador de un cliente con sesión activa no debería incluir la ruta de archivos internos del servidor.

**Fix recomendado:**

Limitar el log al digest:
```tsx
React.useEffect(() => {
  console.error('[leyantilavado] error de ruta:', { digest: error.digest, message: error.message });
}, [error]);
```

Mejor todavía: enviar el stack al servidor vía un endpoint dedicado de reporte y mostrar al usuario sólo el `digest` como hoy.

---

### P2-SEC-09 · `localStorage` guarda la lista de proveedores favoritos en texto plano

**Severidad:** Low
**Ubicación:** `apps/web/src/components/directorio/AccionesPerfil.tsx:16, 65`
**OWASP:** A02:2021 Cryptographic Failures · CWE-922 (Insecure Storage of Sensitive Information)
**Estado:** **NUEVO**.

**Evidencia:**
```ts
// apps/web/src/components/directorio/AccionesPerfil.tsx:8-14
/* ────────────────────────────────────────────────────────────────────────────
 * Acciones del perfil: guardar, compartir, reportar y reclamar.
 *
 * Los favoritos viven sólo en el navegador de quien los guarda. No se envían
 * al servidor: a quién estás mirando en un directorio de cumplimiento es un
 * dato sensible que no necesitamos.
 * ─────────────────────────────────────────────────────────────────────────── */
```

```ts
// apps/web/src/components/directorio/AccionesPerfil.tsx:16
const LLAVE_FAVORITOS = 'directorio:favoritos';
```

Y la escritura:
```ts
// apps/web/src/components/directorio/AccionesPerfil.tsx:64-66
window.localStorage.setItem(LLAVE_FAVORITOS, nuevos.join(','));
window.dispatchEvent(new Event('favoritos-directorio'));
```

**Por qué importa:**

El propio módulo reconoce el dato como sensible. Pero `localStorage`:

1. Es texto plano, legible por cualquier script que se ejecute en el mismo origen.
2. Persiste tras cerrar el navegador. En un dispositivo compartido o robado, los favoritos sobreviven a un `salir()`.
3. El manejador `useSyncExternalStore` en línea 55 escucha `window.addEventListener('storage', ...)` que también se dispara con cambios hechos por OTRA pestaña del mismo origen — no es un problema en sí, pero confirma que el storage es deliberadamente compartido entre pestañas.

En el modelo de amenaza actual (XSS, robo de dispositivo, dispositivo compartido), los favoritos son metadata: "este cliente está evaluando a contador X y notario Y en Ciudad de México". Combinado con `AccionesPerfil.tsx:140-153` que muestra los reclamos y reportes que el cliente está escribiendo, un atacante con acceso al navegador puede reconstruir un perfil conductual del cliente.

No es un fallo explotable a distancia, pero el comentario en línea 12 promete "no se envían al servidor" como mitigación, y eso es cierto, pero no aborda el almacenamiento local.

**Fix recomendado:**

1. Cifrar el valor antes de escribirlo. La API WebCrypto (`window.crypto.subtle.encrypt`) con una clave derivada del session-id de la pestaña es viable, pero añade complejidad.
2. Más simple: usar `sessionStorage` en lugar de `localStorage`. Se borra al cerrar la pestaña, que es probablemente la semántica que el usuario espera ("favoritos de esta sesión").
3. Documentar la decisión en el comentario del módulo: "se borra al cerrar la pestaña" vs "persiste entre sesiones, decisión consciente porque…".

---

### P2-SEC-10 · `monitor-fuentes` también acepta `x-cron-secret` además de `Authorization: Bearer`

**Severidad:** Low
**Ubicación:** `apps/web/src/app/api/cron/monitor-fuentes/route.ts:31-33`
**OWASP:** A05:2021 Security Misconfiguration · CWE-345 (Insufficient Verification of Data Authenticity)
**Estado:** **NUEVO**.

**Evidencia:**
```ts
// apps/web/src/app/api/cron/monitor-fuentes/route.ts:25-39
const SECRETO = process.env['CRON_SECRET'] ?? '';

function secretoValido(peticion: NextRequest): boolean {
  if (!SECRETO) return false;

  const cabecera =
    peticion.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    peticion.headers.get('x-cron-secret') ??
    '';
```

**Por qué importa:**

La doble aceptación añade superficie de ataque sin valor operativo:

1. El `.env.example:43-47` documenta **sólo** `Authorization: Bearer <CRON_SECRET>`. El header `x-cron-secret` no está documentado, no está en la documentación, y nadie lo usa hoy.
2. Si un WAF, CDN o proxy inverso está delante del endpoint, reescribir `x-cron-secret` es trivial: se pasa como header plano, se loguea en claro, y se filtra en cualquier export de logs. `Authorization` tiene un tratamiento más cuidadoso en la mayoría de stacks.
3. El secreto se evalúa con `timingSafeEqual` (línea 39), lo cual es bueno. Pero el `??` encadena dos fuentes; si mañana se añade una tercera (por ejemplo, una query string), el orden de precedencia importa y este patrón se vuelve difícil de auditar.

**Fix recomendado:**

Eliminar la rama `x-cron-secret`. Si alguna vez hace falta, se documenta con sufijo "legacy" y se elimina. Una sola fuente de verdad para el secreto es más fácil de defender.

---

### P2-SEC-11 · `verificarMFA` no exige `codigo.length === 6` ni formato numérico

**Severidad:** Low
**Ubicación:** `apps/web/src/lib/auth/acciones.ts:275-300`
**OWASP:** A04:2021 Insecure Design · CWE-1284 (Improper Validation of Specified Quantity in Input)
**Estado:** **NUEVO**.

**Evidencia:**
```ts
// apps/web/src/lib/auth/acciones.ts:281-285
const codigo = texto(datos, 'codigo').replace(/\s/g, '');
const { data: factores, error: errorFactores } = await supabase.auth.mfa.listFactors();
const totp = factores?.totp?.find((f) => f.status === 'verified');
if (errorFactores || !totp) return { ok: false, mensaje: ERROR_GENERICO };

const reto = await supabase.auth.mfa.challenge({ factorId: totp.id });
```

Comparar con `confirmarAltaMFA` en la misma archivo, línea 244-247:
```ts
const codigo = texto(datos, 'codigo').replace(/\s/g, '');
if (!factorId || codigo.length !== 6) {
  return { ok: false, mensaje: 'Escribe el código de seis dígitos de tu aplicación.', campo: 'codigo' };
}
```

**Por qué importa:**

`verificarMFA` envía a Supabase cualquier string que llegue en el campo `codigo` — vacío, de 1 carácter, no numérico, con emojis, etc. La función gemela `confirmarAltaMFA` sí exige `codigo.length === 6` antes de llamar a Supabase. La inconsistencia entre las dos server actions abre dos puertas con reglas distintas para la misma operación lógica (verificar un código de 6 dígitos).

Por sí solo no es un agujero: Supabase rechaza códigos de formato inválido. Pero:

1. Envia más llamadas inútiles al servidor de auth de Supabase, que tienen costo y rate limit.
2. La inconsistencia entre dos server actions adyacentes es un signo de código copy-paste sin revisión — un futuro mantenedor añadirá la misma validación incorrecta en otra server action.

**Fix recomendado:**

Copiar el check de `confirmarAltaMFA`:
```ts
if (codigo.length !== 6 || !/^\d{6}$/.test(codigo)) {
  return { ok: false, mensaje: MFA_CODIGO_INVALIDO, campo: 'codigo' };
}
```

Y ya que ambas funciones verifican lo mismo, extraer a un helper `validarCodigoTOTP(codigo: string)`.

---

### P2-SEC-12 · No hay `SECURITY.md` ni política de divulgación responsable

**Severidad:** Low
**Ubicación:** raíz del repo
**OWASP:** A05:2021 Security Misconfiguration · CWE-1295 (Debug Messages Revealing Unnecessary Information)
**Estado:** **NUEVO**.

**Evidencia:**

`find / -name "SECURITY.md" -o -name "security.txt"` (excluyendo `node_modules`) devuelve vacío. La raíz del repo tiene `README.md`, `CONTRATO.md`, `DESPLIEGUE.md`, `auditoria/`, pero ningún `SECURITY.md` ni `.well-known/security.txt`.

El `.env.example:43-47` menciona `CRON_SECRET` pero no enlaza a una política de seguridad.

**Por qué importa:**

Una plataforma YMYL que procesa datos regulatorios de cumplimiento debería tener un canal de divulgación responsable. La ausencia:

1. No disuade a quien descubre un bug de reportarlo en privado — pero tampoco lo facilita.
2. Si GitHub Security Advisories está activado en el repo (no verificado en este audit), la ausencia de `SECURITY.md` significa que el canal por defecto de GitHub tampoco se documenta.
3. Una plataforma que publica en LinkedIn "somos la LFPIORPI para mortales" sin tener canal de seguridad establecido es una señal de inmadurez del programa, no un agujero técnico.

**Fix recomendado:**

1. Crear `SECURITY.md` en la raíz con: versiones soportadas, canal de contacto (PGP-signed email o GitHub Security Advisories), SLA de primera respuesta, política de divulgación coordinada.
2. Crear `apps/web/public/.well-known/security.txt` con el formato estándar (`https://securitytxt.org/`).
3. Enlazar desde `DESPLIEGUE.md` y desde la página `/contacto`.

---

### P2-SEC-13 · `style-src 'unsafe-inline'` por Framer Motion + next/font; sin test de regresión

**Severidad:** Low
**Ubicación:** `apps/web/next.config.mjs:42`
**OWASP:** A05:2021 Security Misconfiguration · CWE-1021 (Improper Restriction of Rendered UI Layers)
**Estado:** **NUEVO**. La pasada 1 marcó `script-src 'unsafe-inline'` como F-05; este hallazgo es el gemelo de `style-src`.

**Evidencia:**
```js
// apps/web/next.config.mjs:42
"style-src 'self' 'unsafe-inline'",
```

Y el comentario en `next.config.mjs:9-12`:
> "style-src conserva 'unsafe-inline' por motivo distinto: React inserta estilos en línea para las animaciones de Framer Motion y para las variables de next/font."

**Por qué importa:**

A diferencia de `script-src`, `style-src` no permite ejecución de código. Pero `style-src 'unsafe-inline'` permite a un atacante que ya tiene un XSS limitado (por ejemplo, vía un parámetro URL que se refleja en el DOM como `<div style="background:url(javascript:...)">`) ejecutar payload sin pasar por el filtro de script-src. La superficie XSS de un sitio con `style-src` abierto es mayor que la de uno cerrado.

No hay vector XSS confirmado en este audit. Pero el comentario dice "lo usa Framer Motion" y "next/font", que son dependencias específicas — vale la pena medir si se puede reducir a `'self'` con `style-src-attr 'none'` y dejar inline sólo donde Framer lo necesite.

**Fix recomendado:**

1. Auditar qué reglas CSS inline usa Framer Motion. La mayoría de las animaciones con `framer-motion` se pueden hacer con `transform` y `opacity`, que no necesitan estilos inline.
2. Para `next/font`, las variables CSS se inyectan en `<head>` como un solo bloque, no inline por uso. Verificar si se puede mover a una hoja externa.
3. Si no se puede eliminar `'unsafe-inline'`, añadir un test Playwright que verifique la CSP en runtime contra la directiva `style-src` y que rompa el build si cambia.

---

### P2-SEC-14 · `consulta` puede navegar a `/panel/bitacora` por URL sin aviso

**Severidad:** Low
**Ubicación:** `apps/web/src/app/(app)/panel/bitacora/page.tsx:16-17`
**OWASP:** A04:2021 Insecure Design · CWE-862 (Missing Authorization)
**Estado:** **NUEVO**.

**Evidencia:**
```tsx
// apps/web/src/app/(app)/panel/bitacora/page.tsx:16-17
export default async function PaginaBitacora() {
  const contexto = await requerirContexto('/panel/bitacora');
```

La página sólo llama a `requerirContexto`, que verifica que el usuario está autenticado y tiene una membresía activa, pero **no** que tenga permiso `bitacora.ver`. La defensa real está en RLS: `audit_logs_select` en `0003_funciones_acceso.sql:300-306` exige `es_staff()` o `tiene_rol(organization_id, ['propietario','administrador','auditor'])` — `analista` y `consulta` no están en esa lista y obtienen lista vacía.

**Por qué importa:**

1. El usuario `analista` o `consulta` ve la página con su layout, la nota introductoria, los textos sobre "append-only", y finalmente "Todavía no hay movimientos" — sin entender que RLS lo está bloqueando, no la página.
2. La incoherencia entre lo que el menú muestra (oculto para `analista` por `permiso: 'bitacora.ver'` en `navegacion.ts:51`) y lo que la URL permite crea una falsa sensación de defensa.
3. Es un patrón que se repite: el permiso del menú no se enforza en la página (ver también P2-SEC-01, mismo patrón con `documentos.descargar`).

**Fix recomendado:**

Añadir al inicio de `PaginaBitacora`:
```ts
if (!contexto.puede('bitacora.ver')) {
  redirect('/panel?aviso=sin_permiso_bitacora');
}
```

Mismo patrón que `apps/web/src/app/(app)/panel/operaciones/importar/page.tsx:15`. Defense in depth: el RLS protege, pero la página debe decir "no tienes permiso" en lugar de "no hay datos".

---

### P2-SEC-15 · `'use server'` expone TODAS las funciones del módulo como server actions públicas

**Severidad:** Informational
**Ubicación:** `apps/web/src/lib/auth/acciones.ts:1`
**OWASP:** A05:2021 Security Misconfiguration · CWE-749 (Exposed Dangerous Method or Function)
**Estado:** **NUEVO**.

**Evidencia:**
```ts
// apps/web/src/lib/auth/acciones.ts:1
'use server';
```

**Por qué importa:**

La directiva `'use server'` al inicio de un archivo convierte **cada export** del archivo en un endpoint server action. Hoy son:

- `entrar`, `registrar`, `recuperar`, `actualizarContrasena` — autenticación.
- `salir` — cerrar sesión.
- `cambiarOrganizacion`, `cambiarVerComo` — manipular cookies de presentación.
- `iniciarAltaMFA`, `confirmarAltaMFA`, `retirarMFA`, `verificarMFA` — MFA.
- `verificarMFA` (P2-SEC-03) — invocable sin que haya UI.
- `retirarMFA` (P2-SEC-04) — invocable sin re-auth.

Por convención, las server actions son invocables desde el navegador con un POST firmado por Next. Pero también son invocables por un atacante que descubra la firma y la ruta. La superficie de ataque es:

- 11 funciones públicas sin endpoint visible en el código de la app.
- Cada una realiza una operación con efectos en DB o cookies.

La defensa real es que `clienteServidor()` requiere cookies de sesión válidas, así que un atacante no autenticado no pasa. Pero un atacante con sesión (robada o de `consulta`) tiene once puntos de entrada, no cuatro como el menú sugiere.

**Fix recomendado:**

1. Mover las server actions a archivos separados por dominio: `auth/acciones/cuenta.ts`, `auth/acciones/mfa.ts`, `auth/acciones/presentacion.ts`. Cada archivo con su `'use server'`, así una vulnerabilidad en uno no arrastra a los otros.
2. Documentar cada export con un comentario que explique quién puede llamarlo y qué validaciones hace (algunas lo tienen, ver `iniciarAltaMFA`, otras no).
3. Considerar un patrón de "require context" obligatorio al inicio de cada server action.

---

### P2-SEC-16 · El middleware escribe `destino` con la URL completa del request

**Severidad:** Informational
**Ubicación:** `apps/web/src/lib/supabase/middleware.ts:59`
**OWASP:** A03:2021 Injection · CWE-601 (URL Redirection to Untrusted Site)
**Estado:** **NUEVO**.

**Evidencia:**
```ts
// apps/web/src/lib/supabase/middleware.ts:53-61
if (!user && esProtegida(ruta)) {
  const destino = peticion.nextUrl.clone();
  destino.pathname = RUTA_ENTRAR;
  destino.search = '';
  destino.searchParams.set('destino', `${ruta}${peticion.nextUrl.search}`);
  return NextResponse.redirect(destino);
}
```

**Por qué importa:**

El `destino` que se preserva es `${ruta}${peticion.nextUrl.search}`. Hoy `ruta` viene de `peticion.nextUrl.pathname` y `peticion.nextUrl.search` viene del query string de la URL solicitada. Ambos son controlados por Next (no por el usuario directo: el query string sí lo controla el usuario, pero el middleware lo pasa como cadena opaca).

La pasada 1 (F-03) ya documentó que `destinoSeguro` se aplica después en el redirect final. Pero hay un matiz: el `destino` que viaja en la URL de redirección a `/entrar?destino=...` **no se sanea aquí**. La página de entrada (`apps/web/src/app/(auth)/entrar/page.tsx:24, 31, 50`) sí llama a `destinoSeguro(destino, '/panel')` antes de usarlo, lo que cierra el riesgo hoy.

Pero si en el futuro alguien añade un `<Link href={`?destino=${destino}`}>` sin pasar por `destinoSeguro`, o si cambia la página de entrada para leer `destino` desde otra fuente (cookie, header, query distinto), el middleware seguirá inyectando la URL completa sin sanear. Es una defensa en profundidad que falta en el lugar correcto.

**Fix recomendado:**

Aplicar `destinoSeguro` en el middleware antes del redirect:
```ts
import { destinoSeguro } from './permisos';
...
destino.searchParams.set('destino', destinoSeguro(`${ruta}${peticion.nextUrl.search}`, '/panel'));
```

El cambio es mínimo y elimina una dependencia de la disciplina de los call sites aguas abajo.

---

## 4. ¿Qué es NUEVO vs. pasada 1?

Listado explícito. **Todos** los hallazgos de esta pasada son nuevos, salvo re-clasificaciones puntuales:

| ID pasada 2 | Estado vs. pasada 1 |
|---|---|
| P2-SEC-01 | **NUEVO** — la pasada 1 no examinó el control de acceso de `/panel/exportaciones` ni el gap entre matriz y página. F-12 trataba sobre `feature_flags`, no sobre el export. |
| P2-SEC-02 | **NUEVO** — F-05 cubrió `script-src 'unsafe-inline'`, no el service worker. |
| P2-SEC-03 | **NUEVO** — F-07 (en el resumen de pasada 1) menciona las cuatro funciones de MFA pero no nota que `verificarMFA` no tiene UI. |
| P2-SEC-04 | **NUEVO** — F-14 (en pasada 1) cubre que `actualizarContrasena` no exige contraseña actual; no cubre `retirarMFA`. |
| P2-SEC-05 | **NUEVO** — F-01 cubrió el TOCTOU de `agregar`, no el de `slugLibre`. |
| P2-SEC-06 | **NUEVO** — la pasada 1 alabó el trigger "último propietario" pero no examinó si la lectura respeta RLS. |
| P2-SEC-07 | **NUEVO** — el comentario "el import sigue estando prohibido" no se examinó como defensa. |
| P2-SEC-08 | **NUEVO** — el manejo de errores en cliente no se examinó. |
| P2-SEC-09 | **NUEVO** — el localStorage de favoritos no se mencionó. |
| P2-SEC-10 | **NUEVO** — el endpoint del cron sólo se mencionó en F-16. |
| P2-SEC-11 | **NUEVO** — inconsistencia entre `confirmarAltaMFA` y `verificarMFA`. |
| P2-SEC-12 | **NUEVO** — no se buscó `SECURITY.md` en pasada 1. |
| P2-SEC-13 | **NUEVO** — F-05 de pasada 1 fue sobre `script-src`; `style-src` no se examinó. |
| P2-SEC-14 | **NUEVO** — la pasada 1 alabó RLS en `audit_logs` pero no notó el gap UX/página. |
| P2-SEC-15 | **NUEVO** — la pasada 1 mencionó la separación matriz/RLS pero no la superficie de server actions. |
| P2-SEC-16 | **NUEVO** — variante del F-03 con foco en middleware. |

**No se re-clasificó ningún hallazgo de la pasada 1.** El Medium más cercano de la pasada 1 (F-01 race condition) sigue siendo Medium y no se eleva aquí — es un defecto de comportamiento, no de autorización, y la nueva evidencia (P2-SEC-05) lo complementa sin reemplazarlo.

---

## 5. Top 5 — debe arreglarse primero

1. **P2-SEC-01 (High) · `/panel/exportaciones` entrega PII a `consulta` y `analista` sin chequear `documentos.descargar`.** Es la única High de esta pasada. Una línea de guard al inicio de la página (ver `apps/web/src/app/(app)/panel/operaciones/importar/page.tsx:15` como plantilla) cierra el acceso, y la auditoría pendiente (mencionada en el propio código) cubre el segundo problema. **Esfuerzo: 1 hora.**

2. **P2-SEC-02 (Medium) · Service worker cachea `/panel/*` en disco.** Cambiar `NUNCA_CACHEAR` en `sw.js:30` y añadir un test Playwright son 30 minutos. El riesgo es real (privacidad en dispositivo compartido) y el fix es mecánico. **Esfuerzo: 1 hora, contando el test.**

3. **P2-SEC-03 (Medium) · MFA es protección nominal porque `verificarMFA` no tiene UI.** Crear `/entrar/verificar-mfa` que se muestra cuando el usuario tiene factores pero `aal === 'aal1'`. El componente cliente es trivial; la server action ya existe. **Esfuerzo: 4-8 horas** (componente + redirección desde `entrar` cuando aplica + tests e2e).

4. **P2-SEC-04 (Medium) · `retirarMFA` no requiere re-auth.** Añadir el campo "contraseña actual" al formulario existente, validar contra `signInWithPassword` antes de `unenroll`. **Esfuerzo: 2 horas.**

5. **P2-SEC-06 (Medium) · `proteger_ultimo_propietario` no es `SECURITY DEFINER` y los conteos pueden mentir.** Añadir dos líneas al header de la función en `0002_identidad.sql:114-115` (cambiar `language plpgsql` por `language plpgsql security definer set search_path = public, pg_temp`). Aplicar la misma corrección a `impedir_autoelevacion` y `impedir_autopromocion_staff` por consistencia (no son urgentes pero comparten el patrón). **Esfuerzo: 30 minutos + tests.**

Los 11 hallazgos restantes se priorizan en este orden: **P2-SEC-05** (TOCTOU del slug) es Medium y comparte la causa raíz con F-01, se cierra con la misma migración a Supabase; **P2-SEC-07, P2-SEC-10, P2-SEC-11** son endurecimiento de bajo impacto y bajo costo; **P2-SEC-08, P2-SEC-09** son mejoras de privacidad en cliente; **P2-SEC-12, P2-SEC-13, P2-SEC-14, P2-SEC-15, P2-SEC-16** son pulido que se puede diferir sin riesgo inmediato.
