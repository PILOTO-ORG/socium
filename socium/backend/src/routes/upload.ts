import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { parseCSVMessages, generateLeadsFromMessages } from '../services/csvParser';
import { dbService } from '../services/databaseService';

const router = Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `messages_${timestamp}${ext}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos CSV são permitidos'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// POST /api/upload - Upload e processamento de CSV
router.post('/', upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo foi enviado'
            });
        }

        const filePath = req.file.path;
        
        try {
            // Processar o CSV
            const messages = await parseCSVMessages(filePath);
            const leads = generateLeadsFromMessages(messages);

            // Verificar se o banco de dados está disponível
            const dbConnected = await dbService.testConnection();
            
            let result;
            
            if (dbConnected) {
                // Processar no banco de dados
                result = await dbService.processCSVData(messages, leads);
                console.log('✅ Dados processados no banco PostgreSQL');
            } else {
                // Fallback: salvar arquivo localmente
                const dataDir = path.join(__dirname, '../../../database');
                const destPath = path.join(dataDir, 'messages.csv');
                
                // Fazer backup do arquivo anterior se existir
                if (fs.existsSync(destPath)) {
                    const backupPath = path.join(dataDir, `messages_backup_${Date.now()}.csv`);
                    fs.copyFileSync(destPath, backupPath);
                }
                
                // Copiar novo arquivo
                fs.copyFileSync(filePath, destPath);
                
                result = {
                    processedLeads: leads.length,
                    processedMessages: messages.length
                };
                
                console.log('📁 Dados salvos em arquivo CSV (banco indisponível)');
            }
            
            // Limpar arquivo temporário
            fs.unlinkSync(filePath);

            res.json({
                success: true,
                data: {
                    fileName: req.file.originalname,
                    messagesProcessed: result.processedMessages,
                    leadsGenerated: result.processedLeads,
                    uploadedAt: new Date().toISOString(),
                    savedToDatabase: dbConnected
                },
                message: dbConnected ? 
                    'CSV processado e salvo no banco de dados' : 
                    'CSV processado e salvo em arquivo'
            });

        } catch (parseError) {
            // Limpar arquivo em caso de erro
            fs.unlinkSync(filePath);
            throw parseError;
        }

    } catch (error) {
        console.error('Erro no upload/processamento do CSV:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        res.status(500).json({
            success: false,
            message: 'Erro ao processar arquivo CSV',
            error: errorMessage
        });
    }
});

// GET /api/upload/history - Histórico de uploads
router.get('/history', (req, res) => {
    try {
        const dataDir = path.join(__dirname, '../../../database');
        const files = fs.readdirSync(dataDir)
            .filter(file => file.startsWith('messages') && file.endsWith('.csv'))
            .map(file => {
                const filePath = path.join(dataDir, file);
                const stats = fs.statSync(filePath);
                return {
                    fileName: file,
                    uploadedAt: stats.mtime,
                    size: stats.size,
                    isActive: file === 'messages.csv'
                };
            })
            .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

        res.json({
            success: true,
            data: files,
            message: 'Histórico de uploads recuperado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao recuperar histórico de uploads'
        });
    }
});

export default router;
