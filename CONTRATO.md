# Contrato de construcción — LeyAntilavado.org

**Este archivo es la única fuente de verdad para quien construye una parte del producto.**
El contrato de datos está CONGELADO. No lo modifiques: si crees que le falta algo, dilo en tu reporte final.

## Dónde está todo

```
packages/types/src/         ← contrato de tipos (money, legal, evaluacion, directorio)
packages/rules-engine/src/  ← motor jurídico + datos semilla en ./datos
packages/ui/src/            ← primitivos compartidos
apps/web/src/               ← Next 16 + React 19 + Tailwind v4
research/*.md               ← investigación verificada contra DOF/SAT/INEGI (LÉELA)
```

Ejecuta `npm run dev:web` desde la raíz. Puerto **5400**.

## Reglas innegociables del producto

1. **Ningún número legal en un componente.** Todo sale de `@leyantilavado/rules-engine`.
   Si escribes `645` o `117.31` en un `.tsx`, está mal.
2. **Toda conclusión legal lleva `<SelloProcedencia>`** con artículo, fuente y fecha de revisión.
3. **Nunca afirmes cumplimiento.** No existe "cumples", "estás en regla", "no tienes obligaciones".
   Usa los textos de `TITULO_CONCLUSION` / `DETALLE_CONCLUSION` de `@leyantilavado/ui`.
4. **Nunca inventes un dato legal.** Si no está en `research/` ni en los datos semilla,
   escribe el componente para que muestre "Requiere revisión editorial" y repórtalo.
5. **Nada de "certificado por LeyAntilavado.org".** El nivel máximo es "Documentación revisada".
6. **Perfiles patrocinados llevan etiqueta "Patrocinado" visible.** No negociable.
7. **Resultados de herramientas y área privada: `noindex`.** Usa `construirMetadata({ noindex: true })`.
8. **Sin "Lorem ipsum", sin botones muertos, sin rutas vacías.** Si no da tiempo a algo,
   haz un estado vacío honesto que explique qué falta, no un placeholder.

## API del motor (lo que vas a usar)

```ts
import {
  evaluarOperacion, evaluarEfectivo, evaluarAcumulacion, estimarSancion,
  evaluarRiesgo, calcularFechaLimiteAviso, proximasFechasLimite,
  convertirUMA, umaVigenteEn, pesosAUMA, hayUMAPara, derivadosUMA,
  buscarRegla, reglasDeActividad, reglasEfectivoAplicables,
  formatearFechaLarga, formatearFechaCorta, sumarMeses, restarMeses,
  ANIOS_UMA_DISPONIBLES, VERSION_LEGAL, datos,
} from '@leyantilavado/rules-engine';

import { pesosACentavos, formatearMXN, formatearMXNCompacto } from '@leyantilavado/types';

// datos.ACTIVIDADES, datos.UMBRALES, datos.REGLAS_EFECTIVO, datos.SANCIONES,
// datos.OBLIGACIONES, datos.CALENDARIO, datos.FUENTES, datos.VALORES_UMA
```

**Dinero: siempre `Centavos` (enteros).** `pesosACentavos('75664.95')` para entrar,
`formatearMXN(c)` para salir. Nunca hagas aritmética con pesos en float.

**Fechas: siempre `YYYY-MM-DD` string.** El motor NUNCA llama a `Date.now()`; la fecha
"de hoy" se le pasa como parámetro. Respétalo en tus componentes.

### El tipo que más importa

`EspecificacionUmbral` es una unión discriminada de 6 casos:
`siempre` | `nunca` | `uma` | `monto_o_comision` | `variable` | `requiere_revision`.

**Tu UI debe manejar los 6.** Un notario no tiene "un umbral": tiene cinco incisos, tres de
ellos sin monto. Si tu componente asume un número, está mal. TypeScript te obligará.

## Primitivos de UI disponibles

```ts
import {
  Boton, Tarjeta, TarjetaEncabezado, TarjetaCuerpo, TarjetaTitulo,
  Insignia, Nota, Campo, Entrada, Selector, AreaTexto, TablaEnvoltura, EstadoVacio,
  SelloProcedencia, IndicadorConclusion, SupuestosYFaltantes, AvisoIndependencia, cn,
} from '@leyantilavado/ui';
```

Tokens CSS en `apps/web/src/app/globals.css`: `--color-marino` (primario),
`--color-petroleo` (acción), `--color-ambar` (advertencia), `--color-rojo` (riesgo),
`--color-verde` (sin obligación), `--color-tinta` (texto), `--color-marfil` (fondo).
Usa `var(--color-x)` en clases arbitrarias de Tailwind. Clase `.contenedor-app` para el ancho,
`.prosa` para contenido editorial, `.cifra` para números tabulares.

## Trampas de este stack (verificadas, no teóricas)

- **Next 16:** `params` y `searchParams` son `Promise`. `const { slug } = await params`.
- **eslint `react-hooks/purity`:** nada de `new Date()` / `Date.now()` durante el render,
  ni dentro de `useMemo`. Usa `useState(() => ...)` o resuélvelo a nivel de módulo.
  `tsc` NO lo detecta; sólo `next build`.
- **eslint `react-hooks/set-state-in-effect`:** no uses `useEffect` para resetear un formulario.
  Usa un componente interno con `key={...}`.
- **Tailwind v4 — degradados en clase arbitraria NO funcionan.**
  `bg-[linear-gradient(135deg,var(--a),var(--b))]` se descarta **en silencio**: no genera CSS, no
  hay error en consola, y el elemento queda con fondo transparente. Ya produjo un botón con texto
  blanco invisible. Usa las clases reales de `globals.css`: `.relleno-accion`, `.relleno-marino`,
  `.relleno-marca`, `.texto-marca`. Si necesitas otro degradado, agrégalo como clase en
  `@layer components`, no como utilidad arbitraria.
- **Tailwind v4:** sin `tailwind.config`. Una clase arbitraria con `|` o `\/` rompe el CSS.
  Un token por clase.
- **Modo oscuro:** la variante es `oscuro:`, no `dark:`.
- **Next 16:** no pases funciones en objetos de un server page a un client component (500).
- **Zustand:** un selector que devuelve arreglo nuevo cada render (`s => s.x ?? []`) causa
  bucle infinito. Selecciona el valor crudo y aplica el fallback fuera con una const estable.
- **Tema oscuro: NUNCA ramifiques el render con el tema.** El script del `<head>` aplica la clase
  `oscuro` antes de que React hidrate, así que `tema === 'oscuro' ? A : B` rompe la hidratación.
  `useTema()` sólo expone `alternar()`, a propósito. Para estilos usa la variante CSS `oscuro:`:
  `className="bg-white oscuro:bg-slate-900"`. Ya costó un bug; no lo reintroduzcas.
- **NO ejecutes `next build`.** La máquina se satura con varios agentes compilando a la vez.
  Verifica con `npx tsc --noEmit` desde `apps/web` y ya. El build final lo corro yo una vez.

## Accesibilidad (WCAG AA, obligatorio)

Etiquetas visibles en todo campo (el placeholder no es etiqueta) · error junto al campo ·
objetivos táctiles ≥44px · foco visible (nunca `outline: none`) · contraste ≥4.5:1 ·
`prefers-reduced-motion` respetado · tablas anchas con scroll propio, nunca el `body` ·
íconos SVG de `lucide-react`, jamás emojis como íconos · `cursor-pointer` en todo clicable.

## Idioma

Español de México. Claro y práctico, sin jerga jurídica innecesaria. Tuteo.
Los identificadores del código también van en español (así está el resto del repo).
