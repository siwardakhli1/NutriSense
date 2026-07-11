// ==========================================
// ROUTES - Auth (Prisma / PostgreSQL)
// ==========================================
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware, AuthRequest, signAccessToken, signRefreshToken } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { registerSchema, loginSchema, refreshSchema } from '../schemas';
import { generateId } from '../utils/helpers';
import { logger } from '../utils/logger';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'Email déjà utilisé' });
  }

  const id = generateId();
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      id, name, email, password: hashedPassword,
      preferences: { create: {} }, 
    },
  });

  const accessToken = signAccessToken(id);
  const refreshToken = signRefreshToken(id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: id, expiresAt } });

  res.status(201).json({
    user: { id, name, email, isOnboarded: false, createdAt: new Date().toISOString() },
    accessToken,
    refreshToken,
  });
});

router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logger.security('LOGIN_FAILED_UNKNOWN_EMAIL', { email, ip });
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    logger.security('LOGIN_FAILED_WRONG_PASSWORD', { userId: user.id, email, ip });
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect' });
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  logger.security('LOGIN_SUCCESS', { userId: user.id, email, ip });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, isOnboarded: user.isOnboarded, createdAt: user.createdAt.toISOString() },
    accessToken,
    refreshToken,
  });
});

router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    return res.status(401).json({ error: 'INVALID_REFRESH', message: 'Refresh token invalide ou expiré' });
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { userId: string; type: string };
    if (decoded.type !== 'refresh') throw new Error('Wrong token type');

    // Rotation : on invalide l'ancien et on en émet un nouveau
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const newAccess = signAccessToken(decoded.userId);
    const newRefresh = signRefreshToken(decoded.userId);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: newRefresh, userId: decoded.userId, expiresAt } });

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ error: 'INVALID_REFRESH', message: 'Refresh token invalide' });
  }
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.refreshToken.deleteMany({ where: { userId: req.userId } });
  res.json({ message: 'Déconnecté' });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, isOnboarded: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ ...user, createdAt: user.createdAt.toISOString() });
});

// Marquer l'onboarding comme terminé
router.post('/complete-onboarding', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { isOnboarded: true },
    select: { id: true, name: true, email: true, isOnboarded: true, createdAt: true },
  });
  logger.security('ONBOARDING_COMPLETED', { userId: req.userId, ip: req.ip });
  res.json({ ...user, createdAt: user.createdAt.toISOString() });
});

// Modification du profil utilisateur (nom + email)
router.put('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, email } = req.body;

  const updates: any = {};
  if (name && typeof name === 'string' && name.trim().length >= 2) {
    updates.name = name.trim();
  }
  if (email && typeof email === 'string') {
    const emailNormalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) {
      return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Email invalide' });
    }
    // Vérifier que l'email n'est pas déjà pris par un autre utilisateur
    const existing = await prisma.user.findUnique({ where: { email: emailNormalized } });
    if (existing && existing.id !== req.userId) {
      return res.status(409).json({ error: 'EMAIL_TAKEN', message: 'Email déjà utilisé' });
    }
    updates.email = emailNormalized;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'NO_UPDATE', message: 'Aucune modification' });
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: updates,
    select: { id: true, name: true, email: true, createdAt: true },
  });

  logger.security('PROFILE_UPDATED', { userId: req.userId, ip: req.ip, updates: Object.keys(updates) });

  res.json({ ...user, createdAt: user.createdAt.toISOString() });
});

// RGPD article 20 - Portabilité des données
router.get('/export', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const data = {
    user: await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    preferences: await prisma.userPreference.findUnique({ where: { userId } }),
    healthGoals: await prisma.healthGoal.findMany({ where: { userId } }),
    nutritionLogs: await prisma.nutritionLog.findMany({ where: { userId } }),
    weightLogs: await prisma.weightLog.findMany({ where: { userId } }),
    weekPlans: await prisma.weekPlan.findMany({ where: { userId } }),
    aiConversations: await prisma.aiConversation.findMany({
      where: { userId },
      select: { role: true, content: true, createdAt: true },
    }),
    fridgeItems: await prisma.fridgeItem.findMany({ where: { userId } }),
    exportedAt: new Date().toISOString(),
  };
  res.setHeader('Content-Disposition', `attachment; filename="nutrisense-export-${userId}.json"`);
  res.json(data);
});

// RGPD article 17 - Droit à l'oubli
router.delete('/account', authMiddleware, async (req: AuthRequest, res: Response) => {
  // Grâce à onDelete: Cascade dans le schema Prisma, tout est purgé
  await prisma.user.delete({ where: { id: req.userId } });
  res.json({ message: 'Compte et données supprimés' });
});

// ==========================================
// GESTION DU MOT DE PASSE
// ==========================================

// POST /api/auth/change-password (utilisateur connecté)
router.post('/change-password', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Champs manquants' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'PASSWORD_TOO_SHORT', message: 'Le mot de passe doit faire au moins 8 caractères' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'NOT_FOUND', message: 'Utilisateur introuvable' });

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'INVALID_PASSWORD', message: 'Mot de passe actuel incorrect' });
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  // Invalider toutes les sessions existantes (sécurité)
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  res.json({ message: 'Mot de passe modifié avec succès' });
});

// POST /api/auth/forgot-password (envoie un code par email)
router.post('/forgot-password', authLimiter, async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'MISSING_EMAIL', message: 'Email requis' });

  // On répond toujours succès pour ne pas révéler si l'email existe (sécurité)
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.json({ message: 'Si cet email existe, un code a été envoyé' });
  }

  // Invalider les anciens tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  // Générer un code à 6 chiffres
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await prisma.passwordResetToken.create({
    data: { userId: user.id, code, expiresAt },
  });

  // Envoyer l'email (import dynamique pour ne pas planter si le module n'est pas installé)
  try {
    const { sendPasswordResetEmail } = await import('../services/email.service');
    await sendPasswordResetEmail(user.email, user.name, code);
  } catch (err: any) {
    console.error('Erreur envoi email:', err.message);
    // On ne fail pas la requête pour ne pas révéler l'erreur au client
  }

  res.json({ message: 'Si cet email existe, un code a été envoyé' });
});

// POST /api/auth/reset-password (avec le code reçu par email)
router.post('/reset-password', authLimiter, async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email, code et nouveau mot de passe requis' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'PASSWORD_TOO_SHORT', message: 'Le mot de passe doit faire au moins 8 caractères' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: 'INVALID_CODE', message: 'Code invalide ou expiré' });
  }

  const token = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!token) {
    return res.status(400).json({ error: 'INVALID_CODE', message: 'Code invalide ou expiré' });
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
    prisma.passwordResetToken.update({ where: { id: token.id }, data: { used: true } }),
    // Invalider aussi toutes les sessions existantes
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
  ]);

  res.json({ message: 'Mot de passe réinitialisé avec succès' });
});

// ==========================================
// SYSTÈME DE PARRAINAGE / INVITATION
// ==========================================

// GET /api/auth/referral - Récupérer son code de parrainage + stats
router.get('/referral', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { referralCode: true, name: true },
  });
  if (!user) return res.status(404).json({ error: 'NOT_FOUND' });

  // Compter combien de personnes ont été parrainées
  const invitedCount = await prisma.user.count({
    where: { invitedBy: req.userId },
  });

  res.json({
    referralCode: user.referralCode,
    referralName: user.name,
    invitedCount,
    inviteLink: `https://nutrisense.app/invite/${user.referralCode}`,
  });
});

// POST /api/auth/redeem-invite - Utiliser un code de parrainage (post-inscription)
router.post('/redeem-invite', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'INVALID_CODE' });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { invitedBy: true, referralCode: true },
  });

  if (currentUser?.invitedBy) {
    return res.status(400).json({ error: 'ALREADY_INVITED', message: 'Tu as déjà utilisé un code' });
  }

  if (currentUser?.referralCode === code) {
    return res.status(400).json({ error: 'CANNOT_INVITE_SELF', message: 'Tu ne peux pas te parrainer toi-même' });
  }

  const inviter = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true, name: true },
  });

  if (!inviter) {
    return res.status(404).json({ error: 'CODE_NOT_FOUND', message: 'Code invalide' });
  }

  await prisma.user.update({
    where: { id: req.userId },
    data: { invitedBy: inviter.id },
  });

  res.json({
    success: true,
    inviterName: inviter.name,
    message: `Tu as été parrainé par ${inviter.name} 🎉`,
  });
});

export default router;
