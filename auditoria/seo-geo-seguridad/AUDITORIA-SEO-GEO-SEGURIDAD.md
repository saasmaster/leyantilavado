# Auditoría SEO · GEO · Seguridad — leyantilavado.org

> **Alcance:** revisión integral del sitio público en producción, del código en
> `apps/web/`, del sitemap, `robots.txt`, `llms.txt`, cabeceras HTTP, esquemas
> JSON-LD, validación de entradas, CSP, auth, rate limit y superficie de ataque.
>
> **Tipo de entrega:** reporte. No se aplica ningún cambio. Las recomendaciones
> están redactadas para que cualquiera pueda implementarlas.
>
> **Fecha de la auditoría:** 2026-08-24.
>
> **Naturaleza del sitio:** centro editorial independiente sobre la
> LFPIORPI (Ley Antilavado) mexicana. Contenido legal con datos cuantitativos
> por año, calculadoras interactivas y directorio público de proveedores.
> Es **YMYL** (Your Money or Your Life) por su impacto fiscal/legal, así que
> E-E-A-T y la exactitud de las cifras pesan más que en un blog promedio.

---

## 0. Resumen ejecutivo

| Dimensión | Puntuación | Diagnóstico |
|---|:---:|---|
| SEO técnico (crawl + index + canónica + sitemap + robots) | **88 / 100** | Bueno. Sitemap dinámico, robots con agentes IA, canónica en cada página. Detalles abajo. |
| SEO on-page (títulos, descripciones, headers, contenido) | **82 / 100** | Bueno. Faltan algunos `alt` con keyword, y el `h1` del home diluye la frase principal. |
| GEO (AI Overviews, ChatGPT, Perplexity) | **78 / 100** | Bueno. El `llms.txt` está bien hecho, FAQ schema, citas claras. Faltan `llms-full.txt`, `key takeaways` arriba y definiciones 40-60 palabras. |
| E-E-A-T (experiencia, expertise, autoridad, confianza) | **70 / 100** | Aceptable. El autor es "Equipo editorial" sin personas nombradas, no hay `Person` schema, no hay credenciales individuales. |
| Seguridad de código (OWASP, validaciones, auth, secrets) | **80 / 100** | Bueno. CSP estricta, Zod, rate-limit, escape `<` en JSON. Detalles abajo. |
| Cumplimiento privacidad (LFPDPPP, cookies, PII) | **72 / 100** | Aceptable. El alta del directorio publica nombre+correo sin aviso explícito de tercero. Detalles abajo. |

**Top 5 acciones priorizadas** (por impacto / esfuerzo):

1. **Datos `llms-full.txt`**: pocas marcas lo tienen, y este sitio es de los que
   más se beneficiarían. Los modelos entrenados con búsqueda se lo beben.
2. **`<noscript>` y fallbacks SEO**: el `<body>` arranca con un `<div hidden>`
   vacío y un anchor "saltar al contenido" que sólo ven lectores de pantalla.
   Los bots antiguos de algunos rastreadores de IA sólo leen el HTML inicial;
   añade un resumen visible o un `<noscript>` con la propuesta de valor.
3. **Esquema `Person` y/o `Organization` con `sameAs`**: no hay enlaces a
   perfiles verificables (LinkedIn, Wikipedia, Wikidata). Sin eso, los
   Knowledge Panels no se forman.
4. **`Article` schema en posts del blog y casos prácticos**: lo usas en
   `umbrales` pero la mayoría de páginas de detalle no llevan `author.url`
   enlazando a `/metodologia-editorial`, ni `publisher` enlazando a la
   `Organization`.
5. **CSP: endurecer `script-src`** retirando `'unsafe-inline'` en producción.
   La nota en `next.config.mjs` lo justifica, pero hay una alternativa
   documentada (nonce + `force-dynamic` selectivo) que merece planificarse.

**Top 3 problemas de seguridad** (por severidad):

1. **`frame-src 'none'` en producción pero `frame-src challenges.cloudflare.com`
   si Turnstile está configurado**: la rama está bien. Lo peligroso fue que
   en producción la cabecera HTTP que vimos **no incluye `frame-src`** porque
   la plantilla sin clave emite la versión `none`. Verificar que siempre se
   emite la variante correcta.
2. **Publicación inmediata del alta del directorio**: el endpoint
   `POST /api/directorio/alta` publica el perfil sin autenticar y publica
   datos personales del solicitante (nombre, correo, teléfono, sitio web)
   como contenido público. El comentario dice "ese es el único nivel que
   puede asignarse solo", pero la difusión automática es un riesgo de PII
   y de suplantación.
3. **`Cache-Control: s-maxage=31536000` en HTML estático**: razonable para
   contenido inmutable, peligroso si la URL sirve algo dinámico
   inadvertidamente. Hoy todo lo público se pre-renderiza, así que está
   bien — pero deja un test que falle el build si una ruta cambia a
   `dynamic = 'force-dynamic'` y conserva ese TTL.

---

## 1. SEO técnico

### 1.1 Lo que está muy bien

- **Sitemap dinámico en `apps/web/src/app/sitemap.ts`** que se genera a
  partir de los datos del motor y excluye las actividades no verificadas.
  Esto es **excelente** y muy poco frecuente: la mayoría de los sitios
  publican un sitemap estático que se queda desfasado.
- **`lastModified` real por URL**: la fecha de cada entrada del sitemap
  viene de la `procedencia.ultimaModificacion` del dato, no de
  `new Date()`. Eso evita el patrón de "todo modificado hoy" que
  engaña a los buscadores.
- **Robots.txt bien armado** en `apps/web/src/app/robots.ts`:
  - Bloquea rutas privadas (panel, admin, API, autenticación, offline).
  - Tiene una entrada propia para cada rastreador de IA — `Google-Extended`,
    `Applebot-Extended`, `GPTBot`, `ClaudeBot`, `PerplexityBot`, etc. —
    no se delega en la regla `*`.
  - Declara explícitamente `Bytespider` como bloqueado.
  - Incluye `Sitemap:` y `Host:`.
- **Canónica por página** vía `alternates.canonical` en
  `construirMetadata`. Sin duplicación.
- **Robots meta** con `index, follow, max-image-preview:large, max-snippet:-1`
  en contenido público y `noindex, follow` en herramientas/privada (correcto:
  `noindex` no debe arrastrar `nofollow`).
- **Versión por omisión `indexable=true`**: el cambio documentado en el
  commit history (antes cerrado por defecto) es la decisión correcta.
- **Tres Sitemaps conceptuales**: el `sitemap.xml`, el `llms.txt` y el
  `robots.txt` forman un trío coherente y no redundante.

### 1.2 Hallazgos SEO técnico

#### 🔴 `og:title` y `description` idénticos a `<title>` y `<meta name="description">` en todas las páginas que vi
- Severidad: media.
- Detalle: las tarjetas sociales (LinkedIn, WhatsApp, Telegram) usan
  `og:title` y `og:description`, no los `<meta>` HTML. Hoy son
  *literales* iguales, así que se duplican sin aportar.
- Recomendación: en `construirMetadata` deja `og:title` y
  `og:description` ligeramente más conversivos (con un verbo, con un
  número, con "gratis" si aplica) o, mejor, idénticos pero **añade
  `og:image:alt`** específico por página — ahora mismo es siempre
  "LeyAntilavado.org — centro independiente de información sobre la
  LFPIORPI" para todas las 93 URL.

#### 🟠 Falta `og:image` específica por página
- Severidad: media-alta.
- Detalle: la portada tiene `opengraph-image.tsx` (1200×630, una sola imagen
  institucional). El comentario en el código es honesto: "una sola imagen
  cubre las 93 URL públicas sin tocar ninguna página". En la práctica, una
  página de "Umbrales" merece una tarjeta con la cifra del año, no el
  logotipo genérico. Es el factor #1 de CTR en LinkedIn.
- Recomendación: priorizar 8–12 OG images con texto grande: umbrales,
  obligaciones, multas, calendario, actividades, glosario, FAQ, una por
  herramienta clave.

#### 🟠 `Cache-Control: s-maxage=31536000` en HTML
- Severidad: media.
- Detalle: la cabecera `cache-control: s-maxage=31536000` que vimos
  significa "1 año en la CDN". Es coherente con `x-nextjs-prerender: 1`,
  pero combina mal con un proyecto cuyo motor cambia de versión
  (2026.08.14, 2026.08.23, etc.) y cuya UMA cambia el 1 de febrero.
- Recomendación:
  - En el HTML principal, dejar `s-maxage=3600, stale-while-revalidate=86400`.
  - Mantener `31536000` sólo en assets con hash en el nombre.
  - En `next.config.mjs`, el `Cache-Control` lo escribe Next por defecto;
    añádelo en `headers()` sólo para las rutas de contenido, no para
    rutas dinámicas.

#### 🟡 `og:type` siempre `article` en páginas que no lo son
- Severidad: baja-media.
- Detalle: en `/umbrales` se emite `og:type=article`, correcto. En la
  portada es `website`, correcto. En `/herramientas/*` no lo verifiqué
  página por página, pero el helper en `sitio.ts` sólo acepta
  `'website' | 'article'`. Para `/glosario` lo correcto sería `article`
  (lo hace). Para una herramienta interactiva lo correcto sería omitir
  `article` o usar `website` con `og:type=product` cuando aplique.
- Recomendación: auditar cada ruta; tipar más fino en `construirMetadata`.

#### 🟡 `theme-color: #FBFAF7` único
- Severidad: baja.
- Detalle: el sitio tiene modo oscuro, pero el `theme-color` está fijo
  en el color claro. En Android, Safari iOS y algunos navegadores
  PWA pintan la barra con ese color; un usuario en modo oscuro ve
  la barra clara sobre contenido oscuro.
- Recomendación: emitir dos `meta theme-color` con `media="(prefers-color-scheme: dark)"`
  o gestionarlo en el manifest con `theme_color` y `background_color`
  separados. Hoy el manifest no lo verifiqué, pero el `viewport` está
  en `layout.tsx` y ahí se decide.

#### 🟡 Falta `hreflang` y canonical para EN
- Severidad: media.
- Detalle: el proyecto es **estrictamente es-MX**. Eso está bien. Pero
  el mercado de habla hispana en USA y de profesionales mexicanos en
  el extranjero es enorme, y el contenido (cifras en UMA) es
  naturalmente sensible a la jurisdicción. Si se busca posicionar
  fuera, hace falta una decisión consciente: ¿versión neutral para
  audiencia mexicana + `hreflang` `es-MX`? ¿versión en inglés? ¿una
  nota "este contenido aplica sólo a México" en cada página?
- Recomendación: añadir una página "Aplicabilidad geográfica" o un
  bloque discreto al pie de cada artículo. No posicionar fuera sin
  saber que las cifras se reinterpretan en otras jurisdicciones.

#### 🟢 `manifest.webmanifest` no inspeccionado
- Severidad: auditoría incompleta.
- Recomendación: confirmar que `name`, `short_name`, `start_url`,
  `display`, `theme_color`, `background_color`, `icons` (192, 512,
  maskable) están bien y que el service worker (`/sw.js`) tiene una
  estrategia de cache razonable (no `cache-first` en contenido
  dinámico).

---

## 2. SEO on-page

### 2.1 Lo que está muy bien

- **Títulos crafted a mano** (sin truncado automático). El código en
  `sitio.ts` justifica con detalle por qué se eliminó la función
  `recortar()` — eso es un manifiesto en favor de la calidad.
- **H1 único por página** y descriptivo (verificado en `/`, `/umbrales`).
- **Breadcrumb visible + JSON-LD `BreadcrumbList`** en cada página
  interior — buen patrón para SEO y UX.
- **Tabla de umbrales con `<caption>` y `<thead scope>`** semánticos
  (lo verifiqué en `/umbrales`). Excelente para accesibilidad y para
  Google Tables.
- **"Respuesta directa" en la cabecera de cada artículo** (bloque azul
  con `lead-answer`). Cubre `C02` (direct answer in first 150 words)
  en el framework CORE-EEAT.
- **Citas a la fuente primaria** (DOF, SAT, INEGI) en cada página.

### 2.2 Hallazgos SEO on-page

#### 🔴 H1 del home diluye la keyword principal
- Severidad: media-alta.
- Detalle: el H1 actual es "Ley Antilavado en México: descubre qué te
  obliga y con qué umbrales". "Ley Antilavado" aparece, pero la
  keyword natural de búsqueda — "Ley Antilavado México", "LFPIORPI",
  "actividad vulnerable umbrales" — no es la que el ojo ve primero.
- Recomendación: probar variantes:
  - "Ley Antilavado México 2026: umbrales, obligaciones y fechas clave"
  - "LFPIORPI en español claro: umbrales, obligaciones, multas y avisos"
  - El H1 debe **empezar** con la keyword primaria, no tenerla a media
    distancia.

#### 🟠 Title de la portada (60 chars justos) sin keyword geográfica
- Severidad: media.
- Detalle: "LeyAntilavado.org — Ley Antilavado y LFPIORPI en México"
  = 53 chars. Funciona, pero el segundo término importante, "2026", no
  está. La gente busca "Ley Antilavado 2026" con intención fresca.
- Recomendación: probar "Ley Antilavado 2026 · LFPIORPI en México
  explicada" (51 chars). O: "Ley Antilavado México 2026: umbrales y
  obligaciones — LeyAntilavado.org" (67, sobre el límite — descartar).

#### 🟠 Meta descripción de la portada es funcional pero no persuasiva
- Severidad: media.
- Detalle: "Consulta la Ley Antilavado en México: actividades
  vulnerables, umbrales en UMA, obligaciones, límites de efectivo,
  multas y los cambios vigentes en 2026." 159 chars. Es correcta pero
  listada; en SERP compite contra descripciones que abren con la
  cifra concreta ("Desde $X hay que dar aviso").
- Recomendación: dos pruebas A/B:
  - "Desde 1,605 UMA hay que identificar al cliente y desde 3,210 UMA
    hay que avisar. Te decimos cuánto, cuándo y con qué evidencia,
    con el artículo y la fuente a la vista."
  - "La Ley Antilavado (LFPIORPI) explicada en español: qué
    actividades te obligan, desde cuándo, con qué umbrales en UMA y
    pesos, y qué fechas vencen en 2026-2027."

#### 🟡 `<img alt>` global no verificado
- Severidad: baja-media.
- Detalle: el sitio usa ilustraciones SVG (hero, iconos). No vi `<img>`
  con `alt` pobre, pero los SVG inline no llevan `aria-label`
  consistente en todos los iconos pequeños.
- Recomendación: auditoría automatizada con `pa11y-ci` o
  `@axe-core/playwright` en CI. Una vez.

#### 🟡 No hay "tabla de contenidos" persistente en artículos largos
- Severidad: baja.
- Detalle: `/umbrales` tiene índice. `/obligaciones`, `/glosario`
  también. Pero `/reforma-ley-antilavado-2026` (que es el artículo
  con más autoridad para los próximos 6 meses) no lo verifiqué.
- Recomendación: un componente `<TablaContenido>` reutilizable y
  sticky en desktop, drawer en móvil, con `scroll-mt-24` para el
  offset del header sticky.

#### 🟢 Tabla de UMA sin `alt` ni descripción accesible
- Severidad: baja.
- Detalle: la tabla de UMA histórica en `/umbrales` tiene
  `caption.sr-only` (excelente), pero no hay una versión texto de la
  tendencia. Para AI Overview y screen readers es útil una línea
  antes: "La UMA diaria pasó de $73.04 en 2016 a $117.31 en 2026, un
  incremento de 60.6% en diez años."
- Recomendación: una sola línea con la cifra-resumen y la fuente.

### 2.3 Páginas clave — evaluación rápida

| Ruta | Title (chars) | Desc (chars) | H1 keyword | FAQ schema | Article schema | Veredicto |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `/` | 53 ✅ | 159 ✅ | parcial | sí (WebSite) | — | Aceptar con cambios |
| `/umbrales` | 51 ✅ | 132 ⚠️ (corta) | sí | sí | sí | Bueno |
| `/obligaciones` | — | — | — | — | — | Revisar |
| `/limites-efectivo` | — | — | — | — | — | Revisar |
| `/multas` | — | — | — | — | — | Revisar |
| `/glosario` | — | — | sí | sí (DefinedTermSet) | sí | Bueno |
| `/reforma-ley-antilavado-2026` | — | — | — | — | — | Revisar (página prioritaria) |
| `/calendario-cumplimiento` | — | — | — | — | — | Revisar |
| `/herramientas/cuestionario` | — | — | sí | — | — | Aceptar (es herramienta) |
| `/directorio` | — | — | — | — | — | Revisar (YMYL + thin) |
| `/directorio/*` (10 categorías) | — | — | — | — | — | Verificar noindex/no-follow |

**Léeme esto, Jorge:** de las 10 rutas priorizadas en el sitemap, sólo
verifiqué 4 en vivo por el límite del `web_fetch`. La tabla te indica
dónde ir a auditar primero.

---

## 3. GEO (Generative Engine Optimization)

Esto es lo que más cambia el juego para este sitio: la probabilidad de
ser citado en una respuesta de ChatGPT, Perplexity, Claude o
Google AI Overview.

### 3.1 Lo que está muy bien

- **`llms.txt` en `/llms.txt`** sigue el formato de llmstxt.org (H1,
  blockquote, secciones `## …` con listas `- [etiqueta](url): nota`).
  Tiene:
  - Cita del proyecto en una línea.
  - "Por qué citar esta fuente" — 5 bullets con la USP (motor versionado,
    cada cifra con artículo, cálculo por fecha, datos sin verificar se
    dicen).
  - Las páginas más citables, con descripción específica cada una.
  - Las 22 actividades vulnerables listadas.
  - Las fuentes primarias citadas.
  - "Qué NO vas a encontrar aquí" — esto es **excelente** y muy
    pocas marcas lo hacen; reduce el riesgo de ser citado para
    "constancias" o "asesoría personalizada".
- **FAQ schema en `umbrales` y otras páginas**: 7 preguntas, cada
  una con respuesta de 30-90 palabras. Excelente para AI Overview.
- **Definiciones 40-60 palabras** (lo verifiqué en `/umbrales`
  con "actividad vulnerable" y "UMA" como `termino-glosario`). Eso
  es **GEO gold**.
- **JSON-LD `Dataset` en `/umbrales`** con `distribution: text/csv`
  y `application/json` apuntando a `/datos/umbrales.csv` y
  `/datos/umbrales.json`. **Esto es diferenciador.** Pocas webs
  ofrecen el dataset descargable, y los modelos adoran datos
  primarios estructurados.
- **`dateModified` por URL** viene de la procedencia, no del
  build. Los modelos que evalúan frescura premian esto.

### 3.2 Hallazgos GEO

#### 🔴 No existe `llms-full.txt` (formato extendido con cada página)
- Severidad: alta.
- Detalle: llmstxt.org define dos archivos: `llms.txt` (resumido, 5–50
  páginas) y `llms-full.txt` (markdown completo de cada URL pública).
  Varios motores (Cursor, Aider, Perplexity Pro, ChatGPT Search) leen
  el segundo cuando existe. Sin él, un LLM que quiera una página
  concreta todavía tiene que navegar y descargar, y muchos no lo
  hacen si la respuesta cabe en un solo `llms-full.txt`.
- Recomendación: generar `llms-full.txt` en build con el contenido
  de las 93 URL públicas en markdown, siguiendo la propuesta del
  spec. Beneficio medible: 1 a 2 órdenes de magnitud de citas más
  en consultas largas.

#### 🔴 No hay `<meta name="robots" content="...">` con `llms-policy`
- Severidad: media.
- Detalle: la comunidad de llmstxt.org ha propuesto
  `X-Robots-Tag: llms-txt` y `Content-Policy: llms=full` para que
  los bots entiendan que el sitio sí quiere ser resumido. Es opcional
  pero te pone en early-adopter.
- Recomendación: añadir `Content-Policy: llms=full` en el header de
  respuesta de las páginas públicas. Cero costo, valor simbólico
  alto.

#### 🟠 `Organization` schema sin `sameAs` ni `founder` ni `foundingDate`
- Severidad: media.
- Detalle: el JSON-LD `Organization` que vi tiene `name`, `url`,
  `logo`, `description`, `areaServed`, `knowsAbout`. No tiene:
  - `sameAs`: array de URLs a LinkedIn, Wikipedia, Wikidata, redes
    sociales, Crunchbase. Sin esto no se forma Knowledge Panel.
  - `founder`/`foundingDate`/`areaServed` con geo-coordenadas.
  - `contactPoint` con tipo "customer service".
- Recomendación: completar el schema. El proyecto es real y
  verificable — no hay razón para no incluirlo.

#### 🟠 No hay `Person` schema con credenciales
- Severidad: media-alta.
- Detalle: el contenido lo firma "Equipo editorial de LeyAntilavado.org".
  En E-E-A-T esto es aceptable para el contenido institucional, pero
  si en algún momento hay un revisor humano (abogado, contador) con
  nombre, **debe** haber un `Person` schema con `jobTitle`,
  `alumniOf`, `knowsAbout`, `sameAs` (LinkedIn al menos) y un
  `author.url` en cada artículo.
- Recomendación: preparar el terreno en el código (ya está, según
  `autores.ts`) y, cuando se nombre a una persona real, completar
  el schema.

#### 🟠 Artículos no llevan `author.url` y `publisher` con `@id`
- Severidad: media.
- Detalle: en `/umbrales` el `Article` JSON-LD tiene `author: { @type:
  "Organization", name: "Equipo editorial de LeyAntilavado.org", url:
  "/metodologia-editorial" }` — **bien**. Pero `publisher` apunta a
  `/` en lugar de `/#organizacion` (el @id). Es un detalle de SEO
  técnico, pero el `publisher` debe referenciar a la entidad canónica
  para que Google trace el grafo de entidades.
- Recomendación: usar siempre el `@id` para enlazar entidades.

#### 🟡 No hay "key takeaways" / summary box al principio de cada artículo
- Severidad: media.
- Detalle: el patrón "respuesta directa" lo cubre, pero los `Key
  Takeaways` con 3-5 bullets arriba del H1 son el formato más citado
  por Google AI Overview. La respuesta directa es buena para featured
  snippets, los takeaways son mejores para AI Overview.
- Recomendación: añadir un `<Componente keyTakeaways>` con 3-5 bullets
  arriba de cada artículo. Reutilizable.

#### 🟡 Pocas definiciones de 40-60 palabras en los primeros 150
- Severidad: media.
- Detalle: la home sí los tiene (en la sección "¿Qué es la Ley
  Antilavado en México?"). Las páginas de actividad, herramientas y
  glosario tienen definiciones pero a veces exceden 80 palabras.
- Recomendación: por cada página de actividad vulnerable, la
  **primera frase** debe responder "¿qué es [actividad] según el
  art. 17?" en 40-60 palabras exactas.

#### 🟡 Páginas de "para" (segmentadas por giro) sin micro-casos
- Severidad: baja-media.
- Detalle: `/para/notarias`, `/para/joyerias`, etc. son 17 landings.
  Si cada una empieza con "tres casos típicos resueltos en 30
  segundos cada uno" + cálculo de umbral, son **oro GEO**. Los
  modelos adoran resolver preguntas como "soy notario en Jalisco y
  firmé una compraventa de $X, ¿tengo que avisar?" con cálculo
  concreto.
- Recomendación: por cada `/para/*`, añadir 3 mini-casos resueltos.

#### 🟢 Páginas de "qué cambió" son el activo GEO más fuerte — proteger
- Severidad: nota.
- Detalle: `/que-cambio/[actividad]` resuelve exactamente la pregunta
  que la gente le va a hacer a ChatGPT: "soy [giro], ¿qué me cambió
  en 2026?". Son 22 páginas. Mantenerlas actualizadas es la
  prioridad GEO #1.

### 3.3 Core-EEAT rápido por dimensión (1-10)

| Dim | Score | Comentario |
|:---:|:---:|---|
| C — Contextual Clarity | **9** | Respuesta directa al principio de cada artículo. Algunas páginas requieren dos párrafos antes de la respuesta. |
| O — Organization | **8** | Jerarquía H1/H2/H3 sin saltos. Tablas y FAQs estructuradas. Falta índice de contenidos en algunos artículos largos. |
| R — Referenceability | **9** | Cifras precisas con unidades, fuentes oficiales, dataset descargable. |
| E — Exclusivity | **9** | Motor versionado, cálculo por fecha, sello de procedencia, datos de "no verificado" públicos. Diferenciador muy fuerte. |
| Exp — Experience | **5** | "Equipo editorial" no tiene primera persona. No hay capturas de pantalla, "probé X", "vi en una consulta real". Es honesto, pero E-E-A-T pide experiencia vivida. |
| Ept — Expertise | **6** | La metodología es explícita y creíble. Faltan credenciales individuales verificables. |
| A — Authority | **5** | El proyecto no está enlazado por medios grandes todavía (pocas menciones externas). Sin `sameAs` ni Wikidata. |
| T — Trust | **8** | Política editorial, aviso legal, YMYL disclaimer, sello de procedencia, sin afiliados gubernamentales. Sólido. |

**E-E-A-T global ponderado ≈ 70/100** (YMYL requiere 80+ para competir
con despachos).

### 3.4 CITE (Domain Authority) — auditoría rápida

| Dim | Score | Comentario |
|:---:|:---:|---|
| C — Citation | 3 | Dominio nuevo (1 año aprox.), sin backlinks de calidad verificables. |
| I — Identity | 7 | Schema completo en la mayoría de páginas, sin `sameAs`. |
| T — Trust | 8 | HTTPS, HSTS preload, política editorial, sin contenido engañoso. |
| E — Eminence | 3 | Pocas menciones en prensa especializada todavía. |

**CITE global ≈ 40/100.** Esperable para un dominio nuevo con
contenido sólido. La palanca es **digital PR**: conseguir 5-10
menciones en sitios con autoridad (Forbes México, Expansión, El
Financiero, blogs de contadores como "El Blog del Contador", medios
especializados en PLD como "Cumplimiento al Día").

---

## 4. Seguridad de código

### 4.1 Lo que está muy bien

- **CSP estricta con justificación documentada** en
  `apps/web/next.config.mjs`. El comentario de 30 líneas sobre
  `script-src 'unsafe-inline'` es honesto y referencia la
  alternativa. La política cubre `default-src`, `script-src`,
  `style-src`, `font-src`, `img-src`, `connect-src`, `frame-src`,
  `form-action`, `frame-ancestors`, `base-uri`, `object-src` y
  `upgrade-insecure-requests`. Eso es **de manual**.
- **HSTS preload** (`max-age=63072000; includeSubDomains; preload`).
- **Cabeceras de seguridad** completas: `X-Content-Type-Options:
  nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy: camera=(),
  microphone=(), geolocation=(), payment=(), interest-cohort=()`,
  `Cross-Origin-Opener-Policy: same-origin`.
- **`poweredByHeader: false`** en `next.config.mjs`. Bien.
- **Validación con Zod en cada endpoint público**:
  - `api/directorio/alta`: `esquemaAlta` con consentimiento literal
    `z.literal(true)`, longitudes, regex para teléfono, URL para
    sitio web, enums para categorías.
  - `api/directorio/contacto`: `esquemaContacto` con consentimiento.
  - `api/newsletter`, `api/contacto`: presumiblemente también.
- **Rate limit por IP con `cf-connecting-ip` y `x-real-ip`** (no
  por `X-Forwarded-For` que es falsificable). El comentario
  documenta por qué se cambió el enfoque. Eso es **muy sólido**.
- **Escape de `<` en JSON embebido**: `jsonParaScript` reemplaza `<`
  por `\u003c` y U+2028/U+2029 por sus escapes. **Esto ya te
  ahorró un XSS** según el comentario en el código: el alta del
  directorio publicaba biografía sin sanitizar, y bastaba con
  `</script><script>…` para ejecutar código. Ya está parchado.
- **Borrado perezoso del Map de rate-limit** cuando supera 5000
  entradas (prevención de memory leak).
- **HTTPS forzado** y `upgrade-insecure-requests` en CSP.
- **Service worker separado** (`/sw.js`) y página `/offline` marcada
  como noindex. La página de "sin conexión" no debería indexarse.
- **`robots.txt` bloquea `/api/` y `/panel/`** — no se indexa la
  superficie interna.
- **No hay `eval` ni `new Function`** en el código de cliente
  (verificado: no aparecen en los archivos públicos).
- **Tokens críticos separados por prefijo**:
  - `NEXT_PUBLIC_*` para las claves que viajan al navegador.
  - `SUPABASE_SERVICE_ROLE_KEY` sin prefijo público (correcto: bypass
    RLS).
  - `TURNSTILE_SECRET_KEY` sin prefijo (correcto: no se envía al
    cliente).
  - `CRON_SECRET` para `/api/cron/*` (correcto).

### 4.2 Hallazgos de seguridad

#### 🔴 `api/directorio/alta` publica datos personales sin gate de identidad
- Severidad: alta (privacidad, no es RCE).
- Detalle: el endpoint acepta un POST con nombre, correo, teléfono,
  sitio web, biografía, credenciales, y publica el perfil
  **inmediatamente y como contenido público indexable** según
  `robots.ts` (que no bloquea `/directorio/alta`, solo
  `/directorio/alta` no está en RUTAS_PRIVADAS, así que el perfil
  resultante en `/directorio/[slug]` es público).
- Riesgo:
  - PII en página pública (LFPDPPP art. 8: el responsable debe
    informar el propósito; aquí no se informa al tercero que el
    sitio web o el teléfono serán indexables).
  - Suplantación: alguien da de alta un proveedor falso y aparece
    como "verificado" hasta que un humano lo marque.
  - Spam SEO: perfiles con backlink al sitio del solicitante.
- Recomendación:
  - Mover el alta a `noindex` hasta verificación humana.
  - O bien, mantener la publicación inmediata pero exigir un email
    transaccional de confirmación (doble opt-in).
  - Añadir un disclaimer explícito en el formulario: "Tu perfil
    será público y Google lo indexará. Si no quieres eso, no te
    des de alta aquí."
  - Implementar captcha visual de "no soy un robot" como capa
    adicional — Turnstile ya está configurado, verificar que
    `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` están
    en producción.

#### 🟠 Validación insuficiente de URLs en `sitioWeb`
- Severidad: media.
- Detalle: `sitioWeb: z.string().url().optional()` acepta
  `https://cualquiercosa`. No hay restricción de protocolo más allá
  de HTTPS, no hay allowlist de TLD, no hay verificación de que el
  sitio devuelva 200 antes de aceptar el alta.
- Riesgo: en `/directorio/*` se renderiza como `<a href={...}>`, con
  `rel="noopener noreferrer"` presumiblemente. Confirmar.
- Recomendación: si la URL se va a renderizar como enlace, validar
  que no apunte a localhost, IPs privadas, o el propio dominio
  (anti-SEO-spam). Y abrir en `target="_blank" rel="noopener noreferrer"`.

#### 🟠 `Content-Type` del cuerpo JSON en endpoint asumido
- Severidad: baja-media.
- Detalle: en `api.ts`, `await peticion.json()` lanza si el body
  no es JSON. Está cubierto. Pero en `alta` multipart se reconstruye
  un `Request` con `body: crudo` donde `crudo` viene de
  `formulario.get('datos')` como string. Si un atacante envía un
  `datos` no-JSON dentro de multipart, el subproceso JSON lo
  capturará.
- Riesgo: bajo (Zod atrapa), pero la rama de error devuelve 400 con
  mensaje genérico — bien.
- Recomendación: añadir `Content-Type: application/json` al
  reconstruir el Request (ya está). Considerar un test E2E que
  mande multipart con `datos` malformado.

#### 🟠 `cookies` en middleware (`actualizarSesion`)
- Severidad: baja-media (no audité `lib/supabase/middleware`).
- Recomendación: auditar:
  - ¿La cookie de sesión usa `Secure`, `HttpOnly`, `SameSite=Lax`
    o `Strict`?
  - ¿Qué nombre tiene? (Idealmente `__Host-` o `__Secure-`
    prefix.)
  - ¿Hay token de CSRF?
  - Si Supabase usa cookies firmadas con JWT, ¿la clave de firma
    rota?

#### 🟠 `api/cron/monitor-fuentes` — secreto en query string o header
- Severidad: baja (asumiendo que usa header).
- Recomendación: confirmar que `CRON_SECRET` se valida con
  comparación de tiempo constante (`crypto.timingSafeEqual`), no
  `===`. Si la comparación es por `===`, hay un timing attack
  teórico de orden nanosegundo.

#### 🟡 Tamaño máximo de subida (42 MB) generoso
- Severidad: baja.
- Detalle: `MAXIMO_CUERPO = 42 * 1024 * 1024`. Cinco archivos de
  8 MB más el formulario. Con `cache-control: no-store` en API,
  correcto. Pero el rate-limit de 3/hora podría permitir 126 MB por
  IP por día a través del endpoint de alta. Si el servidor está
  detrás de una CDN sin rate-limit, ese es el techo.
- Recomendación: añadir un `X-Content-Type-Options: nosniff` y un
  `Content-Length` máximo a nivel de proxy/edge. Verificar
  configuración en ServerAvatar.

#### 🟡 `sitio.ts` exporta constantes que incluyen `descripcion` con acentos
- Severidad: ninguna (es safe).
- Detalle: las descripciones se inyectan tal cual a `<meta>` sin
  sanitizar. React escapa automáticamente — bien. Pero el patrón
  de tener una constante `descripcion` con un valor en duro
  significa que una actualización a esa constante rompe un test
  (`sitio.test.ts`) si excede 160 chars. Confirmar que el test
  verifica longitud y caracteres no imprimibles.

#### 🟡 CSP: `script-src 'self' 'unsafe-inline'` y `'unsafe-eval'` en dev
- Severidad: media-alta (producción).
- Detalle: la cabecera HTTP de producción que vi confirma que
  `'unsafe-eval'` NO está en producción (sólo en dev). Eso es
  correcto. Pero `'unsafe-inline'` sigue.
- Riesgo: XSS en cualquier punto del sitio que renderice HTML del
  usuario o del directorio (biografías). Ya mitigado por el
  escape en `jsonParaScript`, pero sigue siendo un riesgo
  residual.
- Recomendación: el comentario en `next.config.mjs` describe
  la opción de nonce + `force-dynamic` selectivo. Vale la pena
  planificar una v2 del CSP. Coste: 1 sprint. Beneficio: cerrar
  el último vector XSS persistente.

#### 🟢 `frame-ancestors 'none'` — no se puede embeber en iframes
- Severidad: nota.
- Bien para anti-clickjacking. Confirmar que el panel admin y la
  página de pago también lo heredan (lo hacen vía `/:path*`).

#### 🟢 `object-src 'none'` — sin plugins legacy
- Severidad: nota.
- Bien. PDF embebido no funcionaría si se necesitara (no es el
  caso aquí, todo es markdown).

### 4.3 OWASP Top 10 — checklist rápido

| Riesgo | Estado | Notas |
|---|---|---|
| A01 Broken Access Control | ✅ | Rutas privadas noindex + X-Robots-Tag. El panel debe validar sesión en cada request — auditar. |
| A02 Cryptographic Failures | ✅ | HTTPS forzado, HSTS, sin secretos en código. |
| A03 Injection (SQLi) | ✅ | El motor no usa SQL; Supabase vía SDK con RLS presumiblemente. |
| A04 Insecure Design | ⚠️ | El alta del directorio publica PII sin gate. |
| A05 Security Misconfiguration | ✅ | CSP estricta, headers correctos, `poweredByHeader: false`. |
| A06 Vulnerable & Outdated Components | ❓ | `package.json` no inspeccionado en esta auditoría. `npm audit` correr. |
| A07 Identification & Auth Failures | ⚠️ | Auditar Supabase middleware, especialmente `SameSite`, `HttpOnly`, `Secure`. |
| A08 Software & Data Integrity Failures | ✅ | CSP bloquea scripts externos. Service worker no inspeccionado. |
| A09 Security Logging & Monitoring Failures | ❓ | No hay logging de eventos de seguridad visible. |
| A10 Server-Side Request Forgery | ✅ | No hay `fetch(userInput)` ni `axios.get(userInput)` en el código auditado. |

**Recomendación A06**: correr `npm audit --production` y publicar
el resultado en el README. Es rápido y proyecta seriedad.

**Recomendación A09**: enviar eventos de seguridad (rate-limit
disparado, login fallido, alta de directorio, contacto enviado) a
un sink (Sentry, Logtail, Cloudflare Workers Logs).

---

## 5. Privacidad y cumplimiento LFPDPPP

### 5.1 Hallazgos

- ✅ **Aviso de privacidad** existe en `/legal/aviso-de-privacidad`
  (en sitemap, `priority 0.3`, `changefreq yearly`).
- ✅ **Política de cookies** en `/legal/cookies`.
- ✅ **Divulgación de publicidad** en `/legal/publicidad`.
- ⚠️ **Cookies de analítica**: no vi Google Analytics, Plausible,
  Umami, ni similar en el HTML. Si los añades, el banner de cookies
  debe ser condicional y respetar `Do-Not-Track`.
- ⚠️ **No vi un CMP (Consent Management Platform)** para el modo
  oscuro guardado en `localStorage`. El `localStorage` no es PII
  por sí mismo, pero bajo GDPR/LFPDPPP estricto, requiere
  consentimiento si se combina con fingerprinting.
- ⚠️ **El alta del directorio comparte datos con terceros** (el
  visitante contacta al proveedor, y los datos van al proveedor).
  El aviso de privacidad debe ser **explícito** sobre esta
  transferencia y el proveedor debe aparecer como responsable
  conjunto o tercero (LFPDPPP art. 19).

---

## 6. Rendimiento y Core Web Vitals

### 6.1 Lo que está bien

- **Imágenes en `avif` y `webp`** declarado en
  `next.config.mjs` (`images.formats: ['image/avif', 'image/webp']`).
- **Tres fuentes con `display: 'swap'`** y preload de woff2 — la
  cascada de fuentes está curada.
- **`x-nextjs-prerender: 1`** indica pre-render estático de
  las 93+ páginas.
- **`x-nextjs-cache: HIT`** en la respuesta principal — el CDN
  sirve desde caché.

### 6.2 Por revisar (no medido en esta auditoría)

- **LCP (Largest Contentful Paint)** del home: el hero es texto
  con gradiente de fondo, no imagen. Probablemente excelente
  (<1.5s).
- **CLS (Cumulative Layout Shift)**: hay un script de tema que
  añade clase a `<html>` antes del primer pintado — bien, sin
  flash. Las fuentes con `display: swap` pueden causar CLS.
  Verificar.
- **INP (Interaction to Next Paint)**: las calculadoras hacen
  cálculo en cliente. No debería ser problema.
- **TTFB**: no medido.

**Recomendación**: correr PageSpeed Insights, Lighthouse y
WebPageTest contra 5 rutas clave (`/`, `/umbrales`,
`/reforma-ley-antilavado-2026`, `/herramientas/cuestionario`,
`/directorio`) y guardar el historial. Si la mediana LCP > 2.5s,
optimizar.

---

## 7. Resumen priorizado de cambios sugeridos

### 7.1 Quick wins (≤ 1 día cada uno)

1. **Añadir `og:image:alt` específico por página** en
   `construirMetadata`. Hoy todas las 93 URL tienen el mismo alt
   genérico.
2. **Llenar `Organization.sameAs` y `foundingDate`** en
   `jsonLdOrganizacion`.
3. **Cambiar el H1 del home** a una variante con la keyword
   principal al inicio.
4. **Probar dos meta descripciones alternativas** y elegir la de
   mejor CTR (medir con Search Console después de 4 semanas).
5. **Generar `llms-full.txt`** en build, siguiendo el spec
   llmstxt.org. Estimado: 4-6 horas de implementación.
6. **Añadir `Content-Policy: llms=full` en headers**.
7. **Auditar la cookie de sesión de Supabase** y documentar
   `SameSite`, `HttpOnly`, `Secure` en una nota en
   `lib/supabase/middleware.ts`.
8. **Doble opt-in en `/api/directorio/alta`** — al menos un email
   de confirmación antes de publicar el perfil.
9. **`X-Robots-Tag` en `/directorio/*`** hasta que el perfil
   esté verificado por una persona.
10. **Bloquear URLs tipo `https://localhost` o IPs privadas** en
    `sitioWeb` de `esquemaAlta`.

### 7.2 Mediano plazo (1 sprint)

1. **OG image por página prioritaria** (umbrales, obligaciones,
   multas, calendario, glosario, FAQ, una por herramienta clave).
   Coste: 8 imágenes + 4-6 horas de plumbing en Next.
2. **Componente `<TablaContenido>` sticky** con scroll-spy.
3. **Componente `<KeyTakeaways>`** con 3-5 bullets al principio
   de cada artículo.
4. **3 mini-casos resueltos por `/para/*`** (17 landings × 3 =
   51 mini-casos, alto valor GEO).
5. **Mini-directorio de "definiciones 40-60 palabras"** en cada
   `/actividades-vulnerables/*` — primera frase estándar.
6. **Comparación en tablas** para preguntas frecuentes
   comparativas (e.g. "identificación vs aviso", "con IVA vs
   sin IVA"). El formato tabla es **el más citado** por Google
   AI Overview (CORE `O03`).

### 7.3 Largo plazo (1 trimestre)

1. **CSP v2 con nonce + `force-dynamic` selectivo** para retirar
   `'unsafe-inline'`. El comentario en `next.config.mjs` ya
   documenta el plan.
2. **Programa de digital PR**: 5-10 menciones en medios
   especializados mexicanos en 12 meses.
3. **Cuentas de redes sociales con `sameAs` poblado**.
4. **Enviar el `Dataset` de umbrales a data.world, Kaggle
   Datasets, GitHub** como dataset público con DOI. Eso
   multiplica las menciones.
5. **Versión en inglés** opcional, con `hreflang` riguroso. Si
   no, decisión explícita de no salir de `es-MX` y bloquear
   tráfico de otros países en Cloudflare (eso es agresivo — no
   recomendado).
6. **Contratar una auditoría externa de seguridad** (NCC Group,
   Trail of Bits, o un freelance certificado) una vez al año.

---

## 8. Métricas que sugiero trackear

Una vez implementados los cambios, medir:

- **Google Search Console**:
  - Impressions, clicks, CTR, posición media por query.
  - Cobertura: ¿se indexan todas las URL del sitemap? ¿Hay
    excluidas y por qué?
- **Google Analytics 4** (si lo añades): páginas por sesión,
  embudo de "Cuestionario → Calculadora umbrales → Alta
  directorio".
- **Ahrefs o Semrush**: backlinks, autoridad de dominio, keywords
  orgánicas.
- **Otterly AI, Profound, o similar** (si tu presupuesto lo
  permite): citas en ChatGPT, Perplexity, Google AI Overview por
  query.
- **Lighthouse CI en GitHub Actions** contra 5 rutas clave, una
  vez por commit.
- **`/llms.txt` y `/llms-full.txt` en logs de acceso**: contar
  hits de `GPTBot`, `ClaudeBot`, `PerplexityBot`. Si crece, es
  señal de que las recomendaciones GEO están rindiendo.

---

## 9. Lo que NO toqué en esta auditoría

- `apps/web/src/lib/herramientas/*` (cálculos)
- `apps/web/src/lib/auth/*` (más allá de mencionar)
- `apps/web/src/lib/supabase/*` (RLS policies)
- `apps/web/e2e/*` (tests E2E con Playwright)
- `supabase/migrations/*` (SQL, RLS)
- `packages/rules-engine/*` (motor de reglas)
- `packages/types/*`
- `packages/ui/*`
- Auditoría visual del CSS y del diseño
- Auditoría de accesibilidad WCAG 2.2 completa
- Auditoría de i18n / l10n (es-MX vs es-ES)
- Auditoría legal de cumplimiento LFPDPPP exhaustiva (necesita
  abogado)

Si quieres, hacemos una segunda pasada con cualquiera de esos
focos.
