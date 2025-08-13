import axios from 'axios';
import { Lead } from '../models/Lead';
import { Message } from '../models/Message';

const OPENAI_API_URL = 'https://api.openai.com/v1/engines/davinci-codex/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const analyzeLeadMessages = async (messages: Message[]): Promise<any> => {
    const leadAnalysisResults = await Promise.all(messages.map(async (message) => {
        const response = await axios.post(OPENAI_API_URL, {
            prompt: `Analyze the following message for commercial interest: ${message.content}`,
            max_tokens: 50,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        return {
            messageId: message.id,
            analysis: response.data.choices[0].text.trim(),
        };
    }));

    return leadAnalysisResults;
};