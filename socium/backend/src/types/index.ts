// This file exports TypeScript types and interfaces used in the backend application for better type safety.

export interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: 'new' | 'contacted' | 'qualified' | 'lost';
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    id: number;
    leadId: number;
    content: string;
    createdAt: Date;
}

export interface CsvMessage {
    leadId: number;
    content: string;
}