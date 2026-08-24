# Auditoría verificada — leyantilavado.org

**Fecha:** 24 de agosto de 2026
**Método:** cuatro especialistas en paralelo (técnico, GEO, contenido) más
verificación directa contra el código y contra producción.
**Diferencia con las auditorías previas:** aquí **no se da por cierto ningún
hallazgo anterior**. Cada afirmación de los informes del 12 de agosto y del
informe SEO/GEO/Seguridad se contrastó antes de actuar.

**Puntuación de salud SEO: 86 / 100.**

| Categoría | Peso | Nota | Qué la sostiene |
|---|---:|---:|---|
| SEO técnico | 22 % | 92 | 164/164 URL del sitemap en 200. Sitemap generado desde el motor. Robots con regla propia por rastreador de IA. |
| Calidad de contenido | 23 % | 82 | Profundidad real y cifras que salen del motor versionado. La autoría es colectiva por decisión declarada. |
| SEO on-page | 20 % | 86 | Títulos y descripciones escritos a mano, H1 correcto, migas en tres niveles. |
| Datos estructurados | 10 % | 92 | Dataset, FAQ, Article, Organization, Breadcrumb, y ahora ItemList y WebApplication. |
| Rendimiento | 10 % | 80 | **No medido en esta pasada.** Nota provisional; ver §5. |
| Preparación para IA | 10 % | 84 | `llms.txt` de calidad, todos los rastreadores admitidos, respuesta directa por página. |
| Imágenes | 5 % | 78 | AVIF/WebP y `alt` correctos. Una sola imagen OG para las 164 URL. |

---

## 1. Lo primero: la mitad de los hallazgos previos ya no existía

Los informes del 12 de agosto son de doce días atrás y describen un sitio que ya
cambió. Aplicarlos a ciegas habría sido, en el mejor caso, ruido.

| Hallazgo previo | Estado real |
|---|---|
| «No existen `not-found.tsx`, `error.tsx`, `global-error.tsx`» — marcado como la grieta #1, en la que coincidían los 4 agentes | **Resuelto.** Los tres existen. |
| «`lib/script-tema.mjs` contradice el script real» (Crítico) | **Resuelto.** Borrado. |
| «`FECHA_HOY` muestra la fecha del build» (Alto, en 3 informes) | **Resuelto.** |
| «`recharts`, `zustand` y `@radix-ui/*` declarados sin usar» | **Resuelto.** Fuera del `package.json`. |
| «`Boton sm` y la nav miden 36 px» (Alto, WCAG 2.5.5) | **Resuelto.** Ambos a `h-11` = 44 px. |
| «El asterisco de obligatorio no se anuncia» (Alto) | **Resuelto.** Ahora `aria-required` en el control. |
| «`TablaEnvoltura` con `role="region"` anónima» (Alto) | **Resuelto.** La región sólo se declara si hay nombre. |
| «`Dataset` sin `variableMeasured`/`temporalCoverage`/`spatialCoverage`» | **Resuelto.** Los tres presentes. |
| «`BreadcrumbList` de 2 niveles en `/herramientas/*`» | **Resuelto.** Tres niveles. |
| «`sitioWeb` del directorio sin `rel`» | **Resuelto.** `nofollow noopener external`. |
| «`/cursos` y `/plantillas` son marcadores vacíos con prioridad 0.6» | **Caducado.** 268 y 161 líneas de contenido real. |
| «El sitio tiene 93 URL públicas» | **Falso hoy.** Son 164. |

### Un hallazgo previo que había que NO implementar

El informe recomienda crear `loading.tsx`. **Hacerlo reabriría un fallo ya
cerrado:** un `loading.tsx` en la raíz activa el streaming, Next emite `200 OK`
con la cabecera antes de que `notFound()` pueda cambiar el estado, y Google
recibe 200 en páginas inexistentes. Es exactamente el *soft 404* que costó
diagnosticar. Su ausencia es una decisión, no un olvido.

### Dos recomendaciones previas estaban inventadas

Verificadas contra las fuentes primarias:

- **La cabecera `Content-Policy: llms=full` no existe.** No aparece en el
  estándar de llmstxt.org ni en ningún otro sitio. La única cabecera que ese
  spec menciona es `Link:`.
- **«1 a 2 órdenes de magnitud más citas» por publicar `llms-full.txt` es una
  cifra sin respaldo.** No hay estudio ni referencia detrás.

En un sitio cuya promesa entera es «no inventamos cifras», implementar
recomendaciones inventadas habría sido la contradicción más cara posible.

---

## 2. Hallazgos nuevos, en orden de gravedad

### S-01 · Redirector abierto en el aterrizaje de los enlaces por correo — CRÍTICO · **corregido**

`destinoSeguro` validaba la cadena **tal como llegaba**. El estándar de URL
obliga a eliminar tabuladores y saltos de línea antes de interpretar el texto,
así que `/\n/sitio-falso.mx` empieza con un solo `/`, pasaba las tres
comprobaciones, y el navegador lo leía como `//sitio-falso.mx`.

Comprobado antes del arreglo:

```
new URL('/\n/evil.com', 'https://leyantilavado.org')  ->  https://evil.com/
```

Igual con `\t` y `\r`. **Tres auditorías revisaron esta función y la dieron por
correcta**, porque las tres leyeron la cadena de entrada en vez de resolverla.

Duele especialmente dónde estaba: `/api/auth/confirmar` es donde aterriza quien
acaba de pulsar el enlace de su correo — el momento de máxima confianza y el
mejor posible para llevar a alguien a un clon del panel.

La lección general: **hay que validar la cadena que se va a usar, no la que
llegó**. La prueba de regresión resuelve con `new URL` en vez de mirar el texto,
porque el fallo vivía justo en esa distancia.

### S-02 · Se perdían 24 de cada 25 altas del directorio — ALTO · **corregido**

El repositorio lee la lista JSON entera, empuja el registro y la reescribe. Sin
coordinación, las peticiones simultáneas leen la misma lista inicial y la última
escritura pisa a todas las anteriores.

**Medido, no estimado:** con la cola neutralizada, 25 altas concurrentes dejan
**1** registro en disco. La auditoría de agosto lo llamó *Medium* suponiendo que
se perdía «un alta por cada par concurrente». Se pierde casi todo, sin error
para quien envió el formulario y sin rastro en los registros.

Había tres ventanas, no una: `guardarAlta` (que además reserva el slug, o sea la
URL pública — dos altas entrelazadas acaban compartiéndola), `moderarAlta`, y
cualquier `agregar`. La cola va en la frontera pública, donde pasan todos los
caminos.

### S-03 · Los redirects de autenticación apuntaban al puerto interno — ALTO · **corregido**

Producción devolvía literalmente `Location: https://localhost:5400/entrar?…`.

Hoy no rompe nada visible porque sin Supabase conectado el endpoint sale siempre
por la rama de error. **El día que se conecte, cada persona que pulse el enlace
de confirmación de su correo aterrizaría en `https://localhost:5400/panel`.** El
flujo de alta roto al completo, desde el primer usuario.

Lo delató comparar dos redirects del propio sitio: `/admin`, que redirige desde
el middleware, sí devolvía el origen público. Misma petición, mismo proxy,
distinto resultado.

Nota metodológica: mi primer arreglo —cambiar `peticion.url` por
`peticion.nextUrl`— **no funcionó**, y sólo se supo al probarlo contra
producción. Detrás de nginx ambas propiedades resuelven al origen interno; la
asimetría del middleware engaña. El origen público sólo lo conoce el proxy, y
viaja en las cabeceras.

Además, `origen()` —que construye el enlace de los correos de recuperación—
caía a `'localhost:5400'` si faltaba la cabecera. Un respaldo así no falla
ruidosamente: manda correos con enlaces que nadie puede abrir, y un correo ya
enviado no se puede corregir.

### S-04 · `type` de OTP sin validar — MEDIO · **corregido**

El endpoint casteaba con `as EmailOtpType` sin comprobar nada. Un cast de
TypeScript no existe en ejecución: lo que viniera en la query pasaba tal cual a
`verifyOtp`, permitiendo verificar un token por un flujo distinto del que
anunciaba el correo. Ahora hay lista blanca cerrada.

### C-01 · Identidad legal del responsable — **decisión tomada: no se publica**

El sitio no publica razón social, RFC ni domicilio, y **es una decisión de
Jorge del 24 de agosto de 2026**, no un hueco por llenar. Queda registrado aquí
para que ninguna auditoría posterior lo vuelva a abrir como pendiente.

Lo que sí publica, y cubre la función práctica: se declara plataforma privada e
independiente, dice explícitamente que no es una autoridad, y ofrece un canal
de contacto con folio para el ejercicio de derechos ARCO.

Queda dicho, para que la decisión sea informada: la LFPDPPP pide que el aviso
de privacidad identifique al responsable del tratamiento. Publicar los datos
cerraría ese punto y subiría la señal de confianza en un sitio YMYL. Es una
valoración de riesgo que corresponde a Jorge, y está tomada.


### G-01 · Posible pérdida de cifras al extraer `/umbrales` — **NO VERIFICADO**

El especialista de GEO reportó que los valores de la tabla («325 UMA») se
pierden al procesar el HTML con las librerías de extracción que usan los
rastreadores, por estar anidados en `<td><ul><li><span>`.

**Intenté reproducirlo y no pude:** el extractor no devolvió una salida
utilizable en este equipo. Lo dejo declarado como no verificado en vez de
presentarlo como hecho, y **no se actuó sobre él**.

Lo que sí se comprobó del marcado: es una `<table>` válida, con `<th
scope="row">` y `<caption>`, y el texto de la cifra está dentro de la celda.
Cualquier extractor que recorra el texto del DOM la encuentra; sólo fallaría uno
que mirase únicamente los hijos directos de `<td>`. El anidamiento existe porque
hay filas con varios umbrales.

**Cómo cerrarlo bien:** reproducirlo con la librería concreta y, si se confirma,
la solución no es retocar el HTML sino añadir junto a la tabla una frase en
prosa con las cifras clave —tomadas del motor, nunca escritas a mano—. Eso ayuda
a la citación sea cual sea el extractor.

### G-02 · No existe `llms-full.txt` — BAJO · **abierto, sin urgencia**

El hecho es cierto (404 confirmado). Lo que era falso es el beneficio
cuantificado que le atribuía el informe previo. Vale la pena hacerlo, pero como
mejora ordinaria, no como prioridad.

---

## 3. Lo que se implementó en esta pasada

| Cambio | Verificación |
|---|---|
| Cierre del redirector abierto + lista blanca de tipos OTP | Prueba de regresión que resuelve con `new URL`; comprobado que falla sin el arreglo |
| Cola de escrituras del directorio | Prueba de 25 altas concurrentes; comprobado que falla sin la cola (1 de 25) |
| Origen público desde cabeceras, una sola implementación | Verificado contra producción: el puerto interno desapareció |
| `WebApplication` en las 19 herramientas | Presente en producción |
| `ItemList` en `/herramientas` | 19 elementos, en producción |
| Enlace en vivo a la Chrome Web Store + `SoftwareApplication` | Presente en producción |

**Verificación global:** 360 pruebas unitarias y **166 de contrato contra el
sitio en producción**, todas en verde.

---

## 4. Lo que deliberadamente NO se hizo

- **`loading.tsx`** — reabriría el *soft 404* (§1).
- **La cabecera `Content-Policy: llms=full`** — no existe.
- **Bajar la prioridad de `/cursos` y `/plantillas`** — ya no son marcadores.
- **`Full (strict)` en el SSL de Cloudflare** — el certificado del origen no
  cubre `www`; convertiría un fallo de la regla de redirección en caída total.
- **Acortar el `Cache-Control: s-maxage=31536000` del HTML** — hoy es inerte: el
  apex no pasa por ninguna CDN. La regla para acortarlo tendría que excluir
  `/_next/static` con una expresión regular, y equivocarse ahí sí rompería el
  caché de los recursos. **Condición:** si algún día se proxea el apex por
  Cloudflare, hay que acortarlo *antes*.
- **Añadir un revisor con nombre y credenciales** — decisión editorial de Jorge,
  no de código.

---

## 5. Lo que esta auditoría no midió

Se dice explícitamente en vez de rellenarlo con estimaciones:

- **Core Web Vitals reales.** No hay credenciales de la API de Google
  configuradas, así que no hay datos de campo (CrUX). La nota de rendimiento es
  provisional y se apoya en señales indirectas del código.
- **Perfil de enlaces entrantes.** Sin clave de Moz; sólo habría datos de Common
  Crawl, de valor escaso.
- **Señales de marca en Wikipedia, Reddit o LinkedIn.** Los buscadores
  bloquearon la consulta con CAPTCHA. Se deja sin dato en vez de inventarlo.
- **Comportamiento real de las RLS bajo concurrencia.** Sólo se leyó el SQL.
