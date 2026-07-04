// ==========================================
// ROUTES - Recettes + favoris + recettes personnelles (Prisma)
// ==========================================
import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { generateId } from '../utils/helpers';

const router = Router();

function mapRecipe(row: any) {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    time: row.timeMinutes,
    servings: row.servings,
    difficulty: row.difficulty,
    ingredients: row.ingredients,
    steps: row.steps,
    nutrition: row.nutrition,
    tags: row.tags,
    isCustom: !!row.userId, // pour l'UI : afficher "Ma recette"
  };
}

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { tag, q } = req.query;
  const where: any = {
    // Renvoie les recettes officielles (userId null) + les recettes de l'utilisateur
    OR: [{ userId: null }, { userId: req.userId }],
  };
  if (q) where.name = { contains: String(q), mode: 'insensitive' };

  let recipes = await prisma.recipe.findMany({ where });

  if (tag) {
    recipes = recipes.filter((r: any) => (r.tags as string[]).includes(String(tag)));
  }

  res.json(recipes.map((r: any) => mapRecipe(r)));
});

// ==========================================
// MES RECETTES PERSONNELLES
// ==========================================

// GET /recipes/mine - Liste mes recettes personnelles
router.get('/mine', authMiddleware, async (req: AuthRequest, res: Response) => {
  const recipes = await prisma.recipe.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(recipes.map((r: any) => mapRecipe(r)));
});

// GET /recipes/mine/export - Exporter mes recettes en JSON
router.get('/mine/export', authMiddleware, async (req: AuthRequest, res: Response) => {
  const recipes = await prisma.recipe.findMany({
    where: { userId: req.userId },
  });
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    recipes: recipes.map((r: any) => ({
      name: r.name,
      emoji: r.emoji,
      timeMinutes: r.timeMinutes,
      servings: r.servings,
      difficulty: r.difficulty,
      ingredients: r.ingredients,
      steps: r.steps,
      nutrition: r.nutrition,
      tags: r.tags,
    })),
  };
  res.setHeader('Content-Disposition', `attachment; filename="mes-recettes-nutrisense.json"`);
  res.json(exportData);
});

// POST /recipes/mine/import - Importer des recettes depuis un JSON
router.post('/mine/import', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { recipes } = req.body;
  if (!Array.isArray(recipes)) {
    return res.status(400).json({ error: 'INVALID_FORMAT', message: 'Format JSON invalide' });
  }

  let imported = 0;
  let failed = 0;
  for (const r of recipes) {
    try {
      if (!r.name || !r.ingredients || !r.steps) {
        failed++;
        continue;
      }
      await prisma.recipe.create({
        data: {
          id: generateId(),
          userId: req.userId!,
          name: r.name,
          emoji: r.emoji || '🍽️',
          timeMinutes: r.timeMinutes || 20,
          servings: r.servings || 2,
          difficulty: r.difficulty || 'facile',
          ingredients: r.ingredients,
          steps: r.steps,
          nutrition: r.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          tags: r.tags || [],
        },
      });
      imported++;
    } catch {
      failed++;
    }
  }
  res.json({ imported, failed, message: `${imported} recette(s) importée(s)` });
});

// POST /recipes/mine - Créer une recette perso
router.post('/mine', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, emoji, timeMinutes, servings, difficulty, ingredients, steps, nutrition, tags } = req.body;

  if (!name || !ingredients || !steps) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Nom, ingrédients et étapes sont requis' });
  }

  const recipe = await prisma.recipe.create({
    data: {
      id: generateId(),
      userId: req.userId!,
      name,
      emoji: emoji || '🍽️',
      timeMinutes: timeMinutes || 20,
      servings: servings || 2,
      difficulty: difficulty || 'facile',
      ingredients,
      steps,
      nutrition: nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      tags: tags || [],
    },
  });
  res.status(201).json(mapRecipe(recipe));
});

// PUT /recipes/mine/:id - Modifier une recette perso
router.put('/mine/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.recipe.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Recette introuvable' });
  }

  const updated = await prisma.recipe.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name || existing.name,
      emoji: req.body.emoji || existing.emoji,
      timeMinutes: req.body.timeMinutes || existing.timeMinutes,
      servings: req.body.servings || existing.servings,
      difficulty: req.body.difficulty || existing.difficulty,
      ingredients: req.body.ingredients || existing.ingredients,
      steps: req.body.steps || existing.steps,
      nutrition: req.body.nutrition || existing.nutrition,
      tags: req.body.tags || existing.tags,
    },
  });
  res.json(mapRecipe(updated));
});

// DELETE /recipes/mine/:id - Supprimer une recette perso
router.delete('/mine/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.recipe.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Recette introuvable' });
  }
  await prisma.recipe.delete({ where: { id: req.params.id } });
  res.json({ message: 'Recette supprimée' });
});

router.get('/favorites/list', authMiddleware, async (req: AuthRequest, res: Response) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.userId },
    include: { recipe: true },
  });
  res.json(favorites.map((f: any) => mapRecipe(f.recipe)));
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
  if (!recipe) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json(mapRecipe(recipe));
});

router.post('/:id/favorite', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.favorite.create({
      data: { userId: req.userId!, recipeId: req.params.id },
    });
  } catch {
    // Déjà en favori, on ignore silencieusement
  }
  res.json({ message: 'Ajouté aux favoris' });
});

router.delete('/:id/favorite', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.favorite.deleteMany({
    where: { userId: req.userId, recipeId: req.params.id },
  });
  res.json({ message: 'Retiré des favoris' });
});

export default router;
