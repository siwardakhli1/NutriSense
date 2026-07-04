// ==========================================
// ROUTES - Préférences utilisateur (Prisma)
// ==========================================
import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { preferencesSchema } from '../schemas';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const prefs = await prisma.userPreference.findUnique({
    where: { userId: req.userId! },
  });
  if (!prefs) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({
    budget: prefs.budget,
    goal: prefs.goal,
    dietary: prefs.dietary,
    servings: prefs.servings,
    locale: prefs.locale,
    theme: prefs.theme,
    notificationsEnabled: prefs.notificationsEnabled,
  });
});

router.put('/', authMiddleware, validate(preferencesSchema), async (req: AuthRequest, res: Response) => {
  const updated = await prisma.userPreference.update({
    where: { userId: req.userId! },
    data: {
      ...(req.body.budget != null && { budget: req.body.budget }),
      ...(req.body.goal && { goal: req.body.goal }),
      ...(req.body.dietary && { dietary: req.body.dietary }),
      ...(req.body.servings != null && { servings: req.body.servings }),
      ...(req.body.locale && { locale: req.body.locale }),
      ...(req.body.theme && { theme: req.body.theme }),
      ...(req.body.notificationsEnabled != null && { notificationsEnabled: req.body.notificationsEnabled }),
    },
  });
  res.json({ message: 'Préférences mises à jour', preferences: updated });
});

export default router;
