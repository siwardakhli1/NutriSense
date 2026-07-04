// ==========================================
// TESTS - Helpers utilitaires
// ==========================================
import {
  generateId,
  generateSecureToken,
  daysAgo,
  todayISO,
  cosineSimilarity,
  textToVector,
} from '../src/utils/helpers';

describe('generateId', () => {
  it("génère un ID sous forme de string", () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(5);
  });

  it('génère des IDs uniques', () => {
    const ids = Array.from({ length: 100 }, () => generateId());
    const uniques = new Set(ids);
    expect(uniques.size).toBe(100);
  });
});

describe('generateSecureToken', () => {
  it("génère un token de 96 caractères hex", () => {
    const token = generateSecureToken();
    expect(token).toMatch(/^[a-f0-9]{96}$/);
  });

  it("génère des tokens uniques", () => {
    const t1 = generateSecureToken();
    const t2 = generateSecureToken();
    expect(t1).not.toBe(t2);
  });
});

describe('daysAgo', () => {
  it("renvoie une date au format ISO", () => {
    const date = daysAgo(7);
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("renvoie une date antérieure à maintenant", () => {
    const date = new Date(daysAgo(5));
    const now = new Date();
    expect(date.getTime()).toBeLessThan(now.getTime());
  });

  it("renvoie 0 jours = aujourd'hui", () => {
    const date = new Date(daysAgo(0));
    const now = new Date();
    expect(Math.abs(date.getTime() - now.getTime())).toBeLessThan(1000);
  });
});

describe('todayISO', () => {
  it("renvoie la date du jour au format YYYY-MM-DD", () => {
    const today = todayISO();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Vérifier qu'on retrouve bien l'année et le mois courants
    const now = new Date();
    expect(today.startsWith(now.getFullYear().toString())).toBe(true);
  });
});

describe('cosineSimilarity', () => {
  it("renvoie 1 pour deux vecteurs identiques", () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5);
  });

  it("renvoie 0 pour deux vecteurs orthogonaux", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 5);
  });

  it("renvoie 0 si l'un des vecteurs est nul", () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
    expect(cosineSimilarity([1, 2, 3], [0, 0, 0])).toBe(0);
  });

  it("gère des vecteurs similaires (poussés dans même direction)", () => {
    const sim = cosineSimilarity([1, 1, 0], [1, 1, 1]);
    expect(sim).toBeGreaterThan(0.5);
    expect(sim).toBeLessThan(1);
  });
});

describe('textToVector', () => {
  const vocabulary = ['protein', 'calorie', 'sucre', 'gras'];

  it("compte les occurrences de mots du vocabulaire", () => {
    const vec = textToVector('protein protein calorie', vocabulary);
    expect(vec).toEqual([2, 1, 0, 0]);
  });

  it("est insensible à la casse", () => {
    const vec = textToVector('PROTEIN Calorie', vocabulary);
    expect(vec).toEqual([1, 1, 0, 0]);
  });

  it("ignore les mots hors vocabulaire", () => {
    const vec = textToVector('hello world protein', vocabulary);
    expect(vec).toEqual([1, 0, 0, 0]);
  });

  it("renvoie un vecteur nul pour un texte vide", () => {
    expect(textToVector('', vocabulary)).toEqual([0, 0, 0, 0]);
  });

  it("gère les accents dans les mots", () => {
    const vocabWithAccents = ['sucré', 'salé'];
    const vec = textToVector('sucré salé sucré', vocabWithAccents);
    expect(vec).toEqual([2, 1]);
  });
});
