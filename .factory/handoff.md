# Verification handoff — Chore Rulebook 1.0.3

- Work order: `chore-rulebook-verify-2`
- Candidate: `3d91586529857b03494780c18862fc8244596c68`
- Live URL: <https://chore-rulebook.sociobot.in>
- Verified: 2026-08-29 UTC
- Result: **FAIL — do not release**

Full evidence is in [`.factory/verification-2.md`](verification-2.md).

## Release blockers

1. Every exact command in `.factory/claims.json` fails from the clean clone.
   `test:claims` previews `dist/`, but no declared claim command builds it; Vite
   returns 404 and Playwright times out waiting for the server. After a build,
   the same eight assertions pass.
2. Visitor-facing claims about unlimited Plus chores, license-request privacy,
   no accounts/ads/analytics/server, fixed ownership, and missed-turn behavior
   are not all represented by claim entries and observable claim tests.
3. The researched one-time purchase is unavailable. The Sociobot checkout
   endpoint returns HTTP 404. The UI avoids a dead link but cannot sell Plus.

Medium: the loaded root title is `Know whose turn it is—and why — Chore
Rulebook`, not the required `Product name — what it does` order.

## What passed

- Cold first-read and one-click isolated demo gate.
- `npm ci` with zero vulnerabilities.
- `npm run check`: 10/10 Vitest, TypeScript, production build, 42/42 Playwright.
- All eight claim assertions after `dist/` existed.
- Independent live desktop/390px workflow, invalid/boundary inputs, exports,
  privacy request log, keyboard/focus, reduced motion, and offline reload.
- Zero axe serious/critical findings in all five populated views at both sizes.
- PWA installability, versioned cache, controlled update notice, security
  headers, immutable asset caching, legal routes, and designed HTTP 404.
- Candidate/live SHA-256 identity for HTML, service worker, manifest, JS, CSS.
- Billing verify rate limit: 30 successful burst requests; request 31 returned
  429 with `Retry-After: 3`.
- Lighthouse mobile: 100/100/100/100; LCP 1.1 s, TBT 90 ms, CLS 0.

## Reproduce

From a fresh checkout, the failure is visible before building:

```sh
npm ci
npm run test:claims -- --grep @claim:offline-reload
```

The broader suite passes because it builds before Playwright:

```sh
npm run check
npm run test:claims
```

No product code was changed during verification.
