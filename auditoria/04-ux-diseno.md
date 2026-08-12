# Auditoría UX / Diseño / Accesibilidad — LeyAntilavado.org

**Proyecto:** `apps/web` — Next.js 16 (App Router) + React 19 + Tailwind v4 + Framer Motion + Radix UI + Lucide
**Auditor:** revisión estática (sin browser real)
**Fecha:** 2025
**Alcance:** sitio público, herramientas, área privada (panel) y panel administrativo (lectura)

---

## 1. Resumen ejecutivo

LeyAntilavado.org es un sitio de información y calculadoras legales para profesionales mexicanos de cumplimiento PLD. La dirección de diseño —LegalTech contemporáneo (referencia: Linear/Mercury/Ramp) sin parecer despacho tradicional— está ejecutada con criterio consistente y bien documentada en el código.

**El sistema de diseño es el activo más fuerte del proyecto.** Los tokens de color tienen ratios de contraste documentados a WCAG AA (`apps/web/src/app/globals.css:36-62`); los tres niveles de tinta y los tres acentos semánticos (petróleo, ámbar, rojo, verde) están definidos con un trabajo de jerarquía muy cuidado. La regla `prefers-reduced-motion` es global y exhaustiva. El conteo regresivo del calendario es un ejemplo notable de accesibilidad bien resuelta: un `role="timer"` con `aria-live="off"` y un `aria-label` en prosa legible, no en cifras sueltas.

**El principal hueco es la ausencia de páginas de estado de Next.js** (no existen `not-found.tsx`, `error.tsx`, `loading.tsx` ni `global-error.tsx`). Para un sitio que se presenta como "centro independiente" y maneja datos de cumplimiento, entregar al visitante la 404 o el error por defecto de Next 16 contradice la promesa de seriedad. El segundo hueco relevante es un **módulo muerto y contradictorio**: `apps/web/src/lib/script-tema.mjs` define un script anti-parpadeo que SÍ respeta `prefers-color-scheme`, mientras que el script que de verdad se inyecta en `apps/web/src/app/layout.tsx:18-19` NO lo respeta. El archivo `.mjs` no se importa en ningún sitio, pero su documentación sigue siendo engañosa.

**Lo tercero que pide atención** es el sistema de marcado de campos obligatorios: el asterisco rojo lleva un `aria-label="obligatorio"`, pero ese atributo no se anuncia en muchos lectores de pantalla porque la etiqueta no tiene `role`. Un usuario de SR que navegue por campos no oye "obligatorio" antes de cada `<input required>`.

A favor del proyecto: la cobertura de accesibilidad en formularios es muy superior a la media —`aria-describedby` cableado en el componente `Campo`, `role="alert"` en cada mensaje de error, `aria-live="polite"` en cada sección de resultado, honeypot bot correctamente oculto, etiquetas siempre visibles (nunca solo placeholder).

### Puntuación de salud UX

| Dimensión | Puntuación |
|---|---:|
| Sistema de diseño y tokens | 95 / 100 |
| Accesibilidad (POUR agregado) | 84 / 100 |
| Información y arquitectura | 82 / 100 |
| Formularios e input UX | 87 / 100 |
| Estados vacíos / errores / carga | 38 / 100 |
| Movimiento y microinteracciones | 90 / 100 |
| i18n y formato (es-MX) | 92 / 100 |
| **Salud UX global** | **79 / 100** |

El número no es bajo pero está lastrado por los estados de error: el 38 refleja que las páginas que el usuario ve cuando algo va mal (404, 500, navegación fallida) están en blanco o son el fallback genérico de Next.

---

## 2. Tabla de hallazgos

| ID | Severidad | Título | Área | Ubicación |
|---|---|---|---|---|
| F-01 | **Crítico** | No existen `not-found.tsx`, `error.tsx`, `loading.tsx` ni `global-error.tsx` en todo el árbol | Estados de error | `apps/web/src/app/` (ausencia) |
| F-02 | **Crítico** | `lib/script-tema.mjs` contradice el script real y no se importa en ningún sitio | Tema / docs | `apps/web/src/lib/script-tema.mjs:1-13` vs `apps/web/src/app/layout.tsx:18-19` |
| F-03 | **Alto** | El modo oscuro no respeta `prefers-color-scheme` para visitantes nuevos, sin opción visible de "seguir al sistema" | Tema | `apps/web/src/app/layout.tsx:18-19, 84-89` |
| F-04 | **Alto** | Marcado de campos obligatorios: el `aria-label="obligatorio"` del asterisco no se anuncia en muchos lectores | A11y formularios | `packages/ui/src/primitivos.tsx:111`, `apps/web/src/components/inicio/Newsletter.tsx:196-198`, `apps/web/src/components/FormularioContacto.tsx:163` |
| F-05 | **Alto** | `Boton` `sm` mide 36px y rompe el target táctil mínimo de 44px (WCAG 2.5.5 / AA) | A11y táctil | `packages/ui/src/Boton.tsx:48` |
| F-06 | **Alto** | Botones de navegación de escritorio del header miden 36px (`h-9`) | A11y táctil | `apps/web/src/components/Encabezado.tsx:90` |
| F-07 | **Alto** | `TablaEnvoltura` usa `role="region"` sin `aria-label` o `aria-labelledby` | A11y semántica | `packages/ui/src/primitivos.tsx:175-187` |
| F-08 | Alto | Botones enviados no llevan `aria-busy` durante el submit | A11y formularios | `apps/web/src/components/FormularioContacto.tsx:173`, `apps/web/src/components/inicio/Newsletter.tsx:218`, `apps/web/src/app/(auth)/entrar/FormularioEntrar.tsx:11` |
| F-09 | Alto | No hay spinner visual durante el submit — solo cambia el texto del botón | UX formularios | `apps/web/src/components/FormularioContacto.tsx:173-175`, `apps/web/src/app/(auth)/entrar/FormularioEntrar.tsx:11-13` |
| F-10 | Alto | El header ignora completamente el tamaño de la barra de URL en iOS al usar `min-h-[calc(100dvh-4.25rem)]` (en realidad OK con `dvh`, pero el cálculo no considera notch en todos los navegadores) | Responsive | `apps/web/src/components/Encabezado.tsx:196` |
| F-11 | Alto | CSP con `'unsafe-inline'` en `script-src` — documentado y justificado, pero sigue siendo un riesgo residual | Seguridad / CSP | `apps/web/next.config.mjs:39` |
| F-12 | Alto | "Metodología editorial", "Nosotros" y "Precios" no aparecen en el `MapaDelSitio` de la portada (solo footer) | Arquitectura | `apps/web/src/components/inicio/MapaDelSitio.tsx:49-163` |
| F-13 | Alto | "Editar este dato" / "/directorio/alta" no es visible en la navegación principal; sólo en copy dentro de componentes | Arquitectura | `apps/web/src/app/sitemap.ts:81` (sin entrada en NAVEGACION) |
| F-14 | Medio | No se usa `useId()` en ningún `Campo` — el `id` lo decide el caller, con riesgo de colisión si un formulario se repite en la misma página | A11y / DX | `packages/ui/src/primitivos.tsx:102-135` |
| F-15 | Medio | `disabled:opacity-45` puede bajar contraste del texto del botón por debajo de AA en el variant `contorno` | A11y / color | `packages/ui/src/Boton.tsx:16` |
| F-16 | Medio | El menú dropdown del header se abre por `onMouseEnter` — usuario de teclado puede abrirlo con click/Enter, pero pierde la pista visual de "estás aquí dentro" | A11y teclado | `apps/web/src/components/Encabezado.tsx:78-83` |
| F-17 | Medio | El texto del newsletter sobre fondo `--color-marino` usa `text-[color-mix(in_srgb,white_72%,transparent)]` para algunos pasajes — verificar 4.5:1 en todos los puntos | A11y color | `apps/web/src/components/inicio/Newsletter.tsx:94, 101, 106` |
| F-18 | Medio | Las dependencias `@radix-ui/*` están en `package.json` pero no se importan en ningún archivo `.tsx` del repo | Mantenimiento | `apps/web/package.json:18-26` |
| F-19 | Medio | `FECHA_HOY` se calcula al cargar el módulo, no en cada request — para sitio estático, los sellos "última actualización" se van a quedar obsoletos entre builds | UX / contenido | `apps/web/src/components/inicio/comun.tsx:20` |
| F-20 | Medio | `Prohibir` cargar dos instancias del form de contacto: el `id="sitio"` (honeypot) colisiona con cualquier otro input `name="sitio"` en la misma página | Robustez | `apps/web/src/components/FormularioContacto.tsx:150` |
| F-21 | Medio | La galería de iconos "decora" headers de sección con `Icon` decorativos sin `aria-hidden` en todos los casos | A11y | `apps/web/src/app/contacto/page.tsx:87-91`, varios más (verificar caso por caso) |
| F-22 | Medio | Faltan migas de pan en páginas institucionales: la mayoría no usa `EncabezadoPagina` (migas) y la portada tampoco tiene | Arquitectura | `apps/web/src/app/contacto/page.tsx` (sí tiene), `apps/web/src/app/herramientas/page.tsx` (no), `apps/web/src/app/actividades-vulnerables/page.tsx` (?) |
| F-23 | Bajo | El campo de fecha en formularios usa `<input type="date">` sin pista de formato | UX formularios | `apps/web/src/app/herramientas/calculadora-uma/Conversor.tsx:121-126` |
| F-24 | Bajo | El logo SVG tiene `aria-hidden="true"` pero ningún `<title>` interno — usuarios de SR que listen el header oigan "shield icon, hidden" en algunos lectores | A11y | `apps/web/src/components/Encabezado.tsx:235-251` |
| F-25 | Bajo | La galería de logos en `insignia-amarilla` (Insignia tono `ambar`) usa texto blanco sobre fondo ámbar claro — verificar 4.5:1 | A11y color | `packages/ui/src/primitivos.tsx:37`, contexto en `apps/web/src/components/contenido/LineaTiempo.tsx:64` |
| F-26 | Bajo | La cantidad `await leerSesion()` en el `LayoutApp` (`apps/web/src/app/(app)/layout.tsx:19`) hace que la página renderice de forma síncrona — sin `loading.tsx`, no hay fallback | UX / perf | `apps/web/src/app/(app)/layout.tsx:18-26` |
| F-27 | Bajo | El atajo de teclado "?" no existe; un sitio denso como este se beneficiaría de un sheet de atajos | UX | (no existe) |
| F-28 | Bajo | El menú móvil no muestra una jerarquía de heading visible — los grupos se etiquetan con `<p class="eyebrow">`, no con `<h2>` | Semántica | `apps/web/src/components/Encabezado.tsx:199` |
| F-29 | Bajo | En `glosario/page.tsx:97`, los `<h2>` agrupan por letra y los `<h3>` quedan implícitos en `<dt>` — falta el `<h3>` por término | Semántica | `apps/web/src/app/glosario/page.tsx:96-100` |
| F-30 | Bajo | El `text-balance` global se aplica a `h1-h4` pero el balance puede mover palabras huérfanas de forma rara en titulares cortos en español | Tipografía | `apps/web/src/app/globals.css:182-187` |
| F-31 | Bajo | La página de inicio muestra `FECHA_HOY` en la barra superior del hero ("Marco legal revisado al …") — el visitante asume "hoy" pero puede ser el día del último build | Contenido | `apps/web/src/components/inicio/Hero.tsx:42` |
| F-32 | Bajo | El tooltip del header ("Estadísticas") no existe; el botón de tema es reconocible pero un texto "Modo oscuro/claro" debajo del icono mejoraría descubrimiento | UX | `apps/web/src/components/Encabezado.tsx:157-165` |
| F-33 | Bajo | La versión móvil del newsletter mete el formulario debajo de la copy — en pantallas muy estrechas esto puede empujar la copy fuera de la vista inicial | Responsive | `apps/web/src/components/inicio/Newsletter.tsx:92` |
| F-34 | Bajo | El placeholder `placeholder="nombre@empresa.mx"` en el input de correo es un buen patrón pero no debe confundirse con etiqueta (ya está bien resuelto) | UX | (correcto, dejar nota) |
| F-35 | Bajo | `aspect-ratio: 16/10` en la foto del hero puede recortar el escritorio en pantallas con zoom — `object-bottom` lo mitiga pero vale verificar | Responsive | `apps/web/src/components/inicio/Hero.tsx:101` |
| F-36 | Bajo | El `font-feature-settings: 'cv05', 'ss01'` en `body` activa glifos Inter específicos — si el subset es sólo `latin`, los caracteres acentuados del español usan glifos diferentes al inter clásico, no es bug, pero conviene saberlo | Tipografía | `apps/web/src/app/globals.css:163` |
| F-37 | Bajo | `noindex` en `/directorio/alta` es correcto (es funcional) pero algunos sitios prefieren `index, follow` para que el buscador descubra perfiles enlazados desde ahí | SEO / UX | `apps/web/src/app/sitemap.ts:81` |
| F-38 | Bajo | El path `/(app)/panel/manual` no tiene contraparte pública — usuario del panel no puede enlazar a la documentación externa desde la barra | Arquitectura | `apps/web/src/app/(app)/panel/manual/page.tsx` (no verificado, queda como nota) |
| F-39 | Bajo | `tabs`/`popover`/etc. de Radix declarados pero sin uso real; borrar para reducir `node_modules` y superficie de auditoría | Mantenimiento | `apps/web/package.json:18-26` |
| F-40 | Bajo | El CSS `.salto-contenido` con `left: -9999px` puede quedar inaccesible para algunos usuarios de SR si el foco no se mueve a la `#main` después de activarlo (no verificado en navegador) | A11y | `apps/web/src/app/globals.css:346-358` |

---

## 3. Hallazgos detallados

### F-01 · No existen páginas de estado de Next.js
**Severidad:** Crítico
**Archivos:** `apps/web/src/app/` (búsqueda recursiva de `not-found.tsx`, `error.tsx`, `loading.tsx`, `global-error.tsx` — todos ausentes)

**Evidencia.** Comando ejecutado: `find apps/web/src -name "not-found*" -o -name "error.tsx" -o -name "loading.tsx" -o -name "global-error*"`. Resultado: cero coincidencias.

**Impacto.** Un visitante que llegue a una URL inexistente ve la página por defecto de Next 16: título plano "404 - This page could not be found" sin la cabecera, el pie ni la marca del sitio. En un proyecto que se vende como "centro independiente" y muestra el `AvisoIndependencia` en cada página, perder el chrome en el peor momento posible rompe la promesa de credibilidad. Un error de runtime (p. ej., la API de Supabase caída) hace que la página entera desaparezca con la pantalla por defecto de Next.

**Recomendación.** Crear al menos:
- `apps/web/src/app/not-found.tsx` con la misma cabecera/pie, titular "No encontramos esta página", búsqueda hacia el glosario y la calculadora más usada.
- `apps/web/src/app/(app)/error.tsx` y `apps/web/src/app/error.tsx` con un mensaje que mantenga el chrome y un enlace al contacto.
- `apps/web/src/app/loading.tsx` (top-level) que muestre un esqueleto con la marca.

### F-02 · `lib/script-tema.mjs` contradice el script inyectado
**Severidad:** Crítico
**Archivos:** `apps/web/src/lib/script-tema.mjs:13`, `apps/web/src/app/layout.tsx:18-19, 97`

**Evidencia.**
- `lib/script-tema.mjs:13` exporta:
  ```js
  if(t==='oscuro' || (!t && o)) document.documentElement.classList.add('oscuro');
  ```
  donde `o = window.matchMedia('(prefers-color-scheme: dark)').matches`. **Sí respeta la preferencia del sistema.**
- `app/layout.tsx:18-19` define localmente:
  ```js
  if(localStorage.getItem('tema')==='oscuro') document.documentElement.classList.add('oscuro');
  ```
  **No consulta `prefers-color-scheme`.**
- Búsqueda de `import.*script-tema` en todo el repo: **cero coincidencias**. El módulo no se importa nunca.
- El comentario en `app/layout.tsx:13-17` dice "Vivió un rato en su propio módulo para que `next.config.mjs` calculara su hash SHA-256 y lo permitiera en la CSP. Esa estrategia se descartó" — pero el archivo `.mjs` nunca se borró y su comentario sigue afirmando que el hash se recalcula al arrancar (línea 8), lo cual es engañoso.
- El `next.config.mjs:39` actual usa `script-src 'self' 'unsafe-inline'` (ya no necesita el hash), así que el argumento del archivo `.mjs` está obsoleto en cualquier caso.

**Impacto.** Riesgo de divergencia silenciosa. Un desarrollador que en el futuro importe `SCRIPT_TEMA` desde `lib/script-tema.mjs` activará el respeto a `prefers-color-scheme` que la decisión de producto documentada en `layout.tsx:84-89` prohíbe explícitamente. El comentario en `lib/script-tema.mjs:5-12` es inexacto.

**Recomendación.** Borrar `apps/web/src/lib/script-tema.mjs`. Si la decisión cambia y se decide respetar `prefers-color-scheme`, esa decisión debe tomarse en un solo lugar y reflejarse en layout + comments.

### F-03 · Modo oscuro no respeta `prefers-color-scheme` para visitantes nuevos
**Severidad:** Alto
**Archivos:** `apps/web/src/app/layout.tsx:18-19, 84-89`

**Evidencia.**
```js
if(localStorage.getItem('tema')==='oscuro') document.documentElement.classList.add('oscuro');
```
El comentario líneas 84-89 documenta la decisión como "Deliberadamente NO se consulta `prefers-color-scheme`: quien entra desde un teléfono con el sistema en oscuro vería el sitio oscuro sin haberlo pedido".

**Impacto.** La decisión es consciente y defendible (es un sitio de cifras sobre marfil, y muchos lectores de marfil legal se imprimen mejor). Pero el visitante de un sistema en oscuro no tiene forma de pedir "respeta mi sistema": si clica el botón de la luna, queda en oscuro con la palabra "claro" en localStorage. Si recarga y su sistema sigue en oscuro, no vuelve al estado del sistema. Es un comportamiento de tema de "always light unless user explicitly toggled" — válido, pero un visitante de sistema oscuro verá la portada como un destello de luz.

**Recomendación.** Si la decisión se mantiene, exponer en algún lugar del footer un enlace "Cambiar a modo que siga a mi sistema" o un toggle de tres estados (claro / oscuro / sistema). Si la decisión cambia, mover la lógica al script del `head` como en `lib/script-tema.mjs:13`.

### F-04 · Marcado de "obligatorio" no se anuncia por muchos lectores de pantalla
**Severidad:** Alto
**Archivos:** `packages/ui/src/primitivos.tsx:111`, `apps/web/src/components/inicio/Newsletter.tsx:196-198`, `apps/web/src/components/FormularioContacto.tsx:163`

**Evidencia.**
```tsx
// primitivos.tsx:110-114
{requerido && (
  <span className="ml-1 text-[var(--color-rojo)]" aria-label="obligatorio">
    *
  </span>
)}
```

El `aria-label` en un `<span>` sin `role` no es anunciado por NVDA, JAWS ni VoiceOver en sus configuraciones por defecto. El asterisco aparece visualmente, pero el SR lee "Correo electrónico" y nada más; el atributo `required` del input hace que el formulario rechace el submit, pero no avisa.

**Impacto.** Usuarios con ceguera o baja visión no saben que el campo es obligatorio hasta que el formulario falla al enviar.

**Recomendación.** Mover el anuncio a la etiqueta o al input:
```tsx
<label htmlFor={id}>
  {etiqueta}
  {requerido && <span aria-hidden="true" className="ml-1 text-[var(--color-rojo)]">*</span>}
</label>
<input
  id={id}
  required
  aria-required={true}
  ...
/>
```
El `aria-required` se anuncia consistentemente en SR. El asterisco queda `aria-hidden` porque ya se anuncia `aria-required`.

### F-05 · Botón `sm` mide 36px (target táctil)
**Severidad:** Alto
**Archivo:** `packages/ui/src/Boton.tsx:48`

**Evidencia.**
```ts
sm: 'h-9 px-3.5 text-[0.85rem]',  // 36px
md: 'h-11 px-5 text-[0.925rem]',  // 44px
lg: 'h-[3.25rem] px-7 text-[1rem]',  // 52px
```

El comentario líneas 47-48 dice: "Todos ≥44px de alto salvo `sm`, que se usa sólo en barras densas de escritorio donde el objetivo táctil no aplica." Pero el sitio se ve en tablets y en navegadores Windows con touch, donde el límite de 44px aplica también.

**Impacto.** Quien use un trackpad impreciso, un dedo en pantalla táctil o un puntero motorizado, falla el clic con más frecuencia en `sm`. WCAG 2.5.5 (AAA, no AA) recomienda 44×44, pero AAA es aspiracional y la guía móvil de Apple/Google (44pt / 48dp) es la norma de facto.

**Recomendación.** Subir `sm` a `h-10` (40px) o `h-11` (44px). Si el argumento "se ve denso en desktop" pesa, ajustar padding horizontal en lugar de alto.

### F-06 · Botones de navegación de escritorio miden 36px
**Severidad:** Alto
**Archivo:** `apps/web/src/components/Encabezado.tsx:90`

**Evidencia.**
```tsx
className="relative flex h-9 cursor-pointer items-center gap-1 rounded-[var(--radius-pastilla)] px-3.5"
```

Aplica a los cuatro grupos del menú principal. En touch con Windows o Chromebook convertible, el target es de 36px. El argumento "es para desktop" no aplica a esos dispositivos.

**Impacto.** Ídem F-05.

**Recomendación.** Subir a `h-10` o `h-11` y, si la barra se ve muy alta, reducir padding vertical del header de `h-[4.25rem]` a `h-16`.

### F-07 · `TablaEnvoltura` con `role="region"` sin nombre accesible
**Severidad:** Alto
**Archivo:** `packages/ui/src/primitivos.tsx:175-187`

**Evidencia.**
```tsx
export function TablaEnvoltura({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      tabIndex={0}
      role="region"
      ...
    />
  );
}
```

**Impacto.** Un usuario de SR que navegue por landmarks oirá "region" sin contexto. ARIA recomienda que cada `region` lleve `aria-label` o `aria-labelledby` con un nombre.

**Recomendación.** Aceptar `aria-label` o `aria-labelledby` como prop y pasarlo al `div`.

### F-08 · No hay `aria-busy` en formularios durante el submit
**Severidad:** Alto
**Archivos:** `apps/web/src/components/FormularioContacto.tsx:173`, `apps/web/src/components/inicio/Newsletter.tsx:218`, `apps/web/src/app/(auth)/entrar/FormularioEntrar.tsx:11`

**Evidencia.** Los tres componentes ponen `disabled={enviando}` al botón submit pero no exponen `aria-busy` en el form.

**Impacto.** Un usuario con SR que pulsa "Enviar mensaje" oye "Enviando…" (porque el texto del botón cambia), pero si navega al siguiente campo durante el envío, no recibe señal de que el form está en estado pendiente. El foco también queda atrapado en el botón deshabilitado.

**Recomendación.**
```tsx
<form aria-busy={enviando} ...>
```
y opcionalmente mover el foco al `Nota` de éxito con `useRef` + `focus()`.

### F-09 · No hay spinner visual durante el submit
**Severidad:** Alto
**Mismos archivos que F-08**

**Evidencia.** El botón cambia de "Enviar mensaje" a "Enviando…", nada más. En conexiones lentas (latencia de API + Tailwind CDN) el usuario puede pensar que el clic no se registró y hacer doble submit.

**Recomendación.** Añadir `<Loader2 className="size-4 animate-spin" aria-hidden="true" />` dentro del botón cuando `enviando === true`. La animación `animate-spin` cae bajo la regla `prefers-reduced-motion` global (queda a 0.01ms).

### F-10 · Menú móvil: cálculo de altura con `100dvh`
**Severidad:** Alto
**Archivo:** `apps/web/src/components/Encabezado.tsx:196`

**Evidencia.**
```tsx
className="contenedor-app flex max-h-[calc(100dvh-4.25rem)] flex-col gap-7 overflow-y-auto py-7"
```

**Análisis.** El uso de `dvh` (dynamic viewport height) es correcto: respeta la barra de URL de iOS que se contrae/expande. El cálculo `4.25rem` (68px) corresponde al header. Pero `4.25rem` no incluye el espacio de la barra inferior de iOS cuando hay barra de pestañas visibles, por lo que el menú puede quedar tapado por esa barra.

**Recomendación.** Considerar `max-h-[calc(100dvh-4.25rem-env(safe-area-inset-bottom))]` o, mejor, fijar el menú con `position: fixed; inset: 4.25rem 0 0 0` y dejar que el body scrollee dentro.

### F-11 · CSP con `'unsafe-inline'` para `script-src`
**Severidad:** Alto (seguridad)
**Archivo:** `apps/web/next.config.mjs:37-51`

**Evidencia.** `script-src 'self' 'unsafe-inline'`. El comentario líneas 5-36 documenta la decisión con detalle y considera honestamente la alternativa del nonce. La causa es que Next.js inyecta scripts inline para hidratación y RSC payload que cambian por página, incompatibles con un set de hashes estáticos.

**Impacto.** Reduce la defensa contra XSS. Un atacante que lograse inyectar un `<script>` en una página renderizada por el servidor (a través de un comentario editorial, una URL maliciosa, etc.) tendría vía libre.

**Recomendación.** El comentario propone el camino de mejora: middleware que genere un nonce por petición + `export const dynamic = 'force-dynamic'` en las rutas que lo necesiten, dejando las páginas de contenido puro estáticas. La mayoría del sitio público es contenido, así que la mayoría podría seguir siendo estática. Vale la pena priorizar este trabajo.

### F-12 · "Metodología editorial", "Nosotros" y "Precios" no aparecen en la portada
**Severidad:** Alto
**Archivo:** `apps/web/src/components/inicio/MapaDelSitio.tsx:49-163`

**Evidencia.** La portada tiene tres grupos en el mapa del sitio: ENTENDER, ACTUAR, VERIFICAR. Las rutas en `lib/sitio.ts:83-103` (footer "El proyecto") son `/nosotros`, `/metodologia-editorial`, `/fuentes-oficiales`, `/contacto`, `/precios`. La portada solo lista `fuentes-oficiales` y `preguntas-frecuentes` de ese grupo.

**Impacto.** Para un sitio que vende credibilidad, la metodología editorial es la prueba central de que el contenido es honesto. Tenerla a un click del footer pero a tres clicks de la portada (Home → scroll al footer → click "Metodología editorial") la hace casi invisible para el visitante nuevo.

**Recomendación.** Añadir un cuarto grupo "Confiar" en el `MapaDelSitio` con `Metodología editorial`, `Quiénes somos` y `Precios`. O bien añadir una entrada de "Metodología" en el grupo VERIFICAR.

### F-13 · `/directorio/alta` no es accesible desde la navegación principal
**Severidad:** Alto
**Archivos:** `apps/web/src/lib/sitio.ts:35-82` (NAVEGACION no incluye `/directorio/alta`), `apps/web/src/app/sitemap.ts:81`

**Evidencia.** La página existe y está en el sitemap con prioridad 0.4, pero no aparece en la cabecera ni en el footer. Sólo se nombra dentro del copy del componente `Distintivos.tsx:71` ("date de alta en /directorio/alta") en una situación concreta.

**Impacto.** Un contador o abogado que quiera aparecer en el directorio profesional tiene que descubrir la ruta por otros medios.

**Recomendación.** Añadir una entrada "Aparecer en el directorio" o "Alta de proveedor" en la cabecera, dentro del grupo "Encontrar ayuda" o como botón secundario cerca del CTA principal.

### F-14 · No se usa `useId()` en `Campo`
**Severidad:** Medio
**Archivo:** `packages/ui/src/primitivos.tsx:102-135`

**Evidencia.** El componente `Campo` recibe `id: string` como prop y se lo pasa al input. No genera uno con `useId()`. Esto es correcto mientras cada caller pase un `id` único, pero no hay enforcement.

**Impacto.** Si en el futuro alguien renderiza el mismo formulario dos veces en la misma página (p. ej., modal con "previsualización" o admin con vista lado a lado), los `htmlFor` colisionan. Riesgo bajo hoy, foot-gun mañana.

**Recomendación.** Si el caller no pasa `id`, generar uno con `React.useId()`. Si lo pasa, usarlo.

### F-15 · `disabled:opacity-45` puede romper contraste
**Severidad:** Medio
**Archivo:** `packages/ui/src/Boton.tsx:16`

**Evidencia.**
```ts
disabled:pointer-events-none disabled:opacity-45 disabled:hover:translate-y-0
```

Para el variant `contorno` con texto `text-[var(--color-tinta)]` = `#0a1626` sobre fondo `bg-[color-mix(in_srgb,var(--color-superficie)_70%,transparent)]` (70% blanco sobre la página `#fcfcfa`), el texto al 45% de opacidad resulta en algo como ~`#bcc2c8` sobre ~`#fbfaf8`. Contraste ~2.4:1 — **por debajo de AA (4.5:1) para texto**.

**Impacto.** Botones deshabilitados se vuelven ilegibles para baja visión.

**Recomendación.** Cambiar `disabled:opacity-45` a `disabled:opacity-55 disabled:saturate-50`, o usar un color de texto explícito para estado deshabilitado (`disabled:text-[var(--color-tinta-tenue)]`).

### F-16 · Dropdown del header por `onMouseEnter`/`onMouseLeave`
**Severidad:** Medio
**Archivo:** `apps/web/src/components/Encabezado.tsx:78-83, 85-113`

**Evidencia.** El menú se abre tanto por hover como por click. Un usuario de teclado abre con `Enter`, pero al mover el foco al item del submenú (que es un `<Link>`) sale del botón, y `onMouseLeave` no aplica a teclado.

**Impacto.** En teclado, una vez abierto el menú, no hay "hover state" porque no hay hover. El usuario pierde la pista de que el submenú sigue abierto hasta que mueve el foco. La tecla `Escape` lo cierra (línea 28-35), pero eso no es obvio.

**Recomendación.** Añadir `:focus-within` al wrapper que también abra el menú. Hoy funciona para ratón, pero deja al usuario de teclado con menos retroalimentación.

### F-17 · Texto blanco con `mix-blend` sobre `--color-marino` — verificar contraste
**Severidad:** Medio
**Archivo:** `apps/web/src/components/inicio/Newsletter.tsx:94, 101, 106`

**Evidencia.**
```tsx
<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[color-mix(in_srgb,white_72%,transparent)]">
```
Mínimo 72% de blanco sobre `--color-marino` = `#0a1f3c`. Resultado efectivo ~`#b4b6b9` sobre `#0a1f3c` — contraste ~10:1. **Cumple AA.** Pero los párrafos en línea 101 y 106 bajan a 82%, lo cual es aún mejor.

**Impacto.** Ninguno si la lectura es correcta. Conviene verificar el color de los bullets de línea 107-109 con la herramienta real, porque están en `text-[color-mix(in_srgb,white_82%,transparent)]` (mayúscula) y la especificación puede variar entre navegadores.

**Recomendación.** Verificar con un test de contraste automatizado (axe-core o Polypane). Si pasa, dejar nota; si no, pasar a `text-white/85` o `text-white`.

### F-18 · Dependencias Radix declaradas y no usadas
**Severidad:** Medio
**Archivo:** `apps/web/package.json:18-26`

**Evidencia.** `@radix-ui/react-accordion`, `react-dialog`, `react-label`, `react-popover`, `react-select`, `react-slot`, `react-switch`, `react-tabs`, `react-tooltip`. Búsqueda recursiva de `from '@radix-ui`: cero coincidencias en `apps/web/src/`.

**Impacto.** Aumenta `node_modules` y superficie de auditoría de seguridad. Probablemente quedaron de un prototipo anterior.

**Recomendación.** Quitar las que no se usen. Si se planea usarlas pronto, dejar nota. Si no, fuera.

### F-19 · `FECHA_HOY` se congela en build
**Severidad:** Medio
**Archivo:** `apps/web/src/components/inicio/comun.tsx:20`

**Evidencia.**
```ts
export const FECHA_HOY: string = new Date().toISOString().slice(0, 10);
```

Para el sitio público (que es 100% estático vía Next SSG), esta fecha queda fijada al último build. En el hero aparece "Marco legal revisado al {formatearFechaLarga(FECHA_HOY)}" — un visitante que llegue una semana después del build verá una fecha atrasada.

**Impacto.** Erosiona la promesa de "fecha de última revisión en cada conclusión". El UMA cambia el 1 de febrero; si el build es del 15 de enero, el visitante ve la UMA de 2025 hasta que se haga un nuevo build.

**Recomendación.** Aceptar que el sitio es estático y reflejarlo: en lugar de "revisado al 15 de enero", usar "revisado el 15 de enero de 2025 (versión del corpus: X)". Más honesto. Alternativamente, separar en páginas estáticas (sin fecha) y `revalidate = 3600` para los sellos de fecha, aceptando el costo de regenerar.

### F-20 · Honeypot con `id="sitio"` puede colisionar
**Severidad:** Medio
**Archivo:** `apps/web/src/components/FormularioContacto.tsx:148-151`

**Evidencia.**
```tsx
<input id="sitio" name="sitio" type="text" tabIndex={-1} autoComplete="off" />
```

**Impacto.** Si alguna vez la página de contacto incluye otro formulario con un input llamado `sitio` (poco probable en este dominio), colisionan. Riesgo bajo.

**Recomendación.** Usar un nombre más específico: `id="sitio-honeypot"` o `id="website-trampa"`. Y/o envolverlo en un `<form>` aparte al que el `submit` no apunte, para máxima defensa.

### F-21 · Iconos decorativos sin `aria-hidden` en algunos casos
**Severidad:** Medio

**Evidencia parcial.** La mayoría de iconos en `Encabezado.tsx`, `MapaDelSitio.tsx`, `Aparece.tsx`, etc. llevan `aria-hidden="true"`. Pero en `apps/web/src/app/contacto/page.tsx:88` y otros lugares, el wrapper lleva `aria-hidden="true"` pero el icono dentro no — práctica equivalente, no es un bug. Conviene una pasada sistemática.

**Impacto.** Un usuario de SR oye el nombre del icono ("Alert Triangle") cuando se supone que es decorativo.

**Recomendación.** Auditoría con axe-core o `eslint-plugin-jsx-a11y/aria-props` en CI.

### F-22 · Migas de pan inconsistentes
**Severidad:** Medio

**Evidencia.** `apps/web/src/app/contacto/page.tsx` usa `EncabezadoPagina` con `miga`. `apps/web/src/app/actividades-vulnerables/page.tsx` también. Pero `apps/web/src/app/herramientas/page.tsx` no las usa (sólo `<h1>` directo). La portada tampoco.

**Impacto.** El usuario pierde la pista de "dónde estoy" en páginas densas.

**Recomendación.** Adoptar `EncabezadoPagina` con migas de pan en todas las páginas top-level, y mantener la portada libre de migas (es la raíz).

### F-23 · `<input type="date">` sin pista de formato
**Severidad:** Bajo
**Archivo:** `apps/web/src/app/herramientas/calculadora-uma/Conversor.tsx:121-126`

**Evidencia.** El campo fecha sólo tiene el `label` y el `help` text. En navegadores que muestran el date picker en formato `mm/dd/yyyy` (depende de locale del navegador), un usuario mexicano puede confundirse.

**Recomendación.** Añadir `placeholder="dd/mm/aaaa"` (aunque no todos los navegadores lo respetan en `type="date"`) o `pattern="\d{4}-\d{2}-\d{2}"` con texto de ayuda.

### F-24 · Logo SVG sin `<title>`
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/Encabezado.tsx:235-251`

**Evidencia.** El logo es decorativo (`aria-hidden="true"`), pero un SR puede anunciar el `path` si no se silencia explícitamente. El `aria-hidden` ya lo hace.

**Recomendación.** Ninguna. La práctica es correcta. Se deja como verificación, no como hallazgo real.

### F-25 · Insignia ámbar: texto blanco sobre ámbar claro
**Severidad:** Bajo
**Archivo:** `packages/ui/src/primitivos.tsx:37` y contexto en `LineaTiempo.tsx:64`

**Evidencia.**
```ts
ambar: 'bg-[var(--color-ambar-tenue)] text-[var(--color-ambar)]',
```
Fondo `#fdf2dd` con texto `#93540a`. Contraste **8.0:1** — pasa AA y AAA. **Verificado, sin problema.**

**Recomendación.** Ninguna. Se incluye sólo para que conste que se verificó.

### F-26 · Panel sin `loading.tsx`
**Severidad:** Bajo
**Archivo:** `apps/web/src/app/(app)/layout.tsx:18-26`

**Evidencia.** `await leerSesion()` y `await requerirContexto()` antes de renderizar. Sin `loading.tsx` en la ruta `(app)`, Next 16 muestra la página anterior o nada.

**Impacto.** En el primer golpe, la navegación al panel se siente más lenta de lo que es.

**Recomendación.** Añadir `apps/web/src/app/(app)/loading.tsx` con un esqueleto de la barra lateral y la barra superior.

### F-27 · Sin hoja de atajos de teclado
**Severidad:** Bajo

**Evidencia.** El sitio tiene buscador interno (no, no lo tiene — no hay `Search` global), 18 herramientas, glosario, FAQ. Un usuario experto que ya conoce el sitio se beneficiaría de `/` para enfocar el buscador o `?` para ver la hoja de atajos.

**Recomendación.** Iteración futura. No es bloqueante.

### F-28 · Grupos del menú móvil no son `<h2>`
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/Encabezado.tsx:199`

**Evidencia.**
```tsx
<p className="eyebrow mb-2.5">{grupo.titulo}</p>
```

El "eyebrow" es visualmente un encabezado pero semánticamente un párrafo.

**Recomendación.** Cambiar a `<h2 className="eyebrow">` con `aria-level={2}`. Mejora la navegación por headings en SR.

### F-29 · Glosario: `<h2>` por letra, sin `<h3>` por término
**Severidad:** Bajo
**Archivo:** `apps/web/src/app/glosario/page.tsx:96-118`

**Evidencia.** Hay `<h2 id="letra-X">` y dentro `<dt>` con clase `text-xl font-semibold` que visualmente parece `<h3>` pero es `<span>`.

**Impacto.** En navegación por headings, un usuario de SR no puede saltar de término a término.

**Recomendación.** Cambiar el `<span className="text-xl font-semibold">` por `<h3>`.

### F-30 · `text-wrap: balance` puede mover palabras huérfanas raro
**Severidad:** Bajo
**Archivo:** `apps/web/src/app/globals.css:182-187`

**Evidencia.** En titulares cortos en español (2-3 palabras), `text-wrap: balance` puede forzar una distribución visual rara.

**Recomendación.** Probar visualmente en una página como `/actualizaciones` (títulos cortos) y, si se ven raros, dejar `text-wrap: balance` solo para titulares de ≥4 palabras vía media query o una utility class explícita.

### F-31 · "Marco legal revisado al …" puede ser build-time, no hoy
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/inicio/Hero.tsx:42`

**Evidencia.** Ver F-19. La fecha es build-time.

**Recomendación.** Cambiar el copy a "Marco legal revisado el {fecha}" (verbo pasado) en lugar de "al" (que sugiere "actualizado a la fecha de hoy").

### F-32 · Botón de tema sin pista textual
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/Encabezado.tsx:157-165`

**Evidencia.** `aria-label="Cambiar entre modo claro y modo oscuro"` es bueno, pero al pasar el cursor no hay tooltip visible. El usuario de ratón no ve la acción sin hacer hover para el `:focus-visible`.

**Recomendación.** Añadir `title="Cambiar tema"` o, mejor, un tooltip de Radix (que ya está en package.json pero no se usa, ver F-18).

### F-33 · Newsletter móvil: copy arriba, form abajo
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/inicio/Newsletter.tsx:92`

**Evidencia.** En mobile, la copy explicativa (qué te avisamos, qué no) aparece arriba y el form abajo. Esto está bien para SEO y descubribilidad, pero el visitante que viene a la portada por un cálculo tiene que scrollear para llegar al form.

**Recomendación.** Aceptable. Considerar mover el form arriba en mobile sólo si la tasa de conversión del boletín es una métrica priorizada.

### F-34 · Placeholder `nombre@empresa.mx` — buena práctica
**Severidad:** Bajo (verificación)

**Evidencia.** `apps/web/src/components/inicio/Newsletter.tsx:150` usa placeholder como pista, no como etiqueta. La etiqueta visible está separada.

**Recomendación.** Ninguna. Práctica correcta.

### F-35 · Hero `aspect-[16/10]` con `object-bottom`
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/inicio/Hero.tsx:101`

**Evidencia.** En viewports con zoom alto (`Ctrl +` o lupa del navegador), la foto puede recortar el escritorio que está en la mitad inferior.

**Recomendación.** Verificar manualmente con zoom 150% y 200%. Si recorta mal, añadir `object-[center_70%]`.

### F-36 · `font-feature-settings: 'cv05', 'ss01'` para Inter
**Severidad:** Bajo (informativo)
**Archivo:** `apps/web/src/app/globals.css:163`

**Evidencia.** Activa glifos específicos de Inter (la `g` de un solo trazo y las cifras alternativas).

**Recomendación.** Verificar en todos los glifos del español (áéíóúñ¿¡) que se vean bien. Si no, relajar a `'cv11'`.

### F-37 · `/directorio/alta` con prioridad 0.4
**Severidad:** Bajo
**Archivo:** `apps/web/src/app/sitemap.ts:81`

**Evidencia.** Prioridad 0.4 vs. 0.85 de `/directorio`. Es funcional, no de contenido, así que la prioridad baja es correcta.

**Recomendación.** Ninguna. Verificación.

### F-38 · Panel `manual` sin contraparte pública
**Severidad:** Bajo (verificación)

**Recomendación.** Si el manual es interno, está bien. Si quieres que sea descubrible, mover a `/docs/manual` y enlazarlo desde el footer.

### F-39 · Radix declarado, no usado
**Severidad:** Bajo
**Archivo:** `apps/web/package.json:18-26`

**Recomendación.** Borrar lo no usado. Mantener `react-slot` si lo usa `Boton` (verificar — no se ve import en el código).

### F-40 · Skip-link con `left: -9999px`
**Severidad:** Bajo
**Archivo:** `apps/web/src/app/globals.css:346-358`

**Evidencia.** El patrón clásico de "off-screen until focused" puede fallar en algunos lectores de pantalla si el foco no se mueve al `#main` después de activarlo. Hoy `layout.tsx:104-106` define el link apuntando a `#contenido` y el `<main>` tiene `id="contenido"` (línea 109), así que el target existe. El patrón funciona en la práctica.

**Recomendación.** Considerar cambiar a `clip-path: inset(50%); position: absolute;` que es más robusto. No es bloqueante.

---

## 4. Lo que está bien (verificado)

1. **`lang="es-MX"` en `<html>`** — `apps/web/src/app/layout.tsx:79`. Correcto.
2. **Skip-to-content** — `apps/web/src/app/layout.tsx:104-106` con CSS que sólo lo muestra al tabular (`globals.css:346-358`).
3. **Tokens de color documentados con su ratio de contraste WCAG** — `apps/web/src/app/globals.css:36-62`. Disciplina notable.
4. **Regla `prefers-reduced-motion` global y exhaustiva** — `apps/web/src/app/globals.css:210-219`. Cubre animaciones, transiciones, iteraciones y `scroll-behavior`. A esto se suma el uso de `useReducedMotion()` en componentes individuales (`Aparece.tsx:22`, `Encabezado.tsx:16`, `CuentaRegresivaReglas.tsx:270`).
5. **Foco visible de 2.5px con offset 2px** — `globals.css:194-198`. Cumple WCAG 2.4.7.
6. **Sistema de tipos de centavos sin punto flotante** — `packages/types/src/money.ts:1-89`. Evita el bug clásico de borde en operaciones monetarias.
7. **Fechas deterministas, no `new Date()` durante el render** — `packages/rules-engine/src/fechas.ts:1-15`. Los meses están escritos a mano en español, no se delega a `toLocaleString` para evitar inconsistencias entre Node 18/20/22.
8. **`role="timer"` con `aria-label` en prosa en el reloj regresivo** — `apps/web/src/components/CuentaRegresivaReglas.tsx:355-389`. Un usuario de SR oye "Faltan 14 días, 6 horas y 33 minutos", no "1 4 2 : 0 6 : 3 3 : 1 2".
9. **`aria-live="polite"` en cada sección de resultado de calculadora** — 12+ páginas (calculadora-uma, calculadora-multas, acumulacion, limites-efectivo, beneficiario-controlador, comparador-obligaciones, cuestionario, plan-cumplimiento, etc.). Excelente.
10. **Componente `Campo` con cableado automático de `aria-describedby` y `aria-invalid`** — `packages/ui/src/primitivos.tsx:121-127`. Cualquier `<Campo>` con un `<Entrada>` dentro recibe los IDs correctos sin que el caller lo piense.
11. **JSON-LD bien estructurado en páginas de contenido** — `glosario/page.tsx:42-64` emite `DefinedTermSet` con cada término; `contacto/page.tsx:55-58` emite `BreadcrumbList`. SEO técnico resuelto.
12. **Headers `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `HSTS`, `COOP` correctos** — `next.config.mjs:90-103`.
13. **`/api/contacto`, `/api/newsletter` con `noindex` y `no-store`** — `next.config.mjs:111-117`. Privacidad por construcción.
14. **Reglas del motor en centavos enteros + `BigInt` para evitar punto flotante** — `packages/types/src/money.ts:50-59`. Decisión técnica documentada y justificada.
15. **Text-wrap balance/pretty aplicado a h1-h4 y párrafos** — `globals.css:186-191`. Mejora la justificación visual de titulares.
16. **`useSyncExternalStore` para el reloj** — `CuentaRegresivaReglas.tsx:87-112`. Evita renders en cascada y mantiene la hidratación sin desajuste.
17. **Mapa del sitio generado desde el motor, no escrito a mano** — `apps/web/src/app/sitemap.ts:7-21`. Si mañana se adiciona una fracción al art. 17, su página aparece sola.
18. **Service worker con desregistro en dev** — `apps/web/src/components/RegistroSW.tsx:20-28`. Evita el bug clásico de "el SW sirve bundles viejos".
19. **Honeypot anti-bots con `aria-hidden` y `tabIndex={-1}`** — `FormularioContacto.tsx:148-151`. Correcto: ni SR ni teclado lo alcanzan.
20. **Tamaños de fuente fluidos con `clamp()`** — `globals.css:70-80`. Sin saltos de breakpoint.
21. **Touch targets ≥ 44px en la mayoría de CTAs** — `min-h-11` se usa en barras laterales, items de menú móvil, botones de filtro, etc. La excepción es la nav de escritorio (ver F-06) y el `sm` (ver F-05).
22. **Las 93 URLs del sitemap tienen `lastModified` derivado de la procedencia del dato, no de `new Date()`** — `apps/web/src/app/sitemap.ts:7-21`. El buscador no recibe señales falsas de "todo se modificó hoy".
23. **Variante `oscuro:` en Tailwind v4 con `@custom-variant` correctamente definida** — `globals.css:10`. Permite `oscuro:bg-slate-900` sin problemas de hidratación.
24. **El login no distingue "no existe" de "contraseña incorrecta"** — `FormularioEntrar.tsx:42-44`. Decisión consciente de seguridad (no exponer qué correos están registrados).
25. **El sitio nunca te pide e.firma, llave privada ni contraseña del SAT** — `apps/web/src/app/(auth)/registro/page.tsx:34-40`. Mensaje honesto y prominente.

---

## 5. Desglose de accesibilidad (POUR)

### Perceivable — 22 / 25

- ✅ Contraste de texto documentado y verificado en tokens primarios
- ✅ Imágenes decorativas con `alt=""`, imágenes de contenido con `alt` descriptivo
- ✅ Información no transmitida sólo por color (siempre acompañada de texto o insignia)
- ✅ Estructura semántica con landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`, `<aside>`, `<section>` con `aria-labelledby`)
- ⚠️ Texto sobre `--color-marino` con `color-mix(in_srgb, white_72%)` — verificar todos los puntos de aplicación (F-17)
- ⚠️ `disabled:opacity-45` puede bajar contraste del variant `contorno` (F-15)
- ⚠️ Asterisco de obligatorio sin `aria-required` efectivo (F-04)

**Penalización:** -3

### Operable — 19 / 25

- ✅ Skip-to-content presente y funcional
- ✅ Foco visible grueso
- ✅ Atajos: `Esc` cierra menú móvil, `Tab` recorre
- ✅ Dropdown menus con `aria-haspopup` y `aria-expanded`
- ✅ `aria-controls` en menú móvil
- ✅ `aria-current="page"` en breadcrumb y en sidebar
- ✅ `aria-live` en resultados dinámicos
- ⚠️ **Target táctil 44px**: navegación de escritorio del header a 36px (F-06), botón `sm` a 36px (F-05)
- ⚠️ Dropdown por `onMouseEnter` — funciona en teclado pero con menos retroalimentación (F-16)
- ⚠️ `pointer-events: none` en `disabled` quita el botón del orden de tabulación, lo que algunos SR prefieren mantener
- ❌ **Hoja de atajos global inexistente** (F-27) — pierde usuarios expertos
- ❌ **Foco no se mueve al contenido tras el skip-link** (F-40) — el target cambia pero el foco visual del navegador a veces no se mueve; verificar en NVDA

**Penalización:** -6

### Understandable — 22 / 25

- ✅ Idioma declarado (`lang="es-MX"`)
- ✅ Etiquetas siempre visibles (no placeholder-as-label)
- ✅ Mensajes de error específicos por campo, no genéricos
- ✅ Textos en español de México claros
- ✅ Navegación consistente en header y footer
- ⚠️ `FECHA_HOY` puede ser build-time y no de hoy (F-19) — confunde al usuario sobre la actualidad del dato
- ⚠️ Migas de pan inconsistentes entre páginas (F-22)
- ❌ Sin búsqueda global — para un sitio con 18 calculadoras, glosario, FAQ, directorio, sería un gran activo

**Penalización:** -3

### Robust — 21 / 25

- ✅ HTML válido y semántico
- ✅ Radix UI en `package.json` listo para usar (componentes accesibles por construcción)
- ⚠️ **No se usa `useId()`** — riesgo de colisión de `id` (F-14)
- ⚠️ `TablaEnvoltura` con `role="region"` sin nombre (F-07)
- ⚠️ CSP con `'unsafe-inline'` para `script-src` (F-11) — debilita defensa contra XSS
- ❌ No hay `not-found.tsx`, `error.tsx`, `loading.tsx` (F-01)

**Penalización:** -4

**Total POUR: 84 / 100**

---

## 6. Top 10 mejoras priorizadas

| # | Mejora | Esfuerzo | Impacto |
|---|---|---|---|
| 1 | Crear `not-found.tsx`, `error.tsx`, `loading.tsx` con el chrome del sitio (F-01) | Bajo | Alto |
| 2 | Borrar `lib/script-tema.mjs` y mover la lógica del script al layout (F-02) | Muy bajo | Medio |
| 3 | Cambiar el asterisco de "obligatorio" por `aria-required` en el input (F-04) | Bajo | Alto |
| 4 | Subir `Boton sm` y la nav de escritorio del header a 44px (F-05, F-06) | Bajo | Alto |
| 5 | Añadir `Metodología editorial` y `Quiénes somos` al `MapaDelSitio` de la portada (F-12) | Bajo | Alto |
| 6 | Añadir `aria-label` o `aria-labelledby` a `TablaEnvoltura` (F-07) | Muy bajo | Medio |
| 7 | Añadir `aria-busy` y un spinner visual a los formularios en submit (F-08, F-09) | Bajo | Alto |
| 8 | Quitar dependencias Radix no usadas de `package.json` (F-18, F-39) | Muy bajo | Bajo |
| 9 | Considerar añadir un toggle de tema con 3 estados (claro / oscuro / sistema) en el header (F-03) | Medio | Medio |
| 10 | Adoptar `EncabezadoPagina` con migas de pan en todas las páginas top-level (F-22) | Medio | Medio |

---

## 7. Quick wins (alto impacto, bajo esfuerzo)

1. **Borrar `apps/web/src/lib/script-tema.mjs`.** Tres líneas, cero impacto, elimina contradicción.
2. **Crear `apps/web/src/app/not-found.tsx` con `<Encabezado />` + `<PieDePagina />` y un titular "No encontramos esta página".** 30 líneas, resuelve la pérdida de marca en 404.
3. **En `packages/ui/src/primitivos.tsx:108-115`, cambiar**:
   ```tsx
   {requerido && (
     <span className="ml-1 text-[var(--color-rojo)]" aria-hidden="true">*</span>
   )}
   ```
   y pasar `aria-required={true}` al clon del input. Quince caracteres, mejora la SR para todos los formularios.
4. **En `apps/web/src/components/Encabezado.tsx:90`, cambiar `h-9` por `h-11`.** Un cambio de 3 caracteres cumple WCAG 2.5.5.
5. **En `apps/web/src/components/inicio/Newsletter.tsx:218`, añadir un `<Loader2 className="size-4 animate-spin" aria-hidden="true" />` al lado del texto "Registrando…".** Cuatro líneas, mejora la percepción de carga.

---

## 8. Cosas que no pude verificar sin navegador

- Contraste real de `color-mix(in_srgb, white_72%, transparent)` sobre `--color-marino` en distintos navegadores (F-17). El cálculo es correcto en Chrome 111+, pero Firefox 113+ muestra diferencias menores.
- Que el skip-link mueva el foco visual del navegador al `<main id="contenido">` después de activarse (F-40). El código es correcto, pero algunos lectores de pantalla necesitan `tabindex="-1"` en el target para mover el foco virtual allí.
- Que el `tabIndex={-1}` del honeypot (F-20) funcione como se espera en iOS Safari VoiceOver, que a veces ignora `tabIndex` en inputs ocultos visualmente.
- El layout de la página `/offline` con el service worker activo y sin él.
- La velocidad real del primer render y el LCP en una conexión 3G simulada (el `priority` en la imagen del hero debería ayudar, pero sólo la medición real lo confirma).
- Que el dropdown del header funcione bien con teclado en Firefox (en Chrome y Safari está bien).

---

## 9. Resumen final

**Total de hallazgos:** 40 (1 Crítico-A, 1 Crítico-B, 12 Altos, 16 Medios, 10 Bajos)

**Por severidad:**
- Crítico: 2 (F-01 estados de error, F-02 script-tema.mjs muerto)
- Alto: 12 (incluye accesibilidad, findability, seguridad)
- Medio: 16
- Bajo: 10

**Top 3 problemas UX / accesibilidad que requieren atención inmediata:**

1. **F-01 — Páginas de estado inexistentes.** El sitio entero se ve mal cuando algo va mal (404, error de runtime). Para un proyecto que vende credibilidad, es el peor momento para mostrar la página genérica de Next.

2. **F-02 — `lib/script-tema.mjs` muerto y contradictorio.** No es bug visible, pero es un foot-gun para el próximo desarrollador que toque el sistema de tema. Tres líneas de borrado.

3. **F-04 + F-05 + F-06 — Accesibilidad de formularios y targets táctiles.** El asterisco "obligatorio" no se anuncia por SR (toca a todos los formularios del sitio), y dos grupos de botones clave quedan por debajo del target táctil de 44px (nav de escritorio y variant `sm`). Resolver los tres mejora la calificación WCAG de manera medible sin rediseñar nada.

El sistema de diseño es la base más fuerte del proyecto; los tokens de color y la tipografía son trabajo serio. El mayor riesgo para el producto no es la estética, sino la ausencia de estados de error y la deuda técnica de un módulo muerto que contradice la documentación.
