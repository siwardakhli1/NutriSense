// ==========================================
// TESTS - Routes recipes
// ==========================================
import request from 'supertest';
import { prisma } from '../src/config/database';

;(process.env as any).NODE_ENV = 'test';

let app: any;
let accessToken = '';

beforeAll(async () => {
  app = (await import('../src/index')).default;
  await prisma.user.deleteMany({ where: { email: { contains: 'test-recipes-' } } });

  // Créer un user de test
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Recipe Tester',
      email: `test-recipes-${Date.now()}@example.com`,
      password: 'password123',
    });
  accessToken = res.body.accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/recipes', () => {
  it('renvoie la liste des recettes (authentifié)', async () => {
    const res = await request(app)
      .get('/api/recipes')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('refuse sans token', async () => {
    const res = await request(app).get('/api/recipes');
    expect(res.status).toBe(401);
  });

  it('filtre par tag', async () => {
    const res = await request(app)
      .get('/api/recipes?tag=lunch')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filtre par recherche', async () => {
    const res = await request(app)
      .get('/api/recipes?q=poulet')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/recipes/:id', () => {
  it('renvoie 404 pour un ID inexistant', async () => {
    const res = await request(app)
      .get('/api/recipes/inexistant-id-12345')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/recipes/mine', () => {
  it('renvoie une liste vide au départ', async () => {
    const res = await request(app)
      .get('/api/recipes/mine')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/recipes/mine', () => {
  let createdRecipeId = '';

  it('crée une recette personnelle', async () => {
    const res = await request(app)
      .post('/api/recipes/mine')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Ma recette test',
        emoji: '🍕',
        timeMinutes: 30,
        servings: 4,
        difficulty: 'facile',
        ingredients: [{ id: 'i1', name: 'Farine', quantity: '500', unit: 'g' }],
        steps: ['Étape 1', 'Étape 2'],
        nutrition: { calories: 400, protein: 15, carbs: 60, fat: 10, fiber: 3 },
        tags: ['lunch', 'healthy'],
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Ma recette test');
    createdRecipeId = res.body.id;
  });

  it('refuse sans nom', async () => {
    const res = await request(app)
      .post('/api/recipes/mine')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ingredients: [], steps: [] });
    expect(res.status).toBe(400);
  });

  it('supprime la recette créée', async () => {
    if (!createdRecipeId) return;
    const res = await request(app)
      .delete(`/api/recipes/mine/${createdRecipeId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/recipes/mine/export', () => {
  it('exporte les recettes personnelles', async () => {
    const res = await request(app)
      .get('/api/recipes/mine/export')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.recipes).toBeDefined();
    expect(Array.isArray(res.body.recipes)).toBe(true);
  });
});

describe('GET /api/recipes/favorites/list', () => {
  it('renvoie une liste vide de favoris', async () => {
    const res = await request(app)
      .get('/api/recipes/favorites/list')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
