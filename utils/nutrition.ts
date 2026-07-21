// ==========================================
// UTILS - Calcul nutritionnel à partir des ingrédients
// Fonctions pures, testables sans dépendance React/Expo.
//
// Principe : une table de référence donne les valeurs
// nutritionnelles pour 100 g (ou 100 ml) des ingrédients
// courants. On convertit chaque ingrédient selon sa quantité
// puis on additionne, et on divise par le nombre de portions.
// ==========================================

export interface IngredientInput {
  name: string;
  quantity: string | number;
  unit: string;
}

export interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// Valeurs pour 100 g (ou 100 ml) — sources : tables nutritionnelles usuelles (CIQUAL / USDA).
// Clé = mot-clé normalisé recherché dans le nom de l'ingrédient.
const FOOD_TABLE: Record<string, NutritionValues> = {
  // Viandes & poissons
  poulet: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  dinde: { calories: 135, protein: 29, carbs: 0, fat: 1.7, fiber: 0 },
  boeuf: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
  'boeuf haché': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
  porc: { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0 },
  jambon: { calories: 145, protein: 21, carbs: 1, fat: 6, fiber: 0 },
  saumon: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  thon: { calories: 132, protein: 28, carbs: 0, fat: 1, fiber: 0 },
  crevettes: { calories: 99, protein: 24, carbs: 0, fat: 0.3, fiber: 0 },
  poisson: { calories: 140, protein: 20, carbs: 0, fat: 6, fiber: 0 },
  oeuf: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  oeufs: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },

  // Féculents
  riz: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  pates: { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.2 },
  pâtes: { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.2 },
  semoule: { calories: 360, protein: 12, carbs: 73, fat: 1, fiber: 3 },
  quinoa: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8 },
  pomme_de_terre: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
  'pomme de terre': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
  pommes_de_terre: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
  pain: { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  farine: { calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
  lentilles: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 },
  'pois chiches': { calories: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 8 },
  haricots: { calories: 127, protein: 9, carbs: 23, fat: 0.5, fiber: 6 },

  // Légumes
  tomate: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  tomates: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  carotte: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  carottes: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  courgette: { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 },
  courgettes: { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 },
  brocoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  brocolis: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  epinards: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  épinards: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  salade: { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 },
  oignon: { calories: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7 },
  oignons: { calories: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7 },
  ail: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
  poivron: { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  poivrons: { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  champignons: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
  concombre: { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  aubergine: { calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3 },

  // Produits laitiers
  lait: { calories: 47, protein: 3.4, carbs: 4.8, fat: 1.6, fiber: 0 },
  fromage: { calories: 350, protein: 25, carbs: 1.3, fat: 28, fiber: 0 },
  'crème fraîche': { calories: 292, protein: 2.4, carbs: 3, fat: 30, fiber: 0 },
  creme: { calories: 292, protein: 2.4, carbs: 3, fat: 30, fiber: 0 },
  yaourt: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
  beurre: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
  mozzarella: { calories: 280, protein: 28, carbs: 3.1, fat: 17, fiber: 0 },
  parmesan: { calories: 431, protein: 38, carbs: 4, fat: 29, fiber: 0 },

  // Matières grasses & divers
  'huile': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  'huile d\'olive': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  sucre: { calories: 400, protein: 0, carbs: 100, fat: 0, fiber: 0 },
  miel: { calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0 },
  chocolat: { calories: 546, protein: 4.9, carbs: 61, fat: 31, fiber: 7 },

  // Fruits
  banane: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  pomme: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  fraises: { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 },
  orange: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
  avocat: { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
  citron: { calories: 29, protein: 1.1, carbs: 9, fat: 0.3, fiber: 2.8 },

  // Noix
  amandes: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12 },
  noix: { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 7 },
};

// Convertit une quantité + unité en grammes (approximation).
function toGrams(quantity: number, unit: string): number {
  const u = unit.toLowerCase().trim();
  if (u === 'g' || u === 'ml') return quantity; // 1 ml ≈ 1 g pour la plupart des aliments
  if (u === 'kg' || u === 'l') return quantity * 1000;
  if (u === 'cl') return quantity * 10;
  if (u.startsWith('c.à.s') || u.startsWith('cuillère à soupe') || u === 'càs') return quantity * 15;
  if (u.startsWith('c.à.c') || u.startsWith('cuillère à café') || u === 'càc') return quantity * 5;
  if (u.includes('pièce') || u.includes('unité') || u.includes('piece')) return quantity * 100; // approximation
  // Par défaut : on considère la quantité comme des grammes
  return quantity;
}

// Normalise un nom pour la recherche dans la table.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .trim();
}

// Cherche les valeurs nutritionnelles d'un ingrédient dans la table.
function findFood(name: string): NutritionValues | null {
  const n = normalize(name);
  // Recherche exacte d'abord
  for (const key of Object.keys(FOOD_TABLE)) {
    if (normalize(key) === n) return FOOD_TABLE[key];
  }
  // Recherche partielle (le nom contient le mot-clé)
  for (const key of Object.keys(FOOD_TABLE)) {
    if (n.includes(normalize(key))) return FOOD_TABLE[key];
  }
  return null;
}

/**
 * Calcule les valeurs nutritionnelles totales d'une recette à partir
 * de ses ingrédients, puis les ramène à UNE portion.
 *
 * Retourne aussi le nombre d'ingrédients reconnus, pour informer
 * l'utilisateur de la fiabilité de l'estimation.
 */
export function computeNutritionFromIngredients(
  ingredients: IngredientInput[],
  servings = 1
): { nutrition: NutritionValues; matched: number; total: number } {
  const totals: NutritionValues = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  let matched = 0;

  for (const ing of ingredients) {
    if (!ing.name || !ing.name.trim()) continue;
    const food = findFood(ing.name);
    if (!food) continue;

    matched++;
    const qty = Number(String(ing.quantity).replace(',', '.')) || 0;
    const grams = toGrams(qty, ing.unit || 'g');
    const factor = grams / 100; // les valeurs de la table sont pour 100 g

    totals.calories += food.calories * factor;
    totals.protein += food.protein * factor;
    totals.carbs += food.carbs * factor;
    totals.fat += food.fat * factor;
    totals.fiber += food.fiber * factor;
  }

  const s = servings > 0 ? servings : 1;
  const nutrition: NutritionValues = {
    calories: Math.round(totals.calories / s),
    protein: Math.round(totals.protein / s),
    carbs: Math.round(totals.carbs / s),
    fat: Math.round(totals.fat / s),
    fiber: Math.round(totals.fiber / s),
  };

  return { nutrition, matched, total: ingredients.filter((i) => i.name && i.name.trim()).length };
}
