import { Request, Response } from 'express';
import { parseCSVMessages, generateLeadsFromMessages, ParsedLead } from '../services/csvParser';
import { dbService } from '../services/databaseService';
import path from 'path';

// Armazenamento em memória como fallback
let leadsData: ParsedLead[] = [];
let isDataLoaded = false;
let useDatabase = false;

// Função para carregar dados do CSV ou banco
async function loadData() {
  try {
    // Tentar usar banco de dados primeiro
    const dbConnected = await dbService.testConnection();
    
    if (dbConnected) {
      useDatabase = true;
      console.log('✅ Usando banco de dados PostgreSQL');
      return;
    }
    
    // Fallback para CSV se banco não estiver disponível
    if (isDataLoaded) return;
    
    const csvPath = path.join(__dirname, '../../../database/messages.csv');
    const messages = await parseCSVMessages(csvPath);
    leadsData = generateLeadsFromMessages(messages);
    
    // Atualizar leadId na análise de IA
    leadsData.forEach(lead => {
      if (lead.aiAnalysis) {
        lead.aiAnalysis.leadId = lead.id;
      }
    });
    
    isDataLoaded = true;
    useDatabase = false;
    console.log(`📁 Usando dados do CSV - ${leadsData.length} leads carregados`);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    // Usar dados mockados como último recurso
    leadsData = getMockLeads();
    isDataLoaded = true;
    useDatabase = false;
    console.log('⚠️ Usando dados mock como fallback');
  }
}

function getMockLeads(): ParsedLead[] {
  return [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Tech Corp',
      position: 'CEO',
      linkedinUrl: 'https://linkedin.com/in/joaosilva',
      phone: '+55 11 99999-9999',
      status: 'qualified',
      source: 'LinkedIn',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      totalMessages: 5,
      aiAnalysis: {
        leadId: 1,
        opportunityType: 'vendas',
        score: 85,
        profileScore: 90,
        engagementScore: 80,
        intentionScore: 85,
        insights: [
          'Perfil de decisor técnico',
          'Demonstra interesse em automação',
          'Empresa em fase de crescimento'
        ],
        needs: [
          'Soluções de automação',
          'Integração de sistemas',
          'Modernização tecnológica'
        ],
        nextActions: [
          'Agendar demonstração',
          'Apresentar caso de uso específico',
          'Propor reunião técnica'
        ],
        sentiment: 'positivo',
        confidence: 0.92
      }
    }
  ];
}

export class LeadController {
    public async getLeads(req: Request, res: Response): Promise<void> {
        try {
            await loadData();
            
            let leads: ParsedLead[];
            
            if (useDatabase) {
              leads = await dbService.getAllLeads();
            } else {
              leads = leadsData;
            }
            
            res.status(200).json({
                success: true,
                data: leads,
                message: 'Leads fetched successfully'
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ 
                success: false,
                message: 'Error fetching leads', 
                error: errorMessage 
            });
        }
    }

    public async getLeadById(req: Request, res: Response): Promise<void> {
        try {
            await loadData();
            const id = parseInt(req.params.id);
            
            // Validar se o ID é um número válido
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ 
                    success: false,
                    message: 'ID do lead deve ser um número válido' 
                });
                return;
            }
            
            let lead: ParsedLead | null = null;
            
            if (useDatabase) {
              lead = await dbService.getLeadById(id);
            } else {
              lead = leadsData.find(l => l.id === id) || null;
            }
            
            if (!lead) {
                res.status(404).json({ 
                    success: false,
                    message: 'Lead não encontrado' 
                });
                return;
            }
            
            res.status(200).json({
                success: true,
                data: lead,
                message: 'Lead fetched successfully'
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ 
                success: false,
                message: 'Error fetching lead', 
                error: errorMessage 
            });
        }
    }

    public async analyzeLead(req: Request, res: Response): Promise<void> {
        const { leadId } = req.params;
        try {
            await loadData();
            
            const id = parseInt(leadId);
            
            // Validar se o ID é um número válido
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ 
                    success: false,
                    message: 'ID do lead deve ser um número válido' 
                });
                return;
            }
            
            let lead: ParsedLead | null = null;
            
            if (useDatabase) {
              lead = await dbService.getLeadById(id);
            } else {
              lead = leadsData.find(l => l.id === id) || null;
            }
            
            if (!lead) {
                res.status(404).json({ 
                    success: false,
                    message: 'Lead não encontrado' 
                });
                return;
            }

            const analysisResult = lead.aiAnalysis || {
                leadId: id,
                opportunityType: 'networking',
                score: 60,
                profileScore: 70,
                engagementScore: 60,
                intentionScore: 50,
                insights: ['Perfil profissional relevante'],
                needs: ['Networking profissional'],
                nextActions: ['Manter contato regular'],
                sentiment: 'neutro',
                confidence: 0.75
            };

            res.status(200).json({
                success: true,
                data: analysisResult,
                message: 'Lead analyzed successfully'
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ 
                success: false,
                message: 'Error analyzing lead', 
                error: errorMessage 
            });
        }
    }

    public async reloadCSVData(req: Request, res: Response): Promise<void> {
        try {
            if (useDatabase) {
              // Reprocessar CSV para o banco de dados
              const csvPath = path.join(__dirname, '../../../database/messages.csv');
              const messages = await parseCSVMessages(csvPath);
              const leads = generateLeadsFromMessages(messages);
              
              const result = await dbService.processCSVData(messages, leads);
              
              res.status(200).json({ 
                  success: true,
                  data: { 
                    totalLeads: result.processedLeads,
                    totalMessages: result.processedMessages 
                  },
                  message: 'Dados do CSV processados no banco de dados'
              });
            } else {
              // Recarregar dados em memória
              isDataLoaded = false;
              await loadData();
              
              res.status(200).json({ 
                  success: true,
                  data: { totalLeads: leadsData.length },
                  message: 'Dados recarregados com sucesso'
              });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ 
                success: false,
                message: 'Erro ao recarregar dados do CSV',
                error: errorMessage 
            });
        }
    }
    
    public async getDashboardMetrics(req: Request, res: Response): Promise<void> {
        try {
            await loadData();
            
            let metrics;
            
            if (useDatabase) {
              metrics = await dbService.getDashboardMetrics();
            } else {
              // Calcular métricas dos dados em memória
              const totalLeads = leadsData.length;
              const qualifiedLeads = leadsData.filter(l => ['qualified', 'converted'].includes(l.status)).length;
              const convertedLeads = leadsData.filter(l => l.status === 'converted').length;
              
              metrics = {
                totalLeads,
                qualifiedLeads,
                conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
                averageScore: leadsData.reduce((acc, lead) => acc + (lead.aiAnalysis?.score || 0), 0) / totalLeads,
                opportunityDistribution: {
                  vendas: leadsData.filter(l => l.aiAnalysis?.opportunityType === 'vendas').length,
                  emprego: leadsData.filter(l => l.aiAnalysis?.opportunityType === 'emprego').length,
                  pesquisa: leadsData.filter(l => l.aiAnalysis?.opportunityType === 'pesquisa').length,
                  networking: leadsData.filter(l => l.aiAnalysis?.opportunityType === 'networking').length,
                },
                sentimentDistribution: {
                  positivo: leadsData.filter(l => l.aiAnalysis?.sentiment === 'positivo').length,
                  neutro: leadsData.filter(l => l.aiAnalysis?.sentiment === 'neutro').length,
                  negativo: leadsData.filter(l => l.aiAnalysis?.sentiment === 'negativo').length,
                },
                monthlyTrends: []
              };
            }
            
            res.status(200).json({
                success: true,
                data: metrics,
                message: 'Dashboard metrics fetched successfully'
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ 
                success: false,
                message: 'Error fetching dashboard metrics', 
                error: errorMessage 
            });
        }
    }
}