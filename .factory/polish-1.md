# Polish 1 finding closure — Chore Rulebook

- Review: `.factory/review-1.md`
- Product repair commits: `c7a2e63`, `6112801`
- Live URL checked cold after deployment: <https://chore-rulebook.sociobot.in>
- Consolidated live evidence: `.factory/evidence/polish-1/live-audit.json`

| Finding | Change made | Evidence |
| --- | --- | --- |
| **F-1-1 — manifest MIME** | Added `mimeTypes[".webmanifest"] = "application/manifest+json"` to the deployed Static Web Apps config. | Vitest `serves the install manifest with a web manifest content type`; live `HEAD /manifest.webmanifest` is 200 with `content-type: application/manifest+json` in `.factory/evidence/polish-1/manifest-headers.txt`; live URL: <https://chore-rulebook.sociobot.in/manifest.webmanifest>. |
| **F-1-2 — incomplete 404** | Rebuilt `public/404.html` with h1 **Page not found**, product header, Demo/Privacy/Terms links, standard footer, description, canonical, favicon, Apple icon, OG/Twitter metadata, focus style, reduced-motion handling, and mobile layout. The deployment still returns a real HTTP 404. | Vitest `ships the 404 with the site skeleton, route metadata, and plain heading`; Playwright `designed 404 has metadata, legal links, mobile fit, and no serious accessibility violations`; live response and axe check in `live-audit.json`; `.factory/evidence/polish-1/404-headers.txt`; screenshots `.factory/evidence/polish-1/404-mobile.png` and `404-desktop.png`; live URL: <https://chore-rulebook.sociobot.in/not-a-real-route>. |
| **F-1-3 — slogan caption** | Replaced “One home. Visible rules. Shared understanding.” with “The sample shows chores, assignments, and household rules on one shared device.” | Playwright `first screen has one job heading, both first actions, and three visible facts`; Vitest `keeps reviewed copy plain and ships a verb-first catalog sentence`; `.factory/copy-audit.md`; mobile screenshot `.factory/evidence/polish-1/root/screenshot-mobile.png`; live URL: <https://chore-rulebook.sociobot.in/>. |
| **F-1-4 — generic footer slogan** | Deleted “Private by default.” and retained the tested fact “Your household data stays on this device.” | The same first-screen Playwright test asserts the retained sentence and rejects the slogan; Vitest reviewed-copy regression; root desktop/mobile screenshots; live URL: <https://chore-rulebook.sociobot.in/>. |
| **F-1-5 — README offline jargon** | Rewrote “The versioned app shell…” as “The app works offline after the first visit.” | Vitest reviewed-copy regression; exact claim command `npm run test:claims -- --grep @claim:offline-reload`; live cold offline reload in `live-audit.json`; live URL: <https://chore-rulebook.sociobot.in/demo>. |
| **F-1-6 — unlisted setup claim** | Removed the unsupported “No environment variables…” sentence and the unclear “free/local workflow” term instead of adding an unnecessary product claim. | Vitest reviewed-copy regression asserts both old phrases are absent; `.factory/copy-audit.md`; final claim-manifest cross-check test `keeps every registered claim in one exact browser regression`. |

## Cumulative acceptance evidence

- One-click demo: the first screen links directly to `/demo`; Cedar House is
  already populated. The persistent banner exposes **Reset demo** and **Start
  for real**.
- Isolation: exact `@claim:demo-isolation` test plus the live cold flow prove
  separate `chore-rulebook` and `demo:chore-rulebook` databases. Exit deletes
  only the demo database.
- Claims: all 16 exact commands in `.factory/claims.json` passed independently
  from final clean clone `/tmp/chore-rulebook-final.zQeBzq`.
- Routing and focus: Playwright `demo has route-specific metadata and navigation
  moves focus`, `Back restores the view named by the URL`, and the live routing
  record in `live-audit.json`.
- Legal routes: Playwright `legal pages render directly with one main heading`;
  factory verifier reports under `privacy/` and `terms/`.
- Mobile: Playwright first-screen and populated-view overflow assertions pass at
  390px. The post-deploy cold audit reports width 390/390 on every route.
- Accessibility/privacy/offline: axe has zero serious/critical findings; live
  demo requests are same-origin; offline reload works after the HTTP cache is
  cleared.
- Performance: mobile Lighthouse is 100/100/100/100 with 1.1s LCP and 0 CLS.

No finding from review 1, its cited handoff history, or the final cold-live
audit remains open.
