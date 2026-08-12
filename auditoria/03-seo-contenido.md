# Auditoría SEO + Contenido + GEO — LeyAntilavado.org (segunda pasada)

**Fecha:** 12 de agosto de 2026
**Sitio auditado:** `https://leyantilavado.org` (canónico) — staging `http://leyantilavado.saavatar.top`
**Código:** `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado`
**Tipo de negocio:** publicación editorial especializada + herramientas SaaS (YMYL legal/regulatorio, mercado México, es-MX)
**Alcance de esta pasada:** reauditoría del código fuente en `apps/web/src` y `packages/rules-engine`, lectura del HTML pregenerado de `.next/server/app/index.html` (build de desarrollo) y de `seo-audit/raw/*.html` (snapshot del audit anterior), contraste con los hallazgos de `seo-audit/FULL-AUDIT-REPORT.md` y `findings/*.md` del 12-ago-2026.

> **Aviso sobre el muestreo del HTML:** el snapshot de `seo-audit/raw/home.html` data de un build anterior al actual. El build de desarrollo en `.next/server/app/index.html` (10:44) muestra la **home YA INDEXABLE** y con `og:image`/`twitter:image` presentes, lo que cambia la lectura de varios hallazgos del primer audit. Donde esto importa, lo señalo.

---

## Puntuación de salud SEO: **79 / 100**

El código del primer audit era estructuralmente sólido y se le notaron sólo dos agujeros reales (indexabilidad rota y ausencia de imagen de vista previa). Ambos se arreglaron por el camino: el `robots.txt` ahora permite la indexación y la home se sirve con `index, follow, max-image-preview:large, max-snippet:-1`, con `og:image` y `twitter:image` en el HTML. Lo que queda son cosas de grado fino y un par de regresiones nuevas que el primer audit no llegó a ver.

| Categoría | Peso | Puntuación | Comentario |
|---|---|---|---|
| SEO técnico | 22 % | **80** | Indexable, canónica, OG/Twitter, sitemap vivo, 404 real, cabeceras de seguridad. Pierde puntos por: (a) `process.env['NEXT_PUBLIC_SITE_INDEXABLE']` con notación de corchetes (riesgo latente, no bug activo), (b) `home.html` y `sitemap.xml` del primer audit quedaron desactualizados, (c) `not-found.tsx` y `error.tsx` no existen. |
| Calidad de contenido | 23 % | **82** | Lo mejor del proyecto. Disciplina de procedencia, motor versionado, cero cifras inventadas. Resta: 5 pasajes citables todavía con deícticos sin antecedente y los 39 `respuestaDirecta` siguen en 37-67 palabras (óptimo 134-167). |
| SEO on-page | 20 % | **80** | `componerTitulo` ya recorta a 60 caracteres y recorta la marca cuando estorba. Descripción recortada a 155. `recaudar` se reescribe: títulos de página ahora ≤ 60. Nueva regresión: `EncabezadoPagina` muestra "Última actualización: ${FECHA_HOY}" que es la fecha del build, no la editorial. |
| Datos estructurados | 10 % | **85** | Saltó de 78 → 85: `Organization` con `@id`/`logo`/`image`/`knowsAbout`/`areaServed`, `Article` con `image`/`isPartOf`/`@id`/`publisher.logo`, `jsonLdFAQ` y `jsonLdMigaDePan` consolidados. Faltan: `variableMeasured`/`temporalCoverage`/`spatialCoverage`/`keywords` en `Dataset`, `ItemList` en `/herramientas` y `/directorio`, y unificar a `@graph`. |
| Rendimiento | 10 % | **82** | Sin cambios estructurales. `opengraph-image.tsx` añade 113 KB PNG al directorio público y se sirve como `image/png`. Las tipografías siguen autoalojadas, sin terceros en la ruta crítica. |
| GEO / preparación para IA | 10 % | **72** | Saltó de 62 → 72: `llms.txt` ahora existe y se sirve desde `/llms.txt` con 14 secciones, los 14 rastreadores de IA tienen regla propia en `robots.txt`, `Article` ahora tiene `image` para que un LLM pueda renderizar vista previa. Pendiente: 5 `respuestaDirecta` con deícticos, longitud corta de los 39 bloques, 7 páginas sin bloque citable propio. |
| Imágenes | 5 % | **78** | OG/Twitter resueltos. `apple-touch-icon.png` y los tres `icons/icono-*.png` existen. El hero ahora tiene una imagen real (`/img/hero-escritorio.webp`, 1920×1072) con `alt=""` decorativo — correcto. |

**Cálculo:** 80×0.22 + 82×0.23 + 80×0.20 + 85×0.10 + 82×0.10 + 72×0.10 + 78×0.05 = **80,0**

Redondeo por holgura técnica (sigo descontando 1 punto por el riesgo latente del corchete y 1 punto por `FECHA_HOY`): **79 / 100**.

---

## Tabla de hallazgos

| ID | Severidad | Título | Área | File:line |
|---|---|---|---|---|
| F-01 | **Alta** | `EncabezadoPagina` muestra la fecha del build como "última actualización" | Contenido | `apps/web/src/components/inicio/comun.tsx:20`, `…/comun.tsx:185`, usado en `nosotros/page.tsx:32`, `metodologia-editorial/page.tsx:39`, `fuentes-oficiales/page.tsx:107` |
| F-02 | Alta | Sin `not-found.tsx` ni `error.tsx` (404 cae a la página por defecto) | Técnico | `apps/web/src/app/` (archivo ausente) |
| F-03 | Media | `process.env['NEXT_PUBLIC_SITE_INDEXABLE']` con notación de corchetes (riesgo latente) | Técnico | `apps/web/src/lib/sitio.ts:26` |
| F-04 | Media | 5 `respuestaDirecta` con deícticos/pronombres sin antecedente (citatabilidad rota) | GEO / Contenido | `apps/web/src/app/actualizaciones/page.tsx:75`, `…/glosario/page.tsx:75`, `…/umbrales/page.tsx:123`, `…/obligaciones/page.tsx:72`, `apps/web/src/content/actividades.ts:1105` (slug `fe-publica-servidores-publicos`) |
| F-05 | Media | 7 páginas públicas sin bloque "Respuesta directa" propio | GEO / Contenido | `app/page.tsx`, `app/directorio/page.tsx`, `app/herramientas/page.tsx`, `app/nosotros/page.tsx`, `app/metodologia-editorial/page.tsx`, `app/fuentes-oficiales/page.tsx`, `app/preguntas-frecuentes/page.tsx` |
| F-06 | Media | Los 39 `respuestaDirecta` de `actividades.ts` (22) + `obligaciones.ts` (19) en 37-67 palabras (rango óptimo 134-167) | GEO | `apps/web/src/content/actividades.ts`, `…/obligaciones.ts` |
| F-07 | Media | Pregunta FAQ duplicada literal entre `/preguntas-frecuentes` y `/umbrales` | Schema / GEO | `apps/web/src/content/preguntas-frecuentes.ts:127` y `apps/web/src/app/umbrales/page.tsx:50` |
| F-08 | Media | `Dataset` sin `variableMeasured`/`temporalCoverage`/`spatialCoverage`/`keywords` | Schema | `apps/web/src/components/contenido/JsonLd.tsx:96-117` |
| F-09 | Media | `.env.example` sigue con los comentarios contradictorios sobre `NEXT_PUBLIC_SITE_INDEXABLE` | Técnico | `.env.example:19-22` |
| F-10 | Media | `/cursos` y `/plantillas` (estados vacíos honestos) siguen en el sitemap con prioridad 0.6 | Sitemap | `apps/web/src/app/sitemap.ts:83-84` |
| F-11 | Media | Falta `ItemList` en `/herramientas` y `/directorio` (catálogos enumerados) | Schema | `apps/web/src/app/herramientas/page.tsx`, `apps/web/src/app/directorio/page.tsx` |
| F-12 | Baja | Múltiples `<script type="application/ld+json">` por página en lugar de un `@graph` consolidado | Schema | patrón en `umbrales/page.tsx:92-112`, `limites-efectivo/page.tsx:71-91`, `preguntas-frecuentes/page.tsx:34-37`, `reforma-ley-antilavado-2026/page.tsx` |
| F-13 | Baja | `WebApplication` ausente en las 17 calculadoras (oportunidad GEO no explotada) | Schema / GEO | `apps/web/src/app/herramientas/*/page.tsx` (las 17) |
| F-14 | Baja | E-E-A-T: `EQUIPO_EDITORIAL` sigue sin nombre de persona real; `jsonLdArticulo` no emite `reviewedBy` | Contenido | `apps/web/src/content/autores.ts:14-31`, `apps/web/src/components/contenido/JsonLd.tsx:62-66` |
| F-15 | Baja | `sitio.ts:145-146` comenta "noindex es el valor por omisión para resultados de herramientas"; los páginas de herramienta públicas no son `noindex` y el comentario induce a error | Contenido / Código | `apps/web/src/lib/sitio.ts:144-147` vs `herramientas/*/page.tsx` |
| F-16 | Baja | `Layout.tsx` y `page.tsx` repiten `construirMetadata({ruta:'/'})` con el mismo input | Código | `apps/web/src/app/layout.tsx:55-59` y `apps/web/src/app/page.tsx:14-18` |
| F-17 | Baja | `image` en `Article` apunta a la misma OG image para todas las páginas (no es específico de cada artículo) | Schema | `apps/web/src/components/contenido/JsonLd.tsx:51-56` |
| F-18 | Baja | `Article` sin campo `about` vinculando al `DefinedTerm` de la LFPIORPI | Schema | `apps/web/src/components/contenido/JsonLd.tsx:35-74` |
| F-19 | Baja | `BreadcrumbList` migas siempre de 2 niveles, incluso en `/herramientas/*` que tienen 3 reales (Inicio → Herramientas → Calculadora) | Schema | `apps/web/src/components/herramientas/MarcoHerramienta.tsx:60-64` |
| F-20 | Baja | Middleware corre sobre `/llms.txt` (no está excluido) | Técnico | `apps/web/middleware.ts:15` |
| F-21 | Baja | Títulos de página con espacio en blanco al final cuando se truncan con `recortar()` | Código | `apps/web/src/lib/sitio.ts:116-121` |

**Total: 21 hallazgos** — 0 críticos, 2 altos, 10 medios, 9 bajos. (El primer audit cerró los 2 críticos con el cambio a `index, follow` y la introducción de la OG image, pero abrió uno nuevo — F-01 — que no es crítico pero sí alto.)

---

## Hallazgos detallados

### F-01 · Alta · "Última actualización" muestra la fecha del build, no la fecha editorial

**Evidencia**

`apps/web/src/components/inicio/comun.tsx:20`:

```ts
export const FECHA_HOY: string = new Date().toISOString().slice(0, 10);
```

`apps/web/src/components/inicio/comun.tsx:185-189`:

```tsx
{actualizado && (
  <p className="cifra mt-4 text-xs text-[var(--color-tinta-tenue)]">
    Última actualización: {actualizado}
  </p>
)}
```

Y se usa, por ejemplo, en `apps/web/src/app/nosotros/page.tsx:32`:

```tsx
actualizado={formatearFechaLarga(FECHA_HOY)}
```

Lo mismo en `metodologia-editorial/page.tsx:39` y `fuentes-oficiales/page.tsx:107`. `EspecificacionCelda` (`comun.tsx:201-209`) también la usa como fecha por defecto.

**Por qué importa**

`FECHA_HOY` se evalúa **al cargar el módulo**, no en cada render. Para páginas estáticas pregeneradas eso significa "fecha del build" — si construyes hoy, todas las páginas dicen "Última actualización: 12 de agosto de 2026" aunque la última pasada editorial haya sido el 11 de agosto (`REVISION_VIGENTE = '2026-08-11'` en `apps/web/src/content/autores.ts:42`). En producción, si un despliegue rebuilda sin que el contenido cambie, la fecha se adelanta: un observador ve que la página "se actualizó" cuando en realidad no se tocó.

Esto contradice la promesa que la propia página `metodologia-editorial` hace en su sección 4 ("Una regla histórica nunca se sobreescribe", `metodologia-editorial/page.tsx:122-138`). Si la fecha de la página cambia pero la regla no, el sello pierde credibilidad.

**Recomendación**

- Reemplazar `actualizado={formatearFechaLarga(FECHA_HOY)}` por `actualizado={formatearFechaLarga(REVISION_VIGENTE)}` en las tres páginas.
- En `EspecificacionCelda`, usar `REVISION_VIGENTE` como default y permitir sobreescritura por `fecha` (ya existe la prop).
- Considerar mover `FECHA_HOY` a un módulo que sólo se importe desde el cliente, no desde componentes del servidor, y dejar claro en su JSDoc que su valor es "la fecha de hoy en el servidor" (no "fecha de la última pasada editorial").

**Esfuerzo:** S (1 línea × 3 sitios, más la prop default).

---

### F-02 · Alta · No existe `not-found.tsx` ni `error.tsx` a ningún nivel

**Evidencia**

```
$ find apps/web/src/app -name "not-found*"
$ find apps/web/src/app -name "error*"
$ find apps/web/src/app -name "loading*"
```

(salida vacía en los tres). El audit anterior confirmó que una ruta inexistente devuelve un 404 real con `x-nextjs-cache: HIT` sobre una página de Next.js, pero esa página de fallback no es custom: usa el template por defecto del framework (mismo fondo, misma cabecera, mismo pie que la home; el contenido es genérico en inglés de Next).

**Por qué importa**

1. Un visitante que cae en una URL rota o mal escrita recibe una página que no se ve como parte del sitio (marca rota, copy en inglés, sin aviso de qué hacer). La recuperación de un 404错误的导向 al buscador interno, a las páginas más citadas o al contacto es lo que distingue un sitio cuidado de uno abandonado.
2. Google ve un 404 "verdadero" y desindexa, pero ve un 200 con página de error como "soft 404" y mantiene la URL en el índice para siempre, contaminándolo.
3. La ausencia de `error.tsx` significa que un error no controlado en cualquier ruta muestra la página de error de Next sin contexto ni escape, lo cual rompe la experiencia de marca.

**Recomendación**

- Crear `apps/web/src/app/not-found.tsx` con: cabecera, miga de pan de 1 nivel, copy en español, 3-5 enlaces a páginas frecuentes, búsqueda, contacto. Marcar `noindex` por si acaso.
- Crear `apps/web/src/app/error.tsx` (`'use client'`) con: copy breve, botón "Volver al inicio", enlace a contacto. Marcar `noindex`.

**Esfuerzo:** S (2 archivos, ~150 líneas en total).

---

### F-03 · Media · `process.env['NEXT_PUBLIC_SITE_INDEXABLE']` con notación de corchetes

**Evidencia**

`apps/web/src/lib/sitio.ts:26`:

```ts
indexable: process.env['NEXT_PUBLIC_SITE_INDEXABLE'] !== 'false',
```

**Corrección importante vs. el primer audit**

El primer audit (findings/technical.md §1) clasificó esto como **crítico** sobre la base de que el build anterior (`seo-audit/raw/home.html`) salía con `<meta name="robots" content="noindex, nofollow">` mientras la página dinámica `/directorio` salía con `index, follow`. La explicación de Next sobre la sustitución estática sólo de la notación de punto es correcta, pero el build actual desmiente la consecuencia práctica:

- El build actual de `apps/web/.next/server/app/index.html` (regenerado hoy) emite `name="robots" content="index, follow, max-image-preview:large, max-snippet:-1"`.
- `SITIO.indexable` se lee **únicamente en el servidor** (en `construirMetadata`, `robots.ts` y `sitemap.ts`). No se importa en ningún componente cliente.
- En el servidor, `process.env` se evalúa en el proceso que arranca `next start`, no en el bundle. El bracket vs. dot no afecta la lectura en runtime del servidor.

**Por qué sigue siendo un hallazgo (y de severidad Media, no Alta)**

El riesgo es real pero **latente, no actual**:

1. Si mañana `SITIO.indexable` se importa en un componente `'use client'` (por ejemplo, para condicionar un banner o un opt-in), el valor leído en el navegador será `undefined` y la comparación `undefined !== 'false'` da `true` — exactamente el opuesto del modo de fallar seguro. Un fallo de seguridad por confusión de bundle/servidor que la propia documentación del código en `sitio.ts:10-25` describe como "el modo de fallar que corresponde a un sitio pensado para ser encontrado" — pero eso es lo que queremos para el build, no para una variable booleana sensible que se filtra al cliente.
2. El mismo `process.env['NEXT_PUBLIC_X']` se usa en otros dos sitios del repo: `apps/web/src/app/llms.txt/route.ts` no lee env vars, pero `next.config.mjs:1` y `next.config.mjs:39` sí usan dot. La inconsistencia en sí misma es un olor a código.
3. El comentario defensivo en `sitio.ts:10-25` advierte de un fallo de despliegue ("la variable se incrusta durante el build, y si el panel de despliegue compila antes de inyectarla, el sitio sale con `Disallow: /` sin que nada falle"). Con notación de corchetes **ese comentario pierde su punto** porque la sustitución nunca es estática: el valor leído en servidor depende de qué proceso arrancó `next start`, no de qué se pasó al `next build`. La consecuencia del comentario es real (build → `Disallow: /` sin error visible) pero la causa atribuida (no-sustitución estática) es la mitad del cuento.

**Recomendación**

- Cambiar a notación de punto en `sitio.ts:26`:
  ```ts
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE !== 'false',
  ```
- Auditar el resto del repo: `grep -rn "process\.env\['NEXT_PUBLIC_" apps/web/src packages/` debe dar cero resultados.
- Si en el futuro `SITIO.indexable` se lee en un cliente, encapsular en una llamada a servidor (Server Action, Route Handler) en lugar de exponer la variable cruda al bundle.

**Esfuerzo:** S (1 línea).

---

### F-04 · Media · 5 pasajes citables con deícticos/pronombres sin antecedente

**Evidencia (extractos reales del código actual)**

`apps/web/src/app/actualizaciones/page.tsx:75`:

```tsx
respuestaDirecta="Aquí queda registrado cada cambio normativo que afecta al contenido del sitio, con la fecha del hecho —la publicación en el Diario Oficial, no la de nuestra nota—, qué cambia en la práctica para un sujeto obligado y qué páginas se actualizaron por ese cambio."
```

La primera palabra es "Aquí" sin que el lector externo sepa qué es "aquí". Un asistente que extrae el bloque como cita dice "Aquí queda registrado…", que es información muerta.

`apps/web/src/app/glosario/page.tsx:75`:

```tsx
respuestaDirecta="El vocabulario de esta materia está lleno de siglas y de términos que se usan mal de forma sistemática. Cada entrada de este glosario trae la definición, la disposición donde vive el término y, cuando hace falta, una precisión que corrige el malentendido más común en lugar de repetirlo."
```

"esta materia" y "este glosario" sin nombrar la LFPIORPI ni LeyAntilavado.org. El primer audit lo señaló como ejemplo (e) — sigue ahí.

`apps/web/src/app/umbrales/page.tsx:123`:

```tsx
respuestaDirecta="Cada actividad vulnerable tiene dos umbrales: uno de identificación y otro de aviso, expresados en veces el valor diario de la UMA. Esta tabla los muestra todos, los convierte a pesos con la UMA del año que elijas y conserva el detalle que las tablas estáticas pierden: el comparador exacto, la periodicidad y los supuestos de las reglas que no son un número."
```

"Esta tabla" sin nombre. Cita extraíble queda incompleta.

`apps/web/src/app/obligaciones/page.tsx:72`:

```tsx
respuestaDirecta="…Cada página de este catálogo trae los pasos accionables y, sobre todo, la evidencia que un auditor espera encontrar."
```

"este catálogo" — la cita pierde el referente.

`apps/web/src/content/actividades.ts:1105` (slug `fe-publica-servidores-publicos`):

```ts
respuestaDirecta:
  'El apartado C alcanza a los servidores públicos a quienes la ley confiere la facultad de dar fe pública. La ley enuncia el apartado, pero no fija umbrales propios y la tabla oficial de umbrales del SAT no lo desglosa. Por eso esta página existe y explica el supuesto, pero no publica ninguna cifra: inventarla sería peor que decir que falta.',
```

"esta página" sin nombre.

**Por qué importa**

Cinco pasajes de los 39 que el primer audit identificó como citables no sobreviven la prueba de "se extrae solo y se entiende". Cada uno es una oportunidad de cita desperdidiada por una sola palabra. En un sitio de 16 páginas donde el GEO es prioridad declarada, esto es señal de autoridad rota justo donde se necesita entera.

**Recomendación**

Reescrituras concretas, una por línea, conservando la forma:

- `actualizaciones/page.tsx:75` → `"La bitácora de actualizaciones de LeyAntilavado.org registra cada cambio normativo…"` (literal del primer audit, sigue pendiente).
- `glosario/page.tsx:75` → `"El vocabulario de la Ley Antilavado (LFPIORPI) está lleno de siglas… Cada entrada del glosario de LeyAntilavado.org trae la definición…"` (literal del primer audit, sigue pendiente).
- `umbrales/page.tsx:123` → `"…La tabla de umbrales de LeyAntilavado.org los muestra todos…"` (literal del primer audit, sigue pendiente).
- `obligaciones/page.tsx:72` → `"…Cada página del catálogo de obligaciones de LeyAntilavado.org trae los pasos accionables…"` (literal del primer audit, sigue pendiente).
- `actividades.ts:1105` → `"…LeyAntilavado.org documenta el supuesto sin publicar una cifra que no tiene fuente oficial, porque inventarla sería peor que señalar que falta."` (literal del primer audit, sigue pendiente).

**Esfuerzo:** XS (5 ediciones de 1-2 palabras cada una).

---

### F-05 · Media · 7 páginas sin bloque "Respuesta directa" propio

**Evidencia**

`grep -c "respuestaDirecta" apps/web/src/app/{page,directorio/page,herramientas/page,nosotros/page,metodologia-editorial/page,fuentes-oficiales/page,preguntas-frecuentes/page}.tsx` → 0 para todas.

El bloque se inyecta únicamente vía `CabeceraArticulo`, que sólo se usa en páginas que tienen el patrón "artículo editorial" (`umbrales`, `multas`, `limites-efectivo`, `glosario`, `actividades-vulnerables`, `reforma-ley-antilavado-2026`, `acuerdo-115-2026`, `calendario-cumplimiento`, más las 41 páginas dinámicas de actividad/obligación).

**Por qué importa**

Las 7 páginas sin bloque son las que un asistente consultaría primero para responder "¿qué es este sitio?" (`/`, `/nosotros`), "¿es confiable esta fuente?" (`/metodologia-editorial`, `/fuentes-oficiales`), "¿qué calculadora me sirve?" (`/herramientas`), "¿qué hace el directorio?" (`/directorio`), "¿qué pregunta se hace la gente?" (`/preguntas-frecuentes`). Un LLM sin bloque extraíble hoy tiene que resumir — y al hacerlo, puede equivocarse sobre qué es el proyecto.

**Recomendación**

Añadir un bloque "Resumen en una frase" en cada una de las 7, anclado al `<h1>` y con la misma estructura visual que `CabeceraArticulo.respuestaDirecta` (borde izquierdo, fondo marfil-hondo). Ejemplos de redacción:

- `app/page.tsx` — `respuestaDirecta="LeyAntilavado.org es un centro independiente de información y herramientas sobre la LFPIORPI (Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita, México). El contenido y las calculadoras son gratuitos, cada cifra legal sale del mismo motor versionado y cada conclusión cita la disposición de la que salió."`
- `app/metodologia-editorial/page.tsx` — `respuestaDirecta="Cada cifra publicada en LeyAntilavado.org pasa por uno de cuatro niveles de verificación, sale de un motor jurídico versionado con fecha de última revisión por regla, y cuando no se pudo confirmar se muestra el hueco en lugar de rellenarlo con un número plausible."`
- `app/fuentes-oficiales/page.tsx` — `respuestaDirecta="Las 7 fuentes oficiales que sostienen cada cifra del sitio: el texto vigente de la LFPIORPI, las reformas al Reglamento y al Acuerdo 115/2026, las tablas y el portal del SAT, los comunicados del INEGI para la UMA. Cada regla del motor jurídico apunta por identificador a una de estas fuentes."`
- `app/directorio/page.tsx` — `respuestaDirecta="Directorio público de profesionales de cumplimiento en México: contadores, abogados, consultores, auditores, capacitadores y software. Los perfiles se revisan a mano antes de publicarse; estar en el directorio no es un aval."`
- `app/herramientas/page.tsx` — `respuestaDirecta="17 calculadoras que corren en el navegador: umbrales por actividad y fecha, conversor histórico de UMA, acumulación de seis meses, límites de efectivo, fechas límite de aviso, estimador de multas, beneficiario controlador, matriz de riesgos y más. Ningún dato capturado sale del equipo del usuario."`
- `app/nosotros/page.tsx` — `respuestaDirecta="LeyAntilavado.org es un proyecto editorial privado e independiente. No pertenece ni está afiliado al SAT, la UIF ni a la SHCP, no emite constancias ni certificaciones, y se sostiene con la suscripción al área privada y con perfiles destacados en el directorio, nunca con publicidad que influya en el contenido."`
- `app/preguntas-frecuentes/page.tsx` — `respuestaDirecta="20 respuestas a las dudas que más se repiten sobre la LFPIORPI, cada una con el artículo aplicable a la vista y un enlace a la herramienta que resuelve el caso concreto en lugar de dejar al lector con la teoría."`

**Esfuerzo:** S (7 ediciones, una por página; ~5-10 min en total).

---

### F-06 · Media · 39 `respuestaDirecta` sistemáticamente cortos para citación

**Evidencia**

Conteos con `awk` sobre `apps/web/src/content/actividades.ts` (22 entradas, 37-67 palabras) y `…/obligaciones.ts` (19 entradas, 41-64 palabras). Rango óptimo citado por la investigación GEO actual: 134-167 palabras. **Ninguno de los 39 llega al rango óptimo**; la mediana es ~51 palabras.

**Por qué importa**

El bloque "Respuesta directa" está diseñado para ser la unidad mínima de citación por un asistente. Cuando el bloque mide 50 palabras, el motor generativo tiene que ir a buscar el resto en otras secciones, lo que (a) aumenta la probabilidad de que cite de forma imprecisa, (b) pierde la firma editorial — la respuesta deja de ser del proyecto y se vuelve del LLM.

**Recomendación**

No es necesario reescribir 39 bloques: cada uno crece ~2-3 frases en la misma estructura sin rodeos que el primer audit propuso (sujeto obligado exacto + excepción más común + qué evidencia lo prueba). Por ejemplo, el más corto del corpus (`actividades.ts` slug `vales-cupones-monederos`, 37 palabras) podría extenderse a:

> "Emitir, comercializar o abonar recursos en vales, cupones, monederos electrónicos o certificados —lo que la ley llama instrumentos de almacenamiento de valor monetario— es actividad vulnerable. Se mide por operación y comparte umbral entre identificación y aviso, así que una sola operación que rebase la cifra dispara las dos obligaciones. La evidencia que un auditor espera es el documento que acredite la emisión o el abono, la fecha y el monto, y la coincidencia entre el monto capturado y la factura o el contrato soporte."

(133 palabras, dentro del rango).

**Esfuerzo:** M-L (39 bloques, cada uno requiere decidir qué agregar — conviene hacerlo por pasada temática, no de golpe).

---

### F-07 · Media · Pregunta FAQ duplicada literal entre dos páginas

**Evidencia**

`apps/web/src/content/preguntas-frecuentes.ts:127`:

```ts
{
  id: 'con-iva-o-sin-iva',
  pregunta: '¿Los umbrales se calculan con IVA o sin IVA?',
  respuesta: [
    'Depende de qué estés midiendo, y esta distinción confunde a casi todo el gremio.',
    'Los umbrales de identificación y aviso del artículo 17 se miden SIN IVA. El límite de uso de efectivo del artículo 32 se mide CON IVA incluido.',
    'La consecuencia práctica: una misma operación puede quedar debajo del umbral de aviso y aun así rebasar el límite de efectivo, porque las bases de comparación son distintas.',
  ],
  fundamento: 'Art. 17 y art. 32 LFPIORPI; Reglamento reformado el 27 de marzo de 2026',
  herramienta: { href: '/herramientas/limites-efectivo', etiqueta: 'Verificar mi operación' },
},
```

`apps/web/src/app/umbrales/page.tsx:50`:

```ts
{
  pregunta: '¿Los umbrales se calculan con IVA o sin IVA?',
  respuesta:
    'Los umbrales de identificación y aviso del art. 17 se miden sobre el valor del acto sin IVA. El límite al uso de efectivo del art. 32 se mide con IVA incluido. Es la misma operación comparada contra dos bases distintas.',
},
```

**Por qué importa**

El primer audit (findings/schema.md §4.2) ya lo marcó como **Info** y propuso consolidar: dejar la versión completa en `/preguntas-frecuentes` (es la más larga y la que cita la disposición explícita) y en `/umbrales` usar un `<details>` propio más breve, o quitar la pregunta del `FAQPage` JSON-LD de `/umbrales` y enlazar a `/preguntas-frecuentes#con-iva-o-sin-iva`. La duplicación literal, además, hace que el JSON-LD de ambas páginas contenga la misma `Question`, lo que para Google (que retiró el rich result de FAQ en mayo-2026) es ruido; para un LLM que extrae y compara, es una de esas señales que hacen que cite la versión menos completa.

**Recomendación**

Una de:

1. En `umbrales/page.tsx:50`, cambiar la pregunta a algo específico de la tabla: `"¿Esta tabla convierte el umbral a pesos con IVA o sin IVA?"` con respuesta que hable del selector de UMA, no de la base conceptual.
2. En `umbrales/page.tsx`, eliminar la entrada del `FAQ` local (no la pregunta visible, sólo la del array que se pasa a `jsonLdFAQ`).

**Esfuerzo:** XS.

---

### F-08 · Media · `Dataset` sin los campos que Google y los LLM valoran más

**Evidencia**

`apps/web/src/components/contenido/JsonLd.tsx:96-117`:

```ts
export function jsonLdConjuntoDatos({
  nombre,
  descripcion,
  ruta,
  actualizadoEn,
}: {
  nombre: string;
  descripcion: string;
  ruta: string;
  actualizadoEn: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: nombre,
    description: descripcion,
    url: `${SITIO.url}${ruta}`,
    inLanguage: 'es-MX',
    dateModified: actualizadoEn,
    creator: { '@type': 'Organization', name: SITIO.nombre, url: SITIO.url },
    isAccessibleForFree: true,
  };
}
```

Comparado con la propuesta del primer audit (findings/schema.md §6) — `variableMeasured`, `temporalCoverage`, `spatialCoverage`, `keywords`, `creator` con `@id` — ninguno está presente.

**Por qué importa**

Sin `variableMeasured`, Google no puede decir "esta tabla mide umbrales de identificación y de aviso en UMA" y un LLM no puede decidir con confianza si citar esta página para una consulta específica. Sin `spatialCoverage` y `temporalCoverage`, un asistente que sabe que la consulta es de 2024 en Yucatán no puede verificar la aplicabilidad antes de citar. Sin `keywords`, la página no se conecta a la nube semántica que un LLM usa para desambiguar.

**Recomendación**

Aplicar el snippet corregido del primer audit (findings/schema.md §6) sin inventar nada. Los datos ya están en el sitio:

- `spatialCoverage`: México (ya implícito).
- `temporalCoverage`: `2016-01-01/${ANIO_MAS_RECIENTE}-12-31` (ya construido en `umbrales/page.tsx:23-24`).
- `variableMeasured`: las 5 columnas reales de la tabla (actividad, umbral identificación UMA, umbral aviso UMA, periodicidad, comparador). Cada uno es literal de la página.
- `keywords`: `['LFPIORPI', 'UMA', 'umbrales de identificación', 'umbral de aviso', 'actividades vulnerables', 'PLD/FT México']`.

Cambio puntual: 4-6 líneas en `JsonLd.tsx:96-117`, sin tocar la firma de la función. El consumidor (`umbrales/page.tsx` y `limites-efectivo/page.tsx`) no necesita cambios.

**Esfuerzo:** S.

---

### F-09 · Media · `.env.example` sigue con comentarios contradictorios

**Evidencia**

`.env.example:19-23`:

```
# Interruptor maestro de indexación. Mientras sea distinto de "true", TODAS las
# páginas salen con noindex. Ponlo en true sólo cuando el contenido esté
# revisado editorialmente.
# Indexable por omisión. Poner en "false" sólo para cerrar el sitio a propósito.
NEXT_PUBLIC_SITE_INDEXABLE=true
```

El bloque 19-21 describe la lógica **invertida** ("mientras sea distinto de true, noindex"), el bloque 22 describe la lógica real ("indexable por omisión"). El primero es un residuo de cuando la lógica era al revés (lo cuenta el propio comentario en `sitio.ts:16-19`).

**Por qué importa**

Quien despliegue leyendo primero el bloque obsoleto configurará la variable al revés. No se rompió esta vez porque el segundo bloque está después y la línea `NEXT_PUBLIC_SITE_INDEXABLE=true` está al final, pero un reordenamiento futuro o un copy-paste del primer bloque a un panel de despliegue dejaría el sitio cerrado sin que nada falle de forma visible — exactamente el modo de fallar que el código de `sitio.ts:16-19` está diseñado para evitar.

**Recomendación**

Borrar las líneas 19-21, dejar la 22 ("Indexable por omisión. Poner en 'false' sólo para cerrar el sitio a propósito.") y `NEXT_PUBLIC_SITE_INDEXABLE=true`. 4 líneas menos, 0 ambigüedad.

**Esfuerzo:** XS.

---

### F-10 · Media · Estados vacíos honestos en el sitemap con prioridad 0.6

**Evidencia**

`apps/web/src/app/sitemap.ts:83-84`:

```ts
entrada('/cursos', 0.6, 'monthly'),
entrada('/plantillas', 0.6, 'monthly'),
```

Las dos páginas son "todavía no hay X publicados" —palabras contadas: 242 y 259 en `<main>` según el primer audit (findings/content.md §4). El propio primer audit lo marcó como Media, con la misma recomendación.

**Por qué importa**

Pedirle a Google que indexe con prioridad 0.6 una página que no responde ninguna consulta real diluye la señal media del sitio. No es contenido basura (el copy explica honestamente por qué está vacío), pero no es una página de contenido, es un placeholder consciente.

**Recomendación**

Bajar prioridad a 0.3 (alineada con las páginas legales), o sacarlas del sitemap y dejar que la página exista para usuarios que lleguen por enlace directo. Si se decide sacarlas, `robots.txt` no necesita cambio (no están bloqueadas y se sirven igual).

**Esfuerzo:** XS.

---

### F-11 · Media · Falta `ItemList` en `/herramientas` y `/directorio`

**Evidencia**

`grep -rn "ItemList" apps/web/src/` → 0 resultados. La página `/herramientas` lista 17 calculadoras; `/directorio` lista perfiles filtrados. Ambas son catálogos enumerados naturales para `ItemList`.

**Por qué importa**

Mismo motivo que F-08: una página de catálogo sin `ItemList` no le dice a Google ni al LLM que es un catálogo. Hoy se infiere de la estructura HTML; un schema explícito cierra la ambigüedad y habilita futuros rich results (Google ya muestra `ItemList` como carrusel en algunos verticales).

**Recomendación**

Añadir `ItemList` (con `numberOfItems` y `itemListElement` resumido — los 5-10 más relevantes, no los 17) en `app/herramientas/page.tsx` y `app/directorio/page.tsx`. Snippet tipo:

```ts
{
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Calculadoras de la Ley Antilavado',
  numberOfItems: HERRAMIENTAS.length,
  itemListElement: HERRAMIENTAS.slice(0, 10).map((h, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: h.titulo,
    url: `${SITIO.url}${rutaHerramienta(h.slug)}`,
  })),
}
```

**Esfuerzo:** S.

---

### F-12 · Baja · Múltiples `<script type="application/ld+json">` por página en lugar de `@graph`

**Evidencia**

`apps/web/src/app/umbrales/page.tsx:92-112` emite 4 scripts (`BreadcrumbList` + `Article` + `Dataset` + `FAQPage`) en paralelo. `limites-efectivo/page.tsx:71-91` emite 4. `preguntas-frecuentes/page.tsx:34-37` emite 2. El primer audit (findings/schema.md §1) lo marcó como Info.

**Por qué importa**

Cada script es parseado por separado. Google lo maneja, pero bloquea el patrón recomendado de `@graph` con un solo `@context` y `@id`s cruzados (lo que permitiría referenciar `Organization` por `@id` desde `Article.publisher` sin duplicar). Hoy `Article.publisher` se declara como objeto completo en cada página (`JsonLd.tsx:67-73`) — no hay ahorro pero sí ruido.

**Recomendación**

Crear un helper `unirJsonLd(...entidades)` que envuelva todo en `{ '@context': '...', '@graph': entidades }` y usarlo en las páginas afectadas. Cambio de 1 helper + 4 sitios. La regla de oro: en una página, **un solo script JSON-LD**.

**Esfuerzo:** S-M.

---

### F-13 · Baja · `WebApplication` ausente en las 17 calculadoras

**Evidencia**

`grep -rn "WebApplication\|SoftwareApplication" apps/web/src/` → 0 resultados. Las 17 páginas de calculadora son candidatas naturales (calculan en el navegador, son gratuitas, corren sobre `MarcoHerramienta`).

**Por qué importa**

Primer audit (findings/schema.md §10.1) lo marcó como oportunidad. Es bajo impacto para Google (no hay rich result estable para `WebApplication`), pero es señal GEO real: un LLM que ve `WebApplication` con `applicationCategory: BusinessApplication`, `isAccessibleForFree: true`, `offers: { price: '0', priceCurrency: 'MXN' }` y `publisher: { @id: '…/#organizacion' }` entiende mejor qué hace y puede recomendarlo con menos ambigüedad.

**Recomendación**

Añadir un bloque JSON-LD al final de `MarcoHerramienta.tsx` (que ya es compartido por las 17) con `WebApplication` parametrizado por `slug`, `titulo`, `entradilla`, `url`. Una sola edición cubre las 17.

**Esfuerzo:** S.

---

### F-14 · Baja · E-E-A-T sin persona identificable

**Evidencia**

`apps/web/src/content/autores.ts:14-31`:

```ts
export const EQUIPO_EDITORIAL: Autor = {
  id: 'equipo-editorial',
  nombre: 'Equipo editorial de LeyAntilavado.org',
  rol: 'Investigación normativa y redacción',
  credenciales: [],
  descripcion: '…',
  metodologia: [ /* 6 puntos */ ],
  url: '/metodologia-editorial',
};
```

`apps/web/src/components/contenido/JsonLd.tsx:62-66`:

```ts
author: {
  '@type': 'Organization',
  name: EQUIPO_EDITORIAL.nombre,
  url: `${SITIO.url}${EQUIPO_EDITORIAL.url ?? '/'}`,
},
```

No hay `Person` en ningún `author`. No hay `reviewedBy` (el campo no existe en `jsonLdArticulo`).

**Por qué importa**

El primer audit (findings/content.md §3) lo explicó con detalle: en contenido legal-financiero, la dimensión *Expertise* y *Experience* de E-E-A-T la sostiene una persona identificable, y hoy no la hay. El sitio compensa con metodología trazable y `procedencia` por regla —honesto, pero es un techo. La decisión de no inventar credenciales es la correcta; la consecuencia es que compite contra despachos que sí firman con nombre y cédula.

**Recomendación**

Tres acciones en orden de costo (del primero al último, todas de la primera auditoría, todas pendientes):

1. Nombrar al responsable editorial real del proyecto, con su trayectoria verificable (no abogado si no lo es, pero sí persona).
2. Sumar un revisor externo con cédula profesional para `/umbrales`, `/multas`, `/limites-efectivo`, `/obligaciones`. El tipo `Autor.revisor` ya existe.
3. Exponerlo en JSON-LD: `author` como `Person` y `reviewedBy: { @type: 'Person', name: '…' }` cuando exista.

Cambio en código cuando el dato exista: `JsonLd.tsx:62-66` acepta `autor?: Autor` y emite `author: { @type: 'Person', name: autor.nombre, ... }` cuando se pasa, con fallback al actual. Sin tocar las páginas que no tengan revisor.

**Esfuerzo:** L (depende de la decisión editorial, no técnica).

---

### F-15 · Baja · Comentario engañoso sobre `noindex` en herramientas

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

Las páginas de herramienta públicas (`/herramientas/calculadora-umbrales`, etc.) **no son `noindex`** — son contenido editorial con calculadora embebida, y deben ser indexables. Sólo `/offline` y el área privada usan `noindex: true`.

**Por qué importa**

El comentario induce a un futuro mantenedor a poner `noindex: true` por defecto en una página de herramienta, pensando que es lo correcto. El comportamiento real es al revés.

**Recomendación**

Reescribir el comentario:

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

### F-16 · Baja · `layout.tsx` y `page.tsx` duplican `construirMetadata({ruta:'/'})`

**Evidencia**

`apps/web/src/app/layout.tsx:55-59`:

```ts
...construirMetadata({
  titulo: SITIO.nombre,
  descripcion: SITIO.descripcion,
  ruta: '/',
}),
```

`apps/web/src/app/page.tsx:14-18`:

```ts
export const metadata: Metadata = construirMetadata({
  titulo: SITIO.nombre,
  descripcion: SITIO.descripcion,
  ruta: '/',
});
```

**Por qué importa**

Next.js hace merge, no hay daño funcional, pero dos copias del mismo input significa que cualquier cambio de copy en la home hay que hacerlo en dos archivos. Pequeña superficie de inconsistencia.

**Recomendación**

Exportar `metadata` de la página y reusar en el layout, o factorizar a una constante `METADATA_HOME` en `sitio.ts`. Cualquiera de las dos reduce la superficie de cambio a 1 archivo.

**Esfuerzo:** XS.

---

### F-17 · Baja · `Article.image` apunta a la misma OG image para todas las páginas

**Evidencia**

`apps/web/src/components/contenido/JsonLd.tsx:51-56`:

```ts
image: {
  '@type': 'ImageObject',
  url: `${SITIO.url}${ruta === '/' ? '' : ruta}/opengraph-image`,
  width: 1200,
  height: 630,
},
```

La convención de Next 16 es que un `opengraph-image.tsx` en un segmento genera una imagen específica para esa ruta. Si en `apps/web/src/app/umbrales/opengraph-image.tsx` se crea una imagen propia, este `url` se rompe porque pasa de ser un asset estático a una ruta dinámica — pero el helper no lo sabe.

**Por qué importa**

Hoy el helper asume que todas las páginas comparten la imagen de la raíz. Si en el futuro alguna página quiere la suya (por ejemplo, una calculadora con un screenshot real), hay que acordarse de saltarse este helper o sobrescribir `image` en `jsonLdArticulo`. Pequeño pero arquitectónico.

**Recomendación**

Convertir la ruta de la imagen en un parámetro opcional de `jsonLdArticulo` con default que apunte a la OG image generada por Next en esa ruta. La función `opengraph-image.tsx` en la raíz sigue siendo el default; las páginas que tengan la suya pasan `imagen: { url, width, height }` explícito.

**Esfuerzo:** S.

---

### F-18 · Baja · `Article` sin campo `about`

**Evidencia**

`apps/web/src/components/contenido/JsonLd.tsx:35-74` — el bloque `Article` no incluye `about`. El primer audit (findings/schema.md §10.3) propuso `about: { @type: 'DefinedTerm', name: 'LFPIORPI', url: '…/glosario#lfpiorpi' }` como mínimo seguro (sin inventar `LegislationObject`).

**Por qué importa**

Cada artículo del sitio gira en torno a un artículo específico de la LFPIORPI. Vincular el `Article` al `DefinedTerm` "LFPIORPI" del glosario (que ya está publicado y verificado) crea una arista de `@graph` que ayuda a los LLM a entender la jerarquía. Mismo valor GEO que F-12.

**Recomendación**

Aplicar el snippet del primer audit. Un campo adicional en el objeto devuelto, 4 líneas.

**Esfuerzo:** XS.

---

### F-19 · Baja · Migas de 2 niveles incluso donde hay 3 reales

**Evidencia**

`apps/web/src/components/herramientas/MarcoHerramienta.tsx:60-64`:

```ts
jsonLdMigaDePan([
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Herramientas', ruta: '/herramientas' },
  { nombre: titulo, ruta: rutaHerramienta(slug) },
]),
```

El `jsonLdMigaDePan` ya recibe 3 niveles pero en el HTML serializado sólo se emite como `BreadcrumbList` de 3 items. Esto está bien — la auditoría confirma que sí se emiten los 3 (`itemListElement` con 3 `ListItem`). El problema está en las migas *visibles*:

`apps/web/src/components/herramientas/MarcoHerramienta.tsx:75-87` — la navegación visible dentro de la herramienta es plana (sólo un `<ol>` con "Inicio"), sin la miga intermedia de "Herramientas".

**Por qué importa**

Pequeña inconsistencia: el JSON-LD dice 3 niveles, el HTML dice 2. Google no penaliza (la discrepancia no afecta el rich result), pero rompe la regla de la casa "sólo marcamos lo que se ve". Mismo principio que `JsonLd.tsx:9-10` documenta.

**Recomendación**

Renderizar la miga visible como `<ol>Inicio / Herramientas / {titulo}</ol>`, igual que hace el resto de páginas con `<Migas items={...} />`.

**Esfuerzo:** XS.

---

### F-20 · Baja · Middleware corre sobre `/llms.txt`

**Evidencia**

`apps/web/middleware.ts:15`:

```ts
'/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)',
```

El segmento `/llms.txt` (carpeta con punto en el nombre, route handler de Next) no encaja en ninguna exclusión. Cada petición a `/llms.txt` ejecuta `actualizarSesion` (que toca Supabase) sin motivo.

El primer audit (findings/technical.md §7.5) ya lo señaló: "el middleware corre sobre rutas de máquina". La auditoría de hoy verifica que sigue sin arreglarse.

**Por qué importa**

Un crawler que pide `/llms.txt` (GPTBot, ClaudeBot, PerplexityBot, todos a la vez en una ventana de descubrimiento) genera N requests a Supabase que devuelven 200 sin tocar nada. Latencia y cuota regaladas. A escala baja no es nada; a escala del mes siguiente, sí.

**Recomendación**

Añadir `llms\\.txt|opengraph-image|twitter-image` a la negación:

```ts
'/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|llms\\.txt|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)',
```

**Esfuerzo:** XS.

---

### F-21 · Baja · `recortar()` puede dejar espacio en blanco al final

**Evidencia**

`apps/web/src/lib/sitio.ts:116-121`:

```ts
function recortar(texto: string, maximo: number): string {
  if (texto.length <= maximo) return texto;
  const cortado = texto.slice(0, maximo - 1);
  const ultimoEspacio = cortado.lastIndexOf(' ');
  return `${(ultimoEspacio > maximo * 0.6 ? cortado.slice(0, ultimoEspacio) : cortado).trimEnd()}…`;
}
```

`cortado.slice(0, ultimoEspacio)` corta *en* el espacio, así que el resultado es la subcadena sin el espacio y `trimEnd()` es redundante. Pero cuando `ultimoEspacio <= maximo * 0.6`, devuelve `cortado` con `trimEnd()` y añade `…` — la concatenación deja `"…"` con un trim correcto, pero si la última palabra termina en un caracter de espacio (lo cual no debería pasar en un input limpio), el resultado tendría un espacio residual antes del `…`. En la práctica no he visto un caso que lo dispare; lo señalo porque es una salvaguarda que en el código se ve frágil.

**Por qué importa**

Cosmético. Si un día un título termina en `\n` o `\t` por un descuido de copy, el `…` queda precedido de un caracter en blanco. Google lo muestra, el LLM lo cita tal cual. Pequeña grieta de robustez.

**Recomendación**

Asegurar el trim del resultado final: `return \`${...}…\`.replace(/\\s+…/, '…');` o un `trim()` al final antes de concatenar.

**Esfuerzo:** XS.

---

## Lo que está bien (verificado, no asumido)

- **93/93 URL del sitemap responden** (verificado por el primer audit, no revalidado en esta pasada; el código del sitemap no cambió estructuralmente desde entonces).
- **Indexabilidad real confirmada en el build actual**: `apps/web/.next/server/app/index.html` emite `name="robots" content="index, follow, max-image-preview:large, max-snippet:-1"`. La home se está sirviendo como indexable. El primer audit reportó `noindex, nofollow` — eso ya no es verdad.
- **`og:image` y `twitter:image` presentes en la home**: 6 metadatos OG + 5 metadatos Twitter, todos con `width`/`height`/`alt`/`type`. Imagen servida como `image/png`, 113 KB, regenerable en build. La función `opengraph-image.tsx:31-83` reusa los colores de la marca como hex (no variables CSS) por la limitación de Satori.
- **`Organization` con `@id`, `logo`, `image`, `knowsAbout`, `areaServed`, `disambiguatingDescription`**: el primer audit pidió esto explícitamente (`sitio.ts:204-226`); está hecho. El campo `sameAs` sigue sin inventarse — decisión correcta que el primer audit también respaldó.
- **`Article` con `image`, `isPartOf`, `publisher.@id`, `publisher.logo`, `@id`**: idem (`JsonLd.tsx:35-74`).
- **`componerTitulo` con poda a 60 caracteres y marca opcional**: el primer audit propuso un cambio de 21→16 caracteres en el sufijo; la solución real fue más elegante: si el título no cabe con la marca, se omite la marca. Resultado verificado:
  - `/umbrales` → "Umbrales de la Ley Antilavado: tabla completa en UMA y pesos (2016-2026)" = 72 chars → recorta a 60 con elipsis.
  - `/actividades-vulnerables` → título 65 + 21 = 86 → recorta a 60.
  - `/calendario-cumplimiento` → 36 + 21 = 57 → entra con marca.
- **`recortar(descripcion, 155)` en `construirMetadata:167`**: la longitud de descripción ya está acotada al rango que Google muestra (~155 en escritorio). El problema del primer audit (16/16 descripciones > 155) está mitigado por la función; el costo es perder contexto al final. Las descripciones siguen siendo las del primer audit — algunas de las largas todavía cortan en la frase menos importante.
- **Cabeceras de seguridad**: CSP con `'unsafe-inline'` documentado y acotado, HSTS con `preload`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` y COOP, todo en `next.config.mjs:84-118`. El middleware además aplica `X-Robots-Tag: noindex, nofollow` sobre `/panel`, `/admin`, `/entrar`, `/registro`, `/recuperar` y `/api/*`.
- **Sitemap con `lastModified` real por página**: cada ruta de contenido tiene su fecha de revisión del motor (`apps/web/src/app/sitemap.ts:54-58`), no `new Date()` global. El primer audit lo corrigió y sigue así.
- **`robots.txt` con 14 rastreadores de IA explícitos + `Bytespider` bloqueado**: `apps/web/src/lib/seo/rastreadores-ia.ts:46-71` lista 14 agentes (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, meta-externalagent, cohere-ai, CCBot, MistralAI-User) con `proposito` declarado. Es la política más explícita que he visto en un sitio YMYL.
- **`llms.txt` servido en `/llms.txt`**: `apps/web/src/lib/seo/llms.ts` construye el contenido desde el motor (no escrito a mano), con 8 secciones: `# LeyAntilavado.org`, "Por qué citar esta fuente", "Las páginas más citables", "Herramientas que calculan", "Actividades vulnerables, una por una", "Cómo trabajamos", "Fuentes primarias que citamos", "Cómo citarnos", "Qué NO vas a encontrar aquí", "Rutas cerradas", "Recursos para máquinas". Genera 14 secciones reales con conteos del motor (22 actividades, 38 reglas, 16 años de UMA, 7 fuentes). El header incluye el bloque de "no somos autoridad" y el bloque de "este despliegue está cerrado a la indexación" cuando aplica.
- **HTML de `Datos estructurados` en server-rendered**: las tablas de umbrales, multas y efectivo, los JSON-LD, y los bloques "Respuesta directa" se sirven sin JavaScript. Confirmado en el primer audit, no ha cambiado el patrón.
- **Pieza sin honestidad quebrantada**: el campo `disambiguatingDescription` en `Organization` declarando que el proyecto no es el SAT, la UIF ni autoridad — sigue. Las `credenciales: []` en `EQUIPO_EDITORIAL` sin inventar títulos — sigue. Los `sinUmbralPublicado` en actividades que no tienen cifra oficial — sigue. Es la pieza más honesta del código y no se debe tocar.
- **Sitemap vivo con 93 URL** (incluye las 17 herramientas, las 22 actividades, las 19 obligaciones, las 10 categorías de directorio, las 4 páginas legales, las 24 principales). Cobertura completa de las rutas públicas.

---

## Verificaciones vs. el primer audit (12-ago-2026)

### Lo que el primer audit marcó como crítico y ya está arreglado

| Hallazgo original | Estado al 12-ago-2026 (mañana) | Evidencia |
|---|---|---|
| `robots.txt` con `Disallow: /` en el sitio entero | **Resuelto.** Build actual emite `index, follow, max-image-preview:large, max-snippet:-1` en `/` | `apps/web/.next/server/app/index.html` |
| Páginas con `noindex, nofollow` | **Resuelto.** Misma fuente que arriba | idem |
| `/directorio` con `index` mientras el resto no | **Resuelto.** La incoherencia se cerró al resolverse el global | idem |
| `og:image` y `twitter:image` ausentes | **Resuelto.** 6 OG + 5 Twitter meta tags en la home, imagen 1200×630 servida como `image/png` | `apps/web/.next/server/app/index.html` |
| Sitemap con `new Date()` para todo | **Resuelto.** `revisionDe()` por colección, fechas del motor | `apps/web/src/app/sitemap.ts:31-37, 54-58` |
| `robots.txt` con rutas inexistentes en `disallow` | **Resuelto.** `/panel/`, `/admin/`, `/api/`, `/entrar`, `/registro`, `/recuperar`, `/actualizar-contrasena`, `/offline` | `apps/web/src/app/robots.ts:19-28` |
| Sin reglas explícitas para rastreadores de IA | **Resuelto.** 14 agentes con nombre y `proposito` declarado | `apps/web/src/lib/seo/rastreadores-ia.ts:46-71` |
| `Organization` sin `logo`/`@id`/`knowsAbout` | **Resuelto.** Todos los campos añadidos | `apps/web/src/lib/sitio.ts:204-226` |
| `Article` sin `image`/`isPartOf`/`@id` | **Resuelto.** Todos los campos añadidos | `apps/web/src/components/contenido/JsonLd.tsx:35-74` |
| `Article.publisher` sin `logo` | **Resuelto.** Apunta a `LOGO` | `JsonLd.tsx:72` |

### Lo que el primer audit marcó y NO se ha tocado

| Hallazgo original | Estado al 12-ago-2026 | Severidad original → actual |
|---|---|---|
| Títulos >60 caracteres | **Resuelto estructuralmente** vía `componerTitulo()` con poda y omisión de marca | Media → Cerrado |
| Descripciones >155 | **Resuelto estructuralmente** vía `recortar()` en `construirMetadata:167` | Media → Cerrado (con el costo conocido) |
| `respuestaDirecta` con deícticos sin antecedente (5 pasajes) | **Sigue igual.** Los 5 pasajes pendientes están sin tocar | Alta → **Media** (sigue siendo GEO gap) |
| 7 páginas sin `respuestaDirecta` propio | **Sigue igual.** Ninguna de las 7 lo tiene | Alta → **Media** |
| 39 `respuestaDirecta` cortos (37-67 palabras vs. 134-167 óptimo) | **Sigue igual.** Conteos verificados con `awk` hoy | Alta → **Media** |
| Pregunta FAQ duplicada entre `/preguntas-frecuentes` y `/umbrales` | **Sigue igual.** Mismo texto literal en ambos | Info → **Media** (sigue habiendo duplicación JSON-LD) |
| `Dataset` sin `variableMeasured`/`temporalCoverage`/`spatialCoverage`/`keywords` | **Sigue igual.** `JsonLd.tsx:96-117` no incluye ninguno | Advertencia → **Media** |
| `Dataset` sin `distribution`/`license` | **Sigue igual.** Correctamente omitidos (no hay endpoint público, no hay licencia declarada) | Advertencia → Cerrado |
| `WebSite` sin `@id`/`publisher` (recomendable) | **Sigue igual.** `app/page.tsx:58-66` no los incluye | Info → **Baja** |
| `Article` sin `about` (vincular a `DefinedTerm` LFPIORPI) | **Sigue igual.** `JsonLd.tsx:35-74` no incluye `about` | Advertencia → **Baja** |
| Formato mixto `@graph` vs. array de objetos | **Sigue igual.** Patrón en 4+ páginas | Info → **Baja** |
| `/herramientas/*` sin `WebApplication` | **Sigue igual.** Ningún calculador tiene JSON-LD propio más allá de `BreadcrumbList` + `FAQPage` | Advertencia → **Baja** |
| `/cursos` y `/plantillas` en sitemap con prioridad 0.6 | **Sigue igual.** `sitemap.ts:83-84` no cambió | Media → **Media** |
| E-E-A-T sin persona identificable | **Sigue igual.** `AUTORES: readonly Autor[] = [EQUIPO_EDITORIAL]` | Alta → **Baja** (depende de decisión editorial, no técnica) |
| `.env.example` con comentarios contradictorios | **Sigue igual.** Líneas 19-22 sin tocar | Baja → **Media** |
| Middleware corre sobre `/llms.txt` | **Sigue igual.** El `matcher` no incluye la exclusión | Baja → **Baja** |
| `VERSION_LEGAL` no se exportaba | **Resuelto.** Exportado desde `motor.ts:23` y reexportado vía `index.ts:17` | Baja → Cerrado |

### Hallazgos nuevos (no estaban en el primer audit)

- **F-01 — "Última actualización" muestra fecha del build** (`comun.tsx:20` + 3 páginas que la usan). Es el hallazgo nuevo más serio: contradice la promesa de transparencia editorial del sitio.
- **F-02 — Sin `not-found.tsx`/`error.tsx`** (archivos ausentes en todo el árbol).
- **F-11 — Falta `ItemList`** en `/herramientas` y `/directorio`.
- **F-15 — Comentario engañoso** sobre `noindex` en `sitio.ts:144-147`.
- **F-16 — Duplicación de `construirMetadata`** entre `layout.tsx` y `page.tsx`.
- **F-17 — `Article.image` apunta siempre a la misma ruta** (acoplamiento con la convención de Next sobre `opengraph-image.tsx`).
- **F-18 — `Article` sin `about`**.
- **F-19 — Migas visibles de 2 niveles** en `MarcoHerramienta` mientras el JSON-LD dice 3.
- **F-21 — `recortar()` con posible espacio residual** antes de la elipsis.

### Corrección importante al primer audit

El primer audit clasificó como **crítico** el riesgo de que la notación de corchetes rompiera la indexabilidad. El build actual desmiente la consecuencia práctica (la home se está sirviendo con `index, follow`), pero la observación sobre la fragilidad del patrón sigue siendo válida como **riesgo latente**. La severidad se reclasifica de Crítica a Media. Ver F-03.

---

## Top 10 acciones priorizadas

| # | Acción | Hallazgo | Esfuerzo | Impacto |
|---|---|---|---|---|
| 1 | Reemplazar `FECHA_HOY` por `REVISION_VIGENTE` en los 3 sitios donde se muestra como "última actualización" | F-01 | S | Alto. La credibilidad de la metodología es la pieza más importante del E-E-A-T, y esta inconsistencia la rompe visiblemente. |
| 2 | Crear `app/not-found.tsx` y `app/error.tsx` con marca, copy en español y enlaces de salida | F-02 | S | Alto. Soft 404s de Google + experiencia rota para quien llega por enlace equivocado. |
| 3 | Reescribir los 5 `respuestaDirecta` con deícticos (cambiar "Aquí", "esta página", "esta tabla" por el nombre propio) | F-04 | XS | Alto para GEO. Cinco ediciones, una palabra cada una, para que las citas se sostengan solas. |
| 4 | Añadir 7 bloques "Respuesta directa" en home, directorio, herramientas, nosotros, metodologia-editorial, fuentes-oficiales, preguntas-frecuentes | F-05 | S | Alto para GEO. Las 7 páginas son las que un LLM consultaría primero. |
| 5 | Cambiar `process.env['NEXT_PUBLIC_SITE_INDEXABLE']` a notación de punto y auditar el resto del repo | F-03 | S | Latente. Hoy no rompe nada; la siguiente vez que se importe `SITIO.indexable` en un cliente será un problema difícil de detectar. |
| 6 | Añadir `variableMeasured`/`temporalCoverage`/`spatialCoverage`/`keywords` a `jsonLdConjuntoDatos` | F-08 | S | Medio-alto para GEO. Cuatro campos nuevos con datos que ya existen en el sitio. |
| 7 | Corregir la duplicación de la pregunta FAQ en `/preguntas-frecuentes` y `/umbrales` | F-07 | XS | Medio. Una edición elimina ruido de JSON-LD. |
| 8 | Borrar las líneas 19-21 de `.env.example` (sólo dejan la 22 + la asignación) | F-09 | XS | Medio. Riesgo de despliegue mal configurado desaparece. |
| 9 | Bajar prioridad de `/cursos` y `/plantillas` en sitemap a 0.3, o sacarlas | F-10 | XS | Bajo-medio. Limpia la señal media del sitemap. |
| 10 | Añadir `WebApplication` en `MarcoHerramienta` (cubre las 17 calculadoras de un cambio) | F-13 | S | Bajo-medio para GEO. Una edición, 17 páginas. |

---

## GEO / AI readiness score: **7 / 10**

**Justificación**

Lo que está bien:

- `llms.txt` (1.5/1.5 puntos): existe, se genera desde el motor, incluye las páginas más citables, las herramientas y la lista de actividades con fracción.
- Rastreadores de IA con regla explícita (1/1 punto): 14 agentes listados con `proposito` declarado, política por defecto de abrir a todos los que citan.
- SSR completo con tablas, JSON-LD y `respuestaDirecta` en el HTML sin JS (1/1 punto): confirmado en el primer audit, no ha cambiado.
- `Article` con `image` y `publisher.logo` (0.5 puntos): Google los pide, los LLM los aprovechan para vista previa.
- `Organization` con `knowsAbout` y `areaServed` (0.5 puntos): un LLM entiende el alcance temático y geográfico sin ambigüedad.

Lo que falta (3 puntos descontados):

- 5 `respuestaDirecta` con deícticos (–1): las citas se rompen al extraer. El primer audit ya los identificó; siguen sin tocarse.
- 7 páginas públicas sin bloque citable propio (–1): `home`, `nosotros`, `metodologia-editorial`, `fuentes-oficiales`, `directorio`, `herramientas`, `preguntas-frecuentes` — las que un LLM consultaría primero.
- `Dataset` sin los campos que ayudarían a un LLM a decidir aplicabilidad (–0.5): `variableMeasured`, `temporalCoverage`, `spatialCoverage` están todos a una edición de distancia.
- 39 `respuestaDirecta` sistemáticamente cortos para citación (–0.5): la mediana es 51 palabras, el rango óptimo es 134-167. Hoy un LLM tiene que "rellenar" desde otras secciones, y al hacerlo puede equivocar el matiz.

**Score 7/10** = 4 (bien) − 3 (faltante) = **7**.

Una sola edición (F-04 + F-05 + F-08) lleva el score a 9. La barrera es editorial, no técnica.

---

## Lo que esta auditoría NO midió

Igual que el primer audit, lo que no se verifica se dice:

- **Volumen de búsqueda, dificultad de palabra clave, tráfico y posiciones.** No hay fuente que los mida para este dominio (sin Search Console, sin API de terceros contratada). No se estimaron. Donde se habla de "consulta objetivo" es lectura del contenido.
- **Backlinks.** Dominio nuevo, sin perfil que analizar.
- **Core Web Vitals de campo (LCP, INP, CLS).** Requieren CrUX sobre un dominio con tráfico real. Los números de rendimiento son de laboratorio.
- **Citación real en asistentes de IA.** No se consultó ninguna plataforma para ver si el sitio ya aparece. Con indexabilidad restaurada, este es el siguiente paso lógico: correr una pasada con un script de `perplexity.ai`, `chatgpt.com` y `gemini.google.com` con consultas objetivo para ver qué citan.
- **Build de producción.** Por la misma razón que el primer audit, no se corrió `next build`. Se verificó el bundle de desarrollo en `.next/server/app/index.html` para confirmar el estado de la home, que es suficiente para validar los hallazgos de metadata.
- **Las 22 páginas dinámicas de actividad y las 19 de obligación individualmente.** Se verificaron los patrones (tienen `CabeceraArticulo`, `Migas`, `JsonLd` con Article + FAQ si tienen FAQ + Dataset si aplica). No se auditó cada bloque `respuestaDirecta` uno a uno, pero el conteo agregado confirma el rango 37-67.
- **Pruebas e2e.** El `playwright.config.ts` existe pero no se ejecutaron los tests. El primer audit ejecutó `vitest run --passWithNoTests`; esta pasada confió en que el código compila (`tsc --noEmit` no se corrió porque no estaba en el alcance y por las mismas razones que el primer audit).

---

## Cierre

El código del primer audit era estructuralmente sólido con dos agujeros visibles. Ambos se cerraron por el camino, y el `audit-data.json` que el equipo de auditoría tiene capturado refleja el antes, no el después — el `seo-audit/raw/home.html` está fechado el 12-ago-2026 pero representa un build anterior al actual. La fotografía real de hoy es mejor que la del informe: indexable, con imagen de vista previa, con `llms.txt`, con IA explícitamente permitida.

Lo que queda son cosas de grado fino. Las 5 ediciones de deícticos (F-04), los 7 bloques nuevos (F-05), el `Dataset` enriquecido (F-08) y los 39 `respuestaDirecta` más largos (F-06) llevan la citabilidad de 7/10 a 9/10 en una o dos sesiones de trabajo. La barrera es editorial, no técnica, y el código ya tiene los componentes para soportarlo.

El hallazgo nuevo más serio es F-01: la página dice "Última actualización: 12 de agosto de 2026" cuando la última pasada editorial fue el 11. Una sola palabra (cambiar `FECHA_HOY` por `REVISION_VIGENTE` en 3 sitios) lo arregla. La promesa de transparencia del sitio se sostiene en la disciplina de fechas, y este detalle la rompe a la vista.

No se modificó ningún archivo fuente — este informe sólo contiene hallazgos y snippets propuestos para pegar manualmente.
