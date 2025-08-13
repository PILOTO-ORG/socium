// This file exports TypeScript types and interfaces used throughout the frontend application for better type safety.

export interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    company?: string;
    position?: string;
    linkedinUrl?: string;
    status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
    source: string;
    createdAt: string;
    updatedAt: string;
    aiAnalysis?: AIAnalysisResult;
}

export interface Message {
    id: number;
    leadId: number;
    content: string;
    timestamp: Date;
    platform: string;
    type: 'sent' | 'received';
    sentiment?: string;
}

export interface AIAnalysisResult {
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
}

export interface LeadAnalysisResult {
    id: string;
    title: string;
    description: string;
    score?: number;
    category?: string;
    createdAt?: string;
    lead?: Lead;
    analysis?: AIAnalysisResult;
}

export interface AnalyticsData {
    totalLeads: number;
    qualifiedLeads: number;
    conversionRate: number;
    averageScore: number;
    opportunityDistribution: {
        vendas: number;
        emprego: number;
        pesquisa: number;
        networking: number;
    };
    sentimentDistribution: {
        positivo: number;
        neutro: number;
        negativo: number;
    };
    monthlyTrends: Array<{
        month: string;
        leads: number;
        qualified: number;
        converted: number;
    }>;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

export interface CSVUploadResult {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors: string[];
}

export interface DashboardFilters {
    status?: Lead['status'];
    opportunityType?: AIAnalysisResult['opportunityType'];
    minScore?: number;
    maxScore?: number;
    dateRange?: {
        start: string;
        end: string;
    };
}