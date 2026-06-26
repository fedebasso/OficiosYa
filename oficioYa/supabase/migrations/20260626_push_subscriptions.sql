-- Tabla de suscripciones push por usuario
-- Fase 2: conectar desde notificationStore.requestPermission() cuando Supabase esté activo

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL UNIQUE,
  p256dh     text NOT NULL,
  auth       text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario gestiona su suscripción" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());
