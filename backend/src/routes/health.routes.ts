// ==========================================
// ROUTES - Objectifs santé (Prisma)
// ==========================================
import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { healthGoalSchema } from '../schemas';
import { generateId } from '../utils/helpers';

const router = Router();

function computeDailyCaloriesTarget(
  weight: number, height: number, activityLevel: string, targetWeight: number
): number {
  // BMR Mifflin-St Jeor (hypothèse âge 30, homme)
  const bmr = 10 * weight + 6.25 * height - 5 * 30 + 5;
  const factors: Record<string, number> = { low: 1.2, medium: 1.55, high: 1.725 };
  const tdee = bmr * (factors[activityLevel] || 1.55);
  const delta = targetWeight > weight ? 300 : targetWeight < weight ? -400 : 0;
  return Math.round(tdee + delta);
}

router.post('/', authMiddleware, validate(healthGoalSchema), async (req: AuthRequest, res: Response) => {
  const { weight, targetWeight, height, activityLevel = 'medium' } = req.body;
  const dailyCaloriesTarget = computeDailyCaloriesTarget(weight, height, activityLevel, targetWeight);

  const goal = await prisma.healthGoal.create({
    data: {
      id: generateId(), userId: req.userId!,
      weight, targetWeight, height, activityLevel,
      dailyCaloriesTarget, dailyWaterTarget: 2000,
    },
  });

  // Log de la pesée initiale
  await prisma.weightLog.create({
    data: { id: generateId(), userId: req.userId!, weight },
  });

  res.status(201).json({
    ...goal,
    createdAt: goal.createdAt.toISOString(),
  });
});

router.get('/latest', authMiddleware, async (req: AuthRequest, res: Response) => {
  const goal = await prisma.healthGoal.findFirst({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  if (!goal) return res.json(null);
  res.json({ ...goal, createdAt: goal.createdAt.toISOString() });
});

export default router;
