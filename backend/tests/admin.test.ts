// ==========================================
// TESTS - Routes Admin (dashboard, users, recipes) + adminMiddleware
// Teste la sécurité (403 si pas admin) et les endpoints admin.
// ==========================================
import request from 'supertest';
import { prisma } from '../src/config/database';

;(process.env as any).NODE_ENV = 'test';

let app: any;
let adminToken = '';
let userToken = '';
let adminEmail = '';
let userEmail = '';

beforeAll(async () => {
  app = (await import('../src/index')).default;

  // Nettoyer d'éventuels comptes de test précédents
  await prisma.user.deleteMany({ where: { email: { contains: 'test-admin-' } } });

  // 1. Créer un utilisateur NORMAL
  userEmail = `test-admin-user-${Date.now()}@example.com`;
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Normal User', email: userEmail, password: 'password123' });
  userToken = userRes.body.accessToken;

  // 2. Créer un utilisateur qu'on va promouvoir ADMIN
  adminEmail = `test-admin-boss-${Date.now()}@example.com`;
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin Boss', email: adminEmail, password: 'password123' });
  adminToken = adminRes.body.accessToken;

  // Promouvoir ce compte en admin directement en base
  await prisma.user.update({
    where: { email: adminEmail },
    data: { role: 'admin' },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: 'test-admin-' } } });
  await prisma.$disconnect();
});

describe('adminMiddleware — sécurité', () => {
  it('refuse (403) un utilisateur normal sur /api/admin/stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('refuse (401) une requête sans token', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('autorise un admin sur /api/admin/stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/admin/stats', () => {
  it('renvoie les statistiques globales', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    // Les champs attendus du dashboard
    expect(res.body).toHaveProperty('userCount');
    expect(res.body).toHaveProperty('recipeCount');
    expect(res.body).toHaveProperty('weekPlanCount');
    expect(res.body).toHaveProperty('referralCount');
    expect(res.body).toHaveProperty('premiumCount');
    expect(res.body).toHaveProperty('rewardsUnlocked');
    expect(typeof res.body.userCount).toBe('number');
  });

  it('compte au moins les 2 utilisateurs de test', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.body.userCount).toBeGreaterThanOrEqual(2);
  });
});

describe('GET /api/admin/users', () => {
  it('renvoie la liste des utilisateurs', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('chaque utilisateur a les champs attendus', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    const u = res.body.users[0];
    expect(u).toHaveProperty('id');
    expect(u).toHaveProperty('name');
    expect(u).toHaveProperty('email');
    expect(u).toHaveProperty('role');
    expect(u).toHaveProperty('invitedCount');
  });

  it('refuse un utilisateur normal (403)', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/admin/recipes', () => {
  it('renvoie la liste des recettes', async () => {
    const res = await request(app)
      .get('/api/admin/recipes')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.recipes)).toBe(true);
  });

  it('refuse un utilisateur normal (403)', async () => {
    const res = await request(app)
      .get('/api/admin/recipes')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/admin/recipes/:id', () => {
  it('renvoie 404 pour une recette inexistante', async () => {
    const res = await request(app)
      .delete('/api/admin/recipes/inexistant-id-12345')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('refuse un utilisateur normal (403)', async () => {
    const res = await request(app)
      .delete('/api/admin/recipes/some-id')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
