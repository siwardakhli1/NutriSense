// ==========================================
// SERVICE - Recommandations & mode Frigo (v3 : synonymes + matching flou)
// ==========================================
import { prisma } from '../config/database';

export interface RecipeMatch {
  recipe: any;
  matchedIngredients: string[];
  missingIngredients: string[];
  matchScore: number;
}

// Dictionnaire de synonymes pour un matching intelligent
const SYNONYMS: Record<string, string[]> = {
  'pate': ['pâte', 'pates', 'pâtes', 'spaghetti', 'spaghettis', 'penne', 'tagliatelle', 'linguine', 'macaroni', 'fusilli'],
  'riz': ['basmati', 'complet', 'sushi', 'thaï', 'arborio'],
  'poulet': ['blanc de poulet', 'cuisse de poulet', 'escalope de poulet', 'poulet cuit'],
  'boeuf': ['bœuf', 'steak', 'entrecôte', 'faux-filet', 'haché'],
  'agneau': ['gigot', 'côtelette', 'agneau haché'],
  'tomate': ['tomates', 'tomate cerise', 'tomates cerises', 'tomates concassées'],
  'oignon': ['oignons', 'échalote', 'échalotes'],
  'ail': ['gousse ail'],
  'oeuf': ['œuf', 'œufs', 'oeufs'],
  'saumon': ['filet de saumon', 'saumon frais', 'saumon fumé'],
  'crevette': ['crevettes', 'gambas', 'gambas géantes'],
  'thon': ['thon en boîte', 'thon frais'],
  'fromage': ['gruyère', 'parmesan', 'feta', 'mozzarella', 'ricotta', 'cheddar', 'chèvre'],
  'lait': ['lait entier', 'lait demi-écrémé', 'lait végétal', 'lait de coco', 'lait amande'],
  'poivron': ['poivrons', 'poivron rouge', 'poivron jaune', 'poivron vert'],
  'courgette': ['courgettes'],
  'aubergine': ['aubergines', 'aubergines thai'],
  'carotte': ['carottes', 'carotte râpée'],
  'salade': ['salade verte', 'roquette', 'mâche', 'romaine', 'iceberg'],
  'legume': ['légume', 'légumes', 'légumes surgelés'],
  'epinard': ['épinards', 'épinard'],
  'champignon': ['champignons', 'champignons shiitake', 'champignons de Paris'],
  'chocolat': ['cacao', 'chocolat noir'],
  'lentille': ['lentilles', 'lentilles corail', 'lentilles vertes', 'lentilles jaunes'],
  'haricot': ['haricots rouges', 'haricots noirs', 'haricots blancs'],
  'poischiche': ['pois chiches', 'pois chiche'],
  'ble': ['blé', 'boulghour', 'semoule', 'couscous'],
};

/**
 * Normalise un nom d'ingrédient : lowercase, sans accents, sans "s" final,
 * mots-clés simples.
 */
function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/g, '')
    .replace(/s$/, '')
    .trim();
}

/**
 * Vérifie si deux ingrédients matchent (avec synonymes).
 */
function ingredientsMatch(fridgeItem: string, recipeIngredient: string): boolean {
  const f = normalizeIngredient(fridgeItem);
  const r = normalizeIngredient(recipeIngredient);

  // Match direct : l'un contient l'autre
  if (f === r || f.includes(r) || r.includes(f)) return true;

  // Match via synonymes : est-ce que les 2 mots pointent vers le même concept ?
  for (const [canonical, synonyms] of Object.entries(SYNONYMS)) {
    const allForms = [canonical, ...synonyms.map(normalizeIngredient)];
    const fMatches = allForms.some((form) => f.includes(form) || form.includes(f));
    const rMatches = allForms.some((form) => r.includes(form) || form.includes(r));
    if (fMatches && rMatches) return true;
  }

  return false;
}

export async function findRecipesForFridge(
  fridgeItems: string[],
  minMatchRatio = 0.2 // seuil abaissé
): Promise<RecipeMatch[]> {
  const recipes = await prisma.recipe.findMany();

  const matches: RecipeMatch[] = recipes.map((r: any) => {
    const ingredients = (r.ingredients as Array<{ name: string }>) || [];
    const matched: string[] = [];
    const missing: string[] = [];

    for (const ing of ingredients) {
      const isInFridge = fridgeItems.some((f) => ingredientsMatch(f, ing.name));
      if (isInFridge) matched.push(ing.name);
      else missing.push(ing.name);
    }

    const matchScore = ingredients.length ? matched.length / ingredients.length : 0;

    return {
      recipe: {
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
      },
      matchedIngredients: matched,
      missingIngredients: missing,
      matchScore,
    };
  });

  return matches
    .filter((m) => m.matchScore >= minMatchRatio && m.matchedIngredients.length > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 15);
}

export async function getPersonalizedRecommendations(userId: string, limit = 5): Promise<any[]> {
  const prefs = await prisma.userPreference.findUnique({ where: { userId } });
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { recipe: true },
  });

  const tagWeights: Record<string, number> = {};
  favorites.forEach((f: any) => {
    (f.recipe.tags as string[]).forEach((t) => {
      tagWeights[t] = (tagWeights[t] || 0) + 1;
    });
  });
  if (prefs?.goal) tagWeights[prefs.goal] = (tagWeights[prefs.goal] || 0) + 2;
  if (prefs?.dietary) {
    (prefs.dietary as string[]).forEach((d) => {
      tagWeights[d] = (tagWeights[d] || 0) + 3;
    });
  }

  const favoriteIds = new Set(favorites.map((f: any) => f.recipeId));
  const recipes = await prisma.recipe.findMany({
    where: { id: { notIn: [...favoriteIds] } },
  });

  const scored = (recipes as any[])
    .map((r: any) => {
      const tags = (r.tags as string[]) || [];
      const score = tags.reduce((s, t) => s + (tagWeights[t] || 0), 0);
      return {
        recipe: {
          id: r.id,
          name: r.name,
          emoji: r.emoji,
          time: r.timeMinutes,
          servings: r.servings,
          difficulty: r.difficulty,
          ingredients: r.ingredients,
          steps: r.steps,
          nutrition: r.nutrition,
          tags,
        },
        score,
      };
    })
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s: any) => s.recipe);
}
