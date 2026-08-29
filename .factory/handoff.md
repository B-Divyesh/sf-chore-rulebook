# Verification 6 handoff — Chore Rulebook

- Candidate commit: `19ad45d05cc827f38c6d14a2cb559865f1ea026a`
- Live URL: <https://chore-rulebook.sociobot.in>
- Date: 2026-08-29 UTC
- Result: **PASS**

Independent QA found the deployment to be byte-identical to the freshly built
candidate. All 16 required claim commands, unit tests, TypeScript check,
production build, and full Playwright suite passed. Live cold-read/demo,
normal and recovery workflows, 390 px mobile, keyboard/focus, axe
serious/critical, console/page errors, privacy request logging, headers,
caching, PWA offline reload/update, and license rate limiting passed.

The observed license endpoint allowance is 30 client requests per window;
request 31 returned `429` with `Retry-After: 3`. No product defects at any
severity were found. Complete evidence: `.factory/verification-6.md`.

## Previous builder handoff

- Work order: `chore-rulebook-polish-2`
- Repair commit: `a6d0d74fa979bbcc8ada7d4c5cec893daeca48b3`
- Deployment: `d62a2d5c-65ef-42e9-83e8-7c34aacf4012`
- Live target: <https://chore-rulebook.sociobot.in>
- Result: **PASS — all cumulative review findings closed.**

## Delivered

- A consistent 44 px site header navigation on landing, demo, Privacy, Terms,
  and 404; the existing pixel-signal product identity remains intact.
- Accurate title and canonical metadata for every deep-linkable app view.
- Plain, claim-covered checkout and license copy; no untested merchant or
  refund-handling promise remains.
- PWA version bumped to 1.0.7, including the service worker, manifest start
  URL, and visible build IDs.
- Updated verb-first catalog description and copy audit.

## Exact verification

Fresh final clone: `/tmp/chore-rulebook-polish-2-final.6BxOVO`.

```sh
npm ci
# all 16 individual commands declared in .factory/claims.json
npm run check
```

All 16 claim commands passed independently. `npm run check` passed with 15
Vitest tests, TypeScript, production build, and 68 Playwright checks. The build
produces `dist/index.html`; initial app JS is 15.40 kB gzip and CSS is 5.57 kB
gzip.

Post-deploy, `verify-url.sh` passed `/`, `/demo`, `/privacy`, and `/terms`.
Live route, title, header-link, 44 px target, mobile-overflow, 404, manifest,
offline-reload, and copy checks passed. Live Playwright axe scans found zero
serious/critical findings on all product routes and views. Lighthouse mobile
was 99 performance / 100 accessibility, with 1.1 s LCP and CLS 0.

Evidence and every finding-to-fix mapping: `.factory/polish-2.md`; screenshots
and reports: `.factory/evidence/polish-2/` (workspace evidence, intentionally
ignored by Git).

## Run and deploy

```sh
npm ci
npm run dev
npm run check
npm run build
/opt/fleet/lib/deploy-static.sh chore-rulebook dist
```

## Remaining work

None. The product is deployed as a static, offline-first PWA. There are no
known gaps.
