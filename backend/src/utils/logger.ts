// ==========================================
// LOGGER - Journalisation structurée
// OWASP A09 : Security Logging & Monitoring Failures
// ==========================================
import fs from 'fs';
import path from 'path';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
  ip?: string;
}

const LOG_DIR = process.env.LOG_DIR || './logs';
const IS_PROD = process.env.NODE_ENV === 'production';
const IS_TEST = process.env.NODE_ENV === 'test';

// Créer le dossier de logs si nécessaire (hors mode test)
if (!IS_TEST) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch {
    // Ignorer si on ne peut pas créer le dossier
  }
}

function formatEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function writeToFile(entry: LogEntry): void {
  if (IS_TEST) return;
  try {
    const filename = entry.level === 'security'
      ? path.join(LOG_DIR, 'security.log')
      : path.join(LOG_DIR, `${entry.level}.log`);
    fs.appendFileSync(filename, formatEntry(entry) + '\n');
  } catch {
    // Fallback sur console si écriture fichier impossible
  }
}

function log(level: LogLevel, message: string, context?: Record<string, any>): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && { context }),
  };

  // Console pour dev/prod
  if (!IS_TEST) {
    const colorMap: Record<LogLevel, string> = {
      debug: '\x1b[36m',    // cyan
      info: '\x1b[32m',     // vert
      warn: '\x1b[33m',     // jaune
      error: '\x1b[31m',    // rouge
      security: '\x1b[35m', // magenta
    };
    const reset = '\x1b[0m';
    const prefix = `${colorMap[level]}[${level.toUpperCase()}]${reset}`;
    console.log(`${prefix} ${entry.timestamp} - ${message}`, context || '');
  }

  // Fichiers en production
  if (IS_PROD) {
    writeToFile(entry);
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, any>) => log('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, any>) => log('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, any>) => log('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, any>) => log('error', msg, ctx),

  // Log spécial pour événements de sécurité (OWASP A09)
  security: (event: string, ctx?: Record<string, any>) => {
    log('security', event, ctx);
    // Toujours écrire les événements de sécurité en fichier, même en dev
    if (!IS_TEST && !IS_PROD) {
      writeToFile({
        timestamp: new Date().toISOString(),
        level: 'security',
        message: event,
        ...(ctx && { context: ctx }),
      });
    }
  },
};
