// ==========================================
// TESTS - Utils et service knowledge (pas de DB nécessaire)
// ==========================================
import { cosineSimilarity, textToVector } from '../src/utils/helpers';
import { retrieveRelevantChunks } from '../src/services/knowledge.service';

describe('Utils: cosineSimilarity', () => {
  it('renvoie 1 pour deux vecteurs identiques', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  it('renvoie 0 pour deux vecteurs orthogonaux', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('gère les vecteurs nuls sans crash', () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});

describe('Utils: textToVector', () => {
  it('construit un vecteur de fréquence par vocabulaire', () => {
    const vocab = ['pomme', 'poire', 'banane'];
    const vec = textToVector('pomme pomme banane', vocab);
    expect(vec).toEqual([2, 0, 1]);
  });
});

describe('Knowledge: retrieveRelevantChunks', () => {
  it('retourne des chunks pertinents pour "perdre du poids"', () => {
    const chunks = retrieveRelevantChunks('comment perdre du poids');
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].topic.toLowerCase()).toContain('poids');
  });

  it('retourne des chunks pertinents pour "budget"', () => {
    const chunks = retrieveRelevantChunks('manger pas cher étudiant');
    expect(chunks.some((c) => c.tags.includes('budget'))).toBe(true);
  });
});
