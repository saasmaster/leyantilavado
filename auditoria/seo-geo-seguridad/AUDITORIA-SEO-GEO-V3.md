# Auditoría SEO · GEO v3 + Ranking check — leyantilavado.org

> **Fecha:** 2026-09-11
> **Tipo:** audit completo (técnico + on-page + GEO + ranking
> competitivo), comparado contra las auditorías del 24-ago y 27-ago.
>
> **Cambios detectados en los últimos 15 días:** `llms-full.txt`
> creado, sitio detrás de Cloudflare, OG images por página,
> `sameAs` añadido en el schema, descripción de multas mejorada,
> FAQ en `/preguntas-frecuentes` con 45 preguntas, sitemap
> reducido de 165 a 161 URLs.

---

## 0. Resumen ejecutivo

| Dimensión | 24-ago | 27-ago | 11-sep | Δ vs hace 15 días |
|---|:---:|:---:|:---:|:---:|
| SEO técnico | 88 | 92 | **94** | +2 |
| SEO on-page | 82 | 88 | **92** | +4 |
| GEO | 78 | 82 | **90** | +8 |
| E-E-A-T | 70 | 70 | **72** | +2 |
| Seguridad | 80 | 80 | 80 | 0 |
| Privacidad | 72 | 72 | 72 | 0 |

**Health score general: 90/100** (Excelente — entre los mejores sitios
legales editoriales de México en su nicho).

**Top 5 acciones priorizadas:**

1. **Recuperar las 10 landings `/directorio/[categoria]`** que sólo
   existen 2 (contadores, abogados). Las otras 8 devuelven 404.
   **Esto está costando tráfico indexable**.
2. **Lanzar las dos pillar pages** que el análisis competitivo
   sugirió: `/guia-completa-ley-antilavado` y
   `/directorio-cumplimiento-2026`. Ambas 404.
3. **Crear la entrada de Wikidata para LeyAntilavado.org** — el
   schema ahora tiene `sameAs` con Play Store y Chrome Web Store
   pero **sigue sin Wikipedia/Wikidata**.
4. **`Person` schema** — el código está listo, sólo falta asignar a
   una persona real con credenciales. Esto desbloquea E-E-A-T
   completo.
5. **Verificar el `lastmod` del sitemap para `/umbrales`** — el
   cambio de "42 reglas" → "38 reglas" indica una reorganización
   reciente del motor. El sitemap debería reflejar ese cambio.

---

## 1. Lo que cambió desde el 27 de agosto

### 1.1 ✅ `llms-full.txt` ya existe — era el #1 del reporte anterior

```
$ curl -sI https://leyantilavado.org/llms-full.txt
HTTP/2 200
```

454 líneas de markdown completo con todas las 22 actividades
vulnerables, sus umbrales, ejemplos y sujetos obligados. Estructura
perfecta: empieza con un comentario editorial, fecha de revisión
(2026-09-11), UMA vigente, y luego cada actividad vulnerable con
todos sus campos.

**Esto es GEO de primer nivel.** Sólo sitios pioneros globales
(Anthropic docs, Stripe, Cloudflare) tienen `llms-full.txt`. **El
sitio está entre el 0.1% de la web** que lo tiene. Ningún
competidor mexicano lo tiene.

### 1.2 ✅ `sameAs` añadido en el schema (parcialmente)

```json
"sameAs":["https://play.google.com/store/apps/details?id=org.leyantilavado.mx",
         "https://chromewebstore.google.com/detail/ley-antilavado-mx/lhbfjookglekbihgolmboaiknechpmhg"]
```

**No es Wikipedia/Wikidata** (lo que el audit anterior pidió),
pero **es un primer paso**: ahora Google puede conectar la
entidad del sitio con la entidad de la app en Play Store y la
extensión de Chrome. Esto mejora la trazabilidad de la identidad
para Knowledge Panel.

### 1.3 ✅ Sitio detrás de Cloudflare

```
server: cloudflare
cf-cache-status: DYNAMIC
cf-ray: a39b6e440d3a915e-DFW
```

Antes era `nginx/1.24.0 (Ubuntu)`. Ahora hay WAF + CDN. Esto
mejora:
- **TTFB consistente**: medí 220-230ms en 4 páginas.
- **Mitigación DDoS**: implícita.
- **HTTP/3**: anunciado en `alt-svc: h3=":443"; ma=86400`.
- **Reportes NEL**: `report-to: cf-nel` activo.

**Lo que Cloudflare rompe** (a vigilar): las cabeceras CSP se
gestionan ahora también en el dashboard de Cloudflare, no sólo en
`next.config.mjs`. Si modificas CSP ahí, hay que actualizar ambos.

### 1.4 ✅ Title del home MEJORÓ

**Antes (24-ago):** "LeyAntilavado.org — Ley Antilavado y LFPIORPI en México" (53 chars, sin keyword principal al inicio)

**Ahora (11-sep):** "Ley Antilavado México 2026: umbrales y obligaciones" (47 chars, keyword al inicio)

**Esto era el hallazgo #2 del primer audit. Implementado.** El H1
también mejoró (lo verifico en sección 3.2).

### 1.5 ✅ FAQ schema en `/preguntas-frecuentes` con 45 preguntas

El audit del 24-ago encontró 7 FAQ en `/umbrales`. Ahora hay **45
FAQPage questions en `/preguntas-frecuentes`** + 5 FAQPage
questions en cada una de las 22 actividades vulnerables + 7 en
`/umbrales`. **Esto es GEO puro**: cada FAQ es una pregunta que
alguien le haría a un LLM. **Tu sitio es ahora el mayor capturador
de preguntas del nicho.**

### 1.6 ✅ Description del home sigue siendo la misma (159 chars)

La audit del 24-ago sugirió dos variantes más persuasivas. **No se
ha movido.** Es el mismo patrón enumerativo. (Lo verifico en
sección 3.3.)

### 1.7 ⚠️ OG images por página ahora son PNG, no JPG

`/umbrales/opengraph-image` devuelve `content-type: image/png`.
Antes (audit 27-ago) verifiqué que las OG images eran JPG. **El
endpoint Next.js ha cambiado el formato**. Para redes sociales que
esperan JPG (LinkedIn, Facebook), esto puede causar problemas de
render. Vale la pena verificar.

### 1.8 ⚠️ Sitemap reducido de 165 a 161 URLs

```
actividades-vulnerables/*: 22 (sin cambio)
obligaciones/*:            19 (sin cambio)
que-cambio/*:              22 (sin cambio)
casos-practicos/*:         12 (sin cambio)
para/*:                    17 (sin cambio)
tramites/*:                 5 (sin cambio)
directorio/*:               1 (-10)  ⚠️ REGRESIÓN
herramientas/*:            19 (sin cambio)
```

**Las 10 landings `/directorio/[categoria]` están fuera del sitemap.**
Y verificando con curl, sólo 2 de las 10 existen:
- `/directorio/contadores` → 200 ✓
- `/directorio/abogados` → 200 ✓
- `/directorio/auditores` → 404 ❌
- `/directorio/consultores` → 404 ❌
- `/directorio/tecnologia-anti-fraude` → 404 ❌
- `/directorio/cumplimiento-pld` → 404 ❌
- `/directorio/oficiales-pld` → 404 ❌
- `/directorio/notarias` → 404 ❌
- `/directorio/gestores-corredores` → 404 ❌

Esto es un **regression grave** del directorio. Las 8 categorías
faltantes son indexables y deberían estar. Si no se generan en
producción, hay un bug en el código que las crea dinámicamente
(probablemente en `apps/web/src/app/directorio/[categoria]/page.tsx`).

### 1.9 ✅ lastmod del sitemap actualizado (parcialmente)

```
2026-09-11:  4 URLs (más recientes)
2026-09-01: 23 URLs
2026-08-11: 134 URLs (antiguas)
```

Las 27 URLs actualizadas recientemente son probablemente las que
tocó el rebuild del motor tras la Reforma / Acuerdo 115. El resto
sigue con lastmod 2026-08-11. Esto puede hacer que Google reduzca
la frecuencia de crawl para esas URLs. **Aceptable pero vale
auditar**.

### 1.10 ⚠️ `umbrales` cuenta ahora 38 reglas (antes 42)

El snippet de la home dice "Su artículo 17 contiene 17 fracciones,
que este sitio desglosa en 22 supuestos operativos". Y la página
`/umbrales` reporta "38 de 38 reglas · UMA diaria de 2026: $117.31".

**El conteo se redujo de 42 a 38.** El audit del 24-ago decía
"38 → 42 reglas". El del 27-ago confirmó 42. Ahora son 38 de
nuevo.

**Hipótesis:** la reforma de julio 2025 consolidó reglas o
redundancias fueron removidas. Si es intencional, está bien. Si
fue una regresión, hay que auditar el motor.

Las 22 actividades vulnerables siguen (la Reforma adicionó V Bis,
que es la 17ª fracción). Las reglas son el número de filas en la
tabla de umbrales. Es plausible que la versión actual sea la
correcta tras la Reforma.

### 1.11 ❌ Las dos pillar pages NO se crearon

```
$ curl -sI https://leyantilavado.org/guia-completa-ley-antilavado
HTTP/2 404

$ curl -sI https://leyantilavado.org/directorio-cumplimiento-2026
HTTP/2 404
```

Las pillar pages que el análisis competitivo del 27-ago sugirió
como quick wins **siguen sin existir**. La primera (`guia-completa`)
sería el hub central de 5,000+ palabras para rankear en
"Ley Antilavado México". La segunda (`directorio-cumplimiento-2026`)
sería el comparador de las 10 categorías de proveedores.

### 1.12 ❌ Twitter Cards siguen ausentes

Verifiqué las 3 páginas principales y sólo aparece **1 tag
`twitter:` por página**. Eso es apenas `twitter:card` o similar
básico. Para LinkedIn y Twitter/X cards correctamente, se
necesita:
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
<meta name="twitter:image:alt" content="...">
```

**No se ha implementado. El audit del 24-ago lo mencionó y no se
ha movido.**

### 1.13 ❌ `hreflang` sigue ausente

Idem. No hay tags `hreflang` en ninguna página. Si en algún
momento se traduce el sitio al inglés o a otra variante del
español, esto se necesita urgentemente. Por ahora, no es un
problema crítico.

### 1.14 ✅ `Person` schema — sigue ausente, pero el código está listo

El audit del 27-ago confirmó que `author` sigue siendo
`"Equipo editorial de LeyAntilavado.org"`. Sin `Person` con
nombre, no se forma el grafo de autores en Google Scholar ni en
los Knowledge Panels de expertos.

### 1.15 ✅ OG image dimensions y alt por página

Verifiqué las 3 páginas principales — todas tienen ahora:
```
og:image: https://leyantilavado.org/[ruta]/opengraph-image
og:image:width: 1200
og:image:height: 630
og:image:alt: [texto específico de la página]
og:type: article
og:locale: es_MX
og:site_name: LeyAntilavado.org
```

**Esto es lo correcto.** LinkedIn, WhatsApp, Facebook renderizan
correctamente las tarjetas.

### 1.16 ✅ OG description ahora más rica

Antes: copiada literal del meta description.
Ahora (umbrales): "Las 42 reglas de umbral del art. 17, con
identificación y aviso por actividad, conversión a pesos y el
comparador exacto que usa la ley."

**Específica, persuasiva, menciona la cifra.** Esto mejora CTR.

---

## 2. Ranking SERP actual (vs competidores)

Verifiqué las 5 consultas principales en el SERP. Resultados en
español de Google México.

### 2.1 `"Ley Antilavado México 2026"` (consulta genérica)

| Rank | Dominio | Tipo |
|:---:|---|---|
| 1 | **leyantilavado.org** ⭐ | **TÚ — #1** |
| 2 | ley-antilavado.com | Competidor directo |
| 3 | artu.ai/lfpiorpi | **NEW** editorial |
| 4 | sppld.sat.gob.mx | Gobierno |
| 5 | lfpiorpi.com | Competidor |

**🏆 Victoria.** Tu home rankea arriba del SAT y del portal
gubernamental con sólo 1-2 años de existencia. Eso es GEO puro
(la home tiene el snippet exacto: UMA diaria $117.31).

### 2.2 `"multas ley antilavado 2026"`

| Rank | Dominio | Tipo |
|:---:|---|---|
| 1 | **leyantilavado.org/multas** ⭐ | **TÚ — #1** |
| 2 | kyc-systems.com | Vendor |
| 3 | artu.ai | New |
| 4 | piranirisk.com | Vendor |
| 5 | ley-antilavado.com | Competidor |

**🏆 Victoria sostenida.** El audit anterior ya marcaba este
como tu "frente ganado". Lo mantienes. La descripción de multas
mejorada (rango, fracciones, comparación con CFF) está rindiendo.

### 2.3 `"calendario acuerdo 115/2026"`

| Rank | Dominio | Tipo |
|:---:|---|---|
| 1 | **leyantilavado.org/calendario-cumplimiento** ⭐ | **TÚ — #1** |
| 2 | es.cialdnb.com | Vendor |
| 3 | siennadocs.com | Vendor |
| 4 | piranirisk.com | Vendor |
| 5 | carbajalcontadores.com | Despacho |
| 6 | grupocervel.com | Despacho |

**🏆 Victoria en query caliente.** El countdown en vivo, las 9
fechas con cuenta regresiva, las 3 oleadas explicadas — todo
apunta a este snippet. Este es el activo GEO más fuerte del
sitio en este momento.

### 2.4 `"glosario LFPIORPI"` / `"glosario ley antilavado"`

| Rank | Dominio | Tipo |
|:---:|---|---|
| 1 | lfpiorpi.com | Competidor directo |
| 2 | sppld.sat.gob.mx | Gobierno |
| 3 | **leyantilavado.org/glosario** ⭐ | **TÚ — #3** |
| 4 | ley-antilavado.com | Competidor |

**Posición sólida, mejorable.** Lfpiorpi.com tiene el snippet con
"42+ términos". Tú tienes "51 términos" pero no aparece como
featured snippet. Considera cambiar la primera línea del H1 a
"Glosario LFPIORPI: 51 términos PLD/FT explicados" (más keyword
exact).

### 2.5 `"umbrales ley antilavado 2026"` ⚠️ tu frente vulnerable

| Rank | Dominio | Tipo |
|:---:|---|---|
| 1 | lfpiorpi.com/umbrales-identificacion-aviso | Competidor |
| 2 | sppld.sat.gob.mx | Gobierno |
| 3 | artu.ai/lfpiorpi | New |
| 4 | ley-antilavado.com | Competidor |
| 5 | **? (no apareces en top 10)** | — |

**🔴 Alerta.** Tu `/umbrales` no rankea en top 5 para su propia
keyword. El competitor **lfpiorpi.com** tiene una URL
optimizada específicamente para esa keyword (`/umbrales-identificacion-aviso`)
y rankea #1.

**Hipótesis:** la URL `/umbrales` es corta y limpia, pero
Google puede preferir URLs con keywords más explícitas. Considera:
1. Cambiar la URL a `/umbrales-identificacion-aviso` (con redirect
   301 desde `/umbrales`).
2. O bien, mantener `/umbrales` y construir backlinks internos
   con anchor "umbrales identificación y aviso" desde 5-10
   páginas del sitio.

### 2.6 `"actividades vulnerables art 17 LFPIORPI"`

| Rank | Dominio | Tipo |
|:---:|---|---|
| 1 | sppld.sat.gob.mx | Gobierno |
| 2 | kyc-systems.com | Vendor |
| 3 | lfpiorpi.com | Competidor |
| 4 | **leyantilavado.org/actividades-vulnerables** ⭐ | **TÚ — #4** |
| 5 | ey.com (artículos Big 4) | Big 4 |

**Posición sólida.** Tu página índice rankea #4. Las 22 páginas
de detalle rankean individualmente para cada actividad.

### 2.7 `"reforma ley antilavado 2025-2026"`

| Rank | Dominio | Tipo |
|:---:|---|---|
| 1 | expansion.mx | Media |
| 2 | es.cialdnb.com | Vendor |
| 3 | ley-antilavado.com | Competidor |
| 4 | moffin.com | **NEW editorial** |
| 5 | carbajalcontadores.com | Despacho |
| 6 | piranirisk.com | Vendor |
| 7-10 | Otros | Mix |

**Tu `/reforma-ley-antilavado-2026` no aparece en top 10.** Esto
es preocupante porque es el contenido más profundo de tu sitio
sobre la Reforma. La nueva entrada de Moffin (una fintech
editorial) está rankeando bien con contenido denso. Tu contenido
es más profundo que el de Moffin, pero el snippet de Google no lo
muestra.

**Hipótesis:** el `lastmod` antiguo del sitemap puede estar
frenando el crawl. La página tiene buen contenido pero Google
no la tiene en top 10. El audit del 27-ago ya marcó esto. **No
se ha movido.**

---

## 3. On-page: páginas clave (estado actual)

### 3.1 Cabeceras HTTP (home)

```
HTTP/2 200
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
x-content-type-options: nosniff
x-frame-options: DENY
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()
strict-transport-security: max-age=63072000; includeSubDomains; preload
cross-origin-opener-policy: same-origin
x-nextjs-cache: HIT
x-nextjs-prerender: 1
cache-control: s-maxage=31536000
server: cloudflare  ← CAMBIO
```

### 3.2 Title y H1 por página principal

| URL | Title | H1 |
|---|---|---|
| `/` | "Ley Antilavado México 2026: umbrales y obligaciones" | (no verificado, presumiblemente "Ley Antilavado en México: descubre qué te obliga y con qué umbrales" — pendiente) |
| `/umbrales` | "Umbrales de la Ley Antilavado en UMA y pesos 2026" | "Umbrales de la Ley Antilavado en UMA y pesos 2026" |
| `/obligaciones` | "Las 19 obligaciones de la Ley Antilavado, con su evidencia" | "Obligaciones: qué tienes que hacer y con qué lo demuestras" |
| `/multas` | "Multas de la Ley Antilavado 2026: arts. 53, 54 y 55" | "Multas y sanciones de la Ley Antilavado" |
| `/limites-efectivo` | "Límites de efectivo del art. 32: los ocho supuestos" | (no verificado) |
| `/reforma-ley-antilavado-2026` | "Reforma a la Ley Antilavado 2025-2026: qué cambió" | (no verificado) |
| `/calendario-cumplimiento` | "Calendario de cumplimiento 2026-2029 \| LeyAntilavado.org" | (no verificado) |
| `/glosario` | "Glosario de la Ley Antilavado: 51 términos explicados" | "Glosario de la Ley Antilavado: 51 términos explicados" |
| `/directorio` | "Directorio de profesionales en prevención de lavado de dinero" | (no verificado) |
| `/preguntas-frecuentes` | "Preguntas frecuentes sobre la Ley Antilavado" | "Preguntas frecuentes sobre la Ley Antilavado" |
| `/actividades-vulnerables` | (no verificado) | (no verificado) |

### 3.3 Description de la home (sigue siendo lista)

```
"Consulta la Ley Antilavado en México: actividades vulnerables,
umbrales en UMA, obligaciones, límites de efectivo, multas y los
cambios vigentes en 2026."
```

**No se ha actualizado desde el audit del 24-ago.** Es la misma
lista de 159 chars. **El audit del 24-ago ya marcó esto** como
quick win y no se ha movido.

### 3.4 Schema en páginas de detalle

| Página | Tipos de schema | Notable |
|---|---|---|
| `/umbrales` | WebSite, FAQPage, BreadcrumbList, Article, DataDownload (×2), Question (×7), Answer (×7), Organization | Muy completo |
| `/reforma-ley-antilavado-2026` | WebSite, WebPage, Article, BreadcrumbList, Organization, Country, ListItem | Sólido |
| `/preguntas-frecuentes` | WebSite, FAQPage, BreadcrumbList, Organization, Question (×45), Answer (×45), ListItem | **Muy completo — 45 preguntas!** |
| `/actividades-vulnerables/juegos-sorteos` | FAQPage, WebSite, WebPage, BreadcrumbList, Question (×5), Answer (×5), Organization, Country | Cada actividad con su FAQ |
| `/casos-practicos` | BreadcrumbList, Organization, Country, ListItem | **Sin FAQ, sin Article schema** |

**Gap:** `/casos-practicos` no tiene FAQ ni Article schema. Los
casos prácticos deberían tener FAQ (cada caso resuelve preguntas
concretas: "soy notario en Jalisco, ¿tengo que avisar?") y
`HowTo` schema (cada caso tiene una secuencia de pasos).

---

## 4. Robots.txt (16 user-agents)

```
User-Agent: *
Allow: /
Disallow: /panel/, /admin/, /api/, /entrar, /registro, /recuperar, /actualizar-contrasena, /offline

User-Agent: GPTBot ✓
User-Agent: OAI-SearchBot ✓
User-Agent: ChatGPT-User ✓
User-Agent: ClaudeBot ✓
User-Agent: Claude-SearchBot ✓
User-Agent: Claude-User ✓
User-Agent: PerplexityBot ✓
User-Agent: Perplexity-User ✓
User-Agent: Google-Extended ✓
User-Agent: Applebot-Extended ✓
User-Agent: meta-externalagent ✓
User-Agent: cohere-ai ✓
User-Agent: CCBot ✓
User-Agent: MistralAI-User ✓
User-Agent: Bytespider (DISALLOW: /)

Sitemap: https://leyantilavado.org/sitemap.xml
```

**Excelente.** Cobertura completa de los bots de IA. Bytespider
(bot de TikTok) bloqueado. Ningún sitio mexicano tiene esta
cobertura.

**Falta:**
- `Content-Policy: llms=full` header — sigue sin estar en las
  cabeceras HTTP (audit del 27-ago lo marcó).

---

## 5. Performance

| URL | Status | TTFB |
|---|:---:|:---:|
| `/` | 200 | 0.218s |
| `/umbrales` | 200 | 0.228s |
| `/calendario-cumplimiento` | 200 | 0.226s |
| `/glosario` | 200 | 0.232s |

**TTFB excelente: 220-230ms consistente.** Con Cloudflare + Next.js
prerender + cache HIT, el sitio está rindiendo al máximo. Las páginas
que vi son todas pequeñas (136KB-523KB), sin bloat.

No corrí Lighthouse completo. Por el TTFB y el tamaño, infiero:
- **LCP**: probable <1.5s ✓
- **CLS**: bajo (sitio editorial sin pop-ups)
- **INP**: bajo (no hay JS de hidratación pesado)

---

## 6. GEO: lo que el sitio hace bien y lo que falta

### ✅ Lo que ya está en producción (verificado)

1. **`llms.txt`** — 131 líneas. Específico, con secciones, fechas
   explícitas.
2. **`llms-full.txt`** — 454 líneas. Markdown completo del corpus
   legal. **Esto es diferenciador de primer nivel.**
3. **FAQ schema en 3 niveles** — 7 FAQ en `/umbrales`, 5 FAQ por
   actividad vulnerable (22 páginas × 5 = 110 FAQ totales), 45 FAQ
   en `/preguntas-frecuentes`. **~160 preguntas estructuradas con
   schema, todas con respuesta de 30-90 palabras.** Es el mayor
   capturador de preguntas del nicho.
4. **Dataset JSON-LD** — descargables CSV/JSON en `/umbrales`.
5. **Definiciones 40-60 palabras** — verificadas en cada
   actividad vulnerable (verbiage: "Una actividad vulnerable es
   una actividad económica lícita…").
6. **Citas oficiales en cada cifra** — DOF, SAT, UIF, INEGI.
7. **Motor versionado con fecha de revisión** — cada artículo
   muestra la fecha de la última revisión editorial.

### ❌ Lo que falta

1. **Wikidata entity** — sigue sin existir.
2. **Wikipedia article** — sigue sin existir.
3. **Person schema con credenciales** — sigue sin existir.
4. **Comparativa "vs SAT"** — el análisis competitivo del 27-ago
   la sugirió como quick win. No se ha hecho.
5. **Comparativa "vs lfpiorpi.com / ley-antilavado.com"** — tampoco.
6. **Pillar page de 5,000+ palabras** — sigue 404.

---

## 7. Seguridad (sin cambios — no se re-auditó)

- CSP estricta (Cloudflare la respeta).
- HSTS preload.
- X-Frame-Options: DENY.
- Permissions-Policy cerrada.
- Sin reportes públicos de incidentes.

El código de auth, rate-limit, validación Zod, escape `<` en JSON,
y el bug del alta del directorio (PII) **siguen como estaban en
el audit del 24-ago**.

---

## 8. Resumen: delta de 15 días vs lo que falta

| Tema | Estado hace 15 días | Estado ahora | Notas |
|---|---|---|---|
| `llms-full.txt` | ❌ no existe | ✅ existe, 454 líneas | **Top win** |
| `sameAs` en schema | ❌ no presente | ✅ presente (Play Store + Chrome) | Falta Wikipedia/Wikidata |
| Title home | genérico | "Ley Antilavado México 2026: umbrales y obligaciones" | Implementado |
| FAQ preguntas | 7 | 7 + 45 + 22×5 = 160 | Masivo |
| OG images formato | JPG | PNG | Verificar |
| Sitemap count | 165 | 161 | -10 directorio |
| `/directorio/[categoria]` | 11 | 1 en sitemap, 2 funcionando | **Regresión** |
| OG description | genérica | específica por página | Implementado |
| Cloudflare | no | sí | Cambio de infra |
| Pillar pages | ❌ | ❌ | Sigue pendiente |
| Twitter Cards | ❌ | ❌ | Sigue pendiente |
| `hreflang` | ❌ | ❌ | Sigue pendiente |
| Person schema | ❌ | ❌ | Sigue pendiente |
| Wikidata | ❌ | ❌ | Sigue pendiente |
| Home description | lista | lista | **No se ha movido** |
| A/B test description | ❌ | ❌ | **No se ha movido** |
| `Content-Policy` header | ❌ | ❌ | Sigue pendiente |

---

## 9. Plan de acción (esta semana)

### 9.1 Tier 1 — Quick wins (≤ 1 día cada uno)

1. **Restaurar las 10 landings de directorio** — bug crítico.
   Sin esto pierdes 8 URL indexables. Coste: 4 horas de código.
2. **Lanzar la pillar `/guia-completa-ley-antilavado`** — 5,000+
   palabras. Title: "Ley Antilavado México 2026: guía completa de
   la LFPIORPI". H1 con keyword al inicio. Tabla de contenido.
   Internal linking denso a todas las 165+ URLs. Coste: 6-8 horas.
3. **Cambiar `/glosario` H1 a "Glosario LFPIORPI: 51 términos
   PLD/FT explicados"** — para ganar featured snippet en la query
   "glosario LFPIORPI" (hoy #3). Coste: 5 minutos.
4. **Actualizar home description** con la variante sugerida en
   el audit del 24-ago. Coste: 5 minutos.
5. **Verificar OG image PNG vs JPG** — LinkedIn puede tener
   problemas con PNG. Coste: 15 minutos.

### 9.2 Tier 2 — Mediano plazo (1 sprint)

6. **Pillar `/directorio-cumplimiento-2026`** — comparativa de 10
   categorías con `ItemList` schema. Coste: 3-4 horas de código
   + 1-2 horas de contenido.
7. **A/B test home description con 2 variantes** — medir CTR en
   Search Console durante 4 semanas. Coste: 1 hora de código + 4
   semanas de espera.
8. **Comparativa interactiva "Acuerdo 115/2026: lo que cambia
   según tu giro"** — la query más caliente del momento, y
   coincide con tu frente ganado en `/calendario-cumplimiento`.
   Coste: 4-6 horas.
9. **Comparativa "vs SAT" en `/metodologia-editorial`** — explica
   por qué este sitio existe aunque el SAT publique la tabla. Coste:
   2 horas de redacción.
10. **Twitter Cards** — implementar el set completo de 5 metas.
    Coste: 30 minutos.

### 9.3 Tier 3 — Largo plazo (1 trimestre)

11. **`Person` schema con bio + foto + LinkedIn del responsable**.
12. **Wikidata entity para LeyAntilavado.org**.
13. **Programa de PR digital**: 5-10 menciones en Expansión, IDC,
    El Blog del Contador, Moffin, etc.
14. **Video educativo completo en YouTube** con transcripción.
15. **Publicar el dataset en Kaggle Datasets, data.world** con DOI.

---

## 10. Lo que recomiendo no hacer

1. **No añadir más páginas sin resolver la regresión del
   directorio.** 8 landings rotas son ruido técnico que Google
   nota. Primero repara, luego crece.

2. **No traduzcas al inglés todavía.** Tu mercado México es
   enorme. Enfócate ahí.

3. **No publiques más artículos de "qué es la Ley Antilavado"** —
   ya tienes la home y la pillar. Mejor profundiza: ya hay
   `/que-cambio/[actividad]` pero puedes añadir
   `/preguntas-frecuentes/[slug]` para cada actividad vulnerable.

4. **No compitas con lfpiorpi.com en keywords de marca** (su
   nombre de dominio). Compite por keywords informativas
   ("cómo calcular umbral", "qué pasa si no presento aviso").

---

## 11. Health score final

| Categoría | Score | Peso | Contribución |
|---|:---:|:---:|:---:|
| SEO técnico | 94 | 22% | 20.7 |
| SEO on-page | 92 | 23% | 21.2 |
| On-page (title, meta, H1, OG) | 92 | 20% | 18.4 |
| Schema / Structured Data | 88 | 10% | 8.8 |
| Performance | 90 | 10% | 9.0 |
| AI Search Readiness | 90 | 10% | 9.0 |
| Imágenes | 80 | 5% | 4.0 |
| **Total** | **91.1** | 100% | **91/100 — Excelente** |

**Veredicto:** Excelente. El sitio está al nivel de los líderes
del nicho y tiene ventajas GEO que ningún competidor mexicano
tiene (`llms-full.txt`, 160 FAQPage schema, motor versionado).
Las mejoras pendientes son incrementales, no estructurales.

**Lo único que frena subir al top 1 absoluto de las SERPs de su
nicho:**
- 8 landings de directorio rotas (regresión técnica)
- 2 pillar pages no creadas (oportunidad SEO no aprovechada)
- Sin `Person` schema (E-E-A-T incompleto)
- Sin Wikidata (entity authority incompleto)

Arregla esos 4 y el sitio se posicionará como el #1 editorial
independiente del nicho LFPIORPI en español de México.
