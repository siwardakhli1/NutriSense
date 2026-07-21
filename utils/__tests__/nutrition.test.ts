// ==========================================
// Tests unitaires — calcul nutritionnel à partir des ingrédients
// ==========================================
import { computeNutritionFromIngredients } from '../nutrition';

describe('computeNutritionFromIngredients', () => {
  it('calcule la nutrition pour un ingrédient simple (100g de poulet)', () => {
    const { nutrition, matched, total } = computeNutritionFromIngredients(
      [{ name: 'Poulet', quantity: '100', unit: 'g' }],
      1
    );
    expect(matched).toBe(1);
    expect(total).toBe(1);
    // Poulet : 165 kcal / 31g protéines pour 100g
    expect(nutrition.calories).toBe(165);
    expect(nutrition.protein).toBe(31);
  });

  it('additionne plusieurs ingrédients et divise par les portions', () => {
    const { nutrition, matched } = computeNutritionFromIngredients(
      [
        { name: 'Blanc de poulet', quantity: '200', unit: 'g' },
        { name: 'Riz', quantity: '150', unit: 'g' },
        { name: "Huile d'olive", quantity: '10', unit: 'g' },
      ],
      2
    );
    expect(matched).toBe(3);
    // Valeurs attendues (calculées) : ~307 kcal, 33g prot par portion
    expect(nutrition.calories).toBeGreaterThan(250);
    expect(nutrition.calories).toBeLessThan(350);
    expect(nutrition.protein).toBeGreaterThan(25);
  });

  it('gère la conversion kg vers grammes', () => {
    const { nutrition } = computeNutritionFromIngredients(
      [{ name: 'Riz', quantity: '1', unit: 'kg' }],
      1
    );
    // 1 kg de riz = 10x les valeurs de 100g (130 kcal → 1300)
    expect(nutrition.calories).toBe(1300);
  });

  it('ignore les ingrédients non reconnus (matched < total)', () => {
    const { matched, total } = computeNutritionFromIngredients(
      [
        { name: 'Poulet', quantity: '100', unit: 'g' },
        { name: 'IngrédientInconnuXYZ', quantity: '100', unit: 'g' },
      ],
      1
    );
    expect(total).toBe(2);
    expect(matched).toBe(1);
  });

  it('renvoie 0 partout si aucun ingrédient reconnu', () => {
    const { nutrition, matched } = computeNutritionFromIngredients(
      [{ name: 'Truc inexistant', quantity: '100', unit: 'g' }],
      1
    );
    expect(matched).toBe(0);
    expect(nutrition.calories).toBe(0);
    expect(nutrition.protein).toBe(0);
  });

  it('gère une liste vide', () => {
    const { nutrition, matched, total } = computeNutritionFromIngredients([], 1);
    expect(matched).toBe(0);
    expect(total).toBe(0);
    expect(nutrition.calories).toBe(0);
  });

  it('est insensible aux accents et à la casse', () => {
    const { matched } = computeNutritionFromIngredients(
      [{ name: 'ÉPINARDS', quantity: '100', unit: 'g' }],
      1
    );
    expect(matched).toBe(1);
  });

  it('gère un nombre de portions par défaut (1) si non fourni', () => {
    const { nutrition } = computeNutritionFromIngredients([
      { name: 'Poulet', quantity: '100', unit: 'g' },
    ]);
    expect(nutrition.calories).toBe(165);
  });

  it('divise correctement par un nombre de portions supérieur à 1', () => {
    const forOne = computeNutritionFromIngredients(
      [{ name: 'Poulet', quantity: '200', unit: 'g' }],
      1
    ).nutrition.calories;
    const forTwo = computeNutritionFromIngredients(
      [{ name: 'Poulet', quantity: '200', unit: 'g' }],
      2
    ).nutrition.calories;
    // Pour 2 portions, chaque portion a moitié moins de calories
    expect(forTwo).toBe(Math.round(forOne / 2));
  });

  it('gère les quantités avec une virgule décimale', () => {
    const { nutrition } = computeNutritionFromIngredients(
      [{ name: 'Huile', quantity: '2,5', unit: 'g' }],
      1
    );
    // 2.5g d'huile = 884 * 0.025 ≈ 22 kcal
    expect(nutrition.calories).toBeGreaterThan(15);
    expect(nutrition.calories).toBeLessThan(30);
  });

  it('ignore les ingrédients sans nom', () => {
    const { matched, total } = computeNutritionFromIngredients(
      [
        { name: 'Poulet', quantity: '100', unit: 'g' },
        { name: '', quantity: '100', unit: 'g' },
      ],
      1
    );
    expect(total).toBe(1); // le nom vide n'est pas compté
    expect(matched).toBe(1);
  });
});
