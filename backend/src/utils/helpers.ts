// ==========================================
// UTILS - Helpers génériques
// ==========================================
import crypto from 'crypto';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function generateSecureToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// Similarité cosinus entre 2 vecteurs (utilisé par le RAG-lite)
export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// Embedding "poor man" : bag-of-words TF sur vocabulaire fixe (pas d'API à payer)
export function textToVector(text: string, vocabulary: string[]): number[] {
  const tokens = text.toLowerCase().split(/[^a-zàâäéèêëïîôöùûüç]+/).filter(Boolean);
  return vocabulary.map((word) => tokens.filter((t) => t === word).length);
}
