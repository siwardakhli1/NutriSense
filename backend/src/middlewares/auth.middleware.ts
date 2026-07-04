// ==========================================
// MIDDLEWARE - Authentification JWT
// ==========================================
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token manquant',
    });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; type?: string };

    // Sécurité : on refuse un refresh token en tant qu'access token
    if (decoded.type === 'refresh') {
      return res.status(401).json({
        error: 'INVALID_TOKEN_TYPE',
        message: "Ce token ne peut pas être utilisé pour l'authentification",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (err: any) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      error: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      message: isExpired ? 'Token expiré, rafraîchir la session' : 'Token invalide',
    });
  }
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ userId, type: 'access' }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  } as jwt.SignOptions);
}
