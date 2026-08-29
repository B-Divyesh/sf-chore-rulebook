# Independent product verification 2 — FAIL

- Work order: `chore-rulebook-verify-2`
- Candidate: `3d91586529857b03494780c18862fc8244596c68`
- Branch: `main`
- Live URL: <https://chore-rulebook.sociobot.in>
- Verified: 2026-08-29 UTC
- Result: **FAIL — do not release**

The checkout began clean and exactly at the requested commit. The live HTML,
service worker, manifest, application JS, and CSS match the candidate build by
SHA-256. This is not a stale-deployment result.

## Mandatory gates

### Claims gate — FAIL (release blocker)

`.factory/claims.json` exists with eight entries. Before any other product
inspection, after only `npm ci`, every listed command was run separately and
all eight exited 1:

| Claim | Initial clean-clone result |
| --- | --- |
| `offline-reload` | FAIL — web server readiness timed out after 60 seconds |
| `device-local` | FAIL — web server readiness timed out after 60 seconds |
| `json-export` | FAIL — web server readiness timed out after 60 seconds |
| `csv-export` | FAIL — web server readiness timed out after 60 seconds |
| `explain-assignment` | FAIL — web server readiness timed out after 60 seconds |
| `six-chore-tier` | FAIL — web server readiness timed out after 60 seconds |
| `qr-pairing` | FAIL — web server readiness timed out after 60 seconds |
| `demo-isolation` | FAIL — web server readiness timed out after 60 seconds |

Cause: every claim invokes `npm run test:claims`, whose Playwright server runs
`vite preview`. A clean clone has no `dist/`; Vite listens on port 4173 but
returns HTTP 404, so Playwright never considers the server ready. None of the
declared claim commands builds first. This violates the explicit requirement
that every listed command pass from the clean clone and is release-blocking
regardless of later results.

After `npm run check` produced `dist/`, `npm run test:claims` passed 8/8 in
12.0 seconds. The behaviors are implemented, but the recorded claim commands
do not run as declared from the required starting state.

### Cold first-read and demo gate — PASS

Cold-read interpretation: Chore Rulebook rotates recurring work and records
completions for households using one shared device. The first click is **Try it
with sample data**, which opens a ready-made household.

The live first screen states all three in plain words. The sample action and
all three facts are visible within the first 390 × 844 viewport. `/demo` opens
Cedar House in one click with a persistent sample-data banner, Reset demo, and
Start for real.

## Defects

### Blocker

1. **All eight claim commands fail from the required clean-clone state.** See
   the claims gate above. The test script needs to build the preview artifact
   itself or serve a development build; relying on an undeclared prior build
   makes the manifest non-executable as written.
2. **Visitor-facing claims remain outside `.factory/claims.json`.** Examples
   include “Existing Plus licenses add unlimited chores,” “The token alone is
   sent” during license verification, and “no accounts, ads, analytics, or
   household-data server.” The `device-local` claim is expressly limited to the
   free workflow and only checks request origins; it does not prove these
   broader statements. Fixed-owner persistence and missed-turn advancement are
   also stated in the product/README but are not registered claims. Under the
   claims contract, unlisted reliance claims fail review until listed with
   observable tests or removed.

### High

1. **The researched one-time purchase cannot be bought.** A fresh request to
   `https://api.sociobot.in/api/v1/products/chore-rulebook/checkout` returns
   HTTP 404 and `{"error":"enabled factory product","status":404}`. The UI
   honestly removes the dead purchase link and says new Plus purchases are not
   available, but the brief's one-time monetization requirement remains
   undelivered. Existing-license verification does work.

### Medium

1. **The loaded home-page title violates the required title pattern.** The
   contract requires `Product name — what it does`; the live title becomes
   `Know whose turn it is—and why — Chore Rulebook`. The source HTML initially
   has the compliant order, but client rendering replaces it. Demo, Privacy,
   and Terms titles follow their route-specific patterns.

## Passing evidence

### Install, tests, type check, and production build

```text
npm ci                    PASS — 90 packages, 0 vulnerabilities
npm run check             PASS
  Vitest                  PASS — 10/10
  TypeScript lint         PASS
  production build       PASS — dist/index.html produced
  Playwright              PASS — 42/42, desktop and 390px mobile
npm run test:claims       PASS — 8/8 only after the build existed
```

The exact production build generated:

- Initial JS: 42.89 KB raw / 14.99 KB gzip
- Lazy QR JS: 25.88 KB raw / 10.06 KB gzip
- CSS: 21.03 KB raw / 5.49 KB gzip
- Mobile hero: 16.74 KB; large hero: 34.85 KB

All are within the supplied budgets.

### Independent live workflow

A separate live Playwright suite passed 10/10 across desktop and 390px after a
verifier-locator correction. It covered:

- one-click Cedar House demo and persistent demo warning;
- availability changes and assignment explanations;
- blank chore-name recovery;
- rejected interval `0`, accepted limits of 1/365 days and 5/600 minutes;
- rotating and fixed-owner chores;
- the six-chore free limit and blocked seventh attempt;
- completion with a factual note, persisted history, JSON, and CSV downloads;
- keyboard skip link, dialog Escape/focus return, route Back/focus restoration;
- reduced-motion styles, mobile containment, legal routes, and a real HTTP 404;
- fresh service-worker install and offline `/demo` reload after HTTP-cache
  eviction.

The repository's demo-isolation claim also passed after build: resetting
`demo:chore-rulebook` did not change the real `chore-rulebook` database.

### Accessibility and visual QA

- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/demo`: HTTP 200, title,
  `lang=en`, one `<h1>`, `<main>`, all image alt attributes, labeled buttons,
  and zero console/page errors.
- Independent axe scans found zero serious/critical issues in Today, People,
  Chores, History, and Data on both desktop and 390px.
- Keyboard-only skip, navigation, switches, dialogs, and focus restoration
  worked. Focus rings are visible and reduced motion is effectively instant.
- Visible controls in every populated view met 44px sizing; only intentionally
  hidden native switch/file inputs measured smaller than their labeled targets.
- Full-page desktop and mobile review found no clipping, horizontal document
  overflow, or unreadable first-screen copy.

### Privacy, headers, routing, and server behavior

- The complete free demo workflow contacted only
  `https://chore-rulebook.sociobot.in`; it produced no analytics or third-party
  runtime requests and no console errors.
- Invalid-license restore made one explicit GET to the documented Sociobot
  verify endpoint, with the token in the query and no request body. It returned
  200, `Cache-Control: no-store`, origin-specific CORS, and a clear recoverable
  `That license is not active for Chore Rulebook.` error.
- The verification API allowed 30 requests in one burst. Request 31 returned
  429 with `Retry-After: 3` and `X-RateLimit-After: 3`.
- Live HTML routes send CSP with `frame-ancestors 'none'`, X-Frame-Options
  `DENY`, nosniff, strict referrer policy, and disabled camera/geolocation/
  microphone permissions. Hashed JS/CSS use one-year immutable caching.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown path returns
  the designed 404 body with HTTP 404. All visible site links resolve.
- There is no sign-in flow, backend household store, runtime AI feature, or
  library/CLI surface, so those conditional checks do not apply.

### PWA, deployment identity, and performance

- Chrome reports no manifest or installability errors despite the host's
  generic manifest MIME type.
- The active live worker is `/sw.js`; cache `rulebook-v1.0.3-shell` contains
  all shell routes, icons, images, and the exact hashed JS/CSS.
- A controlled old-worker-to-candidate update displayed `An update is ready.
  Reload to use it.` and a Reload action.
- Local/live SHA-256 values match for `index.html`, `sw.js`,
  `manifest.webmanifest`, `assets/index-CF8PCtAc.js`, and
  `assets/index-H9_G6Qlq.css`.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100,
  SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 90 ms, CLS 0, total transfer 60 KiB.

## Release decision

**FAIL.** The live product is substantially repaired and its implemented core
workflow works, but the mandatory clean-clone claims gate fails eight times.
Unlisted claims and the unavailable one-time purchase are additional contract
failures.
