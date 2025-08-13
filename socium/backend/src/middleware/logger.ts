import { Request, Response, NextFunction } from 'express';
import logger, { logRequest } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log da requisição
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Interceptar o fim da resposta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    logRequest(req, res, duration);
    return originalSend.call(this, data);
  };

  next();
};

export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Request error', {
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

export default { requestLogger, errorLogger };
