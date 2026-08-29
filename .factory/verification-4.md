# Independent product verification 4 — PASS

- Work order: `chore-rulebook-verify-4`
- Tested commit: `97e365f518aec83d61f1d7bc0804ab4b3547286a`
- Branch: `main`
- Live URL: <https://chore-rulebook.sociobot.in>
- Verified: 2026-08-29 UTC
- Result: **PASS — release candidate accepted**

This was a fresh verification of the requested commit. The checkout was clean
before installation. The live deployment is the requested candidate: every
downloadable local production artifact matched its live counterpart byte for
byte (22 files: HTML, worker, manifest, hashed JS/CSS, icons, imagery, 404,
sitemap, and robots). `staticwebapp.config.json` correctly is not public.

## Mandatory gates

### Claims — PASS

Immediately after `npm ci`, every exact command in `.factory/claims.json` ran
separately through the `/demo` sandbox. Each passed 1/1, using its declared
production build pre-step:

| Claim IDs |
| --- |
| `offline-reload`, `device-local`, `json-export`, `json-restore` |
| `csv-export`, `explain-assignment`, `six-chore-tier`, `qr-pairing` |
| `demo-isolation`, `fixed-owner`, `missed-turn-advance`, `plus-unlimited-chores` |
| `license-token-only`, `private-runtime`, `plus-purchase`, `license-revocation` |

The manifest has one uniquely tagged regression per ID. It now covers the
valid JSON restore and revoked-license behavior that blocked the prior review.

### Cold first read and demo — PASS

Cold-read result: Chore Rulebook is a shared-device rulebook for households
that rotate recurring chores, see why a person is assigned, and retain a
completion history. The first click is **Try it with sample data**, opening the
ready-made Cedar House rulebook at `/demo`.

The first screen plainly gives the audience and result: “For households sharing
recurring chores, it rotates clear assignments and records what was done.” At
390 × 844, the sample action, real setup action, and all three facts fit in the
first viewport (facts bottom: 635px). Demo mode shows its persistent
sample-data notice, Reset demo, and Start for real; `.factory/demo.md` records
the isolated `demo:chore-rulebook` IndexedDB namespace.

## Local checks — PASS

```text
npm ci          PASS — 90 packages; 0 vulnerabilities
npm run check   PASS
  Vitest        12/12
  TypeScript    PASS
  production    PASS — dist/ produced
  Playwright    60/60 across desktop and 390px mobile
```

Initial JS is 43.69 KB raw / 15.39 KB gzip; the lazy QR chunk is 25.88 KB /
10.17 KB gzip; CSS is 21.03 KB / 5.48 KB gzip; no font files ship. Live mobile
Lighthouse 13.4.1 on `/demo`: Performance 100, Accessibility 100, Best
Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 0 ms, CLS 0, transfer 56 KiB.

## Independent live checks — PASS

- Keyboard-only setup opened a dialog with Enter, closed on Escape, and restored
  focus to its trigger. Numeric constraints reject zero and accept the maximum
  interval (365 days) and effort (600 minutes).
- The sample explanation named household order, skipped the one away person,
  and stated the missed-turn rule. Normal completion/history, fixed owner,
  exports, valid import/reload, six-chore limit, and Plus behaviors passed in
  the browser suite and claim regressions.
- A malformed `{not json` import retained the rulebook, stayed on Data,
  returned focus to Import JSON, and said: “This file is not valid JSON. Choose
  a Chore Rulebook JSON backup and try again.”
- Free-flow request logging recorded only `https://chore-rulebook.sociobot.in`.
  There were no account controls, analytics, CDN/third-party requests, console
  errors, or page errors.
- Axe WCAG A/AA scans had zero serious/critical findings in Today, People,
  Chores, History, and Data at 1440px and 390px. Each view had no horizontal
  overflow; reduced-motion transitions computed to `0.00001s`.
- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/demo`: 200, titles,
  `lang=en`, one `h1`, `main`, complete image alternatives, labeled buttons,
  and no console/page errors.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200. An unknown path returned
  the styled 404 with HTTP 404. CSP includes `frame-ancestors 'none'`; X-Frame-
  Options, nosniff, strict referrer policy, permissions policy, and immutable
  hashed-asset caching are live.
- The real $12 purchase gateway returned HTTP 303 to Dodo checkout. No sign-in
  or household backend exists, so Entra-ID and backend checks do not apply.
- API allowance is enforced: 30 sequential invalid-license verification
  requests returned 200; request 31 returned 429 with `Retry-After: 4` and
  `X-RateLimit-After: 4`.

## PWA checks — PASS

The live app activated `/sw.js` with cache `rulebook-v1.0.5-shell`. After an
online demo visit, worker readiness, and browser HTTP-cache eviction, an
offline `/demo` reload rendered Cedar House and the demo banner without errors.
A controlled old-worker-to-live-worker update simulation displayed “An update
is ready. Reload to use it.” and its Reload action, exercising the candidate's
real update path.

## Defects

### Low

1. **Generic manifest MIME type.** The live `/manifest.webmanifest` response
   is `application/octet-stream`, not a manifest JSON type. Chromium parsed it,
   activated the worker, and passed the offline/installability path, so this is
   not release-blocking. Configure the host to serve `.webmanifest` as
   `application/manifest+json` (or `application/json`) in a follow-up.

No blocker, high, or medium defects were found.

## Release decision

**PASS.** The live product is the requested commit and meets the local-first
household chore contract: named people, recurrence/effort, rotation or fixed
ownership, explanations, local history/export, one-click sandbox demo, and
offline use without accounts or tracking.
