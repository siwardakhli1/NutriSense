// ==========================================
// ROUTES - Analytics utilisateur (dashboard, insights, progression)
// ==========================================
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { buildDashboard, getDailyStats, getWeightHistory } from '../services/analytics.service';

const router = Router();

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Dashboard complet avec stats, insights, progression
 */
router.get('/dashboard', authMiddleware, (req: AuthRequest, res: Response) => {
  const dashboard = buildDashboard(req.userId!);
  res.json(dashboard);
});

/**
 * @swagger
 * /api/analytics/daily:
 *   get:
 *     summary: Stats journalières agrégées
 */
router.get('/daily', authMiddleware, (req: AuthRequest, res: Response) => {
  const days = Math.min(Number(req.query.days) || 7, 90);
  const stats = getDailyStats(req.userId!, days);
  res.json(stats);
});

/**
 * @swagger
 * /api/analytics/weight:
 *   get:
 *     summary: Courbe de poids
 */
router.get('/weight', authMiddleware, (req: AuthRequest, res: Response) => {
  const days = Math.min(Number(req.query.days) || 90, 365);
  res.json(getWeightHistory(req.userId!, days));
});

export default router;
