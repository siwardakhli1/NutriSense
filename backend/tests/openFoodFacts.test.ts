// ==========================================
// TESTS - Service Open Food Facts
// Focus sur buildProductAdvice (fonction pure)
// ==========================================
import { buildProductAdvice } from '../src/services/openFoodFacts.service';

// Helper pour créer un produit de test rapidement
function makeProduct(overrides: any = {}) {
  return {
    barcode: '3017620422003',
    name: 'Produit Test',
    brand: 'Test Brand',
    nutriScore: 'C',
    novaScore: 2,
    ecoScore: 'C',
    ingredients: [],
    allergens: [],
    nutrition: {
      calories: 200,
      protein: 5,
      carbs: 30,
      fat: 5,
      fiber: 2,
      salt: 0.5,
      sugars: 10,
    },
    source: 'off',
    ...overrides,
  };
}

describe('buildProductAdvice', () => {
  it('renvoie un message d\'erreur si le produit est en fallback', () => {
    const product = makeProduct({ source: 'fallback' });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('introuvable');
  });

  it('alerte sur un Nutri-Score D', () => {
    const product = makeProduct({ nutriScore: 'D' });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('Nutri-Score D');
    expect(advice).toContain('à limiter');
  });

  it('alerte sur un Nutri-Score E', () => {
    const product = makeProduct({ nutriScore: 'E' });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('Nutri-Score E');
    expect(advice).toContain('à limiter');
  });

  it('félicite un Nutri-Score A', () => {
    const product = makeProduct({ nutriScore: 'A' });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('Nutri-Score A');
    expect(advice).toContain('bon choix');
  });

  it('félicite un Nutri-Score B', () => {
    const product = makeProduct({ nutriScore: 'B' });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('Nutri-Score B');
    expect(advice).toContain('bon choix');
  });

  it('alerte sur NOVA 4 (ultra-transformé)', () => {
    const product = makeProduct({ nutriScore: 'C', novaScore: 4 });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('Ultra-transformé');
    expect(advice).toContain('NOVA 4');
  });

  it('félicite NOVA 1 (aliment brut)', () => {
    const product = makeProduct({ nutriScore: 'C', novaScore: 1 });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('brut');
    expect(advice).toContain('NOVA 1');
  });

  it('alerte sur faible protéine pour objectif muscle', () => {
    const product = makeProduct({
      nutrition: {
        calories: 200, protein: 3, carbs: 30, fat: 5, fiber: 2, salt: 0.5, sugars: 10,
      },
    });
    const advice = buildProductAdvice(product, 'muscle');
    expect(advice).toContain('protéines');
  });

  it('ne signale pas les protéines si objectif healthy', () => {
    const product = makeProduct({
      nutrition: {
        calories: 200, protein: 3, carbs: 30, fat: 5, fiber: 2, salt: 0.5, sugars: 10,
      },
    });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).not.toContain('Faible en protéines');
  });

  it('alerte sur les sucres élevés pour objectif healthy', () => {
    const product = makeProduct({
      nutrition: {
        calories: 200, protein: 5, carbs: 30, fat: 5, fiber: 2, salt: 0.5, sugars: 25,
      },
    });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('Sucres élevés');
  });

  it('alerte sur densité calorique pour objectif budget', () => {
    const product = makeProduct({
      nutrition: {
        calories: 500, protein: 5, carbs: 30, fat: 30, fiber: 2, salt: 0.5, sugars: 10,
      },
    });
    const advice = buildProductAdvice(product, 'budget');
    expect(advice).toContain('Densité calorique');
  });

  it('alerte sur sel élevé (>1.5g/100g)', () => {
    const product = makeProduct({
      nutrition: {
        calories: 200, protein: 5, carbs: 30, fat: 5, fiber: 2, salt: 2, sugars: 10,
      },
    });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('Sel élevé');
  });

  it('ne signale pas le sel si en dessous du seuil', () => {
    const product = makeProduct({
      nutrition: {
        calories: 200, protein: 5, carbs: 30, fat: 5, fiber: 2, salt: 1, sugars: 10,
      },
    });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).not.toContain('Sel élevé');
  });

  it('combine plusieurs alertes', () => {
    const product = makeProduct({
      nutriScore: 'E',
      novaScore: 4,
      nutrition: {
        calories: 550, protein: 3, carbs: 60, fat: 30, fiber: 1, salt: 2, sugars: 30,
      },
    });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('Nutri-Score E');
    expect(advice).toContain('Ultra-transformé');
    expect(advice).toContain('Sucres élevés');
    expect(advice).toContain('Sel élevé');
  });

  it('renvoie un message neutre si aucune particularité', () => {
    const product = makeProduct({
      nutriScore: 'C',
      novaScore: 2,
      nutrition: {
        calories: 200, protein: 8, carbs: 30, fat: 5, fiber: 3, salt: 0.5, sugars: 5,
      },
    });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('sans particularité');
  });

  it('utilise l\'emoji ✅ pour les points positifs', () => {
    const product = makeProduct({ nutriScore: 'A' });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('✅');
  });

  it('utilise l\'emoji ⚠️ pour les alertes', () => {
    const product = makeProduct({ nutriScore: 'E' });
    const advice = buildProductAdvice(product, 'healthy');
    expect(advice).toContain('⚠️');
  });
});
