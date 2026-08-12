# SEO técnico — leyantilavado.org

Fecha: 2026-08-12 · Medido contra `http://leyantilavado.saavatar.top` (staging) · Código en
`/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado`.

**Puntuación: 68 / 100**

La base es sólida —prerender estático, cabeceras de seguridad completas, 404 real, redirección
de barra final, sitemap generado desde el motor— pero hay un fallo de configuración que hoy
tiene el sitio invisible **y en un estado incoherente**, y la navegación principal no existe
para un rastreador sin JavaScript.

---

## 1. CRÍTICO — El sitio se contradice a sí mismo sobre si quiere ser indexado

### Evidencia

```
$ curl -sS http://leyantilavado.saavatar.top/robots.txt
User-Agent: *
Disallow: /
```

Y sin embargo:

| Ruta | ¿Prerenderizada? | `<meta name="robots">` |
|---|---|---|
| `/` | sí | `noindex, nofollow` |
| `/umbrales` | sí | `noindex, nofollow` |
| `/multas` | sí | `noindex, nofollow` |
| **`/directorio`** | **no (usa `searchParams`)** | **`index, follow, max-image-preview:large, max-snippet:-1`** |

Las 15 páginas estáticas dicen "no me indexes" y la única página dinámica dice "indéxame".
Ambas llaman a la misma función `construirMetadata` con el mismo interruptor.

### Causa raíz

`apps/web/src/lib/sitio.ts:26`

```ts
indexable: process.env['NEXT_PUBLIC_SITE_INDEXABLE'] !== 'false',
```

**El acceso con corchetes derrota la sustitución estática de Next.** Next reemplaza en el
bundle las lecturas de variables `NEXT_PUBLIC_*` escritas con **notación de punto**
(`process.env.NEXT_PUBLIC_X`). Con `process.env['NEXT_PUBLIC_X']` no hay sustitución: queda
una lectura de `process.env` **en tiempo de ejecución**.

Consecuencias, las tres reales y las tres observables:

1. **Las páginas prerenderizadas congelan el valor del momento del build**; las dinámicas leen
   el valor del proceso que corre en el servidor. Si difieren —y aquí difieren— el sitio queda
   partido en dos, que es exactamente lo que muestra la tabla de arriba.
2. **En el bundle del cliente el valor sería `undefined`**, porque en el navegador
   `process.env` es un objeto casi vacío y no hubo sustitución. Hoy `SITIO.indexable` sólo se
   consume en servidor, así que no ha explotado; el día que un componente cliente lo lea,
   `undefined !== 'false'` da `true` y el error pasará silencioso.
3. El comentario de las líneas 10-25 explica con detalle por qué el valor por omisión es
   "indexable" para que un olvido falle de forma visible. El razonamiento es correcto y el
   fallo que describe **ya ocurrió otra vez, por otra puerta**: el build salió con el
   interruptor apagado.

`.env.example:23` declara `NEXT_PUBLIC_SITE_INDEXABLE=true`, así que el `.env` de producción no
la está pasando **al build** (o la pasa sólo al arranque). En ServerAvatar/Coolify la variable
tiene que existir en el paso `npm run build`, no sólo en `next start`.

### Arreglo

En `apps/web/src/lib/sitio.ts:26`, notación de punto:

```ts
indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE !== 'false',
```

Y en el panel de despliegue, asegurar que `NEXT_PUBLIC_SITE_INDEXABLE` y `NEXT_PUBLIC_SITE_URL`
estén presentes **en tiempo de build**.

**Severidad: Crítica.** Bloquea el 100 % de la indexación y del rastreo por IA. Nada más de
este informe importa hasta que esto se resuelva.

---

## 2. ALTA — La navegación principal no existe para un rastreador sin JavaScript

`apps/web/src/components/Encabezado.tsx:1` es `'use client'` y el mega-menú se pinta desde
estado (`menuActivo`). En el HTML servido sólo aparecen los enlaces siempre visibles; los del
menú desplegable, con sus descripciones, no están.

Enlaces `href` contados sobre el HTML crudo de las 16 páginas guardadas:

| Destino | Enlaces entrantes en la muestra |
|---|---|
| `/umbrales` | 28 |
| `/multas` | 25 |
| `/calendario-cumplimiento` | 28 |
| `/glosario` | 19 |
| `/precios`, `/cursos`, `/software-cumplimiento` (pie) | 16 c/u |
| **`/herramientas`** | **1** |
| **`/preguntas-frecuentes`** | **1** |

`/herramientas` es el índice de las 17 calculadoras —el activo diferencial del sitio— y recibe
**un solo enlace** en toda la muestra, desde la portada. `/preguntas-frecuentes`, igual. Ambas
viven dentro de desplegables del encabezado que nunca se renderizan en servidor.

Comprobación directa:

```
$ grep -o 'href="/preguntas-frecuentes"' seo-audit/raw/umbrales.html | wc -l
0
$ grep -o 'href="/herramientas"' seo-audit/raw/umbrales.html | wc -l
0
```

El pie de página sí se renderiza en servidor (por eso `/precios` y compañía suman 16). El
problema es exclusivo del encabezado.

**Por qué importa aquí más que en otro sitio:** los rastreadores de modelos de lenguaje
—prioridad declarada de este proyecto— en general no ejecutan JavaScript. Ven un sitio cuyo
menú principal no existe.

**Atenuante:** el `sitemap.xml` lista las 93 URL y el contenido enlaza de forma cruzada, así
que ninguna página queda huérfana de verdad (0 huérfanas sobre 93 en la comprobación). Lo que
se pierde es el reparto de autoridad interna y el contexto temático que da un menú.

**Arreglo:** renderizar los enlaces del mega-menú en el HTML y ocultarlos con CSS hasta que se
abra el desplegable, en vez de no montarlos. El componente puede seguir siendo cliente; lo que
cambia es que el `<ul>` exista siempre y el estado sólo controle `hidden`/altura. Alternativa
más barata: un bloque de enlaces del mapa del sitio en el pie, que ya se renderiza en servidor.

---

## 3. MEDIA — `robots.txt` no cubría el área privada real *(corregido en esta pasada)*

La lista anterior en `apps/web/src/app/robots.ts` era:

```ts
disallow: ['/app/', '/admin/', '/api/', '/resultado/', '/entrar', '/registro', '/recuperar'],
```

`/app/` y `/resultado/` **no existen**: el área privada está en un grupo de rutas `(app)`, que
no aporta segmento a la URL, y se sirve bajo `/panel/*`; los resultados de las herramientas se
calculan en el navegador y no tienen URL. Es decir, dos entradas protegían rutas inexistentes
mientras `/panel/*` y `/actualizar-contrasena` quedaban abiertas.

Atenuante importante: `next.config.mjs` ya emite `X-Robots-Tag: noindex, nofollow` sobre
`panel|admin|entrar|registro|recuperar`, y se verificó que funciona:

```
$ curl -sSI .../entrar | grep -i x-robots-tag
X-Robots-Tag: noindex, nofollow
$ curl -sSI .../panel | grep -i x-robots-tag
X-Robots-Tag: noindex, nofollow
```

O sea que el riesgo real era acotado, pero la lista de `robots.txt` daba una falsa sensación de
cobertura. **Ya corregida** a `/panel/`, `/admin/`, `/api/`, `/entrar`, `/registro`,
`/recuperar`, `/actualizar-contrasena`, `/offline`.

---

## 4. MEDIA — Sin reglas propias para rastreadores de IA *(corregido en esta pasada)*

`robots.txt` sólo tenía la regla `*`. Para `Google-Extended` y `Applebot-Extended` eso no es
neutral: no son rastreadores sino interruptores de permiso de entrenamiento, y sin entrada
propia el operador decide por omisión —una omisión que cambia con el tiempo.

**Ya corregido:** 14 agentes con entrada explícita (GPTBot, OAI-SearchBot, ChatGPT-User,
ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended,
Applebot-Extended, meta-externalagent, cohere-ai, CCBot, MistralAI-User), todos con la misma
lista de rutas privadas, más `Bytespider` bloqueado por costo de servidor. La política y su
porqué quedan escritos en `apps/web/src/lib/seo/rastreadores-ia.ts`.

---

## 5. MEDIA — `sitemap.xml` declaraba las 93 URL modificadas hoy *(corregido en esta pasada)*

`apps/web/src/app/sitemap.ts:15` hacía `const hoy = new Date().toISOString().slice(0,10)` y lo
ponía como `lastModified` de **todas** las entradas. Cada despliegue anunciaba el sitio entero
como modificado, aunque no hubiera cambiado una coma. Un buscador que ve eso dos o tres veces
deja de creerle al campo, y entonces deja de creerle también el día que una reforma sí cambia
una tabla —que es justo el día que importa.

**Ya corregido:** `lastModified` sale de `procedencia.ultimaRevision` del dato que sostiene cada
página (umbrales, actividades, obligaciones, efectivo, sanciones, calendario) y del
`REVISION_VIGENTE` editorial para el resto. Hoy todas coinciden en `2026-08-11` porque los datos
semilla se revisaron el mismo día; la diferencia es que a partir de ahora divergen solas.

---

## 6. Lo que está bien (verificado, no asumido)

| Comprobación | Resultado |
|---|---|
| Las 93 URL del sitemap responden | **93/93 = 200**, cero 404 y cero redirecciones |
| Ruta inexistente | `404` real, no un 200 con página de error |
| Barra final | `/umbrales/` → `308` a `/umbrales` |
| Mayúsculas | `/Umbrales` → `404` (sin duplicado por capitalización) |
| Canónica | presente y absoluta en las 16 páginas |
| `<html lang>` | `es-MX` correcto |
| Un solo `<h1>` por página | 16/16 |
| Saltos de nivel en encabezados | ninguno en 16/16 |
| Contenido y tablas en el HTML del servidor | sí — las tablas de umbrales, multas y efectivo están sin JS |
| Cabeceras de seguridad | CSP, HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP |
| `X-Robots-Tag` en rutas privadas | aplicado y verificado |
| Caché | `x-nextjs-cache: HIT`, `x-nextjs-prerender: 1` |
| `manifest.webmanifest` e `icon.png` | 200 |

---

## 7. Hallazgos menores

**7.1 · Canónicas apuntan al dominio real desde staging (Info, correcto).**
Todas las canónicas dicen `https://leyantilavado.org` mientras el sitio se sirve desde
`leyantilavado.saavatar.top`. Con `Disallow: /` activo no hay riesgo. Cuando se abra la
indexación, la estrategia correcta es la que ya está: dominio real en la canónica y el staging
cerrado. **No cambiar a canónica de staging.** Sólo hay que garantizar que el staging siga
cerrado cuando producción se abra — es decir, que sean dos entornos con `NEXT_PUBLIC_SITE_INDEXABLE`
distinto, lo que refuerza el hallazgo 1.

**7.2 · Sin HTTPS en staging (Info).**
`https://leyantilavado.saavatar.top` falla la validación de certificado (`no alternative
certificate subject name matches`). Es un subdominio de staging; irrelevante para SEO mientras
esté cerrado, pero conviene resolverlo antes de cualquier prueba con herramientas que exijan
HTTPS. La cabecera `Strict-Transport-Security` ya se emite sobre HTTP, lo cual no tiene efecto
(los navegadores la ignoran fuera de HTTPS) pero tampoco daña.

**7.3 · Sin `hreflang` (Info, correcto).**
Cero etiquetas `hreflang`. El sitio es monolingüe es-MX. Correcto no tenerlas. Si algún día
hay versión en inglés, hará falta `alternates.languages` en `construirMetadata`.

**7.4 · Faltaba imagen de vista previa (Alta) *(corregido en esta pasada)*.**
Ninguna de las 16 páginas emitía `og:image` ni `twitter:image`, mientras `construirMetadata`
declaraba `twitter.card = 'summary_large_image'` — una tarjeta grande sin imagen se degrada a
tarjeta chica. **Ya corregido** con `app/opengraph-image.tsx` y `app/twitter-image.tsx`
(1200×630, generadas en build); por convención de Next las heredan las 93 rutas. Verificado en
servidor de desarrollo: `200 image/png 113112b`, y las metaetiquetas `og:image`,
`og:image:width/height/alt`, `twitter:image` aparecen en el HTML.

**7.5 · El middleware corre sobre rutas de máquina (Baja).**
`apps/web/middleware.ts:15` excluye `robots.txt`, `sitemap.xml`, `manifest.webmanifest` y las
extensiones estáticas, pero **no** `/llms.txt`, `/opengraph-image` ni `/twitter-image` (ninguna
termina en una extensión de la lista). Resultado: cada petición de un rastreador a esas rutas
dispara una validación de sesión contra Supabase que no sirve para nada. No rompe nada
—verificado: las tres responden 200— pero es latencia y cuota regaladas. Añadir
`llms\.txt|opengraph-image|twitter-image` a la exclusión del `matcher`.

**7.6 · `.env.example` se contradice (Baja).**
Líneas 19-21 dicen «Mientras sea distinto de "true", TODAS las páginas salen con noindex» y la
línea 22, justo debajo, dice «Indexable por omisión. Poner en "false" sólo para cerrar el sitio
a propósito». El comentario viejo quedó cuando se invirtió la lógica. Quien despliegue leyendo
el primero configurará mal. Borrar el bloque obsoleto.

**7.7 · `VERSION_LEGAL` no existe (Baja, deriva de contrato).**
`CONTRATO.md:42` la lista como parte de la API pública del motor, pero no se exporta desde
`packages/rules-engine/src/index.ts` ni existe en el paquete. O se implementa, o se quita del
contrato. Nada del sitio la usa hoy.

**7.8 · `/directorio/alta` y `/offline` fuera del sitemap (Baja).**
Eran las dos únicas rutas estáticas públicas ausentes. `/offline` debe seguir fuera (es el
respaldo del service worker; indexarla sería ofrecer un resultado que dice "no hay conexión").
`/directorio/alta` **ya se añadió** con prioridad 0.4.
