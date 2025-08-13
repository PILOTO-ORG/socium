import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Importar logger e middlewares
import logger from './utils/logger';
import { requestLogger, errorLogger } from './middleware/logger';

import { createConnection } from './database/connection';
import leadRoutes from './routes/leads';
import messageRoutes from './routes/messages';
import uploadRoutes from './routes/upload';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware de logs
app.use(requestLogger);

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ 
    limit: process.env.UPLOAD_MAX_SIZE || '10mb' 
}));

app.use(express.urlencoded({ 
    extended: true,
    limit: process.env.UPLOAD_MAX_SIZE || '10mb' 
}));

// Rotas
app.use('/api/leads', leadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Analytics routes
app.get('/api/analytics/dashboard', (req, res) => {
    // Mock data para demonstração
    res.json({
        success: true,
        data: {
            totalLeads: 150,
            qualifiedLeads: 45,
            conversionRate: 30.0,
            averageScore: 72.5,
            opportunityDistribution: {
                vendas: 60,
                emprego: 35,
                pesquisa: 25,
                networking: 30
            },
            sentimentDistribution: {
                positivo: 85,
                neutro: 45,
                negativo: 20
            },
            monthlyTrends: [
                { month: 'Jan', leads: 25, qualified: 8, converted: 3 },
                { month: 'Fev', leads: 30, qualified: 12, converted: 5 },
                { month: 'Mar', leads: 35, qualified: 15, converted: 7 },
                { month: 'Abr', leads: 40, qualified: 18, converted: 8 },
                { month: 'Mai', leads: 20, qualified: 7, converted: 4 }
            ]
        }
    });
});

app.get('/api/analytics/leads', (req, res) => {
    // Mock data para demonstração
    res.json({
        success: true,
        data: {
            totalLeads: 150,
            qualifiedLeads: 45,
            conversionRate: 30.0,
            averageScore: 72.5,
            opportunityDistribution: {
                vendas: 60,
                emprego: 35,
                pesquisa: 25,
                networking: 30
            },
            sentimentDistribution: {
                positivo: 85,
                neutro: 45,
                negativo: 20
            },
            monthlyTrends: [
                { month: 'Janeiro', leads: 25, qualified: 8, converted: 3 },
                { month: 'Fevereiro', leads: 30, qualified: 12, converted: 5 },
                { month: 'Março', leads: 35, qualified: 15, converted: 7 },
                { month: 'Abril', leads: 40, qualified: 18, converted: 8 },
                { month: 'Maio', leads: 20, qualified: 7, converted: 4 }
            ]
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 Socium AI Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            leads: '/api/leads',
            messages: '/api/messages',
            upload: '/api/upload'
        }
    });
});

// Error handling middleware
app.use(errorLogger);

// 404 handler
app.use('*', (req, res) => {
    logger.warn('404 - Endpoint não encontrado', { url: req.originalUrl, method: req.method });
    res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado'
    });
});

// Inicializar servidor
const startServer = async () => {
    try {
        await createConnection();
        
        app.listen(PORT, () => {
            logger.info(`🚀 Socium AI Backend rodando em http://localhost:${PORT}`);
            logger.info(`📊 Health check disponível em http://localhost:${PORT}/health`);
            logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔧 CORS configurado para: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
        });
    } catch (error) {
        logger.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};

startServer();

export default app;