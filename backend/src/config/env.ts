// ==========================================
// CONFIG - Variables d'environnement centralisées
// ==========================================
import 'dotenv/config';

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://nutrisense:nutrisense@localhost:5432/nutrisense',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'nutrisense-dev-secret-change-in-prod',
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',

  // LLM (Mistral / OpenAI compatible)
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'fallback', // 'mistral' | 'openai' | 'fallback'
  LLM_API_KEY: process.env.LLM_API_KEY || '',
  LLM_MODEL: process.env.LLM_MODEL || 'mistral-small-latest',
  LLM_BASE_URL: process.env.LLM_BASE_URL || 'https://api.mistral.ai/v1',

  // Open Food Facts
  OFF_BASE_URL: 'https://world.openfoodfacts.org/api/v2',
  OFF_USER_AGENT: 'NutriSenseAI/1.0 (soutenance bac+5)',

  // Rate limit
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 600,
  RATE_LIMIT_AI_MAX: 20,
};
