// ==========================================
// ROUTES - Admin (dashboard, utilisateurs, recettes)
// Toutes ces routes sont protégées : authMiddleware + adminMiddleware.
// ==========================================
import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();

// Toutes les routes admin exigent d'être connecté ET d'être admin.
router.use(authMiddleware, adminMiddleware);

/**
 * GET /api/admin/stats
 * Statistiques globales pour le dashboard admin.
 */
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  const [userCount, recipeCount, weekPlanCount, referralCount] = await Promise.all([
    prisma.user.count(),
    prisma.recipe.count(),
    prisma.weekPlan.count(),
    prisma.user.count({ where: { invitedBy: { not: null } } }),
  ]);

  // Nouveaux utilisateurs des 7 derniers jours
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newUsersThisWeek = await prisma.user.count({
    where: { createdAt: { gte: weekAgo } },
  });

  // Recettes premium
  const allRecipes = await prisma.recipe.findMany({ select: { tags: true } });
  const premiumCount = allRecipes.filter((r: any) =>
    ((r.tags as string[]) || []).includes('premium')
  ).length;

  // Nombre de récompenses premium débloquées (users avec 5+ filleuls)
  const PREMIUM_THRESHOLD = 5;
  const inviters = await prisma.user.groupBy({
    by: ['invitedBy'],
    where: { invitedBy: { not: null } },
    _count: { invitedBy: true },
  });
  const rewardsUnlocked = inviters.filter(
    (i: any) => (i._count?.invitedBy || 0) >= PREMIUM_THRESHOLD
  ).length;

  return res.json({
    userCount,
    newUsersThisWeek,
    recipeCount,
    premiumCount,
    weekPlanCount,
    referralCount,
    rewardsUnlocked,
  });
});

/**
 * GET /api/admin/users
 * Liste des utilisateurs avec leur nombre de filleuls.
 */
router.get('/users', async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      invitedBy: true,
      referralCode: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Compter les filleuls de chaque user + résoudre le nom du parrain
  const byCode: Record<string, string> = {}; // referralCode -> name (pour retrouver le parrain)
  const byId: Record<string, string> = {};
  for (const u of users) {
    byId[u.id] = u.name;
  }

  const invitedCounts: Record<string, number> = {};
  for (const u of users) {
    if (u.invitedBy) {
      invitedCounts[u.invitedBy] = (invitedCounts[u.invitedBy] || 0) + 1;
    }
  }

  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    invitedCount: invitedCounts[u.id] || 0,
    invitedByName: u.invitedBy ? byId[u.invitedBy] || null : null,
    createdAt: u.createdAt,
  }));

  return res.json({ users: result });
});

/**
 * GET /api/admin/recipes
 * Liste toutes les recettes (pour la gestion admin).
 */
router.get('/recipes', async (_req: AuthRequest, res: Response) => {
  const recipes = await prisma.recipe.findMany({
    orderBy: { name: 'asc' },
  });
  return res.json({ recipes });
});

/**
 * DELETE /api/admin/recipes/:id
 * Supprime une recette.
 */
router.delete('/recipes/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.recipe.delete({ where: { id } });
    return res.json({ success: true });
  } catch (e) {
    return res.status(404).json({ success: false, message: 'Recette introuvable' });
  }
});

export default router;
