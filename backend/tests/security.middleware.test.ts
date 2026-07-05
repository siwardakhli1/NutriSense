// ==========================================
// TESTS - Middlewares de sécurité
// ==========================================
import {
  hideStack,
  limitPayloadSize,
  preventPathTraversal,
  requestTracing,
} from '../src/middlewares/security.middleware';

// Helpers pour simuler req/res/next
function makeReq(overrides: any = {}) {
  return {
    headers: {},
    body: {},
    url: '/api/test',
    path: '/api/test',
    ip: '127.0.0.1',
    ...overrides,
  } as any;
}

function makeRes() {
  const res: any = {
    headers: {} as Record<string, any>,
    statusCode: 200,
    body: undefined,
  };
  res.removeHeader = jest.fn((name: string) => delete res.headers[name]);
  res.setHeader = jest.fn((name: string, val: any) => { res.headers[name] = val; });
  res.status = jest.fn((code: number) => { res.statusCode = code; return res; });
  res.json = jest.fn((body: any) => { res.body = body; return res; });
  return res;
}

describe('hideStack', () => {
  it('retire les headers X-Powered-By et Server', () => {
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    hideStack(req, res, next);

    expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By');
    expect(res.removeHeader).toHaveBeenCalledWith('Server');
    expect(next).toHaveBeenCalled();
  });
});

describe('limitPayloadSize', () => {
  it('laisse passer les requêtes légères', () => {
    const req = makeReq({ headers: { 'content-length': '1000' } });
    const res = makeRes();
    const next = jest.fn();

    limitPayloadSize(1_000_000)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  it('bloque les requêtes trop volumineuses', () => {
    const req = makeReq({ headers: { 'content-length': '5000000' } });
    const res = makeRes();
    const next = jest.fn();

    limitPayloadSize(1_000_000)(req, res, next);

    expect(res.statusCode).toBe(413);
    expect(res.body).toEqual(expect.objectContaining({ error: 'PAYLOAD_TOO_LARGE' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('accepte les requêtes sans content-length', () => {
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    limitPayloadSize()(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('preventPathTraversal', () => {
  it('laisse passer une URL normale', () => {
    const req = makeReq({ url: '/api/recipes/123' });
    const res = makeRes();
    const next = jest.fn();

    preventPathTraversal(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  it('bloque les tentatives de path traversal (..\\..)', () => {
    const req = makeReq({ url: '/api/files/..\\..\\etc\\passwd' });
    const res = makeRes();
    const next = jest.fn();

    preventPathTraversal(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('bloque les tentatives de path traversal (../)', () => {
    const req = makeReq({ url: '/api/files/../../etc/passwd' });
    const res = makeRes();
    const next = jest.fn();

    preventPathTraversal(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('bloque les tentatives encodées URL (%2e%2e)', () => {
    const req = makeReq({ url: '/api/files/%2e%2e/etc/passwd' });
    const res = makeRes();
    const next = jest.fn();

    preventPathTraversal(req, res, next);

    expect(res.statusCode).toBe(400);
  });

  it('bloque les tentatives dans le body', () => {
    const req = makeReq({
      url: '/api/upload',
      body: { filename: '../../../etc/passwd' },
    });
    const res = makeRes();
    const next = jest.fn();

    preventPathTraversal(req, res, next);

    expect(res.statusCode).toBe(400);
  });
});

describe('requestTracing', () => {
  it('génère un requestId si absent', () => {
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    requestTracing(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(typeof req.requestId).toBe('string');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', expect.any(String));
    expect(next).toHaveBeenCalled();
  });

  it('utilise le requestId fourni dans les headers', () => {
    const req = makeReq({ headers: { 'x-request-id': 'existing-id-123' } });
    const res = makeRes();
    const next = jest.fn();

    requestTracing(req, res, next);

    expect(req.requestId).toBe('existing-id-123');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', 'existing-id-123');
  });
});
