-- 0012 · Bucket de expedientes y sus políticas
--
-- Cierra el hueco que el propio README declaraba: «`documents.storage_path`
-- apunta a un bucket que todavía hay que crear. Los metadatos ya están
-- protegidos; el archivo no.»
--
-- Que la fila esté protegida y el archivo no es la peor de las dos mitades.
-- `documents` guarda identificaciones, comprobantes de domicilio, actas
-- constitutivas y poderes: si el objeto es legible con sólo conocer su ruta,
-- toda la RLS de 0008 protege un índice cuyo contenido está abierto.
--
-- Decisiones que este archivo fija, y por qué:
--
--  * **Bucket privado.** Nunca público. El acceso se da con URL firmada y
--    caduca. Un bucket público convierte `storage_path` en una credencial, y
--    esas rutas viajan en JSON, en logs y en exportaciones.
--
--  * **La organización va en el PRIMER segmento de la ruta**
--    (`<organization_id>/<documento_id>/<archivo>`). Es lo único que la
--    política puede leer sin consultar otra tabla, así que es lo que decide el
--    aislamiento. La aplicación DEBE construir la ruta así; si la construye de
--    otro modo, la política deniega en vez de filtrar.
--
--  * **Se reutilizan `es_miembro_de` y `puede_escribir_operativo`** de 0003 en
--    lugar de reescribir la condición. Dos definiciones del mismo permiso
--    divergen: la de la tabla y la del archivo acabarían diciendo cosas
--    distintas sobre la misma persona, y la que manda sería la más laxa.
--
--  * **Sin borrado.** No hay política de `delete`, igual que en 0008: la
--    LFPIORPI exige conservar diez años (art. 18, fr. IV). La aplicación marca
--    `deleted_at`; el objeto se queda. Un borrado accidental aquí no se
--    recupera y destruye evidencia que la ley obliga a tener.

-- ---------------------------------------------------------------------------
-- El bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expedientes',
  'expedientes',
  false,
  -- 25 MB. Un acta constitutiva escaneada rara vez pasa de ahí, y el límite
  -- evita que una subida errónea llene el almacenamiento de la organización.
  26214400,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Políticas sobre storage.objects, acotadas a este bucket
-- ---------------------------------------------------------------------------

-- Idempotente como el resto del esquema: la migración debe poder repetirse
-- sobre una base ya migrada sin fallar.
drop policy if exists expedientes_select on storage.objects;
drop policy if exists expedientes_insert on storage.objects;
drop policy if exists expedientes_update on storage.objects;

/*
 * Lectura: cualquier miembro de la organización dueña del primer segmento.
 *
 * `storage.foldername(name)` devuelve los segmentos de la ruta; el `[1]` es la
 * organización. El `::uuid` es deliberado: si alguien sube un objeto cuyo
 * primer segmento no es un UUID, la conversión falla y la política deniega.
 * Preferimos un error a una ruta que se cuela por no parecerse a nada.
 */
create policy expedientes_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'expedientes'
    and public.es_miembro_de((storage.foldername(name))[1]::uuid)
  );

-- Escritura: sólo quien puede escribir operativo en esa organización, el mismo
-- permiso que gobierna la fila de `documents` en 0008.
create policy expedientes_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'expedientes'
    and public.puede_escribir_operativo((storage.foldername(name))[1]::uuid)
  );

/*
 * Actualización: se permite reemplazar el contenido, no mover el objeto a otra
 * organización. Por eso la condición se exige en `using` Y en `with check`:
 * sin la segunda, alguien con permiso en la organización A podría renombrar el
 * objeto hacia la carpeta de la organización B y sacarlo de su alcance.
 */
create policy expedientes_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'expedientes'
    and public.puede_escribir_operativo((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'expedientes'
    and public.puede_escribir_operativo((storage.foldername(name))[1]::uuid)
  );

comment on column public.documents.storage_path is
  'Ruta dentro del bucket privado `expedientes`, con formato '
  '`<organization_id>/<document_id>/<archivo>`. El primer segmento NO es '
  'decorativo: es lo que leen las políticas de storage para aislar por '
  'organización. Cambiar el formato sin cambiar 0012 abre el bucket.';
