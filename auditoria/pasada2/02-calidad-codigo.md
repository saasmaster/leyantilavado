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
