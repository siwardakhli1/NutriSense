// ==========================================
// TESTS - Routes Meals (génération de plan, portions, courses)
// Teste le flux complet : générer un plan, le consulter, le ré-échelonner.
// ==========================================
import request from 'supertest';
import { prisma } from '../src/config/database';

;(process.env as any).NODE_ENV = 'test';

let app: any;
let token = '';
let email = '';

beforeAll(async () => {
  app = (await import('../src/index')).default;
  await prisma.user.deleteMany({ where: { email: { contains: 'test-meals-' } } });

  email = `test-meals-${Date.now()}@example.com`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Meals Tester', email, password: 'password123' });
  token = res.body.accessToken;

  // Définir des préférences par défaut
  await request(app)
    .put('/api/preferences')
    .set('Authorization', `Bearer ${token}`)
    .send({ goal: 'healthy', budget: 60, dietary: [], servings: 2 });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: 'test-meals-' } } });
  await prisma.$disconnect();
});

describe('POST /api/meals/generate', () => {
  it('génère un plan de la semaine', async () => {
    const res = await request(app)
      .post('/api/meals/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 'healthy', budget: 60, dietary: [], servings: 2 });
    expect(res.status).toBe(200);
    expect(res.body.weekPlan).toBeDefined();
    expect(Array.isArray(res.body.weekPlan.days)).toBe(true);
    expect(res.body.weekPlan.days.length).toBe(7);
  });

  it('refuse sans authentification (401)', async () => {
    const res = await request(app)
      .post('/api/meals/generate')
      .send({ goal: 'healthy', budget: 60, dietary: [], servings: 2 });
    expect(res.status).toBe(401);
  });

  it('chaque jour a une date et des repas', async () => {
    const res = await request(app)
      .post('/api/meals/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 'healthy', budget: 60, dietary: [], servings: 2 });
    const day = res.body.weekPlan.days[0];
    expect(day).toHaveProperty('date');
    expect(Array.isArray(day.meals)).toBe(true);
  });
});

describe('GET /api/meals/current', () => {
  it('renvoie le plan courant après génération', async () => {
    // Générer d'abord
    await request(app)
      .post('/api/meals/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 'healthy', budget: 60, dietary: [], servings: 2 });

    const res = await request(app)
      .get('/api/meals/current')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.weekPlan).toBeDefined();
  });

  it('refuse sans authentification (401)', async () => {
    const res = await request(app).get('/api/meals/current');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/meals/all-recipes', () => {
  it('renvoie toutes les recettes', async () => {
    const res = await request(app)
      .get('/api/meals/all-recipes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.recipes)).toBe(true);
  });
});

describe('POST /api/meals/regenerate-from-today', () => {
  it('régénère le plan en préservant les jours passés', async () => {
    // S'assurer qu'un plan existe
    await request(app)
      .post('/api/meals/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 'healthy', budget: 60, dietary: [], servings: 2 });

    const res = await request(app)
      .post('/api/meals/regenerate-from-today')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 'fast', budget: 60, dietary: [], servings: 2 });
    expect(res.status).toBe(200);
    expect(res.body.weekPlan).toBeDefined();
  });
});

describe('POST /api/meals/rescale', () => {
  it('ré-échelonne le plan au nouveau nombre de personnes', async () => {
    // Générer un plan pour 2 personnes
    await request(app)
      .post('/api/meals/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 'healthy', budget: 60, dietary: [], servings: 2 });

    // Ré-échelonner à 4 personnes
    const res = await request(app)
      .post('/api/meals/rescale')
      .set('Authorization', `Bearer ${token}`)
      .send({ servings: 4 });
    expect(res.status).toBe(200);
    expect(res.body.weekPlan).toBeDefined();
  });

  it('refuse sans authentification (401)', async () => {
    const res = await request(app)
      .post('/api/meals/rescale')
      .send({ servings: 4 });
    expect(res.status).toBe(401);
  });
});
