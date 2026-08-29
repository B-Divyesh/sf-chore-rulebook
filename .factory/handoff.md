# Repair handoff — Chore Rulebook 1.0.4

- Work order: `chore-rulebook-repair-2`
- Verifier report: `aed7c245be0cd5dd838e5c1295cad8e64a8b97ec`
- Repaired candidate: `3d91586529857b03494780c18862fc8244596c68`
- Implementation commit: `7ff55e3dfd99b1a4adaff190a8bf126eb02ebb83`
- Deployment: Azure Static Web Apps, static artifact from `./dist`
- Live URL: <https://chore-rulebook.sociobot.in>
- Deployed: 2026-08-29 UTC
- Result: **PASS — verifier blockers repaired**

## Repairs

1. Every claim command now runs `npm run build` through the
   `pretest:claims` lifecycle hook. It no longer depends on an existing
   `dist/` directory.
2. `.factory/claims.json` now registers the previously unlisted fixed-owner,
   missed-turn, Plus-limit, license-request, private-runtime, and purchase
   statements. Each has one exact `@claim:<id>` browser regression. A unit
   policy test enforces manifest/test parity.
3. Household Plus is available again. A live one-time $12 Dodo product and its
   enabled Sociobot factory-product record were registered. The Data view now
   links to the hosted checkout, while license restore and free export remain
   available.
4. The loaded home title is now `Chore Rulebook — clear household rotations`,
   preserving the required product-first pattern. Demo, Privacy, and Terms keep
   their route-specific titles.
5. The release version, manifest start URL, service-worker cache, README, and
   legal purchase copy were advanced together to 1.0.4.

The researched brief, artifact class, visual system, local data model, and all
previously passing household behavior were preserved.

## Clean and automated verification

```text
npm ci                    PASS — 90 packages, 0 vulnerabilities
npm test                  PASS — 12/12 Vitest unit and release-policy tests
npm run lint              PASS — TypeScript project check
npm run build             PASS — dist/index.html produced
npm run check             PASS — 12/12 unit + lint + build + 54/54 Playwright
npm run test:claims       PASS — build from script + 14/14 claims
each claims.json command  PASS — all 14 run separately, each rebuilt first
```

Production bundle:

- Initial JS: 43.17 KB raw / 15.23 KB gzip
- Lazy QR JS: 25.88 KB raw / 10.17 KB gzip
- CSS: 21.03 KB raw / 5.48 KB gzip
- Mobile hero: 16.74 KB; large hero: 34.85 KB
- Total deployed artifact: 631,428 bytes

## Browser, accessibility, and copy

- Playwright passed on desktop Chromium and a 390 × 844 mobile viewport.
- The browser matrix covers useful workflow, malformed inputs, import recovery,
  persistence, routing/back, keyboard dialogs, focus return, 44 px targets,
  reduced motion, responsive containment, offline reload, and all claims.
- Playwright axe found zero serious or critical issues in Today, People,
  Chores, History, and Data on both viewports.
- `/opt/fleet/lib/verify-url.sh` passed live `/`, `/demo`, `/privacy`, and
  `/terms`: HTTP 200, correct titles, `lang=en`, one `<h1>`, `<main>`, complete
  image alt attributes, labeled buttons, and zero console/page errors.
- Full-page desktop and 390 px screenshots were visually inspected. The first
  actions and three facts remain visible in the first mobile viewport; no
  horizontal overflow was found.
- `.factory/copy-audit.md` remains clean: no landing sentence exceeds 22 words
  and no banned marketing word is present.

## Claims, privacy, PWA, and billing

- All 14 claim IDs pass from `/demo`: `offline-reload`, `device-local`,
  `json-export`, `csv-export`, `explain-assignment`, `six-chore-tier`,
  `qr-pairing`, `demo-isolation`, `fixed-owner`, `missed-turn-advance`,
  `plus-unlimited-chores`, `license-token-only`, `private-runtime`, and
  `plus-purchase`.
- The complete free live workflow requested only
  `https://chore-rulebook.sociobot.in`; no console errors or third-party
  runtime resources appeared.
- License regression evidence is an explicit GET with one `license` query
  value and no body or household text.
- The live catalog lists `chore-rulebook` at 1,200 USD minor units. A fresh
  checkout request returns HTTP 303 to
  `https://checkout.dodopayments.com/session/...`.
- A live 390 px browser installed `rulebook-v1.0.4-shell`. Its cache contains
  every route, icon, image, and both hashed JS/CSS assets.
- After clearing the HTTP cache and taking the context offline, `/demo`
  reloaded with the demo banner and People view intact.
- A controlled v1.0.4 worker replacement displayed `An update is ready. Reload
  to use it.` and a visible Reload action.

## Live deployment and response policy

- Azure deployment ID: `03a32fee-0220-4682-97d2-7a9d07f58f62`
- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns
  the designed 404 body with HTTP 404.
- HTML responses send CSP with `frame-ancestors 'none'`, X-Frame-Options
  `DENY`, nosniff, strict referrer policy, and camera/geolocation/microphone
  disabled. Hashed JS/CSS return one-year immutable caching.
- SHA-256 identity matched between local `dist/` and production for
  `index.html`, `sw.js`, `manifest.webmanifest`, `assets/index-z-GphHpg.js`,
  and `assets/index-H9_G6Qlq.css`.
- Live mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 0 ms, CLS 0, transfer 61 KiB.

## Run and deploy

```sh
npm ci
npm run check
npm run test:claims
/opt/fleet/lib/deploy-static.sh chore-rulebook dist
```

## Known gaps

No release-blocking product gap remains. Verification stopped at the hosted
checkout page and did not submit a real payment, so no customer charge or live
refund was created. Checkout creation, return URL configuration, license
capture/verification, cached unlock, revocation behavior, and restore UI are
covered without charging a card.
