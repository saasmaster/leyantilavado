# LeyAntilavado.org

Centro independiente de información y herramientas sobre la **LFPIORPI** (Ley Federal para la
Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita) de México.

> LeyAntilavado.org es una plataforma privada e independiente. No pertenece ni está afiliada al
> SAT, la UIF, la Secretaría de Hacienda ni a ninguna autoridad gubernamental. La información y los
> resultados de las herramientas son orientativos y no sustituyen asesoría jurídica, fiscal o de
> cumplimiento profesional.

---

## Arrancar

```bash
npm install
npm run dev:web        # http://localhost:5400
```

Verificación completa antes de dar algo por terminado:

```bash
npm run test           # pruebas unitarias del motor jurídico
npm run typecheck      # tsc en todos los paquetes
npm run build          # build de producción — eslint atrapa lo que tsc no ve
```

---

## Arquitectura

```
packages/types/         Contrato de tipos. Sin lógica, sin dependencias.
packages/rules-engine/  Motor jurídico versionado + datos semilla. Puro y determinista.
packages/ui/            Primitivos de diseño compartidos.
apps/web/               Next 16 · React 19 · Tailwind v4 · Supabase.
supabase/               Migraciones SQL y políticas RLS.
research/               Investigación verificada contra DOF, SAT, INEGI y Cámara de Diputados.
CONTRATO.md             Reglas de construcción para quien toque el código.
```

### Por qué un motor separado

Todo número legal —umbrales, límites de efectivo, rangos de multa, valores de la UMA— vive en
`packages/rules-engine/src/datos/`. Ningún componente de UI contiene una cifra jurídica.

Eso permite tres cosas que un sitio con los números incrustados no puede hacer:

1. **Calcular con la regla correcta de una fecha pasada.** Una operación de enero de 2026 se mide
   con la UMA de 2025 ($113.14), no con la de 2026 ($117.31), porque la nueva entra en vigor el
   1 de febrero. Varias tablas publicadas como "2026" tienen este error.
2. **Cambiar reglas sin tocar código.** Una reforma cierra la vigencia de la regla anterior y abre
   otra. El histórico nunca se sobreescribe.
3. **Probar el derecho.** 62 pruebas unitarias fijan el comportamiento en los bordes exactos de
   cada umbral, que es justo donde el usuario necesita certeza.

---

## Las cuatro decisiones que sostienen el producto

### 1. Dinero en centavos enteros

`645 × 117.31` en punto flotante da `75664.94999999999`, y la comparación contra el umbral falla
exactamente en el borde. Todo el motor opera sobre `Centavos` (enteros marcados por tipo);
`packages/types/src/money.ts` es el único lugar donde se convierte.

### 2. Los umbrales no siempre son números

`EspecificacionUmbral` es una unión discriminada de seis casos:

| Caso | Ejemplo real |
|---|---|
| `siempre` | Notarios: constitución de personas morales genera aviso sin importar el monto |
| `nunca` | Servicios profesionales cuando sólo se asesora, sin representar al cliente |
| `uma` | Juegos y sorteos: 325 UMA para identificar, 645 para avisar |
| `monto_o_comision` | Activos virtuales: 210 UMA por operación **o** 4 UMA de contraprestación |
| `variable` | Traslado de valores: 3,210 UMA, salvo que el monto no pueda determinarse |
| `requiere_revision` | Apartados XII-C y XII-D, sin umbrales publicados por la autoridad |

TypeScript obliga a cada componente a manejar los seis. No se puede renderizar una tabla de
umbrales sin decidir qué hacer con fe pública.

### 3. La comparación importa tanto como el número

El art. 17 fracción XV dice **"superior a"** 1,605 UMA para identificar y **"igual o superior a"**
3,210 UMA para avisar. Una renta de exactamente 1,605 UMA *no* obliga a identificar; una de
exactamente 3,210 UMA *sí* obliga a avisar. Colapsar ambos a `>=` produce un falso positivo justo
en el borde. El campo `comparador` lo modela.

### 4. El motor nunca dice que cumples

`ResultadoEvaluacion` no tiene un booleano de cumplimiento. Devuelve una conclusión acotada, un
nivel de confianza, **los supuestos que se dieron por hecho** y **la información que falta**. La
conclusión más benigna posible es *"no parece aplicarte con la información proporcionada"*.

---

## Procedencia y verificación

Cada regla arrastra su `Procedencia`: fuentes, disposición (artículo y fracción), fecha de última
revisión y nivel de verificación.

| Nivel | Significado |
|---|---|
| `oficial_verificado` | Contrastado contra el documento publicado por la autoridad |
| `oficial_no_accesible` | La fuente oficial no estaba disponible; proviene de una reproducción confiable |
| `fuente_secundaria` | Fuente confiable distinta al original, aún sin contrastar |
| `no_verificado` | **No se publica.** Se muestra como "Requiere revisión editorial" |

El componente `<SelloProcedencia>` hace imposible renderizar una conclusión legal sin decir de
dónde salió.

---

## Marco normativo cubierto

El marco vigente **no es una ley nueva**. Se integra por:

| Instrumento | Publicación | Entrada en vigor |
|---|---|---|
| Reforma a la LFPIORPI | DOF 16-jul-2025 | 17-jul-2025 |
| Reforma al Reglamento | DOF 27-mar-2026 | 28-mar-2026 |
| Acuerdo 115/2026 (SHCP) | DOF 7-ago-2026 | **30-nov-2026** |

Calendario escalonado del Acuerdo 115/2026:

- **1-mar-2027** — metodología de riesgos, manual, clasificación de clientes, expedientes,
  beneficiario controlador, selección de personal
- **1-jun-2027** — mecanismos automatizados operando
- **2027 completo** — primer periodo anual de capacitación
- **2028 completo** — primer periodo de auditoría
- **último día hábil de marzo 2029** — primer dictamen (ejercicio 2028)

Los avisos de 24 horas existen en la norma pero **no tienen fecha cierta**: su exigibilidad corre
seis meses después de una Resolución de formatos de la UIF que aún no se publica. Por eso no
aparecen en el calendario con fecha inventada.

---

## Variables de entorno

Copia `.env.example` a `.env.local`. El sitio público funciona **sin Supabase**: si faltan las
credenciales, el área privada muestra una pantalla de configuración pendiente en lugar de romperse.

`NEXT_PUBLIC_SITE_INDEXABLE=true` abre la indexación. Está en `false` por omisión de forma
deliberada: el contenido no se indexa hasta que pase revisión editorial.

---

## Convenciones

- Español de México en la interfaz **y en los identificadores del código**.
- Fechas siempre en `YYYY-MM-DD`, comparadas como cadena para evitar zonas horarias.
- Ninguna función del motor llama a `Date.now()`: la fecha actual entra como parámetro. Esto lo
  hace determinista y evita la regla `react-hooks/purity` de eslint, que `tsc` no detecta.
- Antes de dar algo por terminado: `npm run build`, no sólo `tsc`.
