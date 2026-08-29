# Repair handoff — Chore Rulebook 1.0.3

- Work order: `chore-rulebook-repair-1`
- Repaired candidate: `ce03cac95516b3c016f02c027c3db63bffabb469`
- Verifier report: `01bbfee2be7d6fe67532ffeb2fcafb776a863ba4`
- Live URL: <https://chore-rulebook.sociobot.in>
- Verified: 2026-08-29 UTC
- Result: release-blocking repository findings repaired; production deployed and verified

## Repairs

- Added `.factory/claims.json` with eight independently runnable demo-based claims and one exact Playwright test per claim.
- Added a one-click `/demo`, realistic Cedar House data, `demo:chore-rulebook` storage isolation, a persistent demo banner, reset, and start-for-real actions. Added `.factory/demo.md`.
- Reworked the first screen around one visible job-focused `<h1>`, a 14-word audience sentence, two clear first actions, and three facts visible at 390×844.
- Removed the dead checkout link and purchase offer. Existing-license restore and its previously passing verification behavior remain. The UI now states that new purchases are unavailable.
- Replaced shallow import checks with deep type, range, enum, identifier, and date validation. Invalid legacy state now opens a recoverable empty rulebook instead of crashing.
- Build injection now precaches the exact hashed application JS and CSS. Offline reload passes after clearing the HTTP cache on both local and live production origins.
- Added the missing file-input label and populated axe scans across Today, People, Chores, History, and Data on desktop and mobile.
- Back/forward now derives the view from the URL and restores the matching screen and focus.
- Whitespace-only household, person, and chore names now produce specific form errors and are never stored.
- Pairing snapshots use browser-native deflate compression. A six-chore, 40-completion state draws and round-trips within QR capacity.
- Fixed full-width hidden switches, mobile rules-table overflow, dialog sizing and touch submission, 44px brand/summary/footer targets, and viewport containment.
- Added Static Web Apps routes, CSP/frame policy, immutable hashed-asset caching, security headers, a designed 404, canonical/Open Graph/Twitter metadata, social art, Apple touch icon, factory attribution, and visible build ID.
- Added `.factory/copy-audit.md`; updated README, sitemap, manifest, visual provenance, and legal copy.

## Exact verification evidence

Clean install and release gate:

```text
npm ci              PASS — 90 packages, 0 vulnerabilities
npm run check       PASS
  Vitest            PASS — 10/10
  TypeScript lint   PASS
  production build  PASS — dist/index.html present
  Playwright        PASS — 42/42, desktop Chromium + 390×844 mobile
```

Every command in `.factory/claims.json` was run separately from a fresh Chromium context. All eight passed: offline reload, device-local requests, JSON export, CSV export, assignment explanation, six-chore tier, realistic QR pairing, and demo isolation.

Accessibility and browser evidence:

- Playwright axe integration: zero serious or critical findings on empty and populated views, including Data, at desktop and 390px.
- Keyboard: skip link first, Enter/Space controls, native dialog Escape/focus return, route focus, and no traps passed.
- Touch/layout: People and Chores document widths equal the viewport; tested brand, assignment disclosure, and legal links are at least 44px high.
- Reduced motion remains an instant-state treatment.
- `/opt/fleet/lib/verify-url.sh` passed for local and live `/` and `/demo`: title, `lang=en`, one `<h1>`, `<main>`, alt text, labels, and zero console/page errors.
- Visual review completed from full-page desktop and 390×844 screenshots. The first actions and all three facts are inside the first mobile viewport.

Performance and package evidence:

```text
Initial JS       42.89 KB raw / 15.11 KB gzip
Lazy QR JS       25.88 KB raw / 10.17 KB gzip
CSS              21.03 KB raw / 5.48 KB gzip
Social image     130 KB
Lighthouse live  performance 100 / accessibility 100 / best practices 100 / SEO 100
                 FCP 1.0 s / LCP 1.1 s / TBT 0 ms / CLS 0
```

PWA and policy evidence:

- Fresh live context cached `rulebook-v1.0.3-shell`, including the exact deployed hashed JS and CSS. After CDP HTTP-cache eviction and offline mode, `/demo` reloaded with its sample and no errors.
- A controlled 1.0.2→1.0.3 service-worker update displayed `An update is ready. Reload to use it.` with a Reload action.
- Live `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown path returns the designed 404 body with HTTP 404; `/404` displays the same designed page.
- Live responses include CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and strict referrer policy.
- The deployed hashed JS returns `Cache-Control: public, max-age=31536000, immutable`.
- Live and local `index.html` SHA-256 match: `b8f08f405c16444e11416a63b37e61cdc91bf6601bf0031519c0b2c9c7f23747`.
- Free demo actions contact only the product origin. Existing-license verification remains limited to `https://api.sociobot.in` and sends no household data.

## Run and verify

```sh
npm ci
npm run check
node -e "for (const claim of require('./.factory/claims.json')) console.log(claim.test)"
npm run preview
```

Deploy output remains `./dist` with `index.html` at its root. Deployment uses:

```sh
/opt/fleet/lib/deploy-static.sh chore-rulebook /work/repo/dist
```

## Known external gap

The Sociobot billing product is not registered: its checkout endpoint still returns HTTP 404. Repository workers are forbidden to change billing infrastructure, so this release does not advertise or link that checkout. Existing Plus licenses still verify and work. Register the billing product in the factory before restoring the $12 purchase copy and checkout link.
