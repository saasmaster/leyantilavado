# Rendimiento y entrega — leyantilavado.org

Fecha: 2026-08-12 · Origen medido: `http://leyantilavado.saavatar.top` (staging, nginx + `next start`).

**Advertencia de método.** Todo lo de abajo es **medición de laboratorio desde una sola máquina
en una sola red**, con `curl`. No es dato de campo: el dominio de staging no tiene historial en
CrUX y el dominio real todavía no existe, así que **no hay LCP, INP ni CLS de usuarios reales**
que reportar. Cualquiera que lea este archivo debe tratar los números como una cota, no como el
rendimiento que verá un usuario en un teléfono de gama media con red móvil en México.

## Puntuación: 82 / 100

Se descuenta sobre todo por el peso de JavaScript en la portada y por la ausencia de datos de
campo con los que confirmar cualquier cosa.

---

## 1. Tiempo hasta el primer byte — bien (Info)

| Ruta | HTML transferido (gzip/br) | TTFB | Total |
|---|---|---|---|
| `/` | 21.8 KB | 0.208 s | 0.306 s |
| `/umbrales` | 33.4 KB | 0.197 s | 0.284 s |
| `/glosario` | 47.9 KB | 0.208 s | 0.416 s |
| `/directorio` | 31.6 KB | 0.251 s | 0.411 s |
| `/actividades-vulnerables` | 28.5 KB | 0.214 s | 0.310 s |
| `/preguntas-frecuentes` | 26.7 KB | 0.284 s | 0.399 s |

Las cabeceras confirman por qué: `x-nextjs-cache: HIT`, `x-nextjs-prerender: 1` y
`Cache-Control: s-maxage=31536000`. Las páginas de contenido se sirven pre-generadas, que es
exactamente lo que corresponde a un sitio así. No hay nada que arreglar aquí.

Ojo con el contraste entre el HTML sin comprimir y el comprimido: la portada mide 141 KB en
crudo y 21.8 KB transferidos. La compresión está activa y funciona; ninguna alarma de "página
de 300 KB" que salga de medir sin `Accept-Encoding` es real.

## 2. JavaScript de la portada — el punto débil (Media)

Los ocho fragmentos más pesados que carga `/`, ya comprimidos:

| Bytes (br/gzip) | Fragmento |
|---|---|
| 71 554 | `/_next/static/chunks/1mndwqkgfaoia.js` |
| 44 474 | `/_next/static/chunks/33g-7jzf7d0o9.js` |
| 39 627 | `/_next/static/chunks/0cz1d0mv5g_q7.js` |
| 35 346 | `/_next/static/chunks/2fza_xeidyl42.js` |
| 12 713 | `/_next/static/chunks/3zt_fyc-b73gt.js` |
| 9 607 | `/_next/static/chunks/2299blzftg5xl.js` |
| 9 589 | `/_next/static/chunks/3y6an5yady9kl.js` |
| 7 614 | `/_next/static/chunks/19mx3mg6lkumu.js` |

Alrededor de **230 KB comprimidos** de JavaScript para una portada cuyo contenido es texto y
tablas ya renderizados en el servidor. Es un sitio de contenido pagando el precio de una
aplicación.

Los sospechosos habituales, por lo que declara `package.json`:

- **`framer-motion` (^12.4.2)** — lo usa `components/inicio/Aparece.tsx` para las animaciones de
  entrada. Es la biblioteca de interfaz más pesada del proyecto y en la portada sólo sirve para
  que unos bloques aparezcan al hacer scroll. Un `@keyframes` con `animation-timeline: view()`
  hace lo mismo en CSS, sin bytes de JavaScript, y degrada solo en navegadores que no lo
  soportan (el contenido queda visible, que es el estado correcto).
- **`recharts` (^2.15.1)** — pesa mucho y sólo hace falta donde hay gráficas. Verificar que no
  entre al fragmento compartido: debe cargarse con `next/dynamic` desde la vista que la usa.

**Recomendación (no bloqueante):** antes de tocar nada, correr `npx @next/bundle-analyzer` o
`ANALYZE=1 next build` una sola vez para confirmar qué hay dentro de esos cuatro fragmentos
grandes. No vale la pena reescribir animaciones a ciegas.

**Contexto honesto:** 230 KB comprimidos no es una emergencia y el contenido ya está pintado
antes de que ese JavaScript corra (SSR confirmado). El costo real es INP y batería en teléfonos
modestos, que es justo el perfil de buena parte del público objetivo — un contador o un notario
consultando un umbral desde el celular.

## 3. Tipografías — correcto (Info)

Tres familias de `next/font/google` (Inter, Inter Tight, Source Serif 4), todas con
`display: 'swap'` y autoalojadas en el origen (`font-src 'self' data:` en la CSP lo confirma:
no hay petición a `fonts.gstatic.com`). Autoalojar evita una conexión a un tercero en la ruta
crítica y elimina un problema de privacidad de paso.

Único matiz: tres familias son tres conjuntos de archivos. Sólo se cargan las que la página
usa, así que no es un problema, pero si alguna vez se busca recortar, la tercera familia
(el serif de lectura) es la candidata natural para revisar si gana su peso.

## 4. Imágenes — no aplica todavía (Info)

No se encontraron etiquetas `<img>` de contenido en el HTML de las páginas auditadas: el sitio
es texto, tablas e iconos SVG en línea de `lucide-react`. Eso explica el buen TTFB y hace que
las recomendaciones típicas de imágenes (AVIF, `loading="lazy"`, dimensiones explícitas) no
tengan objeto hoy.

`next.config.mjs` ya declara `images.formats: ['image/avif', 'image/webp']`, así que el día que
entre una imagen de contenido, la configuración la espera.

La imagen de Open Graph que se agregó en esta pasada (`app/opengraph-image.tsx`) se genera en el
build y se sirve como PNG estático: no afecta el rendimiento de ninguna página, sólo el de las
vistas previas al compartir.

## 5. Service worker — riesgo conocido, ya acotado (Info)

Existe `components/RegistroSW.tsx` y una página `/offline`. El patrón de fragmento obsoleto en
caché ("X is not defined" con un build limpio) es un problema recurrente de este stack. No se
pudo verificar el registro condicional por entorno sin ejecutar el build de producción; queda
como punto a confirmar en la siguiente revisión, no como hallazgo.

---

## Qué NO se pudo medir

- **Core Web Vitals de campo (LCP, INP, CLS).** Requiere CrUX, y CrUX necesita tráfico real
  sobre un dominio con historial. Ninguno de los dos existe todavía. No se estimó.
- **Lighthouse.** No se ejecutó: exige un navegador headless y el resultado de laboratorio sobre
  un dominio de staging sin CDN diría poco sobre producción.
- **Rendimiento del build de producción.** Por instrucción explícita no se corrió `next build`
  (satura la máquina cuando hay varios agentes trabajando).
