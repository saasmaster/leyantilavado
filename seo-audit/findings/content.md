# Contenido y E-E-A-T — leyantilavado.org

Fecha: 2026-08-12 · Base: HTML crudo de 16 páginas en `seo-audit/raw/`, medición en vivo de 18
rutas y lectura de `apps/web/src/content/*.ts`.

**Puntuación: 74 / 100**

El contenido es la mejor parte del proyecto: profundo, estructurado, honesto sobre lo que no
sabe, y con una disciplina de procedencia que casi nadie tiene en este tema. Lo que baja la
nota es de empaque, no de fondo: **15 de 16 títulos se cortan en resultados de búsqueda** y
**16 de 16 descripciones exceden el largo útil**, y la firma editorial no identifica a ninguna
persona, que en contenido YMYL legal es la señal E-E-A-T que más pesa.

> **Sobre demanda de búsqueda:** este informe **no** incluye volúmenes, dificultad de palabra
> clave, tráfico ni posiciones. No hay acceso a ninguna fuente que los mida para este dominio
> —sin historial, sin Search Console, sin API de terceros— y estimarlos a ojo sería inventar
> datos. Donde se habla de "consulta objetivo" es una lectura del contenido, no un dato medido.

---

## 1. ALTA — Títulos que se cortan (15 de 16)

`construirMetadata` (`apps/web/src/lib/sitio.ts:129`) añade `" | LeyAntilavado.org"` —21
caracteres— a cada título. Con títulos ya descriptivos, el resultado se pasa del ancho que
Google muestra (~60 caracteres visibles en escritorio).

| Página | Actual | Largo | Propuesta (con sufijo, ≤60) |
|---|---|---|---|
| `/umbrales` | Umbrales de la Ley Antilavado: tabla completa en UMA y pesos (2016-2026) \| LeyAntilavado.org | **92** | `Umbrales de la Ley Antilavado en UMA y pesos \| LeyAntilavado.org` → mejor aún: acortar el sufijo (ver abajo) y dejar `Umbrales de la Ley Antilavado 2026: tabla en UMA y pesos` |
| `/limites-efectivo` | Límites de efectivo del art. 32: los ocho supuestos, con IVA incluido \| … | **89** | `Límites de efectivo art. 32: los 8 supuestos con IVA` |
| `/` | LeyAntilavado.org — Centro independiente de información y herramientas sobre la LFPIORPI | **88** | `Ley Antilavado México: umbrales, plazos y calculadoras` |
| `/actividades-vulnerables` | Actividades vulnerables del art. 17: las 16 fracciones explicadas \| … | **85** | `Actividades vulnerables art. 17: las 16 fracciones` |
| `/multas` | Multas de la Ley Antilavado: art. 53 y art. 54 no son lo mismo \| … | **82** | `Multas de la Ley Antilavado: art. 53 y 54 explicados` |
| `/reforma-ley-antilavado-2026` | La reforma a la Ley Antilavado 2025-2026: qué cambió de verdad \| … | **82** | `Reforma Ley Antilavado 2026: qué cambió de verdad` |
| `/directorio` | Directorio de profesionales en prevención de lavado de dinero \| … | **81** | `Directorio de profesionales PLD en México` |
| `/obligaciones` | Las 19 obligaciones de la Ley Antilavado, con su evidencia \| … | **78** | `Las 19 obligaciones de la Ley Antilavado` |
| `/glosario` | Glosario de la Ley Antilavado: 51 términos explicados \| … | **73** | `Glosario de la Ley Antilavado: 51 términos` |
| `/acuerdo-115-2026` | Acuerdo 115/2026: qué es y qué te obliga a hacer \| … | **68** | `Acuerdo 115/2026: qué es y qué te obliga` |
| `/preguntas-frecuentes` | Preguntas frecuentes sobre la Ley Antilavado \| … | **64** | ya casi; `Preguntas frecuentes de la Ley Antilavado` |
| `/calendario-cumplimiento` | Calendario de cumplimiento 2026-2029 \| … | 56 | ok |
| `/herramientas` | Herramientas de la Ley Antilavado \| … | 53 | ok |
| `/metodologia-editorial` | Metodología editorial \| … | 41 | ok |
| `/fuentes-oficiales` | Fuentes oficiales \| … | 37 | ok |
| `/nosotros` | Quiénes somos \| … | 33 | ok |

**Arreglo estructural, más barato que reescribir 16 títulos:** cambiar el sufijo de
`" | LeyAntilavado.org"` (21 car.) a `" · LeyAntilavado"` (16 car.) recupera 5 caracteres en
todas las páginas de un solo cambio. Con eso, tres de los quince salen del rojo sin tocar el
texto. El resto sí necesita título más corto.

Ojo: los títulos actuales son **buenos** —tienen ángulo, no son listas de palabras clave—. El
problema es sólo de largo. No los aplanes al acortarlos.

## 2. MEDIA — Descripciones demasiado largas (16 de 16)

Ninguna descripción baja de 141 caracteres y once pasan de 195; el máximo es 266
(`/obligaciones`). Google corta alrededor de 155-160 en escritorio y menos en móvil, así que la
última frase de cada una se pierde.

| Página | Largo actual |
|---|---|
| `/obligaciones` | 266 |
| `/herramientas` | 250 |
| `/reforma-ley-antilavado-2026` | 249 |
| `/calendario-cumplimiento` | 234 |
| `/multas` | 222 |
| `/acuerdo-115-2026`, `/limites-efectivo` | 217 |
| `/metodologia-editorial`, `/preguntas-frecuentes` | 205 |
| `/` | 201 |
| `/glosario` | 196 |
| `/directorio` | 190 |
| `/umbrales` | 179 |
| `/actividades-vulnerables` | 175 |
| `/nosotros` | 145 |
| `/fuentes-oficiales` | 141 |

Regla práctica: poner el diferenciador en los primeros 120 caracteres (para este sitio: "con
la UMA vigente en la fecha de tu operación" y "fuente oficial citada") y dejar el resto como
cola prescindible. Muchas ya lo hacen; unas cuantas entierran el gancho al final.

## 3. ALTA — E-E-A-T: no hay una persona detrás del contenido

`apps/web/src/content/autores.ts:14-31` define un único autor:

```ts
export const EQUIPO_EDITORIAL: Autor = {
  nombre: 'Equipo editorial de LeyAntilavado.org',
  rol: 'Investigación normativa y redacción',
  credenciales: [],          // ← vacío
  ...
};
```

`FIRMA_POR_DEFECTO` no trae `revisor`. El JSON-LD refleja fielmente esa realidad:
`author` siempre es un `Organization`, nunca un `Person`, y no hay campo de revisor.

**Lo que está bien y hay que decirlo:** el comentario del archivo explica que se prefirió no
inventar un autor con credenciales que no se pueden acreditar. Esa decisión es la correcta —
un autor ficticio con "Lic. en Derecho Fiscal" sería exactamente el tipo de señal falsa que
Google castiga en YMYL. La metodología publicada (seis puntos, verificables) y las siete
fuentes primarias trazadas por regla son señales de *Trustworthiness* genuinas y poco comunes.

**Lo que falta y sí pesa:** en contenido legal-financiero, la dimensión *Experience* y
*Expertise* la sostiene una persona identificable. Hoy no hay ninguna. Competir contra
despachos que firman con nombre, cédula profesional y años de práctica, desde una firma
colectiva anónima, es una desventaja estructural que ninguna optimización técnica compensa.

**Recomendación concreta, en orden de costo:**
1. Nombrar al responsable editorial real del proyecto, con su trayectoria verificable, aunque
   no sea abogado. "X, que lleva N años construyendo herramientas de cumplimiento y no ejerce
   como abogado" es una credencial honesta y mucho más fuerte que el anonimato.
2. Sumar un **revisor** con cédula profesional que valide las páginas de mayor riesgo
   (`/umbrales`, `/multas`, `/limites-efectivo`, `/obligaciones`). El tipo `Autor` y el campo
   `revisor` de `FirmaContenido` ya existen: es dato, no código.
3. Exponerlo en el JSON-LD (`author` como `Person`, más `reviewedBy`) una vez que exista.

## 4. MEDIA — Dos páginas publicadas sin contenido que ofrecer

Palabras dentro de `<main>` (sin encabezado ni pie):

| Página | Palabras en `<main>` |
|---|---|
| `/herramientas/preparacion-auditoria` | 3 577 |
| `/multas` | ~2 700 |
| `/umbrales` | ~2 500 |
| `/herramientas/plan-cumplimiento` | 2 305 |
| … | … |
| **`/plantillas`** | **259** |
| **`/cursos`** | **242** |

`/cursos` y `/plantillas` son **estados vacíos honestos**, exactamente como pide la regla 8 del
contrato: explican qué va a haber, por qué todavía no está y ofrecen aviso cuando abra. No son
contenido basura y no merecen reproche editorial.

Pero **están en el sitemap con prioridad 0.6**, es decir, se está pidiendo activamente que se
indexen dos páginas que no pueden satisfacer ninguna consulta. Lo coherente es dejarlas
accesibles y enlazadas, pero fuera del sitemap (o con `noindex`) hasta que tengan catálogo.
Ganan poco y diluyen la señal de calidad media del sitio.

Ninguna otra página baja de 400 palabras útiles. No hay contenido delgado real más allá de
estas dos.

## 5. Estructura de encabezados — impecable

16 de 16 páginas: exactamente un `<h1>`, cero saltos de nivel (nunca un `h3` sin `h2` previo).
`/multas` llega a 11 `h2`, `/glosario` a 19, `/actividades-vulnerables` a 22 `h3`. La jerarquía
es real, no decorativa: las secciones llevan `id` y hay índice de contenidos con anclas
(`IndiceContenidos` en `Articulo.tsx`).

No hay nada que corregir aquí. Es de lo mejor del sitio.

## 6. ALTA — Enlazado interno: el menú no existe para un rastreador

Detalle completo y evidencia en `findings/technical.md`, hallazgo 2. Resumen desde la
perspectiva de contenido:

- **Cero páginas huérfanas** de las 93 del sitemap: el cuerpo de los artículos enlaza de forma
  cruzada y el pie se renderiza en servidor.
- Pero `/herramientas` (índice de las 17 calculadoras, el activo diferencial del proyecto)
  recibe **un solo enlace** en toda la muestra de 16 páginas, y `/preguntas-frecuentes`
  también. Ambas viven en desplegables del encabezado, que es `'use client'` y no monta esos
  enlaces en el HTML.
- Las páginas de dinero sí están bien enlazadas desde el cuerpo: `/umbrales` 28,
  `/calendario-cumplimiento` 28, `/multas` 25, `/actividades-vulnerables` 23.

El bloque `EnlacesRelacionados` al pie de cada artículo funciona bien y es la razón de que no
haya huérfanas. La falla está concentrada en el encabezado.

## 7. Oportunidades de contenido (lectura del corpus, sin datos de demanda)

Huecos que se ven al comparar lo que el sitio explica contra lo que un obligado necesita
resolver. **Sin volumen medido** — son hipótesis de utilidad, ordenadas por lo cerca que están
de lo que el motor ya calcula:

1. **Una página por umbral en pesos y por año.** El motor ya convierte UMA→pesos con la UMA de
   cada año. Hoy eso vive dentro de un selector en `/umbrales`; la consulta natural
   ("cuánto son 1 605 UMA en 2024") no tiene una URL propia que responderla.
2. **Página por estado para el directorio.** `/directorio/[categoria]` existe; falta el corte
   geográfico, que es como se busca a un contador.
3. **"Aviso de 24 horas"** — el glosario lo define y las obligaciones lo mencionan, pero no hay
   una página que lo explique de punta a punta, siendo uno de los puntos que más se malentiende.
4. **Comparativa "actividad vulnerable vs. entidad financiera"**, la confusión más común entre
   quienes llegan al tema por primera vez.
5. **Casos resueltos por actividad** (`EjemploResuelto` ya es un componente existente): "una
   inmobiliaria vende en 4.2 M, ¿da aviso?" resuelto paso a paso, con la cifra saliendo del
   motor. Es el formato con más probabilidad de ser citado por un asistente de IA.

## 8. Sin verificar

- **Legibilidad medida (Fernández-Huerta / Szigriszt-Pazos).** No se calculó: los índices de
  legibilidad en español requieren separación silábica y aplicarlos a texto con citas legales
  literales da lecturas engañosas. Impresión cualitativa: el tono es directo, con tuteo, frases
  cortas y sin jerga innecesaria — lo que pide el contrato.
- **Contenido duplicado entre páginas.** No se hizo comparación de similitud n-grama sobre las
  93 URL. El único duplicado detectado es una pregunta idéntica en dos `FAQPage`
  (`/umbrales` y `/preguntas-frecuentes`, ver `findings/schema.md` §4.2).
- **Las 22 páginas de actividad y las 19 de obligación individualmente.** Se auditaron las 16
  páginas guardadas; las de detalle se revisaron por su fuente de datos, no una por una.
- **Cualquier métrica de demanda de búsqueda.** Ver la advertencia del encabezado.
