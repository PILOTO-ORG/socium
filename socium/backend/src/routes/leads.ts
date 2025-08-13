import { Router } from 'express';
import { LeadController } from '../controllers/leadController';

const router = Router();
const leadController = new LeadController();

// GET /api/leads - Buscar todos os leads
router.get('/', leadController.getLeads.bind(leadController));

// GET /api/leads/metrics - Buscar métricas do dashboard
router.get('/metrics', leadController.getDashboardMetrics.bind(leadController));

// GET /api/leads/:id - Buscar lead por ID
router.get('/:id', leadController.getLeadById.bind(leadController));

// POST /api/leads/:leadId/analyze - Analisar lead específico
router.post('/:leadId/analyze', leadController.analyzeLead.bind(leadController));

// POST /api/leads/reload - Recarregar dados do CSV
router.post('/reload', leadController.reloadCSVData.bind(leadController));

// GET /api/leads/analysis - Buscar análises de IA
router.get('/analysis', (req, res) => {
    try {
        const mockAnalysisResults = [
            {
                id: '1',
                title: 'Análise de Lead - Vendas',
                description: 'Lead qualificado com alto potencial de conversão',
                score: 85,
                category: 'vendas',
                createdAt: '2024-01-20T14:15:00Z'
            }
        ];

        res.json({
            success: true,
            data: mockAnalysisResults,
            message: 'Análises recuperadas com sucesso'
        });
    } catch (error) {
        console.error('Erro ao buscar análises:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// POST /api/leads/analyze-all - Analisar todos os leads
router.post('/analyze-all', (req, res) => {
    try {
        // Simular processamento em lote
        const processedCount = 10;

        res.json({
            success: true,
            data: { processedCount },
            message: `${processedCount} leads analisados com sucesso`
        });
    } catch (error) {
        console.error('Erro na análise em lote:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

export default router;