/*
  # Sistema de Rastreamento Anti-Clonagem

  1. Novas Tabelas
    - `protected_domains`: Domínios protegidos pelos usuários
      - Armazena configurações de proteção
      - Link com usuários via `user_id`
      - Script ID único para cada domínio

    - `script_analytics`: Analytics dos scripts
      - Rastreia eventos (page_view, click, etc.)
      - Armazena dados do visitante (IP, user agent)
      - Link com domínios protegidos

    - `clone_detections`: Detecções de clonagem
      - Registra quando um clone é detectado
      - Armazena informações do clone e visitante
      - Ações tomadas pelo script

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados
    - Dados isolados por usuário
*/

-- Tabela de domínios protegidos
CREATE TABLE IF NOT EXISTS protected_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  domain text NOT NULL,
  script_id text UNIQUE NOT NULL,
  settings jsonb DEFAULT '{}',
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

-- Tabela de analytics dos scripts
CREATE TABLE IF NOT EXISTS script_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protected_domain_id uuid REFERENCES protected_domains(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  visitor_ip text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE script_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics of their domains"
  ON script_analytics
  FOR SELECT
  TO authenticated
  USING (
    protected_domain_id IN (
      SELECT id FROM protected_domains WHERE user_id = auth.uid()
    )
  );

-- Tabela de detecções de clonagem
CREATE TABLE IF NOT EXISTS clone_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protected_domain_id uuid REFERENCES protected_domains(id) ON DELETE CASCADE,
  clone_domain text NOT NULL,
  visitor_ip text,
  user_agent text,
  page_url text,
  time_on_page integer DEFAULT 0,
  actions_taken text[] DEFAULT '{}',
  detected_at timestamptz DEFAULT now()
);

ALTER TABLE clone_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clone detections of their domains"
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
CREATE INDEX IF NOT EXISTS idx_script_analytics_created_at ON script_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_clone_detections_domain_id ON clone_detections(protected_domain_id);
CREATE INDEX IF NOT EXISTS idx_clone_detections_detected_at ON clone_detections(detected_at);