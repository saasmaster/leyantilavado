# Auditoría SEO técnico — leyantilavado.org

Fecha: 2026-08-24. Contrasta con auditoría previa del 12 de agosto (bastante de lo reportado entonces ya se resolvió).

## Veredicto sobre las 5 afirmaciones de la auditoría previa

| # | Afirmación | Veredicto | Evidencia |
|---|---|---|---|
| 1 | `Cache-Control: s-maxage=31536000` peligroso por versión de motor / cambio de UMA el 1 feb | **MATIZADA** | El header es real (`curl -sI` en home y en `/umbrales`). Pero hoy es inerte: DNS resuelve directo a `209.54.100.69` (sin Cloudflare/CDN delante — `server: nginx/1.24.0`), y `dist/config/nginx.conf` no tiene `proxy_cache` para HTML, solo pasa la petición a Next. `s-maxage` solo lo respetan cachés compartidas; sin una delante, no hay riesgo de servir un año una tabla de UMA vieja. Además Next ya manda `x-nextjs-cache: HIT` + `x-nextjs-stale-time: 300`: su Full Route Cache interno revalida cada 5 min independientemente del header público. El riesgo es real solo como **trampa latente**: si algún día se pone Cloudflare delante (patrón que Jorge usa en otros sitios), ese header de 1 año se volvería peligroso de inmediato. |
| 2 | El sitio tiene 93 URL públicas | **FALSA** (obsoleta) | El propio código lo delata: comentario en `apps/web/src/app/sitemap.ts` dice textualmente "Antes era `new Date()` para las 93 URL" — 93 es un número **histórico** de antes de un fix ya aplicado. El sitemap en vivo hoy trae **164 URL**, todas verificadas con 200 (ver abajo). |
| 3 | Falta hreflang | **MATIZADA** | Cierto que no hay ninguna etiqueta `hreflang` en el HTML (confirmado por grep sobre el home renderizado). Pero el sitio es monolingüe es-MX, sin versión en otro idioma/región — hreflang existe para señalar variantes alternativas, que aquí no existen. No es un defecto real; como mucho, mejora cosmética (`hreflang="es-MX"` autorreferencial + `x-default`), no un hallazgo de indexabilidad. |
| 4 | theme-color fijo en claro: en modo oscuro se ve la barra clara | **CIERTA, y es intencional documentado** | `app/layout.tsx`: `themeColor: '#FBFAF7'` fijo, con comentario explícito: el sitio siempre arranca en modo claro (no lee `prefers-color-scheme`) porque el contenido —tablas de umbrales, texto legal largo— se lee mejor en claro; el oscuro solo se activa si el usuario lo eligió y quedó en `localStorage`. Consecuencia real: un usuario que alternó a oscuro sigue viendo la barra de estado del navegador en claro. Es una decisión de producto documentada, no un descuido, pero el efecto técnico que señala la auditoría previa es correcto. |
| 5 | `<body>` arranca con `<div hidden>` vacío y perjudica a rastreadores de IA antiguos | **FALSA como está planteada** | Confirmado que existe: `<div hidden=""><!--$--><!--/$--></div>` antes del skip-link. No viene de ningún componente propio (no está en `layout.tsx`, `ProveedorTema.tsx` ni `RegistroSW.tsx`) — es un artefacto estándar del boundary de Suspense/streaming de React 19 dentro de Next.js App Router, presente en prácticamente cualquier sitio Next.js 13+. Está vacío (solo comentarios de React) y marcado `hidden`; un crawler sin JS lo salta y llega igual al contenido real (skip-link, header, main) que sigue inmediatamente en el DOM. No hay pérdida de contenido ni bloqueo real. Severidad Low en el mejor de los casos, no un problema de rastreo de IA. |

## Verificación del sitemap (en vivo, hoy)

- `https://leyantilavado.org/sitemap.xml` → 200, **164 URL** (`grep -c "<loc>"`).
- Las 164 URL se probaron una por una con `curl -o /dev/null -w "%{http_code}"`: **164/164 devolvieron 200**. Cero 404, cero 3xx, cero redirect chains (`-L --max-redirs 5` con comparación de `url_effective` tampoco detectó redirecciones).
- Sin duplicados en `<loc>` (`sort | uniq -d` vacío).
- `robots.txt` → 200, declara `Sitemap: https://leyantilavado.org/sitemap.xml` correctamente, con bloques por user-agent para bots de IA (GPTBot, ClaudeBot, PerplexityBot, etc.) y `Bytespider` bloqueado del todo.
- Nav global (`lib/sitio.ts` → `NAVEGACION`, usada en `Encabezado.tsx`) tiene 41 hrefs internos; todos aparecen en el sitemap con 200. No se detectaron enlaces rotos en la navegación principal (footer/header, presentes en las 164 páginas).

## Tabla de hallazgos

| ID | Severidad | Título | Ubicación |
|---|---|---|---|
| T-01 | Low | `Cache-Control` de HTML solo trae `s-maxage=31536000`, sin `stale-while-revalidate` ni tope corto — inerte hoy, trampa si se agrega CDN | Respuesta HTTP de todas las rutas HTML (Next.js, no `next.config.mjs`) |
| T-02 | Low | `theme-color` fijo en claro deja la barra de estado clara cuando el usuario elige modo oscuro | `apps/web/src/app/layout.tsx` (`viewport.themeColor`) |
| T-03 | Info/Resuelto | Conteo de "93 URL" y `lastModified` con `new Date()` en el sitemap — YA RESUELTO | `apps/web/src/app/sitemap.ts` (comentario confirma el fix; sitemap ahora usa fecha de procedencia real por dato) |
| T-04 | Info/No aplica | Ausencia de hreflang — no es defecto, sitio monolingüe | HTML global |
| T-05 | Info/No aplica | `<div hidden>` vacío al inicio de `<body>` — artefacto normal de React/Next, sin impacto real | HTML servido (streaming/Suspense boundary de Next.js, no atribuible a código propio del sitio) |

## Detalle y recomendaciones

**T-01 — Cache-Control desalineado con la frescura real (Low, preventivo)**
Next envía `s-maxage=31536000` en el HTML de todas las páginas mientras que su propio caché interno (`x-nextjs-stale-time: 300`) ya revalida cada 5 min. Hoy no hay CDN delante (DNS apunta directo a la IP del VPS, nginx sin `proxy_cache` para HTML), así que no hay riesgo activo. Pero el header miente sobre la frescura real y es una mina para el día que se ponga Cloudflare u otro proxy cacheante delante (patrón que ya se usa en otros sitios del portafolio).
Recomendación: emitir explícitamente `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400` en las rutas de contenido (vía `headers()` en `next.config.mjs` o `export const revalidate = 300` donde falte), para que el header público coincida con la ventana real de revalidación de 5 min y sea seguro por defecto si algún día se añade un CDN.

**T-02 — theme-color único (Low)**
Decisión de producto documentada y razonable (contenido legal se lee mejor en claro), pero el efecto de barra de estado desalineada en modo oscuro es real.
Recomendación: si se quiere pulir, usar dos `<meta name="theme-color">` con `media="(prefers-color-scheme: dark)"` apuntando al tono oscuro real de la UI cuando el usuario ya activó `oscuro` (requiere lectura de la clase en cliente vía JS, no vía `viewport.themeColor` estático) — mejora cosmética, no urgente.

**T-03 — Ya resuelto**
El sitemap ya no usa `new Date()` para `lastModified` ni reporta 93 URL fijas; usa procedencia real por dataset (`revisionDe()` en `sitemap.ts`) y hoy expone 164 URL, todas 200. No requiere acción.

**T-04 — No aplica**
No agregar hreflang mientras el sitio siga siendo monolingüe es-MX. Si se lanza una versión en inglés, ahí sí se vuelve obligatorio (`hreflang="es-MX"` + `hreflang="en"` + `x-default`) — delegar a la sub-skill `seo-hreflang` en ese momento.

**T-05 — No aplica**
No requiere fix. Es ruido de framework, no un problema de indexabilidad ni de rastreo por IA: el div está vacío y `hidden`, y el contenido real (skip-link, header, `<main>`) lo sigue inmediatamente en el mismo HTML servido en el primer byte.

## Resto de categorías (verificado, sin hallazgos nuevos)

- **Seguridad**: CSP estricta (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), HSTS con `preload`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin` — todas presentes y confirmadas por `curl -sI` en home y en página interna. `poweredByHeader: false`. Sin hallazgos.
- **Canónicas**: `<link rel="canonical">` presente y autorreferencial en el home (`https://leyantilavado.org`); no se detectaron canónicas cruzadas erróneas en la muestra revisada.
- **robots meta**: `index, follow, max-image-preview:large, max-snippet:-1` en home — correcto para YMYL de contenido editorial.
- **Rutas privadas**: `/panel/`, `/admin/`, `/api/`, `/entrar`, `/registro`, `/recuperar`, `/actualizar-contrasena`, `/offline` correctamente bloqueadas en `robots.txt` y con `X-Robots-Tag: noindex, nofollow` reforzado a nivel de headers en `next.config.mjs` para el grupo `(panel|admin|entrar|registro|recuperar)`. Coherente, sin conflicto entre robots.txt y meta/headers.
