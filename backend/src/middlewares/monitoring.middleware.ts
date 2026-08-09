// ==========================================
// MONITORING - Mesure et journalisation des requêtes
// Indicateurs de suivi : temps de réponse, code HTTP, taux d'erreur
// ==========================================
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const SLOW_REQUEST_MS = 1000;
const EXCLUDED_PATHS = ['/health', '/live', '/ready'];

export function requestMonitoring(req: Request, res: Response, next: NextFunction): void {
  if (EXCLUDED_PATHS.includes(req.path)) {
    return next();
  }

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Math.round(Number(process.hrtime.bigint() - start) / 1_000_000);

    const context = {
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status: res.statusCode,
      durationMs,
      requestId: (req as any).requestId,
    };

    if (res.statusCode >= 500) {
      logger.error('Erreur serveur', context);
    } else if (res.statusCode >= 400) {
      logger.warn('Requête en erreur', context);
    } else if (durationMs > SLOW_REQUEST_MS) {
      logger.warn('Requête lente', context);
    } else {
      logger.info('Requête traitée', context);
    }
  });

  next();
}