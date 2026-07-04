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
import shoppingRoutes from './routes/shopping.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(globalLimiter);

if (env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

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

app.use('/api/auth', authRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/fridge', fridgeRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/health-goals', healthRoutes);
app.use('/api/recipes', recipesRoutes);
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
