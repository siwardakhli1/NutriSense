// ==========================================
// SERVICE - Intégration réelle Open Food Facts (Prisma)
// ==========================================
import { prisma } from '../config/database';
import { env } from '../config/env';

export interface ProductData {
  barcode: string;
  name: string;
  brand: string;
  nutriScore: 'A' | 'B' | 'C' | 'D' | 'E' | 'unknown';
  novaScore: 1 | 2 | 3 | 4 | 0;
  ecoScore: string;
  ingredients: string[];
  allergens: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    salt?: number;
    sugars?: number;
  };
  imageUrl?: string;
  categoryTags?: string[]; // pour trouver des alternatives
  source: 'off' | 'cache' | 'fallback';
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function fetchProduct(barcode: string): Promise<ProductData> {
  // 1. Cache local
  const cached = await prisma.productCache.findUnique({ where: { barcode } });
  if (cached) {
    const age = Date.now() - cached.cachedAt.getTime();
    if (age < CACHE_TTL_MS) {
      return { ...(cached.payload as any), source: 'cache' as const };
    }
  }

  // 2. Appel réel Open Food Facts
  try {
    const url = `${env.OFF_BASE_URL}/product/${barcode}?fields=product_name,brands,nutriscore_grade,nova_group,ecoscore_grade,ingredients_text,allergens_tags,nutriments,image_front_url,categories_tags`;
    const response = await fetch(url, {
      headers: { 'User-Agent': env.OFF_USER_AGENT },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) throw new Error(`OFF API status ${response.status}`);
    const json: any = await response.json();

    if (json.status !== 1 || !json.product) return fallbackProduct(barcode);

    const p = json.product;
    const nutriments = p.nutriments || {};

    const product: ProductData = {
      barcode,
      name: p.product_name || 'Produit sans nom',
      brand: p.brands || 'Marque inconnue',
      nutriScore: (p.nutriscore_grade?.toUpperCase() || 'unknown') as ProductData['nutriScore'],
      novaScore: (p.nova_group || 0) as ProductData['novaScore'],
      ecoScore: p.ecoscore_grade?.toUpperCase() || 'unknown',
      ingredients: (p.ingredients_text || '')
        .split(/[,;]/).map((s: string) => s.trim()).filter(Boolean).slice(0, 20),
      allergens: (p.allergens_tags || []).map((a: string) => a.replace('en:', '')).filter(Boolean),
      nutrition: {
        calories: Math.round(nutriments['energy-kcal_100g'] || 0),
        protein: Number(nutriments['proteins_100g'] || 0),
        carbs: Number(nutriments['carbohydrates_100g'] || 0),
        fat: Number(nutriments['fat_100g'] || 0),
        fiber: Number(nutriments['fiber_100g'] || 0),
        salt: Number(nutriments['salt_100g'] || 0),
        sugars: Number(nutriments['sugars_100g'] || 0),
      },
      imageUrl: p.image_front_url,
      categoryTags: (p.categories_tags || []).slice(0, 5),
      source: 'off',
    };

    // Cache Prisma upsert
    await prisma.productCache.upsert({
      where: { barcode },
      create: { barcode, payload: product as any, cachedAt: new Date() },
      update: { payload: product as any, cachedAt: new Date() },
    });

    return product;
  } catch (err) {
    console.warn(`[OFF] Fallback pour ${barcode}:`, (err as Error).message);
    return fallbackProduct(barcode);
  }
}

function fallbackProduct(barcode: string): ProductData {
  return {
    barcode,
    name: 'Produit non référencé',
    brand: 'Inconnu',
    nutriScore: 'unknown',
    novaScore: 0,
    ecoScore: 'unknown',
    ingredients: [],
    allergens: [],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    source: 'fallback',
  };
}

export function buildProductAdvice(product: ProductData, goal: string): string {
  if (product.source === 'fallback') {
    return "Produit introuvable dans la base Open Food Facts. Impossible de fournir une analyse fiable.";
  }

  const alerts: string[] = [];
  const positives: string[] = [];

  if (['D', 'E'].includes(product.nutriScore)) alerts.push(`Nutri-Score ${product.nutriScore} : à limiter`);
  else if (['A', 'B'].includes(product.nutriScore)) positives.push(`Nutri-Score ${product.nutriScore} : bon choix nutritionnel`);

  if (product.novaScore === 4) alerts.push('Ultra-transformé (NOVA 4) : à consommer avec modération');
  else if (product.novaScore === 1) positives.push('Aliment brut ou peu transformé (NOVA 1)');

  const n = product.nutrition;
  if (goal === 'muscle' && n.protein < 8) alerts.push('Faible en protéines pour un objectif prise de masse');
  if (goal === 'healthy' && n.sugars && n.sugars > 15) alerts.push(`Sucres élevés (${n.sugars}g/100g)`);
  if (goal === 'budget' && n.calories > 400) alerts.push('Densité calorique élevée');
  if (n.salt && n.salt > 1.5) alerts.push(`Sel élevé (${n.salt}g/100g)`);

  const parts: string[] = [];
  if (positives.length) parts.push('✅ ' + positives.join(' • '));
  if (alerts.length) parts.push('⚠️ ' + alerts.join(' • '));
  if (!parts.length) parts.push('Produit sans particularité notable pour votre profil.');

  return parts.join('\n');
}

// ==========================================
// COMPARATEUR : Trouver des alternatives plus saines
// ==========================================

export interface AlternativeProduct {
  barcode: string;
  name: string;
  brand: string;
  nutriScore: string;
  imageUrl?: string;
  improvementReason: string; // ex: "Nutri-Score B au lieu de E"
}

/**
 * Cherche 3 alternatives plus saines dans OFF pour un produit donné.
 * Utilise la catégorie principale et filtre par Nutri-Score meilleur.
 */
export async function findAlternatives(product: ProductData): Promise<AlternativeProduct[]> {
  // Pas d'alternatives possibles sans catégorie ou avec un déjà bon score
  if (!product.categoryTags?.length) return [];
  if (['A', 'B'].includes(product.nutriScore)) return [];

  // Catégories acceptables pour chercher : meilleur score que le produit actuel
  const scoreOrder = ['A', 'B', 'C', 'D', 'E'];
  const currentIdx = scoreOrder.indexOf(product.nutriScore);
  const betterScores = currentIdx > 0 ? scoreOrder.slice(0, currentIdx).join(',').toLowerCase() : 'a,b';

  // Prendre la catégorie la plus spécifique (souvent la dernière)
  const category = product.categoryTags[product.categoryTags.length - 1]?.replace('en:', '');
  if (!category) return [];

  try {
    const url = `https://world.openfoodfacts.org/api/v2/search?` +
      `categories_tags=${encodeURIComponent(category)}` +
      `&nutriscore_grade=${betterScores}` +
      `&sort_by=popularity_key` +
      `&page_size=8` +
      `&fields=code,product_name,brands,nutriscore_grade,image_front_small_url`;

    const response = await fetch(url, {
      headers: { 'User-Agent': env.OFF_USER_AGENT },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) return [];
    const json: any = await response.json();

    const alternatives: AlternativeProduct[] = (json.products || [])
      .filter((p: any) => p.code && p.code !== product.barcode && p.product_name && p.nutriscore_grade)
      .slice(0, 3)
      .map((p: any) => ({
        barcode: p.code,
        name: p.product_name,
        brand: p.brands || 'Marque inconnue',
        nutriScore: p.nutriscore_grade.toUpperCase(),
        imageUrl: p.image_front_small_url,
        improvementReason: `Nutri-Score ${p.nutriscore_grade.toUpperCase()} au lieu de ${product.nutriScore}`,
      }));

    return alternatives;
  } catch (err) {
    console.warn('[Alternatives] Erreur recherche:', (err as Error).message);
    return [];
  }
}
