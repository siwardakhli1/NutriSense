// ==========================================
// TESTS - Service de recommandations (mode Frigo)
// ==========================================
import { normalizeIngredient, ingredientsMatch } from '../src/services/recommendation.service';

describe('normalizeIngredient', () => {
  it('met en minuscules', () => {
    expect(normalizeIngredient('POULET')).toBe('poulet');
  });

  it('retire les accents', () => {
    expect(normalizeIngredient('œuf')).toBe('uf');
    expect(normalizeIngredient('crème')).toBe('creme');
    expect(normalizeIngredient('brûlée')).toBe('brulee');
  });

  it('retire les caractères spéciaux', () => {
    expect(normalizeIngredient('sel & poivre')).toBe('sel  poivre');
  });

  it('retire le "s" final (pluriel)', () => {
    expect(normalizeIngredient('tomates')).toBe('tomate');
    expect(normalizeIngredient('oeufs')).toBe('oeuf');
  });

  it('trim les espaces', () => {
    expect(normalizeIngredient('  poulet  ')).toBe('poulet');
  });

  it('gère une chaîne vide', () => {
    expect(normalizeIngredient('')).toBe('');
  });
});

describe('ingredientsMatch', () => {
  it('matche exactement les mêmes ingrédients', () => {
    expect(ingredientsMatch('poulet', 'poulet')).toBe(true);
  });

  it('ignore la casse et les accents', () => {
    expect(ingredientsMatch('POULET', 'poulet')).toBe(true);
    expect(ingredientsMatch('œuf', 'oeuf')).toBe(true);
  });

  it('matche pluriel/singulier', () => {
    expect(ingredientsMatch('tomates', 'tomate')).toBe(true);
    expect(ingredientsMatch('oeuf', 'oeufs')).toBe(true);
  });

  it('matche un ingrédient inclus dans un autre', () => {
    expect(ingredientsMatch('poulet', 'blanc de poulet')).toBe(true);
    expect(ingredientsMatch('tomate', 'tomate cerise')).toBe(true);
  });

  it('ne matche pas des ingrédients différents', () => {
    expect(ingredientsMatch('poulet', 'boeuf')).toBe(false);
    expect(ingredientsMatch('carotte', 'brocoli')).toBe(false);
  });

  it('matche via synonymes : pate ↔ spaghetti', () => {
    expect(ingredientsMatch('pate', 'spaghetti')).toBe(true);
    expect(ingredientsMatch('spaghetti', 'pate')).toBe(true);
  });

  it('matche via synonymes : crevette ↔ gambas', () => {
    expect(ingredientsMatch('crevette', 'gambas')).toBe(true);
  });

  it('matche via synonymes : poulet ↔ blanc de poulet ↔ escalope', () => {
    expect(ingredientsMatch('poulet', 'escalope de poulet')).toBe(true);
  });

  it('gère les majuscules dans les synonymes', () => {
    expect(ingredientsMatch('PATE', 'Spaghetti')).toBe(true);
  });
});
