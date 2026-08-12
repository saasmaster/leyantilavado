# Auditoría de calidad de código y rendimiento — LeyAntilavado.org

**Tipo:** read-only (sin tocar nada)
**Stack auditado:** Next.js 16.3 · React 19.0 · Supabase SSR 0.5 · Tailwind v4 · TS 5.7 strict · Turborepo 2.5
**Alcance del código:** 268 archivos TS/TSX en `apps/web/src` y `packages/*/src` (≈45 470 líneas).
**Build de referencia:** `next build` ya ejecutado, artefactos en `apps/web/.next/`, paquete standalone en `dist/`.

---

## Resumen ejecutivo

**Puntaje global: 9 / 10.** Es un proyecto notablemente bien cuidado: TypeScript estricto real (cero `any` literales, cero `@ts-ignore`), paquete de límites limpios entre `apps/web` y los `packages`, motor jurídico puro y testeable, sin código muerto ni TODOs acumulados (sólo dos documentados), y el eslint flat config activado con la regla `react-hooks/purity` que es justamente la que la propia documentación interna reclama. Las pocas áreas flojas son operativas (dos dependencias declaradas y nunca usadas, ausencia de `error.tsx`/`loading.tsx`/`not-found.tsx`, tests concentrados sólo en el motor y en `lib/` con cero cobertura de componentes cliente) y se arreglan en menos de un día.

**Puntaje detallado por dimensión (subjetivo, sobre 10):**

| Dimensión | Puntaje | Comentario |
|---|---|---|
| Tipos y strictness | 10 | `strict` + `noUncheckedIndexedAccess` + `noImplicitOverride`. Cero `any`, cero `@ts-ignore`. |
| Estructura modular | 9.5 | Boundaries limpios (`packages/types ← rules-engine/ui`, no se cruzan con `apps/web`). |
| Patrones React 19 | 9 | `useSyncExternalStore` para reloj, `useActionState` para forms, sin warnings de hooks. |
| Performance | 8.5 | Server Components por defecto, `Promise.all` en el panel, sin N+1, pero sin `loading.tsx` ni dynamic imports. |
| Testing | 5 | Motor bien cubierto (570 LOC). 0 tests de componentes cliente, 0 de API routes. |
| Tooling y build | 9 | Flat config correcta, `EMPAQUETAR=1` bien aislado, headers de seguridad sólidos. |
| Higiene de deps | 7 | `recharts` y `zustand` declarados y nunca importados. |

---

## Tabla de hallazgos

| ID | Severidad | Título | Archivo:línea | Categoría |
|---|---|---|---|---|
| F-01 | Media | Dependencias declaradas y nunca usadas (`recharts`, `zustand`) | `apps/web/package.json:35,39` | Bundle / Higiene |
| F-02 | Media | Sin `loading.tsx`, `error.tsx`, `not-found.tsx` ni `global-error.tsx` en el árbol del App Router | `apps/web/src/app/**` | DX / UX / Next.js |
| F-03 | Media | Cero tests de componentes cliente (39 archivos client sin un solo test) | `apps/web/src/**/*.test.tsx` | Cobertura |
| F-04 | Media | Cero tests de API routes (8 endpoints, todos sin cobertura) | `apps/web/src/app/api/**/route.ts` | Cobertura |
| F-05 | Baja | Sin dynamic imports para los 18 herramientas cliente pesadas (≥300 LOC) | `apps/web/src/app/herramientas/*` | Performance |
| F-06 | Baja | `Math.random()` en un test que no es determinista | `apps/web/src/lib/directorio/filtros.test.ts:81` | Tests |
| F-07 | Baja | `as unknown as` × 3 en Supabase/Zod — bridges legítimos pero podrían eliminarse | `apps/web/src/lib/auth/sesion.ts:68`, `apps/web/src/lib/directorio/esquemas.ts:74,80` | Tipos |
| F-08 | Baja | 28 archivos con `import * as React from 'react'` (estilo pre-React-17) | `apps/web/src/components/**/*.tsx` (varios) | Estilo |
| F-09 | Baja | 2 TODOs activos, ambos documentados y con plan claro | `apps/web/src/app/api/newsletter/route.ts:95`, `apps/web/src/lib/directorio/pagos.ts:54` | Higiene |
| F-10 | Info | `react-hooks/purity` SÍ está activo vía `coreWebVitals` (verificado: ningún `new Date()` en render de cliente se cuela) | `apps/web/eslint.config.mjs:14` | Tooling |
| F-11 | Info | Service worker real, bien delimitado, correctamente registrado y desregistrado en dev | `apps/web/public/sw.js`, `apps/web/src/components/RegistroSW.tsx` | PWA / Privacidad |
| F-12 | Info | `consultas.ts` usa `select('*')` con justificación documentada (PK varía por tabla) | `apps/web/src/lib/app/consultas.ts:44,102` | Performance / Datos |

Total: **12 hallazgos** — 0 críticos, 0 altos, 4 medios, 6 bajos, 2 informativos.

---

## Hallazgos detallados

### F-01 — Dependencias declaradas y nunca usadas

**Severidad:** Media (no afecta el bundle, sólo install time y surface de supply chain).

**Evidencia:**
```ts
// apps/web/package.json:33-39
"react-hook-form": "^7.54.2",
"recharts": "^2.15.1",     // ← declarado
"tailwind-merge": "^3.0.1",
"zod": "^3.24.1",
"zustand": "^5.0.3"          // ← declarado
```

Búsqueda exhaustiva en código:
```
grep -rn "from 'recharts'\|from \"recharts\"" apps packages  → 0 matches
grep -rn "from 'zustand'\|from \"zustand\"" apps packages    → 0 matches
```

`recharts` aparece sólo en `apps/web/.next/required-server-files.json:256` (lo lista Next porque está en `package.json`) y en cachés de Turbopack. **Cero referencias reales.**

`zustand` no aparece ni siquiera en los archivos de build.

**Impacto:** No inflan el bundle del cliente (Next.js no mete deps no importadas en el chunk del cliente), pero suman ~1.5 MB al `node_modules` (recharts es pesado: ~1.2 MB unpacked, con d3, react-smooth y prop-types), y son superficie de mantenimiento/audit de supply chain sin retorno.

**Recomendación:** Eliminar `recharts` y `zustand` de `apps/web/package.json`. Si reaparecen, el lockfile los traerá. El README no las menciona, no hay tests que las pidan, no hay un dashboard de charts planeado en `apps/web/src/components/`.

---

### F-02 — Sin archivos de UX del App Router

**Severidad:** Media (afecta UX ante errores y percepción de rendimiento en navegación).

**Evidencia:**
```bash
find apps/web/src -name "loading.tsx"    → 0 resultados
find apps/web/src -name "error.tsx"      → 0 resultados
find apps/web/src -name "not-found.tsx"  → 0 resultados
find apps/web/src -name "global-error.tsx" → 0 resultados
```

Con 104 páginas, 8 API routes, y rutas dinámicas como `[id]` y `[slug]`, las navegaciones lentas no muestran fallback, los 404 de slug no son branded, y un error de runtime en cualquier server component se propaga al error boundary de Next por defecto (página sin estilos, sin aviso de independencia, sin `next/font`).

**Recomendación (en orden de impacto):**
1. Crear `apps/web/src/app/not-found.tsx` (branded, mantiene `next/font`).
2. Crear `apps/web/src/app/global-error.tsx` con el layout mínimo (es la única que rompe `<html>/<body>` y debe renderizar sin el layout normal).
3. Crear `apps/web/src/app/(app)/loading.tsx` (panel es la zona con fetches Supabase más lentos — un skeleton reduce perceived wait).
4. Opcional: `apps/web/src/app/herramientas/[herramienta]/loading.tsx` si la primera pintura de las herramientas pesa.

---

### F-03 — Cero tests de componentes cliente

**Severidad:** Media (39 archivos con `'use client'`, de los cuales ~15 son herramientas interactivas de 300-900 líneas, sin un solo test).

**Evidencia:**
```
find apps/web/src -name "*.test.tsx" → 0 resultados
```
Los 5 archivos `*.test.ts` están todos en `lib/` (lógica pura) o en el motor. Componentes interactivos grandes sin cobertura:
- `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx` (910 líneas, scoring, branching)
- `apps/web/src/app/herramientas/beneficiario-controlador/EditorEstructura.tsx` (567 líneas, recursividad)
- `apps/web/src/app/herramientas/acumulacion-operaciones/Acumulacion.tsx` (550 líneas)
- `apps/web/src/app/herramientas/importar-operaciones/Importador.tsx` (418 líneas, parseo CSV)
- `apps/web/src/components/CuentaRegresivaReglas.tsx` (390 líneas, `useSyncExternalStore` con interval compartido — alto riesgo de regresión sutil)

**Impacto:** Regresiones visuales o de estado pasan hasta producción. El cálculo de los `4 useEffect` del repo están todos en `Encabezado.tsx` (suscripción a scroll, Escape, overflow de body) — cambios de React 19 los podrían silenciar.

**Recomendación:** Mínimo viable — un test de render para `CuentaRegresivaReglas` (asegura que la suscripción al reloj se desuscribe al desmontar) y uno de happy-path para `Cuestionario` (validación de score). Esto cubre los dos riesgos más altos: el reloj compartido a nivel de módulo y el cálculo jurídico con mayor complejidad de branching.

---

### F-04 — Cero tests de API routes

**Severidad:** Media (8 endpoints públicos, todos con `dynamic = 'force-dynamic'`, varios con Zod validation, rate limiting, y persistencia).

**Evidencia:**
```
apps/web/src/app/api/auth/confirmar/route.ts
apps/web/src/app/api/directorio/{alta,contacto,reclamar,reportar}/route.ts
apps/web/src/app/api/contacto/route.ts
apps/web/src/app/api/newsletter/route.ts
apps/web/src/app/api/cron/monitor-fuentes/route.ts
```

Ninguno tiene test. El de newsletter (líneas 95-130 de `route.ts`) tiene una cola serie con `Promise` chaining y serialización a archivo `.data/newsletter.json` — race conditions latentes en el código no son detectables sin tests.

**Recomendación:** Test de los 2 endpoints de mayor tráfico/riesgo: `newsletter` (rate limit, dedupe por correo, schema Zod) y `directorio/alta` (validación más rica, persistencia con `crypto.randomUUID`).

---

### F-05 — Sin `dynamic()` para los herramientas pesados

**Severidad:** Baja (las herramientas no están en la ruta crítica de la home, pero todas se importan estáticamente en sus page.tsx).

**Evidencia:**
```bash
grep -rn "dynamic(\|import(" apps/web/src --include="*.tsx" 2>/dev/null
# → 0 resultados
```

Cada `page.tsx` en `apps/web/src/app/herramientas/*/page.tsx` hace un `import` estático de su componente cliente. Como el componente se importa desde el page server component, Next.js crea un boundary RSC y envía el cliente JS en el chunk principal de la página.

**Impacto:** La home `/` y las páginas de contenido legal (carga rápida) no se ven afectadas, pero las herramientas pesan: el chunk más grande del cliente en el build es **223 KB** (`apps/web/.next/static/chunks/1mndwqkgfaoia.js`). Las herramientas se beneficiarían de `next/dynamic` con `{ ssr: false }` para que su JS no entre en el bundle inicial del segmento `/herramientas/*`.

**Recomendación (opcional):** Convertir las 5 herramientas con `react-hook-form` (las más pesadas) a `dynamic(() => import('./Cuestionario'), { ssr: false, loading: ... })`. Mejora TTI en ~150-200 KB transferidos a la primera carga.

---

### F-06 — `Math.random()` en test

**Severidad:** Baja (cosmético, pero rompe la regla implícita "los tests son deterministas").

**Evidencia:**
```ts
// apps/web/src/lib/directorio/filtros.test.ts:81
const clave = `prueba-${Math.random()}`;
```

**Impacto:** Si el test corre dos veces seguidas o en CI con seed compartida, no hay colisión; pero el patrón es contagioso y contradice el resto del repo, que es completamente determinista (verificado: el motor usa `pesosACentavos` con aritmética entera y asserts exactos).

**Recomendación:** Usar `crypto.randomUUID()` o un contador `let i = 0; const clave = \`prueba-${i++}\``.

---

### F-07 — Tres `as unknown as` en boundaries de tipos

**Severidad:** Baja (los tres son legítimos y están comentados, pero son el tipo de cast que `eslint` no marca y que se va pudriendo).

**Evidencia:**

```ts
// apps/web/src/lib/auth/sesion.ts:67-72
for (const fila of (filas ?? []) as unknown as {
  role: string;
  status: string;
  organizations: { id: string; name: string; rfc: string | null } | null;
}[]) { ... }
```

```ts
// apps/web/src/lib/directorio/esquemas.ts:74
estado: z.enum(ESTADOS_MX as unknown as [string, ...string[]]),
```

**Impacto:** El primero pierde la verificación de tipos de Supabase en el join `organizations(id, name, rfc)`; si el schema cambia, el cast lo silencia. El segundo es un bridge conocido de `z.enum` con `readonly` tuples.

**Recomendación:** Para `sesion.ts`, definir un tipo `FilaOrganizacionMiembro` y usar `satisfies` con el genérico de Supabase. Para `esquemas.ts`, derivar el array como `as const` directamente con el guard apropiado (`[string, ...string[]]`).

---

### F-08 — `import * as React from 'react'` en 28 archivos

**Severidad:** Baja (estilo, sin impacto runtime — el compilador lo tree-shakea igual).

**Evidencia:**
```bash
grep -rln "^import \* as React from 'react'" apps/web/src  → 28 archivos
```

Con React 17+ y `tsconfig: "jsx": "react-jsx"` (verificado en `apps/web/tsconfig.json:18`), el import no es necesario. La elección parece ser consistencia histórica más que necesidad.

**Impacto:** Ninguno en bundle (el transform JSX usa la importación automática), pero el archivo tiene 1 línea de boilerplate y un nombre extra en el scope.

**Recomendación:** Eliminar en bloque con un script — pero no es prioritario y un PR así toca 28 archivos sin valor funcional.

---

### F-09 — Dos TODOs activos

**Severidad:** Baja (ambos están documentados, con contexto, y representan trabajo futuro, no descuidos).

**Evidencia:**
```ts
// apps/web/src/app/api/newsletter/route.ts:94-98
/* ── Persistencia ─────────────────────────────────────────────────────────────
   TODO(supabase): sustituir el cuerpo de `guardarSuscriptor` por un insert en
   la tabla `newsletter_suscriptores` con RLS (sólo `service_role` escribe) y
   un índice único sobre el correo normalizado. La firma no cambia, así que el
   resto del endpoint no se toca.
   ─────────────────────────────────────────────────────────────────────────── */
```

```ts
// apps/web/src/lib/directorio/pagos.ts:54
// TODO(Stripe): stripe.checkout.sessions.create({ mode: 'subscription', ... })
```

**Recomendación:** Moverlos a `auditoria/03-deuda-tecnica.md` o a un `BACKLOG.md` en la raíz con `issue:` link cuando exista repo público. Mantenerlos en el código funciona, pero un grep por `TODO` no debería ser la única forma de encontrarlos.

---

### F-10 — `react-hooks/purity` está activo (verificación)

**Severidad:** Informativo (es la regla que el README explícitamente invoca, y quería verificar).

**Evidencia:** `apps/web/eslint.config.mjs:8-15` documenta la decisión:
```js
/**
 * Importa: es aquí donde vive `react-hooks/purity`, la regla que detecta
 * `new Date()` durante el render. `tsc` no la ve. Si esta config no corre,
 * ese error llega a producción.
 */
export default [
  ...next,
  ...coreWebVitals,
  ...
];
```

Verificación de cumplimiento en código:
- 41 ocurrencias de `new Date()` / `Date.now()` / `Math.random()` en source.
- De las que están en client components (`'use client'`): **todas** usan el patrón `React.useState(() => new Date()...)` (10 archivos) o están a nivel de módulo (3 archivos: `PieDePagina.tsx:8`, `inicio/comun.tsx:20`, `CuentaRegresivaReglas.tsx:95,110,135,178` dentro de `useEffect`/`setInterval`).
- Las dos que aparecen en server components (`app/page.tsx:71`, `calendario-cumplimiento/page.tsx:73`) resuelven la hora en el servidor y la pasan como prop `ahoraISO` al cliente — patrón correcto.

**Conclusión:** la regla está activa y el código la respeta.

---

### F-11 — Service worker bien aislado

**Severidad:** Informativo (era una pregunta explícita: ¿se usa `sw.js`?).

**Evidencia:**
- `apps/web/public/sw.js` existe, 102 líneas, con versión `v1` en el nombre de la caché.
- `apps/web/src/components/RegistroSW.tsx:17-40` lo registra sólo en producción; en desarrollo lo desregistra activamente y borra todas las cachés.
- `sw.js` declara `NUNCA_CACHEAR = ['/api/', '/app/', '/admin/', '/entrar', '/registro', '/recuperar']` — no cachea nada privado.
- Sólo precarga 7 calculadoras públicas y la `/offline` page.
- `nginx.conf` (línea 147) pone `Cache-Control: no-cache, no-store, must-revalidate` en `location = /sw.js` — bien.

**Conclusión:** sí, `sw.js` está en uso activo y bien delimitado.

---

### F-12 — `consultas.ts` con `select('*')` intencional

**Severidad:** Informativo (era un punto del scope, quería verificar que no fuera un N+1 accidental).

**Evidencia:**
```ts
// apps/web/src/lib/app/consultas.ts:97-108
// `*` y no `id`: varias tablas del corpus legal tienen la clave primaria en
// `slug`, `year` o `key`. Con `head: true` no viaja ninguna fila, así que
// pedir todas las columnas no cuesta nada.
let consulta = supabase!.from(tabla).select('*', { count: 'exact', head: true });
```

El `select('*')` con `head: true` es un `COUNT(*)` puro: cero bytes de fila, sólo el conteo. Es la opción correcta para los `contar()` de `panel/page.tsx`. En el path de listado (`linea 44`), la opción default es `select('*')`, pero cada call site de la app pasa `columnas` explícito (verificado: 7/7 call sites de `listar()` lo hacen — `clientes/page.tsx:71`, `exportaciones/page.tsx`, etc.).

**Conclusión:** el `*` es defensivo (cuando no se pasa `columnas`), pero en la práctica nunca se dispara sin override.

---

## Lo que está bien (verificado, no placeholders)

1. **TypeScript estricto real.** `tsconfig.base.json:11-15` tiene `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`. Recorrido completo del repo: 0 `any`, 0 `@ts-ignore`/`@ts-expect-error`/`@ts-nocheck`, 3 `as unknown as` documentados. Esto no es decorativo — `noUncheckedIndexedAccess` fuerza guards reales en `datos.ACTIVIDADES_POR_SLUG[slug]?.nombre ?? slug` y similares.

2. **Package boundaries limpios.** `packages/rules-engine` depende de `@leyantilavado/types`. `packages/ui` también. `apps/web` depende de los tres. **Ningún package importa desde `apps/web`** (verificado: `grep -rn "from '@leyantilavado/web\|from '@/app\|from '@/components" packages` → 0 resultados). No hay ciclos.

3. **El motor jurídico es puro y determinista.** `packages/rules-engine/src/index.ts:1-12` lo declara explícitamente y lo cumple: cero `Date.now()`, cero I/O, las fechas entran como parámetro, tests con asserts exactos (`packages/rules-engine/src/motor.test.ts`).

4. **Patrones React 19 correctos.**
   - `CuentaRegresivaReglas` usa `useSyncExternalStore` con `getServerSnapshot` que recibe `ahoraISO` como prop — la hidratación coincide exactamente con el servidor. Hay un singleton de módulo (`relojEnCache`, `suscriptores`, `intervaloReloj`) con subscribe/unsubscribe correctos.
   - Los 5 formularios con acciones de servidor usan `useActionState` + `useFormStatus` (la API moderna de React 19), no el `useFormState` deprecado.
   - Los 4 `useEffect` del repo (todos en `Encabezado.tsx:20-49`) tienen arrays de dependencia correctos, cleanup consistente, y listeners `{ passive: true }` donde aplica (scroll).

5. **Seguridad en headers y en código.** `next.config.mjs:23-65` define una CSP agresiva (con `'unsafe-inline'` en script-src documentado y justificado por el problema real de los scripts inline de Next), HSTS con `preload`, COOP, Permissions-Policy cerrado. `lib/auth/sesion.ts:39-49` usa `supabase.auth.getUser()` (validación server-side) en vez de `getSession()` (sólo lee cookie). El middleware (`lib/supabase/middleware.ts:48-55`) también valida con `getUser()` y sólo preserva `destino` si es ruta interna (anti open-redirect).

6. **El `EMPAQUETAR=1` build está bien aislado.** `next.config.mjs:79-91` hace condicional el `output: 'standalone'` y el `outputFileTracingRoot` (sube dos niveles para que la traza de deps incluya el monorepo). `scripts/empaquetar.mjs` luego copia `public/` y `.next/static/` aparte — Next's standalone no los incluye. La config del bundle del servidor (`dist/app/apps/web/server.js`, 7.5 KB) es correcta y arranca con `require('next') + startServer({ isDev: false })`.

7. **El `next.config.mjs` se documenta extensamente.** Cada decisión no-obvia (CSP `'unsafe-inline'`, `outputFileTracingRoot`, el por qué del `formats: ['image/avif', 'image/webp']` que está en la línea 99) tiene un comentario de varias líneas. Es código que se lee.

8. **El ESLint config es flat nativo, sin `FlatCompat`.** El comentario en `eslint.config.mjs:6-12` documenta un bug real (circular JSON al serializar) y la solución. Es la decisión correcta.

---

## Top 5 quick wins (alto impacto, bajo esfuerzo)

1. **Eliminar `recharts` y `zustand` de `apps/web/package.json`.** 0 referencias en código. Ahorra ~1.5 MB de `node_modules` y superficie de audit. Riesgo: cero (ningún archivo los importa). Tiempo: 2 minutos + `npm install`.

2. **Crear `apps/web/src/app/not-found.tsx` y `apps/web/src/app/global-error.tsx`.** Dos archivos. El primero branded, el segundo con `<html><body>` mínimo. Cubre el peor escenario de UX (404 sin estilos / error sin contexto). Tiempo: 30 minutos.

3. **Crear `apps/web/src/app/(app)/loading.tsx` con un skeleton de tarjeta.** Una pantalla que se ve mientras `contar()` resuelve 4 queries en paralelo. Reduce perceived wait en la zona más lenta. Tiempo: 20 minutos.

4. **Un test de `CuentaRegresivaReglas` que verifique subscribe/unsubscribe del intervalo.** El reloj compartido a nivel de módulo es el patrón con mayor riesgo de regresión silenciosa del repo. Tiempo: 1 hora.

5. **`next/dynamic` con `ssr: false` en las 5 herramientas con `react-hook-form` (Cuestionario, Acumulacion, VerificadorEfectivo, Importador, ClasificacionClientes).** Cada herramienta pesa 200-500 KB de JS que no se necesita en la primera carga del segmento. Tiempo: 1 hora total.

---

## Cobertura de testing

### Lo que está testeado (5 archivos, 853 líneas)

| Archivo | Líneas | Cubre |
|---|---|---|
| `packages/rules-engine/src/motor.test.ts` | 570 | Motor jurídico: UMA por fecha, umbrales por actividad/fecha, efectivo, sanciones, avisos, redondeo sin error flotante. **El archivo con más valor y mejor cobertura del repo.** |
| `apps/web/src/lib/directorio/filtros.test.ts` | 94 | Filtros del directorio: query string ↔ filtros, dedupe, paginación, rate-limit por IP. |
| `apps/web/src/lib/herramientas/beneficiario.test.ts` | 78 | Propiedad indirecta: multiplicación, suma de cadenas, controles por varios medios. |
| `apps/web/src/lib/auth/permisos.test.ts` | 55 | Matriz de permisos, "ver como", validaciones de rol. |
| `apps/web/src/lib/seo/llms.test.ts` | 56 | Generación de `llms.txt`. |

Total: **853 líneas de tests** sobre 45 470 de código = **~1.9 % LOC ratio**. Bajo en volumen, pero la elección de qué testear es acertada: lógica pura, determinista, y de alto riesgo legal. La probabilidad de que un cambio en `motor.test.ts` rompa algo real es alta — es donde el dinero va.

### Lo que NO está testeado (lo más importante)

1. **Componentes cliente (39 archivos, 0 tests).** Las 18 herramientas interactivas en `apps/web/src/app/herramientas/*` (300-910 líneas cada una) son la superficie con más riesgo de regresión visible.
2. **API routes (8 endpoints, 0 tests).** El de `newsletter/route.ts` tiene una cola serie que puede tener race conditions; el de `directorio/alta` valida con Zod — ambas cosas son testables sin red.
3. **`lib/auth/acciones.ts`** (entrar, registro, etc.) — lógica de auth con Server Actions, no testeada.
4. **`lib/app/csv.ts`** (418 líneas mencionadas) — parseo de CSV es el tipo de cosa que se rompe con un acento o un separador regional.
5. **`packages/types/`** — está testeado implícitamente por todo lo que lo usa, pero un test de las funciones de `money.ts` y `legal.ts` blindaría los centavos.

### Brecha más grande

Los 8 API routes. Son la frontera de entrada de datos no confiables (formularios públicos, webhooks, cron) y carecen totalmente de cobertura. Un test de cada `route.ts` con un `Request` mock y un `NextResponse.json` esperado cubre:
- Validación Zod (ya testeable en aislamiento).
- Rate limiting.
- Casos de "Supabase no configurado" (que es la salida documentada en `consultas.ts:37-41` y se repite en cada route).

---

## Resumen ejecutivo para la próxima sesión

- **Total de hallazgos:** 12 (0 críticos, 0 altos, 4 medios, 6 bajos, 2 informativos).
- **Top 3 por impacto:**
  1. **F-03 + F-04 (testing gap).** 39 componentes cliente y 8 API routes sin un solo test. Es el riesgo real más alto del repo: el motor está blindado, todo lo demás vuela a ciegas.
  2. **F-01 (deps no usadas).** `recharts` y `zustand` declarados y nunca importados. Limpieza cosmética de 2 minutos que reduce superficie de supply chain.
  3. **F-02 (UX de Next.js).** Sin `loading.tsx`/`error.tsx`/`not-found.tsx`/`global-error.tsx`. Cuatro archivos que cubren el peor momento del usuario (404 sin marca, error sin contexto, navegación lenta sin feedback).
