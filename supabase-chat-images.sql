-- ============================================================================
-- Chat: envío de imágenes con Supabase Storage (bucket privado "chat-images")
-- Ejecutar en el SQL Editor de Supabase. Es idempotente: se puede correr varias veces.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Tabla public.messages: content pasa a nullable + image_path nueva + CHECK
-- ---------------------------------------------------------------------------
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS image_path TEXT;

ALTER TABLE public.messages
  ALTER COLUMN content DROP NOT NULL;

-- CHECK: cada mensaje debe tener texto no vacío o una imagen (o ambos).
-- NULLIF(btrim(content), '') rechaza strings vacíos o de solo espacios.
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_content_or_image_check;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_content_or_image_check
  CHECK (NULLIF(btrim(content), '') IS NOT NULL OR image_path IS NOT NULL);

COMMENT ON COLUMN public.messages.image_path IS
  'Ruta del objeto en el bucket privado chat-images ({userId}/{roomId}/{timestamp}-{uuid}.jpg). NUNCA guardar la URL firmada aquí.';

-- ---------------------------------------------------------------------------
-- 2) Bucket privado "chat-images" (5 MB máx., solo jpeg/png/webp)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  false,
  5242880, -- 5 MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public              = EXCLUDED.public,
    file_size_limit     = EXCLUDED.file_size_limit,
    allowed_mime_types  = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 3) Políticas en storage.objects
--    Ruta esperada: chat-images/{auth.uid()}/{roomId}/{archivo}
--    storage.foldername(name) devuelve text[] con las carpetas.
--    Sin política UPDATE => nadie puede actualizar objetos (ni propios ni ajenos).
-- ---------------------------------------------------------------------------

-- INSERT: solo autenticados y solo dentro de su carpeta {auth.uid()}/...
DROP POLICY IF EXISTS "chat-images insert own folder" ON storage.objects;
CREATE POLICY "chat-images insert own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT: solo autenticados (bucket privado, la autorización de negocio la da RLS de messages/buckets)
DROP POLICY IF EXISTS "chat-images select authenticated" ON storage.objects;
CREATE POLICY "chat-images select authenticated"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'chat-images');

-- DELETE: solo el dueño de la carpeta {auth.uid()}/... (necesario para borrar
-- archivos huérfanos si el INSERT del mensaje falla tras subir la imagen).
-- UPDATE: sin política => denegado para todos los roles.
DROP POLICY IF EXISTS "chat-images delete own folder" ON storage.objects;
CREATE POLICY "chat-images delete own folder"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ---------------------------------------------------------------------------
-- 4) GRANTs para el rol authenticated
--    (En proyectos hosted de Supabase estos GRANT ya suelen existir; se declaran
--    de forma idempotente. NO se concede UPDATE ni ALL.)
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;

-- ---------------------------------------------------------------------------
-- 5) Verificación rápida
-- ---------------------------------------------------------------------------
-- select column_name, is_nullable from information_schema.columns
--   where table_schema = 'public' and table_name = 'messages';
-- select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'chat-images';
-- select policyname, cmd from pg_policies where schemaname = 'storage' and tablename = 'objects';
