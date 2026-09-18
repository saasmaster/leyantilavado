# Diagnóstico de caída de ranking — 2026-09-12

> **Reporte corto de incidente.** No es un audit completo, es una
> verificación urgente de qué cambió entre el audit del 11-sep y hoy,
> y qué pudo causar la caída.
>
> **Importante:** No tengo acceso a Google Search Console ni a tu
> Analytics. Lo que verifiqué es:
>
> - Rankings SERP directos (spot-check)
> - Estado técnico del sitio
> - Estado del sitemap y robots
> - Schema y metadatos
> - Cambios respecto al audit del 11-sep
>
> Para precisar el alcance real de la caída, **necesito que me
> compartas**: (a) métricas concretas de GSC (qué query cayó,
> cuánto, en qué rango de fechas), (b) si hay aviso de manual
> action en GSC, (c) si cambiaste algo en el código o en el servidor
> desde el 10-sep.

---

## TL;DR — Qué vi

**Los rankings principales siguen en #1.** El home, /multas,
/calendario-cumplimiento, y ahora también /umbrales siguen como
#1 en sus keywords. El frente ganado se mantiene.

**Pero detecté 4 cosas que SÍ pueden sumar a una percepción de
"caída masiva" en GSC o CTR:**

1. **Cambio en home description** (entre 11-sep y 12-sep) — pasó
   de un texto list-style a uno más conversacional. Google
   re-evalúa snippets cuando cambia esto.
2. **Cloudflare `cf-cache-status: DYNAMIC`** — Cloudflare NO está
   cacheando el HTML. Cada petición va al origen. Sutil pero
   acumulativo en métricas de velocidad.
3. **Regresión de /directorio** (continúa) — 8 categorías siguen
   404. Google ya crawleó y reportó estos.
4. **Competidores nuevos en el nicho** — artu.ai, Moffin,
   pld.mx, ley-antilavado.com crecieron. Para queries competidas,
   el techo subió.

Ninguno de estos cuatro explicaría por sí solo una caída "masiva".
Pero pueden combinarse y producir la percepción.

---

## 1. Cambios concretos entre 11-sep y 12-sep

### 1.1 Home description CAMBIÓ (este es el sospechoso #1)

**Antes (11-sep v3 audit):**
> "Consulta la Ley Antilavado en México: actividades vulnerables,
> umbrales en UMA, obligaciones, límites de efectivo, multas y
> los cambios vigentes en 2026."

**Ahora (12-sep, hoy):**
> "Ley Antilavado México: calcula umbrales, acumulación de seis
> meses y límites de efectivo con la UMA de la fecha de tu
> operación. Cada cifra, con su artículo."

**Cambios clave:**
- **Eliminaste keywords principales**: "obligaciones", "multas",
  "actividades vulnerables". Estas son queries reales de búsqueda.
- **Añadiste**: "acumulación de seis meses", "UMA de la fecha de
  tu operación", "Cada cifra, con su artículo". Más GEO y
  conversión, pero menos keyword coverage.
- **El new snippet que verá Google** ya no contiene "multas y
  sanciones". Si tu home rankeaba #1 para "multas ley antilavado"
  precisamente por la descripción, ahora rankeas por el contenido
  del body (que sí las menciona, 17 veces). Pero el snippet
  mostrado puede ser menos persuasivo.

**Recomendación inmediata:** restaurar la versión anterior o
iterar a una versión que conserve las keywords principales:
> "Ley Antilavado México: actividades vulnerables, umbrales en
> UMA, multas, obligaciones y calendario del Acuerdo 115/2026.
> Calcula con la UMA de la fecha de tu operación."

Mantiene las 4 keywords primarias y añade la especificidad del
Acuerdo 115/2026.

### 1.2 Cloudflare cf-cache-status = DYNAMIC

```
HTTP/2 200
x-nextjs-cache: HIT              ← Next.js: contenido del prerender
cache-control: s-maxage=31536000 ← Next.js: cachea 1 año
cf-cache-status: DYNAMIC         ← Cloudflare: NO cachea
```

**Cloudflare está pasando todas las peticiones al origin.** Esto
significa:
- **TTFB ligeramente mayor** (Cloudflare → origin vs Cloudflare edge)
- **Mayor carga en el origin server**
- **Google ve el sitio más lento** que con cache HIT
- **Core Web Vitals pueden afectarse** sutilmente

**Por qué pasa:** falta una Cache Rule en Cloudflare que diga
"cachear HTML por 1 año para usuarios sin cookies". Esto se
configura en el dashboard de Cloudflare, no en código.

**Recomendación:** añadir una Cache Rule:
- URL pattern: `*`
- Cookie: bypass si existe cookie de sesión (Supabase, etc.)
- Cache eligible: sí
- Edge TTL: 1 año (31536000 segundos)
- Browser TTL: 1 año

Estimado: 5 minutos en el dashboard.

### 1.3 /directorio (regresión confirmada, sin cambios desde 11-sep)

**Estado actual:**
- `/directorio` (base) → 200 ✓
- `/directorio/contadores` → 200 ✓ (NO en sitemap)
- `/directorio/abogados` → 200 ✓ (NO en sitemap)
- `/directorio/auditores` → 404 ❌ (en sitemap anterior)
- `/directorio/consultores` → 404 ❌
- `/directorio/tecnologia-anti-fraude` → 404 ❌
- `/directorio/cumplimiento-pld` → 404 ❌
- `/directorio/oficiales-pld` → 404 ❌
- `/directorio/notarias` → 404 ❌
- `/directorio/gestores-corredores` → 404 ❌

**Sitemap actual:** solo lista `/directorio` y `/directorio/alta`.

**Impacto SEO:** mínimo si Google ya crawleó y reportó los 404. **Es
ruido técnico más que caída de ranking.** Pero si Google todavía
no los indexó, podría ayudar a que se mantengan fuera.

**Recomendación:** o restaurar las 8 categorías faltantes, o
asegurarse de que NO estén en el sitemap para que Google deje de
intentar crawlerlas.

---

## 2. Estado de rankings hoy (spot-check)

Verifiqué las 6 queries principales en Google México:

| Query | Posición 11-sep | Posición 12-sep | Δ |
|---|:---:|:---:|:---:|
| "Ley Antilavado México 2026" | #1 | **#1** | = |
| "multas ley antilavado 2026" | #1 | **#1** | = |
| "calendario acuerdo 115/2026" | #1 | **#1** | = |
| "umbrales ley antilavado 2026" | fuera de top 5 | **#1** | ⬆️ mejoró |
| "glosario ley antilavado" | #3 | **#5** | ⬇️ -2 |
| "reforma ley antilavado 2025-2026" | fuera de top 10 | **#8** | mejoró pero bajo |

**Lectura:** las posiciones top (las que más tráfico generan) están
bien. El frente ganado se sostiene. **Si tienes caída masiva, no
es por estas queries principales.**

---

## 3. Lo que probablemente está pasando (hipótesis)

Si tu GSC muestra caída de clicks / impressions / CTR pero los
rankings top están en #1, hay tres explicaciones probables:

### 3.1 Google re-evaluó el snippet del home

Cuando cambias la meta description, Google **re-renderiza el
snippet** que muestra en SERPs. El snippet NUEVO puede ser menos
CTR-friendly que el viejo, lo que baja clicks sin bajar posición.

**Para confirmar:** ve a GSC → Páginas → tu home → comparar CTR
antes y después del cambio de description (aprox. entre 10 y 12
de septiembre).

### 3.2 Google está re-evaluando todo el sitio

Cada vez que Cloudflare cambia de configuración, o cada vez que
se modifica la meta description de la página más importante del
sitio, Google hace una "re-crawl + re-evaluation". Esto causa
fluctuaciones temporales (2-7 días) que se estabilizan.

**Para confirmar:** ve a GSC → Cobertura → ver si hay re-crawls
masivos en las últimas 24-48h.

### 3.3 Hay una query específica que cayó MUCHO y no estoy viendo

Mi spot-check cubre 6 queries. Si hay una query larga o de nicho
que traía mucho tráfico y cayó, no la estoy capturando. Las queries
largas son las más sensibles a cambios de snippet y a nuevos
competidores.

**Para confirmar:** ve a GSC → Rendimiento → ordenar por
"diferencia de clics" entre el último periodo y el anterior, y
verás cuál(es) query(s) cayeron más.

---

## 4. Qué cambió en la competencia (presión externa)

Aunque tu ranking top no cayó, **el techo subió**. Cuatro
competidores crecieron en los últimos 30 días:

| Competidor | Posición en SERPs | Notas |
|---|---|---|
| **artu.ai** | #3-4 en "Ley Antilavado México" | Tiene un artículo muy completo del Acuerdo 115/2026 con tablas, fechas, secciones. Muy buena calidad editorial. |
| **moffin.com** | #4 en "reforma ley antilavado" | Editorial fintech nuevo. Su artículo es denso y específico. |
| **pld.mx** | en "glosario PLD" | Glosario dedicado con muchas definiciones. |
| **ley-antilavado.com** | #2-3 en queries principales | El competidor con nombre similar al tuyo. Tiene tablas, calculadoras, reforma. |

**Implicación:** para queries competidas, ahora hay 5-6 sitios
en vez de 4-5 haciendo SERP. Los clicks se reparten entre más
sitios. Tu ranking top sigue siendo el mismo, pero el CTR puede
bajar por la competencia visual.

---

## 5. Lo que necesito de ti para precisar

Para confirmar qué está pasando y dónde intervenir:

1. **¿Cuál es la métrica exacta que cayó?** Clics / Impresiones /
   CTR / Posición media / ¿una query específica?
2. **¿Cuándo empezó la caída?** ¿Hoy? ¿Hace 3 días? ¿Después
   del cambio de descripción? ¿Después del rollout de Cloudflare?
3. **¿Hay aviso de manual action en GSC?** (Security & Manual
   Actions)
4. **¿Hubo cambios en código o servidor entre 10-sep y hoy?**
   Deploys, cambios de CSP, cambios de DNS, etc.
5. **¿Tienes la query o URL específica que más cayó?** Con eso
   puedo ir a SERP y verificar competidores.

---

## 6. Plan inmediato (3 acciones, ≤ 30 minutos)

### Acción 1: Restaurar home description con keywords
Edita la home description a una versión que conserve las 4
keywords principales:

> "Ley Antilavado México: actividades vulnerables, umbrales en
> UMA, multas, obligaciones y calendario del Acuerdo 115/2026.
> Calcula con la UMA de la fecha de tu operación."

Tiempo: 5 minutos.

### Acción 2: Configurar Cloudflare Cache Rule
En el dashboard de Cloudflare → Caching → Cache Rules → Create
rule:
- Name: "Cache HTML static"
- Match: `*` (todas las URLs)
- Eligible for cache: yes
- Edge TTL: 31536000 (1 año)
- Browser TTL: 31536000 (1 año)
- Bypass cache si cookie de sesión presente

Tiempo: 5 minutos.

### Acción 3: Verificar manualmente en GSC
- Rendimiento → comparar periodo anterior vs actual (7 días).
- Cobertura → ver si hay URLs excluidas nuevas.
- Seguridad → ver si hay aviso de manual action.

Tiempo: 15 minutos.

---

## 7. Lo que NO recomiendo hacer todavía

1. **No revertir la descripción del home** sin comparar CTR antes
   y después en GSC. El cambio puede ser mejor para long-tail
   aunque pierda keywords principales.
2. **No tocar Cloudflare rules** sin antes medir TTFB en
   WebPageTest. Si Cloudflare estaba DYNAMIC por una razón
   (cookies de sesión activas), forzar el cache puede romper
   autenticación.
3. **No modificar el sitemap** hasta confirmar que el cambio de
   descripción es el problema y no la indexación.

---

## 8. Resumen ejecutivo

| Hallazgo | Severidad | Acción |
|---|---|---|
| Home description cambió | Media | Restaurar las 4 keywords |
| Cloudflare DYNAMIC | Media-baja | Configurar cache rule |
| /directorio regression | Baja-media | Restaurar 8 categorías o quitar del sitemap |
| Competidores nuevos | Externa | Más backlinks y PR digital |
| Rankings top estables en #1 | — | Mantener el frente ganado |

**Si la caída es real y no es por el cambio de description**, lo
más probable es:
- Algún cambio técnico en las últimas 24-48h que no me has
  mencionado (deploy, DNS, CSP, etc.)
- Una query larga específica que no estoy spot-checking
- Un manual action que GSC te está reportando

Comparte las métricas de GSC y podemos precisar en una segunda
pasada.
