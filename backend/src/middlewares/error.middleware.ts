// ==========================================
// MIDDLEWARE - Gestionnaire d'erreurs global
// ==========================================
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  // Log structuré (en prod : pino/winston)
  console.error(`[ERROR] ${req.method} ${req.path}`, {
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
  }

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue',
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint introuvable',
  });
}
