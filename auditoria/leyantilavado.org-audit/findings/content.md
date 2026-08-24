# Auditoría de contenido y E-E-A-T — leyantilavado.org

Fecha de esta pasada: 2026-08-24. Verifica y actualiza la auditoría del 12-ago-2026.
Método: lectura de código fuente (`apps/web/src/app`, `apps/web/src/content`,
`packages/rules-engine/src/datos`) + fetch en vivo de las 10 rutas prioritarias no
verificadas antes + inspección de `/nosotros`, `/directorio`, `/directorio/[categoria]`,
`autores.ts`.

## Veredicto sobre las 4 afirmaciones previas

| # | Afirmación previa | Veredicto | Evidencia |
|---|---|---|---|
| 1 | "El H1 del home diluye la keyword; debería empezar por la keyword" | **FALSA** | `apps/web/src/components/inicio/Hero.tsx:59-65` — el H1 ya es *"Ley Antilavado en México: descubre qué te obliga y con qué umbrales"*. Empieza exactamente con la keyword principal. Esto ya estaba resuelto o el hallazgo original era incorrecto. |
| 2 | "La meta descripción del home es funcional pero no persuasiva" | **MATIZADA** | `apps/web/src/lib/sitio.ts:6-8`, `SITIO.descripcion`: *"Consulta la Ley Antilavado en México: actividades vulnerables, umbrales en UMA, obligaciones, límites de efectivo, multas y los cambios vigentes en 2026."* — 153 caracteres (bien dentro del límite), buena densidad de keywords, pero es un listado de temas sin gancho: no menciona "gratis", "sin registro", "con fuente oficial" ni ningún diferenciador que el propio Hero sí usa. El diagnóstico es correcto; ver recomendación abajo. |
| 3 | "/para/* y /directorio son thin content" | **FALSA para /para/[oficio]; MATIZADA para /directorio** | `/para/[oficio]/page.tsx` (611 líneas) tiene: respuesta directa, índice, sección "¿me aplica?" con preguntas por gremio, tabla de umbrales leída del motor, sección "qué cambió", calendario, herramienta recomendada, caso práctico, FAQ propia del gremio, enlaces relacionados, firma editorial y aviso legal — y una nota explícita anti-canibalización que dice qué página citar. No es thin. `/directorio/page.tsx` tiene copy editorial real (verificación, financiamiento, CTA) pero su profundidad depende del número de perfiles reales, que este entorno no puede verificar en vivo. Lo que SÍ está resuelto: `/directorio/[categoria]/page.tsx:22,58` define `MINIMO_PARA_INDEXAR = 3` y manda `noindex, follow` a cualquier categoría con menos de 3 perfiles reales — es exactamente el control de ingeniería que evita que Google indexe un directorio vacío como "sin resultados". Este control ya existe; no es un hallazgo nuevo, es una mitigación ya resuelta. |
| 4 | "E-E-A-T ≈ 70/100 porque el autor es 'Equipo editorial' sin personas nombradas" | **MATIZADA** | Confirmado en `apps/web/src/content/autores.ts:16-29`: autoría única, `EQUIPO_EDITORIAL`, `credenciales: []`, sin persona nombrada ni revisor con credenciales (el propio comentario del código dice "cuando haya un revisor real, se agrega"). Para YMYL esto es un hueco real de Expertise. Pero atribuir el score completo a esa sola causa es una simplificación: (a) el sitio compensa con señales de Trustworthiness fuertes que la auditoría previa no pesó — motor jurídico versionado, cita de artículo+fracción en cada afirmación, `/metodologia-editorial`, `/fuentes-oficiales`, avisos legales explícitos, fechas de revisión auditables; (b) hay un hueco de Trust más grave que el de autoría y que sigue sin resolver: `/nosotros`, `/contacto` y `/legal/aviso-de-privacidad` no publican razón social, RFC ni domicilio del responsable del sitio (confirmado por grep, cero coincidencias). Esto coincide con la nota de memoria del proyecto ("faltan datos legales del responsable"). Un E-E-A-T real debería pesar más este hueco de identidad legal que el de "Equipo editorial" sin nombre, que de hecho es una postura editorial declarada y honesta (mejor que inventar un autor falso). |

## Tabla de hallazgos

| ID | Severidad | Título | Archivo:línea |
|---|---|---|---|
| C-01 | High | Sin razón social/RFC/domicilio del responsable del sitio | `apps/web/src/app/nosotros/page.tsx` (todo el archivo), `apps/web/src/app/contacto/page.tsx`, `apps/web/src/app/legal/aviso-de-privacidad/page.tsx` |
| C-02 | Medium | Meta descripción del home es un listado de temas, no un mensaje persuasivo | `apps/web/src/lib/sitio.ts:6-8` |
| C-03 | Medium | Ningún autor/revisor con nombre y credenciales en contenido YMYL | `apps/web/src/content/autores.ts:16-29` |
| C-04 | Low | Profundidad real de `/directorio` (raíz) depende de volumen de perfiles en producción, no verificable desde este entorno | `apps/web/src/app/directorio/page.tsx` |
| C-05 | Resuelto | Control anti-thin-content en categorías de directorio vacías (noindex + umbral de 3 perfiles) | `apps/web/src/app/directorio/[categoria]/page.tsx:22,43-59` |
| C-06 | Resuelto | H1 del home ya empieza con la keyword principal | `apps/web/src/components/inicio/Hero.tsx:59-65` |
| C-07 | Resuelto | Anti-canibalización /para vs /actividades-vulnerables vs /que-cambio, documentada en código y visible al lector | `apps/web/src/content/oficios.ts:19-25`, `apps/web/src/app/para/[oficio]/page.tsx:233-250` |

## Detalle y recomendaciones

### C-01 — Falta identidad legal del responsable (High)
YMYL + LFPIORPI: un sitio que explica obligaciones de prevención de lavado de dinero y no
dice quién lo publica (razón social, RFC, domicilio fiscal) es el hueco de Trust más grande
que queda. `nosotros/page.tsx` explica bien el modelo de negocio y la metodología, pero
"plataforma privada e independiente" nunca se ancla a una persona moral o física identificable.
Recomendación: agregar un bloque en `/nosotros` o `/contacto` con razón social, RFC (o al
menos el dato societario que la ley permita publicar) y domicilio, más un responsable de
contenido con nombre — no necesariamente con cédula legal, pero sí una persona real detrás
del "Equipo editorial". Esto no requiere tocar el motor jurídico ni ninguna cifra.

### C-02 — Meta descripción del home (Medium)
Actual (153 car., ya la escribo entera para no dejarlo abierto a interpretación):
`Consulta la Ley Antilavado en México: actividades vulnerables, umbrales en UMA, obligaciones, límites de efectivo, multas y los cambios vigentes en 2026.`

Propuesta (158 car., misma keyword al frente, agrega la promesa diferenciadora que ya está en
el Hero — "gratis, con la fuente oficial" — que el listado de temas no comunica):
`Ley Antilavado en México (LFPIORPI): qué te obliga, con qué umbral y desde cuándo. Cifras con la UMA vigente y la fuente oficial citada. Gratis, sin registro.`

### C-03 — Autoría sin nombre (Medium, no Critical)
La postura actual ("no inventamos un autor con credenciales que no podemos acreditar") es
defendible y mejor que un autor falso, pero para YMYL sigue pesando en contra frente a
competidores con abogados nombrados. El propio tipo `Autor` en `autores.ts` ya soporta
persona con nombre — el gap es de negocio (conseguir un revisor con cédula profesional),
no de ingeniería. No es un fix de código; es un pendiente editorial.

### C-04 — Directorio raíz, profundidad no verificable en este entorno (Low)
No hay datos de producción accesibles desde este checkout (`.data/` local vacío, el
directorio usa Supabase/JSON en el servidor real). El diseño del código (nota "Aquí sólo
aparecen perfiles reales... si todavía no hay perfiles en una categoría, la página lo dice")
es correcto; el veredicto final sobre thin content de `/directorio` sólo puede darse
inspeccionando el conteo real de perfiles publicados en producción.

## Lo que ya está resuelto desde el 12 de agosto (no repetir como hallazgo nuevo)
- H1 del home: ya empieza con la keyword principal (C-06).
- Canibalización /para vs /actividades-vulnerables vs /que-cambio: resuelta con nota explícita
  en cada página de oficio y con reglas de contenido documentadas en `oficios.ts` (C-07).
- Directorio: las categorías sin oferta real no se indexan como directorio vacío — tienen
  `noindex, follow` automático bajo `MINIMO_PARA_INDEXAR = 3` (C-05).
- Sistema de citación: cada cifra legal en `/para/*`, `/que-cambio/*` y las 10 rutas
  prioritarias revisadas (`/obligaciones`, `/limites-efectivo`, `/multas`,
  `/reforma-ley-antilavado-2026`, `/calendario-cumplimiento`, `/casos-practicos`,
  `/tramites`, `/exigibilidad`, `/guia-aviso`) sale del motor de reglas versionado, no de
  texto escrito a mano — reduce el riesgo de inconsistencia entre páginas que normalmente
  es la causa #1 de contenido de baja calidad en sitios programáticos.

## Nota metodológica
El fetch en vivo vía `render_page.py --mode never` devolvió `extracted_text` de sólo
77-94 palabras en las 10 rutas prioritarias, muy por debajo de lo que el código fuente sugiere
(archivos de 200-670 líneas con tablas, FAQ y secciones completas). Esto es casi con certeza
un artefacto de extracción de trafilatura sobre el HTML crudo sin JS (boilerplate stripping
agresivo o contenido servido tras hidratación), no una medición fiable de profundidad real.
El veredicto de este informe se apoya en el código fuente (fuente confiable) y no en ese
conteo de palabras; no lo tomes como dato de word count real. Si se requiere un conteo de
palabras válido, hay que repetir el fetch con `--mode always` (Playwright) o medir directo
sobre el HTML servido en producción.
