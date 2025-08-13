import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import csvParser from 'csv-parser';

const pool = new Pool({
    user: 'your_username',
    host: 'localhost',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});

export const ingestCsv = async (filePath: string): Promise<void> => {
    const results: any[] = [];

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            await saveMessagesToDatabase(results);
        });
};

const saveMessagesToDatabase = async (messages: any[]): Promise<void> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const insertQuery = 'INSERT INTO messages(column1, column2) VALUES($1, $2)'; // Adjust columns as necessary
        for (const message of messages) {
            await client.query(insertQuery, [message.column1, message.column2]); // Adjust columns as necessary
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};