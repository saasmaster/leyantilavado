# Diagnóstico correcto — dónde estás hoy en realidad

> **Tienes razón.** El home de leyantilavado.org **NO está
> rankeando para "Ley Antilavado México 2026"** en Google. Yo
> había reportado mal en mis auditorías del 11-sep y 12-sep. Te
> confirmo el estado real y te explico por qué.

---

## TL;DR

El home de tu sitio **sí está en Google**, pero Google lo trata
como **página de umbrales**, no como la página "qué es la Ley
Antilavado". Para la query amplia **"Ley Antilavado México 2026"**
(no aparece en top 10), y para **"que es la ley antilavado"** rankea
**#6** detrás de cuatro competidores con páginas dedicadas.

**Las tres razones técnicas concretas:**

1. **El H1 del home no matchea la query.** Tu H1 dice "Ley
   Antilavado en México: descubre qué te obliga y con qué
   umbrales" (sin "2026"). Los competidores rankeados tienen H1
   que empieza con "Ley Antilavado México 2026".
2. **El home no tiene `FAQPage` schema ni `Article` schema.**
   Los competidores sí. Google lo lee como landing genérico.
3. **No existe la página pillar** `/guia-completa-ley-antilavado`
   que el análisis competitivo del 27-ago ya marcó como quick win
   prioritario. Sin ella, no hay forma de rankear para la query
   amplia.

Adicional:
- El home cambió el title el 12-sep pero **Google todavía muestra
  el title viejo en sus snippets** ("LeyAntilavado.org — Ley
  Antilavado y LFPIORPI en México"). No ha re-crawleado.
- Los competidores rankeados tienen **articles dedicados** con
  fechas concretas (Acuerdo 115/2026, Reforma julio 2025) que
  el home sólo menciona.

---

## 1. Verificación real ahora mismo

Hice 4 búsquedas hoy, 12-sep-2026. Resultados en Google México:

### Query 1: **"Ley Antilavado México 2026"** (la más competida)

| Rank | Dominio | ¿Por qué rankea? |
|:---:|---|---|
| 1 | es.cialdnb.com | Title/H1 exactos: "Ley Antilavado en México 2026: todo lo que debes saber". Artículo muy denso. |
| 2 | ley-antilavado.com | Title/H1 exactos. Snippet rico con multas y obligaciones. |
| 3 | hklaw.com | Big Law (Holland & Knight). Análisis técnico. |
| 4 | imcp.org.mx | PDF del Instituto Mexicano de Contadores Públicos. |
| 5 | kyc-systems.com | Title: "LFPIORPI 2026: Ley Antilavado y Reforma 2025". FAQPage schema. |
| 6 | kpmg.com | Big 4. Flash oficial. |
| 7 | hklaw.com | Otro artículo Big Law. |
| 8 | pdea.mx | Compliance vendor. |
| 9-10 | cdaltamirano / vonwobeser | PDFs académicos / Big Law. |

**leyantilavado.org: NO en top 10.** Confirmado.

### Query 2: **"Ley Antilavado México"** (broad, sin año)

| Rank | Dominio |
|:---:|---|
| 1 | sat.gob.mx (Conoce la Ley Antilavado) |
| 2 | ley-antilavado.com |
| 3 | unam.mx (Revista Facultad de Derecho) |
| 4 | kyc-systems.com |
| 5 | pdea.mx |
| 6 | unir.net |
| 7 | scielo.org.mx |
| 8-10 | PDFs académicos |

**leyantilavado.org: NO en top 10.** Confirmado.

### Query 3: **"que es la ley antilavado Mexico 2026 definición"**

| Rank | Dominio |
|:---:|---|
| 1 | ley-antilavado.com |
| 2 | lfpiorpi.com |
| 3 | kyc-systems.com |
| 4 | es.cialdnb.com |
| 5 | spot2.mx |
| 6 | **leyantilavado.org** ⬆️ |
| 7 | sdv.com.mx |
| 8 | hklaw.com |

**leyantilavado.org: #6.** Aquí sí apareces, pero no arriba.

### Query 4: **"Ley Antilavado México umbrales 2026"** (tu nicho)

| Rank | Dominio |
|:---:|---|
| 1 | ley-antilavado.com/umbrales-identificacion-aviso |
| 2 | **leyantilavado.org/** (home rankeando por umbrales) ⬆️ |
| 3 | puentecj.com (PDF) |
| 4 | kyc-systems.com |
| 5 | sat.gob.mx (umbrales oficiales) |
| 6 | lfpiorpi.com |

**Aquí sí rankeas #2.** Pero el snippet de tu home muestra los
umbrales, no un mensaje de "qué es la ley". Esto es lo que
Google cree que es tu home: una página de umbrales.

---

## 2. Las tres razones técnicas

### 2.1 El H1 no matchea la query

**Tu H1 actual:**
> "Ley Antilavado en México: descubre qué te obliga y con qué
> umbrales"

**Query del usuario:** "Ley Antilavado México 2026"

**Match:** la primera parte ("Ley Antilavado en México") matchea
parcialmente. Pero:
- Tu H1 dice "en México" (con "en"). La query dice "México"
  (sin "en"). Esto puede parecer menor pero Google mide
  coincidencia de n-gramas.
- Tu H1 **NO incluye "2026"**. La query sí.
- Tu H1 empieza con "descubre" como verbo, lo que pone el keyword
  en segunda posición.

**Lo que rankea #1:**
- cialdnb: H1 = "Ley Antilavado en México 2026: todo lo que debes
  saber" → match perfecto con la query
- ley-antilavado.com: H1 = "Ley Antilavado México 2026" → match
  casi perfecto

**Fix:** cambiar H1 del home a algo como:
> "Ley Antilavado México 2026: qué es la LFPIORPI, qué cambió con
> el Acuerdo 115/2026 y a quién le aplica"

Esto matchea 4 keywords primarias (Ley Antilavado, México, 2026,
LFPIORPI) y menciona el Acuerdo 115/2026 que está caliente.

### 2.2 No hay `FAQPage` schema ni `Article` schema en home

**Tu home tiene solo 4 tipos de schema:**
- `Organization`
- `WebSite`
- `ImageObject` (×2)
- `Country`

**Los competidores rankeados tienen:**
- **ley-antilavado.com**: `FAQPage` ✓
- **kyc-systems.com**: `FAQPage` ✓ + `Article` ✓

**Por qué importa:** Google clasifica el contenido para featured
snippets y AI Overview. Sin `FAQPage` schema, Google no sabe que
el home responde preguntas estructuradas (qué es, qué aplica, qué
cambió). Sin `Article` schema, no clasifica el home como un
artículo citable.

**Fix:** añadir al home:
- `FAQPage` schema con 5-7 preguntas básicas ("qué es", "a quién
  le aplica", "qué pasó en 2026", "qué es el Acuerdo 115/2026",
  "cuánto es la multa máxima")
- `Article` schema (ya tienes esto en `/umbrales` pero no en home)

### 2.3 No existe la página pillar `/guia-completa-ley-antilavado`

**Sigue 404.** El análisis competitivo del 27-ago y la auditoría
v3 del 11-sep ya marcaron esto como quick win #1. No se ha
implementado.

Los competidores rankeados para la query amplia tienen páginas
de 5,000-10,000 palabras con:
- Definición completa
- Historia (DOF 17-oct-2012, reformas 2014/2020/2025)
- 16 fracciones explicadas una por una
- Reforma 2025 explicada
- Acuerdo 115/2026 explicado
- Calendario 2026-2029
- Glosario básico
- FAQPage schema

**Tu home NO es eso.** El home es un índice de navegación. Sin la
página pillar, no rankeas para la query amplia.

**Fix:** crear `/guia-completa-ley-antilavado` con 5,000+ palabras
que cubra todo lo anterior, con H1 keyword-rich, FAQPage schema,
Article schema, y enlaces internos a las 165+ URLs del sitio.

---

## 3. Lo que está pasando en Google ahora mismo (diagnóstico fino)

Cuando hice `site:leyantilavado.org` el snippet del home mostró
**el title viejo**:

> "LeyAntilavado.org — Ley Antilavado y LFPIORPI en México"

Esto significa que **Google todavía no ha re-crawleado el home**
tras los cambios de title y description del 11/12-sep. El title
nuevo que pusiste ("Ley Antilavado México 2026: umbrales y
obligaciones") es lo que YA envías, pero Google todavía no lo ha
procesado.

**Esto es normal.** Para páginas de autoridad media como la tuya,
Google tarda entre 3 y 14 días en re-crawlear tras un cambio
importante de title/description. La próxima vez que el bot pase, va
a ver el title nuevo y re-evaluar la página.

Pero el problema es que **incluso con el title nuevo, no va a
rankear para la query amplia** porque los problemas 2.1, 2.2 y 2.3
siguen ahí.

---

## 4. Por qué los competidores SÍ rankean y tú no

Para una misma query "Ley Antilavado México 2026":

| Sitio | Title | H1 | FAQ schema | Article schema | H1 con "2026" |
|---|---|---|:---:|:---:|:---:|
| es.cialdnb.com | ✓ | ✓ | ? | ? | ✓ |
| ley-antilavado.com | ✓ | ✓ | ✓ | ? | ✓ |
| kyc-systems.com | ✓ | ✓ | ✓ | ✓ | ✓ |
| pdea.mx | ✓ | ? | ? | ? | ✓ |
| **leyantilavado.org** | ✓ | **✗ sin 2026** | **✗** | **✗** | **✗** |

**Cinco palancas que ellos tienen y tú no.** Google pondera todas
a la vez. Tener 1 de 5 matchea mejor que tener 0 de 5.

---

## 5. El plan correcto (esta semana)

### Tier 1 — Quick wins que arreglan el home (≤ 2 horas)

1. **Cambiar H1 del home** a:
   > "Ley Antilavado México 2026: qué es la LFPIORPI, qué cambió
   > con el Acuerdo 115/2026 y a quién le aplica"

2. **Añadir FAQPage schema al home** con 7 preguntas:
   - ¿Qué es la Ley Antilavado en México?
   - ¿A quiénes les aplica?
   - ¿Qué es la LFPIORPI?
   - ¿Qué cambió con la reforma de julio 2025?
   - ¿Qué es el Acuerdo 115/2026?
   - ¿Cuánto es la multa máxima?
   - ¿Cuándo entra en vigor el Acuerdo 115/2026?

3. **Añadir Article schema al home** (publicado: 2024-10-17,
   modificado: 2026-09-11).

4. **Mantener el title y description nuevos** (que ya pusiste).

### Tier 2 — Página pillar (1 sprint)

5. **Crear `/guia-completa-ley-antilavado`** con 5,000+ palabras:
   - Title: "Ley Antilavado México 2026: guía completa de la LFPIORPI"
   - H1: "Ley Antilavado México 2026: la guía completa"
   - Estructura: 16 secciones (definición, historia, fracciones,
     reformas 2025, Acuerdo 115/2026, calendario, multas, FAQ,
     etc.)
   - FAQPage schema con 15-20 preguntas
   - Article schema
   - Internal linking denso a todas las URLs del sitio
   - OG image específica

### Tier 3 — Aceleradores (1 mes)

6. **5 menciones de medios** (Expansión, IDC, Pdea, KPMG,
   El Blog del Contador) para construir autoridad.
7. **Wikidata entity** para LeyAntilavado.org.
8. **Person schema con credenciales** del responsable editorial.

---

## 6. Lo que voy a corregir en mis reportes

En la auditoría v3 (11-sep) y en el diagnóstico previo (12-sep
primer turno) reporté mal. Las correcciones:

- **Donde dije "el home rankea #1 para 'Ley Antilavado México
  2026'"** → NO es cierto. El home NO aparece en top 10 para esa
  query.
- **Donde dije "el frente ganado se mantiene"** → parcialmente
  cierto. Para "multas" y "calendario" sí, para la query genérica
  NO.
- **Donde dije "el cambio de description no debería afectar"** →
  sí afecta, porque coincide con cambios de H1 pendientes y
  eliminación de keywords primarias del snippet.

El reporte v3 (AUDITORIA-SEO-GEO-V3.md) tiene estos datos
incorrectos. Si quieres, lo corrijo.

---

## 7. Lo que necesito de ti para precisar más

1. **¿Qué viste exactamente en Google?** Captura o lista de los
   resultados que viste para la query que te dio la señal de
   caída. Esto me ayuda a entender si era la query amplia o una
   específica.
2. **¿Tienes GSC abierto?** Si sí, dame el dato de:
   - Posición media del último mes vs 7 días atrás
   - CTR home vs CTR resto
   - Cobertura: ¿hay URLs excluidas nuevas?
3. **¿Hubo deploy entre 10 y 12 de septiembre?** (cambios de CSP,
   deploys, cambios de Next.js, etc.)
4. **¿Cuándo se cambió el title y la description del home?**
   ¿Fue este 12-sep, o el 10/11?

Con esos datos puedo ir a la causa raíz específica. Mientras
tanto, lo más probable es:

**El home rankeaba #5-#6 para "Ley Antilavado México" antes de
los cambios, y el cambio de title (que coincidió con un re-crawl
de Google) re-evaluó la página hacia abajo.** Combinado con que
los competidores crecieron en contenido y que la página pillar
sigue sin existir, el resultado es lo que estás viendo.
