#!/bin/bash

# Script para gerenciar o banco de dados Socium independente

DB_COMPOSE_FILE="docker-compose.db.yml"

case "$1" in
    "start"|"up")
        echo "🚀 Iniciando banco de dados Socium..."
        docker-compose -f $DB_COMPOSE_FILE up -d
        echo "✅ Banco iniciado! Acesse via localhost:5433"
        echo "   Usuario: postgres"
        echo "   Senha: postgres123"
        echo "   Database: socium"
        ;;
    "stop"|"down")
        echo "🛑 Parando banco de dados..."
        docker-compose -f $DB_COMPOSE_FILE down
        ;;
    "restart")
        echo "🔄 Reiniciando banco de dados..."
        docker-compose -f $DB_COMPOSE_FILE down
        docker-compose -f $DB_COMPOSE_FILE up -d
        ;;
    "logs")
        echo "📋 Exibindo logs do banco..."
        docker-compose -f $DB_COMPOSE_FILE logs -f postgres
        ;;
    "status"|"ps")
        echo "📊 Status do banco de dados:"
        docker-compose -f $DB_COMPOSE_FILE ps
        ;;
    "connect"|"psql")
        echo "🔗 Conectando ao banco via psql..."
        docker exec -it socium-postgres-only psql -U postgres -d socium
        ;;
    "reset")
        echo "⚠️  ATENÇÃO: Isto irá APAGAR todos os dados!"
        read -p "Tem certeza? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            echo "🗑️  Removendo volumes e recriando..."
            docker-compose -f $DB_COMPOSE_FILE down -v
            docker-compose -f $DB_COMPOSE_FILE up -d
            echo "✅ Banco resetado com dados iniciais!"
        else
            echo "❌ Operação cancelada."
        fi
        ;;
    "backup")
        BACKUP_FILE="backup_socium_$(date +%Y%m%d_%H%M%S).sql"
        echo "💾 Criando backup em $BACKUP_FILE..."
        docker exec socium-postgres-only pg_dump -U postgres -d socium > $BACKUP_FILE
        echo "✅ Backup criado: $BACKUP_FILE"
        ;;
    "restore")
        if [ -z "$2" ]; then
            echo "❌ Uso: $0 restore <arquivo_backup.sql>"
            exit 1
        fi
        echo "📥 Restaurando backup de $2..."
        docker exec -i socium-postgres-only psql -U postgres -d socium < $2
        echo "✅ Backup restaurado!"
        ;;
    "health")
        echo "🏥 Verificando saúde do banco..."
        docker exec socium-postgres-only pg_isready -U postgres -d socium
        ;;
    *)
        echo "🐘 Script de gerenciamento do banco Socium"
        echo ""
        echo "Uso: $0 {comando}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  start|up     - Inicia o banco de dados"
        echo "  stop|down    - Para o banco de dados"
        echo "  restart      - Reinicia o banco de dados"
        echo "  status|ps    - Mostra status dos containers"
        echo "  logs         - Exibe logs em tempo real"
        echo "  connect|psql - Conecta via psql interativo"
        echo "  reset        - ⚠️  APAGA todos os dados e recria"
        echo "  backup       - Cria backup do banco"
        echo "  restore <f>  - Restaura backup"
        echo "  health       - Verifica se o banco está OK"
        echo ""
        echo "Exemplos:"
        echo "  $0 start     # Inicia o banco"
        echo "  $0 connect   # Conecta ao banco"
        echo "  $0 backup    # Faz backup"
        echo ""
        ;;
esac
