// ==========================================
// TESTS - Service LLM (fonctions internes pures)
// ==========================================
import { buildSystemPrompt, fallbackRuleBased } from '../src/services/llm.service';

describe('buildSystemPrompt', () => {
  const emptyChunks: any[] = [];

  it("contient le rôle d'assistant NutriSense", () => {
    const prompt = buildSystemPrompt({ goal: 'healthy' } as any, emptyChunks);
    expect(prompt).toContain('NutriSense');
    expect(prompt).toContain('nutritionnel');
  });

  it('inclut l\'objectif utilisateur', () => {
    const prompt = buildSystemPrompt({ goal: 'muscle' } as any, emptyChunks);
    expect(prompt).toContain('muscle');
  });

  it('inclut les régimes alimentaires', () => {
    const prompt = buildSystemPrompt({ goal: 'healthy', dietary: ['halal', 'sans_gluten'] } as any, emptyChunks);
    expect(prompt).toContain('halal');
    expect(prompt).toContain('sans_gluten');
  });

  it('inclut le poids actuel et cible', () => {
    const prompt = buildSystemPrompt(
      { goal: 'healthy', currentWeight: 70, targetWeight: 65 } as any,
      emptyChunks
    );
    expect(prompt).toContain('70');
    expect(prompt).toContain('65');
  });

  it('inclut les sources RAG', () => {
    const chunks = [
      { source: 'ANSES', content: 'Recommandation 1' },
      { source: 'PNNS', content: 'Recommandation 2' },
    ];
    const prompt = buildSystemPrompt({ goal: 'healthy' } as any, chunks as any);
    expect(prompt).toContain('ANSES');
    expect(prompt).toContain('PNNS');
    expect(prompt).toContain('Recommandation 1');
    expect(prompt).toContain('Recommandation 2');
  });

  it('gère l\'absence de chunks (message par défaut)', () => {
    const prompt = buildSystemPrompt({ goal: 'healthy' } as any, emptyChunks);
    expect(prompt).toContain('Aucune source');
  });

  it('contient les consignes de sécurité (pas de conseil médical)', () => {
    const prompt = buildSystemPrompt({ goal: 'healthy' } as any, emptyChunks);
    expect(prompt.toLowerCase()).toContain('médical');
  });

  it("indique un objectif 'non défini' si absent", () => {
    const prompt = buildSystemPrompt({} as any, emptyChunks);
    expect(prompt).toContain('non défini');
  });
});

describe('fallbackRuleBased', () => {
  const emptyChunks: any[] = [];

  it("utilise le premier chunk RAG s'il y en a", () => {
    const chunks = [
      { source: 'ANSES', content: 'Manger 5 fruits et légumes par jour.' },
    ];
    const response = fallbackRuleBased('quoi manger ?', { goal: 'healthy' } as any, chunks as any);
    expect(response).toContain('5 fruits');
    expect(response).toContain('ANSES');
  });

  it('mentionne l\'objectif utilisateur dans la réponse avec RAG', () => {
    const chunks = [{ source: 'PNNS', content: 'Boire de l\'eau.' }];
    const response = fallbackRuleBased('test', { goal: 'muscle' } as any, chunks as any);
    expect(response).toContain('muscle');
  });

  it("réponse spécifique pour question de perte de poids", () => {
    const response = fallbackRuleBased('je veux perdre du poids', {} as any, emptyChunks);
    expect(response.toLowerCase()).toContain('déficit calorique');
  });

  it("réponse spécifique pour prise de masse", () => {
    const response = fallbackRuleBased('comment prendre de la masse ?', {} as any, emptyChunks);
    expect(response.toLowerCase()).toContain('surplus');
  });

  it("réponse spécifique pour budget", () => {
    const response = fallbackRuleBased('manger pas cher', {} as any, emptyChunks);
    expect(response.toLowerCase()).toContain('budget');
  });

  it("réponse spécifique pour halal", () => {
    const response = fallbackRuleBased('menu halal', {} as any, emptyChunks);
    expect(response.toLowerCase()).toContain('halal');
  });

  it('réponse générique si aucun mot-clé matché', () => {
    const response = fallbackRuleBased('bonjour', { goal: 'healthy' } as any, emptyChunks);
    expect(response).toContain('healthy');
    expect(response).toContain('protéines');
  });

  it('gère un objectif manquant dans la réponse générique', () => {
    const response = fallbackRuleBased('bonjour', {} as any, emptyChunks);
    expect(response).toContain('santé');
  });

  it("est insensible à la casse du message", () => {
    const r1 = fallbackRuleBased('PERDRE DU POIDS', {} as any, emptyChunks);
    const r2 = fallbackRuleBased('perdre du poids', {} as any, emptyChunks);
    expect(r1).toBe(r2);
  });
});