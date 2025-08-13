import { Request, Response } from 'express';

export class MessageController {
    async ingestMessages(req: Request, res: Response) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded.'
                });
            }

            // Mock data para demonstração
            const messages = [
                {
                    id: 1,
                    content: 'Mensagem de exemplo',
                    timestamp: new Date().toISOString(),
                    platform: 'LinkedIn'
                }
            ];

            res.status(201).json({
                success: true,
                message: 'Messages ingested successfully.',
                data: messages
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error ingesting messages: ' + errorMessage
            });
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            // Mock data para demonstração
            const messages = [
                {
                    id: 1,
                    leadId: 1,
                    content: 'Olá! Vi seu perfil no LinkedIn e gostaria de conversar sobre oportunidades.',
                    timestamp: '2024-01-15T10:30:00Z',
                    platform: 'LinkedIn',
                    type: 'sent'
                },
                {
                    id: 2,
                    leadId: 1,
                    content: 'Obrigado pelo contato! Estou interessado em saber mais.',
                    timestamp: '2024-01-15T14:20:00Z',
                    platform: 'LinkedIn',
                    type: 'received'
                },
                {
                    id: 3,
                    leadId: 2,
                    content: 'Oi! Estamos contratando desenvolvedores na nossa startup.',
                    timestamp: '2024-01-18T09:15:00Z',
                    platform: 'LinkedIn',
                    type: 'sent'
                }
            ];

            const { leadId } = req.query;
            const filteredMessages = leadId 
                ? messages.filter(msg => msg.leadId === parseInt(leadId as string))
                : messages;

            res.status(200).json({
                success: true,
                data: filteredMessages,
                message: 'Messages retrieved successfully'
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error retrieving messages: ' + errorMessage
            });
        }
    }
}