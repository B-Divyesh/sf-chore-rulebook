# Repair handoff — Chore Rulebook 1.0.5

- Work order: `chore-rulebook-repair-3`
- Verifier base: `6f09a18f6e981e2df93ff55d936a856ffa4425d3`
- Repaired candidate: `262e5ef1562eb0385ab12e4c8726a9d759c04008`
- Live URL: <https://chore-rulebook.sociobot.in>
- Deployed: 2026-08-29 UTC
- Result: **ready for release**

## Fixed findings

1. Registered the visitor-facing JSON restore capability as `json-restore`.
   Its browser regression exports Cedar House, changes Alex’s availability,
   imports the valid export, and proves the restored value survives reload.
2. Registered refunded/revoked-license behaviour as `license-revocation`.
   The regression starts with a stale cached-valid Plus verdict, receives the
   billing contract response `{ "valid": false, "reason": "revoked" }`,
   observes the optimistic Plus UI lock, then proves a seventh chore is stopped
   by the free limit.
3. Reproduced the verifier’s exact `{not json` import before the fix. It had
   displayed Chromium’s `Expected property name or '}' ...` parser text. It now
   says: `This file is not valid JSON. Choose a Chore Rulebook JSON backup and
   try again.` The recovery keeps the current rulebook, leaves the Data view in
   place, clears the file selection, and returns focus to **Import JSON**.
4. Bumped the PWA shell, manifest start URL, and visible build identifier to
   `1.0.5` so an installed 1.0.4 app receives the repaired worker.

## Verification evidence

### Clean install, unit/type/build, and browsers

```text
npm ci                 PASS — 90 packages, 0 vulnerabilities
npm run check          PASS
  Vitest               PASS — 12/12
  TypeScript lint      PASS
  production build     PASS — dist/index.html produced
  Playwright           PASS — 60/60 (desktop and 390 × 844 mobile)
```

All 16 declared commands in `.factory/claims.json` were run independently
after the clean install. Every command ran its production build pre-step and
passed 1/1, including `json-restore` and `license-revocation`.

The browser suite covers keyboard skip and dialog focus return, malformed and
typed-import recovery, desktop/mobile containment and 44px controls,
reduced motion, legal routes, offline reload, local data persistence, exports,
demo isolation, Plus limits, and axe WCAG A/AA scans. Axe found zero serious
or critical issues in the empty state and every populated product view.

`/opt/fleet/lib/verify-url.sh` passed both the deployed `/` and `/demo`: HTTP
200, route title, `lang=en`, one `<h1>`, `<main>`, complete image alternatives,
labeled buttons, and no console/page errors.

### Privacy, PWA, routes, and live identity

- A fresh 390px live demo recorded only
  `https://chore-rulebook.sociobot.in` requests, no console/page errors, and
  no horizontal overflow.
- Its live worker controlled the page with cache `rulebook-v1.0.5-shell`.
  After an online controlled reload and HTTP-cache eviction, an offline `/demo`
  reload showed the sample banner and `OFFLINE · SAVED HERE`.
- A local controlled old-worker simulation displayed `An update is ready.
  Reload to use it.` and installed the `rulebook-v1.0.5-shell` worker.
- Live `/`, `/demo`, `/privacy`, and `/terms` returned 200. An unknown route
  returned the designed 404 with HTTP 404. The live CSP includes
  `frame-ancestors 'none'`; `X-Frame-Options: DENY`, `nosniff`, strict referrer
  policy, and immutable hashed-asset caching were present.
- The deployed build byte-matches the local production artifact:

| File | SHA-256 |
| --- | --- |
| `index.html` | `0143b3a268f6bc91c79dd1a5e7bf38755d2fe4aa029c8aa2f75ee4f0c3700159` |
| `sw.js` | `ee1b42bf815d840fd9d20fc581c3da04c8beeac9c3aa9cf96617ecab32ab931d` |
| `manifest.webmanifest` | `e4d19a460d9e3b40d18f270487967bebb6c86b40b9222ce1080e032856acfc25` |
| `assets/index-DSDzeoAV.js` | `1a2a2403c6f6738062f576ddb8423731517fb96b91fb32f5f8240f1fb9ee4707` |
| `assets/index-H9_G6Qlq.css` | `d14fb108a68ef886d761856d8c08bbfff28207736905cee954c92e57c0f6cc5e` |
| `assets/browser-CqDbEFy1.js` | `03a9784ea221aef7a49668c5fd0684197ffbb6e6d401416a7324edb59b8f26be` |
| `404.html` | `c31f961bef524b24e4ce0fa5136f61f8be2792da253aced0725e97c78faa29dc` |

### Performance

Live mobile Lighthouse 13.4.1 on `/demo`:

```text
Performance 100 · Accessibility 100 · Best practices 100 · SEO 100
FCP 970 ms · LCP 1068 ms · TBT 22 ms · CLS 0 · transfer 59,581 bytes
```

Production output: initial JS 43.69 KB raw / 15.39 KB gzip; lazy QR JS 25.88
KB raw / 10.17 KB gzip; CSS 21.03 KB raw / 5.48 KB gzip. These remain inside
the static PWA budgets.

## Deployment

Deployed with `/opt/fleet/lib/deploy-static.sh chore-rulebook dist` to the
existing Azure Static Web App `sf-chore-rulebook` in `centralus`.
Deployment `0fd50f06-1a24-467d-ae1d-b8854c0f951d` completed successfully and
the custom domain returned HTTPS 200.

## Run locally

```sh
npm ci
npm run check
npm run test:claims -- --grep @claim:json-restore
npm run test:claims -- --grep @claim:license-revocation
```

For the full claims manifest, run each command from `.factory/claims.json`
independently; each builds the preview itself.

## Known gaps and next steps

There are no known release-blocking product gaps. The revocation regression
uses the documented billing verification response rather than creating a live
refund, because a live refund would create a real external financial event. No
runtime AI, backend household service, library package, or CLI applies to this
local-first static PWA.
