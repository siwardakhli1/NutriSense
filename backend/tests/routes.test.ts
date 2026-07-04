// ==========================================
// TESTS - Routes diverses (preferences, health, meals, fridge, shopping, analytics)
// ==========================================
import request from 'supertest';
import { prisma } from '../src/config/database';

;(process.env as any).NODE_ENV = 'test';

let app: any;
let accessToken = '';

beforeAll(async () => {
  app = (await import('../src/index')).default;
  await prisma.user.deleteMany({ where: { email: { contains: 'test-routes-' } } });

  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Routes Tester',
      email: `test-routes-${Date.now()}@example.com`,
      password: 'password123',
    });
  accessToken = res.body.accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Preferences', () => {
  it('GET /api/preferences renvoie les prefs (peut être vide)', async () => {
    const res = await request(app)
      .get('/api/preferences')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBeLessThan(500);
  });

  it('PUT /api/preferences met à jour les prefs', async () => {
    const res = await request(app)
      .put('/api/preferences')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goal: 'healthy',
        budget: 80,
        servings: 2,
        dietary: ['halal'],
      });
    expect(res.status).toBeLessThan(500);
  });

  it('refuse sans token', async () => {
    const res = await request(app).get('/api/preferences');
    expect(res.status).toBe(401);
  });
});

describe('Health Goals', () => {
  it('POST /api/health-goals crée un objectif', async () => {
    const res = await request(app)
      .post('/api/health-goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ weight: 70, targetWeight: 65, height: 170, activityLevel: 'medium' });
    expect(res.status).toBeLessThan(500);
  });

  it('POST refuse un poids invalide', async () => {
    const res = await request(app)
      .post('/api/health-goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ weight: -5, targetWeight: 65, height: 170 });
    expect(res.status).toBe(400);
  });

  it('GET /api/health-goals/latest', async () => {
    const res = await request(app)
      .get('/api/health-goals/latest')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBeLessThan(500);
  });
});

describe('Meals', () => {
  it('GET /api/meals/current renvoie le plan (ou 404)', async () => {
    const res = await request(app)
      .get('/api/meals/current')
      .set('Authorization', `Bearer ${accessToken}`);
    expect([200, 404]).toContain(res.status);
  });

  it('refuse sans token', async () => {
    const res = await request(app).get('/api/meals/current');
    expect(res.status).toBe(401);
  });
});

describe('Fridge', () => {
  it('GET /api/fridge/items', async () => {
    const res = await request(app)
      .get('/api/fridge/items')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBeLessThan(500);
  });

  it('POST /api/fridge/items ajoute un item', async () => {
    const res = await request(app)
      .post('/api/fridge/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'tomates', quantity: 5, unit: 'unités' });
    expect(res.status).toBeLessThan(500);
  });

  it('GET /api/fridge/suggestions', async () => {
    const res = await request(app)
      .get('/api/fridge/suggestions')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBeLessThan(500);
  });
});

describe('Shopping', () => {
  it('GET /api/shopping/current', async () => {
    const res = await request(app)
      .get('/api/shopping/current')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBeLessThan(500);
  });
});

describe('Logs', () => {
  it('POST /api/logs/nutrition ajoute un log', async () => {
    const res = await request(app)
      .post('/api/logs/nutrition')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        source: 'manual',
        label: 'Test meal',
        calories: 500,
        protein: 30,
        carbs: 50,
        fat: 20,
        fiber: 5,
      });
    expect(res.status).toBeLessThan(500);
  });

  it('POST /api/logs/weight ajoute une pesée', async () => {
    const res = await request(app)
      .post('/api/logs/weight')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ weight: 68.5 });
    expect(res.status).toBeLessThan(500);
  });
});

describe('Analytics', () => {
  it('GET /api/analytics/dashboard', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBeLessThan(500);
  });

  it('refuse sans token', async () => {
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(401);
  });
});
