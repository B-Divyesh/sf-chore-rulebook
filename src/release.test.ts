import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('static deployment policy', () => {
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8'));

  it('ships route rewrites, a designed 404, and security headers', () => {
    expect(config.routes).toEqual(expect.arrayContaining([
      expect.objectContaining({ route: '/demo', rewrite: '/index.html' }),
      expect.objectContaining({ route: '/privacy', rewrite: '/index.html' }),
      expect.objectContaining({ route: '/terms', rewrite: '/index.html' }),
    ]));
    expect(config.responseOverrides['404'].rewrite).toBe('/404.html');
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['X-Content-Type-Options']).toBe('nosniff');
  });

  it('assigns immutable caching to hashed application assets', () => {
    const assetRoutes = config.routes.filter((route: { route: string }) => route.route.startsWith('/assets/'));
    expect(assetRoutes.every((route: { headers: Record<string, string> }) => route.headers['Cache-Control'].includes('immutable'))).toBe(true);
  });
});
