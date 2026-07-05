// ==========================================
// MIDDLEWARE - Sécurité renforcée
// Couvre plusieurs failles OWASP en une seule passe
// ==========================================
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Retire les headers exposant des infos sur la stack (OWASP A05).
 */
export function hideStack(req: Request, res: Response, next: NextFunction) {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
}

/**
 * Bloque les requêtes avec taille excessive (OWASP A05 : DoS prevention).
 */
export function limitPayloadSize(maxBytes = 1_000_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBytes) {
      logger.security('PAYLOAD_TOO_LARGE', {
        ip: req.ip,
        size: contentLength,
        path: req.path,
      });
      return res.status(413).json({
        error: 'PAYLOAD_TOO_LARGE',
        message: 'Charge utile trop volumineuse',
      });
    }
    next();
  };
}

/**
 * Détecte les tentatives de path traversal (OWASP A01).
 * Ex: ../../etc/passwd
 */
export function preventPathTraversal(req: Request, res: Response, next: NextFunction) {
  const suspicious = /\.\.\/|\.\.\\|%2e%2e/i;
  if (suspicious.test(req.url) || suspicious.test(JSON.stringify(req.body || {}))) {
    logger.security('PATH_TRAVERSAL_ATTEMPT', {
      ip: req.ip,
      url: req.url,
      path: req.path,
    });
    return res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'Requête invalide',
    });
  }
  next();
}

/**
 * Ajoute un correlationId pour tracer chaque requête (OWASP A09 : logging).
 */
export function requestTracing(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(2, 15);
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId as string);
  next();
}
