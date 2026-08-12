# Auditoría Schema.org / JSON-LD — leyantilavado.org

**Puntuación: 78/100**

Base sólida y disciplinada (regla de la casa "sólo se marca lo visible" se cumple al 100% en las 16 páginas revisadas), pero faltan piezas que Google exige o recomienda como obligatorias (`logo` de `Organization`, `@id`/`isPartOf` en `Article`), y hay oportunidades sin explotar en `/herramientas/*` y en el vínculo con la fuente legal. No hay ninguna marca de tipos obsoletos (HowTo, SpecialAnnouncement) y el uso de `FAQPage` respeta la regla de "no hay FAQ invisible" en las 4 páginas que la usan.

Fuentes revisadas: los 16 HTML guardados en `seo-audit/raw/*.html` (fetch en vivo de `http://leyantilavado.saavatar.top`), los helpers `apps/web/src/lib/sitio.ts` y `apps/web/src/components/contenido/JsonLd.tsx`, y una muestra de páginas bajo `apps/web/src/app/**` (incluida `obligaciones/[slug]/page.tsx`, que no está en el HTML guardado pero usa los mismos helpers).

---

## 1. Inventario detectado (16 páginas)

| Página | Organization | BreadcrumbList | Article | FAQPage | Dataset | DefinedTermSet | WebSite |
|---|---|---|---|---|---|---|---|
| `/` (home) | ✅ | — | — | — | — | — | ✅ (sin `SearchAction`) |
| `/actividades-vulnerables` | ✅ | ✅ | ✅ | — | — | — | — |
| `/acuerdo-115-2026` | ✅ | ✅ (en `@graph` array) | ✅ (en `@graph` array) | — | — | — | — |
| `/calendario-cumplimiento` | ✅ | ✅ (array) | ✅ (array) | — | — | — | — |
| `/directorio` | ✅ | ✅ | — | — | — | — | — |
| `/fuentes-oficiales` | ✅ | ✅ | — | — | — | — | — |
| `/glosario` | ✅ | ✅ | ✅ | — | — | ✅ | — |
| `/herramientas` | ✅ | ✅ | — | — | — | — | — |
| `/limites-efectivo` | ✅ | ✅ | ✅ | ✅ (8 preguntas) | ✅ | — | — |
| `/metodologia-editorial` | ✅ | ✅ | — | — | — | — | — |
| `/multas` | ✅ | ✅ | ✅ | ✅ (8 preguntas) | — | — | — |
| `/nosotros` | ✅ | ✅ | — | — | — | — | — |
| `/obligaciones` | ✅ | ✅ | ✅ | — | — | — | — |
| `/preguntas-frecuentes` | ✅ | ✅ (array) | — | ✅ (19 preguntas, array) | — | — | — |
| `/reforma-ley-antilavado-2026` | ✅ | ✅ (array) | ✅ (array) | — | — | — | — |
| `/umbrales` | ✅ | ✅ | ✅ | ✅ (7 preguntas) | ✅ | — | — |

Todos los bloques usan `"@context": "https://schema.org"` (https, correcto) y JSON-LD (nunca Microdata/RDFa). Ningún bloque contiene texto placeholder. No se detectó **HowTo**, **SpecialAnnouncement**, `CourseInfo`, `EstimatedSalary` ni `LearningVideo` en ninguna página — correcto, son tipos obsoletos y el sitio no los usa.

Inconsistencia menor de formato: en 4 páginas (`acuerdo-115-2026`, `calendario-cumplimiento`, `preguntas-frecuentes`, `reforma-ley-antilavado-2026`) `BreadcrumbList`+`Article` (o `BreadcrumbList`+`FAQPage`) van en un **array JSON con dos objetos, cada uno con su propio `@context`**, en vez de un único `@graph`. Es válido para Google (cada objeto se parsea igual) pero no es lo recomendado: lo idiomático es un solo bloque `@graph` con un `@context` compartido. Severidad: **Info**. No rompe nada, pero vale unificar por prolijidad y para que `@id` cruzados entre entidades (ver hallazgo 3.4) sean posibles.

---

## 2. Organization — Crítico / Advertencia

**Ubicación:** `jsonLdOrganizacion()` en `apps/web/src/lib/sitio.ts:158-169`, emitido en las 16 páginas.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "LeyAntilavado.org",
  "url": "https://leyantilavado.org",
  "description": "Centro independiente de información y herramientas sobre la LFPIORPI",
  "disambiguatingDescription": "Plataforma privada e independiente. No pertenece ni está afiliada al SAT, la UIF ni a ninguna autoridad gubernamental de México."
}
```

Validación:
- ✅ `@type` correcto, sin campos falsos.
- ✅ `disambiguatingDescription` es una práctica editorial honesta y poco común — bien.
- ❌ **Falta `logo`** (Advertencia — Google lo pide explícitamente para el Knowledge Panel y para el logo de resultados enriquecidos de `Article`/`sameAs`). El repo **sí tiene un asset real y cuadrado** en `apps/web/public/icons/icono-512.png` (512×512 PNG, confirmado con `file`) y `icono-192.png` (192×192). Se puede referenciar sin inventar nada.
- ❌ Falta `sameAs` (redes/perfiles). **No lo invento** — no encontré perfiles sociales en el repo. El dueño del sitio debe indicar si existen cuentas reales (LinkedIn, X, etc.) antes de añadir `sameAs`.
- ❌ Falta `contactPoint`. **No lo invento** — no hay teléfono/correo de soporte verificable en `apps/web/src/content/autores.ts` ni en `/contacto`. Si `/contacto` tiene un formulario sin correo público, no hay `contactPoint` verificable que declarar.
- ❌ Falta `foundingDate` y `address`. Correctamente **no inventados** — es un proyecto editorial, no una entidad legal con domicilio fiscal público conocido por este audit. No recomiendo añadirlos salvo que el dueño confirme datos reales.
- ⚠️ Duplicación entre `WebSite.description` (home) y `Organization.description`: son textos ligeramente distintos (`SITIO.subtitulo` vs `SITIO.descripcion`), no es un error pero conviene revisar que no confundan a un LLM que lea ambos como "la" descripción canónica del sitio.

**Qué debe suministrar el dueño del sitio (no verificable desde el repo):**
- Si existen perfiles sociales reales → URLs exactas para `sameAs`.
- Si hay un correo/teléfono de soporte público real → para `contactPoint`.
- Nada de domicilio fiscal, RFC o fecha de fundación si no están ya publicados en `/nosotros` o `/metodologia-editorial` — de lo contrario sería inventar datos de entidad legal, que la propia página `Organization` declara explícitamente que NO es autoridad ni institución formal.

**JSON-LD corregido (listo para pegar), sólo con datos verificables en el repo:**

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://leyantilavado.org/#organizacion",
  "name": "LeyAntilavado.org",
  "url": "https://leyantilavado.org",
  "description": "Centro independiente de información y herramientas sobre la LFPIORPI",
  "disambiguatingDescription": "Plataforma privada e independiente. No pertenece ni está afiliada al SAT, la UIF ni a ninguna autoridad gubernamental de México.",
  "logo": {
    "@type": "ImageObject",
    "url": "https://leyantilavado.org/icons/icono-512.png",
    "width": 512,
    "height": 512
  }
}
```

Cambio en `sitio.ts`:

```ts
export function jsonLdOrganizacion() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITIO.url}/#organizacion`,
    name: SITIO.nombre,
    url: SITIO.url,
    description: SITIO.subtitulo,
    disambiguatingDescription:
      'Plataforma privada e independiente. No pertenece ni está afiliada al SAT, la UIF ni a ninguna autoridad gubernamental de México.',
    logo: {
      '@type': 'ImageObject',
      url: `${SITIO.url}/icons/icono-512.png`,
      width: 512,
      height: 512,
    },
  };
}
```

---

## 3. Article — Advertencia

**Ubicación:** `jsonLdArticulo()` en `apps/web/src/components/contenido/JsonLd.tsx:20-56`. Usado en: `actividades-vulnerables`, `acuerdo-115-2026`, `calendario-cumplimiento`, `glosario`, `limites-efectivo`, `multas`, `obligaciones`, `reforma-ley-antilavado-2026`, `umbrales`, y (confirmado en código aunque no está en el HTML guardado) `obligaciones/[slug]`.

Ejemplo real (`/umbrales`):
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Umbrales de identificación y aviso de la LFPIORPI",
  "description": "Tabla completa de umbrales por actividad vulnerable, en UMA y en pesos, con selector de año.",
  "inLanguage": "es-MX",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://leyantilavado.org/umbrales" },
  "datePublished": "2026-08-11",
  "dateModified": "2026-08-11",
  "articleSection": "Umbrales",
  "author": { "@type": "Organization", "name": "Equipo editorial de LeyAntilavado.org", "url": "https://leyantilavado.org/metodologia-editorial" },
  "publisher": { "@type": "Organization", "name": "LeyAntilavado.org", "url": "https://leyantilavado.org" }
}
```

### 3.1 Requisitos de Google para `Article` (rich results)
- ✅ `headline` presente (verificar que ninguno pase de ~110 caracteres; los headlines revisados están bien).
- ✅ `image` — **no está presente en ningún bloque**. Es **requerido** por Google para elegibilidad de rich results de Article/carrusel. Severidad: **Crítico** si el objetivo es rich results de artículo; hoy el sitio simplemente no es elegible para esa mejora visual en SERP. No propongo una URL de imagen inventada: hay que confirmar qué OG image real usa cada página (`construirMetadata` en `sitio.ts` no define `openGraph.images` — otro hallazgo de SEO general, fuera de este audit de schema, pero es la misma imagen que faltaría aquí).
- ✅ `datePublished`/`dateModified` en ISO 8601 (`YYYY-MM-DD`, válido).
- ⚠️ `author.@type: Organization` es válido para Google (acepta Organization o Person), pero Google **recomienda Person cuando existe un autor identificable** para señales E-E-A-T más fuertes. El propio código de `autores.ts` documenta explícitamente por qué usan Organization ("Todavía no hay personas con nombre asignadas al contenido... no inventamos un autor"). Esto es una decisión editorial honesta, no un error — la marco como **Info**, no como fallo.
- ❌ `publisher` **no tiene `logo`** (dato explícito que pediste evaluar). Es requerido por la spec de Google para `Article`/`NewsArticle` (aunque Google dejó de mostrarlo visualmente en el snippet, su ausencia sigue marcada como "falta campo recomendado" en Rich Results Test y afecta a Discover/News). Mismo asset disponible: `icono-512.png`.
- ❌ Falta `@id` en el propio `Article` (para poder referenciarlo desde `Organization`/`WebPage` en un futuro `@graph` consolidado).
- ❌ Falta `isPartOf` apuntando al `WebPage`/`WebSite` — no es requerido por Google pero es una buena práctica de `@graph` enlazado que ayuda a motores de IA a entender jerarquía del sitio.
- ❌ Falta `about` — con `LegislationObject` o al menos una referencia textual al artículo de ley correspondiente (ver sección 7). Esto es la pieza que más valor le da al contenido, porque cada página ya cita artículos específicos de la LFPIORPI en el texto visible.

### 3.2 `dateModified` — exactitud
Las 16 páginas comparten **exactamente** `datePublished = dateModified = "2026-08-11"`. Esto **no es un bug**: viene de `REVISION_VIGENTE` en `apps/web/src/content/autores.ts`, una constante única y documentada ("Coincide con `ultimaRevision` de los datos del motor: si una se mueve sin la otra, hay que explicar por qué"). Es honesto mientras el sitio tenga una sola pasada editorial. **Severidad: Info, con una advertencia a futuro**: en cuanto una página individual se actualice sin que el resto se toque, hay que mover **sólo su fecha**, y hoy la arquitectura (`FIRMA_POR_DEFECTO` global) no distingue por página — todas las páginas de contenido usan el mismo `REVISION_VIGENTE` salvo que se pase `firma={...}` explícito. Si dentro de un mes se corrige una sola página, `dateModified` idéntico en las 16 dejaría de ser preciso y sería una señal de confianza rota ante Google (fechas de modificación que nunca cambian de forma diferenciada leen como "spam de frescura" o, peor, como fechas que no se mantienen).

### 3.3 `articleSection` como enum implícito
Cada página usa un valor de texto libre distinto (`"Umbrales"`, `"Efectivo"`, `"Sanciones"`, `"Marco normativo"`, `"Cumplimiento"`, `"Glosario"`, `"Obligaciones"`, `"Actividades vulnerables"`). Válido, sin errores.

### 3.4 Snippet corregido (`jsonLdArticulo`, listo para pegar)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://leyantilavado.org/umbrales#articulo",
  "headline": "Umbrales de identificación y aviso de la LFPIORPI",
  "description": "Tabla completa de umbrales por actividad vulnerable, en UMA y en pesos, con selector de año.",
  "inLanguage": "es-MX",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://leyantilavado.org/umbrales" },
  "isPartOf": { "@id": "https://leyantilavado.org/#sitio" },
  "datePublished": "2026-08-11",
  "dateModified": "2026-08-11",
  "articleSection": "Umbrales",
  "author": {
    "@type": "Organization",
    "name": "Equipo editorial de LeyAntilavado.org",
    "url": "https://leyantilavado.org/metodologia-editorial"
  },
  "publisher": {
    "@id": "https://leyantilavado.org/#organizacion"
  }
}
```

(Requiere que `Organization` emita `@id: https://leyantilavado.org/#organizacion`, como en el snippet de la sección 2, para poder referenciarlo por `@id` en vez de repetirlo. `image` se añade en cuanto exista una URL real de OG image por página — no inventar una ahora.)

---

## 4. FAQPage — Info (no Crítico, por la política vigente de Google)

Regla del audit: Google retiró el rich result de FAQ para todos los sitios (mayo 2026). Por tanto cualquier `FAQPage` existente se marca como **Info**, no como error, y no se recomienda agregar `FAQPage` nuevo salvo que el dueño acepte que el beneficio (si acaso) es sólo para IA/GEO y no para SERP de Google.

### 4.1 Regla de la casa: "sin FAQ invisible" — ✅ CUMPLE en las 4 páginas

Verifiqué cada pregunta de cada bloque `FAQPage` contra el texto visible renderizado (excluyendo el propio `<script>` JSON-LD) de la misma página:

| Página | Preguntas en JSON-LD | Visibles en el HTML |
|---|---|---|
| `/preguntas-frecuentes` | 19 | 19/19 ✅ |
| `/multas` | 8 | 8/8 ✅ |
| `/limites-efectivo` | 8 | 8/8 ✅ |
| `/umbrales` | 7 | 7/7 ✅ |

No hay ninguna pregunta marcada que no esté en el HTML visible de esa misma página. Esto confirma que la regla documentada en `JsonLd.tsx` ("un FAQPage sin las preguntas a la vista... es marcado que promete algo que la página no cumple") se respeta en la implementación real, no sólo en el comentario.

### 4.2 Duplicado de pregunta entre dos `FAQPage` distintos

La pregunta **"¿Los umbrales se calculan con IVA o sin IVA?"** aparece con texto idéntico como `Question` en dos páginas distintas: `/preguntas-frecuentes` y `/umbrales` (las respuestas también son casi idénticas, con leve variación de redacción). Severidad: **Info** — no es un error de validación (cada `FAQPage` es válido en su página), pero:
- Ya no importa para Google (no hay rich result de FAQ que "elegir" entre duplicados).
- Si el objetivo es señal de contenido único para motores de IA (GEO), vale la pena diferenciar la redacción o consolidar: dejar la versión completa en `/umbrales` (más específica) y en `/preguntas-frecuentes` enlazar en vez de repetir literal.

No encontré más duplicados de `Question` entre páginas.

### 4.3 Ningún genuine "Q&A de usuarios" mal clasificado
Ninguna de las 4 páginas es un foro de preguntas de usuarios reales (todas son FAQ editorial curado por el equipo) — `FAQPage` es el tipo correcto en los cuatro casos; no aplica `QAPage`.

---

## 5. BreadcrumbList — Aprobado, con una mejora de estándar

**Ubicación:** `jsonLdMigaDePan()` en `sitio.ts:171-182`, visible como componente `Migas` en `Articulo.tsx:14-41` (`<nav aria-label="Ruta de navegación">`).

Ejemplo:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://leyantilavado.org/" },
    { "@type": "ListItem", "position": 2, "name": "Umbrales", "item": "https://leyantilavado.org/umbrales" }
  ]
}
```

- ✅ `position` empieza en 1 y es secuencial.
- ✅ `item` es siempre una **URL absoluta string** (patrón aceptado por Google — no requiere ser objeto `@id`, así que esto **no es un error**, aunque el enunciado del audit sugería validar "URL u objeto con `@id`": la implementación usa el primer patrón válido, correctamente).
- ✅ El último elemento (página actual) **sí** trae `item` con URL propia — Google acepta ambas variantes (con o sin `item` en el último nodo); aquí se optó por incluirlo siempre, consistente en las 16 páginas.
- ✅ El breadcrumb visible (`Migas`) usa exactamente los mismos pares nombre/ruta que se le pasan a `jsonLdMigaDePan` en cada página (mismo array de origen) — coherencia estructural garantizada por diseño, no por casualidad: revisé `obligaciones/[slug]/page.tsx` y usa la misma lista para `<Migas items=...>` y `jsonLdMigaDePan(...)`.
- ⚠️ Todas las migas visibles y marcadas tienen sólo **2 niveles** (Inicio → página). Es honesto (el sitio no tiene jerarquía real más profunda en las páginas revisadas), no es un error.

Sin cambios necesarios en este bloque más allá de homogeneizar el formato `@graph` mencionado en la sección 1.

---

## 6. Dataset (`/umbrales`, `/limites-efectivo`) — Advertencia, buena base

**Ubicación:** `jsonLdConjuntoDatos()` en `JsonLd.tsx:77-99`.

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Umbrales de identificación y aviso del artículo 17 de la LFPIORPI",
  "description": "Conjunto de 38 reglas de umbral por actividad vulnerable, con su comparador, periodicidad y regla de acumulación, convertibles a pesos con los valores de la UMA de 2016 a 2026.",
  "url": "https://leyantilavado.org/umbrales",
  "inLanguage": "es-MX",
  "dateModified": "2026-08-11",
  "creator": { "@type": "Organization", "name": "LeyAntilavado.org", "url": "https://leyantilavado.org" },
  "isAccessibleForFree": true
}
```

Validación frente a los requisitos de Google para Dataset rich result: `name` ✅, `description` ✅. Google también quiere, si existen, `distribution`, `license`, y recomienda fuertemente `variableMeasured`, `temporalCoverage`, `spatialCoverage`, `keywords`, `creator`/`publisher` completos.

Faltantes concretos, y qué es honesto proponer:
- ❌ **`distribution`**: no existe ningún endpoint de descarga (CSV/JSON) para la tabla de umbrales ni la de límites de efectivo — confirmé que no hay botón de exportar en `TablaUmbrales.tsx` ni rutas de API bajo `/umbrales` o `/limites-efectivo`. **No inventar** una URL de descarga que no existe. Recomendación real: exponer un endpoint `GET /umbrales.json` (o `/api/umbrales`) que sirva los mismos datos del motor de reglas (`datos.OBLIGACIONES`/equivalente de umbrales) y then declarar `distribution`. Hasta que exista, omitir el campo es lo correcto (como está hoy).
- ❌ `license`: no hay una licencia de reuso declarada en ninguna página legal (`/legal/terminos` habría que confirmar). No inventar `CC-BY` ni ningún identificador — sólo agregar si el dueño define explícitamente los términos de reuso de estas tablas.
- ❌ `variableMeasured`: se puede agregar sin inventar nada, describiendo las columnas reales de la tabla (actividad vulnerable, umbral de identificación, umbral de aviso, periodicidad, comparador). Ver snippet abajo.
- ❌ `temporalCoverage`: el propio texto del sitio dice "convertibles a pesos con los valores de la UMA de 2016 a 2026" → `"2016-01-01/2026-12-31"` es un dato ya afirmado en el `description` visible, no inventado.
- ❌ `spatialCoverage`: el contenido es 100% sobre normativa mexicana → `"México"` es seguro declarar (`Country`, código `MX`).
- ❌ `keywords`: se puede derivar de términos ya usados en el sitio (LFPIORPI, UMA, umbrales, PLD, actividades vulnerables) sin inventar nada nuevo.
- ❌ `citation`: si el dato sale de una fuente oficial citada en `/fuentes-oficiales` (DOF, SAT), se podría enlazar — pero no tengo en este audit el contenido exacto de esa página para citar una URL específica sin arriesgarme a inventar una cita mal atribuida. Dejar pendiente hasta confirmar la URL oficial exacta que usan como fuente primaria de umbrales.

### Snippet corregido para `/umbrales` (listo para pegar, sin inventar `distribution`/`license`):

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": "https://leyantilavado.org/umbrales#dataset",
  "name": "Umbrales de identificación y aviso del artículo 17 de la LFPIORPI",
  "description": "Conjunto de 38 reglas de umbral por actividad vulnerable, con su comparador, periodicidad y regla de acumulación, convertibles a pesos con los valores de la UMA de 2016 a 2026.",
  "url": "https://leyantilavado.org/umbrales",
  "inLanguage": "es-MX",
  "dateModified": "2026-08-11",
  "creator": { "@id": "https://leyantilavado.org/#organizacion" },
  "isAccessibleForFree": true,
  "spatialCoverage": {
    "@type": "Place",
    "name": "México",
    "address": { "@type": "PostalAddress", "addressCountry": "MX" }
  },
  "temporalCoverage": "2016-01-01/2026-12-31",
  "variableMeasured": [
    "Actividad vulnerable (art. 17 LFPIORPI)",
    "Umbral de identificación en UMA",
    "Umbral de aviso en UMA",
    "Periodicidad de medición",
    "Comparador aplicable (superior a / igual o superior a)"
  ],
  "keywords": ["LFPIORPI", "UMA", "umbrales de identificación", "umbral de aviso", "actividades vulnerables", "PLD/FT México"]
}
```

Aplicar el mismo patrón (con sus propios `variableMeasured`) al `Dataset` de `/limites-efectivo`, cambiando `variableMeasured` a los 8 supuestos del art. 32 con su límite en UMA. **No agregar `distribution` ni `license` hasta que existan de verdad.**

---

## 7. DefinedTermSet (`/glosario`) — Aprobado

**Ubicación:** `jsonLdConjuntoTerminos()` en `JsonLd.tsx:58-75`, 45 términos en `hasDefinedTerm`.

- ✅ Cada `DefinedTerm` tiene `@id` único ancla (`#slug`), `name` y `description` no vacíos.
- ✅ `url` del `DefinedTermSet` apunta a la página correcta.
- ✅ Sin placeholders, sin duplicados de `@id` (verifiqué 45 slugs, todos únicos).
- Única mejora opcional, no obligatoria: agregar `inDefinedTermSet` recíproco en cada `DefinedTerm` (Google no lo exige, es redundante con estar dentro de `hasDefinedTerm`) — **no recomendado**, añadiría peso sin beneficio.

Sin cambios necesarios.

---

## 8. WebSite (home) — Advertencia menor

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "LeyAntilavado.org",
  "alternateName": "Ley Antilavado México",
  "url": "https://leyantilavado.org",
  "description": "...",
  "inLanguage": "es-MX"
}
```

- Verifiqué si existe una búsqueda real en el sitio: no encontré un endpoint de búsqueda global ni un campo `<input type="search">` conectado a resultados internos — sólo filtros locales en `/directorio` y en la tabla de umbrales, que no son "buscar en todo el sitio". **Correcto no incluir `potentialAction: SearchAction`** — agregarlo sería declarar una función que no existe. Si en el futuro se agrega un buscador real (`/buscar?q=`), ahí sí vale añadir `SearchAction`.
- Falta `@id` (`https://leyantilavado.org/#sitio`) para poder enlazarlo desde `Article.isPartOf` (ver sección 3).
- Falta `publisher` (referenciando `Organization`) — recomendable, no crítico.

### Snippet corregido:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://leyantilavado.org/#sitio",
  "name": "LeyAntilavado.org",
  "alternateName": "Ley Antilavado México",
  "url": "https://leyantilavado.org",
  "description": "Calcula umbrales, acumulación de seis meses, límites de efectivo y fechas de aviso de la Ley Antilavado con la UMA vigente en la fecha de tu operación. Herramientas gratuitas con fuente oficial citada.",
  "inLanguage": "es-MX",
  "publisher": { "@id": "https://leyantilavado.org/#organizacion" }
}
```

---

## 9. HowTo — evaluado honestamente, **no se recomienda en ninguna página**

Revisé los 4 candidatos pedidos:

- **`/obligaciones/[slug]`**: tiene una sección real "Pasos accionables" con `<ol>` numerado y evidencia por paso (`apps/web/src/app/obligaciones/[slug]/page.tsx:143-172`). Estructuralmente es justo el tipo de contenido que HowTo describía. **Aun así, no lo recomiendo**: Google retiró el rich result de HowTo en septiembre de 2023 y no hay señal de que vuelva. Marcar HowTo hoy no da ningún beneficio en SERP y añade peso de mantenimiento sin retorno.
- **`/herramientas/fecha-limite-aviso`**: es una calculadora con explicación de método (“Cómo calcula”) y ejemplos, no una secuencia de pasos que el usuario ejecuta manualmente — no calificaría como HowTo aunque el rich result existiera.
- **`/herramientas/checklist-expediente`**: es un checklist interactivo (marcar/desmarcar), no instrucciones secuenciales dependientes — tampoco es HowTo genuino.
- **`/calendario-cumplimiento`**: es una línea de tiempo de fechas normativas con cuenta regresiva, no un procedimiento — no aplica.

Conclusión: correcto que el sitio no use HowTo en ninguna parte hoy. No hay que agregarlo en ningún lugar.

---

## 10. Oportunidades faltantes reales

### 10.1 SoftwareApplication / WebApplication en `/herramientas/*` — Oportunidad real, no explotada

Confirmé que sólo `/herramientas` (índice) tiene JSON-LD (`Organization` + `BreadcrumbList`); ninguna de las 16 subpáginas de calculadoras (`calculadora-uma`, `calculadora-umbrales`, `calculadora-multas`, `fecha-limite-aviso`, `checklist-expediente`, `acumulacion-operaciones`, `beneficiario-controlador`, `limites-efectivo`, `cuestionario`, `matriz-riesgos`, `plan-cumplimiento`, `clasificacion-clientes`, `preparacion-auditoria`, `mecanismos-automatizados`, `importar-operaciones`, `comparador-obligaciones`, `capacitacion-anual`) tiene `JsonLd`. Son herramientas web reales, gratuitas, que corren en el navegador (confirmé en `fecha-limite-aviso/page.tsx` y `checklist-expediente/page.tsx` que el cálculo y el `.ics`/CSV se generan client-side, sin servidor) — candidato honesto para `WebApplication`.

Snippet propuesto para `/herramientas/fecha-limite-aviso` (mismo patrón para las demás, cambiando `name`/`description`/`url`):

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Calculadora de fecha límite del aviso — LFPIORPI",
  "url": "https://leyantilavado.org/herramientas/fecha-limite-aviso",
  "description": "Calcula el día 17 aplicable a tus operaciones, los días que te quedan y las próximas seis fechas límite. Exporta recordatorios en .ics.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "inLanguage": "es-MX",
  "isAccessibleForFree": true,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "MXN" },
  "publisher": { "@id": "https://leyantilavado.org/#organizacion" }
}
```

Nota honesta: no incluí `aggregateRating` — no existe sistema de calificación de usuarios en el repo; no inventar reseñas.

### 10.2 ItemList — Oportunidad moderada
`/herramientas` (catálogo de ~17 herramientas) y `/directorio` (catálogo de profesionales) son candidatos naturales a `ItemList` para reforzar la semántica de "esto es un catálogo enumerado". No es crítico porque `BreadcrumbList` + la propia estructura HTML ya comunican la página; lo marco como mejora opcional de prioridad baja.

### 10.3 LegislationObject / `about` — Oportunidad de mayor valor real
Cada `Article` del sitio gira en torno a artículos específicos y verificables de la LFPIORPI (`art. 17`, `art. 32`, `art. 53/54/55`) que ya se citan en el texto visible. Vincular `about` a un `Legislation`/`LegislationObject` (o, más simple y sin riesgo de sobre-declarar jurisdicción, a un `about` genérico tipo `Thing`/`DefinedTerm` apuntando al glosario) sería la mejora semántica de mayor valor porque conecta contenido explicativo con la norma real citada. Propuesta mínima y segura (sin fabricar metadatos de `LegislationObject` que requeriría URLs oficiales del DOF que no confirmé en este audit):

```json
"about": {
  "@type": "DefinedTerm",
  "name": "LFPIORPI",
  "url": "https://leyantilavado.org/glosario#lfpiorpi"
}
```

Esto reutiliza el propio `DefinedTermSet` del glosario, ya publicado y verificado, en lugar de fabricar una referencia legal externa sin confirmar la URL oficial exacta del DOF.

### 10.4 SpeakableSpecification — No recomendado
No hay evidencia de que el sitio tenga una integración con asistentes de voz ni contenido optimizado para lectura en voz alta más allá del texto normal. Agregarlo sin un caso de uso real sería ruido. **No se recomienda.**

---

## 11. Resumen de severidades

| # | Hallazgo | Severidad |
|---|---|---|
| 1 | `Organization` sin `logo` (asset real disponible) | Advertencia |
| 2 | `Organization` sin `sameAs`/`contactPoint` (dato no verificable, no inventar) | Info |
| 3 | `Article` sin `image` (requisito de Google para rich results) | Crítico |
| 4 | `Article.publisher` sin `logo` | Advertencia |
| 5 | `Article` sin `@id`/`isPartOf`/`about` | Advertencia |
| 6 | `dateModified` idéntico en las 16 páginas (hoy honesto, riesgo a futuro si no se granulariza) | Info |
| 7 | `FAQPage` presente en 4 páginas — sin beneficio de SERP desde may-2026 | Info |
| 8 | Pregunta duplicada entre `/preguntas-frecuentes` y `/umbrales` | Info |
| 9 | Formato mixto `@graph` vs. array de objetos con `@context` repetido | Info |
| 10 | `Dataset` sin `distribution`/`license`/`variableMeasured`/`temporalCoverage`/`spatialCoverage`/`keywords` | Advertencia |
| 11 | `WebSite` sin `@id`/`publisher`, correcto en NO tener `SearchAction` (no hay buscador real) | Info |
| 12 | 17 páginas de `/herramientas/*` sin ningún JSON-LD (`WebApplication` ausente) | Advertencia |
| 13 | Sin HowTo en ningún lado | ✅ Correcto, sin acción |
| 14 | Sin tipos obsoletos (HowTo/SpecialAnnouncement/CourseInfo/etc.) | ✅ Correcto |
| 15 | Regla "sin FAQ invisible" | ✅ Cumple en 4/4 páginas con FAQPage |

**No se modificó ningún archivo fuente** — este documento sólo contiene hallazgos y snippets propuestos para pegar manualmente.
