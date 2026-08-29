# Independent verification 6 — Chore Rulebook

- Work order: `chore-rulebook-verify-6`
- Candidate commit: `19ad45d05cc827f38c6d14a2cb559865f1ea026a`
- Candidate subject: `docs: record polish 2 verification`
- Live URL: <https://chore-rulebook.sociobot.in>
- Date: 2026-08-29 UTC
- Result: **PASS**

## Release gate: claims from a clean checkout

Started at the candidate commit with a clean worktree and ran `npm ci` (91
packages audited, 0 vulnerabilities). `.factory/claims.json` exists and has
16 entries. Each exact declared command was run separately, each rebuilding
and using its fresh Playwright `/demo` sandbox:

```sh
npm run test:claims -- --grep @claim:offline-reload
npm run test:claims -- --grep @claim:device-local
npm run test:claims -- --grep @claim:json-export
npm run test:claims -- --grep @claim:json-restore
npm run test:claims -- --grep @claim:csv-export
npm run test:claims -- --grep @claim:explain-assignment
npm run test:claims -- --grep @claim:six-chore-tier
npm run test:claims -- --grep @claim:qr-pairing
npm run test:claims -- --grep @claim:demo-isolation
npm run test:claims -- --grep @claim:fixed-owner
npm run test:claims -- --grep @claim:missed-turn-advance
npm run test:claims -- --grep @claim:plus-unlimited-chores
npm run test:claims -- --grep @claim:license-token-only
npm run test:claims -- --grep @claim:private-runtime
npm run test:claims -- --grep @claim:plus-purchase
npm run test:claims -- --grep @claim:license-revocation
```

All 16 passed. `test-results/.last-run.json` records `status: passed` and no
failed tests. The claim tests contain exactly one corresponding tagged test for
each of the 16 IDs. This satisfies the mandatory claims gate; no missing or
failing claim is present.

## First read and demo

A cold, new-browser visit to `/` answered the three required questions in
plain words:

- **What:** “Know whose turn it is—and why”; the description says it rotates
  recurring household chores, explains assignments, and keeps local history.
- **For whom:** “For households sharing recurring chores”.
- **First action:** the visible one-click **Try it with sample data** link,
  with the adjacent explanation “The sample opens a ready-made household.”

The same first screen shows the three factual lines: stored on this device,
works offline after the first visit, and free for six chores. Clicking the
sample action opened `/demo` immediately with four realistic chore cards and
the persistent banner: “Demo — sample data, nothing is saved to your
rulebook”, plus **Reset demo** and **Start for real**.

## Local quality gates

All commands passed at the candidate:

```sh
npm test          # 15 Vitest tests passed
npm run lint      # tsc -b --pretty false passed
npm run build     # produced dist/
npm run test:e2e  # full Playwright suite passed
```

The production build contains 43.97 kB application JS (15.40 kB gzip),
25.88 kB browser JS (10.17 kB gzip), and 21.60 kB CSS (5.57 kB gzip). The
initial JS total is 69.85 kB raw / 25.57 kB gzip and CSS is inside its 50 kB
budget.

## Independent live product exercise

- In a fresh live demo, the first assignment explanation said: “Alex follows
  Bo in household order. 1 away person was skipped.” It also explained the
  missed-interval state. Recording its completion increased the history from
  four sample records to five, with no console or page errors.
- In a fresh real-mode context, a whitespace-only household name showed the
  recovery error “Enter a household name using letters or numbers.” A valid
  household then accepted a boundary chore of 365 days and 600 minutes.
  Importing malformed JSON gave the actionable recovery text “This file is not
  valid JSON. Choose a Chore Rulebook JSON backup and try again.”
- Keyboard-only: Enter opened the setup dialog, Escape closed it, and focus
  returned to its trigger. The focused trigger has a visible `3px` solid
  `rgb(255, 204, 102)` outline.
- At a 390 px viewport, every populated live view (Today, People, Chores,
  History, Data) measured 390 px document scroll width against a 390 px
  viewport; there was no horizontal overflow or console/page error.
- Live axe scans at WCAG 2 A/AA found **zero serious or critical violations**
  in each of those five populated views. Reduced-motion and responsive checks
  were performed in the mobile context.
- The required `verify-url.sh` check passed for `/`, `/demo`, `/privacy`, and
  `/terms`: each was HTTP 200, had a title, `lang=en`, exactly one h1, a main
  landmark, no images missing `alt`, no unlabeled buttons, and no browser
  errors. Evidence is under ignored `.factory/evidence/verification-6/`.

## Privacy, PWA, headers, and deployment identity

- The cold landing-to-demo free workflow made 8 requests, all to
  `https://chore-rulebook.sociobot.in`; there were no third-party, account,
  analytics, font-CDN, or household-data requests. No console or page errors
  occurred.
- HTML responses have HSTS, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, restrictive
  Permissions Policy, and a CSP restricting scripts/resources to self (with
  only the documented Sociobot billing API in `connect-src`/`form-action`).
  Hashed JS has `Cache-Control: public, max-age=31536000, immutable`.
- The live manifest is served as `application/manifest+json`, specifies
  standalone display, a versioned `/?v=1.0.7` start URL, and 192/512/maskable
  icons. After service-worker control, `registration.update()` left no waiting
  worker; the active cache was `rulebook-v1.0.7-shell`. An offline `/demo`
  reload still showed Today and the demo-isolation banner with no errors.
- SHA-256 comparisons were identical between the freshly rebuilt candidate and
  the deployed `index.html`, `404.html`, `manifest.webmanifest`, `sw.js`,
  `offline.html`, both application assets, and the browser asset. The live
  deployment is therefore the tested candidate artifact. A non-existent URL
  returns the designed HTTP 404 page.
- The only server-side product endpoint is the Sociobot licensing flow. 35
  sequential invalid-license verification requests showed HTTP 200 through
  request 30; request 31 and later returned HTTP 429 with `Retry-After: 3`
  (then 2 as the window elapsed). Observed allowance: **30 requests per client
  window**.

## Performance note

An independent Lighthouse invocation was attempted with the supplied
Chromium, but Lighthouse could not attach (`Unable to connect to Chrome`).
This is an environment-tool limitation, not an application error. The static
budget, mobile overflow, headers/caching, browser-error, and axe checks above
all passed.

## Defects

No critical, high, medium, low, or release-blocking product defects found.
