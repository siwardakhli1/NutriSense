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
router.get('/dashboard', authMiddleware, async (req: AuthRequest, res: Response) => {
  const dashboard = await buildDashboard(req.userId!);
  res.json(dashboard);
});

/**
 * @swagger
 * /api/analytics/daily:
 *   get:
 *     summary: Stats journalières agrégées
 */
router.get('/daily', authMiddleware, async (req: AuthRequest, res: Response) => {
  const days = Math.min(Number(req.query.days) || 7, 90);
  const stats = await getDailyStats(req.userId!, days);
  res.json(stats);
});

/**
 * @swagger
 * /api/analytics/weight:
 *   get:
 *     summary: Courbe de poids
 */
router.get('/weight', authMiddleware, async (req: AuthRequest, res: Response) => {
  const days = Math.min(Number(req.query.days) || 90, 365);
  const history = await getWeightHistory(req.userId!, days);
  res.json(history);
});

export default router;
