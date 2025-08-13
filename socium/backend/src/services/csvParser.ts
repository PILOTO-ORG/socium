import fs from 'fs';
import csvParser from 'csv-parser';

export interface MessageCSVRow {
    'CONVERSATION ID': string;
    'CONVERSATION TITLE': string;
    'FROM': string;
    'SENDER PROFILE URL': string;
    'TO': string;
    'RECIPIENT PROFILE URLS': string;
    'DATE': string;
    'SUBJECT': string;
    'CONTENT': string;
    'FOLDER': string;
    'ATTACHMENTS': string;
}

export interface ParsedMessage {
    id: string;
    conversationId: string;
    from: string;
    to: string;
    content: string;
    date: string;
    subject: string;
    fromProfileUrl: string;
    toProfileUrl: string;
    platform: string;
    type: 'sent' | 'received';
    folder: string;
    attachments?: string;
}

export interface ParsedLead {
    id: number;
    name: string;
    email?: string;
    company?: string;
    position?: string;
    linkedinUrl?: string;
    phone?: string;
    status: 'new' | 'contacted' | 'qualified' | 'converted';
    source: string;
    createdAt: string;
    updatedAt: string;
    lastMessageDate?: string;
    totalMessages: number;
    aiAnalysis?: {
        leadId: number;
        opportunityType: 'vendas' | 'emprego' | 'pesquisa' | 'networking';
        score: number;
        profileScore: number;
        engagementScore: number;
        intentionScore: number;
        insights: string[];
        needs: string[];
        nextActions: string[];
        sentiment: 'positivo' | 'neutro' | 'negativo';
        confidence: number;
    };
}

export function parseCSVMessages(filePath: string): Promise<ParsedMessage[]> {
    return new Promise((resolve, reject) => {
        const messages: ParsedMessage[] = [];
        let idCounter = 1;

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row: MessageCSVRow) => {
                try {
                    // Determinar se a mensagem foi enviada ou recebida
                    const isFromLuan = row.FROM === 'Luan Costa';
                    
                    const message: ParsedMessage = {
                        id: `msg_${idCounter++}`,
                        conversationId: row['CONVERSATION ID'],
                        from: row.FROM || 'Unknown',
                        to: row.TO || 'Unknown',
                        content: row.CONTENT?.replace(/<[^>]*>/g, '') || '', // Remove HTML tags
                        date: row.DATE,
                        subject: row.SUBJECT || '',
                        fromProfileUrl: row['SENDER PROFILE URL'] || '',
                        toProfileUrl: row['RECIPIENT PROFILE URLS'] || '',
                        platform: 'LinkedIn',
                        type: isFromLuan ? 'sent' : 'received',
                        folder: row.FOLDER || 'INBOX',
                        attachments: row.ATTACHMENTS || undefined
                    };

                    if (message.content.trim()) {
                        messages.push(message);
                    }
                } catch (error) {
                    console.warn('Erro ao processar linha do CSV:', error);
                }
            })
            .on('end', () => {
                resolve(messages);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

export function generateLeadsFromMessages(messages: ParsedMessage[]): ParsedLead[] {
    const leadsMap = new Map<string, ParsedLead>();
    let leadIdCounter = 1;

    messages.forEach(message => {
        // Identificar o contato (não é o Luan)
        const isFromLuan = message.from === 'Luan Costa';
        const contactName = isFromLuan ? message.to : message.from;
        const contactUrl = isFromLuan ? message.toProfileUrl : message.fromProfileUrl;

        if (contactName && contactName !== 'Luan Costa' && !leadsMap.has(contactName)) {
            // Análise de IA baseada no conteúdo das mensagens
            const analysis = generateAIAnalysis(contactName, messages.filter(m => 
                m.from === contactName || m.to === contactName
            ));

            const lead: ParsedLead = {
                id: leadIdCounter++,
                name: contactName,
                linkedinUrl: contactUrl,
                status: determineLeadStatus(analysis.score),
                source: 'LinkedIn',
                createdAt: message.date,
                updatedAt: message.date,
                lastMessageDate: message.date,
                totalMessages: messages.filter(m => 
                    m.from === contactName || m.to === contactName
                ).length,
                aiAnalysis: analysis
            };

            leadsMap.set(contactName, lead);
        } else if (contactName && leadsMap.has(contactName)) {
            // Atualizar dados existentes
            const existingLead = leadsMap.get(contactName)!;
            const messageDate = new Date(message.date);
            const lastDate = new Date(existingLead.lastMessageDate || existingLead.createdAt);
            
            if (messageDate > lastDate) {
                existingLead.lastMessageDate = message.date;
                existingLead.updatedAt = message.date;
            }
            
            existingLead.totalMessages++;
        }
    });

    return Array.from(leadsMap.values());
}

function generateAIAnalysis(leadName: string, messages: ParsedMessage[]) {
    const content = messages.map(m => m.content).join(' ').toLowerCase();
    
    // Análise de tipo de oportunidade
    let opportunityType: 'vendas' | 'emprego' | 'pesquisa' | 'networking' = 'networking';
    if (content.includes('vaga') || content.includes('emprego') || content.includes('carreira')) {
        opportunityType = 'emprego';
    } else if (content.includes('vend') || content.includes('negóc') || content.includes('proposta')) {
        opportunityType = 'vendas';
    } else if (content.includes('pesquis') || content.includes('universidade') || content.includes('acadêmic')) {
        opportunityType = 'pesquisa';
    }

    // Análise de sentimento
    let sentiment: 'positivo' | 'neutro' | 'negativo' = 'neutro';
    const positiveWords = ['obrigad', 'excelente', 'ótimo', 'interessante', 'legal', 'bom', 'prazer'];
    const negativeWords = ['não', 'problema', 'difícil', 'impossível', 'infelizmente'];
    
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;
    
    if (positiveCount > negativeCount) sentiment = 'positivo';
    else if (negativeCount > positiveCount) sentiment = 'negativo';

    // Cálculo de scores
    const engagementScore = Math.min(100, messages.length * 10 + 50);
    const profileScore = leadName.includes('CEO') || leadName.includes('CTO') || leadName.includes('Gerente') ? 90 : 70;
    const intentionScore = opportunityType === 'vendas' ? 85 : 
                          opportunityType === 'emprego' ? 75 : 
                          opportunityType === 'pesquisa' ? 65 : 60;
    
    const score = Math.round((engagementScore + profileScore + intentionScore) / 3);

    return {
        leadId: 0, // Será atualizado depois
        opportunityType,
        score,
        profileScore,
        engagementScore,
        intentionScore,
        insights: generateInsights(leadName, content, opportunityType),
        needs: generateNeeds(content, opportunityType),
        nextActions: generateNextActions(opportunityType, sentiment),
        sentiment,
        confidence: 0.85
    };
}

function generateInsights(leadName: string, content: string, opportunityType: string): string[] {
    const insights = [];
    
    if (leadName.includes('CEO') || leadName.includes('CTO')) {
        insights.push('Perfil de liderança executiva');
    }
    
    if (content.includes('startup') || content.includes('inovação')) {
        insights.push('Interesse em inovação e tecnologia');
    }
    
    if (content.includes('ia') || content.includes('inteligência artificial')) {
        insights.push('Demonstra interesse em Inteligência Artificial');
    }
    
    switch (opportunityType) {
        case 'vendas':
            insights.push('Potencial cliente para soluções tecnológicas');
            break;
        case 'emprego':
            insights.push('Interessado em oportunidades de carreira');
            break;
        case 'pesquisa':
            insights.push('Foco em colaboração acadêmica');
            break;
        default:
            insights.push('Potencial para networking profissional');
    }
    
    return insights;
}

function generateNeeds(content: string, opportunityType: string): string[] {
    const needs = [];
    
    if (content.includes('automation') || content.includes('automação')) {
        needs.push('Soluções de automação');
    }
    
    if (content.includes('tecnologia') || content.includes('sistema')) {
        needs.push('Modernização tecnológica');
    }
    
    switch (opportunityType) {
        case 'vendas':
            needs.push('Soluções para otimização de processos');
            break;
        case 'emprego':
            needs.push('Oportunidades de desenvolvimento profissional');
            break;
        case 'pesquisa':
            needs.push('Parcerias em projetos de pesquisa');
            break;
        default:
            needs.push('Expansão de rede profissional');
    }
    
    return needs;
}

function generateNextActions(opportunityType: string, sentiment: string): string[] {
    const actions = [];
    
    if (sentiment === 'positivo') {
        actions.push('Dar continuidade à conversa');
    }
    
    switch (opportunityType) {
        case 'vendas':
            actions.push('Apresentar proposta comercial');
            actions.push('Agendar demonstração');
            break;
        case 'emprego':
            actions.push('Apresentar oportunidades disponíveis');
            actions.push('Agendar entrevista');
            break;
        case 'pesquisa':
            actions.push('Propor colaboração acadêmica');
            actions.push('Compartilhar projetos de pesquisa');
            break;
        default:
            actions.push('Manter contato regular');
            actions.push('Explorar sinergias');
    }
    
    return actions;
}

function determineLeadStatus(score: number): 'new' | 'contacted' | 'qualified' | 'converted' {
    if (score >= 80) return 'qualified';
    if (score >= 60) return 'contacted';
    return 'new';
}
