# Repair handoff — Chore Rulebook polish 1

- Work order: `chore-rulebook-polish-1`
- Repaired candidate: `97e365f518aec83d61f1d7bc0804ab4b3547286a`
- Review base: `0a3029b012195b45c7ea31c3b279b52e6c15ec74`
- Product repair commits: `c7a2e63`, `6112801`
- Deployed product commit: `6112801`
- Final deployment ID: `c60fcc54-e17b-4b9c-9e02-f0578180e103`
- Live URL: <https://chore-rulebook.sociobot.in>
- Result: **PASS — no known gaps**

## What changed

- Added the Static Web Apps `.webmanifest` MIME mapping and a regression test.
- Rebuilt the HTTP 404 page with the product header, legal links, footer,
  metadata, plain heading, responsive layout, and the existing signal-desk
  identity.
- Replaced the decorative hero slogans with a concrete sample description and
  removed the generic footer slogan.
- Rewrote the README offline sentence and removed its unlisted setup claim.
- Added `.factory/catalog-description.txt` with a 99-character verb-first line.
- Bumped the app, manifest, and service-worker cache to `1.0.6`.
- Added route title/canonical, focus, 404, reviewed-copy, and mobile-overflow
  regressions. The live cold audit found a 7px decorative overflow; the second
  repair contains the signal accents within the 390px viewport.
- Kept all 16 claims registered in `.factory/claims.json`; the offline claim now
  creates and closes its own browser context.

Every review finding is mapped to evidence in
[`polish-1.md`](polish-1.md).

## Clean-clone verification

Final clone: `/tmp/chore-rulebook-final.zQeBzq`, cloned from `6112801` with no
working-tree changes, followed by `npm ci`.

- `npm run check`: pass.
  - Vitest: 15/15 unit and deployment-policy tests.
  - TypeScript: pass.
  - Production build: pass; `dist/index.html` present.
  - Playwright: 64/64 desktop and 390px mobile tests.
- Every exact `.factory/claims.json` command: 16/16 pass independently:
  `offline-reload`, `device-local`, `json-export`, `json-restore`, `csv-export`,
  `explain-assignment`, `six-chore-tier`, `qr-pairing`, `demo-isolation`,
  `fixed-owner`, `missed-turn-advance`, `plus-unlimited-chores`,
  `license-token-only`, `private-runtime`, `plus-purchase`, and
  `license-revocation`.
- Build payload: application JS 69.52 KB raw total (25.88 + 43.64 KB), CSS
  21.08 KB raw, mobile hero WebP 16.74 KB. These are below the 200/50/300 KB
  budgets.

## Live verification after final deployment

- Factory verifier passed `/`, `/demo`, `/privacy`, and `/terms`: HTTP 200,
  correct titles, `lang=en`, one h1, main landmark, alt coverage, and no console
  or page errors. Screenshots and reports are under
  `.factory/evidence/polish-1/{root,demo,privacy,terms}/`.
- Cold 390px contexts for every application route reported exactly 390px
  document width, correct title/h1/canonical, no console errors, and zero
  serious/critical axe findings.
- A real unknown URL returned HTTP 404 with title `Page not found — Chore
  Rulebook`, the complete skeleton and legal links, 390px fit, and zero
  serious/critical axe findings. The browser reports the expected network
  diagnostic for the intentional 404 status; there are no application errors.
- The live manifest returns `content-type: application/manifest+json`; see
  `.factory/evidence/polish-1/manifest-headers.txt`.
- Live demo isolation passed: real `Live Isolation Home` data survived demo
  entry/reset/exit; `demo:chore-rulebook` was removed on exit; no external
  request occurred.
- Live routing passed: People, Privacy, and Back each moved focus to the new h1,
  and Back restored `People and availability`.
- Live offline passed after clearing the HTTP cache and disabling the network:
  `/demo` reloaded with its banner and Today view.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.1s, CLS 0, total blocking time 0ms. Report:
  `.factory/evidence/polish-1/lighthouse-mobile.json`.
- Consolidated live assertions:
  `.factory/evidence/polish-1/live-audit.json`.
- 404 screenshots:
  `.factory/evidence/polish-1/404-mobile.png` and
  `.factory/evidence/polish-1/404-desktop.png`.

## Run and deploy

```sh
npm ci
npm run check
npm run test:claims -- --grep @claim:<id>
npm run build
```

Static deployment uses `./dist` and the factory work-order command:

```sh
/opt/fleet/lib/deploy-static.sh chore-rulebook /work/repo/dist
```

## Known gaps and next steps

None. No review finding or additional cold-live finding remains unresolved.
