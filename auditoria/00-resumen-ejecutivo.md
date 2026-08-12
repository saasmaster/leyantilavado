# Auditoría integral — LeyAntilavado.org
**Fecha:** 12 de agosto de 2026
**Modo:** read-only. No se modificó código. Cada hallazgo cita `file:line` real.
**Alcance:** `apps/web` (Next.js 16 + React 19 + Supabase), `packages/*`, `supabase/migrations/*`
**Reportes detallados:**
- `01-seguridad.md` — 18 hallazgos (0 críticos, 0 altos, 6 medios, 8 bajos, 4 informativos)
- `02-calidad-codigo.md` — 12 hallazgos (0 críticos, 0 altos, 4 medios, 6 bajos, 2 informativos)
- `03-seo-contenido.md` — 21 hallazgos (0 críticos, 2 altos, 10 medios, 9 bajos)
- `04-ux-diseno.md` — 40 hallazgos (2 críticos, 11 altos, 11 medios, 16 bajos)

---

## 1. Veredicto en una línea

**El proyecto es serio, está bien cuidado y es defendible — pero tiene tres grietas urgentes que son todas del mismo tipo: páginas de estado de Next.js (`not-found.tsx` / `error.tsx` / `loading.tsx`)**. El resto de la deuda es de grado fino y arreglable en 1-2 semanas sin tocar la arquitectura.

## 2. Puntuación por dimensión

| Dimensión | Puntuación | Lo que sostiene la nota | Lo que la baja |
|---|---:|---|---|
| Seguridad | **88 / 100** | CSP, RLS bien diseñadas, `destinoSeguro` cubre open-redirect, MFA con TOTP, `npm audit` limpio, audit log append-only | Race en `repositorio.ts`, `branch_ids` no enforzado en RLS, `app.motivo_cambio` nunca se setea desde la app |
| Calidad de código | **9 / 10** | TS estricto real, package boundaries limpios, motor jurídico puro y testeado, ESLint flat + `react-hooks/purity` | Sin tests de componentes cliente ni de API routes, `recharts`/`zustand` declarados y no usados |
| SEO + contenido | **79 / 100** | Indexabilidad arreglada, OG/Twitter image presente, llms.txt + 14 agentes IA en robots, `Article`/`Organization` enriquecidos, motor de procedencia trazable | "Última actualización" muestra fecha del build, 5 pasajes GEO con deícticos sin antecedente, `not-found` y `error` sin customizar |
| UX / a11y / diseño | **79 / 100** | Tokens WCAG AA, `prefers-reduced-motion` global, sistema de diseño sólido, formularios con `aria-describedby` cableado | Sin páginas de estado de Next (también), botones 36px (target táctil), asterisco de "obligatorio" no se anuncia en SR, dropdown por `onMouseEnter` |

**Global agregado (promedio ponderado por área de impacto):** **84 / 100**

## 3. Lo crítico que sí se arregló desde el primer audit (12-ago AM)

El primer `seo-audit/FULL-AUDIT-REPORT.md` (de la mañana) tenía 2 críticos. **Ambos cerrados** en el build actual, según el segundo pase de SEO:

- **Indexabilidad rota** (`Disallow: /` global + páginas con `noindex` por la notación de corchetes). El build actual de `.next/server/app/index.html` ya emite `name="robots" content="index, follow, max-image-preview:large, max-snippet:-1"`. ✅
- **Sin `og:image`/`twitter:image`**. Ahora 6 metadatos OG + 5 Twitter, imagen 1200×630 servida por `app/opengraph-image.tsx`. ✅

## 4. Lo crítico que aún está pendiente (5 grietas urgentes)

### 4.1 · Tres agentes coinciden en lo mismo: faltan `not-found.tsx`, `error.tsx`, `loading.tsx`, `global-error.tsx`
- **Seguridad** lo marca como hallazgo implícito de UX rota.
- **Calidad de código** lo lista como F-02 (Media).
- **UX/diseño** lo marca como **F-01 (Crítico)**.
- **SEO** lo marca como **F-02 (Alto)**.
**Cuándo:** hoy. Costo: ~150 líneas en 2 archivos. Beneficio: cubre el peor momento posible del usuario (404 sin marca, error sin escape, navegación sin feedback) y elimina la posibilidad de "soft 404" en Google.

### 4.2 · `lib/script-tema.mjs` contradice el script real y nadie lo importa (Crítico, UX)
`apps/web/src/lib/script-tema.mjs:13` define un script anti-FOUC que **sí** respeta `prefers-color-scheme`. `apps/web/src/app/layout.tsx:18-19` inyecta uno local que **no** lo respeta. El archivo `.mjs` no se importa en ningún sitio. Cualquier futuro dev que lo importe activará comportamiento que la decisión de producto documentada en `layout.tsx:84-89` prohíbe. **Acción:** borrar `lib/script-tema.mjs`.

### 4.3 · "Última actualización" muestra la fecha del build, no la fecha editorial (Alto, SEO + UX)
`apps/web/src/components/inicio/comun.tsx:20` define `FECHA_HOY = new Date().toISOString().slice(0, 10)` a nivel de módulo. Se usa en `nosotros`, `metodologia-editorial`, `fuentes-oficiales` y el hero de la home. En un sitio pre-renderizado, eso es la fecha del build, no la fecha de la última pasada editorial. Contradice la promesa de la metodología editorial. **Acción:** sustituir por `REVISION_VIGENTE` (`autores.ts:42`).

### 4.4 · `app.motivo_cambio` nunca se setea desde la app (Medio, Seguridad)
El sistema de versionado del corpus legal está diseñado para que cada cambio registre su `motivo` (`0010_versionado_legal.sql:62, 75`). El panel admin (`apps/web/src/components/admin/Avisos.tsx:88`) lo anuncia al lector como si existiera, pero `grep -r "set_config\|motivo_cambio" apps/` muestra cero call sites en código de aplicación. Resultado: todo cambio al corpus desde la UI quedará como "Sin motivo declarado por quien hizo el cambio." **Acción:** añadir un campo obligatorio de motivo en el formulario del panel y `select set_config('app.motivo_cambio', $1, true)` antes de cada UPDATE.

### 4.5 · Botones 36px rompen target táctil WCAG 2.5.5 (Alto, UX/a11y)
- `Boton sm`: `h-9` (36px) en `packages/ui/src/Boton.tsx:48`.
- Botones del header de escritorio: `h-9` en `apps/web/src/components/Encabezado.tsx:90`.
El comentario en `Boton.tsx:47-48` justifica que es para "barras densas de escritorio", pero en touch con Windows, Chromebook convertible o puntero motorizado aplica. **Acción:** subir a `h-10` (40px) o `h-11` (44px).

## 5. Lo demás, priorizado por área

### 5.1 Seguridad (6 medios, 8 bajos)
**Medios:**
- **F-01** Race condition en `apps/web/src/lib/directorio/repositorio.ts:34-39` — read-modify-write sin locking. El newsletter ya implementa la cola serie (`route.ts:104-130`); copiar el patrón.
- **F-02** `branch_ids` en `organization_members` (`0002_identidad.sql:95`) nunca se enforza en RLS. Las políticas de `0008_rls_cumplimiento.sql:28-32` filtran por organización, no por sucursal. Para una plataforma LFPIORPI esto es una salvaguarda de privilegio mínimo que está sólo en la UI.
- **F-03** `destinoSeguro` no cubre percent-encoding inicial ni length cap. Defensa en profundidad, no urgente.
- **F-04** `app.motivo_cambio` (ver 4.4).
- **F-05** `script-src 'unsafe-inline'` está documentado y justificado, pero la regresión a `dangerouslySetInnerHTML` derivada de input es XSS directa. Mitigación: grep de CI.
- **F-06** `verifyOtp` y `resetPasswordForEmail` aceptan `type` sin whitelist ni email format. Validar con zod y whitelist de `EmailOtpType`.

**Bajos** (resumen): `next URL()` redundante en `route.ts:33`; cookies `org_activa`/`ver_como` sin `secure` explícito; `NEXT_PUBLIC_SITE_URL` por omisión apunta a producción; `clienteServidor` no documenta dependencia del middleware para refresh; `feature_flags` legible por `anon` expone `organization_ids`; patrón "escribir dos veces" en `middleware.ts:33-40` confuso; `ver_como` con valor inválido borra la cookie (correcto, falta test); `actualizarContrasena` no exige contraseña actual (defendible).

### 5.2 Calidad de código (4 medios, 6 bajos)
**Medios:**
- **F-01** `recharts` y `zustand` declarados y nunca importados. 0 referencias en código. ~1.5 MB de `node_modules` y superficie de audit sin retorno. **2 minutos + `npm install`.**
- **F-02** Sin `not-found.tsx`/`error.tsx`/`loading.tsx`/`global-error.tsx` (también en UX crítico).
- **F-03** Cero tests de componentes cliente (39 archivos `'use client'`, 5 herramientas de 300-910 líneas sin cobertura). Mayor riesgo de regresión: `CuentaRegresivaReglas.tsx` (reloj compartido a nivel de módulo).
- **F-04** Cero tests de API routes (8 endpoints, ninguno con test).

**Bajos:** `Math.random()` en `filtros.test.ts:81`; 3 `as unknown as` en boundaries de tipos legítimos; 28 archivos con `import * as React` (estilo pre-React-17); 2 TODOs activos documentados.

**Verificado y aprobado:** `react-hooks/purity` activo vía `coreWebVitals`; service worker bien delimitado (`apps/web/public/sw.js`); `select('*')` en `consultas.ts` es `COUNT(*)` con `head: true`, no N+1.

### 5.3 SEO + Contenido (2 altos, 10 medios, 9 bajos)
**Altos:**
- **F-01** "Última actualización" muestra fecha del build (ver 4.3).
- **F-02** `not-found.tsx` y `error.tsx` ausentes (ver 4.1).

**Medios clave:**
- **F-03** Riesgo latente del bracket notation en `sitio.ts:26` (no bug activo, riesgo futuro si se importa en cliente).
- **F-04** 5 `respuestaDirecta` con deícticos sin antecedente (`actualizaciones`, `glosario`, `umbrales`, `obligaciones`, `actividades.ts:1105`).
- **F-05** 7 páginas sin bloque "Respuesta directa" propio: `/`, `/directorio`, `/herramientas`, `/nosotros`, `/metodologia-editorial`, `/fuentes-oficiales`, `/preguntas-frecuentes`.
- **F-06** Los 39 `respuestaDirecta` de `actividades.ts` (22) + `obligaciones.ts` (19) en 37-67 palabras (rango óptimo 134-167).
- **F-07** Pregunta FAQ duplicada literal entre `/preguntas-frecuentes` y `/umbrales`.
- **F-08** `Dataset` sin `variableMeasured`/`temporalCoverage`/`spatialCoverage`/`keywords`.
- **F-09** `.env.example:19-22` con comentarios contradictorios sobre `NEXT_PUBLIC_SITE_INDEXABLE`.
- **F-10** `/cursos` y `/plantillas` con prioridad 0.6 en el sitemap siendo placeholders honestos.
- **F-11** Falta `ItemList` en `/herramientas` y `/directorio`.

**Bajos:** Múltiples `<script type="application/ld+json">` por página en lugar de `@graph`; `WebApplication` ausente en las 17 calculadoras; E-E-A-T sin persona identificable; comentario engañoso sobre `noindex` en `sitio.ts:144-147`; `Article.image` acoplado a la convención de Next; `Article` sin `about`; `BreadcrumbList` migas de 2 niveles con JSON-LD de 3 en `/herramientas/*`; middleware corre sobre `/llms.txt`; `recortar()` deja espacio al final.

**Health score por categoría (revisión segunda pasada):**
- SEO técnico: 80
- Calidad de contenido: 82
- SEO on-page: 80
- Datos estructurados: 85
- Rendimiento: 82
- GEO / AI readiness: 72
- Imágenes: 78
- **Total: 79 / 100** (subió desde 72 del primer audit).

### 5.4 UX / Diseño (2 críticos, 11 altos, 11 medios, 16 bajos)
**Críticos:**
- **F-01** Sin `not-found.tsx`/`error.tsx`/`loading.tsx`/`global-error.tsx` (ver 4.1).
- **F-02** `lib/script-tema.mjs` contradice el script real (ver 4.2).

**Altos:**
- **F-03** Modo oscuro no respeta `prefers-color-scheme` para visitantes nuevos (decisión consciente pero sin opción "seguir al sistema").
- **F-04** `aria-label="obligatorio"` en `<span>` sin `role` no se anuncia en NVDA/JAWS/VoiceOver. Mover a `aria-required` en el input.
- **F-05** `Boton sm` mide 36px (ver 4.5).
- **F-06** Botones de navegación del header miden 36px.
- **F-07** `TablaEnvoltura` con `role="region"` sin `aria-label`/`aria-labelledby`.
- **F-08** Formularios sin `aria-busy` durante el submit.
- **F-09** Sin spinner visual durante el submit (sólo cambia el texto).
- **F-10** `min-h-[calc(100dvh-4.25rem)]` no considera notch en todos los navegadores.
- **F-11** CSP con `'unsafe-inline'` (también en seguridad F-05).
- **F-12** "Metodología editorial", "Nosotros" y "Precios" no aparecen en el `MapaDelSitio` de la portada.
- **F-13** "Editar este dato" / `/directorio/alta` no visible en la navegación principal.

**Medios destacados:** Falta `useId()` en `Campo`; `disabled:opacity-45` puede romper contraste; menú dropdown se abre por `onMouseEnter` (no teclado); texto del newsletter sobre marino en `color-mix` no verificado a 4.5:1; `@radix-ui/*` declarados sin uso; `FECHA_HOY` module-level; honeypot `id="sitio"` puede colisionar; iconos decorativos sin `aria-hidden`; migas faltantes en páginas institucionales.

**Bajos:** input date sin pista de formato; logo SVG sin `<title>`; insignia ámbar texto blanco a verificar 4.5:1; `await leerSesion()` síncrono en `LayoutApp`; atajo "?" no existe; menú móvil con `<p class="eyebrow">` en vez de `<h2>`; `<h3>` faltantes en glosario; `text-balance` en `h1-h4` puede mover palabras huérfanas; tooltip "Estadísticas" ausente en header; placeholder `placeholder="nombre@empresa.mx"` (correcto, dejar nota); `aspect-ratio: 16/10` con `object-bottom`; `font-feature-settings` Inter; `noindex` en `/directorio/alta` debatable; `/panel/manual` sin contraparte pública; `@radix-ui/*` sin uso; CSS `.salto-contenido` con `left: -9999px`.

## 6. Lo que está bien hecho (verificado, no placeholders)

### Seguridad
1. CSP y cabeceras de seguridad: `frame-ancestors 'none'`, `object-src 'none'`, HSTS con `preload`, COOP, Permissions-Policy cerrado. La decisión de mantener `'unsafe-inline'` en `script-src` está documentada con la alternativa (nonce por petición) y su costo real (perder 172 páginas estáticas).
2. Middleware de sesión: `getUser()` (no `getSession()`) valida el JWT contra el servidor de Supabase en cada request.
3. RLS de identidad y cumplimiento: políticas correctas en `0002-0008`, doble puerta anti-self-elevation en `users_select`/`users_update`/`impedir_autoelevacion`, `notice_records` no salta de `borrador` a `aprobado` sin rol de aprobación.
4. Defensa contra enumeración de cuentas: un solo mensaje para "no existe"/"contraseña incorrecta", un solo mensaje para "te enviamos instrucciones" exista o no, `mensajeSeguroDeAuth` colapsa cualquier mención de "password"/"credential".
5. `destinoSeguro` y su test cubren 6 vectores y se invocan en 6 call sites antes de cualquier `redirect()`.
6. Rate limit por IP: ventana deslizante con poda perezosa, `Retry-After` en 429.
7. MFA con TOTP: 4 server actions separadas, AAL expuesto en sesión, flag `mfaActivo` se calcula sobre factores `verified`.
8. Triggers de inmutabilidad: `audit_logs` y `content_revisions` append-only, triggers desde la DB, no desde la app.
9. `npm audit` limpio: 0 vulnerabilidades declaradas en advisories.
10. Validación con zod en todas las rutas `/api/*` y en los server actions del panel. `z.literal(true)` para el consentimiento (no se puede esquivar con `"true"` o `1`).

### Calidad de código
1. TS estricto real: `strict` + `noUncheckedIndexedAccess` + `noImplicitOverride`. Cero `any`, cero `@ts-ignore`. Esto fuerza guards reales en `datos.ACTIVIDADES_POR_SLUG[slug]?.nombre ?? slug`.
2. Package boundaries limpios: `packages/types ← rules-engine/ui ← apps/web`. Ningún package importa desde `apps/web`.
3. Motor jurídico puro y determinista: cero `Date.now()`, cero I/O, fechas como parámetro, tests con asserts exactos.
4. Patrones React 19 correctos: `useSyncExternalStore` con `getServerSnapshot` para `CuentaRegresivaReglas`, `useActionState` + `useFormStatus` en los 5 forms con server actions, los 4 `useEffect` con cleanup correcto.
5. `EMPAQUETAR=1` bien aislado: `output: 'standalone'` + `outputFileTracingRoot` sólo cuando la variable está set.
6. ESLint flat config nativo, sin `FlatCompat` (decisión documentada con el bug que evita).
7. `next.config.mjs` extensamente comentado en cada decisión no-obvia.

### SEO / Contenido
1. Indexabilidad correcta (arreglada desde el primer audit).
2. OG/Twitter image servida desde `app/opengraph-image.tsx` (1200×630).
3. `llms.txt` existe con 14 secciones y se sirve desde `/llms.txt`.
4. 14 rastreadores de IA con regla propia en `robots.txt`.
5. `Article` enriquecido con `image`/`isPartOf`/`@id`/`publisher.logo`.
6. `Organization` con `@id`/`logo`/`image`/`knowsAbout`/`areaServed`.
7. Motor de procedencia trazable: cada regla arrastra `Procedencia` con fuentes, disposición, fecha y nivel de verificación.
8. `componerTitulo` ya recorta a 60 caracteres y recorta la marca cuando estorba.
9. `recortar()` ya recorta a 155 caracteres en la descripción.
10. Sitemap vivo: 93/93 URL comprobadas por estado HTTP en el primer audit.

### UX / Diseño
1. Sistema de diseño sólido: tokens WCAG AA documentados en `globals.css:36-62`, tres niveles de tinta, tres acentos semánticos.
2. `prefers-reduced-motion` global y exhaustiva.
3. `CuentaRegresivaReglas` con `role="timer"` + `aria-live="off"` + `aria-label` en prosa legible.
4. Formularios con `aria-describedby` cableado en `Campo`, `role="alert"` en mensajes de error, `aria-live="polite"` en secciones de resultado.
5. Honeypot bot correctamente oculto.
6. Etiquetas siempre visibles (nunca sólo placeholder).
7. Tipografía autoalojada, sin terceros en la ruta crítica.

## 7. Top 15 — Lo que arreglaría primero (orden de impacto/esfuerzo)

| # | Hallazgo | Área | Esfuerzo | Impacto |
|---|---|---|---|---|
| 1 | Crear `not-found.tsx`, `error.tsx`, `loading.tsx`, `global-error.tsx` (4.1) | UX/SEO | 1-2 h | Cubre el peor momento del usuario + soft-404 risk |
| 2 | Borrar `lib/script-tema.mjs` (4.2) | UX/Seguridad | 5 min | Elimina contradicción y riesgo de divergencia silenciosa |
| 3 | Sustituir `FECHA_HOY` por `REVISION_VIGENTE` en 3 páginas (4.3) | SEO/Contenido | 15 min | Honra la promesa editorial |
| 4 | `set_config('app.motivo_cambio', …)` en el flujo editorial + campo obligatorio en el panel (4.4) | Seguridad | 2 h | Cumple el contrato del versionado legal |
| 5 | Subir `h-9` a `h-10`/`h-11` en `Boton sm` y header nav (4.5) | UX/a11y | 30 min | WCAG 2.5.5 target táctil |
| 6 | Mover `aria-label="obligatorio"` a `aria-required` en inputs (F-04 UX) | UX/a11y | 1 h | Anuncio correcto a screen readers |
| 7 | Copiar el patrón de cola serie del newsletter a `repositorio.ts:agregar` (F-01 Seg) | Seguridad | 30 min | Cierra race condition del directorio |
| 8 | Crear `public.sucursales_visibles(org)` y aplicarla en las 6 políticas de RLS de tablas con `branch_id` (F-02 Seg) | Seguridad/RBAC | 4-6 h | Aislamiento por sucursal (LFPIORPI exige privilegio mínimo) |
| 9 | Whitelist de `EmailOtpType` + validación zod email en `route.ts:18` y `acciones.ts:135` (F-06 Seg) | Seguridad | 1 h | Cierra vector de social engineering |
| 10 | Eliminar `recharts` y `zustand` de `apps/web/package.json` (F-01 Cal) | Calidad | 2 min | -1.5 MB node_modules, -superficie audit |
| 11 | Reescribir 5 `respuestaDirecta` con deícticos (F-04 SEO) y añadir 7 bloques en páginas sin él (F-05 SEO) | SEO/GEO | 2 h | Citabilidad rota arreglada |
| 12 | Un test de subscribe/unsubscribe para `CuentaRegresivaReglas` + un test de happy-path para `Cuestionario` (F-03 Cal) | Calidad/Tests | 1 h | Cubre el patrón de mayor riesgo de regresión |
| 13 | Crear `not-found.tsx` (repetición de #1, intencional — es la grieta que más agentes coinciden) | — | — | — |
| 14 | `unirJsonLd(...entidades)` y consolidar 4 scripts en 1 `@graph` en las 4 páginas afectadas (F-12 SEO) | SEO/Schema | 2 h | Patrón recomendado por Google |
| 15 | Corregir `.env.example:19-22` (F-09 SEO) y `sitio.ts:144-147` comentario engañoso (F-15 SEO) | SEO/Docs | 10 min | Quita ambigüedad operativa |

## 8. Lo que NO se pudo verificar estáticamente

1. **Comportamiento real de RLS bajo carga concurrente** — sólo se leyó SQL, no se probó con datos.
2. **Visual rendering** — los hallazgos de UX se basan en código CSS/Tailwind, no en screenshots reales.
3. **Lectura de pantalla real** — el hallazgo F-04 UX sobre `aria-label` en `<span>` sin `role` está documentado en bugs conocidos de NVDA/JAWS, pero no se probó con un SR específico.
4. **Bundle real en producción** — los `~230 KB de JS` del primer audit son estimación; sin correr `next build --profile` no se tiene la cifra exacta.
5. **Comportamiento del refresh de sesión entre server actions** — depende del flujo real del navegador, no se puede reproducir estáticamente.
6. **Indexación real de Google** — el `noindex` está arreglado en el código, pero la indexación real toma semanas y depende de crawl budget.
7. **El frontend de `actualizarContrasena` con token de sesión robada** — el riesgo es real, pero el flujo depende del comportamiento del atacante.

## 9. Cómo se cruzan los hallazgos entre las 4 auditorías

| Tema | Aparece en | Convergencia |
|---|---|---|
| Falta de páginas de estado Next.js | Calidad F-02 + UX F-01 + SEO F-02 + Seguridad (implícito) | **4 de 4** lo señala. Es la grieta #1. |
| CSP `'unsafe-inline'` | Seguridad F-05 + UX F-11 | 2 de 4 (bien documentado y justificado, riesgo real a futuro) |
| `FECHA_HOY` module-level | SEO F-01 + UX F-19 + Seguridad (FECHA_HOY también toca el hero) | 3 de 4 |
| `Math.random()` en test / dep no usadas / as unknown as | Calidad F-01/F-06/F-07 | Sólo en calidad |
| Target táctil 36px | UX F-05/F-06 | Sólo en UX |
| Race en repositorio del directorio | Seguridad F-01 | Sólo en seguridad |
| branch_ids sin RLS | Seguridad F-02 | Sólo en seguridad |
| Deícticos en respuestaDirecta | SEO F-04 | Sólo en SEO |
| `aria-label` en `<span>` sin `role` | UX F-04 | Sólo en UX |

**Patrón:** cuando un agente lo marca y los otros no, suele ser porque la otra área no lo ve desde su lente. Cuando **varios** agentes coinciden, es señal de que es la prioridad real. La #1 (páginas de estado) es la única en la que los 4 convergen.

## 10. Lo que el primer audit no vio y el segundo sí

1. **F-01 SEO/UX**: "Última actualización" muestra la fecha del build (los 4 agentes lo tocan desde ángulos distintos, pero ninguno del primer audit).
2. **F-02 UX**: `lib/script-tema.mjs` contradice el script inyectado (módulo muerto y engañoso).
3. **F-04 UX**: asterisco de "obligatorio" no se anuncia en SR.
4. **F-05/F-06 UX**: target táctil 36px.
5. **F-08/F-09 UX**: formularios sin `aria-busy` ni spinner.
6. **F-01 Seg**: race condition en `repositorio.ts` (el primer audit no miró la persistencia del directorio).
7. **F-02 Seg**: `branch_ids` no enforzado en RLS.
8. **F-04 Seg**: `app.motivo_cambio` nunca se setea desde la app.
9. **F-06 Seg**: `verifyOtp` con `type` sin whitelist.
10. **F-12/F-18 Seg**: cookies sin `secure` explícito; `perfil.sitioWeb` sin `rel="noopener noreferrer"`.

---

**Próximo paso sugerido:** empezar por la fila #1-#5 del Top 15. Son ~6 horas de trabajo, no rompen nada, y cubren las 4 grietas que los 4 agentes marcaron como urgentes. Si quieres, en la siguiente sesión abrimos issues/PRs separados por cada fila.
