// ==========================================
// ROUTES - Assistant IA (Prisma)
// ==========================================
import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { aiLimiter } from '../middlewares/rateLimit.middleware';
import { validate } from '../middlewares/validate.middleware';
import { aiAdviceSchema } from '../schemas';
import { generateAdvice } from '../services/llm.service';
import { generateId } from '../utils/helpers';

const router = Router();

router.post('/advice', authMiddleware, aiLimiter, validate(aiAdviceSchema), async (req: AuthRequest, res: Response) => {
  const { message } = req.body;
  const userId = req.userId!;

  const [prefs, healthGoal] = await Promise.all([
    prisma.userPreference.findUnique({ where: { userId } }),
    prisma.healthGoal.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
  ]);

  const context = {
    goal: prefs?.goal,
    dietary: (prefs?.dietary as string[]) || [],
    budget: prefs?.budget,
    currentWeight: healthGoal?.weight,
    targetWeight: healthGoal?.targetWeight,
  };

  const result = await generateAdvice(message, context);

  // Persist historique
  await prisma.aiConversation.createMany({
    data: [
      { id: generateId(), userId, role: 'user', content: message, sources: [] },
      { id: generateId(), userId, role: 'assistant', content: result.answer, sources: result.sources },
    ],
  });

  res.json(result);
});

router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const rows = await prisma.aiConversation.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  res.json(
    rows.reverse().map((r: any) => ({
      id: r.id,
      role: r.role,
      content: r.content,
      sources: (r.sources as string[]) || [],
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.delete('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.aiConversation.deleteMany({ where: { userId: req.userId } });
  res.json({ message: 'Historique effacé' });
});

export default router;
