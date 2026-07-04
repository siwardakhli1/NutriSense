// ==========================================
// ROUTES - Logs nutritionnels et poids (Prisma)
// ==========================================
import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { nutritionLogSchema, weightLogSchema } from '../schemas';
import { generateId } from '../utils/helpers';

const router = Router();

router.post('/nutrition', authMiddleware, validate(nutritionLogSchema), async (req: AuthRequest, res: Response) => {
  const {
    source, label, mealType = 'other',
    calories, protein = 0, carbs = 0, fat = 0, fiber = 0, waterMl = 0,
  } = req.body;

  const log = await prisma.nutritionLog.create({
    data: {
      id: generateId(),
      userId: req.userId!,
      source, label, mealType,
      calories, protein, carbs, fat, fiber, waterMl,
    },
  });

  res.status(201).json({
    ...log,
    loggedAt: log.loggedAt.toISOString(),
  });
});

router.get('/nutrition', authMiddleware, async (req: AuthRequest, res: Response) => {
  const days = Math.min(Number(req.query.days) || 7, 90);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await prisma.nutritionLog.findMany({
    where: { userId: req.userId, loggedAt: { gte: since } },
    orderBy: { loggedAt: 'desc' },
  });
  res.json(rows.map((r: any) => ({ ...r, loggedAt: r.loggedAt.toISOString() })));
});

router.delete('/nutrition/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.nutritionLog.deleteMany({
    where: { id: req.params.id, userId: req.userId },
  });
  res.json({ message: 'Log supprimé' });
});

router.post('/weight', authMiddleware, validate(weightLogSchema), async (req: AuthRequest, res: Response) => {
  const { weight } = req.body;
  const log = await prisma.weightLog.create({
    data: { id: generateId(), userId: req.userId!, weight },
  });
  res.status(201).json({ id: log.id, weight, loggedAt: log.loggedAt.toISOString() });
});

router.post('/water', authMiddleware, async (req: AuthRequest, res: Response) => {
  const amount = Number(req.body.amount);
  if (!amount || amount < 0 || amount > 5000) {
    return res.status(400).json({ error: 'INVALID_AMOUNT', message: 'Quantité invalide (0-5000 ml)' });
  }
  const log = await prisma.nutritionLog.create({
    data: {
      id: generateId(), userId: req.userId!,
      source: 'manual', label: 'Eau', mealType: 'other',
      calories: 0, waterMl: amount,
    },
  });
  res.status(201).json({ id: log.id, waterMl: amount, loggedAt: log.loggedAt.toISOString() });
});

export default router;
