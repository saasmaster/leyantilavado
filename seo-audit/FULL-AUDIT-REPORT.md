# Auditoría SEO + GEO — LeyAntilavado.org

**Fecha:** 12 de agosto de 2026
**Sitio auditado:** `http://leyantilavado.saavatar.top` (staging) · Dominio real futuro: `https://leyantilavado.org`
**Código:** `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado`
**Tipo de negocio detectado:** publicación editorial especializada + herramientas SaaS (nicho legal/regulatorio, YMYL), mercado México, es-MX
**Alcance:** 16 páginas descargadas y analizadas en HTML crudo (`seo-audit/raw/`), las 93 URL del sitemap comprobadas por estado HTTP, y lectura del código en `apps/web/src`, `packages/rules-engine` y `packages/types`.

---

## Puntuación de salud SEO: **72 / 100**

Y una advertencia que pesa más que el número:

> **Hoy el sitio es invisible: `robots.txt` responde `Disallow: /`.** El 72 es la puntuación
> *estructural* — lo que este código obtendría el día 1 de indexación si mañana se corrige el
> interruptor. La visibilidad real en este momento es cero, y ninguna otra recomendación de
> este informe sirve de nada hasta que se arregle el hallazgo crítico nº 1.

| Categoría | Peso | Puntuación | Comentario |
|---|---|---|---|
| SEO técnico | 22 % | **68** | Base sólida (prerender, cabeceras, 404 real, 93/93 URL vivas) rota por una variable de entorno mal leída y una navegación que no se renderiza en servidor |
| Calidad de contenido | 23 % | **74** | Lo mejor del proyecto. Penalizado por títulos/descripciones que se cortan y por autoría sin persona identificable |
| SEO on-page | 20 % | **70** | Jerarquía de encabezados impecable, canónicas correctas; títulos largos y enlazado interno cojo desde el encabezado |
| Datos estructurados | 10 % | **78** | Disciplinado y honesto (nada de marcado invisible); faltan `image` en `Article` y `logo` en `Organization` |
| Rendimiento | 10 % | **82** | TTFB ~0.2 s, HTML 22-48 KB comprimido; ~230 KB de JS en portada es el punto flojo |
| Preparación para búsqueda con IA (GEO) | 10 % | **62** | Arquitectura buena (SSR completo, procedencia trazable); faltaba `llms.txt` y sobran pasajes que no se citan solos |
| Imágenes | 5 % | **75** | El sitio no usa imágenes de contenido; faltaba imagen de vista previa (ya resuelta) |

**Cálculo:** 68×0.22 + 74×0.23 + 70×0.20 + 78×0.10 + 82×0.10 + 62×0.10 + 75×0.05 = **71.9**

---

## Los 5 hallazgos críticos

### 1. El sitio se contradice sobre si quiere ser indexado — **Crítico**

`robots.txt` en vivo dice `Disallow: /`. Las 15 páginas prerenderizadas emiten
`noindex, nofollow`. Pero `/directorio`, que es dinámica, emite `index, follow`.

La causa está en `apps/web/src/lib/sitio.ts:26`:

```ts
indexable: process.env['NEXT_PUBLIC_SITE_INDEXABLE'] !== 'false',
```

El acceso **con corchetes** derrota la sustitución estática de Next, que sólo reemplaza
`process.env.NEXT_PUBLIC_X` escrito con punto. Sin sustitución, el valor se lee en tiempo de
ejecución: las páginas prerenderizadas congelan lo que había durante el build y las dinámicas
leen lo que hay en el proceso servidor. Aquí difieren, y el sitio quedó partido en dos.

Efecto colateral latente: en un bundle de cliente ese valor sería `undefined`, y
`undefined !== 'false'` da `true`. Hoy no explota porque sólo se consume en servidor.

El comentario de `sitio.ts` explica que el valor por omisión es "indexable" precisamente para
que un olvido falle de forma visible. El razonamiento es correcto; el fallo entró por otra
puerta.

### 2. La navegación principal no existe para un rastreador — **Alta**

`components/Encabezado.tsx` es `'use client'` y el mega-menú se monta desde estado. En el HTML
servido no están sus enlaces.

Enlaces entrantes contados sobre las 16 páginas: `/umbrales` 28, `/multas` 25,
`/calendario-cumplimiento` 28 … pero **`/herramientas` 1** y **`/preguntas-frecuentes` 1**.
`/herramientas` es el índice de las 17 calculadoras, el activo diferencial del proyecto.

Duele el doble aquí porque los rastreadores de modelos de lenguaje —prioridad declarada— casi
nunca ejecutan JavaScript: ven un sitio sin menú.

Atenuante real: el sitemap lista las 93 URL y el cuerpo enlaza de forma cruzada, así que **no
hay ninguna página huérfana** (0 de 93). Lo que se pierde es reparto de autoridad y contexto.

### 3. No había ninguna imagen de vista previa — **Alta** *(resuelto)*

Cero `og:image` y cero `twitter:image` en las 16 páginas, mientras `construirMetadata` declaraba
`twitter.card = 'summary_large_image'`. Una tarjeta grande sin imagen se degrada a tarjeta chica:
cada vez que alguien compartía una página en WhatsApp o LinkedIn, aparecía un enlace desnudo.

### 4. Los pasajes citables no siempre se sostienen solos — **Alta** (GEO)

El bloque "Respuesta directa" está bien diseñado y confirmado en el HTML del servidor, pero:

- **7 de 16 páginas no lo tienen** — entre ellas `/fuentes-oficiales` y `/metodologia-editorial`,
  que son justo las que un asistente consultaría al preguntarse "¿esta fuente es confiable?".
- Los 39 bloques de actividades y obligaciones miden 37-67 palabras, por debajo del rango que
  se extrae bien como cita.
- **5 pasajes empiezan con un deíctico sin antecedente** ("Aquí queda registrado…", "…por eso
  esta página existe", "el vocabulario de esta materia"). Citados sin contexto no significan
  nada. Detalle y reescritura propuesta para cada uno en `findings/geo.md` §1.3.

### 5. Títulos y descripciones se cortan en el resultado de búsqueda — **Media**

**15 de 16 títulos** pasan de 60 caracteres (máximo: 92 en `/umbrales`) y **16 de 16
descripciones** pasan del largo útil (máximo: 266 en `/obligaciones`).

El sufijo `" | LeyAntilavado.org"` cuesta 21 caracteres en todas. Acortarlo a `" · LeyAntilavado"`
recupera 5 caracteres de un solo cambio y saca a tres páginas del rojo sin tocar el texto.

Los títulos actuales son buenos —tienen ángulo, no son listas de palabras clave—. El problema es
sólo de largo; al acortarlos, no aplanarlos.

---

## Los 5 arreglos rápidos de mayor retorno

1. **Notación de punto en `sitio.ts:26` + variable presente en tiempo de build.** Una línea.
   Desbloquea el 100 % de la indexación y del rastreo por IA.
2. **`llms.txt`** — *ya publicado*. Portada del sitio escrita para modelos, generada desde el
   motor: si mañana se adiciona una fracción al art. 17, el archivo lo dice solo.
3. **Imagen de Open Graph y de Twitter** — *ya publicadas*. Una imagen que heredan las 93 rutas.
4. **Acortar el sufijo del título** de 21 a 16 caracteres. Un cambio, 16 páginas mejoradas.
5. **Renderizar los enlaces del mega-menú en el HTML** y ocultarlos con CSS en vez de no
   montarlos. Alternativa aún más barata: un mapa del sitio en el pie, que ya se renderiza en
   servidor.

---

## Lo que está bien y conviene no romper

Un informe que sólo enumera fallas da una idea equivocada de este código. Lo verificado:

- **93 de 93 URL del sitemap responden 200.** Cero rotas, cero redirecciones.
- **404 real** en rutas inexistentes; `/umbrales/` → 308; `/Umbrales` → 404. Sin duplicados por
  barra final ni por capitalización.
- **Un solo `<h1>` por página y cero saltos de nivel** en las 16 páginas. `/multas` tiene 11
  `h2`, `/glosario` 19, `/actividades-vulnerables` 22 `h3`. Jerarquía real, con anclas e índice.
- **Todo el contenido está en el HTML del servidor**: las tablas de umbrales, multas y efectivo,
  y los bloques JSON-LD, se leen sin ejecutar JavaScript.
- **Cabeceras de seguridad completas**: CSP, HSTS con `preload`, `X-Frame-Options: DENY`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP. Y `X-Robots-Tag:
  noindex` verificado en `/entrar`, `/registro`, `/panel`, `/admin`, `/api/*`.
- **TTFB de ~0.2 s** con `x-nextjs-cache: HIT` en las páginas de contenido.
- **La regla de la casa "sólo se marca lo que se ve" se cumple al 100 %**: las 4 páginas con
  `FAQPage` muestran todas sus preguntas. No hay marcado que prometa algo que la página no da.
- **Ninguna cifra legal escrita a mano** en la UI. El sitemap se genera desde el motor y excluye
  solo las actividades que no pasaron verificación editorial.
- **`disambiguatingDescription` en el `Organization`** declarando que el proyecto no es el SAT
  ni una autoridad. Es una práctica honesta que casi nadie tiene.
- **Autoría sin inventar credenciales.** `credenciales: []` en vez de un "Lic. en Derecho Fiscal"
  ficticio. Cuesta puntos de E-E-A-T y aun así es la decisión correcta.

---

## Detalle por categoría

Cada categoría tiene su archivo con evidencia, severidad y arreglo:

| Archivo | Contenido | Puntuación |
|---|---|---|
| [`findings/technical.md`](findings/technical.md) | Indexabilidad, robots, sitemap, cabeceras, normalización de URL, middleware | 68 |
| [`findings/content.md`](findings/content.md) | Títulos, descripciones, encabezados, E-E-A-T, enlazado, contenido delgado | 74 |
| [`findings/schema.md`](findings/schema.md) | Inventario JSON-LD de 16 páginas, validación, snippets corregidos | 78 |
| [`findings/geo.md`](findings/geo.md) | Citabilidad por pasaje, rastreadores de IA, `llms.txt`, E-E-A-T legible por máquina | 62 |
| [`findings/performance.md`](findings/performance.md) | TTFB, peso de HTML y JS, tipografías, imágenes | 82 |

El plan priorizado está en [`ACTION-PLAN.md`](ACTION-PLAN.md), con una sección
**"Para el hilo principal"** que lista, archivo por archivo, los cambios que esta pasada no
podía tocar.

---

## Sobre `Dataset` y `HowTo` (las dos preguntas explícitas del encargo)

**`Dataset` en `/umbrales`: ya existe** — y también en `/limites-efectivo`. Está bien formado
(`name`, `description`, `url`, `inLanguage`, `dateModified`, `creator`, `isAccessibleForFree`).
Lo que le falta para ser realmente útil como fuente citable: `variableMeasured`,
`temporalCoverage`, `spatialCoverage` (México), `keywords` y, si algún día se publica la tabla
como CSV o JSON, `distribution` y `license`. Snippet corregido listo para pegar en
`findings/schema.md` §6.

**`HowTo`: no se recomienda en ninguna página.** Se evaluaron los cuatro candidatos con criterio,
no por reflejo. `/obligaciones/[slug]` sí tiene una secuencia real de pasos con evidencia —
estructuralmente califica— pero Google retiró el resultado enriquecido de HowTo en septiembre de
2023 y no hay señal de que vuelva: marcarlo hoy añade mantenimiento sin retorno.
`/herramientas/fecha-limite-aviso` es una calculadora con explicación de método, no un
procedimiento manual; `/herramientas/checklist-expediente` es un checklist interactivo, no
instrucciones dependientes; `/calendario-cumplimiento` es una línea de tiempo. **Que el sitio hoy
no use `HowTo` en ningún lado es correcto, no una omisión.**

---

## Lo que esta auditoría NO midió

Se dice explícitamente para que nadie tome por dato lo que no lo es:

- **Volumen de búsqueda, dificultad de palabra clave, tráfico y posiciones.** No hay fuente que
  los mida para este dominio: sin historial, sin Search Console, sin API contratada. No se
  estimaron ni se inventaron. Donde el informe habla de "consulta objetivo", es lectura del
  contenido.
- **Backlinks.** Dominio nuevo, sin perfil que analizar.
- **Core Web Vitals de campo (LCP, INP, CLS).** Requieren CrUX, que necesita tráfico real sobre
  un dominio con historial. Los números de rendimiento del informe son de laboratorio, desde una
  máquina y una red.
- **Citación real en asistentes de IA.** No se consultó ninguna plataforma para ver si el sitio
  ya aparece. Con `Disallow: /` activo la respuesta obvia es que no.
- **El build de producción.** Por instrucción explícita no se corrió `next build`. La
  verificación fue `tsc --noEmit`, `eslint`, `vitest` y un servidor de desarrollo.
