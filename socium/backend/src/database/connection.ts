import { Pool } from 'pg';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USERNAME || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'socium',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Configuração do Sequelize
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'socium',
  logging: false, // Desabilitar logs SQL por padrão
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const createConnection = async () => {
  try {
    await pool.connect();
    console.log('📦 Conexão com banco de dados estabelecida');
    
    // Testar conexão Sequelize
    await sequelize.authenticate();
    console.log('📦 Sequelize conectado ao banco de dados');
  } catch (error) {
    console.log('⚠️  Banco de dados não disponível, usando dados mock');
    console.log('   Para usar banco real, configure as variáveis de ambiente');
  }
};

export default {
  query,
  createConnection,
  sequelize,
};