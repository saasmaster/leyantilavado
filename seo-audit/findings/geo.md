# Auditoría GEO — leyantilavado.org (staging: leyantilavado.saavatar.top)

Fecha de auditoría: 2026-08-12. Fuente: HTML crudo de 16 páginas en `seo-audit/raw/*.html` +
lectura directa del código fuente en `apps/web/src` (sin re-crawl, el sitio está con
`Disallow: /` a propósito mientras no se marca `indexable`). Ningún número de tráfico,
volumen de búsqueda o share de citación se inventó: donde no hay dato verificable, se dice
"no verificable con esta evidencia" en vez de estimarlo.

## GEO Health Score: 62 / 100 (arquitectura), 0 / 100 (estado actual de rastreo)

El sitio está deliberadamente bloqueado (`robots.ts` → `Disallow: /` para `userAgent: '*'`)
mientras `NEXT_PUBLIC_SITE_INDEXABLE` no sea `true`. Ese `'*'` cubre también a los 11
crawlers de IA pedidos en el alcance: no hay reglas por bot, así que hoy **ninguno** puede
leer nada. El 62/100 de abajo es el score de la arquitectura *asumiendo que se activa el
flag antes de salir a producción* — es lo que se obtendría el día 1 de indexación con el
código actual, sin ningún otro cambio.

| Dimensión | Peso | Score | Comentario |
|---|---|---|---|
| Citability | 25% | 65/100 | Bloque "Respuesta directa" bien diseñado y mayormente autocontenido, pero corto (37–67 palabras vs. 134–167 óptimo) y ausente en 7/16 páginas auditadas |
| Structural Readability | 20% | 75/100 | Migas, índice de contenidos, secciones con ancla, FAQ y tablas SSR sólidas; encabezados declarativos, no en formato pregunta (salvo el propio FAQ) |
| Multi-Modal Content | 15% | 40/100 | Todo el corpus es texto + tablas; sin imágenes, diagramas ni video verificados en el HTML crudo |
| Authority & Brand Signals | 20% | 45/100 | Diferenciador real (`fuentes-oficiales` con 7 fuentes trazadas por regla) pero sin autor con nombre/credenciales, sin campo `reviewer` en JSON-LD, sin señales de marca externas verificables |
| Technical Accessibility | 20% | 80/100 (arquitectura) / 0/100 (hoy) | SSR completo confirmado (tablas, JSON-LD y "Respuesta directa" están en el HTML sin JS), pero el sitio entero está `noindex,nofollow` + `Disallow: /` en este momento |

**Cálculo ponderado (arquitectura):** 65×0.25 + 75×0.20 + 40×0.15 + 45×0.20 + 80×0.20 = **62/100**.

---

## 1. Citabilidad a nivel de pasaje (`respuestaDirecta`)

`respuestaDirecta` está definido en `apps/web/src/content/tipos.ts:79-80` y se renderiza vía
`CabeceraArticulo` en `apps/web/src/components/contenido/Articulo.tsx:45-83` dentro de un
bloque con borde izquierdo "Respuesta directa". Está presente en:

- Las 22 actividades vulnerables (`content/actividades.ts`)
- Las 19 obligaciones (`content/obligaciones.ts`)
- 8 páginas índice/landing con el string inline en el propio `page.tsx`: `multas`,
  `reforma-ley-antilavado-2026`, `calendario-cumplimiento`, `actualizaciones`,
  `obligaciones` (índice), `acuerdo-115-2026`, `umbrales`, `glosario`, `limites-efectivo`,
  `actividades-vulnerables` (índice)

**Confirmado server-rendered**: el texto exacto de "Respuesta directa" aparece en el HTML
crudo de `acuerdo-115-2026.html`, `actividades-vulnerables.html`, `calendario-cumplimiento.html`,
`glosario.html`, `limites-efectivo.html`, `obligaciones.html`, `reforma-ley-antilavado-2026.html`,
`umbrales.html`, `multas.html` — un LLM sin JS lo ve igual que un navegador.

### 1.1 Páginas sin `respuestaDirecta` (7 de 16 auditadas, 44%)

`home.html`, `directorio.html`, `herramientas.html`, `nosotros.html`,
`metodologia-editorial.html`, `fuentes-oficiales.html`, `preguntas-frecuentes.html` no usan
`CabeceraArticulo` (verificado con `grep -n "CabeceraArticulo\|respuestaDirecta"` sobre
`page.tsx` de cada una — cero resultados). Son exactamente las páginas con más potencial de
cita directa por un LLM (definición del proyecto, metodología, fuentes, FAQ agregado):
ahora mismo no tienen el ancla de una sola frase que un motor generativo pueda extraer sin
tener que resumir la página completa.

### 1.2 Longitud: sistemáticamente por debajo del rango óptimo

Conteo de palabras de los 39 `respuestaDirecta` en `actividades.ts` + `obligaciones.ts`
(script propio, no estimado):

- Rango real: **37–67 palabras**
- Rango óptimo de cita (134–167 palabras): **ninguno de los 39 lo alcanza**
- Media aproximada: ~51 palabras

Ejemplo del extremo corto, `vales-cupones-monederos` (`content/actividades.ts:222`, 37
palabras): *"Emitir, comercializar o abonar recursos en vales, cupones, monederos
electrónicos o certificados —lo que la ley llama instrumentos de almacenamiento de valor
monetario— es actividad vulnerable, se mide por operación y comparte umbral entre
identificación y aviso."* Es correcto y autocontenido, pero un motor generativo que busca un
pasaje de ~150 palabras para citar tiene que ir a buscar el resto en `puntosClave` o en el
FAQ — piezas separadas, no un único bloque citable.

**Esto es el hallazgo de mayor apalancamiento del audit**: no requiere rediseño, requiere
que cada `respuestaDirecta` crezca ~2-3 frases (quién es el sujeto obligado exacto + la
excepción más común + qué evidencia lo prueba), manteniendo la misma estructura sin rodeos.

### 1.3 Pasajes débiles por uso de deícticos/pronombres sin antecedente nombrado

Se buscó `aquí|esta página|esta tabla|este catálogo|este glosario|esta materia|como vimos`
sobre los 39 bloques de contenido + los 10 inline. Cinco no sobreviven la prueba de "se cita
solo, sin nada alrededor":

**a) `apps/web/src/app/actualizaciones/page.tsx:75` — el más grave, "Aquí" es la primera palabra**

Texto actual:
> "Aquí queda registrado cada cambio normativo que afecta al contenido del sitio, con la
> fecha del hecho —la publicación en el Diario Oficial, no la de nuestra nota—, qué cambia
> en la práctica para un sujeto obligado y qué páginas se actualizaron por ese cambio."

Propuesta:
> "La bitácora de actualizaciones de LeyAntilavado.org registra cada cambio normativo de la
> LFPIORPI que afecta el contenido del sitio, con la fecha del hecho —la publicación en el
> Diario Oficial, no la de la nota—, qué cambia en la práctica para un sujeto obligado y qué
> páginas se actualizaron por ese cambio."

**b) `apps/web/src/content/actividades.ts:1105` (slug `fe-publica-servidores-publicos`) — "esta página" sin nombrar qué página**

Texto actual:
> "El apartado C alcanza a los servidores públicos a quienes la ley confiere la facultad de
> dar fe pública. La ley enuncia el apartado, pero no fija umbrales propios y la tabla
> oficial de umbrales del SAT no lo desglosa. Por eso esta página existe y explica el
> supuesto, pero no publica ninguna cifra: inventarla sería peor que decir que falta."

Propuesta:
> "El apartado C del art. 17, fracción XII de la LFPIORPI alcanza a los servidores públicos
> a quienes la ley confiere la facultad de dar fe pública. La ley enuncia el apartado, pero
> no fija umbrales propios y la tabla oficial de umbrales del SAT no lo desglosa:
> LeyAntilavado.org documenta el supuesto sin publicar una cifra que no tiene fuente
> oficial, porque inventarla sería peor que señalar que falta."

**c) `apps/web/src/app/glosario/page.tsx:75` — "esta materia" y "este glosario" sin nombrar la LFPIORPI**

Texto actual:
> "El vocabulario de esta materia está lleno de siglas y de términos que se usan mal de
> forma sistemática. Cada entrada de este glosario trae la definición, la disposición donde
> vive el término y, cuando hace falta, una precisión que corrige el malentendido más común
> en lugar de repetirlo."

Propuesta:
> "El vocabulario de la Ley Antilavado (LFPIORPI) está lleno de siglas y de términos que se
> usan mal de forma sistemática —PLD, EBR, PEP, beneficiario controlador—. Cada entrada del
> glosario de LeyAntilavado.org trae la definición, la disposición donde vive el término y,
> cuando hace falta, una precisión que corrige el malentendido más común en lugar de
> repetirlo."

**d) `apps/web/src/app/umbrales/page.tsx:123` — "Esta tabla" sin nombrar la herramienta**

Texto actual:
> "Cada actividad vulnerable tiene dos umbrales: uno de identificación y otro de aviso,
> expresados en veces el valor diario de la UMA. Esta tabla los muestra todos, los
> convierte a pesos con la UMA del año que elijas y conserva el detalle que las tablas
> estáticas pierden: el comparador exacto, la periodicidad y los supuestos de las reglas que
> no son un número."

Propuesta:
> "Cada una de las actividades vulnerables del art. 17 de la LFPIORPI tiene dos umbrales:
> uno de identificación y otro de aviso, expresados en veces el valor diario de la UMA. La
> tabla de umbrales de LeyAntilavado.org los muestra todos, los convierte a pesos con la UMA
> del año que elijas y conserva el detalle que las tablas estáticas pierden: el comparador
> exacto, la periodicidad y los supuestos de las reglas que no son un número."

**e) `apps/web/src/app/obligaciones/page.tsx:72` — "este catálogo" (menor: las dos primeras frases ya son autocontenidas y citan el art. 18, sólo la frase de cierre depende del contexto)**

Texto actual (frase problemática al final):
> "...Cada página de este catálogo trae los pasos accionables y, sobre todo, la evidencia
> que un auditor espera encontrar."

Propuesta (mismo cambio mínimo):
> "...Cada página del catálogo de obligaciones de LeyAntilavado.org trae los pasos
> accionables y, sobre todo, la evidencia que un auditor espera encontrar."

Los demás 34 bloques citan artículo/fracción o el nombre de la figura en la primera frase
(p. ej. "El art. 32 no es un umbral de reporte: es una prohibición" en `limites-efectivo`, o
"El apartado B tiene cuatro incisos y sólo uno de ellos —los avalúos—" en
`fe-publica-corredores`) y se sostienen solos si se citan sin nada alrededor. El caso
`cheques-viajero` (`content/actividades.ts:290`, "Aquí la identificación no tiene umbral")
se revisó aparte: el "Aquí" tiene antecedente ("cheques de viajero") dentro del mismo
párrafo citado, así que sobrevive la prueba — se documenta para que no se pierda en una
futura edición, pero no se cuenta como débil.

---

## 2. Accesibilidad para crawlers de IA

`apps/web/src/app/robots.ts` (fuente completa, 25 líneas):

```ts
export default function robots(): MetadataRoute.Robots {
  if (!SITIO.indexable) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/admin/', '/api/', '/resultado/', '/entrar', '/registro', '/recuperar'],
    }],
    sitemap: `${SITIO.url}/sitemap.xml`,
    host: SITIO.url,
  };
}
```

No hay bloques por user-agent — todo pasa por `'*'`. Estado por bot pedido en el alcance,
tal como quedaría el día que se active `NEXT_PUBLIC_SITE_INDEXABLE=true`:

| Crawler | Estado hoy (staging) | Estado al activar `indexable` |
|---|---|---|
| GPTBot | Bloqueado (`Disallow: /`) | Permitido |
| OAI-SearchBot | Bloqueado | Permitido |
| ClaudeBot | Bloqueado | Permitido |
| Claude-User | Bloqueado | Permitido |
| Claude-SearchBot | Bloqueado | Permitido |
| PerplexityBot | Bloqueado | Permitido |
| Google-Extended | Bloqueado | Permitido |
| CCBot | Bloqueado | Permitido |
| Bytespider | Bloqueado | Permitido |
| Applebot-Extended | Bloqueado | Permitido |
| cohere-ai | Bloqueado | Permitido |
| meta-externalagent | Bloqueado | Permitido |

`apps/web/src/lib/sitio.ts:14-26` documenta explícitamente por qué el default es
"indexable=true salvo apagado explícito" (un fallo de despliegue que compile antes de
inyectar la variable deja el sitio visible, no invisible) — es un diseño defensivo correcto.
El HTML crudo confirma el estado actual: `home.html` trae
`<meta name="robots" content="noindex, nofollow"/>`.

**Decisión pendiente, no técnica sino de negocio**: hoy no hay ninguna diferenciación entre
bots de búsqueda con IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) y bots que sólo
entrenan modelos sin atribución directa de tráfico (CCBot, Bytespider, cohere-ai,
meta-externalagent). Dado que el modelo de negocio del sitio depende de ser la fuente citada
—no de tráfico de referral clásico—, la recomendación por defecto es **dejarlos todos
abiertos**: bloquear entrenamiento reduce la probabilidad de que el corpus quede como fuente
canónica dentro del modelo. Es una decisión que le corresponde a Jorge si cambia el cálculo
de negocio; el código ya soporta añadir reglas por bot sin fricción.

---

## 3. `llms.txt`

No existe: no hay ninguna ruta `llms.txt`, `llms-full.txt` ni archivo similar en
`apps/web/src/app` (`find apps/web/src/app -iname "*llms*"` → vacío). Tampoco hay RSL 1.0
(`license` en robots.txt o `<link rel="license">`) en ninguna de las 16 páginas.

### Estructura propuesta para `/llms.txt`

El diferenciador real del sitio frente a los despachos que publican PDFs es verificable en
el propio código: cada cifra legal sale de `datos.UMBRALES`/`datos.REGLAS_EFECTIVO` del motor
de reglas versionado (nunca escrita a mano en el contenido editorial — regla explícita en
`content/tipos.ts:11-14`), y cada regla apunta a una de las 7 fuentes oficiales trazadas en
`/fuentes-oficiales` con fecha de última revisión y estado. Un `llms.txt` debería explotar
justo eso — no es una lista de enlaces genérica, es una declaración de procedencia:

```
# LeyAntilavado.org

> Centro independiente de información y herramientas sobre la LFPIORPI (Ley Federal para la
> Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita, México).
> Cada cifra legal (umbral, límite de efectivo, multa) sale de un motor de reglas versionado
> con cita a una de 7 fuentes oficiales trazadas en /fuentes-oficiales, no de texto escrito a
> mano. No somos el SAT, la UIF ni ninguna autoridad — somos un proyecto editorial privado.

## Empezar aquí
- [Reforma 2026 explicada](/reforma-ley-antilavado-2026): por qué "no hay una Ley Antilavado
  nueva", sino tres instrumentos con jerarquías y fechas distintas.
- [Umbrales completos](/umbrales): tabla de identificación y aviso de las 22 actividades
  vulnerables, convertida a pesos con la UMA del año que se elija.
- [Actividades vulnerables](/actividades-vulnerables): las 22 fracciones/incisos del art. 17,
  cada una con su propia página (a quién alcanza, a quién no, ejemplo resuelto).
- [Obligaciones](/obligaciones): las 19 obligaciones del art. 18, con evidencia esperada por
  auditor en cada una.
- [Límites de efectivo](/limites-efectivo): la prohibición del art. 32, distinta del umbral
  de aviso del art. 17.
- [Multas y sanciones](/multas): rangos del art. 54 y autocorrección del art. 55.
- [Calendario de cumplimiento](/calendario-cumplimiento): fechas escalonadas del Acuerdo
  115/2026, 2026–2029.
- [Glosario](/glosario): PLD, EBR, PEP, beneficiario controlador y demás siglas, con la
  disposición donde vive cada término.

## Metodología y procedencia
- [Fuentes oficiales](/fuentes-oficiales): las 7 fuentes primarias, qué se usa de cada una,
  cuántas reglas la citan y cuándo se revisó por última vez.
- [Metodología editorial](/metodologia-editorial): cómo se produce y se contrasta el contenido.
- [Bitácora de actualizaciones](/actualizaciones): cada cambio normativo con fecha del Diario
  Oficial y páginas afectadas.

## Herramientas (cálculo en el navegador, sin envío de datos a servidor)
- [Calculadora de umbrales](/herramientas/calculadora-umbrales)
- [Conversor UMA histórico 2016-2026](/herramientas/calculadora-uma)
- [Acumulación de seis meses](/herramientas/acumulacion-operaciones)
- [Fecha límite de aviso](/herramientas/fecha-limite-aviso)
- [Estimador de multas](/herramientas/calculadora-multas)
- Catálogo completo: /herramientas

## Opcional
- [Preguntas frecuentes](/preguntas-frecuentes)
- [Directorio de profesionales](/directorio)
```

No incluir `/app/`, `/admin/`, `/resultado/` ni las páginas de autenticación (ya excluidas en
`robots.ts`) ni `/precios`, `/plantillas`, `/cursos`, `/software-cumplimiento` — son páginas
comerciales/producto, no las que un LLM debería citar como fuente normativa.

---

## 4. E-E-A-T y legibilidad por máquina

Firma editorial: `apps/web/src/content/autores.ts`. Todo el contenido lo firma
`EQUIPO_EDITORIAL` ("Equipo editorial de LeyAntilavado.org"), con `credenciales: []` — vacío
a propósito (comentario en el propio archivo, líneas 6-13: "preferimos un arreglo vacío
honesto a una credencial inventada"). No hay `revisor` asignado en `FIRMA_POR_DEFECTO`
(línea 44-48), así que **hoy no existe ningún caso donde se muestre un revisor real ni en
el HTML ni en el JSON-LD** — es consistente entre ambos (no hay discrepancia que "prometa
algo que la página no cumple"), pero es una señal de autoridad débil frente a competidores
que sí exhiben abogados con cédula.

`FirmaEditorial` (`components/contenido/Articulo.tsx:175-235`) sí muestra visiblemente
nombre, rol, descripción, metodología (desplegable), fecha de publicación y fecha de última
actualización — pero **eso no se traduce a JSON-LD `Article.author`**.

`jsonLdArticulo` (`components/contenido/JsonLd.tsx:20-56`) emite:
```json
"author": { "@type": "Organization", "name": "Equipo editorial de LeyAntilavado.org", "url": ".../metodologia-editorial" }
```
Siempre `Organization`, nunca `Person`. `datePublished`/`dateModified` sí están presentes y
coinciden con `REVISION_VIGENTE = '2026-08-11'` (`autores.ts:42`). No hay `reviewedBy` ni
campo equivalente en el schema — coherente con que tampoco hay revisor visible, pero cuando
Jorge agregue un revisor con nombre (el propio comentario del código dice "cuando haya un
revisor real, se agrega aquí... no hay que tocar ninguna página"), **`jsonLdArticulo` sí
necesita tocarse** para emitir `reviewedBy`, porque hoy ese campo no existe en la función.

Fortaleza real y verificable: `/fuentes-oficiales` (confirmado en `fuentes-oficiales.html`)
lista 7 fuentes oficiales (LFPIORPI en Cámara de Diputados, reforma al Reglamento en DOF,
Acuerdo 115/2026 en DOF, etc.) con "qué se usa de cada una", "reglas que la citan" (94 para
la ley, 3 para el reglamento en el corte auditado), fecha de última revisión y estado ("En
uso, con datos pendientes de revisión" / "En uso, con contraste parcial"). Esto es
exactamente el tipo de trazabilidad regla→fuente que un despacho publicando un PDF estático
no puede ofrecer, y es el diferenciador más defendible del sitio para E-E-A-T — pero
**no está en `respuestaDirecta` de ninguna página individual ni tiene su propia página en
`llms.txt` propuesto arriba con esa prioridad**, y encima `/fuentes-oficiales` es una de las
7 páginas sin `CabeceraArticulo` (sección 1.1).

Marcado de datos por fuente sí existe visualmente vía `SelloProcedencia` (importado en
`actividades-vulnerables/[slug]/page.tsx`) y `sinUmbralPublicado` en el contenido (p. ej.
`fe-publica-servidores-publicos` y `personas-facilitadoras`, que explícitamente dicen que no
hay cifra oficial en vez de inventar una) — buena práctica de honestidad editorial que un
LLM puede citar sin miedo de que sea alucinación de la fuente.

**Marca externa (Wikipedia, Reddit, YouTube, LinkedIn)**: no verificable con la evidencia
disponible (HTML estático de 16 páginas propias). No se estima ningún número de menciones ni
correlación — el sitio es nuevo y no hay forma de confirmar presencia externa desde estos
archivos. Recomendación: no inventar cifra, medir con DataForSEO u otra herramienta cuando
el sitio esté indexable.

---

## 5. Tablas y datos en HTML server-rendered (sin JS)

Confirmado con `grep -o "<table"` sobre el HTML crudo — cero dependencia de hidratación para
ver las tablas:

| Página | `<table>` en HTML crudo | Nota |
|---|---|---|
| `umbrales.html` | Sí (2) | Tabla completa de umbrales visible sin JS |
| `multas.html` | Sí (2) | Rangos de sanción visibles sin JS |
| `limites-efectivo.html` | Sí (2) | Límites del art. 32 visibles sin JS |
| `actividades-vulnerables.html` | No | Listado en tarjetas, no tabla — correcto para ese formato, contenido igual presente como texto |
| `calendario-cumplimiento.html` | No | Fechas en formato lista/tarjeta, no tabla |
| `glosario.html` | No | Términos en `dl`/tarjetas, no tabla |

`herramientas.html` y `directorio.html` se verificaron aparte por ser las páginas con más
lógica de cliente (calculadoras, filtros): ambas traen texto sustancial fuera de cualquier
`<script>` (7,062 y 20,169 caracteres respectivamente) — el copy explicativo, el listado de
herramientas y los perfiles de demostración del directorio están en el HTML server-rendered,
no sólo detrás de hidratación. Los *resultados* de cálculo (dependientes de input del
usuario) son necesariamente client-side y no pueden ser SSR por diseño — eso es correcto y
no es un defecto GEO, un LLM no necesita ver un resultado calculado para un input arbitrario.

JSON-LD confirmado presente en el HTML crudo de las 16 páginas (`Organization` en todas,
`BreadcrumbList` en todas, `Article` en páginas de contenido, `FAQPage` en páginas con FAQ
—incluida `preguntas-frecuentes.html`, confirmado con parseo JSON del bloque array que
contiene `BreadcrumbList` + `FAQPage`—, `DefinedTermSet` en `glosario.html`, `Dataset` en
páginas de datos tabulares). Todo antes de cualquier hidratación.

---

## Top 5 cambios de mayor impacto

1. **Activar `NEXT_PUBLIC_SITE_INDEXABLE=true` antes de salir a producción.** Sin esto, el
   score real es 0 sin importar cualquier otro cambio — hoy `Disallow: /` bloquea a los 12
   crawlers pedidos por igual. Esfuerzo: trivial (una variable de entorno en el pipeline de
   deploy). Impacto: bloqueante, no opcional.
2. **Alargar los 39 `respuestaDirecta` de actividades y obligaciones al rango 134–167
   palabras**, añadiendo 2-3 frases (sujeto obligado exacto, excepción más común, evidencia
   que prueba el cumplimiento) sin perder el tono directo actual. Esfuerzo: medio (contenido,
   no código — el campo ya existe y ya se renderiza SSR). Impacto: alto, es la única
   dimensión con brecha sistemática de 39/39 páginas.
3. **Agregar `CabeceraArticulo`/`respuestaDirecta` a las 7 páginas que hoy no lo tienen**
   (`home`, `herramientas`, `directorio`, `nosotros`, `metodologia-editorial`,
   `fuentes-oficiales`, `preguntas-frecuentes`) — empezando por `fuentes-oficiales`, que es
   el diferenciador de autoridad más citable del sitio y hoy no tiene un pasaje de respuesta
   directa que lo resuma. Esfuerzo: medio (una frase por página + wiring del componente).
   Impacto: alto para las páginas de metodología/fuentes, que son las que un LLM citaría al
   preguntar "¿esta fuente es confiable?".
4. **Publicar `/llms.txt`** con la estructura propuesta en la sección 3, priorizando
   `/fuentes-oficiales` y `/metodologia-editorial` como prueba de procedencia verificable.
   Esfuerzo: bajo (un archivo estático o una ruta `route.ts`). Impacto: medio-alto, es
   señal directa para crawlers de IA sin necesidad de que rastreen todo el sitio.
5. **Corregir los 5 pasajes con deícticos sin antecedente nombrado** (sección 1.3) y añadir
   `reviewedBy` a `jsonLdArticulo` en cuanto exista un revisor con nombre real (el propio
   comentario del código ya anticipa este caso). Esfuerzo: bajo. Impacto: medio, mejora
   consistencia de citabilidad y prepara el terreno de E-E-A-T sin tener que tocar páginas
   cuando llegue el revisor.

---

## Scores por plataforma (no verificables, no estimados)

No se corrió `ai_optimization_chat_gpt_scraper` ni `ai_opt_llm_ment_search` de DataForSEO
(no había credenciales/MCP disponibles en esta sesión) y el sitio está bloqueado a rastreo,
así que no existe ninguna visibilidad real hoy en Google AIO, ChatGPT, Perplexity o Bing
Copilot que se pueda medir. Cualquier número aquí sería inventado — se omite a propósito. Una
vez el sitio esté indexable, correr esas herramientas es el siguiente paso natural para
tener una línea base real.

## Archivos referenciados

- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/content/tipos.ts`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/content/actividades.ts`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/content/obligaciones.ts`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/content/autores.ts`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/components/contenido/Articulo.tsx`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/components/contenido/JsonLd.tsx`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/app/robots.ts`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/lib/sitio.ts`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/app/actualizaciones/page.tsx`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/app/glosario/page.tsx`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/app/umbrales/page.tsx`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/apps/web/src/app/obligaciones/page.tsx`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/seo-audit/raw/*.html`
- `/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/seo-audit/raw/sitemap.xml` (93 rutas)
