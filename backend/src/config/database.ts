// ==========================================
// CONFIG - Client Prisma singleton (PostgreSQL)
// ==========================================
import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Singleton pour éviter les connexions multiples en dev (hot reload)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') global.__prisma = prisma;

export async function initDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log(' PostgreSQL connecté');
  } catch (err) {
    console.error(' Erreur connexion PostgreSQL:', (err as Error).message);
    console.error('   Vérifie DATABASE_URL dans .env et que Postgres tourne');
    process.exit(1);
  }
}

export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect();
}
