/*
  # Sistema de Rastreamento Anti-Clonagem

  1. Novas Tabelas
    - `protected_domains`: Domínios protegidos pelos usuários
      - `id` (uuid, primary key)
      - `user_id` (uuid, referência para auth.users)
      - `domain` (text, domínio protegido)
      - `script_id` (text, ID único do script)
      - `settings` (jsonb, configurações de proteção)
      - `created_at`, `updated_at`

    - `clone_detections`: Detecções de clonagem
      - `id` (uuid, primary key)
      - `protected_domain_id` (uuid, referência)
      - `clone_domain` (text, domínio do clone)
      - `visitor_ip` (text, IP do visitante)
      - `user_agent` (text, user agent)
      - `page_url` (text, URL da página)
      - `time_on_page` (integer, tempo em segundos)
      - `actions_taken` (jsonb, ações realizadas)
      - `detected_at` (timestamp)

    - `script_analytics`: Analytics dos scripts
      - `id` (uuid, primary key)
      - `protected_domain_id` (uuid, referência)
      - `event_type` (text, tipo de evento)
      - `event_data` (jsonb, dados do evento)
      - `visitor_ip` (text)
      - `created_at` (timestamp)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados verem apenas seus dados
*/

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
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS clone_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protected_domain_id uuid REFERENCES protected_domains(id) NOT NULL,
  clone_domain text NOT NULL,
  visitor_ip text,
  user_agent text,
  page_url text,
  time_on_page integer DEFAULT 0,
  actions_taken jsonb DEFAULT '[]'::jsonb,
  detected_at timestamptz DEFAULT now()
);

ALTER TABLE clone_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view detections for their domains"
  ON clone_detections
  FOR SELECT
  TO authenticated
  USING (
    protected_domain_id IN (
      SELECT id FROM protected_domains WHERE user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS script_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protected_domain_id uuid REFERENCES protected_domains(id) NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  visitor_ip text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE script_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics for their domains"
  ON script_analytics
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
CREATE INDEX IF NOT EXISTS idx_clone_detections_domain_id ON clone_detections(protected_domain_id);
CREATE INDEX IF NOT EXISTS idx_script_analytics_domain_id ON script_analytics(protected_domain_id);
CREATE INDEX IF NOT EXISTS idx_clone_detections_detected_at ON clone_detections(detected_at);
CREATE INDEX IF NOT EXISTS idx_script_analytics_created_at ON script_analytics(created_at);