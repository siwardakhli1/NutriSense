// ==========================================
// TESTS - Routes auth (extension)
// ==========================================
import request from 'supertest';
import { prisma } from '../src/config/database';

;(process.env as any).NODE_ENV = 'test';

let app: any;

beforeAll(async () => {
  app = (await import('../src/index')).default;
  await prisma.user.deleteMany({ where: { email: { contains: 'test-auth-ext-' } } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth routes - extension', () => {
  const email = `test-auth-ext-${Date.now()}@example.com`;
  let accessToken = '';
  let refreshToken = '';

  it('POST /register accepte des données valides', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ext Test', email, password: 'password123' });
    expect(res.status).toBe(201);
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('POST /register refuse un email invalide', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'notanemail', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('POST /login valide un compte existant', async () => {
    // Petite pause pour éviter les tokens JWT dupliqués (signés avec même timestamp)
    await new Promise((r) => setTimeout(r, 1100));
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  }, 10000);

  it('POST /login refuse un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('POST /refresh renouvelle le token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('POST /refresh refuse un token invalide', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token-abc' });
    expect(res.status).toBe(401);
  });

  it('GET /me renvoie l\'utilisateur connecté', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
  });

  it('GET /me refuse sans token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('POST /change-password modifie le mdp', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'password123', newPassword: 'newpassword456' });
    expect(res.status).toBe(200);
  });

  it('POST /change-password refuse ancien mdp incorrect', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'wrongold', newPassword: 'newpassword456' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('POST /forgot-password répond toujours avec succès (sécurité)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'inexistant@test.com' });
    expect(res.status).toBe(200);
  });

  it('POST /forgot-password refuse sans email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /reset-password refuse un code invalide', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email, code: '000000', newPassword: 'newnew123' });
    expect(res.status).toBe(400);
  });
});
