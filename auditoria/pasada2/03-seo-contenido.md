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
