// ==========================================
// TESTS - mealPlan.service (fonctions pures)
// Complète mealPlan.test.ts pour améliorer la couverture (C2.2.2).
// ==========================================

// Mock de la config database pour éviter d'initialiser un vrai client Prisma.
jest.mock('../src/config/database', () => ({
  prisma: {},
}));

import {
  scaleIngredients,
  computeMealCost,
  computeDayCost,
  toLocalDateStr,
  estimateIngredientPrice,
  scoreRecipe,
  splitByMealType,
} from '../src/services/mealPlan.service';

// Fabrique une recette minimale pour les tests
function makeRecipe(overrides: any = {}): any {
  return {
    id: overrides.id || 'r1',
    name: overrides.name || 'Test',
    emoji: '🍽️',
    timeMinutes: overrides.timeMinutes ?? 30,
    servings: overrides.servings ?? 1,
    difficulty: 'easy',
    ingredients: overrides.ingredients || [],
    steps: [],
    nutrition: overrides.nutrition || { calories: 400, protein: 20, carbs: 40, fat: 10, fiber: 5 },
    tags: overrides.tags || [],
  };
}

describe('toLocalDateStr', () => {
  it('formate une date en YYYY-MM-DD', () => {
    expect(toLocalDateStr(new Date(2026, 6, 15))).toBe('2026-07-15');
  });
  it('ajoute un zéro devant les mois et jours < 10', () => {
    expect(toLocalDateStr(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  it('gère le dernier jour de l\'année', () => {
    expect(toLocalDateStr(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('scaleIngredients', () => {
  const base = [
    { name: 'Avoine', quantity: '60', unit: 'g' },
    { name: 'Banane', quantity: '1', unit: 'pièce' },
  ];
  it('ne change rien si portions identiques', () => {
    const r = scaleIngredients(base, 1, 1);
    expect(r[0].quantity).toBe('60');
    expect(r[1].quantity).toBe('1');
  });
  it('double de 1 à 2 personnes', () => {
    const r = scaleIngredients(base, 1, 2);
    expect(r[0].quantity).toBe('120');
    expect(r[1].quantity).toBe('2');
  });
  it('quadruple de 1 à 4 personnes', () => {
    const r = scaleIngredients(base, 1, 4);
    expect(r[0].quantity).toBe('240');
    expect(r[1].quantity).toBe('4');
  });
  it('adapte de 2 à 4 personnes', () => {
    const r = scaleIngredients([{ name: 'Riz', quantity: '200', unit: 'g' }], 2, 4);
    expect(r[0].quantity).toBe('400');
  });
  it('gère les décimales', () => {
    const r = scaleIngredients([{ name: 'Huile', quantity: '1.5', unit: 'c' }], 1, 2);
    expect(r[0].quantity).toBe('3');
  });
  it('laisse inchangée une quantité non numérique', () => {
    const r = scaleIngredients([{ name: 'Sel', quantity: 'au goût', unit: '' }], 1, 4);
    expect(r[0].quantity).toBe('au goût');
  });
  it('gère une liste vide', () => {
    expect(scaleIngredients([], 1, 2)).toEqual([]);
  });
  it('utilise 1 comme base si recipeServings = 0', () => {
    const r = scaleIngredients([{ name: 'Farine', quantity: '100', unit: 'g' }], 0, 2);
    expect(r[0].quantity).toBe('200');
  });
  it('préserve name et unit', () => {
    const r = scaleIngredients([{ name: 'Lait', quantity: '250', unit: 'ml' }], 1, 2);
    expect(r[0].name).toBe('Lait');
    expect(r[0].unit).toBe('ml');
  });
});

describe('computeMealCost', () => {
  it('calcule le coût avec composantes', () => {
    const meal = {
      components: [
        { recipe: { ingredients: [{ name: 'Pâtes', quantity: '100', unit: 'g' }] } },
        { recipe: { ingredients: [{ name: 'Tomate', quantity: '2', unit: 'pièce' }] } },
      ],
    };
    expect(computeMealCost(meal)).toBeGreaterThan(0);
  });
  it('calcule le coût d\'un repas simple', () => {
    expect(computeMealCost({ recipe: { ingredients: [{ name: 'Riz', quantity: '150', unit: 'g' }] } })).toBeGreaterThan(0);
  });
  it('renvoie 0 sans ingrédients', () => {
    expect(computeMealCost({ components: [] })).toBe(0);
    expect(computeMealCost({ recipe: { ingredients: [] } })).toBe(0);
  });
  it('arrondit à 1 décimale', () => {
    const cost = computeMealCost({ recipe: { ingredients: [{ name: 'Pain', quantity: '100', unit: 'g' }] } });
    expect(cost).toBe(Math.round(cost * 10) / 10);
  });
});

describe('computeDayCost', () => {
  it('additionne plusieurs repas', () => {
    const meals = [
      { recipe: { ingredients: [{ name: 'Pâtes', quantity: '100', unit: 'g' }] } },
      { recipe: { ingredients: [{ name: 'Riz', quantity: '100', unit: 'g' }] } },
    ];
    expect(computeDayCost(meals)).toBeGreaterThan(0);
  });
  it('renvoie 0 sans repas', () => {
    expect(computeDayCost([])).toBe(0);
  });
});

describe('estimateIngredientPrice', () => {
  it('le prix augmente avec la quantité', () => {
    const p1 = estimateIngredientPrice({ name: 'blanc de poulet', quantity: '100', unit: 'g' });
    const p2 = estimateIngredientPrice({ name: 'blanc de poulet', quantity: '500', unit: 'g' });
    expect(p2).toBeGreaterThan(p1);
  });
});

describe('scoreRecipe (cas supplémentaires)', () => {
  it('donne un score de base pour une recette neutre', () => {
    const score = scoreRecipe(makeRecipe(), { goal: 'healthy', budget: 60, dietary: [], servings: 2 } as any);
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('favorise une recette rapide quand objectif = fast', () => {
    const rapide = scoreRecipe(makeRecipe({ timeMinutes: 10 }), { goal: 'fast', budget: 60, dietary: [], servings: 2 } as any);
    const lente = scoreRecipe(makeRecipe({ timeMinutes: 60 }), { goal: 'fast', budget: 60, dietary: [], servings: 2 } as any);
    expect(rapide).toBeGreaterThan(lente);
  });

  it('favorise une recette riche en protéines quand objectif = muscle', () => {
    const proteinee = scoreRecipe(
      makeRecipe({ nutrition: { calories: 400, protein: 40, carbs: 30, fat: 10, fiber: 5 } }),
      { goal: 'muscle', budget: 60, dietary: [], servings: 2 } as any
    );
    const faible = scoreRecipe(
      makeRecipe({ nutrition: { calories: 400, protein: 10, carbs: 30, fat: 10, fiber: 5 } }),
      { goal: 'muscle', budget: 60, dietary: [], servings: 2 } as any
    );
    expect(proteinee).toBeGreaterThan(faible);
  });

  it('bonus si le tag régime correspond', () => {
    const vegan = scoreRecipe(makeRecipe({ tags: ['vegan'] }), { goal: 'healthy', budget: 60, dietary: ['vegan'], servings: 2 } as any);
    const nonVegan = scoreRecipe(makeRecipe({ tags: [] }), { goal: 'healthy', budget: 60, dietary: ['vegan'], servings: 2 } as any);
    expect(vegan).toBeGreaterThan(nonVegan);
  });
});

describe('splitByMealType (cas supplémentaires)', () => {
  it('classe une recette petit-déjeuner dans breakfast', () => {
    const pools = splitByMealType([makeRecipe({ tags: ['breakfast'] })]);
    expect(pools.breakfast.length).toBeGreaterThanOrEqual(1);
  });

  it('gère une liste vide sans crash', () => {
    const pools = splitByMealType([]);
    expect(pools.breakfast).toEqual([]);
    expect(pools.lunch).toEqual([]);
    expect(pools.dinner).toEqual([]);
  });

  it('renvoie toujours les 3 pools', () => {
    const pools = splitByMealType([makeRecipe({ tags: ['lunch'] })]);
    expect(pools).toHaveProperty('breakfast');
    expect(pools).toHaveProperty('lunch');
    expect(pools).toHaveProperty('dinner');
  });
});
