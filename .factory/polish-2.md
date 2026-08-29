# Polish 2 finding closure — Chore Rulebook

- Review inputs: `.factory/review-1.md`, `.factory/polish-1.md`, and
  `.factory/review-2.md`
- Repair commit: `a6d0d74fa979bbcc8ada7d4c5cec893daeca48b3`
- Deployed URL: <https://chore-rulebook.sociobot.in>
- Deployment: `d62a2d5c-65ef-42e9-83e8-7c34aacf4012`

All cumulative findings are closed. Earlier fixed items were rechecked on the
deployed build rather than only carried forward from the previous handoff.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — manifest MIME | Kept the Static Web Apps MIME mapping and redeployed it. | Live `HEAD /manifest.webmanifest` returned `content-type: application/manifest+json`; release test `serves the install manifest with a web manifest content type`; <https://chore-rulebook.sociobot.in/manifest.webmanifest>. |
| F-1-2 — incomplete 404 | Preserved the designed plain-language 404, its complete header/footer, metadata, legal links, and current build id. | Playwright `designed 404 has metadata, legal links, mobile fit, and no serious accessibility violations`; live HTTP 404 in `.factory/evidence/polish-2/live-404-headers.txt`; screenshot `.factory/evidence/polish-2/live-404-mobile.png`; <https://chore-rulebook.sociobot.in/not-a-real-route>. |
| F-1-3 — slogan image caption | Kept the concrete sample caption in place. | Playwright `first screen has one job heading, both first actions, and three visible facts`; mobile screenshot `.factory/evidence/polish-2/live-root/screenshot-mobile.png`; <https://chore-rulebook.sociobot.in/>. |
| F-1-4 — generic footer slogan | Kept only the tested device-local data statement. | The first-screen regression rejects the old slogan; `.factory/copy-audit.md`; <https://chore-rulebook.sociobot.in/>. |
| F-1-5 — README offline jargon | Kept the plain outcome wording, “The app works offline after the first visit.” | `@claim:offline-reload` passed from the final clean clone and a live cold offline `/demo` reload rendered the banner and Today heading. |
| F-1-6 — unlisted setup claim | Kept the unsupported setup promise removed. | Vitest `keeps reviewed copy plain and ships a verb-first catalog sentence`; `.factory/copy-audit.md`; <https://chore-rulebook.sociobot.in/>. |
| F-2-1 — inconsistent header | Added the same compact **Demo / Privacy / Terms** site navigation to landing, demo, and legal application routes; aligned the 404 navigation label and build id. Each target is at least 44 × 44 px. | Playwright `site header keeps Demo, Privacy, and Terms links on every application route`; live mobile route check recorded zero overflow and 44/54/44 px targets; screenshot `.factory/evidence/polish-2/live-root/screenshot-mobile.png`; <https://chore-rulebook.sociobot.in/demo>. |
| F-2-2 — stale in-app title | Added view-aware document titles and canonical URLs for deep-linkable views, including History navigation and Back/Forward rendering. | Playwright `every deep-linkable app view sets a matching document title` and `Back restores the view named by the URL`; live `/demo?view=people` had title `People and availability — Chore Rulebook` and matching canonical; screenshot `.factory/evidence/polish-2/live-demo-people-mobile.png`; <https://chore-rulebook.sociobot.in/demo?view=people>. |
| F-2-3 — untested merchant/refund promise | Removed the merchant-of-record and refund-handling promise from README, Data, and Terms. Replaced it with the already-proven Dodo checkout fact and the tested revocation behavior. Updated the registered Plus claim wording. | `@claim:plus-purchase` follows the live Dodo redirect; `@claim:license-revocation` removes Plus access and blocks the seventh chore; `.factory/copy-audit.md`; live Terms check confirmed no merchant/refund text and does show “Checkout opens through Dodo.” at <https://chore-rulebook.sociobot.in/terms>. |

## Final verification

Final clean clone: `/tmp/chore-rulebook-polish-2-final.6BxOVO` at repair
commit `a6d0d74`.

- `npm ci` passed with 90 packages and no vulnerabilities.
- Every one of the 16 exact commands in `.factory/claims.json` passed
  independently: offline reload, device-local requests, JSON/CSV export,
  restore, assignment explanation, free/Plus limits, QR pairing, demo
  isolation, missed-turn handling, checkout, and revocation.
- `npm run check` passed: 15 Vitest tests, TypeScript, production build, and
  68 Playwright desktop/mobile tests.
- Live `verify-url.sh` passed `/`, `/demo`, `/privacy`, and `/terms` with no
  console errors, one h1, `lang=en`, main landmark, and image alt coverage.
  Its screenshots and JSON are in `.factory/evidence/polish-2/live-*`.
- Live Playwright axe scans found zero serious or critical WCAG 2 A/AA findings
  on landing, demo, every populated app view, legal pages, and 404. The local
  axe CLI could not launch its bundled ChromeDriver against the supplied
  Playwright Chromium, so the equivalent shipped Playwright axe integration
  was used for the authoritative scan.
- Live PWA check: after worker control and HTTP-cache clearing, offline `/demo`
  reload still showed the demo banner and Today heading without console errors.
- Live Lighthouse (mobile): performance 99, accessibility 100, LCP 1.1 s,
  CLS 0. The initial app JavaScript is 43.97 kB raw / 15.40 kB gzip; CSS is
  21.60 kB raw / 5.57 kB gzip.
