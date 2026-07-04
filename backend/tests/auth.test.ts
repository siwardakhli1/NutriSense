// ==========================================
// TESTS - Auth (nécessite PostgreSQL de test)
// Lancer avec DATABASE_URL pointant vers une DB de test.
// Ex: DATABASE_URL="postgresql://nutrisense:nutrisense@localhost:5432/nutrisense_test" npm test
// ==========================================
import request from 'supertest';
import { prisma } from '../src/config/database';

// Import différé pour éviter les side effects avant setup
let app: any;

beforeAll(async () => {
  app = (await import('../src/index')).default;
  // Nettoyer les données de test
  await prisma.user.deleteMany({ where: { email: { contains: 'test-jest-' } } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  const email = `test-jest-${Date.now()}@example.com`;

  it('crée un utilisateur avec des données valides', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email, password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('refuse un email en double', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email, password: 'password123' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('EMAIL_EXISTS');
  });

  it('refuse un mot de passe trop court', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: `test-jest-a-${Date.now()}@test.fr`, password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  it('renvoie 401 pour identifiants inconnus', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@nowhere.com', password: 'password123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });
});

describe('GET /health', () => {
  it('renvoie le status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('postgresql');
  });
});
