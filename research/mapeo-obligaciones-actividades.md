# Mapeo obligación → actividad vulnerable (propuesta editorial, SIN revisión jurídica firmada)

**Fecha del reporte:** 14 de agosto de 2026
**Objeto:** cerrar el hueco de `actividades: []` en `packages/rules-engine/src/datos/obligaciones.ts`, donde las 19 obligaciones del motor tenían la lista de actividades vacía sin que nadie hubiera dicho si eso significaba «alcanza a todas» o «nadie lo ha mirado».

> **Este documento no es la revisión jurídica humana firmada que el proyecto tiene como bloqueante.** Es una propuesta de alcance contrastada contra el texto oficial, para que esa revisión tenga algo concreto que confirmar o tumbar. Nada de aquí debe publicarse como verificado.

**Fuentes primarias leídas en esta pasada:**

| Documento | Versión | Origen | Consultado |
|---|---|---|---|
| LFPIORPI | Texto vigente, última reforma **DOF 16-07-2025** (39 pp., PDF extraído íntegro) | https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPIORPI.pdf | 14-08-2026 |
| Reglamento de la LFPIORPI | Texto vigente, última reforma **DOF 27-03-2026** (PDF extraído íntegro) | https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LFPIORPI.pdf | 14-08-2026 |

**Fuentes secundarias (dossieres internos, no re-verificados aquí):** `research/01-acuerdo-115-2026.md` y `research/03-ley-obligaciones-sanciones.md`, para todo lo que depende de las reglas de carácter general (Acuerdo 115/2026, DOF 07-08-2026). **El texto del Acuerdo 115/2026 NO se leyó en esta pasada**: cada obligación que depende sólo de él lo dice abajo y baja de confianza por eso.

---

## 1. Resultado en una línea

**Las 19 obligaciones alcanzan a las 22 actividades vulnerables. Ninguna quedó acotada a un subconjunto, y ninguna quedó en «no pude determinarlo».**

| Resultado | Obligaciones |
|---|---|
| Aplica a **todas** las actividades | **19 de 19** |
| Acotada a un subconjunto | 0 |
| No determinable con las fuentes leídas | 0 |

La razón es una sola frase, y es el encabezado del artículo que crea casi todas estas obligaciones:

> «**Artículo 18.** Quienes realicen las Actividades Vulnerables a que se refiere el artículo anterior tendrán las obligaciones siguientes:»
> — LFPIORPI, texto vigente DOF 16-07-2025

El art. 18 no reparte obligaciones por fracción del art. 17: las impone a todo el que realiza cualquiera de ellas. Lo mismo hacen los dos artículos que sostienen el resto del catálogo:

> «**Artículo 20.** Las personas morales y quienes actúen a través de fideicomisos o cualquier otra figura jurídica **que realicen Actividades Vulnerables**, deberán designar ante la Secretaría a una persona Representante Encargada del Cumplimiento…»

> «**Artículo 23.** **Quienes realicen Actividades Vulnerables de las previstas en el artículo 17 de esta Ley**, presentarán ante la Secretaría los Avisos correspondientes, a más tardar el día 17 del mes inmediato siguiente…»

### Lo que sí cambia por actividad (y no es el alcance)

Distinguir esto es la mitad del hallazgo. Por actividad cambian tres cosas, ninguna de las cuales es *si la obligación aplica*:

1. **El umbral que dispara la operación reportable** — art. 17. Eso ya vive en `umbrales.ts` y ya está mapeado.
2. **La vía por la que se cumple** — comercio exterior presenta el Aviso por el sistema del pedimento (art. 16 del Reglamento) y los notarios pueden hacerlo por el sistema de declaraciones y avisos fiscales federales (art. 24, último párrafo de la Ley). Cambia el canal, no la obligación.
3. **El contenido del expediente de identificación** — los Anexos 1 a 10 de las reglas de carácter general varían por tipo de actividad y de cliente. Cambia qué papeles lleva el expediente, no si hay que integrarlo.

### Qué debería hacer la interfaz con esto

- **No hay filtro de obligaciones por actividad que construir**, y las dos secciones que decían en voz alta «no podemos filtrar por actividad» estaban describiendo un hueco que no existía: la respuesta correcta no es un filtro vacío, es la frase «las 19 obligaciones te alcanzan, tengas la actividad que tengas».
- La página de una actividad puede listar las 19 sin acotar, y **debe** hacerlo: dejar el listado fuera sugiere que a esa actividad le toca menos.
- Lo que sí merece filtro por actividad es lo otro: umbral, vía de cumplimiento y anexo de expediente.
- La afirmación equivalente que ya vive en `apps/web/src/content/cambios-por-actividad.ts` (`actividades: 'todas'` para el bloque `obligaciones-nuevas`, justificada con «El art. 18 enumera las obligaciones de quien realiza cualquier actividad vulnerable del art. 17, sin distinguir fracción») **coincide con esta pasada**. Dos rutas independientes llegaron al mismo sitio.

---

## 2. Cómo quedó codificado, y por qué el archivo casi no cambia

`packages/types/src/legal.ts` ya documenta la semántica:

```ts
/** Vacío = aplica a todas las actividades vulnerables. */
actividades: readonly ActividadSlug[];
```

y la página de administración se lo dice al editor con las mismas palabras: «una lista vacía significa "a todas"».

Como la conclusión de esta pasada es «todas» para las 19, **`actividades: []` ya era la codificación correcta**. Enumerar los 22 slugs en cada obligación sería una segunda codificación de lo mismo, que además se rompe sola la próxima vez que una reforma adicione una fracción (como pasó con V Bis y XII-D en julio de 2025). Se dejó vacío.

Lo que faltaba no era el dato: era **decir cuál de las dos cosas significaba el vacío**. Por eso el cambio real es un campo `alcance` obligatorio en cada definición, que arrastra la cita y se imprime en el `notaEditorial` del sello de procedencia de cada página de obligación. Ser obligatorio es deliberado: una obligación nueva no puede entrar al catálogo sin declarar su alcance.

Cada nota sale a la página así, bajo la insignia ámbar de «Fuente secundaria»:

> *«Alcance: todas las actividades vulnerables. \[cita]. **Mapeo de alcance propuesto por la redacción, sin revisión jurídica firmada.** El resto de la ficha sigue pendiente de contraste literal contra el texto vigente y el Acuerdo 115/2026.»*

### Lo que deliberadamente NO se tocó

- **`verificacion` sigue en `fuente_secundaria`** en las 19. Subirlo a `oficial_verificado` sería mentir: se verificó el *alcance*, no los pasos ni la recurrencia. Bajarlo a `no_verificado` pintaría de rojo la LFPIORPI entera en `/fuentes-oficiales` por un dato que hoy está **mejor** sustentado que ayer.
- **`estado` sigue en `revisado`**. Bajarlo a `borrador` sacaría 19 páginas del sitemap de un sitio en vivo, a cambio de nada: la advertencia ya la lleva la nota.
- **No se añadió campo al tipo `Obligacion`.** `apps/web` y `packages/types` quedaron fuera del ámbito de esta pasada.

---

## 3. Ficha por obligación

Confianza: **alta** = cita literal del texto oficial leído en esta pasada · **media** = cita literal de la Ley o el Reglamento, con desarrollo en el Acuerdo 115/2026 que no se leyó aquí · **baja** = descansa sobre todo en dossier interno.

### 3.1 `alta-sppld` — Alta y registro en el padrón

- **Propuesta:** todas · **Confianza: alta**
- **Cita (LFPIORPI, art. 18, fr. IV Bis, adicionada DOF 16-07-2025):** «Para realizar el alta y registro y sus actualizaciones, **quienes realicen las Actividades Vulnerables establecidas en el artículo 17 de la Ley** deberán enviar la información, documentación, datos e imágenes a través de los medios electrónicos y en el formato oficial que para tales efectos determine la Secretaría».
- **⚠ Hallazgo colateral — cita equivocada en el dato.** El registro dice `disposicion: 'Art. 18, fracción I'`. La fracción I es la identificación del cliente; el alta en el padrón es la **fracción IV Bis**. **No se corrigió**: cambiar la disposición que el sitio imprime es materia de la misma revisión jurídica firmada que valida este documento. Ver §5.

### 3.2 `representante-cumplimiento` — Representante encargado del cumplimiento

- **Propuesta:** todas · **Confianza: alta**
- **Cita (art. 20, reformado DOF 16-07-2025):** «Las personas morales y quienes actúen a través de fideicomisos o cualquier otra figura jurídica **que realicen Actividades Vulnerables**, deberán designar ante la Secretaría a una persona Representante Encargada del Cumplimiento de las obligaciones derivadas de esta Ley, y mantener vigente dicha designación».
- **Matiz:** el art. 20 acota por **tipo de persona**, no por actividad — «Las personas físicas que realicen Actividades Vulnerables, cumplirán personal y directamente». El eje es persona moral / fideicomiso vs. persona física, y ese eje no es `ActividadSlug`.

### 3.3 `identificacion-cliente` — Identificación del cliente o usuario

- **Propuesta:** todas · **Confianza: alta**
- **Cita (art. 18, encabezado + fr. I):** «Quienes realicen las Actividades Vulnerables a que se refiere el artículo anterior tendrán las obligaciones siguientes: I. Identificar y conocer de manera directa a las personas Clientes o Usuarias con quienes realicen la Actividad Vulnerable y verificar su identidad…».
- Sin excepción por fracción. La única modulación es de umbral: por debajo del umbral de identificación del art. 17 no nace el acto reportable, pero eso es el umbral, no el alcance de la obligación.

### 3.4 `expedientes` — Integración y actualización de expedientes

- **Propuesta:** todas · **Confianza: media**
- **Cita (art. 18, fr. II):** «Para los casos en que se establezca una Relación de negocios, se solicitará a la Persona Cliente o Usuaria la información sobre su actividad u ocupación…». El expediente único como tal vive en el art. 12 de las reglas generales (no leído aquí).
- **Lo que sí varía por actividad:** los **Anexos 1 a 10** de las reglas generales fijan el contenido del expediente por tipo de actividad y de cliente. `research/03` los declara **no leídos**. Si algún día se quiere una vista «qué papeles me piden a mí», sale de ahí — y ésa sí es información por actividad.
- **⚠ Hallazgo colateral:** la fr. II citada trata de actividad u ocupación del cliente, no de la integración del expediente. La cita es imprecisa. Ver §5.

### 3.5 `beneficiario-controlador` — Beneficiario controlador

- **Propuesta:** todas · **Confianza: alta**
- **Cita (art. 18, fr. III):** «Cuando la Cliente o Usuaria sea persona moral, fideicomiso u otra figura jurídica, recabar documentos u otros medios de identificación con reconocimiento oficial que permita identificar a su Beneficiario Controlador… Cuando la Cliente o Usuaria sea **persona física**, recabar la declaración acerca de si tiene o no conocimiento de la existencia de una persona Beneficiario Controlador».
- Los dos supuestos juntos cubren a cualquier cliente. Las excepciones del art. 23 Quinquies 2 de las reglas generales (clientes que cotizan en bolsa) dependen del **cliente**, no de la actividad de quien lo atiende.

### 3.6 `conservacion-diez-anios` — Conservación por diez años

- **Propuesta:** todas · **Confianza: media** · **Cabo suelto declarado**
- **Cita (art. 18, fr. IV, segundo párrafo):** «La información y documentación a que se refiere el párrafo anterior deberá conservarse de manera física o electrónica, **en el domicilio registrado ante la Secretaría para este efecto, excepto para la fracción XIV del artículo 17 de esta Ley**, por al menos un plazo de diez años contado a partir de la fecha de la realización de la Actividad Vulnerable».
- **Éste es el único punto de todo el catálogo donde la Ley nombra una fracción del art. 17 dentro de una obligación.** Y es ambiguo: la excepción puede recaer sobre **el domicilio registrado** (comercio exterior conserva donde manda la normativa aduanera) o sobre **el plazo de diez años** (comercio exterior exento).
- **Por qué se propone «todas» y no «todas menos comercio exterior»:** el Reglamento impone el plazo sin excluir a nadie —

  > «**Artículo 20.** Quienes realicen las Actividades Vulnerables establecidas en el artículo 17 de la Ley deberán conservar de manera física o electrónica copia de los Avisos e Informes presentados, la documentación soporte de los mismos, así como los acuses electrónicos correspondientes que se hayan generado, **por un plazo no menor a diez años**» — RLFPIORPI, reformado DOF 27-03-2026

  y porque el error asimétrico manda: decirle a una agencia aduanal que está exenta de conservar diez años, si la lectura correcta era la del domicilio, es exactamente el daño que este proyecto quiere evitar. La lectura contraria sólo le pide guardar papeles de más.
- **Qué haría falta para cerrarlo:** criterio del SAT/UIF, o exposición de motivos del decreto de 16-07-2025 sobre por qué se introdujo la salvedad. Va a §5.

### 3.7 `avisos` — Presentación de avisos el día 17

- **Propuesta:** todas · **Confianza: alta**
- **Cita (art. 23, reformado DOF 16-07-2025):** «Quienes realicen Actividades Vulnerables de las previstas en el artículo 17 de esta Ley, presentarán ante la Secretaría los Avisos correspondientes, a más tardar el día 17 del mes inmediato siguiente…».
- **Lo que sí varía por actividad — la VÍA, no el deber.** Dos canales especiales, ambos con cita literal:
  - **Comercio exterior (fr. XIV):** «quienes realicen la Actividad Vulnerable referida en la fracción XIV del artículo 17 de la Ley, darán cumplimiento a la obligación de presentación de Avisos **mediante el sistema electrónico por el cual se transmita la información del pedimento al SAT**» (RLFPIORPI art. 16, reformado DOF 27-03-2026).
  - **Notarios (fr. XII-A inciso a):** «Las y los notarios públicos podrán cumplir las obligaciones de presentar los Avisos que señala el inciso a) del Apartado A de la fracción XII del artículo 17 de la Ley, **únicamente cuando sean presentados a través de los medios que establezcan las disposiciones fiscales federales**» (LFPIORPI art. 24, último párrafo).
  - Y un canal opcional para cualquiera: la **Entidad Colegiada** del art. 26, abierta a «las personas que realicen Actividades Vulnerables, incluidas quienes actúen por medio de fideicomisos».
- Si algún día se quiere una vista «cómo presento yo el aviso», ahí hay tres casos y sí son por actividad.

### 3.8 `informes-en-ceros` — Informe en ceros

- **Propuesta:** todas · **Confianza: media**
- La obligación nace del **alta en el padrón**, no de la fracción. Cita del Reglamento (art. 12, último párrafo): quien deja de realizar actividades vulnerables debe tramitar su baja y, **de no hacerlo, debe seguir presentando Avisos o Informes**. El desarrollo está en el art. 25 de las reglas generales — **no leído en esta pasada**, tomado de `research/03` §11.
- Corolario para la interfaz: el informe en ceros es de todos, incluidos quienes «no operaron este mes», que es justo el grupo que cree que no le toca.

### 3.9 `operaciones-inusuales` — Aviso de 24 horas

- **Propuesta:** todas · **Confianza: alta**
- **Cita (art. 18, fr. VI, segundo párrafo, reformado DOF 16-07-2025):** «En caso de sospecha o de contar con información basada en hechos o indicios, de que los recursos relacionados con los actos u operaciones pudieran provenir o estar destinados a la comisión de los Delitos de Operaciones con Recursos de Procedencia Ilícita, deberán presentar Aviso dentro de las 24 horas siguientes… **incluso si el acto u operación no se celebró**».
- El disparador es la sospecha. No hay fracción, no hay umbral, ni siquiera hace falta que la operación exista.

### 3.10 `enfoque-basado-riesgos` — Metodología de enfoque basado en riesgos

- **Propuesta:** todas · **Confianza: alta**
- **Cita (art. 18, fr. VII, adicionada DOF 16-07-2025):** «Llevar a cabo una evaluación con un enfoque basado en Riesgos, en términos de las reglas de carácter general que al efecto emita la Secretaría, que les permita identificar, analizar, entender y mitigar sus Riesgos, así como los de las personas Clientes o Usuarias».
- **Corroboración por contraste:** el art. 34 Ter de las reglas generales tuvo que decir expresamente que los **apartados C y D de la fracción XII** (servidores públicos con fe pública y personas facilitadoras) observan los capítulos II Quáter, III Bis, III Ter, X, XII, XIII y XIV **«en lo conducente»**. Que haga falta esa regla para los dos apartados más raros confirma que a todos los demás les aplica de lleno — y que a esos dos les aplica igual, sólo que modulada. Ninguno queda fuera. (Vía `research/01` §3.9; el Acuerdo no se leyó aquí.)

### 3.11 `clasificacion-clientes` — Clasificación de clientes por riesgo

- **Propuesta:** todas · **Confianza: media**
- Desarrolla el art. 18 fr. VII (cita en §3.10) en el capítulo III Bis de las reglas generales, **no leído en esta pasada**. Vía `research/01` §3.2, con la misma corroboración del art. 34 Ter.

### 3.12 `perfil-transaccional` — Perfil transaccional y revisión semestral

- **Propuesta:** todas · **Confianza: alta** (en el alcance; media en el detalle semestral)
- **Cita (art. 18, fr. X, adicionada DOF 16-07-2025):** «Contar con mecanismos automatizados que les permitan llevar a cabo un monitoreo permanente de los actos u operaciones que realicen con las personas Clientes o Usuarias para identificar aquellas que **no se encuentren dentro del perfil transaccional** de las personas Clientes o Usuarias…».
- La revisión semestral sale del capítulo III Ter de las reglas generales, no leído aquí.

### 3.13 `personas-politicamente-expuestas` — PEP

- **Propuesta:** todas · **Confianza: alta**
- **Cita (art. 18, fr. VIII, adicionada DOF 16-07-2025):** «Elaborar y observar un Manual de Políticas Internas que contenga los criterios, medidas y procedimientos necesarios para cumplir con las obligaciones previstas en la presente Ley, **incluyendo las que les permitan identificar y dar seguimiento a los actos u operaciones que lleven a cabo con Personas Políticamente Expuestas**».
- Reforzado por la fr. X: los mecanismos automatizados «también deben permitir dar un seguimiento intensificado a las personas Clientes o Usuarias que sean consideradas Personas Políticamente Expuestas o de alto Riesgo».

### 3.14 `manual-cumplimiento` — Manual de políticas internas

- **Propuesta:** todas · **Confianza: alta**
- **Cita:** art. 18, fr. VIII (transcrita en §3.13).
- **Matiz que NO es alcance:** el art. 37 Bis 2 de las reglas generales permite omitir la política de un acto que el obligado decide no realizar, «siempre que se haga constar en el Manual». Depende de lo que cada quien decide hacer, no de su fracción del art. 17 — y la exención cesa en cuanto realiza ese acto.

### 3.15 `mecanismos-automatizados` — Mecanismos automatizados

- **Propuesta:** todas · **Confianza: alta**
- **Cita:** art. 18, fr. X (transcrita en §3.12).
- **Matiz:** las reglas generales gradúan el mecanismo «al volumen, naturaleza, complejidad y al Riesgo», y la definición del art. 3 fr. XI Ter admite desde sistemas especializados hasta hojas de cálculo. Gradúa por tamaño y riesgo, **no** por actividad, y nunca hasta cero.

### 3.16 `capacitacion` — Capacitación anual

- **Propuesta:** todas · **Confianza: alta**
- **Cita (art. 18, fr. IX, adicionada DOF 16-07-2025):** «Desarrollar procesos para la selección de personal, así como **adoptar programas de capacitación anuales**, dirigidos a quienes integran su órgano de administración o persona administradora única, directivas, personas representantes encargadas de cumplimiento y empleadas o empleados que tengan relación directa con las personas Clientes o Usuarias…».
- Reforzado por el art. 20, tercer párrafo: «La persona Representante Encargada del Cumplimiento deberá recibir anualmente capacitación».

### 3.17 `investigacion-personal` — Selección e investigación de personal

- **Propuesta:** todas · **Confianza: alta**
- **Cita:** art. 18, fr. IX — misma fracción que la capacitación, primera mitad: «Desarrollar procesos para la selección de personal».

### 3.18 `auditoria-anual` — Auditoría anual de cumplimiento

- **Propuesta:** todas · **Confianza: alta**
- **Cita (art. 18, fr. XI, adicionada DOF 16-07-2025):** «Contar con la revisión por parte del área de auditoría interna o de una persona auditora externa independiente **cuando el riesgo de quien realiza la Actividad Vulnerable sea bajo o medio**, o bien, de una persona auditora externa independiente **cuando el riesgo… sea alto**… para evaluar y dictaminar en un año calendario la efectividad del cumplimiento».
- **Matiz clave:** lo que gradúa *quién* puede auditar es el **riesgo**, no la actividad. Una joyería de riesgo bajo y una casa de cambio de riesgo alto tienen la misma obligación con distinto auditor.

### 3.19 `dictamen` — Dictamen y seguimiento de observaciones

- **Propuesta:** todas · **Confianza: media**
- **Cita (RLFPIORPI art. 12 Bis, adicionado DOF 27-03-2026):** «Para efectos de la obligación establecida en el artículo 18, fracción XI de la Ley, **quienes realicen Actividades Vulnerables** están obligados a obtener y conservar, como parte de su actividad, y a proporcionar al SAT, cuando dicha autoridad así lo requiera, la información fidedigna, completa y actualizada del dictamen obtenido de la auditoría interna o externa según sea el caso».
- La estructura y los plazos del dictamen viven en el capítulo XIV de las reglas generales, no leído aquí (vía `research/01` §3.9).

---

## 4. Obligaciones dejadas vacías por no poder justificarlas

**Ninguna.** Las 19 quedaron con `actividades: []` — pero por «alcanza a todas», con cita, no por falta de fundamento. La diferencia está ahora escrita en el campo `alcance` de cada una y sale impresa en su página.

Dicho de otro modo: el archivo se ve casi igual que antes y significa algo distinto. Antes el vacío era una ausencia; ahora es una afirmación fechada, atribuida y marcada como no confirmada.

---

## 5. Qué falta para confirmar

Por orden de lo que más puede morder:

1. **La revisión jurídica humana firmada.** Es el bloqueante declarado del proyecto y este documento no lo sustituye. Mientras no exista, las 19 notas siguen diciendo «mapeo propuesto… sin revisión jurídica firmada» bajo insignia ámbar.
2. **El cabo suelto del art. 18 fr. IV** (§3.6): ¿la salvedad de la fracción XIV excepciona el **domicilio** o el **plazo**? Se propone la lectura conservadora (comercio exterior conserva diez años). Cerrar con criterio del SAT/UIF o con la exposición de motivos del decreto de 16-07-2025.
3. **Dos citas de disposición que no cuadran, y no se corrigieron** — son datos que el sitio imprime como «Art. X» bajo el sello de procedencia, así que cambiarlos pide la misma firma que todo lo demás:
   - `alta-sppld` dice **`Art. 18, fracción I`**; el alta en el padrón es la **fracción IV Bis**. La fracción I es la identificación del cliente, que ya está correctamente citada en `identificacion-cliente`. Es, con las fuentes leídas aquí, un error claro.
   - `expedientes` dice **`Art. 18, fracción II`**; esa fracción trata de la actividad u ocupación del cliente en relaciones de negocio. El expediente único es el art. 12 de las reglas generales. Cita imprecisa.
4. **Leer el Acuerdo 115/2026 en el original** (DOF 07-08-2026) para las siete obligaciones de confianza media: `expedientes`, `informes-en-ceros`, `clasificacion-clientes`, `perfil-transaccional`, `dictamen`, y el detalle semestral de `perfil-transaccional`. Hoy descansan en `research/01` y `research/03`, que sí lo leyeron, pero esta pasada no lo re-verificó.
5. **Los Anexos 1 a 10 de las reglas generales**, declarados no leídos en `research/03` §REQUIERE REVISIÓN EDITORIAL punto 6. Son la única fuente real de información *por actividad* que le falta al catálogo de obligaciones: qué papeles concretos lleva el expediente de un notario, de una joyería o de una plataforma de activos virtuales. Si se quiere que la página de una actividad diga algo propio sobre obligaciones, ahí está.
6. **Decidir en la interfaz** qué hacer con el hallazgo: hoy `actividades: []` no se lee en ninguna vista pública de obligaciones. La frase «te alcanzan las 19» es más útil que un filtro que devolvería siempre lo mismo, y es la que evita que alguien concluya que su fracción está exenta.
