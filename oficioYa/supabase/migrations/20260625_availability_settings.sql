-- Tabla de configuración de disponibilidad por profesional
-- Fase 2: conectar con officialServiceStore y availabilityStore cuando Supabase esté activo

CREATE TABLE IF NOT EXISTS availability_settings (
  professional_id       uuid PRIMARY KEY REFERENCES professionals(id) ON DELETE CASCADE,
  work_start_time       time    NOT NULL DEFAULT '08:00',
  work_end_time         time    NOT NULL DEFAULT '18:00',
  service_duration_min  integer NOT NULL DEFAULT 60 CHECK (service_duration_min > 0),
  buffer_min            integer NOT NULL DEFAULT 0  CHECK (buffer_min >= 0),
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER availability_settings_updated_at
  BEFORE UPDATE ON availability_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: solo el propio profesional puede leer/escribir su configuración
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pro puede ver su config" ON availability_settings
  FOR SELECT USING (
    professional_id = (SELECT id FROM professionals WHERE user_id = auth.uid())
  );

CREATE POLICY "Pro puede upsert su config" ON availability_settings
  FOR ALL USING (
    professional_id = (SELECT id FROM professionals WHERE user_id = auth.uid())
  );

-- Lectura pública de duración (para mostrar en perfil del cliente)
CREATE POLICY "Clientes pueden ver duración" ON availability_settings
  FOR SELECT USING (true);
