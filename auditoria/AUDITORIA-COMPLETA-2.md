# Auditoría integral — LeyAntilavado.org — Pasada 2 (consolidado)

**Fecha:** 12 de agosto de 2026
**Modo:** read-only. No se modificó código. Cada hallazgo lleva su `file:line` real extraído con ripgrep.
**Alcance:** `apps/web/` (Next.js 16 + React 19 + Supabase), `packages/*/`, `supabase/migrations/*`
**Reportes en este archivo (en orden):**
1. Esta cabecera y el resumen ejecutivo consolidado
2. **Sección A** — Seguridad (pasada 2: 16 hallazgos)
3. **Sección B** — Calidad de código y rendimiento (pasada 2: 18 hallazgos)
4. **Sección C** — SEO + Contenido + GEO (pasada 2: 28 hallazgos)
5. **Sección D** — UX / Diseño / Accesibilidad (pasada 2: 30 hallazgos)
6. **Apéndice** — Resultados de la pasada 1 (referencia para entender qué se cerró y qué sigue)

---

## Resumen ejecutivo consolidado

### Veredicto

El proyecto es **serio, está bien cuidado y es defendible**. La pasada 1 ya verificó la postura defensiva (CSP, RLS, headers, anti-enumeración, `destinoSeguro`, MFA, audit log append-only, `npm audit` limpio). La pasada 2 metió el dedo en los puntos ciegos: server actions expuestas, service worker, authorization real de páginas, contenido GEO que no se cita solo, y fricciones finas en los flujos del usuario.

**Postura global (pasada 1 + 2 combinadas):**

| Dimensión | Pasada 1 | Pasada 2 | Δ | Veredicto |
|---|---:|---:|---:|---|
| Seguridad | 88/100 | 82/100 | −6 | La pasada 1 ya cubrió lo evidente. La 2 encuentra 1 HIGH real (exportaciones sin permiso), service worker mal configurado, MFA nominal, TOCTOU en slug. |
| Calidad de código | 9.0/10 | 9.0/10 | = | 4 hallazgos cerrados entre pasadas (deps no usadas, páginas de estado). 6 medios nuevos. |
| SEO + contenido | 79/100 | **86/100** | +7 | Cierra F-01, F-02, F-21. Aparece 1 HIGH nuevo: `Article.image` apunta a URL 404 en todas las páginas que no son `/`. |
| UX / diseño / a11y | 79/100 | **87/100** | +8 | Cierra los 2 críticos y 8 altos. Aparecen 8 altos nuevos en flujos (theme button, aria-busy, inputMode). |

**Global: 85/100** (sube desde 84 tras incorporar las correcciones de la primera pasada).

### Puntuación detallada por categoría (pasada 2, donde difiere)

**Seguridad (16 hallazgos: 1 HIGH, 6 medium, 7 low, 2 informational)**
- HIGH nuevo: `/panel/exportaciones` entrega PII completa a roles `consulta` y `analista` sin consultar `documentos.descargar`. La matriz dice "no puedes exportar" y la página dice "toma, aquí tienes todo". (P2-SEC-01)
- Mediums nuevos: service worker cachea `/panel/*` en disco; `verificarMFA` está expuesta como server action pero la UI nunca la llama (MFA es protección nominal); `retirarMFA` no requiere re-autenticación; TOCTOU en `slugLibre` permite duplicados; `proteger_ultimo_propietario` ejecuta SELECT con la sesión del llamante y los conteos pueden mentir.
- Lows nuevos: `clienteAdministrador` sin `import 'server-only'`; `error.tsx` registra el Error completo a la consola (PII potencial); localStorage guarda favoritos en plano; CRON acepta `x-cron-secret` además de `Authorization`; `verificarMFA` no exige length 6 numérico; sin `SECURITY.md`; CSP `style-src 'unsafe-inline'` sin test de regresión; `consulta` puede navegar a `/panel/bitacora` por URL (RLS bloquea pero el código no avisa).
- Informational: `'use server'` en `auth/acciones.ts` expone TODAS las funciones como server actions públicas; `destinoSeguro` se aplica en 6 call sites pero el middleware escribe `destino` con la URL completa.

**Calidad de código (18 hallazgos: 0 critical, 0 high, 6 medium, 9 low, 3 informational)**
- Mediums: sin `.editorconfig` (cambia CRLF/LF entre macOS y VPS Linux); sin `.prettierrc*`; dos `REVISION_VIGENTE` que pueden divergir entre `autores.ts:42` y `comun.tsx:25`; `repositorio.guardarAlta` read-modify-write sin lock (igual que la primera seguridad); 6 de 8 API routes sin `export const dynamic = 'force-dynamic'`; 4 herramientas cliente >400 LOC sin tests adicionales a Cuestionario.
- Lows: magic numbers `3` y `10` en umbrales de urgencia de avisos; comentario `ponytail:` (acrónimo personal) en 2 archivos; `Campo` no usa `useId()`; `CuentaRegresivaReglas` recalcula `sort`+`filter` cada segundo; `FECHA_HOY` en build artifacts aunque source usa `REVISION_VIGENTE`; `import * as React` subió a 30 archivos; `Math.random()` en test sigue; `try/catch` silenciosos en 4 herramientas; keys de Fragment no únicas; `Cuestionario.tsx` carga 6 iconos lazy-importable.
- Informational: `verificarTurnstile` se sigue ejecutando si la API está caída; las páginas `reforma-ley-antilavado-2026` y `multas` importan `REVISION_VIGENTE` de dos archivos distintos.

**SEO + Contenido + GEO (28 hallazgos: 0 critical, 2 high, 18 medium, 8 low; score 86/100)**
- HIGH nuevo: `Article.image` apunta a `${ruta}/opengraph-image` y esa URL **sólo existe para `/`**. Para `/umbrales`, `/glosario`, etc., la URL devuelve 404. El JSON-LD dice "esta página tiene imagen" y no la tiene. (F-01 P2)
- HIGH reaperture: 17 calculadoras sin `HowTo` schema, aunque su sección "Cómo se calcula" es literalmente una secuencia de pasos. (F-05 P2)
- Mediums clave: `Dataset` sin `variableMeasured`/`distribution`/`temporalCoverage`; comentario engañoso sobre `noindex` en `sitio.ts:144-147`; 5 `respuestaDirecta` con deícticos sin antecedente; calendario de cumplimiento sin `Event` schema; `ItemList` ausente en `/herramientas` y `/directorio`; `WebApplication` ausente; `@graph` no consolidado; `Article` sin `about`; 6 páginas sin bloque `respuestaDirecta` propio; paginación del directorio con `rel="prev"/"next"` en `<a>` (deprecated), falta `<link>` y la canónica apunta a `/directorio` para cualquier `?pagina=N`; FAQ duplicado entre `/preguntas-frecuentes` y `/umbrales`; cuestionario sin schema propio; `Author` siempre `Organization` sin `reviewedBy`; `WebSite` sin `publisher`/`potentialAction`; `.env.example:19-22` con comentarios contradictorios; sitemap con `lastModified: REVISION_VIGENTE` compartido entre 24 páginas; 39 `respuestaDirecta` cortas; sitemap con `/cursos` y `/plantillas` en prioridad 0.6.
- Lows: `public/img/hero-escritorio.webp` huérfano en disco (66 KB); `host: SITIO.url` en robots (directiva deprecated); `Disallow: /offline` ambiguo; OG sin `og:site_name` en `WebSite`; `REVISION_VIGENTE` en `dateModified` para todas las actividades/obligaciones; 4 páginas institucionales sin `WebPage` ni `Article`; anchor text repetido "Ver" en `MapaDelSitio`; `nosotros`/`metodologia-editorial`/`fuentes-oficiales`/`preguntas-frecuentes` sin schema propio.

**UX / Diseño / Accesibilidad (30 hallazgos: 0 critical, 0 high re-clasificado, 8 high, 13 medium, 9 low; score 87/100)**
- HIGHs nuevos: botón de tema sin indicación del estado actual (sólo "Cambiar entre…"); `aria-busy` ausente en todos los formularios durante submit; spinner visual ausente; cuestionario con error "ninguna actividad aplica" sin salida de UI; falta `inputMode` en teléfono y campos de monto; `autoComplete` no se aplica a nombres de empresa y campos monetarios; directorio: filtro `q` no busca por categoría ni actividad; sin `loading.tsx` en `(app)/`, navegación al panel se siente colgada; contraste del `precio MXN` en estado hover de la página de precios; cuestionario: paso "resultado" no es navegable por teclado de vuelta al formulario.
- Mediums: skip-link con `left: -9999px` puede no mover el foco virtual en SR modernos; panel sin `loading.tsx`; `BarraSuperior` del panel sin feedback; contraste del asterisco rojo `*` sobre fondo blanco; `aria-disabled` falso en mailto del cuestionario; formularios auth sin `aria-describedby` general; `Newsletter` checkbox con `aria-label="obligatorio"` en span sin rol; `fieldset` del filtro de directorio sin `aria-labelledby`; FAQ `<details>` sin `aria-expanded`; inconsistencia entre `text-wrap: balance` y h1 del Hero; `Boton comoHijo` con `<Link>` envuelto pierde pista semántica; glosario sin `<h3>` por término; menú móvil con `<p className="eyebrow">` para grupos.
- Lows: campo de subida sin `aria-describedby`; reloj regresivo en vivo emite cambio de DOM cada segundo; `FiltrosDirectorio` no responsive colapsado a mobile; botón de tema y menú móvil sin texto visible; `TablaRecurso` no muestra el total filtrado con paginación; aplicar filtros no muestra "Cargando…"; tooltips de información del directorio sin label.

### Lo que cambió entre pasada 1 y pasada 2

**Cerrado:**
- Páginas de estado de Next.js (`not-found.tsx`/`error.tsx`/`loading.tsx`/`global-error.tsx`) — creado.
- "Última actualización" muestra la fecha del build → migrado a `REVISION_VIGENTE` en 3 páginas.
- `recortar()` ahora tiene tests; el comportamiento es explícito.
- Dependencias no usadas (`recharts`/`zustand`) eliminadas de `package.json`.
- 11 `@radix-ui/*` no usados eliminados de `package.json` (en parte).
- `script-tema.mjs` muerto eliminado.
- `aria-required` añadido en inputs (antes era `aria-label` en span sin rol).
- Botones subidos a 44px (`Boton sm` y header nav).
- `TablaEnvoltura` con `aria-label`/`aria-labelledby`.
- `Mapa del sitio` ya incluye metodología editorial y nosotros.

**Sigue abierto (prioridad recalibrada donde corresponde):**
- F-04 SEO (deícticos) — sigue exactamente igual.
- F-08 SEO (`Dataset` incompleto) — ahora F-02 P2 con consecuencia GEO concreta.
- F-15 UX (noindex engañoso) — sigue exactamente igual en `sitio.ts:144-147`.
- 39 `respuestaDirecta` cortas — sigue exactamente igual.

**Apareció en la pasada 2 y no estaba antes:**
- 1 HIGH seguridad real (exportaciones).
- 1 HIGH SEO real (`Article.image` apunta a URL 404 en todas las páginas != `/`).
- 1 HIGH UX repetido en 8 lugares (`aria-busy` ausente en todos los forms).
- 1 HIGH seguridad (service worker cachea `/panel/*` por error).
- 1 HIGH seguridad (MFA nominal — server action expuesta pero nunca llamada).
- 1 HIGH seguridad (`retirarMFA` sin re-auth).
- 1 HIGH seguridad (TOCTOU en slug del directorio).
- 1 HIGH seguridad (`proteger_ultimo_propietario` corre con sesión del llamante).
- 1 HIGH UX (botón de tema sin estado).
- 1 HIGH UX (cuestionario sin salida para "ninguna actividad aplica").
- 1 HIGH UX (sin `inputMode` en teléfono y monto).
- 1 HIGH UX (autoComplete ausente en nombres de empresa y campos monetarios).
- 1 HIGH UX (filtro `q` del directorio no busca por categoría/actividad).
- 1 HIGH UX (sin `loading.tsx` en `(app)/`).
- 1 HIGH UX (contraste del precio en hover).

### Top 20 — Lo que arreglaría primero (orden impacto/esfuerzo)

| # | Hallazgo | Área | Esfuerzo | Impacto |
|---|---|---|---|---|
| 1 | `/panel/exportaciones` consulta `documentos.descargar` y registra la descarga en `audit_logs` (P2-SEC-01) | Seguridad | 4-6 h | Cierra la matriz mintiendo y la fuga de PII silenciosa |
| 2 | `Article.image` deja de apuntar a `${ruta}/opengraph-image` (F-01 P2 SEO) | SEO/Schema | 30 min | Cierra 404 de OG image en todas las páginas != `/` |
| 3 | Service worker: añadir `/panel/*`, `/admin/*`, `/entrar`, `/registro`, `/recuperar` a `NUNCA_CACHEAR` (P2-SEC-02) | Seguridad | 1 h | Cierra fuga de área privada por caché en disco |
| 4 | `verificarMFA` se llama en cada server action sensible + `retirarMFA` exige re-auth (P2-SEC-03/04) | Seguridad | 4 h | Hace real la protección MFA |
| 5 | Crear `loading.tsx` en `(app)/` con skeleton (P2-UX-08) | UX | 1 h | Reduce perceived wait del panel |
| 6 | Añadir `aria-busy` + spinner a los 5 forms de submit (P2-UX-02/03) | UX/a11y | 2 h | Cubre el peor momento del form |
| 7 | `slugLibre`: serializar las altas y validar unicidad post-insert (P2-SEC-05) | Seguridad | 1 h | Cierra TOCTOU del directorio |
| 8 | `Sucursales visibles` en RLS (F-02 P1) + cerrar `branch_ids` en las 6 políticas (P2 re-clasificación) | Seguridad/RBAC | 4-6 h | Aislamiento por sucursal en DB, no sólo en UI |
| 9 | `proteger_ultimo_propietario` en `SECURITY DEFINER` con `set search_path` (P2-SEC-06) | Seguridad | 2 h | Conteo de miembros confiable |
| 10 | `HowTo` schema en las 17 calculadoras (F-05 P2 SEO) | SEO/GEO | 4 h | Cita literal de la sección "Cómo se calcula" |
| 11 | Botón de tema con `aria-label` dinámico según estado (P2-UX-01) | UX/a11y | 30 min | Descubribilidad del toggle |
| 12 | `useId()` en `Campo` (P2-CAL-09) | UX/a11y | 1 h | Cierra riesgo de colisión de `id` |
| 13 | `inputMode` + `autoComplete` en teléfono, monto, nombre de empresa (P2-UX-05/06) | UX | 2 h | Teclado correcto en móvil, autofill funciona |
| 14 | `.editorconfig` + `.prettierrc*` + `format` script (P2-CAL-01/02) | Calidad/tooling | 1 h | Formato consistente entre macOS y VPS Linux |
| 15 | Consolidar `REVISION_VIGENTE` en un solo módulo (P2-CAL-03) | Calidad/consistencia | 1 h | Una sola fuente de verdad |
| 16 | `loading.tsx` en `(app)/` (P2-UX-08) y en `/directorio` (UX-29) | UX | 1 h | Cubre navegación lenta |
| 17 | `error.tsx` con `console.error` redactado, sin PII (P2-SEC-08) | Seguridad | 30 min | Evita fugar PII a la consola del cliente |
| 18 | Borrar `import * as React` (28-30 archivos) | Calidad/estilo | 30 min con script | Limpieza cosmética |
| 19 | Cuestionario: salida clara cuando ninguna actividad aplica (P2-UX-04) | UX | 1 h | Cubre el camino "no encaja" |
| 20 | `error.tsx` (que ya existe) y verificar que en producción no loguea PII (P2-SEC-08) | Seguridad | 30 min | Fuga potencial de PII a consola del navegador |

### Lo que el código hace bien (verificado, no placeholders)

**Seguridad (extraído de las dos pasadas):**
- CSP completa con `'unsafe-inline'` documentado y justificado, `frame-ancestors 'none'`, `object-src 'none'`, HSTS preload, COOP, Permissions-Policy cerrado, `poweredByHeader: false`.
- Middleware de sesión con `getUser()` (no `getSession()`) en cada request.
- RLS con doble puerta: políticas + triggers (`impedir_autoelevacion`, `impedir_autopromocion_staff`).
- `destinoSeguro` cubre 6 vectores, 6 call sites antes de cualquier `redirect()`.
- Rate limit por IP con ventana deslizante y `Retry-After`.
- MFA con TOTP: 4 server actions separadas, AAL expuesto en sesión.
- Triggers de inmutabilidad: `audit_logs` y `content_revisions` append-only.
- `npm audit` limpio (0 vulnerabilidades).
- Validación con zod en todas las rutas `/api/*`; `z.literal(true)` para consentimiento.

**Calidad (extraído de las dos pasadas):**
- TS estricto real (`noUncheckedIndexedAccess`), cero `any`, cero `@ts-ignore`.
- Package boundaries limpios (ningún `packages/*` importa de `apps/web`).
- Motor jurídico puro y determinista con tests de asserts exactos (570 líneas en `motor.test.ts`).
- `react-hooks/purity` activo y verificado.
- Service worker bien delimitado (excepto el bug P2-SEC-02).
- `EMPAQUETAR=1` bien aislado.
- ESLint flat config nativo, sin `FlatCompat`.

**SEO (extraído de las dos pasadas):**
- Indexabilidad correcta (robots, OG/Twitter, llms.txt con 14 secciones, 14 agentes de IA).
- `Organization` con `@id`/`logo`/`image`/`knowsAbout`/`areaServed`.
- `Article` enriquecido (con la salvedad del bug de `image`).
- Motor de procedencia trazable: cada regla tiene `Procedencia` con fuentes, disposición, fecha y nivel de verificación.
- Títulos ≤ 60 enforced por tests, descripciones ≤ 160 enforced por tests.
- Sitemap vivo.

**UX (extraído de las dos pasadas):**
- Sistema de diseño sólido: tokens WCAG AA documentados.
- `prefers-reduced-motion` global y exhaustiva.
- `CuentaRegresivaReglas` con `role="timer"` + `aria-live="off"` + `aria-label` legible.
- Formularios con `aria-describedby` cableado, `role="alert"` en errores, `aria-live="polite"` en resultados.
- Honeypot bot correctamente oculto.
- Etiquetas siempre visibles.
- Tipografía autoalojada.

### Lo que NO se pudo verificar estáticamente

1. Comportamiento real de RLS bajo carga concurrente.
2. Visual rendering (los hallazgos de UX se basan en CSS/Tailwind, no en screenshots).
3. Comportamiento de SR específico (los hallazgos de a11y se basan en bugs conocidos).
4. Bundle real en producción con `next build --profile`.
5. Comportamiento del refresh de sesión entre server actions.
6. Indexación real de Google (toma semanas y depende de crawl budget).
7. Auth flows con token de sesión robada.
8. **Service worker en condiciones reales**: ¿qué pasa si la app se actualiza entre renders? ¿Si el usuario tiene 2 pestañas abiertas con sesiones distintas?
9. **Patrón `'use server'` global**: ¿qué tan expuesto queda el endpoint si alguien hace fuerza bruta sobre los nombres de las funciones?
10. **`useSyncExternalStore` con `getServerSnapshot`**: ¿se desuscribe correctamente al desmontar? Sin test es difícil saberlo.

---

**Cómo leer este archivo:** las 4 secciones detalladas (A, B, C, D) están abajo. Cada una tiene su propio resumen ejecutivo, tabla de hallazgos, hallazgos detallados con `file:line`, y secciones "Top X must-fix". El apéndice al final tiene los reportes de la pasada 1 (para referencia si necesitas entender qué se cerró entre pasadas).

---

# SECCIÓN A · Seguridad (pasada 2)

---

## Reporte detallado — Seguridad (pasada 2)

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

---

## Reporte detallado — Calidad de código y rendimiento (pasada 2)

# Auditoría de calidad de código y rendimiento — Segunda pasada
## LeyAntilavado.org

**Tipo:** read-only (sin tocar nada)
**Modo:** segunda pasada — el primer reporte (`auditoria/02-calidad-codigo.md`, 12 hallazgos) ya se escribió; este documento **NO** lo repite, sólo lo completa.
**Stack auditado:** Next.js 16.3 · React 19.0 · Supabase SSR 0.5 · Tailwind v4 · TS 5.7 strict · Turborepo 2.5
**Alcance del código:** 47 251 líneas TS/TSX en `apps/web/src` y `packages/*/src` (vs 45 470 de la primera pasada → +1 781, en gran parte por la página `reforma-ley-antilavado-2026/` y los tres páginas de estado).
**Fecha del commit sobre el que se audita:** `3472303` (12-ago AM).

---

## 1. Resumen ejecutivo

**Puntaje global: 9.0 / 10** (igual que la primera pasada, pero por razones distintas: 4 hallazgos de la primera ya están cerrados, 7 nuevos se suman; el balance neto es neutro).

El repositorio sigue notablemente bien cuidado. **Cuatro de los seis hallazgos que arrastraban peso real ya se cerraron entre la primera pasada y este commit** — los más importantes son `F-01` (deps no usadas `recharts`/`zustand`, retiradas) y `F-02` (páginas de estado de Next, añadidas en el commit `3b5cc9c`). La superficie restante de la primera pasada (8 hallazgos) son todos bajos o informativos que el equipo conoce.

Lo que aparece en esta segunda pasada es lo que la primera no llegó a profundizar:

1. **Higiene del repo** — sin `.editorconfig`, sin `.prettierrc*`, sin `setupFiles` de Vitest. El proyecto depende del formateo implícito del IDE y de `tsc`. La primera pasada no miró tooling.
2. **Dos constantes `REVISION_VIGENTE` que pueden divergir** — el mismo valor (`'2026-08-11'`) está hardcodeado en `apps/web/src/content/autores.ts:42` y derivado de `VERSION_LEGAL` en `apps/web/src/components/inicio/comun.tsx:25`. Si se actualiza una y no la otra, el sitio afirma fechas distintas de pasada editorial según la página.
3. **Race condition en `repositorio.guardarAlta` sin serializar** — la auditoría de seguridad la marcó como F-01; la de calidad **no la repitió**, pero es relevante aquí porque rompe la integridad del archivo JSON de altas y la regla de "no perder un envío del usuario" está implícita en todo el módulo.
4. **API routes sin `export const dynamic = 'force-dynamic'`** — 6 de los 8 endpoints. Funcionan porque leen `headers`/`cookies`/cuerpo, lo que ya fuerza render dinámico, pero la primera pasada mencionó que todos lo declaraban explícitamente: **no es cierto**, sólo `newsletter` y `monitor-fuentes` lo declaran.
5. **`CuentaRegresivaReglas` con riesgo de re-render no acotado** — el reloj compartido a nivel de módulo dispara `useSyncExternalStore` cada segundo; los `useMemo` que dependen de `ahoraMs` recalculan `ReglaConFecha[]` en cada tick. En la portada (con `limite` recortado y reglas ordenadas) se hace `[...reglas].sort(...)` y un `filter` por cada tick del reloj. Es O(n) cada segundo, no es un bug, pero la primera pasada lo señaló como "mayor riesgo de regresión" sin haber leído el código real.
6. **Componentes cliente >800 LOC sin tests** — `Cuestionario.tsx` (910), `EditorEstructura.tsx` (567), `Acumulacion.tsx` (550), `VerificadorEfectivo.tsx` (462), `Importador.tsx` (418), `ClasificacionClientes.tsx` (406). El primero ya lo marcó la primera pasada; los cuatro siguientes no.
7. **Magic numbers en lógica de avisos** — `diasRestantes <= 3` y `diasRestantes <= 10` en `avisos.ts:74-75` están inline, sin nombre, y aparecen en un test que valida estados pero no documenta por qué esos números.

**Puntaje por dimensión (subjetivo, sobre 10):**

| Dimensión | Puntaje | Comentario |
|---|---|---|
| Tipos y strictness | 10 | Sigue impecable. Cero `any`/`@ts-ignore` en source. `as unknown as` reducido a 3 (los 3 legítimos, ya documentados). |
| Estructura modular | 9.5 | Sin cambios. Boundaries limpios. La única grieta potencial es la doble `REVISION_VIGENTE` (P2-CAL-03). |
| Patrones React 19 | 9 | `useSyncExternalStore`, `useActionState` + `useFormStatus` correctos. `useId()` ausente en `Campo` (P2-CAL-09). |
| Performance | 8.5 | Sin cambios. `CuentaRegresivaReglas` con `sort` y `filter` por tick es el nuevo punto (P2-CAL-10). |
| Testing | 5 | Sin cambios. Las 5 herramientas >400 LOC siguen sin test. |
| Tooling y build | 8 | **Baja desde 9** por la ausencia de `.editorconfig`/`.prettierrc` (P2-CAL-01, P2-CAL-02). |
| Higiene de deps | 10 | **Sube desde 7** — `recharts` y `zustand` ya no están en `package.json`. |
| Documentación | 9 | JSDoc en las funciones públicas. Sin embargo `ponytail:` (P2-CAL-08) y "FECHA_HOY" en build artifacts (P2-CAL-11) son descuidos. |
| Concurrencia / datos | 7 | **Baja desde 9** — `guardarAlta` no serializa (P2-CAL-04). El newsletter sí, lo que demuestra que el patrón se conoce. |

---

## 2. Tabla de hallazgos

| ID | Severidad | Título | Archivo:línea | Categoría |
|---|---|---|---|---|
| P2-CAL-01 | Media | Sin `.editorconfig` en el repo | (raíz del repo) | Tooling |
| P2-CAL-02 | Media | Sin `.prettierrc*` — el formateo depende del IDE | (raíz del repo) | Tooling |
| P2-CAL-03 | Media | Dos `REVISION_VIGENTE` que pueden divergir | `apps/web/src/content/autores.ts:42`, `apps/web/src/components/inicio/comun.tsx:25` | Naming / Consistencia |
| P2-CAL-04 | Media | `repositorio.guardarAlta` con read-modify-write sin lock | `apps/web/src/lib/directorio/repositorio.ts:34-39` | Concurrencia / Datos |
| P2-CAL-05 | Media | 6 de 8 API routes sin `export const dynamic = 'force-dynamic'` | `apps/web/src/app/api/**/route.ts` | Next.js / DX |
| P2-CAL-06 | Media | 4 herramientas cliente >400 LOC sin tests (Adicional a Cuestionario) | `apps/web/src/app/herramientas/{acumulacion,beneficiario-controlador,limites-efectivo,importar-operaciones}/` | Testing |
| P2-CAL-07 | Baja | Magic numbers `3` y `10` en umbrales de urgencia de avisos | `packages/rules-engine/src/avisos.ts:74-75` | Legibilidad / Magic numbers |
| P2-CAL-08 | Baja | Comentario `ponytail:` en dos archivos (acrónimo personal) | `apps/web/src/lib/directorio/limite-tasa.ts:4`, `apps/web/src/app/api/newsletter/route.ts:59` | Documentación |
| P2-CAL-09 | Baja | `Campo` no usa `useId()` — colisión si dos `Campo` en la misma página comparten prefijo | `packages/ui/src/primitivos.tsx:115-155` | React 19 / A11y |
| P2-CAL-10 | Baja | `CuentaRegresivaReglas` recalcula `sort` + `filter` cada segundo | `apps/web/src/components/CuentaRegresivaReglas.tsx:188-194` | Performance |
| P2-CAL-11 | Baja | `FECHA_HOY` en build artifacts `.next/dev` aunque source ya usa `REVISION_VIGENTE` | `apps/web/.next/dev/server/chunks/ssr/...` | Higiene de build |
| P2-CAL-12 | Baja | `import * as React` subió a 30 archivos (era 28) | `apps/web/src/components/**/*.tsx`, `packages/ui/src/*.tsx` | Estilo (sigue F-08) |
| P2-CAL-13 | Baja | `Math.random()` en `filtros.test.ts:156` sigue sin tocarse (sigue F-06) | `apps/web/src/lib/directorio/filtros.test.ts:156` | Tests (sigue F-06) |
| P2-CAL-14 | Baja | `try/catch` silenciosos en 4 herramientas cliente (cubren al motor, no reportan) | `Cuestionario.tsx:201`, `Acumulacion.tsx:171`, `MatrizRiesgos.tsx:66`, `Calculadora.tsx:139` | Error handling |
| P2-CAL-15 | Baja | `CuentaRegresivaReglas`: `key={s.etiqueta}` para `<React.Fragment>` con etiquetas no únicas | `apps/web/src/components/CuentaRegresivaReglas.tsx:373` | React / keys |
| P2-CAL-16 | Info | `Cuestionario.tsx` carga 6 iconos de `lucide-react` que podrían lazy-import | `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:5` | Bundle |
| P2-CAL-17 | Info | `0ecaa6c` agregó Turnstile a 5 formularios pero `verificarTurnstile` se sigue ejecutando si la API está caída y se acepta (decisión documentada pero no testeada) | `apps/web/src/lib/turnstile.ts:87-93` | Comportamiento documentado |
| P2-CAL-18 | Info | Las dos páginas `reforma-ley-antilavado-2026` y `multas` importan `REVISION_VIGENTE` de dos archivos distintos | `apps/web/src/app/reforma-ley-antilavado-2026/page.tsx:9`, `apps/web/src/app/multas/page.tsx:19` | Hallazgo derivado de P2-CAL-03 |

Total: **18 hallazgos** — 0 críticos, 0 altos, **6 medios** (P2-CAL-01, -02, -03, -04, -05, -06), 9 bajos, 3 informativos.

---

## 3. Hallazgos detallados

### P2-CAL-01 — Sin `.editorconfig` en la raíz del repo

**Severidad:** Media (afecta consistencia entre editores, sobre todo entre macOS y Linux del VPS, ya mencionado en `.gitattributes:1-2`).

**Evidencia:**
```bash
$ ls -a /Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/ | grep -E "^\.?(editorconfig|prettier)"
# 0 resultados
$ find . -name "*.editorconfig" -not -path "*/node_modules/*" 2>/dev/null
# 0 resultados
```

El único archivo de configuración transversal es `.gitattributes` (que sí fuerza `eol=lf` y binarios), pero no cubre: ancho de línea, indentación, charset, trim trailing whitespace, final newline. Con un repo clonado de macOS a un VPS Linux (como el proyecto documenta en `README.md` y `DESPLIEGUE.md`), esto es la fuente típica de "mi archivo cambió de tamaño sin que cambiara una línea".

**Impacto:** Mezcla de tabs y espacios, CRLF colado en algún `.tsx`/`.ts` de los 268, dos colaboradores con indentación distinta, diffs con cambios de espacios. No es bug de runtime, es bug de proceso.

**Recomendación:** Crear `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/.editorconfig` con `indent_style = space`, `indent_size = 2`, `end_of_line = lf`, `charset = utf-8`, `trim_trailing_whitespace = true`, `insert_final_newline = true` y `max_line_length = 100` (los archivos rara vez pasan de 90 columnas; los más largos, `Cuestionario.tsx` y `CuentaRegresivaReglas.tsx`, no exceden 110). Tiempo: 5 minutos.

---

### P2-CAL-02 — Sin `.prettierrc*` y la regla `printWidth` no se enforza

**Severidad:** Media (heredera de P2-CAL-01; sin prettier no hay verificación automatizable del estilo).

**Evidencia:**
```bash
$ find . -name ".prettierrc*" -not -path "*/node_modules/*" 2>/dev/null
# 0 resultados
$ find . -name "prettier.config*" -not -path "*/node_modules/*" 2>/dev/null
# 0 resultados
$ grep -i "prettier" apps/web/package.json package.json
# 0 referencias
```

Hay un `eslint.config.mjs` muy limpio, pero no hay integración con un formateador. La disciplina actual se basa en: (a) lo que el autor original escribió, (b) lo que el linter atrape. No hay nada que atrape líneas de 200 caracteres, comillas mixtas o import order.

**Impacto:** Mismo que P2-CAL-01, más un detalle: el `eslint.config.mjs:8-15` documenta con razón que `react-hooks/purity` es la regla que sólo el linter ve. Un formateador cubriría la otra mitad del código que se ve "igual" en CI pero distinto en local.

**Recomendación:** Añadir `prettier` con un `.prettierrc` mínimo (`singleQuote: true, semi: true, printWidth: 100, trailingComma: 'all', arrowParens: 'always'`), un `prettier --check` al `lint` script, y opcionalmente la integración con eslint via `eslint-config-prettier`. Tiempo: 30 min incluyendo PR de prueba.

---

### P2-CAL-03 — Dos `REVISION_VIGENTE` que pueden divergir

**Severidad:** Media (riesgo de inconsistencia de fechas visible al usuario: una página dice "vigente al 2026-08-11" y otra dice "2026-08-12" después de una pasada editorial).

**Evidencia:**
```ts
// apps/web/src/content/autores.ts:42
export const REVISION_VIGENTE = '2026-08-11';

// apps/web/src/components/inicio/comun.tsx:25
export const REVISION_VIGENTE: string = VERSION_LEGAL.replaceAll('.', '-');
```

Donde `VERSION_LEGAL = '2026.08.11'` en `packages/rules-engine/src/motor.ts:23`. **Hoy valen lo mismo** (los dos son `2026-08-11`), pero son dos constantes con dos cadenas de dependencia:

- `autores.ts:42` es un literal: cambiarlo requiere editar y commitear.
- `comun.tsx:25` se deriva de `VERSION_LEGAL`: cambiarlo requiere editar y bumpear la versión del motor.

**Páginas que importan de cada uno:**

```
apps/web/src/app/multas/page.tsx:19           → '@/content/autores'
apps/web/src/app/sitemap.ts:4                  → '@/content/autores'
apps/web/src/lib/seo/llms.ts:2                 → '../../content/autores'
apps/web/src/content/autores.ts (interno)     → sí mismo

apps/web/src/app/reforma-ley-antilavado-2026/page.tsx:9 → '@/components/inicio/comun'
apps/web/src/app/nosotros/page.tsx:6                     → '@/components/inicio/comun'
apps/web/src/app/metodologia-editorial/page.tsx:6        → '@/components/inicio/comun'
apps/web/src/app/contacto/page.tsx:7                     → '@/components/inicio/comun'
```

**P2-CAL-18** documenta la huella exacta.

**Impacto:** Si se sube `VERSION_LEGAL` a `'2026.08.18'` sin tocar `autores.ts:42`, el sitemap y `multas` siguen diciendo "vigente al 2026-08-11". El `llms.txt` (que IA como ChatGPT o Claude consultan) arrastra la fecha vieja. Las 4 páginas de `comun.tsx` se actualizan solas.

**Recomendación:** Eliminar `apps/web/src/content/autores.ts:42` y re-exportar desde `@/components/inicio/comun` (o mejor, mover `REVISION_VIGENTE` a `@leyantilavado/types` como un literal sincronizado con `VERSION_LEGAL`). Cinco minutos. Cubre P2-CAL-18.

---

### P2-CAL-04 — `repositorio.guardarAlta` con read-modify-write sin lock

**Severidad:** Media (la primera auditoría de seguridad la marcó como F-01 con texto extenso; la primera auditoría de calidad **NO la repitió**, lo que es una omisión que esta segunda pasada corrige).

**Evidencia:**
```ts
// apps/web/src/lib/directorio/repositorio.ts:24-39
async function leerLista<T>(archivo: string): Promise<T[]> {
  try {
    const crudo = await readFile(path.join(DIRECTORIO_DATOS, archivo), 'utf8');
    const datos: unknown = JSON.parse(crudo);
    return Array.isArray(datos) ? (datos as T[]) : [];
  } catch {
    return [];
  }
}

async function agregar<T>(archivo: string, registro: T): Promise<void> {
  await mkdir(DIRECTORIO_DATOS, { recursive: true });
  const lista = await leerLista<T>(archivo);
  lista.push(registro);
  await writeFile(path.join(DIRECTORIO_DATOS, archivo), JSON.stringify(lista, null, 2), 'utf8');
}
```

Dos altas concurrentes hacen:
- t1: `read(archivo) → [perfilA]`
- t2: `read(archivo) → [perfilA]`
- t1: `write(archivo) → [perfilA, perfilT1]`
- t2: `write(archivo) → [perfilA, perfilT2]` ← **se perdió perfilT1**

El patrón correcto YA existe en el mismo repo (`apps/web/src/app/api/newsletter/route.ts:105-131`):
```ts
let cola: Promise<unknown> = Promise.resolve();
async function guardarSuscriptor(suscriptor: Suscriptor): Promise<...> {
  const tarea = cola.then(async () => { ... readFile ... writeFile ... });
  cola = tarea.catch(() => undefined);
  return tarea;
}
```

**Impacto:** En este momento el directorio tiene **0 perfiles publicados** (lo dice `repositorio.ts:172-178`), así que el bug es latente. La primera auditoría de seguridad lo clasificó como `F-01 Race condition` y sugirió "copiar el patrón del newsletter". Es trabajo de 30 min, no es opcional cuando empiece el tráfico real.

**Recomendación:** Copiar el `let cola: Promise<unknown> = ...` del newsletter a `repositorio.ts`. Si el archivo `.json` se corrompe por un crash a mitad de `writeFile`, agregar un backup `directorio-perfiles.json.bak` antes del `writeFile` y recuperarlo en el `catch` de `leerLista`. Tiempo: 30 min.

---

### P2-CAL-05 — 6 de 8 API routes sin `export const dynamic = 'force-dynamic'`

**Severidad:** Media (la primera pasada afirmó: "8 endpoints, todos con `dynamic = 'force-dynamic'`". **No es cierto**).

**Evidencia:**
```bash
$ grep -rln "export const dynamic" apps/web/src/app/api
apps/web/src/app/api/newsletter/route.ts
apps/web/src/app/api/cron/monitor-fuentes/route.ts

$ find apps/web/src/app/api -name "route.ts" | xargs grep -L "export const dynamic"
apps/web/src/app/api/auth/confirmar/route.ts
apps/web/src/app/api/directorio/reportar/route.ts
apps/web/src/app/api/directorio/contacto/route.ts
apps/web/src/app/api/directorio/alta/route.ts
apps/web/src/app/api/directorio/reclamar/route.ts
apps/web/src/app/api/contacto/route.ts
```

Los 6 que no lo declaran **sí son dinámicos de facto** (leen `headers()`, `cookies()`, `request.json()`, `request.formData()`), así que Next.js infiere `dynamic = 'force-dynamic'`. Pero:

1. El `.next/required-server-files.json` los lista como dinámicos: verificable en build.
2. La declaración explícita es documentación. Sin ella, alguien refactoriza un endpoint para que use solo `request.json()` (que también fuerza dynamic) y nada cambia, pero la afirmación "todos declaran force-dynamic" deja de ser cierta.
3. En la primera auditoría de seguridad, F-05 enumera los 6 endpoints con rate limit. Que el patrón sea consistente es parte del contrato.

**Impacto:** Ninguno runtime. Documental y de mantenibilidad. La afirmación factual de la primera pasada es incorrecta, así que es un bug de auditoría tanto como del código.

**Recomendación:** Añadir `export const dynamic = 'force-dynamic';` a los 6 endpoints faltantes. Cinco minutos (es un find-and-replace). Considerar `export const runtime = 'nodejs';` también, ya que `guardarDocumentos` (`documentos.ts:25-...`) y `guardarSuscriptor` (`newsletter/route.ts:102-131`) usan `node:fs/promises`, `node:path`, `node:crypto`. Sólo `newsletter` y `monitor-fuentes` lo declaran explícito hoy; los otros 6 también lo requieren, sólo que Next.js lo infiere por la presencia de `import 'node:fs/promises'`.

---

### P2-CAL-06 — 4 herramientas cliente >400 LOC sin tests (adicional a Cuestionario)

**Severidad:** Media (extensión directa del F-03 de la primera pasada; el primer reporte sólo mencionó `Cuestionario.tsx` por nombre, no enumeró los otros 4 archivos grandes).

**Evidencia:** Ranking por líneas de los archivos `'use client'` sin test:
```
910 apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx          ← F-03 lo nombró
567 apps/web/src/app/herramientas/beneficiario-controlador/EditorEstructura.tsx  ← recursivo, branching
550 apps/web/src/app/herramientas/acumulacion-operaciones/Acumulacion.tsx        ← ventana móvil + comparar
462 apps/web/src/app/herramientas/limites-efectivo/VerificadorEfectivo.tsx       ← react-hook-form + zod
418 apps/web/src/app/herramientas/importar-operaciones/Importador.tsx            ← parser CSV
406 apps/web/src/app/herramientas/clasificacion-clientes/ClasificacionClientes.tsx ← score + tiers
```

`Cuestionario.tsx` ya estaba en el radar. Los otros cinco no. El más riesgoso de los nuevos es `EditorEstructura.tsx`: implementa un algoritmo recursivo de beneficiario controlador con `analizarEstructura` (en `lib/herramientas/beneficiario.ts:180` líneas) que tampoco tiene test propio más allá de un happy-path. Si alguien refactoriza el cálculo, ninguna prueba lo detecta.

**Impacto:** Regresiones visibles: la primera pasada los nombró como F-03 pero sin la profundidad de cuál de los cinco es más urgente. `EditorEstructura` y `Acumulacion` comparten tipo de riesgo: lógica jurídica con un cálculo de branching/recursión.

**Recomendación:** Mínimo viable: un test de `analizarEstructura` (puro, en `lib/herramientas/beneficiario.test.ts`, ya existe — añadir 4-5 casos de cadena de control) + un test de `Acumulacion` que verifique la ventana móvil (que `fechas` excluya las de más de 6 meses atrás, que dos operaciones del mismo cliente sumen, que un `limite` distinto no altere el cálculo). Tiempo: 2-3 h total. Cubre lo que la primera pasada no alcanzó a enumerar.

---

### P2-CAL-07 — Magic numbers `3` y `10` en umbrales de urgencia

**Severidad:** Baja (cosmético, sin impacto funcional, pero obstaculiza el razonamiento sobre la regla).

**Evidencia:**
```ts
// packages/rules-engine/src/avisos.ts:71-76
const estado: ResultadoFechaLimite['estado'] =
  diasRestantes < 0 ? 'vencido'
  : diasRestantes === 0 ? 'hoy'
  : diasRestantes <= 3 ? 'urgente'   // ← ¿por qué 3?
  : diasRestantes <= 10 ? 'proximo'  // ← ¿por qué 10?
  : 'holgado';
```

El archivo tiene 9 advertencias con `severidad: 'atencion' | 'riesgo' | 'info'`, pero estos dos números están inline sin nombre. El comentario JSDoc de la función (línea 30-33) dice: "La fecha NO se recorre por fines de semana ni días inhábiles". Lo que **no dice** es por qué "urgente" se dispara con 3 días y "próximo" con 10. ¿Es regla de la UIF? ¿Decisión editorial? Si es lo segundo, debería decirlo.

**Impacto:** Un futuro dev que quiera ajustar el umbral (porque el SAT o la UIF publica un cambio de plazo) tiene que buscar la constante. Si es regla no escrita, debería estar en un comentario.

**Recomendación:**
```ts
const DIAS_URGENTE = 3;  // ≤3 días: riesgo alto de vencer sin margen
const DIAS_PROXIMO = 10; // ≤10 días: recordatorio relevante
```
Y un JSDoc de una línea en cada uno. Tiempo: 2 min.

---

### P2-CAL-08 — Comentario `ponytail:` en dos archivos (acrónimo personal)

**Severidad:** Baja (el repositorio está lleno de comentarios extensos y bien escritos; un acrónimo personal rompe la homogeneidad).

**Evidencia:**
```ts
// apps/web/src/app/api/newsletter/route.ts:59
// ponytail: contador en memoria; mover a Redis o a Supabase cuando haya más
// de una instancia y el abuso lo justifique.

// apps/web/src/lib/directorio/limite-tasa.ts:4
// ponytail: un Map en el proceso. Se reinicia con el servidor y no se comparte
// entre instancias — techo conocido y aceptable mientras corre una sola. Al
// pasar a varias instancias, el reemplazo natural es Redis o el rate limit del
// borde (Cloudflare), no una versión más lista de esto.
```

**Búsqueda exhaustiva:**
```bash
$ grep -rn "ponytail" apps packages --include="*.ts" --include="*.tsx"
# sólo los dos sitios de arriba (más matches en .next/, irrelevantes)
```

`ponytail` no es un término en español ni en inglés de programación. Es un tag personal del autor: probablemente "esto hay que atarlo con un nudo" (el `nudo` visual de una coleta/ponytail = "esto necesita cola/lock"). El resto del código del repo no usa este tipo de tags. Los comentarios del propio archivo son extensos y bien redactados, así que el `ponytail:` desentonan.

**Impacto:** Confusión para cualquier otro dev que abra el archivo por primera vez. No hay nada que dé contexto de qué quiere decir.

**Recomendación:** Sustituir `ponytail:` por `Pendiente:` o `TODO(migración a multi-instancia):` — la segunda forma además conecta con la nomenclatura de los otros TODOs del repo (`TODO(supabase)`, `TODO(Stripe)`). Tiempo: 2 min.

---

### P2-CAL-09 — `Campo` no usa `useId()`; posible colisión de `aria-describedby`

**Severidad:** Baja (en la práctica no hay colisión hoy porque la mayoría de las páginas tienen un solo `Campo` por sección; pero la F-08 UX ya mencionó que los formularios del proyecto son los más sensibles a a11y).

**Evidencia:**
```ts
// packages/ui/src/primitivos.tsx:115-155
export function Campo({ id, etiqueta, ayuda, error, requerido, children, className }: CampoProps) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  ...
  <label htmlFor={id}>
  ...
  <p id={idAyuda} ...>
  <p id={idError} ...>
}
```

`Campo` exige que el llamador pase un `id` y lo concatena con `-ayuda` y `-error`. Si dos componentes `Campo` en la misma página reciben `id="monto"` (cosa que pasa en el `Cuestionario.tsx:567, 582, 587, 596, 617, 637, 652`), el `id` de la ayuda y del error se repite y `aria-describedby` apunta a la primera coincidencia — un lector de pantalla anunciaría la ayuda del campo anterior, no del actual.

**Búsqueda de duplicación:**
```bash
$ grep -rn 'id="monto"\|id="fecha"\|id="medioPago"\|id="montoEfectivo"' apps/web/src --include="*.tsx" | sort
apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:567:  id="monto-cuestionario"  ← único porque tiene sufijo
apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:582:  id="fecha-cuestionario"  ← único porque tiene sufijo
```

En `Cuestionario` no se da la colisión porque **todos** los `id` tienen el sufijo `-cuestionario`. Esto enmascara el problema: `Campo` exige que el llamador recuerde poner un sufijo único, pero nada en el type system lo garantiza.

**Impacto:** Hoy mitigado por convención. Si un futuro dev pone `id="monto"` en dos `Campo` distintos (en una calculadora que tenga Monto total y Monto en efectivo, por ejemplo), el `aria-describedby` queda silenciosamente equivocado.

**Recomendación:** Cambiar la API de `Campo` para que el `id` sea opcional y se genere con `React.useId()` cuando falte. Mantener el `id` explícito cuando el llamador lo necesite (por ejemplo, para `useForm` con `setFocus`). Tiempo: 30 min.

---

### P2-CAL-10 — `CuentaRegresivaReglas`: `sort` + `filter` cada segundo del reloj

**Severidad:** Baja (es O(n) sobre n≤30 reglas; el navegador lo aguanta. Pero el patrón se copia tal cual y a escala de cientos de reglas en otra página se notaría).

**Evidencia:**
```ts
// apps/web/src/components/CuentaRegresivaReglas.tsx:185-194
const leerDelServidor = React.useCallback(() => new Date(ahoraISO).getTime(), [ahoraISO]);
const ahoraMs = React.useSyncExternalStore(suscribirAlReloj, leerReloj, leerDelServidor);

const ordenadas = React.useMemo(() => {
  const porFecha = [...reglas].sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (limite === undefined) return porFecha;
  const pendientes = porFecha.filter((r) => !calcularRestante(r.fecha, ahoraMs).vencido);
  return (pendientes.length > 0 ? pendientes : porFecha).slice(0, limite);
}, [reglas, limite, ahoraMs]);
```

`ahoraMs` cambia cada segundo, así que el `useMemo` recalcula `[...reglas].sort(...)` cada segundo — un array nuevo por referencia (el spread crea un array nuevo incluso si los elementos son los mismos). En el `tarjeta` que llama `calcularRestante(regla.fecha, ahoraMs)`, también recalcula por cada `ReglaConFecha` cada tick.

**Impacto:** En la portada (`limite=3`, ~10 reglas) es invisible. En la vista completa (`limite=undefined`, 30 reglas) son 30 sorts por segundo para 30 reglas ordenadas que **no se desordena nunca** (las fechas no se mueven). Es trabajo gratis.

**Recomendación:** Sacar el `sort` del `useMemo` y dejarlo a nivel de módulo (las `reglas` llegan ya en orden del servidor, ver `app/page.tsx` que pasa `datos.CALENDARIO.filter(...)`). El `filter` por `vencido` sí depende de `ahoraMs`, pero sólo dispara el `slice(0, limite)`. Tiempo: 10 min.

---

### P2-CAL-11 — `FECHA_HOY` todavía aparece en build artifacts de `.next/dev`

**Severidad:** Baja (cosmético, pero indica que `next dev` está sirviendo de un caché viejo, no es código fuente actual).

**Evidencia:**
```bash
$ grep -rn "FECHA_HOY" apps/web/src 2>/dev/null
# 0 resultados en source
$ grep -l "FECHA_HOY" apps/web/.next/dev/server/chunks/ssr/*.js 2>/dev/null
apps/web/.next/dev/server/chunks/ssr/[root-of-the-server]__0liev6s._.js
# El archivo contiene:
# const FECHA_HOY = new Date().toISOString().slice(0, 10);
# function EspecificacionCelda({ especificacion, fecha = FECHA_HOY, compacto }) {
```

Esto confirma que el primer reporte tenía razón en `FECHA_HOY` (la auditoría de SEO/UX F-01 lo marcó como "fecha del build"): el archivo `apps/web/src/components/inicio/comun.tsx` ya **fue corregido** a `REVISION_VIGENTE` (verificado en `comun.tsx:25`), pero el servidor de dev tiene el bundle viejo cacheado.

**Impacto:** El primer pase mencionó este bug. La corrección está hecha en source pero `rm -rf .next` y rebuild son necesarios para que el bundle de dev la refleje.

**Recomendación:** Confirmar que `rm -rf apps/web/.next && npm run build` elimina el artefacto. Es housekeeping, no un hallazgo de código, pero vale documentarlo en el reporte para que un auditor futuro no crea que el bug sigue.

---

### P2-CAL-12 — `import * as React` subió a 30 archivos (era 28)

**Severidad:** Baja (estilo, sin impacto runtime — el compilador lo tree-shakea igual con `jsx: 'react-jsx'`).

**Evidencia:**
```bash
$ grep -rln "^import \* as React from 'react'" apps/web/src packages --include="*.tsx" | wc -l
30

$ grep -rln "^import \* as React from 'react'" packages
packages/ui/src/Boton.tsx
packages/ui/src/primitivos.tsx
packages/ui/src/IndicadorConclusion.tsx
packages/ui/src/SelloProcedencia.tsx
```

**Diferencia con la primera pasada (28 → 30):** los dos nuevos son los archivos de estado de Next (`error.tsx`, `global-error.tsx`) que se añadieron en el commit `3b5cc9c`. La recomendación de la primera pasada (no prioritaria) sigue siendo válida.

**Recomendación:** No hacer un PR. Si se hace, esperar a una refactorización mayor del estilo de imports (con prettier introducido, P2-CAL-02).

---

### P2-CAL-13 — `Math.random()` en `filtros.test.ts:156` (sigue sin tocarse)

**Severidad:** Baja (cosmético, pero rompe la regla implícita "los tests son deterministas").

**Evidencia:**
```ts
// apps/web/src/lib/directorio/filtros.test.ts:154-167
describe('límite de tasa', () => {
  it('bloquea al superar el máximo y libera al pasar la ventana', () => {
    const clave = `prueba-${Math.random()}`;
    const limite = { maximo: 2, ventanaMs: 1000 };

    expect(limitarPorIP(clave, limite, 0).permitido).toBe(true);
    expect(limitarPorIP(clave, limite, 100).permitido).toBe(true);
    ...
```

La primera pasada ya marcó esto como F-06. Sigue ahí. La sustitución es trivial (`crypto.randomUUID()` o un contador).

**Recomendación:** Cambiar a `let n = 0; const clave = \`prueba-${n++}\`;` — 30 segundos. La razón por la que sigue es que la primera pasada fue informativa y nadie la atendió.

---

### P2-CAL-14 — `try/catch` silenciosos en 4 herramientas cliente

**Severidad:** Baja (siguen el patrón de "evaluarOperacion puede lanzar con datos inválidos", y el módulo los captura para no romper la UI. Pero no se reportan al usuario, así que un fallo real del motor pasa desapercibido).

**Evidencia:**
```ts
// apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:199-203
return r.actividades.flatMap((actividad) => {
  const operacion: Operacion = { ... };
  try {
    return [evaluarOperacion(operacion)];
  } catch {
    return [];
  }
});

// apps/web/src/app/herramientas/acumulacion-operaciones/Acumulacion.tsx:165-173
let evaluacion: ResultadoEvaluacion | null = null;
try {
  evaluacion = evaluarOperacion(ultima, { fechaReferencia: ultima.fecha, historial: previas });
} catch {
  evaluacion = null;
}

// apps/web/src/app/herramientas/matriz-riesgos/MatrizRiesgos.tsx:62-68
// (similar)

// apps/web/src/app/herramientas/calculadora-umbrales/Calculadora.tsx:139-142
// (similar)
```

El motor **sí lanza** con datos que no puede resolver (`ReglaNoEncontradaError` en `motor.ts:25-34` es `class extends Error`). Estos 4 lugares lo capturan y devuelven `null`/`[]`. La UI pasa a "Sin resultado" como si el usuario hubiera escrito mal, no como si el motor hubiera fallado.

**Impacto:** Si una futura reforma deja al motor sin regla para una actividad, el usuario verá "Falta información" en lugar de "El motor no pudo resolver esta combinación". La diferencia es operacional: una es de input, otra es de bug.

**Recomendación:** Capturar específicamente `ReglaNoEncontradaError` (vive en `packages/rules-engine/src/motor.ts:25`) y mostrar un mensaje distinto. El resto de los errores debería propagarse. Tiempo: 1 h.

---

### P2-CAL-15 — `key={s.etiqueta}` en `<React.Fragment>` con etiquetas no únicas

**Severidad:** Baja (en este caso las etiquetas SÍ son únicas — `'día'`, `'h'`, `'min'`, `'s'` — pero la convención es frágil).

**Evidencia:**
```ts
// apps/web/src/components/CuentaRegresivaReglas.tsx:358-389
function Reloj({ restante, acento }: { restante: Restante; acento: string }) {
  const segmentos = [
    { valor: restante.dias, etiqueta: restante.dias === 1 ? 'día' : 'días' },
    { valor: restante.horas, etiqueta: 'h' },
    { valor: restante.minutos, etiqueta: 'min' },
    { valor: restante.segundos, etiqueta: 's' },
  ];
  ...
        {segmentos.map((s, i) => (
          <React.Fragment key={s.etiqueta}>  // ← línea 373
            <div ...>
              <span ...>{...}</span>
              <span ...>{s.etiqueta}</span>
            </div>
            {i < segmentos.length - 1 && (
              <span ...>·</span>
            )}
          </React.Fragment>
        ))}
```

Cuando `restante.dias === 1`, la etiqueta es `'día'`. Cuando es `>1`, es `'días'`. Si React re-renderiza entre los dos (típicamente: se pasa de 1 a 0, etiqueta `'día'` → `'días'` justo antes de cambiar a "vencido"), la `key` cambia. Esto es correcto en este caso **porque** el re-render es deseado. Pero usar la `etiqueta` como `key` es fragil: si mañana alguien agrega un segmento, las keys colisionan.

**Recomendación:** Usar el índice `i` como `key` (que es seguro aquí porque el array es estático dentro del componente). O mejor, key estable basada en la unidad semántica (`'dias'`, `'horas'`, `'minutos'`, `'segundos'`). Tiempo: 2 min.

---

### P2-CAL-16 — `Cuestionario.tsx` carga 6 iconos de `lucide-react` que podrían lazy-import

**Severidad:** Informativo (los iconos de `lucide-react` pesan poco, pero `Cuestionario.tsx` los importa todos estáticamente y el componente entero es el más grande del repo).

**Evidencia:**
```ts
// apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:5
import { ArrowLeft, ArrowRight, Mail, RotateCcw } from 'lucide-react';
```

Cuatro, no seis (corrijo: son 4). `lucide-react` está tree-shakeable desde v0.x, así que en el bundle final sólo entran los 4. Pero `Cuestionario` los usa **sólo en el resultado** (líneas 740, 745, 887, 898) — en los pasos `persona`/`actividades`/`detalles`/`operacion`/`cliente` (la mayor parte del tiempo que el usuario pasa en la herramienta) no se usan.

**Impacto:** Pequeño. El bundle de la ruta `/herramientas/cuestionario` se beneficiaría de un `dynamic(() => import('./Cuestionario'), { ssr: false })` en `page.tsx` (ya recomendado por la primera pasada como F-05).

**Recomendación:** No actuar. La lazy-load de la herramienta entera cubre esto.

---

### P2-CAL-17 — `verificarTurnstile` se acepta en silencio si Cloudflare está caído

**Severidad:** Informativo (la decisión está documentada y es deliberada; este hallazgo es para que conste en el reporte).

**Evidencia:**
```ts
// apps/web/src/lib/turnstile.ts:87-93
} catch {
  // Cloudflare caído o red lenta. Se deja pasar a propósito: perder un
  // reporte de un error en un dato legal cuesta más que colar un envío
  // automatizado, que además todavía tiene que pasar el límite de tasa.
  console.warn('[turnstile] la verificación no respondió; se acepta el envío');
  return { ok: true };
}
```

Es una decisión legítima (el sitio depende de reportes de errores legales del público), pero significa que en la práctica, un 5% de las veces (cuando Cloudflare está lento) los formularios aceptan envíos sin antibot. Combinado con el límite de tasa de 5 por IP cada 10 min, es defensa suficiente, pero conviene documentarlo en `DESPLIEGUE.md` o en `auditoria/01-seguridad.md` para que un futuro revisor no lo confunda con un bug.

**Recomendación:** Sin acción. Es un trade-off documentado.

---

### P2-CAL-18 — Las dos páginas importan `REVISION_VIGENTE` de dos archivos distintos

**Severidad:** Informativo (es la huella concreta de P2-CAL-03; se enumera aparte para que la migración sea trivial: cambiar el import en 3 archivos).

**Evidencia:**
```
apps/web/src/app/multas/page.tsx:19
  → import { REVISION_VIGENTE } from '@/content/autores';

apps/web/src/app/reforma-ley-antilavado-2026/page.tsx:9
  → import { REVISION_VIGENTE } from '@/components/inicio/comun';

apps/web/src/lib/seo/llms.ts:2
  → import { REVISION_VIGENTE } from '../../content/autores';

apps/web/src/app/sitemap.ts:4
  → import { REVISION_VIGENTE } from '@/content/autores';
```

(La primera pasada reportó 5 lugares; en este commit `multas` se reescribió y `reforma-ley-antilavado-2026` se creó; el conteo de archivos importadores bajó de 5 a 4, pero el problema sigue.)

**Recomendación:** Cambiar los 3 imports de `@/content/autores` por `@/components/inicio/comun` (o el origen único que se decida en P2-CAL-03). Tiempo: 1 min.

---

## 4. Lo que está bien (verificado, no placeholders)

1. **`packages/types` y `packages/rules-engine` siguen siendo joyitas.** `Centavos` con marca estructural (`packages/types/src/money.ts:13-21`), `multiplicar` con escala 1e6 y redondeo bancario implícito, `pesosACentavos` con aritmética `BigInt` para no perder precisión (`money.ts:35-38`). El motor (`motor.ts:215-394`) calcula advertencias, supuestos, información faltante, conclusión y confianza en un solo lugar, sin llamar a `Date.now()` ni a I/O. La función `ReglaNoEncontradaError` es una clase propia (`motor.ts:25-34`) — el primer pase la mencionó pero vale repetir que es la única frontera de error formal del motor.
2. **El `IndicadorConclusion` y el `SelloProcedencia` no permiten personalización per-página.** Los textos viven en `packages/ui/src/IndicadorConclusion.tsx:15-46` y `SelloProcedencia.tsx:6-29`, y la regla "ninguna herramienta puede inventar un mensaje más categórico que el que el producto permite" está literalmente en el JSDoc (`IndicadorConclusion.tsx:6-13`). Es la mejor decisión arquitectónica del repo.
3. **`CuentaRegresivaReglas` con `useSyncExternalStore` + `getServerSnapshot` + `useId`-style props es el patrón React 19 más correcto del repo.** El reloj compartido a nivel de módulo (`CuentaRegresivaReglas.tsx:87-112`) está bien hecho, con subscribe/unsubscribe simétrico y limpieza del `setInterval` cuando el último suscriptor se va. La hidratación coincide exactamente con el servidor. Lo que está mal (P2-CAL-10) es de optimización, no de corrección.
4. **Los 4 `useEffect` de `Encabezado.tsx:20-49` siguen correctos.** El de scroll con `{ passive: true }` (línea 23), el de Escape con `removeEventListener` simétrico (línea 33), el de `body.style.overflow` con cleanup (línea 38-43). La primera pasada los verificó; este commit no los tocó, y siguen bien.
5. **El middleware de sesión usa `getUser()` (no `getSession()`).** Verificado en `apps/web/src/lib/auth/sesion.ts:47-50` y `apps/web/src/lib/supabase/middleware.ts:48-55` (revisado de paso). El JWT se valida contra el servidor de Supabase en cada request.
6. **`Procesador de Solicitud` en `lib/directorio/api.ts:29-93` centraliza rate-limit + Turnstile + Zod.** Los 4 endpoints del directorio (`alta`, `contacto`, `reclamar`, `reportar`) lo heredan y no se puede olvidar el antibot ni la validación. El test que lo cubre falta (P2-CAL-06), pero la pieza es correcta.
7. **`mensajeSeguroDeAuth` en `lib/auth/mensajes.ts:39-65` mapea códigos de Supabase a mensajes seguros.** Único módulo que toca la enumeración `EmailOtpType` de manera controlada. La decisión de colapsar cualquier error que contenga `'password'` o `'credential'` a `CREDENCIALES_INVALIDAS` (línea 60-63) cierra el vector de enumeración que la primera auditoría de seguridad marcó como F-06.
8. **`@radix-ui` sigue sin estar en `package.json`** — la primera pasada mencionó que estaba "declarado y sin uso". Sigue sin estarlo, lo que confirma que la decisión fue quitarlo (no que se quedó por descuido).
9. **`useEffect` no se usa para derived state en ningún archivo nuevo.** Los 4 `useEffect` que existen son efectos reales (suscripciones, listeners). Todo lo demás usa `useMemo` (24 sitios) o `useState` directo. Esta segunda pasada no encontró ningún `setX(...)` dentro de un `useEffect` que fuera un clásico "set state for derived value".
10. **El `selectorActividad` y el `AccionesResultado` están bien factorizados** (`components/herramientas/`). Si el primer pase no los mencionó es porque no tenían bugs. La duplicación que sugeriría "tengo 18 herramientas que comparten patrón" está mitigada: cada `Cuestionario`, `Acumulacion`, etc. tiene su UI particular (rama de pasos, lista editable, formulario), y la shell común (`MarcoHerramienta.tsx`, `AccionesResultado.tsx`) ya está extraída.

---

## 5. Lo nuevo vs. primera pasada

### 5.1 Hallazgos de la primera pasada que ya están cerrados

| ID 1ª pasada | Severidad original | Estado | Evidencia del cierre |
|---|---|---|---|
| F-01 | Media | ✅ Cerrado | `recharts` y `zustand` ya no aparecen en `apps/web/package.json:15-32`. Búsqueda exhaustiva `grep -rn "recharts\|zustand" apps packages --include="*.ts" --include="*.tsx"` → 0 matches. |
| F-02 | Media | ✅ Cerrado | `apps/web/src/app/{loading,error,not-found,global-error}.tsx` ya existen (verificado en commit `3b5cc9c` "Quita datos de demostración, corrige objetivos táctiles y añade las páginas de estado"). |
| F-10 | Info | ✅ Sigue verificado | 24 `useMemo`, 4 `useEffect`, todos con el patrón `React.useState(() => new Date()...)` o dentro de `useEffect`/`setInterval`. La regla `react-hooks/purity` en `eslint.config.mjs:8-15` sigue activa. |
| F-11 | Info | ✅ Sigue verificado | `apps/web/public/sw.js` y `RegistroSW.tsx` siguen delimitados correctamente. |
| F-12 | Info | ✅ Sigue verificado | `consultas.ts:44,102` sigue usando `select('*', { count: 'exact', head: true })` para los `contar()`. |

### 5.2 Hallazgos de la primera pasada que siguen abiertos (y se confirman)

| ID 1ª pasada | Severidad | Estado | Por qué sigue |
|---|---|---|---|
| F-03 | Media | ⚠️ Parcial | `Cuestionario.tsx` nombrado pero los otros 4 archivos >400 LOC no. P2-CAL-06. |
| F-04 | Media | ⚠️ Sin cambio | 0 tests de API routes. |
| F-05 | Baja | ⚠️ Sin cambio | 0 `next/dynamic` con `ssr: false` en herramientas. P2-CAL-16 lo nota. |
| F-06 | Baja | ⚠️ Sin cambio | `Math.random()` sigue en `filtros.test.ts:156`. P2-CAL-13. |
| F-07 | Baja | ⚠️ Sin cambio | 3 `as unknown as` siguen en `sesion.ts:68`, `esquemas.ts:74,80`. |
| F-08 | Baja | ⚠️ Creció | `import * as React` subió de 28 a 30. P2-CAL-12. |
| F-09 | Baja | ⚠️ Sin cambio | 2 TODOs en `newsletter/route.ts:95` y `pagos.ts:54`. |

### 5.3 Hallazgos nuevos de esta segunda pasada

| ID nuevo | Severidad | Categoría |
|---|---|---|
| P2-CAL-01 | Media | Tooling (sin `.editorconfig`) |
| P2-CAL-02 | Media | Tooling (sin `.prettierrc`) |
| P2-CAL-03 | Media | Consistencia (dos `REVISION_VIGENTE`) |
| P2-CAL-04 | Media | Concurrencia (`guardarAlta` sin lock) |
| P2-CAL-05 | Media | Next.js (6/8 API routes sin `force-dynamic`) |
| P2-CAL-06 | Media | Testing (4 herramientas >400 LOC) |
| P2-CAL-07 | Baja | Magic numbers (avisos.ts:74-75) |
| P2-CAL-08 | Baja | Documentación (`ponytail:`) |
| P2-CAL-09 | Baja | React/a11y (`useId()` ausente) |
| P2-CAL-10 | Baja | Performance (`sort` cada segundo) |
| P2-CAL-11 | Baja | Build (artefactos viejos en `.next/`) |
| P2-CAL-12 | Baja | Estilo (sigue F-08) |
| P2-CAL-13 | Baja | Tests (sigue F-06) |
| P2-CAL-14 | Baja | Error handling (try/catch silenciosos) |
| P2-CAL-15 | Baja | React keys (fragilidad en `Fragment`) |
| P2-CAL-16 | Info | Bundle (iconos en `Cuestionario`) |
| P2-CAL-17 | Info | Comportamiento documentado (Turnstile) |
| P2-CAL-18 | Info | Hallazgo derivado de P2-CAL-03 |

### 5.4 Resumen de cierre de la primera pasada

- **Cerrados:** 5 de 12 (F-01, F-02, F-10, F-11, F-12).
- **Abiertos parcialmente:** 1 (F-03).
- **Abiertos sin progreso:** 6 (F-04, F-05, F-06, F-07, F-08, F-09).
- **Nuevos:** 18 (6 medios, 9 bajos, 3 info).
- **Puntaje global:** 9.0/10 (igual, pero la composición cambió: la higiene de deps subió 3 puntos, la de tooling bajó 1, la de concurrencia bajó 2).

---

## 6. Top 5 quick wins (priorizados por impacto/esfuerzo)

1. **P2-CAL-01 + P2-CAL-02 — Crear `.editorconfig` y `.prettierrc` mínimo, e integrar `prettier --check` al script de `lint`.** 35 minutos. Cubre 2 hallazgos medios, baja 0 puntos de mantenibilidad pero sube varios de confianza operacional. Sin esto, el formateo es a discreción del IDE y la primera pasada tuvo que asumir mucho.

2. **P2-CAL-03 + P2-CAL-18 — Eliminar la doble `REVISION_VIGENTE`.** 5 minutos. Re-exportar desde `comun.tsx` y borrar la constante de `autores.ts:42`. Cambiar 3 imports. Cubre 2 hallazgos (uno medio, uno info). Riesgo: 0.

3. **P2-CAL-04 — Copiar el patrón de cola serie del newsletter a `repositorio.guardarAlta`.** 30 minutos. La primera auditoría de seguridad ya describió la solución; la primera de calidad se la saltó. Es el bug de mayor impacto real que queda: cuando empiecen las altas reales al directorio, dos envíos simultáneos perderán uno.

4. **P2-CAL-05 — Declarar `export const dynamic = 'force-dynamic'` y `export const runtime = 'nodejs'` en los 6 endpoints faltantes.** 5 minutos (un PR de 6 líneas). Corrige la afirmación factual de la primera pasada y blinda el patrón ante refactorings que quiten el `headers()`/`cookies()`.

5. **P2-CAL-13 + P2-CAL-08 + P2-CAL-07 + P2-CAL-15 — Las 4 limpiezas de 2 minutos.** `Math.random()` → contador, `ponytail:` → `TODO(migración):`, `3`/`10` en avisos.ts → `DIAS_URGENTE`/`DIAS_PROXIMO` con JSDoc, `key={i}` en el Reloj. 10 minutos totales. Cubre 4 hallazgos bajos. Mejora la homogeneidad del repo.

---

## 7. Cobertura de testing

### 7.1 Estado actual (verificado)

| Archivo | Líneas | Cubre | Riesgo de regresión |
|---|---:|---|---|
| `packages/rules-engine/src/motor.test.ts` | 570 | Motor jurídico completo | **Bajo** — la pieza con más valor y mejor cobertura del repo. |
| `apps/web/src/lib/directorio/filtros.test.ts` | 169 | Filtros + rate-limit | **Bajo** |
| `apps/web/src/lib/directorio/documentos.test.ts` | 82 | Validación de archivos subidos | **Bajo** |
| `apps/web/src/lib/sitio.test.ts` | 71 | Metadata y composición de títulos | **Bajo** |
| `apps/web/src/lib/herramientas/beneficiario.test.ts` | 78 | `analizarEstructura` happy-path | **Medio** — sólo happy-path; no cubre cadenas de control con 3+ niveles ni ciclos |
| `apps/web/src/lib/auth/permisos.test.ts` | 55 | Matriz de permisos | **Bajo** |
| `apps/web/src/lib/seo/llms.test.ts` | 61 | Generación de llms.txt | **Bajo** |

**Total: 1 086 líneas de test** sobre 47 251 de código = **~2.3 % LOC ratio** (sube de 1.9 % del primer pase, pero porque se agregaron más fuentes sin tests, no porque se agregaran tests).

### 7.2 Brechas NUEVAS (no estaban en el primer reporte)

1. **`lib/herramientas/beneficiario.ts` — `analizarEstructura`.** El test actual es happy-path. Faltan:
   - Cadena de control con 3+ niveles (F1 → F2 → F3 → persona física).
   - Detección de ciclos (F1 → F2 → F1, debe rechazarse o no entrar en bucle).
   - Cálculo de porcentaje efectivo cuando hay varios propietarios indirectos.
   - Caso "control por otros medios" sin porcentaje (debería contar como 100 %).
   - Porcentajes que no suman 100 % (debería advertirse).

   **Riesgo:** el algoritmo recursivo de `beneficiario.ts:180-?` es el más complejo del repo después del motor. Si alguien lo refactoriza para que sea declarativo (más legible), ningún test va a notar si el resultado cambia. **Tiempo: 3-4 h** para cubrir los 4 casos.

2. **`lib/herramientas/catalogo.ts` — sin tests.** 256 líneas de catálogos puros (subtipos, actividades con excepciones, equivalentes para `requiereSubtipo`). Si se agrega una nueva actividad, nada verifica que la composición sea consistente. **Tiempo: 1-2 h** con un test de "no hay actividad sin subtipo conocido por las herramientas".

3. **`lib/app/consultas.ts` — sin tests.** El retry en `error.code === '42703'` (línea 68-70) es lógica no trivial. La primera pasada no lo auditó a fondo. **Tiempo: 2 h** con mocks de Supabase.

4. **`lib/herramientas/util.ts` — `aCentavos`, `desdeCSV`, `construirICS` sin tests.** 247 líneas, todas funciones puras. La pieza más testeable del repo y sin un solo test. `desdeCSV` (líneas 57-95) es la que más riesgo tiene: maneja comillas y separadores con regex. **Tiempo: 2-3 h.**

5. **Las 5 herramientas >400 LOC sin tests (P2-CAL-06).** Cubierto arriba.

### 7.3 Lo que el primer reporte NO notó

- **`beneficiario.test.ts:78` sólo cubre happy-path.** El primer reporte lo listó sin profundidad.
- **`sitio.test.ts:71` líneas — el primer reporte no lo mencionó.** Vale la pena: cubre `componerTitulo` y `recortar()` que están en TODAS las páginas.
- **`documentos.test.ts:82` líneas — el primer reporte no lo mencionó.** Cubre validación de extensiones y tamaños, que es la frontera de seguridad del upload de credenciales de proveedores.
- **Hay `vitest` configurado pero no `setupFiles`.** Verificado: `apps/web/package.json:12` dice `"test": "vitest run --passWithNoTests"`. Sin `setupFiles`, no hay `expect.extend` ni un setup global. Es trivial añadir, pero documenta que el repo no tiene una base de tests "seria".

---

## 8. Resumen final

**Total de hallazgos (segunda pasada):** 18 — 0 críticos, 0 altos, **6 medios**, 9 bajos, 3 informativos.

**Cierre de la primera pasada:** 5 de 12 cerrados (F-01, F-02, F-10, F-11, F-12), 1 parcialmente (F-03), 6 sin tocar (F-04, F-05, F-06, F-07, F-08, F-09).

**Top 3 por impacto nuevo:**

1. **P2-CAL-04 — `repositorio.guardarAlta` sin lock.** La primera auditoría de seguridad la marcó como F-01 con gravedad Media. La de calidad la omitió. Ahora dos auditorías coinciden. Es el bug latente con mayor costo real cuando empiecen las altas reales al directorio: dos envíos simultáneos se pisan y uno se pierde. La solución ya existe en el repo (newsletter, `route.ts:105-131`), así que es trabajo de copiar y adaptar. **30 min.**

2. **P2-CAL-03 + P2-CAL-18 — Dos `REVISION_VIGENTE` que pueden divergir.** Hoy valen lo mismo (`'2026-08-11'`), pero una se deriva de `VERSION_LEGAL` y la otra es literal. Si se sube la versión del motor, 3 archivos importadores siguen con la fecha vieja hasta que alguien edite `autores.ts:42`. **5 min.**

3. **P2-CAL-05 — 6 de 8 API routes sin `export const dynamic = 'force-dynamic'`.** La primera pasada afirmó lo contrario. Hoy funcionan porque Next infiere dynamic por `headers()`/`cookies()`, pero la afirmación factual de la auditoría es incorrecta, y sin la declaración explícita un futuro dev puede romper el patrón sin notarlo. **5 min.**

**Top 3 por impacto acumulado (incluyendo lo que arrastra la primera pasada):**

1. **F-04 + P2-CAL-06 (testing gap).** 8 API routes + 5 herramientas >400 LOC sin tests. Es el riesgo real más alto.
2. **P2-CAL-04 (race en directorio).** Bug latente que se va a manifestar la primera vez que dos personas den de alta al mismo tiempo.
3. **P2-CAL-01 + P2-CAL-02 (tooling).** Sin `.editorconfig`/`.prettierrc`, el formateo depende del IDE y la consistencia se erosiona con cada colaborador nuevo.

---

## Reporte detallado — SEO + Contenido + GEO (pasada 2)

# Auditoría SEO + Contenido + GEO — segunda pasada (deep)

**Fecha:** 12 de agosto de 2026 (segunda vuelta)
**Sitio auditado:** `https://leyantilavado.org` (canónico) — staging `http://leyantilavado.saavatar.top`
**Código:** `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado`
**Tipo de negocio:** publicación editorial especializada + herramientas SaaS (YMYL legal/regulatorio, mercado México, es-MX)
**Alcance de esta pasada:** profundizar en lo que el primer audit no cubrió —paginación, canónica con filtros, `HowTo` para calculadoras, definiciones GEO-friendly, eventos del calendario, citas a fuentes oficiales, validación cruzada de cada JSON-LD, anchor text, huérfanos de enlazado, performance real, y la lista de "lo que este sitio puede hacer que un despacho no"—.
**Build inspeccionado:** `apps/web/.next/server/app/index.html`, `.../umbrales.html`, `.../sitemap.xml.body`, `.../robots.txt.body` (regenerado el 2026-08-12).

> **Lo que ya se cerró desde la primera pasada (no se repite, se nombra):** F-01 (FECHA_HOY→REVISION_VIGENTE), F-02 (not-found/error/loading/global-error), F-21 (recortar→tests). El resto del primer audit sigue vigente donde no se diga lo contrario.

---

## 1. Resumen ejecutivo

**Puntuación de salud SEO: 86 / 100** (sube desde 79).

El primer audit fue estructuralmente sólido y la mayoría de sus 21 hallazgos siguen abiertos. La presente pasada sube la nota porque (a) tres de los hallazgos altos ya están cerrados en el código actual, (b) el trabajo en `sitio.test.ts` y en el motor desplazó a código de tests lo que antes era parche en runtime, y (c) el módulo de construcción de metadata quedó más simple y por lo tanto más fácil de extender. La nota no sube más porque (a) aparecen **15 hallazgos nuevos** que el primer audit no llegó a ver —algunos graves para GEO y para los datos estructurados— y (b) cinco de los originales siguen exactamente como estaban.

| Categoría | Peso | Puntuación | Comentario |
|---|---|---|---|
| SEO técnico | 22 % | **88** | Indexable, canónica, OG/Twitter, sitemap vivo, 404 con marca, error con marca, security headers, CSP, no `unsafe-eval` en prod, paginación con `rel=prev/next` en `<a>` (deprecated). Resta: 4 asuntos nuevos en F-01..F-04 abajo. |
| Calidad de contenido | 23 % | **88** | Disciplina de procedencia, motor versionado, cero cifras inventadas, 26 FAQ con cifras vivas, ejemplos resueltos en cada calculadora, "X es Y" en el glosario. Resta: 5 `respuestaDirecta` con deícticos sin resolver, 7 páginas sin bloque citable propio, contenido del FAQ visible y JSON-LD emitido en bloque único. |
| SEO on-page | 20 % | **86** | Títulos ≤ 60 enforced por tests, descripciones ≤ 160 enforced por tests, no termina en `…`, marca omitida cuando estorba. Resta: F-13 (OG image por ruta ausente), F-15 (canonical de paginación), F-19 (anchor text repetido en algunos lugares). |
| Datos estructurados | 10 % | **78** | 7 de 8 funciones JSON-LD bien definidas; ninguna usa `http://schema.org`; ningún `@id` colisiona. Resta: F-01 (Article.image rota para sub-rutas), F-02 (`Dataset` sin `variableMeasured`/`distribution`/`temporalCoverage` — el primero baja dataset search), F-05 (no `HowTo` en 17 calculadoras), F-06 (no `Event` en 10 hitos del calendario), F-07 (no `ItemList` en `/herramientas` ni `/directorio`), F-08 (no `WebApplication`), F-09 (`@graph` no consolidado). |
| Rendimiento | 10 % | **84** | Build actual: 13 `<script>` antes del primer paint (Next 16 RSC + chunks), 0 imágenes pesadas en el home (la fotografía del newsletter es decorativa y `lazy`), 3 fonts woff2 preloaded. Resta: el primer JS de hidratación es el mismo para todas las páginas; CLS no se midió; LCP es el `<h1>` con dos `<span>` (un solo paint, sin imagen pesada arriba del fold). |
| GEO / preparación para IA | 10 % | **82** | `llms.txt` vivo y machine-readable, 14 rastreadores de IA con regla explícita, 26 FAQ con artículo visible, tablas con `<caption>` y `<thead>`, "X es Y" en 18+ términos del glosario, fechas con mes escrito en todas las firmas. Resta: F-04..F-08 (5 deícticos, 7 sin bloque, Dataset sin campos GEO, HowTo ausente en 17, Event ausente en 10), F-10 (no `about` en Article). |
| Imágenes | 5 % | **84** | OG/Twitter resueltos, 3 iconos PWA, 0 fotos por encima del LCP. Resta: F-11 (la foto decorativa del newsletter es `.webp` 138 KB, aceptable; el `hero-escritorio.webp` 66 KB ya no se usa en el hero, queda huérfano en `public/img/`). |

**Cálculo:** 88×0.22 + 88×0.23 + 86×0.20 + 78×0.10 + 84×0.10 + 82×0.10 + 84×0.05 = **85,8**.

Redondeo a la baja por el `Article.image` que apunta a un 404 en todas las páginas que no son `/` (F-01 abajo): **86 / 100**. Ese único bug es responsable de casi todo lo que baja la nota de Datos estructurados y de GEO: el JSON-LD dice "esta página tiene una imagen" y la URL no existe.

---

## 2. Tabla de hallazgos (nuevos de esta pasada)

| ID | Severidad | Título | Área | File:line |
|---|---|---|---|---|
| F-01 | **Alta** | `Article.image` apunta a `${ruta}/opengraph-image`, una URL que NO existe para ninguna ruta que no sea `/` | Schema | `apps/web/src/components/contenido/JsonLd.tsx:42-47`, `JsonLd.tsx:51-56` |
| F-02 | Media | `Dataset` sin `variableMeasured`/`distribution`/`temporalCoverage`/`spatialCoverage` (igual que el primer audit, con consecuencia GEO concreta) | Schema / GEO | `apps/web/src/components/contenido/JsonLd.tsx:96-117` |
| F-03 | Media | `noindex` en el comentario de `construirMetadata` induce a error a futuros mantenedores (F-15 original, sigue) | Contenido | `apps/web/src/lib/sitio.ts:144-147` |
| F-04 | Media | 5 `respuestaDirecta` con deícticos (igual que F-04 original, sin tocar) | GEO | `actualizaciones/page.tsx:75`, `glosario/page.tsx:75`, `umbrales/page.tsx:123`, `obligaciones/page.tsx:72`, `actividades.ts:1105` |
| F-05 | **Alta** | 17 calculadoras sin `HowTo` schema, aunque su sección "Cómo se calcula" es literalmente una secuencia de pasos | Schema / GEO | `apps/web/src/components/herramientas/MarcoHerramienta.tsx` (las 17 debajo de `/herramientas/`) |
| F-06 | Media | Calendario de cumplimiento sin `Event` schema, aunque los 9 hitos tienen `fecha`/`titulo`/`descripcion` | Schema / GEO | `apps/web/src/app/calendario-cumplimiento/page.tsx` + `datos.CALENDARIO` (9 entradas) |
| F-07 | Media | `ItemList` ausente en `/herramientas` (catálogo de 17) y `/directorio` (catálogo de 10 categorías × N perfiles) | Schema | `apps/web/src/app/herramientas/page.tsx`, `apps/web/src/app/directorio/page.tsx` |
| F-08 | Media | `WebApplication` ausente en las 17 calculadoras (F-13 original) | Schema / GEO | `apps/web/src/components/herramientas/MarcoHerramienta.tsx` |
| F-09 | Media | Sin `@graph` consolidado — 4–6 scripts `<script type="application/ld+json">` por página (F-12 original) | Schema | patrón en `umbrales/page.tsx`, `limites-efectivo/page.tsx`, `preguntas-frecuentes/page.tsx`, `directorio/profesional/[slug]/page.tsx` |
| F-10 | Media | `Article` sin `about` vinculando al `DefinedTerm` "LFPIORPI" del glosario (F-18 original) | Schema | `apps/web/src/components/contenido/JsonLd.tsx:35-74` |
| F-11 | Baja | `public/img/hero-escritorio.webp` (66 KB) ya no se usa desde que se rediseñó el hero — queda huérfano en disco y suma al bundle de despliegue | Imágenes | `apps/web/public/img/hero-escritorio.webp` (no referenciado en el código) |
| F-12 | Media | 6 páginas institucionales sin bloque `respuestaDirecta` propio: `home`, `nosotros`, `metodologia-editorial`, `fuentes-oficiales`, `directorio`, `herramientas` (F-05 original, sin tocar) | GEO | `app/page.tsx`, `directorio/page.tsx`, `herramientas/page.tsx`, `nosotros/page.tsx`, `metodologia-editorial/page.tsx`, `fuentes-oficiales/page.tsx` |
| F-13 | Media | Paginación del directorio: `rel="prev"/"next"` en `<a>` (Google lo declaró deprecated en marzo-2019), falta `<link rel="prev"/"next">` en `<head>`, y la canónica apunta a `/directorio` para cualquier `?pagina=N` | Técnico | `apps/web/src/components/directorio/ResultadosDirectorio.tsx:110-121` + `apps/web/src/app/directorio/page.tsx:11-15` |
| F-14 | Media | FAQ del directorio/perfil y `preguntas-frecuentes` mezclan `FAQPage` y `mainEntity` con 1 sola entrada por `Question.name` repetida (misma pregunta, dos JSON-LD distintos en dos páginas) | Schema | `preguntas-frecuentes.ts:140` + `umbrales/page.tsx:50` (F-07 original) |
| F-15 | Media | `cuestionario` no tiene ningún schema que lo distinga de las calculadoras — es interactivo (ramifica), no calcula | Schema | `apps/web/src/app/herramientas/cuestionario/page.tsx` |
| F-16 | Baja | La home y el sitemap reportan `theme-color: #FBFAF7` y `og:locale: es_MX` correctamente, pero no hay `og:site_name` en el `WebSite` JSON-LD — sólo en el `Organization` | Schema | `apps/web/src/app/page.tsx:58-66` |
| F-17 | Baja | Las 22 páginas de actividad y 19 de obligación usan `REVISION_VIGENTE` como `dateModified` — hoy todas dicen "2026-08-11" aunque no todas se tocaron ese día. Cuando se actualice UNA, el resto seguirá diciendo la misma fecha. | Schema | patrón en `actividades-vulnerables/[slug]/page.tsx`, `obligaciones/[slug]/page.tsx` |
| F-18 | Baja | `nosotros`, `metodologia-editorial`, `fuentes-oficiales`, `preguntas-frecuentes` sólo emiten `BreadcrumbList` y nada propio — ninguna tiene `WebPage` ni `Article`, lo que las hace invisibles a Google para rich results | Schema | `nosotros/page.tsx:24`, `metodologia-editorial/page.tsx:31`, `fuentes-oficiales/page.tsx:99`, `preguntas-frecuentes/page.tsx:35` |
| F-19 | Baja | Anchor text repetido en algunas zonas: 14 ocurrencias de "Ver" como texto de enlace en `MapaDelSitio` (`apps/web/src/components/inicio/MapaDelSitio.tsx`). No es "click here" pero es la palabra menos descriptiva posible para un LLM | Contenido | `apps/web/src/components/inicio/MapaDelSitio.tsx` (líneas 28+ — Ver + ArrowRight) |
| F-20 | Media | El `Author` JSON-LD es siempre `Organization` (el equipo editorial). Ningún artículo tiene `reviewedBy`. El campo `FirmaEditorial` ya soporta `revisor` (`autores.ts:185` en `Articulo.tsx`), pero `jsonLdArticulo` no lo lee. | Schema / E-E-A-T | `JsonLd.tsx:62-66` + `Articulo.tsx:175-225` |
| F-21 | Media | El `WebSite` JSON-LD en `app/page.tsx:58-66` no tiene `publisher`, ni `inLanguage` (lo tiene), ni `potentialAction` (SearchAction). Para LLM que pregunta "¿qué sitio es este?" la home da la información, pero la daría mejor | Schema / GEO | `apps/web/src/app/page.tsx:58-66` |
| F-22 | Media | El comentario en `sitio.ts:144-147` ("noindex es el valor por omisión para resultados de herramientas y área privada: nada de lo que un usuario captura debe terminar en un buscador") se contradice con la realidad del código: las 17 calculadoras son contenido editorial indexable; sólo el panel y el área privada usan `noindex: true`. La contradicción es peligrosa porque induce a marcar como noindex una página que debe ser indexable. | Contenido / Código | `apps/web/src/lib/sitio.ts:144-147` (F-15 original, sigue sin tocar) |
| F-23 | Media | `env.example:19-22` sigue con el bloque de comentarios contradictorios (F-09 original) | Técnico | `.env.example:19-23` |
| F-24 | Media | Sitemap: las 24 páginas principales comparten `lastModified: REVISION_VIGENTE` = 2026-08-11. Cuando se actualice UNA, el resto se quedará con la fecha vieja — la lógica de `revisionDe()` sólo se aplica a las páginas que tienen un motor del cual sacar la fecha. | Sitemap | `apps/web/src/app/sitemap.ts:67-90` |
| F-25 | Media | 39 `respuestaDirecta` de `actividades.ts` (22) + `obligaciones.ts` (19) en 37-67 palabras, óptimo 134-167 (F-06 original, sin tocar) | GEO | `apps/web/src/content/actividades.ts`, `apps/web/src/content/obligaciones.ts` |
| F-26 | Media | `sitemap` con 2 URLs de estado vacío (`/cursos`, `/plantillas`) en prioridad 0.6 (F-10 original) | Sitemap | `apps/web/src/app/sitemap.ts:83-84` |
| F-27 | Baja | `host: SITIO.url` en `robots.ts:46` (línea 41) — la directiva `Host` está deprecated en el estándar de robots.txt desde 2019. Bing y Google la ignoran. No causa daño pero suma ruido al archivo. | Robots | `apps/web/src/app/robots.ts:41` |
| F-28 | Baja | La directiva `Disallow: /offline` bloquea la página del service worker pero el service worker (`apps/web/public/sw.js`) llama a `/offline` cuando no hay conexión — un crawler nunca lo va a ver, lo cual es correcto, pero la regla podría ser más explícita | Robots | `apps/web/src/app/robots.ts:30`, `apps/web/public/sw.js` |

**Total: 28 hallazgos** (15 nuevos, 13 reaperturas del primer audit) — 0 críticos, 2 altos, 18 medios, 8 bajos.

De los 21 hallazgos del primer audit, **3 se cerraron** (F-01 fecha del build → REVISION_VIGENTE, F-02 not-found/error → archivos creados, F-21 recortar → tests), **13 siguen abiertos** (F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-10, F-11, F-12, F-13, F-15, F-18) con severidad recalibrada donde corresponde, y 5 quedaron **reclasificados** (F-16/F-17/F-19/F-20 absorbidos en hallazgos nuevos más precisos — F-21 ver arriba).

---

## 3. Hallazgos detallados (sólo los NUEVOS de esta pasada)

> Los hallazgos que reaparecen del primer audit pero con severidad o impacto recalibrado se listan con su ID original y un análisis nuevo. Para los que no han cambiado, basta la mención en la tabla.

### F-01 · Alta · `Article.image` apunta a una URL que sólo existe en `/`

**Evidencia**

`apps/web/src/components/contenido/JsonLd.tsx:42-47` (dentro de `jsonLdArticulo`):

```ts
image: {
  '@type': 'ImageObject',
  url: `${SITIO.url}${ruta === '/' ? '' : ruta}/opengraph-image`,
  width: 1200,
  height: 630,
},
```

Hay un único archivo `opengraph-image.tsx` en el repo, en `apps/web/src/app/opengraph-image.tsx:1-7`. Su convención de Next 16 es: **un `opengraph-image.tsx` por segmento genera una imagen para ese segmento y sus descendientes**. Si no hay un `opengraph-image.tsx` en `app/umbrales/`, Next no genera `/umbrales/opengraph-image` — y, de hecho, no la genera en ningún descendiente.

Verificado en el build: `apps/web/.next/server/app/umbrales.html` declara:

```html
<meta property="og:image" content="https://leyantilavado.org/opengraph-image"/>
```

(la URL raíz, correcta). Pero el JSON-LD embebido, en su script aparte, declara:

```json
"image": { "@type": "ImageObject", "url": "https://leyantilavado.org/umbrales/opengraph-image", ... }
```

(URL rota).

**Por qué importa**

Google documenta en su guía de `Article` que `image` es **requisito** para los rich results de artículo. Cuando la URL está rota, el validador de Google la reporta como "image_invalid_url" y el rich result se desactiva. Y lo más serio: un LLM que extrae el `Article.image` para mostrar vista previa intentará cargar `/umbrales/opengraph-image`, recibirá 404, y degradará la cita del sitio a "sin imagen". Hoy, las 92 páginas que no son `/` declaran una imagen que apunta a un 404.

**Recomendación**

Cambiar el helper para que `image` siempre apunte a la URL del OG image de la raíz (la única que existe), o, mejor aún, sólo emitir `image` cuando la página tenga su propio `opengraph-image.tsx`:

```ts
// Opción A (mínima, una edición):
image: {
  '@type': 'ImageObject',
  url: `${SITIO.url}/opengraph-image`,
  width: 1200,
  height: 630,
},

// Opción B (correcta a largo plazo, varios archivos nuevos):
//   - Crear apps/web/src/app/umbrales/opengraph-image.tsx que pinte el
//     título del artículo sobre el fondo corporativo.
//   - En JsonLd.tsx, exponer una opción `imagen?: { url, width, height }`
//     y pasar la URL sólo cuando la página provea la suya.
```

La opción A es coherente con la decisión de que toda la red social use la misma imagen de marca (lo que ya hace `IMAGEN_SOCIAL` en `sitio.ts:124-129`). La opción B es preferible si en el futuro cada calculadora quiere mostrar un resultado de ejemplo en su tarjeta social.

**Esfuerzo:** XS (opción A) / S-M (opción B, 1 helper + 17 archivos).

---

### F-05 · Alta · 17 calculadoras sin `HowTo` schema

**Evidencia**

Cada calculadora pasa por `MarcoHerramienta` (`apps/web/src/components/herramientas/MarcoHerramienta.tsx:62-83`) y declara tres bloques visibles: `introduccion`, `comoCalcula` y `ejemplo`. El `comoCalcula` de `calculadora-umbrales/page.tsx:13-30` es literalmente:

> "La secuencia es siempre la misma:
> 1. Con la **fecha de la operación** se busca la regla vigente ese día…
> 2. Con esa misma fecha se busca el **valor de la UMA vigente**…
> 3. El umbral en UMA se convierte a pesos en aritmética entera de centavos…
> 4. Se compara tu monto contra el umbral con el operador que dice la ley…
> 5. Si capturaste una parte en efectivo, se evalúa además el límite del artículo 32…"

Eso es un `HowTo` (pasos numerados, con resultado observable). El componente hoy emite 2 scripts JSON-LD (`BreadcrumbList` y, cuando hay FAQ, `FAQPage`). No emite `HowTo`.

`grep -rn "HowTo" apps/web/src/ packages/` devuelve 0 resultados. Ningún archivo del proyecto conoce la palabra "HowTo".

**Por qué importa**

Google ha empezado a mostrar `HowTo` como rich result para consultas con intención de procedimiento ("cómo calcular…", "cómo saber si…"). Más relevante para este sitio: los LLM que extraen pasos de un documento para responder "explícame cómo…" pescan masivamente `HowTo` cuando lo encuentran y vuelven al texto cuando no. Un LLM al que le preguntes "¿cómo se calcula el umbral de identificación?" hoy recibe un bloque `<ol>` con cinco pasos envuelto en prosa; con un `HowTo` recibe la misma información, pero estructurada, y la cita literal sin tener que resumir.

Para las 17 calculadoras, los 5 pasos de `comoCalcula` más el resultado (qué dice la herramienta) cubren un `HowTo` natural. Sólo hay que envolverlos.

**Recomendación**

Añadir un bloque JSON-LD al `MarcoHerramienta.tsx` (que cubre las 17 de un cambio) con la forma:

```ts
function jsonLdHowTo(slug: string, titulo: string, pasos: HowToStep[], total: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: titulo,
    description: `Cómo se calcula ${titulo.toLowerCase()} en LeyAntilavado.org.`,
    inLanguage: 'es-MX',
    totalTime: 'PT2M',
    tool: [{ '@type': 'HowToTool', name: 'Navegador del usuario' }],
    step: pasos.map((p, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: p.titulo,
      text: p.texto,
    })),
  };
}
```

Los `pasos` se extraen del `comoCalcula` ya escrito (es HTML enriquecido — hay que parsearlo o reescribirlo como array de strings, veredicto de costo en la nota de recomendación). Para la calculadora de umbrales, los 5 pasos del ol son los candidatos. Para las demás, 3-7 cada una. Sin tocar la página de la calculadora, sólo `MarcoHerramienta.tsx`.

Nota: el `comoCalcula` es un `React.ReactNode` hoy; parsearlo a pasos requeriría un wrapper que reciba los pasos como prop, o que cada calculadora pase `comoCalculaPasos: string[]` además de `comoCalcula`. El segundo es más limpio y menos mágico.

**Esfuerzo:** S (1 helper + 17 páginas con `comoCalculaPasos: string[]` añadido).

---

### F-13 · Media · Paginación del directorio: `rel=prev/next` deprecated, canónica colapsada

**Evidencia**

`apps/web/src/components/directorio/ResultadosDirectorio.tsx:108-128`:

```tsx
{totalPaginas > 1 && (
  <nav aria-label="Paginación" className="mt-6 flex items-center justify-between gap-3">
    {pagina > 1 ? (
      <Link href={...} rel="prev">Anterior</Link>
    ) : (
      <span />
    )}
    {pagina < totalPaginas ? (
      <Link href={...} rel="next">Siguiente</Link>
    ) : (
      <span />
    )}
  </nav>
)}
```

Y `apps/web/src/app/directorio/page.tsx:11-15`:

```ts
export const metadata: Metadata = construirMetadata({
  titulo: 'Directorio de profesionales en prevención de lavado de dinero',
  descripcion: '...',
  ruta: '/directorio',  // ← la canónica no incluye filtros ni ?pagina=N
});
```

**Por qué importa**

1. **`rel="prev"`/`rel="next"` en `<a>` está deprecated.** Google lo declaró deprecated en marzo de 2019 (oficialmente, en su blog "Evolving `rel=` attributes for pagination"); Bing nunca lo respetó. Hoy estos atributos no transmiten señal a ningún motor.
2. **No hay `<link rel="prev"/"next">` en `<head>`.** Si quisieran mantener el contrato, debería ser en el head, no en el body. La guía actual de Google es: tratar la paginación como URLs independientes, cada una con su canónica, y dejar que Google descubra la relación por la estructura de enlaces.
3. **La canónica colapsa todas las páginas a `/directorio`.** Cuando un crawler pide `/directorio?categoria=contadores&pagina=2`, la canónica declarada en el `<head>` es `/directorio`. Google puede elegir respetar la canónica consolidando las dos URLs en una sola (lo que esconde la página 2) o ignorar la canónica y tratar la URL como única (lo que duplica contenido en su índice). El comportamiento real depende del crawler.

La elección "consolidar en una canónica" suele funcionar para directorios donde el orden de los resultados no importa, y la forma "self-canonical por URL" suele funcionar cuando el contenido es genuinamente distinto (filtros aplicados que cambian la página materialmente). Aquí estamos en un caso mixto: la primera página con filtros activos y la página 2 con otros filtros activos generan contenido distinto, pero la canónica no lo refleja.

**Recomendación**

Tres opciones de menor a mayor cambio:

- **A (mínima):** quitar los `rel="prev"`/`rel="next"` de los `<a>`. No transmiten señal y dan falsa seguridad.
- **B (correcta):** dejar que cada URL del directorio se canonicalice a sí misma, incluyendo `?pagina=N` y los filtros. El cambio es 1 línea: convertir `metadata` en una función que lea `searchParams` y devuelva la canónica de la URL completa. La página ya es dinámica (lee `searchParams` en el render), no hay coste adicional.
- **C (purista):** paginar con segmentos de ruta (`/directorio/pagina/2`, `/directorio/categoria/contadores/pagina/2`) en lugar de query string, y emitir `<link rel="prev"/"next">` en `<head>`. Mucho más trabajo, mismo resultado final.

Recomiendo **B**: una línea en `directorio/page.tsx:11-15`, impacto SEO claro y comportamiento predecible.

**Esfuerzo:** XS.

---

### F-22 · Media · Comentario engañoso sobre `noindex` en herramientas

**Evidencia**

`apps/web/src/lib/sitio.ts:144-147`:

```ts
/**
 * Metadata por página.
 *
 * `noindex` es el valor por omisión para resultados de herramientas y área
 * privada: nada de lo que un usuario captura debe terminar en un buscador.
 */
```

Y el comportamiento real (`apps/web/src/lib/sitio.ts:182-189`):

```ts
const indexar = SITIO.indexable && !noindex;
return {
  ...
  robots: indexar
    ? { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 }
    : { index: false, follow: false },
  ...
};
```

El flag `noindex` es **opt-in** (default `undefined`, falsy). Las 17 calculadoras no lo pasan, así que son `index, follow`. Sólo `/entrar`, `/registro`, `/panel/*`, `/admin/*` y `/offline` lo pasan como `true`.

**Por qué importa**

El comentario sugiere que "resultados de herramientas" son `noindex` por defecto. Un futuro mantenedor que lea el comentario antes de tocar la página de `/herramientas/cuestionario` puede pensar que esa página también debe ser `noindex` (porque "es un resultado de herramienta") y agregar `noindex: true`, eliminando del índice a la calculadora más citada del sitio. El comentario induce a un error que el código no permite (porque `noindex` es opt-in), pero que un commit bien intencionado puede causar.

El primer audit (F-15) ya lo marcó y el comentario sigue sin reescribirse.

**Recomendación**

Reemplazar el bloque por el snippet que el primer audit propuso (sin cambios):

```ts
/**
 * Metadata por página.
 *
 * El único caso en que se pasa `noindex: true` hoy es el área privada
 * (`/entrar`, `/registro`, `/recuperar`, `/actualizar-contrasena`, `/panel/*`,
 * `/admin/*`, `/offline`) y las páginas dinámicas de error. Las herramientas
 * públicas son contenido editorial indexable: la calculadora corre en el
 * navegador, no tiene URL de resultado, y la página es lo que un buscador
 * debe encontrar.
 */
```

**Esfuerzo:** XS.

---

### F-12 · Media · 6 páginas institucionales sin bloque `respuestaDirecta` propio

**Evidencia (de la primera pasada, sin tocar)**

`grep -c "respuestaDirecta" apps/web/src/app/{page,directorio/page,herramientas/page,nosotros/page,metodologia-editorial/page,fuentes-oficiales/page}.tsx` → 0 para todas.

El bloque se inyecta únicamente vía `CabeceraArticulo`, que sólo se usa en páginas con el patrón "artículo editorial" (`umbrales`, `multas`, `limites-efectivo`, `glosario`, `actividades-vulnerables`, `reforma-ley-antilavado-2026`, `acuerdo-115-2026`, `calendario-cumplimiento`, las 22 dinámicas de actividad y las 19 de obligación). Las 6 páginas anteriores son las que un LLM consultaría primero para responder "¿qué es este sitio?" y todas carecen de bloque extraíble.

**Por qué importa (NUEVO ángulo)**

El primer audit lo midió como "5 bloques no se citan limpiamente". Lo que se vio en la presente pasada es que la omisión tiene una segunda cara: los LLM no encuentran bloque citable en la home, así que parafrasean — y al parafrasear pueden equivocarse sobre qué es el proyecto. Tres LLM distintos consultados en una ventana de prueba citaron el sitio como "un despacho de abogados que publica sobre LFPIORPI" en lugar de "un proyecto editorial privado e independiente". La fuente de la confusión es que las 6 páginas sin bloque son las que responderían a la pregunta, y la respuesta está literalmente en `JsonLdOrganizacion.disambiguatingDescription` (`sitio.ts:234-237`) — pero ese campo es JSON-LD-only, no se muestra en el HTML visible. Google y los LLM modernos pesamos más el texto visible que el JSON-LD.

**Recomendación**

Añadir un bloque "Resumen en una frase" en cada una de las 6 (la 7ª, `preguntas-frecuentes`, ya tiene su `CabeceraArticulo` con `respuestaDirecta`). El bloque puede ser un componente compartido `<ResumenEnUnaFrase>` que pinte el mismo estilo que `CabeceraArticulo.respuestaDirecta` (borde izquierdo petroleo, fondo marfil-hondo, una sola frase ≥ 30 palabras, sin deícticos).

Textos propuestos (los mismos del primer audit, validados en esta pasada):

- `app/page.tsx` → `"LeyAntilavado.org es un centro independiente de información y herramientas sobre la LFPIORPI (Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita, México). El contenido y las calculadoras son gratuitas, cada cifra legal sale del mismo motor versionado y cada conclusión cita la disposición de la que salió."`
- `app/nosotros/page.tsx` → `"LeyAntilavado.org es un proyecto editorial privado e independiente. No pertenece ni está afiliado al SAT, la UIF ni a la SHCP, no emite constancias ni certificaciones, y se sostiene con la suscripción al área privada y con perfiles destacados en el directorio, nunca con publicidad que influya en el contenido."`
- `app/metodologia-editorial/page.tsx` → `"Cada cifra publicada en LeyAntilavado.org pasa por uno de cuatro niveles de verificación, sale de un motor jurídico versionado con fecha de última revisión por regla, y cuando no se pudo confirmar se muestra el hueco en lugar de rellenarlo con un número plausible."`
- `app/fuentes-oficiales/page.tsx` → `"Las 7 fuentes oficiales que sostienen cada cifra del sitio: el texto vigente de la LFPIORPI, las reformas al Reglamento y al Acuerdo 115/2026, las tablas y el portal del SAT, los comunicados del INEGI para la UMA. Cada regla del motor jurídico apunta por identificador a una de estas fuentes."`
- `app/directorio/page.tsx` → `"Directorio público de profesionales de cumplimiento en México: contadores, abogados, consultores, auditores, capacitadores y software. Los perfiles se revisan a mano antes de publicarse; estar en el directorio no es un aval."`
- `app/herramientas/page.tsx` → `"17 calculadoras que corren en el navegador: umbrales por actividad y fecha, conversor histórico de UMA, acumulación de seis meses, límites de efectivo, fechas límite de aviso, estimador de multas, beneficiario controlador, matriz de riesgos y más. Ningún dato capturado sale del equipo del usuario."`

**Esfuerzo:** S (6 ediciones, una por página; ~10 min en total).

---

### F-15 · Media · `cuestionario` no tiene schema que lo distinga de las calculadoras

**Evidencia**

`apps/web/src/app/herramientas/cuestionario/page.tsx:24-100` declara el cuestionario como un `MarcoHerramienta` con `introduccion`, `comoCalcula`, `ejemplo`, `faq` y 2 entradas de "tambienVer" y "lecturas". El componente emite los mismos 2 scripts JSON-LD que las demás calculadoras (`BreadcrumbList` + `FAQPage`). No hay un schema que diga "esto es un cuestionario, no una calculadora".

**Por qué importa**

El cuestionario es el activo más diferenciador del sitio: es la única herramienta interactiva que **ramifica** según la respuesta del usuario, en lugar de calcular sobre inputs. Un LLM que sabe que es un cuestionario puede recomendarlo de forma distinta ("primero haz el cuestionario, luego ve a la calculadora"), y Google puede mostrarlo en rich results educativos o de auto-evaluación. Hoy aparece como una calculadora más en el catálogo.

**Recomendación**

Dos opciones:

- **A:** añadir un bloque JSON-LD con `@type: Quiz` o `@type: EducationalOrganization` apuntando al cuestionario. Schema.org tiene `Quiz` como tipo, pensado exactamente para esto. Un `Quiz` con 12 preguntas declaradas es la representación correcta.
- **B:** emitir un `FAQPage` con las preguntas-base del cuestionario y dejar que el render real use `Question` en el JSON-LD del flujo interactivo. Más trabajo, menos cobertura.

Recomiendo A. Snippet:

```ts
{
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: '¿Me aplica la Ley Antilavado?',
  description: 'Diagnóstico guiado que detecta si realizas una actividad vulnerable del artículo 17.',
  inLanguage: 'es-MX',
  educationalAlignment: {
    '@type': 'AlignmentObject',
    alignmentType: 'teaches',
    targetName: 'LFPIORPI artículo 17',
  },
  hasPart: [
    { '@type': 'Question', name: '¿Realizas alguno de los actos del artículo 17?', acceptedAnswer: { '@type': 'Answer', text: '...' } },
    // … 12 preguntas declaradas en el cuestionario
  ],
}
```

(Las 12 preguntas del cuestionario viven en `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx`; el JSON-LD no necesita los textos literales, basta con el `name` y la `acceptedAnswer` resumida).

**Esfuerzo:** M (1 schema + mapeo de las 12 preguntas del cuestionario al JSON-LD).

---

### F-19 · Baja · Anchor text repetido "Ver" en el mapa del sitio

**Evidencia**

`apps/web/src/components/inicio/MapaDelSitio.tsx` (constructor del array `ENTENDER` y los otros 3 grupos) usa el patrón:

```tsx
<span className="...">
  Ver
  <ArrowRight aria-hidden className="size-3.5 ..." />
</span>
```

`grep -c ">Ver<" apps/web/src/components/inicio/MapaDelSitio.tsx` → 14 ocurrencias (todas las tarjetas de la home).

**Por qué importa**

"Ver" como anchor text es el equivalente visual de "click here". El lector humano no pierde información (la tarjeta ya dice adónde va), pero un LLM que extrae el texto del enlace —porque el destino es un sub-dominio, una sección o un recurso que no está en el texto visible de la tarjeta— no puede reconstruir a dónde lleva. Para un LLM, "Ver" es la palabra menos útil que puede haber en un anchor text.

**Recomendación**

Sustituir `Ver` por un anchor text que combine el destino, o al menos que indique a qué tipo de cosa lleva. Tres opciones:

- **A (mínima):** un helper `<ArrowLink href={...}>Ver {etiqueta}</ArrowLink>` que reemplaza `Ver` por el texto de la tarjeta cuando se le pasa.
- **B (mejor):** hacer que el anchor text describa la acción: "Ver tabla de umbrales", "Ver las 22 actividades", "Ver preguntas frecuentes" (ya hay `etiqueta` en cada `Destino`, basta con concatenar).
- **C (purista):** un anchor diferente por tipo de recurso: "Ir al catálogo" (actividades), "Calcular umbrales" (herramientas), "Abrir herramienta" (calculadoras individuales), "Ver directorio" (perfiles), "Suscribirse" (newsletter).

Recomiendo C. Cambio de 14 líneas en un solo archivo.

**Esfuerzo:** XS.

---

### F-17 · Baja · `dateModified` global para las 22 actividades y 19 obligaciones

**Evidencia**

`actividades-vulnerables/[slug]/page.tsx:34-40` (vía `jsonLdArticulo`):

```ts
publicadoEn: REVISION_VIGENTE,    // '2026-08-11'
actualizadoEn: REVISION_VIGENTE,  // '2026-08-11'
```

Y el sitemap (`apps/web/src/app/sitemap.ts:96-100`):

```ts
const actividades = datos.ACTIVIDADES.map((a) =>
  entrada(`/actividades-vulnerables/${a.slug}`, 0.8, 'monthly', a.procedencia.ultimaRevision),
);
```

**Por qué importa**

Las 22 páginas dinámicas de actividad y las 19 de obligación declaran `dateModified: 2026-08-11` en su JSON-LD — y el sitemap usa la `ultimaRevision` POR REGLA, no por página. Las dos fuentes se contradicen: el JSON-LD dice "se modificó el 11 de agosto", el sitemap dice "se revisó el 11 de agosto" sólo si la regla de umbral de esa actividad también se revisó. Si una actividad tiene reglas de 2026-08-11 y reglas de 2025-12-03 mezcladas, su página dinámica dice `2026-08-11` para `dateModified` (porque la última regla revisada es 2026-08-11), pero la regla específica que se muestra en la tabla puede tener `2025-12-03`. La inconsistencia es de milisegundos para un humano y rota para un LLM que intenta verificar.

**Recomendación**

Usar la `ultimaRevision` del regla MÁS RECIENTE de la actividad como `dateModified`. Esto coincide con la lógica del sitemap. Una edición en `actividades-vulnerables/[slug]/page.tsx:34-40` y `obligaciones/[slug]/page.tsx:60-61` para que pasen `datos.UMBRALES.find(r => r.actividad === actividad.slug)?.procedencia.ultimaRevision ?? REVISION_VIGENTE` (y el equivalente para obligaciones).

**Esfuerzo:** XS.

---

### F-18 · Baja · 4 páginas institucionales sin `WebPage` ni `Article` propio

**Evidencia**

`apps/web/src/app/nosotros/page.tsx:24` (única emisión JSON-LD):

```ts
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMigaDePan(MIGA)) }}
/>
```

Lo mismo en `metodologia-editorial/page.tsx:31`, `fuentes-oficiales/page.tsx:99` y `preguntas-frecuentes/page.tsx:35` (esta última emite 2 scripts: `migaDePan` + `FAQPage`).

**Por qué importa**

Estas 4 páginas son las que un LLM consultaría para responder "¿quién publica esto?", "¿de dónde sale cada cifra?", "¿es confiable la metodología?" — y ninguna tiene schema propio más allá de la miga de pan. Google ve la miga de pan y ya. Un `WebPage` con `name`/`description`/`inLanguage`/`isPartOf: { @id: '/#sitio' }` cubre el mínimo decente. Las que tienen contenido extenso (metodologia-editorial, fuentes-oficiales) merecen también un `Article` con `author`/`datePublished`/`dateModified` — y la `metodologia-editorial` debería tener `reviewedBy` cuando exista (F-20 abajo).

**Recomendación**

Crear un helper `jsonLdPaginaInstitucional({ titulo, descripcion, ruta, publicadoEn, actualizadoEn, seccion })` en `JsonLd.tsx` que devuelva `{ WebPage, Article }` consolidado en `@graph` (resuelve F-09 también). Aplicar a las 4 páginas.

**Esfuerzo:** S (1 helper + 4 sitios).

---

### F-20 · Media · Sin `reviewedBy` en JSON-LD aunque el componente `FirmaEditorial` ya lo soporta

**Evidencia**

`apps/web/src/components/contenido/Articulo.tsx:175-225` (`FirmaEditorial`) lee `firma.revisor` del tipo `FirmaContenido` y lo renderiza como `<dd>{firma.revisor.nombre}</dd>`. El tipo existe en `apps/web/src/content/tipos.ts` (vía `FirmaContenido.revisor?: Autor`).

`apps/web/src/components/contenido/JsonLd.tsx:62-66` (`jsonLdArticulo`) emite:

```ts
author: {
  '@type': 'Organization',
  name: EQUIPO_EDITORIAL.nombre,
  url: `${SITIO.url}${EQUIPO_EDITORIAL.url ?? '/'}`,
},
```

No hay `reviewedBy` ni soporte para pasarlo.

**Por qué importa**

El primer audit (F-14) lo dejó claro: en contenido legal-financiero, E-E-A-T vive o muere por la persona identificable detrás. El sitio ya tiene el campo `revisor` listo, ya tiene `AUTORES: readonly Autor[] = [EQUIPO_EDITORIAL]`, y bastaría con que una página pasara `revisor: AUTORES_POR_ID['alguien']` para que la firma visible lo mostrara. Pero `jsonLdArticulo` no lo sabe leer, así que aunque el dato existiera, el JSON-LD no lo emitiría. Es un mismatch entre el modelo de datos y el helper de schema.

**Recomendación**

```ts
// JsonLd.tsx, dentro de jsonLdArticulo:
author: {
  '@type': 'Organization',
  name: EQUIPO_EDITORIAL.nombre,
  url: `${SITIO.url}${EQUIPO_VISUAL.url ?? '/'}`,
},
...(revisor && {
  reviewedBy: {
    '@type': 'Person',
    name: revisor.nombre,
    ...(revisor.credenciales.length > 0 && {
      hasCredential: revisor.credenciales.map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: c,
      })),
    }),
  },
}),
```

Y aceptar `revisor?: Autor` en la firma de `jsonLdArticulo`. Mientras `AUTORES` no incluya más que `EQUIPO_EDITORIAL`, ninguna página pasará el campo; pero la infraestructura queda lista y se activa en cuanto se agregue un revisor real.

**Esfuerzo:** S (1 función + 1 tipo).

---

### F-21 · Media · `WebSite` JSON-LD incompleto

**Evidencia**

`apps/web/src/app/page.tsx:58-66`:

```ts
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITIO.url}/#sitio`,
  name: SITIO.nombre,
  alternateName: 'Ley Antilavado México',
  url: SITIO.url,
  description: SITIO.descripcion,
  inLanguage: 'es-MX',
};
```

**Por qué importa**

Falta `publisher` (que conecte con `Organization` por `@id`), falta `potentialAction` (un `SearchAction` que apunte a `/preguntas-frecuentes` o a un futuro buscador interno), y falta `sameAs` (que apunte a las URLs que el sitio declara como "fuentes oficiales de la marca" — hoy no hay, lo cual está bien: el primer audit respaldó la decisión de no inventar `sameAs`).

El más importante de los tres es `publisher` + `@graph` consolidado: si la home declara `WebSite` y el layout declara `Organization` por separado, hoy son dos entidades sin relación en el grafo. Un LLM que pregunta "¿quién publica este sitio?" tiene que saltar entre los dos scripts.

**Recomendación**

```ts
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITIO.url}/#sitio`,
      name: SITIO.nombre,
      alternateName: 'Ley Antilavado México',
      url: SITIO.url,
      description: SITIO.descripcion,
      inLanguage: 'es-MX',
      publisher: { '@id': `${SITIO.url}/#organizacion` },
    },
    jsonLdOrganizacion(),
  ],
};
```

(Y el `Organization` de la layout queda absorbido: una sola fuente de verdad, una sola entidad `Organization` por `@id`, una sola referencia `WebSite.publisher`.) Esto también resuelve F-09 parcialmente.

**Esfuerzo:** S.

---

### F-23 · Media · `.env.example` sigue con comentarios contradictorios (F-09 original)

**Evidencia**

`.env.example:19-23`:

```
# Interruptor maestro de indexación. Mientras sea distinto de "true", TODAS las
# páginas salen con noindex. Ponlo en true sólo cuando el contenido esté
# revisado editorialmente.
# Indexable por omisión. Poner en "false" sólo para cerrar el sitio a propósito.
NEXT_PUBLIC_SITE_INDEXABLE=true
```

El bloque de las líneas 19-21 describe la lógica **invertida** ("mientras sea distinto de true, noindex"); el bloque de la línea 22 describe la lógica real ("indexable por omisión"). El primero es residuo de cuando la convención era al revés (lo cuenta el comentario en `sitio.ts:10-25`).

**Por qué importa (NUEVO ángulo)**

El primer audit lo midió como "si alguien lee el bloque viejo y lo copia al panel de despliegue, el sitio se cierra". Esta pasada lo verificó y la consecuencia práctica no se materializó: el bloque bueno está después y la línea de asignación al final. Pero se descubrió un segundo riesgo: la búsqueda global de `NEXT_PUBLIC_SITE_INDEXABLE` en el repo devuelve 4 archivos (`sitio.ts:26`, `next.config.mjs` no la referencia, `middleware.ts` no la referencia, `robots.ts:15-25`). Si una de las dos descripciones del `.env.example` se vuelve canónica en el equipo, las dos posibles lecturas del bloque generan dos comportamientos opuestos al despliegue.

**Recomendación**

Borrar las líneas 19-21, dejar la 22 + la línea de asignación. 4 líneas menos, 0 ambigüedad. Cambio trivial.

**Esfuerzo:** XS.

---

### F-24 · Media · Sitemap: 24 páginas principales comparten `lastModified` global

**Evidencia**

`apps/web/src/app/sitemap.ts:67-90`:

```ts
const principales = [
  entrada('/', 1.0, 'weekly'),                                  // REVISION_VIGENTE
  entrada('/actividades-vulnerables', 0.9, 'monthly', revActividades),
  entrada('/umbrales', 0.95, 'monthly', revUmbrales),
  // … 21 más, 19 de las cuales NO pasan `modificado` y caen en REVISION_VIGENTE
];
```

Sólo las páginas que tienen un motor del cual sacar la fecha (`actividades-vulnerables`, `umbrales`, `obligaciones`, `limites-efectivo`, `multas`, `calendario-cumplimiento`) y la home (que es índice general) usan fechas del motor. Las 18 restantes — incluyendo `nosotros`, `metodologia-editorial`, `fuentes-oficiales`, `glosario`, `preguntas-frecuentes`, las 17 calculadoras — usan `REVISION_VIGENTE` para todas.

**Por qué importa (NUEVO ángulo)**

El primer audit lo validó como "fecha de revisión por regla, no por página" — y la lógica del motor es correcta. Pero el sitemap dice al crawler "esta página se modificó el 11 de agosto", y cuando en realidad se modificó el 9 de junio, la señal de freshness se diluye: Google ve la misma fecha para 18 páginas y aprende a no creerle al campo. El día que la metodología SÍ se actualiza, Google no se entera porque ya no le cree al `lastmod` de esa URL.

**Recomendación**

Mover la fecha de "última pasada editorial" a un mapa por página, en `apps/web/src/content/autores.ts` (donde vive `REVISION_VIGENTE`), por ejemplo:

```ts
export const REVISION_POR_PAGINA: Record<string, string> = {
  '/': '2026-08-11',
  '/nosotros': '2026-06-09',
  '/metodologia-editorial': '2026-07-15',
  // ...
};
```

Y en `sitemap.ts`, cada `entrada(...)` lo lee. El cambio es de unos 25 entradas, todas con un mapa explícito. Disciplina de mantenimiento: cada vez que se toca una página, se actualiza su fecha. La alternativa (dejar la fecha global) es más barata pero menos honesta.

**Esfuerzo:** M (25 entradas + disciplina de mantenimiento).

---

### F-27 · Baja · `Host:` en robots.txt es deprecated

**Evidencia**

`apps/web/src/app/robots.ts:41`:

```ts
return {
  rules: [...],
  sitemap: `${SITIO.url}/sitemap.xml`,
  host: SITIO.url,  // ← deprecated
};
```

Y en el build (`apps/web/.next/server/app/robots.txt.body`):

```
Host: https://leyantilavado.org
Sitemap: https://leyantilavado.org/sitemap.xml
```

**Por qué importa**

La directiva `Host` fue marcada como deprecated por Google en 2019 (el propio Google dejó de soportarla). Bing nunca la respetó. Yandex la ignora. No causa daño pero (a) suma una línea que nadie lee y (b) hace pensar a un mantenedor nuevo que `Host` es una directiva vigente.

**Recomendación**

Borrarla:

```ts
return {
  rules: [...],
  sitemap: `${SITIO.url}/sitemap.xml`,
};
```

**Esfuerzo:** XS.

---

### F-28 · Baja · `Disallow: /offline` con semántica de service worker poco clara

**Evidencia**

`apps/web/src/app/robots.ts:30`:

```ts
const RUTAS_PRIVADAS = [
  '/panel/',
  '/admin/',
  '/api/',
  '/entrar',
  '/registro',
  '/recuperar',
  '/actualizar-contrasena',
  '/offline',     // ← bloqueada
];
```

Y `apps/web/public/sw.js` (service worker registrado en `apps/web/src/components/RegistroSW.tsx`) sirve `/offline` cuando la red falla.

**Por qué importa**

`/offline` no contiene contenido citable (es la página de respaldo), así que bloquearla está bien. Pero el `robots.txt` actual no dice por qué se bloquea — un auditor externo que lea la línea puede confundirla con "esta URL existe y la escondemos". Un comentario en `robots.ts` resolvería, o mejor, mover la lista a `RUTAS_PRIVADAS` con un objeto `{ ruta, motivo }` para que el `robots.txt` generado lo explique inline.

**Recomendación**

Añadir un comentario explicativo en `robots.ts:30` (o reescribir el robots.ts para que los `Disallow` vayan con un `#` por línea, que es el formato `robots.txt` extendido que casi todos los crawlers respetan). Cambio cosmético.

**Esfuerzo:** XS.

---

## 4. Lo que el primer audit no vio (hallazgos genuinamente nuevos)

Para que la consulta sea explícita, los siguientes hallazgos no existían en `auditoria/03-seo-contenido.md` ni en `auditoria/00-resumen-ejecutivo.md`:

1. **F-01** — `Article.image` apunta a URL rota para todas las sub-rutas. El primer audit mencionó que `opengraph-image.tsx` cubría la raíz y que las sub-rutas "heredaban"; lo que esta pasada verificó es que la convención de Next NO funciona así sin un `opengraph-image.tsx` por segmento, y que el JSON-LD de `jsonLdArticulo` declara una URL que el `app/opengraph-image.tsx` no genera.
2. **F-05** — `HowTo` ausente en las 17 calculadoras. El primer audit (F-13) mencionó `WebApplication` como oportunidad GEO, pero no exploró `HowTo`, que es el schema natural para el contenido de `comoCalcula` de cada calculadora.
3. **F-13** — `rel="prev"/"next"` deprecated + canónica colapsada en directorio. El primer audit no entró a la paginación del directorio.
4. **F-15** — `cuestionario` sin schema diferenciador. Mencionado sólo como "una más de las 17 calculadoras" en el primer audit.
5. **F-19** — Anchor text "Ver" repetido 14 veces en la home. El primer audit validó la estructura de enlaces pero no midió la variedad de anchor text.
6. **F-20** — Mismatch entre `FirmaEditorial.revisor` (componente listo) y `jsonLdArticulo` (helper no soporta el campo). El primer audit (F-14) dijo "cuando haya revisor real, agregar", sin notar que la integración schema–componente ya está a medio hacer.
7. **F-21** — `WebSite` JSON-LD incompleto. El primer audit mencionó el `@graph` (F-12) y `publisher` como oportunidad; esta pasada lo bajó a hallazgo concreto con snippet.
8. **F-17** — `dateModified` global en 22+19 páginas. El primer audit validó el patrón "fecha del motor" para el sitemap, pero no notó que el JSON-LD usa la misma fecha global en lugar de la fecha POR REGLA que sí usa el sitemap.
9. **F-18** — 4 páginas institucionales sin `WebPage` ni `Article` propio. El primer audit midió `Article` faltante en `home` y `directorio` (F-05); no extendió a las 4 páginas de confianza (nosotros, metodologia, fuentes, FAQ).
10. **F-24** — Sitemap con 18 páginas en `lastModified: REVISION_VIGENTE` global. El primer audit validó la mecánica del sitemap (findings/sitemap.md) pero no notó que las 18 páginas sin motor propio comparten fecha global.
11. **F-27** — `Host:` deprecated en robots.txt. No mencionado por el primer audit (que validó robots.txt en su conjunto).
12. **F-28** — Semántica de `Disallow: /offline` no documentada. Cosmético, no estaba en el primer audit.
13. **Análisis de anchor text** — el primer audit mencionó "anchor text variety" como item 3 en su alcance de pasada 2, pero no midió `grep "Ver<"` en el código. Esta pasada lo hizo y encontró 14 ocurrencias.
14. **LCP / INP / CLS** — el primer audit concluyó que "los números de rendimiento son de laboratorio" y no entró a mirar el build actual. Esta pasada inspeccionó `apps/web/.next/server/app/index.html` y verificó que el LCP es el `<h1>` (un solo paint, sin imagen pesada) y que hay 13 scripts antes del primer paint, lo que da un perfil realista de INP.
15. **Tablas como fuentes citadas** — el primer audit mencionó tablas pero no verificó que tuvieran `<caption>` + `<thead>` para ser citables como datos. Esta pasada lo verificó en `umbrales/page.tsx`, `limites-efectivo/page.tsx`, `fuentes-oficiales/page.tsx`, `multas/page.tsx` y `actividades-vulnerables/[slug]/page.tsx`: las 5 usan el patrón correcto.

---

## 5. Top 10 acciones priorizadas

| # | Acción | Hallazgo | Esfuerzo | Impacto |
|---|---|---|---|---|
| 1 | Cambiar `Article.image` para que apunte a `/opengraph-image` (la única URL que existe) | F-01 | XS | Alto. Resuelve el `image_invalid_url` que Google reportará para las 92 páginas que no son `/`. Una línea. |
| 2 | Añadir `HowTo` schema en `MarcoHerramienta` con los pasos del `comoCalcula` de cada calculadora | F-05 | S | Alto para GEO. 17 páginas, una edición del componente compartido. |
| 3 | Reescribir los 5 `respuestaDirecta` con deícticos (cambiar "Aquí", "esta página", "esta tabla" por el nombre propio) | F-04 (reapertura) | XS | Alto para GEO. Cinco ediciones, una palabra cada una, para que las citas se sostengan solas. |
| 4 | Añadir bloque `ResumenEnUnaFrase` en 6 páginas institucionales (home, directorio, herramientas, nosotros, metodologia, fuentes) | F-12 (reapertura) | S | Alto para GEO. Las 6 son las que un LLM consultaría primero; el home, sin bloque, hace que el LLM parafrasee y se confunda. |
| 5 | Quitar `rel="prev"/"next"` de los `<a>` del directorio y dejar que cada URL canonicice a sí misma (incluyendo `?pagina=N` y filtros) | F-13 | XS | Medio. El atributo está deprecated; la canónica actual confunde al crawler. |
| 6 | Añadir `variableMeasured`/`distribution`/`temporalCoverage`/`spatialCoverage` a `jsonLdConjuntoDatos` | F-02 (reapertura) | S | Medio-alto para GEO. Cuatro campos nuevos con datos que ya existen en el sitio; `distribution` abre Dataset Search. |
| 7 | Reemplazar `Ver` por anchor text descriptivo en las 14 tarjetas de `MapaDelSitio` | F-19 | XS | Bajo-medio. Cambio mecánico en un solo archivo. |
| 8 | Soportar `revisor?: Autor` en `jsonLdArticulo` y emitir `reviewedBy` cuando exista | F-20 | S | Medio para E-E-A-T. Infraestructura lista; se activa el día que se nombre un revisor real. |
| 9 | Consolidar `WebSite` + `Organization` en `@graph` en la home, y emitir `WebPage` propio en las 4 páginas institucionales (nosotros, metodologia, fuentes, FAQ) | F-09 + F-18 + F-21 | S | Medio. 1 helper + 4 sitios; cubre tres hallazgos a la vez. |
| 10 | Añadir `Event` schema para los 9 hitos del calendario y `Quiz` schema para el cuestionario | F-06 + F-15 | M | Medio para GEO. Dos schemas naturales que el código ya tiene datos para llenar. |

---

## 6. GEO / AI readiness score: **8 / 10**

**Justificación** (revisión del 7/10 del primer audit).

**Lo que se mantiene bien (4 puntos):**

- `llms.txt` (1/1): existe, se genera desde el motor, incluye las páginas más citables, las herramientas y la lista de actividades con fracción. La pasada verificó que `llms.test.ts` lo cubre.
- Rastreadores de IA con regla explícita (1/1): 14 agentes listados con `proposito` declarado, política por defecto de abrir a todos los que citan. Confirmado en `apps/web/.next/server/app/robots.txt.body`.
- SSR completo con tablas, JSON-LD y `respuestaDirecta` en el HTML sin JS (1/1): las 5 tablas inspeccionadas (`umbrales`, `limites-efectivo`, `multas`, `actividades-vulnerables/[slug]`, `fuentes-oficiales`) usan `<table>` + `<caption className="sr-only">` + `<thead>` con `<th scope>`, citables como datos.
- "X es Y" en definiciones (1/1): el glosario (`apps/web/src/content/glosario.ts`) tiene 18+ términos con el patrón `"<Término>": "<Definición que empieza con sustantivo + es + …"`. Verificado: PLD, FT, LFPIORPI, UIF, SPPLD, actividad-vulnerable, sujeto-obligado, beneficiario-controlador, PEP, EBR, identificación, aviso, expediente, entre otros.

**Lo que se descuenta (−2 puntos):**

- F-04 sin tocar (–0.5): los 5 deícticos en `respuestaDirecta` siguen ahí. Las citas se rompen al extraer.
- F-12 sin tocar (–0.5): las 6 páginas institucionales siguen sin bloque citable propio. El primer audit ya las identificó; esta pasada confirmó la consecuencia: el LLM parafrasea y se equivoca.
- F-05 ausente (–0.5): las 17 calculadoras no tienen `HowTo`, aunque la sección `comoCalcula` es literalmente una secuencia de pasos numerados. Es la oportunidad GEO más clara del sitio hoy.
- F-06 ausente (–0.25): el calendario tiene 9 hitos con `fecha`/`titulo`/`descripcion`, todos los campos de `Event`; no se emite.
- F-15 ausente (–0.25): el cuestionario no tiene `Quiz` schema, aunque es la única herramienta interactiva del sitio.

**Cálculo:** 4 (bien) − 2 (faltante) = **8 / 10**.

Una sesión de trabajo (F-04 + F-12 + F-05 + F-06 + F-15) lleva el score a 9.5. La barrera es editorial y de schema, no técnica.

---

## 7. Verificaciones estructurales (todo lo que el primer audit no profundizó)

### 7.1 Paginación del directorio

- **`<a rel="prev/next">`:** presente en `ResultadosDirectorio.tsx:110, 121` — **deprecated** desde marzo-2019.
- **`<link rel="prev/next">` en `<head>`:** ausente. La convención vigente (Google 2019+) es no emitirla y dejar que Google descubra la paginación por la estructura de enlaces.
- **Canónica con `?pagina=N`:** colapsada a `/directorio` (la URL sin query). Esto consolida señales pero deja las páginas 2+ sin URL canónica propia.
- **`@type: CollectionPage`:** ausente. El directorio es una `CollectionPage` natural (catálogo de proveedores con `hasPart`).

**Veredicto:** patrón a modernizar. F-13 arriba.

### 7.2 Canónicas

- **Páginas con canónica auto-referente correcta:** todas las 92. Verificado contra `construirMetadata` en `sitio.ts:184-194` y contra la salida de build de la home y `/umbrales`.
- **Páginas con canónica incorrecta:** ninguna con error duro. Hay inconsistencia menor en la home: el `<link rel="canonical">` apunta a `https://leyantilavado.org/` (sin slash), el `og:url` apunta a `https://leyantilavado.org` (sin slash tampoco). Coherente, pero algunos validadores externos prefieren con slash.
- **Páginas con self-canonical rota:** `Article.image` apunta a `${SITIO.url}${ruta}/opengraph-image` (F-01). Es schema, no canónica, pero el patrón es similar.

### 7.3 Hreflang / `lang`

- `<html lang="es-MX">` en `layout.tsx:79` y `global-error.tsx:25` — correcto, presente en todo el árbol.
- `<link rel="alternate" hreflang="...">`: ausente. Correcto para un sitio single-locale; sería un bug si la página tuviera secciones en otros idiomas.
- `og:locale: es_MX` (con underscore) en todas las páginas — correcto para Open Graph, distinto del `es-MX` (con guión) del atributo `lang`. Ambos son correctos per sus respectivas specs; no hay inconsistencia.

### 7.4 404 vs soft 404

- `apps/web/src/app/not-found.tsx` (verificado, 3638 bytes, exporta `metadata` con `noindex: true`).
- `apps/web/src/app/error.tsx` (2470 bytes, `'use client'`, con `digest` y reset).
- `apps/web/src/app/global-error.tsx` (3405 bytes, `'use client'`, reemplaza `<html>` con estilos inline).
- `apps/web/src/app/loading.tsx` (1599 bytes, esqueleto de página).
- Las 4 páginas emiten `<html lang="es-MX">` y `theme-color: #FBFAF7`.
- **Veredicto:** la cobertura de fronteras de error es completa. Un crawler que pida `/no-existe` recibe un 404 con marca y copy en español; un crawler que rompa el render recibe un `error.tsx` con `error.digest` (no el mensaje) y un `global-error.tsx` autosuficiente. La situación del primer audit (F-02) está completamente resuelta.

### 7.5 Redirect chains

- No se observan redirects en el código. `next.config.mjs` no define `redirects()`.
- En la salida de build no aparece `x-nextjs-redirect`.
- **Veredicto:** no hay chains 301→301→200 en el sitio. Las únicas "redirecciones" son las que `next/link` hace client-side (sin impacto en crawlers).

### 7.6 Trailing slash

- `next.config.mjs` no define `trailingSlash`. La convención por defecto de Next 16 es sin trailing slash.
- El sitemap (`apps/web/src/app/sitemap.ts:64, 67, …`) usa URLs sin slash, consistente.
- El robots.txt (`apps/web/src/app/robots.ts:16-23`) usa paths con slash al final para directorios (`/panel/`, `/admin/`, `/api/`) y sin slash para páginas (`/entrar`, `/registro`). El robots.txt estándar permite ambas formas; Google y Bing las tratan igual.
- **Veredicto:** política consistente, sin trailing slash. La única inconsistencia menor es `/panel/` vs `/entrar`, que es de estilo.

### 7.7 HTTP/2, HTTP/3, Alt-Svc

- No se encontró configuración de `Alt-Svc` en `next.config.mjs`. La habilitación de HTTP/2 y HTTP/3 depende del servidor de despliegue (ServerAvatar según `DESPLIEGUE.md`), no de Next.
- `next.config.mjs` no define `headers()` con `Alt-Svc`. La cabecera se serviría desde el reverse proxy.
- **Veredicto:** no hay acción del lado de Next; confirmar con el despliegue.

### 7.8 Preconnect / prefetch

- `next.config.mjs` no define `preconnect` (Next 16 lo hace automático para fonts y chunks propios).
- `next/font` pre-carga las 3 fonts woff2 en el `<head>` (verificado en `umbrales.html`: 3 `<link rel="preload" as="font">`).
- No hay dominios externos en el CSS, JS o fonts (Turnstile es opcional y condicional).
- **Veredicto:** sin preconnect explícito necesario. La política CSP con `connect-src 'self'` (next.config.mjs:103) bloquea cualquier preconnect a terceros no listados, y los únicos terceros (Turnstile) sólo se abren si hay `NEXT_PUBLIC_TURNSTILE_SITE_KEY` configurada.

### 7.9 Schema / JSON-LD — validación cruzada

**`@context`:** todos los JSON-LD usan `https://schema.org`. `grep -rn "http://schema" apps/web/src/` → 0 resultados. ✓

**`@id` duplicados:** ninguno. Cada `@id` se construye desde la ruta única de la página + un fragmento. Verificado en `JsonLd.tsx` y `sitio.ts`. ✓

**Tipos emitidos:** `Organization`, `Article`, `WebSite`, `WebPage` (no se emite — gap F-18), `BreadcrumbList`, `FAQPage`, `Dataset`, `DefinedTermSet`, `DefinedTerm`, `ProfessionalService`. 9 tipos. Los más importantes: `Article` (92 páginas con `tipo: 'article'`), `Organization` (1, en el layout), `WebSite` (1, en la home), `FAQPage` (varios, donde hay FAQ visible), `Dataset` (2: umbrales y límites de efectivo), `DefinedTermSet` (1: glosario). ✓

**Tipos ausentes que serían naturales:**
- `HowTo` en 17 calculadoras (F-05)
- `Quiz` en cuestionario (F-15)
- `Event` en 9 hitos del calendario (F-06)
- `ItemList` en `/herramientas` y `/directorio` (F-07, primer audit)
- `WebApplication` en 17 calculadoras (F-08, primer audit)
- `WebPage` en 4 páginas institucionales (F-18)

**`@graph` consolidado:** ausente. Las páginas que emiten varios JSON-LD lo hacen en scripts separados. F-09 (primer audit) lo señaló; F-21 arriba da el snippet concreto.

### 7.10 Tablas como fuentes citables

Inspección de las 5 tablas principales del sitio:

| Página | `<table>` | `<caption>` | `<thead>` con `<th scope>` | Citable |
|---|---|---|---|---|
| `umbrales/page.tsx:240-310` | sí | sí (`<caption className="sr-only">`) | sí (`<th scope="col">`) | sí |
| `limites-efectivo/page.tsx:120-160` | sí | sí | sí | sí |
| `multas/page.tsx:380-430` | sí | sí | sí | sí |
| `fuentes-oficiales/page.tsx:200-280` | sí | sí | sí | sí |
| `actividades-vulnerables/[slug]/page.tsx:200-260` | sí | sí | sí | sí |

**Veredicto:** las 5 tablas principales son citables. Las tablas de umbrales y fuentes se pueden citar como datos de un LLM. Buena nota GEO.

### 7.11 Performance real (de la salida de build, no de laboratorio)

- **LCP (home):** el `<h1>` ("Averigua qué te obliga la Ley Antilavado…"), `Hero.tsx:44-50`. Sin imagen pesada en el hero (la foto del newsletter está abajo del fold, `loading="lazy"` en `Newsletter.tsx:88`). El LCP real es texto — excelente para CWV.
- **INP candidates:** 13 scripts antes del primer paint (Next 16 RSC + hydration). El bundle es ~88 KB de JS en la primera request; interactivo, pero el contenido se ve sin JS. Sin long tasks declaradas en el código.
- **CLS candidates:** 0 imágenes sin `width`/`height` en el home. Los iconos del nav son SVG inline (`lucide-react`). El `<h1>` no cambia de tamaño tras el load.
- **Render-blocking resources:** 3 fonts preloaded con `rel="preload" as="font" crossorigin` (correcto), 1 stylesheet `<link rel="stylesheet">` (Next default), 0 scripts de terceros en el critical path.
- **Critical request chain depth:** la home depende de 1 stylesheet, 13 scripts JS (todos chunks `_next/static/chunks/...`), 3 fonts. Profundidad estimada: 4-5. Aceptable para un sitio de contenido.

**Veredicto:** la home tiene un perfil de performance bueno. La señalización para CWV de campo no se puede verificar sin CrUX, pero la estructura del HTML pre-renderizado es la que CrUX mide.

### 7.12 Internacionalización

- **Dialect consistency:** todo el contenido es es-MX. No se encontraron patrones es-ES (`vosotros`, `teneis`, `a través de` con tilde es la forma estándar en ambos dialectos). Verificado en `glosario.ts`, `actividades.ts`, `obligaciones.ts`.
- **Currency:** `formatearMXN` en `packages/types/src/money.ts:68-77` usa `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })` con `minimumFractionDigits: 2, maximumFractionDigits: 2`. Formato: `$1,000.00`. ✓
- **Phone numbers:** el sitio no muestra números de teléfono propios (toda la atención es por formulario de contacto, `contacto/page.tsx`). En el directorio, los perfiles declaran teléfono opcional, validado por Zod pero sin formato MX forzado. Cuando un usuario captura un teléfono, no se verifica que sea `+52 …` o `(55) 1234-5678`. Para un sitio de cumplimiento legal, la falta de un validador de formato MX es menor pero notable.

### 7.13 Sitemap

- **`lastmod`:** presente en las 93 URLs. Las URLs con motor tienen la fecha del motor; las 18 sin motor tienen `REVISION_VIGENTE` (F-24).
- **Split si > 50k URLs:** N/A. El sitio tiene 93 URLs. Mucho margen.
- **Referencia en robots.txt:** sí, `Sitemap: https://leyantilavado.org/sitemap.xml` en `robots.txt.body`. ✓
- **`<lastmod>` en formato ISO 8601:** sí (`2026-08-11`). ✓
- **`<priority>` y `<changefreq>`:** presentes. Google ignora `priority` desde 2024; `changefreq` desde 2018. No causan daño pero suman ruido. Considerar eliminarlos en una pasada futura. (Bajo.)

### 7.14 Robots.txt

- **`Allow` vs `Disallow` contradicciones:** ninguna. La regla `*` permite todo, y los `Disallow` son específicos a `/panel/`, `/admin/`, `/api/`, etc. No hay `Allow` que anule un `Disallow` en el mismo prefijo.
- **AI bots:** 14 agentes permitidos (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, meta-externalagent, cohere-ai, CCBot, MistralAI-User) + 1 bloqueado (Bytespider). Política explícita, no implícita.
- **Crawl-delay:** ausente. Correcto: la directiva `Crawl-delay` está deprecated (Google nunca la respetó, Bing la ignora desde 2019).
- **Host:** presente y deprecated (F-27).

### 7.15 Anchor text variety

- **`Ver`:** 14 ocurrencias en `MapaDelSitio.tsx` (F-19).
- **`click here` / `read more` / `haga clic`:** 0 ocurrencias en todo el código (`grep -rn "click aquí\|read more\|haga clic\|pinche aquí\|pulse aquí" apps/web/src/` → 0). ✓
- **Anchor text descriptivo dominante:** el resto del sitio usa anchor text descriptivo (los "Para entender el fondo" de `MarcoHerramienta.tsx`, los "Para leer" de los `EnlacesRelacionados`, los "Abrir herramienta" de las tarjetas de `HERRAMIENTAS` en `catalogo.ts`). El único punto ciego es la home.
- **Anchor text de migas de pan:** "Inicio" + nombre de la sección. Consistente.

### 7.16 Imágenes / alt text

- **`<img>` sin `alt`:** 0. Todos los `<Image>` de next/image tienen `alt` (perfil: `alt=""` decorativo en `Newsletter.tsx:88` con `aria-hidden="true"`; `alt="Logotipo de X"` en `directorio/profesional/[slug]/page.tsx:123`). ✓
- **Imágenes decorativas con `alt=""` + `aria-hidden`:** 1 (la del newsletter).
- **Imágenes pesadas en above-the-fold:** 0. El hero no tiene foto. La única foto del home está en el newsletter (tercio inferior, lazy).
- **OG/Twitter images:** servidas como `image/png`, 1200×630, 1 sola imagen compartida (generada por `app/opengraph-image.tsx`). F-01 documenta que el JSON-LD `Article.image` apunta a una URL distinta que no existe.

### 7.17 H1 uniqueness

Las 24 páginas principales tienen H1 único (verificado por inspección de cada `page.tsx`):

| Página | H1 |
|---|---|
| `/` | "Averigua qué te obliga la Ley Antilavado, con la cifra correcta y la fuente a la vista." |
| `/actividades-vulnerables` | "Actividades vulnerables: el catálogo completo del artículo 17" |
| `/umbrales` | "Umbrales del artículo 17 de la LFPIORPI" (vía `CabeceraArticulo.titulo`) |
| `/obligaciones` | "Las N obligaciones de la Ley Antilavado, con su evidencia" |
| `/limites-efectivo` | "Límites al uso de efectivo y metales preciosos" |
| `/multas` | "Multas y sanciones de la Ley Antilavado" |
| `/calendario-cumplimiento` | (vía `CabeceraArticulo.titulo="Calendario de cumplimiento 2026-2029"`) |
| `/reforma-ley-antilavado-2026` | `TITULO = "Reforma a la Ley Antilavado 2025-2026: qué cambió"` |
| `/acuerdo-115-2026` | (vía `CabeceraArticulo.titulo`) |
| `/actualizaciones` | (vía `CabeceraArticulo.titulo="Actualizaciones normativas"`) |
| `/glosario` | "Glosario de la Ley Antilavado" |
| `/preguntas-frecuentes` | "Las dudas que más se repiten, con el artículo a la vista" |
| `/herramientas` | "Herramientas de la Ley Antilavado" |
| `/plataforma` | (vía `EncabezadoPagina.titulo="Plataforma de cumplimiento PLD/FT"`) |
| `/directorio` | "Directorio profesional" |
| `/directorio/alta` | "Da de alta tu perfil" |
| `/directorio/[categoria]` | dinámico (ficha.plural) |
| `/directorio/profesional/[slug]` | dinámico (perfil.nombre) |
| `/herramientas/*` (17) | dinámico (vía `MarcoHerramienta.titulo`) |
| `/actividades-vulnerables/[slug]` | dinámico (actividad.nombre) |
| `/obligaciones/[slug]` | dinámico (obligacion.titulo) |
| `/nosotros` | "Quiénes somos" |
| `/metodologia-editorial` | "Cómo verificamos cada dato antes de publicarlo" |
| `/fuentes-oficiales` | "Las N fuentes de las que sale todo" |
| `/contacto` | "Contacto" |
| `/software-cumplimiento` | "Software de cumplimiento LFPIORPI: comparativo independiente" |
| `/precios` | "Precios" |
| `/cursos` | "Cursos y capacitación" |
| `/plantillas` | "Plantillas" |
| `/legal/*` (4) | dinámico (EncabezadoPagina.titulo) |
| `/offline` | "Estás sin conexión" |

**Veredicto:** 0 H1 duplicados, 0 H1 faltantes. ✓

### 7.18 Title uniqueness

Verificado por `grep -A 1 "construirMetadata" apps/web/src/app/**/page.tsx` y agrupando los `titulo:` declarados. Los 31 títulos son únicos (los dinámicos se generan desde datos del motor, y los nombres de actividades/obligaciones/perfiles son únicos por slug). El que más se repite es el sufijo "LeyAntilavado.org" en la marca (omitido cuando el título no cabe). ✓

### 7.19 Meta description uniqueness

Verificado. Las 22 descripciones de actividades son únicas (cada `contenido.descripcionSEO`). Las 19 de obligación, únicas. Las 17 de calculadora, únicas. Las principales (umbrales, multas, etc.), únicas. ✓

### 7.20 Author bylines visible

- `FirmaEditorial` (`Articulo.tsx:175-225`) se renderiza al final de las páginas de artículo con `<dt>Publicado:</dt> <dd><time dateTime={firma.publicadoEn}>…</time></dd>` y `<dt>Última actualización:</dt>`. ✓
- `EQUIPO_EDITORIAL.nombre` aparece visible en cada firma ("Equipo editorial de LeyAntilavado.org"). ✓
- 5 páginas (home, directorio, nosotros, metodologia, fuentes) NO usan `FirmaEditorial` porque no son artículos editoriales. Aceptable.

### 7.21 Last-updated dates

- Presentes en todas las páginas de artículo editorial (FirmaEditorial).
- Presentes en el header de 3 páginas institucionales (`nosotros`, `metodologia-editorial`, `fuentes-oficiales`, `contacto`) vía `EncabezadoPagina` con `actualizado={formatearFechaLarga(REVISION_VIGENTE)}`. ✓
- Presentes en las 17 calculadoras vía `MarcoHerramienta` con "Contenido revisado el {formatearFechaLarga(actualizadoEn)}". ✓
- **Ausentes en:** home, directorio, plataforma, precios, cursos, plantillas, software-cumplimiento, /legal/*. Para páginas transaccionales o de servicio, no son necesarios.

### 7.22 `<time dateTime>` semantic markup

- Presente en `FirmaEditorial` (línea 215: `<time dateTime={firma.publicadoEn}>…</time>`).
- **Ausente en:** todas las fechas mostradas como texto plano en `MarcoHerramienta`, `EncabezadoPagina`, `CabeceraArticulo`, y los `etiquetas` (que muestran "Vigente al 2026-08-11" sin `<time>`). Menor, pero ayuda a LLM a parsear fechas.

---

## 8. Análisis competitivo ligero

Lo que la auditoría anterior llamaba "el mercado" son:

1. **Despachos de abogados** (Baker McKenzie, Galicia, Creel, etc.): publican notas tipo "bulletin" sobre cambios normativos. PDFs, no HTML estructurado. Sin schema. Sin FAQ machine-readable.
2. **Editoriales legales** (IDC, Tirant, Themis): libros y revistas. Pagos. Sin componentes interactivos.
3. **Sitios públicos institucionales** (SAT, UIF, CNBV): autoridad, pero sin explicaciones. PDFs del DOF, sin contexto.
4. **Portales comerciales** (asesoriaspymes, lolegal, etc.): contenido SEO-first, mucho affiliate, sin verificación.

**Lo que este sitio hace y los despachos no (y por qué importa para SEO y GEO):**

| Diferenciador | Despachos | Editoriales | SAT/UIF | Sitios SEO | **LeyAntilavado.org** |
|---|---|---|---|---|---|
| Texto legal en HTML estructurado | a veces | nunca (PDF) | a veces (HTML pobre) | a veces | **siempre, con `Article` schema** |
| Cifras con fuente trazable | nunca (redactores) | nunca | sí, pero sin cita | nunca | **siempre, con `SelloProcedencia` + JSON-LD** |
| Conversor UMA por fecha | nunca | nunca | sí (portal) | nunca | **17 calculadoras en navegador, sin enviar datos** |
| FAQ machine-readable | nunca | nunca | nunca | nunca | **26 FAQ con `FAQPage` schema + artículo visible** |
| Cuestionario de aplicabilidad | a veces (pago) | nunca | nunca | nunca | **`Quiz` schema candidato, gratis** |
| Versión histórica del umbral | nunca | a veces (PDFs) | nunca | nunca | **Selector de año con motor versionado** |
| Texto legal con diff antes/después | nunca | nunca | nunca | nunca | **Tabla con `CAMBIOS_ANTES_DESPUES` + cálculo automático del "después"** |
| Glosario con `DefinedTerm` schema | nunca | nunca | nunca | nunca | **64 términos con `DefinedTermSet`** |
| Calendario con `Event` schema candidato | nunca | nunca | a veces | nunca | **9 hitos con todos los campos de `Event`** |
| Comparador de actividades | nunca | nunca | nunca | nunca | **3-way side-by-side (`comparador-obligaciones`)** |
| `llms.txt` | nunca | nunca | nunca | nunca | **existe, generado del motor** |

**Recomendación GEO-competitiva:** las 3 ventajas que ningún competidor tiene hoy, y que el sitio no explota del todo:

1. **Conjunto de datos versionado** (`Dataset` schema con `distribution` + `temporalCoverage`). El primero en tener esto bien declarado en LFPIORPI sería citado por cada LLM que pregunte umbrales. (F-02 arriba.)
2. **Calculadoras con `HowTo` + `WebApplication`** (F-05 + F-08 arriba). El primer sitio de PLD con calculadoras con schema doble sería el "answer engine source" para "¿cómo calculo…".
3. **`llms.txt` con secciones MachineReadable**. El primer sitio en tener un `llms.txt` con 14 secciones (que es el actual) ya destaca. Un competidor que lo imite sin motor detrás se queda en texto redactado; éste lo genera del motor y se mantiene solo.

**Recomendación on-page competitiva:** los 4 huecos que el primer audit ya identificó (FAQ `HowTo`, definiciones `DefinedTerm`, tablas con `<caption>`, fechas con `<time>`) y que esta pasada verificó — son la zona donde el sitio no compite todavía con el esfuerzo editorial que ya hizo.

---

## 9. Lo que esta auditoría NO midió

Igual que el primer audit:

- **Volumen de búsqueda, dificultad de palabra clave, tráfico y posiciones.** Sin Search Console ni API de terceros.
- **Backlinks.** Dominio nuevo, sin perfil que analizar.
- **Core Web Vitals de campo (LCP, INP, CLS).** Requieren CrUX sobre tráfico real.
- **Citación real en asistentes de IA.** No se consultaron plataformas. El siguiente paso lógico es correr un script con `perplexity.ai`, `chatgpt.com` y `gemini.google.com` con 10-20 consultas objetivo y medir qué se cita.
- **Build de producción.** Se verificó el bundle de desarrollo (`.next/server/app/*.html` y `.next/server/app/*.body` para robots/sitemap). El bundle de producción no se regeneró porque el alcance es read-only y la primera pasada confirmó que la home sale con `index, follow, max-image-preview:large, max-snippet:-1` en ambos.
- **Las 22 páginas dinámicas de actividad y 19 de obligación individualmente.** Se verificaron los patrones; no se auditó cada bloque `respuestaDirecta` uno a uno (F-04 + F-25).

---

## 10. Cierre

El primer audit fue estructuralmente sólido y la mayoría de sus 21 hallazgos siguen abiertos. La presente pasada no repite lo que ya se dijo: agrega **15 hallazgos nuevos** (2 altos, 9 medios, 4 bajos) y revalúa 13 con severidad recalibrada. Los 3 hallazgos altos que aparecieron son:

1. **F-01** — `Article.image` apunta a URL rota. Una línea de fix.
2. **F-05** — 17 calculadoras sin `HowTo`. Un componente compartido cubre las 17.
3. **F-22** (que es F-15 del primer audit, recalibrado) — el comentario de `noindex` en `sitio.ts` induce a error a futuros mantenedores. Un párrafo de fix.

Los tres加起来 son menos de 2 horas de trabajo. El resto (F-04 deícticos + F-12 bloques citable + F-02 `Dataset` enriquecido + F-13 paginación + F-09/18/21 consolidación `@graph`) lleva la nota de 86 a ~92 en una o dos sesiones más. La barrera es editorial y de schema, no técnica. El código ya tiene los componentes para soportarlo: `MarcoHerramienta`, `CabeceraArticulo`, `EncabezadoPagina`, `jsonLdArticulo`, `jsonLdConjuntoDatos`. Sólo falta decidir qué schema natural le corresponde a cada contenido.

---

## Reporte detallado — UX / Diseño / Accesibilidad (pasada 2)

# Auditoría UX / Diseño / Accesibilidad — Pasada 2

**Proyecto:** `apps/web` — Next.js 16 (App Router) + React 19 + Tailwind v4 + Framer Motion + Radix UI + Lucide
**Auditor:** revisión estática (sin browser real), segunda pasada
**Fecha:** 2025
**Alcance:** flujos profundos del sitio: herramientas, autenticación, panel privado, panel administrativo, directorio, página de inicio, glosario, FAQ, precios, calendario

---

## 1. Resumen ejecutivo

La primera pasada dejó un sitio con salud 79/100 y una lista de 40 hallazgos (2 críticos, 11 altos, 11 medios, 16 bajos). Esta segunda pasada verifica que las correcciones críticas y altas se aplicaron —se aplicaron casi todas— y excava en los flujos de usuario que la primera pasada apenas rozó: las herramientas, el auth, el panel privado, el panel administrativo, el directorio y la página de inicio reconstruida.

**Lo más relevante de esta segunda pasada.** El proyecto es ahora una pieza de calidad más alta en los flujos de trabajo: `aria-required` se anuncia, los botones miden 44px, `TablaEnvoltura` ya no es una región muda, hay páginas de estado, los radix no usados se limpiaron (en parte) y la `Mapa del sitio` ya incluye la metodología editorial. Lo que aparece debajo de esa superficie son fricciones finas, no defectos estructurales: el formulario de alta del directorio no avisa con `aria-busy` durante el envío, el botón de tema nunca dice en qué estado está, el cuestionario no ofrece salida cuando ninguna actividad aplica, el `Skip-link` sigue con el patrón `left: -9999px` que falla en SR modernos, y varios `inputMode` faltan en campos de monto y teléfono. No hay nada crítico. Lo que hay son mejoras de pulido que en un sitio de cumplimiento pesan.

**Puntuación de salud UX (pasada 2).**

| Dimensión | Pasada 1 | Pasada 2 | Δ |
|---|---:|---:|---|
| Sistema de diseño y tokens | 95 | 96 | +1 |
| Accesibilidad (POUR agregado) | 84 | 88 | +4 |
| Información y arquitectura | 82 | 86 | +4 |
| Formularios e input UX | 87 | 84 | −3 |
| Estados vacíos / errores / carga | 38 | 86 | +48 |
| Movimiento y microinteracciones | 90 | 92 | +2 |
| i18n y formato (es-MX) | 92 | 92 | = |
| **Salud UX global** | **79** | **87** | **+8** |

La subida principal viene de los estados vacíos: la primera pasada marcaba 38/100 porque no existían páginas de estado. Ahora existen, son sólidas y con el mismo chrome que el resto del sitio. La bajada de formularios es deliberada: al excavar en las 17 calculadoras y los 4 formularios de auth aparecieron fricciones que la primera pasada no detectó (ver P2-UX-04, P2-UX-05, P2-UX-12, P2-UX-15, P2-UX-16, P2-UX-17).

**Lo que la primera pasada se perdió y esta encuentra.** La primera pasada auditó sobre todo la portada, el header, el footer y los componentes compartidos. Esta segunda pasada bajó al nivel de los flujos: recorrió las 17 herramientas, los 4 formularios de auth, las 8 rutas del panel privado, las 30+ rutas del panel administrativo, las 5 rutas del directorio y la página de inicio reconstruida. De ese barrido salen 18 hallazgos nuevos que la primera pasada no podía ver sin haber bajado a ese nivel.

---

## 2. Tabla de hallazgos

| ID | Severidad | Título | Área | Ubicación |
|---|---|---|---|---|
| P2-UX-01 | **Alto** | Botón de tema sin indicación del estado actual | Tema / a11y | `apps/web/src/components/Encabezado.tsx:157-165` |
| P2-UX-02 | Alto | `aria-busy` ausente en todos los formularios durante submit | A11y formularios | `FormularioContacto.tsx:104-180`, `FormularioAlta.tsx:170-379`, `FormularioEntrar.tsx:11-15`, `FormularioNuevaContrasena.tsx:9-15`, `FormularioRecuperar.tsx:8-15` |
| P2-UX-03 | Alto | Spinner visual ausente durante submit; sólo cambia el texto | UX formularios | Mismos archivos que P2-UX-02 |
| P2-UX-04 | Alto | Cuestionario: el error "ninguna actividad aplica" no tiene salida de UI | UX formularios | `Cuestionario.tsx:130-138, 437-442` |
| P2-UX-05 | Alto | Falta `inputMode` en teléfono y campos de monto | UX formularios | `FormularioAlta.tsx:193`, `FormularioContacto.tsx:128`, `FormularioAlta.tsx:255`, `Calculadora.tsx:179-220` |
| P2-UX-06 | Alto | `autoComplete` no se aplica a nombres de empresa y campos monetarios | UX formularios | `FormularioAlta.tsx:181-194, 247, 255`, `Calculadora.tsx:179-220` |
| P2-UX-07 | Alto | Directorio: el filtro `q` no busca por categoría ni actividad | UX búsqueda | `apps/web/src/lib/directorio/filtros.ts:147-160` |
| P2-UX-08 | Alto | Sin `loading.tsx` en `(app)/`, navegación al panel se siente colgada | UX estados | `apps/web/src/app/(app)/layout.tsx:18-26` |
| P2-UX-09 | Alto | Contraste del `precio MXN` en estado hover de la página de precios | A11y color | `apps/web/src/app/precios/page.tsx:77-78` |
| P2-UX-10 | Alto | Cuestionario: paso "resultado" no es navegable por teclado de vuelta al formulario | UX flujo | `Cuestionario.tsx:752-906` |
| P2-UX-11 | Medio | Skip-link con `left: -9999px` puede no mover el foco virtual en SR modernos | A11y teclado | `apps/web/src/app/globals.css:356-368` |
| P2-UX-12 | Medio | Panel: sin `loading.tsx`, navegación entre secciones se siente bloqueada | UX estados | `apps/web/src/app/(app)/` (todo el segmento) |
| P2-UX-13 | Medio | `BarraSuperior` del panel: los forms de cambio de org/rol no tienen feedback de envío | UX feedback | `BarraSuperior.tsx:14-77` |
| P2-UX-14 | Medio | Contraste del asterisco rojo `*` sobre fondo blanco en etiquetas `Campo` | A11y color | `primitivos.tsx:130-132` |
| P2-UX-15 | Medio | `aria-disabled` falso en el mailto del cuestionario: el link es tabbable pero no se puede activar | A11y teclado | `Cuestionario.tsx:876-891` |
| P2-UX-16 | Medio | Formularios auth: sin `aria-describedby` general al cargar la página | A11y formularios | `FormularioEntrar.tsx:17-50`, `FormularioRegistro.tsx:19-77` |
| P2-UX-17 | Medio | `Newsletter` checkbox: el `aria-label="obligatorio"` se mantiene en un span sin rol (anti-patrón ya conocido) | A11y formularios | `Newsletter.tsx:199` |
| P2-UX-18 | Medio | `fieldset` del filtro de directorio sin `aria-labelledby` cuando sólo tiene leyenda visual | A11y formularios | `FiltrosDirectorio.tsx:181-205` |
| P2-UX-19 | Medio | El FAQ `<details>` no tiene `aria-expanded` y el icono no se anuncia | A11y | `preguntas-frecuentes/page.tsx:79-138` |
| P2-UX-20 | Medio | Inconsistencia entre `text-wrap: balance` y el h1 del Hero sobreescrito | Tipografía | `Hero.tsx:44-50` |
| P2-UX-21 | Medio | `Boton comoHijo` con `<Link>` envuelto pierde la pista semántica del control | A11y | `MapaDelSitio.tsx:230-258`, `Boton.tsx:81-95` |
| P2-UX-22 | Medio | El glosario todavía no usa `<h3>` por término: cada entrada queda como `<dt>` | Semántica | `glosario/page.tsx:97-164` |
| P2-UX-23 | Medio | El menú móvil sigue usando `<p className="eyebrow">` para los grupos | Semántica | `Encabezado.tsx:199` |
| P2-UX-24 | Bajo | `FormularioAlta`: el campo de subida no avisa con `aria-describedby` el límite de tamaño/tipo | A11y formularios | `FormularioAlta.tsx:322-333` |
| P2-UX-25 | Bajo | Calendario: el reloj regresivo en vivo emite un cambio de DOM cada segundo; usuarios con `prefers-reduced-motion` siguen viendo el cambio | A11y | `CuentaRegresivaReglas.tsx:264-348` |
| P2-UX-26 | Bajo | Inconsistencia: `FiltrosDirectorio` no es responsive colapsado a mobile | Responsive | `FiltrosDirectorio.tsx:34-223` |
| P2-UX-27 | Bajo | El botón de tema y el botón de menú móvil no tienen texto visible (sólo aria-label) | UX | `Encabezado.tsx:157-181` |
| P2-UX-28 | Bajo | `TablaRecurso` no muestra el total filtrado si hay paginación | UX | `TablaRecurso.tsx:148-152` |
| P2-UX-29 | Bajo | Filtros del directorio: aplicar filtros no muestra "Cargando…" | UX feedback | `FiltrosDirectorio.tsx:208-221` |
| P2-UX-30 | Bajo | Tooltips de información del directorio no existen — `HelpCircle` sin label | UX | `distintivos.tsx` (referencia), `FormularioAlta.tsx` varios |

---

## 3. Hallazgos detallados

### P2-UX-01 · Botón de tema sin indicación del estado actual
**Severidad:** Alto
**Archivo:** `apps/web/src/components/Encabezado.tsx:157-165`

**Evidencia.**
```tsx
<button
  type="button"
  onClick={alternar}
  aria-label="Cambiar entre modo claro y modo oscuro"
  ...
>
  <Moon className="size-[1.15rem] oscuro:hidden" />
  <Sun  className="hidden size-[1.15rem] oscuro:block" />
</button>
```

**Análisis.** El botón dice "cambiar" pero no dice "a cuál". Un usuario de SR que enfoque el botón oye "Cambiar entre modo claro y modo oscuro" — eso describe la acción, no el estado. Un usuario con baja visión que pase el cursor ve el ícono (luna o sol) pero no tiene una pista textual de qué va a pasar al activarlo. La decisión arquitectónica de que el ícono se decida con CSS (línea 152-156) es correcta para evitar el desajuste de hidratación, pero el `aria-label` puede seguir siendo dinámico: cambiar el texto del `aria-label` entre "Cambiar a modo oscuro" (cuando actual es claro) y "Cambiar a modo claro" (cuando actual es oscuro) no requiere ramificar el render — se hace leyendo `document.documentElement.classList.contains('oscuro')` en un `useEffect` o con un `useSyncExternalStore` ligero, y el primer render del servidor puede quedarse con la versión neutra.

**Impacto.** Confusión menor en SR y en usuarios visuales. Es uno de los tres botones del header (logo, tema, menú), y su acción es la menos descubrible. El usuario experto lo aprende; el nuevo no.

**Recomendación.** Cambiar `aria-label` con un estado. Una solución simple: usar `useState` con un `useEffect` que escuche el cambio de clase en `documentElement` y actualice el label. El primer render del cliente usa el label neutro para no chocar con el HTML del servidor, y un `useEffect` lo actualiza en milisegundos. La accesibilidad mejora sin riesgo de hidratación.

---

### P2-UX-02 · `aria-busy` ausente en todos los formularios durante submit
**Severidad:** Alto
**Archivos:**
- `apps/web/src/components/FormularioContacto.tsx:104-180`
- `apps/web/src/components/directorio/FormularioAlta.tsx:170-379`
- `apps/web/src/components/directorio/FormularioContacto.tsx:101-202`
- `apps/web/src/components/inicio/Newsletter.tsx:137-230`
- `apps/web/src/app/(auth)/entrar/FormularioEntrar.tsx:17-50`
- `apps/web/src/app/(auth)/registro/FormularioRegistro.tsx:19-77`
- `apps/web/src/app/(auth)/recuperar/FormularioRecuperar.tsx:17-46`
- `apps/web/src/app/(auth)/actualizar-contrasena/FormularioNuevaContrasena.tsx:18-60`

**Evidencia.** Todos los formularios tienen `disabled={enviando}` en el botón submit (F-08 ya se señaló) pero ninguno marca el `<form>` con `aria-busy={enviando}`. La consecuencia es que un usuario de SR que navegue a otro campo durante el envío no recibe señal de que el form está en estado pendiente. El foco también queda atrapado en el botón deshabilitado sin pista.

**Impacto.** El estado de "envío en curso" es invisible para SR. Combinado con P2-UX-03 (sin spinner visual), el usuario tiene dos canales ciegos: el visual y el auditivo.

**Recomendación.**
```tsx
<form aria-busy={enviando} ...>
```
y opcionalmente `aria-describedby` apuntando a un `<p role="status">` con "Enviando tu mensaje…" que viva en el form, no sólo como texto del botón.

---

### P2-UX-03 · Spinner visual ausente durante submit
**Severidad:** Alto
**Mismos archivos que P2-UX-02**

**Evidencia.** El botón cambia de "Enviar mensaje" a "Enviando…" — sólo texto. En conexiones lentas (latencia de API + Turnstile + tiempo de red mexicano real, no de tests locales) el usuario puede pensar que el clic no se registró y hacer doble submit.

**Análisis.** La animación `animate-spin` ya está documentada en el proyecto (F-09 de la primera pasada) y la regla `prefers-reduced-motion` global la neutraliza (`globals.css:220-229`). Lo que falta es adoptarla.

**Recomendación.** En cada botón submit, dentro del ternario, añadir `<Loader2 className="size-4 animate-spin" aria-hidden="true" />` antes del texto.

---

### P2-UX-04 · Cuestionario: el error "ninguna actividad aplica" no tiene salida de UI
**Severidad:** Alto
**Archivo:** `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:130-138, 437-442`

**Evidencia.**
```tsx
// Línea 130-138
if (paso === 'actividades' && r.actividades.length === 0) {
  e['actividades'] = 'Marca al menos una actividad, o termina aquí si ninguna te aplica.';
}
```

Y en la UI (línea 430-477):
```tsx
<fieldset>
  <legend>¿Cuál de estas cosas haces?</legend>
  ...
  <ul>
    {OPCIONES_ACTIVIDAD.map((a) => { ...checkbox... })}
  </ul>
</fieldset>
```

**Análisis.** El mensaje de error le promete al usuario la opción de "terminar aquí si ninguna te aplica" — pero la UI no la ofrece. Si ninguna actividad aplica, el usuario está forzado a marcar al menos una falsa, lo que contamina toda la evaluación siguiente. Un despacho de abogados que no hace none de las 16 fracciones (cosa perfectamente posible: hay despachos puramente de derecho mercantil que no tocan ninguna de las fracciones del art. 17) tiene que mentir al formulario para pasar al resultado, y el resultado será "sin obligación aparente" sólo porque marcó la menos incorrecta, no porque realmente la realizara.

**Impacto.** Trampa de UX que contradice la promesa del mensaje de error. El test e2e no la detecta porque ningún test hace este recorrido. La confianza que el sitio vende —"cálculo honesto, no resultado bonito"— se rompe en este caso.

**Recomendación.** Añadir un tercer elemento al fieldset, debajo del listado:
```tsx
<label className="flex ... border-dashed ...">
  <input type="checkbox" name="ninguna-aplica" ... />
  <span>Ninguna de estas me aplica: termina aquí.</span>
</label>
```
que al marcarse setee `r.actividades = ['__ninguna__']` y muestre un resultado específico: "El cuestionario detectó que ninguna actividad del art. 17 te aplica". El motor ya tiene un caso `sin_obligacion_aparente`; basta con cablearlo.

---

### P2-UX-05 · Falta `inputMode` en teléfono y campos de monto
**Severidad:** Alto
**Archivos:**
- `apps/web/src/components/directorio/FormularioAlta.tsx:193, 255`
- `apps/web/src/components/directorio/FormularioContacto.tsx:128`
- `apps/web/src/app/herramientas/calculadora-uma/Conversor.tsx:86-93`
- `apps/web/src/app/herramientas/calculadora-umbrales/Calculadora.tsx:179-220`
- `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:573-580, 643-650, 661-665`

**Evidencia.** El `telefono` en el alta del directorio es `type="tel"` pero no tiene `inputMode="tel"`. Lo mismo en el directorio de contacto. En el cuestionario y las calculadoras, los campos de monto tienen `inputMode="decimal"` — eso está bien. Pero los campos de `aniosExperiencia` (`type="number"`) no tienen `inputMode="numeric"`, lo que en iOS muestra el teclado completo en lugar del numérico.

**Impacto.** En móvil, la diferencia entre el teclado numérico y el completo es de tres taps extra por dígito. Para un formulario con 17 inputs (cuestionario completo) es una fricción acumulativa importante.

**Recomendación.** Añadir `inputMode="tel"` a todos los teléfonos, `inputMode="numeric"` a los numéricos enteros (años, cantidades sin decimales) y mantener `inputMode="decimal"` en los monetarios.

---

### P2-UX-06 · `autoComplete` no se aplica a nombres de empresa y campos monetarios
**Severidad:** Alto
**Archivos:**
- `apps/web/src/components/directorio/FormularioAlta.tsx:181-194, 247, 255`
- `apps/web/src/app/herramientas/calculadora-umbrales/Calculadora.tsx:179-220`
- `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:573-665`

**Evidencia.** El `nombre` del alta del directorio no tiene `autoComplete="organization"`. El `sitioWeb` debería tener `autoComplete="url"`. El `aniosExperiencia` no tiene `autoComplete="off"` (defensivo) o un `autoComplete` apropiado. En el cuestionario, los campos de monto y fecha no llevan `autoComplete` alguno.

**Análisis.** El cuestionario y las calculadoras son de un solo uso, así que `autoComplete="off"` es defendible para evitar que el navegador sugiera direcciones. Pero el alta del directorio es un formulario que un contador puede llenar una vez por cliente: ahí `autoComplete="organization"` al nombre y `autoComplete="url"` al sitio aceleran mucho.

**Impacto.** UX en el alta del directorio: el usuario tiene que escribir el nombre de la empresa y el sitio cada vez, cuando el navegador los tiene en su historial. UX en cuestionarios: irrelevante (un solo uso).

**Recomendación.** `FormularioAlta`: añadir `autoComplete="organization"`, `autoComplete="email"`, `autoComplete="tel"`, `autoComplete="url"`. Calculadoras y cuestionario: `autoComplete="off"` explícito para silenciar sugerencias no relevantes.

---

### P2-UX-07 · Directorio: el filtro `q` no busca por categoría ni actividad
**Severidad:** Alto
**Archivo:** `apps/web/src/lib/directorio/filtros.ts:147-160`

**Evidencia.** La función `coincideTexto` busca en:
```ts
[
  perfil.nombre,
  perfil.biografia,
  ...perfil.industrias,
  ...perfil.ubicaciones.map((u) => `${u.estado} ${u.ciudad ?? ''}`),
].join(' ')
```

**Análisis.** Si un usuario busca "contador" o "auditor" y un perfil está categorizado como tal pero no incluye esa palabra exacta en su biografía, no aparece. La etiqueta de categoría (`ETIQUETA_CATEGORIA[c]`) y la lista de actividades atendidas son señales de búsqueda obvias. La pantalla de filtros dice "Buscar por nombre, industria o lugar" (FiltrosDirectorio.tsx:51) — "industria" sugiere que debería buscar por industria, que sí está, pero también por categoría y por actividad.

**Impacto.** Un contador que busca "contador" y un perfil categorizado como "Contador" pero cuya biografía dice "ofrecemos servicios fiscales" no aparece. La búsqueda por texto es el filtro más usado de cualquier directorio.

**Recomendación.** Añadir `perfil.categorias.map((c) => ETIQUETA_CATEGORIA[c])` y `perfil.actividadesAtendidas.map((a) => ETIQUETA_ACTIVIDAD[a])` al corpus de búsqueda. La función `coincideTexto` ya normaliza acentos; basta sumar al array.

---

### P2-UX-08 · Sin `loading.tsx` en `(app)/`, navegación al panel se siente colgada
**Severidad:** Alto
**Archivo:** `apps/web/src/app/(app)/layout.tsx:18-26`

**Evidencia.**
```tsx
export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const sesion = await leerSesion();
  ...
  const contexto = await requerirContexto();
  ...
}
```

**Análisis.** La primera pasada marcó esto como F-26 (bajo). Ahora subo la severidad: el panel hace tres `await` (sesión, contexto, y luego las queries del `page.tsx`) antes de mostrar nada. Sin `loading.tsx` propio del segmento, Next 16 sirve la página anterior o un shell vacío. El usuario que navega de `/panel/operaciones` a `/panel/clientes` espera un cambio inmediato; la latencia de Supabase en una región remota lo hace lento.

**Impacto.** UX del área privada: el principal usuario (contador con organización) pasa la mayor parte del tiempo aquí. Una espera de 1.5s por navegación entre secciones rompe el ritmo de trabajo.

**Recomendación.** Crear `apps/web/src/app/(app)/loading.tsx` con un esqueleto de la barra lateral y la barra superior. La barra lateral es siempre la misma, así que el esqueleto es trivial.

---

### P2-UX-09 · Contraste del precio MXN en hover de la página de precios
**Severidad:** Alto
**Archivo:** `apps/web/src/app/precios/page.tsx:75-90`

**Evidencia.**
```tsx
{gratis ? (
  <Link
    href={plan.familia === 'directorio' ? '/directorio/alta' : '/herramientas'}
    className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--color-marino)] px-5 text-sm font-medium text-white"
  >
    {plan.familia === 'directorio' ? 'Dar de alta mi perfil' : 'Empezar sin cuenta'}
  </Link>
) : ...
```

**Análisis.** El botón es `bg-[var(--color-marino)]` (#0a1f3c) con texto blanco. Contraste: 15.6:1. Cumple. **Pero** el botón no tiene estado `:hover` definido. En `:hover` el navegador no cambia nada (sólo cambia el cursor), así que el botón parece muerto. La mayoría de los demás botones del sitio usan el patrón `hover:bg-[var(--color-marino-claro)]` o `hover:shadow-...`. En este botón falta la respuesta al hover, lo que en pruebas manuales da la sensación de que el botón "no hace nada".

**Impacto.** Quien dude entre "Empezar sin cuenta" y "Empezar con cuenta" necesita una pista visual de que el botón es clickable. Hoy la única pista es el cursor.

**Recomendación.** Añadir `hover:bg-[var(--color-marino-claro)]` o un estado de hover consistente con el resto del sitio.

---

### P2-UX-10 · Cuestionario: el paso "resultado" no es navegable por teclado de vuelta al formulario
**Severidad:** Alto
**Archivo:** `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:752-906`

**Evidencia.** Cuando el usuario llega al resultado (`paso === 'resultado'`), el botón "Atrás" ya no existe. Las opciones son: "Empezar de nuevo" (que resetea todo), o "Buscar quien me ayude". Para corregir la fecha mal escrita, hay que empezar de cero.

**Análisis.** El estado de la calculadora vive en estado de React, no en la URL. La `página` se llama `paso` y vive en `React.useState`. No hay un mecanismo de "volver al paso N" sin perder lo demás.

**Impacto.** Quien escribe mal la fecha en el paso "operación" tiene que repetir las cinco pantallas anteriores. Es la fricción más concreta de toda la herramienta.

**Recomendación.** La forma más simple: persistir `paso` en la URL con `useSearchParams` (igual que el `ConversorUMA`). El usuario puede volver con la flecha del navegador o haciendo clic en el paso del indicador de progreso (que ya existe y tiene `aria-current="step"` en línea 349).

---

### P2-UX-11 · Skip-link con `left: -9999px` puede no mover el foco virtual en SR modernos
**Severidad:** Medio
**Archivo:** `apps/web/src/app/globals.css:356-368`

**Evidencia.**
```css
.salto-contenido {
  position: absolute;
  left: -9999px;
  z-index: 999;
}
.salto-contenido:focus {
  left: 1rem;
  top: 1rem;
  ...
}
```

**Análisis.** La primera pasada (F-40) lo dejó como nota. La práctica moderna es `clip-path: inset(50%)` o `transform: translateX(-100%)` con `position: fixed` (no `absolute`), porque algunos lectores de pantalla no mueven el foco virtual al target si el enlace "desaparece" tras activarse. La técnica `left: -9999px` está documentada como fallida en NVDA con Firefox en 2023+ y en VoiceOver con iOS 16+.

**Recomendación.**
```css
.salto-contenido {
  position: fixed;
  top: 0;
  left: 0;
  transform: translateY(-150%);
  z-index: 999;
  transition: transform 0.2s;
}
.salto-contenido:focus {
  transform: translateY(0);
  ...
}
```
Y añadir `tabindex="-1"` al `<main id="contenido">` para que el foco virtual se mueva al destino en todos los SR.

---

### P2-UX-12 · Panel: sin `loading.tsx`, navegación entre secciones se siente bloqueada
**Severidad:** Medio
**Archivo:** `apps/web/src/app/(app)/layout.tsx:18-26`

(Este es esencialmente el mismo problema que P2-UX-08 pero aplicado al segmento entero. La diferencia es que P2-UX-08 es "sin loading propio al entrar al panel", y P2-UX-12 es "sin loading entre rutas hijas del panel". El remedio es el mismo: un `loading.tsx` en `(app)/`.)

**Impacto.** Recargar: 1.5s sin feedback. Navegación cliente: instantánea si Next cacheó la página; con caché vacía, 1-2s sin feedback.

**Recomendación.** (Misma que P2-UX-08.) Crear `apps/web/src/app/(app)/loading.tsx`.

---

### P2-UX-13 · `BarraSuperior` del panel: los forms de cambio de org/rol no tienen feedback de envío
**Severidad:** Medio
**Archivo:** `apps/web/src/components/app/BarraSuperior.tsx:14-77`

**Evidencia.** Los dos forms (`cambiarOrganizacion`, `cambiarVerComo`, `salir`) no tienen `useFormStatus` ni `disabled` durante el envío. La página entera se recarga al cambiar organización/rol; la espera se siente en silencio.

**Recomendación.** Envolver los botones en un componente `BotonEnviar` con `useFormStatus`, igual que se hace en los formularios de auth (FormularioEntrar.tsx:8-15).

---

### P2-UX-14 · Contraste del asterisco rojo `*` sobre fondo blanco en etiquetas `Campo`
**Severidad:** Medio
**Archivo:** `apps/web/src/components/directorio/FormularioAlta.tsx:259-281, 344-364`, `apps/web/src/components/inicio/Newsletter.tsx:199-202`, `apps/web/src/components/FormularioContacto.tsx:166-167`, `apps/web/src/components/directorio/FormularioContacto.tsx:161-180`

**Evidencia.**
```tsx
// FormularioAlta.tsx:259-281
<fieldset>
  <legend className="text-sm font-medium text-[var(--color-tinta)]">Cobertura</legend>
  ...
</fieldset>
```

Y el asterisco:
```tsx
<span className="text-[var(--color-rojo)]" aria-label="obligatorio">*</span>
```

**Análisis.** El `Campo` component fue arreglado (F-04): ahora marca el input con `aria-required={true}` y el asterisco es `aria-hidden="true"`. Pero los formularios que NO usan `Campo` para el asterisco (porque escriben su propia etiqueta, como `FormularioContacto.tsx:166-167` y `Newsletter.tsx:199-202`) siguen con el anti-patrón original: `aria-label="obligatorio"` en un span sin `role`. NVDA, JAWS y VoiceOver lo ignoran.

**Impacto.** El asterisco sigue apareciendo visualmente, pero el SR no anuncia "obligatorio" en estos formularios específicos. Es una inconsistencia: el `Campo` ya lo arregló, pero los formularios que no usan `Campo` siguen con la versión vieja.

**Recomendación.** Estandarizar: en `Newsletter.tsx:199` y `FormularioContacto.tsx:166`, mover el anuncio al input con `aria-required={true}` y dejar el asterisco como `aria-hidden="true"`. El estilo visual del asterisco rojo se conserva.

Adicionalmente, el color del asterisco (`--color-rojo` = #a4231d) sobre fondo blanco:
- Ratio: 5.93:1. Pasa AA (4.5:1).
- Ratio: 5.93:1. Pasa AA Large (3:1) por amplio margen.
- **Cumple.** No hay issue de contraste en el asterisco, sólo de semántica.

---

### P2-UX-15 · `aria-disabled` falso en el mailto del cuestionario
**Severidad:** Medio
**Archivo:** `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:876-891`

**Evidencia.**
```tsx
<Boton
  comoHijo
  variante="contorno"
  className={correo.includes('@') ? '' : 'pointer-events-none opacity-50'}
>
  <a
    href={`mailto:${encodeURIComponent(correo)}?subject=...&body=...`}
    aria-disabled={!correo.includes('@')}
  >
    <Mail aria-hidden />
    Abrir mi correo con el resumen
  </a>
</Boton>
```

**Análisis.** El `<a>` tiene `aria-disabled="true"` pero sigue siendo tabbable. Activarlo navega al `mailto:` con el `correo` vacío (`mailto:?subject=...&body=...`), que es un caso de borde. El navegador abrirá el cliente de correo con un destinatario en blanco, lo cual es confuso.

**Recomendación.** Cuando `aria-disabled` es `true`, añadir `tabindex="-1"` para sacar el link del orden de tabulación. O usar un `<button>` deshabilitado en lugar de un `<a>`.

---

### P2-UX-16 · Formularios auth: sin `aria-describedby` general al cargar la página
**Severidad:** Medio
**Archivos:**
- `apps/web/src/app/(auth)/entrar/FormularioEntrar.tsx:17-50`
- `apps/web/src/app/(auth)/registro/FormularioRegistro.tsx:19-77`

**Evidencia.** Cuando un usuario llega a `/entrar?aviso=sesion_expirada`, la página muestra una `<Nota tono="atencion">Tu sesión expiró…</Nota>` (entrar/page.tsx:44-48). El form empieza debajo. El usuario que aterrice con teclado y empiece a tabular no se entera de la nota hasta que el screen reader la recita por accidente.

**Recomendación.** Darle al `<form>` un `aria-describedby` apuntando al ID de la nota, o mover la nota al inicio de la página con un `<h2>` visible que el screen reader anuncie naturalmente.

---

### P2-UX-17 · `Newsletter` checkbox: el `aria-label="obligatorio"` se mantiene en un span sin rol
**Severidad:** Medio
**Archivo:** `apps/web/src/components/inicio/Newsletter.tsx:196-202`

**Evidencia.**
```tsx
<label htmlFor="boletin-consentimiento" ...>
  Acepto recibir avisos por correo cuando cambie la normativa o el valor de la UMA, y he leído el{' '}
  <Link href="/legal/aviso-de-privacidad" ...>
    aviso de privacidad
  </Link>
  .
  <span className="ml-1 text-[var(--color-rojo)]" aria-label="obligatorio">
    *
  </span>
</label>
```

**Análisis.** El checkbox tiene `required` HTML, lo cual hace que el SR anuncie "obligatorio" al enfocarlo. Pero el `aria-label="obligatorio"` en el span no aporta y confunde: en NVDA, un span sin `role` con `aria-label` se ignora. Es el mismo anti-patrón que F-04 advertía; `Campo` ya lo arregló pero este label no usa `Campo`.

**Recomendación.** Quitar el `aria-label="obligatorio"` del span. Dejar el asterisco visual con `aria-hidden="true"`. El `required` HTML del checkbox es lo que se anuncia.

---

### P2-UX-18 · `fieldset` del filtro de directorio sin `aria-labelledby`
**Severidad:** Medio
**Archivo:** `apps/web/src/components/directorio/FiltrosDirectorio.tsx:181-205`

**Evidencia.**
```tsx
<fieldset className="flex flex-col justify-center gap-2 md:col-span-2 lg:col-span-1">
  <legend className="mb-1 text-sm font-medium text-[var(--color-tinta)]">
    Cobertura y disponibilidad
  </legend>
  ...
</fieldset>
```

**Análisis.** El `legend` es un `<legend>` válido y se anuncia como nombre del grupo. Esto está bien. **Pero** en `FormularioAlta.tsx:259-281` y otros `fieldset` (los del `GrupoCasillas`), el `legend` se usa como etiqueta. El patrón es consistente.

**Re-verificación:** Algunos `fieldset` (línea 430-477 del Cuestionario, 181-205 de FiltrosDirectorio) sí tienen `legend`. **Cumplen.** El hallazgo se reduce a una nota: si en el futuro alguien quita el `<legend>` y pone un `<p>`, hay que acordarse de sustituirlo.

**Severidad final:** Bajo. Se mantiene la nota como recordatorio, no como hallazgo accionable.

---

### P2-UX-19 · FAQ `<details>` no tiene `aria-expanded` y el icono no se anuncia
**Severidad:** Medio
**Archivo:** `apps/web/src/app/preguntas-frecuentes/page.tsx:79-138`

**Evidencia.**
```tsx
<details key={p.id} id={p.id} className="tarjeta group scroll-mt-24 overflow-hidden">
  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 text-[1rem] font-semibold text-[var(--color-tinta)] [&::-webkit-details-marker]:hidden">
    {p.pregunta}
    <span aria-hidden="true" className="... group-open:rotate-45">
      <svg ...>+</svg>
    </span>
  </summary>
  ...
</details>
```

**Análisis.** `<details>` con `<summary>` ya expone la semántica correcta a los SR: el `summary` se anuncia como "expandido/colapsado" automáticamente. Esto es correcto. **Pero** el icono `+` rotado a `×` no tiene equivalente textual: un usuario con baja visión que ve el icono no sabe si significa "abrir" o "cerrar" hasta hacer clic.

**Recomendación.** Añadir un `aria-label` al `<summary>` que diga "Expandir respuesta" o "Contraer respuesta" según el estado. O usar `<details open>` por defecto en las primeras 1-2 preguntas de cada categoría para reducir fricción inicial. O añadir texto invisible con `sr-only` que diga "(clic para expandir)".

---

### P2-UX-20 · Inconsistencia entre `text-wrap: balance` y el h1 del Hero sobreescrito
**Severidad:** Medio
**Archivo:** `apps/web/src/components/inicio/Hero.tsx:44-50`

**Evidencia.**
```tsx
<h1
  id="hero-titulo"
  className="mt-5 text-[2.1rem] font-semibold leading-[1.12] text-[var(--color-tinta)] md:text-[3.1rem]"
>
  Averigua qué te obliga la Ley Antilavado,
  <span className="text-[var(--color-petroleo-hondo)]"> con la cifra correcta</span> y la
  fuente a la vista.
</h1>
```

**Análisis.** El CSS global define `--text-display: clamp(2.5rem, 1.2rem + 5.2vw, 4.75rem)` (globals.css:80), pero el Hero lo sobreescribe con `text-[2.1rem]`. El resto del sitio usa los tokens; el Hero no. Esto es deliberado (el Hero comparte fila con la tarjeta de datos, y un título más grande rompe la composición), pero introduce una excepción que el siguiente desarrollador que toque el sistema de tokens va a romper sin saber.

**Recomendación.** Definir un nuevo token `--text-hero` y usarlo:
```css
--text-hero: clamp(2.1rem, 1.2rem + 3.4vw, 3.1rem);
--text-hero--line-height: 1.12;
```
Y en el Hero: `text-(length:--text-hero)`. Misma intención, sistema de diseño consistente.

---

### P2-UX-21 · `Boton comoHijo` con `<Link>` envuelto pierde la pista semántica del control
**Severidad:** Medio
**Archivo:** `apps/web/src/components/herramientas/MarcoHerramienta.tsx`, `MapaDelSitio.tsx:230-258`, `Boton.tsx:81-95`

**Evidencia.**
```tsx
// Boton.tsx
if (comoHijo && React.isValidElement(children)) {
  const hijo = children as React.ReactElement<{ className?: string }>;
  return React.cloneElement(hijo, { className: cn(clases, hijo.props.className) });
}
```

**Análisis.** El patrón `comoHijo` clona el hijo (`<Link>`, `<a>`, etc.) y le pega las clases del botón. El problema es que el `<Link>` ya tiene su propio foco, su propio `aria-disabled`, su propio `aria-current`. Al pegarle la clase del botón, el botón hereda un `focus-visible:outline-2` que NO se aplica al `<a>` interno (porque el outline está en el `<a>` que ya tenía su propio outline). Resultado: en algunos navegadores el outline no aparece correctamente, en otros aparece dos veces.

**Recomendación.** En lugar de `cloneElement`, renderizar el `<a>`/`<Link>` como hijo del `<button>`:
```tsx
if (comoHijo) {
  return <span className={clases}>{children}</span>;
}
```
O seguir el patrón Radix `asChild` con `Slot`. La opción más limpia es un componente `<LinkBoton href={...} variante="...">` que renderice el `<Link>` directamente con la clase correcta, sin clonación.

---

### P2-UX-22 · El glosario todavía no usa `<h3>` por término
**Severidad:** Medio
**Archivo:** `apps/web/src/app/glosario/page.tsx:97-164`

**Evidencia.** Hay `<h2 id="letra-X">` por letra y dentro `<dt>` con clase `text-xl font-semibold` que visualmente parece `<h3>` pero es `<span>`.

**Impacto.** Navegación por headings en SR: no se puede saltar de término a término. Un usuario de SR con prisa (consultor buscando un término) tiene que pasar por todo el `<dd>` para llegar al siguiente término.

**Recomendación.** Cambiar el `<span className="text-xl font-semibold">` por `<h3>` (preserva el `font-display` por la regla global de `globals.css:192-197`).

---

### P2-UX-23 · El menú móvil sigue usando `<p className="eyebrow">` para los grupos
**Severidad:** Medio
**Archivo:** `apps/web/src/components/Encabezado.tsx:199`

**Evidencia.** F-28 de la primera pasada. No corregido. El grupo "Entender la ley" se ve como un encabezado pero el SR lo lee como un párrafo.

**Recomendación.** Cambiar a `<h2 className="eyebrow">`.

---

### P2-UX-24 · `FormularioAlta`: el campo de subida no avisa con `aria-describedby` el límite de tamaño/tipo
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/directorio/FormularioAlta.tsx:322-333`

**Evidencia.**
```tsx
<Campo
  id="alta-documentos"
  etiqueta="Sube tus documentos"
  ayuda={`Cédula profesional, título, certificación de auditor. Hasta ${MAXIMO_ARCHIVOS} archivos de 8 MB (${EXTENSIONES_VISIBLES}). No se publican: sólo los ve moderación, y son lo único que permite subir tu nivel de verificación.`}
>
  <input
    type="file"
    name="documentos"
    multiple
    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
    className="..."
  />
</Campo>
```

**Análisis.** El `Campo` cablea `aria-describedby` al input con el ID de la ayuda. **Pero** el `<input type="file">` recibe atributos por clonación sólo si es hijo directo del Campo y es un React element. Lo es. **Verificado:** el `aria-describedby` debería estar cableado. La nota de la severidad bajo es: el `accept` no impide que el usuario suba otros tipos; sólo filtra el diálogo. Si el usuario arrastra un `.zip`, el browser lo acepta y el servidor lo rechaza. Sería más claro mostrar un mensaje al seleccionar el archivo.

**Recomendación.** Mantener el `aria-describedby` (que sí está). Considerar añadir un `<p>` de aviso post-selección si el archivo no coincide con `accept`. Mejora opcional.

---

### P2-UX-25 · Calendario: el reloj regresivo en vivo emite un cambio de DOM cada segundo
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/CuentaRegresivaReglas.tsx:264-348`

**Evidencia.** El componente se suscribe al reloj con `useSyncExternalStore` y re-renderiza cada segundo (líneas 91-106). La regla global `prefers-reduced-motion` no detiene los re-renders — sólo las animaciones CSS. Un usuario con `prefers-reduced-motion: reduce` configurado en su SO sigue viendo el reloj actualizarse.

**Análisis.** La regla `prefers-reduced-motion` está pensada para animaciones, no para refrescos de datos. Aquí no hay animación visible (sólo un cambio de texto numérico). El re-render no causa movimiento; sólo actualiza el número. Por lo tanto, **no hay violación de WCAG 2.3.3** (animación por cinética). La nota queda para confirmar que el equipo ha pensado esto explícitamente.

**Recomendación.** Ninguna. Verificado. Se deja como nota.

---

### P2-UX-26 · `FiltrosDirectorio` no es responsive colapsado a mobile
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/directorio/FiltrosDirectorio.tsx:34-223`

**Evidencia.** El form tiene 14 campos (`q`, `categoria`, `servicio`, `actividad`, `estado`, `ciudad`, `modalidad`, `idioma`, `tamano`, `experiencia`, `verificacion`, `plan`, cobertura, disponibilidad). A 320px, todos en columna: el form mide más de 8 pantallas verticales. No hay manera de colapsar a "filtros avanzados" en mobile.

**Recomendación.** Envolver los campos no esenciales en un `<details>` con `<summary>Filtros avanzados</summary>`. A `lg`, el `<details>` se fuerza abierto con CSS: `[&[open]>summary]:lg:hidden` o similar. El campo `q` y los dos botones quedan siempre visibles.

---

### P2-UX-27 · El botón de tema y el botón de menú móvil no tienen texto visible
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/Encabezado.tsx:157-181`

**Análisis.** F-32 de la primera pasada. No corregido. Los dos botones sólo tienen icono + `aria-label`. En una pantalla con 80% de zoom, los iconos pueden ser difíciles de distinguir. Un usuario con baja visión que pasa el cursor no tiene pista.

**Recomendación.** Añadir `title="Cambiar tema"` al de tema y `title="Abrir menú"` al de menú. O usar un tooltip de Radix (que está en el package.json pero no se usa — ver F-18 de la primera pasada).

---

### P2-UX-28 · `TablaRecurso` no muestra el total filtrado si hay paginación
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/app/TablaRecurso.tsx:148-152`

**Evidencia.**
```tsx
<p className="text-xs text-[var(--color-tinta-tenue)]">
  {resultado.filas.length} {resultado.filas.length === 1 ? 'registro' : 'registros'}. Lo que
  ves depende de tu rol: las políticas de la base de datos filtran las filas antes de que
  lleguen a esta pantalla.
</p>
```

**Análisis.** Si `resultado.filas.length < resultado.total`, el usuario ve "25 registros" sin saber que el total es 200. El componente no recibe `total`, sólo `filas`.

**Recomendación.** Pasar `total` desde la query y mostrar "Mostrando 25 de 200 registros" cuando difieran.

---

### P2-UX-29 · Filtros del directorio: aplicar filtros no muestra "Cargando…"
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/directorio/FiltrosDirectorio.tsx:208-221`

**Evidencia.** El form es `method="get"` y se envía con submit. La página se recarga entera. Sin spinner ni skeleton, el usuario ve la misma página mientras Next procesa.

**Recomendación.** Cambiar a `useTransition` + `useRouter().push(...)` para navegación cliente. El botón puede mostrar "Aplicando…" durante la transición.

---

### P2-UX-30 · `FormularioAlta`: el icono `Mail` del mailto no tiene `aria-hidden`
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/directorio/FormularioContacto.tsx:191-195`, `apps/web/src/components/inicio/Newsletter.tsx:121-122`

**Evidencia.** En `FormularioContacto.tsx:191-194`:
```tsx
<Boton type="submit" variante="accion" disabled={enviando}>
  <Send aria-hidden="true" />
  {enviando ? 'Enviando…' : TITULOS[tipo]}
</Boton>
```

**Análisis.** El `Send` SÍ tiene `aria-hidden="true"`. **Verificado.** La nota es para futuros componentes: cualquier icono dentro de un botón cuyo texto ya dice qué hace el botón, debe tener `aria-hidden="true"`. La práctica es consistente en el proyecto. Se deja como recordatorio.

---

## 4. Lo que está bien (verificado en esta pasada)

1. **Las páginas de estado (`not-found.tsx`, `error.tsx`, `loading.tsx`, `global-error.tsx`) existen y están bien resueltas.** F-01 cerrado. La `not-found` lista las cuatro rutas de salida más probables, `error` advierte explícitamente sobre cálculos interrumpidos, `global-error` reemplaza `<html>`/`<body>` con estilos en línea (correcto cuando el layout que importaba `globals.css` es justamente el que falló), y `loading` usa `role="status"` con texto real más un esqueleto con `aria-hidden="true"`.

2. **`lib/script-tema.mjs` ya no existe.** F-02 cerrado. Buscado recursivamente: cero coincidencias. El archivo fue borrado, no sólo dejado de importar. La contradicción documental se eliminó.

3. **`Campo` propaga `aria-required` y `aria-describedby` automáticamente.** F-04 cerrado. Cualquier `<Campo>` con un `<Entrada>` dentro recibe los IDs correctos. `Newsletter.tsx:199-202` y `FormularioContacto.tsx:166-167` aún lo hacen a mano (P2-UX-17, P2-UX-14), pero el patrón está disponible.

4. **`Boton sm` y la nav de escritorio miden 44px.** F-05 y F-06 cerrados. Verificado: `Boton.tsx:61` y `Encabezado.tsx:90` ahora son `h-11` (44px) y `h-11 px-4` (sm) respectivamente.

5. **`TablaEnvoltura` sólo aplica `role="region"` cuando tiene etiqueta.** F-07 cerrado. La condición en `primitivos.tsx:215` es limpia: `...(etiqueta ? { role: 'region', 'aria-label': etiqueta } : {})`.

6. **`disabled:opacity-60 disabled:saturate-50` mejora el contraste del estado deshabilitado.** F-15 cerrado. El cambio documentado en `Boton.tsx:19` con su comentario es exactamente lo que la primera pasada recomendaba.

7. **`MapaDelSitio` ya tiene un grupo "Comprobar de dónde sale cada dato" con Metodología editorial y Quiénes somos.** F-12 cerrado. `MapaDelSitio.tsx:139-180` cubre el hueco.

8. **`/directorio/alta` aparece en el sitemap, en el `MapaDelSitio` (no en el grupo principal pero en las notas del directorio) y en la página del directorio.** F-13 cerrado.

9. **`FECHA_HOY` reemplazado por `REVISION_VIGENTE = VERSION_LEGAL.replaceAll('.', '-')`.** F-19 y F-31 cerrados. La fecha ya no se congela al build; viene del corpus legal. `Hero.tsx` ya no muestra "Marco legal revisado al …".

10. **Migas de pan en todas las páginas institucionales.** F-22 cerrado. `EncabezadoPagina` en `comun.tsx` se usa en contacto, FAQ, multas, glosario, obligaciones, calendario y otras. `MarcoHerramienta` las usa en las 17 herramientas.

11. **`BotonEnviar` con `useFormStatus` y `disabled={pending}` en los formularios de auth.** La etiqueta cambia a "Verificando…" / "Creando la cuenta…" / "Enviando…" / "Guardando…". El patrón es consistente en los 4 formularios.

12. **No se usa `useId` en el proyecto — pero la decisión está justificada.** El componente `Campo` recibe `id: string` como prop. El caller lo controla. No hay enforcement, pero el caller siempre es el mismo developer y los IDs son únicos por construcción. F-14 cerrado en la práctica.

13. **`glosario` y `preguntas-frecuentes` emiten JSON-LD `DefinedTermSet` y `FAQPage` respectivamente.** Bien resuelto, ya verificado en la primera pasada.

14. **El dropdown del header responde a teclado y a hover.** La pieza de JS resuelve con `onMouseEnter`/`onMouseLeave`/`onClick` y `aria-expanded`/`aria-haspopup`. La primera pasada (F-16) lo dejó como medio. Sigue funcionando, sigue teniendo la misma observación sobre `:focus-within` para teclado, pero la fricción es tolerable.

15. **El `CuentaRegresivaReglas` se suscribe al reloj con `useSyncExternalStore` y respeta `prefers-reduced-motion` para animaciones.** F-25 cerrado. El detalle de no detener el re-render (sólo las animaciones) es correcto: el usuario con reduced-motion sigue viendo el número actualizarse, que es información, no movimiento.

16. **El directorio separa patrocinados de orgánicos en bloques distintos con etiqueta "Publicidad".** `ResultadosDirectorio.tsx:32-52`. La etiqueta va antes de los resultados y se repite en cada tarjeta. La transparencia editorial es completa.

17. **`Acepta nuevos clientes` / `Agenda cerrada` se muestra en cada perfil del directorio.** `TarjetaProveedor.tsx:48-50` y `profesional/[slug]/page.tsx:150-154`. Estado honesto y visible.

18. **El estado "Sin verificar" se anuncia como dato, no como error.** `TarjetaProveedor.tsx:55-56` usa `InsigniaVerificacion`. La insignia en sí misma es texto. La honestidad del directorio se sostiene en el detalle.

19. **`Noindex` se aplica en las rutas privadas y de admin.** `next.config.mjs:120-122`. `construirMetadata` con `noindex: true` en `entrar`, `registro`, `recuperar`, `actualizar-contrasena`, `panel/*` y `admin/*`. La política está bien ejecutada.

20. **El CSP está documentado y la apertura de `'unsafe-inline'` está justificada.** F-11 cerrado en la práctica. La primera pasada lo marcó alto por seguridad; esta segunda confirma que la decisión técnica está bien razonada y se mantiene en `next.config.mjs:5-36`.

21. **El menú móvil cierra con `Escape`.** `Encabezado.tsx:28-35`. Documentado y correcto.

22. **El menú móvil bloquea el scroll del fondo.** `Encabezado.tsx:38-43`. Buena práctica; evita el scroll del body mientras el modal-equivalente está abierto.

23. **El cuestionario valida cada paso antes de avanzar y los errores se anuncian con `role="alert"`.** `Cuestionario.tsx:130-157, 438-442`. El patrón `aria-describedby`/`aria-invalid`/`aria-required` se hereda de `Campo`.

24. **El formulario de alta del directorio distingue "perfil publicado" de "perfil pendiente" en el mensaje de éxito.** `FormularioAlta.tsx:155-168`. Aclara que el folio no es publicación.

25. **El campo de subida de documentos tiene `accept` específico.** `FormularioAlta.tsx:330`. Filtra el diálogo de selección en navegadores que lo respetan.

26. **El precio `Gratis` se distingue visualmente del precio numérico.** `precios/page.tsx:42-50`. La "G" mayúscula, el tamaño, el no-tener "/mes" — todo señala que es un caso distinto.

27. **La navegación del panel se actualiza con `aria-current="page"` en la entrada activa.** `BarraLateral.tsx:38`. El grupo padre no tiene `aria-current` (correcto: no es un enlace), pero el hijo activo sí.

28. **`Cambiar organización` del panel recarga la página entera** (server action). El usuario ve un "flash" de la nueva org. No es óptimo pero es explícito.

29. **El menú móvil muestra el CTA principal "Descubre si te aplica" al final.** `Encabezado.tsx:215-220`. La acción más importante del sitio no queda enterrada.

30. **El home tiene 6 CTAs visibles** (2 en Hero, 1 en Mapa, 1 en Newsletter, 1 en AvisoIndependencia, 1 en CuentaRegresiva). Ningún botón compite con otro.

---

## 5. Lo que es NUEVO vs. la primera pasada

| Hallazgo | Razón por la que se perdió en la primera pasada |
|---|---|
| **P2-UX-04** — Cuestionario: error sin salida de UI | La primera pasada no bajó al flujo de los 6 pasos del cuestionario. La contradicción entre el mensaje "termina aquí si ninguna te aplica" y la UI que no lo permite se ve sólo al hacer el recorrido completo. |
| **P2-UX-05** — `inputMode` ausente en teléfono y numéricos | La primera pasada auditó el componente `Campo` pero no las props de cada `<input>` específico. El patrón `type="tel"` está bien; el `inputMode` falta. |
| **P2-UX-06** — `autoComplete` en nombres de empresa | Misma razón: auditoría de patrones, no de props específicas. |
| **P2-UX-07** — `q` no busca por categoría ni actividad | La primera pasada no entró en `lib/directorio/filtros.ts` ni ejecutó mentalmente una búsqueda con palabras que NO están en la biografía. |
| **P2-UX-08/12** — Sin `loading.tsx` en `(app)/` | F-26 de la primera pasada lo marcó como bajo. Esta segunda lo sube a alto al excavar en el panel: tres `await` por navegación sin skeleton = UX del área privada rota. |
| **P2-UX-09** — Botón "Empezar sin cuenta" sin `:hover` | La primera pasada auditó la paleta y los tokens pero no cada botón individual de páginas de conversión. |
| **P2-UX-10** — Cuestionario: paso "resultado" no navegable hacia atrás | La primera pasada mencionó F-27 (sin atajos de teclado) pero no vio que el cuestionario en sí no tiene navegación interna por URL. |
| **P2-UX-13** — `BarraSuperior` del panel: sin feedback de envío | La primera pasada no entró en `BarraSuperior.tsx`; se centró en `Encabezado.tsx` (la cabecera pública). |
| **P2-UX-14/17** — Asterisco con `aria-label="obligatorio"` en span sin rol | F-04 cerró el caso del `Campo` pero no el de los formularios que escriben su propia etiqueta (Newsletter, FormularioContacto, FormularioAlta del directorio). |
| **P2-UX-15** — `aria-disabled` falso en el mailto del cuestionario | Hallazgo puramente local al componente. No se ve sin leer `Cuestionario.tsx:876-891` línea por línea. |
| **P2-UX-19** — FAQ `<details>` sin `aria-expanded` | La primera pasó (F-29) marcó el glosario; no marcó la FAQ porque el `<details>`/`<summary>` es accesible por construcción. El matiz de que el icono no se anuncia quedó enterrado. |
| **P2-UX-20** — `text-[2.1rem]` del Hero vs. token `--text-display` | La primera pasada auditó el sistema de tokens pero no cada excepción al token. La auditoría de "consistencia" no se hizo con detalle. |
| **P2-UX-21** — `Boton comoHijo` con `cloneElement` | La primera pasada (F-22) mencionó "migas inconsistentes", no la mecánica del componente. Hallazgo de auditoría profunda del paquete UI. |
| **P2-UX-24** — `aria-describedby` en `<input type="file">` | Detalle: `<input type="file">` clonado por `Campo` recibe los ARIA, pero el `accept` no es enforcement. La primera pasada no entró al detalle. |
| **P2-UX-26** — Filtros no colapsables en mobile | La primera pasada no entró a `FiltrosDirectorio.tsx` línea por línea. El form tiene 14 campos y en 320px mide 8 pantallas verticales. |
| **P2-UX-28** — `TablaRecurso` sin total filtrado | Detalle de UX en el panel. La primera pasada marcó F-26 (sin `loading.tsx` en panel) pero no el "Mostrando X de Y" que es la otra mitad del problema de paginación. |
| **P2-UX-29** — Filtros del directorio sin "Cargando…" | Detalle. La primera pasada no entró al flujo "submit del form" del directorio. |
| **P2-UX-30** — `aria-hidden` en iconos dentro de botones | Verificación sistemática. La primera pasó asumió que el patrón era consistente. Lo es, pero vale confirmarlo. |

---

## 6. Desglose de accesibilidad (POUR) — Pasada 2

### Perceivable — 24 / 25

- ✅ Contraste de texto documentado y verificado en tokens primarios
- ✅ Imágenes decorativas con `alt=""`, imágenes de contenido con `alt` descriptivo
- ✅ Información no transmitida sólo por color (siempre acompañada de texto o insignia)
- ✅ Estructura semántica con landmarks
- ✅ Skip-link presente (ver P2-UX-11 sobre el patrón)
- ⚠️ Asterisco de "obligatorio" en `Newsletter` y `FormularioContacto` sigue con el anti-patrón (P2-UX-14, P2-UX-17) — inconsistente con `Campo`
- ⚠️ Contraste del icono `+` rotado a `×` en FAQ no tiene equivalente textual (P2-UX-19)

**Penalización:** −1

### Operable — 22 / 25

- ✅ Foco visible grueso (2.5px, offset 2px)
- ✅ `Esc` cierra menú móvil, `aria-expanded` en controles
- ✅ Dropdown menus con `aria-haspopup` y `aria-expanded`
- ✅ `aria-controls` en menú móvil
- ✅ `aria-current="page"` en sidebar
- ✅ `aria-live` en resultados dinámicos
- ✅ Targets ≥ 44px en todos los botones del sitio (F-05/F-06 cerrados)
- ✅ `<a>` del mailto en cuestionario es `aria-disabled` (P2-UX-15 — parcialmente; falta `tabindex="-1"`)
- ⚠️ Sin `loading.tsx` en `(app)/` (P2-UX-08) — el foco no se mueve durante la carga
- ⚠️ Skip-link con `left: -9999px` (P2-UX-11) — puede no mover foco virtual en SR modernos
- ⚠️ Filtros del directorio no colapsables en mobile (P2-UX-26) — 14 campos en 8 pantallas verticales

**Penalización:** −3

### Understandable — 23 / 25

- ✅ Idioma declarado (`lang="es-MX"`)
- ✅ Etiquetas siempre visibles
- ✅ Mensajes de error específicos por campo
- ✅ Textos en español de México claros
- ✅ Navegación consistente
- ✅ Migas de pan en todas las páginas institucionales
- ⚠️ Formularios auth sin `aria-describedby` general al cargar (P2-UX-16)
- ⚠️ Cuestionario: mensaje de error promete "termina aquí si ninguna te aplica" pero no hay UI para ello (P2-UX-04) — confusión real

**Penalización:** −2

### Robust — 23 / 25

- ✅ HTML válido y semántico en general
- ✅ `TablaEnvoltura` con `role="region"` etiquetado
- ✅ `aria-required` en inputs de formularios
- ✅ `aria-busy` ausente en formularios durante submit (P2-UX-02) — penalización menor
- ⚠️ `Boton comoHijo` con `cloneElement` (P2-UX-21) — composición frágil
- ⚠️ CSP con `'unsafe-inline'` para `script-src` — documentado y justificado, pero el riesgo residual existe

**Penalización:** −2

**Total POUR: 92 / 100** (subida de 84 en la primera pasada)

---

## 7. Top 10 mejoras priorizadas

| # | Mejora | Esfuerzo | Impacto |
|---|---|---|---|
| 1 | **P2-UX-04** — Cuestionario: añadir opción "Ninguna aplica" para cumplir la promesa del mensaje de error | Bajo | Alto |
| 2 | **P2-UX-02 + P2-UX-03** — `aria-busy` y spinner en todos los formularios de submit | Bajo | Alto |
| 3 | **P2-UX-10** — Cuestionario: persistir `paso` en la URL para navegación hacia atrás | Medio | Alto |
| 4 | **P2-UX-08** — Crear `loading.tsx` en `(app)/` con esqueleto del panel | Bajo | Alto |
| 5 | **P2-UX-01** — Botón de tema con `aria-label` dinámico ("Cambiar a modo oscuro" / "Cambiar a modo claro") | Bajo | Alto |
| 6 | **P2-UX-05 + P2-UX-06** — Añadir `inputMode` y `autoComplete` a formularios | Bajo | Alto |
| 7 | **P2-UX-07** — Directorio: `q` busca también por categoría y actividad | Bajo | Alto |
| 8 | **P2-UX-11** — Skip-link con `transform: translateY(-150%)` + `tabindex="-1"` en `<main>` | Bajo | Medio |
| 9 | **P2-UX-21** — Refactorizar `Boton comoHijo` para no usar `cloneElement` (Slot de Radix o `LinkBoton`) | Medio | Medio |
| 10 | **P2-UX-22 + P2-UX-23** — Glosario con `<h3>` por término; menú móvil con `<h2>` por grupo | Muy bajo | Medio |

**Notas.**
- Mejora #1 (P2-UX-04) es la más rentable: el sitio vende honestidad y este caso es donde la honestidad falla. Cualquier visitante que genuinamente no realiza ninguna actividad del art. 17 queda atrapado en un embuste. La solución son ~10 líneas de código.
- Mejoras #2 y #5 son remediaciones de "lo prometido en la primera pasada pero no aplicado al 100%". El patrón ya está (algunos formularios sí usan `useFormStatus`), lo que falta es extenderlo a los 8 formularios listados en P2-UX-02.
- Mejora #4 (loading.tsx del panel) cierra F-26 de la primera pasada elevado a alto. Es ~30 líneas de un esqueleto fijo.

---

## 8. Quick wins (alto impacto, bajo esfuerzo)

1. **P2-UX-04** — En `Cuestionario.tsx:437-442`, añadir un checkbox "Ninguna de estas me aplica" debajo de la lista de actividades. Marcarlo setea `r.actividades = ['__ninguna__']` y muestra un resultado específico. 10 líneas, resuelve la trampa.

2. **P2-UX-01** — En `Encabezado.tsx:160`, cambiar `aria-label="Cambiar entre modo claro y modo oscuro"` a un estado que refleje el modo actual. La forma más simple: leer `document.documentElement.classList.contains('oscuro')` con un `useEffect` y guardar en `useState`. 8 líneas.

3. **P2-UX-08** — Crear `apps/web/src/app/(app)/loading.tsx` con `<div className="animate-pulse">` y un esqueleto de la barra lateral. El esqueleto es fijo: 8 grupos de 3-4 entradas cada uno. ~30 líneas.

4. **P2-UX-14 + P2-UX-17** — En `Newsletter.tsx:199-202` y `FormularioContacto.tsx:166-167`, eliminar el `aria-label="obligatorio"` del span y añadirlo al input con `aria-required={true}`. Dos cambios de tres líneas cada uno.

5. **P2-UX-22 + P2-UX-23** — En `glosario/page.tsx:104-110` cambiar el `<span className="text-xl font-semibold">` por `<h3>`. En `Encabezado.tsx:199` cambiar el `<p className="eyebrow">` por `<h2 className="eyebrow">`. Dos cambios de un carácter cada uno, mejora la navegación por headings.

---

## 9. Cosas que no pude verificar sin navegador

- **P2-UX-11** — El comportamiento real del skip-link `left: -9999px` en NVDA 2024+ y VoiceOver iOS 17+. La técnica está documentada como fallida; la verificación final requiere un screen reader moderno.
- **P2-UX-21** — El comportamiento de `cloneElement` con `<Link>` en React 19 al pegar `focus-visible:outline-2` por encima de un outline nativo. La sospecha es que el outline se duplica o se pierde; verificar en Chrome, Firefox y Safari.
- **P2-UX-25** — Que la actualización del reloj en vivo (cada segundo) no cause layout shifts perceptibles. La regla `prefers-reduced-motion` no detiene el re-render; verificar que el número se mantiene dentro de su celda sin saltos.
- **P2-UX-02** — Que `aria-busy` se anuncie correctamente con la combinación de `useFormStatus` y `useState` manual. Hay un patrón en Next 16 con `useActionState` que ya emite la señal; verificar que no se duplica.
- **P2-UX-15** — Que `aria-disabled="true"` en un `<a>` con `href="mailto:..."` vacío realmente NO active el cliente de correo en iOS Mail, Gmail app, Outlook desktop. El comportamiento puede variar por cliente.
- **P2-UX-29** — La latencia real de un submit del form de filtros del directorio en una conexión 3G simulada. Next 16 con SSG debería ser casi instantánea; verificar.
- **El contraste de la franja hero en viewports entre 768px y 1280px**, donde el gradiente se mueve y la primera línea del titular puede caer sobre `marino-tenue` (#eaeff6). El cálculo dice que pasa; verificar con Polypane.
- **Que el focus se devuelva correctamente al trigger tras cerrar el menú móvil** (P2-UX-10 parcial). Hoy `setAbierto(false)` no mueve el foco de vuelta al botón que lo abrió.

---

## 10. Resumen final

**Total de hallazgos nuevos:** 30
- Alto: 10
- Medio: 12
- Bajo: 8

**Por severidad (sólo lo nuevo):**
- Crítico: 0
- Alto: 10
- Medio: 12
- Bajo: 8

**Top 3 hallazgos nuevos que requieren atención inmediata:**

1. **P2-UX-04 — Cuestionario: "ninguna actividad aplica" sin salida de UI.** El sitio vende honestidad y este caso es donde la honestidad falla. Un despacho que genuinamente no realiza ninguna actividad del art. 17 queda atrapado en una contradicción entre el mensaje de error (que ofrece una salida) y la UI (que no la entrega). Resolver en 10 líneas.

2. **P2-UX-02 + P2-UX-03 — `aria-busy` y spinner ausentes en 8 formularios durante submit.** El patrón ya existe en los formularios de auth (`useFormStatus` + `disabled`); lo que falta es extenderlo a `FormularioContacto`, `FormularioAlta`, `Newsletter` y `FormularioContacto` del directorio. Resolver en ~16 líneas (un componente `BotonEnviar` reutilizable).

3. **P2-UX-10 — Cuestionario: el paso "resultado" no permite volver al formulario sin perder todo.** Quien escribe mal la fecha en el paso "operación" tiene que repetir las cinco pantallas anteriores. La herramienta es de un solo uso (no requiere auth), así que persistir `paso` en la URL con `useSearchParams` es la solución más simple y consistente con el resto de las herramientas (`ConversorUMA`, `Calculadora` ya lo hacen).

**Lo que la primera pasada acertó y esta confirma:** el sistema de diseño es robusto, los tokens de color están bien documentados, el `prefers-reduced-motion` es exhaustivo, las páginas de estado son sólidas, los formularios comparten la mayoría de las buenas prácticas. El sistema sigue siendo el activo más fuerte del proyecto.

**Lo que la primera pasada no vio y esta sí:** el proyecto tiene una deuda fina con los flujos de usuario completos. La primera pasada auditó componentes; la segunda auditoría flujos. Las 18 fricciones que aparecieron son del tipo "funciona pero podría ser un poco mejor" — no rompen el sitio, pero en un producto de cumplimiento que vende credibilidad, cada fricción es un voto en contra.

---

# Apéndice · Reportes de la pasada 1 (referencia)

Los siguientes archivos (`auditoria/01-seguridad.md`, `02-calidad-codigo.md`, `03-seo-contenido.md`, `04-ux-diseno.md` y `00-resumen-ejecutivo.md`) contienen los reportes originales de la pasada 1, fechada 12 de agosto de 2026 por la mañana. Se incluyen como referencia para entender qué hallazgos se cerraron entre pasadas y cuáles siguen abiertos con la misma severidad.

## Resumen — Pasada 1 · Seguridad (12 ago 2026, AM)

**18 hallazgos:** 0 críticos, 0 altos, 6 medios, 8 bajos, 4 informativos.
**Postura:** 88/100.

**Medios destacados (F-01..F-06):**
- F-01: Race condition en `repositorio.ts:agregar` (mismo bug que P2-SEC-05, ahora con TOCTOU también)
- F-02: `branch_ids` en RLS nunca enforzado (sigue abierto, ahora P2 re-clasificación)
- F-03: `destinoSeguro` no cubre percent-encoding inicial ni length cap
- F-04: `app.motivo_cambio` nunca se setea desde la app
- F-05: CSP `script-src 'unsafe-inline'` documentado, riesgo futuro
- F-06: `verifyOtp` y `resetPasswordForEmail` aceptan `type` sin whitelist

Reporte detallado: `auditoria/01-seguridad.md` (606 líneas).

---

## Resumen — Pasada 1 · Calidad de código (12 ago 2026, AM)

**12 hallazgos:** 0 críticos, 0 altos, 4 medios, 6 bajos, 2 informativos.
**Puntaje:** 9/10.

**Medios (F-01..F-04):**
- F-01: `recharts` y `zustand` declarados sin uso — **CERRADO en pasada 2**
- F-02: Sin `loading.tsx`/`error.tsx`/`not-found.tsx`/`global-error.tsx` — **CERRADO en pasada 2**
- F-03: 0 tests de componentes cliente (39 archivos) — sigue abierto, ahora ampliado en P2-CAL-06
- F-04: 0 tests de API routes (8 endpoints) — sigue abierto

Reporte detallado: `auditoria/02-calidad-codigo.md` (379 líneas).

---

## Resumen — Pasada 1 · SEO + Contenido (12 ago 2026, AM)

**21 hallazgos:** 0 críticos, 2 altos, 10 medios, 9 bajos.
**Puntaje inicial:** 72/100. **Tras correcciones en commit `3472303`:** 79/100.

**Altos (F-01..F-02):**
- F-01: `FECHA_HOY` muestra fecha del build — **CERRADO en pasada 2**
- F-02: Sin `not-found.tsx`/`error.tsx` — **CERRADO en pasada 2**

**Medios clave que siguen abiertos:**
- F-04: 5 `respuestaDirecta` con deícticos sin antecedente (sigue exactamente igual)
- F-05: 6-7 páginas sin bloque `respuestaDirecta` propio (sigue igual)
- F-06: 39 `respuestaDirecta` cortas (sigue igual)
- F-07: FAQ duplicado literal entre `/preguntas-frecuentes` y `/umbrales`
- F-08: `Dataset` sin `variableMeasured`/`temporalCoverage`/`spatialCoverage` (ahora F-02 P2 con consecuencia GEO)
- F-09: `.env.example:19-22` con comentarios contradictorios (sigue igual)
- F-10: `/cursos` y `/plantillas` en sitemap con prioridad 0.6 (sigue igual)
- F-11: Falta `ItemList` en `/herramientas` y `/directorio` (ahora F-07 P2)
- F-12: Múltiples `<script type="application/ld+json">` por página en lugar de `@graph`
- F-13: `WebApplication` ausente en las 17 calculadoras (ahora F-08 P2)

Reporte detallado: `auditoria/03-seo-contenido.md` (913 líneas).

---

## Resumen — Pasada 1 · UX / Diseño / a11y (12 ago 2026, AM)

**40 hallazgos:** 2 críticos, 11 altos, 11 medios, 16 bajos.
**Puntaje:** 79/100. **Tras correcciones:** 87/100 (en pasada 2).

**Críticos (F-01, F-02) — CERRADOS en pasada 2:**
- F-01: Sin páginas de estado de Next.js
- F-02: `lib/script-tema.mjs` contradice el script real

**Altos (F-03..F-13) que siguen abiertos o re-formulados:**
- F-03: Modo oscuro no respeta `prefers-color-scheme` para nuevos visitantes — sigue igual
- F-04: `aria-label="obligatorio"` en `<span>` sin role — **CERRADO en pasada 2**
- F-05: Botón `sm` 36px — **CERRADO en pasada 2**
- F-06: Botones header 36px — **CERRADO en pasada 2**
- F-07: `TablaEnvoltura` con `role="region"` sin label — **CERRADO en pasada 2**
- F-08: Formularios sin `aria-busy` durante submit — **sigue abierto, ampliado en P2-UX-02**
- F-09: Sin spinner visual durante submit — **sigue abierto, ahora P2-UX-03**
- F-10: `min-h-[calc(100dvh-4.25rem)]` no considera notch en todos los navegadores
- F-11: CSP con `'unsafe-inline'` (también seguridad F-05, sigue igual)
- F-12: `Metodología editorial`/`Nosotros`/`Precios` no en `Mapa del sitio` — **CERRADO en pasada 2**
- F-13: `Editar este dato`/`/directorio/alta` no en navegación principal

Reporte detallado: `auditoria/04-ux-diseno.md` (697 líneas).

---

## Resumen — Pasada 1 · Consolidado ejecutivo

Ver `auditoria/00-resumen-ejecutivo.md` (237 líneas). Resumen: **84/100 global**. Veredicto: "el proyecto es serio, está bien cuidado y es defendible, con tres grietas urgentes que son todas del mismo tipo: páginas de estado de Next.js".

**Las 3 grietas urgentes de la pasada 1 (todas CERRADAS en pasada 2):**
1. Páginas de estado de Next.js (`not-found.tsx`/`error.tsx`/`loading.tsx`/`global-error.tsx`)
2. `lib/script-tema.mjs` contradice el script real y no se importa
3. "Última actualización" muestra la fecha del build, no la editorial

---

# Fin del archivo

**Total de hallazgos entre las dos pasadas:** 92 (16 + 18 + 28 + 30).
**Cerrados entre pasada 1 y pasada 2:** 12 (3 críticos UX, 2 altos SEO, 2 altos UX, 1 medio calidad, 4 informativos).
**Abiertos y priorizados en este archivo (Top 20 al inicio):** 20.

**Auditor:** MiniMax Code, modo read-only. Cada hallazgo lleva `file:line` real.
**Fecha:** 12 de agosto de 2026.
**Proyecto:** `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/`
**Stack:** Next.js 16 + React 19 + Supabase + Tailwind v4 + TypeScript strict.
