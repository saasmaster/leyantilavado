> **Cerrado el 24 de agosto de 2026.** Las 24 imágenes de la segunda tanda
> pasaron la revisión completa y están integradas: los 17 oficios tienen foto,
> las 10 rutas principales tienen tarjeta social propia, y las 3 bandas y los
> 3 reemplazos de herramientas están en producción.
>
> Se conserva el documento por la sección «Regla que manda sobre todas las
> demás» y por el registro de lo descartado en la primera tanda.

# Imágenes que faltan — LeyAntilavado.org

**Actualizado:** 24 de agosto de 2026.
De las 71 propuestas se integraron 15. Este documento lista lo que falta, con
dimensiones y encuadre, listo para pasarlo al generador.

---

## Regla que manda sobre todas las demás

**Ninguna imagen puede contener texto legible.** Ni cifras, ni fechas, ni
sellos, ni documentos con letra que se lea. Tres motivos, en orden de gravedad:

1. **Una cifra dentro de un JPEG no se puede verificar ni actualizar.** La UMA
   cambia cada 1 de febrero; el sitio entero existe para que los números salgan
   del motor versionado. Un umbral pintado en una imagen queda viejo y nadie se
   entera.
2. **El texto que genera la IA suele estar mal.** Entre las propuestas venían
   una multa de la City of London por aparcar en línea amarilla, un sello de
   notaría de California y un cuestionario sobre rutinas de café.
3. **Un profesional del gremio lo detecta de un vistazo**, y justo en la página
   que más le importa.

Fotografía de objetos, luz natural, sin letreros. Envejece bien y no miente.

**Nunca** usar el logotipo del SAT ni de ninguna autoridad: implica un aval
oficial que el sitio niega expresamente en cada página.

---

## 1 · Prioridad alta — oficios sin foto (8)

Formato: **1800 × 1000 px** (encuadre 16:9; la página recorta a 21:9 en
escritorio, así que **el motivo debe caber en la franja central**, con aire
arriba y abajo que se pueda perder).

| Ruta | Qué mostrar | Nota |
|---|---|---|
| `/para/notarias` | Un protocolo notarial mexicano encuadernado, con listón, sobre un escritorio de madera | **Reemplaza a la descartada.** Sin sellos legibles: los sellos de fe pública mexicanos no se parecen a los estadounidenses |
| `/para/corredores-publicos` | Una póliza mercantil atada, junto a una pluma y un secante | Sin membretes |
| `/para/contadores` | Escritorio con calculadora, carpetas de argollas y una taza | Sin logotipos de software |
| `/para/abogados` | Estantería de códigos encuadernados en piel, luz lateral | Lomos sin títulos legibles |
| `/para/agentes-aduanales` | Cajas de embalaje con fleje y un sello de goma, en un almacén luminoso | Sin nombres de navieras |
| `/para/blindadoras` | Corte de vidrio laminado o placa balística sobre banco de taller | Objeto, no vehículo completo |
| `/para/traslado-de-valores` | Maletín metálico cerrado con candado, sobre una mesa | Sin logotipos de empresa |
| `/para/casinos-y-sorteos` | Fichas de casino apiladas y un cubilete, luz cálida | Sin marcas de casino reales |

## 2 · Prioridad alta — imágenes sociales por página (10)

Formato: **1200 × 630 px** exactos (lo que exigen WhatsApp, LinkedIn y X).

Hoy **las 164 URL comparten una sola imagen social**. Es el punto que la
auditoría marcó como la mejora de mayor retorno por esfuerzo: en LinkedIn y
WhatsApp la tarjeta es lo que decide el clic.

Rutas, por orden de tráfico esperado: `/umbrales`, `/obligaciones`, `/multas`,
`/limites-efectivo`, `/calendario-cumplimiento`, `/reforma-ley-antilavado-2026`,
`/preguntas-frecuentes`, `/glosario`, `/directorio`, `/herramientas`.

**El texto lo compone el sitio, no la imagen.** Manda sólo la fotografía de
fondo; el título y la cifra se dibujan encima en tiempo de build, con los datos
del motor. Así la tarjeta de `/umbrales` se actualiza sola cada 1 de febrero.

## 3 · Prioridad media — bandas a sangre (3)

Formato: **2560 × 1440 px** (las actuales son de 1600 px y se estiran en
pantallas grandes; es el único defecto técnico que arrastran las que ya están).

Composición pensada para llevar texto encima: **la mitad izquierda debe quedar
tranquila** —sin motivo, sin alto contraste— porque ahí va el titular.

| Dónde | Qué mostrar |
|---|---|
| `/calendario-cumplimiento` | Una agenda abierta con luz de ventana, sin fechas legibles |
| `/reforma-ley-antilavado-2026` | Dos libros de leyes, uno abierto y uno cerrado, sugiriendo antes y después |
| `/obligaciones` | Archivador de fuelle con expedientes ordenados |

## 4 · Prioridad media — herramientas (3 reemplazos)

Formato: **1600 × 1200 px** (4:3).

Reemplazan a las tres descartadas por llevar contenido falso legible:

| Herramienta | Qué mostrar | Por qué se descartó la anterior |
|---|---|---|
| `/herramientas/cuestionario` | Un formulario en blanco con lápiz, letra ilegible | Decía «SLOW LIVING SURVEY», con preguntas sobre café |
| `/herramientas/calculadora-multas` | Balanza y monedas, luz seria | Era una multa de estacionamiento de Londres, £80 |
| `/herramientas/plan-30-noviembre` | Calendario de sobremesa **sin mes ni números legibles** | Marcaba octubre; la fecha del plan es el 30 de noviembre |

## 5 · Prioridad baja — retrato del responsable

Formato: **1200 × 1200 px**, fotografía real.

No es material decorativo: la auditoría marcó como el hallazgo de contenido más
grave que el sitio no identifica a un responsable con nombre. En un sitio YMYL
de cumplimiento normativo, una persona con cara y credenciales pesa más que
cualquier fotografía de escritorio. **No sirve una imagen generada**: tiene que
ser quien de verdad responda por el contenido.

---

## Qué ya está integrado (15)

| Dónde | Imagen |
|---|---|
| Portada, banda con paralaje | `hero-02-timeline-uma` |
| `/umbrales` | `hero-01-portada` (balanza) |
| `/limites-efectivo` | `realistic-og-04` (billetes mexicanos) |
| `/multas` | `realistic-og-03` (mazo) |
| 9 páginas `/para/*` | `seg-02` a `seg-10` |
| En reserva, sin colocar aún | `hero-03`, `hero-04`, `hero-05`, `flujo-03`, `flujo-07`, `cover-03`, `cover-04`, `bg-03`, `bg-05`, `realistic-og-05` |

## Qué se descartó y por qué

| Familia | Motivo |
|---|---|
| `es-*` (10) | Rótulos con texto incrustado: cifras legales en el JPEG, año equivocado, textos de relleno genéricos y el logotipo y dominio de otra empresa (`directorioprofesional.es`) |
| `og-01`, `og-05` | Umbrales incrustados en la imagen; meses en inglés |
| `tool-03`, `tool-05`, `tool-08` | «SLOW LIVING SURVEY»; multa de Londres; mes equivocado |
| `seg-01` | Sello legible de «NOTARY PUBLIC · STATE OF CALIFORNIA» |
| `SAT-logo` | Usar el logotipo de la autoridad implica un aval oficial que el sitio niega |

**Pendiente de sustituir aunque esté publicada:** el mazo de `/multas`. No es un
dato falso, pero las sanciones de la LFPIORPI son administrativas —las impone la
autoridad fiscal, no un juez—, así que un mazo de tribunal sugiere un proceso
que no es el que describe la página.
