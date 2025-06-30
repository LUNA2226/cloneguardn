/*
  # Sistema de Scripts Anti-Clonagem

  1. New Tables
    - `protected_domains`: Armazena domínios protegidos e suas configurações
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `domain` (text, domínio original)
      - `script_id` (text, ID único do script)
      - `settings` (jsonb, configurações de proteção)
      - `is_active` (boolean, se o script está ativo)
      - `created_at`, `updated_at`

    - `script_analytics`: Registra eventos dos scripts
      - `id` (uuid, primary key)
      - `protected_domain_id` (uuid, references protected_domains)
      - `event_type` (text, tipo do evento)
      - `event_data` (jsonb, dados do evento)
      - `visitor_ip` (text, IP do visitante)
      - `user_agent` (text, user agent)
      - `created_at`

    - `clone_detections`: Registra detecções de clones
      - `id` (uuid, primary key)
      - `protected_domain_id` (uuid, references protected_domains)
      - `clone_domain` (text, domínio do clone)
      - `visitor_ip` (text, IP do visitante)
      - `user_agent` (text, user agent)
      - `page_url` (text, URL da página)
      - `time_on_page` (integer, tempo na página em segundos)
      - `actions_taken` (text[], ações aplicadas)
      - `detected_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Tabela de domínios protegidos
CREATE TABLE IF NOT EXISTS protected_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  domain text NOT NULL,
  script_id text UNIQUE NOT NULL,
  settings jsonb DEFAULT '{
    "redirect": true,
    "visual_sabotage": false,
    "replace_links": true,
    "replace_images": false,
    "visual_interference": false,
    "redirect_url": "",
    "replacement_image_url": "",
    "checkout_url": ""
  }'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE protected_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own protected domains"
  ON protected_domains
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Tabela de analytics dos scripts
CREATE TABLE IF NOT EXISTS script_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protected_domain_id uuid REFERENCES protected_domains(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  visitor_ip text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE script_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics of their protected domains"
  ON script_analytics
  FOR SELECT
  TO authenticated
  USING (
    protected_domain_id IN (
      SELECT id FROM protected_domains WHERE user_id = auth.uid()
    )
  );

-- Tabela de detecções de clones
CREATE TABLE IF NOT EXISTS clone_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protected_domain_id uuid REFERENCES protected_domains(id) ON DELETE CASCADE,
  clone_domain text NOT NULL,
  visitor_ip text,
  user_agent text,
  page_url text,
  time_on_page integer DEFAULT 0,
  actions_taken text[] DEFAULT ARRAY[]::text[],
  detected_at timestamptz DEFAULT now()
);

ALTER TABLE clone_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clone detections of their protected domains"
  ON clone_detections
  FOR SELECT
  TO authenticated
  USING (
    protected_domain_id IN (
      SELECT id FROM protected_domains WHERE user_id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_protected_domains_user_id ON protected_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_protected_domains_script_id ON protected_domains(script_id);
CREATE INDEX IF NOT EXISTS idx_script_analytics_domain_id ON script_analytics(protected_domain_id);
CREATE INDEX IF NOT EXISTS idx_clone_detections_domain_id ON clone_detections(protected_domain_id);
CREATE INDEX IF NOT EXISTS idx_clone_detections_detected_at ON clone_detections(detected_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_protected_domains_updated_at ON protected_domains;
CREATE TRIGGER update_protected_domains_updated_at
  BEFORE UPDATE ON protected_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();