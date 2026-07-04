// ==========================================
// ROUTES - Liste de courses (toggle items, get)
// ==========================================
import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

/**
 * GET /api/shopping/current
 * Dernière liste de courses générée.
 */
router.get('/current', authMiddleware, async (req: AuthRequest, res: Response) => {
  const list = await prisma.shoppingList.findFirst({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  if (!list) return res.json(null);

  res.json({
    id: list.id,
    weekPlanId: list.weekPlanId,
    items: list.items,
    createdAt: list.createdAt.toISOString(),
  });
});

/**
 * PATCH /api/shopping/:listId/items/:itemId/toggle
 * Coche/décoche un item de la liste.
 */
router.patch('/:listId/items/:itemId/toggle', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { listId, itemId } = req.params;

  const list = await prisma.shoppingList.findFirst({
    where: { id: listId, userId: req.userId },
  });
  if (!list) return res.status(404).json({ error: 'NOT_FOUND' });

  const items = (list.items as any[]).map((it) =>
    it.id === itemId ? { ...it, checked: !it.checked } : it
  );

  await prisma.shoppingList.update({
    where: { id: listId },
    data: { items },
  });

  res.json({ items });
});

export default router;
