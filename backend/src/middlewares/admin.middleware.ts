// ==========================================
// MIDDLEWARE - Vérification du rôle Admin
// ==========================================
// À utiliser APRÈS authMiddleware : il suppose que req.userId est déjà défini.
// Vérifie en base que l'utilisateur a bien le rôle 'admin', sinon refuse (403).
import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from './auth.middleware';

export async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentification requise',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { role: true },
  });

  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Accès réservé aux administrateurs',
    });
  }

  next();
}
