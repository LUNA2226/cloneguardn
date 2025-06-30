/*
  # Criar tabela de usuários

  1. Nova Tabela
    - `users`: Armazena informações personalizadas dos usuários
      - `id` (uuid, primary key) - mesmo ID do Supabase Auth
      - `email` (text) - e-mail do usuário
      - `nome` (text) - nome completo (opcional)
      - `dominio` (text) - domínio protegido (opcional)
      - `plano` (text) - starter, pro, enterprise
      - `criado_em` (timestamp) - data do cadastro

  2. Segurança
    - Habilita RLS na tabela `users`
    - Política para usuários autenticados visualizarem apenas seus próprios dados
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nome text,
  dominio text,
  plano text DEFAULT 'starter' CHECK (plano IN ('starter', 'pro', 'enterprise')),
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own data"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plano ON users(plano);