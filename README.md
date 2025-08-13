# Socium AI - Lead Analysis Platform

Uma plataforma inteligente para análise de leads utilizando IA, com integração de dados do LinkedIn e análise de sentimentos.

## 🚀 Funcionalidades

- **Análise de IA**: Análise automática de leads com scores de oportunidade
- **Upload de CSV**: Importação de dados de conversas do LinkedIn
- **Dashboard Interativo**: Métricas em tempo real e visualizações
- **Análise de Sentimentos**: Classificação de sentimentos das conversas
- **Gestão de Leads**: CRUD completo de leads com status tracking

## 🛠️ Tecnologias

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL
- Sequelize ORM
- Multer (upload de arquivos)
- CSV Parser

### Frontend
- React 17
- TypeScript
- React Router v6
- Axios
- CSS Modules

## 📋 Pré-requisitos

- Node.js 16+ 
- PostgreSQL 12+
- npm ou yarn

## 🔧 Configuração do Ambiente

### 1. Clone o repositório
```bash
git clone <repository-url>
cd socium
```

### 2. Configuração do Banco de Dados

#### Instalar PostgreSQL (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### Criar usuário e banco
```bash
sudo -u postgres psql
CREATE USER socium_user WITH PASSWORD 'socium123';
CREATE DATABASE socium OWNER socium_user;
GRANT ALL PRIVILEGES ON DATABASE socium TO socium_user;
\q
```

### 3. Configuração do Backend

#### Instalar dependências
```bash
cd socium/backend
npm install
```

#### Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```properties
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=socium_user
DB_PASSWORD=socium123
DB_DATABASE=socium
PORT=5000
```

#### Executar migrations
```bash
sudo -u postgres psql -d socium -f src/database/schema.sql
```

### 4. Configuração do Frontend

#### Instalar dependências
```bash
cd ../frontend
npm install
```

#### Configurar variáveis de ambiente
```bash
cp .env.example .env
```

## 🚀 Executando a Aplicação

### Iniciar Backend
```bash
cd socium/backend
npm start
```
O backend estará disponível em: http://localhost:5000

### Iniciar Frontend
```bash
cd socium/frontend
npm start
```
O frontend estará disponível em: http://localhost:3000

## 📊 Estrutura do Projeto

```
socium/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores da API
│   │   ├── database/        # Configuração e schemas do banco
│   │   ├── models/          # Modelos Sequelize
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Serviços de negócio
│   │   └── types/           # Tipos TypeScript
│   ├── uploads/             # Arquivos enviados
│   ├── .env                 # Variáveis de ambiente (não commitado)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços de API
│   │   └── types/           # Tipos TypeScript
│   ├── public/
│   ├── .env                 # Variáveis de ambiente (não commitado)
│   └── package.json
├── database/
│   ├── messages.csv         # Dados de exemplo
│   └── schema.sql           # Schema do banco
├── .gitignore
└── README.md
```

## 🔐 Segurança

### Variáveis Sensíveis
Todas as informações sensíveis estão em arquivos `.env` que são ignorados pelo Git:

- Credenciais do banco de dados
- Chaves JWT
- API keys
- Configurações de SMTP

### Boas Práticas Implementadas
- CORS configurado
- Rate limiting
- Validação de uploads
- Sanitização de inputs
- Error handling robusto

## 📝 API Endpoints

### Leads
- `GET /api/leads` - Listar leads
- `GET /api/leads/:id` - Buscar lead específico
- `POST /api/leads/:id/analyze` - Analisar lead
- `POST /api/leads/reload` - Recarregar dados do CSV

### Upload
- `POST /api/upload` - Upload de arquivo CSV
- `GET /api/upload/history` - Histórico de uploads

### Analytics
- `GET /api/analytics/dashboard` - Métricas do dashboard
- `GET /api/analytics/leads` - Análises de leads

## 🧪 Testes

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Build para Produção

### Backend
```bash
cd backend
npm run build
```

### Frontend
```bash
cd frontend
npm run build
```

## 🐳 Docker (Opcional)

```bash
docker-compose up -d
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🆘 Suporte

Em caso de problemas:

1. Verifique se todas as dependências estão instaladas
2. Confirme se o PostgreSQL está rodando
3. Verifique as variáveis de ambiente nos arquivos `.env`
4. Consulte os logs do console para erros específicos

Para mais ajuda, abra uma issue no repositório.