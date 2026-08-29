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

  it('serves the install manifest with a web manifest content type', () => {
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  });

  it('ships the 404 with the site skeleton, route metadata, and plain heading', () => {
    const page = readFileSync('public/404.html', 'utf8');
    expect(page).toContain('<h1 id="not-found-title">Page not found</h1>');
    expect(page).toContain('<header>');
    expect(page).toContain('<main id="main">');
    expect(page).toContain('<footer>');
    expect(page).toContain('href="/privacy"');
    expect(page).toContain('href="/terms"');
    expect(page).toContain('name="description"');
    expect(page).toContain('rel="canonical"');
    expect(page).toContain('property="og:title"');
    expect(page).toContain('name="twitter:card"');
  });

  it('keeps reviewed copy plain and ships a verb-first catalog sentence', () => {
    const appSource = readFileSync('src/main.ts', 'utf8');
    const readme = readFileSync('README.md', 'utf8');
    const catalog = readFileSync('.factory/catalog-description.txt', 'utf8').trim();
    expect(appSource).not.toContain('One home. Visible rules. Shared understanding.');
    expect(appSource).not.toContain('Private by default.');
    expect(readme).not.toContain('versioned app shell');
    expect(readme).not.toContain('free/local workflow');
    expect(catalog.length).toBeLessThanOrEqual(120);
    expect(catalog).toMatch(/^(Add|Build|Choose|Create|Explain|Keep|Know|Plan|Record|Rotate|Run|Set|Share|Track)\b/);
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
