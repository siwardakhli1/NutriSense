// ==========================================
// TESTS - Validation Zod des schemas
// Tests unitaires purs, sans dépendance à la BDD
// ==========================================
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  healthGoalSchema,
  aiAdviceSchema,
} from '../src/schemas';

describe('registerSchema', () => {
  it('accepte des données valides', () => {
    const result = registerSchema.safeParse({
      name: 'Sirine Dakhli',
      email: 'sirine@example.com',
      password: 'motdepasse123',
    });
    expect(result.success).toBe(true);
  });

  it("refuse un email invalide", () => {
    const result = registerSchema.safeParse({
      name: 'Sirine',
      email: 'pas-un-email',
      password: 'motdepasse123',
    });
    expect(result.success).toBe(false);
  });

  it('refuse un mot de passe trop court', () => {
    const result = registerSchema.safeParse({
      name: 'Sirine',
      email: 'sirine@example.com',
      password: '123',
    });
    expect(result.success).toBe(false);
  });

  it('refuse un nom trop court', () => {
    const result = registerSchema.safeParse({
      name: 'S',
      email: 'sirine@example.com',
      password: 'motdepasse123',
    });
    expect(result.success).toBe(false);
  });

  it('refuse un nom trop long', () => {
    const result = registerSchema.safeParse({
      name: 'S'.repeat(100),
      email: 'sirine@example.com',
      password: 'motdepasse123',
    });
    expect(result.success).toBe(false);
  });

  it('refuse un mot de passe trop long', () => {
    const result = registerSchema.safeParse({
      name: 'Sirine',
      email: 'sirine@example.com',
      password: 'x'.repeat(200),
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepte email valide + mot de passe', () => {
    const result = loginSchema.safeParse({
      email: 'test@test.com',
      password: 'anything',
    });
    expect(result.success).toBe(true);
  });

  it('refuse email absent', () => {
    const result = loginSchema.safeParse({ password: 'test' });
    expect(result.success).toBe(false);
  });

  it('refuse mot de passe vide', () => {
    const result = loginSchema.safeParse({
      email: 'test@test.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('refreshSchema', () => {
  it('accepte un token non vide', () => {
    const result = refreshSchema.safeParse({ refreshToken: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('refuse un token vide', () => {
    const result = refreshSchema.safeParse({ refreshToken: '' });
    expect(result.success).toBe(false);
  });

  it('refuse un token manquant', () => {
    const result = refreshSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('healthGoalSchema', () => {
  it('accepte un objectif santé valide', () => {
    const result = healthGoalSchema.safeParse({
      weight: 68,
      targetWeight: 62,
      height: 165,
      activityLevel: 'medium',
    });
    expect(result.success).toBe(true);
  });

  it("accepte sans activityLevel (optionnel)", () => {
    const result = healthGoalSchema.safeParse({
      weight: 68,
      targetWeight: 62,
      height: 165,
    });
    expect(result.success).toBe(true);
  });

  it('refuse un poids négatif', () => {
    const result = healthGoalSchema.safeParse({
      weight: -5,
      targetWeight: 60,
      height: 165,
    });
    expect(result.success).toBe(false);
  });

  it("refuse un poids irréaliste (500kg)", () => {
    const result = healthGoalSchema.safeParse({
      weight: 500,
      targetWeight: 60,
      height: 165,
    });
    expect(result.success).toBe(false);
  });

  it('refuse une taille en dessous de 50cm', () => {
    const result = healthGoalSchema.safeParse({
      weight: 68,
      targetWeight: 62,
      height: 30,
    });
    expect(result.success).toBe(false);
  });

  it('refuse un niveau d\'activité invalide', () => {
    const result = healthGoalSchema.safeParse({
      weight: 68,
      targetWeight: 62,
      height: 165,
      activityLevel: 'extreme',
    });
    expect(result.success).toBe(false);
  });
});

describe('aiAdviceSchema', () => {
  it('accepte un message valide', () => {
    const result = aiAdviceSchema.safeParse({ message: 'Bonjour' });
    expect(result.success).toBe(true);
  });

  it('refuse un message vide', () => {
    const result = aiAdviceSchema.safeParse({ message: '' });
    expect(result.success).toBe(false);
  });

  it('refuse un message trop long', () => {
    const result = aiAdviceSchema.safeParse({ message: 'x'.repeat(1500) });
    expect(result.success).toBe(false);
  });
});
