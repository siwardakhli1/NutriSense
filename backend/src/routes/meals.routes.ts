// ==========================================
// ROUTES - Meal plans (génération + récupération)
// ==========================================
import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { generateWeekPlan, generateShoppingList } from '../services/mealPlan.service';

const router = Router();

const generateSchema = z.object({
  budget: z.number().positive().max(1000).optional(),
  goal: z.enum(['healthy', 'fast', 'budget', 'muscle']).optional(),
  dietary: z.array(z.string()).optional(),
  servings: z.number().positive().max(20).optional(),
});

/**
 * POST /api/meals/generate
 * Génère un nouveau plan repas hebdo + liste de courses.
 */
router.post('/generate', authMiddleware, validate(generateSchema), async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  // Récupère les préférences user (les valeurs du body override)
  const prefs = await prisma.userPreference.findUnique({ where: { userId } });

  const options = {
    userId,
    budget: req.body.budget ?? prefs?.budget ?? 60,
    goal: req.body.goal ?? prefs?.goal ?? 'healthy',
    dietary: req.body.dietary ?? (prefs?.dietary as string[]) ?? [],
    servings: req.body.servings ?? prefs?.servings ?? 2,
  };

  try {
    const weekPlan = await generateWeekPlan(options);
    const shoppingList = await generateShoppingList(userId, weekPlan);

    // On renvoie aussi les recettes uniques utilisées
    const recipeIds = new Set<string>();
    weekPlan.days.forEach((d: any) => d.meals.forEach((m: any) => recipeIds.add(m.recipe.id)));
    const recipes = await prisma.recipe.findMany({ where: { id: { in: [...recipeIds] } } });

    res.json({
      weekPlan,
      shoppingList,
      recipes: recipes.map((r: any) => ({
        id: r.id,
        name: r.name,
        emoji: r.emoji,
        time: r.timeMinutes,
        servings: r.servings,
        difficulty: r.difficulty,
        ingredients: r.ingredients,
        steps: r.steps,
        nutrition: r.nutrition,
        tags: r.tags,
      })),
    });
  } catch (err: any) {
    res.status(400).json({ error: 'GENERATION_FAILED', message: err.message });
  }
});

/**
 * GET /api/meals/current
 * Renvoie le plan repas + liste de courses courants (dernier généré).
 */
router.get('/current', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const weekPlan = await prisma.weekPlan.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { shoppingLists: { take: 1, orderBy: { createdAt: 'desc' } } },
  });

  if (!weekPlan) {
    return res.json({ weekPlan: null, shoppingList: null, recipes: [] });
  }

  const shoppingList = weekPlan.shoppingLists[0] || null;

  // Recettes utilisées dans le plan
  const days = weekPlan.days as any[];
  const recipeIds = new Set<string>();
  days.forEach((d) => d.meals.forEach((m: any) => recipeIds.add(m.recipe.id)));
  const recipes = await prisma.recipe.findMany({ where: { id: { in: [...recipeIds] } } });

  res.json({
    weekPlan: {
      id: weekPlan.id,
      startDate: weekPlan.startDate,
      endDate: weekPlan.endDate,
      days: weekPlan.days,
      budget: weekPlan.budget,
      estimatedCost: weekPlan.estimatedCost,
    },
    shoppingList: shoppingList ? {
      id: shoppingList.id,
      weekPlanId: shoppingList.weekPlanId,
      items: shoppingList.items,
    } : null,
    recipes: recipes.map((r: any) => ({
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      time: r.timeMinutes,
      servings: r.servings,
      difficulty: r.difficulty,
      ingredients: r.ingredients,
      steps: r.steps,
      nutrition: r.nutrition,
      tags: r.tags,
    })),
  });
});

export default router;
