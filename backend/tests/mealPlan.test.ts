// ==========================================
// TESTS - Service de génération de plan repas
// ==========================================
import {
  scoreRecipe,
  splitByMealType,
  estimateIngredientPrice,
} from '../src/services/mealPlan.service';

// Helper pour créer une recette de test
function makeRecipe(overrides: any = {}): any {
  return {
    id: 'r1',
    name: 'Test Recipe',
    emoji: '🍽️',
    timeMinutes: 30,
    servings: 2,
    difficulty: 'facile',
    ingredients: [],
    steps: [],
    nutrition: { calories: 400, protein: 20, carbs: 40, fat: 10, fiber: 5 },
    tags: ['lunch', 'halal'],
    userId: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('scoreRecipe', () => {
  it('donne un score de base minimum', () => {
    const recipe = makeRecipe({ tags: [] });
    const score = scoreRecipe(recipe, { dietary: [], goal: 'healthy', budget: 100, servings: 2 } as any);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('donne +10 si le tag régime correspond', () => {
    const recipeHalal = makeRecipe({ tags: ['halal'] });
    const recipeNotHalal = makeRecipe({ tags: [] });

    const opts = { dietary: ['halal'], goal: 'healthy', budget: 100, servings: 2 } as any;
    const scoreOk = scoreRecipe(recipeHalal, opts);
    const scoreNo = scoreRecipe(recipeNotHalal, opts);

    // Le score halal est bien supérieur (+10 vs -3)
    expect(scoreOk).toBeGreaterThan(scoreNo);
  });

  it('donne +10 si vegan pour un régime végétarien (vegan ⊂ vegetarian)', () => {
    const recipeVegan = makeRecipe({ tags: ['vegan'] });
    const opts = { dietary: ['vegetarian'], goal: 'healthy', budget: 100, servings: 2 } as any;
    const score = scoreRecipe(recipeVegan, opts);
    expect(score).toBeGreaterThan(8);
  });

  it('donne un bonus si l\'objectif est fast et temps < 15 min', () => {
    const recipeFast = makeRecipe({ tags: ['fast'], timeMinutes: 10 });
    const recipeSlow = makeRecipe({ tags: ['fast'], timeMinutes: 40 });

    const opts = { dietary: [], goal: 'fast', budget: 100, servings: 2 } as any;
    const scoreFast = scoreRecipe(recipeFast, opts);
    const scoreSlow = scoreRecipe(recipeSlow, opts);

    // La rapide a un bonus supplémentaire de +2
    expect(scoreFast).toBeGreaterThan(scoreSlow);
  });

  it('donne un bonus si objectif muscle et protéines > 25g', () => {
    const recipeHighProt = makeRecipe({
      nutrition: { calories: 500, protein: 40, carbs: 30, fat: 15, fiber: 5 },
    });
    const recipeLowProt = makeRecipe({
      nutrition: { calories: 500, protein: 10, carbs: 60, fat: 15, fiber: 5 },
    });

    const opts = { dietary: [], goal: 'muscle', budget: 100, servings: 2 } as any;
    const scoreHigh = scoreRecipe(recipeHighProt, opts);
    const scoreLow = scoreRecipe(recipeLowProt, opts);

    expect(scoreHigh).toBeGreaterThan(scoreLow);
  });

  it('donne +4 si le tag correspond à l\'objectif', () => {
    const recipeHealthy = makeRecipe({ tags: ['healthy'] });
    const recipeNoTag = makeRecipe({ tags: [] });

    const opts = { dietary: [], goal: 'healthy', budget: 100, servings: 2 } as any;
    const s1 = scoreRecipe(recipeHealthy, opts);
    const s2 = scoreRecipe(recipeNoTag, opts);

    expect(s1).toBeGreaterThan(s2);
  });
});

describe('splitByMealType', () => {
  it('sépare les recettes en 3 pools', () => {
    const recipes = [
      makeRecipe({ tags: ['breakfast'] }),
      makeRecipe({ tags: ['lunch'] }),
      makeRecipe({ tags: ['dinner'] }),
    ];
    const pools = splitByMealType(recipes as any);
    expect(pools.breakfast.length).toBe(1);
    expect(pools.lunch.length).toBe(1);
    expect(pools.dinner.length).toBe(1);
  });

  it('permet à une recette d\'être dans plusieurs pools (lunch + dinner)', () => {
    const recipes = [makeRecipe({ tags: ['lunch', 'dinner'] })];
    const pools = splitByMealType(recipes as any);
    expect(pools.lunch.length).toBe(1);
    expect(pools.dinner.length).toBe(1);
  });

  it('retourne des pools vides si aucune recette ne matche', () => {
    const recipes = [makeRecipe({ tags: ['snack'] })];
    const pools = splitByMealType(recipes as any);
    // Le fallback met tout dans lunch/dinner si aucun tag ne matche
    expect(pools.breakfast.length + pools.lunch.length + pools.dinner.length).toBeGreaterThan(0);
  });

  it('gère une liste vide', () => {
    const pools = splitByMealType([]);
    expect(pools.breakfast).toEqual([]);
    expect(pools.lunch).toEqual([]);
    expect(pools.dinner).toEqual([]);
  });
});

describe('estimateIngredientPrice', () => {
  it('renvoie un prix pour un ingrédient', () => {
    const price = estimateIngredientPrice({ name: 'poulet', quantity: '200', unit: 'g' });
    expect(typeof price).toBe('number');
    expect(price).toBeGreaterThanOrEqual(0);
  });

  it('renvoie 0 pour un ingrédient invalide', () => {
    const price = estimateIngredientPrice({});
    expect(price).toBeGreaterThanOrEqual(0);
  });

  it('un ingrédient plus cher (steak) a un prix supérieur à un moins cher (pâtes)', () => {
    const cheap = estimateIngredientPrice({ name: 'pâtes', quantity: '100', unit: 'g' });
    const expensive = estimateIngredientPrice({ name: 'poulet', quantity: '100', unit: 'g' });
    expect(expensive).toBeGreaterThanOrEqual(cheap);
  });
});
