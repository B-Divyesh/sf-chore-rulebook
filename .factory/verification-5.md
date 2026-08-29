# Independent verification 5 — Chore Rulebook

- Work order: `chore-rulebook-verify-5`
- Candidate: `30952242d10933a0b8be121fff85968b90269899` (`docs: record polish verification and deployment`)
- Live URL: <https://chore-rulebook.sociobot.in>
- Date: 2026-08-29 UTC
- Result: **PASS**

## First read and demo

A cold visit to `/` returned HTTP 200 with no console/page errors. The first screen plainly says that it rotates recurring chores and records what was done, identifies households sharing chores, and presents the one-click **Try it with sample data** action. `/demo` immediately opens Cedar House sample data with the persistent “Demo — sample data, nothing is saved to your rulebook” banner. The first screen therefore answers what it does, who it is for, and what to click first.

## Clean-checkout gates

At the exact clean `HEAD`, `npm ci` succeeded. Every command listed in `.factory/claims.json` was then run separately through the shipped `/demo` entry point. All 16 passed: `offline-reload`, `device-local`, `json-export`, `json-restore`, `csv-export`, `explain-assignment`, `six-chore-tier`, `qr-pairing`, `demo-isolation`, `fixed-owner`, `missed-turn-advance`, `plus-unlimited-chores`, `license-token-only`, `private-runtime`, `plus-purchase`, and `license-revocation`.

The combined `npm run test:claims` also passed (16 tests, no failures). `npm run check` passed: Vitest 15/15, TypeScript check, production build, and Playwright 64 tests. `test-results/.last-run.json` records `status: passed` and no failed tests.

Build output: application JavaScript 69.52 kB raw (25.88 + 43.64), CSS 21.08 kB, mobile hero WebP 16.74 kB. All are inside the 200/50/300 kB budgets.

## Independent live exercise

- In a fresh `/demo` context, assignment explanation named ordered rotation and “1 away person was skipped”; Casey’s away state was visible. Recording a completion increased history from four sample rows to five.
- Keyboard Enter opened setup; Escape closed it and returned focus to the original setup button.
- A throwaway real household showed the plain error for a whitespace-only name. Browser validation rejected interval `0`; a 365-day / 600-minute chore added successfully.
- At 390 px, Today, People, Chores, History, and Data all measured `390/390` scroll width/viewport with no console errors. Axe found zero serious/critical WCAG 2 A/AA findings in every populated live view.
- `/`, `/demo`, `/privacy`, and `/terms` have titles, `lang=en`, one h1, and a main landmark. An unknown URL returns the designed HTTP 404 page.

## Privacy, PWA, deployment, and server evidence

- The free live demo workflow requested only `https://chore-rulebook.sociobot.in`; no analytics, account, font-CDN, third-party, or household-data request appeared. No console/page errors occurred.
- Browser responses have CSP, HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and restrictive Permissions Policy. Hashed JS/CSS are `max-age=31536000, immutable`.
- After worker control and clearing HTTP cache, offline `/demo` reload showed the demo banner and Today view. Active cache: `rulebook-v1.0.6-shell`; `registration.update()` completed with active worker and no waiting worker.
- Manifest is correctly served as `application/manifest+json`, with standalone display, matching palette, versioned start URL, and 192/512/maskable icons.
- Fresh SHA-256 comparisons matched local rebuilt and live `index.html`, both application chunks, CSS, browser chunk, `sw.js`, manifest, and 404 page byte-for-byte. The deployment matches the candidate artifact.
- Synthetic invalid-license requests reached HTTP 429 at request 31, with `Retry-After: 3` and `X-RateLimit-After: 3`: observed allowance is 30 requests per client window. Checkout returned HTTP 303 to registered Dodo checkout.

## Defects

No critical, high, medium, low, or release-blocking product defects found.

Fresh Lighthouse scores were not available: Lighthouse could not attach to the supplied headless Chromium (`Unable to connect to Chrome` / tab crash). This is a verification-environment limitation, not an application failure; browser, axe, network, and static budget checks above passed.
