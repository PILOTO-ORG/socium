#!/bin/bash

# Script de desenvolvimento para Socium
# Este script facilita o desenvolvimento local

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        warn "docker-compose não encontrado, tentando usar docker compose"
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
}

# Função para copiar arquivo .env se não existir
setup_env() {
    if [ ! -f .env ]; then
        log "Criando arquivo .env..."
        cat > .env << EOF
# Configurações do banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=socium

# Configurações do backend
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
UPLOAD_MAX_SIZE=10mb

# Configurações do frontend
REACT_APP_API_URL=http://localhost:5000/api

# Configurações do Docker
BACKEND_PORT=5000
FRONTEND_PORT=3000
REDIS_PORT=6379
EOF
        log "Arquivo .env criado. Edite conforme necessário."
    else
        log "Arquivo .env já existe."
    fi
}

# Função para instalar dependências
install_deps() {
    log "Instalando dependências do backend..."
    cd backend && npm install && cd ..
    
    log "Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
}

# Função para iniciar apenas o banco de dados
start_db() {
    log "Iniciando banco de dados PostgreSQL..."
    $DOCKER_COMPOSE up -d postgres redis
    
    log "Aguardando banco de dados ficar pronto..."
    sleep 10
    
    # Verificar se o banco está pronto
    docker exec socium-postgres pg_isready -U postgres -d socium
    if [ $? -eq 0 ]; then
        log "Banco de dados está pronto!"
    else
        error "Falha ao conectar com o banco de dados"
        exit 1
    fi
}

# Função para parar serviços
stop_services() {
    log "Parando todos os serviços..."
    $DOCKER_COMPOSE down
}

# Função para desenvolvimento local (sem Docker)
dev_local() {
    log "Iniciando desenvolvimento local..."
    
    # Verificar se o banco está rodando
    if ! docker ps | grep -q socium-postgres; then
        start_db
    fi
    
    # Instalar dependências se necessário
    if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
        install_deps
    fi
    
    # Iniciar backend em background
    log "Iniciando backend..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Aguardar backend inicializar
    sleep 5
    
    # Iniciar frontend
    log "Iniciando frontend..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    log "Desenvolvimento iniciado!"
    log "Backend: http://localhost:5000"
    log "Frontend: http://localhost:3000"
    log "Pressione Ctrl+C para parar"
    
    # Aguardar interrupção
    trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
    wait
}

# Função para desenvolvimento com Docker
dev_docker() {
    log "Iniciando desenvolvimento com Docker..."
    $DOCKER_COMPOSE up --build
}

# Função para produção
prod() {
    log "Iniciando ambiente de produção..."
    export NODE_ENV=production
    $DOCKER_COMPOSE -f docker-compose.yml up --build -d
    
    log "Serviços iniciados em modo produção!"
    log "Frontend: http://localhost:3000"
    log "Backend: http://localhost:5000"
}

# Função para executar testes
test() {
    log "Executando testes..."
    
    log "Testes do backend..."
    cd backend && npm test && cd ..
    
    log "Testes do frontend..."
    cd frontend && npm test -- --watchAll=false && cd ..
}

# Função para limpar dados
clean() {
    log "Limpando dados e containers..."
    $DOCKER_COMPOSE down -v --remove-orphans
    docker system prune -f
    log "Limpeza concluída!"
}

# Função para backup do banco
backup() {
    log "Fazendo backup do banco de dados..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker exec socium-postgres pg_dump -U postgres socium > "backups/$BACKUP_FILE"
    log "Backup salvo em: backups/$BACKUP_FILE"
}

# Função para mostrar logs
logs() {
    if [ -z "$1" ]; then
        $DOCKER_COMPOSE logs -f
    else
        $DOCKER_COMPOSE logs -f "$1"
    fi
}

# Função para mostrar status
status() {
    log "Status dos serviços:"
    $DOCKER_COMPOSE ps
    
    echo ""
    log "Saúde dos serviços:"
    docker exec socium-backend curl -f http://localhost:5000/health 2>/dev/null || echo "Backend: ❌"
    curl -f http://localhost:3000 2>/dev/null > /dev/null && echo "Frontend: ✅" || echo "Frontend: ❌"
}

# Menu principal
show_help() {
    echo -e "${BLUE}Socium Development Tool${NC}"
    echo ""
    echo "Uso: ./dev.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  setup       - Configurar ambiente inicial"
    echo "  dev         - Desenvolvimento local (sem Docker)"
    echo "  dev-docker  - Desenvolvimento com Docker"
    echo "  prod        - Ambiente de produção"
    echo "  db          - Iniciar apenas banco de dados"
    echo "  test        - Executar testes"
    echo "  clean       - Limpar dados e containers"
    echo "  backup      - Fazer backup do banco"
    echo "  logs [serviço] - Mostrar logs"
    echo "  status      - Mostrar status dos serviços"
    echo "  stop        - Parar todos os serviços"
    echo "  help        - Mostrar esta ajuda"
}

# Verificar argumentos
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

# Executar comando
check_docker

case "$1" in
    "setup")
        setup_env
        install_deps
        log "Configuração inicial concluída!"
        ;;
    "dev")
        setup_env
        dev_local
        ;;
    "dev-docker")
        setup_env
        dev_docker
        ;;
    "prod")
        setup_env
        prod
        ;;
    "db")
        setup_env
        start_db
        ;;
    "test")
        test
        ;;
    "clean")
        clean
        ;;
    "backup")
        mkdir -p backups
        backup
        ;;
    "logs")
        logs "$2"
        ;;
    "status")
        status
        ;;
    "stop")
        stop_services
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        error "Comando desconhecido: $1"
        show_help
        exit 1
        ;;
esac
