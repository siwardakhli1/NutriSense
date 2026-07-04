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

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;
type MealType = typeof MEAL_TYPES[number];

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

export async function generateWeekPlan(options: GenerateOptions) {
  const allRecipes = await prisma.recipe.findMany();

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
      // Chercher la 1ère recette non utilisée du pool
      let pick = sortedPools[mealType].find((r) => !usedRecipeIds.has(r.id));

      // Si tout le pool est épuisé (cas rare : peu de recettes pour ce régime),
      // on réinitialise en autorisant les répétitions pour ce type de repas.
      if (!pick) {
        console.warn(`[MealPlan] Pool ${mealType} épuisé, autorisation des répétitions.`);
        pick = sortedPools[mealType][dayIdx % sortedPools[mealType].length];
      }

      usedRecipeIds.add(pick.id);

      meals.push({
        id: generateId(),
        type: mealType,
        recipe: {
          id: pick.id,
          name: pick.name,
          emoji: pick.emoji,
          time: pick.timeMinutes,
          servings: pick.servings,
          difficulty: pick.difficulty,
          ingredients: pick.ingredients,
          steps: pick.steps,
          nutrition: pick.nutrition,
          tags: pick.tags,
        },
      });
    }

    days.push({
      date: currentDate.toISOString().split('T')[0],
      meals,
    });
  }

  const totalMeals = 21;
  const avgMealCost = options.goal === 'budget' ? 2.5 : options.goal === 'muscle' ? 4.5 : 3.5;
  const estimatedCost = Math.round(totalMeals * avgMealCost * (options.servings / 2) * 10) / 10;

  const weekPlanId = generateId();
  await prisma.weekPlan.create({
    data: {
      id: weekPlanId,
      userId: options.userId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      days,
      budget: options.budget,
      estimatedCost,
    },
  });

  return {
    id: weekPlanId,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    days,
    budget: options.budget,
    estimatedCost,
  };
}

/**
 * Génère la liste de courses à partir d'un plan repas.
 */
export async function generateShoppingList(userId: string, weekPlan: any) {
  const itemsByKey: Record<string, any> = {};

  for (const day of weekPlan.days) {
    for (const meal of day.meals) {
      const ingredients = meal.recipe.ingredients as any[];
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

export function estimateIngredientPrice(ing: any): number {
  const priceMap: Record<string, number> = {
    fruits_legumes: 2, feculents: 1.5, proteines: 4,
    produits_laitiers: 2.5, epicerie: 1, autres: 2,
  };
  const category = ing.category || 'autres';
  const basePrice = priceMap[category] || 2;
  const qty = parseFloat(ing.quantity) || 1;
  const unit = (ing.unit || '').toLowerCase();

  let multiplier = 1;
  if (unit === 'g' || unit === 'ml') multiplier = qty / 200;
  else if (unit === 'kg' || unit === 'l') multiplier = qty * 5;
  else multiplier = qty * 0.5;

  return Math.round(basePrice * Math.max(multiplier, 0.5) * 10) / 10;
}
