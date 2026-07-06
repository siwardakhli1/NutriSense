// ==========================================
// ROUTES - Nutrition (Prisma)
// ==========================================
import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { aiLimiter } from '../middlewares/rateLimit.middleware';
import { validate } from '../middlewares/validate.middleware';
import { photoAnalyzeSchema } from '../schemas';
import { fetchProduct, buildProductAdvice, findAlternatives } from '../services/openFoodFacts.service';

const router = Router();

router.get('/product/:barcode', authMiddleware, async (req: AuthRequest, res: Response) => {
  const barcode = req.params.barcode.replace(/\D/g, '');
  if (!barcode || barcode.length < 6) {
    return res.status(400).json({ error: 'INVALID_BARCODE', message: 'Code-barres invalide' });
  }

  const prefs = await prisma.userPreference.findUnique({
    where: { userId: req.userId! },
    select: { goal: true },
  });

  const product = await fetchProduct(barcode);
  const aiAdvice = buildProductAdvice(product, prefs?.goal || 'healthy');

  res.json({ ...product, aiAdvice });
});

// GET /nutrition/product/:barcode/alternatives - Trouver des alternatives plus saines
router.get('/product/:barcode/alternatives', authMiddleware, async (req: AuthRequest, res: Response) => {
  const barcode = req.params.barcode.replace(/\D/g, '');
  if (!barcode || barcode.length < 6) {
    return res.status(400).json({ error: 'INVALID_BARCODE', message: 'Code-barres invalide' });
  }

  const product = await fetchProduct(barcode);
  const alternatives = await findAlternatives(product);

  res.json({ alternatives });
});

router.post('/photo/analyze', authMiddleware, aiLimiter, validate(photoAnalyzeSchema), (req: AuthRequest, res: Response) => {
  const { description = '', imageBase64 = '' } = req.body;
  const text = String(description).toLowerCase();

  const detectedFoods: string[] = [];
  const foodKeywords: Record<string, string[]> = {
    pizza: ['pizza', 'fromage', 'sauce tomate'],
    salade: ['salade', 'tomates', 'concombre', 'feta'],
    pâtes: ['pâtes', 'sauce', 'parmesan'],
    burger: ['pain', 'steak', 'fromage', 'salade'],
    poulet: ['poulet', 'riz', 'légumes'],
    poisson: ['poisson', 'riz', 'brocolis'],
    curry: ['riz', 'poulet', 'lait de coco', 'épices'],
    sushi: ['riz', 'poisson', 'algue', 'wasabi'],
  };

  for (const [key, foods] of Object.entries(foodKeywords)) {
    if (text.includes(key)) { detectedFoods.push(...foods); break; }
  }
  if (!detectedFoods.length) detectedFoods.push('poulet', 'riz', 'légumes');

  const isPizza = detectedFoods.includes('pizza');
  const isSalade = detectedFoods.includes('salade');
  const calories = isPizza ? 780 : isSalade ? 390 : 560;

  res.json({
    detectedFoods,
    estimatedPortion: isPizza ? '2 parts moyennes' : '1 assiette standard',
    nutrition: {
      calories,
      protein: isPizza ? 28 : 35,
      carbs: isSalade ? 18 : 62,
      fat: isPizza ? 34 : 15,
      fiber: isSalade ? 6 : 5,
    },
    confidence: imageBase64 ? 0.88 : 0.72,
    aiAdvice: calories > 650
      ? 'Repas assez calorique. Ajoute des légumes et réduis les portions de féculents au prochain repas.'
      : "Repas équilibré. Pense à boire de l'eau et à compléter avec un fruit si besoin.",
    processingMode: imageBase64 ? 'vision-simulated' : 'text-based',
  });
});

// ==========================================
// LOG un repas comme mangé
// ==========================================
router.post('/log', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { source, label, mealType, calories, protein, carbs, fat, fiber, waterMl, loggedAt } = req.body;

  if (!label || typeof label !== 'string' || label.length < 2) {
    return res.status(400).json({ error: 'INVALID_LABEL' });
  }
  if (calories === undefined || calories < 0) {
    return res.status(400).json({ error: 'INVALID_CALORIES' });
  }

  const log = await prisma.nutritionLog.create({
    data: {
      id: randomUUID(),
      userId: req.userId!,
      source: source || 'recipe',
      label,
      mealType: mealType || 'other',
      calories: Math.round(Number(calories)),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      waterMl: Math.round(Number(waterMl) || 0),
      loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
    },
  });

  res.status(201).json({ success: true, log: { ...log, loggedAt: log.loggedAt.toISOString() } });
});

// ==========================================
// LISTE les repas mangés (historique)
// ==========================================
router.get('/logs', authMiddleware, async (req: AuthRequest, res: Response) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.nutritionLog.findMany({
    where: {
      userId: req.userId,
      loggedAt: { gte: since },
    },
    orderBy: { loggedAt: 'desc' },
    take: 500,
  });

  res.json({
    logs: logs.map((l) => ({ ...l, loggedAt: l.loggedAt.toISOString() })),
  });
});

// ==========================================
// SUPPRIMER un log (annuler "j'ai mangé")
// ==========================================
router.delete('/log/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.nutritionLog.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });

  await prisma.nutritionLog.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
