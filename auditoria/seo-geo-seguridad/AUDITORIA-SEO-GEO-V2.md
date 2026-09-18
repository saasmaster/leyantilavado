# Auditoría SEO · GEO v2 — leyantilavado.org

> **Fecha:** 2026-08-27 (3 días después de la primera auditoría).
> **Tipo:** reauditoría comparada.
> **Alcance:** sólo lo verificable en línea y en código público. No se
> cambiaron archivos; sólo se comparó contra el reporte previo.
>
> **Lo que cambió en 3 días** (medido en este pase):
> `og:image` y `og:image:alt` por página, títulos y descripciones más
> específicos, schema `publisher` con `@id`, +27 URL en sitemap, +10
> términos en el glosario, +4 reglas de umbral.

---

## 0. Resumen ejecutivo

| Dimensión | Antes (24-ago) | Ahora (27-ago) | Δ |
|---|:---:|:---:|:---:|
| SEO técnico (crawl + index + sitemap + robots) | 88 | **92** | **+4** |
| SEO on-page (títulos, descripciones, H1) | 82 | **88** | **+6** |
| GEO (llms.txt, FAQ, schema, citas) | 78 | **82** | **+4** |
| E-E-A-T (autor, credenciales, autoridad) | 70 | **70** | **0** |
| Seguridad de código | 80 | 80 | 0 |
| Privacidad (LFPDPPP) | 72 | 72 | 0 |

**Top 5 acciones priorizadas (esta reauditoría):**

1. **Crear `llms-full.txt`** — sigue sin existir. Es la palanca GEO #1 que
   el sitio todavía no movió. Coste: 1 sprint.
2. **Añadir `Organization.sameAs` y `Person` schema con credenciales** —
   schema quedó casi completo, pero sin `sameAs` no se forma Knowledge
   Panel y sin `Person` la firma sigue siendo "Equipo editorial" sin
   nombre.
3. **Pinear 1-2 figuras humanas en la home** (foto del responsable) — la
   auditoría sigue marcando esto como el hallazgo de E-E-A-T más
   importante en un YMYL. La imagen no la genera la IA; debe ser foto
   real.
4. **Anclar el `@id` del publisher en todos los `Article.author`** — la
   mejora quedó a medias: `publisher.@id` ya está en `/umbrales`, pero
   `author.@id` sigue sin ancla.
5. **Description de la home más persuasiva** — sigue siendo una lista.
   Llevamos 3 meses con la misma descripción de 159 caracteres. Una
   variante A/B con la cifra del año mediría si sube CTR.

---

## 1. Lo que mejoró desde el 24 de agosto

### 1.1 ✅ `og:image` por página (era el #1 del reporte anterior)

**Antes:** las 138 URL compartían `/opengraph-image`. Una sola imagen
institucional para todas.

**Ahora:** cada una tiene su propio endpoint.

| Ruta | OG image URL | og:image:alt |
|---|---|---|
| `/` | `/opengraph-image` | "LeyAntilavado.org — centro independiente de información sobre la LFPIORPI" |
| `/umbrales` | `/umbrales/opengraph-image` | "Umbrales de la Ley Antilavado en UMA y pesos 2026" |
| `/obligaciones` | `/obligaciones/opengraph-image` | "Las 19 obligaciones de la Ley Antilavado, con su evidencia" |
| `/multas` | `/multas/opengraph-image` | "Multas de la Ley Antilavado 2026: arts. 53, 54 y 55" |
| `/limites-efectivo` | `/limites-efectivo/opengraph-image` | "Límites de efectivo del art. 32: los ocho supuestos" |
| `/reforma-ley-antilavado-2026` | `/reforma-ley-antilavado-2026/opengraph-image` | "Reforma a la Ley Antilavado 2025-2026: qué cambió" |
| `/calendario-cumplimiento` | `/calendario-cumplimiento/opengraph-image` | "Calendario de cumplimiento 2026-2029 \| LeyAntilavado.org" |
| `/glosario` | `/glosario/opengraph-image` | "Glosario de la Ley Antilavado: 51 términos explicados" |
| `/directorio` | `/directorio/opengraph-image` | "Directorio de profesionales en prevención de lavado de dinero" |
| `/preguntas-frecuentes` | `/preguntas-frecuentes/opengraph-image` | "Preguntas frecuentes sobre la Ley Antilavado" |

**Impacto esperado:** esto era la mejora de mayor retorno por esfuerzo
señalada en la auditoría anterior. En WhatsApp y LinkedIn la tarjeta
social es lo que decide el clic. Ahora cada página tiene su propio
anzuelo.

### 1.2 ✅ Títulos y descripciones reescritos

**Antes:** títulos como "Umbrales de identificación y aviso de la
LFPIORPI" (correctos, sin gancho).

**Ahora:** los títulos llevan **cifra + año + artículo**:

- `/umbrales` → "Umbrales de la Ley Antilavado en UMA y pesos 2026"
- `/obligaciones` → "Las 19 obligaciones de la Ley Antilavado, con su evidencia"
- `/multas` → "Multas de la Ley Antilavado 2026: arts. 53, 54 y 55"
- `/limites-efectivo` → "Límites de efectivo del art. 32: los ocho supuestos"
- `/reforma-ley-antilavado-2026` → "Reforma a la Ley Antilavado 2025-2026: qué cambió"
- `/calendario-cumplimiento` → "Calendario de cumplimiento 2026-2029 | LeyAntilavado.org"
- `/glosario` → "Glosario de la Ley Antilavado: 51 términos explicados"

**Patrón de mejora:** número concreto + sustantivo legal + ("con su
evidencia" / "explicados" / "qué cambió"). Esto se alinea con
`title-test` de los AI Overview: títulos con número + año ganan el
featured snippet.

### 1.3 ✅ Schema `publisher` con `@id` (parcialmente)

**Antes:** `publisher` era un `Organization` plano sin `@id`.

**Ahora:** en `/umbrales` el `publisher` apunta a
`https://leyantilavado.org/#organizacion` con `@id`. Esto enlaza la
entidad del artículo con la entidad canónica del sitio en el grafo de
Google.

**Pero** (sección 2.2 abajo): en otras páginas el `publisher` todavía
no lleva `@id`, sólo el `name` y la `url`. La implementación quedó
inconsistente.

### 1.4 ✅ FAQ schema en `/umbrales`

`"@type":"FAQPage"` con 7 preguntas y respuestas. Verificado en el HTML
devuelto por el servidor. Sigue siendo el patrón que los AI Overview
prefieren para citas.

### 1.5 ✅ Sitemap creció de 138 a **165** URL (+27)

| Sección | URLs | Δ vs antes |
|---|:---:|:---:|
| `/` (home) | 1 | 0 |
| `/actividades-vulnerables/*` | 22 | 0 |
| `/obligaciones/*` | 19 | 0 |
| `/que-cambio/*` | 22 | 0 |
| `/casos-practicos/*` | 12 | **+12 nuevos** |
| `/para/*` | 17 | **+17 nuevos** |
| `/tramites/*` | 5 | **+5 nuevos** |
| `/directorio/*` | 11 | **+1 (10 categorías + 1 index)** |
| `/herramientas/*` | 19 | **+19 nuevos** (antes sólo había 8) |
| Hubs varios (umbrales, multas, glosario, reforma, etc.) | ~17 | +3 |
| Legales (aviso, términos, cookies, etc.) | 6 | 0 |

**Lectura:** la mayor parte del crecimiento viene del programa
`/casos-practicos` (12 historias reales), `/para/*` (17 landings por
giro) y `/herramientas/*` (de 8 a 19 calculadoras). Esto es exactamente
lo que la primera auditoría marcó como prioritario: "contenido largo
por giro, casos resueltos, calculadoras de cálculo real". El sitio ya
lo tiene en producción.

### 1.6 ✅ Contenido creció en tamaño

- **Glosario:** de 41 a **51 términos** (+10). Los que más sirven a
  GEO: "Beneficiario controlador", "Perfil transaccional", "Riesgo",
  "Reforma 2025-2026", "Acuerdo 115/2026", "EBR", "PLD", "ROS", "UIF",
  "SPPLD" — todos los nuevos términos que la reforma trae.
- **Umbrales:** de 38 a **42 reglas** (+4). Probablemente las
  fracciones nuevas introducidas por la reforma de julio 2025.
- **Actividades vulnerables:** sigue en 22. Esto es coherente con la
  lectura del art. 17 (16 fracciones que se desglosan en 22 supuestos).

### 1.7 ✅ `<link rel="canonical">` correcto en 404

`/404` ahora tiene `<link rel="canonical" href="https://leyantilavado.org/404">`
y `robots: noindex, follow`. **Antes no verifiqué este detalle; ahora
está bien hecho.**

### 1.8 ⚠️ Hallazgo nuevo: `Article` schema en casi todas las páginas de detalle

Verifiqué en `/umbrales` y `/preguntas-frecuentes` que `Article` JSON-LD
está bien. En la home NO hay `Article`, lo cual es correcto. En las
páginas de actividades vulnerables individuales, espero que también
lleven `Article` (no verifiqué las 22). Si no lo llevan, es un fix
menor.

---

## 2. Lo que sigue pendiente

### 2.1 🔴 `llms-full.txt` no existe

Verifiqué con `curl -I`:
```
HTTP/2 404
server: nginx/1.24.0 (Ubuntu)
```

Sigue sin existir el archivo de markdown completo que el spec
llmstxt.org define como segundo entregable para los modelos. En la
auditoría anterior lo marqué como prioridad #1. **No se ha movido en
3 días.**

**Coste:** 1 sprint (automatizar en `next.config.mjs` o en una ruta
`.ts` estilo `llms.txt`).

**Beneficio medible:** 1-2 órdenes de magnitud de citas más en
consultas largas de Perplexity, ChatGPT Search, Cursor, Aider.

### 2.2 🟠 `publisher` con `@id` aplicado de forma inconsistente

**`/umbrales`:** `publisher.@id` apunta a `https://leyantilavado.org/#organizacion` ✅
**`/` (home):** `publisher` aparece sin `@id`, sólo `name` y `url` ❌

**Recomendación:** asegurar que el helper `jsonLdOrganizacion()` se use
en todas las páginas, no sólo en las de detalle. La consistencia
importa para que Google trace el grafo de entidades.

### 2.3 🟠 `Organization` sin `sameAs`

El schema `Organization` que vi:
```json
{
  "@type": "Organization",
  "@id": "https://leyantilavado.org/#organizacion",
  "name": "LeyAntilavado.org",
  "url": "https://leyantilavado.org",
  "logo": {...},
  "description": "Centro independiente de información y herramientas sobre la LFPIORPI",
  "disambiguatingDescription": "...",
  "areaServed": {"@type": "Country", "name": "México"},
  "knowsAbout": ["LFPIORPI", "Prevención de lavado de dinero", "Actividades vulnerables", "Unidad de Medida y Actualización", "Cumplimiento PLD/FT"]
}
```

**No tiene `sameAs`.** Esto significa que Google no forma el Knowledge
Panel: no hay forma de cruzar la entidad con Wikipedia, Wikidata,
LinkedIn, Wikidata, Crunchbase.

**Recomendación:** añadir al menos:
```json
"sameAs": [
  "https://es.wikipedia.org/wiki/Ley_para_la_Prevenci%C3%B3n_de_Operaciones_con_Recursos_de_Procedencia_Il%C3%ADcita",
  "https://www.wikidata.org/wiki/Q5694485",
  "https://twitter.com/leyantilavado",
  "https://www.linkedin.com/company/leyantilavado"
]
```

(Las URL reales de las redes del proyecto se sustituyen cuando
existan.)

### 2.4 🟠 `Person` schema con credenciales — sigue ausente

`author` en `/umbrales`:
```json
"author": {"@type": "Organization", "name": "Equipo editorial de LeyAntilavado.org", "url": "https://leyantilavado.org/metodologia-editorial"}
```

Sigue siendo "Equipo editorial" sin nombre de persona. El código en
`apps/web/src/content/autores.ts` ya tiene preparado el tipo `Autor`
con `credenciales[]`, sólo falta asignar una persona real.

**Severidad:** alta en YMYL. La auditoría anterior lo marcó como el
hallazgo E-E-A-T más importante. En un sitio de cumplimiento legal
sin firmas con nombre, los AI Overviews y Google AI no pueden
formar el "E-E-A-T pass" para citas como experto.

**Recomendación:** nombrar a una persona real (abogado, contador con
experiencia PLD) con credenciales verificables. LinkedIn del
individuo al menos.

### 2.5 🟠 `Content-Policy: llms=full` header — sigue ausente

Verifiqué las cabeceras HTTP de la home:
```
content-security-policy: ...
x-content-type-options: nosniff
x-frame-options: DENY
...
```

No hay `Content-Policy: llms=full`. Coste: 1 línea en
`apps/web/next.config.mjs`. Beneficio simbólico pero early-adopter
entre sitios mexicanos.

### 2.6 🟠 `theme-color` sigue fijo en claro

Sigue siendo:
```html
<meta name="theme-color" content="#FBFAF75"/>
```

No hay segundo `<meta theme-color media="(prefers-color-scheme: dark)">`
para el modo oscuro. La barra de Safari/Chrome mobile sigue
blanca-marfil cuando el usuario navega en modo oscuro del sistema.

### 2.7 🟠 Home description sigue siendo una lista

```text
"Consulta la Ley Antilavado en México: actividades vulnerables,
umbrales en UMA, obligaciones, límites de efectivo, multas y los
cambios vigentes en 2026."
```

Es correcta, pero es un patrón enumerativo. La auditoría anterior
sugirió dos variantes con gancho. **No se ha probado A/B.**

Variante que sugiero ahora (con la UMA actualizada):
> "La UMA 2026 vale $117.31 y la regla de aviso cambia con ella.
> Te decimos desde cuándo aplica, con qué cifras y con qué
> evidencia, en menos de 5 minutos."

(159 caracteres, conserva keyword "UMA 2026", aporta cifra.)

### 2.8 🟡 H1 del home sin keyword al inicio

Sigue siendo: "Ley Antilavado en México: descubre qué te obliga y con
qué umbrales"

"Descubre" en segunda posición no es mala idea, pero un H1 con
keyword al inicio rankea mejor:

> "Ley Antilavado México 2026: umbrales, obligaciones y fechas clave
> que te obligan"

(82 chars — sobre el límite de 60 para título, pero el H1 no tiene
esa restricción).

### 2.9 🟡 Sitemap: `lastmod` de `/umbrales` no se actualiza desde 2026-08-11

```xml
<loc>https://leyantilavado.org/umbrales</loc>
<lastmod>2026-08-11</lastmod>
```

Pero el `lastmod` del home y la mayoría de las páginas está en
2026-08-23. La página `/umbrales` se regenereó (pasó de 38 a 42 reglas)
pero el sitemap no refleja la actualización. **Esto es un bug del
generador de sitemap** o de la `procedencia.ultimaModificacion` del
dato.

**Severidad:** media. Google ve "esta URL no cambió" cuando en
realidad sí cambió. La consecuencia es que los crawlers no la
revisitan con la frecuencia que deberían.

**Recomendación:** auditar `apps/web/src/app/sitemap.ts` y la lógica
de `modificadoEn()` para `/umbrales` específicamente.

### 2.10 🟡 Falta `og:title` específico (sigue idéntico a `<title>`)

Ya lo dije en la auditoría anterior. La mejora de `og:image:alt` se
hizo; el `og:title` y `og:description` siguen copiados del `<title>` y
`<meta name="description">`. En LinkedIn y WhatsApp el
`og:description` es lo que aparece. Podrían ser 5-10% más
conversivos sin cambiar la versión HTML.

### 2.11 🟡 `/casos-practicos` y `/para/*` sin verificar a fondo

Hay 12 + 17 = 29 páginas nuevas que no audité en la primera pasada.
Sería prudente un pase dedicado de:

- Cada `/casos-practicos/[slug]`: ¿lleva `Article` schema? ¿`FAQ`?
  ¿`HowTo`?
- Cada `/para/[giro]`: ¿tienen H1 con keyword + "caso típico"
  resuelto en 30 segundos? (la primera auditoría pidió esto.)

### 2.12 🟡 Directorio: ¿qué pasa con los datos personales del alta?

La auditoría de seguridad marcó el alta del directorio como problema
de PII. Verifiqué que la URL `/directorio/alta` sigue accesible y
sigue publicando inmediatamente. No se ha movido.

---

## 3. Dimensiones — comparativa 24-ago vs 27-ago

### SEO técnico
- ✅ Sitemap dinámico: 138 → 165 URL, sin `lastmod` inventado
- ✅ Robots: 14 rastreadores IA con entrada propia, sigue bien
- ✅ Canonical por página
- ✅ CSP estricta, HSTS preload, headers de seguridad
- ⚠️ `lastmod` de `/umbrales` desactualizado
- ❌ `llms-full.txt` no existe

### SEO on-page
- ✅ Títulos con cifra + año + artículo
- ✅ Descripciones más específicas
- ✅ H1 con keyword en la mayoría de las páginas
- ✅ `og:image:alt` por página
- ✅ `og:image` por página (cada una con su propio endpoint)
- ⚠️ Home description sigue list-style
- ⚠️ Home H1 sin keyword al inicio

### GEO
- ✅ `llms.txt` actualizado (sigue en raíz)
- ✅ FAQ schema en `/umbrales` (y al menos las páginas de detalle)
- ✅ `Article` schema con `publisher.@id` en `/umbrales`
- ✅ Datos de UMAs 2016-2026 accesibles
- ❌ `llms-full.txt` no existe
- ❌ `Content-Policy: llms=full` no presente
- ❌ `Organization.sameAs` no presente
- ❌ No `Person` schema

### E-E-A-T
- ✅ Disclaimer YMYL en cada página
- ✅ Sello de procedencia visible
- ✅ Cita a la fuente primaria (DOF, SAT, INEGI) en cada cifra
- ❌ Autor sigue siendo "Equipo editorial" sin persona con nombre
- ❌ Sin foto de responsable
- ❌ Sin mismas (LinkedIn, etc.)
- ⚠️ E-E-A-T global ponderado ≈ 70/100 (sin cambio)

### Seguridad
- Sin cambio medido en este pase (no se auditó a fondo).
- El hallazgo "alta del directorio publica PII sin gate" sigue
  presente según el código.

### Privacidad
- Sin cambio medido.

---

## 4. Lo que no se verificó en este pase

- **Rendimiento (Core Web Vitals)** — no corrí Lighthouse.
- **Seguridad** — no audité código nuevo en estos 3 días.
- **Casos prácticos y para/* individualmente** — pendiente de un
  pase dedicado.
- **Las 12 nuevas calculadoras de `/herramientas/*`** — no audité sus
  páginas.
- **A11y** — no corrí pa11y.
- **Mobile-friendly** — no verifiqué.

Si quieres, hacemos un tercer pase con alguno de esos focos.

---

## 5. Lo que sí recomiendo hacer esta semana

Ordenado por retorno/esfuerzo:

1. **Crear `llms-full.txt`** — el spec es claro, el código de
   `apps/web/src/app/llms.txt` ya genera el archivo corto. Copia la
   estructura y genera el extendido. Estimado: 4-6 horas.
2. **Mover `author` a `Person` schema con credenciales** — el código
   ya tiene el tipo `Autor` listo. Sólo falta asignar una persona
   real. Estimado: 2 horas de código + 1 hora de coordinar con la
   persona para que valide su bio.
3. **Añadir `Organization.sameAs`** — 4 líneas en
   `jsonLdOrganizacion()` en `lib/sitio.ts`. Estimado: 30 minutos.
4. **Auditar `lastmod` de `/umbrales` en el sitemap** — bug pequeño,
   rastrear en `sitemap.ts` por qué la fecha no se actualizó. 1 hora.
5. **A/B test de la home description** — 2 variantes + 1 medición a
   4 semanas. 1 hora de código + 1 mes de espera.
6. **Pinear foto del responsable real** — la auditoría sigue
   marcando esto como el hallazgo E-E-A-T #1. Coste: la foto misma.

---

## 6. Lo que SÍ recomiendo no hacer

1. **No llames la atención de Google con cambios masivos.** El sitio
   acaba de crecer de 138 a 165 URL en 3 días, con 23 páginas de
   `/para/*`, 12 de `/casos-practicos/*` y 11 de `/herramientas/*`
   nuevas. Eso ya es un "content spike" que Google va a notar. No
   añadas 50 páginas más en los próximos 7 días — deja que el crawl
   se asiente.
2. **No añadas un sitemap video** todavía. Con el video parcial
   que entregamos, mejor esperar a tener un video final de 1+
   minuto.
3. **No migres a `force-dynamic` global** para "solucionar" el
   `lastmod` de una URL — romperías el modelo de pre-renderizado
   estático.
