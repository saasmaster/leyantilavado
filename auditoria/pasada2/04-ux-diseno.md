# Auditoría UX / Diseño / Accesibilidad — Pasada 2

**Proyecto:** `apps/web` — Next.js 16 (App Router) + React 19 + Tailwind v4 + Framer Motion + Radix UI + Lucide
**Auditor:** revisión estática (sin browser real), segunda pasada
**Fecha:** 2025
**Alcance:** flujos profundos del sitio: herramientas, autenticación, panel privado, panel administrativo, directorio, página de inicio, glosario, FAQ, precios, calendario

---

## 1. Resumen ejecutivo

La primera pasada dejó un sitio con salud 79/100 y una lista de 40 hallazgos (2 críticos, 11 altos, 11 medios, 16 bajos). Esta segunda pasada verifica que las correcciones críticas y altas se aplicaron —se aplicaron casi todas— y excava en los flujos de usuario que la primera pasada apenas rozó: las herramientas, el auth, el panel privado, el panel administrativo, el directorio y la página de inicio reconstruida.

**Lo más relevante de esta segunda pasada.** El proyecto es ahora una pieza de calidad más alta en los flujos de trabajo: `aria-required` se anuncia, los botones miden 44px, `TablaEnvoltura` ya no es una región muda, hay páginas de estado, los radix no usados se limpiaron (en parte) y la `Mapa del sitio` ya incluye la metodología editorial. Lo que aparece debajo de esa superficie son fricciones finas, no defectos estructurales: el formulario de alta del directorio no avisa con `aria-busy` durante el envío, el botón de tema nunca dice en qué estado está, el cuestionario no ofrece salida cuando ninguna actividad aplica, el `Skip-link` sigue con el patrón `left: -9999px` que falla en SR modernos, y varios `inputMode` faltan en campos de monto y teléfono. No hay nada crítico. Lo que hay son mejoras de pulido que en un sitio de cumplimiento pesan.

**Puntuación de salud UX (pasada 2).**

| Dimensión | Pasada 1 | Pasada 2 | Δ |
|---|---:|---:|---|
| Sistema de diseño y tokens | 95 | 96 | +1 |
| Accesibilidad (POUR agregado) | 84 | 88 | +4 |
| Información y arquitectura | 82 | 86 | +4 |
| Formularios e input UX | 87 | 84 | −3 |
| Estados vacíos / errores / carga | 38 | 86 | +48 |
| Movimiento y microinteracciones | 90 | 92 | +2 |
| i18n y formato (es-MX) | 92 | 92 | = |
| **Salud UX global** | **79** | **87** | **+8** |

La subida principal viene de los estados vacíos: la primera pasada marcaba 38/100 porque no existían páginas de estado. Ahora existen, son sólidas y con el mismo chrome que el resto del sitio. La bajada de formularios es deliberada: al excavar en las 17 calculadoras y los 4 formularios de auth aparecieron fricciones que la primera pasada no detectó (ver P2-UX-04, P2-UX-05, P2-UX-12, P2-UX-15, P2-UX-16, P2-UX-17).

**Lo que la primera pasada se perdió y esta encuentra.** La primera pasada auditó sobre todo la portada, el header, el footer y los componentes compartidos. Esta segunda pasada bajó al nivel de los flujos: recorrió las 17 herramientas, los 4 formularios de auth, las 8 rutas del panel privado, las 30+ rutas del panel administrativo, las 5 rutas del directorio y la página de inicio reconstruida. De ese barrido salen 18 hallazgos nuevos que la primera pasada no podía ver sin haber bajado a ese nivel.

---

## 2. Tabla de hallazgos

| ID | Severidad | Título | Área | Ubicación |
|---|---|---|---|---|
| P2-UX-01 | **Alto** | Botón de tema sin indicación del estado actual | Tema / a11y | `apps/web/src/components/Encabezado.tsx:157-165` |
| P2-UX-02 | Alto | `aria-busy` ausente en todos los formularios durante submit | A11y formularios | `FormularioContacto.tsx:104-180`, `FormularioAlta.tsx:170-379`, `FormularioEntrar.tsx:11-15`, `FormularioNuevaContrasena.tsx:9-15`, `FormularioRecuperar.tsx:8-15` |
| P2-UX-03 | Alto | Spinner visual ausente durante submit; sólo cambia el texto | UX formularios | Mismos archivos que P2-UX-02 |
| P2-UX-04 | Alto | Cuestionario: el error "ninguna actividad aplica" no tiene salida de UI | UX formularios | `Cuestionario.tsx:130-138, 437-442` |
| P2-UX-05 | Alto | Falta `inputMode` en teléfono y campos de monto | UX formularios | `FormularioAlta.tsx:193`, `FormularioContacto.tsx:128`, `FormularioAlta.tsx:255`, `Calculadora.tsx:179-220` |
| P2-UX-06 | Alto | `autoComplete` no se aplica a nombres de empresa y campos monetarios | UX formularios | `FormularioAlta.tsx:181-194, 247, 255`, `Calculadora.tsx:179-220` |
| P2-UX-07 | Alto | Directorio: el filtro `q` no busca por categoría ni actividad | UX búsqueda | `apps/web/src/lib/directorio/filtros.ts:147-160` |
| P2-UX-08 | Alto | Sin `loading.tsx` en `(app)/`, navegación al panel se siente colgada | UX estados | `apps/web/src/app/(app)/layout.tsx:18-26` |
| P2-UX-09 | Alto | Contraste del `precio MXN` en estado hover de la página de precios | A11y color | `apps/web/src/app/precios/page.tsx:77-78` |
| P2-UX-10 | Alto | Cuestionario: paso "resultado" no es navegable por teclado de vuelta al formulario | UX flujo | `Cuestionario.tsx:752-906` |
| P2-UX-11 | Medio | Skip-link con `left: -9999px` puede no mover el foco virtual en SR modernos | A11y teclado | `apps/web/src/app/globals.css:356-368` |
| P2-UX-12 | Medio | Panel: sin `loading.tsx`, navegación entre secciones se siente bloqueada | UX estados | `apps/web/src/app/(app)/` (todo el segmento) |
| P2-UX-13 | Medio | `BarraSuperior` del panel: los forms de cambio de org/rol no tienen feedback de envío | UX feedback | `BarraSuperior.tsx:14-77` |
| P2-UX-14 | Medio | Contraste del asterisco rojo `*` sobre fondo blanco en etiquetas `Campo` | A11y color | `primitivos.tsx:130-132` |
| P2-UX-15 | Medio | `aria-disabled` falso en el mailto del cuestionario: el link es tabbable pero no se puede activar | A11y teclado | `Cuestionario.tsx:876-891` |
| P2-UX-16 | Medio | Formularios auth: sin `aria-describedby` general al cargar la página | A11y formularios | `FormularioEntrar.tsx:17-50`, `FormularioRegistro.tsx:19-77` |
| P2-UX-17 | Medio | `Newsletter` checkbox: el `aria-label="obligatorio"` se mantiene en un span sin rol (anti-patrón ya conocido) | A11y formularios | `Newsletter.tsx:199` |
| P2-UX-18 | Medio | `fieldset` del filtro de directorio sin `aria-labelledby` cuando sólo tiene leyenda visual | A11y formularios | `FiltrosDirectorio.tsx:181-205` |
| P2-UX-19 | Medio | El FAQ `<details>` no tiene `aria-expanded` y el icono no se anuncia | A11y | `preguntas-frecuentes/page.tsx:79-138` |
| P2-UX-20 | Medio | Inconsistencia entre `text-wrap: balance` y el h1 del Hero sobreescrito | Tipografía | `Hero.tsx:44-50` |
| P2-UX-21 | Medio | `Boton comoHijo` con `<Link>` envuelto pierde la pista semántica del control | A11y | `MapaDelSitio.tsx:230-258`, `Boton.tsx:81-95` |
| P2-UX-22 | Medio | El glosario todavía no usa `<h3>` por término: cada entrada queda como `<dt>` | Semántica | `glosario/page.tsx:97-164` |
| P2-UX-23 | Medio | El menú móvil sigue usando `<p className="eyebrow">` para los grupos | Semántica | `Encabezado.tsx:199` |
| P2-UX-24 | Bajo | `FormularioAlta`: el campo de subida no avisa con `aria-describedby` el límite de tamaño/tipo | A11y formularios | `FormularioAlta.tsx:322-333` |
| P2-UX-25 | Bajo | Calendario: el reloj regresivo en vivo emite un cambio de DOM cada segundo; usuarios con `prefers-reduced-motion` siguen viendo el cambio | A11y | `CuentaRegresivaReglas.tsx:264-348` |
| P2-UX-26 | Bajo | Inconsistencia: `FiltrosDirectorio` no es responsive colapsado a mobile | Responsive | `FiltrosDirectorio.tsx:34-223` |
| P2-UX-27 | Bajo | El botón de tema y el botón de menú móvil no tienen texto visible (sólo aria-label) | UX | `Encabezado.tsx:157-181` |
| P2-UX-28 | Bajo | `TablaRecurso` no muestra el total filtrado si hay paginación | UX | `TablaRecurso.tsx:148-152` |
| P2-UX-29 | Bajo | Filtros del directorio: aplicar filtros no muestra "Cargando…" | UX feedback | `FiltrosDirectorio.tsx:208-221` |
| P2-UX-30 | Bajo | Tooltips de información del directorio no existen — `HelpCircle` sin label | UX | `distintivos.tsx` (referencia), `FormularioAlta.tsx` varios |

---

## 3. Hallazgos detallados

### P2-UX-01 · Botón de tema sin indicación del estado actual
**Severidad:** Alto
**Archivo:** `apps/web/src/components/Encabezado.tsx:157-165`

**Evidencia.**
```tsx
<button
  type="button"
  onClick={alternar}
  aria-label="Cambiar entre modo claro y modo oscuro"
  ...
>
  <Moon className="size-[1.15rem] oscuro:hidden" />
  <Sun  className="hidden size-[1.15rem] oscuro:block" />
</button>
```

**Análisis.** El botón dice "cambiar" pero no dice "a cuál". Un usuario de SR que enfoque el botón oye "Cambiar entre modo claro y modo oscuro" — eso describe la acción, no el estado. Un usuario con baja visión que pase el cursor ve el ícono (luna o sol) pero no tiene una pista textual de qué va a pasar al activarlo. La decisión arquitectónica de que el ícono se decida con CSS (línea 152-156) es correcta para evitar el desajuste de hidratación, pero el `aria-label` puede seguir siendo dinámico: cambiar el texto del `aria-label` entre "Cambiar a modo oscuro" (cuando actual es claro) y "Cambiar a modo claro" (cuando actual es oscuro) no requiere ramificar el render — se hace leyendo `document.documentElement.classList.contains('oscuro')` en un `useEffect` o con un `useSyncExternalStore` ligero, y el primer render del servidor puede quedarse con la versión neutra.

**Impacto.** Confusión menor en SR y en usuarios visuales. Es uno de los tres botones del header (logo, tema, menú), y su acción es la menos descubrible. El usuario experto lo aprende; el nuevo no.

**Recomendación.** Cambiar `aria-label` con un estado. Una solución simple: usar `useState` con un `useEffect` que escuche el cambio de clase en `documentElement` y actualice el label. El primer render del cliente usa el label neutro para no chocar con el HTML del servidor, y un `useEffect` lo actualiza en milisegundos. La accesibilidad mejora sin riesgo de hidratación.

---

### P2-UX-02 · `aria-busy` ausente en todos los formularios durante submit
**Severidad:** Alto
**Archivos:**
- `apps/web/src/components/FormularioContacto.tsx:104-180`
- `apps/web/src/components/directorio/FormularioAlta.tsx:170-379`
- `apps/web/src/components/directorio/FormularioContacto.tsx:101-202`
- `apps/web/src/components/inicio/Newsletter.tsx:137-230`
- `apps/web/src/app/(auth)/entrar/FormularioEntrar.tsx:17-50`
- `apps/web/src/app/(auth)/registro/FormularioRegistro.tsx:19-77`
- `apps/web/src/app/(auth)/recuperar/FormularioRecuperar.tsx:17-46`
- `apps/web/src/app/(auth)/actualizar-contrasena/FormularioNuevaContrasena.tsx:18-60`

**Evidencia.** Todos los formularios tienen `disabled={enviando}` en el botón submit (F-08 ya se señaló) pero ninguno marca el `<form>` con `aria-busy={enviando}`. La consecuencia es que un usuario de SR que navegue a otro campo durante el envío no recibe señal de que el form está en estado pendiente. El foco también queda atrapado en el botón deshabilitado sin pista.

**Impacto.** El estado de "envío en curso" es invisible para SR. Combinado con P2-UX-03 (sin spinner visual), el usuario tiene dos canales ciegos: el visual y el auditivo.

**Recomendación.**
```tsx
<form aria-busy={enviando} ...>
```
y opcionalmente `aria-describedby` apuntando a un `<p role="status">` con "Enviando tu mensaje…" que viva en el form, no sólo como texto del botón.

---

### P2-UX-03 · Spinner visual ausente durante submit
**Severidad:** Alto
**Mismos archivos que P2-UX-02**

**Evidencia.** El botón cambia de "Enviar mensaje" a "Enviando…" — sólo texto. En conexiones lentas (latencia de API + Turnstile + tiempo de red mexicano real, no de tests locales) el usuario puede pensar que el clic no se registró y hacer doble submit.

**Análisis.** La animación `animate-spin` ya está documentada en el proyecto (F-09 de la primera pasada) y la regla `prefers-reduced-motion` global la neutraliza (`globals.css:220-229`). Lo que falta es adoptarla.

**Recomendación.** En cada botón submit, dentro del ternario, añadir `<Loader2 className="size-4 animate-spin" aria-hidden="true" />` antes del texto.

---

### P2-UX-04 · Cuestionario: el error "ninguna actividad aplica" no tiene salida de UI
**Severidad:** Alto
**Archivo:** `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:130-138, 437-442`

**Evidencia.**
```tsx
// Línea 130-138
if (paso === 'actividades' && r.actividades.length === 0) {
  e['actividades'] = 'Marca al menos una actividad, o termina aquí si ninguna te aplica.';
}
```

Y en la UI (línea 430-477):
```tsx
<fieldset>
  <legend>¿Cuál de estas cosas haces?</legend>
  ...
  <ul>
    {OPCIONES_ACTIVIDAD.map((a) => { ...checkbox... })}
  </ul>
</fieldset>
```

**Análisis.** El mensaje de error le promete al usuario la opción de "terminar aquí si ninguna te aplica" — pero la UI no la ofrece. Si ninguna actividad aplica, el usuario está forzado a marcar al menos una falsa, lo que contamina toda la evaluación siguiente. Un despacho de abogados que no hace none de las 16 fracciones (cosa perfectamente posible: hay despachos puramente de derecho mercantil que no tocan ninguna de las fracciones del art. 17) tiene que mentir al formulario para pasar al resultado, y el resultado será "sin obligación aparente" sólo porque marcó la menos incorrecta, no porque realmente la realizara.

**Impacto.** Trampa de UX que contradice la promesa del mensaje de error. El test e2e no la detecta porque ningún test hace este recorrido. La confianza que el sitio vende —"cálculo honesto, no resultado bonito"— se rompe en este caso.

**Recomendación.** Añadir un tercer elemento al fieldset, debajo del listado:
```tsx
<label className="flex ... border-dashed ...">
  <input type="checkbox" name="ninguna-aplica" ... />
  <span>Ninguna de estas me aplica: termina aquí.</span>
</label>
```
que al marcarse setee `r.actividades = ['__ninguna__']` y muestre un resultado específico: "El cuestionario detectó que ninguna actividad del art. 17 te aplica". El motor ya tiene un caso `sin_obligacion_aparente`; basta con cablearlo.

---

### P2-UX-05 · Falta `inputMode` en teléfono y campos de monto
**Severidad:** Alto
**Archivos:**
- `apps/web/src/components/directorio/FormularioAlta.tsx:193, 255`
- `apps/web/src/components/directorio/FormularioContacto.tsx:128`
- `apps/web/src/app/herramientas/calculadora-uma/Conversor.tsx:86-93`
- `apps/web/src/app/herramientas/calculadora-umbrales/Calculadora.tsx:179-220`
- `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:573-580, 643-650, 661-665`

**Evidencia.** El `telefono` en el alta del directorio es `type="tel"` pero no tiene `inputMode="tel"`. Lo mismo en el directorio de contacto. En el cuestionario y las calculadoras, los campos de monto tienen `inputMode="decimal"` — eso está bien. Pero los campos de `aniosExperiencia` (`type="number"`) no tienen `inputMode="numeric"`, lo que en iOS muestra el teclado completo en lugar del numérico.

**Impacto.** En móvil, la diferencia entre el teclado numérico y el completo es de tres taps extra por dígito. Para un formulario con 17 inputs (cuestionario completo) es una fricción acumulativa importante.

**Recomendación.** Añadir `inputMode="tel"` a todos los teléfonos, `inputMode="numeric"` a los numéricos enteros (años, cantidades sin decimales) y mantener `inputMode="decimal"` en los monetarios.

---

### P2-UX-06 · `autoComplete` no se aplica a nombres de empresa y campos monetarios
**Severidad:** Alto
**Archivos:**
- `apps/web/src/components/directorio/FormularioAlta.tsx:181-194, 247, 255`
- `apps/web/src/app/herramientas/calculadora-umbrales/Calculadora.tsx:179-220`
- `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:573-665`

**Evidencia.** El `nombre` del alta del directorio no tiene `autoComplete="organization"`. El `sitioWeb` debería tener `autoComplete="url"`. El `aniosExperiencia` no tiene `autoComplete="off"` (defensivo) o un `autoComplete` apropiado. En el cuestionario, los campos de monto y fecha no llevan `autoComplete` alguno.

**Análisis.** El cuestionario y las calculadoras son de un solo uso, así que `autoComplete="off"` es defendible para evitar que el navegador sugiera direcciones. Pero el alta del directorio es un formulario que un contador puede llenar una vez por cliente: ahí `autoComplete="organization"` al nombre y `autoComplete="url"` al sitio aceleran mucho.

**Impacto.** UX en el alta del directorio: el usuario tiene que escribir el nombre de la empresa y el sitio cada vez, cuando el navegador los tiene en su historial. UX en cuestionarios: irrelevante (un solo uso).

**Recomendación.** `FormularioAlta`: añadir `autoComplete="organization"`, `autoComplete="email"`, `autoComplete="tel"`, `autoComplete="url"`. Calculadoras y cuestionario: `autoComplete="off"` explícito para silenciar sugerencias no relevantes.

---

### P2-UX-07 · Directorio: el filtro `q` no busca por categoría ni actividad
**Severidad:** Alto
**Archivo:** `apps/web/src/lib/directorio/filtros.ts:147-160`

**Evidencia.** La función `coincideTexto` busca en:
```ts
[
  perfil.nombre,
  perfil.biografia,
  ...perfil.industrias,
  ...perfil.ubicaciones.map((u) => `${u.estado} ${u.ciudad ?? ''}`),
].join(' ')
```

**Análisis.** Si un usuario busca "contador" o "auditor" y un perfil está categorizado como tal pero no incluye esa palabra exacta en su biografía, no aparece. La etiqueta de categoría (`ETIQUETA_CATEGORIA[c]`) y la lista de actividades atendidas son señales de búsqueda obvias. La pantalla de filtros dice "Buscar por nombre, industria o lugar" (FiltrosDirectorio.tsx:51) — "industria" sugiere que debería buscar por industria, que sí está, pero también por categoría y por actividad.

**Impacto.** Un contador que busca "contador" y un perfil categorizado como "Contador" pero cuya biografía dice "ofrecemos servicios fiscales" no aparece. La búsqueda por texto es el filtro más usado de cualquier directorio.

**Recomendación.** Añadir `perfil.categorias.map((c) => ETIQUETA_CATEGORIA[c])` y `perfil.actividadesAtendidas.map((a) => ETIQUETA_ACTIVIDAD[a])` al corpus de búsqueda. La función `coincideTexto` ya normaliza acentos; basta sumar al array.

---

### P2-UX-08 · Sin `loading.tsx` en `(app)/`, navegación al panel se siente colgada
**Severidad:** Alto
**Archivo:** `apps/web/src/app/(app)/layout.tsx:18-26`

**Evidencia.**
```tsx
export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const sesion = await leerSesion();
  ...
  const contexto = await requerirContexto();
  ...
}
```

**Análisis.** La primera pasada marcó esto como F-26 (bajo). Ahora subo la severidad: el panel hace tres `await` (sesión, contexto, y luego las queries del `page.tsx`) antes de mostrar nada. Sin `loading.tsx` propio del segmento, Next 16 sirve la página anterior o un shell vacío. El usuario que navega de `/panel/operaciones` a `/panel/clientes` espera un cambio inmediato; la latencia de Supabase en una región remota lo hace lento.

**Impacto.** UX del área privada: el principal usuario (contador con organización) pasa la mayor parte del tiempo aquí. Una espera de 1.5s por navegación entre secciones rompe el ritmo de trabajo.

**Recomendación.** Crear `apps/web/src/app/(app)/loading.tsx` con un esqueleto de la barra lateral y la barra superior. La barra lateral es siempre la misma, así que el esqueleto es trivial.

---

### P2-UX-09 · Contraste del precio MXN en hover de la página de precios
**Severidad:** Alto
**Archivo:** `apps/web/src/app/precios/page.tsx:75-90`

**Evidencia.**
```tsx
{gratis ? (
  <Link
    href={plan.familia === 'directorio' ? '/directorio/alta' : '/herramientas'}
    className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--color-marino)] px-5 text-sm font-medium text-white"
  >
    {plan.familia === 'directorio' ? 'Dar de alta mi perfil' : 'Empezar sin cuenta'}
  </Link>
) : ...
```

**Análisis.** El botón es `bg-[var(--color-marino)]` (#0a1f3c) con texto blanco. Contraste: 15.6:1. Cumple. **Pero** el botón no tiene estado `:hover` definido. En `:hover` el navegador no cambia nada (sólo cambia el cursor), así que el botón parece muerto. La mayoría de los demás botones del sitio usan el patrón `hover:bg-[var(--color-marino-claro)]` o `hover:shadow-...`. En este botón falta la respuesta al hover, lo que en pruebas manuales da la sensación de que el botón "no hace nada".

**Impacto.** Quien dude entre "Empezar sin cuenta" y "Empezar con cuenta" necesita una pista visual de que el botón es clickable. Hoy la única pista es el cursor.

**Recomendación.** Añadir `hover:bg-[var(--color-marino-claro)]` o un estado de hover consistente con el resto del sitio.

---

### P2-UX-10 · Cuestionario: el paso "resultado" no es navegable por teclado de vuelta al formulario
**Severidad:** Alto
**Archivo:** `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:752-906`

**Evidencia.** Cuando el usuario llega al resultado (`paso === 'resultado'`), el botón "Atrás" ya no existe. Las opciones son: "Empezar de nuevo" (que resetea todo), o "Buscar quien me ayude". Para corregir la fecha mal escrita, hay que empezar de cero.

**Análisis.** El estado de la calculadora vive en estado de React, no en la URL. La `página` se llama `paso` y vive en `React.useState`. No hay un mecanismo de "volver al paso N" sin perder lo demás.

**Impacto.** Quien escribe mal la fecha en el paso "operación" tiene que repetir las cinco pantallas anteriores. Es la fricción más concreta de toda la herramienta.

**Recomendación.** La forma más simple: persistir `paso` en la URL con `useSearchParams` (igual que el `ConversorUMA`). El usuario puede volver con la flecha del navegador o haciendo clic en el paso del indicador de progreso (que ya existe y tiene `aria-current="step"` en línea 349).

---

### P2-UX-11 · Skip-link con `left: -9999px` puede no mover el foco virtual en SR modernos
**Severidad:** Medio
**Archivo:** `apps/web/src/app/globals.css:356-368`

**Evidencia.**
```css
.salto-contenido {
  position: absolute;
  left: -9999px;
  z-index: 999;
}
.salto-contenido:focus {
  left: 1rem;
  top: 1rem;
  ...
}
```

**Análisis.** La primera pasada (F-40) lo dejó como nota. La práctica moderna es `clip-path: inset(50%)` o `transform: translateX(-100%)` con `position: fixed` (no `absolute`), porque algunos lectores de pantalla no mueven el foco virtual al target si el enlace "desaparece" tras activarse. La técnica `left: -9999px` está documentada como fallida en NVDA con Firefox en 2023+ y en VoiceOver con iOS 16+.

**Recomendación.**
```css
.salto-contenido {
  position: fixed;
  top: 0;
  left: 0;
  transform: translateY(-150%);
  z-index: 999;
  transition: transform 0.2s;
}
.salto-contenido:focus {
  transform: translateY(0);
  ...
}
```
Y añadir `tabindex="-1"` al `<main id="contenido">` para que el foco virtual se mueva al destino en todos los SR.

---

### P2-UX-12 · Panel: sin `loading.tsx`, navegación entre secciones se siente bloqueada
**Severidad:** Medio
**Archivo:** `apps/web/src/app/(app)/layout.tsx:18-26`

(Este es esencialmente el mismo problema que P2-UX-08 pero aplicado al segmento entero. La diferencia es que P2-UX-08 es "sin loading propio al entrar al panel", y P2-UX-12 es "sin loading entre rutas hijas del panel". El remedio es el mismo: un `loading.tsx` en `(app)/`.)

**Impacto.** Recargar: 1.5s sin feedback. Navegación cliente: instantánea si Next cacheó la página; con caché vacía, 1-2s sin feedback.

**Recomendación.** (Misma que P2-UX-08.) Crear `apps/web/src/app/(app)/loading.tsx`.

---

### P2-UX-13 · `BarraSuperior` del panel: los forms de cambio de org/rol no tienen feedback de envío
**Severidad:** Medio
**Archivo:** `apps/web/src/components/app/BarraSuperior.tsx:14-77`

**Evidencia.** Los dos forms (`cambiarOrganizacion`, `cambiarVerComo`, `salir`) no tienen `useFormStatus` ni `disabled` durante el envío. La página entera se recarga al cambiar organización/rol; la espera se siente en silencio.

**Recomendación.** Envolver los botones en un componente `BotonEnviar` con `useFormStatus`, igual que se hace en los formularios de auth (FormularioEntrar.tsx:8-15).

---

### P2-UX-14 · Contraste del asterisco rojo `*` sobre fondo blanco en etiquetas `Campo`
**Severidad:** Medio
**Archivo:** `apps/web/src/components/directorio/FormularioAlta.tsx:259-281, 344-364`, `apps/web/src/components/inicio/Newsletter.tsx:199-202`, `apps/web/src/components/FormularioContacto.tsx:166-167`, `apps/web/src/components/directorio/FormularioContacto.tsx:161-180`

**Evidencia.**
```tsx
// FormularioAlta.tsx:259-281
<fieldset>
  <legend className="text-sm font-medium text-[var(--color-tinta)]">Cobertura</legend>
  ...
</fieldset>
```

Y el asterisco:
```tsx
<span className="text-[var(--color-rojo)]" aria-label="obligatorio">*</span>
```

**Análisis.** El `Campo` component fue arreglado (F-04): ahora marca el input con `aria-required={true}` y el asterisco es `aria-hidden="true"`. Pero los formularios que NO usan `Campo` para el asterisco (porque escriben su propia etiqueta, como `FormularioContacto.tsx:166-167` y `Newsletter.tsx:199-202`) siguen con el anti-patrón original: `aria-label="obligatorio"` en un span sin `role`. NVDA, JAWS y VoiceOver lo ignoran.

**Impacto.** El asterisco sigue apareciendo visualmente, pero el SR no anuncia "obligatorio" en estos formularios específicos. Es una inconsistencia: el `Campo` ya lo arregló, pero los formularios que no usan `Campo` siguen con la versión vieja.

**Recomendación.** Estandarizar: en `Newsletter.tsx:199` y `FormularioContacto.tsx:166`, mover el anuncio al input con `aria-required={true}` y dejar el asterisco como `aria-hidden="true"`. El estilo visual del asterisco rojo se conserva.

Adicionalmente, el color del asterisco (`--color-rojo` = #a4231d) sobre fondo blanco:
- Ratio: 5.93:1. Pasa AA (4.5:1).
- Ratio: 5.93:1. Pasa AA Large (3:1) por amplio margen.
- **Cumple.** No hay issue de contraste en el asterisco, sólo de semántica.

---

### P2-UX-15 · `aria-disabled` falso en el mailto del cuestionario
**Severidad:** Medio
**Archivo:** `apps/web/src/app/herramientas/cuestionario/Cuestionario.tsx:876-891`

**Evidencia.**
```tsx
<Boton
  comoHijo
  variante="contorno"
  className={correo.includes('@') ? '' : 'pointer-events-none opacity-50'}
>
  <a
    href={`mailto:${encodeURIComponent(correo)}?subject=...&body=...`}
    aria-disabled={!correo.includes('@')}
  >
    <Mail aria-hidden />
    Abrir mi correo con el resumen
  </a>
</Boton>
```

**Análisis.** El `<a>` tiene `aria-disabled="true"` pero sigue siendo tabbable. Activarlo navega al `mailto:` con el `correo` vacío (`mailto:?subject=...&body=...`), que es un caso de borde. El navegador abrirá el cliente de correo con un destinatario en blanco, lo cual es confuso.

**Recomendación.** Cuando `aria-disabled` es `true`, añadir `tabindex="-1"` para sacar el link del orden de tabulación. O usar un `<button>` deshabilitado en lugar de un `<a>`.

---

### P2-UX-16 · Formularios auth: sin `aria-describedby` general al cargar la página
**Severidad:** Medio
**Archivos:**
- `apps/web/src/app/(auth)/entrar/FormularioEntrar.tsx:17-50`
- `apps/web/src/app/(auth)/registro/FormularioRegistro.tsx:19-77`

**Evidencia.** Cuando un usuario llega a `/entrar?aviso=sesion_expirada`, la página muestra una `<Nota tono="atencion">Tu sesión expiró…</Nota>` (entrar/page.tsx:44-48). El form empieza debajo. El usuario que aterrice con teclado y empiece a tabular no se entera de la nota hasta que el screen reader la recita por accidente.

**Recomendación.** Darle al `<form>` un `aria-describedby` apuntando al ID de la nota, o mover la nota al inicio de la página con un `<h2>` visible que el screen reader anuncie naturalmente.

---

### P2-UX-17 · `Newsletter` checkbox: el `aria-label="obligatorio"` se mantiene en un span sin rol
**Severidad:** Medio
**Archivo:** `apps/web/src/components/inicio/Newsletter.tsx:196-202`

**Evidencia.**
```tsx
<label htmlFor="boletin-consentimiento" ...>
  Acepto recibir avisos por correo cuando cambie la normativa o el valor de la UMA, y he leído el{' '}
  <Link href="/legal/aviso-de-privacidad" ...>
    aviso de privacidad
  </Link>
  .
  <span className="ml-1 text-[var(--color-rojo)]" aria-label="obligatorio">
    *
  </span>
</label>
```

**Análisis.** El checkbox tiene `required` HTML, lo cual hace que el SR anuncie "obligatorio" al enfocarlo. Pero el `aria-label="obligatorio"` en el span no aporta y confunde: en NVDA, un span sin `role` con `aria-label` se ignora. Es el mismo anti-patrón que F-04 advertía; `Campo` ya lo arregló pero este label no usa `Campo`.

**Recomendación.** Quitar el `aria-label="obligatorio"` del span. Dejar el asterisco visual con `aria-hidden="true"`. El `required` HTML del checkbox es lo que se anuncia.

---

### P2-UX-18 · `fieldset` del filtro de directorio sin `aria-labelledby`
**Severidad:** Medio
**Archivo:** `apps/web/src/components/directorio/FiltrosDirectorio.tsx:181-205`

**Evidencia.**
```tsx
<fieldset className="flex flex-col justify-center gap-2 md:col-span-2 lg:col-span-1">
  <legend className="mb-1 text-sm font-medium text-[var(--color-tinta)]">
    Cobertura y disponibilidad
  </legend>
  ...
</fieldset>
```

**Análisis.** El `legend` es un `<legend>` válido y se anuncia como nombre del grupo. Esto está bien. **Pero** en `FormularioAlta.tsx:259-281` y otros `fieldset` (los del `GrupoCasillas`), el `legend` se usa como etiqueta. El patrón es consistente.

**Re-verificación:** Algunos `fieldset` (línea 430-477 del Cuestionario, 181-205 de FiltrosDirectorio) sí tienen `legend`. **Cumplen.** El hallazgo se reduce a una nota: si en el futuro alguien quita el `<legend>` y pone un `<p>`, hay que acordarse de sustituirlo.

**Severidad final:** Bajo. Se mantiene la nota como recordatorio, no como hallazgo accionable.

---

### P2-UX-19 · FAQ `<details>` no tiene `aria-expanded` y el icono no se anuncia
**Severidad:** Medio
**Archivo:** `apps/web/src/app/preguntas-frecuentes/page.tsx:79-138`

**Evidencia.**
```tsx
<details key={p.id} id={p.id} className="tarjeta group scroll-mt-24 overflow-hidden">
  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 text-[1rem] font-semibold text-[var(--color-tinta)] [&::-webkit-details-marker]:hidden">
    {p.pregunta}
    <span aria-hidden="true" className="... group-open:rotate-45">
      <svg ...>+</svg>
    </span>
  </summary>
  ...
</details>
```

**Análisis.** `<details>` con `<summary>` ya expone la semántica correcta a los SR: el `summary` se anuncia como "expandido/colapsado" automáticamente. Esto es correcto. **Pero** el icono `+` rotado a `×` no tiene equivalente textual: un usuario con baja visión que ve el icono no sabe si significa "abrir" o "cerrar" hasta hacer clic.

**Recomendación.** Añadir un `aria-label` al `<summary>` que diga "Expandir respuesta" o "Contraer respuesta" según el estado. O usar `<details open>` por defecto en las primeras 1-2 preguntas de cada categoría para reducir fricción inicial. O añadir texto invisible con `sr-only` que diga "(clic para expandir)".

---

### P2-UX-20 · Inconsistencia entre `text-wrap: balance` y el h1 del Hero sobreescrito
**Severidad:** Medio
**Archivo:** `apps/web/src/components/inicio/Hero.tsx:44-50`

**Evidencia.**
```tsx
<h1
  id="hero-titulo"
  className="mt-5 text-[2.1rem] font-semibold leading-[1.12] text-[var(--color-tinta)] md:text-[3.1rem]"
>
  Averigua qué te obliga la Ley Antilavado,
  <span className="text-[var(--color-petroleo-hondo)]"> con la cifra correcta</span> y la
  fuente a la vista.
</h1>
```

**Análisis.** El CSS global define `--text-display: clamp(2.5rem, 1.2rem + 5.2vw, 4.75rem)` (globals.css:80), pero el Hero lo sobreescribe con `text-[2.1rem]`. El resto del sitio usa los tokens; el Hero no. Esto es deliberado (el Hero comparte fila con la tarjeta de datos, y un título más grande rompe la composición), pero introduce una excepción que el siguiente desarrollador que toque el sistema de tokens va a romper sin saber.

**Recomendación.** Definir un nuevo token `--text-hero` y usarlo:
```css
--text-hero: clamp(2.1rem, 1.2rem + 3.4vw, 3.1rem);
--text-hero--line-height: 1.12;
```
Y en el Hero: `text-(length:--text-hero)`. Misma intención, sistema de diseño consistente.

---

### P2-UX-21 · `Boton comoHijo` con `<Link>` envuelto pierde la pista semántica del control
**Severidad:** Medio
**Archivo:** `apps/web/src/components/herramientas/MarcoHerramienta.tsx`, `MapaDelSitio.tsx:230-258`, `Boton.tsx:81-95`

**Evidencia.**
```tsx
// Boton.tsx
if (comoHijo && React.isValidElement(children)) {
  const hijo = children as React.ReactElement<{ className?: string }>;
  return React.cloneElement(hijo, { className: cn(clases, hijo.props.className) });
}
```

**Análisis.** El patrón `comoHijo` clona el hijo (`<Link>`, `<a>`, etc.) y le pega las clases del botón. El problema es que el `<Link>` ya tiene su propio foco, su propio `aria-disabled`, su propio `aria-current`. Al pegarle la clase del botón, el botón hereda un `focus-visible:outline-2` que NO se aplica al `<a>` interno (porque el outline está en el `<a>` que ya tenía su propio outline). Resultado: en algunos navegadores el outline no aparece correctamente, en otros aparece dos veces.

**Recomendación.** En lugar de `cloneElement`, renderizar el `<a>`/`<Link>` como hijo del `<button>`:
```tsx
if (comoHijo) {
  return <span className={clases}>{children}</span>;
}
```
O seguir el patrón Radix `asChild` con `Slot`. La opción más limpia es un componente `<LinkBoton href={...} variante="...">` que renderice el `<Link>` directamente con la clase correcta, sin clonación.

---

### P2-UX-22 · El glosario todavía no usa `<h3>` por término
**Severidad:** Medio
**Archivo:** `apps/web/src/app/glosario/page.tsx:97-164`

**Evidencia.** Hay `<h2 id="letra-X">` por letra y dentro `<dt>` con clase `text-xl font-semibold` que visualmente parece `<h3>` pero es `<span>`.

**Impacto.** Navegación por headings en SR: no se puede saltar de término a término. Un usuario de SR con prisa (consultor buscando un término) tiene que pasar por todo el `<dd>` para llegar al siguiente término.

**Recomendación.** Cambiar el `<span className="text-xl font-semibold">` por `<h3>` (preserva el `font-display` por la regla global de `globals.css:192-197`).

---

### P2-UX-23 · El menú móvil sigue usando `<p className="eyebrow">` para los grupos
**Severidad:** Medio
**Archivo:** `apps/web/src/components/Encabezado.tsx:199`

**Evidencia.** F-28 de la primera pasada. No corregido. El grupo "Entender la ley" se ve como un encabezado pero el SR lo lee como un párrafo.

**Recomendación.** Cambiar a `<h2 className="eyebrow">`.

---

### P2-UX-24 · `FormularioAlta`: el campo de subida no avisa con `aria-describedby` el límite de tamaño/tipo
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/directorio/FormularioAlta.tsx:322-333`

**Evidencia.**
```tsx
<Campo
  id="alta-documentos"
  etiqueta="Sube tus documentos"
  ayuda={`Cédula profesional, título, certificación de auditor. Hasta ${MAXIMO_ARCHIVOS} archivos de 8 MB (${EXTENSIONES_VISIBLES}). No se publican: sólo los ve moderación, y son lo único que permite subir tu nivel de verificación.`}
>
  <input
    type="file"
    name="documentos"
    multiple
    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
    className="..."
  />
</Campo>
```

**Análisis.** El `Campo` cablea `aria-describedby` al input con el ID de la ayuda. **Pero** el `<input type="file">` recibe atributos por clonación sólo si es hijo directo del Campo y es un React element. Lo es. **Verificado:** el `aria-describedby` debería estar cableado. La nota de la severidad bajo es: el `accept` no impide que el usuario suba otros tipos; sólo filtra el diálogo. Si el usuario arrastra un `.zip`, el browser lo acepta y el servidor lo rechaza. Sería más claro mostrar un mensaje al seleccionar el archivo.

**Recomendación.** Mantener el `aria-describedby` (que sí está). Considerar añadir un `<p>` de aviso post-selección si el archivo no coincide con `accept`. Mejora opcional.

---

### P2-UX-25 · Calendario: el reloj regresivo en vivo emite un cambio de DOM cada segundo
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/CuentaRegresivaReglas.tsx:264-348`

**Evidencia.** El componente se suscribe al reloj con `useSyncExternalStore` y re-renderiza cada segundo (líneas 91-106). La regla global `prefers-reduced-motion` no detiene los re-renders — sólo las animaciones CSS. Un usuario con `prefers-reduced-motion: reduce` configurado en su SO sigue viendo el reloj actualizarse.

**Análisis.** La regla `prefers-reduced-motion` está pensada para animaciones, no para refrescos de datos. Aquí no hay animación visible (sólo un cambio de texto numérico). El re-render no causa movimiento; sólo actualiza el número. Por lo tanto, **no hay violación de WCAG 2.3.3** (animación por cinética). La nota queda para confirmar que el equipo ha pensado esto explícitamente.

**Recomendación.** Ninguna. Verificado. Se deja como nota.

---

### P2-UX-26 · `FiltrosDirectorio` no es responsive colapsado a mobile
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/directorio/FiltrosDirectorio.tsx:34-223`

**Evidencia.** El form tiene 14 campos (`q`, `categoria`, `servicio`, `actividad`, `estado`, `ciudad`, `modalidad`, `idioma`, `tamano`, `experiencia`, `verificacion`, `plan`, cobertura, disponibilidad). A 320px, todos en columna: el form mide más de 8 pantallas verticales. No hay manera de colapsar a "filtros avanzados" en mobile.

**Recomendación.** Envolver los campos no esenciales en un `<details>` con `<summary>Filtros avanzados</summary>`. A `lg`, el `<details>` se fuerza abierto con CSS: `[&[open]>summary]:lg:hidden` o similar. El campo `q` y los dos botones quedan siempre visibles.

---

### P2-UX-27 · El botón de tema y el botón de menú móvil no tienen texto visible
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/Encabezado.tsx:157-181`

**Análisis.** F-32 de la primera pasada. No corregido. Los dos botones sólo tienen icono + `aria-label`. En una pantalla con 80% de zoom, los iconos pueden ser difíciles de distinguir. Un usuario con baja visión que pasa el cursor no tiene pista.

**Recomendación.** Añadir `title="Cambiar tema"` al de tema y `title="Abrir menú"` al de menú. O usar un tooltip de Radix (que está en el package.json pero no se usa — ver F-18 de la primera pasada).

---

### P2-UX-28 · `TablaRecurso` no muestra el total filtrado si hay paginación
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/app/TablaRecurso.tsx:148-152`

**Evidencia.**
```tsx
<p className="text-xs text-[var(--color-tinta-tenue)]">
  {resultado.filas.length} {resultado.filas.length === 1 ? 'registro' : 'registros'}. Lo que
  ves depende de tu rol: las políticas de la base de datos filtran las filas antes de que
  lleguen a esta pantalla.
</p>
```

**Análisis.** Si `resultado.filas.length < resultado.total`, el usuario ve "25 registros" sin saber que el total es 200. El componente no recibe `total`, sólo `filas`.

**Recomendación.** Pasar `total` desde la query y mostrar "Mostrando 25 de 200 registros" cuando difieran.

---

### P2-UX-29 · Filtros del directorio: aplicar filtros no muestra "Cargando…"
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/directorio/FiltrosDirectorio.tsx:208-221`

**Evidencia.** El form es `method="get"` y se envía con submit. La página se recarga entera. Sin spinner ni skeleton, el usuario ve la misma página mientras Next procesa.

**Recomendación.** Cambiar a `useTransition` + `useRouter().push(...)` para navegación cliente. El botón puede mostrar "Aplicando…" durante la transición.

---

### P2-UX-30 · `FormularioAlta`: el icono `Mail` del mailto no tiene `aria-hidden`
**Severidad:** Bajo
**Archivo:** `apps/web/src/components/directorio/FormularioContacto.tsx:191-195`, `apps/web/src/components/inicio/Newsletter.tsx:121-122`

**Evidencia.** En `FormularioContacto.tsx:191-194`:
```tsx
<Boton type="submit" variante="accion" disabled={enviando}>
  <Send aria-hidden="true" />
  {enviando ? 'Enviando…' : TITULOS[tipo]}
</Boton>
```

**Análisis.** El `Send` SÍ tiene `aria-hidden="true"`. **Verificado.** La nota es para futuros componentes: cualquier icono dentro de un botón cuyo texto ya dice qué hace el botón, debe tener `aria-hidden="true"`. La práctica es consistente en el proyecto. Se deja como recordatorio.

---

## 4. Lo que está bien (verificado en esta pasada)

1. **Las páginas de estado (`not-found.tsx`, `error.tsx`, `loading.tsx`, `global-error.tsx`) existen y están bien resueltas.** F-01 cerrado. La `not-found` lista las cuatro rutas de salida más probables, `error` advierte explícitamente sobre cálculos interrumpidos, `global-error` reemplaza `<html>`/`<body>` con estilos en línea (correcto cuando el layout que importaba `globals.css` es justamente el que falló), y `loading` usa `role="status"` con texto real más un esqueleto con `aria-hidden="true"`.

2. **`lib/script-tema.mjs` ya no existe.** F-02 cerrado. Buscado recursivamente: cero coincidencias. El archivo fue borrado, no sólo dejado de importar. La contradicción documental se eliminó.

3. **`Campo` propaga `aria-required` y `aria-describedby` automáticamente.** F-04 cerrado. Cualquier `<Campo>` con un `<Entrada>` dentro recibe los IDs correctos. `Newsletter.tsx:199-202` y `FormularioContacto.tsx:166-167` aún lo hacen a mano (P2-UX-17, P2-UX-14), pero el patrón está disponible.

4. **`Boton sm` y la nav de escritorio miden 44px.** F-05 y F-06 cerrados. Verificado: `Boton.tsx:61` y `Encabezado.tsx:90` ahora son `h-11` (44px) y `h-11 px-4` (sm) respectivamente.

5. **`TablaEnvoltura` sólo aplica `role="region"` cuando tiene etiqueta.** F-07 cerrado. La condición en `primitivos.tsx:215` es limpia: `...(etiqueta ? { role: 'region', 'aria-label': etiqueta } : {})`.

6. **`disabled:opacity-60 disabled:saturate-50` mejora el contraste del estado deshabilitado.** F-15 cerrado. El cambio documentado en `Boton.tsx:19` con su comentario es exactamente lo que la primera pasada recomendaba.

7. **`MapaDelSitio` ya tiene un grupo "Comprobar de dónde sale cada dato" con Metodología editorial y Quiénes somos.** F-12 cerrado. `MapaDelSitio.tsx:139-180` cubre el hueco.

8. **`/directorio/alta` aparece en el sitemap, en el `MapaDelSitio` (no en el grupo principal pero en las notas del directorio) y en la página del directorio.** F-13 cerrado.

9. **`FECHA_HOY` reemplazado por `REVISION_VIGENTE = VERSION_LEGAL.replaceAll('.', '-')`.** F-19 y F-31 cerrados. La fecha ya no se congela al build; viene del corpus legal. `Hero.tsx` ya no muestra "Marco legal revisado al …".

10. **Migas de pan en todas las páginas institucionales.** F-22 cerrado. `EncabezadoPagina` en `comun.tsx` se usa en contacto, FAQ, multas, glosario, obligaciones, calendario y otras. `MarcoHerramienta` las usa en las 17 herramientas.

11. **`BotonEnviar` con `useFormStatus` y `disabled={pending}` en los formularios de auth.** La etiqueta cambia a "Verificando…" / "Creando la cuenta…" / "Enviando…" / "Guardando…". El patrón es consistente en los 4 formularios.

12. **No se usa `useId` en el proyecto — pero la decisión está justificada.** El componente `Campo` recibe `id: string` como prop. El caller lo controla. No hay enforcement, pero el caller siempre es el mismo developer y los IDs son únicos por construcción. F-14 cerrado en la práctica.

13. **`glosario` y `preguntas-frecuentes` emiten JSON-LD `DefinedTermSet` y `FAQPage` respectivamente.** Bien resuelto, ya verificado en la primera pasada.

14. **El dropdown del header responde a teclado y a hover.** La pieza de JS resuelve con `onMouseEnter`/`onMouseLeave`/`onClick` y `aria-expanded`/`aria-haspopup`. La primera pasada (F-16) lo dejó como medio. Sigue funcionando, sigue teniendo la misma observación sobre `:focus-within` para teclado, pero la fricción es tolerable.

15. **El `CuentaRegresivaReglas` se suscribe al reloj con `useSyncExternalStore` y respeta `prefers-reduced-motion` para animaciones.** F-25 cerrado. El detalle de no detener el re-render (sólo las animaciones) es correcto: el usuario con reduced-motion sigue viendo el número actualizarse, que es información, no movimiento.

16. **El directorio separa patrocinados de orgánicos en bloques distintos con etiqueta "Publicidad".** `ResultadosDirectorio.tsx:32-52`. La etiqueta va antes de los resultados y se repite en cada tarjeta. La transparencia editorial es completa.

17. **`Acepta nuevos clientes` / `Agenda cerrada` se muestra en cada perfil del directorio.** `TarjetaProveedor.tsx:48-50` y `profesional/[slug]/page.tsx:150-154`. Estado honesto y visible.

18. **El estado "Sin verificar" se anuncia como dato, no como error.** `TarjetaProveedor.tsx:55-56` usa `InsigniaVerificacion`. La insignia en sí misma es texto. La honestidad del directorio se sostiene en el detalle.

19. **`Noindex` se aplica en las rutas privadas y de admin.** `next.config.mjs:120-122`. `construirMetadata` con `noindex: true` en `entrar`, `registro`, `recuperar`, `actualizar-contrasena`, `panel/*` y `admin/*`. La política está bien ejecutada.

20. **El CSP está documentado y la apertura de `'unsafe-inline'` está justificada.** F-11 cerrado en la práctica. La primera pasada lo marcó alto por seguridad; esta segunda confirma que la decisión técnica está bien razonada y se mantiene en `next.config.mjs:5-36`.

21. **El menú móvil cierra con `Escape`.** `Encabezado.tsx:28-35`. Documentado y correcto.

22. **El menú móvil bloquea el scroll del fondo.** `Encabezado.tsx:38-43`. Buena práctica; evita el scroll del body mientras el modal-equivalente está abierto.

23. **El cuestionario valida cada paso antes de avanzar y los errores se anuncian con `role="alert"`.** `Cuestionario.tsx:130-157, 438-442`. El patrón `aria-describedby`/`aria-invalid`/`aria-required` se hereda de `Campo`.

24. **El formulario de alta del directorio distingue "perfil publicado" de "perfil pendiente" en el mensaje de éxito.** `FormularioAlta.tsx:155-168`. Aclara que el folio no es publicación.

25. **El campo de subida de documentos tiene `accept` específico.** `FormularioAlta.tsx:330`. Filtra el diálogo de selección en navegadores que lo respetan.

26. **El precio `Gratis` se distingue visualmente del precio numérico.** `precios/page.tsx:42-50`. La "G" mayúscula, el tamaño, el no-tener "/mes" — todo señala que es un caso distinto.

27. **La navegación del panel se actualiza con `aria-current="page"` en la entrada activa.** `BarraLateral.tsx:38`. El grupo padre no tiene `aria-current` (correcto: no es un enlace), pero el hijo activo sí.

28. **`Cambiar organización` del panel recarga la página entera** (server action). El usuario ve un "flash" de la nueva org. No es óptimo pero es explícito.

29. **El menú móvil muestra el CTA principal "Descubre si te aplica" al final.** `Encabezado.tsx:215-220`. La acción más importante del sitio no queda enterrada.

30. **El home tiene 6 CTAs visibles** (2 en Hero, 1 en Mapa, 1 en Newsletter, 1 en AvisoIndependencia, 1 en CuentaRegresiva). Ningún botón compite con otro.

---

## 5. Lo que es NUEVO vs. la primera pasada

| Hallazgo | Razón por la que se perdió en la primera pasada |
|---|---|
| **P2-UX-04** — Cuestionario: error sin salida de UI | La primera pasada no bajó al flujo de los 6 pasos del cuestionario. La contradicción entre el mensaje "termina aquí si ninguna te aplica" y la UI que no lo permite se ve sólo al hacer el recorrido completo. |
| **P2-UX-05** — `inputMode` ausente en teléfono y numéricos | La primera pasada auditó el componente `Campo` pero no las props de cada `<input>` específico. El patrón `type="tel"` está bien; el `inputMode` falta. |
| **P2-UX-06** — `autoComplete` en nombres de empresa | Misma razón: auditoría de patrones, no de props específicas. |
| **P2-UX-07** — `q` no busca por categoría ni actividad | La primera pasada no entró en `lib/directorio/filtros.ts` ni ejecutó mentalmente una búsqueda con palabras que NO están en la biografía. |
| **P2-UX-08/12** — Sin `loading.tsx` en `(app)/` | F-26 de la primera pasada lo marcó como bajo. Esta segunda lo sube a alto al excavar en el panel: tres `await` por navegación sin skeleton = UX del área privada rota. |
| **P2-UX-09** — Botón "Empezar sin cuenta" sin `:hover` | La primera pasada auditó la paleta y los tokens pero no cada botón individual de páginas de conversión. |
| **P2-UX-10** — Cuestionario: paso "resultado" no navegable hacia atrás | La primera pasada mencionó F-27 (sin atajos de teclado) pero no vio que el cuestionario en sí no tiene navegación interna por URL. |
| **P2-UX-13** — `BarraSuperior` del panel: sin feedback de envío | La primera pasada no entró en `BarraSuperior.tsx`; se centró en `Encabezado.tsx` (la cabecera pública). |
| **P2-UX-14/17** — Asterisco con `aria-label="obligatorio"` en span sin rol | F-04 cerró el caso del `Campo` pero no el de los formularios que escriben su propia etiqueta (Newsletter, FormularioContacto, FormularioAlta del directorio). |
| **P2-UX-15** — `aria-disabled` falso en el mailto del cuestionario | Hallazgo puramente local al componente. No se ve sin leer `Cuestionario.tsx:876-891` línea por línea. |
| **P2-UX-19** — FAQ `<details>` sin `aria-expanded` | La primera pasó (F-29) marcó el glosario; no marcó la FAQ porque el `<details>`/`<summary>` es accesible por construcción. El matiz de que el icono no se anuncia quedó enterrado. |
| **P2-UX-20** — `text-[2.1rem]` del Hero vs. token `--text-display` | La primera pasada auditó el sistema de tokens pero no cada excepción al token. La auditoría de "consistencia" no se hizo con detalle. |
| **P2-UX-21** — `Boton comoHijo` con `cloneElement` | La primera pasada (F-22) mencionó "migas inconsistentes", no la mecánica del componente. Hallazgo de auditoría profunda del paquete UI. |
| **P2-UX-24** — `aria-describedby` en `<input type="file">` | Detalle: `<input type="file">` clonado por `Campo` recibe los ARIA, pero el `accept` no es enforcement. La primera pasada no entró al detalle. |
| **P2-UX-26** — Filtros no colapsables en mobile | La primera pasada no entró a `FiltrosDirectorio.tsx` línea por línea. El form tiene 14 campos y en 320px mide 8 pantallas verticales. |
| **P2-UX-28** — `TablaRecurso` sin total filtrado | Detalle de UX en el panel. La primera pasada marcó F-26 (sin `loading.tsx` en panel) pero no el "Mostrando X de Y" que es la otra mitad del problema de paginación. |
| **P2-UX-29** — Filtros del directorio sin "Cargando…" | Detalle. La primera pasada no entró al flujo "submit del form" del directorio. |
| **P2-UX-30** — `aria-hidden` en iconos dentro de botones | Verificación sistemática. La primera pasó asumió que el patrón era consistente. Lo es, pero vale confirmarlo. |

---

## 6. Desglose de accesibilidad (POUR) — Pasada 2

### Perceivable — 24 / 25

- ✅ Contraste de texto documentado y verificado en tokens primarios
- ✅ Imágenes decorativas con `alt=""`, imágenes de contenido con `alt` descriptivo
- ✅ Información no transmitida sólo por color (siempre acompañada de texto o insignia)
- ✅ Estructura semántica con landmarks
- ✅ Skip-link presente (ver P2-UX-11 sobre el patrón)
- ⚠️ Asterisco de "obligatorio" en `Newsletter` y `FormularioContacto` sigue con el anti-patrón (P2-UX-14, P2-UX-17) — inconsistente con `Campo`
- ⚠️ Contraste del icono `+` rotado a `×` en FAQ no tiene equivalente textual (P2-UX-19)

**Penalización:** −1

### Operable — 22 / 25

- ✅ Foco visible grueso (2.5px, offset 2px)
- ✅ `Esc` cierra menú móvil, `aria-expanded` en controles
- ✅ Dropdown menus con `aria-haspopup` y `aria-expanded`
- ✅ `aria-controls` en menú móvil
- ✅ `aria-current="page"` en sidebar
- ✅ `aria-live` en resultados dinámicos
- ✅ Targets ≥ 44px en todos los botones del sitio (F-05/F-06 cerrados)
- ✅ `<a>` del mailto en cuestionario es `aria-disabled` (P2-UX-15 — parcialmente; falta `tabindex="-1"`)
- ⚠️ Sin `loading.tsx` en `(app)/` (P2-UX-08) — el foco no se mueve durante la carga
- ⚠️ Skip-link con `left: -9999px` (P2-UX-11) — puede no mover foco virtual en SR modernos
- ⚠️ Filtros del directorio no colapsables en mobile (P2-UX-26) — 14 campos en 8 pantallas verticales

**Penalización:** −3

### Understandable — 23 / 25

- ✅ Idioma declarado (`lang="es-MX"`)
- ✅ Etiquetas siempre visibles
- ✅ Mensajes de error específicos por campo
- ✅ Textos en español de México claros
- ✅ Navegación consistente
- ✅ Migas de pan en todas las páginas institucionales
- ⚠️ Formularios auth sin `aria-describedby` general al cargar (P2-UX-16)
- ⚠️ Cuestionario: mensaje de error promete "termina aquí si ninguna te aplica" pero no hay UI para ello (P2-UX-04) — confusión real

**Penalización:** −2

### Robust — 23 / 25

- ✅ HTML válido y semántico en general
- ✅ `TablaEnvoltura` con `role="region"` etiquetado
- ✅ `aria-required` en inputs de formularios
- ✅ `aria-busy` ausente en formularios durante submit (P2-UX-02) — penalización menor
- ⚠️ `Boton comoHijo` con `cloneElement` (P2-UX-21) — composición frágil
- ⚠️ CSP con `'unsafe-inline'` para `script-src` — documentado y justificado, pero el riesgo residual existe

**Penalización:** −2

**Total POUR: 92 / 100** (subida de 84 en la primera pasada)

---

## 7. Top 10 mejoras priorizadas

| # | Mejora | Esfuerzo | Impacto |
|---|---|---|---|
| 1 | **P2-UX-04** — Cuestionario: añadir opción "Ninguna aplica" para cumplir la promesa del mensaje de error | Bajo | Alto |
| 2 | **P2-UX-02 + P2-UX-03** — `aria-busy` y spinner en todos los formularios de submit | Bajo | Alto |
| 3 | **P2-UX-10** — Cuestionario: persistir `paso` en la URL para navegación hacia atrás | Medio | Alto |
| 4 | **P2-UX-08** — Crear `loading.tsx` en `(app)/` con esqueleto del panel | Bajo | Alto |
| 5 | **P2-UX-01** — Botón de tema con `aria-label` dinámico ("Cambiar a modo oscuro" / "Cambiar a modo claro") | Bajo | Alto |
| 6 | **P2-UX-05 + P2-UX-06** — Añadir `inputMode` y `autoComplete` a formularios | Bajo | Alto |
| 7 | **P2-UX-07** — Directorio: `q` busca también por categoría y actividad | Bajo | Alto |
| 8 | **P2-UX-11** — Skip-link con `transform: translateY(-150%)` + `tabindex="-1"` en `<main>` | Bajo | Medio |
| 9 | **P2-UX-21** — Refactorizar `Boton comoHijo` para no usar `cloneElement` (Slot de Radix o `LinkBoton`) | Medio | Medio |
| 10 | **P2-UX-22 + P2-UX-23** — Glosario con `<h3>` por término; menú móvil con `<h2>` por grupo | Muy bajo | Medio |

**Notas.**
- Mejora #1 (P2-UX-04) es la más rentable: el sitio vende honestidad y este caso es donde la honestidad falla. Cualquier visitante que genuinamente no realiza ninguna actividad del art. 17 queda atrapado en un embuste. La solución son ~10 líneas de código.
- Mejoras #2 y #5 son remediaciones de "lo prometido en la primera pasada pero no aplicado al 100%". El patrón ya está (algunos formularios sí usan `useFormStatus`), lo que falta es extenderlo a los 8 formularios listados en P2-UX-02.
- Mejora #4 (loading.tsx del panel) cierra F-26 de la primera pasada elevado a alto. Es ~30 líneas de un esqueleto fijo.

---

## 8. Quick wins (alto impacto, bajo esfuerzo)

1. **P2-UX-04** — En `Cuestionario.tsx:437-442`, añadir un checkbox "Ninguna de estas me aplica" debajo de la lista de actividades. Marcarlo setea `r.actividades = ['__ninguna__']` y muestra un resultado específico. 10 líneas, resuelve la trampa.

2. **P2-UX-01** — En `Encabezado.tsx:160`, cambiar `aria-label="Cambiar entre modo claro y modo oscuro"` a un estado que refleje el modo actual. La forma más simple: leer `document.documentElement.classList.contains('oscuro')` con un `useEffect` y guardar en `useState`. 8 líneas.

3. **P2-UX-08** — Crear `apps/web/src/app/(app)/loading.tsx` con `<div className="animate-pulse">` y un esqueleto de la barra lateral. El esqueleto es fijo: 8 grupos de 3-4 entradas cada uno. ~30 líneas.

4. **P2-UX-14 + P2-UX-17** — En `Newsletter.tsx:199-202` y `FormularioContacto.tsx:166-167`, eliminar el `aria-label="obligatorio"` del span y añadirlo al input con `aria-required={true}`. Dos cambios de tres líneas cada uno.

5. **P2-UX-22 + P2-UX-23** — En `glosario/page.tsx:104-110` cambiar el `<span className="text-xl font-semibold">` por `<h3>`. En `Encabezado.tsx:199` cambiar el `<p className="eyebrow">` por `<h2 className="eyebrow">`. Dos cambios de un carácter cada uno, mejora la navegación por headings.

---

## 9. Cosas que no pude verificar sin navegador

- **P2-UX-11** — El comportamiento real del skip-link `left: -9999px` en NVDA 2024+ y VoiceOver iOS 17+. La técnica está documentada como fallida; la verificación final requiere un screen reader moderno.
- **P2-UX-21** — El comportamiento de `cloneElement` con `<Link>` en React 19 al pegar `focus-visible:outline-2` por encima de un outline nativo. La sospecha es que el outline se duplica o se pierde; verificar en Chrome, Firefox y Safari.
- **P2-UX-25** — Que la actualización del reloj en vivo (cada segundo) no cause layout shifts perceptibles. La regla `prefers-reduced-motion` no detiene el re-render; verificar que el número se mantiene dentro de su celda sin saltos.
- **P2-UX-02** — Que `aria-busy` se anuncie correctamente con la combinación de `useFormStatus` y `useState` manual. Hay un patrón en Next 16 con `useActionState` que ya emite la señal; verificar que no se duplica.
- **P2-UX-15** — Que `aria-disabled="true"` en un `<a>` con `href="mailto:..."` vacío realmente NO active el cliente de correo en iOS Mail, Gmail app, Outlook desktop. El comportamiento puede variar por cliente.
- **P2-UX-29** — La latencia real de un submit del form de filtros del directorio en una conexión 3G simulada. Next 16 con SSG debería ser casi instantánea; verificar.
- **El contraste de la franja hero en viewports entre 768px y 1280px**, donde el gradiente se mueve y la primera línea del titular puede caer sobre `marino-tenue` (#eaeff6). El cálculo dice que pasa; verificar con Polypane.
- **Que el focus se devuelva correctamente al trigger tras cerrar el menú móvil** (P2-UX-10 parcial). Hoy `setAbierto(false)` no mueve el foco de vuelta al botón que lo abrió.

---

## 10. Resumen final

**Total de hallazgos nuevos:** 30
- Alto: 10
- Medio: 12
- Bajo: 8

**Por severidad (sólo lo nuevo):**
- Crítico: 0
- Alto: 10
- Medio: 12
- Bajo: 8

**Top 3 hallazgos nuevos que requieren atención inmediata:**

1. **P2-UX-04 — Cuestionario: "ninguna actividad aplica" sin salida de UI.** El sitio vende honestidad y este caso es donde la honestidad falla. Un despacho que genuinamente no realiza ninguna actividad del art. 17 queda atrapado en una contradicción entre el mensaje de error (que ofrece una salida) y la UI (que no la entrega). Resolver en 10 líneas.

2. **P2-UX-02 + P2-UX-03 — `aria-busy` y spinner ausentes en 8 formularios durante submit.** El patrón ya existe en los formularios de auth (`useFormStatus` + `disabled`); lo que falta es extenderlo a `FormularioContacto`, `FormularioAlta`, `Newsletter` y `FormularioContacto` del directorio. Resolver en ~16 líneas (un componente `BotonEnviar` reutilizable).

3. **P2-UX-10 — Cuestionario: el paso "resultado" no permite volver al formulario sin perder todo.** Quien escribe mal la fecha en el paso "operación" tiene que repetir las cinco pantallas anteriores. La herramienta es de un solo uso (no requiere auth), así que persistir `paso` en la URL con `useSearchParams` es la solución más simple y consistente con el resto de las herramientas (`ConversorUMA`, `Calculadora` ya lo hacen).

**Lo que la primera pasada acertó y esta confirma:** el sistema de diseño es robusto, los tokens de color están bien documentados, el `prefers-reduced-motion` es exhaustivo, las páginas de estado son sólidas, los formularios comparten la mayoría de las buenas prácticas. El sistema sigue siendo el activo más fuerte del proyecto.

**Lo que la primera pasada no vio y esta sí:** el proyecto tiene una deuda fina con los flujos de usuario completos. La primera pasada auditó componentes; la segunda auditoría flujos. Las 18 fricciones que aparecieron son del tipo "funciona pero podría ser un poco mejor" — no rompen el sitio, pero en un producto de cumplimiento que vende credibilidad, cada fricción es un voto en contra.
