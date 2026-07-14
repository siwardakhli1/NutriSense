// SERVICE - Génération de plan de repas hebdo
import { prisma } from '../config/database';
import { generateId } from '../utils/helpers';

interface GenerateOptions {
  userId: string;
  budget: number;
  goal: string;
  dietary: string[];
  servings: number;
}

interface Recipe {
  id: string;
  name: string;
  emoji: string | null;
  timeMinutes: number | null;
  servings: number | null;
  difficulty: string | null;
  ingredients: any;
  steps: any;
  nutrition: any;
  tags: any;
}

// Convertit une Date en 'YYYY-MM-DD' en heure LOCALE (jamais UTC),
// pour éviter tout décalage d'un jour dû au fuseau horaire.
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;
type MealType = typeof MEAL_TYPES[number];

// Composition d'un repas complet : quelles composantes (rôles) pour chaque type.
// Chaque rôle correspond à un tag présent sur les recettes du seed.
const MEAL_COMPOSITION: Record<MealType, string[]> = {
  breakfast: ['boisson', 'pdej_principal', 'fruit'],
  lunch: ['entree', 'plat', 'dessert'],
  dinner: ['plat', 'dessert'],
};

// Labels lisibles pour chaque rôle (affichés côté front).
const ROLE_LABELS: Record<string, string> = {
  boisson: 'Boisson',
  pdej_principal: 'Principal',
  fruit: 'Fruit',
  entree: 'Entrée',
  plat: 'Plat',
  dessert: 'Dessert',
};

/**
 * Score une recette selon les préférences user.
 */
export function scoreRecipe(recipe: Recipe, options: GenerateOptions): number {
  const tags = (recipe.tags as string[]) || [];
  let score = Math.random() * 2; // aléatoire pour varier d'une génération à l'autre

  for (const d of options.dietary) {
    if (tags.includes(d)) {
      score += 10;
    } else if (d === 'vegetarian' && tags.includes('vegan')) {
      score += 10;
    } else {
      if (d === 'vegan' && !tags.includes('vegan')) score -= 5;
      if (d === 'vegetarian' && !tags.includes('vegetarian') && !tags.includes('vegan')) score -= 5;
      if (d === 'halal' && !tags.includes('halal')) score -= 3;
      if (d === 'sans_gluten' && !tags.includes('sans_gluten')) score -= 3;
      if (d === 'sans_lactose' && !tags.includes('sans_lactose')) score -= 3;
      if (d === 'keto' && !tags.includes('keto')) score -= 2;
    }
  }

  if (tags.includes(options.goal)) score += 4;
  if (options.goal === 'fast' && (recipe.timeMinutes || 60) < 15) score += 2;
  if (options.goal === 'muscle' && (recipe.nutrition as any)?.protein > 25) score += 2;
  if (options.goal === 'budget' && tags.includes('budget')) score += 2;

  return score;
}

/**
 * Sépare les recettes en 3 pools : breakfast, lunch, dinner.
 * Une recette peut être dans plusieurs pools selon ses tags.
 */
export function splitByMealType(recipes: Recipe[]): Record<MealType, Recipe[]> {
  const pools: Record<MealType, Recipe[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
  };

  for (const r of recipes) {
    const tags = (r.tags as string[]) || [];
    if (tags.includes('breakfast')) pools.breakfast.push(r);
    if (tags.includes('lunch')) pools.lunch.push(r);
    if (tags.includes('dinner')) pools.dinner.push(r);
    // Fallback : si aucun tag de type, on met en lunch ET dinner
    if (!tags.includes('breakfast') && !tags.includes('lunch') && !tags.includes('dinner')) {
      pools.lunch.push(r);
      pools.dinner.push(r);
    }
  }

  return pools;
}

/**
 * Construit un repas COMPOSÉ (entrée/plat/dessert, etc.) selon sa composition.
 * Pour chaque rôle du repas, pioche la meilleure recette disponible qui porte
 * le tag de ce rôle. Garde la rétrocompatibilité en exposant aussi `recipe`
 * (= la composante principale : plat, ou pdej_principal, ou la 1ère dispo).
 */
/**
 * Adapte les quantités d'ingrédients d'une recette au nombre de personnes voulu.
 * facteur = targetServings / (servings de la recette).
 * Ex : recette pour 1 pers, on veut 2 pers → toutes les quantités ×2.
 */
function scaleIngredients(ingredients: any[], recipeServings: number, targetServings: number): any[] {
  const base = recipeServings && recipeServings > 0 ? recipeServings : 1;
  const factor = targetServings / base;
  return (ingredients || []).map((ing: any) => {
    const qtyNum = parseFloat(ing.quantity);
    if (isNaN(qtyNum)) return ing; // quantité non numérique → inchangée
    const scaled = qtyNum * factor;
    // Arrondi propre : entier si proche, sinon 1 décimale
    const rounded = Math.round(scaled * 10) / 10;
    return { ...ing, quantity: String(rounded % 1 === 0 ? Math.round(rounded) : rounded) };
  });
}

function buildComposedMeal(
  mealType: MealType,
  pool: Recipe[],
  usedRecipeIds: Set<string>,
  dayIdx: number,
  targetServings: number = 1
): any {
  const roles = MEAL_COMPOSITION[mealType];
  const components: any[] = [];

  for (const role of roles) {
    // Recettes du pool qui portent le tag de ce rôle
    const roleRecipes = pool.filter((r) => ((r.tags as string[]) || []).includes(role));

    // Si aucune recette pour ce rôle (régime très restrictif), on saute ce rôle
    if (roleRecipes.length === 0) continue;

    // Piocher la 1ère non utilisée, sinon rotation pour varier
    let pick = roleRecipes.find((r) => !usedRecipeIds.has(r.id));
    if (!pick) {
      pick = roleRecipes[dayIdx % roleRecipes.length];
    }
    usedRecipeIds.add(pick.id);

    components.push({
      role,
      roleLabel: ROLE_LABELS[role] || role,
      recipe: {
        id: pick.id,
        name: pick.name,
        emoji: pick.emoji,
        time: pick.timeMinutes,
        servings: targetServings,
        difficulty: pick.difficulty,
        ingredients: scaleIngredients(pick.ingredients as any[], pick.servings || 1, targetServings),
        steps: pick.steps,
        nutrition: pick.nutrition,
        tags: pick.tags,
      },
    });
  }

  // Filet de sécurité : si aucune composante trouvée (pool vide),
  // on retombe sur l'ancienne logique (1 recette du pool global).
  if (components.length === 0) {
    let pick = pool.find((r) => !usedRecipeIds.has(r.id)) || pool[dayIdx % Math.max(pool.length, 1)];
    if (pick) {
      usedRecipeIds.add(pick.id);
      components.push({
        role: 'plat',
        roleLabel: 'Plat',
        recipe: {
          id: pick.id, name: pick.name, emoji: pick.emoji, time: pick.timeMinutes,
          servings: targetServings, difficulty: pick.difficulty,
          ingredients: scaleIngredients(pick.ingredients as any[], pick.servings || 1, targetServings),
          steps: pick.steps, nutrition: pick.nutrition, tags: pick.tags,
        },
      });
    }
  }

  // Composante "principale" pour la rétrocompatibilité (ancien affichage lit meal.recipe)
  const mainComponent =
    components.find((c) => c.role === 'plat') ||
    components.find((c) => c.role === 'pdej_principal') ||
    components[0];

  // Nutrition totale du repas = somme des composantes
  const totalNutrition = components.reduce(
    (acc, c) => ({
      calories: acc.calories + (c.recipe.nutrition?.calories || 0),
      protein: acc.protein + (c.recipe.nutrition?.protein || 0),
      carbs: acc.carbs + (c.recipe.nutrition?.carbs || 0),
      fat: acc.fat + (c.recipe.nutrition?.fat || 0),
      fiber: acc.fiber + (c.recipe.nutrition?.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
  const totalTime = components.reduce((acc, c) => acc + (c.recipe.time || 0), 0);

  return {
    id: generateId(),
    type: mealType,
    components,             // NOUVEAU : les composantes (entrée/plat/dessert...)
    recipe: mainComponent ? mainComponent.recipe : null, // RÉTROCOMPAT : ancien champ
    totalNutrition,        // NOUVEAU : nutrition cumulée du repas
    totalTime,             // NOUVEAU : temps cumulé
  };
}

/**
 * Coût réel (€) d'un repas = somme du prix de tous les ingrédients
 * de toutes ses composantes (entrée + plat + dessert...).
 */
function computeMealCost(meal: any): number {
  const parts = (meal.components && meal.components.length > 0)
    ? meal.components.map((c: any) => c.recipe)
    : (meal.recipe ? [meal.recipe] : []);
  let cost = 0;
  for (const r of parts) {
    for (const ing of (r?.ingredients || [])) {
      cost += estimateIngredientPrice(ing);
    }
  }
  return Math.round(cost * 10) / 10;
}

/**
 * Coût réel (€) d'une journée = somme du coût de ses repas.
 */
function computeDayCost(meals: any[]): number {
  const total = meals.reduce((s, m) => s + computeMealCost(m), 0);
  return Math.round(total * 10) / 10;
}

export async function generateWeekPlan(options: GenerateOptions) {
  const allRecipesRaw = await prisma.recipe.findMany();
  // Palier récompense : les recettes premium ne sont incluses dans le plan
  // que si l'utilisateur a parrainé au moins 5 amis.
  const PREMIUM_THRESHOLD = 5;
  const invitedCount = await prisma.user.count({ where: { invitedBy: options.userId } });
  const premiumUnlocked = invitedCount >= PREMIUM_THRESHOLD;
  const allRecipes = premiumUnlocked
    ? allRecipesRaw
    : allRecipesRaw.filter((r: any) => !((r.tags as string[]) || []).includes('premium'));

  if (!allRecipes.length) {
    throw new Error("Aucune recette dans la base. Redémarre le backend pour lancer le seeding.");
  }

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  // Score toutes les recettes
  const scored = allRecipes.map((r) => ({
    recipe: r,
    score: scoreRecipe(r, options),
  }));

  // Séparer par type de repas et trier par score
  const pools = splitByMealType(allRecipes);
  const sortedPools: Record<MealType, Recipe[]> = {
    breakfast: [...pools.breakfast].sort((a, b) => {
      const sa = scored.find((s) => s.recipe.id === a.id)!.score;
      const sb = scored.find((s) => s.recipe.id === b.id)!.score;
      return sb - sa;
    }),
    lunch: [...pools.lunch].sort((a, b) => {
      const sa = scored.find((s) => s.recipe.id === a.id)!.score;
      const sb = scored.find((s) => s.recipe.id === b.id)!.score;
      return sb - sa;
    }),
    dinner: [...pools.dinner].sort((a, b) => {
      const sa = scored.find((s) => s.recipe.id === a.id)!.score;
      const sb = scored.find((s) => s.recipe.id === b.id)!.score;
      return sb - sa;
    }),
  };
  const usedRecipeIds = new Set<string>();
  const days: any[] = [];

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + dayIdx);

    const meals: any[] = [];
    for (const mealType of MEAL_TYPES) {
      const meal = buildComposedMeal(mealType, sortedPools[mealType], usedRecipeIds, dayIdx, options.servings || 1);
      meals.push(meal);
    }

    days.push({
      date: toLocalDateStr(currentDate),
      meals,
      cost: computeDayCost(meals),
      mealCosts: {
        breakfast: computeMealCost(meals.find((m) => m.type === 'breakfast')),
        lunch: computeMealCost(meals.find((m) => m.type === 'lunch')),
        dinner: computeMealCost(meals.find((m) => m.type === 'dinner')),
      },
    });
  }

  // Coût réel de la semaine = somme des coûts réels de chaque jour.
  const estimatedCost = Math.round(days.reduce((s: number, d: any) => s + (d.cost || 0), 0) * 10) / 10;

  const weekPlanId = generateId();
  // IMPORTANT : supprimer les anciens plans de l'utilisateur avant d'en créer un nouveau.
  // Sinon les plans s'accumulent en base et /meals/current peut en renvoyer un différent
  // à chaque appel (tri instable quand plusieurs plans ont un createdAt proche).
  // Les shopping lists liées sont supprimées en cascade (onDelete: Cascade dans le schema).
  await prisma.weekPlan.deleteMany({ where: { userId: options.userId } });
  await prisma.weekPlan.create({
    data: {
      id: weekPlanId,
      userId: options.userId,
      startDate: toLocalDateStr(startDate),
      endDate: toLocalDateStr(endDate),
      days,
      budget: options.budget,
      estimatedCost,
    },
  });

  return {
    id: weekPlanId,
    startDate: toLocalDateStr(startDate),
    endDate: toLocalDateStr(endDate),
    days,
    budget: options.budget,
    estimatedCost,
  };
}

/**
 * Génère la liste de courses à partir d'un plan repas.
 */
export async function regeneratePlanFromToday(options: GenerateOptions) {
  const existing = await prisma.weekPlan.findFirst({
    where: { userId: options.userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!existing) {
    return generateWeekPlan(options);
  }

  // Aujourd'hui en date LOCALE (cohérent avec les dates des jours du plan)
  const todayStr = toLocalDateStr(new Date());

  const existingDays = (existing.days as any[]) || [];
  const pastDays = existingDays.filter((d) => d.date < todayStr);
  const daysToRegen = existingDays.filter((d) => d.date >= todayStr);

  if (daysToRegen.length === 0) {
    return {
      id: existing.id,
      startDate: existing.startDate,
      endDate: existing.endDate,
      days: existingDays,
      budget: existing.budget,
      estimatedCost: existing.estimatedCost,
    };
  }

  const allRecipesRaw = await prisma.recipe.findMany();
  const PREMIUM_THRESHOLD = 5;
  const invitedCount = await prisma.user.count({ where: { invitedBy: options.userId } });
  const premiumUnlocked = invitedCount >= PREMIUM_THRESHOLD;
  const allRecipes = premiumUnlocked
    ? allRecipesRaw
    : allRecipesRaw.filter((r: any) => !((r.tags as string[]) || []).includes('premium'));
  if (!allRecipes.length) {
    throw new Error('Aucune recette dans la base.');
  }

  const scored = allRecipes.map((r) => ({
    recipe: r as Recipe,
    score: scoreRecipe(r as Recipe, options),
  }));

  const pools = splitByMealType(scored.map((s) => s.recipe));
  const sortByScore = (arr: Recipe[]) =>
    [...arr].sort(
      (a, b) =>
        scored.find((s) => s.recipe.id === b.id)!.score -
        scored.find((s) => s.recipe.id === a.id)!.score
    );
  const sortedPools = {
    breakfast: sortByScore(pools.breakfast),
    lunch: sortByScore(pools.lunch),
    dinner: sortByScore(pools.dinner),
  };

  const usedRecipeIds = new Set<string>();
  pastDays.forEach((d: any) =>
    d.meals?.forEach((m: any) => m?.recipe?.id && usedRecipeIds.add(m.recipe.id))
  );

  const regeneratedDays = daysToRegen.map((day: any, dayIdx: number) => {
    const meals: any[] = [];
    for (const mealType of MEAL_TYPES) {
      const meal = buildComposedMeal(mealType, sortedPools[mealType], usedRecipeIds, dayIdx, options.servings || 1);
      meals.push(meal);
    }
    return {
      date: day.date,
      meals,
      cost: computeDayCost(meals),
      mealCosts: {
        breakfast: computeMealCost(meals.find((m) => m.type === 'breakfast')),
        lunch: computeMealCost(meals.find((m) => m.type === 'lunch')),
        dinner: computeMealCost(meals.find((m) => m.type === 'dinner')),
      },
    };
  });

  const mergedDays = [...pastDays, ...regeneratedDays].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );

  const totalMeals = mergedDays.length * MEAL_TYPES.length;
  const avgMealCost =
    options.goal === 'budget' ? 2.5 : options.goal === 'muscle' ? 4.5 : 3.5;
  const estimatedCost =
    Math.round(totalMeals * avgMealCost * (options.servings / 2) * 10) / 10;

  await prisma.weekPlan.update({
    where: { id: existing.id },
    data: {
      days: mergedDays,
      budget: options.budget,
      estimatedCost,
    },
  });

  return {
    id: existing.id,
    startDate: existing.startDate,
    endDate: existing.endDate,
    days: mergedDays,
    budget: options.budget,
    estimatedCost,
  };
}

/**
 * Ré-échelonne le plan EXISTANT au nouveau nombre de personnes SANS changer les recettes.
 * On repart des recettes d'origine (base) pour récupérer les quantités de base,
 * puis on applique le nouveau facteur. Les noms de recettes restent identiques.
 */
export async function rescalePlanServings(userId: string, targetServings: number) {
  const existing = await prisma.weekPlan.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  if (!existing) return null;

  // Table des recettes de base (pour retrouver les quantités originales + servings d'origine)
  const allRecipes = await prisma.recipe.findMany();
  const byId: Record<string, any> = {};
  for (const r of allRecipes) byId[r.id] = r;

  const days = (existing.days as any[]) || [];

  const rescaledDays = days.map((day: any) => {
    const meals = (day.meals || []).map((meal: any) => {
      // Ré-échelonner chaque composante à partir de la recette de base
      const components = (meal.components || []).map((c: any) => {
        const base = byId[c.recipe?.id];
        if (!base) return c; // recette introuvable → on garde tel quel
        return {
          ...c,
          recipe: {
            ...c.recipe,
            servings: targetServings,
            ingredients: scaleIngredients(base.ingredients as any[], base.servings || 1, targetServings),
          },
        };
      });

      // Rétrocompat : meal.recipe (composante principale)
      let recipe = meal.recipe;
      if (recipe && byId[recipe.id]) {
        const base = byId[recipe.id];
        recipe = {
          ...recipe,
          servings: targetServings,
          ingredients: scaleIngredients(base.ingredients as any[], base.servings || 1, targetServings),
        };
      }

      const newMeal = { ...meal, components, recipe };
      return newMeal;
    });

    return {
      ...day,
      meals,
      cost: computeDayCost(meals),
      mealCosts: {
        breakfast: computeMealCost(meals.find((m: any) => m.type === 'breakfast')),
        lunch: computeMealCost(meals.find((m: any) => m.type === 'lunch')),
        dinner: computeMealCost(meals.find((m: any) => m.type === 'dinner')),
      },
    };
  });

  const estimatedCost = Math.round(rescaledDays.reduce((s: number, d: any) => s + (d.cost || 0), 0) * 10) / 10;

  await prisma.weekPlan.update({
    where: { id: existing.id },
    data: { days: rescaledDays, estimatedCost },
  });

  return {
    id: existing.id,
    startDate: existing.startDate,
    endDate: existing.endDate,
    days: rescaledDays,
    budget: existing.budget,
    estimatedCost,
  };
}

export async function generateShoppingList(userId: string, weekPlan: any) {
  const itemsByKey: Record<string, any> = {};

  for (const day of weekPlan.days) {
    for (const meal of day.meals) {
      // Inclure TOUTES les composantes (entrée + plat + dessert...), pas juste meal.recipe.
      const parts = (meal.components && meal.components.length > 0)
        ? meal.components.map((c: any) => c.recipe)
        : (meal.recipe ? [meal.recipe] : []);
      for (const r of parts) {
        const ingredients = (r?.ingredients || []) as any[];
        for (const ing of ingredients) {
          const key = `${ing.name}__${ing.unit}`;
          if (itemsByKey[key]) {
            const currentQty = parseFloat(itemsByKey[key].quantity) || 0;
            const addQty = parseFloat(ing.quantity) || 0;
            itemsByKey[key].quantity = String(currentQty + addQty);
          } else {
            itemsByKey[key] = {
              id: generateId(),
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              category: ing.category || 'autres',
              checked: false,
              estimatedPrice: estimateIngredientPrice(ing),
            };
          }
        }
      }
    }
  }

  const items = Object.values(itemsByKey);
  const shoppingListId = generateId();
  const estimatedTotal = items.reduce((s: number, i: any) => s + (i.estimatedPrice || 0), 0);

  await prisma.shoppingList.create({
    data: {
      id: shoppingListId,
      userId,
      weekPlanId: weekPlan.id,
      items,
    },
  });

  return {
    id: shoppingListId,
    weekPlanId: weekPlan.id,
    items,
    estimatedTotal: Math.round(estimatedTotal * 10) / 10,
  };
}

/**
 * Prix indicatifs français (€) par ingrédient.
 * Référence : prix moyen supermarché français, ramené à l'unité de base
 * (au kg pour les solides, au litre pour les liquides, à la pièce pour le reste).
 * Utilisé pour estimer le coût réel d'une recette selon les quantités.
 */
// Poids moyen (kg) d'une pièce pour les fruits/légumes vendus au kg
// mais comptés en pièces dans les recettes.
const PIECE_WEIGHTS: Record<string, number> = {
  'banane': 0.12, 'pomme': 0.15, 'pommes': 0.15, 'orange': 0.15, 'oranges': 0.15,
  'kiwi': 0.08, 'courgettes': 0.2, 'carottes': 0.12, 'tomates': 0.12,
  'brocolis': 0.3, 'aubergine': 0.3, 'poivrons': 0.15, 'oignon': 0.11, 'potiron': 1,
};

const INGREDIENT_PRICES: Record<string, { price: number; base: 'kg' | 'l' | 'piece' }> = {
  // Protéines
  'agneau': { price: 16, base: 'kg' },
  'agneau haché': { price: 15, base: 'kg' },
  'blanc de poulet': { price: 12, base: 'kg' },
  'cuisses de poulet': { price: 4, base: 'kg' },
  'pavé de saumon': { price: 30, base: 'kg' },
  'crevettes': { price: 18, base: 'kg' },
  'oeufs': { price: 0.35, base: 'piece' },
  'œufs': { price: 0.35, base: 'piece' },
  'pois chiches': { price: 3, base: 'kg' },
  'feta': { price: 13, base: 'kg' },
  // Féculents
  'semoule': { price: 2, base: 'kg' },
  'semoule fine': { price: 2, base: 'kg' },
  'riz': { price: 2, base: 'kg' },
  'riz basmati': { price: 3, base: 'kg' },
  'riz complet': { price: 3, base: 'kg' },
  'spaghetti': { price: 1.5, base: 'kg' },
  'nouilles': { price: 3, base: 'kg' },
  'farine': { price: 1, base: 'kg' },
  'pain de campagne': { price: 0.4, base: 'piece' },
  'flocons d\'avoine': { price: 2.5, base: 'kg' },
  'granola': { price: 8, base: 'kg' },
  // Fruits & légumes
  'tomates': { price: 4.2, base: 'kg' },
  'courgettes': { price: 2.5, base: 'kg' },
  'carottes': { price: 1.5, base: 'kg' },
  'poivrons': { price: 4, base: 'kg' },
  'aubergine': { price: 3, base: 'kg' },
  'potiron': { price: 2, base: 'kg' },
  'oignon': { price: 1.5, base: 'kg' },
  'ail': { price: 8, base: 'kg' },
  'concombre': { price: 1, base: 'piece' },
  'brocolis': { price: 3, base: 'kg' },
  'epinards': { price: 4, base: 'kg' },
  'épinards': { price: 4, base: 'kg' },
  'champignons de paris': { price: 5, base: 'kg' },
  'roquette': { price: 12, base: 'kg' },
  'avocat': { price: 1.5, base: 'piece' },
  'banane': { price: 1, base: 'kg' },
  'pomme': { price: 2.8, base: 'kg' },
  'pommes': { price: 2.8, base: 'kg' },
  'orange': { price: 2.5, base: 'kg' },
  'oranges': { price: 2.5, base: 'kg' },
  'kiwi': { price: 4, base: 'kg' },
  'fraises': { price: 6, base: 'kg' },
  'raisin': { price: 4, base: 'kg' },
  'citron': { price: 0.4, base: 'piece' },
  'citron confit': { price: 8, base: 'kg' },
  'menthe fraîche': { price: 1, base: 'piece' },
  'basilic': { price: 1.5, base: 'piece' },
  'persil': { price: 1, base: 'piece' },
  'gingembre': { price: 10, base: 'kg' },
  'olives noires': { price: 8, base: 'kg' },
  'olives vertes': { price: 8, base: 'kg' },
  'pâte de dattes': { price: 6, base: 'kg' },
  // Produits laitiers
  'lait demi-écrémé': { price: 1, base: 'l' },
  'lait végétal': { price: 2, base: 'l' },
  'crème végétale': { price: 3, base: 'l' },
  'yaourt grec': { price: 4, base: 'kg' },
  'yaourt nature': { price: 2, base: 'kg' },
  'fromage blanc': { price: 3, base: 'kg' },
  'fromage râpé': { price: 10, base: 'kg' },
  'beurre': { price: 8, base: 'kg' },
  // Épicerie
  'huile d\'olive': { price: 8, base: 'l' },
  'miel': { price: 12, base: 'kg' },
  'sucre': { price: 1, base: 'kg' },
  'cannelle': { price: 40, base: 'kg' },
  'curry': { price: 30, base: 'kg' },
  'ras el-hanout': { price: 40, base: 'kg' },
  'sauce soja': { price: 5, base: 'l' },
  'tahini': { price: 10, base: 'kg' },
  'lait de coco': { price: 3, base: 'l' },
  'chocolat noir': { price: 12, base: 'kg' },
  'amandes': { price: 20, base: 'kg' },
  'noix': { price: 18, base: 'kg' },
  'café moulu': { price: 15, base: 'kg' },
  'thé vert': { price: 30, base: 'kg' },
  'levure chimique': { price: 0.2, base: 'piece' },
  'eau': { price: 0, base: 'l' },
};

/**
 * Estime le prix réel (€) d'un ingrédient selon sa quantité et l'unité,
 * à partir des prix français indicatifs ci-dessus.
 */
export function estimateIngredientPrice(ing: any): number {
  const name = (ing.name || '').trim().toLowerCase();
  const entry = INGREDIENT_PRICES[name];
  const qty = parseFloat(ing.quantity) || 1;
  const unit = (ing.unit || '').toLowerCase();

  // Ingrédient inconnu : petit prix forfaitaire prudent
  if (!entry) return 0.5;

  let cost = 0;
  if (entry.base === 'kg') {
    // prix au kg → convertir la quantité en kg
    let kg = qty / 1000;                       // g par défaut
    if (unit === 'kg') kg = qty;
    else if (unit === 'g') kg = qty / 1000;
    else if (unit === 'c.à.s') kg = qty * 0.015;   // 1 c.à.s ≈ 15g
    else if (unit === 'c.à.c') kg = qty * 0.005;   // 1 c.à.c ≈ 5g
    else if (unit === 'pincée' || unit === 'pincee') kg = 0.001;
    else if (unit === 'sachet') kg = 0.011;        // sachet levure ≈ 11g
    else if (unit === 'bouquet') kg = 0.03;        // bouquet herbes ≈ 30g
    else if (unit === 'gousses' || unit === 'gousse') kg = qty * 0.005;
    else if (unit === 'feuilles') kg = qty * 0.001;
    else if (unit === 'pièces' || unit === 'pièce') {
      // fruit/légume vendu au kg mais compté en pièces → convertir par poids moyen
      kg = qty * (PIECE_WEIGHTS[name] || 0.15);
    }
    else kg = qty * 0.05;                          // autres unités → ~50g
    cost = entry.price * kg;
  } else if (entry.base === 'l') {
    let l = qty / 1000;                        // ml par défaut
    if (unit === 'l') l = qty;
    else if (unit === 'ml') l = qty / 1000;
    else if (unit === 'c.à.s') l = qty * 0.015;
    else if (unit === 'c.à.c') l = qty * 0.005;
    else l = 0.05;
    cost = entry.price * l;
  } else {
    // prix à la pièce
    cost = entry.price * qty;
  }

  // Arrondi à 10 centimes, minimum 0,10€ pour un ingrédient réel
  return Math.max(Math.round(cost * 10) / 10, 0.1);
}
