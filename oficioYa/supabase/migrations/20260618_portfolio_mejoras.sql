-- Ampliar work_portfolio con nuevas columnas
ALTER TABLE work_portfolio
  ADD COLUMN IF NOT EXISTS photos      jsonb[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location    text,
  ADD COLUMN IF NOT EXISTS request_id  uuid REFERENCES requests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Migrar photo_urls existentes al nuevo formato jsonb
UPDATE work_portfolio
SET photos = (
  SELECT array_agg(jsonb_build_object('url', u, 'type', 'general'))
  FROM unnest(photo_urls) AS u
)
WHERE photo_urls != '{}' AND (photos IS NULL OR photos = '{}');

-- Agregar featured_photo_url al profesional
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS featured_photo_url text;

-- Solo un trabajo destacado por profesional (constraint via trigger o manual en app)
-- No se agrega UNIQUE constraint porque se maneja en el servicio
