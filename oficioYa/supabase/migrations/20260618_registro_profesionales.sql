-- Ampliar tabla professionals con campos de registro
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS registration_step      int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS registration_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status    text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS quality_score          int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cedula                 text,
  ADD COLUMN IF NOT EXISTS birth_date             date,
  ADD COLUMN IF NOT EXISTS address                text,
  ADD COLUMN IF NOT EXISTS department             text,
  ADD COLUMN IF NOT EXISTS city                   text,
  ADD COLUMN IF NOT EXISTS trade                  text,
  ADD COLUMN IF NOT EXISTS specialties            text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS years_experience       int,
  ADD COLUMN IF NOT EXISTS work_mode              text,
  ADD COLUMN IF NOT EXISTS coverage_departments   text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS coverage_radius_km     int,
  ADD COLUMN IF NOT EXISTS travels_anywhere       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS availability_days      text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS availability_from      time,
  ADD COLUMN IF NOT EXISTS availability_to        time,
  ADD COLUMN IF NOT EXISTS emergency_24h          boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp               text,
  ADD COLUMN IF NOT EXISTS contact_email          text;

-- Tabla portfolio de trabajos
CREATE TABLE IF NOT EXISTS work_portfolio (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  work_date       date,
  category        text,
  photo_urls      text[] DEFAULT '{}',
  created_at      timestamptz DEFAULT now()
);

-- Tabla certificaciones
CREATE TABLE IF NOT EXISTS certifications (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id     uuid REFERENCES professionals(id) ON DELETE CASCADE,
  type                text NOT NULL,  -- 'titulo' | 'certificado' | 'curso' | 'carnet'
  title               text,
  institution         text,
  issue_date          date,
  file_url            text,
  ai_extracted_data   jsonb,
  verified            boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- Tabla verificación de identidad
CREATE TABLE IF NOT EXISTS identity_verification (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id   uuid REFERENCES professionals(id) ON DELETE CASCADE UNIQUE,
  cedula_front_url  text,
  cedula_back_url   text,
  selfie_url        text,
  status            text DEFAULT 'pending',  -- 'pending' | 'verified' | 'rejected'
  admin_notes       text,
  reviewed_at       timestamptz,
  reviewed_by       uuid,
  created_at        timestamptz DEFAULT now()
);

-- RLS: work_portfolio
ALTER TABLE work_portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pro can manage own portfolio" ON work_portfolio
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());
CREATE POLICY "Public can read portfolio" ON work_portfolio
  FOR SELECT USING (true);

-- RLS: certifications
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pro can manage own certifications" ON certifications
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());
CREATE POLICY "Public can read certifications" ON certifications
  FOR SELECT USING (true);

-- RLS: identity_verification (solo dueño y admin)
ALTER TABLE identity_verification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pro can manage own identity" ON identity_verification
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());
