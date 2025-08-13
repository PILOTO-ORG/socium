import { Pool } from 'pg';
import { parseCSVMessages, generateLeadsFromMessages, ParsedLead, ParsedMessage } from '../services/csvParser';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

export class DatabaseService {
  async testConnection(): Promise<boolean> {
    try {
      await pool.query('SELECT NOW()');
      return true;
    } catch (error) {
      console.error('Erro na conexão com o banco:', error);
      return false;
    }
  }

  // LEADS
  async getAllLeads(): Promise<ParsedLead[]> {
    try {
      const query = `
        SELECT 
          l.*,
          ai.opportunity_type,
          ai.score,
          ai.profile_score,
          ai.engagement_score,
          ai.intention_score,
          ai.insights,
          ai.needs,
          ai.next_actions,
          ai.sentiment,
          ai.confidence
        FROM leads l
        LEFT JOIN ai_analyses ai ON l.id = ai.lead_id
        ORDER BY l.created_at DESC
      `;
      
      const result = await pool.query(query);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        company: row.company,
        position: row.position,
        linkedinUrl: row.linkedin_url,
        status: row.status,
        source: row.source,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        totalMessages: row.total_messages || 0,
        lastMessageDate: row.last_message_date,
        aiAnalysis: row.opportunity_type ? {
          leadId: row.id,
          opportunityType: row.opportunity_type,
          score: row.score,
          profileScore: row.profile_score,
          engagementScore: row.engagement_score,
          intentionScore: row.intention_score,
          insights: row.insights || [],
          needs: row.needs || [],
          nextActions: row.next_actions || [],
          sentiment: row.sentiment,
          confidence: row.confidence
        } : undefined
      }));
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      throw error;
    }
  }

  async getLeadById(id: number): Promise<ParsedLead | null> {
    try {
      const query = `
        SELECT 
          l.*,
          ai.opportunity_type,
          ai.score,
          ai.profile_score,
          ai.engagement_score,
          ai.intention_score,
          ai.insights,
          ai.needs,
          ai.next_actions,
          ai.sentiment,
          ai.confidence
        FROM leads l
        LEFT JOIN ai_analyses ai ON l.id = ai.lead_id
        WHERE l.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        company: row.company,
        position: row.position,
        linkedinUrl: row.linkedin_url,
        status: row.status,
        source: row.source,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        totalMessages: row.total_messages || 0,
        lastMessageDate: row.last_message_date,
        aiAnalysis: row.opportunity_type ? {
          leadId: row.id,
          opportunityType: row.opportunity_type,
          score: row.score,
          profileScore: row.profile_score,
          engagementScore: row.engagement_score,
          intentionScore: row.intention_score,
          insights: row.insights || [],
          needs: row.needs || [],
          nextActions: row.next_actions || [],
          sentiment: row.sentiment,
          confidence: row.confidence
        } : undefined
      };
    } catch (error) {
      console.error('Erro ao buscar lead:', error);
      throw error;
    }
  }

  async createLead(lead: Omit<ParsedLead, 'id'>): Promise<ParsedLead> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Inserir lead
      const leadQuery = `
        INSERT INTO leads (name, email, phone, company, position, linkedin_url, status, source, total_messages, last_message_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const leadResult = await client.query(leadQuery, [
        lead.name,
        lead.email,
        lead.phone,
        lead.company,
        lead.position,
        lead.linkedinUrl,
        lead.status,
        lead.source,
        lead.totalMessages,
        lead.lastMessageDate
      ]);
      
      const newLead = leadResult.rows[0];
      
      // Inserir análise de IA se existir
      if (lead.aiAnalysis) {
        const aiQuery = `
          INSERT INTO ai_analyses (lead_id, opportunity_type, score, profile_score, engagement_score, intention_score, insights, needs, next_actions, sentiment, confidence)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        
        await client.query(aiQuery, [
          newLead.id,
          lead.aiAnalysis.opportunityType,
          lead.aiAnalysis.score,
          lead.aiAnalysis.profileScore,
          lead.aiAnalysis.engagementScore,
          lead.aiAnalysis.intentionScore,
          JSON.stringify(lead.aiAnalysis.insights),
          JSON.stringify(lead.aiAnalysis.needs),
          JSON.stringify(lead.aiAnalysis.nextActions),
          lead.aiAnalysis.sentiment,
          lead.aiAnalysis.confidence
        ]);
      }
      
      await client.query('COMMIT');
      
      return {
        id: newLead.id,
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        company: newLead.company,
        position: newLead.position,
        linkedinUrl: newLead.linkedin_url,
        status: newLead.status,
        source: newLead.source,
        createdAt: newLead.created_at,
        updatedAt: newLead.updated_at,
        totalMessages: newLead.total_messages,
        lastMessageDate: newLead.last_message_date,
        aiAnalysis: lead.aiAnalysis
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao criar lead:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async processCSVData(messages: ParsedMessage[], leads: ParsedLead[]): Promise<{processedLeads: number, processedMessages: number}> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let processedLeads = 0;
      let processedMessages = 0;
      
      // Processar leads
      for (const lead of leads) {
        // Verificar se lead já existe
        const existingLead = await client.query(
          'SELECT id FROM leads WHERE name = $1 AND source = $2',
          [lead.name, lead.source]
        );
        
        if (existingLead.rows.length === 0) {
          // Inserir novo lead
          const leadQuery = `
            INSERT INTO leads (name, email, phone, company, position, linkedin_url, status, source, total_messages, last_message_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
          `;
          
          const leadResult = await client.query(leadQuery, [
            lead.name,
            lead.email,
            lead.phone,
            lead.company,
            lead.position,
            lead.linkedinUrl,
            lead.status,
            lead.source,
            lead.totalMessages,
            lead.lastMessageDate
          ]);
          
          const leadId = leadResult.rows[0].id;
          
          // Inserir análise de IA
          if (lead.aiAnalysis) {
            const aiQuery = `
              INSERT INTO ai_analyses (lead_id, opportunity_type, score, profile_score, engagement_score, intention_score, insights, needs, next_actions, sentiment, confidence)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `;
            
            await client.query(aiQuery, [
              leadId,
              lead.aiAnalysis.opportunityType,
              lead.aiAnalysis.score,
              lead.aiAnalysis.profileScore,
              lead.aiAnalysis.engagementScore,
              lead.aiAnalysis.intentionScore,
              JSON.stringify(lead.aiAnalysis.insights),
              JSON.stringify(lead.aiAnalysis.needs),
              JSON.stringify(lead.aiAnalysis.nextActions),
              lead.aiAnalysis.sentiment,
              lead.aiAnalysis.confidence
            ]);
          }
          
          processedLeads++;
        }
      }
      
      // Processar mensagens
      for (const message of messages) {
        // Encontrar lead correspondente
        const leadQuery = await client.query(
          'SELECT id FROM leads WHERE name = $1',
          [message.from === 'Luan Costa' ? message.to : message.from]
        );
        
        if (leadQuery.rows.length > 0) {
          const leadId = leadQuery.rows[0].id;
          
          // Verificar se mensagem já existe
          const existingMessage = await client.query(
            'SELECT id FROM messages WHERE conversation_id = $1 AND content = $2 AND date_sent = $3',
            [message.conversationId, message.content, message.date]
          );
          
          if (existingMessage.rows.length === 0) {
            // Inserir nova mensagem
            const messageQuery = `
              INSERT INTO messages (lead_id, conversation_id, from_user, to_user, content, date_sent, subject, from_profile_url, to_profile_url, platform, message_type, folder, attachments)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `;
            
            await client.query(messageQuery, [
              leadId,
              message.conversationId,
              message.from,
              message.to,
              message.content,
              message.date,
              message.subject,
              message.fromProfileUrl,
              message.toProfileUrl,
              message.platform,
              message.type,
              message.folder,
              message.attachments
            ]);
            
            processedMessages++;
          }
        }
      }
      
      await client.query('COMMIT');
      
      return { processedLeads, processedMessages };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao processar dados do CSV:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getDashboardMetrics() {
    try {
      const queries = await Promise.all([
        pool.query('SELECT COUNT(*) as total FROM leads'),
        pool.query('SELECT COUNT(*) as qualified FROM leads WHERE status IN (\'qualified\', \'converted\')'),
        pool.query('SELECT COUNT(*) as converted FROM leads WHERE status = \'converted\''),
        pool.query('SELECT AVG(score) as avg_score FROM ai_analyses WHERE score IS NOT NULL'),
        pool.query(`
          SELECT 
            opportunity_type, 
            COUNT(*) as count 
          FROM ai_analyses 
          WHERE opportunity_type IS NOT NULL 
          GROUP BY opportunity_type
        `),
        pool.query(`
          SELECT 
            sentiment, 
            COUNT(*) as count 
          FROM ai_analyses 
          WHERE sentiment IS NOT NULL 
          GROUP BY sentiment
        `)
      ]);

      const totalLeads = parseInt(queries[0].rows[0].total);
      const qualifiedLeads = parseInt(queries[1].rows[0].qualified);
      const convertedLeads = parseInt(queries[2].rows[0].converted);
      const averageScore = parseFloat(queries[3].rows[0].avg_score) || 0;
      
      const opportunityDistribution = {
        vendas: 0,
        emprego: 0,
        pesquisa: 0,
        networking: 0
      };
      
      queries[4].rows.forEach(row => {
        opportunityDistribution[row.opportunity_type as keyof typeof opportunityDistribution] = parseInt(row.count);
      });
      
      const sentimentDistribution = {
        positivo: 0,
        neutro: 0,
        negativo: 0
      };
      
      queries[5].rows.forEach(row => {
        sentimentDistribution[row.sentiment as keyof typeof sentimentDistribution] = parseInt(row.count);
      });

      return {
        totalLeads,
        qualifiedLeads,
        conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
        averageScore,
        opportunityDistribution,
        sentimentDistribution,
        monthlyTrends: [] // Implementar se necessário
      };
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      throw error;
    }
  }
}

export const dbService = new DatabaseService();
