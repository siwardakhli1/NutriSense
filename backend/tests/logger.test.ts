// ==========================================
// TESTS - Logger structuré
// ==========================================
import { logger } from '../src/utils/logger';

describe('Logger', () => {
  it('expose les 5 niveaux de log', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.security).toBe('function');
  });

  it('logger.debug ne throw pas', () => {
    expect(() => logger.debug('test message')).not.toThrow();
  });

  it('logger.info ne throw pas', () => {
    expect(() => logger.info('test message')).not.toThrow();
  });

  it('logger.warn accepte un contexte', () => {
    expect(() => logger.warn('warning', { userId: 'u1', ip: '127.0.0.1' })).not.toThrow();
  });

  it('logger.error accepte un contexte', () => {
    expect(() => logger.error('error', { errorCode: 500 })).not.toThrow();
  });

  it('logger.security enregistre les événements sécurité', () => {
    expect(() => logger.security('LOGIN_FAILED', { ip: '10.0.0.1', email: 'test@test.com' })).not.toThrow();
  });

  it("gère l'absence de contexte", () => {
    expect(() => logger.info('no context')).not.toThrow();
    expect(() => logger.security('SIMPLE_EVENT')).not.toThrow();
  });
});
