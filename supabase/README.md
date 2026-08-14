# Base de datos de LeyAntilavado.org

Postgres sobre Supabase. Este directorio contiene **todo** el esquema: si algo
no está aquí, no existe en producción.

```
supabase/
  migrations/       migraciones numeradas: se aplican una vez y en orden
  scripts/          generador de seed.sql a partir del motor jurídico
  seed.sql          GENERADO — no lo edites a mano
  POLITICAS.md      cada política RLS y qué agujero cierra
```

## Aplicar las migraciones

### Con la CLI de Supabase (recomendado)

```bash
npm i -g supabase          # o: brew install supabase/tap/supabase
supabase link --project-ref <ref-de-tu-proyecto>
supabase db push           # aplica migrations/ en orden
psql "$SUPABASE_DB_URL" -f supabase/seed.sql   # datos semilla
```

### Sin la CLI, desde el editor SQL de Supabase

Abre cada archivo de `migrations/` **en orden numérico** y ejecútalo. El orden
importa: `0003` define las funciones que usan las políticas de `0004` en
adelante. Después ejecuta `seed.sql`.

### En local

```bash
supabase start             # levanta Postgres + Auth + Storage en Docker
supabase db reset          # aplica migrations/ y seed.sql desde cero
```

`supabase db reset` es la forma de comprobar que las migraciones corren limpias
sobre una base vacía. Hazlo antes de dar por buena cualquier migración nueva.

## Regenerar `seed.sql`

Los datos legales viven en `packages/rules-engine/src/datos/*.ts`, que es la
fuente de verdad y tiene pruebas. `seed.sql` se **genera** a partir de ahí; no
se escribe a mano. Transcribirlo crearía una segunda copia que se desincroniza
al primer cambio de la UMA, y una UMA desincronizada calcula mal todos los
umbrales.

Desde la raíz del repo:

```bash
npx esbuild supabase/scripts/generar-seed.ts --bundle --platform=node \
  --format=esm --outfile=.seed.mjs && node .seed.mjs && rm .seed.mjs
```

(esbuild ya está instalado como dependencia transitiva de vitest; no hace falta
añadir nada.)

El seed es **idempotente**: se puede correr las veces que haga falta. Cada
ejecución deja rastro en `content_revisions`, que es justamente lo que se
quiere: sembrar también es un cambio.

## Orden y contenido de las migraciones

| Archivo | Qué trae |
|---|---|
| `0001_base.sql` | extensiones, dominio `centavos`, `set_updated_at()`, `audit_logs` y el trigger de bitácora |
| `0002_identidad.sql` | `users`, `organizations`, `organization_members`, `branches` y los triggers que protegen al último propietario |
| `0003_funciones_acceso.sql` | funciones `es_miembro_de`, `rol_en`, `puede_*`, `es_staff` y **RLS de identidad** |
| `0004_corpus_legal.sql` | fuentes, versiones legales, UMA, actividades, subtipos, umbrales, acumulación, efectivo, sanciones, obligaciones, fechas |
| `0005_editorial.sql` | autores, revisores, artículos, `content_revisions`, FAQ, glosario, plantillas, cursos, alertas de contenido, changelog |
| `0006_directorio.sql` | perfiles de proveedor, categorías, credenciales, ubicaciones, verificaciones, leads, patrocinios |
| `0007_cumplimiento.sql` | clientes, beneficiarios, relaciones de propiedad, operaciones, acumulaciones, riesgo, alertas, casos, documentos, avisos, capacitación, auditorías, hallazgos, remediación, manual |
| `0008_rls_cumplimiento.sql` | **RLS del núcleo de cumplimiento** + coherencia entre organizaciones + bitácora |
| `0009_plataforma.sql` | resultados guardados, notificaciones, newsletter, banderas, historial del monitor |
| `0010_versionado_legal.sql` | triggers que impiden sobreescribir una regla histórica en silencio |

## Reglas de la casa

**El dinero es `bigint` en centavos.** El dominio `public.centavos` lleva el
`CHECK (value >= 0)` incorporado. Nunca `float`, nunca `numeric` con decimales:
`0.1 + 0.2` no es `0.3` y una multa se calcula sobre estas cifras.

**Las fechas jurídicas son `date`.** La fecha de la operación decide qué UMA y
qué regla aplican. Las marcas de tiempo del sistema son `timestamptz`.

**Los enums son `text` + `CHECK`,** no tipos `ENUM`. Añadir un valor a un `ENUM`
no se puede revertir dentro de una transacción y complica cada migración
posterior. Los valores van en español porque son los mismos literales que usa el
contrato de tipos de TypeScript.

**Una regla legal no se borra: se sustituye.** Las tablas del corpus no tienen
política de `DELETE`. Cuando un umbral cambia se cierra la vigencia de la fila
anterior (`valid_to`) y se inserta otra. Es la única forma de poder responder
"¿qué decía la regla el día de esta operación?".

**El historial no lo escribe la aplicación, lo escriben triggers.** Un `UPDATE`
hecho desde el editor SQL de Supabase queda registrado igual que uno hecho desde
el panel. Para dejar constancia del motivo:

```sql
select set_config('app.motivo_cambio', 'Acuerdo 115/2026, art. 3', true);
update threshold_rules set notice_spec = '...' where id = 'vehiculos';
```

Sin esa variable el cambio se registra igual, con el motivo
`Sin motivo declarado por quien hizo el cambio.`

## Antes de dar por buena una migración

1. `supabase db reset` en local, sin errores.
2. Comprobar que **toda** tabla nueva con `organization_id` tiene RLS habilitado
   y sus cuatro políticas.
3. Comprobar que toda clave foránea tiene índice.
4. Ejecutar las comprobaciones de `POLITICAS.md` (sección "Cómo verificar que
   RLS de verdad aísla").

## Lo que falta para operar de verdad

- ~~**Storage.**~~ Hecho en `0012_storage_expedientes.sql`: bucket privado
  `expedientes`, políticas por `organization_id` leído del primer segmento de la
  ruta, y sin política de borrado (la ley obliga a conservar diez años). La
  aplicación DEBE construir la ruta como `<organization_id>/<document_id>/<archivo>`:
  ese primer segmento es lo que aísla, no es decorativo.
- **Correo transaccional.** Supabase Auth manda los correos de confirmación con
  su remitente por omisión y con límites de envío bajos. Para producción hay que
  configurar SMTP propio.
- ~~**Tarea programada.**~~ Hecha: `crontab` del usuario `leyantilavado` en el
  VPS, diaria a las 14:00 UTC (08:00 CDMX), vía `~/cron/monitor-fuentes.sh`. El
  script lee el secreto del proceso de PM2 en vez de guardarlo, así que rotarlo
  en el panel basta. Hoy responde 503 —«el monitor no tiene dónde guardar el
  resultado»— y empezará a funcionar solo en cuanto existan las variables de
  Supabase. Registro en `~/cron/monitor-fuentes.log`.
