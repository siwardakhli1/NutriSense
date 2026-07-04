// ==========================================
// MIDDLEWARE - Rate limiting (protection brute-force / spam IA)
// ==========================================
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// En mode test, on désactive le rate limiting pour permettre à Jest de tourner
// plusieurs tests sur les mêmes endpoints sans être bloqué (429).
const isTest = process.env.NODE_ENV === 'test';

// Limiteur global (tous les endpoints)
export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: isTest ? 100000 : env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Trop de requêtes, réessayez plus tard',
  },
});

// Limiteur strict pour auth (protection brute-force login)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 100000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AUTH_RATE_LIMIT',
    message: 'Trop de tentatives de connexion, réessayez dans 15 min',
  },
});

// Limiteur strict pour l'IA (coût API + abus)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 100000 : env.RATE_LIMIT_AI_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI_RATE_LIMIT',
    message: "Limite de l'assistant IA atteinte, patientez 1 minute",
  },
});
