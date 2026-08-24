# Auditoría GEO — leyantilavado.org
Fecha: 2026-08-24. Verificación en vivo (curl, render_page.py --mode never, trafilatura 2.1.0 sobre HTML crudo). Auditoría previa: 2026-08-12.

## Tabla de hallazgos

| ID | Severidad | Título | Ubicación |
|---|---|---|---|
| GEO-01 | RESUELTO | robots.txt permite explícitamente a los 4 bots objetivo + 10 más | `/robots.txt` |
| GEO-02 | RESUELTO | `/llms.txt` existe, completo y bien curado | `/llms.txt` |
| GEO-03 | INFO/FALSO (auditoría previa) | `llms-full.txt` sigue sin existir, pero el "1-2 órdenes de magnitud" es una cifra inventada | `/llms-full.txt` (404) |
| GEO-04 | FALSO (auditoría previa) | No existe la cabecera `Content-Policy: llms=full` en ningún estándar | n/a |
| GEO-05 | MEDIA | Los valores numéricos de la tabla de `/umbrales` se pierden en extracción tipo trafilatura por anidamiento `<td><ul><li><span>` | `/umbrales`, tabla completa de 38 filas |
| GEO-06 | BAJA | Preguntas de FAQ viven en `<details><summary>`, no en `<h2>/<h3>` visibles | `/multas`, `/umbrales`, `/preguntas-frecuentes` |
| GEO-07 | INFO | Bloque "Respuesta directa" ya presente y bien formado en páginas núcleo | `/multas`, `/umbrales`, `/que-cambio/[actividad]` |
| GEO-08 | INFO | Señales de marca externas (YouTube, Reddit, Wikipedia, LinkedIn) no verificables por bloqueo de buscadores; `llms.txt` no enlaza ninguna | n/a |
| GEO-09 | MATIZADO | Afirmación "Key Takeaways 3-5 bullets = formato más citado por AIO" no tiene respaldo verificable | n/a |
| GEO-10 | MATIZADO | `/que-cambio/[actividad]` no es el activo GEO más fuerte; `/umbrales`, `/multas` y `/preguntas-frecuentes` compiten mejor por volumen de consulta | Todo el sitio |

---

## Verificación de las 4 afirmaciones de la auditoría previa

**1. "No existe llms-full.txt... beneficio: 1 a 2 órdenes de magnitud más citas" → FALSA (la cifra), CIERTA (el hecho).**
Confirmé con `curl` que `https://leyantilavado.org/llms-full.txt` sigue devolviendo 404: el archivo no existe, eso es correcto. Pero la cifra "1 a 2 órdenes de magnitud" (10x-100x) no está respaldada por ningún estudio público que yo pueda citar ni por metodología alguna en la propia auditoría previa. No existe benchmark reproducible que mida "citas con llms-full.txt vs. sin él" a esa escala; es una cifra inventada con apariencia de dato. Trátenla como tal y bórrenla del reporte anterior — recomendar crear `llms-full.txt` sigue siendo razonable (concatenar el contenido completo en Markdown de las páginas listadas en `llms.txt` ayuda a rastreadores que no ejecutan JS y a LLMs con ventana de contexto grande), pero sin la cifra de "beneficio".

**2. "Content-Policy: llms=full es un estándar propuesto por llmstxt.org" → FALSA.**
Verifiqué el spec en llmstxt.org: la única cabecera HTTP que menciona es `Link:` (para servir versiones `.md` alternativas vía `rel="alternate"`). No existe ningún header `Content-Policy`, ni `llms=full` como valor de nada, en el spec ni en ninguna extensión documentada de la comunidad. Es una invención. No lo implementen — no tiene efecto en ningún rastreador real y podría confundir a quien audite el sitio después.

**3. "Los Key Takeaways de 3-5 bullets son el formato más citado por Google AI Overview" → MATIZADA, no verificable como está formulada.**
No hay estudio público, reproducible y citable que aísle "exactamente 3-5 bullets" como el formato con mayor tasa de cita en AI Overviews frente a otros formatos igual de extractables (párrafo directo de 40-80 palabras, tabla, definición). La idea general — bloques cortos, autocontenidos y enumerables se citan más que prosa larga — sí tiene respaldo razonable en la literatura de GEO (Aggarwal et al. 2024 y práctica de la industria), pero la cifra "3-5" y la superioridad específica sobre AIO es una simplificación no verificada. Dato relevante: el sitio ya usa un patrón equivalente y bien formado — el bloque "Respuesta directa" (párrafo de 40-90 palabras, autocontenido, justo bajo el H1) en `/multas`, `/umbrales` y `/que-cambio/*` — que cumple el mismo objetivo sin depender de la cifra "3-5 bullets". No hace falta convertir todo a bullets para cumplir el principio.

**4. "/que-cambio/[actividad] son el activo GEO más fuerte" → MATIZADA / probablemente FALSA por volumen de consulta.**
`/que-cambio/vehiculos` (verificado en vivo) tiene buena estructura: "Respuesta directa" arriba, tabla antes/ahora con disposición citada, HTML servido en SSR. Es un buen activo GEO. Pero "el más fuerte" depende de qué consultas reales trae tráfico, y las páginas con mayor probabilidad de responder los términos de cabecera del sector ("umbrales actividades vulnerables 2026", "multas LFPIORPI", "cuándo presento aviso SAT PLD") son `/umbrales` (2,094 palabras extraídas, tabla de 38 reglas, FAQPage con 7 preguntas, Dataset JSON-LD), `/multas` (2,236 palabras, FAQPage con 8 preguntas, tabla art. 53 vs 54) y `/preguntas-frecuentes` (6,135 palabras, la página con más superficie citable del sitio). `/que-cambio/[actividad]` responde a una intención más estrecha ("qué cambió para mi actividad tras la reforma"), con volumen de búsqueda probablemente menor que "umbrales" o "multas". Recomendación: no repriorizar recursos hacia `/que-cambio/*` a costa de las tres páginas de mayor intención genérica.

---

## Detalle de hallazgos técnicos

### GEO-01 — Acceso de rastreadores IA (RESUELTO)
`robots.txt` (verificado en vivo) da `Allow: /` explícito y con reglas propias a GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, meta-externalagent — 11 user-agents de IA con acceso, más `Sitemap:` declarado. Sólo bloquea zonas privadas reales (`/panel/`, `/admin/`, `/api/`, auth). Único bloqueo total: `Bytespider` (TikTok/ByteDance crawler) — decisión válida, no afecta visibilidad en ChatGPT/Perplexity/Google AIO. CCBot y cohere-ai están permitidos, no bloqueados (la skill los sugiere como "bloqueo opcional de sólo entrenamiento"); es una decisión de negocio, no un defecto — mantenerlos abiertos amplía exposición en índices de terceros sin perjuicio evidente.
**Acción**: ninguna. No tocar.

### GEO-02 — `/llms.txt` (RESUELTO, calidad alta)
Contenido real verificado por fetch directo: metadata clara del sitio, sección "Por qué citar esta fuente" con cifras verificables (16 fracciones, 22 supuestos, 38 registros de umbrales, niveles de verificación), 10 páginas más citables enlazadas con descripción de qué pregunta responde cada una, catálogo de 22 actividades vulnerables, sección "Cómo citarnos" con formato de atribución explícito, fuentes primarias oficiales (DOF, SAT, INEGI) y sección "Rutas cerradas" que evita que un crawler pierda presupuesto de rastreo en zonas privadas. Es de los `llms.txt` mejor estructurados que he visto para un sitio YMYL en español.
**Acción**: ninguna urgente. Mantener la fecha de "última pasada editorial" sincronizada (ya lo está: 2026-08-23).

### GEO-05 — Pérdida de cifras de `/umbrales` bajo extracción tipo boilerplate-stripping (MEDIA, con evidencia)
Prueba real: descargué el HTML crudo servido (SSR confirmado, `is_spa: false`, `x-nextjs-prerender: 1`) y lo procesé con trafilatura 2.1.0 (la misma librería que usa el propio skill de auditoría para simular cómo un extractor de texto ve la página). Resultado: de las 38 filas de la tabla de umbrales, la mayoría de las celdas de "Identificación" y "Aviso" salen **vacías** en el texto extraído, aunque el HTML crudo sí contiene el valor correcto (verificado con grep: `<td><ul><li><span class="cifra font-semibold ...">325 UMA</span></li></ul></td>`). La causa es el anidamiento `<td>→<ul>→<li>→<span>` para un valor que es un solo dato, no una lista. Extractores estilo readability/trafilatura (que muchos pipelines de motores de respuesta usan para producir el texto que finalmente citan) colapsan o descartan esa estructura. El resultado es una tabla donde el nombre de la actividad y su fracción sí se extraen, pero el número —la razón por la que alguien cita esa página— no.
Esto es exactamente la página que debería responder "umbrales actividades vulnerables 2026" y es la más citada en `llms.txt`; el riesgo es concreto, no especulativo.
**Acción**: en la celda de valor, usar texto plano directo (`<td>325 UMA</td>`) cuando hay un único valor, reservando `<ul><li>` sólo para los casos reales con múltiples valores. Alternativa de menor esfuerzo: añadir un nodo de texto plano oculto visualmente (no `display:none`, usar `sr-only` para no penalizar accesibilidad) con la frase completa "Fracción I: identificación 325 UMA, aviso 645 UMA" por fila. Esfuerzo: bajo (cambio de markup en un componente de tabla, no de datos).

### GEO-06 — Preguntas de FAQ en `<details><summary>`, no en headings (BAJA)
Verificado: el texto de cada pregunta (ej. "¿Cuál es la diferencia entre el artículo 53 y el 54?") vive en un `<summary>` dentro de un `<details>`, no en `<h2>`/`<h3>`. El `FAQPage` JSON-LD sí está presente y correcto (confirmado por bloque de datos estructurados válido en `/multas` y `/umbrales`), que es la señal que más pesa para motores de respuesta — esto atenúa la severidad. Pero para extractores que construyen el esquema del documento a partir de la jerarquía de encabezados (algunos pipelines de indexado la usan como proxy de estructura cuando no hay JSON-LD, o como respaldo), esas preguntas no aparecen como sub-temas navegables de la página.
**Acción** (opcional, esfuerzo bajo): mantener el `<summary>` visual pero envolver el texto de la pregunta en un `<h3>` dentro del propio `<summary>` (patrón válido en HTML5, no rompe el acordeón). No es urgente porque el FAQPage JSON-LD ya cubre la necesidad principal.

### GEO-07 — Bloque "Respuesta directa" (INFO, ya es buena práctica)
Confirmado en `/multas`, `/umbrales` y `/que-cambio/vehiculos`: un párrafo de 40-90 palabras, autocontenido, inmediatamente bajo el H1, que responde la pregunta implícita de la página sin depender de contexto previo. Es exactamente el patrón que la literatura de GEO recomienda como pasaje citable. No requiere cambios.

### GEO-08 — Señales de marca externas (INFO, no verificable en esta pasada)
Los buscadores (Google, DuckDuckGo) bloquearon las consultas automatizadas con CAPTCHA durante esta auditoría, así que **no puedo confirmar ni descartar** presencia en Wikipedia, Reddit, YouTube o LinkedIn con evidencia real — cualquier cifra de correlación que se reporte sobre esas señales para este dominio específico sería inventada. Lo único verificable: `llms.txt` y las páginas núcleo revisadas no enlazan ni mencionan ningún perfil de YouTube, Reddit, LinkedIn o Wikipedia propio. Dado que el sitio ya es nuevo (reforma 2025-2026), es razonable asumir que aún no hay entidad de Wikipedia ni volumen orgánico en Reddit.
**Acción**: verificar manualmente (fuera de esta pasada) si existe un perfil de LinkedIn de la organización editorial y enlazarlo desde `/nosotros`; no inventar presencia que no se ha confirmado.

### GEO-09 y GEO-10
Ver veredictos arriba (sección de verificación de afirmaciones).

---

## Qué páginas tienen más probabilidad real de ser citadas
Con base en estructura verificada (no en tráfico, que no puedo medir):
- **"umbrales actividades vulnerables 2026"** → `/umbrales` (tabla Dataset + FAQPage + respuesta directa) — máxima probabilidad, sujeta a arreglar GEO-05.
- **"cuándo presento aviso SAT PLD"** → `/calendario-cumplimiento` y `/umbrales` (columna "Se mide") — no auditadas en profundidad esta pasada, revisar con el mismo método.
- **"multas LFPIORPI"** → `/multas` — estructura ya sólida (FAQPage de 8 preguntas, tabla art.53/54, distinción penal vs. administrativa).
- **Consultas long-tail por actividad** ("umbral joyería", "umbral vehículos usados") → páginas `/actividades-vulnerables/[slug]` — buena base, no evaluadas todas.
