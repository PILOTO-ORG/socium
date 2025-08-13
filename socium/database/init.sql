-- Inicialização do banco de dados Socium
-- Este script cria as tabelas necessárias e dados iniciais

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Schema para organizar as tabelas
CREATE SCHEMA IF NOT EXISTS socium;

-- Tabela de leads
CREATE TABLE IF NOT EXISTS socium.leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    position VARCHAR(255),
    linkedin_url TEXT,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'lost', 'converted')),
    source VARCHAR(100) DEFAULT 'LinkedIn',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_messages INTEGER DEFAULT 0,
    last_message_date TIMESTAMP WITH TIME ZONE
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS socium.messages (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES socium.leads(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255),
    from_name VARCHAR(255),
    to_name VARCHAR(255),
    content TEXT,
    date_sent TIMESTAMP WITH TIME ZONE,
    subject VARCHAR(500),
    from_profile_url TEXT,
    to_profile_url TEXT,
    platform VARCHAR(50) DEFAULT 'LinkedIn',
    message_type VARCHAR(20) CHECK (message_type IN ('sent', 'received')),
    folder VARCHAR(100),
    attachments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de análises de IA
CREATE TABLE IF NOT EXISTS socium.ai_analyses (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES socium.leads(id) ON DELETE CASCADE,
    opportunity_type VARCHAR(50) CHECK (opportunity_type IN ('vendas', 'emprego', 'pesquisa', 'networking')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    profile_score INTEGER CHECK (profile_score >= 0 AND profile_score <= 100),
    engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
    intention_score INTEGER CHECK (intention_score >= 0 AND intention_score <= 100),
    insights JSONB,
    needs JSONB,
    next_actions JSONB,
    sentiment VARCHAR(20) CHECK (sentiment IN ('positivo', 'neutro', 'negativo')),
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de uploads (histórico)
CREATE TABLE IF NOT EXISTS socium.uploads (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    messages_processed INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    upload_status VARCHAR(50) DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON socium.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON socium.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON socium.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON socium.messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON socium.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_date_sent ON socium.messages(date_sent);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_lead_id ON socium.ai_analyses(lead_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_opportunity_type ON socium.ai_analyses(opportunity_type);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION socium.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON socium.leads
    FOR EACH ROW EXECUTE FUNCTION socium.update_updated_at_column();

CREATE TRIGGER update_ai_analyses_updated_at BEFORE UPDATE ON socium.ai_analyses
    FOR EACH ROW EXECUTE FUNCTION socium.update_updated_at_column();

-- Dados de exemplo (opcional)
INSERT INTO socium.leads (name, email, company, position, status, source, total_messages) VALUES
('João Silva', 'joao@techcorp.com', 'Tech Corp', 'CTO', 'qualified', 'LinkedIn', 5),
('Maria Santos', 'maria@startup.com', 'Startup Innovation', 'CEO', 'contacted', 'LinkedIn', 3),
('Pedro Oliveira', 'pedro@universidade.edu', 'Universidade Tech', 'Professor', 'new', 'LinkedIn', 1)
ON CONFLICT DO NOTHING;

-- Inserir análises de IA de exemplo
WITH lead_data AS (
    SELECT id FROM socium.leads WHERE email = 'joao@techcorp.com' LIMIT 1
)
INSERT INTO socium.ai_analyses (
    lead_id, opportunity_type, score, profile_score, engagement_score, 
    intention_score, insights, needs, next_actions, sentiment, confidence
)
SELECT 
    id, 'vendas', 85, 90, 80, 85,
    '["Perfil de decisor técnico", "Demonstra interesse em automação"]'::jsonb,
    '["Soluções de automação", "Modernização tecnológica"]'::jsonb,
    '["Agendar demonstração", "Apresentar caso de uso"]'::jsonb,
    'positivo', 0.92
FROM lead_data
ON CONFLICT DO NOTHING;

-- Configurar permissões
GRANT USAGE ON SCHEMA socium TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA socium TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA socium TO PUBLIC;

-- Log de inicialização
INSERT INTO socium.uploads (filename, original_name, file_size, upload_status) VALUES
('init.sql', 'database_initialization', 0, 'initialized')
ON CONFLICT DO NOTHING;
