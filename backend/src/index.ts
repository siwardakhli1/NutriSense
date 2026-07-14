// ==========================================
// ENTRY POINT - NutriSense Backend v2 (PostgreSQL + Prisma)
// ==========================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { initDatabase, closeDatabase } from './config/database';
import { seedRecipes } from './db/seed';
import { setupSwagger } from './swagger';
import { globalLimiter } from './middlewares/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { hideStack, limitPayloadSize, preventPathTraversal, requestTracing } from './middlewares/security.middleware';

import authRoutes from './routes/auth.routes';
import nutritionRoutes from './routes/nutrition.routes';
import aiRoutes from './routes/ai.routes';
import analyticsRoutes from './routes/analytics.routes';
import fridgeRoutes from './routes/fridge.routes';
import logsRoutes from './routes/logs.routes';
import healthRoutes from './routes/health.routes';
import recipesRoutes from './routes/recipes.routes';
import preferencesRoutes from './routes/preferences.routes';
import mealsRoutes from './routes/meals.routes';
import adminRoutes from './routes/admin.routes';
import shoppingRoutes from './routes/shopping.routes';

const app = express();

// Sécurité HTTP renforcée (OWASP A05 : Security Misconfiguration)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.mistral.ai', 'https://world.openfoodfacts.org'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Pour permettre le chargement des images OFF
  hsts: {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'no-referrer' },
}));
app.use(cors());
app.use(hideStack);                        // OWASP A05 : cache la stack technique
app.use(requestTracing);                   // OWASP A09 : traçabilité des requêtes
app.use(limitPayloadSize(5_000_000));      // OWASP A05 : DoS prevention (5MB max)
app.use(preventPathTraversal);             // OWASP A01 : anti-path-traversal
app.use(express.json({ limit: '5mb' }));
app.use(globalLimiter);

if (env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// ==========================================
// HEALTH CHECKS (Kubernetes-ready)
// ==========================================

// /health - Endpoint de santé principal (legacy, garde la rétrocompatibilité)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    database: 'postgresql',
    uptime: process.uptime(),
    llmProvider: env.LLM_PROVIDER,
    timestamp: new Date().toISOString(),
  });
});

// /live - Liveness probe : le serveur répond-il ?
// Utilisé par Kubernetes/Docker pour redémarrer le container si le serveur est mort
app.get('/live', (_req, res) => {
  res.status(200).json({
    status: 'alive',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// /ready - Readiness probe : le serveur est-il prêt à recevoir du trafic ?
// Vérifie la connexion à la BDD et les services critiques
app.get('/ready', async (_req, res) => {
  const checks: Record<string, string> = {};
  let allHealthy = true;

  // Vérifier la BDD
  try {
    const { prisma } = await import('./config/database');
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (err) {
    checks.database = 'down';
    allHealthy = false;
  }

  // Vérifier la config LLM
  checks.llm = env.LLM_PROVIDER === 'fallback' || env.LLM_API_KEY ? 'ok' : 'no-api-key';

  // Vérifier la config email
  checks.email = process.env.EMAIL_PROVIDER || 'console';

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not-ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/fridge', fridgeRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/health-goals', healthRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/shopping', shoppingRoutes);

setupSwagger(app);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await initDatabase();
  await seedRecipes();

  const server = app.listen(env.PORT, () => {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   🚀 NutriSense API v2.0.0         ║');
    console.log('╠═══════════════════════════════════════╣');
    console.log(`║   API   : http://localhost:${env.PORT}       ║`);
    console.log(`║   Docs  : http://localhost:${env.PORT}/api/docs`);
    console.log(`║   DB    : PostgreSQL (Prisma)         ║`);
    console.log(`║   LLM   : ${env.LLM_PROVIDER.padEnd(30)}║`);
    console.log(`║   Env   : ${env.NODE_ENV.padEnd(30)}║`);
    console.log('╚═══════════════════════════════════════╝');
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM reçu, arrêt propre...');
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  });
}

// Ne pas démarrer le serveur en mode test (les tests utilisent supertest sur l'app Express)
if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('Échec démarrage:', err);
    process.exit(1);
  });
}

export default app;
