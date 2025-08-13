-- Criação do usuário socium (se não existir)
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'socium') THEN
      CREATE USER socium WITH PASSWORD 'socium_password';
   END IF;
END
$$;

-- Garantir que o banco socium existe e dar permissões ao usuário
GRANT ALL PRIVILEGES ON DATABASE socium TO socium;

-- Dar permissões no schema public
GRANT ALL ON SCHEMA public TO socium;
GRANT CREATE ON SCHEMA public TO socium;

-- Conectar ao banco socium como postgres para criar as tabelas
\c socium postgres;

-- Criação das tabelas do Socium AI

-- Tabela de leads
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    position VARCHAR(255),
    linkedin_url VARCHAR(1000),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'lost', 'converted')),
    source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_messages INTEGER DEFAULT 0,
    last_message_date TIMESTAMP
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255),
    from_user VARCHAR(255) NOT NULL,
    to_user VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date_sent TIMESTAMP NOT NULL,
    subject VARCHAR(1000),
    from_profile_url VARCHAR(1000),
    to_profile_url VARCHAR(1000),
    platform VARCHAR(50) DEFAULT 'LinkedIn',
    message_type VARCHAR(20) CHECK (message_type IN ('sent', 'received')),
    folder VARCHAR(100),
    attachments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de análises de IA
CREATE TABLE IF NOT EXISTS ai_analyses (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    opportunity_type VARCHAR(20) CHECK (opportunity_type IN ('vendas', 'emprego', 'pesquisa', 'networking')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    profile_score INTEGER CHECK (profile_score >= 0 AND profile_score <= 100),
    engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
    intention_score INTEGER CHECK (intention_score >= 0 AND intention_score <= 100),
    insights JSONB,
    needs JSONB,
    next_actions JSONB,
    sentiment VARCHAR(20) CHECK (sentiment IN ('positivo', 'neutro', 'negativo')),
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de uploads de CSV
CREATE TABLE IF NOT EXISTS csv_uploads (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    messages_processed INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    upload_status VARCHAR(20) DEFAULT 'processing' CHECK (upload_status IN ('processing', 'completed', 'failed')),
    error_message TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_date_sent ON messages(date_sent);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_lead_id ON ai_analyses(lead_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_opportunity_type ON ai_analyses(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_score ON ai_analyses(score);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analyses_updated_at BEFORE UPDATE ON ai_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados de exemplo
INSERT INTO leads (name, email, company, position, source, status) VALUES
('João Silva', 'joao@empresa.com', 'Tech Corp', 'CEO', 'LinkedIn', 'new'),
('Maria Santos', 'maria@startup.com', 'StartupXYZ', 'CTO', 'CSV Upload', 'contacted'),
('Pedro Costa', 'pedro@consultoria.com', 'Consultoria ABC', 'Diretor', 'LinkedIn', 'qualified');

INSERT INTO ai_analyses (lead_id, opportunity_type, score, profile_score, engagement_score, intention_score, sentiment, confidence) VALUES
(1, 'vendas', 85, 90, 80, 85, 'positivo', 0.92),
(2, 'networking', 70, 75, 65, 70, 'neutro', 0.78),
(3, 'vendas', 95, 98, 92, 95, 'positivo', 0.96);

-- Dar permissões ao usuário socium em todas as tabelas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO socium;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO socium;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO socium;
