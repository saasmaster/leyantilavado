# Plan de acción SEO + GEO — LeyAntilavado.org

Fecha: 12 de agosto de 2026 · Puntuación de salida: **72/100** estructural, **0 de visibilidad
real** mientras `robots.txt` responda `Disallow: /`.

Prioridad: **Crítico** bloquea la indexación · **Alta** cuesta posiciones o citas ·
**Media** es optimización con retorno claro · **Baja** es pendiente de fondo de cajón.

---

## Ya hecho en esta pasada

Archivos creados o mejorados, todos dentro del alcance asignado:

| Archivo | Qué cambió |
|---|---|
| `apps/web/src/app/llms.txt/route.ts` | **Nuevo.** Sirve `/llms.txt` estático, generado en el build |
| `apps/web/src/lib/seo/llms.ts` | **Nuevo.** Construye el `llms.txt` desde el motor de reglas y `NAVEGACION`. Ninguna cifra escrita a mano: los conteos (36 reglas de umbral, 20 actividades publicables, 19 obligaciones, 9 fechas del calendario, 11 años de UMA) se cuentan sobre los datos en tiempo de construcción |
| `apps/web/src/lib/seo/llms.test.ts` | **Nuevo.** 5 pruebas: forma llmstxt.org, URL absolutas, conteos derivados del motor (y que las actividades **no** publicables no se filtren), prohibición de afirmar cumplimiento (regla 3 del contrato), declaración de independencia |
| `apps/web/src/lib/seo/rastreadores-ia.ts` | **Nuevo.** Catálogo de 14 rastreadores de IA con su operador y propósito, más la lista de bloqueados, con el porqué de la política escrito |
| `apps/web/src/app/opengraph-image.tsx` | **Nuevo.** Imagen 1200×630 generada en el build, con los colores de marca. Por convención de Next la heredan las 93 rutas |
| `apps/web/src/app/twitter-image.tsx` | **Nuevo.** Reexporta la de Open Graph: un solo diseño que mantener |
| `apps/web/src/app/robots.ts` | **Mejorado.** Lista de rutas privadas corregida (`/app/` y `/resultado/` no existían; `/panel/*` y `/actualizar-contrasena` quedaban abiertas) + entrada propia para los 14 rastreadores de IA + `Bytespider` bloqueado |
| `apps/web/src/app/sitemap.ts` | **Mejorado.** `lastModified` sale de `procedencia.ultimaRevision` de cada dato en vez de `new Date()` para las 93 URL. Añadido `/directorio/alta` |
| `seo-audit/**` | Este informe y los 5 archivos de hallazgos |

**Verificación:** `npx tsc --noEmit` sin errores · `npx eslint` sobre los 7 archivos sin
advertencias · `npx vitest run` 27/27 en verde (22 previas + 5 nuevas) · rutas comprobadas en
servidor de desarrollo: `/llms.txt` 200 (11 343 B), `/opengraph-image` 200 `image/png`
(113 112 B), `/twitter-image` 200, `/robots.txt` con las 16 reglas, `/sitemap.xml` con 94 URL.
**No se corrió `next build`**, por instrucción.

---

## Para el hilo principal

Cambios que esta pasada identificó pero **no** podía aplicar, porque tocan archivos reservados.
Ordenados por impacto. Cada uno lleva la ruta exacta y el cambio propuesto.

### 1. `apps/web/src/lib/sitio.ts` línea 26 — **Crítico, es el bloqueante de todo**

```ts
// Actual — el acceso con corchetes derrota la sustitución estática de Next
indexable: process.env['NEXT_PUBLIC_SITE_INDEXABLE'] !== 'false',

// Propuesto
indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE !== 'false',
```

Next sólo sustituye en el bundle las lecturas escritas con **punto**. Con corchetes queda una
lectura en tiempo de ejecución, y por eso hoy las 15 páginas prerenderizadas dicen `noindex`
mientras `/directorio` (dinámica) dice `index`. En un bundle de cliente el valor sería
`undefined`, y `undefined !== 'false'` da `true`: el error pasaría silencioso.

**Además, y es la mitad del arreglo:** `NEXT_PUBLIC_SITE_INDEXABLE` y `NEXT_PUBLIC_SITE_URL`
tienen que estar presentes **en el paso de build** del panel de despliegue, no sólo al arrancar.
Comprobación después de desplegar: `curl -sS https://leyantilavado.org/robots.txt` debe traer
`Allow: /` y las 16 reglas.

### 2. `apps/web/src/components/Encabezado.tsx` — **Alta**

El mega-menú se monta desde estado (`menuActivo`), así que sus enlaces no existen en el HTML
del servidor. Resultado medido: `/herramientas` y `/preguntas-frecuentes` reciben **un solo
enlace entrante** en toda la muestra de 16 páginas, frente a 25-28 de las páginas de dinero.

**Cambio propuesto:** renderizar siempre el `<ul>` de cada grupo de `NAVEGACION` y que el estado
controle sólo la visibilidad (`hidden` / altura / `aria-expanded`), en lugar de montar y
desmontar. El componente puede seguir siendo `'use client'`.

**Alternativa más barata si no se quiere tocar el encabezado:** un bloque de mapa del sitio en
`apps/web/src/components/PieDePagina.tsx`, que sí se renderiza en servidor. Ya existe
`components/inicio/MapaDelSitio.tsx` — quizá se pueda reutilizar.

### 3. `apps/web/src/components/contenido/JsonLd.tsx` — **Alta**

`jsonLdArticulo` no emite `image`, que Google pide para resultados enriquecidos de `Article`.
Ahora que existe la imagen de Open Graph hay una URL real que usar:

```ts
image: [`${SITIO.url}/opengraph-image`],
mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITIO.url}${ruta}` },
'@id': `${SITIO.url}${ruta}#article`,
isPartOf: { '@type': 'WebSite', '@id': `${SITIO.url}#website` },
publisher: {
  '@type': 'Organization',
  name: SITIO.nombre,
  url: SITIO.url,
  logo: { '@type': 'ImageObject', url: `${SITIO.url}/icon.png` },
},
```

Y cuando exista un revisor con nombre real (ver punto 6), añadir `reviewedBy`. El tipo `Autor` y
el campo `revisor` de `FirmaContenido` ya lo soportan: es dato, no código.

Snippet completo y validado en `findings/schema.md` §3.4.

### 4. `apps/web/src/lib/sitio.ts` — `jsonLdOrganizacion` — **Media**

Falta `logo`, que Google usa para el panel de conocimiento. `icon.png` ya existe en
`apps/web/src/app/`:

```ts
logo: { '@type': 'ImageObject', url: `${SITIO.url}/icon.png` },
```

**No añadir `sameAs`, `contactPoint`, `address` ni `foundingDate` hasta que existan de verdad.**
Perfiles sociales inventados en `sameAs` son una señal falsa fácil de detectar, justo lo que este
proyecto ha evitado en todo lo demás. Si hay cuentas reales de LinkedIn o X, ahí sí van.

### 5. `apps/web/src/lib/sitio.ts` — `construirMetadata` línea 129 — **Media**

```ts
// Actual: el sufijo cuesta 21 caracteres en las 16 páginas
const tituloCompleto = ruta === '/' ? `${SITIO.nombre} — ${SITIO.subtitulo}` : `${titulo} | ${SITIO.nombre}`;

// Propuesto: 16 caracteres
const tituloCompleto = ruta === '/' ? `${SITIO.nombre} — ${SITIO.subtitulo}` : `${titulo} · LeyAntilavado`;
```

Un cambio, 16 páginas mejoradas, tres salen del rojo sin tocar su texto. Los títulos que
seguirán largos (`/umbrales` 92, `/limites-efectivo` 89, `/` 88) necesitan reescritura; hay una
tabla con propuesta para cada uno en `findings/content.md` §1.

Mismo archivo: **16 de 16 descripciones** pasan del largo útil (máx. 266 en `/obligaciones`).
Tabla completa en `findings/content.md` §2. Regla práctica: el diferenciador —"con la UMA vigente
en la fecha de tu operación", "fuente oficial citada"— en los primeros 120 caracteres.

### 6. `apps/web/src/content/autores.ts` — **Alta, pero es decisión de producto**

`EQUIPO_EDITORIAL` tiene `credenciales: []` y `FIRMA_POR_DEFECTO` no trae `revisor`. En contenido
YMYL legal, la autoría por persona identificable es la señal E-E-A-T que más pesa, y competir
contra despachos que firman con nombre y cédula desde una firma colectiva anónima es una
desventaja que ninguna optimización técnica compensa.

**No es un bug**: el comentario del archivo explica que se prefirió no inventar credenciales, y
esa decisión es la correcta. Es una decisión pendiente, en orden de costo:

1. Nombrar al responsable editorial real con trayectoria verificable, aunque no sea abogado.
   "X, que lleva N años construyendo herramientas de cumplimiento y no ejerce como abogado" es
   una credencial honesta y mucho más fuerte que el anonimato.
2. Sumar un revisor con cédula profesional para `/umbrales`, `/multas`, `/limites-efectivo` y
   `/obligaciones`.
3. Exponerlo en JSON-LD (punto 3).

### 7. Reescritura de 5 pasajes que no se citan solos — **Media** (GEO)

Cada uno con texto actual y propuesta literal en `findings/geo.md` §1.3:

| Archivo | Problema |
|---|---|
| `apps/web/src/app/actualizaciones/page.tsx:75` | Empieza con "Aquí queda registrado…" — el deíctico es la primera palabra |
| `apps/web/src/content/actividades.ts:1105` (`fe-publica-servidores-publicos`) | "…por eso esta página existe" sin nombrar qué página |
| `apps/web/src/app/glosario/page.tsx:75` | "el vocabulario de esta materia", "este glosario" sin nombrar la LFPIORPI |
| `apps/web/src/app/umbrales/page.tsx:123` | "esta tabla" sin antecedente |
| `apps/web/src/app/obligaciones/page.tsx:72` | "este catálogo" sin antecedente |

Regla: la "Respuesta directa" tiene que nombrar la ley, el artículo y el sujeto en su propia
primera frase, porque va a ser leída sin nada alrededor.

### 8. Añadir "Respuesta directa" a 7 páginas que no la tienen — **Media** (GEO)

`home`, `herramientas`, `directorio`, `nosotros`, `metodologia-editorial`, `fuentes-oficiales`,
`preguntas-frecuentes` no usan `CabeceraArticulo`. Empezar por **`/fuentes-oficiales`** y
**`/metodologia-editorial`**: son las páginas que un asistente consultaría al preguntarse "¿esta
fuente es confiable?", y hoy no tienen una frase extraíble que lo responda.

### 9. `apps/web/middleware.ts` línea 15 — **Baja**

El `matcher` excluye `robots.txt`, `sitemap.xml`, `manifest.webmanifest` y extensiones estáticas,
pero **no** `/llms.txt`, `/opengraph-image` ni `/twitter-image` (ninguna termina en una extensión
de la lista). Cada petición de un rastreador a esas rutas dispara una validación de sesión contra
Supabase que no sirve para nada. No rompe nada —las tres responden 200— pero es latencia y cuota
regaladas. Añadir `llms\.txt|opengraph-image|twitter-image` a la exclusión.

### 10. `apps/web/src/app/umbrales/page.tsx` y `limites-efectivo/page.tsx` — **Baja**

Enriquecer el `Dataset` que ya existe con `variableMeasured`, `temporalCoverage`,
`spatialCoverage` (México) y `keywords`. Es el marcado que convierte la tabla en algo citable
como fuente de datos, que es exactamente el diferenciador del proyecto. Snippet listo en
`findings/schema.md` §6. **No inventar `license` ni `distribution`** hasta que exista un CSV o
JSON publicado de verdad.

### 11. `.env.example` líneas 19-22 — **Baja**

Dos comentarios contradictorios, uno encima del otro: el viejo dice «Mientras sea distinto de
"true", TODAS las páginas salen con noindex» y el nuevo dice «Indexable por omisión». Quien
despliegue leyendo el primero configurará mal — que es más o menos lo que pasó. Borrar el bloque
obsoleto.

### 12. `CONTRATO.md` línea 42 — **Baja, deriva de contrato**

`VERSION_LEGAL` figura en la API pública del motor pero no se exporta desde
`packages/rules-engine/src/index.ts` ni existe en el paquete. O se implementa, o se quita del
contrato. Nada del sitio la usa hoy.

### 13. `apps/web/src/app/sitemap.ts` — decisión editorial pendiente — **Baja**

`/cursos` (242 palabras en `<main>`) y `/plantillas` (259) son estados vacíos honestos, como pide
la regla 8 del contrato, y no merecen reproche. Pero están en el sitemap con prioridad 0.6: se
está pidiendo indexar dos páginas que no pueden satisfacer ninguna consulta. Sugerencia: dejarlas
accesibles y enlazadas, fuera del sitemap, hasta que tengan catálogo. Es una decisión, no un bug:
por eso no se aplicó.

---

## Fases

### Fase 1 — Desbloquear (semana 1)

1. Notación de punto en `sitio.ts:26` + variables en el build. **Todo lo demás depende de esto.**
2. Desplegar y comprobar: `robots.txt` con `Allow: /`, una página cualquiera con
   `index, follow`, `/llms.txt` accesible.
3. Dar de alta el dominio real en Google Search Console y Bing Webmaster Tools, y enviar el
   sitemap. Sin esto no habrá datos de indexación que mirar en la fase 4.
4. Limpiar el comentario contradictorio de `.env.example`.

### Fase 2 — Recuperar lo que se está perdiendo (semanas 2-3)

5. Enlaces del mega-menú en el HTML del servidor (o mapa del sitio en el pie).
6. `image`, `@id` e `isPartOf` en `jsonLdArticulo`; `logo` en `Organization`.
7. Sufijo del título a 16 caracteres, y reescribir los títulos que sigan largos.
8. Recortar las descripciones al rango útil, con el gancho en los primeros 120 caracteres.

### Fase 3 — Autoridad y citabilidad (mes 2)

9. Decisión de autoría: responsable editorial con nombre y, si se puede, revisor con cédula.
10. Reescribir los 5 pasajes con deícticos.
11. "Respuesta directa" en las 7 páginas que no la tienen, empezando por `/fuentes-oficiales`.
12. Alargar los 39 bloques de actividades y obligaciones hasta que se sostengan como cita
    completa (sujeto obligado exacto, excepción más común, evidencia que prueba cumplimiento).
13. Enriquecer los dos `Dataset`.

### Fase 4 — Medir y ajustar (continuo)

14. Search Console: cobertura de indexación de las 93 URL, consultas por página, y qué páginas
    ganan impresiones.
15. Volver a medir Core Web Vitals **con datos de campo** en cuanto haya tráfico. Los números de
    esta auditoría son de laboratorio.
16. Analizar el bundle una sola vez (`ANALYZE=1`) antes de tocar `framer-motion` o `recharts`;
    ~230 KB de JS en la portada merece confirmación antes de reescribir animaciones a ciegas.
17. Revisar los registros del servidor para ver si GPTBot, ClaudeBot y PerplexityBot están
    rastreando de verdad, y si `/llms.txt` se está pidiendo.
