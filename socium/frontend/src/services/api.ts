import axios from 'axios';
import { Lead, LeadAnalysisResult, AnalyticsData, AIAnalysisResult, CSVUploadResult, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Lead Management
export const fetchLeads = async (filters?: any): Promise<Lead[]> => {
    try {
        const response = await api.get('/leads', { params: filters });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching leads:', error);
        throw error;
    }
};

export const fetchLeadById = async (id: number): Promise<Lead> => {
    try {
        const response = await api.get(`/leads/${id}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching lead:', error);
        throw error;
    }
};

export const updateLeadStatus = async (id: number, status: Lead['status']): Promise<Lead> => {
    try {
        const response = await api.patch(`/leads/${id}`, { status });
        return response.data.data;
    } catch (error) {
        console.error('Error updating lead status:', error);
        throw error;
    }
};

// AI Analysis
export const fetchLeadAnalysis = async (): Promise<LeadAnalysisResult[]> => {
    try {
        const response = await api.get('/leads/analysis');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching lead analysis:', error);
        throw error;
    }
};

export const analyzeLead = async (leadId: number): Promise<AIAnalysisResult> => {
    try {
        const response = await api.post(`/leads/${leadId}/analyze`);
        return response.data.data;
    } catch (error) {
        console.error('Error analyzing lead:', error);
        throw error;
    }
};

export const analyzeAllLeads = async (): Promise<ApiResponse<{ processedCount: number }>> => {
    try {
        const response = await api.post('/leads/analyze-all');
        return response.data;
    } catch (error) {
        console.error('Error analyzing all leads:', error);
        throw error;
    }
};

// Analytics
export const fetchLeadAnalytics = async (): Promise<AnalyticsData> => {
    try {
        const response = await api.get('/analytics/leads');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        throw error;
    }
};

export const fetchDashboardMetrics = async (): Promise<AnalyticsData> => {
    try {
        const response = await api.get('/leads/metrics');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        throw error;
    }
};

// Messages
export const fetchMessages = async (leadId?: number): Promise<any[]> => {
    try {
        const url = leadId ? `/messages?leadId=${leadId}` : '/messages';
        const response = await api.get(url);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

// CSV Upload
export const uploadCSV = async (formData: FormData): Promise<ApiResponse<{
    fileName: string;
    messagesProcessed: number;
    leadsGenerated: number;
    uploadedAt: string;
}>> => {
    try {
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading CSV:', error);
        throw error;
    }
};

export default api;