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

  it('builds the production preview before every declared claim command', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(packageJson.scripts['pretest:claims']).toBe('npm run build');
    const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ test: string }>;
    expect(claims.every((claim) => claim.test.startsWith('npm run test:claims -- --grep @claim:'))).toBe(true);
  });

  it('keeps every registered claim in one exact browser regression', () => {
    const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ id: string }>;
    const claimTests = readFileSync('tests/claims.spec.ts', 'utf8');
    for (const { id } of claims) {
      expect(claimTests.match(new RegExp(`@claim:${id.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`, 'g'))).toHaveLength(1);
    }
    const registered = new Set(claims.map(({ id }) => id));
    const implemented = [...claimTests.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1]);
    expect(implemented.every((id) => registered.has(id))).toBe(true);
  });
});
