// ==========================================
// ROUTES - Mode Frigo (Prisma)
// ==========================================
import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { fridgeItemSchema } from '../schemas';
import { findRecipesForFridge, getPersonalizedRecommendations } from '../services/recommendation.service';
import { generateId } from '../utils/helpers';

const router = Router();

router.get('/items', authMiddleware, async (req: AuthRequest, res: Response) => {
  const items = await prisma.fridgeItem.findMany({
    where: { userId: req.userId },
    orderBy: { addedAt: 'desc' },
  });
  res.json(items.map((i: any) => ({
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    unit: i.unit,
    expiresAt: i.expiresAt,
    addedAt: i.addedAt.toISOString(),
  })));
});

router.post('/items', authMiddleware, validate(fridgeItemSchema), async (req: AuthRequest, res: Response) => {
  const { name, quantity = 1, unit = 'pièce', expiresAt } = req.body;
  const id = generateId();
  await prisma.fridgeItem.create({
    data: { id, userId: req.userId!, name, quantity, unit, expiresAt: expiresAt || null },
  });
  res.status(201).json({ id, name, quantity, unit, expiresAt });
});

router.delete('/items/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.fridgeItem.deleteMany({
    where: { id: req.params.id, userId: req.userId },
  });
  res.json({ message: 'Item supprimé' });
});

router.get('/suggestions', authMiddleware, async (req: AuthRequest, res: Response) => {
  const items = await prisma.fridgeItem.findMany({
    where: { userId: req.userId },
    select: { name: true },
  });

  if (!items.length) {
    return res.json({
      matches: [],
      message: "Frigo vide, ajoute quelques ingrédients pour avoir des suggestions",
    });
  }

  const minRatio = Number(req.query.minMatch) || 0.5;
  const matches = await findRecipesForFridge(items.map((i: any) => i.name), minRatio);
  res.json({ matches, itemsCount: items.length });
});

router.get('/recommendations', authMiddleware, async (req: AuthRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 5, 20);
  const recos = await getPersonalizedRecommendations(req.userId!, limit);
  res.json(recos);
});

export default router;
